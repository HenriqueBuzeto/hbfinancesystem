/**
 * Provedor de e-mail via Resend (https://resend.com).
 * Variáveis: RESEND_API_KEY, EMAIL_FROM (ex: "HB Finance <notificacoes@seu-dominio.com>").
 */

import type { EmailProvider } from '../processors/email';

export class ResendProvider implements EmailProvider {
  constructor(
    private apiKey: string,
    private from: string
  ) {}

  async send(to: string, subject: string, html: string): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: this.from,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API error ${res.status}: ${err}`);
    }
  }
}
