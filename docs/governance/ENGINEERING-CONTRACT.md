# CareerScope autonomous engineering contract

## Authority and activation

The project owner's written approval dated 20 October 2026 authorizes the five
versions in SOURCE-REGISTER.md and autonomous development-branch integration.
That workflow restriction was superseded by OA-2026-10-21-01, which made `main`
the permanent integration branch and authorized normal direct synchronization
of independently reviewed, validated changes. The required governance transition
was committed and verified on `codex/dev` before this superseding decision; it is
historical activation evidence, not a continuing branch requirement. The project
owner has reiterated the direct-main authorization for this goal. Neither
authorization certifies implementation or launch readiness. Follow the current
owner instruction, preserve worktrees, recheck remote `main`, and push only an
exact, clean, independently reviewed and fully validated integration candidate.
No force-push, mandatory-check bypass, settings change, or production deployment
is authorized.

Precedence: approved v12 D1–D14; other v12 product requirements; the approved
CareerScope Goal's execution rules; product engineering standards; applicable
global standards, using the stricter compatible engineering control. The global
program does not expand product scope. Record material conflicts READY_FOR_OWNER.

## Git and independent review

- Permanent integration branch: `main`. The owner's 21 October 2026 direct
  instruction supersedes the earlier `codex/dev`-only restriction and authorizes
  local integration followed by a normal push to the currently unprotected main.
  Temporary task branches/worktrees are optional isolation, not permanent stages.
- Preserve history and all owner work. Never force-push, rewrite published
  history, bypass protection, or change GitHub settings. Production remains
  owner-only. Recheck remote main before integration and before pushing.
- Integrate coherent validated changes locally and sequentially. Hosted Actions
  evidence remains unavailable while Actions is disabled; disclose this limit.
  This owner-authorized repository synchronization is not production acceptance.
- Before major changes: verified external all-ref bundle, SHA256, recovery clone,
  ref comparison and fsck. Preserve owner edits; use separate worktrees if dirty.
- One writer per branch. Independent review uses a separate session receiving
  requirements, diff, surrounding code and test results, not writer reasoning.
- Sensitive auth/authorization/personal-data migration/outbound messaging/deletion
  changes require independent review before integration. No self-approval or
  simulated review. The owner has authorized this consolidation into main;
  production promotion still requires separate owner acceptance.
- Keep a change/rollback register. No destructive rollback of personal data.

## Product invariants

The full v12 launch core, not the older R1 scope, is the approved target.
Production sign-in OTP uses Resend only under OA-2026-10-22-01; no second
provider is required for sign-in, and a Resend failure leaves sign-in
unavailable without weakening authentication. This decision does not activate
unapproved details of Amendment A1 or determine channels for other email
workflows. Test selection must fail closed in production. Existing mature
architecture remains until concrete evidence justifies a change; proposed
CSS/tools are not an automatic migration.

Candidate review and submission remain authoritative: opening an external URL
does not mark Applied. No automated submission, employer credentials, LinkedIn
ingestion/fill, unauthorized portal scraping, fabricated ATS events or fake data.
Launch sources require permitted-use profiles and measured coverage; other sources
remain gated. Referrals/AI rewrite/browser helper and other conditional features
must not become launch blockers or active features merely because code exists.

## Security and operational boundaries

No real secrets, OTPs, tokens, customer data, raw resumes or private environment
contents in chat, Git, logs, screenshots, reports or reviewer context. Public
repository records contain no private filesystem paths or other-product status.
Keep sensitive backup paths and diagnostics in protected external evidence.

Use synthetic fixtures and mocked external providers. Real DB checks require
isolated PostgreSQL/Redis; do not substitute memory tests. Never send real email
or WhatsApp, contact candidates/employers/portals, incur charges, create accounts,
rotate live credentials, accept terms or alter production/DNS/IAM/payment settings.
Owner alone changes repository settings, secrets, environments and Actions budget.
No workflow may deploy production or trigger production from main.

Preserve ownership, CSRF, input/output validation, encryption, transactional outbox,
idempotency/fencing, safe errors and least privilege. Never weaken tests, coverage,
security or privacy controls. High/critical findings require remediation or the
strict documented owner exception process; an agent cannot waive them.

## Evidence and quality

Maintain PROGRESS.md, GAP_MATRIX.md, TEST_MATRIX.md, QUALITY_AUDIT.md,
CHANGE_REGISTER.md, architecture/ADRs and the single blocker.txt register.
Every claim names actual scope, SHA, command, result and evidence level. Historical
green tests do not prove current source; mocked providers do not prove live ones.

Apply all applicable global categories and CR-01: unexpected browser console,
page/rejection/hydration/network errors fail critical journeys; narrowly justified
expected messages need explicit reviewed allowlists. Prove no sensitive leakage
through responses, storage, bundles, logging, telemetry or exports. Track incidents
and audit manual and automated sensitive actions. No compliance claim from axe alone.

Run relevant formatting, lint, strict typecheck, unit/component, real-service
integration, contract/authorization/concurrency, browser/accessibility/responsive/
localization, privacy/security, build, migration and recovery checks. Full definition
of done also includes static architecture/unused/complexity checks, coverage,
performance, documentation and independent review. Missing mandatory evidence is
incomplete, not a pass. Current tooling gaps must be recorded and resolved, not
hidden by a narrower passing command.

Changed-code coverage minimum: 80% lines/70% branches; global critical authorization
and state-machine branches require 100%. No fabricated metrics or performance bars.
Approved launch languages: English/Telugu/Hindi; supported browser automation:
Chromium/Firefox/WebKit; widths: 320/360/390/768/1024/1280/1440/1920.
Manual screen-reader, real-device, provider/legal and production evidence stays
explicitly pending until actually performed by an authorized party.

After three failed attempts: bounded root-cause investigation; do not repeat the
same approach indefinitely. Two exhausted justified approaches make the affected
item blocked; continue unrelated safe work. Checkpoint every ten integrations or
24 hours with current matrices and actionable owner instructions, not false 100%.
