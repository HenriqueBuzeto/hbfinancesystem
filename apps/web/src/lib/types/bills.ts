export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type BillType = 'PAYABLE' | 'RECEIVABLE';
export type RecurrenceType = 'NONE' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  type: BillType;
  status: BillStatus;
  recurrence?: RecurrenceType;
  categoryId?: string;
  categoryName?: string;
  totalInstallments?: number;
  currentInstallment?: number;
  paidAt?: string;
  createdAt: string;
}

export const BILL_STATUS_LABEL: Record<BillStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  CANCELLED: 'Cancelado',
};

export const RECURRENCE_LABEL: Record<RecurrenceType, string> = {
  NONE: 'Nenhuma',
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
};
