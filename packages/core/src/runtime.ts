import { createClient } from 'redis';
import pino from 'pino';
import { z } from 'zod';
import { localEndpoint } from './queue.js';

export const logger = pino({ level: 'info', base: undefined });

function localUrl(value: string, protocols: string[]) {
  const url = new URL(value);
  if (!protocols.includes(url.protocol) || !['127.0.0.1', 'localhost'].includes(url.hostname)) {
    throw new Error('v2 runtime endpoints must use local services');
  }
  return value;
}

// The browser-facing origin is the one value that must be public in a deployed
// installation: it is compared against the Origin header and decides whether the
// session cookie carries Secure. Anything that is not loopback must be https, so
// the cookie can never silently lose Secure behind a real hostname.
function appOrigin(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('APP_ORIGIN must be http(s)');
  if (url.origin !== value) throw new Error('APP_ORIGIN must be an origin');
  const loopback = ['127.0.0.1', 'localhost'].includes(url.hostname);
  if (!loopback && url.protocol !== 'https:') {
    throw new Error('A public APP_ORIGIN must use https');
  }
  return value;
}

export function configuration(source: NodeJS.ProcessEnv = process.env) {
  if (source.QUEUE_TRANSPORT !== undefined)
    throw new Error('Use SEARCH_QUEUE_TRANSPORT to choose a supported Redis transport');
  const env = z
    .object({
      DATABASE_URL: z.string().min(1),
      REDIS_URL: z.string().min(1),
      QUEUE_REDIS_URL: z.string().min(1).default('redis://127.0.0.1:56480'),
      APP_ORIGIN: z.string().min(1),
      REGISTRATION_ENABLED: z.enum(['true', 'false']).default('false'),
      AUTH_OTP_ENABLED: z.enum(['true', 'false']).default('false'),
      RESEND_API_KEY: z.string().min(1).optional(),
      RESEND_FROM_EMAIL: z.string().optional(),
      OTP_HMAC_SECRET: z.string().optional(),
      LEGAL_TERMS_VERSION: z.string().min(1).max(80).optional(),
      LEGAL_PRIVACY_VERSION: z.string().min(1).max(80).optional(),
      LEGAL_TERMS_URL: z.string().url().optional(),
      LEGAL_PRIVACY_URL: z.string().url().optional(),
      LEGAL_POLICIES_APPROVED: z.enum(['true', 'false']).default('false'),
      SEARCH_QUEUE_TRANSPORT: z.enum(['redis', 'bullmq']).default('redis'),
      SEARCH_QUEUE_REDIS_URL: z.string().min(1).optional(),
    })
    .parse(source);
  if (env.AUTH_OTP_ENABLED === 'true') {
    if (
      !env.RESEND_API_KEY ||
      env.RESEND_FROM_EMAIL !== 'CareerScope <noreply@careerscope.tech>' ||
      !env.OTP_HMAC_SECRET ||
      !/^[a-f0-9]{64}$/i.test(env.OTP_HMAC_SECRET)
    )
      throw new Error('Email OTP configuration is incomplete');
  }
  if (env.REGISTRATION_ENABLED === 'true') {
    if (
      env.AUTH_OTP_ENABLED !== 'true' ||
      env.LEGAL_POLICIES_APPROVED !== 'true' ||
      !env.LEGAL_TERMS_VERSION ||
      !env.LEGAL_PRIVACY_VERSION ||
      !env.LEGAL_TERMS_URL ||
      !env.LEGAL_PRIVACY_URL ||
      new URL(env.LEGAL_TERMS_URL).origin !== 'https://careerscope.tech' ||
      new URL(env.LEGAL_PRIVACY_URL).origin !== 'https://careerscope.tech'
    )
      throw new Error('Registration requires enabled OTP and approved legal versions');
  }
  localUrl(env.DATABASE_URL, ['postgres:', 'postgresql:']);
  localUrl(env.REDIS_URL, ['redis:']);
  localEndpoint(env.QUEUE_REDIS_URL);
  if (env.QUEUE_REDIS_URL === env.REDIS_URL)
    throw new Error('Queue Redis must be isolated from rate limiting');
  if (env.SEARCH_QUEUE_TRANSPORT === 'bullmq') {
    if (!env.SEARCH_QUEUE_REDIS_URL || env.SEARCH_QUEUE_REDIS_URL === env.REDIS_URL) {
      throw new Error('BullMQ requires a separate SEARCH_QUEUE_REDIS_URL');
    }
    localUrl(env.SEARCH_QUEUE_REDIS_URL, ['redis:']);
  }
  appOrigin(env.APP_ORIGIN);
  return env;
}

export async function rateLimiter(url: string, prefix = 'careerscope:v2:rate:') {
  localUrl(url, ['redis:']);
  const client = createClient({
    url,
    socket: {
      connectTimeout: 3000,
      reconnectStrategy: (attempt) => (attempt < 3 ? Math.min(1000, attempt * 200) : false),
    },
    disableOfflineQueue: true,
  });
  client.on('error', () => logger.error('Redis connection failed'));
  await client.connect();
  return {
    client,
    async consume(key: string, limit: number, seconds: number) {
      const count = await client.eval(
        `local count = redis.call('INCR', KEYS[1])
        if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
        return count`,
        { keys: [`${prefix}${key}`], arguments: [String(seconds)] },
      );
      return Number(count) <= limit;
    },
    async close() {
      if (client.isOpen) await client.quit();
    },
  };
}

export function shutdownSignal() {
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  return {
    signal: controller.signal,
    close() {
      process.removeListener('SIGINT', stop);
      process.removeListener('SIGTERM', stop);
    },
  };
}
