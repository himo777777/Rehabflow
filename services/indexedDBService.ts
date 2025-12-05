/**
 * IndexedDB Service for RehabFlow
 * Provides persistent offline storage with sync capabilities
 * Used for large data like movement sessions, landmarks, and sync queue
 */

import { MovementSession, CalibrationData, TimestampedLandmarks } from '../types';
import { logger } from '../utils/logger';

const DB_NAME = 'rehabflow-db';
const DB_VERSION = 1;

// Store names
const STORES = {
  SYNC_QUEUE: 'sync_queue',
  MOVEMENT_SESSIONS: 'movement_sessions',
  LANDMARKS: 'landmarks',
  CALIBRATIONS: 'calibrations',
  PENDING_UPLOADS: 'pending_uploads',
} as const;

/**
 * Sync queue item for background sync
 */
export interface SyncQueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  data: unknown;
  timestamp: number;
  retries: number;
  type: 'movement_session' | 'calibration' | 'progress' | 'pain_log';
}

/**
 * Pending video upload
 */
export interface PendingUpload {
  id: string;
  sessionId: string;
  videoBlob: Blob;
  timestamp: number;
  retries: number;
}

/**
 * Landmarks storage with session reference
 */
export interface StoredLandmarks {
  id: string;
  sessionId: string;
  landmarks: TimestampedLandmarks[];
  timestamp: number;
}

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      // Movement sessions store
      if (!db.objectStoreNames.contains(STORES.MOVEMENT_SESSIONS)) {
        const sessionStore = db.createObjectStore(STORES.MOVEMENT_SESSIONS, { keyPath: 'id' });
        sessionStore.createIndex('exerciseName', 'exerciseName', { unique: false });
        sessionStore.createIndex('sessionDate', 'sessionDate', { unique: false });
        sessionStore.createIndex('synced', 'synced', { unique: false });
      }

      // Landmarks store (separate from sessions for performance)
      if (!db.objectStoreNames.contains(STORES.LANDMARKS)) {
        const landmarkStore = db.createObjectStore(STORES.LANDMARKS, { keyPath: 'id' });
        landmarkStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      // Calibrations store
      if (!db.objectStoreNames.contains(STORES.CALIBRATIONS)) {
        db.createObjectStore(STORES.CALIBRATIONS, { keyPath: 'userId' });
      }

      // Pending uploads store (for video blobs)
      if (!db.objectStoreNames.contains(STORES.PENDING_UPLOADS)) {
        const uploadStore = db.createObjectStore(STORES.PENDING_UPLOADS, { keyPath: 'id' });
        uploadStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      logger.debug('[IndexedDB] Database upgraded to version', DB_VERSION);
    };
  });
}

/**
 * Generic transaction helper
 */
async function withTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    const request = callback(store);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * IndexedDB Service
 */
export const indexedDBService = {
  // ============================================
  // SYNC QUEUE OPERATIONS
  // ============================================

  /**
   * Add item to sync queue
   */
  addToSyncQueue: async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> => {
    const id = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const queueItem: SyncQueueItem = {
      ...item,
      id,
      timestamp: Date.now(),
      retries: 0,
    };

    await withTransaction(STORES.SYNC_QUEUE, 'readwrite', (store) =>
      store.add(queueItem)
    );

    logger.debug('[IndexedDB] Added to sync queue:', id);
    return id;
  },

  /**
   * Get all pending sync items
   */
  getPendingSyncItems: async (): Promise<SyncQueueItem[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Get sync items by type
   */
  getSyncItemsByType: async (type: SyncQueueItem['type']): Promise<SyncQueueItem[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Remove item from sync queue
   */
  removeSyncItem: async (id: string): Promise<void> => {
    await withTransaction(STORES.SYNC_QUEUE, 'readwrite', (store) =>
      store.delete(id)
    );
    logger.debug('[IndexedDB] Removed from sync queue:', id);
  },

  /**
   * Update sync item retry count
   */
  updateSyncItemRetries: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries += 1;
          store.put(item);
        }
        resolve();
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Get count of pending sync items
   */
  getPendingSyncCount: async (): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  // ============================================
  // MOVEMENT SESSIONS
  // ============================================

  /**
   * Save movement session to IndexedDB
   */
  saveMovementSession: async (
    session: MovementSession & { synced?: boolean }
  ): Promise<void> => {
    const sessionToStore = {
      ...session,
      synced: session.synced ?? false,
    };

    // Remove landmarks from main session (store separately)
    const { landmarks, ...sessionWithoutLandmarks } = sessionToStore;

    await withTransaction(STORES.MOVEMENT_SESSIONS, 'readwrite', (store) =>
      store.put(sessionWithoutLandmarks)
    );

    // Store landmarks separately if they exist
    if (landmarks && landmarks.length > 0) {
      await indexedDBService.saveLandmarks(session.id, landmarks);
    }

    logger.debug('[IndexedDB] Movement session saved:', session.id);
  },

  /**
   * Get all movement sessions
   */
  getMovementSessions: async (): Promise<MovementSession[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MOVEMENT_SESSIONS, 'readonly');
      const store = transaction.objectStore(STORES.MOVEMENT_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Get movement session by ID
   */
  getMovementSessionById: async (id: string): Promise<MovementSession | undefined> => {
    const session = await withTransaction<MovementSession | undefined>(
      STORES.MOVEMENT_SESSIONS,
      'readonly',
      (store) => store.get(id)
    );

    if (session) {
      // Load landmarks
      const landmarks = await indexedDBService.getLandmarks(id);
      if (landmarks) {
        session.landmarks = landmarks.landmarks;
      }
    }

    return session;
  },

  /**
   * Get unsynced movement sessions
   */
  getUnsyncedSessions: async (): Promise<MovementSession[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MOVEMENT_SESSIONS, 'readonly');
      const store = transaction.objectStore(STORES.MOVEMENT_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter for unsynced sessions (synced === false or undefined)
        const sessions = (request.result || []).filter(
          (s: MovementSession & { synced?: boolean }) => !s.synced
        );
        resolve(sessions);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Mark session as synced
   */
  markSessionSynced: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MOVEMENT_SESSIONS, 'readwrite');
      const store = transaction.objectStore(STORES.MOVEMENT_SESSIONS);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const session = getRequest.result;
        if (session) {
          session.synced = true;
          store.put(session);
        }
        resolve();
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Delete movement session
   */
  deleteMovementSession: async (id: string): Promise<void> => {
    await withTransaction(STORES.MOVEMENT_SESSIONS, 'readwrite', (store) =>
      store.delete(id)
    );
    // Also delete associated landmarks
    await indexedDBService.deleteLandmarks(id);
  },

  /**
   * Get sessions count
   */
  getSessionsCount: async (): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.MOVEMENT_SESSIONS, 'readonly');
      const store = transaction.objectStore(STORES.MOVEMENT_SESSIONS);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  // ============================================
  // LANDMARKS (Large data, stored separately)
  // ============================================

  /**
   * Save landmarks for a session
   */
  saveLandmarks: async (sessionId: string, landmarks: TimestampedLandmarks[]): Promise<void> => {
    const storedLandmarks: StoredLandmarks = {
      id: `landmarks_${sessionId}`,
      sessionId,
      landmarks,
      timestamp: Date.now(),
    };

    await withTransaction(STORES.LANDMARKS, 'readwrite', (store) =>
      store.put(storedLandmarks)
    );
  },

  /**
   * Get landmarks for a session
   */
  getLandmarks: async (sessionId: string): Promise<StoredLandmarks | undefined> => {
    return withTransaction<StoredLandmarks | undefined>(
      STORES.LANDMARKS,
      'readonly',
      (store) => store.get(`landmarks_${sessionId}`)
    );
  },

  /**
   * Delete landmarks for a session
   */
  deleteLandmarks: async (sessionId: string): Promise<void> => {
    await withTransaction(STORES.LANDMARKS, 'readwrite', (store) =>
      store.delete(`landmarks_${sessionId}`)
    );
  },

  // ============================================
  // CALIBRATIONS
  // ============================================

  /**
   * Save calibration data
   */
  saveCalibration: async (userId: string, data: CalibrationData): Promise<void> => {
    const calibration = {
      userId,
      data,
      timestamp: Date.now(),
    };

    await withTransaction(STORES.CALIBRATIONS, 'readwrite', (store) =>
      store.put(calibration)
    );
    logger.debug('[IndexedDB] Calibration saved for user:', userId);
  },

  /**
   * Load calibration data
   */
  loadCalibration: async (userId: string): Promise<CalibrationData | null> => {
    const result = await withTransaction<{ userId: string; data: CalibrationData } | undefined>(
      STORES.CALIBRATIONS,
      'readonly',
      (store) => store.get(userId)
    );

    return result?.data || null;
  },

  // ============================================
  // PENDING UPLOADS (Video blobs)
  // ============================================

  /**
   * Save pending video upload
   */
  savePendingUpload: async (sessionId: string, videoBlob: Blob): Promise<string> => {
    const id = `upload_${sessionId}`;
    const upload: PendingUpload = {
      id,
      sessionId,
      videoBlob,
      timestamp: Date.now(),
      retries: 0,
    };

    await withTransaction(STORES.PENDING_UPLOADS, 'readwrite', (store) =>
      store.put(upload)
    );

    logger.debug('[IndexedDB] Pending upload saved:', id);
    return id;
  },

  /**
   * Get all pending uploads
   */
  getPendingUploads: async (): Promise<PendingUpload[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_UPLOADS, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_UPLOADS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Remove pending upload
   */
  removePendingUpload: async (id: string): Promise<void> => {
    await withTransaction(STORES.PENDING_UPLOADS, 'readwrite', (store) =>
      store.delete(id)
    );
    logger.debug('[IndexedDB] Pending upload removed:', id);
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Clear all data (for logout/reset)
   */
  clearAll: async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const storeNames = Object.values(STORES);
      const transaction = db.transaction(storeNames, 'readwrite');

      let completed = 0;
      const total = storeNames.length;

      storeNames.forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            logger.debug('[IndexedDB] All data cleared');
            resolve();
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });

      transaction.oncomplete = () => {
        db.close();
      };
    });
  },

  /**
   * Get database size estimate
   */
  getStorageEstimate: async (): Promise<{ usage: number; quota: number } | null> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return null;
  },

  /**
   * Check if IndexedDB is supported
   */
  isSupported: (): boolean => {
    return 'indexedDB' in window;
  },

  /**
   * Cleanup old sessions (keep last N sessions)
   */
  cleanupOldSessions: async (keepCount: number = 50): Promise<number> => {
    const sessions = await indexedDBService.getMovementSessions();

    if (sessions.length <= keepCount) {
      return 0;
    }

    // Sort by date descending
    const sorted = sessions.sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );

    // Delete old sessions (keep synced ones longer)
    const toDelete = sorted.slice(keepCount).filter((s) => (s as { synced?: boolean }).synced);

    for (const session of toDelete) {
      await indexedDBService.deleteMovementSession(session.id);
    }

    logger.debug('[IndexedDB] Cleaned up', toDelete.length, 'old sessions');
    return toDelete.length;
  },
};
