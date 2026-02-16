'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Target,
  Building2,
  TrendingUp,
  Headphones,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, label: 'Relatórios avançados e preditivos', color: 'text-blue-400' },
  { icon: FileText, label: 'Exportação PDF', color: 'text-red-400' },
  { icon: FileSpreadsheet, label: 'Exportação Excel', color: 'text-emerald-400' },
  { icon: Target, label: 'Metas e projeções financeiras', color: 'text-amber-400' },
  { icon: Building2, label: 'Modo empresarial', color: 'text-violet-400' },
  { icon: TrendingUp, label: 'Investimentos', color: 'text-cyan-400' },
  { icon: Headphones, label: 'Suporte prioritário', color: 'text-pink-400' },
  { icon: Sparkles, label: 'Tema exclusivo PRO', color: 'text-nebula-violet' },
];

export function ProFeatures() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">Recursos inclusos no PRO</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.04 }}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-nebula-purple/20 hover:bg-nebula-purple/5"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-zinc-300">{item.label}</span>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
