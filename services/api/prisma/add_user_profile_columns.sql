-- =============================================================================
-- Adiciona colunas de perfil na tabela User (monthlyIncome, financialGoal, birthYear)
-- Use se o login falhar com: "The column User.monthlyincome does not exist"
--
-- Como executar no Supabase:
--   Dashboard > SQL Editor > New query > colar este arquivo > Run
-- =============================================================================

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "monthlyIncome" DECIMAL(12,2);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "financialGoal" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "birthYear" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
