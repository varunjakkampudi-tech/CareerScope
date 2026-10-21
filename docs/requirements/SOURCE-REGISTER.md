# Approved engineering source register

Owner-approved on 20 October 2026. SHA256 identifies the supplied document bytes,
including their original line endings. These are source identities, not evidence
of built functionality. Full supplied documents remain in owner-controlled storage;
no private local paths or other-product engineering status are published here.

| ID     | Approved source                                                        | SHA256                                                           |
| ------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| SRC-01 | CareerScope-v12.md                                                     | 35E9A728A65B0620CB9075345216C69C973FEE57EFAD21752554DC338A532167 |
| SRC-02 | CareerScope-Engineering-Standards.md                                   | C860202371BCDAD55258D39A3F5E474355FC013462A9E97CE4AB046E5A034A76 |
| SRC-03 | CareerScope-Goal.md                                                    | D186DBD4A3A93F622FDDD23D23010FB1AF185C87E0B4947C8085B7898D402395 |
| SRC-04 | Viswatra-Global-Engineering-Quality-Standard-v1.1.md (including CR-01) | 429B54C2003D8E5BF4A2949507F5A8A2C5284820F6588C4B1E3266FE18112066 |
| SRC-05 | Viswatra-Global-Engineering-Completion-Program-v1.1.md                 | 9421280DAC8D38DACCD26378D378A862751F7DCC9BB0D8392A408CB50A1F90EC |

SRC-01 governs scope and D1–D14. SRC-02 stack choices remain PROPOSED until checked
against actual code; preserving the existing compatible stack is the initial
recommendation, not permission for unrelated rewrites. SRC-03 defines autonomous
execution; SRC-04/05 add quality controls without expanding the product.

An agent lacking the complete source must request access; this summary/register
does not replace the documents. A hash change requires reconciliation, not silent
inheritance of approval. Product decisions, legal/provider permissions, actual CI,
hosted evidence and production GO are separate from this approval.

## Later owner-approved CareerScope revisions

OA-2026-10-20-02 records the owner's subsequent explicit approval of revised
CareerScope source documents. The source bytes were available in the owner-supplied
document set and SHA256 was recomputed on 21 October 2026. These are additive
source identities; the original SRC-01 through SRC-05 entries and snapshots remain
unchanged historical evidence.

| Revision  | Approved document                                                | SHA256                                                           |
| --------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| SRC-01-R1 | source-revisions/2026-10-20/CareerScope-v12.md                   | ECB3A40AC0E8BC532BAFF6E6897D9C4FE962C9B25516B65449814B83B2A25214 |
| SRC-02-R1 | source-revisions/2026-10-20/CareerScope-Engineering-Standards.md | 52F78F94123091DFAD411D9DD0662635834DBBF381561AFE937ADBC72EABD25F |
| SRC-03-R1 | source-revisions/2026-10-20/CareerScope-Goal.md                  | AA0EA656B12FA62DA2AA64AC5D5A455542B964A56BFDA0B055133E1EACA69112 |

CareerScope v12 R1 is the currently approved product reference and base scope,
including D1–D14. Clauses inside any approved document that are explicitly marked
`PROPOSED` or `PENDING_OWNER_APPROVAL` are not silently promoted by approval of
the document identity. SRC-04/05 remain approved global v1.1 controls under
OA-2026-10-20-02. Both the original sources and R1 CareerScope revisions are
retained as repository snapshots. The `requirements:check` verifies all six
CareerScope snapshots. `V12-REQUIREMENT-INVENTORY.json` remains the historical
319-item inventory tied to the original v12 snapshot. The additive
`V12-R1-REQUIREMENT-INVENTORY.json` is hash-bound to SRC-01-R1 and deterministically
enumerates 518 substantive Markdown content blocks across the approved sections
and supplemental material. It exact-text-links 297 historical items and points
to the reviewed reconciliation for the remaining 22. It classifies 340 blocks
as approved-base text, 120 as pending amendments, 47 as scope-reconciliation
required, 6 as source conflicts requiring reconciliation, 1 as an owner/external
gate, and 4 under an unavailable source reference. All remain
NOT_ASSESSED/NOT_RUN; these are source-content counts, not feature, test,
implementation, or completion counts. Generated inventory validation is part of
`requirements:check` and `requirements:test`. Requirement-to-test/implementation
traceability remains open under SOURCE-REVISION-01; do not infer implementation
or launch readiness from source approval.

The three CareerScope documents now have immutable canonical snapshots beside this
register. v12 and Engineering Standards retain the exact supplied SHA256. Goal's
CRLF line endings were normalized to repository LF and Markdown two-space hard
breaks converted to equivalent backslash hard breaks, and a final LF appended;
its canonical SHA256 is
`11e61b5b28d2e5bfc736ebfa9e0272b7ee5f2996233db0ea75bdc1ae06daf9c9`.
That exact deterministic transformation was compared against the approved original
with no wording changes. The original Goal hash remains the approved identity.
`npm run requirements:check` enforces canonical snapshot integrity. These snapshots
are not editable working plans; changes require explicit source reconciliation.
