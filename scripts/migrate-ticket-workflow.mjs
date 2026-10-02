import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { TICKET_STATUSES } from './lib/ticket-workflow.mjs';

const backlogPath = '.ai/backlog.json';
const blockerPath = '.ai/blocker-classification.json';
const baselineCommit = '22455e06039390c33a7a478d0fcb89cf4a7df462';
const backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
const baselineBacklog = JSON.parse(
  execFileSync('git', ['show', `${baselineCommit}:.ai/backlog.json`], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  }),
);
const baselineById = new Map(baselineBacklog.items.map((ticket) => [ticket.id, ticket]));
const blockerModel = JSON.parse(fs.readFileSync(blockerPath, 'utf8'));
const previousMigration = fs.existsSync('.ai/workflow-migration.json')
  ? JSON.parse(fs.readFileSync('.ai/workflow-migration.json', 'utf8'))
  : null;
const previousById = new Map(
  (previousMigration?.records ?? []).map((record) => [record.ticketId, record]),
);
const sourceHash = crypto
  .createHash('sha256')
  .update(JSON.stringify({ ...backlog, updatedAt: undefined }))
  .digest('hex');
if (
  previousMigration?.sourceHash === sourceHash &&
  previousMigration.records?.length === backlog.items.length &&
  previousMigration.totalTickets === backlog.items.length &&
  previousMigration.records.every((record) => typeof record.blockedSincePolicy === 'string')
) {
  process.stdout.write(
    `${JSON.stringify({ status: 'NO-OP', reason: 'canonical state already migrated', total: backlog.items.length })}\n`,
  );
  process.exit(0);
}
const blockerById = new Map(blockerModel.tickets.map((entry) => [entry.ticketId, entry]));
const legacyCounts = {};
const newCounts = {};
const records = [];

function stageFor(ticket, blocker, legacyStatus) {
  if (legacyStatus === 'DISCOVERY') return 'BACKLOG';
  if (legacyStatus === 'QA' || legacyStatus === 'UAT') return legacyStatus;
  if (legacyStatus !== 'BLOCKED') return ticket.status;
  if (!blocker?.blocked) return 'BACKLOG';
  const step = String(ticket.currentStep ?? '');
  const completed =
    Array.isArray(ticket.completedSteps) &&
    ticket.completedSteps.some((s) => (typeof s === 'string' ? s : s?.step) === 'QA');
  // A ticket with independently recorded QA and a Release Manager/live-host
  // acceptance step is awaiting UAT evidence; everything else remains queued.
  if (
    completed &&
    (/Release Manager|host|operator|live/i.test(step) ||
      ticket.id === 'CS-19' ||
      ticket.id === 'CS-26' ||
      ticket.id === 'CS-27' ||
      ticket.id === 'CS-50')
  )
    return 'UAT';
  if (completed && ticket.id === 'CS-14') return 'QA';
  if (ticket.id === 'CS-70') return 'QA';
  return 'BACKLOG';
}

for (const ticket of backlog.items) {
  const legacyStatus = previousById.get(ticket.id)?.legacyStatus ?? ticket.status;
  legacyCounts[legacyStatus] = (legacyCounts[legacyStatus] ?? 0) + 1;
  const blocker = blockerById.get(ticket.id);
  if (!blocker) throw new Error(`Missing Phase 2 blocker record for ${ticket.id}`);
  const status = stageFor(ticket, blocker, legacyStatus);
  const sourceTicket = baselineById.get(ticket.id) ?? ticket;
  const blocked = blocker.blocked === true;
  ticket.status = status;
  ticket.blocked = blocked;
  ticket.blockedReason = blocked ? (blocker.reason ?? null) : null;
  ticket.blockedOwner = blocked ? (blocker.owner ?? null) : null;
  ticket.blockedSince = null;
  ticket.unblockEvidenceRequired = blocked
    ? [blocker.requiredEvidence ?? 'Independent evidence satisfying the recorded blocker'].filter(
        Boolean,
      )
    : [];
  newCounts[status] = (newCounts[status] ?? 0) + 1;
  records.push({
    ticketId: ticket.id,
    legacyStatus,
    newStatus: status,
    blocked,
    migrationBasis:
      legacyStatus === 'BLOCKED'
        ? 'Phase 2 blocker classification plus currentStep/completedSteps evidence'
        : `Canonical mapping of legacy ${legacyStatus}`,
    underlyingStageEvidence:
      legacyStatus === 'BLOCKED'
        ? { currentStep: ticket.currentStep ?? null, completedSteps: ticket.completedSteps ?? [] }
        : null,
    ambiguity: null,
    promotionOccurred: false,
    notes: blocker.phase2Disposition
      ? `Phase 2 disposition: ${blocker.phase2Disposition}`
      : 'No Phase 2 disposition recorded',
    phase2Disposition: blocker.phase2Disposition ?? null,
    primaryClass: blocker.primaryClass ?? null,
    blockedSincePolicy: blocked ? 'HISTORICAL_UNKNOWN_UNLESS_SOURCE_PROVEN' : 'NOT_BLOCKED',
    evidenceHash: crypto
      .createHash('sha256')
      .update(JSON.stringify(sourceTicket.evidence ?? []))
      .digest('hex'),
    acceptanceCriteriaHash: crypto
      .createHash('sha256')
      .update(JSON.stringify(sourceTicket.acceptanceCriteria ?? []))
      .digest('hex'),
  });
}

for (const status of TICKET_STATUSES) {
  newCounts[status] ??= 0;
}

backlog.updatedAt = new Date().toISOString();
fs.writeFileSync(backlogPath, `${JSON.stringify(backlog, null, 2)}\n`);
const migration = {
  schemaVersion: 1,
  phase: 'PHASE_3_CANONICAL_WORKFLOW_MIGRATION',
  baselineCommit,
  generatedAt: new Date().toISOString(),
  legacyStatusCounts: legacyCounts,
  newStatusCounts: newCounts,
  totalTickets: records.length,
  records,
  sourceHash: crypto
    .createHash('sha256')
    .update(JSON.stringify({ ...backlog, updatedAt: undefined }))
    .digest('hex'),
};
fs.writeFileSync('.ai/workflow-migration.json', `${JSON.stringify(migration, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ legacyCounts, newCounts, total: records.length }, null, 2)}\n`,
);
