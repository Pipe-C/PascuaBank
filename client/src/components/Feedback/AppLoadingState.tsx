import { Loader2 } from 'lucide-react';

export function AppLoadingState() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl border animate-pulse"
          style={{
            backgroundColor: 'var(--accent-amber-bg)',
            borderColor: 'var(--accent-amber-border)',
          }}
        >
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--accent-amber)' }} />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Cargando PascuaBank...
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Obteniendo datos de tu cuenta bancaria
          </p>
        </div>
      </div>
    </div>
  );
}
