# CareerScope v12: Authoritative Launch Specification

Company: Viswatra
Product: CareerScope
Domain: careerscope.tech
Status: Approved scope for implementation. Nothing in this document is confirmed as built. Build status is tracked against the repository, not in this document.

This version supersedes v11 and v11.1. It applies the final independent review of v11, the v11.1 hardening amendment, and the owner's approvals.

---

## 1. Approved decisions

| # | Decision | Detail |
|---|---|---|
| D1 | Launch sign-in is email OTP through Resend | Email OTP through Resend is the sole sign-in method; no other sign-in method is planned. A test-only shortcut exists only in development and staging, and is blocked in production by configuration |
| D2 | Recruiter job posting is in launch | Employer verification and authorization are required before posting |
| D3 | Referrals stay off at launch | Activated only where verified referrers exist. Until then, the candidate sees an informative empty state, not a broken feature |
| D4 | Candidate-to-recruiter email launches with small caps | Tested abuse controls required. Caps raised only after measured delivery and abuse data |
| D5 | Manual official-link application is the baseline | The browser helper is an optional enhancement |
| D6 | Email is the mandatory verification tick | College, profile-link, and other ticks are optional, based on segment |
| D7 | Date of birth is an age-screening measure | It is not proof of adulthood. Only the screening result is retained |
| D8 | Interview organizer is launch-core | Part of the launch definition, not optional |
| D9 | Candidate outreach is sent by CareerScope | Candidate's name is in the message and reply-to. Sending domain is careerscope.tech |
| D10 | Public job pages publish full text only where source rights permit | Otherwise they link out with attribution |
| D11 | **SUPERSEDED 20 October 2026 by D11-R (Amendment A1).** Original decision: second email provider for sign-in fallback | Original text retained for traceability: configured before launch behind a provider switch flag, with own SPF, DKIM, and DMARC setup. Not current policy |
| D11-R | Resend-only production sign-in OTP | No SMTP and no automatic second-provider fallback. Missing, invalid, outage, timeout and recovery behaviour defined in Amendment A1. Status: PENDING_OWNER_APPROVAL for formal amendment (owner decision recorded 20 October 2026) |
| D12 | Recovery point for application records: 1 hour | Continuous WAL archiving to an off-host store, confirmed by restore drill. Target: 1 hour. The 24-hour fallback is not a default; it applies only under a separately approved, explicitly disclosed release exception, and candidates are told to re-check records after a restore. Recovery objectives are not claimed as met without restore-drill evidence |
| D13 | Listing thresholds set from measurement | Not fixed in this document. Measured on approved sources before public discovery opens |
| D14 | Launch source set | Recruiter postings, ATS public boards (Greenhouse, Lever, Ashby, Workable), and candidate-supplied links. Other sources added only after terms and coverage checks. Naukri and Indeed stay gated |

---

## 2. Launch-core acceptance model

| Capability | Launch status | Release condition |
|---|---|---|
| Production sign-in (email OTP) | Required | Real OTP flow works through Resend only (D11-R); no SMTP or second-provider routing; test login blocked in production by configuration |
| Candidate onboarding and profile | Required | Complete, secure, accessible |
| Resume management | Required | Validated uploads, encryption, user-controlled deletion |
| Verified job discovery | Required | Sources enabled only with recorded permitted uses and measured coverage |
| Explainable matching | Required | Eligibility shown as advice only; evidence and scoring version recorded |
| Manual official-link application | Required | Works without the browser helper or AI |
| Application evidence and tracking | Required | Candidate claims stored separately from employer acknowledgements |
| Interview workflow organizer | Required | Interviews, stages, contacts, and reminders work |
| Job reporting and feedback | Required | Moderation and investigation workflow works end to end |
| Notifications | Required | In-app and email operational; web push opt-in |
| Account security and privacy | Required | Isolation, data rights, retention, abuse protection tested |
| Recruiter job posting | Required | Employer verification and authorization tested |
| Candidate-to-recruiter email | Conditional | Verified recipients, deliverability checks, abuse controls, small caps |
| Email verification tick | Required | Mandatory for all accounts |
| Other verification ticks | Conditional | Only checks actually completed are shown; no misleading claims |
| Browser-assisted form fill | Optional enhancement | Extension security tests and supported-domain tests pass |
| Referrals | Off at launch | Activated per region or group when verified referrers exist and acceptance tests pass |
| AI resume rewriting | Conditional activation | Factuality, privacy, disclosure, and quota gates pass |
| WhatsApp | Gated | Meta business verification and approved templates |
| eKYC identity tick | Post-launch, gated | Provider contract and consent flow |
| Talent pools, AI mock interviews, XP, career planner | Post-launch | Feature-specific acceptance criteria |

---

## 3. Changes from v11

| # | Change | Source |
|---|---|---|
| 1 | Sign-in outage defined: existing sessions continue, new sign-ins show "temporarily unavailable" | Review B01, v11.1 |
| 2 | Second email provider added for OTP fallback | D11 |
| 3 | Recovery point target set to 1 hour with WAL archiving; 24-hour fallback documented | D12, H3 |
| 4 | Job-source set limited at launch; licensed APIs and career pages added after checks | Review B02, D14 |
| 5 | Listing thresholds deferred to measurement, as a launch gate | D13 |
| 6 | Hardening items H1 to H12 added as acceptance criteria | Review P0 and P1 |
| 7 | Session security: refresh-token rotation, reuse detection, device revocation, cookie policy | H2 |
| 8 | Authentication recovery procedures defined | H1 |
| 9 | Email delivery copy: "delivered" means accepted by mail server, not read | H6 |
| 10 | Photo copy: no claims that browsers prevent downloads; access controls and view logs enforced | H7 |
| 11 | Prompt-injection tests for untrusted text sent to AI | H8 |
| 12 | Deletion timelines per data class; processor list maintained | H9 |
| 13 | WCAG 2.2 AA as explicit target | H10 |
| 14 | Verification evidence schemas, validity, recheck, revocation | H11 |
| 15 | Platform failure tests for Redis, PostgreSQL, email, and workers | H12 |
| 16 | Go/no-go checklist with evidence, owner, result, severity | Review P0 |
| 17 | Alerts delivered through a path independent of the primary VPS | Review section 4 |
| 18 | Outreach, recruiter posting, and referrals unchanged from v11 | D2, D3, D4 |

---

## 4. Module specifications (launch core)

### 4.1 Authentication

- Email OTP via Resend only (D11-R; the second-provider fallback in D11 is SUPERSEDED, see Amendment A1). The email transport is enabled or disabled by flag; there is no provider routing or failover
- Code is single-use, short-lived, and rate-limited by email and by IP
- Attempt caps with lockout backoff
- Sessions: short-lived access tokens; refresh tokens rotate on every use; reuse of a rotated token revokes the token family and signs the device out
- Device list with per-device revocation; sign-out everywhere
- Revocation on device change or sign-out
- Login alerts for new devices; step-up OTP for unusual patterns
- Cookies: HttpOnly, Secure, SameSite
- Outage state: when Resend is unavailable or misconfigured, existing sessions continue. New sign-ins show "Sign-in is temporarily unavailable" with a status link. No claim that access will be restored. Requests are logged with request ID and rejected, never silently dropped. No other sign-in path exists at launch
- Test-only shortcut: development and staging only; not a user sign-in method. Production is disabled by configuration (startup check) and the disabled state is verified by a deployment test (go/no-go 1). No production bypass exists
- Admin and super admin: step-up by a fresh Resend email OTP challenge bound to the session and to each privileged action (CR-03 R-13, proposed). It adds no login method. Whether it satisfies the earlier "two-factor" requirement is an owner decision (OPEN)

Authentication recovery:

- Lost email access: recovery through verified identity signals already on the account, with cooldown and login alert. Email alone is never the only recovery factor
- Inaccessible mailbox: support procedure with logged reason and time-limited verification
- Email change: OTP to the current address and OTP to the new address. The old address receives a notice

### 4.2 Onboarding and profile

- Segment selection: student, fresher, experienced
- Date of birth collected for the age screen; only the pass or fail result is kept
- Contact, location, education, graduation year, experience, projects, skills, links
- Preferences: role, job type, locations, salary range (private by default)
- Candidate availability (optional): immediate, notice period, preferred contact, recruiter visibility
- Profile completeness meter
- Public profile link, off by default

### 4.3 Resume

- PDF and DOCX upload; file type, size, and page limits enforced
- Parsing runs in a sandboxed worker; parsed text treated as untrusted
- Encrypted at rest; user-controlled replace and delete
- Multiple versions by target role, with version lineage
- Candidate reviews parsed output before saving
- ATS-friendly templates; ATS score labeled as an estimate
- Share links that expire and can be revoked

### 4.4 Photo (optional)

- Never required to sign up or apply
- Metadata stripped; resized; re-encoded; moderated before display
- Private by default; candidate chooses per application
- Hidden in recruiter first-pass views; shown only for applications the candidate sent
- Recruiters cannot download or forward; views logged
- Deterrence notice to recruiters against unauthorized reuse. No claim that the product can prevent downloads
- Never used in matching, scoring, or AI
- No face matching or face analysis

### 4.5 Verification ticks

- Email verified: mandatory
- Phone verified: post-launch
- College verified: optional, for students and recent graduates
- Profile linked: optional, ownership-checked (GitHub, portfolio domain)
- Skill verified: post-launch
- Identity verified: post-launch, gated on eKYC
- Employer confirmed: post-launch
- Each tick has an evidence schema, validity period, recheck rule, and revocation procedure
- Each tick shows its check and date; expires or rechecks; revocable with notice and reason; appeal route
- A tick is shown only when its check has completed
- Ticks cannot be bought, sold, or transferred
- Recruiters see tier and date only

### 4.6 Lead sources and discovery

Launch source set (D14):

1. Recruiter postings (employer-authorized)
2. ATS public boards and APIs: Greenhouse, Lever, Ashby, Workable
3. Candidate-supplied links and forwarded emails

Added only after terms and coverage checks:
4. Licensed job-data APIs
5. Company career pages with JobPosting markup, within permissions
6. Licensed web search for career pages, verified before display
7. Remote job APIs

Not in launch: Naukri and Indeed ingestion (gated on terms clearance or partner access). LinkedIn: excluded.

Each enabled source has a recorded permission profile covering collection, storage, transformation, AI processing, public display, and redistribution.

Discovery rules:

- Verified career page resolution before display
- Deduplication: canonical URL, employer identifier, ATS requisition ID, then cross-source confidence
- Expiry: per-source rules; default is "possibly closed" after three missed runs, closed after a further set period
- Daily sync, 2 to 3 runs, staggered by source; idempotent; locked per source
- Source health and automated suspension on terms change or repeated errors

Coverage gate (D13): before public discovery opens for a city or role family, the owner sets thresholds from measured listing counts and measured stale and duplicate rates on a golden set. Discovery opens only for the cities and roles that meet the thresholds. Elsewhere, the product shows recruiter postings and candidate-supplied links only, and does not promise broad discovery.

### 4.7 Matching and eligibility

- Hard eligibility (degree, work authorization, location, mandatory qualifications): shown as advice on the job. Never hides a job
- Soft relevance (skills, projects, experience, preferences)
- Missing data is shown, not treated as a mismatch
- Score records its scoring version
- Explanation: matched skills, missing skills, location fit, experience fit
- Transparency page for what each measure is and is not
- Job feedback loop: candidate marks irrelevant, duplicate, incorrect, unavailable, or suspicious
- Search quality evaluation against a golden dataset

### 4.8 Applying

Baseline (always available):

1. Candidate opens the official page from CareerScope
2. Candidate copies or uses prepared details from CareerScope
3. Candidate applies on the employer's site
4. Candidate records "applied" with the method and time

Optional enhancement (browser helper):

- Chrome extension running in the candidate's own browser
- Per-site permission, allowlisted employer domains, field preview
- Fills only fields the profile answers; sensitive fields left to the candidate
- Never submits, never captures credentials, never accepts terms
- Supported domains covered by end-to-end tests; unsupported domains fall back to manual

Rules for both paths:

- Auto-apply is off. The candidate reviews and submits
- The system never stores employer-site credentials
- Every apply action is logged with its method

### 4.9 Tracking and application evidence

- Saved jobs with folders or tags
- Manual tracking: applied, interview, offer, rejected, withdrawn
- Each application records evidence: method, timestamp, confirmation, source, confidence
- Candidate claim is stored separately from any employer or ATS acknowledgement. The product never shows an acknowledgement it did not receive
- Notes, documents, contacts, timeline
- Follow-up reminders; duplicate-application warning; quality check before sending
- Export to CSV or PDF
- Application journey recovery: interrupted preparation restored without repeating work

### 4.10 Interview workflow organizer (launch-core)

- Interview rounds with dates, times, format, and contacts
- Preparation checklist per round
- Reminders before each round
- Status updates per round
- Notes and documents linked to the round
- Independent of AI mock interviews

### 4.11 Candidate-to-recruiter email (conditional, small caps)

- Candidate-initiated, one message at a time; no bulk sends
- Sent by CareerScope from careerscope.tech. The message names the candidate, and reply-to is the candidate's address
- Disclosure in the message that CareerScope sent it on the candidate's behalf
- Recipients only from permitted sources: company-published contact, verified referrer, or opted-in recruiter. No harvesting from sites or portals
- Launch caps: low daily limit per account, per-recipient rate limit, block list
- Attachments scanned; resume sent only when the candidate selects it
- Delivery tracking: sent (accepted by mail server), delivered, bounced, replied. Delivered does not mean read. Replies are shown only when actually received through the integration or confirmed by the candidate
- Abuse reports to human review; repeat abuse suspends sending
- Caps raised only after measured delivery and abuse data

### 4.12 Recruiter posting (launch)

- Recruiter onboarding with manual employer verification
- Postings limited to employer-authorized vacancies
- Auto-sync from the employer's ATS or career page where available
- Free posting; paid visibility later, never higher match rank
- Company page submission as onboarding route
- Receives candidate emails through the outreach channel

### 4.13 Referrals (off at launch)

- Module is built behind a flag and stays off until activation criteria are met
- Activation criteria: verified referrers exist for the target region or group; acceptance tests in section 7 pass; referrer employment verification is rechecked on schedule
- Until activation: candidate sees an informative empty state, and no referral requests are sent
- When active: referrer verifies work email on the company domain; referral links checked; requests made by people only; candidate chooses what to share; duplicate requests blocked; referrers may decline without reason; reporting both ways; withdrawal removes referrer access

### 4.14 Public job pages (rights-gated)

- Full description only where source rights permit public display
- Otherwise a summary with attribution and a link to the official page
- JobPosting markup only for current, complete, rights-cleared postings
- Expired postings removed from markup per Google's requirements
- Canonical links to the official page
- Sitemap generated only from eligible pages

### 4.15 Notifications

- Channels at launch: in-app; email via Resend from careerscope.tech; web push opt-in (PWA)
- WhatsApp: gated on Meta approval, opt-in required
- Security messages always send by email and in-app
- Transactional and marketing kept separate; marketing needs opt-in
- Per-channel and per-type preferences; quiet hours in local time
- Daily cap per user with digest fallback
- One event, one message per channel; outbox with retries, backoff, and dead-letter store
- Deliverability center: bounces, complaints, suppressions, and delivery failures
- Templates in English, Telugu, and Hindi
- No resume, salary, or contact details in notification text

### 4.16 Feedback, reporting, and moderation

- Job feedback: irrelevant, duplicate, incorrect, unavailable, suspicious
- Candidate and recruiter report and block
- Content moderation queue for profiles, job posts, and messages
- Investigation workflow with reason codes and outcomes
- Spam limits on messages and referrals

### 4.17 Admin and super admin

Admin:

- CRUD for users, jobs, sources, company pages, content
- Career page verification queue; source management and health
- Email abuse queue; moderation queue; report queue
- Security dashboard; API and server health; logs with search
- Support view of a user account: only with consent or a logged reason, time-limited, reason-coded

Super admin only:

- Billing and plan settings; role assignment; secrets and provider keys
- Destructive operations; dual approval for sensitive operations
- Global kill switch for AI, email, and sync

Both roles: audit log of every action; per-user AI quotas and token usage

### 4.18 Accessibility and language

- English, Telugu, and Hindi interface
- WCAG 2.2 AA is the explicit design and testing target. Any exception is documented with its reason and planned fix
- Keyboard navigation; readable layouts
- Reduced motion option; accessibility preferences saved to profile
- Light mode for slow connections: text-first lists and apply flow

---

## 5. Cost and quota controls

- Per-tier quotas for AI rewrites, explanations, and parsing; free tier has low fixed quotas
- Quotas reserved before the AI call and released on failure
- Provider timeouts and retry limits on every AI and notification call
- Fallback behavior: AI features show a clear "try later" state, never a silent failure
- Circuit breaker: when daily spend crosses a threshold, AI features pause automatically and the super admin is alerted
- Notification volume capped per user and per day, with alerts on unusual spikes
- Sync compute capped per source per day
- Cost dashboard reviewed daily

---

## 6. Operations and failure domains

Single-VPS plan at launch:

- Resource limits per service (web, API, workers, Redis, database) set and load-tested
- Database and workers moved off the web host first if load tests show contention
- Failure domains documented: what fails together, and what keeps working
- Health checks per service; automatic restart with alerting
- Alerts delivered through a path independent of the primary VPS
- Host-level failure is a known single point of failure at launch. Splitting containers on one machine does not remove it

Recovery targets:

- Recovery point objective: 1 hour for user-created application records, using continuous WAL archiving to an off-host store (D12). Exception only: if archiving is not ready by launch, a 24-hour recovery point applies only under a separately approved, explicitly disclosed release exception, with candidates told to re-check records after a restore. The 1-hour target is not met until restore-drill evidence exists
- Recovery time objective: service restored within 4 hours
- Restore drill: performed before launch and monthly after. Drill result recorded in the go/no-go checklist

Backups:

- Hostinger backups verified for frequency, retention, and off-server copies
- Off-host copy required before launch
- Restore tested to a separate environment

Degraded modes (must be tested):

- Resend down or misconfigured: no failover (D11-R). Existing sessions continue
- Resend unavailable: new sign-ins show "Sign-in is temporarily unavailable". Existing sessions continue. Non-OTP notifications are queued and retried; sign-in OTP messages are not queued for later delivery (Amendment A1)
- AI provider down: AI features show "try later"; manual flows keep working
- Source down: stale sources marked "possibly closed" only per the rule in section 4.6; no false closures
- Redis down: caches bypassed; auth routes fail closed
- Database down: maintenance page; no writes accepted without a confirmed commit
- Worker down: jobs remain queued; dead-letter store receives jobs after retry limit

---

## 7. Testing

Test types: smoke (every deploy), sanity (every pull request), regression (nightly and before release), critical path (every deploy), Playwright E2E (pull request and nightly), load (before launch), security (every release), accessibility (pull request), prompt-injection (every release), platform failure (before launch).

Load scenarios: 200 normal users; 1,000 concurrent visitors mostly on public pages; 300 users running matches and AI at once; sync during traffic. Pass: performance targets met; error rate under 1%; no lost or duplicated data.

Acceptance tests that must pass before launch:

- Email OTP sign-in works; test login blocked in production
- Authentication outage: simulated Resend failures keep existing sessions working; new sign-ins show the outage state; the state clears on recovery (test list in Amendment A1)
- Session reuse detection: reused refresh token revokes the token family
- Record-level access: no user can read another user's applications, resumes, interviews, or photos
- Role escalation blocked
- Manual apply path works with the browser helper disabled
- Application evidence: candidate claim and employer acknowledgement stored separately
- Verification ticks: each shown only when its check completed; expiry and revocation tested
- Photo hidden in recruiter first-pass views
- Candidate outreach: disclosure present, reply-to correct, caps enforced
- Delivered-but-unread message shows no read or reply status
- Public job page: full text only for rights-cleared sources
- Notification delivery in English, Telugu, and Hindi
- Account deletion removes data from database, storage, caches, and third parties per policy, within published timelines
- Kill switch stops AI, email, and sync
- Referrals show empty state while off
- Platform failure tests pass individually for Redis, PostgreSQL, email provider, and workers, including recovery and data consistency
- Restore drill meets the 1-hour recovery point and 4-hour recovery time targets, or, only under a separately approved release exception, the 24-hour fallback is in effect and disclosed

When referrals are activated, the referral acceptance tests in v10 section 16 must also pass.

---

## 8. Monitoring, analytics, and logs

- Uptime, errors (Sentry or equivalent), structured JSON logs, traces, metrics
- Every log line: request ID, hashed user ID, route, duration; redaction for resumes, emails, phone numbers, tokens
- Request ID shown to users in errors
- Debug by request ID, hashed user, or feature
- Dashboards: operations, cost, product funnel, business
- Alerts: downtime, error spikes, sync failures, AI spend, bounce rate, failed jobs, sign-in outage
- Alert delivery independent of the primary VPS
- Analytics: no personal data; consent for non-essential tracking
- Retention: 30 days detailed logs, 90 days summaries, audit logs as required

---

## 9. Data safety

- Portal data stored: link, title, company only
- Listing bodies from portals not stored, cached, or logged
- No user or portal content used for AI training without explicit opt-in
- AI provider no-training settings verified and recorded
- Minimal data sent to AI; untrusted text (job descriptions, resumes, messages) tested for prompt injection
- Deletion timelines per data class: primary database, file storage, caches, search, logs, third-party processors, and backups. Legal retention exceptions listed
- Staff see masked personal data; unmasking logged with reason

---

## 10. Legal and trust

- Privacy policy and terms naming Viswatra
- Grievance officer (DPDP Act)
- DPDP implementation matrix: legal basis, notices, consent withdrawal, grievance, retention, processors, breach procedure
- Commencement dates confirmed against the official MeitY notification before any date is stated publicly
- Cross-border transfers to AI and model providers disclosed
- AI disclosure wherever AI output appears, with a contest path
- Outreach email rules published, with abuse reporting
- Age screen disclosure; under-18 accounts not created
- Recruiter terms: posting, outreach, data use
- Photo and verification consent flows reviewed by counsel
- Verification evidence and recheck rules reviewed by counsel
- Recruiter pricing and refund terms published before any paid plan

---

## 11. Post-launch and gated

Post-launch: mobile push and mobile apps; SMS; skill verification; employer-confirmed tick; identity verification (gated on eKYC); recruiter search, shortlists, pipeline, analytics; talent pools; career transition planner; offer decision workspace; portfolio showcase; job market experimentation; in-app code execution; AI mock interviews; XP, quests, and streaks; courses beyond external links; alumni mentors; email auto-tracking; voice input.

Gated on external approval: WhatsApp (Meta); Indeed and Naukri ingestion (partner or terms); eKYC contract; licensed job-data providers.

Never: LinkedIn ingestion or form fill; automated submission; stored employer credentials; scraping recruiter contacts from sites or portals; pay-to-rank.

---

## 12. External dependencies

| Dependency | Needed for | Owner | Status |
|---|---|---|---|
| careerscope.tech SPF, DKIM, DMARC | Email and outreach | Owner | To do (status not verified in this review; see Amendment A1 register) |
| Resend account and domain verification | Email OTP and notifications | Owner | Owner reports setup completed (CONFIRMED_OWNER_CONFIGURATION); verification evidence not supplied in this review; live OTP not verified |
| ~~Second email provider account, domain verification, SPF, DKIM, DMARC~~ | ~~Sign-in fallback~~ | Owner | SUPERSEDED by D11-R. No longer a launch dependency |
| Meta business verification | WhatsApp | Owner | To do |
| Licensed job-data provider terms and coverage check | Discovery (post-check) | Owner | To do |
| Indeed publisher approval | Indeed feed | Owner | Gated |
| Naukri partner access | Naukri feed | Owner | Gated |
| Legal review | DPDP, outreach, verification, recruiter terms, cross-border | Counsel | To do |
| Hostinger backup verification | Data safety | Owner | To do |
| Off-host WAL archive store | 1-hour recovery point | Owner | To do |
| Candidate and recruiter interviews | Validation | Owner | To do |

---

## 13. Acceptance gates before launch

- Sources: permission profile recorded for each enabled source; coverage thresholds set from measured data; stale and duplicate rates measured on a golden set
- Candidate loop: first match, first application, and completion measured with test accounts
- Evidence: apply method and confirmations stored correctly
- Verification: ticks, expiry, and revocation tested
- AI: factuality, prompt-injection, quota, and fallback tests pass
- Data protection: isolation, deletion, restore drill, consent withdrawal, incident procedure
- Sign-in: Resend-only behaviour tested (missing key, invalid key, outage, timeout, retry, recovery, no SMTP or secondary routing); outage state tested
- Session security: rotation and reuse detection tested
- Outreach: caps, disclosure, reply-to, abuse controls tested
- Recruiters: employer verification and posting authorization tested
- Operations: failure domain plan, recovery targets, degraded modes, and platform failure tests pass
- Launch controls: test login blocked in production; kill switch working; feature flags verified in production; alerts reach the owner independently of the primary VPS

---

## 14. Scope and next step

- The approved launch core is smaller than v9's full list
- Referrals, AI resume rewriting, and the browser helper are not blocking launch
- No reliable day count can be given without a code audit against the repository
- Next step: attach the repository. The gap matrix will mark each section as specified, implemented, tested, blocked, or launch-ready

---

## 15. Go/no-go checklist

Each row needs evidence, an owner, a result (pass, fail, or waived with reason), and a blocking severity. Launch requires zero open critical items, and every high item either passed or explicitly waived by the owner in writing.

| # | Item | Source | Evidence | Owner | Result | Severity |
|---|---|---|---|---|---|---|
| 1 | Email OTP sign-in works; test login blocked in production | D1, 4.1 | | | | Critical |
| 2 | ~~Second email provider failover tested~~ **Superseded.** Replaced by: Resend-only sign-in failure behaviour tested (missing and invalid key, outage, timeout, bounded retry, recovery; no SMTP or secondary-provider routing) | D11 superseded by D11-R; A1 | | | | Critical |
| 3 | Sign-in outage state tested with Resend unavailable (existing sessions continue; new sign-ins show outage state) | 4.1, section 6, A1 | | | | Critical |
| 4 | Launch source set permission profiles recorded | D14, 4.6 | | | | Critical |
| 5 | Listing coverage per target city and role family meets owner threshold | D13 | | | | Critical |
| 6 | Stale and duplicate rates measured on golden set | D13 | | | | High |
| 7 | Authentication recovery procedures tested | 4.1 | | | | High |
| 8 | Session rotation and reuse detection tested | 4.1 | | | | High |
| 9 | 1-hour recovery point with WAL archiving; restore drill meets target | D12 | | | | Critical |
| 10 | Off-host backup copy in place | section 6 | | | | Critical |
| 11 | Record-level access isolation tests pass | section 7 | | | | Critical |
| 12 | Account deletion tests pass across all stores | section 9 | | | | High |
| 13 | Email delivery copy reviewed | 4.11 | | | | Medium |
| 14 | Photo copy reviewed; access controls tested | 4.4 | | | | High |
| 15 | Prompt-injection suite passes | section 9 | | | | High |
| 16 | WCAG 2.2 AA tests pass on core flows | 4.18 | | | | High |
| 17 | Verification evidence, expiry, and revocation tests pass | 4.5 | | | | High |
| 18 | Platform failure tests (Redis, PostgreSQL, email, workers) pass | section 7 | | | | High |
| 19 | Single-VPS failure domains documented; resource limits load-tested | section 6 | | | | High |
| 20 | Alerts deliver through a path independent of the primary VPS | section 6, 8 | | | | Critical |
| 21 | Kill switch stops AI, email, and sync in production | section 7 | | | | Critical |
| 22 | Outreach caps, disclosure, reply-to, and abuse controls tested | D4, 4.11 | | | | High |
| 23 | DPDP commencement dates confirmed against MeitY notification | section 10 | | | | High |
| 24 | Legal review complete for DPDP, outreach, verification, recruiter terms | section 12 | | | | High |
| 25 | Owner sign-off on accepted risks, including the single-VPS host failure risk | section 6 | | | | Critical |

---

## Appendix: Positioning

> CareerScope: fewer applications, better matches, and jobs you can trust, from the company's own page.

---

## Amendment A1 (20 October 2026): Resend-only sign-in, consent, webhooks and test isolation

**Amendment status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL.** The owner's decisions of 20 October 2026 are recorded here as owner-supplied decisions (CONFIRMED_OWNER_CONFIGURATION). Changes to D1 to D14 are owner-only (Engineering Standards section 11), so this amendment is not applied as an activated change until the owner records approval in the repository. Historical text of D11 and the earlier launch rows is kept and marked superseded. Only D11 changes; D1 to D10 and D12 to D14 are unchanged.

### A1.1 Supersession of D11

- **Superseded:** D11 "second email provider for sign-in fallback" (section 1, section 4.1 fallback, section 6 failover, section 12 second-provider dependency, section 13 outage gate, go/no-go items 2 and 3, Goal Stage B and blocker list).
- **Current policy (D11-R):** production sign-in OTP is delivered by Resend only. No SMTP route and no automatic second-provider routing exist for sign-in OTP. A missing or invalid Resend configuration produces a controlled sign-in unavailability state. Existing sessions are not invalidated by a provider outage.
- Other email workflows (notifications, outreach) keep their own provider setting, which is audited separately before any change. SMTP is not removed globally.

### A1.2 Sign-in OTP standard

- Six-digit code from a cryptographically secure random source; five-minute validity; single use; HMAC digest storage with a secret separate from the Resend API key; no plaintext OTP stored or logged.
- Sixty-second resend cooldown; a new code replaces the previous one; duplicate sends prevented under concurrency and retry.
- Five incorrect attempts per verification window, then lockout with backoff (section 4.1). Rate limits per email and per IP, shared across instances through Redis.
- Atomic verification and consumption; constant-time comparison; expired, used and replaced codes rejected; one session per challenge; secure cookies; CSRF protection on cookie-authenticated mutations.
- Account enumeration resistance: existing, new and disabled accounts get the same status, body, structure, cooldown and rate-limit responses. Provider failures return the same generic unavailable response.
- Recovery and email-change rules in section 4.1 are unchanged.

### A1.3 Required Resend failure tests (replace the fallback-provider tests)

1. Missing Resend key: sign-in unavailable; startup or runtime check fails closed; no fallback route used.
2. Invalid Resend key: controlled failure; key never shown in logs or responses.
3. Provider outage: new sign-ins show "Sign-in is temporarily unavailable"; existing sessions keep working.
4. Provider timeout: bounded timeout; no second send; user sees the same unavailable state.
5. Provider retry behaviour: bounded retries with an idempotency key per challenge; no duplicate valid codes.
6. Controlled sign-in unavailability: request logged with request ID and rejected, never silently dropped.
7. Existing-session continuity during the outage.
8. Recovery after Resend service restoration: the state clears and sign-in succeeds with a new code.
9. No silent SMTP or secondary-provider routing (negative test on the send path).

### A1.4 OTP and queued messages

- Sign-in OTP messages are not queued for later delivery, because a delayed code is misleading and may already be expired. They fail fast and show the unavailable state.
- Non-OTP notifications keep the outbox, retry and dead-letter behaviour in sections 4.15 and 6.

### A1.5 Configuration names (values never documented)

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Backend-only Resend credential. Separate CareerScope key |
| `RESEND_FROM_EMAIL` | Sender `CareerScope <noreply@mail.careerscope.tech>` |
| `OTP_HMAC_SECRET` (or project-specific equivalent) | OTP digest key, separate from the API key |
| `CAREERSCOPE_LIVE_EMAIL_TEST` (proposed name) | Live-send opt-in for supervised tests only. Owner to confirm the name |

Test login stays blocked in production by configuration (D1). Startup fails if test login is enabled in production, and the disabled state is verified by a deployment test in every production-like environment. No production bypass exists.

### A1.6 Signup acceptance, privacy notice and marketing consent

- Where the signup flow requires it, the candidate explicitly accepts the current Terms before the account is created. Persist the Terms version, the UTC acceptance timestamp, the user identity, and an audit event.
- A clearly accessible link to the current Privacy Policy is shown. Record the notice version where the approved policy requires it. Necessary service processing is not presented as optional consent.
- Marketing consent is a separate optional checkbox, unchecked by default, not required to register, not bundled with Terms, recorded independently when selected, and withdrawable (consistent with section 4.15: marketing needs opt-in).
- The account is created only after OTP verification succeeds, Terms are accepted, and the operation commits durably. Enforced server-side.
- Required tests: missing Terms acceptance; correct version recording; UTC timestamps; privacy notice version; marketing default unchecked; withdrawal; direct API bypass attempts; duplicate and concurrent submissions; expired codes; incomplete transactions; migration and existing-account behaviour.
- Legal text is an unpublished draft until counsel approval (section 10). No legal guarantee is asserted.

### A1.7 Inbound events (Resend delivery webhooks)

Section 4.15 requires a deliverability centre for bounces and complaints. If Resend webhooks are implemented, the handler must verify the signature, check timestamp freshness and replay, validate the schema, apply idempotency, commit suppression state before returning 2xx, and return a retryable error if durable acceptance fails. A handler that does not yet exist is recorded as NOT_APPLICABLE_YET, not as implemented.

### A1.8 Automated test isolation

- Automated tests use a recording email transport. They never contact Resend or real recipients.
- Live tests need the owner-supervised opt-in, an owner-approved recipient, a per-run cap and a live-test marker in the evidence. Generated `example.com` addresses and arbitrary contacts are never sent live mail.
- Mock-based tests are not evidence of inbox delivery.

### A1.9 Domain and infrastructure register (non-secret)

| Item | Status |
|---|---|
| Product domain | `careerscope.tech` (CONFIRMED_OWNER_CONFIGURATION) |
| Transactional email provider | Resend (owner reports setup completed; CONFIRMED_OWNER_CONFIGURATION) |
| Separate CareerScope API key | Created; owner reports the existing `.env` was updated. The backend's access to the credential is NOT verified here |
| Sender | `CareerScope <noreply@mail.careerscope.tech>` |
| Domain verification and DNS records in Resend | UNKNOWN in this review. Evidence not supplied. Owner confirmation required |
| Domain registrar | UNKNOWN / OWNER CONFIRMATION REQUIRED |
| Authoritative DNS provider | UNKNOWN / OWNER CONFIRMATION REQUIRED |
| Mailbox host | UNKNOWN / OWNER CONFIRMATION REQUIRED |
| Live OTP inbox delivery | NOT VERIFIED (BLOCKED until the supervised live test) |

CareerScope is hosted on the single Hostinger VPS (owner decision, 20 October 2026). Its registrar and DNS provider remain owner-confirmed. Existing trusted DNS records must be inspected before any change, and any SPF record must be merged rather than duplicated.

### A1.10 Unchanged safeguards

Next.js, Fastify, PostgreSQL, Redis, BullMQ; existing user, organization and session records; existing job-sourcing and permissions policies; resume privacy and encryption; activation and launch restrictions; Redis failure keeps authentication failing closed; D1 test-login restriction; D12 recovery-point conflict (go/no-go item 9 and the 24-hour fallback) remains an owner decision and is not changed here.

### A1.11 Added launch criterion (proposed)

Go/no-go item 26 (proposed): **actual live OTP verification** through the production Resend configuration, executed in an owner-supervised test, with evidence of inbox receipt and a successful sign-in. A mock or staging result does not satisfy this item. Until approved, the Goal must treat it as READY_FOR_OWNER.

### A1.12 Status statement

Integration status is not complete merely because the `.env` has been updated. No requirement in this amendment is marked implemented or verified by this document.

### A1.13 Scope lock (20 October 2026)

Resend email OTP is the sole sign-in method for CareerScope. Phone OTP is removed from the post-launch list and from D1. Test-only shortcuts remain a development and staging tool, refused in production by configuration. Admin step-up uses Resend email OTP; any stronger second factor is an owner decision (OPEN).

---

## Amendment A2 (20 October 2026): OpenRouter AI gateway for approved AI features

**Amendment status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL.** OpenRouter is the owner-selected default model gateway for CareerScope's approved AI features (CR-04 proposed in the global Completion Program). This amendment adds no AI feature. It applies only to features already in v12 (AI resume rewriting is conditional, section 2; AI mock interviews, career planner and similar are post-launch, section 11).

### A2.1 Provider roles

- OpenRouter: AI model inference for approved features only. This is the approved target architecture, not evidence of live integration.
- Resend: sign-in email OTP only (A1). Not used for AI.
- Application backend: identity, sessions, authorization, job sourcing, eligibility rules, and business logic.

### A2.2 Non-negotiable CareerScope constraints

- Job discovery, eligibility rules, source verification, and evidence-based matching stay deterministic. AI may explain or assist; it does not decide eligibility or source permission.
- AI must not invent vacancies, claim that an application was submitted, fabricate employer confirmations, or bypass source permissions (section 4.6, 4.8, 4.9).
- AI remains optional or gated where v12 says so (for example, conditional activation of AI resume rewriting requires factuality, privacy, disclosure, and quota gates to pass).
- Untrusted text (job descriptions, resumes, messages) is treated as data; prompt-injection tests are required (section 9).

### A2.3 Gateway requirements

- One server-side gateway module per product. `OPENROUTER_API_KEY` is backend-only and separate from the Resend key and the OTP secret. No key in the web client, browser storage, logs, or CI artifacts.
- Model identifiers come from an explicit allowlist. Routing considers capability, latency, reliability, privacy, and cost, within policy.
- Controlled fallback between approved models only where the data-handling terms permit. Fallback never bypasses quotas or spend ceilings.
- Per-user and per-tenant AI quotas (section 5); maximum input and output token budgets; request concurrency limits; timeouts and cancellation; bounded retries; circuit breaker and daily spend threshold (section 5).
- Streaming where appropriate, with cancellation and usage accounting. Usage records include tokens, estimated provider cost, error category, and latency. Prompt content is not logged.
- Fail safely: "try later" state when OpenRouter is unavailable, rate-limited, or the account budget is exhausted (section 5). Manual flows keep working (section 6).

### A2.4 Privacy and data handling

- Send only the minimum data a feature needs (section 9). No private contact details unless the feature requires them.
- No training on user or portal content without explicit opt-in (section 9). Review and record OpenRouter routing, privacy terms, and retention settings before any production user data is sent. Document the third-party processing in the processor list and the cross-border disclosure (section 10).

### A2.5 Testing

Automated tests use mocked OpenRouter responses by default. A mocked request does not prove live inference. The required AI tests are: server-side key protection; allowlist enforcement; authorization and tenant isolation; token and spend limits; concurrency limits; provider errors; timeouts and retries; streaming cancellation; fallback rules; usage accounting; prompt-injection defense; sensitive-data redaction; malformed responses; outage recovery; and a guard against accidental real calls in CI. Real-provider tests need owner authorization, a limited budget, and non-production test data.

### A2.6 Status (no claim of implementation)

| Stage | CareerScope status |
|---|---|
| Provider selected (OpenRouter) | Selected for approved AI features (owner decision; CONFIRMED_OWNER_CONFIGURATION) |
| Integration implemented | NOT VERIFIED: no AI integration evidence in the documents reviewed |
| Local tests passed | NOT VERIFIED |
| Live inference verified | NOT VERIFIED |
| Privacy and cost controls verified | NOT VERIFIED |
| Production activation approved | NOT APPROVED |

Model prices, quotas, and availability are not stated here. They must be verified against current provider information before activation.

---

## Amendment A3 (20 October 2026): hosting, isolation, CI/CD and test taxonomy

**Amendment status: PROPOSED_AMENDMENT, PENDING_OWNER_APPROVAL.** Canonical hosting inventory: OraOne Master Product Specification, Amendment 2026-10-20D (sections D.1 to D.13). This amendment does not repeat it. No deployment, migration, or DNS change is authorized here.

### A3.1 Hosting position

- CareerScope's launch plan is a single Hostinger VPS with containers per service (section 6; Engineering Standards section 1). The planned production VPS is 4 vCPU, 16 GB RAM, 200 GB NVMe, with an independent public IPv4 assigned by Hostinger. It is proposed, not purchased.
- The current Hostinger VPS (2 vCPU, 8 GB RAM, KVM 2) is a live deployment of another product, also used for development and testing. **It is not a CareerScope staging server and CareerScope must not be deployed to it as a public production service without owner approval.**
- Single-host failure is an accepted risk (go/no-go item 25) and is not removed by containers on one machine.
- Load tests (section 7: 200 normal users; 1,000 concurrent visitors; 300 users with matching and AI) run only on a disposable environment with the measured host profile. Results decide whether the planned VPS is sufficient. No capacity is assumed.

### A3.2 Isolation on shared infrastructure

- Independent containers for web, API, and workers, each with CPU and memory limits (section 6).
- A CareerScope-only PostgreSQL database and database user. No access to another product's database.
- A CareerScope-only Redis namespace and bounded memory policy. BullMQ queues are namespaced and do not share keys with other products.
- Private Docker networks for PostgreSQL, Redis, and workers. Database and Redis ports are never published publicly.
- Product-specific secrets; separate logs; separate backup and restore; separate deployment and rollback.
- Routing: the reverse proxy routes `careerscope.tech` by hostname. `careerscope.tech` registrar, DNS, and mailbox remain UNKNOWN / OWNER CONFIRMATION REQUIRED. Existing MX, SPF, DKIM, DMARC, and Resend records are never overwritten.

### A3.3 CI/CD and test taxonomy

- Pull request: lint, typecheck, unit tests, relevant integration tests (Engineering Standards section 7).
- Development branch push: broader integration (PostgreSQL and Redis containers), security and dependency scans, Chromium critical E2E, regression subset.
- Nightly: full regression; Chromium, Firefox, and WebKit; extended security; load smoke.
- Release candidate: complete readiness suite (section 13 and A3.4).
- Authorized staging: smoke, sanity, and critical path. Until a separate staging host is provided by the owner, staging validation runs in ephemeral CI.
- Production: owner-only manual promotion. No agent-written workflow deploys production.
- Smoke: site, API health, sign-in entry point, database and Redis connectivity, workers running.
- Sanity: targeted tests for each change.
- Critical path (from section 7): registration and OTP login; candidate onboarding; resume upload and deletion; job discovery; matching and eligibility; saved jobs; application tracking; authorization and privacy.
- Functional, regression, integration, end-to-end, accessibility, responsive, security, prompt-injection, performance, load, platform-failure, and migration suites are defined in the Engineering Standards section 7.1 and apply in full.
- Linting: ESLint and Prettier for TypeScript, React, and Next.js code, as already specified.

### A3.4 Release readiness

The sixteen release-readiness conditions in the OraOne amendment (D.9) apply to CareerScope, in addition to the 25 go/no-go items. Each uses PASS, FAIL, BLOCKED, or NOT_APPLICABLE_WITH_REASON. No gate is marked PASS without evidence.

### A3.5 Owner decisions

1. Renewal or replacement of the shared VPS remains owner-controlled. Owner decision (closure review): keep it operational until migration is verified (OraOne D.12).
2. Approve CareerScope's first public host: the planned production VPS, or another host.
3. Provide a separate staging host or accept ephemeral CI staging. Owner decision (closure review): ephemeral GitHub Actions environments are accepted for current validation and are not production-equivalent staging.
4. Approve the backup location and off-host copy (D12).
5. Approve the DNS cutover for `careerscope.tech`.

### A3.6 Status

Hosting deployment readiness: NOT VERIFIED. Production activation: NOT APPROVED. Integration and CI results: no run evidence in the documents reviewed.

---

## Production Completeness Amendment (20 October 2026, PROPOSED)

Status: PENDING_OWNER_APPROVAL. Audit basis: Viswatra Global Completion Program, "Production Completeness Audit" (CR-06). Only missing items are added.

- **Authorization (added):** PostgreSQL row-level security as defence in depth for candidate records, resumes, applications, interviews, and photos, with dedicated application roles. RLS does not replace record-level checks. Cross-user and role-escalation tests are required.
- **Error pages (added):** branded 404, 403, and 500 pages; maintenance state; no internal detail in responses.
- **Backups (added):** ransomware and accidental-deletion protection for backup copies (immutable or equivalent). The existing 1-hour recovery-point target and 4-hour recovery-time target are unchanged; neither is claimed as met without a verified restore drill.
- **Onboarding (added):** interrupted onboarding (profile, resume, preferences) resumes without losing entered data.
- **Analytics (added):** retention periods and processors for analytics events are listed in the Privacy Policy draft. No personal data in events.
- **Error tracking (added):** the tool is selected under CR-06 R8, with redaction of resume text and contact data.
- **Empty states (added):** empty job, saved-job, and application lists explain the situation and offer one next action. No sample or invented listings.
- **Session (added):** explicit sign-out on the current device and the "sign out everywhere" action, each revoking server-side sessions.

Status: documented. Implemented, tested, and production-verified: NOT ESTABLISHED.

## Launch baseline controls and tests (owner decisions, 20 October 2026)

- Product domain: `careerscope.tech`. Email sending subdomain: `mail.careerscope.tech`. Sender: `CareerScope <noreply@mail.careerscope.tech>`. Sender subdomain verification in its Resend account is pending.
- Email provider: each product domain has its own Resend account, with its own API key, verified sending subdomain and webhook secret. No key or sending domain is shared between products (owner decision, 20 October 2026).
- Hosting: one Hostinger VPS (4 vCPU, 16 GB RAM, 200 GB NVMe, 16 TB bandwidth) runs all Viswatra products in isolated containers, each with its own database and user, Redis namespace, secrets, logs, backups, deployment and rollback. The live OraOne deployment is not a staging host, and this document names no staging host.
- Sign-in: Resend email OTP is the sole sign-in method. No password sign-in or password reset, no TOTP, SSO, passkey, Google OAuth, SMS or phone OTP, no SMTP or secondary-provider fallback, no Supabase, no AWS or Amazon Cognito.
- Test authentication: production never has an enabled test-login bypass; development and staging follow LG1 and the test authentication policy in global standard section 31.
- Approval status: every item in sections B, A and C is PROPOSED under CR-07 and is not approved until the owner records approval in blocker.txt. This document records no approval.
- Testing rule: a control is reported only at the evidence level its test has actually reached (Standard 2.1). A test that has not run is PLANNED, not PASS.

### B. The 19 launch baseline controls

| # | Control | Requirement for this product | Test | Status |
|---|---|---|---|---|
| LB1 | Real login and logout | Sign-in by Resend email OTP creates a server-side session. Logout revokes that session on the server. Sign out everywhere revokes all sessions. Idle and absolute expiry are enforced. | E2E @critical: sign in, reach a protected page, log out; back navigation and direct URLs return to sign-in. Integration: a revoked session token is rejected server-side. Sign-out-everywhere test with two sessions. | PLANNED |
| LB2 | Password reset (superseded: not applicable) | Not applicable under the Resend-only email OTP policy: no password credential exists, so no password reset is built. Account recovery follows each product's OTP recovery rules. The earlier conditional password-reset wording is superseded and kept only for traceability in the owner update of 20 October 2026. | Route scan: no password-set or password-reset endpoint or form exists in the build; recovery uses only the email OTP flow (integration test). | NOT_APPLICABLE_WITH_REASON (Resend-only email OTP; no password credential) |
| LB3 | Email verification | Email is verified by a Resend OTP at sign-up and on every email change. An email change needs an OTP sent to the old address and one sent to the new address. Unverified accounts cannot reach protected areas. | Integration: unverified account blocked from protected routes; expired and reused OTP rejected; email change without both OTPs rejected; OTP sent only through this product's Resend account. | PLANNED |
| LB4 | Loading states | Every asynchronous action (sign-in, saves, uploads, AI or provider calls, bookings, pagination) shows loading feedback, a timeout path with retry, a slow-network state and duplicate-submit protection. | Playwright @critical under a throttled slow-network profile: each async action shows loading, times out to a recoverable message, and a double click sends one request. | PLANNED |
| LB5 | Empty states | Every list or screen with no data explains the situation and offers one next action. No sample, invented or placeholder statistics. | Component and E2E: a fresh account renders each empty state with its action; a text scan finds no invented figures or placeholder text. | PLANNED |
| LB6 | Clear error messages | User-facing errors are plain and actionable, announced to screen readers, and carry a request ID for support. Technical detail goes only to protected diagnostics. | Integration: forced 500, timeout and validation errors return non-technical text, a request ID, and no stack trace or internal path. axe check confirms the error sits in a live region. | PLANNED |
| LB7 | Form validation | One validation schema runs on client and server. Errors are linked to their fields and summarized. Entered input is kept after an error. The server rejects input that bypasses client checks. | Unit: shared schema cases (valid, invalid, empty, too long, special characters, each launch language). E2E: an error keeps the entered input. API: a request that bypasses client checks returns 422 with field errors. | PLANNED |
| LB8 | Rate limiting | Server-side limits per email, account and IP on sign-in, OTP requests and protected actions. Limits are shared across instances; a Redis or limiter outage fails protected surfaces closed. Proxy headers and concurrent requests cannot bypass them. | Integration: N+1 OTP requests in the window return 429 with Retry-After; two app instances share one counter; rotating X-Forwarded-For does not reset the limit; a forced limiter outage fails sign-in closed while health stays reachable. | PLANNED |
| LB9 | Database backups | Encrypted automated backups of each product database, with an off-host copy and an immutable or object-locked copy where the host supports it. A backup counts as operational only after a verified restore. | Scheduled restore drill: the latest backup is restored to a disposable database; row counts and checksums match the source snapshot; result recorded. A failed backup job raises an alert. | PLANNED |
| LB10 | Row level security | PostgreSQL row level security on user-owned records, with dedicated least-privilege application roles. RLS is defence in depth; application authorization checks still apply. | Integration: as the application role, a query for another account's records returns zero rows; direct SQL against another tenant is denied; the authorization matrix passes with RLS disabled, proving application checks work independently. | PLANNED |
| LB11 | API keys off the frontend | Provider and service keys exist only on the server. Client bundles and source maps contain no secrets, and production source maps are not publicly served. | CI: bundle and source-map scan with synthetic key fixtures and provider key patterns; the build fails on any match. A request for a production source map returns 404. | PLANNED |
| LB12 | Mobile layout | Layouts work at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px with no horizontal page scroll. Real Android Chrome and iOS Safari are checked before release. | Playwright responsive project at all eight widths: no horizontal scroll, no clipped controls (visual snapshots). Manual check on real phones recorded per release candidate. | PLANNED |
| LB13 | Custom 404 page | Branded 404, 403, 500 and maintenance pages. No internal path, stack trace or record existence is revealed. | E2E: an unknown route returns a branded 404; a request for another account's record returns the same 404 as a missing record; a forced error returns the branded 500 with no stack. | PLANNED |
| LB14 | Analytics installed | Privacy-safe analytics only where consent allows. No personal data in event properties. Events match the tracking plan. | E2E: consent denied means zero analytics requests; consent granted sends only plan-listed events; fixture scan finds no email, phone or token in event payloads. | PLANNED |
| LB15 | Error tracking | Error tracking with personal data and secrets scrubbed before sending, and every event tagged with the release identifier. The tool is chosen within the budget and privacy rules (CR-06 C6-R8). | Integration: a synthetic exception containing a fake email and token arrives scrubbed and tagged with the release. Tool selection stays READY_FOR_OWNER until the owner approves the cost. | PLANNED |
| LB16 | Privacy policy page | A product-specific privacy policy page that reflects actual behaviour, linked from sign-up and the footer. Stays a draft until owner and qualified legal approval. | E2E: page reachable and linked from sign-up and footer; link check finds no broken link; draft status shown until approval is recorded; listed processors and retention match the data inventory. | PLANNED |
| LB17 | Terms page | A product-specific terms page. Acceptance is recorded with the terms version and UTC time at sign-up. Stays a draft until legal approval. | Integration: sign-up without acceptance is rejected; with acceptance, version and UTC time are stored; a changed version prompts re-acceptance. | PLANNED |
| LB18 | Delete account button | Account deletion, behind a confirmation step, deletes or anonymises personal data across database, object storage, caches and processors within published timelines. Backups are purged on expiry. A personal-data-free audit record is kept. | Integration: after deletion, a search of database, storage and cache fixtures finds no personal data; processor deletion requests are sent; scheduled test purges backups at expiry; the audit entry contains no personal data. | PLANNED |
| LB19 | Onboarding flow | Interrupted onboarding resumes without losing entered or consented data and without creating duplicate accounts. | E2E: interrupt at each step, close the browser, return; state and consents are preserved; repeat sign-up with the same verified email does not create a second account. | PLANNED |

### A. Additional controls added by this update

| # | Control | Requirement for this product | Test | Status |
|---|---|---|---|---|
| LA1 | Security audit log | Append-only record of sign-in, OTP request and failure, account recovery, email change, session revocation, role change and step-up events, with actor, time, request ID and result. No OTP or secret values are stored. | Integration: each event type writes one entry; a fixture scan of audit rows finds no OTP or token; entries cannot be updated or deleted through the application. | PLANNED |
| LA2 | Privileged step-up by Resend OTP | Role changes, account deletion, data export and configuration publication require a fresh Resend email OTP bound to the current session and the specific action. The code is single-use and valid for less time than sign-in. | Integration: the action without a fresh OTP returns 403; an OTP issued for one action does not authorize another; a replayed OTP is rejected; the step-up event is audited. | PLANNED |
| LA3 | Consent and notice records | Consent records store purpose, notice version, UTC time and withdrawal. Marketing consent starts unchecked and is withdrawable at any time. | E2E: marketing box unchecked by default; withdrawal stops sends and is recorded; the consent history kept after deletion holds no personal data. | PLANNED |
| LA4 | Sending-domain authentication | SPF, DKIM and DMARC configured for each product's sending subdomain in that product's own Resend account. Existing mail records are backed up before any change and never overwritten. Verification status is kept separate from delivery status. | DNS check: records present and valid; no conflicting SPF record; a dry-run change diff is reviewed before apply; delivery outcomes from webhooks are stored separately from verification status. | PLANNED |
| LA5 | Webhook reliability | Inbound provider webhooks are verified by signature and timestamp, deduplicated by event ID, and acknowledged only after a durable write. | Integration: a bad signature is rejected; a replayed event is processed once; a simulated database failure returns a non-2xx status so the provider retries. | PLANNED |
| LA6 | Per-domain key isolation | Each product's Resend API key, webhook secret and sending subdomain are separate. Keys are never shared between products. The rotation runbook is owned by the owner. | Config test: each product's environment contains only its own key names; a request signed with product A's key for product B's sender is rejected; a rotation rehearsal is recorded. | PLANNED |
| LA7 | Dependency, container and secret scanning | Dependency audit, SBOM, container image scan and secret scanning run in CI. High or critical findings block promotion. | Negative fixture: a deliberately vulnerable dependency and a fake secret on a temporary branch fail CI; the branch is then removed and the result recorded. | PLANNED |
| LA8 | Security headers and cookies | Content-Security-Policy, HSTS, X-Content-Type-Options, Referrer-Policy and frame protection on every response. Session cookies are Secure, HttpOnly and SameSite. | E2E and API: header and cookie assertions on public, sign-in and protected responses. | PLANNED |
| LA9 | Incident and breach-notification runbook | Runbook for data leak, compromised credential and provider outage. Notification duties under the Digital Personal Data Protection Act 2023 are confirmed by legal review. | Tabletop drill recorded with date, participants and outcome; each runbook checklist item verified. | PLANNED |
| LA10 | Accessibility of launch-critical auth pages | Sign-in, OTP, onboarding, 404 and error pages meet WCAG 2.2 AA. | axe scan of each page in CI; keyboard-only E2E pass; NVDA or VoiceOver check recorded. | PLANNED |
| LA11 | Independent uptime monitoring | Health endpoints /health/live and /health/ready. An external uptime checker and alert channel independent of the shared host. | Drill: stop the product container on a non-production copy; the external alert fires within the agreed window; recovery recorded. | PLANNED |
| LA12 | Restore drill on the shared host | Each product's backup can be restored in isolation on the shared host without touching any other product's data. | Restore to a disposable database; other products' database checksums unchanged before and after. | PLANNED |

### C. Gap items found in review

| # | Control | Requirement for this product | Test | Status |
|---|---|---|---|---|
| LG1 | Test authentication policy | Production builds never contain an enabled test-login bypass. Development may use synthetic test authentication where explicitly allowed. Staging may use controlled synthetic test authentication only where authorized and technically isolated. Production deployment fails closed on any test-login setting. No bypass may access real accounts or customer data. | Automated build and deployment validation: the production bundle and configuration contain no enabled bypass; startup refuses to run in production with test login enabled; a request to the test-login path returns 404 in production; a failed check blocks the release. Staging isolation test: a separate database, and no real account is reachable. | PROPOSED (CR-07) |
| LG2 | Mobile sign-in and session tests | Sign-in, token refresh and logout work for native apps as well as the web, for each product that has or plans a mobile app. Tokens are kept in secure device storage. | Emulator or device tests on iOS and Android: sign-in, refresh after expiry, logout revokes the token, and no token appears in plain app storage. | PROPOSED (CR-07) |
| LG3 | Launch-language coverage of new pages and emails | Sign-in, OTP and reset emails, error pages, 404, privacy and terms pages are provided in each launch language of the product, with native review recorded. | CI catalogue check: no missing or unused keys for launch languages; native review recorded with reviewer, date and string version (global category 21). | PROPOSED (CR-07) |
| LG4 | Required document set | Each product maintains THREAT_MODEL.md, DATA_INVENTORY.md, SECURITY.md, RISK_EXCEPTIONS.md, TEST_MATRIX.md and runbooks for backup restore, incident response, key rotation and uptime alerts. | CI check: each required file exists and its links resolve; TEST_MATRIX.md has one row per control in this section. | PROPOSED (CR-07) |
| LG5 | Recovery objectives (RTO and RPO) | Recovery time and recovery point objectives are measured and approved by the owner. This document sets no values. | Restore drill records measured recovery time and data age; owner approval is recorded. READY_FOR_OWNER until both exist. | OPEN |
| LG6 | Staging host definition | The owner names the staging host, or records that staging runs in ephemeral CI. The live OraOne host is never used as staging. | Environment classification check (CR-05 AC-21) with recorded evidence. | OPEN |
| LG7 | Load evidence before capacity claims | Any capacity or concurrency statement cites a measured load run on a disposable environment. | k6 or equivalent run recorded with environment, load profile and results; no capacity claim is made without it. | PROPOSED (CR-07) |
| LG8 | Backup and recovery requirements (product-specific) | Each product's backup and recovery requirements come from its own approved documents; no other product decision applies. CareerScope only: off-host backups and a successful restore drill before public launch; RPO target one hour; a 24-hour fallback needs a separate, explicitly approved exception. Compliance is demonstrated by restore evidence, not assumed. OraOne OS, FixHub24 and LensMate reference their own approved backup, recovery, hosting and release requirements, and their recovery targets are justified separately. | Restore drill evidence shows the product's own recovery objective is met before launch. CareerScope: off-host copy and restore drill recorded before public launch; the 24-hour fallback is blocked until its exception is approved in blocker.txt. | PROPOSED (CR-07); exception OPEN |

Status values follow the document vocabulary. These controls are specified here. None is implemented, tested or verified by this document.

## Cleanup baseline reference (v1.2 round)

- Requirement matrix: `Viswatra-Cleanup-Requirement-Matrix-v1.2.md` (delivered with this document set).
- CareerScope applicable items: 156. ALREADY_COVERED 97; PARTIALLY_COVERED 28; NEW_REQUIREMENT 31; BLOCKED_BY_EXTERNAL_DECISION 0; NOT_APPLICABLE 1.
- Code status of every item is NOT_ASSESSED. Documentation status does not establish implementation status.
- Every NEW_REQUIREMENT item is PROPOSED and needs owner approval recorded in `blocker.txt`. Legacy authentication removal (CL-A17, CL-A18, CL-D12) waits for a verified migration decision and deletes no identity records, password hashes, columns, migrations or accounts.
