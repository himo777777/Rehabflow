/**
 * RATE LIMITING SERVICE
 *
 * Implementerar sliding window rate limiting för AI-anrop.
 * Använder Upstash Redis i produktion, in-memory fallback för utveckling.
 *
 * Konfiguration:
 * - 10 requests per minut för AI chat
 * - 5 requests per minut för program generation
 * - Exponentiell backoff vid överträdelse
 */

// ============================================
// TYPES
// ============================================

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;  // milliseconds
  identifier: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;  // timestamp
  retryAfter?: number;  // seconds
}

// ============================================
// IN-MEMORY STORE (Fallback)
// ============================================

interface RequestRecord {
  count: number;
  windowStart: number;
}

const memoryStore: Map<string, RequestRecord> = new Map();

function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    // Ta bort poster äldre än 5 minuter
    if (now - record.windowStart > 5 * 60 * 1000) {
      memoryStore.delete(key);
    }
  }
}

// Kör cleanup var 60:e sekund
if (typeof window !== 'undefined') {
  setInterval(cleanupMemoryStore, 60 * 1000);
}

// ============================================
// UPSTASH REDIS INTEGRATION
// ============================================

interface UpstashResponse {
  result: number | null;
}

async function upstashIncrement(
  key: string,
  windowMs: number
): Promise<number | null> {
  const upstashUrl = import.meta.env?.VITE_UPSTASH_REDIS_URL;
  const upstashToken = import.meta.env?.VITE_UPSTASH_REDIS_TOKEN;

  if (!upstashUrl || !upstashToken) {
    return null;  // Fallback to memory
  }

  try {
    // INCR command
    const incrResponse = await fetch(`${upstashUrl}/incr/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    });

    if (!incrResponse.ok) {
      console.warn('Upstash INCR failed, falling back to memory');
      return null;
    }

    const incrData: UpstashResponse = await incrResponse.json();
    const count = incrData.result;

    // Set expiry if this is the first request in window
    if (count === 1) {
      const expireSeconds = Math.ceil(windowMs / 1000);
      await fetch(`${upstashUrl}/expire/${key}/${expireSeconds}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
      });
    }

    return count;
  } catch (error) {
    console.warn('Upstash error, falling back to memory:', error);
    return null;
  }
}

async function upstashGetTTL(key: string): Promise<number> {
  const upstashUrl = import.meta.env?.VITE_UPSTASH_REDIS_URL;
  const upstashToken = import.meta.env?.VITE_UPSTASH_REDIS_TOKEN;

  if (!upstashUrl || !upstashToken) {
    return 60;  // Default 60 seconds
  }

  try {
    const response = await fetch(`${upstashUrl}/ttl/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    });

    if (!response.ok) {
      return 60;
    }

    const data: UpstashResponse = await response.json();
    return data.result ?? 60;
  } catch {
    return 60;
  }
}

// ============================================
// MAIN RATE LIMIT FUNCTION
// ============================================

/**
 * Check rate limit using sliding window algorithm
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier } = config;
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  // Try Upstash first
  const upstashCount = await upstashIncrement(key, windowMs);

  if (upstashCount !== null) {
    // Using Upstash
    const ttl = await upstashGetTTL(key);
    const remaining = Math.max(0, maxRequests - upstashCount);
    const resetAt = now + (ttl * 1000);

    if (upstashCount > maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt,
        retryAfter: ttl,
      };
    }

    return {
      success: true,
      remaining,
      resetAt,
    };
  }

  // Fallback to in-memory
  const record = memoryStore.get(key);

  if (!record || now - record.windowStart > windowMs) {
    // New window
    memoryStore.set(key, { count: 1, windowStart: now });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  // Existing window
  record.count++;
  const remaining = Math.max(0, maxRequests - record.count);
  const resetAt = record.windowStart + windowMs;

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((resetAt - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  return {
    success: true,
    remaining,
    resetAt,
  };
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

/**
 * Get user identifier (anonymous or authenticated)
 */
export function getUserIdentifier(): string {
  // Try to get stored user ID
  const storedId = localStorage.getItem('rehabflow_user_id');
  if (storedId) {
    return storedId;
  }

  // Generate new anonymous ID
  const newId = crypto.randomUUID();
  localStorage.setItem('rehabflow_user_id', newId);
  return newId;
}

/**
 * Rate limit for AI chat (10 requests/minute)
 */
export async function checkChatRateLimit(): Promise<RateLimitResult> {
  const userId = getUserIdentifier();
  return checkRateLimit({
    maxRequests: 10,
    windowMs: 60 * 1000,  // 1 minute
    identifier: `chat:${userId}`,
  });
}

/**
 * Rate limit for program generation (5 requests/minute)
 */
export async function checkProgramRateLimit(): Promise<RateLimitResult> {
  const userId = getUserIdentifier();
  return checkRateLimit({
    maxRequests: 5,
    windowMs: 60 * 1000,  // 1 minute
    identifier: `program:${userId}`,
  });
}

/**
 * Rate limit for exercise recommendations (20 requests/minute)
 */
export async function checkRecommendationRateLimit(): Promise<RateLimitResult> {
  const userId = getUserIdentifier();
  return checkRateLimit({
    maxRequests: 20,
    windowMs: 60 * 1000,  // 1 minute
    identifier: `recommendation:${userId}`,
  });
}

// ============================================
// ERROR MESSAGES
// ============================================

/**
 * Generate user-friendly rate limit error message
 */
export function getRateLimitErrorMessage(result: RateLimitResult): string {
  if (result.success) {
    return '';
  }

  const retrySeconds = result.retryAfter ?? 60;

  if (retrySeconds < 60) {
    return `Du har gjort för många förfrågningar. Vänta ${retrySeconds} sekunder och försök igen.`;
  }

  const retryMinutes = Math.ceil(retrySeconds / 60);
  return `Du har gjort för många förfrågningar. Vänta ${retryMinutes} minut${retryMinutes > 1 ? 'er' : ''} och försök igen.`;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('rate limit') ||
           error.message.includes('429') ||
           error.message.includes('för många');
  }
  return false;
}
