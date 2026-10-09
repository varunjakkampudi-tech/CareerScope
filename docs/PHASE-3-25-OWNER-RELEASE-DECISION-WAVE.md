# Phase 3.25 Owner / Release Decision Wave

Status: local decision-resolution evidence, not implementation or release approval.

Checkpoint: `61eadf21f6d199085e6c378f6e95908522ca4e49`

This dossier records the review of the seven queue items from the owner decision
wave. It does not change workflow status, runtime code, deployment configuration,
or production evidence.

## CS-40 — Admin Control Plane

Repository authority already establishes a dedicated privileged Admin Control
Plane, server-enforced least privilege, seven role names, no arbitrary database
editor, redacted data, explicit confirmation/reason/audit for risky actions, and
separate operational versus immutable audit logs. It does **not** establish the
per-surface read/create/update/delete/execute, PII, audit projection and
mutation matrix requested by CS-40, nor a complete admin design boundary.

Disposition: `OWNER_INPUT_REQUIRED`.

Exact question: approve the page/role/projection matrix for the named admin
surfaces, including which roles may view minimized PII, view audit data, mutate
user data, mutate system configuration, or execute an operation. If no role may
perform a capability, record `DENY_ALL`; do not infer permissions from UI
visibility. The answer must also identify whether impersonation is prohibited
or separately specified.

Impact: CS-88 remains dependency-partially-resolved. Its visual references can
be mapped, but no admin endpoint or privileged UI can be implementation-ready
until this matrix exists. No secrets, tokens, raw resumes or unrestricted
personal data are permitted.

## CS-44 — Cognito recovery

The existing owner decision rejects a second bespoke email-token system and
selects Cognito as the target, while preserving authenticated password change
and operator recovery until activation. Non-enumeration, expiry, single-use,
replay rejection and throttling belong in the Cognito contract. The exact
production sender address/domain, SES access, secret-store reference and
rotation evidence are not present and must not be invented.

Disposition: `SPECIFICATION_PARAMETERIZED; FUTURE_ACTIVATION_CONFIGURATION`.

The specification can name a verified CareerScope domain identity as the sender
target, inject the concrete From/Reply-To and provider secrets through the
approved environment/secret store, redact all logs, return non-enumerating
responses, and keep the capability default-off until CS-59 and provider/domain
evidence pass. The concrete sender/domain value is an external activation gate,
not a reason to fabricate a route or secret in Phase 3.25.

## CS-49 — Dashboard route

The route and data contract are source-backed, and Phase 0 establishes the
shared shell/state/responsive system. The source registry does not assign a
release target or activation state.

Disposition: `OWNER_INPUT_REQUIRED`.

Exact question: classify CS-49 as `R1` specification scope with
`IMPLEMENT_NOW`, `R1` specification scope with `RELEASE_1_HOLD`, or a later
release. If held, name the gate owner and evidence required to remove the hold.
UAT status and local browser evidence do not answer this release-metadata
question.

## CS-50 — Application tracking scope

Current owner direction in this wave selects
`REDUCED_TRUTHFUL_MANUAL_APPLICATION_TRACKING`, not a full ATS-style interview
timeline. Candidate-entered status, milestone, notes and server timestamps are
authoritative. Employer-side stages, recruiter events, AI-derived transitions
and provider synchronization remain unknown unless a separately authorized
verified provider capability exists. Opening an external URL never means
Applied.

Disposition: `OWNER_DIRECTION_PROVIDED_BY_CURRENT_TASK; SPECIFICATION_UPDATE_REQUIRED`.

This is a product-scope decision supplied in the current owner instruction, not
retroactively claimed as an existing repository receipt. The next content pass
must propagate the exact contract into CS-50, bind its four ACs, perform an
independent whole-ticket review, and obtain explicit release assignment before
approval. No runtime implementation or activation is claimed here.

## CS-51 — Identifier propagation

The deep-link behavior and dependencies are source-backed. CS-75 is locally
specified; CS-70 remains an external/service-backed verification dependency.
The source registry still has no release target.

Disposition: `DEPENDENCY_PARTIALLY_RESOLVED; OWNER_INPUT_REQUIRED`.

Exact question: classify the specification as `R1` with `RELEASE_1_HOLD`
pending CS-70, or assign a later release. It must not be `RELEASE_1_ACTIVE`
while CS-70 remains unverified and the release owner has not assigned a target.

## CS-61 — Owner-scoped cache isolation

The cache isolation contract is local-module/security work: owner-derived
opaque cache identity, owner-scoped query keys, teardown invalidation as
defense-in-depth, no client-selected ownership, and no new visual surface. The
source registry does not assign a release target.

Disposition: `OWNER_INPUT_REQUIRED`.

Exact question: classify this implementation-ready specification as `R1`
implementation scope with a separate hosted/security evidence gate, or assign
a later release. `DESIGN_NOT_APPLICABLE` is resolved; it is not a reason to
hold the ticket.

## CS-75 — API response-body lifecycle

The owning boundary and security contract are recorded in the policy: consume
or cancel unread non-409 bodies before throwing, preserve structured 409
handling, keep server authentication/CSRF/origin/ownership authoritative, and
never log credentials, cookies or private payloads. No database/event/queue
contract is introduced. The source registry does not assign a release target.

Disposition: `OWNER_INPUT_REQUIRED`.

Exact question: classify this local API-client hardening as `R1`
implementation scope with normal exact-SHA evidence, or assign a later release.
Its specification does not activate a provider or grant authorization.

## Decision and dependency summary

| Ticket | Decision status                                       | Remaining gate                                   | Downstream impact                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| CS-40  | Existing authority propagated; matrix unresolved      | Owner permission/projection matrix               | CS-88 remains partially gated                                |
| CS-44  | Parameterized Cognito contract                        | CS-59 plus sender/domain/provider evidence       | Recovery activation remains default-off                      |
| CS-49  | Not determined by repository                          | Owner release assignment                         | No runtime activation claim                                  |
| CS-50  | Current owner direction resolves product-scope choice | Specification update, review, release assignment | Removes the ATS-vs-manual ambiguity only                     |
| CS-51  | Dependencies explicit                                 | CS-70 verification plus release assignment       | Cannot be active while CS-70 is open                         |
| CS-61  | Design and technical contract resolved                | Release assignment                               | No UI design blocker                                         |
| CS-75  | Technical/security contract resolved                  | Release assignment                               | Candidate to unblock CS-51 once release semantics are chosen |

No ticket was promoted. No existing review receipt was rewritten. No hosted,
provider, browser, accessibility or production evidence is claimed.

## Next closure pool

The next candidates are ordered by source-backed readiness, not by ticket
number or approval-count pressure:

1. CS-75 — local API-client contract already recorded; only release assignment and exact AC/whole-ticket review remain.
2. CS-61 — cache-isolation contract and design-N/A disposition are recorded; release assignment and exact review remain.
3. CS-51 — deep-link contract is implemented and reviewed in source evidence; CS-70 service evidence and release assignment remain.
4. CS-49 — dashboard route/data/design contract is source-backed; release assignment and exact review remain.
5. CS-50 — product scope is now explicit from the current owner direction; contract propagation, bindings, review and release assignment remain.
6. CS-44 — Cognito recovery can be parameterized; CS-59 and sender/domain/provider evidence remain.
7. CS-40 — existing RBAC principles are explicit; the exact role/projection matrix remains an owner gate.
8. CS-38 — dashboard freshness/real-data contract, pending current binding and whole-ticket review.
9. CS-39 — adjacent candidate-core route/state contract, pending current binding and review.
10. CS-62 — architecture/security refinement candidate after the current dependency gates.
11. CS-64 — source-backed candidate-core contract candidate after exact binding review.
12. CS-129 — implementation-readiness review candidate once its surface-specific findings are reconciled.
13. CS-130 — implementation-readiness review candidate once its surface-specific findings are reconciled.
14. CS-132 — implementation-readiness review candidate once its surface-specific findings are reconciled.

The first four still require release-owner decisions; the queue must not claim
they are active until those decisions are recorded in the canonical owner
decision chain.
