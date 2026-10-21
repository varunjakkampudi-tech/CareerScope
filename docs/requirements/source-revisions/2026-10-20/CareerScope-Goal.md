# CareerScope — Complete Autonomous Build & Validation Goal

**Project:** CareerScope  
**Company:** Viswatra  
**Domain:** careerscope.tech  
**Execution mode:** Autonomous development and testing (development branch only; `main` and production are owner-only)  
**Product specification:** CareerScope-v12.md  
**Engineering baseline:** CareerScope-Engineering-Standards.md  
**Objective:** Complete the approved launch core with independently verifiable evidence, document external blockers, and prepare the product for owner-authorized production launch.

---

## 0. Prerequisites (check before starting)

- Repository access: git can fetch and push to the development branch. Record the remote and branch names
- Local runtime: the Node.js version pinned in the repository, the package manager the repository uses, and Docker for isolated PostgreSQL and Redis containers
- Test-only environment variables, set by the owner in a local or CI environment file that is never committed. Record the variable names (never values) in `blocker.txt` if any are missing
- Synthetic test accounts and mocked external providers (email, AI, job sources)
- GitHub Actions enabled on the repository, with enough minutes for the trigger matrix (section 16B.9)
- A separate staging host and its GitHub environment secrets, provided by the owner, for staging deployment (section 16B.4). Without them, staging deployment is blocked and validation runs in ephemeral CI environments
- Paid provider APIs (AI, email, data) are not called by automated tests. Use mocks. Any test that must call a paid provider needs an owner-set spend cap first; until then it is blocked

---

## 1. Authoritative references and precedence

Read these sources in order before modifying code:

1. `CareerScope-v12.md` — approved product scope, decisions D1–D14, module specifications, acceptance tests, and launch checklist.
2. `CareerScope-Engineering-Standards.md` — proposed stack, architecture, code quality, security, CI, testing, accessibility, documentation, and operational standards.
3. The actual repository — existing code, tests, migrations, configurations, CI, documentation, and Git history.

Precedence:

1. Approved owner decisions D1–D14 in v12.
2. Other approved v12 requirements.
3. This autonomous execution instruction for workflow and execution behavior.
4. Engineering Standards, except where explicitly overridden here.
5. Existing code.

Do not silently resolve material conflicts.

Record each conflict, affected requirement, proposed resolution, and implementation impact.

The Engineering Standards currently describe the stack as proposed. Compare it against the actual repository before choosing whether to preserve or change any technology. Material stack changes still require owner approval.

Do not alter D1–D14. The only decision change is D11-R, recorded by the owner on 20 October 2026 and specified in CareerScope-v12.md Amendment A1 (D11 is superseded; its status is PENDING_OWNER_APPROVAL for formal amendment). No other decision changes.

---

## 2. Primary mission

Bring the entire v12 launch core to the highest verified completion state possible without requiring routine owner involvement.

The objective is not to complete a fixed number of tickets. It is to satisfy every applicable launch-core requirement, acceptance test, and go/no-go condition.

Complete all safe work autonomously.

Only stop an individual task when an actual external dependency, owner-only decision, legal authorization, unavailable credential, irreversible action, or other genuine blocker prevents safe progress.

Continue with unrelated work wherever possible.

Do not add speculative features beyond the approved v12 scope.

Never mark a requirement complete without repository evidence.

---

## 3. Autonomous authority and decisions

Act as the technical product owner for implementation, principal software architect, senior full-stack engineer, security reviewer, QA lead, and delivery coordinator.

You are authorized to independently decide:

- Implementation order and task decomposition.
- Algorithms, internal APIs, module boundaries, and data structures.
- Safe internal architectural refinements.
- Code organization and refactoring.
- Test strategy and test coverage improvements.
- UI implementation details within approved designs.
- Security hardening consistent with v12.
- Observability and reliability improvements.
- CI configuration and development tooling.
- Documentation structure.
- Dependency-aware sequencing.

When uncertain:

1. Check the authoritative requirements.
2. Inspect the current implementation.
3. Evaluate technically viable approaches.
4. Prefer proven, secure, maintainable, scalable, cost-efficient approaches.
5. Preserve working functionality.
6. Select the smallest solution that completely meets the requirement.
7. Document material decisions in `docs/decisions/`.
8. Continue without requesting routine confirmation.

Follow SOLID, DRY, KISS, separation of concerns, least privilege, defense in depth, transactional integrity, idempotency, and secure-by-default principles.

Avoid unnecessary technology migrations, complex microservices, excessive dependencies, and premature optimization.

Escalate only genuine owner decisions.

Never invent consent, external permissions, credentials, terms acceptance, or legal approval.

---

## 4. Git workflow — autonomous, no PRs

The owner will not be available to review or merge pull requests during development.

**Do not create PRs or wait for PR approval.**

Use the following workflow:

1. Verify the current repository status and baseline commit.
2. Preserve existing history and uncommitted owner changes.
3. Create and verify a recoverable baseline backup (section 4.1).
4. Establish a `dev` branch.
5. Use task branches only as the global branch policy allows (Quality Standard section 3, item 5), and separate worktrees to protect owner work.
6. Implement one coherent requirement at a time.
7. Run the complete applicable definition of done, using the autonomous-mode mapping in section 4.2.
8. Review the changes independently (section 16).
9. Commit only validated changes.
10. Integrate completed changes sequentially into the `dev` branch.
11. Revalidate the integrated baseline after every material integration.
12. Remove only temporary branches confirmed safe to delete.

Automated local integration into the `dev` branch is permitted.

Do not bypass existing GitHub branch protection, required approvals, or repository rules.

Never push to or merge into `main`. Promotion from the development branch to `main` is owner-only, because a push to `main` may trigger a deployment. Before starting, inspect CI/CD workflows and hosting settings for deploy-on-push hooks and record what you find in `PROGRESS.md`.

When the development branch is ready for promotion, record it in `blocker.txt` as READY_FOR_OWNER with the branch name, revision identifier, and validation results.

Never force-push protected branches, rewrite published history, or merge changes with failing required checks.

Human review is not required for ordinary internal implementation decisions. Production authorization remains owner-only.

Do not deploy to production.

### 4.1 Verified baseline backup

Before any major modification (anything beyond reading the repository, auditing it, and creating the evidence files in section 18), create and verify a baseline backup:

1. Record the baseline: `git rev-parse HEAD` (baseline revision), the current branch, `git status --porcelain`, `git branch -a`, and `git tag`.
2. Protect uncommitted owner work. If `git status` shows uncommitted or untracked changes, do not stash, reset, check out over, clean, or commit them. Leave the owner's working tree untouched and do all development in a separate worktree created from the baseline revision (`git worktree add`). Copy the uncommitted files to an archive outside the repository, excluding files that may contain secrets (`.env*`, key and certificate files, credential files); list excluded files by name only.
3. Create a full bundle outside the repository, never committed: `git bundle create <backup-dir>/careerscope-baseline-<baseline-id>.bundle --all`.
4. Verify integrity: `git bundle verify` on the bundle, and record its SHA-256 checksum.
5. Demonstrate recovery in a disposable location: clone from the bundle into a temporary directory; confirm the baseline branch points at the baseline revision; confirm the branch and tag lists match step 1; run `git fsck`; then delete the temporary copy.
6. Record in `PROGRESS.md`: baseline revision, branch, backup path (path only), checksum, every command with its exit code, the recovery result, and the date.
7. If any step fails, make no major modifications. Record a blocker in `blocker.txt` and continue only with read-only audit work.

The remote repository is not the backup. Force-pushes and deletions on the remote remain forbidden.

### 4.2 Engineering Standards in autonomous mode

When this goal runs in autonomous mode, read Engineering Standards wording as follows. Every applicable check still runs, and no threshold is reduced.

| Engineering Standards wording | Autonomous-mode equivalent |
|---|---|
| "Every pull request" (sanity, integration, critical E2E, accessibility, dependency audit) | Every integration into the development branch: run on the task branch before integration, and again on the integrated baseline after it (workflow step 11) |
| "Every commit" | Every commit |
| "Nightly" (full E2E, regression) | The scheduled nightly GitHub Actions run (section 16B.2), plus every checkpoint (section 19) and before any promotion request |
| "Every deploy" and "every release" (smoke, critical path, security, prompt injection) | Every authorized staging deployment (section 16B.4) and release-candidate validation before the promotion request. The production deploy itself stays owner-only |
| "A reason in the pull request" (large files, new data fields) | A reason in the commit message and in the item's `PROGRESS.md` entry |
| Pull request template fields | The item's integration record in `PROGRESS.md`: linked requirement, test evidence, screenshots, migration notes, rollback plan, review result |
| "One human approval" | Independent review session (section 16) before integration; owner review before promotion for the sensitive areas in section 16 |
| Coverage threshold changes, vulnerability waivers, and other owner-only decisions (Standards section 11) | Not available to the agent. Record as READY_FOR_OWNER in `blocker.txt`; the affected item stays unintegrated or not ready |
| "Merges to main deploy to staging" | Replaced by controlled staging deployment from the development branch (section 16B.4). The agent never merges to `main` |
| Documentation (README, decision records, runbooks, changelog) | Required as written. Changelog entries are kept in `PROGRESS.md` until the owner promotes a release |

Always protected: production deployment, promotion to `main`, and every owner-only decision.

---

## 5. Mandatory baseline audit

Before implementing anything, inspect:

- Repository structure and package boundaries.
- Existing application features and UI routes.
- Frontend, API, workers, shared packages.
- Database schemas, migrations, indexes, and relations.
- Authentication and authorization.
- Sessions and token lifecycle.
- Queue and transactional outbox implementation.
- Redis and PostgreSQL configuration.
- Background workers and integrations.
- Environment variables and feature flags.
- Existing unit, integration, E2E, and security tests.
- CI/CD pipelines and branch protection.
- Deployment and backup configuration.
- Existing technical debt and known defects.
- Existing documentation and architecture decisions.

Produce `GAP_MATRIX.md` before implementation.

Map each v12 requirement to its implementation, tests, evidence, and blocking dependencies.

Classify existing functionality based on actual evidence rather than historical progress reports.

Never assume a previous claim of completion is proof of implementation.

---

## 6. Gap matrix and requirement traceability

Maintain a traceability matrix with:

- Requirement ID.
- v12 section.
- Decision ID, where applicable.
- Capability or acceptance criterion.
- Existing implementation path.
- Test references.
- Dependency.
- Status.
- Evidence.
- Severity.
- Commit revision.
- Blocker ID, if applicable.

Use these implementation statuses:

- **Specified:** Requirement exists; implementation is missing.
- **Unverified:** Code exists, but required testing or evidence is incomplete.
- **Implemented:** Code exists and passes its relevant implementation tests.
- **Tested:** Required acceptance tests pass.
- **Blocked:** External authorization, owner action, or other dependency prevents completion.
- **Integrated:** Validated implementation is on the `dev` branch.
- **Launch-ready:** Requirement has all applicable evidence, is on the approved release baseline, and relevant launch gates are satisfied.

Also distinguish requirements with multiple outstanding conditions rather than concealing unresolved blockers under a single percentage.

Track every go/no-go row separately.

---

## 7. Dependency-aware execution order

Prioritize work based on dependencies, launch criticality, security risk, and functional completeness.

Recommended initial order:

### Stage A — Engineering foundations

- Repository baseline.
- CI and test infrastructure.
- Environment isolation.
- Code and architecture consistency.
- Database migrations and access boundaries.
- Security foundations.

### Stage B — Authentication and accounts

- Email OTP via Resend.
- ~~Second provider fallback adapter.~~ Superseded by D11-R: no second adapter. Instead, Resend adapter failure behaviour per Amendment A1.
- Rate limiting and abuse controls.
- Sessions, refresh rotation, token reuse detection.
- Device revocation.
- Account recovery.
- Admin and super admin 2FA.
- Authentication outage states.

### Stage C — Candidate core

- Onboarding.
- Age-screening result handling.
- Profile and preferences.
- Resume management.
- Verification ticks.
- Privacy and record isolation.

### Stage D — Discovery and matching

- Approved-source permissions.
- Recruiter postings.
- ATS source adapters.
- Deduplication and provenance.
- Expiry and stale listing controls.
- Matching and eligibility.
- Explainability and search quality.
- Coverage measurements.

### Stage E — Applications and interviews

- Official-link application flow.
- Candidate claim and employer acknowledgement separation.
- Application tracking.
- Notes, documents, and contacts.
- Interview organizer.
- Reminders.
- Export and recovery.

### Stage F — Communications and recruiter capabilities

- Candidate-to-recruiter outreach.
- Recipient validation and small caps.
- Email abuse controls.
- Employer verification.
- Authorized job posting.
- Notifications and language templates.

### Stage G — Trust, public pages, and operations

- Rights-gated public job pages.
- Job feedback and reporting.
- Moderation.
- Admin and super admin.
- Data rights and account deletion.
- Audit logs.
- Accessibility and localization.

### Stage H — Launch hardening

- Security review.
- Regression testing.
- Load and performance testing.
- Fault injection.
- Backup and restore validation.
- Monitoring and independent alerts.
- Kill-switch validation.
- Go/no-go evidence.

This order is guidance, not an inflexible dependency chain.

Reorder tasks when the repository audit demonstrates a better sequence.

---

## 8. Exact launch scope

Implement all launch-core features approved in v12:

1. Email OTP authentication through Resend only (D11-R, Amendment A1). No fallback provider.
2. Candidate onboarding and profiles.
3. Resume upload, management, security, and deletion.
4. Verification ticks within approved launch limits.
5. Job discovery using approved sources.
6. Explainable matching and advisory eligibility.
7. Manual official-link application baseline.
8. Application evidence and lifecycle tracking.
9. Interview workflow organizer.
10. Candidate-to-recruiter email within strict caps and permissions.
11. Recruiter onboarding, employer verification, and authorized job posting.
12. Rights-gated public job pages.
13. In-app and email notifications and opt-in web push.
14. English, Telugu, and Hindi localization.
15. Reporting, feedback, and moderation.
16. Admin and super admin tools.
17. WCAG 2.2 AA accessibility.
18. Security, privacy, operational controls, and recovery.

Respect conditional activation requirements.

Out of scope for activation:

- Referrals, except the approved informative empty state and any required safe flag scaffolding.
- AI resume rewriting.
- Browser helper.
- Naukri and Indeed ingestion.
- LinkedIn ingestion or form filling.
- WhatsApp without Meta approval.
- eKYC without provider approval.
- Automated application submission.
- Unapproved new products or features.

Maintain gated capabilities disabled until their formal requirements are met.

---

## 9. Environment isolation and safety limits

All development and destructive testing must use isolated local, CI, or disposable staging resources.

Do not:

- Deploy to production.
- Modify production infrastructure or configuration.
- Enable production feature flags.
- Change live customer or recruiter records.
- Use production databases for destructive tests.
- Send email or notifications to real users or employers.
- Contact job boards or employers to obtain permissions.
- Create third-party provider accounts.
- Store employer-site credentials.
- Store or print secrets, OTPs, tokens, or personal information.
- Use real candidate data in test fixtures or reports.
- Bypass authorization or security requirements.
- Lower coverage thresholds.
- Conceal failing tests.
- Fabricate external integration results.

Use synthetic test accounts and mocked external providers wherever possible.

Disposable resources must never be the production Hostinger VPS, its database, or its Redis. Fault injection, restore drills, and destructive tests run only on local containers, CI containers, or a separate staging host.

Production validation requirements that cannot be performed under these restrictions must remain explicitly blocked pending authorized execution.

---

## 10. Engineering and architecture standards

Preserve the approved stack once confirmed against the repository.

Prefer:

- TypeScript strict mode.
- Next.js and React.
- Fastify with schema validation.
- PostgreSQL and reviewable migrations.
- Redis for bounded caches and rate limits.
- BullMQ for background processing.
- Transactional outbox for durable side effects.
- Containerized service boundaries.
- GitHub Actions for automated verification.

These are proposed choices, not permission to replace a working alternative without review.

Requirements:

- No undocumented `any` types or ignored TypeScript errors.
- Zero new lint warnings.
- Consistent Prettier formatting.
- Typed API boundaries.
- Documented error responses.
- Secure server-side authorization.
- Pagination and query indexing.
- Transactional multi-record operations.
- Idempotent jobs.
- Bounded retries and circuit breakers.
- Safe database migrations.
- Secrets supplied only through the runtime environment.
- Structured privacy-safe logging.
- Independent monitoring where required.
- Feature flags for gated functionality.
- Proper rollback paths.

Write maintainable, production-grade code.

---

## 11. Mandatory testing and Definition of Done

Apply Engineering Standards section 7.3 without weakening its requirements.

For every relevant change, run:

1. ESLint.
2. Prettier format check.
3. TypeScript strict typecheck.
4. Unit tests.
5. Integration tests with real isolated PostgreSQL and Redis.
6. Critical Playwright E2E tests.
7. Accessibility tests.
8. Dependency vulnerability audit.
9. Secret scanning.
10. Production build.
11. Migration and rollback validation where applicable.
12. Feature flag default verification.

Coverage requirements:

- Changed code: at least 80% line coverage.
- Changed code: at least 70% branch coverage.
- Authorization and record-access routes: required denial-path coverage.

Additional release-level testing:

- Full regression.
- Security.
- Prompt injection.
- Platform failure and recovery.
- Load and performance.
- Backup restoration.
- Operational recovery.
- Data deletion and consent withdrawal.

Do not lower test thresholds or skip mandatory checks.

Tests must prove expected behavior, not simply exercise code paths.

Use disposable environments for fault injection and destructive recovery tests.

Record exact commands, exit codes, test names, coverage results, immutable versions, and CI run IDs when available.

---

## 12. Security and abuse testing

Prioritize:

- OTP enumeration resistance and rate limits.
- Session fixation and refresh-token reuse.
- Device revocation.
- Authentication provider outage handling.
- Cross-user record isolation.
- Recruiter-to-candidate access boundaries.
- Administrative role escalation prevention.
- Employer authorization.
- Secure file upload, parsing, and deletion.
- Malicious documents and prompt injection.
- Candidate outreach caps and recipient permissions.
- Email bounce and complaint suppression.
- Idempotent delivery.
- Cross-site scripting, CSRF, injection, and SSRF defenses.
- Sensitive data exposure.
- Secrets and dependency vulnerabilities.
- Audit logging and consent workflows.

Security tests must include denial paths and failure conditions.

When a serious security defect is found:

1. Record the finding without exposing secrets.
2. Classify severity.
3. Preserve reproducible diagnostic evidence.
4. Prevent the affected functionality from being marked ready.
5. Implement the fix where authorized and feasible.
6. Re-run security and regression tests.
7. Record unresolved defects in `blocker.txt`.

Do not continue integrating changes that depend on an unresolved critical vulnerability.

Unrelated safe tasks may continue.

---

## 13. UI/UX and accessibility quality

Deliver the complete approved CareerScope user experience.

Every core screen must have:

- Correct functional workflow.
- Mobile-first responsive behavior.
- Desktop, tablet, and mobile validation.
- Loading state.
- Empty state.
- Success state.
- Error state.
- Provider outage state where relevant.
- Clear validation messages.
- Keyboard navigation.
- Visible focus.
- Accessible labels and screen-reader support.
- Reduced-motion support.
- English, Telugu, and Hindi.
- Correct handling of long translations.
- Appropriate privacy and trust messaging.
- No inaccessible controls or unintended horizontal scrolling.

Test at the screen widths in section 16A.2 (320 px to 1920 px), which the Engineering Standards also require.

Do not redesign approved product flows merely for aesthetic preference.

Where detailed implementation decisions are absent, apply established SaaS UX principles and CareerScope's existing design system.

Use real rendered application screenshots as evidence for UI changes.

Do not present mockups as completed functionality.

---

## 14. External integrations and data permissions

Only enable sources permitted by v12 and supported by recorded permission profiles.

Each enabled source must document its rights for:

- Collection.
- Storage.
- Transformation.
- AI processing.
- Public display.
- Redistribution.

Respect source-specific restrictions.

Never assume that publicly accessible job data is automatically licensed for unrestricted reuse.

Do not store prohibited portal listing bodies.

Do not activate Naukri, Indeed, or LinkedIn integrations contrary to D14.

Use provider adapters with timeout, retry, rate-limit, circuit-breaker, and disable controls.

Where live access is unavailable, implement and test the integration boundary using mocks and clearly mark real-provider validation blocked.

Do not report mocked provider behavior as verified production integration.

---

## 15. Failure handling and resilience

Test the approved degraded modes:

- Resend outage or misconfiguration (D11-R; no second provider exists).
- Resend unavailable: new sign-ins unavailable while existing sessions continue.
- Existing sessions during sign-in outage.
- AI provider outage.
- Job source outage.
- Redis outage.
- PostgreSQL outage.
- Worker interruption.
- Queue retries and dead-letter behavior.
- Duplicate job delivery.
- Recovery from interruption.
- Database transaction consistency.
- Feature kill switches.
- Backup restoration.

Use safe fault injection against disposable infrastructure.

Verify the behavior after recovery, not just the failure screen.

Preserve the 1-hour recovery-point objective and 4-hour recovery-time objective from v12.

Recognize D12's documented 24-hour fallback, but do not independently resolve its conflict with the critical go/no-go checklist. Record the conflict for owner disposition.

Owner direction (closure review, 20 October 2026): the recovery-point target is one hour. The 24-hour fallback in D12 is not a default. It exists only as a separately approved, explicitly disclosed release exception, and it stays a READY_FOR_OWNER item in `blocker.txt` until the owner approves it. Recovery objectives are not reported as met without restore-drill evidence.

Do not invent backup success or recovery-time measurements.

---

## 16. Independent review before integration

For every material change, conduct a separate review pass before integrating it into the development baseline.

The review runs in a separate agent session that sees only the requirements, the diff, the surrounding code, and the test results. It does not see the implementing agent's reasoning or notes. A review by the same session that wrote the code does not count as independent.

If an independent review session cannot be run (for example, because of tooling or usage limits):

- Never claim that independent review occurred
- Record the limitation, the affected immutable versions, and the required follow-up review in `blocker.txt`
- A change may be integrated on the development branch only if every definition-of-done check passes, and it must be labelled "independent review pending" in `PROGRESS.md` and `GAP_MATRIX.md`
- Changes in the sensitive areas listed below stay on their task branch, unintegrated, until reviewed
- Unreviewed changes cannot be marked Launch-ready or included in a promotion request
- Continue unrelated safe development

Owner review is required before promotion to `main` (not before integration on the development branch) for changes in these areas:

- Authentication, sessions, and tokens
- Authorization and record-level isolation
- Database migrations that touch personal data
- Outreach and outbound email sending
- Account deletion and consent withdrawal

List these changes in the promotion entry in `blocker.txt`.

The review must assess:

- Requirement completeness.
- Functional correctness.
- Architecture fit.
- API and data contract compatibility.
- Security and privacy.
- Database migration safety.
- Concurrency and idempotency.
- Error and recovery handling.
- Accessibility.
- Internationalization.
- Test quality.
- Regression risk.
- Operational impact.
- Documentation completeness.

The review must inspect the actual changed code and relevant surrounding implementation.

Fix material findings before marking the item integrated.

Record unresolved findings with severity and reason.

An automated reviewer may provide independent technical analysis but does not substitute for required owner approval of production launch.

---

## 16A. Mandatory comprehensive quality audit, fix, and retest

This applies to every applicable launch-core module, screen, API, and workflow. It adds quality depth to the launch core; it does not add product features or expand v12 scope.

### 16A.1 Accessibility (WCAG 2.2 AA)

- Run automated and manual accessibility tests using axe-core, Playwright, and appropriate inspection tools
- Verify keyboard-only navigation, focus order and visibility, screen-reader compatibility, ARIA semantics, colour contrast, semantic HTML, accessible forms, error announcements, dialogs, menus, tables, reduced motion, and 200% and 400% zoom
- Test the English, Telugu, and Hindi interfaces
- Fix all confirmed WCAG 2.2 A and AA violations in launch-core flows
- Automated scans alone are not WCAG compliance evidence. Record manual test results, including the tool, browser, and screen reader used

### 16A.2 Responsive design and device compatibility

- Test every launch-core screen at 320, 360, 390, 768, 1024, 1280, 1440, and 1920 px wide, plus intermediate widths where the layout changes
- Validate portrait and landscape, touch interaction, responsive typography, navigation, tables, forms, modals, menus, safe areas, content wrapping, and long translated text
- Fix unintended horizontal scrolling, clipped content, overlapping elements, inaccessible controls, broken layouts, and inconsistent responsive states
- Screenshots alone are not functional test evidence; pair them with test results

### 16A.3 Cross-browser compatibility

- Run the applicable Playwright E2E regression suites on Chromium, Firefox, and WebKit
- Timing: the critical E2E subset runs on Chromium at every integration; the full suites on all three engines run after each major module integration, at every checkpoint (section 19), and before any promotion request
- Cover sign-in, onboarding, discovery, matching, applying, application tracking, the interview organizer, recruiter posting, and admin operations
- Test browser-specific behaviour: cookies, sessions, file uploads, downloads, date and time inputs, navigation, storage, and responsive interaction
- Validate critical flows on real mobile browsers or devices where available
- Fix confirmed browser-specific defects
- Where real Safari or mobile-device validation is unavailable, record the limitation in `blocker.txt`. WebKit emulation does not prove compatibility with every Safari version

### 16A.4 Security audit and remediation

Cover:

- OWASP Top 10 and the applicable OWASP API Security Top 10 risks
- Authentication, OTP, session rotation, and token reuse
- Authorization, record isolation, and privilege escalation
- SQL injection, XSS, CSRF, SSRF, and unsafe deserialization
- Secure cookies, security headers, and CSP
- File upload scanning and sandboxed parsing
- API validation and rate limiting
- Email abuse, recipient permissions, and notification security
- Sensitive information exposure
- Dependency vulnerabilities, secrets, and supply-chain risks
- Database, Redis, worker, and container security
- Privacy, retention, data deletion, and audit logging

Use static analysis, dependency scanning, secret scanning, and safe dynamic security testing in isolated environments only (section 9).

Fix every confirmed critical or high-severity finding before marking the affected functionality ready. The agent cannot accept or waive such findings; only the owner can, in writing.

### 16A.5 Performance and reliability audit

Measure and optimise:

- Core Web Vitals: LCP, INP, and CLS
- Lighthouse performance and accessibility
- JavaScript bundle size and unnecessary rendering
- API response times and database query performance
- Index usage and pagination
- Memory use and resource limits
- Queue processing and worker concurrency
- Cache behaviour and fallback
- Background sync efficiency
- Performance under the v12 load scenarios

Apply the existing v12 acceptance criteria (for example, load-test error rate under 1 percent, no lost or duplicated data). Where a metric has no approved numerical threshold, record the measurement and a recommendation; do not invent a pass threshold.

Known gap: v12 section 7 says load tests pass when "performance targets are met", but v12 defines no numerical performance targets. Record this as a READY_FOR_OWNER item in `blocker.txt` with recommended targets based on measurements. Until the owner sets targets, the load-test performance criterion stays unresolved.

Fix confirmed performance regressions, resource leaks, data loss, race conditions, and reliability defects.

### 16A.6 Code quality and architecture audit

- Audit all launch-core code for correctness, readability, modularity, SOLID principles, type safety, error handling, duplication, dead code, unsafe dependencies, testability, observability, and architectural consistency
- Verify API schemas, transactional correctness, concurrency safety, retry handling, migration integrity, rollback behaviour, feature flags, and environment configuration
- Refactor genuine problems without unnecessarily rewriting working systems

### 16A.7 Mandatory fix, retest, and verify cycle

For every confirmed defect:

1. Reproduce the issue
2. Record severity and the affected requirement
3. Identify the root cause
4. Implement the smallest safe permanent fix
5. Add a regression test wherever technically applicable
6. Run focused tests
7. Run the relevant integration and E2E tests
8. Run the complete applicable definition of done
9. Perform an independent review pass (section 16). If independent review is unavailable, follow the section 16 fallback: the defect is "fixed, independent review pending", not closed
10. Record the result and evidence
11. Close the defect only after verification passes

Do not mark a defect resolved because code changed. If a fix keeps failing, follow the failure-escalation procedure (section 20.1). If a defect cannot be fixed safely, record the technical blocker, impact, resolution steps, and exact owner actions in `blocker.txt`, and continue unrelated safe tasks.

### 16A.8 Continuous quality gates

- Run applicable quality checks during implementation, not only at the end
- After each major module is integrated, rerun the relevant regression, security, accessibility, responsive, and cross-browser suites
- Before declaring development complete, perform one complete repository-wide quality audit against the approved launch core

### 16A.9 Final quality report

Produce `QUALITY_AUDIT.md` with a table containing: quality category, scope audited, tests executed, issues found, issues fixed, issues remaining, severity, evidence, and pass, fail, or blocked.

Include accessibility, responsiveness, cross-browser, security, performance, reliability, privacy, dependency audits, code quality, and regression testing.

Keep measurements accurate. Do not invent test results or claim a compliance certification that has not been issued by an authorised body.

### 16A.10 Completion requirement

CareerScope development is not complete merely because all planned features exist.

Every launch-core feature must pass its applicable functional, accessibility, responsive, cross-browser, security, integration, and regression checks.

All confirmed critical and high-severity launch-core defects must be fixed and independently verified, or recorded as unresolved release blockers. External and owner-only actions stay documented in `blocker.txt`.

Do not deploy to production, change production configuration, bypass protected-branch rules, or expand v12 product scope.

Cycle: audit, identify, fix, retest, independently verify, record evidence, continue. Repeat until all safely resolvable launch-core defects are closed and all remaining genuine blockers are documented.

---

## 16B. CI/CD and automated testing lifecycle

The testing system must be implemented and executed, not merely documented. A workflow file in the repository is not evidence that automation works (section 16B.11).

### 16B.1 GitHub Actions workflows

Implement working GitHub Actions workflows for:

- Automatic checks on development-branch pushes
- Automatic validation after integration into the development branch
- A scheduled nightly regression and security run
- Manual runs through `workflow_dispatch` (section 16B.3)
- Controlled deployment to an isolated staging environment, only after its target and safety are verified (section 16B.4)
- Automated pre-deployment and post-deployment validation
- Release-candidate verification without production deployment

Inspect existing workflows and deployment configuration first. Reuse working workflows and avoid duplicate or conflicting triggers.

Rules for workflows written by the agent:

- No job may deploy to production. Workflows written by the agent contain no production target, production environment, or production secret
- No job triggers a deployment on a push to `main`. Existing owner workflows that deploy from `main` are left unchanged and recorded in `PROGRESS.md`
- Staging deployment jobs run only from the `dev` branch, through a GitHub environment named for staging, restricted to that branch

### 16B.2 Trigger matrix

| Trigger | Required tests |
|---|---|
| Every development commit or push | Lint, formatting, typecheck, unit tests, dependency audit, secret scan, build |
| Every development integration | Unit, integration, sanity, critical E2E (Chromium), accessibility, responsive checks for changed screens, security checks, coverage |
| Every major module completion | Relevant regression, E2E on Chromium, Firefox, and WebKit, accessibility, responsive, integration, security |
| Nightly scheduled run | Full regression, E2E on all three browsers, integration, accessibility, security scans, localization, data isolation |
| Before staging deployment | Build, dependency audit, secret scan, integration, sanity, migration validation, critical E2E |
| After successful staging deployment | Smoke, sanity, critical-path E2E, API health, database connectivity, worker health, queue checks, accessibility |
| Before release-candidate approval | Full regression, security, performance, load, resilience, backup restoration, quality audit (section 16A) |
| Manual trigger | The suite, environment, and browser selected under section 16B.3 |

Use separate workflows or reusable jobs as appropriate.

Load tests and fault injection never run automatically against shared staging or production. They run only on a dedicated disposable environment, started manually or by the release-candidate workflow against that disposable environment.

### 16B.3 Manual test execution (`workflow_dispatch`)

Provide a workflow where the owner or an authorized developer selects:

- **Test suite:** all applicable, unit, integration, sanity, smoke, regression, critical E2E, full E2E, accessibility, responsive, cross-browser, security, performance, load, platform failure, release-candidate validation
- **Environment:** local or CI ephemeral environment, or isolated staging
- **Browser:** Chromium, Firefox, WebKit, or all supported browsers
- Optional: a module or test scope

Requirements:

- Validate every input against an explicit allowlist
- Restrict who can run privileged workflows and environments using GitHub permissions and environment protection rules
- Production is never an execution target in this workflow
- Load and platform-failure suites can target only the ephemeral environment
- Document the steps in the README: GitHub → Actions → select the workflow → Run workflow → choose the test suite, environment, and browser → Run

### 16B.4 Staging deployment validation

Staging prerequisites:

- Staging must be separate from production. It must not run on the production Hostinger VPS, use the production database or Redis, or hold production data or secrets (section 9)
- Staging infrastructure, its access credentials, and its GitHub environment secrets are provided by the owner. If no separate staging host exists, staging deployment is blocked: record a READY_FOR_OWNER entry in `blocker.txt` and keep validating in ephemeral CI environments

For every authorized staging deployment:

1. Verify the target is staging, not production, by checking the configured host and environment identity against a recorded allowlist
2. Verify the revision identifier and build artifact identity (checksum)
3. Run the pre-deployment checks
4. Validate database migrations against isolated, staging-compatible synthetic data
5. Deploy the verified immutable artifact
6. Wait for readiness and health checks, with bounded retries
7. Run smoke tests
8. Run sanity tests
9. Run critical-path E2E tests
10. Verify database, Redis, workers, queue, and dependent service health
11. Verify authentication, user isolation, and core workflows
12. Check error rates and critical application logs
13. Record deployment and test evidence
14. Mark the deployment successful only when every mandatory gate passes

Never mark a deployment successful because containers started or a build completed.

### 16B.5 Failed deployment handling

When post-deployment validation fails:

- Mark the deployment failed and stop further automated promotion
- Preserve logs, test results, and diagnostics
- Use the documented, tested staging rollback procedure where safe
- Never blindly reverse a database migration that may lose data
- Validate service health and data integrity after recovery
- Record the failure and a root-cause investigation (section 20.1)
- Apply the fix and rerun the required validation suite

Production rollback remains owner-authorized.

### 16B.6 Test evidence and reporting

Every workflow run reports:

- Workflow name and trigger
- Branch and revision identifier
- Environment
- Test suite and browser
- Passed, failed, skipped, and flaky tests
- Measured coverage
- Results and relevant timings
- Build artifact identity
- Playwright screenshots, traces, and videos on failure
- Accessibility findings
- Security findings, sanitized
- Deployment and rollback results where applicable

Upload CI artifacts with explicit retention limits. Proposed defaults, which the owner may change: 30 days for test reports and coverage, 14 days for screenshots, traces, and videos.

Secrets, OTP values, personal information, and sensitive request bodies never appear in reports or artifacts.

A skipped mandatory test is reported as incomplete, not passed.

### 16B.7 Test reliability and flakiness

- Use deterministic synthetic test data
- Isolate test databases and Redis instances per run
- Do not depend on real email or paid APIs
- Clean up test resources
- Detect flaky tests and record their history in `PROGRESS.md`
- Retries are bounded: at most 2 retries per test, only where technically justified. A test that passes only on retry is reported as flaky, not as a clean pass
- Never hide recurring failures with unlimited retries
- Mandatory tests that stay unstable block readiness

### 16B.8 GitHub Actions security

- Least-privilege `permissions` set explicitly in every workflow
- Third-party actions pinned to immutable versions
- Secrets stored as GitHub secrets or environment secrets; no production secrets in test workflows
- Manual and deployment workflows restricted to authorized users
- Concurrency controls so staging deployments never overlap
- Build artifact integrity and provenance checks
- Untrusted code and dependency installation handled safely: no secrets exposed to workflows triggered by forks, lockfile-based installs only
- Secret scanning and supply-chain checks
- No unnecessary repository write permissions

### 16B.9 Actions usage limits

- Check the repository's GitHub Actions minutes and storage limits before enabling nightly all-browser runs
- If the limits are too low for the trigger matrix, do not reduce or skip mandatory runs on your own. Record a READY_FOR_OWNER entry in `blocker.txt` with measured run times and options (a larger plan, a self-hosted runner, or an owner-approved schedule change)

### 16B.10 CI/CD documentation

Create or update:

- The CI workflow directory: the executable workflows
- `docs/runbooks/ci-cd.md`: pipeline architecture and operation
- `docs/runbooks/manual-testing.md`: manual run instructions
- `docs/runbooks/staging-deployment.md`: safe deployment, validation, and rollback
- `QUALITY_AUDIT.md`: evidence of executed quality checks
- `PROGRESS.md`: workflow implementation status
- `blocker.txt`: unavailable CI credentials, staging infrastructure, branch restrictions, or owner actions

Use the repository's actual scripts and workflow names, not placeholders.

### 16B.11 CI/CD acceptance tests

Before marking the automated testing system complete, prove with actual workflow runs:

1. A development push triggers the expected checks
2. A test failure fails the workflow
3. Coverage below the threshold fails the build
4. Security findings block integration as required
5. Manual triggering works
6. Every manual suite option maps to a real test command
7. Nightly scheduling is configured and has produced at least one run
8. Playwright runs on Chromium, Firefox, and WebKit
9. Accessibility and responsive suites run successfully
10. Staging deployment triggers post-deployment smoke, sanity, and critical-path validation
11. Failed staging validation prevents promotion
12. Rollback and recovery are tested safely
13. CI artifacts and reports are accessible
14. No workflow bypasses branch protection
15. No workflow written by the agent can deploy to production

Use safe negative-test fixtures (a deliberately failing test, a coverage drop, a known-vulnerable test dependency) on a temporary branch, and remove them after the check. Never leave them on the development branch.

Where a check depends on unavailable infrastructure, credentials, or owner authorization, implement the safe parts and record the rest as blocked.

Do not mark an automation requirement passed until an actual workflow run demonstrates the trigger, execution, failure handling, and evidence capture.

---

## 17. Mandatory blocker.txt

Create `blocker.txt` in the repository root.

Every unresolved blocker must use this template:

**BLOCKER ID:**  
**Title:**  
**Priority:** Critical / High / Medium / Low  
**Module:**  
**v12 requirement / checklist item:**  
**Status:** OPEN / READY_FOR_OWNER / RESOLVED / VERIFIED  
**Problem:**  
**Verified root cause:**  
**Current implementation:**  
**Impact:**  
**What the agent already tried:**  
**Work completed:**  
**Why autonomous resolution is unsafe or impossible:**  
**Exact owner action required:**  
**Step-by-step resolution instructions:**  
**Required environment-variable names (no values):**  
**External dependencies:**  
**Expected result:**  
**Verification procedure:**  
**Tests to rerun:**  
**Affected tasks:**  
**Evidence references:**  

Rules:

1. Record blockers immediately.
2. Include complete, actionable, numbered resolution instructions.
3. Use precise commands and provider-console navigation where known.
4. Never invent configuration instructions or external approval requirements.
5. Separate verified findings from assumptions.
6. Do not store secret values.
7. Preserve resolved blockers for traceability.
8. Continue all independent work that remains safe.
9. Revisit blockers only when dependencies change or new evidence becomes available.
10. Never silently turn a blocked checklist row into a pass.

Expected external dependencies include:

- Domain SPF, DKIM, and DMARC.
- Resend verification.
- ~~Second email provider.~~ Superseded by D11-R (Amendment A1). Not a blocker.
- Licensed job-data permissions where relevant.
- Hostinger backup validation.
- Off-host WAL archive configuration.
- Counsel review.
- Candidate and recruiter research.
- Owner-defined listing coverage thresholds.
- Authorized production-only validation.
- Final launch approval.

Do not treat gated post-launch integrations as launch blockers unless an approved launch requirement depends on them.

---

## 18. Documentation and evidence

Maintain:

### `PROGRESS.md`

Include:

- Module.
- Requirements.
- Implementation progress.
- Acceptance-test status.
- Integrated status.
- Readiness.
- Open defects.
- Dependencies.
- Evidence.
- Baseline backup record (section 4.1).
- Integration records for each item, including review result or "independent review pending" (sections 4.2 and 16).
- Checkpoint summaries (section 19).

### `GAP_MATRIX.md`

Include every relevant v12 requirement and the corresponding repository evidence.

### `blocker.txt`

Include unresolved owner and external actions with step-by-step instructions.

### `docs/decisions/`

Include material architecture decision records describing context, alternatives, tradeoffs, and selected approaches.

### CI/CD runbooks

`docs/runbooks/ci-cd.md`, `docs/runbooks/manual-testing.md`, and `docs/runbooks/staging-deployment.md`, as described in section 16B.10.

### `QUALITY_AUDIT.md`

Include the final quality report described in section 16A.9.

### `docs/investigations/`

Include root-cause analyses produced by the failure-escalation procedure (section 20.1).

### `docs/runbooks/`

Include operational procedures for:

- Authentication provider outage.
- Email provider switching.
- Backup and restoration.
- WAL recovery.
- Kill switches.
- Secret rotation.
- Service outage and worker recovery.
- Security incident response.

### Final go/no-go report

Include all 25 v12 section 15 items with:

- Requirement.
- Severity.
- Owner.
- Evidence.
- Status.
- Blocker.
- Remaining action.

Evidence must be traceable to actual code, test executions, environment identity, and revision identifier.

Do not fabricate evidence or percentages.

---

## 19. Progress calculation and reporting

Report implementation progress and launch readiness separately.

Track:

1. Requirements specified.
2. Requirements implemented.
3. Requirements acceptance-tested.
4. Requirements integrated.
5. Requirements launch-ready.
6. Blocked requirements.
7. Unresolved security issues.
8. Go/no-go items passed.
9. Go/no-go items waived by the owner in writing.
10. Go/no-go items blocked or failed.

Use measured coverage results rather than estimated code coverage.

Every reported percentage must identify its numerator and denominator.

Do not present a subjective architecture or design score as an objective launch-readiness measurement.

After each completed item, record:

- Item ID.
- Current status.
- Commit revision.
- Checks passed.
- Remaining issues.

After each completed pass over the gap matrix, update the consolidated reports.

Do not stop merely because an arbitrary ticket or iteration count has been reached.

Checkpoints (not stops): every 10 integrated items or every 24 hours of work, whichever comes first, update `PROGRESS.md`, `GAP_MATRIX.md`, and `blocker.txt`, and post a status summary of no more than ten lines. Then continue.

---

## 20. Hard-stop conditions

Stop the affected task and document the blocker when:

- A proposed change conflicts with D1–D14.
- A material owner-only decision is necessary.
- External permission or credentials are required.
- Legal review or provider approval is needed.
- A production action would be required.
- Existing protected-branch restrictions prevent integration.
- A critical security risk cannot be resolved safely.
- A destructive operation would risk real data.
- A mandatory test or check still fails after the failure-escalation procedure in section 20.1 finds no safe resolution.
- A proposed implementation would violate applicable source rights.

Continue unrelated safe work.

If every remaining task depends on such blockers, finish with a complete status report rather than repeatedly requesting the same information.

### 20.1 Failure escalation

After three unsuccessful attempts on the same failing item:

1. Stop retrying the same approach.
2. Perform a documented root-cause analysis: reproduce the failure minimally, collect privacy-safe logs and evidence, and separate verified causes from hypotheses. Record it in `docs/investigations/<item-id>.md` and link it from `PROGRESS.md`.
3. If a justified new approach can resolve the failure safely, record the justification and continue fixing. The new approach must not weaken requirements, tests, thresholds, or security. Each new approach gets its own three-attempt cycle and its own root-cause record.
4. If two consecutive approaches each exhaust their attempts without measurable progress, treat the item as genuinely blocked.
5. When genuinely blocked, record in `blocker.txt`: the exact cause (verified or best-supported), every attempted fix, the recommended next steps, and the evidence references.
6. Isolate the affected work: keep it on its task branch, unintegrated; keep any related feature flag off; mark dependent items as blocked in `GAP_MATRIX.md`.
7. Continue unrelated safe tasks.

Never skip, disable, or weaken a test, lower a threshold, or mark a failing item as passed to get past this procedure.

---

## 21. Go/no-go requirements

Track every v12 section 15 checklist item.

Especially protect the critical gates:

1. Production email OTP authentication and disabled test login.
2. Resend-only failure behaviour (D11-R): missing and invalid key, outage, timeout, bounded retry, recovery; no SMTP or secondary-provider routing. Replaces the former second-provider failover item.
3. Resend outage behaviour: existing sessions continue; new sign-ins show the unavailable state.

- Proposed, not yet among the approved 25 items (Amendment A1.11): live OTP verification through the production Resend configuration, owner-supervised.

4. Source permissions.
5. Listing coverage against owner thresholds.
9. Recovery point and restore evidence.
10. Off-host backups.
11. Record-level isolation.
20. Independent operational alert delivery.
21. Production kill-switch verification.
25. Owner risk acceptance and launch authorization.

Do not replace production-only evidence with staging results without explicitly distinguishing them.

Do not mark checklist items passed using unverified assumptions.

Any owner waiver must be written, traceable, and consistent with the approved launch criteria. The agent cannot independently waive critical requirements.

---

## 22. Final completion definition

The autonomous development loop is complete when:

1. All safe, locally executable v12 launch-core functionality is implemented.
2. Required acceptance tests pass wherever executable.
3. Security, accessibility, integration, and regression evidence is recorded.
4. The development integration baseline is validated.
5. All unresolved external dependencies appear in `blocker.txt`.
6. The entire go/no-go checklist has evidence or explicit unresolved status.
7. All required documentation and operational instructions exist.
8. The final report identifies exact remaining owner actions.
9. The repository is left in a clean, recoverable, inspectable state.
10. The comprehensive quality audit (section 16A) is complete and `QUALITY_AUDIT.md` reflects measured results.
11. The CI/CD acceptance tests in section 16B.11 pass with actual workflow runs, or each unmet test is recorded as blocked.
12. No production deployment or unauthorized production change has occurred.

Development completion does not imply launch approval.

The agent must clearly distinguish:

- Development complete.
- Development blocked.
- Technically validated.
- Release candidate ready for owner review.
- Production launch approved.

Only the owner can authorize production launch.

---

## 23. Final deliverables

Provide a final report containing:

1. Executive completion summary.
2. Complete feature-by-feature progress table.
3. Architecture and system-design summary.
4. Verified implementation and readiness percentages.
5. Test totals, failures, and coverage.
6. Security and privacy assessment.
7. WCAG 2.2 AA and localization results.
8. Performance and resilience results.
9. Database migration and recovery evidence.
10. External integrations and permission status.
11. All 25 go/no-go results.
12. Outstanding issues by severity.
13. `blocker.txt` with step-by-step owner actions.
14. Final branch name and revision identifier.
15. Final CI status.
16. Release blockers and accepted risks.
17. Exact production preparation steps requiring owner authorization.
18. `QUALITY_AUDIT.md` (section 16A.9).
19. CI/CD status: workflow list, latest run IDs and results for each trigger, staging deployment evidence, and the section 16B.11 acceptance results.

Do not claim production readiness if the required evidence is missing.

---

## 24. Final execution instruction

**Execute the complete CareerScope v12 launch-core development autonomously.**

Do not create pull requests or wait for routine implementation approvals.

Make well-supported technical decisions independently, preserve the agreed product scope, maintain professional architecture and code quality, validate every meaningful change, and resolve problems rather than merely documenting them.

Complete all work that can be executed safely within the authorized environment.

For every genuine blocker, provide an exact, step-by-step owner resolution procedure in `blocker.txt`.

Do not stop prematurely because a separate requirement is blocked.

Do not deploy to production, modify production configuration, bypass repository security rules, invent external permissions, or override D1–D14.

**The desired outcome is one complete, tested, documented, recoverable CareerScope launch-core implementation, with every remaining owner dependency clearly recorded and no false claims of readiness.**

---

## Amendment A1 (20 October 2026): work items and blockers for Resend sign-in, consent and test isolation

Status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL. Specification: CareerScope-v12.md Amendment A1. Controls: CareerScope-Engineering-Standards.md Amendment A1.

### A1.G1 Work items (dependency order)

| ID | Work item | Gate |
|---|---|---|
| CS-A1-01 | Audit the current authentication code, the `.env` variable names (names only), and every email sender at an exact revision. Record findings in PROGRESS.md. Do not print values | 4.1, go/no-go 1 |
| CS-A1-02 | Remove or disable any second-provider or SMTP route on the sign-in path; add the negative test | D11-R, go/no-go 2 |
| CS-A1-03 | Implement OTP lifecycle, enumeration hardening and cooldowns per Engineering Standards A1.E3 | 4.1, section 7 |
| CS-A1-04 | Implement Resend failure behaviour and the nine tests in v12 A1.3 | go/no-go 2, 3 |
| CS-A1-05 | Implement signup Terms, privacy link and marketing consent with server-side enforcement (v12 A1.6) | section 10, 4.15 |
| CS-A1-06 | Audit any Resend delivery webhook handler (A1.7) or record NOT_APPLICABLE_YET | 4.15 |
| CS-A1-07 | Install the recording transport and provider-call guard in tests (A1.8) | section 9 |

### A1.G2 blocker.txt entries

| Blocker | Priority | Status |
|---|---|---|
| Owner approval of D11-R and this amendment (no approval record created by the agent) | Critical | READY_FOR_OWNER |
| Resend domain verification and DNS evidence for careerscope.tech; registrar, DNS, mailbox host | Critical | READY_FOR_OWNER (UNKNOWN until evidence supplied) |
| Live OTP inbox delivery test (proposed go/no-go 26) | Critical | READY_FOR_OWNER |
| Confirm the live-test opt-in name (proposed `CAREERSCOPE_LIVE_EMAIL_TEST`) | Medium | READY_FOR_OWNER |
| Legal drafts for Terms, Privacy Policy and marketing consent | High | READY_FOR_OWNER |
| D12 recovery-point conflict (existing item) | Critical | READY_FOR_OWNER |

### A1.G3 Rule

Do not mark the Resend integration complete because a `.env` file was updated. Status moves only on executed evidence at an exact revision, and live delivery is never inferred from a mock.

### A2.G1 OpenRouter work items (Amendment A2; activation only after approval)

| ID | Work item | Gate |
|---|---|---|
| CS-A2-01 | Inventory existing AI code paths and any direct-provider calls at an exact revision; record in PROGRESS.md | section 16A |
| CS-A2-02 | Build the server-side OpenRouter gateway with allowlist, budgets, timeouts, cancellation and usage accounting, against mocked responses | section 12, A2.3 |
| CS-A2-03 | Implement the A2.5 test set; add a CI guard against real provider calls | section 11 |
| CS-A2-04 | Gated features (for example AI resume rewriting) stay off until factuality, privacy, disclosure, and quota gates pass | section 2 |

### A2.G2 blocker.txt entries

| Blocker | Priority | Status |
|---|---|---|
| OpenRouter account, funding, and spend ceiling (owner-set) | Critical | READY_FOR_OWNER |
| Verification of current OpenRouter model prices, quotas, and availability before activation | High | READY_FOR_OWNER |
| Privacy-terms, retention, and processor review for OpenRouter routing | High | READY_FOR_OWNER (counsel) |
| Live inference test with approved budget and non-production data | High | READY_FOR_OWNER |
| Approval of CR-04 and Amendment A2 | Critical | READY_FOR_OWNER |

---

## Amendment A3 (20 October 2026): hosting and test work items

Status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL. The goal's authority and precedence are unchanged.

| ID | Work item | Status |
|---|---|---|
| CS-A3-01 | Read-only audit of the shared host, if authorized: container list, published ports, networks, reverse-proxy routes, volumes, health, backups. Record names only | Autonomous only with owner-granted read access |
| CS-A3-02 | Container limits, private networks, namespaces, and separate workers in the deployment configuration, with tests | Autonomous (in repository) |
| CS-A3-03 | CI workflows matching the trigger matrix in Amendment A3.3; prove each trigger with an actual run | Autonomous; a run is evidence only once it exists |
| CS-A3-04 | Load and soak plan on a disposable environment, with measurements that decide capacity | Autonomous (plan and disposable run); numeric targets are owner decisions |
| CS-A3-05 | Restore drill and failover exercise on disposable infrastructure only | Autonomous on disposable infrastructure |

Blockers (READY_FOR_OWNER): CareerScope public host; staging host; VPS renewal affecting the shared environment; registrar, DNS, and mailbox evidence for `careerscope.tech`; load targets; backup location.

Rule: a configuration file or workflow is not evidence that a control works. Evidence needs an executed run at an exact revision.

## Launch baseline work items (owner update, 20 October 2026)

Implement and test controls LB1 to LB19, LA1 to LA12 and LG1 to LG8 listed in the Engineering Standards section "Launch baseline controls and tests". The section is PROPOSED under CR-07 and is not approved until the owner records approval in blocker.txt. Each control needs an executed test before its status moves above PLANNED, and results are recorded in TEST_MATRIX.md. Controls marked OPEN, NOT_DUE or NOT_APPLICABLE_WITH_REASON are not built until the owner decides in blocker.txt or applicability is confirmed. No control is reported as implemented on the basis of this document.

## Cleanup baseline reference (v1.2 round)

- Requirement matrix: `Viswatra-Cleanup-Requirement-Matrix-v1.2.md` (delivered with this document set).
- CareerScope applicable items: 156. ALREADY_COVERED 97; PARTIALLY_COVERED 28; NEW_REQUIREMENT 31; BLOCKED_BY_EXTERNAL_DECISION 0; NOT_APPLICABLE 1.
- Code status of every item is NOT_ASSESSED. Documentation status does not establish implementation status.
- Every NEW_REQUIREMENT item is PROPOSED and needs owner approval recorded in `blocker.txt`. Legacy authentication removal (CL-A17, CL-A18, CL-D12) waits for a verified migration decision and deletes no identity records, password hashes, columns, migrations or accounts.
