'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, Loader2, Receipt } from 'lucide-react';
import { cn } from '@nebula-finance/ui';

type CategoryExpense = {
  id: string;
  name: string;
  amount: number;
  budget?: number;
  color: string;
};

const CATEGORY_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ec4899', '#f59e0b'];

const MONTH_OPTIONS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Fev' }, { value: '03', label: 'Mar' },
  { value: '04', label: 'Abr' }, { value: '05', label: 'Mai' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Ago' }, { value: '09', label: 'Set' },
  { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' },
];

export default function DespesasPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() =>
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [loading, setLoading] = useState(true);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [categories, setCategories] = useState<CategoryExpense[]>([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState<{ month: string; valor: number }[]>([]);
  const [overBudget, setOverBudget] = useState<CategoryExpense[]>([]);

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    fetch(`/api/expenses/summary?month=${selectedMonth}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setTotalDespesas(0);
          setCategories([]);
          setMonthlyEvolution([]);
          setOverBudget([]);
          return;
        }
        setTotalDespesas(data.total ?? 0);
        const byCat: CategoryExpense[] = (data.byCategory ?? []).map((c: { id: string; name: string; amount: number; budget?: number }, i: number) => ({
          id: c.id,
          name: c.name,
          amount: c.amount,
          budget: c.budget,
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }));
        setCategories(byCat);
        setMonthlyEvolution(data.monthlyEvolution ?? []);
        const over = byCat.filter((c: CategoryExpense) => c.budget != null && c.amount > c.budget);
        setOverBudget(over);
      })
      .catch(() => {
        setTotalDespesas(0);
        setCategories([]);
        setMonthlyEvolution([]);
        setOverBudget([]);
      })
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const pieData = useMemo(
    () =>
      categories.map((c) => ({
        name: c.name,
        value: c.amount,
        color: c.color,
      })),
    [categories]
  );

  const hasData = totalDespesas > 0 || categories.length > 0;

  const monthSelectOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const value = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_OPTIONS[x.getMonth()].label} ${x.getFullYear()}`;
      opts.push({ value, label });
    }
    return opts;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold text-white">Despesas</h1>
        <p className="mt-1 text-zinc-400">
          Despesas por categoria, comparativos mensais e identificação de gastos excessivos
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] py-16">
          <Loader2 className="h-10 w-10 animate-spin text-nebula-purple" />
          <p className="text-sm text-zinc-400">Carregando despesas...</p>
        </div>
      ) : !hasData ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] px-6 py-4 backdrop-blur-sm">
              <p className="text-sm font-medium text-zinc-400">Total de despesas (mês)</p>
              <p className="text-2xl font-bold text-white">R$ 0</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Mês:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-nebula-purple/50 [&_option]:bg-zinc-900 [&_option]:text-white"
              >
                {monthSelectOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] py-16">
            <Receipt className="h-14 w-14 text-zinc-500" />
            <p className="text-lg font-medium text-white">Nenhuma despesa neste mês</p>
            <p className="max-w-sm text-center text-sm text-zinc-400">
              Suas despesas aparecerão aqui quando você lançar movimentações do tipo &quot;Despesa&quot; no Dashboard ou nas Contas.
            </p>
          </div>
        </div>
      ) : (
        <>
      {/* Alertas de orçamento estourado */}
      {overBudget.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="font-medium">Gastos acima do orçamento</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-zinc-300">
            {overBudget.map((c) => (
              <li key={c.id}>
                {c.name}: R$ {c.amount.toLocaleString('pt-BR')} (orçamento R${c.budget!.toLocaleString('pt-BR')})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resumo e filtro */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] px-6 py-4 backdrop-blur-sm">
          <p className="text-sm font-medium text-zinc-400">Total de despesas (mês)</p>
          <p className="text-2xl font-bold text-white">
            R$ {totalDespesas.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Mês:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-nebula-purple/50 [&_option]:bg-zinc-900 [&_option]:text-white"
          >
            {monthSelectOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de pizza */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-white">
            Distribuição por categoria
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: R$ ${value.toLocaleString('pt-BR')}`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  contentStyle={{
                    background: 'rgba(15,15,22,0.98)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Comparativo mensal */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-white">
            Evolução mensal das despesas
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.15)" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `R$ ${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Despesas']}
                  contentStyle={{
                    background: 'rgba(15,15,22,0.98)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="valor" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* Tabela de categorias com histórico */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] backdrop-blur-sm"
      >
        <h2 className="border-b border-nebula-purple/20 px-6 py-4 text-lg font-semibold text-white">
          Detalhamento por categoria
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 font-semibold text-zinc-400">Categoria</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Valor</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Orçamento</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">% do total</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const pct = totalDespesas ? (cat.amount / totalDespesas) * 100 : 0;
                const over = cat.budget != null && cat.amount > cat.budget;
                return (
                  <tr
                    key={cat.id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                    <td className="px-6 py-4 text-white">
                      R$ {cat.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {cat.budget != null
                        ? `R$ ${cat.budget.toLocaleString('pt-BR')}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{pct.toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      {over ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400">
                          <AlertTriangle className="h-3.5 w-3.5" /> Acima
                        </span>
                      ) : cat.budget != null ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
                          <TrendingUp className="h-3.5 w-3.5" /> Dentro
                        </span>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>
        </>
      )}
    </motion.div>
  );
}
