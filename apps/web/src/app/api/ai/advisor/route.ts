import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * System Prompt fixo para o AI Finance Advisor.
 * Dados anonimizados são injetados no payload para a LLM.
 */
const AI_ADVISOR_SYSTEM_PROMPT = `Você é um Assessor Financeiro Virtual especializado em educação financeira e análises preditivas.
Receberá dados anonimizados das transações do usuário em JSON.
Forneça:
1) Resumo em 2 frases sobre a situação financeira atual.
2) Três recomendações práticas com números e prazo definido.
3) Projeção simples mostrando como "guardar R$ X por Y meses" impacta saldo/objetivo.
4) Alertas de risco se burn rate > threshold (gastos superando receitas).
Sempre inclua explicação didática e disclaimers: isto não é consultoria profissional nem recomendação de investimento.
Responda em JSON com: summary (string), recommendations (array de { title, description, deadline }), projection (string), riskAlerts (array de string), confidence ("baixa"|"média"|"alta").`;

const AdvisorRequestSchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  anonymizedTransactions: z.array(
    z.object({
      date: z.string(),
      amount: z.number(),
      type: z.enum(['income', 'expense', 'transfer']),
      category: z.string().optional(),
    })
  ),
  balances: z.array(
    z.object({
      accountId: z.string(),
      balance: z.number(),
      currency: z.string().default('BRL'),
    })
  ),
  income: z.number().optional(),
  goals: z
    .array(
      z.object({
        name: z.string(),
        target: z.number(),
        current: z.number().optional(),
      })
    )
    .optional(),
});

export type AdvisorRequest = z.infer<typeof AdvisorRequestSchema>;

export type AdvisorResponse = {
  summary: string;
  recommendations: Array<{ title: string; description: string; deadline?: string }>;
  projection: string;
  riskAlerts: string[];
  confidence: 'baixa' | 'média' | 'alta';
  disclaimer: string;
};

/**
 * POST /api/ai/advisor
 * Recebe dados anonimizados e retorna análise do AI Advisor.
 * Em produção: chama OpenAI/alternativa com system prompt + user message (JSON).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AdvisorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { anonymizedTransactions, balances, income, goals } = parsed.data;

    // Em produção: chamar OpenAI com AI_ADVISOR_SYSTEM_PROMPT e
    // user message = JSON.stringify({ anonymizedTransactions, balances, income, goals })
    // e parsear a resposta para AdvisorResponse.
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      // Exemplo de integração real (descomentar e ajustar):
      // const completion = await openai.chat.completions.create({
      //   model: 'gpt-4o-mini',
      //   messages: [
      //     { role: 'system', content: AI_ADVISOR_SYSTEM_PROMPT },
      //     { role: 'user', content: JSON.stringify({ anonymizedTransactions, balances, income, goals }) },
      //   ],
      //   response_format: { type: 'json_object' },
      // });
      // const response: AdvisorResponse = JSON.parse(completion.choices[0].message.content ?? '{}');
      // return NextResponse.json(response);
    }

    // Resposta mock quando OPENAI_API_KEY não está definido (dev/demo)
    const totalExpense = anonymizedTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const totalIncome =
      income ??
      anonymizedTransactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
    const totalBalance = balances.reduce((s, b) => s + b.balance, 0);
    const burnRisk = totalIncome > 0 && totalExpense > totalIncome;

    const mockResponse: AdvisorResponse = {
      summary:
        'Com base nos dados anonimizados, seu saldo atual está positivo. Recomendamos manter uma reserva de emergência e automatizar poupança.',
      recommendations: [
        {
          title: 'Reserva de emergência',
          description: 'Separe R$ 500/mês por 6 meses para formar 3 meses de despesas.',
          deadline: '6 meses',
        },
        {
          title: 'Revisar assinaturas',
          description: 'Revise gastos recorrentes e cancele o que não usa.',
          deadline: '1 mês',
        },
        {
          title: 'Metas de curto prazo',
          description: 'Defina uma meta (ex.: R$ 2.000) e acompanhe no painel.',
          deadline: '3 meses',
        },
      ],
      projection:
        'Guardar R$ 500 por 12 meses gera R$ 6.000 + rendimento. Em 3 anos, com taxa ~0,5% a.m., pode chegar a ~R$ 19.500 (exemplo ilustrativo).',
      riskAlerts: burnRisk
        ? ['Gastos no período superam receitas. Atenção ao burn rate.']
        : [],
      confidence: 'média',
      disclaimer:
        'Este conteúdo é apenas informativo e não constitui consultoria financeira, fiscal ou de investimentos.',
    };

    return NextResponse.json(mockResponse);
  } catch (e) {
    console.error('[api/ai/advisor]', e);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação do advisor' },
      { status: 500 }
    );
  }
}
