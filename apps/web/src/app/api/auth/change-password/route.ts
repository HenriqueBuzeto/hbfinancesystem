/**
 * POST /api/auth/change-password
 * Altera a senha do usuário autenticado.
 * Body: { currentPassword, newPassword }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, passwordHash: true },
    });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Conta não permite alteração de senha' }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[api/auth/change-password]', e);
    return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 });
  }
}
