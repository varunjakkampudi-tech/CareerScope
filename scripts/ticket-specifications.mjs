import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { buildCatalog, validateCatalog, digest, SECTIONS } from './lib/ticket-specification.mjs';
import { acceptanceCriteriaHashMatches } from './lib/ticket-workflow.mjs';

export const INPUTS = [
  '.ai/backlog.json',
  '.ai/workflow-migration.json',
  '.ai/design-ticket-coverage.json',
  'design/DESIGN-INDEX.json',
  '.ai/blocker-classification.json',
  'hostpending.txt',
  '.ai/ticket-specification-policy.json',
  '.prettierrc.json',
  'docs/OWNER-DECISIONS-2026-10-02.md',
  'docs/PHASE-3-25-REMEDIATION-REVIEW-01.md',
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
    ownerDecisionText: fs.readFileSync(path.join(root, INPUTS[8]), 'utf8'),
    verificationReviewText: fs.readFileSync(path.join(root, INPUTS[9]), 'utf8'),
  };
}
const cell = (value) =>
  String(value ?? 'UNASSIGNED')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
const table = (headers, rows) =>
  `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map((row) => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n`;
const intro = '# Phase 3.25 — ';
const CS80_DECISION_ID = 'OD-2026-10-07-CS80-AC3';
const CS80_CHECKPOINT_BASE_SHA = '3911a52fb2167707a1b04e258c15c403815286e4';
const CS80_CHECKPOINT_PATH_COUNT = 32;
const CS80_CHECKPOINT_PATHS_SHA256 =
  '0f1eb5d8a80ef12ae7c3c01c08f0686950b42f1c5b430122b5025a298e82fa69';
const CS80_PREVIOUS_CRITERIA_HASH =
  '2c20cd612efbb6bc030114f3647fef1e97a6aeaeb3a2d861f67023e9e90727df';
const CS80_AMENDED_CRITERIA_HASH =
  '32a705b339219358468b6f8e49ee056c4a81e0d91e48219dcb768407c554eb28';
const CS80_AMENDED_AC3 =
  'No personal data, resume, database, credential, runtime/provider/user-generated data, logs, caches, build output or unrelated agent-generated artifact enters history. Deterministic Phase 3.25 specification, catalog and traceability projections produced solely by the approved generator may enter `phase-3.25/cloud-continuation` only under owner decision OD-2026-10-07-CS80-AC3, an exact allowlist, deterministic regeneration, pre-stage privacy/publication checks and an atomic commit with corresponding source changes. This branch exception does not authorize merge to `main`; integration requires a later explicit owner decision. Existing ignore rules and publication guards must be verified before staging.';
const CS80_OWNER_SUFFIX_HASH = 'ed58add38319f2637fcdd37412b2d5b059e93eacb5eee3376b4be50725f6fc4c';

export function isAuthorizedOwnerDecisionAppend(original, current) {
  const normalizedOriginal = original.replace(/\r\n/g, '\n');
  const normalizedCurrent = current.replace(/\r\n/g, '\n');
  const heading = `## ${CS80_DECISION_ID} — Phase 3.25 generated-artifact checkpoint exception`;
  const index = normalizedCurrent.indexOf(heading);
  if (
    index <= 0 ||
    (normalizedCurrent.match(new RegExp(`^## ${CS80_DECISION_ID}\\b`, 'gm')) ?? []).length !== 1
  )
    return false;
  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const prefix = normalizedCurrent.slice(0, index).trimEnd();
  const suffix = normalizedCurrent.slice(index).replace(/\s+/g, ' ').trim();
  const suffixHash = createHash('sha256').update(suffix).digest('hex');
  return (
    normalize(prefix) === normalize(normalizedOriginal) && suffixHash === CS80_OWNER_SUFFIX_HASH
  );
}

function normalizeJson(value) {
  return JSON.stringify(value);
}

export function authorizedCs80SourceAmendment(name, baselineText, currentText) {
  const baseline = JSON.parse(baselineText);
  const current = JSON.parse(currentText);
  if (name === '.ai/backlog.json') {
    const oldTicket = baseline.items.find((ticket) => ticket.id === 'CS-80');
    const newTicket = current.items.find((ticket) => ticket.id === 'CS-80');
    if (
      !oldTicket ||
      !newTicket ||
      digest(oldTicket.acceptanceCriteria) !== CS80_PREVIOUS_CRITERIA_HASH ||
      digest(newTicket.acceptanceCriteria) !== CS80_AMENDED_CRITERIA_HASH ||
      newTicket.acceptanceCriteria.length !== 3 ||
      newTicket.acceptanceCriteria[2] !== CS80_AMENDED_AC3 ||
      current.updatedAt !== baseline.updatedAt
    )
      return false;
    newTicket.acceptanceCriteria = oldTicket.acceptanceCriteria;
    return normalizeJson(current) === normalizeJson(baseline);
  }
  if (name === '.ai/workflow-migration.json') {
    const record = current.records.find((entry) => entry.ticketId === 'CS-80');
    if (!record || !acceptanceCriteriaHashMatches(record, CS80_AMENDED_CRITERIA_HASH)) return false;
    delete record.acceptanceCriteriaAmendments;
    return normalizeJson(current) === normalizeJson(baseline);
  }
  return false;
}

export function exactCheckpointPathsMatch(checkpoint, generatedChanges, branch) {
  if (
    checkpoint?.decisionId !== CS80_DECISION_ID ||
    checkpoint.baseCommit !== CS80_CHECKPOINT_BASE_SHA ||
    checkpoint.generatedPathCount !== CS80_CHECKPOINT_PATH_COUNT ||
    checkpoint.generatedPathsSha256 !== CS80_CHECKPOINT_PATHS_SHA256 ||
    checkpoint.branch !== branch ||
    branch !== 'phase-3.25/cloud-continuation' ||
    !Array.isArray(checkpoint.generatedPaths) ||
    !Array.isArray(generatedChanges)
  )
    return false;
  const allowed = [...checkpoint.generatedPaths].sort();
  const allowedHash = createHash('sha256').update(allowed.join('\n')).digest('hex');
  return (
    allowed.length === CS80_CHECKPOINT_PATH_COUNT &&
    allowedHash === CS80_CHECKPOINT_PATHS_SHA256 &&
    new Set(allowed).size === allowed.length &&
    JSON.stringify(allowed) === JSON.stringify([...generatedChanges].sort())
  );
}

export function validateCs80AmendmentPair(backlog, migration) {
  const ticket = backlog.items.find((entry) => entry.id === 'CS-80');
  const record = migration.records.find((entry) => entry.ticketId === 'CS-80');
  const backlogAmended =
    !!ticket && digest(ticket.acceptanceCriteria) === CS80_AMENDED_CRITERIA_HASH;
  const ledgerAmended =
    !!record &&
    Array.isArray(record.acceptanceCriteriaAmendments) &&
    record.acceptanceCriteriaAmendments.length > 0 &&
    acceptanceCriteriaHashMatches(record, CS80_AMENDED_CRITERIA_HASH);
  const hasAnyAmendment = !!record?.acceptanceCriteriaAmendments?.length || backlogAmended;
  if (hasAnyAmendment && backlogAmended !== ledgerAmended)
    throw new Error(
      'CS-80 amended criterion and migration provenance must be present as an exact pair',
    );
  return hasAnyAmendment;
}

export function validateGeneratedArtifactCheckpoint(policy, output, root, branch) {
  const backlog = JSON.parse(fs.readFileSync(path.join(root, '.ai/backlog.json'), 'utf8'));
  const migration = JSON.parse(
    fs.readFileSync(path.join(root, '.ai/workflow-migration.json'), 'utf8'),
  );
  const hasAnyAmendment = validateCs80AmendmentPair(backlog, migration);
  const checkpoint = policy.generatedArtifactCheckpoint;
  if (hasAnyAmendment && !checkpoint)
    throw new Error('CS-80 generated-artifact exception requires its exact checkpoint manifest');
  if (!checkpoint) return;

  if (!exactCheckpointPathsMatch(checkpoint, checkpoint.generatedPaths, branch))
    throw new Error('Generated-artifact checkpoint decision, base, branch or manifest is invalid');
  const ancestor = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', checkpoint.baseCommit, 'HEAD'],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  if (ancestor.status !== 0)
    throw new Error('Generated-artifact checkpoint base must be an ancestor of HEAD');

  const generatedChanges = [];
  for (const [name, body] of output) {
    let baseline = null;
    try {
      baseline = execFileSync('git', ['show', `${checkpoint.baseCommit}:${name}`], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
      });
    } catch {
      baseline = null;
    }
    if (baseline !== body) generatedChanges.push(name);
  }
  if (!exactCheckpointPathsMatch(checkpoint, generatedChanges, branch))
    throw new Error(
      'Generated-artifact checkpoint allowlist does not exactly match generator output',
    );
}

export async function artifacts(inputs, root) {
  if (inputs.policy.ownerDecisionSource) {
    const source = inputs.policy.ownerDecisionSource;
    const original = execFileSync('git', ['show', `${source.commit}:${source.path}`], {
      cwd: root,
      encoding: 'utf8',
    });
    if (!isAuthorizedOwnerDecisionAppend(original, inputs.ownerDecisionText))
      throw new Error('Owner decision record is not a valid append-only CS-80 decision amendment');
  }
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
    mappingStatus: 'PARTIAL_REVIEWED_BINDINGS_WITH_PLANNED_EXECUTION_REMAINING',
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
      ['Ticket', 'Gap', 'Disposition', 'Section', 'Reason', 'Owner', 'Required evidence'],
      model.findings.map((finding) => [
        finding.ticketId,
        finding.code,
        finding.disposition,
        finding.section,
        finding.reason,
        finding.owner,
        finding.requiredEvidence,
      ]),
    )}\n\n## Remediation decision reconciliation\n\nThe original findings above are retained. These dispositions qualify the historical owner-choice finding, not specification approval or release evidence. Source: ${inputs.policy.ownerDecisionSource?.commit ?? 'NONE'}:${inputs.policy.ownerDecisionSource?.path ?? 'NONE'}.\n\n${table(
      ['Ticket', 'Disposition', 'Approved direction', 'Remaining gate'],
      Object.entries(inputs.policy.decisionReconciliations ?? {}).map(([id, decision]) => [
        id,
        'RECLASSIFIED — DECISION_EXISTS_BUT_NOT_PROPAGATED_TO_SPEC',
        decision.decision,
        decision.remainingGate,
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
      `Remediation starting checkpoint: 3a2ffcc5c368f08e88df6be5e0ffe4e55b2c1c14. Initial reviewed readiness: 0/216. Owner-direction reconciliations: ${model.counts.ownerDecisionReconciliationCount}, sourced from existing local branch history; CS-46 is approved exclusion scope, not an undecided recommendation. Authored exact verification bindings: ${model.counts.authoredExactTestBindingCount}; independently reviewed bindings: ${model.counts.reviewedExactTestBindingCount}; all execution remains PLANNED. Reviewed binding quality does not approve a whole specification. No runtime implementation, status promotion, push, merge, deployment, hosted/provider validation or fabricated evidence was performed. CS-25 historical deferral is retained while the later approved multi-user backup boundary is explicit.`,
      'Continuation checkpoint: 2c37f25a52d7d4635c5cf7ecc2f0068a0cf9c111. The bounded CS-62–CS-71 remediation ledger records individually reviewed CS-67/CS-70/CS-71 bindings, corrected verification-design findings and unimplemented SaveJob defects. See PHASE-3-25-REMEDIATION-LEDGER.md and PHASE-3-25-REMEDIATION-REVIEW-01.md. Scoped binding approval does not resolve whole-spec release classification or approve the entire phase. The final local artifact commit is resolvable through git log for this report; no self-referential SHA is invented.',
      `PHASE_3_25_COMPLETION: ${((model.counts.approvedSpecificationCount / model.specs.length) * 100).toFixed(2)}% reviewed implementation-ready specifications (${model.counts.approvedSpecificationCount}/${model.specs.length}). PHASE_3_25_STATUS: INCOMPLETE. READY_FOR_PHASE_3_5: NO. Draft structural coverage is not the readiness numerator.`,
    ].join('\n\n'),
  );
  for (const spec of model.specs) {
    let doc = `# ${spec.ticketId} — ${spec.sections.identity.requirements[0].title}\n\n${spec.reviewState === 'APPROVED' ? 'Content-reviewed specification; this does not assert implementation or execution evidence.' : 'Generated draft.'} Source: .ai/backlog.json; supplements: .ai/ticket-specification-policy.json; design: design/DESIGN-INDEX.json. Do not edit this document. Specification state: ${spec.reviewState}; readiness: ${spec.readiness}.\n`;
    for (const [index, section] of SECTIONS.entries())
      doc += `\n## ${index + 1}. ${section}\n\n\`\`\`json\n${JSON.stringify(spec.sections[section], null, 2)}\n\`\`\`\n`;
    doc += `\n## Specification gate history\n\n${table(
      ['Code', 'Disposition', 'Original reason', 'Owner', 'Evidence'],
      spec.gaps.map((gap) => [
        gap.code,
        gap.disposition,
        gap.reason,
        gap.owner,
        gap.requiredEvidence,
      ]),
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
    if (
      digest(canonical(baseline)) !== digest(canonical(current)) &&
      !(
        ['.ai/backlog.json', '.ai/workflow-migration.json'].includes(name) &&
        authorizedCs80SourceAmendment(name, baseline, current)
      )
    )
      throw new Error(`Frozen Phase 3 source changed: ${name}`);
  }
  const { output, model } = await artifacts(inputs, root);
  const branch = execFileSync('git', ['branch', '--show-current'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  validateGeneratedArtifactCheckpoint(inputs.policy, output, root, branch);
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
      `Implementation readiness INCOMPLETE: ${model.counts.incompleteSpecificationCount} draft specifications; ${model.findings.length} historical finding records (${model.counts.openFindingCount} OPEN); independent review ${inputs.policy.review.status}`,
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
