# CareerScope Phase 2 — Blocker Classification and Resolution

Date: 2026-10-02  
Baseline: `phase-1/design-to-engineering-backlog` at `5f17aa0894b2d9d47e5ce5bc2f688b3be322cc25`  
Working branch: `phase-2/blocker-classification-resolution`

## Scope and safety boundary

This phase classifies the current repository truth. It does not deploy, push,
merge, change ticket statuses, edit runtime behavior, migrate workflows, or
claim hosted evidence. The authoritative machine model is
[`.ai/blocker-classification.json`](../.ai/blocker-classification.json). The
only manual actions are listed in [`hostpending.txt`](../hostpending.txt).

Every one of the 216 records in `.ai/backlog.json` is represented exactly once
in the model. A ticket is an active blocker only when its current evidence
identifies an unresolved gate. HOLD/FUTURE/CONDITIONAL design work is not
silently promoted to a blocker. The explicit CS-25 owner deferral is recorded
as a decision, not disguised as an actionable host task.

## Recomputed ticket census

| Backlog status |   Count |
| -------------- | ------: |
| UAT            |      64 |
| QA             |       4 |
| BLOCKED        |      26 |
| DISCOVERY      |     122 |
| **Total**      | **216** |

The model identifies 37 active blockers (including the four QA gates and nine
hidden blockers whose current ticket records contradict their status), one
owner-deferred item (CS-25), and zero unclassified blockers. Statuses were not
changed in Phase 2.

## Single primary class model

Each active blocker has exactly one primary class. Counts include QA and hidden
status contradictions where the evidence is an actual unresolved gate.

| Class                                   | Meaning                                           |  Count |
| --------------------------------------- | ------------------------------------------------- | -----: |
| B1_PRODUCT_OR_OWNER_DECISION            | Product scope, owner approval, or design decision |     15 |
| B2_CODE_OR_ARCHITECTURE                 | Code or architecture work still required          |      1 |
| B3_SECURITY_OR_SYSTEM_REVIEW            | Security, architecture, or system review/evidence |      6 |
| B4_LIVE_HOST_OR_OPERATOR_EVIDENCE       | Live host, operator, or service-backed evidence   |      8 |
| B5_EXTERNAL_PROVIDER_ACCOUNT_DNS_SECRET | Provider/account/DNS/secret-controlled action     |      3 |
| B6_REAL_WORLD_HUMAN_ACCEPTANCE_OR_LEGAL | Human, accessibility, visual, or legal acceptance |      4 |
| **Active blockers**                     |                                                   | **37** |

CS-19 was corrected from B2 to B4: its implementation is present and the
remaining gate is hosted Postgres/Redis verification. The only unresolved B2
item is CS-38, whose remaining cross-engine dashboard matrix is deferred as
Phase-4-sized test/implementation work. CS-52 is resolved in Phase 2 by its
recorded direct-V2 deploy-gate change and hosted run 36453423255.

## Hidden blockers and explicit deferrals

- CS-3 and CS-24 are still marked UAT but their current steps explicitly
  require live-host proxy/monitoring evidence; they are classified B4.
- CS-2 and CS-7 are still marked UAT while their own acceptance records lack
  current cross-engine/failed-deploy system evidence; they are classified B3.
- CS-16 is still marked UAT but explicitly requires human screen-reader
  validation; it is classified B6.
- CS-39 is marked UAT while its current step says its counted supported-runtime
  evidence must be re-taken; it is classified B3 for system/release review.
- CS-38 and CS-52 are still marked UAT while their own records explicitly say
  historical evidence contains an unmet statement. CS-38 remains B2; CS-52 is
  resolved by its later exact hosted evidence and carries a conservative
  historical-findings promotion guard.
- CS-62 is marked UAT while its current step records an unmet acceptance half
  caused by the UI freeze; it is classified B1 for the scope decision.
- CS-25 is marked BLOCKED, but the repository records an explicit owner
  decision to defer off-host/scheduled backup acceptance to a future release.
  It is therefore `DEFERRED_BY_OWNER`, not an active Phase 2 blocker and not a
  hostpending action. Local backup/restore evidence must not be called disaster
  recovery.

## Host-pending policy

`hostpending.txt` contains 15 actionable entries for B4, B5, and B6 only. Each
entry names an owner, explains why repository work cannot satisfy the gate,
points to safe steps and pass evidence, and provides a reversible rollback
boundary. It contains no credentials, tokens, private data, database contents,
resume data, or host configuration values. B1/B2/B3 items are intentionally
not placed there because they require a decision or review, not an operator
command.

## Validator and negative controls

`npm run blockers:check` validates:

- exact one-to-one coverage of all backlog IDs;
- one allowed primary class for every active blocker;
- required reason, source, owner, evidence, and resolution fields;
- B4/B5/B6 ↔ hostpending mapping and actionable/reversible content;
- no orphan or duplicate hostpending entry;
- no B2 item marked as a manual action;
- no resolved B1 without a decision source;
- every active blocker has a valid `phase2Disposition`;
- B2 blockers are explicitly `DEFERRED_MAJOR_IMPLEMENTATION`;
- B3 blockers carry an explicit independent-review boundary;
- CS-25 has a sourced `OWNER_DEFERRED` disposition;
- hidden blockers carry a promotion guard;
- no HOLD/FUTURE/CONDITIONAL-only design item presented as an active blocker;
- preservation of the Phase 1 coverage snapshot (14 stages, 127 ordered
  screens, 345 approved images, 216 tickets).

`npm run blockers:test` exercises the corresponding negative cases: missing or
invalid class, missing mapping, orphan and duplicate hostpending entries, a
status change, a code blocker incorrectly marked manual, missing disposition,
invalid B2/B3 disposition, a B1 decision-source conflict, an unguarded hidden
blocker, ambiguous CS-25 deferral, and HOLD/FUTURE work incorrectly marked
blocked.

## Evidence ledger

| Item                                  | Classification                        | Evidence                                                           |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| Backlog census                        | FIXED                                 | Current `.ai/backlog.json`, 216 records, recomputed 2026-10-02     |
| Blocker model                         | FIXED                                 | `.ai/blocker-classification.json`, validator and negative tests    |
| Host/operator actions                 | EXTERNAL BLOCKER                      | `hostpending.txt`; no live execution performed                     |
| Provider/account/DNS/secret actions   | EXTERNAL BLOCKER                      | `hostpending.txt`; no credentials requested or recorded            |
| Screen-reader/visual/legal acceptance | HUMAN VALIDATION                      | `hostpending.txt`; automation is not substituted                   |
| CS-25 off-host backup                 | OWNER DECISION / DEFERRED BY R1 SCOPE | `.ai/BATCH-PLAN.md` and ticket evidence                            |
| Phase 1 traceability                  | ALREADY SATISFIED                     | `npm run design:coverage:check` and `npm run design:coverage:test` |

## Final disposition audit

The final audit adds an explicit disposition to every active blocker and to
the separately recorded CS-25 deferral. `phase2Resolvable` is false for every
remaining blocker. The only Phase-2 resolution is CS-52; its later hosted
evidence supersedes the earlier unmet statement without rewriting the
append-only ticket history.

### B1 — product/owner decisions

All 15 B1 items are `WAITING_OWNER_DECISION`. No repository decision source
exists for any of them, so none can be silently resolved by an agent and none
is code work disguised as a decision.

| Ticket | Decision required / blocker reason                                             | Decision source | Disposition            | Why Phase 2 cannot decide                                    |
| ------ | ------------------------------------------------------------------------------ | --------------- | ---------------------- | ------------------------------------------------------------ |
| CS-17  | Choose persisted dismissal semantics                                           | None            | WAITING_OWNER_DECISION | Changes the lead lifecycle/domain model                      |
| CS-40  | Approve admin role, redaction, audit, and page scope                           | None            | WAITING_OWNER_DECISION | Privileged product policy requires owner authority           |
| CS-42  | Decide whether saved-search execution is R1                                    | None            | WAITING_OWNER_DECISION | Scope and scheduling semantics are not approved              |
| CS-43  | Decide alert delivery and activation semantics                                 | None            | WAITING_OWNER_DECISION | Provider/delivery behavior is intentionally deferred         |
| CS-44  | Approve sender, domain, secret handling, security design, and CS-59 dependency | None            | WAITING_OWNER_DECISION | Account-recovery policy cannot be inferred                   |
| CS-46  | Choose always-on resume facts or per-fact exclusion                            | None            | WAITING_OWNER_DECISION | Matching intent belongs to the product owner                 |
| CS-47  | Prioritize scheduler health against held frontend work                         | None            | WAITING_OWNER_DECISION | Sequencing is explicitly owner-controlled                    |
| CS-50  | Sign off the reduced truthful application lifecycle scope                      | None            | WAITING_OWNER_DECISION | Product acceptance cannot be substituted by review-loop text |
| CS-62  | Re-scope the EmptyState visual contract or lift UI freeze                      | None            | WAITING_OWNER_DECISION | The alternatives change approved UI behavior                 |
| CS-64  | Choose supported languages for title derivation                                | None            | WAITING_OWNER_DECISION | Language scope is a product policy                           |
| CS-80  | Authorize a named commit scope for baseline evidence                           | None            | WAITING_OWNER_DECISION | Repository authority is explicitly owner-controlled          |
| CS-88  | Provide approved admin-page design                                             | None            | WAITING_OWNER_DECISION | No privileged UI may be invented                             |
| CS-90  | Approve Cognito account, region, migration, and rollback architecture          | None            | WAITING_OWNER_DECISION | It changes the authentication authority                      |
| CS-91  | Approve provider/session contract for OTP implementation                       | None            | WAITING_OWNER_DECISION | Depends on CS-90 and cannot be guessed                       |
| CS-93  | Approve Cognito session contract and frontend states                           | None            | WAITING_OWNER_DECISION | Provider behavior and session guarantees are not approved    |

`B1_WITH_EXISTING_DECISION_BUT_STILL_OPEN = 0`,
`B1_FALSELY_CLASSIFIED_CODE_WORK = 0`, and `B1_UNSUPPORTED_RESOLUTIONS = 0`.

### B2 — code/architecture

| Ticket | Disposition                   | Phase-2 decision                                                                                                                                                                                                         |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CS-38  | DEFERRED_MAJOR_IMPLEMENTATION | The remaining dashboard state matrix needs substantive cross-engine fixtures and review across populated, stale, paginated, and failing states. It is Phase-4-sized test/implementation work, not a metadata correction. |

CS-19 was reclassified to B4 because its code is implemented and only
hosted Postgres/Redis evidence remains. CS-52 was `RESOLVED_PHASE_2` from its
recorded direct-V2 deploy-gate change and hosted run 36453423255. Therefore
`PHASE2_ACTIONABLE_B2_REMAINING = 0` and
`DEFERRED_MAJOR_IMPLEMENTATION_BLOCKERS = 1`.

### B3 — security/system review

| Ticket | Reason                                                                      | Disposition                | Explicit review boundary                                                             |
| ------ | --------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| CS-2   | Named WebKit/CI acceptance evidence must be re-taken                        | WAITING_INDEPENDENT_REVIEW | Self-review would not satisfy the independent system-evidence gate                   |
| CS-7   | Deliberately failing deploy refusal needs a real workflow demonstration     | WAITING_INDEPENDENT_REVIEW | Local mutation tests do not replace independent workflow review                      |
| CS-10  | Agent activation-policy remediation changes a security boundary             | WAITING_INDEPENDENT_REVIEW | Operator/security review is required; an agent cannot self-edit its own boundary     |
| CS-39  | Supported-runtime counted acceptance evidence must be re-taken              | WAITING_INDEPENDENT_REVIEW | The recorded Node 22 evidence is not current release evidence                        |
| CS-41  | Domain-expansion design needs architecture/security/legal review            | WAITING_INDEPENDENT_REVIEW | Collection, provenance, retention, and isolation authority is external to this audit |
| CS-45  | Encrypted read-only control-center design needs independent security review | WAITING_INDEPENDENT_REVIEW | A self-approved snapshot/write-boundary review is not valid evidence                 |

No independent reviewer was invoked in this focused audit; recording that
boundary is deliberate, not a self-approval. Thus
`PHASE2_ACTIONABLE_B3_REMAINING = 0` and
`B3_WITHOUT_EXPLICIT_REVIEW_REASON = 0`.

### CS-25 — owner-deferred backup

| Field                        | Result                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Title                        | No scheduled database dump exists, even on the host                                                                         |
| Current status               | BLOCKED                                                                                                                     |
| Actual blocker               | Scheduled/off-host backup acceptance was explicitly deferred; calendar-triggered host evidence is not being accepted for R1 |
| Primary class                | None while deferred; not an active B1–B6 instance                                                                           |
| Disposition                  | OWNER_DEFERRED                                                                                                              |
| Deferral source              | `.ai/BATCH-PLAN.md` and `.ai/backlog.json` evidence dated 2026-09-29                                                        |
| Host evidence still required | Yes for the future release decision; not an R1 Phase-2 action                                                               |
| In hostpending               | No                                                                                                                          |
| Count treatment              | Excluded from the 37 active blocker instances because the owner decision deliberately defers it                             |

`CS25_CLASSIFICATION_UNAMBIGUOUS = YES` and
`CS25_DEFERRAL_HAS_SOURCE = YES`. Local backup/restore is not represented as
off-host disaster recovery.

### Hidden blockers and promotion guards

| Ticket | Status | Class            | Disposition                   | Promotion restriction                                   | Required evidence                                                  |
| ------ | ------ | ---------------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| CS-2   | UAT    | B3               | WAITING_INDEPENDENT_REVIEW    | Blocked until independent current cross-engine evidence | Exact Linux WebKit/CI result for the named assertion               |
| CS-7   | UAT    | B3               | WAITING_INDEPENDENT_REVIEW    | Blocked until real failed-deploy refusal evidence       | Exact hosted workflow refusal for an intentional failure           |
| CS-38  | UAT    | B2               | DEFERRED_MAJOR_IMPLEMENTATION | Blocked until the complete dashboard matrix and review  | Populated, stale, paginated, failing, mobile, and desktop evidence |
| CS-52  | UAT    | resolved Phase 2 | RESOLVED_PHASE_2              | Conservative historical-findings guard remains          | Hosted run 36453423255 and direct V2 deploy-gate evidence          |

The model carries `promotionGuard` metadata for each of these records, so no
promotion automation may treat an unresolved one as ready. The conservative
CS-52 guard prevents historical wording from being mistaken for new evidence.
`HIDDEN_BLOCKERS_WITHOUT_PROMOTION_GUARD = 0`.

### Hostpending reconciliation

CS-19’s corrected B4 classification adds one service-backed action, so the
final totals are B4=8, B5=3, B6=4, and `HOSTPENDING_ITEMS = 15`.

| Check                               | Result |
| ----------------------------------- | -----: |
| B4+B5+B6 blockers                   |     15 |
| Hostpending items                   |     15 |
| Manual blockers without hostpending |      0 |
| Hostpending without blocker         |      0 |
| Code-only hostpending items         |      0 |
| Resolved hostpending items          |      0 |
| Duplicate hostpending items         |      0 |

### Final gate distinction

| Gate                                 | Result                                 |
| ------------------------------------ | -------------------------------------- |
| Phase-2 actionable internal blockers | 0                                      |
| Phase-2 complete                     | YES                                    |
| Ready for Phase 3                    | YES (after owner review of this audit) |
| Release 1 gate                       | BLOCKED                                |

Phase 2 completion means classification and locally resolvable disposition work
are complete. It does not certify Release 1 production readiness. Owner
decisions, independent reviews, live host/provider evidence, human acceptance,
and the deferred dashboard implementation remain explicit.

## Phase 3 readiness

The repository has a complete, machine-validated blocker ledger. This is not a
Release 1 production certification: 37 active blockers remain and no hosted or
human evidence was fabricated. Phase 3 may consume the model to resolve
locally actionable B1/B2/B3 work and to coordinate the explicitly external or
human gates, but this Phase 2 branch does not change those statuses.
