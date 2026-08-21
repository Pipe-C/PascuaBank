import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ApiError } from '../../types/bank.types';

interface AppErrorStateProps {
  error: ApiError;
  onRetry: () => void;
}

export function AppErrorState({ error, onRetry }: AppErrorStateProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        className="max-w-md w-full p-6 rounded-2xl border text-center flex flex-col items-center gap-4 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
        }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-rose-600 dark:text-rose-400">
            No se pudo cargar la cuenta
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {error.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white transition-opacity hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: 'var(--btn-deposit-bg)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reintentar conexión</span>
        </button>
      </div>
    </div>
  );
}
