/**
 * Animation Culling Service - Sprint 5.3
 *
 * Provides visibility-based animation culling using IntersectionObserver.
 * When components are outside the viewport, animations are paused to save
 * CPU/GPU resources and improve overall performance.
 *
 * Expected performance improvement: ~30-40% FPS boost when multiple
 * components are off-screen.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface AnimationCullingConfig {
  /** Threshold for intersection (0-1). 0.1 means 10% visible triggers */
  threshold: number;
  /** Root margin for early/late detection (CSS margin syntax) */
  rootMargin: string;
  /** Delay before pausing animation when element leaves viewport (ms) */
  pauseDelay: number;
  /** Delay before resuming animation when element enters viewport (ms) */
  resumeDelay: number;
}

export interface AnimationCullingState {
  /** Whether the element is currently visible in viewport */
  isVisible: boolean;
  /** Whether animations should be active */
  shouldAnimate: boolean;
  /** Time when visibility last changed */
  lastVisibilityChange: number;
  /** Percentage of element currently visible (0-1) */
  visibilityRatio: number;
}

export interface UseAnimationCullingReturn {
  /** Ref to attach to the element to track */
  ref: React.RefObject<HTMLElement>;
  /** Whether animations should be running */
  shouldAnimate: boolean;
  /** Whether element is visible */
  isVisible: boolean;
  /** Current visibility ratio (0-1) */
  visibilityRatio: number;
  /** Manually pause animations */
  pause: () => void;
  /** Manually resume animations */
  resume: () => void;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_CULLING_CONFIG: AnimationCullingConfig = {
  threshold: 0.1,        // 10% visible triggers animation
  rootMargin: '50px',    // Start loading 50px before entering viewport
  pauseDelay: 500,       // Wait 500ms before pausing when leaving
  resumeDelay: 0,        // Resume immediately when entering
};

// ============================================================================
// ANIMATION CULLING HOOK
// ============================================================================

/**
 * Hook for visibility-based animation culling
 *
 * @example
 * ```tsx
 * const { ref, shouldAnimate } = useAnimationCulling();
 *
 * return (
 *   <div ref={ref}>
 *     <Canvas>
 *       <AnimatedMesh animate={shouldAnimate} />
 *     </Canvas>
 *   </div>
 * );
 * ```
 */
export function useAnimationCulling(
  config: Partial<AnimationCullingConfig> = {}
): UseAnimationCullingReturn {
  const finalConfig = { ...DEFAULT_CULLING_CONFIG, ...config };
  const ref = useRef<HTMLElement>(null);

  const [state, setState] = useState<AnimationCullingState>({
    isVisible: true,        // Default to visible to avoid flash
    shouldAnimate: true,
    lastVisibilityChange: Date.now(),
    visibilityRatio: 1,
  });

  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualPauseRef = useRef(false);

  // Clear any pending timeouts
  const clearTimeouts = useCallback(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  // Manual pause control
  const pause = useCallback(() => {
    manualPauseRef.current = true;
    setState(prev => ({ ...prev, shouldAnimate: false }));
  }, []);

  // Manual resume control
  const resume = useCallback(() => {
    manualPauseRef.current = false;
    if (state.isVisible) {
      setState(prev => ({ ...prev, shouldAnimate: true }));
    }
  }, [state.isVisible]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: always animate
      setState(prev => ({
        ...prev,
        isVisible: true,
        shouldAnimate: !manualPauseRef.current,
        visibilityRatio: 1,
      }));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const isVisible = entry.isIntersecting;
        const visibilityRatio = entry.intersectionRatio;
        const now = Date.now();

        clearTimeouts();

        if (isVisible) {
          // Element is entering viewport
          if (finalConfig.resumeDelay > 0) {
            resumeTimeoutRef.current = setTimeout(() => {
              if (!manualPauseRef.current) {
                setState({
                  isVisible: true,
                  shouldAnimate: true,
                  lastVisibilityChange: now,
                  visibilityRatio,
                });
              }
            }, finalConfig.resumeDelay);
          } else {
            // Resume immediately
            setState({
              isVisible: true,
              shouldAnimate: !manualPauseRef.current,
              lastVisibilityChange: now,
              visibilityRatio,
            });
          }
        } else {
          // Element is leaving viewport
          setState(prev => ({
            ...prev,
            isVisible: false,
            visibilityRatio: 0,
            lastVisibilityChange: now,
          }));

          if (finalConfig.pauseDelay > 0) {
            pauseTimeoutRef.current = setTimeout(() => {
              setState(prev => ({
                ...prev,
                shouldAnimate: false,
              }));
            }, finalConfig.pauseDelay);
          } else {
            // Pause immediately
            setState(prev => ({
              ...prev,
              shouldAnimate: false,
            }));
          }
        }
      },
      {
        threshold: [0, finalConfig.threshold, 0.5, 1],
        rootMargin: finalConfig.rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [finalConfig.threshold, finalConfig.rootMargin, finalConfig.pauseDelay, finalConfig.resumeDelay, clearTimeouts]);

  return {
    ref: ref as React.RefObject<HTMLElement>,
    shouldAnimate: state.shouldAnimate,
    isVisible: state.isVisible,
    visibilityRatio: state.visibilityRatio,
    pause,
    resume,
  };
}

// ============================================================================
// FRAME THROTTLER
// ============================================================================

export interface FrameThrottlerConfig {
  /** Target FPS when visible */
  targetFPS: number;
  /** Reduced FPS when partially visible */
  reducedFPS: number;
  /** Minimum FPS to maintain */
  minFPS: number;
}

const DEFAULT_FRAME_THROTTLER_CONFIG: FrameThrottlerConfig = {
  targetFPS: 60,
  reducedFPS: 30,
  minFPS: 15,
};

/**
 * Hook for adaptive frame rate based on visibility
 *
 * @example
 * ```tsx
 * const { shouldRenderFrame } = useFrameThrottler(visibilityRatio);
 *
 * useFrame(() => {
 *   if (!shouldRenderFrame()) return;
 *   // Animation logic here
 * });
 * ```
 */
export function useFrameThrottler(
  visibilityRatio: number,
  config: Partial<FrameThrottlerConfig> = {}
): { shouldRenderFrame: () => boolean; currentFPS: number } {
  const finalConfig = { ...DEFAULT_FRAME_THROTTLER_CONFIG, ...config };
  const lastFrameTimeRef = useRef(0);
  const currentFPSRef = useRef(finalConfig.targetFPS);

  // Calculate target FPS based on visibility
  useEffect(() => {
    if (visibilityRatio >= 0.8) {
      currentFPSRef.current = finalConfig.targetFPS;
    } else if (visibilityRatio >= 0.3) {
      currentFPSRef.current = finalConfig.reducedFPS;
    } else if (visibilityRatio > 0) {
      currentFPSRef.current = finalConfig.minFPS;
    } else {
      currentFPSRef.current = 0; // Don't render at all
    }
  }, [visibilityRatio, finalConfig.targetFPS, finalConfig.reducedFPS, finalConfig.minFPS]);

  const shouldRenderFrame = useCallback(() => {
    if (currentFPSRef.current === 0) return false;

    const now = performance.now();
    const frameInterval = 1000 / currentFPSRef.current;

    if (now - lastFrameTimeRef.current >= frameInterval) {
      lastFrameTimeRef.current = now;
      return true;
    }

    return false;
  }, []);

  return {
    shouldRenderFrame,
    currentFPS: currentFPSRef.current,
  };
}

// ============================================================================
// ANIMATION CULLING SERVICE (Singleton)
// ============================================================================

interface TrackedElement {
  id: string;
  ref: WeakRef<HTMLElement>;
  callback: (isVisible: boolean) => void;
  config: AnimationCullingConfig;
}

class AnimationCullingService {
  private observer: IntersectionObserver | null = null;
  private trackedElements: Map<string, TrackedElement> = new Map();
  private elementIdMap: WeakMap<HTMLElement, string> = new WeakMap();
  private idCounter = 0;

  constructor() {
    this.initObserver();
  }

  private initObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const id = this.elementIdMap.get(element);
          if (!id) return;

          const tracked = this.trackedElements.get(id);
          if (!tracked) return;

          tracked.callback(entry.isIntersecting);
        });
      },
      {
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: '50px',
      }
    );
  }

  /**
   * Track an element for visibility changes
   */
  track(
    element: HTMLElement,
    callback: (isVisible: boolean) => void,
    config: Partial<AnimationCullingConfig> = {}
  ): string {
    const id = `anim-cull-${++this.idCounter}`;
    const finalConfig = { ...DEFAULT_CULLING_CONFIG, ...config };

    this.trackedElements.set(id, {
      id,
      ref: new WeakRef(element),
      callback,
      config: finalConfig,
    });
    this.elementIdMap.set(element, id);

    if (this.observer) {
      this.observer.observe(element);
    }

    return id;
  }

  /**
   * Stop tracking an element
   */
  untrack(id: string): void {
    const tracked = this.trackedElements.get(id);
    if (!tracked) return;

    const element = tracked.ref.deref();
    if (element && this.observer) {
      this.observer.unobserve(element);
      this.elementIdMap.delete(element);
    }

    this.trackedElements.delete(id);
  }

  /**
   * Get all currently visible elements
   */
  getVisibleElements(): string[] {
    const visible: string[] = [];
    // Note: This requires tracking state, which would need to be added
    // For now, this is a placeholder
    return visible;
  }

  /**
   * Clean up stale references
   */
  cleanup(): void {
    this.trackedElements.forEach((tracked, id) => {
      const element = tracked.ref.deref();
      if (!element) {
        this.trackedElements.delete(id);
      }
    });
  }

  /**
   * Destroy the service
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.trackedElements.clear();
  }
}

// Singleton export
export const animationCullingService = new AnimationCullingService();

// ============================================================================
// REACT INTEGRATION FOR THREE.JS / R3F
// ============================================================================

/**
 * Hook specifically designed for use with React Three Fiber useFrame
 *
 * @example
 * ```tsx
 * function AnimatedMesh({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
 *   const { shouldAnimate, visibilityRatio } = useR3FAnimationCulling(containerRef);
 *
 *   useFrame((state, delta) => {
 *     if (!shouldAnimate) return;
 *
 *     // Reduce complexity based on visibility
 *     const adjustedDelta = delta * visibilityRatio;
 *     // Animation logic...
 *   });
 *
 *   return <mesh />;
 * }
 * ```
 */
export function useR3FAnimationCulling(
  containerRef: React.RefObject<HTMLElement>,
  config: Partial<AnimationCullingConfig> = {}
): { shouldAnimate: boolean; visibilityRatio: number } {
  const [state, setState] = useState({
    shouldAnimate: true,
    visibilityRatio: 1,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const finalConfig = { ...DEFAULT_CULLING_CONFIG, ...config };

    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        setState({
          shouldAnimate: entry.isIntersecting,
          visibilityRatio: entry.intersectionRatio,
        });
      },
      {
        threshold: [0, finalConfig.threshold, 0.5, 1],
        rootMargin: finalConfig.rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [containerRef, config]);

  return state;
}

export default animationCullingService;
