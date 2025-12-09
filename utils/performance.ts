/**
 * Performance Monitoring Utility
 *
 * Tracks key performance metrics:
 * - Core Web Vitals (LCP, FID, CLS)
 * - Custom timing measurements
 * - Component render times
 */

import { logger } from './logger';

// ============================================
// TYPES
// ============================================

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface TimingMeasurement {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// ============================================
// CORE WEB VITALS THRESHOLDS
// ============================================

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
};

// ============================================
// METRICS STORAGE
// ============================================

const metrics: PerformanceMetric[] = [];
const timings = new Map<string, TimingMeasurement>();

// ============================================
// RATING FUNCTIONS
// ============================================

function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

// ============================================
// TIMING FUNCTIONS
// ============================================

/**
 * Start timing a named operation
 */
export function startTiming(name: string): void {
  timings.set(name, {
    name,
    startTime: performance.now()
  });
}

/**
 * End timing a named operation and get duration
 */
export function endTiming(name: string): number | null {
  const timing = timings.get(name);
  if (!timing) {
    logger.warn(`Timing not found: ${name}`);
    return null;
  }

  timing.endTime = performance.now();
  timing.duration = timing.endTime - timing.startTime;

  logger.debug(`Timing [${name}]: ${timing.duration.toFixed(2)}ms`);
  timings.delete(name);

  return timing.duration;
}

/**
 * Measure an async operation
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  startTiming(name);
  try {
    const result = await fn();
    endTiming(name);
    return result;
  } catch (error) {
    endTiming(name);
    throw error;
  }
}

/**
 * Measure a sync operation
 */
export function measureSync<T>(name: string, fn: () => T): T {
  startTiming(name);
  try {
    const result = fn();
    endTiming(name);
    return result;
  } catch (error) {
    endTiming(name);
    throw error;
  }
}

// ============================================
// CORE WEB VITALS
// ============================================

/**
 * Initialize Web Vitals monitoring
 * Call this once on app load
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      const value = lastEntry.startTime;

      recordMetric('LCP', value, getRating(value, THRESHOLDS.LCP));
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch {
    // LCP not supported
  }

  // First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      entries.forEach((entry) => {
        const value = entry.processingStart - entry.startTime;
        recordMetric('FID', value, getRating(value, THRESHOLDS.FID));
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch {
    // FID not supported
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[];
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      recordMetric('CLS', clsValue, getRating(clsValue, THRESHOLDS.CLS));
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch {
    // CLS not supported
  }

  // Navigation Timing
  if (performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;

        // Time to First Byte
        const ttfb = timing.responseStart - timing.requestStart;
        if (ttfb > 0) {
          recordMetric('TTFB', ttfb, getRating(ttfb, THRESHOLDS.TTFB));
        }

        // First Contentful Paint (from paint timing)
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          recordMetric('FCP', fcp.startTime, getRating(fcp.startTime, THRESHOLDS.FCP));
        }
      }, 0);
    });
  }
}

// ============================================
// METRIC RECORDING
// ============================================

function recordMetric(
  name: string,
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor'
): void {
  const metric: PerformanceMetric = {
    name,
    value,
    rating,
    timestamp: Date.now()
  };

  metrics.push(metric);
  logger.info(`Performance [${name}]: ${value.toFixed(2)}ms (${rating})`);

  // In production, you could send this to an analytics service
  // sendToAnalytics(metric);
}

/**
 * Record a custom metric
 */
export function recordCustomMetric(
  name: string,
  value: number,
  thresholds?: { good: number; poor: number }
): void {
  const rating = thresholds
    ? getRating(value, thresholds)
    : value < 100 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';

  recordMetric(name, value, rating);
}

// ============================================
// REPORTING
// ============================================

/**
 * Get all recorded metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(): Record<string, { latest: number; rating: string }> {
  const summary: Record<string, { latest: number; rating: string }> = {};

  metrics.forEach((metric) => {
    // Only keep the latest value for each metric
    if (!summary[metric.name] || metric.timestamp > summary[metric.name].latest) {
      summary[metric.name] = {
        latest: metric.value,
        rating: metric.rating
      };
    }
  });

  return summary;
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

// ============================================
// REACT INTEGRATION HELPERS
// ============================================

/**
 * Create a render timing hook
 * Usage in component:
 *   useEffect(() => {
 *     const cleanup = trackRender('MyComponent');
 *     return cleanup;
 *   }, []);
 */
export function trackRender(componentName: string): () => void {
  startTiming(`render_${componentName}`);

  // Return cleanup function that ends timing
  return () => {
    endTiming(`render_${componentName}`);
  };
}

/**
 * Measure component mount time
 * Call at start of useEffect with empty deps
 */
export function measureMount(componentName: string): void {
  startTiming(`mount_${componentName}`);
  queueMicrotask(() => {
    endTiming(`mount_${componentName}`);
  });
}

// ============================================
// INITIALIZATION
// ============================================

// Auto-initialize on load
if (typeof window !== 'undefined') {
  initWebVitals();
}

export default {
  startTiming,
  endTiming,
  measureAsync,
  measureSync,
  recordCustomMetric,
  getMetrics,
  getMetricsSummary,
  clearMetrics,
  trackRender,
  measureMount
};
