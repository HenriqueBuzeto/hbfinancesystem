import type { Job } from 'bullmq';

export type EmailJobPayload = {
  to: string;
  subject: string;
  html: string;
  userId?: string;
};

export interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<void>;
}

const devProvider: EmailProvider = {
  async send(to, subject, html) {
    console.log('[Email DEV] Simulated send:', {
      to,
      subject,
      htmlLength: html.length,
      at: new Date().toISOString(),
    });
  },
};

export async function emailProcessor(job: Job<EmailJobPayload>): Promise<void> {
  const { to, subject, html } = job.data;
  const provider: EmailProvider = process.env.RESEND_API_KEY
    ? await getResendProvider()
    : devProvider;
  await provider.send(to, subject, html);
}

async function getResendProvider(): Promise<EmailProvider> {
  const { ResendProvider } = await import('../providers/resend.js');
  return new ResendProvider(
    process.env.RESEND_API_KEY!,
    process.env.EMAIL_FROM ?? 'HB Finance <notificacoes@hbfinance.com.br>'
  );
}
