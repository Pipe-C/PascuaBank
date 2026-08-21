import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionForm } from '../useTransactionForm';
import type { ChangeEvent } from 'react';

function createChangeEvent(value: string): ChangeEvent<HTMLInputElement> {
  return {
    target: { value },
  } as ChangeEvent<HTMLInputElement>;
}

describe('useTransactionForm (Hook de Validación de Transacciones)', () => {
  const defaultBalance = 1_000_000;

  it('inicia en estado prístino con isValid=false, error=null, displayValue="" y isTouched=false', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
      })
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.displayValue).toBe('');
    expect(result.current.numericValue).toBeNull();
    expect(result.current.isTouched).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('bloquea caracteres no numéricos y extrae únicamente dígitos en handleChange', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('abc$100.000xyz'));
    });

    expect(result.current.numericValue).toBe(100000);
    expect(result.current.displayValue).toBe('100.000');
  });

  it('muestra error de campo vacío al desenfocar el input (onBlur)', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
      })
    );

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.isTouched).toBe(true);
    expect(result.current.error).toBe('Ingresa un monto para realizar la operación.');
    expect(result.current.isValid).toBe(false);
  });

  it('muestra error cuando el monto ingresado es menor o igual a cero', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('0'));
    });

    expect(result.current.error).toBe('El monto debe ser mayor a cero.');
    expect(result.current.isValid).toBe(false);
  });

  it('muestra error de saldo insuficiente en retiros si monto > currentBalance', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'WITHDRAWAL',
        currentBalance: 500_000,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('600000'));
    });

    expect(result.current.error).toMatch(/No tienes saldo suficiente/);
    expect(result.current.isValid).toBe(false);
  });

  it('marca isValid=true y error=null cuando se ingresa un monto válido de depósito', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('250000'));
    });

    expect(result.current.numericValue).toBe(250000);
    expect(result.current.displayValue).toBe('250.000');
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it('marca isValid=true cuando se ingresa un monto válido de retiro (menor o igual a currentBalance)', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'WITHDRAWAL',
        currentBalance: 500_000,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('500000'));
    });

    expect(result.current.numericValue).toBe(500000);
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it('revalida en tiempo real (onChange) y limpia el error inmediatamente si el campo ya fue touched y el nuevo valor es válido', () => {
    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
      })
    );

    // 1. Touch empty field to trigger error
    act(() => {
      result.current.handleBlur();
    });
    expect(result.current.error).toBe('Ingresa un monto para realizar la operación.');

    // 2. Type valid value -> clears error instantly
    act(() => {
      result.current.handleChange(createChangeEvent('50000'));
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it('ejecuta onSubmit con el valor numérico puro y gestiona isLoading mientras la promesa resuelve', async () => {
    let resolveSubmit!: () => void;
    const mockSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('100000'));
    });

    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    // isLoading must be active while the promise has not resolved
    expect(result.current.isLoading).toBe(true);
    expect(mockSubmit).toHaveBeenCalledWith(100000, 'DEPOSIT');

    // Resolve the promise
    await act(async () => {
      resolveSubmit();
      await submitPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('limpia el formulario automáticamente (resetForm) tras un submit exitoso', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useTransactionForm({
        type: 'DEPOSIT',
        currentBalance: defaultBalance,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.handleChange(createChangeEvent('150000'));
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.displayValue).toBe('');
    expect(result.current.numericValue).toBeNull();
    expect(result.current.isValid).toBe(false);
  });
});
