import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  isTicketStatus,
  isForwardTransitionAllowed,
  isReworkTransitionAllowed,
  assertTicketWorkflow,
  acceptanceCriteriaHashMatches,
} from './lib/ticket-workflow.mjs';

test('canonical statuses and transitions', () => {
  assert.equal(isTicketStatus('BLOCKED'), false);
  assert.equal(isForwardTransitionAllowed('QA', 'UAT'), true);
  assert.equal(isForwardTransitionAllowed('TODO', 'QA'), false);
  assert.equal(isReworkTransitionAllowed('UAT', 'QA'), true);
  assert.equal(isReworkTransitionAllowed('PROD', 'QA'), false);
});
test('blocked metadata is orthogonal and required', () => {
  assert.throws(() =>
    assertTicketWorkflow({
      id: 'X',
      status: 'UAT',
      blocked: true,
      blockedReason: null,
      blockedOwner: null,
      blockedSince: null,
      unblockEvidenceRequired: [],
    }),
  );
  assert.equal(
    assertTicketWorkflow({
      id: 'X',
      status: 'UAT',
      blocked: false,
      blockedReason: null,
      blockedOwner: null,
      blockedSince: null,
      unblockEvidenceRequired: [],
    }),
    true,
  );
});

test('blockedSince accepts only UTC ISO timestamps', () => {
  const base = {
    id: 'X',
    status: 'QA',
    blocked: true,
    blockedReason: 'External validation',
    blockedOwner: 'operator',
    unblockEvidenceRequired: ['Hosted evidence'],
  };
  assert.equal(assertTicketWorkflow({ ...base, blockedSince: '2026-10-02T10:20:30.000Z' }), true);
  assert.throws(() => assertTicketWorkflow({ ...base, blockedSince: '2026-10-02' }));
  assert.throws(() => assertTicketWorkflow({ ...base, blockedSince: '2026-10-02T10:20:30+05:30' }));
  assert.throws(() => assertTicketWorkflow({ ...base, blockedSince: null }));
  assert.equal(
    assertTicketWorkflow(
      { ...base, blockedSince: null },
      { allowHistoricalBlockedSinceNull: true },
    ),
    true,
  );
});

test('canonical migration rerun is a no-op', () => {
  const files = ['.ai/backlog.json', '.ai/workflow-migration.json'];
  const before = files.map((file) =>
    execFileSync('git', ['diff', '--', file], { encoding: 'utf8' }),
  );
  const output = execFileSync(process.execPath, ['scripts/migrate-ticket-workflow.mjs'], {
    encoding: 'utf8',
  });
  assert.match(output, /"status":"NO-OP"/);
  assert.deepEqual(
    files.map((file) => execFileSync('git', ['diff', '--', file], { encoding: 'utf8' })),
    before,
    'migration no-op must not rewrite current source/provenance files',
  );
});

test('only the exact owner-approved CS-80 AC3 amendment is accepted after migration', () => {
  const previousAcceptanceCriteriaHash =
    '2c20cd612efbb6bc030114f3647fef1e97a6aeaeb3a2d861f67023e9e90727df';
  const amendedAcceptanceCriteriaHash =
    '32a705b339219358468b6f8e49ee056c4a81e0d91e48219dcb768407c554eb28';
  const record = {
    ticketId: 'CS-80',
    acceptanceCriteriaHash: previousAcceptanceCriteriaHash,
    acceptanceCriteriaAmendments: [
      {
        decisionId: 'OD-2026-10-07-CS80-AC3',
        criterionId: 'CS-80-AC3',
        previousAcceptanceCriteriaHash,
        amendedAcceptanceCriteriaHash,
        source: 'docs/OWNER-DECISIONS-2026-10-02.md#OD-2026-10-07-CS80-AC3',
        scope:
          'Narrow deterministic Phase 3.25 generated-artifact exception on phase-3.25/cloud-continuation; no main integration authorization.',
      },
    ],
  };
  assert.equal(acceptanceCriteriaHashMatches(record, amendedAcceptanceCriteriaHash), true);
  assert.equal(
    acceptanceCriteriaHashMatches(
      {
        ...record,
        acceptanceCriteriaAmendments: [
          { ...record.acceptanceCriteriaAmendments[0], scope: 'broad' },
        ],
      },
      previousAcceptanceCriteriaHash,
    ),
    false,
    'malformed amendments remain invalid even if the historical hash is supplied',
  );
  assert.equal(
    acceptanceCriteriaHashMatches({ ...record, ticketId: 'CS-81' }, amendedAcceptanceCriteriaHash),
    false,
  );
  assert.equal(acceptanceCriteriaHashMatches(record, '0'.repeat(64)), false);
  assert.equal(
    acceptanceCriteriaHashMatches(
      {
        ...record,
        acceptanceCriteriaAmendments: [
          { ...record.acceptanceCriteriaAmendments[0], scope: 'broad' },
        ],
      },
      amendedAcceptanceCriteriaHash,
    ),
    false,
  );
  assert.equal(
    acceptanceCriteriaHashMatches(
      { ...record, acceptanceCriteriaAmendments: [...record.acceptanceCriteriaAmendments, {}] },
      amendedAcceptanceCriteriaHash,
    ),
    false,
  );
});
