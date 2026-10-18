# Architecture

CareerScope is a modular monolith with asynchronous workers. The browser is
served by Next.js and calls Fastify; PostgreSQL is the system of record and
Redis/queues carry bounded asynchronous work.

## System context

```mermaid
flowchart LR
  Browser --> Caddy --> Web[Next.js]
  Caddy --> API[Fastify API]
  API --> DB[(PostgreSQL)]
  API --> Redis[(Redis)]
  API --> Files[(Encrypted private storage)]
  API --> Outbox[Transactional outbox]
  Outbox --> Publisher --> Queue[Private persistent Redis queue]
  Queue --> Workers[Search and file workers]
  Workers --> Providers[Provider adapters]
  Providers --> Workers
  Workers --> DB
```

## Runtime containers

```mermaid
flowchart TB
  Edge[Caddy] --> Web[Next.js web]
  Edge --> API[Fastify API]
  API --> Postgres[(PostgreSQL)]
  API --> Redis[(Redis)]
  API --> Outbox[(Outbox)]
  Publisher[Publisher] --> Queue[Queue]
  Outbox --> Publisher
  Queue --> Search[Search worker]
  Queue --> Files[Resume/file worker]
  Search --> Providers[Job providers]
  Search --> Postgres
  Files --> Storage[Encrypted storage]
```

## Job discovery

```mermaid
flowchart LR
  SearchRequest[User search] --> API
  API --> Tx[Profile/search transaction]
  Tx --> Outbox[Outbox]
  Outbox --> Publisher --> Queue --> Worker[Search worker]
  Worker --> Adapters[Provider adapters]
  Adapters --> Normalize[Normalize and provenance]
  Normalize --> Dedupe[Deduplicate]
  Dedupe --> Match[Deterministic matching]
  Match --> DB[(PostgreSQL)]
  DB --> Stream[SSE/API]
  Stream --> UI[Web UI]
```

## Authentication

```mermaid
sequenceDiagram
  participant B as Browser
  participant C as Caddy staging gate
  participant A as Fastify
  participant S as Session store
  B->>C: Shared staging password over HTTPS
  C->>A: Verified private proxy assertion
  B->>A: Select an allowlisted test account
  A->>S: Create opaque hashed session
  A-->>B: HttpOnly Secure SameSite cookie
```

## Trust boundaries

```mermaid
flowchart LR
  Internet((Internet)) --> Edge[Caddy boundary]
  Edge --> App[Web/API boundary]
  App --> Data[(PostgreSQL)]
  App --> Cache[(Redis)]
  App --> Workers[Private workers]
  Workers --> Providers[External providers]
  App --> Storage[Encrypted resume storage]
  Edge --> Access[Private staging access boundary]
```

Sessions, CSRF/origin checks, owner-derived authorization, rate limiting and
redacted structured logs protect each boundary. Provider integrations are
configuration-gated and never receive session secrets or unnecessary PII.

## Data flow

Profile and preferences plus a private resume produce a frozen matching input.
Searches discover jobs with provenance; deterministic matching produces
explainable evidence. Users save jobs and explicitly record application
history. External application destinations never create a submitted event.
