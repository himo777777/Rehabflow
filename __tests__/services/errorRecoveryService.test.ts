import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  errorRecoveryService,
  sanitizeErrorMessage,
  getUserFriendlyMessage,
  isRetryableError,
  DEFAULT_ERROR_CONFIG,
} from '../../services/errorRecoveryService';

describe('errorRecoveryService', () => {
  beforeEach(() => {
    // Reset the service state before each test
    errorRecoveryService.clearErrors();
  });

  describe('withRetry', () => {
    it('should return result on successful first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await errorRecoveryService.withRetry(mockFn, 'test-key');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');

      const result = await errorRecoveryService.withRetry(mockFn, 'test-key', {
        retryDelay: 10, // Short delay for tests
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        errorRecoveryService.withRetry(mockFn, 'test-key', {
          maxRetries: 2,
          retryDelay: 10,
        })
      ).rejects.toThrow('Always fails');

      // 1 initial + 2 retries = 3 attempts
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should reset error count on success', async () => {
      // First, cause some errors
      const failingFn = vi.fn().mockRejectedValue(new Error('Fail'));
      try {
        await errorRecoveryService.withRetry(failingFn, 'test-key', {
          maxRetries: 1,
          retryDelay: 10,
        });
      } catch {}

      // Now succeed
      const successFn = vi.fn().mockResolvedValue('success');
      await errorRecoveryService.withRetry(successFn, 'test-key');

      // Circuit should be closed after success
      const circuit = errorRecoveryService.getCircuitState('test-key');
      expect(circuit.errorCount).toBe(0);
      expect(circuit.state).toBe('closed');
    });
  });

  describe('withFallback', () => {
    it('should return result on success', () => {
      const result = errorRecoveryService.withFallback(
        () => 'success',
        'fallback'
      );
      expect(result).toBe('success');
    });

    it('should return fallback on error', () => {
      const result = errorRecoveryService.withFallback(
        () => { throw new Error('Fail'); },
        'fallback',
        'test-key'
      );
      expect(result).toBe('fallback');
    });

    it('should record error when key is provided', () => {
      errorRecoveryService.withFallback(
        () => { throw new Error('Fail'); },
        'fallback',
        'fallback-test'
      );

      const stats = errorRecoveryService.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('withAsyncFallback', () => {
    it('should return result on success', async () => {
      const result = await errorRecoveryService.withAsyncFallback(
        async () => 'success',
        'fallback'
      );
      expect(result).toBe('success');
    });

    it('should return fallback on error', async () => {
      const result = await errorRecoveryService.withAsyncFallback(
        async () => { throw new Error('Fail'); },
        'fallback',
        'async-test'
      );
      expect(result).toBe('fallback');
    });
  });

  describe('circuit breaker', () => {
    it('should open circuit after threshold errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      // Trigger multiple failures
      for (let i = 0; i < DEFAULT_ERROR_CONFIG.circuitBreakerThreshold; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'circuit-test', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      // Circuit should now be open
      expect(errorRecoveryService.isCircuitOpen('circuit-test')).toBe(true);
    });

    it('should throw immediately when circuit is open', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      // Open the circuit
      for (let i = 0; i < DEFAULT_ERROR_CONFIG.circuitBreakerThreshold; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'circuit-test-2', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      const callCount = mockFn.mock.calls.length;

      // Try again - should throw immediately without calling fn
      await expect(
        errorRecoveryService.withRetry(mockFn, 'circuit-test-2')
      ).rejects.toThrow(/Circuit breaker open/);

      // Function should not have been called again
      expect(mockFn).toHaveBeenCalledTimes(callCount);
    });

    it('should return correct circuit state', () => {
      const circuit = errorRecoveryService.getCircuitState('nonexistent');
      expect(circuit.state).toBe('closed');
      expect(circuit.errorCount).toBe(0);
    });
  });

  describe('error logging', () => {
    it('should log errors', () => {
      const error = new Error('Test error');
      errorRecoveryService.logError(error, { test: true }, 'TestComponent');

      const recentErrors = errorRecoveryService.getRecentErrors(1);
      expect(recentErrors.length).toBe(1);
      expect(recentErrors[0].error.message).toBe('Test error');
      expect(recentErrors[0].component).toBe('TestComponent');
    });

    it('should mark errors as recovered', () => {
      const error = new Error('Recoverable');
      errorRecoveryService.logError(error);

      const errors = errorRecoveryService.getRecentErrors(1);
      const timestamp = errors[0].timestamp;

      errorRecoveryService.markRecovered(timestamp);

      const updatedErrors = errorRecoveryService.getRecentErrors(1);
      expect(updatedErrors[0].recovered).toBe(true);
    });

    it('should limit log size', () => {
      // Log more than 100 errors
      for (let i = 0; i < 150; i++) {
        errorRecoveryService.logError(new Error(`Error ${i}`));
      }

      const allErrors = errorRecoveryService.getRecentErrors(200);
      expect(allErrors.length).toBeLessThanOrEqual(100);
    });
  });

  describe('error stats', () => {
    it('should track total errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'stats-test', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      const stats = errorRecoveryService.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThanOrEqual(3);
    });

    it('should track errors by type', () => {
      const typeError = new TypeError('Type error');
      const rangeError = new RangeError('Range error');

      errorRecoveryService.logError(typeError);
      errorRecoveryService.logError(typeError);
      errorRecoveryService.logError(rangeError);

      const stats = errorRecoveryService.getErrorStats();
      expect(stats.errorsByType.get('TypeError')).toBe(2);
      expect(stats.errorsByType.get('RangeError')).toBe(1);
    });

    it('should track last error', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Last error'));

      try {
        await errorRecoveryService.withRetry(mockFn, 'last-error-test', {
          maxRetries: 0,
          retryDelay: 10,
        });
      } catch {}

      const stats = errorRecoveryService.getErrorStats();
      expect(stats.lastError?.message).toBe('Last error');
      expect(stats.lastErrorTime).not.toBeNull();
    });
  });

  describe('degradation', () => {
    it('should return full level with no errors', () => {
      const level = errorRecoveryService.getDegradationLevel('clean-key');
      expect(level).toBe('full');
    });

    it('should return simple level with few errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      // Cause 2 errors
      for (let i = 0; i < 2; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'degrade-test', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      const level = errorRecoveryService.getDegradationLevel('degrade-test');
      expect(level).toBe('simple');
    });

    it('should return minimal level with many errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      // Cause 4 errors
      for (let i = 0; i < 4; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'degrade-test-2', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      const level = errorRecoveryService.getDegradationLevel('degrade-test-2');
      expect(level).toBe('minimal');
    });

    it('should indicate when feature should be disabled', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      // Cause enough errors to open circuit
      for (let i = 0; i < DEFAULT_ERROR_CONFIG.circuitBreakerThreshold; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'disable-test', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      expect(errorRecoveryService.shouldDisableFeature('disable-test')).toBe(true);
    });
  });

  describe('configuration', () => {
    it('should update config', () => {
      const originalConfig = errorRecoveryService.getConfig();

      errorRecoveryService.updateConfig({ maxRetries: 10 });

      const newConfig = errorRecoveryService.getConfig();
      expect(newConfig.maxRetries).toBe(10);

      // Restore original config
      errorRecoveryService.updateConfig({ maxRetries: originalConfig.maxRetries });
    });

    it('should return current config', () => {
      const config = errorRecoveryService.getConfig();
      expect(config.maxRetries).toBeDefined();
      expect(config.retryDelay).toBeDefined();
      expect(config.circuitBreakerThreshold).toBeDefined();
    });
  });

  describe('clearErrors', () => {
    it('should reset all error state', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      // Cause some errors
      for (let i = 0; i < 3; i++) {
        try {
          await errorRecoveryService.withRetry(mockFn, 'clear-test', {
            maxRetries: 0,
            retryDelay: 10,
          });
        } catch {}
      }

      errorRecoveryService.clearErrors();

      const stats = errorRecoveryService.getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.lastError).toBeNull();
      expect(errorRecoveryService.getRecentErrors(100).length).toBe(0);
    });
  });
});

describe('sanitizeErrorMessage', () => {
  it('should hide API keys', () => {
    const error = new Error('API error: api_key=secret123');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[HIDDEN]');
    expect(sanitized).not.toContain('secret123');
  });

  it('should hide tokens', () => {
    const error = new Error('Auth failed: token=abc123xyz');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[HIDDEN]');
    expect(sanitized).not.toContain('abc123xyz');
  });

  it('should hide passwords', () => {
    const error = new Error('Login failed: password=mypassword');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[HIDDEN]');
    expect(sanitized).not.toContain('mypassword');
  });

  it('should hide URLs', () => {
    const error = new Error('Failed to fetch https://api.example.com/data');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[URL]');
    expect(sanitized).not.toContain('https://api.example.com');
  });

  it('should hide emails', () => {
    const error = new Error('User not found: user@example.com');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[EMAIL]');
    expect(sanitized).not.toContain('user@example.com');
  });

  it('should handle empty message', () => {
    const error = new Error('');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toBe('Ett oväntat fel uppstod');
  });
});

describe('getUserFriendlyMessage', () => {
  it('should return Swedish message for NetworkError', () => {
    const error = new Error('Network failed');
    error.name = 'NetworkError';
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('Nätverksfel');
  });

  it('should return Swedish message for TimeoutError', () => {
    const error = new Error('Timed out');
    error.name = 'TimeoutError';
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('tog för lång tid');
  });

  it('should return generic message for unknown errors', () => {
    const error = new Error('Something unknown');
    error.name = 'UnknownError';
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('oväntat fel');
  });
});

describe('isRetryableError', () => {
  it('should return true for retryable errors', () => {
    const error = new Error('Network failed');
    error.name = 'NetworkError';
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for AuthenticationError', () => {
    const error = new Error('Unauthorized');
    error.name = 'AuthenticationError';
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for ValidationError', () => {
    const error = new Error('Invalid input');
    error.name = 'ValidationError';
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for NotFoundError', () => {
    const error = new Error('Resource not found');
    error.name = 'NotFoundError';
    expect(isRetryableError(error)).toBe(false);
  });
});
