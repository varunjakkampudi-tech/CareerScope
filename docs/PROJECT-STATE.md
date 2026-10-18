# CareerScope project state

This document describes the current repository, not historical phase work.

## Product

CareerScope is a candidate-controlled job discovery and application tracker.
It collects provider postings, scores them with deterministic matching, and
lets the owner save jobs and track application status. Opening an external
application URL never marks an application as submitted.

## Architecture

The repository is one workspace: Next.js/React web, Fastify API,
PostgreSQL/Drizzle, Redis, transactional outbox and asynchronous workers.
Resume files are private, encrypted and owner-scoped. Queues use isolated Redis
with persistence and database fencing. Test accounts are selected explicitly;
hosted test access requires the shared staging password at the proxy. No cloud
identity provider is integrated.

## Repository boundaries

- `apps/` executable web, API and workers
- `packages/` shared domain libraries and provider adapters
- `infra/` Docker, Caddy and deployment configuration
- `scripts/` development and operational checks
- `docs/` authoritative product and engineering documentation
- `design/` approved visual source material

## Release and deployment

GitHub Actions workflows and Dependabot automation have been removed at the
owner's request. Validation is currently local; no hosted CI runs automatically.
Deployment tooling remains manual and exact-revision gated;
this cleanup does not deploy or change hosted infrastructure. Hosted revision,
provider configuration, backup/restore and human accessibility checks must be
verified separately before production release.

## Source of truth

Current behavior is defined by source, tests, migrations and the documents
linked from [docs/README.md](README.md). Historical reports are not active
workflow or runtime configuration.
