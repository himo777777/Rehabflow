/**
 * Input Sanitization Utilities
 *
 * Provides XSS protection and input validation for user-generated content.
 * Critical for chat messages, form inputs, and any user-provided data.
 */

// ============================================================================
// HTML ENTITY ENCODING
// ============================================================================

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  if (typeof str !== 'string') return '';

  const htmlEntitiesReverse: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
    '&#39;': "'",
  };

  return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D|#39);/g,
    (entity) => htmlEntitiesReverse[entity] || entity
  );
}

// ============================================================================
// SCRIPT/EVENT HANDLER REMOVAL
// ============================================================================

/**
 * Remove potentially dangerous attributes and scripts
 */
export function stripDangerousContent(html: string): string {
  if (typeof html !== 'string') return '';

  // Remove script tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, onload, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript\s*:/gi, '');

  // Remove data: URLs (can contain scripts)
  cleaned = cleaned.replace(/data\s*:\s*text\/html/gi, '');

  // Remove vbscript: URLs
  cleaned = cleaned.replace(/vbscript\s*:/gi, '');

  // Remove expression() (IE CSS attack)
  cleaned = cleaned.replace(/expression\s*\(/gi, '');

  // Remove iframe, embed, object tags
  cleaned = cleaned.replace(/<(iframe|embed|object)\b[^>]*>.*?<\/\1>/gi, '');
  cleaned = cleaned.replace(/<(iframe|embed|object)\b[^>]*\/?>/gi, '');

  // Remove base tags (can redirect resources)
  cleaned = cleaned.replace(/<base\b[^>]*\/?>/gi, '');

  // Remove form tags (prevent form injection)
  cleaned = cleaned.replace(/<form\b[^>]*>.*?<\/form>/gi, '');

  // Remove meta refresh
  cleaned = cleaned.replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, '');

  return cleaned;
}

// ============================================================================
// URL SANITIZATION
// ============================================================================

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed, window.location.origin);

    // Only allow safe protocols
    if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
      return '';
    }

    return parsed.href;
  } catch {
    // If URL parsing fails, check if it's a relative path
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return '';
  }
}

/**
 * Check if URL is external
 */
export function isExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
}

// ============================================================================
// TEXT SANITIZATION
// ============================================================================

/**
 * Sanitize text input (for chat, forms, etc.)
 * Preserves newlines but removes dangerous content
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';

  // Normalize unicode (prevent homograph attacks)
  let cleaned = text.normalize('NFKC');

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Remove control characters (except newlines and tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape HTML entities
  cleaned = escapeHtml(cleaned);

  // Limit consecutive whitespace
  cleaned = cleaned.replace(/[ \t]{10,}/g, '          ');

  // Limit consecutive newlines
  cleaned = cleaned.replace(/\n{5,}/g, '\n\n\n\n');

  return cleaned.trim();
}

/**
 * Sanitize for display in React (minimal processing)
 */
export function sanitizeForDisplay(text: string): string {
  if (typeof text !== 'string') return '';
  return escapeHtml(text);
}

// ============================================================================
// CHAT MESSAGE SANITIZATION
// ============================================================================

/**
 * Sanitize chat message input
 */
export function sanitizeChatMessage(message: string): string {
  if (typeof message !== 'string') return '';

  let cleaned = message.trim();

  // Remove null bytes and control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape HTML
  cleaned = escapeHtml(cleaned);

  // Limit length (prevent DoS)
  const MAX_MESSAGE_LENGTH = 10000;
  if (cleaned.length > MAX_MESSAGE_LENGTH) {
    cleaned = cleaned.slice(0, MAX_MESSAGE_LENGTH) + '...';
  }

  return cleaned;
}

/**
 * Sanitize AI response for display
 */
export function sanitizeAIResponse(response: string): string {
  if (typeof response !== 'string') return '';

  // Strip dangerous content but preserve markdown
  let cleaned = stripDangerousContent(response);

  // Remove potential prompt injection markers
  cleaned = cleaned.replace(/```system\b/gi, '```');
  cleaned = cleaned.replace(/\[SYSTEM\]/gi, '[system]');
  cleaned = cleaned.replace(/\[INST\]/gi, '[inst]');

  return cleaned.trim();
}

// ============================================================================
// FORM INPUT VALIDATION
// ============================================================================

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  // Basic sanitization
  let cleaned = email.trim().toLowerCase();

  // Remove dangerous characters
  cleaned = cleaned.replace(/[<>"'`;]/g, '');

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';

  // Keep only digits, plus, spaces, and hyphens
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize name input
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';

  // Allow letters, spaces, hyphens, apostrophes
  let cleaned = name.trim();

  // Remove dangerous characters
  cleaned = escapeHtml(cleaned);

  // Limit length
  const MAX_NAME_LENGTH = 100;
  if (cleaned.length > MAX_NAME_LENGTH) {
    cleaned = cleaned.slice(0, MAX_NAME_LENGTH);
  }

  return cleaned;
}

// ============================================================================
// JSON SANITIZATION
// ============================================================================

/**
 * Safely parse JSON with sanitization
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return sanitizeObject(parsed) as T;
  } catch {
    return fallback;
  }
}

/**
 * Recursively sanitize object values
 */
export function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key as well
      const cleanKey = sanitizeText(key);
      cleaned[cleanKey] = sanitizeObject(value);
    }
    return cleaned;
  }

  return obj;
}

// ============================================================================
// FILENAME SANITIZATION
// ============================================================================

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return 'unnamed';

  let cleaned = filename.trim();

  // Remove path traversal attempts
  cleaned = cleaned.replace(/\.\./g, '');
  cleaned = cleaned.replace(/[/\\]/g, '');

  // Remove dangerous characters
  cleaned = cleaned.replace(/[<>:"|?*\x00-\x1F]/g, '');

  // Limit length
  const MAX_FILENAME_LENGTH = 255;
  if (cleaned.length > MAX_FILENAME_LENGTH) {
    const ext = cleaned.slice(cleaned.lastIndexOf('.'));
    cleaned = cleaned.slice(0, MAX_FILENAME_LENGTH - ext.length) + ext;
  }

  return cleaned || 'unnamed';
}

// ============================================================================
// CONTENT SECURITY
// ============================================================================

/**
 * Generate nonce for inline scripts (CSP)
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Check if content might contain malicious patterns
 */
export function detectMaliciousPatterns(content: string): boolean {
  const maliciousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /data:\s*text\/html/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(content));
}

// ============================================================================
// EXPORTS
// ============================================================================

export const sanitize = {
  html: escapeHtml,
  text: sanitizeText,
  url: sanitizeUrl,
  email: sanitizeEmail,
  phone: sanitizePhone,
  name: sanitizeName,
  filename: sanitizeFilename,
  chatMessage: sanitizeChatMessage,
  aiResponse: sanitizeAIResponse,
  json: safeJsonParse,
  object: sanitizeObject,
  stripDangerous: stripDangerousContent,
  detectMalicious: detectMaliciousPatterns,
};

export default sanitize;
