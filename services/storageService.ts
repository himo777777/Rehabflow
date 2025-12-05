import {
  GeneratedProgram,
  ProgressHistory,
  UserAssessment,
  DailyPainLog,
  PainHistory,
  ExerciseLog,
  DetailedExerciseHistory,
  Milestone,
  UserMilestones,
  WorkoutCheckIn,
  MovementSession,
  QualityTrend,
  CalibrationData
} from '../types';
import { supabase, getUserId } from './supabaseClient';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

// Storage keys
const STORAGE_KEY = STORAGE_KEYS.PROGRAM;
const ASSESSMENT_KEY = STORAGE_KEYS.ASSESSMENT;
const HISTORY_KEY = STORAGE_KEYS.HISTORY;
const SYNC_QUEUE_KEY = 'rehabflow_sync_queue';
const PAIN_LOG_KEY = 'rehabflow_pain_logs';
const EXERCISE_LOG_KEY = 'rehabflow_exercise_logs';
const MILESTONES_KEY = 'rehabflow_milestones';
const MOVEMENT_SESSIONS_KEY = 'rehabflow_movement_sessions';
const CALIBRATION_KEY = 'rehabflow_calibration';

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

// Update retry count for an operation in the queue
const incrementRetryCount = (id: string) => {
  try {
    const queue = getSyncQueue();
    const index = queue.findIndex(op => op.id === id);
    if (index >= 0) {
      queue[index].retries = (queue[index].retries || 0) + 1;
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (e) {
    logger.warn('Failed to increment retry count', e);
  }
};

// Calculate exponential backoff delay
const getBackoffDelay = (retries: number): number => {
  // Base delay of 1 second, doubles each retry, max 30 seconds
  const baseDelay = 1000;
  const delay = Math.min(baseDelay * Math.pow(2, retries), 30000);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

// Process pending sync operations when back online
const processSyncQueue = async () => {
  if (!supabase || !isOnline()) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  logger.info(`Processing ${queue.length} pending sync operations`);

  for (const operation of queue) {
    // Apply exponential backoff based on retry count
    const retries = operation.retries || 0;
    if (retries > 0) {
      const delay = getBackoffDelay(retries);
      logger.debug(`Waiting ${Math.round(delay)}ms before retry ${retries + 1} for operation`, operation.id);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

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
      // Increment retry counter
      incrementRetryCount(operation.id);
      // Keep in queue for retry, but don't retry more than 5 times with backoff
      if (retries + 1 >= 5) {
        removeFromSyncQueue(operation.id);
        logger.warn('Removed operation after 5 failed retries', operation.id);
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
  },

  // ============================================
  // FAS 6: SMÄRTLOGG-FUNKTIONER
  // ============================================

  /**
   * Get all pain logs
   */
  getPainHistory: (): PainHistory => {
    try {
      const data = localStorage.getItem(PAIN_LOG_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      logger.warn('Failed to get pain history', e);
      return {};
    }
  },

  /**
   * Get pain log for a specific date
   */
  getPainLogForDate: (date: string): DailyPainLog | null => {
    try {
      const history = storageService.getPainHistory();
      return history[date] || null;
    } catch (e) {
      logger.warn('Failed to get pain log for date', e);
      return null;
    }
  },

  /**
   * Save pre-workout check-in
   */
  savePreWorkoutCheckIn: async (date: string, checkIn: WorkoutCheckIn): Promise<void> => {
    try {
      const history = storageService.getPainHistory();
      const existingLog = history[date] || { date };

      history[date] = {
        ...existingLog,
        preWorkout: { ...checkIn, type: 'pre', timestamp: new Date().toISOString() }
      };

      localStorage.setItem(PAIN_LOG_KEY, JSON.stringify(history));
      logger.debug('Pre-workout check-in saved', { date });

      // Sync to cloud
      if (supabase && isOnline()) {
        try {
          const userId = getUserId();
          await supabase.from('pain_logs').upsert({
            user_id: userId,
            date: date,
            log_data: history[date],
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, date' });
        } catch (err) {
          logger.warn('Cloud pain log sync failed', err);
        }
      }
    } catch (e) {
      logger.error('Failed to save pre-workout check-in', e);
    }
  },

  /**
   * Save post-workout check-in
   */
  savePostWorkoutCheckIn: async (date: string, checkIn: WorkoutCheckIn): Promise<void> => {
    try {
      const history = storageService.getPainHistory();
      const existingLog = history[date] || { date };

      history[date] = {
        ...existingLog,
        postWorkout: { ...checkIn, type: 'post', timestamp: new Date().toISOString() }
      };

      localStorage.setItem(PAIN_LOG_KEY, JSON.stringify(history));
      logger.debug('Post-workout check-in saved', { date });

      // Sync to cloud
      if (supabase && isOnline()) {
        try {
          const userId = getUserId();
          await supabase.from('pain_logs').upsert({
            user_id: userId,
            date: date,
            log_data: history[date],
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, date' });
        } catch (err) {
          logger.warn('Cloud pain log sync failed', err);
        }
      }
    } catch (e) {
      logger.error('Failed to save post-workout check-in', e);
    }
  },

  /**
   * Check if pre-workout check-in exists for today
   */
  hasPreWorkoutCheckIn: (date: string): boolean => {
    const log = storageService.getPainLogForDate(date);
    return !!log?.preWorkout;
  },

  /**
   * Check if post-workout check-in exists for today
   */
  hasPostWorkoutCheckIn: (date: string): boolean => {
    const log = storageService.getPainLogForDate(date);
    return !!log?.postWorkout;
  },

  /**
   * Get pain trend data for charts (last N days)
   */
  getPainTrend: (days: number = 30): { date: string; prePain?: number; postPain?: number; avgPain: number }[] => {
    const history = storageService.getPainHistory();
    const result: { date: string; prePain?: number; postPain?: number; avgPain: number }[] = [];

    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const log = history[dateStr];
      if (log) {
        const prePain = log.preWorkout?.painLevel;
        const postPain = log.postWorkout?.painLevel;
        const avgPain = prePain !== undefined && postPain !== undefined
          ? (prePain + postPain) / 2
          : prePain ?? postPain ?? 0;

        result.push({ date: dateStr, prePain, postPain, avgPain });
      } else {
        result.push({ date: dateStr, avgPain: 0 });
      }
    }

    return result;
  },

  // ============================================
  // FAS 6: DETALJERAD ÖVNINGSLOGG
  // ============================================

  /**
   * Get all detailed exercise logs
   */
  getDetailedExerciseHistory: (): DetailedExerciseHistory => {
    try {
      const data = localStorage.getItem(EXERCISE_LOG_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      logger.warn('Failed to get exercise history', e);
      return {};
    }
  },

  /**
   * Save detailed exercise log
   * Uses exerciseId (exerciseName + timestamp) as unique key to allow multiple sessions
   */
  saveExerciseLog: async (log: ExerciseLog): Promise<void> => {
    try {
      const history = storageService.getDetailedExerciseHistory();
      const dateKey = log.date;

      if (!history[dateKey]) {
        history[dateKey] = [];
      }

      // Use exerciseId for duplicate check to allow multiple sessions of same exercise
      // exerciseId should be unique per session (e.g. "Knäböj_1701234567890")
      const existingIndex = history[dateKey].findIndex(
        l => l.exerciseId === log.exerciseId
      );

      if (existingIndex >= 0) {
        // Update existing entry with same ID
        history[dateKey][existingIndex] = log;
      } else {
        // Add new entry
        history[dateKey].push(log);
      }

      localStorage.setItem(EXERCISE_LOG_KEY, JSON.stringify(history));
      logger.debug('Exercise log saved', { exerciseId: log.exerciseId, exercise: log.exerciseName, date: log.date });

      // Sync to cloud - use exercise_id for uniqueness
      if (supabase && isOnline()) {
        try {
          const userId = getUserId();
          await supabase.from('exercise_logs').upsert({
            user_id: userId,
            exercise_id: log.exerciseId, // Unique per session
            date: log.date,
            exercise_name: log.exerciseName,
            log_data: log,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, exercise_id' }); // Changed to use exercise_id
        } catch (err) {
          logger.warn('Cloud exercise log sync failed', err);
        }
      }
    } catch (e) {
      logger.error('Failed to save exercise log', e);
    }
  },

  /**
   * Get exercise logs for a specific date
   */
  getExerciseLogsForDate: (date: string): ExerciseLog[] => {
    const history = storageService.getDetailedExerciseHistory();
    return history[date] || [];
  },

  // ============================================
  // FAS 6: MILSTOLPAR & ACHIEVEMENTS
  // ============================================

  /**
   * Get all milestones
   */
  getMilestones: (): UserMilestones => {
    try {
      const data = localStorage.getItem(MILESTONES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      logger.warn('Failed to get milestones', e);
      return [];
    }
  },

  /**
   * Add a new milestone
   */
  addMilestone: async (milestone: Milestone): Promise<void> => {
    try {
      const milestones = storageService.getMilestones();

      // Check if already achieved
      if (milestones.some(m => m.type === milestone.type)) {
        logger.debug('Milestone already achieved', milestone.type);
        return;
      }

      milestones.push(milestone);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
      logger.info('New milestone achieved!', milestone.title);

      // Sync to cloud
      if (supabase && isOnline()) {
        try {
          const userId = getUserId();
          await supabase.from('milestones').insert({
            user_id: userId,
            milestone_type: milestone.type,
            milestone_data: milestone,
            achieved_at: milestone.achievedAt
          });
        } catch (err) {
          logger.warn('Cloud milestone sync failed', err);
        }
      }
    } catch (e) {
      logger.error('Failed to add milestone', e);
    }
  },

  /**
   * Mark milestone as celebrated (user has seen it)
   */
  markMilestoneCelebrated: (milestoneId: string): void => {
    try {
      const milestones = storageService.getMilestones();
      const index = milestones.findIndex(m => m.id === milestoneId);

      if (index >= 0) {
        milestones[index].celebrated = true;
        localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
      }
    } catch (e) {
      logger.warn('Failed to mark milestone celebrated', e);
    }
  },

  /**
   * Get uncelebrated milestones (for showing celebration modal)
   */
  getUncelebratedMilestones: (): UserMilestones => {
    return storageService.getMilestones().filter(m => !m.celebrated);
  },

  /**
   * Check and award milestones based on current progress
   * Optimized: Uses Set for O(1) lookup instead of O(n) array.some()
   */
  checkAndAwardMilestones: async (): Promise<Milestone[]> => {
    const newMilestones: Milestone[] = [];
    const existingMilestones = storageService.getMilestones();
    // Create Set for O(1) lookup - optimization from O(n²) to O(n)
    const existingTypes = new Set(existingMilestones.map(m => m.type));
    const history = storageService.getHistorySync();
    const painHistory = storageService.getPainHistory();

    // Calculate streak
    const dates = Object.keys(history).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const date of dates) {
      const dayHistory = history[date];
      const hasCompletedExercise = Object.values(dayHistory).some(v => v === true);

      if (hasCompletedExercise) {
        streak++;
      } else if (date !== today) {
        break;
      }
    }

    // Streak milestones
    const streakMilestones: { threshold: number; type: 'streak_3' | 'streak_7' | 'streak_14' | 'streak_30'; title: string; icon: string }[] = [
      { threshold: 3, type: 'streak_3', title: '3 Dagar i Rad!', icon: '🔥' },
      { threshold: 7, type: 'streak_7', title: 'En Vecka!', icon: '⭐' },
      { threshold: 14, type: 'streak_14', title: 'Två Veckor!', icon: '🏆' },
      { threshold: 30, type: 'streak_30', title: 'En Månad!', icon: '👑' }
    ];

    for (const sm of streakMilestones) {
      if (streak >= sm.threshold && !existingTypes.has(sm.type)) {
        const milestone: Milestone = {
          id: `${sm.type}-${Date.now()}`,
          type: sm.type,
          achievedAt: new Date().toISOString(),
          title: sm.title,
          description: `Du har tränat ${sm.threshold} dagar i rad!`,
          icon: sm.icon,
          celebrated: false
        };
        await storageService.addMilestone(milestone);
        newMilestones.push(milestone);
      }
    }

    // First workout milestone
    const totalWorkouts = Object.keys(history).length;
    if (totalWorkouts >= 1 && !existingTypes.has('first_workout')) {
      const milestone: Milestone = {
        id: `first_workout-${Date.now()}`,
        type: 'first_workout',
        achievedAt: new Date().toISOString(),
        title: 'Första Träningen!',
        description: 'Du har påbörjat din rehabiliteringsresa!',
        icon: '🎉',
        celebrated: false
      };
      await storageService.addMilestone(milestone);
      newMilestones.push(milestone);
    }

    // Pain reduction milestones
    const painDates = Object.keys(painHistory).sort();
    if (painDates.length >= 7) {
      const firstWeekPain = painHistory[painDates[0]]?.preWorkout?.painLevel ?? 0;
      const latestPain = painHistory[painDates[painDates.length - 1]]?.preWorkout?.painLevel ?? 0;

      if (firstWeekPain > 0) {
        const reduction = ((firstWeekPain - latestPain) / firstWeekPain) * 100;

        if (reduction >= 25 && !existingTypes.has('pain_reduction_25')) {
          const milestone: Milestone = {
            id: `pain_reduction_25-${Date.now()}`,
            type: 'pain_reduction_25',
            achievedAt: new Date().toISOString(),
            title: '25% Mindre Smärta!',
            description: 'Din smärta har minskat med 25%!',
            icon: '📉',
            celebrated: false
          };
          await storageService.addMilestone(milestone);
          newMilestones.push(milestone);
        }

        if (reduction >= 50 && !existingTypes.has('pain_reduction_50')) {
          const milestone: Milestone = {
            id: `pain_reduction_50-${Date.now()}`,
            type: 'pain_reduction_50',
            achievedAt: new Date().toISOString(),
            title: '50% Mindre Smärta!',
            description: 'Fantastiskt! Din smärta har halverats!',
            icon: '🌟',
            celebrated: false
          };
          await storageService.addMilestone(milestone);
          newMilestones.push(milestone);
        }
      }
    }

    // Week complete milestone - 7 unique days with workouts
    const uniqueWorkoutDays = Object.keys(history).filter(date => {
      const dayHistory = history[date];
      return Object.values(dayHistory).some(v => v === true);
    });

    if (uniqueWorkoutDays.length >= 7 && !existingTypes.has('week_complete')) {
      const milestone: Milestone = {
        id: `week_complete-${Date.now()}`,
        type: 'week_complete',
        achievedAt: new Date().toISOString(),
        title: 'Första Veckan Avklarad!',
        description: 'Du har tränat minst 7 dagar totalt!',
        icon: '📅',
        celebrated: false
      };
      await storageService.addMilestone(milestone);
      newMilestones.push(milestone);
    }

    // Month complete milestone - 30 unique days with workouts
    if (uniqueWorkoutDays.length >= 30 && !existingTypes.has('month_complete')) {
      const milestone: Milestone = {
        id: `month_complete-${Date.now()}`,
        type: 'month_complete',
        achievedAt: new Date().toISOString(),
        title: 'Första Månaden Avklarad!',
        description: 'Du har tränat minst 30 dagar totalt - otroligt!',
        icon: '🗓️',
        celebrated: false
      };
      await storageService.addMilestone(milestone);
      newMilestones.push(milestone);
    }

    // Phase complete milestone - check if user has progressed to a new phase
    // This requires checking the program phases data
    const program = await storageService.getProgram();
    if (program && program.phases && !existingTypes.has('phase_complete')) {
      // Check if there are multiple phases, indicating progression capability
      const hasMultiplePhases = program.phases.length >= 2;

      // Award if user has at least 30 days of progress (indicating phase completion)
      if (hasMultiplePhases && uniqueWorkoutDays.length >= 30) {
        const milestone: Milestone = {
          id: `phase_complete-${Date.now()}`,
          type: 'phase_complete',
          achievedAt: new Date().toISOString(),
          title: 'Fas Avklarad!',
          description: 'Du har framgångsrikt avslutat en rehabiliteringsfas!',
          icon: '🎯',
          celebrated: false
        };
        await storageService.addMilestone(milestone);
        newMilestones.push(milestone);
      }
    }

    return newMilestones;
  },

  // ============================================
  // RÖRELSEANALYS: MOVEMENT SESSIONS
  // ============================================

  /**
   * Save a movement session (after exercise completion)
   */
  saveMovementSession: async (session: MovementSession): Promise<void> => {
    try {
      // Generate ID if not present
      if (!session.id) {
        session.id = generateId();
      }

      // Get existing sessions
      const sessions = storageService.getMovementSessions();

      // Add new session
      sessions.push(session);

      // Keep only last 100 sessions to prevent storage overflow
      const trimmedSessions = sessions.slice(-100);

      localStorage.setItem(MOVEMENT_SESSIONS_KEY, JSON.stringify(trimmedSessions));
      logger.info('Movement session saved', { exerciseName: session.exerciseName, reps: session.repsCompleted });

      // Sync to cloud
      if (supabase && isOnline()) {
        try {
          const userId = getUserId();
          await supabase.from('movement_sessions').insert({
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
            video_url: session.videoUrl || null
          });
          logger.debug('Movement session synced to cloud');
        } catch (err) {
          logger.warn('Cloud movement session sync failed', err);
        }
      }
    } catch (e) {
      logger.error('Failed to save movement session', e);
    }
  },

  /**
   * Get all movement sessions
   */
  getMovementSessions: (): MovementSession[] => {
    try {
      const data = localStorage.getItem(MOVEMENT_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      logger.warn('Failed to get movement sessions', e);
      return [];
    }
  },

  /**
   * Get movement history for a specific exercise
   */
  getMovementHistory: async (exerciseName?: string): Promise<MovementSession[]> => {
    let sessions = storageService.getMovementSessions();

    // Try to fetch from Supabase for more complete history
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        let query = supabase
          .from('movement_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('session_date', { ascending: false })
          .limit(50);

        if (exerciseName) {
          query = query.ilike('exercise_name', `%${exerciseName}%`);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          // Convert to MovementSession format
          const remoteSessions: MovementSession[] = data.map(row => ({
            id: row.id,
            exerciseName: row.exercise_name,
            sessionDate: row.session_date,
            duration: row.duration,
            repsCompleted: row.reps_completed,
            averageScore: row.average_score,
            romAchieved: row.rom_achieved,
            formIssues: row.form_issues || [],
            repScores: row.rep_scores || [],
            videoUrl: row.video_url
          }));

          // Merge with local sessions (deduplicate by id)
          const mergedIds = new Set(remoteSessions.map(s => s.id));
          const localOnly = sessions.filter(s => !mergedIds.has(s.id));
          sessions = [...remoteSessions, ...localOnly];
        }
      } catch (err) {
        logger.warn('Failed to fetch remote movement sessions', err);
      }
    }

    // Filter by exercise name if provided
    if (exerciseName) {
      sessions = sessions.filter(s =>
        s.exerciseName.toLowerCase().includes(exerciseName.toLowerCase())
      );
    }

    // Sort by date descending
    return sessions.sort((a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );
  },

  /**
   * Get quality trend for an exercise over time
   */
  getQualityTrend: async (exerciseName: string, weeks: number = 4): Promise<QualityTrend> => {
    const sessions = await storageService.getMovementHistory(exerciseName);

    // Filter to requested time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

    const filteredSessions = sessions.filter(s =>
      new Date(s.sessionDate) >= cutoffDate
    );

    // Group by date
    const byDate = new Map<string, { scores: number[]; reps: number }>();

    for (const session of filteredSessions) {
      const dateKey = session.sessionDate.split('T')[0];
      const existing = byDate.get(dateKey) || { scores: [], reps: 0 };
      existing.scores.push(session.averageScore);
      existing.reps += session.repsCompleted;
      byDate.set(dateKey, existing);
    }

    // Convert to data points
    const dataPoints = Array.from(byDate.entries())
      .map(([date, data]) => ({
        date,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        reps: data.reps
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate improvement (first vs last)
    let improvement = 0;
    if (dataPoints.length >= 2) {
      const first = dataPoints[0].averageScore;
      const last = dataPoints[dataPoints.length - 1].averageScore;
      improvement = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    }

    return {
      exerciseName,
      dataPoints,
      improvement,
      period: weeks <= 1 ? 'week' : weeks <= 4 ? 'month' : 'all'
    };
  },

  /**
   * Get recent movement sessions (for dashboard)
   */
  getRecentMovementSessions: async (limit: number = 5): Promise<MovementSession[]> => {
    const sessions = await storageService.getMovementHistory();
    return sessions.slice(0, limit);
  },

  // ============================================
  // KALIBRERINGSDATA
  // ============================================

  /**
   * Save calibration data for a user
   */
  saveCalibration: async (calibration: CalibrationData): Promise<void> => {
    try {
      localStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibration));
      logger.debug('Calibration data saved locally');

      // Sync to cloud
      if (supabase && isOnline()) {
        try {
          const userId = getUserId();
          await supabase.from('user_calibrations').upsert({
            user_id: userId,
            calibration_data: calibration,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          logger.debug('Calibration synced to cloud');
        } catch (err) {
          logger.warn('Cloud calibration sync failed', err);
        }
      }
    } catch (e) {
      logger.error('Failed to save calibration', e);
    }
  },

  /**
   * Load calibration data
   */
  loadCalibration: async (): Promise<CalibrationData | null> => {
    // Try cloud first
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        const { data, error } = await supabase
          .from('user_calibrations')
          .select('calibration_data')
          .eq('user_id', userId)
          .single();

        if (!error && data?.calibration_data) {
          // Update local cache
          localStorage.setItem(CALIBRATION_KEY, JSON.stringify(data.calibration_data));
          return data.calibration_data as CalibrationData;
        }
      } catch (err) {
        logger.warn('Failed to load calibration from cloud', err);
      }
    }

    // Fallback to local
    try {
      const data = localStorage.getItem(CALIBRATION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      logger.warn('Failed to load local calibration', e);
      return null;
    }
  }
};
