# Design source provenance

## Phase 0 import

- **Observed source:** repository-local `CareerScope-Design-System/` handoff
  directory present before import on 2026-10-02.
- **Permanent location:** `design/`.
- **Source archive:** no root design ZIP was present; no source archive was
  added to Git.
- **Authoritative source package shape:** 464 ZIP entries: 410 regular files
  and 54 directories. The package contains 345 raster files (341 PNG and four
  JPEG-family files), all of which decode successfully with the existing
  repository `sharp` dependency; no zero-byte files were found. Exact SHA-256
  hashing of the source package found 152 duplicate-content groups.
- **Final tree distinction:** the permanent `design/` tree also contains
  provenance and index records. Its
  file count and duplicate-group count must not be substituted for the source
  package census above.

## Authority and limitations

The ordered implementation handoff is authoritative for sequencing, followed
by `canonical/`, the written contracts, `page-references/`, and supporting
references. Screenshot copy and metrics are illustrative; runtime data and
existing product contracts always win. HOLD and future-release semantics are
preserved. The package explicitly does not contain every isolated logo/vector,
favicon, mountain-artwork, icon, or third-party brand source export; those
assets must not be fabricated.

The pre-approved concepts/prototype/builder have been removed because they
were superseded and had no runtime consumers. The approved
import changed design documentation/assets only; it did not change application
routes, API, database, authentication, providers, or deployment.

## Source-integrity correction

The original import reconciled 410 source records. That is historical import
evidence, not a current file-count or hash assertion. Redundant import reports,
source inventories and obsolete prototypes were removed during repository cleanup;
implementation guidance was renamed to neutral paths. Approved visual references
remain available. The source package contained both
`foundations/DESIGN-TOKENS.md` and `foundations/design-tokens.md`; those names
collide on Windows extraction. The uppercase source file was restored from the
byte-identical implementation-order copy, while the lowercase source file was
renamed to `foundations/design-tokens-foundations.md` so both source records
remain represented without a case-insensitive filesystem collision.

The final source-equivalent duplicate census is 152 groups. The source README
is intentionally transformed into the canonical `design/README.md`; the CSV
hash difference is proven CRLF-to-LF normalization.

## Final independent source verification

The owner independently verified the original approved ZIP directly and
provided the following byte-level evidence on 2026-10-02. This is source
verification supplied by the owner, distinct from locally executed checks.

- Approved ZIP SHA-256:
  `56c14c37dba1f48f6d8754ced4fdbb110246837f6744d501efedf237e488f4ec`.
- Source census: 464 entries, 410 regular files, 54 directories, 345 rasters,
  and 152 duplicate-content groups.
- Inventory: 410 records and 410/410 paths found in the ZIP.
- All 409 non-self inventory hashes verified against the original ZIP;
  invalid non-self records: 0.
- `SOURCE_PACKAGE_KNOWN_SELF_HASH_EXCEPTION`: `ASSET-INVENTORY.txt`.
  Its recorded self-hash prefix is `128f84f045e6e603`; the actual approved
  source prefix is `6ee2c9737d2af302`, which matches the repository file.
  This was an original source-package inconsistency, not an import defect.
  The inventory is no longer maintained as an active repository manifest.
- Unexplained hash mismatches: 0.

A manifest that includes its own hash changes bytes when that record is
updated. The accepted exception applies only to this exact source self-record;
it does not exempt other records from validation.

`SOURCE_PORTABILITY_EXCEPTION`: case-insensitive Windows pathname collision.
Both distinct token contents are preserved using the mapping above, with no
data loss. The mapping applies on Linux and case-sensitive macOS as well, so
the canonical checkout remains portable and references remain unambiguous.
