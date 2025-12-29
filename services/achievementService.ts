/**
 * Achievement Service
 *
 * Comprehensive achievement tracking and unlocking system.
 * Tracks progress towards all achievements and awards them when criteria are met.
 */

import { MilestoneType, Milestone } from '../types';
import { storageService } from './storageService';
import { hapticService } from './hapticService';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AchievementDefinition {
  type: MilestoneType;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: string;
  hidden?: boolean;
  prerequisite?: MilestoneType;
}

export type AchievementCategory =
  | 'streak'
  | 'completion'
  | 'pain'
  | 'form'
  | 'rom'
  | 'volume'
  | 'time'
  | 'social'
  | 'special';

export interface AchievementProgress {
  type: MilestoneType;
  current: number;
  target: number;
  percentage: number;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAchievements: number;
  pointsEarned: number;
  categoryProgress: Record<AchievementCategory, { unlocked: number; total: number }>;
  rarity: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak achievements
  {
    type: 'streak_3',
    title: '3-dagars streak',
    description: 'Träna 3 dagar i rad',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    points: 50,
    requirement: 'Träna 3 dagar i rad',
  },
  {
    type: 'streak_7',
    title: 'Vecko-mästare',
    description: 'En hel veckas träning!',
    icon: '🏆',
    category: 'streak',
    rarity: 'uncommon',
    points: 150,
    requirement: 'Träna 7 dagar i rad',
    prerequisite: 'streak_3',
  },
  {
    type: 'streak_14',
    title: 'Två veckor stark',
    description: '14 dagar av engagemang',
    icon: '🎖️',
    category: 'streak',
    rarity: 'rare',
    points: 350,
    requirement: 'Träna 14 dagar i rad',
    prerequisite: 'streak_7',
  },
  {
    type: 'streak_30',
    title: 'Månadens hjälte',
    description: 'En hel månads uthållighet!',
    icon: '👑',
    category: 'streak',
    rarity: 'epic',
    points: 1000,
    requirement: 'Träna 30 dagar i rad',
    prerequisite: 'streak_14',
  },
  {
    type: 'streak_60',
    title: 'Orubblig',
    description: 'Två månaders dedikation',
    icon: '💎',
    category: 'streak',
    rarity: 'epic',
    points: 2500,
    requirement: 'Träna 60 dagar i rad',
    prerequisite: 'streak_30',
  },
  {
    type: 'streak_90',
    title: 'Kvartals-kämpe',
    description: 'Tre månaders konsekvent träning',
    icon: '🌟',
    category: 'streak',
    rarity: 'legendary',
    points: 5000,
    requirement: 'Träna 90 dagar i rad',
    prerequisite: 'streak_60',
  },
  {
    type: 'streak_365',
    title: 'Årets mästare',
    description: 'Ett helt år av daglig träning!',
    icon: '🏛️',
    category: 'streak',
    rarity: 'legendary',
    points: 25000,
    requirement: 'Träna 365 dagar i rad',
    prerequisite: 'streak_90',
    hidden: true,
  },

  // Completion achievements
  {
    type: 'first_workout',
    title: 'Första steget',
    description: 'Din resa börjar här',
    icon: '⭐',
    category: 'completion',
    rarity: 'common',
    points: 25,
    requirement: 'Slutför din första träning',
  },
  {
    type: 'first_pain_log',
    title: 'Smärtdagbok',
    description: 'Du har börjat logga din smärta',
    icon: '📝',
    category: 'completion',
    rarity: 'common',
    points: 20,
    requirement: 'Logga din smärta för första gången',
  },
  {
    type: 'first_rom_assessment',
    title: 'Rörlighetstest',
    description: 'Du har gjort din första ROM-bedömning',
    icon: '📐',
    category: 'completion',
    rarity: 'common',
    points: 30,
    requirement: 'Genomför din första ROM-bedömning',
  },
  {
    type: 'week_complete',
    title: 'Vecka avklarad',
    description: 'Alla veckans övningar slutförda',
    icon: '📅',
    category: 'completion',
    rarity: 'uncommon',
    points: 100,
    requirement: 'Slutför alla övningar under en vecka',
  },
  {
    type: 'month_complete',
    title: 'Månads-champion',
    description: 'En hel månads fullständig träning',
    icon: '🗓️',
    category: 'completion',
    rarity: 'rare',
    points: 500,
    requirement: 'Slutför alla övningar under en månad',
    prerequisite: 'week_complete',
  },
  {
    type: 'phase_complete',
    title: 'Fas avklarad',
    description: 'Du har gått vidare till nästa fas',
    icon: '🎯',
    category: 'completion',
    rarity: 'rare',
    points: 500,
    requirement: 'Slutför en hel rehabiliteringsfas',
  },

  // Pain reduction achievements
  {
    type: 'pain_reduction_10',
    title: 'Första lättnaden',
    description: 'Din smärta har minskat med 10%',
    icon: '💚',
    category: 'pain',
    rarity: 'uncommon',
    points: 100,
    requirement: 'Minska din smärta med 10%',
  },
  {
    type: 'pain_reduction_25',
    title: 'Smärtlindring',
    description: 'Din smärta har minskat med 25%',
    icon: '💙',
    category: 'pain',
    rarity: 'rare',
    points: 250,
    requirement: 'Minska din smärta med 25%',
    prerequisite: 'pain_reduction_10',
  },
  {
    type: 'pain_reduction_50',
    title: 'Halvvägs dit!',
    description: 'Din smärta har halverats',
    icon: '💜',
    category: 'pain',
    rarity: 'epic',
    points: 500,
    requirement: 'Minska din smärta med 50%',
    prerequisite: 'pain_reduction_25',
  },
  {
    type: 'pain_free_day',
    title: 'Smärtfri dag',
    description: 'En hel dag utan smärta',
    icon: '🌈',
    category: 'pain',
    rarity: 'rare',
    points: 200,
    requirement: 'Ha en dag med smärtnivå 0',
  },
  {
    type: 'pain_free_week',
    title: 'Smärtfri vecka',
    description: 'En hel vecka utan smärta!',
    icon: '✨',
    category: 'pain',
    rarity: 'legendary',
    points: 1000,
    requirement: 'Ha en vecka utan smärta',
    prerequisite: 'pain_free_day',
    hidden: true,
  },

  // Form & quality achievements
  {
    type: 'perfect_form',
    title: 'Perfekt form',
    description: 'Uppnå 95%+ formpoäng',
    icon: '🎯',
    category: 'form',
    rarity: 'uncommon',
    points: 75,
    requirement: 'Uppnå 95% formpoäng på en övning',
  },
  {
    type: 'form_master',
    title: 'Formmästare',
    description: 'Uppnå 95%+ form 10 gånger',
    icon: '🏅',
    category: 'form',
    rarity: 'rare',
    points: 300,
    requirement: 'Uppnå 95% formpoäng 10 gånger',
    prerequisite: 'perfect_form',
  },
  {
    type: 'technique_expert',
    title: 'Teknikexpert',
    description: 'Uppnå 95%+ form 50 gånger',
    icon: '🎓',
    category: 'form',
    rarity: 'epic',
    points: 750,
    requirement: 'Uppnå 95% formpoäng 50 gånger',
    prerequisite: 'form_master',
  },
  {
    type: 'flawless_session',
    title: 'Felfritt pass',
    description: 'Slutför en hel session med perfekt form',
    icon: '💯',
    category: 'form',
    rarity: 'rare',
    points: 250,
    requirement: 'Ha 95%+ formpoäng på alla övningar i en session',
  },

  // ROM achievements
  {
    type: 'rom_improvement_5',
    title: 'Ökad rörlighet',
    description: 'Förbättra din ROM med 5°',
    icon: '📈',
    category: 'rom',
    rarity: 'uncommon',
    points: 100,
    requirement: 'Öka din rörlighet med 5 grader',
  },
  {
    type: 'rom_improvement_10',
    title: 'Märkbar förbättring',
    description: 'Förbättra din ROM med 10°',
    icon: '📊',
    category: 'rom',
    rarity: 'rare',
    points: 250,
    requirement: 'Öka din rörlighet med 10 grader',
    prerequisite: 'rom_improvement_5',
  },
  {
    type: 'rom_improvement_25',
    title: 'Rörlighets-revolution',
    description: 'Förbättra din ROM med 25°',
    icon: '🚀',
    category: 'rom',
    rarity: 'epic',
    points: 600,
    requirement: 'Öka din rörlighet med 25 grader',
    prerequisite: 'rom_improvement_10',
  },
  {
    type: 'full_rom_restored',
    title: 'Full rörlighet återställd',
    description: 'Du har uppnått full rörlighet!',
    icon: '🌟',
    category: 'rom',
    rarity: 'legendary',
    points: 1500,
    requirement: 'Uppnå full rörelseomfång',
    prerequisite: 'rom_improvement_25',
  },

  // Volume achievements
  {
    type: 'reps_100',
    title: '100 repetitioner',
    description: 'Första hundratal',
    icon: '💪',
    category: 'volume',
    rarity: 'common',
    points: 50,
    requirement: 'Genomför 100 repetitioner totalt',
  },
  {
    type: 'reps_500',
    title: '500 repetitioner',
    description: 'Halvtusen reps!',
    icon: '🏋️',
    category: 'volume',
    rarity: 'uncommon',
    points: 150,
    requirement: 'Genomför 500 repetitioner totalt',
    prerequisite: 'reps_100',
  },
  {
    type: 'reps_1000',
    title: '1000 repetitioner',
    description: 'Tusen reps klubben',
    icon: '🎉',
    category: 'volume',
    rarity: 'rare',
    points: 400,
    requirement: 'Genomför 1000 repetitioner totalt',
    prerequisite: 'reps_500',
  },
  {
    type: 'reps_5000',
    title: '5000 repetitioner',
    description: 'Rep-mästare!',
    icon: '🔥',
    category: 'volume',
    rarity: 'epic',
    points: 1000,
    requirement: 'Genomför 5000 repetitioner totalt',
    prerequisite: 'reps_1000',
  },
  {
    type: 'sessions_10',
    title: '10 sessioner',
    description: 'Tio pass avklarade',
    icon: '📚',
    category: 'volume',
    rarity: 'common',
    points: 75,
    requirement: 'Slutför 10 träningssessioner',
  },
  {
    type: 'sessions_50',
    title: '50 sessioner',
    description: 'Halvhundra pass',
    icon: '📖',
    category: 'volume',
    rarity: 'rare',
    points: 350,
    requirement: 'Slutför 50 träningssessioner',
    prerequisite: 'sessions_10',
  },
  {
    type: 'sessions_100',
    title: '100 sessioner',
    description: 'Hundra pass klubben',
    icon: '🏛️',
    category: 'volume',
    rarity: 'epic',
    points: 800,
    requirement: 'Slutför 100 träningssessioner',
    prerequisite: 'sessions_50',
  },

  // Time-based achievements
  {
    type: 'early_bird',
    title: 'Morgonpigg',
    description: 'Träna före kl 07:00',
    icon: '🌅',
    category: 'time',
    rarity: 'uncommon',
    points: 75,
    requirement: 'Slutför en träning före kl 07:00',
  },
  {
    type: 'night_owl',
    title: 'Nattuggla',
    description: 'Träna efter kl 22:00',
    icon: '🌙',
    category: 'time',
    rarity: 'uncommon',
    points: 75,
    requirement: 'Slutför en träning efter kl 22:00',
  },
  {
    type: 'weekend_warrior',
    title: 'Helgkrigare',
    description: 'Träna på lördagar och söndagar',
    icon: '⚔️',
    category: 'time',
    rarity: 'uncommon',
    points: 100,
    requirement: 'Träna både lördag och söndag',
  },
  {
    type: 'morning_routine',
    title: 'Morgonrutin',
    description: 'Träna före kl 10 i 7 dagar',
    icon: '☀️',
    category: 'time',
    rarity: 'rare',
    points: 250,
    requirement: 'Träna före kl 10:00 varje dag i en vecka',
    prerequisite: 'early_bird',
  },

  // Social achievements
  {
    type: 'shared_progress',
    title: 'Dela framsteg',
    description: 'Dela dina framsteg första gången',
    icon: '📤',
    category: 'social',
    rarity: 'common',
    points: 50,
    requirement: 'Dela dina framsteg',
  },
  {
    type: 'invited_friend',
    title: 'Ambassadör',
    description: 'Bjud in en vän',
    icon: '👥',
    category: 'social',
    rarity: 'uncommon',
    points: 150,
    requirement: 'Bjud in en vän till appen',
  },
  {
    type: 'group_challenge_complete',
    title: 'Lagspelare',
    description: 'Slutför en gruppchallenge',
    icon: '🤝',
    category: 'social',
    rarity: 'rare',
    points: 300,
    requirement: 'Slutför en gruppchallenge',
  },

  // Special achievements
  {
    type: 'comeback_king',
    title: 'Comeback',
    description: 'Återvända efter 7+ dagar',
    icon: '🦅',
    category: 'special',
    rarity: 'uncommon',
    points: 100,
    requirement: 'Återuppta träningen efter 7+ dagars uppehåll',
  },
  {
    type: 'consistency_champion',
    title: 'Konsistens-champion',
    description: '90%+ närvaro i en månad',
    icon: '🏆',
    category: 'special',
    rarity: 'epic',
    points: 500,
    requirement: 'Uppnå 90% närvaro under en månad',
  },
  {
    type: 'pain_warrior',
    title: 'Smärtkrigare',
    description: 'Fortsätta träna trots smärta',
    icon: '⚔️',
    category: 'special',
    rarity: 'rare',
    points: 200,
    requirement: 'Slutför träning när smärtnivån var över 5',
  },
  {
    type: 'dedication_diamond',
    title: 'Dedikationens diamant',
    description: 'Slutför alla mål i en vecka',
    icon: '💎',
    category: 'special',
    rarity: 'epic',
    points: 750,
    requirement: 'Uppnå alla veckans mål',
  },
  {
    type: 'rehabflow_master',
    title: 'RehabFlow Mästare',
    description: 'Den ultimata utmärkelsen',
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    points: 10000,
    requirement: 'Lås upp 40 achievements',
    hidden: true,
  },
];

// ============================================================================
// SERVICE
// ============================================================================

class AchievementService {
  private listeners: Set<(achievement: Milestone) => void> = new Set();
  private progressCache: Map<MilestoneType, AchievementProgress> = new Map();

  /**
   * Get all achievement definitions
   */
  getDefinitions(): AchievementDefinition[] {
    const unlocked = this.getUnlockedTypes();
    return ACHIEVEMENT_DEFINITIONS.filter(def => {
      if (def.hidden && !unlocked.has(def.type)) {
        // Show hidden achievements only if prerequisite is met
        if (def.prerequisite && !unlocked.has(def.prerequisite)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get definition for a specific achievement
   */
  getDefinition(type: MilestoneType): AchievementDefinition | undefined {
    return ACHIEVEMENT_DEFINITIONS.find(d => d.type === type);
  }

  /**
   * Get all unlocked achievements
   */
  getUnlocked(): Milestone[] {
    return storageService.getMilestones();
  }

  /**
   * Get unlocked achievement types as a Set
   */
  getUnlockedTypes(): Set<MilestoneType> {
    return new Set(this.getUnlocked().map(m => m.type));
  }

  /**
   * Check if an achievement is unlocked
   */
  isUnlocked(type: MilestoneType): boolean {
    return this.getUnlockedTypes().has(type);
  }

  /**
   * Unlock an achievement
   */
  unlock(type: MilestoneType): Milestone | null {
    if (this.isUnlocked(type)) {
      return null;
    }

    const definition = this.getDefinition(type);
    if (!definition) {
      logger.warn('[Achievement] Unknown achievement type:', type);
      return null;
    }

    // Check prerequisite
    if (definition.prerequisite && !this.isUnlocked(definition.prerequisite)) {
      logger.info('[Achievement] Prerequisite not met:', definition.prerequisite);
      return null;
    }

    const milestone: Milestone = {
      id: `achievement_${type}_${Date.now()}`,
      type,
      achievedAt: new Date().toISOString(),
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      celebrated: false,
    };

    storageService.addMilestone(milestone);
    hapticService.success();

    // Notify listeners
    this.notifyListeners(milestone);

    logger.info('[Achievement] Unlocked:', type);

    // Check if this unlocks RehabFlow Master
    this.checkMasterAchievement();

    return milestone;
  }

  /**
   * Get achievement statistics
   */
  getStats(): AchievementStats {
    const unlocked = this.getUnlocked();
    const unlockedTypes = this.getUnlockedTypes();

    const categoryProgress: AchievementStats['categoryProgress'] = {
      streak: { unlocked: 0, total: 0 },
      completion: { unlocked: 0, total: 0 },
      pain: { unlocked: 0, total: 0 },
      form: { unlocked: 0, total: 0 },
      rom: { unlocked: 0, total: 0 },
      volume: { unlocked: 0, total: 0 },
      time: { unlocked: 0, total: 0 },
      social: { unlocked: 0, total: 0 },
      special: { unlocked: 0, total: 0 },
    };

    const rarity = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    let pointsEarned = 0;

    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      categoryProgress[def.category].total++;

      if (unlockedTypes.has(def.type)) {
        categoryProgress[def.category].unlocked++;
        rarity[def.rarity]++;
        pointsEarned += def.points;
      }
    });

    return {
      totalUnlocked: unlocked.length,
      totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
      pointsEarned,
      categoryProgress,
      rarity,
    };
  }

  /**
   * Get achievements by category
   */
  getByCategory(category: AchievementCategory): AchievementDefinition[] {
    return ACHIEVEMENT_DEFINITIONS.filter(d => d.category === category);
  }

  /**
   * Get progress towards an achievement
   */
  getProgress(type: MilestoneType): AchievementProgress | null {
    const cached = this.progressCache.get(type);
    if (cached) return cached;

    // This would be populated by tracking services
    return null;
  }

  /**
   * Update progress for an achievement
   */
  updateProgress(type: MilestoneType, current: number, target: number): void {
    const progress: AchievementProgress = {
      type,
      current,
      target,
      percentage: Math.min(100, Math.round((current / target) * 100)),
    };

    this.progressCache.set(type, progress);

    // Auto-unlock if target reached
    if (current >= target) {
      this.unlock(type);
    }
  }

  /**
   * Check and unlock streak achievements
   */
  checkStreakAchievements(currentStreak: number): void {
    if (currentStreak >= 3) this.unlock('streak_3');
    if (currentStreak >= 7) this.unlock('streak_7');
    if (currentStreak >= 14) this.unlock('streak_14');
    if (currentStreak >= 30) this.unlock('streak_30');
    if (currentStreak >= 60) this.unlock('streak_60');
    if (currentStreak >= 90) this.unlock('streak_90');
    if (currentStreak >= 365) this.unlock('streak_365');
  }

  /**
   * Check and unlock rep achievements
   */
  checkRepAchievements(totalReps: number): void {
    if (totalReps >= 100) this.unlock('reps_100');
    if (totalReps >= 500) this.unlock('reps_500');
    if (totalReps >= 1000) this.unlock('reps_1000');
    if (totalReps >= 5000) this.unlock('reps_5000');
  }

  /**
   * Check and unlock session achievements
   */
  checkSessionAchievements(totalSessions: number): void {
    if (totalSessions >= 1) this.unlock('first_workout');
    if (totalSessions >= 10) this.unlock('sessions_10');
    if (totalSessions >= 50) this.unlock('sessions_50');
    if (totalSessions >= 100) this.unlock('sessions_100');
  }

  /**
   * Check time-based achievements
   */
  checkTimeAchievements(hour: number, dayOfWeek: number): void {
    if (hour < 7) this.unlock('early_bird');
    if (hour >= 22) this.unlock('night_owl');
  }

  /**
   * Check master achievement
   */
  private checkMasterAchievement(): void {
    const unlockedCount = this.getUnlocked().length;
    if (unlockedCount >= 40) {
      this.unlock('rehabflow_master');
    }
  }

  /**
   * Subscribe to achievement unlocks
   */
  subscribe(listener: (achievement: Milestone) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of new achievement
   */
  private notifyListeners(achievement: Milestone): void {
    this.listeners.forEach(listener => {
      try {
        listener(achievement);
      } catch (error) {
        logger.error('[Achievement] Listener error:', error);
      }
    });
  }

  /**
   * Mark an achievement as celebrated (seen by user)
   */
  markCelebrated(type: MilestoneType): void {
    const milestones = storageService.getMilestones();
    const milestone = milestones.find(m => m.type === type);
    if (milestone) {
      milestone.celebrated = true;
      // storageService would need an update method here
    }
  }

  /**
   * Get uncelebrated achievements
   */
  getUncelebrated(): Milestone[] {
    return this.getUnlocked().filter(m => !m.celebrated);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const achievementService = new AchievementService();
export default achievementService;
