'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutDashboard, BarChart3, CreditCard, ArrowRight } from 'lucide-react';

const ACTIONS = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/app/planos', label: 'Planos e assinatura', icon: CreditCard },
];

export function ProActions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">Ações rápidas</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
            >
              <Link
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-nebula-purple/30 hover:bg-nebula-purple/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nebula-purple/20">
                    <Icon className="h-5 w-5 text-nebula-violet" />
                  </div>
                  <span className="font-medium text-zinc-200">{action.label}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
