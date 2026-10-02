# CS-5 — Consolidate the application into one canonical workspace

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-5",
      "title": "Consolidate the application into one canonical workspace",
      "primaryEpicId": "EPIC-PLATFORM",
      "area": "architecture",
      "priority": "P3",
      "status": "UAT",
      "owner": "System Designer",
      "reviewers": ["Product Architect", "Project Manager"],
      "releaseTarget": null,
      "blocked": false,
      "blockedReason": null,
      "blockedOwner": null,
      "blockedSince": null,
      "unblockEvidenceRequired": []
    }
  ],
  "sources": [".ai/backlog.json#CS-5"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": ["Two application layers to maintain; only one ships."],
  "sources": [".ai/backlog.json#CS-5"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "CareerScope now has one canonical root workspace. Optional static Pages export remains supported through owner-scoped PostgreSQL reads; the obsolete SQLite/MCP application layer is removed."
  ],
  "sources": [".ai/backlog.json#CS-5"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "apps/api and apps/web are canonical root workspaces; no version wrapper is tracked",
        "scripts/export-mobile.mjs and export-admin.mjs now use owner-scoped PostgreSQL queries",
        "The obsolete SQLite MCP launcher and duplicate application/runtime files were removed",
        "Root format, typecheck, lint, build, Pages tests, registration and checks-registry validation pass"
      ],
      "currentStep": "UAT - consolidation implementation and local validation complete; hosted CI and Pages publication remain acceptance gates.",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": ["System Designer", "Backend", "Infrastructure", "QA"],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-5", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The optional Pages export reads owner-scoped PostgreSQL data",
    "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
    "The obsolete application wrapper and duplicate runtime are removed with root CI validation"
  ],
  "sources": [".ai/backlog.json#CS-5"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The optional Pages export reads owner-scoped PostgreSQL data",
    "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
    "The obsolete application wrapper and duplicate runtime are removed with root CI validation"
  ],
  "sources": [".ai/backlog.json#CS-5"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-5"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-5-AC1",
      "sourceText": "The optional Pages export reads owner-scoped PostgreSQL data",
      "expectedResult": "The optional Pages export reads owner-scoped PostgreSQL data",
      "verificationIds": ["AUTOMATED_SECURITY"],
      "authority": ".ai/backlog.json#CS-5",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-5-AC2",
      "sourceText": "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
      "expectedResult": "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-5",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-5-AC3",
      "sourceText": "The obsolete application wrapper and duplicate runtime are removed with root CI validation",
      "expectedResult": "The obsolete application wrapper and duplicate runtime are removed with root CI validation",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-5",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-5"]
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
    "large",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract."
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
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
    ".ai/backlog.json#CS-5",
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
  "sources": [".ai/backlog.json#CS-5", "docs/API-SURFACE.md"]
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
    "smaller surface once removed",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries."
  ],
  "sources": [".ai/backlog.json#CS-5", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-5",
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
      "ticketId": "CS-5",
      "acId": "CS-5-AC1",
      "criterion": "The optional Pages export reads owner-scoped PostgreSQL data",
      "verification": [
        {
          "type": "AUTOMATED_SECURITY",
          "expectedCheck": "CS-5-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-5",
      "acId": "CS-5-AC2",
      "criterion": "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-5-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-5",
      "acId": "CS-5-AC3",
      "criterion": "The obsolete application wrapper and duplicate runtime are removed with root CI validation",
      "verification": [
        {
          "type": "HOSTED_CI",
          "expectedCheck": "CS-5-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": null,
          "evidenceRequired": "Future exact-SHA hosted run URL, job/check name and conclusion; a local command is insufficient.",
          "automationStatus": "MANUAL_OR_EXTERNAL_NOT_EXECUTED",
          "owner": "Product owner / authorized reviewer"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed."
    }
  ],
  "sources": [".ai/backlog.json#CS-5", "docs/TESTING.md"]
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
      "id": "CS-5-AC1",
      "sourceText": "The optional Pages export reads owner-scoped PostgreSQL data",
      "expectedResult": "The optional Pages export reads owner-scoped PostgreSQL data",
      "verificationIds": ["AUTOMATED_SECURITY"],
      "authority": ".ai/backlog.json#CS-5",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-5-AC2",
      "sourceText": "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
      "expectedResult": "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-5",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-5-AC3",
      "sourceText": "The obsolete application wrapper and duplicate runtime are removed with root CI validation",
      "expectedResult": "The obsolete application wrapper and duplicate runtime are removed with root CI validation",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-5",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-5"]
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
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-5"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-5 problem and each criterion with System Designer.",
    "Resolve only the recorded CS-5 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for Consolidate the application into one canonical workspace.",
    "Implement and verify CS-5-AC1: The optional Pages export reads owner-scoped PostgreSQL data",
    "Implement and verify CS-5-AC2: The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
    "Implement and verify CS-5-AC3: The obsolete application wrapper and duplicate runtime are removed with root CI validation",
    "Reconcile CS-5 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-5"]
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
  "sources": [".ai/backlog.json#CS-5"]
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
  "sources": [".ai/backlog.json#CS-5", ".ai/blocker-classification.json", "hostpending.txt"]
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
    ".ai/backlog.json#CS-5",
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
      "size": "XL",
      "complexity": 5,
      "releaseTarget": null,
      "releaseState": "UNSPECIFIED",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "UNDECIDED",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["Product Architect", "Project Manager"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-5", ".ai/blocker-classification.json"]
}
```

## Open specification gates

| Code                      | Reason                                                                                                                   | Owner                            | Evidence                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_TARGET_UNDECIDED  | Source registry has no approved release assignment.                                                                      | Product owner                    | Explicit release assignment or owner-approved future-release disposition.                                |
| RELEASE_STATE_UNSPECIFIED | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
