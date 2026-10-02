import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPhase2Files, validateBlockerClassification } from './check-blocker-classification.mjs';

const base = () => {
  const value = loadPhase2Files();
  value.model = structuredClone(value.model);
  value.backlog = structuredClone(value.backlog);
  value.model.tickets = value.model.tickets.map((ticket) => ({ ...ticket }));
  value.model.hostpending = value.model.hostpending.map((item) => ({ ...item }));
  return value;
};

test('accepts the repository Phase 2 model and preserves Phase 1 coverage', () => {
  assert.deepEqual(validateBlockerClassification(base()), []);
});

test('rejects a missing blocker class', () => {
  const value = base();
  value.model.tickets.find((ticket) => ticket.blocked).primaryClass = null;
  assert.match(validateBlockerClassification(value).join('\n'), /invalid primaryClass/);
});

test('rejects an invalid blocker class', () => {
  const value = base();
  value.model.tickets.find((ticket) => ticket.blocked).primaryClass = 'B7';
  assert.match(validateBlockerClassification(value).join('\n'), /invalid primaryClass/);
});

test('rejects a ticket status change in the Phase 2 model', () => {
  const value = base();
  value.model.tickets[0].status = 'UAT';
  const original = value.backlog.items.find((item) => item.id === value.model.tickets[0].ticketId);
  original.status = 'BLOCKED';
  assert.match(validateBlockerClassification(value).join('\n'), /changed ticket status/);
});

test('rejects a manual blocker without a hostpending mapping', () => {
  const value = base();
  const ticket = value.model.tickets.find(
    (item) => item.primaryClass === 'B4_LIVE_HOST_OR_OPERATOR_EVIDENCE',
  );
  value.model.hostpending = value.model.hostpending.filter(
    (item) => item.ticketId !== ticket.ticketId,
  );
  assert.match(validateBlockerClassification(value).join('\n'), new RegExp(ticket.ticketId));
});

test('rejects an orphan hostpending mapping and heading', () => {
  const value = base();
  const orphan = { ...value.model.hostpending[0], ticketId: 'CS-999' };
  value.model.hostpending.push(orphan);
  value.hostpendingText += '\n### CS-999 — orphan\n\nmanual\n';
  assert.match(validateBlockerClassification(value).join('\n'), /orphan hostpending/);
});

test('rejects duplicate hostpending entries', () => {
  const value = base();
  value.model.hostpending.push({ ...value.model.hostpending[0] });
  assert.match(validateBlockerClassification(value).join('\n'), /duplicate hostpending mapping/);
});

test('rejects B2 code work incorrectly marked as manual', () => {
  const value = base();
  const ticket = value.model.tickets.find(
    (item) => item.primaryClass === 'B2_CODE_OR_ARCHITECTURE',
  );
  ticket.hostpending = true;
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /hostpending must match manual class/,
  );
});

test('rejects B1 resolution without its decision source', () => {
  const value = base();
  const ticket = value.model.tickets.find(
    (item) => item.primaryClass === 'B1_PRODUCT_OR_OWNER_DECISION',
  );
  ticket.resolutionType = 'OWNER_DECISION_RECORDED';
  ticket.decisionSource = 'stale decision';
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /active B1 has an existing decision source/,
  );
});

test('rejects an unresolved blocker without phase2Disposition', () => {
  const value = base();
  delete value.model.tickets.find((item) => item.blocked).phase2Disposition;
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /missing a valid phase2Disposition/,
  );
});

test('rejects B2 without a major-implementation disposition', () => {
  const value = base();
  const ticket = value.model.tickets.find(
    (item) => item.primaryClass === 'B2_CODE_OR_ARCHITECTURE',
  );
  ticket.phase2Disposition = 'WAITING_OWNER_DECISION';
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /unresolved B2 must be DEFERRED_MAJOR_IMPLEMENTATION/,
  );
});

test('rejects B3 without an explicit independent-review boundary', () => {
  const value = base();
  const ticket = value.model.tickets.find(
    (item) => item.primaryClass === 'B3_SECURITY_OR_SYSTEM_REVIEW',
  );
  delete ticket.reviewReason;
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /B3 requires an explicit unavailable-review reason/,
  );
});

test('rejects a hidden blocker without a promotion guard', () => {
  const value = base();
  delete value.model.tickets.find((item) => item.ticketId === 'CS-2').promotionGuard;
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /CS-2: hidden blocker has no promotionGuard/,
  );
});

test('rejects an ambiguous CS-25 owner deferral', () => {
  const value = base();
  const ticket = value.model.tickets.find((item) => item.ticketId === 'CS-25');
  ticket.decisionSource = null;
  assert.match(
    validateBlockerClassification(value).join('\n'),
    /CS-25: owner deferral is ambiguous/,
  );
});

test('rejects HOLD/FUTURE design work presented as an active blocker', () => {
  const value = base();
  const ticket = value.model.tickets.find(
    (item) => !item.blocked && /HOLD|FUTURE|CONDITIONAL/i.test(item.releaseDisposition),
  );
  ticket.blocked = true;
  ticket.primaryClass = 'B1_PRODUCT_OR_OWNER_DECISION';
  ticket.hostpending = false;
  ticket.reason = 'This is FUTURE release work only.';
  assert.match(validateBlockerClassification(value).join('\n'), /HOLD\/FUTURE-only/);
});
