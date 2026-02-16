/**
 * GET /api/transactions - Lista transações do tenant (JWT obrigatório).
 * POST /api/transactions - Cria transação (JWT obrigatório).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

const CreateTransactionSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  amount: z.number(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  description: z.string().optional().nullable(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const from = searchParams.get('from'); // YYYY-MM-DD
    const to = searchParams.get('to');

    const where: { tenantId: string; date?: { gte?: Date; lte?: Date } } = {
      tenantId: payload.tenantId,
    };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { account: true, category: true },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      total,
      limit,
      offset,
    });
  } catch (e) {
    console.error('[api/transactions GET]', e);
    return NextResponse.json({ error: 'Erro ao listar transações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { accountId, categoryId, amount, type, description, date } = parsed.data;

    const account = await prisma.account.findFirst({
      where: { id: accountId, tenantId: payload.tenantId },
    });
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const transaction = await prisma.transaction.create({
      data: {
        tenantId: payload.tenantId,
        accountId,
        categoryId: categoryId ?? undefined,
        amount,
        type,
        description: description ?? undefined,
        date: dateObj,
        createdBy: payload.sub,
      },
      include: { account: true, category: true },
    });

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    });
  } catch (e) {
    console.error('[api/transactions POST]', e);
    return NextResponse.json({ error: 'Erro ao criar transação' }, { status: 500 });
  }
}
