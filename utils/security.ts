/**
 * Security Utilities
 *
 * Provides utilities for:
 * - Input sanitization
 * - XSS prevention
 * - CSRF token handling
 * - Content Security Policy helpers
 * - Secure data handling
 */

import DOMPurify from 'dompurify';
import { logger } from './logger';

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify for robust sanitization
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';

  try {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'span'],
      ALLOWED_ATTR: ['class'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
    });
  } catch (error) {
    logger.error('HTML sanitization failed', error);
    return '';
  }
}

/**
 * Sanitize Markdown content (removes potentially dangerous HTML)
 */
export function sanitizeMarkdown(dirty: string): string {
  if (!dirty) return '';

  try {
    return DOMPurify.sanitize(dirty, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'b', 'i', 'u',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      ALLOW_DATA_ATTR: false
    });
  } catch (error) {
    logger.error('Markdown sanitization failed', error);
    return '';
  }
}

/**
 * Escape special characters for safe text display
 * Use this for plain text that should not be interpreted as HTML
 */
export function escapeHTML(text: string): string {
  if (!text) return '';

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return text.replace(/[&<>"'/]/g, char => escapeMap[char] || char);
}

/**
 * Sanitize user input for storage
 * Trims whitespace and removes control characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Remove control characters (except newline and tab)
  // eslint-disable-next-line no-control-regex
  const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
  return input.trim().replace(controlCharRegex, '');
}

/**
 * Sanitize filename for safe file operations
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  // Remove path traversal attempts and invalid characters
  return filename
    .replace(/\.\./g, '') // Path traversal
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Invalid chars
    .replace(/^\.+/, '') // Leading dots
    .trim()
    .slice(0, 255); // Max filename length
}

// ============================================
// URL VALIDATION
// ============================================

/**
 * Validate and sanitize URLs to prevent javascript: and data: attacks
 */
export function isValidURL(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL for safe use in links
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';

  // Only allow safe protocols
  if (isValidURL(url)) {
    return url;
  }

  // Check for relative URLs
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  logger.warn('Blocked potentially unsafe URL', { url: url.slice(0, 50) });
  return '';
}

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Generate a CSRF token for form submissions
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch {
    // Session storage might be disabled
    logger.warn('Could not store CSRF token');
  }
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token.length > 0;
  } catch {
    return false;
  }
}

// ============================================
// SECURE DATA HANDLING
// ============================================

/**
 * Mask sensitive data for logging/display
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (!data || data.length <= visibleChars) {
    return '*'.repeat(data?.length || 0);
  }

  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  return masked + visible;
}

/**
 * Redact object properties for safe logging
 */
export function redactForLogging<T extends Record<string, unknown>>(
  obj: T,
  sensitiveKeys: string[] = ['password', 'token', 'secret', 'apiKey', 'authorization']
): T {
  const redacted = { ...obj };

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()))) {
      redacted[key as keyof T] = '[REDACTED]' as T[keyof T];
    }
  }

  return redacted;
}

/**
 * Securely clear sensitive data from memory
 * Note: JavaScript doesn't guarantee memory clearing,
 * but this is a best-effort approach
 */
export function secureClear(data: string): void {
  if (typeof data === 'string') {
    // Overwrite the string (limited effectiveness in JS)
    for (let i = 0; i < data.length; i++) {
      (data as unknown as { [key: number]: string })[i] = '\0';
    }
  }
}

// ============================================
// RATE LIMITING (Client-side)
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple client-side rate limiting
 * Use for preventing excessive API calls
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  entry.count++;
  return { allowed: true };
}

// ============================================
// CONTENT SECURITY POLICY HELPERS
// ============================================

/**
 * Recommended CSP directives for this application
 * Use this as a reference when configuring server headers
 */
export const RECOMMENDED_CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'connect-src': [
    "'self'",
    "https://*.supabase.co",
    "https://generativelanguage.googleapis.com"
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(RECOMMENDED_CSP)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

// ============================================
// EXPORTS
// ============================================

export default {
  sanitizeHTML,
  sanitizeMarkdown,
  escapeHTML,
  sanitizeInput,
  sanitizeFilename,
  isValidURL,
  sanitizeURL,
  generateCSRFToken,
  storeCSRFToken,
  validateCSRFToken,
  maskSensitiveData,
  redactForLogging,
  secureClear,
  checkRateLimit,
  RECOMMENDED_CSP,
  generateCSPHeader
};
