/**
 * Offline-First Utilities - PWA Optimizations
 *
 * World-class offline support for seamless user experience:
 * - Network status detection and handling
 * - Request queuing for offline operations
 * - Cache management and strategies
 * - Background sync utilities
 * - IndexedDB helpers for offline storage
 */

// ============================================================================
// NETWORK STATUS
// ============================================================================

export type NetworkStatus = 'online' | 'offline' | 'slow';

/**
 * Get current network status
 */
export const getNetworkStatus = (): NetworkStatus => {
  if (typeof navigator === 'undefined') return 'online';

  if (!navigator.onLine) {
    return 'offline';
  }

  // Check for slow connection
  const connection = (navigator as any).connection;
  if (connection) {
    const slowTypes = ['slow-2g', '2g'];
    if (slowTypes.includes(connection.effectiveType)) {
      return 'slow';
    }
  }

  return 'online';
};

/**
 * Network status change listener
 */
export const onNetworkChange = (
  callback: (status: NetworkStatus) => void
): (() => void) => {
  const handler = () => callback(getNetworkStatus());

  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);

  // Also listen for connection changes
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', handler);
  }

  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
    if (connection) {
      connection.removeEventListener('change', handler);
    }
  };
};

/**
 * React hook for network status
 */
export const useNetworkStatus = (): NetworkStatus => {
  // This would need React import, keeping as utility
  let status = getNetworkStatus();
  return status;
};

// ============================================================================
// REQUEST QUEUE
// ============================================================================

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

const QUEUE_KEY = 'offline_request_queue';
const MAX_QUEUE_SIZE = 50;

/**
 * Get queued requests from storage
 */
const getQueuedRequests = (): QueuedRequest[] => {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save queued requests to storage
 */
const saveQueuedRequests = (requests: QueuedRequest[]): void => {
  try {
    // Keep only the most recent requests
    const trimmed = requests.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full - clear old requests
    localStorage.removeItem(QUEUE_KEY);
  }
};

/**
 * Add request to offline queue
 */
export const queueRequest = (
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): string => {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const requests = getQueuedRequests();

  const queuedRequest: QueuedRequest = {
    id,
    url,
    method: options.method || 'GET',
    body: typeof options.body === 'string' ? options.body : undefined,
    headers: options.headers as Record<string, string>,
    timestamp: Date.now(),
    retries: 0,
    maxRetries,
  };

  requests.push(queuedRequest);
  saveQueuedRequests(requests);

  // Try to register background sync if available
  registerBackgroundSync('offlineRequestSync');

  return id;
};

/**
 * Process queued requests when online
 */
export const processQueue = async (): Promise<{
  processed: number;
  failed: number;
}> => {
  if (getNetworkStatus() === 'offline') {
    return { processed: 0, failed: 0 };
  }

  const requests = getQueuedRequests();
  let processed = 0;
  let failed = 0;
  const remaining: QueuedRequest[] = [];

  for (const request of requests) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        body: request.body,
        headers: request.headers,
      });

      if (response.ok) {
        processed++;
      } else if (request.retries < request.maxRetries) {
        remaining.push({ ...request, retries: request.retries + 1 });
      } else {
        failed++;
      }
    } catch {
      if (request.retries < request.maxRetries) {
        remaining.push({ ...request, retries: request.retries + 1 });
      } else {
        failed++;
      }
    }
  }

  saveQueuedRequests(remaining);
  return { processed, failed };
};

/**
 * Get queue status
 */
export const getQueueStatus = (): {
  pending: number;
  oldestTimestamp: number | null;
} => {
  const requests = getQueuedRequests();
  return {
    pending: requests.length,
    oldestTimestamp: requests.length > 0 ? requests[0].timestamp : null,
  };
};

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

/**
 * Register a background sync
 */
export const registerBackgroundSync = async (tag: string): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if background sync is supported
 */
export const isBackgroundSyncSupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'sync' in (window.ServiceWorkerRegistration?.prototype || {})
  );
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const CACHE_PREFIX = 'rehabflow-v1';

/**
 * Cache strategies
 */
export type CacheStrategy =
  | 'cache-first'      // Try cache, fallback to network
  | 'network-first'    // Try network, fallback to cache
  | 'stale-while-revalidate'  // Return cache immediately, update in background
  | 'cache-only'       // Only use cache
  | 'network-only';    // Only use network

/**
 * Cached fetch with strategy
 */
export const cachedFetch = async (
  url: string,
  options: RequestInit = {},
  strategy: CacheStrategy = 'stale-while-revalidate',
  cacheName: string = CACHE_PREFIX
): Promise<Response> => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);

  switch (strategy) {
    case 'cache-first':
      if (cachedResponse) {
        return cachedResponse;
      }
      const networkResponse = await fetch(url, options);
      if (networkResponse.ok) {
        cache.put(url, networkResponse.clone());
      }
      return networkResponse;

    case 'network-first':
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          cache.put(url, response.clone());
        }
        return response;
      } catch {
        if (cachedResponse) {
          return cachedResponse;
        }
        throw new Error('No cached response available');
      }

    case 'stale-while-revalidate':
      // Return cached immediately and update in background
      const revalidate = async () => {
        try {
          const freshResponse = await fetch(url, options);
          if (freshResponse.ok) {
            cache.put(url, freshResponse.clone());
          }
        } catch {
          // Silently fail - we have cached data
        }
      };

      if (cachedResponse) {
        // Revalidate in background
        revalidate();
        return cachedResponse;
      }

      // No cache, must wait for network
      const freshResponse = await fetch(url, options);
      if (freshResponse.ok) {
        cache.put(url, freshResponse.clone());
      }
      return freshResponse;

    case 'cache-only':
      if (cachedResponse) {
        return cachedResponse;
      }
      throw new Error('No cached response available');

    case 'network-only':
      return fetch(url, options);

    default:
      return fetch(url, options);
  }
};

/**
 * Preload resources into cache
 */
export const precacheResources = async (
  urls: string[],
  cacheName: string = CACHE_PREFIX
): Promise<void> => {
  const cache = await caches.open(cacheName);
  await cache.addAll(urls);
};

/**
 * Clear old caches
 */
export const clearOldCaches = async (
  keepVersions: string[] = [CACHE_PREFIX]
): Promise<void> => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => !keepVersions.includes(name))
      .map((name) => caches.delete(name))
  );
};

/**
 * Get cache size estimate
 */
export const getCacheSize = async (): Promise<{
  usage: number;
  quota: number;
}> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { usage: 0, quota: 0 };
};

// ============================================================================
// INDEXED DB HELPERS
// ============================================================================

const DB_NAME = 'rehabflow-offline';
const DB_VERSION = 1;

interface DBStore {
  name: string;
  keyPath: string;
  indexes?: Array<{ name: string; keyPath: string; unique?: boolean }>;
}

const STORES: DBStore[] = [
  {
    name: 'offlineData',
    keyPath: 'id',
    indexes: [
      { name: 'type', keyPath: 'type' },
      { name: 'timestamp', keyPath: 'timestamp' },
    ],
  },
  {
    name: 'pendingSync',
    keyPath: 'id',
    indexes: [{ name: 'createdAt', keyPath: 'createdAt' }],
  },
];

/**
 * Open IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, {
            keyPath: store.keyPath,
          });

          if (store.indexes) {
            for (const index of store.indexes) {
              objectStore.createIndex(index.name, index.keyPath, {
                unique: index.unique || false,
              });
            }
          }
        }
      }
    };
  });
};

/**
 * IndexedDB operations
 */
export const offlineDB = {
  /**
   * Save data to IndexedDB
   */
  save: async <T extends { id: string }>(
    storeName: string,
    data: T
  ): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...data, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Get data from IndexedDB
   */
  get: async <T>(storeName: string, id: string): Promise<T | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  /**
   * Get all data from a store
   */
  getAll: async <T>(storeName: string): Promise<T[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  /**
   * Delete data from IndexedDB
   */
  delete: async (storeName: string, id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Clear all data from a store
   */
  clear: async (storeName: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  /**
   * Query by index
   */
  queryByIndex: async <T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey
  ): Promise<T[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },
};

// ============================================================================
// OFFLINE-AWARE FETCH
// ============================================================================

/**
 * Fetch with automatic offline handling
 */
export const offlineFetch = async (
  url: string,
  options: RequestInit = {},
  config: {
    cacheStrategy?: CacheStrategy;
    queueIfOffline?: boolean;
    fallbackData?: any;
  } = {}
): Promise<Response> => {
  const {
    cacheStrategy = 'stale-while-revalidate',
    queueIfOffline = true,
    fallbackData,
  } = config;

  const status = getNetworkStatus();

  if (status === 'offline') {
    // Try to get cached response
    try {
      return await cachedFetch(url, options, 'cache-only');
    } catch {
      // No cached response
      if (queueIfOffline && options.method !== 'GET') {
        // Queue mutation requests
        queueRequest(url, options);
      }

      if (fallbackData !== undefined) {
        return new Response(JSON.stringify(fallbackData), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Offline and no cached data available');
    }
  }

  // Online - use cache strategy
  return cachedFetch(url, options, cacheStrategy);
};

// ============================================================================
// SYNC STATUS
// ============================================================================

export interface SyncStatus {
  isPending: boolean;
  pendingCount: number;
  lastSyncTimestamp: number | null;
  lastSyncSuccess: boolean;
}

const SYNC_STATUS_KEY = 'offline_sync_status';

/**
 * Get sync status
 */
export const getSyncStatus = (): SyncStatus => {
  try {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    const queueStatus = getQueueStatus();

    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        isPending: queueStatus.pending > 0,
        pendingCount: queueStatus.pending,
      };
    }
  } catch {}

  return {
    isPending: false,
    pendingCount: 0,
    lastSyncTimestamp: null,
    lastSyncSuccess: true,
  };
};

/**
 * Update sync status
 */
export const updateSyncStatus = (success: boolean): void => {
  const status: Partial<SyncStatus> = {
    lastSyncTimestamp: Date.now(),
    lastSyncSuccess: success,
  };

  try {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
  } catch {}
};

// ============================================================================
// AUTO SYNC ON RECONNECT
// ============================================================================

let isAutoSyncSetup = false;

/**
 * Setup automatic sync when coming back online
 */
export const setupAutoSync = (): void => {
  if (isAutoSyncSetup) return;
  isAutoSyncSetup = true;

  onNetworkChange(async (status) => {
    if (status === 'online') {
      const result = await processQueue();
      updateSyncStatus(result.failed === 0);
    }
  });
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Network status
  getNetworkStatus,
  onNetworkChange,
  useNetworkStatus,
  // Request queue
  queueRequest,
  processQueue,
  getQueueStatus,
  // Background sync
  registerBackgroundSync,
  isBackgroundSyncSupported,
  // Cache management
  cachedFetch,
  precacheResources,
  clearOldCaches,
  getCacheSize,
  // IndexedDB
  offlineDB,
  // Offline-aware fetch
  offlineFetch,
  // Sync status
  getSyncStatus,
  updateSyncStatus,
  setupAutoSync,
};
