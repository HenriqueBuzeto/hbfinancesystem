import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code) {
    return NextResponse.json({ error: 'Informe o código do cupom' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tenantId: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });
  if (!coupon) {
    return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
  }
  if (!coupon.isActive) {
    return NextResponse.json({ error: 'Cupom não está ativo' }, { status: 400 });
  }
  if (coupon.expirationDate && coupon.expirationDate < new Date()) {
    return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 });
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 });
  }

  const existing = await prisma.couponRedemption.findUnique({
    where: {
      couponId_tenantId: { couponId: coupon.id, tenantId: user.tenantId },
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'Este cupom já foi utilizado nesta conta' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.couponRedemption.create({
      data: {
        couponId: coupon.id,
        tenantId: user.tenantId,
      },
    }),
    prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    }),
    prisma.tenant.update({
      where: { id: user.tenantId },
      data: { currentPlan: coupon.planGranted },
    }),
  ]);

  return NextResponse.json({
    success: true,
    plan: coupon.planGranted,
    message: `Cupom aplicado! Seu plano agora é ${coupon.planGranted}.`,
  });
}
