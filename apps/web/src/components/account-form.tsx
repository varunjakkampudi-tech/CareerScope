'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle, User, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export default function AccountForm({
  testUsersEnabled = false,
  otpEnabled = false,
  registrationEnabled = false,
  accounts = [],
  legalLinks,
  expired,
  notice = '',
  onAuthenticated,
}: {
  registrationEnabled?: boolean;
  testUsersEnabled?: boolean;
  otpEnabled?: boolean;
  accounts?: { email: string; role: 'candidate' | 'admin' }[];
  legalLinks?: { terms: string; privacy: string };
  expired: boolean;
  notice?: string;
  onAuthenticated: () => void | Promise<void>;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [requiresAcceptance, setRequiresAcceptance] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    if (resendAt === null) return;
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  async function selectUser(accountEmail: string) {
    if (pending) return;
    setError('');
    setPending(accountEmail);
    try {
      await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email: accountEmail }),
      });
      await onAuthenticated();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Request failed. Please try again.');
    } finally {
      setPending(null);
    }
  }

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setStatus('');
    setPending('otp-request');
    try {
      await api('/auth/otp/request', { method: 'POST', body: JSON.stringify({ email }) });
      setCodeRequested(true);
      setResendAt(Date.now() + 60_000);
      setStatus(
        'If the address is eligible, a verification code has been sent. It expires in five minutes.',
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Sign-in is temporarily unavailable.');
    } finally {
      setPending(null);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setStatus('');
    setPending('otp-verify');
    try {
      const result = await api<{
        authenticated: boolean;
        requiresLegalAcceptance?: boolean;
        createdAccount?: boolean;
      }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          email,
          code,
          ...(requiresAcceptance ? { termsAccepted, privacyAcknowledged, marketingOptIn } : {}),
        }),
      });
      if (result.requiresLegalAcceptance) {
        setRequiresAcceptance(true);
        setStatus(
          'Before creating an account, accept the Terms and acknowledge the Privacy Policy.',
        );
        return;
      }
      if (result.authenticated) await onAuthenticated();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Could not verify the code. Try again.',
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="login" aria-labelledby="account-heading">
      <h1 id="account-heading">
        {testUsersEnabled ? 'Select test account' : 'Sign in to CareerScope'}
      </h1>
      {testUsersEnabled && (
        <p style={{ marginBottom: '1.5rem' }}>
          Choose a role to enter the workspace. No password required.
        </p>
      )}
      {(error || expired) && (
        <p role="alert">
          {error || 'Your session has expired. Any unsaved changes were not saved.'}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {status && (
        <p role="status" aria-live="polite">
          {status}
        </p>
      )}
      {testUsersEnabled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {accounts.map((user) => {
            const Icon = user.role === 'admin' ? ShieldCheck : User;
            const isLoading = pending === user.email;
            return (
              <button
                key={user.email}
                className="primary"
                disabled={pending !== null}
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
      ) : otpEnabled && !codeRequested ? (
        <form onSubmit={requestCode} aria-busy={pending === 'otp-request'}>
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending !== null}
          />
          <button className="primary" type="submit" disabled={pending !== null}>
            {pending === 'otp-request' ? (
              <LoaderCircle className="spin" size={18} aria-hidden="true" />
            ) : null}
            {pending === 'otp-request' ? 'Requesting code' : 'Continue with email'}
          </button>
        </form>
      ) : otpEnabled ? (
        <form onSubmit={verifyCode} aria-busy={pending === 'otp-verify'}>
          <label htmlFor="auth-code">Six-digit verification code</label>
          <input
            id="auth-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            minLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={pending !== null}
          />
          {requiresAcceptance && registrationEnabled && legalLinks && (
            <fieldset disabled={pending !== null}>
              <legend>Account terms</legend>
              <label>
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />{' '}
                I accept the <a href={legalLinks.terms}>Terms of Service</a>.
              </label>
              <label>
                <input
                  type="checkbox"
                  required
                  checked={privacyAcknowledged}
                  onChange={(event) => setPrivacyAcknowledged(event.target.checked)}
                />{' '}
                I acknowledge the <a href={legalLinks.privacy}>Privacy Policy</a>.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(event) => setMarketingOptIn(event.target.checked)}
                />{' '}
                Send me optional product updates by email.
              </label>
            </fieldset>
          )}
          <button className="primary" type="submit" disabled={pending !== null}>
            {pending === 'otp-verify' ? (
              <LoaderCircle className="spin" size={18} aria-hidden="true" />
            ) : null}
            {pending === 'otp-verify'
              ? 'Verifying code'
              : requiresAcceptance
                ? 'Accept and create account'
                : 'Verify code'}
          </button>
          <button
            type="button"
            disabled={pending !== null || secondsLeft > 0}
            onClick={() => {
              setCodeRequested(false);
              setCode('');
              setRequiresAcceptance(false);
              setTermsAccepted(false);
              setPrivacyAcknowledged(false);
              setMarketingOptIn(false);
            }}
          >
            {secondsLeft > 0 ? `Request another code in ${secondsLeft}s` : 'Request another code'}
          </button>
          <button type="button" onClick={() => setCodeRequested(false)} disabled={pending !== null}>
            Change email address
          </button>
        </form>
      ) : (
        <p role="status">Sign-in is temporarily unavailable. Please try again later.</p>
      )}
    </section>
  );
}
