# Data model

PostgreSQL is the production database and Drizzle owns migrations. Core data
includes owner-scoped profiles/preferences, encrypted resume metadata and
processing state, provider jobs/provenance, saved jobs, searches, and explicit
application lifecycle/history records.

Candidate application records are stored in `saved_leads`. The optional
`application_evidence` JSON value records a candidate's own method, reported
timestamp, confirmation, source and confidence; it is not an employer/ATS
receipt. Status and evidence changes are recorded in `lead_history` under the
same owner and revision. Evidence is append-preserved across archive/restore
actions rather than treated as proof or deleted by those organizational
changes. New application lifecycle changes require a candidate-entered report;
legacy status records without evidence remain readable.

OTP authentication uses `email_otp_challenges` with a unique HMAC-derived email
key, HMAC code digest, expiry, attempt count and consumed timestamp. It does not
store the OTP or raw email in the challenge row. New-account acceptance is
versioned in `legal_acceptances`; optional marketing consent changes are an
append-only sequence in `marketing_consent_events`. These tables contain user
references and consent timestamps and must follow account deletion/retention
policy once that policy has been approved. `users.email_verified_at` is nullable
and set only in the same transaction that successfully consumes an OTP. Password
login and local/protected-staging test-account selection do not establish it.
The signal applies to the unchanged account email; a future email-change
implementation must verify the old and new addresses before updating it.
Migration `0020_secret_firebird.sql` introduces consent/challenge structures and
makes `users.password_hash` nullable for passwordless accounts;
`0021_email_verification_signal.sql` adds the nullable verification timestamp.
The schema does not itself constitute legal approval.

Ownership is derived from the authenticated server session, never from a
client-supplied owner identifier. Transactional outbox rows publish work to
isolated Redis queues; workers are idempotent and fenced. Retention and
deletion behavior is documented in [PRIVACY.md](PRIVACY.md).
