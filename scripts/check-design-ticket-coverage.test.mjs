import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCoverage, validateCoverage } from './check-design-ticket-coverage.mjs';

function fixture() {
  const source = loadCoverage();
  return { ...structuredClone({ ...source, exists: undefined }), exists: source.exists };
}
test('current complete planning data passes without modifying canonical files', () => {
  assert.deepEqual(validateCoverage(fixture()).errors, []);
});
const cases = [
  [
    'approved source image silently removed',
    'APPROVED_IMAGE_CENSUS',
    (f) => {
      const p = f.files.find((p) => p.startsWith('design/approved-images/') && p.endsWith('.png'));
      f.files = f.files.filter((file) => file !== p);
    },
  ],
  [
    'screen implementation owner changed',
    'SCREEN_OWNER_CHANGED',
    (f) => {
      f.coverage.screenRecords[0].primaryTicketId = 'CS-95';
    },
  ],
  [
    'sign-in downgraded to no route',
    'SCREEN_ROUTE_DRIFT',
    (f) => {
      const r = f.coverage.screenRecords.find((r) => r.designId === 'auth-sign-in');
      r.routeState = 'NOT_APPLICABLE';
      r.route = { state: 'NOT_APPLICABLE', path: null, evidence: 'no route' };
    },
  ],
  [
    'application panel reported as a route',
    'SCREEN_ROUTE_DRIFT',
    (f) => {
      f.coverage.screenRecords.find(
        (r) => r.designId === 'candidate-core-application-details',
      ).variantType = 'ROUTE_PAGE';
    },
  ],
  [
    'mobile variant isolated from desktop group',
    'SCREEN_GROUP_DRIFT',
    (f) => {
      f.coverage.screenRecords.find(
        (r) => r.designId === 'connectors-connected-accounts-mobile-connected-accounts',
      ).surfaceGroupId = 'surface-cs-169';
    },
  ],
  [
    'canonical combined board missing admin panel with synchronized mirrors',
    'UNMAPPED_BOARD',
    (f) => {
      const path =
        'design/canonical/candidate-verification/careerscope-candidate-verification-reference-board.png';
      const r = f.coverage.fullReferenceBoards.find((r) => r.referencePath === path);
      r.componentScreenIds = r.componentScreenIds.filter(
        (id) => !id.includes('admin-verification-queue'),
      );
      f.index.fullReferenceBoards.find((r) => r.referencePath === path).componentScreenIds =
        r.componentScreenIds;
      f.coverage.referenceMappings.find((r) => r.path === path).screenDesignIds =
        r.componentScreenIds;
    },
  ],
  [
    'planning ticket status changed',
    'PLANNING_BASELINE_CHANGED',
    (f) => {
      f.backlog.items.at(-1).status = 'READY';
    },
  ],
  [
    'malformed screen member',
    'MALFORMED',
    (f) => {
      f.coverage.screenRecords[0] = null;
    },
  ],
  [
    'stage summary identity omitted',
    'STAGE_CENSUS',
    (f) => {
      f.index.stages[1] = structuredClone(f.index.stages[0]);
    },
  ],
  [
    'missing ordered screen',
    'UNOWNED_PAGE',
    (f) => {
      f.coverage.screenRecords.pop();
    },
  ],
  [
    'duplicate screen path',
    'DUPLICATE_PRIMARY_OWNER',
    (f) => {
      f.coverage.screenRecords.push(structuredClone(f.coverage.screenRecords[0]));
    },
  ],
  [
    'nonexistent screen owner',
    'MISSING_TICKET',
    (f) => {
      f.coverage.screenRecords[0].primaryTicketId = 'CS-99999';
    },
  ],
  [
    'null screen owner',
    'MISSING_TICKET',
    (f) => {
      f.coverage.screenRecords[0].primaryTicketId = null;
    },
  ],
  [
    'screen missing release state',
    'RELEASE_STATE',
    (f) => {
      delete f.coverage.screenRecords[0].releaseState;
    },
  ],
  [
    'screen missing HOLD classification',
    'MISSING_HOLD',
    (f) => {
      f.coverage.screenRecords.find((r) => r.releaseState === 'HOLD').releaseState = 'RELEASE';
    },
  ],
  [
    'screen reference path mismatch',
    'SCREEN_PATH_MISMATCH',
    (f) => {
      f.coverage.screenRecords[0].referencePath = f.coverage.foundationReferences[0].referencePath;
    },
  ],
  [
    'screen stage count mismatch',
    'SCREEN_STAGE_CENSUS',
    (f) => {
      f.coverage.screenRecords[0].stage = '09-recruiter';
    },
  ],
  [
    'unmapped foundation',
    'UNMAPPED_FOUNDATION',
    (f) => {
      f.coverage.foundationReferences.pop();
    },
  ],
  [
    'unmapped full board',
    'UNMAPPED_BOARD',
    (f) => {
      f.coverage.fullReferenceBoards.pop();
    },
  ],
  [
    'unmapped engineering contract',
    'UNMAPPED_CONTRACT',
    (f) => {
      f.coverage.engineeringContracts.pop();
    },
  ],
  [
    'screen replaced by stage summary',
    'STAGE_ONLY_MAPPING',
    (f) => {
      const s = f.coverage.screenRecords[0];
      s.designId = s.stage;
      s.surface = s.stage;
      s.referenceRole = 'STAGE_SUMMARY';
    },
  ],
  [
    'supporting image only mapped to stage',
    'STAGE_ONLY_MAPPING',
    (f) => {
      const r = f.coverage.referenceMappings.find(
        (r) => r.referenceRole === 'SUPPORTING_SCREEN_REFERENCE',
      );
      delete r.screenDesignIds;
    },
  ],
  [
    'screen index drift',
    'SCREEN_INDEX_DRIFT',
    (f) => {
      f.index.entries[0].primaryTicketId = 'CS-99999';
    },
  ],
  [
    'empty screen census',
    'SCREEN_CENSUS',
    (f) => {
      f.coverage.screenRecords = [];
    },
  ],
  [
    'future admin composition promoted through shared primitive',
    'SCREEN_PRIVILEGED_SCOPE',
    (f) => {
      f.coverage.screenRecords.find(
        (r) => r.stage === '11-admin-production-operations' && r.ownerReleaseState === 'RELEASE',
      ).releaseState = 'RELEASE';
    },
  ],
  [
    'board component omission',
    'UNMAPPED_BOARD',
    (f) => {
      f.coverage.fullReferenceBoards
        .find((r) => r.referencePath.endsWith('/00-full-reference-board.png'))
        .componentScreenIds.pop();
    },
  ],
  [
    'screen route invented from reference',
    'SCREEN_ROUTE_DRIFT',
    (f) => {
      f.coverage.screenRecords[0].route.path = '/invented-route';
    },
  ],
  [
    'conflicting page owner',
    'PAGE_OWNER_DRIFT',
    (f) => {
      f.coverage.screenRecords[0].primaryTicketId = 'CS-130';
    },
  ],
  [
    'coordinated HOLD ticket promotion',
    'MISSING_HOLD',
    (f) => {
      const t = f.backlog.items.find((t) => t.id === 'CS-148');
      const m = f.coverage.tickets.find((t) => t.ticketId === t.id || t.ticketId === 'CS-148');
      t.releaseState = m.releaseState = 'RELEASE';
      delete m.featureFlag;
      delete m.holdReason;
    },
  ],
  [
    'reference release drift',
    'OWNER_STATE',
    (f) => {
      f.coverage.referenceMappings[0].releaseState = 'FUTURE';
    },
  ],
  [
    'source reference mutation',
    'SOURCE_INDEX_CHANGED',
    (f) => {
      f.index.stages[0].referencePaths = [];
    },
  ],
  [
    'missing ticket',
    'MISSING_TICKET',
    (f) => {
      f.coverage.stageRecords[0].primaryTicketId = 'CS-99999';
    },
  ],
  [
    'duplicate primary owner',
    'DUPLICATE_PRIMARY_OWNER',
    (f) => {
      f.coverage.stageRecords.push(structuredClone(f.coverage.stageRecords[0]));
    },
  ],
  [
    'missing design path',
    'MISSING_PATH',
    (f) => {
      f.coverage.tickets[0].designRefs.push('design/synthetic-missing.png');
    },
  ],
  [
    'invalid dependency',
    'INVALID_DEPENDENCY',
    (f) => {
      f.backlog.items.at(-1).dependencies.push('CS-99999');
    },
  ],
  [
    'dependency cycle',
    'DEPENDENCY_CYCLE',
    (f) => {
      const [a, b] = f.backlog.items.slice(-2);
      a.dependencies = [b.id];
      b.dependencies = [a.id];
    },
  ],
  [
    'unclassified approved image',
    'UNCLASSIFIED_IMAGE',
    (f) => {
      const p = f.files.find((p) => p.startsWith('design/canonical/') && p.endsWith('.png'));
      f.coverage.referenceMappings = f.coverage.referenceMappings.filter((r) => r.path !== p);
    },
  ],
  [
    'missing HOLD',
    'MISSING_HOLD',
    (f) => {
      f.coverage.stageRecords.find((r) => r.releaseState === 'HOLD').releaseState = 'RELEASE';
    },
  ],
  [
    'archived canonical image',
    'ARCHIVE_CANONICAL',
    (f) => {
      const r = f.coverage.referenceMappings.find((r) => r.referenceType === 'ARCHIVED_LEGACY');
      r.primaryTicketId = 'CS-95';
    },
  ],
  [
    'baseline evidence changed',
    'BASELINE_CHANGED',
    (f) => {
      f.backlog.items[0].evidence = [];
    },
  ],
  [
    'duplicate ticket ID',
    'DUPLICATE_ID',
    (f) => {
      f.backlog.items.push(structuredClone(f.backlog.items[0]));
    },
  ],
  [
    'ticket ID gap',
    'ID_GAP',
    (f) => {
      f.backlog.items = f.backlog.items.filter((t) => t.id !== 'CS-95');
    },
  ],
  [
    'false coverage summary',
    'SUMMARY_DRIFT',
    (f) => {
      f.coverage.coverageSummary.approvedImagesClassified = 1;
    },
  ],
  [
    'malformed input',
    'MALFORMED',
    (f) => {
      f.coverage.referenceMappings = null;
    },
  ],
];
for (const [name, code, mutate] of cases)
  test(`rejects ${name}`, () => {
    const f = fixture();
    mutate(f);
    const result = validateCoverage(f);
    assert.ok(
      result.errors.some((e) => e.startsWith(code + ':')),
      result.errors.join('\n'),
    );
  });
