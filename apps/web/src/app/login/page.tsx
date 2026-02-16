'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  UserPlus,
  BarChart3,
  Wallet,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';
import { LoginParticles } from '@/components/login/LoginParticles';

const valuePhrases = [
  'Tenha controle total da sua vida financeira',
  'Visualize, planeje e cresça financeiramente',
];

const systemFeatures = [
  { icon: Wallet, label: 'Controle de receitas' },
  { icon: TrendingUp, label: 'Gestão de despesas' },
  { icon: BarChart3, label: 'Relatórios inteligentes' },
  { icon: LayoutDashboard, label: 'Dashboard financeiro em tempo real' },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/app/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.accessToken) {
          typeof window !== 'undefined' && localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        }
        toast.success('Bem-vindo de volta!');
        const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
        router.push(path);
        return;
      }
      toast.error(data.error || 'E-mail ou senha incorretos. Tente novamente.');
    } catch {
      toast.error('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page-bg relative flex min-h-screen overflow-hidden">
      <LoginParticles />
      <div className="auth-orb auth-orb-purple absolute -left-40 -top-40 h-80 w-80 animate-pulse" aria-hidden />
      <div
        className="auth-orb auth-orb-violet absolute -bottom-40 -right-40 h-96 w-96 animate-pulse"
        style={{ animationDelay: '1s' }}
        aria-hidden
      />

      {/* Coluna esquerda: conteúdo informativo (desktop) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 hidden flex-1 flex-col justify-center px-12 lg:flex xl:px-20"
      >
        <div className="max-w-md space-y-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 rounded-xl bg-nebula-purple/20 px-4 py-2 text-nebula-violetLight ring-1 ring-nebula-purple/30"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              <span className="text-sm font-medium">Sistema Financeiro Premium</span>
            </motion.div>
            <Image src="/logo.png" alt="" width={64} height={64} className="mb-4" priority />
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              HB{' '}
              <span className="bg-gradient-to-r from-nebula-purple to-nebula-violetLight bg-clip-text text-transparent">
                Finance
              </span>
            </h1>
          </div>
          <ul className="space-y-4">
            {valuePhrases.map((phrase, i) => (
              <motion.li
                key={phrase}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-lg text-zinc-300"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nebula-violet" aria-hidden />
                {phrase}
              </motion.li>
            ))}
          </ul>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-nebula-purple/20 bg-[rgba(15,15,22,0.5)] p-6 backdrop-blur-sm"
          >
            <p className="mb-4 text-sm font-semibold text-white">O que você tem no sistema:</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {systemFeatures.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-zinc-400">
                  <Icon className="h-4 w-4 shrink-0 text-nebula-violet" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Coluna direita: card de login */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="glass-card rounded-3xl p-8 transition-shadow auth-input-glow">
            <div className="mb-8 text-center lg:text-left">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mb-4 flex justify-center lg:justify-start"
              >
                <Image src="/logo.png" alt="HB Finance" width={64} height={64} priority />
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="mb-4 inline-flex items-center gap-2 rounded-xl bg-nebula-purple/20 px-4 py-2 text-nebula-violet ring-1 ring-nebula-purple/30"
              >
                <Sparkles className="h-5 w-5" aria-hidden />
                <span className="text-sm font-medium">Sua jornada financeira</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold tracking-tight text-white lg:text-3xl"
              >
                Entrar
              </motion.h2>
              <p className="mt-2 text-sm text-zinc-400">Acesse sua conta para continuar</p>
            </div>

            {/* Login social (opcional) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
              className="mb-6 flex gap-3"
            >
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => toast.info('Login com Google em breve')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => toast.info('Login com Apple em breve')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-1.13 1.72-2.38 3.44-4.07 5.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </button>
            </motion.div>

            <div className="mb-6 flex justify-center">
              <a
                href="/api/auth0/login?returnTo=/app/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-nebula-purple/40 bg-nebula-purple/10 px-4 py-2.5 text-sm font-medium text-nebula-violet transition hover:bg-nebula-purple/20"
              >
                Entrar com Auth0
              </a>
            </div>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[rgba(15,15,22,0.9)] px-3 text-zinc-500">ou com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className={`relative rounded-xl border bg-white/5 transition-all duration-200 ${
                  focused.email ? 'border-nebula-purple/50 shadow-glow' : 'border-white/10'
                }`}
              >
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>
                <Mail
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors"
                  aria-hidden
                />
                <input
                  id="email"
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused((f) => ({ ...f, email: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, email: false }))}
                  autoComplete="email"
                  className="w-full rounded-xl bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:ring-0"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`relative rounded-xl border bg-white/5 transition-all duration-200 ${
                  focused.password ? 'border-nebula-purple/50 shadow-glow' : 'border-white/10'
                }`}
              >
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
                <input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused((f) => ({ ...f, password: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, password: false }))}
                  autoComplete="current-password"
                  className="w-full rounded-xl bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:ring-0"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex cursor-pointer items-center gap-2 text-zinc-400 hover:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-nebula-purple focus:ring-nebula-purple"
                  />
                  Lembrar de mim
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-nebula-violet hover:text-nebula-violetLight hover:underline"
                >
                  Esqueci a senha
                </Link>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="btn-glow mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-violet py-4 font-semibold text-white shadow-lg shadow-nebula-purple/25 transition focus:outline-none focus:ring-2 focus:ring-nebula-purple focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-70"
              >
                {loading ? 'Entrando…' : 'Entrar'}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-8 text-center text-sm text-zinc-500"
            >
              Não tem conta?{' '}
              <Link
                href="/criar-conta"
                className="inline-flex items-center gap-1.5 font-medium text-nebula-violet hover:text-nebula-violetLight hover:underline"
              >
                <UserPlus className="h-4 w-4" /> Criar conta
              </Link>
            </motion.p>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
