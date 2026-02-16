-- HB Finance - Triggers e Procedures (PostgreSQL)

-- ========== Função: atualizar "updatedAt" ==========
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== Triggers updatedAt ==========
DROP TRIGGER IF EXISTS trg_tenant_updated_at ON "Tenant";
CREATE TRIGGER trg_tenant_updated_at
  BEFORE UPDATE ON "Tenant"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_user_updated_at ON "User";
CREATE TRIGGER trg_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_account_updated_at ON "Account";
CREATE TRIGGER trg_account_updated_at
  BEFORE UPDATE ON "Account"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_category_updated_at ON "Category";
CREATE TRIGGER trg_category_updated_at
  BEFORE UPDATE ON "Category"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_transaction_updated_at ON "Transaction";
CREATE TRIGGER trg_transaction_updated_at
  BEFORE UPDATE ON "Transaction"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_bill_updated_at ON "Bill";
CREATE TRIGGER trg_bill_updated_at
  BEFORE UPDATE ON "Bill"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_budget_updated_at ON "Budget";
CREATE TRIGGER trg_budget_updated_at
  BEFORE UPDATE ON "Budget"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_notification_preference_updated_at ON "NotificationPreference";
CREATE TRIGGER trg_notification_preference_updated_at
  BEFORE UPDATE ON "NotificationPreference"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Novas tabelas (Payee, Tag, RecurringTemplate, Reconciliation)
DROP TRIGGER IF EXISTS trg_payee_updated_at ON "Payee";
CREATE TRIGGER trg_payee_updated_at BEFORE UPDATE ON "Payee" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS trg_tag_updated_at ON "Tag";
CREATE TRIGGER trg_tag_updated_at BEFORE UPDATE ON "Tag" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS trg_recurring_template_updated_at ON "RecurringTemplate";
CREATE TRIGGER trg_recurring_template_updated_at BEFORE UPDATE ON "RecurringTemplate" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS trg_reconciliation_updated_at ON "Reconciliation";
CREATE TRIGGER trg_reconciliation_updated_at BEFORE UPDATE ON "Reconciliation" FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== Função + Trigger: saldo da conta (Transaction) ==========
-- amount: positivo = entrada, negativo = saída
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

DROP TRIGGER IF EXISTS trg_transaction_sync_balance ON "Transaction";
CREATE TRIGGER trg_transaction_sync_balance
  AFTER INSERT OR UPDATE OR DELETE ON "Transaction"
  FOR EACH ROW EXECUTE PROCEDURE sync_account_balance_on_transaction();

-- ========== Function: criar transação a partir de conta paga/recebida (chame: SELECT create_transaction_from_bill(...)) ==========
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

-- ========== Function: resumo por período (dashboard) ==========
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

-- ========== Procedure: criar transferência entre contas (duas transações vinculadas) ==========
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

-- ========== Procedure: fechar conciliação (atualiza saldo e status) ==========
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

-- ========== Procedure: gerar transações a partir de modelos recorrentes (para um mês) ==========
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

-- ========== Function: saldo projetado (considerando contas a pagar/receber até uma data) ==========
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
  r RECORD;
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
