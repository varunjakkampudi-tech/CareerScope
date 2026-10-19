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
