# CareerScope v12 launch go/no-go ledger

Source: approved v12 section 15. This working ledger is not launch approval.
Every row remains NOT_VERIFIED until direct requirement-specific evidence is
recorded. Baseline unit gates and source backups do not certify these rows.
No waiver is granted. Critical items cannot be waived by an agent; high items
require the owner's explicit written disposition. Optional capabilities remain
disabled pending an approved applicability decision, not an automatic pass.

| ID  | Required gate                                                                | Source         | Severity | Result       | Responsible role              |
| --- | ---------------------------------------------------------------------------- | -------------- | -------- | ------------ | ----------------------------- |
| 1   | Email OTP sign-in works; test login blocked in production                    | D1, 4.1        | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 2   | Second email provider failover tested                                        | D11            | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 3   | Sign-in outage state tested with both providers down                         | 4.1, section 6 | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 4   | Launch source set permission profiles recorded                               | D14, 4.6       | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 5   | Listing coverage per target city and role family meets owner threshold       | D13            | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 6   | Stale and duplicate rates measured on golden set                             | D13            | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 7   | Authentication recovery procedures tested                                    | 4.1            | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 8   | Session rotation and reuse detection tested                                  | 4.1            | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 9   | 1-hour recovery point with WAL archiving; restore drill meets target         | D12            | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 10  | Off-host backup copy in place                                                | section 6      | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 11  | Record-level access isolation tests pass                                     | section 7      | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 12  | Account deletion tests pass across all stores                                | section 9      | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 13  | Email delivery copy reviewed                                                 | 4.11           | Medium   | NOT_VERIFIED | Engineering; owner acceptance |
| 14  | Photo copy reviewed; access controls tested                                  | 4.4            | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 15  | Prompt-injection suite passes                                                | section 9      | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 16  | WCAG 2.2 AA tests pass on core flows                                         | 4.18           | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 17  | Verification evidence, expiry, and revocation tests pass                     | 4.5            | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 18  | Platform failure tests (Redis, PostgreSQL, email, workers) pass              | section 7      | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 19  | Single-VPS failure domains documented; resource limits load-tested           | section 6      | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 20  | Alerts deliver through a path independent of the primary VPS                 | section 6, 8   | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 21  | Kill switch stops AI, email, and sync in production                          | section 7      | Critical | NOT_VERIFIED | Engineering; owner acceptance |
| 22  | Outreach caps, disclosure, reply-to, and abuse controls tested               | D4, 4.11       | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 23  | DPDP commencement dates confirmed against MeitY notification                 | section 10     | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 24  | Legal review complete for DPDP, outreach, verification, recruiter terms      | section 12     | High     | NOT_VERIFIED | Engineering; owner acceptance |
| 25  | Owner sign-off on accepted risks, including the single-VPS host failure risk | section 6      | Critical | NOT_VERIFIED | Engineering; owner acceptance |

Recovery target conflict is tracked as RECOVERY-01 in blocker.txt. Legal and
provider facts require authorized current evidence; no legal conclusion or live
provider verification is implied. Production promotion and public GO remain the
owner's exclusive decision.
