import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- LATEST DONATIONS ---');
    const donations = await prisma.donation.findMany({
        orderBy: { donatedAt: 'desc' },
        take: 5,
        include: {
            campaign: { select: { title: true } },
            user: { select: { email: true } }
        }
    });

    console.log(JSON.stringify(donations, null, 2));

    console.log('\n--- LATEST WALLET TRANSACTIONS ---');
    const walletTxs = await prisma.walletTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(walletTxs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
