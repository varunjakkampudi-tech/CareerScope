# Phase 3.25 local validation ledger

Observed on 2026-10-02 using bundled Node 24.19.0. Source Phase 3 commit:
`ba60388f049f3cc173098f1b88f8f7a69357d4c9`. Specification tooling commit:
`854cae56d7be90d65f1d3583cd27f409a6a30d8e`. Generated artifact commit is the
subsequent local checkpoint; obtain its exact SHA from Git and the final response.

This is local evidence, not hosted CI or readiness approval.

| Command                            | Observed result                                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run gates:test`               | PASS, exit 0; includes privacy, release/deployment fixture gates, workflow, agile, state readers, agents, Engineering, rendered board and promotion checks |
| `npm run tickets:spec:test`        | PASS, 29 tests, zero failures/skips/todos                                                                                                                  |
| `npm run tickets:spec:generate`    | PASS; deterministic projection of all 216 draft specifications                                                                                             |
| `npm run tickets:spec:check`       | PASS; exact artifact bytes and frozen source inputs validate                                                                                               |
| `npm run tickets:spec:ready`       | FAIL as required: 216 incomplete specifications, open findings and independent REVISE disposition; not a completed phase                                   |
| `npm run workflow:check`           | PASS, 216 tickets and 37 orthogonal blockers                                                                                                               |
| `npm run workflow:test`            | PASS, 4 tests                                                                                                                                              |
| `npm run agile:gate:test`          | PASS, all positive/negative gates proven                                                                                                                   |
| `npm run blockers:check`           | PASS, 37 blockers and 15 host-pending actions                                                                                                              |
| `npm run ticket:consistency`       | PASS, 216 consistent tickets                                                                                                                               |
| `npm run design:coverage:check`    | PASS, existing 127 screen references and Phase 1 mappings preserved                                                                                        |
| `npm run engineering:test`         | PASS, 221 tests                                                                                                                                            |
| `npm run engineering:browser:test` | PASS, 1 rendered workflow scenario; not human accessibility approval                                                                                       |
| `npm run typecheck`                | PASS, including 45 canonical test files                                                                                                                    |
| `npm run lint`                     | PASS, root and web workspace                                                                                                                               |
| `npm run format:check`             | PASS after correcting generator configuration and formatting the authored model guide                                                                      |
| `npm run eol:check`                | PASS, including staged generated artifacts                                                                                                                 |
| `npm run test:domain`              | PASS, 830 tests in 29 files                                                                                                                                |
| `npm run privacy:test`             | PASS, 3 tests                                                                                                                                              |
| `npm run privacy:check`            | PASS with generated artifacts staged and included in tracked-file scanning                                                                                 |
| `npm run agents:check`             | PASS                                                                                                                                                       |
| `npm run checks:registry`          | PASS, 81 existing executable checks classified; new specification commands are documented local phase commands, not new hosted lanes                       |
| `git diff --check`                 | PASS during this checkpoint                                                                                                                                |

## Failures encountered and corrected

- Two initial read-only checks overlapped an existing mutable fixture gate and
  saw temporary synthetic backlog records. `ticket:consistency` and
  `design:coverage:check` failed. Both were rerun serially after restoration and
  passed. No canonical ticket correction was needed; future runs must serialize.
- Initial generated per-ticket Markdown failed formatting because the generator
  used Prettier defaults instead of repository settings. The generator now reads
  `.prettierrc.json`; formatting and deterministic generation pass.
- Stronger null-content tests initially failed for missing source impact notes
  in CS-62–CS-81. Draft requirements now explicitly disclose those absent
  assessments and retain individual findings, without inventing an assessment.
- Independent review identified a sequencing prefix-match defect. Exact ticket
  ID extraction and a named CS-1/CS-13 regression corrected it; independent
  re-review confirmed rejection.

The promotion checker still emits existing Release 1 findings in its advisory
mode: 34 blocking and 23 advisory findings across 70 UAT tickets. Exit zero is
not Release 1 certification. No assertion, privacy/security check or promotion
rule was weakened.

## Reproducibility and remaining gates

The automated determinism test compares two complete generated output maps and
formatted bytes. Actual repeated generation and check also report zero changed
files for unchanged inputs. The final post-commit rerun checks the clean tree.

Source acceptance criteria: 906. Suggested methods: 906. Exact reviewed test or
manual-procedure bindings: 0. Unmapped criteria: 906. Complete reviewed
specifications: 0/216. The 276 graph edges comprise 269 registry HARD edges and
seven explicitly sourced CS-47 SEQUENCING edges; cycles and invalid edges are
zero. There are 23 primary Epics with no orphan tickets.

Independent whole-phase review: REVISE. Details and corrections are recorded in
PHASE-3-25-INDEPENDENT-REVIEW.md. All remaining ticket-specific gaps, owners and
required evidence are enumerated in PHASE-3-25-QUALITY-AUDIT.md and the generated
coverage JSON. This is a resumable checkpoint, not a final completion claim.

No runtime product implementation, status promotion, hosted action, push, merge
or deployment occurred. Phase 3.5 remains unauthorized by the readiness gate.
