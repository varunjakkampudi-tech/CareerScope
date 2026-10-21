import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import {
  Auth,
  Database,
  refreshCookie,
  ResumeUploadRepository,
  sessionCookie,
} from '@careerscope/core';
import { createApp } from './app.js';

test(
  'interview rounds are candidate-owned, revision guarded, and do not imply an application event',
  { timeout: 60_000 },
  async () => {
    const configuredDatabase = process.env.DATABASE_URL;
    assert.ok(configuredDatabase, 'integration test requires an isolated DATABASE_URL');
    const databaseUrl = new URL(configuredDatabase);
    assert.ok(['127.0.0.1', 'localhost'].includes(databaseUrl.hostname));

    const admin = new Database(configuredDatabase);
    const name = `test_${randomUUID().replaceAll('-', '')}`;
    await admin.pool.query(`CREATE DATABASE "${name}"`);
    databaseUrl.pathname = `/${name}`;
    const database = new Database(databaseUrl.href);
    const origin = 'https://careerscope.test';
    let app: FastifyInstance | undefined;

    try {
      await migrate(database.db, {
        migrationsFolder: fileURLToPath(new URL('../../../migrations', import.meta.url)),
      });
      const ownerId = randomUUID();
      const otherOwnerId = randomUUID();
      const ownLeadId = randomUUID();
      const foreignLeadId = randomUUID();
      await database.pool.query('INSERT INTO users (id, email) VALUES ($1, $2), ($3, $4)', [
        ownerId,
        `${ownerId}@example.test`,
        otherOwnerId,
        `${otherOwnerId}@example.test`,
      ]);
      await database.pool.query(
        `INSERT INTO saved_leads (id, owner_id, fingerprint, data, status)
         VALUES ($1, $2, $3, '{}'::jsonb, 'saved'), ($4, $5, $6, '{}'::jsonb, 'saved')`,
        [
          ownLeadId,
          ownerId,
          `own-${ownLeadId}`,
          foreignLeadId,
          otherOwnerId,
          `foreign-${foreignLeadId}`,
        ],
      );

      const auth = new Auth(database);
      const credentials = await auth.loginWithVerifiedEmail(`${ownerId}@example.test`);
      const otherCredentials = await auth.loginWithVerifiedEmail(`${otherOwnerId}@example.test`);
      assert.ok(credentials);
      assert.ok(otherCredentials);
      const session = await auth.session(credentials.accessToken);
      const otherSession = await auth.session(otherCredentials.accessToken);
      assert.ok(session);
      assert.ok(otherSession);
      const cookie = `${sessionCookie}=${credentials.accessToken}; ${refreshCookie}=${credentials.refreshToken}`;
      const otherCookie = `${sessionCookie}=${otherCredentials.accessToken}; ${refreshCookie}=${otherCredentials.refreshToken}`;
      app = await createApp(database, origin, async () => true, {
        testAccess: { mode: 'disabled' },
      });

      const uploadId = randomUUID();
      const parseCommandId = randomUUID();
      await database.pool.query('INSERT INTO outbox_events (id, command) VALUES ($1, $2::jsonb)', [
        parseCommandId,
        JSON.stringify({ id: parseCommandId, type: 'resume.parse', version: 1 }),
      ]);
      await database.pool.query(
        `INSERT INTO resume_uploads
          (id, owner_id, idempotency_key, bucket, sha256, bytes, content_type,
           object_version, command_id, status)
         VALUES ($1, $2, 'interviewdoc1', 'careerscope-private', $3, 64,
           'application/pdf', 'synthetic-version', $4, 'queued')`,
        [uploadId, ownerId, 'a'.repeat(64), parseCommandId],
      );
      await database.pool.query(
        `INSERT INTO resume_results (upload_id, owner_id, command_id, status, parsed)
         VALUES ($1, $2, $3, 'parsed', '{}'::jsonb)`,
        [uploadId, ownerId, parseCommandId],
      );

      const input = {
        title: 'Technical interview',
        startsAt: '2030-05-10T15:00:00.000Z',
        timeZone: 'Asia/Kolkata',
        format: 'video',
        status: 'scheduled',
        contacts: [{ name: 'Synthetic interviewer', role: 'Engineering', email: null }],
        checklist: [{ id: randomUUID(), label: 'Review system design notes', completed: false }],
        notes: 'Synthetic preparation note',
        reminderAt: '2030-05-10T14:00:00.000Z',
        resumeUploadIds: [uploadId],
      };
      const unauthenticated = await app.inject({ url: `/api/leads/${ownLeadId}/interviews` });
      assert.equal(unauthenticated.statusCode, 401);

      const create = await app.inject({
        method: 'POST',
        url: `/api/leads/${ownLeadId}/interviews`,
        headers: { origin, cookie, 'x-csrf-token': session.csrf },
        payload: input,
      });
      assert.equal(create.statusCode, 200, create.body);
      const round = create.json();
      assert.equal(round.leadId, ownLeadId);
      assert.equal(round.revision, 1);
      assert.equal(Object.hasOwn(round, 'ownerId'), false);
      assert.deepEqual(round.resumeUploadIds, [uploadId]);

      const ownList = await app.inject({
        url: `/api/leads/${ownLeadId}/interviews`,
        headers: { cookie },
      });
      assert.equal(ownList.statusCode, 200);
      assert.equal(ownList.json().items.length, 1);
      assert.equal(ownList.json().items[0].title, input.title);

      const foreignRead = await app.inject({
        url: `/api/leads/${ownLeadId}/interviews`,
        headers: { cookie: otherCookie },
      });
      assert.equal(foreignRead.statusCode, 404);
      const foreignWrite = await app.inject({
        method: 'POST',
        url: `/api/leads/${foreignLeadId}/interviews`,
        headers: { origin, cookie, 'x-csrf-token': session.csrf },
        payload: input,
      });
      assert.equal(foreignWrite.statusCode, 404);

      const invalidReminder = await app.inject({
        method: 'POST',
        url: `/api/leads/${ownLeadId}/interviews`,
        headers: { origin, cookie, 'x-csrf-token': session.csrf },
        payload: { ...input, reminderAt: input.startsAt },
      });
      assert.equal(invalidReminder.statusCode, 400);

      const csrfRejected = await app.inject({
        method: 'POST',
        url: `/api/leads/${ownLeadId}/interviews`,
        headers: { origin, cookie },
        payload: input,
      });
      assert.equal(csrfRejected.statusCode, 403);

      const updateInput = {
        ...input,
        status: 'completed',
        revision: round.revision,
      };
      const update = await app.inject({
        method: 'PUT',
        url: `/api/interviews/${round.id}`,
        headers: { origin, cookie, 'x-csrf-token': session.csrf },
        payload: updateInput,
      });
      assert.equal(update.statusCode, 200, update.body);
      assert.equal(update.json().status, 'completed');
      assert.equal(update.json().revision, 2);

      const staleUpdate = await app.inject({
        method: 'PUT',
        url: `/api/interviews/${round.id}`,
        headers: { origin, cookie, 'x-csrf-token': session.csrf },
        payload: updateInput,
      });
      assert.equal(staleUpdate.statusCode, 409);
      assert.equal(staleUpdate.json().code, 'INTERVIEW_REVISION_CONFLICT');
      assert.equal(staleUpdate.json().error, 'Interview round changed; reload before saving');

      const lead = await database.pool.query<{ status: string }>(
        'SELECT status FROM saved_leads WHERE owner_id = $1 AND id = $2',
        [ownerId, ownLeadId],
      );
      assert.equal(
        lead.rows[0]?.status,
        'saved',
        'a scheduled/completed round is not an application event',
      );

      const docs = await app.inject({ url: '/api/docs/json', headers: { cookie } });
      assert.equal(docs.statusCode, 200);
      assert.ok(docs.json().paths['/api/leads/{id}/interviews']?.get);
      assert.ok(docs.json().paths['/api/leads/{id}/interviews']?.post);
      assert.ok(docs.json().paths['/api/interviews/{id}']?.put);
      const listResponses = docs.json().paths['/api/leads/{id}/interviews']?.get.responses;
      assert.ok(listResponses?.['401']);
      assert.ok(listResponses?.['403']);
      const createResponses = docs.json().paths['/api/leads/{id}/interviews']?.post.responses;
      assert.ok(createResponses?.['401']);
      assert.ok(createResponses?.['403']);
      const updateResponses = docs.json().paths['/api/interviews/{id}']?.put.responses;
      assert.ok(updateResponses?.['401']);
      assert.ok(updateResponses?.['403']);

      let objectDeleted = false;
      assert.equal(
        await new ResumeUploadRepository(database).deleteSettled(ownerId, uploadId, async () => {
          objectDeleted = true;
        }),
        true,
      );
      assert.equal(objectDeleted, true);
      const afterResumeDelete = await app.inject({
        url: `/api/leads/${ownLeadId}/interviews`,
        headers: { cookie },
      });
      assert.deepEqual(afterResumeDelete.json().items[0].resumeUploadIds, []);
    } finally {
      await app?.close();
      await database.close();
      await admin.pool.query(`DROP DATABASE "${name}"`);
      await admin.close();
    }
  },
);
