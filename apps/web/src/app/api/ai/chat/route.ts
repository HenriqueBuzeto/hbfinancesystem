import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { assertFeatureAccess } from '@/lib/plans/assertPlan';

const SYSTEM_PROMPT = `Você é o Assistente Financeiro do HB Finance, um especialista em finanças pessoais e investimentos.
Responda sempre em português, de forma clara e objetiva.
Foque em: orçamento, economia, reserva de emergência, investimentos (renda fixa, variável), dívidas, metas financeiras.
Se o usuário perguntar algo fora do escopo financeiro, redirecione gentilmente para temas financeiros.
Mantenha respostas úteis e em tamanho adequado (parágrafos curtos quando possível).`;

export async function POST(request: NextRequest) {
  const access = await assertFeatureAccess(request, 'aiAssistant');
  if (!access.ok) return access.response;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY não configurada',
        hint: 'Adicione OPENAI_API_KEY em services/api/.env e reinicie o servidor (npm run dev). O Next.js já carrega esse arquivo. Guia: /app/assistente-ia.',
      },
      { status: 503 }
    );
  }

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Campo message é obrigatório' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const rawMessage = data?.error?.message || 'Erro ao chamar OpenAI';

    if (!res.ok) {
      const isQuotaOrBilling = /quota|billing|exceeded|rate limit|insufficient_quota/i.test(rawMessage);
      const error = isQuotaOrBilling
        ? 'Limite de uso da API de IA foi atingido. O administrador precisa verificar a conta OpenAI (plano e cobrança).'
        : rawMessage;
      const hint = isQuotaOrBilling
        ? 'Em platform.openai.com acesse Usage e Billing: adicione um método de pagamento ou aguarde a renovação do período.'
        : undefined;
      return NextResponse.json(
        { error, hint, ...(hint ? {} : { details: data }) },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const content = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ reply: content });
  } catch (err) {
    console.error('[AI chat]', err);
    return NextResponse.json(
      { error: 'Falha ao comunicar com o assistente. Tente novamente.' },
      { status: 502 }
    );
  }
}
