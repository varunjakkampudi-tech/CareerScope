# CS-3 — Proxy restart strands every service behind a healthy-looking 502

Content-reviewed specification; this does not assert implementation or execution evidence. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: APPROVED; readiness: IMPLEMENTATION_READY.

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
  "requirements": [
    "The site can be entirely down while every container reports healthy.",
    {
      "requirement": "Caddy must not own the namespace shared by private application services: replacing its namespace previously left healthy dependents unreachable behind 502. Current source delegates namespace ownership to network-anchor; older recovery evidence is not current deployed-topology proof.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
  ]
}
```

## 3. value

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    "If the web server in front of everything crashes, the whole site goes down while every internal health check still reports fine. Nobody is told. Fixing this means it either recovers by itself or you find out immediately.",
    {
      "requirement": "Protect candidate access and operational availability by keeping the shared network namespace independent from Caddy process/container replacement, and by exposing an actionable alert if the origin remains unavailable after bounded recovery. Container-local health alone is not user-visible availability.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
      "verificationIds": ["AUTOMATED_UNIT"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-3-AC2",
      "sourceText": "Proven by killing Caddy and observing the result",
      "expectedResult": "Proven by killing Caddy and observing the result",
      "verificationIds": ["LIVE_HOST"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "requirement": "Preserve network-anchor as sole shared namespace/edge-port publisher. Proxy, database, Redis, LocalStack, application and workers join that stable namespace; private service ports are not host-published.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "On an approved controlled Caddy termination, Docker restarts only the proxy; network-anchor and dependent container namespace identities remain stable. Verify public origin, web route and GET /api/health (which must reach PostgreSQL via SELECT 1) recover; a green container health indicator alone is insufficient.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "The scheduled detector must treat a successful public GET /api/health response with JSON status=ok as healthy; a failed request or non-ok response increments consecutive failures. One failure below PROXY_CONFIRM_THRESHOLD causes no restart/alert; reaching threshold invokes the configured restart procedure no more than once inside PROXY_COOLDOWN_SECONDS; recovery and failed recovery emit the documented alerts.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "The frozen AC2 only requires killing Caddy and observing the result. This specification strengthens the planned proof with a disposable Compose continuity check and, for live-host acceptance, a pre-existing owner-approved non-mutating synthetic async canary; this added async check is not frozen source wording. Do not enqueue candidate-bearing or externally dispatched work in production. If no safe canary is approved, record any completed frozen host observation separately as PARTIAL, mark strengthened AC2 verification NOT_VERIFIED, and do not accept the ticket or claim async continuity. The frozen host observation still requires its origin/API/recovery result and all required topology evidence.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Anchor replacement is a separate deliberate full-stack recreation procedure, never an unattended proxy recovery or permission to remove volumes. Current infra/restart-stack.sh restarts proxy only; full-stack recreation is an operator recovery path after bounded recovery failure, not a passing proxy-only test.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
    "compose topology",
    "Use the canonical root workspace and existing modules; inspect callers and tests before changing a contract.",
    {
      "requirement": "ARCHITECTURE_IMPACT: INFRASTRUCTURE. Existing stable namespace owner removes the root cause; monitoring is not the sole remediation. No Docker-socket watchdog container, new public ports or architectural rewrite.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
      "requirement": "Production volumes and encryption keys survive proxy crash; controlled evidence must not display database contents or resume files. Test-only benign owner/run/queue identifiers are used; no database migration is required.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
      "requirement": "EXISTING_CONTRACT: unauthenticated GET /api/health is served by apps/api/src/app.ts, runs SELECT 1 against PostgreSQL, then returns {status:'ok', version}; the API listens on 127.0.0.1:5390. The external Caddy origin and the internal 127.0.0.1:5280 web route are probes, not new API contracts. No new route, request body, database mutation or public port is introduced.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/API-SURFACE.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
    "availability",
    "Actor and ownership: authenticated session derives owner; client IDs never choose ownership. Test foreign-owner denial without object-existence disclosure.",
    "Mutations require authoritative validation, same-origin CSRF protection and domain-specific concurrency/idempotency constraints.",
    "Candidate profile/resume/application notes are private; keep raw data, cookies, OAuth/provider tokens, secrets and configuration out of logs, exports, screenshots and evidence.",
    "Admin/recruiter roles require explicit RBAC and consent-scoped projections. No generic database console or unrestricted raw-resume endpoint.",
    "Retention, erasure and audit details must follow the approved domain contract; no undocumented new retention period.",
    "Exercise malformed input, unauthorized actor, stale revision, disabled capability, duplicate request and provider failure where the feature touches those boundaries.",
    {
      "requirement": "SECURITY_IMPACT: AVAILABILITY, SECRETS, PRIVACY_PII, ADMIN_PRIVILEGE. Trust boundary is the host operator/systemd service and the public origin; no container gains Docker-socket or host-root control. Candidate owns application data; recovery probes are unauthenticated health only and must not read or mutate candidate data. Host operator authorization is required for a live crash window and docker control. Publish only anchor edge ports 80/443; keep PostgreSQL/Redis/LocalStack/API/workers private. Do not collect environment dumps, keys, tokens, raw candidate payloads, resume files or unrelated logs. Record only redacted revision, service/namespace identifiers, timestamps and probe outcomes; preserve alerts/incident evidence under host retention policy.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/SECURITY.md",
    "docs/PRIVACY.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
      "requirement": "Observe public health failure/recovery, proxy restart count, anchor namespace identity, dependent namespace identity and bounded operator-approved recovery window. Threshold/cooldown and single-recovery alert are tested with synthetic curl/restart fixtures; no real webhook secret is needed.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
          "type": "AUTOMATED_UNIT",
          "expectedCheck": "Healthy probe causes zero restart/alerts; first failure below threshold causes zero restart; confirmed outage invokes exactly one recovery; inside cooldown no second restart; elapsed cooldown permits retry; failed restart is alerted; recovery announces once then healthy silence.",
          "candidateCommand": null,
          "evidenceRequired": "Future named fixture results and controlled negative proof; no live recovery inferred.",
          "automationStatus": "PLANNED",
          "owner": "Infrastructure, Security and QA",
          "releaseGate": "LOCAL_PROXY_DETECTION_NOT_LIVE_NAMESPACE_PROOF"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "AUTOMATED_UNIT",
          "preconditions": "Only synthetic curl, restart and clock/state fixtures are available; actual recover-proxy.sh executes in a validated temporary state directory.",
          "setup": "Healthy baseline, first/second failing probes, cooldown window, failed restart and recovered probe sequence; no real network or Docker.",
          "procedure": "Execute existing check-proxy-recovery fixture logic and capture restart/webhook calls and safe state transitions.",
          "assertion": "Healthy probe causes zero restart/alerts; first failure below threshold causes zero restart; confirmed outage invokes exactly one recovery; inside cooldown no second restart; elapsed cooldown permits retry; failed restart is alerted; recovery announces once then healthy silence.",
          "expectedResult": "Detection and bounded recovery are non-vacuous defense in depth, not claimed namespace/crash proof.",
          "testName": "proxy recovery confirms outage and obeys cooldown with one recovery announcement",
          "testFileOrProcedureId": "infra/check-proxy-recovery.sh",
          "fixtures": "Stub curl and restart-stack plus unique synthetic state path; future timing controls exercise exact threshold/cooldown.",
          "negativeCase": "Removing confirm threshold or cooldown must make named assertion fail; always-no-restart implementation fails confirmed-outage positive case.",
          "evidenceArtifact": "Future named fixture results and controlled negative proof; no live recovery inferred.",
          "reviewer": "Infrastructure, Security and QA",
          "releaseGate": "LOCAL_PROXY_DETECTION_NOT_LIVE_NAMESPACE_PROOF",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "ticketId": "CS-3",
      "acId": "CS-3-AC2",
      "criterion": "Proven by killing Caddy and observing the result",
      "verification": [
        {
          "type": "LIVE_HOST",
          "expectedCheck": "Preflight evidence matches the approved exact-SHA topology; anchor and dependent namespace identities are unchanged after proxy-only termination; proxy restart count increases and Caddy rejoins the anchor; public origin returns its expected success response, GET /api/health returns HTTP 200 with status=ok, and the pre-existing approved synthetic async canary reaches its specified success state inside the owner-approved window. Host publication remains only the intended edge ports 80/443; PostgreSQL/Redis/LocalStack/API/workers are not published. Any preflight mismatch, private-port publication, namespace change, unsuccessful probe/canary, recovery outside approved bounds or missing alert on failed recovery is FAIL; SSH/operator access is not disabled as a test workaround.",
          "candidateCommand": null,
          "evidenceRequired": "Future operator-signed exact-revision approval/window record; redacted pre/post namespace IDs, port-binding evidence, timer state, restart count, origin/API/canary observations and timestamps; preserve first failure and rollback result. Historical host run is not current proof.",
          "automationStatus": "PLANNED",
          "owner": "Host operator, System Designer, Security and QA",
          "releaseGate": "LIVE_PROXY_TOPOLOGY_RECOVERY"
        }
      ],
      "releaseGate": "SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW",
      "mappingBasis": "Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.",
      "exactBindings": [
        {
          "type": "LIVE_HOST",
          "preconditions": "Host operator records explicit approval for a bounded maintenance window against the exact deployed revision and identifies the rollback operator. Before disruption, public origin and GET /api/health are healthy; the recovery timer is active; Compose confirms network-anchor owns the namespace and edge publication; docker inspect confirms proxy and dependents share the anchor network mode, only intended edge ports are published, and no DB/Redis/LocalStack/API/worker host ports are published. A non-mutating synthetic async canary must already be approved and available; otherwise this AC cannot pass. No action is executed during specification phase.",
          "setup": "Record the approved window identifier and its owner-defined start/end bounds (do not invent a duration), exact deployed SHA, redacted container IDs, network-anchor namespace ID, proxy/dependent namespace IDs, proxy restart count, Compose port bindings, timer state, external origin status, API readiness and the approved synthetic canary's pre-crash state. Exclude credentials, environment values, candidate records and payloads.",
          "procedure": "At the approved window, capture the healthy baseline; resolve the Caddy container from the exact deployment Compose project and terminate only that container using the reviewed operator procedure (never network-anchor). Observe Docker restart count and proxy rejoin, compare anchor/dependent namespace IDs with baseline, poll the public origin and GET /api/health and observe the already-running approved synthetic async canary through the owner-approved window bounds. Record first failure and final state; do not retry a failed proof into a pass. If preflight differs from the approved record, abort before termination. If recovery fails, follow the separately documented operator rollback/recovery path and retain the failed result.",
          "assertion": "Preflight evidence matches the approved exact-SHA topology; anchor and dependent namespace identities are unchanged after proxy-only termination; proxy restart count increases and Caddy rejoins the anchor; public origin returns its expected success response, GET /api/health returns HTTP 200 with status=ok, and the pre-existing approved synthetic async canary reaches its specified success state inside the owner-approved window. Host publication remains only the intended edge ports 80/443; PostgreSQL/Redis/LocalStack/API/workers are not published. Any preflight mismatch, private-port publication, namespace change, unsuccessful probe/canary, recovery outside approved bounds or missing alert on failed recovery is FAIL; SSH/operator access is not disabled as a test workaround.",
          "expectedResult": "Current deployed topology proves proxy crash does not strand dependents; a monitor-only success cannot pass this namespace acceptance requirement.",
          "testName": "controlled Caddy crash preserves stable anchor and private dependent reachability",
          "testFileOrProcedureId": "CS-3-LIVE-STABLE-ANCHOR-CRASH",
          "fixtures": "Operator-approved exact-SHA deployment and window record, already-approved non-mutating synthetic async canary, redacted Docker inspect/Compose topology evidence, external origin probe and readiness response; no volume or credentials mutation.",
          "negativeCase": "A proxy-owned namespace or false-positive container health with failing origin/API/async probe must fail; pre-crash healthy controls prevent preexisting outage being called recovery.",
          "evidenceArtifact": "Future operator-signed exact-revision approval/window record; redacted pre/post namespace IDs, port-binding evidence, timer state, restart count, origin/API/canary observations and timestamps; preserve first failure and rollback result. Historical host run is not current proof.",
          "reviewer": "Host operator, System Designer, Security and QA",
          "releaseGate": "LIVE_PROXY_TOPOLOGY_RECOVERY",
          "testStatus": "PLANNED",
          "reviewStatus": "REVIEWED"
        }
      ]
    },
    {
      "requirement": "AC1's local positive path is the existing check-proxy-recovery fixture: healthy probe yields zero restarts; first bad probe below threshold yields zero restart/alert; confirmed outage invokes one restart, cooldown blocks a repeat, failed restart alerts, and healthy recovery announces once. Keep this test as detection/recovery-logic evidence only.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "AC2's planned host procedure requires a preapproved window and healthy baseline, terminates only Caddy, checks anchor and dependent namespace identity, confirms the restarted proxy and public origin, web route and API readiness return within the measured policy window, and retains failure output. The test fails if only container health passes while origin/API remains unavailable. No deployed result exists in this Phase 3.25 branch.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/TESTING.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
      "id": "CS-3-AC1",
      "sourceText": "A Caddy crash recovers without operator action, or is detected and alerted",
      "expectedResult": "A Caddy crash recovers without operator action, or is detected and alerted",
      "verificationIds": ["AUTOMATED_UNIT"],
      "authority": ".ai/backlog.json#CS-3",
      "reviewStatus": "UNREVIEWED_SPECIFICATION"
    },
    {
      "id": "CS-3-AC2",
      "sourceText": "Proven by killing Caddy and observing the result",
      "expectedResult": "Proven by killing Caddy and observing the result",
      "verificationIds": ["LIVE_HOST"],
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
    "Rollback/recovery plan preserves data and encryption material; no irreversible shipping action is authorized by completing a specification.",
    {
      "requirement": "Implementation DoD: Compose network-anchor is sole namespace owner and sole publisher of application edge ports 80/443; private services have no host-published ports; Caddy-only restart does not replace anchor/dependent namespace identity; detector threshold, cooldown and success/failure alerts satisfy their named assertions; no database migration or application data mutation is introduced. Exact-SHA hosted Caddy crash observation and operator evidence remain production acceptance gates, not required evidence that a future specification test has already passed.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/ai/quality-gates.md",
    ".ai/backlog.json#CS-3",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
        "Controlled live restart/recovery observation, 502 protection, alert output, and rollback-safe host evidence."
      ],
      "rule": "Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion."
    },
    {
      "requirement": "Current source has network-anchor owning the shared namespace and publishing edge ports 80/443; proxy, PostgreSQL, Redis, LocalStack, API, web and workers join that namespace, with private service listeners bound to loopback. recover-proxy.sh and its systemd service/timer implement thresholded public-origin detection, bounded proxy recovery, cooldown and alerts; check-proxy-recovery.sh stubs prove only detector state transitions, not Docker namespace continuity.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "The frozen evidence contains conflicting host timelines: an earlier 2026-09-28 entry says no recovery unit was installed, while a later 2026-09-29 entry records a successful deployed proof. Preserve both as historical, neither establishes the exact current deployed revision. The blockedReason requires deployed-host observation; currentStep mentions backup work unrelated to CS-3 and is not an acceptance criterion. Do not convert either historical result into current evidence or edit the source registry in Phase 3.25.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Retain current-source Compose validation, named local fixture output and (if implemented) disposable Compose crash test separately from a redacted operator-signed exact-deployed-SHA record. The live record must include pre/post anchor and dependent namespace IDs, proxy restart count, origin/web/API status and timestamps; no secret values, candidate data or raw database output.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    "docs/TESTING.md",
    ".ai/backlog.json#CS-3",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
  ]
}
```

## 26. implementationChecklist

```json
{
  "applicability": "APPLICABLE",
  "requirements": [
    {
      "requirement": "Reconcile the frozen source history against current Compose, scripts and runbook; explicitly retain the 2026-09-28/09-29 host entries as historical, and do not copy the unrelated backup currentStep into CS-3 acceptance.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Review infra/compose.production.yml and verify network-anchor owns the shared namespace and only publishes edge ports 80/443; all private services remain loopback/private and no database/network data changes are implied.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Run the existing infra/check-proxy-recovery.sh fixture and map each threshold, cooldown, alert and failure assertion to AC1 without claiming real namespace or host recovery.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Keep current GET /api/health response and 127.0.0.1:5280 web-origin probes as the service contract; do not add a route or use candidate-bearing work as a live canary.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Specify a separate disposable Compose crash test for anchor/dependent identity and a human-approved live-host Caddy-only crash procedure with pre/post health, rollback and redaction; never terminate network-anchor or touch volumes.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "Require exact deployed-revision evidence and independent Infrastructure/Security/QA review before any later workflow acceptance; preserve releaseTarget 3.0.1 and the source-classified ACTIVE_R1 disposition while keeping production deployment separately gated by exact production evidence.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    ".ai/backlog.json#CS-3",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
    },
    {
      "requirement": "HUMAN/EXTERNAL GATE: Host operator approves a maintenance window, confirms exact deployed revision and healthy baseline, and follows the CS-3 host runbook to terminate only the Caddy container. The historical warning against a proxy-only restart applies if Caddy owns the shared namespace; current-source Caddy-only disruption is permitted only after proving network-anchor owns the namespace and every dependent shares it. Abort if deployed topology differs. Capture namespace identities, restarts, public origin, web and API probes, timer/service alerts and any failure output; never restart/replace the anchor alone or mutate persistent volumes.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    },
    {
      "requirement": "PRODUCTION ACCEPTANCE: exact deployed-SHA proof remains required even if local stubs and disposable Compose tests pass. Historical 2026-09-29 host evidence is not current deployment evidence.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    ".ai/blocker-classification.json",
    "hostpending.txt",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
  ]
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
      "requirement": "Crash proof can interrupt availability; require operator-approved window and healthy baseline. If automatic proxy recovery fails, preserve failure evidence and alert; use only the separately reviewed deliberate recreation procedure retaining all volumes and keys. Never delete database/keys, prune Docker, change firewall globally, restart the anchor alone or loop retries inside cooldown.",
      "reviewStatus": "DRAFT",
      "authority": "EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR"
    }
  ],
  "sources": [
    ".ai/backlog.json#CS-3",
    "docs/ARCHITECTURE.md",
    "docs/TESTING.md",
    "docs/KNOWN-LIMITATIONS.md",
    "infra/compose.production.yml",
    "infra/restart-stack.sh",
    "infra/recover-proxy.sh",
    "infra/check-proxy-recovery.sh",
    "docs/OPERATIONS/PROXY-RECOVERY.md"
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
      "releaseState": "ACTIVE_R1",
      "sourceDisposition": "ACTIVE_R1",
      "deferredDecision": null,
      "deliveryMode": "MANUAL_GATE",
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

## Specification gate history

| Code                  | Disposition | Original reason                                                                                                          | Owner | Evidence                                                                                                 |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------- |
| EXACT_AC_TEST_BINDING | RESOLVED    | Every criterion has a suggested verification method, but current test assertions have not been individually bound to it. | QA    | Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC. |
