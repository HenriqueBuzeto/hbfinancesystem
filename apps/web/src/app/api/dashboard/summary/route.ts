/**
 * GET /api/dashboard/summary
 * Retorna dados reais para o dashboard: saldo, receitas/despesas do mês,
 * comparativo, evolução (gráfico), despesas por categoria, últimas movimentações,
 * contas a pagar e a receber.
 * Query: period=day|month|year (para evolução do gráfico principal).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;

  if (!tenantId) {
    return NextResponse.json(
      {
        saldoAtual: 0,
        receitasMes: 0,
        despesasMes: 0,
        resultadoMes: 0,
        comparativoPercentual: 0,
        evolution: [],
        expensesByCategory: [],
        recentTransactions: [],
        billsPayable: [],
        billsReceivable: [],
      },
      { status: 200 }
    );
  }

  try {
    const now = new Date();
    const startCurrentMonth = startOfMonth(now);
    const endCurrentMonth = endOfMonth(now);
    const startPrevMonth = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
    const endPrevMonth = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));

    // Saldo atual: soma dos saldos das contas ativas
    const saldoResult = await prisma.account.aggregate({
      where: { tenantId, isActive: true },
      _sum: { balance: true },
    });
    const saldoAtual = Number(saldoResult._sum.balance ?? 0);

    // Receitas e despesas do mês atual (transações)
    const [receitasCurrent, despesasCurrent, receitasPrev, despesasPrev] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: 'INCOME',
          date: { gte: startCurrentMonth, lte: endCurrentMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: 'EXPENSE',
          date: { gte: startCurrentMonth, lte: endCurrentMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: 'INCOME',
          date: { gte: startPrevMonth, lte: endPrevMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: 'EXPENSE',
          date: { gte: startPrevMonth, lte: endPrevMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const receitasMes = Number(receitasCurrent._sum.amount ?? 0);
    const despesasMes = Number(despesasCurrent._sum.amount ?? 0);
    const resultadoMes = receitasMes - despesasMes;
    const resultadoPrev =
      Number(receitasPrev._sum.amount ?? 0) - Number(despesasPrev._sum.amount ?? 0);

    let comparativoPercentual = 0;
    if (resultadoPrev !== 0) {
      comparativoPercentual = ((resultadoMes - resultadoPrev) / Math.abs(resultadoPrev)) * 100;
    } else if (resultadoMes !== 0) {
      comparativoPercentual = 100;
    }

    // Evolução: últimos 12 meses ou 30 dias conforme period
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') ?? 'month') as 'day' | 'month' | 'year';

    const evolutionStart =
      period === 'day'
        ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        : period === 'year'
          ? new Date(now.getFullYear() - 1, now.getMonth(), 1)
          : new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const transactionsForEvolution = await prisma.transaction.findMany({
      where: {
        tenantId,
        date: { gte: evolutionStart, lte: endCurrentMonth },
      },
      select: { date: true, type: true, amount: true },
    });

    const evolutionMap = new Map<
      string,
      { receitas: number; despesas: number; saldo: number; label: string }
    >();

    for (const t of transactionsForEvolution) {
      const d = new Date(t.date);
      const key =
        period === 'day'
          ? d.toISOString().slice(0, 10)
          : period === 'year'
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const amt = Number(t.amount);
      if (!evolutionMap.has(key)) {
        evolutionMap.set(key, { receitas: 0, despesas: 0, saldo: 0, label: key });
      }
      const row = evolutionMap.get(key)!;
      if (t.type === 'INCOME') {
        row.receitas += amt;
        row.saldo += amt;
      } else if (t.type === 'EXPENSE') {
        row.despesas += amt;
        row.saldo -= amt;
      }
    }

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const evolution = Array.from(evolutionMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => {
        const label =
          period === 'day'
            ? new Date(key).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : period === 'year'
              ? monthNames[parseInt(key.slice(5, 7), 10) - 1] + ' ' + key.slice(0, 4)
              : monthNames[parseInt(key.slice(5, 7), 10) - 1];
        return { ...v, label, period: key };
      });

    // Despesas por categoria (transações EXPENSE do mês atual)
    const expensesTransactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        type: 'EXPENSE',
        date: { gte: startCurrentMonth, lte: endCurrentMonth },
      },
      include: { category: true },
    });

    const categorySums = new Map<string, { name: string; valor: number }>();
    for (const t of expensesTransactions) {
      const name = t.category?.name ?? 'Sem categoria';
      const amt = Number(t.amount);
      if (!categorySums.has(name)) categorySums.set(name, { name, valor: 0 });
      categorySums.get(name)!.valor += amt;
    }
    const expensesByCategory = Array.from(categorySums.values()).sort((a, b) => b.valor - a.valor);

    // Últimas movimentações (transações)
    const recentTransactions = await prisma.transaction.findMany({
      where: { tenantId },
      include: { account: true, category: true },
      orderBy: { date: 'desc' },
      take: 15,
    });

    // Contas a pagar (pendentes ou vencidas) e a receber
    const [billsPayable, billsReceivable] = await Promise.all([
      prisma.bill.findMany({
        where: { tenantId, type: 'PAYABLE', status: { in: ['PENDING', 'OVERDUE'] } },
        include: { category: true },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
      prisma.bill.findMany({
        where: { tenantId, type: 'RECEIVABLE', status: 'PENDING' },
        include: { category: true },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      saldoAtual,
      receitasMes,
      despesasMes,
      resultadoMes,
      comparativoPercentual,
      evolution,
      expensesByCategory,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        description: t.description ?? t.category?.name ?? 'Movimentação',
        amount: Number(t.amount),
        type: t.type,
        date: t.date.toISOString(),
        categoryName: t.category?.name ?? null,
        accountName: t.account.name,
      })),
      billsPayable: billsPayable.map((b) => ({
        id: b.id,
        description: b.description,
        amount: Number(b.amount),
        dueDate: b.dueDate.toISOString(),
        status: b.status,
        categoryName: b.category?.name ?? null,
      })),
      billsReceivable: billsReceivable.map((b) => ({
        id: b.id,
        description: b.description,
        amount: Number(b.amount),
        dueDate: b.dueDate.toISOString(),
        status: b.status,
        categoryName: b.category?.name ?? null,
      })),
    });
  } catch (e) {
    console.error('[api/dashboard/summary]', e);
    return NextResponse.json({ error: 'Erro ao carregar resumo' }, { status: 500 });
  }
}
