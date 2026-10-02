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
