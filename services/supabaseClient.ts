
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be loaded from import.meta.env
// For this demo, we check if they exist, otherwise we return null which will trigger the LocalStorage fallback.

const supabaseUrl = process.env.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to get a persistent user ID for this device
export const getUserId = (): string => {
  let id = localStorage.getItem('rehabflow_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('rehabflow_user_id', id);
  }
  return id;
};
