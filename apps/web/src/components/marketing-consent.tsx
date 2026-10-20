'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function MarketingConsent() {
  const session = useSession();
  const enabled = session.data?.otpEnabled === true;
  const csrf = session.data?.csrf ?? '';
  const [optedIn, setOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    api<{ optedIn: boolean }>('/account/marketing-consent')
      .then((result) => {
        if (active) setOptedIn(result.optedIn);
      })
      .catch((failure: unknown) => {
        if (active)
          setError(failure instanceof Error ? failure.message : 'Could not load this preference.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled, loadAttempt]);

  function retryLoad() {
    setError('');
    setLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function updatePreference(next: boolean) {
    if (saving) return;
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const result = await api<{ optedIn: boolean }>('/account/marketing-consent', {
        method: 'PUT',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({ optedIn: next }),
      });
      setOptedIn(result.optedIn);
      setStatus(
        result.optedIn ? 'Optional product updates enabled.' : 'Optional product updates disabled.',
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not update this preference.');
    } finally {
      setSaving(false);
    }
  }

  if (!enabled) return null;
  return (
    <section className="login" aria-labelledby="marketing-consent-heading">
      <h2 id="marketing-consent-heading">Optional product updates</h2>
      <p>Marketing messages are optional and separate from account and security emails.</p>
      {error && <p role="alert">{error}</p>}
      {error && (
        <button type="button" onClick={retryLoad} disabled={loading}>
          Retry loading preference
        </button>
      )}
      {status && (
        <p role="status" aria-live="polite">
          {status}
        </p>
      )}
      <label>
        <input
          type="checkbox"
          checked={optedIn}
          disabled={loading || saving || Boolean(error)}
          onChange={(event) => void updatePreference(event.target.checked)}
        />{' '}
        Email me optional CareerScope product updates
      </label>
      {(loading || saving) && (
        <p role="status">{saving ? 'Saving preference…' : 'Loading preference…'}</p>
      )}
    </section>
  );
}
