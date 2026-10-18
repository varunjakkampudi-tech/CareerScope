# CareerScope

CareerScope is a candidate-controlled job discovery and application-tracking
product. It combines deterministic resume/job matching with provenance-aware
provider adapters, saved jobs, and an explicit application lifecycle.

## Stack

- Next.js 16, React 19, TypeScript, App Router and TanStack Query
- Fastify 5, PostgreSQL/Drizzle and Redis
- Transactional outbox, publisher and asynchronous search/file workers
- Encrypted private resume storage, Caddy and Docker
- Passwordless test-account selection with opaque server sessions; hosted tests require a private password-protected proxy

## Development

```powershell
npm ci
Copy-Item .env.example .env
npm run services
npm run db:migrate
npm run build
npm start
```

Use Node 24 or newer. Do not commit `.env` or any provider credentials.
`npm run services` starts the local PostgreSQL/Redis dependencies; migrations
are run with `npm run db:migrate` when the local environment is configured.

## Checks

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:domain
npm run privacy:check
npm run security:check
npm run build
```

Service-backed integration and browser checks require the local services and
browser dependencies. They must be reported as not executed when those
dependencies are unavailable.

## Documentation and design

Authoritative product and engineering documentation lives under `docs/`.
Approved visual references are preserved under `design/canonical/`,
`design/brand/`, `design/foundations/`, and `design/assets/`. The responsive
Next.js application is the only CareerScope web client.

## Deployment

Deployment is manual and guarded. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). This repository cleanup does
not deploy, change DNS, or alter production data.
