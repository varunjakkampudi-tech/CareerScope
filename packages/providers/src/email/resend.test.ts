import { describe, expect, it } from 'vitest';
import { createResendOtpSender, EmailDeliveryUnavailable, verificationEmail } from './resend.js';

describe('CareerScope Resend OTP delivery', () => {
  it('renders an accessible branded HTML and plain-text code without remote assets', () => {
    const message = verificationEmail('012345');
    expect(message.subject).toBe('Your CareerScope verification code');
    expect(message.text).toContain('012345');
    expect(message.text).toContain('expires in five minutes');
    expect(message.text).toContain('Never share this code');
    expect(message.text).toContain('ignore this email');
    expect(message.html).toContain('aria-label="Six-digit verification code"');
    expect(message.html).toContain('012345');
    expect(message.html).not.toMatch(/<img|https?:\/\//i);
    expect(() => verificationEmail('12345')).toThrow(/six digits/);
  });

  it('posts only through the Resend API with an idempotency key and no tracking metadata', async () => {
    let captured: { url: string; init: RequestInit } | undefined;
    const send = createResendOtpSender(
      { apiKey: 'synthetic-resend-key', from: 'CareerScope <noreply@careerscope.tech>' },
      {
        fetch: async (input, init) => {
          captured = { url: String(input), init: init! };
          return new Response(null, { status: 202 });
        },
      },
    );

    await send({
      to: 'candidate@example.invalid',
      code: '123456',
      idempotencyKey: '11111111-1111-4111-8111-111111111111',
    });

    expect(captured?.url).toBe('https://api.resend.com/emails');
    expect(captured?.init.method).toBe('POST');
    expect(captured?.init.redirect).toBe('error');
    expect(captured?.init.signal).toBeInstanceOf(AbortSignal);
    const headers = new Headers(captured?.init.headers);
    expect(headers.get('authorization')).toBe('Bearer synthetic-resend-key');
    expect(headers.get('idempotency-key')).toBe('11111111-1111-4111-8111-111111111111');
    const body = JSON.parse(String(captured?.init.body)) as Record<string, unknown>;
    expect(body.from).toBe('CareerScope <noreply@careerscope.tech>');
    expect(body.to).toEqual(['candidate@example.invalid']);
    expect(body).not.toHaveProperty('open_tracking');
    expect(body).not.toHaveProperty('click_tracking');
    expect(body.text).toContain('123456');
    expect(body.html).toContain('123456');
  });

  it('retries transient failures with the same idempotency key and bounded attempts', async () => {
    const keys: string[] = [];
    const waits: number[] = [];
    let calls = 0;
    const send = createResendOtpSender(
      { apiKey: 'synthetic-resend-key', from: 'CareerScope <noreply@careerscope.tech>' },
      {
        fetch: async (_input, init) => {
          calls += 1;
          keys.push(new Headers(init?.headers).get('idempotency-key') ?? '');
          return new Response(null, { status: calls < 3 ? 503 : 202 });
        },
        wait: async (milliseconds) => {
          waits.push(milliseconds);
        },
      },
    );

    await send({
      to: 'candidate@example.invalid',
      code: '654321',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
    });

    expect(calls).toBe(3);
    expect(new Set(keys)).toEqual(new Set(['22222222-2222-4222-8222-222222222222']));
    expect(waits).toEqual([150, 300]);
  });

  it('does not retry permanent rejection or read provider response bodies', async () => {
    let calls = 0;
    const response = new Response('synthetic provider detail', { status: 401 });
    response.text = async () => {
      throw new Error('response body must not be read');
    };
    const send = createResendOtpSender(
      { apiKey: 'synthetic-resend-key', from: 'CareerScope <noreply@careerscope.tech>' },
      {
        fetch: async () => {
          calls += 1;
          return response;
        },
        wait: async () => undefined,
      },
    );

    await expect(
      send({
        to: 'candidate@example.invalid',
        code: '123456',
        idempotencyKey: '33333333-3333-4333-8333-333333333333',
      }),
    ).rejects.toBeInstanceOf(EmailDeliveryUnavailable);
    expect(calls).toBe(1);
  });

  it('rejects non-product sender identities and malformed recipients', async () => {
    expect(() =>
      createResendOtpSender({ apiKey: 'synthetic', from: 'Other <noreply@example.invalid>' }),
    ).toThrow(/approved product address/);
    const send = createResendOtpSender({
      apiKey: 'synthetic',
      from: 'CareerScope <noreply@careerscope.tech>',
    });
    await expect(
      send({
        to: 'not-an-email',
        code: '123456',
        idempotencyKey: '44444444-4444-4444-8444-444444444444',
      }),
    ).rejects.toThrow(/Recipient email is invalid/);
  });
});
