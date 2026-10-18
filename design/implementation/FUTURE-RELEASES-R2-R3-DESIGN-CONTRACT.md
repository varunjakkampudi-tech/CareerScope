# CareerScope Future Candidate Experiences — Release 2/3 Design Contract

## Status
DESIGN APPROVED / IMPLEMENTATION DEFERRED.
These references must NOT expand Release 1 scope. They exist so R1 navigation, domain boundaries and UI architecture do not block later releases.

## Future top-level candidate product areas
- Jobs — discover, understand, prepare and apply
- Interview — practice and assess
- Courses — learn and improve
- Certifications — validate and demonstrate

Supporting areas remain Applications, Saved Jobs, AI Assistant, Career Insights, Resume, Skills and Settings.

## Interview
The separately approved AI Interview board is canonical for interview-practice UX:
- 30-minute interview sessions
- role/category selection
- setup by experience, skills and difficulty
- theory/MCQ
- executable coding questions
- behavioral/speaking responses
- results and evidence-based scoring
- detailed question review
- history and progression
- scoped/opt-in ranking/leaderboard concepts

Deterministic evaluation should be used where possible (MCQ, code tests). AI may evaluate open-ended content against a versioned rubric, but must not infer protected traits, personality, honesty, employability or similar sensitive conclusions.

## Courses
Future flow:
Discover -> filter/category -> course details -> enroll/start -> modules/lessons -> progress -> completion.

Courses may be CareerScope-owned or legitimate external-provider recommendations/integrations. Do not imply CareerScope hosts or owns third-party course content unless true.

## Certifications
Clearly separate:
1. CareerScope-issued completion/assessment credentials for content CareerScope genuinely controls.
2. Third-party professional certifications that CareerScope recommends/prepares users for.

Never generate a CareerScope certificate that impersonates AWS, Google, Microsoft, Meta or another provider. External certification branding and issuance remain with the authorized provider.

Future CareerScope credentials should support verification identifiers/URLs, issue date, credential metadata and revocation/validity where applicable.

## Cross-product intelligence
A future workflow may connect:
job requirements -> match gaps -> course recommendation -> learning progress -> interview practice -> readiness improvement -> return to job/application preparation.

Recommendations must explain why the course/interview is relevant and must not fabricate employer requirements.

## Navigation readiness
R1 architecture should permit later first-class entries for Interview, Courses and Certifications without redesigning the entire shell.
Feature flags/entitlements should allow these areas to remain hidden until actually released.

## Visual authority
This future-release board is authoritative ONLY for Interview/Courses/Certifications concepts.
It does NOT override already-approved canonical Dashboard, Jobs, Applications, Auth, Onboarding, Marketing or Recruiter references.

## Illustrative data
Names, scores, salaries, application outcomes, provider logos, course counts, ratings and certificate content shown in generated boards are illustrative. Never hard-code them as production truth.

## Pixel parity
When these releases are implemented, follow the same reference -> render -> screenshot -> overlay/diff -> correct loop used by the R1 design system.
