# Phase 3 — Canonical ticket workflow migration

Status: complete on the Phase 3 branch; this document records repository
workflow state only. It does not certify Release 1 or any hosted environment.

## Contract

CareerScope tickets use exactly six stages: `BACKLOG`, `TODO`, `IN_PROGRESS`,
`QA`, `UAT`, and `PROD`. Blockers are orthogonal metadata on the ticket and
never a seventh board column. The shared implementation is
`scripts/lib/ticket-workflow.mjs`; `.ai/workflow-migration.json` is the
machine-readable migration ledger.

Forward movement is one stage at a time. Rework is explicit: TODO→BACKLOG,
IN_PROGRESS→TODO, QA→IN_PROGRESS, UAT→QA or IN_PROGRESS. PROD is terminal.
Blocked tickets remain visible in their stage and cannot be promoted.

## Baseline and census

The migration started from Phase 2 commit
`22455e06039390c33a7a478d0fcb89cf4a7df462` on
`phase-2/blocker-classification-resolution`. The Phase 3 branch is
`phase-3/canonical-workflow-migration`.

| Legacy stage |   Count | Canonical stage(s)                        |
| ------------ | ------: | ----------------------------------------- |
| UAT          |      64 | UAT (70 after blocked-stage recovery)     |
| QA           |       4 | QA (5 after blocked-stage recovery)       |
| BLOCKED      |      26 | BACKLOG, QA, or UAT with blocker metadata |
| DISCOVERY    |     122 | BACKLOG                                   |
| **Total**    | **216** | **216**                                   |

The 37 active Phase 2 blockers were preserved from
`.ai/blocker-classification.json`, including hidden blockers. CS-25 remains an
owner-deferred backlog item without blocker metadata; resolved Phase 2 items
remain unblocked. No timestamps were invented: `blockedSince` is null unless a
source record supplies one (none did).

## Evidence and compatibility

Acceptance criteria, evidence arrays, completed steps, source, ownership and
user-problem fields were preserved byte-for-byte by the migration utility. The
legacy labels remain only in the migration ledger and historical Phase 2
records, where they are needed for auditability. Active readers and the control
center consume the canonical stages and render a blocker badge/filter/summary
without a Blocked column.

Runtime, API, database, authentication, deployment topology and production
behavior were not changed in Phase 3. The Release 1 gate remains independent
and may still be blocked by hosted or human acceptance requirements.
