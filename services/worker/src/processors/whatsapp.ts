import type { Job } from 'bullmq';
import type { WhatsAppJobPayload } from '../index';
import {
  renderWhatsAppBody,
  type NotificationEventType,
} from '../lib/notification-templates';

/**
 * Abstração do provedor de WhatsApp.
 * Trocar implementação: Twilio (produção) vs console.log (dev).
 */
export interface WhatsAppProvider {
  send(to: string, body: string): Promise<void>;
}

const devProvider: WhatsAppProvider = {
  async send(to, body) {
    console.log('[WhatsApp DEV] Simulated send:', {
      to,
      body: body.slice(0, 120) + (body.length > 120 ? '...' : ''),
      at: new Date().toISOString(),
    });
  },
};

const EVENT_TYPES: NotificationEventType[] = [
  'BILL_DUE',
  'BILL_OVERDUE',
  'RECEIVABLE_DUE',
  'RECEIVABLE_RECEIVED',
  'EXPENSE_REGISTERED',
  'WEEKLY_SUMMARY',
  'MONTHLY_SUMMARY',
];

export async function whatsappProcessor(job: Job<WhatsAppJobPayload>): Promise<void> {
  const { to, template, variables } = job.data;
  const provider: WhatsAppProvider = process.env.TWILIO_ACCOUNT_SID
    ? await getTwilioProvider()
    : devProvider;

  const body = EVENT_TYPES.includes(template as NotificationEventType)
    ? renderWhatsAppBody(template as NotificationEventType, variables)
    : (variables.body ?? Object.entries(variables).map(([k, v]) => `${k}: ${v}`).join('\n'));

  await provider.send(to, body);
}

async function getTwilioProvider(): Promise<WhatsAppProvider> {
  const { TwilioProvider } = await import('../providers/twilio.js');
  return new TwilioProvider(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
    process.env.TWILIO_WHATSAPP_NUMBER!
  );
}
