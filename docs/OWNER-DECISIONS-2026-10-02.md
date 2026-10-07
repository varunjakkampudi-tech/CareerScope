# CareerScope owner decisions — 2026-10-02

Status: **APPROVED OWNER DIRECTION**

This record resolves product/architecture choices that were intentionally blocked on owner direction.
It does not fabricate host, provider, CI, legal, or operator evidence. Tickets that additionally require
live evidence remain blocked until that evidence exists.

## CS-46 — resume-derived matching facts

**Decision: explicit per-fact exclusion gate.**

CareerScope must never silently reintroduce a resume-derived skill or title that the candidate declined.
Add durable exclusions for resume-derived skills/titles, scoped to the candidate and resume parse/revision.
The matching context may use accepted resume-derived facts plus explicit profile preferences; excluded facts
must contribute zero to matching, recommendations, recruiter discovery, or AI context.

Requirements:

- exclusions are explicit, reversible and visible to the candidate;
- re-parsing a changed resume creates a reviewable proposal and does not silently clear prior intent;
- match evidence distinguishes profile-entered, resume-accepted and excluded facts;
- years-of-experience keeps the existing explicit-user-value-wins rule;
- no LLM decides whether an excluded fact returns.

## CS-40 / CS-88 — admin authorization and admin UX

**Decision: proceed with a dedicated privileged Admin Control Plane.**

Approved functional scope: dashboard, users/candidate verification, recruiters, jobs/content, CMS,
analytics, AI model/cost controls, system/server health, logs/audit, feature flags, integrations,
privacy/data requests, providers, queues/workers/DLQ, backups, deployments, scheduled jobs and security.

Authorization contract:

- server-enforced RBAC and least privilege; UI hiding is never authorization;
- initial roles: Owner, Platform Admin, Support, Content Editor, Recruiter Operations,
  Security Auditor and Billing Viewer;
- destructive/high-risk operations require explicit confirmation, reason and audit event;
- no raw arbitrary database editor;
- secrets/tokens/cookies/passwords are never returned to the admin UI;
- operational logs and immutable admin/security audit events remain distinct;
- CMS publishing uses Draft -> Preview -> Publish -> Version History -> Rollback.

The approved CareerScope Design System handoff is the visual source of truth. Implementation must use
real APIs/data or explicit unavailable states; illustrative screenshot values are never production data.

## CS-44 — account recovery and verification

**Decision: do not build a second bespoke email-token recovery system.**

Cognito is the target identity architecture. CS-44's security requirements (non-enumeration, expiry,
single-use semantics, throttling, abuse controls, safe recovery UX) become acceptance requirements of
the Cognito authentication work. Until Cognito is released, retain the current authenticated password
change and documented operator recovery path; do not expose a fake forgot-password flow.

## CS-90..CS-94 — Cognito architecture

**Decision: approved target architecture.**

- AWS region: **ap-south-1**.
- Primary account identifier: **verified email**. Email comparison is normalized/case-insensitive.
- Phone number: optional profile/contact field initially; phone OTP login is a later capability.
- Hosted identity authority: Cognito; CareerScope continues to issue/own its opaque application session
  after server-side provider verification/exchange.
- Browser storage must not persist Cognito access/refresh tokens.
- Custom auth domain target: **auth.careerscope.tech** when DNS/certificate configuration is ready;
  provider default domain may be used only for controlled pre-production verification.
- Existing owner account is linked/migrated by verified normalized email through a one-time controlled
  migration; never create a duplicate owner. Existing password hashes are not exported to Cognito.
- Rollout is feature-flagged/canary and keeps the current Argon2/session path available as rollback until
  disposable-account E2E, monitoring and owner-account continuity are proven.
- OTP values/tokens never enter logs, URLs, repository evidence or analytics.
- Branded email sender target: a verified CareerScope domain identity; actual From/Reply-To and SES
  production access remain operational/DNS evidence, not assumptions.

## CS-89 — OpenRouter / AI

**Decision: architecture and eventual activation approved, but production remains default-OFF until secret and live proof exist.**

AI may provide assistive preparation/explanation functionality only. It must not control deterministic
matching, ranking, authorization, identity, candidate verification or application status.

Activation requirements remain fail-closed:

- owner-provisioned secret through the approved runtime secret path, never Git/chat;
- a specific provider-catalog-verified free model immediately before activation;
- budgets/rate limits and admin kill switch;
- redacted telemetry/cost attribution;
- exact-SHA deployment, live verification and rollback proof.

This decision clears the product-approval question; it does not pretend the secret or live activation exists.

## CS-5 — V1 retirement

**Decision: V2 is canonical; retire V1 only through evidence-backed strangler migration.**

Do not delete the legacy layer in one large change. For each remaining V1 dependency:

1. inventory consumer and data contract;
2. provide V2 replacement;
3. run parity/compatibility evidence;
4. move production consumer;
5. prove rollback;
6. delete only after no runtime/build/deploy dependency remains.

Static/public artifacts that still serve a legitimate purpose may remain until their V2 replacement is live.
No 22k-line deletion is accepted merely to improve a completion percentage.

## CS-30 / CS-86 — managed firewall

**Decision: required production policy is allow inbound 22/80/443 only; deny other unsolicited inbound traffic.**

Preserve the existing OS nftables and loopback/container-network controls. The managed Hostinger firewall
is defence in depth and must be configured in hPanel and verified externally. This repository record is
owner approval of the policy, **not evidence that hPanel has been changed**.

## CS-34 — web runtime least privilege

**Decision: approve least-privilege web runtime and rollout.**

The web service receives only configuration it demonstrably consumes. Database credentials, resume
encryption material and unrelated service secrets must not be inherited by the web runtime. Roll out
through the normal exact-SHA deployment gate and verify production health/provenance.

## Backups and off-host disaster recovery

**Decision updated: production data protection is required before CareerScope becomes materially multi-user.**

For the current single-owner phase, local verified database backups may remain the immediate baseline.
Before public/multi-user/recruiter rollout, add encrypted off-host backups with least-privilege credentials,
retention, restore drill, monitoring and documented RPO/RTO. A backup is not considered proven until a
restore is successfully verified. Do not describe local-only snapshots as disaster recovery.

## Candidate verification

Approved trust model: candidates may upload a profile photo; an authorized CareerScope verification role
reviews the profile and completes the defined verification call/process. The verified badge is protected
backend state only. Candidate-editable data cannot set or preserve it. Decisions are auditable and the
badge means only CareerScope's defined profile/identity verification — not employment, skills, government
identity, background-check clearance or endorsement unless separately implemented.

## External integrations

Email, LinkedIn, Naukri and other connected accounts are future, feature-flagged integrations.
Use only legitimately authorized provider capabilities. No credential harvesting, cookie/session replay,
CAPTCHA bypass or unauthorized authenticated scraping. Provider capabilities are explicit and default-deny.

## Closure rule

Owner-decision blockers covered above may now move to implementation/design review where their owner gate
was the only blocker. Tickets requiring live Hostinger, DNS, provider-secret, CI, human accessibility,
or restore evidence remain blocked until that real evidence is recorded.

## OD-2026-10-07-CS80-AC3 — Phase 3.25 generated-artifact checkpoint exception

**Date:** 2026-10-07
**Affected ticket:** CS-80
**Affected criterion:** AC3

**Original conflict:** CS-80 AC3 prohibits generated artifacts from entering Git history, while the
Phase 3.25 continuation requires deterministic ticket specifications, catalogs and traceability
projections to be committed for auditable review and handoff. A task request alone did not amend the
canonical criterion.

**Decision:** Approve a narrow exception only for deterministic outputs of the approved Phase 3.25
specification generator on `phase-3.25/cloud-continuation`, under the exact path allowlist in
`.ai/ticket-specification-policy.json#generatedArtifactCheckpoint.generatedPaths`. The generator must
prove that this list exactly equals its changed output paths against immutable base commit
`3911a52fb2167707a1b04e258c15c403815286e4`; this comparison remains stable after the checkpoint is
committed. The exact reviewed list contains 32 paths and is bound by SHA-256
`0f1eb5d8a80ef12ae7c3c01c08f0686950b42f1c5b430122b5025a298e82fa69`. The general prohibition remains
the default.

**Rationale:** Versioned, source-derived review projections are necessary for reproducible specification
review and resumable local/cloud checkpoints. This does not justify tracking arbitrary generated output.

**Allowed scope:** Only allowlisted Phase 3.25 catalog, specification and traceability projections that
are reproducible from source-of-truth inputs and committed atomically with their corresponding source
changes. The generator's complete output manifest is not blanket permission to stage every output.

**Prohibited scope:** Secrets, credentials, tokens, passwords, cookies, private resumes, personal data,
runtime/provider/user-generated data, logs, caches, build/deployment output, and unrelated or manually
edited generated files remain prohibited. No product/runtime or ticket workflow change is authorized.

**Branch scope:** `phase-3.25/cloud-continuation` only. No merge to `main` is authorized. A later explicit
integration decision must determine whether these projections remain versioned, are excluded, or are
generated by CI/another evidence mechanism.

**Determinism requirement:** Run the approved generator twice; the second invocation must make zero
changes. Validate generated-artifact drift, exact staged paths, and privacy/publication guards before
commit.

**Main integration requirement:** This exception expires at the feature-branch boundary and confers no
main-branch integration permission.

**Rollback/revocation condition:** If generation is not deterministic, a path is outside the explicit
allowlist, a privacy/publication check fails, or this direction is revoked before commit, do not stage or
publish the affected outputs. Remove only the explicitly authorized feature-branch checkpoint by a
normal follow-up revert if already pushed; do not rewrite history or force-push.

## OD-2026-10-07-CS80-AC3-V2 — Rolling deterministic generated-artifact manifest

**Date:** 2026-10-07
**Supersedes/extends:** OD-2026-10-07-CS80-AC3; only the fixed 32-path checkpoint list is replaced by a
controlled rolling manifest. All other limits remain in force.
**Affected ticket/criterion:** CS-80 / AC3
**Policy:** `CONTROLLED_ROLLING_DETERMINISTIC_MANIFEST`

**Decision:** A newly generated path is automatically eligible for a Phase 3.25 checkpoint only when it
is emitted by the approved deterministic specification generator, belongs to an already represented
artifact class and existing generator-owned output root, derives solely from approved source-controlled
Phase 3.25 inputs, is required for specification/catalog/traceability/review/handoff, contains no
secret, credential, token, cookie, runtime/provider/user data, log, cache, build output or unintended
personal data, and is added to a recomputed exact manifest whose delta is reviewed before staging.
Generator-owned outputs are not manually edited. The applicable privacy, publication, determinism and
specification checks must pass before a checkpoint is made.

**Manifest contract:** Each checkpoint records the immutable base commit, previous and current manifest
hashes, current path count, added/removed/unchanged path sets, artifact class and generator ownership for
each path, plus safety and determinism validation state. The rolling manifest is the exact inventory of
all currently emitted generator-owned outputs; the validator separately derives and records which of
those outputs differ from the immutable base, and rejects unknown roots, classes, filenames or branch
scope. This allows the approved generator's existing output to be reviewed without requiring every
unchanged projection to appear in the current Git diff. `docs/tickets/CS-NNN.md`, the existing `.ai` catalog outputs, and
the existing `docs/PHASE-3-25-*.md` projections are the only presently represented roots/classes; a
new root or class still requires explicit owner approval.

**CS-101 determination:** `docs/tickets/CS-101.md` is a per-ticket specification projection in the
existing `docs/tickets/` root and is emitted by the existing approved generator from the canonical
backlog, policy, design index and traceability inputs. Its addition does not create a new artifact class
or root; it is eligible under the rolling manifest after the checks above pass. This determination does
not approve the CS-101 specification itself, activate AI, authorize product/runtime changes or turn
planned visual/browser evidence into completed evidence.

**Branch scope:** `phase-3.25/cloud-continuation` only. **Main integration authorized: NO.** The V2
decision does not decide whether generated artifacts are retained on `main`, regenerated in CI,
excluded from `main`, or handled by another canonical model. That decision is deferred to a separate
explicit owner decision before integration.

**Owner approval remains required** for a new output root, new artifact class or evidence type, output
outside the current generator-owned model, binary/runtime/user/provider data, logs, caches, secrets or
personal data, or any change to main-branch integration policy.

**Revocation conditions:** Stop checkpointing if determinism, exact-manifest membership, privacy or
publication validation fails; if any path or content falls outside this policy; if branch scope changes;
or if the owner revokes this direction. If already pushed, use a normal reviewed revert on this feature
branch; never rewrite history or force-push.
