import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

// Apunta al archivo dev.db en la raíz de 'server'
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();

  const account = await prisma.account.create({
    data: {
      id: '1',
      accountNumber: '100200300',
      ownerName: 'Usuario PascuaBank',
      ownerDocument: '123456789',
      currency: 'COP',
      balance: 1500000.0,
      type: 'SAVINGS',
      transactions: {
        create: [
          {
            amount: 1500000.0,
            type: 'DEPOSIT',
            description: 'Depósito inicial de apertura',
            balanceAfter: 1500000.0,
            date: new Date(),
          },
        ],
      },
    },
  });

  console.log(' Seed completado exitosamente. Cuenta de prueba:', account.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });