'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Sparkles, LogIn, Phone, DollarSign, Target, Calendar } from 'lucide-react';
import { LoginParticles } from '@/components/login/LoginParticles';

export default function CriarContaPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [financialGoal, setFinancialGoal] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<Record<string, boolean>>({ name: false, email: false, password: false, confirm: false });
  const [showOptional, setShowOptional] = useState(false);

  const GOAL_OPTIONS = [
    { value: '', label: 'Selecione (opcional)' },
    { value: 'controle_financeiro', label: 'Ter controle financeiro' },
    { value: 'guardar_dinheiro', label: 'Guardar dinheiro' },
    { value: 'investir', label: 'Investir' },
    { value: 'sair_das_dividas', label: 'Sair das dívidas' },
    { value: 'outros', label: 'Outros' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (!acceptTerms) {
      toast.error('Aceite os termos para continuar.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
          monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
          financialGoal: financialGoal || undefined,
          birthYear: birthYear ? Number(birthYear) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data.debug && process.env.NODE_ENV === 'development'
          ? `${data.error}\n${data.debug}`
          : (data.error || 'Erro ao criar conta. Tente novamente.');
        toast.error(message);
        return;
      }
      if (data.accessToken) {
        typeof window !== 'undefined' && localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
      toast.success('Conta criada! Redirecionando…');
      router.push('/app/dashboard');
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full rounded-xl bg-transparent py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:ring-0';
  const wrapBase = 'relative rounded-xl border bg-white/5 transition-all duration-200';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 py-12">
      <LoginParticles />
      <div className="auth-orb auth-orb-purple absolute -right-32 top-1/4 h-72 w-72 animate-pulse" aria-hidden />
      <div className="auth-orb auth-orb-violet absolute -left-32 bottom-1/4 h-80 w-80 animate-pulse" style={{ animationDelay: '1s' }} aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="rounded-3xl border border-nebula-purple/25 bg-[rgba(5,5,5,0.85)] p-8 shadow-[0_0_60px_-12px_rgba(124,58,237,0.35)] backdrop-blur-xl auth-input-glow transition-shadow">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 200 }}
              className="mb-4 flex justify-center"
            >
              <Image src="/logo.png" alt="HB Finance" width={64} height={64} priority />
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mb-4 inline-flex items-center gap-2 rounded-xl bg-nebula-purple/20 px-4 py-2 text-nebula-violet ring-1 ring-nebula-purple/30"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              <span className="text-sm font-medium">Comece grátis</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-bold tracking-tight text-white"
            >
              Criar <span className="bg-gradient-to-r from-nebula-purple to-nebula-violetLight bg-clip-text text-transparent">conta</span>
            </motion.h1>
            <p className="mt-2 text-sm text-zinc-400">HB Finance — controle suas finanças em um só lugar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`${wrapBase} ${focused.name ? 'border-nebula-purple/50' : 'border-white/10'}`}
            >
              <label htmlFor="name" className="sr-only">Nome completo</label>
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
              <input
                id="name"
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused((f) => ({ ...f, name: true }))}
                onBlur={() => setFocused((f) => ({ ...f, name: false }))}
                autoComplete="name"
                className={inputBase}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className={`${wrapBase} ${focused.email ? 'border-nebula-purple/50' : 'border-white/10'}`}
            >
              <label htmlFor="email" className="sr-only">E-mail</label>
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
              <input
                id="email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused((f) => ({ ...f, email: true }))}
                onBlur={() => setFocused((f) => ({ ...f, email: false }))}
                autoComplete="email"
                className={inputBase}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`${wrapBase} ${focused.password ? 'border-nebula-purple/50' : 'border-white/10'}`}
            >
              <label htmlFor="password" className="sr-only">Senha</label>
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
              <input
                id="password"
                type="password"
                placeholder="Senha (mín. 8 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused((f) => ({ ...f, password: true }))}
                onBlur={() => setFocused((f) => ({ ...f, password: false }))}
                autoComplete="new-password"
                className={inputBase}
                minLength={8}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className={`${wrapBase} ${focused.confirm ? 'border-nebula-purple/50' : 'border-white/10'}`}
            >
              <label htmlFor="confirmPassword" className="sr-only">Confirmar senha</label>
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused((f) => ({ ...f, confirm: true }))}
                onBlur={() => setFocused((f) => ({ ...f, confirm: false }))}
                autoComplete="new-password"
                className={inputBase}
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }} className="space-y-3">
              <button
                type="button"
                onClick={() => setShowOptional((v) => !v)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-zinc-400 hover:border-white/20 hover:text-zinc-300"
              >
                {showOptional ? 'Ocultar dados opcionais' : '+ Nos conte um pouco sobre você (opcional)'}
              </button>
              {showOptional && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className={wrapBase}>
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
                    <input
                      type="tel"
                      placeholder="Telefone (WhatsApp)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div className={wrapBase}>
                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Renda mensal (R$)"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div className={wrapBase}>
                    <Target className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
                    <select
                      value={financialGoal}
                      onChange={(e) => setFinancialGoal(e.target.value)}
                      className={`${inputBase} appearance-none`}
                    >
                      {GOAL_OPTIONS.map((opt) => (
                        <option key={opt.value || 'empty'} value={opt.value} className="bg-zinc-900 text-white">{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={wrapBase}>
                    <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
                    <input
                      type="number"
                      min={1920}
                      max={2010}
                      maxLength={8}
                      placeholder="Ano (ex: 1990) ou data DDMMAAAA"
                      value={birthYear}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        if (raw.length <= 4) {
                          setBirthYear(raw);
                          return;
                        }
                        if (raw.length === 8) {
                          const year = raw.slice(4, 8);
                          setBirthYear(year);
                          return;
                        }
                        setBirthYear(raw.slice(0, 8));
                      }}
                      className={inputBase}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-nebula-purple focus:ring-nebula-purple"
              />
              <label htmlFor="terms" className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
                Li e aceito os <Link href="/termos" className="text-nebula-violet hover:underline">Termos de Uso</Link> e a <Link href="/privacidade" className="text-nebula-violet hover:underline">Política de Privacidade</Link>.
              </label>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-violet py-4 font-semibold text-white shadow-lg shadow-nebula-purple/25 transition hover:shadow-nebula-purple/40 focus:outline-none focus:ring-2 focus:ring-nebula-purple focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-70"
            >
              {loading ? 'Criando…' : (
                <>
                  Criar conta
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </>
              )}
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center text-sm text-zinc-500">
            Já tem conta?{' '}
            <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-nebula-violet hover:text-nebula-violetLight hover:underline">
              <LogIn className="h-4 w-4" /> Entrar
            </Link>
          </motion.p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">Movimente o mouse para interagir com as partículas</p>
      </motion.div>
    </main>
  );
}
