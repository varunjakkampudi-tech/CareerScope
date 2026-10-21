import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import Fastify, { LogController, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { z } from 'zod';
import {
  JOB_SOURCE_PERMISSION_PENDING_MESSAGE,
  LAUNCH_JOB_SOURCE_CANDIDATES,
  SOURCE_LABELS,
  isJobSourcePermittedForCandidateDiscovery,
  type SourceId,
} from '@careerscope/shared';
import { registerOpenApi } from './openapi.js';
import {
  Auth,
  createEmailOtp,
  EmailChangeRequests,
  EmailOtpChallenges,
  emailOtpLifetimeMs,
  hashOtpEmail,
  testUsers,
  testAccessAllowed,
  type TestAccess,
  sessionCookie,
  refreshCookie,
  accessSessionLifetimeSeconds,
  refreshSessionLifetimeSeconds,
  Conflict,
  createSearchSchema,
  collectedJobSchema,
  sourceOutcomesSchema,
  ProfileRepository,
  prepareProfile,
  LeadRepository,
  InterviewRepository,
  InAppNotificationRepository,
  ResumeUploadRepository,
  ResumeUploadCoordinator,
  InvalidResumeUpload,
  ResumeStorageLimit,
  maximumResumeBytes,
  MarketRepository,
  type UploadStorage,
  type EmailOtpProvider,
  type Database,
} from '@careerscope/core';

export type RateLimit = (key: string, limit: number, seconds: number) => Promise<boolean>;

// Read rather than hardcode: the literal that used to live here was still
// reporting 2.0.0-alpha.1 after the package had moved on.
const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string };
const loginSchema = z.object({ email: z.string().trim().email().max(254) }).strict();
const harnessPasswordLoginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(256),
  })
  .strict();
const otpRequestSchema = z
  .object({
    email: z.string().trim().email().max(254),
    intent: z.enum(['sign-in', 'sign-up']).optional(),
    termsAccepted: z.boolean().optional(),
    privacyAcknowledged: z.boolean().optional(),
    marketingOptIn: z.boolean().optional(),
  })
  .strict()
  .superRefine((input, context) => {
    if (input.intent === 'sign-up' && input.termsAccepted !== true) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['termsAccepted'],
        message: 'Required',
      });
    }
    if (input.intent === 'sign-up' && input.privacyAcknowledged !== true) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['privacyAcknowledged'],
        message: 'Required',
      });
    }
    if (
      input.intent !== 'sign-up' &&
      (input.termsAccepted !== undefined ||
        input.privacyAcknowledged !== undefined ||
        input.marketingOptIn !== undefined)
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Signup acceptance is invalid' });
    }
  });
const otpVerifySchema = z
  .object({
    email: z.string().trim().email().max(254),
    code: z.string().regex(/^\d{6}$/),
    intent: z.enum(['sign-in', 'sign-up']).optional(),
  })
  .strict();
const emailChangeRequestSchema = z
  .object({ newEmail: z.string().trim().email().max(254) })
  .strict();
const emailChangeVerifySchema = z
  .object({ address: z.enum(['current', 'new']), code: z.string().regex(/^\d{6}$/) })
  .strict();

const deviceName = (userAgent: string | undefined) => {
  if (!userAgent) return 'Unknown device';
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Firefox\//.test(userAgent)
      ? 'Firefox'
      : /Chrome\//.test(userAgent)
        ? 'Chrome'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Unknown browser';
  const platform = /Android/i.test(userAgent)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(userAgent)
      ? 'iOS'
      : /Windows/i.test(userAgent)
        ? 'Windows'
        : /Macintosh|Mac OS/i.test(userAgent)
          ? 'macOS'
          : /Linux/i.test(userAgent)
            ? 'Linux'
            : 'unknown device';
  if (browser === 'Unknown browser' && platform === 'unknown device') return 'Unknown device';
  return `${browser} on ${platform}`;
};

const setSessionCookies = (
  reply: import('fastify').FastifyReply,
  credentials: { accessToken: string; refreshToken: string },
  secure: boolean,
) => {
  reply.setCookie(sessionCookie, credentials.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api',
    maxAge: accessSessionLifetimeSeconds,
  });
  reply.setCookie(refreshCookie, credentials.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/session',
    maxAge: refreshSessionLifetimeSeconds,
  });
};

const clearSessionCookies = (reply: import('fastify').FastifyReply) => {
  reply.clearCookie(sessionCookie, { path: '/api' });
  reply.clearCookie(refreshCookie, { path: '/api/session' });
};
const identifier = z.object({ id: z.string().uuid() });
const jobIdentifier = z.object({ jobId: z.string().uuid() });
const idempotencyKey = z.string().regex(/^[a-zA-Z0-9_-]{8,128}$/);
const eventCursor = z
  .string()
  .refine((value) => /^(0|[1-9][0-9]{0,18})$/.test(value) && BigInt(value) <= 9223372036854775807n);
class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    ownerId: string | null;
  }
}

export async function createApp(
  database: Database,
  origin: string,
  rateLimit: RateLimit,
  options: {
    testAccess?: TestAccess;
    /** Explicit compatibility path for isolated legacy API fixtures only. */
    testHarnessPasswordLogin?: boolean;
    emailOtp?: { secret: Uint8Array; provider: EmailOtpProvider };
    /** Critical shared dependencies that must be healthy before this API is ready. */
    readiness?: () => Promise<void>;
    registrationEnabled?: boolean;
    registrationPolicy?: {
      termsVersion: string;
      termsUrl: string;
      privacyVersion: string;
      privacyUrl: string;
      marketingVersion: string;
    };
    /** Test-only policy injection for isolated synthetic browser/integration fixtures. */
    sourcePermitted?: (source: SourceId) => boolean;
    resumeStorage?: UploadStorage & {
      cancelUpload?: (
        object: import('@careerscope/core').ResumeObject,
        signal?: AbortSignal,
      ) => Promise<void>;
      delete: (
        object: import('@careerscope/core').ResumeObject,
        version: string,
        signal?: AbortSignal,
      ) => Promise<void>;
    };
  } = {},
) {
  const auth = new Auth(database);
  const consumeRateLimit = async (
    request: FastifyRequest,
    key: string,
    limit: number,
    seconds: number,
  ) => {
    try {
      return await rateLimit(key, limit, seconds);
    } catch {
      // Redis is a required abuse-control dependency. Fail closed with a
      // stable service-unavailable response and never log the rate-limit key,
      // which can contain a derived account or owner identifier.
      request.log.error({ requestId: request.id }, 'Shared rate-limit service unavailable');
      throw new HttpError(503, 'Service temporarily unavailable');
    }
  };
  const harnessPasswordLogin =
    options.testHarnessPasswordLogin === true &&
    options.testAccess === undefined &&
    options.emailOtp === undefined;
  if (options.testHarnessPasswordLogin && !harnessPasswordLogin)
    throw new Error('Test-harness password login cannot be combined with runtime auth modes');
  const emailOtpChallenges = options.emailOtp ? new EmailOtpChallenges(database.pool) : undefined;
  const emailChangeRequests = options.emailOtp ? new EmailChangeRequests(database.pool) : undefined;
  const registrationPolicy = options.registrationPolicy
    ? z
        .object({
          termsVersion: z.string().trim().min(1).max(128),
          termsUrl: z
            .string()
            .url()
            .refine((value) => new URL(value).protocol === 'https:'),
          privacyVersion: z.string().trim().min(1).max(128),
          privacyUrl: z
            .string()
            .url()
            .refine((value) => new URL(value).protocol === 'https:'),
          marketingVersion: z.string().trim().min(1).max(128),
        })
        .parse(options.registrationPolicy)
    : undefined;
  const registrationAvailable =
    options.registrationEnabled === true &&
    (options.testAccess === undefined || options.testAccess.mode === 'disabled') &&
    options.emailOtp !== undefined &&
    registrationPolicy !== undefined;
  const market = new MarketRepository(database.pool);
  const profiles = new ProfileRepository(database);
  const leads = new LeadRepository(database);
  const interviews = new InterviewRepository(database);
  const notifications = new InAppNotificationRepository(database);
  const uploads = new ResumeUploadRepository(database);
  const coordinator = options.resumeStorage
    ? new ResumeUploadCoordinator(uploads, options.resumeStorage)
    : undefined;
  const streams = new Map<AbortController, string>();
  const app = Fastify({
    bodyLimit: 16_384,
    requestTimeout: 15_000,
    connectionTimeout: 10_000,
    // Caddy is the only published service and the API shares its network
    // namespace, so the immediate peer can only be loopback. Trust the
    // forwarded client address from that peer; direct callers cannot reach the
    // API port and a spoofed header from any other peer is ignored.
    trustProxy: (address) => address === '127.0.0.1' || address === '::1',
    logController: new LogController({ disableRequestLogging: true }),
    genReqId: () => randomUUID(),
    logger: {
      level: 'info',
      redact: [
        'req.headers.cookie',
        'req.headers.authorization',
        'req.headers.x-careerscope-staging-key',
        'password',
        'token',
        'sessionId',
        'session_id',
      ],
    },
  });
  await app.register(cookie);
  await app.register(helmet, {
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
  });
  app.decorateRequest('ownerId', null);
  app.addHook('preClose', async () => {
    for (const controller of streams.keys()) controller.abort();
  });
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const path = request.routeOptions.url;
    if (path === '/api/health') return;
    if (
      options.testAccess &&
      options.testAccess.mode !== 'disabled' &&
      !testAccessAllowed(
        options.testAccess,
        request.raw.socket.remoteAddress ?? '',
        request.headers['x-careerscope-staging-key'],
      )
    )
      throw new HttpError(403, 'Private test access required');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.headers.origin !== origin) {
      throw new HttpError(403, 'Origin denied');
    }
    if (
      path === '/api/login' ||
      path === '/api/register' ||
      path === '/api/otp/request' ||
      path === '/api/otp/verify' ||
      (request.method === 'POST' && path === '/api/session/refresh')
    )
      return;
    const session = await auth.session(request.cookies[sessionCookie]);
    if (path === '/api/session') return;
    // CS-57: logging out is the one mutation that must succeed with no
    // session. Origin was already enforced above, and a caller with no
    // session has nothing to CSRF away, so answering identically whether or
    // not the cookie named a live session keeps the route non-enumerating
    // instead of turning "no cookie" into a 401 (or, with the old non-null
    // assertion in the handler, a 500).
    //
    // METHOD-QUALIFIED DELIBERATELY (Security review P3, 2026-09-25). Only
    // POST /api/logout is registered today, so matching on the path alone was
    // inert — but it was a trapdoor: a future `app.get('/api/logout')`, the
    // obvious way someone would add a plain sign-out link, would silently
    // inherit anonymity AND skip the Origin check above, which excludes GET.
    // The method term costs nothing and removes that.
    if (!session && request.method === 'POST' && path === '/api/logout') return;
    if (!session) throw new HttpError(401, 'Authentication required');
    request.ownerId = session.ownerId;
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      !auth.validCsrf(session.csrf, request.headers['x-csrf-token'])
    ) {
      throw new HttpError(403, 'CSRF check failed');
    }
  });
  // Correlation without private data: route templates only, never URLs or bodies.
  app.addHook('onResponse', async (request, reply) => {
    if (request.routeOptions.url === '/api/health') return;
    const record = {
      requestId: request.id,
      method: request.method,
      route: request.routeOptions.url ?? 'unmatched',
      status: reply.statusCode,
      durationMs: Math.round(reply.elapsedTime),
      authenticated: request.ownerId !== null,
    };
    if (reply.statusCode >= 500) app.log.error(record, 'Request failed');
    else if (reply.statusCode >= 400) app.log.warn(record, 'Request rejected');
    else app.log.info(record, 'Request completed');
  });
  // CS-35: distinct, actionable messages per stable Conflict.code, not one
  // "Idempotency conflict" string for every 409. 'CONFLICT' (the default
  // code for internal/worker-only invariants not given a specific one) and
  // any code this table does not recognise fall back to the same safe
  // generic message a client cannot rely on for anything more specific -
  // never expose the raw internal Error.message for those, since it is not
  // a stable, client-facing contract.
  const conflictMessages: Record<string, string> = {
    PROFILE_REVISION_CONFLICT: 'Record changed; reload before saving',
    LEAD_REVISION_CONFLICT: 'Record changed; reload before saving',
    INTERVIEW_REVISION_CONFLICT: 'Interview round changed; reload before saving',
    PROFILE_NOT_SAVED: 'Save your profile before enabling this option',
    MISSING_TARGET_ROLES: 'Add target roles to your profile before starting this search',
    IDEMPOTENCY_KEY_REUSED: 'This request already completed with different details; try again',
    UPLOAD_CANCELLED: 'This upload was already cancelled',
    UPLOAD_NOT_CANCELLABLE: 'This upload can no longer be cancelled',
    UPLOAD_VERSION_CONFLICT: 'This upload changed; refresh and try again',
  };
  app.setErrorHandler((error, request, reply) => {
    const frameworkStatus =
      error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
    const status =
      error instanceof z.ZodError || error instanceof InvalidResumeUpload
        ? 400
        : error instanceof ResumeStorageLimit
          ? 507
          : error instanceof Conflict
            ? 409
            : error instanceof HttpError
              ? error.statusCode
              : frameworkStatus === 413
                ? 413
                : frameworkStatus === 400
                  ? 400
                  : 500;
    if (status === 500) request.log.error({ requestId: request.id }, 'Request failed');
    const messages: Record<number, string> = {
      400: 'Invalid request',
      409:
        error instanceof Conflict
          ? (conflictMessages[error.code] ?? 'Idempotency conflict')
          : 'Idempotency conflict',
      413: 'Request too large',
      500: 'Service unavailable',
      507: 'Resume storage capacity reached',
    };
    const fallbackMessage = messages[status] ?? 'Request failed';
    const message = error instanceof HttpError ? error.message : fallbackMessage;
    const code = status === 409 && error instanceof Conflict ? error.code : undefined;
    reply.code(status).send({ error: message, ...(code ? { code } : {}), requestId: request.id });
  });
  await registerOpenApi(app, version, {
    testUsers: options.testAccess !== undefined && options.testAccess.mode !== 'disabled',
    harnessPasswordLogin,
    emailOtpEnabled: options.emailOtp !== undefined,
    registrationEnabled: registrationAvailable,
    registrationPolicy,
    resumes: !!coordinator,
    cancellation: !!options.resumeStorage?.cancelUpload,
  });
  app.get('/api/health', async (request) => {
    try {
      await database.pool.query('SELECT 1');
      await options.readiness?.();
    } catch {
      request.log.error({ requestId: request.id }, 'Critical readiness dependency unavailable');
      throw new HttpError(503, 'Service temporarily unavailable');
    }
    return { status: 'ok', version };
  });
  app.get('/api/session', async (request) => {
    const session = await auth.session(request.cookies[sessionCookie]);
    if (!session) {
      return {
        authenticated: false,
        registrationEnabled: registrationAvailable,
        legalDocuments: registrationAvailable
          ? {
              termsVersion: registrationPolicy!.termsVersion,
              termsUrl: registrationPolicy!.termsUrl,
              privacyVersion: registrationPolicy!.privacyVersion,
              privacyUrl: registrationPolicy!.privacyUrl,
            }
          : undefined,
        emailOtpEnabled: options.emailOtp !== undefined,
        testUsersEnabled:
          options.testAccess?.mode === 'local' || options.testAccess?.mode === 'proxy',
        testAccounts:
          options.testAccess && options.testAccess.mode !== 'disabled'
            ? testUsers.map(({ email, role }) => ({ email, role }))
            : [],
      };
    }
    // Returning the owner's own email to their own authenticated session is
    // not a privacy leak (never used for anything but a real initials
    // avatar on the Dashboard, CS-49) - deliberately not joined into
    // Auth.session() itself, which many other routes rely on staying minimal.
    const owner = await database.pool.query<{
      email: string | null;
      email_verified_at: Date | null;
    }>('SELECT email, email_verified_at FROM users WHERE id = $1', [session.ownerId]);
    return {
      authenticated: true,
      csrf: session.csrf,
      sessionId: session.sessionId,
      email: owner.rows[0]?.email,
      emailVerifiedAt: owner.rows[0]?.email_verified_at?.toISOString() ?? null,
      emailOtpEnabled: options.emailOtp !== undefined,
      testUser: options.testAccess
        ? testUsers.find((user) => user.id === session.ownerId)?.role
        : undefined,
      // CS-61: a stable per-owner value the client can put INSIDE its cache
      // keys. React Query keys such as ['leads', status] carry no owner, which
      // is precisely why one owner's cached response can be handed to the next
      // owner signed in to the same tab. Keying every owner-scoped query on
      // this makes that bug class unrepresentable rather than merely tested
      // for — four separate test designs failed to catch it.
      //
      // A DIGEST, deliberately, not `session.ownerId`. The client needs to
      // tell owners apart, nothing more. Every route derives ownerId from the
      // session and never from input, and publishing the raw id would put the
      // one value that must never be client-supplied into client hands. The
      // digest is stable across logins of the same owner (so an owner keeps
      // their own cache) and unequal between owners, which is the whole
      // contract. It is NOT derived from the session token: a per-session
      // value would churn the cache on every sign-in for no extra isolation.
      owner: createHash('sha256').update(`owner:${session.ownerId}`).digest('hex'),
      aiEnabled: false,
    };
  });
  app.post('/api/register', async () => {
    // Password-based account creation is a compatibility artifact, not a
    // supported product flow. Registration is exclusively the guarded,
    // verified-email OTP path below.
    throw new HttpError(404, 'Registration unavailable');
  });
  app.post('/api/otp/request', async (request, reply) => {
    if (!emailOtpChallenges || !options.emailOtp) throw new HttpError(404, 'Sign-in unavailable');
    const input = otpRequestSchema.parse(request.body);
    const intent = input.intent ?? 'sign-in';
    if (intent === 'sign-up' && !registrationAvailable)
      throw new HttpError(404, 'Registration unavailable');
    const email = input.email.toLowerCase();
    const emailHash = hashOtpEmail(email, options.emailOtp.secret);
    const ipHash = createHash('sha256').update(request.ip).digest('hex');
    let ipAllowed: boolean;
    try {
      ipAllowed = await rateLimit(`otp:request:ip:${ipHash}`, 10, 3600);
    } catch {
      request.log.error({ requestId: request.id }, 'OTP abuse protection unavailable');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    if (!ipAllowed) throw new HttpError(429, 'Too many requests. Try again later.');

    let emailAllowed: boolean;
    try {
      const limits = await Promise.all([
        rateLimit(`otp:request:email-cooldown:${emailHash}`, 1, 60),
        rateLimit(`otp:request:email-hour:${emailHash}`, 5, 3600),
        rateLimit(`otp:request:email-day:${emailHash}`, 10, 86400),
      ]);
      emailAllowed = limits.every(Boolean);
    } catch {
      request.log.error({ requestId: request.id }, 'OTP abuse protection unavailable');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }

    // Email-specific throttling is deliberately hidden behind the exact same
    // accepted response. A caller cannot distinguish a known account, an
    // unknown address, or an address still in cooldown.
    if (!emailAllowed)
      return reply.code(202).send({
        message: 'If the request can be completed, check your inbox for a verification code.',
        expiresInSeconds: emailOtpLifetimeMs / 1000,
        resendAfterSeconds: 60,
      });

    const id = randomUUID();
    const otp = createEmailOtp(id, options.emailOtp.secret);
    try {
      await emailOtpChallenges.replaceActive(
        {
          id,
          email,
          digest: otp.digest,
          expiresAt: otp.expiresAt,
          intent,
          ...(intent === 'sign-up'
            ? {
                termsVersion: registrationPolicy!.termsVersion,
                privacyVersion: registrationPolicy!.privacyVersion,
                marketingOptIn: input.marketingOptIn === true,
                ...(input.marketingOptIn
                  ? { marketingVersion: registrationPolicy!.marketingVersion }
                  : {}),
              }
            : {}),
        },
        options.emailOtp.secret,
      );
    } catch {
      request.log.error({ requestId: request.id }, 'OTP challenge persistence failed');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    try {
      await options.emailOtp.provider.send({ email, code: otp.code, idempotencyKey: id });
    } catch {
      try {
        await emailOtpChallenges.invalidate(id, email, options.emailOtp.secret);
      } catch {
        request.log.error({ requestId: request.id }, 'Failed to invalidate undelivered OTP');
      }
      request.log.warn({ requestId: request.id }, 'OTP provider unavailable');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    return reply.code(202).send({
      message: 'If the request can be completed, check your inbox for a verification code.',
      expiresInSeconds: emailOtpLifetimeMs / 1000,
      resendAfterSeconds: 60,
    });
  });
  app.post('/api/otp/verify', async (request, reply) => {
    if (!emailOtpChallenges || !options.emailOtp) throw new HttpError(404, 'Sign-in unavailable');
    const {
      email: suppliedEmail,
      code,
      intent: suppliedIntent,
    } = otpVerifySchema.parse(request.body);
    const intent = suppliedIntent ?? 'sign-in';
    if (intent === 'sign-up' && !registrationAvailable)
      throw new HttpError(404, 'Registration unavailable');
    const email = suppliedEmail.toLowerCase();
    const emailHash = hashOtpEmail(email, options.emailOtp.secret);
    const ipHash = createHash('sha256').update(request.ip).digest('hex');
    let allowed: boolean;
    try {
      const limits = await Promise.all([
        rateLimit(`otp:verify:ip:${ipHash}`, 30, 600),
        rateLimit(`otp:verify:email:${emailHash}`, 5, 600),
      ]);
      allowed = limits.every(Boolean);
    } catch {
      request.log.error({ requestId: request.id }, 'OTP abuse protection unavailable');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    if (!allowed) throw new HttpError(429, 'Too many attempts. Request a new code later.');

    let challengeId: string | null;
    try {
      challengeId = await emailOtpChallenges.activeId(email, options.emailOtp.secret);
    } catch {
      request.log.error({ requestId: request.id }, 'OTP challenge store unavailable');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    let verification;
    try {
      if (!challengeId) {
        verification = 'invalid';
      } else if (intent === 'sign-up') {
        let finalized: Awaited<ReturnType<Auth['createOtpAccountInTransaction']>> | undefined;
        verification = await emailOtpChallenges.consume({
          id: challengeId,
          email,
          code,
          secret: options.emailOtp.secret,
          expectedIntent: 'sign-up',
          onAccepted: async (client, challenge) => {
            if (
              !challenge.termsVersion ||
              !challenge.privacyVersion ||
              challenge.termsVersion !== registrationPolicy?.termsVersion ||
              challenge.privacyVersion !== registrationPolicy?.privacyVersion ||
              (challenge.marketingOptIn &&
                challenge.marketingVersion !== registrationPolicy?.marketingVersion)
            )
              throw new Error('OTP signup policy version does not match current configuration');
            finalized = await auth.createOtpAccountInTransaction(
              client,
              email,
              {
                termsVersion: challenge.termsVersion,
                privacyVersion: challenge.privacyVersion,
                marketingOptIn: challenge.marketingOptIn === true,
                marketingVersion: challenge.marketingVersion,
              },
              {
                accessToken: request.cookies[sessionCookie],
                refreshToken: request.cookies[refreshCookie],
              },
              deviceName(
                typeof request.headers['user-agent'] === 'string'
                  ? request.headers['user-agent']
                  : undefined,
              ),
            );
          },
        });
        if (verification === 'accepted') {
          if (!finalized) throw new HttpError(503, 'Sign-in is temporarily unavailable');
          setSessionCookies(reply, finalized, new URL(origin).protocol === 'https:');
          return { authenticated: true };
        }
      } else {
        verification = await emailOtpChallenges.consume({
          id: challengeId,
          email,
          code,
          secret: options.emailOtp.secret,
          expectedIntent: 'sign-in',
        });
      }
    } catch {
      request.log.error({ requestId: request.id }, 'OTP challenge verification unavailable');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    if (verification !== 'accepted')
      throw new HttpError(401, 'Invalid or expired verification code');

    let credentials;
    try {
      credentials = await auth.loginWithVerifiedEmail(
        email,
        {
          accessToken: request.cookies[sessionCookie],
          refreshToken: request.cookies[refreshCookie],
        },
        deviceName(
          typeof request.headers['user-agent'] === 'string'
            ? request.headers['user-agent']
            : undefined,
        ),
      );
    } catch {
      request.log.error({ requestId: request.id }, 'OTP session establishment failed');
      throw new HttpError(503, 'Sign-in is temporarily unavailable');
    }
    if (!credentials) throw new HttpError(401, 'Invalid or expired verification code');
    setSessionCookies(reply, credentials, new URL(origin).protocol === 'https:');
    return { authenticated: true };
  });
  app.post('/api/account/email-change/request', async (request, reply) => {
    if (!emailChangeRequests || !options.emailOtp)
      throw new HttpError(404, 'Email change is unavailable');
    const { newEmail } = emailChangeRequestSchema.parse(request.body);
    const ipHash = createHash('sha256').update(request.ip).digest('hex');
    const targetHash = hashOtpEmail(newEmail, options.emailOtp.secret);
    let allowed: boolean;
    try {
      allowed = (
        await Promise.all([
          rateLimit(`email-change:request:owner:${request.ownerId!}`, 3, 3600),
          rateLimit(`email-change:request:ip:${ipHash}`, 10, 3600),
          rateLimit(`email-change:request:target:${targetHash}`, 5, 3600),
        ])
      ).every(Boolean);
    } catch {
      request.log.error({ requestId: request.id }, 'Email-change abuse protection unavailable');
      throw new HttpError(503, 'Email change is temporarily unavailable');
    }
    if (!allowed) throw new HttpError(429, 'Too many requests. Try again later.');

    let challenge;
    try {
      challenge = await emailChangeRequests.begin(
        request.ownerId!,
        newEmail,
        options.emailOtp.secret,
      );
    } catch {
      request.log.error({ requestId: request.id }, 'Email-change challenge creation failed');
      throw new HttpError(503, 'Email change is temporarily unavailable');
    }
    if (!challenge) throw new HttpError(400, 'Choose a different email address');
    try {
      await Promise.all([
        options.emailOtp.provider.send({
          email: challenge.currentEmail,
          code: challenge.currentCode,
          idempotencyKey: challenge.currentChallengeId,
          purpose: 'email-change-current',
        }),
        options.emailOtp.provider.send({
          email: challenge.newEmail,
          code: challenge.newCode,
          idempotencyKey: challenge.newChallengeId,
          purpose: 'email-change-new',
        }),
      ]);
    } catch {
      try {
        await emailChangeRequests.cancel(request.ownerId!, challenge.requestId);
      } catch {
        request.log.error(
          { requestId: request.id },
          'Failed to invalidate undelivered email change',
        );
      }
      request.log.warn({ requestId: request.id }, 'Email-change code delivery unavailable');
      throw new HttpError(503, 'Email change is temporarily unavailable');
    }
    return reply.code(202).send({
      message: 'Verification codes were requested for the current and new email addresses.',
      expiresInSeconds: emailOtpLifetimeMs / 1000,
    });
  });
  app.post('/api/account/email-change/verify', async (request) => {
    if (!emailChangeRequests || !options.emailOtp)
      throw new HttpError(404, 'Email change is unavailable');
    const input = emailChangeVerifySchema.parse(request.body);
    const ipHash = createHash('sha256').update(request.ip).digest('hex');
    let allowed: boolean;
    try {
      allowed = (
        await Promise.all([
          rateLimit(`email-change:verify:owner:${request.ownerId!}`, 10, 600),
          rateLimit(`email-change:verify:ip:${ipHash}`, 30, 600),
        ])
      ).every(Boolean);
    } catch {
      request.log.error({ requestId: request.id }, 'Email-change abuse protection unavailable');
      throw new HttpError(503, 'Email change is temporarily unavailable');
    }
    if (!allowed) throw new HttpError(429, 'Too many attempts. Try again later.');

    let result;
    try {
      result = await emailChangeRequests.verify({
        ownerId: request.ownerId!,
        address: input.address,
        code: input.code,
        secret: options.emailOtp.secret,
      });
    } catch {
      request.log.error({ requestId: request.id }, 'Email-change verification unavailable');
      throw new HttpError(503, 'Email change is temporarily unavailable');
    }
    if (result === 'conflict') throw new HttpError(409, 'Email address could not be changed');
    if (!['accepted', 'already-verified', 'completed'].includes(result))
      throw new HttpError(401, 'Invalid or expired verification code');
    return { verified: input.address, emailChanged: result === 'completed' };
  });
  app.post('/api/login', async (request, reply) => {
    if (options.testAccess?.mode === 'disabled' || (!options.testAccess && !harnessPasswordLogin))
      throw new HttpError(404, 'Password sign-in is unavailable');
    const key = createHash('sha256').update(request.ip).digest('hex');
    if (!(await consumeRateLimit(request, `login:${key}`, 10, 60)))
      throw new HttpError(429, 'Too many attempts');
    const previous = {
      accessToken: request.cookies[sessionCookie],
      refreshToken: request.cookies[refreshCookie],
    };
    const device = deviceName(
      typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : undefined,
    );
    let credentials;
    if (harnessPasswordLogin) {
      const input = harnessPasswordLoginSchema.parse(request.body);
      credentials = await auth.loginSession(input.email, input.password, previous, device);
    } else {
      credentials = await auth.testLoginSession(
        loginSchema.parse(request.body).email,
        previous,
        device,
      );
    }
    if (!credentials)
      throw new HttpError(
        401,
        harnessPasswordLogin ? 'Invalid credentials' : 'Test account unavailable',
      );
    setSessionCookies(reply, credentials, new URL(origin).protocol === 'https:');
    return { authenticated: true };
  });
  app.post('/api/logout', async (request, reply) => {
    // CS-57: the onRequest hook does not guarantee a cookie on this path, so
    // the token is checked rather than asserted. With no token there is no
    // session to destroy; the cookie is still cleared and the same body is
    // returned, so the response reveals nothing about whether one existed.
    //
    // NOT RATE LIMITED — deliberately, and recorded as an open finding rather
    // than an oversight. The 2026-09-25 Security review is right that exempting
    // logout from the session requirement made it the only unauthenticated
    // WRITE path in the API (a SELECT plus a DELETE per call).
    //
    // A `logout:<sha256(request.ip)>` limiter at 30/60 was implemented and then
    // REVERTED, because it broke a property that matters more than the finding
    // it fixed: database.test.ts deliberately exhausts the LOGIN limiter and
    // then asserts logout still returns 200 — being locked out of signing in
    // must not lock you out of signing out. The limiter turned that into a 429.
    //
    // The deeper problem is the keying, and it is why the number was not simply
    // raised. `trustProxy: false` above (correctly) makes `request.ip` the real
    // peer, but the deployed topology puts Caddy in front of the API, so every
    // request arrives from one address and a per-IP limit is effectively a
    // GLOBAL one. Choosing a number big enough to stop the test failing would
    // have been tuning to green, not designing a control. The fix needs a key
    // that is not the client IP, and that is its own ticket.
    await auth.logout(request.cookies[sessionCookie], request.cookies[refreshCookie]);
    clearSessionCookies(reply);
    return { authenticated: false };
  });
  app.post('/api/session/refresh', async (request, reply) => {
    const result = await auth.refresh(request.cookies[refreshCookie]);
    if (result.status === 'reused') {
      request.log.warn(
        { requestId: request.id },
        'Refresh-token reuse detected; session family revoked',
      );
      clearSessionCookies(reply);
      throw new HttpError(401, 'Authentication required');
    }
    if (result.status === 'invalid') {
      clearSessionCookies(reply);
      throw new HttpError(401, 'Authentication required');
    }
    setSessionCookies(reply, result.credentials, new URL(origin).protocol === 'https:');
    return {
      authenticated: true,
      csrf: auth.csrfForAccessToken(result.credentials.accessToken),
    };
  });
  app.get('/api/account/sessions', async (request) => {
    const current = await auth.session(request.cookies[sessionCookie]);
    if (!current) throw new HttpError(401, 'Authentication required');
    return { sessions: await auth.listSessions(request.ownerId!, current.sessionId) };
  });
  app.delete('/api/account/sessions/:id', async (request, reply) => {
    if (!(await consumeRateLimit(request, `session-revoke:${request.ownerId!}`, 10, 3600)))
      throw new HttpError(429, 'Too many attempts');
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const current = await auth.session(request.cookies[sessionCookie]);
    await auth.revokeSession(request.ownerId!, id);
    if (current?.sessionId === id) clearSessionCookies(reply);
    return reply.code(204).send();
  });
  app.post('/api/account/sessions/revoke-others', async (request, reply) => {
    if (!(await consumeRateLimit(request, `sessions:${request.ownerId!}`, 5, 3600)))
      throw new HttpError(429, 'Too many attempts');
    z.object({}).strict().parse(request.body);
    if (!(await auth.revokeOtherSessions(request.ownerId!, request.cookies[sessionCookie]!)))
      throw new HttpError(401, 'Authentication required');
    return reply.code(204).send();
  });
  app.get('/api/account/marketing-consent', async (request) => {
    const current = await database.pool.query<{ version: string; accepted: boolean }>(
      `SELECT version, accepted FROM account_acceptances
       WHERE owner_id = $1 AND document = 'marketing'
       ORDER BY sequence DESC LIMIT 1`,
      [request.ownerId!],
    );
    return {
      optedIn: current.rows[0]?.accepted ?? false,
      version: current.rows[0]?.version ?? null,
    };
  });
  app.post('/api/account/marketing-consent', async (request) => {
    if (!(await consumeRateLimit(request, `marketing-consent:${request.ownerId!}`, 20, 3600)))
      throw new HttpError(429, 'Too many attempts');
    const { optIn } = z.object({ optIn: z.boolean() }).strict().parse(request.body);
    const client = await database.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [request.ownerId!]);
      const current = await client.query<{ version: string; accepted: boolean }>(
        `SELECT version, accepted FROM account_acceptances
         WHERE owner_id = $1 AND document = 'marketing'
         ORDER BY sequence DESC LIMIT 1`,
        [request.ownerId!],
      );
      const previous = current.rows[0];
      if ((previous?.accepted ?? false) !== optIn) {
        const version = optIn ? registrationPolicy?.marketingVersion : previous?.version;
        if (!version) throw new HttpError(404, 'Marketing preferences unavailable');
        await client.query(
          `INSERT INTO account_acceptances (id, owner_id, document, version, accepted)
           VALUES ($1, $2, 'marketing', $3, $4)`,
          [randomUUID(), request.ownerId!, version, optIn],
        );
      }
      await client.query('COMMIT');
      return { optedIn: optIn };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });
  app.post('/api/account/password', async (request, reply) => {
    if (options.testAccess)
      throw new HttpError(404, 'Password management unavailable in test mode');
    if (!(await consumeRateLimit(request, `password:${request.ownerId!}`, 5, 3600)))
      throw new HttpError(429, 'Too many attempts');
    const input = z
      .object({
        currentPassword: z.string().min(12).max(256),
        newPassword: z.string().min(12).max(256),
      })
      .strict()
      .parse(request.body);
    const changed = await auth.changePassword(
      request.ownerId!,
      input.currentPassword,
      input.newPassword,
    );
    if (!changed) throw new HttpError(400, 'Password could not be changed');
    clearSessionCookies(reply);
    return reply.code(204).send();
  });
  await app.register(async (resumes) => {
    resumes.addContentTypeParser(
      'application/octet-stream',
      { parseAs: 'buffer', bodyLimit: maximumResumeBytes },
      (_request, body, done) => done(null, body),
    );
    resumes.get('/api/resumes', async (request) => {
      if (!coordinator) return { enabled: false, items: [] };
      const result = await database.pool.query(
        `SELECT upload.id, upload.bytes, upload.content_type AS "contentType",
         upload.created_at AS "createdAt", COALESCE(result.status, upload.status) AS status
         FROM resume_uploads upload LEFT JOIN resume_results result
         ON result.upload_id = upload.id AND result.owner_id = upload.owner_id
         WHERE upload.owner_id = $1 ORDER BY upload.created_at DESC, upload.id DESC LIMIT 50`,
        [request.ownerId],
      );
      return {
        enabled: true,
        cancellationEnabled: !!options.resumeStorage?.cancelUpload,
        items: result.rows,
      };
    });
    resumes.post(
      '/api/resumes',
      {
        bodyLimit: maximumResumeBytes,
        onRequest: async (request) => {
          if (!coordinator) throw new HttpError(503, 'Resume uploads unavailable');
          if (!(await consumeRateLimit(request, `upload:${request.ownerId!}`, 5, 3600)))
            throw new HttpError(429, 'Too many uploads');
        },
      },
      async (request, reply) => {
        if (!Buffer.isBuffer(request.body))
          throw new HttpError(400, 'A PDF or DOCX file is required');
        const controller = new AbortController();
        const abort = () => controller.abort();
        request.raw.once('aborted', abort);
        try {
          const upload = await coordinator!.upload(
            request.ownerId!,
            idempotencyKey.parse(request.headers['idempotency-key']),
            request.body,
            controller.signal,
          );
          if (!upload) throw new HttpError(409, 'Upload changed; retry');
          return reply.code(202).send({ id: upload.id, status: upload.status });
        } finally {
          request.raw.removeListener('aborted', abort);
        }
      },
    );
    resumes.get('/api/resumes/:id', async (request) => {
      if (!coordinator) throw new HttpError(503, 'Resume uploads unavailable');
      const { id } = identifier.parse(request.params);
      const upload = await uploads.get(request.ownerId!, id);
      if (!upload) throw new HttpError(404, 'Resume not found');
      const result = await uploads.result(request.ownerId!, id);
      return { id, status: result?.status ?? upload.status, result };
    });
    resumes.post('/api/resumes/:id/recover', async (request, reply) => {
      if (!coordinator) throw new HttpError(503, 'Resume uploads unavailable');
      if (!(await consumeRateLimit(request, `resume-recover:${request.ownerId!}`, 10, 3600)))
        throw new HttpError(429, 'Too many attempts');
      const { id } = identifier.parse(request.params);
      const controller = new AbortController();
      const abort = () => {
        if (!reply.raw.writableEnded) controller.abort();
      };
      reply.raw.once('close', abort);
      try {
        const record = await coordinator.reconcile(request.ownerId!, id, controller.signal);
        if (!record) throw new HttpError(404, 'Resume not found');
        return { id: record.id, status: record.status };
      } finally {
        reply.raw.removeListener('close', abort);
      }
    });
    resumes.post('/api/resumes/:id/cancel', async (request, reply) => {
      const storage = options.resumeStorage;
      if (!storage?.cancelUpload) throw new HttpError(503, 'Upload cancellation unavailable');
      if (!(await consumeRateLimit(request, `resume-cancel:${request.ownerId!}`, 20, 60)))
        throw new HttpError(429, 'Too many requests');
      const { id } = identifier.parse(request.params);
      if (request.body !== undefined) z.object({}).strict().parse(request.body);
      const controller = new AbortController();
      const abort = () => {
        if (!reply.raw.writableEnded) controller.abort();
      };
      reply.raw.once('close', abort);
      try {
        const record = await uploads.cancelUpload(
          request.ownerId!,
          id,
          storage.bucket,
          async (upload) => {
            await storage.cancelUpload!(
              {
                ownerId: upload.ownerId,
                resumeId: upload.id,
                sha256: upload.sha256,
                bytes: upload.bytes,
                contentType: upload.contentType,
              },
              AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
            );
          },
        );
        if (!record) throw new HttpError(404, 'Resume not found');
        return { id: record.id, status: record.status };
      } finally {
        reply.raw.removeListener('close', abort);
      }
    });
    resumes.delete('/api/resumes/:id', async (request, reply) => {
      if (!options.resumeStorage) throw new HttpError(503, 'Resume uploads unavailable');
      if (!(await consumeRateLimit(request, `resume-delete:${request.ownerId!}`, 20, 60)))
        throw new HttpError(429, 'Too many requests');
      const { id } = identifier.parse(request.params);
      await uploads.deleteSettled(request.ownerId!, id, async (record) => {
        if (record.bucket !== options.resumeStorage!.bucket || !record.objectVersion)
          throw new HttpError(409, 'Resume storage changed');
        await options.resumeStorage!.delete(
          {
            ownerId: record.ownerId,
            resumeId: record.id,
            sha256: record.sha256,
            bytes: record.bytes,
            contentType: record.contentType,
          },
          record.objectVersion,
          AbortSignal.timeout(15000),
        );
      });
      return reply.code(204).send();
    });
  });
  // CS-55: the eleven authenticated GET routes below had no budget at all,
  // while every other route on this app has one. They are owner-keyed like the
  // seventeen existing owner-scoped limiters, NOT IP-keyed - which is what
  // makes them implementable without waiting on CS-59: `request.ip` is exactly
  // 127.0.0.1 for every production request (the proxy shares the API's network
  // namespace and Caddy strips X-Forwarded-For), so an IP key here would be a
  // global limit shared by every reader. `request.ownerId` is taken from the
  // session and never from input, so the bucket cannot be chosen by a caller.
  //
  // The budgets are deliberately far above the client's real polling rate
  // rather than tuned to it. The Jobs page polls /api/searches every 5s (12
  // per minute) unconditionally and /api/searches/:id every 10s while a run is
  // active, and an owner may have several tabs open; a budget that a normal
  // session could reach is a budget that will be raised the first time it
  // fires, which is how a control becomes decoration. These bound the damage a
  // runaway client or a stolen session can do - they are not a tuning knob.
  const readBudget = async (request: FastifyRequest, bucket: string, limit: number) => {
    if (!(await consumeRateLimit(request, `${bucket}:${request.ownerId!}`, limit, 60)))
      throw new HttpError(429, 'Too many requests');
  };
  app.get('/api/profile', async (request) => {
    await readBudget(request, 'profile-read', 120);
    return (
      (await profiles.get(request.ownerId!)) ?? {
        revision: 0,
        profile: null,
        updatedAt: null,
        scheduledDiscoveryEnabled: false,
      }
    );
  });
  app.get('/api/preparation', async (request) => {
    z.object({}).strict().parse(request.query);
    if (!(await consumeRateLimit(request, `preparation:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many preparation requests');
    return prepareProfile(await profiles.get(request.ownerId!));
  });
  app.put('/api/profile', async (request) => {
    if (!(await consumeRateLimit(request, `profile:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many profile updates');
    return profiles.save(request.ownerId!, request.body);
  });
  // CS-26: a distinct endpoint from PUT /api/profile on purpose - enabling or
  // disabling unattended discovery is not an edit to profile revision 0..N
  // candidate data, and must never be blocked by (or consume) a profile
  // revision conflict. No UI wires this yet (frontend work is paused
  // pending design); the owner can enable it directly via this endpoint.
  app.put('/api/profile/scheduled-discovery', async (request) => {
    if (!(await consumeRateLimit(request, `profile:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many profile updates');
    const { enabled } = z.object({ enabled: z.boolean() }).strict().parse(request.body);
    const scheduledDiscoveryEnabled = await profiles.setScheduledDiscoveryEnabled(
      request.ownerId!,
      enabled,
    );
    return { scheduledDiscoveryEnabled };
  });
  // Market evidence. Read-only, owner-scoped, derived entirely from what this
  // owner's own searches have already seen — no shared corpus, no other user's
  // data, nothing inferred.
  app.get('/api/market/postings', async (request) => {
    await readBudget(request, 'market-read', 120);
    const query = request.query as Record<string, unknown>;
    return { entries: await market.stalePostings(request.ownerId!, { limit: query.limit }) };
  });

  app.get('/api/market/postings/:fingerprint', async (request) => {
    await readBudget(request, 'market-read', 120);
    const { fingerprint } = z
      .object({ fingerprint: z.string().min(1).max(256) })
      .parse(request.params);
    const evidence = await market.posting(request.ownerId!, fingerprint);
    if (!evidence) throw new HttpError(404, 'No sightings recorded for this posting');
    return evidence;
  });

  app.get('/api/market/companies', async (request) => {
    await readBudget(request, 'market-read', 120);
    const query = request.query as Record<string, unknown>;
    return { entries: await market.companies(request.ownerId!, { limit: query.limit }) };
  });

  app.get('/api/pipeline', async (request) => {
    await readBudget(request, 'market-read', 120);
    return market.pipeline(request.ownerId!);
  });

  app.get('/api/pipeline/stalled', async (request) => {
    await readBudget(request, 'market-read', 120);
    const query = request.query as Record<string, unknown>;
    return {
      entries: await market.stalled(request.ownerId!, { days: query.days, limit: query.limit }),
    };
  });

  app.get('/api/leads', async (request) => {
    await readBudget(request, 'leads-read', 240);
    return leads.list(request.ownerId!, request.query);
  });
  app.post('/api/leads', async (request) => {
    if (!(await consumeRateLimit(request, `leads:${request.ownerId!}`, 60, 60)))
      throw new HttpError(429, 'Too many lead updates');
    const lead = await leads.save(request.ownerId!, request.body);
    if (!lead) throw new HttpError(404, 'Completed job not found');
    return lead;
  });
  app.get('/api/leads/by-job/:jobId', async (request) => {
    await readBudget(request, 'leads-read', 240);
    const { jobId } = jobIdentifier.parse(request.params);
    return { lead: await leads.getByJob(request.ownerId!, jobId) };
  });
  app.get('/api/leads/:id', async (request) => {
    await readBudget(request, 'leads-read', 240);
    const { id } = identifier.parse(request.params);
    const lead = await leads.get(request.ownerId!, id);
    if (!lead) throw new HttpError(404, 'Lead not found');
    return lead;
  });
  app.get('/api/leads/:id/history', async (request) => {
    await readBudget(request, 'leads-read', 240);
    const { id } = identifier.parse(request.params);
    const history = await leads.history(request.ownerId!, id, request.query);
    if (!history) throw new HttpError(404, 'Lead not found');
    return history;
  });
  app.put('/api/leads/:id', async (request) => {
    const { id } = identifier.parse(request.params);
    if (!(await consumeRateLimit(request, `leads:${request.ownerId!}`, 60, 60)))
      throw new HttpError(429, 'Too many lead updates');
    const lead = await leads.update(request.ownerId!, id, request.body);
    if (!lead) throw new HttpError(404, 'Lead not found');
    return lead;
  });
  app.get('/api/leads/:id/interviews', async (request) => {
    await readBudget(request, 'interviews-read', 120);
    const { id } = identifier.parse(request.params);
    const items = await interviews.listForLead(request.ownerId!, id);
    if (!items) throw new HttpError(404, 'Application not found');
    return { items };
  });
  app.post('/api/leads/:id/interviews', async (request) => {
    const { id } = identifier.parse(request.params);
    if (!(await consumeRateLimit(request, `interviews:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many interview updates');
    const round = await interviews.create(request.ownerId!, id, request.body);
    if (!round) throw new HttpError(404, 'Application not found');
    return round;
  });
  app.put('/api/interviews/:id', async (request) => {
    const { id } = identifier.parse(request.params);
    if (!(await consumeRateLimit(request, `interviews:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many interview updates');
    const round = await interviews.update(request.ownerId!, id, request.body);
    if (!round) throw new HttpError(404, 'Interview round not found');
    return round;
  });
  app.get('/api/notifications', async (request) => {
    await readBudget(request, 'notifications-read', 120);
    return notifications.list(request.ownerId!);
  });
  app.put('/api/notifications/:id/read', async (request, reply) => {
    const { id } = identifier.parse(request.params);
    if (!(await consumeRateLimit(request, `notifications:${request.ownerId!}`, 60, 60)))
      throw new HttpError(429, 'Too many notification updates');
    if (!(await notifications.markRead(request.ownerId!, id)))
      throw new HttpError(404, 'Notification not found');
    return reply.code(204).send();
  });
  app.get('/api/job-sources', async (request) => {
    await readBudget(request, 'job-sources-read', 120);
    const sourcePermitted = options.sourcePermitted ?? isJobSourcePermittedForCandidateDiscovery;
    return {
      items: LAUNCH_JOB_SOURCE_CANDIDATES.map((source) => {
        const available = sourcePermitted(source);
        return {
          id: source,
          label: SOURCE_LABELS[source],
          available,
          unavailableReason: available ? null : JOB_SOURCE_PERMISSION_PENDING_MESSAGE,
        };
      }),
    };
  });
  app.post('/api/searches', async (request, reply) => {
    if (!(await consumeRateLimit(request, `search:${request.ownerId!}`, 10, 60)))
      throw new HttpError(429, 'Too many searches');
    const searchInput = createSearchSchema.parse(request.body);
    if (
      searchInput.sources.some(
        (source) => !(options.sourcePermitted ?? isJobSourcePermittedForCandidateDiscovery)(source),
      )
    )
      throw new HttpError(503, JOB_SOURCE_PERMISSION_PENDING_MESSAGE);
    const search = await database.createSearch(
      request.ownerId!,
      idempotencyKey.parse(request.headers['idempotency-key']),
      searchInput,
    );
    // Links the run to the request that created it for end-to-end tracing.
    request.log.info(
      { requestId: request.id, runId: search.id, status: search.status },
      'Search run created',
    );
    return reply.code(202).send({ runId: search.id, status: search.status });
  });
  app.get('/api/searches', async (request) => {
    await readBudget(request, 'searches-read', 240);
    const result = await database.pool.query(
      `SELECT id, request, status, created_at AS "createdAt"
      FROM search_runs WHERE owner_id = $1 ORDER BY created_at DESC, id DESC LIMIT 50`,
      [request.ownerId],
    );
    return { items: result.rows };
  });
  app.post('/api/searches/:id/cancel', async (request) => {
    const { id } = identifier.parse(request.params);
    if (!(await consumeRateLimit(request, `cancel:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many cancellations');
    const search = await database.cancelSearch(request.ownerId!, id);
    if (!search) throw new HttpError(404, 'Search not found');
    return { runId: search.id, status: search.status };
  });
  app.get('/api/searches/:id/export', async (request, reply) => {
    const { id } = identifier.parse(request.params);
    if (!(await consumeRateLimit(request, `export:${request.ownerId!}`, 30, 60)))
      throw new HttpError(429, 'Too many exports');
    const search = await database.getSearch(request.ownerId!, id);
    if (!search) throw new HttpError(404, 'Search not found');
    if (!['completed', 'partial'].includes(search.status))
      throw new HttpError(409, 'Search is not complete');
    const jobs = await database.pool.query(
      `SELECT data FROM search_jobs WHERE owner_id = $1 AND run_id = $2
       ORDER BY (data->'match'->>'score')::double precision DESC NULLS LAST, id LIMIT 100`,
      [request.ownerId, id],
    );
    return reply
      .header('Content-Disposition', `attachment; filename="careerscope-search-${id}.json"`)
      .type('application/json; charset=utf-8')
      .send({
        schemaVersion: 1,
        runId: id,
        status: search.status,
        sourceOutcomes: search.sourceOutcomes
          ? sourceOutcomesSchema.parse(search.sourceOutcomes)
          : null,
        request: createSearchSchema.parse(search.request),
        jobs: jobs.rows.map((row) => collectedJobSchema.strip().parse(row.data)),
      });
  });
  app.get('/api/searches/:id/events', async (request, reply) => {
    const { id } = identifier.parse(request.params);
    const query = z.object({ after: eventCursor.optional() }).strict().parse(request.query);
    let cursor = eventCursor.parse(request.headers['last-event-id'] ?? query.after ?? '0');
    const ownerId = request.ownerId!;
    // BUDGET BEFORE THE DATABASE, after parsing. This limiter used to sit
    // below the run lookup and the retained-window query, so a caller over
    // their budget still cost two queries per rejected attempt — the work the
    // limit exists to bound was done before the limit was consulted. Parsing
    // stays above it so malformed input is still a deterministic 400 rather
    // than a 429 that depends on how often the client has retried.
    if (!(await consumeRateLimit(request, `events:${ownerId}`, 30, 60)))
      throw new HttpError(429, 'Too many event streams');
    if (!(await database.getSearch(ownerId, id))) throw new HttpError(404, 'Search not found');
    // A cursor that predates the retained window means the client missed events,
    // which is recoverable by resynchronising rather than a client error.
    let resynchronise = false;
    if (cursor !== '0') {
      const known = await database.pool.query<{ retained: string | null }>(
        `SELECT
           (SELECT min(sequence)::text FROM run_events WHERE owner_id = $1 AND run_id = $2)
             AS retained,
           EXISTS (
             SELECT 1 FROM run_events
             WHERE owner_id = $1 AND run_id = $2 AND sequence = $3::bigint
           ) AS present`,
        [ownerId, id, cursor],
      );
      const row = known.rows[0] as unknown as { retained: string | null; present: boolean };
      if (!row?.present) {
        // No retained events at all also means the cursor expired: refusing it
        // would strand a client whose history was pruned entirely.
        if (!row?.retained || BigInt(cursor) < BigInt(row.retained)) {
          resynchronise = true;
          cursor = '0';
        } else {
          throw new HttpError(400, 'Invalid event cursor');
        }
      }
    }
    if (
      streams.size >= 32 ||
      [...streams.values()].filter((owner) => owner === ownerId).length >= 2
    )
      throw new HttpError(429, 'Too many event streams');
    const controller = new AbortController();
    streams.set(controller, ownerId);
    const timer = setTimeout(() => controller.abort(), 25_000);
    const close = () => controller.abort();
    const cleanup = () => {
      controller.abort();
      clearTimeout(timer);
      streams.delete(controller);
      reply.raw.off('close', close);
    };
    reply.raw.once('close', close);
    const body = Readable.from(
      (async function* () {
        try {
          yield 'retry: 2000\n\n';
          if (resynchronise) yield 'event: reset\ndata: {"reason":"cursor-expired"}\n\n';
          while (!controller.signal.aborted) {
            const session = await auth.session(request.cookies[sessionCookie]);
            if (!session || session.ownerId !== ownerId) {
              yield 'event: session-expired\ndata: {}\n\n';
              break;
            }
            const events = await database.pool.query<{
              cursor: string;
              type: string;
              createdAt: Date;
            }>(
              `SELECT sequence::text AS cursor, type, created_at AS "createdAt" FROM run_events
             WHERE owner_id = $1 AND run_id = $2 AND sequence > $3::bigint ORDER BY sequence LIMIT 50`,
              [ownerId, id, cursor],
            );
            controller.signal.throwIfAborted();
            for (const event of events.rows) {
              cursor = event.cursor;
              yield `id: ${cursor}\nevent: progress\ndata: ${JSON.stringify(event)}\n\n`;
              if (
                ['SearchCompleted', 'SearchPartial', 'SearchFailed', 'SearchCancelled'].includes(
                  event.type,
                )
              ) {
                yield 'event: settled\ndata: {}\n\n';
                return;
              }
            }
            if (events.rows.length === 50) continue;
            const search = await database.getSearch(ownerId, id);
            if (!search) break;
            if (
              ['completed', 'partial', 'failed', 'cancelled'].includes(search.status) &&
              !events.rows.length
            ) {
              const pending = await database.pool.query(
                'SELECT sequence FROM run_events WHERE owner_id = $1 AND run_id = $2 AND sequence > $3::bigint LIMIT 1',
                [ownerId, id, cursor],
              );
              if (pending.rowCount) continue;
              yield 'event: settled\ndata: {}\n\n';
              break;
            }
            yield ': heartbeat\n\n';
            await delay(1000, undefined, { signal: controller.signal });
          }
        } catch {
          if (!controller.signal.aborted) {
            request.log.error({ requestId: request.id }, 'Event stream failed');
            yield 'event: unavailable\ndata: {}\n\n';
          }
        } finally {
          cleanup();
        }
      })(),
    );
    body.once('close', cleanup);
    return reply
      .type('text/event-stream')
      .header('Cache-Control', 'no-store, no-transform')
      .header('X-Accel-Buffering', 'no')
      .send(body);
  });
  app.get('/api/searches/:id', async (request) => {
    // The most expensive read in the application: two 100-row JSONB queries
    // plus a 100-row event scan, every row re-parsed through Zod - and the one
    // the Jobs page polls while a run is active.
    await readBudget(request, 'searches-read', 240);
    const { id } = identifier.parse(request.params);
    const search = await database.getSearch(request.ownerId!, id);
    if (!search) throw new HttpError(404, 'Search not found');
    const jobs = await database.pool.query(
      `SELECT id, data FROM search_jobs WHERE owner_id = $1 AND run_id = $2
       ORDER BY (data->'match'->>'score')::double precision DESC NULLS LAST, id LIMIT 100`,
      [request.ownerId, id],
    );
    const events = await database.pool.query(
      `SELECT sequence::text AS cursor, type, created_at AS "createdAt"
      FROM run_events WHERE owner_id = $1 AND run_id = $2 ORDER BY sequence LIMIT 100`,
      [request.ownerId, id],
    );
    return {
      runId: id,
      status: search.status,
      request: search.request,
      profileRevision: search.profileRevision,
      sourceOutcomes: search.sourceOutcomes
        ? sourceOutcomesSchema.parse(search.sourceOutcomes)
        : null,
      // CS-33 (Security review, 2026-09-24): this route previously returned
      // jobs.rows straight from Postgres, relying entirely on write-time
      // discipline (Database.settle()'s collectedJobsSchema.parse before
      // insert) to keep the shape safe. That trust is not something this
      // read path can verify - a future direct write to search_jobs.data or
      // a schema tightening would silently reach the client unfiltered here
      // while GET .../export (which does parse) would correctly reject it.
      // Now shares the identical validated projection as export.
      jobs: jobs.rows.map((row) => ({
        id: row.id,
        data: collectedJobSchema.strip().parse(row.data),
      })),
      events: events.rows,
    };
  });
  return app;
}
