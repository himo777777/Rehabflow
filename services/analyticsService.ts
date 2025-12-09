/**
 * Analytics Service - Sprint 5.6
 *
 * Privacy-focused analytics for tracking user interactions and app performance.
 * Features:
 * - Event tracking
 * - Session tracking
 * - Performance metrics
 * - User journey tracking
 * - Conversion funnels
 * - Privacy-compliant (GDPR)
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type EventCategory =
  | 'navigation'
  | 'exercise'
  | 'user_action'
  | 'error'
  | 'performance'
  | 'engagement'
  | 'conversion';

export interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface SessionInfo {
  id: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  events: number;
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
  screen: {
    width: number;
    height: number;
  };
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  sampleRate: number; // 0-1, percentage of events to track
  batchSize: number;  // Events to batch before sending
  flushInterval: number; // ms between flushes
  endpoint?: string;  // Optional remote endpoint
  respectDoNotTrack: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 1.0,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  respectDoNotTrack: true,
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const SESSION_KEY = 'rehabflow-analytics-session';
const EVENTS_KEY = 'rehabflow-analytics-events';
const CONSENT_KEY = 'rehabflow-analytics-consent';

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

class AnalyticsService {
  private config: AnalyticsConfig = DEFAULT_CONFIG;
  private session: SessionInfo | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private hasConsent: boolean = false;

  constructor() {
    this.loadConsent();
    this.initSession();
    this.setupPerformanceObserver();
    this.startFlushTimer();
    this.setupBeforeUnload();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadConsent(): void {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      this.hasConsent = consent === 'true';

      // Check Do Not Track
      if (this.config.respectDoNotTrack && navigator.doNotTrack === '1') {
        this.hasConsent = false;
      }
    } catch {
      this.hasConsent = false;
    }
  }

  private initSession(): void {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        this.session = JSON.parse(stored);
      } else {
        this.session = this.createSession();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
      }
    } catch {
      this.session = this.createSession();
    }
  }

  private createSession(): SessionInfo {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      device: this.getDeviceInfo(),
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private getDeviceInfo(): SessionInfo['device'] {
    const ua = navigator.userAgent;

    // Detect device type
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobi|Android/i.test(ua)) {
      type = /Tablet|iPad/i.test(ua) ? 'tablet' : 'mobile';
    }

    // Detect OS
    let os = 'unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

    // Detect browser
    let browser = 'unknown';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Edg/i.test(ua)) browser = 'Edge';

    return { type, os, browser };
  }

  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackPerformance(entry.name, entry.startTime);
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.trackPerformance('lcp', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          this.trackPerformance('fid', fidEntry.processingStart - fidEntry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe layout shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        });
        this.trackPerformance('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.debug('[Analytics] Performance observer error:', error);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.endSession();
      this.flush(true); // Force flush
    });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });
  }

  // --------------------------------------------------------------------------
  // CONSENT MANAGEMENT
  // --------------------------------------------------------------------------

  public setConsent(consent: boolean): void {
    this.hasConsent = consent;
    localStorage.setItem(CONSENT_KEY, consent ? 'true' : 'false');

    if (!consent) {
      this.clearData();
    }

    logger.debug('[Analytics] Consent set to:', consent);
  }

  public getConsent(): boolean {
    return this.hasConsent;
  }

  public clearData(): void {
    this.eventQueue = [];
    this.performanceMetrics = [];
    localStorage.removeItem(EVENTS_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    logger.debug('[Analytics] Data cleared');
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  public configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart flush timer if interval changed
    if (config.flushInterval) {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
      this.startFlushTimer();
    }

    logger.debug('[Analytics] Config updated:', config);
  }

  // --------------------------------------------------------------------------
  // EVENT TRACKING
  // --------------------------------------------------------------------------

  private shouldTrack(): boolean {
    if (!this.config.enabled) return false;
    if (!this.hasConsent) return false;
    if (Math.random() > this.config.sampleRate) return false;
    return true;
  }

  /**
   * Track a generic event
   */
  public track(
    category: EventCategory,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.session?.id || 'unknown',
    };

    this.eventQueue.push(event);

    if (this.session) {
      this.session.events++;
    }

    if (this.config.debug) {
      logger.debug('[Analytics] Event:', event);
    }

    // Auto-flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track a page view
   */
  public trackPageView(path: string, title?: string): void {
    this.track('navigation', 'page_view', path, undefined, { title });

    if (this.session) {
      this.session.pageViews++;
    }
  }

  /**
   * Track an exercise event
   */
  public trackExercise(
    action: 'start' | 'complete' | 'pause' | 'resume' | 'skip',
    exerciseName: string,
    metadata?: Record<string, unknown>
  ): void {
    this.track('exercise', action, exerciseName, undefined, metadata);
  }

  /**
   * Track a user action
   */
  public trackAction(action: string, element?: string, value?: number): void {
    this.track('user_action', action, element, value);
  }

  /**
   * Track an error
   */
  public trackError(error: Error | string, context?: Record<string, unknown>): void {
    const errorMessage = error instanceof Error ? error.message : error;
    this.track('error', 'exception', errorMessage, undefined, {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  /**
   * Track performance metric
   */
  public trackPerformance(name: string, value: number, metadata?: Record<string, unknown>): void {
    if (!this.shouldTrack()) return;

    this.performanceMetrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    if (this.config.debug) {
      logger.debug('[Analytics] Performance:', name, value);
    }
  }

  /**
   * Track engagement time
   */
  public trackEngagement(duration: number, section?: string): void {
    this.track('engagement', 'time_spent', section, duration);
  }

  /**
   * Track conversion event
   */
  public trackConversion(funnel: string, step: string, value?: number): void {
    this.track('conversion', funnel, step, value);
  }

  // --------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  public getSession(): SessionInfo | null {
    return this.session;
  }

  private endSession(): void {
    if (this.session) {
      this.session.endTime = Date.now();
      const duration = this.session.endTime - this.session.startTime;
      this.trackEngagement(duration);
    }
  }

  // --------------------------------------------------------------------------
  // DATA FLUSHING
  // --------------------------------------------------------------------------

  private async flush(sync: boolean = false): Promise<void> {
    if (this.eventQueue.length === 0 && this.performanceMetrics.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    const metrics = [...this.performanceMetrics];

    this.eventQueue = [];
    this.performanceMetrics = [];

    // Store locally
    try {
      const storedEvents = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
      storedEvents.push(...events);
      // Keep only last 1000 events
      const trimmed = storedEvents.slice(-1000);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      logger.error('[Analytics] Failed to store events:', error);
    }

    // Send to endpoint if configured
    if (this.config.endpoint) {
      const payload = {
        events,
        metrics,
        session: this.session,
      };

      if (sync && navigator.sendBeacon) {
        navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
      } else {
        try {
          await fetch(this.config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          });
        } catch (error) {
          // Re-queue events on failure
          this.eventQueue.unshift(...events);
          this.performanceMetrics.unshift(...metrics);
          logger.error('[Analytics] Failed to send:', error);
        }
      }
    }

    if (this.config.debug) {
      logger.debug('[Analytics] Flushed', events.length, 'events,', metrics.length, 'metrics');
    }
  }

  // --------------------------------------------------------------------------
  // REPORTING
  // --------------------------------------------------------------------------

  /**
   * Get stored events
   */
  public getStoredEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get aggregated stats
   */
  public getStats(): {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    sessionDuration: number;
    pageViews: number;
  } {
    const events = this.getStoredEvents();
    const eventsByCategory: Record<string, number> = {};

    events.forEach((e) => {
      eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      eventsByCategory,
      sessionDuration: this.session
        ? Date.now() - this.session.startTime
        : 0,
      pageViews: this.session?.pageViews || 0,
    };
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  public dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(true);
  }
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const analyticsService = new AnalyticsService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  const location = useLocation?.();

  // Track page views on route change
  useEffect(() => {
    if (location) {
      analyticsService.trackPageView(location.pathname, document.title);
    }
  }, [location?.pathname]);

  const track = useCallback(
    (
      category: EventCategory,
      action: string,
      label?: string,
      value?: number
    ) => {
      analyticsService.track(category, action, label, value);
    },
    []
  );

  const trackExercise = useCallback(
    (
      action: 'start' | 'complete' | 'pause' | 'resume' | 'skip',
      exerciseName: string,
      metadata?: Record<string, unknown>
    ) => {
      analyticsService.trackExercise(action, exerciseName, metadata);
    },
    []
  );

  const trackAction = useCallback((action: string, element?: string) => {
    analyticsService.trackAction(action, element);
  }, []);

  const trackError = useCallback(
    (error: Error | string, context?: Record<string, unknown>) => {
      analyticsService.trackError(error, context);
    },
    []
  );

  return {
    track,
    trackExercise,
    trackAction,
    trackError,
    trackConversion: analyticsService.trackConversion.bind(analyticsService),
    setConsent: analyticsService.setConsent.bind(analyticsService),
    getConsent: analyticsService.getConsent.bind(analyticsService),
    getStats: analyticsService.getStats.bind(analyticsService),
  };
}

export default analyticsService;
