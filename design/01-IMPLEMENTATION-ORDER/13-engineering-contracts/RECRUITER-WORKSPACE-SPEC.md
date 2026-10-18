# CareerScope Recruiter Workspace — Approved Visual & Product Specification

## Status
The supplied 4×4 recruiter board is APPROVED as the visual direction and is the canonical recruiter reference.
Engineering must preserve its visual language and reproduce the layouts through a screenshot-diff loop.

## Screens
1. Recruiter Dashboard
2. Post a Job
3. Search Candidates
4. Candidate Profile
5. Matched Candidates for a Job
6. Bulk Invite — Select Candidates
7. Compose Invite — Dynamic Template
8. Review & Send Campaign
9. Talent Pipeline
10. Interview Scheduling
11. Message Templates
12. Analytics & Reports
13. Company Profile
14. Job Postings Management
15. Messages / Inquiries
16. Recruiter Settings

## Recruiter navigation
Dashboard; Search Candidates; Matched Candidates; Talent Pipeline; Job Postings; Messages;
Interview Schedule; Templates; Analytics; Company Profile; Settings; Switch to Candidate.

## Candidate discovery and matching
Recruiters can search/filter candidates against a role using candidate-provided/authorized data:
- resume match percentage
- skills matched and missing
- role/title alignment
- relevant experience
- location/work-mode fit
- expected salary/range fit
- availability/notice period where explicitly provided
- resume/profile evidence supporting the match

The score must be explainable. Never rank on protected/sensitive traits. Unknown data stays unknown.

## Candidate profile
Overview, resume, skills, experience, projects, recruiter notes/activity, match explanation and actions.
Do not fabricate candidate data. Production values come from real authorized candidate profiles.

## Bulk personalized outreach
Canonical flow:
Select candidates -> Compose message -> Review personalized previews -> Send campaign.

Required dynamic variables:
{{candidate_name}}
{{job_title}}
{{company_name}}
{{location}}
{{salary_range}}
{{experience}}
{{interview_date}}
{{recruiter_name}}
{{recruiter_designation}}

Before send:
- validate every variable
- flag missing values
- preview each candidate's resolved message
- detect duplicate recipients
- honor suppression/opt-out/contact permissions
- show recipient count and channel
- require explicit final send action

After send:
- per-recipient delivery state
- failures/retry state
- timestamps
- campaign audit trail
- no silent resend/duplicate send

## Templates
Reusable email/message templates with subject, body, variables, preview and template naming.
Templates never contain real candidate PII as defaults.

## Pipeline
Pipeline stages shown in the design are recruiter-managed workflow state, not automatically inferred truth.
Any employer workflow stages must be explicit recruiter/user actions or verified integration events.

## Interview scheduling
Provide date/time, timezone, duration, interviewer(s), meeting method/link, candidate confirmation state,
reschedule/cancel, and audit history. Never invent availability.

## Visual parity
Use the full board in `canonical/recruiter/` plus individual crops in `page-references/recruiter/`.
For every screen:
1. implement at the reference viewport/aspect
2. screenshot
3. overlay/diff against reference
4. correct macro geometry
5. correct typography
6. correct spacing, radii, borders and shadows
7. correct icons and controls
8. correct states
9. repeat until visually negligible differences remain

Do not change the selected design merely because another component/library default is easier.

## Icons
Follow `assets/icons/PRODUCTION-ICON-MAP.md`.
Use the same consistent outline icon family throughout candidate and recruiter experiences.
Match icon bounding box, stroke, alignment, active state and button container.
Official company/provider marks must use approved assets where legally permitted, not approximations.

## Responsive
The board is the desktop visual source. Preserve information hierarchy on smaller screens.
Do not simply shrink the desktop canvas. Tables may become stacked cards/drawers where necessary.

## Accessibility
Visible focus; keyboard operation; semantic labels; no color-only status; accessible dialogs;
44px-class touch targets where applicable; WCAG AA contrast; reduced-motion support.

## Data/product truth
All names, companies, salaries, percentages, counts and dates shown in the generated board are illustrative.
Do NOT seed or hard-code them as production truth.
The production implementation binds real data while preserving the approved visual geometry.

## Security/privacy
Recruiter access must be authorized and scoped. Candidate resume/profile/contact data should only be exposed
according to candidate consent/product policy. Audit sensitive recruiter actions. Avoid bulk-message abuse,
unauthorized scraping, credential automation and protected-attribute ranking.
