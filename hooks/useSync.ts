/**
 * useSync - Sprint 5: React Hook for Event Synchronization
 *
 * Provides reactive access to:
 * - Current animation phase
 * - Speech state
 * - Visual cue triggers
 * - Tempo changes
 * - Exercise progress
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  eventBus,
  EventType,
  SyncEvent,
  PhaseChangeEvent,
  AnimationStartEvent,
  AnimationProgressEvent,
  SpeechStartEvent,
  SpeechEndEvent,
  VisemeUpdateEvent,
  TempoChangeEvent,
  RepCountEvent,
  SetCountEvent,
  Viseme,
  PhaseType,
} from '../services/eventBus';

// ============================================================================
// TYPES
// ============================================================================

export interface PhaseState {
  name: string;
  type: PhaseType;
  description?: string;
  startTime: number;
  duration?: number;
}

export interface AnimationState {
  isPlaying: boolean;
  progress: number;
  currentPhase: string;
  exerciseName?: string;
}

export interface SpeechState {
  isSpeaking: boolean;
  currentPhrase?: string;
  startTime?: number;
  duration?: number;
}

export interface VisemeState {
  current: Viseme;
  intensity: number;
  lastUpdate: number;
}

export interface ExerciseProgress {
  currentRep: number;
  totalReps: number;
  currentSet: number;
  totalSets: number;
}

export interface SyncState {
  phase: PhaseState | null;
  animation: AnimationState;
  speech: SpeechState;
  viseme: VisemeState;
  tempo: number;
  progress: ExerciseProgress;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Main sync hook - provides full synchronization state
 */
export function useSync(): SyncState & {
  emitPhaseChange: (phase: string, type: PhaseType) => void;
  emitProgress: (progress: number) => void;
} {
  const [phase, setPhase] = useState<PhaseState | null>(null);
  const [animation, setAnimation] = useState<AnimationState>({
    isPlaying: false,
    progress: 0,
    currentPhase: '',
  });
  const [speech, setSpeech] = useState<SpeechState>({
    isSpeaking: false,
  });
  const [viseme, setViseme] = useState<VisemeState>({
    current: 'rest',
    intensity: 0,
    lastUpdate: 0,
  });
  const [tempo, setTempo] = useState(1);
  const [progress, setProgress] = useState<ExerciseProgress>({
    currentRep: 0,
    totalReps: 0,
    currentSet: 0,
    totalSets: 0,
  });

  useEffect(() => {
    // Phase changes
    const phaseSubId = eventBus.on('PHASE_CHANGE', (event: PhaseChangeEvent) => {
      setPhase({
        name: event.phase,
        type: event.phaseType,
        description: event.description,
        startTime: event.timestamp,
        duration: event.duration,
      });
      setAnimation((prev) => ({ ...prev, currentPhase: event.phase }));
    });

    // Animation start
    const animStartSubId = eventBus.on('ANIMATION_START', (event: AnimationStartEvent) => {
      setAnimation((prev) => ({
        ...prev,
        isPlaying: true,
        exerciseName: event.exerciseName,
      }));
    });

    // Animation complete
    const animCompleteSubId = eventBus.on('ANIMATION_COMPLETE', () => {
      setAnimation((prev) => ({ ...prev, isPlaying: false, progress: 1 }));
    });

    // Animation progress
    const animProgressSubId = eventBus.on('ANIMATION_PROGRESS', (event: AnimationProgressEvent) => {
      setAnimation((prev) => ({
        ...prev,
        progress: event.progress,
        currentPhase: event.currentPhase,
      }));
    });

    // Speech start
    const speechStartSubId = eventBus.on('SPEECH_START', (event: SpeechStartEvent) => {
      setSpeech({
        isSpeaking: true,
        currentPhrase: event.phrase,
        startTime: event.timestamp,
        duration: event.duration,
      });
    });

    // Speech end
    const speechEndSubId = eventBus.on('SPEECH_END', () => {
      setSpeech({ isSpeaking: false });
    });

    // Viseme update
    const visemeSubId = eventBus.on('VISEME_UPDATE', (event: VisemeUpdateEvent) => {
      setViseme({
        current: event.viseme,
        intensity: event.intensity,
        lastUpdate: event.timestamp,
      });
    });

    // Tempo change
    const tempoSubId = eventBus.on('TEMPO_CHANGE', (event: TempoChangeEvent) => {
      setTempo(event.tempo);
    });

    // Rep count
    const repSubId = eventBus.on('REP_COUNT', (event: RepCountEvent) => {
      setProgress((prev) => ({
        ...prev,
        currentRep: event.currentRep,
        totalReps: event.totalReps,
      }));
    });

    // Set count
    const setSubId = eventBus.on('SET_COUNT', (event: SetCountEvent) => {
      setProgress((prev) => ({
        ...prev,
        currentSet: event.currentSet,
        totalSets: event.totalSets,
      }));
    });

    // Cleanup
    return () => {
      eventBus.off(phaseSubId);
      eventBus.off(animStartSubId);
      eventBus.off(animCompleteSubId);
      eventBus.off(animProgressSubId);
      eventBus.off(speechStartSubId);
      eventBus.off(speechEndSubId);
      eventBus.off(visemeSubId);
      eventBus.off(tempoSubId);
      eventBus.off(repSubId);
      eventBus.off(setSubId);
    };
  }, []);

  // Convenience emitters
  const emitPhaseChange = useCallback((phaseName: string, type: PhaseType) => {
    eventBus.emit({
      type: 'PHASE_CHANGE',
      phase: phaseName,
      phaseType: type,
      timestamp: Date.now(),
    });
  }, []);

  const emitProgress = useCallback((progressValue: number) => {
    eventBus.emit({
      type: 'ANIMATION_PROGRESS',
      progress: progressValue,
      currentPhase: phase?.name || '',
      timestamp: Date.now(),
    });
  }, [phase]);

  return {
    phase,
    animation,
    speech,
    viseme,
    tempo,
    progress,
    emitPhaseChange,
    emitProgress,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for phase state only
 */
export function usePhase(): PhaseState | null {
  const [phase, setPhase] = useState<PhaseState | null>(null);

  useEffect(() => {
    const subId = eventBus.on('PHASE_CHANGE', (event: PhaseChangeEvent) => {
      setPhase({
        name: event.phase,
        type: event.phaseType,
        description: event.description,
        startTime: event.timestamp,
        duration: event.duration,
      });
    });
    return () => { eventBus.off(subId); };
  }, []);

  return phase;
}

/**
 * Hook for speech state only
 */
export function useSpeech(): SpeechState {
  const [speech, setSpeech] = useState<SpeechState>({ isSpeaking: false });

  useEffect(() => {
    const startSubId = eventBus.on('SPEECH_START', (event: SpeechStartEvent) => {
      setSpeech({
        isSpeaking: true,
        currentPhrase: event.phrase,
        startTime: event.timestamp,
        duration: event.duration,
      });
    });

    const endSubId = eventBus.on('SPEECH_END', () => {
      setSpeech({ isSpeaking: false });
    });

    return () => {
      eventBus.off(startSubId);
      eventBus.off(endSubId);
    };
  }, []);

  return speech;
}

/**
 * Hook for viseme state only
 */
export function useViseme(): VisemeState {
  const [viseme, setViseme] = useState<VisemeState>({
    current: 'rest',
    intensity: 0,
    lastUpdate: 0,
  });

  useEffect(() => {
    const subId = eventBus.on('VISEME_UPDATE', (event: VisemeUpdateEvent) => {
      setViseme({
        current: event.viseme,
        intensity: event.intensity,
        lastUpdate: event.timestamp,
      });
    });
    return () => { eventBus.off(subId); };
  }, []);

  return viseme;
}

/**
 * Hook for tempo only
 */
export function useTempo(): number {
  const [tempo, setTempo] = useState(1);

  useEffect(() => {
    const subId = eventBus.on('TEMPO_CHANGE', (event: TempoChangeEvent) => {
      setTempo(event.tempo);
    });
    return () => { eventBus.off(subId); };
  }, []);

  return tempo;
}

/**
 * Hook for exercise progress
 */
export function useExerciseProgress(): ExerciseProgress {
  const [progress, setProgress] = useState<ExerciseProgress>({
    currentRep: 0,
    totalReps: 0,
    currentSet: 0,
    totalSets: 0,
  });

  useEffect(() => {
    const repSubId = eventBus.on('REP_COUNT', (event: RepCountEvent) => {
      setProgress((prev) => ({
        ...prev,
        currentRep: event.currentRep,
        totalReps: event.totalReps,
      }));
    });

    const setSubId = eventBus.on('SET_COUNT', (event: SetCountEvent) => {
      setProgress((prev) => ({
        ...prev,
        currentSet: event.currentSet,
        totalSets: event.totalSets,
      }));
    });

    return () => {
      eventBus.off(repSubId);
      eventBus.off(setSubId);
    };
  }, []);

  return progress;
}

/**
 * Generic event listener hook
 */
export function useEventListener<T extends SyncEvent>(
  type: T['type'],
  handler: (event: T) => void,
  deps: any[] = []
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const subId = eventBus.on(type, (event) => {
      handlerRef.current(event as T);
    });
    return () => { eventBus.off(subId); };
  }, [type, ...deps]);
}

/**
 * Wait for event hook
 */
export function useWaitForEvent<T extends SyncEvent>(
  type: T['type']
): { waiting: boolean; event: T | null; reset: () => void } {
  const [waiting, setWaiting] = useState(true);
  const [event, setEvent] = useState<T | null>(null);

  useEffect(() => {
    const subId = eventBus.once(type, (e) => {
      setEvent(e as T);
      setWaiting(false);
    });
    return () => { eventBus.off(subId); };
  }, [type]);

  const reset = useCallback(() => {
    setWaiting(true);
    setEvent(null);
  }, []);

  return { waiting, event, reset };
}

/**
 * Animation frame sync hook
 * Provides smooth interpolation between events
 */
export function useAnimationSync(enabled: boolean = true): {
  progress: number;
  phase: string;
  isPlaying: boolean;
} {
  const [state, setState] = useState({
    progress: 0,
    phase: '',
    isPlaying: false,
  });
  const targetProgressRef = useRef(0);
  const frameIdRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const animProgressSubId = eventBus.on('ANIMATION_PROGRESS', (event: AnimationProgressEvent) => {
      targetProgressRef.current = event.progress;
      setState((prev) => ({
        ...prev,
        phase: event.currentPhase,
        isPlaying: true,
      }));
    });

    const animCompleteSubId = eventBus.on('ANIMATION_COMPLETE', () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    });

    // Smooth interpolation loop
    const animate = () => {
      setState((prev) => {
        const diff = targetProgressRef.current - prev.progress;
        if (Math.abs(diff) < 0.001) return prev;
        return {
          ...prev,
          progress: prev.progress + diff * 0.1, // Smooth lerp
        };
      });
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      eventBus.off(animProgressSubId);
      eventBus.off(animCompleteSubId);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [enabled]);

  return state;
}

export default useSync;
