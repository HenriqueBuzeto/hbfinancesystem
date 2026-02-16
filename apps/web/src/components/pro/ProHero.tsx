'use client';

import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

export function ProHero() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-nebula-purple/30 bg-gradient-to-br from-nebula-purple/20 via-nebula-purple/10 to-transparent p-6 backdrop-blur-sm md:p-8"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/20"
          >
            <Crown className="h-7 w-7 text-amber-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Área PRO</h1>
            <p className="text-zinc-400">Recursos premium e suporte prioritário ao seu alcance.</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-full border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-300"
        >
          Plano ativo
        </motion.div>
      </div>
    </motion.header>
  );
}
