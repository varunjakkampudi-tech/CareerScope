# Phase 3.25 remediation ledger

This authored ledger supplements the generated quality audit; it does not own
ticket status or duplicate mutable specifications. Specification source remains
`.ai/ticket-specification-policy.json`. Original audit findings are retained.

Checkpoint: `2c37f25a52d7d4635c5cf7ecc2f0068a0cf9c111`; initial approved
specifications: 0/216. This review batch is CS-62–CS-71. Only the reviewed
subsets below are dispositioned; unfinished batch members remain OPEN.

| Ticket      | Finding                                                                    | Disposition                              | Evidence / next step                                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CS-67       | Historical AC1 asks for a Blocked column                                   | RECLASSIFIED                             | Later frozen Phase 3 contract supersedes that interpretation. Preserve source AC; specification requires six stages plus blocker metadata/filter/summary.                             |
| CS-67       | Component-only verification promised browser execution proof               | RESOLVED                                 | Actual independent reviewer required browser procedure, visible warning text and absent execution sentinel; corrected binding was independently approved. Execution remains PLANNED.  |
| CS-71       | Unsupported extraction confused with no content                            | Specification clarified                  | Actual deriveTitles discriminator and deriveFields propagation traced; paired non-English/English/empty test named. Source presence is not current execution evidence.                |
| CS-71       | Language expansion could leak into scope                                   | Specification clarified                  | ROLE_WORDS unchanged baseline comparison planned. CS-64 language choice remains separate; no new language support implemented.                                                        |
| CS-70       | Weak cross-owner fixture could miss a reachable join regression            | RESOLVED IN PLAN; INDEPENDENTLY REVIEWED | Both owners have separately owned jobs/leads sharing a fingerprint with both cross-owner directions. Corrected binding approved independently; execution remains PLANNED.             |
| CS-70       | Labeled SaveJob has no aria-pressed                                        | OUT-OF-SCOPE RUNTIME DEFECT              | apps/web/src/components/saved-leads.tsx, labeled return path. Future AC2 browser binding requires persisted accessible state before click; no runtime fix during specification phase. |
| CS-70       | Lookup errors are not surfaced and do not disable save                     | OUT-OF-SCOPE RUNTIME DEFECT              | Same component: neither variant renders existing.error; disabled conditions omit lookup error. AC2 defines future honest failure state, not passing current behavior.                 |
| CS-62       | Required discriminator exists, visual copy/icon enforcement remains frozen | OPEN                                     | ui-states.tsx uses three reasons including awaiting-input, but no visual difference. Reconcile actual call-site inventory and design freeze before approving whole spec.              |
| CS-63/65/68 | Historical wrapper/review-file names are not canonical current paths       | OPEN                                     | Preserve frozen source ACs; plan canonical root launcher/EOL/test-registration checks without recreating obsolete wrapper or review.txt.                                              |
| CS-64       | Language choice vs already implemented status reporting                    | OPEN                                     | Do not invent language vocabulary. Search remaining owner decision sources and isolate genuine choice from CS-71's existing reporting contract.                                       |
| CS-66/69    | Boundary sanitization / shared evidence requirements                       | OPEN                                     | Actual dimension constructor and tracked baselines located; individual bindings and full review still required.                                                                       |

All reviewed bindings retain `testStatus: PLANNED`. Binding approval is not whole
spec approval. Release assignment/activation findings for reviewed legacy
tickets remain open; no release choice is inferred from historical UAT status.
No runtime implementation, ticket promotion, host action, push, merge or
deployment is authorized or performed by this ledger.

## Continued content review from 13b801de

Individually authored and independently reviewed verification plans now cover
CS-1, CS-3, CS-5, CS-6, CS-7, CS-9, CS-10 and CS-12 in the continuing initial
ticket batch. Twenty-four additional ACs have twenty-five exact PLANNED
procedures; CS-9 AC2 separates registration and service-backed execution.
Current total:41/906 reviewed ACs,43 planned procedures,865 unmapped.
All630 original findings remain:609 OPEN,14 RESOLVED,7 RECLASSIFIED.
Whole-spec approved count remains0/216; none of these scoped binding receipts
is whole-content approval. Architecture/design/release findings are not erased.

| Ticket | Source reconciliation / independent finding                                                                                                                                              | Disposition                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| CS-1   | Historical every-push wording means current configured main pushes/PR/manual; old version wrapper and test-case totals are not restored                                                  | Reviewed planned contract; current hosted proof still required by eventual DoD                                         |
| CS-3   | Stable network-anchor solves namespace ownership; monitor fixture is not live crash evidence; application publication excludes private service ports, management SSH separately approved | Reviewed planned local/live procedures; no host operations                                                             |
| CS-5   | PostgreSQL owner/archive export and six-field public projection require actual SQL test, not pure projection-only tests; copied module-root output prevents canonical snapshot mutation  | Reviewed planned integration and clean-checkout parity                                                                 |
| CS-6   | Cached authenticated refetch is not cold pending; intercepted anonymous session does not revoke server cookie; instrument actual private features                                        | Corrected and independently re-reviewed planned browser setup                                                          |
| CS-7   | Historical override and arbitrary-ref dispatch superseded by current no-bypass/manual/main contract; source-hash-bound actual workflow DAG is required for non-shipping hosted harness   | Reviewed planned contract; no override added                                                                           |
| CS-7   | Jobs independently checkout moving main without propagating checked SHA                                                                                                                  | OUT-OF-SCOPE RUNTIME DEFECT, NOT FIXED; future implementation must pin/carry exact validated revision through all jobs |
| CS-9   | Six historical files expanded to nine; source registration differs from executed service coverage and downstream browser/axe results                                                     | Separate contract/integration bindings approved; Redis everysec/maxmemory readback is specified future evidence        |
| CS-10  | Explained unresolved redundancy cannot replace actual approved role consolidation; justified all24 retention is valid                                                                    | Corrected DoD and AC3 independently re-reviewed                                                                        |
| CS-12  | Observed non-editing cannot prove enforced read-only grants; selected platform invocation/permissions require real evidence                                                              | Reviewed planned operator proof, not claimed current capability enforcement                                            |

Reviewed binding hashes and actual review rounds are preserved in REVIEW-01.
No historical CI ID is represented as current execution. These are future
implementation acceptance requirements, not runtime changes or release readiness.

### Continued CS-11 content review

CS-11's five ACs now have six independently reviewed PLANNED procedures. The
review preserves DESIGN_PARTIAL for static job-list mapping; imported marketing
home does not establish exact static surface/state approval. Local accesslint
skill guidance exists, but available audit engine capability does not, and no
audit ran. AC5 separates source projection/allowlist/no-build assertions from
actual browser automatic request origins; legitimate user-opened posting links
are not prohibited or interpreted as Applied. Review01 records real correction
and content-bound hashes.

Updated totals:46/906 reviewed ACs,49 planned procedures,860 unmapped;
608 OPEN,15 RESOLVED,7 RECLASSIFIED original findings. Whole-spec approval
remains0/216. No other design gap/partial or release finding is silently closed.

### CS-2 vertical specification pass

Starting checkpoint: `c713a9def9f7f440761f542f9f5b73b8901326d8`.
The source record confirms three separate facts: the 768px Linux WebKit
header-offset criterion was not reproduced by the recorded Chromium/Firefox
measurements and WebKit failed earlier at 390px; a distinct 390px virtualizer
row-overlap issue was root-caused and historically fixed; the current canonical
surface is `/saved` via `SavedLeads`, not the removed legacy `LeadTable`.

Authored a ticket-specific CS-2 refinement covering current route/module
boundaries, no API/data mutation, private test fixtures, narrow-screen and
keyboard constraints, CI provenance and a fail-closed procedure for all three
frozen ACs. The current saved-jobs screenshot was inspected; it is approved page
context but contains no 768px sticky-header geometry. Design remains
`DESIGN_GAP`, and source `releaseTarget: 3.0.1` is preserved while the
projection's `releaseState: UNSPECIFIED` is not misrepresented as activation.
`docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md` records the single genuine scope
decision and its evidence dependencies. Backlog status/ACs,
workflow-migration evidence and runtime files were not edited.

The first scoped independent pass returned REVISE; it required aligning the
AC3 procedure with a WebKit-only 768px assertion, while retaining the full
three-engine suite, and explicitly mapping historical `check-ui.mjs` AC text to
the current `scripts/check-ui.ts` / `npm run test:ui` path in the checklist.
Those corrections are applied. The independent reviewer approved the authored
CS-2 content after re-review; this is not a whole-ticket approval. CS-2 remains
DRAFT and is excluded from all approval counts due to the genuine scope and UX
gates. The exact AC procedures remain `PLANNED`; no browser/hosted run was
executed. Source release target `3.0.1` is preserved; unspecified activation is
not counted as another owner decision.

Validation on Node `v24.19.0`: `npm run tickets:spec:generate` PASS with zero
changed files on the final run; `npm run tickets:spec:check` PASS at 216
tickets / 906 ACs / 52 authored procedures / 49 criteria with previously
reviewed procedures / 860 unmapped ACs; `npm run tickets:spec:test` PASS, 46
tests, zero failures/skips/cancellations/todos. An earlier concurrent test run
overlapped a policy correction and failed on an intermediate invalid-section
snapshot; a subsequent serial run exposed the stale authored-binding count,
which was corrected, and the final serial Node 24 run passed. The first
interrupted Node 22 duplicate run is not validation evidence. Whole-spec
approval remains `0/216`; no ticket promotion, push, merge, deployment or
runtime implementation occurred.
