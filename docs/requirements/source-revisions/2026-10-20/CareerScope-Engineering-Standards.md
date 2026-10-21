# CareerScope: Engineering Standards

Company: Viswatra
Product: CareerScope (careerscope.tech)
Status: DRAFT. Stack choices are PROPOSED. Each one must be checked against the repository once attached, and the owner must approve it. Product behaviour comes only from CareerScope-v12.md. This file covers how the code is built, tested, secured, and shipped.
Applies to: every repository and every change made by a person or an AI agent.

---

## 1. Stack (PROPOSED, confirm against repo)

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, strict mode, everywhere (web, API, workers, tests) | One language, type safety at boundaries |
| Web frontend | Next.js (App Router), React, Tailwind CSS, component library (shadcn/ui or equivalent) | Server rendering for public job pages; accessible components |
| API | Fastify, schema validation at every route | Fast, typed routes |
| Database | PostgreSQL, Drizzle ORM, migrations committed to the repo | Relational records; reviewable migrations |
| Cache and rate limits | Redis | Caches and abuse limits; auth fails closed if Redis is down (v12 section 6) |
| Background jobs | BullMQ on Redis, dead-letter store after retry limit | Email, sync, and AI jobs off the request path |
| Email | Resend only for sign-in OTP (D11-R, Amendment A1: no SMTP and no second-provider fallback). Notifications via Resend from careerscope.tech. The former second-provider switch (D11) is SUPERSEDED | Sign-in OTP and notifications |
| Hosting | Single Hostinger VPS at launch, containers per service | Launch scope; single host failure is an accepted risk |
| CI | GitHub Actions | Runs every check in section 7 |

If the repo already uses a different choice, record the actual choice here and the reason for keeping it. Do not silently change the stack.

---

## 2. Code quality

- TypeScript `strict` on. No `any` without a comment and an issue reference. No `@ts-ignore`; use `@ts-expect-error` with a reason only when unavoidable
- ESLint with the shared project config. Zero errors. Warnings are not allowed on new code
- Prettier for all formatting. Formatting checked in CI, not fixed by hand in review
- Functions do one thing. Files over 400 lines need a reason in the pull request (in autonomous mode: in the commit message and `PROGRESS.md`, Goal section 4.2)
- Names describe the domain (application, interview, verification), not the mechanism
- No dead code, commented-out code, or unused exports. Remove them in the same change
- Errors: every route returns a documented error shape. No stack traces or internal details reach the client
- Logs: structured JSON, with request ID, no personal data, no resume text, no tokens, no OTP codes
- Time and money: store UTC timestamps; store amounts as integers in the smallest unit if money appears
- Feature flags for anything that can be turned off (referrals, AI, outreach, sync), read from configuration, not hard-coded

---

## 3. Frontend standards

- Accessibility: WCAG 2.2 AA on all core flows (sign-in, onboarding, matching, applying, tracking, interview organizer). Keyboard-only use, visible focus and logical focus order, labelled form fields, correct heading order and semantic HTML, colour is never the only signal, error announcements, reduced-motion support, and usable at 200% and 400% zoom. Automated checks (axe-core) plus recorded manual tests, including a screen reader; automated scans alone are not compliance evidence (Goal section 16A.1)
- Languages: English, Telugu, Hindi. No text in code; all copy in translation files. Layouts tested with longer Telugu and Hindi strings
- Responsive: mobile first. Tested at 320, 360, 390, 768, 1024, 1280, 1440, and 1920 px wide, plus widths where the layout changes, in portrait and landscape. No unintended horizontal scrolling, clipped or overlapping content (Goal section 16A.2)
- Browsers: Chromium, Firefox, and WebKit through Playwright; real mobile browsers where available (Goal section 16A.3)
- Components: one component per file. Props typed. No inline styles except computed values
- Data loading: every screen has loading, empty, error, and outage states (see v12 sections 4.1 and 6). None of these may be blank
- Public job pages: server-rendered, with full text only where the source permits (D10). Otherwise a link out with attribution
- Images: photos are hidden in recruiter first-pass views (v12 test list). Alt text required on every image
- No third-party scripts that track candidates without a consent path (see section 9)

---

## 4. Backend and data standards

- Every route has an input schema and an output schema. Requests that do not match are rejected before any business logic runs
- Authorization is checked on the server for every record access. Record-level isolation is tested (v12 section 7). Client-side checks are not security
- Database: all schema changes through migrations. Migrations are reviewed, reversible where possible, and tested on a copy of the data before release
- Queries: no unbounded lists. Pagination on every list endpoint. Indexes reviewed for each new query path
- Transactions: any change that touches two records is in one transaction
- Jobs: idempotent. Each job can run twice without duplicating emails, applications, or records
- Outbound email: queued, retried with limits, and logged without the message body
- AI calls: go through one server-side gateway module (OpenRouter-backed, Amendment A2) with quota, timeout, fallback, and prompt-injection filtering (v12 section 9). No AI provider keys in the frontend
- Retention: follow v12 section 9 and section 10. Account deletion removes data from database, storage, caches, and third parties

---

## 5. Security standards

- No secrets in code, tests, logs, screenshots, or documentation. Secrets come from the server environment only
- Secret scanning on every push (GitHub secret scanning or equivalent). Any detected secret is revoked, not just deleted
- Dependency audit on every pull request (in autonomous mode: every integration, Goal section 4.2). High or critical vulnerabilities block the merge or integration unless the owner waives them in writing with a date. The agent cannot grant this waiver
- Lockfile committed. Dependencies pinned to exact versions for production
- Session tokens: short-lived access tokens, rotated refresh tokens, reuse detection that revokes the token family (v12 test list)
- Rate limits on sign-in, OTP requests, search, applications, and outreach
- Input and output: validated and escaped. Prompt-injection suite on every release (v12 section 7)
- Uploads (resume, photo): type and size checked on the server, stored outside the web root, scanned where the tool allows
- Headers: HTTPS only, secure cookies, content security policy, no inline scripts without a nonce
- Admin and super admin actions are logged, and require re-authentication for role changes
- Test sign-in is blocked in production by configuration, not by code convention (D1)
- Security tests run on every release (section 7)
- Security testing covers the OWASP Top 10 and the applicable OWASP API Security Top 10, using static analysis, dependency and secret scanning, and safe dynamic testing in isolated environments only (Goal section 16A.4)
- Container, database, Redis, and worker configuration are part of the security review

---

## 6. GitHub workflow

- Protected main branch. No direct pushes. Routine internal integration into `dev` is autonomous after the applicable tests and quality checks; no pull request is required for it (owner decision of 20 October 2026, Quality Standard section 3, item 5), subject to the governance transition recorded in `blocker.txt`. Promotion to `main` remains owner-authorized
- Temporary branch names, only where the branch policy allows a task branch: `feature/`, `fix/`, `chore/`, `security/` followed by a short description
- Commits: small and focused. Messages state what changed and why
- Pull request template includes: linked requirement (v12 section and decision ID), test evidence, screenshots for UI changes, migration notes, and rollback plan
- Required checks before merge: lint, typecheck, unit tests, integration tests, sanity tests, dependency audit, secret scan, build
- Pull requests need one human approval. An AI agent cannot approve its own work (see Autonomous mode below for the agent-loop exception)
- Staging deployment runs from the `dev` branch through a protected staging environment, with pre- and post-deployment validation (Goal section 16B.4). Staging never runs on the production host
- Production deploys need an explicit owner approval step and are never triggered by an agent-written workflow
- Tags for every production release, with the checklist results attached
- Automated dependency update pull requests are reviewed like any other change

Autonomous mode (when CareerScope-Goal.md runs an agent loop):

- Pull-request requirements in this file (test timing, reasons, template fields, review, documentation) apply as development-branch integration requirements, using the mapping in Goal section 4.2. Every applicable check runs; no threshold is reduced
- Per-change human approval is replaced by an independent review in a separate agent session (Goal section 16). If that review cannot run, it is never claimed; the limitation is recorded in `blocker.txt` and the change cannot become launch-ready or be promoted until reviewed
- A verified baseline backup is made before major modifications (Goal section 4.1)
- Repeated failures follow the failure-escalation procedure (Goal section 20.1)
- The agent never pushes to `main`. Promotion to `main`, any production deploy, and every owner-only decision in section 11 remain with the owner
- Owner review before promotion is still required for authentication, sessions, authorization, migrations touching personal data, outreach and email sending, and deletion and consent changes

---

## 7. Testing and definition of done

### 7.1 Test levels

| Level | What it covers | When it runs |
|---|---|---|
| Unit | Pure logic, validators, mappers | Every commit |
| Integration | Routes with real PostgreSQL and Redis in containers | Every pull request |
| Sanity | Core flows at the API level | Every pull request |
| Smoke | Health checks, sign-in, one read and one write | Every deploy |
| Critical path | Sign-in, onboarding, match, apply, track | Every deploy |
| End-to-end (Playwright) | Core flows in a browser, English and Telugu | Every pull request (critical subset) and nightly (full) |
| Accessibility | Automated checks plus keyboard tests on core flows | Every pull request |
| Regression | Full suite | Nightly and before release |
| Security | Auth, record isolation, role escalation, injection | Every release |
| Prompt injection | AI and text-input attacks | Every release |
| Load | 200 normal users; 1,000 concurrent visitors; 300 users with matching and AI | Before launch (v12 section 7) |
| Platform failure | Redis, PostgreSQL, email, workers down and recovered | Before launch, on a dedicated disposable environment only |
| Cross-browser | Full E2E suites on Chromium, Firefox, and WebKit | Critical subset on Chromium every pull request; all three engines after each major module, nightly, and before release |
| Responsive | Core screens at the widths in section 3 | Every pull request for changed screens; all screens before release |
| Performance | Core Web Vitals (LCP, INP, CLS), Lighthouse, bundle size, API and query timing | After each major module and before release |
| Quality audit | Repository-wide audit of the launch core (Goal section 16A) | Before development is declared complete |

In autonomous mode, the timings in this table follow the mapping in CareerScope-Goal.md section 4.2 and the trigger matrix in Goal section 16B.2. No check is dropped. Where the two differ, the stricter rule applies.

### 7.2 Coverage

- Unit and integration coverage on changed code: at least 80 percent lines and 70 percent branches. Measured by the CI tool, not estimated
- Authorization and record access code: 100 percent of routes covered by at least one denial test
- Coverage thresholds fail the build. Lowering a threshold is an owner-only decision made in writing (section 11). In autonomous mode the agent cannot lower a threshold

### 7.2a Performance measurement

- Measure Core Web Vitals, Lighthouse scores, bundle size, API response times, and query plans, and record the results
- Do not invent pass thresholds. v12 requires load tests to meet "performance targets" but sets no numbers; the owner sets them (section 11). Until then, record measurements and recommendations

### 7.2b CI/CD and automation

- GitHub Actions implements the trigger matrix in Goal section 16B.2: push checks, integration checks, module checks, nightly runs, manual runs, and staging pre- and post-deployment validation
- Manual runs use a `workflow_dispatch` workflow with allowlisted inputs; production is never a selectable target
- Workflow security follows Goal section 16B.8: explicit least-privilege permissions, actions pinned to immutable versions, no production secrets in test workflows, concurrency controls for deployments
- Retries are bounded (at most 2 per test). Tests that pass only on retry are reported as flaky. Skipped mandatory tests count as incomplete
- A workflow is accepted only after an actual run proves its trigger, failure handling, and evidence capture (Goal section 16B.11)

### 7.3 Definition of done (a change is done only when all of these pass)

Run these commands in CI. Replace the names with the repo's actual scripts once the repo is attached:

1. `lint` — ESLint, zero errors, zero new warnings
2. `format:check` — Prettier, no changes
3. `typecheck` — TypeScript strict, zero errors
4. `test:unit` — all pass, coverage thresholds met
5. `test:integration` — all pass against real PostgreSQL and Redis containers
6. `test:e2e:critical` — all pass in English and Telugu
7. `test:a11y` — no violations on changed screens
8. `audit` — no unaccepted high or critical vulnerabilities
9. `secrets:scan` — no findings
10. `build` — production build succeeds with no warnings treated as errors
11. Migrations (if any) applied to a copy of staging data and rolled back cleanly
12. Feature flag defaults checked: any new feature is off in production until approved
13. For UI changes: responsive checks at the section 3 widths and accessibility checks pass on changed screens

Defects are closed only through the fix, retest, and verify cycle in Goal section 16A.7.

A change that touches a v12 acceptance test or go/no-go item must also update that test or checklist row with evidence.

---

## 8. Architecture and system design

- Web, API, and workers are separate containers, each with its own resource limits (v12 section 6)
- Database and workers move off the web host first if load tests show contention
- Every external provider (email, AI, job sources) sits behind an adapter with timeouts, retries with limits, circuit breakers, and a switch flag
- Redis failure: caches bypassed; authentication fails closed (v12 section 6)
- Database failure: maintenance page; no writes without a confirmed commit
- Worker failure: jobs stay queued; dead-letter store after retry limit
- Health checks per service. Alerts go through a path independent of the primary VPS (v12 go/no-go item 20)
- Single VPS host failure is an accepted risk. It is recorded in the owner sign-off (v12 go/no-go item 25)
- Architecture changes need a short decision record in `docs/decisions/` with the context, options, and chosen option

---

## 9. Privacy and data handling in code

- Collect only the fields a v12 feature needs. A new field needs a reason in the pull request (in autonomous mode: in the commit message and `PROGRESS.md`)
- Date of birth: stored only as the screening result (D7). The raw date is not kept
- Personal data never goes to logs, analytics, or error trackers. Error trackers scrub request bodies
- Third-party scripts: none on candidate pages without a consent path
- Deletion and consent withdrawal have tests (v12 go/no-go items 12 and 24)
- AI prompts: contain only the data the feature needs. No private contact details unless the feature requires them

---

## 10. Documentation

- README in every repository: setup, environment variable names (never values), commands, and how to run tests
- `docs/decisions/` for architecture decisions
- Runbooks in `docs/runbooks/` for: restore drill, sign-in outage, email provider switch, kill switch use, secret rotation
- Each release has a short changelog that links to the v12 items it delivers

---

## 11. Owner-only decisions

These cannot be decided by an AI agent or a single contributor:

- Stack changes after approval
- Coverage threshold changes
- Accepting a high or critical vulnerability
- Production deploys
- Turning on any feature flag in production
- Any change to D1 to D14 in v12
- Sending outreach or email to real users during testing
- Numerical performance targets (Core Web Vitals, API response times, load-test targets)
- Providing staging infrastructure, deployment credentials, and GitHub environment secrets
- GitHub Actions plan, minutes budget, or any change to the mandatory run schedule
- Any production deployment, production environment, or production rollback
- Accepting or waiving any critical or high-severity security finding

---

## Amendment A1 (20 October 2026): engineering controls for Resend sign-in OTP, consent, webhooks and test isolation

Status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL. Product behaviour is in CareerScope-v12.md Amendment A1. This section states the code controls. Where it is stricter than the rest of this file, it applies.

### A1.E1 Configuration

- Names only, never values: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OTP_HMAC_SECRET` (or project-specific equivalent), and the proposed live-test opt-in `CAREERSCOPE_LIVE_EMAIL_TEST` (owner to confirm).
- The API key is server-only and separate from the OTP HMAC secret. Startup validates the sender against `careerscope.tech` and fails outside test mode if a required value is missing.
- Test login is refused at startup in production by configuration (D1), not by convention, and the refusal is verified by a deployment test. No production bypass exists.
- One documented example file lists the names. No duplicate `.env` files.

### A1.E2 Email adapter

- The sign-in OTP path has one transport: Resend. No SMTP client, no secondary provider, and no fallback branch are present in the code. A test asserts the send path has no such route.
- Timeout, bounded retries, and an idempotency key per challenge. Failures map to internal categories (missing key, invalid key, timeout, rejection, outage) and one generic external response.
- Sign-in OTP is not placed in the queue for later delivery (v12 A1.4).
- The provider's status means `accepted` by the provider. The UI and logs must not say `delivered` or `read` (v12 section 4.11 rule).
- Templates are branded, with HTML and plain-text parity, no tracking pixels, and no tracked links.

### A1.E3 OTP lifecycle

- Platform cryptographic randomness; six digits without modulo bias; digest only; five-minute expiry; five attempts; sixty-second cooldown.
- Verification uses a conditional update in one transaction so concurrent submissions cannot both succeed; session creation is tied to the consumed challenge.
- Redis-backed counters per email, account and IP. A Redis outage fails authentication closed.

### A1.E4 Webhooks

- Any Resend delivery webhook handler follows: signature verification on the raw body, timestamp tolerance, replay protection, schema validation, idempotency on the event identifier, suppression state committed before a 2xx response, and a 5xx response if durable acceptance fails.
- Recorded as NOT_APPLICABLE_YET until such a handler exists.

### A1.E5 Test isolation

- Recording transport by default. A test guard blocks network calls to the provider from test jobs. CI never sets the live opt-in.
- Live tests only under the owner-supervised conditions in v12 Amendment A1.8.

### A1.E6 Tests

The required test list is v12 Amendment A1.3 (Resend failures), A1.2 (OTP lifecycle and enumeration), A1.6 (signup consent and registration), and A1.7 (inbound events). Each test maps to a requirement ID in the test matrix. No count is claimed in this document.

### A1.E7 Owner-only items

Changing D11 or any D1 to D14 decision, enabling test login anywhere outside development and staging, and any live send are owner-only (section 11).

---

## Amendment A3 (20 October 2026): hosting, isolation, CI/CD and test engineering

Status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL. Product rules: CareerScope v12 Amendment A3. Canonical hosting inventory: OraOne Master Specification, Amendment 2026-10-20D.

- **Host.** CareerScope runs on the single Hostinger VPS shared by all Viswatra products (owner decision, 20 October 2026), in isolated containers. That host is live for another product and is not a CareerScope staging host.
- **Containers.** Web, API, and each worker class run as separate containers with explicit CPU and memory limits, health checks, and restart policies. Limits are set from measured usage.
- **Data.** A CareerScope-only PostgreSQL database and user; PostgreSQL connection budget per service; migrations reviewed and tested on a disposable copy.
- **Redis.** A CareerScope-only key namespace and memory policy. BullMQ queues use the namespace. Redis is not reachable from the public network.
- **Networks.** Public traffic only through the reverse proxy. Database, Redis, and worker networks are private. SSH key-only access. Firewall allows only required inbound ports.
- **Secrets.** Environment-specific, never committed, never printed. Names are documented; values are not.
- **Workflow.** Use the CI workflow directory with least-privilege `permissions:`, actions pinned to immutable release versions, no secrets for fork-triggered runs, and concurrency control for deployments. Trigger matrix: pull request (lint, typecheck, unit, relevant integration); development push (broader integration, security, Chromium critical); nightly (full regression, three engines, extended security); release candidate (readiness suite); authorized staging (smoke, sanity, critical); production (owner-only).
- **Lint and format.** ESLint with zero errors and no new warnings; Prettier check in CI; TypeScript strict; no suppression without a reason.
- **Test taxonomy.** Smoke, sanity, critical-path, functional, regression, integration, end-to-end (Chromium, Firefox, WebKit), accessibility, responsive, security, prompt-injection, performance and load, platform failure, migration, backup and restore. Definitions and mapping are in section 7.
- **Load safety.** Load and fault tests run only on a disposable environment. They never target production or live providers.
- **Rollback.** Application rollback is tested. Database reversals that may lose data are not run automatically.

## Launch baseline controls and tests (owner decisions, 20 October 2026)

- Product domain: `careerscope.tech`. Email sending subdomain: `mail.careerscope.tech`. Sender: `CareerScope <noreply@mail.careerscope.tech>`. Sender subdomain verification in its Resend account is pending.
- Email provider: each product domain has its own Resend account, with its own API key, verified sending subdomain and webhook secret. No key or sending domain is shared between products (owner decision, 20 October 2026).
- Hosting: one Hostinger VPS (4 vCPU, 16 GB RAM, 200 GB NVMe, 16 TB bandwidth) runs all Viswatra products in isolated containers, each with its own database and user, Redis namespace, secrets, logs, backups, deployment and rollback. The live OraOne deployment is not a staging host, and this document names no staging host.
- Sign-in: Resend email OTP is the sole sign-in method. No password sign-in or password reset, no TOTP, SSO, passkey, Google OAuth, SMS or phone OTP, no SMTP or secondary-provider fallback, no Supabase, no AWS or Amazon Cognito.
- Test authentication: production never has an enabled test-login bypass; development and staging follow LG1 and the test authentication policy in global standard section 31.
- Approval status: every item in sections B, A and C is PROPOSED under CR-07 and is not approved until the owner records approval in blocker.txt. This document records no approval.
- Testing rule: a control is reported only at the evidence level its test has actually reached (Standard 2.1). A test that has not run is PLANNED, not PASS.

### B. The 19 launch baseline controls

| # | Control | Requirement for this product | Test | Status |
|---|---|---|---|---|
| LB1 | Real login and logout | Sign-in by Resend email OTP creates a server-side session. Logout revokes that session on the server. Sign out everywhere revokes all sessions. Idle and absolute expiry are enforced. | E2E @critical: sign in, reach a protected page, log out; back navigation and direct URLs return to sign-in. Integration: a revoked session token is rejected server-side. Sign-out-everywhere test with two sessions. | PLANNED |
| LB2 | Password reset (superseded: not applicable) | Not applicable under the Resend-only email OTP policy: no password credential exists, so no password reset is built. Account recovery follows each product's OTP recovery rules. The earlier conditional password-reset wording is superseded and kept only for traceability in the owner update of 20 October 2026. | Route scan: no password-set or password-reset endpoint or form exists in the build; recovery uses only the email OTP flow (integration test). | NOT_APPLICABLE_WITH_REASON (Resend-only email OTP; no password credential) |
| LB3 | Email verification | Email is verified by a Resend OTP at sign-up and on every email change. An email change needs an OTP sent to the old address and one sent to the new address. Unverified accounts cannot reach protected areas. | Integration: unverified account blocked from protected routes; expired and reused OTP rejected; email change without both OTPs rejected; OTP sent only through this product's Resend account. | PLANNED |
| LB4 | Loading states | Every asynchronous action (sign-in, saves, uploads, AI or provider calls, bookings, pagination) shows loading feedback, a timeout path with retry, a slow-network state and duplicate-submit protection. | Playwright @critical under a throttled slow-network profile: each async action shows loading, times out to a recoverable message, and a double click sends one request. | PLANNED |
| LB5 | Empty states | Every list or screen with no data explains the situation and offers one next action. No sample, invented or placeholder statistics. | Component and E2E: a fresh account renders each empty state with its action; a text scan finds no invented figures or placeholder text. | PLANNED |
| LB6 | Clear error messages | User-facing errors are plain and actionable, announced to screen readers, and carry a request ID for support. Technical detail goes only to protected diagnostics. | Integration: forced 500, timeout and validation errors return non-technical text, a request ID, and no stack trace or internal path. axe check confirms the error sits in a live region. | PLANNED |
| LB7 | Form validation | One validation schema runs on client and server. Errors are linked to their fields and summarized. Entered input is kept after an error. The server rejects input that bypasses client checks. | Unit: shared schema cases (valid, invalid, empty, too long, special characters, each launch language). E2E: an error keeps the entered input. API: a request that bypasses client checks returns 422 with field errors. | PLANNED |
| LB8 | Rate limiting | Server-side limits per email, account and IP on sign-in, OTP requests and protected actions. Limits are shared across instances; a Redis or limiter outage fails protected surfaces closed. Proxy headers and concurrent requests cannot bypass them. | Integration: N+1 OTP requests in the window return 429 with Retry-After; two app instances share one counter; rotating X-Forwarded-For does not reset the limit; a forced limiter outage fails sign-in closed while health stays reachable. | PLANNED |
| LB9 | Database backups | Encrypted automated backups of each product database, with an off-host copy and an immutable or object-locked copy where the host supports it. A backup counts as operational only after a verified restore. | Scheduled restore drill: the latest backup is restored to a disposable database; row counts and checksums match the source snapshot; result recorded. A failed backup job raises an alert. | PLANNED |
| LB10 | Row level security | PostgreSQL row level security on user-owned records, with dedicated least-privilege application roles. RLS is defence in depth; application authorization checks still apply. | Integration: as the application role, a query for another account's records returns zero rows; direct SQL against another tenant is denied; the authorization matrix passes with RLS disabled, proving application checks work independently. | PLANNED |
| LB11 | API keys off the frontend | Provider and service keys exist only on the server. Client bundles and source maps contain no secrets, and production source maps are not publicly served. | CI: bundle and source-map scan with synthetic key fixtures and provider key patterns; the build fails on any match. A request for a production source map returns 404. | PLANNED |
| LB12 | Mobile layout | Layouts work at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px with no horizontal page scroll. Real Android Chrome and iOS Safari are checked before release. | Playwright responsive project at all eight widths: no horizontal scroll, no clipped controls (visual snapshots). Manual check on real phones recorded per release candidate. | PLANNED |
| LB13 | Custom 404 page | Branded 404, 403, 500 and maintenance pages. No internal path, stack trace or record existence is revealed. | E2E: an unknown route returns a branded 404; a request for another account's record returns the same 404 as a missing record; a forced error returns the branded 500 with no stack. | PLANNED |
| LB14 | Analytics installed | Privacy-safe analytics only where consent allows. No personal data in event properties. Events match the tracking plan. | E2E: consent denied means zero analytics requests; consent granted sends only plan-listed events; fixture scan finds no email, phone or token in event payloads. | PLANNED |
| LB15 | Error tracking | Error tracking with personal data and secrets scrubbed before sending, and every event tagged with the release identifier. The tool is chosen within the budget and privacy rules (CR-06 C6-R8). | Integration: a synthetic exception containing a fake email and token arrives scrubbed and tagged with the release. Tool selection stays READY_FOR_OWNER until the owner approves the cost. | PLANNED |
| LB16 | Privacy policy page | A product-specific privacy policy page that reflects actual behaviour, linked from sign-up and the footer. Stays a draft until owner and qualified legal approval. | E2E: page reachable and linked from sign-up and footer; link check finds no broken link; draft status shown until approval is recorded; listed processors and retention match the data inventory. | PLANNED |
| LB17 | Terms page | A product-specific terms page. Acceptance is recorded with the terms version and UTC time at sign-up. Stays a draft until legal approval. | Integration: sign-up without acceptance is rejected; with acceptance, version and UTC time are stored; a changed version prompts re-acceptance. | PLANNED |
| LB18 | Delete account button | Account deletion, behind a confirmation step, deletes or anonymises personal data across database, object storage, caches and processors within published timelines. Backups are purged on expiry. A personal-data-free audit record is kept. | Integration: after deletion, a search of database, storage and cache fixtures finds no personal data; processor deletion requests are sent; scheduled test purges backups at expiry; the audit entry contains no personal data. | PLANNED |
| LB19 | Onboarding flow | Interrupted onboarding resumes without losing entered or consented data and without creating duplicate accounts. | E2E: interrupt at each step, close the browser, return; state and consents are preserved; repeat sign-up with the same verified email does not create a second account. | PLANNED |

### A. Additional controls added by this update

| # | Control | Requirement for this product | Test | Status |
|---|---|---|---|---|
| LA1 | Security audit log | Append-only record of sign-in, OTP request and failure, account recovery, email change, session revocation, role change and step-up events, with actor, time, request ID and result. No OTP or secret values are stored. | Integration: each event type writes one entry; a fixture scan of audit rows finds no OTP or token; entries cannot be updated or deleted through the application. | PLANNED |
| LA2 | Privileged step-up by Resend OTP | Role changes, account deletion, data export and configuration publication require a fresh Resend email OTP bound to the current session and the specific action. The code is single-use and valid for less time than sign-in. | Integration: the action without a fresh OTP returns 403; an OTP issued for one action does not authorize another; a replayed OTP is rejected; the step-up event is audited. | PLANNED |
| LA3 | Consent and notice records | Consent records store purpose, notice version, UTC time and withdrawal. Marketing consent starts unchecked and is withdrawable at any time. | E2E: marketing box unchecked by default; withdrawal stops sends and is recorded; the consent history kept after deletion holds no personal data. | PLANNED |
| LA4 | Sending-domain authentication | SPF, DKIM and DMARC configured for each product's sending subdomain in that product's own Resend account. Existing mail records are backed up before any change and never overwritten. Verification status is kept separate from delivery status. | DNS check: records present and valid; no conflicting SPF record; a dry-run change diff is reviewed before apply; delivery outcomes from webhooks are stored separately from verification status. | PLANNED |
| LA5 | Webhook reliability | Inbound provider webhooks are verified by signature and timestamp, deduplicated by event ID, and acknowledged only after a durable write. | Integration: a bad signature is rejected; a replayed event is processed once; a simulated database failure returns a non-2xx status so the provider retries. | PLANNED |
| LA6 | Per-domain key isolation | Each product's Resend API key, webhook secret and sending subdomain are separate. Keys are never shared between products. The rotation runbook is owned by the owner. | Config test: each product's environment contains only its own key names; a request signed with product A's key for product B's sender is rejected; a rotation rehearsal is recorded. | PLANNED |
| LA7 | Dependency, container and secret scanning | Dependency audit, SBOM, container image scan and secret scanning run in CI. High or critical findings block promotion. | Negative fixture: a deliberately vulnerable dependency and a fake secret on a temporary branch fail CI; the branch is then removed and the result recorded. | PLANNED |
| LA8 | Security headers and cookies | Content-Security-Policy, HSTS, X-Content-Type-Options, Referrer-Policy and frame protection on every response. Session cookies are Secure, HttpOnly and SameSite. | E2E and API: header and cookie assertions on public, sign-in and protected responses. | PLANNED |
| LA9 | Incident and breach-notification runbook | Runbook for data leak, compromised credential and provider outage. Notification duties under the Digital Personal Data Protection Act 2023 are confirmed by legal review. | Tabletop drill recorded with date, participants and outcome; each runbook checklist item verified. | PLANNED |
| LA10 | Accessibility of launch-critical auth pages | Sign-in, OTP, onboarding, 404 and error pages meet WCAG 2.2 AA. | axe scan of each page in CI; keyboard-only E2E pass; NVDA or VoiceOver check recorded. | PLANNED |
| LA11 | Independent uptime monitoring | Health endpoints /health/live and /health/ready. An external uptime checker and alert channel independent of the shared host. | Drill: stop the product container on a non-production copy; the external alert fires within the agreed window; recovery recorded. | PLANNED |
| LA12 | Restore drill on the shared host | Each product's backup can be restored in isolation on the shared host without touching any other product's data. | Restore to a disposable database; other products' database checksums unchanged before and after. | PLANNED |

### C. Gap items found in review

| # | Control | Requirement for this product | Test | Status |
|---|---|---|---|---|
| LG1 | Test authentication policy | Production builds never contain an enabled test-login bypass. Development may use synthetic test authentication where explicitly allowed. Staging may use controlled synthetic test authentication only where authorized and technically isolated. Production deployment fails closed on any test-login setting. No bypass may access real accounts or customer data. | Automated build and deployment validation: the production bundle and configuration contain no enabled bypass; startup refuses to run in production with test login enabled; a request to the test-login path returns 404 in production; a failed check blocks the release. Staging isolation test: a separate database, and no real account is reachable. | PROPOSED (CR-07) |
| LG2 | Mobile sign-in and session tests | Sign-in, token refresh and logout work for native apps as well as the web, for each product that has or plans a mobile app. Tokens are kept in secure device storage. | Emulator or device tests on iOS and Android: sign-in, refresh after expiry, logout revokes the token, and no token appears in plain app storage. | PROPOSED (CR-07) |
| LG3 | Launch-language coverage of new pages and emails | Sign-in, OTP and reset emails, error pages, 404, privacy and terms pages are provided in each launch language of the product, with native review recorded. | CI catalogue check: no missing or unused keys for launch languages; native review recorded with reviewer, date and string version (global category 21). | PROPOSED (CR-07) |
| LG4 | Required document set | Each product maintains THREAT_MODEL.md, DATA_INVENTORY.md, SECURITY.md, RISK_EXCEPTIONS.md, TEST_MATRIX.md and runbooks for backup restore, incident response, key rotation and uptime alerts. | CI check: each required file exists and its links resolve; TEST_MATRIX.md has one row per control in this section. | PROPOSED (CR-07) |
| LG5 | Recovery objectives (RTO and RPO) | Recovery time and recovery point objectives are measured and approved by the owner. This document sets no values. | Restore drill records measured recovery time and data age; owner approval is recorded. READY_FOR_OWNER until both exist. | OPEN |
| LG6 | Staging host definition | The owner names the staging host, or records that staging runs in ephemeral CI. The live OraOne host is never used as staging. | Environment classification check (CR-05 AC-21) with recorded evidence. | OPEN |
| LG7 | Load evidence before capacity claims | Any capacity or concurrency statement cites a measured load run on a disposable environment. | k6 or equivalent run recorded with environment, load profile and results; no capacity claim is made without it. | PROPOSED (CR-07) |
| LG8 | Backup and recovery requirements (product-specific) | Each product's backup and recovery requirements come from its own approved documents; no other product decision applies. CareerScope only: off-host backups and a successful restore drill before public launch; RPO target one hour; a 24-hour fallback needs a separate, explicitly approved exception. Compliance is demonstrated by restore evidence, not assumed. OraOne OS, FixHub24 and LensMate reference their own approved backup, recovery, hosting and release requirements, and their recovery targets are justified separately. | Restore drill evidence shows the product's own recovery objective is met before launch. CareerScope: off-host copy and restore drill recorded before public launch; the 24-hour fallback is blocked until its exception is approved in blocker.txt. | PROPOSED (CR-07); exception OPEN |

Status values follow the document vocabulary. These controls are specified here. None is implemented, tested or verified by this document.

## Cleanup baseline reference (v1.2 round)

- Requirement matrix: `Viswatra-Cleanup-Requirement-Matrix-v1.2.md` (delivered with this document set).
- CareerScope applicable items: 156. ALREADY_COVERED 97; PARTIALLY_COVERED 28; NEW_REQUIREMENT 31; BLOCKED_BY_EXTERNAL_DECISION 0; NOT_APPLICABLE 1.
- Code status of every item is NOT_ASSESSED. Documentation status does not establish implementation status.
- Every NEW_REQUIREMENT item is PROPOSED and needs owner approval recorded in `blocker.txt`. Legacy authentication removal (CL-A17, CL-A18, CL-D12) waits for a verified migration decision and deletes no identity records, password hashes, columns, migrations or accounts.
