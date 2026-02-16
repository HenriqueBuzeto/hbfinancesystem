'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Pencil, Trash2, ArrowDownCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BillModal, type BillFormData } from '@/components/bills/BillModal';
import { cn } from '@nebula-finance/ui';
import type { Bill, BillStatus } from '@/lib/types/bills';
import { BILL_STATUS_LABEL, RECURRENCE_LABEL } from '@/lib/types/bills';

function toBill(item: { id: string; description: string; amount: number; dueDate: string; type: string; status: string; recurrence?: string | null; categoryName?: string | null; totalInstallments?: number | null; currentInstallment?: number | null; createdAt: string; paidAt?: string | null }): Bill {
  return {
    id: item.id,
    description: item.description,
    amount: item.amount,
    dueDate: item.dueDate,
    type: 'RECEIVABLE',
    status: item.status as Bill['status'],
    recurrence: item.recurrence as Bill['recurrence'],
    categoryName: item.categoryName ?? undefined,
    totalInstallments: item.totalInstallments ?? undefined,
    currentInstallment: item.currentInstallment ?? undefined,
    createdAt: item.createdAt,
    paidAt: item.paidAt ?? undefined,
  };
}

export default function ContasAReceberPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'ALL'>('ALL');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/bills?type=RECEIVABLE', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.data)) {
        setBills(json.data.map(toBill));
      }
    } catch {
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const matchSearch =
        !search || b.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bills, search, statusFilter]);

  const totals = useMemo(() => {
    const pending = filtered.filter((b) => b.status === 'PENDING').reduce((s, b) => s + b.amount, 0);
    const paid = filtered.filter((b) => b.status === 'PAID').reduce((s, b) => s + b.amount, 0);
    return { pending, paid, total: pending + paid };
  }, [filtered]);

  const handleSubmit = async (data: BillFormData) => {
    const amount = parseFloat(data.amount) || 0;
    const dueDate = data.dueDate + 'T12:00:00Z';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (editingBill) {
      const res = await fetch(`/api/bills/${editingBill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          description: data.description,
          amount,
          dueDate,
          status: data.status,
          recurrence: data.recurrence === 'NONE' ? null : data.recurrence,
          categoryId: null,
          totalInstallments: data.totalInstallments ? parseInt(data.totalInstallments, 10) : null,
          currentInstallment: data.currentInstallment ? parseInt(data.currentInstallment, 10) : null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBills((prev) => prev.map((b) => (b.id === editingBill.id ? toBill(updated) : b)));
        toast.success('Conta a receber atualizada.');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || 'Falha ao atualizar.');
      }
    } else {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          description: data.description,
          amount,
          dueDate,
          type: 'RECEIVABLE',
          status: data.status,
          recurrence: data.recurrence === 'NONE' ? null : data.recurrence,
          categoryId: null,
          totalInstallments: data.totalInstallments ? parseInt(data.totalInstallments, 10) : null,
          currentInstallment: data.currentInstallment ? parseInt(data.currentInstallment, 10) : null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setBills((prev) => [toBill(created), ...prev]);
        toast.success('Conta a receber cadastrada.');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || 'Falha ao cadastrar.');
      }
    }
    setEditingBill(null);
    setModalOpen(false);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const res = await fetch(`/api/bills/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      setBills((prev) => prev.filter((b) => b.id !== id));
      setEditingBill(null);
      toast.success('Conta removida.');
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error || 'Falha ao remover.');
    }
  };

  const handleMarkReceived = async (bill: Bill) => {
    if (bill.status === 'PAID') return;
    setMarkingId(bill.id);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch(`/api/bills/${bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: 'PAID' }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setBills((prev) =>
          prev.map((b) =>
            b.id === bill.id ? { ...b, status: 'PAID' as const, paidAt: now } : b
          )
        );
        toast.success('Conta marcada como recebida.');
      } else {
        const json = await res.json().catch(() => ({}));
        if (res.status === 404) {
          const now = new Date().toISOString();
          setBills((prev) =>
            prev.map((b) =>
              b.id === bill.id ? { ...b, status: 'PAID' as const, paidAt: now } : b
            )
          );
          toast.success('Conta marcada como recebida.');
        } else {
          toast.error(json?.error || 'Falha ao marcar como recebida.');
        }
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setMarkingId(null);
    }
  };

  const openNew = () => {
    setEditingBill(null);
    setModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contas a Receber</h1>
          <p className="mt-1 text-zinc-400">
            Cadastro de receitas, categorias e recorrência
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-green-500/25 transition hover:shadow-green-500/40 touch-manipulation"
        >
          <Plus className="h-5 w-5" /> Nova receita
        </button>
      </header>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-5 backdrop-blur-sm">
          <p className="text-sm font-medium text-zinc-400">A receber (filtro)</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            R$ {totals.pending.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-5 backdrop-blur-sm">
          <p className="text-sm font-medium text-zinc-400">Recebido (filtro)</p>
          <p className="mt-1 text-2xl font-bold text-white">
            R$ {totals.paid.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-5 backdrop-blur-sm">
          <p className="text-sm font-medium text-zinc-400">Total (filtro)</p>
          <p className="mt-1 text-2xl font-bold text-nebula-violetLight">
            R$ {totals.total.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 outline-none focus:border-nebula-purple/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" aria-hidden />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BillStatus | 'ALL')}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-nebula-purple/50 [&_option]:bg-white [&_option]:text-gray-900"
          >
            <option value="ALL" className="bg-white text-gray-900">Todos os status</option>
            {(Object.entries(BILL_STATUS_LABEL) as [BillStatus, string][]).map(([k, v]) => (
              <option key={k} value={k} className="bg-white text-gray-900">{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-nebula-violet" aria-hidden />
          </div>
        ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-nebula-purple/20">
                <th className="px-6 py-4 font-semibold text-zinc-400">Descrição</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Valor</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Vencimento</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Status</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Categoria</th>
                <th className="px-6 py-4 font-semibold text-zinc-400">Recorrência</th>
                <th className="px-6 py-4 font-semibold text-zinc-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-white/5 transition hover:bg-white/5"
                >
                  <td className="px-6 py-4 font-medium text-white">{bill.description}</td>
                  <td className="px-6 py-4 text-green-400">
                    R$ {bill.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-lg px-2.5 py-1 text-xs font-medium',
                        bill.status === 'PAID' && 'bg-green-500/20 text-green-400',
                        bill.status === 'PENDING' && 'bg-amber-500/20 text-amber-400',
                        bill.status === 'OVERDUE' && 'bg-red-500/20 text-red-400',
                        bill.status === 'CANCELLED' && 'bg-zinc-500/20 text-zinc-400'
                      )}
                    >
                      {BILL_STATUS_LABEL[bill.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{bill.categoryName ?? '—'}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    {bill.recurrence ? RECURRENCE_LABEL[bill.recurrence] : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {bill.status !== 'PAID' && (
                      <button
                        type="button"
                        onClick={() => handleMarkReceived(bill)}
                        disabled={markingId === bill.id}
                        className="mr-1 inline-flex items-center gap-1.5 rounded-lg bg-green-600/20 px-3 py-1.5 text-sm font-medium text-green-400 transition hover:bg-green-600/30 disabled:opacity-50"
                        aria-label="Marcar como recebido"
                      >
                        {markingId === bill.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Recebido
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(bill)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bill.id)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <ArrowDownCircle className="mb-4 h-12 w-12 text-nebula-purple/50" />
            <p>Nenhuma conta a receber encontrada.</p>
            <button
              type="button"
              onClick={openNew}
              className="mt-4 text-nebula-violet hover:underline"
            >
              Cadastrar primeira receita
            </button>
          </div>
        )}
        </>
        )}
      </div>

      <BillModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBill(null);
        }}
        onSubmit={handleSubmit}
        type="RECEIVABLE"
        editBill={editingBill}
      />
    </motion.div>
  );
}
