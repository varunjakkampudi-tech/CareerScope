import assert from 'node:assert/strict';
import test from 'node:test';
import { staleSavedRead, staleSearchRead } from './ui-requests.js';

test('settlement drops only saved-job reads belonging to an earlier route', () => {
  assert.equal(staleSavedRead('GET', '/api/leads', 1, 2), true);
  assert.equal(staleSavedRead('GET', '/api/leads/synthetic/history', 1, 2), true);
  // Current dashboard reads still count, even though the endpoint is shared.
  assert.equal(staleSavedRead('GET', '/api/leads', 2, 2), false);
  assert.equal(staleSavedRead('GET', '/api/leads/synthetic/history', 2, 2), false);
  // Writes and unrelated requests must never disappear from the barrier.
  assert.equal(staleSavedRead('POST', '/api/leads', 1, 2), false);
  assert.equal(staleSavedRead('PUT', '/api/leads/synthetic', 1, 2), false);
  assert.equal(staleSavedRead('GET', '/api/searches', 1, 2), false);
  assert.equal(staleSavedRead('GET', '/api/profile', 1, 2), false);
});

test('settlement drops only search list/detail reads belonging to an earlier route', () => {
  assert.equal(staleSearchRead('GET', '/api/searches', 1, 2), true);
  assert.equal(staleSearchRead('GET', '/api/searches/synthetic-run-id', 1, 2), true);
  assert.equal(staleSearchRead('GET', '/api/searches', 2, 2), false);
  assert.equal(staleSearchRead('GET', '/api/searches/synthetic-run-id', 2, 2), false);
  assert.equal(staleSearchRead('POST', '/api/searches', 1, 2), false);
  assert.equal(staleSearchRead('GET', '/api/searches/synthetic-run-id/events', 1, 2), false);
  assert.equal(staleSearchRead('GET', '/api/profile', 1, 2), false);
});
