# CS-1 — CI proves what deployment ships (v2-unit layer)

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-1",
      "title": "CI proves what deployment ships (v2-unit layer)",
      "primaryEpicId": "EPIC-PLATFORM",
      "area": "infrastructure",
      "priority": "P1",
      "status": "UAT",
      "owner": "Infrastructure",
      "reviewers": ["QA", "Independent Reviewer"],
      "releaseTarget": "3.0.1",
      "blocked": false,
      "blockedReason": null,
      "blockedOwner": null,
      "blockedSince": null,
      "unblockEvidenceRequired": []
    }
  ],
  "sources": [".ai/backlog.json#CS-1"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "A V2 regression reaches production undetected. The 49 tests covering the application that serves careerscope.tech run in no workflow."
  ],
  "sources": [".ai/backlog.json#CS-1"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The application that actually runs the website had tests that no pipeline ever executed. Now the quick ones run on every change, so an obvious break is caught before it ships. The slower half still does not run — that is CS-9."
  ],
  "sources": [".ai/backlog.json#CS-1"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "git grep 'npm test' .github/workflows -> ci.yml:76 and deploy.yml:73, both the ROOT suite only",
        "v2 test script requires --env-file=.env; v2/.env is gitignored",
        "ci.yml has no services: block",
        "2026-09-21 re-verification: ci.yml step 'Test V2 (unit only — no database, queue or browser coverage)' runs npm --prefix v2 run test:unit; local run of that exact script: 33/33 passed, 0 failed, 0 skipped, exit 0",
        "RUNTIME CAVEAT ADDED 2026-09-25 TO EVERY RESULT RECORDED TODAY: all local verification in this run was executed on Node v22.23.2, while package.json requires >=24.0.0, .nvmrc says 24 and CI uses 24. This does not invalidate the passes, but it RECLASSIFIES them - each was obtained on a runtime the project does not support, and any could differ on Node 24. Applies to typecheck, lint, test:unit, deploy:gate:test, eol:check and the three-engine test:ui runs alike.",
        "DEMOTED UAT -> BLOCKED 2026-09-25, same shape as CS-7. AC3 is \"proven: breaking a v2 unit test turns the job red\" and TWO THINGS WERE MISSING. First, NO MUTATION IS RECORDED ON THIS TICKET AT ALL - its evidence is \"33/33 passed, exit 0\", A PASSING RUN, WHICH IS THE OPPOSITE OF WHAT AC3 ASKS FOR. Second, \"the job\" has never run, and even a local mutation proves the SCRIPT goes red, not the JOB.",
        "THE LOCAL HALF IS ALREADY DISCHARGED - ON THE WRONG TICKET. CS-48 ev[8] records a falsification of this exact script: \"breaking one assertion in ai-provider.test.ts produced not ok 19 - requestCompletion: success returns the completion text, 48 pass / 1 fail, exit 1\". That genuinely proves the script goes red when a v2 unit test breaks. CITED HERE rather than moved, so CS-48 evidence stays intact, and only the pipeline half of AC3 remains outstanding.",
        "STALE FIGURE REFRESHED, because a count that has silently drifted is the same defect class as the census proxy: this ticket recorded \"33/33 passed\". A live run of the same script in this session reports 55 tests, 55 pass, 0 fail, 0 skipped, exit 0. The 33 predated CS-48 (which took it to 49) and CS-35 (which took it to 54). THE FIGURE DESCRIBED A SUITE THAT NO LONGER EXISTED AT THAT SIZE.",
        "RUNTIME CAVEAT ON THAT REFRESH: the 55/55 run was executed on Node v22.23.2, two major versions below the declared floor of >=24. The number is current for this runtime; it has not been confirmed on Node 24.",
        "REVIEW WINDOW CAVEAT: three sessions were writing concurrently; re-check if a cited file moved between roughly 15:05 and 17:00 IST on 2026-09-25.",
        "PROVISIONAL MARKING WITHDRAWN 2026-09-25, SAME DAY IT WAS APPLIED, BECAUSE IT WAS TOO BROAD AND THE WITHDRAWAL IS RECORDED RATHER THAN SILENT. The #19 finding was real - tsc -b exited 0 with a production type error - BUT IT WAS OVERSTATED AS \"the gate could not fail\". THE GATE COULD FAIL; ONLY ITS FIRST LINK COULD NOT. `npm run typecheck` chains four commands and the last, check-test-types.mjs, filters on /^\\S+\\.ts\\(\\d+,\\d+\\): error TS\\d+/ - WHICH MATCHES A PRODUCTION FILE AS READILY AS A TEST FILE - and exits 1. Anyone running the npm script WOULD have been told.",
        "THIS TICKET DOES NOT CITE A BARE `tsc -b`, so its typecheck evidence was never in the unfalsifiable form and stands unqualified. The narrowed set is 4 of the original 29: CS-53, CS-62, CS-76, CS-77 - ALL FOUR WRITTEN BY THE ORCHESTRATOR, which is the correct place for the correction to land.",
        "AC3 CLOSED in v2/ARCHITECTURE.md: the V2 search worker depends on the legacy V1 matcher only through the deliberately narrowed MatchableProfile projection, with V2 owning the source shape and projection and V1 owning the deterministic matcher API. The record explicitly forbids casts/any and states that a fourth-field read must fail type-check.",
        "AC4 MUTATION PROOF RETAKEN on Node 24: temporarily adding `void application.currentCtc` at the matcher boundary made npm run typecheck fail with TS2339 because the narrowed application type excludes currentCtc; removing the mutation restored a zero-exit typecheck. The source was restored byte-identically after the falsification.",
        "Hosted baseline CI run 36446068242 for commit 113935eef08dc3a988d3c17fa928725e57a34c10 passed the complete root, V2 integration, recovery and browser/axe coverage.",
        "Hosted mutation proof run 36448394587 for temporary PR #19 commit a092f220c81bd4468047a6b9019b9124e46fe1e2 failed exactly at 'Test V2 (unit only — mocked HTTP, no database, queue or browser coverage)' after the intentional assertion mutation; recovery and integration jobs passed. The PR was closed and its branch deleted without merging."
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": ["Project Manager", "System Designer", "Backend", "QA"],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-1", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "A v2-unit CI job runs the no-services V2 tests on every push",
    "The job states what it does NOT cover, so it cannot imply full V2 coverage",
    "Proven: breaking a v2 unit test turns the job red"
  ],
  "sources": [".ai/backlog.json#CS-1"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "A v2-unit CI job runs the no-services V2 tests on every push",
    "The job states what it does NOT cover, so it cannot imply full V2 coverage",
    "Proven: breaking a v2 unit test turns the job red"
  ],
  "sources": [".ai/backlog.json#CS-1"]
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
    "No new service, technology, schema or endpoint is prescribed merely to reproduce a screenshot."
  ],
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-1"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-1-AC1",
      "sourceText": "A v2-unit CI job runs the no-services V2 tests on every push",
      "expectedResult": "A v2-unit CI job runs the no-services V2 tests on every push",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-1",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-1-AC2",
      "sourceText": "The job states what it does NOT cover, so it cannot imply full V2 coverage",
      "expectedResult": "The job states what it does NOT cover, so it cannot imply full V2 coverage",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-1",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-1-AC3",
      "sourceText": "Proven: breaking a v2 unit test turns the job red",
      "expectedResult": "Proven: breaking a v2 unit test turns the job red",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-1",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-1"]
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
    "CI topology only; no application change",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract."
  ],
  "sources": [
    ".ai/backlog.json#CS-1",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md"
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
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-1",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md"
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
    }
  ],
  "sources": [".ai/backlog.json#CS-1", "docs/API-SURFACE.md"]
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
    "none directly; removes a blind spot in the release path",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries."
  ],
  "sources": [".ai/backlog.json#CS-1", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-1",
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
      "ticketId": "CS-1",
      "acId": "CS-1-AC1",
      "criterion": "A v2-unit CI job runs the no-services V2 tests on every push",
      "verification": [
        {
          "type": "HOSTED_CI",
          "expectedCheck": "CS-1-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": null,
          "evidenceRequired": "Future exact-SHA hosted run URL, job/check name and conclusion; a local command is insufficient.",
          "automationStatus": "MANUAL_OR_EXTERNAL_NOT_EXECUTED",
          "owner": "Product owner / authorized reviewer"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed."
    },
    {
      "ticketId": "CS-1",
      "acId": "CS-1-AC2",
      "criterion": "The job states what it does NOT cover, so it cannot imply full V2 coverage",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-1-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run gates:test",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed."
    },
    {
      "ticketId": "CS-1",
      "acId": "CS-1-AC3",
      "criterion": "Proven: breaking a v2 unit test turns the job red",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-1-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run gates:test",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed."
    }
  ],
  "sources": [".ai/backlog.json#CS-1", "docs/TESTING.md"]
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
      "id": "CS-1-AC1",
      "sourceText": "A v2-unit CI job runs the no-services V2 tests on every push",
      "expectedResult": "A v2-unit CI job runs the no-services V2 tests on every push",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-1",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-1-AC2",
      "sourceText": "The job states what it does NOT cover, so it cannot imply full V2 coverage",
      "expectedResult": "The job states what it does NOT cover, so it cannot imply full V2 coverage",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-1",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-1-AC3",
      "sourceText": "Proven: breaking a v2 unit test turns the job red",
      "expectedResult": "Proven: breaking a v2 unit test turns the job red",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-1",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-1"]
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
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification."
  ],
  "sources": ["docs/ai/quality-gates.md"]
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
      "required": [],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    }
  ],
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-1"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-1 problem and each criterion with Infrastructure.",
    "Resolve only the recorded CS-1 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for CI proves what deployment ships (v2-unit layer).",
    "Implement and verify CS-1-AC1: A v2-unit CI job runs the no-services V2 tests on every push",
    "Implement and verify CS-1-AC2: The job states what it does NOT cover, so it cannot imply full V2 coverage",
    "Implement and verify CS-1-AC3: Proven: breaking a v2 unit test turns the job red",
    "Reconcile CS-1 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-1"]
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
      "downstream": ["CS-9"],
      "edgePolicy": "Existing declared dependencies are HARD unless individually approved otherwise."
    }
  ],
  "sources": [".ai/backlog.json#CS-1"]
}
```

## 28. manualExternalGates

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "blockerClass": null,
      "owner": null,
      "evidence": [],
      "actions": []
    }
  ],
  "sources": [".ai/backlog.json#CS-1", ".ai/blocker-classification.json", "hostpending.txt"]
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
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-1",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md"
  ]
}
```

## 30. delivery

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "size": "M",
      "complexity": 3,
      "releaseTarget": "3.0.1",
      "releaseState": "UNSPECIFIED",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "UNDECIDED",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["QA", "Independent Reviewer"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-1", ".ai/blocker-classification.json"]
}
```

## Open specification gates

| Code                      | Reason                                                                                                                   | Owner                            | Evidence                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_STATE_UNSPECIFIED | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
