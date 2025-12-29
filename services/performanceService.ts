/**
 * Performance Monitoring Service
 *
 * Comprehensive performance tracking and optimization:
 * - Component render time tracking
 * - Network request monitoring
 * - Memory usage tracking
 * - Frame rate monitoring
 * - Bottleneck detection
 * - Performance budgets
 * - Lazy loading optimization
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'fps' | 'bytes' | 'percent' | 'count';
  timestamp: number;
  category: MetricCategory;
  threshold?: number;
  passed?: boolean;
}

export type MetricCategory =
  | 'render'
  | 'network'
  | 'memory'
  | 'fps'
  | 'interaction'
  | 'resource'
  | 'model';

export interface PerformanceBudget {
  metric: string;
  threshold: number;
  severity: 'warning' | 'error';
}

export interface ComponentTiming {
  componentName: string;
  mountTime: number;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

export interface NetworkTiming {
  url: string;
  method: string;
  startTime: number;
  duration: number;
  size: number;
  cached: boolean;
  status: number;
}

export interface FrameMetrics {
  fps: number;
  frameTime: number;
  jank: number;
  dropped: number;
}

export interface PerformanceReport {
  timestamp: number;
  duration: number;
  metrics: PerformanceMetric[];
  budgetViolations: PerformanceBudget[];
  recommendations: string[];
  score: number;
}

export interface LazyLoadConfig {
  threshold: number; // Intersection observer threshold
  rootMargin: string;
  placeholder?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BUDGETS: PerformanceBudget[] = [
  { metric: 'firstContentfulPaint', threshold: 1800, severity: 'warning' },
  { metric: 'largestContentfulPaint', threshold: 2500, severity: 'error' },
  { metric: 'firstInputDelay', threshold: 100, severity: 'warning' },
  { metric: 'cumulativeLayoutShift', threshold: 0.1, severity: 'warning' },
  { metric: 'timeToInteractive', threshold: 3800, severity: 'error' },
  { metric: 'modelLoadTime', threshold: 3000, severity: 'warning' },
  { metric: 'poseInferenceTime', threshold: 50, severity: 'warning' },
  { metric: 'componentRender', threshold: 16, severity: 'warning' },
  { metric: 'apiLatency', threshold: 500, severity: 'warning' },
  { metric: 'memoryUsage', threshold: 200 * 1024 * 1024, severity: 'error' }, // 200MB
];

// ============================================================================
// MAIN SERVICE
// ============================================================================

class PerformanceService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private componentTimings: Map<string, ComponentTiming> = new Map();
  private networkTimings: NetworkTiming[] = [];
  private frameMetricsHistory: FrameMetrics[] = [];
  private budgets: PerformanceBudget[] = [...DEFAULT_BUDGETS];
  private isMonitoring: boolean = false;
  private frameCallback: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private observers: Map<string, IntersectionObserver> = new Map();

  // Lazy loading queue
  private lazyLoadQueue: Map<string, () => Promise<unknown>> = new Map();
  private loadedModules: Set<string> = new Set();

  constructor() {
    this.initWebVitals();
  }

  // ============================================
  // WEB VITALS
  // ============================================

  private initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({
              name: 'firstContentfulPaint',
              value: entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'render',
            });
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch {
      // Observer not supported
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric({
          name: 'largestContentfulPaint',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'render',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // Observer not supported
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        for (const entry of entries) {
          if (entry.processingStart) {
            this.recordMetric({
              name: 'firstInputDelay',
              value: entry.processingStart - entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'interaction',
            });
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // Observer not supported
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value || 0;
            this.recordMetric({
              name: 'cumulativeLayoutShift',
              value: clsValue,
              unit: 'count',
              timestamp: Date.now(),
              category: 'render',
            });
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // Observer not supported
    }
  }

  // ============================================
  // METRIC RECORDING
  // ============================================

  recordMetric(metric: PerformanceMetric): void {
    const existing = this.metrics.get(metric.name) || [];

    // Check against budget
    const budget = this.budgets.find(b => b.metric === metric.name);
    if (budget) {
      metric.threshold = budget.threshold;
      metric.passed = metric.value <= budget.threshold;

      if (!metric.passed) {
        logger.warn(`[Performance] Budget violation: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${budget.threshold})`);
      }
    }

    existing.push(metric);

    // Keep only last 100 entries per metric
    if (existing.length > 100) {
      existing.shift();
    }

    this.metrics.set(metric.name, existing);
  }

  // ============================================
  // COMPONENT TIMING
  // ============================================

  startComponentMount(componentName: string): () => void {
    const startTime = performance.now();

    return () => {
      const mountTime = performance.now() - startTime;
      const existing = this.componentTimings.get(componentName);

      if (existing) {
        existing.mountTime = mountTime;
        existing.renderCount++;
        existing.totalRenderTime += mountTime;
        existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
        existing.lastRenderTime = mountTime;
      } else {
        this.componentTimings.set(componentName, {
          componentName,
          mountTime,
          renderCount: 1,
          totalRenderTime: mountTime,
          averageRenderTime: mountTime,
          lastRenderTime: mountTime,
        });
      }

      this.recordMetric({
        name: `component_${componentName}`,
        value: mountTime,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'render',
      });

      if (mountTime > 16) {
        logger.debug(`[Performance] Slow component: ${componentName} took ${mountTime.toFixed(2)}ms`);
      }
    };
  }

  recordRender(componentName: string, renderTime: number): void {
    const existing = this.componentTimings.get(componentName);

    if (existing) {
      existing.renderCount++;
      existing.totalRenderTime += renderTime;
      existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
      existing.lastRenderTime = renderTime;
    } else {
      this.componentTimings.set(componentName, {
        componentName,
        mountTime: renderTime,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
      });
    }
  }

  // ============================================
  // NETWORK TIMING
  // ============================================

  recordNetworkRequest(timing: NetworkTiming): void {
    this.networkTimings.push(timing);

    // Keep only last 50 requests
    if (this.networkTimings.length > 50) {
      this.networkTimings.shift();
    }

    this.recordMetric({
      name: 'apiLatency',
      value: timing.duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'network',
    });

    if (timing.duration > 500) {
      logger.debug(`[Performance] Slow request: ${timing.url} took ${timing.duration.toFixed(0)}ms`);
    }
  }

  createFetchWrapper(): typeof fetch {
    const originalFetch = fetch;
    const service = this;

    return async function wrappedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const startTime = performance.now();
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;

        service.recordNetworkRequest({
          url,
          method,
          startTime,
          duration,
          size: parseInt(response.headers.get('content-length') || '0', 10),
          cached: response.headers.get('x-cache') === 'HIT',
          status: response.status,
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        service.recordNetworkRequest({
          url,
          method,
          startTime,
          duration,
          size: 0,
          cached: false,
          status: 0,
        });
        throw error;
      }
    };
  }

  // ============================================
  // FRAME RATE MONITORING
  // ============================================

  startFrameMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    const measureFrame = (timestamp: number) => {
      if (!this.isMonitoring) return;

      const frameTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;
      this.frameCount++;

      // Calculate FPS every second
      if (this.frameCount % 60 === 0) {
        const fps = 1000 / (frameTime || 16.67);
        const jank = frameTime > 50 ? 1 : 0;
        const dropped = Math.max(0, Math.floor(frameTime / 16.67) - 1);

        const metrics: FrameMetrics = {
          fps: Math.min(60, Math.round(fps)),
          frameTime,
          jank,
          dropped,
        };

        this.frameMetricsHistory.push(metrics);
        if (this.frameMetricsHistory.length > 60) {
          this.frameMetricsHistory.shift();
        }

        this.recordMetric({
          name: 'fps',
          value: metrics.fps,
          unit: 'fps',
          timestamp: Date.now(),
          category: 'fps',
        });

        if (metrics.fps < 30) {
          logger.warn(`[Performance] Low FPS: ${metrics.fps}`);
        }
      }

      this.frameCallback = requestAnimationFrame(measureFrame);
    };

    this.frameCallback = requestAnimationFrame(measureFrame);
  }

  stopFrameMonitoring(): void {
    this.isMonitoring = false;
    if (this.frameCallback !== null) {
      cancelAnimationFrame(this.frameCallback);
      this.frameCallback = null;
    }
  }

  // ============================================
  // MEMORY MONITORING
  // ============================================

  getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number; limit: number } | null {
    if (typeof window === 'undefined') return null;

    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (!memory) return null;

    const usage = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };

    this.recordMetric({
      name: 'memoryUsage',
      value: usage.usedJSHeapSize,
      unit: 'bytes',
      timestamp: Date.now(),
      category: 'memory',
    });

    return usage;
  }

  // ============================================
  // LAZY LOADING
  // ============================================

  registerLazyModule(id: string, loader: () => Promise<unknown>): void {
    if (!this.loadedModules.has(id)) {
      this.lazyLoadQueue.set(id, loader);
    }
  }

  async loadModule(id: string): Promise<unknown> {
    if (this.loadedModules.has(id)) {
      return null;
    }

    const loader = this.lazyLoadQueue.get(id);
    if (!loader) {
      logger.warn(`[Performance] Module not registered: ${id}`);
      return null;
    }

    const startTime = performance.now();

    try {
      const module = await loader();
      const loadTime = performance.now() - startTime;

      this.loadedModules.add(id);
      this.lazyLoadQueue.delete(id);

      this.recordMetric({
        name: `lazyLoad_${id}`,
        value: loadTime,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'resource',
      });

      logger.debug(`[Performance] Lazy loaded ${id} in ${loadTime.toFixed(0)}ms`);
      return module;
    } catch (error) {
      logger.error(`[Performance] Failed to load module: ${id}`, error);
      throw error;
    }
  }

  preloadModule(id: string): void {
    // Use requestIdleCallback if available
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        this.loadModule(id);
      });
    } else {
      setTimeout(() => this.loadModule(id), 100);
    }
  }

  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    config: LazyLoadConfig = { threshold: 0.1, rootMargin: '50px' }
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      threshold: config.threshold,
      rootMargin: config.rootMargin,
    });

    return observer;
  }

  // ============================================
  // PERFORMANCE BUDGETS
  // ============================================

  setBudget(metric: string, threshold: number, severity: 'warning' | 'error' = 'warning'): void {
    const existing = this.budgets.findIndex(b => b.metric === metric);
    const budget = { metric, threshold, severity };

    if (existing >= 0) {
      this.budgets[existing] = budget;
    } else {
      this.budgets.push(budget);
    }
  }

  checkBudgets(): PerformanceBudget[] {
    const violations: PerformanceBudget[] = [];

    for (const budget of this.budgets) {
      const metrics = this.metrics.get(budget.metric);
      if (metrics && metrics.length > 0) {
        const lastMetric = metrics[metrics.length - 1];
        if (lastMetric.value > budget.threshold) {
          violations.push(budget);
        }
      }
    }

    return violations;
  }

  // ============================================
  // REPORTS
  // ============================================

  generateReport(): PerformanceReport {
    const timestamp = Date.now();
    const allMetrics: PerformanceMetric[] = [];

    // Collect all recent metrics
    this.metrics.forEach((metrics) => {
      if (metrics.length > 0) {
        allMetrics.push(metrics[metrics.length - 1]);
      }
    });

    const violations = this.checkBudgets();
    const recommendations = this.generateRecommendations(allMetrics, violations);
    const score = this.calculatePerformanceScore(allMetrics, violations);

    return {
      timestamp,
      duration: 0,
      metrics: allMetrics,
      budgetViolations: violations,
      recommendations,
      score,
    };
  }

  private generateRecommendations(
    metrics: PerformanceMetric[],
    violations: PerformanceBudget[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for slow components
    const slowComponents = Array.from(this.componentTimings.values())
      .filter(c => c.averageRenderTime > 16);

    if (slowComponents.length > 0) {
      recommendations.push(
        `Consider optimizing ${slowComponents.length} slow components: ${slowComponents.map(c => c.componentName).join(', ')}`
      );
    }

    // Check for slow network requests
    const slowRequests = this.networkTimings.filter(n => n.duration > 500);
    if (slowRequests.length > 0) {
      recommendations.push(
        `${slowRequests.length} slow network requests detected. Consider caching or optimization.`
      );
    }

    // Check FPS
    const fpsMetrics = metrics.filter(m => m.name === 'fps');
    if (fpsMetrics.length > 0) {
      const avgFps = fpsMetrics.reduce((sum, m) => sum + m.value, 0) / fpsMetrics.length;
      if (avgFps < 30) {
        recommendations.push('Low frame rate detected. Consider reducing visual complexity.');
      }
    }

    // Check memory
    const memoryMetric = metrics.find(m => m.name === 'memoryUsage');
    if (memoryMetric && memoryMetric.value > 100 * 1024 * 1024) {
      recommendations.push('High memory usage. Consider implementing cleanup routines.');
    }

    // Add recommendations for violations
    for (const violation of violations) {
      recommendations.push(
        `${violation.metric} exceeds ${violation.severity} threshold (${violation.threshold})`
      );
    }

    return recommendations;
  }

  private calculatePerformanceScore(
    metrics: PerformanceMetric[],
    violations: PerformanceBudget[]
  ): number {
    let score = 100;

    // Deduct for violations
    for (const violation of violations) {
      score -= violation.severity === 'error' ? 15 : 5;
    }

    // Check key metrics
    const lcp = metrics.find(m => m.name === 'largestContentfulPaint');
    if (lcp) {
      if (lcp.value > 4000) score -= 20;
      else if (lcp.value > 2500) score -= 10;
    }

    const fid = metrics.find(m => m.name === 'firstInputDelay');
    if (fid) {
      if (fid.value > 300) score -= 15;
      else if (fid.value > 100) score -= 5;
    }

    const cls = metrics.find(m => m.name === 'cumulativeLayoutShift');
    if (cls) {
      if (cls.value > 0.25) score -= 15;
      else if (cls.value > 0.1) score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  // ============================================
  // UTILITIES
  // ============================================

  getMetric(name: string): PerformanceMetric | null {
    const metrics = this.metrics.get(name);
    return metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  getMetricHistory(name: string, limit: number = 20): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    return metrics.slice(-limit);
  }

  getComponentTimings(): ComponentTiming[] {
    return Array.from(this.componentTimings.values());
  }

  getNetworkTimings(): NetworkTiming[] {
    return [...this.networkTimings];
  }

  getFrameMetrics(): FrameMetrics[] {
    return [...this.frameMetricsHistory];
  }

  getAverageFPS(): number {
    if (this.frameMetricsHistory.length === 0) return 60;
    return this.frameMetricsHistory.reduce((sum, m) => sum + m.fps, 0) / this.frameMetricsHistory.length;
  }

  clear(): void {
    this.metrics.clear();
    this.componentTimings.clear();
    this.networkTimings.length = 0;
    this.frameMetricsHistory.length = 0;
  }

  // ============================================
  // MARKS AND MEASURES
  // ============================================

  mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark: string): number {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        return measure.duration;
      } catch {
        return 0;
      }
    }
    return 0;
  }
}

// Singleton export
export const performanceService = new PerformanceService();
export default performanceService;

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  return {
    onMount: () => performanceService.startComponentMount(componentName),
    recordRender: (time: number) => performanceService.recordRender(componentName, time),
    mark: (name: string) => performanceService.mark(`${componentName}_${name}`),
  };
}
