# CareerScope v12 engineering progress

## Activation checkpoint

- Owner approval: OA-2026-10-20-01, dated 20 October 2026.
- Activation: ACTIVE for authorized development only.
- Governance transition: `2a1eb65d67151c485cddd417b6c249146c017a35`, independently
  reviewed, committed and fast-forward integrated into `codex/dev`. Verified
  baseline ancestry and clean worktree before beginning this audit task.
- GOV-01's stale future-facing resolution instructions were corrected on
  20 October 2026 and passed a fresh independent review; the entry now records
  the completed activation prerequisite without clearing separate release gates.
- Existing baseline: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`.
- Development integration: `codex/dev`; current task: production test-access guard.
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

## Dependency-advisory evidence age and execution boundary (2026-10-20)

At `codex/dev` commit `b63780ad0dd005ac879b55587a0163ccd334bfc4`, the lockfile
still contains the recorded Next ESLint plugin → fast-glob → micromatch →
braces 3.0.3 path and Mammoth 1.13.0 → argparse 1.0.10 → sprintf-js 1.0.3.
Static inspection confirmed CareerScope calls Mammoth's `extractRawText` API;
it did not establish that the CLI-only argparse path is reachable through that
API. The official advisories currently list braces through 3.0.3 and
sprintf-js through 1.1.3 as affected, with no patched version published in
those records. This classification does not establish runtime exploitability
or clear the full dependency gate. The last recorded npm audit totals in this
file are historical and were not rerun against this SHA.

No npm audit, install, build, test, or other target-controlled command was run
for this checkpoint. The applicable security-audit execution policy requires an
OS-enforced sandbox with network isolation, allowlisted environment, read-only
source/toolchain, bounded resources, and scratch-only writes; that capability
was unavailable. `AUDIT-01` remains OPEN. No dependency, production code,
configuration, or audit policy was changed.

## Candidate application-evidence gap review (2026-10-20)

At `codex/dev` parent `2081e8120ba7b7e7a4fd354583af14004c9b385f`, performed a
static comparison of approved v12 sections 4.8–4.9 against the current lead
schema/repository, API/OpenAPI routes, Applications UI, migration `0012`, and
the existing database integration test definition. Updated GAP_MATRIX.md,
TEST_MATRIX.md, QUALITY_AUDIT.md and CHANGE_REGISTER.md with exact current
status/history fields and the missing manual application-evidence contract.
The existing integration test covers owner isolation, duplicate saves,
invalid statuses, revision conflict and redacted status/notes history, but not
the complete v12 evidence contract. The independent `source_policy_review`
returned PASS for the documentation claims. `git diff --check` passed. No
runtime/schema/migration change or test execution occurred; the application
tracking requirement remains incomplete and needs an implementation task with
database, API, UI, recovery and browser acceptance.

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

## Application-evidence task checkpoint (2026-10-20)

The documentation-only source review was independently re-reviewed and
checkpointed on `codex/dev` as `e0ee60af6531b112a29101a9f8dbd1f4cc6e2332`.
The four changed matrices/audits distinguish existing partial database coverage
from unverified v12 capabilities; no runtime behavior or tests are claimed.
Fresh independent review PASS and `git diff --check` PASS.

Before implementation, recorded baseline `e0ee60af6531b112a29101a9f8dbd1f4cc6e2332`
on `codex/task/application-evidence`; working tree was clean. Local heads and
tags were inventoried (15 local branches, 0 tags; `origin/main` is present, no
other remote heads). Created and verified
`C:\Users\Admin\Documents\Codex\backups\careerscope-baseline-e0ee60af6531b112a29101a9f8dbd1f4cc6e2332.bundle`;
SHA256 `49448A8C32C08FE314601CF341B73DA6F0956EA54EF9D93823E4BF7BAFBDD28D`.
`git bundle create --all`, `git bundle verify`, mirror recovery clone, target
branch resolution and `git fsck --full` succeeded. The mirror recovery clone is
retained at a temporary local path because the environment rejected the cleanup
operation; this is source recovery only, not database or production backup.

The scoped v12 Stage E implementation adds candidate-reported application
evidence and the `withdrawn` status, with an additive PostgreSQL migration,
owner-scoped API/history integration and a shared Applications/Saved UI flow.
The report is explicitly not employer/ATS verification; opening an external
link remains a no-op on application state.

At this application-evidence checkpoint, before the later OTP and browser
harness edits, validation on Node 24.21.0 in the isolated evidence runner used
synthetic PostgreSQL/Redis and no `.env`: `npm run gates:test` PASS (including
lint, typecheck, privacy, deployment-gate checks, EOL and 49/49 unit tests);
PostgreSQL/Redis integration PASS (49/49); domain suite PASS (30 files, 835
tests); production build and CSP hash verification PASS; browser acceptance
PASS in Chromium, Firefox and WebKit, including axe, keyboard interaction and
the five configured viewport widths; `git diff --check` PASS. This is
historical checkpoint evidence, not the result after subsequent browser-harness
changes. Repository-wide formatting at that checkpoint reported the unchanged
`design/DESIGN-INDEX.json` and the then-edited harness; the harness was formatted
and rechecked, while the design index was left untouched to avoid unrelated
design-artifact churn.

No hosted CI, production deployment, real provider, credential, external job
source or live environment validation is claimed. No `.env` was read. No
commit, push, merge or deployment was performed. Resend OTP and the separately
attached authentication/security/legal follow-up remain deferred until this
active implementation/validation scope is complete and reviewed.

## Local email OTP, consent and readiness implementation (2026-10-20)

This follow-up was implemented in the existing `codex/task/application-evidence`
worktree without touching the separate Desktop checkout, reading `.env`, or
making provider/remote/production changes. It adds a disabled-by-default OTP
contract with HMAC-only challenge persistence, expiry/attempt/cooldown and
single-use controls, shared Redis IP/email throttles, explicit versioned Terms
and Privacy acceptance for registration, separate optional marketing consent,
opaque eight-hour sessions, and public liveness/readiness distinction. The
Resend adapter uses the fixed product sender, HTTPS endpoint, disabled redirects,
bounded request/retry timeouts and stable idempotency; it contains no live
credential. Counsel-only Terms/Privacy drafts are explicitly marked
unapproved/unpublishable. API/data/security/privacy/secret docs and the blocker
register now distinguish local code/tests from launch acceptance.

Fresh local validation on bundled Node 24.19.0: `npm run gates:test` PASS after
the exact product-sender privacy allowlist regression (49/49 unit tests, privacy,
deployment-gate tests, EOL, lint and 49-file typecheck included). `npm run
test:domain` PASS (31 files / 840 tests). Focused OTP PostgreSQL integration
PASS (7 tests) against a disposable PostgreSQL 17.6 container; runtime/rate-limit
tests PASS (5 tests) against disposable Redis 7.4.5 configured for local rate
limit testing. `npm run build` PASS with both CSP discovery/verification passes.
`npm run security:check` exits 0 at its configured high-severity threshold, but
reports 3 moderate production dependency findings in the `mammoth -> argparse ->
sprintf-js` chain; `AUDIT-01` remains open and no downgrade/waiver was made.
Second Drizzle generation produced zero migration drift. After final docs and
test-harness edits, changed-file Prettier, EOL, privacy and `git diff --check`
passed. Repository-wide `npm run format:check` still fails only on the
unchanged `design/DESIGN-INDEX.json`; it was not reformatted to avoid unrelated
design-artifact churn.

The existing browser acceptance harness was attempted in Chromium with a fresh
local production build and disposable PostgreSQL/Redis. The first attempt found
and corrected a stale 503 sign-in assertion to match the API's established
user-facing message. The next run progressed through sign-in, dashboard,
accessibility sampling and resume/profile work, but failed at the pre-existing
preparation 503 mock expectation: the expected mocked alert was not observed
and the API returned HTTP 200. The full browser journey is therefore NOT PASS;
the unrelated fixture/refresh path requires investigation before browser
acceptance is green. This harness does not yet exercise the OTP UI itself.

No independent separate-session review, real Resend call/delivery, sender-domain
or tracking-settings verification, hosted provider acceptance, legal approval,
deployment validation, CI run or production smoke test is claimed. The approved
v12 D11 still requires a second provider fallback; the attached Resend-only scope
does not resolve that conflict, and no fallback adapter was invented. Keep
`AUTH_OTP_ENABLED=false` and `REGISTRATION_ENABLED=false`. `AUTH-01`,
`PROVIDER-01` and `LEGAL-01` remain open; refresh/device recovery requirements,
domain/provider evidence, counsel review, human approvals and live validation
remain incomplete. No commit, push, merge, external configuration change or
deployment was performed.

## OTP/application-evidence validation refresh (2026-10-20)

Supersedes the preceding browser and repository-format conclusions for the
current dirty worktree. No source was read from `.env`; all tests used explicit
synthetic local values. The system Node installation was not changed. The gate
runtime was a temporary official Node v24.21.0 Windows archive whose SHA-256
matched the checksum published by nodejs.org.

Current local validation: `npm run gates:test` PASS (policy/source/privacy/deploy
checks, EOL, lint, typecheck of 49 canonical test files, and unit suite 50/50);
`npm run format:check` PASS; `npm run test:domain` PASS (31 files / 840 tests);
production `npm run build` PASS (both CSP discovery/verification builds, all 12
generated inline-script hashes verified); `npm run test:full-disk` PASS. The
complete registered integration command was run directly without `.env` against
fresh disposable loopback-only PostgreSQL 17.6 and Redis 7.4.5 services: 58/58
tests passed, zero skipped, including database/API, OTP/legal acceptance,
BullMQ/queue, storage and scheduled discovery. Chromium, Firefox and WebKit
production-build browser runs all passed, including the real two-account
selector, session switching, keyboard checks, axe and five-width responsive
acceptance. Integration/browser services were synthetic and have since been
removed.

Additional production-recovery scripts also passed with ephemeral local
services: `scripts/check-database-recovery.ts` (17 tables compared, synthetic
database restore and encrypted file recovery), `scripts/check-queue-runtime.ts`
(Redis AOF restore and publisher/worker process lifecycle),
`scripts/check-crash-recovery.ts` (upload publication, outbox/queue redelivery,
lease fencing and orphan recovery), and `npm run test:full-disk`. Initial
recovery attempts were rejected because the test container name did not satisfy
the harness prefix and because a synthetic queue Redis endpoint was not started;
both were environment-fixture errors, not assertion failures, and the corrected
runs passed. All temporary containers and labelled test volumes were removed.

`npm run security:check` exited 0 under its configured high-severity threshold
and the privacy scanner passed. The audit still reported three moderate
production findings in `mammoth -> argparse -> sprintf-js` (GHSA-hp3w-g68c-fv3c);
the offered forced fix is breaking, so no upgrade, waiver or scan weakening was
made. The current full dependency audit was also run and exits 1 with 5 high and
7 moderate findings; no safe remediation or waiver is claimed. Independent
security review, second-provider fallback, live Resend delivery/domain
acceptance, legal approval, hosted CI, deployment,
and production smoke remain distinct and unproven. Keep OTP and registration
disabled until their required provider/legal gates are met. No commit, push,
merge, deployment, external configuration change, or real message was made.

## OTP browser acceptance refresh (2026-10-20)

Added a synthetic, intercepted OTP browser journey to the existing
`scripts/check-ui.ts` acceptance harness. It covers generic request confirmation,
resend cooldown disablement, invalid-code feedback, paste-style code entry,
blocked submission until required Terms and Privacy acknowledgments, marketing
opt-in defaulting off, no OTP/email persistence in browser storage, and a
same-origin dashboard redirect even when an untrusted `next` parameter is
present. The scenario is registered in the existing `test:ui` command and
exercises the sign-in screen at 320, 390, 768, 1024 and 1440 CSS pixels plus
axe at 320 and 1440. Session and OTP endpoints in this scenario are
Playwright-mocked; no OTP request or registration reaches the backend. It sends
no email and does not establish real OTP/session persistence. Unrelated
post-redirect workspace reads remain against the local synthetic API/database.

Executed under Node 24.21.0 against the current production Next build, a
disposable loopback PostgreSQL 17.6 database, and disposable Redis 7.4.5
instances. The initial harness attempt stopped before browser assertions because
the synthetic queue Redis instance lacked the required AOF setting. Recreated
only the labeled disposable containers with the required `appendonly yes` and
`noeviction` policy; the complete `node --import tsx scripts/check-ui.ts` run
then exited 0 for all selected Chromium, Firefox and WebKit checks. Containers
and the Next process were stopped afterward. Fresh `npm run typecheck`,
`npm run lint`, `npm run format:check`, `npm run eol:check`, `npm run
privacy:check`, and `git diff --check` all passed after this test change.

A fresh read-only independent review passed the scope of the new browser
scenario, `docs/SECURITY.md` and the `AUTH-01` blocker update. The reviewer
explicitly did not execute tests or verify live/provider behavior and returned
NEEDS WORK for production authentication readiness. Remaining blockers are
unchanged: the approved v12 fallback/session/recovery requirements, status-link
decision, sender-domain and real Resend verification, counsel approval, hosted
CI and production acceptance. No `.env` read, real provider call, external
change, commit, push, merge or deployment was made.
