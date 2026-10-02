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
  'PRIMARY_SCREEN_REFERENCE',
  'FULL_REFERENCE_BOARD',
  'GLOBAL_LOADING_REFERENCE',
  'SYSTEM_REFERENCE_BOARD',
  'ENGINEERING_CONTRACT',
]);
export const SCREEN_COUNTS = Object.freeze({
  '01-marketing-public': 8,
  '02-auth': 2,
  '03-onboarding': 1,
  '04-candidate-core': 18,
  '05-interview': 10,
  '06-courses-certifications': 4,
  '07-connectors-connected-accounts': 15,
  '08-ai-integration': 3,
  '09-recruiter': 16,
  '10-admin': 14,
  '11-admin-production-operations': 16,
  '12-global-ux-system-states': 20,
});
const ORDERED = 'design/01-IMPLEMENTATION-ORDER/';
const SURFACE_AUDIT_BASELINE = 'f18c7951c84b9712794b3b4983c7023cc7dc88ef';
const imagePath = (p) => /\.(png|jpe?g)$/i.test(p);
const screenPath = (p) =>
  p.startsWith(ORDERED) &&
  imagePath(p) &&
  !p.startsWith(ORDERED + '00-') &&
  !p.endsWith('/00-full-reference-board.png');
const SCREEN_TYPES = new Set([
  'ROUTE_PAGE',
  'STATE',
  'VARIANT',
  'RESPONSIVE_VARIANT',
  'FLOW_STEP',
  'COMPONENT_SYSTEM',
  'ADMIN_SURFACE',
  'OTHER',
]);
const ROUTE_STATES = new Set([
  'EXISTS',
  'EXISTING',
  'PLANNED',
  'FUTURE',
  'UNKNOWN',
  'NOT_APPLICABLE',
]);
// Board panel membership is content-audited; a ticket or recursive directory is
// not sufficient evidence of which panels a combined board actually contains.
function boardComponents(path, screens) {
  if (path.includes('candidate-verification'))
    return screens.filter(
      (s) =>
        s.referencePath.includes('/11-candidate-verification/') ||
        s.referencePath.includes('/11-candidate-verification-admin/'),
    );
  if (
    /careerscope-(?:ai-apply-assistant|application-details|settings-resume-management)-reference-board/.test(
      path,
    )
  )
    return screens.filter(
      (s) =>
        s.stage === '04-candidate-core' &&
        ['CS-143', 'CS-144', 'CS-130', 'CS-145'].includes(s.primaryTicketId),
    );
  if (path.includes('product-pages-reference-board'))
    return screens.filter(
      (s) =>
        s.stage === '04-candidate-core' &&
        ['CS-141', 'CS-142', 'CS-143', 'CS-144', 'CS-130', 'CS-145', 'CS-146', 'CS-147'].includes(
          s.primaryTicketId,
        ) &&
        s.variantType !== 'VARIANT',
    );
  if (path.endsWith('/00-full-reference-board.png'))
    return screens.filter(
      (s) =>
        s.referencePath.slice(0, s.referencePath.lastIndexOf('/')) ===
        path.slice(0, path.lastIndexOf('/')),
    );
  const stage = path.includes('admin-control-plane')
    ? '10-admin'
    : path.includes('production-operations')
      ? '11-admin-production-operations'
      : path.includes('connected-accounts')
        ? '07-connectors-connected-accounts'
        : path.includes('ai-interview')
          ? '05-interview'
          : path.includes('courses-certifications')
            ? '06-courses-certifications'
            : path.includes('recruiter-workspace')
              ? '09-recruiter'
              : path.includes('public-marketing')
                ? '01-marketing-public'
                : null;
  return screens.filter(
    (s) => s.stage === stage && !s.referencePath.includes('/11-candidate-verification-admin/'),
  );
}
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
  planningBaseline,
  planningCoverage,
  migration,
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
    !Array.isArray(c.stageRecords) ||
    !Array.isArray(c.tickets) ||
    !Array.isArray(c.referenceMappings) ||
    !Array.isArray(c.screenRecords) ||
    !Array.isArray(c.fullReferenceBoards) ||
    !Array.isArray(c.foundationReferences) ||
    !Array.isArray(c.engineeringContracts) ||
    !Array.isArray(c.stages) ||
    !Array.isArray(c.epics) ||
    !Array.isArray(index.entries) ||
    !Array.isArray(index.stages) ||
    !Array.isArray(index.fullReferenceBoards) ||
    !Array.isArray(index.foundationReferences) ||
    !Array.isArray(index.engineeringContracts) ||
    !Array.isArray(baselineIndex?.entries) ||
    !Array.isArray(files) ||
    !Array.isArray(baseline?.items) ||
    !Array.isArray(planningBaseline?.items) ||
    !Array.isArray(planningCoverage?.pageRecords) ||
    !Array.isArray(planningCoverage?.referenceMappings) ||
    typeof exists !== 'function'
  ) {
    return { errors: ['MALFORMED: required planning data missing'], metrics: null };
  }
  for (const records of [
    backlog.items,
    c.stageRecords,
    c.tickets,
    c.referenceMappings,
    c.screenRecords,
    c.fullReferenceBoards,
    c.foundationReferences,
    c.engineeringContracts,
    c.stages,
    c.epics,
    index.entries,
    index.stages,
  ]) {
    if (records.some((r) => !r || typeof r !== 'object' || Array.isArray(r)))
      return { errors: ['MALFORMED: invalid record'], metrics: null };
  }
  const ids = new Map();
  for (const t of backlog.items) {
    if (!/^CS-[1-9]\d*$/.test(t?.id)) fail('INVALID_ID', t?.id);
    if (ids.has(t?.id)) fail('DUPLICATE_ID', t.id);
    ids.set(t?.id, t);
  }
  const highest = Math.max(0, ...backlog.items.map((t) => Number(t?.id?.slice(3)) || 0));
  for (let n = 1; n <= highest; n++) if (!ids.has(`CS-${n}`)) fail('ID_GAP', `CS-${n}`);
  if (!migration)
    for (const t of baseline.items)
      if (!isDeepStrictEqual(t, ids.get(t.id))) fail('BASELINE_CHANGED', t.id);
  if (
    c.metadata.surfaceAuditBaselineCommit !== SURFACE_AUDIT_BASELINE ||
    (!migration && !isDeepStrictEqual(backlog, planningBaseline))
  )
    fail(
      'PLANNING_BASELINE_CHANGED',
      'the surface audit must preserve all 216 ticket objects and workflow statuses',
    );
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
      if (!migration && t.status !== 'DISCOVERY') fail('PREMATURE_STATUS', t.id);
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
  for (const r of c.stageRecords) {
    if (owners.has(r.designId)) fail('DUPLICATE_PRIMARY_OWNER', r.designId);
    owners.set(r.designId, r);
    if (typeof r.primaryTicketId !== 'string' || !ids.has(r.primaryTicketId))
      fail('MISSING_TICKET', r.designId);
    for (const id of [...(r.childTicketIds ?? []), ...(r.crossCuttingTicketIds ?? [])])
      if (!ids.has(id)) fail('MISSING_TICKET', `${r.designId} -> ${id}`);
    for (const p of r.referencePaths ?? []) checkPath(p);
  }
  for (const e of index.stages) {
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
  if (owners.size !== index.stages.length) fail('STAGE_CENSUS', 'index/coverage differ');
  if (
    !isDeepStrictEqual(
      index.stages.map((s) => s.id),
      baselineIndex.entries.map((s) => s.id),
    )
  )
    fail('STAGE_CENSUS', 'stage summaries must preserve the Phase 0 identities and order');
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
      assertOwner(r.primaryTicketId, r.ownerReleaseState ?? r.releaseState, r.path);
      if (!STATES.has(r.releaseState)) fail('RELEASE_STATE', r.path);
      if (r.referenceType === 'ARCHIVED_LEGACY') fail('ARCHIVE_MISCLASSIFIED', r.path);
      if (!ids.has(r.primaryTicketId)) fail('MISSING_TICKET', r.path);
      if (/\.(png|jpe?g)$/i.test(r.path) && r.referenceType === 'NON_IMPLEMENTATION_REFERENCE')
        fail('UNCLASSIFIED_IMAGE', r.path);
      if (/\/01-IMPLEMENTATION-ORDER\/0[567]-/.test(r.path) && r.releaseState !== 'HOLD')
        fail('MISSING_HOLD', r.path);
    }
  }
  const approvedImages = files.filter((p) => /\.(png|jpe?g)$/i.test(p) && !p.includes('/archive/'));
  if (approvedImages.length !== 345)
    fail('APPROVED_IMAGE_CENSUS', 'exactly 345 approved source images required');
  for (const r of planningCoverage.referenceMappings)
    if (!files.includes(r.path)) fail('SOURCE_CENSUS_CHANGED', r.path);
  for (const p of approvedImages) if (!refs.has(p)) fail('UNCLASSIFIED_IMAGE', p);
  const canonical = files.filter((p) => p.startsWith('design/canonical/'));
  for (const p of canonical) if (!refs.has(p)) fail('UNMAPPED_CANONICAL', p);
  const pageSeen = new Set();
  for (const r of c.screenRecords) {
    if (pageSeen.has(r.referencePath)) fail('DUPLICATE_PRIMARY_OWNER', r.referencePath);
    pageSeen.add(r.referencePath);
    checkPath(r.referencePath);
    if (!ids.has(r.primaryTicketId)) fail('MISSING_TICKET', r.referencePath);
    assertOwner(r.primaryTicketId, r.ownerReleaseState ?? r.releaseState, r.referencePath);
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
  for (const p of approvedImages.filter(screenPath)) if (!pageSeen.has(p)) fail('UNOWNED_PAGE', p);
  const actualScreens = approvedImages.filter(screenPath);
  const screenIds = new Map(c.screenRecords.map((r) => [r.designId, r]));
  if (screenIds.size !== c.screenRecords.length) fail('DUPLICATE_SCREEN_ID', 'screen identities');
  const perStage = {};
  for (const [stage, expected] of Object.entries(SCREEN_COUNTS)) {
    const paths = actualScreens.filter((p) => p.split('/')[2] === stage);
    const mapped = c.screenRecords.filter((r) => r.stage === stage);
    perStage[stage] = { expected, files: paths.length, mapped: mapped.length };
    if (paths.length !== expected || mapped.length !== expected)
      fail(
        'SCREEN_STAGE_CENSUS',
        `${stage}: expected ${expected}, files ${paths.length}, mapped ${mapped.length}`,
      );
  }
  if (actualScreens.length !== 127 || c.screenRecords.length !== 127)
    fail('SCREEN_CENSUS', 'exactly 127 ordered screens required');
  for (const r of c.screenRecords) {
    const p = r.referencePath,
      m = metadata.get(r.primaryTicketId);
    if (
      planningCoverage.pageRecords.find((original) => original.referencePath === p)
        ?.primaryTicketId !== r.primaryTicketId
    )
      fail('SCREEN_OWNER_CHANGED', p);
    if (!actualScreens.includes(p) || r.stage !== p.split('/')[2]) fail('SCREEN_PATH_MISMATCH', p);
    for (const field of [
      'designId',
      'stage',
      'area',
      'surface',
      'surfaceGroupId',
      'variantType',
      'routeState',
    ])
      if (typeof r[field] !== 'string' || !r[field].trim()) fail('SCREEN_FIELD', `${p}.${field}`);
    for (const field of [
      'childTicketIds',
      'crossCuttingTicketIds',
      'notes',
      'dependencies',
      'acceptanceEvidenceRequirements',
    ])
      if (!Array.isArray(r[field])) fail('SCREEN_FIELD', `${p}.${field}`);
    for (const id of [
      ...(r.childTicketIds ?? []),
      ...(r.crossCuttingTicketIds ?? []),
      ...(r.dependencies ?? []),
    ])
      if (!ids.has(id)) fail('MISSING_TICKET', `${p} -> ${id}`);
    if (
      r.referenceRole !== 'PRIMARY_SCREEN_REFERENCE' ||
      r.designId === r.stage ||
      r.surface === r.stage ||
      !SCREEN_TYPES.has(r.variantType)
    )
      fail('STAGE_ONLY_MAPPING', p);
    if (
      !ROUTE_STATES.has(r.routeState) ||
      !isDeepStrictEqual(r.route, m?.route) ||
      r.routeState !== r.route?.state
    )
      fail('SCREEN_ROUTE_DRIFT', p);
    if (r.variantType === 'ROUTE_PAGE' && r.routeState === 'NOT_APPLICABLE')
      fail('SCREEN_ROUTE_DRIFT', p);
    if (r.baseScreenId) {
      const base = screenIds.get(r.baseScreenId);
      if (
        !base ||
        base.designId === r.designId ||
        base.surfaceGroupId !== r.surfaceGroupId ||
        base.stage !== r.stage
      )
        fail('SCREEN_GROUP_DRIFT', p);
    } else if (r.variantType === 'VARIANT') fail('SCREEN_GROUP_DRIFT', p);
    if (r.designId === 'auth-sign-in' && (r.routeState !== 'EXISTING' || r.route.path !== '/'))
      fail('SCREEN_ROUTE_DRIFT', p);
    if (
      r.designId === 'candidate-core-application-details' &&
      (r.variantType !== 'STATE' || r.baseScreenId !== 'candidate-core-applications')
    )
      fail('SCREEN_ROUTE_DRIFT', p);
    if (
      r.designId === 'connectors-connected-accounts-mobile-connected-accounts' &&
      (r.variantType !== 'RESPONSIVE_VARIANT' ||
        r.baseScreenId !== 'connectors-connected-accounts-connected-accounts-user')
    )
      fail('SCREEN_GROUP_DRIFT', p);
    const dependencies = [
      ...new Set([...(m?.dependencies ?? []), ...(ids.get(r.primaryTicketId)?.dependencies ?? [])]),
    ];
    if (
      !isDeepStrictEqual(r.dependencies, dependencies) ||
      !isDeepStrictEqual(r.acceptanceEvidenceRequirements, m?.testRequirements)
    )
      fail('SCREEN_CONTRACT_DRIFT', p);
    if (!STATES.has(r.releaseState)) fail('RELEASE_STATE', p);
    if (/^0[567]-/.test(r.stage) && r.releaseState !== 'HOLD') fail('MISSING_HOLD', p);
    if (/^(09|10|11)-/.test(r.stage) && r.releaseState !== 'FUTURE')
      fail('SCREEN_PRIVILEGED_SCOPE', p);
    if (r.releaseState !== 'RELEASE' && !r.holdReason) fail('SCREEN_ACTIVATION_GATE', p);
    if (
      m &&
      r.releaseState !== m.releaseState &&
      !(
        r.stage === '11-admin-production-operations' &&
        r.releaseState === 'FUTURE' &&
        m.releaseState === 'RELEASE' &&
        r.ownerReleaseState === m.releaseState &&
        r.notes?.length >= 2
      )
    )
      fail('OWNER_STATE', p);
    const reference = refs.get(p);
    if (
      !reference ||
      reference.referenceType !== 'PRIMARY_SCREEN_REFERENCE' ||
      reference.referenceRole !== r.referenceRole ||
      !isDeepStrictEqual(reference.screenDesignIds, [r.designId]) ||
      reference.stage !== r.stage
    )
      fail('STAGE_ONLY_MAPPING', p);
  }
  if (!isDeepStrictEqual(index.entries, c.screenRecords))
    fail('SCREEN_INDEX_DRIFT', 'index.entries / coverage.screenRecords');
  const checkContexts = (records, indexRecords, expectedPaths, role, code) => {
    if (!isDeepStrictEqual(records, indexRecords)) fail('CONTEXT_INDEX_DRIFT', role);
    const seen = new Set();
    for (const r of records) {
      if (seen.has(r.referencePath)) fail('DUPLICATE_REFERENCE', r.referencePath);
      seen.add(r.referencePath);
      checkPath(r.referencePath);
      if (!expectedPaths.includes(r.referencePath)) fail(code, r.referencePath);
      const ref = refs.get(r.referencePath);
      if (
        !ids.has(r.primaryTicketId) ||
        !ref ||
        ref.primaryTicketId !== r.primaryTicketId ||
        ref.referenceRole !== r.referenceRole ||
        ref.releaseState !== r.releaseState
      )
        fail(code, r.referencePath);
      if (role === 'FULL_REFERENCE_BOARD') {
        if (
          r.referenceRole !== role ||
          !epicIds.has(r.epicId) ||
          !r.componentScreenIds?.length ||
          r.componentScreenIds.some((id) => !screenIds.has(id))
        )
          fail(code, r.referencePath);
        const components = boardComponents(r.referencePath, c.screenRecords).map((s) => s.designId);
        if (
          !isDeepStrictEqual(r.componentScreenIds, components) ||
          !isDeepStrictEqual(ref?.screenDesignIds, r.componentScreenIds)
        )
          fail(code, r.referencePath);
      } else if (role === 'ENGINEERING_CONTRACT') {
        if (
          r.referenceRole !== role ||
          !r.linkedTicketIds?.includes(r.primaryTicketId) ||
          r.linkedTicketIds.some((id) => !ids.has(id))
        )
          fail(code, r.referencePath);
      } else if (
        ![
          'BRAND_REFERENCE',
          'FOUNDATION_REFERENCE',
          'GLOBAL_LOADING_REFERENCE',
          'SYSTEM_REFERENCE_BOARD',
        ].includes(r.referenceRole)
      )
        fail(code, r.referencePath);
    }
    for (const p of expectedPaths) if (!seen.has(p)) fail(code, p);
  };
  const foundationPaths = approvedImages.filter((p) => p.startsWith(ORDERED + '00-'));
  const boardPaths = approvedImages.filter(
    (p) =>
      p.endsWith('/00-full-reference-board.png') ||
      (/reference-board/.test(p) && !/final-ux-foundations/.test(p)),
  );
  const contractPaths = files.filter(
    (p) => p.startsWith(ORDERED + '13-engineering-contracts/') && p.endsWith('.md'),
  );
  checkContexts(
    c.foundationReferences,
    index.foundationReferences,
    foundationPaths,
    'FOUNDATION_REFERENCE',
    'UNMAPPED_FOUNDATION',
  );
  checkContexts(
    c.fullReferenceBoards,
    index.fullReferenceBoards,
    boardPaths,
    'FULL_REFERENCE_BOARD',
    'UNMAPPED_BOARD',
  );
  checkContexts(
    c.engineeringContracts,
    index.engineeringContracts,
    contractPaths,
    'ENGINEERING_CONTRACT',
    'UNMAPPED_CONTRACT',
  );
  for (const p of approvedImages) {
    const r = refs.get(p);
    if (!r || !r.area || !r.stage || !r.referenceRole) fail('IMAGE_TRACEABILITY', p);
    else if (!screenPath(p) && !boardPaths.includes(p) && !foundationPaths.includes(p)) {
      if (r.referenceRole === 'SUPPORTING_FOUNDATION_REFERENCE') {
        if (
          !r.foundationDesignIds?.length ||
          r.foundationDesignIds.some((id) => !c.foundationReferences.some((f) => f.designId === id))
        )
          fail('STAGE_ONLY_MAPPING', p);
      } else if (!r.screenDesignIds?.length || r.screenDesignIds.some((id) => !screenIds.has(id)))
        fail('STAGE_ONLY_MAPPING', p);
    }
  }
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
    const summary = c.stageRecords.find((s) => s.stage === stage.stage);
    if (
      !summary ||
      summary.primaryTicketId !== stage.primaryTicketId ||
      summary.releaseState !== stage.releaseState
    )
      fail('STAGE_CENSUS', stage.stage);
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
    designStageRecords: index.stages.length,
    orderedScreenReferenceRecords: actualScreens.length,
    orderedScreenReferenceRecordsMapped: pageSeen.size,
    foundationReferenceRecords: foundationPaths.length,
    fullReferenceBoardRecords: boardPaths.length,
    engineeringContractRecords: contractPaths.length,
    perStage,
    approvedImagesClassified: approvedImages.filter((p) => refs.has(p)).length,
    approvedImages: approvedImages.length,
    canonicalReferences: canonical.length,
    newTickets: backlog.items.filter((t) => !oldIds.has(t.id)).length,
    reusedTickets: c.tickets.filter((t) => oldIds.has(t.ticketId)).length,
    finalTickets: backlog.items.length,
    highestId: highest,
    epics: c.epics.length,
    stages: stageSet.size,
    holdStageRecords: c.stageRecords.filter((r) => r.releaseState === 'HOLD').length,
  };
  for (const key of [
    'designStageRecords',
    'orderedScreenReferenceRecords',
    'orderedScreenReferenceRecordsMapped',
    'foundationReferenceRecords',
    'fullReferenceBoardRecords',
    'engineeringContractRecords',
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
    migration: existsSync(resolve(root, '.ai/workflow-migration.json'))
      ? read('.ai/workflow-migration.json')
      : null,
    baseline,
    planningBaseline: JSON.parse(
      execFileSync('git', ['show', `${SURFACE_AUDIT_BASELINE}:.ai/backlog.json`], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 4000000,
      }),
    ),
    planningCoverage: JSON.parse(
      execFileSync('git', ['show', `${SURFACE_AUDIT_BASELINE}:.ai/design-ticket-coverage.json`], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 4000000,
      }),
    ),
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
