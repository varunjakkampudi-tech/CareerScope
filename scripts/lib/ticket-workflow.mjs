/** Canonical CareerScope ticket workflow. Blockers are orthogonal metadata. */
export const TICKET_STATUSES = Object.freeze([
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'QA',
  'UAT',
  'PROD',
]);
export const FORWARD_TRANSITIONS = Object.freeze({
  BACKLOG: ['TODO'],
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['QA'],
  QA: ['UAT'],
  UAT: ['PROD'],
  PROD: [],
});
export const REWORK_TRANSITIONS = Object.freeze({
  TODO: ['BACKLOG'],
  IN_PROGRESS: ['TODO'],
  QA: ['IN_PROGRESS'],
  UAT: ['QA', 'IN_PROGRESS'],
  PROD: [],
  BACKLOG: [],
});

export function isTicketStatus(value) {
  return TICKET_STATUSES.includes(value);
}
export function isForwardTransitionAllowed(from, to) {
  return FORWARD_TRANSITIONS[from]?.includes(to) ?? false;
}
export function isReworkTransitionAllowed(from, to) {
  return REWORK_TRANSITIONS[from]?.includes(to) ?? false;
}
export function isBlockedTicket(ticket) {
  return ticket?.blocked === true;
}

const CS80_ACCEPTANCE_CRITERIA_AMENDMENT = Object.freeze({
  decisionId: 'OD-2026-10-07-CS80-AC3',
  criterionId: 'CS-80-AC3',
  previousAcceptanceCriteriaHash:
    '2c20cd612efbb6bc030114f3647fef1e97a6aeaeb3a2d861f67023e9e90727df',
  amendedAcceptanceCriteriaHash: '32a705b339219358468b6f8e49ee056c4a81e0d91e48219dcb768407c554eb28',
  source: 'docs/OWNER-DECISIONS-2026-10-02.md#OD-2026-10-07-CS80-AC3',
  scope:
    'Narrow deterministic Phase 3.25 generated-artifact exception on phase-3.25/cloud-continuation; no main integration authorization.',
});

export function acceptanceCriteriaHashMatches(record, currentHash) {
  const amendments = record?.acceptanceCriteriaAmendments;
  if (amendments === undefined) return record?.acceptanceCriteriaHash === currentHash;
  if (
    record?.ticketId !== 'CS-80' ||
    record.acceptanceCriteriaHash !==
      CS80_ACCEPTANCE_CRITERIA_AMENDMENT.previousAcceptanceCriteriaHash ||
    currentHash !== CS80_ACCEPTANCE_CRITERIA_AMENDMENT.amendedAcceptanceCriteriaHash ||
    !Array.isArray(amendments) ||
    amendments.length !== 1
  )
    return false;
  const amendment = amendments[0];
  return Object.entries(CS80_ACCEPTANCE_CRITERIA_AMENDMENT).every(
    ([key, value]) => amendment[key] === value,
  );
}

export function assertTicketWorkflow(
  ticket,
  { fromStatus, allowHistoricalBlockedSinceNull = false } = {},
) {
  if (!ticket || typeof ticket !== 'object') throw new Error('ticket must be an object');
  if (!isTicketStatus(ticket.status))
    throw new Error(`${ticket.id ?? 'ticket'} has non-canonical status ${ticket.status}`);
  const blocked = ticket.blocked === true;
  if (typeof ticket.blocked !== 'boolean')
    throw new Error(`${ticket.id ?? 'ticket'} blocked must be boolean`);
  if (ticket.blockedReason !== null && typeof ticket.blockedReason !== 'string')
    throw new Error(`${ticket.id ?? 'ticket'} blockedReason must be string or null`);
  if (ticket.blockedOwner !== null && typeof ticket.blockedOwner !== 'string')
    throw new Error(`${ticket.id ?? 'ticket'} blockedOwner must be string or null`);
  if (
    ticket.blockedSince !== null &&
    (typeof ticket.blockedSince !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(ticket.blockedSince) ||
      Number.isNaN(Date.parse(ticket.blockedSince)))
  )
    throw new Error(`${ticket.id ?? 'ticket'} blockedSince must be an ISO timestamp or null`);
  if (blocked && ticket.blockedSince === null && !allowHistoricalBlockedSinceNull)
    throw new Error(`${ticket.id ?? 'ticket'} newly blocked tickets require blockedSince`);
  if (!Array.isArray(ticket.unblockEvidenceRequired))
    throw new Error(`${ticket.id ?? 'ticket'} unblockEvidenceRequired must be an array`);
  if (
    blocked &&
    (!ticket.blockedReason ||
      !Array.isArray(ticket.unblockEvidenceRequired) ||
      ticket.unblockEvidenceRequired.length === 0)
  )
    throw new Error(`${ticket.id ?? 'ticket'} blocked metadata is incomplete`);
  if (
    !blocked &&
    (ticket.blockedReason !== null ||
      ticket.blockedOwner !== null ||
      ticket.blockedSince !== null ||
      !Array.isArray(ticket.unblockEvidenceRequired) ||
      ticket.unblockEvidenceRequired.length)
  )
    throw new Error(`${ticket.id ?? 'ticket'} unblocked ticket has blocker metadata`);
  if (ticket.status === 'PROD' && blocked)
    throw new Error(`${ticket.id ?? 'ticket'} cannot be PROD while blocked`);
  if (
    fromStatus &&
    fromStatus !== ticket.status &&
    !isForwardTransitionAllowed(fromStatus, ticket.status) &&
    !isReworkTransitionAllowed(fromStatus, ticket.status)
  )
    throw new Error(
      `${ticket.id ?? 'ticket'} illegal transition ${fromStatus} -> ${ticket.status}`,
    );
  return true;
}
