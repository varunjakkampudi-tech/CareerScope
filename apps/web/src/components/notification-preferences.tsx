'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NO_OWNER, useSession } from '@/lib/session';
import { ErrorState, LoadingState } from './ui-states';
import styles from './notification-preferences.module.css';

type NotificationPreferences = { interviewRemindersInAppEnabled: boolean };

export default function NotificationPreferences() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [refreshedAfterSave, setRefreshedAfterSave] = useState(false);
  const [preferenceUnconfirmed, setPreferenceUnconfirmed] = useState(false);
  const owner = session.data?.owner ?? NO_OWNER;
  const preferences = useQuery({
    queryKey: ['notificationPreferences', owner],
    queryFn: () => api<NotificationPreferences>('/notifications/preferences'),
    enabled: session.data?.authenticated === true && !!session.data.owner,
  });

  async function changePreference(enabled: boolean) {
    if (saving || preferenceUnconfirmed) return;
    setSaving(true);
    setSaved(false);
    setRefreshedAfterSave(false);
    try {
      const updated = await api<NotificationPreferences>('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ interviewRemindersInAppEnabled: enabled }),
      });
      queryClient.setQueryData(['notificationPreferences', owner], updated);
      setSaved(true);
    } catch {
      // A failed response does not prove the write failed: the server may have
      // committed before a proxy/network error. Hide the cached checkbox until
      // a fresh read succeeds, so it cannot imply an unconfirmed setting.
      setPreferenceUnconfirmed(true);
      const refreshed = await preferences.refetch();
      if (refreshed.isSuccess && refreshed.data) {
        setPreferenceUnconfirmed(false);
        setRefreshedAfterSave(true);
      }
    } finally {
      setSaving(false);
    }
  }

  async function retryPreferenceRead() {
    const refreshed = await preferences.refetch();
    if (refreshed.isSuccess && refreshed.data) {
      setPreferenceUnconfirmed(false);
    } else setPreferenceUnconfirmed(true);
  }

  return (
    <section className={styles.panel} aria-labelledby="notification-preferences-heading">
      <div className={styles.heading}>
        <h2 id="notification-preferences-heading">Notification preferences</h2>
        <p>Choose whether due interview reminders appear in your in-app notifications.</p>
      </div>
      {preferences.isLoading && <LoadingState variant="inline" message="Loading preferences…" />}
      {(preferences.isError || preferenceUnconfirmed) && (
        <ErrorState
          title="Notification preferences could not be loaded"
          message={
            preferenceUnconfirmed
              ? 'The saved value is not confirmed. Reload it before making another change.'
              : 'Check your connection and try again.'
          }
          onRetry={() => void retryPreferenceRead()}
        />
      )}
      {preferences.data && !preferences.isError && !preferenceUnconfirmed && (
        <div className={styles.control}>
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={preferences.data.interviewRemindersInAppEnabled}
              disabled={saving}
              aria-describedby="interview-reminder-preference-note"
              onChange={(event) => void changePreference(event.currentTarget.checked)}
            />
            <span>Show upcoming interview reminders in CareerScope</span>
          </label>
          <p className={styles.note} id="interview-reminder-preference-note">
            This affects new reminders only. Existing reminders remain in your notification list.
            Email and push reminders are not controlled here.
          </p>
          {saving && <p role="status">Saving notification preference…</p>}
          {saved && <p role="status">Notification preference saved.</p>}
          {refreshedAfterSave && <p role="status">Current preference reloaded from the server.</p>}
        </div>
      )}
    </section>
  );
}
