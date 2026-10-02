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
  Phase 0 provenance/index records and the archived pre-approved handoff. Its
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

The pre-Phase-0 concepts/prototype/builder were moved to
`archive/legacy-pre-approved-handoff/` and are not runtime dependencies. This
import changed design documentation/assets only; it did not change application
routes, API, database, authentication, providers, or deployment.

## Source-integrity correction

The 410 source records in `design/ASSET-INVENTORY.txt` reconcile to 410
available final files. The source package contained both
`foundations/DESIGN-TOKENS.md` and `foundations/design-tokens.md`; those names
collide on Windows extraction. The uppercase source file was restored from the
byte-identical implementation-order copy, while the lowercase source file was
renamed to `foundations/design-tokens-foundations.md` so both source records
remain represented without a case-insensitive filesystem collision.

The final source-equivalent duplicate census is 152 groups. The source README
is intentionally transformed into the canonical `design/README.md`; the CSV
hash difference is proven CRLF-to-LF normalization. The inventory's own
recorded hash remains unexplained without the original ZIP bytes. Source
integrity acceptance remains blocked by that comparison.
