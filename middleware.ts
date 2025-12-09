/**
 * Security Headers Utility - Vercel Edge Functions
 *
 * Implements critical security headers for HIPAA/OWASP compliance:
 * - Content Security Policy (CSP)
 * - Strict Transport Security (HSTS)
 * - X-Frame-Options (Clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing prevention)
 * - Referrer-Policy
 * - Permissions-Policy
 *
 * Usage: Apply these headers in API route handlers and/or configure in vercel.json
 */

export const config = {
  runtime: 'edge',
};

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

export const SECURITY_HEADERS = {
  // Content Security Policy - Strict but allows essential resources
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co https://api.groq.com wss://*.supabase.co",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join('; '),

  // HTTP Strict Transport Security - Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Referrer policy - Don't leak data
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // XSS Protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',

  // Permissions policy - Restrict browser features
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=(self)',            // Allow for exercise tracking
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=(self)',        // Allow for voice feedback
    'payment=()',
    'usb=()',
    'interest-cohort=()',       // Block FLoC
  ].join(', '),

  // Cache control for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const;

// API-specific headers (less restrictive CSP for API endpoints)
export const API_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
} as const;

// ============================================================================
// RATE LIMITING
// ============================================================================

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  requests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + (config.windowSeconds * 1000),
    });
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetIn: config.windowSeconds,
    };
  }

  if (record.count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.requests - record.count,
    resetIn: Math.ceil((record.resetTime - now) / 1000),
  };
}

// ============================================================================
// SECURITY CHECKS
// ============================================================================

/**
 * Check for suspicious request patterns
 */
export function isSuspiciousRequest(
  url: string,
  userAgent: string
): { suspicious: boolean; reason?: string } {
  // Block common attack patterns in URLs
  const suspiciousPatterns = [
    /\.\.\//,                          // Path traversal
    /<script/i,                        // XSS attempt
    /\bor\b.*=.*--/i,                  // SQL injection
    /union\s+select/i,                 // SQL injection
    /\bexec\s*\(/i,                    // Command injection
    /%00/,                             // Null byte injection
    /\/etc\/passwd/,                   // LFI attempt
    /\.env$/,                          // Env file access
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return { suspicious: true, reason: 'Suspicious URL pattern detected' };
    }
  }

  // Block requests with suspicious user agents
  const blockedUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
  ];

  for (const pattern of blockedUserAgents) {
    if (pattern.test(userAgent)) {
      return { suspicious: true, reason: 'Blocked user agent' };
    }
  }

  return { suspicious: false };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Apply security headers to a Response
 */
export function applySecurityHeaders(
  response: Response,
  isApiRoute = false
): Response {
  const headers = new Headers(response.headers);
  const securityHeaders = isApiRoute ? API_SECURITY_HEADERS : SECURITY_HEADERS;

  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create a rate limit exceeded response
 */
export function createRateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(resetIn),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetIn),
        ...API_SECURITY_HEADERS,
      },
    }
  );
}

/**
 * Create a forbidden response for blocked requests
 */
export function createForbiddenResponse(reason?: string): Response {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message: reason || 'Access denied',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        ...API_SECURITY_HEADERS,
      },
    }
  );
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication required',
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
        ...API_SECURITY_HEADERS,
      },
    }
  );
}

// ============================================================================
// EDGE FUNCTION HANDLER
// ============================================================================

/**
 * Main middleware handler for Vercel Edge Functions
 * Use this in API routes that need full security checks
 */
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Security check
  const suspiciousCheck = isSuspiciousRequest(url.href, userAgent);
  if (suspiciousCheck.suspicious) {
    console.warn('[Security] Blocked suspicious request:', {
      ip: getClientIP(request.headers),
      path,
      reason: suspiciousCheck.reason,
    });
    return createForbiddenResponse(suspiciousCheck.reason);
  }

  // Rate limiting for API routes
  if (path.startsWith('/api')) {
    const clientIP = getClientIP(request.headers);
    const rateLimitKey = `${clientIP}:${path.split('/').slice(0, 3).join('/')}`;

    // Default rate limit config
    const rateLimit = checkRateLimit(rateLimitKey, {
      requests: 100,
      windowSeconds: 60,
    });

    if (!rateLimit.allowed) {
      console.warn('[Security] Rate limit exceeded:', { ip: clientIP, path });
      return createRateLimitResponse(rateLimit.resetIn);
    }
  }

  // If this is a middleware check endpoint, return success
  if (path === '/api/health' || path === '/_health') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...API_SECURITY_HEADERS,
      },
    });
  }

  // For other requests, return a pass-through response
  // In actual usage, this would be handled by the specific API route
  return new Response(null, { status: 200 });
}

// ============================================================================
// VERCEL.JSON CONFIGURATION (Reference)
// ============================================================================

/**
 * Add these headers to vercel.json for static file serving:
 *
 * {
 *   "headers": [
 *     {
 *       "source": "/(.*)",
 *       "headers": [
 *         { "key": "X-Frame-Options", "value": "DENY" },
 *         { "key": "X-Content-Type-Options", "value": "nosniff" },
 *         { "key": "X-XSS-Protection", "value": "1; mode=block" },
 *         { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
 *         { "key": "Permissions-Policy", "value": "camera=(self), microphone=(self)" },
 *         {
 *           "key": "Content-Security-Policy",
 *           "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
