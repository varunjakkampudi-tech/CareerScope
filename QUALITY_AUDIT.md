# CareerScope initial v12 quality audit

21 October integration update: independent auth, application-evidence and
browser-harness reviews passed after fixing signup's disabled-selector capability
check, popup proof, exact 503 text and route/request-settlement assertions.
Current executed local evidence is recorded in
[the consolidation report](docs/MAIN-CONSOLIDATION-2026-10-21.md). The historical
dependency finding below was remediated after the baseline and is not the current
audit result; see the dated dependency follow-up at the end of this report. This
update does not replace the baseline audit or certify the full v12 scope.

Baseline runtime: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`.
Governance: `2a1eb65d67151c485cddd417b6c249146c017a35`.
Scope: initial source/governance/contract assessment, not final certification.
Baseline tracked census: 779; complete manual line-by-line review is NOT PROVEN.
No fabricated review count or percentage is assigned.

| Category                 | Scope / evidence                                                                                                                                                                                                                                            | Result                                                  | Remaining work                                                                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authority/Git            | Owner approval and governance commit independently reviewed; main unchanged                                                                                                                                                                                 | PASS for activation only                                | Main protections/hosted settings owner-controlled                                                                                                                                                                                                                               |
| Type/lint/format/EOL     | Baseline `gates:test` includes lint, 45-file test typecheck, EOL                                                                                                                                                                                            | PASS local                                              | Full unused/complexity/duplication/cycle inventory not established                                                                                                                                                                                                              |
| Unit/privacy             | 42 unit + 4 Node policy + 3 privacy tests, scan                                                                                                                                                                                                             | PASS local                                              | Full v12 leakage/coverage/mutation/role requirements not certified                                                                                                                                                                                                              |
| Dependencies             | Baseline audit recorded 5 high/7 moderate; exact current main audit reports 0 vulnerabilities                                                                                                                                                               | PASS local lockfile audit                               | Re-run after lockfile changes; hosted supply-chain workflow remains unverified                                                                                                                                                                                                  |
| Auth/security            | Opaque rotating sessions, OTP challenge/delivery path, device-session controls, ownership and fail-closed production/test guards                                                                                                                            | FAIL v12 contract                                       | Fallback provider, recovery/email change, new-device alerts, unusual-pattern step-up, production staff MFA, hosted/provider/legal acceptance and remaining adversarial tests                                                                                                    |
| Source rights            | Runtime feeds differ from D14; inactive portal adapters remain library code                                                                                                                                                                                 | BLOCKED acceptance                                      | Permissions/default policy/golden set; no source network traffic authorized                                                                                                                                                                                                     |
| Database/storage         | Isolated PostgreSQL restore executed with synthetic data; 21 table fingerprints and encrypted file/parsed-result recovery matched; queue, crash, and full-disk checks also executed locally                                                                 | PARTIAL local execution                                 | Full schemas/migrations/query plans, exhaustive deletion/recovery audit, off-host/WAL disaster recovery, hosted restore and production evidence remain open                                                                                                                     |
| Browser/CR-01            | On code SHA `7bc55ef6d75db17261b1a773a26b1b9d4dd0b95d`, real Playwright/axe journeys fail on uncaught page exceptions, crashes, unhandled promise rejections and unexpected console errors; deliberate HTTP failures match exact fixture route/status pairs | PARTIAL local coverage; Node 24 three-engine run passed | Console-warning classification (an experimental Firefox assertion observed unclassified warnings and was not retained), critical network-error policy, development-build coverage, broader leakage negative controls, hosted browser CI, and human acceptance remain unverified |
| Accessibility/responsive | Existing candidate UI/design foundations                                                                                                                                                                                                                    | NOT_ASSESSED current v12                                | Full eight-width/three-locale/manual screen-reader/device/zoom checks                                                                                                                                                                                                           |
| Localization             | Root en and embedded copy                                                                                                                                                                                                                                   | FAIL v12 implementation                                 | Keyed English/Telugu/Hindi, long strings, native-speaker review                                                                                                                                                                                                                 |
| SEO                      | Private workspace noindex observed                                                                                                                                                                                                                          | PASS narrow private intent; public scope incomplete     | Rights-gated public jobs, language/canonical/sitemap/expiry/structured data                                                                                                                                                                                                     |
| Performance              | Synthetic local API performance script measured against loopback PostgreSQL with 40 synthetic leads and eight concurrent readers                                                                                                                            | LOCAL REGRESSION MEASUREMENT                            | No production SLO or production-profile evidence; frontend LCP/INP/CLS, hosted queue latency, CPU/RSS trend and long-duration soak remain open                                                                                                                                  |
| Reliability/DR           | Synthetic isolated database restore, Redis queue restart/AOF, crash recovery, full-disk, and 124-second mixed-load soak executed locally; this does not validate off-host disaster recovery                                                                 | PARTIAL local execution; release blocked                | D12 owner reconciliation, off-host WAL/copies, production-profile restore/rollback/failure drills, and hosted/runtime recovery evidence remain open                                                                                                                             |
| Admin/audit/analytics    | No full v12 control plane identified                                                                                                                                                                                                                        | NOT_ASSESSED implementation                             | Role/step-up/dual approval/audit/incident/private metric design and tests                                                                                                                                                                                                       |
| Privacy/legal            | Existing privacy controls, no counsel assertion                                                                                                                                                                                                             | BLOCKED acceptance                                      | Data inventory/retention/deletion/processor/consent/DPDP counsel review                                                                                                                                                                                                         |
| CI                       | Read-only CI workflow is tracked and pinned; GitHub Actions API reports `enabled=false`, exact-SHA queries return no hosted runs                                                                                                                            | BLOCKED hosted acceptance                               | Owner enables Actions and approves budget; then verify real exact-SHA triggers, failure/negative controls, and artifacts                                                                                                                                                        |
| Deployment               | No deployment performed                                                                                                                                                                                                                                     | NOT_RUN                                                 | Separate staging prerequisites; production remains owner-only                                                                                                                                                                                                                   |

Known findings are not closed by documentation. Fix/retest/independent-review
evidence must replace these initial observations. This report does not claim
global-category completion, legal compliance, WCAG certification or launch GO.

## CI implementation follow-up (2026-10-20)

The initial CI row above is preserved as a baseline finding. A SHA-pinned,
least-privilege CI-only workflow has since been authored at
`.github/workflows/ci.yml`; local workflow-policy fixtures, Node 24 gates, and
format/EOL/privacy checks pass. It has not run on GitHub because Actions is
disabled. At the time of this 20 October entry, full `npm audit --audit-level=high`
failed on development dependency advisories; the later dependency remediation
below supersedes that result. No staging or production workflow was added. Hosted
trigger/failure/coverage/artifact acceptance remains NOT VERIFIED; see GOV-02
in `blocker.txt` and `docs/runbooks/ci-cd.md`.

## Authentication and design-source follow-up (2026-10-20)

Read-only source review on `codex/dev` at
`7d55fcee685c8fe59c3e07643f1180552f7ec223` confirmed the approved v12 auth gap:
the API currently exposes the legacy password/test-access login path, while no
OTP challenge, Resend sender, fallback provider, refresh-token family, or device
revocation implementation was found. The active authentication design-index
entries also contained stale Cognito-specific evidence. Those two descriptions
are corrected; their approved visual references remain unchanged.

The schema still declares `users.externalSubject`, added by historical migration
`0017_cognito_external_subject`; `0018_cognito_phone_identity` separately adds
the phone identity column. Repository search found no non-schema runtime
read/write of `externalSubject`.
The migrations are retained as immutable history; removing an unused active
schema declaration or dropping persisted data is a separate reviewed database
change and has not been performed. AUTH-01 remains open; no OTP or provider
behavior is claimed as implemented by this source-document correction.

### Legacy identity schema follow-up (2026-10-20)

The active schema declaration has now been removed in a new forward migration,
`0019_remove_legacy_external_identity.sql`; migrations 0017 and 0018 remain
unchanged. Migration 0019 takes an exclusive lock and refuses to drop the
columns if any stored row has a non-null external subject or phone. The
synthetic integration test verified both fail-closed preservation and successful
removal after the fixture's explicit cleanup. No real/shared database was
queried or changed. The historical finding is therefore RESOLVED for source
schema alignment, but production application remains unverified and requires a
reviewed legacy-data disposition before migration if populated records exist.
OTP, provider delivery, session-family/device controls and account recovery
remain outside this change and AUTH-01 remains open.

### Resend OTP integration follow-up (2026-10-20)

The prior auth findings above remain as historical baseline evidence; the OTP
implementation status has changed. The local development branch now wires the
existing Resend adapter, PostgreSQL challenge store, Redis abuse controls,
existing-user-only session creation and OTP UI. Local Node 24 integration,
unit, domain, typecheck, lint, formatting, privacy and production-build checks
passed as recorded in `PROGRESS.md` and `TEST_MATRIX.md`. The OTP feature is
not production accepted: no live provider request, domain verification,
open/click tracking review, real mailbox receipt, fallback provider, shared DB
migration, hosted CI or deployment was performed. The full browser command
remains incomplete because the existing request-settle guard failed on the
`/applications` route. Follow-up targeted Node 24 Firefox completed with exit
code 0; targeted WebKit reached its end-of-suite/axe markers, but the final
process exit code was unavailable. The focused Chromium run reached its success
markers; none of these clears the failed full-suite gate.

The local security posture is materially improved by making legacy password
login an explicit `testHarnessPasswordLogin` option used only by test fixtures;
runtime/OTP application composition does not enable it. Challenges store
keyed digests, provider errors are sanitized, and missing Redis fails closed.
Residual review items include v12 recovery, risk-based step-up, staff MFA and
the current npm audit advisory path. No dependency advisory was waived and no
security control or assertion was disabled.

### Authentication capability reconciliation (2026-10-20)

The table and preceding follow-up contain earlier point-in-time assessments;
they are not current proof that refresh/device controls are absent. Current
`packages/core/src/auth.ts`, `/api/session/refresh`, `/api/account/sessions`,
and `/api/account/sessions/revoke-others` implement rotating opaque refresh
credentials, consumed-token family revocation, owner-scoped session inventory
and revocation. Password change revokes that owner's sessions. The 20 October
Node 24 service-backed rerun passed 55/55 integration tests against the
existing loopback PostgreSQL 17.6/Redis 7.4.5 services with per-test database
names and synthetic OTP delivery. This does not cover real provider delivery
or hosted runtime acceptance.

Still absent locally are recovery without a second verified identity signal,
dual-address email change, login alerts for new devices, unusual-pattern
step-up, and production staff/admin MFA. A provider-neutral interface is not a
fallback provider. These are current implementation gaps, distinct from the
external provider, legal, hosted migration and production-acceptance gates.

The full serial integration run also found and corrected a runtime session
query that still selected the retired `users.phone` column. `/api/session` now
returns only the owner email for that identity presentation; candidate profile
phone data remains a distinct profile field. The regression suite asserts the
authentication session does not expose a phone identity. Current service-backed
integration exited successfully on disposable local services; this does not
verify a shared or production migration.

### Local auth hardening follow-up (2026-10-20)

RESOLVED (source/local tests): Redis-backed rate-limit exceptions from regular
API routes now return a stable 503 without proceeding to route side effects or
exposing the limiter key/error. OTP routes retain their dedicated fail-closed
503 handling. Runtime documentation includes the shared-dependency response,
and unit/integration tests cover this contract. Latest local validation:
`npm run gates:test` PASS, integration PASS 54/54, build PASS, format PASS,
security command exit 0 with unresolved moderate `sprintf-js` audit findings.

OPEN (release evidence): no real Resend send/domain/tracking/inbox acceptance,
second provider, counsel approval, production configuration, hosted CI, shared
migration or deployment was performed. The Chromium browser command emitted
success markers for its scenarios but no exit status was captured; it is not
counted as a PASS. The all-engine browser gate remains incomplete.

### Readiness and browser rerun correction (2026-10-20)

The earlier browser report is preserved as history. A fresh Chromium-only rerun
on the current worktree exited 0 and passed its configured flows. The prior
`ECONNRESET` at the test's `/api/session` proxy fetch was not reproduced; its
cause is unknown and is not claimed fixed. No fresh full Firefox/Chromium/WebKit
matrix was run during this pass.

Source review found `/api/health` checked PostgreSQL but not Redis, although Redis
is required for shared abuse controls. Production app composition now awaits
Redis `PING` alongside `SELECT 1`; dependency failures return a sanitized 503.
Four focused tests pass. This resolves the local readiness gap; no hosted
readiness/monitoring result is implied. Current integration passed 54/54, the
canonical gate passed with 69 unit tests, and build, formatting, lint, typecheck,
EOL and diff checks passed. Dependency audit still reports three moderate
transitive `sprintf-js` advisories.

### OTP/security validation refresh (2026-10-20)

The latest exact local browser run completed with exit 0 on Chromium, Firefox,
and WebKit, including axe and five responsive widths; prior incomplete browser
attempts remain historical and are superseded for the local browser gate only.
Current full local verification passed: 73 unit tests in `gates:test`, 55/55
service-backed integration tests, 835 domain tests, build/CSP, lint, strict
typecheck, formatting, EOL, privacy, and diff checks. OTP request and verify
return safe 503 responses on simulated shared-limiter failure; separate Redis
clients share the same limiter keyspace. The session-row identifier was removed
from refresh-reuse logs and is covered by structured logger redaction.

At the time of this 20 October entry, the full dependency audit remained OPEN:
5 high and 7 moderate findings across the graph, with 3 moderate production
findings. This is historical evidence and is superseded by the 21 October
remediation and the current exact-main audit recorded below. No Resend request,
domain verification, public policy approval, hosted CI, shared migration, or
production validation occurred in that earlier run.

### Dependency audit reconciliation (2026-10-21, current main)

The earlier 5-high/7-moderate result is retained above as an accurate historical
finding, not a current blocker. At `d96ece59ad30df8c8eb3397c344f7761949c6815`,
Node v24.19.0 with the repository lockfile, `npm audit --audit-level=low` exited
0 and reported `found 0 vulnerabilities`. The audited dependency tree was not
modified during this check. The exact remediation and regression evidence are
recorded in `PROGRESS.md` and `blocker.txt` under AUDIT-01. This local registry
audit does not establish hosted CI, future dependency safety, or production
readiness; rerun after any lockfile change.

### Current-worktree email-change browser result (2026-10-20, Node 24.19.0)

This later result supersedes earlier local browser PASS entries for the current
worktree only. The added mocked account-email-change flow passed in Chromium and
Firefox, including its axe and responsive checks. The complete
`CAREERSCOPE_UI_BROWSER=all` command then exited 1 during Firefox at the
existing `settled('dashboard')` request-quiescence gate after repeated
successful `GET /api/leads` activity; WebKit did not run. The application cause
is not yet established, and the settlement assertion has not been weakened.
The current complete cross-browser gate is FAIL/INCOMPLETE. The earlier
Chromium/Firefox/WebKit run remains valid only for the earlier source state.

### OTP expiry-boundary and outage-message review (2026-10-20)

Two locally actionable defects were corrected on the uncommitted
`codex/task/email-otp-auth` tree. First, challenge expiration was checked using
a timestamp sampled before `SELECT ... FOR UPDATE`; lock contention could
allow evaluation with a stale time. The clock is now sampled after the row lock,
and a deterministic regression advances the injected clock when the mock
acquires the lock, asserting `expired` at the exact boundary. Second, the web
client discarded the safe 503 response body and had no status-specific message,
so OTP outages appeared as a generic failure. It now presents the v12
"sign-in is temporarily unavailable" state for OTP calls without exposing
server details; other 503 responses receive a generic service-unavailable
message. Client tests cover both cases.

Current local validation on Node 24.19.0: unit 76/76, service integration
55/55 with no skips, full typecheck, build/CSP, lint, formatting, EOL, privacy
tests/scanner and diff check all pass. The integration attempt without process
service endpoints failed its explicit REDIS_URL/QUEUE_REDIS_URL guards; the
successful rerun used two temporary isolated Redis 7.4.5 services and the
loopback PostgreSQL 17.6 service with disposable per-test databases. This is
not hosted CI, live-provider, independent-security-review, or production
evidence. The current full browser matrix remains incomplete because the latest
all-browser command failed in Firefox at dashboard request quiescence; WebKit
was not reached. The full dependency audit remains open (five high and seven
moderate across the full graph; three moderate production findings). No test
was weakened and no waiver was applied.

### Matching eligibility visibility correction (2026-10-21)

Resolved a concrete v12 section 4.7 contradiction: `apps/workers/search/src/collect.ts`
previously discarded collected listings with a hard-eligibility reason. The
worker now keeps those listings and returns a zero score plus the deterministic
reason, matching the approved rule that hard eligibility is advice, not a
discovery filter. Regression evidence covers excluded employment type and
keyword listings. Scoring/ranking weights and source-permission gates were not
changed. Local verification on Node 24.19.0: collection tests 19/19, root gates
84/84, domain 836/836, service-backed integration 57/57 with zero skips,
production build/CSP, lint, formatting, EOL and privacy checks passed. Hosted CI,
rights-cleared source collection, golden-set quality and release acceptance
remain unverified.

### Matching version provenance follow-up (2026-10-21)

Resolved one concrete part of approved v12 section 4.7: new deterministic score
breakdowns now identify `deterministic-v1`, including gated listings. Legacy
breakdowns without the field remain explicitly unknown (`null`) during strict
parsing. The API contract documents this compatibility rule. The change does
not alter score calculation or prove the separate golden-set, hard-eligibility,
or missing-data acceptance requirements; those remain open in `GAP_MATRIX.md`.
Validation: score tests 30/30, domain 836/836, root gate 84/84, integration
57/57 (zero skips) using disposable local services, production build/CSP,
lint, formatting and privacy check passed on Node 24.19.0. Hosted Actions is
disabled; no hosted or production evidence was obtained.
