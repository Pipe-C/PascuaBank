import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  retryCount: number;
  error: Error | null;
}

const MAX_RETRIES = 2;

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[PascuaBank SectionErrorBoundary (${this.props.sectionName || 'Sección'}) caught error]:`,
      error,
      errorInfo.componentStack
    );
  }

  private handleRetry = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
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
    const { children, sectionName = 'esta sección' } = this.props;

    if (hasError) {
      const hasExceededRetries = retryCount >= MAX_RETRIES;

      return (
        <div
          className="rounded-2xl border p-6 text-center flex flex-col items-center gap-3.5 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'rgba(239, 68, 68, 0.35)',
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {hasExceededRetries
                ? `No pudimos recuperar ${sectionName}`
                : `No pudimos cargar ${sectionName}`}
            </h3>
            <p
              className="text-xs mt-1 max-w-md mx-auto leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {hasExceededRetries
                ? 'El fallo persiste tras varios reintentos. Te sugerimos recargar el portal bancario. El saldo de tu cuenta y tus fondos no se han visto afectados.'
                : 'Ocurrió un problema temporal al mostrar esta información. El saldo de tu cuenta y tus fondos no se han visto afectados.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {!hasExceededRetries ? (
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs text-white transition-opacity hover:opacity-90 cursor-pointer shadow-md"
                style={{ backgroundColor: 'var(--btn-deposit-bg)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar sección ({retryCount + 1}/{MAX_RETRIES})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recargar portal</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
