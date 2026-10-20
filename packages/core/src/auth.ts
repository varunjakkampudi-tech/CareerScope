import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { z } from 'zod';
import type { Database } from './database.js';
import { testUsers } from './test-users.js';

export const sessionCookie = 'careerscope_v2_session';
export const refreshCookie = 'careerscope_v2_refresh';
export const accessSessionLifetimeSeconds = 15 * 60;
export const refreshSessionLifetimeSeconds = 30 * 24 * 60 * 60;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const passwordHash = (password: string) =>
  hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });

export type SessionCredentials = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

export type PreviousSession = { accessToken?: string; refreshToken?: string };

export class Auth {
  private readonly dummyHash = passwordHash(randomBytes(32).toString('hex'));

  constructor(private readonly database: Database) {}

  private async createSession(
    client: import('pg').PoolClient,
    ownerId: string,
    previous?: PreviousSession,
    deviceLabel?: string,
  ): Promise<SessionCredentials> {
    // Expired session families and their retained replay-detection digests are
    // no longer usable; delete them transactionally to bound retained auth data.
    await client.query('DELETE FROM sessions WHERE expires_at <= now()');
    const sessionId = randomUUID();
    const accessToken = randomBytes(32).toString('hex');
    const refreshToken = randomBytes(32).toString('hex');
    const previousAccess = previous?.accessToken ? digest(previous.accessToken) : null;
    const previousRefresh = previous?.refreshToken ? digest(previous.refreshToken) : null;
    await client.query(
      `UPDATE sessions SET revoked_at = COALESCE(revoked_at, now())
       WHERE ($1::text IS NOT NULL AND token_hash = $1)
          OR ($2::text IS NOT NULL AND id IN (
            SELECT session_id FROM session_refresh_tokens WHERE token_hash = $2
          ))`,
      [previousAccess, previousRefresh],
    );
    await client.query(
      `INSERT INTO sessions
         (id, token_hash, owner_id, expires_at, access_expires_at, created_at, last_used_at, device_label)
       VALUES ($1, $2, $3, now() + interval '30 days', now() + interval '15 minutes', now(), now(), $4)`,
      [sessionId, digest(accessToken), ownerId, deviceLabel ?? null],
    );
    await client.query(
      `INSERT INTO session_refresh_tokens (token_hash, session_id, expires_at)
       SELECT $1, id, expires_at FROM sessions WHERE id = $2`,
      [digest(refreshToken), sessionId],
    );
    return { accessToken, refreshToken, sessionId };
  }

  async register(email: string, password: string): Promise<void> {
    const normalized = z.string().email().max(254).parse(email.trim().toLowerCase());
    z.string().min(12).max(256).parse(password);
    const hashed = await passwordHash(password);
    await this.database.pool.query(
      `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [randomUUID(), normalized, hashed],
    );
  }

  async createOwner(email: string, password: string) {
    const normalized = z.string().email().max(254).parse(email.trim().toLowerCase());
    z.string().min(12).max(256).parse(password);
    const hashed = await passwordHash(password);
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('LOCK TABLE users IN EXCLUSIVE MODE');
      const existing = await client.query('SELECT id FROM users LIMIT 1');
      if (existing.rowCount) throw new Error('Owner already configured');
      await client.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
        randomUUID(),
        normalized,
        hashed,
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async loginSession(
    email: string,
    password: string,
    previous?: PreviousSession,
    deviceLabel?: string,
  ): Promise<SessionCredentials | null> {
    const result = await this.database.pool.query<{ id: string; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );
    const user = result.rows[0];
    const valid = await verify(user?.password_hash ?? (await this.dummyHash), password);
    if (!user || !valid) return null;
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const current = await client.query<{ password_hash: string }>(
        'SELECT password_hash FROM users WHERE id = $1 FOR UPDATE',
        [user.id],
      );
      if (current.rows[0]?.password_hash !== user.password_hash) {
        await client.query('ROLLBACK');
        return null;
      }
      const credentials = await this.createSession(client, user.id, previous, deviceLabel);
      await client.query('COMMIT');
      return credentials;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /** Compatibility helper for domain tests; HTTP authentication uses both tokens. */
  async login(email: string, password: string, previous?: string) {
    const credentials = await this.loginSession(
      email,
      password,
      previous ? { accessToken: previous } : undefined,
    );
    return credentials?.accessToken ?? null;
  }

  /** Establishes the existing opaque session only for an existing email identity. */
  async loginWithVerifiedEmail(
    email: string,
    previous?: PreviousSession,
    deviceLabel?: string,
  ): Promise<SessionCredentials | null> {
    const normalized = z.string().email().max(254).parse(email.trim().toLowerCase());
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const credentials = await this.loginWithVerifiedEmailInTransaction(
        client,
        normalized,
        previous,
        deviceLabel,
      );
      if (!credentials) {
        await client.query('ROLLBACK');
        return null;
      }
      await client.query('COMMIT');
      return credentials;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async loginWithVerifiedEmailInTransaction(
    client: import('pg').PoolClient,
    email: string,
    previous?: PreviousSession,
    deviceLabel?: string,
  ): Promise<SessionCredentials | null> {
    const normalized = z.string().email().max(254).parse(email.trim().toLowerCase());
    const user = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 FOR UPDATE',
      [normalized],
    );
    if (!user.rows[0]) return null;
    await client.query(
      'UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1',
      [user.rows[0].id],
    );
    return this.createSession(client, user.rows[0].id, previous, deviceLabel);
  }

  async createOtpAccountInTransaction(
    client: import('pg').PoolClient,
    email: string,
    acceptance: {
      termsVersion: string;
      privacyVersion: string;
      marketingOptIn: boolean;
      marketingVersion?: string;
    },
    previous?: PreviousSession,
    deviceLabel?: string,
  ): Promise<SessionCredentials> {
    const normalized = z.string().email().max(254).parse(email.trim().toLowerCase());
    const existing = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 FOR UPDATE',
      [normalized],
    );
    if (existing.rows[0]) {
      const credentials = await this.loginWithVerifiedEmailInTransaction(
        client,
        normalized,
        previous,
        deviceLabel,
      );
      if (!credentials) throw new Error('Verified account could not establish a session');
      return credentials;
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO users (id, email, email_verified_at, password_hash)
       VALUES ($1, $2, now(), NULL)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [randomUUID(), normalized],
    );
    if (!inserted.rows[0]) {
      // A concurrent account creator won the unique-email race. Treat it as an
      // existing identity: do not rewrite or append consent based on the losing
      // request's signup payload.
      const credentials = await this.loginWithVerifiedEmailInTransaction(
        client,
        normalized,
        previous,
        deviceLabel,
      );
      if (!credentials) throw new Error('Concurrent OTP account could not establish a session');
      return credentials;
    }
    const ownerId = inserted.rows[0].id;
    if (!ownerId) throw new Error('OTP account finalization did not persist an owner');

    const records = [
      { document: 'terms', version: acceptance.termsVersion, accepted: true },
      { document: 'privacy_notice', version: acceptance.privacyVersion, accepted: true },
      ...(acceptance.marketingOptIn && acceptance.marketingVersion
        ? [{ document: 'marketing', version: acceptance.marketingVersion, accepted: true }]
        : []),
    ];
    for (const record of records) {
      await client.query(
        `INSERT INTO account_acceptances (id, owner_id, document, version, accepted)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), ownerId, record.document, record.version, record.accepted],
      );
    }
    return this.createSession(client, ownerId, previous, deviceLabel);
  }

  async testLoginSession(
    email: string,
    previous?: PreviousSession,
    deviceLabel?: string,
  ): Promise<SessionCredentials | null> {
    const normalized = email.toLowerCase().trim();
    const account = testUsers.find((user) => user.email === normalized);
    if (!account) return null;
    // Auto-create user if they don't exist (no password required for test mode)
    const existing = await this.database.pool.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [normalized],
    );
    let userId: string;
    if (existing.rows[0]) {
      if (existing.rows[0].id !== account.id)
        throw new Error('Test identity conflicts with an existing account');
      userId = account.id;
    } else {
      userId = account.id;
      const dummyHash = await passwordHash(randomBytes(32).toString('hex'));
      await this.database.pool.query(
        `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING`,
        [userId, normalized, dummyHash],
      );
      // Re-fetch in case of race condition
      const refetch = await this.database.pool.query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [normalized],
      );
      if (!refetch.rows[0] || refetch.rows[0].id !== account.id) return null;
      userId = refetch.rows[0].id;
    }
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const credentials = await this.createSession(client, userId, previous, deviceLabel);
      await client.query('COMMIT');
      return credentials;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /** Compatibility helper for tests that exercise domain ownership directly. */
  async testLogin(email: string, previous?: string) {
    const credentials = await this.testLoginSession(
      email,
      previous ? { accessToken: previous } : undefined,
    );
    return credentials?.accessToken ?? null;
  }

  csrfForAccessToken(token: string) {
    return digest(`csrf:${token}`);
  }

  async session(token?: string) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const result = await this.database.pool.query<{ id: string; owner_id: string }>(
      `SELECT id, owner_id FROM sessions
       WHERE token_hash = $1 AND access_expires_at > now() AND expires_at > now()
         AND revoked_at IS NULL`,
      [digest(token)],
    );
    const session = result.rows[0];
    return session
      ? { sessionId: session.id, ownerId: session.owner_id, csrf: this.csrfForAccessToken(token) }
      : null;
  }

  async refresh(
    token?: string,
  ): Promise<
    | { status: 'rotated'; ownerId: string; credentials: SessionCredentials }
    | { status: 'reused'; sessionId: string }
    | { status: 'invalid' }
  > {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return { status: 'invalid' };
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query<{
        session_id: string;
        owner_id: string;
        consumed_at: Date | null;
        session_expires_at: Date;
        revoked_at: Date | null;
        unexpired: boolean;
      }>(
        `SELECT rt.session_id, s.owner_id, rt.consumed_at,
                s.expires_at AS session_expires_at, s.revoked_at,
                (rt.expires_at > now() AND s.expires_at > now()) AS unexpired
         FROM session_refresh_tokens rt
         JOIN sessions s ON s.id = rt.session_id
         WHERE rt.token_hash = $1
         FOR UPDATE OF rt, s`,
        [digest(token)],
      );
      const current = found.rows[0];
      if (!current) {
        await client.query('ROLLBACK');
        return { status: 'invalid' };
      }
      if (current.consumed_at) {
        await client.query(
          'UPDATE sessions SET revoked_at = COALESCE(revoked_at, now()) WHERE id = $1',
          [current.session_id],
        );
        await client.query('COMMIT');
        return { status: 'reused', sessionId: current.session_id };
      }
      if (current.revoked_at || !current.unexpired) {
        await client.query('ROLLBACK');
        return { status: 'invalid' };
      }
      const accessToken = randomBytes(32).toString('hex');
      const refreshToken = randomBytes(32).toString('hex');
      await client.query(
        'UPDATE session_refresh_tokens SET consumed_at = now() WHERE token_hash = $1',
        [digest(token)],
      );
      await client.query(
        `UPDATE sessions SET token_hash = $1,
            access_expires_at = now() + interval '15 minutes', last_used_at = now()
         WHERE id = $2`,
        [digest(accessToken), current.session_id],
      );
      await client.query(
        `INSERT INTO session_refresh_tokens (token_hash, session_id, expires_at)
         VALUES ($1, $2, $3)`,
        [digest(refreshToken), current.session_id, current.session_expires_at],
      );
      await client.query('COMMIT');
      return {
        status: 'rotated',
        ownerId: current.owner_id,
        credentials: { accessToken, refreshToken, sessionId: current.session_id },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  validCsrf(expected: string, provided: unknown) {
    return (
      typeof provided === 'string' &&
      /^[a-f0-9]{64}$/.test(provided) &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
    );
  }

  async logout(accessToken?: string, refreshToken?: string) {
    if (!accessToken && !refreshToken) return;
    await this.database.pool.query(
      `UPDATE sessions SET revoked_at = COALESCE(revoked_at, now())
       WHERE ($1::text IS NOT NULL AND token_hash = $1)
          OR ($2::text IS NOT NULL AND id IN (
            SELECT session_id FROM session_refresh_tokens WHERE token_hash = $2
          ))`,
      [accessToken ? digest(accessToken) : null, refreshToken ? digest(refreshToken) : null],
    );
  }

  async listSessions(ownerId: string, currentSessionId: string) {
    z.string().uuid().parse(ownerId);
    z.string().uuid().parse(currentSessionId);
    const result = await this.database.pool.query<{
      id: string;
      created_at: Date | null;
      last_used_at: Date | null;
      device_label: string | null;
    }>(
      `SELECT id, created_at, last_used_at, device_label FROM sessions
       WHERE owner_id = $1 AND revoked_at IS NULL AND expires_at > now()
       ORDER BY last_used_at DESC NULLS LAST, created_at DESC NULLS LAST, id`,
      [ownerId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at?.toISOString() ?? null,
      lastUsedAt: row.last_used_at?.toISOString() ?? null,
      deviceLabel: row.device_label ?? 'Unknown device',
      current: row.id === currentSessionId,
    }));
  }

  async revokeSession(ownerId: string, sessionId: string) {
    z.string().uuid().parse(ownerId);
    z.string().uuid().parse(sessionId);
    const result = await this.database.pool.query(
      `UPDATE sessions SET revoked_at = COALESCE(revoked_at, now())
       WHERE owner_id = $1 AND id = $2`,
      [ownerId, sessionId],
    );
    return result.rowCount === 1;
  }

  async revokeOtherSessions(ownerId: string, token: string) {
    z.string().uuid().parse(ownerId);
    if (!/^[a-f0-9]{64}$/.test(token)) return false;
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [ownerId]);
      const current = await client.query<{ id: string }>(
        `SELECT id FROM sessions WHERE owner_id = $1 AND token_hash = $2
         AND access_expires_at > now() AND expires_at > now() AND revoked_at IS NULL FOR UPDATE`,
        [ownerId, digest(token)],
      );
      if (!current.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        `UPDATE sessions SET revoked_at = COALESCE(revoked_at, now())
         WHERE owner_id = $1 AND id <> $2`,
        [ownerId, current.rows[0]!.id],
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async changePassword(ownerId: string, currentPassword: string, newPassword: string) {
    z.string().uuid().parse(ownerId);
    z.string().min(12).max(256).parse(currentPassword);
    z.string().min(12).max(256).parse(newPassword);
    if (currentPassword === newPassword) return false;
    const result = await this.database.pool.query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [ownerId],
    );
    const user = result.rows[0];
    const valid = await verify(user?.password_hash ?? (await this.dummyHash), currentPassword);
    if (!user || !valid) return false;
    const replacement = await passwordHash(newPassword);
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 AND password_hash = $3 RETURNING id',
        [replacement, ownerId, user.password_hash],
      );
      if (!updated.rowCount) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        'UPDATE sessions SET revoked_at = COALESCE(revoked_at, now()) WHERE owner_id = $1',
        [ownerId],
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
