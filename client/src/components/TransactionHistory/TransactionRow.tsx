import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { Transaction } from '../../types/bank.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface TransactionRowProps {
  transaction: Transaction;
  index: number;
  currency: string;
  variants: Variants;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function TransactionRow({
  transaction,
  index,
  currency,
  variants,
}: TransactionRowProps) {
  const isDeposit = transaction.type === 'DEPOSIT';

  return (
    <motion.tr
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      className="group relative transition-all duration-150 border-b last:border-b-0 cursor-default"
      style={{
        backgroundColor: 'var(--table-row-bg)',
        borderColor: 'var(--table-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--table-row-hover)';
        e.currentTarget.style.borderLeft = '3px solid var(--table-hover-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--table-row-bg)';
        e.currentTarget.style.borderLeft = '';
      }}
    >
      {/* Type Column */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-lg border ${
              isDeposit
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isDeposit ? (
              <ArrowDownLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5" />
            )}
          </div>
          <span
            className={`text-xs font-semibold ${
              isDeposit
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {isDeposit ? 'Depósito' : 'Retiro'}
          </span>
        </div>
      </td>

      {/* Description Column */}
      <td
        className="px-5 py-4 max-w-[180px] truncate transition-colors duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        {transaction.description}
      </td>

      {/* Date Column */}
      <td
        className="font-financial px-5 py-4 text-xs hidden md:table-cell whitespace-nowrap transition-colors duration-300"
        style={{ color: 'var(--text-muted)' }}
      >
        {formatDate(transaction.date)}
      </td>

      {/* Amount Column */}
      <td className="px-5 py-4 text-right whitespace-nowrap">
        <span
          className={`font-financial font-semibold text-sm ${
            isDeposit
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-rose-700 dark:text-rose-400'
          }`}
        >
          {isDeposit ? '+' : '−'}
          {formatCurrency(transaction.amount, currency)}
        </span>
      </td>

      {/* Balance After Column */}
      <td
        className="font-financial px-5 py-4 text-right text-xs hidden lg:table-cell whitespace-nowrap transition-colors duration-300"
        style={{ color: 'var(--text-muted)' }}
      >
        {formatCurrency(transaction.balanceAfter, currency)}
      </td>
    </motion.tr>
  );
}
