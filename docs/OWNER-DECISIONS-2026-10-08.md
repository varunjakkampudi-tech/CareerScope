# Owner decisions — Phase 3.25 approval wave

This append-only record captures the owner directives supplied for the Phase 3.25 continuation wave on 2026-10-08. It changes specification classification only; it does not implement runtime behavior, promote tickets, deploy, or publish a release.

## CS-1 — canonical CI trigger scope

Decision: interpret the historical “every push” wording as every configured integration-verification event that protects the integration branch: `pull_request`, `push` to `main`, and explicitly authorized `workflow_dispatch`. Arbitrary standalone feature-branch pushes are not required solely to satisfy the historical wording.

Classification: `ACTIVE_R1` / implementation-now infrastructure contract; no feature flag or user activation. Historical source wording remains preserved as provenance. Hosted exact-SHA and mutation evidence remain future implementation/release evidence.

## CS-5 — canonical workspace release scope

Decision: the single canonical workspace is foundational Release 1 architecture, not HOLD. Use the repository’s existing `R1` release identifier, corresponding to the prepared but unpublished `v1.0.0` release scope. No feature flag or user-facing activation exists. Publication and deployment remain separate evidence-gated actions.

Classification: `ACTIVE_R1` / implementation-now foundational architecture. The prepared release document is not evidence that `v1.0.0` has been published.
