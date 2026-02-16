'use client';

import type { ReactNode } from 'react';
import { usePlanAccess } from '@/lib/plans/usePlanAccess';
import type { PlanSlug } from '@/lib/plans/constants';
import { UpgradeModal } from './UpgradeModal';
import { useState } from 'react';

type PlanGateProps = {
  /** Plano mínimo necessário para ver o conteúdo */
  requiredPlan: PlanSlug;
  /** Recurso (ex: 'exportPdf') - alternativa a requiredPlan */
  feature?: string;
  /** Conteúdo a exibir se tiver acesso */
  children: ReactNode;
  /** Conteúdo alternativo se não tiver acesso (opcional; se não passar, mostra modal ao clicar) */
  fallback?: ReactNode;
  /** Se true, não mostra fallback; apenas bloqueia e exige upgrade ao interagir */
  hideContent?: boolean;
};

export function PlanGate({ requiredPlan, feature, children, fallback, hideContent }: PlanGateProps) {
  const { canAccess, canUse, plan, loading } = usePlanAccess();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasAccess = feature ? canUse(feature) : canAccess(requiredPlan);

  if (loading) {
    return null;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (hideContent) {
    return (
      <>
        <div
          className="relative cursor-pointer"
          onClick={() => setShowUpgradeModal(true)}
          onKeyDown={(e) => e.key === 'Enter' && setShowUpgradeModal(true)}
          role="button"
          tabIndex={0}
          aria-label="Recurso premium - clique para ver planos"
        >
          {children}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm" />
        </div>
        <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} requiredPlan={requiredPlan} />
      </>
    );
  }

  if (fallback !== undefined) {
    return (
      <>
        {fallback}
        <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} requiredPlan={requiredPlan} />
      </>
    );
  }

  return (
    <>
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-nebula-purple/30 bg-nebula-purple/10 p-8 text-center"
        role="region"
        aria-label="Recurso disponível em planos superiores"
      >
        <p className="mb-4 text-zinc-300">
          Este recurso está disponível no plano <strong className="text-nebula-violet">{requiredPlan}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setShowUpgradeModal(true)}
          className="rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-violet px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95"
        >
          Fazer upgrade para {requiredPlan}
        </button>
      </div>
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} requiredPlan={requiredPlan} />
    </>
  );
}
