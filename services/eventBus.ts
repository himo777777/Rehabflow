/**
 * EventBus - Sprint 5: Central Event Coordinator
 *
 * Provides pub/sub event system for synchronizing:
 * - Animation states
 * - Speech events
 * - Phase transitions
 * - Visual cues
 * - UI updates
 */

// ============================================================================
// EVENT TYPES
// ============================================================================

export type PhaseType = 'eccentric' | 'concentric' | 'isometric' | 'hold' | 'rest' | 'transition';
export type Viseme = 'rest' | 'A' | 'E' | 'I' | 'O' | 'U';

export interface PhaseChangeEvent {
  type: 'PHASE_CHANGE';
  phase: string;
  phaseType: PhaseType;
  timestamp: number;
  duration?: number;
  description?: string;
}

export interface AnimationStartEvent {
  type: 'ANIMATION_START';
  exerciseName: string;
  duration: number;
  timestamp: number;
}

export interface AnimationCompleteEvent {
  type: 'ANIMATION_COMPLETE';
  exerciseName: string;
  timestamp: number;
}

export interface AnimationProgressEvent {
  type: 'ANIMATION_PROGRESS';
  progress: number; // 0-1
  currentPhase: string;
  timestamp: number;
}

export interface SpeechStartEvent {
  type: 'SPEECH_START';
  phrase: string;
  duration: number;
  timestamp: number;
}

export interface SpeechEndEvent {
  type: 'SPEECH_END';
  phrase: string;
  timestamp: number;
}

export interface SpeechProgressEvent {
  type: 'SPEECH_PROGRESS';
  progress: number; // 0-1
  timestamp: number;
}

export interface VisemeUpdateEvent {
  type: 'VISEME_UPDATE';
  viseme: Viseme;
  intensity: number; // 0-1
  timestamp: number;
}

export interface CueTriggerEvent {
  type: 'CUE_TRIGGER';
  cueId: string;
  cueType: 'arrow' | 'highlight' | 'path' | 'ring' | 'warning';
  targetJoint: string;
  timestamp: number;
}

export interface CueClearEvent {
  type: 'CUE_CLEAR';
  cueId?: string; // undefined = clear all
  timestamp: number;
}

export interface TempoChangeEvent {
  type: 'TEMPO_CHANGE';
  tempo: number;
  timestamp: number;
}

export interface RepCountEvent {
  type: 'REP_COUNT';
  currentRep: number;
  totalReps: number;
  timestamp: number;
}

export interface SetCountEvent {
  type: 'SET_COUNT';
  currentSet: number;
  totalSets: number;
  timestamp: number;
}

export interface ExerciseStartEvent {
  type: 'EXERCISE_START';
  exerciseName: string;
  totalReps: number;
  totalSets: number;
  timestamp: number;
}

export interface ExerciseEndEvent {
  type: 'EXERCISE_END';
  exerciseName: string;
  completed: boolean;
  timestamp: number;
}

export interface ErrorEvent {
  type: 'ERROR';
  errorType: 'animation' | 'speech' | 'sync' | 'network';
  message: string;
  recoverable: boolean;
  timestamp: number;
}

export interface SyncRequestEvent {
  type: 'SYNC_REQUEST';
  requestId: string;
  components: string[];
  timestamp: number;
}

export interface SyncCompleteEvent {
  type: 'SYNC_COMPLETE';
  requestId: string;
  success: boolean;
  timestamp: number;
}

// Union type of all events
export type SyncEvent =
  | PhaseChangeEvent
  | AnimationStartEvent
  | AnimationCompleteEvent
  | AnimationProgressEvent
  | SpeechStartEvent
  | SpeechEndEvent
  | SpeechProgressEvent
  | VisemeUpdateEvent
  | CueTriggerEvent
  | CueClearEvent
  | TempoChangeEvent
  | RepCountEvent
  | SetCountEvent
  | ExerciseStartEvent
  | ExerciseEndEvent
  | ErrorEvent
  | SyncRequestEvent
  | SyncCompleteEvent;

export type EventType = SyncEvent['type'];

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type EventHandler<T extends SyncEvent = SyncEvent> = (event: T) => void;

export interface EventSubscription {
  id: string;
  type: EventType;
  handler: EventHandler;
  priority: number;
  once: boolean;
}

// ============================================================================
// EVENT BUS CLASS
// ============================================================================

class EventBus {
  private subscriptions: Map<EventType, EventSubscription[]> = new Map();
  private eventHistory: SyncEvent[] = [];
  private maxHistorySize = 100;
  private subscriptionIdCounter = 0;
  private isPaused = false;
  private queuedEvents: SyncEvent[] = [];

  /**
   * Subscribe to an event type
   */
  on<T extends SyncEvent>(
    type: T['type'],
    handler: EventHandler<T>,
    options?: { priority?: number; once?: boolean }
  ): string {
    const id = `sub_${++this.subscriptionIdCounter}`;
    const subscription: EventSubscription = {
      id,
      type,
      handler: handler as EventHandler,
      priority: options?.priority ?? 0,
      once: options?.once ?? false,
    };

    const existing = this.subscriptions.get(type) || [];
    existing.push(subscription);
    // Sort by priority (higher first)
    existing.sort((a, b) => b.priority - a.priority);
    this.subscriptions.set(type, existing);

    return id;
  }

  /**
   * Subscribe to an event type once
   */
  once<T extends SyncEvent>(
    type: T['type'],
    handler: EventHandler<T>,
    priority?: number
  ): string {
    return this.on(type, handler, { priority, once: true });
  }

  /**
   * Unsubscribe by subscription ID
   */
  off(subscriptionId: string): boolean {
    for (const [type, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Unsubscribe all handlers for an event type
   */
  offAll(type: EventType): void {
    this.subscriptions.delete(type);
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T extends SyncEvent>(event: T): void {
    // Add timestamp if not present
    if (!event.timestamp) {
      (event as any).timestamp = Date.now();
    }

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Queue if paused
    if (this.isPaused) {
      this.queuedEvents.push(event);
      return;
    }

    this.dispatch(event);
  }

  /**
   * Dispatch event to handlers
   */
  private dispatch(event: SyncEvent): void {
    const subs = this.subscriptions.get(event.type);
    if (!subs) return;

    const toRemove: string[] = [];

    for (const sub of subs) {
      try {
        sub.handler(event);
        if (sub.once) {
          toRemove.push(sub.id);
        }
      } catch (error) {
        console.error(`[EventBus] Handler error for ${event.type}:`, error);
      }
    }

    // Remove one-time handlers
    for (const id of toRemove) {
      this.off(id);
    }
  }

  /**
   * Emit multiple events in sequence with optional delays
   */
  async emitSequence(events: Array<{ event: SyncEvent; delayMs?: number }>): Promise<void> {
    for (const { event, delayMs } of events) {
      if (delayMs && delayMs > 0) {
        await this.delay(delayMs);
      }
      this.emit(event);
    }
  }

  /**
   * Pause event dispatching (events will be queued)
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume event dispatching and flush queued events
   */
  resume(): void {
    this.isPaused = false;
    const queued = [...this.queuedEvents];
    this.queuedEvents = [];
    for (const event of queued) {
      this.dispatch(event);
    }
  }

  /**
   * Get event history
   */
  getHistory(type?: EventType, limit?: number): SyncEvent[] {
    let history = type
      ? this.eventHistory.filter((e) => e.type === type)
      : this.eventHistory;

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Get last event of a type
   */
  getLastEvent<T extends SyncEvent>(type: T['type']): T | undefined {
    const history = this.getHistory(type, 1);
    return history[0] as T | undefined;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(type?: EventType): number {
    if (type) {
      return this.subscriptions.get(type)?.length ?? 0;
    }
    let total = 0;
    for (const subs of this.subscriptions.values()) {
      total += subs.length;
    }
    return total;
  }

  /**
   * Wait for an event
   */
  waitFor<T extends SyncEvent>(
    type: T['type'],
    timeoutMs?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = timeoutMs
        ? setTimeout(() => {
            this.off(subId);
            reject(new Error(`Timeout waiting for ${type}`));
          }, timeoutMs)
        : null;

      const subId = this.once(type, (event) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(event as T);
      });
    });
  }

  /**
   * Debug: log all subscriptions
   */
  debugSubscriptions(): void {
    console.log('[EventBus] Subscriptions:');
    for (const [type, subs] of this.subscriptions.entries()) {
      console.log(`  ${type}: ${subs.length} handlers`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const eventBus = new EventBus();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Emit a phase change event
 */
export function emitPhaseChange(
  phase: string,
  phaseType: PhaseType,
  duration?: number,
  description?: string
): void {
  eventBus.emit({
    type: 'PHASE_CHANGE',
    phase,
    phaseType,
    duration,
    description,
    timestamp: Date.now(),
  });
}

/**
 * Emit animation start event
 */
export function emitAnimationStart(exerciseName: string, duration: number): void {
  eventBus.emit({
    type: 'ANIMATION_START',
    exerciseName,
    duration,
    timestamp: Date.now(),
  });
}

/**
 * Emit animation progress event
 */
export function emitAnimationProgress(progress: number, currentPhase: string): void {
  eventBus.emit({
    type: 'ANIMATION_PROGRESS',
    progress,
    currentPhase,
    timestamp: Date.now(),
  });
}

/**
 * Emit speech start event
 */
export function emitSpeechStart(phrase: string, duration: number): void {
  eventBus.emit({
    type: 'SPEECH_START',
    phrase,
    duration,
    timestamp: Date.now(),
  });
}

/**
 * Emit speech end event
 */
export function emitSpeechEnd(phrase: string): void {
  eventBus.emit({
    type: 'SPEECH_END',
    phrase,
    timestamp: Date.now(),
  });
}

/**
 * Emit viseme update event
 */
export function emitVisemeUpdate(viseme: Viseme, intensity: number = 1): void {
  eventBus.emit({
    type: 'VISEME_UPDATE',
    viseme,
    intensity,
    timestamp: Date.now(),
  });
}

/**
 * Emit cue trigger event
 */
export function emitCueTrigger(
  cueId: string,
  cueType: 'arrow' | 'highlight' | 'path' | 'ring' | 'warning',
  targetJoint: string
): void {
  eventBus.emit({
    type: 'CUE_TRIGGER',
    cueId,
    cueType,
    targetJoint,
    timestamp: Date.now(),
  });
}

/**
 * Emit tempo change event
 */
export function emitTempoChange(tempo: number): void {
  eventBus.emit({
    type: 'TEMPO_CHANGE',
    tempo,
    timestamp: Date.now(),
  });
}

/**
 * Emit rep count event
 */
export function emitRepCount(currentRep: number, totalReps: number): void {
  eventBus.emit({
    type: 'REP_COUNT',
    currentRep,
    totalReps,
    timestamp: Date.now(),
  });
}

/**
 * Emit error event
 */
export function emitError(
  errorType: 'animation' | 'speech' | 'sync' | 'network',
  message: string,
  recoverable: boolean = true
): void {
  eventBus.emit({
    type: 'ERROR',
    errorType,
    message,
    recoverable,
    timestamp: Date.now(),
  });
}

export default eventBus;
