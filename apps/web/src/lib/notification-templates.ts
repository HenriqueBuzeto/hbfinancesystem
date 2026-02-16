/**
 * Templates de mensagens de notificação (WhatsApp e E-mail).
 * Variáveis comuns: {{nome}}, {{descricao}}, {{valor}}, {{vencimento}}, {{link}}, {{receitas}}, {{despesas}}, {{saldo}}
 */

export type NotificationEventType =
  | 'BILL_DUE'
  | 'BILL_OVERDUE'
  | 'RECEIVABLE_DUE'
  | 'RECEIVABLE_RECEIVED'
  | 'EXPENSE_REGISTERED'
  | 'BUDGET_ALERT'
  | 'BURN_RATE'
  | 'LOW_BALANCE'
  | 'WEEKLY_SUMMARY'
  | 'MONTHLY_SUMMARY'
  | 'AI_TIP'
  | 'TESTE';

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEventType, string> = {
  BILL_DUE: 'Conta a pagar (próxima do vencimento)',
  BILL_OVERDUE: 'Conta vencida',
  RECEIVABLE_DUE: 'Conta a receber (próxima do vencimento)',
  RECEIVABLE_RECEIVED: 'Conta recebida',
  EXPENSE_REGISTERED: 'Despesa registrada',
  BUDGET_ALERT: 'Alerta de orçamento',
  BURN_RATE: 'Ritmo de gastos',
  LOW_BALANCE: 'Saldo baixo',
  WEEKLY_SUMMARY: 'Resumo semanal',
  MONTHLY_SUMMARY: 'Resumo mensal',
  AI_TIP: 'Dica inteligente',
  TESTE: 'Mensagem de teste',
};

/** Templates WhatsApp: corpo da mensagem e variáveis esperadas */
export const WHATSAPP_TEMPLATES: Record<
  NotificationEventType,
  { body: string; vars: string[] }
> = {
  BILL_DUE: {
    body: '📤 *HB Finance – Conta a pagar*\n\nOlá, {{nome}}!\n\n*{{descricao}}*\nValor: {{valor}}\nVencimento: {{vencimento}}\nStatus: Pendente\n\nAcesse: {{link}}',
    vars: ['nome', 'descricao', 'valor', 'vencimento', 'link'],
  },
  BILL_OVERDUE: {
    body: '⚠️ *HB Finance – Conta vencida*\n\nOlá, {{nome}}!\n\n*{{descricao}}*\nValor: {{valor}}\nVencimento: {{vencimento}}\nStatus: Vencida\n\nRegularize: {{link}}',
    vars: ['nome', 'descricao', 'valor', 'vencimento', 'link'],
  },
  RECEIVABLE_DUE: {
    body: '📥 *HB Finance – Conta a receber*\n\nOlá, {{nome}}!\n\n*{{descricao}}*\nValor: {{valor}}\nVencimento: {{vencimento}}\n\nAcesse: {{link}}',
    vars: ['nome', 'descricao', 'valor', 'vencimento', 'link'],
  },
  RECEIVABLE_RECEIVED: {
    body: '✅ *HB Finance – Recebimento confirmado*\n\nOlá, {{nome}}!\n\n*{{descricao}}*\nValor: {{valor}}\nSaldo atualizado.\n\n{{link}}',
    vars: ['nome', 'descricao', 'valor', 'link'],
  },
  EXPENSE_REGISTERED: {
    body: '💳 *HB Finance – Despesa registrada*\n\nOlá, {{nome}}!\n\n*{{descricao}}*\nValor: {{valor}}\n\n{{link}}',
    vars: ['nome', 'descricao', 'valor', 'link'],
  },
  BUDGET_ALERT: {
    body: '📊 *HB Finance – Alerta de orçamento*\n\nOlá, {{nome}}!\n\n{{descricao}}\nCategoria: {{categoria}}\nValor: {{valor}}\nLimite: {{limite}}\n\n{{link}}',
    vars: ['nome', 'descricao', 'categoria', 'valor', 'limite', 'link'],
  },
  BURN_RATE: {
    body: '📉 *HB Finance – Ritmo de gastos*\n\nOlá, {{nome}}!\n\n{{descricao}}\nGastos no período: {{valor}}\n\n{{link}}',
    vars: ['nome', 'descricao', 'valor', 'link'],
  },
  LOW_BALANCE: {
    body: '💰 *HB Finance – Saldo baixo*\n\nOlá, {{nome}}!\n\n{{descricao}}\nSaldo atual: {{valor}}\nConta: {{conta}}\n\n{{link}}',
    vars: ['nome', 'descricao', 'valor', 'conta', 'link'],
  },
  WEEKLY_SUMMARY: {
    body: '📊 *HB Finance – Resumo semanal*\n\nOlá, {{nome}}!\n\nReceitas: {{receitas}}\nDespesas: {{despesas}}\nSaldo: {{saldo}}\n\n{{link}}',
    vars: ['nome', 'receitas', 'despesas', 'saldo', 'link'],
  },
  MONTHLY_SUMMARY: {
    body: '📊 *HB Finance – Resumo mensal*\n\nOlá, {{nome}}!\n\nReceitas: {{receitas}}\nDespesas: {{despesas}}\nResultado: {{saldo}}\n\n{{link}}',
    vars: ['nome', 'receitas', 'despesas', 'saldo', 'link'],
  },
  AI_TIP: {
    body: '💡 *HB Finance – Dica*\n\nOlá, {{nome}}!\n\n{{descricao}}\n\n{{link}}',
    vars: ['nome', 'descricao', 'link'],
  },
  TESTE: {
    body: '🔔 *HB Finance – Teste de notificação*\n\nOlá, {{nome}}!\n\nAs notificações por WhatsApp estão ativas. Você receberá lembretes de vencimento e resumos conforme suas preferências.',
    vars: ['nome'],
  },
};

/** Assuntos de e-mail por tipo de evento */
export const EMAIL_SUBJECTS: Record<NotificationEventType, string> = {
  BILL_DUE: 'Conta a pagar em breve - {{descricao}}',
  BILL_OVERDUE: 'Conta vencida - {{descricao}}',
  RECEIVABLE_DUE: 'Conta a receber - {{descricao}}',
  RECEIVABLE_RECEIVED: 'Recebimento confirmado - {{descricao}}',
  EXPENSE_REGISTERED: 'Despesa registrada - {{descricao}}',
  BUDGET_ALERT: 'Alerta de orçamento - {{descricao}}',
  BURN_RATE: 'Ritmo de gastos - HB Finance',
  LOW_BALANCE: 'Saldo baixo - {{conta}}',
  WEEKLY_SUMMARY: 'Resumo financeiro semanal',
  MONTHLY_SUMMARY: 'Resumo financeiro mensal',
  AI_TIP: 'Dica - HB Finance',
  TESTE: 'Teste de notificação - HB Finance',
};

/**
 * Substitui variáveis {{var}} no texto pelo valor em variables.
 */
export function renderTemplate(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
  }
  return result;
}

/**
 * Gera o corpo da mensagem WhatsApp para um tipo de notificação.
 */
export function renderWhatsAppBody(
  eventType: NotificationEventType,
  variables: Record<string, string>
): string {
  const t = WHATSAPP_TEMPLATES[eventType];
  if (!t) return '';
  return renderTemplate(t.body, variables);
}

/**
 * Gera o assunto do e-mail para um tipo de notificação.
 */
export function renderEmailSubject(
  eventType: NotificationEventType,
  variables: Record<string, string>
): string {
  const subj = EMAIL_SUBJECTS[eventType];
  if (!subj) return 'Notificação HB Finance';
  return renderTemplate(subj, variables);
}

/** Valores de exemplo para preview dos templates */
export const TEMPLATE_SAMPLE_VARIABLES: Record<string, string> = {
  nome: 'Maria',
  descricao: 'Aluguel',
  valor: 'R$ 1.500,00',
  vencimento: '15/03/2025',
  link: 'https://app.hbfinance.com',
  receitas: 'R$ 8.000,00',
  despesas: 'R$ 5.200,00',
  saldo: 'R$ 2.800,00',
  categoria: 'Moradia',
  limite: 'R$ 2.000,00',
  conta: 'Conta corrente',
};
