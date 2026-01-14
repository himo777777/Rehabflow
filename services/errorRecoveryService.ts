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
}

export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'redirect' | 'manual' | 'ignore';
  label: string;
  action: () => Promise<boolean>;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: ErrorCategory[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableErrors: ['network', 'api', 'ml_model'],
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
  private listeners: Set<(error: AppError) => void> = new Set();
  private language: 'sv' | 'en' = 'sv';

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
    return DEFAULT_RETRY_CONFIG.retryableErrors.includes(error.category);
  }

  private async attemptRecovery(error: AppError): Promise<boolean> {
    if (error.retryCount >= DEFAULT_RETRY_CONFIG.maxRetries) return false;

    const delay = Math.min(
      DEFAULT_RETRY_CONFIG.initialDelay *
        Math.pow(DEFAULT_RETRY_CONFIG.backoffFactor, error.retryCount),
      DEFAULT_RETRY_CONFIG.maxDelay
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
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < finalConfig.maxRetries) {
          const delay = Math.min(
            finalConfig.initialDelay * Math.pow(finalConfig.backoffFactor, attempt),
            finalConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
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
  }

  /**
   * Log an error (used by ErrorBoundary)
   */
  logError(error: Error | unknown, context?: { componentStack?: string }, componentName?: string): void {
    const message = error instanceof Error ? error.message : String(error);

    logger.error(`[ErrorRecovery] ${componentName || 'Component'} error:`, message, context?.componentStack || '');

    // Create and handle the error through the normal flow
    this.handleError(error instanceof Error ? error : new Error(message));
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

  // Remove potential sensitive information
  return message
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    .replace(/api[_-]?key[=:][^\s&]+/gi, '[API_KEY]')
    .replace(/token[=:][^\s&]+/gi, '[TOKEN]')
    .replace(/password[=:][^\s&]+/gi, '[PASSWORD]')
    .replace(/Bearer\s+[^\s]+/gi, '[AUTH]')
    .slice(0, 200); // Limit length
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | unknown): string {
  if (!error) return 'Något gick fel. Försök igen.';

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

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

export default errorRecoveryService;
