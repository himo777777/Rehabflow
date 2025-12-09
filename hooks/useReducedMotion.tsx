/**
 * useReducedMotion Hook - Sprint 5.3
 *
 * Detects user's prefers-reduced-motion setting for accessibility.
 * When enabled, animations should be minimized or disabled.
 *
 * Use cases:
 * - Disable avatar sway animations
 * - Reduce transition durations
 * - Skip visual flourishes
 * - Simplify particle effects
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ReducedMotionState {
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether the media query is supported */
  isSupported: boolean;
  /** Check if a specific animation type should be reduced */
  shouldReduceMotion: (type?: AnimationType) => boolean;
}

export type AnimationType =
  | 'decorative'      // Purely decorative animations (always reduce)
  | 'feedback'        // User feedback animations (keep but simplify)
  | 'functional'      // Functional animations like loading spinners (keep)
  | 'transition'      // Page/component transitions (reduce duration)
  | 'avatar'          // Avatar movements and expressions
  | 'particle'        // Particle effects
  | 'scroll';         // Scroll-triggered animations

// ============================================================================
// MEDIA QUERY
// ============================================================================

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to detect and respond to user's reduced motion preference
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const { prefersReducedMotion, shouldReduceMotion } = useReducedMotion();
 *
 *   // Disable decorative animations
 *   const enableSway = !shouldReduceMotion('decorative');
 *
 *   // Reduce transition duration
 *   const transitionDuration = shouldReduceMotion('transition') ? 0 : 300;
 *
 *   return (
 *     <div
 *       style={{
 *         transition: `transform ${transitionDuration}ms ease`,
 *       }}
 *     >
 *       <Avatar enableSway={enableSway} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): ReducedMotionState {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check initial value (SSR safe)
    if (typeof window === 'undefined') return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  });

  const [isSupported, setIsSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'matchMedia' in window;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy browsers (Safari < 14)
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  /**
   * Check if a specific animation type should be reduced
   */
  const shouldReduceMotion = useCallback(
    (type?: AnimationType): boolean => {
      if (!prefersReducedMotion) return false;

      // Without specific type, reduce all
      if (!type) return true;

      // Determine reduction level by type
      switch (type) {
        case 'decorative':
          // Always reduce decorative animations
          return true;

        case 'particle':
          // Always reduce particles
          return true;

        case 'avatar':
          // Reduce avatar movements but allow key poses
          return true;

        case 'scroll':
          // Disable scroll-triggered animations
          return true;

        case 'transition':
          // Reduce but don't completely disable
          return true;

        case 'feedback':
          // Keep feedback animations but they should be simplified
          return false;

        case 'functional':
          // Keep functional animations like spinners
          return false;

        default:
          return true;
      }
    },
    [prefersReducedMotion]
  );

  return {
    prefersReducedMotion,
    isSupported,
    shouldReduceMotion,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get a reduced duration based on preference
 */
export function getReducedDuration(
  duration: number,
  prefersReduced: boolean,
  minDuration: number = 0
): number {
  if (!prefersReduced) return duration;
  return Math.max(duration * 0.1, minDuration);
}

/**
 * Get a reduced scale for animations
 */
export function getReducedScale(
  scale: number,
  prefersReduced: boolean
): number {
  if (!prefersReduced) return scale;
  return scale * 0.2;
}

/**
 * Conditionally apply animation class
 */
export function animationClass(
  className: string,
  prefersReduced: boolean
): string {
  return prefersReduced ? '' : className;
}

/**
 * Get animation style object with reduced motion support
 */
export function getAnimationStyle(
  normalStyle: React.CSSProperties,
  reducedStyle: React.CSSProperties,
  prefersReduced: boolean
): React.CSSProperties {
  return prefersReduced ? reducedStyle : normalStyle;
}

// ============================================================================
// PROVIDER CONTEXT (for centralized preference management)
// ============================================================================

import { createContext, useContext, ReactNode } from 'react';

interface ReducedMotionContextValue extends ReducedMotionState {
  /** Force reduced motion regardless of system setting */
  forceReduced: boolean;
  /** Set force reduced motion */
  setForceReduced: (value: boolean) => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue | null>(null);

interface ReducedMotionProviderProps {
  children: ReactNode;
  /** Force reduced motion for testing */
  forceReduced?: boolean;
}

/**
 * Provider for reduced motion preference throughout the app
 */
export function ReducedMotionProvider({
  children,
  forceReduced: initialForceReduced = false,
}: ReducedMotionProviderProps): JSX.Element {
  const systemPreference = useReducedMotion();
  const [forceReduced, setForceReduced] = useState(initialForceReduced);

  const effectivePrefersReduced = forceReduced || systemPreference.prefersReducedMotion;

  const shouldReduceMotion = useCallback(
    (type?: AnimationType): boolean => {
      if (forceReduced) return true;
      return systemPreference.shouldReduceMotion(type);
    },
    [forceReduced, systemPreference]
  );

  const value: ReducedMotionContextValue = {
    prefersReducedMotion: effectivePrefersReduced,
    isSupported: systemPreference.isSupported,
    shouldReduceMotion,
    forceReduced,
    setForceReduced,
  };

  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

/**
 * Use reduced motion context
 */
export function useReducedMotionContext(): ReducedMotionContextValue {
  const context = useContext(ReducedMotionContext);
  if (!context) {
    throw new Error('useReducedMotionContext must be used within a ReducedMotionProvider');
  }
  return context;
}

export default useReducedMotion;
