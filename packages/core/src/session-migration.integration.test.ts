import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Auth } from './auth.js';
import { Database } from './database.js';

test(
  'session migration preserves existing sessions only to their original expiry without inventing refresh credentials',
  { timeout: 30_000 },
  async () => {
    const configured = process.env.DATABASE_URL;
    assert.ok(configured, 'integration test requires an isolated DATABASE_URL');
    const base = new URL(configured);
    assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname));
    const admin = new Database(base.href);
    const databaseName = `test_${randomUUID().replaceAll('-', '')}`;
    await admin.pool.query(`CREATE DATABASE "${databaseName}"`);
    base.pathname = `/${databaseName}`;
    const database = new Database(base.href);
    const ownerId = randomUUID();
    const accessToken = 'a'.repeat(64);

    try {
      await database.pool.query(`
        CREATE TABLE users (
          id uuid PRIMARY KEY,
          email text,
          password_hash text NOT NULL
        );
        CREATE TABLE sessions (
          token_hash text PRIMARY KEY,
          owner_id uuid NOT NULL REFERENCES users(id),
          expires_at timestamptz NOT NULL
        );
      `);
      await database.pool.query(
        'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
        [ownerId, 'legacy@example.test', 'synthetic hash'],
      );
      await database.pool.query(
        `INSERT INTO sessions (token_hash, owner_id, expires_at)
         VALUES ($1, $2, now() + interval '2 hours')`,
        [createHash('sha256').update(accessToken).digest('hex'), ownerId],
      );

      const migrationPath = fileURLToPath(
        new URL('../../../migrations/0022_cultured_surge.sql', import.meta.url),
      );
      const migration = readFileSync(migrationPath, 'utf8');
      for (const statement of migration.split('--> statement-breakpoint')) {
        if (statement.trim()) await database.pool.query(statement);
      }

      const preserved = await database.pool.query<{
        id: string;
        expires_at: Date;
        access_expires_at: Date;
        created_at: Date | null;
        last_used_at: Date | null;
        device_label: string | null;
      }>(
        `SELECT id, expires_at, access_expires_at, created_at, last_used_at, device_label
         FROM sessions WHERE owner_id = $1`,
        [ownerId],
      );
      assert.equal(preserved.rowCount, 1);
      assert.match(preserved.rows[0]!.id, /^[0-9a-f-]{36}$/i);
      assert.equal(
        preserved.rows[0]!.access_expires_at.getTime(),
        preserved.rows[0]!.expires_at.getTime(),
        'legacy access expiry must not exceed the original absolute expiry',
      );
      assert.equal(preserved.rows[0]!.created_at, null);
      assert.equal(preserved.rows[0]!.last_used_at, null);
      assert.equal(preserved.rows[0]!.device_label, null);
      assert.equal(
        (await database.pool.query('SELECT 1 FROM session_refresh_tokens')).rowCount,
        0,
        'migration cannot mint a refresh token the browser never received',
      );
      const auth = new Auth(database);
      assert.equal((await auth.session(accessToken))?.ownerId, ownerId);
      assert.deepEqual(await auth.refresh('b'.repeat(64)), { status: 'invalid' });
    } finally {
      await database.close();
      await admin.pool.query(`DROP DATABASE "${databaseName}"`);
      await admin.close();
    }
  },
);
