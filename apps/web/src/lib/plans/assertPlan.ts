import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPlanAccess, canAccessFeature, type PlanSlug } from './constants';

export type AssertPlanResult =
  | { ok: true; plan: PlanSlug; tenantId: string }
  | { ok: false; response: NextResponse };

export async function getTenantPlan(request: NextRequest): Promise<
  | { plan: PlanSlug; tenantId: string; userId: string }
  | { error: NextResponse }
> {
  const payload = await getAuthFromRequest(request);
  if (!payload?.sub) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tenantId: true, tenant: { select: { currentPlan: true } } },
  });

  if (!user?.tenant) {
    return { error: NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 }) };
  }

  const plan = (user.tenant.currentPlan ?? 'FREE') as PlanSlug;
  return { plan, tenantId: user.tenantId, userId: payload.sub };
}

export async function assertPlanAccess(
  request: NextRequest,
  required: PlanSlug
): Promise<AssertPlanResult> {
  const result = await getTenantPlan(request);
  if ('error' in result) return { ok: false, response: result.error };

  if (!hasPlanAccess(result.plan, required)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Recurso não disponível no seu plano', requiredPlan: required },
        { status: 403 }
      ),
    };
  }

  return { ok: true, plan: result.plan, tenantId: result.tenantId };
}

export async function assertFeatureAccess(
  request: NextRequest,
  feature: string
): Promise<AssertPlanResult> {
  const result = await getTenantPlan(request);
  if ('error' in result) return { ok: false, response: result.error };

  if (!canAccessFeature(result.plan, feature)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Recurso não disponível no seu plano', feature },
        { status: 403 }
      ),
    };
  }

  return { ok: true, plan: result.plan, tenantId: result.tenantId };
}
