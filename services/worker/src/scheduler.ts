/**
 * Scheduler: cron diário (08:00) para contas a vencer/vencidas;
 * cron semanal (segunda 08:00) e mensal (dia 1, 08:00) para resumos.
 * Respeita preferências do usuário (eventTypes, canal).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cron = require('node-cron') as typeof import('node-cron');
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? undefined;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://app.nebula.finance';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const whatsappQueue = new Queue('nebula:whatsapp', { connection });
const emailQueue = new Queue('nebula:email', { connection });
const prisma = new PrismaClient();

const DUE_DAYS_AHEAD = 3;

async function getUsersWithEvent(channel: 'WHATSAPP' | 'EMAIL', eventType: string) {
  const prefs = await prisma.notificationPreference.findMany({
    where: { channel, enabled: true },
    include: { user: { select: { id: true, email: true, phone: true, name: true } } },
  });
  return prefs
    .filter((p) => ((p.eventTypes as string[]) ?? []).includes(eventType))
    .map((p) => p.user)
    .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
}

async function enqueueBillDue() {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + DUE_DAYS_AHEAD);
  end.setHours(23, 59, 59, 999);

  const bills = await prisma.bill.findMany({
    where: {
      type: 'PAYABLE',
      status: 'PENDING',
      dueDate: { gte: now, lte: end },
    },
    include: { tenant: true },
  });

  const usersWhatsApp = await getUsersWithEvent('WHATSAPP', 'BILL_DUE');
  const usersEmail = await getUsersWithEvent('EMAIL', 'BILL_DUE');

  for (const bill of bills) {
    const vars = {
      descricao: bill.description,
      valor: `R$ ${Number(bill.amount).toFixed(2).replace('.', ',')}`,
      vencimento: new Date(bill.dueDate).toLocaleDateString('pt-BR'),
      link: `${APP_URL}/app/contas-a-pagar`,
    };
    const tenantUsers = await prisma.user.findMany({
      where: { tenantId: bill.tenantId },
      select: { id: true, email: true, phone: true },
    });
    for (const u of tenantUsers) {
      if (usersWhatsApp.some((w) => w.id === u.id) && u.phone) {
        await whatsappQueue.add('bill-due', {
          to: u.phone,
          template: 'BILL_DUE',
          variables: vars,
          tenantId: bill.tenantId,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
      }
      if (usersEmail.some((e) => e.id === u.id)) {
        const html = `<p>Conta a pagar em breve: <strong>${bill.description}</strong></p><p>Valor: ${vars.valor}</p><p>Vencimento: ${vars.vencimento}</p><p><a href="${vars.link}">Ver no app</a></p>`;
        await emailQueue.add('bill-due', {
          to: u.email,
          subject: `Conta a pagar em breve - ${bill.description}`,
          html,
          userId: u.id,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
      }
    }
  }
  console.log(`[Scheduler] BILL_DUE: ${bills.length} contas, notificações enfileiradas`);
}

async function enqueueBillOverdue() {
  const now = new Date();
  const bills = await prisma.bill.findMany({
    where: {
      type: 'PAYABLE',
      status: 'PENDING',
      dueDate: { lt: now },
    },
    include: { tenant: true },
  });

  const usersWhatsApp = await getUsersWithEvent('WHATSAPP', 'BILL_OVERDUE');
  const usersEmail = await getUsersWithEvent('EMAIL', 'BILL_OVERDUE');

  for (const bill of bills) {
    const vars = {
      descricao: bill.description,
      valor: `R$ ${Number(bill.amount).toFixed(2).replace('.', ',')}`,
      vencimento: new Date(bill.dueDate).toLocaleDateString('pt-BR'),
      link: `${APP_URL}/app/contas-a-pagar`,
    };
    const tenantUsers = await prisma.user.findMany({
      where: { tenantId: bill.tenantId },
      select: { id: true, email: true, phone: true },
    });
    for (const u of tenantUsers) {
      if (usersWhatsApp.some((w) => w.id === u.id) && u.phone) {
        await whatsappQueue.add('bill-overdue', {
          to: u.phone,
          template: 'BILL_OVERDUE',
          variables: vars,
          tenantId: bill.tenantId,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
      }
      if (usersEmail.some((e) => e.id === u.id)) {
        const html = `<p>Conta <strong>vencida</strong>: ${bill.description}</p><p>Valor: ${vars.valor}</p><p>Vencimento: ${vars.vencimento}</p><p><a href="${vars.link}">Regularizar no app</a></p>`;
        await emailQueue.add('bill-overdue', {
          to: u.email,
          subject: `Conta vencida - ${bill.description}`,
          html,
          userId: u.id,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
      }
    }
  }
  console.log(`[Scheduler] BILL_OVERDUE: ${bills.length} contas, notificações enfileiradas`);
}

async function enqueueWeeklySummary() {
  const usersWhatsApp = await getUsersWithEvent('WHATSAPP', 'WEEKLY_SUMMARY');
  const usersEmail = await getUsersWithEvent('EMAIL', 'WEEKLY_SUMMARY');
  const users = [...usersWhatsApp, ...usersEmail];
  const unique = users.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);

  for (const u of unique) {
    const vars = {
      receitas: 'R$ 0,00',
      despesas: 'R$ 0,00',
      saldo: 'R$ 0,00',
      link: `${APP_URL}/app/relatorios`,
    };
    if (u.phone && usersWhatsApp.some((w) => w.id === u.id)) {
      await whatsappQueue.add('weekly-summary', {
        to: u.phone,
        template: 'WEEKLY_SUMMARY',
        variables: vars,
      }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    }
    if (usersEmail.some((e) => e.id === u.id)) {
      await emailQueue.add('weekly-summary', {
        to: u.email,
        subject: 'Resumo financeiro semanal',
        html: `<p>Receitas: ${vars.receitas}</p><p>Despesas: ${vars.despesas}</p><p>Saldo: ${vars.saldo}</p><p><a href="${vars.link}">Ver relatórios</a></p>`,
        userId: u.id,
      }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    }
  }
  console.log(`[Scheduler] WEEKLY_SUMMARY: ${unique.length} usuários`);
}

async function enqueueMonthlySummary() {
  const usersWhatsApp = await getUsersWithEvent('WHATSAPP', 'MONTHLY_SUMMARY');
  const usersEmail = await getUsersWithEvent('EMAIL', 'MONTHLY_SUMMARY');
  const users = [...usersWhatsApp, ...usersEmail];
  const unique = users.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);

  for (const u of unique) {
    const vars = {
      receitas: 'R$ 0,00',
      despesas: 'R$ 0,00',
      saldo: 'R$ 0,00',
      link: `${APP_URL}/app/relatorios`,
    };
    if (u.phone && usersWhatsApp.some((w) => w.id === u.id)) {
      await whatsappQueue.add('monthly-summary', {
        to: u.phone,
        template: 'MONTHLY_SUMMARY',
        variables: vars,
      }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    }
    if (usersEmail.some((e) => e.id === u.id)) {
      await emailQueue.add('monthly-summary', {
        to: u.email,
        subject: 'Resumo financeiro mensal',
        html: `<p>Receitas: ${vars.receitas}</p><p>Despesas: ${vars.despesas}</p><p>Resultado: ${vars.saldo}</p><p><a href="${vars.link}">Ver relatórios</a></p>`,
        userId: u.id,
      }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    }
  }
  console.log(`[Scheduler] MONTHLY_SUMMARY: ${unique.length} usuários`);
}

async function runDaily() {
  try {
    await enqueueBillDue();
    await enqueueBillOverdue();
  } catch (e) {
    console.error('[Scheduler] Erro no job diário:', e);
  }
}

// Diário 08:00 - contas a vencer e vencidas
cron.schedule('0 8 * * *', runDaily);

// Segunda-feira 08:00 - resumo semanal
cron.schedule('0 8 * * 1', async () => {
  try {
    await enqueueWeeklySummary();
  } catch (e) {
    console.error('[Scheduler] Erro no resumo semanal:', e);
  }
});

// Dia 1 de cada mês 08:00 - resumo mensal
cron.schedule('0 8 1 * *', async () => {
  try {
    await enqueueMonthlySummary();
  } catch (e) {
    console.error('[Scheduler] Erro no resumo mensal:', e);
  }
});

console.log('[Nebula Scheduler] Cron ativo: diário 08:00, semanal seg 08:00, mensal dia 1 08:00');

if (process.env.RUN_ONCE === '1') {
  runDaily()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
