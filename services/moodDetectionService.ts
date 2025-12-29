/**
 * Mood Detection Service - Sprint 5.6
 *
 * World-class user engagement and emotional state detection.
 * Uses behavioral signals to infer user mood and adjust coaching accordingly.
 *
 * Features:
 * - Real-time engagement tracking
 * - Fatigue detection from movement patterns
 * - Frustration detection from interaction patterns
 * - Motivation level assessment
 * - Session quality scoring
 * - Predictive mood modeling
 */

import { logger } from '../utils/logger';
import { eventBus } from './eventBus';

// ============================================================================
// TYPES
// ============================================================================

export type MoodState =
  | 'energetic'
  | 'focused'
  | 'neutral'
  | 'tired'
  | 'frustrated'
  | 'struggling'
  | 'disengaged'
  | 'motivated';

export type EngagementLevel = 'high' | 'medium' | 'low' | 'critical';

export type FatigueLevel = 'fresh' | 'normal' | 'tired' | 'exhausted';

export interface MoodSnapshot {
  timestamp: number;
  mood: MoodState;
  engagement: EngagementLevel;
  fatigue: FatigueLevel;
  confidence: number;
  signals: BehavioralSignals;
}

export interface BehavioralSignals {
  // Movement signals
  movementSpeed: number;           // 0-1, slower = more fatigue
  movementConsistency: number;     // 0-1, consistency of movement patterns
  pauseFrequency: number;          // Pauses per minute
  pauseDuration: number;           // Average pause duration
  rangeOfMotion: number;           // 0-1, compared to baseline

  // Interaction signals
  skipRate: number;                // How often exercises are skipped
  repeatRequests: number;          // Times user requested repeat
  timeOnExercise: number;          // Seconds spent per exercise
  restTimeUsed: number;            // Actual vs recommended rest time

  // Session signals
  sessionDuration: number;         // Minutes into session
  exercisesCompleted: number;      // Count of exercises done
  formQualityTrend: number;        // -1 to 1, declining to improving
  responseToFeedback: number;      // 0-1, how well user responds to corrections

  // Camera/video signals (if available)
  faceVisible: boolean;
  eyeContact: number;              // 0-1, looking at screen
  expressionScore: number;         // -1 to 1, frown to smile estimate
}

export interface MoodPrediction {
  predictedMood: MoodState;
  probability: number;
  timeToChange: number;            // Estimated seconds until mood change
  recommendedAction: CoachingAdjustment;
}

export interface CoachingAdjustment {
  style: 'maintain' | 'energize' | 'calm' | 'encourage' | 'simplify' | 'challenge';
  intensity: number;               // 0-1
  suggestedPhrases: string[];
  restRecommendation: 'none' | 'short' | 'extended' | 'end_session';
  exerciseModification: 'none' | 'simplify' | 'reduce_reps' | 'reduce_intensity';
}

export interface EngagementMetrics {
  overallScore: number;            // 0-100
  attentionSpan: number;           // Seconds of focused attention
  motivationIndex: number;         // 0-1
  persistenceRatio: number;        // Completed vs started exercises
  improvementRate: number;         // Rate of skill improvement
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MOOD_WEIGHTS = {
  movement: 0.3,
  interaction: 0.25,
  session: 0.25,
  expression: 0.2,
};

const MOOD_THRESHOLDS = {
  engagement: {
    high: 0.8,
    medium: 0.5,
    low: 0.3,
    critical: 0,
  },
  fatigue: {
    fresh: 0.8,
    normal: 0.5,
    tired: 0.3,
    exhausted: 0,
  },
};

const HISTORY_SIZE = 60; // Keep 60 snapshots (1 per second for a minute)

// ============================================================================
// MOOD DETECTION SERVICE
// ============================================================================

class MoodDetectionService {
  private moodHistory: MoodSnapshot[] = [];
  private currentSignals: BehavioralSignals = this.getDefaultSignals();
  private baselineSignals: BehavioralSignals | null = null;
  private sessionStartTime: number = Date.now();
  private listeners: Map<string, (mood: MoodSnapshot) => void> = new Map();

  // Kalman filter state for smoothing
  private kalmanState: Record<string, { value: number; uncertainty: number }> = {};

  constructor() {
    this.setupEventListeners();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private getDefaultSignals(): BehavioralSignals {
    return {
      movementSpeed: 0.7,
      movementConsistency: 0.7,
      pauseFrequency: 0,
      pauseDuration: 0,
      rangeOfMotion: 0.8,
      skipRate: 0,
      repeatRequests: 0,
      timeOnExercise: 60,
      restTimeUsed: 1.0,
      sessionDuration: 0,
      exercisesCompleted: 0,
      formQualityTrend: 0,
      responseToFeedback: 0.5,
      faceVisible: true,
      eyeContact: 0.7,
      expressionScore: 0.1,
    };
  }

  private setupEventListeners(): void {
    // Listen for pose updates
    eventBus.on('poseAnalysis:update', (data: { confidence: number; angles: Record<string, number> }) => {
      this.updateMovementSignals(data);
    });

    // Listen for exercise events
    eventBus.on('exercise:skip', () => {
      this.recordInteraction('skip');
    });

    eventBus.on('exercise:repeat', () => {
      this.recordInteraction('repeat');
    });

    eventBus.on('exercise:complete', () => {
      this.recordInteraction('complete');
    });

    // Listen for feedback response
    eventBus.on('feedback:applied', (data: { success: boolean }) => {
      this.recordFeedbackResponse(data.success);
    });
  }

  // --------------------------------------------------------------------------
  // SIGNAL COLLECTION
  // --------------------------------------------------------------------------

  /**
   * Update movement-related signals from pose data
   */
  public updateMovementSignals(data: {
    confidence: number;
    angles?: Record<string, number>;
    velocity?: number;
    jitter?: number;
  }): void {
    // Calculate movement speed from velocity
    if (data.velocity !== undefined) {
      this.currentSignals.movementSpeed = this.kalmanFilter('movementSpeed',
        Math.min(1, data.velocity / 100));
    }

    // Calculate consistency from jitter
    if (data.jitter !== undefined) {
      this.currentSignals.movementConsistency = this.kalmanFilter('movementConsistency',
        Math.max(0, 1 - data.jitter / 50));
    }

    // Update range of motion if angles provided
    if (data.angles) {
      const avgAngle = Object.values(data.angles).reduce((a, b) => a + b, 0) /
                      Object.keys(data.angles).length;
      this.currentSignals.rangeOfMotion = this.kalmanFilter('rangeOfMotion',
        Math.min(1, avgAngle / 90));
    }
  }

  /**
   * Record pause in movement
   */
  public recordPause(durationMs: number): void {
    const recentPauses = this.moodHistory.filter(
      s => s.timestamp > Date.now() - 60000
    ).map(s => s.signals.pauseFrequency);

    this.currentSignals.pauseFrequency = recentPauses.length + 1;
    this.currentSignals.pauseDuration =
      (this.currentSignals.pauseDuration * recentPauses.length + durationMs) /
      (recentPauses.length + 1);
  }

  /**
   * Record user interaction
   */
  public recordInteraction(type: 'skip' | 'repeat' | 'complete' | 'pause' | 'resume'): void {
    switch (type) {
      case 'skip':
        this.currentSignals.skipRate = Math.min(1, this.currentSignals.skipRate + 0.1);
        break;
      case 'repeat':
        this.currentSignals.repeatRequests++;
        break;
      case 'complete':
        this.currentSignals.exercisesCompleted++;
        this.currentSignals.skipRate = Math.max(0, this.currentSignals.skipRate - 0.05);
        break;
    }
  }

  /**
   * Record response to coaching feedback
   */
  public recordFeedbackResponse(successful: boolean): void {
    const current = this.currentSignals.responseToFeedback;
    this.currentSignals.responseToFeedback = successful
      ? Math.min(1, current + 0.1)
      : Math.max(0, current - 0.15);
  }

  /**
   * Update form quality trend
   */
  public updateFormQuality(score: number): void {
    const trend = score - 0.7; // 0.7 is baseline "good" form
    this.currentSignals.formQualityTrend = this.kalmanFilter('formQualityTrend',
      Math.max(-1, Math.min(1, trend * 2)));
  }

  /**
   * Update expression signals (from camera if available)
   */
  public updateExpressionSignals(data: {
    faceVisible?: boolean;
    eyeContact?: number;
    expressionScore?: number;
  }): void {
    if (data.faceVisible !== undefined) {
      this.currentSignals.faceVisible = data.faceVisible;
    }
    if (data.eyeContact !== undefined) {
      this.currentSignals.eyeContact = this.kalmanFilter('eyeContact', data.eyeContact);
    }
    if (data.expressionScore !== undefined) {
      this.currentSignals.expressionScore = this.kalmanFilter('expressionScore', data.expressionScore);
    }
  }

  // --------------------------------------------------------------------------
  // MOOD ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze current mood based on signals
   */
  public analyzeMood(): MoodSnapshot {
    const engagement = this.calculateEngagement();
    const fatigue = this.calculateFatigue();
    const mood = this.determineMood(engagement, fatigue);
    const confidence = this.calculateConfidence();

    // Update session duration
    this.currentSignals.sessionDuration = (Date.now() - this.sessionStartTime) / 60000;

    const snapshot: MoodSnapshot = {
      timestamp: Date.now(),
      mood,
      engagement,
      fatigue,
      confidence,
      signals: { ...this.currentSignals },
    };

    // Add to history
    this.moodHistory.push(snapshot);
    if (this.moodHistory.length > HISTORY_SIZE) {
      this.moodHistory.shift();
    }

    // Notify listeners
    this.notifyListeners(snapshot);

    return snapshot;
  }

  private calculateEngagement(): EngagementLevel {
    const signals = this.currentSignals;

    // Calculate engagement score
    const movementScore = signals.movementConsistency * 0.4 + signals.rangeOfMotion * 0.3 +
                         (1 - signals.pauseFrequency / 10) * 0.3;
    const interactionScore = (1 - signals.skipRate) * 0.5 + signals.responseToFeedback * 0.5;
    const attentionScore = signals.faceVisible ? signals.eyeContact : 0.5;

    const overall = movementScore * MOOD_WEIGHTS.movement +
                   interactionScore * MOOD_WEIGHTS.interaction +
                   attentionScore * MOOD_WEIGHTS.expression;

    if (overall >= MOOD_THRESHOLDS.engagement.high) return 'high';
    if (overall >= MOOD_THRESHOLDS.engagement.medium) return 'medium';
    if (overall >= MOOD_THRESHOLDS.engagement.low) return 'low';
    return 'critical';
  }

  private calculateFatigue(): FatigueLevel {
    const signals = this.currentSignals;

    // Session duration factor
    const durationFactor = Math.max(0, 1 - signals.sessionDuration / 45);

    // Movement indicators
    const speedFactor = signals.movementSpeed;
    const romFactor = signals.rangeOfMotion;

    // Compare to baseline if available
    let baselineComparison = 1;
    if (this.baselineSignals) {
      const currentAvg = (speedFactor + romFactor) / 2;
      const baselineAvg = (this.baselineSignals.movementSpeed + this.baselineSignals.rangeOfMotion) / 2;
      baselineComparison = currentAvg / Math.max(0.1, baselineAvg);
    }

    const overall = (speedFactor * 0.3 + romFactor * 0.3 + durationFactor * 0.2 +
                    baselineComparison * 0.2);

    if (overall >= MOOD_THRESHOLDS.fatigue.fresh) return 'fresh';
    if (overall >= MOOD_THRESHOLDS.fatigue.normal) return 'normal';
    if (overall >= MOOD_THRESHOLDS.fatigue.tired) return 'tired';
    return 'exhausted';
  }

  private determineMood(engagement: EngagementLevel, fatigue: FatigueLevel): MoodState {
    const signals = this.currentSignals;

    // Check for frustration indicators
    if (signals.skipRate > 0.3 && signals.repeatRequests > 2) {
      return 'frustrated';
    }

    // Check for struggling
    if (signals.formQualityTrend < -0.3 && signals.responseToFeedback < 0.4) {
      return 'struggling';
    }

    // Check for disengagement
    if (engagement === 'critical' || (engagement === 'low' && fatigue === 'exhausted')) {
      return 'disengaged';
    }

    // Check for energetic/motivated
    if (engagement === 'high' && fatigue === 'fresh') {
      if (signals.expressionScore > 0.3) return 'energetic';
      return 'motivated';
    }

    // Check for tired
    if (fatigue === 'tired' || fatigue === 'exhausted') {
      return 'tired';
    }

    // Check for focused
    if (engagement === 'high' || engagement === 'medium') {
      if (signals.formQualityTrend > 0) return 'focused';
    }

    return 'neutral';
  }

  private calculateConfidence(): number {
    // Confidence based on data quality
    let confidence = 0.5;

    // More history = more confidence
    confidence += Math.min(0.2, this.moodHistory.length / 30 * 0.2);

    // Face visible = more confidence
    if (this.currentSignals.faceVisible) {
      confidence += 0.15;
    }

    // Consistent signals = more confidence
    if (this.moodHistory.length >= 5) {
      const recentMoods = this.moodHistory.slice(-5).map(s => s.mood);
      const moodConsistency = recentMoods.filter(m => m === recentMoods[recentMoods.length - 1]).length / 5;
      confidence += moodConsistency * 0.15;
    }

    return Math.min(1, confidence);
  }

  // --------------------------------------------------------------------------
  // PREDICTIONS & RECOMMENDATIONS
  // --------------------------------------------------------------------------

  /**
   * Predict future mood changes
   */
  public predictMood(): MoodPrediction {
    const currentSnapshot = this.moodHistory[this.moodHistory.length - 1] || this.analyzeMood();
    const trends = this.calculateTrends();

    // Predict based on trends
    let predictedMood = currentSnapshot.mood;
    let timeToChange = 300; // Default 5 minutes
    let probability = 0.5;

    // Fatigue trend
    if (trends.fatigueTrend < -0.1) {
      if (currentSnapshot.fatigue === 'normal') {
        predictedMood = 'tired';
        timeToChange = 120;
        probability = 0.7;
      } else if (currentSnapshot.fatigue === 'tired') {
        predictedMood = 'disengaged';
        timeToChange = 60;
        probability = 0.8;
      }
    }

    // Engagement trend
    if (trends.engagementTrend < -0.15) {
      predictedMood = 'disengaged';
      timeToChange = 90;
      probability = 0.75;
    }

    // Form quality trend
    if (trends.formTrend < -0.2 && currentSnapshot.mood === 'focused') {
      predictedMood = 'struggling';
      timeToChange = 60;
      probability = 0.65;
    }

    return {
      predictedMood,
      probability,
      timeToChange,
      recommendedAction: this.getRecommendedAction(currentSnapshot, predictedMood),
    };
  }

  private calculateTrends(): { fatigueTrend: number; engagementTrend: number; formTrend: number } {
    if (this.moodHistory.length < 10) {
      return { fatigueTrend: 0, engagementTrend: 0, formTrend: 0 };
    }

    const recent = this.moodHistory.slice(-10);
    const older = this.moodHistory.slice(-20, -10);

    // Calculate fatigue trend
    const fatigueValues = { fresh: 1, normal: 0.7, tired: 0.4, exhausted: 0.1 };
    const recentFatigue = recent.reduce((sum, s) => sum + fatigueValues[s.fatigue], 0) / recent.length;
    const olderFatigue = older.length > 0
      ? older.reduce((sum, s) => sum + fatigueValues[s.fatigue], 0) / older.length
      : recentFatigue;
    const fatigueTrend = recentFatigue - olderFatigue;

    // Calculate engagement trend
    const engagementValues = { high: 1, medium: 0.7, low: 0.4, critical: 0.1 };
    const recentEngagement = recent.reduce((sum, s) => sum + engagementValues[s.engagement], 0) / recent.length;
    const olderEngagement = older.length > 0
      ? older.reduce((sum, s) => sum + engagementValues[s.engagement], 0) / older.length
      : recentEngagement;
    const engagementTrend = recentEngagement - olderEngagement;

    // Calculate form quality trend
    const recentForm = recent.reduce((sum, s) => sum + s.signals.formQualityTrend, 0) / recent.length;
    const olderForm = older.length > 0
      ? older.reduce((sum, s) => sum + s.signals.formQualityTrend, 0) / older.length
      : recentForm;
    const formTrend = recentForm - olderForm;

    return { fatigueTrend, engagementTrend, formTrend };
  }

  /**
   * Get recommended coaching adjustments
   */
  public getRecommendedAction(current: MoodSnapshot, predicted?: MoodState): CoachingAdjustment {
    const mood = current.mood;
    const fatigue = current.fatigue;

    // Default adjustment
    const adjustment: CoachingAdjustment = {
      style: 'maintain',
      intensity: 0.5,
      suggestedPhrases: [],
      restRecommendation: 'none',
      exerciseModification: 'none',
    };

    switch (mood) {
      case 'energetic':
      case 'motivated':
        adjustment.style = 'challenge';
        adjustment.intensity = 0.8;
        adjustment.suggestedPhrases = [
          'Du är i toppform! Kan vi öka lite?',
          'Fantastisk energi! Fortsätt så!',
          'Ska vi prova en svårare variant?',
        ];
        break;

      case 'focused':
        adjustment.style = 'maintain';
        adjustment.intensity = 0.6;
        adjustment.suggestedPhrases = [
          'Bra fokus, fortsätt precis så.',
          'Fint flyt, du gör det bra.',
        ];
        break;

      case 'tired':
        adjustment.style = 'encourage';
        adjustment.intensity = 0.4;
        adjustment.suggestedPhrases = [
          'Du gör bra ifrån dig, snart klar.',
          'Ta det lugnt, kvalitet före kvantitet.',
          'Känner du att du vill ta en kort paus?',
        ];
        adjustment.restRecommendation = 'short';
        if (fatigue === 'exhausted') {
          adjustment.exerciseModification = 'reduce_intensity';
          adjustment.restRecommendation = 'extended';
        }
        break;

      case 'frustrated':
        adjustment.style = 'calm';
        adjustment.intensity = 0.3;
        adjustment.suggestedPhrases = [
          'Det är okej, alla har svåra dagar.',
          'Låt oss förenkla detta steg för steg.',
          'Ingen stress, vi tar det i din takt.',
        ];
        adjustment.exerciseModification = 'simplify';
        adjustment.restRecommendation = 'short';
        break;

      case 'struggling':
        adjustment.style = 'simplify';
        adjustment.intensity = 0.4;
        adjustment.suggestedPhrases = [
          'Låt mig visa en enklare variant.',
          'Vi fokuserar på det viktigaste momentet.',
          'Steg för steg, du klarar detta.',
        ];
        adjustment.exerciseModification = 'simplify';
        break;

      case 'disengaged':
        adjustment.style = 'energize';
        adjustment.intensity = 0.6;
        adjustment.suggestedPhrases = [
          'Ska vi göra något roligare?',
          'Bara några övningar kvar!',
          'Vill du ta en kort paus och fortsätta sen?',
        ];
        adjustment.restRecommendation = 'short';
        if (fatigue === 'exhausted') {
          adjustment.suggestedPhrases = [
            'Du har jobbat hårt idag. Vill du avsluta här?',
            'Det är helt okej att ta det lugnt idag.',
          ];
          adjustment.restRecommendation = 'end_session';
        }
        break;

      default:
        adjustment.style = 'maintain';
        adjustment.intensity = 0.5;
        adjustment.suggestedPhrases = [
          'Bra jobbat, fortsätt så!',
          'Du gör framsteg!',
        ];
    }

    return adjustment;
  }

  // --------------------------------------------------------------------------
  // ENGAGEMENT METRICS
  // --------------------------------------------------------------------------

  /**
   * Get detailed engagement metrics for session
   */
  public getEngagementMetrics(): EngagementMetrics {
    const signals = this.currentSignals;

    // Overall score (0-100)
    const engagementScore = this.moodHistory.length > 0
      ? this.moodHistory.reduce((sum, s) => {
          const engVal = { high: 100, medium: 70, low: 40, critical: 10 }[s.engagement];
          return sum + engVal;
        }, 0) / this.moodHistory.length
      : 70;

    // Attention span (estimate from continuous high engagement periods)
    let maxContinuousHigh = 0;
    let currentHigh = 0;
    for (const snapshot of this.moodHistory) {
      if (snapshot.engagement === 'high') {
        currentHigh++;
        maxContinuousHigh = Math.max(maxContinuousHigh, currentHigh);
      } else {
        currentHigh = 0;
      }
    }
    const attentionSpan = maxContinuousHigh * (60000 / 1000); // Assuming 1 snapshot/sec

    // Motivation index
    const skipPenalty = signals.skipRate * 0.3;
    const completionBonus = signals.exercisesCompleted / Math.max(1, signals.exercisesCompleted + signals.skipRate * 10) * 0.4;
    const responsiveBonus = signals.responseToFeedback * 0.3;
    const motivationIndex = Math.min(1, Math.max(0, 0.5 + completionBonus + responsiveBonus - skipPenalty));

    // Persistence ratio
    const totalAttempts = signals.exercisesCompleted + Math.round(signals.skipRate * 10);
    const persistenceRatio = totalAttempts > 0 ? signals.exercisesCompleted / totalAttempts : 1;

    // Improvement rate
    const improvementRate = signals.formQualityTrend * 0.5 + 0.5; // Normalize to 0-1

    return {
      overallScore: Math.round(engagementScore),
      attentionSpan,
      motivationIndex,
      persistenceRatio,
      improvementRate,
    };
  }

  // --------------------------------------------------------------------------
  // UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Simple Kalman filter for signal smoothing
   */
  private kalmanFilter(key: string, measurement: number, Q = 0.1, R = 0.4): number {
    if (!this.kalmanState[key]) {
      this.kalmanState[key] = { value: measurement, uncertainty: 1 };
    }

    const state = this.kalmanState[key];

    // Prediction
    const predictedValue = state.value;
    const predictedUncertainty = state.uncertainty + Q;

    // Update
    const kalmanGain = predictedUncertainty / (predictedUncertainty + R);
    state.value = predictedValue + kalmanGain * (measurement - predictedValue);
    state.uncertainty = (1 - kalmanGain) * predictedUncertainty;

    return state.value;
  }

  /**
   * Set baseline signals for comparison
   */
  public setBaseline(): void {
    this.baselineSignals = { ...this.currentSignals };
    logger.info('[MoodDetection] Baseline set:', this.baselineSignals);
  }

  /**
   * Start new session
   */
  public startSession(): void {
    this.sessionStartTime = Date.now();
    this.moodHistory = [];
    this.currentSignals = this.getDefaultSignals();
    this.kalmanState = {};
    logger.info('[MoodDetection] Session started');
  }

  /**
   * Subscribe to mood changes
   */
  public subscribe(id: string, callback: (mood: MoodSnapshot) => void): void {
    this.listeners.set(id, callback);
  }

  /**
   * Unsubscribe from mood changes
   */
  public unsubscribe(id: string): void {
    this.listeners.delete(id);
  }

  private notifyListeners(snapshot: MoodSnapshot): void {
    this.listeners.forEach(callback => {
      try {
        callback(snapshot);
      } catch (error) {
        logger.error('[MoodDetection] Listener error:', error);
      }
    });
  }

  /**
   * Get mood history
   */
  public getHistory(): MoodSnapshot[] {
    return [...this.moodHistory];
  }

  /**
   * Get current mood
   */
  public getCurrentMood(): MoodSnapshot | null {
    return this.moodHistory[this.moodHistory.length - 1] || null;
  }

  /**
   * Get mood distribution for session
   */
  public getMoodDistribution(): Record<MoodState, number> {
    const distribution: Record<MoodState, number> = {
      energetic: 0,
      focused: 0,
      neutral: 0,
      tired: 0,
      frustrated: 0,
      struggling: 0,
      disengaged: 0,
      motivated: 0,
    };

    if (this.moodHistory.length === 0) return distribution;

    for (const snapshot of this.moodHistory) {
      distribution[snapshot.mood]++;
    }

    // Normalize to percentages
    const total = this.moodHistory.length;
    for (const mood in distribution) {
      distribution[mood as MoodState] = Math.round((distribution[mood as MoodState] / total) * 100);
    }

    return distribution;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const moodDetectionService = new MoodDetectionService();
export default moodDetectionService;
