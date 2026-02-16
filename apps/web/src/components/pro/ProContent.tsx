'use client';

import { useState, useEffect } from 'react';
import { ProHero } from './ProHero';
import { ProPlanCard } from './ProPlanCard';
import { ProFeatures } from './ProFeatures';
import { ProActions } from './ProActions';

type SubscriptionData = {
  subscription: {
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    plan: string;
  } | null;
  manageUrl: string | null;
};

export function ProContent() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    fetch('/api/subscription', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : { subscription: null, manageUrl: null }))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ subscription: null, manageUrl: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProHero />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="mb-6 h-24 animate-pulse rounded-xl bg-white/10" />
              <div className="h-10 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <ProPlanCard
              subscription={data?.subscription ?? null}
              manageUrl={data?.manageUrl ?? null}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          <ProFeatures />
        </div>
      </div>
      <ProActions />
    </div>
  );
}
