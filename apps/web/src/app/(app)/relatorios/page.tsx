'use client';

import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { PlanGate } from '@/components/plans/PlanGate';

type ReportPeriod = 'monthly' | 'yearly';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Dados zerados mensais: últimos 12 meses (evita dados falsos até integrar com API). */
function getMonthlyReportData(): Array<{ mes: string; receitas: number; despesas: number; saldo: number }> {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const mes = MESES[d.getMonth()];
    return { mes, receitas: 0, despesas: 0, saldo: 0 };
  });
}

/** Dados zerados anuais: últimos 5 anos (evita dados falsos até integrar com API). */
function getYearlyReportData(): Array<{ ano: string; receitas: number; despesas: number; saldo: number }> {
  const year = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({
    ano: String(year - 4 + i),
    receitas: 0,
    despesas: 0,
    saldo: 0,
  }));
}

function formatCurrency(v: number) {
  return `R$ ${v.toLocaleString('pt-BR')}`;
}

function exportToCSV(
  data: Array<{ mes?: string; ano?: string; receitas: number; despesas: number; saldo: number }>,
  period: ReportPeriod
) {
  const headers = period === 'monthly' ? ['Mês', 'Receitas', 'Despesas', 'Saldo'] : ['Ano', 'Receitas', 'Despesas', 'Saldo'];
  const key = period === 'monthly' ? 'mes' : 'ano';
  const rows = data.map((d) => [
    d[key] ?? '',
    d.receitas,
    d.despesas,
    d.saldo,
  ]);
  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-financeiro-${period === 'monthly' ? 'mensal' : 'anual'}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const printRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(
    () => (period === 'monthly' ? getMonthlyReportData() : getYearlyReportData()),
    [period]
  );
  const dataKey = period === 'monthly' ? 'mes' : 'ano';

  const handleExportExcel = () => {
    const data = period === 'monthly' ? getMonthlyReportData() : getYearlyReportData();
    exportToCSV(data, period);
    toast.success('Planilha exportada. Abra o arquivo CSV no Excel.');
  };

  const handleExportPDF = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Permita pop-ups para gerar o PDF.');
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - HB Finance</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a1a; }
            h1 { color: #7c3aed; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e5e5e5; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .summary { display: flex; gap: 24px; margin: 24px 0; flex-wrap: wrap; }
            .summary div { padding: 16px; background: #f8f8f8; border-radius: 8px; min-width: 140px; }
            .summary strong { display: block; font-size: 1.25rem; color: #7c3aed; }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <p>Período: ${period === 'monthly' ? 'Mensal (últimos 6 meses)' : 'Anual (últimos 5 anos)'}</p>
          <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          <div class="summary">
            <div><span>Total Receitas</span><strong>${formatCurrency(chartData.reduce((s, d) => s + d.receitas, 0))}</strong></div>
            <div><span>Total Despesas</span><strong>${formatCurrency(chartData.reduce((s, d) => s + d.despesas, 0))}</strong></div>
            <div><span>Saldo</span><strong>${formatCurrency(chartData.reduce((s, d) => s + d.saldo, 0))}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${period === 'monthly' ? 'Mês' : 'Ano'}</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${chartData
                .map(
                  (d: Record<string, number | string>) =>
                    `<tr>
                      <td>${d[dataKey]}</td>
                      <td>${formatCurrency(Number(d.receitas))}</td>
                      <td>${formatCurrency(Number(d.despesas))}</td>
                      <td>${formatCurrency(Number(d.saldo))}</td>
                    </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <p style="margin-top: 32px; color: #888; font-size: 12px;">HB Finance - Sistema Financeiro Pessoal</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
    toast.success('Use "Salvar como PDF" na impressora para gerar o PDF.');
  };

  return (
    <PlanGate feature="advancedReports" requiredPlan="START">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="mt-1 text-zinc-400">
            Relatório mensal e anual, análise de receitas, despesas e fluxo de caixa
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                period === 'monthly' ? 'bg-nebula-purple/30 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setPeriod('yearly')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                period === 'yearly' ? 'bg-nebula-purple/30 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Anual
            </button>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-nebula-purple/30 bg-nebula-purple/10 px-4 py-2.5 font-medium text-nebula-violetLight transition hover:bg-nebula-purple/20"
          >
            <FileSpreadsheet className="h-5 w-5" /> Exportar Excel
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-nebula-purple to-nebula-violet px-4 py-2.5 font-semibold text-white shadow-lg shadow-nebula-purple/25 transition btn-glow"
          >
            <FileText className="h-5 w-5" /> Exportar PDF
          </button>
        </div>
      </header>

      <div ref={printRef} className="hidden print:block" aria-hidden>
        {/* Conteúdo usado apenas para o PDF */}
      </div>

      {/* Análise de receitas */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-white">Análise de receitas</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.15)" />
              <XAxis dataKey={dataKey} stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `R$ ${v / 1000}k`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Receitas']}
                contentStyle={{
                  background: 'rgba(15,15,22,0.98)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '12px',
                }}
              />
              <Area type="monotone" dataKey="receitas" stroke="#7c3aed" fill="url(#gradReceitas)" strokeWidth={2} name="Receitas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Análise de despesas */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-white">Análise de despesas</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.15)" />
              <XAxis dataKey={dataKey} stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `R$ ${v / 1000}k`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Despesas']}
                contentStyle={{
                  background: 'rgba(15,15,22,0.98)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="despesas" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Fluxo de caixa */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-white">Fluxo de caixa</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.15)" />
              <XAxis dataKey={dataKey} stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `R$ ${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,15,22,0.98)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '12px',
                }}
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Saldo']}
              />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#7c3aed" strokeWidth={2} name="Receitas" dot={{ fill: '#7c3aed' }} />
              <Line type="monotone" dataKey="despesas" stroke="#8b5cf6" strokeWidth={2} name="Despesas" dot={{ fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="saldo" stroke="#22c55e" strokeWidth={2} name="Saldo" dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </motion.div>
    </PlanGate>
  );
}
