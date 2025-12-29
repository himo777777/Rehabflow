/**
 * World-Class AI Coach Service
 *
 * Next-generation rehabilitation coaching combining:
 * - Contextual AI with deep user understanding
 * - Adaptive coaching personality
 * - Predictive form correction
 * - Emotional intelligence
 * - Clinical-grade assessments
 * - Multi-modal feedback (visual, audio, haptic)
 *
 * Architecture inspired by:
 * - Sports science coaching methodologies
 * - Cognitive behavioral therapy principles
 * - Motor learning theory
 * - Gamification psychology
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES - WORLD-CLASS COACHING
// ============================================================================

export type CoachingStyle =
  | 'encouraging'     // Positive, supportive
  | 'challenging'     // Push limits, competitive
  | 'analytical'      // Data-focused, precise
  | 'empathetic'      // Understanding, patient
  | 'professional';   // Clinical, informative

export type UserMood =
  | 'motivated'
  | 'tired'
  | 'frustrated'
  | 'confident'
  | 'anxious'
  | 'neutral';

export type FeedbackUrgency = 'immediate' | 'end_of_rep' | 'end_of_set' | 'summary';

export interface UserContext {
  // Demographics & Health
  userId: string;
  age: number;
  injuryType: string;
  rehabPhase: 1 | 2 | 3;
  surgeryDate?: Date;
  comorbidities?: string[];

  // Current Session
  currentExercise: string;
  repCount: number;
  setCount: number;
  sessionDuration: number;
  painLevel: number;
  fatiguLevel: number;

  // Historical Data
  totalSessions: number;
  averageFormScore: number;
  commonMistakes: string[];
  bestPerformanceTime: string; // "morning" | "afternoon" | "evening"
  streakDays: number;
  completionRate: number;

  // Preferences
  preferredCoachingStyle: CoachingStyle;
  language: 'sv' | 'en';
  voiceEnabled: boolean;
  hapticEnabled: boolean;

  // Real-time State
  currentMood?: UserMood;
  lastFeedbackTime?: number;
  feedbackHistory: CoachingFeedback[];
}

export interface FormAnalysis {
  overallScore: number;
  jointAngles: Record<string, number>;
  velocities: Record<string, number>;
  symmetry: number;
  issues: FormIssue[];
  phase: 'eccentric' | 'concentric' | 'isometric' | 'transition';
  repQuality: 'excellent' | 'good' | 'acceptable' | 'needs_work' | 'critical';
}

export interface FormIssue {
  id: string;
  type: 'compensation' | 'rom' | 'alignment' | 'tempo' | 'balance';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  joint: string;
  currentValue: number;
  targetValue: number;
  description: string;
  descriptionSv: string;
  correction: string;
  correctionSv: string;
  priority: number;
}

export interface CoachingFeedback {
  id: string;
  timestamp: number;
  type: 'correction' | 'encouragement' | 'instruction' | 'warning' | 'celebration';
  urgency: FeedbackUrgency;
  message: string;
  messageSv: string;
  voiceMessage?: string;
  voiceMessageSv?: string;
  emotion: 'neutral' | 'happy' | 'concerned' | 'excited' | 'calm';
  avatarAnimation?: AvatarAnimation;
  hapticPattern?: number[];
  visualCue?: VisualCue;
}

export interface AvatarAnimation {
  type: 'gesture' | 'demonstration' | 'expression' | 'point';
  name: string;
  duration: number;
  targetJoint?: string;
  intensity: number;
}

export interface VisualCue {
  type: 'highlight' | 'arrow' | 'overlay' | 'ghost';
  target: string;
  color: string;
  duration: number;
  pulseRate?: number;
}

export interface CoachingSession {
  id: string;
  startTime: number;
  endTime?: number;
  exercises: ExercisePerformance[];
  overallScore: number;
  feedbackCount: number;
  improvements: string[];
  areasToWork: string[];
  nextSessionRecommendations: string[];
}

export interface ExercisePerformance {
  exerciseId: string;
  reps: RepPerformance[];
  averageScore: number;
  bestRep: number;
  worstRep: number;
  commonIssues: string[];
}

export interface RepPerformance {
  repNumber: number;
  score: number;
  duration: number;
  issues: FormIssue[];
  peakROM: number;
  feedback: CoachingFeedback[];
}

// ============================================================================
// COACHING INTELLIGENCE ENGINE
// ============================================================================

class CoachingIntelligence {
  /**
   * Analyze form and generate intelligent feedback
   */
  analyzeAndCoach(
    formAnalysis: FormAnalysis,
    userContext: UserContext
  ): CoachingFeedback[] {
    const feedback: CoachingFeedback[] = [];

    // Determine what feedback is needed
    const criticalIssues = formAnalysis.issues.filter(i => i.severity === 'critical');
    const majorIssues = formAnalysis.issues.filter(i => i.severity === 'major');

    // Critical issues get immediate feedback
    if (criticalIssues.length > 0) {
      feedback.push(this.generateCriticalFeedback(criticalIssues[0], userContext));
    }

    // Major issues get end-of-rep feedback (limit to avoid overwhelm)
    if (majorIssues.length > 0 && !this.recentlyGaveFeedback(userContext, 'correction')) {
      feedback.push(this.generateCorrectionFeedback(majorIssues[0], userContext));
    }

    // Positive reinforcement for good form
    if (formAnalysis.repQuality === 'excellent' || formAnalysis.repQuality === 'good') {
      if (this.shouldGiveEncouragement(userContext)) {
        feedback.push(this.generateEncouragement(formAnalysis, userContext));
      }
    }

    // Milestone celebrations
    if (this.isSignificantMilestone(userContext)) {
      feedback.push(this.generateCelebration(userContext));
    }

    return feedback;
  }

  /**
   * Generate critical safety feedback
   */
  private generateCriticalFeedback(issue: FormIssue, ctx: UserContext): CoachingFeedback {
    const style = ctx.preferredCoachingStyle;

    const messages = this.getCriticalMessages(issue, style);

    return {
      id: `fb_${Date.now()}`,
      timestamp: Date.now(),
      type: 'warning',
      urgency: 'immediate',
      message: messages.en,
      messageSv: messages.sv,
      voiceMessage: messages.voice_en,
      voiceMessageSv: messages.voice_sv,
      emotion: 'concerned',
      avatarAnimation: {
        type: 'gesture',
        name: 'stop_signal',
        duration: 1000,
        intensity: 1.0,
      },
      hapticPattern: [200, 100, 200, 100, 200], // Alert pattern
      visualCue: {
        type: 'highlight',
        target: issue.joint,
        color: '#FF4444',
        duration: 2000,
        pulseRate: 500,
      },
    };
  }

  /**
   * Generate form correction feedback
   */
  private generateCorrectionFeedback(issue: FormIssue, ctx: UserContext): CoachingFeedback {
    const style = ctx.preferredCoachingStyle;
    const messages = this.getCorrectionMessages(issue, style, ctx);

    return {
      id: `fb_${Date.now()}`,
      timestamp: Date.now(),
      type: 'correction',
      urgency: 'end_of_rep',
      message: messages.en,
      messageSv: messages.sv,
      voiceMessage: messages.voice_en,
      voiceMessageSv: messages.voice_sv,
      emotion: style === 'empathetic' ? 'calm' : 'neutral',
      avatarAnimation: {
        type: 'demonstration',
        name: `correct_${issue.type}`,
        duration: 2000,
        targetJoint: issue.joint,
        intensity: 0.8,
      },
      visualCue: {
        type: 'arrow',
        target: issue.joint,
        color: '#FFAA00',
        duration: 3000,
      },
    };
  }

  /**
   * Generate encouragement feedback
   */
  private generateEncouragement(analysis: FormAnalysis, ctx: UserContext): CoachingFeedback {
    const style = ctx.preferredCoachingStyle;
    const messages = this.getEncouragementMessages(analysis, style, ctx);

    return {
      id: `fb_${Date.now()}`,
      timestamp: Date.now(),
      type: 'encouragement',
      urgency: 'end_of_rep',
      message: messages.en,
      messageSv: messages.sv,
      voiceMessage: messages.voice_en,
      voiceMessageSv: messages.voice_sv,
      emotion: 'happy',
      avatarAnimation: {
        type: 'expression',
        name: 'thumbs_up',
        duration: 1000,
        intensity: 0.9,
      },
      hapticPattern: [50, 50, 50], // Success pattern
    };
  }

  /**
   * Generate celebration for milestones
   */
  private generateCelebration(ctx: UserContext): CoachingFeedback {
    const milestone = this.getCurrentMilestone(ctx);

    return {
      id: `fb_${Date.now()}`,
      timestamp: Date.now(),
      type: 'celebration',
      urgency: 'end_of_set',
      message: milestone.message_en,
      messageSv: milestone.message_sv,
      voiceMessage: milestone.voice_en,
      voiceMessageSv: milestone.voice_sv,
      emotion: 'excited',
      avatarAnimation: {
        type: 'gesture',
        name: 'celebration',
        duration: 2000,
        intensity: 1.0,
      },
      hapticPattern: [100, 50, 100, 50, 100, 50, 200],
    };
  }

  // ============================================
  // MESSAGE GENERATION BY STYLE
  // ============================================

  private getCriticalMessages(issue: FormIssue, style: CoachingStyle) {
    const base = {
      en: `Stop - ${issue.description}. ${issue.correction}`,
      sv: `Stopp - ${issue.descriptionSv}. ${issue.correctionSv}`,
      voice_en: `Please stop. ${issue.description}. Let me show you the correct way.`,
      voice_sv: `Stanna. ${issue.descriptionSv}. Låt mig visa dig rätt sätt.`,
    };

    // Adapt based on style
    if (style === 'empathetic') {
      base.voice_en = `Let's pause for a moment. ${issue.description}. Don't worry, I'll help you fix this.`;
      base.voice_sv = `Låt oss pausa en stund. ${issue.descriptionSv}. Oroa dig inte, jag hjälper dig att fixa det.`;
    } else if (style === 'professional') {
      base.voice_en = `Clinical observation: ${issue.description}. Recommended correction: ${issue.correction}`;
      base.voice_sv = `Klinisk observation: ${issue.descriptionSv}. Rekommenderad korrigering: ${issue.correctionSv}`;
    }

    return base;
  }

  private getCorrectionMessages(issue: FormIssue, style: CoachingStyle, ctx: UserContext) {
    // Check if this is a repeated issue
    const isRepeated = ctx.commonMistakes.includes(issue.type);

    const styleMessages: Record<CoachingStyle, { en: string; sv: string; voice_en: string; voice_sv: string }> = {
      encouraging: {
        en: `Good effort! Try to ${issue.correction.toLowerCase()}`,
        sv: `Bra försök! Försök att ${issue.correctionSv.toLowerCase()}`,
        voice_en: `You're doing great! Just a small adjustment - ${issue.correction.toLowerCase()}`,
        voice_sv: `Du gör det bra! Bara en liten justering - ${issue.correctionSv.toLowerCase()}`,
      },
      challenging: {
        en: `Push harder! ${issue.correction}`,
        sv: `Kämpa på! ${issue.correctionSv}`,
        voice_en: `I know you can do better. ${issue.correction}. Show me what you've got!`,
        voice_sv: `Jag vet att du kan bättre. ${issue.correctionSv}. Visa vad du går för!`,
      },
      analytical: {
        en: `${issue.joint}: ${issue.currentValue.toFixed(0)}° → target ${issue.targetValue.toFixed(0)}°`,
        sv: `${issue.joint}: ${issue.currentValue.toFixed(0)}° → mål ${issue.targetValue.toFixed(0)}°`,
        voice_en: `Data shows ${issue.joint} at ${issue.currentValue.toFixed(0)} degrees. Target is ${issue.targetValue.toFixed(0)} degrees.`,
        voice_sv: `Data visar ${issue.joint} på ${issue.currentValue.toFixed(0)} grader. Målet är ${issue.targetValue.toFixed(0)} grader.`,
      },
      empathetic: {
        en: `I see ${issue.description.toLowerCase()}. ${issue.correction}`,
        sv: `Jag ser ${issue.descriptionSv.toLowerCase()}. ${issue.correctionSv}`,
        voice_en: `I notice ${issue.description.toLowerCase()}. Take your time - ${issue.correction.toLowerCase()}`,
        voice_sv: `Jag märker ${issue.descriptionSv.toLowerCase()}. Ta din tid - ${issue.correctionSv.toLowerCase()}`,
      },
      professional: {
        en: `Form observation: ${issue.description}. Correction: ${issue.correction}`,
        sv: `Formobservation: ${issue.descriptionSv}. Korrigering: ${issue.correctionSv}`,
        voice_en: `Clinical note: ${issue.description}. Recommended adjustment: ${issue.correction}`,
        voice_sv: `Klinisk notering: ${issue.descriptionSv}. Rekommenderad justering: ${issue.correctionSv}`,
      },
    };

    const messages = styleMessages[style];

    // Add context for repeated issues
    if (isRepeated && style !== 'analytical') {
      messages.en = `Remember: ${messages.en}`;
      messages.sv = `Kom ihåg: ${messages.sv}`;
    }

    return messages;
  }

  private getEncouragementMessages(analysis: FormAnalysis, style: CoachingStyle, ctx: UserContext) {
    const score = analysis.overallScore;
    const repCount = ctx.repCount;

    const encouragements: Record<CoachingStyle, string[][]> = {
      encouraging: [
        ['Amazing form!', 'Fantastisk form!'],
        ['You\'re crushing it!', 'Du krossar det!'],
        ['Perfect technique!', 'Perfekt teknik!'],
        ['Keep that energy!', 'Behåll den energin!'],
      ],
      challenging: [
        ['That\'s the standard I expect!', 'Det är standarden jag förväntar mig!'],
        ['Now maintain that!', 'Behåll det nu!'],
        ['Good, but can you do better?', 'Bra, men kan du göra det bättre?'],
        ['Strong rep!', 'Stark repetition!'],
      ],
      analytical: [
        [`Score: ${score}/100`, `Poäng: ${score}/100`],
        [`Rep ${repCount}: ${score}% optimal`, `Rep ${repCount}: ${score}% optimal`],
        ['Form metrics: excellent', 'Formmetrik: utmärkt'],
        ['All parameters within target', 'Alla parametrar inom mål'],
      ],
      empathetic: [
        ['Beautiful movement!', 'Vacker rörelse!'],
        ['You should be proud!', 'Du ska vara stolt!'],
        ['That felt good, right?', 'Det kändes bra, eller hur?'],
        ['Your body is healing!', 'Din kropp läker!'],
      ],
      professional: [
        ['Excellent execution', 'Utmärkt utförande'],
        ['Form meets clinical standards', 'Formen uppfyller kliniska standarder'],
        ['Optimal movement pattern', 'Optimalt rörelsemönster'],
        ['Therapeutic range achieved', 'Terapeutiskt omfång uppnått'],
      ],
    };

    const options = encouragements[style];
    const selected = options[Math.floor(Math.random() * options.length)];

    return {
      en: selected[0],
      sv: selected[1],
      voice_en: selected[0],
      voice_sv: selected[1],
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private recentlyGaveFeedback(ctx: UserContext, type: string): boolean {
    const recentFeedback = ctx.feedbackHistory
      .filter(f => Date.now() - f.timestamp < 5000)
      .filter(f => f.type === type);
    return recentFeedback.length > 0;
  }

  private shouldGiveEncouragement(ctx: UserContext): boolean {
    // Don't overwhelm with encouragement
    const recentEncouragements = ctx.feedbackHistory
      .filter(f => Date.now() - f.timestamp < 30000)
      .filter(f => f.type === 'encouragement');

    if (recentEncouragements.length >= 2) return false;

    // Give more encouragement when user seems tired/frustrated
    if (ctx.currentMood === 'tired' || ctx.currentMood === 'frustrated') {
      return true;
    }

    // Random chance based on rep quality
    return Math.random() < 0.3;
  }

  private isSignificantMilestone(ctx: UserContext): boolean {
    // Check for various milestones
    if (ctx.repCount === 10 && ctx.setCount === 1) return true;
    if (ctx.setCount === 3 && ctx.repCount === 1) return true;
    if (ctx.streakDays === 7 || ctx.streakDays === 30) return true;
    if (ctx.totalSessions === 10 || ctx.totalSessions === 50) return true;
    return false;
  }

  private getCurrentMilestone(ctx: UserContext) {
    if (ctx.streakDays === 30) {
      return {
        message_en: '🔥 30 DAY STREAK! You\'re unstoppable!',
        message_sv: '🔥 30 DAGARS STREAK! Du är ostoppbar!',
        voice_en: 'Incredible! You\'ve hit a 30 day streak! Your dedication is truly inspiring!',
        voice_sv: 'Otroligt! Du har nått 30 dagars streak! Din dedikation är verkligen inspirerande!',
      };
    }
    if (ctx.streakDays === 7) {
      return {
        message_en: '🌟 One week streak! Consistency is key!',
        message_sv: '🌟 En veckas streak! Konsistens är nyckeln!',
        voice_en: 'Amazing! You\'ve been training for a whole week straight!',
        voice_sv: 'Fantastiskt! Du har tränat en hel vecka i rad!',
      };
    }
    return {
      message_en: '🎉 Great progress!',
      message_sv: '🎉 Bra framsteg!',
      voice_en: 'You\'re making excellent progress!',
      voice_sv: 'Du gör utmärkta framsteg!',
    };
  }
}

// ============================================================================
// 3D AVATAR CONTROLLER
// ============================================================================

export interface AvatarState {
  expression: 'neutral' | 'smiling' | 'concerned' | 'focused' | 'excited';
  bodyPose: 'standing' | 'demonstrating' | 'pointing' | 'celebrating';
  lookAt: { x: number; y: number; z: number };
  lipSync: boolean;
  currentAnimation?: string;
  blendShapes: Record<string, number>;
}

export interface AvatarConfig {
  style: 'realistic' | 'stylized' | 'clinical';
  gender: 'male' | 'female' | 'neutral';
  skinTone: string;
  clothingStyle: 'athletic' | 'clinical' | 'casual';
  voiceId: string;
}

class AvatarController {
  private state: AvatarState = {
    expression: 'neutral',
    bodyPose: 'standing',
    lookAt: { x: 0, y: 0, z: 1 },
    lipSync: false,
    blendShapes: {},
  };

  /**
   * Update avatar based on coaching feedback
   */
  updateFromFeedback(feedback: CoachingFeedback): AvatarState {
    // Update expression based on emotion
    const expressionMap: Record<string, AvatarState['expression']> = {
      neutral: 'neutral',
      happy: 'smiling',
      concerned: 'concerned',
      excited: 'excited',
      calm: 'focused',
    };
    this.state.expression = expressionMap[feedback.emotion] || 'neutral';

    // Handle animation
    if (feedback.avatarAnimation) {
      this.state.currentAnimation = feedback.avatarAnimation.name;

      if (feedback.avatarAnimation.type === 'demonstration') {
        this.state.bodyPose = 'demonstrating';
      } else if (feedback.avatarAnimation.type === 'gesture') {
        this.state.bodyPose = feedback.avatarAnimation.name === 'celebration' ? 'celebrating' : 'pointing';
      }
    }

    // Enable lip sync if voice message
    this.state.lipSync = !!(feedback.voiceMessage || feedback.voiceMessageSv);

    // Update blend shapes for expressions
    this.updateBlendShapes();

    return { ...this.state };
  }

  /**
   * Make avatar look at specific body part
   */
  lookAtJoint(joint: string): void {
    const jointPositions: Record<string, { x: number; y: number; z: number }> = {
      leftShoulder: { x: -0.3, y: 1.4, z: 0 },
      rightShoulder: { x: 0.3, y: 1.4, z: 0 },
      leftElbow: { x: -0.4, y: 1.1, z: 0 },
      rightElbow: { x: 0.4, y: 1.1, z: 0 },
      leftKnee: { x: -0.1, y: 0.5, z: 0 },
      rightKnee: { x: 0.1, y: 0.5, z: 0 },
    };

    if (jointPositions[joint]) {
      this.state.lookAt = jointPositions[joint];
    }
  }

  /**
   * Demonstrate correct movement
   */
  demonstrateExercise(exerciseId: string, phase: 'start' | 'middle' | 'end'): void {
    this.state.bodyPose = 'demonstrating';
    this.state.currentAnimation = `${exerciseId}_${phase}`;
  }

  private updateBlendShapes(): void {
    const expressions: Record<AvatarState['expression'], Record<string, number>> = {
      neutral: { smile: 0, eyebrowRaise: 0, eyeWiden: 0 },
      smiling: { smile: 0.8, eyebrowRaise: 0.2, eyeWiden: 0.1 },
      concerned: { smile: 0, eyebrowRaise: 0.5, eyeWiden: 0.3, browFurrow: 0.4 },
      focused: { smile: 0.1, eyebrowRaise: 0.3, eyeWiden: 0.2 },
      excited: { smile: 1.0, eyebrowRaise: 0.6, eyeWiden: 0.4 },
    };

    this.state.blendShapes = expressions[this.state.expression];
  }

  getState(): AvatarState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      expression: 'neutral',
      bodyPose: 'standing',
      lookAt: { x: 0, y: 0, z: 1 },
      lipSync: false,
      blendShapes: {},
    };
  }
}

// ============================================================================
// MAIN WORLD-CLASS COACH SERVICE
// ============================================================================

class WorldClassCoachService {
  private intelligence: CoachingIntelligence;
  private avatarController: AvatarController;
  private currentSession: CoachingSession | null = null;
  private userContext: UserContext | null = null;

  constructor() {
    this.intelligence = new CoachingIntelligence();
    this.avatarController = new AvatarController();
  }

  /**
   * Start a new coaching session
   */
  startSession(userContext: UserContext): CoachingSession {
    this.userContext = userContext;
    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      exercises: [],
      overallScore: 0,
      feedbackCount: 0,
      improvements: [],
      areasToWork: [],
      nextSessionRecommendations: [],
    };

    // Initial greeting based on context
    this.generateGreeting(userContext);

    logger.info('[WorldClassCoach] Session started:', this.currentSession.id);
    return this.currentSession;
  }

  /**
   * Process real-time form data and generate coaching
   */
  processFrame(formAnalysis: FormAnalysis): {
    feedback: CoachingFeedback[];
    avatarState: AvatarState;
  } {
    if (!this.userContext || !this.currentSession) {
      throw new Error('No active session');
    }

    // Generate intelligent feedback
    const feedback = this.intelligence.analyzeAndCoach(formAnalysis, this.userContext);

    // Update avatar based on feedback
    let avatarState = this.avatarController.getState();
    if (feedback.length > 0) {
      avatarState = this.avatarController.updateFromFeedback(feedback[0]);

      // Look at problem joint if correction
      if (feedback[0].type === 'correction' && feedback[0].visualCue?.target) {
        this.avatarController.lookAtJoint(feedback[0].visualCue.target);
      }
    }

    // Update session stats
    this.currentSession.feedbackCount += feedback.length;
    this.userContext.feedbackHistory.push(...feedback);

    return { feedback, avatarState };
  }

  /**
   * Generate personalized greeting
   */
  private generateGreeting(ctx: UserContext): CoachingFeedback {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    const greetings: Record<CoachingStyle, Record<string, { en: string; sv: string }>> = {
      encouraging: {
        morning: { en: 'Good morning! Ready to feel amazing today?', sv: 'God morgon! Redo att känna dig fantastisk idag?' },
        afternoon: { en: 'Hey there! Let\'s make this afternoon count!', sv: 'Hej! Låt oss göra den här eftermiddagen viktig!' },
        evening: { en: 'Great to see you! Evening sessions are powerful!', sv: 'Kul att se dig! Kvällspass är kraftfulla!' },
      },
      challenging: {
        morning: { en: 'Let\'s go! No excuses today!', sv: 'Nu kör vi! Inga ursäkter idag!' },
        afternoon: { en: 'Time to push your limits!', sv: 'Dags att tänja dina gränser!' },
        evening: { en: 'End the day strong!', sv: 'Avsluta dagen starkt!' },
      },
      analytical: {
        morning: { en: `Session ${ctx.totalSessions + 1}. Streak: ${ctx.streakDays} days.`, sv: `Session ${ctx.totalSessions + 1}. Streak: ${ctx.streakDays} dagar.` },
        afternoon: { en: `Starting session. Average form: ${ctx.averageFormScore}%`, sv: `Startar session. Snittform: ${ctx.averageFormScore}%` },
        evening: { en: `Evening session initiated. Let's optimize recovery.`, sv: `Kvällsession initierad. Låt oss optimera återhämtning.` },
      },
      empathetic: {
        morning: { en: 'Good morning! How are you feeling today?', sv: 'God morgon! Hur mår du idag?' },
        afternoon: { en: 'Welcome back! I\'m here to support you.', sv: 'Välkommen tillbaka! Jag är här för att stödja dig.' },
        evening: { en: 'I appreciate you showing up. Let\'s take it easy.', sv: 'Jag uppskattar att du kom. Låt oss ta det lugnt.' },
      },
      professional: {
        morning: { en: 'Welcome to your rehabilitation session.', sv: 'Välkommen till din rehabiliteringssession.' },
        afternoon: { en: 'Ready to continue your recovery protocol.', sv: 'Redo att fortsätta ditt återhämtningsprotokoll.' },
        evening: { en: 'Evening session. Focus on controlled movements.', sv: 'Kvällsession. Fokus på kontrollerade rörelser.' },
      },
    };

    const greeting = greetings[ctx.preferredCoachingStyle][timeOfDay];

    return {
      id: `greeting_${Date.now()}`,
      timestamp: Date.now(),
      type: 'instruction',
      urgency: 'immediate',
      message: greeting.en,
      messageSv: greeting.sv,
      voiceMessage: greeting.en,
      voiceMessageSv: greeting.sv,
      emotion: ctx.preferredCoachingStyle === 'empathetic' ? 'calm' : 'happy',
      avatarAnimation: {
        type: 'gesture',
        name: 'wave',
        duration: 1500,
        intensity: 0.8,
      },
    };
  }

  /**
   * End current session and generate summary
   */
  endSession(): CoachingSession {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.endTime = Date.now();

    // Generate summary and recommendations
    this.generateSessionSummary();

    logger.info('[WorldClassCoach] Session ended:', this.currentSession.id);

    const session = this.currentSession;
    this.currentSession = null;
    return session;
  }

  private generateSessionSummary(): void {
    if (!this.currentSession || !this.userContext) return;

    // Analyze improvements
    // ... (would analyze form data over session)

    // Generate recommendations for next session
    const recs = [];
    if (this.userContext.commonMistakes.includes('compensation')) {
      recs.push('Focus on core stability before starting exercises');
    }
    if (this.userContext.fatiguLevel > 7) {
      recs.push('Consider shorter sessions with more rest');
    }

    this.currentSession.nextSessionRecommendations = recs;
  }

  /**
   * Get avatar controller
   */
  getAvatarController(): AvatarController {
    return this.avatarController;
  }

  /**
   * Adapt coaching style based on user feedback
   */
  adaptStyle(feedback: 'too_intense' | 'not_enough' | 'just_right'): void {
    if (!this.userContext) return;

    const styleProgression: Record<CoachingStyle, { up: CoachingStyle; down: CoachingStyle }> = {
      encouraging: { up: 'challenging', down: 'empathetic' },
      challenging: { up: 'challenging', down: 'encouraging' },
      analytical: { up: 'challenging', down: 'professional' },
      empathetic: { up: 'encouraging', down: 'empathetic' },
      professional: { up: 'analytical', down: 'empathetic' },
    };

    const current = this.userContext.preferredCoachingStyle;

    if (feedback === 'too_intense') {
      this.userContext.preferredCoachingStyle = styleProgression[current].down;
    } else if (feedback === 'not_enough') {
      this.userContext.preferredCoachingStyle = styleProgression[current].up;
    }
  }
}

// Singleton export
export const worldClassCoachService = new WorldClassCoachService();
export default worldClassCoachService;
