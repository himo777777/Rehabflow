/**
 * ErrorBoundary - Sprint 5.2: Enhanced React Error Boundary
 *
 * Provides:
 * - Catches JavaScript errors in child component tree
 * - Displays fallback UI when errors occur
 * - Auto-retry with configurable attempts
 * - Graceful degradation support
 * - Integrates with errorRecoveryService
 */

import { Component, ErrorInfo, ReactNode, FC, useCallback, useState } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../utils/logger';
import {
  errorRecoveryService,
  sanitizeErrorMessage,
  getUserFriendlyMessage,
} from '../services/errorRecoveryService';

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Component name for error logging */
  componentName?: string;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called when boundary is reset */
  onReset?: () => void;
  /** Enable automatic retry */
  autoRetry?: boolean;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Max auto retries */
  maxAutoRetries?: number;
  /** Show minimal error UI */
  minimal?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// ============================================================================
// LOADING SKELETON (for Suspense fallback)
// ============================================================================

export const LoadingSkeleton: FC<{ height?: string; className?: string }> = ({
  height = 'h-64',
  className = '',
}) => {
  return (
    <div className={`animate-pulse ${height} ${className}`}>
      <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm">Laddar...</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AVATAR FALLBACK (minimal static representation)
// ============================================================================

export const AvatarFallback: FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg">
      {/* Simple avatar silhouette */}
      <svg
        className="w-32 h-32 text-slate-400"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        {/* Head */}
        <circle cx="50" cy="25" r="12" />
        {/* Body */}
        <ellipse cx="50" cy="55" rx="20" ry="25" />
        {/* Left arm */}
        <ellipse cx="25" cy="50" rx="5" ry="20" transform="rotate(-15 25 50)" />
        {/* Right arm */}
        <ellipse cx="75" cy="50" rx="5" ry="20" transform="rotate(15 75 50)" />
        {/* Left leg */}
        <ellipse cx="40" cy="85" rx="6" ry="15" />
        {/* Right leg */}
        <ellipse cx="60" cy="85" rx="6" ry="15" />
      </svg>

      <p className="mt-4 text-slate-500 text-sm">
        Avatar kunde inte laddas
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-1 text-sm text-primary-500 hover:text-primary-700 underline"
        >
          Försök igen
        </button>
      )}
    </div>
  );
};

// ============================================================================
// MINIMAL FALLBACK UI
// ============================================================================

const MinimalFallback: FC<{
  error: Error;
  onRetry: () => void;
  componentName?: string;
}> = ({ onRetry }) => {
  return (
    <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
      <button
        onClick={onRetry}
        className="text-red-600 hover:text-red-800 underline text-sm flex items-center gap-2"
      >
        <AlertTriangle size={16} />
        Fel uppstod - Klicka för att försöka igen
      </button>
    </div>
  );
};

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onError, autoRetry, retryDelay = 3000, maxAutoRetries = 2 } = this.props;

    // Log to standard logger
    logger.error('ErrorBoundary caught an error', error, errorInfo);

    // Log to error recovery service
    errorRecoveryService.logError(error, {
      componentStack: errorInfo.componentStack,
    }, componentName);

    this.setState({ errorInfo });

    // Call onError callback if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto retry if enabled and under max retries
    if (autoRetry && this.state.retryCount < maxAutoRetries) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleReset();
      }, retryDelay);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReset = () => {
    const { onReset } = this.props;

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    if (onReset) {
      onReset();
    }
  };

  public render() {
    const { children, fallback, minimal, componentName } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError && error) {
      // Use minimal fallback if specified
      if (minimal) {
        return (
          <MinimalFallback
            error={error}
            onRetry={this.handleReset}
            componentName={componentName}
          />
        );
      }

      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }

      // Default fallback UI
      const userMessage = getUserFriendlyMessage(error);
      const sanitizedError = sanitizeErrorMessage(error);

      return (
        <div
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2" id="error-title">
              {componentName ? `Fel i ${componentName}` : 'Något gick fel'}
            </h1>

            <p className="text-slate-500 mb-6">
              {userMessage}
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-6 text-left bg-slate-50 rounded-xl p-4 text-xs">
                <summary className="cursor-pointer font-bold text-slate-700 mb-2">
                  Teknisk information (utvecklarläge)
                </summary>
                <pre className="overflow-auto text-red-600 whitespace-pre-wrap">
                  {sanitizedError}
                </pre>
                {errorInfo && (
                  <pre className="overflow-auto text-slate-500 mt-2 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                aria-label="Försök igen"
              >
                <RefreshCw size={18} aria-hidden="true" />
                Försök igen
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                aria-label="Gå till startsidan"
              >
                <Home size={18} aria-hidden="true" />
                Startsidan
              </button>
            </div>

            <button
              onClick={this.handleRefresh}
              className="mt-4 text-sm text-slate-400 hover:text-slate-600 underline"
            >
              Ladda om sidan helt
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// ============================================================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================================================

/**
 * Error boundary specifically for 3D/Canvas components
 */
export const Canvas3DErrorBoundary: FC<{
  children: ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      componentName="3D Avatar"
      fallback={(error, reset) => <AvatarFallback onRetry={reset} />}
      onError={(error) => onError?.(error)}
      autoRetry
      maxAutoRetries={1}
      retryDelay={2000}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Error boundary for AI/API components
 */
export const AIErrorBoundary: FC<{
  children: ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      componentName="AI Assistent"
      onError={(error) => onError?.(error)}
      autoRetry
      maxAutoRetries={2}
      retryDelay={3000}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Error boundary for chat components
 */
export const ChatErrorBoundary: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <ErrorBoundary
      componentName="Chat"
      minimal
      autoRetry
      maxAutoRetries={3}
    >
      {children}
    </ErrorBoundary>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to manually trigger error boundary
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = useState<Error | null>(null);

  return useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;
