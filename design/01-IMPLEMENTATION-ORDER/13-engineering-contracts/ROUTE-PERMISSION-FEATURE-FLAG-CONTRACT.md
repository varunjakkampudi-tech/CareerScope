# Route, Permission & Feature Flag Contract
Every route must declare: surface (public/candidate/recruiter/admin), authentication requirement,
server-side permission(s), release, feature flag/entitlement where applicable, and unauthorized behavior.

Rules:
- Backend/API authorization is authoritative. Navigation hiding is never authorization.
- Candidate, recruiter and admin privileges are isolated and least-privilege.
- Admin mutations require auditable domain/service operations, not arbitrary database editing.
- Future Interview/Courses/Certifications/Recruiter functionality can be hidden by feature flag until released.
- Disabled/unavailable features return an explicit safe state and do not expose partial privileged data.
- Maintain this matrix in code/tests when routes are added or permissions change.
