/**
 * Seed: cria tenant padrão + usuário admin para desenvolvimento/demo.
 * Uso: npx prisma db seed (ou npm run db:seed no workspace services/api)
 *
 * Credenciais padrão admin:
 *   E-mail: admin@hbfinance.com
 *   Senha:  Admin@123
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@hbfinance.com';
const ADMIN_PASSWORD = 'Admin@123';
const TENANT_SLUG = 'hb-finance-default';

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      name: 'HB Finance (Padrão)',
      slug: TENANT_SLUG,
      type: 'PERSONAL',
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: 'Administrador',
      role: 'SUPERADMIN',
      tenantId: tenant.id,
    },
  });

  // Cupom de desenvolvimento: PRO gratuito, uso ilimitado
  await prisma.coupon.upsert({
    where: { code: 'HBDEVBJJ' },
    update: { isActive: true },
    create: {
      code: 'HBDEVBJJ',
      planGranted: 'PRO',
      expirationDate: null,
      usageLimit: null,
      usedCount: 0,
      isActive: true,
    },
  });

  console.log('Seed concluído. Admin:', ADMIN_EMAIL, '| Senha:', ADMIN_PASSWORD);
  console.log('Cupom dev PRO (ilimitado): HBDEVBJJ');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
