# Deployment

Production tooling supports a manually initiated, exact-revision deployment behind Caddy.
Only the intended edge ports are public; API internals, PostgreSQL, Redis and
workers remain private in the Docker network. Deployment configuration lives
under `infra/` and is validated by the guarded deployment checks.

Before a release, verify a clean reviewed revision, green CI for that exact
revision, migrations, readiness/health, TLS, worker/outbox health, backup and
restore evidence, and rollback viability. This repository cleanup performs no
deployment, DNS, Hostinger or production-database changes.

GitHub Actions CI, deploy, load and release workflows were removed at the owner's
request. There is no hosted deployment entry point. The retained CI requirement
refuses deployment without successful evidence for the exact revision; local
tests do not replace that evidence. Restore an approved CI and deployment process
before attempting another production deployment.
