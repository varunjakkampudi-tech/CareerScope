import fs from 'node:fs';
import crypto from 'node:crypto';
import { TICKET_STATUSES, assertTicketWorkflow } from './lib/ticket-workflow.mjs';

const backlog = JSON.parse(fs.readFileSync('.ai/backlog.json', 'utf8'));
const migration = JSON.parse(fs.readFileSync('.ai/workflow-migration.json', 'utf8'));
const blockers = JSON.parse(fs.readFileSync('.ai/blocker-classification.json', 'utf8'));
const errors = [];
const items = backlog.items;
const records = migration.records;
const blockerById = new Map(blockers.tickets.map((x) => [x.ticketId, x]));
if (migration.baselineCommit !== '22455e06039390c33a7a478d0fcb89cf4a7df462')
  errors.push('migration baselineCommit mismatch');
if (migration.phase !== 'PHASE_3_CANONICAL_WORKFLOW_MIGRATION')
  errors.push('migration phase mismatch');
if (items.length !== 216) errors.push(`expected 216 tickets, found ${items.length}`);
if (records.length !== items.length)
  errors.push(`migration records ${records.length} do not cover ${items.length} tickets`);
const ids = new Set();
const legacyCounts = {};
const recordCounts = {};
const recordIds = new Set();
for (const record of records) {
  if (!record.ticketId || recordIds.has(record.ticketId))
    errors.push(`duplicate migration record ${record.ticketId}`);
  recordIds.add(record.ticketId);
  if (
    typeof record.legacyStatus !== 'string' ||
    !TICKET_STATUSES.includes(record.newStatus) ||
    typeof record.blocked !== 'boolean'
  )
    errors.push(`invalid migration schema for ${record.ticketId}`);
  if (typeof record.migrationBasis !== 'string' || typeof record.promotionOccurred !== 'boolean')
    errors.push(`incomplete migration basis for ${record.ticketId}`);
  if (record.blocked && record.blockedSincePolicy !== 'HISTORICAL_UNKNOWN_UNLESS_SOURCE_PROVEN')
    errors.push(`invalid blockedSince policy for ${record.ticketId}`);
  if (!record.blocked && record.blockedSincePolicy !== 'NOT_BLOCKED')
    errors.push(`invalid unblocked timestamp policy for ${record.ticketId}`);
  legacyCounts[record.legacyStatus] = (legacyCounts[record.legacyStatus] ?? 0) + 1;
  recordCounts[record.newStatus] = (recordCounts[record.newStatus] ?? 0) + 1;
}
for (const item of items) {
  try {
    const record = records.find((entry) => entry.ticketId === item.id);
    assertTicketWorkflow(item, {
      allowHistoricalBlockedSinceNull:
        record?.blockedSincePolicy === 'HISTORICAL_UNKNOWN_UNLESS_SOURCE_PROVEN',
    });
  } catch (error) {
    errors.push(error.message);
  }
  if (ids.has(item.id)) errors.push(`duplicate ticket ${item.id}`);
  ids.add(item.id);
  const phase2 = blockerById.get(item.id);
  if (!phase2) errors.push(`${item.id} missing Phase 2 classification`);
  else if (phase2.blocked === true && item.blocked !== true)
    errors.push(`${item.id} lost active Phase 2 blocker`);
  else if (phase2.phase2Disposition === 'RESOLVED_PHASE_2' && item.blocked)
    errors.push(`${item.id} retained resolved Phase 2 blocker`);
  const record = records.find((entry) => entry.ticketId === item.id);
  if (record) {
    if (record.newStatus !== item.status)
      errors.push(`${item.id} migration status does not match backlog`);
    if (record.blocked !== item.blocked)
      errors.push(`${item.id} migration blocker flag does not match backlog`);
    const evidenceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(item.evidence ?? []))
      .digest('hex');
    const acceptanceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(item.acceptanceCriteria ?? []))
      .digest('hex');
    if (record.evidenceHash !== evidenceHash)
      errors.push(`${item.id} evidence changed after migration`);
    if (record.acceptanceCriteriaHash !== acceptanceHash)
      errors.push(`${item.id} acceptance criteria changed after migration`);
  }
}
for (const id of ids) if (!recordIds.has(id)) errors.push(`missing migration record ${id}`);
for (const id of recordIds) if (!ids.has(id)) errors.push(`orphan migration record ${id}`);
if (migration.totalTickets !== items.length) errors.push('migration totalTickets mismatch');
for (const [status, count] of Object.entries(recordCounts))
  if ((migration.newStatusCounts[status] ?? 0) !== count)
    errors.push(`migration new status count mismatch for ${status}`);
for (const [status, count] of Object.entries(legacyCounts))
  if ((migration.legacyStatusCounts[status] ?? 0) !== count)
    errors.push(`migration legacy status count mismatch for ${status}`);
if (
  items.some((x) => x.status === 'BLOCKED' || x.status === 'DISCOVERY' || x.status === 'RELEASED')
)
  errors.push('legacy workflow status remains in backlog');
const counts = Object.fromEntries(
  TICKET_STATUSES.map((s) => [s, items.filter((x) => x.status === s).length]),
);
for (const [status, count] of Object.entries(counts))
  if ((migration.newStatusCounts[status] ?? 0) !== count)
    errors.push(`status count mismatch for ${status}`);
if (errors.length) {
  console.error(errors.map((e) => `FAIL ${e}`).join('\n'));
  process.exit(1);
}
process.stdout.write(
  `PASS canonical workflow: ${items.length} tickets, ${items.filter((x) => x.blocked).length} orthogonal blockers`,
);
