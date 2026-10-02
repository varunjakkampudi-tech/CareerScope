# Phase 3.25 remediation review 01

Starting checkpoint: `3a2ffcc5c368f08e88df6be5e0ffe4e55b2c1c14`.
Actual independent reviewer: `/root/phase325_review`, read-only review on
2026-10-02. Verdict: **APPROVED for the inspected remediation only**.

## Scope and observed findings

The reviewer inspected ten owner-direction reconciliations (CS-40, CS-44,
CS-46, CS-88 through CS-94) and three CS-46 exact planned verification bindings.
The restored owner document matches commit
`154974acc372ee0ec2434c95107e7746ee3c59a7`, permitting formatting whitespace only.
The reviewer confirmed the local remote-tracking reference resolves to that
commit, summaries preserve remaining security/design/provider/live gates, and
the procedures specify ownership denial, reparse/search behavior, fixtures and
expected results. No blocking defect was found in that scope.

One follow-up remains: reconcile CS-25's owner-deferred presentation with the
updated requirement for verified off-host protection before materially
multi-user rollout. This is not evidence that backup or restore was executed.

## Content-bound verification review receipt

Hash rule: SHA-256 of JSON.stringify of the ordered binding array after removing
only each binding's `reviewStatus`. The hash covers procedure, assertion,
negative case, test status and all other authored binding fields. A changed
procedure invalidates this receipt until independently reviewed again.

| AC        | Binding content hash                                             | Review verdict |
| --------- | ---------------------------------------------------------------- | -------------- |
| CS-46-AC1 | a1ba8cb20456ef3f35c91ba6c162292983962624f612ac005d304faf14c16426 | APPROVED       |
| CS-46-AC2 | 12d9e4bacc25b562d01052b4164423f197956955d99078ecb0e7e755ac012d2b | APPROVED       |
| CS-46-AC3 | 8fa935d141981632d77a53d85609a5116eb22d8e456ced80e73734d5b12a5d2b | APPROVED       |

This approves verification specification quality only. All three tests/procedures
remain **PLANNED**, not executed. It does not approve the whole CS-46
specification, resolve its implementation contract or release assignment, or
approve any other specification. Approved implementation-ready specifications
remain **0/216**. Phase 3.25 remains INCOMPLETE.

No runtime changes, ticket promotion, hosted evidence, push, merge or deployment
formed part of this review.

## Verification-harness follow-up

The same actual reviewer inspected the isolated agile fixture harness. Initial
verdict REVISE: an inherited sandbox flag could bypass isolation in the
canonical checkout. That finding was corrected with child-entry path/source/temp
invariants and a subprocess rejection regression. Final scoped verdict:
APPROVED. Existing scenario assertions remain unchanged; child errors/signals
fail closed and cleanup removes only the validated temporary root.

The reviewer inspected code and regression structure, not scenarios during the
parent's serial run. The parent subsequently executed all 36 specification tests,
including canonical-state preservation and inherited-flag rejection, with no
failures or skips. This does not broaden the three binding review receipts or
approve any whole ticket specification.

## Bounded remediation review: CS-67 and CS-71

Starting checkpoint: `2c37f25a52d7d4635c5cf7ecc2f0068a0cf9c111`.
The actual read-only `/root/phase325_review` inspected the authored refinements,
the six bindings and their cited runtime/test/Phase 3 sources. It approved five
bindings initially and returned REVISE on CS-67-AC2: a Node snapshot harness
cannot prove rendered browser warnings or non-execution of injected scripts.
The binding was corrected to a planned browser procedure with warning
`textContent`, canonical counts and an absent `window.__fixtureExecuted`
sentinel. The reviewer independently re-read and approved that correction.

| AC        | Independently computed binding SHA-256                           | Scoped verdict |
| --------- | ---------------------------------------------------------------- | -------------- |
| CS-67-AC1 | 230e7966ab4748fa675fa4d8b02af068916e6b8a9ef9a53a0cd3402afe8cba4b | APPROVED       |
| CS-67-AC2 | 520f3f8742d39a995ff1f549fb0307fe39e4a6156b0dc4b9cf5af45bdef5ffcb | APPROVED       |
| CS-67-AC3 | 28b51721a1107287778605fcd27b189306c31f164158224e1f6aaaa0052b1aa6 | APPROVED       |
| CS-71-AC1 | 28b46bd3b02fe8976371865a4e900db7703b2cfca44b50432781c368a94dbdea | APPROVED       |
| CS-71-AC2 | 94493a026837945c5cc8327fb966681826e334b7edb98267afcda67bb93e57af | APPROVED       |
| CS-71-AC3 | cb28d2b45644a8ce78f62d39fa65295ce677f0e91e86854f97ecb8146c0d9c0f | APPROVED       |

Digests exclude only `reviewStatus`, as in the original three receipts. This
approves planned verification quality, not executed tests or whole specs.
CS-67 preserves its original seven-column AC as historical evidence but consumes
the later immutable six-column Phase 3 contract. CS-71 preserves the actual
typed discriminator and does not expand language support. Release assignment
and whole-spec review remain unresolved. No edits or mutable test execution
were performed by the reviewer; no shipping action occurred.

## CS-70 planned-binding review

The same actual reviewer traced all three bindings against the Fastify route,
LeadRepository, SaveJob and database tests. AC2 and AC3 passed initially. AC1
received REVISE: a B session without a B-owned matching lead cannot detect the
promised reachable owner-join regression. Both owners now have independently
owned runs/jobs/leads sharing a fingerprint, with positive and cross-owner
checks in both directions. The corrected binding limits mutation claims to
reachable constraints rather than unobservable redundant FK-protected joins.
The reviewer re-read and approved the correction.

| AC        | Independently computed binding SHA-256                           | Scoped verdict |
| --------- | ---------------------------------------------------------------- | -------------- |
| CS-70-AC1 | 97a0e943cecacbea6467969ed6c2febfdfb56742cb7c9aefb0facb61155b3f30 | APPROVED       |
| CS-70-AC2 | 66b0ad71f05d8a740376344643686764e5a47fcbb21cac99cce99ff60433d1aa | APPROVED       |
| CS-70-AC3 | 5713696943bddf94556b4f444ccc104c8c260634f46944522ef02d7c95cca45f | APPROVED       |

The reviewer found actual SaveJob accessibility/error-state gaps recorded in
PHASE-3-25-REMEDIATION-LEDGER.md. They are later runtime work, not fixed or
passing here. All bindings remain PLANNED and no whole spec was approved.
Review was read-only with no mutable tests, hosted action or deployment.

## Continued CS-1–CS-18 batch: CS-4 and CS-8

The actual reviewer independently inspected the two CS-4 and three CS-8
binding groups against their cited modules and tests. CS-4 correctly requires
future assertions for both staging and commit-only paths; existing tests check
commit-only paths. Fixtures must inject both read and run adapters and never
invoke publication CLI/default adapters or expose inherited environment data.

CS-8 initially received REVISE for a Node-only procedure promising rendered
warnings, omitted terminal consumer and insufficient module-relative fixture
isolation. Corrections added control-center.mjs, distinguished orchestration and
agile consumers, required copied actual modules/assets or supported root
injection, prohibited running the old mutation script against canonical state,
and added an explicit browser binding with valid-restoration control. The
reviewer re-read and approved these planned procedures.

| AC       | Independently computed binding SHA-256                           | Scoped verdict |
| -------- | ---------------------------------------------------------------- | -------------- |
| CS-4-AC1 | 1711b3ccda843f77d67ba8b9f5725762b31dfc1ff945b61208fb26b8fbbf7bc2 | APPROVED       |
| CS-4-AC2 | c51bade53a96f671d38876848ef9f0fd064aceb4fabc0803ff9077effaab6d32 | APPROVED       |
| CS-8-AC1 | b9469e88330967750399908b0bb88a3264c1a978a6a215ce778f103e2de1019b | APPROVED       |
| CS-8-AC2 | ddd2c7dca9f11d5a6f025c42cb0605ba1400c502f4994ab291c925df77bfc451 | APPROVED       |
| CS-8-AC3 | 601d170d360c11efb68d7faad99cd8e98c759941a147bd6b16a25f17843de8c4 | APPROVED       |

CS-8-AC2 hashes the ordered contract and browser bindings together. All six
procedures remain PLANNED. Inventory-wide/schema/sandbox verification and safe
parser diagnostics remain unverified implementation work. No whole-ticket or
phase approval is granted, and no mutable tests or shipping actions were
performed by the reviewer.

## Continued CI and stable-namespace planning review

Starting checkpoint: `13b801de478bbbe0f0b077503624c4ee911f70dd`.
Actual read-only `/root/phase325_review` inspected CS-1, CS-7, CS-9 and
CS-3 procedures against their cited canonical source. Initial REVISE findings
were corrected and independently re-reviewed: CS-7's non-shipping hosted
harness now derives the actual deployment dependency graph and conditions,
binds its source hash and invalidates on canonical source drift; CS-9 AC2
separates source registration from actual service-backed execution. CS-3
distinguishes application/container edge publication from approved management
SSH exposure. No actual hosted run or live crash occurred in this review.

| AC       | Independently computed binding SHA-256                           | Scoped verdict |
| -------- | ---------------------------------------------------------------- | -------------- |
| CS-1-AC1 | 01cd21c7e305c2301b0125bf9c9c3767ae38c2575d7d5a34e1e784a7adfa6ff5 | APPROVED       |
| CS-1-AC2 | e159ff1508ee98caaebea78f28e5b9d6242468f0bee0e480868dfeed72fb336b | APPROVED       |
| CS-1-AC3 | 9cde7ce4fd423807ad84de1ca0a551704c7d7e4400612b4b326d804cda5e4cba | APPROVED       |
| CS-7-AC1 | 1eedd189312c01074140c9d1f2eb550102a87fe27a6395e3976e0e210e04c6f1 | APPROVED       |
| CS-7-AC2 | bc2aece1a4666a097398e404564fb9f9b3242f959683fcccc47eb4f5668f1955 | APPROVED       |
| CS-7-AC3 | 63adfe84802124b037a14832663dd91db685e20710c903c18dd52c5ccf6edbd2 | APPROVED       |
| CS-9-AC1 | 8882a1fe18d18557d87d267763a4a3e7869e9d8ee714069083692cd471fc4cb0 | APPROVED       |
| CS-9-AC2 | 701cfbb25f04cc5aeae7585c65561dbf246e0158111c426c1f9ed52db6247623 | APPROVED       |
| CS-9-AC3 | d454d729eff419f08f654fa892959b23c46c8d8a9d273995d14c3aa466aafc9d | APPROVED       |
| CS-3-AC1 | bb6588743346cc543aeca6951e8c800b8cfe13b04c129504f180b79e411bace8 | APPROVED       |
| CS-3-AC2 | 40272c6b7ba15b7a85c20b66c34f1a9eb7d2b0677ca2baa81856c94aa1de9d1a | APPROVED       |

All twelve procedures for these eleven criteria remain PLANNED. Approval
is limited to verification-plan quality; all whole specs remain DRAFT.
CS-7's historical override requirement is explicitly superseded by the newer
no-bypass contract; CS-9 preserves historical six-file coverage while requiring
all nine current files. Actual current service execution is not inferred.

Runtime-only finding from the actual reviewer, NOT FIXED in specification phase:
deployment jobs independently checkout main and do not propagate require-ci's
resolved SHA to downstream checkouts; main movement between jobs can invalidate
exact-SHA provenance. Future implementation must address and verify this before
shipping. Redis configuration currently proves AOF/noeviction readback, while
everysec/maxmemory readback remains a future specified assertion.

## Routing, consolidation and invocation planning review

The actual read-only reviewer continued individually through CS-6, CS-5 and
CS-12. CS-6 AC2 initially required corrections: cold-session fixtures must use
fresh contexts/empty query cache rather than pretending a background refetch
makes cached authentication pending; server denial requires genuine anonymous
or cross-owner sessions, not an intercepted authenticated:false result. Real
private feature mounts are recorded without replacing the feature. Corrected
procedure was independently re-read and approved.

CS-5 review traced the actual owner/archive SQL predicate, six-field public
projection, URL sanitization and copied module-relative fixture isolation.
Clean-checkout parity is future evidence, not an old green-run citation.
CS-12 explicitly requires actual capability grants/refusal proof. This native
reviewer's observed non-editing does not prove it lacks edit capabilities.
Selected platform evidence remains a future gate; no permissions were changed.

| AC        | Independently computed binding SHA-256                           | Scoped verdict |
| --------- | ---------------------------------------------------------------- | -------------- |
| CS-6-AC1  | 0290aa5c2eab66e4177cddafe560f5a2b51fa26340c5e72361c048f573e8b917 | APPROVED       |
| CS-6-AC2  | 200d9ab227a50e9f0ec8c831c6a68f8d54a0246967b25badfad804984e24575a | APPROVED       |
| CS-6-AC3  | 8a04939771043569abbfefc48e6abdcf68f27375c49a161be8dee6f79cd1a599 | APPROVED       |
| CS-5-AC1  | a8996f79ded372f68c44f123a574db9f75f72036c9f39c7b2776c820c74eda80 | APPROVED       |
| CS-5-AC2  | 5ea24a787af9008bde3ae2352ea6f3337773dd4bf2fc3e84cb4aa2dbdc44c0e9 | APPROVED       |
| CS-5-AC3  | 99d29c244e563c182e08d842a49bcb9e6d05ffccc7db525b182cadabcb0c7d1a | APPROVED       |
| CS-12-AC1 | 3f26ea8174e77a8aabdc7965e7c506db583287c8b18c71ce0a2db265cdb0f78b | APPROVED       |
| CS-12-AC2 | 46a19a638b61664da5a091354ddceb62b241f2ba18ef450912ec95325a70907c | APPROVED       |
| CS-12-AC3 | 902d2f6ab561cff9e81a7760838f0d47e737cda2234f12e844efbe09f8bbc12d | APPROVED       |
| CS-12-AC4 | 69f19fb383f9ae53086a253e20e23bbc0423ccd985d8cdddd3cd7292b167dd5d | APPROVED       |

All ten procedures remain PLANNED. These scoped approvals do not approve any
whole ticket, create current test/provider/hosted evidence or promote workflow.

## Agent-retention planning review

The same actual reviewer inspected CS-10 against the24 canonical definitions
and activation policy. AC1/AC2 were approved. AC3 and DoD initially received
REVISE: an explained unresolved disposition cannot substitute for actually
merging/removing a redundant active role. The correction explicitly keeps
implementation acceptance incomplete until approved consolidation is executed;
all24 individually justified roles can still produce a valid zero-removal result.
The reviewer independently re-read and approved the correction.

| AC        | Independently computed binding SHA-256                           | Scoped verdict |
| --------- | ---------------------------------------------------------------- | -------------- |
| CS-10-AC1 | d675de8ba97c03f7ea101bb7104014d3b923bf2ac0e01c4fef257961d05a5111 | APPROVED       |
| CS-10-AC2 | 577661f5973e438419ff322c7cd732651eae862220cff47330e42cba83a80738 | APPROVED       |
| CS-10-AC3 | 7a647e919ca4f873bae2c2c616bbb0b17a65165d871f094d04fe469ee136e312 | APPROVED       |

The reviewer also inspected four new specification-content regressions. They
protect no-bypass/source-bound DAG semantics, registration/execution separation,
cold-session/genuine server-denial setup, container/management port distinction
and actual tool grants versus observed non-editing. They are not deployment,
integration, browser, live-host or platform enforcement execution evidence.
No whole-ticket approval was granted; all three procedures remain PLANNED.

## Continued static-public planning review: CS-11

The actual independent reviewer read source styles/controller, browser fixtures,
staging projection and the local accesslint-audit skill. Design stays PARTIAL;
marketing-home image is not invented static job-list approval. The local skill
is now present, but the available-tool inventory exposed no audit_live,
audit_html or audit_diff capability. No audit/sign-off was performed or tool
installed. Future named audit plus human judgment remain explicit DoD evidence.

AC5 initially received REVISE: source-only contract verification cannot prove
actual automatic network origins. Correction separates static allowlist/no-build
contract from browser request capture. User-controlled legitimate external job
navigation remains allowed and never implies Applied. The actual reviewer
independently re-read and approved that ordered two-procedure group.

| AC        | Independently computed binding SHA-256                           | Scoped verdict |
| --------- | ---------------------------------------------------------------- | -------------- |
| CS-11-AC1 | cc8f7495ae32166d90b983ec4251a9b267c1c37e206f17e61a9d6c727d9733f8 | APPROVED       |
| CS-11-AC2 | 7f58e5d079c3068c9f11ab92a185abfff1b4f5c08c9c85a018fe61e0b2c862e8 | APPROVED       |
| CS-11-AC3 | b8e2589279ac91a9e734224c7b3ef2b49bb5000c067b47e6687b5aa36fe945f5 | APPROVED       |
| CS-11-AC4 | 7b97da8bdac0ed0f2279fae3a0c5c7fa5115e5499a9cc0e9ec2f0a089c8098ce | APPROVED       |
| CS-11-AC5 | 515a2f07a6965039c90f72ef90350e616b1e6798b31541a8da495eef328b7890 | APPROVED       |

All six procedures remain PLANNED, not executed. Whole-spec/phase approval is
not granted. Named accessibility guidance influenced failure/limitation and
human-evidence requirements only; no runtime accessibility fix was implemented.
