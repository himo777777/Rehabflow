/**
 * Exercise Insights Service
 *
 * AI-powered analysis of exercise performance to provide:
 * - Personalized recommendations
 * - Progress tracking insights
 * - Form improvement suggestions
 * - Training load optimization
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ExerciseSession {
  exerciseName: string;
  exerciseMode: string;
  reps: number;
  avgFormScore: number;
  romData: {
    minAngle: number;
    maxAngle: number;
    currentROM: number;
  };
  duration: number; // seconds
  issues: string[];
  timestamp: number;
}

export interface ExerciseInsight {
  type: 'improvement' | 'warning' | 'achievement' | 'recommendation' | 'trend';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable?: string;
  relatedExercises?: string[];
  dataPoints?: number[];
}

export interface PersonalizedRecommendation {
  category: 'form' | 'volume' | 'frequency' | 'progression' | 'recovery';
  title: string;
  description: string;
  exercises?: string[];
  targetGoal?: string;
}

export interface ProgressTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  percentageChange: number;
  timespan: string;
}

export interface ExerciseProfile {
  exerciseName: string;
  totalSessions: number;
  avgFormScore: number;
  avgROM: number;
  commonIssues: string[];
  bestSession: ExerciseSession | null;
  recentTrend: 'improving' | 'stable' | 'declining';
  lastPerformed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'exercise_sessions_history';
const MAX_SESSIONS_STORED = 500;

const ISSUE_RECOMMENDATIONS: Record<string, string> = {
  'Knäna kollapsar inåt': 'Fokusera på höftabduktorer. Lägg till sidoliggande höftlyft och clamshell-övningar.',
  'Luta dig inte för långt fram': 'Jobba på ankelrörlighet och bålstabilitet. Prova boxsquat för bättre teknik.',
  'Håll hälarna i golvet': 'Töj vadmusklerna och jobba med ankelrörlighet. Använd en liten kilplatta under hälarna.',
  'Knät går för långt fram': 'Fokusera på att "sätta sig bakåt". Öva med en stol bakom dig.',
  'Håll ryggen upprätt': 'Stärk core och övre rygg. Lägg till bird-dog och pallof press.',
  'För brett grepp': 'Håll armbågarna närmare kroppen. Tänk på att "skruva ner" axlarna.',
  'Håll neutral rygg': 'Aktivera core innan rörelsen. Tänk på att "dra naveln inåt".',
  'Dra ihop skulderbladen': 'Fokusera på skapulär retraktion. Lägg till face pulls och band pull-aparts.',
  'Höfterna hänger': 'Stärk core och gluteus. Plankan och glute bridges hjälper.',
  'Höfterna för högt': 'Sänk höfterna och håll en rak linje. Fokusera på att spänna magen.',
  'Lyft höfterna': 'Aktivera core mer. Dra in naveln och spänna magen.',
  'Sänk höfterna': 'Kontrollera att du inte svankrygg. Spänn magen.',
  'Töj försiktigt, inte för djupt': 'Respektera smärtgränsen. Andas djupt och släpp långsamt.',
};

const PROGRESSION_THRESHOLDS = {
  formScore: {
    excellent: 90,
    good: 75,
    acceptable: 60,
  },
  romImprovement: 5, // degrees
  consistencyDays: 3,
};

// ============================================================================
// SERVICE
// ============================================================================

class ExerciseInsightsService {
  private sessions: ExerciseSession[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record a completed exercise session
   */
  recordSession(session: ExerciseSession): void {
    this.sessions.unshift(session);

    // Limit stored sessions
    if (this.sessions.length > MAX_SESSIONS_STORED) {
      this.sessions = this.sessions.slice(0, MAX_SESSIONS_STORED);
    }

    this.saveToStorage();
    logger.info('[ExerciseInsights] Session recorded', {
      exercise: session.exerciseName,
      score: session.avgFormScore,
    });
  }

  /**
   * Get insights for the current session
   */
  getSessionInsights(session: ExerciseSession): ExerciseInsight[] {
    const insights: ExerciseInsight[] = [];
    const history = this.getExerciseHistory(session.exerciseName);

    // Compare to previous sessions
    if (history.length > 0) {
      const recentAvg = this.calculateRecentAverage(history, 'avgFormScore', 5);

      if (session.avgFormScore > recentAvg + 5) {
        insights.push({
          type: 'improvement',
          priority: 'high',
          title: 'Bättre form än genomsnittet!',
          description: `Din formpoäng (${Math.round(session.avgFormScore)}) är ${Math.round(session.avgFormScore - recentAvg)} poäng högre än ditt senaste genomsnitt.`,
        });
      }

      // ROM improvement
      const recentROM = this.calculateRecentAverage(history, 'romData.currentROM', 5);
      if (session.romData.currentROM > recentROM + PROGRESSION_THRESHOLDS.romImprovement) {
        insights.push({
          type: 'achievement',
          priority: 'medium',
          title: 'Ökad rörlighet!',
          description: `Du har ökat din rörlighet med ${Math.round(session.romData.currentROM - recentROM)}° jämfört med tidigare.`,
        });
      }
    }

    // Issue-based recommendations
    session.issues.forEach((issue) => {
      const recommendation = ISSUE_RECOMMENDATIONS[issue];
      if (recommendation) {
        insights.push({
          type: 'recommendation',
          priority: 'medium',
          title: issue,
          description: recommendation,
          actionable: 'Lägg till i ditt träningsprogram',
        });
      }
    });

    // Form score feedback
    if (session.avgFormScore >= PROGRESSION_THRESHOLDS.formScore.excellent) {
      insights.push({
        type: 'achievement',
        priority: 'high',
        title: 'Utmärkt teknik!',
        description: 'Din form var utmärkt under hela passet. Fortsätt så!',
      });
    } else if (session.avgFormScore < PROGRESSION_THRESHOLDS.formScore.acceptable) {
      insights.push({
        type: 'warning',
        priority: 'high',
        title: 'Fokusera på tekniken',
        description: 'Din formpoäng var lägre än vanligt. Ta det lugnare och fokusera på kontrollerade rörelser.',
        actionable: 'Sänk vikten eller minska intensiteten',
      });
    }

    return insights;
  }

  /**
   * Get personalized recommendations based on history
   */
  getPersonalizedRecommendations(): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Analyze common issues across all exercises
    const allIssues = this.getAllIssues();
    const topIssues = this.getTopItems(allIssues, 3);

    topIssues.forEach(({ item, count }) => {
      const recommendation = ISSUE_RECOMMENDATIONS[item];
      if (recommendation) {
        recommendations.push({
          category: 'form',
          title: `Förbättra: ${item}`,
          description: recommendation,
          targetGoal: `Minska detta problem från ${count} sessioner`,
        });
      }
    });

    // Check training frequency
    const recentSessions = this.sessions.filter(
      (s) => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000
    );

    if (recentSessions.length < 3) {
      recommendations.push({
        category: 'frequency',
        title: 'Öka träningsfrekvensen',
        description: 'Du har tränat färre än 3 gånger den senaste veckan. Försök att träna regelbundet för bästa resultat.',
        targetGoal: 'Sikta på 3-4 pass per vecka',
      });
    }

    // Check for imbalanced training
    const exerciseCounts = this.getExerciseCounts(recentSessions);
    const avgCount = Object.values(exerciseCounts).reduce((a, b) => a + b, 0) / Object.keys(exerciseCounts).length || 1;

    Object.entries(exerciseCounts).forEach(([exercise, count]) => {
      if (count > avgCount * 2) {
        recommendations.push({
          category: 'volume',
          title: `Variera din träning`,
          description: `Du gör ${exercise} oftare än andra övningar. Lägg till variation för balanserad träning.`,
        });
      }
    });

    // Progression recommendation
    const profiles = this.getExerciseProfiles();
    const improvingExercises = profiles.filter((p) => p.recentTrend === 'improving');
    const decliningExercises = profiles.filter((p) => p.recentTrend === 'declining');

    if (improvingExercises.length > 0) {
      recommendations.push({
        category: 'progression',
        title: 'Du förbättras!',
        description: `Bra utveckling i: ${improvingExercises.map((e) => e.exerciseName).join(', ')}. Fortsätt med nuvarande träning.`,
        exercises: improvingExercises.map((e) => e.exerciseName),
      });
    }

    if (decliningExercises.length > 0) {
      recommendations.push({
        category: 'recovery',
        title: 'Behov av återhämtning?',
        description: `Din prestation har minskat i: ${decliningExercises.map((e) => e.exerciseName).join(', ')}. Överväg vila eller lättare träning.`,
        exercises: decliningExercises.map((e) => e.exerciseName),
      });
    }

    return recommendations;
  }

  /**
   * Get progress trends
   */
  getProgressTrends(): ProgressTrend[] {
    const trends: ProgressTrend[] = [];

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    const thisWeek = this.sessions.filter((s) => s.timestamp >= weekAgo);
    const lastWeek = this.sessions.filter((s) => s.timestamp >= twoWeeksAgo && s.timestamp < weekAgo);

    if (thisWeek.length > 0 && lastWeek.length > 0) {
      // Form score trend
      const thisWeekForm = this.average(thisWeek, 'avgFormScore');
      const lastWeekForm = this.average(lastWeek, 'avgFormScore');
      const formChange = ((thisWeekForm - lastWeekForm) / lastWeekForm) * 100;

      trends.push({
        metric: 'Form Score',
        direction: formChange > 2 ? 'improving' : formChange < -2 ? 'declining' : 'stable',
        percentageChange: formChange,
        timespan: 'senaste veckan',
      });

      // Volume trend
      const volumeChange = ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100;
      trends.push({
        metric: 'Träningsvolym',
        direction: volumeChange > 10 ? 'improving' : volumeChange < -10 ? 'declining' : 'stable',
        percentageChange: volumeChange,
        timespan: 'senaste veckan',
      });
    }

    return trends;
  }

  /**
   * Get exercise profiles
   */
  getExerciseProfiles(): ExerciseProfile[] {
    const exerciseMap = new Map<string, ExerciseSession[]>();

    this.sessions.forEach((session) => {
      const existing = exerciseMap.get(session.exerciseName) || [];
      existing.push(session);
      exerciseMap.set(session.exerciseName, existing);
    });

    return Array.from(exerciseMap.entries()).map(([exerciseName, sessions]) => {
      const avgFormScore = this.average(sessions, 'avgFormScore');
      const avgROM = this.average(sessions.filter((s) => s.romData), 'romData.currentROM');

      // Get common issues
      const allIssues = sessions.flatMap((s) => s.issues);
      const topIssues = this.getTopItems(allIssues, 3).map((i) => i.item);

      // Calculate trend
      const recent = sessions.slice(0, 5);
      const older = sessions.slice(5, 10);
      let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';

      if (recent.length > 0 && older.length > 0) {
        const recentAvg = this.average(recent, 'avgFormScore');
        const olderAvg = this.average(older, 'avgFormScore');
        const diff = recentAvg - olderAvg;

        if (diff > 5) recentTrend = 'improving';
        else if (diff < -5) recentTrend = 'declining';
      }

      // Best session
      const bestSession = sessions.reduce(
        (best, current) => (current.avgFormScore > (best?.avgFormScore || 0) ? current : best),
        null as ExerciseSession | null
      );

      return {
        exerciseName,
        totalSessions: sessions.length,
        avgFormScore,
        avgROM,
        commonIssues: topIssues,
        bestSession,
        recentTrend,
        lastPerformed: sessions[0]?.timestamp || 0,
      };
    });
  }

  /**
   * Get history for specific exercise
   */
  getExerciseHistory(exerciseName: string): ExerciseSession[] {
    return this.sessions.filter(
      (s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );
  }

  /**
   * Clear all data
   */
  clearHistory(): void {
    this.sessions = [];
    this.saveToStorage();
    logger.info('[ExerciseInsights] History cleared');
  }

  // Private helper methods

  private calculateRecentAverage(
    sessions: ExerciseSession[],
    key: string,
    count: number
  ): number {
    const recent = sessions.slice(0, count);
    return this.average(recent, key);
  }

  private average(items: any[], key: string): number {
    if (items.length === 0) return 0;

    const values = items.map((item) => {
      const keys = key.split('.');
      let value = item;
      for (const k of keys) {
        value = value?.[k];
      }
      return typeof value === 'number' ? value : 0;
    });

    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private getAllIssues(): string[] {
    return this.sessions.flatMap((s) => s.issues);
  }

  private getTopItems(items: string[], count: number): { item: string; count: number }[] {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }

  private getExerciseCounts(sessions: ExerciseSession[]): Record<string, number> {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      counts[s.exerciseName] = (counts[s.exerciseName] || 0) + 1;
    });
    return counts;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('[ExerciseInsights] Failed to load from storage', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      logger.warn('[ExerciseInsights] Failed to save to storage', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const exerciseInsightsService = new ExerciseInsightsService();
export default exerciseInsightsService;
