import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { TransactionType } from '../../types/bank.types';

export interface TransactionFormConfigItem {
  label: string;
  sublabel: string;
  icon: typeof ArrowDownLeft;
  iconColor: string;
  iconBg: string;
  buttonId: string;
  inputId: string;
  errorId: string;
  buttonBg: string;
  buttonShadow: string;
  buttonRing: string;
}

export const TRANSACTION_FORM_CONFIG: Record<TransactionType, TransactionFormConfigItem> = {
  DEPOSIT: {
    label: 'Consignar',
    sublabel: 'Ingresa el monto a depositar',
    icon: ArrowDownLeft,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    buttonId: 'btn-deposit',
    inputId: 'input-deposit-amount',
    errorId: 'error-deposit-amount',
    buttonBg: 'var(--btn-deposit-bg)',
    buttonShadow: 'var(--btn-deposit-shadow)',
    buttonRing: 'ring-emerald-500/30',
  },
  WITHDRAWAL: {
    label: 'Retirar',
    sublabel: 'Ingresa el monto a retirar',
    icon: ArrowUpRight,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    buttonId: 'btn-withdraw',
    inputId: 'input-withdraw-amount',
    errorId: 'error-withdraw-amount',
    buttonBg: 'var(--btn-withdraw-bg)',
    buttonShadow: 'var(--btn-withdraw-shadow)',
    buttonRing: 'ring-rose-500/30',
  },
} as const;
