# CareerScope v12 test evidence matrix

## Account Security settings localization (2026-10-22; local working tree)

| Check                                                           | Result                                                | Scope / evidence limit                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --import tsx --test apps/web/src/lib/locale.test.ts`      | PASS; 5/5                                             | Covers approved locale validation, navigation/reminder translations, account-security strings/interpolation, and localized safe API-status fallback.                                                                                     |
| `npm run gates:test`                                            | PASS; 101/101 unit tests and registered policy checks | Includes source integrity, privacy, deploy gate, EOL, lint and typecheck.                                                                                                                                                                |
| `npm run test:ui`                                               | PASS; exit 0                                          | Chromium, Firefox and WebKit authenticated journeys and two-account session-switch journeys; axe, keyboard, and eight responsive widths passed. Firefox diagnostic still records the open Next chunk loading warning; see `blocker.txt`. |
| Independent source review                                       | PASS                                                  | Read-only review of current account-security localization diff; no tests run by reviewer. Human Telugu/Hindi copy review remains outstanding.                                                                                            |
| `npm run build`                                                 | PASS                                                  | Local production build completed; CSP verification covered all 13 generated inline-script hashes. No deployment.                                                                                                                         |
| `npm run security:check`                                        | PASS                                                  | Privacy scan clean and `npm audit --omit=dev --audit-level=high` found zero production dependency advisories.                                                                                                                            |
| `npm run format:check`, `npm run eol:check`, `git diff --check` | PASS                                                  | Prettier applied to the evidence table after its first format check identified a layout issue; final format check passed.                                                                                                                |

This evidence is for the local working tree, not a commit or hosted Actions run.
It verifies this surface only, not application-wide localization or native
translation quality. No provider call, live acceptance, production action or
human language review occurred.

## Existing reminder-preference locale and auth-boundary cache slice (2026-10-22)

On Node 24.19.0, `npm run gates:test` passed with 99/99 unit tests and the
registered lint, typecheck, privacy/source-integrity, deployment-policy and EOL
checks. `npm run format:check` and `npm run build` (CSP checks included)
passed. `npm run security:check` passed after the application-code changes with
zero high-severity production dependency findings; its later exact-candidate
rerun passed privacy scanning but timed out at npm's advisory bulk endpoint.
No dependency manifest or lockfile changed afterward. The final production-preview `npm run test:ui` exited 0 in Chromium,
Firefox and WebKit, including the suite's axe, keyboard and responsive cases.
The auth-boundary scenario exercises the ordinary logout/login path with a
distinct seeded second-owner profile; isolated unit tests assert owner-key
separation and unconditional query-cache clearing. Before navigating away from
the dashboard, the test drains the raw in-flight map for the exact GET
search-detail endpoint, so stale-route filtering cannot hide that request.

The changed UI localizes only the existing interview-reminder preference
control in English, Telugu and Hindi; native-language review is not complete,
and this does not establish app-wide localization or email/push delivery. The
first final-suite attempt failed on a stale old-route request and is not counted
as a pass; the corrected full all-engine run passed without relaxing the
console-warning, ownership, keyboard, axe or responsive checks. Hosted Actions,
live provider, production acceptance and deployment are not evidenced here.
`UI-CONSOLE-WARNINGS-01` and the authentication recovery-factor decision remain
open; this slice does not close release gates.

22 October, notification preference slice (Node v24.19.0): `npm run
test:integration` passed 59/59 with zero skips against disposable local
PostgreSQL/Redis, including the additive preference migration, owner/CSRF/input
validation, suppression/re-enable, preservation, and an API-driven concurrent
disable-vs-publisher serialization test. `npm run gates:test` passed (93/93 unit
tests plus approved-source/privacy/deploy/EOL checks, lint and typecheck),
`npm run test:domain` passed 839/839, `npm run security:check` passed with zero
production dependency vulnerabilities, and `npm run build` passed both
production builds with CSP verification of all 13 script hashes. The production
preview UI suite passed Chromium, Firefox and WebKit with axe, keyboard and all
eight responsive widths. A first development-server UI attempt failed the
strict console gate on React's development-only eval/CSP diagnostic; it was not
allowlisted and is not counted as the final UI result. `npm run db:generate`
reports no schema drift. Independent review approved the reminder preference's
owner-lock protocol and concurrency regression test. No hosted Actions,
production service, or deployment evidence is claimed.

Previously pushed main checkpoint (21 October 2026): 84 root unit/gate, 56 real-service
integration and 835 domain tests pass; all three browser engines and selector
journeys pass with axe/keyboard and all eight required responsive widths. Queue
restart/AOF, database restore, crash recovery, full-disk, build/CSP, formatting,
lint/typecheck and privacy checks pass. Exact commands and evidence limits are
in [the consolidation report](docs/MAIN-CONSOLIDATION-2026-10-21.md). Hosted CI,
live provider, legal and production acceptance remain separate unverified gates.
Latest local continuation at main `bbaeb666f44a6b74c3cafc455fbe36909fdc3b3f`:
`gates:test` passed 91 unit tests; `test:integration` 58/58; `test:domain`
839/839; `test:ui` passed Chromium/Firefox/WebKit with axe, keyboard and eight
widths; `test:queue-runtime`, `test:full-disk`, `test:crash-recovery`,
`test:database-recovery`, `security:check` and deployment-gate tests passed.
Database restore first failed because the test harness rejected this checkout's
dated synthetic service name; after a narrowly scoped allowlist correction, the
isolated restore passed and compared 21 tables. After that correction,
`gates:test` passed again (91/91 unit
tests plus policy, privacy, lint, typecheck and EOL checks). The 30-second local
performance run measured 18,095 requests, zero failures, 603.2 requests/second,
p50 12.62ms, p95 18.84ms and p99 23.79ms at concurrency 8; this is a synthetic
loopback regression measurement, not an SLO or production result. A bounded
124-second synthetic soak completed 2,655/2,655 operations, including one queue
restart, with no failed operations and zero final outbox/queue backlog, expired
leases, orphaned executions or temporary files. This is stability evidence, not
a 30-minute soak, production SLO or disaster-recovery proof. These are local
checks; exact-SHA hosted CI is blocked because GitHub Actions is disabled.
The 21 October local browser rerun additionally covers the eight viewport widths
required by the approved engineering standard (320, 360, 390, 768, 1024, 1280,
1440 and 1920px). Older dated failures below remain historical evidence.
The source inventory below retains its baseline assessment state. In particular,
BASE-01 through BASE-03 describe the original baseline SHA below and are not
current results. Current exact-main validation is recorded in `PROGRESS.md`;
the latest full dependency audit reported zero vulnerabilities, while hosted CI,
live provider, legal and production acceptance remain unverified.

Baseline SHA: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`.
319 source items are inventoried, not 319 executed tests. This initial matrix is
not complete AC-to-test binding coverage. Future required checks below are PLANNED,
never represented as existing/executed merely because a test name is proposed.

| ID                | Requirements                     | Existing check / exact context                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current result / evidence level                                                                                                                                                                                                                                                                                | Required follow-up                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BASE-01           | Existing source health           | `npm run gates:test`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Historical baseline result: PASS; 42 unit tests, 4 Node policy tests, 3 privacy tests; lint/typecheck/EOL/decision fixtures                                                                                                                                                                                    | Does not prove v12 completeness, coverage or full security audit; see exact-main validation in `PROGRESS.md`                                                                                                                                                                                                                                                                              |
| BASE-02           | Supply chain                     | `npm audit --json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Historical baseline result: FAIL; 5 high/7 moderate; no critical. Superseded by later exact-main full audit reporting zero vulnerabilities.                                                                                                                                                                    | Re-run after lockfile changes; hosted supply-chain workflow remains unverified                                                                                                                                                                                                                                                                                                            |
| BASE-03           | Production dependencies          | `npm audit --omit=dev --json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Historical baseline result: FAIL at all-severity audit; 3 moderate. Superseded by later exact-main production dependency audit reporting zero vulnerabilities.                                                                                                                                                 | Re-run after lockfile changes; hosted supply-chain workflow remains unverified                                                                                                                                                                                                                                                                                                            |
| SRC-TEST-01       | Approved sources                 | `npm run requirements:check` and `requirements:test`                                                                                                                                                                                                                                                                                                                                                                                                                                             | PASS local 5/5 and canonical snapshot check                                                                                                                                                                                                                                                                    | Source mutation/missing-input negative controls                                                                                                                                                                                                                                                                                                                                           |
| AUTH-TEST-01      | D1, 4.1, checklist 1             | `test-users.test.ts` existing private test-selection cases                                                                                                                                                                                                                                                                                                                                                                                                                                       | PASS local 6/6; production/staging/local configuration; module coverage 100% lines/branches/functions                                                                                                                                                                                                          | Hosted private-staging/production acceptance remains pending; no OTP proof                                                                                                                                                                                                                                                                                                                |
| AUTH-TEST-02      | D1/D11-R, 4.1, checklist 1–3/7–8 | `email-otp.integration.test.ts`, OTP challenge store tests, runtime tests, `scripts/check-ui.ts` Account Security assertions                                                                                                                                                                                                                                                                                                                                                                     | PARTIAL: local OTP API/session/Redis checks pass; 21 Oct Chromium/Firefox/WebKit run asserts verified and missing email-verification session states; no hosted/live-email proof                                                                                                                                | Resend-only live outage/delivery acceptance, recovery/device alerts, risk step-up, staff MFA, hosted provider and recipient acceptance remain outstanding; no second-provider sign-in routing is required by OA-2026-10-22-01                                                                                                                                                             |
| OWNER-TEST-01     | 4.2–4.10, checklist 11           | `apps/api/src/interviews.integration.test.ts` (`interview rounds are candidate-owned...`): a second authenticated synthetic candidate receives no first-owner profile/resume data; foreign saved-lead detail/history and interview list return 404; foreign resume list is empty; foreign resume deletion returns the existing non-enumerating 204 without invoking storage or deleting the owner's row. `applications-export.integration.test.ts` separately excludes foreign application rows. | PARTIAL local: targeted real-PostgreSQL integration test PASS on current working tree (Node 24.19.0); exact command `node --env-file=.env --import tsx --test apps/api/src/interviews.integration.test.ts` (1/1, zero skips). Synthetic candidate-to-candidate boundary only.                                  | Complete a route/resource inventory and denial matrix for every implemented owner-scoped resource and applicable role; document photos as not implemented rather than inventing them; add role-escalation/recruiter/admin evidence only when those role surfaces exist. Keep gate 11 NOT_VERIFIED until the full applicable matrix is covered and exact-SHA hosted evidence is available. |
| DATA-TEST-01      | 4.3/4.9, sections 6/9            | File storage/resume/queue/database recovery scripts; isolated PostgreSQL restore on current local test service                                                                                                                                                                                                                                                                                                                                                                                   | PARTIAL local: historical isolated restore passed with synthetic owner data; 21 table fingerprints and encrypted resume/parsed-result recovery matched. Current working-tree `npm run test:integration` passed 59/59 with zero skips.                                                                          | Full migration/schema/ownership/deletion audit and owner-approved restore/RPO/RTO evidence; current isolated restore is not production recovery proof                                                                                                                                                                                                                                     |
| SOURCE-TEST-01    | D10/D13/D14, 4.6/4.14            | shared job-source-policy tests; `collect.test.ts` no-permission and mixed-permission worker tests; API/worker/scheduler guards; `check-ui.ts` synthetic browser fixture                                                                                                                                                                                                                                                                                                                          | Local unit/API integration and Chromium/Firefox/WebKit rendered accessibility checks PASS; synthetic fixture only; no approved live-source profile or source-rights evidence                                                                                                                                   | Owner supplies source-specific permission evidence; review every capability separately; then authorized source provenance, golden-set coverage/stale/dedupe thresholds and public-display/indexing gates                                                                                                                                                                                  |
| APPLY-TEST-01     | D5, 4.8/4.9                      | `scripts/check-ui.ts` authenticated saved-lead journey: opens the synthetic employer destination in a new tab (`target=_blank`, `rel=noopener`), confirms the persisted lead remains `saved`, then requires the candidate to explicitly submit application evidence and checks the API response, Applications surface, and candidate-reported confirmation.                                                                                                                                      | PARTIAL local: `npm run test:ui` passed in Chromium, Firefox, and WebKit on the current working tree; the scenario uses synthetic candidate/job data. Opening the URL does not mutate application status. The UI explicitly states CareerScope does not submit the application or verify an employer response. | This covers the manual-apply baseline only. Separately verify API/database lifecycle transitions, notes/documents, timeline/history, concurrency, and a live canonical destination before release; no employer submission or production acceptance is claimed.                                                                                                                            |
| INTERVIEW-TEST-01 | D8, 4.10                         | `apps/api/src/interviews.integration.test.ts` and `scripts/check-ui.ts`                                                                                                                                                                                                                                                                                                                                                                                                                          | Node 24.19.0 current working-tree `npm run test:integration` passed 59/59 with zero skips; `npm run test:ui` passed Chromium, Firefox and WebKit with axe, keyboard and eight widths on the current UI harness. These are local checks, not hosted CI.                                                         | Local round, checklist, time-zone, status, resume-link, revision and in-app reminder evidence exists. Full channel preferences/policy, email/push delivery, hosted CI, human review and production smoke remain unverified                                                                                                                                                                |
| RECRUITER-TEST-01 | D2, 4.12/4.17                    | No employer authorization harness identified                                                                                                                                                                                                                                                                                                                                                                                                                                                     | PLANNED                                                                                                                                                                                                                                                                                                        | Unverified/unauthorized employer denial, approved vacancy posting/edit/lifecycle, role escalation and audit                                                                                                                                                                                                                                                                               |
| MESSAGE-TEST-01   | D4/D9/D11, 4.11/4.15             | Durable outbox tests exist, not channel delivery proof                                                                                                                                                                                                                                                                                                                                                                                                                                           | PLANNED                                                                                                                                                                                                                                                                                                        | Mock sends only: caps, recipients, disclosure/reply-to, selected/scanned attachments, quiet hours/digest/three locales, duplicate callbacks/suppression; real delivery owner-gated                                                                                                                                                                                                        |
| TRUST-TEST-01     | D6/D7, 4.4/4.5                   | No full verification/age/photo model identified                                                                                                                                                                                                                                                                                                                                                                                                                                                  | PLANNED                                                                                                                                                                                                                                                                                                        | Screen-only age storage/no raw DOB; exact tick evidence/date/expiry/revocation/appeal; optional-photo consent and role visibility if enabled                                                                                                                                                                                                                                              |
| ADMIN-TEST-01     | 4.16/4.17                        | Admin test identity isolation, not control-plane RBAC                                                                                                                                                                                                                                                                                                                                                                                                                                            | PLANNED                                                                                                                                                                                                                                                                                                        | Staff MFA/step-up, deny-by-default actions, reasons/dual approval, audit immutable/manual+automatic events, masked/time-limited exports and kill switches                                                                                                                                                                                                                                 |
| UX-TEST-01        | 4.18, CR-01, global 16–21/25–26  | `scripts/check-ui.ts` Playwright/axe harness checks errors, page exceptions/crashes and unhandled rejections in OTP, signup, authenticated candidate and test-account-selector journeys; deliberate HTTP failures match exact fixture route/status pairs                                                                                                                                                                                                                                         | Node v24.19.0 at code SHA `7bc55ef6d75db17261b1a773a26b1b9d4dd0b95d`: `npm run test:ui` exited 0 across Chromium/Firefox/WebKit; axe, keyboard and all eight widths passed.                                                                                                                                    | Hosted browser CI, Firefox console-warning classification, critical network-error policy, manual screen-reader and visual acceptance remain separate gates; synthetic fixtures do not establish live-provider behavior                                                                                                                                                                    |
| HUMAN-TEST-01     | 4.18, checklist 16/24            | No current manual acceptance result                                                                                                                                                                                                                                                                                                                                                                                                                                                              | MANUAL_REQUIRED                                                                                                                                                                                                                                                                                                | NVDA/VoiceOver/TalkBack/real device, native-language safety/legal/consent, visual acceptance; owner/counsel evidence                                                                                                                                                                                                                                                                      |
| OPS-TEST-01       | D12, 6/7, checklist 9–10/18–21   | Queue restart/AOF, database restore, crash, full-disk, performance and mixed-load soak scripts                                                                                                                                                                                                                                                                                                                                                                                                   | PARTIAL local: queue, restore, crash, disk passed; 30-second performance and 124-second synthetic soak had zero failures and drained final work.                                                                                                                                                               | 30-minute default soak, approved capacity targets, WAL/off-host, independent alerts, staging identity, and production restore/rollback remain outstanding; no production target used                                                                                                                                                                                                      |
| CI-TEST-01        | Goal 16B.11/global 27            | Read-only `.github/workflows/ci.yml` exists; repository Actions API currently reports disabled                                                                                                                                                                                                                                                                                                                                                                                                   | BLOCKED / GOV-02                                                                                                                                                                                                                                                                                               | Owner enables Actions and approves budget; then verify every required trigger, deliberate failure/coverage/secret/runtime/leakage/migration negative, and exact-SHA artifacts                                                                                                                                                                                                             |
| LEGAL-TEST-01     | 9/10/12, checklist 23–25         | No new legal/provider evidence inspected                                                                                                                                                                                                                                                                                                                                                                                                                                                         | EXTERNAL_REQUIRED                                                                                                                                                                                                                                                                                              | Counsel/legal/current notices and dates, provider no-training/rights, consenting field validation, owner GO                                                                                                                                                                                                                                                                               |

Each implementation must replace relevant PLANNED/NOT_RUN entries with exact test
files/names, fixture, role, locale/channel/environment, expected result, command,
run ID/SHA and actual result. Full source-item traceability remains incomplete
until that happens; no unmapped item is silently waived.

## Reduced-motion preference verification (2026-10-22)

- Profile unit tests validate the default `false`, strict boolean input, and
  exclusion from deterministic matching inputs.
- PostgreSQL integration validates persisted preference behavior, the minimal
  `/api/profile/accessibility` response, owner isolation, and unauthenticated
  denial. The complete integration run passed 59/59 with zero skips on Node
  24.19.0.
- `npm run test:ui` passed with exit code 0 against the production build in
  Chromium, Firefox, and WebKit. It saves the preference, verifies the
  document-level reduced-motion state, reloads, and confirms persistence;
  keyboard, axe, and responsive checks also pass in the suite.
- This is local automated evidence only. Manual screen-reader/device review,
  hosted CI, and product/design acceptance remain open.

## AUTH-TEST-03 — isolated email OTP primitive

At the original primitive-only checkpoint, `packages/core/src/email-otp.test.mjs` contained nine synthetic Node tests and was
listed in the `test:unit` script. It passed 9/9 directly, and also passed within
the full `npm run gates:test` run on Node 24.21.0 in a disposable bounded
container; the root unit suite completed 58/58 with no skips. Focused strict
TypeScript, ESLint and Prettier checks passed. The network-isolated production
build could not fetch the approved Inter font; the same `npm run build` then
passed in a disposable secret-free container with build network access, including
both CSP passes and coverage of all 12 inline-script hashes. A repository-wide
`npm run format:check` found one unrelated pre-existing formatting failure in
`design/DESIGN-INDEX.json`; no formatting change was made to that canonical
design index. This is narrow primitive evidence only: no login/API/session or
provider behavior exists. The full database/queue integration test list also
passed 49/49 against newly created, disposable PostgreSQL 17.6 and Redis 7.4.5
services with explicit synthetic configuration; the integration suite does not
exercise OTP persistence because no such flow exists. Browser tests were not run
for this core-only change. The independent matching/provider/resume domain suite
passed 30 files / 835 tests in the clean Node 24 container. The OTP tests cover
code shape, HMAC challenge
binding, secret mismatch, malformed values, expiry, attempt metadata and the
final allowed attempt. They do not establish email/IP rate limiting, account
enumeration resistance at the API boundary, delivery/failover, OTP login,
refresh-token families, device management, staff MFA or recovery.

## AUTH-TEST-04 — PostgreSQL-backed OTP challenge state

`packages/core/src/email-otp-challenges.test.ts` is registered in the serial
integration suite. On Node 24.19.0 it passed within the full local integration
run: 51 tests passed, 0 failed, 0 skipped, against newly created disposable
PostgreSQL 17.6 and three Redis 7.4.5 services bound to loopback, with explicit
synthetic environment values. It verifies normalized-email replacement,
keyed-email hashing (no raw address column), wrong-email rejection, successful
single-use consumption/replay denial, concurrent attempt serialization and the
five-attempt terminal state, and expiry deletion. The OTP code is not persisted.
This is database-layer evidence only: there is no request/verification API,
delivery provider, email/IP request limiter, account creation, session issuance,
refresh-token rotation, device/recovery flow or browser UI. Expired rows are
cleaned in bounded batches on issuance; a periodic retention caller still needs
to be wired when the API flow is integrated.

## AUTH-TEST-05 — Resend adapter and fallback boundary

`packages/core/src/email-otp-delivery.test.ts` passed 6/6 on Node 24.19.0.
Using a synthetic `fetch` implementation only, it verifies the fixed HTTPS
endpoint, bearer-header/body contract, normalized recipient, strict six-digit
input, redirect refusal, retryable-status classification, no provider response
body exposure, fallback only after retryable primary failure, no fallback for a
permanent primary configuration failure, and sanitized both-provider failure.
No network request, credential, account, real address or email send was used.
The generic fallback is only an interface; no second vendor was selected.

## AUTH-TEST-06 — Integrated OTP request, verification and session

`apps/api/src/email-otp.integration.test.ts` is registered in
`npm run test:integration`. On Node 24.19.0 the complete serial service-backed
integration command passed 53/53 against loopback PostgreSQL 17.6 and Redis
7.4.5. Its OTP scenario uses an injected synthetic provider (no Resend network
call) and verifies matching accepted request shapes for known/unknown addresses,
no implicit account creation, shared Redis cooldown across two independent API
instances, wrong code rejection, single-use replay rejection, concurrent
verification establishing at most one session, HttpOnly/Secure/SameSite/Path
cookie flags, email verification timestamp, provider-failure invalidation,
Redis-failure fail-closed behavior and OpenAPI route registration. It also
forces session-row persistence to fail after valid OTP consumption and asserts
the API returns a sanitized 503, creates no session, consumes the code, and
allows recovery only through a newly requested code after cooldown. The runtime
OTP tests verify that production requires the enabled flow and separate key.
This evidence is local-only; it does not establish DNS/domain verification,
inbox receipt, provider-level tracking configuration, fallback-provider
availability, shared-database migration or production session acceptance.

## AUTH-TEST-07 — OTP browser flow and cross-browser status

The OTP browser scenario in `scripts/check-ui.ts` uses mocked API responses and
checks request confirmation, invalid-code feedback, successful redirect,
resend cooldown, five viewport widths, axe findings and absence of OTP in
browser storage. Earlier focused and combined runs on 2026-10-20 completed
successfully against the then-current local build; those results are historical
for that worktree. The later email-change update passed its mocked browser flow
in Chromium and Firefox, but the full all-engine invocation failed afterward
in Firefox at the existing dashboard request-settlement check after repeated
successful `GET /api/leads` activity. WebKit was not reached. The latest local
combined browser/accessibility gate is FAIL/INCOMPLETE pending diagnosis and a
full pass on the current worktree. No real email or Resend session was used.

## Authentication-hardening evidence (2026-10-20)

| Check                                                    | Result                              | Evidence / limits                                                                                                                                                                                                          |
| -------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run gates:test`                                     | PASS, exit 0 on Node 24.21.0        | 69 unit tests; lint; 52-file test typecheck; requirements/source, privacy, deployment-gate, and EOL checks.                                                                                                                |
| `npm run test:integration`                               | PASS, 54/54, exit 0 on Node 24.21.0 | Fresh loopback PostgreSQL 17.6 / Redis 7.4.5; disposable per-test databases; AOF/noeviction queue Redis; synthetic OTP provider; no Resend network request.                                                                |
| `npm run build`                                          | PASS                                | Both production CSP build passes; 12 inline-script hashes verified.                                                                                                                                                        |
| `npm run format:check`                                   | PASS                                | Repository-wide Prettier check.                                                                                                                                                                                            |
| `npm run db:generate`                                    | PASS                                | Drizzle reported no schema changes.                                                                                                                                                                                        |
| `npm run security:check`                                 | Exit 0, finding remains             | Privacy scan passed. npm audit found 3 moderate `sprintf-js` advisories through Mammoth; a forced breaking downgrade was not applied.                                                                                      |
| `npm run test:ui` with `CAREERSCOPE_UI_BROWSER=chromium` | PASS, exit 0                        | Fresh rerun on Node 24, Next dev server on loopback, disposable local DB; existing routes, OTP UI, test selector, keyboard, five widths and axe completed. Earlier `ECONNRESET` did not reproduce; cause remains unproven. |

The integration rerun used fresh no-volume containers on loopback and removed
those exact containers after completion. Two earlier ad-hoc attempts failed due
to a mismatched disposable-Postgres credential and a Redis test instance that
lacked the queue AOF/noeviction requirements; they were harness setup failures,
not application assertions. The correctly configured complete suite passed
without changing tests or code. The first UI invocation failed before browser checks because the local ignored
`.env` lacks `APP_ORIGIN`; the retry injected the loopback origin only into the
test process. The existing script uses Node `--env-file=.env`; the file was not
inspected, printed, or edited. Shell-provided service URLs, OTP-disabled runtime
configuration, and a synthetic Resend key took precedence for this test process.
No live mail, shared database, hosted CI, provider/DNS validation, commit, push,
merge, or deployment occurred.

Historical rerun correction: the earlier Chromium exit-code gap was closed for
the Chromium-only command; it completed with exit 0. The final readiness addition is covered by four focused API
tests: limiter outage is fail-closed, OTP cannot expose password registration,
Redis readiness failure returns 503, and healthy readiness awaits both database
and configured critical-dependency checks.

### OTP session-persistence recovery regression (2026-10-20, Node 24.19.0)

After adding a real-PostgreSQL regression to
`apps/api/src/email-otp.integration.test.ts`, the complete serial
`npm run test:integration` command passed 54/54 (0 failed, 0 skipped) against
fresh loopback PostgreSQL 17.6 and Redis 7.4.5 services. The test injects a
database trigger that refuses session insertion after a valid OTP has been
atomically consumed. It verifies a sanitized 503, zero authenticated sessions,
no reusable consumed challenge, and successful recovery after a fresh code is
requested. The trigger is removed before retry. No Resend request was made.

The same checkout passed `npm run gates:test` on Node 24.19.0: lint, 52-file
typecheck, and 69/69 unit tests, plus source/privacy/deployment/EOL gates. The
new integration test passed Prettier check and `git diff --check`. Test services
were disposable, loopback-only, volume-free and removed after the run. This is
local regression evidence only; hosted/provider/production acceptance remains
unverified.

### OTP production-build and full browser rerun (2026-10-20, Node 24.19.0)

On the same uncommitted working tree, `npm run build` passed: TypeScript and
Next.js production compilation completed, and the second CSP build pass verified
all 12 generated inline-script hashes. The complete `scripts/check-ui.ts` run
then exited 0 with `CAREERSCOPE_UI_BROWSER=all`, exercising Chromium, Firefox,
and WebKit, including workspace flows, the real test-account selector, session
switching, keyboard navigation, responsive viewports, and axe checks. It used
fresh no-volume Postgres/Redis containers bound only to ephemeral loopback ports;
the exact containers and local web process were stopped after the run. No
persistent Compose service or database was used or modified.

The read-only full `npm audit --json` was rerun against the current lockfile and
returned 5 high and 7 moderate findings. Registry metadata still reports
`braces@3.0.3` as latest (no `3.0.4` exists), while the Next ESLint plugin pins
`fast-glob@3.3.1`; npm offers only a breaking Next ESLint config downgrade for
that chain. The `drizzle-kit` legacy esbuild loader and Mammoth CLI parser chain
also remain. No override, downgrade, suppression, or audit waiver was applied.
This is not a passing full dependency audit.

### OTP/security validation refresh (2026-10-20, Node 24.19.0)

| Check                                                                                     | Result                               | Evidence / limits                                                                                                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run gates:test`                                                                      | PASS, exit 0                         | 73/73 unit tests; 53 canonical test files type-check; approved-source, privacy, deployment-policy, EOL, lint checks pass.             |
| `npm run test:integration`                                                                | PASS, 55/55                          | Disposable loopback PostgreSQL and two Redis services; zero skipped; synthetic OTP provider; no live Resend calls.                    |
| `npm run test:domain`                                                                     | PASS, 835/835                        | 30 test files.                                                                                                                        |
| `node --env-file=.env --import tsx scripts/check-ui.ts` with `CAREERSCOPE_UI_BROWSER=all` | Earlier historical PASS; latest FAIL | Latest email-change flow passed in Chromium/Firefox; run failed later in Firefox dashboard request settlement, so WebKit did not run. |
| `npm run build`                                                                           | PASS                                 | Both Next.js production builds; second CSP pass verified all 12 inline script hashes.                                                 |
| `npm run format:check`, `npm run eol:check`, `npm run privacy:check`, `git diff --check`  | PASS                                 | Repository-wide checks; EOL scanner verified 471 LF-only text files and 820 tracked entries.                                          |
| `npm run security:check`                                                                  | Exit 0, findings remain              | Production dependency graph has three moderate Mammoth/argparse/sprintf-js findings.                                                  |
| `npm audit --audit-level=high`                                                            | FAIL, exit 1                         | Full graph has five high and seven moderate findings; no forced breaking downgrade, override or waiver was applied.                   |

The isolated Redis tests use two independent clients for a shared atomic limit;
OTP request and verification return sanitized 503 responses when the limiter
throws. The final browser matrix used an explicit test-process-only configuration
and disposable local services. Neither these tests nor the build establish live
email delivery, provider-domain authorization, legal approval, hosted CI or
production acceptance.

#### Integration service rerun (2026-10-20, Node 24.19.0)

The first invocation without service endpoint variables was rejected by the
integration guards (no database connection was attempted). A second invocation
used process-only loopback PostgreSQL/Redis configuration and passed 55/55, zero
skipped, against the existing local development test services. OTP delivery was
synthetic; no Resend call was made. This is local integration evidence only.

### Email-change verification and validation follow-up (2026-10-20, Node 24.19.0)

`apps/api/src/email-otp.integration.test.ts` covers two distinct address-bound
delivery messages, digest-only persistence, wrong-code rejection, unchanged
email after one code, update after both codes, replay denial, the updated
session-facing address, and OpenAPI registration. The full serial
`npm run test:integration` passed 55/55, zero skipped, against disposable,
loopback-only PostgreSQL 17.6 and Redis 7.4.5; fake delivery injection was used.
`npm run build` passed both Next builds and CSP hash verification. The canonical
`npm run gates:test` passed with 74/74 unit tests and 53 canonical test files
type-checked. The mocked browser journey for the account-security email-change
UI passed in Chromium and Firefox, including axe at 320/1440px and reflow checks
at five widths. The full browser command then failed later in Firefox because
the existing dashboard-quiescence check observed repeated successful
`GET /api/leads` requests throughout its 15-second wait; WebKit was not run.
Therefore the complete cross-browser gate remains **FAIL** despite the new
email-change path passing in two engines. No live Resend message, shared
database migration, hosted validation or production acceptance occurred.

### Current OTP boundary and API-unavailable regression (2026-10-20)

On the dirty task branch at base SHA `f23d33fcd7b844fd1cff8f88ab28fcd54cbc5d56`,
Node 24.19.0:

| Command                                         | Result                 | Scope                                                                                                   |
| ----------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`                             | PASS, 76/76            | Includes deterministic OTP expiry-after-row-lock and OTP 503 message regressions.                       |
| `npm run test:integration`                      | PASS, 55/55; 0 skipped | PostgreSQL 17.6; per-test scratch databases; two temporary Redis 7.4.5 instances; synthetic OTP sender. |
| `npm run typecheck`                             | PASS                   | Workspace and 54 canonical test files.                                                                  |
| `npm run build`                                 | PASS                   | Both Next.js production builds; CSP verified 12 inline hashes.                                          |
| `npm run lint`                                  | PASS                   | API, packages, workers, scripts and web.                                                                |
| `npm run format:check`, `npm run eol:check`     | PASS                   | Full repository format and line-ending checks.                                                          |
| `npm run privacy:test`, `npm run privacy:check` | PASS                   | Four privacy tests and tracked-tree scan.                                                               |
| `git diff --check`                              | PASS                   | No whitespace errors.                                                                                   |

The test process used ephemeral loopback Redis endpoints and removed both test
containers afterward; persistent application Redis and browser evidence
services were not used or stopped. The 55/55 integration result is current-run
evidence for that checkpoint; the browser failure described above was the latest
full browser result at that historical checkpoint and was superseded by the
21 October all-engine pass below.
Hosted CI, provider, and production evidence remain absent.

### Responsive browser acceptance refresh (2026-10-21, Node 24.19.0)

`npm run test:ui` PASS, exit 0 with `CAREERSCOPE_UI_BROWSER=all` on Chromium,
Firefox and WebKit. The run exercised the existing synthetic workspace, OTP
screens and test-account selector, keyboard checks, axe scans, and responsive
overflow checks at 320, 360, 390, 768, 1024, 1280, 1440 and 1920px. The existing
Playwright harness was extended to use those approved engineering-standard
widths without changing application runtime behavior or relaxing assertions.
The test used fresh loopback-only disposable PostgreSQL/Redis containers and a
local web process; the exact resources started for the run were stopped afterward.
This is local automated evidence only: hosted browser CI, manual assistive-
technology review, visual/design acceptance, live provider behavior and
production acceptance remain unverified.

The same browser run additionally verifies that the authenticated Account
Security page displays the session's recorded email verification date. The
fixture timestamp is synthetic and does not represent a live user or provider
delivery result.

### Current main service, recovery and performance rerun (2026-10-21)

On canonical `main` source at `5ce8410eb371c6b94de785d89389760a85c1009e`,
`npm run test:integration` passed 56/56 with zero skips using disposable,
loopback-only PostgreSQL 17.6 and Redis 7.4.5 containers (separate rate-limit
and queue instances; queue persistence AOF enabled, `noeviction`).
`npm run test:queue-runtime` passed, including restart/AOF restore and process
lifecycle; `npm run test:database-recovery` passed and compared 18 database
tables plus encrypted resume-object recovery; `npm run test:crash-recovery`
passed all four crash boundaries; `npm run test:full-disk` passed with zero
stranded temporaries and all reservations released.

`npm run test:performance` passed a 30-second synthetic run at concurrency 8:
17,684 requests, zero failures, 589.5 requests/second, p50 12.86 ms, p95
19.57 ms and p99 25.22 ms. This is local synthetic evidence, not a production
SLO, load target or proof of capacity for the full v12 concurrency requirements.
All disposable containers were stopped after execution. No shared database,
production service, live provider, deployment or hosted CI was involved.

### Expired email-change request retention regression (2026-10-21)

`scripts/enforce-search-retention.test.ts` now includes
`enforceRetention deletes expired email-change addresses but retains live requests`.
The test creates an isolated scratch PostgreSQL database with synthetic owners
and requests, then verifies one expired request is deleted, one unexpired request
remains, and the owning account email is unchanged. It failed against the prior
retention implementation and passed after the fix. The full
`npm run test:integration` command passed 56/56 with zero skips against disposable
PostgreSQL 17.6 and Redis 7.4.5. The focused retention test file passed 3/3.
No live provider, shared database, or production timer was contacted or changed.

### Exact-main full validation refresh (2026-10-21, Node 24.19.0)

The validation run started from clean local `main` at
`5e6ca2d7de2592ea5f675ec3fd479d1038d0a5f0`, matching `origin/main` after fetch.
Results: `npm run gates:test` PASS (84/84); `npm run test:integration` PASS
(57/57, zero skips); `npm run test:domain` PASS (835/835, 30 files);
`CAREERSCOPE_UI_BROWSER=all npm run test:ui` PASS on Chromium, Firefox and
WebKit with axe, keyboard checks and 320/360/390/768/1024/1280/1440/1920px
reflow coverage; `npm run build` PASS with both Next builds and CSP verification
for 12 inline-script hashes; `npm run format:check`, `npm run security:check`,
`npm audit --audit-level=low`, and `git diff --check` PASS (zero vulnerabilities
in the full npm audit).

Recovery checks also passed: queue restart/AOF and worker lifecycle (1/1),
PostgreSQL backup/restore and encrypted-object recovery (1/1; 21 tables
compared), four crash boundaries, and full-disk exhaustion/retry. The synthetic
30-second concurrency-8 run completed 18,079 requests with zero failures
(602.6 req/s; p50 12.56 ms, p95 19.19 ms, p99 23.68 ms). These are local,
synthetic results only, not hosted CI, production performance/SLO, live Resend,
or production restore evidence. GitHub Actions is disabled and the tested SHA
has no hosted status/workflow run.

### Deterministic match scoring-version contract (2026-10-21, Node 24.19.0)

The approved v12 requirement says each score records its scoring version. New
`scoreJob` outputs (including excluded listings) now carry
`deterministic-v1`. The strict shared match schema preserves pre-versioned
stored records as `scoringVersion: null`; it does not infer a version for old
scores. The API's OpenAPI contract documents the field. No score weights,
ranking, gating or persisted legacy data were changed.

Executed against the local change: focused score tests 30/30; domain suite
836/836 across 30 files; `npm run gates:test` PASS (84/84); `npm run build`
PASS including CSP verification; `npm run lint`, `npm run format:check`, and
`npm run privacy:check` PASS. The first integration attempt used local `.env`
credentials against a synthetic database and failed authentication; after
switching to disposable CI-matched PostgreSQL 17.6/Redis 7.4.5 services with
synthetic test credentials, `npm run test:integration` passed 57/57 with zero
skips. The failure was test-environment configuration, not an application
failure. No hosted CI or production evidence is implied.

### Hard-eligibility visibility regression (2026-10-21, Node 24.19.0)

`apps/workers/search/src/collect.ts` previously discarded a posting when its
deterministic match had `excludedReason`. v12 section 4.7 requires those
criteria to be advice, not filters. The worker collection test now asserts that
employment-type and excluded-keyword postings remain in the result with score
zero and the exact explanation. `node --import tsx --test
apps/workers/search/src/collect.test.ts` passed 19/19. `npm run gates:test`
passed 84/84, `npm run test:domain` passed 836/836, and service-backed
`npm run test:integration` passed 57/57 with zero skips against disposable
PostgreSQL 17.6/Redis 7.4.5. `npm run build` passed both production builds and
CSP verification. No real job sources were contacted; hosted CI remains
unavailable because Actions is disabled.

### Application export evidence (2026-10-21, Node 24.19.0)

| Check                                                                                             | Result                        | Scope                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/application-export.test.ts` (registered in `npm run test:unit`)                     | PASS, 2/2                     | CSV quoting, formula neutralization, candidate-reported columns, exclusion of raw description/internal IDs, stable empty export                        |
| `apps/api/src/applications-export.integration.test.ts` (registered in `npm run test:integration`) | PASS, 1/1                     | Isolated PostgreSQL; unauthenticated denial, session-derived owner isolation, application-only selection, cache/download headers, OpenAPI registration |
| `npm run gates:test`                                                                              | PASS, 86/86 unit tests        | Node policy, source integrity, privacy, deployment-gate checks, EOL, lint, strict typecheck and unit suite                                             |
| `npm run test:integration`                                                                        | PASS, 58/58; zero skips       | Disposable PostgreSQL 17.6, Redis 7.4.5 and AOF/noeviction queue Redis                                                                                 |
| `npm run build`                                                                                   | PASS                          | Both production builds and verification of all generated CSP inline-script hashes                                                                      |
| `CAREERSCOPE_UI_BROWSER=all npm run test:ui`                                                      | PASS, Chromium/Firefox/WebKit | Applications export link accessible and points at the API route; suite includes axe, keyboard and required responsive-width checks                     |
| `npm run format:check`, `npm run privacy:check`, `npm run eol:check`, `git diff --check`          | PASS                          | Formatting, privacy scanner, line endings and patch whitespace                                                                                         |

All fixtures were synthetic and services loopback-only. No Resend or other live
provider call was made; these local checks do not imply hosted CI or production
acceptance.

### Signup age-screen regression (2026-10-21, Node 24.19.0)

On the current local `main` change, `npm run gates:test` passed, including the
registered `apps/api/src/age-screen.test.ts` cases and signup API unit tests;
the suite reported 88/88 unit tests and completed strict typecheck, lint,
privacy, deployment-policy, source-integrity and EOL checks. The service-backed
`npm run test:integration` passed 58/58 with zero skips using disposable,
loopback-only PostgreSQL/Redis and a synthetic OTP sender. It verifies missing,
malformed, future and under-18 DOB rejection before challenge persistence or
delivery; legacy signup challenges without a pass result fail closed; successful
signup stores only `age_screen_passed=true`; and neither user nor challenge
schema contains a raw DOB column. OpenAPI documents the signup-only date field.

`CAREERSCOPE_UI_BROWSER=all npm run test:ui` passed on Chromium, Firefox and
WebKit. The signup journey checks the field/help text, confirms DOB is not sent
to OTP verification or browser storage, and runs existing keyboard, axe and
320/360/390/768/1024/1280/1440/1920px responsive checks. `npm run test:domain`
passed 836/836 across 30 files; `npm run build` passed both Next.js builds and
the 12-hash CSP verification; `npm run format:check`, `npm run eol:check`,
`npm run security:check` (zero production dependency vulnerabilities), and
`git diff --check` passed. These are local synthetic checks, not legal approval,
age/identity verification, hosted CI or production evidence. GitHub Actions is
disabled; no hosted run exists for the candidate SHA.

### Search-read settlement across SPA routes (2026-10-21, Node 24.19.0)

`scripts/ui-requests.test.ts` passed 2/2. The added case confirms only GET
`/api/searches` and `/api/searches/:id` reads started on an earlier route epoch
are ignored by the browser settlement barrier; current-route reads, writes,
search event streams and unrelated reads remain tracked. `scripts/check-ui.ts`
passed on Chromium, Firefox and WebKit, including axe, keyboard and all eight
required responsive widths. Exact pushed SHA: `444a832569ffae6da4e308b8e68bd574084f5180`.
This is browser-test harness behavior, not a product-runtime relaxation. The
run used synthetic users and disposable loopback PostgreSQL/Redis. Hosted CI is
unavailable while GitHub Actions is disabled.

### Candidate job-feedback capture slice (2026-10-21, local uncommitted source)

| Check                                                           | Result                                           | Scope / evidence limit                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run gates:test`                                            | PASS; 91/91 unit tests and policy gates          | Node v24.19.0; includes strict production/test type checking, lint, source, privacy, deployment-policy and EOL checks.                             |
| `npm run test:integration`                                      | PASS; 59/59, zero skips                          | Local synthetic, disposable PostgreSQL/Redis; includes ownership, CSRF, validation, upsert, rate limit, hydration, OpenAPI and retention behavior. |
| `npm run test:domain`                                           | PASS; 839/839 across 30 files                    | Existing provider/matching/resume/shared unit coverage.                                                                                            |
| `npm run test:ui`                                               | PASS; Chromium, Firefox, WebKit                  | Candidate feedback flow, axe, keyboard and eight responsive widths.                                                                                |
| `npm run build`                                                 | PASS                                             | Production builds; CSP verification covered all 13 generated inline-script hashes.                                                                 |
| `npm run security:check`                                        | PASS; zero production dependency vulnerabilities | Local dependency audit and privacy scan, not a hosted/container scan.                                                                              |
| `npm run db:generate`                                           | PASS; no schema drift                            | Generation check only; no shared/live migration was run.                                                                                           |
| `npm run format:check`, `npm run eol:check`, `git diff --check` | PASS                                             | Local formatting, line-ending and whitespace checks.                                                                                               |

These results apply to the local source tree, not a commit or hosted CI run.
No production migration, external provider, deployment or live acceptance was
performed. Candidate feedback is only an unverified report signal; v12's staff
moderation/investigation workflow remains incomplete. Review also identified
that the migration's non-concurrent index build requires staging/maintenance
impact assessment against real table size and traffic before production use.

### Approved v12 R1 source-content inventory (2026-10-21)

| Check                                                   | Result                                                                                | Scope / evidence limit                                                                                                                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run requirements:r1:check`                         | PASS; 518 content blocks, 297/319 exact legacy text links, 22 documented dispositions | Verifies the approved source SHA, generated artifact equality, and legacy cross-reference. Counts are not feature or test counts.                                                                                |
| `node --test scripts/r1-requirement-inventory.test.mjs` | PASS; 11/11                                                                           | Tests deterministic output, source identity, exact lineage (including substring collision), reconciliation integrity, per-section census, pending/conflict classification, scope exclusions and safe CLI output. |

All source blocks remain NOT_ASSESSED/NOT_RUN. This does not complete source-to-
requirement/test traceability; SOURCE-REVISION-01 remains open. No source approval,
pending amendment, implementation evidence or external validation was fabricated.

### OTP distributed IP-limit regression (2026-10-21)

| Check                                                                           | Result                  | Scope / evidence limit                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/email-otp.integration.test.ts`                                    | PASS, focused case      | Existing Redis-backed IP budget: ten requests across two API instances accepted; request eleven returns 429 and does not call the synthetic delivery provider. Rotating forwarded headers from an untrusted peer do not change the bucket. |
| `npm run test:integration`                                                      | PASS, 59/59; zero skips | Disposable local PostgreSQL/Redis, synthetic provider; no Resend call or production service.                                                                                                                                               |
| `npm run typecheck`, `npm run lint`, `npm run format:check`, `git diff --check` | PASS                    | Local Node v24.19.0 checks.                                                                                                                                                                                                                |

This is regression coverage for existing code, not approval or verification of
the pending A1.2/CR-07 LB8 contract, hosted Redis, production proxy trust, or
production rate-limit behavior.

### Unknown profile experience and seniority evidence (2026-10-22)

The profile schema/API/OpenAPI/browser contract now preserves an absent or
blank years-of-experience value as `null`, while explicit `0` stays known and
resume-derived years are used only when the profile value is unknown. Seniority
is not inferred as intern when both candidate title and experience evidence are
missing; the scorer uses its existing 0.7 neutral baseline instead of treating
absence as a 0.5 mismatch. These changes use scoring version
`deterministic-v2`; prior stored score records are not rewritten.

Node 24.19.0 local validation: focused matching tests 87/87; `npm run
test:domain` 850/850 across 30 files; `npm run gates:test` passed (including
unit, policy, privacy, EOL, lint and typecheck gates); `npm run test:integration`
passed 59/59 with zero skips; `npm run build` passed both production builds and
CSP verification of all 13 inline-script hashes; `npm run test:ui` exited 0 in
Chromium, Firefox and WebKit with axe, keyboard and responsive checks;
`npm run security:check`, `npm run format:check`, `npm run eol:check`, and
`git diff --check` passed. Independent read-only review approved the correction
and documented the still-ambiguous historical zero values as an open acceptance
issue. The first full cross-browser attempt ended on a Firefox route-fetch
transport error; isolated Firefox and the subsequent full Chromium/Firefox/
WebKit run passed without changing or skipping assertions. This is local
evidence only: hosted Actions and production acceptance remain unverified; no
historic profiles were rewritten.

### Exact-main validation refresh (2026-10-22, Node 24.19.0)

At `b072e7b3d7ab8c399d3eed179ade08f0c552a20d`, local checks passed:
`npm run gates:test` (94/94 unit tests and policy/source/privacy/deployment/EOL/
lint/typecheck gates), `npm run test:integration` (59/59, zero skips, disposable
loopback PostgreSQL/Redis), `npm run test:domain` (850/850),
`npm audit --audit-level=high` (zero vulnerabilities), and `npm run build`
(both Next.js builds and 13-hash CSP verification). The exact command
`CAREERSCOPE_UI_WARNING_DIAGNOSTICS=1 npm run test:ui` exited 0 against the
local production preview; Chromium, Firefox and WebKit passed their exercised
journeys, axe, keyboard and required responsive-width checks. Firefox still
reported the known Next chunk `loading-failed` diagnostic pattern; mixed
aborted, unmatched and HTTP-200 candidate request records do not prove a root
cause. No warning was suppressed or allowlisted. Hosted CI, production,
provider, legal and manual assistive-technology evidence remain unverified.
