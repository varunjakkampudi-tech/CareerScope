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

export function assertTicketWorkflow(ticket, { fromStatus } = {}) {
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
