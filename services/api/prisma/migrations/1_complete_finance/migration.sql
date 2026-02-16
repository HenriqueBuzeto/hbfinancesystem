-- HB Finance - Schema completo (novas tabelas e colunas para sistema financeiro profissional)
-- Execute após 0_init. Idempotente: colunas adicionadas apenas se não existirem.

-- Novo enum para conciliação
DO $$ BEGIN
  CREATE TYPE "ReconciliationStatus" AS ENUM ('OPEN', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========== Novas colunas em Account ==========
DO $$ BEGIN
  ALTER TABLE "Account" ADD COLUMN "openingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Account" ADD COLUMN "openingDate" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Account" ADD COLUMN "bankCode" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Account" ADD COLUMN "agency" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Account" ADD COLUMN "accountNumber" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ========== Novas colunas em Category ==========
DO $$ BEGIN
  ALTER TABLE "Category" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Category" ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- ========== Tabela Payee (favorecidos) ==========
CREATE TABLE IF NOT EXISTS "Payee" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "document" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payee_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Payee_tenantId_idx" ON "Payee"("tenantId");
CREATE INDEX IF NOT EXISTS "Payee_name_idx" ON "Payee"("name");
ALTER TABLE "Payee" DROP CONSTRAINT IF EXISTS "Payee_tenantId_fkey";
ALTER TABLE "Payee" ADD CONSTRAINT "Payee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== Tabela Tag ==========
CREATE TABLE IF NOT EXISTS "Tag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_tenantId_name_key" ON "Tag"("tenantId", "name");
CREATE INDEX IF NOT EXISTS "Tag_tenantId_idx" ON "Tag"("tenantId");
ALTER TABLE "Tag" DROP CONSTRAINT IF EXISTS "Tag_tenantId_fkey";
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== Novas colunas em Transaction ==========
DO $$ BEGIN
  ALTER TABLE "Transaction" ADD COLUMN "payeeId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Transaction" ADD COLUMN "checkNumber" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Transaction" ADD COLUMN "attachmentUrl" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Transaction" ADD COLUMN "reconciliationId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Transaction" ADD COLUMN "transferPairId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
-- FK e unique para transferPairId (após coluna existir)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_transferPairId_fkey') THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferPairId_fkey" FOREIGN KEY ("transferPairId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Transaction_transferPairId_key') THEN
    CREATE UNIQUE INDEX "Transaction_transferPairId_key" ON "Transaction"("transferPairId") WHERE "transferPairId" IS NOT NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_payeeId_fkey') THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "Transaction_payeeId_idx" ON "Transaction"("payeeId");
CREATE INDEX IF NOT EXISTS "Transaction_reconciliationId_idx" ON "Transaction"("reconciliationId");

-- ========== Tabela TransactionTag (N:N) ==========
CREATE TABLE IF NOT EXISTS "TransactionTag" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransactionTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TransactionTag_transactionId_tagId_key" ON "TransactionTag"("transactionId", "tagId");
CREATE INDEX IF NOT EXISTS "TransactionTag_transactionId_idx" ON "TransactionTag"("transactionId");
CREATE INDEX IF NOT EXISTS "TransactionTag_tagId_idx" ON "TransactionTag"("tagId");
ALTER TABLE "TransactionTag" DROP CONSTRAINT IF EXISTS "TransactionTag_transactionId_fkey";
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionTag" DROP CONSTRAINT IF EXISTS "TransactionTag_tagId_fkey";
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== Tabela Reconciliation ==========
CREATE TABLE IF NOT EXISTS "Reconciliation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "closedAt" TIMESTAMP(3),
  "openingBalance" DECIMAL(15,2) NOT NULL,
  "closingBalance" DECIMAL(15,2),
  "status" "ReconciliationStatus" NOT NULL DEFAULT 'OPEN',
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reconciliation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Reconciliation_tenantId_idx" ON "Reconciliation"("tenantId");
CREATE INDEX IF NOT EXISTS "Reconciliation_accountId_idx" ON "Reconciliation"("accountId");
CREATE INDEX IF NOT EXISTS "Reconciliation_status_idx" ON "Reconciliation"("status");
ALTER TABLE "Reconciliation" DROP CONSTRAINT IF EXISTS "Reconciliation_tenantId_fkey";
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reconciliation" DROP CONSTRAINT IF EXISTS "Reconciliation_accountId_fkey";
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_reconciliationId_fkey') THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "Reconciliation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ========== Tabela RecurringTemplate ==========
CREATE TABLE IF NOT EXISTS "RecurringTemplate" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "categoryId" TEXT,
  "payeeId" TEXT,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
  "recurrence" "RecurrenceType" NOT NULL,
  "dayOfMonth" INTEGER NOT NULL,
  "nextRunAt" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecurringTemplate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RecurringTemplate_tenantId_idx" ON "RecurringTemplate"("tenantId");
CREATE INDEX IF NOT EXISTS "RecurringTemplate_nextRunAt_idx" ON "RecurringTemplate"("nextRunAt");
ALTER TABLE "RecurringTemplate" DROP CONSTRAINT IF EXISTS "RecurringTemplate_tenantId_fkey";
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" DROP CONSTRAINT IF EXISTS "RecurringTemplate_accountId_fkey";
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" DROP CONSTRAINT IF EXISTS "RecurringTemplate_categoryId_fkey";
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" DROP CONSTRAINT IF EXISTS "RecurringTemplate_payeeId_fkey";
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
