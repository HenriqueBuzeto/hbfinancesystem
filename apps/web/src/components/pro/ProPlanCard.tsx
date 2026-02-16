'use client';

import { motion } from 'framer-motion';
import { Calendar, CreditCard, ExternalLink, Crown } from 'lucide-react';
import Link from 'next/link';

type SubscriptionInfo = {
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: string;
} | null;

type ProPlanCardProps = {
  subscription: SubscriptionInfo;
  manageUrl: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function ProPlanCard({ subscription, manageUrl }: ProPlanCardProps) {
  const periodEnd = subscription?.currentPeriodEnd ?? null;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-nebula-violet" />
        <h2 className="text-lg font-semibold text-white">Seu plano</h2>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
        <Crown className="h-8 w-8 shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold text-white">PRO</p>
          <p className="text-sm text-zinc-400">Recursos ilimitados e exclusivos</p>
        </div>
      </div>

      {periodEnd && (
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="h-4 w-4" />
          <span>
            {cancelAtPeriodEnd ? 'Acesso até ' : 'Próxima cobrança em '}
            <strong className="text-zinc-300">{formatDate(periodEnd)}</strong>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {manageUrl ? (
          <a
            href={manageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-nebula-purple/40 bg-nebula-purple/20 py-3 font-medium text-nebula-violet transition hover:bg-nebula-purple/30"
          >
            <ExternalLink className="h-4 w-4" />
            Gerenciar assinatura
          </a>
        ) : null}
        <Link
          href="/app/planos"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 font-medium text-zinc-300 transition hover:bg-white/10"
        >
          Alterar plano (upgrade/downgrade)
        </Link>
      </div>
    </motion.section>
  );
}
