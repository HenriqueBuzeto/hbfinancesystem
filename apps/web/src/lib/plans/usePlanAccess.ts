'use client';

import { useState, useEffect, useCallback } from 'react';
import { hasPlanAccess, canAccessFeature, type PlanSlug } from './constants';

type PlanData = {
  plan: PlanSlug;
  planLabel: string;
  limits: Record<string, number | boolean>;
};

export function usePlanAccess() {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/plan', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setPlanData({ plan: 'FREE', planLabel: 'Grátis', limits: {} as PlanData['limits'] });
        return;
      }
      const json = await res.json();
      setPlanData({
        plan: json.plan ?? 'FREE',
        planLabel: json.planLabel ?? 'Grátis',
        limits: json.limits ?? {},
      });
    } catch {
      setError('Falha ao carregar plano');
      setPlanData({ plan: 'FREE', planLabel: 'Grátis', limits: {} as PlanData['limits'] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const plan = planData?.plan ?? 'FREE';
  const canAccess = (required: PlanSlug) => hasPlanAccess(plan, required);
  const canUse = (feature: string) => canAccessFeature(plan, feature);

  return {
    plan,
    planLabel: planData?.planLabel ?? 'Grátis',
    limits: planData?.limits ?? {},
    loading,
    error,
    canAccess,
    canUse,
    isPro: plan === 'PRO',
    isStartOrPro: plan === 'START' || plan === 'PRO',
    refetch: fetchPlan,
  };
}
