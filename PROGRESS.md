# CareerScope v12 engineering progress

## Activation checkpoint

- Owner approval: OA-2026-10-20-01, dated 20 October 2026.
- Activation: ACTIVE for authorized development only.
- Governance transition: `2a1eb65d67151c485cddd417b6c249146c017a35`, independently
  reviewed, committed and fast-forward integrated into `codex/dev`. Verified
  baseline ancestry and clean worktree before beginning this audit task.
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
