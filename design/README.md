# IMPORTANT — CODEX/COPILOT START HERE

Use `00-CODEX-START-HERE/MASTER-IMPLEMENTATION-ORDER.md` and then `01-IMPLEMENTATION-ORDER/`.
Do not choose screenshots ad hoc from the archive.

# CareerScope Design System

`design/` is the permanent, tracked source of truth for the approved CareerScope
visual handoff. It is reference material only: production routes do not load
screenshots, HTML, or design documentation at runtime.

Phase 0 imported the reviewed handoff from the repository-local
`CareerScope-Design-System/` drop into this directory. The import evidence is
in [SOURCE-PROVENANCE.md](SOURCE-PROVENANCE.md), and the machine-readable
surface map is [DESIGN-INDEX.json](DESIGN-INDEX.json).

## Start here

- `MANIFEST.txt`
- `ASSET-INVENTORY.txt`
- `00-CODEX-START-HERE/MASTER-IMPLEMENTATION-ORDER.md`
- `01-IMPLEMENTATION-ORDER/00-foundations-first/`
- `01-IMPLEMENTATION-ORDER/13-engineering-contracts/`
- `tooling/design-audit/PHASE-0-IMPORT-REPORT.md`

## Visual source of truth

- `canonical/brand/`
- `canonical/auth/`
- `canonical/onboarding/`
- `canonical/app/`
- `canonical/marketing/`

The handoff precedence is `01-IMPLEMENTATION-ORDER/`, then `canonical/`, then
the written contracts, then `page-references/`, composite references, and
supporting foundations/assets. Illustrative screenshot data never overrides
real product data or the current runtime contract.

## Supporting references

- `page-references/` contains individual page crops extracted from approved multi-page boards.
- `approved-images/` retains approved full screenshots/boards.
- `references/` retains handoff copies.

The `future-releases/` material is design-approved but intentionally held for
later releases. HOLD means the visual reference may inform architecture, but a
route or capability must not be presented as implemented until its real
backend, authorization, data and tests exist.

## Assets

- `assets/icons/PRODUCTION-ICON-MAP.md`
- `assets/icons/ICON-SYSTEM.md`
- `assets/auth/ASSET-REQUIREMENTS.md`
- `foundations/design-tokens.md`

Generated screenshots are visual references. Production behavior and real data
must remain truthful. The package explicitly does not contain every isolated
logo/vector/icon source asset; do not fabricate missing source exports.

## Archived material

`archive/legacy-pre-approved-handoff/` contains the pre-Phase-0 exploratory
prototype, concepts and builder. It is retained for history and is not a
canonical design source or runtime dependency.

## Phase boundary

Phase 0 establishes the source-of-truth package and evidence only. It does not
implement routes, redesign the application, change APIs, or approve production
release. Follow the ordered handoff and contracts during the separately
authorized implementation phase.
