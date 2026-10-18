import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createApp } from '../../../apps/api/src/app.js';
import { Database } from './database.js';
import { testUsers } from './test-users.js';

test('private test selection enforces the edge boundary, allowlist, rotation and owner isolation', async () => {
  assert.ok(process.env.DATABASE_URL);
  const url = new URL(process.env.DATABASE_URL);
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname));
  const admin = new Database(url.href);
  const name = `test_${randomUUID().replaceAll('-', '')}`;
  await admin.pool.query(`CREATE DATABASE "${name}"`);
  url.pathname = `/${name}`;
  const database = new Database(url.href);
  const origin = 'https://staging.example.invalid';
  const secret = 'a'.repeat(64);
  const app = await createApp(database, origin, async () => true, {
    testAccess: { mode: 'proxy', proxySecret: secret },
  });
  const headers = { origin, 'x-careerscope-staging-key': secret };
  try {
    await migrate(database.db, {
      migrationsFolder: fileURLToPath(new URL('../../../migrations', import.meta.url)),
    });
    for (const request of [
      { url: '/api/session' },
      { url: '/api/session', headers: { 'x-careerscope-staging-key': 'b'.repeat(64) } },
      { url: '/api/session', headers, remoteAddress: '203.0.113.5' },
    ])
      assert.equal((await app.inject(request)).statusCode, 403);
    const discovery = await app.inject({ url: '/api/session', headers });
    assert.equal(discovery.statusCode, 200);
    assert.deepEqual(
      discovery.json().testAccounts,
      testUsers.map(({ email, role }) => ({ email, role })),
    );
    const unknown = await app.inject({
      method: 'POST',
      url: '/api/login',
      headers,
      payload: { email: 'unknown@example.invalid' },
    });
    assert.equal(unknown.statusCode, 401);
    assert.equal(
      Number((await database.pool.query('SELECT count(*) FROM users')).rows[0].count),
      0,
    );
    assert.equal(
      (
        await app.inject({
          method: 'POST',
          url: '/api/login',
          headers,
          payload: { email: testUsers[0].email, role: 'admin' },
        })
      ).statusCode,
      400,
    );
    const candidate = await app.inject({
      method: 'POST',
      url: '/api/login',
      headers,
      payload: { email: testUsers[0].email },
    });
    assert.equal(candidate.statusCode, 200);
    const cookie = candidate.headers['set-cookie'] as string;
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=Strict/i);
    const session = (
      await app.inject({ url: '/api/session', headers: { ...headers, cookie } })
    ).json();
    assert.equal(session.email, testUsers[0].email);
    assert.equal(session.testUser, 'candidate');
    const rotated = await app.inject({
      method: 'POST',
      url: '/api/login',
      headers: { ...headers, cookie },
      payload: { email: testUsers[0].email },
    });
    assert.equal(rotated.statusCode, 200);
    assert.equal(
      (await app.inject({ url: '/api/session', headers: { ...headers, cookie } })).json()
        .authenticated,
      false,
    );
    const adminSession = await app.inject({
      method: 'POST',
      url: '/api/login',
      headers,
      payload: { email: testUsers[1].email },
    });
    assert.equal(adminSession.statusCode, 200);
    const adminCookie = adminSession.headers['set-cookie'] as string;
    const adminIdentity = (
      await app.inject({ url: '/api/session', headers: { ...headers, cookie: adminCookie } })
    ).json();
    assert.equal(adminIdentity.testUser, 'admin');
    assert.notEqual(adminIdentity.owner, session.owner);
    const run = await database.createSearch(testUsers[0].id, 'private-test-selection', {
      query: 'Private candidate search',
      sources: ['remoteok'],
    });
    assert.equal(
      (
        await app.inject({
          url: `/api/searches/${run.id}`,
          headers: { ...headers, cookie: adminCookie },
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          method: 'POST',
          url: '/api/register',
          headers,
          payload: { email: 'new@example.invalid', password: randomUUID() },
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          method: 'POST',
          url: '/api/account/password',
          headers: { ...headers, cookie: adminCookie, 'x-csrf-token': adminIdentity.csrf },
          payload: {},
        })
      ).statusCode,
      404,
    );
  } finally {
    await app.close();
    await database.close();
    await admin.pool.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await admin.close();
  }
});
