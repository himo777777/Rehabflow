/**
 * PRODUCTION-SAFE LOGGER
 *
 * Förhindrar läckage av känslig information i produktion.
 *
 * I produktion:
 * - Filtrerar bort känslig data (API-nycklar, patientdata)
 * - Loggar endast till konsolen om explicit aktiverat
 * - Saniterar felmeddelanden
 *
 * I utveckling:
 * - Full loggning aktiverad
 * - Stack traces visas
 */

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

// ============================================
// CONFIGURATION
// ============================================

const isProduction = import.meta.env?.PROD === true ||
                     import.meta.env?.MODE === 'production' ||
                     (typeof window !== 'undefined' && window.location.hostname !== 'localhost');

const isDebugEnabled = import.meta.env?.VITE_DEBUG === 'true';

// Sensitive patterns to filter
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /token/i,
  /bearer/i,
  /authorization/i,
  /credentials/i,
  /gsk_[a-zA-Z0-9]+/,  // Groq API key pattern
  /AIza[a-zA-Z0-9_-]+/, // Google API key pattern
  /sk-[a-zA-Z0-9]+/,    // OpenAI API key pattern
];

// Patient data patterns
const PATIENT_DATA_PATTERNS = [
  /personnummer/i,
  /\d{6,8}[-]?\d{4}/,  // Swedish personal number
  /email/i,
  /telefon/i,
  /phone/i,
  /adress/i,
];

// ============================================
// SANITIZATION
// ============================================

/**
 * Sanitize a value to remove sensitive information
 */
function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    let sanitized = value;

    // Check for sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(sanitized)) {
        sanitized = '[REDACTED]';
        break;
      }
    }

    // In production, also check patient data
    if (isProduction) {
      for (const pattern of PATIENT_DATA_PATTERNS) {
        if (pattern.test(sanitized)) {
          sanitized = '[PATIENT_DATA_REDACTED]';
          break;
        }
      }
    }

    return sanitized;
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // Check if key itself is sensitive
      const isKeyySensitive = SENSITIVE_PATTERNS.some(p => p.test(key)) ||
                              (isProduction && PATIENT_DATA_PATTERNS.some(p => p.test(key)));

      if (isKeyySensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(val);
      }
    }
    return sanitized;
  }

  return value;
}

/**
 * Sanitize an error object
 */
function sanitizeError(error: Error): { message: string; stack?: string } {
  let message = error.message;

  // Remove sensitive info from error message
  for (const pattern of SENSITIVE_PATTERNS) {
    message = message.replace(pattern, '[REDACTED]');
  }

  // In production, provide generic error messages
  if (isProduction) {
    // Check for specific error types and provide safe messages
    if (message.includes('fetch') || message.includes('network')) {
      message = 'Ett nätverksfel uppstod. Kontrollera din internetanslutning.';
    } else if (message.includes('401') || message.includes('unauthorized')) {
      message = 'Autentiseringsfel. Försök igen senare.';
    } else if (message.includes('429') || message.includes('rate limit')) {
      message = 'För många förfrågningar. Vänta en stund och försök igen.';
    } else if (message.includes('500') || message.includes('server')) {
      message = 'Ett serverfel uppstod. Försök igen senare.';
    } else if (message.includes('timeout')) {
      message = 'Förfrågan tog för lång tid. Försök igen.';
    }
  }

  return {
    message,
    stack: isProduction ? undefined : error.stack,
  };
}

// ============================================
// LOGGER CLASS
// ============================================

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      const sanitizedContext = sanitizeValue(context);
      return `${prefix} ${message} ${JSON.stringify(sanitizedContext)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Debug level - only in development or when explicitly enabled
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!isProduction || isDebugEnabled) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Info level - development only by default
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (!isProduction || isDebugEnabled) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  /**
   * Warning level - always logged but sanitized in production
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const sanitizedContext = isProduction ? sanitizeValue(context) as Record<string, unknown> : context;
    console.warn(this.formatMessage('warn', message, sanitizedContext));
  }

  /**
   * Error level - always logged but sanitized in production
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const sanitizedContext = isProduction ? sanitizeValue(context) as Record<string, unknown> : context;

    if (error instanceof Error) {
      const sanitizedError = sanitizeError(error);
      console.error(this.formatMessage('error', message, {
        ...sanitizedContext,
        error: sanitizedError.message,
        ...(sanitizedError.stack ? { stack: sanitizedError.stack } : {}),
      }));
    } else if (error) {
      console.error(this.formatMessage('error', message, {
        ...sanitizedContext,
        error: isProduction ? '[ERROR_DETAILS_REDACTED]' : error,
      }));
    } else {
      console.error(this.formatMessage('error', message, sanitizedContext));
    }
  }

  /**
   * Log API call (sanitized)
   */
  logApiCall(endpoint: string, method: string, status?: number): void {
    if (!isProduction || isDebugEnabled) {
      this.info(`API ${method} ${endpoint}`, { status });
    }
  }

  /**
   * Log user action (GDPR-safe)
   */
  logUserAction(action: string, details?: Record<string, unknown>): void {
    // In production, only log action type, not details
    if (isProduction) {
      this.info(`User action: ${action}`);
    } else {
      this.info(`User action: ${action}`, details);
    }
  }

  /**
   * Create child logger with context
   */
  child(context: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private context: Record<string, unknown>
  ) {}

  debug(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.context, ...additionalContext });
  }

  info(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.context, ...additionalContext });
  }

  warn(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.context, ...additionalContext });
  }

  error(message: string, error?: Error | unknown, additionalContext?: Record<string, unknown>): void {
    this.parent.error(message, error, { ...this.context, ...additionalContext });
  }
}

// ============================================
// EXPORTS
// ============================================

export const logger = new Logger();

// For backward compatibility, also export individual functions
export const logDebug = (message: string, context?: Record<string, unknown>) =>
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, unknown>) =>
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, unknown>) =>
  logger.warn(message, context);

export const logError = (message: string, error?: Error | unknown, context?: Record<string, unknown>) =>
  logger.error(message, error, context);

// Export utility functions
export { sanitizeValue, sanitizeError, isProduction };
