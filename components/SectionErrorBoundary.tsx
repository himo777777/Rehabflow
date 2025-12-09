import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  sectionName: string;
  onRetry?: () => void;
  fallbackHeight?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section-level Error Boundary
 *
 * Unlike the global ErrorBoundary, this allows individual sections
 * to fail gracefully without crashing the entire application.
 */
class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`SectionErrorBoundary [${this.props.sectionName}] caught an error`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  public render() {
    if (this.state.hasError) {
      const { sectionName, fallbackHeight = 'min-h-[200px]' } = this.props;

      return (
        <div
          className={`${fallbackHeight} bg-slate-100 rounded-xl flex flex-col items-center justify-center p-6 text-center`}
          role="alert"
          aria-live="polite"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" aria-hidden="true" />
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {sectionName} kunde inte laddas
          </h3>

          <p className="text-sm text-slate-500 mb-4 max-w-xs">
            Ett fel uppstod. Du kan försöka ladda om denna sektion.
          </p>

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            aria-label={`Försök ladda om ${sectionName}`}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Försök igen
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left bg-white rounded-lg p-3 text-xs w-full max-w-md">
              <summary className="cursor-pointer font-medium text-slate-600">
                Teknisk information
              </summary>
              <pre className="overflow-auto text-red-600 mt-2 whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
