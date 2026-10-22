# CareerScope v12 engineering progress

## Saved-job tag slice — post-review verification refresh (2026-10-22)

The local saved-job tagging change was developed on `main` from base SHA
`9ea612ec720e1c2c9b6a1d91b889f1589675bbd2` and checkpointed locally as
`d758b11798323b912ceb73fd7d256ba556580b3b`; publication is pending the remote
fast-forward verification described in the blocker register. The
latest review-driven hardening adds PostgreSQL constraints that match the API
tag contract (bounded one-dimensional arrays, nonblank trimmed values, comma
exclusion, case-insensitive uniqueness, and Unicode code-point length bounds).
The editor's UTF-16 input limit and reload assertion now match that contract.
No runtime behavior outside saved-job tag validation/persistence and its
existing edit surfaces was intentionally changed.

Fresh local evidence on Node 24.19.0: `npm run test:ui` exited 0 across
Chromium, Firefox, and WebKit; `npm run gates:test` exited 0, including 96/96
unit tests, source-integrity, privacy, deployment-policy, EOL, lint, and
typecheck; formatting, security (`npm audit --omit=dev --audit-level=high`,
zero findings), and `git diff --check` passed. The isolated service-backed
PostgreSQL migration/ownership test and integration suite also passed in this
local worktree. A read-only independent review identified and drove fixes for
the UI/database contract mismatches; its remaining non-blocking note is that
Unicode case-fold equivalence may vary by PostgreSQL collation. This is local
verification only: hosted CI, production acceptance, commit, and push are not
claimed.

Progress accounting remains deliberately separate: the whole-product estimate
is not reproducible from the current requirement inventory, and the formal
release ledger remains 0/25 verified. This slice is concrete local progress,
not evidence that the overall goal is 90% complete.

## Saved-job tag organization slice (2026-10-22)

Implemented the approved v12 §4.9 saved-job tags capability on local `main`
(base commit `9ea612ec720e1c2c9b6a1d91b889f1589675bbd2`). Tags are candidate-owned
data, bounded and normalized at the API/domain boundary, persisted with an
additive PostgreSQL migration, included in optimistic revision/history records,
and editable/displayed on the existing Saved Jobs surface. Existing notes,
application status, and evidence semantics remain separate. The UI regression
checks edit, save, history refresh, and reload persistence. Design placement
uses the existing saved-jobs surface; no new screen or unsupported behavior was
invented. Folders and the other §4.9 gaps remain open.

Evidence on Node 24.19.0 for this local change: `npm run build` passed both
Next.js production builds and CSP verification (13 script hashes); `npm run
gates:test` passed, including 96/96 unit tests, source-integrity, privacy,
deployment-policy, EOL, lint and typecheck (61 canonical test files);
`npm run test:integration` passed 59/59 with zero skips; the production-mode
`npm run test:ui` passed Chromium, Firefox and WebKit, including axe, keyboard
and eight viewport widths; `npm run security:check` reported zero high-severity
production dependency vulnerabilities; `npm run db:generate` reported no
schema drift; formatting and type/lint checks passed. One initial browser
attempt was not counted: it used system Node 22 and had no web server running;
the successful run used Node 24 and the built app. This is local evidence only,
not hosted CI, deployment or production acceptance. The code is still a local
change at the base SHA above; no push or deployment occurred. The go/no-go
ledger remains 0/25 verified, and no defensible whole-goal percentage can be
derived from the source-block inventory. This slice must not be reported as a
whole-product completion percentage.

### Saved-job tag round-trip hardening (2026-10-22)

Review found that the tag editor uses commas as separators while the API would
accept a comma inside an individual tag. A subsequent edit could therefore
split one server-accepted value into several values. The shared tag validator
now rejects commas, and the OpenAPI schema describes that rule plus trimming,
case-insensitive uniqueness and the 12-tag/32-character limits. A regression
test covers the delimiter boundary. This is a local code change on `main`; it
has not been independently reviewed, committed or pushed.

Node 24.19.0 verification after the correction: `npm run test:unit` passed
96/96; after formatting the OpenAPI source, the focused lead-tag tests passed
2/2, typecheck passed (61 canonical test files), lint passed, and
`npm run format:check` passed. `npm run test:integration` passed 59/59 with
zero skips; `npm run build` passed both production web builds and CSP
verification (13 hashes); `npm run db:generate` reported no schema drift; and
`npm run gates:test` and `npm run security:check` passed; the latter found zero
production dependency vulnerabilities. `git diff --check` passed.
After the delimiter correction and the 406-character editor-limit regression
assertion were both in place, `npm run test:ui` completed successfully in
Chromium, Firefox and WebKit, including axe, keyboard interaction and eight
responsive widths. This is local browser evidence only. Hosted CI and
production acceptance remain unverified. The change remains uncommitted and
has not received an independent review or been pushed.

### Saved-job tag preservation on application-stage note edits (2026-10-22)

Review found that the shared notes form sent the unchanged tag array even on
the Applications surface, where tag editing is unavailable. Once a tagged
lead had moved to `applied`, the API correctly rejected that payload because
tags are mutable only in saved/archived stages. The form now omits `tags`
unless the user actually changed them. A browser regression saves notes on the
Applications surface, asserts the request contains no tag mutation, then
reopens the record on Saved Jobs and verifies the tags persist.

Node 24.19.0 evidence after this fix: `npm run build` passed with all 13 CSP
hashes verified; `npm run test:ui` passed the full Chromium/Firefox/WebKit
suite with axe, keyboard and eight responsive widths; `npm run gates:test`
passed including 96/96 unit tests, lint and typecheck; `npm run
test:integration` passed 59/59 with zero skips; `npm run security:check`
reported zero high-severity production dependency findings; `npm run
format:check`, `npm run eol:check`, `git diff --check`, and `npm run
db:generate` passed with no schema drift. These are local checks only. Hosted
CI remains unavailable, and the change is uncommitted and not independently
reviewed.

## Main synchronization and exact-checkpoint validation (2026-10-22)

Validated local `main` at `4dd977f71726a5fa24037e4930db7d8a00f3d200` and
normally pushed the two local commits `5ab8239af45fe81886a4450761af9bd6a5aec950`
and `4dd977f71726a5fa24037e4930db7d8a00f3d200`. After fetching, local `main`
and `origin/main` resolve to the same SHA; the worktree is clean. Node 24
validation on this candidate: `npm run gates:test` passed, including 94/94 unit
tests, source-integrity, privacy, deploy-policy, EOL, lint and typecheck;
`npm run test:integration` passed 59/59 with zero skips; `npm run test:domain`
passed 839/839; `npm run build` passed both Next.js builds and CSP verification
for 13 hashes; `npm run security:check` found zero production dependency
vulnerabilities; `npm run format:check` passed; and `npm run test:ui` completed
Chromium, Firefox and WebKit journeys with axe, keyboard and eight responsive
widths. These are local checks only. GitHub Actions remains disabled and the
exact-SHA run query returned no runs; production, hosted-provider, human
accessibility and launch acceptance were not performed.

Progress accounting correction: the external audit's 44% is explicitly
approximate and cannot be reproduced from the current source-of-truth. The
approved R1 inventory enumerates 518 overlapping source-content blocks, not
independent features; all 518 are still `NOT_ASSESSED`/`NOT_RUN`. The formal
go/no-go ledger remains 0/25 verified. Therefore no defensible aggregate
implementation-completion percentage is currently available. Report 0/25 only
as formal release-gate verification, not as overall product completion; do not
substitute source inventory counts or local test totals for a product progress
percentage. See `docs/requirements/SOURCE-REGISTER.md`,
`docs/requirements/V12-R1-REQUIREMENT-INVENTORY.json`, and `docs/GO-NO-GO.md`.

## Reduced-motion accessibility preference (2026-10-22)

Added a candidate-owned `reducedMotion` boolean to the existing profile JSON
contract (default false for older records), editable in the current Profile
surface. The authenticated shell reads the value through a minimal
`GET /api/profile/accessibility` response rather than caching the entire
candidate profile for this single preference. The owner-scoped query cache is
updated on save. CSS suppresses non-essential animation/transition duration
and delays; OS `prefers-reduced-motion` behavior remains supported. The setting
is excluded from matching inputs, and no database migration was needed.

Evidence on Node 24.19.0: the full unit suite passed 94/94, the domain suite
passed 839/839, and PostgreSQL integration passed 59/59 with zero skips,
including preference persistence, owner isolation and unauthenticated denial.
`npm run gates:test`, `npm run typecheck`, `npm run lint`, `npm run
security:check` (0 production dependency vulnerabilities), formatting, EOL and
diff checks passed. The production build passed both Next.js builds and CSP
verification (13 hashes). `npm run test:ui` passed with exit code 0 against the
production build across Chromium, Firefox and WebKit, including axe, keyboard,
two-account session switching, responsive reflow and save/reload of the
preference. A read-only independent code review approved this diff after
requiring and verifying the profile-data-minimizing endpoint. The full
goal-wide requirement audit, manual screen-reader judgment, hosted CI and
production acceptance remain open; this slice is not a goal-wide percentage.
No production behavior or infrastructure was changed.

## In-app interview reminder preference (2026-10-22)

Implemented a candidate-owned switch on the existing `/settings` screen for
whether future due interview reminders are materialized in-app. The preference
defaults to enabled, is stored separately from matching/profile data, and is
session-owner scoped behind the existing Origin/CSRF checks and rate limiting.
Disabling prevents new reminder rows without deleting prior notifications;
re-enabling can materialize a still-upcoming due reminder once. Email/push and
other message types are explicitly outside this switch. See
`docs/decisions/IN-APP-INTERVIEW-REMINDER-PREFERENCE.md`.

Node 24.19.0 evidence to date: full serial PostgreSQL/Redis integration passed
59/59 with zero skips, including migration, default, strict validation, CSRF,
owner isolation, off/on materialization, preservation, and a real-PostgreSQL
serialization regression that drives the authenticated preference `PUT` while
the publisher contends for the same owner lock. A fresh read-only independent
review approved the current lock protocol and the regression test. `npm run
gates:test` passed (93/93 unit tests, source/privacy/deployment/EOL checks, lint,
and typecheck including 60 canonical test files); `npm run test:domain` passed
839/839; `npm run security:check` found no high-confidence privacy findings or
production dependency vulnerabilities; `npm run build` passed both production
builds and CSP verification of all 13 inline-script hashes. The production-mode
`npm run test:ui` run passed Chromium, Firefox and WebKit, including axe,
keyboard, session-selector, and eight-width responsive checks. An earlier
development-mode UI attempt failed on React's development-only `eval()`/CSP
diagnostic; it was not allowlisted and is not counted as the final UI result.
`npm run db:generate` reports no schema drift after migration generation. Hosted
GitHub Actions remains disabled. No commit, push, deployment, provider call, or
production change has occurred for this slice.

Final review follow-up (22 October): independent review found that a failed
preference refresh could leave stale cached state editable, and that test
cleanup needed to await both racing operations even if one rejects first. The
Settings UI now hides the preference until a successful refetch and offers a
retry; the integration regression waits for both operations to settle before
propagating failure. The exact final tree passed the focused PostgreSQL race
test (1/1), full typecheck (60 canonical test files), lint, format, EOL and
`git diff --check`. The full integration run (59/59) and three-engine UI/axe
suite passed before this final test-cleanup-only adjustment; the focused race
test was rerun afterward. A fresh read-only independent review approved the
final diff. No hosted or production evidence is implied.

Progress reporting note (2026-10-22): the previously repeated 44% value has no
documented, reproducible whole-goal denominator in the current repository and
is not reaffirmed as a current measurement. The approved-source inventory still
has 518 blocks marked `NOT_ASSESSED/NOT_RUN`; matrices and release gates also
contain open items. This reminder-preference vertical slice is verified local
progress, not a valid percentage for the entire v12 goal. A goal-wide percentage
must be recomputed from a documented requirement-level rubric rather than
incremented by feature count or repeated unchanged.

## Additive approved-source inventory reconciliation (2026-10-21)

The historical 319-item inventory remains unchanged and tied to its original
v12 source hash. Added deterministic `V12-R1-REQUIREMENT-INVENTORY.json`, bound
to the approved SRC-01-R1 snapshot. It enumerates 518 substantive source blocks,
exact-text-links 297 legacy items, and associates the remaining 22 with the
reviewed per-item reconciliation dispositions. All 518 remain NOT_ASSESSED and
NOT_RUN. The inventory distinguishes approved-base text from pending amendment,
scope-reconciliation, source-conflict, owner/external-gate and unavailable
reference content; it does not represent features/tests or completion.

The inventory generator/checker/tests are registered under the canonical
requirements gates. Eleven inventory tests pass, including stale-source rejection,
exact (not substring) lineage matching, duplicate/unknown disposition rejection,
immutable legacy lineage checks, explicit pending/conflict classification and
deterministic output. Independent review verified the current 518/297/22 census
and prompted these fail-closed drift checks. This is partial SOURCE-REVISION-01 remediation only:
requirement-to-test/implementation matrices remain unreconciled, and the absent
156-item cleanup matrix is still an owner dependency only if that source scope
is intended to apply. No runtime behavior changed and no proposal was activated.

## Candidate job-posting feedback slice (2026-10-21)

Local, uncommitted work on `main` based on `197f8548eb854cefae7df2a0fc36da67f7118773`
adds an owner-scoped reason-code report for a job result. It persists at most one
reason per candidate/job, rejects cross-owner and malformed writes, rate-limits
submissions, exposes the selected value in the candidate's own search result,
documents the API response/mutation, and does not change listing visibility or
application state. This is only candidate feedback capture. It does not satisfy
v12's end-to-end reporting/moderation requirement; staff authorization, report
queues, audited investigations, outcomes and approved outcome semantics remain
unimplemented. No outcome or moderation behavior was invented.

Independent source review found no authorization, CSRF, injection, ownership or
sensitive-logging blocker. It did flag the new migration's composite unique-index
build on existing `search_jobs` as an operational rollout risk whose duration
depends on production table size and traffic. Production migration impact has
not been tested; assess it in an approved staging/maintenance window before any
production application.

Executed on Node v24.19.0 against the exact current source (local synthetic
fixtures and disposable/loopback services only): `npm run build` passed both
production build/CSP passes (13 inline-script hashes); `npm run gates:test`
passed its policy/source/privacy/deploy/EOL/lint/typecheck gates and 91/91 unit
tests; `npm run test:integration` passed 59/59 with zero skips; `npm run
test:domain` passed 839/839 across 30 files; and `npm run test:ui` exited 0 on
Chromium, Firefox and WebKit, including the feedback flow, axe, keyboard, and
eight responsive widths. `npm run security:check` reported zero production
dependency vulnerabilities; `npm run db:generate` reported no schema drift;
formatting, line endings and `git diff --check` passed. Test-registration/type
checking found two issues before final pass; both were corrected and the gates
rerun. The UI form now follows the persisted parent value rather than setting
state in an effect. No hosted CI exists for these uncommitted changes (GitHub
Actions is disabled); no commit, push, deployment, provider call or production
change occurred.

## Main browser/runtime validation follow-up (2026-10-21)

At code SHA `7bc55ef6d75db17261b1a773a26b1b9d4dd0b95d`, the committed Playwright
harness now captures browser `unhandledrejection` events on OTP, signup,
authenticated candidate and test-account-selector journeys. It records only
bounded error categories, suppresses raw rejection text from browser console
output, and a synthetic `TypeError` probe verifies the guard is active. No
runtime product code changed.

Node v24.19.0 local validation on that exact code SHA passed: `npm run test:ui`
exited 0 for Chromium, Firefox and WebKit, including axe, keyboard checks and
eight responsive widths; `npm run gates:test` passed 91/91 unit tests and its
Node/source/privacy/deployment/EOL/lint/typecheck gates; `npm run test:integration`
passed 58/58 with zero skips against disposable local PostgreSQL/Redis;
`npm run test:domain` passed 839/839; `npm run build` passed both production
build/CSP passes with all 13 inline-script hashes; `npm run security:check`
reported zero production dependency vulnerabilities. Formatting, privacy and
EOL checks passed. A separate experimental console-warning assertion produced
unclassified Firefox warnings; it was not retained or allowlisted. Warning
classification and critical-network-error policy remain open engineering work.
Follow-up diagnosis on 2026-10-21 used the same Node 24 code SHA
`7bc55ef6d75db17261b1a773a26b1b9d4dd0b95d`: the
three-engine journey passed with diagnostics enabled, and focused Firefox runs
reproduced warning-level messages naming local Next.js static chunks. Four
direct GET checks for observed chunks returned HTTP 200. Some Playwright
request-failure events were cancellations, but a later fail-closed correlation
probe found a warning with no matching failure event; this is insufficient to
classify every warning as harmless navigation cancellation. The probe was
removed, no warning was allowlisted, and the root cause remains open. No raw
warning text or runtime product changes were retained.
GitHub returned no status checks for this SHA and Actions remains unavailable;
local checks are not hosted CI or release acceptance. No provider, shared
database, production environment or deployment was used.

## Browser runtime-error gate follow-up (2026-10-21)

On the local `main` working tree based on `aa67c199250ecd73145349a6c6954cafd47659a8`,
`npm run test:ui` completed successfully in Chromium, Firefox and WebKit. The
existing browser harness now verifies that its console-error listener is live,
fails on unexpected console errors, uncaught page exceptions and page crashes in
the OTP, authenticated candidate and test-account selector journeys, and emits
only sanitized error categories/route paths. Deliberate negative API cases are
permitted only by exact fixture route/status pairs. The full local `npm run
gates:test` also passed (including 91 unit tests); typecheck, lint, format,
EOL and privacy checks passed. These are local results, not hosted CI evidence.
Warnings, unhandled rejections, critical network-error policy, broader leakage
controls, manual assistive-technology review and hosted browser CI remain open;
no production or provider configuration was changed.

## Local database-recovery harness correction (2026-10-21)

On the same `main`-based working tree, the first database-restore attempt could
not reach the randomly named synthetic database because the harness selected
its default `careerscope-postgres-1` container while `.env` was connected to the
separate dated export-validation service. Pointing at that actual service then
exposed an overly narrow container-name guard. The harness now accepts only the
existing `careerscope-*` names or the explicit
`cs-export-validation-YYYYMMDD-pg` test-service pattern; the deployment-gate
test asserts both patterns. With `CAREERSCOPE_POSTGRES_CONTAINER` set to the
current synthetic service, `npm run test:database-recovery` passed: 21 table
fingerprints matched and encrypted file/parsed-result recovery succeeded, using
synthetic owner data. The initial default-container failure was a test setup
mismatch, not evidence of data loss. No shared or production database was used.

The post-correction broad `npm run gates:test` passed again (91/91 unit tests,
with approved-source, privacy, deployment-policy, EOL, lint, typecheck and test
typecheck gates). `npm run test:integration` passed 58/58 with zero skips,
`npm run test:domain` passed 839/839, and `npm run deploy:gate:test` passed all
10 policy tests and fail-closed result cases. Local `npm run test:performance`
measured 18,095 successful requests and zero failures over 30 seconds at
concurrency 8; throughput 603.2 requests/second, p50 12.62ms, p95 18.84ms,
p99 23.79ms. This is a synthetic loopback regression measurement, not an SLO,
production benchmark, or 1,000-user capacity claim.

`npm run test:soak` then completed a bounded 124-second synthetic mixed-load run:
2,655/2,655 operations completed, one queue restart occurred, failures were zero,
and the final outbox/queue backlog, expired leases, orphaned executions and
temporary-file inventory were all zero. It is shorter than the repository's
30-minute default and is stability evidence only, not production DR or capacity
acceptance.

## Owner-approved source revision follow-up (2026-10-21)

The owner explicitly approved the supplied revised CareerScope v12, Engineering
Standards and Goal, plus the global Viswatra standards v1.1. The approval is
recorded additively as OA-2026-10-20-02 with recomputed source hashes in
`docs/decisions/OWNER_APPROVALS.md` and `docs/requirements/SOURCE-REGISTER.md`.
Original approvals and immutable snapshots are preserved. This resolves the
source-document approval request, but does not promote proposal clauses that
remain explicitly marked pending in those documents. The current requirement
inventory remains tied to the earlier v12 snapshot and needs reconciliation; any
still-required amendment decisions remain separately gated. No implementation,
provider, hosted CI, production, or launch-completion claim follows from the
approval. `SOURCE-REVISION-01` remains open as local engineering/reconciliation
work, not a request to approve the source files again.

### Source reconciliation ledger correction (2026-10-21)

During the continuation audit, the source-delta table was found to retain
pre-approval dispositions for revised base D1 and D12 even though
OA-2026-10-20-02 explicitly approves revised D1–D14. The table now distinguishes
that resolved base-source approval from the still-pending D11-R/A1 proposal
wording and the uncompleted D12 off-host recovery evidence. The A1 inconsistency
and 24-hour exception requirement remain visible; no authentication fallback,
backup, or recovery behavior was changed or represented as validated. The source
register remains open because the 319-item inventory and related traceability
still require reconciliation against the revised source.

The follow-up comparison found 297 of 319 existing item texts verbatim in the
approved R1 snapshot and 22 without an exact match. This is not a completeness
score: the R1 document also adds clauses and explicitly pending amendments that
must be distinguished from approved base scope. Exact next steps and this
limitation are recorded under `SOURCE-REVISION-01` in `blocker.txt`.

Validation on the documentation-only change: `npm run requirements:check`,
`npm run requirements:test` (5/5), `npm run format:check`, `npm run eol:check`,
`npm run privacy:check`, and `git diff --check` passed. This does not establish
hosted CI, production, provider, or launch acceptance.

## Activation checkpoint

- Owner approval: OA-2026-10-20-01, dated 20 October 2026.
- Activation: ACTIVE for authorized development only.
- Governance transition: `2a1eb65d67151c485cddd417b6c249146c017a35`, independently
  reviewed, committed and fast-forward integrated into `codex/dev`. Verified
  baseline ancestry and clean worktree before beginning this audit task.
- Existing baseline: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`.
- Development integration: `codex/dev`; current task: isolated email OTP primitive
  on `codex/task/email-otp-auth`; separate review pending.
- Main is not modified, pushed or merged. No production/provider actions performed.
- Existing GitHub main protection query returned HTTP 404 (not protected); branch
  rules query returned an empty array. No repository setting was changed.
- No active tracked governance/work-authority files existed at baseline; AGENTS.md
  was ignored. This owner-authorized transition restores a thin entry point and
  one canonical contract, without removing existing code, designs or migrations.

## Verified baseline recovery evidence

External artifact handle: `governance-20261019T182853851Z/careerscope.bundle`.
The actual private storage path is recorded in the owner's external assessment,
not exposed in this public repository. Bundle SHA256:
`E2222B8322930ECCAE63E508FD9840674A43EAB97A330D469CA6760C6422D68D`.

`git bundle create --all`, `git bundle verify`, restore clone and `git fsck --full`
all exited 0. Restored HEAD matched the baseline; original branch/tag inventories
were main-only/no tags. All recorded refs remain in the bundle. Ignored secrets,
environment files and runtime data were not read or copied. Private recovery clone
is retained for inspection; this is source recovery, not production DB backup.

## Current executed local evidence

At baseline on bundled Node 24.19.0, `npm run gates:test` exited 0: Node policy
tests 4/4, privacy tests 3/3 and scan, deployment decision fixtures, EOL scan,
lint, strict typecheck (45 test files), and unit tests 42/42. No skips/failures.
These are existing-code checks, not v12 launch acceptance or measured coverage.

Current `npm audit --json`: exit 1, five high/seven moderate, zero critical.
Production-only audit: exit 1, three moderate, zero high/critical. No dependency
changed or finding waived. High findings block affected integration until assessed
and remediated; a thresholded production-only command does not clear the full audit.

## Next work and boundaries

Independent governance review: separate `governance_review` session returned
APPROVE with no blocking findings for the seven-file transition; it independently
checked all five supplied source hashes, relevant clauses, public-record privacy,
scope and activation boundaries. Its scope was governance only, not product
certification; supplied baseline test/backup/hosted-query evidence was not rerun
by that reviewer. Format/privacy/EOL/diff checks for the transition passed.

The governance transition is verified. Complete and independently review the
source-grounded baseline matrices and critical-path audit before runtime
implementation. Prioritize security/data integrity and approval-compliant
source policy, followed by the complete v12 launch core in dependency order.
No percentage is claimed until the requirement denominator is derived and verified.
Historical R1 cleanup reports remain history, not v12 implementation proof.

## Baseline audit task

Committed as `54e09da604d4f67742bea343d3a9a268c1ee9bb1`, fast-forward
integrated into `codex/dev`; clean working tree verified before the auth task.

The three approved CareerScope source documents are now canonical immutable
snapshots; no cross-product program status or private path is published.
Goal's CRLF was normalized to LF and two-space Markdown hard breaks converted
to equivalent backslash breaks, and a final LF appended, with exact
transformed-content comparison;
the source register preserves both identities. A dependency-free check plus
negative-control tests refuses missing/changed snapshots. Formatting exemptions
apply only to those byte-preserved sources, not executable code or working docs.

GAP_MATRIX.md, TEST_MATRIX.md, QUALITY_AUDIT.md, product profile and initial
threat model record current limitations. A 319-item source inventory preserves
all numbered/bulleted/table and selected normative narrative clauses; duplicates
across decisions/capability/acceptance tables are not independent feature counts.
The large approved Goal snapshot and generated JSON inventory exceed 400 lines
because they preserve source/evidence traceability, not oversized runtime modules.
No reviewed specification approval or test coverage is inferred from generation.

Full dependency path investigation identifies the five high entries as the
Next ESLint plugin > fast-glob > micromatch > braces chain. Registry metadata
still reports braces 3.0.3 as latest; advisory affects <=3.0.3. The newer plugin
16.4.2 also declares fast-glob 3.3.1. No unsupported downgrade or security scan
suppression is used to manufacture an audit pass; remediation options remain open.

Independent `baseline_audit_review` returned APPROVE after fresh review of the
current source transformation, 319 unique source-matching inventory items and
25 NOT_VERIFIED go/no-go gates. No product or release certification was inferred.
The review's final-newline provenance correction and two omitted normative clauses
were applied before approval. Source-integrity tests passed 4/4; exact transformed
Goal comparison, complete formatting check and staged/unstaged diff checks passed.
The complete Node 24 local gate suite then exited 0: policy 4/4, source 4/4,
privacy 3/3 and scan, deployment fixtures, EOL, lint, 45-file typecheck and
42/42 unit tests. An additional CLI-execution test was independently reviewed
APPROVE and rerun 5/5 with source-checker coverage of 94.74% lines, 85.71%
branches and 100% functions. This coverage is only for the new source checker,
not application-wide coverage. No hosted, database or browser run is claimed.

## Production test-access guard

Task: `codex/task/auth-production-test-guard`, based on `54e09da`.
The API startup policy now rejects every test selector in production. Proxy
selection requires explicit staging, preserving HTTPS, private assertion and
loopback enforcement. Production Compose pins production/disabled access.
No live configuration changed; OTP and full v12 authentication remain incomplete.

Independent `production_guard_review` returned APPROVE for all five implementation
files and inspected executable API wiring. Six targeted tests pass. Node 24 native
coverage with explicit `**/test-users.ts` include and `**/*.test.ts` exclude measures
100% lines/branches/functions for this small guard module only. The earlier narrow
path invocation produced an empty report and is NOT coverage evidence. Strict
changed-file lint and privacy scan pass. The broader Node 24 gate rerun exited 0:
policy 4/4, source 5/5, privacy 3/3 and scan, deployment decision fixtures,
EOL, lint, strict typecheck (45 canonical test files), and 44/44 unit tests;
no skips or failures. Full formatting and diff checks pass. Compose's resolved
synthetic configuration also confirms production/disabled and absence of the API
test assertion. No real service, hosted or browser evidence is implied.

## CI and deployment-gate policy correction

On local task branch `codex/task/ci-without-deployment-gate`, corrected the
workflow checker to reflect the approved sequence: CI validation can exist
without deployment automation; deployment still requires CI. No deployment
workflow is currently tracked or active. If one is restored, the retained
checker requires manual-only dispatch, main-revision verification, the
production environment and exact-revision CI verification. Added five
isolated synthetic workflow fixtures, including denial of a CI job that
dispatches deployment from a multiline shell step. `npm run deploy:gate:test`
passed 5/5 fixtures plus the existing CI-decision checks; formatting and
`git diff --check` passed. Independent read-only review `ci_gate_review`
APPROVED for the implementation and tests, with one documentation precision
correction applied afterward and awaiting fresh review. The broad
`npm run gates:test` run exited 0, including policy, source, privacy, deploy-gate,
EOL, lint, typecheck and 44/44 unit tests. Hosted CI remains unavailable because
GitHub Actions is disabled; no workflow was hosted or run, and no setting was
changed. No runtime product or deployment behavior changed.

## CI recovery image consistency and local validation (2026-10-20)

Continued on `codex/task/ci-workflows` from `f9cbead2dcc767f1ebd29812b565d03bcc7e2aca`.
Pinned the disposable PostgreSQL image used by `infra/check-backup.sh` to the
same immutable digest as the CI service, and strengthened the deploy-gate test
to assert exact PostgreSQL/Redis digest equality across workflow, database
recovery, queue runtime, and backup verification. No application runtime,
production configuration, hosted setting, or persistent database changed.

Local Node 24 validation on the current working changes: `npm run deploy:gate:test`
passed 9/9 workflow tests and all deploy-decision fixtures; `npm run gates:test`
passed policy/source/privacy/deploy/EOL/lint/typecheck and 47/47 unit tests;
`npm run test:domain` passed 29 files / 830 tests; `npm run test:integration`
passed 49/49; `npm run test:queue-runtime` passed after supplying the required
synthetic APP_ORIGIN; `npm run test:database-recovery` and
`npm run test:crash-recovery` passed; `npm run test:full-disk` passed with the
digest-pinned recovery image; `npm run build` passed both CSP builds and verified
all 12 inline-script hashes; `npm run format:check`, `npm run eol:check`, privacy
scan, and `git diff --check` passed. Browser acceptance previously passed on
Chromium, Firefox, and WebKit with axe, keyboard, and responsive checks. One
earlier browser invocation failed before a clean reproduction passed; the
initial invocation's cause was not established, so it remains a recorded
stability anomaly rather than being erased by the successful run.

The backup/restore test passed all checks, including 0600/0700 permission
assertions, when run in a Linux shell container against the local Docker daemon.
An initial Git Bash run on the Windows-backed temporary filesystem reported
0644/0755 because Windows ACL semantics do not implement the expected POSIX
mode bits; no assertion was weakened. Independent read-only review confirmed
there are no remaining mutable PostgreSQL/Redis image references in the CI
workflow's directly invoked recovery paths. Separate, non-CI Compose files
retain mutable tags and were not changed in this task.

The full dependency audit remains a blocker: 12 findings (5 high, 7 moderate);
no major downgrade, test weakening, or audit suppression was applied. The
workflow remains unverified on GitHub because Actions is disabled. No push,
merge to `main`, deployment, production change, or hosted evidence occurred.

## Isolated validation runtime availability (2026-10-20)

Resumed from clean `codex/dev` at `c2a9631599e125f363d9c6d0cf94f07a021783eb`;
verified the external source bundle for this checkpoint (SHA256
`A53AD6E1E92283F67DB5511E0CDD0BB1C136799B94C442A2653772DF744324FE`). A local
task branch, `codex/task/email-otp-auth`, was created from this baseline. No
production authentication flow was changed. A dependency-free OTP primitive
and synthetic unit tests were added on the isolated task branch; no API,
database, delivery, session, recovery or UI integration was added.

The continuation inspected the approved v12 authentication contract and current
API/domain/UI implementation. It confirmed the current implementation does not
provide the approved email OTP, refresh-token family rotation, device inventory
and revocation, or verified-signal account recovery. Resend's current official
API documentation was checked for the documented email-send contract; no provider
request was made. The approved source names Resend but does not name the fallback
provider, so that integration remains owner/provider-gated rather than guessed.

The isolated Node 24 container can validate dependency-free code but cannot run
the repository's full toolchain: it lacks project dependencies; the prebuilt
CareerScope image is Node 26 and its partial production dependency tree lacks
`tsx` and `vitest`; the Windows host dependency tree is incompatible with Linux
native modules and is not an OS-enforced sandbox. No dependencies were installed,
no external network was used by a build/test, no secrets or `.env` file were read,
and no API, browser, provider or production flow was run. `VALIDATION-ENV-01` records the exact
remaining full-suite requirement. This environment limitation does not negate
the narrower checks completed for the OTP primitive and is not evidence that the
authentication requirement is complete.

On Node 24.21.0 in a network-disabled bounded container, the isolated
`packages/core/src/email-otp.test.mjs` suite passed 9/9 tests. A focused strict
TypeScript check, focused ESLint check and Prettier check on changed files also
passed. The test is listed in `test:unit`, but that full script, the complete
workspace suite, auth/session integration, service-backed tests, browser tests,
and full CI were NOT RUN in this continuation.

## Critical-path sequencing audit (2026-10-20)

On `codex/task/critical-path-audit`, based on the locally integrated CI commit
`50eadcb3ec8224aece178eb3981290d0b4e6e226`, added
`docs/CRITICAL-PATH-AUDIT.md`. It maps the v12 launch chain and parallel-safe
local work to the approved requirements, current gap/test matrices, blocker
register, and 25-item go/no-go ledger. It distinguishes local synthetic
implementation from owner/provider/legal/hosted/human evidence and does not
change runtime behavior or mark any launch gate passed.

The first independent review identified two documentation defects: interview
organizer was associated with the outreach-abuse gate, and the recovery conflict
omitted v12 section 7's explicit fallback acceptance. Both were corrected in
the audit and `RECOVERY-01`; the refreshed independent review returned APPROVED.
The recovery objective remains `READY_FOR_OWNER`, since its launch interpretation
is an owner risk decision. Privacy, EOL, format, and diff checks passed after the
corrections. No external source, provider account, candidate data, or production
system was accessed. This audit is sequencing evidence only and is not a final
whole-repository or release certification.

## D14 source-permission enforcement (2026-10-20)

Implemented on the isolated branch `codex/task/source-permission-policy` from
the local `codex/dev` baseline. Only the D14 ATS candidates Greenhouse, Lever,
Ashby and Workable are eligible, and only through a current source-specific
permission profile covering collection, storage, transformation and candidate
display. The production profile registry is intentionally empty; no job source
was contacted and no rights were inferred. API discovery and search submission,
worker-time execution, scheduled discovery and the UI availability/pending
states all fail closed. Candidate-provided links are not provider collection and
are not implemented by this source catalog; their separate candidate-owned
product contract remains outstanding.

Independent review identified and the implementation corrected a queue-time
permission-expiry edge case: a source that becomes unauthorized after enqueue
no longer suppresses another still-permitted source; the denied source receives
its own `source_permission_pending` outcome. Regression tests assert that the
permitted provider runs once and the denied provider is never called. A first
integration rerun also exposed an outcome-order mismatch; the implementation
now preserves provider result order and appends denied-source outcomes, and the
focused PostgreSQL test passed without changing its assertion.

Executed in this continuation on bundled Node 24.19.0: worker/API unit suite
49/49; domain suite 30 files / 835 tests; focused PostgreSQL partial-search test
PASS; full local Postgres/Redis integration suite 49/49; application and test
typecheck PASS (47 test files); lint PASS; privacy check/test PASS; formatting
and EOL checks PASS. The current production-built web bundle passed the full
Chromium/Firefox/WebKit browser journey, including axe, session switching,
keyboard checks, five viewport widths and the accessible per-source pending
reason. The test harness now excludes the known long-lived search event-stream
endpoint by its API route, so Firefox does not misclassify it as a request that
must settle. The final rerun of `npm run gates:test` passed, including 49 unit
tests, and the repeated format/EOL/diff checks passed. `npm run test:integration`
passed 49/49 on local PostgreSQL/Redis. The current security command passed its
high-severity threshold, but the raw current audits still report 12 findings
(5 high, 7 moderate) overall and 3 moderate production dependency findings;
`AUDIT-01` remains open, with no waiver or forced major downgrade. No hosted CI,
production deployment,
external provider, credential, or live source validation is claimed. SOURCE-01
remains `READY_FOR_OWNER` for source-rights evidence and measured launch coverage.

## Email OTP primitive task checkpoint (2026-10-20)

Local task commit: `f468643db8d602a8f07238939b66d3744fff04c6` on
`codex/task/email-otp-auth`, based on `c2a9631599e125f363d9c6d0cf94f07a021783eb`.
The tracked change adds a challenge-bound HMAC OTP digest primitive with a
minimum 32-byte key input, six-digit random code, 10-minute expiry and five
attempt budget; callers still must enforce persistence, attempt consumption and
single-use atomically. No login/API/session/provider/UI behavior was integrated.

Isolated Node 24.21.0 suite: 9/9 PASS. Focused strict TypeScript, changed-file
ESLint and Prettier checks: PASS. These do not establish `npm run test:unit`,
full auth/security/integration/browser gates or production acceptance. The
independent inspector could not run because Claude Code has no authenticated
CLI session (`Not logged in`); no reviewer verdict was produced. The auth code
therefore remains on its task branch, with promotion pending independent review
and owner review. No push, merge, deployment, provider call, secret access or
production change occurred.

### Email OTP primitive validation follow-up (2026-10-20)

Validation was resumed in a disposable clean checkout at commit
`8966c5f1a08e6ad0f8c5e2944669f0f4aea1b06a`. A lockfile-based Node 24.21.0
dependency install with lifecycle scripts disabled succeeded. Under a bounded,
network-disabled container, `npm run gates:test` passed end-to-end, including
privacy, deploy-gate, EOL, lint, typecheck and the 58/58 root unit tests. The
email OTP tests were included. No skips were reported.

The first production build attempt correctly failed offline because Next's
approved `next/font/google` Inter integration fetches the font at build time.
The production build was then rerun in a bounded secret-free container with
build networking enabled and passed: two optimized Next builds, TypeScript,
all 13 static routes and the CSP hash-discovery/enforcement check covering all
12 inline-script hashes. This is build-time font embedding; no runtime browser
CDN font dependency was added.

`npm run format:check` found only the existing format mismatch in the canonical
`design/DESIGN-INDEX.json`; that unrelated design index was intentionally not
rewritten. The full serial integration test list from `npm run test:integration`
was executed with explicit synthetic environment values against freshly created,
network-isolated PostgreSQL 17.6 and Redis 7.4.5 containers and passed 49/49;
those containers used tmpfs and were removed after the test. No shared local or
production service was touched. Browser checks were not run for this core-only
change. The separate domain suite passed 30 test files / 835 tests in the
network-disabled Node 24 scratch container. A fresh independent authentication
review is still blocked because the local Claude CLI is unauthenticated; no
independent verdict is claimed. No push, merge, deployment, provider call, secret
access or production change occurred.

### Current dependency audit (2026-10-20)

`npm audit` was rerun from the clean Node 24.21.0 scratch checkout with build
network access, no credential environment, and no repository/dependency writes.
It exited 1 with 12 findings: 5 high and 7 moderate, consistent with AUDIT-01.
The reported automatic remedy requires `--force` and major downgrades, so no
automatic fix was applied. These findings remain open; this command is current
audit evidence, not a security-review completion or accepted risk waiver.
The production-only report's three moderate findings trace to `sprintf-js`
through `mammoth -> argparse`. Source inspection found that CareerScope calls
Mammoth's in-process `lib/index.js` API for DOCX extraction; `argparse` is
referenced only by Mammoth's CLI entrypoint, which this repository does not
invoke. This narrows the code path observed but does not remove those packages
from the production dependency tree or clear the audit finding. The current
GitHub Advisory Database entry for `sprintf-js` GHSA-hp3w-g68c-fv3c has no
patched version. No override, waiver, or dependency change was made.
The fresh JSON report enumerated 12 vulnerable package nodes: high `eslint-config-next`,
`@next/eslint-plugin-next`, `fast-glob`, `micromatch`, and `braces`; moderate
`drizzle-kit`, `@esbuild-kit/core-utils`, `@esbuild-kit/esm-loader`, `esbuild`,
`mammoth`, `argparse`, and `sprintf-js`. npm's suggested resolutions downgrade
`eslint-config-next` to 14.2.35, `drizzle-kit` to 0.18.1, or `mammoth` to 0.3.29;
each is a major-version downgrade and was not applied. This list records audit
package nodes, not twelve independent attack paths.

The `sprintf-js` path is production-classified by npm because it is present below
the production `mammoth` dependency. Repository code imports Mammoth's
`lib/index.js` API for DOCX extraction. Installed-package inspection found
`argparse` only in Mammoth's `bin/mammoth` CLI entrypoint, with `sprintf-js`
used by that parser; repository source, scripts, container entrypoints, and
workflows do not invoke that CLI. This reduces the observed application
reachability but does not remove the packages from the production dependency
tree or clear the advisory. The upstream advisory currently lists no patched
`sprintf-js` release. `AUDIT-01` remains OPEN pending a compatible upstream fix
or a separately reviewed mitigation with regression evidence.

### Remote main synchronization check (2026-10-20)

After the request to use the latest main, `git fetch --no-tags origin main`
completed successfully. Both local `main` and `origin/main` resolve to
`45d6d35691bd5d41257da4f3988acd9a89c7d2ea` (the repository's initial
CareerScope codebase commit). Current task HEAD is a descendant, 18 commits
ahead, with no remote-main-only commits to integrate. The development work
remains isolated on `codex/task/email-otp-auth`; neither `main` nor the remote
branch was modified.

### Repository formatting correction (2026-10-20)

The full Node 24 Prettier check identified only `design/DESIGN-INDEX.json`.
That file was normalized with Prettier, then parsed and deep-compared against
the committed JSON object; the content is semantically identical. The full
repository Prettier check now passes. No design references, screens, or
implementation mappings were added, removed, or changed.

### Legacy external-identity schema retirement (2026-10-20)

On `codex/task/email-otp-auth`, the active Drizzle `users` model no longer
declares the unused `externalSubject` or `phone` fields. Historical migrations
`0017_cognito_external_subject` and `0018_cognito_phone_identity` remain
unchanged. Forward migration `0019_remove_legacy_external_identity` acquires an
exclusive table lock and aborts before dropping either field if any row still
contains a value; it never deletes or exports account data. Operators must
resolve any populated legacy values through an owner-reviewed data process
before applying the migration. Email remains nullable to avoid invalidating
legacy phone-only accounts, and no OTP/login/provider behavior is added.

The new migration was tested against an isolated loopback PostgreSQL database:
it rejected synthetic populated legacy identity values without changing them,
then succeeded after the test fixture explicitly cleared those synthetic values
and verified that the account/email remained and the legacy fields/indexes were
removed. Full service-backed integration initially exposed a stale `/api/session`
query that also selected `users.phone`; that reference caused the observed 500
and downstream test failures. The endpoint now selects only account email, the
web session no longer models authentication phone, and a regression assertion
proves the session response omits that field. The complete serial integration
command then exited 0 against disposable PostgreSQL 17.6 and three Redis 7.4.5
services on loopback, using AOF/noeviction and synthetic development settings.
The migration has not been run against any shared, staging, or production
database. This result is not independent review or authorization to promote the
auth/schema change.

The Node 24.19.0 production build completed successfully after this session
response change, including the repository's two-pass CSP verification (12 inline
script hashes covered). Full `npm run gates:test` also passed (58 unit tests,
including lint and the complete typecheck pipeline). These local results do not
substitute for hosted CI or independent review.

The implementation and migration guard were committed locally as
`471788ea165600a7a445d2b7bf64552109544352` on
`codex/task/email-otp-auth`. No push, merge, shared-database migration, or
deployment was performed. The branch remains subject to fresh independent
review and owner review before promotion; the owner-reviewed legacy-value
preflight/disposition and full authentication-flow work remain outstanding.

### OTP challenge persistence and delivery boundary (2026-10-20)

On the same isolated development branch, added additive PostgreSQL challenge
state using a domain-separated keyed email hash and OTP digest; raw email and
OTP values are not stored in the challenge row. Challenge replacement and
consumption are transactional, verification attempts are serialized, the
five-attempt limit is enforced, and accepted/expired/exhausted challenges are
single-use/removed. Expired-row cleanup is bounded and currently runs on
issuance; a periodic retention caller remains necessary when the API flow is
integrated. The migration is `0020_email_otp_challenges.sql` and has not been
applied to any shared database.

Added a fixed-endpoint Resend adapter and provider-neutral transient-failure
fallback coordinator. The fallback is injected; no second vendor is selected.
Synthetic fetch tests verify request shape, strict OTP input, redirect refusal,
retry classification and sanitized errors. No network request, credential,
provider account, real recipient, or email send was used. Neither the challenge
store nor delivery adapter is wired to an HTTP endpoint, account creation,
session issuance, or a complete login flow.

Node 24.19.0 local evidence: `npm run gates:test` exited 0, including its
registered policy/source/privacy/deployment checks, lint, strict typecheck and
unit suite; a separate `npm run test:unit` run passed 64/64 with no skips.
The serial integration command passed 51/51 against disposable loopback
PostgreSQL 17.6 and Redis 7.4.5 services with synthetic configuration. The new
challenge-store test verifies normalized-address replacement, HMAC storage,
wrong-address denial, successful single-use consumption, replay denial,
concurrent attempt serialization and expiry deletion. The Resend adapter suite
passed 6/6 with an injected synthetic fetch only. `npm run build` passed both
production build/CSP passes and covered all 12 generated inline-script hashes;
`npm run format:check`, `npm run eol:check`, `npm run privacy:test`,
`npm run privacy:check`, and `git diff --check` passed. No hosted CI, browser,
external provider, shared database, independent auth review, push, merge, or
deployment evidence is claimed. Auth flow, API abuse controls, recovery, and
owner/provider configuration remain open.

### Resend email OTP integration (2026-10-20)

On the isolated local branch `codex/task/email-otp-auth` at unchanged base
`f23d33fcd7b844fd1cff8f88ab28fcd54cbc5d56`, implemented the approved Resend
email-code flow without modifying `.env` or exposing its values. The API uses
the existing PostgreSQL identity and opaque-session architecture; it permits
sign-in only for existing users and leaves registration disabled. Added a
forward `email_verified_at` field and `0021_mushy_stepford_cuckoos.sql`, which
has only been exercised in newly-created disposable integration databases.
OTP challenge rows retain keyed address and code digests rather than raw email
or code. Codes are six digits, five-minute, single-use, attempt-limited and
replaced on resend. Redis request/verification limits are shared between two
API instances and fail closed if unavailable. Resend is called through a fixed
HTTPS endpoint with sanitized failure behavior and a bounded same-key retry.

The sign-in UI requests, verifies, clears and does not persist the code; browser
acceptance uses mocked HTTP only. `testHarnessPasswordLogin` is now opt-in and
used only by legacy test fixtures; the OTP/runtime API composition does not
enable it. The privacy scanner permits only the exact approved operational
sender mailbox, while a test proves other addresses at the same domain remain
flagged.

Current local evidence on Node 24.19.0:

- `npm run gates:test`: PASS; 4 Node-policy tests, 5 approved-source tests, 4
  privacy tests, 9 deployment-gate tests, EOL/lint/typecheck (51 canonical test
  files) and 65 unit tests all passed.
- `npm run test:integration`: PASS 53/53 against the existing loopback-only
  PostgreSQL 17.6 and Redis 7.4.5 services; OTP integration covers same-shaped
  known/unknown requests, no account creation, shared cooldown across two API
  instances, wrong/replayed/concurrent codes, session cookie and Redis failure.
- `npm run test:domain`: PASS 30 files / 835 tests after isolating and rerunning
  one initial 5-second PDF-parser timeout; the unchanged targeted case passed.
- `npm run build`: PASS, both production CSP passes cover all 12 discovered
  inline-script hashes. `npm run typecheck`, `npm run format:check`,
  `npm run db:generate` (no schema drift), `npm run privacy:test`,
  `npm run privacy:check`, and `git diff --check` passed.
- `npm run test:ui`: NOT FULLY GREEN. A Node 24 all-engine run failed at the
  existing request-settlement guard during the Chromium `/applications` route;
  an earlier Node 22 run failed at Firefox cancellation settlement and is not
  Node-24 acceptance. The focused Chromium run reached its success markers.
  Subsequent targeted Firefox execution exited 0 after the existing workspace
  and account-selector flows, responsive checks, keyboard assertions and axe.
  A fresh-server targeted WebKit run reached both end-of-suite success markers,
  including its axe/reflow checks, but the tool session disappeared before it
  returned a process exit code. Therefore Firefox is verified; Chromium and
  WebKit have success-marker evidence but no clean process-exit evidence here;
  the full cross-browser suite remains incomplete.
- `npm run security:check` reported the documented moderate `sprintf-js` path
  through Mammoth; no breaking downgrade or advisory suppression was applied.

No Resend network call or real mail was sent. The existing `.env` names were
reused without reading their values; a separate `EMAIL_OTP_HMAC_SECRET` is not
currently configured there. Domain/sender verification, provider-level
open/click tracking state, a real staging mailbox test, and the v12-required
fallback provider remain owner/external gates in `blocker.txt`. No shared
database migration, Git commit, push, merge, hosted CI run or deployment took
place. This is local implementation evidence, not production acceptance.

### Cross-browser verification update (2026-10-20)

The targeted Firefox browser run completed with exit code 0. The targeted
WebKit run on a freshly restarted local Next server reached its end-of-suite
success markers for the existing workspace flow and the two-account selector,
keyboard, five-width reflow and axe checks; the tool no longer exposed the
process handle when queried for its final exit code, so this is not recorded as
a clean WebKit command pass. The complete multi-engine command remains blocked
by the separately observed Chromium `/applications` request-settlement guard.
No test assertion was relaxed and no provider email was sent.

### Authentication hardening follow-up (2026-10-20)

Shared Redis rate-limit failures now fail closed as a stable HTTP 503 before
route side effects; the response omits limiter keys, identity data and internal
error details. OpenAPI includes the shared-dependency 503 response, and tests
cover registration refusal in OTP mode plus an unavailable limiter. Existing
database/API tests were corrected to assert the explicit 503 contract (three
previous 500 expectations across registration, session revocation and password
change); no assertions were loosened.

Node 24.19.0 local evidence for the current working tree: `npm run gates:test`
passed (67 unit tests, 52 canonical test files type-checked, lint, privacy,
requirements, deployment-gate and EOL checks); `npm run test:integration` passed
54/54 against loopback PostgreSQL 17.6 and Redis 7.4.5; `npm run build` passed
both CSP build/verification passes with 12 inline-script hashes; `npm run
format:check` and `npm run db:generate` passed (no schema drift). The Chromium
UI suite printed its application-flow and two-account/keyboard/five-width/axe
success markers, but the command's final exit code was not captured, so this is
not classified as a clean browser-suite PASS. The first UI attempt failed before
browser execution because this workspace's ignored `.env` omits `APP_ORIGIN`;
the retry supplied that setting only to the process environment and left `.env`
unchanged. `npm run security:check` exited 0 at the configured high-severity
threshold, while reporting three moderate `sprintf-js` advisories through
Mammoth; the suggested forced breaking downgrade was not applied.

The integration/UI test runner used disposable `test_*` databases and synthetic
OTP mail delivery; the test process supplied synthetic service URLs, OTP-disabled
runtime configuration and a synthetic Resend key, and did not call Resend. Node
loads the ignored `.env` through the existing `--env-file` script options, but I
did not inspect or print its secret values and the explicit shell overrides took
precedence; the file was not modified. No real email, shared database migration,
hosted CI, external provider configuration, commit, push, merge or deployment
occurred. Signup
remains disabled because no counsel-approved Terms/Privacy version or acceptance
implementation exists; the files under `docs/legal/` are non-public drafts, not
effective policies. Independent auth/security review, fallback provider,
Resend-domain/tracking/inbox evidence, legal approval, production secrets and
hosted acceptance remain open gates.

### Current local rerun after readiness hardening (2026-10-20, Node 24.19.0)

The first Chromium rerun encountered `ECONNRESET` while the test harness fetched
`/api/session` through the Next.js dev proxy. The cause was not established. A
subsequent clean Chromium-only run completed with process exit code 0; no retry
was added to the test. The route-level issue did not reproduce. Chromium covered
the existing workspace journeys, OTP UI, test-account selector, keyboard
navigation, five viewport widths and axe. Firefox/WebKit were not rerun in this
final pass, so a fresh all-engine pass is still pending.

Final review found `/api/health` checked PostgreSQL but not the mandatory Redis
limiter. Production composition now checks Redis `PING` as part of readiness and
returns a sanitized 503 if PostgreSQL or Redis is unavailable. Four focused API
tests cover limiter outage, password-registration refusal in OTP mode, Redis
readiness failure and successful readiness. They pass 4/4.

After this readiness change: Node 24 `npm run test:integration` passed 54/54;
`npm run gates:test` passed with 69/69 unit tests; typecheck passed (52 canonical
test files), lint passed, repository-wide formatting and EOL checks passed,
`npm run build` passed both CSP build/verification passes (12 hashes),
`npm run security:check` exited 0 at the configured high-severity threshold,
and `git diff --check` passed. npm audit still reports three moderate
`sprintf-js` advisories through Mammoth; no forced breaking downgrade was made.
Database tests used disposable local databases and synthetic provider delivery.
No Resend network call, live message, shared database, hosted CI, commit, push,
merge or deployment occurred. Branch/HEAD are unchanged and the worktree remains
intentionally dirty/uncommitted.

### Focused cross-browser completion check (2026-10-20, Node 24.21.0)

The three browser engines were rerun independently against the production-built
local web app and isolated loopback PostgreSQL/Redis services using synthetic
fixtures. The focused Chromium, Firefox and WebKit commands each exited 0 and
reported their workspace flows, two-account selector, keyboard, five-width
reflow and axe checks as passed. This closes the missing per-engine exit-code
evidence from the prior entries. The earlier single all-engine invocation still
failed its request-settlement guard before completing the full combined run; the
successful focused runs do not erase that harness stability anomaly. No test
assertion was weakened. Disposable test containers and the local web server
started for validation were stopped afterward. No persistent project service,
database, `.env`, provider or production configuration was changed.

`npm run format:check`, `npm run eol:check`, `npm run privacy:test`,
`npm run privacy:check` and `git diff --check` passed on the final working tree.
The configured security check exited 0 at its high-severity threshold but
reported three moderate `sprintf-js` findings via Mammoth. The full `npm audit`
exited 1 with five high and seven moderate findings; no forced downgrade or
suppression was applied. GitHub Actions remains disabled, so hosted CI is not
evidenced. This is a local validation update, not release acceptance; external,
owner and human gates in `blocker.txt` remain open. No commit, push, merge or
deployment occurred.

### Combined cross-browser rerun (2026-10-20, Node 24.21.0)

After starting a fresh production-built web server and three disposable,
loopback-only Postgres/Redis services, `CAREERSCOPE_UI_BROWSER=all node --import
tsx scripts/check-ui.ts` completed with exit code 0. Chromium, Firefox and WebKit
each completed the workspace and account-selector journeys, keyboard checks,
five viewport widths, and axe scans. A first launch attempt was made after the
prior test containers had already been stopped and therefore failed to connect;
it was rerun only after verifying fresh service readiness. The successful
combined run required no test changes or retries. All validation services were
stopped afterward. This closes the previously open combined-browser local gate;
it does not replace hosted CI, manual screen-reader, design acceptance, or
production evidence.

### Final local authentication-work checkpoint (2026-10-20, Node 24.21.0)

The current working tree passed `npm run gates:test` with exit code 0: four Node
policy tests, five approved-source tests, four privacy tests, nine deployment
policy tests, lint, 52-file test typecheck, and 69/69 unit tests. The full
`npm run test:integration` command passed 54/54 with exit code 0 against fresh
loopback-only Postgres 17.6 and Redis 7.4.5 containers; both Redis instances
used the required AOF/noeviction queue policy. The test stack had no persistent
volumes and was removed after the run. OTP delivery used synthetic test
configuration; no Resend request was made.

Repository-wide formatting, EOL, privacy tests/scanner and `git diff --check`
passed. Earlier ad-hoc integration attempts with mismatched Postgres credentials
and Redis instances missing the queue persistence policy failed as test-harness
setup errors; the correctly configured full suite then passed without test or
application changes. The already recorded production build and combined
Chromium/Firefox/WebKit browser passes remain local evidence. This does not
close the full v12 goal: hosted CI, owner-controlled recovery/source decisions,
security dependency findings, independent auth review, legal/provider acceptance
and other external or human gates remain open. No commit, push, merge, live
email, shared database change or deployment occurred.

### OTP session-persistence failure regression (2026-10-20, Node 24.19.0)

Added a service-backed regression to the current email OTP integration test.
With a disposable PostgreSQL trigger refusing session insertion for one
synthetic identity, valid-code verification returns the sanitized 503, leaves
no session, and does not permit challenge replay. After removing the trigger and
clearing only that fixture's Redis resend-cooldown key, a newly requested code
successfully establishes the session. This proves the failure is recoverable by
re-authentication without reusing an already consumed OTP; it does not make
challenge consumption and session creation one transaction.

Executed on bundled Node 24.19.0: the full serial `npm run test:integration`
passed 54/54 against disposable loopback PostgreSQL 17.6 and two Redis 7.4.5
instances (AOF/noeviction). `npm run gates:test` passed, including lint,
52-file typecheck and 69/69 unit tests; targeted Prettier and `git diff --check`
passed. A first gate command resolved nested scripts to host Node 22 and stopped
at the version guard before tests; rerunning with the bundled Node directory at
the front of `PATH` passed. Disposable services were removed; no Resend request,
shared database change, commit, push, merge or deployment occurred.

The broader approved v12 goal remains active. The current opaque eight-hour
session is not equivalent to the required short-lived-access/rotating-refresh
family. Refresh reuse detection, device listing/per-device revocation,
verified-signal recovery, the D11 fallback provider and independent review are
still outstanding. This regression only closes the OTP session-write failure
recovery test gap; it does not claim authentication or launch completion.

### Production build and full browser validation (2026-10-20, Node 24.19.0)

The current uncommitted tree passed `npm run build`, including both Next.js
production builds and second-pass CSP verification of all 12 inline-script
hashes. `node --env-file=.env --import tsx scripts/check-ui.ts` exited 0 with
`CAREERSCOPE_UI_BROWSER=all`; browser coverage included Chromium, Firefox,
WebKit, the account selector and session switching, keyboard/reflow checks, and
axe. The run used freshly created disposable PostgreSQL/Redis containers with
loopback-only ephemeral port bindings and no persistent volumes. The exact test
containers and local web server were stopped afterward; persistent Compose
services and databases were untouched.

The live read-only full npm audit still exits nonzero with 5 high and 7 moderate
findings. Fresh registry checks found no `braces@3.0.4` release; npm's suggested
Next ESLint config remediation is a major-version downgrade, so no forced
change or suppression was made. This audit and the remaining v12 authentication
gaps continue to block launch readiness. No commit, push, merge, production
deployment, or real email send occurred.

### OTP/security final local validation refresh (2026-10-20, Node 24.19.0)

The current worktree passed the following local checks: `npm run gates:test`
(73/73 unit tests, 53 canonical test files type-checked, plus source, privacy,
deployment-policy, EOL and lint checks); `npm run test:integration` (55/55,
zero skipped, against disposable loopback PostgreSQL/Redis); `npm run test:domain`
(835/835 across 30 files); `npm run build` (both Next production builds and CSP
verification of 12 inline-script hashes); and the full Chromium/Firefox/WebKit
UI matrix (workspace/auth-selector journeys, keyboard, five widths and axe).
`npm run format:check`, `npm run eol:check`, `npm run privacy:check`, and
`git diff --check` passed. The browser/integration services were disposable;
no shared Compose database was changed.

This refresh added focused OTP request/verification tests proving Redis limiter
outages return a sanitized 503 before database or email-provider side effects,
and changed the Redis atomicity test to use two independent clients against the
same shared keyspace. Refresh-token reuse logs now omit the session-row ID and
the logger redacts session ID field names. Legal drafts were corrected to
describe the guarded consent/registration implementation accurately while
remaining explicitly unapproved and not for acceptance/publication.

Configuration presence was checked without reading or printing values:
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are present in the ignored `.env`; the
separate OTP HMAC secret, OTP enable flag, registration enable flag, and legal
version configuration are absent. No Resend request or email was sent. The
production-only dependency audit reports three moderate Mammoth/argparse/
sprintf-js findings; the full audit exits 1 with five high and seven moderate
findings, including development-tooling chains. No breaking downgrade, override,
suppression or waiver was applied. Current local checks do not establish
provider-domain verification, legal approval, hosted CI, deployed configuration,
or production readiness. No commit, push, merge or deployment occurred.

### Authentication gap reconciliation and integration rerun (2026-10-20, Node 24.19.0)

The first plain `npm run test:integration` invocation exited nonzero because
the current `.env` intentionally has no database or Redis test endpoints; test
guards refused to run integration cases, so no database connection or external
provider call occurred. I then reran with process-only configuration against
the already-running loopback PostgreSQL/Redis development test services. The
suite passed 55/55 with zero skipped. It exercised OTP request/verification,
session rotation and replay revocation, session migration, owner-scoped device
listing/revocation, queue recovery, and the existing service-backed API cases.
The tests create uniquely named disposable databases and use synthetic OTP
delivery; no live Resend request was made. The local services themselves were
left running and were not shut down or reconfigured. No `.env` values were
printed or persisted by the test invocation.

This rerun found the current AUTH-01 register stale: refresh-family rotation,
reuse revocation and device-session inventory/revocation are implemented and
locally tested. `GAP_MATRIX.md`, `blocker.txt` and `docs/security/THREAT_MODEL.md`
now distinguish these implemented controls from remaining gaps: fallback
provider selection/acceptance, recovery and email-change flows, new-device
alerts, risk-based step-up, staff/admin MFA, and hosted/legal/provider
acceptance. AUTH-01 remains open; no production-readiness claim is made.

The same loopback-only process configuration also passed `npm run
test:database-recovery` (one test; 17 table fingerprints plus encrypted resume
object recovery, synthetic owner data only), `npm run test:crash-recovery`
(publication crash, queue-publish crash, lease fencing and object-publication
reconciliation scenarios), and `npm run test:queue-runtime` (isolated Redis
restart/AOF restore and publisher/worker process lifecycle). These use local
disposable test records/databases and do not prove off-host backups, hosted
restore, production infrastructure or RPO/RTO.

`npm run test:performance` passed on the same local synthetic database. For 60
sequential samples per authenticated read route, p50/p95/max milliseconds were:
searches 5.40/6.00/53.96; leads 6.64/8.97/28.78; profile
4.21/5.02/5.40; preparation 4.57/7.18/8.70. Under eight concurrent
readers for 30 seconds, the harness completed 13,578 requests (452.6/s), zero
failures, p50/p95/p99 16.59/25.72/33.58 ms; RSS rose from about 299 MiB to
410 MiB. These values pass the script's developer-machine regression ceilings;
they are not production latency/SLO evidence and do not measure frontend web
vitals or hosted worker backlog latency.

### Dual-address email-change implementation and current local validation (2026-10-20, Node 24.19.0)

Added owner-scoped email-change challenge persistence and authenticated
`/api/account/email-change/request` and `/verify` routes. Codes are bound to the
current and proposed address separately; only HMAC digests, challenge metadata
and expiry are stored. The database email remains unchanged until both
addresses verify. The current-address message is the request notice, and failed
delivery cancels the pending request. Added the account-security UI and OpenAPI
contracts. Migration `0025_spicy_vulture.sql` is additive and was tested only
in disposable local PostgreSQL; it was not applied to a shared database.

On the current uncommitted task branch, isolated `npm run test:integration`
passed 55/55 with zero skips against pinned PostgreSQL 17.6 and Redis 7.4.5
containers bound to ephemeral loopback ports and removed by the harness. The
service-backed test covers separate deliveries, digest-only persistence,
incorrect-code rejection, no change after one verification, change after both
verifications, replay rejection, the updated session-facing address, and
OpenAPI route registration. No live Resend call occurred. `npm run build`
passed both Next.js production builds and verified all 12 inline-script CSP
hashes. `npm run gates:test` passed: four Node policy tests, five approved-source
tests, four privacy tests, nine deployment-policy tests, EOL, lint, 53-file
strict test typecheck, and 74/74 unit tests. The first repository format check
identified that Prettier cannot parse plain-text `blocker.txt`; `.prettierignore`
now excludes only this operational text register, and the subsequent
`npm run format:check` passed. Targeted formatting, privacy scan/tests and
`git diff --check` also passed.

The mocked browser-level email-change journey in `scripts/check-ui.ts` passed in
Chromium and Firefox, including axe and responsive-width assertions; all API
calls were intercepted and no email was sent. The full
`CAREERSCOPE_UI_BROWSER=all` run exited 1 later in Firefox at the existing
dashboard-quiescence assertion: repeated successful `GET /api/leads` requests
prevented the 250ms quiet window for 15 seconds. WebKit did not run. The issue
remains open; no retry was used to claim a pass. Only uniquely named temporary
containers and the test web process were stopped; existing volume-backed
services were untouched. Independent security review, provider/domain
verification, hosted staging and live delivery remain pending; AUTH-01 and the
broader v12 goal remain incomplete. No commit, push, merge, deployment,
production change, or shared-service modification occurred.

### OTP expiry and unavailable-state hardening (2026-10-20, Node 24.19.0)

The verification path previously captured the OTP expiry clock before waiting
for the challenge row lock. It now reads the clock only after the row is locked;
a deterministic fake-pool regression advances time at lock acquisition and
asserts that a code expiring at that boundary is rejected and consumed. The
web API client now maps service-unavailable responses to safe actionable
messages, with the approved sign-in-specific wording for OTP request/verification
and a generic service message elsewhere. Tests assert server error details are
not exposed.

Validation on the current dirty task branch: `npm run test:unit` PASS (76/76);
`npm run test:integration` PASS (55/55, zero skipped) using PostgreSQL 17.6
with per-test scratch databases and two isolated Redis 7.4.5 containers on
random loopback ports; all temporary Redis containers were removed. Also
PASS: `npm run typecheck`, `npm run build` (both Next builds and 12 CSP inline
hashes), `npm run lint`, `npm run format:check`, `npm run eol:check`,
`npm run privacy:test` (4/4), `npm run privacy:check`, and `git diff --check`.
`npm run security:check` and the complete browser matrix were not rerun in this
checkpoint. Full dependency audit findings remain unresolved. No real provider
request, email, shared migration, push, merge, or deployment occurred.

Before editing, an external all-ref Git bundle and working-tree patch/archive
were created and verified. SHA256 of the bundle:
`CA61EE5B1F40EF224EC59F69A50C208A7C2946799108D3EB9BE18611D2B69BD9`.
The all-ref restore clone passed `git fsck --full --strict` and exact ref
comparison. The private backup location is intentionally not recorded here.
Independent review of the current auth diff remains pending; no commit was made.

### Autonomous-goal progress audit and current local checks (2026-10-20, Node 24.19.0)

Read the approved source register, engineering contract, complete CareerScope
Goal, standards, current gap/test/quality matrices, go/no-go ledger, blocker
register and current branch state. The machine-readable v12 inventory still has
319/319 source clauses `NOT_ASSESSED` and `NOT_RUN`; the 25/25 release go/no-go
rows remain `NOT_VERIFIED`. These are evidence-accounting states, not a claim
that no functionality exists. Consequently, no defensible aggregate product or
autonomous-goal implementation percentage can be computed from the current
authoritative assessment records. Production readiness is 0/25 verified
go/no-go gates (0% of that release-gate checklist), not a measure of local code
coverage.

Fresh checks during this audit: `npm run test:domain` PASS, 835/835 across 30
files (about 5 seconds); `npm run security:check` exit 0 at its configured
high-severity threshold, while reporting three moderate `sprintf-js` findings;
full `npm audit --json` exit 1 with 12 affected package nodes (5 high, 7
moderate, 0 critical). The full browser matrix's latest recorded result remains
FAIL/INCOMPLETE: Firefox dashboard request settlement observed repeated
successful `/api/leads` requests, so WebKit was not reached. Do not treat the
earlier successful all-browser run as current evidence.

Audit reconciliation: corrected stale `VALIDATION-ENV-01` and
`INDEPENDENT-REVIEW-01` descriptions in `blocker.txt`. Node 24 and the integrated
OTP implementation/tests are present; independent review still does not cover
the current dirty auth diff. No application source, migration, runtime data or
Git history was changed as part of this audit. The existing 53-path dirty task
worktree was preserved. No fetch, commit, push, merge, hosted run, real provider
call, shared-database migration or deployment occurred. Separate UI evidence
containers were left running untouched.

### Owner-authorized main consolidation (2026-10-21)

OA-2026-10-21-01 supersedes the development-only integration restriction.
The current consolidation preserves every local branch history, both original
dirty worktrees and their untracked source, and the approved design corpus.
Independent auth, application-evidence and browser-test reviews passed after
correcting the production signup capability gate and test lifecycle defects.
The current local merge includes canonical OTP/session/email-change work,
application evidence/history/withdrawal, consent, source-permission controls,
CI-only workflow and the v12 engineering evidence. Superseded OTP variants and
conflicting unpublished migration numbers remain in ancestry rather than
competing in the active implementation. Migration 0026 is additive.

Current Node 24 evidence: gates 77/77; integration 55/55 with no skips; domain
835/835; build and 12 CSP hashes; formatting; production dependency/security
check; two recovery tests comparing 18 tables plus encrypted objects; full-disk
and four crash boundaries; complete Chromium/Firefox/WebKit browser and selector
journeys with axe, keyboard and reflow. Drizzle regeneration reports no drift.
See docs/MAIN-CONSOLIDATION-2026-10-21.md for commands, failed diagnostic attempts,
conflict decisions and limitations. The full dependency audit still reports
five high development-tool and seven moderate entries; no security threshold or
scan was weakened. Hosted Actions is still disabled and no hosted pass exists.
This is a local integration candidate, not a synchronized main checkpoint or
completion of the full v12 goal. The full-tree high dependency audit blocks the
main update until remediation or an explicit owner exception under the contract.
No such exception is inferred from direct-push permission. No deployment, live
provider call or shared migration occurred.

### Updated document reconciliation (2026-10-21)

The newly supplied v12, Engineering Standards and Goal documents have different
SHA256 identities from SRC-01 through SRC-03. The source reconciliation at
`docs/requirements/SOURCE-RECONCILIATION-2026-10-21.md` records the exact delta,
pending A1/A2/A3/CR-07 authority, hosting contradiction, contract compatibility
questions and dependency-aware continuation. SOURCE-REVISION-01 contains owner
steps; it blocks changed proposals, not independent approved engineering.
Original source snapshots, approvals, source inventory and go/no-go results
remain unchanged. No blanket amendment approval or security waiver is inferred.
Executed on the local consolidation candidate: source integrity PASS, five source
regression tests PASS, privacy scan PASS, EOL PASS, git diff check PASS. This
documentation review did not rerun the entire product suite or implement runtime
features. The prior checkpoint's functional results remain separately scoped.

### Dependency remediation and final local integration validation (2026-10-21)

Resolved the 12 package-node advisories recorded in AUDIT-01 (five high and
seven moderate) through narrow, reviewed lockfile resolutions: Next's glob
consumer now uses the compatible `tinyglobby` implementation, Mammoth's CLI
parser uses `argparse` 2.0.1, the legacy esbuild loader uses `esbuild` 0.25.12,
and root Vite is pinned to 8.3.4. No major framework downgrade, audit
suppression, threshold change, or waiver was used. Seven regression tests cover
the real Next plugin and lint rule, Mammoth CLI/library, transform API, Drizzle
CLI/migration preservation, and vulnerable-chain rejection.

Executed with Node 24.19.0/npm 10.9.8: fresh `npm ci` PASS (616 packages);
`npm ls --all` PASS; `npm audit --audit-level=low` PASS with zero findings;
clean Linux Node 24 archive install and the seven dependency regression tests
PASS with zero audit findings. `npm run gates:test` PASS (84/84),
`npm run test:integration` PASS (55/55, no skips), `npm run test:domain` PASS
(835/835 across 30 files), production build PASS (12 prerendered routes and CSP
verification for 12 inline-script hashes), and `npm run format:check` PASS.
Recovery PASS: PostgreSQL restore compared 18 tables and restored encrypted
objects, Redis queue restart/AOF recovery, full-disk handling, and crash-boundary
recovery. `npm run test:ui` PASS on Chromium, Firefox and WebKit, including the
account selector, keyboard, five viewport widths and axe checks. The first
browser attempt exposed WebKit fetch errors during immediate OTP-page
navigation; the OTP test now waits for its finite requests to settle and asserts
no page errors before continuing. The existing narrow WebKit access-control
diagnostic handling in the separate long navigation scenario remains as
documented in `scripts/check-ui.ts`.

`git diff --check` PASS; Drizzle generation reports no schema changes. GitHub
Actions is disabled for this repository, so there is no hosted run ID or hosted
CI result to claim. These are local integration checks; they do not establish
production readiness, external-provider acceptance, or a deployment. No
production deployment, shared database migration, real email/provider call, or
DNS/infrastructure change occurred.

### Exact-main integration rerun (2026-10-21)

At `f836f66d5f634789d76a67eea42fa949921d6655`, the complete serial
`npm run test:integration` command passed 55/55 tests with zero skips using
PostgreSQL 17.6 and Redis 7.4.5 in disposable containers, published only on
loopback with tmpfs data and synthetic credentials. The test process received
explicit URLs for the database, cache Redis, and persistent queue Redis; the
Resend key was unset, so no provider request or real message was sent. The
containers were removed after the run and existing project containers/volumes
were not touched.

The earlier attempt in this validation session failed because the checked-in
`.env` points to unused local ports 58380–58382, while the isolated test
services were published on different ephemeral ports. The resulting Redis
connection failure caused teardown errors in dependent queue tests. No test was
retried away or weakened: the run was repeated once with all three service URLs
explicitly set to the disposable services and passed in full. `.env` was not
changed. This is a local test-environment mismatch, not evidence of a product
queue defect.

### Main synchronization and preserved-worktree reconciliation (2026-10-21)

The owner-authorized main sync was completed without force-push or worktree
cleanup. `e5281fa` (email OTP preservation), `b16c4ec` (application-evidence
preservation), and `f836f66` (validated integration) are ancestors of main; the
tips of `codex/task/email-otp-auth` and `codex/task/application-evidence` are
also ancestors of main. At main `94579da4d70d1e87d5e846832492236157e875ea`,
`git ls-remote origin refs/heads/main` matched local `main`; the working tree
was clean after push.

Both original dirty worktrees were preserved. At that comparison checkpoint,
the email worktree had 53 Git status entries representing 54 files (the
untracked legal-doc directory contains two files); 38 file contents matched
main and 16 differed, with no file path absent from main. A read-only
independent review of that stale content returned NEEDS WORK. The inspected
differences include a registration gate regression when the test-access mode is
disabled, removal of `emailVerifiedAt` from session/OpenAPI/client contracts,
and removal of current dependency remediations. Canonical main already contains
the corrected gate and verification signal; the dirty tree was not overlaid.

The application-evidence worktree had 57 status entries representing 58 files:
8 contents matched main, 42 differed, and 8 paths did not exist on main. The
committed task tip is integrated; the preserved uncommitted residue includes
alternate email-OTP/provider modules and migrations with numbers/contracts that
conflict with the canonical main schema. Main has the application-evidence
behavior in migration 0026 and a single account-consent implementation. No
uncommitted file was deleted or copied. These counts are a checkpointed
comparison, not a claim that all residual content has received whole-diff
approval.

This follow-up does not claim hosted CI: GitHub Actions is disabled. It does not
claim live Resend delivery, counsel approval, production acceptance or release
readiness. Before the retention regression was added, exact-main integration was
55/55 with zero skips. After the change, the complete local integration command
passed 56/56 with zero skips using disposable PostgreSQL 17.6 and Redis 7.4.5
services. No real provider request, deployment, or shared-database migration
occurred.

### Expired email-change request cleanup (2026-10-21)

Root cause: the existing weekly `careerscope-retention.timer` called a retention
script that removed aged search records but never deleted expired
`email_change_requests`, leaving an unusable proposed email address in
PostgreSQL until further account activity/deletion. The script now removes rows
where `expires_at <= now()` in the same transaction and reports the deletion
count. No service, timer, schema, or retention policy setting was added. The
existing `expires_at` index supports locating
expired rows; planner use and deletion workload remain data-dependent. Live
requests and the owning account's email are not changed.

Regression evidence: the new real-PostgreSQL test failed before the fix because
the expired request was not removed, then passed after the fix. The first
test-fixture attempt violated the database's creation-before-expiry constraint;
the corrected fixture models a valid request that subsequently expired. The
targeted retention integration file passed 3/3 on Node 24.19.0 against a
disposable PostgreSQL 17.6 container with tmpfs data and synthetic identities.
The container was removed after the test. This does not verify that a production
host has the weekly timer installed/running or establish counsel-approved
retention terms.

### Exact-main local validation refresh (2026-10-21)

Validation was run against clean local `main` at
`76b838b41b56f87358fe6d32a7fa23cf736df439`, matching `origin/main` before the
run. The default shell Node was v22.23.2 and correctly failed the repository's
Node 24 floor check; rerunning with the bundled Node v24.19.0 resolved the
environment mismatch without changing project configuration.

`npm run gates:test` PASS (84/84 unit/gate tests; includes requirements, privacy,
deployment-gate, EOL, lint, typecheck and root unit checks). `npm run test:domain`
PASS (835/835 across 30 files). `npm run build` PASS (Next.js production build,
12 prerendered routes, CSP verification covers all 12 generated inline-script
hashes). `npm run format:check` PASS. `npm run privacy:check` PASS. `npm audit
--audit-level=low` PASS (zero reported vulnerabilities). `git diff --check` PASS;
the working tree was clean before this evidence entry was added.

This refresh did not rerun service-backed integration, recovery, browser/axe,
hosted CI, or production checks. The latest recorded service-backed integration
result remains 56/56 with zero skips from the earlier isolated PostgreSQL 17.6 /
Redis 7.4.5 run. GitHub Actions remains unavailable, and these local checks do
not establish production readiness or live Resend delivery.

### Responsive browser acceptance and exact-main follow-up (2026-10-21)

Extended only the existing `scripts/check-ui.ts` responsive checks to exercise
the eight widths required by the approved engineering standard: 320, 360, 390,
768, 1024, 1280, 1440 and 1920px. Application runtime behavior and assertions
were not weakened. `npm run test:ui` passed with `CAREERSCOPE_UI_BROWSER=all` on
Chromium, Firefox and WebKit, including axe and keyboard checks. Temporary
loopback-only PostgreSQL/Redis containers and the local web process started for
the run were stopped afterward. This does not satisfy hosted CI, manual screen-
reader, visual/design, live-provider or production acceptance.

After the test change, `npm run gates:test` passed (84/84), including current
lint, typecheck, privacy, deployment-policy and EOL/unit gates. `npm run lint`
and `npm run typecheck` also passed directly. The UI result is local and is not
hosted CI evidence. The stale current-state UI failure in `TEST_MATRIX.md` was
updated while retaining earlier dated failure history. Service-backed
integration/recovery and production checks were not rerun in this follow-up.

Subsequent service/recovery/performance refresh: The complete service-backed
integration, queue restart/AOF, database restore, crash recovery, full-disk and
synthetic performance checks were then run on the same main source SHA; exact
results are recorded in the following entry.

### Service, recovery and performance evidence refresh (2026-10-21)

Using Node 24.19.0 and canonical `main` source at
`5ce8410eb371c6b94de785d89389760a85c1009e`, the complete
`npm run test:integration` passed 56/56 with zero skips against newly created
loopback-only PostgreSQL 17.6 and Redis 7.4.5 containers. Two isolated Redis
instances were used; the queue instance used AOF and `noeviction`. The suite
included email OTP/session, database/ownership, queue, resume/storage, retention,
scheduler and liveness integration tests. Provider configuration was synthetic;
no live Resend request was made.

`npm run test:queue-runtime` passed the Redis restart/AOF restore and real queue
process lifecycle test (1/1). `npm run test:database-recovery` passed (1/1),
comparing all 18 database tables and restoring an encrypted resume object.
`npm run test:crash-recovery` passed all four publication/upload/lease crash
boundaries. `npm run test:full-disk` passed: typed capacity failure, no stranded
temporary objects, zero reserved bytes after failure, and successful retry after
capacity release.

`npm run test:performance` passed a 30-second synthetic run at concurrency 8:
17,684 requests, zero failures, 589.5 requests/sec, p50 12.86 ms, p95 19.57 ms,
p99 25.22 ms; baseline RSS 303,767,552 bytes and peak RSS 420,581,376 bytes.
These measurements are local synthetic results, not production SLOs or proof of
the full v12 concurrency target. All temporary test containers were stopped.
No shared/production database, live provider or production infrastructure was
accessed. GitHub Actions remains disabled; hosted CI and live/owner acceptance
gates remain unresolved.

### Interview organizer implementation checkpoint (2026-10-21)

On the main worktree, added candidate-owned interview-round persistence/API and
an Application Details organizer for round time/time zone, format, status,
contacts, preparation checklist, notes, optional parsed-resume references and
optimistic revision updates. The feature does not change application lifecycle
status. Reminder times are persisted only; no reminder notification is sent.

Validation on Node 24.19.0: core build, typecheck, lint, formatting and production
build passed. The new integration test passed 1/1 against disposable loopback
PostgreSQL 17.6. The browser suite was rerun against isolated PostgreSQL/Redis;
the final output included completed Chromium, Firefox and WebKit workflows, with
axe, keyboard and eight-width responsive checks. An initial run exposed a fixture
teardown FK-order defect; teardown now removes interview documents/rounds before
the saved application. Test containers and the temporary web server were removed.
The complete service-backed integration suite passed 57/57. The repository gate
passed 84/84 unit/gate tests; the domain suite passed 835/835. An independent
read-only review found two contract issues and a resume-deletion FK hazard; the
specific conflict message, 401/403 OpenAPI responses and cascading removal of
resume references were added and covered by the final integration run. The
reviewer found no remaining actionable defect in scope.
This is local evidence only: hosted CI, production migration and smoke validation,
manual product/accessibility review, and reminder delivery remain outstanding.
The main worktree changes are not yet committed or pushed.

### In-app interview reminder delivery (2026-10-21)

Completed the in-app portion of interview reminders using the existing publisher
loop and queue architecture. Due reminders materialize as idempotent,
owner-scoped notification records; the dashboard supports listing and marking
them read. Rescheduling, completing, or starting a round retires stale reminder
records. Notification text is generic and does not expose round title, contact,
notes, or resume details. Unread count is computed before the 50-item display
limit. Reminder publication does not mutate application lifecycle status.

Local evidence on Node 24.19.0: the focused interview API integration test
passed; the full `npm run test:integration` passed 57/57 with zero skips against
disposable PostgreSQL 17.6/Redis 7.4.5; `npm run gates:test` passed 84/84;
`npm run test:domain` passed 835/835; `CAREERSCOPE_UI_BROWSER=all npm run
test:ui` exited 0 on Chromium, Firefox and WebKit with axe, keyboard, eight
widths, due-reminder rendering and mark-read assertions. `npm run build`,
`npm run format:check`, `npm run lint`, `npm run typecheck`,
`npm run privacy:check`, `npm run security:check`, Drizzle migration checking,
and `git diff --check` passed. These are local results; hosted Actions, live
email/push delivery, full v12 notification preferences/digest/localization,
manual assistive-technology/design review and production acceptance remain
unverified. Independent review found one P2: read notifications and retired
idempotency tombstones have no bounded retention/purge. The approved retention
schedule does not define a period for this data class, so none was invented; see
`blocker.txt` for the owner action. No live message or production change
occurred. GitHub Actions is disabled, so hosted CI is unavailable.

Repository checkpoint: this reminder slice was committed and pushed directly
to `main` as `3b9f23946a41bf3dbc504e58127d5080a2858591`. The normal push
succeeded; a fresh `git ls-remote` check matched local `HEAD`, and the main
worktree was clean. This does not include the separate 53-entry dirty OTP
worktree or constitute production deployment. The P2 notification-retention
policy remains open.

### Exact-SHA hosted CI recheck (2026-10-21)

After the documentation-only checkpoint `a41eea792ea416a04d7b543f0fdb89757a0e4e8e`
was pushed, a read-only GitHub API query reported repository Actions
`enabled: false`; `gh run list --commit` for that exact SHA returned `[]`. No
hosted check is available for this commit. Repository settings were not changed;
the precise owner action remains in `blocker.txt` GOV-02.

### Exact-main validation refresh (2026-10-21, Node 24.19.0)

This run began on clean local `main` at `5e6ca2d7de2592ea5f675ec3fd479d1038d0a5f0`,
matching `origin/main` after `git fetch origin main`. `npm run gates:test` passed
84/84 tests and included the Node/source/privacy/deployment/EOL checks, lint,
workspace and test typechecks, and unit suite. `npm run test:integration` passed
57/57 with zero skips against the isolated local PostgreSQL/Redis test stack;
`npm run test:domain` passed 835/835 across 30 files. The full responsive UI
suite passed in Chromium, Firefox and WebKit, including axe, keyboard and eight
viewport widths.

`npm run build` passed both Next.js production builds and verified all 12 CSP
inline-script hashes. `npm run format:check`, `npm run security:check`,
`npm audit --audit-level=low`, and `git diff --check` passed; the full dependency
audit reported zero vulnerabilities. Queue restart/AOF recovery passed 1/1;
database restore passed 1/1 and compared 21 tables while restoring an encrypted
resume object; all four crash-recovery boundaries passed; full-disk behavior
passed with no stranded temporaries or leaked reservations.

The synthetic 30-second performance test at concurrency 8 passed with 18,079
requests, zero failures, 602.6 requests/second, p50 12.56 ms, p95 19.19 ms and
p99 23.68 ms (baseline RSS 301,371,392 bytes; peak RSS 433,549,312 bytes).
These are local synthetic measurements, not production SLOs. Test data was
synthetic and services loopback-only; the disposable recovery source container
was removed. Existing local service containers were not stopped. No live Resend
delivery, shared/production database, deployment or production change occurred.

The GitHub Actions permissions API still reports Actions disabled; combined
status and commit workflow-run queries for the tested main SHA returned no
hosted checks. This documentation-only evidence refresh does not change runtime
behavior or close the hosted CI, live provider, human validation, or production
acceptance gates. The separate dirty OTP task worktree was left untouched.

The evidence update was committed locally and pushed normally to `main` as
`914830fbf966acb47692289f9c09ec598190cced`. Local `HEAD`, `origin/main`, and
`git ls-remote origin refs/heads/main` all matched that SHA; the main worktree
is clean. A post-push GitHub query for that exact commit returned no statuses or
workflow runs, and the Actions permissions API still reports `enabled: false`.

## Deterministic match-version provenance (2026-10-21)

The v12 section 4.7 match-version requirement was missing from the result
contract. New score breakdowns now record `deterministic-v1`; legacy stored
breakdowns remain `null`/unknown, with OpenAPI documentation and a regression
test. Scoring behavior is unchanged. On Node 24.19.0, score tests passed 30/30,
domain tests 836/836 (30 files), root gates 84/84, integration 57/57 with zero
skips against disposable PostgreSQL 17.6/Redis 7.4.5, production build/CSP,
lint, format and privacy checks passed. Integration initially failed because
local `.env` credentials were applied to the synthetic disposable database; the
rerun used the CI-only synthetic configuration and did not modify `.env`.
GitHub Actions remains disabled, so hosted CI is unverified. This does not close
matching golden-set/eligibility proof or production release gates.

### Exact-main dependency/privacy refresh (2026-10-21)

At pushed `main` SHA `1d3f85429000496f788324c7a9e1ac9a842d20df`, Node 24.19.0
`npm audit --audit-level=low` reported zero vulnerabilities. `npm run
security:check` passed, including the tracked-file privacy scan and production
dependency audit. These checks do not replace hosted CI or the remaining
security, privacy, provider, legal, and production acceptance gates.

### Hard-eligibility visibility correction (2026-10-21)

Review against approved v12 section 4.7 found that the search worker discarded
jobs whenever deterministic hard-eligibility guidance was present, contradicting
the requirement that such criteria be advice and never hide a listing. The
worker now returns the posting with score zero and the exact reason; soft
matching, provider permissions, and ranking are otherwise unchanged. A search
worker regression covers employment-type and excluded-keyword cases.

The implementation and regression are committed on `main` as
`a4df59a2d24b365f39d8321554ec5c967b3bfd15`; validation above ran against the
identical source tree before commit.

On Node 24.19.0, the worker collection suite passed 19/19; `npm run gates:test`
passed 84/84 (including lint, strict typecheck and unit tests); `npm run
test:domain` passed 836/836; service-backed `npm run test:integration` passed
57/57 with zero skips against disposable PostgreSQL 17.6 and Redis 7.4.5;
`npm run build` passed both production builds and CSP verification. Formatting,
EOL, privacy and diff checks passed. All three disposable containers were
stopped. No actual job sources were contacted. Hosted Actions remains disabled.

### Resume role-versioning contract gap (2026-10-21)

Continued on clean `main` at `7a90012a4bfeb48f4d4e9df45f503cb5e378fd6`.
Read-only contract review confirmed v12 section 4.3 is not implemented end to
end: uploads have no target-role/lineage fields, while search currently selects
the globally newest parsed resume. A metadata-only change could therefore use
the wrong role's resume. No runtime behavior or personal data was changed. The
specific semantics requiring owner confirmation and the recommended minimal
behavior are recorded as `RESUME-VERSIONS-01` in `blocker.txt`.

The blocker-only update was checked with Node 24.19.0 `npm run privacy:check`
and `npm run eol:check`, plus `git diff --check`; all passed. It was committed
and normally pushed to `main` as `aa6aa1ebb017418a62c91a03f1c35aabaafc4bfb`;
after fetch, local `main` and `origin/main` matched and the worktree was clean.
No hosted CI run exists while Actions is disabled. The separate dirty email OTP
worktree was not accessed or modified.

### Account Security email-verification status (2026-10-21)

The authenticated Account Security surface now displays the verification date
from the existing server session contract, or clearly states when verification
is not recorded. The browser fixture supplies a synthetic timestamp and asserts
the user-visible status. This is only a display of the existing email signal;
it does not add identity, employment, education, or other verification claims.

On Node 24.19.0, `npm run gates:test`, `npm run format:check`, and `npm run
build` passed before the browser run. `npm run test:ui` then passed with
`CAREERSCOPE_UI_BROWSER=all` on Chromium, Firefox and WebKit, including axe,
keyboard and eight-width responsive checks. The browser stack used disposable
loopback PostgreSQL/Redis and synthetic data; the containers and local web
process started for the run were stopped afterward. Hosted CI remains
unavailable while GitHub Actions is disabled. These source and test changes are
committed and pushed to `main` as `81b2371`. The separate OTP and
application-evidence worktrees were left untouched.

### Main synchronization confirmation (2026-10-21)

After the Account Security change and its documentation checkpoint, local
`main`, `origin/main`, and the remote `refs/heads/main` all matched at
`174f8a33da7914be7c40bdbafcf0592a6919f5ce`. The Resend OTP implementation
committed at `f23d33f` is an ancestor of this SHA. Later uncommitted changes
remain preserved in the separate OTP worktree (53 current Git status entries)
and application-evidence worktree (57 current Git status entries); they were not
included because they have not been validated as coherent integration
candidates. The earlier email snapshot inventory described 53 status entries
as 54 files because one untracked directory contained two files. No other
worktree was modified. GitHub Actions remains disabled; no hosted run exists for
this SHA. No deployment or production change occurred.

### Missing email-verification status regression (2026-10-21)

Added a browser regression for an authenticated account whose existing session
does not contain `emailVerifiedAt`, confirming Account Security renders the
neutral “Email verification is not recorded” status and restores the verified
date when the fixture signal is present. This preserves the existing API and
does not claim another identity-verification property.

On Node 24.19.0, `npm run gates:test` passed on the exact source tree (including
privacy/deployment checks, lint, strict typecheck and 84/84 unit/gate tests).
`npm run test:ui` passed on Chromium, Firefox and WebKit, including axe,
keyboard checks and all eight required responsive widths. The browser run used
synthetic data and disposable loopback PostgreSQL/Redis services, which were
stopped after the run. After formatting the test file, `npm run format:check`,
`npm run privacy:check`, `npm run eol:check` and `git diff --check` passed.
The parent source SHA `9eeffec4d59b3db2019fb3e976abc7d58064df33` had already
passed `npm run build`, `npm run security:check` and `npm audit
--audit-level=low`; the only code change here is test coverage. The regression
was committed and pushed to `main` as `136c91666faa09b8b4cadefb15de151b26d40ecf`.
After fetch, local `main` and `origin/main` matched. The exact SHA has no hosted
Actions run because repository Actions remains disabled. No deployment or
production change occurred.

### Candidate-owned application CSV export (2026-10-21, Node 24.19.0)

Implemented the v12 section 4.9 CSV export without adding a service, queue,
database migration, or new persistence model. The authenticated API derives the
owner from the current server session, limits export requests, returns a
`private, no-store` attachment, and serializes only tracked application
statuses. Export columns are limited to job/application context, candidate-
reported application evidence and candidate notes; raw job descriptions and
internal IDs are excluded. CSV quoting and spreadsheet-formula neutralization
are covered by unit tests. The Applications screen now exposes an accessible
export link. Its 320px browser assertion exposed a non-wrapping title/action
row; the shared Applications/Saved Leads header now wraps rather than widening
the page, while the compact navigation remains an in-container scroller.

Validation on the exact local source: `npm run gates:test` PASS (86/86 unit
tests; lint, strict typecheck, privacy, deployment gate, source integrity and
line endings included); `npm run test:integration` PASS (58/58, zero skips,
disposable PostgreSQL 17.6 and Redis 7.4.5); `npm run build` PASS (both Next
builds and CSP hash verification); UI run completed on Chromium, Firefox and
WebKit, including axe, keyboard and responsive checks; `npm run format:check`,
`npm run privacy:check`, `npm run eol:check` and `git diff --check` PASS.
`npm run test:domain` passed 836/836, and `npm run security:check` reported zero
production dependency vulnerabilities. The first integration attempt ran before the configured disposable loopback
services were available and was not counted; a full successful run followed
after isolated services were started. A fresh independent review of the exact
export diff from base `4fe524ad911b03aa981dc3151804837a42abf95d` returned PASS
(review fingerprint `BB680AA000595C20B5370B3B9E060717277FBBF87D2509F1EDF9A15126015FA1`).
That review's P2 OpenAPI response mismatch was corrected; on Node 24.19.0,
`npm run test:integration` passed 58/58 with zero skips, `npm run gates:test`
passed 86/86 unit tests, `npm run build` passed with CSP verification,
`npm run security:check` found zero production dependency vulnerabilities, and
typecheck, lint, formatting, privacy, EOL and diff checks passed. Prior exact-tree
evidence includes three-browser UI/axe/eight-width checks and domain tests
(836/836). No live data, provider call, hosted CI, deployment or production
change was involved. The validated export was committed and normally pushed to
`main` as `bad50e78cf0d2f605912e778b7e167682e745882`; local `main`,
`origin/main`, and the remote advertised SHA matched after push. GitHub Actions
remains disabled, so this commit has local validation but no hosted CI run. PDF
export and the other v12 section 4.9 capabilities remain out of scope for this
change.

### Self-reported signup age screen (2026-10-21, Node 24.19.0)

On `main` after `bad50e78cf0d2f605912e778b7e167682e745882`, implemented a
signup-only self-reported 18+ screen before OTP challenge creation/delivery.
The server validates strict ISO calendar dates and evaluates age using UTC
calendar dates (including a deterministic Feb-29 rule). Only a boolean pass
result is retained with the signup challenge/account; raw date of birth is not
persisted, included in OTP verification, or stored in browser storage. Sign-in
requests reject signup-only DOB input, and legacy signup challenges without a
pass result fail closed. OpenAPI and UI disclosure were updated. This is an
eligibility screen, not identity/age verification or legal approval.

An independent read-only review of the exact implementation diff returned
PASS with no blocking correctness, privacy or security findings. On the current
uncommitted source tree, `npm run gates:test` passed (88/88 unit tests plus
strict typecheck, lint, privacy, deployment-policy, source-integrity and EOL
gates); `npm run test:integration` passed 58/58 with zero skips using disposable
loopback PostgreSQL/Redis and a synthetic OTP sender; `npm run test:domain`
passed 836/836 across 30 files; `CAREERSCOPE_UI_BROWSER=all npm run test:ui`
passed on Chromium, Firefox and WebKit with axe, keyboard and eight approved
responsive widths; `npm run build` passed both Next builds and CSP hash
verification; `npm run format:check`, `npm run eol:check`,
`npm run security:check` and `git diff --check` passed. The first UI invocation
could not connect because the harness requires a separately started web server;
after starting the local web app, the full three-engine command passed. That
server was stopped after the run. No live email, hosted CI, deployment, shared
database or production change occurred. GitHub Actions remains disabled, so
there is no hosted run for this change. The implementation was committed on
`main` as `3a93fda` after confirming remote `main` matched its parent SHA;
final push and synchronization verification are recorded by the Git result.

### Current dependency-audit reconciliation (2026-10-21)

The old 20 October quality-audit finding of five high/seven moderate advisories
is retained as historical evidence and superseded by the remediation recorded
above and in `blocker.txt` under AUDIT-01. I reran
`npm audit --audit-level=low` against the current `main` checkout at
`d96ece59ad30df8c8eb3397c344f7761949c6815` using Node v24.19.0; it exited 0
with `found 0 vulnerabilities`. No dependency files changed during this check.
`QUALITY_AUDIT.md` now distinguishes the historical result from the current
lockfile audit. GitHub Actions remains disabled; this local audit is not hosted
CI or production security acceptance.

### Candidate profile education and projects (2026-10-21)

On the current `main` checkout based at `bd8097123a5224966c0e9fe807a10d571200dee3`,
extended the existing owner-scoped profile with self-reported education entries,
graduation year and project summaries. Shared schema and OpenAPI bounds agree:
up to 20 entries per list, each 1–200 characters, and graduation year 1900–2100.
The values stay private, are not treated as verified evidence or deterministic
matching inputs, and use the existing JSON profile storage (no database
migration). Existing profile reads are not backfilled: absent legacy keys show
as blank in the editor and are normalized on the first successful save.

An independent read-only review of the current profile changes returned PASS.
On Node v24.19.0, `npm run gates:test` passed (90/90 unit tests, strict
typecheck, lint, source-integrity, privacy, deployment-gate and EOL checks);
`npm run test:integration` passed 58/58 with zero skips against disposable
loopback services; `npm run test:ui` passed Chromium, Firefox and WebKit,
including the profile boundary/legacy-row checks, axe, keyboard and responsive
checks; `npm run build` passed with both CSP builds and all 12 generated script
hashes verified; `npm run format:check`, `npm run security:check` (zero
production dependency vulnerabilities) and `git diff --check` passed. The first
fresh UI attempt exposed a test setup issue: required role/skill fields were
empty, so native form validation prevented the submit handler from running.
The harness now fills those fields first; the complete three-engine rerun passed.
No runtime deployment, provider call, live data change or production action was
performed. Hosted GitHub Actions remains disabled, so no hosted result exists.

### Stale search-read browser settlement regression (2026-10-21, Node 24.19.0)

On `main`, the all-browser UI suite exposed an in-flight search-detail GET from
an earlier SPA route that kept the request-settlement barrier open after the
route changed. The existing stale-read exception was limited to saved-job GETs.
Added a narrow route-epoch predicate for GET `/api/searches` and
`/api/searches/:id` only; current-route reads, event streams, mutations and
unrelated endpoints remain in the barrier. Added regression tests for both
search GET shapes, current-route retention, writes, event streams and unrelated
reads. This changes browser-test bookkeeping only; no product runtime code or
database contract changed.

On Node v24.19.0, the focused request-classification tests passed 2/2;
`npm run gates:test` passed with 91/91 unit tests, strict typecheck, lint,
privacy/source/deployment/EOL checks; `npm run test:domain` passed 839/839;
`npm run test:ui` passed on Chromium, Firefox and WebKit with axe, keyboard and
the required eight responsive widths; `npm run build` passed with all 12 CSP
hashes verified; `npm run security:check` reported zero production dependency
vulnerabilities; formatting and `git diff --check` passed. The local browser
run used only synthetic accounts and disposable loopback PostgreSQL/Redis.
The fix was committed and pushed directly to `main` as
`444a832569ffae6da4e308b8e68bd574084f5180`; local main, `origin/main` and the
remote `refs/heads/main` match, and the worktree is clean. No hosted Actions run
is available for this SHA while Actions is disabled. No production deployment,
live provider request or shared-data change occurred. The separate dirty
email-OTP worktree remains preserved and was not modified.

### Current main and preserved-worktree inventory (2026-10-21)

Read-only verification found local `main`, `origin/main`, and the remote
`refs/heads/main` synchronized at `9572dcc73576c1c9d13ddeb3d2c1909f92e8d602`;
the main worktree is clean. All six registered worktree HEADs are ancestors of
main, so no committed worktree commit is missing. The separate
`codex/task/email-otp-auth` worktree has 54 uncommitted paths and
`codex/task/application-evidence` has 58; neither dirty delta is included in
main. Both remain untouched pending per-file review and validation. Main does
include committed Resend OTP provider and authentication routes, but no live
delivery or production acceptance is claimed. GitHub Actions remains disabled,
so there is no hosted CI result for this SHA.

### Exact-main service-backed integration rerun (2026-10-21)

At main source SHA `6657e1ecf17722f42dabfd6eea7216fdcc20c01f`, Node v24.19.0
`npm run test:integration` passed 58/58 with zero skipped tests. This reruns the
registered PostgreSQL/Redis integration suite after the worktree-ledger update;
the interview organizer scenario passed, covering its owner-scoped round,
revision, scheduling, preparation, linked parsed-resume and in-app reminder
paths. Test providers were synthetic; no real email or production service was
used. This result is local service-backed evidence, not hosted Actions or live
provider acceptance. The 4.15 notification preference, email/push delivery,
deliverability and retention gaps remain open.

### Current-main local gates (2026-10-21)

After the documentation-only evidence update, local `main` at
`113c89834a480e405152f3f96a5c14f01d33248c` passed on Node v24.19.0:
`npm run gates:test` (including 91/91 unit tests, lint, strict typecheck, source,
privacy, deploy-policy and EOL gates), `npm run test:domain` (839/839 across 30
files), `npm run security:check` (zero production dependency vulnerabilities),
and `npm run build` (production Next build and CSP verification for all 12
inline-script hashes). The service-backed integration suite separately passed
58/58 with zero skips on parent code SHA `6657e1ecf17722f42dabfd6eea7216fdcc20c01f`;
the only source changes between that integration run and this SHA were evidence
documentation. Earlier UI evidence on unchanged runtime code passed Chromium,
Firefox, WebKit, axe, keyboard and eight responsive widths. No current hosted
Actions run exists because Actions remains disabled; no live provider or
production validation is claimed.

### Current exact-main validation refresh (2026-10-21)

On local `main` SHA `f126dd7c2f0421aa1ccda7f8af5ad4270edb6ff7`, using Node
v24.19.0, the following were rerun after the source-ledger updates:

- `npm run gates:test`: PASS, including 91/91 unit tests, lint, strict typecheck
  (59 canonical test files), privacy, source-integrity, deploy-policy and EOL.
- `npm run test:domain`: PASS, 839/839 across 30 files.
- `npm run test:integration`: PASS, 58/58, zero skips, against disposable local
  PostgreSQL/Redis fixtures.
- `npm run build`: PASS, production Next build and CSP verification (12 inline
  script hashes).
- `npm run test:ui`: PASS on Chromium, Firefox and WebKit, with axe, keyboard
  checks and eight responsive widths. The first invocation failed before page
  tests because the documented production preview on port 5280 was not running;
  after starting that local preview as documented, the rerun exited 0. The
  preview was stopped after the suite.
- `npm run security:check`: PASS; privacy scan clean and zero production
  dependency vulnerabilities.

No hosted GitHub Actions run is available because Actions remains disabled. No
real Resend message, production service, migration, deployment or live acceptance
was performed. Current `main` contains the committed Resend adapter and OTP
routes, but the separate `codex/task/email-otp-auth` worktree still has 54 dirty
paths that have not been integrated. The source inventory mismatch under
`SOURCE-REVISION-01` remains open; these test results do not close it or establish
a 90% product-completion score.

### Main synchronization follow-up (2026-10-21)

Clarified historical baseline rows in `TEST_MATRIX.md` and recorded the latest
local evidence in `blocker.txt`. Commit `4957949d91324ade3a61dc9ed37bfe88736e7826`
was pushed normally to `main`; after fetch, local `HEAD`, `origin/main`, and the
remote ref matched, and the main worktree was clean. Node v24.21.0
`npm run format:check`, `npm run eol:check`, `npm run privacy:check`,
`npm run requirements:check`, `npm run requirements:test` (5/5), and
`git diff --check` passed for the documentation update. Full runtime suites were
last run on its code parent SHA `f126dd7c2f0421aa1ccda7f8af5ad4270edb6ff7`;
this commit changes documentation only. The Actions API still reports disabled
and the exact new commit has no hosted workflow run. The separate OTP worktree
still has 54 uncommitted paths and remains untouched. Live Resend, production
validation, and the broader 90% v12 completion target remain open.

### Approved-source mismatch disposition (2026-10-21)

Reviewed the 22 legacy inventory entries whose exact text does not occur in the
approved v12 R1 snapshot. `SOURCE-RECONCILIATION-2026-10-21.md` now records an
individual disposition for every ID: 5 approved-base replacements, 2 D1
supersessions, 12 items retained until D11-R/A1 approval, 1 owner-decision item,
and 2 external-evidence items. A machine comparison confirmed 22/22 exact ID
coverage with no missing or extra disposition rows. The historical 319-item
inventory and source hash were left unchanged; the complete R1 inventory and
new-clause mapping remain open. No runtime or provider behavior changed.

### OTP distributed IP-limit regression coverage (2026-10-21)

Added integration coverage for the already-implemented Redis-backed OTP
request limit: ten distinct synthetic-email requests from one untrusted peer
are accepted across two API instances, while the eleventh is rejected before
provider delivery. Rotating synthetic `X-Forwarded-For` values do not alter the
untrusted peer identity. The test uses disposable local PostgreSQL/Redis and a
synthetic delivery provider; it does not send email or claim pending A1.2/CR-07
LB8 semantics are approved. `npm run test:integration` passed 59/59 with zero
skips; the focused OTP integration test, `npm run typecheck`, `npm run lint`,
`npm run format:check`, and `git diff --check` passed locally on Node v24.19.0.
This is regression evidence for current code, not proof of hosted Redis,
production proxy trust configuration, or production rate-limit behavior.

### Bounded approved-source authentication traceability (2026-10-21)

Added `docs/requirements/V12-R1-AUTH-TRACEABILITY.md`, a source-block-level
crosswalk for approved D1 and selected §4.1 authentication clauses. It maps
observed API/domain boundaries to currently registered verification, while
distinguishing local implementation, missing behavior, pending/source-conflict
clauses and production/provider evidence. In particular, it does not claim
lost-mailbox recovery, inaccessible-mailbox support, new-device/risk step-up,
progressive lockout backoff, or D11-R as activated. The global 518-block
inventory remains NOT_ASSESSED/NOT_RUN and SOURCE-REVISION-01 remains OPEN; this
vertical slice is partial progress, not a source-to-test completion percentage.

### Monitoring privacy and backup outcome hardening (2026-10-21)

Local operations scripts now avoid logging the configured health URL, remote
health-response bytes, webhook URL prefixes, or a configurable database
container name in monitor diagnostics. The stubbed monitor test injects
synthetic URL/body/webhook credential canaries and verifies they are absent from
stdout, stderr, and the captured webhook payload. `infra/backup.sh` now rejects
non-positive/non-integer retention configuration before touching backup state,
and returns nonzero after recording and alerting a failed dump/restore so the
oneshot systemd service result is visible to scheduler health. The backup test
asserts invalid-config no-mutation and nonzero failure behavior while preserving
the last known-good dump. `infra/check-monitoring.sh` passed; the complete
`infra/check-scheduler-health.sh` fixture passed, including its failed-service
case; Bash syntax checks passed for all four changed scripts. The real
disposable-PostgreSQL `infra/check-backup.sh` exercised dump, restore, invalid
retention and failed-dump behavior, but exited 1 on the two documented Git
Bash/MSYS permission assertions (`0644`/`0755` observed instead of POSIX
`0600`/`0700`); the harness and permission gates were not weakened, and a full
Linux-native run remains unverified. Node v24.19.0 `npm run gates:test` passed
(91/91 unit tests, all source/privacy/deployment/EOL gates, lint and typecheck);
`format:check`, `privacy:check`, `eol:check`, and `git diff --check` passed.
This changes local monitoring/backup behavior only; no live host, scheduled
service, webhook, off-host destination, production data, or deployment was used.

### Performance harness measurement refresh (2026-10-21)

Using Node v24.19.0, `scripts/check-performance.ts` passed against a disposable
local PostgreSQL database. At concurrency 8 over 30 seconds it completed 20,086
authenticated reads (669.5 requests/second), zero failures, p50/p95/p99 of
11.23/17.39/22.85 ms, and RSS from 323,227,648 to 440,623,104 bytes. The four
sequential read routes each passed 60 samples; their p95 values were 6.26 ms
(`/api/searches`), 7.17 ms (`/api/leads`), 4.35 ms (`/api/profile`), and 4.60 ms
(`/api/preparation`). These are local synthetic measurements, not production
latency, Core Web Vitals, or an approved service-level objective. The benchmark
now silences only its in-process synthetic Fastify logger so request-log output
does not contaminate measurement; production logging is unchanged. A first run
on host Node v22 also passed but is not counted as required-runtime evidence.

### Firefox warning investigation update (2026-10-21, Node 24.19.0)

Added opt-in Firefox-only test-harness diagnostics that retain fixed warning
categories, normalized same-origin chunk paths, route epochs and Playwright
request lifecycle metadata, while dropping raw console/error text and URL query
values. Unknown route segments are redacted. Path/time/epoch matches are
candidate correlations only, not causal attribution. Focused helper tests pass
4/4. The production-preview UI run completed successfully in Chromium, Firefox
and WebKit under Node 24.19.0, including axe, keyboard and eight-width responsive
checks. A separate Firefox diagnostic run exited 0 and observed 13
`loading-failed` warning rows for Next chunks; several candidate matches were
non-navigation script requests ending `failed-aborted` within 0–5 ms, one
candidate request completed HTTP 200, and some warning rows had no candidate
request match. Installed Next.js client code cancels pending link-prefetch work
when links unmount, a plausible explanation for some aborts but not proof of
cause for the unmatched/HTTP-200 warnings. No warning was allowlisted and no
product runtime code changed. The root-cause blocker remains open; the next
step is to explain the unmatched/success-response cases, not to rerun the now-
passing three-engine matrix without a code change.

### Firefox warning correlation rerun (2026-10-21, Node 24.19.0)

The first Firefox-only attempt was not counted: the required local production
preview was not running and the browser could not connect. After starting the
documented preview, the full Firefox UI journey passed. The opt-in diagnostic
captured 11 `loading-failed` warning rows: several same-path candidate script
requests ended `failed-aborted`, two had no candidate request event, and one
matching candidate completed HTTP 200. Separate loopback `HEAD` checks for the
four referenced Next chunk assets returned HTTP 200 with JavaScript content
types. These checks do not identify which request emitted a warning or prove
that execution succeeded. No raw warning text was retained, no warning was
allowlisted, and the root-cause blocker remains open.

### Current local service-backed suite refresh (2026-10-21, Node 24.19.0)

`npm run test:integration` passed 59/59 with zero skips; `npm run test:domain`
passed 839/839 across 30 files. `npm run gates:test` passed, including 93/93
unit tests with no skips, source-integrity, privacy, deployment-policy, EOL,
lint and strict typechecking. `npm run build` passed both Next.js production
builds and verified all 13 CSP script hashes. `npm run security:check` passed
with a clean privacy scan and zero production dependency findings; the full
`npm audit --audit-level=high` also found zero findings. The three-engine
`npm run test:ui` rerun passed Chromium, Firefox and WebKit candidate journeys,
axe, keyboard interactions and all eight responsive widths against the local
production preview; the preview was stopped after the run. The integration output included BullMQ's
expected warning during the negative configuration test: that test deliberately
passes the cache Redis endpoint to the queue adapter and asserts rejection.
Read-only `CONFIG GET` checks confirmed the configured cache endpoint is
`allkeys-lru`/AOF-off while the separate queue endpoint is `noeviction`/AOF-on.
This is the intended cache-versus-durable-queue separation, not evidence that
the queue service is misconfigured. No Redis setting was changed.

### Candidate record-isolation evidence refresh (2026-10-22, Node 24.19.0)

Extended the existing isolated PostgreSQL interview/API integration fixture to
exercise cross-candidate profile, saved-lead detail/history, and resume
boundaries. A foreign resume read returns 404; a foreign resume list is empty;
the existing non-enumerating foreign-delete response remains 204 while the
storage delete callback is not invoked and the owner row remains present. These
are synthetic candidate-to-candidate checks; the application-export test also
continues to exclude another candidate's application data. The targeted
integration test passed 1/1, then the complete local integration command passed
59/59 with zero skips on Node 24.19.0. `TEST_MATRIX.md` records the evidence as
PARTIAL only: photos have no implemented domain, and role escalation/recruiter/
admin isolation plus complete route/resource inventory remain unverified, so
critical go/no-go gate 11 remains NOT_VERIFIED. No runtime implementation,
production data, shared database or external service was changed.

The same review corrected stale `TEST_MATRIX.md` entries: APPLY-TEST-01 now
points to the executed three-engine manual-application journey and is still
PARTIAL; DATA-TEST-01 and INTERVIEW-TEST-01 now cite the current 59/59 local
integration run rather than an earlier 58/58 result. The matrix explicitly
keeps hosted, live-provider, human and production evidence outstanding.
