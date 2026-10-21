# Supplied source reconciliation — 21 October 2026

Status: REVIEWED DELTA; SOURCE APPROVAL RECORDED ADDITIVELY; REQUIREMENT
RECONCILIATION AND IMPLEMENTATION EVIDENCE REMAIN INCOMPLETE.

Repository baseline inspected: `2a81b6f4bce38401aaae116f4a51d45a23d0ea2f`.
The owner subsequently approved the supplied CareerScope source revisions and
global standards v1.1 in OA-2026-10-20-02. That later decision resolves the
source-approval questions below; it does not waive security findings or authorize
live provider/production actions. The original hash-bound approvals and snapshots
remain unchanged for historical traceability.

## Source identities

SHA256 identifies the exact supplied bytes, not implemented functionality.

| Document                             | Previously approved SHA256                                       | Newly supplied SHA256                                            |
| ------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| CareerScope-v12.md                   | 35E9A728A65B0620CB9075345216C69C973FEE57EFAD21752554DC338A532167 | ECB3A40AC0E8BC532BAFF6E6897D9C4FE962C9B25516B65449814B83B2A25214 |
| CareerScope-Engineering-Standards.md | C860202371BCDAD55258D39A3F5E474355FC013462A9E97CE4AB046E5A034A76 | 52F78F94123091DFAD411D9DD0662635834DBBF381561AFE937ADBC72EABD25F |
| CareerScope-Goal.md                  | D186DBD4A3A93F622FDDD23D23010FB1AF185C87E0B4947C8085B7898D402395 | AA0EA656B12FA62DA2AA64AC5D5A455542B964A56BFDA0B055133E1EACA69112 |

All three identities differ. The existing Goal snapshot has a separately recorded
line-ending/Markdown normalization hash; that transformation is not permission to
silently adopt these substantive revisions. `SOURCE-REGISTER.md` remains the
authority for approved identities. Source validation must continue checking those
immutable snapshots, not replace expected hashes to obtain a green result.

## Material deltas and required disposition

| Reference                                  | Delta / conflict                                                                                                                                                                                  | Current disposition                         | Safe next action                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| v12 D1, D11-R, A1; Standards A1; Goal A1   | Removes second-provider sign-in fallback and phone sign-in roadmap; adds exact OTP, consent and transport rules. A1 explicitly says PENDING_OWNER_APPROVAL despite supersession wording elsewhere | OWNER DECISION                              | Record explicit A1/D11-R approval with these hashes before changing approved D11 or deleting legacy authentication functionality                  |
| v12 A1.13, LA2, original 4.1               | Fresh email OTP step-up is proposed; original admin two-factor requirement is not automatically satisfied by another challenge to the same mailbox                                                | OWNER DECISION                              | Specify assurance/step-up policy without calling same-channel OTP an independent second factor; keep privileged operations gated                  |
| v12 A2; Goal A2                            | Selects OpenRouter for approved gated AI features, not new features; privacy, budget and activation gates remain                                                                                  | PENDING AMENDMENT                           | Obtain local mocked-work approval; no live provider call, spending, user data transfer or feature activation                                      |
| v12 A3.1; Standards A3 and launch baseline | Dedicated proposed 4-vCPU host versus existing shared host versus shared 4-vCPU host                                                                                                              | SOURCE CONFLICT                             | Owner selects planning topology; do not purchase, deploy or treat another live product as staging                                                 |
| v12 A3.5; Goal A3                          | Ephemeral GitHub Actions validation is proposed/recorded in supplied text; actual Actions is disabled in the last verified integration evidence                                                   | EXTERNAL CONFIGURATION / EVIDENCE           | Owner enables authorized CI and budget; obtain actual trigger and failure-path runs. A document does not prove a hosted run                       |
| D12 and LG8                                | One-hour off-host WAL target; 24-hour fallback requires a separate explicit exception                                                                                                             | OWNER / EXTERNAL GATE                       | Select off-host target, implement/test authorized disposable restore path, measure RPO/RTO; do not call local backup disaster recovery            |
| LB1–LB19, LA1–LA12, LG1–LG8                | 39 control rows are explicitly proposed under CR-07; some overlap existing approved requirements, some add scope/contracts                                                                        | PENDING AMENDMENT                           | Map overlapping controls to existing requirements; approve genuinely new controls separately. No blanket implementation/compliance claim          |
| LB7                                        | Proposed validation response is HTTP 422; current API uses documented HTTP 400 validation behavior                                                                                                | CONTRACT DECISION                           | Preserve current contract until explicit migration/versioning decision and consumer/test updates; do not silently change all validation responses |
| LA11                                       | Proposes /health/live and /health/ready; current canonical route is /api/health                                                                                                                   | CONTRACT DECISION                           | Decide aliases versus contract migration before changing proxy/health consumers; preserve current readiness behavior                              |
| Cleanup baseline                           | Refers to an additional v1.2 requirement matrix and new proposed requirements; destructive legacy-auth cleanup requires migration approval                                                        | REFERENCED SOURCE NOT REVIEWED IN THIS PASS | Review the matrix before adopting its requirements; retain existing users, hashes, columns, migrations and history                                |
| Standards section 6 / Goal section 4       | Supplied documents retain dev-only/PR-era rules                                                                                                                                                   | ALREADY OVERRIDDEN FOR SYNCHRONIZATION      | OA-2026-10-21-01 governs owner-authorized main synchronization. Do not restore superseded branch restrictions from attachments                    |
| Standards section 5 / LA7                  | Unaccepted high/critical dependency findings block promotion                                                                                                                                      | STILL BLOCKED                               | Remediate or obtain a specific dated owner exception. The new request is not a security exception                                                 |

Two additional explicit decision deltas must not be hidden by A1's claim that
only D11 changes:

- **D1:** approved D1 plans post-launch phone OTP; supplied D1 removes all other
  planned sign-in methods. A1 nevertheless says D1–D10 are unchanged. Owner
  disposition of D1 is required separately from D11-R, retaining the original.
- **D12:** approved D12 applies the 24-hour fallback if WAL is unavailable at
  launch. Supplied D12 narrows this to a separately approved exception, while A1
  says D12 is unchanged. The owner must disposition this substantive narrowing
  and existing RECOVERY-01; preserve the original clause. No fallback or recovery
  target is claimed to have been achieved or authorized by this review.

The proposal headings and conflicting statements were inspected directly. This is
a source-authority and execution-order reconciliation, not a full line-by-line
implementation assessment of all newly proposed controls.

## Existing implementation and evidence boundary

The consolidation checkpoint contains reviewed OTP/session/email-change and
candidate application-evidence work. The executed local results at that checkpoint
are in `docs/MAIN-CONSOLIDATION-2026-10-21.md`: 77 unit/gate tests, 55 service-backed
integration tests, 835 domain tests, builds, three browser engines with axe, and
recovery/performance checks. These are previous-checkpoint execution results,
not new executions of every test during this document review.

The tested runtime and browser-harness bytes are recorded by commit
`2a81b6f4bce38401aaae116f4a51d45a23d0ea2f`. The final uninterrupted local
`ui-all-verified.log` completed with exit 0 and six success markers: Chromium,
Firefox and WebKit main journeys, plus all three selector/session/keyboard/reflow/
axe journeys. Earlier failures retained in PROGRESS.md (including WebKit not
reached) preceded the reviewed harness corrections and final successful run;
they are not deleted or represented as successful. TEST_MATRIX.md's opening
consolidation delta and PROGRESS.md's later consolidation entry record that final
run. No newer browser execution occurred in this source-review pass, and no
hosted browser evidence is claimed.

The approved inventory still has 319 overlapping source items, not 319 independent
features. Its NOT_ASSESSED rows are not a measured implementation-completion
percentage. The go/no-go ledger still contains 25 unverified launch rows; the
proposed live OTP item 26 is not silently added as approved. Full v12 launch-core
completion is not established by either the documents or the consolidation.

Observed current route/module inventory remains candidate-focused. Recruiter
verification/posting, interview organizer, moderation, notification delivery,
complete localization, account-deletion orchestration, privileged audit/control
plane and rights-gated public publication still require requirement-specific
implementation and evidence review. Missing route names alone do not prove the
absence of every supporting behavior. Do not label these complete or invent a
percentage from test totals.

## Owner decision follow-up

The prior table records the evidence and questions as they stood when this review
was written. The owner has since approved the supplied source documents as the
reference set and the revised v12 base scope, including D1–D14, with hashes in
OA-2026-10-20-02. Do not ask again for approval of the documents themselves.
However, clauses explicitly labeled `PROPOSED` or `PENDING_OWNER_APPROVAL` inside
those sources retain that status unless the owner separately approved the
specific amendment. In particular, do not infer approval of amendment-only
changes to D11, recovery fallback, provider activation, or hosting from approval
of the source files. Reconcile the exact clauses and route any still-required
product decision through the existing blocker register. Preserve distinct
live-validation, legal, hosting, provider, backup, and production gates. The
original table and source identities remain as history.

## Dependency-aware continuation

1. Preserve the verified consolidation and original dirty worktrees. Resolve
   AUDIT-01 before main promotion; do not weaken its failing audit.
2. Record the precise source decisions above. Keep pending proposals separate
   from approved scope, and update the source register only through a documented
   owner-approved transition with retained historical identities.
3. Reconcile AUTH-01/PROVIDER-01 and go/no-go 2–3 after D11-R disposition. Existing
   accounts and sessions must survive any approved credential migration.
4. Complete approved candidate onboarding/profile, resume, permitted-source
   discovery, deterministic matching and candidate-owned application tracking
   vertical slices; use existing Phase 0 design authority and canonical modules.
5. Implement approved interview/recruiter/notification/moderation/admin slices
   with explicit owner/role denial tests and no real messages or scraping.
6. Complete localization, accessibility, responsive/browser/runtime leakage,
   coverage, migration, resilience and quality controls. Keep manual/device and
   provider evidence distinct from automation.
7. Obtain actual hosted CI/negative-control evidence and authorized infrastructure,
   off-host restore, legal/source-permission and human acceptance. Only the owner
   authorizes production and public launch.

Independent approved work need not wait for unrelated source/host/provider gates.
No blanket approval, provider capability, legal conclusion, live test, deployment,
main push, vulnerability waiver or production-readiness claim is made here.
