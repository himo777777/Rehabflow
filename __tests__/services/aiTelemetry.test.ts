/**
 * Tests for AI Telemetry Service
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiTelemetry, estimateTokens, withTelemetry } from '../../services/aiTelemetry';

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock performance.now
const mockNow = vi.fn();
let currentTime = 0;

vi.stubGlobal('performance', {
  now: () => {
    currentTime += 100; // Each call advances by 100ms
    return currentTime;
  },
});

describe('aiTelemetry', () => {
  beforeEach(() => {
    aiTelemetry.clear();
    currentTime = 0;
    aiTelemetry.setEnabled(true);
  });

  describe('startCall', () => {
    it('should generate unique call ID', () => {
      const id1 = aiTelemetry.startCall('test-op', 'gpt-4');
      const id2 = aiTelemetry.startCall('test-op', 'gpt-4');

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should include operation name in ID', () => {
      const id = aiTelemetry.startCall('my-operation', 'gpt-4');

      expect(id).toContain('my-operation');
    });

    it('should return empty string when disabled', () => {
      aiTelemetry.setEnabled(false);
      const id = aiTelemetry.startCall('test-op', 'gpt-4');

      expect(id).toBe('');
    });
  });

  describe('endCall', () => {
    it('should mark call as successful', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.endCall(id);

      const stats = aiTelemetry.getStats();
      expect(stats.successfulCalls).toBe(1);
      expect(stats.failedCalls).toBe(0);
    });

    it('should record cache hit', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.endCall(id, { cached: true });

      const stats = aiTelemetry.getStats();
      expect(stats.cachedCalls).toBe(1);
      expect(stats.cacheHitRate).toBe(1);
    });

    it('should record token counts', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.endCall(id, { inputTokens: 100, outputTokens: 50 });

      const stats = aiTelemetry.getStats();
      expect(stats.totalInputTokens).toBe(100);
      expect(stats.totalOutputTokens).toBe(50);
    });

    it('should calculate duration', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      // performance.now advances 100ms each call
      aiTelemetry.endCall(id);

      const metrics = aiTelemetry.getRecentMetrics(1);
      expect(metrics[0].duration).toBeGreaterThan(0);
    });
  });

  describe('failCall', () => {
    it('should mark call as failed', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.failCall(id, 'NetworkError');

      const stats = aiTelemetry.getStats();
      expect(stats.failedCalls).toBe(1);
      expect(stats.successfulCalls).toBe(0);
    });

    it('should record error type', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.failCall(id, 'RateLimitError');

      const stats = aiTelemetry.getStats();
      expect(stats.errorBreakdown).toHaveProperty('RateLimitError');
      expect(stats.errorBreakdown['RateLimitError']).toBe(1);
    });

    it('should track multiple error types', () => {
      const id1 = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.failCall(id1, 'NetworkError');

      const id2 = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.failCall(id2, 'RateLimitError');

      const id3 = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.failCall(id3, 'NetworkError');

      const stats = aiTelemetry.getStats();
      expect(stats.errorBreakdown['NetworkError']).toBe(2);
      expect(stats.errorBreakdown['RateLimitError']).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return empty stats when no calls', () => {
      const stats = aiTelemetry.getStats();

      expect(stats.totalCalls).toBe(0);
      expect(stats.successfulCalls).toBe(0);
      expect(stats.failedCalls).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('should calculate success rate correctly', () => {
      // 3 successful calls
      for (let i = 0; i < 3; i++) {
        const id = aiTelemetry.startCall('test-op', 'gpt-4');
        aiTelemetry.endCall(id);
      }

      // 1 failed call
      const failId = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.failCall(failId, 'Error');

      const stats = aiTelemetry.getStats();
      expect(stats.successRate).toBe(0.75); // 3/4 = 0.75
    });

    it('should calculate percentiles', () => {
      // Create 10 calls with known durations
      for (let i = 0; i < 10; i++) {
        const id = aiTelemetry.startCall('test-op', 'gpt-4');
        aiTelemetry.endCall(id);
      }

      const stats = aiTelemetry.getStats();
      expect(stats.p50LatencyMs).toBeGreaterThan(0);
      expect(stats.p95LatencyMs).toBeGreaterThan(0);
      expect(stats.p99LatencyMs).toBeGreaterThan(0);
    });

    it('should calculate operation-level stats', () => {
      const id1 = aiTelemetry.startCall('operation-a', 'gpt-4');
      aiTelemetry.endCall(id1);

      const id2 = aiTelemetry.startCall('operation-b', 'gpt-4');
      aiTelemetry.endCall(id2);

      const id3 = aiTelemetry.startCall('operation-a', 'gpt-4');
      aiTelemetry.failCall(id3, 'Error');

      const stats = aiTelemetry.getStats();

      expect(stats.operationStats['operation-a']).toBeDefined();
      expect(stats.operationStats['operation-a'].count).toBe(2);
      expect(stats.operationStats['operation-a'].successRate).toBe(0.5);

      expect(stats.operationStats['operation-b']).toBeDefined();
      expect(stats.operationStats['operation-b'].count).toBe(1);
      expect(stats.operationStats['operation-b'].successRate).toBe(1);
    });
  });

  describe('getRecentMetrics', () => {
    it('should return recent metrics', () => {
      const id1 = aiTelemetry.startCall('op-1', 'gpt-4');
      aiTelemetry.endCall(id1);

      const id2 = aiTelemetry.startCall('op-2', 'gpt-4');
      aiTelemetry.endCall(id2);

      const metrics = aiTelemetry.getRecentMetrics(2);
      expect(metrics).toHaveLength(2);
    });

    it('should limit to requested count', () => {
      for (let i = 0; i < 20; i++) {
        const id = aiTelemetry.startCall(`op-${i}`, 'gpt-4');
        aiTelemetry.endCall(id);
      }

      const metrics = aiTelemetry.getRecentMetrics(5);
      expect(metrics).toHaveLength(5);
    });
  });

  describe('clear', () => {
    it('should clear all metrics', () => {
      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      aiTelemetry.endCall(id);

      expect(aiTelemetry.getStats().totalCalls).toBe(1);

      aiTelemetry.clear();

      expect(aiTelemetry.getStats().totalCalls).toBe(0);
    });
  });

  describe('setEnabled', () => {
    it('should disable tracking when set to false', () => {
      aiTelemetry.setEnabled(false);

      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      expect(id).toBe('');

      aiTelemetry.endCall(id);

      const stats = aiTelemetry.getStats();
      expect(stats.totalCalls).toBe(0);
    });

    it('should re-enable tracking', () => {
      aiTelemetry.setEnabled(false);
      aiTelemetry.setEnabled(true);

      const id = aiTelemetry.startCall('test-op', 'gpt-4');
      expect(id).not.toBe('');
    });
  });
});

describe('estimateTokens', () => {
  it('should estimate tokens based on character count', () => {
    // ~4 chars per token
    expect(estimateTokens('test')).toBe(1);
    expect(estimateTokens('12345678')).toBe(2);
    expect(estimateTokens('')).toBe(0);
  });

  it('should round up partial tokens', () => {
    expect(estimateTokens('12345')).toBe(2); // 5/4 = 1.25, rounds to 2
  });
});

describe('withTelemetry', () => {
  beforeEach(() => {
    aiTelemetry.clear();
    aiTelemetry.setEnabled(true);
  });

  it('should wrap async function with telemetry', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const wrappedFn = withTelemetry('test-op', 'gpt-4', mockFn);

    const result = await wrappedFn('arg1', 'arg2');

    expect(result).toBe('result');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

    const stats = aiTelemetry.getStats();
    expect(stats.successfulCalls).toBe(1);
  });

  it('should track failed calls', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));
    const wrappedFn = withTelemetry('test-op', 'gpt-4', mockFn);

    await expect(wrappedFn()).rejects.toThrow('Test error');

    const stats = aiTelemetry.getStats();
    expect(stats.failedCalls).toBe(1);
    expect(stats.errorBreakdown).toHaveProperty('Error');
  });
});
