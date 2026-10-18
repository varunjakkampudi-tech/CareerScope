# Security controls and validation boundaries

CareerScope currently supports private local/hosted testing. Hosted access is
protected by a staging password at Caddy and a private assertion checked by the
API. Test selection accepts only the two server-defined identities. Read
[Authentication](AUTHENTICATION.md) before configuring a hosted test site.

The following controls remain in source:

- opaque random sessions stored hashed, HttpOnly/SameSite cookies and HTTPS Secure cookies;
- session-derived ownership, owner-scoped queries and composite ownership constraints;
- strict Origin checks, CSRF validation and bounded request/rate budgets;
- private encrypted resume files, bounded isolated parsing and typed capacity errors;
- transactional outbox delivery and fenced, idempotent worker effects;
- private persistent Redis queues with AOF and `noeviction`, independent of cache eviction;
- strict CSP, frame/object/base restrictions and redacted structured request logs;
- private network topology with only the intended edge ports published.

The proxy removes Basic Authorization before forwarding and overwrites the
staging assertion header. Cookie, Authorization, assertion, password and token
fields are redacted. Never log provider bodies, resumes or environment values.
Do not weaken the secret scanner when removing an integration: credential
detectors remain useful even when the corresponding cloud SDK is absent.

Historical SQL migrations remain because existing databases depend on their
ordered journal. Their identity-related columns do not reactivate a provider.
Do not replace applied migrations with a new baseline on a deployed database.

Run `npm run gates:test`, `npm run test:integration`, `npm run test:domain`,
browser checks and `npm run security:check` against the current source.
The production dependency audit currently reports three moderate entries in the
DOCX parser chain (mammoth/argparse/sprintf-js), with no high/critical findings.
The full development dependency audit additionally reports five high and four
moderate entries in lint/schema tooling. These are unresolved audit findings,
not a clean bill of health. npm's proposed fixes include breaking downgrades;
none are applied automatically to silence the report.

Local tests are separate from live TLS/firewall validation, hosted staging
password acceptance, restore drills and manual screen-reader review. No current
live-security certification is asserted by this document.
