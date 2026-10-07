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
const CS80_V2_DECISION_ID = 'OD-2026-10-07-CS80-AC3-V2';
const CS80_V2_POLICY = 'CONTROLLED_ROLLING_DETERMINISTIC_MANIFEST';
const CS80_PREVIOUS_CRITERIA_HASH =
  '2c20cd612efbb6bc030114f3647fef1e97a6aeaeb3a2d861f67023e9e90727df';
const CS80_AMENDED_CRITERIA_HASH =
  '32a705b339219358468b6f8e49ee056c4a81e0d91e48219dcb768407c554eb28';
const CS80_AMENDED_AC3 =
  'No personal data, resume, database, credential, runtime/provider/user-generated data, logs, caches, build output or unrelated agent-generated artifact enters history. Deterministic Phase 3.25 specification, catalog and traceability projections produced solely by the approved generator may enter `phase-3.25/cloud-continuation` only under owner decision OD-2026-10-07-CS80-AC3, an exact allowlist, deterministic regeneration, pre-stage privacy/publication checks and an atomic commit with corresponding source changes. This branch exception does not authorize merge to `main`; integration requires a later explicit owner decision. Existing ignore rules and publication guards must be verified before staging.';
const CS80_OWNER_SUFFIX_HASH = '24d280ffad50f49de39df61d33b2f41792a4541f50eb4b4aaa57360c9c327d03';
const CS80_V1_OWNER_FILE_SHA256 =
  '08ac917f012dab260828952b926c5a1eb04a5c226ec0854d8bf11e9e39051a70';
const CS80_V1_COVERAGE_FILE_SHA256 =
  'eee9b0068d068dca64f0d025ae17a2a496d37846ee2b649dec711fc3ed496d9a';
const ROLLING_MANIFEST_KEYS = [
  'schemaVersion',
  'policy',
  'decisionId',
  'baseCommit',
  'previousManifestHash',
  'previousPathCount',
  'paths',
  'changedContentPathsFromBase',
  'currentPathCount',
  'addedPaths',
  'removedPaths',
  'unchangedPaths',
  'safetyValidated',
  'safetyValidationScope',
  'determinismValidated',
  'determinismValidationScope',
  'mainIntegrationAuthorized',
  'currentManifestHash',
];
const ROLLING_MANIFEST_PATH_KEYS = ['path', 'artifactClass', 'generatorOwned'];

const MACHINE_CATALOG_PATHS = [
  '.ai/design-traceability.json',
  '.ai/epic-catalog.json',
  '.ai/test-traceability.json',
  '.ai/ticket-catalog.json',
  '.ai/ticket-dependency-graph.json',
  '.ai/ticket-specification-coverage.json',
];
const PHASE_REPORT_PATHS = [
  'docs/PHASE-3-25-DEPENDENCY-GRAPH.md',
  'docs/PHASE-3-25-DESIGN-TRACEABILITY.md',
  'docs/PHASE-3-25-EPIC-CATALOG.md',
  'docs/PHASE-3-25-FINAL-REPORT.md',
  'docs/PHASE-3-25-IMPLEMENTATION-ORDER.md',
  'docs/PHASE-3-25-QUALITY-AUDIT.md',
  'docs/PHASE-3-25-REVIEW.md',
  'docs/PHASE-3-25-TEST-TRACEABILITY.md',
  'docs/PHASE-3-25-TICKET-CATALOG.md',
];

export function isAuthorizedOwnerDecisionAppend(original, current) {
  const normalizedOriginal = original.replace(/\r\n/g, '\n');
  const normalizedCurrent = current.replace(/\r\n/g, '\n');
  const heading = `## ${CS80_DECISION_ID} — Phase 3.25 generated-artifact checkpoint exception`;
  const index = normalizedCurrent.indexOf(heading);
  const exactHeadingCount = normalizedCurrent.split('\n').filter((line) => line === heading).length;
  if (index <= 0 || exactHeadingCount !== 1) return false;
  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const prefix = normalizedCurrent.slice(0, index).trimEnd();
  const suffix = normalizedCurrent.slice(index).replace(/\s+/g, ' ').trim();
  const suffixHash = createHash('sha256').update(suffix).digest('hex');
  return (
    normalize(prefix) === normalize(normalizedOriginal) && suffixHash === CS80_OWNER_SUFFIX_HASH
  );
}

function classifyGeneratedArtifact(name, ticketIds) {
  if (MACHINE_CATALOG_PATHS.includes(name)) return 'MACHINE_CATALOG';
  if (PHASE_REPORT_PATHS.includes(name)) return 'PHASE_REPORT';
  const match = /^docs\/tickets\/(CS-\d+)\.md$/.exec(name);
  if (match && ticketIds.has(match[1])) return 'TICKET_SPECIFICATION';
  return null;
}

function gitTreeBlobHashes(root, commit) {
  const tree = execFileSync('git', ['ls-tree', '-r', '-z', commit], {
    cwd: root,
    encoding: 'buffer',
    maxBuffer: 32 * 1024 * 1024,
  });
  const hashes = new Map();
  for (const record of tree.toString('utf8').split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    if (tab < 0) throw new Error(`Malformed git tree entry at ${commit}`);
    const [mode, type, objectId] = record.slice(0, tab).split(' ');
    if (type === 'blob' && mode !== '120000') hashes.set(record.slice(tab + 1), objectId);
  }
  return hashes;
}

function gitBlobHash(content) {
  const body = Buffer.from(content, 'utf8');
  return createHash('sha1').update(`blob ${body.byteLength}\0`).update(body).digest('hex');
}

export function rollingManifestDigest(manifest) {
  const canonical = {
    schemaVersion: manifest.schemaVersion,
    policy: manifest.policy,
    decisionId: manifest.decisionId,
    baseCommit: manifest.baseCommit,
    previousManifestHash: manifest.previousManifestHash,
    previousPathCount: manifest.previousPathCount,
    paths: [...manifest.paths]
      .sort((left, right) => left.path.localeCompare(right.path))
      .map(({ path: artifactPath, artifactClass, generatorOwned }) => ({
        path: artifactPath,
        artifactClass,
        generatorOwned,
      })),
    changedContentPathsFromBase: [...manifest.changedContentPathsFromBase].sort(),
    currentPathCount: manifest.currentPathCount,
    addedPaths: [...manifest.addedPaths].sort(),
    removedPaths: [...manifest.removedPaths].sort(),
    unchangedPaths: [...manifest.unchangedPaths].sort(),
    safetyValidated: manifest.safetyValidated,
    safetyValidationScope: manifest.safetyValidationScope,
    determinismValidated: manifest.determinismValidated,
    determinismValidationScope: manifest.determinismValidationScope,
    mainIntegrationAuthorized: manifest.mainIntegrationAuthorized,
  };
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function uniqueSortedStrings(value) {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === 'string' && entry.length > 0) &&
    new Set(value).size === value.length &&
    value.every((entry, index) => index === 0 || value[index - 1].localeCompare(entry) < 0)
  );
}

function hasExactKeys(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

export function validatePreviousManifest(prior, ticketIds, predecessorHash) {
  const isNonNegativeInteger = (value) => Number.isSafeInteger(value) && value >= 0;
  const pathsAreValid =
    Array.isArray(prior.paths) &&
    prior.paths.every(
      (entry) =>
        hasExactKeys(entry, ROLLING_MANIFEST_PATH_KEYS) &&
        typeof entry.path === 'string' &&
        entry.generatorOwned === 'YES' &&
        classifyGeneratedArtifact(entry.path, ticketIds) === entry.artifactClass,
    ) &&
    new Set(prior.paths.map((entry) => entry.path)).size === prior.paths.length &&
    prior.paths.every(
      (entry, index) => index === 0 || prior.paths[index - 1].path.localeCompare(entry.path) < 0,
    );
  const currentPaths = new Set((prior.paths ?? []).map((entry) => entry.path));
  const arraysAreValid =
    uniqueSortedStrings(prior.addedPaths) &&
    uniqueSortedStrings(prior.removedPaths) &&
    uniqueSortedStrings(prior.unchangedPaths) &&
    uniqueSortedStrings(prior.changedContentPathsFromBase);
  const added = new Set(prior.addedPaths ?? []);
  const unchanged = new Set(prior.unchangedPaths ?? []);
  const removed = new Set(prior.removedPaths ?? []);
  const deltasAreValid =
    arraysAreValid &&
    isNonNegativeInteger(prior.currentPathCount) &&
    isNonNegativeInteger(prior.previousPathCount) &&
    prior.currentPathCount === prior.paths.length &&
    prior.previousPathCount === removed.size + unchanged.size &&
    added.size + unchanged.size === currentPaths.size &&
    [...added].every((name) => currentPaths.has(name) && !unchanged.has(name)) &&
    [...unchanged].every((name) => currentPaths.has(name) && !added.has(name)) &&
    [...removed].every((name) => !currentPaths.has(name)) &&
    prior.changedContentPathsFromBase.every((name) => currentPaths.has(name));
  if (
    !hasExactKeys(prior, ROLLING_MANIFEST_KEYS) ||
    !pathsAreValid ||
    !arraysAreValid ||
    !deltasAreValid ||
    prior.schemaVersion !== 1 ||
    prior.currentManifestHash !== rollingManifestDigest(prior) ||
    !/^[0-9a-f]{40}$/.test(prior.baseCommit ?? '') ||
    prior.policy !== CS80_V2_POLICY ||
    prior.decisionId !== CS80_V2_DECISION_ID ||
    prior.mainIntegrationAuthorized !== 'NO' ||
    prior.safetyValidated !== 'YES' ||
    prior.determinismValidated !== 'YES' ||
    !/^[0-9a-f]{64}$/.test(prior.previousManifestHash ?? '') ||
    prior.previousManifestHash !== predecessorHash
  )
    throw new Error(
      'Previous generated-artifact manifest is malformed, unprovenanced or hash-invalid',
    );
  return prior.paths.map((entry) => entry.path);
}

export function isApprovedV1Bootstrap(coverageBytes, ownerBytes, checkpoint) {
  return (
    isApprovedV1CoverageAnchor(coverageBytes, ownerBytes) &&
    checkpoint.previousManifestHash === CS80_CHECKPOINT_PATHS_SHA256 &&
    checkpoint.generatedPathsSha256 === CS80_CHECKPOINT_PATHS_SHA256
  );
}

export function isApprovedV1CoverageAnchor(coverageBytes, ownerBytes) {
  let coverage;
  try {
    coverage = JSON.parse(Buffer.from(coverageBytes).toString('utf8'));
  } catch {
    return false;
  }
  return (
    coverage.phase === 'PHASE_3_25' &&
    coverage.schemaVersion === 1 &&
    !Object.hasOwn(coverage, 'artifactManifest') &&
    createHash('sha256').update(coverageBytes).digest('hex') === CS80_V1_COVERAGE_FILE_SHA256 &&
    createHash('sha256').update(ownerBytes).digest('hex') === CS80_V1_OWNER_FILE_SHA256
  );
}

export function committedPredecessorManifestHash(root, ticketIds) {
  const coveragePath = '.ai/ticket-specification-coverage.json';
  const history = execFileSync('git', ['log', '--format=%H', 'HEAD^', '--', coveragePath], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  let foundV1Anchor = false;
  let expectedHash = null;
  for (const commit of history.reverse()) {
    let text;
    try {
      text = execFileSync('git', ['show', `${commit}:${coveragePath}`], {
        cwd: root,
        encoding: 'buffer',
        maxBuffer: 20 * 1024 * 1024,
      });
    } catch (error) {
      throw new Error(`Cannot verify rolling-manifest predecessor ${commit}: ${error.message}`);
    }
    let coverage;
    try {
      coverage = JSON.parse(text.toString('utf8'));
    } catch (error) {
      throw new Error(`Committed predecessor coverage is malformed at ${commit}: ${error.message}`);
    }
    if (!foundV1Anchor) {
      if (createHash('sha256').update(text).digest('hex') === CS80_V1_COVERAGE_FILE_SHA256) {
        let ownerBytes;
        try {
          ownerBytes = execFileSync(
            'git',
            ['show', `${commit}:docs/OWNER-DECISIONS-2026-10-02.md`],
            {
              cwd: root,
              encoding: 'buffer',
              maxBuffer: 5 * 1024 * 1024,
            },
          );
        } catch (error) {
          throw new Error(
            `Cannot verify V1 owner-decision provenance at ${commit}: ${error.message}`,
          );
        }
        if (!isApprovedV1CoverageAnchor(text, ownerBytes))
          throw new Error(
            `V1 coverage anchor is not paired with the exact owner decision at ${commit}`,
          );
        foundV1Anchor = true;
        expectedHash = CS80_CHECKPOINT_PATHS_SHA256;
      }
      continue;
    }
    if (!coverage.artifactManifest)
      throw new Error(
        `Committed coverage after the approved V1 anchor has no rolling manifest at ${commit}`,
      );
    validatePreviousManifest(coverage.artifactManifest, ticketIds, expectedHash);
    expectedHash = coverage.artifactManifest.currentManifestHash;
  }
  if (!foundV1Anchor)
    throw new Error('Cannot verify the rolling-manifest predecessor from committed history');
  return expectedHash;
}

function previousManifest(root, checkpoint, ticketIds) {
  const coveragePath = '.ai/ticket-specification-coverage.json';
  const exists = spawnSync('git', ['cat-file', '-e', `HEAD:${coveragePath}`], {
    cwd: root,
    encoding: 'utf8',
  });
  if (exists.status !== 0)
    throw new Error(
      'Cannot derive a rolling manifest without the previous committed coverage artifact',
    );
  let coverage;
  try {
    coverage = JSON.parse(
      execFileSync('git', ['show', `HEAD:${coveragePath}`], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
      }),
    );
  } catch (error) {
    throw new Error(
      `Previous coverage artifact is unreadable; refusing manifest fallback: ${error.message}`,
    );
  }
  const prior = coverage.artifactManifest ?? null;
  if (prior) {
    const paths = validatePreviousManifest(
      prior,
      ticketIds,
      committedPredecessorManifestHash(root, ticketIds),
    );
    if (prior.baseCommit !== checkpoint.baseCommit)
      throw new Error('Previous generated-artifact manifest is malformed or hash-invalid');
    return {
      hash: prior.currentManifestHash,
      paths,
      manifest: prior,
      previousCoverage: coverage,
    };
  }
  const v1OwnerText = execFileSync('git', ['show', 'HEAD:docs/OWNER-DECISIONS-2026-10-02.md'], {
    cwd: root,
    encoding: 'buffer',
    maxBuffer: 5 * 1024 * 1024,
  });
  const coverageBytes = execFileSync('git', ['show', `HEAD:${coveragePath}`], {
    cwd: root,
    encoding: 'buffer',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (!isApprovedV1Bootstrap(coverageBytes, v1OwnerText, checkpoint))
    throw new Error(
      'V1 bootstrap is permitted only from the exact owner-approved 32-path checkpoint',
    );
  return {
    hash: checkpoint.generatedPathsSha256,
    paths: checkpoint.generatedPaths,
    manifest: null,
    previousCoverage: coverage,
  };
}

function createRollingManifest({ root, output, inputs, checkpoint }) {
  const baseTree = gitTreeBlobHashes(root, checkpoint.baseCommit);
  const ticketIds = new Set(inputs.backlog.items.map((ticket) => ticket.id));
  const paths = [];
  const changedContentPathsFromBase = [];
  for (const [name, body] of output) {
    const artifactClass = classifyGeneratedArtifact(name, ticketIds);
    if (!artifactClass)
      throw new Error(`Generated path is outside the approved artifact classes/roots: ${name}`);
    paths.push({ path: name, artifactClass, generatorOwned: 'YES' });
    if (baseTree.get(name) !== gitBlobHash(body)) changedContentPathsFromBase.push(name);
  }
  paths.sort((left, right) => left.path.localeCompare(right.path));
  changedContentPathsFromBase.sort();

  const prior = previousManifest(root, checkpoint, ticketIds);
  const priorSet = new Set(prior.paths);
  const currentSet = new Set(paths.map((entry) => entry.path));
  const sameContentDelta =
    prior.manifest &&
    JSON.stringify([...prior.manifest.changedContentPathsFromBase].sort()) ===
      JSON.stringify(changedContentPathsFromBase);
  if (
    prior.manifest &&
    sameContentDelta &&
    currentSet.size === priorSet.size &&
    [...currentSet].every((name) => priorSet.has(name))
  )
    return prior.manifest;
  const addedPaths = [...currentSet].filter((name) => !priorSet.has(name)).sort();
  const removedPaths = [...priorSet].filter((name) => !currentSet.has(name)).sort();
  const unchangedPaths = [...currentSet].filter((name) => priorSet.has(name)).sort();
  const manifest = {
    schemaVersion: 1,
    policy: CS80_V2_POLICY,
    decisionId: CS80_V2_DECISION_ID,
    baseCommit: checkpoint.baseCommit,
    previousManifestHash: prior.hash,
    previousPathCount: prior.paths.length,
    paths,
    changedContentPathsFromBase,
    currentPathCount: paths.length,
    addedPaths,
    removedPaths,
    unchangedPaths,
    safetyValidated: 'YES',
    safetyValidationScope:
      'All changed outputs are generator-owned and classified within approved roots/classes; repository privacy and publication checks remain separately required before checkpoint.',
    determinismValidated: 'YES',
    determinismValidationScope:
      'Generation uses deterministic canonical inputs and formatting; tickets:spec:test and repeated generation are separately required checkpoint evidence.',
    mainIntegrationAuthorized: 'NO',
  };
  manifest.currentManifestHash = rollingManifestDigest(manifest);
  return manifest;
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

  const allowedArtifactClasses = {
    MACHINE_CATALOG: MACHINE_CATALOG_PATHS,
    PHASE_REPORT: PHASE_REPORT_PATHS,
    TICKET_SPECIFICATION: 'docs/tickets/<canonical-ticket-id>.md',
  };
  if (
    !exactCheckpointPathsMatch(checkpoint, checkpoint.generatedPaths, branch) ||
    checkpoint.manifestVersion !== 2 ||
    checkpoint.rollingPolicy !== CS80_V2_POLICY ||
    checkpoint.rollingDecisionId !== CS80_V2_DECISION_ID ||
    checkpoint.previousManifestHash !== CS80_CHECKPOINT_PATHS_SHA256 ||
    checkpoint.mainIntegrationAuthorized !== false ||
    JSON.stringify(checkpoint.allowedArtifactClasses) !== JSON.stringify(allowedArtifactClasses)
  )
    throw new Error(
      'Generated-artifact checkpoint policy, base, branch or prior manifest is invalid',
    );
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
  const coverage = output.get('.ai/ticket-specification-coverage.json');
  if (!coverage) throw new Error('Rolling generated-artifact manifest must be in coverage output');
  const recorded = JSON.parse(coverage).artifactManifest;
  const expected = createRollingManifest({ root, output, inputs: { backlog }, checkpoint });
  if (!recorded || JSON.stringify(recorded) !== JSON.stringify(expected))
    throw new Error('Rolling generated-artifact manifest does not exactly match generator output');
}

export async function artifacts(inputs, root) {
  if (inputs.policy.ownerDecisionSource) {
    const source = inputs.policy.ownerDecisionSource;
    const original = execFileSync('git', ['show', `${source.commit}:${source.path}`], {
      cwd: root,
      encoding: 'utf8',
    });
    if (!isAuthorizedOwnerDecisionAppend(original, inputs.ownerDecisionText))
      throw new Error(
        'Owner decision record is not the exact append-only CS-80 V1/V2 decision chain',
      );
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
  const coveragePayload = {
    counts: model.counts,
    findings: model.findings,
    readiness: 'INCOMPLETE',
    review: inputs.policy.review,
  };
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
  const coverageName = '.ai/ticket-specification-coverage.json';
  output.set(
    coverageName,
    await format(JSON.stringify({ ...meta, ...coveragePayload, artifactManifest: null }), {
      ...formatting,
      parser: 'json',
    }),
  );
  const manifest = createRollingManifest({
    root,
    output,
    inputs,
    checkpoint: inputs.policy.generatedArtifactCheckpoint,
  });
  output.set(
    coverageName,
    await format(JSON.stringify({ ...meta, ...coveragePayload, artifactManifest: manifest }), {
      ...formatting,
      parser: 'json',
    }),
  );
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
