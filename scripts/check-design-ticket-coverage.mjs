import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import process from 'node:process';

const TYPES = new Set([
  'PRIMARY_PAGE_REFERENCE',
  'CANONICAL_BOARD',
  'SUPPORTING_REFERENCE',
  'FOUNDATION_REFERENCE',
  'BRAND_REFERENCE',
  'SYSTEM_STATE_REFERENCE',
  'ARCHIVED_LEGACY',
  'NON_IMPLEMENTATION_REFERENCE',
]);
const STATES = new Set(['RELEASE', 'HOLD', 'FUTURE', 'CONDITIONAL']);
const REQUIRED = [
  'id',
  'title',
  'userProblem',
  'source',
  'area',
  'priority',
  'status',
  'size',
  'value',
  'risk',
  'complexity',
  'dependencies',
  'acceptanceCriteria',
  'securityImpact',
  'architectureImpact',
  'releaseTarget',
  'ownerAgent',
  'reviewAgents',
  'currentStep',
  'completedSteps',
  'createdAt',
  'updatedAt',
  'summary',
  'dimension',
];

/** Pure validator: filesystem and baseline facts are injected, never guessed from a summary. */
export function validateCoverage({
  coverage: c,
  index,
  backlog,
  baseline,
  baselineIndex,
  files,
  exists,
}) {
  const errors = [];
  const fail = (code, detail) => errors.push(`${code}: ${detail}`);
  if (
    !c ||
    c.phase !== 'phase-1' ||
    !index ||
    !backlog ||
    !Array.isArray(backlog.items) ||
    !Array.isArray(c.designRecords) ||
    !Array.isArray(c.tickets) ||
    !Array.isArray(c.referenceMappings) ||
    !Array.isArray(c.pageRecords) ||
    !Array.isArray(c.stages) ||
    !Array.isArray(c.epics) ||
    !Array.isArray(index.entries) ||
    !Array.isArray(files) ||
    !Array.isArray(baseline?.items) ||
    typeof exists !== 'function'
  ) {
    return { errors: ['MALFORMED: required planning data missing'], metrics: null };
  }
  const ids = new Map();
  for (const t of backlog.items) {
    if (!/^CS-[1-9]\d*$/.test(t?.id)) fail('INVALID_ID', t?.id);
    if (ids.has(t?.id)) fail('DUPLICATE_ID', t.id);
    ids.set(t?.id, t);
  }
  const highest = Math.max(0, ...backlog.items.map((t) => Number(t?.id?.slice(3)) || 0));
  for (let n = 1; n <= highest; n++) if (!ids.has(`CS-${n}`)) fail('ID_GAP', `CS-${n}`);
  for (const t of baseline.items)
    if (!isDeepStrictEqual(t, ids.get(t.id))) fail('BASELINE_CHANGED', t.id);
  const oldIds = new Set(baseline.items.map((t) => t.id));
  const metadata = new Map();
  const epicIds = new Set(c.epics.map((e) => e.id));
  if (epicIds.size !== c.epics.length) fail('DUPLICATE_EPIC', 'epic IDs');
  const safePath = (p) =>
    typeof p === 'string' &&
    p.startsWith('design/') &&
    !isAbsolute(p) &&
    !p.split(/[\\/]/).includes('..');
  const checkPath = (p) => {
    if (!safePath(p) || !exists(p)) fail('MISSING_PATH', String(p));
  };
  for (const t of c.tickets) {
    if (metadata.has(t.ticketId)) fail('DUPLICATE_METADATA', t.ticketId);
    metadata.set(t.ticketId, t);
    if (!ids.has(t.ticketId)) fail('MISSING_TICKET', t.ticketId);
    if (!epicIds.has(t.epicId)) fail('MISSING_EPIC', t.ticketId);
    if (!STATES.has(t.releaseState)) fail('RELEASE_STATE', t.ticketId);
    if (!Array.isArray(t.designRefs) || !t.designRefs.length) fail('ORPHAN_TICKET', t.ticketId);
    else
      for (const p of t.designRefs) {
        checkPath(p);
        if (p.includes('/archive/')) fail('ARCHIVE_CANONICAL', `${t.ticketId} -> ${p}`);
      }
    if (t.parentId && !ids.has(t.parentId)) fail('MISSING_PARENT', t.ticketId);
    if (
      t.releaseState !== 'RELEASE' &&
      (!t.holdReason || !t.featureFlag || t.featureFlag.default !== false)
    )
      fail('ACTIVATION_GATE', t.ticketId);
    for (const dep of t.dependencies ?? [])
      if (!ids.has(dep)) fail('INVALID_DEPENDENCY', `${t.ticketId} -> ${dep}`);
  }
  for (const t of backlog.items) {
    if (!Array.isArray(t.dependencies)) fail('MALFORMED_DEPENDENCIES', t.id);
    else
      for (const dep of t.dependencies)
        if (!ids.has(dep)) fail('INVALID_DEPENDENCY', `${t.id} -> ${dep}`);
    if (!oldIds.has(t.id)) {
      for (const k of REQUIRED)
        if (t[k] === undefined || t[k] === null) fail('TICKET_FIELD', `${t.id}.${k}`);
      if (t.status !== 'DISCOVERY') fail('PREMATURE_STATUS', t.id);
      if (!Array.isArray(t.acceptanceCriteria) || t.acceptanceCriteria.length < 2)
        fail('ACCEPTANCE', t.id);
      if (!metadata.has(t.id)) fail('ORPHAN_TICKET', t.id);
      const m = metadata.get(t.id);
      if (
        m &&
        (!isDeepStrictEqual(t.dependencies, m.dependencies) ||
          t.releaseState !== m.releaseState ||
          !isDeepStrictEqual(t.designRefs, m.designRefs))
      )
        fail('METADATA_DRIFT', t.id);
    }
  }
  const owners = new Map();
  const assertOwner = (id, state, path) => {
    const m = metadata.get(id);
    if (!m || m.releaseState !== state) fail('OWNER_STATE', path);
    if (m && !m.designRefs.includes(path)) fail('OWNER_REFERENCE', path);
    if (/\/01-IMPLEMENTATION-ORDER\/0[567]-/.test(path) && m?.releaseState !== 'HOLD')
      fail('MISSING_HOLD', id);
  };
  for (const r of c.designRecords) {
    if (owners.has(r.designId)) fail('DUPLICATE_PRIMARY_OWNER', r.designId);
    owners.set(r.designId, r);
    if (typeof r.primaryTicketId !== 'string' || !ids.has(r.primaryTicketId))
      fail('MISSING_TICKET', r.designId);
    for (const id of [...(r.childTicketIds ?? []), ...(r.crossCuttingTicketIds ?? [])])
      if (!ids.has(id)) fail('MISSING_TICKET', `${r.designId} -> ${id}`);
    for (const p of r.referencePaths ?? []) checkPath(p);
  }
  for (const e of index.entries) {
    const original = baselineIndex?.entries.find((b) => b.id === e.id);
    if (
      baselineIndex &&
      (!original || !isDeepStrictEqual(original.referencePaths, e.referencePaths))
    )
      fail('SOURCE_INDEX_CHANGED', e.id);
    const r = owners.get(e.id);
    if (!r) fail('UNOWNED_PRIMARY', e.id);
    else if (
      e.ticketId !== r.primaryTicketId ||
      !isDeepStrictEqual(e.referencePaths, r.referencePaths)
    )
      fail('INDEX_DRIFT', e.id);
    if (e.status === 'hold' && r?.releaseState !== 'HOLD') fail('MISSING_HOLD', e.id);
    if (r) {
      const m = metadata.get(r.primaryTicketId);
      if (!m || m.releaseState !== r.releaseState) fail('OWNER_STATE', e.id);
    }
  }
  if (owners.size !== index.entries.length) fail('PRIMARY_CENSUS', 'index/coverage differ');
  const expectedStages = Array.from({ length: 14 }, (_, i) => String(i).padStart(2, '0'));
  const stageSet = new Set(c.stages.map((s) => s.stage?.slice(0, 2)));
  if (stageSet.size !== 14 || expectedStages.some((s) => !stageSet.has(s)))
    fail('MISSING_STAGE', 'expected 00–13');
  const refs = new Map();
  for (const r of c.referenceMappings) {
    if (refs.has(r.path)) fail('DUPLICATE_REFERENCE', r.path);
    refs.set(r.path, r);
    checkPath(r.path);
    if (!TYPES.has(r.referenceType)) fail('UNCLASSIFIED_IMAGE', r.path);
    if (r.path.includes('/archive/')) {
      if (r.referenceType !== 'ARCHIVED_LEGACY' || r.primaryTicketId !== null)
        fail('ARCHIVE_CANONICAL', r.path);
    } else {
      assertOwner(r.primaryTicketId, r.releaseState, r.path);
      if (r.referenceType === 'ARCHIVED_LEGACY') fail('ARCHIVE_MISCLASSIFIED', r.path);
      if (!ids.has(r.primaryTicketId)) fail('MISSING_TICKET', r.path);
      if (/\.(png|jpe?g)$/i.test(r.path) && r.referenceType === 'NON_IMPLEMENTATION_REFERENCE')
        fail('UNCLASSIFIED_IMAGE', r.path);
      if (/\/01-IMPLEMENTATION-ORDER\/0[567]-/.test(r.path) && r.releaseState !== 'HOLD')
        fail('MISSING_HOLD', r.path);
    }
  }
  const approvedImages = files.filter((p) => /\.(png|jpe?g)$/i.test(p) && !p.includes('/archive/'));
  for (const p of approvedImages) if (!refs.has(p)) fail('UNCLASSIFIED_IMAGE', p);
  const canonical = files.filter((p) => p.startsWith('design/canonical/'));
  for (const p of canonical) if (!refs.has(p)) fail('UNMAPPED_CANONICAL', p);
  const pageSeen = new Set();
  for (const r of c.pageRecords) {
    if (pageSeen.has(r.referencePath)) fail('DUPLICATE_PRIMARY_OWNER', r.referencePath);
    pageSeen.add(r.referencePath);
    checkPath(r.referencePath);
    if (!ids.has(r.primaryTicketId)) fail('MISSING_TICKET', r.referencePath);
    assertOwner(r.primaryTicketId, r.releaseState, r.referencePath);
    const reference = refs.get(r.referencePath);
    if (
      !reference ||
      reference.primaryTicketId !== r.primaryTicketId ||
      reference.releaseState !== r.releaseState
    )
      fail('PAGE_OWNER_DRIFT', r.referencePath);
    if (/\/01-IMPLEMENTATION-ORDER\/0[567]-/.test(r.referencePath) && r.releaseState !== 'HOLD')
      fail('MISSING_HOLD', r.referencePath);
  }
  for (const p of approvedImages.filter((p) => p.includes('/01-IMPLEMENTATION-ORDER/')))
    if (!pageSeen.has(p)) fail('UNOWNED_PAGE', p);
  const visiting = new Set(),
    visited = new Set();
  function visit(id) {
    if (visiting.has(id)) {
      fail('DEPENDENCY_CYCLE', id);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const deps = new Set([
      ...(ids.get(id)?.dependencies ?? []),
      ...(metadata.get(id)?.dependencies ?? []),
    ]);
    for (const d of deps) if (ids.has(d)) visit(d);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids.keys()) visit(id);
  for (const stage of c.stages) {
    const owner = metadata.get(stage.primaryTicketId);
    if (!owner || owner.releaseState !== stage.releaseState) fail('OWNER_STATE', stage.stage);
    if (
      /^0[567]-/.test(stage.stage) &&
      (stage.releaseState !== 'HOLD' || owner?.releaseState !== 'HOLD')
    )
      fail('MISSING_HOLD', stage.stage);
  }
  const engineering = metadata.get(c.metadata?.engineeringFutureTicketId);
  if (
    !engineering ||
    engineering.releaseState !== 'FUTURE' ||
    !ids.get(engineering.ticketId)?.title.includes('DESIGN-FIRST')
  )
    fail('ENGINEERING_SCOPE', 'missing future design-first ticket');
  const metrics = {
    designIndexRecords: index.entries.length,
    primaryRecordsMapped: owners.size,
    approvedImagesClassified: approvedImages.filter((p) => refs.has(p)).length,
    approvedImages: approvedImages.length,
    canonicalReferences: canonical.length,
    newTickets: backlog.items.filter((t) => !oldIds.has(t.id)).length,
    reusedTickets: c.tickets.filter((t) => oldIds.has(t.ticketId)).length,
    finalTickets: backlog.items.length,
    highestId: highest,
    epics: c.epics.length,
    stages: stageSet.size,
    orderedPageRecords: pageSeen.size,
    holdRecords: c.designRecords.filter((r) => r.releaseState === 'HOLD').length,
  };
  for (const key of [
    'designIndexRecords',
    'primaryRecordsMapped',
    'approvedImagesClassified',
    'newTickets',
    'reusedTickets',
  ])
    if (c.coverageSummary?.[key] !== metrics[key]) fail('SUMMARY_DRIFT', key);
  return { errors, metrics };
}

export function loadCoverage(root = process.cwd()) {
  const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
  const coverage = read('.ai/design-ticket-coverage.json');
  const baseline = JSON.parse(
    execFileSync('git', ['show', `${coverage.sourceDesignCommit}:.ai/backlog.json`], {
      cwd: root,
      encoding: 'utf8',
    }),
  );
  const files = [];
  function walk(dir) {
    for (const e of readdirSync(resolve(root, dir), { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) files.push(p);
    }
  }
  walk('design');
  return {
    coverage,
    index: read('design/DESIGN-INDEX.json'),
    backlog: read('.ai/backlog.json'),
    baseline,
    baselineIndex: JSON.parse(
      execFileSync('git', ['show', `${coverage.sourceDesignCommit}:design/DESIGN-INDEX.json`], {
        cwd: root,
        encoding: 'utf8',
      }),
    ),
    files,
    exists: (p) => {
      const rel = relative(root, resolve(root, p));
      return !rel.startsWith('..') && !isAbsolute(rel) && existsSync(resolve(root, p));
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateCoverage(loadCoverage());
    if (result.errors.length) {
      console.error(result.errors.join('\n'));
      process.exitCode = 1;
    } else
      process.stdout.write(JSON.stringify({ status: 'PASS', ...result.metrics }, null, 2) + '\n');
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
