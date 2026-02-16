/**
 * PATCH /api/notifications/[id] - Marcar como lida.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const n = await prisma.notification.findFirst({
      where: { id, userId: payload.sub },
    });
    if (!n) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }
    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return NextResponse.json({
      id: updated.id,
      readAt: updated.readAt?.toISOString(),
    });
  } catch (e) {
    console.error('[api/notifications PATCH]', e);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}
