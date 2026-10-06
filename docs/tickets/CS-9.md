# CS-9 — V2 tests in CI cover no database, queue or browser path

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: DRAFT; readiness: INCOMPLETE.

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
    "The layer where the application actually fails is the layer CI does not exercise.",
    {
      "requirement": "Unit-only success cannot prove persistence, durable queue, encrypted file storage or browser behavior; missing services must fail rather than report skipped integration as passing.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
  ]
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
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC2",
      "sourceText": "The six integration files execute rather than being skipped",
      "expectedResult": "The six integration files execute rather than being skipped",
      "verificationIds": ["AUTOMATED_CONTRACT", "AUTOMATED_INTEGRATION"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC3",
      "sourceText": "A skipped suite is reported as not run, never as passed",
      "expectedResult": "A skipped suite is reported as not run, never as passed",
      "verificationIds": ["AUTOMATED_UNIT"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "requirement": "Use disposable PostgreSQL 17.6-alpine, Redis 7.4.5-alpine and LocalStack 4.7.0 with synthetic CI-built environment; never read a real local/production environment file for mutation verification.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Historical six-file scope has expanded to nine registered integration files. Execute the entire current test:integration list serially (--test-concurrency=1), including scheduled discovery, lead liveness and retention, without removing original coverage.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Prove durable Redis setup before tests: AOF enabled, appendfsync everysec, noeviction and configured memory limit. Missing/unhealthy service or failed configuration is failure; unit-only success cannot substitute.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Report suite execution state separately from assertions passed. Browser/axe steps skipped after integration failure are NOT_RUN, not PASS; full browser acceptance requires all configured engines' actual execution.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
    "CI service topology; no application behavior change beyond making the isolated resume parser actually able to run",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: INFRASTRUCTURE, ASYNC_SYSTEM. Existing integration CI lane owns synthetic services and environment; actual test:integration command owns file registration. Preserve serial disposable-database ownership and explicit test process failure propagation.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
      "requirement": "Disposable per-suite databases and isolated queue/storage namespaces are fixtures only. Teardown waits for owned workers/queries before pool/drop; tests cannot delete production rows or connect to operator environments.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
      "requirement": "NOT_APPLICABLE to new product API: CI service readiness, test process outcomes and report classification are the contracts; preserve application APIs under test.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "docs/API-SURFACE.md",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
    "none directly; the resume-parser fix REMOVES a permanently-broken safety self-check rather than weakening a working one — network isolation for that child was never actually enforced by it and must come from the OS/container, which this change documents rather than hides",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries.",
    {
      "requirement": "SECURITY_IMPACT: SECRETS, AUDIT. CI credentials are synthetic throwaway values. Collect safe case names, exit/signal, service versions and counts, never environment contents, database rows, resume payloads or provider tokens.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
          "type": "HOSTED_CI",
          "expectedCheck": "Postgres17.6-alpine, Redis7.4.5-alpine and LocalStack4.7.0 initialize; CI-generated synthetic environment is used. AOF enabled, appendfsync everysec, configured maxmemory and noeviction validated before suite. Missing/unhealthy service yields failure not skip.",
          "candidateCommand": null,
          "evidenceRequired": "Future exact-SHA hosted job/step IDs, service versions and safe readiness/durability assertions; no configuration dumps.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "HOSTED_SERVICE_BACKED_INTEGRATION"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "HOSTED_CI",
          "preconditions": "Authorized exact-SHA canonical CI runs against disposable CI services, not the production host.",
          "setup": "Record pinned PostgreSQL/Redis/LocalStack versions and safe readiness/Redis durability output without printing environment values.",
          "procedure": "Inspect service initialization and CI-built environment step, then actual integration step service connectivity; verify Redis AOF/noeviction setup precedes tests.",
          "assertion": "Postgres17.6-alpine, Redis7.4.5-alpine and LocalStack4.7.0 initialize; CI-generated synthetic environment is used. AOF enabled, appendfsync everysec, configured maxmemory and noeviction validated before suite. Missing/unhealthy service yields failure not skip.",
          "expectedResult": "Real service-backed hosted evidence exists separately from unit success.",
          "testName": "pinned disposable services and durable Redis precede integration execution",
          "testFileOrProcedureId": "CS-9-HOSTED-SERVICE-READINESS",
          "fixtures": "Disposable CI database/queue/storage; synthetic credentials; no local .env reads or real cloud calls.",
          "negativeCase": "Disable Redis AOF/noeviction or withhold service readiness in isolated fixture; suite/setup must fail and not report coverage.",
          "evidenceArtifact": "Future exact-SHA hosted job/step IDs, service versions and safe readiness/durability assertions; no configuration dumps.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "HOSTED_SERVICE_BACKED_INTEGRATION",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-9",
      "acId": "CS-9-AC2",
      "criterion": "The six integration files execute rather than being skipped",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "All nine current files are registered in the canonical command invoked by integration lane; concurrency equals1. Registration result is explicitly not execution evidence.",
          "candidateCommand": null,
          "evidenceRequired": "Future named contract result with exact command/path inventory, not service-backed TAP.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "COMPLETE_INTEGRATION_EXECUTION"
        },
        {
          "type": "AUTOMATED_INTEGRATION",
          "expectedCheck": "Every registered file contributes actual executed tests; zero silently skipped suites; nonzero exit/signal or service/teardown failure fails. All nine files remain included. Browser/axe is separately classified, never inferred from TAP.",
          "candidateCommand": null,
          "evidenceRequired": "Future current-content service-backed per-file TAP counts plus child exit/signal and safe service versions; no hosted outcome inferred.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "COMPLETE_INTEGRATION_EXECUTION"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Read-only canonical package scripts and ci.yml are available; no service execution is claimed by registration checks.",
          "setup": "Enumerate all nine test:integration paths, original six plus scheduled discovery/liveness/retention; parse actual script and CI invocation.",
          "procedure": "Resolve integration command from actual workflow to all nine existing paths and --test-concurrency=1, without invoking environment-dependent suite.",
          "assertion": "All nine current files are registered in the canonical command invoked by integration lane; concurrency equals1. Registration result is explicitly not execution evidence.",
          "expectedResult": "All current source paths are registered without shrinking historical coverage.",
          "testName": "all nine canonical integration files are registered with serial execution",
          "testFileOrProcedureId": "scripts/check-ci-integration-contract.test.mjs",
          "fixtures": "Planned registration/report checker plus future disposable Postgres/Redis/LocalStack integration run; unique teardown ownership.",
          "negativeCase": "Drop any original or added file, point CI at a different script or remove serial setting: registration check fails; correct source passes.",
          "evidenceArtifact": "Future named contract result with exact command/path inventory, not service-backed TAP.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "COMPLETE_INTEGRATION_EXECUTION",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        },
        {
          "type": "AUTOMATED_INTEGRATION",
          "preconditions": "Fresh disposable PostgreSQL17.6, Redis7.4.5 with durable setup and LocalStack4.7.0 are healthy; isolated synthetic environment is supplied.",
          "setup": "All nine canonical integration files use unique disposable data/queue namespaces; capture safe per-file TAP and child exit/signal.",
          "procedure": "Execute actual npm run test:integration with --test-concurrency=1 and inspect each registered file's outcomes plus owned cleanup. Do not substitute mocks or registration results.",
          "assertion": "Every registered file contributes actual executed tests; zero silently skipped suites; nonzero exit/signal or service/teardown failure fails. All nine files remain included. Browser/axe is separately classified, never inferred from TAP.",
          "expectedResult": "Full current service-backed integration execution is evidenced rather than merely registered.",
          "testName": "all nine integration files produce executed outcomes against disposable services",
          "testFileOrProcedureId": "package.json#test:integration",
          "fixtures": "Planned registration/report checker plus future disposable Postgres/Redis/LocalStack integration run; unique teardown ownership.",
          "negativeCase": "Unavailable service, premature database drop or skipped-only file fails verification; complete healthy execution is positive control. No retry-away failure allowed.",
          "evidenceArtifact": "Future current-content service-backed per-file TAP counts plus child exit/signal and safe service versions; no hosted outcome inferred.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "COMPLETE_INTEGRATION_EXECUTION",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-9",
      "acId": "CS-9-AC3",
      "criterion": "A skipped suite is reported as not run, never as passed",
      "verification": [
        {
          "type": "AUTOMATED_UNIT",
          "expectedCheck": "Skipped-only or empty suite is NOT_RUN/not coverage PASS; nonzero exit/signal is failure even with passing prefix. Browser/axe skipped after integration failure remain NOT_RUN; PASS requires actual expected engine/test execution and zero failures.",
          "candidateCommand": null,
          "evidenceRequired": "Future named classification test results including positive control, skipped/empty/signal cases and three-engine separation.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "HONEST_EXECUTION_REPORTING"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_UNIT",
          "preconditions": "Integration and downstream browser report classification is tested with synthetic process/workflow outcomes.",
          "setup": "Fixtures: passing executed TAP, failing TAP, skipped-only TAP, zero-test TAP, killed process, integration failure with skipped browser/axe and positive three-engine execution control.",
          "procedure": "Feed each fixture into actual report reader/classifier or planned minimal adapter preserving node counts and job/step conclusions.",
          "assertion": "Skipped-only or empty suite is NOT_RUN/not coverage PASS; nonzero exit/signal is failure even with passing prefix. Browser/axe skipped after integration failure remain NOT_RUN; PASS requires actual expected engine/test execution and zero failures.",
          "expectedResult": "Missing execution cannot inflate release coverage.",
          "testName": "skipped integration and blocked browser steps never count as passed coverage",
          "testFileOrProcedureId": "scripts/check-ci-integration-contract.test.mjs",
          "fixtures": "Synthetic TAP and workflow-step fixtures only; actual engineering-runner TAP parser is a source, not assumed cross-lane coverage.",
          "negativeCase": "A reader that equates zero failures with PASS on zero/skipped tests fails; a reader that always refuses fails complete executed positive control.",
          "evidenceArtifact": "Future named classification test results including positive control, skipped/empty/signal cases and three-engine separation.",
          "reviewer": "Infrastructure and QA; Release Manager for hosted workflow evidence",
          "releaseGate": "HONEST_EXECUTION_REPORTING",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
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
      "verificationIds": ["HOSTED_CI"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC2",
      "sourceText": "The six integration files execute rather than being skipped",
      "expectedResult": "The six integration files execute rather than being skipped",
      "verificationIds": ["AUTOMATED_CONTRACT", "AUTOMATED_INTEGRATION"],
      "authority": ".ai/backlog.json#CS-9",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-9-AC3",
      "sourceText": "A skipped suite is reported as not run, never as passed",
      "expectedResult": "A skipped suite is reported as not run, never as passed",
      "verificationIds": ["AUTOMATED_UNIT"],
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
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification.",
    {
      "requirement": "All nine current files execute with healthy disposable services and zero unacknowledged skipped suites; missing service fails; skip/blocked downstream browser steps remain NOT_RUN. Exact-SHA hosted logs confirm service initialization, integration execution and required browser/axe acceptance before R1 release acceptance.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-9",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
    "Reconcile CS-9 documentation, redacted evidence and independent review before workflow promotion.",
    {
      "requirement": "Trace all nine root script paths to service-backed CI invocation and distinguish backfill/browser steps.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Specify fresh disposable service readiness and Redis durability assertions with missing-service negative controls.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Capture named integration outcomes and teardown diagnostics with no skip-as-pass conversion.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Verify parser/report classification against failed/skipped/empty TAP and browser step outcomes; keep hosted exact-SHA evidence separate from local service execution.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
  ]
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
    },
    {
      "requirement": "Shared service lifecycle races can terminate connections; no retries or timeouts may hide failures. Preserve original error and owned cleanup ordering. CI Redis host overcommit warning requires classification, not blind host sysctl changes.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-9",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "package.json",
    ".github/workflows/ci.yml",
    "packages/core/src/database.test.ts",
    "packages/core/src/bull-queue.test.ts",
    "scripts/engineering-runner.mjs"
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
| EXACT_AC_TEST_BINDING     | RESOLVED    | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
