/**
 * AI Proxy Service
 *
 * Client-side service that proxies AI requests through our API
 * instead of calling Groq directly. This keeps API keys secure
 * on the server side.
 */

import { logger } from '../lib/logger';

const API_ENDPOINT = '/api/ai/completion';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

export interface AIStreamCallback {
  onToken: (token: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Checks if we're in development mode and should use direct Groq calls
 * (for when Vercel dev server isn't running)
 */
function shouldUseFallback(): boolean {
  // In production, always use the proxy
  if (import.meta.env.PROD) {
    return false;
  }

  // In development, check if the API endpoint is available
  // We'll try the proxy first and fall back if needed
  return false;
}

/**
 * Makes a non-streaming AI completion request
 */
export async function aiCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
  const { messages, model, temperature, max_tokens } = options;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: model || 'llama-3.3-70b-versatile',
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens || 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = errorData.retryAfter || 60;
        throw new AIProxyError(
          `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          'RATE_LIMIT',
          retryAfter
        );
      }

      throw new AIProxyError(
        errorData.message || 'AI request failed',
        'API_ERROR',
        undefined,
        response.status
      );
    }

    const data = await response.json();
    return {
      content: data.content,
      usage: data.usage,
      model: data.model,
    };

  } catch (error) {
    if (error instanceof AIProxyError) {
      throw error;
    }

    logger.error('AI proxy request failed', error);
    throw new AIProxyError(
      'Failed to connect to AI service. Please check your internet connection.',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Makes a streaming AI completion request
 */
export async function aiCompletionStream(
  options: AICompletionOptions,
  callbacks: AIStreamCallback
): Promise<void> {
  const { messages, model, temperature, max_tokens } = options;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: model || 'llama-3.3-70b-versatile',
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens || 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        const retryAfter = errorData.retryAfter || 60;
        throw new AIProxyError(
          `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          'RATE_LIMIT',
          retryAfter
        );
      }

      throw new AIProxyError(
        errorData.message || 'AI request failed',
        'API_ERROR',
        undefined,
        response.status
      );
    }

    // Handle SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIProxyError('Stream not available', 'STREAM_ERROR');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            callbacks.onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              callbacks.onToken(parsed.content);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }

  } catch (error) {
    if (error instanceof AIProxyError) {
      callbacks.onError?.(error);
      throw error;
    }

    logger.error('AI proxy stream failed', error);
    const proxyError = new AIProxyError(
      'Failed to connect to AI service',
      'NETWORK_ERROR'
    );
    callbacks.onError?.(proxyError);
    throw proxyError;
  }
}

/**
 * Custom error class for AI proxy errors
 */
export class AIProxyError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'API_ERROR' | 'NETWORK_ERROR' | 'STREAM_ERROR',
    public retryAfter?: number,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIProxyError';
  }
}

/**
 * Utility function to retry failed requests with exponential backoff
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

      // Don't retry rate limits or network errors immediately
      if (error instanceof AIProxyError) {
        if (error.code === 'RATE_LIMIT') {
          const waitTime = (error.retryAfter || 60) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (error.code === 'NETWORK_ERROR') {
          // Wait with exponential backoff for network errors
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // For other errors, wait with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
