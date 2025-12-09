/**
 * Unified AI Client
 *
 * Provides a unified interface for AI calls that automatically routes
 * to either the server-side proxy (production) or direct Groq SDK (development).
 *
 * In production: All calls go through /api/ai/completion (secure)
 * In development: Falls back to direct Groq SDK for convenience
 */

import Groq from "groq-sdk";
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

// Development mode Groq client (only initialized if needed)
let devGroqClient: Groq | null = null;

function getDevGroqClient(): Groq | null {
  if (import.meta.env.PROD) return null;

  if (!devGroqClient) {
    const apiKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
    if (apiKey) {
      devGroqClient = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }
  return devGroqClient;
}

/**
 * Check if we should use the server proxy
 */
function shouldUseProxy(): boolean {
  // Always use proxy in production
  if (import.meta.env.PROD) {
    return true;
  }

  // In development, check if we're running with Vercel dev
  // If not, fall back to direct Groq calls
  return false; // Will be true when using `vercel dev`
}

/**
 * Make a non-streaming AI completion request
 */
export async function aiCompletion(options: AICompletionOptions): Promise<string> {
  const { messages, model, temperature, max_tokens } = options;

  if (shouldUseProxy()) {
    return await proxyCompletion(options);
  }

  // Development fallback: direct Groq call
  const groq = getDevGroqClient();
  if (!groq) {
    throw new Error("No AI client available. Set VITE_GROQ_API_KEY in .env.local");
  }

  const completion = await groq.chat.completions.create({
    messages,
    model: model || MODEL,
    temperature: temperature ?? 0.7,
    max_tokens: max_tokens || 4096,
  });

  return completion.choices[0]?.message?.content || "";
}

/**
 * Make a streaming AI completion request
 */
export async function aiCompletionStream(options: AIStreamOptions): Promise<string> {
  const { messages, model, temperature, max_tokens, onChunk, onComplete } = options;

  if (shouldUseProxy()) {
    return await proxyStreamCompletion(options);
  }

  // Development fallback: direct Groq streaming
  const groq = getDevGroqClient();
  if (!groq) {
    throw new Error("No AI client available. Set VITE_GROQ_API_KEY in .env.local");
  }

  let fullResponse = "";

  const stream = await groq.chat.completions.create({
    messages,
    model: model || MODEL,
    temperature: temperature ?? 0.7,
    max_tokens: max_tokens || 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  onComplete?.();
  return fullResponse;
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
