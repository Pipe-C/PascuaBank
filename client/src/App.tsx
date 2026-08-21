import { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header/Header';
import { BalanceCard } from './components/BalanceCard/BalanceCard';
import { TransactionPanel } from './components/TransactionPanel/TransactionPanel';
import { TransactionHistory } from './components/TransactionHistory/TransactionHistory';
import { NotificationToast, type ToastMessage } from './components/Notification/NotificationToast';
import { GlobalErrorBoundary } from './components/ErrorBoundary/GlobalErrorBoundary';
import { SectionErrorBoundary } from './components/ErrorBoundary/SectionErrorBoundary';
import { AppLoadingState } from './components/Feedback/AppLoadingState';
import { AppErrorState } from './components/Feedback/AppErrorState';
import { useAccount } from './hooks/useAccount';
import type { ApiError, TransactionType } from './types/bank.types';
import { formatCurrency } from './utils/formatCurrency';

function Dashboard() {
  const { account, isLoading, error, deposit, withdraw, refreshAccount } = useAccount('1');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: ToastMessage) => {
    setToast(message);
    setTimeout(() => {
      setToast((current) => (current?.id === message.id ? null : current));
    }, 4500);
  }, []);

  const handleTransaction = async (amount: number, type: TransactionType) => {
    const isDeposit = type === 'DEPOSIT';
    try {
      if (isDeposit) {
        await deposit(amount);
      } else {
        await withdraw(amount);
      }

      // Visual success confirmation toast (200 OK)
      showToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        title: isDeposit ? '¡Consignación exitosa!' : '¡Retiro exitoso!',
        description: `Se procesó la operación por ${formatCurrency(amount, account?.currency || 'COP')} correctamente.`,
      });
    } catch (err) {
      const apiErr = err as ApiError;
      // Visual error toast with normalized message (400, 422, Network)
      showToast({
        id: `toast-${Date.now()}`,
        type: 'error',
        title: isDeposit ? 'Error en la consignación' : 'Error en el retiro',
        description: apiErr.message || 'No se pudo completar la transacción en este momento.',
      });
      // Propagate error to keep form feedback in useTransactionForm
      throw err;
    }
  };

  // 1. Initial loading state presentation
  if (isLoading && !account) {
    return <AppLoadingState />;
  }

  // 2. Initial connection error presentation
  if (error && !account) {
    return <AppErrorState error={error} onRetry={refreshAccount} />;
  }

  if (!account) return null;

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300 relative"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sticky Header */}
      <Header account={account} />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Prominent Balance Card */}
        <BalanceCard account={account} />

        {/* Isolated Operations Section with ErrorBoundary */}
        <SectionErrorBoundary sectionName="el panel de operaciones">
          <TransactionPanel
            currentBalance={account.balance}
            onTransaction={handleTransaction}
          />
        </SectionErrorBoundary>

        {/* Isolated History Section with ErrorBoundary */}
        <SectionErrorBoundary sectionName="el historial de transacciones">
          <TransactionHistory
            transactions={account.transactions}
            currency={account.currency}
          />
        </SectionErrorBoundary>
      </main>

      {/* Floating Notifications (Success / Error Toasts) */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />

      {/* Semantic Footer */}
      <footer
        className="border-t py-4 text-center text-xs transition-colors duration-300"
        style={{
          borderColor: 'var(--footer-border)',
          color: 'var(--footer-text)',
        }}
      >
        © {new Date().getFullYear()} PascuaBank · Institución Universitaria Pascual Bravo
      </footer>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
