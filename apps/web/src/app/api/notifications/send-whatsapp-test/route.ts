/**
 * POST /api/notifications/send-whatsapp-test
 * Envia mensagem de teste para o WhatsApp do usuário (Twilio SDK).
 *
 * Variáveis obrigatórias: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
 * Opcional (template): TWILIO_CONTENT_SID, TWILIO_CONTENT_VARIABLES (JSON com variáveis do template)
 */
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { renderWhatsAppBody } from '@/lib/notification-templates';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = (process.env.TWILIO_WHATSAPP_NUMBER ?? '').replace(/\s/g, '');
  const contentSid = process.env.TWILIO_CONTENT_SID;
  const contentVariablesStr = process.env.TWILIO_CONTENT_VARIABLES;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json(
      {
        error: 'WhatsApp não configurado',
        hint: 'Adicione TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_NUMBER no .env. Reinicie o servidor.',
      },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { phone: true, name: true },
  });

  if (!user?.phone?.trim()) {
    return NextResponse.json(
      { error: 'Nenhum telefone cadastrado. Atualize seu perfil em Configurações com o número no formato +55 11 99999-9999.' },
      { status: 400 }
    );
  }

  const to = normalizePhone(user.phone);
  const fromWhatsApp = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`;
  const toWhatsApp = to.startsWith('+') ? to : `+${to}`;

  try {
    const client = twilio(accountSid, authToken);

    const payloadCreate: {
      from: string;
      to: string;
      body?: string;
      contentSid?: string;
      contentVariables?: string;
    } = {
      from: `whatsapp:${fromWhatsApp}`,
      to: `whatsapp:${toWhatsApp}`,
    };

    if (contentSid && contentVariablesStr) {
      payloadCreate.contentSid = contentSid;
      payloadCreate.contentVariables = contentVariablesStr;
    } else {
      payloadCreate.body = renderWhatsAppBody('TESTE', {
        nome: user.name?.trim() || 'Usuário',
      });
    }

    const message = await client.messages.create(payloadCreate);

    return NextResponse.json({
      success: true,
      message: 'Mensagem de teste enviada para seu WhatsApp.',
      sid: message.sid,
    });
  } catch (e) {
    console.error('[send-whatsapp-test]', e);
    const err = e as { message?: string; code?: number };
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao comunicar com Twilio. Tente novamente.' },
      { status: 502 }
    );
  }
}
