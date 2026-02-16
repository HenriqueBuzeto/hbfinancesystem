/**
 * POST /api/stripe/checkout
 * Cria uma sessão do Stripe Checkout (assinatura mensal) e retorna a URL para redirecionamento.
 * Body: { plan: 'START' | 'PRO' }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const isTestMode = () => (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_');

const PLAN_AMOUNTS = { START: 1990, PRO: 4990 };

function getPlanIds(): Record<string, string> {
  const testPrice = process.env.STRIPE_PRICE_ID_TEST ?? '';
  const startPrice = process.env.STRIPE_PRICE_ID_START ?? '';
  const proPrice = process.env.STRIPE_PRICE_ID_PRO ?? '';
  const startProduct = process.env.STRIPE_PRODUCT_ID_START ?? '';
  const proProduct = process.env.STRIPE_PRODUCT_ID_PRO ?? '';
  return {
    START: startPrice || (isTestMode() ? testPrice : '') || startProduct,
    PRO: proPrice || (isTestMode() ? testPrice : '') || proProduct,
  };
}

/** GET: retorna se os planos pagos estão disponíveis (Stripe configurado). */
export async function GET() {
  const hasSecret = !!process.env.STRIPE_SECRET_KEY;
  const ids = getPlanIds();
  const start = hasSecret && !!ids.START;
  const pro = hasSecret && !!ids.PRO;
  return Response.json({ start, pro });
}

export async function POST(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const plan = body.plan === 'PRO' ? 'PRO' : body.plan === 'START' ? 'START' : null;
  if (!plan) {
    return NextResponse.json({ error: 'Plano inválido. Use START ou PRO.' }, { status: 400 });
  }

  const planIds = getPlanIds();
  const planId = planIds[plan];
  if (!planId) {
    return NextResponse.json(
      {
        error: isTestMode()
          ? 'Configure STRIPE_PRICE_ID_TEST ou STRIPE_PRODUCT_ID_START/PRO no .env.'
          : `Plano ${plan} não configurado (STRIPE_PRICE_ID_ ou STRIPE_PRODUCT_ID_).`,
      },
      { status: 503 }
    );
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      email: true,
      tenantId: true,
      tenant: { select: { id: true, stripeCustomerId: true } },
    },
  });
  if (!user?.tenant) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const successUrl = `${baseUrl}/app/planos?success=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/app/planos?canceled=1`;

  const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

  const isProductId = planId.startsWith('prod_');
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = isProductId
    ? {
        price_data: {
          product: planId,
          currency: 'brl',
          unit_amount: PLAN_AMOUNTS[plan],
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }
    : { price: planId, quantity: 1 };

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [lineItem],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      tenantId: user.tenant.id,
      plan,
    },
    subscription_data: {
      metadata: { tenantId: user.tenant.id, plan },
    },
  };

  if (user.tenant.stripeCustomerId) {
    sessionParams.customer = user.tenant.stripeCustomerId;
  } else if (user.email) {
    sessionParams.customer_email = user.email;
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    if (!session.url) {
      return NextResponse.json({ error: 'Stripe não retornou URL' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar sessão Stripe';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
