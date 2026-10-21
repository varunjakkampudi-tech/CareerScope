import { createHmac } from 'node:crypto';
import { z } from 'zod';
import type { Pool, PoolClient } from 'pg';
import { verifyEmailOtp, type EmailOtpVerification } from './email-otp.js';

const emailSchema = z.string().trim().email().max(254);
const uuidSchema = z.string().uuid();
const digestSchema = z.string().regex(/^[a-f0-9]{64}$/);

export function hashOtpEmail(emailInput: string, secret: Uint8Array): string {
  const email = emailSchema.parse(emailInput).toLowerCase();
  if (!(secret instanceof Uint8Array) || secret.byteLength < 32)
    throw new Error('OTP digest key must be at least 32 bytes');
  return createHmac('sha256', secret)
    .update('careerscope-email-otp-address\0', 'utf8')
    .update(email, 'utf8')
    .digest('hex');
}

export type NewEmailOtpChallenge = {
  id: string;
  email: string;
  digest: string;
  expiresAt: number;
  intent?: 'sign-in' | 'sign-up';
  termsVersion?: string;
  privacyVersion?: string;
  marketingOptIn?: boolean;
  marketingVersion?: string;
  ageScreenPassed?: boolean;
};

export type EmailOtpChallengeContext = Pick<
  NewEmailOtpChallenge,
  'intent' | 'termsVersion' | 'privacyVersion' | 'marketingOptIn' | 'marketingVersion'
> &
  Pick<NewEmailOtpChallenge, 'ageScreenPassed'>;

/**
 * PostgreSQL-backed one-time challenge state. The code itself is never stored.
 * The caller owns delivery and must not log the returned code or raw payload.
 */
export class EmailOtpChallenges {
  constructor(
    private readonly pool: Pool,
    private readonly clock: () => number = Date.now,
  ) {}

  async replaceActive(input: NewEmailOtpChallenge, secret: Uint8Array): Promise<void> {
    const id = uuidSchema.parse(input.id);
    const digest = digestSchema.parse(input.digest);
    const emailHash = hashOtpEmail(input.email, secret);
    if (!Number.isSafeInteger(input.expiresAt) || input.expiresAt <= Date.now())
      throw new Error('Invalid OTP expiration time');
    if (input.intent === 'sign-up' && input.ageScreenPassed !== true)
      throw new Error('Signup OTP requires a passed age screen');
    if (input.intent !== 'sign-up' && input.ageScreenPassed !== undefined)
      throw new Error('Age-screen result is valid only for signup OTP');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Expired challenges are bounded to a small cleanup batch per issuance;
      // active rows are keyed by a domain-separated HMAC, never raw email.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [emailHash]);
      await client.query(
        `WITH expired AS (
           SELECT id FROM email_otp_challenges
           WHERE expires_at <= now()
           ORDER BY expires_at
           LIMIT 500
           FOR UPDATE SKIP LOCKED
         )
         DELETE FROM email_otp_challenges challenge
         USING expired WHERE challenge.id = expired.id`,
      );
      await client.query('DELETE FROM email_otp_challenges WHERE email_hash = $1', [emailHash]);
      await client.query(
        `INSERT INTO email_otp_challenges
           (id, email_hash, digest, expires_at, intent, terms_version, privacy_version,
            marketing_opt_in, marketing_version, age_screen_passed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          emailHash,
          digest,
          new Date(input.expiresAt),
          input.intent ?? 'sign-in',
          input.termsVersion ?? null,
          input.privacyVersion ?? null,
          input.marketingOptIn ?? false,
          input.marketingVersion ?? null,
          input.ageScreenPassed ?? null,
        ],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async activeId(email: string, secret: Uint8Array): Promise<string | null> {
    const emailHash = hashOtpEmail(email, secret);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [emailHash]);
      const active = await client.query<{ id: string }>(
        `SELECT id FROM email_otp_challenges
         WHERE email_hash = $1 AND expires_at > now()
         LIMIT 1`,
        [emailHash],
      );
      await client.query('COMMIT');
      return active.rows[0]?.id ?? null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async invalidate(id: string, email: string, secret: Uint8Array): Promise<void> {
    const parsedId = uuidSchema.parse(id);
    const emailHash = hashOtpEmail(email, secret);
    await this.pool.query('DELETE FROM email_otp_challenges WHERE id = $1 AND email_hash = $2', [
      parsedId,
      emailHash,
    ]);
  }

  async consume(input: {
    id: string;
    email: string;
    code: unknown;
    secret: Uint8Array;
    now?: number;
    expectedIntent?: 'sign-in' | 'sign-up';
    onAccepted?: (client: PoolClient, challenge: EmailOtpChallengeContext) => Promise<void>;
  }): Promise<EmailOtpVerification> {
    const id = uuidSchema.safeParse(input.id);
    if (!id.success) return 'invalid';
    const email = emailSchema.safeParse(input.email);
    if (
      !email.success ||
      !(input.secret instanceof Uint8Array) ||
      input.secret.byteLength < 32 ||
      (input.now !== undefined && (!Number.isSafeInteger(input.now) || input.now < 0))
    )
      return 'invalid';
    const emailHash = hashOtpEmail(email.data, input.secret);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const selected = await client.query<{
        digest: string;
        attempts: number;
        expires_at: Date;
        intent: 'sign-in' | 'sign-up';
        terms_version: string | null;
        privacy_version: string | null;
        marketing_opt_in: boolean;
        marketing_version: string | null;
        age_screen_passed: boolean | null;
      }>(
        `SELECT digest, attempts, expires_at, intent, terms_version, privacy_version,
                marketing_opt_in, marketing_version, age_screen_passed
         FROM email_otp_challenges
         WHERE id = $1 AND email_hash = $2
         FOR UPDATE`,
        [id.data, emailHash],
      );
      const challenge = selected.rows[0];
      if (!challenge) {
        await client.query('COMMIT');
        return 'invalid';
      }
      if (input.expectedIntent && input.expectedIntent !== challenge.intent) {
        await client.query('COMMIT');
        return 'invalid';
      }
      if (input.expectedIntent === 'sign-up' && challenge.age_screen_passed !== true) {
        // Expire pre-screen signup challenges safely after this contract is
        // deployed; a fresh request must pass the age screen before delivery.
        await client.query('DELETE FROM email_otp_challenges WHERE id = $1', [id.data]);
        await client.query('COMMIT');
        return 'invalid';
      }

      // Evaluate expiry only after the row lock is acquired. A request may wait
      // behind another verifier long enough for the challenge to expire.
      const now = input.now ?? this.clock();
      if (!Number.isSafeInteger(now) || now < 0) {
        await client.query('COMMIT');
        return 'invalid';
      }
      const verification = verifyEmailOtp({
        challengeId: id.data,
        code: input.code,
        digest: challenge.digest,
        secret: input.secret,
        expiresAt: challenge.expires_at.getTime(),
        attempts: challenge.attempts,
        now,
      });

      if (
        verification === 'accepted' ||
        verification === 'expired' ||
        verification === 'exhausted'
      ) {
        if (verification === 'accepted' && input.onAccepted) {
          await input.onAccepted(client, {
            intent: challenge.intent,
            termsVersion: challenge.terms_version ?? undefined,
            privacyVersion: challenge.privacy_version ?? undefined,
            marketingOptIn: challenge.marketing_opt_in,
            marketingVersion: challenge.marketing_version ?? undefined,
            ageScreenPassed: challenge.age_screen_passed ?? undefined,
          });
        }
        await client.query('DELETE FROM email_otp_challenges WHERE id = $1', [id.data]);
      } else if (verification === 'incorrect') {
        const attempts = challenge.attempts + 1;
        if (attempts >= 5)
          await client.query('DELETE FROM email_otp_challenges WHERE id = $1', [id.data]);
        else
          await client.query('UPDATE email_otp_challenges SET attempts = $2 WHERE id = $1', [
            id.data,
            attempts,
          ]);
      }
      await client.query('COMMIT');
      return verification === 'incorrect' && challenge.attempts >= 4 ? 'exhausted' : verification;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
