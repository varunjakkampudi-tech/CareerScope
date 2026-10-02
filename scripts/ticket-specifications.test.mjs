import assert from 'node:assert/strict';
import test from 'node:test';
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
  assert.equal(model.counts.completeSpecificationCount, 0);
  assert.equal(model.counts.reviewedExactTestBindingCount, 0);
  assert.equal(model.counts.acceptanceCriterionCount, 906);
  assert.equal(model.counts.mappedAcceptanceCriterionCount, 0);
  assert.equal(model.counts.unmappedAcceptanceCriterionCount, 906);
  for (const id of ['CS-45', 'CS-107', 'CS-108'])
    assert.equal(model.designTraceability.find((entry) => entry.ticketId === id).ui, true);
  assert.ok(
    model.traceability.every((row) =>
      row.verification.every((entry) => /NOT_EXECUTED$/.test(entry.automationStatus)),
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

test('unknown release assignments do not become implementation authorization', () => {
  const inputs = fresh();
  const ticket = inputs.backlog.items.find((ticket) => ticket.id === 'CS-1');
  delete ticket.releaseState;
  inputs.coverage.tickets = inputs.coverage.tickets.filter((entry) => entry.ticketId !== ticket.id);
  const spec = buildCatalog(inputs).specs.find((entry) => entry.ticketId === ticket.id);
  assert.equal(spec.sections.delivery.requirements[0].deliveryMode, 'UNDECIDED');
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
