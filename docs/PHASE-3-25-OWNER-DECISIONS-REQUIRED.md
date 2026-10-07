# Phase 3.25 owner decisions required

This file contains only product/release choices not established by the
authoritative backlog, approved owner decisions, Phase 3 contract, architecture
records or current implementation. It is a decision request, not a decision
record. No selection is implied.

## CS-2 — disposition the unreproduced 768px defect separately from the 390px fix

- **Question:** Should CS-2 continue to require reproduction and correction of
  the originally named Linux WebKit 768px sticky-header offset, or should the
  owner authorize a future registry change to disposition that unreproduced
  defect separately and track the distinct, historically fixed 390px row
  overlap under its own accurately scoped record?
- **Why required:** The frozen ticket title and AC1/AC2 name a 768px offset.
  Historical evidence says Chromium and Firefox measured the expected 105px at
  768px, while WebKit failed earlier on a different 390px row-stacking
  assertion. That other defect was root-caused and fixed. The current canonical
  `/saved` page uses `SavedLeads`, not the removed legacy `LeadTable`; current
  design reference `design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png`
  does not specify a sticky-header target or expected 768px geometry. No
  authoritative owner decision covers CS-2.
- **Options:**
  1. Retain the exact 768px requirement; obtain a current approved target
     geometry and reproduce it before authorizing a fix.
  2. In a later explicitly authorized backlog-edit phase, disposition CS-2 as
     not reproduced and create/re-scope a separate record for the 390px defect
     only if the owner still wants that historical work tracked. Preserve
     original AC/evidence as history and do not retroactively represent it as
     satisfying 768px.
- **Consequences:** Option 1 keeps CS-2 open until a current 768px failure and
  root cause exist. Option 2 requires a source-registry change outside Phase
  3.25; it must not rewrite historical evidence or claim a pass for original
  acceptance criteria. Neither option authorizes production implementation or
  deployment in this phase.
- **Recommended neutral framing:** Keep CS-2 unaccepted and blocked; do not
  assume a 390px fix satisfies a 768px criterion. No implementation change is
  justified until option 1 has a measurable target and reproduction.
- **Affected specification sections:** Problem, current evidence, desired
  outcome, in/out of scope, AC-to-test bindings, design disposition, checklist,
  Definition of Done, release disposition and evidence requirements.
- **Can proceed without this decision:** Historical evidence reconciliation,
  existing `/saved` route/component inventory, current browser-harness/CI
  mapping and isolated test-procedure planning are complete. No runtime code or
  ticket registry is changed here.
- **Blocked:** Whole-spec approval, final AC1/AC2 disposition, exact design
  acceptance and release-state classification. Hosted CI is a later execution
  gate, not a substitute for the scope decision.

The source backlog already assigns CS-2 `releaseTarget: 3.0.1`. Preserve that
exact source value in the ticket projection; `releaseState: UNSPECIFIED` means
there is no evidence that release activation is approved, not that the target
is unknown. Phase 3.25 does not activate releases, so this is not a separate
owner decision or a reason to block specification readiness.

## CS-4 / CS-5 — assign release targets and activation dispositions

- **Question:** What release target and activation state should be recorded for
  CS-4 and CS-5, whose source `releaseTarget` values are null and whose
  `releaseState` values are unspecified while
  `.ai/blocker-classification.json` classifies them as `ACTIVE_R1`?
- **Why required:** `ACTIVE_R1` is not a product-version target and does not
  authorize static publication or production release. The historical package
  versions and current UAT workflow state are not release decisions.
- **Options:** Assign an explicitly approved R1 target/activation; or classify
  the ticket for a named later release/HOLD with an explicit rationale. Do not
  infer either option from `package.json`, historic tags, current UAT status,
  or the fact that the local test suite passes.
- **Consequences:** The ticket-specific behavior can be specified and source
  implementation inspected, but no release promotion or publication is
  authorized. Choose the target and activation separately for each ticket;
  release reporting remains incomplete until the registry is changed in a
  separately authorized phase.
- **Recommended neutral framing:** Preserve the null target and unspecified
  activation until the product/release owner chooses. Treat the ticket as
  implementation-content specified but not release-ready.
- **Affected specification sections:** Delivery metadata, manual/external
  gates, Definition of Done and release evidence.
- **Can proceed without this decision:** Source/contract review, the exact
  missing CS-4 `git add` assertion planning, CS-5 owner-scoped export contract
  planning, local fixture validation, and all unrelated ticket specification
  work.
- **Blocked:** Final release/activation classification and any later release
  promotion. No code or host activity is blocked by this question.

## CS-6 — assign release target and activation disposition

- **Question:** What release target and activation state should be recorded for
  CS-6, whose source `releaseTarget` is null and whose `releaseState` is
  unspecified?
- **Why required:** `.ai/design-ticket-coverage.json` labels its design scope
  `RELEASE`, but that field orders design work; it is not a numbered release
  target or owner authorization to activate. UAT status and historical
  implementation evidence do not fill this gap.
- **Options:** Assign an explicitly approved release target and activation
  state, or defer/hold the ticket with a named future target and rationale. Do
  not infer a value from package version, design ordering, UAT status, or
  historical completion notes.
- **Consequences:** Route/auth-boundary behavior can be specified and reviewed
  without changing release metadata. Promotion/release classification remains
  unresolved until the owner decision is recorded in the canonical registry.
- **Recommended neutral framing:** Preserve null/unspecified source metadata;
  treat design-scope `RELEASE` as non-authorizing.
- **Affected specification sections:** Delivery, manual/external gates,
  release evidence and promotion semantics.
- **Can proceed without this decision:** Technical contract, route-composition
  tests, privacy/cache isolation plan, accessibility behavior and feature-scope
  separation.
- **Blocked:** Final release/activation classification and any later release
  promotion. No route implementation, host action or deployment is authorized
  by this planning document.

## CS-7 — safely disposition the literal deployment-refusal demonstration

- **Question:** May the frozen CS-7 AC3 procedure (“push a commit with a
  deliberately failing check and observe deploy refuse”) be satisfied by an
  isolated, owner-approved, non-shipping hosted harness derived from the real
  workflow DAG, or must the source AC be changed in a separately authorized
  registry-edit phase?
- **Why required:** Current deployment is manual, main-only, protected and
  fail-closed. Deliberately pushing a failing revision to main or bypassing
  branch protection is not acceptable. A synthetic local `decide()` test alone
  does not prove hosted workflow wiring, while a no-op adapter harness is not
  literally the frozen push-and-refuse procedure.
- **Options:** (1) Approve a source-hash-bound hosted harness that exercises the
  real `require-ci -> gate -> deploy` dependency conditions with secret/SSH/
  shipping adapters replaced by no-op recorders and paired fail/success
  controls; or (2) defer and later authorize a precise CS-7 AC3 change in the
  canonical backlog. Do not deliberately fail protected main or perform a
  production dispatch for this negative test.
- **Consequences:** Option 1 provides hosted orchestration evidence without
  publishing/deploying broken code, but is explicitly an approved replacement
  for the historical criterion, not literal fulfillment. Option 2 keeps CS-7
  unaccepted until a safe revised criterion is recorded. In both cases the
  cross-job immutable SHA defect must first be fixed and tested.
- **Recommended framing:** Prefer option 1 only after owner/Release Manager
  explicitly accepts the semantic substitution; until then preserve the frozen
  wording and leave AC3 unresolved.
- **Affected specification sections:** AC3 verification binding, evidence,
  release/production gate, implementation checklist and definition of done.
- **Can proceed without this decision:** Local decision-function and workflow
  checks, exact-SHA propagation contract, transport/deadline test design, and
  documenting the moving-main defect.
- **Blocked:** AC3 acceptance and any claim that the deployment guard was
  proven in hosted orchestration. No push, merge, deploy or branch-protection
  bypass is authorized.

## CS-13 — assign release and activation state for shared signed-in UI states

- **Question:** What release and activation classification should be recorded for CS-13, whose source `releaseTarget` is null and whose `releaseState` is unspecified?
- **Why required:** The ticket is at UAT in the source backlog, but UAT status and historical browser evidence are not release authorization. No authoritative release mapping, feature flag, hold, or manual gate is recorded for this ticket.
- **Options:** Assign an approved release target and classify it `IMPLEMENT_NOW`, `FEATURE_FLAGGED`, or `MANUAL_GATE`; or classify it `HOLD`, `FUTURE_RELEASE`, or `EXTERNAL_DEPENDENCY` with the responsible owner and rationale. Preserve the source null/unspecified values until that decision is entered in the canonical registry.
- **Consequences:** The route census, shared-state contract, negative fixtures, accessibility requirements, and future three-engine browser procedure can proceed. Final activation, release evidence, and promotion remain blocked until the owner decision is recorded.
- **Affected specification sections:** Delivery, manual/external gates, release evidence, and definition of done.
- **Can proceed without this decision:** Source-level route/component census, shared loading/empty/error contract, privacy and accessibility review, and exact planned AC procedures.
- **Blocked:** Release assignment, activation classification, and any promotion claim. No application implementation or deployment is authorized by this planning record.

## CS-80 — reconcile scoped checkpoint authorization with the frozen artifact prohibition

**RESOLVED FOR A NARROW FEATURE-BRANCH CHECKPOINT — NOT A WHOLE-SPEC APPROVAL.**
Owner decision `OD-2026-10-07-CS80-AC3` is recorded in
`docs/OWNER-DECISIONS-2026-10-02.md` and the canonical AC3/migration provenance.
Only the exact deterministic output paths enumerated at
`.ai/ticket-specification-policy.json#generatedArtifactCheckpoint.generatedPaths`
may be checkpointed on `phase-3.25/cloud-continuation`, after the generator
proves exact path-set equality and privacy/publication checks pass. The general
prohibition remains in force for all other generated artifacts. Main integration
is explicitly not authorized and requires a later owner decision. CS-80 remains
incomplete for its separate release-target, activation/HOLD and verification
gates.

## CS-81 — approve the exact context-sensitive ZWNJ/ZWJ policy

- **Question:** Which exact Unicode contexts and script set should permit U+200C
  ZWNJ and U+200D ZWJ in candidate/resume-derived title evidence, and is the
  current same-script letter/mark predicate the intended policy?
- **Why required:** Existing code implements a contextual rule, but no
  authoritative owner/security decision was found. Code and historical test
  results establish behavior, not product policy. A broader allow can enable
  invisible spoofing; an over-broad refusal can corrupt legitimate language.
- **Options:** (1) Approve the current exact context/script matrix after
  independent Unicode-security review. (2) Approve a different enumerated
  context matrix with positive orthographic and negative decorative/script-
  boundary fixtures. (3) Keep both characters refused until such a matrix is
  approved, accepting that legitimate titles may be rejected/neutralized.
  Do not choose silently from the implementation.
- **Consequences:** The shared predicate and both consumers must follow one
  approved matrix; resume extraction continues to reject a title segment for a
  refused character while matching neutralizes only refused characters.
  Existing user data is not rewritten and no migration is implied.
- **Recommended neutral framing:** Keep the currently implemented behavior
  unchanged until an explicit owner decision and cited anti-spoofing rationale
  are recorded; do not represent the current code as approval.
- **Affected specification sections:** CS-81 AC1–AC4, shared architecture,
  input/security boundary, test fixtures, implementation checklist and
  evidence requirements.
- **Can proceed without this decision:** Preserve historical red-test evidence,
  document the shared predicate/consumer boundary, define synthetic fixtures
  and complete non-policy contract review.
- **Blocked:** Final allowed-context assertions, whole-spec approval, and any
  runtime policy modification.

`OWNER_DECISIONS_REMAINING: 6` (CS-80's narrow checkpoint conflict is resolved;
its whole-ticket readiness remains incomplete.)
