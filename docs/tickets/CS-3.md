# CS-3 — Proxy restart strands every service behind a healthy-looking 502

Generated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: INCOMPLETE.

## 1. identity

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "ticketId": "CS-3",
      "title": "Proxy restart strands every service behind a healthy-looking 502",
      "primaryEpicId": "EPIC-PLATFORM",
      "area": "infrastructure",
      "priority": "P1",
      "status": "UAT",
      "owner": "Infrastructure",
      "reviewers": ["System Designer", "Security", "QA"],
      "releaseTarget": "3.0.1",
      "blocked": true,
      "blockedReason": "The proxy-recovery implementation and local detection evidence exist, but recovery must be observed on the deployed host without restarting the proxy alone.",
      "blockedOwner": "Host operator",
      "blockedSince": null,
      "unblockEvidenceRequired": [
        "Controlled live restart/recovery observation, 502 protection, alert output, and rollback-safe host evidence."
      ]
    }
  ],
  "sources": [".ai/backlog.json#CS-3"]
}
```

## 2. problem

```json
{
  "applicability": "APPLICABLE",
  "requirements": ["The site can be entirely down while every container reports healthy."],
  "sources": [".ai/backlog.json#CS-3"]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "If the web server in front of everything crashes, the whole site goes down while every internal health check still reports fine. Nobody is told. Fixing this means it either recovers by itself or you find out immediately."
  ],
  "sources": [".ai/backlog.json#CS-3"]
}
```

## 4. currentState

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "evidence": [
        "restart-stack.sh is operator recovery, not self-healing",
        "2026-09-23: implementation, both real reviewers full findings and fixes (including a genuine P1 latent availability bug in the circuit breaker itself, caught by Security and fixed with an explicit systemd TimeoutStartSec), and the QA mutation-test proof - see completedSteps.",
        "STATUS CORRECTED 2026-09-24 from UAT to BLOCKED by the Orchestrator, after a forensic audit found status had outrun evidence. Nothing about the implementation is being questioned - it was built carefully and its limitations were disclosed honestly at the time. The issue is purely what UAT means in this project: \"acceptance evidence exists\". This ticket has an acceptance criterion of the form \"proven by doing X on a real host\", and NO live-host evidence is recorded anywhere in this repository. Verification level is LOCALLY VERIFIED, not LIVE-HOST VERIFIED. No host verification is possible from this environment - there is no authorized host access, and attempting it is out of scope. BLOCKED is the honest status: the blocker is the missing operator-run acceptance evidence, not a defect. An operator can clear this by performing the host-side proof and recording the real output.",
        "OPERATOR RUNBOOK READY 2026-09-25: .ai/OPERATOR-RUNBOOK-host-evidence.md contains the exact commands, expected output and pass criterion for this ticket, sequenced so ONE operator session clears all seven host-blocked tickets (CS-3, CS-24, CS-25, CS-26, CS-27, CS-30, CS-47) in a single pass. It carries the incident prohibitions explicitly (never nft flush ruleset, never restart the proxy alone, never docker system prune -a, never regenerate POSTGRES_PASSWORD, never delete a PG volume) and instructs the operator to record FAILING output too - a failure captured is worth more than a success assumed. This ticket remains BLOCKED. The runbook is not evidence; it is what makes the evidence obtainable in one pass.",
        "AC1 IS MET LOCALLY 2026-09-25 ON ITS OWN DISJUNCTION: the criterion offers \"recovers without operator action, OR is detected and alerted\", and the second branch is proven locally at 14/14, shown non-vacuous by QAs own mutation. Only AC2 is strictly host-bound. Recorded because reading this ticket as wholly host-blocked overstates what is outstanding.",
        "REVIEW WINDOW CAVEAT: three sessions were writing concurrently; re-check if a cited file moved between roughly 15:05 and 16:10 IST on 2026-09-25.",
        "2026-09-28 controlled host session: provenance and /api/health passed on deployed revision 1401597f84368e87d8f7e637e034a15d83b9b352, but no CareerScope systemd units or timers are installed on the Hostinger VPS. The required restart-and-observe proof was not run because the deployment has no installed recovery unit; CS-3 remains BLOCKED rather than being inferred from local tests.",
        "2026-09-29 protected Deploy #17 deployed 05fe963bfb09b3f55ad99242a261287aa04a604b; careerscope-proxy-recovery.timer was enabled. Controlled proof killed only careerscope-proxy-1; two timer checks recorded consecutive failures, invoked /opt/careerscope/infra/v3/restart-stack.sh, logged auto-restart completed, and https://careerscope.tech/api/health returned status ok. The deployed restart script mode was 775 after fixing its Git executable bit."
      ],
      "currentStep": "BLOCKED / FUTURE RELEASE — owner-deferred off-host and scheduled-backup acceptance; local backup/restore implementation remains documented and verified where possible.",
      "evidenceClassification": "HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF",
      "completedSteps": [
        "Real CareerScope System Designer invocation (native runSubagent, read-only) produced a full design review before any infra/v3 edit, given this ticket's own reviewAgents require System Designer + Security first and a naive self-healing approach (a Docker-socket-mounted watchdog) would introduce a new root-equivalent privilege class on this single-host system.",
        "Design confirmed: proxy has no healthcheck of its own; no monitoring/cron/systemd timer exists anywhere in infra/v3 today; no Docker socket is mounted into any container currently (clean boundary worth preserving). restart-stack.sh's own header comment accurately documents the split-brain mechanism - this is a named, known gap, not a doc/code drift.",
        "Five options produced and traded off. Recommended path: Option 1 (host-native systemd timer probing the published origin, same symptom restart-stack.sh already checks; alert via journald + optional webhook) - needs no Docker socket, no new container, no new listening port, fully testable locally against compose.acceptance.yml by killing the proxy, and satisfies the acceptance criterion's 'detected and alerted' branch. Option 2 (same detector auto-invoking restart-stack.sh's dependents logic, with a circuit breaker and symptom-based not restart-event-based trigger to avoid thrashing Postgres/Redis or false-firing during normal deploys) is the natural next step for the stronger 'recovers without operator action' branch, and stays in the same privilege class as Option 1 (host operator's existing docker access, never inside a container).",
        "Option 3 (add a healthcheck to the proxy service) flagged as trivial and worth doing regardless, but explicitly does NOT alone satisfy either acceptance criterion (Docker does not auto-restart on failed healthcheck; nothing watches for it).",
        "Option 4 (replace network_mode: service:proxy with per-service netns + internal bridge network) flagged as out of scope for this ticket: it changes a documented security invariant and needs its own ticket/ADR with explicit owner sign-off, not a drive-by inclusion here.",
        "Option 5 (Docker-socket-mounted watchdog) explicitly rejected: hands any container root-equivalent host control, a new privilege class on a box with zero containers holding that power today; needs explicit owner approval and is not recommended as this ticket's implementation.",
        "No infra/v3 files were changed. This is design input only, per the ticket's own review-before-implementation requirement; Infrastructure can proceed directly to implementing Option 1 (and, once proven, Option 2) without further owner approval per the designer's judgment, since neither touches the existing security boundary.",
        "Implemented Option 1 + Option 2 per the System Designer's own recommendation (already recorded above): infra/v3/recover-proxy.sh - a host-native detector reusing CS-24 monitor.sh's exact symptom check (does the public origin actually answer), requiring PROXY_CONFIRM_THRESHOLD (default 2) consecutive bad checks before acting so a single blip cannot trigger a restart, then automatically invoking the existing, already-tested restart-stack.sh - satisfying AC1's 'recovers without operator action' branch, not only 'is detected'. A circuit breaker (PROXY_COOLDOWN_SECONDS, default 1 hour) prevents more than one auto-restart per confirmed-outage window, escalating to an alert instead of thrashing the stack if restart-stack.sh itself cannot fix the underlying cause.",
        "Added careerscope-proxy-recovery.service/.timer (every 2 minutes - 2-3 confirm-then-restart cycles inside a 4-6 minute recovery window) and setup-proxy-recovery.sh (idempotent installer, shares /etc/careerscope-monitor.env with CS-24's monitor - one webhook, configured once). Added infra/v3/check-proxy-recovery.sh: a fully offline test suite (stub curl/restart-stack.sh, no real host needed) proving the confirm-then-act-then-cooldown state machine, one-shot recovery announcement, and that a failing restart-stack.sh invocation is still alerted - 14/14 passing. Wired into CI (ci.yml verify job, alongside CS-24/25's own self-contained infra checks).",
        "Added docs/OPERATIONS/PROXY-RECOVERY.md (design, install, the literal 'kill Caddy and observe the automatic recovery' proof this ticket's own AC2 requires) and a one-time manual-install step in docs/OPERATIONS/DEPLOYMENT.md.",
        "Real Security review (native runSubagent): verdict REVISE, now fixed. Found one real P1: careerscope-proxy-recovery.service had no explicit TimeoutStartSec, so systemd's default 90-second Type=oneshot timeout could kill the unit mid-restart-stack.sh-run (which itself does 8 sequential docker compose restart calls plus up to a 60s health-poll plus verification probes, plausibly exceeding 90s on the happy path alone) - critically, recover-proxy.sh's own LAST_RESTART state write only happens after restart-stack.sh returns, so a systemd-induced kill would silently disable the circuit breaker the very next tick, letting a second restart fire within the same hour the breaker exists to prevent. This was a latent availability bug in the safety mechanism itself, reachable with no adversary at all - fixed with an explicit, generous TimeoutStartSec=600. Confirmed clean: the only path to invoking restart-stack.sh requires both the confirm-threshold and the cooldown gates in sequence (no bypass), the state file only ever contains self-generated integer values (same safe pattern as monitor.sh), the webhook alerting is byte-for-byte the same proven pattern as monitor.sh/backup.sh, and the systemd hardening doesn't interfere with restart-stack.sh's actual docker calls. Noted (not fixed, out of scope, disclosed in KNOWN-LIMITATIONS.md) that CS-24/CS-25's own services have the identical missing TimeoutStartSec, worth a follow-up since they don't have a circuit-breaker whose correctness depends on completing.",
        "Real QA invocation (native runSubagent) independently verified: check-proxy-recovery.sh 14/14, independently traced the confirm-threshold and cooldown gates as the sole, unconditional, no-bypass control paths into the restart logic, proved the test suite non-vacuous via a live mutation (removed the confirm-threshold gate on a scratch copy, watched the specific 'no restart on first bad check' assertion fail with the exact expected/got mismatch, restored, reconfirmed 14/14), confirmed systemd unit/timer/installer path consistency including the explicit absolute PROXY_RESTART_SCRIPT path matching the real deployed checkout location, confirmed CI wiring, root typecheck/lint/format/test all clean (1055/1055 root tests), and confirmed CS-24/CS-25 unaffected. Verdict: PASS.",
        "Final re-verification after the TimeoutStartSec fix: check-proxy-recovery.sh 14/14, check-monitoring.sh clean, check-backup.sh 17/19 (same 2 confirmed-environmental Windows-only failures), root format:check clean for every CS-3 file, ci.yml validated as parseable YAML.",
        "QA"
      ],
      "limitations": "docs/KNOWN-LIMITATIONS.md"
    }
  ],
  "sources": [".ai/backlog.json#CS-3", "docs/PROJECT-STATE.md"]
}
```

## 5. desiredOutcome

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "A Caddy crash recovers without operator action, or is detected and alerted",
    "Proven by killing Caddy and observing the result"
  ],
  "sources": [".ai/backlog.json#CS-3"]
}
```

## 6. inScope

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "A Caddy crash recovers without operator action, or is detected and alerted",
    "Proven by killing Caddy and observing the result"
  ],
  "sources": [".ai/backlog.json#CS-3"]
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
  "sources": ["docs/PROJECT-STATE.md", "docs/ARCHITECTURE.md", ".ai/backlog.json#CS-3"]
}
```

## 8. functionalRequirements

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "id": "CS-3-AC1",
      "sourceText": "A Caddy crash recovers without operator action, or is detected and alerted",
      "expectedResult": "A Caddy crash recovers without operator action, or is detected and alerted",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-3-AC2",
      "sourceText": "Proven by killing Caddy and observing the result",
      "expectedResult": "Proven by killing Caddy and observing the result",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-3"]
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
    "compose topology",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract."
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
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
    ".ai/backlog.json#CS-3",
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
  "sources": [".ai/backlog.json#CS-3", "docs/API-SURFACE.md"]
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
    "availability",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries."
  ],
  "sources": [".ai/backlog.json#CS-3", "docs/SECURITY.md", "docs/PRIVACY.md"]
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
    ".ai/backlog.json#CS-3",
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
      "ticketId": "CS-3",
      "acId": "CS-3-AC1",
      "criterion": "A Caddy crash recovers without operator action, or is detected and alerted",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-3-AC1: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
      "ticketId": "CS-3",
      "acId": "CS-3-AC2",
      "criterion": "Proven by killing Caddy and observing the result",
      "verification": [
        {
          "type": "AUTOMATED_CONTRACT",
          "expectedCheck": "CS-3-AC2: assert the stated behavior, including denial/malformed/failure cases when the condition permits.",
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
  "sources": [".ai/backlog.json#CS-3", "docs/TESTING.md"]
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
      "id": "CS-3-AC1",
      "sourceText": "A Caddy crash recovers without operator action, or is detected and alerted",
      "expectedResult": "A Caddy crash recovers without operator action, or is detected and alerted",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-3-AC2",
      "sourceText": "Proven by killing Caddy and observing the result",
      "expectedResult": "Proven by killing Caddy and observing the result",
      "verificationIds": ["AUTOMATED_CONTRACT"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    }
  ],
  "sources": [".ai/backlog.json#CS-3"]
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
        "Controlled live restart/recovery observation, 502 protection, alert output, and rollback-safe host evidence."
      ],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    }
  ],
  "sources": ["docs/TESTING.md", ".ai/backlog.json#CS-3"]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "Review CS-3 problem and each criterion with Infrastructure.",
    "Resolve only the recorded CS-3 specification/activation gaps before claiming readiness.",
    "Inspect and change only modules permitted by the technical approach for Proxy restart strands every service behind a healthy-looking 502.",
    "Implement and verify CS-3-AC1: A Caddy crash recovers without operator action, or is detected and alerted",
    "Implement and verify CS-3-AC2: Proven by killing Caddy and observing the result",
    "Reconcile CS-3 documentation, redacted evidence and independent review before workflow promotion."
  ],
  "sources": [".ai/backlog.json#CS-3"]
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
  "sources": [".ai/backlog.json#CS-3"]
}
```

## 28. manualExternalGates

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "blockerClass": "B4_LIVE_HOST_OR_OPERATOR_EVIDENCE",
      "owner": "Host operator",
      "evidence": [
        "Controlled live restart/recovery observation, 502 protection, alert output, and rollback-safe host evidence."
      ],
      "actions": [
        {
          "ticketId": "CS-3",
          "title": "Proxy restart strands every service behind a healthy-looking 502",
          "owner": "Host operator",
          "reason": "The proxy-recovery implementation and local detection evidence exist, but recovery must be observed on the deployed host without restarting the proxy alone.",
          "instructions": "Follow the repository runbook for CS-3; use least privilege, capture redacted results, and do not alter unrelated services or data.",
          "evidence": "Controlled live restart/recovery observation, 502 protection, alert output, and rollback-safe host evidence.",
          "recovery": "Stop and restore the prior configuration using the documented runbook; do not delete data, rotate credentials, or bypass a failing gate.",
          "source": "hostpending.txt#CS-3"
        }
      ]
    }
  ],
  "sources": [".ai/backlog.json#CS-3", ".ai/blocker-classification.json", "hostpending.txt"]
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
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
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
      "reviewers": ["System Designer", "Security", "QA"],
      "activation": "No activation or implementation is authorized during Phase 3.25."
    }
  ],
  "sources": [".ai/backlog.json#CS-3", ".ai/blocker-classification.json"]
}
```

## Open specification gates

| Code                      | Reason                                                                                                                   | Owner                            | Evidence                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RELEASE_STATE_UNSPECIFIED | Source ticket has no release/HOLD activation classification.                                                             | Product owner / release reviewer | Approved activation classification; historical package versions are not release authorization.           |
| EXACT_AC_TEST_BINDING     | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA                               | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
