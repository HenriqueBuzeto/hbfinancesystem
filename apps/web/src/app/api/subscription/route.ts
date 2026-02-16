import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tenantId: true, tenant: { select: { currentPlan: true, stripeCustomerId: true } } },
  });
  if (!user?.tenant) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId: user.tenantId, status: 'ACTIVE' },
    orderBy: { currentPeriodEnd: 'desc' },
    select: {
      id: true,
      plan: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      stripeSubscriptionId: true,
    },
  });

  const manageUrl =
    process.env.STRIPE_CUSTOMER_PORTAL_URL || null;

  return NextResponse.json({
    subscription: subscription
      ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    currentPlan: user.tenant.currentPlan,
    manageUrl,
  });
}
