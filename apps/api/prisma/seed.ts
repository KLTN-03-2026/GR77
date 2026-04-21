import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:dtnt135712@localhost:5433/kindlink"

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed process...')

  // ================= ADMIN ACCOUNTS =================
  const commonPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin123';
  const hashedPassword = await bcrypt.hash(commonPassword, 10);

  const adminUsers = [
    {
      email: 'superadmin@kindlink.com',
      username: 'SuperAdmin',
      role: 'SUPER_ADMIN',
      permissions: [],
    },
    {
      email: 'admin_campaign@kindlink.com',
      username: 'CampaignManager',
      role: 'ADMIN',
      permissions: ['CAMPAIGNS_VIEW', 'CAMPAIGNS_APPROVE', 'CATEGORIES_MANAGE'],
    },
    {
      email: 'admin_finance@kindlink.com',
      username: 'FinanceOfficer',
      role: 'ADMIN',
      permissions: ['TRANSACTIONS_VIEW', 'WITHDRAWALS_APPROVE', 'REVENUE_VIEW'],
    },
  ];

  console.log('Seeding admin accounts...');
  for (const u of adminUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role as any,
        permissions: u.permissions as any,
        password: hashedPassword,
      },
      create: {
        email: u.email,
        username: u.username,
        password: hashedPassword,
        role: u.role as any,
        permissions: u.permissions as any,
        isVerified: true,
      },
    });
    console.log(`Seeded account: ${u.email} [${u.role}]`);
  }

  // ================= CATEGORIES =================
  const categories = [
    { name: 'Y tế', slug: 'y-te' },
    { name: 'Giáo dục', slug: 'giao-duc' },
    { name: 'Trẻ mồ côi', slug: 'tre-mo-coi' },
    { name: 'Thiên tai', slug: 'thien-tai' },
    { name: 'Hỏa hoạn', slug: 'hoa-hoan' },
    { name: 'Môi trường', slug: 'moi-truong' },
  ];

  console.log('Seeding categories...');
  for (const cat of categories) {
    await (prisma as any).campaignCategory.upsert({
      where: { name: cat.name },
      update: {
        slug: cat.slug
      },
      create: {
        name: cat.name,
        slug: cat.slug
      },
    });
  }

  console.log('Seeded categories successfully')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
    console.log('Seed process finished.')
  })