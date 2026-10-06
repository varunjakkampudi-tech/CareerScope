# CS-7 — Deploy can ship a revision that continuous integration rejected

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: DRAFT; readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-7",
      "title": "Deploy can ship a revision that continuous integration rejected",
      "primaryEpicId": "EPIC-PLATFORM",
      "area": "infrastructure",
      "priority": "P0",
      "status": "UAT",
      "owner": "Infrastructure",
      "reviewers": ["Release Manager", "Security", "QA"],
      "releaseTarget": "3.0.1",
      "blocked": true,
      "blockedReason": "The deployment-gate ticket requires observing a deliberately failing check being refused; its current UAT evidence contains no such real workflow demonstration.",
      "blockedOwner": "Release/system reviewer",
      "blockedSince": null,
      "unblockEvidenceRequired": [
        "Exact hosted workflow run showing the intentional failure and fail-closed deployment refusal."
      ]
    }
  ],
  "sources": [".ai/backlog.json#CS-7"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The live site can be running code that the pipeline says is broken, with nothing reporting a conflict.",
    {
      "requirement": "A release operator must not ship a revision unless CI for that exact revision succeeded. Historically separate partial checks allowed rejected code to ship.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "The current workflow checks the exact main SHA in require-ci, but downstream jobs independently fetch and compare the then-current main. If main advances between jobs, the revision that is verified/built/deployed may differ from the SHA whose CI passed; independent equality-to-current-main checks do not prove one immutable revision across the whole DAG. This is a documented runtime gap, not fixed by this specification.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Deployment could put code on the live site that the test pipeline had already rejected, because the two were checking different things. Now a deployment refuses unless the tests genuinely passed for that exact version."
  ],
  "sources": [".ai/backlog.json#CS-7"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "Deploy succeeded at least four times while CI was red",
        "pages.yml already gates on needs.verify.result == success; deploy.yml is the outlier",
        "Deploy gate omits check-ui.mjs, V2 unit tests, pages:test and root format:check, which is why both were green and red at once",
        "Gate logic: 22 checks pass, 5 mutations each detected, restored clean",
        "A stray shell command wrote a malformed-to-PASS mutation into the gate; the suite caught it",
        "2026-09-21 re-verification: npm run agile:gate:test deploy-gate suite — 9/9 passed (unreadable/no-run/in-progress/queued refusals, older-success does not override newer-failure, gate wiring, override-requires-reason), exit 0",
        "DEMOTED UAT -> BLOCKED 2026-09-25, AND THIS IS THE MOST CONSEQUENTIAL DEMOTION OF THE AUDIT. Verified in this session: CS-7 IS THE ONLY P0 IN THE BACKLOG. AC3 is \"proven by pushing a commit with a deliberately failing check and observing deploy refuse\" - and that has never been done. No commit has been pushed; the SHA has not moved.",
        "WHY IT IS NOT AN ORDINARY CI-PENDING ITEM, AND THIS IS THE ARGUMENT: this project has already adjudicated this exact criterion shape FIVE TIMES IN THE OPPOSITE DIRECTION. CS-3, CS-24, CS-25, CS-26 and CS-27 were each demoted UAT -> BLOCKED on the stated principle that the ticket has a criterion of the form \"proven by doing X on a real host\" with no live evidence recorded. ALL FIVE VERIFIED STILL BLOCKED IN THIS SESSION. CS-7 AC3 IS THAT SAME SENTENCE WITH \"PIPELINE\" IN PLACE OF \"HOST\", and it was not demoted with them.",
        "AND IT IS THE TICKET A RELEASE DECISION RESTS ON. It is the control that stops a deployment shipping code CI rejected, and its own evidence records that \"deploy succeeded at least four times while CI was red\". ACCEPTING CS-7 AT UAT MEANS ACCEPTING, ON LOCAL EVIDENCE ALONE, THAT THE GUARD AGAINST SHIPPING REJECTED CODE WORKS. If a release proceeds on the strength of the UAT tier, this is the one ticket where an unproven criterion carries the highest possible cost.",
        "BE PRECISE ABOUT WHAT IS PROVEN, BECAUSE THE WORK IS GOOD: AC1 require-ci querying the Actions API for the exact head SHA, and AC2 override requiring explicit intent, are both recorded with mutation-tested gate logic (22 checks, 5 mutations detected; deploy-gate 9/9). THE DECISION LOGIC IS WELL PROVEN. WHAT IS UNPROVEN IS THAT THE WORKFLOW WIRING AROUND IT DOES WHAT THE LOGIC SAYS. That distinction is the whole finding, and it is why local mutation testing - however good - cannot discharge AC3.",
        "REVIEW WINDOW CAVEAT: three sessions were writing concurrently; re-check if a cited file moved between roughly 15:05 and 17:00 IST on 2026-09-25.",
        "Hosted baseline CI run 36446068242 for commit 113935eef08dc3a988d3c17fa928725e57a34c10 passed all complete verification jobs.",
        "Hosted mutation PR run 36448394587 for commit a092f220c81bd4468047a6b9019b9124e46fe1e2 failed the exact V2 unit job as intended; this supplied a real red CI result for the candidate SHA.",
        "Deploy dispatch run 36449424977 was manually invoked with ref a092f220c81bd4468047a6b9019b9124e46fe1e2. 'Require a green CI run for this commit' failed, while 'Verify the commit being deployed' and 'Ship, build and verify' were skipped. No deployment or Hostinger secret step ran."
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        "Confirmed the real defect: the deploy gate is a strict subset of CI, never running check-ui.mjs, the V2 tests, Pages validation or root format:check",
        "Corrected the plan: needs: cannot span workflows, so the Pages pattern could not be copied",
        "Added the require-ci job querying the Actions API for the exact head SHA",
        "Moved the decision into scripts/require-ci-success.mjs so it could be tested without a network or jq",
        "Added scripts/check-deploy-gate.mjs: 22 checks, 5 mutations proven detected",
        "Wired release, agile, deploy and agent gates into CI via npm run gates:test — none of them ran in any workflow before",
        "QA"
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-7", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
    "An override exists, requires explicit intent and is recorded in the run log",
    "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
    {
      "requirement": "Effective contract: no override/bypass; the exact single revision whose CI passed is the revision checked out, verified, built, archived and deployed. The historical source AC2 asking for an override is retained as source text but superseded by the current no-bypass authority. The historical AC3 deliberate-failure demonstration must use a Release-Manager-approved non-shipping verification path; no broken main push or production deployment is authorized here.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
    "An override exists, requires explicit intent and is recorded in the run log",
    "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
    {
      "requirement": "Exact-SHA gate decision and workflow wiring, including carrying one resolved SHA across require-ci, gate and deploy jobs and failing closed if any job observes a different revision.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Reconcile frozen AC2 override wording with the current manual, main-only, no-bypass deployment contract without changing the backlog record in this phase.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 7. outOfScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Candidate owns profile, resume, saved jobs and application decisions. Opening an external application destination never marks Applied.",
    "Do not fabricate ATS/interview/offer/rejection events, unknown data, analytics or verification claims.",
    "Matching remains deterministic; AI cannot silently replace scores, ranking or exclusions.",
    "No autonomous auto-apply, credential/cookie/session theft, CAPTCHA bypass or provider terms/rate-limit bypass.",
    "HOLD/FUTURE features and unapproved provider capabilities stay disabled; design approval is not activation authority.",
    "No new service, technology, schema or endpoint is prescribed merely to reproduce a screenshot.",
    {
      "requirement": "Do not implement an override or bypass, push a deliberately failing commit to main, dispatch production deployment to prove refusal, or treat a synthetic local decision-function result as hosted workflow evidence.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/PROJECT-STATE.md",
    "docs/ARCHITECTURE.md",
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-7-AC1",
      "sourceText": "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
      "expectedResult": "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-7",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-7-AC2",
      "sourceText": "An override exists, requires explicit intent and is recorded in the run log",
      "expectedResult": "An override exists, requires explicit intent and is recorded in the run log",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-7",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-7-AC3",
      "sourceText": "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
      "expectedResult": "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-7",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "requirement": "Current authority supersedes historical AC2: no override exists or may be introduced. Manual-only main checkout, HEAD/origin-main agreement and protected production environment remain mandatory; records of old override tests are historical, not current requirements. The frozen AC text remains unchanged and is not interpreted as permission to add an override.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Require-ci requests ci.yml runs filtered by the resolved SHA. PASS requires legible completed-success evidence; failed/cancelled/timed-out/malformed/inconsistent payloads refuse, queued/in-progress/absent evidence waits only within the configured deadline then refuses. Older success cannot override a newer failure.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Downstream verify/shipping jobs cannot execute when require-ci refuses. The resolved SHA must be an explicit job output consumed by gate and deploy checkout/provenance; no downstream job may independently select a later main HEAD. If main advances before a later job starts, it must either continue the already-authorized SHA or fail closed before build/secret/shipping effects.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "AC3's future refusal demonstration must observe the real require-ci -> gate -> deploy conditions in an isolated non-shipping hosted harness, with a paired successful control and zero secret/SSH/shipping calls. This harness is not equivalent to a broken-main production dispatch; Release Manager/product owner must explicitly accept that safe replacement for the frozen literal procedure before closure.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 9. nonFunctionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Preserve bounded input, deterministic behavior, cancellation/retry semantics and current performance regression thresholds where applicable; do not claim a production SLO."
  ],
  "sources": ["docs/ARCHITECTURE.md", "docs/TESTING.md", "docs/KNOWN-LIMITATIONS.md"]
}
```

## 10. technicalApproach

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "workflow dependency graph",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: INFRASTRUCTURE. Use existing decide function and workflow dependency chain; do not introduce a second deployment authority or a cross-workflow needs assumption.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Resolve SHA once in require-ci and pass that exact value through job outputs to checkout, gate evidence and deployment provenance. Avoid repeated `ref: main` resolution in downstream jobs; assert checked-out SHA equals the gate output at every boundary. This requirement is planned; current source still independently checks out moving main.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 11. persistence

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "source": "packages/core/src/schema.ts",
      "rule": "Preserve owner-scoped PostgreSQL constraints, revisions and append-only migrations; no new database change is inferred from this spec.",
      "proposedChanges": [],
      "approval": "No new schema, index or retention policy is implied by a screenshot; approve before implementing."
    },
    {
      "requirement": "NOT_APPLICABLE: no product data writes. Workflow run/SHA and safe refusal diagnostics are evidence, not an application database.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 12. apiContract

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "sourceMapping": null,
      "registrationAuthority": "apps/api/src/app.ts",
      "rule": "Use registered Fastify routes and the single same-origin client; new operations need reviewed schemas and negative authorization contracts.",
      "errors": "400 invalid input; 401 session absent; 403 origin/CSRF; owner-safe 404; 409 revision/idempotency conflict; 413 payload; 429 rate limit; 507 storage capacity only where applicable.",
      "unknownContracts": []
    },
    {
      "requirement": "EXISTING_CONTRACT: Actions ci.yml run-list query has head_sha set to resolved main SHA; parsed payload requires numeric finite nonnegative total_count equal to workflow_runs length. Decision returns PASS, REFUSE or WAIT plus reason. No product route is added.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/API-SURFACE.md",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 13. design

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "Non-UI engineering/domain task; no page rendering is required by its scope."
}
```

## 14. sharedComponents

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "No UI component is introduced by this engineering/domain scope."
}
```

## 15. accessibility

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "No user-facing rendered control in this scope; accessible reports remain readable Markdown."
}
```

## 16. responsive

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "No viewport-dependent rendered interface in this scope."
}
```

## 17. browsers

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "No browser behavior is introduced by this task."
}
```

## 18. seo

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "Engineering, authenticated and internal/admin surfaces are not public search targets; keep private pages noindex and user data out of metadata."
}
```

## 19. securityPrivacy

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "ships unreviewed code to the public origin",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries.",
    {
      "requirement": "SECURITY_IMPACT: SECRETS, AUDIT. Actions query uses read-only actions permission. Never expose token/header/SSH material; gate refusal occurs before hosted-secret or SSH steps. Repository-root checks cannot grant shipping authorization.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 20. observability

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Correlate safe request/command/execution identifiers; record failure categories and health without sensitive payloads."
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md"
  ]
}
```

## 21. testStrategy

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-7",
      "acId": "CS-7-AC1",
      "criterion": "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "Only completed-success CI for the resolved SHA may PASS. Failed/cancelled/timed-out/malformed/inconsistent payloads REFUSE; queued/in-progress/absent WAIT only to deadline then refuse. The Actions request includes workflow ci.yml and exact head_sha A. Gate/build/archive/deploy each consume A or fail before secret/shipping calls if the checkout differs; none may independently deploy B based on a later main lookup.",
          "candidateCommand": null,
          "evidenceRequired": "Existing command output plus future named transport/deadline and source-derived moving-main assertion results; current existing gate execution alone does not prove these planned assertions.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "EXACT_SHA_FAIL_CLOSED_DEPLOYMENT"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Actual decide function imported without CLI execution; deploy.yml and all three job checkouts/provenance paths inspected without dispatch.",
          "setup": "Use synthetic completed-success SHA A, failure/malformed/inconsistent/queued/absent Actions payloads and a newer-failure control. For workflow contract, resolve main SHA A in require-ci and advance fixture origin/main to SHA B before gate and deploy start.",
          "procedure": "Run existing `npm run deploy:gate:test` decision/wiring assertions; add a service-free network transport/deadline harness for requested ci.yml head_sha and refusal semantics; run a source-derived workflow fixture through require-ci, gate and deploy with controlled main movement.",
          "assertion": "Only completed-success CI for the resolved SHA may PASS. Failed/cancelled/timed-out/malformed/inconsistent payloads REFUSE; queued/in-progress/absent WAIT only to deadline then refuse. The Actions request includes workflow ci.yml and exact head_sha A. Gate/build/archive/deploy each consume A or fail before secret/shipping calls if the checkout differs; none may independently deploy B based on a later main lookup.",
          "expectedResult": "Unproven CI or revision identity cannot authorize shipping; the passed, checked, built, archived and deployed revision is identical.",
          "testName": "exact SHA gate and downstream job revision fail closed when main advances",
          "testFileOrProcedureId": "scripts/check-deploy-gate.mjs plus planned scripts/require-ci-workflow.test.mjs",
          "fixtures": "Current pure decision/wiring checks plus planned synthetic Actions responses, injected fetch/clock and isolated A-to-B workflow-DAG fixture; no credentials or SSH.",
          "negativeCase": "Remove head_sha, ignore newer failure, permit malformed-as-PASS, bypass needs, or let a downstream job checkout B after A passed: each negative mutation must refuse/fail; same-SHA A positive control passes.",
          "evidenceArtifact": "Existing command output plus future named transport/deadline and source-derived moving-main assertion results; current existing gate execution alone does not prove these planned assertions.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "EXACT_SHA_FAIL_CLOSED_DEPLOYMENT",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-7",
      "acId": "CS-7-AC2",
      "criterion": "An override exists, requires explicit intent and is recorded in the run log",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "No override_ci or arbitrary ref input is exposed; failed CI still REFUSE despite intent/reason fields. No condition allows a shipping job around require-ci. Report explicitly marks historical override requirement superseded, not implemented.",
          "candidateCommand": null,
          "evidenceRequired": "Future contract result and supersession reference to docs/GITHUB-RELEASE-LIFECYCLE.md; no runtime claim.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "NO_DEPLOYMENT_BYPASS"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Current manual/main-only no-bypass contract supersedes historical override AC; frozen source criterion remains retained.",
          "setup": "Actual deploy.yml and lifecycle doc; synthetic dispatch input containing override_ci and a reason, with failed CI fixture.",
          "procedure": "Assert workflow declares no override/ref dispatch inputs and no bypass expression; evaluate gate regardless of synthetic override fields.",
          "assertion": "No override_ci or arbitrary ref input is exposed; failed CI still REFUSE despite intent/reason fields. No condition allows a shipping job around require-ci. Report explicitly marks historical override requirement superseded, not implemented.",
          "expectedResult": "No actor can bypass exact-SHA CI through historical override semantics.",
          "testName": "historical override fields cannot authorize rejected main deployment",
          "testFileOrProcedureId": "scripts/check-deploy-gate.mjs",
          "fixtures": "Read-only canonical workflow and synthetic rejected-run/override fields; no actual dispatch.",
          "negativeCase": "Adding bypass input/condition or treating override reason as approval must fail; valid no-bypass workflow control passes.",
          "evidenceArtifact": "Future contract result and supersession reference to docs/GITHUB-RELEASE-LIFECYCLE.md; no runtime claim.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "NO_DEPLOYMENT_BYPASS",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-7",
      "acId": "CS-7-AC3",
      "criterion": "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
      "verification": [
        {
          "type": "HOSTED_CI",
          "expectedCheck": "Canonical source hash equals reviewed harness source hash; actual require-ci -> gate -> deploy needs/conditions are represented. Failed-A CI yields failed require-ci and dependent verify/shipping jobs skipped with zero secret/SSH calls. In the distinct success-A/move-main-to-B run, later jobs use A or fail closed before build/secrets; B is never checked out, archived or deployed under A's CI result. The success-A/no-movement control reaches only the non-shipping adapter. Requested, resolved, checked-out and recorded SHA values agree in both successful controls.",
          "candidateCommand": null,
          "evidenceRequired": "Future authorized hosted run/job IDs, exact SHA, dependency conclusions and zero shipping calls; old arbitrary-ref run is historical evidence only.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "HOSTED_DEPLOYMENT_REFUSAL"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "HOSTED_CI",
          "preconditions": "A Release Manager separately authorizes non-shipping hosted workflow refusal validation; no deliberately broken main push or production dispatch is allowed.",
          "setup": "Derive isolated hosted non-shipping harness from exact deploy.yml require-ci -> gate -> deploy jobs and original needs/conditions, with canonical source SHA256 recorded. Substitute only secret/SSH/shipping adapters with no-op call recorders. Prepare three independent runs: failed exact-SHA CI for A; successful exact-SHA CI for A followed by fixture main advancing to B before gate/deploy; and successful exact-SHA CI for A with main unchanged.",
          "procedure": "After explicit owner/Release Manager acceptance of this safe evidence substitute, validate canonical source-hash parity and actual dependency/condition graph. Run the failed-A case and observe refusal/zero effects. Separately run success-A then advance fixture main to B before downstream jobs; observe whether those jobs consume A or refuse before build/secrets/shipping. Run the success-A/no-movement control to prove the harness permits the valid same-SHA path to its non-shipping adapter. Invalidate evidence if workflow source changes; no production dispatch.",
          "assertion": "Canonical source hash equals reviewed harness source hash; actual require-ci -> gate -> deploy needs/conditions are represented. Failed-A CI yields failed require-ci and dependent verify/shipping jobs skipped with zero secret/SSH calls. In the distinct success-A/move-main-to-B run, later jobs use A or fail closed before build/secrets; B is never checked out, archived or deployed under A's CI result. The success-A/no-movement control reaches only the non-shipping adapter. Requested, resolved, checked-out and recorded SHA values agree in both successful controls.",
          "expectedResult": "Hosted dependency wiring refuses rejected evidence without attempting production deployment.",
          "testName": "hosted rejected CI prevents downstream shipping before secrets are reachable",
          "testFileOrProcedureId": "CS-7-HOSTED-NONSHIPPING-REFUSAL",
          "fixtures": "Authorized isolated hosted workflow context, synthetic failure/success run fixtures and shipping-call recorder.",
          "negativeCase": "Local decide refusal alone cannot pass this hosted gate; always-skipped harness fails the success-A/no-movement control; a test that advances main only during a failed-A run is insufficient because refusal masks moving-main behavior. Any B checkout/build/archive/deploy after A-only CI success fails. Arbitrary-ref production dispatch and a deliberately failing main push are forbidden. Without owner acceptance of the safe replacement for frozen AC3, the original criterion remains unresolved.",
          "evidenceArtifact": "Future authorized hosted run/job IDs, exact SHA, dependency conclusions and zero shipping calls; old arbitrary-ref run is historical evidence only.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "HOSTED_DEPLOYMENT_REFUSAL",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "requirement": "Existing local evidence: `npm run deploy:gate:test` passed on Node 24.19.0 during this pass; it exercises the pure decision function and static manual/main/needs/no-bypass workflow checks. It does not perform a GitHub HTTP request, deadline wait, cross-job moving-main simulation or hosted downstream-job observation.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Planned service-free verification: add a network-injected request harness for `scripts/require-ci-success.mjs` and a source-derived job-DAG test. Assert requested workflow and exact `head_sha`; classify completed success/failure, malformed/inconsistent payloads, empty/queued/in-progress, HTTP/network error and deadline expiry; assert every non-PASS path prevents downstream adapter invocation.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Planned moving-main regression: in an isolated source-derived workflow fixture, resolve SHA A for successful CI, then advance origin/main to SHA B before gate/deploy. Assert each downstream checkout/build/archive/deploy provenance remains A or the job fails before build/secrets; a different SHA must never deploy. No live main movement or production dispatch is needed for the local negative control.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "AC3 hosted evidence remains separate: owner-authorized non-shipping hosted run derived from the actual workflow DAG, preserved source hash, failed candidate refusal and paired successful adapter-only control. No such current result is claimed.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/TESTING.md",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 22. visualRegression

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "No visual surface is changed by this scope."
}
```

## 23. acceptanceCriteria

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-7-AC1",
      "sourceText": "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
      "expectedResult": "deploy.yml will not deploy unless the CI verify job succeeded for that commit",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-7",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-7-AC2",
      "sourceText": "An override exists, requires explicit intent and is recorded in the run log",
      "expectedResult": "An override exists, requires explicit intent and is recorded in the run log",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-7",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-7-AC3",
      "sourceText": "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
      "expectedResult": "Proven by pushing a commit with a deliberately failing check and observing deploy refuse",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-7",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-7"]
}
```

## 24. definitionOfDone

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Each acceptance criterion has named executable assertions or a dated manual procedure and expected result.",
    "Required unit/integration/contract/browser/accessibility/privacy checks pass for current content under Node >=24; no skips/retries conceal failure.",
    "Documentation and contract agree with implementation; historical evidence is not presented as a new run.",
    "Independent current-content review resolves specification/implementation findings before promotion.",
    "Manual/provider/live gates remain explicit and unexecuted until observed; PROD requires exact reviewed deployed revision acceptance.",
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification.",
    {
      "requirement": "No bypass exists; malformed/unavailable CI proof fails closed; one immutable resolved SHA is consumed by gate/build/archive/deploy provenance; a moving-main negative control proves mismatch cannot ship; local pure decision, transport/deadline and workflow checks pass. AC3 remains unaccepted unless an authorized non-shipping hosted procedure is approved and shows failed require-ci, skipped dependent jobs, zero secret/SSH/shipping calls, and a paired success control. Specification approval is not deployment permission.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 25. completionEvidence

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "commands": {
        "contract": "npm run gates:test",
        "integration": "npm run test:integration",
        "browser": "npm run test:ui"
      },
      "sourceEvidence": "Historical evidence is retained above, not treated as fresh pass.",
      "required": [
        "Exact hosted workflow run showing the intentional failure and fail-closed deployment refusal."
      ],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    },
    {
      "requirement": "Current local validation for this pass: `npm run deploy:gate:test` on Node 24.19.0 completed with exit 0 and every emitted named assertion PASS. The existing command proves decide() fixture handling and static workflow wiring only; it does not prove transport, deadline, cross-job SHA immutability or hosted execution.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Current-source defect evidence: the independent review recorded that each downstream job resolves main independently instead of consuming the SHA output from require-ci. This is an unresolved runtime defect discovered during spec review; no workflow implementation was changed.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/TESTING.md",
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "requirement": "Preserve all three frozen source AC strings and historical evidence, but mark AC2's override request superseded by the current manual/main-only no-bypass contract; do not add an override.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Run `npm run deploy:gate:test` and record its current pure-decision/static-wiring scope; do not treat it as transport, moving-main or hosted orchestration evidence.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Plan network-injected request and deadline assertions for exact `ci.yml` `head_sha`, malformed/API errors, bounded WAIT and refusal before downstream effects; register future tests in the root unit/CI quality lane.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Plan the cross-job invariant: resolve one SHA in require-ci and pass it to gate/deploy checkout and provenance. Add a source-derived A-to-B moving-main negative fixture; use A or fail before build/secrets/shipping.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Keep AC3 unaccepted until the owner/Release Manager accepts a source-hash-bound hosted non-shipping harness as a safe substitute for deliberately pushing broken main. If not accepted, preserve the original AC as unresolved; never bypass branch protection or dispatch production to test refusal.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    ".ai/backlog.json#CS-7",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 27. dependencies

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "prerequisites": [],
      "sequencingPrerequisites": [],
      "downstream": ["CS-82"],
      "edgePolicy": "Existing declared dependencies are HARD unless individually approved otherwise."
    }
  ],
  "sources": [".ai/backlog.json#CS-7"]
}
```

## 28. manualExternalGates

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "blockerClass": "B3_SECURITY_OR_SYSTEM_REVIEW",
      "owner": "Release/system reviewer",
      "evidence": [
        "Exact hosted workflow run showing the intentional failure and fail-closed deployment refusal."
      ],
      "actions": []
    },
    {
      "requirement": "OWNER/RELEASE MANAGER DECISION: the frozen AC3 literally requires pushing a deliberately failing commit and observing deploy refusal, while the approved deployment contract is manual, main-only, protected and fail-closed. Do not bypass branch protection or push broken main. Owner must either approve an isolated non-shipping hosted harness derived from the real workflow DAG as the replacement evidence, or later authorize a safe AC wording/registry change. Until then AC3 remains unresolved.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "HOSTED GATE: after the cross-job resolved-SHA defect is fixed in a later implementation phase, require an authorized exact-SHA hosted refusal result with dependent jobs skipped and zero secrets/SSH/shipping calls. No such evidence is present in this spec pass.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    ".ai/blocker-classification.json",
    "hostpending.txt",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 29. risksRecovery

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "risks": 5,
      "assumptions": "No provider capability, product decision or production acceptance is inferred from design.",
      "failureModes": [
        "Invalid input, concurrency conflict, unavailable dependency, disabled capability and cancellation where applicable."
      ],
      "recovery": "Restore the prior reviewed code/configuration; preserve stored data and validate migrations separately. Host execution is a later authorized step."
    },
    {
      "requirement": "Historical deploy dispatch evidence used arbitrary ref inputs no longer supported. Do not reenact that obsolete procedure or loosen main-only protections. A new cross-job SHA check must keep branch protection and current-main policy fail-closed; if the pinned revision is no longer eligible, stop before secrets. Roll back a defective gate only by reviewed source change, never by disabling it.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-7",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "docs/GITHUB-RELEASE-LIFECYCLE.md",
    ".github/workflows/deploy.yml",
    "scripts/require-ci-success.mjs",
    "scripts/check-deploy-gate.mjs",
    "docs/PHASE-3-25-REMEDIATION-LEDGER.md",
    "docs/PHASE-3-25-EXECUTION-STATE.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 30. delivery

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "size": "S",
      "complexity": 2,
      "releaseTarget": "3.0.1",
      "releaseState": "UNSPECIFIED",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "UNDECIDED",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["Release Manager", "Security", "QA"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-7", ".ai/blocker-classification.json"]
}
```

## Specification gate history

| Code                      | Disposition | Original reason                                                                                                          | Owner                            | Evidence                                                                                                 |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_STATE_UNSPECIFIED | OPEN        | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | RESOLVED    | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
