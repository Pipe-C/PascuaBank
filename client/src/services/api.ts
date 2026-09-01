import axios, { AxiosError } from 'axios';
import type { Account, ApiError, Transaction } from '../types/bank.types';
import { MOCK_ACCOUNT } from '../data/mock.data';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Centralized Axios client instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

/**
 * Normalizes any network or HTTP API error into a standardized ApiError contract.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>;
    const status = axiosError.response?.status || 500;
    const responseData = axiosError.response?.data;

    let message = 'Ocurrió un error inesperado al comunicarse con el banco.';

    if (responseData?.message) {
      if (Array.isArray(responseData.message)) {
        message = responseData.message.join(', ');
      } else {
        message = responseData.message;
      }
    } else if (axiosError.code === 'ERR_NETWORK') {
      message = 'No se pudo establecer conexión con el servidor bancario (Error de red).';
    } else if (status === 404) {
      message = 'La cuenta bancaria solicitada no fue encontrada.';
    } else if (status === 400 || status === 422) {
      message = responseData?.error || 'Datos de la transacción inválidos o saldo insuficiente.';
    }

    return {
      statusCode: status,
      message,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Error desconocido en la operación bancaria.',
  };
}

// In-memory mutable store for explicit development mock mode
let mockStore: Account = JSON.parse(JSON.stringify(MOCK_ACCOUNT));

/**
 * PascuaBank Data Access Layer.
 */
export const api = {
  /**
   * Fetches account data and transaction history by ID.
   * GET /accounts/:id
   */
  async getAccount(accountId: string): Promise<Account> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return JSON.parse(JSON.stringify(mockStore));
    }

    try {
      const response = await apiClient.get<Account>(`/accounts/${accountId}`);
      return response.data;

    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * Executes a deposit transaction on the specified account.
   * POST /accounts/:id/deposit -> { amount: number }
   */
  async deposit(accountId: string, amount: number): Promise<Account> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const newBalance = mockStore.balance + amount;
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        type: 'DEPOSIT',
        amount,
        date: new Date().toISOString(),
        description: 'Consignación en cuenta',
        balanceAfter: newBalance,
      };

      mockStore = {
        ...mockStore,
        balance: newBalance,
        transactions: [newTxn, ...mockStore.transactions],
      };
      return JSON.parse(JSON.stringify(mockStore));
    }

    try {
      const response = await apiClient.post<Account>(`/accounts/${accountId}/deposit`, {
        amount,
      });
      return response.data;

    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * Executes a withdrawal transaction on the specified account.
   * POST /accounts/:id/withdraw -> { amount: number }
   */
  async withdraw(accountId: string, amount: number): Promise<Account> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (amount > mockStore.balance) {
        const err: ApiError = {
          statusCode: 422,
          message: 'Saldo insuficiente para completar el retiro.',
        };
        throw err;
      }

      const newBalance = mockStore.balance - amount;
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        type: 'WITHDRAWAL',
        amount,
        date: new Date().toISOString(),
        description: 'Retiro de fondos',
        balanceAfter: newBalance,
      };

      mockStore = {
        ...mockStore,
        balance: newBalance,
        transactions: [newTxn, ...mockStore.transactions],
      };
      return JSON.parse(JSON.stringify(mockStore));
    }

    try {
      const response = await apiClient.post<Account>(`/accounts/${accountId}/withdraw`, {
        amount,
      });
      return response.data;
 
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
