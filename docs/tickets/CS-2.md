# CS-2 — Lead table header offset is wrong on Linux WebKit at 768px

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-2",
      "title": "Lead table header offset is wrong on Linux WebKit at 768px",
      "primaryEpicId": "EPIC-CANDIDATE-CORE",
      "area": "frontend",
      "priority": "P1",
      "status": "UAT",
      "owner": "Frontend",
      "reviewers": ["UX", "QA", "Independent Reviewer"],
      "releaseTarget": "3.0.1",
      "blocked": true,
      "blockedReason": "The current UAT record says the named WebKit regression did not reproduce and that the claimed CI result is not recorded; the exact acceptance evidence must be re-taken before release.",
      "blockedOwner": "Release/system reviewer",
      "blockedSince": null,
      "unblockEvidenceRequired": [
        "Current Node 24 cross-engine run and exact hosted CI locator covering the named viewport/engine assertion."
      ]
    }
  ],
  "sources": [".ai/backlog.json#CS-2"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "The sticky header is 48px out on Safari at tablet width, so rows sit underneath it."
  ],
  "sources": [".ai/backlog.json#CS-2"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "On one browser engine, the table header on the Leads page sits in the wrong place at tablet width, so it overlaps the rows you are trying to read. Two attempted fixes did not hold because both treated it as a timing fluke; it is not."
  ],
  "sources": [".ai/backlog.json#CS-2"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "webkit: sticky offset mismatch at 768px - header 57, expected 105, delta -48.0000",
        "57 = 3.5rem*16+1 and 105 = 6.5rem*16+1: two breakpoints apart, not a settle race",
        "Passes on Windows WebKit (webkit-2359); CI runs Linux WebKit",
        "2026-09-21 genuine Linux reproduction (Docker, mcr.microsoft.com/playwright:v1.63.0-noble matching installed Playwright 1.63.0, built app, ran check-ui.mjs): chromium and firefox both report headerHeight 105 == expectedHeight 105 at 768px, headerOverlap false — the specific 768px offset this ticket names did not reproduce on chromium/firefox. webkit itself never reached that comparison: it threw first on a DIFFERENT, earlier assertion — 'webkit: rows must stack at 390px. 11 rows, 10 overlapping' — identical error text and overlap indices to the prior recorded failure in test-results/focused-readiness-20260920-204601-135/root-ui.log.",
        "Root cause found: apps/web/src/components/LeadTable.tsx's own code comment already documented the exact mechanism — crossing the compact/card breakpoint calls virtualizer.measure() then re-measures mounted rows in the same layout effect, but WebKit delivers ResizeObserver entries before React's layout effects, so the manual re-measure read stale (pre-compact) row heights: 261px-tall cards on a 233px pitch, 28px overlap, matching the observed defect exactly",
        "Fix: deferred the manual re-measurement into a double requestAnimationFrame after virtualizer.measure(), so it reads row geometry only after the browser has actually painted the new compact/card layout, removing the race instead of widening the assertion",
        "2026-09-21 verification: 4 consecutive clean check-ui.mjs runs in the real Linux Playwright container (webkit included, errors: [] on all three engines each time), plus 1 clean run of npm run test:ui on Windows (exit 0). No 'rows must stack' failure in any run.",
        "npx prettier --check, npx eslint and npm run typecheck all pass on the changed file",
        "DEMOTED UAT -> QA 2026-09-25 on independent audit. THE DEFECT IN THIS TICKETS TITLE WAS NEVER REPRODUCED. AC1 requires \"reproduced in the Playwright Linux container, not guessed from Windows\", and the evidence states verbatim that chromium and firefox both reported headerHeight 105 == expectedHeight 105 at 768px with headerOverlap false - \"the specific 768px offset this ticket names did not reproduce\" - while webkit threw first on a DIFFERENT, EARLIER assertion about rows stacking at 390px.",
        "WHAT WAS ACTUALLY FOUND, ROOT-CAUSED AND FIXED IS A DIFFERENT DEFECT AT A DIFFERENT VIEWPORT: a ResizeObserver-versus-layout-effect race causing 28px row overlap at 390px. That work looks genuinely good, and THE EVIDENCE IS UNUSUALLY HONEST ABOUT THE SUBSTITUTION, which is why this is a status problem and not an engineering one. But a ticket whose named defect was never confirmed cannot sit in the state meaning \"acceptance evidence exists\", because there is no acceptance evidence for the thing it names.",
        "TWO ACCEPTABLE RESOLUTIONS, both fine, and the current state is neither: either the 768px offset is real and still unfixed, or this ticket is retitled and re-scoped onto the defect actually fixed.",
        "AC3 IS THE SHARPER HALF AND IT IS THE CONCRETE COST OF NOT COMMITTING. It is THE ONLY ACCEPTANCE CRITERION ACROSS THE AUDITED TICKETS THAT NAMES CI IN ITS OWN TEXT - \"check-ui.mjs green on all three engines IN CI\". The evidence is four container runs plus one Windows run, and the fix in apps/web/src/components/LeadTable.tsx is UNCOMMITTED, so every CI run that exists predates it. AC3 IS NOT MERELY UNPROVEN, IT IS UNPROVABLE until the change is committed and a pipeline runs. This is the one ticket whose promotion is blocked by the commit gate by its own wording.",
        "CREDIT, recorded so the CS-14 finding is not over-generalised: CS-2 IS INTERNALLY CONSISTENT ON THE V1/V2 AXIS - LeadTable.tsx is V1 and check-ui.mjs is the V1 root suite. The suite/component conflation found on CS-14 is NOT systemic across this batch.",
        "REVIEW WINDOW CAVEAT: three sessions were writing concurrently; re-check if a cited file moved between roughly 15:05 and 16:30 IST on 2026-09-25.",
        "RUNTIME CAVEAT ADDED 2026-09-25 TO EVERY RESULT RECORDED TODAY: all local verification in this run was executed on Node v22.23.2, while package.json requires >=24.0.0, .nvmrc says 24 and CI uses 24. This does not invalidate the passes, but it RECLASSIFIES them - each was obtained on a runtime the project does not support, and any could differ on Node 24. Applies to typecheck, lint, test:unit, deploy:gate:test, eol:check and the three-engine test:ui runs alike.",
        "PROVISIONAL MARKING WITHDRAWN 2026-09-25, SAME DAY IT WAS APPLIED, BECAUSE IT WAS TOO BROAD AND THE WITHDRAWAL IS RECORDED RATHER THAN SILENT. The #19 finding was real - tsc -b exited 0 with a production type error - BUT IT WAS OVERSTATED AS \"the gate could not fail\". THE GATE COULD FAIL; ONLY ITS FIRST LINK COULD NOT. `npm run typecheck` chains four commands and the last, check-test-types.mjs, filters on /^\\S+\\.ts\\(\\d+,\\d+\\): error TS\\d+/ - WHICH MATCHES A PRODUCTION FILE AS READILY AS A TEST FILE - and exits 1. Anyone running the npm script WOULD have been told.",
        "THIS TICKET DOES NOT CITE A BARE `tsc -b`, so its typecheck evidence was never in the unfalsifiable form and stands unqualified. The narrowed set is 4 of the original 29: CS-53, CS-62, CS-76, CS-77 - ALL FOUR WRITTEN BY THE ORCHESTRATOR, which is the correct place for the correction to land.",
        "Hosted baseline CI run 36446068242 for commit 113935eef08dc3a988d3c17fa928725e57a34c10 executed the root and V2 test-registration guards plus checks:registry successfully. Its verify job completed green; the remaining open criterion is the owner-facing deploy-gate policy decision."
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        "Project Manager",
        "Root cause: the settle guard accepted two equal readings, which a never-changed stale value also satisfies",
        "Fix: wait for the header to agree with the computed --spacing-app-header, timeout caught so the assertion still reports the exact delta",
        "Root cause of the separate 390px WebKit row-overlap crash identified in LeadTable.tsx's virtualizer re-measurement timing",
        "Fixed by deferring re-measurement past paint via double requestAnimationFrame; verified 4x on real Linux WebKit + 1x on Windows, all clean",
        "QA"
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-2", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Reproduced in the Playwright Linux container, not guessed from Windows",
    "Root cause named; the assertion is not widened",
    "check-ui.mjs green on all three engines in CI"
  ],
  "sources": [".ai/backlog.json#CS-2"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Reproduced in the Playwright Linux container, not guessed from Windows",
    "Root cause named; the assertion is not widened",
    "check-ui.mjs green on all three engines in CI"
  ],
  "sources": [".ai/backlog.json#CS-2"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-2"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-2-AC1",
      "sourceText": "Reproduced in the Playwright Linux container, not guessed from Windows",
      "expectedResult": "Reproduced in the Playwright Linux container, not guessed from Windows",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC2",
      "sourceText": "Root cause named; the assertion is not widened",
      "expectedResult": "Root cause named; the assertion is not widened",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC3",
      "sourceText": "check-ui.mjs green on all three engines in CI",
      "expectedResult": "check-ui.mjs green on all three engines in CI",
      "verificationIds": ["AUTOMATED_BROWSER", "HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-2"]
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
    ".ai/backlog.json#CS-2",
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
    ".ai/backlog.json#CS-2",
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
  "sources": [".ai/backlog.json#CS-2", "docs/API-SURFACE.md"]
}
```

## 13. design

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-2",
      "ui": true,
      "status": "DESIGN_GAP",
      "primaryRef": null,
      "references": [],
      "screens": [],
      "reason": "Mappings are copied from the authoritative design index; asset presence does not establish implementation or product capability."
    }
  ],
  "sources": ["design/DESIGN-INDEX.json", ".ai/design-ticket-coverage.json"]
}
```

## 14. sharedComponents

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Reuse tokens, atoms and composites through CS-95, CS-105 and CS-106; routes compose feature components and the canonical API client."
  ],
  "sources": ["design/foundations/ATOMIC-DESIGN-COMPONENT-HIERARCHY.md"]
}
```

## 15. accessibility

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "WCAG 2.2 AA target: semantic headings/landmarks, accessible names, labels/instructions and associated validation errors.",
    "Keyboard-only navigation with visible focus, logical order, Escape/focus trap/restoration for dialogs, and status/error announcements for async operations.",
    "Non-color status indicators, contrast review, reduced motion and zoom/reflow; NVDA/VoiceOver judgment remains future HUMAN VALIDATION."
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/ACCESSIBILITY-RESPONSIVE-LOCALIZATION-CONTRACT.md",
    "docs/FRONTEND-ARCHITECTURE.md",
    "docs/TESTING.md"
  ]
}
```

## 16. responsive

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Verify 320, 390, 768, 1024 and 1440px; ordinary content does not cause horizontal overflow; tables have deliberate narrow-screen behavior.",
    "Use mapped approved reference geometry; touch targets and long localized text remain usable; do not invent unsupported mobile designs."
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/ACCESSIBILITY-RESPONSIVE-LOCALIZATION-CONTRACT.md",
    "docs/FRONTEND-ARCHITECTURE.md",
    "docs/TESTING.md"
  ]
}
```

## 17. browsers

```json
{
  "applicability": "APPLICABLE",
  "requirements": ["Chromium", "Firefox", "WebKit"],
  "sources": ["docs/TESTING.md"]
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
  "sources": [".ai/backlog.json#CS-2", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-2",
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
      "ticketId": "CS-2",
      "acId": "CS-2-AC1",
      "criterion": "Reproduced in the Playwright Linux container, not guessed from Windows",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-2-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-2",
      "acId": "CS-2-AC2",
      "criterion": "Root cause named; the assertion is not widened",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-2-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-2",
      "acId": "CS-2-AC3",
      "criterion": "check-ui.mjs green on all three engines in CI",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "CS-2-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run test:ui",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        },
        {
          "type": "HOSTED_CI",
          "expectedCheck": "CS-2-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": null,
          "evidenceRequired": "Future exact-SHA hosted run URL, job/check name and conclusion; a local command is insufficient.",
          "automationStatus": "MANUAL_OR_EXTERNAL_NOT_EXECUTED",
          "owner": "Release/system reviewer"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": []
    }
  ],
  "sources": [".ai/backlog.json#CS-2", "docs/TESTING.md"]
}
```

## 22. visualRegression

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "exactReferences": [],
      "masks": "Only unavoidable dynamic regions; no blanket widget masks.",
      "tolerance": "Owner-approved deterministic threshold is required; not invented in planning.",
      "evidence": "Future reference/render capture, dimensions, state, browser and independent approval."
    }
  ],
  "sources": ["design/01-IMPLEMENTATION-ORDER/00-foundations-first/visual-parity-acceptance.md"]
}
```

## 23. acceptanceCriteria

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-2-AC1",
      "sourceText": "Reproduced in the Playwright Linux container, not guessed from Windows",
      "expectedResult": "Reproduced in the Playwright Linux container, not guessed from Windows",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC2",
      "sourceText": "Root cause named; the assertion is not widened",
      "expectedResult": "Root cause named; the assertion is not widened",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC3",
      "sourceText": "check-ui.mjs green on all three engines in CI",
      "expectedResult": "check-ui.mjs green on all three engines in CI",
      "verificationIds": ["AUTOMATED_BROWSER", "HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-2"]
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
      "required": [
        "Current Node 24 cross-engine run and exact hosted CI locator covering the named viewport/engine assertion."
      ],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    }
  ],
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-2"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-2 problem and each criterion with Frontend.",
    "Resolve only the recorded CS-2 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for Lead table header offset is wrong on Linux WebKit at 768px.",
    "Implement and verify CS-2-AC1: Reproduced in the Playwright Linux container, not guessed from Windows",
    "Implement and verify CS-2-AC2: Root cause named; the assertion is not widened",
    "Implement and verify CS-2-AC3: check-ui.mjs green on all three engines in CI",
    "Reconcile CS-2 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-2"]
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
      "downstream": ["CS-14"],
      "edgePolicy": "Existing declared dependencies are HARD unless individually approved otherwise."
    }
  ],
  "sources": [".ai/backlog.json#CS-2"]
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
        "Current Node 24 cross-engine run and exact hosted CI locator covering the named viewport/engine assertion."
      ],
      "actions": []
    }
  ],
  "sources": [".ai/backlog.json#CS-2", ".ai/blocker-classification.json", "hostpending.txt"]
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
    ".ai/backlog.json#CS-2",
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
      "complexity": 4,
      "releaseTarget": "3.0.1",
      "releaseState": "UNSPECIFIED",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "UNDECIDED",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["UX", "QA", "Independent Reviewer"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-2", ".ai/blocker-classification.json"]
}
```

## Specification gate history

| Code                      | Disposition | Original reason                                                                                                          | Owner                            | Evidence                                                                                                 |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| MISSING_EXACT_DESIGN      | OPEN        | No exact approved screen reference is mapped; a README or generic board does not verify this surface.                    | UX / Product owner               | Exact design asset, route/role/state/viewport mapping and approval.                                      |
| RELEASE_STATE_UNSPECIFIED | OPEN        | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | OPEN        | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
