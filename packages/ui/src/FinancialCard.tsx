/**
 * Card financeiro reutilizável – design tokens Nebula (glassmorphism, roxo/black).
 * Uso: resumo de saldo, receitas, despesas, metas.
 */
import React from 'react';
import { cn } from './utils';

export type FinancialCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  /** Acessibilidade: descreve o valor para leitores de tela */
  valueAriaLabel?: string;
};

export function FinancialCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  className,
  children,
  valueAriaLabel,
}: FinancialCardProps) {
  const valueStr = typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[rgba(20,20,28,0.6)] p-6 shadow-[0_4px_24px_rgba(124,58,237,0.08)] backdrop-blur-sm',
        className
      )}
      role="article"
      aria-labelledby="financial-card-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p id="financial-card-title" className="text-sm font-medium text-zinc-400">
            {title}
          </p>
          <p
            className="mt-1 text-2xl font-bold text-white"
            aria-label={valueAriaLabel ?? `${title}: ${valueStr}`}
          >
            {valueStr}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          {trend !== undefined && trendLabel && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend === 'up' && 'text-green-400',
                trend === 'down' && 'text-red-400',
                trend === 'neutral' && 'text-zinc-400'
              )}
            >
              {trendLabel}
            </p>
          )}
        </div>
        {icon && <div className="shrink-0 text-nebula-purple" aria-hidden>{icon}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
