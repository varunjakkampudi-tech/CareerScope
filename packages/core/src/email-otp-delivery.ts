import { z } from 'zod';

const emailSchema = z.string().trim().email().max(254);
const codeSchema = z.string().regex(/^\d{6}$/);
const resendEndpoint = 'https://api.resend.com/emails';

export type EmailOtpDeliveryMessage = { email: string; code: string };

export interface EmailOtpProvider {
  send(message: EmailOtpDeliveryMessage): Promise<void>;
}

export class EmailOtpProviderError extends Error {
  constructor(readonly retryable: boolean) {
    super('Email OTP provider request failed');
    this.name = 'EmailOtpProviderError';
  }
}

export class EmailOtpDeliveryUnavailable extends Error {
  constructor() {
    super('Email OTP delivery is temporarily unavailable');
    this.name = 'EmailOtpDeliveryUnavailable';
  }
}

/** Resend adapter using the official HTTPS email-send endpoint. */
export class ResendEmailOtpProvider implements EmailOtpProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (apiKey.trim().length === 0 || apiKey.length > 512)
      throw new Error('Invalid email provider configuration');
    if (from.trim().length < 3 || from.length > 254)
      throw new Error('Invalid email provider configuration');
  }

  async send(message: EmailOtpDeliveryMessage): Promise<void> {
    const email = emailSchema.parse(message.email).toLowerCase();
    const code = codeSchema.parse(message.code);
    let response: Response;
    try {
      response = await this.fetcher(resendEndpoint, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(5_000),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: [email],
          subject: 'Your CareerScope sign-in code',
          text: `Your CareerScope sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
          html: `<p>Your CareerScope sign-in code is <strong>${code}</strong>.</p><p>It expires in 10 minutes. If you did not request this code, you can ignore this email.</p>`,
        }),
      });
    } catch {
      // Fetch errors can include request/response internals. Do not propagate or
      // log them, since the request body contains both the address and OTP.
      throw new EmailOtpProviderError(true);
    }

    if (!response.ok) {
      // Never read or propagate provider response bodies: they are not needed
      // for failover decisions and may contain address or request metadata.
      const retryable =
        response.status === 408 || response.status === 429 || response.status >= 500;
      throw new EmailOtpProviderError(retryable);
    }
  }
}

/**
 * Sends through one configured primary and then an injected fallback provider.
 * The fallback vendor remains a composition choice; this class does not assume
 * credentials or create an account for it.
 */
export class FailoverEmailOtpDelivery {
  constructor(
    private readonly primary: EmailOtpProvider,
    private readonly fallback: EmailOtpProvider,
  ) {}

  async send(message: EmailOtpDeliveryMessage): Promise<'primary' | 'fallback'> {
    try {
      await this.primary.send(message);
      return 'primary';
    } catch (error) {
      if (!(error instanceof EmailOtpProviderError) || !error.retryable)
        throw new EmailOtpDeliveryUnavailable();
    }

    try {
      await this.fallback.send(message);
      return 'fallback';
    } catch {
      throw new EmailOtpDeliveryUnavailable();
    }
  }
}
