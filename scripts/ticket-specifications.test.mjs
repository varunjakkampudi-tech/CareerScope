import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCatalog,
  dependencyGraph,
  validateCatalog,
  SECTIONS,
} from './lib/ticket-specification.mjs';
import { artifacts, loadInputs } from './ticket-specifications.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fresh = () => loadInputs(root);
const validate = (model, inputs) =>
  validateCatalog(model, inputs, (ref) => {
    const full = path.resolve(root, ref);
    return full.startsWith(root + path.sep) && fs.existsSync(full);
  });

test('CS67 historical column criterion is preserved while its plan consumes the frozen Phase3 model', () => {
  const inputs = fresh();
  const before = JSON.stringify(inputs.backlog);
  const model = buildCatalog(inputs);
  const criterion = inputs.backlog.items.find((ticket) => ticket.id === 'CS-67')
    .acceptanceCriteria[0];
  assert.equal(criterion, 'BLOCKED renders in its own named column and is counted there');
  const row = model.traceability.find((entry) => entry.acId === 'CS-67-AC1');
  assert.match(row.exactBindings[0].assertion, /no Blocked column/);
  assert.match(row.exactBindings[0].expectedResult, /historical AC1/);
  assert.equal(row.exactBindings[0].testStatus, 'PLANNED');
  assert.equal(JSON.stringify(inputs.backlog), before);
});

test('CS71 scope separates explicit determination from language expansion and execution evidence', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  for (const suffix of ['AC1', 'AC2', 'AC3']) {
    const binding = model.traceability.find((row) => row.acId === `CS-71-${suffix}`)
      .exactBindings[0];
    assert.equal(binding.testStatus, 'PLANNED');
    assert.ok(binding.negativeCase.length > 30);
  }
  const paired = model.traceability.find((row) => row.acId === 'CS-71-AC2').exactBindings[0];
  assert.match(paired.assertion, /same test/);
  assert.match(paired.assertion, /Senior Software Engineer/);
  const scope = model.traceability.find((row) => row.acId === 'CS-71-AC3').exactBindings[0];
  assert.match(scope.assertion, /ROLE_WORDS entries are unchanged/);
  assert.match(scope.fixtures, /does not yet exist/);
  assert.equal(model.specs.find((spec) => spec.ticketId === 'CS-71').reviewState, 'DRAFT');
});

test('CS2 keeps the unreproduced 768px source defect separate from the historical 390px fix', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((item) => item.id === 'CS-2');
  assert.equal(ticket.title, 'Lead table header offset is wrong on Linux WebKit at 768px');
  assert.deepEqual(ticket.acceptanceCriteria, [
    'Reproduced in the Playwright Linux container, not guessed from Windows',
    'Root cause named; the assertion is not widened',
    'check-ui.mjs green on all three engines in CI',
  ]);
  const bindings = ticket.acceptanceCriteria.map((_, index) => {
    const acId = `CS-2-AC${index + 1}`;
    return model.traceability.find((row) => row.acId === acId).exactBindings[0];
  });
  assert.ok(bindings.every((binding) => binding.testStatus === 'PLANNED'));
  assert.ok(bindings.every((binding) => binding.reviewStatus === 'DRAFT'));
  assert.match(bindings[0].assertion, /390px overlap result cannot satisfy/);
  assert.match(bindings[0].procedure, /PostgreSQL with migrations, Redis, LocalStack SQS/);
  assert.match(bindings[1].negativeCase, /no 768px failure can be demonstrated/);
  assert.match(
    bindings[2].testFileOrProcedureId,
    /ci\.yml#integration\/Test CareerScope \(browser acceptance and axe accessibility/,
  );
  assert.match(
    bindings[2].assertion,
    /768px defect assertion is required only in its target WebKit run/,
  );
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-2');
  const requirements = spec.sections.functionalRequirements.requirements;
  assert.ok(requirements.some((entry) => /390px/.test(entry.requirement)));
  assert.ok(requirements.some((entry) => /scripts\/check-ui\.ts/.test(entry.requirement)));
  assert.match(
    bindings[2].procedure,
    /full current browser suite ran in Linux Chromium, Firefox and WebKit.*CS-2-specific 768px geometry assertion ran in Linux WebKit only/s,
  );
  const checklist = spec.sections.implementationChecklist.requirements.map((item) =>
    typeof item === 'string' ? item : item.requirement,
  );
  assert.ok(
    checklist.some((item) =>
      /frozen source acceptance-criterion wording unchanged.*current executable equivalent.*scripts\/check-ui\.ts/s.test(
        item,
      ),
    ),
  );
  assert.ok(
    checklist.some((item) =>
      /full browser suite on Chromium, Firefox, and WebKit.*768px geometry only in WebKit/s.test(
        item,
      ),
    ),
  );
  assert.ok(!checklist.some((item) => /check-ui\.mjs green on all three engines/.test(item)));
  assert.equal(ticket.acceptanceCriteria[2], 'check-ui.mjs green on all three engines in CI');
  assert.equal(spec.reviewState, 'DRAFT');
});

test('CS4 uses injected publication fixtures and requires both stage and commit path assertions', () => {
  const model = buildCatalog(fresh());
  for (const acId of ['CS-4-AC1', 'CS-4-AC2']) {
    const binding = model.traceability.find((row) => row.acId === acId).exactBindings[0];
    assert.equal(binding.testStatus, 'PLANNED');
    assert.match(binding.assertion, /git add/);
    assert.match(binding.assertion, /commit --only/);
    assert.match(binding.negativeCase, /hardcoded|Removing any canonical key/);
  }
});

test('CS8 separates parser contracts from rendered browser proof and module-root isolation', () => {
  const model = buildCatalog(fresh());
  const bindings = model.traceability.find((row) => row.acId === 'CS-8-AC2').exactBindings;
  assert.equal(bindings.length, 2);
  assert.deepEqual(
    bindings.map((binding) => binding.type),
    ['AUTOMATED_CONTRACT', 'AUTOMATED_BROWSER'],
  );
  assert.match(bindings[0].procedure, /separately required/);
  assert.match(bindings[1].preconditions, /modules\/assets are copied/);
  assert.match(bindings[1].negativeCase, /cwd/);
  assert.match(bindings[1].assertion, /valid restoration/);
  assert.ok(bindings.every((binding) => binding.testStatus === 'PLANNED'));
});

test('CI bindings preserve no bypass and separate registration from service execution', () => {
  const model = buildCatalog(fresh());
  const cs7 = model.specs.find((entry) => entry.ticketId === 'CS-7');
  const cs7Criteria = cs7.sections.acceptanceCriteria.requirements;
  const cs7Ac2 = cs7Criteria.find((entry) => entry.id === 'CS-7-AC2');
  assert.equal(cs7Ac2.sourceText, 'An override exists, requires explicit intent and is recorded in the run log');
  assert.equal(cs7Ac2.expectedResult, cs7Ac2.sourceText);
  const cs7Ac3 = cs7Criteria.find((entry) => entry.id === 'CS-7-AC3');
  assert.equal(cs7Ac3.expectedResult, cs7Ac3.sourceText);
  assert.match(cs7.sections.functionalRequirements.requirements.map((entry) => entry.requirement).join(' '), /supersedes historical AC2: no override/i);
  assert.match(cs7.sections.manualExternalGates.requirements.map((entry) => entry.requirement).join(' '), /owner.*approve/i);
  assert.ok(cs7.sections.implementationChecklist.requirements.every((entry) =>
    !/implement .*override|push(?:ing)? .*deliberately failing/i.test(entry.requirement),
  ));
  const exactSha = model.traceability.find((row) => row.acId === 'CS-7-AC1').exactBindings[0];
  assert.match(exactSha.setup, /advance fixture origin\/main to SHA B/);
  assert.match(exactSha.testFileOrProcedureId, /require-ci-workflow\.test\.mjs/);
  assert.equal(exactSha.reviewStatus, 'REVIEWED');
  const override = model.traceability.find((row) => row.acId === 'CS-7-AC2').exactBindings[0];
  assert.match(override.assertion, /No override_ci/);
  assert.match(override.expectedResult, /No actor can bypass exact-SHA CI/);
  const refusal = model.traceability.find((row) => row.acId === 'CS-7-AC3').exactBindings[0];
  assert.match(refusal.assertion, /source hash/);
  assert.match(refusal.assertion, /needs\/conditions/);
  assert.match(refusal.setup, /three independent runs/);
  assert.match(refusal.procedure, /success-A then advance fixture main to B/);
  assert.match(refusal.assertion, /distinct success-A\/move-main-to-B run/);
  assert.match(refusal.negativeCase, /advances main only during a failed-A run is insufficient/);
  assert.equal(refusal.reviewStatus, 'REVIEWED');
  const integration = model.traceability.find((row) => row.acId === 'CS-9-AC2').exactBindings;
  assert.deepEqual(
    integration.map((entry) => entry.type),
    ['AUTOMATED_CONTRACT', 'AUTOMATED_INTEGRATION'],
  );
  assert.match(integration[0].assertion, /not execution evidence/);
  assert.match(integration[1].assertion, /actual executed tests/);
  assert.ok(integration.every((entry) => entry.testStatus === 'PLANNED'));
});

test('private rendering plan distinguishes cold session fixtures and genuine API denial', () => {
  const binding = buildCatalog(fresh()).traceability.find((row) => row.acId === 'CS-6-AC2')
    .exactBindings[0];
  assert.match(binding.setup, /fresh browser context/);
  assert.match(binding.setup, /not mocked false session/);
  assert.match(binding.assertion, /cached authenticated navigation remains usable/);
  assert.match(binding.procedure, /actual private feature components/);
  assert.equal(binding.testStatus, 'PLANNED');
});

test('proxy plan limits container publication without prohibiting approved management access', () => {
  const binding = buildCatalog(fresh()).traceability.find((row) => row.acId === 'CS-3-AC2')
    .exactBindings[0];
  assert.equal(binding.type, 'LIVE_HOST');
  assert.match(binding.assertion, /anchor and dependent namespace identities are unchanged/);
  assert.match(binding.assertion, /Host publication remains only the intended edge ports/);
  assert.match(binding.assertion, /SSH\/operator access is not disabled/);
  assert.equal(binding.testStatus, 'PLANNED');
});

test('CS3 distinguishes tested recovery logic from current deployed topology evidence', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-3');
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-3');
  assert.equal(ticket.releaseTarget, '3.0.1');
  assert.equal(ticket.status, 'UAT');
  assert.equal(ticket.blocked, true);
  assert.equal(spec.sections.delivery.requirements[0].releaseState, 'ACTIVE_R1');
  assert.equal(spec.sections.delivery.requirements[0].deliveryMode, 'MANUAL_GATE');
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  const current = spec.sections.completionEvidence.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  assert.ok(current.some((entry) => /2026-09-28/.test(entry) && /2026-09-29/.test(entry)));
  assert.ok(current.some((entry) => /currentStep mentions backup work unrelated/.test(entry)));
  const checklist = spec.sections.implementationChecklist.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  assert.ok(checklist.some((entry) => /infra\/compose\.production\.yml/.test(entry)));
  assert.ok(checklist.some((entry) => /human-approved live-host Caddy-only crash procedure/.test(entry)));
  const ac1 = model.traceability.find((entry) => entry.acId === 'CS-3-AC1').exactBindings[0];
  const ac2 = model.traceability.find((entry) => entry.acId === 'CS-3-AC2').exactBindings[0];
  assert.deepEqual(
    spec.sections.acceptanceCriteria.requirements.map((entry) => entry.verificationIds),
    [['AUTOMATED_UNIT'], ['LIVE_HOST']],
  );
  assert.deepEqual([ac1.type, ac2.type], ['AUTOMATED_UNIT', 'LIVE_HOST']);
  assert.ok(
    spec.sections.testStrategy.requirements.some(
      (entry) =>
        entry.verification?.some(
          (verification) =>
            verification.type === 'LIVE_HOST' &&
            verification.expectedCheck === ac2.assertion &&
            verification.releaseGate === 'LIVE_PROXY_TOPOLOGY_RECOVERY',
        ),
    ),
  );
  assert.match(ac1.assertion, /cooldown/);
  assert.match(ac2.procedure, /terminate only that container/);
  assert.ok([ac1, ac2].every((entry) => entry.testStatus === 'PLANNED'));
  assert.equal(ac2.reviewStatus, 'REVIEWED');
  assert.match(ac2.preconditions, /otherwise this AC cannot pass/);
  assert.match(ac2.setup, /owner-defined start\/end bounds/);
  const asyncScope = spec.sections.functionalRequirements.requirements
    .map((entry) => (typeof entry === 'string' ? entry : entry.requirement))
    .join(' ');
  assert.match(asyncScope, /frozen AC2 only requires killing Caddy and observing the result/);
  assert.match(asyncScope, /frozen host observation separately as PARTIAL/);
  assert.match(asyncScope, /strengthened AC2 verification NOT_VERIFIED/);
  assert.match(asyncScope, /do not accept the ticket/);
  const operatorRunbook = fs.readFileSync(
    path.join(root, '.ai/OPERATOR-RUNBOOK-host-evidence.md'),
    'utf8',
  );
  const cs3Runbook = operatorRunbook.split('## CS-3 — proxy crash and stable-anchor observation')[1]
    .split('## CS-25 —')[0];
  assert.match(cs3Runbook, /infra\/check-proxy-recovery\.sh/);
  assert.doesNotMatch(cs3Runbook, /infra\/v3\/check-proxy-recovery\.sh/);
  assert.match(
    spec.sections.manualExternalGates.requirements.map((entry) => entry.requirement).join(' '),
    /historical warning against a proxy-only restart applies if Caddy owns the shared namespace/,
  );
  assert.equal(model.designTraceability.find((entry) => entry.ticketId === 'CS-3').status, 'DESIGN_NOT_APPLICABLE');
});

test('native reviewer no-edit observation is not capability enforcement evidence', () => {
  const binding = buildCatalog(fresh()).traceability.find((row) => row.acId === 'CS-12-AC4')
    .exactBindings[0];
  assert.match(binding.assertion, /not PASS/);
  assert.match(binding.negativeCase, /zero observed edits alone cannot pass/);
  assert.equal(binding.testStatus, 'PLANNED');
});

test('whole-spec approval is content-bound and invalidates after substantive changes', () => {
  const inputs = fresh();
  const approved = buildCatalog(inputs).specs.find((entry) => entry.ticketId === 'CS-3');
  assert.equal(approved.reviewState, 'APPROVED');
  assert.equal(approved.readiness, 'IMPLEMENTATION_READY');
  assert.equal(approved.gaps[0].disposition, 'RESOLVED');
  assert.equal(buildCatalog(inputs).counts.approvedSpecificationCount, 1);

  inputs.policy.ticketRefinements['CS-3'].additionalRequirements.value[0] +=
    ' Substantive mutation invalidates review.';
  const changedModel = buildCatalog(inputs);
  assert.equal(changedModel.specs.find((entry) => entry.ticketId === 'CS-3').reviewState, 'DRAFT');
  assert.ok(
    validate(changedModel, inputs).some((error) =>
      error.includes('unproven content-bound whole-specification review CS-3'),
    ),
  );
});

test('public static planning retains partial design and named future audit boundaries', () => {
  const model = buildCatalog(fresh());
  assert.equal(
    model.designTraceability.find((row) => row.ticketId === 'CS-11').status,
    'DESIGN_PARTIAL',
  );
  const visual = model.traceability.find((row) => row.acId === 'CS-11-AC1').exactBindings[0];
  assert.match(visual.assertion, /Missing exact mapping returns DESIGN_PARTIAL/);
  const audit = model.traceability.find((row) => row.acId === 'CS-11-AC4').exactBindings[0];
  assert.equal(audit.type, 'MANUAL_ACCESSIBILITY');
  assert.match(audit.assertion, /Unavailable audit tools/);
  assert.equal(audit.testStatus, 'PLANNED');
  const privacy = model.traceability.find((row) => row.acId === 'CS-11-AC5').exactBindings[0];
  assert.match(privacy.assertion, /pageFiles list unchanged/);
});

test('216 source-linked drafts preserve registry and canonical stages without readiness fabrication', () => {
  const inputs = fresh();
  const before = JSON.stringify(inputs);
  const model = buildCatalog(inputs);
  assert.deepEqual(validate(model, inputs), []);
  assert.equal(JSON.stringify(inputs), before);
  assert.equal(model.specs.length, 216);
  assert.equal(SECTIONS.length, 30);
  assert.deepEqual(model.counts.workflow, {
    BACKLOG: 141,
    TODO: 0,
    IN_PROGRESS: 0,
    QA: 5,
    UAT: 70,
    PROD: 0,
  });
  assert.equal(model.counts.blockedTicketCount, 37);
  assert.equal(model.actions.length, 15);
  assert.equal(model.counts.completeSpecificationCount, 1);
  assert.equal(model.counts.incompleteSpecificationCount, 215);
  assert.equal(model.counts.approvedSpecificationCount, 1);
  assert.equal(model.counts.reviewedExactTestBindingCount, 49);
  assert.equal(model.counts.acceptanceCriterionCount, 906);
  assert.equal(model.counts.mappedAcceptanceCriterionCount, 46);
  assert.equal(model.counts.unmappedAcceptanceCriterionCount, 860);
  assert.equal(model.counts.authoredExactTestBindingCount, 52);
  assert.equal(model.counts.ownerDecisionReconciliationCount, 11);
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-46' && finding.code === 'EXACT_AC_TEST_BINDING',
    ).disposition,
    'RESOLVED',
  );
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-8' && finding.code === 'EXACT_AC_TEST_BINDING',
    ).disposition,
    'RESOLVED',
  );
  assert.equal(model.findings.length, 651);
  for (const id of ['CS-45', 'CS-107', 'CS-108'])
    assert.equal(model.designTraceability.find((entry) => entry.ticketId === id).ui, true);
  assert.ok(
    model.traceability.every((row) =>
      row.verification.every((entry) =>
        /^(MANUAL_OR_EXTERNAL_NOT_EXECUTED|PLANNED|PLANNED_NOT_EXECUTED)$/.test(
          entry.automationStatus,
        ),
      ),
    ),
  );
  assert.equal(
    model.specs.find((spec) => spec.ticketId === 'CS-216').sections.design.requirements[0].status,
    'DESIGN_GAP',
  );
  assert.ok(
    model.specs
      .find((spec) => spec.ticketId === 'CS-46')
      .gaps.some((gap) => gap.code === 'OWNER_DECISION'),
  );
});

test('existing owner directions retain source provenance without fabricated readiness', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-46');
  const direction = spec.sections.technicalApproach.requirements.find(
    (entry) => entry?.approvedDirection,
  );
  assert.equal(direction.source.commit, '154974acc372ee0ec2434c95107e7746ee3c59a7');
  assert.match(direction.approvedDirection, /without silently clearing candidate intent/);
  assert.match(direction.remainingGate, /lower bound/);
  assert.equal(spec.reviewState, 'DRAFT');
  assert.equal(model.counts.approvedSpecificationCount, 1);
  inputs.policy.decisionReconciliations['CS-46'].section = 'invented owner approval';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unresolved owner decision section CS-46'),
    ),
  );
});

test('exact draft bindings cannot masquerade as reviewed or passing tests', () => {
  const inputs = fresh();
  const binding = inputs.policy.exactVerificationBindings['CS-46-AC2'][0];
  assert.match(binding.assertion, /reparse/);
  assert.match(binding.negativeCase, /foreign-owner/);
  binding.testStatus = 'PASS';
  binding.reviewStatus = 'APPROVED';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven exact binding approval/execution'),
    ),
  );
});

test('changing an assertion invalidates independent content-bound binding review', () => {
  const inputs = fresh();
  inputs.policy.exactVerificationBindings['CS-46-AC2'][0].assertion += ' silently clear exclusions';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven content-bound verification review CS-46-AC2'),
    ),
  );
});

test('missing review receipt cannot count as independently reviewed traceability', () => {
  const inputs = fresh();
  delete inputs.policy.verificationReviewReceipts['CS-46-AC1'];
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven content-bound verification review CS-46-AC1'),
    ),
  );
});

test('agile fixture scenarios preserve canonical state byte-for-byte', () => {
  const files = [
    '.ai/backlog.json',
    '.ai/LOOP-STATE.json',
    '.ai/process-mode.json',
    '.ai/findings.json',
    '.ai/release-plan.json',
    `.ai/tickets/${new Date().toISOString().slice(0, 10)}.json`,
  ];
  const snapshot = () =>
    files.map((file) => {
      const full = path.join(root, file);
      return fs.existsSync(full) ? fs.readFileSync(full).toString('base64') : null;
    });
  const before = snapshot();
  const result = spawnSync(process.execPath, ['scripts/check-agile-gates.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.deepEqual(
    snapshot(),
    before,
    'fixture suite must never replace canonical ticket/review state',
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ALL AGILE GATES PROVEN/);
});

test('inherited sandbox flag cannot run destructive fixtures in the canonical checkout', () => {
  const files = [
    '.ai/backlog.json',
    '.ai/LOOP-STATE.json',
    '.ai/findings.json',
    '.ai/process-mode.json',
  ];
  const snapshot = () =>
    files.map((file) => fs.readFileSync(path.join(root, file)).toString('base64'));
  const before = snapshot();
  const result = spawnSync(process.execPath, ['scripts/check-agile-gates.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      CAREERSCOPE_AGILE_GATE_SANDBOX: '1',
      CAREERSCOPE_AGILE_GATE_ROOT: root,
      CAREERSCOPE_AGILE_GATE_SOURCE: root,
      CAREERSCOPE_AGILE_GATE_PARENT_TMP: path.dirname(root),
    },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /REFUSED: agile fixtures require/);
  assert.deepEqual(snapshot(), before);
});

test('bindings require complete procedures, canonical AC IDs and valid verification types', () => {
  const inputs = fresh();
  const binding = inputs.policy.exactVerificationBindings['CS-46-AC2'][0];
  delete binding.assertion;
  binding.type = 'TRUST_ME';
  inputs.policy.exactVerificationBindings['CS-999-AC1'] = [binding];
  const errors = validate(buildCatalog(inputs), inputs);
  assert.ok(errors.some((error) => error.includes('incomplete exact binding CS-46-AC2.assertion')));
  assert.ok(errors.some((error) => error.includes('invalid exact binding type')));
  assert.ok(errors.some((error) => error.includes('orphan exact binding')));
});

test('unknown release assignments do not become implementation authorization', () => {
  const inputs = fresh();
  const ticket = inputs.backlog.items.find((ticket) => ticket.id === 'CS-1');
  delete ticket.releaseState;
  inputs.coverage.tickets = inputs.coverage.tickets.filter((entry) => entry.ticketId !== ticket.id);
  const spec = buildCatalog(inputs).specs.find((entry) => entry.ticketId === ticket.id);
  assert.equal(spec.sections.delivery.requirements[0].deliveryMode, 'UNDECIDED');
});

test('design release scope cannot authorize an unassigned ticket for implementation', () => {
  const inputs = fresh();
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-6');
  delete ticket.releaseState;
  ticket.releaseTarget = null;
  const design = inputs.coverage.tickets.find((entry) => entry.ticketId === ticket.id);
  design.releaseState = 'RELEASE';

  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === ticket.id);
  const delivery = spec.sections.delivery.requirements[0];
  assert.equal(design.releaseState, 'RELEASE');
  assert.equal(delivery.releaseState, 'UNSPECIFIED');
  assert.equal(delivery.deliveryMode, 'UNDECIDED');
  assert.ok(spec.gaps.some((gap) => gap.code === 'RELEASE_TARGET_UNDECIDED'));
  assert.ok(spec.gaps.some((gap) => gap.code === 'RELEASE_STATE_UNSPECIFIED'));
});

test('graph rejects dangling, duplicate, self and cyclic prerequisites without repairing source', () => {
  const graph = dependencyGraph([
    { id: 'CS-1', dependencies: ['CS-2', 'CS-2', 'CS-99'] },
    { id: 'CS-2', dependencies: ['CS-1'] },
    { id: 'CS-3', dependencies: ['CS-3'] },
  ]);
  for (const pattern of ['dangling', 'duplicate', 'self', 'cycle'])
    assert.ok(graph.errors.some((error) => error.includes(pattern)));
  assert.deepEqual(graph.cyclicOrCycleDependent, ['CS-1', 'CS-2', 'CS-3']);
  assert.deepEqual(graph.cycles, [['CS-1', 'CS-2'], ['CS-3']]);
});

test('cycle detection separates cyclic components from downstream blocked nodes', () => {
  const graph = dependencyGraph([
    { id: 'CS-1', dependencies: ['CS-2'] },
    { id: 'CS-2', dependencies: ['CS-1'] },
    { id: 'CS-3', dependencies: ['CS-2'] },
    { id: 'CS-4', dependencies: [] },
    { id: 'CS-5', dependencies: ['CS-4'] },
  ]);
  assert.deepEqual(graph.cycles, [['CS-1', 'CS-2']]);
  assert.deepEqual(graph.cyclicOrCycleDependent, ['CS-1', 'CS-2', 'CS-3']);
  assert.deepEqual(graph.longestDeclaredChain, ['CS-4', 'CS-5']);
});

test('graph layers put every prerequisite before its dependent', () => {
  const model = buildCatalog(fresh());
  const layer = new Map(model.graph.layers.flatMap((ids, index) => ids.map((id) => [id, index])));
  assert.equal(layer.size, 216);
  for (const edge of model.graph.edges)
    assert.ok(layer.get(edge.prerequisite) < layer.get(edge.dependent));
  assert.equal(
    model.graph.edges.filter((edge) => edge.type === 'SEQUENCING' && edge.dependent === 'CS-47')
      .length,
    7,
  );
  assert.ok(layer.get('CS-47') > layer.get('CS-19'));
});

test('editorial sequencing requires exact source AC support', () => {
  const inputs = fresh();
  inputs.policy.sequencingEdges.push({
    prerequisite: 'CS-25',
    dependent: 'CS-47',
    sourceAcIndex: 3,
  });
  const model = buildCatalog(inputs);
  assert.ok(validate(model, inputs).some((error) => error.includes('unproven sequencing')));
});

test('sequencing proof never accepts CS-1 as a prefix of CS-13', () => {
  const inputs = fresh();
  inputs.policy.sequencingEdges.push({
    prerequisite: 'CS-1',
    dependent: 'CS-47',
    sourceAcIndex: 3,
  });
  const model = buildCatalog(inputs);
  assert.ok(
    validate(model, inputs).some((error) => error.includes('unproven sequencing CS-1:CS-47')),
  );
});

for (const [name, corrupt, expected] of [
  ['missing spec', (model) => model.specs.pop(), 'missing specification'],
  [
    'null requirement',
    (model) => {
      model.specs[0].sections.problem.requirements = [null];
    },
    'malformed requirement',
  ],
  [
    'nonexistent source',
    (model) => {
      model.specs[0].sections.securityPrivacy.sources = ['docs/missing.md'];
    },
    'missing source',
  ],
  [
    'empty expected check',
    (model) => {
      model.traceability[0].verification[0].expectedCheck = '';
    },
    'source projection drift',
  ],
  [
    'invalid release state',
    (model) => {
      model.specs[0].sections.delivery.requirements[0].releaseState = 'ENABLED';
    },
    'source projection drift',
  ],
  ['removed design mapping', (model) => model.designTraceability.pop(), 'source projection drift'],
  [
    'false verified design',
    (model) => {
      model.designTraceability.find((entry) => entry.ticketId === 'CS-216').status =
        'DESIGN_VERIFIED';
    },
    'source projection drift',
  ],
  [
    'lost graph edge',
    (model) => {
      model.graph.edges = [];
    },
    'source projection drift',
  ],
  [
    'orphan spec',
    (model) => {
      model.specs[0].ticketId = 'CS-999';
    },
    'orphan/duplicate spec',
  ],
  [
    'missing section',
    (model) => {
      delete model.specs[0].sections.seo;
    },
    'invalid section',
  ],
  [
    'empty N/A rationale',
    (model) => {
      model.specs[0].sections.seo = { applicability: 'NOT_APPLICABLE', reason: '' };
    },
    'empty section',
  ],
  [
    'changed criterion',
    (model) => {
      model.specs[0].sections.acceptanceCriteria.requirements[0].sourceText = 'works';
    },
    'criterion drift',
  ],
  [
    'missing verification',
    (model) => {
      model.traceability[0].verification = [];
    },
    'unmapped AC',
  ],
  [
    'invalid verification type',
    (model) => {
      model.traceability[0].verification[0].type = 'FAKE_APPROVAL';
    },
    'unmapped AC',
  ],
  [
    'duplicate traceability',
    (model) => model.traceability.push(model.traceability[0]),
    'duplicate test mapping',
  ],
  [
    'orphan traceability',
    (model) => {
      model.traceability[0].acId = 'CS-999-AC1';
    },
    'orphan/drift test',
  ],
  [
    'duplicate epic membership',
    (model) => model.epics[1].childTicketIds.push(model.epics[0].childTicketIds[0]),
    'duplicate epic membership',
  ],
  [
    'missing design asset',
    (model) => model.designTraceability[0].references.push('design/missing.png'),
    'missing reference',
  ],
  [
    'missing manual instructions',
    (model) => {
      model.actions[0].instructions = '';
    },
    'incomplete manual action',
  ],
  ['lost hostpending action', (model) => model.actions.pop(), 'missing hostpending'],
]) {
  test(`checker fails closed: ${name}`, () => {
    const inputs = fresh();
    const model = buildCatalog(inputs);
    corrupt(model);
    assert.ok(validate(model, inputs).some((error) => error.includes(expected)));
  });
}

test('canonical status and blocker drift cannot pass specification validation', () => {
  const inputs = fresh();
  inputs.backlog.items[0].status = 'BLOCKED';
  inputs.backlog.items[0].blocked = !inputs.backlog.items[0].blocked;
  const errors = validate(buildCatalog(inputs), inputs);
  assert.ok(errors.some((error) => error.includes('legacy workflow')));
  assert.ok(errors.some((error) => error.includes('blocker drift')));
});

test('generation twice has identical names and formatted bytes without timestamps', async () => {
  const first = await artifacts(fresh(), root);
  const second = await artifacts(fresh(), root);
  assert.equal(first.output.size, 231);
  assert.deepEqual([...first.output], [...second.output]);
});
