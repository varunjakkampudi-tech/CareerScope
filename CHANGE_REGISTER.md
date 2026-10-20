# Change and rollback register

| Integration / task                                                                                             | Scope                                                                                                                                                               | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                 | Risk / migrations                                                                                                                                                                                                 | Recovery                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `2a1eb65d67151c485cddd417b6c249146c017a35`                                                                     | OA-2026-10-20-01 governance/source register and thin AGENTS entry point                                                                                             | Independent governance_review APPROVE; format/privacy/EOL/diff checks; baseline gate suite                                                                                                                                                                                                                                                                                                                               | Documentation/policy only; no schema/runtime/settings/provider change                                                                                                                                             | Retain commit/history; if correction needed, apply a new reviewed governance commit, never rewrite history or silently revoke owner approval                                                                                   |
| Current baseline-audit task                                                                                    | Approved source snapshots, initial gap/test/quality inventories and activation evidence                                                                             | Independent baseline_audit_review APPROVE; source-integrity 4/4; format and diff checks                                                                                                                                                                                                                                                                                                                                  | No runtime/schema change; source snapshots immutable                                                                                                                                                              | New corrective commit; preserve approval hashes and disclose Goal LF, hard-break and final-newline normalization                                                                                                               |
| `f468643db8d602a8f07238939b66d3744fff04c6` + `c8086f875534d45b15d42bd29042fe62d948d3c5`                        | Isolated email OTP core primitive and subsequent validation-evidence reconciliation on `codex/task/email-otp-auth`                                                  | Node 24 OTP tests 9/9; full gates 58/58; domain 30 files / 835 tests; serial disposable-service integration 49/49; production CSP build PASS; targeted docs formatting/privacy/diff PASS; repo-wide format check has one pre-existing `design/DESIGN-INDEX.json` failure                                                                                                                                                 | No runtime flow integration, API, DB, migration, provider or secret; auth code requires independent and owner review before promotion                                                                             | Keep task commits isolated; if defects are found, make a new reviewed correction and rerun gates. Do not promote until fresh independent review and required owner review are complete                                         |
| `471788ea165600a7a445d2b7bf64552109544352` — guarded legacy-identity retirement on `codex/task/email-otp-auth` | Remove unused active `users.externalSubject`/authentication-phone declarations and add guarded forward migration 0019; remove the stale session query/type fallback | Node 24.19.0 `npm run gates:test` passed (58/58 unit; includes lint, strict typecheck and privacy/deploy-policy checks); full serial integration passed (50/50) against disposable loopback PostgreSQL 17.6 and three Redis 7.4.5 services; targeted migration test is included. Production web build and two-pass CSP verification passed (12 hashes); full repository formatting, EOL, privacy and diff checks passed. | Migration takes an exclusive lock and deliberately fails while any real legacy values remain; no shared database migration or data cleanup is authorized/performed. Historical migrations 0017/0018 are retained. | Keep on sensitive task branch pending independent and owner review; perform privacy-preserving preflight and owner-approved disposition before any shared migration. Do not bypass the migration guard or delete account data. |

Main remains at `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`. Nothing in
this register authorizes production, protected-main promotion or external actions.

## Production test-access guard task

Base: `54e09da604d4f67742bea343d3a9a268c1ee9bb1` on local development.
Scope: explicit deployment environment, production selector prohibition and
production Compose's pinned disabled access; no migration or hosted change.
Independent implementation review: `production_guard_review`, APPROVE.
Evidence: six targeted tests pass; guard module 100% line/branch/function coverage;
strict changed-file lint/privacy pass; Compose config validates using synthetic
variables and `--quiet` (no rendered secrets). Broad Node 24 gate rerun passes:
44/44 unit, policy 4/4, source 5/5, privacy 3/3 plus scan, deploy fixtures,
lint/typecheck/EOL; complete format and diff checks pass.

Recovery: preserve this commit and apply a reviewed corrective commit if needed.
Do not roll back to a production test-login bypass. Public production sign-in
must stay unavailable until approved OTP is implemented and verified. Existing
session data, account ownership, migrations and proxy password controls are unchanged.

## CI/deployment gate independence task

Base: `a552f722644a37f9cfa951e0b2b8ddfa9f088076` on local development.
The local workflow checker now allows a CI-only validation workflow while
remaining fail-closed if a deployment workflow exists without CI. No deployment
workflow is currently tracked or active; if `deploy.yml` is restored, the
checker requires manual-only dispatch, main-revision verification, a protected
environment, and no bypass. Added isolated fixture tests for CI-only,
no-workflow, deploy-only, production-environment rejection, and CI dispatching
deploy from a multiline shell step. Targeted suite passed 5/5; independent read-only
review `ci_gate_review` APPROVED. This is local checker evidence only; there is
no hosted workflow execution evidence. GitHub Actions remains disabled pending
the owner-controlled setting transition documented in `blocker.txt`.

Recovery: retain the task commit and apply a corrective commit if needed; do
not weaken the production deployment gate or use it to enable hosted Actions.

## OTP challenge persistence and delivery boundary (local task branch)

Scope: additive `email_otp_challenges` migration/store and injected Resend plus
provider-neutral failover adapters on `codex/task/email-otp-auth`. The store
persists only challenge ID, keyed normalized-email hash, OTP digest, attempt
count and timestamps; no raw address/code column exists. Delivery tests use
synthetic fetch only. No HTTP login endpoint, session issuance, account
creation, rate limiter, fallback-vendor selection, real provider call or
external configuration was added.

Evidence on Node 24.19.0: `npm run gates:test` exited 0; focused unit run
64/64; full serial disposable-service integration 51/51 against loopback
PostgreSQL 17.6 and Redis 7.4.5; adapter tests 6/6 (included in the 64 unit
tests); two-pass production build/CSP verified all 12 generated inline-script
hashes; format, EOL and privacy checks passed. These are local engineering
results, not hosted/production authentication acceptance. The migration has
not been applied to shared data. Independent security/auth review and owner
review remain required before promotion.

Recovery: keep the schema change additive and isolated to this task branch.
Any migration rollback or account/auth flow decision requires fresh review;
do not run migration 0020 against shared, staging or production databases.

## Resend OTP HTTP and UI integration (2026-10-20, local uncommitted work)

The previous challenge-only entry is historical and superseded by the current
working-tree changes. Added `/api/otp/request` and `/api/otp/verify`, server-only
Resend delivery, the existing-user session transaction and verification marker,
distributed Redis request/attempt controls, fail-closed runtime configuration,
OTP sign-in UI, OpenAPI contracts, and forward migration
`0021_mushy_stepford_cuckoos.sql`. Password compatibility for legacy API tests
is now behind explicit `testHarnessPasswordLogin`; production composition does
not enable it. A narrow privacy-scanner exception permits only the exact
operational `noreply@careerscope.tech` mailbox while same-domain personal
addresses remain detectable.

Node 24.19.0 local evidence: `npm run gates:test` passed, including 65 unit
tests, lint, 51-file typecheck, policy/source/privacy/deployment gates and EOL;
`npm run test:integration` passed 53/53 with disposable per-test databases and
loopback Redis; `npm run test:domain` passed 30 files/835 tests; `npm run build`
passed both CSP builds with all 12 inline script hashes; `npm run format:check`
passed; `npm run db:generate` reported no schema drift. The isolated corrupt-PDF
test that once exceeded its five-second limit passed on immediate rerun; the
full domain suite then passed without a timeout. `npm run security:check`
reported the known moderate `sprintf-js` production dependency path; no breaking
upgrade was applied. The full multi-engine UI suite is not green yet; the
request-settlement guard failed during Chromium route navigation. Focused
Chromium emitted its end-of-suite success markers. A targeted Firefox run
completed with exit code 0. A fresh-server WebKit run reached its end-of-suite
success markers, including axe/reflow, but its process exit code was
unavailable. The full multi-engine suite still has no clean exit.

No live Resend request, actual email delivery, domain/tracking configuration,
real mailbox verification, shared database migration, hosted CI, commit, push,
merge or deployment occurred. No `.env` values were read, changed or displayed.
Production remains on HOLD pending `AUTH-01` / `PROVIDER-01` and the browser
acceptance follow-up. The entire feature change set remains uncommitted on the
existing task branch; the tracked base SHA is unchanged.

### Shared rate-limit outage contract (2026-10-20)

The API now converts exceptions from the shared Redis rate limiter into a
stable 503 before performing route side effects. It logs only request
correlation metadata, not limiter keys or account/owner identifiers. OpenAPI
declares 503 as a possible shared-dependency failure for operations, and unit
plus service-backed regressions verify fail-closed behavior. The returned 503
does not claim the limiter recovered; retry policy remains client-controlled.

### Redis readiness probe and Chromium exit verification (2026-10-20)

Production API composition now makes `/api/health` require both PostgreSQL
`SELECT 1` and Redis `PING`; either critical dependency failure returns a safe 503. Four focused tests pass, including successful readiness and Redis outage.
Node 24 canonical gates pass (69 unit tests), DB/Redis integration passes 54/54,
production CSP build passes, and a fresh Chromium-only browser run exits 0. The
earlier Chromium `ECONNRESET` did not reproduce; the cause is unknown, so no fix
is claimed for that transient. Full cross-browser rerun, live Resend, approved
legal/signup acceptance, fallback provider and independent security review
remain incomplete.

### Production-auth task validation follow-up (2026-10-20)

- Added API regressions for sanitized fail-closed OTP request/verification
  behavior when Redis rate limiting is unavailable.
- Exercised the atomic limiter from two independent Redis clients and confirmed
  the aggregate limit is shared.
- Removed the refresh-reuse log's session-row identifier and added session ID
  fields to structured-log redaction.
- Corrected Terms and Privacy draft statements about the implemented but
  default-disabled registration/consent capability. The documents remain
  counsel drafts and are not active acceptance documents.
- Final local evidence: gates 73/73 unit tests; integration 55/55; domain
  835/835; Chromium/Firefox/WebKit plus axe; production build/CSP, formatting,
  EOL, privacy scanner and `git diff --check` all pass.
- Dependency audit remains unresolved (full graph 5 high/7 moderate; production
  graph 3 moderate). Provider domain/tracking/inbox, OTP secret and legal
  approval/configuration remain external/human gates. No live email, shared DB
  mutation, commit, push, merge or deployment occurred.

### Dual-address email-change follow-up (2026-10-20)

- Added the `email_change_requests` table and migration 0025, owner-bound
  current/new address challenges, digest-only persistence, five-attempt/expiry
  handling, generic target-address conflict, CSRF-protected API routes, and
  Account Security UI. Current-address delivery includes the change-request
  notice. The account email changes only after both address codes verify.
- Added service-backed integration coverage and a mocked browser journey. The
  integration suite passed 55/55 with zero skips on disposable loopback
  PostgreSQL 17.6 and Redis 7.4.5. The email-change browser journey passed in
  Chromium and Firefox, including axe and five responsive widths; the full
  all-browser run later failed in Firefox at the existing dashboard-quiescence
  check after repeated successful `GET /api/leads` activity. WebKit did not
  run, so the complete browser matrix remains FAIL. Provider delivery is
  injected in tests; no Resend request or live email occurred.
- `npm run build`, `npm run gates:test` (74/74 unit), `npm run test:domain`
  (835/835), `npm run format:check`, privacy scan/tests, and `git diff --check`
  passed. `.prettierignore` excludes only plain-text `blocker.txt`, which
  Prettier cannot parse. Independent security review, hosted
  migration/provider verification, and production acceptance remain pending.
  No shared database change, commit, push, merge or deployment occurred.

### OTP expiry and 503 error presentation (2026-10-20)

- `packages/core/src/email-otp-challenges.ts`: sample verification time after
  acquiring the challenge row lock to prevent stale expiry decisions.
- `packages/core/src/email-otp-challenges.clock.test.ts`: deterministic
  regression verifies expiry at the boundary after lock acquisition.
- `apps/web/src/lib/api.ts` and `apps/web/src/lib/api.test.ts`: provide safe
  status-specific 503 guidance, including approved sign-in outage wording;
  assert server details remain hidden.
- Validated on Node 24.19.0: 76/76 unit, 55/55 real-service integration,
  typecheck, build/CSP, lint, format, EOL, privacy tests/scan, and diff check.
- Work remains uncommitted and unintegrated pending independent auth review.
  No provider request, shared migration, push, merge, or deployment occurred.
