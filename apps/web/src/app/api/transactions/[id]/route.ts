/**
 * GET /api/transactions/[id] - Uma transação.
 * PATCH /api/transactions/[id] - Atualiza (parcial).
 * DELETE /api/transactions/[id] - Remove (requer permissão).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

const UpdateTransactionSchema = z.object({
  categoryId: z.string().optional().nullable(),
  amount: z.number().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  isReconciled: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(request);
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const transaction = await prisma.transaction.findFirst({
    where: { id, tenantId: payload.tenantId },
    include: { account: true, category: true },
  });
  if (!transaction) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });

  return NextResponse.json({
    ...transaction,
    amount: Number(transaction.amount),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(request);
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.transaction.findFirst({
    where: { id, tenantId: payload.tenantId },
  });
  if (!existing) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = UpdateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data as Record<string, unknown>;
    if (data.date) data.date = new Date(data.date as string);

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: { account: true, category: true },
    });
    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    });
  } catch (e) {
    console.error('[api/transactions PATCH]', e);
    return NextResponse.json({ error: 'Erro ao atualizar transação' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(request);
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Sem permissão para deletar transação' }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.transaction.findFirst({
    where: { id, tenantId: payload.tenantId },
  });
  if (!existing) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });

  try {
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[api/transactions DELETE]', e);
    return NextResponse.json({ error: 'Erro ao deletar transação' }, { status: 500 });
  }
}
