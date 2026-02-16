/**
 * GET /api/me - Retorna o perfil do usuário autenticado.
 * PATCH /api/me - Atualiza nome e telefone (e opcionalmente email).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120).optional(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('E-mail inválido').optional(),
  monthlyIncome: z.number().nonnegative().optional().nullable(),
  financialGoal: z.string().max(60).optional().nullable(),
  birthYear: z.number().int().min(1920).max(2010).optional().nullable(),
});

const BASE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  tenantId: true,
  tenant: { select: { name: true, slug: true, type: true, currentPlan: true } },
  createdAt: true,
} as const;

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    // Primeiro tenta com todos os campos (incluindo perfil); se falhar (colunas ausentes), usa só base
    let user: {
      id: string;
      email: string;
      name: string;
      phone: string | null;
      role: string;
      tenantId: string;
      tenant: { name: string; slug: string; type: string; currentPlan: string | null };
      createdAt: Date;
      monthlyIncome?: unknown;
      financialGoal?: string | null;
      birthYear?: number | null;
    } | null = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          ...BASE_USER_SELECT,
          monthlyIncome: true,
          financialGoal: true,
          birthYear: true,
        },
      });
    } catch {
      user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: BASE_USER_SELECT,
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      monthlyIncome: user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
      financialGoal: user.financialGoal ?? null,
      birthYear: user.birthYear ?? null,
      tenant: user.tenant,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (e) {
    console.error('[api/me GET]', e);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.name != null) data.name = parsed.data.name;
    if (parsed.data.phone !== undefined) data.phone = parsed.data.phone || null;
    if (parsed.data.monthlyIncome !== undefined) data.monthlyIncome = parsed.data.monthlyIncome;
    if (parsed.data.financialGoal !== undefined) data.financialGoal = parsed.data.financialGoal;
    if (parsed.data.birthYear !== undefined) data.birthYear = parsed.data.birthYear;
    if (parsed.data.email != null) {
      const existing = await prisma.user.findFirst({
        where: { email: parsed.data.email.trim().toLowerCase(), id: { not: payload.sub } },
      });
      if (existing) {
        return NextResponse.json({ error: 'E-mail já está em uso' }, { status: 400 });
      }
      data.email = parsed.data.email.trim().toLowerCase();
    }
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data,
      select: { id: true, email: true, name: true, phone: true, role: true, tenantId: true, monthlyIncome: true, financialGoal: true, birthYear: true },
    });
    return NextResponse.json({
      ...user,
      monthlyIncome: user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
    });
  } catch (e) {
    console.error('[api/me PATCH]', e);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
