# Owner decisions — Phase 3.25 approval wave

This append-only record captures the owner directives supplied for the Phase 3.25 continuation wave on 2026-10-08. It changes specification classification only; it does not implement runtime behavior, promote tickets, deploy, or publish a release.

## CS-1 — canonical CI trigger scope

Decision: interpret the historical “every push” wording as every configured integration-verification event that protects the integration branch: `pull_request`, `push` to `main`, and explicitly authorized `workflow_dispatch`. `workflow_dispatch` is an authorized manual verification entry point subject to the repository/GitHub Actions permission boundary; it is not a substitute for either automatic event, activation, deployment authorization, or evidence that arbitrary feature-branch pushes are required. Arbitrary standalone feature-branch pushes are not required solely to satisfy the historical wording.

Classification: `ACTIVE_R1` / implementation-now infrastructure contract; no feature flag or user activation. Historical source wording remains preserved as provenance. Hosted exact-SHA and mutation evidence remain future implementation/release evidence.

## CS-5 — canonical workspace release scope

Decision: the single canonical workspace is foundational Release 1 architecture, not HOLD. Use the repository’s existing `R1` release identifier, corresponding to the prepared but unpublished `v1.0.0` release scope. No feature flag or user-facing activation exists. Publication and deployment remain separate evidence-gated actions.

Classification: `ACTIVE_R1` / implementation-now foundational architecture. The prepared release document is not evidence that `v1.0.0` has been published.

## CS-2 — exact 768px criterion retained

Decision: retain the frozen 768 CSS-pixel defect requirement as the active criterion. The historical 390px row-overlap fix remains separate historical evidence and does not satisfy or replace the 768px requirement. Future browser verification must exercise the exact 768px condition under the Phase 0 responsive contract.

Classification: `OWNER_DECISION_RESOLVED` / implementation evidence remains future. No source acceptance criterion or workflow status is changed.

## CS-4 — Release 1 publication helper scope

Decision: classify CS-4 as `R1` with activation `IMPLEMENT_IN_PHASE_4_AFTER_DECLARED_GATES`. It is not HOLD and is not active during Phase 3.25; future implementation and release evidence remain required.

Classification: `ACTIVE_R1` / specification release metadata only.

## CS-6 — Release 1 authenticated route boundary

Decision: classify CS-6 as `R1` with activation `IMPLEMENT_IN_PHASE_4_AFTER_DECLARED_GATES`. Reuse the existing session/auth boundary and session API; do not invent a route or broaden the ticket into an unrelated dashboard surface.

Classification: `ACTIVE_R1` / specification release metadata only.

## CS-7 — safe hosted no-op refusal harness

Decision: approve a source-hash-bound hosted no-op refusal harness as the safe semantic replacement for the destructive failing-push demonstration. The harness must exercise the same gate logic, refuse an intentionally failing immutable synthetic revision, produce observable exact results, and make no production mutation. The future harness remains unexecuted evidence.

Classification: `OWNER_DECISION_RESOLVED` / hosted verification remains future.

## CS-13 — shared state baseline

Decision: classify CS-13 as `R1` with activation `IMPLEMENT_IN_PHASE_4_AFTER_DECLARED_GATES`. The shared loading/error/empty contract is a Release 1 quality baseline for applicable authenticated routes; it is not a reason to invent semantically irrelevant states.

Classification: `ACTIVE_R1` / specification release metadata only.

## CS-81 — context-aware Unicode ZWNJ/ZWJ policy

Decision: approve the current repository-defined context-aware Unicode policy. Preserve valid Unicode and approved orthographic contexts; refuse unsupported or isolated contexts according to the current exact matrix; do not globally accept or reject joiners, transliterate valid text, or let AI reinterpret excluded evidence. English role derivation remains the Release 1 scope; multilingual derivation remains future work.

Classification: `OWNER_DECISION_RESOLVED` / implementation and security evidence remain future.
