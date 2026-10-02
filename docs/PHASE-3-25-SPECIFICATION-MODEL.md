# Phase 3.25 specification authority

This is planning tooling, not product implementation or release acceptance.
Phase 3 remains frozen: BLOCKED IS NOT A WORKFLOW STATUS.

## Ownership

| Source                                                           | Authority                                                                                                                                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.ai/backlog.json`                                               | Canonical IDs, titles, workflow, source acceptance criteria, dependencies, release assignments, ownership and blockers                                                        |
| `.ai/workflow-migration.json`                                    | Historical workflow/blocker migration provenance                                                                                                                              |
| `design/DESIGN-INDEX.json` and `.ai/design-ticket-coverage.json` | Existing design references and surface mappings; no inferred implementation                                                                                                   |
| `.ai/blocker-classification.json` and `hostpending.txt`          | Existing dispositions, manual actions and safe evidence requirements                                                                                                          |
| `.ai/ticket-specification-policy.json`                           | One editorial supplement: engineering Epic assignment, planning policies, explicitly sourced sequencing, additive per-ticket draft requirements and actual review disposition |
| Six generated `.ai/` catalogs and `docs/tickets/CS-*.md`         | Read-only projections, not independently editable specifications                                                                                                              |

Generation verifies all six frozen inputs against the Phase 3 source SHA before
writing. Backlog workflow, acceptance criteria and historical evidence must not
be overwritten to make the specification gate pass.

## Editorial refinements

`ticketRefinements` is keyed by an existing ticket ID. Each refinement carries
`sourceReferences`, `reviewStatus: DRAFT` and `additionalRequirements` keyed by a
specification section. Additions retain source requirements; they never replace
them. Identity, historical state, canonical design classification, acceptance
criteria, dependencies and delivery metadata are protected against editorial
replacement. A draft recommendation is labelled as unaccepted product behavior.

`decisionReconciliations` records later approved direction without modifying
frozen registry evidence. Its source commit/path/section must resolve; the
restored owner document is compared with the recorded Git object, permitting
formatting whitespace only. Historical owner-choice gaps remain in the audit
with an appended disposition rather than being erased.

`exactVerificationBindings` carries individually authored procedures. Every
binding requires setup, preconditions, action, assertion, expected result,
verification class, planned test path or manual procedure ID, fixtures, negative
case, evidence artifact, reviewer and release gate. Execution remains PLANNED.
A REVIEWED binding requires a real independent review receipt whose content
hash covers all binding fields except reviewStatus. Changing the procedure
invalidates the receipt. Reviewed procedure quality is not executed test proof.

Whole-specification approval/import remains unfinished; every specification
still has explicit reviewState DRAFT and zero implementation-ready approval.
Substantive ticket-specific refinement, contracts and whole-specification
reviews remain local Phase 3.25 work. No generated document is auto-approved.

The seven CS-47 `SEQUENCING` edges derive from its source AC4. They are distinct
from registry `HARD` dependencies and require source-criterion support. Owner
prioritization remains a manual gate. External/manual requirements are separate
gate records, not fictitious ticket nodes. Topological layers permit graph
parallelism only, not simultaneous ownership of shared files or mutable tests.

## Commands and gate meanings

| Command                         | Meaning                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run tickets:spec:generate` | Rebuild deterministic projections, writing changed bytes only                            |
| `npm run tickets:spec:check`    | Validate projection integrity, source references, census and exact artifact drift        |
| `npm run tickets:spec:test`     | Exercise source-preservation, malformed data, graph, mapping and determinism regressions |
| `npm run tickets:spec:ready`    | Fail closed while specifications, findings or independent approval remain incomplete     |

`check` is not `ready`. Every source AC has an unreviewed suggested verification
method. Exact reviewed mappings are separately counted from authored bindings
and suggested methods; unreviewed procedures remain unmapped. Existing implementation evidence is explicitly historical, not a
test run performed by this generator. Section population is not completeness.

Design classifications indicate reference coverage only. `DESIGN_VERIFIED`
does not mean rendered parity, product capability or independent visual approval.
Generic/shared references remain partial and missing exact references remain
gaps. HOLD/future designs do not authorize activation.

## Safety and reproducibility

Generated artifacts contain no execution timestamps. Prettier uses the repository
configuration. Running generation twice with unchanged inputs must write no files
on the second invocation. Do not edit generated outputs to resolve drift.

Run mutable legacy gate suites serially: some temporarily replace `.ai` inputs
with synthetic fixtures. Read-only catalog/design checks must wait for restoration.
New specification tests build isolated in-memory models and do not mutate the
canonical backlog. No hosted console, deployment, push or merge is part of this
phase. Phase 3.5 requires an actually approved specification readiness gate.
