import { createHash } from 'node:crypto';
import prettier from 'prettier';
import { fileURLToPath } from 'node:url';

const SOURCE_PATH = 'source-revisions/2026-10-20/CareerScope-v12.md';
const LEGACY_PATH = 'V12-REQUIREMENT-INVENTORY.json';
const RECONCILIATION_PATH = 'SOURCE-RECONCILIATION-2026-10-21.md';
const R1_SOURCE_SHA256 = 'ecb3a40ac0e8bc532baff6e6897d9c4fe962c9b25516b65449814b83b2a25214';
const LEGACY_SOURCE_SHA256 = '35e9a728a65b0620cb9075345216c69c973fee57efad21752554dc338a532167';
const LEGACY_DISPOSITIONS = new Set([
  'REPLACE_WITH_APPROVED_BASE',
  'RETAIN_UNTIL_AMENDMENT_APPROVED',
  'SUPERSEDED_BY_APPROVED_D1',
  'OWNER_DECISION_REQUIRED',
  'EXTERNAL_EVIDENCE_REQUIRED',
]);
const INCLUDED_SECTIONS = new Set([
  '1',
  '2',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
]);

const normalize = (value) => value.replace(/\s+/g, ' ').trim();
const lineHash = (value) => createHash('sha256').update(value).digest('hex');

function sectionForHeading(heading) {
  const numeric = heading.match(/^##\s+(\d+)\./);
  if (numeric)
    return {
      section: numeric[1],
      included: INCLUDED_SECTIONS.has(numeric[1]),
      authority: 'APPROVED_BASE',
    };
  if (/^##\s+Amendment A[123]\b/.test(heading))
    return {
      section: heading.match(/Amendment (A[123])\b/)[1],
      included: true,
      authority: 'PENDING_AMENDMENT',
    };
  if (/^##\s+Production Completeness Amendment/.test(heading))
    return { section: 'PCA', included: true, authority: 'PENDING_AMENDMENT' };
  if (/^##\s+Launch baseline controls and tests/.test(heading))
    return { section: 'CR-07', included: true, authority: 'SCOPE_RECONCILIATION_REQUIRED' };
  if (/^##\s+Cleanup baseline reference/.test(heading))
    return {
      section: 'CLEANUP-REFERENCE',
      included: true,
      authority: 'SOURCE_REFERENCE_UNAVAILABLE',
    };
  return { section: null, included: false, authority: 'EXCLUDED_HISTORICAL_OR_POSITIONING' };
}

function rowAuthority(text, sectionAuthority) {
  const upper = text.toUpperCase();
  if (sectionAuthority !== 'APPROVED_BASE') return sectionAuthority;
  if (/PENDING_OWNER_APPROVAL|PROPOSED_AMENDMENT|\bPROPOSED\b/.test(upper))
    return 'PENDING_AMENDMENT';
  if (/\bD11-R\b/.test(upper) || (/\|\s*D11\s*\|/.test(text) && /SUPERSEDED/i.test(text)))
    return 'SOURCE_CONFLICT_REQUIRES_RECONCILIATION';
  if (/\bOPEN\b|READY_FOR_OWNER|EXTERNAL DEPENDENC/.test(upper)) return 'OWNER_OR_EXTERNAL_GATE';
  return sectionAuthority;
}

function isTableHeader(text) {
  const normalized = normalize(text).toLowerCase();
  return /^\|?\s*(id|#|gate|control|requirement|title|item|decision|source|category)\s*\|/.test(
    normalized,
  );
}

export function parseContentBlocks(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let state = { section: null, included: false, authority: 'EXCLUDED_HISTORICAL_OR_POSITIONING' };
  let heading = '';
  let paragraph = [];

  const add = (kind, values, firstLine, lastLine) => {
    const text = kind === 'PARAGRAPH' ? normalize(values.join(' ')) : values[0].trim();
    if (!text) return;
    blocks.push({
      sourceLine: firstLine,
      sourceEndLine: lastLine,
      section: state.section,
      heading,
      kind,
      text,
      authorityDisposition: rowAuthority(text, state.authority),
    });
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    add(
      'PARAGRAPH',
      paragraph.map((entry) => entry.text),
      paragraph[0].line,
      paragraph.at(-1).line,
    );
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const number = index + 1;
    if (/^#{1,6}\s/.test(line)) {
      flushParagraph();
      if (/^##\s/.test(line)) state = sectionForHeading(line);
      heading = line.replace(/^#{1,6}\s+/, '').trim();
      continue;
    }
    if (!state.included || !line.trim()) {
      flushParagraph();
      continue;
    }
    if (/^\s*\|\s*:?-{3,}/.test(line)) {
      flushParagraph();
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flushParagraph();
      if (!isTableHeader(line)) add('TABLE_ROW', [line], number, number);
      continue;
    }
    if (/^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)) {
      flushParagraph();
      add('LIST_ITEM', [line], number, number);
      continue;
    }
    paragraph.push({ text: line, line: number });
  }
  flushParagraph();
  return blocks;
}

function legacyDispositionTable(markdown) {
  const records = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s*`(V12-[^`]+)`\s*\|\s*`([A-Z0-9_]+)`\s*\|/);
    if (!match) continue;
    if (records.has(match[1])) throw new Error('duplicate legacy reconciliation disposition');
    if (!LEGACY_DISPOSITIONS.has(match[2]))
      throw new Error('invalid legacy reconciliation disposition');
    records.set(match[1], match[2]);
  }
  return records;
}

export function buildR1Inventory({ source, legacy, reconciliation }) {
  const sourceSha256 = lineHash(source);
  if (sourceSha256 !== R1_SOURCE_SHA256) throw new Error('approved R1 source hash mismatch');
  const legacyItems = legacy.items;
  if (legacy.sourceSha256 !== LEGACY_SOURCE_SHA256)
    throw new Error('historical legacy source hash mismatch');
  if (!Array.isArray(legacyItems) || legacy.totalSourceItems !== legacyItems.length)
    throw new Error('historical legacy inventory count mismatch');
  const legacyIds = legacyItems.map((item) => item.id);
  if (
    legacyIds.some((id) => typeof id !== 'string' || !id) ||
    new Set(legacyIds).size !== legacyIds.length
  )
    throw new Error('historical legacy inventory IDs are invalid or duplicated');
  if (legacyItems.some((item) => typeof item.text !== 'string' || !item.text.trim()))
    throw new Error('historical legacy inventory contains empty text');
  const legacyByNormalizedText = new Map();
  for (const item of legacyItems) {
    const key = normalize(item.text);
    legacyByNormalizedText.set(key, [...(legacyByNormalizedText.get(key) ?? []), item.id]);
  }
  const linkedLegacyIds = new Set();
  const blocks = parseContentBlocks(source).map((block) => {
    const normalizedText = normalize(block.text);
    const legacySourceItemIds = legacyByNormalizedText.get(normalizedText) ?? [];
    for (const id of legacySourceItemIds) linkedLegacyIds.add(id);
    return {
      id: `V12R1-${block.section}-${String(block.sourceLine).padStart(4, '0')}`,
      ...block,
      legacySourceItemIds: legacySourceItemIds.sort(),
      assessment: 'NOT_ASSESSED',
      verification: 'NOT_RUN',
    };
  });
  const legacyDisposition = legacyDispositionTable(reconciliation);
  const unmatchedLegacy = legacyItems.filter((item) => !linkedLegacyIds.has(item.id));
  const unmatchedIds = new Set(unmatchedLegacy.map((item) => item.id));
  if (
    legacyDisposition.size !== unmatchedIds.size ||
    [...legacyDisposition.keys()].some((id) => !unmatchedIds.has(id))
  )
    throw new Error('legacy reconciliation dispositions do not exactly cover unlinked items');

  return {
    schemaVersion: 1,
    title: 'CareerScope v12 R1 source-content inventory',
    sourceRevision: 'SRC-01-R1',
    sourcePath: `docs/requirements/${SOURCE_PATH}`,
    sourceSha256,
    itemUnit:
      'Substantive Markdown paragraph, list item, or data-table row in included sections; not an implementation, feature, or test count.',
    scope: {
      includedSections: [...INCLUDED_SECTIONS],
      includedSupplementalSections: ['A1', 'A2', 'A3', 'PCA', 'CR-07', 'CLEANUP-REFERENCE'],
      excluded: [
        'section 3 historical changes',
        'Appendix positioning',
        'unclassified material outside the approved section map',
      ],
      authorityRule:
        'Only APPROVED_BASE is approved base text. Pending amendments, scope reconciliation, unavailable references, source conflicts, and owner/external gates are never promoted by inventory generation.',
    },
    legacyInventory: {
      path: `docs/requirements/${LEGACY_PATH}`,
      sourceSha256: legacy.sourceSha256,
      totalSourceItems: legacy.totalSourceItems,
      dispositionPath: `docs/requirements/${RECONCILIATION_PATH}`,
      dispositionCount: legacyDisposition.size,
      exactTextLinkedCount: linkedLegacyIds.size,
      nonExactDispositionCount: unmatchedLegacy.length,
    },
    totalItems: blocks.length,
    authorityCounts: Object.fromEntries(
      [...new Set(blocks.map((block) => block.authorityDisposition))]
        .sort()
        .map((authority) => [
          authority,
          blocks.filter((block) => block.authorityDisposition === authority).length,
        ]),
    ),
    items: blocks,
  };
}

export async function renderR1Inventory(input) {
  const serialized = JSON.stringify(buildR1Inventory(input), null, 2);
  const filepath = fileURLToPath(
    new URL('../docs/requirements/V12-R1-REQUIREMENT-INVENTORY.json', import.meta.url),
  );
  const config = (await prettier.resolveConfig(filepath)) ?? {};
  return prettier.format(serialized, { ...config, parser: 'json', filepath });
}
