import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  isTicketStatus,
  isForwardTransitionAllowed,
  isReworkTransitionAllowed,
  assertTicketWorkflow,
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
  const output = execFileSync(process.execPath, ['scripts/migrate-ticket-workflow.mjs'], {
    encoding: 'utf8',
  });
  assert.match(output, /"status":"NO-OP"/);
});
