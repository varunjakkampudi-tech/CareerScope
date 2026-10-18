# Application tracking

`/applications` uses the shared saved-job workspace and owner-scoped lead API.
It filters persisted records to `applied`, `interviewing`, `offer` and
`rejected`. `/saved` shows `saved` and `archived` records. Both surfaces use
the same revision-controlled notes, status updates and history.

The current persisted status vocabulary is `saved`, `applied`, `interviewing`,
`offer`, `rejected` and `archived`; see `packages/core/src/leads.ts`.
Do not advertise additional lifecycle stages as implemented.

Candidates explicitly change their records. Opening a source or application
destination does not mark the job applied. No application-submission bot,
browser credential automation or inferred employer outcome is part of this
workspace.

Writes require the authenticated owner's session, Origin/CSRF validation and
the current revision. A stale revision returns a conflict instead of replacing
another edit. Details deep links use `?lead=<id>` on the canonical saved or
applications route; they do not imply a separate details-page implementation.

See [API contracts](API-SURFACE.md), [data model](DATA-MODEL.md) and
[product boundaries](PRODUCT.md).
