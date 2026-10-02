# CareerScope — Codex/Copilot Master Implementation Order

This folder is the executable design handoff. Do not implement from `approved-images/` at random.

## Required order
0. `00-foundations-first` — brand, logo reference, loader, tokens, icons, atomic components, accessibility.
1. `01-marketing-public`
2. `02-auth`
3. `03-onboarding`
4. `04-candidate-core` — includes Candidate Profile Photo + Candidate Verification workflow
5. `05-interview` — UI/design integration only; functional engine HOLD unless explicitly released.
6. `06-courses-certifications` — UI/design integration only; functionality HOLD.
7. `07-connectors-connected-accounts` — UI/design integration only; functionality HOLD until provider authorization.
8. `08-ai-integration` — wire only capabilities that truly exist and are enabled; no fake AI responses.
9. `09-recruiter` — feature-flagged until its release.
10. `10-admin`
11. `11-admin-production-operations`
12. `12-global-ux-system-states`
13. `13-engineering-contracts`

## Per-page completion gate
For EACH page:
1. Read its folder README and relevant engineering contracts.
2. Implement shared atoms/molecules/organisms first; do not duplicate components.
3. Use real APIs/data or explicit empty/unavailable states; never hard-code illustrative metrics.
4. Match canonical reference geometry, typography, spacing, radii, shadows, icon semantics and artwork.
5. Implement loading, empty, error, permission, responsive and keyboard/focus states.
6. Render at the reference viewport and perform screenshot overlay/diff.
7. Fix visual differences without breaking semantics/accessibility.
8. Run unit/integration/E2E checks appropriate to the page.
9. Only then mark the page complete and move to the next numeric page.

## HOLD semantics
“HOLD” means routes/components may be prepared behind feature flags, but users must not be given
a working capability that is not implemented, authorized or safe. Never show fake success.

## Source-of-truth precedence
1. `01-IMPLEMENTATION-ORDER/`
2. `canonical/`
3. written implementation/foundation contracts
4. `page-references/`
5. composite/supporting references
Production truth always overrides illustrative screenshot content.

## Candidate Verification addition
Candidate verification is included under Candidate Core and Admin. Build the protected backend state machine and audit semantics before enabling verification actions.
