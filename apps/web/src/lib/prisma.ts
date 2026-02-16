/**
 * Prisma Client singleton para Next.js (evita múltiplas instâncias em dev).
 * Schema em services/api/prisma/schema.prisma.
 * Rode: npm run db:generate (no workspace apps/web) após alterar o schema.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
