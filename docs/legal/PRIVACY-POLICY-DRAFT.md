# CareerScope Privacy Notice — Counsel Draft

**DRAFT — NOT APPROVED, NOT A LEGAL OPINION, AND MUST NOT BE PUBLISHED OR
USED TO ENABLE REGISTRATION.** This is a code-grounded technical inventory,
not a determination of lawful basis, jurisdiction, retention compliance,
cross-border transfer status, or regulatory applicability.

## Service and controller identity

CareerScope is a candidate-owned career workspace. **[OWNER/COUNSEL: identify
the controller/business entity, geographic address, privacy contact, applicable
jurisdictions, and any required grievance or representative contacts before
publication.]**

## Information processed by the current application

The implementation stores or processes the following categories:

- **Account and authentication:** email address for email-code sign-in when
  enabled; short-lived OTP challenges; hashed session-token values; session
  expiry; and authentication/rate-limit metadata. OTP codes are not stored in
  plaintext. The challenge database stores a keyed email digest and keyed code
  digest. Redis counters use bounded keys and expiry.
- **Career profile and preferences:** candidate-entered profile fields, skills,
  target roles, location and work preferences, and matching inputs.
- **Resume and derived information:** uploaded resume files, parsing state,
  extracted text and derived skill/title/experience data. Resume content is
  private application data; exact storage location, retention, backups, and
  deletion behavior must be confirmed against the selected deployment.
- **Job search and saved opportunities:** search requests, job listing data and
  source/provenance metadata, saved-job state, notes, and matching snapshots.
- **Application tracking:** user-entered status, notes, dates, next actions, and
  supporting evidence. External link visits do not create an Applied event.
- **Optional marketing preference:** a separate opt-in/out event is recorded
  when that preference endpoint is enabled. The current implementation records
  consent state; it does not itself send marketing campaigns.
- **Operational security data:** request identifiers, route templates, status
  codes, durations, and coarse authentication outcome. Request bodies, OTPs,
  cookies, authorization values, provider response bodies, and raw resume text
  must not be written to structured application logs.

## Email provider and verification codes

When explicitly enabled, the API sends a verification message through Resend
using the configured product sender. The recipient address and message content,
including the one-time code, are necessarily transmitted to that email
processor. CareerScope sends no resume, profile, application, session, or
password data in this message. Resend account ownership, domain verification,
provider terms, subprocessors, tracking settings, and actual delivery have not
been independently verified by this repository change. The OTP capability is
disabled by default; do not treat this draft as proof that live sending is
active.

## Infrastructure and other providers

PostgreSQL stores application data; Redis supports rate-limit and queue
operations. Deployment hosting, data-region placement, backup destinations,
operator access, service retention, and provider subprocessors depend on the
actual selected environment and require operator evidence. Job-source providers
are governed by source-specific permission profiles; unknown rights remain
unknown. The API currently reports AI disabled in its session contract; any
future provider transfer must be reviewed and disclosed before activation.

## Cookies and local storage

Authentication uses an opaque server-side session represented by an HttpOnly,
SameSite=Strict cookie, scoped to `/api` and marked Secure on HTTPS. The raw
session secret is not persisted in the database. **[COUNSEL: determine whether
a separate cookie notice is required for the deployed product.]** No analytics
or advertising cookie is introduced by this change.

## Purpose, retention, rights, and deletion

The code supports authentication, the candidate workspace, requested
discovery, application tracking, security controls, and operational recovery.
This repository does not establish a complete product-wide retention schedule,
account deletion workflow, identity-verification process for rights requests,
or provider-specific deletion confirmation. OTP challenge records expire after
five minutes and a bounded cleanup runs on API startup and every fifteen
minutes while the process is running; this does not define retention for account
or product records. **[OWNER/COUNSEL/OPERATOR: define retention, deletion,
legal holds, rights-request process, backup expiry, and provider deletion
evidence.]**

## Security and sharing

The application uses server-derived ownership, encrypted resume storage,
restricted sessions, request-origin/CSRF controls, scoped rate limits, and
redacted structured logging where configured. These are implementation
descriptions, not a certification or an unconditional promise that data is
never shared. Data is shared with infrastructure and processors necessary for
the enabled service, including the email provider when OTP is activated. The
actual list and terms require verification for the deployment.

## Marketing communications

Marketing consent is separate from account and security communications and is
unchecked by default. Registration does not imply marketing consent. The
current code records opt-in/out changes, but no campaign sender is implemented
by this authentication change. Any future marketing use requires a reviewed
purpose, message process, unsubscribe behavior, and provider/data-flow review.

## Items requiring human/legal completion

- Confirm legal entity, privacy contact, jurisdiction, and required notice
  language.
- Confirm actual hosting, data regions, processors/subprocessors, email
  processing terms, and cross-border transfers.
- Approve purpose/lawful basis, retention, deletion, rights request, backup
  expiry, and legal-hold policies.
- Determine age restrictions, breach/grievance obligations, and language
  requirements.
- Confirm cookie notice requirements and actual analytics configuration.
- Review exact deployed behavior and publish a versioned notice before enabling
  registration.

## Approval gate

This draft is not served by a public route. `LEGAL_POLICIES_APPROVED` must remain
false and `REGISTRATION_ENABLED` must remain false until the owner and qualified
counsel approve and publish a versioned notice, verify its URL, and authorize
the protected configuration change.
