# CS-8 — Readers of canonical state may treat unreadable as empty

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-8",
      "title": "Readers of canonical state may treat unreadable as empty",
      "primaryEpicId": "EPIC-DELIVERY-TOOLING",
      "area": "tooling",
      "priority": "P1",
      "status": "UAT",
      "owner": "Senior Engineer",
      "reviewers": ["Independent Reviewer", "QA"],
      "releaseTarget": "3.0.1",
      "blocked": false,
      "blockedReason": null,
      "blockedOwner": null,
      "blockedSince": null,
      "unblockEvidenceRequired": []
    }
  ],
  "sources": [".ai/backlog.json#CS-8"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "A corrupt state file can silently downgrade a blocking condition into an all-clear.",
    {
      "requirement": "A repository delivery-state reader can turn malformed/unreadable JSON into an empty finding or backlog list, producing a false all-clear. Actors are Engineering operators and automated gates, not candidates.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
  ]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Several internal checks read a status file and, if that file was damaged or unreadable, concluded there was nothing wrong. That is how a blocked release once reported itself ready. Every such reader needs to treat unreadable as a refusal."
  ],
  "sources": [".ai/backlog.json#CS-8"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "A corrupt findings.json made the release gate print PASS no open P0 or P1 and exit 0",
        "release-gate.mjs is fixed; the other readers have not been audited",
        "2026-09-22: see completedSteps and finding R4 in .ai/findings.json for the full audit, the real Independent Reviewer REVISE verdict, the two rounds of defects found and fixed, and the 24-case mutation-test evidence"
      ],
      "currentStep": "Release Manager",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        "Audited every reader of .ai/*.json in scripts/. agile.mjs's readRequired/processMode were already correct (fixed earlier under R1's line of work); release-gate.mjs was already fixed.",
        "Found and fixed R4: engineering-ui.mjs's read() collapsed unparseable into the same fallback as absent - reproduced live against the actual pre-fix server, corrupting .ai/findings.json made the real /state HTTP response show findings:{} with no error signal. Fixed by recording a distinct stateErrors entry per file and rendering it as a persistent banner client-side; added a process.argv[1] entry-point guard and exported snapshot() so it is importable and testable without starting the HTTP server.",
        "Fixed the identical bug in control-center.mjs's progress() (its sibling loopState()/findings() functions already handled this correctly); it now returns {parseError} and the render call site prints UNREADABLE instead of 'No progress matrix found.'",
        "Fixed check-agents.mjs's three bare JSON.parse(readFileSync(...)) calls (release-plan.json, progress.json, LOOP-STATE.json), which previously crashed the whole validator with an uncaught stack trace on a malformed file; added a readJSON() helper that reports a named FAIL and lets every later check run to the final summary line",
        "Added scripts/check-state-readers.mjs: 19 mutation-test cases. Proven non-vacuous: ran the same reproductions against each pre-fix file via git stash and confirmed they failed there.",
        "Real Independent Reviewer invocation (native runSubagent, read-only) returned REVISE, not APPROVED: found two remaining unconditional reads in check-agents.mjs (the CAREERSCOPE-PROGRESS.md read and the secret-scan's file loop over all 20 .ai/ files, which includes LOOP-STATE.json) were never guarded, so absence of .ai/LOOP-STATE.json - the very file readJSON() was fixed to protect - still crashed the validator uncaught. Also flagged the mutation suite only tested malformed input for check-agents.mjs, never absence, which is exactly why the gap went undetected, plus a minor restore-safety gap in the test script's own absent-file helper.",
        "Reproduced the reviewer's finding live before fixing (uncaught ENOENT, 'agent configuration valid' never printed), then fixed both remaining reads and confirmed live (named FAILs, reaches the summary, exits 1). Extended check-state-readers.mjs from 19 to 24 cases to add the missing absence coverage for both files, and added a withAbsent() helper with try/finally to close the restore-safety gap.",
        "Wired state-readers:test into npm run gates:test; ESLint (registered the new file in eslint.config.js's existing node-globals/no-console overrides) and Prettier both pass; full gates:test passes clean after the reviewer-driven fix",
        "Real CareerScope QA invocation (native runSubagent) independently re-verified everything from scratch - re-ran gates:test, re-ran check-state-readers.mjs, hand-corrupted findings.json/progress.json itself and confirmed the fixed scripts report it correctly, ran full V2 and root typecheck/lint/format/build. Found one real blocking defect: scripts/check-agents.mjs failed npm run format:check on disk (a line introduced during the reviewer-driven fix round was never run through Prettier). Reported three separate pre-existing test failures (apps/api production.test.ts timeout, apps/web PublicJobs.test.tsx assertion, v2 bull-queue.test.ts Postgres timeout) as explicitly NOT attributable to CS-8 - none of their files are in this diff.",
        "Fixed the QA-flagged Prettier defect (prettier --write scripts/check-agents.mjs); re-ran npm run format:check on every CS-8-touched file (exit 0) and the full check-state-readers.mjs (24/24) and gates:test suites (exit 0) one final time",
        "QA"
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-8", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
    "Unparseable refuses; it is never reported as no findings",
    "Each is mutation-tested with all three cases, malformed included"
  ],
  "sources": [".ai/backlog.json#CS-8"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
    "Unparseable refuses; it is never reported as no findings",
    "Each is mutation-tested with all three cases, malformed included"
  ],
  "sources": [".ai/backlog.json#CS-8"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-8"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-8-AC1",
      "sourceText": "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
      "expectedResult": "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-8",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-8-AC2",
      "sourceText": "Unparseable refuses; it is never reported as no findings",
      "expectedResult": "Unparseable refuses; it is never reported as no findings",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-8",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-8-AC3",
      "sourceText": "Each is mutation-tested with all three cases, malformed included",
      "expectedResult": "Each is mutation-tested with all three cases, malformed included",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-8",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "requirement": "Inventory canonical .ai JSON readers and their required/optional file policy, including control-center terminal output, Engineering snapshot, separate engineering.mjs orchestration validator, agile readers, agent and release gates. For each reader, distinguish absent from successfully parsed valid state and malformed/unreadable state; schema-invalid JSON cannot be treated as valid empty data.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Required absent state refuses with actionable artifact-name diagnostic. Optional absent state may use only its documented absence policy, never a completed-review or release-ready claim. Corrupt present state always exposes integrity failure, even where renderer uses an empty collection to avoid crashing.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Engineering snapshot may return empty fallback collections alongside stateErrors; the visible integrity error must remain and terminal/release validators must not infer healthy state from fallback length. Restore fixture files on every error/signal path; run fixtures isolated/serialized.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
    "state-reading contract",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: CROSS_MODULE. Audit each actual JSON read/parse boundary across Engineering UI, terminal, agent and release gates; use existing reader behavior rather than a second mock-only parser. No change to canonical workflow or agent activation permission.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Isolation must preserve real consumer code but redirect module-relative paths: copy actual modules/assets into a validated temporary fixture tree or use an explicit supported root injection. Changing cwd alone cannot isolate import.meta-rooted consumers. Never invoke check-state-readers.mjs against canonical .ai; use unique validated fixture roots and no fixed shared backup names.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
      "requirement": "NOT_APPLICABLE to production database: repository JSON registry is read-only input to these consumers. Mutated cases are temporary synthetic fixture state only; byte-check canonical files before/after verification.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
      "requirement": "Existing internal snapshot contract includes stateErrors alongside fallback collections; CLI contracts are exit status plus safe file-name diagnostic. No new product HTTP route or candidate database mutation is needed.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "docs/API-SURFACE.md",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
    "defeats the release gate",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries.",
    {
      "requirement": "SECURITY_IMPACT: INPUT_VALIDATION, AUDIT. Treat repository state as untrusted evidence. Diagnostics name artifact/category, not raw malformed content, configuration or secrets. A corrupt finding record must not grant release permission or agent authority. Never use production data in parser mutation fixtures.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
      "requirement": "Expose absent/malformed/schema-invalid/read-error category and affected artifact in visible stateErrors or CLI stderr with nonzero refusal where required. Record process exit and original-byte preservation; do not log payloads.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
  ]
}
```

## 21. testStrategy

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-8",
      "acId": "CS-8-AC1",
      "criterion": "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
      "verification": [
        {
          "type": "AUTOMATED_BROWSER",
          "expectedCheck": "CS-8-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run test:ui",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": [
        {
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Canonical reader inventory is reviewed; each consumer's required/optional artifact policy is recorded; all mutated files live in isolated fixture roots. Copy actual consumer modules/assets into a unique validated fixture tree or use supported explicit root injection; cwd alone is not isolation and existing mutation script must never run against canonical .ai.",
          "setup": "For each inventoried reader prepare a valid nonempty state, valid empty state, absent file and malformed present file. Include Engineering snapshot/terminal, agent validator and release gate.",
          "procedure": "Invoke actual consumers against each fixture root; capture typed snapshot or exit status and safe diagnostic; compare behavior to the consumer-specific policy.",
          "assertion": "Every reader distinguishes valid parsed state from absence and parse failure. Required missing files refuse; optional absence uses documented fallback without readiness claim. Malformed present files expose integrity errors and cannot be classified as a healthy empty state.",
          "expectedResult": "The inventory has one complete positive/absence/malformed matrix per reader, without silent fallback evidence or uncovered consumers.",
          "testName": "CS8 canonical reader inventory distinguishes valid absent and corrupt input",
          "testFileOrProcedureId": "scripts/check-canonical-state-readers.test.mjs",
          "fixtures": "Synthetic per-consumer JSON states in temporary directories; planned isolated inventory harness, no actual .ai mutation.",
          "negativeCase": "Add a new unregistered JSON consumer and require inventory coverage failure; a blanket fallback-to-empty parser fails the malformed case and a blanket refusal fails valid controls.",
          "evidenceArtifact": "Future named matrix result showing consumer inventory, cases executed, exit codes and byte preservation; the planned harness is not represented as existing coverage.",
          "reviewer": "Delivery tooling reviewer, QA and Security reviewer",
          "releaseGate": "CANONICAL_EVIDENCE_INTEGRITY",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-8",
      "acId": "CS-8-AC2",
      "criterion": "Unparseable refuses; it is never reported as no findings",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-8-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run gates:test",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": [
        {
          "type": "AUTOMATED_CONTRACT",
          "preconditions": "Real state-reader entry points are callable through isolated fixture working directories; no production environment is loaded.",
          "setup": "Corrupt backlog/findings/progress JSON and relevant release/agent records independently, retaining valid controls for all other inputs; include malformed text and parseable wrong shape.",
          "procedure": "Read actual Engineering snapshot diagnostics and terminal/gate results in a copied module/assets fixture tree; assert stateErrors and refusal exit semantics. Rendered warning behavior is separately required by the CS8 corrupted-state browser binding in scripts/engineering-ui.browser.test.mjs.",
          "assertion": "Corruption yields artifact/category stateErrors or nonzero CLI refusal as appropriate. No release permission, completed-review claim or healthy 'no findings' assertion may result merely because fallback arrays are empty. Diagnostics contain file/category, not rejected payload.",
          "expectedResult": "Unparseable and schema-invalid evidence cannot silently become a green delivery decision.",
          "testName": "CS8 corrupted state refuses instead of granting an empty-state all-clear",
          "testFileOrProcedureId": "scripts/check-canonical-state-readers.test.mjs",
          "fixtures": "Temporary synthetic malformed and wrong-shape JSON plus valid consumer dependencies; no real findings or secret-bearing input.",
          "negativeCase": "Mutant that catches JSON.parse and returns [] without integrity signal fails; mutant printing the raw malformed value fails safe-diagnostic assertions.",
          "evidenceArtifact": "Future named consumer refusal assertions and sanitized diagnostic categories, plus the separately required named CS8 corrupted-state browser result; Node snapshot checks do not prove visible rendering.",
          "reviewer": "Delivery tooling reviewer and Security reviewer",
          "releaseGate": "FAIL_CLOSED_RELEASE_EVIDENCE",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        },
        {
          "type": "AUTOMATED_BROWSER",
          "preconditions": "Actual Engineering modules/assets are copied into a validated temporary fixture root; server binds an ephemeral loopback port only; canonical repository is read-only.",
          "setup": "Create valid isolated backlog/findings/progress/loop fixtures, then corrupt findings JSON without real sensitive values. Record canonical hashes and serve real Engineering UI from the copied module tree.",
          "procedure": "Open rendered Engineering page; inspect warning textContent for findings.json and corruption category; verify zero-fallback counters are accompanied by a visible integrity warning. Restore valid fixture and reload.",
          "assertion": "Corrupted present file visibly displays the integrity warning rather than a healthy no-findings claim; valid restoration clears corruption warning and shows exact synthetic finding totals. Canonical files remain byte-identical.",
          "expectedResult": "The operator sees unreadable-state failure, not a false all-clear caused by empty fallback arrays.",
          "testName": "CS8 corrupted reader state renders an integrity warning until valid restoration",
          "testFileOrProcedureId": "scripts/engineering-ui.browser.test.mjs",
          "fixtures": "Copied real modules/assets and synthetic .ai state in a unique validated temp tree, with invalid JSON and valid nonempty controls.",
          "negativeCase": "Suppressing stateErrors rendering fails even if Node snapshot tests pass; an always-visible error fails the valid restoration control. Changing cwd without relocating module-relative state is rejected by fixture root checks.",
          "evidenceArtifact": "Future named browser result with visible warning/restoration assertions, exact revision and canonical byte preservation; no hosted evidence inferred.",
          "reviewer": "Engineering UI, Accessibility and QA reviewers",
          "releaseGate": "CANONICAL_EVIDENCE_VISIBLE_INTEGRITY",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-8",
      "acId": "CS-8-AC3",
      "criterion": "Each is mutation-tested with all three cases, malformed included",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-8-AC3: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
          "candidateCommand": "npm run gates:test",
          "evidenceRequired": "Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.",
          "automationStatus": "PLANNED_NOT_EXECUTED",
          "owner": "QA"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.",
      "exactBindings": [
        {
          "type": "AUTOMATED_UNIT",
          "preconditions": "Isolated fixture adapters call actual reader boundaries; test failure cleanup is observable without touching canonical source files. Copy actual consumer modules/assets into a unique validated fixture tree or use supported explicit root injection; cwd alone is not isolation and existing mutation script must never run against canonical .ai.",
          "setup": "Create valid/absent/malformed cases for every inventory entry; additionally force an assertion/consumer error between fixture mutation and restoration. Record original and canonical file hashes.",
          "procedure": "Execute all matrix cases, including valid nonempty controls; exercise deliberate fixture exception and verify restoration/removal only inside the validated temporary root.",
          "assertion": "All inventory entries have executed valid/absent/malformed assertions; a catch-and-empty mutation is rejected. Original fixture bytes are restored on failure; canonical repository hashes and ticket states are unchanged; no orphan absent-test file remains.",
          "expectedResult": "Mutation testing proves the false-all-clear defect and exception-safe cleanup rather than merely source wiring.",
          "testName": "CS8 malformed reader mutants fail and fixture exceptions preserve canonical state",
          "testFileOrProcedureId": "scripts/check-canonical-state-readers.test.mjs",
          "fixtures": "Temporary synthetic reader matrix and injected cleanup failure path, with read-only canonical hash snapshot.",
          "negativeCase": "Skipping a reader or malformed case fails coverage; unconditional error fails valid-positive assertions; cleanup that escapes the fixture root is prohibited.",
          "evidenceArtifact": "Future named mutation and preservation test results, case totals, zero skipped and sanitized path classification.",
          "reviewer": "QA and Delivery tooling reviewer",
          "releaseGate": "STATE_READER_REGRESSION_AND_FIXTURE_SAFETY",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    }
  ],
  "sources": [".ai/backlog.json#CS-8", "docs/TESTING.md"]
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
      "id": "CS-8-AC1",
      "sourceText": "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
      "expectedResult": "Every reader of .ai/*.json distinguishes absent, valid and unparseable",
      "verificationIds": ["AUTOMATED_BROWSER"],
      "authority": ".ai/backlog.json#CS-8",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-8-AC2",
      "sourceText": "Unparseable refuses; it is never reported as no findings",
      "expectedResult": "Unparseable refuses; it is never reported as no findings",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-8",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-8-AC3",
      "sourceText": "Each is mutation-tested with all three cases, malformed included",
      "expectedResult": "Each is mutation-tested with all three cases, malformed included",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-8",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-8"]
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
      "requirement": "Every inventoried consumer has all three required valid/absent/malformed cases plus relevant schema/read-error checks; corrupted evidence never yields a release-ready/all-clear result. Valid fixtures remain usable. Tests show canonical state is unchanged and recovery cleanup preserves original bytes.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-8",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-8"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-8 problem and each criterion with Senior Engineer.",
    "Resolve only the recorded CS-8 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for Readers of canonical state may treat unreadable as empty.",
    "Implement and verify CS-8-AC1: Every reader of .ai/*.json distinguishes absent, valid and unparseable",
    "Implement and verify CS-8-AC2: Unparseable refuses; it is never reported as no findings",
    "Implement and verify CS-8-AC3: Each is mutation-tested with all three cases, malformed included",
    "Reconcile CS-8 documentation, redacted evidence and independent review before workflow promotion.",
    {
      "requirement": "Enumerate all canonical JSON readers and document required versus optional absence handling.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Build isolated valid/absent/malformed/schema-invalid/unreadable fixtures for each consumer and assert actual reader output/exit status.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Pair corrupt-state refusal with valid nonempty and valid empty controls so a reader that always errors cannot pass.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Assert restoration and no canonical byte changes even when fixture assertions fail.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Publish the reader inventory and named negative assertions as current-content evidence, not a generic no-findings score.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
  "sources": [".ai/backlog.json#CS-8"]
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
  "sources": [".ai/backlog.json#CS-8", ".ai/blocker-classification.json", "hostpending.txt"]
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
    },
    {
      "requirement": "An always-failing parser can satisfy refusal-only checks; valid controls are mandatory. Empty fallback must carry visible integrity failure. Restore only validated fixture paths, never overwrite canonical user state as recovery; no runtime data migration is part of this ticket.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-8",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "scripts/check-state-readers.mjs",
    "scripts/engineering-ui.mjs",
    "scripts/engineering.mjs",
    "scripts/control-center.mjs",
    "scripts/check-agents.mjs",
    "scripts/release-gate.mjs"
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
      "reviewers": ["Independent Reviewer", "QA"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-8", ".ai/blocker-classification.json"]
}
```

## Specification gate history

| Code                      | Disposition | Original reason                                                                                                          | Owner                            | Evidence                                                                                                 |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_STATE_UNSPECIFIED | OPEN        | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | RESOLVED    | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
