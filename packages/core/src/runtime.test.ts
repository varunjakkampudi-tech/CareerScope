import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { configuration, rateLimiter } from './runtime.js';

test('the search queue transport is scoped, and the legacy names are refused', () => {
  const source = {
    DATABASE_URL: 'postgres://localhost/test',
    REDIS_URL: 'redis://localhost:56479',
    QUEUE_REDIS_URL: 'redis://localhost:56480',
    APP_ORIGIN: 'http://localhost:5280',
  };
  assert.equal(configuration(source).SEARCH_QUEUE_TRANSPORT, 'redis');
  assert.equal(configuration(source).REGISTRATION_ENABLED, 'false');
  assert.throws(() => configuration({ ...source, REGISTRATION_ENABLED: 'true' }));
  assert.throws(() => configuration({ ...source, REGISTRATION_ENABLED: 'yes' }));
  assert.throws(() => configuration({ ...source, SEARCH_QUEUE_TRANSPORT: 'unknown' }));
  assert.throws(() => configuration({ ...source, SEARCH_QUEUE_TRANSPORT: 'bullmq' }));
  assert.throws(() =>
    configuration({
      ...source,
      SEARCH_QUEUE_TRANSPORT: 'bullmq',
      SEARCH_QUEUE_REDIS_URL: source.REDIS_URL,
    }),
  );
  assert.throws(() =>
    configuration({
      ...source,
      SEARCH_QUEUE_TRANSPORT: 'bullmq',
      SEARCH_QUEUE_REDIS_URL: 'redis://example.com',
    }),
  );
  assert.equal(
    configuration({
      ...source,
      SEARCH_QUEUE_TRANSPORT: 'bullmq',
      SEARCH_QUEUE_REDIS_URL: 'redis://localhost:56480',
    }).SEARCH_QUEUE_TRANSPORT,
    'bullmq',
  );
  // Queue data may never share the evicting rate-limit instance.
  assert.throws(
    () => configuration({ ...source, QUEUE_TRANSPORT: 'bullmq' }),
    /SEARCH_QUEUE_TRANSPORT/,
  );
  assert.throws(() => configuration({ ...source, QUEUE_REDIS_URL: source.REDIS_URL }), /isolated/);
  assert.throws(() => configuration({ ...source, QUEUE_TRANSPORT: 'sqs' }));
});

test('production email OTP and signup fail closed on incomplete provider or legal configuration', () => {
  const source = {
    DATABASE_URL: 'postgres://localhost/test',
    REDIS_URL: 'redis://localhost:56479',
    QUEUE_REDIS_URL: 'redis://localhost:56480',
    APP_ORIGIN: 'https://careerscope.tech',
  };
  const otp = {
    ...source,
    AUTH_OTP_ENABLED: 'true',
    RESEND_API_KEY: 'synthetic-resend-key',
    RESEND_FROM_EMAIL: 'CareerScope <noreply@careerscope.tech>',
    OTP_HMAC_SECRET: 'a'.repeat(64),
  };
  assert.equal(configuration(otp).AUTH_OTP_ENABLED, 'true');
  assert.throws(() => configuration({ ...otp, RESEND_API_KEY: undefined }));
  assert.throws(() => configuration({ ...otp, OTP_HMAC_SECRET: 'too-short' }));
  assert.throws(() => configuration({ ...otp, RESEND_FROM_EMAIL: 'noreply@example.invalid' }));
  assert.throws(() => configuration({ ...otp, REGISTRATION_ENABLED: 'true' }));
  const registration = {
    ...otp,
    REGISTRATION_ENABLED: 'true',
    LEGAL_POLICIES_APPROVED: 'true',
    LEGAL_TERMS_VERSION: 'terms-approved-1',
    LEGAL_PRIVACY_VERSION: 'privacy-approved-1',
    LEGAL_TERMS_URL: 'https://careerscope.tech/terms',
    LEGAL_PRIVACY_URL: 'https://careerscope.tech/privacy',
  };
  assert.equal(configuration(registration).REGISTRATION_ENABLED, 'true');
  assert.throws(() =>
    configuration({ ...registration, LEGAL_TERMS_URL: 'https://example.invalid/terms' }),
  );
  assert.throws(() => configuration({ ...registration, LEGAL_POLICIES_APPROVED: 'false' }));
});

test('a public application origin is accepted only over https', () => {
  const source = {
    DATABASE_URL: 'postgres://localhost/test',
    REDIS_URL: 'redis://localhost:56479',
    QUEUE_REDIS_URL: 'redis://localhost:56480',
    APP_ORIGIN: 'https://careerscope.tech',
  };
  assert.equal(configuration(source).APP_ORIGIN, 'https://careerscope.tech');
  assert.equal(
    configuration({ ...source, APP_ORIGIN: 'http://localhost:5280' }).APP_ORIGIN,
    'http://localhost:5280',
  );
  // Plain http against a real hostname would drop Secure from the session cookie.
  assert.throws(() => configuration({ ...source, APP_ORIGIN: 'http://careerscope.tech' }));
  assert.throws(() => configuration({ ...source, APP_ORIGIN: 'https://careerscope.tech/app' }));
  assert.throws(() => configuration({ ...source, APP_ORIGIN: 'ftp://careerscope.tech' }));
  // Infrastructure endpoints stay loopback-only even when the origin is public.
  assert.throws(() => configuration({ ...source, DATABASE_URL: 'postgres://db.example.com/x' }));
  assert.throws(() => configuration({ ...source, REDIS_URL: 'redis://cache.example.com' }));
});

test('Redis rate limit is atomic and expires rather than persisting authorization', async () => {
  assert.ok(process.env.REDIS_URL);
  const prefix = `test:${randomUUID()}:`;
  const limiter = await rateLimiter(process.env.REDIS_URL, prefix);
  try {
    const admitted = await Promise.all(
      Array.from({ length: 20 }, () => limiter.consume('login', 5, 60)),
    );
    assert.equal(admitted.filter(Boolean).length, 5);
    assert.ok((await limiter.client.ttl(`${prefix}login`)) > 0);
    await limiter.client.del(`${prefix}login`);
    assert.equal(await limiter.consume('login', 5, 60), true);
  } finally {
    await limiter.client.del(`${prefix}login`);
    await limiter.close();
  }
});

test('separate API limiter instances share one atomic OTP abuse budget', async () => {
  assert.ok(process.env.REDIS_URL);
  const prefix = `multi-instance-test:${randomUUID()}:`;
  const first = await rateLimiter(process.env.REDIS_URL, prefix);
  const second = await rateLimiter(process.env.REDIS_URL, prefix);
  try {
    const admitted = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        (index % 2 === 0 ? first : second).consume('otp:synthetic', 6, 60),
      ),
    );
    assert.equal(admitted.filter(Boolean).length, 6);
    assert.ok((await first.client.ttl(`${prefix}otp:synthetic`)) > 0);
  } finally {
    await first.client.del(`${prefix}otp:synthetic`);
    await first.close();
    await second.close();
  }
});
