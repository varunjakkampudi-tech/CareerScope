'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import AccountForm from '@/components/account-form';
import BrandLogo from '@/components/brand-logo';
import { LoadingState } from '@/components/ui-states';
import { useSession } from '@/lib/session';
import { clearAuthQueryCache } from '@/lib/query-cache';

const notices: Record<string, string> = {
  'security-changed': 'Password changed. All sessions signed out. Sign in again.',
  rate_limited: 'Too many sign-in attempts. Try again shortly.',
};

function SignIn() {
  const router = useRouter();
  const cache = useQueryClient();
  const params = useSearchParams();
  const session = useSession();
  const authenticated = session.data?.authenticated === true;
  const expired = params.get('expired') === '1';
  const notice = notices[params.get('notice') ?? ''] ?? '';

  useEffect(() => {
    // The one other authenticated-boundary redirect (CS-6): a signed-in
    // visitor to the sign-in screen has nothing to do here, so send them
    // straight to the real workspace rather than re-showing a form that
    // would just look broken next to an already-valid session.
    if (session.isSuccess && authenticated) router.replace('/dashboard');
  }, [authenticated, router, session.isSuccess]);

  return (
    <>
      <a className="skip-link" href="#workspace-content">
        Skip to content
      </a>
      <header className="topbar">
        <BrandLogo />
        <span className="brand-version">Test mode — select a role to continue</span>
      </header>
      <main id="workspace-content" tabIndex={-1}>
        {session.isPending ? (
          <LoadingState message="Loading workspace…" />
        ) : session.isError ? (
          <div className="state">
            <h1>Workspace unavailable</h1>
            <p role="alert">Could not reach the local service.</p>
            <button onClick={() => session.refetch()}>
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : authenticated ? null : (
          <AccountForm
            testUsersEnabled={session.data?.testUsersEnabled === true}
            accounts={session.data?.testAccounts}
            registrationEnabled={session.data?.registrationEnabled === true}
            expired={expired}
            notice={notice}
            onAuthenticated={async () => {
              clearAuthQueryCache(cache);
              // Authentication changes the identity discovered by this shared
              // query. Refresh it explicitly even when the CS-61 experiment
              // deliberately keeps owner-private cache entries intact.
              await session.refetch();
              router.replace('/dashboard');
            }}
          />
        )}
      </main>
    </>
  );
}

// `useSearchParams()` requires a Suspense boundary in the App Router.
export default function Home() {
  return (
    <Suspense fallback={null}>
      <SignIn />
    </Suspense>
  );
}
