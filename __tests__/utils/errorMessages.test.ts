import { describe, it, expect } from 'vitest';
import { ERROR_MESSAGES, getErrorMessage } from '../../utils/errorMessages';

describe('errorMessages', () => {
  describe('ERROR_MESSAGES', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.TIMEOUT).toBeDefined();
      expect(ERROR_MESSAGES.API_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBeDefined();
    });

    it('should have Swedish error messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toContain('internet');
      expect(ERROR_MESSAGES.REQUIRED_FIELD).toContain('obligatoriskt');
    });
  });

  describe('getErrorMessage', () => {
    it('should return network error for fetch errors', () => {
      const error = new Error('network error occurred');
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should return timeout error for timeout', () => {
      const error = new Error('timeout exceeded');
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.TIMEOUT);
    });

    it('should return rate limit error for 429', () => {
      const error = new Error('rate limit 429');
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.API_RATE_LIMIT);
    });

    it('should return fallback message for unknown errors', () => {
      const error = new Error('some random error');
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });

    it('should use custom fallback key', () => {
      const error = new Error('some error');
      expect(getErrorMessage(error, 'API_ERROR')).toBe(ERROR_MESSAGES.API_ERROR);
    });
  });
});
