/**
 * AI Completion API - Vercel Edge Function
 *
 * Proxies AI requests to Groq API server-side to protect API keys.
 * Supports both streaming and non-streaming responses.
 *
 * Rate limiting:
 * - Uses Upstash Redis for production (distributed, exact)
 * - Falls back to in-memory for development/testing
 */

import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const config = {
  runtime: 'edge',
};

// Rate limit configuration
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW_SECONDS = 60;

// ============================================
// RATE LIMITING - Upstash with Memory Fallback
// ============================================

// In-memory fallback for when Upstash is not configured
const memoryRateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Initialize Upstash rate limiter if configured
 */
function getUpstashRateLimiter(): Ratelimit | null {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return null;
  }

  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT, `${RATE_WINDOW_SECONDS} s`),
      analytics: true,
      prefix: "rehabflow:ai",
    });
  } catch (error) {
    console.error('Failed to initialize Upstash rate limiter:', error);
    return null;
  }
}

// Cached rate limiter instance
let cachedRateLimiter: Ratelimit | null | undefined;

function getRateLimiter(): Ratelimit | null {
  if (cachedRateLimiter === undefined) {
    cachedRateLimiter = getUpstashRateLimiter();
  }
  return cachedRateLimiter;
}

/**
 * Check rate limit using Upstash or memory fallback
 */
async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
}> {
  const rateLimiter = getRateLimiter();

  // Try Upstash first
  if (rateLimiter) {
    try {
      const result = await rateLimiter.limit(ip);
      return {
        allowed: result.success,
        remaining: result.remaining,
        reset: Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch (error) {
      console.error('Upstash rate limit check failed, using memory fallback:', error);
      // Fall through to memory implementation
    }
  }

  // Memory-based fallback
  const now = Date.now();
  const record = memoryRateLimits.get(ip);

  if (!record || now > record.resetTime) {
    memoryRateLimits.set(ip, {
      count: 1,
      resetTime: now + (RATE_WINDOW_SECONDS * 1000),
    });
    return { allowed: true, remaining: RATE_LIMIT - 1, reset: RATE_WINDOW_SECONDS };
  }

  if (record.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT - record.count,
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}

// ============================================
// API HANDLER
// ============================================

export default async function handler(req: Request) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('x-real-ip') ||
             'unknown';

  // Check rate limit
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'For manga forfragan. Forsok igen om en minut.',
      retryAfter: rateLimit.reset
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.reset),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(rateLimit.reset),
      },
    });
  }

  try {
    const body = await req.json();
    const { messages, model, temperature, max_tokens, stream } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({
        error: 'Invalid request',
        message: 'messages array is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Groq client with server-side API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        message: 'AI-tjansten ar inte korrekt konfigurerad'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groq = new Groq({ apiKey });

    // Handle streaming response
    if (stream) {
      const streamResponse = await groq.chat.completions.create({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens || 4096,
        stream: true,
      });

      // Create a TransformStream to convert Groq stream to SSE
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      });
    }

    // Handle non-streaming response
    const completion = await groq.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens || 4096,
    });

    return new Response(JSON.stringify({
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
      model: completion.model,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });

  } catch (error: any) {
    console.error('AI API error:', error);

    // Handle specific Groq errors
    if (error.status === 429) {
      return new Response(JSON.stringify({
        error: 'AI service rate limit',
        message: 'AI-tjansten ar tillfallgt overbelastad. Forsok igen.',
        retryAfter: 30
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '30'
        },
      });
    }

    return new Response(JSON.stringify({
      error: 'AI request failed',
      message: 'Ett fel uppstod vid behandling av din forfragan'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
