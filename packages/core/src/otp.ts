import {
  createHash,
  createHmac,
  randomInt,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { z } from 'zod';
import type { Database } from './database.js';

export type OtpEmailSender = (message: {
  to: string;
  code: string;
  idempotencyKey: string;
}) => Promise<void>;

export const OTP_LIFETIME_SECONDS = 5 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

const emailSchema = z.string().trim().email().max(254);

export function otpSecretFromHex(value: string): Buffer {
  if (!/^[a-f0-9]{64}$/i.test(value))
    throw new TypeError('OTP_HMAC_SECRET must be a dedicated 32-byte hexadecimal value');
  return Buffer.from(value, 'hex');
}

export function normalizeAuthEmail(value: string) {
  return emailSchema.parse(value).toLowerCase();
}

function hmac(secret: Buffer, value: string) {
  return createHmac('sha256', secret).update(value).digest();
}

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/.test(left) || !/^[a-f0-9]{64}$/.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

export type OtpVerificationInput = {
  email: string;
  code: string;
  termsAccepted?: boolean;
  privacyAcknowledged?: boolean;
  marketingOptIn?: boolean;
};

export type OtpVerificationResult =
  | { kind: 'authenticated'; token: string; createdAccount: boolean }
  | { kind: 'acceptance_required' }
  | { kind: 'invalid' };

export type OtpAuthOptions = {
  secret: Buffer;
  sender: OtpEmailSender;
  registrationEnabled: boolean;
  termsVersion?: string;
  privacyVersion?: string;
  now?: () => Date;
  createCode?: () => string;
};

export class OtpAuth {
  private readonly now: () => Date;
  private readonly createCode: () => string;

  constructor(
    private readonly database: Database,
    private readonly options: OtpAuthOptions,
  ) {
    if (options.secret.byteLength !== 32) throw new TypeError('OTP secret must contain 32 bytes');
    if (
      options.registrationEnabled &&
      (!options.termsVersion?.trim() || !options.privacyVersion?.trim())
    )
      throw new TypeError('Registration requires approved Terms and Privacy versions');
    this.now = options.now ?? (() => new Date());
    this.createCode =
      options.createCode ?? (() => randomInt(0, 1_000_000).toString().padStart(6, '0'));
  }

  private emailHash(email: string) {
    return hmac(this.options.secret, `email:v1:${email}`).toString('hex');
  }

  rateLimitIdentity(emailInput: string) {
    return this.emailHash(normalizeAuthEmail(emailInput));
  }

  private codeDigest(challengeId: string, code: string) {
    return hmac(this.options.secret, `otp:v1:${challengeId}:${code}`).toString('hex');
  }

  async request(emailInput: string): Promise<'sent' | 'cooldown'> {
    const email = normalizeAuthEmail(emailInput);
    const emailHash = this.emailHash(email);
    const id = randomUUID();
    const code = this.createCode();
    if (!/^\d{6}$/.test(code)) throw new Error('OTP generator returned an invalid code');
    const createdAt = this.now();
    const client = await this.database.pool.connect();
    let cooldown = false;
    try {
      await client.query('BEGIN');
      // A per-email transaction lock serializes replacement across API
      // instances even when the challenge row does not exist yet.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [emailHash]);
      const current = await client.query<{ created_at: Date }>(
        'SELECT created_at FROM email_otp_challenges WHERE email_hash = $1 FOR UPDATE',
        [emailHash],
      );
      if (
        current.rows[0] &&
        createdAt.getTime() - new Date(current.rows[0].created_at).getTime() <
          OTP_RESEND_COOLDOWN_SECONDS * 1000
      ) {
        cooldown = true;
      } else {
        await client.query(
          `INSERT INTO email_otp_challenges
             (id, email_hash, code_digest, created_at, expires_at, attempts, consumed_at)
           VALUES ($1, $2, $3, $4::timestamptz, $4::timestamptz + interval '5 minutes', 0, NULL)
           ON CONFLICT (email_hash) DO UPDATE SET
             id = EXCLUDED.id,
             code_digest = EXCLUDED.code_digest,
             created_at = EXCLUDED.created_at,
             expires_at = EXCLUDED.expires_at,
             attempts = 0,
             consumed_at = NULL`,
          [id, emailHash, this.codeDigest(id, code), createdAt],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    if (cooldown) return 'cooldown';
    try {
      await this.options.sender({ to: email, code, idempotencyKey: id });
      return 'sent';
    } catch {
      // A provider timeout may have occurred after acceptance. Invalidate the
      // code conservatively; a later request creates a fresh idempotent send.
      await this.database.pool.query(
        'UPDATE email_otp_challenges SET consumed_at = $2 WHERE id = $1 AND consumed_at IS NULL',
        [id, this.now()],
      );
      throw new Error('Email delivery unavailable');
    }
  }

  async verify(
    input: OtpVerificationInput,
    previousToken?: string,
  ): Promise<OtpVerificationResult> {
    const email = normalizeAuthEmail(input.email);
    if (!/^\d{6}$/.test(input.code)) return { kind: 'invalid' };
    const emailHash = this.emailHash(email);
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const challengeResult = await client.query<{
        id: string;
        code_digest: string;
        expires_at: Date;
        attempts: number;
        consumed_at: Date | null;
      }>(
        `SELECT id, code_digest, expires_at, attempts, consumed_at
         FROM email_otp_challenges WHERE email_hash = $1 FOR UPDATE`,
        [emailHash],
      );
      const challenge = challengeResult.rows[0];
      if (
        !challenge ||
        challenge.consumed_at ||
        new Date(challenge.expires_at).getTime() <= this.now().getTime() ||
        challenge.attempts >= OTP_MAX_ATTEMPTS
      ) {
        await client.query('ROLLBACK');
        return { kind: 'invalid' };
      }

      const submittedDigest = this.codeDigest(challenge.id, input.code);
      if (!safeEqualHex(challenge.code_digest, submittedDigest)) {
        await client.query(
          'UPDATE email_otp_challenges SET attempts = attempts + 1 WHERE id = $1',
          [challenge.id],
        );
        await client.query('COMMIT');
        return { kind: 'invalid' };
      }

      const existing = await client.query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1 FOR UPDATE',
        [email],
      );
      let userId = existing.rows[0]?.id;
      let createdAccount = false;
      if (!userId) {
        if (!this.options.registrationEnabled) {
          await client.query('UPDATE email_otp_challenges SET consumed_at = $2 WHERE id = $1', [
            challenge.id,
            this.now(),
          ]);
          await client.query('COMMIT');
          return { kind: 'invalid' };
        }
        if (input.termsAccepted !== true || input.privacyAcknowledged !== true) {
          await client.query('ROLLBACK');
          return { kind: 'acceptance_required' };
        }
        userId = randomUUID();
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, NULL)
           ON CONFLICT (email) DO NOTHING RETURNING id`,
          [userId, email],
        );
        if (!inserted.rowCount) {
          const raced = await client.query<{ id: string }>(
            'SELECT id FROM users WHERE email = $1 FOR UPDATE',
            [email],
          );
          userId = raced.rows[0]?.id;
          if (!userId) throw new Error('Account finalization conflict');
        } else {
          createdAccount = true;
          const acceptedAt = this.now();
          await client.query(
            `INSERT INTO legal_acceptances
               (id, user_id, terms_version, privacy_version, accepted_at,
                privacy_acknowledged_at, marketing_opt_in, marketing_recorded_at)
             VALUES ($1, $2, $3, $4, $5::timestamptz, $5::timestamptz, $6, CASE WHEN $6 THEN $5::timestamptz ELSE NULL END)`,
            [
              randomUUID(),
              userId,
              this.options.termsVersion,
              this.options.privacyVersion,
              acceptedAt,
              input.marketingOptIn === true,
            ],
          );
          if (input.marketingOptIn === true) {
            await client.query(
              `INSERT INTO marketing_consent_events (id, user_id, opted_in, recorded_at)
               VALUES ($1, $2, true, $3)`,
              [randomUUID(), userId, acceptedAt],
            );
          }
        }
      }

      if (!userId) throw new Error('Account finalization conflict');
      // A successful, single-use OTP is the launch-defined email verification
      // event. Preserve the first verification timestamp for this unchanged
      // account address; password/test authentication never reaches this path.
      await client.query(
        'UPDATE users SET email_verified_at = COALESCE(email_verified_at, $2) WHERE id = $1',
        [userId, this.now()],
      );
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      if (previousToken && /^[a-f0-9]{64}$/.test(previousToken)) {
        await client.query('DELETE FROM sessions WHERE token_hash = $1', [
          createHash('sha256').update(previousToken).digest('hex'),
        ]);
      }
      // Keep the existing opaque server-side session contract and expiry.
      await client.query(
        `INSERT INTO sessions (token_hash, owner_id, expires_at)
         VALUES ($1, $2, $3::timestamptz + interval '8 hours')`,
        [tokenHash, userId, this.now()],
      );
      await client.query('UPDATE email_otp_challenges SET consumed_at = $2 WHERE id = $1', [
        challenge.id,
        this.now(),
      ]);
      await client.query('COMMIT');
      return { kind: 'authenticated', token, createdAccount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async setMarketingPreference(userId: string, optedIn: boolean) {
    if (typeof optedIn !== 'boolean') throw new TypeError('Marketing preference must be boolean');
    await this.database.pool.query(
      `INSERT INTO marketing_consent_events (id, user_id, opted_in, recorded_at)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), userId, optedIn, this.now()],
    );
    return { optedIn };
  }

  async marketingPreference(userId: string): Promise<boolean> {
    const result = await this.database.pool.query<{ opted_in: boolean }>(
      `SELECT opted_in FROM marketing_consent_events
       WHERE user_id = $1 ORDER BY sequence DESC LIMIT 1`,
      [userId],
    );
    return result.rows[0]?.opted_in ?? false;
  }

  async purgeExpired(limit = 500) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 5000)
      throw new RangeError('Invalid OTP cleanup batch size');
    const result = await this.database.pool.query(
      `WITH expired AS (
         SELECT id FROM email_otp_challenges
         WHERE expires_at <= $1 OR consumed_at < $1 - interval '1 hour'
         ORDER BY expires_at LIMIT $2
       )
       DELETE FROM email_otp_challenges challenge USING expired
       WHERE challenge.id = expired.id`,
      [this.now(), limit],
    );
    return result.rowCount ?? 0;
  }
}
