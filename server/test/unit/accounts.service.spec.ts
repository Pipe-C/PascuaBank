import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

describe('AccountsService', () => {
  let service: AccountsService;

  const mockAccount = {
    id: 'acc-123',
    accountNumber: '100200300',
    ownerName: 'Juan Pérez',
    ownerDocument: '123456789',
    currency: 'COP',
    balance: 50000.0,
    type: 'SAVINGS',
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    transactions: [
      {
        id: 'txn-1',
        accountId: 'acc-123',
        type: TransactionType.DEPOSIT,
        amount: 50000.0,
        description: 'Consignación inicial',
        balanceAfter: 50000.0,
        date: new Date('2026-01-01T10:00:00.000Z'),
      },
    ],
  };

  const mockPrismaService = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(
      (callback: (tx: typeof mockPrismaService) => unknown) => callback(mockPrismaService),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);

    jest.clearAllMocks();
  });

  describe('getAccount', () => {
    it('debe retornar la cuenta e historial de transacciones si existe', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await service.getAccount('acc-123');

      expect(result).toEqual({
        id: 'acc-123',
        accountNumber: '100200300',
        ownerName: 'Juan Pérez',
        ownerDocument: '123456789',
        currency: 'COP',
        balance: 50000.0,
        type: 'SAVINGS',
        transactions: [
          {
            id: 'txn-1',
            type: TransactionType.DEPOSIT,
            amount: 50000.0,
            date: '2026-01-01T10:00:00.000Z',
            description: 'Consignación inicial',
            balanceAfter: 50000.0,
          },
        ],
      });
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: 'acc-123' },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
          },
        },
      });
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(service.getAccount('acc-invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deposit', () => {
    it('debe incrementar el saldo y registrar la transacción con éxito', async () => {
      const initialAccount = { ...mockAccount, balance: 100.0 };
      const updatedAccount = {
        ...initialAccount,
        balance: 150.0,
        transactions: [
          {
            id: 'txn-2',
            accountId: 'acc-123',
            type: TransactionType.DEPOSIT,
            amount: 50.0,
            description: 'Consignación en cuenta',
            balanceAfter: 150.0,
            date: new Date('2026-01-02T10:00:00.000Z'),
          },
        ],
      };

      mockPrismaService.account.findUnique
        .mockResolvedValueOnce(initialAccount)
        .mockResolvedValueOnce(updatedAccount);

      const result = await service.deposit('acc-123', 50.0);

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-123' },
        data: { balance: 150.0 },
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          accountId: 'acc-123',
          amount: 50.0,
          type: TransactionType.DEPOSIT,
          description: 'Consignación en cuenta',
          balanceAfter: 150.0,
        },
      });
      expect(result.balance).toBe(150.0);
    });

    it('debe lanzar NotFoundException si la cuenta a depositar no existe', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);

      await expect(service.deposit('acc-invalid', 100.0)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('withdraw', () => {
    it('debe decrementar el saldo si hay fondos suficientes', async () => {
      const initialAccount = { ...mockAccount, balance: 500.0 };
      const updatedAccount = {
        ...initialAccount,
        balance: 300.0,
        transactions: [
          {
            id: 'txn-3',
            accountId: 'acc-123',
            type: TransactionType.WITHDRAWAL,
            amount: 200.0,
            description: 'Retiro de fondos',
            balanceAfter: 300.0,
            date: new Date('2026-01-03T10:00:00.000Z'),
          },
        ],
      };

      mockPrismaService.account.findUnique
        .mockResolvedValueOnce(initialAccount)
        .mockResolvedValueOnce(updatedAccount);

      const result = await service.withdraw('acc-123', 200.0);

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-123' },
        data: { balance: 300.0 },
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          accountId: 'acc-123',
          amount: 200.0,
          type: TransactionType.WITHDRAWAL,
          description: 'Retiro de fondos',
          balanceAfter: 300.0,
        },
      });
      expect(result.balance).toBe(300.0);
    });

    it('debe lanzar UnprocessableEntityException si el saldo es insuficiente', async () => {
      const lowBalanceAccount = { ...mockAccount, balance: 50.0 };
      mockPrismaService.account.findUnique.mockResolvedValue(lowBalanceAccount);

      await expect(service.withdraw('acc-123', 200.0)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});