# Production & Operations — Approved Design Contract

Status: APPROVED / LOCKED.

This board extends the CareerScope Admin Control Plane and closes the major production-state design gaps.

## Covered
Security Center; Privacy & Data Requests; Job Sources & Providers; Queue/Worker/DLQ Management;
Backups & Restore; Email & Notification Management; Deployments & Releases; Scheduled Jobs;
System Status & Health; Integrated Logs; Feature Flags; component states; system/error states;
responsive mobile examples; accessibility controls; legal/policy controls.

## Non-negotiable implementation rules
- Every privileged action requires server-side authorization; UI visibility is never authorization.
- Destructive/high-risk operations require confirmation, reason capture and auditability.
- Secrets, tokens, cookies, authorization headers and unnecessary PII are redacted.
- Provider/source configuration records permitted access, terms/compliance state, provenance and kill switch.
- Queue retry/replay preserves idempotency, fencing and duplicate-effect protections.
- Backup restore is elevated, audited and followed by restore/integrity verification.
- Deployments retain provenance and safe rollback.
- Privacy export/deletion/consent changes use controlled workflows and applicable retention constraints.
- Feature flags have ownership, environment, rollout/kill-switch behavior and audit history.
- Monitoring uses real telemetry or explicit unavailable states; never generated metrics.
- Legal/compliance UI must not claim certification or compliance merely because a checklist exists.

## System states
Provide accessible canonical states for 404, 403, 500, maintenance, offline/network failure,
session expiry, empty data and no-results scenarios.

## Accessibility
Keyboard operation, visible focus, semantic structure, accessible forms/tables/dialogs,
screen-reader labels, contrast, reduced-motion support, error association and responsive reflow
are implementation requirements. Validate them; do not hard-code unsupported “compliant” badges.

## Canonical authority
This board is authoritative for production/admin operational screens and states. Existing locked
Candidate, Recruiter, Interview, Admin core, Auth, Marketing, Courses and Certifications references
retain authority over their respective surfaces.
