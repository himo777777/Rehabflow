/**
 * Cache Utility
 *
 * Simple in-memory and localStorage cache with TTL (time-to-live) support.
 * Useful for caching API responses and computed data.
 */

import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds (default: 5 minutes)
  persistent?: boolean; // Use localStorage (survives page reload)
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'rehabflow_cache_';

// In-memory cache
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Set a value in the cache
 */
export function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { ttl = DEFAULT_TTL, persistent = false } = options;
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl
  };

  if (persistent) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
      logger.debug(`Cache set (persistent): ${key}`);
    } catch (e) {
      // localStorage might be full or disabled
      logger.warn('Failed to persist cache entry', e);
      memoryCache.set(key, entry);
    }
  } else {
    memoryCache.set(key, entry);
    logger.debug(`Cache set (memory): ${key}`);
  }
}

/**
 * Get a value from the cache
 * Returns null if not found or expired
 */
export function getCache<T>(key: string, persistent = false): T | null {
  let entry: CacheEntry<T> | null = null;

  if (persistent) {
    try {
      const stored = localStorage.getItem(CACHE_PREFIX + key);
      if (stored) {
        entry = JSON.parse(stored) as CacheEntry<T>;
      }
    } catch {
      // Ignore parsing errors
    }
  } else {
    entry = memoryCache.get(key) as CacheEntry<T> | undefined ?? null;
  }

  if (!entry) {
    return null;
  }

  // Check if expired
  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  if (isExpired) {
    // Clean up expired entry
    if (persistent) {
      localStorage.removeItem(CACHE_PREFIX + key);
    } else {
      memoryCache.delete(key);
    }
    logger.debug(`Cache expired: ${key}`);
    return null;
  }

  logger.debug(`Cache hit: ${key}`);
  return entry.data;
}

/**
 * Remove a specific cache entry
 */
export function removeCache(key: string, persistent = false): void {
  if (persistent) {
    localStorage.removeItem(CACHE_PREFIX + key);
  }
  memoryCache.delete(key);
  logger.debug(`Cache removed: ${key}`);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  // Clear memory cache
  memoryCache.clear();

  // Clear localStorage cache entries
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });

  logger.info('All cache cleared');
}

/**
 * Cached function wrapper
 * Automatically caches function results based on arguments
 */
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyPrefix: string,
  options: CacheOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = `${keyPrefix}_${JSON.stringify(args)}`;
    const cached = getCache<Awaited<ReturnType<T>>>(cacheKey, options.persistent);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    setCache(cacheKey, result, options);
    return result;
  }) as T;
}

/**
 * SWR-style cache (Stale-While-Revalidate)
 * Returns stale data immediately while fetching fresh data in background
 */
export async function getWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { staleTime?: number } = {}
): Promise<T> {
  const { ttl = DEFAULT_TTL, staleTime = ttl * 2, persistent = false } = options;

  // Try to get cached data
  const cached = getCache<T>(key, persistent);

  if (cached !== null) {
    // Check if we should revalidate in background
    const entry = persistent
      ? JSON.parse(localStorage.getItem(CACHE_PREFIX + key) || '{}') as CacheEntry<T>
      : memoryCache.get(key) as CacheEntry<T>;

    const age = Date.now() - entry.timestamp;
    if (age > ttl && age < staleTime) {
      // Data is stale but usable, revalidate in background
      fetcher().then(freshData => {
        setCache(key, freshData, { ttl, persistent });
      }).catch(() => {
        // Ignore background fetch errors
      });
    }

    return cached;
  }

  // No cache, fetch fresh data
  const data = await fetcher();
  setCache(key, data, { ttl, persistent });
  return data;
}

/**
 * Preload cache entries for faster access
 */
export function preloadCache<T>(
  entries: Array<{ key: string; data: T; options?: CacheOptions }>
): void {
  entries.forEach(({ key, data, options }) => {
    setCache(key, data, options);
  });
  logger.debug(`Preloaded ${entries.length} cache entries`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  memoryEntries: number;
  persistentEntries: number;
  memorySize: string;
} {
  let persistentCount = 0;
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      persistentCount++;
    }
  });

  // Rough memory size estimation
  let memorySize = 0;
  memoryCache.forEach((entry) => {
    memorySize += JSON.stringify(entry).length * 2; // UTF-16
  });

  return {
    memoryEntries: memoryCache.size,
    persistentEntries: persistentCount,
    memorySize: formatBytes(memorySize)
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
  set: setCache,
  get: getCache,
  remove: removeCache,
  clearAll: clearAllCache,
  withCache,
  getWithSWR,
  preload: preloadCache,
  stats: getCacheStats
};
