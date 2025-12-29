/**
 * GPU-Accelerated Animations - World-Class Performance
 *
 * Optimized animation utilities that leverage GPU acceleration
 * for smooth 60fps animations on all devices.
 *
 * Key principles:
 * - Use transform and opacity (GPU-accelerated properties)
 * - Avoid layout-triggering properties (width, height, top, left)
 * - Use will-change sparingly for upcoming animations
 * - Prefer CSS transforms over JavaScript animations when possible
 */

import { Variants, Transition, TargetAndTransition, Easing } from 'framer-motion';

// ============================================================================
// GPU-ACCELERATED TRANSITIONS
// ============================================================================

/**
 * Spring configuration optimized for perceived performance
 * Uses lower stiffness for smoother feel on lower-end devices
 */
export const gpuSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/**
 * Ultra-smooth spring for premium feel
 */
export const premiumSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 0.5,
};

/**
 * Quick spring for micro-interactions
 */
export const quickSpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 0.3,
};

/**
 * Tween with GPU-optimized easing (cubic-bezier for easeOut)
 */
export const gpuTween = (duration = 0.3): Transition => ({
  type: 'tween',
  duration,
  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
});

/**
 * Premium easing curve for luxury feel
 */
export const premiumEase: Easing = [0.16, 1, 0.3, 1]; // Custom premium easing

// ============================================================================
// GPU-ACCELERATED VARIANTS
// ============================================================================

/**
 * Fade variants using only opacity (GPU-accelerated)
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: gpuTween(0.4),
  },
  exit: {
    opacity: 0,
    transition: gpuTween(0.2),
  },
};

/**
 * Slide up with transform (GPU-accelerated)
 * Uses translateY instead of y for explicit GPU acceleration
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    // These properties trigger GPU layer creation
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...gpuSpring,
      opacity: gpuTween(0.3),
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: gpuTween(0.2),
  },
};

/**
 * Scale variants (GPU-accelerated transform)
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: premiumSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: gpuTween(0.15),
  },
};

/**
 * Stagger container with optimized children animation
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger item optimized for lists
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: quickSpring,
  },
};

/**
 * Card hover with 3D transform (GPU-accelerated)
 */
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: quickSpring,
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: { duration: 0.1 },
  },
};

/**
 * Button press animation (micro-interaction)
 */
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: quickSpring,
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

/**
 * Page transition variants optimized for route changes
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: premiumEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================================================
// CSS UTILITIES FOR GPU ACCELERATION
// ============================================================================

/**
 * CSS classes that enable GPU acceleration
 * Apply these to elements that will be animated
 */
export const gpuAccelerationClasses = {
  /** Forces GPU layer creation */
  forceGPU: 'transform-gpu',
  /** Hints upcoming transform animation */
  willChangeTransform: 'will-change-transform',
  /** Hints upcoming opacity animation */
  willChangeOpacity: 'will-change-[opacity]',
  /** Combined hint for common animations */
  willChangeAll: 'will-change-[transform,opacity]',
  /** Backface visibility for 3D transforms */
  backfaceHidden: 'backface-visibility-hidden',
};

/**
 * Inline styles for GPU acceleration
 */
export const gpuAccelerationStyles: React.CSSProperties = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  perspective: 1000,
};

/**
 * Will-change management utilities
 * Important: Remove will-change after animation completes to free GPU memory
 */
export const willChangeManager = {
  /**
   * Add will-change before animation starts
   */
  prepare: (element: HTMLElement, properties: string[] = ['transform', 'opacity']) => {
    element.style.willChange = properties.join(', ');
  },

  /**
   * Remove will-change after animation completes
   */
  cleanup: (element: HTMLElement) => {
    element.style.willChange = 'auto';
  },

  /**
   * Wrapper that handles will-change lifecycle
   */
  withWillChange: async <T>(
    element: HTMLElement,
    animation: () => Promise<T>,
    properties: string[] = ['transform', 'opacity']
  ): Promise<T> => {
    willChangeManager.prepare(element, properties);
    try {
      return await animation();
    } finally {
      // Delay cleanup to ensure animation has finished
      requestAnimationFrame(() => {
        willChangeManager.cleanup(element);
      });
    }
  },
};

// ============================================================================
// PERFORMANCE OPTIMIZATION HOOKS
// ============================================================================

/**
 * Reduced motion preferences detector
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimized animation settings based on device capabilities
 */
export const getOptimizedAnimation = (): {
  transition: Transition;
  reduceMotion: boolean;
} => {
  const reduceMotion = prefersReducedMotion();

  if (reduceMotion) {
    return {
      transition: { duration: 0 },
      reduceMotion: true,
    };
  }

  // Check for low-end device hints
  const isLowEnd =
    typeof navigator !== 'undefined' &&
    (navigator.hardwareConcurrency <= 2 ||
      (navigator as any).deviceMemory <= 2);

  if (isLowEnd) {
    return {
      transition: gpuTween(0.2),
      reduceMotion: false,
    };
  }

  return {
    transition: premiumSpring,
    reduceMotion: false,
  };
};

// ============================================================================
// INTERSECTION OBSERVER ANIMATION TRIGGER
// ============================================================================

/**
 * Options for viewport-triggered animations
 */
export interface ViewportAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Create an intersection observer for viewport-triggered animations
 */
export const createViewportAnimationObserver = (
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options: ViewportAnimationOptions = {}
): IntersectionObserver => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold, rootMargin }
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { threshold, rootMargin }
  );
  return observer;
};

// ============================================================================
// FRAMER MOTION OPTIMIZED PROPS
// ============================================================================

/**
 * Pre-configured motion props for common use cases
 */
export const motionPresets = {
  /** Fade in on mount */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: gpuTween(0.3),
  },

  /** Slide up from bottom */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: gpuSpring,
  },

  /** Scale in from center */
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: premiumSpring,
  },

  /** Interactive card */
  interactiveCard: {
    whileHover: { scale: 1.02, y: -4 },
    whileTap: { scale: 0.98 },
    transition: quickSpring,
  },

  /** Button with feedback */
  buttonFeedback: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.1 },
  },
} as const;

// ============================================================================
// ANIMATION FRAME UTILITIES
// ============================================================================

/**
 * RequestAnimationFrame-based animation scheduler
 * Ensures animations run at optimal times
 */
export class AnimationScheduler {
  private queue: Array<() => void> = [];
  private isRunning = false;

  /**
   * Schedule an animation for the next frame
   */
  schedule(callback: () => void): void {
    this.queue.push(callback);
    if (!this.isRunning) {
      this.isRunning = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Flush all scheduled animations
   */
  private flush(): void {
    const callbacks = [...this.queue];
    this.queue = [];
    this.isRunning = false;

    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Animation callback error:', error);
      }
    });
  }
}

export const animationScheduler = new AnimationScheduler();

export default {
  // Transitions
  gpuSpring,
  premiumSpring,
  quickSpring,
  gpuTween,
  premiumEase,
  // Variants
  fadeVariants,
  slideUpVariants,
  scaleVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardHoverVariants,
  buttonPressVariants,
  pageTransitionVariants,
  // Utilities
  gpuAccelerationClasses,
  gpuAccelerationStyles,
  willChangeManager,
  prefersReducedMotion,
  getOptimizedAnimation,
  motionPresets,
  animationScheduler,
};
