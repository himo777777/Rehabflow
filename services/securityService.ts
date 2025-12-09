/**
 * Security Service - Sprint 5.16
 *
 * Comprehensive security features for the application.
 * Features:
 * - Content Security Policy management
 * - XSS protection
 * - CSRF token handling
 * - Input sanitization
 * - Security headers
 * - Rate limiting helpers
 * - Secure storage
 * - Security audit logging
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type CSPDirective =
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'connect-src'
  | 'media-src'
  | 'object-src'
  | 'frame-src'
  | 'child-src'
  | 'worker-src'
  | 'frame-ancestors'
  | 'form-action'
  | 'base-uri'
  | 'manifest-src';

export type SecurityEventType =
  | 'xss_attempt'
  | 'csp_violation'
  | 'csrf_failure'
  | 'rate_limit'
  | 'auth_failure'
  | 'suspicious_input'
  | 'storage_tampering';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  timestamp: string;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  source?: string;
}

export interface CSPPolicy {
  [directive: string]: string[];
}

export interface SecurityConfig {
  enableCSP: boolean;
  enableXSSProtection: boolean;
  enableCSRF: boolean;
  enableInputSanitization: boolean;
  enableSecureStorage: boolean;
  cspReportOnly: boolean;
  trustedDomains: string[];
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDuration: number;
}

export interface SecureStorageOptions {
  encrypt?: boolean;
  expiry?: number; // milliseconds
  namespace?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_EVENTS = 'rehabflow-security-events';
const STORAGE_KEY_CONFIG = 'rehabflow-security-config';
const STORAGE_KEY_CSRF = 'rehabflow-csrf-token';
const STORAGE_KEY_RATE_LIMIT = 'rehabflow-rate-limits';

const DEFAULT_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableXSSProtection: true,
  enableCSRF: true,
  enableInputSanitization: true,
  enableSecureStorage: true,
  cspReportOnly: false,
  trustedDomains: [
    'self',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
  ],
  maxLoginAttempts: 5,
  lockoutDuration: 15,
};

const DEFAULT_CSP: CSPPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https:', 'wss:'],
  'media-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'frame-ancestors': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

// ============================================================================
// SECURITY SERVICE
// ============================================================================

class SecurityService {
  private config: SecurityConfig = DEFAULT_CONFIG;
  private cspPolicy: CSPPolicy = DEFAULT_CSP;
  private securityEvents: SecurityEvent[] = [];
  private csrfToken: string | null = null;
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.loadConfig();
    this.setupCSPReporting();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }

      const events = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (events) {
        this.securityEvents = JSON.parse(events);
      }

      const csrf = sessionStorage.getItem(STORAGE_KEY_CSRF);
      if (csrf) {
        this.csrfToken = csrf;
      }
    } catch (error) {
      logger.error('[Security] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Security] Failed to save config:', error);
    }
  }

  private saveEvents(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const recentEvents = this.securityEvents.slice(-100);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(recentEvents));
    } catch (error) {
      logger.error('[Security] Failed to save events:', error);
    }
  }

  /**
   * Initialize security service
   */
  public init(config?: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    if (this.config.enableCSP) {
      this.applyCSP();
    }

    if (this.config.enableCSRF) {
      this.initCSRF();
    }

    logger.info('[Security] Initialized');
  }

  // --------------------------------------------------------------------------
  // CONTENT SECURITY POLICY
  // --------------------------------------------------------------------------

  /**
   * Set CSP policy
   */
  public setCSPPolicy(policy: Partial<CSPPolicy>): void {
    this.cspPolicy = { ...this.cspPolicy, ...policy };
    this.applyCSP();
  }

  /**
   * Add source to CSP directive
   */
  public addCSPSource(directive: CSPDirective, source: string): void {
    if (!this.cspPolicy[directive]) {
      this.cspPolicy[directive] = [];
    }
    if (!this.cspPolicy[directive].includes(source)) {
      this.cspPolicy[directive].push(source);
      this.applyCSP();
    }
  }

  /**
   * Generate CSP header value
   */
  public generateCSPHeader(): string {
    return Object.entries(this.cspPolicy)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }

  private applyCSP(): void {
    if (typeof document === 'undefined') return;

    // Remove existing CSP meta tag
    const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existing) {
      existing.remove();
    }

    // Add new CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = this.config.cspReportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    meta.content = this.generateCSPHeader();
    document.head.appendChild(meta);

    logger.debug('[Security] CSP applied');
  }

  private setupCSPReporting(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('securitypolicyviolation', (event) => {
      this.logSecurityEvent({
        type: 'csp_violation',
        details: {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber,
          columnNumber: event.columnNumber,
        },
        severity: 'high',
        blocked: true,
        source: event.blockedURI,
      });
    });
  }

  // --------------------------------------------------------------------------
  // XSS PROTECTION
  // --------------------------------------------------------------------------

  /**
   * Sanitize HTML to prevent XSS
   */
  public sanitizeHTML(html: string): string {
    if (!this.config.enableXSSProtection) return html;

    // Create a temporary element
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  /**
   * Sanitize input string
   */
  public sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) return input;

    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: URLs
      .trim();

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'xss_attempt',
          details: { input: input.substring(0, 100), pattern: pattern.toString() },
          severity: 'high',
          blocked: true,
        });
      }
    }

    return sanitized;
  }

  /**
   * Sanitize URL
   */
  public sanitizeURL(url: string): string | null {
    try {
      const parsed = new URL(url, window.location.origin);

      // Only allow http, https, and relative URLs
      if (!['http:', 'https:', ''].includes(parsed.protocol)) {
        this.logSecurityEvent({
          type: 'suspicious_input',
          details: { url, protocol: parsed.protocol },
          severity: 'medium',
          blocked: true,
        });
        return null;
      }

      return parsed.href;
    } catch {
      return null;
    }
  }

  /**
   * Escape HTML entities
   */
  public escapeHTML(str: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };

    return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char]);
  }

  // --------------------------------------------------------------------------
  // CSRF PROTECTION
  // --------------------------------------------------------------------------

  /**
   * Generate CSRF token
   */
  public generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(STORAGE_KEY_CSRF, this.csrfToken);
    return this.csrfToken;
  }

  /**
   * Get current CSRF token
   */
  public getCSRFToken(): string {
    if (!this.csrfToken) {
      this.csrfToken = this.generateCSRFToken();
    }
    return this.csrfToken;
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(token: string): boolean {
    const valid = token === this.csrfToken;
    if (!valid) {
      this.logSecurityEvent({
        type: 'csrf_failure',
        details: { providedToken: token.substring(0, 10) + '...' },
        severity: 'high',
        blocked: true,
      });
    }
    return valid;
  }

  private initCSRF(): void {
    if (!this.csrfToken) {
      this.generateCSRFToken();
    }
  }

  // --------------------------------------------------------------------------
  // RATE LIMITING
  // --------------------------------------------------------------------------

  /**
   * Check rate limit
   */
  public checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      // Create new window
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (limit.count >= config.maxRequests) {
      this.logSecurityEvent({
        type: 'rate_limit',
        details: { key, count: limit.count, maxRequests: config.maxRequests },
        severity: 'medium',
        blocked: true,
      });
      return { allowed: false, remaining: 0, resetIn: limit.resetTime - now };
    }

    limit.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - limit.count,
      resetIn: limit.resetTime - now,
    };
  }

  /**
   * Reset rate limit for key
   */
  public resetRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }

  // --------------------------------------------------------------------------
  // SECURE STORAGE
  // --------------------------------------------------------------------------

  /**
   * Store data securely
   */
  public secureStore(key: string, data: unknown, options?: SecureStorageOptions): void {
    if (!this.config.enableSecureStorage) {
      localStorage.setItem(key, JSON.stringify(data));
      return;
    }

    const namespace = options?.namespace || 'rehabflow';
    const fullKey = `${namespace}:${key}`;

    const wrapper = {
      data: options?.encrypt ? this.encrypt(JSON.stringify(data)) : data,
      encrypted: options?.encrypt || false,
      expiry: options?.expiry ? Date.now() + options.expiry : null,
      checksum: this.generateChecksum(JSON.stringify(data)),
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(fullKey, JSON.stringify(wrapper));
    } catch (error) {
      logger.error('[Security] Secure store failed:', error);
    }
  }

  /**
   * Retrieve securely stored data
   */
  public secureRetrieve<T>(key: string, namespace?: string): T | null {
    const fullKey = `${namespace || 'rehabflow'}:${key}`;

    try {
      const stored = localStorage.getItem(fullKey);
      if (!stored) return null;

      const wrapper = JSON.parse(stored);

      // Check expiry
      if (wrapper.expiry && Date.now() > wrapper.expiry) {
        localStorage.removeItem(fullKey);
        return null;
      }

      // Decrypt if needed
      const data = wrapper.encrypted
        ? JSON.parse(this.decrypt(wrapper.data))
        : wrapper.data;

      // Verify checksum
      if (wrapper.checksum !== this.generateChecksum(JSON.stringify(data))) {
        this.logSecurityEvent({
          type: 'storage_tampering',
          details: { key },
          severity: 'critical',
          blocked: true,
        });
        localStorage.removeItem(fullKey);
        return null;
      }

      return data as T;
    } catch (error) {
      logger.error('[Security] Secure retrieve failed:', error);
      return null;
    }
  }

  /**
   * Remove securely stored data
   */
  public secureRemove(key: string, namespace?: string): void {
    const fullKey = `${namespace || 'rehabflow'}:${key}`;
    localStorage.removeItem(fullKey);
  }

  // Simple encryption (for demo - use proper encryption in production)
  private encrypt(data: string): string {
    return btoa(data);
  }

  private decrypt(data: string): string {
    return atob(data);
  }

  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // --------------------------------------------------------------------------
  // SECURITY EVENTS
  // --------------------------------------------------------------------------

  /**
   * Log security event
   */
  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.securityEvents.push(fullEvent);
    this.saveEvents();

    logger.warn('[Security] Event logged:', fullEvent.type, fullEvent.severity);

    // Emit event for monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-event', { detail: fullEvent }));
    }
  }

  /**
   * Get security events
   */
  public getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.securityEvents.filter(e => e.type === type);
  }

  /**
   * Clear security events
   */
  public clearSecurityEvents(): void {
    this.securityEvents = [];
    this.saveEvents();
  }

  // --------------------------------------------------------------------------
  // PASSWORD SECURITY
  // --------------------------------------------------------------------------

  /**
   * Check password strength
   */
  public checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length < 8) feedback.push('Använd minst 8 tecken');

    // Character types
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lägg till små bokstäver');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Lägg till stora bokstäver');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Lägg till siffror');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Lägg till specialtecken');

    // Patterns to avoid
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Undvik upprepade tecken');
    }

    if (/^[a-zA-Z]+$/.test(password)) {
      score -= 1;
      feedback.push('Blanda olika teckentyper');
    }

    const strength: 'weak' | 'fair' | 'good' | 'strong' =
      score <= 2 ? 'weak' :
      score <= 4 ? 'fair' :
      score <= 6 ? 'good' : 'strong';

    return { score: Math.max(0, score), feedback, strength };
  }

  /**
   * Generate secure random string
   */
  public generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  /**
   * Get configuration
   */
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const securityService = new SecurityService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for security events monitoring
 */
export function useSecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    setEvents(securityService.getSecurityEvents());

    const handleEvent = (e: CustomEvent<SecurityEvent>) => {
      setEvents(prev => [...prev, e.detail]);
    };

    window.addEventListener('security-event', handleEvent as EventListener);
    return () => {
      window.removeEventListener('security-event', handleEvent as EventListener);
    };
  }, []);

  return {
    events,
    clearEvents: () => {
      securityService.clearSecurityEvents();
      setEvents([]);
    },
    getByType: (type: SecurityEventType) => events.filter(e => e.type === type),
  };
}

/**
 * Hook for CSRF token
 */
export function useCSRFToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(securityService.getCSRFToken());
  }, []);

  const regenerate = useCallback(() => {
    const newToken = securityService.generateCSRFToken();
    setToken(newToken);
    return newToken;
  }, []);

  return { token, regenerate };
}

/**
 * Hook for rate limiting
 */
export function useRateLimit(key: string, config: RateLimitConfig) {
  const [state, setState] = useState({ allowed: true, remaining: config.maxRequests, resetIn: 0 });

  const check = useCallback(() => {
    const result = securityService.checkRateLimit(key, config);
    setState(result);
    return result;
  }, [key, config]);

  const reset = useCallback(() => {
    securityService.resetRateLimit(key);
    setState({ allowed: true, remaining: config.maxRequests, resetIn: 0 });
  }, [key, config.maxRequests]);

  return { ...state, check, reset };
}

/**
 * Hook for secure storage
 */
export function useSecureStorage<T>(key: string, initialValue: T, options?: SecureStorageOptions) {
  const [value, setValue] = useState<T>(() => {
    const stored = securityService.secureRetrieve<T>(key, options?.namespace);
    return stored !== null ? stored : initialValue;
  });

  const setSecureValue = useCallback((newValue: T) => {
    setValue(newValue);
    securityService.secureStore(key, newValue, options);
  }, [key, options]);

  const removeValue = useCallback(() => {
    setValue(initialValue);
    securityService.secureRemove(key, options?.namespace);
  }, [key, initialValue, options?.namespace]);

  return [value, setSecureValue, removeValue] as const;
}

/**
 * Hook for input sanitization
 */
export function useSanitizedInput() {
  const sanitize = useCallback((input: string) => {
    return securityService.sanitizeInput(input);
  }, []);

  const sanitizeHTML = useCallback((html: string) => {
    return securityService.sanitizeHTML(html);
  }, []);

  const sanitizeURL = useCallback((url: string) => {
    return securityService.sanitizeURL(url);
  }, []);

  return { sanitize, sanitizeHTML, sanitizeURL };
}

export default securityService;
