# Data model

PostgreSQL is the production database and Drizzle owns migrations. Core data
includes owner-scoped profiles/preferences, encrypted resume metadata and
processing state, provider jobs/provenance, saved jobs, searches, and explicit
application lifecycle/history records.

Ownership is derived from the authenticated server session, never from a
client-supplied owner identifier. Transactional outbox rows publish work to
isolated Redis queues; workers are idempotent and fenced. Retention and
deletion behavior is documented in [PRIVACY.md](PRIVACY.md).
