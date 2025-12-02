import { GeneratedProgram, ProgressHistory, UserAssessment } from '../types';
import { supabase, getUserId } from './supabaseClient';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

// Storage keys
const STORAGE_KEY = STORAGE_KEYS.PROGRAM;
const ASSESSMENT_KEY = STORAGE_KEYS.ASSESSMENT;
const HISTORY_KEY = STORAGE_KEYS.HISTORY;
const SYNC_QUEUE_KEY = 'rehabflow_sync_queue';

// Types for sync queue
interface SyncOperation {
  id: string;
  type: 'program' | 'progress';
  data: unknown;
  timestamp: number;
  retries: number;
}

// Helper to check connectivity
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Sync queue management for offline support
const getSyncQueue = (): SyncOperation[] => {
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const addToSyncQueue = (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>) => {
  try {
    const queue = getSyncQueue();
    queue.push({
      ...operation,
      id: generateId(),
      timestamp: Date.now(),
      retries: 0
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    logger.debug('Added operation to sync queue', operation.type);
  } catch (e) {
    logger.warn('Failed to add to sync queue', e);
  }
};

const removeFromSyncQueue = (id: string) => {
  try {
    const queue = getSyncQueue().filter(op => op.id !== id);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    logger.warn('Failed to remove from sync queue', e);
  }
};

// Process pending sync operations when back online
const processSyncQueue = async () => {
  if (!supabase || !isOnline()) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  logger.info(`Processing ${queue.length} pending sync operations`);

  for (const operation of queue) {
    try {
      if (operation.type === 'program') {
        const { program, assessment } = operation.data as { program: GeneratedProgram; assessment?: UserAssessment };
        await syncProgramToCloud(program, assessment);
      } else if (operation.type === 'progress') {
        const { date, exercises } = operation.data as { date: string; exercises: Record<string, boolean> };
        await syncProgressToCloud(date, exercises);
      }
      removeFromSyncQueue(operation.id);
      logger.debug('Successfully synced operation', operation.id);
    } catch (e) {
      logger.error('Failed to sync operation', e);
      // Keep in queue for retry, but don't retry more than 3 times
      if (operation.retries >= 3) {
        removeFromSyncQueue(operation.id);
        logger.warn('Removed operation after 3 failed retries', operation.id);
      }
    }
  }
};

// Listen for online event to process queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    logger.info('Back online, processing sync queue');
    processSyncQueue();
  });
}

// Cloud sync helpers
const syncProgramToCloud = async (program: GeneratedProgram, assessment?: UserAssessment): Promise<void> => {
  if (!supabase) return;

  const userId = getUserId();
  const { data: existing } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase
      .from('programs')
      .update({
        program_data: program,
        assessment_data: assessment,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  } else {
    await supabase
      .from('programs')
      .insert({
        user_id: userId,
        program_data: program,
        assessment_data: assessment
      });
  }
};

const syncProgressToCloud = async (date: string, exercises: Record<string, boolean>): Promise<void> => {
  if (!supabase) return;

  const userId = getUserId();
  await supabase
    .from('progress')
    .upsert({
      user_id: userId,
      date: date,
      exercises: exercises,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, date' });
};

export const storageService = {

  // --- PROGRAM STORAGE ---

  saveProgram: async (program: GeneratedProgram, assessment?: UserAssessment): Promise<void> => {
    // 1. Always save locally for speed/offline
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
      if (assessment) localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(assessment));
      logger.debug('Program saved locally');
    } catch (e) {
      logger.error('Local storage error', e);
      throw new Error('Kunde inte spara programmet lokalt. Lagringsutrymmet kan vara fullt.');
    }

    // 2. Try to sync to Supabase
    if (supabase && isOnline()) {
      try {
        await syncProgramToCloud(program, assessment);
        logger.debug('Program synced to cloud');
      } catch (err) {
        logger.warn('Cloud sync failed, queuing for later', err);
        addToSyncQueue({ type: 'program', data: { program, assessment } });
      }
    } else if (supabase) {
      // Offline - add to sync queue
      addToSyncQueue({ type: 'program', data: { program, assessment } });
    }
  },

  getProgram: async (): Promise<GeneratedProgram | null> => {
    // 1. Try Supabase first for the source of truth
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        const { data, error } = await supabase
          .from('programs')
          .select('program_data')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine
          logger.warn('Supabase fetch error', error);
        }

        if (data && data.program_data) {
          // Update local cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.program_data));
          logger.debug('Program loaded from cloud');
          return data.program_data as GeneratedProgram;
        }
      } catch (err) {
        logger.warn('Supabase fetch error, falling back to local', err);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        logger.debug('Program loaded from local storage');
        return JSON.parse(data);
      }
      return null;
    } catch (e) {
      logger.error('Failed to parse local program data', e);
      return null;
    }
  },

  clearProgram: async (): Promise<void> => {
    logger.info('Clearing all program data');

    // Clear all local data immediately
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ASSESSMENT_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(SYNC_QUEUE_KEY);

    // Clear cloud data in background
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        await supabase.from('programs').delete().eq('user_id', userId);
        await supabase.from('progress').delete().eq('user_id', userId);
        logger.debug('Cloud data cleared');
      } catch (e) {
        logger.error('Failed to clear cloud data', e);
      }
    }
  },

  // --- PROGRESS HISTORY ---

  getHistory: async (): Promise<ProgressHistory> => {
    let localHistory: ProgressHistory = {};

    // Get local
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) localHistory = JSON.parse(data);
    } catch (e) {
      logger.warn('Failed to parse local history', e);
    }

    // Sync from Supabase
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        const { data, error } = await supabase
          .from('progress')
          .select('date, exercises')
          .eq('user_id', userId);

        if (error) {
          logger.warn('Supabase history fetch error', error);
        }

        if (data && data.length > 0) {
          // Merge remote data into local structure
          const remoteHistory: ProgressHistory = {};
          data.forEach(row => {
            remoteHistory[row.date] = row.exercises;
          });

          // Combine (Remote takes precedence)
          const merged = { ...localHistory, ...remoteHistory };
          localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
          logger.debug('History synced from cloud');
          return merged;
        }
      } catch (err) {
        logger.warn('Supabase history fetch error', err);
      }
    }

    return localHistory;
  },

  saveDailyProgress: async (date: string, exercises: Record<string, boolean>): Promise<void> => {
    // 1. Local Save
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      const history = data ? JSON.parse(data) : {};
      history[date] = exercises;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      logger.debug('Progress saved locally', { date });
    } catch (e) {
      logger.error('Local progress save error', e);
    }

    // 2. Supabase Save (Upsert specific day)
    if (supabase && isOnline()) {
      try {
        await syncProgressToCloud(date, exercises);
        logger.debug('Progress synced to cloud', { date });
      } catch (err) {
        logger.warn('Cloud progress sync failed, queuing', err);
        addToSyncQueue({ type: 'progress', data: { date, exercises } });
      }
    } else if (supabase) {
      // Offline - add to sync queue
      addToSyncQueue({ type: 'progress', data: { date, exercises } });
    }
  },

  // Sync assessment draft (usually just local is fine for draft)
  saveAssessmentDraft: (data: unknown): void => {
    try {
      localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
      logger.debug('Assessment draft saved');
    } catch (e) {
      logger.warn('Failed to save assessment draft', e);
    }
  },

  getAssessmentDraft: (): UserAssessment | null => {
    try {
      const data = localStorage.getItem(ASSESSMENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      logger.warn('Failed to load assessment draft', e);
      return null;
    }
  },

  // Synchronous fallback for components that strictly need sync return
  getHistorySync: (): ProgressHistory => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  getDailyProgressSync: (date: string): Record<string, boolean> => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      const history = data ? JSON.parse(data) : {};
      return history[date] || {};
    } catch (e) {
      return {};
    }
  },

  // Get pending sync count (for UI indicator)
  getPendingSyncCount: (): number => {
    return getSyncQueue().length;
  },

  // Force sync (for manual retry button)
  forceSync: async (): Promise<void> => {
    await processSyncQueue();
  }
};
