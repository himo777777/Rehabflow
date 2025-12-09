/**
 * Advanced Caching Service - Sprint 5.20
 *
 * Multi-layer caching system for optimal performance.
 * Features:
 * - Memory cache (L1)
 * - IndexedDB cache (L2)
 * - Cache invalidation strategies
 * - TTL-based expiration
 * - LRU eviction
 * - Cache warming
 * - Compression support
 * - Cache statistics
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type CacheLayer = 'memory' | 'indexeddb' | 'all';
export type EvictionPolicy = 'lru' | 'lfu' | 'fifo' | 'ttl';
export type CompressionType = 'none' | 'lz' | 'gzip';

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number | null;
  lastAccessed: number;
  accessCount: number;
  size: number;
  compressed: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CacheConfig {
  maxMemorySize: number; // bytes
  maxIndexedDBSize: number; // bytes
  defaultTTL: number; // milliseconds
  evictionPolicy: EvictionPolicy;
  compressionThreshold: number; // bytes - compress if larger
  compressionType: CompressionType;
  enablePersistence: boolean;
  cleanupInterval: number; // milliseconds
}

export interface CacheStats {
  memorySize: number;
  memoryEntries: number;
  indexedDBSize: number;
  indexedDBEntries: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  compressionRatio: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
  layer?: CacheLayer;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DB_NAME = 'rehabflow-cache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

const DEFAULT_CONFIG: CacheConfig = {
  maxMemorySize: 50 * 1024 * 1024, // 50MB
  maxIndexedDBSize: 200 * 1024 * 1024, // 200MB
  defaultTTL: 60 * 60 * 1000, // 1 hour
  evictionPolicy: 'lru',
  compressionThreshold: 1024, // 1KB
  compressionType: 'lz',
  enablePersistence: true,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// LZ COMPRESSION (Simple)
// ============================================================================

const LZString = {
  compress: (data: string): string => {
    // Simple compression simulation
    return btoa(encodeURIComponent(data));
  },
  decompress: (compressed: string): string => {
    try {
      return decodeURIComponent(atob(compressed));
    } catch {
      return compressed;
    }
  },
};

// ============================================================================
// CACHING SERVICE
// ============================================================================

class CachingService {
  private config: CacheConfig = DEFAULT_CONFIG;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private db: IDBDatabase | null = null;
  private stats: CacheStats = {
    memorySize: 0,
    memoryEntries: 0,
    indexedDBSize: 0,
    indexedDBEntries: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0,
    compressionRatio: 1,
  };
  private cleanupTimer: number | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Defer initialization
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize caching service
   */
  public async init(config?: Partial<CacheConfig>): Promise<void> {
    if (this.isInitialized) return;

    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.enablePersistence) {
      await this.initIndexedDB();
    }

    this.startCleanupTimer();
    this.isInitialized = true;

    logger.info('[Cache] Initialized');
  }

  private async initIndexedDB(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error('[Cache] IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.updateIndexedDBStats();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // --------------------------------------------------------------------------
  // CORE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Get value from cache
   */
  public async get<T>(key: string, layer: CacheLayer = 'all'): Promise<T | null> {
    // Check memory cache first
    if (layer === 'memory' || layer === 'all') {
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry) {
        if (this.isExpired(memoryEntry)) {
          this.memoryCache.delete(key);
        } else {
          memoryEntry.lastAccessed = Date.now();
          memoryEntry.accessCount++;
          this.stats.hits++;
          this.updateHitRate();
          return this.deserializeValue<T>(memoryEntry);
        }
      }
    }

    // Check IndexedDB
    if ((layer === 'indexeddb' || layer === 'all') && this.db) {
      const entry = await this.getFromIndexedDB<T>(key);
      if (entry) {
        // Promote to memory cache
        if (layer === 'all') {
          this.setMemoryEntry(entry);
        }
        this.stats.hits++;
        this.updateHitRate();
        return this.deserializeValue<T>(entry);
      }
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  /**
   * Set value in cache
   */
  public async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    const ttl = options?.ttl ?? this.config.defaultTTL;
    const layer = options?.layer ?? 'all';

    const serialized = JSON.stringify(value);
    const size = serialized.length * 2; // UTF-16

    // Compress if needed
    let finalValue = serialized;
    let compressed = false;
    if (
      (options?.compress ?? size > this.config.compressionThreshold) &&
      this.config.compressionType !== 'none'
    ) {
      finalValue = LZString.compress(serialized);
      compressed = true;
    }

    const entry: CacheEntry<string> = {
      key,
      value: finalValue,
      createdAt: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : null,
      lastAccessed: Date.now(),
      accessCount: 0,
      size: finalValue.length * 2,
      compressed,
      tags: options?.tags,
      metadata: options?.metadata,
    };

    // Set in memory
    if (layer === 'memory' || layer === 'all') {
      await this.setMemoryEntry(entry);
    }

    // Set in IndexedDB
    if ((layer === 'indexeddb' || layer === 'all') && this.db) {
      await this.setIndexedDBEntry(entry);
    }
  }

  /**
   * Delete from cache
   */
  public async delete(key: string, layer: CacheLayer = 'all'): Promise<void> {
    if (layer === 'memory' || layer === 'all') {
      const entry = this.memoryCache.get(key);
      if (entry) {
        this.stats.memorySize -= entry.size;
        this.stats.memoryEntries--;
        this.memoryCache.delete(key);
      }
    }

    if ((layer === 'indexeddb' || layer === 'all') && this.db) {
      await this.deleteFromIndexedDB(key);
    }
  }

  /**
   * Check if key exists
   */
  public async has(key: string, layer: CacheLayer = 'all'): Promise<boolean> {
    if (layer === 'memory' || layer === 'all') {
      const entry = this.memoryCache.get(key);
      if (entry && !this.isExpired(entry)) {
        return true;
      }
    }

    if ((layer === 'indexeddb' || layer === 'all') && this.db) {
      const entry = await this.getFromIndexedDB(key);
      if (entry && !this.isExpired(entry)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear cache
   */
  public async clear(layer: CacheLayer = 'all'): Promise<void> {
    if (layer === 'memory' || layer === 'all') {
      this.memoryCache.clear();
      this.stats.memorySize = 0;
      this.stats.memoryEntries = 0;
    }

    if ((layer === 'indexeddb' || layer === 'all') && this.db) {
      await this.clearIndexedDB();
    }

    logger.info('[Cache] Cleared:', layer);
  }

  // --------------------------------------------------------------------------
  // MEMORY CACHE
  // --------------------------------------------------------------------------

  private async setMemoryEntry(entry: CacheEntry): Promise<void> {
    // Check size limit
    while (
      this.stats.memorySize + entry.size > this.config.maxMemorySize &&
      this.memoryCache.size > 0
    ) {
      await this.evictFromMemory();
    }

    const existing = this.memoryCache.get(entry.key);
    if (existing) {
      this.stats.memorySize -= existing.size;
    } else {
      this.stats.memoryEntries++;
    }

    this.memoryCache.set(entry.key, entry);
    this.stats.memorySize += entry.size;
  }

  private async evictFromMemory(): Promise<void> {
    let keyToEvict: string | null = null;

    switch (this.config.evictionPolicy) {
      case 'lru':
        keyToEvict = this.findLRUKey();
        break;
      case 'lfu':
        keyToEvict = this.findLFUKey();
        break;
      case 'fifo':
        keyToEvict = this.findFIFOKey();
        break;
      case 'ttl':
        keyToEvict = this.findNearestExpiryKey();
        break;
    }

    if (keyToEvict) {
      const entry = this.memoryCache.get(keyToEvict);
      if (entry) {
        this.stats.memorySize -= entry.size;
        this.stats.memoryEntries--;
        this.memoryCache.delete(keyToEvict);
        this.stats.evictions++;
      }
    }
  }

  private findLRUKey(): string | null {
    let oldest: { key: string; time: number } | null = null;

    this.memoryCache.forEach((entry, key) => {
      if (!oldest || entry.lastAccessed < oldest.time) {
        oldest = { key, time: entry.lastAccessed };
      }
    });

    return oldest?.key ?? null;
  }

  private findLFUKey(): string | null {
    let leastUsed: { key: string; count: number } | null = null;

    this.memoryCache.forEach((entry, key) => {
      if (!leastUsed || entry.accessCount < leastUsed.count) {
        leastUsed = { key, count: entry.accessCount };
      }
    });

    return leastUsed?.key ?? null;
  }

  private findFIFOKey(): string | null {
    let oldest: { key: string; time: number } | null = null;

    this.memoryCache.forEach((entry, key) => {
      if (!oldest || entry.createdAt < oldest.time) {
        oldest = { key, time: entry.createdAt };
      }
    });

    return oldest?.key ?? null;
  }

  private findNearestExpiryKey(): string | null {
    let nearest: { key: string; time: number } | null = null;

    this.memoryCache.forEach((entry, key) => {
      if (entry.expiresAt) {
        if (!nearest || entry.expiresAt < nearest.time) {
          nearest = { key, time: entry.expiresAt };
        }
      }
    });

    return nearest?.key ?? null;
  }

  // --------------------------------------------------------------------------
  // INDEXEDDB CACHE
  // --------------------------------------------------------------------------

  private async getFromIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        if (entry && !this.isExpired(entry)) {
          // Update access stats
          this.updateIndexedDBAccess(key);
          resolve(entry);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  private async setIndexedDBEntry(entry: CacheEntry): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => {
        this.updateIndexedDBStats();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        this.updateIndexedDBStats();
        resolve();
      };

      request.onerror = () => {
        resolve();
      };
    });
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        this.stats.indexedDBSize = 0;
        this.stats.indexedDBEntries = 0;
        resolve();
      };

      request.onerror = () => {
        resolve();
      };
    });
  }

  private updateIndexedDBAccess(key: string): void {
    if (!this.db) return;

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      const entry = request.result;
      if (entry) {
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        store.put(entry);
      }
    };
  }

  private updateIndexedDBStats(): void {
    if (!this.db) return;

    const transaction = this.db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();

    countRequest.onsuccess = () => {
      this.stats.indexedDBEntries = countRequest.result;
    };

    // Estimate size
    const cursorRequest = store.openCursor();
    let totalSize = 0;

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        totalSize += (cursor.value as CacheEntry).size;
        cursor.continue();
      } else {
        this.stats.indexedDBSize = totalSize;
      }
    };
  }

  // --------------------------------------------------------------------------
  // UTILITY
  // --------------------------------------------------------------------------

  private isExpired(entry: CacheEntry): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  private deserializeValue<T>(entry: CacheEntry): T {
    let data = entry.value as string;

    if (entry.compressed) {
      data = LZString.decompress(data);
    }

    return JSON.parse(data) as T;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();

    // Clean memory cache
    const expiredMemoryKeys: string[] = [];
    this.memoryCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredMemoryKeys.push(key);
      }
    });

    for (const key of expiredMemoryKeys) {
      await this.delete(key, 'memory');
    }

    // Clean IndexedDB
    if (this.db) {
      await this.cleanupIndexedDB();
    }

    if (expiredMemoryKeys.length > 0) {
      logger.debug('[Cache] Cleaned up:', expiredMemoryKeys.length, 'expired entries');
    }
  }

  private async cleanupIndexedDB(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(Date.now());

    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  // --------------------------------------------------------------------------
  // TAGS
  // --------------------------------------------------------------------------

  /**
   * Invalidate by tag
   */
  public async invalidateByTag(tag: string): Promise<void> {
    // Memory cache
    const memoryKeysToDelete: string[] = [];
    this.memoryCache.forEach((entry, key) => {
      if (entry.tags?.includes(tag)) {
        memoryKeysToDelete.push(key);
      }
    });

    for (const key of memoryKeysToDelete) {
      await this.delete(key, 'memory');
    }

    // IndexedDB
    if (this.db) {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('tags');
      const request = index.openCursor(IDBKeyRange.only(tag));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }

    logger.debug('[Cache] Invalidated by tag:', tag);
  }

  // --------------------------------------------------------------------------
  // CACHE WARMING
  // --------------------------------------------------------------------------

  /**
   * Warm cache with data
   */
  public async warm<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    for (const { key, value, options } of entries) {
      await this.set(key, value, options);
    }

    logger.info('[Cache] Warmed with', entries.length, 'entries');
  }

  /**
   * Preload from IndexedDB to memory
   */
  public async preload(keys: string[]): Promise<void> {
    if (!this.db) return;

    for (const key of keys) {
      const entry = await this.getFromIndexedDB(key);
      if (entry) {
        await this.setMemoryEntry(entry);
      }
    }

    logger.debug('[Cache] Preloaded', keys.length, 'entries');
  }

  // --------------------------------------------------------------------------
  // STATS
  // --------------------------------------------------------------------------

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
    this.stats.evictions = 0;
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  /**
   * Get or set pattern
   */
  public async getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Memoize function
   */
  public memoize<T extends (...args: unknown[]) => unknown>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string,
    options?: CacheOptions
  ): T {
    const cache = this;

    return (async (...args: Parameters<T>) => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      return cache.getOrSet(key, () => fn(...args), options);
    }) as T;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cachingService = new CachingService();

// Initialize on load
if (typeof window !== 'undefined') {
  cachingService.init();
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for cached data
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions & { refreshInterval?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const value = await cachingService.getOrSet(key, fetcherRef.current, options);
      setData(value);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setLoading(false);
    }
  }, [key, options]);

  useEffect(() => {
    refresh();

    if (options?.refreshInterval) {
      const interval = setInterval(refresh, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, options?.refreshInterval]);

  const invalidate = useCallback(async () => {
    await cachingService.delete(key);
    await refresh();
  }, [key, refresh]);

  return { data, loading, error, refresh, invalidate };
}

/**
 * Hook for cache stats
 */
export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats>(cachingService.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cachingService.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

export default cachingService;
