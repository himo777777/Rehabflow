/**
 * Error Recovery Service
 *
 * Comprehensive error handling and recovery system:
 * - User-friendly error messages
 * - Automatic retry with exponential backoff
 * - Error categorization and prioritization
 * - Recovery suggestions
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'permission'
  | 'validation'
  | 'camera'
  | 'storage'
  | 'ml_model'
  | 'api'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  timestamp: number;
  recovered: boolean;
  retryCount: number;
  recoveryAction?: RecoveryAction;
  error: Error;
  component?: string;
}

export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'redirect' | 'manual' | 'ignore';
  label: string;
  action: () => Promise<boolean>;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: ErrorCategory[];
  circuitBreakerThreshold: number;
  circuitResetTime: number;
}

export interface CircuitState {
  state: 'closed' | 'open' | 'half-open';
  errorCount: number;
  openedAt: number | null;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Map<string, number>;
  lastError: Error | null;
  lastErrorTime: number | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_ERROR_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableErrors: ['network', 'api', 'ml_model'],
  circuitBreakerThreshold: 3,
  circuitResetTime: 30000,
};

const ERROR_MESSAGES: Record<string, { sv: string; en: string }> = {
  'NETWORK_OFFLINE': {
    sv: 'Du verkar vara offline. Kontrollera din internetanslutning.',
    en: 'You appear to be offline. Check your internet connection.',
  },
  'NETWORK_TIMEOUT': {
    sv: 'Anslutningen tog för lång tid. Försök igen.',
    en: 'Connection timed out. Please try again.',
  },
  'NETWORK_ERROR': {
    sv: 'Ett nätverksfel uppstod. Försök igen om en stund.',
    en: 'A network error occurred. Please try again shortly.',
  },
  'AUTH_EXPIRED': {
    sv: 'Din session har gått ut. Logga in igen.',
    en: 'Your session has expired. Please log in again.',
  },
  'CAMERA_DENIED': {
    sv: 'Kameraåtkomst nekad. Aktivera kameran i inställningarna.',
    en: 'Camera access denied. Enable camera in settings.',
  },
  'CAMERA_NOT_FOUND': {
    sv: 'Ingen kamera hittades.',
    en: 'No camera found.',
  },
  'CAMERA_IN_USE': {
    sv: 'Kameran används av en annan app.',
    en: 'Camera is in use by another app.',
  },
  'STORAGE_FULL': {
    sv: 'Lagringsutrymmet är fullt.',
    en: 'Storage is full.',
  },
  'MODEL_LOAD_FAILED': {
    sv: 'Kunde inte ladda AI-modellen.',
    en: 'Could not load AI model.',
  },
  'API_ERROR': {
    sv: 'Ett serverfel uppstod.',
    en: 'A server error occurred.',
  },
  'UNKNOWN_ERROR': {
    sv: 'Något gick fel. Försök igen.',
    en: 'Something went wrong. Please try again.',
  },
};

// ============================================================================
// SERVICE
// ============================================================================

class ErrorRecoveryService {
  private errors: Map<string, AppError> = new Map();
  private circuits: Map<string, CircuitState> = new Map();
  private listeners: Set<(error: AppError) => void> = new Set();
  private language: 'sv' | 'en' = 'sv';
  private config: RetryConfig = { ...DEFAULT_ERROR_CONFIG };

  async handleError(
    error: Error | unknown,
    context?: { category?: ErrorCategory; code?: string; retry?: boolean }
  ): Promise<{ handled: boolean; recovered: boolean; userMessage: string }> {
    const appError = this.createAppError(error, context);
    this.errors.set(appError.id, appError);

    logger.error('[ErrorRecovery] Error caught:', {
      id: appError.id,
      code: appError.code,
      message: appError.message,
    });

    if (context?.retry !== false && this.isRetryable(appError)) {
      const recovered = await this.attemptRecovery(appError);
      if (recovered) {
        return { handled: true, recovered: true, userMessage: 'Problemet har lösts.' };
      }
    }

    this.notifyListeners(appError);

    return {
      handled: true,
      recovered: false,
      userMessage: appError.userMessage,
    };
  }

  private createAppError(
    error: Error | unknown,
    context?: { category?: ErrorCategory; code?: string }
  ): AppError {
    const category = context?.category || this.categorizeError(error);
    const code = context?.code || this.getErrorCode(error, category);
    const message = error instanceof Error ? error.message : String(error);

    return {
      id: 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      category,
      severity: this.getSeverity(category),
      code,
      message,
      userMessage: this.getUserMessage(code),
      technicalDetails: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      recovered: false,
      retryCount: 0,
      error: error instanceof Error ? error : new Error(message),
    };
  }

  private categorizeError(error: unknown): ErrorCategory {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return 'network';
    }
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') return 'permission';
      if (error.name === 'NotFoundError') return 'camera';
      if (error.name === 'QuotaExceededError') return 'storage';
    }
    return 'unknown';
  }

  private getErrorCode(error: unknown, category: ErrorCategory): string {
    if (!navigator.onLine && category === 'network') return 'NETWORK_OFFLINE';
    const defaults: Record<ErrorCategory, string> = {
      network: 'NETWORK_ERROR',
      authentication: 'AUTH_EXPIRED',
      permission: 'PERMISSION_DENIED',
      validation: 'VALIDATION_FAILED',
      camera: 'CAMERA_ERROR',
      storage: 'STORAGE_FULL',
      ml_model: 'MODEL_LOAD_FAILED',
      api: 'API_ERROR',
      unknown: 'UNKNOWN_ERROR',
    };
    return defaults[category];
  }

  private getSeverity(category: ErrorCategory): ErrorSeverity {
    if (category === 'authentication') return 'high';
    if (category === 'camera') return 'high';
    return 'medium';
  }

  private getUserMessage(code: string): string {
    const messages = ERROR_MESSAGES[code] || ERROR_MESSAGES['UNKNOWN_ERROR'];
    return messages[this.language];
  }

  private isRetryable(error: AppError): boolean {
    return this.config.retryableErrors.includes(error.category);
  }

  private async attemptRecovery(error: AppError): Promise<boolean> {
    if (error.retryCount >= this.config.maxRetries) return false;

    const delay = Math.min(
      this.config.retryDelay *
        Math.pow(this.config.backoffFactor, error.retryCount),
      this.config.maxDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));
    error.retryCount++;

    // Check if condition resolved (e.g., back online)
    if (error.code === 'NETWORK_OFFLINE' && navigator.onLine) {
      error.recovered = true;
      return true;
    }

    return false;
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    keyOrConfig: string | Partial<RetryConfig> = 'default',
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const key = typeof keyOrConfig === 'string' ? keyOrConfig : 'default';
    const overrides = typeof keyOrConfig === 'string' ? config : keyOrConfig;
    const finalConfig = { ...this.config, ...overrides };
    if (this.isCircuitOpen(key)) {
      throw new Error(`Circuit breaker open for ${key}`);
    }
    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.circuits.set(key, { state: 'closed', errorCount: 0, openedAt: null });
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < finalConfig.maxRetries) {
          const delay = Math.min(
            finalConfig.retryDelay * Math.pow(finalConfig.backoffFactor, attempt),
            finalConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.recordFailure(lastError, key);
    throw lastError;
  }

  withFallback<T>(operation: () => T, fallback: T, key?: string): T {
    try {
      return operation();
    } catch (error) {
      if (key) this.recordFailure(error, key);
      return fallback;
    }
  }

  async withAsyncFallback<T>(operation: () => Promise<T>, fallback: T, key?: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (key) this.recordFailure(error, key);
      return fallback;
    }
  }

  getCircuitState(key: string): CircuitState {
    const circuit = this.circuits.get(key);
    if (!circuit) return { state: 'closed', errorCount: 0, openedAt: null };

    if (
      circuit.state === 'open' &&
      circuit.openedAt !== null &&
      Date.now() - circuit.openedAt >= this.config.circuitResetTime
    ) {
      const halfOpen: CircuitState = { ...circuit, state: 'half-open' };
      this.circuits.set(key, halfOpen);
      return { ...halfOpen };
    }
    return { ...circuit };
  }

  isCircuitOpen(key: string): boolean {
    return this.getCircuitState(key).state === 'open';
  }

  shouldDisableFeature(key: string): boolean {
    return this.isCircuitOpen(key);
  }

  getDegradationLevel(key: string): 'full' | 'simple' | 'minimal' {
    const count = this.getCircuitState(key).errorCount;
    if (count >= this.config.circuitBreakerThreshold) return 'minimal';
    if (count > 0) return 'simple';
    return 'full';
  }

  getConfig(): RetryConfig {
    return { ...this.config, retryableErrors: [...this.config.retryableErrors] };
  }

  updateConfig(updates: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  setLanguage(lang: 'sv' | 'en'): void {
    this.language = lang;
  }

  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        logger.error('[ErrorRecovery] Listener error:', e);
      }
    });
  }

  getRecentErrors(count: number = 10): AppError[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  clearErrors(): void {
    this.errors.clear();
    this.circuits.clear();
  }

  /**
   * Log an error (used by ErrorBoundary)
   */
  logError(error: Error | unknown, context?: Record<string, unknown>, componentName?: string): void {
    const message = error instanceof Error ? error.message : String(error);

    logger.error(`[ErrorRecovery] ${componentName || 'Component'} error:`, message, context?.componentStack || '');

    const appError = this.createAppError(error);
    appError.component = componentName;
    this.addError(appError);
    this.notifyListeners(appError);
  }

  markRecovered(timestamp: number): void {
    const match = Array.from(this.errors.values()).find(item => item.timestamp === timestamp);
    if (match) match.recovered = true;
  }

  getErrorStats(): ErrorStats {
    const values = Array.from(this.errors.values());
    const errorsByType = new Map<string, number>();
    for (const item of values) {
      const type = item.error.name || 'Error';
      errorsByType.set(type, (errorsByType.get(type) || 0) + 1);
    }
    const last = values.sort((a, b) => b.timestamp - a.timestamp)[0];
    return {
      totalErrors: values.length,
      errorsByType,
      lastError: last?.error || null,
      lastErrorTime: last?.timestamp || null,
    };
  }

  private recordFailure(error: unknown, key: string): void {
    const current = this.getCircuitState(key);
    const errorCount = current.errorCount + 1;
    this.circuits.set(key, {
      state: errorCount >= this.config.circuitBreakerThreshold ? 'open' : 'closed',
      errorCount,
      openedAt: errorCount >= this.config.circuitBreakerThreshold ? Date.now() : null,
    });

    const appError = this.createAppError(error);
    this.addError(appError);
  }

  private addError(error: AppError): void {
    this.errors.set(error.id, error);
    if (this.errors.size > 100) {
      const oldest = Array.from(this.errors.values()).sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) this.errors.delete(oldest.id);
    }
  }
}

export const errorRecoveryService = new ErrorRecoveryService();

// ============================================================================
// UTILITY FUNCTIONS (used by ErrorBoundary)
// ============================================================================

/**
 * Sanitize error message for display (remove sensitive info)
 */
export function sanitizeErrorMessage(error: Error | unknown): string {
  if (!error) return 'Ett okänt fel uppstod';

  const message = error instanceof Error ? error.message : String(error);
  if (!message) return 'Ett oväntat fel uppstod';

  // Remove potential sensitive information
  return message
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/api[_-]?key[=:][^\s&]+/gi, '[HIDDEN]')
    .replace(/token[=:][^\s&]+/gi, '[HIDDEN]')
    .replace(/password[=:][^\s&]+/gi, '[HIDDEN]')
    .replace(/Bearer\s+[^\s]+/gi, '[AUTH]')
    .slice(0, 200); // Limit length
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | unknown): string {
  if (!error) return 'Något gick fel. Försök igen.';

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const name = error instanceof Error ? error.name.toLowerCase() : '';

  if (name.includes('timeout') || message.includes('timed out') || message.includes('timeout')) {
    return 'Anslutningen tog för lång tid. Försök igen.';
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
    return 'Nätverksfel. Kontrollera din internetanslutning.';
  }

  // Camera errors
  if (message.includes('camera') || message.includes('getusermedia') || message.includes('notallowed')) {
    return 'Kameraåtkomst nekad. Aktivera kameran i webbläsarinställningarna.';
  }

  // Storage errors
  if (message.includes('quota') || message.includes('storage')) {
    return 'Lagringsutrymmet är fullt. Rensa lite data och försök igen.';
  }

  // ML model errors
  if (message.includes('model') || message.includes('tensorflow') || message.includes('mediapipe')) {
    return 'AI-modellen kunde inte laddas. Prova att ladda om sidan.';
  }

  // Chunk loading errors (common in Vite/React)
  if (message.includes('chunk') || message.includes('loading')) {
    return 'Applikationen kunde inte laddas helt. Prova att ladda om sidan.';
  }

  // Syntax/module errors
  if (message.includes('syntax') || message.includes('unexpected')) {
    return 'Ett tekniskt fel uppstod. Ladda om sidan.';
  }

  // Default message
  return 'Ett oväntat fel uppstod. Försök igen eller ladda om sidan.';
}

export function isRetryableError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) return false;
  const name = error.name.toLowerCase();
  const message = error.message.toLowerCase();
  if (name.includes('authentication') || name.includes('validation') || name.includes('notfound')) {
    return false;
  }
  return name.includes('network') || name.includes('timeout') || message.includes('network') || message.includes('fetch') || message.includes('timeout');
}

export default errorRecoveryService;
