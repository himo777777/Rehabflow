/**
 * Unified AI Client
 *
 * All AI calls go through the server-side proxy (/api/ai/completion).
 * This keeps API keys secure and avoids CommonJS compatibility issues.
 *
 * In development: Run `vercel dev` to have the API routes available
 * In production: Deployed API routes handle requests
 */

import { logger } from "./logger";

const MODEL = "llama-3.3-70b-versatile";
const API_ENDPOINT = "/api/ai/completion";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIStreamOptions extends AICompletionOptions {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
}

/**
 * Make a non-streaming AI completion request
 */
export async function aiCompletion(options: AICompletionOptions): Promise<string> {
  return await proxyCompletion(options);
}

/**
 * Make a streaming AI completion request
 */
export async function aiCompletionStream(options: AIStreamOptions): Promise<string> {
  return await proxyStreamCompletion(options);
}

// ============================================
// PROXY IMPLEMENTATIONS
// ============================================

async function proxyCompletion(options: AICompletionOptions): Promise<string> {
  const { messages, model, temperature, max_tokens } = options;

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: model || MODEL,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens || 4096,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    handleProxyError(response.status, error);
  }

  const data = await response.json();
  return data.content;
}

async function proxyStreamCompletion(options: AIStreamOptions): Promise<string> {
  const { messages, model, temperature, max_tokens, onChunk, onComplete } = options;

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      model: model || MODEL,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens || 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    handleProxyError(response.status, error);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Stream not available");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      onComplete?.();
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();

        if (data === "[DONE]") {
          onComplete?.();
          return fullResponse;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullResponse += parsed.content;
            onChunk(parsed.content);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  return fullResponse;
}

function handleProxyError(status: number, error: any): never {
  if (status === 429) {
    const retryAfter = error.retryAfter || 60;
    throw new AIClientError(
      `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      "RATE_LIMIT",
      retryAfter
    );
  }

  throw new AIClientError(
    error.message || "AI request failed",
    "API_ERROR",
    undefined,
    status
  );
}

/**
 * Custom error class for AI client errors
 */
export class AIClientError extends Error {
  constructor(
    message: string,
    public code: "RATE_LIMIT" | "API_ERROR" | "NETWORK_ERROR",
    public retryAfter?: number,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AIClientError";
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof AIClientError && error.code === "RATE_LIMIT") {
        const waitTime = (error.retryAfter || 60) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================
// CIRCUIT BREAKER
// ============================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold?: number;     // Failures before opening circuit
  recoveryTimeout?: number;       // Ms before trying again (half-open)
  successThreshold?: number;      // Successes in half-open to close circuit
  monitoringWindow?: number;      // Ms window for failure counting
}

interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

/**
 * Circuit Breaker for AI calls
 *
 * Prevents cascading failures by stopping requests when AI service is failing.
 * States:
 * - CLOSED: Normal operation, requests go through
 * - OPEN: After threshold failures, requests are blocked
 * - HALF_OPEN: After recovery timeout, allows test requests
 */
class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private failureTimestamps: number[] = [];

  // Stats
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;

  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly successThreshold: number;
  private readonly monitoringWindow: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.recoveryTimeout = options.recoveryTimeout ?? 30000; // 30 seconds
    this.successThreshold = options.successThreshold ?? 2;
    this.monitoringWindow = options.monitoringWindow ?? 60000; // 1 minute
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (this.shouldAttemptRecovery()) {
        this.state = 'HALF_OPEN';
        logger.info('[CircuitBreaker] Transitioning to HALF_OPEN state');
      } else {
        throw new AIClientError(
          'Circuit breaker is OPEN. AI service temporarily unavailable.',
          'API_ERROR',
          Math.ceil((this.lastFailureTime! + this.recoveryTimeout - Date.now()) / 1000)
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptRecovery(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.recoveryTimeout;
  }

  private onSuccess(): void {
    this.totalSuccesses++;
    this.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.reset();
        logger.info('[CircuitBreaker] Circuit CLOSED after successful recovery');
      }
    } else {
      // In CLOSED state, reset failure count on success
      this.failures = 0;
      this.cleanOldFailures();
    }
  }

  private onFailure(): void {
    this.totalFailures++;
    this.failures++;
    this.lastFailureTime = Date.now();
    this.failureTimestamps.push(Date.now());
    this.cleanOldFailures();

    if (this.state === 'HALF_OPEN') {
      // Any failure in HALF_OPEN opens the circuit again
      this.state = 'OPEN';
      this.successes = 0;
      logger.warn('[CircuitBreaker] Circuit OPEN again after failed recovery attempt');
    } else if (this.state === 'CLOSED') {
      // Check if we should open the circuit
      const recentFailures = this.getRecentFailureCount();
      if (recentFailures >= this.failureThreshold) {
        this.state = 'OPEN';
        logger.warn(`[CircuitBreaker] Circuit OPEN after ${recentFailures} failures`);
      }
    }
  }

  private cleanOldFailures(): void {
    const cutoff = Date.now() - this.monitoringWindow;
    this.failureTimestamps = this.failureTimestamps.filter(t => t > cutoff);
  }

  private getRecentFailureCount(): number {
    this.cleanOldFailures();
    return this.failureTimestamps.length;
  }

  private reset(full: boolean = false): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];

    // Full reset also clears total counters (for testing)
    if (full) {
      this.totalRequests = 0;
      this.totalFailures = 0;
      this.totalSuccesses = 0;
      this.lastFailureTime = null;
      this.lastSuccessTime = null;
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailureTime,
      lastSuccess: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Manually reset the circuit breaker (full reset for testing)
   */
  forceReset(): void {
    this.reset(true);
    logger.info('[CircuitBreaker] Manually reset');
  }

  /**
   * Check if circuit is allowing requests
   */
  isAvailable(): boolean {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'HALF_OPEN') return true;
    return this.shouldAttemptRecovery();
  }
}

// Global circuit breaker instance for AI calls
export const aiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,      // Open after 5 failures
  recoveryTimeout: 30000,   // Wait 30s before trying again
  successThreshold: 2,      // Need 2 successes to close
  monitoringWindow: 60000,  // Count failures in last minute
});

/**
 * Execute AI call with circuit breaker and retry logic
 */
export async function withCircuitBreaker<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options;

  return aiCircuitBreaker.execute(() => withRetry(fn, maxRetries, baseDelay));
}

/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStats(): CircuitBreakerStats {
  return aiCircuitBreaker.getStats();
}

/**
 * Reset circuit breaker manually
 */
export function resetCircuitBreaker(): void {
  aiCircuitBreaker.forceReset();
}
