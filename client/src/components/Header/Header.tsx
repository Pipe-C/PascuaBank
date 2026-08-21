import { Building2, CreditCard, User, Sun, Moon } from 'lucide-react';
import type { Account } from '../../types/bank.types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  account: Account;
}

export function Header({ account }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="w-full border-b px-6 py-4 transition-colors duration-300"
      style={{
        background: 'var(--header-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Identidad del banco */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl border transition-colors duration-300"
            style={{
              backgroundColor: 'var(--accent-amber-bg)',
              borderColor: 'var(--accent-amber-border)',
            }}
          >
            <Building2 className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div>
            <h1
              className="font-semibold text-lg leading-tight tracking-tight transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              PascuaBank
            </h1>
            <p
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: 'var(--text-muted)' }}
            >
              Institución Universitaria Pascual Bravo
            </p>
          </div>
        </div>

        {/* Datos del titular + Theme Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span
                className="text-sm font-medium transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                {account.ownerName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CreditCard className="w-3.5 h-3.5" style={{ color: 'var(--text-hint)' }} />
              <span
                className="font-financial text-xs transition-colors duration-300"
                style={{ color: 'var(--text-muted)' }}
              >
                {account.accountNumber}
              </span>
            </div>
          </div>

          {/* Avatar inicial con acento ámbar */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold select-none border transition-transform duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #047857, #065f46)',
              borderColor: 'var(--accent-amber-border)',
            }}
          >
            {account.ownerName.charAt(0).toUpperCase()}
          </div>

          {/* Toggle Modo Claro / Oscuro */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-800 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
