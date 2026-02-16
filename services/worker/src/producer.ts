/**
 * Producer de exemplo: envia job para a fila nebula:whatsapp.
 * Uso: npm run producer (ou chamado pelo cron/scheduler diário).
 */

import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? undefined;

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const whatsappQueue = new Queue('nebula:whatsapp', { connection });

async function main() {
  // Exemplo: notificação de vencimento
  const job = await whatsappQueue.add(
    'bill-due-reminder',
    {
      to: '+5511999999999',
      template: 'bill_due',
      variables: {
        nome: 'João',
        valor: 'R$ 150,00',
        vencimento: '15/02/2025',
        link: 'https://app.nebula.finance/pay/xxx',
      },
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    }
  );
  console.log('Job enqueued:', job.id);
  await connection.quit();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
