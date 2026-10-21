import { randomUUID } from 'node:crypto';
import type { Database } from './database.js';

export type InAppNotification = {
  id: string;
  roundId: string;
  leadId: string;
  createdAt: Date;
  readAt: Date | null;
};

export type InAppNotificationList = {
  items: InAppNotification[];
  unreadCount: number;
};

/**
 * Materialize due interview reminders as owner-scoped in-app notifications.
 * The unique (owner, round, scheduled time) key makes repeated and concurrent
 * publisher passes idempotent; row locking prevents duplicate work where
 * multiple publisher instances are running. No message or contact data is
 * copied into the notification.
 */
export async function publishDueInterviewReminders(database: Database): Promise<number> {
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    const stale = await client.query<{ ownerId: string; roundId: string }>(
      `SELECT round.owner_id AS "ownerId", round.id AS "roundId"
       FROM interview_rounds round
       WHERE EXISTS (
         SELECT 1 FROM in_app_notifications notification
         WHERE notification.owner_id = round.owner_id
           AND notification.round_id = round.id
           AND notification.retired_at IS NULL
           AND NOT (
             round.status = 'scheduled' AND round.starts_at > now()
             AND round.reminder_at = notification.reminder_at
           )
       )
       ORDER BY round.id
       LIMIT 100
       FOR UPDATE OF round SKIP LOCKED`,
    );
    for (const round of stale.rows) {
      await client.query(
        `UPDATE in_app_notifications notification
         SET retired_at = now()
         WHERE notification.owner_id = $1 AND notification.round_id = $2
           AND notification.retired_at IS NULL
           AND NOT EXISTS (
             SELECT 1 FROM interview_rounds current_round
             WHERE current_round.owner_id = notification.owner_id
               AND current_round.id = notification.round_id
               AND current_round.status = 'scheduled'
               AND current_round.starts_at > now()
               AND current_round.reminder_at = notification.reminder_at
           )`,
        [round.ownerId, round.roundId],
      );
    }
    const due = await client.query<{
      ownerId: string;
      roundId: string;
    }>(
      `SELECT round.owner_id AS "ownerId", round.id AS "roundId"
       FROM interview_rounds round
       WHERE round.status = 'scheduled' AND round.reminder_at <= now()
         AND round.starts_at > now()
         AND NOT EXISTS (
           SELECT 1 FROM in_app_notifications notification
           WHERE notification.owner_id = round.owner_id
             AND notification.round_id = round.id
             AND notification.reminder_at = round.reminder_at
         )
       ORDER BY round.reminder_at, round.id
       LIMIT 100
       FOR UPDATE OF round SKIP LOCKED`,
    );
    let created = 0;
    for (const reminder of due.rows) {
      const inserted = await client.query(
        `INSERT INTO in_app_notifications (id, owner_id, round_id, reminder_at)
         SELECT $1, round.owner_id, round.id, round.reminder_at
         FROM interview_rounds round
         WHERE round.owner_id = $2 AND round.id = $3
           AND round.status = 'scheduled' AND round.reminder_at <= now()
           AND round.starts_at > now()
         ON CONFLICT (owner_id, round_id, reminder_at) DO NOTHING
         RETURNING id`,
        [randomUUID(), reminder.ownerId, reminder.roundId],
      );
      created += inserted.rowCount ?? 0;
    }
    await client.query('COMMIT');
    return created;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export class InAppNotificationRepository {
  constructor(private readonly database: Database) {}

  async list(ownerId: string): Promise<InAppNotificationList> {
    const result = await this.database.pool.query<InAppNotification & { unreadCount: string }>(
      `SELECT notification.id, notification.round_id AS "roundId",
              round.lead_id AS "leadId", notification.created_at AS "createdAt",
              notification.read_at AS "readAt",
              COUNT(*) FILTER (WHERE notification.read_at IS NULL) OVER () AS "unreadCount"
       FROM in_app_notifications notification
       JOIN interview_rounds round
         ON round.owner_id = notification.owner_id AND round.id = notification.round_id
       WHERE notification.owner_id = $1
         AND notification.retired_at IS NULL
         AND round.status = 'scheduled'
         AND round.starts_at > now()
         AND round.reminder_at = notification.reminder_at
       ORDER BY notification.created_at DESC, notification.id DESC
       LIMIT 50`,
      [ownerId],
    );
    const unreadCount = Number(result.rows[0]?.unreadCount ?? 0);
    const items = result.rows.map(({ unreadCount: _unreadCount, ...item }) => item);
    return { items, unreadCount };
  }

  async markRead(ownerId: string, id: string): Promise<boolean> {
    const result = await this.database.pool.query(
      `UPDATE in_app_notifications notification
       SET read_at = COALESCE(notification.read_at, now())
       WHERE notification.owner_id = $1 AND notification.id = $2
         AND notification.retired_at IS NULL
         AND EXISTS (
           SELECT 1 FROM interview_rounds round
           WHERE round.owner_id = notification.owner_id
             AND round.id = notification.round_id
             AND round.status = 'scheduled'
             AND round.starts_at > now()
             AND round.reminder_at = notification.reminder_at
         )
       RETURNING notification.id`,
      [ownerId, id],
    );
    return result.rowCount === 1;
  }
}
