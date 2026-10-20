const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const OTP_SUBJECT = 'Your CareerScope verification code';

export class EmailDeliveryUnavailable extends Error {
  constructor() {
    super('Email delivery is temporarily unavailable');
    this.name = 'EmailDeliveryUnavailable';
  }
}

export type OtpEmail = {
  to: string;
  code: string;
  idempotencyKey: string;
};

export type OtpEmailSender = (message: OtpEmail) => Promise<void>;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

export function verificationEmail(code: string) {
  if (!/^\d{6}$/.test(code)) throw new TypeError('Verification code must contain six digits');
  const safeCode = escapeHtml(code);
  return {
    subject: OTP_SUBJECT,
    text: [
      'CareerScope',
      '',
      `Your verification code is ${code}.`,
      'This code expires in five minutes.',
      'Never share this code. CareerScope will not ask you to share it.',
      'If you did not request this code, ignore this email.',
    ].join('\n'),
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${OTP_SUBJECT}</title></head>
<body style="margin:0;background:#f4f7fb;color:#17243a;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border:1px solid #dce4ef;border-radius:12px"><tr><td style="padding:32px 28px">
      <p style="margin:0 0 24px;color:#0b1f44;font-size:20px;font-weight:700">CareerScope</p>
      <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3">Your verification code</h1>
      <p style="margin:0 0 24px;line-height:1.6">Enter this code to continue signing in to CareerScope.</p>
      <p aria-label="Six-digit verification code" style="margin:0 0 24px;padding:18px 12px;background:#eaf2ff;border-radius:8px;color:#0b1f44;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px">${safeCode}</p>
      <p style="margin:0 0 12px;line-height:1.6">This code expires in five minutes. Never share it; CareerScope will not ask you to share it.</p>
      <p style="margin:0;color:#526176;line-height:1.6">If you did not request this code, ignore this email.</p>
    </td></tr></table>
  </td></tr></table>
</body></html>`,
  };
}

export function createResendOtpSender(
  configuration: { apiKey: string; from: string },
  options: {
    fetch?: typeof fetch;
    timeoutMs?: number;
    wait?: (milliseconds: number) => Promise<void>;
  } = {},
): OtpEmailSender {
  if (!configuration.apiKey.trim()) throw new TypeError('Resend API configuration is incomplete');
  if (configuration.from !== 'CareerScope <noreply@careerscope.tech>')
    throw new TypeError('CareerScope Resend sender must use the approved product address');

  const fetcher = options.fetch ?? fetch;
  // Keep all three bounded attempts and their backoff under the API's 15 s
  // request timeout so the caller can return the generic provider failure.
  const timeoutMs = options.timeoutMs ?? 4_000;
  const wait =
    options.wait ??
    ((milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  return async ({ to, code, idempotencyKey }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 254)
      throw new TypeError('Recipient email is invalid');
    const email = verificationEmail(code);
    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) throw new TypeError('Invalid delivery key');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetcher(RESEND_ENDPOINT, {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
          headers: {
            authorization: `Bearer ${configuration.apiKey}`,
            'content-type': 'application/json',
            'idempotency-key': idempotencyKey,
          },
          body: JSON.stringify({
            from: configuration.from,
            to: [to],
            subject: email.subject,
            html: email.html,
            text: email.text,
          }),
        });
        if (response.ok) return;
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          await wait(150 * (attempt + 1));
          continue;
        }
        throw new EmailDeliveryUnavailable();
      } catch (error) {
        if (error instanceof EmailDeliveryUnavailable) throw error;
        if (attempt === 2) throw new EmailDeliveryUnavailable();
        await wait(150 * (attempt + 1));
      }
    }
    throw new EmailDeliveryUnavailable();
  };
}
