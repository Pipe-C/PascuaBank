import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();

  const account = await prisma.account.create({
    data: {
      id: 'acc-123',
      accountNumber: '100200300',
      holderName: 'Usuario PascuaBank',
      balance: 1500000.00,
      type: AccountType.SAVINGS,
      transactions: {
        create: [
          {
            amount: 1500000.00,
            type: 'DEPOSIT',
            description: 'Depósito inicial de apertura',
            balanceAfter: 1500000.00,
          },
        ],
      },
    },
  });

  console.log('🌱 Seed completado exitosamente. Cuenta de prueba:', account.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });