// Application constants and configuration

export const APP_NAME = 'RehabFlow';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  USER_ID: 'rehabflow_user_id',
  PROGRAM: 'rehabflow_program',
  ASSESSMENT: 'rehabflow_assessment',
  HISTORY: 'rehabflow_history',
  IS_PREMIUM: 'rehabflow_is_premium',
  THEME: 'rehabflow_theme'
} as const;

// API Configuration
export const API_CONFIG = {
  GEMINI_MODEL: 'gemini-2.5-flash-preview-05-20',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  TIMEOUT_MS: 30000
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION_MS: 5000,
  ANIMATION_DURATION_MS: 300,
  DEBOUNCE_MS: 300,
  MAX_CHAT_HISTORY: 50
} as const;

// Pain levels
export const PAIN_LEVELS = {
  NONE: 0,
  MILD: 3,
  MODERATE: 5,
  SEVERE: 7,
  EXTREME: 10
} as const;

// Exercise categories with Swedish labels
export const EXERCISE_CATEGORIES = {
  mobility: 'Rörlighet',
  strength: 'Styrka',
  balance: 'Balans',
  endurance: 'Uthållighet'
} as const;

// Exercise difficulties with Swedish labels
export const EXERCISE_DIFFICULTIES = {
  easy: 'Lätt',
  medium: 'Medel',
  hard: 'Svår'
} as const;

// Coach levels for gamification
export const COACH_LEVELS = [
  { threshold: 0, name: 'Nykomling', stars: 1, next: 3 },
  { threshold: 3, name: 'Igång', stars: 2, next: 7 },
  { threshold: 7, name: 'Atlet', stars: 3, next: 14 },
  { threshold: 14, name: 'Expert', stars: 4, next: 30 },
  { threshold: 30, name: 'Mästare', stars: 5, next: 100 }
] as const;

// Feature flags
export const FEATURES = {
  AI_MOVEMENT_COACH: true,
  WEEKLY_ANALYSIS: true,
  EXERCISE_SWAP: true,
  PREMIUM_FEATURES: true
} as const;

// External URLs
export const EXTERNAL_URLS = {
  SUPPORT: 'https://github.com/himo777777/Rehabflow/issues',
  PRIVACY_POLICY: '/privacy',
  TERMS_OF_SERVICE: '/terms'
} as const;
