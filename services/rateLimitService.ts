/**
 * Client-Side Rate Limiting Service
 *
 * Provides rate limiting for API calls to:
 * - Prevent API abuse
 * - Protect against runaway loops
 * - Smooth traffic to backend services
 * - Improve user experience with clear feedback
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitConfig {
  maxRequests: number;       // Max requests allowed
  windowMs: number;          // Time window in ms
  blockDurationMs?: number;  // How long to block after limit exceeded
  keyPrefix?: string;        // Prefix for storage key
}

interface RateLimitState {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const RATE_LIMIT_CONFIGS = {
  // AI Chat: 20 messages per minute
  AI_CHAT: {
    maxRequests: 20,
    windowMs: 60 * 1000,
    blockDurationMs: 30 * 1000,
    keyPrefix: 'rl:ai-chat',
  },

  // AI Program Generation: 5 per hour
  AI_PROGRAM: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
    keyPrefix: 'rl:ai-program',
  },

  // Exercise Completion: 100 per day
  EXERCISE_LOG: {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000,
    keyPrefix: 'rl:exercise',
  },

  // Form Submissions: 10 per minute
  FORM_SUBMIT: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    blockDurationMs: 60 * 1000,
    keyPrefix: 'rl:form',
  },

  // API Calls (general): 100 per minute
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    keyPrefix: 'rl:api',
  },

  // Pain Prediction: 10 per hour
  PAIN_PREDICTION: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    keyPrefix: 'rl:pain',
  },
} as const;

// ============================================================================
// RATE LIMIT SERVICE
// ============================================================================

class RateLimitService {
  private limits: Map<string, RateLimitState> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Periodic cleanup of expired entries
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
      this.loadFromStorage();
    }
  }

  /**
   * Check if request is allowed
   */
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
    const now = Date.now();

    let state = this.limits.get(fullKey);

    // Initialize state if not exists
    if (!state) {
      state = {
        count: 0,
        windowStart: now,
      };
      this.limits.set(fullKey, state);
    }

    // Check if currently blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: state.blockedUntil,
        retryAfter: Math.ceil((state.blockedUntil - now) / 1000),
      };
    }

    // Reset window if expired
    if (now - state.windowStart >= config.windowMs) {
      state.count = 0;
      state.windowStart = now;
      state.blockedUntil = undefined;
    }

    const remaining = Math.max(0, config.maxRequests - state.count);
    const resetAt = state.windowStart + config.windowMs;

    // Check if limit exceeded
    if (state.count >= config.maxRequests) {
      // Set block if configured
      if (config.blockDurationMs && !state.blockedUntil) {
        state.blockedUntil = now + config.blockDurationMs;
        logger.warn(`[RateLimit] Limit exceeded for ${fullKey}, blocked until ${new Date(state.blockedUntil).toISOString()}`);
      }

      return {
        allowed: false,
        remaining: 0,
        resetAt: state.blockedUntil || resetAt,
        retryAfter: Math.ceil(((state.blockedUntil || resetAt) - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  /**
   * Record a request (call after check returns allowed=true)
   */
  record(key: string, config: RateLimitConfig): void {
    const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
    const state = this.limits.get(fullKey);

    if (state) {
      state.count++;
      this.saveToStorage();
    }
  }

  /**
   * Combined check and record
   */
  consume(key: string, config: RateLimitConfig): RateLimitResult {
    const result = this.check(key, config);

    if (result.allowed) {
      this.record(key, config);
    }

    return result;
  }

  /**
   * Get current state for a key
   */
  getState(key: string, config: RateLimitConfig): RateLimitState | undefined {
    const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
    return this.limits.get(fullKey);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string, config: RateLimitConfig): void {
    const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
    this.limits.delete(fullKey);
    this.saveToStorage();
    logger.info(`[RateLimit] Reset limit for ${fullKey}`);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
    this.saveToStorage();
    logger.info('[RateLimit] All limits reset');
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalKeys: number;
    blockedKeys: number;
    limits: Array<{ key: string; state: RateLimitState }>;
  } {
    const now = Date.now();
    const limits: Array<{ key: string; state: RateLimitState }> = [];
    let blockedKeys = 0;

    for (const [key, state] of this.limits) {
      limits.push({ key, state });
      if (state.blockedUntil && state.blockedUntil > now) {
        blockedKeys++;
      }
    }

    return {
      totalKeys: this.limits.size,
      blockedKeys,
      limits,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, state] of this.limits) {
      // Remove entries older than 24 hours with no activity
      const maxAge = 24 * 60 * 60 * 1000;
      if (now - state.windowStart > maxAge) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`[RateLimit] Cleaned ${cleaned} expired entries`);
      this.saveToStorage();
    }
  }

  /**
   * Save state to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.limits);
      localStorage.setItem('rateLimitState', JSON.stringify(data));
    } catch (error) {
      logger.warn('[RateLimit] Failed to save to storage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('rateLimitState');
      if (data) {
        const parsed = JSON.parse(data);
        for (const [key, state] of Object.entries(parsed)) {
          this.limits.set(key, state as RateLimitState);
        }
      }
    } catch (error) {
      logger.warn('[RateLimit] Failed to load from storage:', error);
    }
  }

  /**
   * Destroy service
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const rateLimitService = new RateLimitService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: RateLimitConfig,
  getKey: (...args: Parameters<T>) => string = () => 'default'
): T {
  return (async (...args: Parameters<T>) => {
    const key = getKey(...args);
    const result = rateLimitService.consume(key, config);

    if (!result.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        result.retryAfter || 60
      );
    }

    return fn(...args);
  }) as T;
}

/**
 * Custom error for rate limiting
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Hook for React components
 */
export function useRateLimit(key: string, config: RateLimitConfig) {
  const check = () => rateLimitService.check(key, config);
  const consume = () => rateLimitService.consume(key, config);
  const reset = () => rateLimitService.reset(key, config);

  return { check, consume, reset };
}

/**
 * Format time remaining
 */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sekunder`;
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minut${minutes > 1 ? 'er' : ''}`;
  } else {
    const hours = Math.ceil(seconds / 3600);
    return `${hours} timm${hours > 1 ? 'ar' : 'e'}`;
  }
}

export default rateLimitService;
