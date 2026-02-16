'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@hb-finance/ui';
import type { Bill, BillStatus, RecurrenceType } from '@/lib/types/bills';
import { BILL_STATUS_LABEL, RECURRENCE_LABEL } from '@/lib/types/bills';

type BillType = 'PAYABLE' | 'RECEIVABLE';

export type BillFormData = {
  description: string;
  amount: string;
  dueDate: string;
  status: BillStatus;
  recurrence: RecurrenceType;
  categoryName: string;
  totalInstallments: string;
  currentInstallment: string;
};

const defaultForm: BillFormData = {
  description: '',
  amount: '',
  dueDate: new Date().toISOString().slice(0, 10),
  status: 'PENDING',
  recurrence: 'NONE',
  categoryName: '',
  totalInstallments: '1',
  currentInstallment: '1',
};

type BillModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BillFormData) => void;
  type: BillType;
  editBill?: Bill | null;
};

export function BillModal({ open, onClose, onSubmit, type, editBill }: BillModalProps) {
  const [form, setForm] = useState<BillFormData>(defaultForm);

  useEffect(() => {
    if (editBill) {
      setForm({
        description: editBill.description,
        amount: String(editBill.amount),
        dueDate: editBill.dueDate.slice(0, 10),
        status: editBill.status,
        recurrence: editBill.recurrence ?? 'NONE',
        categoryName: editBill.categoryName ?? '',
        totalInstallments: String(editBill.totalInstallments ?? 1),
        currentInstallment: String(editBill.currentInstallment ?? 1),
      });
    } else {
      setForm(defaultForm);
    }
  }, [editBill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  const title = type === 'RECEIVABLE' ? 'Conta a receber' : 'Conta a pagar';
  const isReceivable = type === 'RECEIVABLE';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass-card relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-glow"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bill-modal-title"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 id="bill-modal-title" className="text-xl font-bold text-white">
              {editBill ? 'Editar' : 'Nova'} {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="bill-desc" className="mb-1 block text-sm font-medium text-zinc-400">
                Descrição
              </label>
              <input
                id="bill-desc"
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-nebula-purple/50"
                placeholder="Ex: Salário, Aluguel..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bill-amount" className="mb-1 block text-sm font-medium text-zinc-400">
                  Valor (R$)
                </label>
                <input
                  id="bill-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-nebula-purple/50"
                  required
                />
              </div>
              <div>
                <label htmlFor="bill-due" className="mb-1 block text-sm font-medium text-zinc-400">
                  Vencimento
                </label>
                <input
                  id="bill-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-nebula-purple/50"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bill-status" className="mb-1 block text-sm font-medium text-zinc-400">
                  Status
                </label>
                <select
                  id="bill-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BillStatus }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-nebula-purple/50 [&_option]:bg-white [&_option]:text-gray-900"
                >
                  {(Object.entries(BILL_STATUS_LABEL) as [BillStatus, string][]).map(([k, v]) => (
                    <option key={k} value={k} className="bg-white text-gray-900">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bill-recurrence" className="mb-1 block text-sm font-medium text-zinc-400">
                  Recorrência
                </label>
                <select
                  id="bill-recurrence"
                  value={form.recurrence}
                  onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value as RecurrenceType }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-nebula-purple/50 [&_option]:bg-white [&_option]:text-gray-900"
                >
                  {(Object.entries(RECURRENCE_LABEL) as [RecurrenceType, string][]).map(([k, v]) => (
                    <option key={k} value={k} className="bg-white text-gray-900">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="bill-category" className="mb-1 block text-sm font-medium text-zinc-400">
                Categoria
              </label>
              <input
                id="bill-category"
                type="text"
                value={form.categoryName}
                onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-nebula-purple/50"
                placeholder="Ex: Salário, Moradia..."
              />
            </div>
            {(form.recurrence && form.recurrence !== 'NONE') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bill-total" className="mb-1 block text-sm font-medium text-zinc-400">
                    Total de parcelas
                  </label>
                  <input
                    id="bill-total"
                    type="number"
                    min="1"
                    value={form.totalInstallments}
                    onChange={(e) => setForm((f) => ({ ...f, totalInstallments: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-nebula-purple/50"
                  />
                </div>
                <div>
                  <label htmlFor="bill-current" className="mb-1 block text-sm font-medium text-zinc-400">
                    Parcela atual
                  </label>
                  <input
                    id="bill-current"
                    type="number"
                    min="1"
                    value={form.currentInstallment}
                    onChange={(e) => setForm((f) => ({ ...f, currentInstallment: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-nebula-purple/50"
                  />
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/20 py-3 font-medium text-zinc-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={cn(
                  'flex-1 rounded-xl py-3 font-semibold text-white transition btn-glow',
                  isReceivable
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/25'
                    : 'bg-gradient-to-r from-nebula-purple to-nebula-violet shadow-nebula-purple/25'
                )}
              >
                {editBill ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
