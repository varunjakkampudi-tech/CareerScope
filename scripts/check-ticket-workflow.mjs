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
if (items.length !== 216) errors.push(`expected 216 tickets, found ${items.length}`);
if (records.length !== items.length)
  errors.push(`migration records ${records.length} do not cover ${items.length} tickets`);
const ids = new Set();
for (const item of items) {
  try {
    assertTicketWorkflow(item);
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
const recordIds = new Set(records.map((x) => x.ticketId));
for (const id of ids) if (!recordIds.has(id)) errors.push(`missing migration record ${id}`);
for (const id of recordIds) if (!ids.has(id)) errors.push(`orphan migration record ${id}`);
if (migration.totalTickets !== items.length) errors.push('migration totalTickets mismatch');
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
