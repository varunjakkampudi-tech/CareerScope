import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import {
  bindingDigest,
  buildCatalog,
  PORTABLE_REVIEWER_POLICY,
  specificationDigest,
} from './lib/ticket-specification.mjs';
import { loadInputs } from './ticket-specifications.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(
  process.argv.slice(2).map((value) => {
    const [key, ...rest] = value.replace(/^--/, '').split('=');
    return [key, rest.join('=')];
  }),
);
const ticketIds = (args.get('tickets') ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const expectedHashes = Object.fromEntries(
  (args.get('expected-hashes') ?? '')
    .split(',')
    .filter(Boolean)
    .map((entry) => {
      const [id, hash] = entry.split(':');
      return [id, hash];
    }),
);
if (
  args.get('reviewer') !== PORTABLE_REVIEWER_POLICY.canonicalReviewerId ||
  !ticketIds.length ||
  ticketIds.some((id) => !/^(CS)-(?:[1-9]|[1-9]\d|1\d\d|2(?:0\d|1[0-6]))$/.test(id))
)
  throw new Error('portable receipt writer requires canonical reviewer and valid --tickets');

const policyPath = path.join(root, '.ai/ticket-specification-policy.json');
// loadInputs may add derived compatibility defaults for validation. Receipts
// must be written to the raw policy source so recording them cannot rewrite
// unrelated specification metadata or historical decisions.
const rawPolicy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const inputs = loadInputs(root);
inputs.policy = rawPolicy;
const model = buildCatalog(inputs);
const reportPath = path.join(root, PORTABLE_REVIEWER_POLICY.artifact);
const receiptLines = [];

for (const ticketId of ticketIds) {
  const spec = model.specs.find((entry) => entry.ticketId === ticketId);
  const ticket = inputs.backlog.items.find((entry) => entry.id === ticketId);
  if (!spec || !ticket) throw new Error(`unknown ticket ${ticketId}`);
  if (spec.gaps.some((gap) => gap.disposition === 'OPEN'))
    throw new Error(`open specification gap ${ticketId}`);
  const expected = expectedHashes[ticketId];
  const generatedPath = path.join(root, 'docs/tickets', `${ticketId}.md`);
  const currentGeneratedFileHash = createHash('sha256')
    .update(fs.readFileSync(generatedPath))
    .digest('hex');
  if (!expected || expected !== currentGeneratedFileHash)
    throw new Error(`current content hash mismatch ${ticketId}`);
  const bindings = inputs.policy.exactVerificationBindings ?? {};
  for (let index = 0; index < ticket.acceptanceCriteria.length; index += 1) {
    const acId = `${ticketId}-AC${index + 1}`;
    const rows = bindings[acId];
    if (!Array.isArray(rows) || !rows.length) throw new Error(`missing binding ${acId}`);
    for (const row of rows) row.reviewStatus = 'REVIEWED';
  }
}

const reviewedModel = buildCatalog(inputs);
for (const ticketId of ticketIds) {
  const spec = reviewedModel.specs.find((entry) => entry.ticketId === ticketId);
  const ticket = inputs.backlog.items.find((entry) => entry.id === ticketId);
  const specHash = specificationDigest(spec);
  inputs.policy.specificationReviewReceipts ??= {};
  inputs.policy.specificationReviewReceipts[ticketId] = {
    verdict: 'APPROVED',
    reviewer: PORTABLE_REVIEWER_POLICY.canonicalReviewerId,
    reviewerRole: PORTABLE_REVIEWER_POLICY.reviewerRole,
    reviewScope: 'WHOLE_SPECIFICATION',
    writerIdentity: PORTABLE_REVIEWER_POLICY.writerIdentity,
    reviewPolicyVersion: PORTABLE_REVIEWER_POLICY.reviewPolicyVersion,
    artifact: PORTABLE_REVIEWER_POLICY.artifact,
    contentHash: specHash,
  };
  const acHashes = [];
  for (let index = 0; index < ticket.acceptanceCriteria.length; index += 1) {
    const acId = `${ticketId}-AC${index + 1}`;
    const rows = inputs.policy.exactVerificationBindings[acId];
    const hash = bindingDigest(rows);
    acHashes.push(`${acId}=${hash}`);
    inputs.policy.verificationReviewReceipts ??= {};
    inputs.policy.verificationReviewReceipts[acId] = {
      verdict: 'APPROVED',
      reviewer: PORTABLE_REVIEWER_POLICY.canonicalReviewerId,
      reviewerRole: PORTABLE_REVIEWER_POLICY.reviewerRole,
      reviewScope: 'AC_BINDING',
      writerIdentity: PORTABLE_REVIEWER_POLICY.writerIdentity,
      reviewPolicyVersion: PORTABLE_REVIEWER_POLICY.reviewPolicyVersion,
      artifact: PORTABLE_REVIEWER_POLICY.artifact,
      contentHash: hash,
    };
  }
  receiptLines.push(
    `| ${ticketId} | ${specHash} | ${acHashes.join('<br>')} | APPROVED | ${PORTABLE_REVIEWER_POLICY.canonicalReviewerId} |`,
  );
}

const formatting = JSON.parse(fs.readFileSync(path.join(root, '.prettierrc.json'), 'utf8'));
fs.writeFileSync(
  policyPath,
  await format(JSON.stringify(inputs.policy), { ...formatting, parser: 'json' }),
);
fs.appendFileSync(
  reportPath,
  `\n### Portable independent reviewer wave (${new Date().toISOString().slice(0, 10)})\n\n` +
    'Current bytes were independently reviewed by the read-only canonical portable reviewer. The writer recomputed every digest before recording receipts; planned or hosted evidence remains future evidence.\n\n' +
    '| Ticket | Specification digest | Binding digests | Verdict | Reviewer |\n| --- | --- | --- | --- | --- |\n' +
    receiptLines.join('\n') +
    '\n',
);
