# Authentication

## Current source behavior

The executable API supports the private test-account selector only in its
explicit local or protected staging mode. It is rejected in production.
Production email OTP code exists behind `AUTH_OTP_ENABLED`; code availability is
not provider acceptance or production readiness. OTP and account registration
default off. Registration additionally fails closed unless approved, published
Terms and Privacy versions and URLs are configured. The repository's legal
files are counsel-review drafts and must not be published as approved policy.

When enabled, OTP codes are six digits, expire after five minutes, are single
use, allow at most five invalid attempts, and have a 60-second resend cooldown.
The API applies shared Redis limits by IP and HMAC-derived email identity. A
successful OTP records a server-owned `email_verified_at` timestamp and the
authenticated session returns that timestamp for the Account Security view.
Password authentication and the local/protected-staging test-account selector
do not create verification evidence. The timestamp is valid only for the
unchanged account email; no email-change route is currently implemented, so an
email-change flow must re-verify the old and new addresses and update this
evidence before it is added. OTP
challenge storage persists only an HMAC digest and normalized-address HMAC, not
the code or raw email. Verification creates the existing opaque server-side
session; its cookie remains HttpOnly, SameSite=Strict, scoped to `/api`, Secure
for HTTPS, and expires after eight hours. This implementation does not provide
refresh-token rotation/reuse detection, device sessions/revocation, verified-
signal account recovery, or the approved email-change flows.

The current adapter sends through Resend only. Provider failures return a
generic temporary-unavailability response. No real provider request, delivery,
sender domain, DNS record, deliverability, or tracking configuration has been
verified in this repository session. Approved v12 D11 also requires a separately
configured second provider behind a switch before launch; that fallback is not
implemented. Production sign-in therefore remains a launch blocker.

# Private test access

The application offers two configured test identities through the account
selector. Their identifiers and roles are defined once in
`packages/core/src/test-users.ts`. These are test identities, not verified
email addresses. There is no OAuth or hosted identity-provider integration in
the executable API.

Local development defaults to loopback access. `TEST_ACCESS_MODE=local` is
refused with a public origin or production runtime. Public origins default to
disabled test access. Hosted testing requires all of:

- explicit `DEPLOYMENT_ENVIRONMENT=staging`, HTTPS and `TEST_ACCESS_MODE=proxy`;
- a shared staging password enforced by Caddy's `basic_auth`;
- `CAREERSCOPE_STAGING_USER` and a bcrypt
  `CAREERSCOPE_STAGING_PASSWORD_HASH`, supplied privately by the operator;
- a random 32-byte hexadecimal `CAREERSCOPE_STAGING_PROXY_KEY`, shared only
  by Caddy and the API (`TEST_PROXY_SECRET`).

Caddy replaces the private assertion header after checking the staging
password and removes the Authorization header before proxying. The API checks
the assertion using constant-time digest comparison and accepts it only from
a loopback proxy peer. Database, queue and API ports remain private. The health
endpoint exposes only coarse health and version information and does not
require the staging password.

Generate the password hash interactively using Caddy's password-hashing tool;
do not put plaintext passwords in command arguments, examples, source or logs.
Store the hash and assertion in the protected host environment. The repository
does not supply a default staging password or deploy this configuration.

Selecting an account creates a random opaque server session stored as a hash.
Cookies are HttpOnly, SameSite=Strict and scoped to `/api`, with Secure on HTTPS.
Account switching revokes the previous cookie's session and clears private
client caches. Owner IDs always come from the server session. Origin and CSRF
validation still protect mutations, and session revocation remains available.

The admin test identity has its own workspace; it does not grant unrestricted
database access or implement an admin control plane. Conflicting pre-existing
account identities are refused instead of overwritten.

Password-account internals and their regression tests remain for compatibility
with existing stored accounts. The executable API always selects the explicit
test-access configuration, disables registration and refuses password changes.
This temporary testing arrangement is not public production authentication.

## Production prohibition

`DEPLOYMENT_ENVIRONMENT` accepts only `development`, `staging` or `production`.
If absent, a production Node runtime defaults to production; otherwise it defaults
to development. Unknown or empty values fail startup. Production permits only
disabled test access, even with a valid proxy assertion and loopback origin.
Staging never defaults to local selection. A production-built staging deployment
can explicitly select staging while retaining `NODE_ENV=production`; this is not
permission to activate test access in production.

The production Compose API pins deployment environment to production and test
access to disabled, independent of the operator's env file. It no longer consumes
the staging assertion for API login. Existing proxy password protection is not
removed. A separately reviewed private staging configuration must supply the
explicit staging environment and the existing password/assertion safeguards.
No hosted configuration or deployment was changed by this code update.

Production OTP must remain disabled until the owner has verified the Resend
domain/sender, approved and configured the required fallback, protected secrets,
obtained counsel approval for published legal text and versioned consent, and
authorized isolated provider acceptance. Do not restore a test shortcut to make
production appear operational. Local code and mocked tests do not complete the
approved authentication launch gate.
