# CS-9 — V2 tests in CI cover no database, queue or browser path

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-9",
      "title": "V2 tests in CI cover no database, queue or browser path",
      "primaryEpicId": "EPIC-VALIDATION",
      "area": "testing",
      "priority": "P1",
      "status": "UAT",
      "owner": "Backend",
      "reviewers": ["QA", "Infrastructure", "Security"],
      "releaseTarget": "3.0.1",
      "blocked": false,
      "blockedReason": null,
      "blockedOwner": null,
      "blockedSince": null,
      "unblockEvidenceRequired": []
    }
  ],
  "sources": [".ai/backlog.json#CS-9"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The layer where the application actually fails is the layer CI does not exercise."
  ],
  "sources": [".ai/backlog.json#CS-9"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The tests that need a real database, queue and browser do not run in the pipeline at all. That is the layer where this application actually breaks, so the current pipeline proves less than it appears to. Wiring this up surfaced a real, previously-undetected defect that made resume parsing permanently unable to run; that defect is now fixed and proven 24/24 on real services."
  ],
  "sources": [".ai/backlog.json#CS-9"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "Layer A is 33 unit tests; six files need real services",
        "The CI step is named to say unit only so the gap is not misread",
        "2026-09-21: real Linux container run (node:24-bookworm, host-network, disposable Postgres 17.6/Redis 7.4.5/LocalStack 4.7.0 matching v2/compose.yml) of the exact six test:integration files: 24/24 passed, 0 failed, 0 skipped, after the resume-parser fix above. Before the fix: 4/24 failed, all with the same root cause",
        "ci.yml v2-integration job validated as syntactically correct YAML (python yaml.safe_load) and passed npm run gates:test after the change",
        "2026-09-21: real Independent Reviewer invocation (native runSubagent, no edit tool available or used, confirmed by the reviewer) examined the resume-parser fix; verdict APPROVED. Findings: (P2) the --allow-fs-read grant to packages/resume/ and packages/shared/ is broader than the package.json each needs; attempted narrowing to the exact file broke on Windows (platform-specific symlink/realpath resolution), so the directory grant was kept deliberately, not from oversight. (P3) Node 25.0.0 actually added a real --allow-net permission scope (confirmed against nodejs.org/en/blog/release/v25.0.0), so the check was rewritten to be version-aware — process.allowedNodeEnvironmentFlags.has('--allow-net') && process.permission.has('net') — rather than assuming Node can never gate network access. Re-verified 24/24 after this refinement, both on Windows (parser test passing in isolation) and a fresh Linux container (full six-file suite).",
        "DEMOTED UAT -> BLOCKED 2026-09-25, AND THIS ONE WAS FOUND BY THE GATE RATHER THAN BY A REVIEWER - the first of the eight demotions to be caught mechanically. Verified independently in this session: AC1 is \"Postgres and Redis service containers RUN IN CI with a CI-built environment file\", and ZERO of the five evidence entries cite a workflow run URL or a run id. The only entry mentioning CI says \"the CI step is named to say unit only so the gap is not misread\", which describes the gap rather than closing it.",
        "THE GATE WORDING IS EXACTLY RIGHT AND IS KEPT: \"A LOCAL RUN - EVEN A CONTAINERISED ONE - IS NOT CI, AND A SENTENCE MENTIONING CI IS NOT A CI RESULT.\" Containerised local execution is the specific thing most likely to be mistaken for the criterion here, because it looks like the CI environment.",
        "CLUSTER RECORDED, because these are no longer four separate tickets: CS-1, CS-2, CS-7 AND CS-9 ALL HAVE ACCEPTANCE CRITERIA THAT NAME CI OR A REAL PIPELINE RUN IN THEIR OWN TEXT. Four tickets - INCLUDING THE ONLY P0 (CS-7) - are blocked by the commit gate BY THEIR OWN WORDING, not by anyone judgement. That is the most concrete statement of the commit value available, and it should go to the owner in exactly those terms.",
        "Hosted baseline CI run 36446068242 for commit 113935eef08dc3a988d3c17fa928725e57a34c10 completed the V2 integration job successfully. Its steps show service initialization, a CI-built environment file, integration tests, backfill tests, and Chromium/Firefox/WebKit plus axe acceptance all completed successfully; no integration step was skipped.",
        "Hosted mutation PR run 36448394587 independently completed the V2 integration job successfully while the intentional unit mutation failed, confirming the service-backed job is separate and still executes rather than being reported as passed by transitive success.",
        "Direct hosted CI links: https://github.com/varunjakkampudi-tech/careerscope/actions/runs/36446068242 and https://github.com/varunjakkampudi-tech/careerscope/actions/runs/36448394587."
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        "Added v2-integration job to .github/workflows/ci.yml: Postgres 17.6-alpine, Redis 7.4.5-alpine and LocalStack 4.7.0 service containers, a CI-built (not gitignored) .env file, running npm --prefix v2 run test:integration",
        "Verified the job design for real: ran the exact six files (bull-queue, database, market, queue, resumes, runtime) against disposable Postgres/Redis/LocalStack in a genuine Linux container matching CI",
        "Found and fixed a real, severe, unrelated defect surfaced by this: the isolated resume parser's child self-check tested process.allowedNodeEnvironmentFlags.has('--allow-net'), a Deno flag that does not exist in Node, so it unconditionally threw PARSER_UNAVAILABLE on every real Node runtime — resume parsing could never succeed. Fixed in v2/packages/core/src/resume-parser-child.ts by removing the non-existent-flag and equally meaningless 'net' scope checks, keeping the real fs.write/child checks",
        "Also fixed a related permission-scope gap in resume-parser.ts: the isolated child's --allow-fs-read grants covered packages/resume/dist and packages/shared/dist but not their package.json at the workspace-symlinked package root, which ESM resolution needs; broadened the grant to the package roots",
        "QA"
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-9", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Postgres and Redis service containers run in CI with a CI-built environment file",
    "The six integration files execute rather than being skipped",
    "A skipped suite is reported as not run, never as passed"
  ],
  "sources": [".ai/backlog.json#CS-9"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Postgres and Redis service containers run in CI with a CI-built environment file",
    "The six integration files execute rather than being skipped",
    "A skipped suite is reported as not run, never as passed"
  ],
  "sources": [".ai/backlog.json#CS-9"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-9"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-9-AC1",
      "sourceText": "Postgres and Redis service containers run in CI with a CI-built environment file",
      "expectedResult": "Postgres and Redis service containers run in CI with a CI-built environment file",
      "verificationIds": ["AUTOMATED_BROWSER", "HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC2",
      "sourceText": "The six integration files execute rather than being skipped",
      "expectedResult": "The six integration files execute rather than being skipped",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC3",
      "sourceText": "A skipped suite is reported as not run, never as passed",
      "expectedResult": "A skipped suite is reported as not run, never as passed",
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-9"]
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
    "CI service topology; no application behavior change beyond making the isolated resume parser actually able to run",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract."
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
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
    ".ai/backlog.json#CS-9",
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
  "sources": [".ai/backlog.json#CS-9", "docs/API-SURFACE.md"]
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
    "none directly; the resume-parser fix REMOVES a permanently-broken safety self-check rather than weakening a working one — network isolation for that child was never actually enforced by it and must come from the OS/container, which this change documents rather than hides",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries."
  ],
  "sources": [".ai/backlog.json#CS-9", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-9",
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
      "ticketId": "CS-9",
      "acId": "CS-9-AC1",
      "criterion": "Postgres and Redis service containers run in CI with a CI-built environment file",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "CS-9-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run test:ui",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        },
        {
          "type": "HOSTED_CI",
          "expectedCheck": "CS-9-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": null,
          "evidenceRequired": "Future exact-SHA hosted run URL, job/check name and conclusion; a local command is insufficient.",
          "automationStatus": "MANUAL_OR_EXTERNAL_NOT_EXECUTED",
          "owner": "Product owner / authorized reviewer"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": []
    },
    {
      "ticketId": "CS-9",
      "acId": "CS-9-AC2",
      "criterion": "The six integration files execute rather than being skipped",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-9-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-9",
      "acId": "CS-9-AC3",
      "criterion": "A skipped suite is reported as not run, never as passed",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "CS-9-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run test:ui",
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
  "sources": [".ai/backlog.json#CS-9", "docs/TESTING.md"]
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
      "id": "CS-9-AC1",
      "sourceText": "Postgres and Redis service containers run in CI with a CI-built environment file",
      "expectedResult": "Postgres and Redis service containers run in CI with a CI-built environment file",
      "verificationIds": ["AUTOMATED_BROWSER", "HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC2",
      "sourceText": "The six integration files execute rather than being skipped",
      "expectedResult": "The six integration files execute rather than being skipped",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC3",
      "sourceText": "A skipped suite is reported as not run, never as passed",
      "expectedResult": "A skipped suite is reported as not run, never as passed",
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-9"]
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
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-9"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-9 problem and each criterion with Backend.",
    "Resolve only the recorded CS-9 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for V2 tests in CI cover no database, queue or browser path.",
    "Implement and verify CS-9-AC1: Postgres and Redis service containers run in CI with a CI-built environment file",
    "Implement and verify CS-9-AC2: The six integration files execute rather than being skipped",
    "Implement and verify CS-9-AC3: A skipped suite is reported as not run, never as passed",
    "Reconcile CS-9 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-9"]
}
```

## 27. dependencies

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "prerequisites": ["CS-1"],
      "sequencingPrerequisites": [],
      "downstream": [],
      "edgePolicy": "Existing declared dependencies are HARD unless individually approved otherwise."
    }
  ],
  "sources": [".ai/backlog.json#CS-9"]
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
  "sources": [".ai/backlog.json#CS-9", ".ai/blocker-classification.json", "hostpending.txt"]
}
```

## 29. risksRecovery

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "risks": 4,
      "assumptions": "No provider capability, product decision or production acceptance is inferred from design.",
      "failureModes": [
        "Invalid input, concurrency conflict, unavailable dependency, disabled capability and cancellation where applicable."
      ],
      "recovery": "Restore the prior reviewed code/configuration; preserve stored data and validate migrations separately. Host execution is a later authorized step."
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
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
      "size": "L",
      "complexity": 4,
      "releaseTarget": "3.0.1",
      "releaseState": "UNSPECIFIED",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "UNDECIDED",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["QA", "Infrastructure", "Security"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-9", ".ai/blocker-classification.json"]
}
```

## Specification gate history

| Code                      | Disposition | Original reason                                                                                                          | Owner                            | Evidence                                                                                                 |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_STATE_UNSPECIFIED | OPEN        | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | OPEN        | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
