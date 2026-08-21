import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAccount } from '../useAccount';
import { api } from '../../services/api';
import type { Account, ApiError } from '../../types/bank.types';

const mockInitialAccount: Account = {
  id: '1',
  ownerName: 'Felipe Martínez',
  ownerDocument: '1.234.567.890',
  accountNumber: '4521-****-****-7890',
  balance: 1_000_000,
  currency: 'COP',
  transactions: [
    {
      id: 'txn-01',
      type: 'DEPOSIT',
      amount: 1_000_000,
      date: '2026-08-20T10:00:00.000Z',
      description: 'Apertura de cuenta',
      balanceAfter: 1_000_000,
    },
  ],
};

describe('useAccount (Hook de Dominio de Cuenta Bancaria)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('obtiene y establece los datos iniciales de la cuenta al montar el hook (GET /accounts/:id)', async () => {
    vi.spyOn(api, 'getAccount').mockResolvedValue(mockInitialAccount);

    const { result } = renderHook(() => useAccount('1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.account).toEqual(mockInitialAccount);
    expect(result.current.error).toBeNull();
    expect(api.getAccount).toHaveBeenCalledWith('1');
  });

  it('si la carga inicial falla, puebla error con ApiError y account queda en null', async () => {
    const mockError: ApiError = {
      statusCode: 500,
      message: 'No se pudo establecer conexión con el servidor bancario (Error de red).',
    };
    vi.spyOn(api, 'getAccount').mockRejectedValue(mockError);

    const { result } = renderHook(() => useAccount('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.account).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('aplica actualización optimista inmediata en depósito y sincroniza con la respuesta del servidor', async () => {
    vi.spyOn(api, 'getAccount').mockResolvedValue(mockInitialAccount);

    const serverUpdatedAccount: Account = {
      ...mockInitialAccount,
      balance: 1_500_000,
      transactions: [
        {
          id: 'server-txn-1',
          type: 'DEPOSIT',
          amount: 500_000,
          date: '2026-08-20T12:00:00.000Z',
          description: 'Consignación en cuenta',
          balanceAfter: 1_500_000,
        },
        ...mockInitialAccount.transactions,
      ],
    };

    let resolveDeposit!: (val: Account) => void;
    vi.spyOn(api, 'deposit').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDeposit = resolve;
        })
    );

    const { result } = renderHook(() => useAccount('1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Execute deposit
    let depositPromise: Promise<void>;
    act(() => {
      depositPromise = result.current.deposit(500_000);
    });

    // 1. Verify IMMEDIATE optimistic update in UI
    expect(result.current.account?.balance).toBe(1_500_000);
    expect(result.current.account?.transactions[0].amount).toBe(500_000);
    expect(result.current.isMutating).toBe(true);

    // 2. Server responds 200 OK
    await act(async () => {
      resolveDeposit(serverUpdatedAccount);
      await depositPromise;
    });

    expect(result.current.account).toEqual(serverUpdatedAccount);
    expect(result.current.isMutating).toBe(false);
  });

  it('aplica actualización optimista inmediata en retiro y sincroniza con la respuesta del servidor', async () => {
    vi.spyOn(api, 'getAccount').mockResolvedValue(mockInitialAccount);

    const serverUpdatedAccount: Account = {
      ...mockInitialAccount,
      balance: 800_000,
      transactions: [
        {
          id: 'server-txn-2',
          type: 'WITHDRAWAL',
          amount: 200_000,
          date: '2026-08-20T12:30:00.000Z',
          description: 'Retiro de fondos',
          balanceAfter: 800_000,
        },
        ...mockInitialAccount.transactions,
      ],
    };

    vi.spyOn(api, 'withdraw').mockResolvedValue(serverUpdatedAccount);

    const { result } = renderHook(() => useAccount('1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.withdraw(200_000);
    });

    expect(result.current.account?.balance).toBe(800_000);
    expect(result.current.account?.transactions).toHaveLength(2);
  });

  it('ejecuta rollback automático al snapshot previo si la llamada a la API de depósito falla', async () => {
    vi.spyOn(api, 'getAccount').mockResolvedValue(mockInitialAccount);

    const apiError: ApiError = {
      statusCode: 500,
      message: 'Fallo interno en el procesador de pagos.',
    };
    vi.spyOn(api, 'deposit').mockRejectedValue(apiError);

    const { result } = renderHook(() => useAccount('1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const initialBalance = result.current.account?.balance;
    const initialTxnCount = result.current.account?.transactions.length;

    await act(async () => {
      try {
        await result.current.deposit(300_000);
      } catch (err) {
        expect(err).toEqual(apiError);
      }
    });

    // ROLLBACK: Balance and transactions must have reverted to the prior snapshot
    expect(result.current.account?.balance).toBe(initialBalance);
    expect(result.current.account?.transactions.length).toBe(initialTxnCount);
    expect(result.current.isMutating).toBe(false);
  });

  it('ejecuta rollback automático al snapshot previo si la llamada a la API de retiro falla', async () => {
    vi.spyOn(api, 'getAccount').mockResolvedValue(mockInitialAccount);

    const apiError: ApiError = {
      statusCode: 422,
      message: 'Saldo insuficiente o cuenta bloqueada.',
    };
    vi.spyOn(api, 'withdraw').mockRejectedValue(apiError);

    const { result } = renderHook(() => useAccount('1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const initialBalance = result.current.account?.balance;

    await act(async () => {
      try {
        await result.current.withdraw(700_000);
      } catch (err) {
        expect(err).toEqual(apiError);
      }
    });

    // ROLLBACK: Balance restored to the exact value prior to the attempt
    expect(result.current.account?.balance).toBe(initialBalance);
    expect(result.current.isMutating).toBe(false);
  });

  it('propaga el ApiError normalizado al consumidor cuando la operación es rechazada', async () => {
    vi.spyOn(api, 'getAccount').mockResolvedValue(mockInitialAccount);

    const customError: ApiError = {
      statusCode: 400,
      message: 'El monto ingresado es inválido para el canal electrónico.',
    };
    vi.spyOn(api, 'deposit').mockRejectedValue(customError);

    const { result } = renderHook(() => useAccount('1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.deposit(100_000);
      })
    ).rejects.toEqual(customError);
  });
});
