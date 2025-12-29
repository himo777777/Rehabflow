/**
 * Micro-Interactions & Haptic Feedback - Premium UX
 *
 * World-class micro-interactions for delightful user experience:
 * - Haptic feedback for mobile devices
 * - Sound effects for key actions
 * - Touch gesture utilities
 * - Visual micro-animations
 */

import { Variants, TargetAndTransition } from 'framer-motion';

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

/**
 * Haptic feedback patterns
 */
export type HapticPattern =
  | 'light'      // Quick light tap
  | 'medium'     // Standard tap
  | 'heavy'      // Strong tap
  | 'success'    // Success pattern
  | 'warning'    // Warning pattern
  | 'error'      // Error pattern
  | 'selection'  // Selection change
  | 'impact';    // Button press

/**
 * Vibration patterns for each haptic type (in milliseconds)
 */
const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [30, 50, 30],
  warning: [50, 30, 50],
  error: [100, 30, 100, 30, 100],
  selection: 15,
  impact: 40,
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback
 */
export const haptic = (pattern: HapticPattern = 'light'): void => {
  if (!isHapticSupported()) return;

  try {
    navigator.vibrate(hapticPatterns[pattern]);
  } catch {
    // Silently fail if vibration is blocked
  }
};

/**
 * Stop ongoing haptic feedback
 */
export const stopHaptic = (): void => {
  if (!isHapticSupported()) return;
  navigator.vibrate(0);
};

/**
 * Haptic feedback presets for common actions
 */
export const hapticPresets = {
  /** Light tap for selections and toggles */
  tap: () => haptic('light'),
  /** Button press feedback */
  press: () => haptic('impact'),
  /** Success action completed */
  success: () => haptic('success'),
  /** Warning or caution */
  warning: () => haptic('warning'),
  /** Error occurred */
  error: () => haptic('error'),
  /** Item selected from list */
  select: () => haptic('selection'),
};

// ============================================================================
// SOUND EFFECTS
// ============================================================================

/**
 * Sound effect types
 */
export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'notification'
  | 'pop'
  | 'swoosh'
  | 'ding';

/**
 * Audio context for sound effects (lazy initialized)
 */
let audioContext: AudioContext | null = null;

/**
 * Get or create audio context
 */
const getAudioContext = (): AudioContext | null => {
  if (!audioContext && typeof AudioContext !== 'undefined') {
    audioContext = new AudioContext();
  }
  return audioContext;
};

/**
 * Generate a simple tone
 */
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.1
): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

/**
 * Sound effect configurations
 */
const soundConfigs: Record<SoundEffect, () => void> = {
  click: () => playTone(800, 0.05, 'sine', 0.05),
  success: () => {
    playTone(523, 0.1, 'sine', 0.08);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.08), 80);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.08), 160);
  },
  error: () => {
    playTone(200, 0.15, 'square', 0.05);
    setTimeout(() => playTone(150, 0.2, 'square', 0.05), 120);
  },
  notification: () => {
    playTone(880, 0.08, 'sine', 0.06);
    setTimeout(() => playTone(1047, 0.1, 'sine', 0.06), 100);
  },
  pop: () => playTone(1200, 0.03, 'sine', 0.08),
  swoosh: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  },
  ding: () => playTone(1568, 0.2, 'sine', 0.06),
};

/**
 * Play a sound effect
 */
export const playSound = (effect: SoundEffect): void => {
  try {
    soundConfigs[effect]?.();
  } catch {
    // Silently fail if audio is blocked
  }
};

/**
 * Sound settings state
 */
let soundEnabled = true;

/**
 * Toggle sound effects
 */
export const toggleSound = (enabled?: boolean): boolean => {
  soundEnabled = enabled ?? !soundEnabled;
  return soundEnabled;
};

/**
 * Play sound if enabled
 */
export const sound = (effect: SoundEffect): void => {
  if (soundEnabled) {
    playSound(effect);
  }
};

// ============================================================================
// COMBINED FEEDBACK
// ============================================================================

/**
 * Combined haptic and sound feedback
 */
export const feedback = {
  /** Light tap with optional click sound */
  tap: (withSound = false) => {
    haptic('light');
    if (withSound) sound('click');
  },

  /** Button press with feedback */
  press: (withSound = true) => {
    haptic('impact');
    if (withSound) sound('pop');
  },

  /** Success feedback */
  success: () => {
    haptic('success');
    sound('success');
  },

  /** Warning feedback */
  warning: () => {
    haptic('warning');
    sound('notification');
  },

  /** Error feedback */
  error: () => {
    haptic('error');
    sound('error');
  },

  /** Selection changed */
  select: () => {
    haptic('selection');
    sound('click');
  },

  /** Toggle switch */
  toggle: (isOn: boolean) => {
    haptic('light');
    sound(isOn ? 'ding' : 'click');
  },

  /** Notification received */
  notification: () => {
    haptic('medium');
    sound('notification');
  },

  /** Swipe completed */
  swipe: () => {
    haptic('light');
    sound('swoosh');
  },
};

// ============================================================================
// MICRO-ANIMATION VARIANTS
// ============================================================================

/**
 * Bounce animation for success states
 */
export const bounceVariants: Variants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.4, 0.6, 1],
      ease: 'easeOut',
    },
  },
};

/**
 * Shake animation for errors
 */
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Pulse animation for attention
 */
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Wiggle animation for playful elements
 */
export const wiggleVariants: Variants = {
  initial: { rotate: 0 },
  wiggle: {
    rotate: [-3, 3, -3, 3, 0],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Pop-in animation for new elements
 */
export const popInVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.1, 1],
    opacity: 1,
    transition: {
      duration: 0.3,
      times: [0, 0.7, 1],
      ease: 'easeOut',
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Slide and fade for list items
 */
export const slideItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Heartbeat animation for favorites/likes
 */
export const heartbeatVariants: Variants = {
  initial: { scale: 1 },
  beat: {
    scale: [1, 1.3, 1, 1.2, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.15, 0.3, 0.45, 0.6],
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// TOUCH GESTURE UTILITIES
// ============================================================================

/**
 * Swipe direction types
 */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Swipe gesture handler configuration
 */
export interface SwipeConfig {
  /** Minimum distance to trigger swipe (px) */
  threshold?: number;
  /** Maximum time for swipe gesture (ms) */
  maxTime?: number;
  /** Callback for swipe */
  onSwipe?: (direction: SwipeDirection) => void;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
}

/**
 * Create swipe gesture handlers
 */
export const createSwipeHandlers = (config: SwipeConfig = {}) => {
  const {
    threshold = 50,
    maxTime = 300,
    onSwipe,
    hapticFeedback = true,
  } = config;

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  return {
    onTouchStart: (e: React.TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      if (deltaTime > maxTime) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > threshold || absY > threshold) {
        let direction: SwipeDirection;

        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        if (hapticFeedback) {
          haptic('light');
        }

        onSwipe?.(direction);
      }
    },
  };
};

/**
 * Long press handler
 */
export const createLongPressHandlers = (
  onLongPress: () => void,
  delay = 500,
  hapticFeedback = true
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    onTouchStart: () => {
      timer = setTimeout(() => {
        if (hapticFeedback) {
          haptic('heavy');
        }
        onLongPress();
      }, delay);
    },
    onTouchEnd: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    onTouchMove: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
};

// ============================================================================
// BUTTON INTERACTION PRESETS
// ============================================================================

/**
 * Interactive button motion props with feedback
 */
export const interactiveButton = {
  /** Standard button with subtle feedback */
  standard: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
    onTapStart: () => haptic('light'),
  },

  /** Primary action button with stronger feedback */
  primary: {
    whileHover: { scale: 1.03, y: -2 },
    whileTap: { scale: 0.96 },
    transition: { type: 'spring', stiffness: 400, damping: 25 },
    onTapStart: () => feedback.press(),
  },

  /** Icon button with rotation */
  icon: {
    whileHover: { scale: 1.1, rotate: 5 },
    whileTap: { scale: 0.9, rotate: -5 },
    transition: { type: 'spring', stiffness: 500, damping: 20 },
    onTapStart: () => haptic('light'),
  },

  /** Floating action button */
  fab: {
    whileHover: { scale: 1.1, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 25 },
    onTapStart: () => feedback.press(false),
  },

  /** Danger/destructive button */
  danger: {
    whileHover: { scale: 1.02, backgroundColor: 'rgb(220, 38, 38)' },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.15 },
    onTapStart: () => haptic('warning'),
  },
};

// ============================================================================
// CARD INTERACTION PRESETS
// ============================================================================

/**
 * Interactive card motion props
 */
export const interactiveCard = {
  /** Standard clickable card */
  clickable: {
    whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    whileTap: { y: 0, scale: 0.99 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },

  /** Selectable card */
  selectable: (isSelected: boolean) => ({
    animate: isSelected
      ? { scale: 1.02, borderColor: 'rgb(59, 130, 246)' }
      : { scale: 1, borderColor: 'transparent' },
    whileHover: { scale: isSelected ? 1.02 : 1.01 },
    whileTap: { scale: 0.99 },
    transition: { type: 'spring', stiffness: 400, damping: 30 },
    onTap: () => feedback.select(),
  }),

  /** Draggable card */
  draggable: {
    drag: true,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.1,
    whileDrag: { scale: 1.05, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    onDragStart: () => haptic('medium'),
    onDragEnd: () => haptic('light'),
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Haptic
  isHapticSupported,
  haptic,
  stopHaptic,
  hapticPresets,
  // Sound
  playSound,
  toggleSound,
  sound,
  // Combined feedback
  feedback,
  // Animation variants
  bounceVariants,
  shakeVariants,
  pulseVariants,
  wiggleVariants,
  popInVariants,
  slideItemVariants,
  heartbeatVariants,
  // Touch gestures
  createSwipeHandlers,
  createLongPressHandlers,
  // Interaction presets
  interactiveButton,
  interactiveCard,
};
