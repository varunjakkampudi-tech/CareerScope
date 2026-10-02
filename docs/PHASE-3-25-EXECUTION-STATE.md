# Phase 3.25 execution state

This is a resumable execution checkpoint, not completion evidence or a competing
ticket registry. Canonical source remains backlog.json; authored specification
content is ticket-specification-policy.json; generated coverage owns counters.

- Branch: phase-3.25/ticket-specification-catalog.
- Initial clean checkpoint: 3a2ffcc5c368f08e88df6be5e0ffe4e55b2c1c14.
- Previous clean checkpoint: 2c37f25a52d7d4635c5cf7ecc2f0068a0cf9c111.
- Completed local checkpoint: c794c2ff95d98ad35e504d526fe1c0e310c4ff47.
- Latest checkpoint: resolve `git log -1 --format=%H -- docs/PHASE-3-25-EXECUTION-STATE.md`
  after committing this state; a document cannot honestly embed its own SHA.
- Last whole-spec approved ticket: NONE. Approved: 0/216. All 216 still require
  whole-content review, not just binding receipts.
- Reviewed ACs: CS-4 AC1–2; CS-8 AC1–3; CS-46 AC1–3; CS-67 AC1–3;
  CS-70 AC1–3; CS-71 AC1–3. Seventeen criteria have eighteen reviewed PLANNED
  procedures (CS-8 AC2 has contract plus browser); 889 criteria remain unmapped.
- Next content ticket: CS-1, within the continuing CS-1–CS-18 batch. CS-4 and
  CS-8 binding work is independently reviewed; do not regenerate it as generic
  drafts or mistake it for whole-spec approval.
- Remaining whole-spec tickets: CS-1 through CS-216. Continue through every
  bounded batch, without runtime implementation or ticket promotion.

## Exact remaining ledgers

The 617 OPEN finding identifiers are the `(ticketId, code)` pairs in
`.ai/ticket-specification-coverage.json` where `disposition === 'OPEN'`.
All 630 original records remain, with six resolved binding findings and seven
historical owner-choice reclassifications. Do not delete history or infer closure
from source-file presence.

Nine design gaps and 27 partial mappings remain in `.ai/design-traceability.json`.
Use its ticket IDs and actual imported paths; classification is not yet reviewed
for all 36. No missing asset is approved by this checkpoint.

Owner decisions already propagated for 11 tickets are in policy
`decisionReconciliations`, sourced from the verified historical owner document.
Do not reopen CS-46. Remaining owner/release findings are not yet all reconciled;
74 registry release targets remain UNASSIGNED. Do not manufacture assignments
or claim zero owner decisions before source review. Future hosted/manual proof
is a specified DoD, not automatically a spec-approval blocker.

## Concrete source reconciliations already identified

- CS-67 historical Blocked column criterion is superseded by immutable Phase 3
  six-stage workflow plus blocker metadata; no source AC was overwritten.
- CS-70 observed SaveJob aria-pressed/error-state defects are recorded without
  runtime fixes. Ownership fixtures must include both owners' leads/jobs sharing
  a fingerprint; both cross-owner directions are required.
- CS-71 reports derived/no-content/undeterminable, with paired English control;
  CS-64 remains language-policy scope, not permission to add ROLE_WORDS.
- CS-4 existing publication tests check commit paths; future git-add assertions
  are PLANNED. Fixtures inject read/run and never publish or read real .env.
- CS-8 cwd does not isolate import.meta paths. Copy actual modules/assets into
  validated temp roots or use supported root injection. Do not invoke the old
  state-reader mutation harness against canonical .ai. Rendered warnings have a
  separate planned browser binding.
- CS-7 historical override AC conflicts with newer manual/main-only fail-closed
  deployment contract. Preserve the historical AC; current require-ci/deploy gate
  explicitly exposes no bypass. Specify that reconciliation rather than adding
  an override or deliberately pushing broken main.
- CS-9 historical six-file integration count must be reconciled with the current
  nine registered service-backed files; do not reduce coverage to satisfy old prose.

## Resume without rediscovery

Read this state and REMEDIATION-LEDGER/REVIEW-01 first, then current policy and
only the next ticket's sources. Existing tooling is deterministic and must not
be rebuilt. The generator currently conservatively emits DRAFT/INCOMPLETE; a
minimal explicit whole-spec content-bound approval path is necessary only when
a truly complete reviewed spec is ready to consume it. Do not bypass unresolved
content findings or spend another cycle optimizing unrelated tooling.

Node v24.19.0 at the bundled runtime path is verified. Serialize legacy mutable
fixture gates; final validation is recorded in PHASE-3-25-VALIDATION.md. Execute
targeted specification checks after each content batch, locally commit, confirm
clean tree and continue. No push, merge, deployment or Phase 3.5 is authorized.
