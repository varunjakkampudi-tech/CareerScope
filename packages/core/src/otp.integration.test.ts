import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createApp } from '../../../apps/api/src/app.js';
import {
  Auth,
  Database,
  OtpAuth,
  OTP_LIFETIME_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
  sessionCookie,
} from './index.js';

test('email OTP is owner-safe, single-use, private at rest, and records explicit legal choices', async (t) => {
  const configured = process.env.DATABASE_URL;
  assert.ok(configured, 'DATABASE_URL must point to a disposable local PostgreSQL instance');
  const adminUrl = new URL(configured);
  assert.ok(['127.0.0.1', 'localhost', '::1'].includes(adminUrl.hostname));
  const admin = new Database(adminUrl.href);
  const databaseName = `otp_test_${randomUUID().replaceAll('-', '')}`;
  await admin.pool.query(`CREATE DATABASE "${databaseName}"`);
  adminUrl.pathname = `/${databaseName}`;
  const database = new Database(adminUrl.href);
  t.after(async () => {
    await database.close();
    await admin.pool.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
    await admin.close();
  });
  await migrate(database.db, {
    migrationsFolder: fileURLToPath(new URL('../../../migrations', import.meta.url)),
  });

  let now = new Date('2026-10-20T12:00:00.000Z');
  const delivered: Array<{ to: string; code: string; idempotencyKey: string }> = [];
  const sender = async (message: (typeof delivered)[number]) => {
    delivered.push(message);
  };
  const otp = new OtpAuth(database, {
    secret: Buffer.alloc(32, 7),
    sender,
    registrationEnabled: true,
    termsVersion: 'terms-v1',
    privacyVersion: 'privacy-v1',
    now: () => new Date(now),
    createCode: () => '123456',
  });
  let verifiedToken: string | undefined;
  let verifiedTimestamp: string | undefined;

  await t.test(
    'persists only digests, enforces cooldown and attempts, and consumes once',
    async () => {
      assert.equal(await otp.request(' Candidate@Example.invalid '), 'sent');
      assert.equal(delivered.length, 1);
      assert.equal(delivered[0]?.to, 'candidate@example.invalid');
      assert.equal(await otp.request('candidate@example.invalid'), 'cooldown');
      assert.equal(delivered.length, 1);

      const stored = await database.pool.query<{
        email_hash: string;
        code_digest: string;
        attempts: number;
      }>('SELECT email_hash, code_digest, attempts FROM email_otp_challenges');
      assert.equal(stored.rowCount, 1);
      assert.notEqual(stored.rows[0]?.email_hash, 'candidate@example.invalid');
      assert.notEqual(stored.rows[0]?.code_digest, '123456');

      const bad = await otp.verify({ email: 'candidate@example.invalid', code: '000000' });
      assert.deepEqual(bad, { kind: 'invalid' });
      assert.equal(
        (await database.pool.query('SELECT attempts FROM email_otp_challenges')).rows[0].attempts,
        1,
      );
      assert.equal(
        (
          await database.pool.query(
            "SELECT email_verified_at FROM users WHERE email = 'candidate@example.invalid'",
          )
        ).rowCount,
        0,
      );

      const created = await otp.verify({
        email: 'candidate@example.invalid',
        code: '123456',
        termsAccepted: true,
        privacyAcknowledged: true,
        marketingOptIn: false,
      });
      assert.equal(created.kind, 'authenticated');
      assert.equal(created.kind === 'authenticated' && created.createdAccount, true);
      if (created.kind === 'authenticated') {
        verifiedToken = created.token;
        verifiedTimestamp = now.toISOString();
      }
      assert.equal(
        created.kind === 'authenticated' &&
          (await new Auth(database).session(created.token)) !== null,
        true,
      );
      assert.deepEqual(await otp.verify({ email: 'candidate@example.invalid', code: '123456' }), {
        kind: 'invalid',
      });
      assert.equal((await database.pool.query('SELECT id FROM users')).rowCount, 1);
      assert.equal((await database.pool.query('SELECT owner_id FROM sessions')).rowCount, 1);
      assert.deepEqual(
        (
          await database.pool.query<{ email_verified_at: Date }>(
            "SELECT email_verified_at FROM users WHERE email = 'candidate@example.invalid'",
          )
        ).rows.map(({ email_verified_at }) => email_verified_at.toISOString()),
        [now.toISOString()],
      );
      assert.deepEqual(
        (
          await database.pool.query(
            'SELECT terms_version, privacy_version, marketing_opt_in FROM legal_acceptances',
          )
        ).rows,
        [{ terms_version: 'terms-v1', privacy_version: 'privacy-v1', marketing_opt_in: false }],
      );
      assert.equal(
        (await database.pool.query('SELECT id FROM marketing_consent_events')).rowCount,
        0,
      );
    },
  );

  await t.test(
    'keeps legal acceptance and marketing consent separate and records revocation',
    async () => {
      now = new Date(now.getTime() + 61_000);
      await otp.request('opt-in@example.invalid');
      assert.deepEqual(await otp.verify({ email: 'opt-in@example.invalid', code: '123456' }), {
        kind: 'acceptance_required',
      });
      const result = await otp.verify({
        email: 'opt-in@example.invalid',
        code: '123456',
        termsAccepted: true,
        privacyAcknowledged: true,
        marketingOptIn: true,
      });
      assert.equal(result.kind, 'authenticated');
      if (result.kind !== 'authenticated') return;
      assert.equal(
        await otp.marketingPreference((await new Auth(database).session(result.token))!.ownerId),
        true,
      );
      await otp.setMarketingPreference(
        (await new Auth(database).session(result.token))!.ownerId,
        false,
      );
      assert.equal(
        await otp.marketingPreference((await new Auth(database).session(result.token))!.ownerId),
        false,
      );
      assert.deepEqual(
        (
          await database.pool.query(
            'SELECT opted_in FROM marketing_consent_events ORDER BY sequence',
          )
        ).rows,
        [{ opted_in: true }, { opted_in: false }],
      );
    },
  );

  await t.test(
    'locks after five failures, expires challenges, and serializes concurrent verification',
    async () => {
      now = new Date(now.getTime() + 61_000);
      await otp.request('locked@example.invalid');
      for (let attempt = 0; attempt < 5; attempt += 1)
        assert.deepEqual(await otp.verify({ email: 'locked@example.invalid', code: '000000' }), {
          kind: 'invalid',
        });
      assert.deepEqual(
        await otp.verify({
          email: 'locked@example.invalid',
          code: '123456',
          termsAccepted: true,
          privacyAcknowledged: true,
        }),
        { kind: 'invalid' },
      );

      now = new Date(now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000 + 1);
      await otp.request('expired@example.invalid');
      now = new Date(now.getTime() + OTP_LIFETIME_SECONDS * 1000 + 1);
      assert.deepEqual(await otp.verify({ email: 'expired@example.invalid', code: '123456' }), {
        kind: 'invalid',
      });
      await otp.purgeExpired();
      assert.equal(
        (
          await database.pool.query('SELECT id FROM email_otp_challenges WHERE expires_at <= $1', [
            now,
          ])
        ).rowCount,
        0,
      );

      now = new Date(now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000 + 1);
      await otp.request('concurrent@example.invalid');
      const attempts = await Promise.all(
        Array.from({ length: 2 }, () =>
          otp.verify({
            email: 'concurrent@example.invalid',
            code: '123456',
            termsAccepted: true,
            privacyAcknowledged: true,
          }),
        ),
      );
      assert.equal(attempts.filter((result) => result.kind === 'authenticated').length, 1);
      assert.equal(attempts.filter((result) => result.kind === 'invalid').length, 1);
      assert.equal(
        (
          await database.pool.query(
            "SELECT id FROM users WHERE email = 'concurrent@example.invalid'",
          )
        ).rowCount,
        1,
      );
    },
  );

  await t.test(
    'rolls back account and OTP consumption when session persistence fails',
    async () => {
      now = new Date(now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000 + 1);
      await otp.request('rollback@example.invalid');
      await database.pool.query(`
      CREATE FUNCTION otp_test_reject_session() RETURNS trigger
      LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic session failure'; END; $$
    `);
      await database.pool.query(`
      CREATE TRIGGER otp_test_reject_session_insert
      BEFORE INSERT ON sessions FOR EACH ROW EXECUTE FUNCTION otp_test_reject_session()
    `);
      try {
        await assert.rejects(
          otp.verify({
            email: 'rollback@example.invalid',
            code: '123456',
            termsAccepted: true,
            privacyAcknowledged: true,
            marketingOptIn: true,
          }),
          /synthetic session failure/,
        );
      } finally {
        await database.pool.query('DROP TRIGGER otp_test_reject_session_insert ON sessions');
        await database.pool.query('DROP FUNCTION otp_test_reject_session()');
      }
      assert.equal(
        (await database.pool.query("SELECT id FROM users WHERE email = 'rollback@example.invalid'"))
          .rowCount,
        0,
      );
      assert.equal(
        (await database.pool.query('SELECT id FROM email_otp_challenges WHERE consumed_at IS NULL'))
          .rowCount,
        1,
      );
      assert.equal((await database.pool.query('SELECT id FROM legal_acceptances')).rowCount, 3);
      assert.equal((await database.pool.query('SELECT token_hash FROM sessions')).rowCount, 3);
      const recovered = await otp.verify({
        email: 'rollback@example.invalid',
        code: '123456',
        termsAccepted: true,
        privacyAcknowledged: true,
        marketingOptIn: true,
      });
      assert.equal(recovered.kind, 'authenticated');
    },
  );

  await t.test(
    'returns uniform request responses and a safe unavailable response without leaking input',
    async () => {
      const origin = 'http://localhost:5280';
      const initialDeliveredCount = delivered.length;
      let deliveredCount = initialDeliveredCount;
      const app = await createApp(database, origin, async () => true, {
        otp: {
          secret: Buffer.alloc(32, 8),
          sender: async () => {
            deliveredCount += 1;
          },
          registrationEnabled: false,
        },
      });
      try {
        assert.equal((await app.inject('/api/health')).statusCode, 200);
        assert.equal((await app.inject('/api/ready')).statusCode, 200);
        const session = await app.inject({
          url: '/api/session',
          cookies: verifiedToken ? { [sessionCookie]: verifiedToken } : undefined,
        });
        assert.equal(session.statusCode, 200);
        assert.equal(session.json().emailVerifiedAt, verifiedTimestamp);
        for (const email of ['existing@example.invalid', 'unknown@example.invalid']) {
          const response = await app.inject({
            method: 'POST',
            url: '/api/auth/otp/request',
            headers: { origin },
            payload: { email },
          });
          assert.equal(response.statusCode, 202);
          assert.deepEqual(response.json(), {
            message: 'If the address is eligible, a code will be sent.',
          });
        }
        assert.equal(deliveredCount, initialDeliveredCount + 2);

        const notReady = await createApp(database, origin, async () => true, {
          readinessCheck: async () => {
            throw new Error('synthetic Redis outage');
          },
        });
        try {
          assert.equal((await notReady.inject('/api/health')).statusCode, 200);
          const response = await notReady.inject('/api/ready');
          assert.equal(response.statusCode, 503);
          assert.doesNotMatch(response.body, /synthetic Redis outage/);
        } finally {
          await notReady.close();
        }

        const providerUnavailable = await createApp(database, origin, async () => true, {
          otp: {
            secret: Buffer.alloc(32, 11),
            sender: async () => {
              throw new Error('synthetic delivery failure');
            },
            registrationEnabled: false,
          },
        });
        try {
          const response = await providerUnavailable.inject({
            method: 'POST',
            url: '/api/auth/otp/request',
            headers: { origin },
            payload: { email: 'delivery-failure@example.invalid' },
          });
          assert.equal(response.statusCode, 503);
          assert.doesNotMatch(
            response.body,
            /delivery-failure@example\.invalid|synthetic delivery failure/,
          );
        } finally {
          await providerUnavailable.close();
        }

        const unavailable = await createApp(
          database,
          origin,
          async () => {
            throw new Error('synthetic limiter outage');
          },
          {
            otp: {
              secret: Buffer.alloc(32, 9),
              sender: async () => {
                throw new Error('sender must not run when the limiter is unavailable');
              },
              registrationEnabled: false,
            },
          },
        );
        try {
          const response = await unavailable.inject({
            method: 'POST',
            url: '/api/auth/otp/request',
            headers: { origin },
            payload: { email: 'private@example.invalid' },
          });
          assert.equal(response.statusCode, 503);
          assert.doesNotMatch(response.body, /private@example\.invalid|synthetic limiter outage/);
        } finally {
          await unavailable.close();
        }
      } finally {
        await app.close();
      }
    },
  );

  await t.test(
    'sets only the existing HttpOnly opaque session cookie after successful verification',
    async () => {
      const origin = 'http://localhost:5280';
      const deliveredCodes: string[] = [];
      const app = await createApp(database, origin, async () => true, {
        otp: {
          secret: Buffer.alloc(32, 10),
          sender: async ({ code }) => {
            deliveredCodes.push(code);
          },
          registrationEnabled: false,
        },
      });
      try {
        const requested = await app.inject({
          method: 'POST',
          url: '/api/auth/otp/request',
          headers: { origin },
          payload: { email: 'candidate@example.invalid' },
        });
        assert.equal(requested.statusCode, 202);
        const verified = await app.inject({
          method: 'POST',
          url: '/api/auth/otp/verify',
          headers: { origin },
          payload: { email: 'candidate@example.invalid', code: deliveredCodes[0] },
        });
        assert.equal(verified.statusCode, 200);
        assert.equal(verified.json().authenticated, true);
        const cookie = verified.cookies.find((entry) => entry.name === sessionCookie);
        assert.ok(cookie);
        assert.equal(cookie.httpOnly, true);
        assert.equal(cookie.value.length, 64);
        assert.equal(deliveredCodes.length, 1);
      } finally {
        await app.close();
      }
    },
  );
});
