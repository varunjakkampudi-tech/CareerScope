# CareerScope v12 engineering progress

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
