/**
 * Coaching Session Orchestrator - Sprint 5.6
 *
 * World-class integration layer that orchestrates all coaching components:
 * - 3D Avatar animation and expressions
 * - Voice synthesis with prosody
 * - Mood detection and adaptation
 * - Real-time feedback generation
 * - Exercise flow management
 *
 * This is the brain of the coaching system, coordinating all services
 * to create a seamless, personalized rehabilitation experience.
 */

import { logger } from '../utils/logger';
import { eventBus, emitPhaseChange, emitAnimationProgress } from './eventBus';
import { speechService, SpeechOptions } from './speechService';
import { moodDetectionService, MoodSnapshot, CoachingAdjustment } from './moodDetectionService';
import {
  worldClassCoachService,
  CoachingFeedback,
  CoachingStyle,
  AvatarState,
  FormAnalysis,
  UserContext,
} from './worldClassCoachService';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionConfig {
  userId: string;
  exerciseProgram: ExerciseProgramConfig;
  preferences: SessionPreferences;
  userProfile: UserProfile;
}

export interface ExerciseProgramConfig {
  id: string;
  name: string;
  exercises: ExerciseConfig[];
  targetDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExerciseConfig {
  id: string;
  name: string;
  type: string;
  sets: number;
  reps: number;
  holdTime?: number; // seconds for static exercises
  restTime: number; // seconds between sets
  targetAngles?: Record<string, number>;
  instructions: string[];
}

export interface SessionPreferences {
  voiceEnabled: boolean;
  voiceSpeed: number;
  coachingStyle: CoachingStyle;
  motivationLevel: 'minimal' | 'moderate' | 'high';
  language: 'sv' | 'en';
  hapticFeedback: boolean;
  visualCues: boolean;
}

export interface UserProfile {
  name: string;
  fitnessLevel: number; // 0-1
  injuryHistory: string[];
  preferredPace: 'slow' | 'normal' | 'fast';
  lastSessionDate?: Date;
  streakDays: number;
}

export interface SessionState {
  status: 'idle' | 'preparing' | 'active' | 'paused' | 'completing' | 'completed';
  currentExerciseIndex: number;
  currentSet: number;
  currentRep: number;
  phase: ExercisePhase;
  startTime: number;
  pausedTime: number;
  totalPausedDuration: number;
  exercisesCompleted: number;
  totalScore: number;
  feedbackHistory: CoachingFeedback[];
  moodHistory: MoodSnapshot[];
}

export type ExercisePhase = 'intro' | 'preparation' | 'execution' | 'hold' | 'return' | 'rest' | 'transition';

export interface SessionResult {
  sessionId: string;
  duration: number;
  exercisesCompleted: number;
  totalExercises: number;
  averageFormScore: number;
  moodSummary: Record<string, number>;
  feedbackGiven: number;
  correctionsApplied: number;
  highlights: SessionHighlight[];
  recommendations: string[];
}

export interface SessionHighlight {
  type: 'achievement' | 'improvement' | 'streak' | 'personal_best';
  title: string;
  description: string;
  timestamp: number;
}

export interface OrchestratorCallbacks {
  onStateChange?: (state: SessionState) => void;
  onAvatarUpdate?: (state: AvatarState) => void;
  onFeedback?: (feedback: CoachingFeedback) => void;
  onMoodChange?: (mood: MoodSnapshot) => void;
  onExerciseChange?: (exercise: ExerciseConfig, index: number) => void;
  onSessionComplete?: (result: SessionResult) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// SESSION ORCHESTRATOR
// ============================================================================

class CoachingSessionOrchestrator {
  private config: SessionConfig | null = null;
  private state: SessionState = this.getInitialState();
  private callbacks: OrchestratorCallbacks = {};
  private feedbackQueue: CoachingFeedback[] = [];
  private isProcessingFeedback = false;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private moodAnalysisInterval: ReturnType<typeof setInterval> | null = null;
  private sessionId: string = '';

  constructor() {
    this.setupEventListeners();
  }

  private getInitialState(): SessionState {
    return {
      status: 'idle',
      currentExerciseIndex: 0,
      currentSet: 1,
      currentRep: 0,
      phase: 'intro',
      startTime: 0,
      pausedTime: 0,
      totalPausedDuration: 0,
      exercisesCompleted: 0,
      totalScore: 0,
      feedbackHistory: [],
      moodHistory: [],
    };
  }

  private setupEventListeners(): void {
    // Listen for pose analysis updates
    eventBus.on('poseAnalysis:update', (data: FormAnalysis) => {
      this.handleFormUpdate(data);
    });

    // Listen for phase completion signals
    eventBus.on('phase:complete', (phase: ExercisePhase) => {
      this.handlePhaseComplete(phase);
    });

    // Listen for user interactions
    eventBus.on('user:pause', () => this.pauseSession());
    eventBus.on('user:resume', () => this.resumeSession());
    eventBus.on('user:skip', () => this.skipExercise());
    eventBus.on('user:repeat', () => this.repeatInstruction());
  }

  // --------------------------------------------------------------------------
  // SESSION LIFECYCLE
  // --------------------------------------------------------------------------

  /**
   * Initialize a new coaching session
   */
  public async initSession(config: SessionConfig, callbacks: OrchestratorCallbacks = {}): Promise<void> {
    logger.info('[Orchestrator] Initializing session:', config.exerciseProgram.name);

    this.config = config;
    this.callbacks = callbacks;
    this.state = this.getInitialState();
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.feedbackQueue = [];

    // Initialize coaching intelligence
    worldClassCoachService.setCoachingStyle(config.preferences.coachingStyle);

    // Initialize mood detection
    moodDetectionService.startSession();
    moodDetectionService.subscribe('orchestrator', (mood) => {
      this.handleMoodUpdate(mood);
    });

    // Update state
    this.state.status = 'preparing';
    this.notifyStateChange();

    // Speak welcome message
    if (config.preferences.voiceEnabled) {
      await this.speakWelcome();
    }

    logger.info('[Orchestrator] Session initialized:', this.sessionId);
  }

  /**
   * Start the coaching session
   */
  public async startSession(): Promise<void> {
    if (!this.config || this.state.status !== 'preparing') {
      logger.warn('[Orchestrator] Cannot start session - not prepared');
      return;
    }

    logger.info('[Orchestrator] Starting session');

    this.state.status = 'active';
    this.state.startTime = Date.now();
    this.notifyStateChange();

    // Start mood analysis loop
    this.moodAnalysisInterval = setInterval(() => {
      const mood = moodDetectionService.analyzeMood();
      this.state.moodHistory.push(mood);
    }, 1000);

    // Set baseline after first few seconds
    setTimeout(() => moodDetectionService.setBaseline(), 5000);

    // Start first exercise
    await this.startExercise(0);
  }

  /**
   * Pause the session
   */
  public pauseSession(): void {
    if (this.state.status !== 'active') return;

    logger.info('[Orchestrator] Pausing session');

    this.state.status = 'paused';
    this.state.pausedTime = Date.now();

    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }

    speechService.pause();
    this.notifyStateChange();

    // Record interaction
    moodDetectionService.recordInteraction('pause');
  }

  /**
   * Resume the session
   */
  public resumeSession(): void {
    if (this.state.status !== 'paused') return;

    logger.info('[Orchestrator] Resuming session');

    const pauseDuration = Date.now() - this.state.pausedTime;
    this.state.totalPausedDuration += pauseDuration;
    this.state.status = 'active';
    this.state.pausedTime = 0;

    speechService.resume();
    this.notifyStateChange();

    // Record interaction
    moodDetectionService.recordInteraction('resume');

    // Resume current phase
    this.continueCurrentPhase();
  }

  /**
   * End the session
   */
  public async endSession(): Promise<SessionResult> {
    logger.info('[Orchestrator] Ending session');

    this.state.status = 'completing';
    this.notifyStateChange();

    // Stop intervals
    if (this.moodAnalysisInterval) {
      clearInterval(this.moodAnalysisInterval);
      this.moodAnalysisInterval = null;
    }

    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }

    // Unsubscribe from mood detection
    moodDetectionService.unsubscribe('orchestrator');

    // Calculate results
    const result = this.calculateSessionResult();

    // Speak farewell
    if (this.config?.preferences.voiceEnabled) {
      await this.speakFarewell(result);
    }

    this.state.status = 'completed';
    this.notifyStateChange();

    // Notify callback
    if (this.callbacks.onSessionComplete) {
      this.callbacks.onSessionComplete(result);
    }

    return result;
  }

  // --------------------------------------------------------------------------
  // EXERCISE FLOW
  // --------------------------------------------------------------------------

  /**
   * Start a specific exercise
   */
  private async startExercise(index: number): Promise<void> {
    if (!this.config) return;

    const exercises = this.config.exerciseProgram.exercises;
    if (index >= exercises.length) {
      await this.endSession();
      return;
    }

    const exercise = exercises[index];
    logger.info('[Orchestrator] Starting exercise:', exercise.name);

    this.state.currentExerciseIndex = index;
    this.state.currentSet = 1;
    this.state.currentRep = 0;
    this.state.phase = 'intro';
    this.notifyStateChange();

    // Notify callback
    if (this.callbacks.onExerciseChange) {
      this.callbacks.onExerciseChange(exercise, index);
    }

    // Introduce exercise
    await this.introduceExercise(exercise);

    // Start preparation phase
    this.startPhase('preparation');
  }

  /**
   * Skip current exercise
   */
  public async skipExercise(): Promise<void> {
    if (!this.config || this.state.status !== 'active') return;

    logger.info('[Orchestrator] Skipping exercise');

    // Record interaction
    moodDetectionService.recordInteraction('skip');

    // Get mood-aware response
    const mood = moodDetectionService.getCurrentMood();
    if (mood && mood.mood === 'frustrated') {
      await this.speak('Ingen stress, vi hoppar över denna. Det är helt okej.');
    } else {
      await this.speak('Vi går vidare till nästa övning.');
    }

    // Move to next exercise
    await this.startExercise(this.state.currentExerciseIndex + 1);
  }

  /**
   * Repeat current instruction
   */
  public async repeatInstruction(): Promise<void> {
    logger.info('[Orchestrator] Repeating instruction');

    // Record interaction
    moodDetectionService.recordInteraction('repeat');

    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    // Get current phase instruction
    let instruction = '';
    switch (this.state.phase) {
      case 'preparation':
        instruction = 'Gör dig redo. ' + exercise.instructions[0];
        break;
      case 'execution':
        instruction = exercise.instructions.join('. ');
        break;
      case 'hold':
        instruction = `Håll kvar positionen.`;
        break;
      case 'return':
        instruction = 'Återgå långsamt till startpositionen.';
        break;
      default:
        instruction = exercise.instructions[0];
    }

    await this.speak(instruction);
  }

  /**
   * Introduce an exercise
   */
  private async introduceExercise(exercise: ExerciseConfig): Promise<void> {
    const total = this.config!.exerciseProgram.exercises.length;
    const current = this.state.currentExerciseIndex + 1;

    let intro = `Övning ${current} av ${total}: ${exercise.name}. `;

    // Add set/rep info
    if (exercise.holdTime) {
      intro += `${exercise.sets} set, håll i ${exercise.holdTime} sekunder.`;
    } else {
      intro += `${exercise.sets} set med ${exercise.reps} repetitioner.`;
    }

    await this.speak(intro);

    // Update avatar to demonstrate
    this.updateAvatarState({
      expression: 'neutral',
      animation: 'demonstrating',
      focusPoint: { x: 0, y: 0.5, z: 1 },
      intensity: 0.5,
      speaking: false,
      emotionalState: 'focused',
    });
  }

  /**
   * Start a phase within an exercise
   */
  private startPhase(phase: ExercisePhase): void {
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    logger.debug('[Orchestrator] Starting phase:', phase);

    this.state.phase = phase;
    this.notifyStateChange();

    emitPhaseChange(phase, 'start');

    switch (phase) {
      case 'preparation':
        this.handlePreparationPhase(exercise);
        break;
      case 'execution':
        this.handleExecutionPhase(exercise);
        break;
      case 'hold':
        this.handleHoldPhase(exercise);
        break;
      case 'return':
        this.handleReturnPhase(exercise);
        break;
      case 'rest':
        this.handleRestPhase(exercise);
        break;
      case 'transition':
        this.handleTransitionPhase();
        break;
    }
  }

  private async handlePreparationPhase(exercise: ExerciseConfig): Promise<void> {
    await this.speak('Gör dig redo...');

    this.phaseTimer = setTimeout(() => {
      this.startPhase('execution');
    }, 3000);
  }

  private async handleExecutionPhase(exercise: ExerciseConfig): Promise<void> {
    if (exercise.holdTime) {
      await this.speak(exercise.instructions[0]);
      this.phaseTimer = setTimeout(() => {
        this.startPhase('hold');
      }, 2000);
    } else {
      this.state.currentRep++;
      this.notifyStateChange();

      await this.speak(`Repetition ${this.state.currentRep}`);

      emitAnimationProgress(this.state.currentRep / exercise.reps);

      this.phaseTimer = setTimeout(() => {
        this.startPhase('return');
      }, 3000);
    }
  }

  private async handleHoldPhase(exercise: ExerciseConfig): Promise<void> {
    const holdTime = exercise.holdTime || 10;
    await this.speak(`Håll kvar i ${holdTime} sekunder...`);

    // Count down at intervals
    let remaining = holdTime;
    const countdownInterval = setInterval(() => {
      remaining--;
      if (remaining === 5 || remaining === 3) {
        this.speak(`${remaining}`);
      }
    }, 1000);

    this.phaseTimer = setTimeout(() => {
      clearInterval(countdownInterval);
      this.startPhase('return');
    }, holdTime * 1000);
  }

  private async handleReturnPhase(exercise: ExerciseConfig): Promise<void> {
    await this.speak('Och tillbaka...');

    this.phaseTimer = setTimeout(() => {
      // Check if more reps in this set
      if (this.state.currentRep < exercise.reps) {
        this.startPhase('execution');
      } else {
        // Check if more sets
        if (this.state.currentSet < exercise.sets) {
          this.startPhase('rest');
        } else {
          // Exercise complete
          this.completeExercise();
        }
      }
    }, 2000);
  }

  private async handleRestPhase(exercise: ExerciseConfig): Promise<void> {
    const mood = moodDetectionService.getCurrentMood();
    const adjustment = mood ? moodDetectionService.getRecommendedAction(mood) : null;

    let restTime = exercise.restTime;

    // Adjust rest based on mood
    if (adjustment?.restRecommendation === 'extended') {
      restTime = Math.round(restTime * 1.5);
      await this.speak(`Vila i ${restTime} sekunder. Ta det lugnt.`);
    } else if (adjustment?.restRecommendation === 'short') {
      restTime = Math.round(restTime * 0.8);
      await this.speak(`Vila i ${restTime} sekunder.`);
    } else {
      await this.speak(`Vila i ${restTime} sekunder.`);
    }

    this.phaseTimer = setTimeout(() => {
      this.state.currentSet++;
      this.state.currentRep = 0;
      this.notifyStateChange();
      this.speak(`Set ${this.state.currentSet} av ${exercise.sets}.`);
      this.startPhase('preparation');
    }, restTime * 1000);
  }

  private async handleTransitionPhase(): Promise<void> {
    await this.speak('Bra jobbat! Vi går vidare till nästa övning.');

    this.phaseTimer = setTimeout(() => {
      this.startExercise(this.state.currentExerciseIndex + 1);
    }, 2000);
  }

  private async completeExercise(): Promise<void> {
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    logger.info('[Orchestrator] Exercise completed:', exercise.name);

    this.state.exercisesCompleted++;
    this.notifyStateChange();

    // Record interaction
    moodDetectionService.recordInteraction('complete');

    // Get celebratory feedback based on mood
    const mood = moodDetectionService.getCurrentMood();
    let celebration = 'Bra jobbat!';

    if (mood?.mood === 'energetic' || mood?.mood === 'motivated') {
      celebration = 'Fantastiskt! Du är i toppform!';
    } else if (mood?.mood === 'tired') {
      celebration = 'Starkt kämpat! Du gör det bra.';
    }

    await this.speak(celebration);

    // Update avatar
    this.updateAvatarState({
      expression: 'happy',
      animation: 'celebrating',
      focusPoint: { x: 0, y: 0.5, z: 1 },
      intensity: 0.8,
      speaking: false,
      emotionalState: 'happy',
    });

    // Check for more exercises
    if (this.state.currentExerciseIndex < this.config!.exerciseProgram.exercises.length - 1) {
      this.startPhase('transition');
    } else {
      await this.endSession();
    }
  }

  private continueCurrentPhase(): void {
    // Re-enter current phase after pause
    const exercise = this.getCurrentExercise();
    if (!exercise) return;

    // Simplified: just restart the current phase
    this.startPhase(this.state.phase);
  }

  // --------------------------------------------------------------------------
  // FORM FEEDBACK
  // --------------------------------------------------------------------------

  /**
   * Handle form analysis updates
   */
  private handleFormUpdate(formAnalysis: FormAnalysis): void {
    if (this.state.status !== 'active' || this.state.phase === 'rest') return;

    // Update score
    this.state.totalScore = (this.state.totalScore + formAnalysis.overallScore) / 2;

    // Update mood detection
    moodDetectionService.updateFormQuality(formAnalysis.overallScore);

    // Generate feedback if needed
    const userContext = this.buildUserContext();
    const feedback = worldClassCoachService.generateFeedback(formAnalysis, userContext);

    if (feedback.length > 0) {
      // Queue feedback
      this.feedbackQueue.push(...feedback);
      this.processFeedbackQueue();
    }

    // Update avatar based on form
    this.updateAvatarFromForm(formAnalysis);
  }

  /**
   * Process queued feedback
   */
  private async processFeedbackQueue(): Promise<void> {
    if (this.isProcessingFeedback || this.feedbackQueue.length === 0) return;
    if (this.state.status !== 'active') return;

    this.isProcessingFeedback = true;

    const feedback = this.feedbackQueue.shift()!;

    // Record in history
    this.state.feedbackHistory.push(feedback);

    // Notify callback
    if (this.callbacks.onFeedback) {
      this.callbacks.onFeedback(feedback);
    }

    // Speak feedback based on priority
    if (this.config?.preferences.voiceEnabled) {
      if (feedback.priority === 'critical' || feedback.priority === 'high') {
        await this.speak(feedback.message);
      }
    }

    // Trigger haptic if enabled
    if (this.config?.preferences.hapticFeedback && feedback.hapticPattern) {
      this.triggerHaptic(feedback.hapticPattern);
    }

    this.isProcessingFeedback = false;

    // Process next item if available
    if (this.feedbackQueue.length > 0) {
      setTimeout(() => this.processFeedbackQueue(), 500);
    }
  }

  private updateAvatarFromForm(formAnalysis: FormAnalysis): void {
    let expression: AvatarState['expression'] = 'neutral';
    let emotionalState: AvatarState['emotionalState'] = 'focused';

    if (formAnalysis.overallScore > 0.9) {
      expression = 'happy';
      emotionalState = 'happy';
    } else if (formAnalysis.overallScore < 0.5) {
      expression = 'concerned';
      emotionalState = 'concerned';
    } else if (formAnalysis.overallScore > 0.7) {
      expression = 'encouraging';
      emotionalState = 'encouraging';
    }

    // Look at problem area if correction needed
    let focusPoint = { x: 0, y: 0.5, z: 1 };
    if (formAnalysis.corrections && formAnalysis.corrections.length > 0) {
      const correction = formAnalysis.corrections[0];
      // Approximate focus point based on joint name
      if (correction.joint.includes('knee')) {
        focusPoint = { x: 0, y: -0.3, z: 1 };
      } else if (correction.joint.includes('shoulder')) {
        focusPoint = { x: 0, y: 0.7, z: 1 };
      } else if (correction.joint.includes('hip')) {
        focusPoint = { x: 0, y: 0, z: 1 };
      }
    }

    this.updateAvatarState({
      expression,
      animation: 'coaching',
      focusPoint,
      intensity: formAnalysis.overallScore,
      speaking: false,
      emotionalState,
    });
  }

  // --------------------------------------------------------------------------
  // MOOD HANDLING
  // --------------------------------------------------------------------------

  /**
   * Handle mood updates
   */
  private handleMoodUpdate(mood: MoodSnapshot): void {
    // Notify callback
    if (this.callbacks.onMoodChange) {
      this.callbacks.onMoodChange(mood);
    }

    // Check if we need to adjust coaching
    const prediction = moodDetectionService.predictMood();

    if (prediction.probability > 0.7) {
      const adjustment = prediction.recommendedAction;

      // Adjust coaching style if needed
      if (adjustment.style === 'simplify') {
        worldClassCoachService.setCoachingStyle('empathetic');
      } else if (adjustment.style === 'challenge') {
        worldClassCoachService.setCoachingStyle('challenging');
      } else if (adjustment.style === 'energize') {
        // Proactively give encouragement
        if (adjustment.suggestedPhrases.length > 0 && this.config?.preferences.voiceEnabled) {
          const phrase = adjustment.suggestedPhrases[Math.floor(Math.random() * adjustment.suggestedPhrases.length)];
          this.speak(phrase);
        }
      }

      // Handle end session recommendation
      if (adjustment.restRecommendation === 'end_session' && mood.mood === 'disengaged') {
        this.suggestEndSession();
      }
    }
  }

  private async suggestEndSession(): Promise<void> {
    await this.speak('Du har jobbat bra idag. Vill du kanske ta en paus och fortsätta vid ett annat tillfälle?');

    // Emit event for UI to handle
    eventBus.emit('session:endSuggestion', {
      reason: 'fatigue',
      exercisesCompleted: this.state.exercisesCompleted,
    });
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  private async speak(text: string): Promise<void> {
    if (!this.config?.preferences.voiceEnabled) return;

    const options: SpeechOptions = {
      rate: this.config.preferences.voiceSpeed,
    };

    try {
      await speechService.speak(text, options);
    } catch (error) {
      logger.error('[Orchestrator] Speech error:', error);
    }
  }

  private async speakWelcome(): Promise<void> {
    const user = this.config!.userProfile;
    const program = this.config!.exerciseProgram;

    let greeting = `Hej${user.name ? ' ' + user.name : ''}! `;

    // Add streak mention if applicable
    if (user.streakDays > 2) {
      greeting += `Imponerande, ${user.streakDays} dagar i rad! `;
    }

    greeting += `Idag kör vi ${program.name} med ${program.exercises.length} övningar. `;
    greeting += 'Säg till om du behöver pausa eller upprepa något.';

    await this.speak(greeting);
  }

  private async speakFarewell(result: SessionResult): Promise<void> {
    let farewell = '';

    if (result.exercisesCompleted === result.totalExercises) {
      farewell = 'Fantastiskt jobbat! Du genomförde alla övningar. ';
    } else if (result.exercisesCompleted > result.totalExercises / 2) {
      farewell = 'Bra träning! Du genomförde de flesta övningarna. ';
    } else {
      farewell = 'Bra att du tränade idag! ';
    }

    if (result.averageFormScore > 0.8) {
      farewell += 'Din teknik var utmärkt. ';
    }

    farewell += 'Vi ses nästa gång!';

    await this.speak(farewell);
  }

  private getCurrentExercise(): ExerciseConfig | null {
    if (!this.config) return null;
    return this.config.exerciseProgram.exercises[this.state.currentExerciseIndex] || null;
  }

  private buildUserContext(): UserContext {
    return {
      name: this.config?.userProfile.name || '',
      preferredStyle: this.config?.preferences.coachingStyle || 'encouraging',
      currentMood: moodDetectionService.getCurrentMood()?.mood || 'neutral',
      energyLevel: this.calculateEnergyLevel(),
      sessionProgress: this.state.exercisesCompleted / (this.config?.exerciseProgram.exercises.length || 1),
      recentFeedback: this.state.feedbackHistory.slice(-5),
    };
  }

  private calculateEnergyLevel(): number {
    const mood = moodDetectionService.getCurrentMood();
    if (!mood) return 0.7;

    const fatigueMap = { fresh: 1, normal: 0.7, tired: 0.4, exhausted: 0.2 };
    return fatigueMap[mood.fatigue];
  }

  private updateAvatarState(state: AvatarState): void {
    worldClassCoachService.updateAvatarState(state);

    if (this.callbacks.onAvatarUpdate) {
      this.callbacks.onAvatarUpdate(state);
    }
  }

  private triggerHaptic(pattern: number[]): void {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore vibration errors
      }
    }
  }

  private handlePhaseComplete(phase: ExercisePhase): void {
    emitPhaseChange(phase, 'end');
  }

  private calculateSessionResult(): SessionResult {
    const duration = this.state.startTime
      ? (Date.now() - this.state.startTime - this.state.totalPausedDuration) / 60000
      : 0;

    const moodDistribution = moodDetectionService.getMoodDistribution();

    // Calculate average form score
    const avgScore = this.state.feedbackHistory.length > 0
      ? this.state.feedbackHistory.reduce((sum, f) => sum + (f.priority === 'low' ? 0.8 : f.priority === 'medium' ? 0.6 : 0.4), 0) / this.state.feedbackHistory.length
      : 0.7;

    // Count corrections applied
    const correctionsApplied = this.state.feedbackHistory.filter(
      f => f.priority === 'high' || f.priority === 'critical'
    ).length;

    // Generate highlights
    const highlights: SessionHighlight[] = [];

    if (this.state.exercisesCompleted === this.config?.exerciseProgram.exercises.length) {
      highlights.push({
        type: 'achievement',
        title: 'Program slutfört!',
        description: 'Du genomförde alla övningar.',
        timestamp: Date.now(),
      });
    }

    if (avgScore > 0.85) {
      highlights.push({
        type: 'achievement',
        title: 'Utmärkt teknik',
        description: 'Din form var konsekvent bra under hela sessionen.',
        timestamp: Date.now(),
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const metrics = moodDetectionService.getEngagementMetrics();

    if (metrics.motivationIndex < 0.5) {
      recommendations.push('Överväg kortare sessioner för att behålla motivationen.');
    }

    if (avgScore < 0.7) {
      recommendations.push('Fokusera på teknik framför antal repetitioner.');
    }

    return {
      sessionId: this.sessionId,
      duration: Math.round(duration * 10) / 10,
      exercisesCompleted: this.state.exercisesCompleted,
      totalExercises: this.config?.exerciseProgram.exercises.length || 0,
      averageFormScore: Math.round(avgScore * 100) / 100,
      moodSummary: moodDistribution,
      feedbackGiven: this.state.feedbackHistory.length,
      correctionsApplied,
      highlights,
      recommendations,
    };
  }

  private notifyStateChange(): void {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({ ...this.state });
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  /**
   * Get current session state
   */
  public getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Get current exercise
   */
  public getCurrentExerciseConfig(): ExerciseConfig | null {
    return this.getCurrentExercise();
  }

  /**
   * Get session progress (0-1)
   */
  public getProgress(): number {
    if (!this.config) return 0;
    return this.state.exercisesCompleted / this.config.exerciseProgram.exercises.length;
  }

  /**
   * Get engagement metrics
   */
  public getEngagementMetrics() {
    return moodDetectionService.getEngagementMetrics();
  }

  /**
   * Force mood analysis
   */
  public analyzeMood(): MoodSnapshot {
    return moodDetectionService.analyzeMood();
  }

  /**
   * Update user signals manually
   */
  public updateSignals(signals: Partial<Parameters<typeof moodDetectionService.updateMovementSignals>[0]>): void {
    moodDetectionService.updateMovementSignals(signals as Parameters<typeof moodDetectionService.updateMovementSignals>[0]);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const coachingSessionOrchestrator = new CoachingSessionOrchestrator();
export default coachingSessionOrchestrator;
