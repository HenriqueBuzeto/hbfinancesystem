/**
 * Templates de mensagens para WhatsApp e assunto/corpo para E-mail.
 * Variáveis: {{nome}}, {{valor}}, {{vencimento}}, {{descricao}}, {{status}}, {{saldo}}, {{link}}
 */

export type NotificationEventType =
  | 'BILL_DUE'
  | 'BILL_OVERDUE'
  | 'RECEIVABLE_DUE'
  | 'RECEIVABLE_RECEIVED'
  | 'EXPENSE_REGISTERED'
  | 'WEEKLY_SUMMARY'
  | 'MONTHLY_SUMMARY';

export const WHATSAPP_TEMPLATES: Record<
  NotificationEventType,
  { body: string; vars: string[] }
> = {
  BILL_DUE: {
    body: '📤 *Conta a pagar*\n\n{{descricao}}\nValor: {{valor}}\nVencimento: {{vencimento}}\nStatus: Pendente\n\n{{link}}',
    vars: ['descricao', 'valor', 'vencimento', 'link'],
  },
  BILL_OVERDUE: {
    body: '⚠️ *Conta vencida*\n\n{{descricao}}\nValor: {{valor}}\nVencimento: {{vencimento}}\nStatus: Vencida\n\nRegularize: {{link}}',
    vars: ['descricao', 'valor', 'vencimento', 'link'],
  },
  RECEIVABLE_DUE: {
    body: '📥 *Conta a receber*\n\n{{descricao}}\nValor: {{valor}}\nVencimento: {{vencimento}}\n\n{{link}}',
    vars: ['descricao', 'valor', 'vencimento', 'link'],
  },
  RECEIVABLE_RECEIVED: {
    body: '✅ *Recebimento confirmado*\n\n{{descricao}}\nValor: {{valor}}\nSaldo atualizado.\n\n{{link}}',
    vars: ['descricao', 'valor', 'link'],
  },
  EXPENSE_REGISTERED: {
    body: '💳 *Despesa registrada*\n\n{{descricao}}\nValor: {{valor}}\n\n{{link}}',
    vars: ['descricao', 'valor', 'link'],
  },
  WEEKLY_SUMMARY: {
    body: '📊 *Resumo semanal*\n\nReceitas: {{receitas}}\nDespesas: {{despesas}}\nSaldo: {{saldo}}\n\n{{link}}',
    vars: ['receitas', 'despesas', 'saldo', 'link'],
  },
  MONTHLY_SUMMARY: {
    body: '📊 *Resumo mensal*\n\nReceitas: {{receitas}}\nDespesas: {{despesas}}\nResultado: {{saldo}}\n\n{{link}}',
    vars: ['receitas', 'despesas', 'saldo', 'link'],
  },
};

export function renderWhatsAppBody(
  eventType: NotificationEventType,
  variables: Record<string, string>
): string {
  const t = WHATSAPP_TEMPLATES[eventType];
  if (!t) return '';
  let body = t.body;
  for (const [key, value] of Object.entries(variables)) {
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
  }
  return body;
}

export const EMAIL_SUBJECTS: Record<NotificationEventType, string> = {
  BILL_DUE: 'Conta a pagar em breve - {{descricao}}',
  BILL_OVERDUE: 'Conta vencida - {{descricao}}',
  RECEIVABLE_DUE: 'Conta a receber - {{descricao}}',
  RECEIVABLE_RECEIVED: 'Recebimento confirmado - {{descricao}}',
  EXPENSE_REGISTERED: 'Despesa registrada - {{descricao}}',
  WEEKLY_SUMMARY: 'Resumo financeiro semanal',
  MONTHLY_SUMMARY: 'Resumo financeiro mensal',
};

export function renderEmailSubject(
  eventType: NotificationEventType,
  variables: Record<string, string>
): string {
  let subj = EMAIL_SUBJECTS[eventType];
  for (const [key, value] of Object.entries(variables)) {
    subj = subj.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
  }
  return subj;
}
