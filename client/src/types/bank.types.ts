// Centralized domain types — do not duplicate inside individual components

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO 8601 string
  description: string;
  balanceAfter: number;
}

export interface Account {
  id: string;
  ownerName: string;
  ownerDocument: string; // National ID number
  accountNumber: string;
  balance: number;
  currency: string; // e.g. 'COP'
  transactions: Transaction[];
}

export interface ApiError {
  statusCode: number;
  message: string;
}
