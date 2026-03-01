import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = "postgresql://postgres:dtnt135712@localhost:5433/kindlink"

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@kindlink.com',
      username: 'Admin',
      password: '123456',
      role: 'ADMIN',
    },
  })

  console.log('Seeded successfully')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
