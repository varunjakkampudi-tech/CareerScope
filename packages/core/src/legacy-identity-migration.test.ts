import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Database } from './database.js';

test('legacy identity migration preserves values and aborts until they are owner-resolved', async () => {
  const configured = process.env.DATABASE_URL;
  assert.ok(configured, 'integration test requires an isolated DATABASE_URL');
  const base = new URL(configured);
  assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname));

  const admin = new Database(configured);
  const name = `test_${randomUUID().replaceAll('-', '')}`;
  await admin.pool.query(`CREATE DATABASE "${name}"`);
  base.pathname = `/${name}`;
  const database = new Database(base.href);
  const previousMigrations = await mkdtemp(join(tmpdir(), 'careerscope-identity-migration-'));
  const migrationsFolder = fileURLToPath(new URL('../../../migrations', import.meta.url));

  try {
    const journalPath = join(migrationsFolder, 'meta/_journal.json');
    const journal = JSON.parse(await readFile(journalPath, 'utf8')) as {
      entries: { idx: number; tag: string }[];
    };
    journal.entries = journal.entries.filter((entry) => entry.idx < 19);
    await mkdir(join(previousMigrations, 'meta'));
    await writeFile(join(previousMigrations, 'meta/_journal.json'), JSON.stringify(journal));
    for (const entry of journal.entries)
      await copyFile(
        join(migrationsFolder, `${entry.tag}.sql`),
        join(previousMigrations, `${entry.tag}.sql`),
      );

    await migrate(database.db, { migrationsFolder: previousMigrations });
    const id = randomUUID();
    await database.pool.query(
      `INSERT INTO users (id, email, password_hash, external_subject, phone)
       VALUES ($1, $2, 'synthetic-not-a-login', 'legacy-subject', '+15555550123')`,
      [id, `${id}@example.test`],
    );

    await assert.rejects(
      migrate(database.db, { migrationsFolder }),
      /Cannot remove legacy external identity fields while values remain; owner-reviewed disposition is required/,
    );

    const preserved = await database.pool.query<{
      external_subject: string | null;
      phone: string | null;
    }>('SELECT external_subject, phone FROM users WHERE id = $1', [id]);
    assert.deepEqual(preserved.rows[0], {
      external_subject: 'legacy-subject',
      phone: '+15555550123',
    });

    await database.pool.query(
      'UPDATE users SET external_subject = NULL, phone = NULL WHERE id = $1',
      [id],
    );
    await migrate(database.db, { migrationsFolder });

    const retained = await database.pool.query<{ email: string | null }>(
      'SELECT email FROM users WHERE id = $1',
      [id],
    );
    assert.equal(retained.rows[0]?.email, `${id}@example.test`);
    const removedColumns = await database.pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = 'users'
         AND column_name IN ('external_subject', 'phone')`,
    );
    assert.deepEqual(removedColumns.rows, []);
    const removedIndexes = await database.pool.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes
       WHERE schemaname = current_schema() AND tablename = 'users'
         AND indexname IN ('users_external_subject_unique', 'users_phone_unique')`,
    );
    assert.deepEqual(removedIndexes.rows, []);
  } finally {
    await database.close();
    try {
      await admin.pool.query(`DROP DATABASE "${name}"`);
    } finally {
      await admin.close();
      await rm(previousMigrations, { recursive: true, force: true });
    }
  }
});
