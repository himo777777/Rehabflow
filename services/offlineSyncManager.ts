/**
 * Offline Sync Manager for RehabFlow
 * Coordinates offline data storage and background sync
 */

import { indexedDBService, SyncQueueItem } from './indexedDBService';
import { MovementSession, CalibrationData } from '../types';
import { logger } from '../utils/logger';
import { supabase, getUserId } from './supabaseClient';

// Get environment variables (Vite compatible)
const getSupabaseUrl = () =>
  process.env.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || '';
const getSupabaseAnonKey = () =>
  process.env.SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Sync status
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

// Sync event types
export interface SyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_error' | 'item_synced' | 'offline' | 'online';
  data?: unknown;
}

// Sync state
interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncAt: string | null;
  isOnline: boolean;
}

// Sync event listeners
type SyncEventListener = (event: SyncEvent) => void;

class OfflineSyncManager {
  private state: SyncState = {
    status: 'synced',
    pendingCount: 0,
    lastSyncAt: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  private listeners: Set<SyncEventListener> = new Set();
  private syncInProgress = false;
  private serviceWorkerReady = false;
  // SECURITY FIX: Add mutex for sync operations to prevent race conditions
  private syncLock: Promise<void> = Promise.resolve();
  private pendingSyncRequest = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.registerServiceWorker();
      this.updatePendingCount();
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      logger.info('Network status: online');
      this.state.isOnline = true;
      this.emit({ type: 'online' });
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      logger.info('Network status: offline');
      this.state.isOnline = false;
      this.state.status = 'offline';
      this.emit({ type: 'offline' });
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'MOVEMENT_SESSION_SYNCED') {
          this.handleSessionSynced(event.data.sessionId);
        } else if (event.data?.type === 'VIDEO_UPLOAD_COMPLETE') {
          this.handleVideoUploaded(event.data.sessionId);
        }
      });
    }
  }

  /**
   * Register service worker with background sync
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      logger.info('Service Worker registered');
      this.serviceWorkerReady = true;

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      logger.debug('Service Worker ready');
    } catch (error) {
      logger.error('Service Worker registration failed', error);
    }
  }

  /**
   * Subscribe to sync events
   */
  subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit sync event to all listeners
   */
  private emit(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Sync event listener error', error);
      }
    });
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Update pending sync count
   */
  private async updatePendingCount(): Promise<void> {
    try {
      const count = await indexedDBService.getPendingSyncCount();
      this.state.pendingCount = count;

      if (count > 0 && this.state.isOnline && this.state.status !== 'syncing') {
        this.state.status = 'pending';
      } else if (count === 0 && this.state.isOnline) {
        this.state.status = 'synced';
      }
    } catch (error) {
      logger.warn('Failed to get pending sync count', error);
    }
  }

  /**
   * Queue movement session for sync
   */
  async queueMovementSession(session: MovementSession): Promise<void> {
    try {
      // Save to IndexedDB first
      await indexedDBService.saveMovementSession(session);

      // If online and Supabase is available, try to sync immediately
      if (this.state.isOnline && supabase) {
        const userId = getUserId();

        // Add to sync queue
        await indexedDBService.addToSyncQueue({
          url: `${getSupabaseUrl()}/rest/v1/movement_sessions`,
          method: 'POST',
          headers: {
            apikey: getSupabaseAnonKey(),
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          data: {
            id: session.id,
            user_id: userId,
            exercise_name: session.exerciseName,
            session_date: session.sessionDate,
            duration: session.duration,
            reps_completed: session.repsCompleted,
            average_score: session.averageScore,
            rom_achieved: session.romAchieved,
            form_issues: session.formIssues,
            rep_scores: session.repScores,
            video_url: session.videoUrl || null,
          },
          type: 'movement_session',
        });

        // Request background sync
        await this.requestBackgroundSync('sync-movement-sessions');
      }

      await this.updatePendingCount();
      logger.info('Movement session queued for sync', { sessionId: session.id });
    } catch (error) {
      logger.error('Failed to queue movement session', error);
      throw error;
    }
  }

  /**
   * Queue video upload
   */
  async queueVideoUpload(sessionId: string, videoBlob: Blob): Promise<void> {
    try {
      await indexedDBService.savePendingUpload(sessionId, videoBlob);

      if (this.state.isOnline) {
        await this.requestBackgroundSync('sync-video-uploads');
      }

      await this.updatePendingCount();
      logger.info('Video upload queued', { sessionId });
    } catch (error) {
      logger.error('Failed to queue video upload', error);
      throw error;
    }
  }

  /**
   * Queue calibration data for sync
   */
  async queueCalibration(calibration: CalibrationData): Promise<void> {
    try {
      const userId = getUserId();
      await indexedDBService.saveCalibration(userId, calibration);

      if (this.state.isOnline && supabase) {
        await indexedDBService.addToSyncQueue({
          url: `${getSupabaseUrl()}/rest/v1/user_calibrations`,
          method: 'POST',
          headers: {
            apikey: getSupabaseAnonKey(),
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
            Prefer: 'resolution=merge-duplicates',
          },
          data: {
            user_id: userId,
            calibration_data: calibration,
            updated_at: new Date().toISOString(),
          },
          type: 'calibration',
        });

        await this.requestBackgroundSync('sync-progress');
      }

      await this.updatePendingCount();
      logger.info('Calibration queued for sync');
    } catch (error) {
      logger.error('Failed to queue calibration', error);
      throw error;
    }
  }

  /**
   * Request background sync via service worker
   */
  private async requestBackgroundSync(tag: string): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Background sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if ('sync' in registration) {
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
        logger.debug('Background sync registered', { tag });
      } else {
        // Fallback: trigger sync via message
        registration.active?.postMessage({ type: 'TRIGGER_SYNC' });
        logger.debug('Triggered sync via message');
      }
    } catch (error) {
      logger.warn('Background sync registration failed', error);
      // Fallback: try immediate sync
      this.triggerSync();
    }
  }

  /**
   * Trigger manual sync with proper mutex lock to prevent race conditions
   * SECURITY FIX: Uses promise-based lock to ensure only one sync runs at a time
   */
  async triggerSync(): Promise<void> {
    // Early exit if offline
    if (!this.state.isOnline) {
      logger.debug('Sync skipped - offline');
      return;
    }

    // If sync is in progress, mark that we want to sync again when done
    if (this.syncInProgress) {
      this.pendingSyncRequest = true;
      logger.debug('Sync in progress, queued for retry');
      return;
    }

    // Acquire lock using promise chain
    const previousLock = this.syncLock;
    let releaseLock: () => void = () => {};

    this.syncLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    // Wait for any previous sync to complete
    await previousLock;

    this.syncInProgress = true;
    this.state.status = 'syncing';
    this.emit({ type: 'sync_started' });

    try {
      // Get all pending items
      const pendingItems = await indexedDBService.getPendingSyncItems();
      logger.info(`Syncing ${pendingItems.length} pending items`);

      let successCount = 0;
      let errorCount = 0;

      for (const item of pendingItems) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              ...item.headers,
            },
            body: JSON.stringify(item.data),
          });

          if (response.ok) {
            await indexedDBService.removeSyncItem(item.id);
            successCount++;

            // Mark session as synced if it's a movement session
            if (item.type === 'movement_session' && item.data && typeof item.data === 'object' && 'id' in item.data) {
              await indexedDBService.markSessionSynced(item.data.id as string);
            }

            this.emit({ type: 'item_synced', data: item });
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          logger.error(`Failed to sync item ${item.id}`, error);
          await indexedDBService.updateSyncItemRetries(item.id);
          errorCount++;

          // Remove if too many retries
          if (item.retries >= 3) {
            await indexedDBService.removeSyncItem(item.id);
            logger.warn('Removed item after max retries', { id: item.id });
          }
        }
      }

      // Update state
      await this.updatePendingCount();
      this.state.lastSyncAt = new Date().toISOString();

      if (errorCount > 0 && successCount === 0) {
        this.state.status = 'error';
        this.emit({ type: 'sync_error', data: { errorCount } });
      } else {
        this.state.status = this.state.pendingCount > 0 ? 'pending' : 'synced';
        this.emit({ type: 'sync_completed', data: { successCount, errorCount } });
      }

      logger.info('Sync completed', { successCount, errorCount });
    } catch (error) {
      logger.error('Sync failed', error);
      this.state.status = 'error';
      this.emit({ type: 'sync_error', data: error });
    } finally {
      this.syncInProgress = false;
      // Release the lock
      releaseLock();

      // If there was a pending sync request while we were syncing, trigger another sync
      if (this.pendingSyncRequest) {
        this.pendingSyncRequest = false;
        // Use setTimeout to avoid stack overflow on rapid calls
        setTimeout(() => this.triggerSync(), 100);
      }
    }
  }

  /**
   * Handle session synced notification from service worker
   */
  private async handleSessionSynced(sessionId: string): Promise<void> {
    await indexedDBService.markSessionSynced(sessionId);
    await this.updatePendingCount();
    this.emit({ type: 'item_synced', data: { type: 'movement_session', sessionId } });
  }

  /**
   * Handle video uploaded notification from service worker
   */
  private async handleVideoUploaded(sessionId: string): Promise<void> {
    await this.updatePendingCount();
    this.emit({ type: 'item_synced', data: { type: 'video', sessionId } });
  }

  /**
   * Get all locally stored movement sessions
   */
  async getLocalSessions(): Promise<MovementSession[]> {
    return indexedDBService.getMovementSessions();
  }

  /**
   * Get unsynced session count
   */
  async getUnsyncedCount(): Promise<number> {
    const sessions = await indexedDBService.getUnsyncedSessions();
    return sessions.length;
  }

  /**
   * Load calibration from local storage
   */
  async loadCalibration(): Promise<CalibrationData | null> {
    const userId = getUserId();
    return indexedDBService.loadCalibration(userId);
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    await indexedDBService.clearAll();
    this.state.pendingCount = 0;
    this.state.status = 'synced';
    logger.info('Offline data cleared');
  }

  /**
   * Get storage estimate
   */
  async getStorageUsage(): Promise<{ usage: number; quota: number; percentage: number } | null> {
    const estimate = await indexedDBService.getStorageEstimate();
    if (estimate) {
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: Math.round((estimate.usage / estimate.quota) * 100),
      };
    }
    return null;
  }

  /**
   * Cleanup old data
   */
  async cleanup(keepSessions: number = 50): Promise<void> {
    const deleted = await indexedDBService.cleanupOldSessions(keepSessions);
    logger.info(`Cleaned up ${deleted} old sessions`);
  }
}

// Singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Export for use in React hooks
export function useOfflineSync() {
  return offlineSyncManager;
}
