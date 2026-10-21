import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildR1Inventory,
  parseContentBlocks,
  renderR1Inventory,
} from './r1-requirement-inventory.mjs';

const root = new URL('../docs/requirements/', import.meta.url);
const source = readFileSync(
  new URL('source-revisions/2026-10-20/CareerScope-v12.md', root),
  'utf8',
);
const legacy = JSON.parse(readFileSync(new URL('V12-REQUIREMENT-INVENTORY.json', root), 'utf8'));
const reconciliation = readFileSync(new URL('SOURCE-RECONCILIATION-2026-10-21.md', root), 'utf8');

test('the approved R1 inventory is deterministic and retains the historical 319-item source', async () => {
  const rendered = await renderR1Inventory({ source, legacy, reconciliation });
  assert.equal(rendered, readFileSync(new URL('V12-R1-REQUIREMENT-INVENTORY.json', root), 'utf8'));
  const inventory = JSON.parse(rendered);
  assert.equal(inventory.legacyInventory.totalSourceItems, 319);
  assert.equal(inventory.items.length, inventory.totalItems);
  assert.equal(new Set(inventory.items.map((item) => item.id)).size, inventory.totalItems);
});

test('every legacy item is text-linked or has an exact reviewed reconciliation disposition', () => {
  const inventory = buildR1Inventory({ source, legacy, reconciliation });
  assert.equal(
    inventory.legacyInventory.exactTextLinkedCount +
      inventory.legacyInventory.nonExactDispositionCount,
    319,
  );
  assert.equal(inventory.legacyInventory.nonExactDispositionCount, 22);
  assert.equal(inventory.legacyInventory.dispositionCount, 22);
});

test('pending amendments and unresolved source conflicts are never marked approved base', () => {
  const inventory = buildR1Inventory({ source, legacy, reconciliation });
  const guarded = inventory.items.filter((item) =>
    [
      'PENDING_AMENDMENT',
      'SCOPE_RECONCILIATION_REQUIRED',
      'SOURCE_CONFLICT_REQUIRES_RECONCILIATION',
      'OWNER_OR_EXTERNAL_GATE',
      'SOURCE_REFERENCE_UNAVAILABLE',
    ].includes(item.authorityDisposition),
  );
  assert.ok(guarded.length > 0);
  assert.ok(guarded.every((item) => item.authorityDisposition !== 'APPROVED_BASE'));
  assert.ok(
    inventory.items.some(
      (item) => item.authorityDisposition === 'SOURCE_CONFLICT_REQUIRES_RECONCILIATION',
    ),
  );
  assert.ok(
    inventory.items.some((item) => item.authorityDisposition === 'SOURCE_REFERENCE_UNAVAILABLE'),
  );
});

test('a changed or missing approved source is rejected instead of regenerating a new identity', () => {
  assert.throws(
    () => buildR1Inventory({ source: `${source}\nchange`, legacy, reconciliation }),
    /approved R1 source hash mismatch/,
  );
});

test('a legacy mismatch without a recorded disposition fails closed', () => {
  const firstId = reconciliation.match(/\|\s*`(V12-[^`]+)`\s*\|\s*`[A-Z0-9_]+`\s*\|/)?.[1];
  assert.ok(firstId);
  const withoutOne = reconciliation.replace(new RegExp(`^\\|\\s*\`${firstId}\`.*$`, 'm'), '');
  assert.throws(
    () => buildR1Inventory({ source, legacy, reconciliation: withoutOne }),
    /do not exactly cover unlinked items/,
  );
});

test('legacy links require normalized exact text, not substring overlap', () => {
  const alteredLegacy = structuredClone(legacy);
  const firstBlock = parseContentBlocks(source)[0];
  alteredLegacy.items.push({ id: 'V12-TEST-SUBSTRING', text: firstBlock.text.slice(0, 20) });
  alteredLegacy.totalSourceItems += 1;
  const alteredReconciliation = `${reconciliation}\n| \`V12-TEST-SUBSTRING\` | \`RETAIN_UNTIL_AMENDMENT_APPROVED\` | synthetic test disposition |`;
  const inventory = buildR1Inventory({
    source,
    legacy: alteredLegacy,
    reconciliation: alteredReconciliation,
  });
  assert.equal(inventory.legacyInventory.exactTextLinkedCount, 297);
  assert.equal(inventory.legacyInventory.nonExactDispositionCount, 23);
  assert.ok(!inventory.items[0].legacySourceItemIds.includes('V12-TEST-SUBSTRING'));
});

test('duplicate, unknown, or invalid reconciliation rows are rejected', () => {
  const row = '| `V12-TEST-UNKNOWN` | `RETAIN_UNTIL_AMENDMENT_APPROVED` | test |';
  assert.throws(
    () => buildR1Inventory({ source, legacy, reconciliation: `${reconciliation}\n${row}\n${row}` }),
    /duplicate legacy reconciliation disposition/,
  );
  assert.throws(
    () =>
      buildR1Inventory({
        source,
        legacy,
        reconciliation: `${reconciliation}\n| \`V12-TEST-UNKNOWN\` | \`MADE_UP\` | test |`,
      }),
    /invalid legacy reconciliation disposition/,
  );
  assert.throws(
    () => buildR1Inventory({ source, legacy, reconciliation: `${reconciliation}\n${row}` }),
    /do not exactly cover unlinked items/,
  );
});

test('legacy lineage count, source identity, and unique IDs fail closed', () => {
  assert.throws(
    () =>
      buildR1Inventory({ source, legacy: { ...legacy, totalSourceItems: 318 }, reconciliation }),
    /historical legacy inventory count mismatch/,
  );
  assert.throws(
    () =>
      buildR1Inventory({
        source,
        legacy: { ...legacy, sourceSha256: '0'.repeat(64) },
        reconciliation,
      }),
    /historical legacy source hash mismatch/,
  );
  const duplicateIds = structuredClone(legacy);
  duplicateIds.items[1].id = duplicateIds.items[0].id;
  assert.throws(
    () => buildR1Inventory({ source, legacy: duplicateIds, reconciliation }),
    /IDs are invalid or duplicated/,
  );
});

test('the scope parser excludes historical change log and positioning while retaining base and amendments', () => {
  const parsed = parseContentBlocks(source);
  assert.ok(parsed.some((item) => item.section === '1'));
  assert.ok(
    parsed.some(
      (item) => item.section === 'A1' && item.authorityDisposition === 'PENDING_AMENDMENT',
    ),
  );
  assert.ok(
    parsed.some(
      (item) =>
        item.section === 'CR-07' && item.authorityDisposition === 'SCOPE_RECONCILIATION_REQUIRED',
    ),
  );
  assert.ok(parsed.every((item) => !['3', null].includes(item.section)));
});

test('the source parser retains the independently reviewed per-section census', () => {
  const sectionCounts = Object.groupBy(parseContentBlocks(source), (item) => item.section);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(sectionCounts).map(([section, items]) => [section, items.length]),
    ),
    {
      1: 16,
      2: 23,
      4: 161,
      5: 9,
      6: 24,
      7: 23,
      8: 10,
      9: 8,
      10: 13,
      11: 4,
      12: 13,
      13: 13,
      14: 5,
      15: 27,
      A1: 52,
      A2: 26,
      A3: 30,
      PCA: 10,
      'CR-07': 47,
      'CLEANUP-REFERENCE': 4,
    },
  );
});

test('the registered checker runs from the repository without printing source text', () => {
  const child = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./check-r1-requirement-inventory.mjs', import.meta.url))],
    { encoding: 'utf8' },
  );
  assert.equal(child.status, 0, child.stderr);
  assert.match(child.stdout, /^PASS R1 source inventory:/);
  assert.equal(child.stderr, '');
  assert.equal(child.stdout.includes('Resend'), false);
});
