import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const checker = resolve('scripts/check-deploy-gate.mjs');

function runWithWorkflows(files) {
  const root = mkdtempSync(join(tmpdir(), 'careerscope-deploy-gate-'));
  const workflowDir = join(root, '.github', 'workflows');
  mkdirSync(workflowDir, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(workflowDir, name), contents, 'utf8');
  }

  try {
    const result = spawnSync(process.execPath, [checker], {
      cwd: root,
      encoding: 'utf8',
    });
    return {
      status: result.status,
      output: `${result.stdout}\n${result.stderr}`,
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('CI validation is allowed without a deployment workflow', () => {
  const result = runWithWorkflows({
    'ci.yml': [
      'name: CI',
      'on:',
      '  push:',
      'permissions:',
      '  contents: read',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    steps: []',
      '',
    ].join('\n'),
  });

  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /CI has explicit least-privilege workflow permissions/);
});

test('absence of both workflows keeps deployment automation disabled', () => {
  const result = runWithWorkflows({});

  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /No CI workflow exists; deployment automation is disabled\./);
});

test('a deployment workflow without a CI workflow is rejected', () => {
  const result = runWithWorkflows({
    'deploy.yml': 'name: Deploy\non:\n  workflow_dispatch:\n',
  });

  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /deployment requires a CI workflow/);
});

test('CI cannot select the production environment', () => {
  const result = runWithWorkflows({
    'ci.yml': [
      'name: CI',
      'on:',
      '  push:',
      'permissions:',
      '  contents: read',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    environment: production',
      '    steps: []',
      '',
    ].join('\n'),
  });

  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /CI does not select a production environment/);
});

test('CI cannot dispatch the deployment workflow from a multiline step', () => {
  const result = runWithWorkflows({
    'ci.yml': [
      'name: CI',
      'on:',
      '  push:',
      'permissions:',
      '  contents: read',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - name: Deploy',
      '        run: |',
      '          gh workflow run deploy.yml',
      '',
    ].join('\n'),
  });

  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /CI does not invoke deployment workflow/);
});
