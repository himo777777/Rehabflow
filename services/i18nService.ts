/**
 * Internationalization (i18n) Service - Sprint 5.10
 *
 * Provides multi-language support for the application.
 * Features:
 * - Multiple language support (Swedish, English)
 * - Dynamic translation loading
 * - Pluralization support
 * - Date/time formatting
 * - Number formatting
 * - RTL support preparation
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type Language = 'sv' | 'en';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface I18nConfig {
  language: Language;
  fallbackLanguage: Language;
  detectBrowserLanguage: boolean;
}

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
  relative?: boolean;
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations: Record<Language, TranslationDictionary> = {
  sv: {
    // Common
    common: {
      loading: 'Laddar...',
      error: 'Ett fel uppstod',
      retry: 'Försök igen',
      cancel: 'Avbryt',
      save: 'Spara',
      delete: 'Ta bort',
      edit: 'Redigera',
      close: 'Stäng',
      back: 'Tillbaka',
      next: 'Nästa',
      previous: 'Föregående',
      done: 'Klar',
      yes: 'Ja',
      no: 'Nej',
      ok: 'OK',
      confirm: 'Bekräfta',
      search: 'Sök',
      filter: 'Filtrera',
      sort: 'Sortera',
      all: 'Alla',
      none: 'Ingen',
      more: 'Mer',
      less: 'Mindre',
    },

    // Navigation
    nav: {
      home: 'Hem',
      exercises: 'Övningar',
      progress: 'Framsteg',
      settings: 'Inställningar',
      profile: 'Profil',
      help: 'Hjälp',
    },

    // Exercises
    exercises: {
      title: 'Övningar',
      start: 'Starta',
      pause: 'Pausa',
      resume: 'Fortsätt',
      stop: 'Stopp',
      complete: 'Avsluta',
      skip: 'Hoppa över',
      difficulty: {
        easy: 'Lätt',
        medium: 'Medel',
        hard: 'Svår',
      },
      bodyPart: {
        back: 'Rygg',
        neck: 'Nacke',
        shoulder: 'Axel',
        knee: 'Knä',
        hip: 'Höft',
        elbow: 'Armbåge',
        wrist: 'Handled',
        ankle: 'Fotled',
      },
      duration: '{minutes} min',
      reps: '{count} repetitioner',
      sets: '{count} set',
      restTime: 'Vila i {seconds} sekunder',
      goodForm: 'Bra form!',
      needsImprovement: 'Försök igen',
      sessionComplete: 'Session klar!',
      wellDone: 'Bra jobbat!',
    },

    // Progress
    progress: {
      title: 'Framsteg',
      streak: '{days} dagars streak',
      totalSessions: '{count} sessioner totalt',
      thisWeek: 'Denna vecka',
      thisMonth: 'Denna månad',
      allTime: 'All tid',
      painLevel: 'Smärtnivå',
      improvement: '{percent}% förbättring',
      noData: 'Ingen data ännu',
      keepGoing: 'Fortsätt träna för att se din progress!',
    },

    // Gamification
    gamification: {
      points: '{points} poäng',
      level: 'Nivå {level}',
      levelUp: 'Ny nivå!',
      achievement: 'Prestation upplåst!',
      streak: {
        title: 'Streak',
        days: '{days} dagar',
        keep: 'Behåll din streak!',
        lost: 'Du förlorade din streak',
        new: 'Ny streak startad!',
      },
      challenges: {
        title: 'Utmaningar',
        daily: 'Daglig utmaning',
        weekly: 'Veckans utmaning',
        special: 'Specialutmaning',
        completed: 'Klar!',
        progress: '{current}/{target}',
      },
      leaderboard: {
        title: 'Topplista',
        rank: 'Rank #{rank}',
        you: 'Du',
      },
    },

    // Settings
    settings: {
      title: 'Inställningar',
      language: 'Språk',
      theme: 'Tema',
      themes: {
        light: 'Ljust',
        dark: 'Mörkt',
        system: 'Följ systemet',
      },
      notifications: {
        title: 'Aviseringar',
        enable: 'Aktivera aviseringar',
        exerciseReminders: 'Träningspåminnelser',
        achievementAlerts: 'Prestationsmeddelanden',
        quietHours: 'Tysta timmar',
      },
      privacy: {
        title: 'Integritet',
        analytics: 'Dela anonymiserad statistik',
        publicProfile: 'Offentlig profil',
      },
      about: {
        title: 'Om',
        version: 'Version',
        support: 'Support',
        feedback: 'Ge feedback',
      },
    },

    // Pain tracking
    pain: {
      title: 'Smärta',
      level: 'Smärtnivå',
      noData: 'Ingen smärta',
      mild: 'Mild',
      moderate: 'Måttlig',
      severe: 'Svår',
      description: 'Beskriv din smärta',
      location: 'Var gör det ont?',
      record: 'Logga smärta',
      history: 'Smärthistorik',
    },

    // Calendar
    calendar: {
      title: 'Schema',
      today: 'Idag',
      tomorrow: 'Imorgon',
      thisWeek: 'Denna vecka',
      scheduled: 'Schemalagt',
      addEvent: 'Lägg till händelse',
      noEvents: 'Inga händelser',
    },

    // Voice
    voice: {
      listening: 'Lyssnar...',
      processing: 'Bearbetar...',
      commands: 'Röstkommandon',
      enable: 'Aktivera röstkommandon',
      wakeWord: 'Säg "{word}" för att aktivera',
    },

    // Biometric
    biometric: {
      heartRate: 'Puls',
      bpm: '{value} bpm',
      hrv: 'HRV',
      recovery: 'Återhämtning',
      connect: 'Anslut enhet',
      disconnect: 'Koppla från',
      searching: 'Söker...',
      connected: 'Ansluten',
      disconnected: 'Ej ansluten',
    },

    // Social
    social: {
      share: 'Dela',
      shareProgress: 'Dela dina framsteg',
      shareAchievement: 'Dela prestation',
      leaderboard: 'Topplista',
      challenges: 'Gemensamma utmaningar',
      friends: 'Vänner',
    },

    // Errors
    errors: {
      network: 'Nätverksfel. Kontrollera din anslutning.',
      server: 'Serverfel. Försök igen senare.',
      notFound: 'Kunde inte hittas',
      permission: 'Åtkomst nekad',
      camera: 'Kameraåtkomst krävs',
      microphone: 'Mikrofonåtkomst krävs',
    },

    // Time
    time: {
      now: 'Nu',
      justNow: 'Nyss',
      minutesAgo: '{minutes} min sedan',
      hoursAgo: '{hours} tim sedan',
      daysAgo: '{days} dagar sedan',
      yesterday: 'Igår',
    },
  },

  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      done: 'Done',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      none: 'None',
      more: 'More',
      less: 'Less',
    },

    // Navigation
    nav: {
      home: 'Home',
      exercises: 'Exercises',
      progress: 'Progress',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
    },

    // Exercises
    exercises: {
      title: 'Exercises',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      stop: 'Stop',
      complete: 'Complete',
      skip: 'Skip',
      difficulty: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
      },
      bodyPart: {
        back: 'Back',
        neck: 'Neck',
        shoulder: 'Shoulder',
        knee: 'Knee',
        hip: 'Hip',
        elbow: 'Elbow',
        wrist: 'Wrist',
        ankle: 'Ankle',
      },
      duration: '{minutes} min',
      reps: '{count} reps',
      sets: '{count} sets',
      restTime: 'Rest for {seconds} seconds',
      goodForm: 'Good form!',
      needsImprovement: 'Try again',
      sessionComplete: 'Session complete!',
      wellDone: 'Well done!',
    },

    // Progress
    progress: {
      title: 'Progress',
      streak: '{days} day streak',
      totalSessions: '{count} total sessions',
      thisWeek: 'This week',
      thisMonth: 'This month',
      allTime: 'All time',
      painLevel: 'Pain level',
      improvement: '{percent}% improvement',
      noData: 'No data yet',
      keepGoing: 'Keep exercising to see your progress!',
    },

    // Gamification
    gamification: {
      points: '{points} points',
      level: 'Level {level}',
      levelUp: 'Level up!',
      achievement: 'Achievement unlocked!',
      streak: {
        title: 'Streak',
        days: '{days} days',
        keep: 'Keep your streak!',
        lost: 'You lost your streak',
        new: 'New streak started!',
      },
      challenges: {
        title: 'Challenges',
        daily: 'Daily challenge',
        weekly: 'Weekly challenge',
        special: 'Special challenge',
        completed: 'Complete!',
        progress: '{current}/{target}',
      },
      leaderboard: {
        title: 'Leaderboard',
        rank: 'Rank #{rank}',
        you: 'You',
      },
    },

    // Settings
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      notifications: {
        title: 'Notifications',
        enable: 'Enable notifications',
        exerciseReminders: 'Exercise reminders',
        achievementAlerts: 'Achievement alerts',
        quietHours: 'Quiet hours',
      },
      privacy: {
        title: 'Privacy',
        analytics: 'Share anonymous statistics',
        publicProfile: 'Public profile',
      },
      about: {
        title: 'About',
        version: 'Version',
        support: 'Support',
        feedback: 'Give feedback',
      },
    },

    // Pain tracking
    pain: {
      title: 'Pain',
      level: 'Pain level',
      noData: 'No pain',
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      description: 'Describe your pain',
      location: 'Where does it hurt?',
      record: 'Log pain',
      history: 'Pain history',
    },

    // Calendar
    calendar: {
      title: 'Schedule',
      today: 'Today',
      tomorrow: 'Tomorrow',
      thisWeek: 'This week',
      scheduled: 'Scheduled',
      addEvent: 'Add event',
      noEvents: 'No events',
    },

    // Voice
    voice: {
      listening: 'Listening...',
      processing: 'Processing...',
      commands: 'Voice commands',
      enable: 'Enable voice commands',
      wakeWord: 'Say "{word}" to activate',
    },

    // Biometric
    biometric: {
      heartRate: 'Heart rate',
      bpm: '{value} bpm',
      hrv: 'HRV',
      recovery: 'Recovery',
      connect: 'Connect device',
      disconnect: 'Disconnect',
      searching: 'Searching...',
      connected: 'Connected',
      disconnected: 'Disconnected',
    },

    // Social
    social: {
      share: 'Share',
      shareProgress: 'Share your progress',
      shareAchievement: 'Share achievement',
      leaderboard: 'Leaderboard',
      challenges: 'Community challenges',
      friends: 'Friends',
    },

    // Errors
    errors: {
      network: 'Network error. Check your connection.',
      server: 'Server error. Try again later.',
      notFound: 'Not found',
      permission: 'Access denied',
      camera: 'Camera access required',
      microphone: 'Microphone access required',
    },

    // Time
    time: {
      now: 'Now',
      justNow: 'Just now',
      minutesAgo: '{minutes} min ago',
      hoursAgo: '{hours} hours ago',
      daysAgo: '{days} days ago',
      yesterday: 'Yesterday',
    },
  },
};

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: I18nConfig = {
  language: 'sv',
  fallbackLanguage: 'sv',
  detectBrowserLanguage: true,
};

// Storage key
const CONFIG_KEY = 'rehabflow-i18n-config';

// ============================================================================
// I18N SERVICE
// ============================================================================

class I18nService {
  private config: I18nConfig = DEFAULT_CONFIG;
  private currentTranslations: TranslationDictionary = translations.sv;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadConfig();
    this.detectLanguage();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[i18n] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[i18n] Failed to save config:', error);
    }
  }

  private detectLanguage(): void {
    if (this.config.detectBrowserLanguage) {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang] && !localStorage.getItem(CONFIG_KEY)) {
        this.config.language = browserLang;
      }
    }

    this.currentTranslations = translations[this.config.language] || translations[this.config.fallbackLanguage];
    logger.debug('[i18n] Language set to:', this.config.language);
  }

  // --------------------------------------------------------------------------
  // LANGUAGE MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Get current language
   */
  public getLanguage(): Language {
    return this.config.language;
  }

  /**
   * Set language
   */
  public setLanguage(language: Language): void {
    if (!translations[language]) {
      logger.warn('[i18n] Unknown language:', language);
      return;
    }

    this.config.language = language;
    this.currentTranslations = translations[language];
    this.saveConfig();

    // Update document lang attribute
    document.documentElement.lang = language;

    // Notify listeners
    this.notifyListeners();

    logger.info('[i18n] Language changed to:', language);
  }

  /**
   * Get available languages
   */
  public getAvailableLanguages(): Array<{ code: Language; name: string }> {
    return [
      { code: 'sv', name: 'Svenska' },
      { code: 'en', name: 'English' },
    ];
  }

  // --------------------------------------------------------------------------
  // TRANSLATION
  // --------------------------------------------------------------------------

  /**
   * Translate a key
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: string | TranslationDictionary = this.currentTranslations;

    for (const k of keys) {
      if (typeof value === 'object' && value[k] !== undefined) {
        value = value[k];
      } else {
        // Try fallback language
        value = this.getFromFallback(key);
        break;
      }
    }

    if (typeof value !== 'string') {
      logger.warn('[i18n] Translation not found:', key);
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        value = (value as string).replace(`{${param}}`, String(val));
      });
    }

    return value;
  }

  private getFromFallback(key: string): string {
    const keys = key.split('.');
    let value: string | TranslationDictionary = translations[this.config.fallbackLanguage];

    for (const k of keys) {
      if (typeof value === 'object' && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  // --------------------------------------------------------------------------
  // DATE FORMATTING
  // --------------------------------------------------------------------------

  /**
   * Format date
   */
  public formatDate(date: Date | string, options: DateFormatOptions = {}): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = this.config.language === 'sv' ? 'sv-SE' : 'en-US';

    if (options.relative) {
      return this.formatRelativeTime(d);
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: options.format || 'medium',
    };

    if (options.includeTime) {
      formatOptions.timeStyle = 'short';
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(d);
  }

  /**
   * Format relative time
   */
  public formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return this.t('time.justNow');
    } else if (diffMinutes < 60) {
      return this.t('time.minutesAgo', { minutes: diffMinutes });
    } else if (diffHours < 24) {
      return this.t('time.hoursAgo', { hours: diffHours });
    } else if (diffDays === 1) {
      return this.t('time.yesterday');
    } else if (diffDays < 7) {
      return this.t('time.daysAgo', { days: diffDays });
    } else {
      return this.formatDate(d, { format: 'short' });
    }
  }

  // --------------------------------------------------------------------------
  // NUMBER FORMATTING
  // --------------------------------------------------------------------------

  /**
   * Format number
   */
  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.config.language === 'sv' ? 'sv-SE' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(value);
  }

  /**
   * Format percentage
   */
  public formatPercent(value: number, decimals: number = 0): string {
    return this.formatNumber(value / 100, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * Format duration
   */
  public formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes} min`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // --------------------------------------------------------------------------
  // LISTENERS
  // --------------------------------------------------------------------------

  /**
   * Subscribe to language changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const i18nService = new I18nService();

// Short alias for translation function
export const t = i18nService.t.bind(i18nService);

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(i18nService.getLanguage());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = i18nService.subscribe(() => {
      setLanguageState(i18nService.getLanguage());
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    i18nService.setLanguage(lang);
  }, []);

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return i18nService.t(key, params);
  }, []);

  const formatDate = useCallback((date: Date | string, options?: DateFormatOptions) => {
    return i18nService.formatDate(date, options);
  }, []);

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
    return i18nService.formatNumber(value, options);
  }, []);

  const availableLanguages = useMemo(() => i18nService.getAvailableLanguages(), []);

  return {
    // State
    language,
    availableLanguages,

    // Methods
    setLanguage,
    t: translate,
    formatDate,
    formatNumber,
    formatPercent: i18nService.formatPercent.bind(i18nService),
    formatDuration: i18nService.formatDuration.bind(i18nService),
    formatRelativeTime: i18nService.formatRelativeTime.bind(i18nService),
  };
}

export default i18nService;
