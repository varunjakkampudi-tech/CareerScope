# CS-2 — Lead table header offset is wrong on Linux WebKit at 768px

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: DRAFT; readiness: INCOMPLETE.

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
    "The sticky header is 48px out on Safari at tablet width, so rows sit underneath it.",
    {
      "requirement": "The backlog userProblem sentence is the original report, not verified current behavior: the recorded Linux Chromium/Firefox measurements did not reproduce its 768px header offset, and WebKit failed earlier on a different 390px row-overlap assertion. That separate overlap was traced to stale virtualizer measurement across a compact/card layout change and historically fixed with deferred remeasurement. Neither the historical 390px fix nor those runs prove the 768px acceptance criterion; do not present the original report as a currently reproduced defect.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "On one browser engine, the table header on the Leads page sits in the wrong place at tablet width, so it overlaps the rows you are trying to read. Two attempted fixes did not hold because both treated it as a timing fluke; it is not.",
    {
      "requirement": "Prevent a false-positive closure of a browser-specific layout defect: maintain a reproducible, viewport-specific assertion against the current candidate saved-workspace surface, and require an explicit owner disposition if the named legacy surface/defect no longer exists.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
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
    "No new service, technology, schema or endpoint is prescribed merely to reproduce a screenshot.",
    {
      "requirement": "Do not silently retitle/re-scope CS-2, change source acceptance criteria, create a successor ticket, restore the removed LeadTable implementation, or claim the 390px fix satisfies the 768px issue. Any such ticket-record decision is deferred to the explicit owner disposition and a later authorized registry change.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/PROJECT-STATE.md",
    "docs/ARCHITECTURE.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md"
  ]
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
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC2",
      "sourceText": "Root cause named; the assertion is not widened",
      "expectedResult": "Root cause named; the assertion is not widened",
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC3",
      "sourceText": "check-ui.mjs green on all three engines in CI",
      "expectedResult": "check-ui.mjs green on all three engines in CI",
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "requirement": "Before changing behavior, resolve whether CS-2 remains the 768px header-offset defect or should be dispositioned separately from the historical 390px virtualizer-overlap fix. Preserve the three source acceptance-criterion strings and their order in this phase; no renaming, deletion, replacement or ticket creation is authorized by specification work.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "For the original 768px claim, run the currently registered browser harness in the pinned Linux Playwright environment with WebKit at an actual 768 CSS-pixel viewport; identify the exact rendered saved-workspace element and compare its measured geometry to an approved, named expected value. If no such header/table element or approved geometry exists in the current /saved UI, record NOT_REPRODUCED/NOT_APPLICABLE with DOM and design evidence and do not turn the 390px result into a pass.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "For the separately recorded 390px issue, use a separate named regression assertion and report it as historical related work, not as satisfaction of CS-2 AC1. Never broaden a selector, tolerance, or assertion to make either viewport pass.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "The current browser entry point is scripts/check-ui.ts, invoked by npm run test:ui, and the current route is /saved. The legacy check-ui.mjs/LeadTable source mentioned by historical evidence is not the current executable contract after repository consolidation. The eventual hosted result must identify the actual current CI step and exact SHA, not claim the removed legacy filename ran.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
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
    "none",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: LOCAL_MODULE. The canonical implementation boundary is the authenticated Next.js /saved route and SavedLeads feature in apps/web; the observed browser harness is scripts/check-ui.ts. No API, database, matching, worker, provider or deployment change is implied. Inspect the actual current DOM/CSS before defining a geometry assertion; do not assume the deleted legacy table or CSS variable still exists.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
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
      "requirement": "NOT_APPLICABLE: the acceptance criteria require browser layout verification only; no database schema, saved-lead state, migration, retention or persistence change is authorized. Browser fixtures must use isolated synthetic test records.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
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
      "requirement": "NOT_APPLICABLE: this layout regression has no API request/response or persistence contract. The /saved route continues to use its existing owner-scoped API behavior; do not alter it to address a visual geometry issue.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/API-SURFACE.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
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
    "Reuse tokens, atoms and composites through CS-95, CS-105 and CS-106; routes compose feature components and the canonical API client.",
    {
      "requirement": "Use the existing SavedLeads feature and shared responsive/layout tokens in the current /saved page. Do not introduce a one-off table implementation or new component solely to preserve a removed legacy surface; any future component change requires an approved design mapping.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "design/foundations/ATOMIC-DESIGN-COMPONENT-HIERARCHY.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 15. accessibility

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "WCAG 2.2 AA target: semantic headings/landmarks, accessible names, labels/instructions and associated validation errors. The required manual NVDA/VoiceOver review must identify browser, assistive-technology version, build/revision, and the ticket's actual supported state inventory, with observed announcement/focus order and exact failure condition. Auth-specific states such as invalid/expired, success and signed-out are required only when the ticket contract supports them; otherwise record them as NOT_APPLICABLE with the contract citation. Automated axe output is not a substitute.",
    "Keyboard-only navigation with visible focus, logical order, Escape/focus trap/restoration for dialogs, and status/error announcements for async operations.",
    "Non-color status indicators, contrast review, reduced motion and zoom/reflow; NVDA/VoiceOver judgment remains future HUMAN VALIDATION.",
    {
      "requirement": "The geometry regression must remain keyboard-neutral and preserve semantic names/focus order of existing saved-workspace controls. Verify at least the Save/Details controls remain reachable and named in the browser run; manual screen-reader acceptance remains a separate human gate and is not inferred from this visual ticket.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/ACCESSIBILITY-RESPONSIVE-LOCALIZATION-CONTRACT.md",
    "docs/FRONTEND-ARCHITECTURE.md",
    "docs/TESTING.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 16. responsive

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Verify 320, 390, 768, 1024 and 1440px; ordinary content does not cause horizontal overflow; tables have deliberate narrow-screen behavior.",
    "Use mapped approved reference geometry; touch targets and long localized text remain usable; do not invent unsupported mobile designs.",
    {
      "requirement": "The source defect viewport is exactly 768 CSS px; run additional 390px only for the separately classified historical row-overlap control. Record window.innerWidth and documentElement.scrollWidth; do not substitute a nearby viewport or device scale factor for CSS width. Other responsive design acceptance is governed by the canonical saved-jobs ticket and is not broadened here.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/ACCESSIBILITY-RESPONSIVE-LOCALIZATION-CONTRACT.md",
    "docs/FRONTEND-ARCHITECTURE.md",
    "docs/TESTING.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 17. browsers

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Chromium",
    "Firefox",
    "WebKit",
    {
      "requirement": "Execute Chromium, Firefox and WebKit in the repository-pinned Linux browser image, recording each engine/version and actual viewport. WebKit at 768px is the source target; the other engines are controls. An engine that does not launch is NOT_RUN, not PASS.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/TESTING.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 18. seo

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "requirement": "NOT_APPLICABLE: /saved is an authenticated candidate workspace and must remain non-indexable; this ticket must not add public metadata or expose saved-job data to crawlers.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
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
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries.",
    {
      "requirement": "SECURITY_IMPACT: PRIVACY_PII, INPUT_VALIDATION. Actor is an authenticated candidate; only that candidate's saved records may appear in /saved. Browser regression fixtures use synthetic titles/companies and isolated owners. Do not capture real candidate/job notes, tokens, cookies or resume content in screenshots, traces, or logs. No authz changes are implied.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 20. observability

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Correlate safe request/command/execution identifiers; record failure categories and health without sensitive payloads.",
    {
      "requirement": "No production telemetry change is required for a CSS/layout defect. Test output records browser engine, viewport, selector identity, measured geometry and expected geometry only; avoid recording rendered user data.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
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
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "For Linux WebKit only, the target exists exactly once; window.innerWidth is 768; actual and approved expected geometry are both finite; the measured offset equals the approved expected offset within only the pre-approved tolerance. Before-fix evidence must demonstrate the ticket's specific 768px mismatch to call the defect reproduced. If the current surface has no target or no approved expected geometry, the test fails closed as unresolved and cannot report CS-2 accepted. The 390px overlap result cannot satisfy this assertion.",
          "candidateCommand": null,
          "evidenceRequired": "Future redacted Playwright trace/result with exact commit, WebKit version, 768x900 CSS viewport, target identity, measured/expected geometry, approved tolerance and distinct 390px control result; no such current run is claimed.",
          "automationStatus": "PLANNED",
          "owner": "Frontend, UX and QA; Release reviewer for hosted evidence",
          "releaseGate": "CS2_CURRENT_SURFACE_768PX_REPRODUCTION"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "reviewer": "Frontend, UX and QA; Release reviewer for hosted evidence",
          "testStatus": "PLANNED",
          "reviewStatus": "DRAFT",
          "type": "AUTOMATED_BROWSER",
          "preconditions": "The owner has confirmed that the current authenticated /saved surface is the intended target and UX has approved the exact element/state and 768px expected geometry. A Linux Playwright container matching the repository lockfile can launch WebKit.",
          "setup": "Create isolated synthetic owner data with one saved lead; launch the current Next.js app and scripts/check-ui.ts browser harness; set viewport to exactly 768 by 900 CSS pixels; capture browser name/version, window.innerWidth, target selector identity, element bounding box and computed expected geometry. Do not use real account data or historical removed source files as runtime fixtures.",
          "procedure": "Run within the canonical integration CI environment: PostgreSQL with migrations, Redis, LocalStack SQS, built files worker/domain packages, production Next.js build/server and the isolated temporary test database created by scripts/check-ui.ts. In Linux WebKit, navigate to /saved and wait for the saved-workspace heading and the single UX-approved target element. Measure its actual geometry and the reference-derived expected position using the approved design contract. Chromium and Firefox remain suite-level controls at their existing configured viewports; the 768px defect assertion is WebKit-specific. Preserve the separate 390px row-stacking check as a distinct assertion and result.",
          "assertion": "For Linux WebKit only, the target exists exactly once; window.innerWidth is 768; actual and approved expected geometry are both finite; the measured offset equals the approved expected offset within only the pre-approved tolerance. Before-fix evidence must demonstrate the ticket's specific 768px mismatch to call the defect reproduced. If the current surface has no target or no approved expected geometry, the test fails closed as unresolved and cannot report CS-2 accepted. The 390px overlap result cannot satisfy this assertion.",
          "expectedResult": "A real current-surface 768px Linux-WebKit defect is either demonstrated with exact geometry for root-cause correction or explicitly reported as not reproduced; no inference from Windows or another viewport is accepted.",
          "testName": "CS-2 Linux WebKit reproduces the approved saved-workspace 768px header geometry",
          "testFileOrProcedureId": "scripts/check-ui.ts",
          "fixtures": "Existing isolated check-ui owner fixture and one synthetic saved lead; approved UX target/geometry; no real credentials, resume data, external posting navigation or production services.",
          "negativeCase": "Wrong viewport, missing/duplicate target, missing expected geometry, non-finite measurement, unapproved tolerance, wrong engine, no before-fix reproduction, or substituting the historical 390px overlap must fail as NOT_ACCEPTED; a healthy geometry positive control passes only at the approved expected offset.",
          "evidenceArtifact": "Future redacted Playwright trace/result with exact commit, WebKit version, 768x900 CSS viewport, target identity, measured/expected geometry, approved tolerance and distinct 390px control result; no such current run is claimed.",
          "releaseGate": "CS2_CURRENT_SURFACE_768PX_REPRODUCTION"
        }
      ]
    },
    {
      "ticketId": "CS-2",
      "acId": "CS-2-AC2",
      "criterion": "Root cause named; the assertion is not widened",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "The review artifact names a concrete source-level cause supported by the before-fix trace and shows the unchanged assertion failing before and passing after the fix. A change that only changes expected value, selector, viewport, timeout, retry count or tolerance does not pass. A cause for the historical 390px WebKit race is not a root cause for the 768px ticket unless separate evidence demonstrates the same mechanism at the approved 768px target.",
          "candidateCommand": null,
          "evidenceRequired": "Future independent code/test review containing before/after assertion identity or hash, root-cause source references and both viewport outcomes.",
          "automationStatus": "PLANNED",
          "owner": "Frontend, QA and independent reviewer",
          "releaseGate": "CS2_ROOT_CAUSE_WITH_UNCHANGED_ASSERTION"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "reviewer": "Frontend, QA and independent reviewer",
          "testStatus": "PLANNED",
          "reviewStatus": "DRAFT",
          "type": "AUTOMATED_BROWSER",
          "preconditions": "The target defect and approved target geometry for AC1 are established; the exact assertion is checked into scripts/check-ui.ts before any implementation change.",
          "setup": "Capture the failing pre-fix assertion from Linux WebKit at 768px and the separate 390px row-overlap control. Preserve the same fixture, selector, browser image, viewport, expected value and tolerance for before/after runs.",
          "procedure": "Trace the failing 768px geometry to the responsible current layout rule/component; record a causal explanation referencing the measured values and source path. Make the smallest correction and run the identical browser procedure against the fixed revision without editing its assertion, selector, viewport or tolerance.",
          "assertion": "The review artifact names a concrete source-level cause supported by the before-fix trace and shows the unchanged assertion failing before and passing after the fix. A change that only changes expected value, selector, viewport, timeout, retry count or tolerance does not pass. A cause for the historical 390px WebKit race is not a root cause for the 768px ticket unless separate evidence demonstrates the same mechanism at the approved 768px target.",
          "expectedResult": "The 768px cause and correction are causally supported, and the exact assertion is unchanged across failing and passing revisions.",
          "testName": "CS-2 root-cause fix passes the unchanged 768px browser assertion",
          "testFileOrProcedureId": "scripts/check-ui.ts",
          "fixtures": "Same synthetic owner/lead fixture and pinned browser environment as CS-2-AC1; source diff and redacted before/after traces.",
          "negativeCase": "If no 768px failure can be demonstrated, no root cause can be claimed and the ticket remains unaccepted; assertion widening, 390px-only proof or unrelated CSS change fails review.",
          "evidenceArtifact": "Future independent code/test review containing before/after assertion identity or hash, root-cause source references and both viewport outcomes.",
          "releaseGate": "CS2_ROOT_CAUSE_WITH_UNCHANGED_ASSERTION"
        }
      ]
    },
    {
      "ticketId": "CS-2",
      "acId": "CS-2-AC3",
      "criterion": "check-ui.mjs green on all three engines in CI",
      "verification": [
        {
          "type": "HOSTED_CI",
          "expectedCheck": "The exact reviewed SHA has a completed green integration job; the current named browser acceptance step executed npm run test:ui successfully with Chromium, Firefox and WebKit and no skipped suite engine; the job checkout SHA equals the submitted SHA. The CS-2-specific 768px defect assertion is required only in its target WebKit run, not duplicated across other engines unless separately approved. Missing step result, any skipped suite engine or a different SHA fails the criterion.",
          "candidateCommand": null,
          "evidenceRequired": "Future GitHub Actions exact-SHA run URL and job/step IDs, checked-out SHA, named browser-case output, engine versions, conclusions and artifact locator.",
          "automationStatus": "PLANNED",
          "owner": "QA and Release Manager",
          "releaseGate": "CS2_EXACT_SHA_HOSTED_BROWSER_CI"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "reviewer": "QA and Release Manager",
          "testStatus": "PLANNED",
          "reviewStatus": "DRAFT",
          "type": "HOSTED_CI",
          "preconditions": "A reviewed implementation commit contains the CS-2 test and fix; its source is on the authorized branch and the normal required CI workflow runs without skip/continue-on-error/retry suppression.",
          "setup": "Record the exact commit SHA, workflow run URL, integration job named 'Test CareerScope (integration — database, queue, storage, browsers)', Playwright version and per-engine execution evidence for the CS-2 scenario.",
          "procedure": "Inspect the exact-SHA CI run and logs/artifact to confirm the full current browser suite ran in Linux Chromium, Firefox and WebKit, and that the CS-2-specific 768px geometry assertion ran in Linux WebKit only. Confirm scripts/check-ui.ts was invoked by npm run test:ui in the named browser-acceptance step and all required job steps completed. Compare the checked-out SHA in the job to the reviewed commit; do not infer from a green run on a parent or different SHA.",
          "assertion": "The exact reviewed SHA has a completed green integration job; the current named browser acceptance step executed npm run test:ui successfully with Chromium, Firefox and WebKit and no skipped suite engine; the job checkout SHA equals the submitted SHA. The CS-2-specific 768px defect assertion is required only in its target WebKit run, not duplicated across other engines unless separately approved. Missing step result, any skipped suite engine or a different SHA fails the criterion.",
          "expectedResult": "The current three-engine browser suite is green in hosted CI for the exact reviewed source revision, and the CS-2-specific 768px assertion is green in its WebKit target run.",
          "testName": "hosted integration job runs CS-2 768px browser assertion on the exact commit",
          "testFileOrProcedureId": ".github/workflows/ci.yml#integration/Test CareerScope (browser acceptance and axe accessibility — Chromium, Firefox, WebKit)",
          "fixtures": "CI's existing synthetic owner/database fixtures and pinned Playwright service image; only redacted job metadata/artifacts are retained.",
          "negativeCase": "Green CI on another SHA, only local browser success, skipped/missing WebKit, a swallowed child process exit or a historical run fails; genuine test failure must remain nonzero.",
          "evidenceArtifact": "Future GitHub Actions exact-SHA run URL and job/step IDs, checked-out SHA, named browser-case output, engine versions, conclusions and artifact locator.",
          "releaseGate": "CS2_EXACT_SHA_HOSTED_BROWSER_CI"
        }
      ]
    },
    {
      "requirement": "TEST_STATUS: PLANNED. Extend the existing scripts/check-ui.ts browser scenario (do not create a parallel browser framework) with a specifically named CS-2 Linux WebKit 768px procedure after the owner/design target is resolved. This harness requires the integration environment: PostgreSQL and migrations, Redis, LocalStack SQS, the built files worker/domain packages, the production Next.js build and server, with its isolated temporary database and synthetic owner fixture. The CI lane provides these services and invokes npm run test:ui after build/startup. Bind setup to isolated synthetic owner data, assert that the intended element exists exactly once, assert measured top/height/overlap against approved expected geometry with an explicit approved tolerance, and capture Chromium/Firefox suite controls. A missing target or expected measurement must fail closed as unresolved rather than skip or pass.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/TESTING.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
  ]
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
    },
    {
      "requirement": "Use design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png only as page context. It is not an exact 768px sticky-header baseline. No pixel baseline, selector, CSS custom property or numeric expected offset may be invented; obtain a named approved viewport/state/geometry reference before visual pass.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/visual-parity-acceptance.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
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
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC2",
      "sourceText": "Root cause named; the assertion is not widened",
      "expectedResult": "Root cause named; the assertion is not widened",
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-2",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-2-AC3",
      "sourceText": "check-ui.mjs green on all three engines in CI",
      "expectedResult": "check-ui.mjs green on all three engines in CI",
      "verificationIds": ["HOSTED_CI"],
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
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification.",
    {
      "requirement": "Implementation DoD: owner disposition resolves the named-defect-versus-related-390px-fix ambiguity; an exact approved current /saved 768px target geometry exists; the Linux WebKit browser assertion reproduces the original failure before fix and passes after a root-cause fix without widened thresholds; Chromium/Firefox controls and isolated synthetic data pass; current harness changes are included in exact-SHA hosted CI; no user data is present in evidence. If the original defect is not reproducible, CS-2 remains unaccepted until the owner selects the record disposition through an authorized future ticket update.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
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
        "Current Node 24 cross-engine run and exact hosted CI locator covering the named viewport/engine assertion."
      ],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    },
    {
      "requirement": "Required future evidence: source-bound before/after Linux Playwright run with WebKit at 768 CSS px, all three engine versions/results, exact element/geometry assertion, root-cause diff, test command and nonzero pass totals, exact hosted CI SHA/job/check URL, design/UX expected-geometry approval, and redacted synthetic-only artifacts. Existing 2026-09-21 runs are historical context only.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/TESTING.md",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
  ]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "requirement": "Keep the frozen source acceptance-criterion wording unchanged; treat its check-ui.mjs filename as historical after consolidation. The current executable equivalent is the named CI browser-acceptance step running npm run test:ui through scripts/check-ui.ts.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Obtain the explicit owner scope/disposition decision and UX approval of the current /saved target element/state and expected 768 CSS-pixel geometry; the saved-jobs design image is page context only.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Inspect SavedLeads markup/styles and establish the Linux WebKit 768px baseline using the approved target and geometry; preserve the separate 390px row-overlap check as a distinct historical control.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Only if the named 768px defect reproduces, identify its supported root cause and make the smallest permitted layout correction without changing selector, viewport, expected value, tolerance, or retry behavior.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Add or update the named scenario in scripts/check-ui.ts with isolated synthetic owner data; run the full browser suite on Chromium, Firefox, and WebKit, while asserting the CS-2-specific 768px geometry only in WebKit.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Review keyboard/responsive behavior and sanitized evidence; obtain the independent QA/UX and exact-SHA hosted CI results required by the ticket before any later workflow acceptance. Preserve releaseTarget 3.0.1 without inferring activation from releaseState UNSPECIFIED.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    ".ai/backlog.json#CS-2",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
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
    },
    {
      "requirement": "OWNER_DECISION_REQUIRED: choose whether CS-2 continues to target the unreproduced 768px offset or should be formally dispositioned separately from the historical 390px fix; no registry edit is made in Phase 3.25.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "HUMAN_VALIDATION: UX must approve the exact current saved-workspace 768px element/state/expected geometry because the approved saved-jobs image does not specify sticky-header measurements.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "HOSTED_REQUIRED: after any future authorized implementation, the exact commit must run the current browser CI lane on Linux with Chromium, Firefox and WebKit; historical CI run IDs do not satisfy this gate.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    ".ai/blocker-classification.json",
    "hostpending.txt",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/TESTING.md",
    "docs/PROJECT-STATE.md"
  ]
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
    },
    {
      "requirement": "Risk: a 390px related fix or screenshot-only visual resemblance is misreported as satisfaction of a 768px source criterion. Recovery: preserve original AC and evidence, revert only an independently reviewed local layout change if regression is found, and keep the ticket unaccepted until the owner-approved scope and original exact assertion are satisfied. No data migration or production rollback is implicated.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-2",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/README.md",
    "design/01-IMPLEMENTATION-ORDER/04-candidate-core/09-saved-jobs.png",
    "apps/web/src/app/(app)/saved/page.tsx",
    "apps/web/src/components/saved-leads.tsx",
    "scripts/check-ui.ts",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PROJECT-STATE.md"
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
