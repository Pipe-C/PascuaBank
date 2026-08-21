import { useState, useEffect, useCallback, useRef } from 'react';
import type { Account, ApiError, Transaction } from '../types/bank.types';
import { api } from '../services/api';

export interface UseAccountReturn {
  account: Account | null;
  isLoading: boolean;
  isMutating: boolean;
  error: ApiError | null;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  refreshAccount: () => Promise<void>;
}

export function useAccount(accountId: string = '1'): UseAccountReturn {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Keep an updated reference of current state for safe atomic rollbacks
  const accountRef = useRef<Account | null>(null);
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  const fetchAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getAccount(accountId);
      setAccount(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccount();
  }, [fetchAccount]);

  const deposit = async (amount: number): Promise<void> => {
    const currentAccount = accountRef.current;
    if (!currentAccount) {
      throw { statusCode: 500, message: 'No hay una cuenta cargada para operar.' } as ApiError;
    }

    // 1. Snapshot for rollback
    const snapshot = { ...currentAccount, transactions: [...currentAccount.transactions] };

    // 2. Optimistic UI update
    const optimisticBalance = currentAccount.balance + amount;
    const optimisticTxn: Transaction = {
      id: `temp-${Date.now()}`,
      type: 'DEPOSIT',
      amount,
      date: new Date().toISOString(),
      description: 'Consignación en cuenta',
      balanceAfter: optimisticBalance,
    };

    setAccount({
      ...currentAccount,
      balance: optimisticBalance,
      transactions: [optimisticTxn, ...currentAccount.transactions],
    });

    try {
      setIsMutating(true);
      // 3. HTTP API request
      const updatedServerAccount = await api.deposit(accountId, amount);
      // 4. Synchronization with server response
      setAccount(updatedServerAccount);
    } catch (err) {
      // 5. IMMEDIATE ROLLBACK to snapshot on failure
      setAccount(snapshot);
      throw err as ApiError;
    } finally {
      setIsMutating(false);
    }
  };

  const withdraw = async (amount: number): Promise<void> => {
    const currentAccount = accountRef.current;
    if (!currentAccount) {
      throw { statusCode: 500, message: 'No hay una cuenta cargada para operar.' } as ApiError;
    }

    // 1. Snapshot for rollback
    const snapshot = { ...currentAccount, transactions: [...currentAccount.transactions] };

    // 2. Optimistic UI update
    const optimisticBalance = currentAccount.balance - amount;
    const optimisticTxn: Transaction = {
      id: `temp-${Date.now()}`,
      type: 'WITHDRAWAL',
      amount,
      date: new Date().toISOString(),
      description: 'Retiro de fondos',
      balanceAfter: optimisticBalance,
    };

    setAccount({
      ...currentAccount,
      balance: optimisticBalance,
      transactions: [optimisticTxn, ...currentAccount.transactions],
    });

    try {
      setIsMutating(true);
      // 3. HTTP API request
      const updatedServerAccount = await api.withdraw(accountId, amount);
      // 4. Synchronization with server response
      setAccount(updatedServerAccount);
    } catch (err) {
      // 5. IMMEDIATE ROLLBACK to snapshot on failure
      setAccount(snapshot);
      throw err as ApiError;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    account,
    isLoading,
    isMutating,
    error,
    deposit,
    withdraw,
    refreshAccount: fetchAccount,
  };
}
