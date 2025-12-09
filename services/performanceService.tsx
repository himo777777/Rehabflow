/**
 * Performance Profiling Service - Sprint 5.12
 *
 * Monitors and profiles application performance metrics.
 * Features:
 * - Web Vitals tracking (LCP, FID, CLS, TTFB, FCP)
 * - Component render timing
 * - Memory usage monitoring
 * - Network request tracking
 * - Frame rate monitoring
 * - Performance budgets and alerts
 */

import React from 'react';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface WebVitals {
  lcp: number | null;   // Largest Contentful Paint
  fid: number | null;   // First Input Delay
  cls: number | null;   // Cumulative Layout Shift
  ttfb: number | null;  // Time to First Byte
  fcp: number | null;   // First Contentful Paint
  inp: number | null;   // Interaction to Next Paint
}

export interface ComponentMetric {
  name: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenders: number; // Renders > 16ms
}

export interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: number;
  cached: boolean;
}

export interface MemoryMetric {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface FrameMetric {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  timestamp: number;
}

export interface PerformanceBudget {
  metric: keyof WebVitals | 'fps' | 'memory' | 'componentRender';
  threshold: number;
  comparison: 'lt' | 'gt' | 'lte' | 'gte';
}

export interface BudgetViolation {
  budget: PerformanceBudget;
  actualValue: number;
  timestamp: number;
  context?: string;
}

export interface PerformanceReport {
  timestamp: string;
  sessionDuration: number;
  webVitals: WebVitals;
  components: ComponentMetric[];
  networkSummary: {
    totalRequests: number;
    totalSize: number;
    averageLatency: number;
    slowRequests: number;
    failedRequests: number;
  };
  memorySummary: {
    peakUsage: number;
    averageUsage: number;
    leakSuspected: boolean;
  };
  frameSummary: {
    averageFps: number;
    minFps: number;
    droppedFrames: number;
  };
  violations: BudgetViolation[];
  score: number; // 0-100 performance score
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'rehabflow-performance-data';
const MAX_NETWORK_ENTRIES = 100;
const MAX_MEMORY_SAMPLES = 60;
const MAX_FRAME_SAMPLES = 60;
const MEMORY_SAMPLE_INTERVAL = 5000; // 5 seconds
const FRAME_SAMPLE_INTERVAL = 1000; // 1 second

// Default performance budgets
const DEFAULT_BUDGETS: PerformanceBudget[] = [
  { metric: 'lcp', threshold: 2500, comparison: 'lte' },
  { metric: 'fid', threshold: 100, comparison: 'lte' },
  { metric: 'cls', threshold: 0.1, comparison: 'lte' },
  { metric: 'ttfb', threshold: 800, comparison: 'lte' },
  { metric: 'fcp', threshold: 1800, comparison: 'lte' },
  { metric: 'fps', threshold: 30, comparison: 'gte' },
  { metric: 'componentRender', threshold: 16, comparison: 'lte' },
];

// ============================================================================
// PERFORMANCE SERVICE
// ============================================================================

class PerformanceService {
  private sessionStart: number = Date.now();
  private webVitals: WebVitals = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    inp: null,
  };

  private componentMetrics: Map<string, ComponentMetric> = new Map();
  private networkMetrics: NetworkMetric[] = [];
  private memoryMetrics: MemoryMetric[] = [];
  private frameMetrics: FrameMetric[] = [];
  private budgets: PerformanceBudget[] = [...DEFAULT_BUDGETS];
  private violations: BudgetViolation[] = [];

  private memoryInterval: number | null = null;
  private frameInterval: number | null = null;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private rafId: number | null = null;

  private observers: {
    performance?: PerformanceObserver;
    longtask?: PerformanceObserver;
  } = {};

  constructor() {
    this.initializeObservers();
    this.startMonitoring();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private initializeObservers(): void {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      // Web Vitals observer
      this.observers.performance = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      this.observers.performance.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'],
      });

      // Long task observer
      this.observers.longtask = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.warn('[Performance] Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });

      try {
        this.observers.longtask.observe({ entryTypes: ['longtask'] });
      } catch {
        // longtask not supported
      }

      // Navigation timing
      this.captureNavigationTiming();

    } catch (error) {
      logger.error('[Performance] Failed to initialize observers:', error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.fcp = entry.startTime;
          this.checkBudget('fcp', entry.startTime);
        }
        break;

      case 'largest-contentful-paint':
        this.webVitals.lcp = entry.startTime;
        this.checkBudget('lcp', entry.startTime);
        break;

      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        this.webVitals.fid = fidEntry.processingStart - fidEntry.startTime;
        this.checkBudget('fid', this.webVitals.fid);
        break;

      case 'layout-shift':
        const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!clsEntry.hadRecentInput) {
          this.webVitals.cls = (this.webVitals.cls || 0) + clsEntry.value;
          this.checkBudget('cls', this.webVitals.cls);
        }
        break;
    }
  }

  private captureNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.webVitals.ttfb = navigation.responseStart - navigation.requestStart;
      this.checkBudget('ttfb', this.webVitals.ttfb);
    }
  }

  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Memory monitoring
    this.memoryInterval = window.setInterval(() => {
      this.sampleMemory();
    }, MEMORY_SAMPLE_INTERVAL);

    // Frame rate monitoring
    this.frameInterval = window.setInterval(() => {
      this.recordFrameMetric();
    }, FRAME_SAMPLE_INTERVAL);

    // Start frame counting
    this.startFrameCounting();

    // Network monitoring
    this.interceptFetch();
  }

  // --------------------------------------------------------------------------
  // MEMORY MONITORING
  // --------------------------------------------------------------------------

  private sampleMemory(): void {
    if (typeof window === 'undefined') return;

    const memory = (performance as Performance & { memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }}).memory;

    if (memory) {
      const metric: MemoryMetric = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      };

      this.memoryMetrics.push(metric);

      // Trim old samples
      while (this.memoryMetrics.length > MAX_MEMORY_SAMPLES) {
        this.memoryMetrics.shift();
      }

      // Check for memory leak
      if (this.memoryMetrics.length >= 10) {
        const recent = this.memoryMetrics.slice(-10);
        const trend = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
        const duration = recent[recent.length - 1].timestamp - recent[0].timestamp;

        // If memory growing > 1MB per minute, warn
        if (trend > 1024 * 1024 && duration > 60000) {
          logger.warn('[Performance] Potential memory leak detected:', {
            growth: `${(trend / 1024 / 1024).toFixed(2)}MB`,
            duration: `${(duration / 1000).toFixed(0)}s`,
          });
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // FRAME RATE MONITORING
  // --------------------------------------------------------------------------

  private startFrameCounting(): void {
    if (typeof window === 'undefined') return;

    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    const countFrame = (timestamp: number) => {
      this.frameCount++;
      this.rafId = requestAnimationFrame(countFrame);
    };

    this.rafId = requestAnimationFrame(countFrame);
  }

  private recordFrameMetric(): void {
    const now = performance.now();
    const elapsed = (now - this.lastFrameTime) / 1000;
    const fps = this.frameCount / elapsed;

    const expectedFrames = Math.round(elapsed * 60);
    const droppedFrames = Math.max(0, expectedFrames - this.frameCount);

    const metric: FrameMetric = {
      fps: Math.round(fps),
      frameTime: elapsed / this.frameCount * 1000,
      droppedFrames,
      timestamp: Date.now(),
    };

    this.frameMetrics.push(metric);
    this.checkBudget('fps', fps);

    // Trim old samples
    while (this.frameMetrics.length > MAX_FRAME_SAMPLES) {
      this.frameMetrics.shift();
    }

    // Reset counters
    this.frameCount = 0;
    this.lastFrameTime = now;
  }

  // --------------------------------------------------------------------------
  // NETWORK MONITORING
  // --------------------------------------------------------------------------

  private interceptFetch(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args) {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = (args[1]?.method || 'GET').toUpperCase();

      try {
        const response = await originalFetch.apply(this, args);
        const duration = performance.now() - startTime;

        // Clone response to read size
        const clone = response.clone();
        const blob = await clone.blob();

        self.recordNetworkMetric({
          url,
          method,
          duration,
          size: blob.size,
          status: response.status,
          timestamp: Date.now(),
          cached: response.headers.get('x-cache') === 'HIT',
        });

        return response;
      } catch (error) {
        self.recordNetworkMetric({
          url,
          method,
          duration: performance.now() - startTime,
          size: 0,
          status: 0,
          timestamp: Date.now(),
          cached: false,
        });
        throw error;
      }
    };
  }

  private recordNetworkMetric(metric: NetworkMetric): void {
    this.networkMetrics.push(metric);

    // Trim old entries
    while (this.networkMetrics.length > MAX_NETWORK_ENTRIES) {
      this.networkMetrics.shift();
    }

    // Log slow requests
    if (metric.duration > 3000) {
      logger.warn('[Performance] Slow network request:', {
        url: metric.url,
        duration: `${metric.duration.toFixed(0)}ms`,
      });
    }
  }

  // --------------------------------------------------------------------------
  // COMPONENT PROFILING
  // --------------------------------------------------------------------------

  /**
   * Start timing a component render
   */
  public startComponentRender(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordComponentRender(name, duration);
    };
  }

  /**
   * Record a component render time
   */
  public recordComponentRender(name: string, duration: number): void {
    const existing = this.componentMetrics.get(name);

    if (existing) {
      existing.renderCount++;
      existing.totalRenderTime += duration;
      existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
      existing.lastRenderTime = duration;
      if (duration > 16) {
        existing.slowRenders++;
      }
    } else {
      this.componentMetrics.set(name, {
        name,
        renderCount: 1,
        totalRenderTime: duration,
        averageRenderTime: duration,
        lastRenderTime: duration,
        slowRenders: duration > 16 ? 1 : 0,
      });
    }

    this.checkBudget('componentRender', duration, name);
  }

  /**
   * React profiler callback
   */
  public onRenderCallback(
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ): void {
    this.recordComponentRender(`${id}:${phase}`, actualDuration);
  }

  // --------------------------------------------------------------------------
  // BUDGET MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Add performance budget
   */
  public addBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  /**
   * Remove performance budget
   */
  public removeBudget(metric: string): void {
    this.budgets = this.budgets.filter(b => b.metric !== metric);
  }

  /**
   * Check value against budget
   */
  private checkBudget(
    metric: keyof WebVitals | 'fps' | 'memory' | 'componentRender',
    value: number,
    context?: string
  ): void {
    const budget = this.budgets.find(b => b.metric === metric);
    if (!budget) return;

    let violated = false;
    switch (budget.comparison) {
      case 'lt':
        violated = value >= budget.threshold;
        break;
      case 'lte':
        violated = value > budget.threshold;
        break;
      case 'gt':
        violated = value <= budget.threshold;
        break;
      case 'gte':
        violated = value < budget.threshold;
        break;
    }

    if (violated) {
      const violation: BudgetViolation = {
        budget,
        actualValue: value,
        timestamp: Date.now(),
        context,
      };
      this.violations.push(violation);

      logger.warn('[Performance] Budget violation:', {
        metric,
        threshold: budget.threshold,
        actual: value,
        context,
      });
    }
  }

  // --------------------------------------------------------------------------
  // METRICS ACCESS
  // --------------------------------------------------------------------------

  /**
   * Get current Web Vitals
   */
  public getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  /**
   * Get component metrics
   */
  public getComponentMetrics(): ComponentMetric[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.totalRenderTime - a.totalRenderTime);
  }

  /**
   * Get network metrics
   */
  public getNetworkMetrics(): NetworkMetric[] {
    return [...this.networkMetrics];
  }

  /**
   * Get memory metrics
   */
  public getMemoryMetrics(): MemoryMetric[] {
    return [...this.memoryMetrics];
  }

  /**
   * Get frame metrics
   */
  public getFrameMetrics(): FrameMetric[] {
    return [...this.frameMetrics];
  }

  /**
   * Get budget violations
   */
  public getViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  // --------------------------------------------------------------------------
  // REPORTING
  // --------------------------------------------------------------------------

  /**
   * Generate performance report
   */
  public generateReport(): PerformanceReport {
    const sessionDuration = Date.now() - this.sessionStart;

    // Network summary
    const networkSummary = {
      totalRequests: this.networkMetrics.length,
      totalSize: this.networkMetrics.reduce((sum, m) => sum + m.size, 0),
      averageLatency: this.networkMetrics.length > 0
        ? this.networkMetrics.reduce((sum, m) => sum + m.duration, 0) / this.networkMetrics.length
        : 0,
      slowRequests: this.networkMetrics.filter(m => m.duration > 3000).length,
      failedRequests: this.networkMetrics.filter(m => m.status === 0 || m.status >= 400).length,
    };

    // Memory summary
    const memoryValues = this.memoryMetrics.map(m => m.usedJSHeapSize);
    const memorySummary = {
      peakUsage: Math.max(...memoryValues, 0),
      averageUsage: memoryValues.length > 0
        ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length
        : 0,
      leakSuspected: this.checkMemoryLeak(),
    };

    // Frame summary
    const fpsValues = this.frameMetrics.map(m => m.fps);
    const frameSummary = {
      averageFps: fpsValues.length > 0
        ? Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length)
        : 60,
      minFps: Math.min(...fpsValues, 60),
      droppedFrames: this.frameMetrics.reduce((sum, m) => sum + m.droppedFrames, 0),
    };

    // Calculate performance score
    const score = this.calculatePerformanceScore();

    return {
      timestamp: new Date().toISOString(),
      sessionDuration,
      webVitals: this.getWebVitals(),
      components: this.getComponentMetrics(),
      networkSummary,
      memorySummary,
      frameSummary,
      violations: this.getViolations(),
      score,
    };
  }

  private checkMemoryLeak(): boolean {
    if (this.memoryMetrics.length < 10) return false;

    const recent = this.memoryMetrics.slice(-10);
    const trend = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
    const duration = recent[recent.length - 1].timestamp - recent[0].timestamp;

    // Growing > 500KB per minute is suspicious
    return trend > 512 * 1024 && duration > 60000;
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    const weights = {
      lcp: 25,
      fid: 20,
      cls: 15,
      ttfb: 10,
      fcp: 10,
      fps: 10,
      memory: 10,
    };

    // LCP scoring
    if (this.webVitals.lcp !== null) {
      if (this.webVitals.lcp > 4000) score -= weights.lcp;
      else if (this.webVitals.lcp > 2500) score -= weights.lcp * 0.5;
    }

    // FID scoring
    if (this.webVitals.fid !== null) {
      if (this.webVitals.fid > 300) score -= weights.fid;
      else if (this.webVitals.fid > 100) score -= weights.fid * 0.5;
    }

    // CLS scoring
    if (this.webVitals.cls !== null) {
      if (this.webVitals.cls > 0.25) score -= weights.cls;
      else if (this.webVitals.cls > 0.1) score -= weights.cls * 0.5;
    }

    // TTFB scoring
    if (this.webVitals.ttfb !== null) {
      if (this.webVitals.ttfb > 1800) score -= weights.ttfb;
      else if (this.webVitals.ttfb > 800) score -= weights.ttfb * 0.5;
    }

    // FCP scoring
    if (this.webVitals.fcp !== null) {
      if (this.webVitals.fcp > 3000) score -= weights.fcp;
      else if (this.webVitals.fcp > 1800) score -= weights.fcp * 0.5;
    }

    // FPS scoring
    const avgFps = this.frameMetrics.length > 0
      ? this.frameMetrics.reduce((sum, m) => sum + m.fps, 0) / this.frameMetrics.length
      : 60;
    if (avgFps < 30) score -= weights.fps;
    else if (avgFps < 50) score -= weights.fps * 0.5;

    // Violations penalty
    score -= Math.min(20, this.violations.length * 2);

    return Math.max(0, Math.round(score));
  }

  // --------------------------------------------------------------------------
  // MARKS AND MEASURES
  // --------------------------------------------------------------------------

  /**
   * Create a performance mark
   */
  public mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`rehabflow:${name}`);
    }
  }

  /**
   * Measure between two marks
   */
  public measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance === 'undefined') return 0;

    try {
      const start = `rehabflow:${startMark}`;
      const end = endMark ? `rehabflow:${endMark}` : undefined;

      performance.measure(`rehabflow:${name}`, start, end);

      const entries = performance.getEntriesByName(`rehabflow:${name}`, 'measure');
      const duration = entries[entries.length - 1]?.duration || 0;

      logger.debug('[Performance] Measure:', { name, duration });
      return duration;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all marks and measures
   */
  public clearMarks(): void {
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  /**
   * Stop monitoring and cleanup
   */
  public destroy(): void {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.observers.performance) {
      this.observers.performance.disconnect();
    }
    if (this.observers.longtask) {
      this.observers.longtask.disconnect();
    }
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.sessionStart = Date.now();
    this.webVitals = {
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      fcp: null,
      inp: null,
    };
    this.componentMetrics.clear();
    this.networkMetrics = [];
    this.memoryMetrics = [];
    this.frameMetrics = [];
    this.violations = [];
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const performanceService = new PerformanceService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for performance monitoring
 */
export function usePerformance() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [webVitals, setWebVitals] = useState<WebVitals>(performanceService.getWebVitals());

  useEffect(() => {
    // Update periodically
    const interval = setInterval(() => {
      setWebVitals(performanceService.getWebVitals());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateReport = useCallback(() => {
    const newReport = performanceService.generateReport();
    setReport(newReport);
    return newReport;
  }, []);

  const mark = useCallback((name: string) => {
    performanceService.mark(name);
  }, []);

  const measure = useCallback((name: string, startMark: string, endMark?: string) => {
    return performanceService.measure(name, startMark, endMark);
  }, []);

  return {
    webVitals,
    report,
    generateReport,
    mark,
    measure,
    getComponentMetrics: performanceService.getComponentMetrics.bind(performanceService),
    getNetworkMetrics: performanceService.getNetworkMetrics.bind(performanceService),
    getMemoryMetrics: performanceService.getMemoryMetrics.bind(performanceService),
    getFrameMetrics: performanceService.getFrameMetrics.bind(performanceService),
    getViolations: performanceService.getViolations.bind(performanceService),
  };
}

/**
 * Hook for profiling component renders
 */
export function useProfiler(componentName: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    const endRender = performanceService.startComponentRender(componentName);
    renderCount.current++;
    return endRender;
  });

  return { renderCount: renderCount.current };
}

/**
 * React Profiler wrapper component
 */
export function ProfilerWrapper({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <React.Profiler
      id={id}
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        performanceService.onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime);
      }}
    >
      {children}
    </React.Profiler>
  );
}

export default performanceService;
