'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowLeft } from 'lucide-react';

export default function ContasPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contas</h1>
          <p className="mt-1 text-zinc-400">Contas bancárias, contas a pagar e a receber</p>
        </div>
        <Link href="/app/dashboard" className="inline-flex items-center gap-2 text-sm text-nebula-violet hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
      </header>

      <section className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-2xl bg-nebula-purple/20 p-4">
            <Wallet className="h-12 w-12 text-nebula-violet" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-white">Suas contas</h2>
          <p className="max-w-sm text-zinc-400">Aqui você gerencia contas bancárias, contas a pagar e a receber. Em breve: CRUD completo e conciliação.</p>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-nebula-purple px-5 py-2.5 font-medium text-white transition hover:bg-nebula-violet">
            <Plus className="h-5 w-5" /> Nova conta
          </button>
        </div>
      </section>
    </motion.div>
  );
}
