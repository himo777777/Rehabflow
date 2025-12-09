/**
 * AnimationOrchestrator - Sprint 5: Timeline-based Synchronization
 *
 * Coordinates multiple animation tracks:
 * - Animation keyframes
 * - Speech timing
 * - Visual cues
 * - UI transitions
 *
 * Ensures perfect synchronization between all components.
 */

import {
  eventBus,
  emitPhaseChange,
  emitAnimationProgress,
  emitSpeechStart,
  emitSpeechEnd,
  emitVisemeUpdate,
  emitCueTrigger,
  emitTempoChange,
  PhaseType,
  Viseme,
} from './eventBus';

// ============================================================================
// TYPES
// ============================================================================

export interface TimelineEvent {
  time: number;           // Time in ms from start
  type: 'phase' | 'speech' | 'cue' | 'callback';
  data: any;
  executed?: boolean;
}

export interface AnimationTrackItem {
  startTime: number;
  endTime: number;
  phase: string;
  phaseType: PhaseType;
  description?: string;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface SpeechTrackItem {
  startTime: number;
  phrase: string;
  duration: number;
  preDelay?: number;
  visemes?: Array<{ time: number; viseme: Viseme }>;
}

export interface CueTrackItem {
  startTime: number;
  endTime?: number;
  cueId: string;
  cueType: 'arrow' | 'highlight' | 'path' | 'ring' | 'warning';
  targetJoint: string;
}

export interface Track<T> {
  name: string;
  items: T[];
  enabled: boolean;
}

export interface Timeline {
  name: string;
  duration: number;
  loop: boolean;
  tempo: number;
  tracks: {
    animation: Track<AnimationTrackItem>;
    speech: Track<SpeechTrackItem>;
    cues: Track<CueTrackItem>;
    events: Track<TimelineEvent>;
  };
}

export interface OrchestratorState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  progress: number;      // 0-1
  currentPhase: string;
  tempo: number;
  loopCount: number;
}

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ============================================================================
// ANIMATION ORCHESTRATOR CLASS
// ============================================================================

class AnimationOrchestrator {
  private timeline: Timeline | null = null;
  private state: OrchestratorState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    progress: 0,
    currentPhase: '',
    tempo: 1,
    loopCount: 0,
  };
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private executedEvents: Set<string> = new Set();
  private onCompleteCallback: (() => void) | null = null;
  private speechQueue: SpeechTrackItem[] = [];
  private activeCues: Set<string> = new Set();

  // ============================================================================
  // TIMELINE MANAGEMENT
  // ============================================================================

  /**
   * Create a new timeline
   */
  createTimeline(
    name: string,
    duration: number,
    options?: { loop?: boolean; tempo?: number }
  ): Timeline {
    const timeline: Timeline = {
      name,
      duration,
      loop: options?.loop ?? false,
      tempo: options?.tempo ?? 1,
      tracks: {
        animation: { name: 'animation', items: [], enabled: true },
        speech: { name: 'speech', items: [], enabled: true },
        cues: { name: 'cues', items: [], enabled: true },
        events: { name: 'events', items: [], enabled: true },
      },
    };
    return timeline;
  }

  /**
   * Load a timeline
   */
  loadTimeline(timeline: Timeline): void {
    this.timeline = timeline;
    this.state.tempo = timeline.tempo;
    this.reset();
    emitTempoChange(timeline.tempo);
  }

  /**
   * Get current timeline
   */
  getTimeline(): Timeline | null {
    return this.timeline;
  }

  // ============================================================================
  // TRACK MANAGEMENT
  // ============================================================================

  /**
   * Add animation phase to timeline
   */
  addAnimationPhase(
    startTime: number,
    endTime: number,
    phase: string,
    phaseType: PhaseType,
    options?: { description?: string; easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' }
  ): void {
    if (!this.timeline) return;

    this.timeline.tracks.animation.items.push({
      startTime,
      endTime,
      phase,
      phaseType,
      description: options?.description,
      easing: options?.easing ?? 'easeInOut',
    });

    // Sort by start time
    this.timeline.tracks.animation.items.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Add speech to timeline
   */
  addSpeech(
    startTime: number,
    phrase: string,
    duration: number,
    options?: { preDelay?: number; visemes?: Array<{ time: number; viseme: Viseme }> }
  ): void {
    if (!this.timeline) return;

    this.timeline.tracks.speech.items.push({
      startTime,
      phrase,
      duration,
      preDelay: options?.preDelay,
      visemes: options?.visemes,
    });

    this.timeline.tracks.speech.items.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Add visual cue to timeline
   */
  addCue(
    startTime: number,
    cueId: string,
    cueType: 'arrow' | 'highlight' | 'path' | 'ring' | 'warning',
    targetJoint: string,
    endTime?: number
  ): void {
    if (!this.timeline) return;

    this.timeline.tracks.cues.items.push({
      startTime,
      endTime,
      cueId,
      cueType,
      targetJoint,
    });

    this.timeline.tracks.cues.items.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Add custom event to timeline
   */
  addEvent(time: number, type: 'phase' | 'speech' | 'cue' | 'callback', data: any): void {
    if (!this.timeline) return;

    this.timeline.tracks.events.items.push({
      time,
      type,
      data,
      executed: false,
    });

    this.timeline.tracks.events.items.sort((a, b) => a.time - b.time);
  }

  // ============================================================================
  // PLAYBACK CONTROL
  // ============================================================================

  /**
   * Start playback
   */
  play(): void {
    if (!this.timeline || this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.lastFrameTime = performance.now();

    eventBus.emit({
      type: 'ANIMATION_START',
      exerciseName: this.timeline.name,
      duration: this.timeline.duration,
      timestamp: Date.now(),
    });

    this.tick();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.state.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resume playback
   */
  resume(): void {
    if (!this.state.isPaused) return;

    this.state.isPaused = false;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    eventBus.emit({
      type: 'ANIMATION_COMPLETE',
      exerciseName: this.timeline?.name || '',
      timestamp: Date.now(),
    });
  }

  /**
   * Reset to beginning
   */
  reset(): void {
    this.state.currentTime = 0;
    this.state.progress = 0;
    this.state.loopCount = 0;
    this.executedEvents.clear();
    this.activeCues.clear();
  }

  /**
   * Seek to specific time
   */
  seek(timeMs: number): void {
    if (!this.timeline) return;

    this.state.currentTime = Math.max(0, Math.min(timeMs, this.timeline.duration));
    this.state.progress = this.state.currentTime / this.timeline.duration;

    // Re-evaluate which events should be executed
    this.executedEvents.clear();
    this.evaluateTracksAtTime(this.state.currentTime, true);
  }

  /**
   * Set tempo multiplier
   */
  setTempo(tempo: number): void {
    this.state.tempo = Math.max(0.1, Math.min(3, tempo));
    if (this.timeline) {
      this.timeline.tempo = this.state.tempo;
    }
    emitTempoChange(this.state.tempo);
  }

  /**
   * Get current state
   */
  getState(): OrchestratorState {
    return { ...this.state };
  }

  /**
   * Set completion callback
   */
  onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================

  private tick = (): void => {
    if (!this.timeline || !this.state.isPlaying || this.state.isPaused) return;

    const now = performance.now();
    const deltaMs = (now - this.lastFrameTime) * this.state.tempo;
    this.lastFrameTime = now;

    // Update time
    this.state.currentTime += deltaMs;
    this.state.progress = this.state.currentTime / this.timeline.duration;

    // Check for completion
    if (this.state.currentTime >= this.timeline.duration) {
      if (this.timeline.loop) {
        this.state.currentTime = 0;
        this.state.loopCount++;
        this.executedEvents.clear();
      } else {
        this.state.progress = 1;
        this.stop();
        this.onCompleteCallback?.();
        return;
      }
    }

    // Evaluate all tracks
    this.evaluateTracksAtTime(this.state.currentTime);

    // Emit progress
    emitAnimationProgress(this.state.progress, this.state.currentPhase);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Evaluate all tracks at current time
   */
  private evaluateTracksAtTime(timeMs: number, seekMode: boolean = false): void {
    if (!this.timeline) return;

    // Animation phases
    if (this.timeline.tracks.animation.enabled) {
      this.evaluateAnimationTrack(timeMs);
    }

    // Speech
    if (this.timeline.tracks.speech.enabled) {
      this.evaluateSpeechTrack(timeMs, seekMode);
    }

    // Visual cues
    if (this.timeline.tracks.cues.enabled) {
      this.evaluateCueTrack(timeMs);
    }

    // Custom events
    if (this.timeline.tracks.events.enabled) {
      this.evaluateEventTrack(timeMs, seekMode);
    }
  }

  /**
   * Evaluate animation track
   */
  private evaluateAnimationTrack(timeMs: number): void {
    if (!this.timeline) return;

    const items = this.timeline.tracks.animation.items;
    let currentPhaseItem: AnimationTrackItem | null = null;

    for (const item of items) {
      if (timeMs >= item.startTime && timeMs < item.endTime) {
        currentPhaseItem = item;
        break;
      }
    }

    if (currentPhaseItem && currentPhaseItem.phase !== this.state.currentPhase) {
      this.state.currentPhase = currentPhaseItem.phase;
      emitPhaseChange(
        currentPhaseItem.phase,
        currentPhaseItem.phaseType,
        currentPhaseItem.endTime - currentPhaseItem.startTime,
        currentPhaseItem.description
      );
    }
  }

  /**
   * Evaluate speech track
   */
  private evaluateSpeechTrack(timeMs: number, seekMode: boolean): void {
    if (!this.timeline) return;

    const items = this.timeline.tracks.speech.items;

    for (const item of items) {
      const eventKey = `speech_${item.startTime}_${item.phrase}`;

      // Check if should start speech
      if (timeMs >= item.startTime && !this.executedEvents.has(eventKey) && !seekMode) {
        this.executedEvents.add(eventKey);
        emitSpeechStart(item.phrase, item.duration);

        // Schedule speech end
        setTimeout(() => {
          emitSpeechEnd(item.phrase);
        }, item.duration);

        // Process visemes if available
        if (item.visemes) {
          for (const v of item.visemes) {
            setTimeout(() => {
              emitVisemeUpdate(v.viseme, 1);
            }, v.time);
          }
        }
      }
    }
  }

  /**
   * Evaluate cue track
   */
  private evaluateCueTrack(timeMs: number): void {
    if (!this.timeline) return;

    const items = this.timeline.tracks.cues.items;

    for (const item of items) {
      const isActive = timeMs >= item.startTime &&
        (item.endTime === undefined || timeMs < item.endTime);

      if (isActive && !this.activeCues.has(item.cueId)) {
        this.activeCues.add(item.cueId);
        emitCueTrigger(item.cueId, item.cueType, item.targetJoint);
      } else if (!isActive && this.activeCues.has(item.cueId)) {
        this.activeCues.delete(item.cueId);
        eventBus.emit({
          type: 'CUE_CLEAR',
          cueId: item.cueId,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Evaluate event track
   */
  private evaluateEventTrack(timeMs: number, seekMode: boolean): void {
    if (!this.timeline || seekMode) return;

    const items = this.timeline.tracks.events.items;

    for (const item of items) {
      const eventKey = `event_${item.time}_${item.type}`;

      if (timeMs >= item.time && !this.executedEvents.has(eventKey)) {
        this.executedEvents.add(eventKey);

        if (item.type === 'callback' && typeof item.data === 'function') {
          item.data();
        }
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create timeline from exercise animation data
   */
  createFromExerciseAnimation(
    exerciseName: string,
    phases: Array<{
      name: string;
      startTime: number;
      endTime: number;
      description?: string;
      phaseType?: PhaseType;
    }>,
    options?: { duration?: number; loop?: boolean; tempo?: number }
  ): Timeline {
    const duration = options?.duration ||
      Math.max(...phases.map(p => p.endTime)) * 1000;

    const timeline = this.createTimeline(exerciseName, duration, {
      loop: options?.loop ?? true,
      tempo: options?.tempo ?? 1,
    });

    // Add phases
    for (const phase of phases) {
      this.loadTimeline(timeline);
      this.addAnimationPhase(
        phase.startTime * 1000,
        phase.endTime * 1000,
        phase.name,
        phase.phaseType || this.inferPhaseType(phase.name),
        { description: phase.description }
      );
    }

    return timeline;
  }

  /**
   * Infer phase type from phase name
   */
  private inferPhaseType(phaseName: string): PhaseType {
    const name = phaseName.toLowerCase();
    if (name.includes('sänk') || name.includes('ner') || name.includes('ned')) return 'eccentric';
    if (name.includes('lyft') || name.includes('upp') || name.includes('res')) return 'concentric';
    if (name.includes('håll') || name.includes('hold')) return 'hold';
    if (name.includes('vila') || name.includes('rest')) return 'rest';
    return 'transition';
  }

  /**
   * Sync speech to current phase timing
   */
  syncSpeechToPhase(phrase: string, phaseIndex: number, offset: number = 0): void {
    if (!this.timeline) return;

    const phases = this.timeline.tracks.animation.items;
    if (phaseIndex >= phases.length) return;

    const phase = phases[phaseIndex];
    const speechDuration = phrase.length * 50; // Rough estimate

    this.addSpeech(phase.startTime + offset, phrase, speechDuration);
  }

  /**
   * Generate viseme sequence for phrase
   * Simple phoneme-to-viseme mapping
   */
  generateVisemes(phrase: string, duration: number): Array<{ time: number; viseme: Viseme }> {
    const visemes: Array<{ time: number; viseme: Viseme }> = [];
    const vowelPattern = /[aeiouåäö]/gi;
    const matches = phrase.match(vowelPattern) || [];

    if (matches.length === 0) return visemes;

    const timePerVowel = duration / matches.length;

    matches.forEach((vowel, index) => {
      const viseme = this.vowelToViseme(vowel);
      visemes.push({
        time: index * timePerVowel,
        viseme,
      });
    });

    // Add rest at end
    visemes.push({ time: duration, viseme: 'rest' });

    return visemes;
  }

  /**
   * Map vowel to viseme
   */
  private vowelToViseme(vowel: string): Viseme {
    const v = vowel.toLowerCase();
    if (v === 'a' || v === 'å') return 'A';
    if (v === 'e' || v === 'ä') return 'E';
    if (v === 'i') return 'I';
    if (v === 'o') return 'O';
    if (v === 'u' || v === 'ö') return 'U';
    return 'A';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const animationOrchestrator = new AnimationOrchestrator();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick setup for exercise timeline
 */
export function setupExerciseTimeline(
  exerciseName: string,
  phases: Array<{
    name: string;
    duration: number;
    description?: string;
    speech?: string;
  }>,
  options?: { loop?: boolean; tempo?: number }
): void {
  let currentTime = 0;
  const timeline = animationOrchestrator.createTimeline(
    exerciseName,
    phases.reduce((sum, p) => sum + p.duration, 0),
    options
  );

  animationOrchestrator.loadTimeline(timeline);

  for (const phase of phases) {
    const phaseType = animationOrchestrator['inferPhaseType'](phase.name);

    animationOrchestrator.addAnimationPhase(
      currentTime,
      currentTime + phase.duration,
      phase.name,
      phaseType,
      { description: phase.description }
    );

    if (phase.speech) {
      const speechDuration = phase.speech.length * 50;
      const visemes = animationOrchestrator.generateVisemes(phase.speech, speechDuration);
      animationOrchestrator.addSpeech(currentTime + 100, phase.speech, speechDuration, { visemes });
    }

    currentTime += phase.duration;
  }
}

export default animationOrchestrator;
