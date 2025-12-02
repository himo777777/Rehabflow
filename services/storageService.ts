
import { GeneratedProgram, ProgressHistory, UserAssessment } from '../types';
import { supabase, getUserId } from './supabaseClient';

const STORAGE_KEY = 'rehabflow_current_program';
const ASSESSMENT_KEY = 'rehabflow_user_assessment';
const HISTORY_KEY = 'rehabflow_progress_history';

// Helper to check connectivity
const isOnline = () => navigator.onLine;

export const storageService = {
  
  // --- PROGRAM STORAGE ---

  saveProgram: async (program: GeneratedProgram, assessment?: UserAssessment): Promise<void> => {
    // 1. Always save locally for speed/offline
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
      if (assessment) localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(assessment));
    } catch (e) {
      console.warn('Local storage full or error', e);
    }

    // 2. Try to sync to Supabase
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        // Check if we have an existing record for this user to update
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
      } catch (err) {
        console.error('Supabase save error', err);
      }
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

        if (data && data.program_data) {
          // Update local cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.program_data));
          return data.program_data as GeneratedProgram;
        }
      } catch (err) {
        console.warn('Supabase fetch error, falling back to local', err);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearProgram: async (): Promise<void> => {
    // Clear all local data immediately
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ASSESSMENT_KEY);
    localStorage.removeItem(HISTORY_KEY);
    
    // Clear cloud data in background
    if (supabase && isOnline()) {
        try {
            const userId = getUserId();
            await supabase.from('programs').delete().eq('user_id', userId);
            await supabase.from('progress').delete().eq('user_id', userId);
        } catch (e) {
            console.error('Failed to clear cloud data', e);
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
    } catch (e) { /* ignore */ }

    // Sync from Supabase
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        const { data } = await supabase
          .from('progress')
          .select('date, exercises')
          .eq('user_id', userId);

        if (data && data.length > 0) {
          // Merge remote data into local structure
          const remoteHistory: ProgressHistory = {};
          data.forEach(row => {
            remoteHistory[row.date] = row.exercises;
          });
          
          // Combine (Remote takes precedence if newer, but simple merge here)
          const merged = { ...localHistory, ...remoteHistory };
          localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        console.warn('Supabase history fetch error', err);
      }
    }

    return localHistory;
  },

  saveDailyProgress: async (date: string, exercises: Record<string, boolean>): Promise<void> => {
    // 1. Local Save
    try {
        // Need to read entire history, update one day, save back
        // For local storage we store the whole object
        const data = localStorage.getItem(HISTORY_KEY);
        const history = data ? JSON.parse(data) : {};
        history[date] = exercises;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.warn('Local save error', e);
    }

    // 2. Supabase Save (Upsert specific day)
    if (supabase && isOnline()) {
      try {
        const userId = getUserId();
        await supabase
          .from('progress')
          .upsert({ 
            user_id: userId, 
            date: date, 
            exercises: exercises,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, date' });
      } catch (err) {
        console.error('Supabase progress save error', err);
      }
    }
  },

  // Sync assessment draft (usually just local is fine for draft)
  saveAssessmentDraft: (data: any) => {
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
  },

  getAssessmentDraft: () => {
    try {
      const data = localStorage.getItem(ASSESSMENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Synchronous fallback for components that strictly need sync return (though we should migrate them)
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
     } catch (e) { return {}; }
  }
};
