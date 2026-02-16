/**
 * GET /api/calendar/events?month=YYYY-MM
 * Retorna eventos do calendário (contas a pagar/receber) para o mês.
 * Inclui contas com vencimento no mês e contas recorrentes (mensal) no dia fixo.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;
  if (!tenantId) {
    return NextResponse.json({ events: [] }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month') ?? '';
  const match = monthParam.match(/^(\d{4})-(\d{2})$/);
  const year = match ? parseInt(match[1], 10) : new Date().getFullYear();
  const month = match ? parseInt(match[2], 10) : new Date().getMonth() + 1;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  try {
    const bills = await prisma.bill.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'OVERDUE'] },
        OR: [
          { dueDate: { gte: start, lte: end } },
          {
            recurrence: 'MONTHLY',
            dueDate: { lte: end },
          },
        ],
      },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });

    const events: Array<{
      id: string;
      billId: string;
      title: string;
      amount: number;
      type: string;
      date: string;
      day: number;
      isRecurring: boolean;
      status: string;
      categoryName: string | null;
    }> = [];

    for (const b of bills) {
      const amount = Number(b.amount);
      const categoryName = (b as { category?: { name: string } | null }).category?.name ?? null;

      if (b.recurrence === 'MONTHLY') {
        const dayOfMonth = b.dueDate.getDate();
        const eventDate = new Date(year, month - 1, Math.min(dayOfMonth, new Date(year, month, 0).getDate()));
        if (eventDate >= start && eventDate <= end) {
          events.push({
            id: `rec-${b.id}-${eventDate.toISOString().slice(0, 10)}`,
            billId: b.id,
            title: b.description,
            amount,
            type: b.type,
            date: eventDate.toISOString().slice(0, 10),
            day: eventDate.getDate(),
            isRecurring: true,
            status: b.status,
            categoryName,
          });
        }
      } else {
        const d = new Date(b.dueDate);
        if (d >= start && d <= end) {
          events.push({
            id: b.id,
            billId: b.id,
            title: b.description,
            amount,
            type: b.type,
            date: b.dueDate.toISOString().slice(0, 10),
            day: d.getDate(),
            isRecurring: false,
            status: b.status,
            categoryName,
          });
        }
      }
    }

    events.sort((a, b) => a.day - b.day || a.date.localeCompare(b.date));

    return NextResponse.json({ events, year, month });
  } catch (e) {
    console.error('[api/calendar/events]', e);
    return NextResponse.json({ error: 'Erro ao carregar eventos' }, { status: 500 });
  }
}
