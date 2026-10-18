# Connected Accounts & Admin Integration Control Center

Status: APPROVED DESIGN / FUTURE R2-R3 / FEATURE-FLAGGED OFF UNTIL IMPLEMENTED AND AUTHORIZED.

## Candidate experience
Settings -> Connected Accounts supports a provider-neutral connection model for future email,
professional-network and job-portal integrations. UX covers connect/reconnect/disconnect, consent,
permissions, sync settings, activity/history, data/privacy controls, error/degraded states and mobile.

## Provider capabilities
Model integrations by explicit capabilities rather than assumptions, e.g.:
identity.read, profile.read, jobs.read, applications.read, messages.read,
notifications.read, email.read, email.send, webhooks.receive.

A provider exposes only capabilities actually implemented AND legitimately authorized.
Unavailable capabilities must be shown as unavailable/permission-required, not bypassed.

## Admin Integration Control Center
Admin can manage provider enablement, environment, approved capabilities/scopes, authentication mode,
callback metadata, sync cadence, retention, health, rate-limit state, webhooks, rollout/feature flags,
kill switch, errors and audit history.

## Credential security
Never display user OAuth access/refresh tokens, passwords, session cookies or provider secrets.
Secrets must be encrypted/managed outside ordinary CMS content. Admin UI exposes only masked metadata
and controlled rotate/replace/revoke/reconnect workflows. Server-side authorization is mandatory.

## Consent and privacy
Consent is granular, purpose-specific and revocable where applicable. Disconnect stops future sync.
Imported data follows documented retention/deletion rules. Users can inspect connection activity and
request applicable deletion/export. Audit consent/version changes without leaking sensitive payloads.

## External-provider compliance
LinkedIn, Naukri, Gmail, Outlook and any future provider are design targets, not guaranteed capabilities.
Implementation must verify current provider terms, API availability, licensing, scopes and approvals.
Do not use credential harvesting, stolen/replayed sessions or cookies, CAPTCHA bypass, access-control
circumvention, or unauthorized authenticated scraping.

## Data truth
Provider logos, connection counts, health percentages, user records and sync results in screenshots
are illustrative. Production renders actual provider state or explicit unavailable/unknown states.
