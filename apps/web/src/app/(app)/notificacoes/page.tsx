'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  MessageCircle,
  Mail,
  Settings,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@nebula-finance/ui';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  channel: string;
  readAt: string | null;
  createdAt: string;
};

type Preference = {
  id: string;
  channel: 'WHATSAPP' | 'EMAIL';
  enabled: boolean;
  eventTypes: string[];
  dailyTime: string | null;
  weeklyDay: number | null;
  monthlyDay: number | null;
};

const EVENT_LABELS: Record<string, string> = {
  BILL_DUE: 'Conta a pagar (próxima do vencimento)',
  BILL_OVERDUE: 'Conta vencida',
  RECEIVABLE_DUE: 'Conta a receber (próxima do vencimento)',
  RECEIVABLE_RECEIVED: 'Conta recebida',
  EXPENSE_REGISTERED: 'Despesa registrada',
  WEEKLY_SUMMARY: 'Resumo semanal',
  MONTHLY_SUMMARY: 'Resumo mensal',
  BUDGET_ALERT: 'Alerta de orçamento',
  LOW_BALANCE: 'Saldo baixo',
  AI_TIP: 'Dica inteligente',
};

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  async function loadNotifications() {
    try {
      const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
      const res = await fetch('/api/notifications?limit=50', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data ?? []);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPreferences() {
    try {
      const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
      const res = await fetch('/api/notification-preferences', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? [];
        if (data.length === 0) {
          setPreferences([
            { id: '', channel: 'WHATSAPP', enabled: false, eventTypes: [], dailyTime: '08:00', weeklyDay: 1, monthlyDay: 1 },
            { id: '', channel: 'EMAIL', enabled: false, eventTypes: [], dailyTime: '08:00', weeklyDay: 1, monthlyDay: 1 },
          ]);
        } else {
          setPreferences(data);
        }
      }
    } catch {
      setPreferences([
        { id: '', channel: 'WHATSAPP', enabled: false, eventTypes: [], dailyTime: '08:00', weeklyDay: 1, monthlyDay: 1 },
        { id: '', channel: 'EMAIL', enabled: false, eventTypes: [], dailyTime: '08:00', weeklyDay: 1, monthlyDay: 1 },
      ]);
    }
  }

  async function markRead(id: string) {
    const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    }
  }

  async function markAllRead() {
    const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      toast.success('Todas marcadas como lidas');
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    }
  }

  async function sendWhatsAppTest() {
    setSendingTest(true);
    try {
      const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
      const res = await fetch('/api/notifications/send-whatsapp-test', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(json.message ?? 'Mensagem de teste enviada para seu WhatsApp.');
      } else {
        toast.error(json.error ?? 'Falha ao enviar. Verifique o telefone no perfil e a configuração Twilio.');
      }
    } finally {
      setSendingTest(false);
    }
  }

  async function savePreference(channel: 'WHATSAPP' | 'EMAIL', data: Partial<Preference>) {
    setSavingPrefs(true);
    try {
      const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
      const res = await fetch('/api/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ channel, ...data }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences((prev) => prev.map((p) => (p.channel === channel ? { ...p, ...updated } : p)));
        toast.success('Preferências salvas');
      }
    } finally {
      setSavingPrefs(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Central de notificações</h1>
          <p className="mt-1 text-zinc-400">
            Alertas de vencimento, resumos e preferências de envio (WhatsApp e e-mail)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-nebula-purple/30 bg-nebula-purple/10 px-4 py-2.5 text-sm font-medium text-nebula-violetLight transition hover:bg-nebula-purple/20"
            >
              <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
            </button>
          )}
          <button
            type="button"
            onClick={() => setPrefsOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl bg-nebula-purple/20 px-4 py-2.5 text-sm font-medium text-nebula-violet transition hover:bg-nebula-purple/30"
          >
            <Settings className="h-4 w-4" /> Preferências
            <ChevronDown className={cn('h-4 w-4 transition', prefsOpen && 'rotate-180')} />
          </button>
        </div>
      </header>

      {prefsOpen && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 backdrop-blur-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-white">Canais e eventos</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Escolha em quais canais deseja receber cada tipo de alerta. Configure também o telefone (WhatsApp) no seu perfil.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {(['WHATSAPP', 'EMAIL'] as const).map((channel) => {
              const pref = preferences.find((p) => p.channel === channel) ?? {
                channel,
                enabled: false,
                eventTypes: [] as string[],
                dailyTime: '08:00',
                weeklyDay: 1,
                monthlyDay: 1,
              };
              return (
                <div
                  key={channel}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    {channel === 'WHATSAPP' ? (
                      <MessageCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Mail className="h-5 w-5 text-nebula-violet" />
                    )}
                    <span className="font-medium text-white">{channel === 'WHATSAPP' ? 'WhatsApp' : 'E-mail'}</span>
                    {channel === 'WHATSAPP' && (
                      <button
                        type="button"
                        onClick={sendWhatsAppTest}
                        disabled={sendingTest}
                        className="ml-auto flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                      >
                        {sendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
                        {sendingTest ? 'Enviando...' : 'Enviar teste'}
                      </button>
                    )}
                    <label className="ml-auto flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pref.enabled}
                        onChange={(e) => savePreference(channel, { enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-nebula-purple"
                      />
                      Ativo
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(EVENT_LABELS) as [string, string][]).map(([type, label]) => (
                      <label
                        key={type}
                        className={cn(
                          'inline-flex cursor-pointer rounded-lg border px-2.5 py-1 text-xs transition',
                          ((pref.eventTypes ?? []) as string[]).includes(type)
                            ? 'border-nebula-purple/50 bg-nebula-purple/20 text-white'
                            : 'border-white/10 text-zinc-400 hover:border-white/20'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={((pref.eventTypes ?? []) as string[]).includes(type)}
                          onChange={(e) => {
                            const current = (pref.eventTypes ?? []) as string[];
                            const next = e.target.checked
                              ? [...current, type]
                              : current.filter((t: string) => t !== type);
                            savePreference(channel, { ...pref, eventTypes: next });
                          }}
                          className="sr-only"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {savingPrefs && (
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
            </p>
          )}
        </motion.section>
      )}

      <section className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] backdrop-blur-sm">
        <h2 className="border-b border-nebula-purple/20 px-6 py-4 text-lg font-semibold text-white">
          Histórico de alertas
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-nebula-purple" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Bell className="mb-4 h-12 w-12 text-nebula-purple/50" />
            <p>Nenhuma notificação ainda.</p>
            <p className="mt-1 text-sm">Ative as preferências acima para receber alertas por WhatsApp ou e-mail.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  'flex items-start gap-4 px-6 py-4 transition hover:bg-white/5',
                  !n.readAt && 'bg-nebula-purple/5'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {!n.readAt ? (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="rounded-full p-1.5 text-nebula-violet hover:bg-nebula-purple/20"
                      aria-label="Marcar como lida"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="block h-4 w-4 rounded-full border border-white/20" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-sm text-zinc-400">{n.body}</p>}
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(n.createdAt).toLocaleString('pt-BR')}
                    {n.channel !== 'IN_APP' && ` · ${n.channel}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}
