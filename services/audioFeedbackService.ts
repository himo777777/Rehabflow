/**
 * Audio Feedback Service - Sprint 5.5
 *
 * Provides audio cues and voice feedback during exercises.
 * Uses Web Speech API for text-to-speech and Web Audio API for sounds.
 *
 * Features:
 * - Text-to-speech for exercise instructions
 * - Sound effects for feedback (correct, warning, completion)
 * - Volume control and muting
 * - Queue management for sequential announcements
 * - Swedish language support
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type SoundType =
  | 'start'
  | 'complete'
  | 'correct'
  | 'warning'
  | 'error'
  | 'tick'
  | 'phase_change'
  | 'countdown'
  | 'achievement'
  | 'rest';

export interface AudioFeedbackConfig {
  /** Enable voice feedback */
  voiceEnabled: boolean;
  /** Enable sound effects */
  soundEnabled: boolean;
  /** Volume 0-1 */
  volume: number;
  /** Speech rate 0.5-2 */
  speechRate: number;
  /** Speech pitch 0-2 */
  speechPitch: number;
  /** Preferred language (sv-SE, en-US) */
  language: string;
  /** Queue announcements or interrupt */
  queueAnnouncements: boolean;
}

interface QueuedAnnouncement {
  text: string;
  priority: 'low' | 'normal' | 'high';
  timestamp: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: AudioFeedbackConfig = {
  voiceEnabled: true,
  soundEnabled: true,
  volume: 0.7,
  speechRate: 1.0,
  speechPitch: 1.0,
  language: 'sv-SE',
  queueAnnouncements: true,
};

// ============================================================================
// SOUND FREQUENCIES (for generated tones)
// ============================================================================

const SOUND_DEFINITIONS: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  start: { frequencies: [440, 554, 659], durations: [0.1, 0.1, 0.2], type: 'sine' },
  complete: { frequencies: [523, 659, 784, 1047], durations: [0.15, 0.15, 0.15, 0.3], type: 'sine' },
  correct: { frequencies: [523, 659], durations: [0.1, 0.15], type: 'sine' },
  warning: { frequencies: [440, 349], durations: [0.15, 0.2], type: 'triangle' },
  error: { frequencies: [200, 180], durations: [0.2, 0.3], type: 'sawtooth' },
  tick: { frequencies: [800], durations: [0.05], type: 'sine' },
  phase_change: { frequencies: [440, 523, 659], durations: [0.1, 0.1, 0.15], type: 'sine' },
  countdown: { frequencies: [440], durations: [0.1], type: 'sine' },
  achievement: { frequencies: [523, 659, 784, 1047, 1319], durations: [0.1, 0.1, 0.1, 0.1, 0.4], type: 'sine' },
  rest: { frequencies: [349, 294], durations: [0.2, 0.3], type: 'sine' },
};

// ============================================================================
// SWEDISH VOICE PHRASES
// ============================================================================

const PHRASES = {
  sv: {
    start: 'Börja övningen',
    complete: 'Bra jobbat! Övningen är klar.',
    rest: 'Vila nu',
    nextPhase: 'Nästa fas',
    halfway: 'Halvvägs där!',
    almostDone: 'Nästan klar!',
    breatheIn: 'Andas in',
    breatheOut: 'Andas ut',
    holdPosition: 'Håll positionen',
    slowDown: 'Sakta ner',
    speedUp: 'Snabba på lite',
    goodForm: 'Bra teknik!',
    adjustForm: 'Justera din position',
    countdown: (n: number) => `${n}`,
    reps: (n: number) => `${n} repetitioner kvar`,
    seconds: (n: number) => `${n} sekunder`,
  },
  en: {
    start: 'Begin exercise',
    complete: 'Well done! Exercise complete.',
    rest: 'Rest now',
    nextPhase: 'Next phase',
    halfway: 'Halfway there!',
    almostDone: 'Almost done!',
    breatheIn: 'Breathe in',
    breatheOut: 'Breathe out',
    holdPosition: 'Hold the position',
    slowDown: 'Slow down',
    speedUp: 'Speed up a little',
    goodForm: 'Good form!',
    adjustForm: 'Adjust your position',
    countdown: (n: number) => `${n}`,
    reps: (n: number) => `${n} reps remaining`,
    seconds: (n: number) => `${n} seconds`,
  },
};

// ============================================================================
// AUDIO FEEDBACK SERVICE
// ============================================================================

class AudioFeedbackService {
  private config: AudioFeedbackConfig = DEFAULT_CONFIG;
  private audioContext: AudioContext | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private announcementQueue: QueuedAnnouncement[] = [];
  private isProcessingQueue: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private lastSoundTime: number = 0;
  private minSoundInterval: number = 100; // ms between sounds

  constructor() {
    this.initializeSpeech();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private initializeSpeech(): void {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;

      // Load voices (may be async)
      const loadVoices = () => {
        const voices = this.speechSynthesis?.getVoices() || [];
        this.selectBestVoice(voices);
      };

      loadVoices();

      // Some browsers load voices async
      if (this.speechSynthesis.onvoiceschanged !== undefined) {
        this.speechSynthesis.onvoiceschanged = loadVoices;
      }

      logger.debug('[AudioFeedback] Speech synthesis initialized');
    } else {
      logger.warn('[AudioFeedback] Speech synthesis not supported');
    }
  }

  private selectBestVoice(voices: SpeechSynthesisVoice[]): void {
    const lang = this.config.language;

    // Try to find a voice matching the language
    this.selectedVoice =
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang.startsWith(lang.split('-')[0])) ||
      voices.find((v) => v.default) ||
      voices[0] ||
      null;

    if (this.selectedVoice) {
      logger.debug('[AudioFeedback] Selected voice:', this.selectedVoice.name);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch (e) {
        logger.error('[AudioFeedback] Failed to create AudioContext:', e);
      }
    }
    return this.audioContext;
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  public configure(config: Partial<AudioFeedbackConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.language) {
      const voices = this.speechSynthesis?.getVoices() || [];
      this.selectBestVoice(voices);
    }

    logger.debug('[AudioFeedback] Config updated:', this.config);
  }

  public getConfig(): AudioFeedbackConfig {
    return { ...this.config };
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  public mute(): void {
    this.isMuted = true;
    this.stopSpeaking();
  }

  public unmute(): void {
    this.isMuted = false;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeaking();
    }
    return this.isMuted;
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  // --------------------------------------------------------------------------
  // SOUND EFFECTS
  // --------------------------------------------------------------------------

  public playSound(type: SoundType): void {
    if (this.isMuted || !this.config.soundEnabled) return;

    // Throttle sounds
    const now = Date.now();
    if (now - this.lastSoundTime < this.minSoundInterval) return;
    this.lastSoundTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (required by browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const definition = SOUND_DEFINITIONS[type];
    if (!definition) return;

    let currentTime = ctx.currentTime;

    definition.frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = definition.type;
      oscillator.frequency.setValueAtTime(freq, currentTime);

      gainNode.gain.setValueAtTime(this.config.volume * 0.3, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + definition.durations[i]);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + definition.durations[i]);

      currentTime += definition.durations[i];
    });
  }

  // --------------------------------------------------------------------------
  // SPEECH
  // --------------------------------------------------------------------------

  public speak(text: string, priority: 'low' | 'normal' | 'high' = 'normal'): void {
    if (this.isMuted || !this.config.voiceEnabled || !this.speechSynthesis) return;

    const announcement: QueuedAnnouncement = {
      text,
      priority,
      timestamp: Date.now(),
    };

    if (priority === 'high') {
      // High priority interrupts current speech
      this.stopSpeaking();
      this.announcementQueue.unshift(announcement);
    } else if (this.config.queueAnnouncements) {
      this.announcementQueue.push(announcement);
    } else {
      // Replace current queue
      this.stopSpeaking();
      this.announcementQueue = [announcement];
    }

    this.processQueue();
  }

  private processQueue(): void {
    if (this.isProcessingQueue || this.announcementQueue.length === 0) return;
    if (this.speechSynthesis?.speaking) return;

    this.isProcessingQueue = true;

    const announcement = this.announcementQueue.shift();
    if (!announcement) {
      this.isProcessingQueue = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(announcement.text);
    utterance.rate = this.config.speechRate;
    utterance.pitch = this.config.speechPitch;
    utterance.volume = this.config.volume;
    utterance.lang = this.config.language;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      this.isProcessingQueue = false;
      // Process next in queue
      setTimeout(() => this.processQueue(), 100);
    };

    utterance.onerror = (event) => {
      logger.error('[AudioFeedback] Speech error:', event.error);
      this.currentUtterance = null;
      this.isProcessingQueue = false;
      this.processQueue();
    };

    this.currentUtterance = utterance;
    this.speechSynthesis?.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isProcessingQueue = false;
  }

  public clearQueue(): void {
    this.announcementQueue = [];
    this.stopSpeaking();
  }

  // --------------------------------------------------------------------------
  // EXERCISE-SPECIFIC FEEDBACK
  // --------------------------------------------------------------------------

  private getPhrase(key: keyof typeof PHRASES.sv): string {
    const lang = this.config.language.startsWith('sv') ? 'sv' : 'en';
    const phrase = PHRASES[lang][key];
    return typeof phrase === 'function' ? '' : phrase;
  }

  public announceExerciseStart(exerciseName?: string): void {
    this.playSound('start');
    const text = exerciseName
      ? `${this.getPhrase('start')}: ${exerciseName}`
      : this.getPhrase('start');
    this.speak(text, 'high');
  }

  public announceExerciseComplete(): void {
    this.playSound('complete');
    this.speak(this.getPhrase('complete'), 'high');
  }

  public announcePhaseChange(phaseName?: string): void {
    this.playSound('phase_change');
    const text = phaseName || this.getPhrase('nextPhase');
    this.speak(text);
  }

  public announceRest(duration?: number): void {
    this.playSound('rest');
    const lang = this.config.language.startsWith('sv') ? 'sv' : 'en';
    const text = duration
      ? `${this.getPhrase('rest')}. ${PHRASES[lang].seconds(duration)}`
      : this.getPhrase('rest');
    this.speak(text);
  }

  public announceCountdown(count: number): void {
    this.playSound('countdown');
    const lang = this.config.language.startsWith('sv') ? 'sv' : 'en';
    this.speak(PHRASES[lang].countdown(count), 'high');
  }

  public announceRepsRemaining(reps: number): void {
    const lang = this.config.language.startsWith('sv') ? 'sv' : 'en';
    this.speak(PHRASES[lang].reps(reps));
  }

  public announceBreathing(type: 'in' | 'out'): void {
    const phrase = type === 'in' ? 'breatheIn' : 'breatheOut';
    this.speak(this.getPhrase(phrase));
  }

  public announceFormFeedback(isGood: boolean, customMessage?: string): void {
    if (isGood) {
      this.playSound('correct');
      this.speak(customMessage || this.getPhrase('goodForm'), 'low');
    } else {
      this.playSound('warning');
      this.speak(customMessage || this.getPhrase('adjustForm'));
    }
  }

  public announceAchievement(achievementName?: string): void {
    this.playSound('achievement');
    const text = achievementName || 'Ny prestation!';
    this.speak(text, 'high');
  }

  public announceProgress(type: 'halfway' | 'almostDone'): void {
    this.playSound('correct');
    this.speak(this.getPhrase(type));
  }

  public announceTempo(type: 'slow' | 'fast'): void {
    const phrase = type === 'slow' ? 'slowDown' : 'speedUp';
    this.playSound('warning');
    this.speak(this.getPhrase(phrase));
  }

  public tick(): void {
    this.playSound('tick');
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  public dispose(): void {
    this.clearQueue();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    logger.debug('[AudioFeedback] Disposed');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const audioFeedbackService = new AudioFeedbackService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useAudioFeedback() {
  const [isMuted, setIsMuted] = useState(audioFeedbackService.isMutedState());
  const [volume, setVolumeState] = useState(audioFeedbackService.getConfig().volume);

  useEffect(() => {
    return () => {
      // Don't dispose the singleton, just clear queue
      audioFeedbackService.clearQueue();
    };
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = audioFeedbackService.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);

  const setVolume = useCallback((v: number) => {
    audioFeedbackService.setVolume(v);
    setVolumeState(v);
  }, []);

  const configure = useCallback((config: Partial<AudioFeedbackConfig>) => {
    audioFeedbackService.configure(config);
    if (config.volume !== undefined) {
      setVolumeState(config.volume);
    }
  }, []);

  return {
    // State
    isMuted,
    volume,

    // Controls
    toggleMute,
    setVolume,
    configure,
    mute: audioFeedbackService.mute.bind(audioFeedbackService),
    unmute: audioFeedbackService.unmute.bind(audioFeedbackService),

    // Sound effects
    playSound: audioFeedbackService.playSound.bind(audioFeedbackService),

    // Speech
    speak: audioFeedbackService.speak.bind(audioFeedbackService),
    stopSpeaking: audioFeedbackService.stopSpeaking.bind(audioFeedbackService),
    clearQueue: audioFeedbackService.clearQueue.bind(audioFeedbackService),

    // Exercise feedback
    announceExerciseStart: audioFeedbackService.announceExerciseStart.bind(audioFeedbackService),
    announceExerciseComplete: audioFeedbackService.announceExerciseComplete.bind(audioFeedbackService),
    announcePhaseChange: audioFeedbackService.announcePhaseChange.bind(audioFeedbackService),
    announceRest: audioFeedbackService.announceRest.bind(audioFeedbackService),
    announceCountdown: audioFeedbackService.announceCountdown.bind(audioFeedbackService),
    announceRepsRemaining: audioFeedbackService.announceRepsRemaining.bind(audioFeedbackService),
    announceBreathing: audioFeedbackService.announceBreathing.bind(audioFeedbackService),
    announceFormFeedback: audioFeedbackService.announceFormFeedback.bind(audioFeedbackService),
    announceAchievement: audioFeedbackService.announceAchievement.bind(audioFeedbackService),
    announceProgress: audioFeedbackService.announceProgress.bind(audioFeedbackService),
    announceTempo: audioFeedbackService.announceTempo.bind(audioFeedbackService),
    tick: audioFeedbackService.tick.bind(audioFeedbackService),
  };
}

export default audioFeedbackService;
