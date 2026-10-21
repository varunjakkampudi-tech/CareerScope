import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { approvedSources, checkApprovedSources } from './check-approved-sources.mjs';

const read = (name) => readFileSync(new URL(`../docs/requirements/${name}`, import.meta.url));

test('the registered source-integrity CLI executes successfully from the repository', () => {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./check-approved-sources.mjs', import.meta.url))],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'PASS 6 approved source snapshots unchanged');
  assert.equal(result.stderr, '');
});

test('all historical and revised approved source snapshots retain their content identities', () => {
  assert.deepEqual(checkApprovedSources(read), []);
});

test('each missing source fails independently without leaking exception contents', () => {
  for (const [missing] of approvedSources) {
    assert.deepEqual(
      checkApprovedSources((name) => {
        if (name === missing) throw new Error('synthetic-private-diagnostic');
        return read(name);
      }),
      [`${missing}: approved snapshot unavailable`],
    );
  }
});

test('each substantive source mutation is refused, not silently re-approved', () => {
  for (const [changed] of approvedSources) {
    assert.deepEqual(
      checkApprovedSources((name) =>
        name === changed
          ? Buffer.concat([read(name), Buffer.from('altered requirement')])
          : read(name),
      ),
      [`${changed}: approved snapshot changed`],
    );
  }
});

test('the source inventory names unique real clauses rather than fabricated requirements', () => {
  const inventory = JSON.parse(
    readFileSync(
      new URL('../docs/requirements/V12-REQUIREMENT-INVENTORY.json', import.meta.url),
      'utf8',
    ),
  );
  const sourceLines = read('CareerScope-v12.md').toString('utf8').split('\n');
  assert.equal(inventory.totalSourceItems, inventory.items.length);
  assert.equal(new Set(inventory.items.map((item) => item.id)).size, inventory.items.length);
  assert.equal(
    new Set(inventory.items.map((item) => item.sourceLine)).size,
    inventory.items.length,
  );
  for (const item of inventory.items) {
    assert.ok(Number.isInteger(item.sourceLine) && item.sourceLine > 0);
    assert.equal(sourceLines[item.sourceLine - 1]?.trim(), item.text, item.id);
    assert.ok(item.id.startsWith(`V12-${item.section}-`), item.id);
    assert.notEqual(item.section, '3', 'Historical change rows are not new launch requirements');
  }
});
