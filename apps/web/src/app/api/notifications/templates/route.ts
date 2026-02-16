/**
 * GET /api/notifications/templates
 * Lista os templates de notificação disponíveis (WhatsApp e e-mail) com preview.
 */
import { NextResponse } from 'next/server';
import {
  NOTIFICATION_EVENT_LABELS,
  WHATSAPP_TEMPLATES,
  EMAIL_SUBJECTS,
  TEMPLATE_SAMPLE_VARIABLES,
  renderWhatsAppBody,
  renderEmailSubject,
  type NotificationEventType,
} from '@/lib/notification-templates';

const EVENT_TYPES: NotificationEventType[] = [
  'BILL_DUE',
  'BILL_OVERDUE',
  'RECEIVABLE_DUE',
  'RECEIVABLE_RECEIVED',
  'EXPENSE_REGISTERED',
  'BUDGET_ALERT',
  'BURN_RATE',
  'LOW_BALANCE',
  'WEEKLY_SUMMARY',
  'MONTHLY_SUMMARY',
  'AI_TIP',
  'TESTE',
];

export async function GET() {
  const templates = EVENT_TYPES.map((type) => {
    const vars = WHATSAPP_TEMPLATES[type]?.vars ?? [];
    const sampleVars: Record<string, string> = {};
    for (const v of vars) {
      sampleVars[v] = TEMPLATE_SAMPLE_VARIABLES[v] ?? `{{${v}}}`;
    }
    return {
      type,
      label: NOTIFICATION_EVENT_LABELS[type],
      whatsapp: {
        bodyTemplate: WHATSAPP_TEMPLATES[type]?.body ?? '',
        bodyPreview: renderWhatsAppBody(type, sampleVars),
        vars,
      },
      email: {
        subjectTemplate: EMAIL_SUBJECTS[type] ?? '',
        subjectPreview: renderEmailSubject(type, sampleVars),
      },
    };
  });

  return NextResponse.json({ templates });
}
