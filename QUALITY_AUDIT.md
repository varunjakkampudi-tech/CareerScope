# CareerScope initial v12 quality audit

Baseline runtime: `45d6d35691bd5d41257da4f3988acd9a89c7d2ea`.
Governance: `2a1eb65d67151c485cddd417b6c249146c017a35`.
Scope: initial source/governance/contract assessment, not final certification.
Baseline tracked census: 779; complete manual line-by-line review is NOT PROVEN.
No fabricated review count or percentage is assigned.

| Category                 | Scope / evidence                                                                                  | Result                                              | Remaining work                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Authority/Git            | Owner approval and governance commit independently reviewed; main unchanged                       | PASS for activation only                            | Main protections/hosted settings owner-controlled                                                          |
| Type/lint/format/EOL     | Baseline `gates:test` includes lint, 45-file test typecheck, EOL                                  | PASS local                                          | Full unused/complexity/duplication/cycle inventory not established                                         |
| Unit/privacy             | 42 unit + 4 Node policy + 3 privacy tests, scan                                                   | PASS local                                          | Full v12 leakage/coverage/mutation/role requirements not certified                                         |
| Dependencies             | Current full audit 5 high/7 moderate; production 3 moderate                                       | FAIL                                                | Determine compatible safe remediation and actual reachability; no waiver inferred                          |
| Auth/security            | Opaque owned sessions and private selector observed; production selector now fails closed locally | FAIL v12 contract                                   | Hosted guard acceptance; primary/fallback OTP, refresh/device/recovery/MFA and adversarial tests           |
| Source rights            | Runtime feeds differ from D14; inactive portal adapters remain library code                       | BLOCKED acceptance                                  | Permissions/default policy/golden set; no source network traffic authorized                                |
| Database/storage         | Existing constraints/outbox/encrypted files and recovery tests inspected                          | NOT_ASSESSED execution                              | Full schemas/migrations/query plans/service-backed v12 and deletion/recovery audit                         |
| Browser/CR-01            | Existing real Playwright/axe harness; partial pageerror handling                                  | NOT_ASSESSED / gap                                  | Console/warning/rejection/critical network allowlists, dev+production builds and leakage negative controls |
| Accessibility/responsive | Existing candidate UI/design foundations                                                          | NOT_ASSESSED current v12                            | Full eight-width/three-locale/manual screen-reader/device/zoom checks                                      |
| Localization             | Root en and embedded copy                                                                         | FAIL v12 implementation                             | Keyed English/Telugu/Hindi, long strings, native-speaker review                                            |
| SEO                      | Private workspace noindex observed                                                                | PASS narrow private intent; public scope incomplete | Rights-gated public jobs, language/canonical/sitemap/expiry/structured data                                |
| Performance              | Existing scripts, no new measured output                                                          | NOT_RUN                                             | Approved thresholds, actual LCP/INP/CLS/API/queue/load/soak evidence                                       |
| Reliability/DR           | Local dump verification source only                                                               | BLOCKED release evidence                            | D12 decision, off-host WAL/copies, fresh isolated restore/rollback/failure drills                          |
| Admin/audit/analytics    | No full v12 control plane identified                                                              | NOT_ASSESSED implementation                         | Role/step-up/dual approval/audit/incident/private metric design and tests                                  |
| Privacy/legal            | Existing privacy controls, no counsel assertion                                                   | BLOCKED acceptance                                  | Data inventory/retention/deletion/processor/consent/DPDP counsel review                                    |
| CI                       | No tracked workflows; current settings queried read-only                                          | BLOCKED hosted acceptance                           | Safe dev workflows, owner settings/budget and real trigger/negative-control evidence                       |
| Deployment               | No deployment performed                                                                           | NOT_RUN                                             | Separate staging prerequisites; production remains owner-only                                              |

Known findings are not closed by documentation. Fix/retest/independent-review
evidence must replace these initial observations. This report does not claim
global-category completion, legal compliance, WCAG certification or launch GO.

## CI implementation follow-up (2026-10-20)

The initial CI row above is preserved as a baseline finding. A SHA-pinned,
least-privilege CI-only workflow has since been authored at
`.github/workflows/ci.yml`; local workflow-policy fixtures, Node 24 gates, and
format/EOL/privacy checks pass. It has not run on GitHub because Actions is
disabled. Full `npm audit --audit-level=high` is intentionally a blocking
workflow step and currently fails on unaccepted high-severity development
dependency advisories. No staging or production workflow was added. Hosted
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

## OTP/application-evidence local implementation and validation (2026-10-20)

The earlier read-only authentication finding above is preserved as a baseline
observation and is superseded for current source state by the implementation
record in `PROGRESS.md`. Current code has disabled-by-default, digest-only OTP
challenge persistence, bounded attempts/cooldown/expiry, shared Redis limiting,
legal acceptance, explicit verification timestamp, and a bounded mocked Resend
adapter. Fresh local Node 24 validation passed gates (including 50 unit tests),
domain (31 files/840 tests), full PostgreSQL/Redis integration (58/58), fresh
PostgreSQL restore (17 tables compared), Redis AOF queue restart, crash recovery,
full-disk behavior, production build with both CSP hash passes, and production-browser acceptance in
Chromium/Firefox/WebKit with axe and responsive/keyboard checks. These results
do not close production authentication: second-provider failover, refresh/device
revocation and recovery flows remain incomplete; real delivery and domain
acceptance, counsel review, and production validation remain owner/external
gates. The current production-only audit reports three moderate
`mammoth -> argparse -> sprintf-js` findings. No finding was suppressed or
waived; see `blocker.txt`.

## Candidate application-evidence contract review (2026-10-20)

Static source review at `codex/dev` commit
`2081e8120ba7b7e7a4fd354583af14004c9b385f` compared v12 sections 4.8–4.9 with
`packages/core/src/leads.ts`, `packages/core/src/schema.ts`, lead routes and
OpenAPI in `apps/api/src/app.ts` and `apps/api/src/openapi.ts`, the Applications
route and shared UI in `apps/web/src/app/(app)/applications/page.tsx` and
`apps/web/src/components/saved-leads.tsx`, and migration `0012`.

Observed behavior: leads are candidate-owned saved-job records with notes,
revision, current status and liveness fields. The accepted status enum is
`saved`, `applied`, `interviewing`, `offer`, `rejected`, and `archived`. Updates
use the owner from the authenticated request, a row lock and revision check;
history records status, whether notes changed, and timestamp. The Applications
route filters the same records to `applied`, `interviewing`, `offer`, and
`rejected`. Application destinations are external anchors; the inspected UI has
no link-open mutation that marks a record applied. These are source observations,
not a test run in this checkpoint.

The approved v12 contract requires manual application evidence including method,
timestamp, confirmation, source and confidence, and keeps candidate claims
separate from employer/ATS acknowledgements. The inspected schema/API do not
represent those fields or a separate acknowledgement record. The current enum
also lacks `withdrawn`; the v12 `interview` term has not yet been mapped and
accepted against existing `interviewing` semantics. Application-specific
contacts/documents/reminders, duplicate-application warning, and CSV/PDF export
were not proven during this focused review. These are concrete local
implementation gaps, not a basis to infer external ATS capability or fabricate
application events.

## OTP/application-evidence local implementation and validation (2026-10-20)

The earlier read-only authentication finding above is preserved as a baseline
observation and is superseded for current source state by the implementation
record in `PROGRESS.md`. Current code has disabled-by-default, digest-only OTP
challenge persistence, bounded attempts/cooldown/expiry, shared Redis limiting,
legal acceptance, explicit verification timestamp, and a bounded mocked Resend
adapter. Fresh local Node 24 validation passed gates (including 50 unit tests),
domain (31 files/840 tests), full PostgreSQL/Redis integration (58/58), production
build with both CSP hash passes, and production-browser acceptance in
Chromium/Firefox/WebKit with axe and responsive/keyboard checks. These results
do not close production authentication: second-provider failover, refresh/device
revocation and recovery flows remain incomplete; real delivery and domain
acceptance, counsel review, and production validation remain owner/external
gates. A fresh full dependency audit exits 1 with 5 high and 7 moderate findings;
the production-only audit exits 0 at the configured high threshold but still
reports three moderate findings. No finding was suppressed or waived; see
`blocker.txt`.

Existing evidence is partial: `packages/core/src/database.test.ts` contains the
`market and pipeline HTTP routes preserve evidence, query bounds and owner
isolation` integration test, including lead ownership, duplicate-save,
revision-conflict, history-redaction and status-validation cases. The matrix
records that coverage but does not present it as v12 acceptance. Exact
application-evidence tests, migration/recovery checks, and current browser/DB
execution remain outstanding. No runtime files or migrations were modified; no
application state or external link was opened and no test was executed in this
review.

## Application evidence and recovery execution refresh (2026-10-20)

The static gap review above is retained as historical evidence and superseded
for the current dirty worktree by the Stage E implementation recorded in
`PROGRESS.md`: additive migration `0019_application_evidence.sql`, candidate-
reported evidence and withdrawn status, owner-scoped API/history behavior, and
shared Applications/Saved UI. Fresh local PostgreSQL/Redis integration (58/58)
and Chromium/Firefox/WebKit browser acceptance passed. The run also passed a
17-table synthetic database restore, Redis AOF publisher/worker restart,
process/file/lease crash recovery, and full-disk checks. These are local
synthetic results; hosted restore, off-host disaster recovery, candidate claims
versus employer acknowledgement in production, and release acceptance remain
unproven. External-link opening remains separate from any application-state
mutation.
