'use client';

import { motion } from 'framer-motion';
import { Crown, Check, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

const PRO_FEATURES = [
  'Lançamentos e contas ilimitados',
  'Dashboard avançado com projeções',
  'Exportação PDF e Excel',
  'Relatórios preditivos e investimentos',
  'Modo empresarial e tema exclusivo',
  'Suporte prioritário',
];

export function ProLockedView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[70vh] overflow-hidden rounded-2xl border border-nebula-purple/20 bg-gradient-to-b from-nebula-purple/10 to-black/40 p-6 shadow-2xl backdrop-blur-sm md:p-10"
    >
      {/* Partículas / brilho de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-nebula-purple/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-nebula-violet/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 shadow-lg"
        >
          <Lock className="h-10 w-10 text-amber-400" />
        </motion.div>
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 flex items-center gap-2 text-3xl font-bold text-white md:text-4xl"
        >
          <Crown className="h-8 w-8 text-amber-400" />
          Área PRO
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 max-w-lg text-zinc-400"
        >
          Desbloqueie relatórios avançados, projeções, exportações e muito mais. Assine o plano PRO e tenha acesso completo.
        </motion.p>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10 grid gap-3 text-left sm:grid-cols-2"
        >
          {PRO_FEATURES.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-center gap-2 text-zinc-300"
            >
              <Check className="h-5 w-5 shrink-0 text-emerald-500" />
              {feature}
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/app/planos"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            <Sparkles className="h-5 w-5" />
            Ver planos e preços
          </Link>
          <Link
            href="/app/planos"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-nebula-purple/50 bg-nebula-purple/20 px-8 py-4 font-semibold text-nebula-violet transition hover:bg-nebula-purple/30"
          >
            <Crown className="h-5 w-5" />
            Fazer upgrade para PRO
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
