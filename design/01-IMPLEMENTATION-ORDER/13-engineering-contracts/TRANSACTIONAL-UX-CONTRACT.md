# Transactional UX Contract
All important mutations must have explicit pending/success/failure/retry behavior.
Destructive or high-risk operations (delete, revoke, restore, rollback, publish, deployment,
DLQ replay, privacy deletion) require appropriate confirmation, authorization and audit records.
Do not use optimistic success for irreversible server operations before the server confirms them.
Prevent accidental double submission and use idempotency where the domain requires it.
