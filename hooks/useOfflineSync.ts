/**
 * useOfflineSync Hook
 * React hook for offline sync functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineSyncManager, SyncStatus, SyncEvent } from '../services/offlineSyncManager';
import { MovementSession, CalibrationData } from '../types';

interface OfflineSyncState {
  status: SyncStatus;
  pendingCount: number;
  isOnline: boolean;
  lastSyncAt: string | null;
}

interface UseOfflineSyncReturn extends OfflineSyncState {
  // Actions
  triggerSync: () => Promise<void>;
  queueMovementSession: (session: MovementSession) => Promise<void>;
  queueVideoUpload: (sessionId: string, videoBlob: Blob) => Promise<void>;
  queueCalibration: (calibration: CalibrationData) => Promise<void>;
  loadCalibration: () => Promise<CalibrationData | null>;
  getLocalSessions: () => Promise<MovementSession[]>;
  clearAll: () => Promise<void>;

  // Status helpers
  isSyncing: boolean;
  hasUnsyncedData: boolean;
  isOffline: boolean;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [state, setState] = useState<OfflineSyncState>(() => {
    const managerState = offlineSyncManager.getState();
    return {
      status: managerState.status,
      pendingCount: managerState.pendingCount,
      isOnline: managerState.isOnline,
      lastSyncAt: managerState.lastSyncAt,
    };
  });

  // Subscribe to sync events
  useEffect(() => {
    const handleSyncEvent = (event: SyncEvent) => {
      const newState = offlineSyncManager.getState();
      setState({
        status: newState.status,
        pendingCount: newState.pendingCount,
        isOnline: newState.isOnline,
        lastSyncAt: newState.lastSyncAt,
      });
    };

    const unsubscribe = offlineSyncManager.subscribe(handleSyncEvent);
    return unsubscribe;
  }, []);

  // Actions
  const triggerSync = useCallback(async () => {
    await offlineSyncManager.triggerSync();
  }, []);

  const queueMovementSession = useCallback(async (session: MovementSession) => {
    await offlineSyncManager.queueMovementSession(session);
  }, []);

  const queueVideoUpload = useCallback(async (sessionId: string, videoBlob: Blob) => {
    await offlineSyncManager.queueVideoUpload(sessionId, videoBlob);
  }, []);

  const queueCalibration = useCallback(async (calibration: CalibrationData) => {
    await offlineSyncManager.queueCalibration(calibration);
  }, []);

  const loadCalibration = useCallback(async () => {
    return offlineSyncManager.loadCalibration();
  }, []);

  const getLocalSessions = useCallback(async () => {
    return offlineSyncManager.getLocalSessions();
  }, []);

  const clearAll = useCallback(async () => {
    await offlineSyncManager.clearAll();
  }, []);

  return {
    ...state,
    triggerSync,
    queueMovementSession,
    queueVideoUpload,
    queueCalibration,
    loadCalibration,
    getLocalSessions,
    clearAll,
    isSyncing: state.status === 'syncing',
    hasUnsyncedData: state.pendingCount > 0,
    isOffline: !state.isOnline,
  };
}

/**
 * Hook for just checking online status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for storage usage information
 */
export function useStorageUsage() {
  const [usage, setUsage] = useState<{
    usage: number;
    quota: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const checkUsage = async () => {
      const estimate = await offlineSyncManager.getStorageUsage();
      setUsage(estimate);
    };

    checkUsage();

    // Check periodically
    const interval = setInterval(checkUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  return usage;
}

export default useOfflineSync;
