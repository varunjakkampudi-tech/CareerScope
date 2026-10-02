# Repository hygiene baseline — Phase 0

This record establishes the post-import baseline for the approved CareerScope
design source. It is not a certification of the full repository's code quality,
architecture, dependency health, security, accessibility, performance,
production readiness, or release status.

## Phase 0 boundary

- `design/` is the single tracked design source of truth.
- Pre-Phase-0 exploratory design material is explicitly archived under
  `design/archive/legacy-pre-approved-handoff/`.
- No application, API, database, authentication, provider, infrastructure, or
  deployment code was changed by this phase.
- The handoff's future-release and HOLD references remain non-implementing
  design guidance.
- Design duplicates are inventory-preserved; they are not an invitation to
  delete visually useful board/crop/reference evidence.

## Future cleanup rule

Further repository cleanup must be tied to an identified ticket, finding, or
explicit owner request. Do not perform broad cosmetic deletion, dependency
upgrades, route redesign, or generated-asset cleanup as a side effect of Phase 0. Any Phase 1 implementation must use the ordered handoff and its contracts,
then add implementation-specific tests and evidence.
