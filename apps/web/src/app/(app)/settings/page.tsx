'use client';

import { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/session';
import { LoadingState } from '@/components/ui-states';
import { clearAuthQueryCache } from '@/lib/query-cache';
import MarketingConsent from '@/components/marketing-consent';

const AccountSecurity = lazy(() => import('@/components/account-security'));

export default function SettingsPage() {
  const router = useRouter();
  const cache = useQueryClient();
  const session = useSession();
  return (
    <div>
      <Suspense fallback={<LoadingState message="Loading account security…" />}>
        <AccountSecurity
          csrf={session.data?.csrf ?? ''}
          onBack={() => router.push('/dashboard')}
          onChanged={() => {
            clearAuthQueryCache(cache);
            router.replace('/?notice=security-changed');
          }}
        />
      </Suspense>
      <MarketingConsent />
    </div>
  );
}
