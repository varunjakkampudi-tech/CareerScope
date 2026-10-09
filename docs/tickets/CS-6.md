# CS-6 — Frontend route architecture and auth boundary

Content-reviewed specification; this does not assert implementation or execution evidence. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: APPROVED; readiness: IMPLEMENTATION_READY.

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
    "Historical intake evidence from the source ticket describes the pre-route-boundary state. Current route composition and shared session boundary exist; the remaining specification gap is the unexecuted delayed/error/anonymous rendered-harness verification and privacy/cache evidence described below.",
    {
      "requirement": "Candidate deep links and route navigation must share one session-rendering boundary so delayed, failed or unauthenticated session lookup never mounts private feature content or leaks a previous owner's cached data.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
  ]
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
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-6-AC3",
      "sourceText": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "expectedResult": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "verificationIds": ["MANUAL_PRODUCT"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "requirement": "Next App Router route group (app)/layout.tsx wraps all current private routes with one AuthenticatedShell. Actual route files, not a separately invented routing map, are authoritative; dashboard-shell navigation maps to those real routes.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Session pending shows neutral Loading workspace; session lookup failure shows Workspace unavailable plus retry; unauthenticated success renders no private children and clears auth query cache before replacing route with /. These are existing behaviors to verify, not completed fresh test evidence.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Cold/untrusted delayed or failed session lookup must not mount private child components or send their owner-private queries; response HTML/RSC payload contains no fixture private data. Use fresh browser context/empty session cache for those cases. Authenticated cached navigation is a separate positive control, not incorrectly expected to become pending on refetch.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Shared query provider/session query survives private navigation. Logout and session-expired handling remain centralized; cache cleanup isolates successive owners. Do not redesign auth or claim client shell substitutes for API ownership enforcement.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "CS-13/14/16/17/19 own their feature/content work; this routing boundary supplies composition without bundling those tickets' implementation or visual acceptance into CS-6.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
    "frontend structure",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: CROSS_MODULE. Existing app route-group layout composes AuthenticatedShell; useSession shares ['session']; ownerKey scopes private data. No global store, bespoke router, duplicate gate or new server auth system.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "AC1 has no new API contract. Reuse the existing GET /api/session contract through useSession; the route group is a client composition boundary, not a new server authorization mechanism. Private APIs continue to enforce server-derived ownership.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
      "requirement": "NOT_APPLICABLE to new schema: client cache ownership and session-derived authorization are affected; no user/application database write is required by route decomposition.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
    },
    {
      "requirement": "EXISTING_CONTRACT: GET /api/session is the existing endpoint consumed by the shell. Authenticated responses include authenticated, csrf, a stable hashed owner digest, email/phone and aiEnabled where configured; anonymous responses may include registrationEnabled and cognitoEnabled. It does not return a session identity field. The source design map's empty existingEndpoints list means no endpoint is introduced by CS-6. Private API routes independently enforce server session ownership. Do not expose provider tokens or accept client-supplied owner for route data.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "docs/API-SURFACE.md",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
  ]
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
    "WCAG 2.2 AA target: semantic headings/landmarks, accessible names, labels/instructions and associated validation errors. The required manual NVDA/VoiceOver review must identify browser, assistive-technology version, build/revision, and the ticket's actual supported state inventory, with observed announcement/focus order and exact failure condition. Auth-specific states such as invalid/expired, success and signed-out are required only when the ticket contract supports them; otherwise record them as NOT_APPLICABLE with the contract citation. Automated axe output is not a substitute.",
    "Keyboard-only navigation with visible focus, logical order, Escape/focus trap/restoration for dialogs, and status/error announcements for async operations.",
    "Non-color status indicators, contrast review, reduced motion and zoom/reflow; NVDA/VoiceOver judgment remains future HUMAN VALIDATION.",
    {
      "requirement": "Neutral loading/error states announce status and expose keyboard-operable retry with accessible name; no private navigation landmarks/identity appear until authenticated. Shared skip link targets the sole main-content landmark after authentication; no focus is sent into hidden private children.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/ACCESSIBILITY-RESPONSIVE-LOCALIZATION-CONTRACT.md",
    "docs/FRONTEND-ARCHITECTURE.md",
    "docs/TESTING.md",
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries.",
    {
      "requirement": "SECURITY_IMPACT: AUTHORIZATION, PRIVACY_PII. Browser caches must not render prior owner's profile/resume/notes on anonymous or new-owner navigation. Rendering gate is not an API access-control replacement; all denial tests use synthetic separate owners.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
          "expectedCheck": "All eight private routes inherit the same shell; canonical navigation hrefs resolve; session query key/provider is shared. No parallel routing map or per-page independent authentication boundary is introduced.",
          "candidateCommand": null,
          "evidenceRequired": "Future path/import contract results; static checks alone do not prove rendered privacy.",
          "automationStatus": "PLANNED",
          "owner": "Frontend, Security and QA",
          "releaseGate": "PRIVATE_ROUTE_COMPOSITION"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Actual App Router files, group layout, shell and provider modules inspected without candidate data.",
          "setup": "Enumerate eight current private page files and their nearest group layout; resolve imports to AuthenticatedShell and shared useSession/provider.",
          "procedure": "Validate each private route inherits (app)/layout.tsx -> AuthenticatedShell and each navigation href resolves to its canonical page; inspect no per-route alternative session-render gate.",
          "assertion": "All eight private routes inherit the same shell; canonical navigation hrefs resolve; session query key/provider is shared. No parallel routing map or per-page independent authentication boundary is introduced.",
          "expectedResult": "One compositional route/session boundary serves real deep links.",
          "testName": "private routes inherit one shared session rendering boundary",
          "testFileOrProcedureId": "scripts/check-auth-route-boundary.test.mjs",
          "fixtures": "Actual route/import inventory; planned contract test file.",
          "negativeCase": "Move one private page outside group or replace its layout with direct children: fail; valid group control passes.",
          "evidenceArtifact": "Future path/import contract results; static checks alone do not prove rendered privacy.",
          "reviewer": "Frontend, Security and QA",
          "releaseGate": "PRIVATE_ROUTE_COMPOSITION",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-6",
      "acId": "CS-6-AC2",
      "criterion": "An unauthenticated request to a private route cannot render any private data, even briefly",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "Cold pending shows neutral loading; cold error safe retry; cold anonymous mounts zero private children, sends zero private feature requests and exposes no private marker in HTML/RSC/recorded DOM states before redirect. Normal cached authenticated navigation remains usable, not incorrectly expected to become pending. Authenticated positive control mounts intended real feature. OwnerB sees no ownerA marker after teardown. Genuine anonymous API reads fail401; cross-owner object reads return the route's canonical safe missing/denial contract, without private data.",
          "candidateCommand": null,
          "evidenceRequired": "Future Chromium/Firefox/WebKit named browser results with safe sentinel outcomes, no screenshots of real personal data.",
          "automationStatus": "PLANNED",
          "owner": "Frontend, Security and QA",
          "releaseGate": "PRIVATE_RENDER_AND_CACHE_ISOLATION"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_BROWSER",
          "preconditions": "Synthetic candidate ownersA/B and private sentinel data in disposable services; browser can intercept session outcome and record responses/child mounts/private requests.",
          "setup": "Cold/untrusted lookup cases each use fresh browser context and empty query cache, with delayed session, session500 or anonymous authenticated:false response. Separately exercise normal authenticated cached navigation, then ownerA logout/ownerB login using disposable real cookies. Server denial uses genuinely anonymous context and cross-owner IDs, not mocked false session.",
          "procedure": "Inspect initial HTML/RSC and DOM state records while cold session is unresolved/error/anonymous. Instrument mount/unmount sentinel on actual private feature components without replacing their behavior; record owner-private network requests. Retry error and release valid authenticated response as positive control. Independently make anonymous/cross-owner API requests with real isolated session contexts.",
          "assertion": "Cold pending shows neutral loading; cold error safe retry; cold anonymous mounts zero private children, sends zero private feature requests and exposes no private marker in HTML/RSC/recorded DOM states before redirect. Normal cached authenticated navigation remains usable, not incorrectly expected to become pending. Authenticated positive control mounts intended real feature. OwnerB sees no ownerA marker after teardown. Genuine anonymous API reads fail401; cross-owner object reads return the route's canonical safe missing/denial contract, without private data.",
          "expectedResult": "No private flash or cross-owner cached data on direct or navigated private entry.",
          "testName": "private children never mount before authenticated session resolves",
          "testFileOrProcedureId": "scripts/check-ui.ts",
          "fixtures": "Disposable two-owner profiles/notes with synthetic markers and session delay/error intercepts; planned new assertions in existing harness.",
          "negativeCase": "Temporarily rendering children before auth resolution or retaining unscoped ownerA cache must fail; authenticated positive control prevents always-hidden shell passing.",
          "evidenceArtifact": "Future Chromium/Firefox/WebKit named browser results with safe sentinel outcomes, no screenshots of real personal data.",
          "reviewer": "Frontend, Security and QA",
          "releaseGate": "PRIVATE_RENDER_AND_CACHE_ISOLATION",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-6",
      "acId": "CS-6-AC3",
      "criterion": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "verification": [
        {
          "type": "MANUAL_PRODUCT",
          "expectedCheck": "CS-6 owns only route composition/session-render boundary and shared navigation wiring; dependent ticket feature contracts remain independently owned. Graph introduces no reverse hard edge requiring all feature implementation before boundary. Existing valid dependencies are preserved.",
          "candidateCommand": null,
          "evidenceRequired": "Future source-linked architecture review with actual dependency findings; no ticket workflow promotions.",
          "automationStatus": "PLANNED",
          "owner": "Frontend, Security and QA",
          "releaseGate": "INDEPENDENT_ROUTE_FOUNDATION_SCOPE"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "MANUAL_PRODUCT",
          "preconditions": "Canonical CS-6 source/dependencies and feature-ticket sources are read-only.",
          "setup": "Read CS-13/14/16/17/19 scopes and actual shared shell/feature composition imports; establish route-boundary change plan separately from feature implementation.",
          "procedure": "Review planned CS-6 checklist and dependency graph to ensure route boundary does not require completing all feature tickets or copying their UI internals into shell.",
          "assertion": "CS-6 owns only route composition/session-render boundary and shared navigation wiring; dependent ticket feature contracts remain independently owned. Graph introduces no reverse hard edge requiring all feature implementation before boundary. Existing valid dependencies are preserved.",
          "expectedResult": "Routing foundation can be reviewed independently of large feature completion.",
          "testName": "route boundary scope remains separate from feature vertical slices",
          "testFileOrProcedureId": "CS-6-SCOPE-SEPARATION-REVIEW",
          "fixtures": "Canonical dependency graph and per-ticket scope inventory; manual technical review procedure, not existing automated test.",
          "negativeCase": "Bundling saved-table/job-details/match feature implementation into CS-6 or introducing reverse cyclic dependencies fails scope review.",
          "evidenceArtifact": "Future source-linked architecture review with actual dependency findings; no ticket workflow promotions.",
          "reviewer": "Frontend, Security and QA",
          "releaseGate": "INDEPENDENT_ROUTE_FOUNDATION_SCOPE",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
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
    },
    {
      "requirement": "CS-6 visual scope is limited to existing authenticated-shell boundary states and shared navigation: neutral pending state, service-error/retry state, anonymous redirect/no private shell, and authenticated shell/navigation. Do not require full Dashboard, Jobs or Applications screenshot parity; those feature surfaces belong to their own tickets and AC3 explicitly separates feature work. Compare only against an approved auth-boundary reference if one exists; otherwise record visual baseline as pending design approval and use functional state assertions without inventing pixel tolerances.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "design/01-IMPLEMENTATION-ORDER/00-foundations-first/visual-parity-acceptance.md",
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
  ]
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
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-6",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-6-AC3",
      "sourceText": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "expectedResult": "Split from the shared-shell work so it does not block CS-13, CS-14, CS-16, CS-17 and CS-19 behind one large change",
      "verificationIds": ["MANUAL_PRODUCT"],
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
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification.",
    {
      "requirement": "All current private routes share route-group gate; pending/error/anonymous paths never mount private children or expose synthetic private data in HTML/RSC/browser/cache. Authenticated positive and two-owner controls pass in configured browser engines; feature-specific design work stays in dependent tickets.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
      "required": [],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    },
    {
      "requirement": "AC1 future local verification: `npm run test:unit` after registering `scripts/check-auth-route-boundary.test.mjs` in the explicit root test:unit file list; verify the CI quality lane invokes that root command. The test must fail on a private route outside the shared route group, a route-specific duplicate gate, a broken canonical navigation href, or a second session query/provider. This file/assertion is PLANNED until present and passing.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "AC2 future browser verification: extend `scripts/check-ui.ts` and execute `npm run test:ui` with the configured Chromium/Firefox/WebKit matrix; verify cold pending/error/anonymous no-mount/no-private-request/no-HTML-RSC marker, authenticated positive control, and isolated owner A to owner B cache behavior. Existing historical interactive evidence is not this run.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/TESTING.md",
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
  ]
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
    "Reconcile CS-6 documentation, redacted evidence and independent review before workflow promotion.",
    {
      "requirement": "Inventory actual private route files and route-group wrapping; verify direct links and navigation use the same boundary.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Add the service-free route/import contract test as scripts/check-auth-route-boundary.test.mjs, add that exact file to the explicit root test:unit command in package.json, and confirm the CI quality job invokes npm run test:unit; do not claim the future assertion exists until it is implemented and run.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Add delayed/error/anonymous session rendered tests with private-child mount sentinel and intercepted private-query recorder.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Assert initial HTML/RSC excludes synthetic private markers and successive owner cache is cleared or segregated.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Verify authenticated positive control renders each route and shared query provider remains stable; preserve feature ticket separation.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
    },
    {
      "requirement": "OWNER RELEASE GATE: backlog releaseTarget is null and releaseState is unspecified. The design coverage value RELEASE denotes design-scope ordering only and is not version assignment or activation approval. Preserve these source values until the product/release owner assigns a target and activation disposition. This gate does not prevent completing the technical specification, but prevents release classification/promotion.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    ".ai/blocker-classification.json",
    "hostpending.txt",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
  ]
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
    },
    {
      "requirement": "A DOM-only no-flash test can miss private RSC payload or queries; inspect response and mount/request sentinels. Removing route wrapper or rendering children while lookup is pending must be detected. Route rollback restores reviewed prior composition without changing sessions, user records or database.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-6",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "apps/web/src/app/(app)/layout.tsx",
    "apps/web/src/components/authenticated-shell.tsx",
    "apps/web/src/lib/session.ts",
    "apps/web/src/components/dashboard-shell.tsx",
    "apps/web/src/lib/query-cache.ts",
    "scripts/check-ui.ts",
    "docs/DESIGN-IMPLEMENTATION-MAP.md",
    "package.json",
    ".github/workflows/ci.yml"
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
      "releaseTarget": "R1",
      "releaseState": "ACTIVE_R1",
      "sourceReleaseTarget": null,
      "deliveryClassification": {
        "effectiveReleaseTarget": "R1",
        "effectiveReleaseState": "ACTIVE_R1",
        "deliveryMode": "IMPLEMENT_NOW",
        "rationale": "Owner decision OD-2026-10-08-CS6 places the existing authenticated route/session boundary in Release 1 implementation scope after its declared gates; no new route or dashboard surface is authorized.",
        "sources": [".ai/backlog.json#CS-6", "docs/OWNER-DECISIONS-2026-10-08.md#CS-6"]
      },
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

## Specification gate history

| Code                  | Disposition  | Original reason                                                                                                          | Owner | Evidence                                                                                                 |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------- |
| PARTIAL_DESIGN        | RECLASSIFIED | References exist, but the exact ticket-specific surface/state mapping is not established by the screen index.            | UX    | Ticket-specific state and viewport mapping or independently approved design N/A rationale.               |
| EXACT_AC_TEST_BINDING | RESOLVED     | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA    | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
