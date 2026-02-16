/**
 * GET /api/bills - Lista contas a pagar/receber do tenant (JWT opcional para demo).
 * POST /api/bills - Cria conta a pagar ou a receber.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import type { BillType, BillStatus } from '@prisma/client';

const CreateBillSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Data inválida (YYYY-MM-DD)'),
  type: z.enum(['PAYABLE', 'RECEIVABLE']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional().default('PENDING'),
  recurrence: z.enum(['NONE', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  totalInstallments: z.number().int().positive().optional().nullable(),
  currentInstallment: z.number().int().positive().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;

  if (!tenantId) {
    return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as BillType | null;
    const status = searchParams.get('status') as BillStatus | null;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where: { tenantId: string; type?: BillType; status?: BillStatus; dueDate?: { gte?: Date; lte?: Date } } = {
      tenantId,
    };
    if (type) where.type = type;
    if (status) where.status = status;
    if (from || to) {
      where.dueDate = {};
      if (from) where.dueDate.gte = new Date(from);
      if (to) where.dueDate.lte = new Date(to);
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: { category: true },
        orderBy: { dueDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.bill.count({ where }),
    ]);

    const data = bills.map((b) => ({
      id: b.id,
      description: b.description,
      amount: Number(b.amount),
      dueDate: b.dueDate.toISOString(),
      type: b.type,
      status: b.status,
      recurrence: b.recurrence,
      categoryId: b.categoryId,
      categoryName: (b as { category?: { name: string } | null }).category?.name ?? null,
      totalInstallments: b.totalInstallments,
      currentInstallment: b.currentInstallment,
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ data, total, limit, offset });
  } catch (e) {
    console.error('[api/bills GET]', e);
    return NextResponse.json({ error: 'Erro ao listar contas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;

  if (!tenantId) {
    return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateBillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { description, amount, dueDate, type, status, recurrence, categoryId, totalInstallments, currentInstallment } =
      parsed.data;

    if (categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: categoryId, tenantId },
      });
      if (!cat) {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
      }
    }

    const bill = await prisma.bill.create({
      data: {
        tenantId,
        description,
        amount,
        dueDate: new Date(dueDate),
        type,
        status: status ?? 'PENDING',
        recurrence: recurrence === 'NONE' || !recurrence ? null : recurrence,
        categoryId: categoryId ?? undefined,
        totalInstallments: totalInstallments ?? undefined,
        currentInstallment: currentInstallment ?? undefined,
      },
      include: { category: true },
    });

    return NextResponse.json({
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
    });
  } catch (e) {
    console.error('[api/bills POST]', e);
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
}
