'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanAccess } from '@/lib/plans/usePlanAccess';
import { PLAN_LABELS, PLAN_ORDER, type PlanSlug } from '@/lib/plans/constants';
import { Crown, Zap, Check, Sparkles, Loader2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@nebula-finance/ui';

const FEATURES: Record<PlanSlug, string[]> = {
  FREE: [
    'Lançamentos ilimitados',
    'Contas a pagar e receber ilimitadas',
    'Até 5 contas',
    'Dashboard básico',
    'Metas financeiras',
  ],
  START: [
    'Lançamentos ilimitados',
    'Contas a pagar e receber ilimitadas',
    'Até 10 contas',
    'Exportação PDF',
    'Relatórios',
    'Dashboard melhorado',
    'Assistente IA (uso limitado)',
  ],
  PRO: [
    'Tudo do Start',
    'Assistente IA ilimitado',
    'Educação financeira',
    'Relatórios avançados e preditivos',
    'Dashboard PRO e projeções',
    'Exportação Excel',
    'Investimentos e modo empresarial',
    'Aba PRO e suporte prioritário',
  ],
};

const PRICE_LABEL: Record<PlanSlug, string> = {
  FREE: 'Grátis',
  START: 'R$ 19,90/mês',
  PRO: 'R$ 49,90/mês',
};

type StripeAvailability = { start: boolean; pro: boolean } | null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) return null;
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const access = data?.accessToken;
  if (access && typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return access;
  }
  return null;
}

export default function PlanosPage() {
  const router = useRouter();
  const { plan: currentPlan, refetch: refetchPlan } = usePlanAccess();
  const [loadingPlan, setLoadingPlan] = useState<PlanSlug | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripePlans, setStripePlans] = useState<StripeAvailability>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/stripe/checkout')
      .then((r) => r.json())
      .then((data: { start?: boolean; pro?: boolean }) => {
        const plans = { start: !!data.start, pro: !!data.pro };
        setStripePlans(plans);
        if (!plans.start && !plans.pro) setError(null);
      })
      .catch(() => setStripePlans({ start: false, pro: false }));
  }, []);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage({ type: 'error', text: 'Digite o código do cupom' });
      return;
    }
    setCouponMessage(null);
    setCouponLoading(true);
    try {
      let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      let res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
      });
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await fetch('/api/coupons/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
            body: JSON.stringify({ code }),
          });
        }
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setCouponMessage({ type: 'success', text: data.message || 'Cupom aplicado!' });
        setCouponCode('');
        refetchPlan();
      } else {
        const msg = data.error || 'Não foi possível aplicar o cupom';
        if (res.status === 401) {
          router.push('/login?redirect=/app/planos');
          return;
        }
        setCouponMessage({ type: 'error', text: msg });
      }
    } catch {
      setCouponMessage({ type: 'error', text: 'Falha de conexão' });
    } finally {
      setCouponLoading(false);
    }
  }

  async function goToCheckout(plan: PlanSlug) {
    if (plan === 'FREE') return;
    setError(null);
    setLoadingPlan(plan);
    try {
      let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      let res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
            body: JSON.stringify({ plan }),
          });
        }
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = data.error || 'Erro ao iniciar checkout';
        if (res.status === 401) {
          setError(null);
          router.push('/login?redirect=/app/planos');
          return;
        }
        const isConfigError = res.status === 503 && (raw.includes('não configurado') || raw.includes('STRIPE_'));
        setError(isConfigError ? 'Assinatura deste plano está temporariamente indisponível. Tente mais tarde ou entre em contato com o suporte.' : raw);
        return;
      }
      if (data.url) window.location.href = data.url;
      else setError('URL de checkout não retornada');
    } catch {
      setError('Falha de conexão');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white">Planos</h1>
        <p className="mt-2 text-zinc-400">
          Escolha o plano ideal para suas finanças. Upgrade ou downgrade a qualquer momento.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLAN_ORDER.map((plan, index) => {
          const isPro = plan === 'PRO';
          const isCurrent = currentPlan === plan;
          return (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-2xl border p-6 transition',
                isPro
                  ? 'border-nebula-purple/50 bg-gradient-to-b from-nebula-purple/20 to-transparent ring-2 ring-nebula-purple/30'
                  : 'border-white/10 bg-white/5'
              )}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                  Mais popular
                </div>
              )}
              <div className="mb-4 flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-6 w-6 text-amber-400" />
                ) : plan === 'START' ? (
                  <Zap className="h-6 w-6 text-blue-400" />
                ) : (
                  <Sparkles className="h-6 w-6 text-zinc-500" />
                )}
                <h2 className="text-xl font-bold text-white">{PLAN_LABELS[plan]}</h2>
              </div>
              <p className="mb-6 text-2xl font-bold text-white">{PRICE_LABEL[plan]}</p>
              <ul className="mb-6 space-y-3 text-sm text-zinc-400">
                {FEATURES[plan].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="rounded-xl bg-white/10 py-3 text-center text-sm font-medium text-zinc-300">
                  Plano atual
                </div>
              ) : plan === 'FREE' ? (
                <span className="block rounded-xl bg-white/5 py-3 text-center text-sm text-zinc-500">
                  Plano gratuito
                </span>
              ) : (() => {
                const available = plan === 'START' ? stripePlans?.start : stripePlans?.pro;
                const showEmBreve = stripePlans !== null && available === false;
                return (
                  <button
                    type="button"
                    disabled={!!loadingPlan || showEmBreve}
                    onClick={() => goToCheckout(plan)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold transition disabled:opacity-60',
                      isPro
                        ? 'bg-gradient-to-r from-nebula-purple to-nebula-violet text-white hover:opacity-95'
                        : 'border border-white/20 text-white hover:bg-white/10'
                    )}
                  >
                    {loadingPlan === plan ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {showEmBreve ? 'Em breve' : `Assinar ${PLAN_LABELS[plan]}`}
                  </button>
                );
              })()}
            </motion.div>
          );
        })}
      </div>

      {/* Aplicar cupom */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-nebula-purple/20 bg-white/5 p-6"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Tag className="h-4 w-4 text-nebula-violet" />
          Tem um cupom?
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
            placeholder="Código do cupom"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-nebula-purple/50 focus:outline-none"
            disabled={couponLoading}
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading}
            className="rounded-xl bg-nebula-purple/80 px-6 py-3 font-semibold text-white transition hover:bg-nebula-purple disabled:opacity-60"
          >
            {couponLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Aplicar'}
          </button>
        </div>
        {couponMessage ? (
          <p className={cn('mt-3 text-sm', couponMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400')}>
            {couponMessage.text}
          </p>
        ) : null}
      </motion.section>

      {error ? (
        <p className="text-center text-sm text-red-400">{error}</p>
      ) : null}
      <p className="text-center text-xs text-zinc-500">
        Pagamento recorrente mensal. Cancele quando quiser. Dúvidas? Acesse Configurações ou suporte.
      </p>
    </div>
  );
}
