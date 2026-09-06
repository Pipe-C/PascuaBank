import { Receipt } from 'lucide-react';
import type { Variants } from 'framer-motion';
import type { Transaction } from '../../types/bank.types';
import { TransactionRow } from './TransactionRow';

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency: string;
}

// Row stagger animation variants
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
};

export function TransactionHistory({ transactions, currency }: TransactionHistoryProps) {
  return (
    <section aria-label="Historial de transacciones">
      {/* Header Info */}
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
        <h2
          className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
          style={{ color: 'var(--text-secondary)' }}
        >
          Historial de transacciones
        </h2>
        <span
          className="ml-auto text-xs px-2.5 py-0.5 rounded-full border transition-colors duration-300"
          style={{
            backgroundColor: 'var(--bg-card-alt)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          {transactions.length} movimientos
        </span>
      </div>

      {/* Table Container */}
      <div
        className="rounded-2xl overflow-hidden border transition-colors duration-300"
        style={{
          borderColor: 'var(--border-card)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {transactions.length === 0 ? (
          <div
            className="py-16 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            No hay transacciones registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" id="transaction-history-table">
              <thead>
                <tr
                  className="border-b transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--table-head-bg)',
                    borderColor: 'var(--table-border)',
                  }}
                >
                  <th
                    className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Tipo
                  </th>
                  <th
                    className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Descripción
                  </th>
                  <th
                    className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest hidden md:table-cell transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Fecha
                  </th>
                  <th
                    className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Monto
                  </th>
                  <th
                    className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-widest hidden lg:table-cell transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Saldo posterior
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, i) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    index={i}
                    currency={currency}
                    variants={rowVariants}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
