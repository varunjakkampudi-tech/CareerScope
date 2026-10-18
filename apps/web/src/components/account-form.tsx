'use client';

import { useState } from 'react';
import { LoaderCircle, User, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export default function AccountForm({
  testUsersEnabled = false,
  accounts = [],
  expired,
  notice = '',
  onAuthenticated,
}: {
  registrationEnabled?: boolean;
  testUsersEnabled?: boolean;
  accounts?: { email: string; role: 'candidate' | 'admin' }[];
  expired: boolean;
  notice?: string;
  onAuthenticated: () => void | Promise<void>;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function selectUser(email: string) {
    if (pending) return;
    setError('');
    setPending(email);
    try {
      await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      await onAuthenticated();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Request failed. Please try again.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="login" aria-labelledby="account-heading">
      <h1 id="account-heading">Select test account</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Choose a role to enter the workspace. No password required.
      </p>
      {(error || expired) && (
        <p role="alert">
          {error || 'Your session has expired. Any unsaved changes were not saved.'}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {accounts.map((user) => {
          const Icon = user.role === 'admin' ? ShieldCheck : User;
          const isLoading = pending === user.email;
          return (
            <button
              key={user.email}
              className="primary"
              disabled={!testUsersEnabled || pending !== null}
              onClick={() => selectUser(user.email)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                textAlign: 'left',
              }}
            >
              {isLoading ? (
                <LoaderCircle className="spin" size={24} aria-hidden="true" />
              ) : (
                <Icon size={24} aria-hidden="true" />
              )}
              <span>
                <strong style={{ display: 'block' }}>
                  {user.role === 'admin' ? 'Admin' : 'Candidate'}
                </strong>
                <small>{user.email}</small>
                <br />
                <small style={{ fontSize: '0.8em' }}>
                  {user.role === 'admin'
                    ? 'Isolated admin test workspace; privileged administration is not enabled'
                    : 'Search jobs and track your own applications'}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
