/**
 * Haptic Feedback Service - Sprint 5.3
 *
 * Provides haptic (vibration) feedback for mobile devices to enhance
 * the user experience during exercises.
 *
 * Features:
 * - Predefined vibration patterns for different events
 * - Respects user preferences (reduced motion)
 * - Graceful fallback on unsupported devices
 * - Throttling to prevent vibration spam
 */

// ============================================================================
// TYPES
// ============================================================================

export type HapticPatternName =
  | 'success'           // Short success vibration
  | 'repComplete'       // Rep completed
  | 'setComplete'       // Set completed
  | 'exerciseComplete'  // Full exercise completed
  | 'warning'           // Form warning or attention needed
  | 'error'             // Error occurred
  | 'achievement'       // Achievement unlocked
  | 'countdown'         // Countdown tick
  | 'start'             // Exercise start
  | 'phaseChange'       // Phase transition
  | 'tap'               // Light tap feedback
  | 'doubleTap';        // Double tap feedback

export interface HapticPattern {
  /** Vibration pattern array (duration in ms, alternating on/off) */
  pattern: number[];
  /** Human-readable description */
  description: string;
  /** Intensity level 1-3 (for documentation, not supported by all devices) */
  intensity: 1 | 2 | 3;
}

export interface HapticConfig {
  /** Enable/disable haptic feedback globally */
  enabled: boolean;
  /** Respect prefers-reduced-motion setting */
  respectReducedMotion: boolean;
  /** Minimum time between vibrations (ms) to prevent spam */
  throttleMs: number;
  /** Custom patterns to add/override */
  customPatterns?: Partial<Record<HapticPatternName, HapticPattern>>;
}

// ============================================================================
// PREDEFINED PATTERNS
// ============================================================================

/**
 * Predefined haptic patterns for common events
 *
 * Pattern format: [vibrate, pause, vibrate, pause, ...]
 * All values in milliseconds
 */
export const HAPTIC_PATTERNS: Record<HapticPatternName, HapticPattern> = {
  success: {
    pattern: [100],
    description: 'Short success vibration',
    intensity: 1,
  },
  repComplete: {
    pattern: [50, 30, 50],
    description: 'Two quick pulses for rep completion',
    intensity: 1,
  },
  setComplete: {
    pattern: [100, 50, 100, 50, 150],
    description: 'Three pulses with emphasis for set completion',
    intensity: 2,
  },
  exerciseComplete: {
    pattern: [100, 50, 100, 50, 100, 50, 200],
    description: 'Celebratory pattern for exercise completion',
    intensity: 3,
  },
  warning: {
    pattern: [200, 100, 200],
    description: 'Alert pattern for form warnings',
    intensity: 2,
  },
  error: {
    pattern: [300, 100, 300, 100, 300],
    description: 'Strong alert for errors',
    intensity: 3,
  },
  achievement: {
    pattern: [50, 30, 50, 30, 100, 50, 150],
    description: 'Celebration pattern for achievements',
    intensity: 2,
  },
  countdown: {
    pattern: [30],
    description: 'Light tick for countdown',
    intensity: 1,
  },
  start: {
    pattern: [80, 40, 80],
    description: 'Start signal',
    intensity: 2,
  },
  phaseChange: {
    pattern: [60, 30, 60],
    description: 'Phase transition indicator',
    intensity: 1,
  },
  tap: {
    pattern: [15],
    description: 'Light tap for UI feedback',
    intensity: 1,
  },
  doubleTap: {
    pattern: [15, 30, 15],
    description: 'Double tap for confirmation',
    intensity: 1,
  },
};

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_HAPTIC_CONFIG: HapticConfig = {
  enabled: true,
  respectReducedMotion: true,
  throttleMs: 100,
};

// ============================================================================
// HAPTIC SERVICE
// ============================================================================

class HapticService {
  private config: HapticConfig;
  private patterns: Record<HapticPatternName, HapticPattern>;
  private lastVibrationTime: number = 0;
  private _isSupported: boolean | null = null;
  private prefersReducedMotion: boolean = false;

  constructor(config: Partial<HapticConfig> = {}) {
    this.config = { ...DEFAULT_HAPTIC_CONFIG, ...config };
    this.patterns = { ...HAPTIC_PATTERNS, ...config.customPatterns };
    this.initReducedMotionListener();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private get isSupported(): boolean {
    // Check dynamically to support test mocking
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  private initReducedMotionListener(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = mediaQuery.matches;

    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  /**
   * Check if haptic feedback is available
   */
  isAvailable(): boolean {
    return this.isSupported && this.config.enabled;
  }

  /**
   * Check if haptic feedback should be active (considering user preferences)
   */
  isActive(): boolean {
    if (!this.isAvailable()) return false;
    if (this.config.respectReducedMotion && this.prefersReducedMotion) return false;
    return true;
  }

  /**
   * Vibrate with a predefined pattern
   */
  vibrate(patternName: HapticPatternName): boolean {
    if (!this.isActive()) return false;

    // Throttle vibrations
    const now = Date.now();
    if (now - this.lastVibrationTime < this.config.throttleMs) {
      return false;
    }

    const pattern = this.patterns[patternName];
    if (!pattern) {
      console.warn(`[HapticService] Unknown pattern: ${patternName}`);
      return false;
    }

    try {
      navigator.vibrate(pattern.pattern);
      this.lastVibrationTime = now;
      return true;
    } catch (error) {
      console.warn('[HapticService] Vibration failed:', error);
      return false;
    }
  }

  /**
   * Vibrate with a custom pattern
   */
  vibrateCustom(pattern: number[]): boolean {
    if (!this.isActive()) return false;

    const now = Date.now();
    if (now - this.lastVibrationTime < this.config.throttleMs) {
      return false;
    }

    try {
      navigator.vibrate(pattern);
      this.lastVibrationTime = now;
      return true;
    } catch (error) {
      console.warn('[HapticService] Custom vibration failed:', error);
      return false;
    }
  }

  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (!this.isSupported) return;

    try {
      navigator.vibrate(0);
    } catch (error) {
      // Ignore errors when stopping
    }
  }

  // --------------------------------------------------------------------------
  // CONVENIENCE METHODS
  // --------------------------------------------------------------------------

  /**
   * Quick success feedback
   */
  success(): boolean {
    return this.vibrate('success');
  }

  /**
   * Rep completed feedback
   */
  onRepComplete(): boolean {
    return this.vibrate('repComplete');
  }

  /**
   * Set completed feedback
   */
  onSetComplete(): boolean {
    return this.vibrate('setComplete');
  }

  /**
   * Exercise completed feedback
   */
  onExerciseComplete(): boolean {
    return this.vibrate('exerciseComplete');
  }

  /**
   * Warning/attention feedback
   */
  warning(): boolean {
    return this.vibrate('warning');
  }

  /**
   * Error feedback
   */
  error(): boolean {
    return this.vibrate('error');
  }

  /**
   * Achievement unlocked feedback
   */
  onAchievement(): boolean {
    return this.vibrate('achievement');
  }

  /**
   * Countdown tick
   */
  tick(): boolean {
    return this.vibrate('countdown');
  }

  /**
   * Light tap feedback for UI interactions
   */
  tap(): boolean {
    return this.vibrate('tap');
  }

  /**
   * Phase change feedback
   */
  onPhaseChange(): boolean {
    return this.vibrate('phaseChange');
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  /**
   * Enable haptic feedback
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable haptic feedback
   */
  disable(): void {
    this.config.enabled = false;
    this.stop();
  }

  /**
   * Toggle haptic feedback
   */
  toggle(): boolean {
    this.config.enabled = !this.config.enabled;
    if (!this.config.enabled) {
      this.stop();
    }
    return this.config.enabled;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.customPatterns) {
      this.patterns = { ...HAPTIC_PATTERNS, ...config.customPatterns };
    }
  }

  /**
   * Reset throttle timer (useful for testing)
   */
  resetThrottle(): void {
    this.lastVibrationTime = 0;
  }

  /**
   * Get current configuration
   */
  getConfig(): HapticConfig {
    return { ...this.config };
  }

  /**
   * Add or override a pattern
   */
  addPattern(name: HapticPatternName, pattern: HapticPattern): void {
    this.patterns[name] = pattern;
  }

  /**
   * Get all available patterns
   */
  getPatterns(): Record<HapticPatternName, HapticPattern> {
    return { ...this.patterns };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const hapticService = new HapticService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useCallback, useEffect, useState } from 'react';

/**
 * React hook for haptic feedback
 *
 * @example
 * ```tsx
 * function ExerciseComponent() {
 *   const { vibrate, isAvailable } = useHaptic();
 *
 *   const handleRepComplete = () => {
 *     vibrate('repComplete');
 *   };
 *
 *   return (
 *     <button onClick={handleRepComplete}>
 *       Complete Rep {isAvailable && '📳'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useHaptic() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(hapticService.isActive());
  }, []);

  const vibrate = useCallback((pattern: HapticPatternName) => {
    return hapticService.vibrate(pattern);
  }, []);

  const vibrateCustom = useCallback((pattern: number[]) => {
    return hapticService.vibrateCustom(pattern);
  }, []);

  return {
    vibrate,
    vibrateCustom,
    isAvailable,
    success: hapticService.success.bind(hapticService),
    warning: hapticService.warning.bind(hapticService),
    tap: hapticService.tap.bind(hapticService),
    onRepComplete: hapticService.onRepComplete.bind(hapticService),
    onSetComplete: hapticService.onSetComplete.bind(hapticService),
    onExerciseComplete: hapticService.onExerciseComplete.bind(hapticService),
    onPhaseChange: hapticService.onPhaseChange.bind(hapticService),
    onAchievement: hapticService.onAchievement.bind(hapticService),
  };
}

export default hapticService;
