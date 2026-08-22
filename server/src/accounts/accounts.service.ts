import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la cuenta por su ID junto con el historial ordenado de transacciones.
   */
  async getAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
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

  private async getAccountWithTx(tx: any, accountId: string) {
    const account = await tx.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return this.mapToResponse(account);
  }

  /**
   * Formatea los datos de Prisma a la interfaz exacta que espera el Frontend React.
   */
  private mapToResponse(account: any) {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      holderName: account.holderName,
      balance: Number(account.balance),
      type: account.type,
      transactions: account.transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        date: t.createdAt.toISOString(),
        description: t.description,
        balanceAfter: Number(t.balanceAfter),
      })),
    };
  }
}