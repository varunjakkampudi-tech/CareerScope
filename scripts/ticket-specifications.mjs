import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { buildCatalog, validateCatalog, digest, SECTIONS } from './lib/ticket-specification.mjs';

export const INPUTS = [
  '.ai/backlog.json',
  '.ai/workflow-migration.json',
  '.ai/design-ticket-coverage.json',
  'design/DESIGN-INDEX.json',
  '.ai/blocker-classification.json',
  'hostpending.txt',
  '.ai/ticket-specification-policy.json',
  '.prettierrc.json',
];
export function loadInputs(root) {
  const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
  return {
    backlog: json(INPUTS[0]),
    migration: json(INPUTS[1]),
    coverage: json(INPUTS[2]),
    designIndex: json(INPUTS[3]),
    blockers: json(INPUTS[4]),
    manualText: fs.readFileSync(path.join(root, INPUTS[5]), 'utf8'),
    policy: json(INPUTS[6]),
  };
}
const cell = (value) =>
  String(value ?? 'UNASSIGNED')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
const table = (headers, rows) =>
  `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map((row) => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n`;
const intro = '# Phase 3.25 — ';

export async function artifacts(inputs, root) {
  const formatting = JSON.parse(fs.readFileSync(path.join(root, '.prettierrc.json'), 'utf8'));
  const model = buildCatalog(inputs);
  const errors = validateCatalog(model, inputs, (ref) => {
    const full = path.resolve(root, ref);
    return full.startsWith(path.resolve(root) + path.sep) && fs.existsSync(full);
  });
  if (errors.length) throw new Error(errors.join('\n'));
  const sourceHashes = Object.fromEntries(
    INPUTS.map((file) => [file, digest(fs.readFileSync(path.join(root, file), 'utf8'))]),
  );
  const meta = {
    schemaVersion: 1,
    phase: 'PHASE_3_25',
    sourcePhase3Commit: inputs.policy.sourcePhase3Commit,
    sourceHashes,
    evidenceSemantics:
      'Planning only; generated output is not execution evidence, independent approval or release authorization.',
  };
  const output = new Map();
  const addJson = async (name, payload) =>
    output.set(
      name,
      await format(JSON.stringify({ ...meta, ...payload }), { ...formatting, parser: 'json' }),
    );
  const addDoc = async (name, payload) =>
    output.set(
      `docs/PHASE-3-25-${name}.md`,
      await format(payload, { ...formatting, parser: 'markdown' }),
    );
  await addJson('.ai/ticket-catalog.json', {
    authority: inputs.policy.authority,
    tickets: model.specs,
  });
  await addJson('.ai/ticket-specification-coverage.json', {
    counts: model.counts,
    findings: model.findings,
    readiness: 'INCOMPLETE',
    review: inputs.policy.review,
  });
  await addJson('.ai/epic-catalog.json', { epics: model.epics });
  await addJson('.ai/ticket-dependency-graph.json', {
    ...model.graph,
    gates: model.specs
      .filter((spec) => spec.sections.manualExternalGates.requirements[0].evidence.length)
      .map((spec) => ({
        ticketId: spec.ticketId,
        type: 'MANUAL_OR_EXTERNAL',
        metadata: spec.sections.manualExternalGates.requirements[0],
      })),
  });
  await addJson('.ai/test-traceability.json', {
    rows: model.traceability,
    mappingStatus: 'SUGGESTED_METHODS_ONLY_NOT_REVIEWED_EXACT_TEST_BINDINGS',
  });
  await addJson('.ai/design-traceability.json', { tickets: model.designTraceability });

  const totals = table(
    ['Measure', 'Count'],
    Object.entries(model.counts).filter(([, value]) => typeof value === 'number'),
  );
  await addDoc(
    'TICKET-CATALOG',
    `${intro}Ticket catalog\n\n${inputs.policy.authority}\n\nThis catalog retains all ${model.specs.length} tickets. Detailed sections below are source-linked drafts; none is certified implementation-ready until its recorded gaps and independent review are closed.\n\n${table(
      ['Ticket', 'Title', 'Primary Epic', 'Stage', 'Blocked', 'Delivery', 'Specification'],
      inputs.backlog.items.map((ticket) => {
        const spec = model.specs.find((entry) => entry.ticketId === ticket.id);
        return [
          ticket.id,
          ticket.title,
          spec.primaryEpicId,
          ticket.status,
          ticket.blocked,
          spec.sections.delivery.requirements[0].deliveryMode,
          `[details](tickets/${ticket.id}.md)`,
        ];
      }),
    )}`,
  );
  await addDoc(
    'EPIC-CATALOG',
    `${intro}Epic catalog\n\nPrimary ownership prefers the canonical backlog Epic, then Phase 1 design mapping. Engineering-only tickets use the explicit area classification policy; this does not change release scope or workflow.\n\n${table(
      ['Epic', 'Objective', 'Children', 'Blocked', 'Complete specs', 'Release'],
      model.epics.map((epic) => [
        epic.id,
        epic.title,
        epic.childTicketIds.join(', '),
        epic.totals.blocked,
        epic.totals.completeSpecifications,
        epic.releaseTarget,
      ]),
    )}`,
  );
  await addDoc(
    'DESIGN-TRACEABILITY',
    `${intro}Design traceability\n\nExact mappings come from design/DESIGN-INDEX.json and Phase 1 coverage. DESIGN_VERIFIED means an exact source reference maps to the ticket; it is not rendered parity or approval of new product behavior. DESIGN_PARTIAL means only shared references exist. DESIGN_GAP means the exact surface is absent. Missing images are never fabricated.\n\n${table(
      ['Ticket', 'Classification', 'Primary reference', 'Screen IDs', 'Role/route'],
      model.designTraceability.map((entry) => [
        entry.ticketId,
        entry.status,
        entry.primaryRef,
        entry.screens.map((screen) => screen.designId).join(', '),
        entry.screens
          .map(
            (screen) => `${screen.role}: ${screen.route?.state} ${screen.route?.path ?? 'unknown'}`,
          )
          .join('; '),
      ]),
    )}`,
  );
  await addDoc(
    'TEST-TRACEABILITY',
    `${intro}Acceptance and test traceability\n\nAll source criteria are preserved and mapped to suggested verification types. This is not 100% executable test traceability: exact test paths/assertions and manual expected outcomes still require reviewed bindings. No existing test execution is claimed.\n\n${table(
      ['Ticket / AC', 'Criterion', 'Suggested verification', 'Evidence', 'Status', 'Owner'],
      model.traceability.map((row) => [
        row.acId,
        row.criterion,
        row.verification.map((entry) => entry.type).join(', '),
        row.verification.map((entry) => entry.evidenceRequired).join('; '),
        'PLANNED / UNREVIEWED',
        row.verification.map((entry) => entry.owner).join(', '),
      ]),
    )}`,
  );
  await addDoc(
    'DEPENDENCY-GRAPH',
    `${intro}Dependency graph\n\nExisting registry dependencies retain HARD prerequisite semantics. The editorial supplement adds seven SEQUENCING edges explicitly required by CS-47 AC4; every edge validates against that source criterion. No ticket dependency is guessed or silently softened. External/manual gates are carried separately, not fictitious ticket nodes.\n\n${table(
      ['Prerequisite', 'Dependent', 'Type', 'Source'],
      model.graph.edges.map((edge) => [edge.prerequisite, edge.dependent, edge.type, edge.source]),
    )}\n\nCycle/cycle-dependent nodes: ${model.graph.cyclicOrCycleDependent.length}.\n`,
  );
  await addDoc(
    'IMPLEMENTATION-ORDER',
    `${intro}Implementation order\n\nThese are topological layers of declared dependencies, not a delivery schedule or authorization to implement. Tickets within a layer are graph-parallel candidates only: builders still need disjoint claims, accepted contracts and release/HOLD approval. Shared mutable tests serialize.\n\n${table(
      ['Layer', 'Ticket IDs'],
      model.graph.layers.map((layer, index) => [index, layer.join(', ')]),
    )}\n\nGate every layer by its source release disposition, blocker metadata and specification readiness. Unknown release assignments remain undecided. HOLD/FUTURE tickets never become R1 prerequisites merely because they have a design. Longest declared prerequisite chain: ${model.graph.longestDeclaredChain.join(' -> ')}. Effort-based dates cannot be inferred. CS-47 also requires owner prioritization before starting.\n`,
  );
  await addDoc(
    'QUALITY-AUDIT',
    `${intro}Specification quality audit\n\nStructural section coverage and generated count are not implementation readiness. Every finding below is retained until source evidence or an approved specification resolves it.\n\n${totals}\n\n${table(
      ['Ticket', 'Gap', 'Section', 'Reason', 'Owner', 'Required evidence'],
      model.findings.map((finding) => [
        finding.ticketId,
        finding.code,
        finding.section,
        finding.reason,
        finding.owner,
        finding.requiredEvidence,
      ]),
    )}`,
  );
  await addDoc(
    'REVIEW',
    `${intro}Review record\n\nIndependent review: **${inputs.policy.review.status}**. ${inputs.policy.review.reason}\n\nPrincipal self-review identified generic Phase 1 criteria, unbound test assertions, unresolved owner decisions, missing domain/API contracts and partial or absent exact designs. These remain explicit findings; no simulated reviewer approval is recorded. Security, accessibility, product and release requirements are planning requirements, not observations of completed implementation.\n`,
  );
  await addDoc(
    'FINAL-REPORT',
    [
      `${intro}Final report`,
      `Source branch: phase-3/canonical-workflow-migration. Source SHA: ${inputs.policy.sourcePhase3Commit}. Branch: phase-3.25/ticket-specification-catalog. Final artifact commit: use git log -- docs/PHASE-3-25-FINAL-REPORT.md; a file cannot embed its own commit hash. Final SHA and clean-tree result are reported after commit.`,
      totals,
      `Workflow before/after: ${JSON.stringify(model.counts.workflow)}. Status changes: 0. All six frozen Phase 3 inputs, including migration/design/blocker evidence and hostpending, are compared against the source commit.`,
      'Artifacts: six machine-readable catalogs, nine generated phase documents and 216 per-ticket draft documents. Backlog owns identity/workflow/release/dependencies/source ACs; the single editorial policy owns additive draft requirements and source-linked sequencing. Generated outputs are read-only, with no execution timestamps. Repeated generation must not rewrite unchanged bytes.',
      'Commands and observed results: PHASE-3-25-VALIDATION.md. A structural PASS is not readiness; tickets:spec:ready refuses incomplete specs or independent review that is not approved.',
      `All open gaps are enumerated in PHASE-3-25-QUALITY-AUDIT.md and ticket-specification-coverage.json. Census change required: NO. CS-47 AC4 adds seven validated SEQUENCING edges without changing the frozen registry; owner prioritization still gates execution. Semantic graph gaps: ${model.counts.dependencySemanticGapCount}.`,
      `Independent review: ${inputs.policy.review.status}. ${inputs.policy.review.reason}`,
      'No runtime implementation, status promotion, push, merge, deployment, hosted/provider validation or fabricated evidence was performed. CS-46 is an explicitly unaccepted recommendation. CS-25 remains owner-deferred; no activation approval is inferred.',
      'PHASE_3_25_COMPLETION: 0% reviewed implementation-ready specifications (0/216). PHASE_3_25_STATUS: INCOMPLETE. READY_FOR_PHASE_3_5: NO. Draft structural coverage is not the readiness numerator.',
    ].join('\n\n'),
  );
  for (const spec of model.specs) {
    let doc = `# ${spec.ticketId} — ${spec.sections.identity.requirements[0].title}\n\nGenerated draft. Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Readiness: ${spec.readiness}.\n`;
    for (const [index, section] of SECTIONS.entries())
      doc += `\n## ${index + 1}. ${section}\n\n\`\`\`json\n${JSON.stringify(spec.sections[section], null, 2)}\n\`\`\`\n`;
    doc += `\n## Open specification gates\n\n${table(
      ['Code', 'Reason', 'Owner', 'Evidence'],
      spec.gaps.map((gap) => [gap.code, gap.reason, gap.owner, gap.requiredEvidence]),
    )}`;
    output.set(
      `docs/tickets/${spec.ticketId}.md`,
      await format(doc, { ...formatting, parser: 'markdown' }),
    );
  }
  return { output, model };
}

export async function run(root, mode) {
  const inputs = loadInputs(root);
  for (const name of INPUTS.slice(0, 6)) {
    const baseline = execFileSync('git', ['show', `${inputs.policy.sourcePhase3Commit}:${name}`], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    const current = fs.readFileSync(path.join(root, name), 'utf8');
    const canonical = (body) =>
      name.endsWith('.json') ? JSON.parse(body) : body.replace(/\r\n/g, '\n');
    if (digest(canonical(baseline)) !== digest(canonical(current)))
      throw new Error(`Frozen Phase 3 source changed: ${name}`);
  }
  const { output, model } = await artifacts(inputs, root);
  const changed = [];
  for (const [name, body] of output) {
    const full = path.join(root, name);
    if (!fs.existsSync(full) || fs.readFileSync(full, 'utf8') !== body) {
      changed.push(name);
      if (mode === '--generate') {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, body);
      }
    }
  }
  const expectedSpecs = new Set(
    [...output.keys()]
      .filter((name) => name.startsWith('docs/tickets/'))
      .map((name) => path.basename(name)),
  );
  const extras = fs.existsSync(path.join(root, 'docs/tickets'))
    ? fs.readdirSync(path.join(root, 'docs/tickets')).filter((name) => !expectedSpecs.has(name))
    : [];
  if (extras.length) throw new Error(`Orphan specification documents: ${extras.join(', ')}`);
  if (mode !== '--generate' && changed.length)
    throw new Error(`Generated artifact drift: ${changed.join(', ')}`);
  if (
    mode === '--ready' &&
    (model.counts.incompleteSpecificationCount ||
      model.findings.length ||
      inputs.policy.review.status !== 'APPROVED')
  )
    throw new Error(
      `Implementation readiness INCOMPLETE: ${model.counts.incompleteSpecificationCount} draft specifications; ${model.findings.length} gaps; independent review ${inputs.policy.review.status}`,
    );
  return { status: 'PASS', mode, changedFiles: changed.length, counts: model.counts };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const mode = process.argv[2] ?? '--check';
    if (!['--generate', '--check', '--ready'].includes(mode) || process.argv.length > 3)
      throw new Error('Use --generate, --check or --ready');
    process.stdout.write(`${JSON.stringify(await run(process.cwd(), mode), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
