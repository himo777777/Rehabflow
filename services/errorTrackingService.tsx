/**
 * Error Tracking & Monitoring Service - Sprint 5.14
 *
 * Comprehensive error tracking and monitoring system.
 * Features:
 * - Global error catching
 * - Error deduplication
 * - Stack trace parsing
 * - Error grouping
 * - Performance monitoring
 * - User session context
 * - Breadcrumb trail
 * - Error reporting API
 */

import React from 'react';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';
export type BreadcrumbType = 'navigation' | 'ui' | 'network' | 'console' | 'user' | 'error';

export interface ErrorEvent {
  id: string;
  timestamp: string;
  message: string;
  name: string;
  stack?: string;
  severity: ErrorSeverity;
  tags: Record<string, string>;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
  fingerprint: string;
  groupId: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
  ignored: boolean;
}

export interface ErrorContext {
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  deviceType: string;
  platform: string;
  language: string;
  viewport: { width: number; height: number };
  memory?: { used: number; total: number };
  appVersion: string;
  extra?: Record<string, unknown>;
}

export interface Breadcrumb {
  timestamp: string;
  type: BreadcrumbType;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  level: ErrorSeverity;
}

export interface StackFrame {
  filename: string;
  function: string;
  lineno: number;
  colno: number;
  inApp: boolean;
}

export interface ErrorGroup {
  id: string;
  fingerprint: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  severity: ErrorSeverity;
  affectedUsers: Set<string>;
  resolved: boolean;
}

export interface ErrorStats {
  total: number;
  bysSeverity: Record<ErrorSeverity, number>;
  byHour: number[];
  topErrors: { message: string; count: number }[];
  affectedSessions: number;
  errorRate: number;
}

export interface ErrorTrackingConfig {
  enabled: boolean;
  maxBreadcrumbs: number;
  maxErrors: number;
  sampleRate: number;
  ignoreErrors: RegExp[];
  ignoreUrls: RegExp[];
  captureConsole: boolean;
  captureNetwork: boolean;
  captureUnhandledRejections: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_ERRORS = 'rehabflow-errors';
const STORAGE_KEY_BREADCRUMBS = 'rehabflow-breadcrumbs';
const STORAGE_KEY_SESSION = 'rehabflow-error-session';
const APP_VERSION = '1.0.0';

const DEFAULT_CONFIG: ErrorTrackingConfig = {
  enabled: true,
  maxBreadcrumbs: 50,
  maxErrors: 100,
  sampleRate: 1.0,
  ignoreErrors: [
    /ResizeObserver loop/,
    /Script error/,
    /ChunkLoadError/,
  ],
  ignoreUrls: [
    /extensions\//,
    /^chrome:\/\//,
  ],
  captureConsole: true,
  captureNetwork: true,
  captureUnhandledRejections: true,
};

// ============================================================================
// ERROR TRACKING SERVICE
// ============================================================================

class ErrorTrackingService {
  private config: ErrorTrackingConfig = DEFAULT_CONFIG;
  private errors: Map<string, ErrorEvent> = new Map();
  private errorGroups: Map<string, ErrorGroup> = new Map();
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private userId?: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize error tracking
   */
  public init(config?: Partial<ErrorTrackingConfig>): void {
    if (this.isInitialized) return;

    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.enabled) {
      logger.info('[ErrorTracking] Disabled');
      return;
    }

    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
    this.setupConsoleCapture();
    this.setupNetworkCapture();
    this.setupNavigationTracking();

    this.isInitialized = true;
    logger.info('[ErrorTracking] Initialized');
  }

  private generateSessionId(): string {
    const stored = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (stored) return stored;

    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(STORAGE_KEY_SESSION, id);
    return id;
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const errors = localStorage.getItem(STORAGE_KEY_ERRORS);
      if (errors) {
        const parsed = JSON.parse(errors) as ErrorEvent[];
        parsed.forEach(e => this.errors.set(e.id, e));
        this.rebuildGroups();
      }
    } catch (error) {
      logger.error('[ErrorTracking] Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const errors = Array.from(this.errors.values())
        .slice(-this.config.maxErrors);
      localStorage.setItem(STORAGE_KEY_ERRORS, JSON.stringify(errors));
    } catch (error) {
      logger.error('[ErrorTracking] Failed to save to storage:', error);
    }
  }

  // --------------------------------------------------------------------------
  // ERROR HANDLERS
  // --------------------------------------------------------------------------

  private setupGlobalErrorHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }

  private setupUnhandledRejectionHandler(): void {
    if (typeof window === 'undefined' || !this.config.captureUnhandledRejections) return;

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      this.captureError(error, {
        type: 'unhandledrejection',
      });
    });
  }

  private setupConsoleCapture(): void {
    if (typeof console === 'undefined' || !this.config.captureConsole) return;

    const originalError = console.error;
    const self = this;

    console.error = function(...args) {
      self.addBreadcrumb({
        type: 'console',
        category: 'console.error',
        message: args.map(a => String(a)).join(' '),
        level: 'error',
      });
      originalError.apply(console, args);
    };

    const originalWarn = console.warn;
    console.warn = function(...args) {
      self.addBreadcrumb({
        type: 'console',
        category: 'console.warn',
        message: args.map(a => String(a)).join(' '),
        level: 'warning',
      });
      originalWarn.apply(console, args);
    };
  }

  private setupNetworkCapture(): void {
    if (typeof window === 'undefined' || !this.config.captureNetwork) return;

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = (args[1]?.method || 'GET').toUpperCase();
      const startTime = Date.now();

      try {
        const response = await originalFetch.apply(this, args);

        self.addBreadcrumb({
          type: 'network',
          category: 'fetch',
          message: `${method} ${url}`,
          data: {
            status: response.status,
            duration: Date.now() - startTime,
          },
          level: response.ok ? 'info' : 'error',
        });

        return response;
      } catch (error) {
        self.addBreadcrumb({
          type: 'network',
          category: 'fetch',
          message: `${method} ${url} failed`,
          data: {
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime,
          },
          level: 'error',
        });
        throw error;
      }
    };
  }

  private setupNavigationTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page navigation
    const self = this;
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      self.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        message: `Navigate to ${args[2]}`,
        data: { from: location.href, to: args[2] },
        level: 'info',
      });
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      self.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        message: `Replace state: ${args[2]}`,
        data: { from: location.href, to: args[2] },
        level: 'info',
      });
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener('popstate', () => {
      self.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        message: `Navigate to ${location.href}`,
        level: 'info',
      });
    });
  }

  // --------------------------------------------------------------------------
  // ERROR CAPTURE
  // --------------------------------------------------------------------------

  /**
   * Capture an error
   */
  public captureError(
    error: Error,
    extra?: Record<string, unknown>
  ): ErrorEvent | null {
    if (!this.config.enabled) return null;

    // Check sample rate
    if (Math.random() > this.config.sampleRate) {
      return null;
    }

    // Check ignore patterns
    if (this.shouldIgnore(error)) {
      return null;
    }

    const fingerprint = this.generateFingerprint(error);
    const groupId = this.getOrCreateGroup(error, fingerprint);

    // Check for existing error with same fingerprint
    const existing = Array.from(this.errors.values())
      .find(e => e.fingerprint === fingerprint);

    if (existing) {
      existing.count++;
      existing.lastSeen = new Date().toISOString();
      this.errors.set(existing.id, existing);
      this.saveToStorage();
      return existing;
    }

    const event: ErrorEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      message: error.message,
      name: error.name,
      stack: error.stack,
      severity: this.determineSeverity(error),
      tags: this.buildTags(extra),
      context: this.buildContext(extra),
      breadcrumbs: [...this.breadcrumbs],
      fingerprint,
      groupId,
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      resolved: false,
      ignored: false,
    };

    this.errors.set(event.id, event);
    this.trimErrors();
    this.saveToStorage();

    logger.error('[ErrorTracking] Captured:', event.message);
    return event;
  }

  /**
   * Capture a message
   */
  public captureMessage(
    message: string,
    severity: ErrorSeverity = 'info',
    extra?: Record<string, unknown>
  ): ErrorEvent | null {
    const error = new Error(message);
    error.name = 'Message';

    const event = this.captureError(error, extra);
    if (event) {
      event.severity = severity;
    }

    return event;
  }

  /**
   * Capture an exception with context
   */
  public captureException(error: unknown, context?: Record<string, unknown>): ErrorEvent | null {
    if (error instanceof Error) {
      return this.captureError(error, context);
    }

    return this.captureError(new Error(String(error)), context);
  }

  // --------------------------------------------------------------------------
  // BREADCRUMBS
  // --------------------------------------------------------------------------

  /**
   * Add a breadcrumb
   */
  public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const entry: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(entry);

    // Trim to max
    while (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Get current breadcrumbs
   */
  public getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear breadcrumbs
   */
  public clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  // --------------------------------------------------------------------------
  // USER CONTEXT
  // --------------------------------------------------------------------------

  /**
   * Set user ID
   */
  public setUser(userId: string): void {
    this.userId = userId;
    this.addBreadcrumb({
      type: 'user',
      category: 'auth',
      message: 'User identified',
      data: { userId },
      level: 'info',
    });
  }

  /**
   * Clear user
   */
  public clearUser(): void {
    this.userId = undefined;
  }

  // --------------------------------------------------------------------------
  // CONTEXT BUILDING
  // --------------------------------------------------------------------------

  private buildContext(extra?: Record<string, unknown>): ErrorContext {
    const context: ErrorContext = {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId: this.userId,
      sessionId: this.sessionId,
      deviceType: this.getDeviceType(),
      platform: typeof navigator !== 'undefined' ? navigator.platform : '',
      language: typeof navigator !== 'undefined' ? navigator.language : '',
      viewport: typeof window !== 'undefined'
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 0, height: 0 },
      appVersion: APP_VERSION,
      extra,
    };

    // Memory info if available
    const memory = (performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    }).memory;
    if (memory) {
      context.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
      };
    }

    return context;
  }

  private buildTags(extra?: Record<string, unknown>): Record<string, string> {
    const tags: Record<string, string> = {
      app_version: APP_VERSION,
      session_id: this.sessionId,
    };

    if (this.userId) {
      tags.user_id = this.userId;
    }

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          tags[key] = String(value);
        }
      });
    }

    return tags;
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';

    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
      return /tablet|ipad/.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  // --------------------------------------------------------------------------
  // FINGERPRINTING & GROUPING
  // --------------------------------------------------------------------------

  private generateFingerprint(error: Error): string {
    const parts = [
      error.name,
      error.message.replace(/\d+/g, 'N'), // Normalize numbers
      this.getStackFingerprint(error.stack),
    ];

    return this.hashString(parts.join('|'));
  }

  private getStackFingerprint(stack?: string): string {
    if (!stack) return '';

    const frames = this.parseStack(stack);
    const appFrames = frames.filter(f => f.inApp).slice(0, 3);

    return appFrames
      .map(f => `${f.function}@${f.filename}:${f.lineno}`)
      .join('|');
  }

  private parseStack(stack: string): StackFrame[] {
    const frames: StackFrame[] = [];
    const lines = stack.split('\n');

    for (const line of lines) {
      // Chrome/Node format: at functionName (filename:line:col)
      const chromeMatch = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
      if (chromeMatch) {
        frames.push({
          function: chromeMatch[1],
          filename: chromeMatch[2],
          lineno: parseInt(chromeMatch[3]),
          colno: parseInt(chromeMatch[4]),
          inApp: !chromeMatch[2].includes('node_modules'),
        });
        continue;
      }

      // Firefox format: functionName@filename:line:col
      const firefoxMatch = line.match(/(.+)@(.+):(\d+):(\d+)/);
      if (firefoxMatch) {
        frames.push({
          function: firefoxMatch[1] || '<anonymous>',
          filename: firefoxMatch[2],
          lineno: parseInt(firefoxMatch[3]),
          colno: parseInt(firefoxMatch[4]),
          inApp: !firefoxMatch[2].includes('node_modules'),
        });
      }
    }

    return frames;
  }

  private getOrCreateGroup(error: Error, fingerprint: string): string {
    const existing = Array.from(this.errorGroups.values())
      .find(g => g.fingerprint === fingerprint);

    if (existing) {
      existing.count++;
      existing.lastSeen = new Date().toISOString();
      if (this.userId) {
        existing.affectedUsers.add(this.userId);
      }
      return existing.id;
    }

    const group: ErrorGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fingerprint,
      message: error.message,
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      severity: this.determineSeverity(error),
      affectedUsers: new Set(this.userId ? [this.userId] : []),
      resolved: false,
    };

    this.errorGroups.set(group.id, group);
    return group.id;
  }

  private rebuildGroups(): void {
    this.errorGroups.clear();

    for (const error of this.errors.values()) {
      const existing = this.errorGroups.get(error.groupId);
      if (existing) {
        existing.count++;
        if (error.context.userId) {
          existing.affectedUsers.add(error.context.userId);
        }
      } else {
        this.errorGroups.set(error.groupId, {
          id: error.groupId,
          fingerprint: error.fingerprint,
          message: error.message,
          count: 1,
          firstSeen: error.firstSeen,
          lastSeen: error.lastSeen,
          severity: error.severity,
          affectedUsers: new Set(error.context.userId ? [error.context.userId] : []),
          resolved: error.resolved,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();

    if (message.includes('fatal') || message.includes('crash')) {
      return 'fatal';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'warning';
    }
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'error';
    }

    return 'error';
  }

  private shouldIgnore(error: Error): boolean {
    // Check ignore patterns
    for (const pattern of this.config.ignoreErrors) {
      if (pattern.test(error.message)) {
        return true;
      }
    }

    // Check URL patterns
    if (typeof window !== 'undefined') {
      for (const pattern of this.config.ignoreUrls) {
        if (pattern.test(window.location.href)) {
          return true;
        }
      }
    }

    return false;
  }

  private trimErrors(): void {
    while (this.errors.size > this.config.maxErrors) {
      const oldest = Array.from(this.errors.entries())
        .sort(([, a], [, b]) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
      if (oldest) {
        this.errors.delete(oldest[0]);
      }
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // --------------------------------------------------------------------------
  // ERROR MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Get all errors
   */
  public getErrors(): ErrorEvent[] {
    return Array.from(this.errors.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get error groups
   */
  public getErrorGroups(): ErrorGroup[] {
    return Array.from(this.errorGroups.values())
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get error by ID
   */
  public getError(id: string): ErrorEvent | null {
    return this.errors.get(id) || null;
  }

  /**
   * Mark error as resolved
   */
  public resolveError(id: string): void {
    const error = this.errors.get(id);
    if (error) {
      error.resolved = true;
      this.saveToStorage();
    }
  }

  /**
   * Mark error as ignored
   */
  public ignoreError(id: string): void {
    const error = this.errors.get(id);
    if (error) {
      error.ignored = true;
      this.saveToStorage();
    }
  }

  /**
   * Delete error
   */
  public deleteError(id: string): void {
    this.errors.delete(id);
    this.saveToStorage();
  }

  /**
   * Clear all errors
   */
  public clearErrors(): void {
    this.errors.clear();
    this.errorGroups.clear();
    this.saveToStorage();
  }

  // --------------------------------------------------------------------------
  // STATISTICS
  // --------------------------------------------------------------------------

  /**
   * Get error statistics
   */
  public getStats(): ErrorStats {
    const errors = this.getErrors();
    const now = Date.now();
    const hourAgo = now - 3600000;

    const byHour: number[] = new Array(24).fill(0);
    const bySeverity: Record<ErrorSeverity, number> = {
      fatal: 0,
      error: 0,
      warning: 0,
      info: 0,
      debug: 0,
    };

    const uniqueSessions = new Set<string>();
    const errorCounts: Record<string, number> = {};

    errors.forEach(e => {
      bySeverity[e.severity]++;
      uniqueSessions.add(e.context.sessionId);

      // Count by message
      errorCounts[e.message] = (errorCounts[e.message] || 0) + e.count;

      // By hour
      const errorTime = new Date(e.timestamp).getTime();
      if (errorTime > hourAgo) {
        const hourIndex = Math.floor((now - errorTime) / (3600000 / 24));
        if (hourIndex >= 0 && hourIndex < 24) {
          byHour[23 - hourIndex]++;
        }
      }
    });

    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return {
      total: errors.reduce((sum, e) => sum + e.count, 0),
      bysSeverity: bySeverity,
      byHour,
      topErrors,
      affectedSessions: uniqueSessions.size,
      errorRate: uniqueSessions.size > 0
        ? errors.length / uniqueSessions.size
        : 0,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const errorTrackingService = new ErrorTrackingService();

// Initialize on load
if (typeof window !== 'undefined') {
  errorTrackingService.init();
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for error tracking
 */
export function useErrorTracking() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);

  useEffect(() => {
    setErrors(errorTrackingService.getErrors());
    setStats(errorTrackingService.getStats());

    const interval = setInterval(() => {
      setErrors(errorTrackingService.getErrors());
      setStats(errorTrackingService.getStats());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const captureError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const event = errorTrackingService.captureError(error, context);
    setErrors(errorTrackingService.getErrors());
    return event;
  }, []);

  const captureMessage = useCallback((
    message: string,
    severity?: ErrorSeverity,
    context?: Record<string, unknown>
  ) => {
    const event = errorTrackingService.captureMessage(message, severity, context);
    setErrors(errorTrackingService.getErrors());
    return event;
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: Omit<Breadcrumb, 'timestamp'>) => {
    errorTrackingService.addBreadcrumb(breadcrumb);
  }, []);

  return {
    errors,
    stats,
    captureError,
    captureMessage,
    addBreadcrumb,
    resolveError: errorTrackingService.resolveError.bind(errorTrackingService),
    ignoreError: errorTrackingService.ignoreError.bind(errorTrackingService),
    deleteError: (id: string) => {
      errorTrackingService.deleteError(id);
      setErrors(errorTrackingService.getErrors());
    },
    clearErrors: () => {
      errorTrackingService.clearErrors();
      setErrors([]);
    },
    setUser: errorTrackingService.setUser.bind(errorTrackingService),
    clearUser: errorTrackingService.clearUser.bind(errorTrackingService),
  };
}

/**
 * Error boundary component
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorTrackingService.captureError(error, {
        componentStack: errorInfo.componentStack,
      });
    }

    render() {
      if (this.state.hasError) {
        return fallback || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Något gick fel</h2>
            <p>Ladda om sidan för att fortsätta</p>
            <button onClick={() => window.location.reload()}>
              Ladda om
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}

export default errorTrackingService;
