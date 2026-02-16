-- Cupom de desenvolvimento: PRO gratuito, uso ilimitado.
-- Execute no SQL Editor do Supabase (ou após full_database.sql) para criar o cupom HBDEVBJJ.
INSERT INTO "Coupon" (id, code, "planGranted", "expirationDate", "usageLimit", "usedCount", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'HBDEVBJJ',
  'PRO',
  NULL,
  NULL,
  0,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (code) DO UPDATE SET
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
