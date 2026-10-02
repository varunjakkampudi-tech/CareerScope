import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';
import { chromium } from 'playwright';

const port = 18000 + Math.floor(Math.random() * 1000);
const origin = `http://127.0.0.1:${port}`;

test('engineering board renders canonical workflow and blocker behavior', async () => {
  const child = spawn(process.execPath, ['scripts/engineering-ui.mjs'], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let resolveReady;
  let rejectReady;
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
    setTimeout(() => reject(new Error(`board server did not start: ${output}`)), 10000);
  });
  child.stdout.on('data', (chunk) => {
    output += String(chunk);
    if (output.includes(`127.0.0.1:${port}`)) resolveReady();
  });
  child.stderr.on('data', (chunk) => {
    output += String(chunk);
  });
  child.once('exit', (code, signal) => {
    rejectReady(new Error(`board server exited (${code ?? signal}): ${output}`));
  });
  const browser = await chromium.launch({ headless: true });
  try {
    await ready;
    const page = await browser.newPage();
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Backlog' }).click();
    await assert.rejects(async () => page.getByText('State unavailable').waitFor({ timeout: 250 }));
    assert.equal(await page.locator('.board .col').count(), 6);
    assert.deepEqual(
      (await page.locator('.board .colhead').allTextContents()).map((text) =>
        text.replace(/\d+$/, ''),
      ),
      ['Backlog', 'To Do', 'In Progress', 'QA', 'UAT', 'Production'],
    );
    assert.equal(await page.getByText('Nothing queued').count(), 1);
    assert.equal(await page.getByText('Nothing in flight').count(), 1);
    assert.equal(await page.getByText('Nothing released yet').count(), 1);
    assert.equal(await page.getByText('Blocked metadata').count(), 1);
    assert.equal(await page.getByText('Blocked', { exact: true }).count(), 0);

    const before = await (await fetch(`${origin}/state`)).json();
    const allCards = await page.locator('.bcard').count();
    const blockedCards = await page.locator('.bcard.blocked').count();
    assert.ok(blockedCards > 0);
    assert.ok(allCards > blockedCards);
    assert.equal(await page.getByRole('button', { name: 'Show blocked only' }).count(), 1);
    await page.getByRole('button', { name: 'Show blocked only' }).click();
    assert.equal(await page.locator('.bcard').count(), blockedCards);
    assert.equal(await page.locator('.bcard.blocked').count(), blockedCards);
    assert.equal(await page.getByRole('button', { name: 'Show all tickets' }).count(), 1);
    const after = await (await fetch(`${origin}/state`)).json();
    assert.deepEqual(
      after.backlog.items,
      before.backlog.items,
      'filter must not mutate ticket state',
    );
  } finally {
    await browser.close();
    child.kill('SIGTERM');
    await once(child, 'exit').catch(() => undefined);
  }
});
