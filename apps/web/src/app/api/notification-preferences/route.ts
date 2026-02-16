/**
 * GET /api/notification-preferences - Lista preferências do usuário.
 * PATCH /api/notification-preferences - Atualiza preferências (body: { channel, enabled?, eventTypes?, dailyTime?, weeklyDay?, monthlyDay? }).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';

const EVENT_TYPES = [
  'BILL_DUE',
  'BILL_OVERDUE',
  'RECEIVABLE_DUE',
  'RECEIVABLE_RECEIVED',
  'EXPENSE_REGISTERED',
  'WEEKLY_SUMMARY',
  'MONTHLY_SUMMARY',
  'BUDGET_ALERT',
  'LOW_BALANCE',
  'AI_TIP',
] as const;

const UpdatePrefSchema = z.object({
  channel: z.enum(['WHATSAPP', 'EMAIL']),
  enabled: z.boolean().optional(),
  eventTypes: z.array(z.enum(EVENT_TYPES)).optional(),
  dailyTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  weeklyDay: z.number().int().min(0).max(6).optional().nullable(),
  monthlyDay: z.number().int().min(1).max(28).optional().nullable(),
});

export async function GET(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const prefs = await (prisma as unknown as { notificationPreference: { findMany: (args: { where: { userId: string } }) => Promise<Array<{
      id: string; channel: string; enabled: boolean; eventTypes: unknown; dailyTime: string | null; weeklyDay: number | null; monthlyDay: number | null;
    }>> } }).notificationPreference.findMany({
      where: { userId: payload.sub },
    });
    return NextResponse.json({
      data: prefs.map((p: { id: string; channel: string; enabled: boolean; eventTypes: unknown; dailyTime: string | null; weeklyDay: number | null; monthlyDay: number | null }) => ({
        id: p.id,
        channel: p.channel,
        enabled: p.enabled,
        eventTypes: p.eventTypes,
        dailyTime: p.dailyTime,
        weeklyDay: p.weeklyDay,
        monthlyDay: p.monthlyDay,
      })),
    });
  } catch (e) {
    console.error('[api/notification-preferences GET]', e);
    return NextResponse.json({ error: 'Erro ao listar preferências' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const payload = await getAuthFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = UpdatePrefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { channel, enabled, eventTypes, dailyTime, weeklyDay, monthlyDay } = parsed.data;

    const pref = await (prisma as unknown as { notificationPreference: { upsert: (args: {
      where: { userId_channel: { userId: string; channel: string } };
      create: object;
      update: object;
    }) => Promise<{ id: string; channel: string; enabled: boolean; eventTypes: unknown; dailyTime: string | null; weeklyDay: number | null; monthlyDay: number | null }> } }).notificationPreference.upsert({
      where: {
        userId_channel: { userId: payload.sub, channel },
      },
      create: {
        userId: payload.sub,
        channel,
        enabled: enabled ?? true,
        eventTypes: (eventTypes ?? []) as object,
        dailyTime: dailyTime ?? null,
        weeklyDay: weeklyDay ?? null,
        monthlyDay: monthlyDay ?? null,
      },
      update: {
        ...(enabled !== undefined && { enabled }),
        ...(eventTypes !== undefined && { eventTypes: eventTypes as object }),
        ...(dailyTime !== undefined && { dailyTime }),
        ...(weeklyDay !== undefined && { weeklyDay }),
        ...(monthlyDay !== undefined && { monthlyDay }),
      },
    });

    return NextResponse.json({
      id: pref.id,
      channel: pref.channel,
      enabled: pref.enabled,
      eventTypes: pref.eventTypes,
      dailyTime: pref.dailyTime,
      weeklyDay: pref.weeklyDay,
      monthlyDay: pref.monthlyDay,
    });
  } catch (e) {
    console.error('[api/notification-preferences PATCH]', e);
    return NextResponse.json({ error: 'Erro ao atualizar preferências' }, { status: 500 });
  }
}
