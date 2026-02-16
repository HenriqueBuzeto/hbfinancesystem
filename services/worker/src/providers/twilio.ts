/**
 * Provedor WhatsApp via Twilio.
 * Requer variáveis: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER.
 * Templates devem ser aprovados no Twilio (variáveis: nome, valor, vencimento, link).
 */

import type { WhatsAppProvider } from '../processors/whatsapp';

export class TwilioProvider implements WhatsAppProvider {
  constructor(
    private accountSid: string,
    private authToken: string,
    private fromNumber: string
  ) {}

  async send(to: string, body: string): Promise<void> {
    // Em produção: npm install twilio e usar:
    // const twilio = require('twilio')(this.accountSid, this.authToken);
    // await twilio.messages.create({
    //   from: `whatsapp:${this.fromNumber}`,
    //   to: `whatsapp:${to}`,
    //   body,
    // });
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${this.fromNumber}`,
          To: `whatsapp:${to}`,
          Body: body,
        }).toString(),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Twilio API error ${res.status}: ${err}`);
    }
  }
}
