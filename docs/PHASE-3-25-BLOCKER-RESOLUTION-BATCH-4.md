# Phase 3.25 — Seven-Ticket Blocker-Resolution Batch

Date: 2026-10-09  
Starting commit: `40f2c6d9bc4b89ce033adb42c7f51209611ca598`  
Branch: `phase-3.25/cloud-continuation`

This is a specification-only, local review artifact. It does not implement
runtime behavior, promote tickets, push, merge, deploy, or claim hosted/live
evidence.

## Result

The seven requested tickets were processed to their maximum defensible state.
No ticket was promoted or approved solely because it was selected for this
batch.

| Ticket | Final state                                          | Blocker disposition                                                                                                                           |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| CS-40  | OWNER_DECISION_PROPAGATED / SECURITY-DESIGN GATE     | Existing Admin Control Plane decision propagated; exact per-surface permission/projection contract and approved admin design remain required. |
| CS-44  | OWNER_DECISION_PROPAGATED / EXTERNAL + OWNER GATE    | Cognito recovery direction is decided; sender/domain/secret approval and CS-59 proxy rate-limit dependency remain.                            |
| CS-49  | DESIGN_PARTIAL_NON_BLOCKING                          | Existing dashboard/shell authority is sufficient; release assignment remains an owner question.                                               |
| CS-50  | OWNER_INPUT_REQUIRED                                 | Owner must choose whether the ATS-style interview timeline is part of CareerScope tracking.                                                   |
| CS-51  | DESIGN_PARTIAL_NON_BLOCKING                          | Existing Jobs/Saved/Applications/Dashboard surfaces are sufficient; release assignment and declared CS-70/CS-75 dependencies remain.          |
| CS-61  | DESIGN_NOT_APPLICABLE                                | Cache ownership change has no new visual UX; release assignment remains an owner question.                                                    |
| CS-75  | DESIGN_NOT_APPLICABLE / ARCHITECTURE REVIEW RECORDED | API-client response-body lifecycle is a local module concern; release assignment remains an owner question.                                   |

## Source-backed decisions and contracts

### CS-40

`docs/OWNER-DECISIONS-2026-10-02.md#CS-40` establishes a dedicated privileged
Admin Control Plane with server-enforced least-privilege RBAC. The approved
roles are Owner, Platform Admin, Support, Content Editor, Recruiter Operations,
Security Auditor and Billing Viewer. UI hiding is not authorization; destructive
operations require confirmation, reason and audit event; arbitrary database
editing and secret/token/cookie/password return are prohibited; operational logs
and immutable security audit events remain separate.

This resolves the direction needed by CS-88, but it does not invent endpoint
projections or role grants. CS-40 remains gated on the exact per-surface
permission/data-projection contract, redaction/audit review and approved admin
design.

### CS-44

`docs/OWNER-DECISIONS-2026-10-02.md#CS-44` decides against a second bespoke
email-token recovery system. Cognito is the target identity architecture; the
non-enumeration, expiry, single-use, replay, throttling and safe-link
requirements transfer to Cognito. Until activation, the existing authenticated
password-change and operator recovery paths remain; no fake forgot-password
route is authorized.

Remaining blockers are exact sender/domain/secret approval and CS-59's
proxy-layer client-IP/rate-limit correction. No recovery implementation or
provider evidence is claimed here.

### CS-49

The ticket's existing dashboard implementation and the Phase 0 candidate-core
shell provide a sufficient parent surface. Loading, empty and error states are
derived from the shared state contract; metrics remain API-backed and the AI
panel remains disabled/unavailable. This is `DESIGN_PARTIAL_NON_BLOCKING`, not
new design approval. The source registry still has no release assignment, so
the narrow remaining question is whether this already implemented route is
`RELEASE_1_ACTIVE` or another explicitly named release state.

### CS-50

The source explicitly requires owner confirmation. The narrow question is:

> Should CareerScope track an owner-entered application lifecycle using the
> existing four statuses and dated history, without an ATS-style multi-stage
> interview timeline, or should the product adopt the full ATS-style timeline
> shown in the supplied Applications designs?

The safer recommendation is the reduced truthful scope: retain candidate-owned
manual tracking, do not fabricate interview events, and do not add a new
sub-stage/notes-history schema until explicitly approved. This recommendation
is not treated as owner approval.

### CS-51

The behavior crosses existing `/jobs`, `/saved`, `/applications` and dashboard
surfaces. The Phase 0 parent surfaces and existing safe empty/error treatments
are sufficient; the ticket introduces URL/query propagation, not a new visual
surface. It is therefore `DESIGN_PARTIAL_NON_BLOCKING`. CS-70 and CS-75 remain
declared dependencies. Release assignment is still absent from the source
registry.

### CS-61

The ticket changes owner-scoped React Query keys, the opaque session owner
digest and cache teardown defense-in-depth. It adds no route, component, copy,
layout or visual state, so it is `DESIGN_NOT_APPLICABLE`. The source registry
still lacks a product release assignment.

### CS-75

The owning boundary is `apps/web/src/lib/api.ts`; `apps/web/src/lib/api.test.ts`
contains the stream-backed 400/404 cancellation regression coverage. The
architecture impact is local-module only: consume/cancel unread non-409 response
bodies before throwing, preserve structured 409 handling, and introduce no
database, event, queue or persistence contract. Authentication, CSRF/origin,
ownership and rate limiting remain server responsibilities; response bodies,
cookies, tokens and private payloads must not be logged. No visual surface is
changed, so design is `DESIGN_NOT_APPLICABLE`. Release assignment remains
unset.

## Owner input required

| Ticket | Exact question                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| CS-44  | Approve the Cognito recovery sender/domain and secret-handling boundary after CS-59, or keep recovery disabled until that evidence exists? |
| CS-49  | Assign the already implemented dashboard route to `RELEASE_1_ACTIVE`, `RELEASE_1_DEFAULT_OFF`, or another explicit release state.          |
| CS-50  | Choose reduced truthful manual tracking or the full ATS-style interview timeline described above.                                          |
| CS-51  | Assign the identifier/deep-link fixes to an explicit release state after CS-70/CS-75 evidence.                                             |
| CS-61  | Assign owner-scoped cache isolation to an explicit release state.                                                                          |
| CS-75  | Assign the response-body cancellation fix to an explicit release state.                                                                    |
| CS-40  | Approve the exact per-surface role/projection matrix and admin design before CS-88 proceeds.                                               |

## Generated-state evidence

After the policy classifications were recorded:

- design counts: `DESIGN_NOT_APPLICABLE 73`, `DESIGN_PARTIAL_NON_BLOCKING 6`,
  `DESIGN_GAP 4`
- open findings: `261` (down from `265`)
- approved specifications: `127` (unchanged)
- mapped ACs: `500` (unchanged)
- invalid dependencies: `0`
- dependency cycles: `0`
- workflow statuses: unchanged

Generation was run twice; the second run reported `changedFiles: 0`.

## Explicit non-claims

No owner input was manufactured. No Cognito, hosted database, proxy, browser,
visual, production, or deployment evidence was fabricated. This artifact does
not make Phase 3.25 complete or create a seven-ticket approval batch.
