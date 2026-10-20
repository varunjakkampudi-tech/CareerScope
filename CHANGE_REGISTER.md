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
