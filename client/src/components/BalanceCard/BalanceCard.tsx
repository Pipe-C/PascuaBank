import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Account } from '../../types/bank.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface BalanceCardProps {
  account: Account;
}

/**
 * Hook: anima un número desde 0 hasta `target` usando requestAnimationFrame.
 * Solo corre una vez al montar el componente.
 */
function useCountUp(target: number, durationMs = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      setCurrent(Math.round(ease(progress) * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return current;
}

export function BalanceCard({ account }: BalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const animatedBalance = useCountUp(account.balance, 900);

  const displayBalance = visible
    ? formatCurrency(animatedBalance, account.currency)
    : '• • • • • • •';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="balance-card-mesh relative overflow-hidden rounded-2xl p-7 sm:p-10 border transition-all duration-300"
    >
      <div className="relative z-10 flex flex-col gap-5">
        {/* Fila superior: etiqueta + toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
              style={{ color: 'var(--balance-label)' }}
            >
              Saldo disponible
            </span>
          </div>
          <button
            id="toggle-balance-visibility"
            type="button"
            aria-label={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
            onClick={() => setVisible((v) => !v)}
            className="transition-colors duration-200 cursor-pointer hover:scale-110"
            style={{ color: 'var(--text-muted)' }}
          >
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Monto — elemento dominante de la pantalla */}
        <div className="flex items-baseline gap-3">
          <span
            id="account-balance"
            className="font-financial font-bold leading-none transition-colors duration-300"
            style={{
              fontSize: 'clamp(2.8rem, 8vw, 5rem)',
              color: 'var(--balance-text)',
              letterSpacing: '-0.02em',
            }}
          >
            {displayBalance}
          </span>
          {visible && (
            <span
              className="font-financial text-sm font-semibold mb-1 tracking-widest transition-colors duration-300"
              style={{ color: 'var(--balance-currency)' }}
            >
              {account.currency}
            </span>
          )}
        </div>

        {/* Divisor ámbar sutil */}
        <div
          className="h-px w-full transition-colors duration-300"
          style={{
            background: 'linear-gradient(to right, var(--accent-amber), var(--border-color), transparent)',
          }}
        />

        {/* Número de cuenta */}
        <div className="flex items-center justify-between">
          <span
            className="font-financial text-xs tracking-[0.15em] transition-colors duration-300"
            style={{ color: 'var(--text-muted)' }}
          >
            {account.accountNumber}
          </span>
          {/* Chip de estado */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-300"
            style={{
              backgroundColor: 'var(--bg-card-alt)',
              borderColor: 'var(--border-color)',
              color: 'var(--balance-label)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cuenta activa
          </span>
        </div>
      </div>
    </motion.div>
  );
}
