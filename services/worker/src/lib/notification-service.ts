/**
 * Serviço de notificações: persiste na base (Notification), enfileira WhatsApp/Email
 * conforme preferências do usuário.
 */

import { PrismaClient } from '@prisma/client';
import type { NotificationChannel, NotificationType } from '@prisma/client';
import type { Queue } from 'bullmq';
import type { NotificationEventType } from './notification-templates';

const prisma = new PrismaClient();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://app.nebula.finance';

export type NotifyOptions = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
  /** Variáveis para template (descricao, valor, vencimento, link, etc.) */
  variables?: Record<string, string>;
  /** Se true, enfileira WhatsApp/Email conforme preferências; senão só IN_APP */
  sendChannels?: boolean;
};

export type QueueWhatsApp = Queue<{ to: string; template: string; variables: Record<string, string>; tenantId?: string }>;
export type QueueEmail = Queue<{ to: string; subject: string; html: string; userId?: string }>;

export async function notify(
  options: NotifyOptions,
  queues: { whatsapp: QueueWhatsApp; email: QueueEmail }
): Promise<string | null> {
  const { userId, type, title, body, metadata, variables = {}, sendChannels = true } = options;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body: body ?? null,
      channel: 'IN_APP',
      metadata: metadata ?? undefined,
    },
  });

  if (!sendChannels) return notification.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreferences: true },
  });
  if (!user) return notification.id;

  const link = `${APP_URL}/app/notificacoes`;
  const vars = { ...variables, link };

  for (const pref of user.notificationPreferences) {
    if (!pref.enabled) continue;
    const eventTypes = (pref.eventTypes as string[]) ?? [];
    if (!eventTypes.includes(type)) continue;

    if (pref.channel === 'WHATSAPP' && user.phone) {
      const template = mapTypeToTemplate(type);
      if (template) {
        await queues.whatsapp.add(
          `notif-${notification.id}`,
          {
            to: user.phone,
            template,
            variables: vars as Record<string, string>,
            tenantId: user.tenantId,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
        );
      }
    }
    if (pref.channel === 'EMAIL') {
      const subject = getEmailSubject(type, vars);
      const html = getEmailHtml(type, title, body ?? '', vars);
      await queues.email.add(
        `notif-email-${notification.id}`,
        { to: user.email, subject, html, userId },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
      );
    }
  }

  return notification.id;
}

function mapTypeToTemplate(type: NotificationType): string | null {
  const map: Partial<Record<NotificationType, string>> = {
    BILL_DUE: 'BILL_DUE',
    BILL_OVERDUE: 'BILL_OVERDUE',
    RECEIVABLE_DUE: 'RECEIVABLE_DUE',
    RECEIVABLE_RECEIVED: 'RECEIVABLE_RECEIVED',
    EXPENSE_REGISTERED: 'EXPENSE_REGISTERED',
    WEEKLY_SUMMARY: 'WEEKLY_SUMMARY',
    MONTHLY_SUMMARY: 'MONTHLY_SUMMARY',
  };
  return map[type] ?? null;
}

function getEmailSubject(type: NotificationType, vars: Record<string, string>): string {
  const desc = vars.descricao ?? '';
  const subs: Partial<Record<NotificationType, string>> = {
    BILL_DUE: `Conta a pagar em breve - ${desc}`,
    BILL_OVERDUE: `Conta vencida - ${desc}`,
    RECEIVABLE_DUE: `Conta a receber - ${desc}`,
    RECEIVABLE_RECEIVED: `Recebimento confirmado - ${desc}`,
    EXPENSE_REGISTERED: `Despesa registrada - ${desc}`,
    WEEKLY_SUMMARY: 'Resumo financeiro semanal',
    MONTHLY_SUMMARY: 'Resumo financeiro mensal',
  };
  return subs[type] ?? 'Notificação Nebula Finance';
}

function getEmailHtml(
  type: NotificationType,
  title: string,
  body: string,
  vars: Record<string, string>
): string {
  const link = vars.link ?? APP_URL;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: system-ui, sans-serif; background: #0a0a0f; color: #e4e4e7; padding: 24px; }
  .card { background: rgba(20,20,28,0.8); border: 1px solid rgba(124,58,237,0.3); border-radius: 12px; padding: 24px; max-width: 480px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
  .muted { color: #71717a; font-size: 12px; margin-top: 24px; }
</style></head>
<body>
  <div class="card">
    <h2 style="margin:0 0 8px 0;">${escapeHtml(title)}</h2>
    ${body ? `<p style="margin:0; color:#a1a1aa;">${escapeHtml(body)}</p>` : ''}
    ${vars.valor ? `<p><strong>Valor:</strong> ${escapeHtml(vars.valor)}</p>` : ''}
    ${vars.vencimento ? `<p><strong>Vencimento:</strong> ${escapeHtml(vars.vencimento)}</p>` : ''}
    <a href="${link}" class="btn">Ver no app</a>
  </div>
  <p class="muted">Nebula Finance - Notificação automática</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function getUsersToNotify(
  channel: NotificationChannel,
  eventType: NotificationEventType
): Promise<Array<{ userId: string; email: string; phone: string | null }>> {
  const prefs = await prisma.notificationPreference.findMany({
    where: { channel, enabled: true },
    include: { user: { select: { id: true, email: true, phone: true } } },
  });
  const out: Array<{ userId: string; email: string; phone: string | null }> = [];
  for (const p of prefs) {
    const types = (p.eventTypes as string[]) ?? [];
    if (types.includes(eventType))
      out.push({
        userId: p.user.id,
        email: p.user.email,
        phone: p.user.phone,
      });
  }
  return out;
}