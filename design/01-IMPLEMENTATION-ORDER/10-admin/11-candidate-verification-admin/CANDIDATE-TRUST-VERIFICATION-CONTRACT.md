# Candidate Trust & Verification — Approved Contract

Status: APPROVED DESIGN. Candidate profile-photo upload and admin-led verification are part of the
planned CareerScope trust system.

## State machine
UNVERIFIED -> PENDING -> IN_REVIEW -> VERIFIED
                         -> NEEDS_INFO
                         -> REJECTED
A rejected/needs-info candidate may resubmit through an explicit controlled workflow.

## Candidate
- Upload/change/remove profile photo subject to validation.
- See verification status and next step.
- Receive verification communication/status notifications.
- A verified badge is rendered ONLY from protected backend verification state.
- Candidate-editable profile fields can never create, preserve or forge verification.

## Admin/team verification
- Dedicated verification queue with least-privilege RBAC.
- Authorized team member reviews candidate data and initiates/records the verification call.
- Admin records structured outcome/reason plus minimal necessary notes.
- Actions: Approve & Verify, Request More Information, Reject.
- Every decision records verifier identity, timestamps, reason code, request/correlation context
  where available, and an immutable/auditable event.
- Re-verification/revocation must be explicit and auditable.

## Security/privacy
- Server/API authorization is authoritative; frontend controls are not authorization.
- Minimize PII displayed in queues and logs.
- Verification notes/call metadata require access control and retention rules.
- Do not store call recordings by default. If recordings are introduced later, require an explicit
  purpose, appropriate consent/legal basis, restricted access, retention/deletion policy and audit.
- Protect uploaded images against invalid type/size, malware where applicable, unsafe filenames,
  metadata leakage and unauthorized access.
- Never expose internal admin notes to candidates unless intentionally designed as user-facing text.

## Badge semantics
“Verified” means CareerScope completed its defined identity/profile verification procedure.
It must not imply employment verification, background-check clearance, skill certification,
government identity certification, or endorsement unless those are separately implemented and stated.

## Generated reference data
Names, phone numbers, dates, counts, call UI and email content in screenshots are illustrative.
Production uses real authorized data and explicit unavailable/error states.
