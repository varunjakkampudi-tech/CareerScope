# Main consolidation — 21 October 2026

The owner explicitly directed a local merge and normal direct push to main.
OA-2026-10-21-01 records this superseding synchronization authority. Main before
integration: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`. The integration commit
containing this report supplies the resulting revision without a self-referential
commit hash. This is a development checkpoint, not launch certification.

## Inventory and preservation

Audited main, codex/dev, and these task branches: application-evidence,
application-evidence-audit, auth-audit-wording, auth-production-test-guard,
auth-source-truth-docs, ci-without-deployment-gate, ci-workflows,
critical-path-audit, dependency-audit-evidence-age, email-otp-auth,
governance-activation, governance-activation-reconcile, source-permission-policy,
and v12-baseline-audit. Only main existed remotely. The stash was empty and no
cherry-pick was active. No unreachable commits were found. The historical
initial-snapshot archive tag is retained and is not republished by a main push.

Five registered worktrees were inspected: two dirty development worktrees and
three clean historical/review worktrees. Dirty source states were preserved
without switching their branches, changing their indexes or terminating their
processes. A separate detached integration worktree resolves the overlap. No
additional permanent development branch is required.

An external all-ref bundle was restored into a mirror, checked with strict fsck,
and compared against every original ref. Bundle SHA256:
`08FE664B7BE64DB3C8988E5912CFAB53AD6873B32E9E993C07EC54CA20D92F77`.
Tracked binary patches and untracked-file archives preserve both dirty states;
private paths and ignored runtime configuration are excluded from this report.
Source snapshots are retained as integration parents, preserving both histories.

## Conflict resolution

- Retained the newer OTP implementation, refresh/session reuse controls,
  dual-address email change, legal acceptance records and account-security UI.
  The older OtpAuth/Resend implementation and its unpublished schema variant
  are superseded, with their original source preserved in the merge ancestry.
- Integrated candidate-reported application evidence, withdrawn status,
  revision/history/ownership checks, saved-job UI, OpenAPI and database/browser
  coverage. Opening an external destination never records Applied.
- Generated `0026_application_evidence.sql` after canonical migrations 0019–0025.
  Earlier conflicting unpublished migration numbers are not reused. No migration
  was applied to a shared or production database.
- Retained one marketing-consent implementation in account security using the
  canonical account_acceptances table. The separate older component/table/route
  variant is superseded. The canonical health/readiness route remains /api/health.
- Preserved the email-verification timestamp in the owner session contract;
  test-account selection does not manufacture verified-mailbox evidence.
- Incorporated the prior isolated candidate's CI policy and browser settlement
  fixes. Its design-index formatting is already equivalent to the auth branch's
  formatting commit and is not duplicated.

## Independent review findings

Independent read-only reviewers examined auth, application evidence/migrations,
and browser-test changes. Review found and corrected the production signup gate:
an explicit disabled test-selector object must allow separately configured OTP
signup. Integration tests now use that executable composition and assert signup
availability without exposing test accounts. Review also required proof that the
external posting popup actually opens the intercepted synthetic destination;
the browser test now awaits and checks that popup before asserting unchanged
application status. Both reviewers rechecked the corrections and returned PASS.
Application-evidence source review returned PASS with no blocking finding.

Browser integration also exposed assertions using the superseded generic 503
message and a page-idle barrier retaining requests from an unmounted Saved view.
Assertions now require the exact current 503 text. A registered unit test proves
that settlement excludes only old-route saved reads, retaining current reads,
all mutations and unrelated/search requests. Cancellation separately verifies
the exact submitted run in refreshed detail/list responses, rendered state,
database persistence and a full reload. Independent review approved these
changes; unrelated selected-run traffic is not treated as cancellation evidence.

## Executed local checks

Environment: Windows, Node 24.19.0, isolated PostgreSQL 17.6 and Redis 7.4.5.
Private raw logs and fixture artifacts remain outside Git.

| Command                                                                                                                         | Result                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run gates:test                                                                                                              | PASS; 77 unit tests; 55 canonical test files typechecked; lint, policy, EOL and privacy gates included                                                                                      |
| npm run test:integration                                                                                                        | PASS; 55 tests, zero skips, after correcting isolated Redis persistence configuration                                                                                                       |
| npm run test:domain                                                                                                             | PASS; 835 tests across 30 files                                                                                                                                                             |
| npm run build                                                                                                                   | PASS; both Next builds and 12 inline-script CSP hashes verified                                                                                                                             |
| npm run format:check                                                                                                            | PASS                                                                                                                                                                                        |
| npm run security:check                                                                                                          | PASS at the unchanged production high-severity threshold; three moderate parser-chain entries remain                                                                                        |
| npm audit --json                                                                                                                | FAIL; five high development-tool and seven moderate package entries, disclosed rather than waived                                                                                           |
| npm exec -- drizzle-kit generate --name=verify_no_drift                                                                         | PASS; no schema changes and no extra migration generated                                                                                                                                    |
| node --env-file=.env --import tsx --test --test-concurrency=1 scripts/check-queue-runtime.ts scripts/check-database-recovery.ts | PASS; 2 tests, 18 tables and encrypted object recovery compared                                                                                                                             |
| node infra/check-full-disk.mjs                                                                                                  | PASS; typed capacity failures, no stranded temporaries, reservations released                                                                                                               |
| node --env-file=.env --import tsx scripts/check-crash-recovery.ts                                                               | PASS; all four crash boundaries converged                                                                                                                                                   |
| CAREERSCOPE_UI_BROWSER=all npm run test:ui                                                                                      | PASS; uninterrupted Chromium/Firefox/WebKit journeys plus all three real selector/session/keyboard/reflow/axe journeys                                                                      |
| npm run test:performance                                                                                                        | PASS; synthetic local 30-second run, concurrency 8, 13,923 requests, zero failures; 464.1 requests/second; p95 26.74 ms and p99 41.55 ms. Not a production SLO or long-duration soak result |
| git diff --check                                                                                                                | PASS                                                                                                                                                                                        |

## Remaining evidence limits

All service fixtures are synthetic and isolated, using PostgreSQL 17.6 and Redis
7.4.5. The first integration attempt failed because the temporary Redis fixtures
lacked AOF. After configuring the required AOF/noeviction policy on only those
disposable services, integration passed 55/55 with no skips. This was fixture
correction, not a retry policy or relaxed test.

GitHub Actions remains disabled; there is no hosted run ID or hosted CI pass.
The canonical production-dependency security command and full dependency audit
must be reported separately: the full audit has known development-tool advisories
and moderate parser-chain advisories. No audit threshold is lowered. The npm
registry has no newer braces or sprintf-js release resolving those advisories at
this checkpoint. Production acceptance and the broader v12 provider, legal,
fallback, infrastructure and human-validation gates remain open in blocker.txt.
No real email/provider request, deployment or repository-settings change occurs.

Final independent review confirmed that the full-tree high-severity audit would
fail the new CI checks job when Actions is enabled. This remains a mandatory
integration blocker under the engineering contract, not a waived warning. Main
must not be updated until remediation or a specific owner exception is recorded.
Direct-push authorization alone is not a security exception. The source-permission
fallback wording was corrected: candidate-supplied links are a future alternative,
not an implemented fallback. The reviewed source integrations are preserved in a
local checkpoint while this gate remains open.

Recovery from a source integration defect uses a reviewed corrective commit or
the verified external recovery copy. Never reset published main or drop migrated
personal data. Any schema issue requires an additive forward migration; this
checkpoint does not authorize applying or rolling back shared database changes.
