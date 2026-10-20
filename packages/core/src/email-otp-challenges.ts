import { createHmac } from 'node:crypto';
import { z } from 'zod';
import type { Pool } from 'pg';
import { verifyEmailOtp, type EmailOtpVerification } from './email-otp.js';

const emailSchema = z.string().trim().email().max(254);
const uuidSchema = z.string().uuid();
const digestSchema = z.string().regex(/^[a-f0-9]{64}$/);

export type NewEmailOtpChallenge = {
  id: string;
  email: string;
  digest: string;
  expiresAt: number;
};

/**
 * PostgreSQL-backed one-time challenge state. The code itself is never stored.
 * The caller owns delivery and must not log the returned code or raw payload.
 */
export class EmailOtpChallenges {
  constructor(private readonly pool: Pool) {}

  async replaceActive(input: NewEmailOtpChallenge, secret: Uint8Array): Promise<void> {
    const id = uuidSchema.parse(input.id);
    const email = emailSchema.parse(input.email).toLowerCase();
    const digest = digestSchema.parse(input.digest);
    if (!(secret instanceof Uint8Array) || secret.byteLength < 32)
      throw new Error('OTP digest key must be at least 32 bytes');
    if (!Number.isSafeInteger(input.expiresAt) || input.expiresAt <= Date.now())
      throw new Error('Invalid OTP expiration time');
    const emailHash = createHmac('sha256', secret)
      .update('careerscope-email-otp-address\0', 'utf8')
      .update(email, 'utf8')
      .digest('hex');

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
        `INSERT INTO email_otp_challenges (id, email_hash, digest, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [id, emailHash, digest, new Date(input.expiresAt)],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async consume(input: {
    id: string;
    email: string;
    code: unknown;
    secret: Uint8Array;
    now?: number;
  }): Promise<EmailOtpVerification> {
    const id = uuidSchema.safeParse(input.id);
    if (!id.success) return 'invalid';
    const email = emailSchema.safeParse(input.email);
    const now = input.now ?? Date.now();
    if (
      !email.success ||
      !(input.secret instanceof Uint8Array) ||
      input.secret.byteLength < 32 ||
      !Number.isSafeInteger(now) ||
      now < 0
    )
      return 'invalid';
    const emailHash = createHmac('sha256', input.secret)
      .update('careerscope-email-otp-address\0', 'utf8')
      .update(email.data.toLowerCase(), 'utf8')
      .digest('hex');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const selected = await client.query<{
        digest: string;
        attempts: number;
        expires_at: Date;
      }>(
        `SELECT digest, attempts, expires_at
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
