'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { LoginParticles } from '@/components/login/LoginParticles';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simula envio; em produção chamaria API de recuperação
      await new Promise((r) => setTimeout(r, 1200));
      setSent(true);
      toast.success('Se o e-mail existir, você receberá as instruções em breve.');
    } catch {
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <LoginParticles />
      <div className="auth-orb auth-orb-purple absolute -left-40 -top-40 h-80 w-80 animate-pulse" aria-hidden />
      <div
        className="auth-orb auth-orb-violet absolute -bottom-40 -right-40 h-96 w-96 animate-pulse"
        style={{ animationDelay: '1s' }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="glass-card rounded-3xl p-8 auth-input-glow">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="mb-4 inline-flex items-center gap-2 rounded-xl bg-nebula-purple/20 px-4 py-2 text-nebula-violet ring-1 ring-nebula-purple/30"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              <span className="text-sm font-medium">Recuperação de senha</span>
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Esqueceu a <span className="bg-gradient-to-r from-nebula-purple to-nebula-violetLight bg-clip-text text-transparent">senha?</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-sm text-green-200"
            >
              Verifique sua caixa de entrada e o spam. O link expira em 1 hora.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`relative rounded-xl border bg-white/5 transition-all duration-200 ${
                  focused ? 'border-nebula-purple/50' : 'border-white/10'
                }`}
              >
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
                <input
                  id="email"
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="email"
                  className="w-full rounded-xl bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:ring-0"
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-violet py-4 font-semibold text-white shadow-lg shadow-nebula-purple/25 transition focus:outline-none focus:ring-2 focus:ring-nebula-purple focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-70"
              >
                {loading ? 'Enviando…' : 'Enviar link'}
                <Send className="h-5 w-5" aria-hidden />
              </motion.button>
            </form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-sm text-zinc-500"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-nebula-violet hover:text-nebula-violetLight hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </main>
  );
}
