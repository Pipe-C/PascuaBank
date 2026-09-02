import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TransactionType } from '@prisma/client';

// Tipo fuertemente tipado para la cuenta incluyendo la relación con transacciones
type AccountWithTransactions = Prisma.AccountGetPayload<{
  include: { transactions: true };
}>;

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://pascuabank:pascuabank_dev_only@localhost:5432/pascuabank?schema=public';

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Obtiene la cuenta por su ID junto con el historial ordenado de transacciones.
   */
  async getAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('La cuenta bancaria solicitada no fue encontrada.');
    }

    return this.mapToResponse(account);
  }

  /**
   * Ejecuta una consignación (depósito) atómica en la cuenta.
   */
  async deposit(accountId: string, amount: number) {
    return await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException('La cuenta bancaria solicitada no fue encontrada.');
      }

      const currentBalance = Number(account.balance);
      const newBalance = currentBalance + amount;

      // Actualizar balance
      await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });

      // Crear registro de transacción
      await tx.transaction.create({
        data: {
          accountId,
          amount,
          type: TransactionType.DEPOSIT,
          description: 'Consignación en cuenta',
          balanceAfter: newBalance,
        },
      });

      // Retornar estado actualizado
      return this.getAccountWithTx(tx, accountId);
    });
  }

  /**
   * Ejecuta un retiro atómico en la cuenta validando saldo disponible.
   */
  async withdraw(accountId: string, amount: number) {
    return await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException('La cuenta bancaria solicitada no fue encontrada.');
      }

      const currentBalance = Number(account.balance);

      // Regla de Negocio: Validación de fondos (Código HTTP 422 Unprocessable Entity)
      if (amount > currentBalance) {
        throw new UnprocessableEntityException('Saldo insuficiente para completar el retiro.');
      }

      const newBalance = currentBalance - amount;

      // Actualizar balance
      await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });

      // Crear registro de transacción
      await tx.transaction.create({
        data: {
          accountId,
          amount,
          type: TransactionType.WITHDRAWAL,
          description: 'Retiro de fondos',
          balanceAfter: newBalance,
        },
      });

      return this.getAccountWithTx(tx, accountId);
    });
  }

  private async getAccountWithTx(tx: Prisma.TransactionClient, accountId: string) {
    const account = await tx.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('La cuenta bancaria solicitada no fue encontrada.');
    }

    return this.mapToResponse(account);
  }

  /**
   * Formatea los datos de Prisma a la interfaz exacta que espera el Frontend React.
   */
  private mapToResponse(account: AccountWithTransactions) {
    return {
      id: account.id,
      ownerName: account.ownerName,
      ownerDocument: account.ownerDocument,
      accountNumber: account.accountNumber,
      balance: Number(account.balance),
      currency: account.currency,
      type: account.type,
      transactions: account.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        date: t.date ? t.date.toISOString() : new Date().toISOString(),
        description: t.description,
        balanceAfter: Number(t.balanceAfter),
      })),
    };
  }
}