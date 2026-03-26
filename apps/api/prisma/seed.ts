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

  // ================= ADMIN USER =================
  const adminEmail = 'admin@kindlink.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || '123456';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
    },
    create: {
      email: adminEmail,
      username: 'Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

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