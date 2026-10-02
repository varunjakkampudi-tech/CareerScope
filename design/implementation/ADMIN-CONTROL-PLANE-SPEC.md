# CareerScope Admin Control Plane — Approved Design Contract

Status: APPROVED / LOCKED VISUAL FOUNDATION

The Admin experience is a separate privileged control plane, not part of the normal candidate or recruiter workspace.

## Approved core areas
- Admin Dashboard
- User Management
- Recruiter Management
- User Details / account operations
- Jobs & Content
- CMS & Pages
- Analytics
- AI Models & Billing
- System & Server Monitoring
- Logs
- Audit Trail
- Feature Flags
- Integrations
- Settings

## CMS publishing contract
Production content changes must use controlled workflows:
Draft -> Preview -> Publish -> Version History -> Rollback.
Do not permit arbitrary direct production-database editing from the UI.
Record who changed what, when, why, and the outcome.

## User/admin operations
Use RBAC and least privilege. Destructive or high-risk actions require explicit confirmation, reason capture, authorization checks, and immutable audit records where appropriate.
Account deletion must respect retention, legal, security and recovery requirements rather than silently hard-deleting related records.

## Observability
Server/operations views should use real telemetry for CPU, RAM, disk, network, API health/latency/error rate, PostgreSQL, Redis, queue/workers, DLQ, storage, scheduled jobs, TLS, backup status and deployment provenance where implemented.
Never substitute generated dashboard numbers for telemetry.

## AI FinOps
Track provider/model, feature attribution, requests, tokens where available, latency, errors and actual provider cost where obtainable.
Support budgets/limits and controlled model enablement.
Never reveal API keys or secrets in plaintext. Use masked metadata and controlled rotate/replace/revoke workflows.

## Logs and audit
Operational logs and security/admin audit records are distinct.
Redact passwords, secrets, tokens, cookies, authorization headers and unnecessary PII.
Audit important mutations with actor, action, target, timestamp, reason, correlation/request ID, result and safe before/after metadata.

## Security and compliance
Every admin action is server-authorized; hiding a UI control is not authorization.
Require strong authentication for privileged accounts and support session revocation.
Use CSRF/origin protections where applicable, rate limits, encryption, secret management and least-privilege service credentials.
Consent, privacy/data requests, retention/deletion, recruiter visibility and external-provider compliance should be operationally observable.

## Recommended later operational screens
The approved board establishes the visual system. Extend it without redesign for:
- provider/source management
- queues/workers and DLQ/replay
- backup/restore verification
- security center
- privacy/consent/data-subject requests
- email/notification delivery
- incidents/maintenance
- scheduled jobs
- storage/resume operations
- releases/deployments
- CMS version history/rollback
- system configuration

## Data truth
All names, counts, revenue, costs, users, model names, percentages and statuses shown in the generated design are illustrative.
Production must render real data or explicit empty/unavailable states.

## Canonical authority
This board is authoritative for the Admin visual language and initial control-plane information architecture. It does not override the locked candidate, recruiter, auth, marketing, Interview, Courses or Certifications references.
