/**
 * GET /api/notifications - Lista notificações do usuário (JWT).
 * Query: limit, offset, unreadOnly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: { userId: string; readAt?: null } = {
      userId: payload.sub,
    };
    if (unreadOnly) where.readAt = null;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      data: data.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        channel: n.channel,
        readAt: n.readAt?.toISOString() ?? null,
        metadata: n.metadata,
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (e) {
    console.error('[api/notifications GET]', e);
    return NextResponse.json({ error: 'Erro ao listar notificações' }, { status: 500 });
  }
}
