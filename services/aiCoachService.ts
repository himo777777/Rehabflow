/**
 * AI Coach Service - Sprint 5.9
 *
 * Provides personalized coaching and tips based on user progress.
 * Features:
 * - Daily personalized tips
 * - Adaptive exercise recommendations
 * - Pain pattern analysis
 * - Motivational messages
 * - Progress insights
 * - Recovery suggestions
 */

import { logger } from '../utils/logger';
import { storageService } from './storageService';

// ============================================================================
// TYPES
// ============================================================================

export interface CoachingTip {
  id: string;
  category: 'exercise' | 'recovery' | 'motivation' | 'technique' | 'lifestyle' | 'nutrition';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    label: string;
    route?: string;
    callback?: () => void;
  };
  dismissible: boolean;
  expiresAt?: string;
}

export interface ExerciseRecommendation {
  exerciseId: string;
  exerciseName: string;
  reason: string;
  priority: number;
  estimatedBenefit: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ProgressInsight {
  id: string;
  type: 'improvement' | 'concern' | 'milestone' | 'pattern';
  title: string;
  description: string;
  metric?: string;
  change?: number;
  period: 'daily' | 'weekly' | 'monthly';
  timestamp: string;
}

export interface UserContext {
  currentPhase: number;
  painLevel: number;
  streak: number;
  recentExercises: string[];
  adherenceRate: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  daysSinceStart: number;
  totalSessions: number;
  averageSessionDuration: number;
  painTrend: 'improving' | 'stable' | 'worsening';
  lastExerciseDate?: string;
}

export interface CoachConfig {
  enabled: boolean;
  tipsPerDay: number;
  preferredTime: number; // Hour of day (0-23)
  focusAreas: string[];
  motivationStyle: 'encouraging' | 'challenging' | 'balanced';
  showRecoveryTips: boolean;
  showNutritionTips: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: CoachConfig = {
  enabled: true,
  tipsPerDay: 3,
  preferredTime: 9, // 9 AM
  focusAreas: ['exercise', 'recovery', 'motivation'],
  motivationStyle: 'balanced',
  showRecoveryTips: true,
  showNutritionTips: false,
};

// Storage keys
const CONFIG_KEY = 'rehabflow-coach-config';
const TIPS_KEY = 'rehabflow-coach-tips';
const DISMISSED_KEY = 'rehabflow-coach-dismissed';

// ============================================================================
// TIP TEMPLATES
// ============================================================================

const TIP_TEMPLATES = {
  exercise: [
    {
      condition: (ctx: UserContext) => ctx.streak === 0,
      tip: {
        title: 'Dags att börja igen!',
        message: 'Du har inte tränat på ett tag. Även en kort session på 5 minuter gör skillnad för din återhämtning.',
        priority: 'high' as const,
        actionable: true,
        action: { label: 'Starta snabb session', route: '/exercises' },
      },
    },
    {
      condition: (ctx: UserContext) => ctx.streak >= 7,
      tip: {
        title: 'Fantastisk streak!',
        message: `${ctx => ctx.streak} dagar i rad! Du bygger verkligen goda vanor. Håll uppe tempot!`,
        priority: 'medium' as const,
        actionable: false,
      },
    },
    {
      condition: (ctx: UserContext) => ctx.timeOfDay === 'morning' && ctx.adherenceRate < 0.7,
      tip: {
        title: 'Morgonträning rekommenderas',
        message: 'Studier visar att morgonträning ökar följsamheten. Prova att träna direkt på morgonen!',
        priority: 'medium' as const,
        actionable: true,
        action: { label: 'Planera morgonrutin', route: '/settings' },
      },
    },
    {
      condition: (ctx: UserContext) => ctx.totalSessions < 5,
      tip: {
        title: 'Bra start!',
        message: 'Du har kommit igång med din träning. De första veckorna är viktiga för att bygga en rutin.',
        priority: 'medium' as const,
        actionable: false,
      },
    },
    {
      condition: (ctx: UserContext) => ctx.averageSessionDuration < 10,
      tip: {
        title: 'Öka sessionslängden gradvis',
        message: 'Dina sessioner är korta. Försök att lägga till en övning till varje gång.',
        priority: 'low' as const,
        actionable: true,
        action: { label: 'Se övningar', route: '/exercises' },
      },
    },
  ],

  recovery: [
    {
      condition: (ctx: UserContext) => ctx.streak >= 5,
      tip: {
        title: 'Överväg en vilodag',
        message: 'Du har tränat flera dagar i rad. Vila är viktigt för återhämtning och muskelbyggnad.',
        priority: 'medium' as const,
        actionable: false,
      },
    },
    {
      condition: (ctx: UserContext) => ctx.painLevel > 6,
      tip: {
        title: 'Hög smärtnivå',
        message: 'Din smärta verkar förhöjd. Ta det lugnare idag och fokusera på lätta stretchövningar.',
        priority: 'high' as const,
        actionable: true,
        action: { label: 'Visa lätta övningar', route: '/exercises?difficulty=easy' },
      },
    },
    {
      condition: (ctx: UserContext) => ctx.painTrend === 'worsening',
      tip: {
        title: 'Smärtan ökar',
        message: 'Din smärta har ökat den senaste tiden. Överväg att kontakta din vårdgivare.',
        priority: 'high' as const,
        actionable: false,
      },
    },
  ],

  motivation: [
    {
      condition: (ctx: UserContext) => ctx.painTrend === 'improving',
      tip: {
        title: 'Du gör framsteg!',
        message: 'Din smärta har minskat. Din träning ger resultat - fortsätt så!',
        priority: 'medium' as const,
        actionable: false,
      },
    },
    {
      condition: (ctx: UserContext) => ctx.daysSinceStart >= 30,
      tip: {
        title: 'En månad av framsteg!',
        message: 'Du har tränat i en hel månad. Det är en fantastisk prestation!',
        priority: 'medium' as const,
        actionable: true,
        action: { label: 'Se din progress', route: '/progress' },
      },
    },
    {
      condition: (ctx: UserContext) => ctx.adherenceRate >= 0.9,
      tip: {
        title: 'Fantastisk följsamhet!',
        message: 'Du har en följsamhet på över 90%. Du är ett föredöme!',
        priority: 'low' as const,
        actionable: false,
      },
    },
    {
      condition: () => true,
      tip: {
        title: 'Dagens påminnelse',
        message: 'Varje övning tar dig närmare ditt mål. Du har förmågan att bli bättre!',
        priority: 'low' as const,
        actionable: false,
      },
    },
  ],

  technique: [
    {
      condition: (ctx: UserContext) => ctx.currentPhase === 1,
      tip: {
        title: 'Fokus på teknik',
        message: 'I början är det viktigt att lära sig rätt teknik. Kvalitet före kvantitet!',
        priority: 'medium' as const,
        actionable: false,
      },
    },
    {
      condition: (ctx: UserContext) => ctx.totalSessions > 10,
      tip: {
        title: 'Dags att öka utmaningen?',
        message: 'Du har byggt en bra grund. Överväg att prova svårare varianter av övningarna.',
        priority: 'low' as const,
        actionable: true,
        action: { label: 'Se avancerade övningar', route: '/exercises?difficulty=hard' },
      },
    },
  ],

  lifestyle: [
    {
      condition: (ctx: UserContext) => ctx.timeOfDay === 'night',
      tip: {
        title: 'Sen träning',
        message: 'Träning sent på kvällen kan påverka sömnen. Försök träna tidigare på dagen om möjligt.',
        priority: 'low' as const,
        actionable: false,
      },
    },
    {
      condition: () => true,
      tip: {
        title: 'Hydrera dig',
        message: 'Glöm inte att dricka vatten! Hydrering är viktigt för muskelåterhämtning.',
        priority: 'low' as const,
        actionable: false,
      },
    },
  ],

  nutrition: [
    {
      condition: (ctx: UserContext) => ctx.timeOfDay === 'morning',
      tip: {
        title: 'Protein till frukost',
        message: 'Protein på morgonen hjälper muskelåterhämtning. Överväg ägg, yoghurt eller proteinshake.',
        priority: 'low' as const,
        actionable: false,
      },
    },
    {
      condition: () => true,
      tip: {
        title: 'Antiinflammatorisk kost',
        message: 'Mat som fisk, nötter och grönsaker kan hjälpa mot inflammation och smärta.',
        priority: 'low' as const,
        actionable: false,
      },
    },
  ],
};

// ============================================================================
// AI COACH SERVICE
// ============================================================================

class AICoachService {
  private config: CoachConfig = DEFAULT_CONFIG;
  private dismissedTips: Set<string> = new Set();
  private todaysTips: CoachingTip[] = [];

  constructor() {
    this.loadConfig();
    this.loadDismissedTips();
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[AICoach] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[AICoach] Failed to save config:', error);
    }
  }

  public getConfig(): CoachConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<CoachConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    logger.debug('[AICoach] Config updated:', updates);
  }

  private loadDismissedTips(): void {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        this.dismissedTips = new Set(JSON.parse(stored));
      }
    } catch (error) {
      logger.error('[AICoach] Failed to load dismissed tips:', error);
    }
  }

  private saveDismissedTips(): void {
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...this.dismissedTips]));
    } catch (error) {
      logger.error('[AICoach] Failed to save dismissed tips:', error);
    }
  }

  // --------------------------------------------------------------------------
  // USER CONTEXT
  // --------------------------------------------------------------------------

  /**
   * Build user context from stored data
   */
  private async getUserContext(): Promise<UserContext> {
    const progress = storageService.getProgress();
    const history = storageService.getHistorySync();
    const painHistory = storageService.getPainHistory?.() || [];

    // Calculate streak
    let streak = 0;
    const sortedDates = Object.keys(history).sort().reverse();
    for (const date of sortedDates) {
      const hasCompleted = Object.values(history[date]).some(v => v === true);
      if (hasCompleted) streak++;
      else break;
    }

    // Calculate adherence
    const last7Days = sortedDates.slice(0, 7);
    const activeDays = last7Days.filter(date =>
      Object.values(history[date]).some(v => v === true)
    ).length;
    const adherenceRate = last7Days.length > 0 ? activeDays / 7 : 0;

    // Calculate pain trend
    let painTrend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (painHistory.length >= 7) {
      const recent = painHistory.slice(-7);
      const older = painHistory.slice(-14, -7);

      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b.level, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b.level, 0) / older.length;

        if (recentAvg < olderAvg - 0.5) painTrend = 'improving';
        else if (recentAvg > olderAvg + 0.5) painTrend = 'worsening';
      }
    }

    // Time of day
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Recent exercises
    const recentExercises: string[] = [];
    for (const date of sortedDates.slice(0, 3)) {
      Object.entries(history[date]).forEach(([exercise, completed]) => {
        if (completed && !recentExercises.includes(exercise)) {
          recentExercises.push(exercise);
        }
      });
    }

    // Calculate days since start
    const startDate = sortedDates[sortedDates.length - 1];
    const daysSinceStart = startDate
      ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      currentPhase: progress.currentPhase || 1,
      painLevel: progress.averagePain || 5,
      streak,
      recentExercises,
      adherenceRate,
      timeOfDay,
      daysSinceStart,
      totalSessions: sortedDates.filter(d =>
        Object.values(history[d]).some(v => v === true)
      ).length,
      averageSessionDuration: 15, // Would need actual session data
      painTrend,
      lastExerciseDate: sortedDates[0],
    };
  }

  // --------------------------------------------------------------------------
  // TIP GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate personalized tips for today
   */
  public async generateDailyTips(): Promise<CoachingTip[]> {
    if (!this.config.enabled) {
      return [];
    }

    const context = await this.getUserContext();
    const tips: CoachingTip[] = [];

    // Go through each focus area
    for (const area of this.config.focusAreas) {
      const templates = TIP_TEMPLATES[area as keyof typeof TIP_TEMPLATES];
      if (!templates) continue;

      for (const template of templates) {
        if (tips.length >= this.config.tipsPerDay) break;

        if (template.condition(context)) {
          const tipId = `${area}_${template.tip.title}_${new Date().toDateString()}`;

          if (!this.dismissedTips.has(tipId)) {
            tips.push({
              id: tipId,
              category: area as CoachingTip['category'],
              ...template.tip,
              message: typeof template.tip.message === 'function'
                ? template.tip.message(context)
                : template.tip.message,
              dismissible: true,
            });
          }
        }
      }
    }

    // Sort by priority
    tips.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.todaysTips = tips.slice(0, this.config.tipsPerDay);
    this.saveTips();

    return this.todaysTips;
  }

  /**
   * Get today's tips
   */
  public async getTodaysTips(): Promise<CoachingTip[]> {
    if (this.todaysTips.length === 0) {
      await this.generateDailyTips();
    }
    return this.todaysTips;
  }

  private saveTips(): void {
    try {
      localStorage.setItem(TIPS_KEY, JSON.stringify({
        date: new Date().toDateString(),
        tips: this.todaysTips,
      }));
    } catch (error) {
      logger.error('[AICoach] Failed to save tips:', error);
    }
  }

  /**
   * Dismiss a tip
   */
  public dismissTip(tipId: string): void {
    this.dismissedTips.add(tipId);
    this.saveDismissedTips();
    this.todaysTips = this.todaysTips.filter(t => t.id !== tipId);
    this.saveTips();
    logger.debug('[AICoach] Tip dismissed:', tipId);
  }

  // --------------------------------------------------------------------------
  // EXERCISE RECOMMENDATIONS
  // --------------------------------------------------------------------------

  /**
   * Get personalized exercise recommendations
   */
  public async getExerciseRecommendations(): Promise<ExerciseRecommendation[]> {
    const context = await this.getUserContext();
    const recommendations: ExerciseRecommendation[] = [];

    // Based on pain level
    if (context.painLevel > 6) {
      recommendations.push({
        exerciseId: 'gentle_stretch',
        exerciseName: 'Försiktig stretch',
        reason: 'Din smärtnivå är hög. Lätta stretchövningar kan hjälpa.',
        priority: 1,
        estimatedBenefit: 'Smärtlindring',
        difficulty: 'easy',
      });
    }

    // Based on recent activity
    if (context.streak === 0 && context.lastExerciseDate) {
      recommendations.push({
        exerciseId: 'comeback_routine',
        exerciseName: 'Återstartsrutin',
        reason: 'Du har inte tränat på ett tag. Börja försiktigt!',
        priority: 2,
        estimatedBenefit: 'Bygga momentum',
        difficulty: 'easy',
      });
    }

    // Based on phase
    if (context.currentPhase >= 2) {
      recommendations.push({
        exerciseId: 'strength_progression',
        exerciseName: 'Styrketräning',
        reason: 'Du är redo för mer utmanande övningar.',
        priority: 3,
        estimatedBenefit: 'Ökad styrka',
        difficulty: 'medium',
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  // --------------------------------------------------------------------------
  // PROGRESS INSIGHTS
  // --------------------------------------------------------------------------

  /**
   * Generate progress insights
   */
  public async getProgressInsights(): Promise<ProgressInsight[]> {
    const context = await this.getUserContext();
    const insights: ProgressInsight[] = [];

    // Streak insight
    if (context.streak >= 7) {
      insights.push({
        id: 'streak_milestone',
        type: 'milestone',
        title: 'Streak-milstolpe!',
        description: `Du har tränat ${context.streak} dagar i rad!`,
        metric: 'streak',
        change: context.streak,
        period: 'weekly',
        timestamp: new Date().toISOString(),
      });
    }

    // Pain trend insight
    if (context.painTrend === 'improving') {
      insights.push({
        id: 'pain_improvement',
        type: 'improvement',
        title: 'Smärtan minskar',
        description: 'Din smärtnivå har minskat den senaste veckan.',
        metric: 'pain',
        period: 'weekly',
        timestamp: new Date().toISOString(),
      });
    } else if (context.painTrend === 'worsening') {
      insights.push({
        id: 'pain_concern',
        type: 'concern',
        title: 'Smärtan ökar',
        description: 'Din smärtnivå har ökat. Överväg att ta det lugnare.',
        metric: 'pain',
        period: 'weekly',
        timestamp: new Date().toISOString(),
      });
    }

    // Adherence insight
    if (context.adherenceRate >= 0.8) {
      insights.push({
        id: 'high_adherence',
        type: 'improvement',
        title: 'Utmärkt följsamhet',
        description: `Du har tränat ${Math.round(context.adherenceRate * 100)}% av dagarna.`,
        metric: 'adherence',
        change: context.adherenceRate * 100,
        period: 'weekly',
        timestamp: new Date().toISOString(),
      });
    }

    return insights;
  }

  // --------------------------------------------------------------------------
  // MOTIVATIONAL MESSAGES
  // --------------------------------------------------------------------------

  /**
   * Get a motivational message
   */
  public async getMotivationalMessage(): Promise<string> {
    const context = await this.getUserContext();

    const messages = {
      encouraging: [
        'Du gör ett fantastiskt jobb! Varje övning tar dig närmare ditt mål.',
        'Tro på dig själv - du har kommit så långt redan!',
        'Även små steg leder framåt. Fortsätt så!',
        'Din hälsa är värd varje ansträngning du gör.',
      ],
      challenging: [
        'Push yourself! Du kan mer än du tror.',
        'Utmaningar gör dig starkare. Ta nästa steg!',
        'Inga ursäkter idag - det är dags att träna!',
        'Champions tränar även när de inte känner för det.',
      ],
      balanced: [
        'En balans mellan vila och träning ger bäst resultat.',
        'Lyssna på din kropp, men ge inte upp för lätt.',
        'Dagens ansträngning är morgondagens framsteg.',
        'Du har förmågan att förändra din situation.',
      ],
    };

    const styleMessages = messages[this.config.motivationStyle];
    return styleMessages[Math.floor(Math.random() * styleMessages.length)];
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const aiCoachService = new AICoachService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useAICoach() {
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [t, r, i, m] = await Promise.all([
          aiCoachService.getTodaysTips(),
          aiCoachService.getExerciseRecommendations(),
          aiCoachService.getProgressInsights(),
          aiCoachService.getMotivationalMessage(),
        ]);

        setTips(t);
        setRecommendations(r);
        setInsights(i);
        setMotivationalMessage(m);
      } catch (error) {
        logger.error('[AICoach] Failed to load data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const dismissTip = useCallback((tipId: string) => {
    aiCoachService.dismissTip(tipId);
    setTips(tips => tips.filter(t => t.id !== tipId));
  }, []);

  const refreshTips = useCallback(async () => {
    const newTips = await aiCoachService.generateDailyTips();
    setTips(newTips);
  }, []);

  const refreshMessage = useCallback(async () => {
    const message = await aiCoachService.getMotivationalMessage();
    setMotivationalMessage(message);
  }, []);

  return {
    // State
    loading,
    tips,
    recommendations,
    insights,
    motivationalMessage,

    // Methods
    dismissTip,
    refreshTips,
    refreshMessage,

    // Config
    config: aiCoachService.getConfig(),
    updateConfig: aiCoachService.updateConfig.bind(aiCoachService),
  };
}

export default aiCoachService;
