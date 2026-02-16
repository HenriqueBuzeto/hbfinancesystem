'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Crown, Check } from 'lucide-react';
import Link from 'next/link';
import type { PlanSlug } from '@/lib/plans/constants';
import { PLAN_LABELS, PLAN_ORDER } from '@/lib/plans/constants';
import { cn } from '@nebula-finance/ui';

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  requiredPlan?: PlanSlug;
};

const FEATURES: Record<PlanSlug, string[]> = {
  FREE: ['Até 20 lançamentos/mês', '1 conta', 'Dashboard básico'],
  START: ['Até 100 lançamentos/mês', 'Exportação PDF', 'Metas financeiras', '3 contas'],
  PRO: [
    'Lançamentos ilimitados',
    'Exportação PDF e Excel',
    'Relatórios avançados',
    'Dashboard PRO',
    'Projeções e investimentos',
    'Modo empresarial',
    'Suporte prioritário',
  ],
};

export function UpgradeModal({ open, onClose, requiredPlan = 'PRO' }: UpgradeModalProps) {
  useEffect(() => {
    if (open) {
      const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', onEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  const requiredIndex = PLAN_ORDER.indexOf(requiredPlan);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-2xl rounded-2xl border border-nebula-purple/30 bg-[rgba(12,12,18,0.98)] p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="upgrade-modal-title"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 id="upgrade-modal-title" className="text-xl font-bold text-white">
                  Escolha seu plano
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-6 text-zinc-400">
                Este recurso está disponível a partir do plano <strong className="text-nebula-violet">{PLAN_LABELS[requiredPlan]}</strong>.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {PLAN_ORDER.map((plan, index) => {
                  const isRequiredOrAbove = index >= requiredIndex;
                  const isPro = plan === 'PRO';
                  return (
                    <motion.div
                      key={plan}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'rounded-xl border p-4 transition',
                        isPro
                          ? 'border-nebula-purple/50 bg-nebula-purple/10 ring-2 ring-nebula-purple/40'
                          : 'border-white/10 bg-white/5'
                      )}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        {plan === 'PRO' ? (
                          <Crown className="h-5 w-5 text-amber-400" />
                        ) : plan === 'START' ? (
                          <Zap className="h-5 w-5 text-blue-400" />
                        ) : null}
                        <span className="font-semibold text-white">{PLAN_LABELS[plan]}</span>
                        {isPro && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                            Popular
                          </span>
                        )}
                      </div>
                      <ul className="space-y-2 text-sm text-zinc-400">
                        {FEATURES[plan].slice(0, 4).map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isRequiredOrAbove && (
                        <Link
                          href="/app/planos"
                          onClick={onClose}
                          className={cn(
                            'mt-4 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition',
                            isPro
                              ? 'bg-gradient-to-r from-nebula-purple to-nebula-violet text-white hover:opacity-95'
                              : 'border border-white/20 text-zinc-300 hover:bg-white/10'
                          )}
                        >
                          {plan === requiredPlan ? `Ir para ${PLAN_LABELS[plan]}` : 'Ver planos'}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/app/planos"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-violet px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95"
                >
                  <Crown className="h-5 w-5" />
                  Fazer upgrade para PRO
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
