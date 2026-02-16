/**
 * POST /api/auth/refresh
 * Renova access token usando refresh token (body ou cookie).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt';

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = RefreshSchema.safeParse(body);
    const refreshToken =
      parsed.success ? parsed.data.refreshToken : request.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token ausente' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'Refresh token inválido ou expirado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });

    return NextResponse.json({
      accessToken,
      expiresIn: 900,
    });
  } catch (e) {
    console.error('[api/auth/refresh]', e);
    return NextResponse.json({ error: 'Erro ao renovar token' }, { status: 500 });
  }
}
