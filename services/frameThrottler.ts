/**
 * Frame Throttler Service
 *
 * Del av FAS 8: Kamera & 3D Avatar Förbättringar
 *
 * Intelligens frame rate throttling som:
 * - Begränsar frames per sekund för att spara CPU
 * - Dynamiskt anpassar FPS baserat på processeringstid
 * - Stödjer olika övningstyper med olika krav
 */

export type ExerciseSpeed = 'slow' | 'normal' | 'fast';

interface ThrottlerConfig {
  targetFPS: number;
  minFPS: number;
  maxFPS: number;
  adaptiveThreshold: number; // % av frame interval som triggar anpassning
}

const DEFAULT_CONFIG: ThrottlerConfig = {
  targetFPS: 30,
  minFPS: 10,
  maxFPS: 30,
  adaptiveThreshold: 0.8
};

/**
 * Övningshastigheter och deras FPS-krav
 */
const EXERCISE_FPS_REQUIREMENTS: Record<string, ExerciseSpeed> = {
  // Snabba övningar - behöver högre FPS
  jumping_jacks: 'fast',
  burpees: 'fast',
  mountain_climbers: 'fast',
  high_knees: 'fast',
  box_jumps: 'fast',

  // Normala övningar
  squat: 'normal',
  lunge: 'normal',
  pushup: 'normal',
  step_up: 'normal',
  deadlift: 'normal',

  // Långsamma övningar - kan ha lägre FPS
  plank: 'slow',
  bridge: 'slow',
  bird_dog: 'slow',
  dead_bug: 'slow',
  wall_sit: 'slow',
  pendulum_swing: 'slow',
  external_rotation: 'slow',
  heel_slides: 'slow',
  straight_leg_raise: 'slow',
  clamshell: 'slow',
  cat_cow: 'slow',
  breathing_exercises: 'slow',
  isometric_activation: 'slow'
};

/**
 * Hämta FPS-krav för en övning
 */
export function getExerciseSpeed(exerciseName: string): ExerciseSpeed {
  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_');
  return EXERCISE_FPS_REQUIREMENTS[normalized] || 'normal';
}

/**
 * Hämta optimalt FPS för en övningstyp
 */
export function getOptimalFPS(exerciseSpeed: ExerciseSpeed, baseFPS: number): number {
  switch (exerciseSpeed) {
    case 'fast':
      return Math.min(baseFPS, 30); // Max 30 FPS för snabba övningar
    case 'normal':
      return Math.min(baseFPS * 0.8, 24); // ~20-24 FPS
    case 'slow':
      return Math.min(baseFPS * 0.5, 15); // ~10-15 FPS räcker
    default:
      return baseFPS;
  }
}

/**
 * Frame Throttler - kontrollerar när frames ska processas
 */
export class FrameThrottler {
  private config: ThrottlerConfig;
  private lastFrameTime = 0;
  private frameInterval: number;
  private processingTimes: number[] = [];
  private adaptationCooldown = 0;
  private currentFPS: number;

  constructor(config: Partial<ThrottlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentFPS = this.config.targetFPS;
    this.frameInterval = 1000 / this.currentFPS;
  }

  /**
   * Kontrollera om nästa frame ska processas
   */
  shouldProcessFrame(): boolean {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed >= this.frameInterval) {
      this.lastFrameTime = now - (elapsed % this.frameInterval);
      return true;
    }

    return false;
  }

  /**
   * Rapportera processeringstid för adaptiv anpassning
   */
  reportProcessingTime(timeMs: number): void {
    this.processingTimes.push(timeMs);

    // Behåll senaste 10 mätningar
    if (this.processingTimes.length > 10) {
      this.processingTimes.shift();
    }

    // Anpassa FPS om nödvändigt
    if (this.adaptationCooldown <= 0) {
      this.adaptFPS();
    } else {
      this.adaptationCooldown--;
    }
  }

  /**
   * Dynamisk FPS-anpassning baserat på processeringstid
   */
  private adaptFPS(): void {
    if (this.processingTimes.length < 5) return;

    const avgProcessingTime = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    const threshold = this.frameInterval * this.config.adaptiveThreshold;

    if (avgProcessingTime > threshold) {
      // Processering tar för lång tid - minska FPS
      const newFPS = Math.max(
        this.config.minFPS,
        Math.floor(this.currentFPS * 0.85)
      );

      if (newFPS !== this.currentFPS) {
        console.log(`[FrameThrottler] Reducing FPS: ${this.currentFPS} → ${newFPS} (avg processing: ${avgProcessingTime.toFixed(1)}ms)`);
        this.setFPS(newFPS);
        this.adaptationCooldown = 30; // Vänta 30 frames innan nästa anpassning
      }
    } else if (avgProcessingTime < threshold * 0.5) {
      // Vi har marginal - öka FPS försiktigt
      const newFPS = Math.min(
        this.config.maxFPS,
        Math.floor(this.currentFPS * 1.1)
      );

      if (newFPS !== this.currentFPS && newFPS <= this.config.targetFPS) {
        console.log(`[FrameThrottler] Increasing FPS: ${this.currentFPS} → ${newFPS}`);
        this.setFPS(newFPS);
        this.adaptationCooldown = 60; // Längre cooldown vid ökning
      }
    }
  }

  /**
   * Ändra FPS manuellt
   */
  setFPS(fps: number): void {
    this.currentFPS = Math.max(this.config.minFPS, Math.min(this.config.maxFPS, fps));
    this.frameInterval = 1000 / this.currentFPS;
  }

  /**
   * Anpassa FPS för en specifik övning
   */
  setExercise(exerciseName: string): void {
    const speed = getExerciseSpeed(exerciseName);
    const optimalFPS = getOptimalFPS(speed, this.config.targetFPS);
    this.setFPS(optimalFPS);
    console.log(`[FrameThrottler] Exercise "${exerciseName}" (${speed}) → ${optimalFPS} FPS`);
  }

  /**
   * Återställ till ursprungliga inställningar
   */
  reset(): void {
    this.currentFPS = this.config.targetFPS;
    this.frameInterval = 1000 / this.currentFPS;
    this.processingTimes = [];
    this.adaptationCooldown = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Hämta nuvarande status
   */
  getStatus(): { currentFPS: number; frameInterval: number; avgProcessingTime: number } {
    const avgProcessingTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      : 0;

    return {
      currentFPS: this.currentFPS,
      frameInterval: this.frameInterval,
      avgProcessingTime
    };
  }
}

/**
 * Skapa en förinstansierad throttler för enkel användning
 */
let defaultThrottler: FrameThrottler | null = null;

export function getDefaultThrottler(): FrameThrottler {
  if (!defaultThrottler) {
    defaultThrottler = new FrameThrottler();
  }
  return defaultThrottler;
}

export function resetDefaultThrottler(): void {
  if (defaultThrottler) {
    defaultThrottler.reset();
  }
}
