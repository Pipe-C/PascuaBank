import { AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TransactionType } from '../../types/bank.types';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { TRANSACTION_FORM_CONFIG } from './transactionForm.config';

interface TransactionFormProps {
  type: TransactionType;
  currentBalance: number;
  onSubmit?: (amount: number, type: TransactionType) => Promise<void> | void;
}

export function TransactionForm({ type, currentBalance, onSubmit }: TransactionFormProps) {
  const cfg = TRANSACTION_FORM_CONFIG[type];
  const Icon = cfg.icon;

  const {
    displayValue,
    numericValue,
    error,
    isTouched,
    isValid,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useTransactionForm({
    type,
    currentBalance,
    onSubmit,
  });

  const showError = isTouched && !!error;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border p-5 backdrop-blur-sm transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      {/* Title & Description Header */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl border ${cfg.iconBg}`}>
          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
        </div>
        <div>
          <h2
            className="font-semibold text-base leading-tight transition-colors duration-300"
            style={{ color: 'var(--text-primary)' }}
          >
            {cfg.label}
          </h2>
          <p
            className="text-xs mt-0.5 transition-colors duration-300"
            style={{ color: 'var(--text-muted)' }}
          >
            {cfg.sublabel}
          </p>
        </div>
      </div>

      {/* Amount Input Field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={cfg.inputId}
          className="text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
          style={{ color: 'var(--text-secondary)' }}
        >
          Monto (COP)
        </label>
        <div className="relative">
          <span
            className="font-financial absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none transition-colors duration-300"
            style={{ color: 'var(--text-muted)' }}
          >
            $
          </span>
          <input
            id={cfg.inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            aria-invalid={showError}
            aria-describedby={showError ? cfg.errorId : undefined}
            placeholder="0"
            className="font-financial w-full pl-8 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--input-bg)',
              border: showError
                ? '1px solid #ef4444'
                : '1px solid var(--input-border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              if (!showError) {
                e.currentTarget.style.borderColor = 'var(--input-focus-border)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--input-focus-ring)';
              } else {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
              }
            }}
          />
        </div>

        {/* Accessible Error Message Alert */}
        <AnimatePresence>
          {showError && (
            <motion.div
              id={cfg.errorId}
              role="alert"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action CTA Button */}
      <motion.button
        id={cfg.buttonId}
        type="submit"
        disabled={!isValid || isLoading}
        data-numeric-value={numericValue ?? undefined}
        whileHover={isValid && !isLoading ? { scale: 1.02 } : {}}
        whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm tracking-wide ring-1 ${
          cfg.buttonRing
        } text-white flex items-center justify-center gap-2 transition-opacity duration-200 ${
          !isValid || isLoading
            ? 'opacity-45 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-lg'
        }`}
        style={{
          backgroundColor: cfg.buttonBg,
          boxShadow: isValid && !isLoading ? `0 4px 14px -3px ${cfg.buttonShadow}` : 'none',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Procesando...</span>
          </>
        ) : (
          <span>{cfg.label}</span>
        )}
      </motion.button>
    </form>
  );
}
