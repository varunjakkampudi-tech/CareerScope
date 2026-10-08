# CS-5 — Consolidate the application into one canonical workspace

Content-reviewed specification; this does not assert implementation or execution evidence. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: APPROVED; readiness: IMPLEMENTATION_READY.

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
  "requirements": [
    "Two application layers to maintain; only one ships.",
    {
      "requirement": "A developer must have one canonical Next/Fastify/PostgreSQL workspace without hidden build/runtime reliance on obsolete SQLite or wrapper applications. Optional Pages is a sanitized static publication artifact, not a second private runtime.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
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
      "verificationIds": ["AUTOMATED_INTEGRATION"],
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
    },
    {
      "requirement": "Root install/build/test/typecheck/lint commands operate the surviving canonical apps/packages. Preserve consumed providers/matching/resume/shared packages and their regression tests; do not delete domain dependencies just to remove historical names.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Reconcile active onboarding documentation as part of the single-workspace contract: audit START-HERE/01-SETUP.md for claims about .vscode/mcp.json, ignored data paths and Windows-specific Node setup, classify each claim as current/optional/historical, and update or explicitly disposition stale instructions. The clean-checkout acceptance must not leave an active setup path pointing at deleted or ignored runtime assets.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Optional public export selects only explicitly configured owner's non-archived PostgreSQL saved_leads via parameterized owner_id. Project exactly title/company/location/source/postedAt/url; never notes/resumes/scores/email/identity/session fields. URL sanitization accepts allowlisted HTTPS public destinations and drops credentials/tracking/private paths.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Remove obsolete SQLite MCP launcher/config only after consumer inventory proves canonical API has no MCP contract. Do not create a replacement endpoint or keep an obsolete executable merely as archive.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "No active v2 application wrapper or duplicate SQLite/Vite private runtime remains. Historical evidence may retain old paths; optional static mobile-site is classified as publication rather than a second product backend.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
    "large",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: CROSS_MODULE. Migration safety is consumed shared libraries -> canonical imports/builds/tests -> obsolete runtime removal -> clean checkout parity. This specification does not perform another consolidation or delete current static publication assets.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
      "requirement": "EXISTING_CONTRACT: saved_leads owner_id and status filter are export authority; data JSON supplies public job metadata. Export writes jobs.json via temporary-file rename only if public jobs change. No SQLite production database, new schema or production data migration implied.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
    "docs/PHASE-3-25-LOCAL-VALIDATION-2026-10-06.md"
  ]
}
```

## 12. apiContract

```json
{
  "applicability": "NOT_APPLICABLE",
  "reason": "Workspace consolidation is repository architecture work, not an application endpoint contract."
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
    {
      "requirement": "SECURITY_IMPACT: AUTHORIZATION, PRIVACY_PII. Public export requires explicit authorized owner selection, parameterized query and field/URL allowlist. Synthetic fixtures only; DB credentials never printed or committed. Missing owner refuses before query.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
          "type": "AUTOMATED_INTEGRATION",
          "expectedCheck": "A export contains only Aactive public postings, excludes Aarchived/B and all private sentinels. Each job key set equals title/company/location/source/postedAt/url; invalid/private/credential URLs omitted and allowed query keys only retained. B control exports B only. Missing owner refuses before DB query/output change; canonical files unchanged.",
          "candidateCommand": null,
          "evidenceRequired": "Future named disposable DB export outcomes and canonical-byte preservation; existing pure publicJobs tests are not SQL ownership proof.",
          "automationStatus": "PLANNED",
          "owner": "System Designer, Security, Infrastructure and QA",
          "releaseGate": "OPTIONAL_PUBLIC_EXPORT_PRIVACY"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "reviewer": "System Designer, Security, Infrastructure and QA",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED",
          "type": "AUTOMATED_INTEGRATION",
          "preconditions": "Copied actual export module executes in validated temporary repository tree against disposable PostgreSQL; no default canonical output/config adapters permitted.",
          "setup": "OwnersA/B have distinct saved_leads including Aactive, Aarchived, Bactive. Rows carry synthetic private-field sentinels and valid/invalid source URLs; configure PUBLIC_EXPORT_OWNER_ID=A using throwaway connection.",
          "procedure": "Run actual exportMobile in isolated tree, inspect jobs.json and safe query/outcome, then repeat for B and for missing owner; compare canonical file hashes before/after.",
          "assertion": "A export contains only Aactive public postings, excludes Aarchived/B and all private sentinels. Each job key set equals title/company/location/source/postedAt/url; invalid/private/credential URLs omitted and allowed query keys only retained. B control exports B only. Missing owner refuses before DB query/output change; canonical files unchanged.",
          "expectedResult": "Optional publication derives authorized owner's sanitized PostgreSQL job data without cross-owner/private leakage.",
          "testName": "PostgreSQL public export isolates owner archive status and allowed fields",
          "testFileOrProcedureId": "scripts/export-mobile.integration.test.mjs",
          "fixtures": "Disposable saved_leads rows, synthetic private markers, copied actual module/output assets in unique temp root; planned integration file.",
          "negativeCase": "Remove owner/status SQL predicate or expand projection/URL policy: fail; B positive control prevents empty exporter passing.",
          "evidenceArtifact": "Future named disposable DB export outcomes and canonical-byte preservation; existing pure publicJobs tests are not SQL ownership proof.",
          "releaseGate": "OPTIONAL_PUBLIC_EXPORT_PRIVACY"
        }
      ]
    },
    {
      "ticketId": "CS-5",
      "acId": "CS-5-AC2",
      "criterion": "The obsolete SQLite MCP launcher is removed because the canonical API has no MCP contract",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "Active executable MCP launcher/config no longer points to removed SQLite runtime; START-HERE/01-SETUP.md contains no stale active setup instruction for .vscode/mcp.json, ignored data or an unavailable Windows Node path; canonical product routes remain Fastify contract with no MCP addition.",
          "candidateCommand": null,
          "evidenceRequired": "Future resolved consumer inventory and negative fixture result; no production DB scan.",
          "automationStatus": "PLANNED",
          "owner": "System Designer, Security, Infrastructure and QA",
          "releaseGate": "OBSOLETE_RUNTIME_CONSUMER_REMOVAL"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "reviewer": "System Designer, Security, Infrastructure and QA",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED",
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Tracked repository inventory and canonical API contract available read-only.",
          "setup": "Enumerate workspace scripts/manifests/imports/editor launchers/workflows for SQLite MCP executable/config references; distinguish historical docs.",
          "procedure": "Resolve every active launcher/config reference and API route inventory, then inspect START-HERE/01-SETUP.md for .vscode/mcp.json, ignored-data and Windows-node claims; assert each is current, optional with a valid path, or explicitly classified as historical.",
          "assertion": "Active executable MCP launcher/config no longer points to removed SQLite runtime; START-HERE/01-SETUP.md contains no stale active setup instruction for .vscode/mcp.json, ignored data or an unavailable Windows Node path; canonical product routes remain Fastify contract with no MCP addition.",
          "expectedResult": "Removed obsolete launcher and stale setup instruction cannot be invoked or followed from active onboarding documentation.",
          "testName": "canonical workspace has no active obsolete SQLite MCP launcher",
          "testFileOrProcedureId": "scripts/check-single-workspace-contract.test.mjs",
          "fixtures": "Read-only tracked path/reference inventory, START-HERE/01-SETUP.md and planned contract checker; no MCP server installation.",
          "negativeCase": "Introduce active launcher/import referring to removed SQLite executable: fail; historical changelog citation alone does not fail.",
          "evidenceArtifact": "Future resolved consumer inventory and negative fixture result; no production DB scan.",
          "releaseGate": "OBSOLETE_RUNTIME_CONSUMER_REMOVAL"
        }
      ]
    },
    {
      "ticketId": "CS-5",
      "acId": "CS-5-AC3",
      "criterion": "The obsolete application wrapper and duplicate runtime are removed with root CI validation",
      "verification": [
        {
          "type": "HOSTED_CI",
          "expectedCheck": "All root commands run without cd v2 or obsolete application/SQLite runtime. Consumed domain packages remain present and tested; zero active imports/build/Docker/CI references resolve to deleted source. Each required lane actually executes and succeeds; skipped or unavailable lanes are NOT_RUN, not PASS.",
          "candidateCommand": null,
          "evidenceRequired": "Future exact-SHA hosted lane IDs/results, clean-install provenance and resolved path inventory; no deployment inferred.",
          "automationStatus": "PLANNED",
          "owner": "System Designer, Security, Infrastructure and QA",
          "releaseGate": "CANONICAL_CLEAN_CHECKOUT_PARITY"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "reviewer": "System Designer, Security, Infrastructure and QA",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED",
          "type": "HOSTED_CI",
          "preconditions": "Authorized clean canonical checkout of exact candidate SHA, Node24, fresh dependencies and synthetic CI services; no shipping.",
          "setup": "No old node_modules/dist/build/cache copied; inventory canonical apps/packages, root scripts, Docker/CI path references and expected consumed domain packages.",
          "procedure": "Fresh npm ci then canonical root format/lint/typecheck/unit/domain/build and required integration/browser/recovery lanes; resolve source dependencies against checkout and inspect exact hosted lane results.",
          "assertion": "All root commands run without cd v2 or obsolete application/SQLite runtime. Consumed domain packages remain present and tested; zero active imports/build/Docker/CI references resolve to deleted source. Each required lane actually executes and succeeds; skipped or unavailable lanes are NOT_RUN, not PASS.",
          "expectedResult": "Single workspace parity is proven from clean source, not stale built output.",
          "testName": "clean canonical root checkout builds and verifies without obsolete runtime",
          "testFileOrProcedureId": "CS-5-HOSTED-CLEAN-CHECKOUT-PARITY",
          "fixtures": "Future exact-SHA clean hosted checkout with throwaway service data, no environment secrets or stale assets.",
          "negativeCase": "Restore an active dependency on removed path or rely on missing stale dist: clean build fails; registration-only success cannot prove parity.",
          "evidenceArtifact": "Future exact-SHA hosted lane IDs/results, clean-install provenance and resolved path inventory; no deployment inferred.",
          "releaseGate": "CANONICAL_CLEAN_CHECKOUT_PARITY"
        }
      ]
    },
    {
      "requirement": "Local Node 24 evidence recorded 2/2 pure export tests and Chromium/Firefox/WebKit public-workspace checks on 2026-10-06. These checks do not prove PostgreSQL owner/status filtering, archived-row exclusion, isolated output-path behavior, obsolete-launcher absence under a future negative fixture, or exact-SHA hosted clean-install/build parity; the matching database/contract/hosted bindings remain PLANNED.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Planned CS-5-AC1 command: after adding scripts/export-mobile.integration.test.mjs to the root test:integration registration, run npm run test:integration under the disposable Postgres service. The named test must import a copied actual exporter rooted in a unique temporary tree and use throwaway owner IDs/data; it must preserve/hash canonical mobile-site outputs and contain no production credentials.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Planned CS-5-AC2 command: after adding scripts/check-single-workspace-contract.test.mjs to the explicit root test:unit registration, run npm run test:unit and confirm CI executes that unit-only step. The test must resolve tracked active executable/config references and include a negative fixture; historical docs are classified separately.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Planned CS-5-AC3 evidence: fresh npm ci plus canonical root quality/service/browser/recovery lanes on the exact hosted candidate SHA. The local pages:workspace:test run is a narrower static UI check and cannot substitute for this gate.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "docs/TESTING.md",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
      "id": "CS-5-AC1",
      "sourceText": "The optional Pages export reads owner-scoped PostgreSQL data",
      "expectedResult": "The optional Pages export reads owner-scoped PostgreSQL data",
      "verificationIds": ["AUTOMATED_INTEGRATION"],
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
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification.",
    {
      "requirement": "One canonical runtime root remains; consumed domain packages pass regression; optional export proves ownership/archive/public-field restriction; SQLite MCP launch/runtime consumers absent; clean-checkout canonical checks prove no removed-source dependency. Static publication is explicitly separate, not a second application.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-5",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
    "Reconcile CS-5 documentation, redacted evidence and independent review before workflow promotion.",
    {
      "requirement": "First verify the current root workspace, package manifests, imports, CI and deployment paths; the application is already consolidated, so do not repeat a migration or delete current static publication without a newly proven defect.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Confirm the remaining consumer inventory with a scoped tracked-file search; distinguish historical documentation/ticket evidence from active executable/config references. Preserve the supported static Pages publication path.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Review START-HERE/01-SETUP.md and its linked setup artifacts; remove or correct stale .vscode/mcp.json and ignored-data claims before the clean-checkout evidence is considered complete.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "For any remaining AC1 gap, add the planned disposable-PostgreSQL integration test using an isolated copied module/root and synthetic owner rows; assert owner, archive, exact-field and unchanged canonical-output invariants.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "For any remaining AC2 gap, add the planned read-only repository-contract fixture and register it in the explicit root test:unit file list so test-registration and CI checks execute it.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Run root checks from a fresh checkout without stale dist/node_modules reliance; obtain exact-SHA hosted service, browser and recovery lane evidence for AC3 rather than treating registration or local checks as hosted proof.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
    },
    {
      "requirement": "OWNER_DECISION_RESOLVED: the owner classifies CS-5 as ACTIVE_R1 foundational architecture using the existing R1 identifier, corresponding to the prepared but unpublished v1.0.0 scope. Preserve the null/unspecified source fields as historical registry metadata; do not claim publication, deployment or user activation.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    ".ai/blocker-classification.json",
    "hostpending.txt",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
      "risks": 4,
      "assumptions": "No provider capability, product decision or production acceptance is inferred from design.",
      "failureModes": [
        "Invalid input, concurrency conflict, unavailable dependency, disabled capability and cancellation where applicable."
      ],
      "recovery": "Restore the prior reviewed code/configuration; preserve stored data and validate migrations separately. Host execution is a later authorized step."
    },
    {
      "requirement": "The root architecture is already consolidated; a repeated migration or deletion pass could remove required domain packages or a still-supported static artifact. Make no structural changes unless a current consumer demonstrates a defect. Export regression must use copied module-relative paths and synthetic PostgreSQL, never write canonical mobile-site/jobs.json or publish data. Recovery from any future source edit is a reviewed revert, not data deletion or destructive host action.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-5",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "package.json",
    "scripts/export-mobile.mjs",
    "scripts/export-mobile.test.mjs",
    "scripts/stage-pages.mjs",
    "START-HERE/01-SETUP.md",
    "docs/architecture/README.md",
    "docs/PHASE-3-25-OWNER-DECISIONS-REQUIRED.md",
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
      "size": "XL",
      "complexity": 5,
      "releaseTarget": "R1",
      "releaseState": "ACTIVE_R1",
      "sourceReleaseTarget": null,
      "deliveryClassification": {
        "effectiveReleaseTarget": "R1",
        "effectiveReleaseState": "ACTIVE_R1",
        "deliveryMode": "IMPLEMENT_NOW",
        "rationale": "Owner decision OD-2026-10-08-CS5 classifies the canonical single-workspace architecture as foundational Release 1 scope using the existing R1 identifier, corresponding to the prepared but unpublished v1.0.0 release. No feature flag or user-visible activation exists; publication and deployment remain separate evidence gates.",
        "sources": [
          ".ai/backlog.json#CS-5",
          "docs/OWNER-DECISIONS-2026-10-08.md#CS-5",
          "docs/RELEASE-1.0.0.md"
        ]
      },
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "IMPLEMENT_NOW",
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

## Specification gate history

| Code                  | Disposition | Original reason                                                                                                          | Owner | Evidence                                                                                                 |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------- |
| EXACT_AC_TEST_BINDING | RESOLVED    | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA    | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
