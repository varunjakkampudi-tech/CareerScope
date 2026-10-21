import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderR1Inventory } from './r1-requirement-inventory.mjs';

const root = new URL('../docs/requirements/', import.meta.url);
const source = readFileSync(
  new URL('source-revisions/2026-10-20/CareerScope-v12.md', root),
  'utf8',
);
const legacy = JSON.parse(readFileSync(new URL('V12-REQUIREMENT-INVENTORY.json', root), 'utf8'));
const reconciliation = readFileSync(new URL('SOURCE-RECONCILIATION-2026-10-21.md', root), 'utf8');
const output = new URL('V12-R1-REQUIREMENT-INVENTORY.json', root);

writeFileSync(fileURLToPath(output), await renderR1Inventory({ source, legacy, reconciliation }));
process.stdout.write('Generated deterministic R1 source-content inventory.\n');
