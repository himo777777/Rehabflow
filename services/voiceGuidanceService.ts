/**
 * Voice Guidance Service
 *
 * Provides intelligent voice guidance during exercises:
 * - Phase-aware instructions
 * - Tempo-synchronized cues
 * - Form corrections
 * - Motivational feedback
 * - Breathing guidance
 * - Rep counting
 */

import { speechService } from './speechService';
import { hapticService } from './hapticService';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ExercisePhase = 'prepare' | 'eccentric' | 'hold' | 'concentric' | 'rest' | 'complete';

export interface VoiceGuidanceConfig {
  enabled: boolean;
  volume: number; // 0-1
  language: 'sv' | 'en';
  speakReps: boolean;
  speakPhases: boolean;
  speakCorrections: boolean;
  speakBreathing: boolean;
  speakEncouragement: boolean;
  encouragementFrequency: number; // Every N reps
  minTimeBetweenSpeeches: number; // ms
}

export interface ExerciseContext {
  exerciseName: string;
  targetReps: number;
  currentRep: number;
  currentPhase: ExercisePhase;
  tempo: number; // 0.5 - 2x
  formScore: number;
  issues: string[];
}

interface QueuedSpeech {
  text: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
}

// ============================================================================
// PHRASE TEMPLATES
// ============================================================================

const PHRASES = {
  sv: {
    // Preparation
    prepare: [
      'Gör dig redo',
      'Ställ dig i utgångsposition',
      'Ta ett djupt andetag',
    ],

    // Counting
    repStart: (n: number) => n === 1 ? 'Första' : `Nummer ${n}`,
    repComplete: (n: number, total: number) => {
      if (n === total) return 'Sista!';
      if (n === Math.floor(total / 2)) return 'Halvvägs!';
      return `${n} av ${total}`;
    },

    // Phases
    eccentric: [
      'Ner',
      'Sänk långsamt',
      'Kontrollerat ner',
    ],
    hold: [
      'Håll',
      'Stanna där',
      'Behåll positionen',
    ],
    concentric: [
      'Upp',
      'Tryck upp',
      'Tillbaka till start',
    ],
    rest: [
      'Vila',
      'Pusta ut',
      'Andas',
    ],

    // Breathing
    breatheIn: 'Andas in',
    breatheOut: 'Andas ut',
    holdBreath: 'Håll andan',

    // Form corrections (priority)
    corrections: {
      'Knäna kollapsar inåt': 'Knäna ut!',
      'Luta dig inte för långt fram': 'Bröst upp!',
      'Håll hälarna i golvet': 'Hälar ner!',
      'Knät går för långt fram': 'Knä tillbaka!',
      'Håll ryggen upprätt': 'Rak rygg!',
      'Höfterna hänger': 'Höfter upp!',
      'Höfterna för högt': 'Sänk höften!',
    },

    // Encouragement
    encouragement: {
      good: [
        'Bra!',
        'Snyggt!',
        'Fortsätt så!',
        'Perfekt!',
      ],
      great: [
        'Fantastiskt!',
        'Utmärkt!',
        'Imponerande!',
        'Suveränt!',
      ],
      struggling: [
        'Du klarar det!',
        'Nästan där!',
        'Ge inte upp!',
        'Stark!',
      ],
      milestone: [
        'Hälften klart!',
        'Endast {n} kvar!',
        'Sista sträckan!',
      ],
    },

    // Completion
    complete: [
      'Bra jobbat!',
      'Utmärkt träning!',
      'Du klarade det!',
    ],

    // Tempo
    tempoSlow: 'Sakta',
    tempoFast: 'Snabbare',
    tempoGood: 'Bra tempo',
  },

  en: {
    prepare: [
      'Get ready',
      'Take your position',
      'Take a deep breath',
    ],
    repStart: (n: number) => n === 1 ? 'First' : `Number ${n}`,
    repComplete: (n: number, total: number) => {
      if (n === total) return 'Last one!';
      if (n === Math.floor(total / 2)) return 'Halfway!';
      return `${n} of ${total}`;
    },
    eccentric: ['Down', 'Lower slowly', 'Control the descent'],
    hold: ['Hold', 'Stay there', 'Maintain position'],
    concentric: ['Up', 'Push up', 'Return to start'],
    rest: ['Rest', 'Take a breath', 'Relax'],
    breatheIn: 'Breathe in',
    breatheOut: 'Breathe out',
    holdBreath: 'Hold your breath',
    corrections: {
      'Knäna kollapsar inåt': 'Knees out!',
      'Luta dig inte för långt fram': 'Chest up!',
      'Håll hälarna i golvet': 'Heels down!',
      'Knät går för långt fram': 'Knee back!',
      'Håll ryggen upprätt': 'Straight back!',
      'Höfterna hänger': 'Hips up!',
      'Höfterna för högt': 'Lower hips!',
    },
    encouragement: {
      good: ['Good!', 'Nice!', 'Keep going!', 'Perfect!'],
      great: ['Amazing!', 'Excellent!', 'Impressive!', 'Outstanding!'],
      struggling: ["You've got this!", 'Almost there!', "Don't give up!", 'Stay strong!'],
      milestone: ['Halfway done!', 'Only {n} left!', 'Final stretch!'],
    },
    complete: ['Great job!', 'Excellent workout!', 'You did it!'],
    tempoSlow: 'Slower',
    tempoFast: 'Faster',
    tempoGood: 'Good tempo',
  },
};

// ============================================================================
// SERVICE
// ============================================================================

class VoiceGuidanceService {
  private config: VoiceGuidanceConfig;
  private queue: QueuedSpeech[] = [];
  private lastSpeechTime = 0;
  private lastPhase: ExercisePhase | null = null;
  private lastRep = 0;
  private isProcessing = false;
  private storageKey = 'voice_guidance_config';

  constructor() {
    this.config = this.loadConfig();
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * Start exercise guidance
   */
  startExercise(exerciseName: string, targetReps: number): void {
    if (!this.config.enabled) return;

    this.lastPhase = null;
    this.lastRep = 0;

    const phrases = PHRASES[this.config.language];
    this.queueSpeech(
      `${exerciseName}. ${targetReps} repetitioner.`,
      'high'
    );

    setTimeout(() => {
      this.queueSpeech(this.randomChoice(phrases.prepare), 'medium');
    }, 1500);
  }

  /**
   * Update with current exercise state
   */
  update(context: ExerciseContext): void {
    if (!this.config.enabled) return;

    const phrases = PHRASES[this.config.language];

    // Phase change
    if (context.currentPhase !== this.lastPhase) {
      this.handlePhaseChange(context.currentPhase, phrases);
      this.lastPhase = context.currentPhase;
    }

    // Rep complete
    if (context.currentRep > this.lastRep && context.currentRep > 0) {
      this.handleRepComplete(context, phrases);
      this.lastRep = context.currentRep;
    }

    // Form corrections (priority)
    if (this.config.speakCorrections && context.issues.length > 0) {
      this.handleFormCorrections(context.issues, phrases);
    }

    // Process queue
    this.processQueue();
  }

  /**
   * Speak immediate critical correction
   */
  speakCorrection(issue: string): void {
    if (!this.config.enabled || !this.config.speakCorrections) return;

    const phrases = PHRASES[this.config.language];
    const correction = (phrases.corrections as Record<string, string>)[issue] || issue;

    // Critical corrections bypass queue
    speechService.stop();
    speechService.speak(correction, { rate: 1.1, priority: true });
    hapticService.warning();
  }

  /**
   * Complete exercise
   */
  completeExercise(totalReps: number, avgFormScore: number): void {
    if (!this.config.enabled) return;

    const phrases = PHRASES[this.config.language];

    let message = this.randomChoice(phrases.complete);
    message += ` ${totalReps} repetitioner.`;

    if (avgFormScore >= 90) {
      message += ' Perfekt teknik!';
    } else if (avgFormScore >= 70) {
      message += ' Bra jobbat med formen.';
    }

    this.queueSpeech(message, 'high');
    this.processQueue();
  }

  /**
   * Speak breathing cue
   */
  speakBreathing(type: 'in' | 'out' | 'hold'): void {
    if (!this.config.enabled || !this.config.speakBreathing) return;

    const phrases = PHRASES[this.config.language];
    const text = type === 'in' ? phrases.breatheIn :
      type === 'out' ? phrases.breatheOut :
        phrases.holdBreath;

    this.queueSpeech(text, 'medium');
  }

  /**
   * Speak tempo feedback
   */
  speakTempo(type: 'slow' | 'fast' | 'good'): void {
    if (!this.config.enabled) return;

    const phrases = PHRASES[this.config.language];
    const text = type === 'slow' ? phrases.tempoSlow :
      type === 'fast' ? phrases.tempoFast :
        phrases.tempoGood;

    this.queueSpeech(text, 'low');
  }

  /**
   * Update configuration
   */
  setConfig(updates: Partial<VoiceGuidanceConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    logger.info('[VoiceGuidance] Config updated', updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): VoiceGuidanceConfig {
    return { ...this.config };
  }

  /**
   * Stop all guidance
   */
  stop(): void {
    this.queue = [];
    speechService.stop();
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  private handlePhaseChange(phase: ExercisePhase, phrases: typeof PHRASES['sv']): void {
    if (!this.config.speakPhases) return;

    let text: string | undefined;

    switch (phase) {
      case 'eccentric':
        text = this.randomChoice(phrases.eccentric);
        break;
      case 'hold':
        text = this.randomChoice(phrases.hold);
        break;
      case 'concentric':
        text = this.randomChoice(phrases.concentric);
        break;
      case 'rest':
        text = this.randomChoice(phrases.rest);
        break;
    }

    if (text) {
      this.queueSpeech(text, 'medium');
    }
  }

  private handleRepComplete(context: ExerciseContext, phrases: typeof PHRASES['sv']): void {
    const { currentRep, targetReps, formScore } = context;

    // Always speak rep count if enabled
    if (this.config.speakReps) {
      const repText = phrases.repComplete(currentRep, targetReps);
      this.queueSpeech(repText, 'high');
    }

    // Encouragement based on frequency
    if (this.config.speakEncouragement) {
      if (currentRep % this.config.encouragementFrequency === 0) {
        const encourageType = formScore >= 90 ? 'great' :
          formScore >= 70 ? 'good' : 'struggling';
        const text = this.randomChoice(phrases.encouragement[encourageType]);
        this.queueSpeech(text, 'low');
      }
    }

    // Milestone announcements
    if (currentRep === Math.floor(targetReps / 2)) {
      this.queueSpeech(phrases.encouragement.milestone[0], 'medium');
    } else if (currentRep === targetReps - 3) {
      this.queueSpeech(
        phrases.encouragement.milestone[1].replace('{n}', '3'),
        'medium'
      );
    }
  }

  private handleFormCorrections(issues: string[], phrases: typeof PHRASES['sv']): void {
    // Only speak first/most critical issue
    if (issues.length === 0) return;

    const now = Date.now();
    if (now - this.lastSpeechTime < 3000) return; // Don't spam corrections

    const issue = issues[0];
    const correction = (phrases.corrections as Record<string, string>)[issue];

    if (correction) {
      this.queueSpeech(correction, 'critical');
      hapticService.tap();
    }
  }

  private queueSpeech(text: string, priority: QueuedSpeech['priority']): void {
    this.queue.push({
      text,
      priority,
      timestamp: Date.now(),
    });

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Limit queue size
    if (this.queue.length > 5) {
      this.queue = this.queue.slice(0, 5);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    const now = Date.now();
    if (now - this.lastSpeechTime < this.config.minTimeBetweenSpeeches) return;

    const item = this.queue.shift();
    if (!item) return;

    // Skip old items
    if (now - item.timestamp > 5000 && item.priority !== 'critical') return;

    this.isProcessing = true;
    this.lastSpeechTime = now;

    try {
      await speechService.speak(item.text, {
        rate: item.priority === 'critical' ? 1.1 : 1.0,
        priority: item.priority === 'critical',
      });
    } catch (error) {
      logger.warn('[VoiceGuidance] Speech failed', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private loadConfig(): VoiceGuidanceConfig {
    const defaultConfig: VoiceGuidanceConfig = {
      enabled: true,
      volume: 0.8,
      language: 'sv',
      speakReps: true,
      speakPhases: true,
      speakCorrections: true,
      speakBreathing: false,
      speakEncouragement: true,
      encouragementFrequency: 3,
      minTimeBetweenSpeeches: 1000,
    };

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.warn('[VoiceGuidance] Failed to load config', error);
    }

    return defaultConfig;
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      logger.warn('[VoiceGuidance] Failed to save config', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const voiceGuidanceService = new VoiceGuidanceService();
export default voiceGuidanceService;
