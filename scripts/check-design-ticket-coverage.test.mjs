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
    'conflicting page owner',
    'PAGE_OWNER_DRIFT',
    (f) => {
      f.coverage.pageRecords[0].primaryTicketId = 'CS-130';
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
      f.index.entries[0].referencePaths = [];
    },
  ],
  [
    'missing ticket',
    'MISSING_TICKET',
    (f) => {
      f.coverage.designRecords[0].primaryTicketId = 'CS-99999';
    },
  ],
  [
    'duplicate primary owner',
    'DUPLICATE_PRIMARY_OWNER',
    (f) => {
      f.coverage.designRecords.push(structuredClone(f.coverage.designRecords[0]));
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
      f.coverage.designRecords.find((r) => r.releaseState === 'HOLD').releaseState = 'RELEASE';
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
