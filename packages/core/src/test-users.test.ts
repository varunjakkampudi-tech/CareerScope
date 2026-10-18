import assert from 'node:assert/strict';
import test from 'node:test';
import { Auth } from './auth.js';
import { Database } from './database.js';
import { testAccessAllowed, testAccessConfiguration, testUsers } from './test-users.js';

test('public test selection is disabled unless an explicit private proxy is configured', () => {
  assert.deepEqual(testAccessConfiguration({}, 'https://careerscope.tech'), { mode: 'disabled' });
  assert.throws(() =>
    testAccessConfiguration({ TEST_ACCESS_MODE: 'local' }, 'https://careerscope.tech'),
  );
  assert.throws(() =>
    testAccessConfiguration(
      { TEST_ACCESS_MODE: 'local', NODE_ENV: 'production' },
      'http://localhost:5280',
    ),
  );
  assert.throws(() =>
    testAccessConfiguration({ TEST_ACCESS_MODE: 'proxy' }, 'https://careerscope.tech'),
  );
  assert.throws(() =>
    testAccessConfiguration(
      { TEST_ACCESS_MODE: 'proxy', TEST_PROXY_SECRET: 'a'.repeat(64) },
      'http://localhost:5280',
    ),
  );
});

test('local selection only accepts loopback requests', () => {
  const access = testAccessConfiguration({}, 'http://localhost:5280');
  assert.equal(testAccessAllowed(access, '127.0.0.1', undefined), true);
  assert.equal(testAccessAllowed(access, '::1', undefined), true);
  assert.equal(testAccessAllowed(access, '203.0.113.2', undefined), false);
  assert.equal(testAccessAllowed({ mode: 'disabled' }, '127.0.0.1', undefined), false);
});

test('hosted test access requires the private assertion from a loopback proxy', () => {
  const secret = 'a'.repeat(64);
  const access = testAccessConfiguration(
    { TEST_ACCESS_MODE: 'proxy', TEST_PROXY_SECRET: secret },
    'https://careerscope.tech',
  );
  assert.equal(testAccessAllowed(access, '127.0.0.1', secret), true);
  for (const header of [undefined, '', 'a'.repeat(63), 'b'.repeat(64), [secret]]) {
    assert.equal(testAccessAllowed(access, '127.0.0.1', header), false);
  }
  assert.equal(testAccessAllowed(access, '203.0.113.2', secret), false);
});

test('test identities are distinct and arbitrary emails cannot touch the database', async () => {
  assert.equal(testUsers.length, 2);
  assert.equal(new Set(testUsers.map((user) => user.id)).size, 2);
  assert.deepEqual(
    testUsers.map((user) => user.role),
    ['candidate', 'admin'],
  );
  const database = new Database('postgres://localhost:1/unused');
  try {
    assert.equal(await new Auth(database).testLogin('unapproved@example.invalid'), null);
  } finally {
    await database.close();
  }
});
