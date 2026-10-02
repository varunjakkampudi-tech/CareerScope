# CS-4 — Release publishes a stale version string when a version file is added

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-4",
      "title": "Release publishes a stale version string when a version file is added",
      "primaryEpicId": "EPIC-DELIVERY-TOOLING",
      "area": "tooling",
      "priority": "P2",
      "status": "UAT",
      "owner": "Senior Engineer",
      "reviewers": ["Independent Reviewer"],
      "releaseTarget": null,
      "blocked": false,
      "blockedReason": null,
      "blockedOwner": null,
      "blockedSince": null,
      "unblockEvidenceRequired": []
    }
  ],
  "sources": [".ai/backlog.json#CS-4"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": ["Published Pages can claim a version that was never released."],
  "sources": [".ai/backlog.json#CS-4"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "When a new version file is added, the release can publish the old version number, so the site claims to be running something it is not."
  ],
  "sources": [".ai/backlog.json#CS-4"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "grep -rn 'mobile-site/version.js' scripts/*.mjs -> two independent lists",
        "2026-09-22: publish-pages.mjs's versionPaths is now computed inside publishPages() from the real post-bump version via an injectable getVersionFiles(version) parameter (default: sync-version.mjs's real versionFiles), not a module-level hardcoded array or a load-time placeholder version. node --test scripts/publish-pages.test.mjs: 7/7 pass.",
        "Real Independent Reviewer invocation (native runSubagent, read-only) returned REVISE: found the first version of the new test could pass identically against the old hardcoded list, because no third versionFiles() key exists in the repo today to expose the difference (R2), plus a related latent issue that versionPaths was computed once at module load with a placeholder version rather than the real one (R1). Fixed both by making versionFiles injectable and computing the list inside publishPages() with the real bumped version; added a second test that injects a synthetic 3-key versionFiles fixture (including a key that does not exist in production) and asserts all three are staged.",
        "Proved the new synthetic-key test is non-vacuous: git-stashed the fix, ran node --test scripts/publish-pages.test.mjs against the old hardcoded implementation - 6 pass, 1 fail (the new test correctly fails because the old code has no getVersionFiles seam at all). Restored the fix; 7/7 pass again.",
        "ESLint and Prettier pass on scripts/publish-pages.mjs and scripts/publish-pages.test.mjs; no other hardcoded copy of this file list exists elsewhere in the repo (Independent Reviewer's own grep, confirmed)",
        "RUNTIME CAVEAT ADDED 2026-09-25 TO EVERY RESULT RECORDED TODAY: all local verification in this run was executed on Node v22.23.2, while package.json requires >=24.0.0, .nvmrc says 24 and CI uses 24. This does not invalidate the passes, but it RECLASSIFIES them - each was obtained on a runtime the project does not support, and any could differ on Node 24. Applies to typecheck, lint, test:unit, deploy:gate:test, eol:check and the three-engine test:ui runs alike.",
        "PROVISIONAL MARKING WITHDRAWN 2026-09-25, SAME DAY IT WAS APPLIED, BECAUSE IT WAS TOO BROAD AND THE WITHDRAWAL IS RECORDED RATHER THAN SILENT. The #19 finding was real - tsc -b exited 0 with a production type error - BUT IT WAS OVERSTATED AS \"the gate could not fail\". THE GATE COULD FAIL; ONLY ITS FIRST LINK COULD NOT. `npm run typecheck` chains four commands and the last, check-test-types.mjs, filters on /^\\S+\\.ts\\(\\d+,\\d+\\): error TS\\d+/ - WHICH MATCHES A PRODUCTION FILE AS READILY AS A TEST FILE - and exits 1. Anyone running the npm script WOULD have been told.",
        "THIS TICKET DOES NOT CITE A BARE `tsc -b`, so its typecheck evidence was never in the unfalsifiable form and stands unqualified. The narrowed set is 4 of the original 29: CS-53, CS-62, CS-76, CS-77 - ALL FOUR WRITTEN BY THE ORCHESTRATOR, which is the correct place for the correction to land."
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        "Derived versionPaths from sync-version.mjs's versionFiles(), removing the hand-maintained duplicate list",
        "Added a test asserting every real versionFiles() key is staged in the release commit",
        "Real Independent Reviewer (native runSubagent) returned REVISE: the test could pass against the old hardcoded list too, since no third key exists in production yet to discriminate; also flagged a related latent module-load-time placeholder-version issue",
        "Made versionFiles injectable as getVersionFiles, computed inside publishPages() using the real post-bump version (not a load-time placeholder) - this closes both reviewer findings in one change",
        "Added a second test injecting a synthetic 3-key fixture (one key not present in real production data) and asserting all three are staged; proved it fails against the old hardcoded implementation via git stash, then restored the fix",
        "QA",
        "ChatGPT (informal review, not a native specialist) confirmed the close-out as sound and did not recommend reopening; verified its three suggested double-checks were already true (getVersionFiles is the single source used by both sync-version.mjs and publish-pages.mjs; publishPages() uses the real post-bump version, not a default; the reviewer revision cycle and negative-control result are recorded in this evidence list, not just the final 7/7). Recorded per .ai/AGENT-SETUP.md convention: an opinion, not fact."
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-4", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The publish list is derived from versionFiles(), not duplicated",
    "A test asserts every versionFiles key is staged"
  ],
  "sources": [".ai/backlog.json#CS-4"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The publish list is derived from versionFiles(), not duplicated",
    "A test asserts every versionFiles key is staged"
  ],
  "sources": [".ai/backlog.json#CS-4"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-4"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-4-AC1",
      "sourceText": "The publish list is derived from versionFiles(), not duplicated",
      "expectedResult": "The publish list is derived from versionFiles(), not duplicated",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-4",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-4-AC2",
      "sourceText": "A test asserts every versionFiles key is staged",
      "expectedResult": "A test asserts every versionFiles key is staged",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-4",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-4"]
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
    "none",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract."
  ],
  "sources": [
    ".ai/backlog.json#CS-4",
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
    ".ai/backlog.json#CS-4",
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
  "sources": [".ai/backlog.json#CS-4", "docs/API-SURFACE.md"]
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
    "none",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries."
  ],
  "sources": [".ai/backlog.json#CS-4", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-4",
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
      "ticketId": "CS-4",
      "acId": "CS-4-AC1",
      "criterion": "The publish list is derived from versionFiles(), not duplicated",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-4-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run gates:test",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": []
    },
    {
      "ticketId": "CS-4",
      "acId": "CS-4-AC2",
      "criterion": "A test asserts every versionFiles key is staged",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-4-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run gates:test",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": []
    }
  ],
  "sources": [".ai/backlog.json#CS-4", "docs/TESTING.md"]
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
      "id": "CS-4-AC1",
      "sourceText": "The publish list is derived from versionFiles(), not duplicated",
      "expectedResult": "The publish list is derived from versionFiles(), not duplicated",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-4",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-4-AC2",
      "sourceText": "A test asserts every versionFiles key is staged",
      "expectedResult": "A test asserts every versionFiles key is staged",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-4",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-4"]
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
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-4"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-4 problem and each criterion with Senior Engineer.",
    "Resolve only the recorded CS-4 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for Release publishes a stale version string when a version file is added.",
    "Implement and verify CS-4-AC1: The publish list is derived from versionFiles(), not duplicated",
    "Implement and verify CS-4-AC2: A test asserts every versionFiles key is staged",
    "Reconcile CS-4 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-4"]
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
      "downstream": [],
      "edgePolicy": "Existing declared dependencies are HARD unless individually approved otherwise."
    }
  ],
  "sources": [".ai/backlog.json#CS-4"]
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
  "sources": [".ai/backlog.json#CS-4", ".ai/blocker-classification.json", "hostpending.txt"]
}
```

## 29. risksRecovery

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "risks": 3,
      "assumptions": "No provider capability, product decision or production acceptance is inferred from design.",
      "failureModes": [
        "Invalid input, concurrency conflict, unavailable dependency, disabled capability and cancellation where applicable."
      ],
      "recovery": "Restore the prior reviewed code/configuration; preserve stored data and validate migrations separately. Host execution is a later authorized step."
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-4",
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
      "size": "S",
      "complexity": 1,
      "releaseTarget": null,
      "releaseState": "UNSPECIFIED",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "UNDECIDED",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["Independent Reviewer"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-4", ".ai/blocker-classification.json"]
}
```

## Specification gate history

| Code                      | Disposition | Original reason                                                                                                          | Owner                            | Evidence                                                                                                 |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_TARGET_UNDECIDED  | OPEN        | Source registry has no approved release assignment.                                                                      | Product owner                    | Explicit release assignment or owner-approved future-release disposition.                                |
| RELEASE_STATE_UNSPECIFIED | OPEN        | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | OPEN        | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
