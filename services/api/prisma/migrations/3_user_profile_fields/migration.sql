DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "monthlyIncome" DECIMAL(12,2);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "financialGoal" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "birthYear" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
