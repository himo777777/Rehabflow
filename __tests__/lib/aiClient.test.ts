/**
 * Tests for aiClient - Circuit Breaker and Retry Logic
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AIClientError,
  withRetry,
  withCircuitBreaker,
  getCircuitBreakerStats,
  resetCircuitBreaker,
  aiCircuitBreaker,
} from '../../lib/aiClient';

// Mock logger to avoid console output in tests
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('aiClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetCircuitBreaker();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('AIClientError', () => {
    it('should create error with correct properties', () => {
      const error = new AIClientError('Test error', 'API_ERROR', undefined, 500);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AIClientError');
    });

    it('should create rate limit error with retryAfter', () => {
      const error = new AIClientError('Rate limited', 'RATE_LIMIT', 60);

      expect(error.code).toBe('RATE_LIMIT');
      expect(error.retryAfter).toBe(60);
    });

    it('should create network error', () => {
      const error = new AIClientError('Network failed', 'NETWORK_ERROR');

      expect(error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, 3, 100);

      // Fast-forward through delays
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay (exponential)

      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      // Use a try-catch to properly handle the expected rejection
      let caughtError: Error | null = null;

      const resultPromise = withRetry(fn, 3, 100).catch(e => {
        caughtError = e;
      });

      // Fast-forward through all delays
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(caughtError).toBeTruthy();
      expect(caughtError?.message).toBe('Always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should handle rate limit errors with retryAfter', async () => {
      const rateLimitError = new AIClientError('Rate limited', 'RATE_LIMIT', 2);
      const fn = vi.fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, 3, 100);

      // Wait for rate limit delay (2 seconds)
      await vi.advanceTimersByTimeAsync(2000);

      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Circuit Breaker', () => {
    // Reset circuit breaker before each test in this block
    beforeEach(() => {
      resetCircuitBreaker();
    });

    it('should start in CLOSED state', () => {
      const stats = getCircuitBreakerStats();

      expect(stats.state).toBe('CLOSED');
      expect(stats.failures).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });

    it('should execute function when CLOSED', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await aiCircuitBreaker.execute(fn);

      expect(result).toBe('success');
      expect(getCircuitBreakerStats().totalRequests).toBe(1);
      expect(getCircuitBreakerStats().totalSuccesses).toBe(1);
    });

    it('should track failures', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try {
        await aiCircuitBreaker.execute(fn);
      } catch {
        // Expected
      }

      const stats = getCircuitBreakerStats();
      expect(stats.totalFailures).toBe(1);
    });

    it('should open circuit after threshold failures', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      // Trigger 5 failures (threshold)
      for (let i = 0; i < 5; i++) {
        try {
          await aiCircuitBreaker.execute(fn);
        } catch {
          // Expected
        }
      }

      const stats = getCircuitBreakerStats();
      expect(stats.state).toBe('OPEN');
    });

    it('should throw immediately when circuit is OPEN', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await aiCircuitBreaker.execute(fn);
        } catch {
          // Expected
        }
      }

      // Next call should throw immediately without calling fn
      const successFn = vi.fn().mockResolvedValue('success');

      await expect(aiCircuitBreaker.execute(successFn)).rejects.toThrow(
        'Circuit breaker is OPEN'
      );

      expect(successFn).not.toHaveBeenCalled();
    });

    it('should transition to HALF_OPEN after recovery timeout', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await aiCircuitBreaker.execute(fn);
        } catch {
          // Expected
        }
      }

      expect(getCircuitBreakerStats().state).toBe('OPEN');

      // Advance time past recovery timeout (30 seconds)
      await vi.advanceTimersByTimeAsync(31000);

      // Next execution should transition to HALF_OPEN
      const successFn = vi.fn().mockResolvedValue('success');
      await aiCircuitBreaker.execute(successFn);

      expect(successFn).toHaveBeenCalled();
    });

    it('should close circuit after success threshold in HALF_OPEN', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await aiCircuitBreaker.execute(failFn);
        } catch {
          // Expected
        }
      }

      // Advance to HALF_OPEN
      await vi.advanceTimersByTimeAsync(31000);

      // Execute success threshold times (2)
      await aiCircuitBreaker.execute(successFn);
      await aiCircuitBreaker.execute(successFn);

      expect(getCircuitBreakerStats().state).toBe('CLOSED');
    });

    it('should reopen circuit on failure in HALF_OPEN', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await aiCircuitBreaker.execute(failFn);
        } catch {
          // Expected
        }
      }

      // Advance to HALF_OPEN
      await vi.advanceTimersByTimeAsync(31000);

      // One success, then failure
      await aiCircuitBreaker.execute(successFn);

      try {
        await aiCircuitBreaker.execute(failFn);
      } catch {
        // Expected
      }

      expect(getCircuitBreakerStats().state).toBe('OPEN');
    });

    it('should reset failure count on success in CLOSED state', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      // Some failures (but not enough to open)
      for (let i = 0; i < 3; i++) {
        try {
          await aiCircuitBreaker.execute(failFn);
        } catch {
          // Expected
        }
      }

      // Success should reset failure count
      await aiCircuitBreaker.execute(successFn);

      expect(getCircuitBreakerStats().failures).toBe(0);
    });

    it('should track stats correctly', async () => {
      const successFn = vi.fn().mockResolvedValue('success');

      await aiCircuitBreaker.execute(successFn);
      await aiCircuitBreaker.execute(successFn);
      await aiCircuitBreaker.execute(successFn);

      const stats = getCircuitBreakerStats();

      expect(stats.totalRequests).toBe(3);
      expect(stats.totalSuccesses).toBe(3);
      expect(stats.totalFailures).toBe(0);
      expect(stats.lastSuccess).toBeDefined();
    });

    it('should check availability correctly', () => {
      expect(aiCircuitBreaker.isAvailable()).toBe(true);
    });

    it('should force reset the circuit', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await aiCircuitBreaker.execute(failFn);
        } catch {
          // Expected
        }
      }

      expect(getCircuitBreakerStats().state).toBe('OPEN');

      resetCircuitBreaker();

      expect(getCircuitBreakerStats().state).toBe('CLOSED');
      expect(getCircuitBreakerStats().failures).toBe(0);
    });
  });

  describe('withCircuitBreaker', () => {
    it('should combine circuit breaker with retry logic', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValue('success');

      const resultPromise = withCircuitBreaker(fn, { maxRetries: 3, baseDelay: 100 });

      // Fast-forward through retry delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
