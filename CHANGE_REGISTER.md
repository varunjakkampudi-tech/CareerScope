# Change and rollback register

| Integration / task                          | Scope                                                                                                                                                                                             | Evidence                                                                                                                                                                                           | Risk / migrations                                                     | Recovery                                                                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2a1eb65d67151c485cddd417b6c249146c017a35`  | OA-2026-10-20-01 governance/source register and thin AGENTS entry point                                                                                                                           | Independent governance_review APPROVE; format/privacy/EOL/diff checks; baseline gate suite                                                                                                         | Documentation/policy only; no schema/runtime/settings/provider change | Retain commit/history; if correction needed, apply a new reviewed governance commit, never rewrite history or silently revoke owner approval                                                                    |
| Current GOV-01 closure wording correction   | Replace stale future-facing resolution steps with completed-state evidence; preserve distinct owner/provider/hosted/production gates                                                              | Fresh independent governance review PASS; `git diff --check` PASS                                                                                                                                  | Documentation only; no runtime/schema/provider/configuration change   | Apply a reviewed corrective commit if needed; preserve the original owner-approval and transition commits                                                                                                       |
| Current AUDIT-01 evidence-age correction    | Distinguish last recorded npm audit results from current evidence; record current lockfile paths, advisory links, unresolved reachability and sandbox limitation                                  | Fresh independent source-policy review PASS; `git diff --check` PASS; no audit/build/test executed                                                                                                 | Documentation only; no dependency/runtime/configuration change        | Apply a corrective documentation commit; keep AUDIT-01 open until an exact-SHA audit and required validation are performed                                                                                      |
| Current application-evidence review         | Document v12 manual-application gap against current lead/status/history contract; update matrices                                                                                                 | Independent review PASS; source inspection; diff check PASS; no tests run                                                                                                                          | Docs/audit only; no runtime/schema/migration change                   | Follow with scoped implementation, migration review, tests and exact-SHA validation                                                                                                                             |
| Current application-evidence implementation | Add candidate-reported application evidence, withdrawn lifecycle status, owner/revision-protected update and history, archive/restore preservation, API contract and shared Applications/Saved UI | Local synthetic PostgreSQL/Redis integration 58/58; production-build browser acceptance passed on Chromium/Firefox/WebKit with axe, keyboard and responsive checks; see dated PROGRESS.md evidence | Additive migrations `0019`–`0021`; no deployment or hosted migration  | Obtain independent review; validate migration against an isolated staging copy and rollback/recovery procedure; complete remaining v12 application capabilities and exact-SHA/owner acceptance before promotion |
| Current baseline-audit task                 | Approved source snapshots, initial gap/test/quality inventories and activation evidence                                                                                                           | Independent baseline_audit_review APPROVE; source-integrity 4/4; format and diff checks                                                                                                            | No runtime/schema change; source snapshots immutable                  | New corrective commit; preserve approval hashes and disclose Goal LF, hard-break and final-newline normalization                                                                                                |

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
