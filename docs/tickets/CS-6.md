# CS-6 — Frontend route architecture and auth boundary

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-6",
      "title": "Frontend route architecture and auth boundary",
      "primaryEpicId": "EPIC-CANDIDATE-CORE",
      "area": "frontend",
      "priority": "P1",
      "status": "UAT",
      "owner": "Frontend",
      "reviewers": ["UX", "System Designer", "Security"],
      "releaseTarget": null,
      "blocked": false,
      "blockedReason": null,
      "blockedOwner": null,
      "blockedSince": null,
      "unblockEvidenceRequired": []
    }
  ],
  "sources": [".ai/backlog.json#CS-6"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "No deep links, no per-page loading or error states, no auth boundary. One 830-line page.tsx fakes navigation with a view variable."
  ],
  "sources": [".ai/backlog.json#CS-6"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Navigation and the signed-in boundary grew one page at a time and are inconsistent. Fixing the routing and auth boundary first unblocks the product work; the shared visual shell is separate and follows."
  ],
  "sources": [".ai/backlog.json#CS-6"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "1 page.tsx in v2; UX/UI recorded at 15%",
        "Product Architect 2026-09-19: bundled as one XL it blocks five product tickets; routing and auth carry different risk from styling"
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        {
          "step": "Frontend",
          "at": "2026-09-23T13:58:28.410Z",
          "note": "Real per-page routes created under app/(app)/ with one shared auth-boundary component (AuthenticatedShell): /dashboard, /jobs, /saved, /resume, /settings, /career-resources, /preparation. Root / is now sign-in-only, redirecting an authenticated visit to /dashboard; every private route redirects an unauthenticated visit to / before rendering any content (verified: session.isPending renders neutral loading, never children). Sign-out moved from the old monolithic header into the shared shell (one place, works from every route). One shared QueryClient (app/providers.tsx) so the session cache is genuinely shared across routes instead of refetched per navigation. Verified live in a real browser: sign-in -> /dashboard redirect, all 7 routes render with real data, direct unauthenticated visit to /jobs bounces to / with no content flash, sign-out works and redirects, typecheck/lint/next build all clean."
        },
        {
          "step": "Frontend",
          "at": "2026-09-23T13:58:28.411Z",
          "note": "KNOWN GAP, not yet closed: v2/scripts/check-ui.ts (the automated Playwright E2E/accessibility suite) still drives navigation the old way (button clicks inside a workspace-nav with view-switching, e.g. workspaceNav.getByRole(\"button\",{name:\"Preparation\"}), post-sign-in landing on the search view directly). It has not been updated for the new real-route navigation and will fail as-is. This is real, tracked debt on this ticket, not silently skipped: verification for this round was done by direct interactive browser testing (documented above) rather than the automated suite. Next step before closing this ticket: rewrite check-ui.ts navigation calls to follow real links/URLs."
        },
        "QA",
        {
          "step": "Independent Reviewer",
          "at": "2026-09-23T17:58:51.592Z",
          "note": "Same Independent Reviewer pass, P2 finding: 401 session-expiry handling was three inconsistent ad hoc implementations across routes, and Resume/Settings had none at all (stuck on an unrecoverable inline error). Fixed by centralizing: lib/api.ts now dispatches one SESSION_EXPIRED_EVENT on every 401, and AuthenticatedShell is the single listener that resets the session cache and redirects to /?expired=1 - closing both the Resume/Settings gap and a related P3 finding (two competing redirect targets racing on the same tick). typecheck/lint/build clean; Lighthouse accessibility 100/100 reconfirmed after the fix."
        },
        "QA"
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-6", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "One routing definition with the signed-in boundary enforced in a single place",
    "An unauthenticated request to a private route cannot render any private data, even briefly",
    "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change"
  ],
  "sources": [".ai/backlog.json#CS-6"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "One routing definition with the signed-in boundary enforced in a single place",
    "An unauthenticated request to a private route cannot render any private data, even briefly",
    "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change"
  ],
  "sources": [".ai/backlog.json#CS-6"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-6"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-6-AC1",
      "sourceText": "One routing definition with the signed-in boundary enforced in a single place",
      "expectedResult": "One routing definition with the signed-in boundary enforced in a single place",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-6-AC2",
      "sourceText": "An unauthenticated request to a private route cannot render any private data, even briefly",
      "expectedResult": "An unauthenticated request to a private route cannot render any private data, even briefly",
      "verificationIds": ["AUTOMATED_BROWSER", "AUTOMATED_SECURITY"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-6-AC3",
      "sourceText": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "expectedResult": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-6"]
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
    "frontend structure",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract."
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
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
    ".ai/backlog.json#CS-6",
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
      "sourceMapping": {
        "existingEndpoints": [],
        "sourceEvidence": "apps/api/src/app.ts; packages/core/src/schema.ts; apps/web/src/lib/api.ts",
        "missingRequirements": [],
        "authorization": "Session-derived ownership; no client-selected owner.",
        "readWrite": "No API implied; missing operations require separately approved domain contracts.",
        "uiOnly": true
      },
      "registrationAuthority": "apps/api/src/app.ts",
      "rule": "Use registered Fastify routes and the single same-origin client; new operations need reviewed schemas and negative authorization contracts.",
      "errors": "400 invalid input; 401 session absent; 403 origin/CSRF; owner-safe 404; 409 revision/idempotency conflict; 413 payload; 429 rate limit; 507 storage capacity only where applicable.",
      "unknownContracts": []
    }
  ],
  "sources": [".ai/backlog.json#CS-6", "docs/API-SURFACE.md"]
}
```

## 13. design

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-6",
      "ui": true,
      "status": "DESIGN_PARTIAL",
      "primaryRef": "design/canonical/app/careerscope-dashboard-desktop-expanded.png",
      "references": [
        "design/01-IMPLEMENTATION-ORDER/04-candidate-core",
        "design/canonical/app/careerscope-applications-desktop.png",
        "design/canonical/app/careerscope-dashboard-desktop-expanded.png",
        "design/canonical/app/careerscope-jobs-desktop-final.png"
      ],
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
    "auth boundary becomes explicit",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries."
  ],
  "sources": [".ai/backlog.json#CS-6", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-6",
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
      "ticketId": "CS-6",
      "acId": "CS-6-AC1",
      "criterion": "One routing definition with the signed-in boundary enforced in a single place",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-6-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-6",
      "acId": "CS-6-AC2",
      "criterion": "An unauthenticated request to a private route cannot render any private data, even briefly",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "CS-6-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run test:ui",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        },
        {
          "type": "AUTOMATED_SECURITY",
          "expectedCheck": "CS-6-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-6",
      "acId": "CS-6-AC3",
      "criterion": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-6-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
  "sources": [".ai/backlog.json#CS-6", "docs/TESTING.md"]
}
```

## 22. visualRegression

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "exactReferences": [
        "design/01-IMPLEMENTATION-ORDER/04-candidate-core",
        "design/canonical/app/careerscope-applications-desktop.png",
        "design/canonical/app/careerscope-dashboard-desktop-expanded.png",
        "design/canonical/app/careerscope-jobs-desktop-final.png"
      ],
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
      "id": "CS-6-AC1",
      "sourceText": "One routing definition with the signed-in boundary enforced in a single place",
      "expectedResult": "One routing definition with the signed-in boundary enforced in a single place",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-6-AC2",
      "sourceText": "An unauthenticated request to a private route cannot render any private data, even briefly",
      "expectedResult": "An unauthenticated request to a private route cannot render any private data, even briefly",
      "verificationIds": ["AUTOMATED_BROWSER", "AUTOMATED_SECURITY"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-6-AC3",
      "sourceText": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "expectedResult": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-6"]
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
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-6"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-6 problem and each criterion with Frontend.",
    "Resolve only the recorded CS-6 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for Frontend route architecture and auth boundary.",
    "Implement and verify CS-6-AC1: One routing definition with the signed-in boundary enforced in a single place",
    "Implement and verify CS-6-AC2: An unauthenticated request to a private route cannot render any private data, even briefly",
    "Implement and verify CS-6-AC3: Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
    "Reconcile CS-6 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-6"]
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
      "downstream": ["CS-36", "CS-37", "CS-38", "CS-39", "CS-49", "CS-88", "CS-47"],
      "edgePolicy": "Existing declared dependencies are HARD unless individually approved otherwise."
    }
  ],
  "sources": [".ai/backlog.json#CS-6"]
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
  "sources": [".ai/backlog.json#CS-6", ".ai/blocker-classification.json", "hostpending.txt"]
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
    ".ai/backlog.json#CS-6",
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
      "releaseTarget": null,
      "releaseState": "RELEASE",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "IMPLEMENT_NOW",
      "featureFlag": null,
      "holdReason": null,
      "implementationOrder": null,
      "reviewers": ["UX", "System Designer", "Security"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    ".ai/design-ticket-coverage.json",
    ".ai/blocker-classification.json"
  ]
}
```

## Open specification gates

| Code                     | Reason                                                                                                                   | Owner         | Evidence                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------- |
| PARTIAL_DESIGN           | References exist, but the exact ticket-specific surface/state mapping is not established by the screen index.            | UX            | Ticket-specific state and viewport mapping or independently approved design N/A rationale.               |
| RELEASE_TARGET_UNDECIDED | Source registry has no approved release assignment.                                                                      | Product owner | Explicit release assignment or owner-approved future-release disposition.                                |
| EXACT_AC_TEST_BINDING    | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA            | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
