-- =============================================================================
-- HB Finance - Banco de dados completo (PostgreSQL / Supabase)
-- Execute em um banco VAZIO para criar todas as tabelas, triggers e procedures.
--
-- Como executar:
--   Supabase: Dashboard > SQL Editor > colar e executar este arquivo.
--   psql:     psql "postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres" -f full_database.sql
-- =============================================================================

-- ---------- ENUMS ----------
CREATE TYPE "TenantType" AS ENUM ('PERSONAL', 'BUSINESS');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
CREATE TYPE "Plan" AS ENUM ('FREE', 'START', 'PRO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE', 'INCOMPLETE_EXPIRED');
CREATE TYPE "AccountType" AS ENUM ('BANK', 'CASH', 'CREDIT', 'INVESTMENT');
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
CREATE TYPE "BillType" AS ENUM ('PAYABLE', 'RECEIVABLE');
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "RecurrenceType" AS ENUM ('NONE', 'MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE "ReconciliationStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "NotificationType" AS ENUM ('BILL_DUE', 'BILL_OVERDUE', 'RECEIVABLE_DUE', 'RECEIVABLE_RECEIVED', 'EXPENSE_REGISTERED', 'BUDGET_ALERT', 'BURN_RATE', 'LOW_BALANCE', 'WEEKLY_SUMMARY', 'MONTHLY_SUMMARY', 'AI_TIP');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP');

-- ---------- TABELAS (ordem respeitando FKs) ----------

CREATE TABLE "Tenant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" "TenantType" NOT NULL DEFAULT 'PERSONAL',
  "currentPlan" "Plan" NOT NULL DEFAULT 'FREE',
  "stripeCustomerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "tenantId" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "monthlyIncome" DECIMAL(12,2),
  "financialGoal" TEXT,
  "birthYear" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "AccountType" NOT NULL DEFAULT 'BANK',
  "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "openingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "openingDate" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "bankCode" TEXT,
  "agency" TEXT,
  "accountNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "CategoryType" NOT NULL,
  "color" TEXT,
  "icon" TEXT,
  "parentId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payee" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "document" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reconciliation" (
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

CREATE TABLE "Bill" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "accountId" TEXT,
  "categoryId" TEXT,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "type" "BillType" NOT NULL DEFAULT 'PAYABLE',
  "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
  "recurrence" "RecurrenceType",
  "totalInstallments" INTEGER,
  "currentInstallment" INTEGER DEFAULT 1,
  "attachmentUrl" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "categoryId" TEXT,
  "payeeId" TEXT,
  "amount" DECIMAL(15,2) NOT NULL,
  "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
  "description" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "checkNumber" TEXT,
  "attachmentUrl" TEXT,
  "isReconciled" BOOLEAN NOT NULL DEFAULT false,
  "reconciliationId" TEXT,
  "externalId" TEXT,
  "transferPairId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "billId" TEXT,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransactionTag" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransactionTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecurringTemplate" (
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

CREATE TABLE "Budget" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "period" TEXT NOT NULL,
  "alertThreshold" DECIMAL(5,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "eventTypes" JSONB NOT NULL,
  "dailyTime" TEXT,
  "weeklyDay" INTEGER,
  "monthlyDay" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "plan" "Plan" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "planGranted" "Plan" NOT NULL,
  "expirationDate" TIMESTAMP(3),
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CouponRedemption" (
  "id" TEXT NOT NULL,
  "couponId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentHistory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "status" TEXT NOT NULL,
  "stripeInvoiceId" TEXT,
  "stripePaymentIntentId" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- ---------- ÍNDICES E UNIQUES ----------

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Account_tenantId_idx" ON "Account"("tenantId");
CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Payee_tenantId_idx" ON "Payee"("tenantId");
CREATE INDEX "Payee_name_idx" ON "Payee"("name");
CREATE UNIQUE INDEX "Tag_tenantId_name_key" ON "Tag"("tenantId", "name");
CREATE INDEX "Tag_tenantId_idx" ON "Tag"("tenantId");
CREATE INDEX "Reconciliation_tenantId_idx" ON "Reconciliation"("tenantId");
CREATE INDEX "Reconciliation_accountId_idx" ON "Reconciliation"("accountId");
CREATE INDEX "Reconciliation_status_idx" ON "Reconciliation"("status");
CREATE INDEX "Bill_tenantId_idx" ON "Bill"("tenantId");
CREATE INDEX "Bill_dueDate_idx" ON "Bill"("dueDate");
CREATE INDEX "Bill_status_idx" ON "Bill"("status");
CREATE INDEX "Bill_tenantId_dueDate_idx" ON "Bill"("tenantId", "dueDate");
CREATE INDEX "Transaction_tenantId_idx" ON "Transaction"("tenantId");
CREATE INDEX "Transaction_accountId_idx" ON "Transaction"("accountId");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");
CREATE INDEX "Transaction_payeeId_idx" ON "Transaction"("payeeId");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_externalId_idx" ON "Transaction"("externalId");
CREATE INDEX "Transaction_reconciliationId_idx" ON "Transaction"("reconciliationId");
CREATE UNIQUE INDEX "Transaction_transferPairId_key" ON "Transaction"("transferPairId");
CREATE INDEX "Transaction_tenantId_date_idx" ON "Transaction"("tenantId", "date");
CREATE UNIQUE INDEX "TransactionTag_transactionId_tagId_key" ON "TransactionTag"("transactionId", "tagId");
CREATE INDEX "TransactionTag_transactionId_idx" ON "TransactionTag"("transactionId");
CREATE INDEX "TransactionTag_tagId_idx" ON "TransactionTag"("tagId");
CREATE INDEX "RecurringTemplate_tenantId_idx" ON "RecurringTemplate"("tenantId");
CREATE INDEX "RecurringTemplate_nextRunAt_idx" ON "RecurringTemplate"("nextRunAt");
CREATE UNIQUE INDEX "Budget_tenantId_categoryId_period_key" ON "Budget"("tenantId", "categoryId", "period");
CREATE INDEX "Budget_tenantId_idx" ON "Budget"("tenantId");
CREATE INDEX "Budget_period_idx" ON "Budget"("period");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE UNIQUE INDEX "NotificationPreference_userId_channel_key" ON "NotificationPreference"("userId", "channel");
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE UNIQUE INDEX "CouponRedemption_couponId_tenantId_key" ON "CouponRedemption"("couponId", "tenantId");
CREATE INDEX "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");
CREATE INDEX "CouponRedemption_tenantId_idx" ON "CouponRedemption"("tenantId");
CREATE INDEX "PaymentHistory_tenantId_idx" ON "PaymentHistory"("tenantId");
CREATE INDEX "PaymentHistory_subscriptionId_idx" ON "PaymentHistory"("subscriptionId");
CREATE INDEX "PaymentHistory_createdAt_idx" ON "PaymentHistory"("createdAt");

-- ---------- FOREIGN KEYS ----------

ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payee" ADD CONSTRAINT "Payee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "Reconciliation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferPairId_fkey" FOREIGN KEY ("transferPairId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RecurringTemplate" ADD CONSTRAINT "RecurringTemplate_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- TRIGGERS E FUNÇÕES
-- =============================================================================

-- ---------- Função: atualizar "updatedAt" ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- Triggers updatedAt ----------
CREATE TRIGGER trg_tenant_updated_at BEFORE UPDATE ON "Tenant" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_account_updated_at BEFORE UPDATE ON "Account" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_category_updated_at BEFORE UPDATE ON "Category" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_payee_updated_at BEFORE UPDATE ON "Payee" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_tag_updated_at BEFORE UPDATE ON "Tag" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_bill_updated_at BEFORE UPDATE ON "Bill" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_transaction_updated_at BEFORE UPDATE ON "Transaction" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_recurring_template_updated_at BEFORE UPDATE ON "RecurringTemplate" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_reconciliation_updated_at BEFORE UPDATE ON "Reconciliation" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_budget_updated_at BEFORE UPDATE ON "Budget" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_notification_preference_updated_at BEFORE UPDATE ON "NotificationPreference" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_subscription_updated_at BEFORE UPDATE ON "Subscription" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_coupon_updated_at BEFORE UPDATE ON "Coupon" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ---------- Função + Trigger: saldo da conta (Transaction) ----------
CREATE OR REPLACE FUNCTION sync_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "Account" SET balance = balance + NEW.amount WHERE id = NEW."accountId";
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD."accountId" = NEW."accountId" THEN
      UPDATE "Account" SET balance = balance - OLD.amount + NEW.amount WHERE id = NEW."accountId";
    ELSE
      UPDATE "Account" SET balance = balance - OLD.amount WHERE id = OLD."accountId";
      UPDATE "Account" SET balance = balance + NEW.amount WHERE id = NEW."accountId";
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "Account" SET balance = balance - OLD.amount WHERE id = OLD."accountId";
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transaction_sync_balance
  AFTER INSERT OR UPDATE OR DELETE ON "Transaction"
  FOR EACH ROW EXECUTE PROCEDURE sync_account_balance_on_transaction();

-- ---------- Procedure: criar transação a partir de conta paga/recebida ----------
CREATE OR REPLACE FUNCTION create_transaction_from_bill(
  p_bill_id TEXT,
  p_account_id TEXT,
  p_paid_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_bill RECORD;
  v_tx_id TEXT;
BEGIN
  SELECT id, "tenantId", "categoryId", description, amount, type
    INTO v_bill FROM "Bill" WHERE id = p_bill_id AND status = 'PAID';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bill % not found or not PAID', p_bill_id;
  END IF;

  v_tx_id := gen_random_uuid()::TEXT;
  IF v_bill.type = 'RECEIVABLE' THEN
    INSERT INTO "Transaction" (id, "tenantId", "accountId", "categoryId", amount, type, description, date, "billId", "createdAt", "updatedAt")
    VALUES (v_tx_id, v_bill."tenantId", p_account_id, v_bill."categoryId", v_bill.amount, 'INCOME', v_bill.description, p_paid_at, p_bill_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  ELSE
    INSERT INTO "Transaction" (id, "tenantId", "accountId", "categoryId", amount, type, description, date, "billId", "createdAt", "updatedAt")
    VALUES (v_tx_id, v_bill."tenantId", p_account_id, v_bill."categoryId", (-1) * v_bill.amount, 'EXPENSE', v_bill.description, p_paid_at, p_bill_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  END IF;
END;
$$;

-- ---------- Function: resumo por período (dashboard) ----------
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_tenant_id TEXT,
  p_period TEXT,
  p_ref DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_income NUMERIC,
  total_expense NUMERIC,
  balance NUMERIC,
  transaction_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_start TIMESTAMP(3);
  v_end   TIMESTAMP(3);
  r RECORD;
BEGIN
  v_end := (p_ref + INTERVAL '1 day')::TIMESTAMP(3);
  IF p_period = 'day' THEN
    v_start := p_ref::TIMESTAMP(3);
  ELSIF p_period = 'month' THEN
    v_start := (date_trunc('month', p_ref)::DATE)::TIMESTAMP(3);
    v_end   := (date_trunc('month', p_ref)::DATE + INTERVAL '1 month')::TIMESTAMP(3);
  ELSIF p_period = 'year' THEN
    v_start := (date_trunc('year', p_ref)::DATE)::TIMESTAMP(3);
    v_end   := (date_trunc('year', p_ref)::DATE + INTERVAL '1 year')::TIMESTAMP(3);
  ELSE
    v_start := p_ref::TIMESTAMP(3);
  END IF;

  FOR r IN
    SELECT
      COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0)::NUMERIC AS ti,
      COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0)::NUMERIC AS te,
      COALESCE(SUM(t.amount), 0)::NUMERIC AS bal,
      COUNT(*)::BIGINT AS cnt
    FROM "Transaction" t
    WHERE t."tenantId" = p_tenant_id
      AND t.date >= v_start AND t.date < v_end
  LOOP
    total_income := r.ti;
    total_expense := r.te;
    balance := r.bal;
    transaction_count := r.cnt;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- ---------- Procedure: criar transferência entre contas ----------
CREATE OR REPLACE FUNCTION create_transfer(
  p_tenant_id TEXT,
  p_from_account_id TEXT,
  p_to_account_id TEXT,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'Transferência entre contas',
  p_transaction_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE (out_id TEXT, in_id TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_out_id TEXT;
  v_in_id TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor da transferência deve ser positivo';
  END IF;
  IF p_from_account_id = p_to_account_id THEN
    RAISE EXCEPTION 'Conta origem e destino devem ser diferentes';
  END IF;

  v_out_id := gen_random_uuid()::TEXT;
  v_in_id  := gen_random_uuid()::TEXT;

  INSERT INTO "Transaction" (id, "tenantId", "accountId", amount, type, description, date, "transferPairId", "createdAt", "updatedAt")
  VALUES (v_out_id, p_tenant_id, p_from_account_id, (-1) * p_amount, 'TRANSFER', COALESCE(p_description, 'Transferência'), p_transaction_date, v_in_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  INSERT INTO "Transaction" (id, "tenantId", "accountId", amount, type, description, date, "transferPairId", "createdAt", "updatedAt")
  VALUES (v_in_id, p_tenant_id, p_to_account_id, p_amount, 'TRANSFER', COALESCE(p_description, 'Transferência'), p_transaction_date, v_out_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  out_id := v_out_id;
  in_id  := v_in_id;
  RETURN NEXT;
END;
$$;

-- ---------- Procedure: fechar conciliação ----------
CREATE OR REPLACE FUNCTION close_reconciliation(
  p_reconciliation_id TEXT,
  p_closing_balance DECIMAL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "Reconciliation"
  SET "closedAt" = CURRENT_TIMESTAMP, "closingBalance" = p_closing_balance, status = 'CLOSED', "updatedAt" = CURRENT_TIMESTAMP
  WHERE id = p_reconciliation_id AND status = 'OPEN';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conciliação % não encontrada ou já fechada', p_reconciliation_id;
  END IF;
END;
$$;

-- ---------- Procedure: gerar transações a partir de modelos recorrentes ----------
CREATE OR REPLACE FUNCTION run_recurring_templates_for_month(
  p_tenant_id TEXT,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  v_tx_date DATE;
  v_tx_id TEXT;
  v_count INTEGER := 0;
BEGIN
  FOR r IN
    SELECT rt.id, rt."accountId", rt."categoryId", rt."payeeId", rt.description, rt.amount, rt.type, rt."dayOfMonth", rt.recurrence
    FROM "RecurringTemplate" rt
    WHERE rt."tenantId" = p_tenant_id AND rt."isActive" = true
      AND rt."nextRunAt" <= (make_date(p_year, p_month, 1) + INTERVAL '1 month')::DATE
      AND rt.recurrence IN ('MONTHLY', 'QUARTERLY', 'YEARLY')
  LOOP
    v_tx_date := make_date(p_year, p_month, LEAST(r."dayOfMonth", 28));

    v_tx_id := gen_random_uuid()::TEXT;
    INSERT INTO "Transaction" (id, "tenantId", "accountId", "categoryId", "payeeId", amount, type, description, date, "createdAt", "updatedAt")
    VALUES (v_tx_id, p_tenant_id, r."accountId", r."categoryId", r."payeeId",
            CASE WHEN r.type = 'EXPENSE' THEN (-1) * r.amount ELSE r.amount END,
            r.type, r.description, v_tx_date::TIMESTAMP(3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    v_count := v_count + 1;

    UPDATE "RecurringTemplate"
    SET "nextRunAt" = CASE r.recurrence
      WHEN 'MONTHLY' THEN (v_tx_date + INTERVAL '1 month')::TIMESTAMP(3)
      WHEN 'QUARTERLY' THEN (v_tx_date + INTERVAL '3 months')::TIMESTAMP(3)
      WHEN 'YEARLY' THEN (v_tx_date + INTERVAL '1 year')::TIMESTAMP(3)
      ELSE "nextRunAt"
    END, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = r.id;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ---------- Function: saldo projetado ----------
CREATE OR REPLACE FUNCTION get_projected_balance(
  p_tenant_id TEXT,
  p_account_id TEXT,
  p_until_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (current_balance NUMERIC, pending_payable NUMERIC, pending_receivable NUMERIC, projected NUMERIC)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_balance NUMERIC;
  v_payable NUMERIC;
  v_receivable NUMERIC;
BEGIN
  SELECT COALESCE(balance, 0)::NUMERIC INTO v_balance FROM "Account" WHERE id = p_account_id AND "tenantId" = p_tenant_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0)::NUMERIC INTO v_payable
  FROM "Bill" WHERE "tenantId" = p_tenant_id AND ("accountId" = p_account_id OR "accountId" IS NULL)
    AND type = 'PAYABLE' AND status = 'PENDING' AND "dueDate" <= p_until_date;

  SELECT COALESCE(SUM(amount), 0)::NUMERIC INTO v_receivable
  FROM "Bill" WHERE "tenantId" = p_tenant_id AND ("accountId" = p_account_id OR "accountId" IS NULL)
    AND type = 'RECEIVABLE' AND status = 'PENDING' AND "dueDate" <= p_until_date;

  current_balance := v_balance;
  pending_payable := v_payable;
  pending_receivable := v_receivable;
  projected := v_balance - v_payable + v_receivable;
  RETURN NEXT;
END;
$$;

-- ---------- Procedure: marcar contas a pagar vencidas como OVERDUE ----------
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE "Bill"
    SET status = 'OVERDUE', "updatedAt" = CURRENT_TIMESTAMP
    WHERE status = 'PENDING' AND type = 'PAYABLE' AND "dueDate" < CURRENT_DATE
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_count FROM updated;
  RETURN v_count;
END;
$$;

-- ---------- Procedure: recontar saldo de uma conta (útil para correção) ----------
CREATE OR REPLACE FUNCTION recalc_account_balance(p_account_id TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_sum NUMERIC;
  v_open DECIMAL(15,2);
BEGIN
  SELECT "openingBalance" INTO v_open FROM "Account" WHERE id = p_account_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta % não encontrada', p_account_id;
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_sum FROM "Transaction" WHERE "accountId" = p_account_id;
  UPDATE "Account" SET balance = v_open + v_sum WHERE id = p_account_id;
END;
$$;

-- =============================================================================
-- FIM
-- =============================================================================
