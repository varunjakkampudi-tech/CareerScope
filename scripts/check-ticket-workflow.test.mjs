import test from 'node:test';
import assert from 'node:assert/strict';
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
