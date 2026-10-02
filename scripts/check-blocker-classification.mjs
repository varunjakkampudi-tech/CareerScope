import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BLOCKER_CLASSES = Object.freeze([
  'B1_PRODUCT_OR_OWNER_DECISION',
  'B2_CODE_OR_ARCHITECTURE',
  'B3_SECURITY_OR_SYSTEM_REVIEW',
  'B4_LIVE_HOST_OR_OPERATOR_EVIDENCE',
  'B5_EXTERNAL_PROVIDER_ACCOUNT_DNS_SECRET',
  'B6_REAL_WORLD_HUMAN_ACCEPTANCE_OR_LEGAL',
]);
const MANUAL_CLASSES = new Set(BLOCKER_CLASSES.slice(3));
const HOLD_OR_FUTURE = /\b(?:HOLD|FUTURE|CONDITIONAL)\b/i;

export function validateBlockerClassification({ model, backlog, hostpendingText, designCoverage }) {
  const errors = [];
  if (!model || model.schemaVersion !== 1 || model.phase !== 2)
    errors.push('model must declare schemaVersion 1 and phase 2');
  if (!Array.isArray(model?.tickets)) errors.push('model.tickets must be an array');
  if (!Array.isArray(model?.hostpending)) errors.push('model.hostpending must be an array');
  const backlogItems = backlog?.items ?? [];
  const backlogIds = new Set(backlogItems.map((item) => item.id));
  const seen = new Set();
  for (const item of model?.tickets ?? []) {
    if (!item.ticketId || seen.has(item.ticketId))
      errors.push(`duplicate or missing classification: ${item.ticketId || '<missing>'}`);
    seen.add(item.ticketId);
    const sourceTicket = backlogItems.find((ticket) => ticket.id === item.ticketId);
    if (!sourceTicket) errors.push(`classification references unknown ticket ${item.ticketId}`);
    else if (item.status !== sourceTicket.status)
      errors.push(
        `${item.ticketId}: blocker model changed ticket status from ${sourceTicket.status} to ${item.status}`,
      );
    if (item.blocked) {
      if (!BLOCKER_CLASSES.includes(item.primaryClass))
        errors.push(`${item.ticketId}: blocked item has invalid primaryClass`);
      if (!item.reason || !item.evidenceSource || !item.owner || !item.requiredEvidence)
        errors.push(
          `${item.ticketId}: blocked item needs reason, evidenceSource, owner, and requiredEvidence`,
        );
      if (
        HOLD_OR_FUTURE.test(item.releaseDisposition || '') ||
        (HOLD_OR_FUTURE.test(item.reason || '') && /release|future|hold/i.test(item.reason || ''))
      )
        errors.push(`${item.ticketId}: HOLD/FUTURE-only item cannot be an active blocker`);
      const manual = MANUAL_CLASSES.has(item.primaryClass);
      if (manual !== Boolean(item.hostpending))
        errors.push(`${item.ticketId}: hostpending must match manual class ${item.primaryClass}`);
      if (
        item.primaryClass === 'B1_PRODUCT_OR_OWNER_DECISION' &&
        item.resolutionType === 'OWNER_DECISION_RECORDED' &&
        !item.decisionSource
      )
        errors.push(`${item.ticketId}: resolved B1 requires decisionSource`);
    } else if (item.hostpending)
      errors.push(`${item.ticketId}: resolved/non-blocked item cannot be hostpending`);
    if (item.releaseDisposition === 'DEFERRED_BY_OWNER' && item.blocked)
      errors.push(`${item.ticketId}: owner-deferred item must not remain an active blocker`);
  }
  if (Array.isArray(model?.statusChanges) && model.statusChanges.length)
    errors.push('statusChanges must be empty in Phase 2');
  if (seen.size !== backlogIds.size)
    errors.push(
      `classification coverage mismatch: ${seen.size} entries for ${backlogIds.size} backlog tickets`,
    );
  for (const id of backlogIds) if (!seen.has(id)) errors.push(`missing classification for ${id}`);

  const modelHost = model?.hostpending ?? [];
  const hostIds = new Set();
  for (const item of modelHost) {
    if (hostIds.has(item.ticketId)) errors.push(`duplicate hostpending mapping ${item.ticketId}`);
    hostIds.add(item.ticketId);
    const classified = model.tickets.find((ticket) => ticket.ticketId === item.ticketId);
    if (!classified) errors.push(`orphan hostpending mapping ${item.ticketId}`);
    else if (
      !classified.blocked ||
      !MANUAL_CLASSES.has(classified.primaryClass) ||
      classified.primaryClass !== item.primaryClass
    )
      errors.push(
        `${item.ticketId}: hostpending mapping does not match an active B4/B5/B6 blocker`,
      );
    if (!item.owner || !item.whyManual || !item.safeSteps || !item.evidence || !item.rollback)
      errors.push(`${item.ticketId}: hostpending entry is not actionable and reversible`);
  }
  const headings = [...(hostpendingText || '').matchAll(/^###\s+(CS-\d+)\s+[—-]/gm)].map(
    (match) => match[1],
  );
  const textIds = new Set();
  for (const id of headings) {
    if (textIds.has(id)) errors.push(`duplicate hostpending heading ${id}`);
    textIds.add(id);
    if (!hostIds.has(id)) errors.push(`orphan hostpending heading ${id}`);
  }
  for (const id of hostIds)
    if (!textIds.has(id)) errors.push(`hostpending mapping ${id} has no hostpending.txt entry`);
  if (designCoverage) {
    const expected = {
      designStageRecords: 14,
      orderedScreenReferenceRecords: 127,
      approvedImages: 345,
    };
    const actual = {
      ...designCoverage.coverageSummary,
      approvedImages: designCoverage.coverageSummary?.approvedImagesClassified,
    };
    for (const [key, value] of Object.entries(expected))
      if (actual[key] !== value)
        errors.push(
          `Phase 1 preservation mismatch for ${key}: expected ${value}, got ${actual[key]}`,
        );
  }
  return errors;
}

export function loadPhase2Files(
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
) {
  const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
  return {
    model: read('.ai/blocker-classification.json'),
    backlog: read('.ai/backlog.json'),
    hostpendingText: fs.readFileSync(path.join(root, 'hostpending.txt'), 'utf8'),
    designCoverage: read('.ai/design-ticket-coverage.json'),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = validateBlockerClassification(loadPhase2Files());
  if (errors.length) {
    console.error(errors.map((error) => `FAIL: ${error}`).join('\n'));
    process.exitCode = 1;
  } else {
    const { model } = loadPhase2Files();
    process.stdout.write(
      `PASS blocker classification: ${model.summary.totalTicketsReviewed} tickets, ${model.summary.activeBlockers} active blockers, ${model.summary.hostpending} host-pending actions\n`,
    );
  }
}
