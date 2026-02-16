/**
 * HB Finance - Worker BullMQ
 * Consome filas: nebula:whatsapp e nebula:email.
 * Dead-letter: jobs que falham após todas as tentativas.
 */

import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { whatsappProcessor } from './processors/whatsapp';
import { emailProcessor } from './processors/email';

const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? undefined;
const isDev = process.env.NODE_ENV !== 'production';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export type WhatsAppJobPayload = {
  to: string;
  template: string;
  variables: Record<string, string>;
  tenantId?: string;
};

export type EmailJobPayload = {
  to: string;
  subject: string;
  html: string;
  userId?: string;
};

const DLQ_WHATSAPP = 'nebula:whatsapp:dlq';
const DLQ_EMAIL = 'nebula:email:dlq';

function addToDlq(queueName: string, job: Job, err: Error) {
  const dlq = new Queue(queueName, { connection });
  return dlq.add('dlq', {
    originalJobId: job.id,
    name: job.name,
    data: job.data,
    failedReason: err.message,
    failedAt: new Date().toISOString(),
  }, { removeOnComplete: { count: 10000 } });
}

const whatsappWorker = new Worker(
  'nebula:whatsapp',
  async (job: Job<WhatsAppJobPayload>) => whatsappProcessor(job),
  { connection, concurrency: 5 }
);

const emailWorker = new Worker(
  'nebula:email',
  async (job: Job<EmailJobPayload>) => emailProcessor(job),
  { connection, concurrency: 5 }
);

[whatsappWorker, emailWorker].forEach((w) => {
  w.on('completed', (job) => console.log(`[Worker] ${job.queueName} job ${job.id} completed`));
  w.on('failed', async (job, err) => {
    console.error(`[Worker] ${job?.queueName} job ${job?.id} failed:`, err?.message);
    if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
      const q = job.queueName === 'nebula:whatsapp' ? DLQ_WHATSAPP : DLQ_EMAIL;
      await addToDlq(q, job, err!);
      console.log(`[Worker] Job ${job.id} enviado para DLQ ${q}`);
    }
  });
  w.on('error', (err) => console.error('[Worker] Error:', err));
});

console.log('[HB Finance Worker] Listening for jobs on nebula:whatsapp and nebula:email');
if (isDev) console.log('[HB Finance Worker] Dev mode: WhatsApp/Email logged to console');

async function shutdown() {
  await whatsappWorker.close();
  await emailWorker.close();
  await connection.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
