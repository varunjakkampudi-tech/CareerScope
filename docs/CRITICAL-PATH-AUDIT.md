# CareerScope v12 critical-path audit

**Status:** planning evidence only; not implementation approval, launch
certification, risk acceptance, or production GO.
**Source of truth:** the owner-approved source register in
[`docs/requirements/SOURCE-REGISTER.md`](requirements/SOURCE-REGISTER.md),
CareerScope v12 sections 1, 4, 6–10, 12–15, the observed-code gap matrix, test
matrix, and [`docs/GO-NO-GO.md`](GO-NO-GO.md).
**Baseline inspected:** development integration commit `50eadcb3ec8224aece178eb3981290d0b4e6e226`;
this audit does not change runtime behavior.

## Decision rules

- Product scope and the D1–D14 decisions come from approved v12. The engineering
  standards and global program determine how; they do not add product features.
- `SPECIFIED`, `IMPLEMENTED`, `TESTED`, `VERIFIED`, `BLOCKED`, and
  `READY_FOR_OWNER` remain distinct evidence states. Existing functionality is
  not completion evidence for a broader v12 requirement.
- Local implementation can continue with synthetic fixtures and isolated tests
  while provider, legal, owner, hosted, or human acceptance is pending. It must
  not use unapproved job sources, real candidate data, production credentials,
  or external communications to manufacture that evidence.
- A node may be worked in parallel only after its upstream contract and
  ownership boundary are stable. External acceptance does not stop unrelated
  local work.

## Dependency path

| Order | Gate / workstream                                                      | Required predecessor and concrete exit evidence                                                                                                                                         | Can proceed locally?                                                                       | Release/owner gate                                                                                                                                                                |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Governance and source integrity                                        | Owner approval and current immutable source hashes; canonical architecture and scope exclusions reconciled                                                                              | Complete for current development branch; source checker is registered                      | Protected-main promotion and public launch remain owner-controlled                                                                                                                |
| 1     | Supply chain, CI policy, and production test-access boundary           | Node policy, source/privacy checks, read-only CI policy, production test-selector denial, strict typecheck and unit checks                                                              | Yes; local evidence exists for the current checkpoint                                      | `AUDIT-01` blocks the full audit; `GOV-02` blocks hosted CI acceptance while GitHub Actions is disabled                                                                           |
| 2     | Identity, sessions, authorization, and data ownership                  | OTP/provider contract, opaque-session lifecycle, ownership-derived IDs, CSRF/origin policy, role matrix, revocation and recovery contracts                                              | Core policy/tests can be developed with fake providers and synthetic users                 | `AUTH-01` / `PROVIDER-01` require actual approved sender/fallback configuration and owner-authorized provider acceptance; critical go/no-go 1–3, 7–8, 11 remain evidence-gated    |
| 3     | Candidate profile, resume, privacy lifecycle, and verification records | Authenticated owner boundary and field-level data classification/retention; encrypted storage and deletion/reconciliation contracts                                                     | Yes, except real provider or human verification                                            | Account deletion (go/no-go 12), verification evidence/revocation (17), legal review (23–24) remain open until directly proven                                                     |
| 4     | Job-source eligibility, provenance, discovery, and coverage            | Deny-by-default source capability model; source-specific collection, storage, transformation, display, redistribution, AI/training and expiry rights; provenance; golden-set definition | Policy code and fixture-only tests can proceed. No live collection from unapproved sources | `SOURCE-01`; go/no-go 4–6. Owner must supply rights evidence and approve city/role thresholds before public discovery opens. LinkedIn excluded; Indeed/Naukri remain gated by v12 |
| 5     | Deterministic matching and eligibility                                 | Stable profile/job contracts, preserved exclusions and match inputs, reproducible score evidence                                                                                        | Yes, using synthetic, provenance-labelled fixtures                                         | No AI ranking substitution; go/no-go/security evidence must show deterministic reproducibility and no invented fields                                                             |
| 6     | Candidate application review, manual submission, and lifecycle history | Candidate-owned job/application references, legal lifecycle transitions, revision/concurrency semantics, provenance and append-only history                                             | Yes, with synthetic jobs and isolated database                                             | External application URL opening never means `Applied`; no fabricated ATS/recruiter event. Go/no-go 11–12 and recovery gates apply                                                |
| 7     | Interview organizer                                                    | Application lifecycle and candidate ownership; timezone, reminders, state transitions and data-retention contracts                                                                      | Yes, fixtures and local queue tests                                                        | Go/no-go 11 and 18 plus go/no-go 16 accessibility and human UX evidence remain applicable                                                                                         |
| 8     | Recruiter posting, verification, moderation, and admin control plane   | Auth/session foundation, distinct recruiter/staff authorization, employer verification, audit trail, abuse cases and least privilege                                                    | Local authorization/domain implementation and adversarial tests can proceed                | Go/no-go 11, 14, 17, 22; human/legal review where required. Admin must not become unrestricted database access                                                                    |
| 9     | Notifications and candidate/recruiter communication                    | Consent/preferences, outbox idempotency, event ownership, quotas, templates, disclosure and abuse controls                                                                              | Mock transports and failure tests only                                                     | `PROVIDER-01`; no live email/WhatsApp. Go/no-go 2–3, 13, 18, 20–22 require real evidence or owner action                                                                          |
| 10    | Cross-cutting UX, accessibility, observability, reliability            | Stable product flows and design-system contracts; safe logging/data inventory; browser/device test plan                                                                                 | Automated local tests and implementation can proceed                                       | Go/no-go 16, 18–21; manual screen-reader/device and legal/human review are not replaceable by automation                                                                          |
| 11    | Operational readiness and launch evidence                              | Exact-revision hosted CI; migration and restore validation; monitoring, limits, independent alerts, kill switches and runbooks                                                          | Local synthetic recovery/load checks can proceed                                           | `GOV-02`, `RECOVERY-01`, `LEGAL-01`, `PROVIDER-01`; go/no-go 9–10, 18–25. No production deployment or GO is implied                                                               |

## Critical chain and parallel work

The launch-critical dependency chain is:

```text
approved scope + secure identity/ownership
  -> candidate data contracts and retention
  -> permission-gated source/provenance contract
  -> deterministic matching and eligibility
  -> candidate-controlled application review/tracking
  -> interviews and notifications
  -> exact-revision CI, recovery, security, accessibility and operational evidence
  -> owner production decision
```

Recruiter posting/admin can proceed as a parallel vertical slice after the
identity/authorization contract is stable; it does not authorize a recruiter
marketplace or bypass employer verification. Cross-cutting privacy, logging,
accessibility, responsive behavior, and failure testing accompany each slice,
not a final cosmetic-only phase.

Work that may proceed in parallel without relaxing gates:

- local OTP adapters/outage behavior with synthetic provider contracts, while
  actual Resend/fallback accounts and sender-domain validation remain external;
- source permission/profile schema and negative tests, while live source
  rights and coverage authorization remain owner-gated;
- deterministic matching, manual application tracking, and candidate-owned
  interview state, using synthetic fixtures;
- data deletion/recovery code, local restore drills, privacy-safe observability,
  keyboard/axe/browser automation, and dependency remediation investigation;
- recruiter/admin authorization tests with synthetic accounts, without any
  live employer onboarding or external contact.

## Unresolved gates that cannot be inferred from local code

| Gate                              | Current register         | Evidence needed to clear                                                                                                                                                                                                                                                                       |
| --------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full dependency audit             | `AUDIT-01`               | A supported, compatible remediation or documented owner disposition accepted under the repository policy; rerun the exact audit and regression suite                                                                                                                                           |
| Hosted CI and branch protection   | `GOV-02`                 | Owner enables/reviews Actions and repository protections; successful exact-SHA hosted runs and negative controls. This audit did not change settings                                                                                                                                           |
| Source rights and launch coverage | `SOURCE-01`              | Per-source rights for each data-use capability, selected launch sources, and owner-approved measured city/role and stale/duplicate thresholds                                                                                                                                                  |
| Email OTP and fallback            | `AUTH-01`, `PROVIDER-01` | Owner provisions and protects primary/fallback accounts and domains; local adapter tests plus separately authorized real staging delivery/failover acceptance                                                                                                                                  |
| Recovery point objective conflict | `RECOVERY-01`            | Owner reconciles D12 and section 6's one-hour target/24-hour fallback, section 7's explicit acceptance of either the one-hour target or disclosed fallback, and critical go/no-go item 9's one-hour-only wording; off-host backup/WAL and restore evidence must follow the written disposition |
| Off-host backup                   | `RECOVERY-01`            | Approved external destination, protected credentials, retention/encryption configuration, and a restore drill proving the accepted RPO/RTO                                                                                                                                                     |
| Legal and human acceptance        | `LEGAL-01`               | Counsel review/version, native-language/product copy review, manual screen-reader/device review, candidate/recruiter validation as applicable                                                                                                                                                  |
| Production and public launch      | `docs/GO-NO-GO.md`       | All applicable gates have current exact-SHA evidence; owner explicitly authorizes promotion and public GO                                                                                                                                                                                      |

These are not reasons to stop independent local work. They are reasons not to
claim provider acceptance, legal compliance, hosted CI, disaster recovery, or
production readiness early.

## Audit limitations

This is a source- and repository-based sequencing audit, not an implementation
plan with dates, a risk waiver, or proof that all requirements are implemented.
The 319-entry v12 inventory contains overlapping source clauses by design and
must not be reported as 319 independent features. `docs/GO-NO-GO.md` remains
`NOT_VERIFIED` until its individual gates receive direct evidence. No production
service, owner account, job source, or private user record was accessed for this
audit.
