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

The model identifies 38 active blockers (including the four QA gates and nine
hidden blockers whose current ticket records contradict their status), one
owner-deferred item (CS-25), and zero unclassified blockers. Statuses were not
changed in Phase 2.

## Single primary class model

Each active blocker has exactly one primary class. Counts include QA and hidden
status contradictions where the evidence is an actual unresolved gate.

| Class                                   | Meaning                                           |  Count |
| --------------------------------------- | ------------------------------------------------- | -----: |
| B1_PRODUCT_OR_OWNER_DECISION            | Product scope, owner approval, or design decision |     15 |
| B2_CODE_OR_ARCHITECTURE                 | Code or architecture work still required          |      3 |
| B3_SECURITY_OR_SYSTEM_REVIEW            | Security, architecture, or system review/evidence |      6 |
| B4_LIVE_HOST_OR_OPERATOR_EVIDENCE       | Live host, operator, or service-backed evidence   |      7 |
| B5_EXTERNAL_PROVIDER_ACCOUNT_DNS_SECRET | Provider/account/DNS/secret-controlled action     |      3 |
| B6_REAL_WORLD_HUMAN_ACCEPTANCE_OR_LEGAL | Human, accessibility, visual, or legal acceptance |      4 |
| **Active blockers**                     |                                                   | **38** |

The B2 items are CS-19 (owner-scoped lookup verification dependency), CS-38
(an explicitly unmet dashboard acceptance criterion), and CS-52 (the deploy
gate does not directly execute the required V2 tests). CS-70 is separately
classified B4 so that its external verification is not hidden inside a code
ticket.

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
  an acceptance criterion remains unmet; they are classified B2.
- CS-62 is marked UAT while its current step records an unmet acceptance half
  caused by the UI freeze; it is classified B1 for the scope decision.
- CS-25 is marked BLOCKED, but the repository records an explicit owner
  decision to defer off-host/scheduled backup acceptance to a future release.
  It is therefore `DEFERRED_BY_OWNER`, not an active Phase 2 blocker and not a
  hostpending action. Local backup/restore evidence must not be called disaster
  recovery.

## Host-pending policy

`hostpending.txt` contains 14 actionable entries for B4, B5, and B6 only. Each
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
- no HOLD/FUTURE/CONDITIONAL-only design item presented as an active blocker;
- preservation of the Phase 1 coverage snapshot (14 stages, 127 ordered
  screens, 345 approved images, 216 tickets).

`npm run blockers:test` exercises the corresponding negative cases: missing or
invalid class, missing mapping, orphan and duplicate hostpending entries, a
code blocker incorrectly marked manual, a B1 resolution without a source, and
HOLD/FUTURE work incorrectly marked blocked.

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

## Phase 3 readiness

The repository has a complete, machine-validated blocker ledger. This is not a
Release 1 production certification: 38 active blockers remain and no hosted or
human evidence was fabricated. Phase 3 may consume the model to resolve
locally actionable B1/B2/B3 work and to coordinate the explicitly external or
human gates, but this Phase 2 branch does not change those statuses.
