/**
 * GET /api/bills/[id] - Obtém uma conta a pagar/receber.
 * PATCH /api/bills/[id] - Atualiza.
 * DELETE /api/bills/[id] - Remove.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

const UpdateBillSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  recurrence: z.enum(['NONE', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  totalInstallments: z.number().int().positive().optional().nullable(),
  currentInstallment: z.number().int().positive().optional().nullable(),
});

function toResponse(bill: { id: string; description: string; amount: unknown; dueDate: Date; type: string; status: string; recurrence: string | null; categoryId: string | null; category: { name: string } | null; totalInstallments: number | null; currentInstallment: number | null; createdAt: Date }) {
  return {
    id: bill.id,
    description: bill.description,
    amount: Number(bill.amount),
    dueDate: bill.dueDate.toISOString(),
    type: bill.type,
    status: bill.status,
    recurrence: bill.recurrence,
    categoryId: bill.categoryId,
    categoryName: bill.category?.name ?? null,
    totalInstallments: bill.totalInstallments,
    currentInstallment: bill.currentInstallment,
    createdAt: bill.createdAt.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;
  if (!tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const bill = await prisma.bill.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });
    if (!bill) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }
    return NextResponse.json(toResponse(bill));
  } catch (e) {
    console.error('[api/bills/[id] GET]', e);
    return NextResponse.json({ error: 'Erro ao buscar conta' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;
  if (!tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = UpdateBillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.bill.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (parsed.data.description != null) update.description = parsed.data.description;
    if (parsed.data.amount != null) update.amount = parsed.data.amount;
    if (parsed.data.dueDate != null) update.dueDate = new Date(parsed.data.dueDate);
    if (parsed.data.status != null) update.status = parsed.data.status;
    if (parsed.data.recurrence != null) update.recurrence = parsed.data.recurrence === 'NONE' ? null : parsed.data.recurrence;
    if (parsed.data.categoryId !== undefined) update.categoryId = parsed.data.categoryId;
    if (parsed.data.totalInstallments !== undefined) update.totalInstallments = parsed.data.totalInstallments;
    if (parsed.data.currentInstallment !== undefined) update.currentInstallment = parsed.data.currentInstallment;

    const bill = await prisma.bill.update({
      where: { id },
      data: update,
      include: { category: true },
    });
    return NextResponse.json(toResponse(bill));
  } catch (e) {
    console.error('[api/bills/[id] PATCH]', e);
    return NextResponse.json({ error: 'Erro ao atualizar conta' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(_request);
  const tenantId = payload?.tenantId ?? null;
  if (!tenantId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const existing = await prisma.bill.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }
    await prisma.bill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[api/bills/[id] DELETE]', e);
    return NextResponse.json({ error: 'Erro ao excluir conta' }, { status: 500 });
  }
}
