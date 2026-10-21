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

| Reference                                  | Delta / conflict                                                                                                                                                                                  | Current disposition                                  | Safe next action                                                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v12 D1, D11-R, A1; Standards A1; Goal A1   | Removes second-provider sign-in fallback and phone sign-in roadmap; adds exact OTP, consent and transport rules. A1 explicitly says PENDING_OWNER_APPROVAL despite supersession wording elsewhere | BASE SOURCE APPROVAL RESOLVED; A1/D11-R PENDING      | Revised base D1–D14 is owner-approved under OA-2026-10-20-02. Preserve the conflicting A1 wording and existing D11 fallback contract until the specific D11-R amendment is approved                                                 |
| v12 A1.13, LA2, original 4.1               | Fresh email OTP step-up is proposed; original admin two-factor requirement is not automatically satisfied by another challenge to the same mailbox                                                | OWNER DECISION                                       | Specify assurance/step-up policy without calling same-channel OTP an independent second factor; keep privileged operations gated                                                                                                    |
| v12 A2; Goal A2                            | Selects OpenRouter for approved gated AI features, not new features; privacy, budget and activation gates remain                                                                                  | PENDING AMENDMENT                                    | Obtain local mocked-work approval; no live provider call, spending, user data transfer or feature activation                                                                                                                        |
| v12 A3.1; Standards A3 and launch baseline | Dedicated proposed 4-vCPU host versus existing shared host versus shared 4-vCPU host                                                                                                              | SOURCE CONFLICT                                      | Owner selects planning topology; do not purchase, deploy or treat another live product as staging                                                                                                                                   |
| v12 A3.5; Goal A3                          | Ephemeral GitHub Actions validation is proposed/recorded in supplied text; actual Actions is disabled in the last verified integration evidence                                                   | EXTERNAL CONFIGURATION / EVIDENCE                    | Owner enables authorized CI and budget; obtain actual trigger and failure-path runs. A document does not prove a hosted run                                                                                                         |
| D12 and LG8                                | One-hour off-host WAL target; 24-hour fallback requires a separate explicit exception                                                                                                             | BASE SOURCE APPROVAL RESOLVED; OPERATIONAL GATE OPEN | Revised base D12 is owner-approved under OA-2026-10-20-02. Implement and validate the one-hour off-host target; any 24-hour fallback remains a separately approved, disclosed exception. Do not call local backup disaster recovery |
| LB1–LB19, LA1–LA12, LG1–LG8                | 39 control rows are explicitly proposed under CR-07; some overlap existing approved requirements, some add scope/contracts                                                                        | PENDING AMENDMENT                                    | Map overlapping controls to existing requirements; approve genuinely new controls separately. No blanket implementation/compliance claim                                                                                            |
| LB7                                        | Proposed validation response is HTTP 422; current API uses documented HTTP 400 validation behavior                                                                                                | CONTRACT DECISION                                    | Preserve current contract until explicit migration/versioning decision and consumer/test updates; do not silently change all validation responses                                                                                   |
| LA11                                       | Proposes /health/live and /health/ready; current canonical route is /api/health                                                                                                                   | CONTRACT DECISION                                    | Decide aliases versus contract migration before changing proxy/health consumers; preserve current readiness behavior                                                                                                                |
| Cleanup baseline                           | Refers to an additional v1.2 requirement matrix and new proposed requirements; destructive legacy-auth cleanup requires migration approval                                                        | REFERENCED SOURCE NOT REVIEWED IN THIS PASS          | Review the matrix before adopting its requirements; retain existing users, hashes, columns, migrations and history                                                                                                                  |
| Standards section 6 / Goal section 4       | Supplied documents retain dev-only/PR-era rules                                                                                                                                                   | ALREADY OVERRIDDEN FOR SYNCHRONIZATION               | OA-2026-10-21-01 governs owner-authorized main synchronization. Do not restore superseded branch restrictions from attachments                                                                                                      |
| Standards section 5 / LA7                  | Unaccepted high/critical dependency findings block promotion                                                                                                                                      | STILL BLOCKED                                        | Remediate or obtain a specific dated owner exception. The new request is not a security exception                                                                                                                                   |

Two explicit source-text inconsistencies must not be hidden by A1's claim that
only D11 changes. The base owner decisions below are already resolved; the
remaining proposal wording and operational evidence gaps are not:

- **D1:** revised base D1 is approved under OA-2026-10-20-02. The appended A1
  statement that D1–D10 are unchanged still conflicts with revised D1; retain
  that proposal-level inconsistency as a specification finding. The separate
  D11-R amendment remains pending, so the existing D11 fallback contract is not
  changed by this approval.
- **D12:** revised base D12 is approved under OA-2026-10-20-02: the target is
  one-hour off-host WAL recovery, and a 24-hour fallback requires a separate,
  explicit, disclosed exception. RECOVERY-01 remains operationally open; no
  off-host target, restore drill, or fallback achievement is claimed here.

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
OA-2026-10-20-02. Do not ask again for approval of the documents themselves or
the revised base D1/D12 text. The source-delta questions about D1 and D12 in the
original table are resolved by that explicit approval: revised D1 says no other
sign-in method is planned; revised D12 sets a one-hour target and makes the
24-hour fallback an explicitly approved, disclosed exception only.

This does not approve every appended proposal. Clauses explicitly labeled
`PROPOSED` or `PENDING_OWNER_APPROVAL` retain that status unless the owner
separately approved the specific amendment. In particular, revised D11-R is
explicitly pending in A1 and is not one of D1–D14; do not remove the existing
second-provider contract or change sign-in routing on the basis of file approval
alone. A1's claim that D1–D10 are unchanged conflicts with revised base D1;
preserve this inconsistency as a specification finding rather than guessing.
The proposed step-up, AI-provider activation, A3 hosting/CI additions and
Production Completeness Amendment also remain gated where marked pending. The
original table and source identities remain as history. Preserve distinct
live-validation, legal, hosting, provider, backup, and production gates.

## Exact disposition of the 22 nonmatching legacy inventory entries

A literal source-text comparison against the owner-approved v12 R1 snapshot
found 297 exact matches and these 22 nonmatches in the original 319-item
inventory. The dispositions below close the review of each mismatch without
rewriting the historical inventory or promoting a pending amendment. When the
R1 inventory is prepared, approved-base replacements should use the R1 wording;
pending and external rows must remain separately identified rather than being
silently deleted or treated as accepted.

| Legacy inventory ID | Disposition                       | Basis and required handling                                                                                                                                                                                                                                                |
| ------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `V12-1-001`         | `REPLACE_WITH_APPROVED_BASE`      | Replace the old D1 text with the exact owner-approved R1 D1: Resend email OTP is the sole planned sign-in method; the test-only shortcut is restricted to development/staging and blocked in production. Preserve the conflicting A1 sentence as a proposal-level finding. |
| `V12-1-011`         | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The old D11 fallback remains the current approved contract. R1 labels D11-R as pending; its “superseded” wording does not make that amendment effective.                                                                                                                   |
| `V12-1-012`         | `REPLACE_WITH_APPROVED_BASE`      | Replace with approved R1 D12: one-hour off-host WAL target; 24-hour fallback only under a separately approved, disclosed exception. Operational evidence remains open.                                                                                                     |
| `V12-2-001`         | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The two-provider acceptance wording follows D11. Do not replace it with the proposed Resend-only outage test until D11-R is approved.                                                                                                                                      |
| `V12-4.1-001`       | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The provider-fallback contract remains linked to current D11; R1's replacement text is inside the pending amendment.                                                                                                                                                       |
| `V12-4.1-006`       | `RETAIN_UNTIL_AMENDMENT_APPROVED` | R1 changes password/device revocation wording to device/sign-out. Keep the approved baseline requirement until the amendment is effective; do not infer a credential or revocation policy from implementation alone.                                                       |
| `V12-4.1-009`       | `RETAIN_UNTIL_AMENDMENT_APPROVED` | Resend-only outage behavior is proposed by D11-R/A1; preserve the currently approved two-provider outage requirement for now.                                                                                                                                              |
| `V12-4.1-010`       | `REPLACE_WITH_APPROVED_BASE`      | Use approved D1's test-only shortcut wording, including startup refusal in production; this is a wording/precision update, not evidence that the deployment test ran.                                                                                                      |
| `V12-4.1-011`       | `SUPERSEDED_BY_APPROVED_D1`       | Remove phone OTP from active planned scope because approved D1 states no other sign-in method is planned. Retain this inventory row only as historical source lineage.                                                                                                     |
| `V12-4.1-012`       | `OWNER_DECISION_REQUIRED`         | R1 proposes same-channel Resend step-up but explicitly leaves whether it satisfies the existing admin two-factor requirement open. Do not equate same-channel OTP with an independent factor or activate privileged operations on that assumption.                         |
| `V12-6-007`         | `REPLACE_WITH_APPROVED_BASE`      | Replace with approved R1 D12 recovery text; one-hour remains the target, and 24 hours is only a separately approved/disclosed exception. No RPO is met without a restore drill.                                                                                            |
| `V12-6-013`         | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The second-provider failover behavior remains the D11 contract until D11-R is approved.                                                                                                                                                                                    |
| `V12-6-014`         | `RETAIN_UNTIL_AMENDMENT_APPROVED` | Resend-unavailable behavior and no deferred OTP delivery are A1/D11-R proposals; preserve the approved baseline outage contract meanwhile.                                                                                                                                 |
| `V12-7-003`         | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The Resend-only outage test replaces the existing two-provider test only if D11-R becomes effective.                                                                                                                                                                       |
| `V12-7-019`         | `REPLACE_WITH_APPROVED_BASE`      | Update to the revised D12 acceptance: meet the one-hour/four-hour targets, or use the 24-hour fallback only under a separate approved and disclosed exception.                                                                                                             |
| `V12-11-001`        | `SUPERSEDED_BY_APPROVED_D1`       | Remove phone OTP from active post-launch sign-in scope under D1; preserve the old row as history.                                                                                                                                                                          |
| `V12-12-001`        | `EXTERNAL_EVIDENCE_REQUIRED`      | The R1 row adds a caveat that DNS state was not verified. Keep SPF/DKIM/DMARC as an owner action until current DNS evidence is supplied; do not infer completion.                                                                                                          |
| `V12-12-002`        | `EXTERNAL_EVIDENCE_REQUIRED`      | R1 records an owner-reported Resend setup but explicitly says verification evidence and live OTP remain unverified. Preserve both facts; no provider call was made.                                                                                                        |
| `V12-12-003`        | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The second-provider account requirement is removed only by pending D11-R; do not close the dependency yet.                                                                                                                                                                 |
| `V12-13-007`        | `RETAIN_UNTIL_AMENDMENT_APPROVED` | The Resend-only failure test is proposed; the current two-provider test remains the accepted requirement until amendment approval.                                                                                                                                         |
| `V12-15-003`        | `RETAIN_UNTIL_AMENDMENT_APPROVED` | Keep the second-provider failover go/no-go criterion; its “superseded” R1 label is not effective while D11-R is pending.                                                                                                                                                   |
| `V12-15-004`        | `RETAIN_UNTIL_AMENDMENT_APPROVED` | Keep the both-providers-down acceptance gate until the Resend-only amendment is explicitly approved.                                                                                                                                                                       |

Disposition totals: 7 approved-base replacements/supersessions, 12 rows
retained pending D11-R/A1 approval, 1 owner-decision row, and 2 external status
rows requiring evidence. All 22 IDs are accounted for exactly once. This resolves
the mismatch-review subtask only; the legacy inventory still has the old source
hash and is not the active R1 inventory. A complete R1 source-item inventory,
classification of newly introduced base clauses, and traceability update remain
open. No ticket assessment, runtime behavior, provider status, or launch gate was
changed by this disposition.

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
