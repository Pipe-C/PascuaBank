import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import type { TransactionType } from '../types/bank.types';
import { formatCurrency } from '../utils/formatCurrency';

export interface UseTransactionFormProps {
  type: TransactionType;
  currentBalance: number;
  onSubmit?: (amount: number, type: TransactionType) => Promise<void> | void;
}

export interface UseTransactionFormReturn {
  displayValue: string;
  numericValue: number | null;
  error: string | null;
  isTouched: boolean;
  isValid: boolean;
  isLoading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  resetForm: () => void;
}

/** Formats a digits-only string with es-CO thousands separators */
function formatNumberInput(digits: string): string {
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-CO').format(num);
}

export function useTransactionForm({
  type,
  currentBalance,
  onSubmit,
}: UseTransactionFormProps): UseTransactionFormReturn {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [numericValue, setNumericValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pure business rule validation function
  const validateAmount = useCallback(
    (value: number | null): string | null => {
      if (value === null || value === undefined) {
        return 'Ingresa un monto para realizar la operación.';
      }
      if (value <= 0) {
        return 'El monto debe ser mayor a cero.';
      }
      if (type === 'WITHDRAWAL' && value > currentBalance) {
        return `No tienes saldo suficiente. Tu saldo disponible es ${formatCurrency(currentBalance)}.`;
      }
      return null;
    },
    [type, currentBalance]
  );

  // Reactively revalidate if balance changes externally
  useEffect(() => {
    if (numericValue !== null) {
      setError(validateAmount(numericValue));
    }
  }, [currentBalance, numericValue, validateAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Strict sanitization: only numeric digits
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!digitsOnly) {
      setNumericValue(null);
      setDisplayValue('');
      if (isTouched) {
        setError('Ingresa un monto para realizar la operación.');
      } else {
        setError(null);
      }
      return;
    }

    const parsed = parseInt(digitsOnly, 10);
    setNumericValue(parsed);
    setDisplayValue(formatNumberInput(digitsOnly));

    // Immediate revalidation
    const validationError = validateAmount(parsed);
    setError(validationError);
  };

  const handleBlur = () => {
    setIsTouched(true);
    setError(validateAmount(numericValue));
  };

  const resetForm = useCallback(() => {
    setDisplayValue('');
    setNumericValue(null);
    setError(null);
    setIsTouched(false);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTouched(true);

    const validationError = validateAmount(numericValue);
    setError(validationError);

    if (validationError !== null || numericValue === null || isLoading) {
      return;
    }

    if (onSubmit) {
      try {
        setIsLoading(true);
        // Exclusively await the promise from the received callback
        await onSubmit(numericValue, type);
        resetForm();
      } catch (err) {
        // In case onSubmit throws an unhandled error
        setError('Ocurrió un error al procesar la operación.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      resetForm();
    }
  };

  const isValid = numericValue !== null && numericValue > 0 && error === null;

  return {
    displayValue,
    numericValue,
    error,
    isTouched,
    isValid,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
