'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, LoaderCircle, LogOut } from 'lucide-react';
import { ApiError, api } from '../lib/api';
import { NO_OWNER, useSession } from '../lib/session';
import {
  localizedApiErrorMessage,
  localizedText,
  localizedValue,
  useInterfaceLocale,
} from '../lib/locale';
import { ErrorState } from './ui-states';

type AccountSession = {
  id: string;
  createdAt: string | null;
  lastUsedAt: string | null;
  deviceLabel: string;
  current: boolean;
};

type MarketingConsent = { optedIn: boolean; version: string | null };

function dateLabel(value: string | null, locale: 'en' | 'te' | 'hi'): string {
  if (!value) return localizedText(locale, 'notAvailable');
  const parsed = new Date(value);
  const languageTag = locale === 'en' ? 'en-IN' : locale === 'te' ? 'te-IN' : 'hi-IN';
  return Number.isNaN(parsed.getTime())
    ? localizedText(locale, 'notAvailable')
    : parsed.toLocaleString(languageTag);
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
  const locale = useInterfaceLocale();
  const t = (key: Parameters<typeof localizedText>[1], value?: string | number) =>
    value === undefined ? localizedText(locale, key) : localizedValue(locale, key, value);
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
      setEmailChangeNotice(t('emailChangeCodesSent'));
    } catch (failure) {
      setEmailChangeError(
        failure instanceof ApiError
          ? localizedApiErrorMessage(locale, failure.status)
          : t('pleaseTryConnection'),
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
        setEmailChangeNotice(t('emailAddressUpdated'));
        await queryClient.invalidateQueries({ queryKey: ['session'] });
      } else if (address === 'current') {
        setCurrentEmailVerified(true);
        setEmailChangeNotice(t('currentAddressVerified'));
      } else {
        setNewEmailVerified(true);
        setEmailChangeNotice(t('newAddressVerified'));
      }
    } catch (failure) {
      setEmailChangeError(
        failure instanceof ApiError
          ? localizedApiErrorMessage(locale, failure.status)
          : t('pleaseTryConnection'),
      );
    } finally {
      setEmailChangePending(false);
    }
  }

  async function revokeOthers() {
    if (busy || !window.confirm(t('sessionSignOutAllConfirm'))) return;
    setSessionError('');
    setNotice('');
    setRevoking(true);
    try {
      await api('/account/sessions/revoke-others', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({}),
      });
      setNotice(t('otherSessionsSignedOut'));
    } catch (failure) {
      // The fallback no longer repeats the operation name — `what` carries it.
      setSessionError(
        failure instanceof ApiError
          ? localizedApiErrorMessage(locale, failure.status)
          : t('pleaseTryAgain'),
      );
    } finally {
      setRevoking(false);
    }
  }

  async function revokeSession(target: AccountSession) {
    if (busy || target.current || !window.confirm(t('signOutDeviceConfirm', target.deviceLabel)))
      return;
    setSessionError('');
    setNotice('');
    setRevokingSessionId(target.id);
    try {
      await api(`/account/sessions/${target.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['accountSessions'] });
      setNotice(t('deviceSignedOut', target.deviceLabel));
    } catch (failure) {
      setSessionError(
        failure instanceof ApiError
          ? localizedApiErrorMessage(locale, failure.status)
          : t('pleaseTryAgain'),
      );
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
        failure instanceof ApiError
          ? localizedApiErrorMessage(locale, failure.status)
          : t('pleaseTryConnection'),
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
      setError({ detail: t('passwordsDoNotMatch') });
      form.querySelector<HTMLInputElement>('[name="confirmation"]')?.focus();
      return;
    }
    if (currentPassword === newPassword) {
      setError({ detail: t('chooseDifferentPassword') });
      return;
    }
    if (!window.confirm(t('changePasswordSignOutConfirm'))) return;
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
        what: t('couldNotChangePassword'),
        detail:
          failure instanceof ApiError
            ? localizedApiErrorMessage(locale, failure.status)
            : t('pleaseTryAgain'),
      });
    } finally {
      form.reset();
      setPending(false);
    }
  }

  return (
    <section className="login" aria-labelledby="security-heading" lang={locale}>
      <button type="button" onClick={onBack} disabled={busy}>
        <ArrowLeft size={18} aria-hidden="true" />
        {t('backToSearch')}
      </button>
      <h1 id="security-heading">{t('accountSecurity')}</h1>
      {session.data?.authenticated && !testMode && (
        <p role="status">
          {session.data.emailVerifiedAt
            ? t('emailVerifiedOn', dateLabel(session.data.emailVerifiedAt, locale))
            : t('emailVerificationNotRecorded')}
        </p>
      )}
      {!testMode && session.data?.emailOtpEnabled && (
        <section aria-labelledby="email-change-heading">
          <h2 id="email-change-heading">{t('changeSignInEmail')}</h2>
          <p>
            {t('currentEmail')}: {session.data.email ?? t('notAvailable')}
          </p>
          {!emailChangeRequested ? (
            <form onSubmit={requestEmailChange} aria-busy={emailChangePending}>
              <label>
                {t('newEmailAddress')}
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
                {emailChangePending ? t('sendingVerificationCodes') : t('sendVerificationCodes')}
              </button>
            </form>
          ) : (
            <div aria-busy={emailChangePending}>
              <p>{t('enterBothEmailCodes')}</p>
              <label>
                {t('codeSentToCurrentEmail')}
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
                {currentEmailVerified ? t('currentEmailVerified') : t('verifyCurrentEmail')}
              </button>
              <label>
                {t('codeSentToNewEmail')}
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
                {newEmailVerified ? t('newEmailVerified') : t('verifyNewEmail')}
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
        {revoking ? t('signOutOthersLoading') : t('signOutOthers')}
      </button>
      <section aria-labelledby="active-sessions-heading">
        <h2 id="active-sessions-heading">{t('activeSessions')}</h2>
        {sessionsQuery.isPending ? (
          <p role="status">{t('activeSessionsLoading')}</p>
        ) : sessionsQuery.isError ? (
          <>
            <ErrorState
              variant="inline"
              what={t('couldNotLoadSessions')}
              detail={t('tryConnectionAgain')}
            />
            <button
              type="button"
              onClick={() => void sessionsQuery.refetch()}
              disabled={sessionsQuery.isFetching}
            >
              {sessionsQuery.isFetching ? t('retrying') : t('retry')}
            </button>
          </>
        ) : sessionsQuery.data.sessions.length === 0 ? (
          <p>{t('noSessions')}</p>
        ) : (
          <ul aria-label={t('activeDevicesLabel')}>
            {sessionsQuery.data.sessions.map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.deviceLabel}</strong>
                  {item.current ? ` — ${t('thisDevice')}` : ''}
                </p>
                <p>
                  {t('started')}: {dateLabel(item.createdAt, locale)}
                </p>
                <p>
                  {t('lastRefreshed')}: {dateLabel(item.lastUsedAt, locale)}
                </p>
                {!item.current && (
                  <button
                    type="button"
                    onClick={() => void revokeSession(item)}
                    disabled={busy || revokingSessionId !== null}
                    aria-label={t('signOutDeviceLabel', item.deviceLabel)}
                  >
                    {revokingSessionId === item.id ? t('signingOut') : t('signOutThisDevice')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="marketing-consent-heading">
        <h2 id="marketing-consent-heading">{t('optionalProductUpdates')}</h2>
        {marketingQuery.isPending ? (
          <p role="status">{t('loadingMarketingPreference')}</p>
        ) : marketingQuery.isError ? (
          <>
            <ErrorState
              variant="inline"
              what={t('couldNotLoadMarketing')}
              detail={t('tryConnectionAgain')}
            />
            <button
              type="button"
              onClick={() => void marketingQuery.refetch()}
              disabled={marketingQuery.isFetching}
            >
              {marketingQuery.isFetching ? t('retrying') : t('retry')}
            </button>
          </>
        ) : (
          <>
            <p>
              {marketingQuery.data.optedIn
                ? t(
                    'optedInProductUpdates',
                    marketingQuery.data.version
                      ? t('versionInParentheses', marketingQuery.data.version)
                      : '',
                  )
                : t('notOptedInProductUpdates')}
            </p>
            {marketingError && (
              <ErrorState
                variant="inline"
                what={t('couldNotUpdateMarketing')}
                detail={marketingError}
              />
            )}
            <button
              type="button"
              onClick={() => void updateMarketingConsent()}
              disabled={marketingPending}
            >
              {marketingPending
                ? t('savingPreference')
                : marketingQuery.data.optedIn
                  ? t('withdrawMarketingConsent')
                  : t('optInProductUpdates')}
            </button>
          </>
        )}
      </section>
      {sessionError && (
        <ErrorState variant="inline" what={t('couldNotSignOutSessions')} detail={sessionError} />
      )}
      {notice && <p role="status">{notice}</p>}
      {testMode ? (
        <p>{t('testAccountsNoPasswords')}</p>
      ) : (
        <form onSubmit={submit} aria-busy={pending}>
          <label>
            {t('currentPassword')}
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
            {t('newPassword')}
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
            {t('confirmNewPassword')}
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
            {pending ? t('changingPassword') : t('changePassword')}
          </button>
        </form>
      )}
    </section>
  );
}
