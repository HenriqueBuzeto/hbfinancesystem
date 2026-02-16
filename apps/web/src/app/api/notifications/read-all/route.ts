/**
 * POST /api/notifications/read-all - Marcar todas como lidas.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    await prisma.notification.updateMany({
      where: { userId: payload.sub, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[api/notifications/read-all]', e);
    return NextResponse.json({ error: 'Erro ao marcar como lidas' }, { status: 500 });
  }
}
