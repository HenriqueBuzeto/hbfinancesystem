'use client';

/**
 * Painel de alertas: vencimentos, burn rate, orçamento, saldo baixo.
 * Dados mock; em produção viriam de /api/notifications ou contexto.
 */
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@nebula-finance/ui';

export type AlertItem = {
  id: string;
  type: 'bill_due' | 'burn_rate' | 'budget_alert' | 'low_balance';
  title: string;
  body?: string;
  severity: 'info' | 'warning' | 'error';
  actionUrl?: string;
  createdAt: string;
};

const severityStyles = {
  info: 'border-nebula-purple/30 bg-nebula-purple/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  error: 'border-red-500/30 bg-red-500/5',
};

const icons = {
  bill_due: Calendar,
  burn_rate: TrendingDown,
  budget_alert: AlertCircle,
  low_balance: Wallet,
};

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'bill_due',
    title: 'Conta vencendo em 3 dias',
    body: 'Aluguel - R$ 1.800,00 vence em 05/02',
    severity: 'warning',
    actionUrl: '/app/contas',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'budget_alert',
    title: 'Orçamento Alimentação em 85%',
    body: 'R$ 1.020 de R$ 1.200 utilizados',
    severity: 'info',
    actionUrl: '/app/relatorios',
    createdAt: new Date().toISOString(),
  },
];

type AlertsPanelProps = {
  alerts?: AlertItem[];
  className?: string;
};

export function AlertsPanel({ alerts = mockAlerts, className }: AlertsPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 backdrop-blur-sm', className)}
      aria-labelledby="alerts-panel-title"
    >
      <h2 id="alerts-panel-title" className="mb-4 text-lg font-semibold text-white">
        Alertas
      </h2>
      <ul className="space-y-3">
        {alerts.map((alert) => {
          const Icon = icons[alert.type];
          return (
            <li key={alert.id}>
              <div
                className={cn(
                  'flex gap-3 rounded-xl border p-4 transition hover:opacity-90',
                  severityStyles[alert.severity]
                )}
              >
                <Icon className="h-5 w-5 shrink-0 text-nebula-violet" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{alert.title}</p>
                  {alert.body && <p className="mt-0.5 text-sm text-zinc-400">{alert.body}</p>}
                </div>
                {alert.actionUrl && (
                  <a
                    href={alert.actionUrl}
                    className="shrink-0 text-sm font-medium text-nebula-violet hover:underline focus:outline-none focus:ring-2 focus:ring-nebula-purple focus:ring-offset-2 focus:ring-offset-[#050505]"
                  >
                    Ver
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {alerts.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhum alerta no momento.</p>
      )}
    </motion.section>
  );
}
