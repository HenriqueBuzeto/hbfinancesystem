import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS, PLAN_LABELS, type PlanSlug } from '@/lib/plans/constants';

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tenantId: true, tenant: { select: { currentPlan: true } } },
  });
  if (!user?.tenant) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
  }

  const plan = user.tenant.currentPlan as PlanSlug;
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  return NextResponse.json({
    plan,
    planLabel: PLAN_LABELS[plan] ?? 'Grátis',
    limits,
  });
}
