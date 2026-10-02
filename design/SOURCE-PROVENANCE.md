# Design source provenance

## Phase 0 import

- **Observed source:** repository-local `CareerScope-Design-System/` handoff
  directory present before import on 2026-10-02.
- **Permanent location:** `design/`.
- **Source archive:** no root design ZIP was present; no source archive was
  added to Git.
- **Observed package shape:** 464 filesystem entries (409 files and 54
  directories plus the source directory), 345 raster files, and 14 ordered
  implementation stages.
- **Integrity:** all 345 raster files decoded successfully with the existing
  repository `sharp` dependency; no zero-byte files were found. Exact-content
  hashing found 151 duplicate-content groups. Duplicates are retained because
  the package inventory deliberately preserves board/crop/reference copies.

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
