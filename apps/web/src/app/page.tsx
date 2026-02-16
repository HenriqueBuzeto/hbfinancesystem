'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LoginParticles } from '@/components/login/LoginParticles';
import { LogIn, UserPlus, LayoutDashboard, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-8">
      <LoginParticles />
      <div className="auth-orb auth-orb-purple absolute -left-20 top-1/4 h-64 w-64 animate-pulse opacity-30" aria-hidden />
      <div className="auth-orb auth-orb-violet absolute -right-20 bottom-1/4 h-72 w-72 animate-pulse opacity-30" style={{ animationDelay: '1s' }} aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <Image src="/logo.png" alt="HB Finance" width={64} height={64} priority />
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 rounded-2xl bg-nebula-purple/20 px-4 py-2 text-nebula-violet ring-1 ring-nebula-purple/30"
        >
          <Sparkles className="h-5 w-5" aria-hidden />
          <span className="text-sm font-medium">Sistema financeiro SaaS</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          HB <span className="bg-gradient-to-r from-nebula-purple to-nebula-violetLight bg-clip-text text-transparent">Finance</span>
        </h1>
        <p className="max-w-md text-zinc-400">
          Controle suas finanças em um só lugar. Painel, relatórios, IA de aconselhamento e integração WhatsApp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-nebula-purple px-6 py-3 font-medium text-white shadow-lg shadow-nebula-purple/25 transition hover:bg-nebula-violet hover:shadow-nebula-purple/40 focus:outline-none focus:ring-2 focus:ring-nebula-purple focus:ring-offset-2 focus:ring-offset-nebula-black">
            <LogIn className="h-5 w-5" aria-hidden /> Entrar
          </Link>
          <Link href="/criar-conta" className="inline-flex items-center gap-2 rounded-xl border border-nebula-purple/40 bg-white/5 px-6 py-3 font-medium text-nebula-violet backdrop-blur-sm transition hover:bg-nebula-purple/10 hover:border-nebula-purple/60 focus:outline-none focus:ring-2 focus:ring-nebula-purple focus:ring-offset-2 focus:ring-offset-nebula-black">
            <UserPlus className="h-5 w-5" aria-hidden /> Criar conta
          </Link>
          <Link href="/app/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-zinc-300 backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-nebula-black">
            <LayoutDashboard className="h-5 w-5" aria-hidden /> Painel (demo)
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
