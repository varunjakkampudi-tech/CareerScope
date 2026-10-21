import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { buildR1Inventory } from './r1-requirement-inventory.mjs';

const root = new URL('../docs/requirements/', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

try {
  const source = read('source-revisions/2026-10-20/CareerScope-v12.md');
  const legacy = JSON.parse(read('V12-REQUIREMENT-INVENTORY.json'));
  const reconciliation = read('SOURCE-RECONCILIATION-2026-10-21.md');
  const actual = JSON.parse(read('V12-R1-REQUIREMENT-INVENTORY.json'));
  const expected = buildR1Inventory({ source, legacy, reconciliation });
  if (!isDeepStrictEqual(actual, expected))
    throw new Error('generated inventory is stale or altered');
  process.stdout.write(
    `PASS R1 source inventory: ${actual.totalItems} source blocks; ${actual.legacyInventory.exactTextLinkedCount}/${actual.legacyInventory.totalSourceItems} exact legacy links; ${actual.legacyInventory.nonExactDispositionCount} documented non-exact dispositions.\n`,
  );
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'R1 inventory validation failed'}\n`,
  );
  process.exitCode = 1;
}
