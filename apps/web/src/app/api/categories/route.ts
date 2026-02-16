/**
 * GET /api/categories - Lista categorias do tenant (receitas e/ou despesas).
 * Query: type = INCOME | EXPENSE (opcional).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

type CategoryType = 'INCOME' | 'EXPENSE';

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  const tenantId = payload?.tenantId ?? null;

  if (!tenantId) {
    return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as CategoryType | null;

    const where: { tenantId: string; type?: CategoryType } = { tenantId };
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
      parentId: c.parentId,
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error('[api/categories GET]', e);
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 });
  }
}
