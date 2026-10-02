# Phase 0 design import report

## Baseline

- Branch: `main`
- Baseline commit: `35d2dd2b63473bccf770149058343258279ac64a`
- Baseline worktree: clean except for the user-provided untracked
  `CareerScope-Design-System/` source directory.
- Working branch: `phase-0/design-system-integration`

## Import result

The user-provided handoff directory was moved into `design/`. The previous
design README, concepts, static `home-variants` prototype, and builder were
archived under `design/archive/legacy-pre-approved-handoff/`. The empty source
directory was removed after its contents were moved. No root ZIP existed and
none was committed.

Initial local validation was superseded by the authoritative ZIP census below.
The source package contains 464 entries, 410 regular files, 54 directories,
345 raster files (341 PNG and four JPEG-family files), 345 decoded, zero
zero-byte files, no unsafe traversal paths, 152 exact duplicate-content
groups, and 14 implementation stages. Duplicate content was retained because
the handoff intentionally includes canonical boards, crops and references.

## Scope guard

Only design assets and design documentation were changed. Runtime source,
database, API, authentication, provider and deployment files were not edited.
The Phase 0 provenance, index and repository-hygiene baseline are the only new
engineering records. Phase 1 implementation work was not started.

## Validation commands

The import checks used existing repository tooling/runtime: PowerShell
filesystem counts and SHA-256 grouping, the existing `sharp` package for raster
decode, and repository checks listed in the final Phase 0 response. A clean
working tree and exact branch diff must be reviewed before any future merge.

## Final forensic reconciliation (corrected)

### Source entries

Previous Phase 0 verification incorrectly counted the handoff root directory as a regular file and incorrectly rejected the original 152-group duplicate audit. Independent ZIP verification confirmed 410 regular files, 54 directories and 152 source duplicate groups.

The corrected accounting is:

- `AUTHORITATIVE_SOURCE_ENTRIES: 464`
- `AUTHORITATIVE_SOURCE_FILES: 410`
- `AUTHORITATIVE_SOURCE_DIRECTORIES: 54`
- `INVENTORY_RECORDS: 410`
- `INVENTORY_FILES_ACCOUNTED_FOR: 410`
- `INVENTORY_FILES_MISSING: 0`

The exact missing logical record was the case-colliding
`foundations/DESIGN-TOKENS.md`. It was restored byte-for-byte from
`01-IMPLEMENTATION-ORDER/00-foundations-first/DESIGN-TOKENS.md`, whose hash
starts `c715b939d613f729`. The lowercase source record is preserved as
`foundations/design-tokens-foundations.md` because Windows cannot represent
both case variants in one directory. This is a proven Windows
case-insensitive extraction collision, not invented content.

The source root `README.md` was intentionally reconciled into the permanent
`design/README.md` rather than copied as a second competing README. Its source
SHA-256 is `6cb57e52a0f364cd6b3eb4f042047b435cafb52afe126bc8def71313e6136b7d`;
the final README is transformed (`2a50f947637f5250278e8bb14cade81296c8971e5adde4c0f207cba8c69903f5`)
and the transformation is documented in the canonical README/provenance
records.

### Inventory mismatches with explicit justification

The validator parsed all 410 records, accounted for all 410, and found no
missing file. Three repository records differ from their inventory hashes;
all three are now explained:

1. `README.md`: transformed into the canonical source-of-truth README.
2. `00-CODEX-START-HERE/IMAGE-CLARITY-AUDIT.csv`: normalized to LF under the
   explicit `*.csv text eol=lf` policy; the semantic CSV content is unchanged.
3. `ASSET-INVENTORY.txt`: expected prefix `128f84f045e6e603`, actual
   `6ee2c9737d2af302`. This file has not been changed by this correction.
   The owner independently verified that the original approved ZIP contains
   the same actual bytes/hash. This is
   `SOURCE_PACKAGE_KNOWN_SELF_HASH_EXCEPTION`, accepted without rewriting the
   inventory. It is not extraction corruption or an import defect.

All other records match their recorded SHA-256 prefix. The source-to-final
mapping classifications are: unchanged at the same relative path for the
remaining records, renamed for the case-colliding lowercase token record,
restored for the uppercase token record, and intentionally reconciled for the
README and CSV line-ending normalization. The inventory remains at its same
relative path with an explicitly accepted original-source self-hash exception.

The complete machine-readable comparison is
`SOURCE-INVENTORY-RECONCILIATION.json` in this directory. It contains all 410
source paths, final paths, expected hash prefixes, actual full SHA-256 hashes,
dimensions, mapping classifications, and the accepted source-exception flag.

The restored duplicate group has SHA-256
`c715b939d613f72983c1e05cc2e772c98150f1b6632e90a40f0c66de00ad25a3`.
Its source and final members are the implementation-order token contract and
the uppercase foundations token contract. Restoring the latter returns the
duplicate census from 151 to 152.

**Historical correction result:** commit `daeec38` reported FAIL pending
original ZIP comparison of `ASSET-INVENTORY.txt`. That uncertainty is resolved
by the owner's subsequent independent verification below; the earlier result
is retained as audit history.

### Final source-exception resolution

Approved ZIP SHA-256:
`56c14c37dba1f48f6d8754ced4fdbb110246837f6744d501efedf237e488f4ec`.
The owner independently inspected the original ZIP: all 410 inventory paths
were found, and all 409 non-self inventory hashes verified with zero invalid
non-self records. Local repository checks separately verify unchanged hashes,
the collision-safe rename, the intentional README transformation, and the
proven CSV CRLF-to-LF normalization.

- `KNOWN_SOURCE_EXCEPTION`: `ASSET-INVENTORY.txt` self-referential hash record.
- `STATUS`: ACCEPTED SOURCE-PACKAGE EXCEPTION.
- Recorded self-prefix: `128f84f045e6e603`.
- Actual approved-source and local prefix: `6ee2c9737d2af302`.
- `UNEXPLAINED_HASH_MISMATCHES`: 0.
- `SOURCE_PORTABILITY_EXCEPTION`: case-insensitive Windows pathname collision.
- `DATA_LOSS`: NONE; both distinct source token contents are preserved.
- `PHASE_0_FINAL_STATUS`: PASS.

The approved inventory remains byte-identical. No recursive self-checksum
rewrite was attempted. The accepted exception applies to its exact self-record
only; all other source hashes remain validated. The collision-safe rename is
retained on every platform, including case-sensitive Linux/macOS checkouts.

Final local verification on Node 24.19.0: `npm run node:check`,
`npm run format:check`, `npm run eol:check`, `npm run ticket:consistency`,
`npm run agents:check`, `npm run privacy:check`, and `git diff --check` each
returned exit code 0. The inline Node/sharp integrity validator also returned
0: 410 paths found; 407 direct repository hash matches, one documented README
transformation, one proven CSV normalization, and one accepted source
self-record exception; no unexplained mismatches. All 345 rasters were decoded
to pixel buffers and their dimensions matched the inventory (341 PNG, four
JPEG-family). The final tree contains 423 regular files: 410 accounted source
files, nine historical archive files, and four Phase 0 integration/audit files.
SHA-256 duplicate groups: 152. Zero-byte files, unsafe paths, competing roots,
missing index references, and Phase 1 ticket assignments: all zero.

### Correction verification

- Inventory: 410 records / 410 accounted / 0 missing.
- Raster: 341 PNG + 4 JPEG-family = 345; 345/345 decoded; 345 dimensions
  matched the inventory.
- Duplicate groups: source 152 / final 152 / delta 0.
- Zero-byte regular files: 0.
- Unsafe paths: 0.
- Competing design roots: 0.
- Design index: 14 records, 0 missing references, 0 ticket assignments.

### Duplicate groups

The authoritative source has `152` exact SHA-256 duplicate-content groups.
After restoring the case-colliding token file and preserving the second token
record under a collision-safe name, the source-equivalent final design set
also has `152` groups. `DUPLICATE_GROUP_DELTA: 0` and
`DUPLICATE_GROUP_DELTA_EXPLAINED: YES`. The README transformation, LF
normalization are intentional, documented content changes. The inventory hash
exception is accepted based on the original ZIP verification; no raster or
approved board was discarded.

### Required correction statement

Previous Phase 0 verification incorrectly counted the handoff root directory as a regular file and incorrectly rejected the original 152-group duplicate audit. Independent ZIP verification confirmed 410 regular files, 54 directories and 152 source duplicate groups.

### `.gitattributes`

The only Phase 0 line added was:

```diff
+*.csv text eol=lf
```

The handoff includes the tracked `IMAGE-CLARITY-AUDIT.csv`. Without an explicit
CSV rule, the repository's line-ending gate could not govern that file. The
rule affects CSV text files only, normalizes checkout line endings to LF, does
not change binary classification, and does not alter application source files.

### `.gitignore`

The only Phase 0 rule added was:

```diff
+CareerScope-Design-System*.zip
```

It ignores only an external handoff ZIP; it does not ignore `design/`, approved
rasters, canonical references, or ordered implementation stages.

### Archived legacy paths

All nine pre-Phase-0 design files were moved and are tracked as renames:

1. `design/README.md` -> `design/archive/legacy-pre-approved-handoff/README.md`
2. `design/build-refined-dark.mjs` -> `design/archive/legacy-pre-approved-handoff/build-refined-dark.mjs`
3. `design/concepts/ChatGPT Image Sep 19, 2026, 04_02_55 PM.png` -> `design/archive/legacy-pre-approved-handoff/concepts/ChatGPT Image Sep 19, 2026, 04_02_55 PM.png`
4. `design/concepts/ChatGPT Image Sep 19, 2026, 04_03_40 PM (1).png` -> `design/archive/legacy-pre-approved-handoff/concepts/ChatGPT Image Sep 19, 2026, 04_03_40 PM (1).png`
5. `design/concepts/ChatGPT Image Sep 19, 2026, 04_03_41 PM (2).png` -> `design/archive/legacy-pre-approved-handoff/concepts/ChatGPT Image Sep 19, 2026, 04_03_41 PM (2).png`
6. `design/concepts/ChatGPT Image Sep 19, 2026, 04_03_41 PM (3).png` -> `design/archive/legacy-pre-approved-handoff/concepts/ChatGPT Image Sep 19, 2026, 04_03_41 PM (3).png`
7. `design/home-variants/index.html` -> `design/archive/legacy-pre-approved-handoff/home-variants/index.html`
8. `design/home-variants/refined-dark.html` -> `design/archive/legacy-pre-approved-handoff/home-variants/refined-dark.html`
9. `design/home-variants/refined-dark.js` -> `design/archive/legacy-pre-approved-handoff/home-variants/refined-dark.js`

Repository-wide reference search found no runtime imports of these files. The
archive README marks them non-canonical; historical documentation references
are explicitly labelled historical.
