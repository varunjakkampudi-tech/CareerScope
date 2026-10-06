# Phase 3.25 — Local Validation Record (2026-10-06)

This record captures scoped local commands only. It is not hosted CI, a release,
production publication, or Release 1 acceptance evidence.

## CS-4 publication fixture run

- Repository HEAD observed: `c713a9def9f7f440761f542f9f5b73b8901326d8`.
- Runtime: Node `v24.19.0`, invoked from the repository's existing bundled
  runtime.
- Command: `node --test scripts/publish-pages.test.mjs`.
- Result: exit 0; 7 tests passed, 0 failed, 0 skipped.
- Scope: the suite uses injected publication adapters. No publication command,
  real Git mutation, tag, push, environment-file read, or snapshot decryption
  was requested by this validation run.
- Source SHA-256 values at validation time:

| File                             | SHA-256                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `scripts/publish-pages.mjs`      | `50DCFA0A1E519F5CD8F00FC7131C10E71FF9EA459ABB492212B47E2C63E5325A` |
| `scripts/publish-pages.test.mjs` | `B3B917267219A4993203C96FE42199316844738C7D1130D7FCB78F25874285E7` |
| `scripts/sync-version.mjs`       | `54D29F837D060034597D8F4562F79D813EF751A53CBA8ACEA1BDCD0B82EF0950` |

### Explicit limitation

The current regression tests verify version-file keys in `git commit --only`
arguments. They do not separately assert keys in the recorded `git add`
arguments. Therefore the local 7/7 result does not prove all of CS-4 AC1/AC2;
the specification keeps the distinct staging assertion `PLANNED` until the
future test is updated and run. No product or workflow status is changed by
this record.

## Specification test correction

`node --test scripts/ticket-specifications.test.mjs` was run under Node
`v24.19.0` after the CS-3 whole-spec receipt was added. Result: exit 0; 48
tests passed, 0 failed, 0 skipped. Two assertions that encoded the earlier
zero-approved-spec state were updated to expect the single content-receipted
CS-3 specification and the current non-executed verification-state vocabulary;
they do not loosen execution-evidence checks.

## CS-5 public-export fixture and browser checks

- Runtime: Node `v24.19.0` from the existing bundled runtime.
- Commands: `node --test scripts/export-mobile.test.mjs` and
  `npm run pages:workspace:test`.
- Results: export unit suite exit 0 (2/2); public workspace browser check exit
  0 (Chromium, Firefox and WebKit reported filters, save state, refresh, clear
  confirmation, blocked storage and responsive checks passed).
- Scope limitation: the export unit suite exercises pure URL/public-field
  projection only; it does not exercise the PostgreSQL owner/status predicate,
  archive exclusion or temp-root filesystem publication. The browser workspace
  check is not SQL ownership or clean-checkout CI evidence. CS-5 AC1 and AC3
  remain PLANNED for their service-backed and exact-SHA acceptance.
- Source SHA-256 values at validation time:

| File                                 | SHA-256                                                            |
| ------------------------------------ | ------------------------------------------------------------------ |
| `scripts/export-mobile.mjs`          | `8A795DF5728A24EF4B908091A93D6FCC1676AAF0FE6E7B9C4F5BDF571C9547F3` |
| `scripts/export-mobile.test.mjs`     | `C76753D3E86852AF99A7B3936334201CB42C27E1FD3612124EB0B51AF06B485A` |
| `scripts/check-public-workspace.mjs` | `0C3806E625315D776E881FD3DCD268B33AAB827900236FB3EA5A99518A671E98` |

## CS-7 local deployment-gate checks

- Runtime: Node `v24.19.0` from the existing bundled runtime.
- Command: `npm run deploy:gate:test`.
- Result: exit 0; 34/34 emitted checks passed. Coverage includes synthetic
  PASS/REFUSE/WAIT decision cases and static workflow assertions for manual
  dispatch, main checkout, no arbitrary ref/bypass, `needs: require-ci`, and
  protected production environment.
- Limits: this does not make an HTTP request to Actions, exercise deadline
  expiry, prove immutable SHA propagation across jobs, or observe hosted
  downstream conclusions. The moving-main source defect and those missing
  assertions remain unresolved/planned; the historical hosted run is not
  current evidence. No push, workflow dispatch, secret use or deployment
  occurred during this check.
- The full `scripts/ticket-specifications.test.mjs` run first exposed stale
  aggregate expectations: reviewed bindings/mapped ACs were 45/42, and the
  canonical findings array had 651 entries rather than the stale 629 expected
  by the test. The three assertions were aligned to the current generated
  model without changing findings or validation rules. A clean Node 24 rerun
  then passed 49/49 tests; `npm run tickets:spec:check` passed with
  `changedFiles: 0`. A subsequent CS-7 AC3 review finding required separating
  failed-A, successful-A/moved-main-to-B, and successful-A/unchanged-main
  procedures. The independent reviewer approved all three binding plans after
  that correction. The final Node 24.19.0 full suite passed 49/49 tests;
  `npm run tickets:spec:generate` followed by `npm run tickets:spec:check`
  reported zero generated-file drift. Current generated counts are 216 tickets,
  1 whole-spec approval, 215 incomplete, 906 ACs, 46 mapped, 860 unmapped,
  49 reviewed exact planned procedures and 651 findings (629 OPEN, 15
  RESOLVED, 7 RECLASSIFIED). The CS-8 finding was resolved by propagating two
  already-approved content-bound receipts to their policy entries; no new
  review was claimed. `node scripts/ticket-specifications.test.mjs` then
  passed 49/49 tests, including the regression assertion that the CS-8 exact-
  binding finding resolves only when all binding review states satisfy the
  existing receipt rule. The suite also verified generation twice produces
  identical bytes. These planned procedures are not product test execution or
  hosted evidence. CS-7 and CS-8 still have no whole-spec approval; no runtime
  behavior, ticket workflow state, deployment, or hosted configuration was
  changed.
