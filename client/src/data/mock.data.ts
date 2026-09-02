import type { Account } from '../types/bank.types';

// Static mock account data that simulates the response of GET /accounts/:id
// Used during decoupled local frontend development
export const MOCK_ACCOUNT: Account = {
  id: '1',
  ownerName: 'Felipe Martínez',
  ownerDocument: '1.234.567.890',
  accountNumber: '4521-****-****-7890',
  balance: 4_850_000,
  currency: 'COP',
  transactions: [
    {
      id: 'txn-001',
      type: 'DEPOSIT',
      amount: 500_000,
      date: '2026-08-20T18:30:00.000Z',
      description: 'Consignación nacional',
      balanceAfter: 4_850_000,
    },
    {
      id: 'txn-002',
      type: 'WITHDRAWAL',
      amount: 200_000,
      date: '2026-08-19T10:15:00.000Z',
      description: 'Retiro cajero automático',
      balanceAfter: 4_350_000,
    },
    {
      id: 'txn-003',
      type: 'DEPOSIT',
      amount: 1_200_000,
      date: '2026-08-15T09:00:00.000Z',
      description: 'Nómina agosto',
      balanceAfter: 4_550_000,
    },
    {
      id: 'txn-004',
      type: 'WITHDRAWAL',
      amount: 75_000,
      date: '2026-08-12T14:45:00.000Z',
      description: 'Pago servicio de internet',
      balanceAfter: 3_350_000,
    },
    {
      id: 'txn-005',
      type: 'DEPOSIT',
      amount: 300_000,
      date: '2026-08-08T11:20:00.000Z',
      description: 'Transferencia recibida',
      balanceAfter: 3_425_000,
    },
  ],
};
