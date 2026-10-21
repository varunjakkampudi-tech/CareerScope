'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, LoaderCircle, LogOut } from 'lucide-react';
import { api } from '../lib/api';
import { NO_OWNER, useSession } from '../lib/session';
import { ErrorState } from './ui-states';

type AccountSession = {
  id: string;
  createdAt: string | null;
  lastUsedAt: string | null;
  deviceLabel: string;
  current: boolean;
};

type MarketingConsent = { optedIn: boolean; version: string | null };

function dateLabel(value: string | null): string {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toLocaleString();
}

export default function AccountSecurity({
  csrf,
  onChanged,
  onBack,
}: {
  csrf: string;
  onChanged: () => void;
  onBack: () => void;
}) {
  const session = useSession();
  const queryClient = useQueryClient();
  const testMode = session.data?.testUser !== undefined;
  const sessionsQuery = useQuery({
    queryKey: ['accountSessions', session.data?.owner ?? NO_OWNER],
    queryFn: () => api<{ sessions: AccountSession[] }>('/account/sessions'),
    enabled: session.data?.authenticated === true && !!session.data.owner,
  });
  const marketingQuery = useQuery({
    queryKey: ['marketingConsent', session.data?.owner ?? NO_OWNER],
    queryFn: () => api<MarketingConsent>('/account/marketing-consent'),
    enabled: session.data?.authenticated === true && !!session.data.owner,
  });
  const [pending, setPending] = useState(false);
  // CS-13 re-review: this component makes two real network calls but imports
  // no react-query hook, so the F-4 census — which proxied "async-bearing" as
  // "imports useQuery/useMutation/useInfiniteQuery" — excluded it by the
  // stated rule while it was async-bearing in substance. The proxy and the
  // property came apart here, and exactly here.
  //
  // `error` carries two different kinds of thing: CLIENT VALIDATION, which is
  // correctly out of scope for the page-level state contract, and the API
  // failure from the `catch` below, which is not. They are distinguished by
  // whether `what` is present rather than by a separate state, because both
  // render into the one element that `aria-describedby` points at and two
  // states could both be set.
  const [error, setError] = useState<{ what?: string; detail: string } | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState('');
  const [notice, setNotice] = useState('');
  const [marketingPending, setMarketingPending] = useState(false);
  const [marketingError, setMarketingError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [currentEmailCode, setCurrentEmailCode] = useState('');
  const [newEmailCode, setNewEmailCode] = useState('');
  const [currentEmailVerified, setCurrentEmailVerified] = useState(false);
  const [newEmailVerified, setNewEmailVerified] = useState(false);
  const [emailChangePending, setEmailChangePending] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeNotice, setEmailChangeNotice] = useState('');
  const busy = pending || revoking;

  async function requestEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailChangePending) return;
    setEmailChangePending(true);
    setEmailChangeError('');
    setEmailChangeNotice('');
    try {
      await api('/account/email-change/request', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({ newEmail }),
      });
      setEmailChangeRequested(true);
      setCurrentEmailVerified(false);
      setNewEmailVerified(false);
      setCurrentEmailCode('');
      setNewEmailCode('');
      setEmailChangeNotice('Codes were sent to your current and new email addresses.');
    } catch (failure) {
      setEmailChangeError(
        failure instanceof Error
          ? failure.message
          : 'Please try again when your connection is available.',
      );
    } finally {
      setEmailChangePending(false);
    }
  }

  async function verifyEmailChange(address: 'current' | 'new') {
    if (emailChangePending) return;
    const code = address === 'current' ? currentEmailCode : newEmailCode;
    setEmailChangePending(true);
    setEmailChangeError('');
    setEmailChangeNotice('');
    try {
      const result = await api<{ verified: 'current' | 'new'; emailChanged: boolean }>(
        '/account/email-change/verify',
        {
          method: 'POST',
          headers: { 'x-csrf-token': csrf },
          body: JSON.stringify({ address, code }),
        },
      );
      if (result.emailChanged) {
        setEmailChangeRequested(false);
        setNewEmail('');
        setEmailChangeNotice(
          'Email address updated. The previous address received a verification notice.',
        );
        await queryClient.invalidateQueries({ queryKey: ['session'] });
      } else if (address === 'current') {
        setCurrentEmailVerified(true);
        setEmailChangeNotice('Current address verified. Now verify the new address.');
      } else {
        setNewEmailVerified(true);
        setEmailChangeNotice('New address verified. Now verify the current address.');
      }
    } catch (failure) {
      setEmailChangeError(
        failure instanceof Error
          ? failure.message
          : 'Please try again when your connection is available.',
      );
    } finally {
      setEmailChangePending(false);
    }
  }

  async function revokeOthers() {
    if (busy || !window.confirm('Sign out all other sessions? This session will stay signed in.'))
      return;
    setSessionError('');
    setNotice('');
    setRevoking(true);
    try {
      await api('/account/sessions/revoke-others', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({}),
      });
      setNotice('Other sessions signed out. This session remains signed in.');
    } catch (failure) {
      // The fallback no longer repeats the operation name — `what` carries it.
      setSessionError(failure instanceof Error ? failure.message : 'Please try again.');
    } finally {
      setRevoking(false);
    }
  }

  async function revokeSession(target: AccountSession) {
    if (
      busy ||
      target.current ||
      !window.confirm(`Sign out ${target.deviceLabel}? That device will need to sign in again.`)
    )
      return;
    setSessionError('');
    setNotice('');
    setRevokingSessionId(target.id);
    try {
      await api(`/account/sessions/${target.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['accountSessions'] });
      setNotice(`${target.deviceLabel} signed out.`);
    } catch (failure) {
      setSessionError(failure instanceof Error ? failure.message : 'Please try again.');
    } finally {
      setRevokingSessionId(null);
    }
  }

  async function updateMarketingConsent() {
    if (!marketingQuery.data || marketingPending) return;
    setMarketingPending(true);
    setMarketingError('');
    try {
      await api('/account/marketing-consent', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({ optIn: !marketingQuery.data.optedIn }),
      });
      await queryClient.invalidateQueries({ queryKey: ['marketingConsent'] });
    } catch (failure) {
      setMarketingError(
        failure instanceof Error
          ? failure.message
          : 'Please try again when your connection is available.',
      );
    } finally {
      setMarketingPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get('currentPassword'));
    const newPassword = String(data.get('newPassword'));
    setError(null);
    if (newPassword !== data.get('confirmation')) {
      // Client validation: deliberately left as a bare detail. It is a
      // field-level message, not a page-level error state, and it already
      // names its own problem.
      setError({ detail: 'Passwords do not match.' });
      form.querySelector<HTMLInputElement>('[name="confirmation"]')?.focus();
      return;
    }
    if (currentPassword === newPassword) {
      setError({ detail: 'Choose a different password.' });
      return;
    }
    if (!window.confirm('Change password and sign out all sessions?')) return;
    setPending(true);
    try {
      await api('/account/password', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      onChanged();
    } catch (failure) {
      // The API failure, unlike the validation branches above, is a real
      // operation failing and must name what failed.
      setError({
        what: 'Could not change your password.',
        detail: failure instanceof Error ? failure.message : 'Please try again.',
      });
    } finally {
      form.reset();
      setPending(false);
    }
  }

  return (
    <section className="login" aria-labelledby="security-heading">
      <button type="button" onClick={onBack} disabled={busy}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to search
      </button>
      <h1 id="security-heading">Account security</h1>
      {session.data?.authenticated && !testMode && (
        <p role="status">
          {session.data.emailVerifiedAt
            ? `Email verified on ${dateLabel(session.data.emailVerifiedAt)}.`
            : 'Email verification is not recorded.'}
        </p>
      )}
      {!testMode && session.data?.emailOtpEnabled && (
        <section aria-labelledby="email-change-heading">
          <h2 id="email-change-heading">Change sign-in email</h2>
          <p>Current email: {session.data.email ?? 'Not available'}</p>
          {!emailChangeRequested ? (
            <form onSubmit={requestEmailChange} aria-busy={emailChangePending}>
              <label>
                New email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  disabled={emailChangePending}
                />
              </label>
              <button type="submit" disabled={emailChangePending}>
                {emailChangePending ? 'Sending verification codes…' : 'Send verification codes'}
              </button>
            </form>
          ) : (
            <div aria-busy={emailChangePending}>
              <p>
                Enter each six-digit code. Both addresses must be verified before the change takes
                effect.
              </p>
              <label>
                Code sent to current email
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={currentEmailCode}
                  onChange={(event) =>
                    setCurrentEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  disabled={emailChangePending || currentEmailVerified}
                />
              </label>
              <button
                type="button"
                onClick={() => void verifyEmailChange('current')}
                disabled={
                  emailChangePending || currentEmailVerified || currentEmailCode.length !== 6
                }
              >
                {currentEmailVerified ? 'Current email verified' : 'Verify current email'}
              </button>
              <label>
                Code sent to new email
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={newEmailCode}
                  onChange={(event) =>
                    setNewEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  disabled={emailChangePending || newEmailVerified}
                />
              </label>
              <button
                type="button"
                onClick={() => void verifyEmailChange('new')}
                disabled={emailChangePending || newEmailVerified || newEmailCode.length !== 6}
              >
                {newEmailVerified ? 'New email verified' : 'Verify new email'}
              </button>
            </div>
          )}
          {emailChangeError && <p role="alert">{emailChangeError}</p>}
          {emailChangeNotice && <p role="status">{emailChangeNotice}</p>}
        </section>
      )}
      <button type="button" onClick={revokeOthers} disabled={busy}>
        {revoking ? (
          <LoaderCircle className="spin" size={18} aria-hidden="true" />
        ) : (
          <LogOut size={18} aria-hidden="true" />
        )}
        {revoking ? 'Signing out other sessions' : 'Sign out other sessions'}
      </button>
      <section aria-labelledby="active-sessions-heading">
        <h2 id="active-sessions-heading">Active sessions</h2>
        {sessionsQuery.isPending ? (
          <p role="status">Loading active sessions…</p>
        ) : sessionsQuery.isError ? (
          <>
            <ErrorState
              variant="inline"
              what="Could not load active sessions."
              detail="Try again when your connection is available."
            />
            <button
              type="button"
              onClick={() => void sessionsQuery.refetch()}
              disabled={sessionsQuery.isFetching}
            >
              {sessionsQuery.isFetching ? 'Retrying…' : 'Retry'}
            </button>
          </>
        ) : sessionsQuery.data.sessions.length === 0 ? (
          <p>No active sessions are available to show.</p>
        ) : (
          <ul aria-label="Active devices and sessions">
            {sessionsQuery.data.sessions.map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.deviceLabel}</strong>
                  {item.current ? ' — This device' : ''}
                </p>
                <p>Started: {dateLabel(item.createdAt)}</p>
                <p>Last refreshed: {dateLabel(item.lastUsedAt)}</p>
                {!item.current && (
                  <button
                    type="button"
                    onClick={() => void revokeSession(item)}
                    disabled={busy || revokingSessionId !== null}
                    aria-label={`Sign out ${item.deviceLabel}`}
                  >
                    {revokingSessionId === item.id ? 'Signing out…' : 'Sign out this device'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="marketing-consent-heading">
        <h2 id="marketing-consent-heading">Optional product updates</h2>
        {marketingQuery.isPending ? (
          <p role="status">Loading marketing preference…</p>
        ) : marketingQuery.isError ? (
          <>
            <ErrorState
              variant="inline"
              what="Could not load your marketing preference."
              detail="Try again when your connection is available."
            />
            <button
              type="button"
              onClick={() => void marketingQuery.refetch()}
              disabled={marketingQuery.isFetching}
            >
              {marketingQuery.isFetching ? 'Retrying…' : 'Retry'}
            </button>
          </>
        ) : (
          <>
            <p>
              {marketingQuery.data.optedIn
                ? `You opted in to optional product updates${marketingQuery.data.version ? ` under version ${marketingQuery.data.version}` : ''}.`
                : 'You are not opted in to optional product updates.'}
            </p>
            {marketingError && (
              <ErrorState
                variant="inline"
                what="Could not update your marketing preference."
                detail={marketingError}
              />
            )}
            <button
              type="button"
              onClick={() => void updateMarketingConsent()}
              disabled={marketingPending}
            >
              {marketingPending
                ? 'Saving preference…'
                : marketingQuery.data.optedIn
                  ? 'Withdraw marketing consent'
                  : 'Opt in to product updates'}
            </button>
          </>
        )}
      </section>
      {sessionError && (
        <ErrorState
          variant="inline"
          what="Could not sign out other sessions."
          detail={sessionError}
        />
      )}
      {notice && <p role="status">{notice}</p>}
      {testMode ? (
        <p>
          Test accounts do not use application passwords. Hosted access is protected by the staging
          proxy.
        </p>
      ) : (
        <form onSubmit={submit} aria-busy={pending}>
          <label>
            Current password
            <input
              name="currentPassword"
              aria-describedby={error ? 'security-error' : undefined}
              type="password"
              autoComplete="current-password"
              required
              minLength={12}
              maxLength={256}
              disabled={busy}
            />
          </label>
          <label>
            New password
            <input
              name="newPassword"
              aria-describedby={error ? 'security-error' : undefined}
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={256}
              disabled={busy}
            />
          </label>
          <label>
            Confirm new password
            <input
              name="confirmation"
              aria-describedby={error ? 'security-error' : undefined}
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={256}
              disabled={busy}
            />
          </label>
          {error &&
            (error.what ? (
              <ErrorState
                variant="inline"
                id="security-error"
                what={error.what}
                detail={error.detail}
              />
            ) : (
              <p id="security-error" role="alert">
                {error.detail}
              </p>
            ))}
          <button className="primary" disabled={busy}>
            {pending ? (
              <LoaderCircle className="spin" size={18} aria-hidden="true" />
            ) : (
              <KeyRound size={18} aria-hidden="true" />
            )}
            {pending ? 'Changing password' : 'Change password'}
          </button>
        </form>
      )}
    </section>
  );
}
