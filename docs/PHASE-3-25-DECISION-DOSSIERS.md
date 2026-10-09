# Phase 3.25 Decision Dossiers

This record classifies the three highest-readiness incomplete specifications at
the `4bfb0e8` checkpoint. It does not change workflow state, authorize runtime
implementation, or represent hosted/provider evidence.

## CS-2 — 768px saved-workspace geometry

**Disposition:** `DESIGN_BLOCKING` for whole-ticket approval; the owner
decision retaining the frozen 768 CSS-pixel criterion is already resolved.

**Evidence reviewed:**

- `.ai/backlog.json#CS-2`
- `docs/OWNER-DECISIONS-2026-10-08.md#CS-2`
- `design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png`
- `design/01-IMPLEMENTATION-ORDER/00-foundations-first/DESIGN-TOKENS.md`
- `design/01-IMPLEMENTATION-ORDER/00-foundations-first/ACCESSIBILITY-RESPONSIVE-LOCALIZATION-CONTRACT.md`
- `apps/web/src/app/(app)/saved/page.tsx`
- `scripts/check-ui.ts`

The Phase 0 corpus provides the saved-jobs page context and deterministic
responsive rules, but it does not provide an approved element, state and
numeric expected geometry for the named 768px header-offset assertion. The
responsive contract therefore cannot supply a product-specific expected value
without invention. The historical 390px virtualizer correction is separate and
does not satisfy the 768px criterion.

**Current result:** no whole-ticket review or approval. The ticket remains
blocked on a UX/product-approved 768px target geometry and then exact-SHA
browser evidence. No runtime change is made here.

## CS-17 — candidate-controlled dismissal

**Disposition:** `OWNER_DECISION_REQUIRED`; no repository source selects the
domain representation.

**Evidence reviewed:**

- `.ai/backlog.json#CS-17`
- `.ai/blocker-classification.json#CS-17`
- `docs/tickets/CS-17.md`
- `.ai/ticket-specification-policy.json#ticketRefinements.CS-17`

The unresolved product question is whether dismissal is a candidate-owned lead
status or a separate reversible discovery disposition. The specification
already fixes the shared invariants: it must remain separate from the Applied,
Interviewing, Offer, Rejected and Withdrawn lifecycle; it must be owner-scoped;
and no route/schema or persistence claim may be made before the representation
is chosen.

**Owner input required:** choose one representation and define restore/reset
semantics. Until then, the common Save/Apply behavior is specifiable, but the
dismissal-specific contract cannot honestly be approved.

## CS-88 — Admin Control Plane design and release

**Disposition:** `DESIGN_BLOCKING` plus `EXTERNAL_GATE` for release metadata;
not eligible for whole-ticket approval.

**Evidence reviewed:**

- `.ai/backlog.json#CS-88`
- `.ai/backlog.json#CS-40`
- `.ai/backlog.json#CS-6`
- `docs/OWNER-DECISIONS-2026-10-02.md#CS-40 / CS-88 — admin authorization and admin UX`
- `design/implementation/ADMIN-CONTROL-PLANE-SPEC.md`
- `design/01-IMPLEMENTATION-ORDER/10-admin/README.md`
- `design/01-IMPLEMENTATION-ORDER/11-admin-production-operations/README.md`
- `design/DESIGN-INDEX.json`

Approved boards establish visual context, but they do not establish the
server-enforced admin role, page-by-page read/write/redaction matrix, exact
queue/outbox/storage states, or responsive interaction contract. CS-40 is the
hard authorization prerequisite. The release target and activation state also
remain unspecified in the source registry.

**Required before review:** one immutable design/contract revision accepted by
the owner/design authority; the CS-40 RBAC and redacted-data contract; and
independent UX, Product Architect, System Designer and Security dispositions.
No admin route, endpoint, privileged data access, mutation or production
activation is authorized by this phase.

## Phase boundary

These classifications are not implementation blockers for unrelated tickets.
They are not converted into fabricated owner decisions, design approvals or
hosted evidence. The three tickets remain incomplete until their stated gates
are satisfied.
