/**
 * Goal Service
 *
 * Manages daily, weekly, and custom rehabilitation goals:
 * - Automatic goal suggestions based on progress
 * - Streak tracking
 * - Goal completion celebrations
 * - Smart reminders
 */

import { logger } from '../utils/logger';
import { hapticService } from './hapticService';

// ============================================================================
// TYPES
// ============================================================================

export type GoalType = 'daily' | 'weekly' | 'custom' | 'challenge';
export type GoalCategory = 'exercise' | 'consistency' | 'form' | 'rom' | 'pain' | 'milestone';
export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface Goal {
  id: string;
  type: GoalType;
  category: GoalCategory;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  status: GoalStatus;
  createdAt: number;
  completedAt?: number;
  expiresAt: number;
  reward?: {
    points: number;
    badge?: string;
  };
  streakBonus?: boolean;
}

export interface GoalProgress {
  goalId: string;
  previousValue: number;
  newValue: number;
  timestamp: number;
}

export interface DailyGoalSet {
  date: string; // YYYY-MM-DD
  goals: Goal[];
  completedCount: number;
  totalPoints: number;
}

export interface WeeklyGoalSet {
  weekStart: string; // YYYY-MM-DD
  goals: Goal[];
  completedCount: number;
  totalPoints: number;
}

export interface GoalStats {
  totalGoalsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  pointsEarned: number;
  favoriteCategory: GoalCategory;
}

// ============================================================================
// GOAL TEMPLATES
// ============================================================================

const DAILY_GOAL_TEMPLATES: Partial<Goal>[] = [
  {
    category: 'exercise',
    title: 'Daglig träning',
    description: 'Genomför minst en övningssession',
    target: 1,
    unit: 'session',
    reward: { points: 50 },
  },
  {
    category: 'exercise',
    title: 'Träningstid',
    description: 'Träna i minst 15 minuter',
    target: 15,
    unit: 'minuter',
    reward: { points: 75 },
  },
  {
    category: 'form',
    title: 'Perfekt form',
    description: 'Uppnå 90%+ formpoäng på en övning',
    target: 90,
    unit: '%',
    reward: { points: 100, badge: 'form_master' },
  },
  {
    category: 'consistency',
    title: 'Morgonrutin',
    description: 'Starta din första övning före kl 10',
    target: 1,
    unit: 'session',
    reward: { points: 30 },
  },
  {
    category: 'pain',
    title: 'Smärtloggning',
    description: 'Logga din smärtnivå idag',
    target: 1,
    unit: 'logg',
    reward: { points: 25 },
  },
];

const WEEKLY_GOAL_TEMPLATES: Partial<Goal>[] = [
  {
    category: 'consistency',
    title: 'Veckans träning',
    description: 'Träna minst 4 dagar denna vecka',
    target: 4,
    unit: 'dagar',
    reward: { points: 200, badge: 'weekly_warrior' },
  },
  {
    category: 'exercise',
    title: 'Repetitioner',
    description: 'Genomför 100 repetitioner totalt',
    target: 100,
    unit: 'reps',
    reward: { points: 150 },
  },
  {
    category: 'rom',
    title: 'Rörlighetsförbättring',
    description: 'Förbättra din rörlighet med 5 grader',
    target: 5,
    unit: 'grader',
    reward: { points: 250, badge: 'flexibility_hero' },
  },
  {
    category: 'form',
    title: 'Formkonsistens',
    description: 'Håll genomsnittlig form över 80%',
    target: 80,
    unit: '%',
    reward: { points: 175 },
  },
  {
    category: 'pain',
    title: 'Smärtminskning',
    description: 'Minska genomsnittlig smärtnivå',
    target: 1,
    unit: 'nivå',
    reward: { points: 300, badge: 'pain_reducer' },
  },
];

const CHALLENGE_TEMPLATES: Partial<Goal>[] = [
  {
    category: 'milestone',
    title: '7-dagars streak',
    description: 'Träna 7 dagar i rad',
    target: 7,
    unit: 'dagar',
    reward: { points: 500, badge: 'streak_7' },
  },
  {
    category: 'milestone',
    title: '30-dagars streak',
    description: 'Träna 30 dagar i rad',
    target: 30,
    unit: 'dagar',
    reward: { points: 2000, badge: 'streak_30' },
  },
  {
    category: 'exercise',
    title: '1000 repetitioner',
    description: 'Genomför totalt 1000 repetitioner',
    target: 1000,
    unit: 'reps',
    reward: { points: 1000, badge: 'rep_master' },
  },
  {
    category: 'form',
    title: 'Perfektionist',
    description: 'Uppnå 95%+ formpoäng 10 gånger',
    target: 10,
    unit: 'sessioner',
    reward: { points: 750, badge: 'perfectionist' },
  },
];

// ============================================================================
// SERVICE
// ============================================================================

class GoalService {
  private goals: Goal[] = [];
  private stats: GoalStats;
  private listeners: Set<(goals: Goal[]) => void> = new Set();
  private storageKey = 'rehab_goals';
  private statsKey = 'rehab_goal_stats';

  constructor() {
    this.stats = this.getDefaultStats();
    this.loadFromStorage();
    this.checkDailyGoals();
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * Get all active goals
   */
  getActiveGoals(): Goal[] {
    const now = Date.now();
    return this.goals.filter(g =>
      g.status !== 'completed' &&
      g.status !== 'failed' &&
      g.expiresAt > now
    );
  }

  /**
   * Get today's goals
   */
  getDailyGoals(): Goal[] {
    const today = this.getDateString(new Date());
    return this.goals.filter(g =>
      g.type === 'daily' &&
      this.getDateString(new Date(g.createdAt)) === today
    );
  }

  /**
   * Get this week's goals
   */
  getWeeklyGoals(): Goal[] {
    const weekStart = this.getWeekStart(new Date());
    return this.goals.filter(g =>
      g.type === 'weekly' &&
      this.getWeekStart(new Date(g.createdAt)) === weekStart
    );
  }

  /**
   * Get challenges (long-term goals)
   */
  getChallenges(): Goal[] {
    return this.goals.filter(g => g.type === 'challenge');
  }

  /**
   * Update goal progress
   */
  updateProgress(goalId: string, value: number): Goal | null {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return null;

    const previousValue = goal.current;
    goal.current = Math.min(value, goal.target);

    // Check completion
    if (goal.current >= goal.target && goal.status !== 'completed') {
      this.completeGoal(goal);
    } else if (goal.status === 'pending') {
      goal.status = 'in_progress';
    }

    this.saveToStorage();
    this.notifyListeners();

    logger.info('[Goals] Progress updated', { goalId, previousValue, newValue: goal.current });
    return goal;
  }

  /**
   * Increment goal progress
   */
  incrementProgress(category: GoalCategory, amount: number = 1): void {
    const activeGoals = this.getActiveGoals().filter(g => g.category === category);

    activeGoals.forEach(goal => {
      this.updateProgress(goal.id, goal.current + amount);
    });
  }

  /**
   * Generate daily goals
   */
  generateDailyGoals(): Goal[] {
    const today = this.getDateString(new Date());
    const existingDaily = this.goals.filter(g =>
      g.type === 'daily' &&
      this.getDateString(new Date(g.createdAt)) === today
    );

    // Don't regenerate if already have goals for today
    if (existingDaily.length > 0) return existingDaily;

    // Select 3 random goals
    const templates = this.shuffleArray([...DAILY_GOAL_TEMPLATES]).slice(0, 3);
    const newGoals = templates.map(template => this.createGoal(template, 'daily'));

    this.goals.push(...newGoals);
    this.saveToStorage();
    this.notifyListeners();

    logger.info('[Goals] Daily goals generated', { count: newGoals.length });
    return newGoals;
  }

  /**
   * Generate weekly goals
   */
  generateWeeklyGoals(): Goal[] {
    const weekStart = this.getWeekStart(new Date());
    const existingWeekly = this.goals.filter(g =>
      g.type === 'weekly' &&
      this.getWeekStart(new Date(g.createdAt)) === weekStart
    );

    if (existingWeekly.length > 0) return existingWeekly;

    // Select 2 random weekly goals
    const templates = this.shuffleArray([...WEEKLY_GOAL_TEMPLATES]).slice(0, 2);
    const newGoals = templates.map(template => this.createGoal(template, 'weekly'));

    this.goals.push(...newGoals);
    this.saveToStorage();
    this.notifyListeners();

    logger.info('[Goals] Weekly goals generated', { count: newGoals.length });
    return newGoals;
  }

  /**
   * Add a challenge
   */
  addChallenge(challengeIndex: number): Goal | null {
    const template = CHALLENGE_TEMPLATES[challengeIndex];
    if (!template) return null;

    // Check if already exists
    const existing = this.goals.find(g =>
      g.type === 'challenge' &&
      g.title === template.title &&
      g.status !== 'completed'
    );

    if (existing) return existing;

    const goal = this.createGoal(template, 'challenge');
    this.goals.push(goal);
    this.saveToStorage();
    this.notifyListeners();

    return goal;
  }

  /**
   * Get statistics
   */
  getStats(): GoalStats {
    return { ...this.stats };
  }

  /**
   * Subscribe to goal changes
   */
  subscribe(listener: (goals: Goal[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Skip a goal
   */
  skipGoal(goalId: string): void {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal && goal.status !== 'completed') {
      goal.status = 'skipped';
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Get available challenges
   */
  getAvailableChallenges(): Partial<Goal>[] {
    const activeChallengeTitles = this.goals
      .filter(g => g.type === 'challenge' && g.status !== 'completed')
      .map(g => g.title);

    return CHALLENGE_TEMPLATES.filter(t => !activeChallengeTitles.includes(t.title!));
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  private createGoal(template: Partial<Goal>, type: GoalType): Goal {
    const now = Date.now();
    const expiresAt = type === 'daily'
      ? this.getEndOfDay()
      : type === 'weekly'
        ? this.getEndOfWeek()
        : now + 365 * 24 * 60 * 60 * 1000; // 1 year for challenges

    return {
      id: this.generateId(),
      type,
      category: template.category || 'exercise',
      title: template.title || 'Mål',
      description: template.description || '',
      target: template.target || 1,
      current: 0,
      unit: template.unit || '',
      status: 'pending',
      createdAt: now,
      expiresAt,
      reward: template.reward,
      streakBonus: this.stats.currentStreak >= 7,
    };
  }

  private completeGoal(goal: Goal): void {
    goal.status = 'completed';
    goal.completedAt = Date.now();

    // Award points
    let points = goal.reward?.points || 50;

    // Streak bonus
    if (goal.streakBonus) {
      points = Math.floor(points * 1.5);
    }

    this.stats.totalGoalsCompleted++;
    this.stats.pointsEarned += points;

    // Update category stats
    this.updateCategoryStats(goal.category);

    // Celebration
    hapticService.success();

    logger.info('[Goals] Goal completed!', { goalId: goal.id, points });
  }

  private updateCategoryStats(category: GoalCategory): void {
    // Track most completed category (simplified)
    this.stats.favoriteCategory = category;
  }

  private checkDailyGoals(): void {
    const now = Date.now();

    // Expire old goals
    this.goals.forEach(goal => {
      if (goal.expiresAt < now && goal.status !== 'completed') {
        goal.status = 'failed';

        // Reset streak on failed daily goals
        if (goal.type === 'daily') {
          this.stats.currentStreak = 0;
        }
      }
    });

    // Clean up very old goals (keep last 100)
    this.goals = this.goals
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100);

    this.saveToStorage();
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return this.getDateString(d);
  }

  private getEndOfDay(): number {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  private getEndOfWeek(): number {
    const d = new Date();
    const day = d.getDay();
    const diff = 7 - day + (day === 0 ? 0 : 1);
    d.setDate(d.getDate() + diff);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private generateId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultStats(): GoalStats {
    return {
      totalGoalsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      pointsEarned: 0,
      favoriteCategory: 'exercise',
    };
  }

  private notifyListeners(): void {
    const goals = [...this.goals];
    this.listeners.forEach(listener => {
      try {
        listener(goals);
      } catch (error) {
        logger.error('[Goals] Listener error', error);
      }
    });
  }

  private loadFromStorage(): void {
    try {
      const goalsData = localStorage.getItem(this.storageKey);
      const statsData = localStorage.getItem(this.statsKey);

      if (goalsData) {
        this.goals = JSON.parse(goalsData);
      }
      if (statsData) {
        this.stats = { ...this.getDefaultStats(), ...JSON.parse(statsData) };
      }
    } catch (error) {
      logger.warn('[Goals] Failed to load from storage', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.goals));
      localStorage.setItem(this.statsKey, JSON.stringify(this.stats));
    } catch (error) {
      logger.warn('[Goals] Failed to save to storage', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const goalService = new GoalService();
export default goalService;
