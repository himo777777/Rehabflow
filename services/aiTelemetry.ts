/**
 * AI Telemetry Service
 *
 * Tracks AI call performance metrics:
 * - Latency (response times)
 * - Success/failure rates
 * - Token usage estimates
 * - Error types
 *
 * Enables performance monitoring and optimization decisions.
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AICallMetric {
  id: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorType?: string;
  cached: boolean;
  inputTokens?: number;
  outputTokens?: number;
  model: string;
  metadata?: Record<string, unknown>;
}

export interface AITelemetryStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  cachedCalls: number;
  successRate: number;
  cacheHitRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  errorBreakdown: Record<string, number>;
  operationStats: Record<string, OperationStats>;
}

interface OperationStats {
  count: number;
  successRate: number;
  avgLatencyMs: number;
  cacheHitRate: number;
}

// ============================================================================
// TELEMETRY SERVICE
// ============================================================================

class AITelemetryService {
  private metrics: AICallMetric[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 metrics
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Start periodic cleanup
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Start tracking an AI call
   */
  startCall(operation: string, model: string, metadata?: Record<string, unknown>): string {
    if (!this.isEnabled) return '';

    const id = `${operation}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const metric: AICallMetric = {
      id,
      operation,
      startTime: performance.now(),
      success: false,
      cached: false,
      model,
      metadata,
    };

    this.metrics.push(metric);
    return id;
  }

  /**
   * Record successful completion
   */
  endCall(
    id: string,
    options: {
      cached?: boolean;
      inputTokens?: number;
      outputTokens?: number;
    } = {}
  ): void {
    if (!this.isEnabled || !id) return;

    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = true;
      metric.cached = options.cached || false;
      metric.inputTokens = options.inputTokens;
      metric.outputTokens = options.outputTokens;

      // Log slow calls (> 5 seconds)
      if (metric.duration > 5000) {
        logger.warn('[AI Telemetry] Slow call detected:', {
          operation: metric.operation,
          duration: Math.round(metric.duration),
          cached: metric.cached,
        });
      }
    }
  }

  /**
   * Record failed call
   */
  failCall(id: string, errorType: string): void {
    if (!this.isEnabled || !id) return;

    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = false;
      metric.errorType = errorType;

      logger.error('[AI Telemetry] Call failed:', {
        operation: metric.operation,
        errorType,
        duration: Math.round(metric.duration || 0),
      });
    }
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): AITelemetryStats {
    const completedMetrics = this.metrics.filter(m => m.endTime !== undefined);
    const successfulMetrics = completedMetrics.filter(m => m.success);
    const cachedMetrics = completedMetrics.filter(m => m.cached);
    const latencies = successfulMetrics.map(m => m.duration || 0).sort((a, b) => a - b);

    // Calculate percentiles
    const getPercentile = (arr: number[], p: number): number => {
      if (arr.length === 0) return 0;
      const index = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };

    // Error breakdown
    const errorBreakdown: Record<string, number> = {};
    completedMetrics
      .filter(m => !m.success && m.errorType)
      .forEach(m => {
        errorBreakdown[m.errorType!] = (errorBreakdown[m.errorType!] || 0) + 1;
      });

    // Operation-level stats
    const operationStats: Record<string, OperationStats> = {};
    const operations = [...new Set(completedMetrics.map(m => m.operation))];

    operations.forEach(op => {
      const opMetrics = completedMetrics.filter(m => m.operation === op);
      const opSuccess = opMetrics.filter(m => m.success);
      const opCached = opMetrics.filter(m => m.cached);
      const opLatencies = opSuccess.map(m => m.duration || 0);

      operationStats[op] = {
        count: opMetrics.length,
        successRate: opMetrics.length > 0 ? opSuccess.length / opMetrics.length : 0,
        avgLatencyMs: opLatencies.length > 0
          ? opLatencies.reduce((a, b) => a + b, 0) / opLatencies.length
          : 0,
        cacheHitRate: opMetrics.length > 0 ? opCached.length / opMetrics.length : 0,
      };
    });

    return {
      totalCalls: completedMetrics.length,
      successfulCalls: successfulMetrics.length,
      failedCalls: completedMetrics.length - successfulMetrics.length,
      cachedCalls: cachedMetrics.length,
      successRate: completedMetrics.length > 0
        ? successfulMetrics.length / completedMetrics.length
        : 0,
      cacheHitRate: completedMetrics.length > 0
        ? cachedMetrics.length / completedMetrics.length
        : 0,
      avgLatencyMs: latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0,
      p50LatencyMs: getPercentile(latencies, 50),
      p95LatencyMs: getPercentile(latencies, 95),
      p99LatencyMs: getPercentile(latencies, 99),
      totalInputTokens: completedMetrics.reduce((sum, m) => sum + (m.inputTokens || 0), 0),
      totalOutputTokens: completedMetrics.reduce((sum, m) => sum + (m.outputTokens || 0), 0),
      errorBreakdown,
      operationStats,
    };
  }

  /**
   * Get recent metrics for debugging
   */
  getRecentMetrics(count: number = 10): AICallMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable telemetry
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      logger.info('[AI Telemetry] Disabled');
    }
  }

  /**
   * Cleanup old metrics to prevent memory issues
   */
  private cleanup(): void {
    if (this.metrics.length > this.maxMetrics) {
      const removeCount = this.metrics.length - this.maxMetrics;
      this.metrics.splice(0, removeCount);
      logger.info(`[AI Telemetry] Cleaned up ${removeCount} old metrics`);
    }
  }

  /**
   * Stop the telemetry service
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const aiTelemetry = new AITelemetryService();

// ============================================================================
// UTILITY WRAPPER
// ============================================================================

/**
 * Wrap an async AI function with telemetry
 */
export function withTelemetry<T extends (...args: unknown[]) => Promise<unknown>>(
  operation: string,
  model: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const callId = aiTelemetry.startCall(operation, model);

    try {
      const result = await fn(...args);
      aiTelemetry.endCall(callId, { cached: false });
      return result;
    } catch (error) {
      const errorType = error instanceof Error ? error.name : 'UnknownError';
      aiTelemetry.failCall(callId, errorType);
      throw error;
    }
  }) as T;
}

/**
 * Estimate tokens for a text (rough approximation: ~4 chars per token)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export default aiTelemetry;
