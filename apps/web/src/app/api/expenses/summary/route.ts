/**
 * GET /api/expenses/summary
 * Resumo de despesas do tenant: total do mês, por categoria (com orçamento se houver), evolução mensal.
 * Query: month=YYYY-MM (opcional; padrão: mês atual).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

function startOfMonth(y: number, m: number) {
  return new Date(y, m - 1, 1, 0, 0, 0, 0);
}
function endOfMonth(y: number, m: number) {
  return new Date(y, m, 0, 23, 59, 59, 999);
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;
  if (!tenantId) {
    return NextResponse.json(
      { total: 0, byCategory: [], monthlyEvolution: [], overBudget: [] },
      { status: 200 }
    );
  }

  try {
    const now = new Date();
    const monthParam = request.nextUrl.searchParams.get('month');
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      if (m >= 1 && m <= 12) {
        year = y;
        month = m;
      }
    }

    const start = startOfMonth(year, month);
    const end = endOfMonth(year, month);
    const periodStr = `${year}-${String(month).padStart(2, '0')}`;

    const [expenses, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          tenantId,
          type: 'EXPENSE',
          date: { gte: start, lte: end },
        },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { tenantId, period: periodStr },
        include: { category: true },
      }),
    ]);

    const categorySums = new Map<string, { id: string; name: string; amount: number; budget?: number }>();
    for (const t of expenses) {
      const name = t.category?.name ?? 'Sem categoria';
      const id = t.categoryId ?? `uncat-${name}`;
      const amt = Number(t.amount);
      if (!categorySums.has(id)) {
        categorySums.set(id, { id, name, amount: 0, budget: undefined });
      }
      categorySums.get(id)!.amount += amt;
    }
    for (const b of budgets) {
      const id = b.categoryId;
      const amount = categorySums.get(id)?.amount ?? 0;
      if (!categorySums.has(id)) {
        categorySums.set(id, { id, name: b.category.name, amount: 0, budget: Number(b.amount) });
      } else {
        categorySums.get(id)!.budget = Number(b.amount);
      }
    }

    const byCategory = Array.from(categorySums.values()).sort((a, b) => b.amount - a.amount);
    const total = byCategory.reduce((s, c) => s + c.amount, 0);
    const overBudget = byCategory.filter((c) => c.budget != null && c.amount > c.budget);

    const evolutionStart = new Date(year, month - 1, 1);
    evolutionStart.setMonth(evolutionStart.getMonth() - 5);
    const evolutionEnd = end;

    const evolutionTx = await prisma.transaction.findMany({
      where: {
        tenantId,
        type: 'EXPENSE',
        date: { gte: evolutionStart, lte: evolutionEnd },
      },
      select: { date: true, amount: true },
    });

    const evolutionMap = new Map<string, number>();
    for (const t of evolutionTx) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      evolutionMap.set(key, (evolutionMap.get(key) ?? 0) + Number(t.amount));
    }
    const monthlyEvolution: { month: string; valor: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = MONTH_NAMES[d.getMonth()];
      monthlyEvolution.push({ month: label, valor: evolutionMap.get(key) ?? 0 });
    }

    return NextResponse.json({
      total,
      byCategory,
      monthlyEvolution,
      overBudget,
      period: periodStr,
      periodLabel: MONTH_NAMES[month - 1],
    });
  } catch (e) {
    console.error('[api/expenses/summary]', e);
    return NextResponse.json({ error: 'Erro ao carregar despesas' }, { status: 500 });
  }
}
