/**
 * Emotional Intelligence Service
 *
 * FAS 10: Världsunika Funktioner - Emotionell AI-Coach
 *
 * Detekterar patientens emotionella tillstånd och anpassar coachingstil i realtid.
 *
 * Detektionsmetoder:
 * - Rörelsemönsteranalys (hesitation, agitation, frustration)
 * - Engagemangsmönster (tid mellan reps, avbrott, upprepade misslyckanden)
 * - Prestandatrend (förbättring/försämring över tid)
 * - Implicit feedback (pausar, hoppar över övningar)
 */

import { PoseLandmark } from './calibrationService';

// ============================================
// TYPES
// ============================================

export type EmotionalState =
  | 'CONFIDENT'      // Utför övningar med säkerhet
  | 'HESITANT'       // Tvekar, rör sig försiktigt
  | 'FRUSTRATED'     // Visar tecken på irritation
  | 'FATIGUED'       // Trött, prestandan sjunker
  | 'ANXIOUS'        // Nervös, orolig
  | 'MOTIVATED'      // Engagerad och driven
  | 'BORED'          // Tappar intresse
  | 'PAIN_GUARDING'  // Skyddar sig mot smärta
  | 'NEUTRAL';       // Ingen tydlig signal

export type CoachingStyle =
  | 'ENCOURAGING'    // Patienten verkar nedslagen
  | 'CHALLENGING'    // Patienten verkar uttråkad
  | 'CALMING'        // Patienten verkar stressad/frustrerad
  | 'CELEBRATORY'    // Patienten har uppnått milestone
  | 'SUPPORTIVE'     // Patienten har smärta/obehag
  | 'INSTRUCTIVE'    // Patienten behöver vägledning
  | 'MOTIVATING';    // Patienten behöver push

export interface EmotionalIndicators {
  movementHesitation: number;      // 0-100: Hur tveksamma rörelserna är
  movementFluidity: number;        // 0-100: Hur flytande rörelserna är
  engagementLevel: number;         // 0-100: Engagemangsnivå
  frustrationSignals: number;      // 0-100: Frustrationsindikatorer
  fatigueLevel: number;            // 0-100: Utmattningsnivå
  painGuardingLevel: number;       // 0-100: Smärtskyddande beteende
  confidenceLevel: number;         // 0-100: Självsäkerhetsnivå
}

export interface EmotionalAnalysis {
  primaryState: EmotionalState;
  secondaryState: EmotionalState | null;
  confidence: number;              // 0-100: Säkerhet i bedömningen
  indicators: EmotionalIndicators;
  recommendedStyle: CoachingStyle;
  adaptedFeedback: AdaptedFeedback;
  timestamp: number;
}

export interface AdaptedFeedback {
  tone: 'warm' | 'neutral' | 'energetic' | 'calm';
  verbosity: 'minimal' | 'moderate' | 'detailed';
  encouragementLevel: 'low' | 'medium' | 'high';
  paceAdjustment: 'slower' | 'normal' | 'faster';
  breakSuggestion: boolean;
  motivationalMessage?: string;
}

interface MovementPattern {
  timestamp: number;
  velocity: number;
  acceleration: number;
  jerk: number;           // Rate of change of acceleration
  smoothness: number;
  hesitationScore: number;
}

interface EngagementData {
  timeBetweenReps: number[];
  pauseDurations: number[];
  exerciseSkips: number;
  incompleteSets: number;
  repeatAttempts: number;
  sessionDuration: number;
  activeTime: number;
}

// ============================================
// STATE MANAGEMENT
// ============================================

class EmotionalStateTracker {
  private movementHistory: MovementPattern[] = [];
  private engagementData: EngagementData = {
    timeBetweenReps: [],
    pauseDurations: [],
    exerciseSkips: 0,
    incompleteSets: 0,
    repeatAttempts: 0,
    sessionDuration: 0,
    activeTime: 0,
  };
  private previousLandmarks: PoseLandmark[] | null = null;
  private previousTimestamp: number = 0;
  private repStartTime: number = 0;
  private lastRepEndTime: number = 0;
  private consecutiveFailures: number = 0;
  private sessionStartTime: number = 0;
  private stateHistory: EmotionalState[] = [];

  // Buffer for smoothing emotional state changes
  private readonly STATE_HISTORY_SIZE = 10;
  private readonly MOVEMENT_HISTORY_SIZE = 30; // ~1 second at 30fps

  constructor() {
    this.sessionStartTime = Date.now();
  }

  /**
   * Update movement data from pose landmarks
   */
  updateMovement(landmarks: PoseLandmark[], timestamp: number): void {
    if (!this.previousLandmarks || landmarks.length !== this.previousLandmarks.length) {
      this.previousLandmarks = landmarks;
      this.previousTimestamp = timestamp;
      return;
    }

    const dt = (timestamp - this.previousTimestamp) / 1000; // seconds
    if (dt <= 0) return;

    // Calculate movement metrics for key joints
    const velocity = this.calculateOverallVelocity(landmarks, this.previousLandmarks, dt);
    const acceleration = this.movementHistory.length > 0
      ? (velocity - this.movementHistory[this.movementHistory.length - 1].velocity) / dt
      : 0;
    const jerk = this.movementHistory.length > 1
      ? (acceleration - this.movementHistory[this.movementHistory.length - 1].acceleration) / dt
      : 0;
    const smoothness = this.calculateSmoothnessScore(jerk);
    const hesitationScore = this.calculateHesitationScore(velocity, acceleration);

    const pattern: MovementPattern = {
      timestamp,
      velocity,
      acceleration,
      jerk,
      smoothness,
      hesitationScore,
    };

    this.movementHistory.push(pattern);
    if (this.movementHistory.length > this.MOVEMENT_HISTORY_SIZE) {
      this.movementHistory.shift();
    }

    this.previousLandmarks = landmarks;
    this.previousTimestamp = timestamp;
  }

  /**
   * Record rep timing for engagement analysis
   */
  recordRepCompletion(success: boolean): void {
    const now = Date.now();

    if (this.lastRepEndTime > 0) {
      const timeBetween = now - this.lastRepEndTime;
      this.engagementData.timeBetweenReps.push(timeBetween);

      // Keep only recent data
      if (this.engagementData.timeBetweenReps.length > 20) {
        this.engagementData.timeBetweenReps.shift();
      }
    }

    if (success) {
      this.consecutiveFailures = 0;
    } else {
      this.consecutiveFailures++;
      this.engagementData.repeatAttempts++;
    }

    this.lastRepEndTime = now;
    this.repStartTime = now;
  }

  /**
   * Record a pause in activity
   */
  recordPause(durationMs: number): void {
    this.engagementData.pauseDurations.push(durationMs);
    if (this.engagementData.pauseDurations.length > 10) {
      this.engagementData.pauseDurations.shift();
    }
  }

  /**
   * Record an exercise skip
   */
  recordExerciseSkip(): void {
    this.engagementData.exerciseSkips++;
  }

  /**
   * Record an incomplete set
   */
  recordIncompleteSet(): void {
    this.engagementData.incompleteSets++;
  }

  /**
   * Update state history for temporal smoothing
   */
  updateStateHistory(state: EmotionalState): void {
    this.stateHistory.push(state);
    if (this.stateHistory.length > this.STATE_HISTORY_SIZE) {
      this.stateHistory.shift();
    }
  }

  /**
   * Get smoothed emotional state (most frequent in recent history)
   */
  getSmoothedState(): EmotionalState {
    if (this.stateHistory.length === 0) return 'NEUTRAL';

    const counts = new Map<EmotionalState, number>();
    for (const state of this.stateHistory) {
      counts.set(state, (counts.get(state) || 0) + 1);
    }

    let maxCount = 0;
    let dominantState: EmotionalState = 'NEUTRAL';
    counts.forEach((count, state) => {
      if (count > maxCount) {
        maxCount = count;
        dominantState = state;
      }
    });

    return dominantState;
  }

  // ---- Private Helper Methods ----

  private calculateOverallVelocity(
    current: PoseLandmark[],
    previous: PoseLandmark[],
    dt: number
  ): number {
    // Key joints: shoulders, hips, wrists, ankles
    const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    let totalVelocity = 0;
    let count = 0;

    for (const idx of keyIndices) {
      if (current[idx] && previous[idx]) {
        const dx = current[idx].x - previous[idx].x;
        const dy = current[idx].y - previous[idx].y;
        const dz = (current[idx].z || 0) - (previous[idx].z || 0);
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        totalVelocity += distance / dt;
        count++;
      }
    }

    return count > 0 ? totalVelocity / count : 0;
  }

  private calculateSmoothnessScore(jerk: number): number {
    // Lower jerk = smoother movement = higher score
    // Normalize jerk to 0-100 scale (inverted)
    const normalizedJerk = Math.min(Math.abs(jerk) * 100, 100);
    return 100 - normalizedJerk;
  }

  private calculateHesitationScore(velocity: number, acceleration: number): number {
    // Hesitation: low velocity + frequent direction changes (acceleration sign changes)
    const lowVelocityScore = velocity < 0.05 ? 50 : 0;
    const directionChangeScore = Math.abs(acceleration) > 0.1 && velocity < 0.1 ? 30 : 0;

    // Check for "stuck" pattern in recent history
    const recentLowVelocity = this.movementHistory
      .slice(-10)
      .filter(m => m.velocity < 0.05).length;
    const stuckScore = (recentLowVelocity / 10) * 20;

    return Math.min(lowVelocityScore + directionChangeScore + stuckScore, 100);
  }

  // ---- Public Getters ----

  getMovementIndicators(): { hesitation: number; fluidity: number } {
    if (this.movementHistory.length === 0) {
      return { hesitation: 0, fluidity: 100 };
    }

    const avgHesitation = this.movementHistory.reduce((sum, m) => sum + m.hesitationScore, 0)
      / this.movementHistory.length;
    const avgSmoothness = this.movementHistory.reduce((sum, m) => sum + m.smoothness, 0)
      / this.movementHistory.length;

    return {
      hesitation: avgHesitation,
      fluidity: avgSmoothness,
    };
  }

  getEngagementIndicators(): { level: number; frustration: number } {
    const { timeBetweenReps, pauseDurations, exerciseSkips, incompleteSets, repeatAttempts } = this.engagementData;

    // Calculate engagement score
    let engagementPenalty = 0;

    // Long pauses between reps = lower engagement
    if (timeBetweenReps.length > 0) {
      const avgTimeBetween = timeBetweenReps.reduce((a, b) => a + b, 0) / timeBetweenReps.length;
      if (avgTimeBetween > 10000) engagementPenalty += 30; // >10s average
      else if (avgTimeBetween > 5000) engagementPenalty += 15; // >5s average
    }

    // Frequent long pauses
    const longPauses = pauseDurations.filter(d => d > 30000).length;
    engagementPenalty += longPauses * 10;

    // Exercise skips and incomplete sets
    engagementPenalty += exerciseSkips * 15;
    engagementPenalty += incompleteSets * 10;

    // Calculate frustration score
    let frustrationScore = 0;

    // Consecutive failures
    frustrationScore += Math.min(this.consecutiveFailures * 20, 60);

    // Many repeat attempts
    frustrationScore += Math.min(repeatAttempts * 5, 40);

    // Increasing pause times (sign of giving up)
    if (pauseDurations.length >= 3) {
      const trend = this.calculateTrend(pauseDurations.slice(-3));
      if (trend > 0) frustrationScore += 20;
    }

    return {
      level: Math.max(0, 100 - engagementPenalty),
      frustration: Math.min(frustrationScore, 100),
    };
  }

  getFatigueIndicators(): number {
    // Fatigue indicators:
    // 1. Decreasing movement velocity over time
    // 2. Increasing time between reps
    // 3. Decreasing smoothness

    if (this.movementHistory.length < 10) return 0;

    const recentVelocities = this.movementHistory.slice(-10).map(m => m.velocity);
    const velocityTrend = this.calculateTrend(recentVelocities);

    const recentSmoothness = this.movementHistory.slice(-10).map(m => m.smoothness);
    const smoothnessTrend = this.calculateTrend(recentSmoothness);

    let fatigueScore = 0;

    // Declining velocity
    if (velocityTrend < -0.01) fatigueScore += 40;
    else if (velocityTrend < 0) fatigueScore += 20;

    // Declining smoothness
    if (smoothnessTrend < -1) fatigueScore += 30;
    else if (smoothnessTrend < 0) fatigueScore += 15;

    // Session duration factor
    const sessionMinutes = (Date.now() - this.sessionStartTime) / 60000;
    if (sessionMinutes > 30) fatigueScore += 20;
    else if (sessionMinutes > 20) fatigueScore += 10;

    return Math.min(fatigueScore, 100);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  reset(): void {
    this.movementHistory = [];
    this.engagementData = {
      timeBetweenReps: [],
      pauseDurations: [],
      exerciseSkips: 0,
      incompleteSets: 0,
      repeatAttempts: 0,
      sessionDuration: 0,
      activeTime: 0,
    };
    this.previousLandmarks = null;
    this.previousTimestamp = 0;
    this.consecutiveFailures = 0;
    this.stateHistory = [];
    this.sessionStartTime = Date.now();
  }
}

// ============================================
// MAIN SERVICE
// ============================================

class EmotionalIntelligenceService {
  private tracker: EmotionalStateTracker;
  private lastAnalysis: EmotionalAnalysis | null = null;
  private analysisInterval: number = 500; // Analyze every 500ms
  private lastAnalysisTime: number = 0;

  constructor() {
    this.tracker = new EmotionalStateTracker();
  }

  /**
   * Update with new pose data
   */
  updatePose(landmarks: PoseLandmark[]): void {
    this.tracker.updateMovement(landmarks, Date.now());
  }

  /**
   * Record rep completion for engagement tracking
   */
  recordRep(success: boolean): void {
    this.tracker.recordRepCompletion(success);
  }

  /**
   * Record a pause
   */
  recordPause(durationMs: number): void {
    this.tracker.recordPause(durationMs);
  }

  /**
   * Record exercise skip
   */
  recordSkip(): void {
    this.tracker.recordExerciseSkip();
  }

  /**
   * Record incomplete set
   */
  recordIncomplete(): void {
    this.tracker.recordIncompleteSet();
  }

  /**
   * Analyze current emotional state
   */
  analyzeEmotionalState(): EmotionalAnalysis {
    const now = Date.now();

    // Return cached analysis if too soon
    if (this.lastAnalysis && now - this.lastAnalysisTime < this.analysisInterval) {
      return this.lastAnalysis;
    }

    const movementIndicators = this.tracker.getMovementIndicators();
    const engagementIndicators = this.tracker.getEngagementIndicators();
    const fatigueLevel = this.tracker.getFatigueIndicators();

    // Build indicators object
    const indicators: EmotionalIndicators = {
      movementHesitation: movementIndicators.hesitation,
      movementFluidity: movementIndicators.fluidity,
      engagementLevel: engagementIndicators.level,
      frustrationSignals: engagementIndicators.frustration,
      fatigueLevel,
      painGuardingLevel: this.detectPainGuarding(movementIndicators),
      confidenceLevel: this.calculateConfidence(movementIndicators, engagementIndicators),
    };

    // Determine primary emotional state
    const { primaryState, secondaryState, confidence } = this.determineEmotionalState(indicators);

    // Update tracker history for smoothing
    this.tracker.updateStateHistory(primaryState);

    // Get smoothed state
    const smoothedState = this.tracker.getSmoothedState();

    // Determine recommended coaching style
    const recommendedStyle = this.determineCoachingStyle(smoothedState, indicators);

    // Generate adapted feedback parameters
    const adaptedFeedback = this.generateAdaptedFeedback(smoothedState, indicators);

    const analysis: EmotionalAnalysis = {
      primaryState: smoothedState,
      secondaryState,
      confidence,
      indicators,
      recommendedStyle,
      adaptedFeedback,
      timestamp: now,
    };

    this.lastAnalysis = analysis;
    this.lastAnalysisTime = now;

    return analysis;
  }

  /**
   * Get coaching message adapted to current emotional state
   */
  getAdaptedMessage(
    baseMessage: string,
    context: { isCorrection?: boolean; isEncouragement?: boolean; isMilestone?: boolean }
  ): string {
    const analysis = this.analyzeEmotionalState();
    const { primaryState, adaptedFeedback } = analysis;

    // Adapt message based on emotional state
    let adaptedMessage = baseMessage;

    if (context.isCorrection) {
      adaptedMessage = this.adaptCorrectionMessage(baseMessage, primaryState, adaptedFeedback);
    } else if (context.isEncouragement) {
      adaptedMessage = this.adaptEncouragementMessage(baseMessage, primaryState, adaptedFeedback);
    } else if (context.isMilestone) {
      adaptedMessage = this.adaptMilestoneMessage(baseMessage, primaryState);
    }

    // Add motivational suffix if needed
    if (adaptedFeedback.motivationalMessage) {
      adaptedMessage += ` ${adaptedFeedback.motivationalMessage}`;
    }

    return adaptedMessage;
  }

  /**
   * Check if a break should be suggested
   */
  shouldSuggestBreak(): { suggest: boolean; reason: string } {
    const analysis = this.analyzeEmotionalState();

    if (analysis.indicators.fatigueLevel > 70) {
      return { suggest: true, reason: 'Du verkar trött. En kort paus kan hjälpa!' };
    }

    if (analysis.indicators.frustrationSignals > 80) {
      return { suggest: true, reason: 'Låt oss ta en paus och börja om med ny energi.' };
    }

    if (analysis.primaryState === 'ANXIOUS' && analysis.confidence > 70) {
      return { suggest: true, reason: 'Ta ett djupt andetag. Du gör det bra!' };
    }

    return { suggest: false, reason: '' };
  }

  /**
   * Get current indicators for UI display
   */
  getCurrentIndicators(): EmotionalIndicators {
    return this.lastAnalysis?.indicators || {
      movementHesitation: 0,
      movementFluidity: 100,
      engagementLevel: 100,
      frustrationSignals: 0,
      fatigueLevel: 0,
      painGuardingLevel: 0,
      confidenceLevel: 100,
    };
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.tracker.reset();
    this.lastAnalysis = null;
    this.lastAnalysisTime = 0;
  }

  // ---- Private Helper Methods ----

  private detectPainGuarding(movement: { hesitation: number; fluidity: number }): number {
    // Pain guarding: high hesitation + asymmetric movement + protective postures
    // Simplified: high hesitation with low fluidity
    if (movement.hesitation > 60 && movement.fluidity < 40) {
      return Math.min((movement.hesitation - 60) * 2 + (40 - movement.fluidity), 100);
    }
    return 0;
  }

  private calculateConfidence(
    movement: { hesitation: number; fluidity: number },
    engagement: { level: number; frustration: number }
  ): number {
    // High fluidity + high engagement + low hesitation = confident
    const fluidityContribution = movement.fluidity * 0.3;
    const hesitationPenalty = movement.hesitation * 0.3;
    const engagementContribution = engagement.level * 0.3;
    const frustrationPenalty = engagement.frustration * 0.1;

    return Math.max(0, Math.min(100,
      fluidityContribution - hesitationPenalty + engagementContribution - frustrationPenalty + 50
    ));
  }

  private determineEmotionalState(indicators: EmotionalIndicators): {
    primaryState: EmotionalState;
    secondaryState: EmotionalState | null;
    confidence: number;
  } {
    const states: Array<{ state: EmotionalState; score: number }> = [];

    // PAIN_GUARDING: High pain guarding level
    if (indicators.painGuardingLevel > 50) {
      states.push({ state: 'PAIN_GUARDING', score: indicators.painGuardingLevel });
    }

    // FRUSTRATED: High frustration + low engagement
    if (indicators.frustrationSignals > 60) {
      states.push({ state: 'FRUSTRATED', score: indicators.frustrationSignals });
    }

    // FATIGUED: High fatigue level
    if (indicators.fatigueLevel > 50) {
      states.push({ state: 'FATIGUED', score: indicators.fatigueLevel });
    }

    // HESITANT: High hesitation + low confidence
    if (indicators.movementHesitation > 50 && indicators.confidenceLevel < 50) {
      states.push({ state: 'HESITANT', score: indicators.movementHesitation });
    }

    // ANXIOUS: High hesitation + not pain guarding
    if (indicators.movementHesitation > 60 && indicators.painGuardingLevel < 30) {
      states.push({ state: 'ANXIOUS', score: indicators.movementHesitation * 0.8 });
    }

    // BORED: Low engagement + high fluidity (doing it mechanically)
    if (indicators.engagementLevel < 40 && indicators.movementFluidity > 70) {
      states.push({ state: 'BORED', score: 100 - indicators.engagementLevel });
    }

    // CONFIDENT: High fluidity + high confidence + high engagement
    if (indicators.movementFluidity > 70 && indicators.confidenceLevel > 70 && indicators.engagementLevel > 60) {
      states.push({ state: 'CONFIDENT', score: (indicators.movementFluidity + indicators.confidenceLevel) / 2 });
    }

    // MOTIVATED: High engagement + good movement quality
    if (indicators.engagementLevel > 70 && indicators.movementFluidity > 60) {
      states.push({ state: 'MOTIVATED', score: indicators.engagementLevel });
    }

    // Sort by score
    states.sort((a, b) => b.score - a.score);

    if (states.length === 0) {
      return { primaryState: 'NEUTRAL', secondaryState: null, confidence: 50 };
    }

    const primary = states[0];
    const secondary = states.length > 1 ? states[1] : null;

    return {
      primaryState: primary.state,
      secondaryState: secondary ? secondary.state : null,
      confidence: Math.min(primary.score, 100),
    };
  }

  private determineCoachingStyle(state: EmotionalState, indicators: EmotionalIndicators): CoachingStyle {
    switch (state) {
      case 'FRUSTRATED':
        return 'CALMING';
      case 'HESITANT':
      case 'ANXIOUS':
        return 'SUPPORTIVE';
      case 'FATIGUED':
        return 'ENCOURAGING';
      case 'BORED':
        return 'CHALLENGING';
      case 'CONFIDENT':
      case 'MOTIVATED':
        return indicators.engagementLevel > 80 ? 'CHALLENGING' : 'MOTIVATING';
      case 'PAIN_GUARDING':
        return 'SUPPORTIVE';
      default:
        return 'INSTRUCTIVE';
    }
  }

  private generateAdaptedFeedback(state: EmotionalState, indicators: EmotionalIndicators): AdaptedFeedback {
    const feedback: AdaptedFeedback = {
      tone: 'neutral',
      verbosity: 'moderate',
      encouragementLevel: 'medium',
      paceAdjustment: 'normal',
      breakSuggestion: false,
    };

    switch (state) {
      case 'FRUSTRATED':
        feedback.tone = 'calm';
        feedback.verbosity = 'minimal';
        feedback.encouragementLevel = 'high';
        feedback.breakSuggestion = indicators.frustrationSignals > 80;
        feedback.motivationalMessage = 'Du gör framsteg, även om det inte alltid känns så.';
        break;

      case 'HESITANT':
      case 'ANXIOUS':
        feedback.tone = 'warm';
        feedback.verbosity = 'detailed';
        feedback.encouragementLevel = 'high';
        feedback.paceAdjustment = 'slower';
        feedback.motivationalMessage = 'Ta den tid du behöver. Säkerhet först!';
        break;

      case 'FATIGUED':
        feedback.tone = 'calm';
        feedback.verbosity = 'minimal';
        feedback.encouragementLevel = 'medium';
        feedback.paceAdjustment = 'slower';
        feedback.breakSuggestion = indicators.fatigueLevel > 70;
        feedback.motivationalMessage = 'Du har jobbat hårt idag.';
        break;

      case 'BORED':
        feedback.tone = 'energetic';
        feedback.verbosity = 'minimal';
        feedback.encouragementLevel = 'low';
        feedback.paceAdjustment = 'faster';
        feedback.motivationalMessage = 'Låt oss öka tempot lite!';
        break;

      case 'CONFIDENT':
      case 'MOTIVATED':
        feedback.tone = 'energetic';
        feedback.verbosity = 'minimal';
        feedback.encouragementLevel = 'medium';
        feedback.paceAdjustment = 'normal';
        break;

      case 'PAIN_GUARDING':
        feedback.tone = 'warm';
        feedback.verbosity = 'detailed';
        feedback.encouragementLevel = 'high';
        feedback.paceAdjustment = 'slower';
        feedback.breakSuggestion = true;
        feedback.motivationalMessage = 'Lyssna på din kropp. Det är okej att ta det lugnt.';
        break;
    }

    return feedback;
  }

  private adaptCorrectionMessage(
    baseMessage: string,
    state: EmotionalState,
    feedback: AdaptedFeedback
  ): string {
    // Soften corrections for frustrated/anxious patients
    if (state === 'FRUSTRATED' || state === 'ANXIOUS') {
      const softeners = ['Försök ', 'Tänk på att ', 'Tips: '];
      const softener = softeners[Math.floor(Math.random() * softeners.length)];
      return softener + baseMessage.toLowerCase();
    }

    // More direct for confident/motivated patients
    if (state === 'CONFIDENT' || state === 'MOTIVATED') {
      return baseMessage;
    }

    // Encouraging wrapper for hesitant patients
    if (state === 'HESITANT') {
      return `Du är på rätt väg! ${baseMessage}`;
    }

    return baseMessage;
  }

  private adaptEncouragementMessage(
    baseMessage: string,
    state: EmotionalState,
    feedback: AdaptedFeedback
  ): string {
    // Extra enthusiasm for fatigued patients
    if (state === 'FATIGUED') {
      return `${baseMessage} Du kämpar på fantastiskt!`;
    }

    // Calming tone for anxious patients
    if (state === 'ANXIOUS') {
      return `${baseMessage} Du gör det bra, fortsätt så.`;
    }

    // Challenge for bored patients
    if (state === 'BORED') {
      return `${baseMessage} Nästa nivå väntar!`;
    }

    return baseMessage;
  }

  private adaptMilestoneMessage(baseMessage: string, state: EmotionalState): string {
    // Extra celebration for patients who struggled
    if (state === 'FRUSTRATED' || state === 'HESITANT') {
      return `🎉 ${baseMessage} Du har verkligen kämpat för detta!`;
    }

    return `🎉 ${baseMessage}`;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const emotionalIntelligenceService = new EmotionalIntelligenceService();

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get emoji for emotional state (for UI)
 */
export function getEmotionalStateEmoji(state: EmotionalState): string {
  const emojis: Record<EmotionalState, string> = {
    CONFIDENT: '💪',
    HESITANT: '🤔',
    FRUSTRATED: '😤',
    FATIGUED: '😮‍💨',
    ANXIOUS: '😰',
    MOTIVATED: '🔥',
    BORED: '😐',
    PAIN_GUARDING: '🤕',
    NEUTRAL: '😊',
  };
  return emojis[state] || '😊';
}

/**
 * Get Swedish description of emotional state
 */
export function getEmotionalStateDescription(state: EmotionalState): string {
  const descriptions: Record<EmotionalState, string> = {
    CONFIDENT: 'Självsäker',
    HESITANT: 'Tveksam',
    FRUSTRATED: 'Frustrerad',
    FATIGUED: 'Trött',
    ANXIOUS: 'Orolig',
    MOTIVATED: 'Motiverad',
    BORED: 'Uttråkad',
    PAIN_GUARDING: 'Smärtpåverkad',
    NEUTRAL: 'Neutral',
  };
  return descriptions[state] || 'Neutral';
}

/**
 * Get color for emotional state (for UI visualization)
 */
export function getEmotionalStateColor(state: EmotionalState): string {
  const colors: Record<EmotionalState, string> = {
    CONFIDENT: '#22c55e',    // green
    HESITANT: '#f59e0b',     // amber
    FRUSTRATED: '#ef4444',   // red
    FATIGUED: '#6b7280',     // gray
    ANXIOUS: '#f97316',      // orange
    MOTIVATED: '#3b82f6',    // blue
    BORED: '#9ca3af',        // gray
    PAIN_GUARDING: '#dc2626', // dark red
    NEUTRAL: '#64748b',      // slate
  };
  return colors[state] || '#64748b';
}
