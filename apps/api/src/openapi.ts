import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifySchema } from 'fastify';
import { leadStatusSchema, maximumResumeBytes, sessionCookie } from '@careerscope/core';

type Schema = Record<string, unknown>;
type Documentation = FastifySchema & { response: Record<string, Schema> };
const text = (extra: Schema = {}): Schema => ({ type: 'string', ...extra });
const integer = (extra: Schema = {}): Schema => ({ type: 'integer', ...extra });
const bool: Schema = { type: 'boolean' };
const uuid = text({ format: 'uuid' });
const timestamp = text({ format: 'date-time' });
const array = (items: Schema, extra: Schema = {}): Schema => ({ type: 'array', items, ...extra });
const object = (
  properties: Record<string, Schema>,
  required = Object.keys(properties),
): Schema => ({
  type: 'object',
  properties,
  ...(required.length ? { required } : {}),
  additionalProperties: false,
});
const nullable = (schema: Schema): Schema => ({ ...schema, nullable: true });
const status = text({ enum: leadStatusSchema.options });
const applicationEvidence = object({
  method: text({ minLength: 1, maxLength: 120 }),
  appliedAt: timestamp,
  confirmation: text({ enum: ['unknown', 'received', 'not_received'] }),
  source: text({ maxLength: 160 }),
  confidence: text({ enum: ['unknown', 'low', 'medium', 'high'] }),
});
const sources = ['remoteok', 'himalayas', 'greenhouse', 'lever', 'ashby', 'workable'];
const searchStatus = text({
  enum: ['queued', 'running', 'completed', 'partial', 'failed', 'cancelled'],
});
const uploadStatus = text({
  enum: ['uploading', 'queued', 'cancelling', 'cancelled', 'parsed', 'rejected'],
});
const revision = integer({ minimum: 1, maximum: 2147483646 });
const error = object({ error: text(), requestId: uuid });
const stringList = (maxItems: number, minItems = 0) =>
  array(text({ minLength: 1 }), { minItems, maxItems });
const link = text({ description: 'Empty or an HTTPS URL without credentials.', default: '' });
const profile = object({
  candidate: object(
    {
      fullName: text({ minLength: 1, maxLength: 120 }),
      email: text({ format: 'email', maxLength: 254 }),
      phone: text({ maxLength: 40, default: '' }),
      location: text({ minLength: 1, maxLength: 120 }),
      linkedin: link,
      github: link,
      portfolio: link,
    },
    ['fullName', 'email', 'location'],
  ),
  preferences: object(
    {
      titles: stringList(25, 1),
      techStack: stringList(120, 1),
      locations: stringList(25),
      remoteOnly: { ...bool, default: false },
      minSalary: nullable(integer({ minimum: 0, default: null })),
      employmentTypes: array(
        text({ enum: ['fulltime', 'parttime', 'contract', 'internship', 'temporary'] }),
        { minItems: 1, default: ['fulltime'] },
      ),
      excludeKeywords: stringList(60),
      excludeCompanies: stringList(200),
    },
    ['titles', 'techStack'],
  ),
  application: object(
    {
      currentCtc: text({ maxLength: 40, default: '' }),
      expectedCtc: text({ maxLength: 40, default: '' }),
      noticePeriodDays: integer({ minimum: 0, maximum: 365, default: 0 }),
      willingToRelocate: { ...bool, default: true },
      yearsOfExperience: { type: 'number', minimum: 0, maximum: 60, default: 0 },
    },
    [],
  ),
});
const profileRecord = object({
  revision: integer({ minimum: 0 }),
  profile: nullable(profile),
  updatedAt: nullable(timestamp),
  scheduledDiscoveryEnabled: bool,
});
const searchInput = object(
  {
    query: text({ minLength: 2, maxLength: 160 }),
    useProfileTitles: bool,
    origin: text({ enum: ['manual', 'scheduled'], default: 'manual' }),
    sources: array(text({ enum: sources }), { minItems: 1, maxItems: 6, uniqueItems: true }),
  },
  ['query', 'sources'],
);
const sourceOutcomes = nullable(
  array(
    object({
      source: text({ enum: sources }),
      status: text({ enum: ['completed', 'empty', 'failed'] }),
      accepted: integer({ minimum: 0, maximum: 100 }),
      limited: bool,
      errorCode: nullable(
        text({
          enum: [
            'source_failed',
            'source_timeout',
            'invalid_response',
            'source_permission_pending',
          ],
        }),
      ),
    }),
  ),
);
const job = object(
  {
    fingerprint: text({ minLength: 1, maxLength: 256 }),
    title: text({ maxLength: 500 }),
    company: text({ maxLength: 500 }),
    location: text({ maxLength: 500 }),
    description: text({ maxLength: 100000 }),
    source: text({ enum: sources }),
    sourceUrl: text({ format: 'uri' }),
    applyUrl: text({ format: 'uri' }),
    sourceLinks: array(object({ source: text({ enum: sources }), url: text({ format: 'uri' }) })),
    postedAt: nullable(timestamp),
    match: {
      type: 'object',
      nullable: true,
      additionalProperties: true,
      description: 'Deterministic match breakdown; null when no matching profile was used.',
    },
  },
  [
    'fingerprint',
    'title',
    'company',
    'location',
    'description',
    'source',
    'sourceUrl',
    'applyUrl',
    'postedAt',
    'match',
  ],
);
const lead = object({
  id: uuid,
  data: job,
  notes: text({ maxLength: 10000 }),
  status,
  applicationEvidence: nullable(applicationEvidence),
  livenessStatus: text({ enum: ['unknown', 'live', 'stale'] }),
  livenessCheckedAt: nullable(timestamp),
  revision,
  createdAt: timestamp,
  updatedAt: timestamp,
});
const run = object({ runId: uuid, status: searchStatus });
const upload = object({ id: uuid, status: uploadStatus });
const posting = object({
  fingerprint: text(),
  title: text(),
  company: text(),
  sightings: integer(),
  repostCount: integer(),
  firstSeenAt: timestamp,
  lastSeenAt: timestamp,
  firstPostedAt: nullable(timestamp),
  daysOpen: nullable(integer()),
  daysTracked: integer(),
  signals: array(
    text({ enum: ['reposted', 'long_open', 'persistent', 'recently_posted', 'first_sighting'] }),
  ),
});
const evidence = array(object({ field: text(), value: text({ maxLength: 160 }) }));
const cursor = text({
  pattern: '^(0|[1-9][0-9]{0,18})$',
  description:
    'Decimal cursor, at most 9223372036854775807. Last-Event-ID takes precedence over after.',
});
const key = text({
  pattern: '^[a-zA-Z0-9_-]{8,128}$',
  description: 'Choose a new key for a new operation; reuse it only when retrying the same input.',
});
const limit = (fallback: number) => ({
  type: 'number',
  default: fallback,
  description:
    'Coerced to a number, floored and capped at 200; non-finite or non-positive values use the default.',
});
const errors: Record<number, string> = {
  400: 'Invalid request',
  401: 'Authentication required or invalid credentials',
  403: 'Origin denied or CSRF check failed',
  404: 'Resource not found or feature unavailable',
  409: 'Revision, idempotency or state conflict',
  413: 'Request too large',
  429: 'Rate limit exceeded',
  500: 'Service unavailable',
  502: 'Upstream provider error',
  503: 'Capability unavailable',
  504: 'Upstream provider timed out',
  507: 'Resume storage capacity reached',
};

function operation(
  summary: string,
  response: Schema,
  options: FastifySchema & { code?: number; failures?: number[] } = {},
): Documentation {
  const { code = 200, failures = [], ...metadata } = options;
  return {
    summary,
    ...metadata,
    response: {
      [code]: { ...response, description: code === 204 ? 'No content' : summary },
      ...Object.fromEntries(
        // Any route can fail closed when shared infrastructure such as Redis
        // is unavailable; keep that stable dependency failure in every contract.
        [...new Set([500, 503, ...failures])].map((statusCode) => [
          statusCode,
          { ...error, description: errors[statusCode] },
        ]),
      ),
    },
  };
}

function contracts(options: {
  testUsers?: boolean;
  harnessPasswordLogin?: boolean;
  emailOtpEnabled?: boolean;
  registrationEnabled?: boolean;
  registrationPolicy?: {
    termsVersion: string;
    termsUrl: string;
    privacyVersion: string;
    privacyUrl: string;
    marketingVersion: string;
  };
  resumes: boolean;
  cancellation: boolean;
}): Record<string, Documentation> {
  const resumeDescription = `Uploads ${options.resumes ? 'enabled' : 'disabled (503 for storage operations)'}. Cancellation ${options.cancellation ? 'enabled' : 'disabled (503)'}. PDF/DOCX only, maximum ${maximumResumeBytes} bytes. Parsed proposals never automatically update the profile.`;
  return {
    'GET /api/health': operation(
      'Database health and package version',
      object({ status: text({ enum: ['ok'] }), version: text() }),
    ),
    'GET /api/session': operation('Current browser session', {
      oneOf: [
        object(
          {
            authenticated: { ...bool, enum: [true] },
            csrf: text(),
            sessionId: uuid,
            email: nullable(text({ format: 'email' })),
            emailVerifiedAt: nullable(timestamp),
            emailOtpEnabled: bool,
            phone: nullable(text({ pattern: '^\\+[1-9][0-9]{7,14}$' })),
            testUser: text({ enum: ['candidate', 'admin'] }),
            // CS-61: a stable, opaque per-owner value for client cache keys.
            // Not the owner id — see the handler for why it is a digest.
            owner: text({ pattern: '^[a-f0-9]{64}$' }),
            aiEnabled: bool,
          },
          ['authenticated', 'csrf', 'sessionId', 'owner', 'aiEnabled', 'emailOtpEnabled'],
        ),
        object(
          {
            authenticated: { ...bool, enum: [false] },
            registrationEnabled: bool,
            emailOtpEnabled: bool,
            testUsersEnabled: bool,
            legalDocuments: object({
              termsVersion: text(),
              termsUrl: text({ format: 'uri' }),
              privacyVersion: text(),
              privacyUrl: text({ format: 'uri' }),
            }),
            testAccounts: {
              type: 'array',
              items: object({
                email: text({ format: 'email' }),
                role: text({ enum: ['candidate', 'admin'] }),
              }),
            },
          },
          ['authenticated', 'registrationEnabled', 'emailOtpEnabled'],
        ),
      ],
    }),
    'POST /api/register': operation(
      'Password registration unavailable',
      object({ error: text(), requestId: uuid }),
      {
        code: 404,
        failures: [404],
        description:
          'Password-based account creation is unavailable. When signup is explicitly configured, new accounts can only be created through the email-OTP flow with versioned Terms and privacy notice acceptance finalized after successful email verification.',
      },
    ),
    'POST /api/login': operation(
      options.testUsers
        ? 'Select a development or protected staging test identity and set the HttpOnly session cookie'
        : options.harnessPasswordLogin
          ? 'Authenticate a synthetic account in the isolated API test harness'
          : 'Test identity selection is disabled',
      object({ authenticated: { ...bool, enum: [true] } }),
      {
        body: options.testUsers
          ? object({ email: text({ format: 'email', maxLength: 254 }) })
          : options.harnessPasswordLogin
            ? object({ email: text({ format: 'email', maxLength: 254 }), password: text() })
            : object({}),
        failures: options.testUsers || options.harnessPasswordLogin ? [400, 401, 403, 429] : [404],
        description: options.harnessPasswordLogin
          ? 'Legacy password authentication exists only in the isolated API test harness; production composition explicitly disables this path.'
          : `Test account selection is ${options.testUsers ? 'enabled in the configured non-production test boundary' : 'disabled'}.`,
      },
    ),
    'POST /api/otp/request': operation(
      options.emailOtpEnabled ? 'Request an email sign-in code' : 'Email OTP is disabled',
      object({
        message: text(),
        expiresInSeconds: integer({ minimum: 1 }),
        resendAfterSeconds: integer({ minimum: 1 }),
      }),
      {
        code: 202,
        body: {
          oneOf: [
            object({ email: text({ format: 'email', maxLength: 254 }) }, ['email']),
            object(
              {
                email: text({ format: 'email', maxLength: 254 }),
                intent: { type: 'string', enum: ['sign-up'] },
                termsAccepted: { type: 'boolean', enum: [true] },
                privacyAcknowledged: { type: 'boolean', enum: [true] },
                marketingOptIn: bool,
              },
              ['email', 'intent', 'termsAccepted', 'privacyAcknowledged'],
            ),
          ],
        },
        failures: options.emailOtpEnabled ? [400, 403, 429, 503] : [404],
        description: `Returns the same accepted response for known and unknown addresses. Sign-in establishes sessions only for existing accounts. Signup is ${options.registrationEnabled ? 'enabled with server-configured, versioned legal documents' : 'disabled'}; verified signup acceptance and account creation are finalized in one PostgreSQL transaction.`,
      },
    ),
    'POST /api/otp/verify': operation(
      options.emailOtpEnabled
        ? 'Verify an email sign-in code and establish a session'
        : 'Email OTP is disabled',
      object({ authenticated: { ...bool, enum: [true] } }),
      {
        body: object({
          email: text({ format: 'email', maxLength: 254 }),
          code: text({ pattern: '^\\d{6}$' }),
          intent: { type: 'string', enum: ['sign-in', 'sign-up'] },
        }),
        failures: options.emailOtpEnabled ? [400, 401, 403, 429, 503] : [404],
        description:
          'Codes are single-use and short-lived. The authenticated identity is resolved from the verified server-side account record.',
      },
    ),
    'POST /api/logout': operation(
      'Sign out and clear the session cookie',
      object({ authenticated: { ...bool, enum: [false] } }),
    ),
    'POST /api/session/refresh': operation(
      'Rotate the browser refresh token and issue a short-lived access session',
      object({ authenticated: { ...bool, enum: [true] }, csrf: text() }),
      {
        code: 200,
        body: object({}),
        failures: [401],
        description:
          'Uses only the HttpOnly refresh cookie, requires an exact same-origin Origin, and detects reuse of consumed refresh tokens by revoking the session family.',
      },
    ),
    'GET /api/account/sessions': operation(
      'List the authenticated owner’s active device sessions',
      object({
        sessions: array(
          object({
            id: uuid,
            createdAt: nullable(timestamp),
            lastUsedAt: nullable(timestamp),
            deviceLabel: text(),
            current: bool,
          }),
        ),
      }),
    ),
    'POST /api/account/email-change/request': operation(
      options.emailOtpEnabled ? 'Request a two-address email change' : 'Email change is disabled',
      object({ message: text(), expiresInSeconds: integer({ minimum: 1 }) }),
      {
        code: 202,
        body: object({ newEmail: text({ format: 'email', maxLength: 254 }) }, ['newEmail']),
        failures: options.emailOtpEnabled ? [400, 401, 403, 429, 503] : [404],
        description:
          'Requires the authenticated owner session and CSRF token. Sends a five-minute, single-use code to the session-derived current address and the proposed address. The current address receives an email-change security notice; neither address nor owner id is accepted as identity input.',
      },
    ),
    'POST /api/account/email-change/verify': operation(
      options.emailOtpEnabled ? 'Verify one side of an email change' : 'Email change is disabled',
      object({ verified: text({ enum: ['current', 'new'] }), emailChanged: bool }),
      {
        body: object(
          { address: text({ enum: ['current', 'new'] }), code: text({ pattern: '^\\d{6}$' }) },
          ['address', 'code'],
        ),
        failures: options.emailOtpEnabled ? [400, 401, 403, 409, 429, 503] : [404],
        description:
          'The owner and current email are derived from the authenticated session and locked in PostgreSQL. The email changes only after both distinct address-bound codes are accepted in transactions; one-time attempt budgets and expiry are enforced server-side.',
      },
    ),
    'DELETE /api/account/sessions/:id': operation(
      'Revoke one session owned by the authenticated account',
      { type: 'null' },
      { code: 204, failures: [400, 429] },
    ),
    'GET /api/account/marketing-consent': operation(
      'Read the authenticated account’s current optional marketing preference',
      object({ optedIn: bool, version: nullable(text()) }),
    ),
    'POST /api/account/marketing-consent': operation(
      'Record or withdraw optional marketing consent for the authenticated account',
      object({ optedIn: bool }),
      {
        body: object({ optIn: bool }),
        failures: [400, 404, 429],
        description:
          'The setting is separate from service Terms/privacy acknowledgement. Withdrawal appends an immutable event; marketing delivery remains disabled unless a separate approved sender is configured.',
      },
    ),
    'POST /api/account/sessions/revoke-others': operation(
      'Revoke other sessions, retaining this session',
      { type: 'null' },
      { code: 204, body: object({}), failures: [400, 429] },
    ),
    'POST /api/account/password': operation(
      'Change password and revoke all sessions',
      { type: 'null' },
      {
        code: 204,
        body: object({
          currentPassword: text({ minLength: 12, maxLength: 256, format: 'password' }),
          newPassword: text({ minLength: 12, maxLength: 256, format: 'password' }),
        }),
        failures: [400, 429],
      },
    ),
    'GET /api/profile': operation(
      'Read the saved profile (revision zero when absent)',
      profileRecord,
      { failures: [429] },
    ),
    'PUT /api/profile': operation('Save the profile using optimistic concurrency', profileRecord, {
      body: object({ revision: integer({ minimum: 0, maximum: 2147483646 }), profile }),
      failures: [400, 409, 429],
    }),
    'PUT /api/profile/scheduled-discovery': operation(
      'Enable or disable unattended, scheduled discovery for this owner (defaults off)',
      object({ scheduledDiscoveryEnabled: bool }),
      {
        body: object({ enabled: bool }),
        failures: [400, 409, 429],
      },
    ),
    'GET /api/preparation': operation(
      'Rules-based preparation from the saved profile',
      object({
        method: text({ enum: ['rules-v1'] }),
        profileRevision: integer(),
        status: text({ enum: ['profile-required', 'review-required'] }),
        limitations: array(text()),
        checks: array(
          object({
            id: text(),
            title: text(),
            state: text({ enum: ['review', 'not-assessed'] }),
            detail: text(),
            evidence,
          }),
        ),
        questions: array(
          object({
            id: text(),
            kind: text({ enum: ['clarification', 'practice'] }),
            question: text(),
            evidence,
          }),
        ),
      }),
      { querystring: object({}), failures: [400, 429] },
    ),
    'GET /api/resumes': operation(
      'List the latest 50 resume uploads and capability flags',
      object(
        {
          enabled: bool,
          cancellationEnabled: bool,
          items: array(
            object({
              id: uuid,
              bytes: integer(),
              contentType: text(),
              createdAt: timestamp,
              status: uploadStatus,
            }),
          ),
        },
        ['enabled', 'items'],
      ),
      { description: resumeDescription },
    ),
    'POST /api/resumes': operation('Upload a PDF or DOCX as raw bytes', upload, {
      code: 202,
      consumes: ['application/octet-stream'],
      body: text({ format: 'binary' }),
      headers: object({ 'idempotency-key': key }),
      failures: [400, 409, 413, 429, 503, 507],
      description: resumeDescription,
    }),
    'GET /api/resumes/:id': operation(
      'Read resume upload status and parsing result',
      object({
        id: uuid,
        status: uploadStatus,
        result: {
          oneOf: [
            { type: 'object', nullable: true, enum: [null] },
            object({
              status: text({ enum: ['parsed'] }),
              parsed: object({
                format: text({ enum: ['pdf', 'docx'] }),
                text: text({ minLength: 40, maxLength: 160000 }),
                derived: {
                  type: 'object',
                  additionalProperties: true,
                  description: 'Extracted candidate proposal; review before saving to the profile.',
                },
              }),
            }),
            object({
              status: text({ enum: ['rejected'] }),
              errorCode: text({ enum: ['invalid_document', 'processing_failed'] }),
            }),
          ],
        },
      }),
      { failures: [400, 404, 503], description: resumeDescription },
    ),
    'POST /api/resumes/:id/recover': operation('Reconcile an interrupted upload', upload, {
      failures: [400, 404, 409, 429, 503, 507],
      description: resumeDescription,
    }),
    'POST /api/resumes/:id/cancel': operation(
      'Cancel an upload when the storage capability is available',
      upload,
      {
        body: object({}),
        failures: [400, 404, 409, 429, 503, 507],
        description: `${resumeDescription} An empty JSON object is optional.`,
      },
    ),
    'DELETE /api/resumes/:id': operation(
      'Delete a settled resume and its stored object',
      { type: 'null' },
      { code: 204, failures: [400, 409, 429, 503], description: resumeDescription },
    ),
    'GET /api/leads': operation(
      'List saved leads by stage',
      object({ items: array(lead), nextCursor: nullable(uuid) }),
      {
        querystring: object(
          {
            status: { ...status, default: 'saved' },
            before: uuid,
            limit: integer({ minimum: 1, maximum: 50, default: 25 }),
          },
          [],
        ),
        failures: [400, 429],
      },
    ),
    'POST /api/leads': operation('Save a job from a completed or partial search', lead, {
      body: object({ jobId: uuid }),
      failures: [400, 404, 429],
    }),
    'GET /api/leads/by-job/:jobId': operation(
      "Resolve the current owner's saved lead for a search job without exposing other owners",
      object({ lead: nullable(lead) }),
      { failures: [400, 429] },
    ),
    'GET /api/leads/:id': operation('Read a saved lead', lead, { failures: [400, 404, 429] }),
    'PUT /api/leads/:id': operation(
      'Update candidate-owned notes, stage, and candidate-reported application evidence using optimistic concurrency',
      lead,
      {
        body: object(
          {
            revision,
            notes: text({ maxLength: 10000 }),
            status,
            applicationEvidence,
          },
          ['revision', 'notes', 'status'],
        ),
        failures: [400, 404, 409, 429],
      },
    ),
    'GET /api/leads/:id/history': operation(
      'List lead revisions, newest first (25 per page)',
      object({
        items: array(
          object({
            revision,
            previousStatus: nullable(status),
            status,
            notesChanged: bool,
            applicationEvidenceChanged: bool,
            applicationEvidence: nullable(applicationEvidence),
            createdAt: timestamp,
          }),
        ),
        nextCursor: nullable(integer()),
      }),
      {
        querystring: object({ before: integer({ minimum: 1, maximum: 2147483647 }) }, []),
        failures: [400, 404, 429],
      },
    ),
    'GET /api/job-sources': operation(
      'List launch discovery sources and whether each has a current approved permission profile',
      object({
        items: array(
          object({
            id: text({ enum: ['greenhouse', 'lever', 'ashby', 'workable'] }),
            label: text(),
            available: bool,
            unavailableReason: nullable(text()),
          }),
          { maxItems: 4 },
        ),
      }),
      { failures: [429] },
    ),
    'POST /api/searches': operation('Queue a search with a frozen profile snapshot', run, {
      code: 202,
      body: searchInput,
      headers: object({ 'idempotency-key': key }),
      failures: [400, 409, 429, 503],
    }),
    'GET /api/searches': operation(
      'List the latest 50 searches',
      object({
        items: array(
          object({ id: uuid, request: searchInput, status: searchStatus, createdAt: timestamp }),
        ),
      }),
      { failures: [429] },
    ),
    'GET /api/searches/:id': operation(
      'Read a search, up to 100 ranked jobs and 100 events',
      object({
        runId: uuid,
        status: searchStatus,
        request: searchInput,
        profileRevision: nullable(integer()),
        sourceOutcomes,
        jobs: array(object({ id: uuid, data: job })),
        events: array(object({ cursor, type: text(), createdAt: timestamp })),
      }),
      { failures: [400, 404, 429] },
    ),
    'POST /api/searches/:id/cancel': operation('Cancel an owned search', run, {
      failures: [400, 404, 429],
    }),
    'GET /api/searches/:id/export': operation(
      'Download a completed or partial search as JSON',
      object({
        schemaVersion: integer({ enum: [1] }),
        runId: uuid,
        status: searchStatus,
        sourceOutcomes,
        request: searchInput,
        jobs: array(job),
      }),
      { failures: [400, 404, 409, 429] },
    ),
    'GET /api/searches/:id/events': operation(
      'Stream owner-scoped search progress (SSE)',
      { content: { 'text/event-stream': { schema: text() } } },
      {
        querystring: object({ after: cursor }, []),
        headers: object({ 'last-event-id': cursor }, []),
        failures: [400, 404, 429],
        description:
          'Up to 25 seconds per connection. Events: progress, reset, settled, session-expired, unavailable; heartbeat comments and retry: 2000. At most two streams per owner and 32 globally. Try It Out buffers until the connection closes; it is not a live EventSource viewer.',
      },
    ),
    'GET /api/market/postings': operation(
      'List stale or repeated postings seen by this owner',
      object({ entries: array(posting) }),
      { querystring: object({ limit: limit(50) }, []), failures: [429] },
    ),
    'GET /api/market/postings/:fingerprint': operation(
      'Read observed evidence for a posting',
      posting,
      {
        params: object({ fingerprint: text({ minLength: 1, maxLength: 256 }) }),
        failures: [400, 404, 429],
      },
    ),
    'GET /api/market/companies': operation(
      "Aggregate companies observed in this owner's searches",
      object({
        entries: array(
          object({
            company: text(),
            postings: integer(),
            reposts: integer(),
            mostSightings: integer(),
            averageDaysOpen: nullable(integer()),
            lastSeenAt: timestamp,
          }),
        ),
      }),
      { querystring: object({ limit: limit(25) }, []), failures: [429] },
    ),
    'GET /api/pipeline': operation(
      'Count leads and stalled work by stage',
      object({
        stages: array(
          object({ status, count: integer(), oldestDays: integer(), stalled: integer() }),
        ),
        stalledActive: integer(),
      }),
      { failures: [429] },
    ),
    'GET /api/pipeline/stalled': operation(
      'List active leads that have not changed stage recently',
      object({
        entries: array(
          object({
            id: uuid,
            fingerprint: text(),
            status,
            hasNotes: bool,
            statusChangedAt: timestamp,
            daysSinceChange: integer(),
            title: text(),
            company: text(),
          }),
        ),
      }),
      {
        querystring: object(
          {
            days: {
              type: 'number',
              default: 21,
              description: 'Coerced, defaults to 21 for zero/NaN, clamped to 1-365.',
            },
            limit: limit(50),
          },
          [],
        ),
        failures: [429],
      },
    ),
  };
}

export async function registerOpenApi(
  app: FastifyInstance,
  version: string,
  options: {
    testUsers?: boolean;
    harnessPasswordLogin?: boolean;
    emailOtpEnabled?: boolean;
    registrationEnabled?: boolean;
    registrationPolicy?: {
      termsVersion: string;
      termsUrl: string;
      privacyVersion: string;
      privacyUrl: string;
      marketingVersion: string;
    };
    resumes: boolean;
    cancellation: boolean;
  },
) {
  const documentation = contracts(options);
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'CareerScope API',
        version,
        description:
          'Private owner workspace. Sign in through the application on this origin first. Try It Out performs real operations; use synthetic data for verification. CSRF is fetched from the current session for each mutation. Login, logout and password changes can replace or revoke this session.',
      },
      servers: [{ url: '/' }],
      components: {
        securitySchemes: {
          session: {
            type: 'apiKey',
            in: 'cookie',
            name: sessionCookie,
            description: 'Existing HttpOnly browser session; do not paste a token.',
          },
          refresh: {
            type: 'apiKey',
            in: 'cookie',
            name: 'careerscope_v2_refresh',
            description: 'HttpOnly rotating refresh cookie; do not paste a token.',
          },
          csrf: {
            type: 'apiKey',
            in: 'header',
            name: 'x-csrf-token',
            description: 'Fetched automatically by Try It Out from /api/session.',
          },
        },
      },
    },
    transform: ({ url, route }): { url: string; schema: FastifySchema } => {
      if (url === '/api/docs' || url.startsWith('/api/docs/'))
        return { url, schema: { hide: true } };
      const method = String(route.method).toUpperCase();
      const metadata = documentation[`${method === 'HEAD' ? 'GET' : method} ${url}`];
      if (!metadata) throw new Error(`Missing API documentation: ${method} ${url}`);
      // CS-57 (Security review P3, 2026-09-25): `/api/logout` belongs here now.
      // The onRequest hook exempts a no-session POST to it, so 401 is no longer
      // reachable on that route and a session is no longer required — yet this
      // transform was still publishing both. The ticket's own evidence claimed
      // the document "now matches reality better", which was the opposite of
      // true: the literal in `documentation` does say 200/500, but this
      // transform augments it, and nobody had read the augmentation.
      //
      // It stays a mutation, so 403 and 413 are still added below: a caller
      // that DOES hold a live session still fails CSRF, which is exactly the
      // path that keeps forced-logout CSRF blocked.
      const anonymous = [
        '/api/health',
        '/api/session',
        '/api/login',
        '/api/register',
        '/api/otp/request',
        '/api/otp/verify',
        '/api/logout',
        '/api/session/refresh',
      ].includes(url);
      const refreshEndpoint = url === '/api/session/refresh';
      const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
      const response = { ...metadata.response };
      if (!anonymous) response[401] = { ...error, description: errors[401] };
      if (mutation) {
        response[403] = { ...error, description: errors[403] };
        response[413] = { ...error, description: errors[413] };
      }
      return {
        url,
        schema: {
          ...metadata,
          response,
          operationId: `${method.toLowerCase()}_${url.replace(/[^a-zA-Z0-9]+/g, '_')}`,
          tags: [url.split('/')[2]!],
          security: refreshEndpoint
            ? [{ refresh: [] }]
            : anonymous
              ? []
              : [mutation ? { session: [], csrf: [] } : { session: [] }],
          ...(url.includes('/:id') ? { params: object({ id: uuid }) } : {}),
          description:
            `${metadata.description ?? ''}${mutation ? ' Every write requires an exact Origin match; the browser supplies Origin automatically.' : ''}`.trim(),
        },
      };
    },
    transformObject: (document) => {
      if (!('openapiObject' in document)) throw new Error('Expected OpenAPI document');
      const { openapiObject } = document;
      const cancel = openapiObject.paths?.['/api/resumes/{id}/cancel']?.post?.requestBody;
      if (cancel && !('$ref' in cancel)) cancel.required = false;
      return openapiObject;
    },
  });
  await app.register(async (docs) => {
    docs.addHook('onSend', async (_request, reply, payload) => {
      reply.header('Cache-Control', 'no-store');
      return payload;
    });
    await docs.register(swaggerUi, {
      routePrefix: '/api/docs',
      validatorUrl: false,
      transformStaticCSP: () =>
        `default-src 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; form-action 'none'; connect-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' ${docs.swaggerCSP.style.join(' ')}; style-src-attr 'unsafe-inline'`,
      uiConfig: {
        layout: 'BaseLayout',
        docExpansion: 'none',
        persistAuthorization: false,
        ...{ queryConfigEnabled: false },
        validatorUrl: null,
        withCredentials: true,
        showMutatedRequest: false,
        requestInterceptor: async function (request: Record<string, unknown>) {
          if (typeof request.url !== 'string') throw new Error('Invalid request URL');
          const target = new URL(request.url, window.location.origin);
          if (target.origin !== window.location.origin || !target.pathname.startsWith('/api/'))
            throw new Error('Only same-origin API requests are allowed');
          request.credentials = 'same-origin';
          if (
            !['GET', 'HEAD', 'OPTIONS'].includes(String(request.method ?? 'GET').toUpperCase()) &&
            ![
              '/api/login',
              '/api/register',
              '/api/otp/request',
              '/api/otp/verify',
              '/api/session/refresh',
            ].includes(target.pathname)
          ) {
            const response = await fetch('/api/session', {
              credentials: 'same-origin',
              cache: 'no-store',
              redirect: 'error',
            });
            if (!response.ok) throw new Error('Session unavailable; sign in again');
            const session = await response.json();
            if (session.authenticated !== true || typeof session.csrf !== 'string' || !session.csrf)
              throw new Error('Sign in again before trying this operation');
            request.headers = {
              ...(request.headers as Record<string, string>),
              'x-csrf-token': session.csrf,
            };
          }
          return request;
        },
      },
    });
  });
}
