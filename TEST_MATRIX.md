# CareerScope v12 test evidence matrix

Current integration checkpoint (21 October 2026): 84 root unit/gate, 56 real-service
integration and 835 domain tests pass; all three browser engines and selector
journeys pass with axe/keyboard and all eight required responsive widths. Queue
restart/AOF, database restore, crash recovery, full-disk, build/CSP, formatting,
lint/typecheck and privacy checks pass. Exact commands and evidence limits are
in [the consolidation report](docs/MAIN-CONSOLIDATION-2026-10-21.md). Hosted CI,
live provider, legal and production acceptance remain separate unverified gates.
The 21 October local browser rerun additionally covers the eight viewport widths
required by the approved engineering standard (320, 360, 390, 768, 1024, 1280,
1440 and 1920px). Older dated failures below remain historical evidence.
The source inventory below retains its baseline assessment state.

Baseline SHA: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`.
319 source items are inventoried, not 319 executed tests. This initial matrix is
not complete AC-to-test binding coverage. Future required checks below are PLANNED,
never represented as existing/executed merely because a test name is proposed.

| ID                | Requirements                    | Existing check / exact context                                                                                                                                          | Current result / evidence level                                                                                                                                              | Required follow-up                                                                                                                                                                                       |
| ----------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BASE-01           | Existing source health          | `npm run gates:test`                                                                                                                                                    | PASS; 42 unit tests, 4 Node policy tests, 3 privacy tests; lint/typecheck/EOL/decision fixtures                                                                              | Does not prove v12 completeness, coverage or full security audit                                                                                                                                         |
| BASE-02           | Supply chain                    | `npm audit --json`                                                                                                                                                      | FAIL; 5 high/7 moderate; no critical                                                                                                                                         | Compatible remediation or strict exception, never force downgrade                                                                                                                                        |
| BASE-03           | Production dependencies         | `npm audit --omit=dev --json`                                                                                                                                           | FAIL at all-severity audit; 3 moderate                                                                                                                                       | Parser dependency exposure assessment and safe fix                                                                                                                                                       |
| SRC-TEST-01       | Approved sources                | `npm run requirements:check` and `requirements:test`                                                                                                                    | PASS local 5/5 and canonical snapshot check                                                                                                                                  | Source mutation/missing-input negative controls                                                                                                                                                          |
| AUTH-TEST-01      | D1, 4.1, checklist 1            | `test-users.test.ts` existing private test-selection cases                                                                                                              | PASS local 6/6; production/staging/local configuration; module coverage 100% lines/branches/functions                                                                        | Hosted private-staging/production acceptance remains pending; no OTP proof                                                                                                                               |
| AUTH-TEST-02      | D1/D11, 4.1, checklist 1–3/7–8  | `email-otp.integration.test.ts`, OTP challenge store tests, runtime tests                                                                                               | PARTIAL: local OTP API/session/Redis checks pass; no hosted or live-email proof                                                                                              | Fallback provider selection/outage, refresh-token families, device/recovery controls, hosted provider and recipient acceptance remain outstanding                                                        |
| OWNER-TEST-01     | 4.2–4.10, checklist 11          | `database.test.ts`, `resumes.test.ts`, private test-access integration                                                                                                  | NOT_RUN in current v12 baseline audit                                                                                                                                        | Real isolated DB denial matrix for every existing/new role/resource; no test-role label as RBAC                                                                                                          |
| DATA-TEST-01      | 4.3/4.9, sections 6/9           | File storage/resume/queue/database recovery scripts exist                                                                                                               | NOT_RUN in this audit                                                                                                                                                        | Real DB migrations/constraints, disk/crash, duplicates/fencing, restore and later-deletion reconciliation                                                                                                |
| SOURCE-TEST-01    | D10/D13/D14, 4.6/4.14           | shared job-source-policy tests; `collect.test.ts` no-permission and mixed-permission worker tests; API/worker/scheduler guards; `check-ui.ts` synthetic browser fixture | Local unit/API integration and Chromium/Firefox/WebKit rendered accessibility checks PASS; synthetic fixture only; no approved live-source profile or source-rights evidence | Owner supplies source-specific permission evidence; review every capability separately; then authorized source provenance, golden-set coverage/stale/dedupe thresholds and public-display/indexing gates |
| APPLY-TEST-01     | D5, 4.8/4.9                     | Existing saved/application browser harness                                                                                                                              | NOT_RUN in current audit                                                                                                                                                     | Browser helper disabled, review/link never auto-Applied, candidate claim versus actual acknowledgement, notes/docs/timeline/concurrency                                                                  |
| INTERVIEW-TEST-01 | D8, 4.10                        | API integration and `scripts/check-ui.ts`                                                                                                                               | Local PostgreSQL integration 57/57; all-engine UI run exercised due reminder, mark-read, privacy assertions, axe, keyboard and eight widths                                  | In-app reminder path is locally tested; full channel preferences/policy, email/push delivery, hosted CI, human review and production smoke remain unverified                                             |
| RECRUITER-TEST-01 | D2, 4.12/4.17                   | No employer authorization harness identified                                                                                                                            | PLANNED                                                                                                                                                                      | Unverified/unauthorized employer denial, approved vacancy posting/edit/lifecycle, role escalation and audit                                                                                              |
| MESSAGE-TEST-01   | D4/D9/D11, 4.11/4.15            | Durable outbox tests exist, not channel delivery proof                                                                                                                  | PLANNED                                                                                                                                                                      | Mock sends only: caps, recipients, disclosure/reply-to, selected/scanned attachments, quiet hours/digest/three locales, duplicate callbacks/suppression; real delivery owner-gated                       |
| TRUST-TEST-01     | D6/D7, 4.4/4.5                  | No full verification/age/photo model identified                                                                                                                         | PLANNED                                                                                                                                                                      | Screen-only age storage/no raw DOB; exact tick evidence/date/expiry/revocation/appeal; optional-photo consent and role visibility if enabled                                                             |
| ADMIN-TEST-01     | 4.16/4.17                       | Admin test identity isolation, not control-plane RBAC                                                                                                                   | PLANNED                                                                                                                                                                      | Staff MFA/step-up, deny-by-default actions, reasons/dual approval, audit immutable/manual+automatic events, masked/time-limited exports and kill switches                                                |
| UX-TEST-01        | 4.18, CR-01, global 16–21/25–26 | `scripts/check-ui.ts` real Playwright/axe harness                                                                                                                       | 21 Oct 2026 local full matrix PASS on Chromium/Firefox/WebKit; axe/keyboard checks pass; required eight viewport widths exercised                                            | Hosted browser CI, manual screen-reader and visual acceptance remain separate gates; synthetic fixtures do not establish live-provider behavior                                                          |
| HUMAN-TEST-01     | 4.18, checklist 16/24           | No current manual acceptance result                                                                                                                                     | MANUAL_REQUIRED                                                                                                                                                              | NVDA/VoiceOver/TalkBack/real device, native-language safety/legal/consent, visual acceptance; owner/counsel evidence                                                                                     |
| OPS-TEST-01       | D12, 6/7, checklist 9–10/18–21  | Compose/backup/monitor/recovery/load scripts                                                                                                                            | NOT_RUN in this audit                                                                                                                                                        | Dedicated disposable fault/load/restore; owner targets, WAL/off-host, independent alerts and staging identities; no production test target                                                               |
| CI-TEST-01        | Goal 16B.11/global 27           | Workflows currently absent                                                                                                                                              | BLOCKED / GOV-02                                                                                                                                                             | Every required trigger and selector uses real command; deliberate failure/coverage/secret/runtime/leakage/migration negatives prevent promotion, exact SHA artifacts                                     |
| LEGAL-TEST-01     | 9/10/12, checklist 23–25        | No new legal/provider evidence inspected                                                                                                                                | EXTERNAL_REQUIRED                                                                                                                                                            | Counsel/legal/current notices and dates, provider no-training/rights, consenting field validation, owner GO                                                                                              |

Each implementation must replace relevant PLANNED/NOT_RUN entries with exact test
files/names, fixture, role, locale/channel/environment, expected result, command,
run ID/SHA and actual result. Full source-item traceability remains incomplete
until that happens; no unmapped item is silently waived.

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
