import { TransactionForm } from '../TransactionForm/TransactionForm';
import type { TransactionType } from '../../types/bank.types';

interface TransactionPanelProps {
  currentBalance: number;
  onTransaction?: (amount: number, type: TransactionType) => Promise<void> | void;
}

export function TransactionPanel({ currentBalance, onTransaction }: TransactionPanelProps) {
  return (
    <section aria-label="Operaciones bancarias">
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-4 transition-colors duration-300"
        style={{ color: 'var(--text-secondary)' }}
      >
        Operaciones
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TransactionForm
          type="DEPOSIT"
          currentBalance={currentBalance}
          onSubmit={onTransaction}
        />
        <TransactionForm
          type="WITHDRAWAL"
          currentBalance={currentBalance}
          onSubmit={onTransaction}
        />
      </div>
    </section>
  );
}
