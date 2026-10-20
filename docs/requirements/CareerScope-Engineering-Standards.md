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
| Email | Resend (primary), second provider behind a switch flag (D11) | Sign-in OTP and notifications |
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
- AI calls: go through one gateway module with quota, timeout, fallback, and prompt-injection filtering (v12 section 9). No AI provider keys in the frontend
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

- Protected main branch. No direct pushes. Pull request required
- Branch names: `feature/`, `fix/`, `chore/`, `security/` followed by a short description
- Commits: small and focused. Messages state what changed and why
- Pull request template includes: linked requirement (v12 section and decision ID), test evidence, screenshots for UI changes, migration notes, and rollback plan
- Required checks before merge: lint, typecheck, unit tests, integration tests, sanity tests, dependency audit, secret scan, build
- Pull requests need one human approval. An AI agent cannot approve its own work (see Autonomous mode below for the agent-loop exception)
- Staging deployment runs from the designated development branch through a protected staging environment, with pre- and post-deployment validation (Goal section 16B.4). Staging never runs on the production host
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
- Workflow security follows Goal section 16B.8: explicit least-privilege permissions, actions pinned to commit SHAs, no production secrets in test workflows, concurrency controls for deployments
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
