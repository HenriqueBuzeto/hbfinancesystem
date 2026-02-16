import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

const RegisterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  phone: z.string().max(20).optional().nullable(),
  monthlyIncome: z.coerce.number().nonnegative().optional().nullable(),
  financialGoal: z.string().max(60).optional().nullable(),
  birthYear: z
    .number()
    .optional()
    .nullable()
    .transform((v) => {
      if (v == null || v === undefined) return undefined as number | undefined;
      const n = Number(v);
      if (Number.isNaN(n)) return undefined;
      if (n >= 1920 && n <= 2010) return n;
      if (n >= 1000000 && n <= 31122010) return n % 10000;
      return undefined;
    })
    .refine((v) => v === undefined || (v >= 1920 && v <= 2010), {
      message: 'Ano de nascimento deve ser entre 1920 e 2010 (ex: 1990).',
    }),
});

function generateSlug(email: string): string {
  const base = email
    .split('@')[0]
    .replace(/\W/g, '')
    .toLowerCase()
    .slice(0, 20) || 'user';
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMessage = flat.fieldErrors?.birthYear?.[0]
        || flat.fieldErrors?.monthlyIncome?.[0]
        || flat.fieldErrors?.name?.[0]
        || flat.fieldErrors?.email?.[0]
        || flat.fieldErrors?.password?.[0]
        || 'Dados inválidos. Verifique os campos e tente novamente.';
      return NextResponse.json(
        { error: firstMessage, details: flat },
        { status: 400 }
      );
    }
    const { name, email, password, phone, monthlyIncome, financialGoal, birthYear } = parsed.data;
    const emailNorm = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: emailNorm },
    });
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
    }

    let slug = generateSlug(emailNorm);
    let exists = await prisma.tenant.findUnique({ where: { slug } });
    while (exists) {
      slug = generateSlug(emailNorm);
      exists = await prisma.tenant.findUnique({ where: { slug } });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: name.trim() || emailNorm,
        slug,
        type: 'PERSONAL',
        currentPlan: 'FREE',
      },
    });

    const userData: {
      email: string;
      passwordHash: string;
      name: string;
      phone: string | null;
      role: 'USER';
      tenantId: string;
      monthlyIncome?: number;
      financialGoal?: string | null;
      birthYear?: number | null;
    } = {
      email: emailNorm,
      passwordHash,
      name: name.trim(),
      phone: phone?.trim() || null,
      role: 'USER',
      tenantId: tenant.id,
    };
    if (monthlyIncome != null && monthlyIncome > 0) userData.monthlyIncome = monthlyIncome;
    if (financialGoal != null && financialGoal !== '') userData.financialGoal = financialGoal;
    if (birthYear != null) userData.birthYear = birthYear;

    let user;
    try {
      user = await prisma.user.create({ data: userData });
    } catch (dbError: unknown) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      const isMissingColumn = /column.*does not exist|Unknown column|monthlyIncome|financialGoal|birthYear/i.test(msg);
      if (isMissingColumn) {
        userData.monthlyIncome = undefined;
        userData.financialGoal = undefined;
        userData.birthYear = undefined;
        delete (userData as Record<string, unknown>).monthlyIncome;
        delete (userData as Record<string, unknown>).financialGoal;
        delete (userData as Record<string, unknown>).birthYear;
        user = await prisma.user.create({ data: userData });
      } else {
        throw dbError;
      }
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
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (e) {
    console.error('[api/auth/register]', e);
    const msg = e instanceof Error ? e.message : String(e);
    const isConnection = /connect|ECONNREFUSED|P1001|DATABASE/i.test(msg);
    const isDbOrMigration = /column|migration|prisma|connect|ECONNREFUSED/i.test(msg);
    const devMessage = process.env.NODE_ENV === 'development' && msg ? msg : null;
    const userMessage = isConnection
      ? 'Falha ao conectar ao banco. Verifique DATABASE_URL em apps/web/.env ou services/api/.env.'
      : isDbOrMigration
        ? 'Falha no banco de dados. Confira se a migration foi aplicada (colunas monthlyIncome, financialGoal, birthYear na tabela User).'
        : 'Erro ao criar conta. Tente novamente.';
    return NextResponse.json(
      { error: userMessage, ...(devMessage && { debug: devMessage }) },
      { status: 500 }
    );
  }
}
