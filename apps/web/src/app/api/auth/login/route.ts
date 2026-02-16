/**
 * POST /api/auth/login
 * Autenticação: email + senha → accessToken + refreshToken.
 * Validação com Zod; bcrypt no services/api (seed). Aqui usamos comparação simples para demo.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import * as bcrypt from 'bcryptjs';

const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        passwordHash: true,
        tenant: { select: { id: true, name: true, slug: true, currentPlan: true } },
      },
    });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    return NextResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 min em segundos
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (e) {
    console.error('[api/auth/login]', e);
    const msg = e instanceof Error ? e.message : String(e);
    const isDb = /prisma|connect|ECONNREFUSED|DATABASE|P1001|P1002|connection/i.test(msg);
    const isJwt = /JWT|secret|sign/i.test(msg);
    const devHint =
      process.env.NODE_ENV === 'development'
        ? isDb
          ? ` Verifique DATABASE_URL em apps/web/.env ou services/api/.env e conectividade com o banco. (${msg})`
          : isJwt
            ? ' Verifique JWT_SECRET e JWT_REFRESH_SECRET em apps/web/.env.'
            : ` (${msg})`
        : '';
    return NextResponse.json(
      { error: `Erro ao autenticar.${devHint}`.trim() },
      { status: 500 }
    );
  }
}
