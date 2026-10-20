import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EmailOtpDeliveryUnavailable,
  EmailOtpProviderError,
  FailoverEmailOtpDelivery,
  ResendEmailOtpProvider,
  type EmailOtpProvider,
} from './email-otp-delivery.js';

const message = { email: 'Candidate@Example.Test', code: '042731' };

test('Resend adapter sends a minimal OTP message to the fixed HTTPS endpoint', async () => {
  let requestUrl = '';
  let request: RequestInit | undefined;
  const provider = new ResendEmailOtpProvider(
    'synthetic-key',
    'CareerScope <auth@example.test>',
    async (input, init) => {
      requestUrl = String(input);
      request = init;
      return new Response(null, { status: 200 });
    },
  );

  await provider.send(message);

  assert.equal(requestUrl, 'https://api.resend.com/emails');
  assert.equal(request?.method, 'POST');
  assert.equal(request?.redirect, 'error');
  assert.equal(new Headers(request?.headers).get('authorization'), 'Bearer synthetic-key');
  const body = JSON.parse(String(request?.body)) as Record<string, unknown>;
  assert.deepEqual(body.to, ['candidate@example.test']);
  assert.equal(body.from, 'CareerScope <auth@example.test>');
  assert.equal(body.subject, 'Your CareerScope sign-in code');
  assert.match(String(body.text), /042731/);
  assert.match(String(body.html), /042731/);
  assert.deepEqual(Object.keys(body).sort(), ['from', 'html', 'subject', 'text', 'to']);
});

test('Resend rejects malformed input before making a request', async () => {
  let calls = 0;
  const provider = new ResendEmailOtpProvider('synthetic-key', 'auth@example.test', async () => {
    calls += 1;
    return new Response(null, { status: 200 });
  });

  await assert.rejects(provider.send({ ...message, code: 'not-an-otp' }), zodError);
  await assert.rejects(provider.send({ ...message, email: 'not-an-email' }), zodError);
  assert.equal(calls, 0);
});

test('Resend failures expose no provider response body and classify only retryable statuses', async () => {
  const provider = new ResendEmailOtpProvider(
    'synthetic-key',
    'auth@example.test',
    async () => new Response('private provider body must not escape', { status: 503 }),
  );
  await assert.rejects(provider.send(message), (error: unknown) => {
    assert.ok(error instanceof EmailOtpProviderError);
    assert.equal(error.retryable, true);
    assert.equal(error.message, 'Email OTP provider request failed');
    assert.equal(error.message.includes('private provider body'), false);
    return true;
  });

  const invalidConfiguration = new ResendEmailOtpProvider(
    'synthetic-key',
    'auth@example.test',
    async () => new Response('private provider body must not escape', { status: 401 }),
  );
  await assert.rejects(invalidConfiguration.send(message), (error: unknown) => {
    assert.ok(error instanceof EmailOtpProviderError);
    assert.equal(error.retryable, false);
    return true;
  });
});

test('failover uses the fallback only after a retryable primary failure', async () => {
  const calls: string[] = [];
  const primary: EmailOtpProvider = {
    async send() {
      calls.push('primary');
      throw new EmailOtpProviderError(true);
    },
  };
  const fallback: EmailOtpProvider = {
    async send(received) {
      calls.push('fallback');
      assert.deepEqual(received, message);
    },
  };

  assert.equal(await new FailoverEmailOtpDelivery(primary, fallback).send(message), 'fallback');
  assert.deepEqual(calls, ['primary', 'fallback']);
});

test('failover does not hide permanent primary configuration errors', async () => {
  let fallbackCalls = 0;
  const primary: EmailOtpProvider = {
    async send() {
      throw new EmailOtpProviderError(false);
    },
  };
  const fallback: EmailOtpProvider = {
    async send() {
      fallbackCalls += 1;
    },
  };

  await assert.rejects(
    new FailoverEmailOtpDelivery(primary, fallback).send(message),
    EmailOtpDeliveryUnavailable,
  );
  assert.equal(fallbackCalls, 0);
});

test('both provider failures map to one sanitized unavailable error', async () => {
  const failing: EmailOtpProvider = {
    async send() {
      throw new Error('synthetic transport detail with message address and OTP');
    },
  };
  const delivery = new FailoverEmailOtpDelivery(
    {
      async send() {
        throw new EmailOtpProviderError(true);
      },
    },
    failing,
  );

  await assert.rejects(delivery.send(message), (error: unknown) => {
    assert.ok(error instanceof EmailOtpDeliveryUnavailable);
    assert.equal(error.message, 'Email OTP delivery is temporarily unavailable');
    assert.equal(error.message.includes('synthetic transport detail'), false);
    return true;
  });
});

const zodError = (error: unknown) => error instanceof Error && error.name === 'ZodError';
