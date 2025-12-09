/**
 * errorRecoveryService - Sprint 5.2: Error Recovery System
 *
 * Provides:
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern for API calls
 * - Error logging and stats
 * - Graceful degradation support
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;           // Initial delay in ms
  maxRetryDelay: number;        // Max delay cap
  backoffMultiplier: number;    // Exponential backoff factor
  circuitBreakerThreshold: number;  // Errors before circuit opens
  circuitResetTimeout: number;  // Time before circuit resets (ms)
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Map<string, number>;
  lastError: Error | null;
  lastErrorTime: number | null;
  circuitStates: Map<string, CircuitInfo>;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitInfo {
  state: CircuitState;
  errorCount: number;
  lastErrorTime: number | null;
  nextRetryTime: number | null;
}

export interface ErrorLogEntry {
  timestamp: number;
  error: Error;
  context?: Record<string, unknown>;
  component?: string;
  recovered: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_ERROR_CONFIG: ErrorRecoveryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  backoffMultiplier: 2,
  circuitBreakerThreshold: 5,
  circuitResetTimeout: 30000,
};

// ============================================================================
// ERROR RECOVERY SERVICE
// ============================================================================

class ErrorRecoveryService {
  private config: ErrorRecoveryConfig;
  private errorCount: Map<string, number> = new Map();
  private circuitStates: Map<string, CircuitInfo> = new Map();
  private errorLog: ErrorLogEntry[] = [];
  private totalErrors: number = 0;
  private lastError: Error | null = null;
  private lastErrorTime: number | null = null;

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_CONFIG, ...config };
  }

  // --------------------------------------------------------------------------
  // RETRY LOGIC
  // --------------------------------------------------------------------------

  /**
   * Execute a function with automatic retry logic
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    key: string,
    options?: Partial<ErrorRecoveryConfig>
  ): Promise<T> {
    const config = { ...this.config, ...options };
    let lastError: Error | null = null;
    let delay = config.retryDelay;

    // Check circuit breaker first
    if (this.isCircuitOpen(key)) {
      const circuitInfo = this.circuitStates.get(key);
      throw new Error(
        `Circuit breaker open for "${key}". Next retry at ${new Date(circuitInfo?.nextRetryTime || 0).toLocaleTimeString()}`
      );
    }

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn();
        // Success - reset error count
        this.resetErrorCount(key);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.recordError(key, lastError);

        // If this was the last attempt, don't wait
        if (attempt === config.maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxRetryDelay);
      }
    }

    // All retries failed
    this.logError(lastError!, { key, retries: config.maxRetries }, key);
    throw lastError;
  }

  /**
   * Wrap a synchronous function with try/catch and optional fallback
   */
  withFallback<T>(fn: () => T, fallback: T, key?: string): T {
    try {
      return fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (key) {
        this.recordError(key, err);
        this.logError(err, { fallbackUsed: true }, key);
      }
      return fallback;
    }
  }

  /**
   * Wrap an async function with fallback
   */
  async withAsyncFallback<T>(
    fn: () => Promise<T>,
    fallback: T,
    key?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (key) {
        this.recordError(key, err);
        this.logError(err, { fallbackUsed: true }, key);
      }
      return fallback;
    }
  }

  // --------------------------------------------------------------------------
  // CIRCUIT BREAKER
  // --------------------------------------------------------------------------

  /**
   * Check if circuit breaker is open for a given key
   */
  isCircuitOpen(key: string): boolean {
    const circuit = this.circuitStates.get(key);
    if (!circuit) return false;

    if (circuit.state === 'open') {
      // Check if we should transition to half-open
      if (circuit.nextRetryTime && Date.now() >= circuit.nextRetryTime) {
        this.setCircuitState(key, 'half-open');
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Get circuit state for a key
   */
  getCircuitState(key: string): CircuitInfo {
    return this.circuitStates.get(key) || {
      state: 'closed',
      errorCount: 0,
      lastErrorTime: null,
      nextRetryTime: null,
    };
  }

  private setCircuitState(key: string, state: CircuitState): void {
    const current = this.circuitStates.get(key) || {
      state: 'closed',
      errorCount: 0,
      lastErrorTime: null,
      nextRetryTime: null,
    };

    this.circuitStates.set(key, {
      ...current,
      state,
      nextRetryTime: state === 'open'
        ? Date.now() + this.config.circuitResetTimeout
        : null,
    });
  }

  private recordError(key: string, error: Error): void {
    const count = (this.errorCount.get(key) || 0) + 1;
    this.errorCount.set(key, count);
    this.totalErrors++;
    this.lastError = error;
    this.lastErrorTime = Date.now();

    // Update circuit info
    const circuit = this.circuitStates.get(key) || {
      state: 'closed' as CircuitState,
      errorCount: 0,
      lastErrorTime: null,
      nextRetryTime: null,
    };

    circuit.errorCount = count;
    circuit.lastErrorTime = Date.now();

    // Check if we should open the circuit
    if (count >= this.config.circuitBreakerThreshold && circuit.state === 'closed') {
      circuit.state = 'open';
      circuit.nextRetryTime = Date.now() + this.config.circuitResetTimeout;
      console.warn(`[ErrorRecovery] Circuit breaker opened for "${key}" after ${count} errors`);
    }

    this.circuitStates.set(key, circuit);
  }

  private resetErrorCount(key: string): void {
    this.errorCount.set(key, 0);
    const circuit = this.circuitStates.get(key);
    if (circuit) {
      this.circuitStates.set(key, {
        ...circuit,
        state: 'closed',
        errorCount: 0,
        nextRetryTime: null,
      });
    }
  }

  // --------------------------------------------------------------------------
  // ERROR LOGGING
  // --------------------------------------------------------------------------

  /**
   * Log an error with context
   */
  logError(error: Error, context?: Record<string, unknown>, component?: string): void {
    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      error,
      context,
      component,
      recovered: false,
    };

    this.errorLog.push(entry);

    // Keep log size manageable
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorRecovery] ${component || 'Unknown'}:`, error.message, context);
    }
  }

  /**
   * Mark an error as recovered
   */
  markRecovered(timestamp: number): void {
    const entry = this.errorLog.find(e => e.timestamp === timestamp);
    if (entry) {
      entry.recovered = true;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const errorsByType = new Map<string, number>();
    this.errorLog.forEach(entry => {
      const type = entry.error.name || 'UnknownError';
      errorsByType.set(type, (errorsByType.get(type) || 0) + 1);
    });

    return {
      totalErrors: this.totalErrors,
      errorsByType,
      lastError: this.lastError,
      lastErrorTime: this.lastErrorTime,
      circuitStates: new Map(this.circuitStates),
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Clear all error history
   */
  clearErrors(): void {
    this.errorCount.clear();
    this.circuitStates.clear();
    this.errorLog = [];
    this.totalErrors = 0;
    this.lastError = null;
    this.lastErrorTime = null;
  }

  // --------------------------------------------------------------------------
  // DEGRADATION SUPPORT
  // --------------------------------------------------------------------------

  /**
   * Get recommended degradation level based on error history
   */
  getDegradationLevel(key: string): 'full' | 'simple' | 'minimal' {
    const count = this.errorCount.get(key) || 0;

    if (count === 0) return 'full';
    if (count < 3) return 'simple';
    return 'minimal';
  }

  /**
   * Check if a feature should be disabled due to errors
   */
  shouldDisableFeature(key: string): boolean {
    return this.isCircuitOpen(key) || (this.errorCount.get(key) || 0) >= this.config.circuitBreakerThreshold;
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorRecoveryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ErrorRecoveryConfig {
    return { ...this.config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const errorRecoveryService = new ErrorRecoveryService();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize error message for user display (remove sensitive info)
 */
export function sanitizeErrorMessage(error: Error): string {
  const message = error.message || 'Ett oväntat fel uppstod';

  // Remove potential sensitive information
  const sanitized = message
    .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=[HIDDEN]')
    .replace(/token[=:]\s*\S+/gi, 'token=[HIDDEN]')
    .replace(/password[=:]\s*\S+/gi, 'password=[HIDDEN]')
    .replace(/secret[=:]\s*\S+/gi, 'secret=[HIDDEN]')
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');

  return sanitized;
}

/**
 * Get user-friendly error message in Swedish
 */
export function getUserFriendlyMessage(error: Error): string {
  const errorMap: Record<string, string> = {
    'NetworkError': 'Nätverksfel. Kontrollera din internetanslutning.',
    'TimeoutError': 'Förfrågan tog för lång tid. Försök igen.',
    'TypeError': 'Ett tekniskt fel uppstod. Försök igen.',
    'SyntaxError': 'Ett datafel uppstod. Försök igen.',
    'RangeError': 'Ett beräkningsfel uppstod. Försök igen.',
  };

  return errorMap[error.name] || 'Ett oväntat fel uppstod. Försök igen senare.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const nonRetryableErrors = [
    'AuthenticationError',
    'AuthorizationError',
    'ValidationError',
    'NotFoundError',
  ];

  return !nonRetryableErrors.includes(error.name);
}

export default errorRecoveryService;
