import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
  error: Error | null;
}

const MAX_RETRIES = 2;

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[PascuaBank GlobalErrorBoundary caught rendering error]:', error, errorInfo.componentStack);
  }

  private handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      retryCount: prev.retryCount + 1,
      error: null,
    }));
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    const { hasError, retryCount } = this.state;
    const { children } = this.props;

    if (hasError) {
      const hasExceededRetries = retryCount >= MAX_RETRIES;

      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--bg-app, #030c07)',
            color: 'var(--text-primary, #f0fdf4)',
          }}
        >
          <div
            className="max-w-md w-full p-8 rounded-3xl border text-center flex flex-col items-center gap-5 shadow-2xl backdrop-blur-md"
            style={{
              backgroundColor: 'var(--bg-card, rgba(4, 18, 9, 0.9))',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-tight">
                {hasExceededRetries
                  ? 'El problema persiste en la aplicación'
                  : 'Ocurrió un inconveniente inesperado'}
              </h1>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'var(--text-muted, #71937e)' }}
              >
                {hasExceededRetries
                  ? 'Intentamos restaurar la vista varias veces sin éxito. Te recomendamos recargar el portal por completo. Tu dinero e información bancaria están seguros.'
                  : 'El portal bancario encontró un error visual al mostrar la pantalla. Tu información de cuenta y tu dinero están seguros.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
              {!hasExceededRetries && (
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-xs text-white transition-opacity hover:opacity-90 cursor-pointer shadow-lg"
                  style={{
                    backgroundColor: 'var(--btn-deposit-bg, #047857)',
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reintentar (Intento {retryCount + 1}/{MAX_RETRIES})</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleReload}
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-xs border transition-colors cursor-pointer ${
                  hasExceededRetries
                    ? 'flex-1 text-white bg-emerald-700 hover:bg-emerald-600 border-emerald-600'
                    : 'flex-1 text-slate-300 hover:text-white border-slate-700 bg-slate-800/40 hover:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recargar portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
