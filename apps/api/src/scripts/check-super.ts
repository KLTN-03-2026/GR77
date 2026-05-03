import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const supers = await prisma.user.findMany({
        where: {
            role: 'SUPER_ADMIN'
        },
        select: {
            email: true,
            username: true,
            role: true
        }
    });
    console.log('--- DANH SÁCH SUPER ADMIN ---');
    console.log(JSON.stringify(supers, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
