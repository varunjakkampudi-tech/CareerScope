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

Observed source validation: 464 entries, 409 files, 345 raster files, 345
decoded, zero zero-byte files, no unsafe traversal paths, 151 exact duplicate
content groups, and 14 implementation stages. Duplicate content was retained
because the handoff intentionally includes canonical boards, crops and
references.

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

## Final forensic reconciliation

### Source entries

The earlier baseline label of **410 files + 54 directories = 464 entries** was
an off-by-one classification. The captured extraction contained **409 regular
files and 54 child directories**; the 464th entry is the extracted handoff root
directory itself. Therefore the requested accounting is:

- `SOURCE_FILES_EXPECTED: 410` (the baseline's entry label)
- `SOURCE_FILES_ACCOUNTED_FOR: 410` = 409 regular files moved into `design/` +
  1 extracted root-directory entry, which is intentionally not tracked
- `SOURCE_FILES_MISSING: 0`

The 409 regular files are accounted for by unchanged moves except the source
root `README.md`. That README was reconciled into the permanent
`design/README.md` rather than copied as a second competing README. Its source
SHA-256 is `6cb57e52a0f364cd6b3eb4f042047b435cafb52afe126bc8def71313e6136b7d`
(the prefix recorded in `ASSET-INVENTORY.txt`); the final reconciled README is
`c85341bb507c45cb0765dc30c1433d920751aECB43259fbDEDE9a147568C75D6`.
The source README's guidance was preserved and expanded with the permanent
source-of-truth, hold, brand, and phase-boundary rules. No approved asset or
contract information was lost.

### Duplicate groups

The captured pre-import extraction analysis and the final permanent design tree
both produce **151 exact SHA-256 duplicate-content groups** when directories
are excluded. The earlier `152` value was a stale audit headline, not a
reproducible content result. Therefore:

- `SOURCE_DUPLICATE_GROUPS: 151`
- `FINAL_DESIGN_DUPLICATE_GROUPS: 151`
- `DUPLICATE_GROUP_DELTA: 0`
- `DUPLICATE_GROUP_DELTA_EXPLAINED: YES`

No approved duplicate path was removed. The README transformation changed one
unique source hash; it did not change a duplicate group. Canonical boards,
supporting crops, and reference copies remain intact.

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
