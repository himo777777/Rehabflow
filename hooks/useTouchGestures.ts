/**
 * Touch Gestures Hook - Sprint 5.5
 *
 * Provides touch gesture detection for mobile interaction.
 * Supports swipe, pinch, long press, and double tap gestures.
 *
 * Features:
 * - Swipe detection (up, down, left, right)
 * - Pinch to zoom
 * - Long press
 * - Double tap
 * - Configurable thresholds
 * - Passive event listeners for performance
 */

import { useRef, useEffect, useCallback, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureState {
  isPressed: boolean;
  isPinching: boolean;
  isSwiping: boolean;
  swipeDirection: SwipeDirection | null;
  pinchScale: number;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
}

export interface GestureCallbacks {
  onSwipe?: (direction: SwipeDirection, velocity: number) => void;
  onSwipeStart?: (direction: SwipeDirection) => void;
  onSwipeEnd?: (direction: SwipeDirection, velocity: number) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPinchStart?: () => void;
  onPinchEnd?: (finalScale: number) => void;
  onLongPress?: (point: { x: number; y: number }) => void;
  onDoubleTap?: (point: { x: number; y: number }) => void;
  onTap?: (point: { x: number; y: number }) => void;
  onPan?: (delta: { x: number; y: number }, velocity: { x: number; y: number }) => void;
  onPanStart?: (point: { x: number; y: number }) => void;
  onPanEnd?: (velocity: { x: number; y: number }) => void;
}

export interface GestureConfig {
  /** Minimum distance for swipe detection (px) */
  swipeThreshold: number;
  /** Minimum velocity for swipe (px/ms) */
  swipeVelocityThreshold: number;
  /** Long press duration (ms) */
  longPressDelay: number;
  /** Double tap max interval (ms) */
  doubleTapInterval: number;
  /** Enable specific gestures */
  enableSwipe: boolean;
  enablePinch: boolean;
  enableLongPress: boolean;
  enableDoubleTap: boolean;
  enablePan: boolean;
  /** Prevent default touch behavior */
  preventDefault: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  longPressDelay: 500,
  doubleTapInterval: 300,
  enableSwipe: true,
  enablePinch: true,
  enableLongPress: true,
  enableDoubleTap: true,
  enablePan: true,
  preventDefault: false,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDistance(p1: TouchPoint, p2: TouchPoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCenter(p1: TouchPoint, p2: TouchPoint): { x: number; y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

function getSwipeDirection(start: TouchPoint, end: TouchPoint): SwipeDirection {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useTouchGestures<T extends HTMLElement = HTMLElement>(
  callbacks: GestureCallbacks = {},
  config: Partial<GestureConfig> = {}
) {
  const ref = useRef<T>(null);
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  // Touch state
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const initialPinchDistanceRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPanningRef = useRef<boolean>(false);

  const [gestureState, setGestureState] = useState<GestureState>({
    isPressed: false,
    isPinching: false,
    isSwiping: false,
    swipeDirection: null,
    pinchScale: 1,
    startPoint: null,
    currentPoint: null,
  });

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const cfg = configRef.current;

    if (cfg.preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // Store all touches for pinch
    touchesRef.current.clear();
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      touchesRef.current.set(t.identifier, {
        x: t.clientX,
        y: t.clientY,
        timestamp: Date.now(),
      });
    }

    touchStartRef.current = point;

    // Check for pinch start
    if (cfg.enablePinch && e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      initialPinchDistanceRef.current = getDistance(
        { x: t1.clientX, y: t1.clientY, timestamp: 0 },
        { x: t2.clientX, y: t2.clientY, timestamp: 0 }
      );

      setGestureState((prev) => ({ ...prev, isPinching: true }));
      callbacks.onPinchStart?.();
      clearLongPressTimer();
      return;
    }

    // Check for double tap
    if (cfg.enableDoubleTap) {
      const now = Date.now();
      if (now - lastTapRef.current < cfg.doubleTapInterval) {
        callbacks.onDoubleTap?.({ x: point.x, y: point.y });
        lastTapRef.current = 0;
        clearLongPressTimer();
        return;
      }
      lastTapRef.current = now;
    }

    // Start long press timer
    if (cfg.enableLongPress) {
      clearLongPressTimer();
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          callbacks.onLongPress?.({ x: touchStartRef.current.x, y: touchStartRef.current.y });
        }
      }, cfg.longPressDelay);
    }

    setGestureState((prev) => ({
      ...prev,
      isPressed: true,
      startPoint: point,
      currentPoint: point,
    }));
  }, [callbacks, clearLongPressTimer]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const cfg = configRef.current;

    if (cfg.preventDefault) {
      e.preventDefault();
    }

    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // Update touches map
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      touchesRef.current.set(t.identifier, {
        x: t.clientX,
        y: t.clientY,
        timestamp: Date.now(),
      });
    }

    // Handle pinch
    if (cfg.enablePinch && e.touches.length === 2) {
      clearLongPressTimer();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDistance = getDistance(
        { x: t1.clientX, y: t1.clientY, timestamp: 0 },
        { x: t2.clientX, y: t2.clientY, timestamp: 0 }
      );

      if (initialPinchDistanceRef.current > 0) {
        const scale = currentDistance / initialPinchDistanceRef.current;
        const center = getCenter(
          { x: t1.clientX, y: t1.clientY, timestamp: 0 },
          { x: t2.clientX, y: t2.clientY, timestamp: 0 }
        );

        setGestureState((prev) => ({ ...prev, pinchScale: scale }));
        callbacks.onPinch?.(scale, center);
      }
      return;
    }

    clearLongPressTimer();

    const start = touchStartRef.current;
    const distance = getDistance(start, currentPoint);
    const deltaTime = currentPoint.timestamp - start.timestamp;
    const velocity = deltaTime > 0 ? distance / deltaTime : 0;

    // Handle swipe detection
    if (cfg.enableSwipe && distance >= cfg.swipeThreshold) {
      const direction = getSwipeDirection(start, currentPoint);

      if (!gestureState.isSwiping) {
        setGestureState((prev) => ({
          ...prev,
          isSwiping: true,
          swipeDirection: direction,
        }));
        callbacks.onSwipeStart?.(direction);
      }
    }

    // Handle panning
    if (cfg.enablePan) {
      const delta = {
        x: currentPoint.x - (gestureState.currentPoint?.x || start.x),
        y: currentPoint.y - (gestureState.currentPoint?.y || start.y),
      };

      if (!isPanningRef.current && distance > 10) {
        isPanningRef.current = true;
        callbacks.onPanStart?.({ x: currentPoint.x, y: currentPoint.y });
      }

      if (isPanningRef.current) {
        const velocityX = deltaTime > 0 ? (currentPoint.x - start.x) / deltaTime : 0;
        const velocityY = deltaTime > 0 ? (currentPoint.y - start.y) / deltaTime : 0;
        callbacks.onPan?.(delta, { x: velocityX, y: velocityY });
      }
    }

    setGestureState((prev) => ({ ...prev, currentPoint }));
  }, [callbacks, clearLongPressTimer, gestureState.currentPoint, gestureState.isSwiping]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const cfg = configRef.current;

    clearLongPressTimer();

    const start = touchStartRef.current;
    const current = gestureState.currentPoint;

    // Handle pinch end
    if (gestureState.isPinching) {
      callbacks.onPinchEnd?.(gestureState.pinchScale);
      setGestureState((prev) => ({
        ...prev,
        isPinching: false,
        pinchScale: 1,
      }));
      initialPinchDistanceRef.current = 0;
    }

    // Handle swipe end
    if (start && current && gestureState.isSwiping) {
      const distance = getDistance(start, current);
      const deltaTime = current.timestamp - start.timestamp;
      const velocity = deltaTime > 0 ? distance / deltaTime : 0;
      const direction = getSwipeDirection(start, current);

      if (velocity >= cfg.swipeVelocityThreshold) {
        callbacks.onSwipe?.(direction, velocity);
      }
      callbacks.onSwipeEnd?.(direction, velocity);
    }

    // Handle pan end
    if (isPanningRef.current && start && current) {
      const deltaTime = current.timestamp - start.timestamp;
      const velocityX = deltaTime > 0 ? (current.x - start.x) / deltaTime : 0;
      const velocityY = deltaTime > 0 ? (current.y - start.y) / deltaTime : 0;
      callbacks.onPanEnd?.({ x: velocityX, y: velocityY });
      isPanningRef.current = false;
    }

    // Handle tap (no significant movement)
    if (start && current) {
      const distance = getDistance(start, current);
      if (distance < 10 && !gestureState.isSwiping) {
        callbacks.onTap?.({ x: current.x, y: current.y });
      }
    }

    // Reset state
    touchStartRef.current = null;
    touchesRef.current.clear();

    setGestureState({
      isPressed: false,
      isPinching: false,
      isSwiping: false,
      swipeDirection: null,
      pinchScale: 1,
      startPoint: null,
      currentPoint: null,
    });
  }, [callbacks, clearLongPressTimer, gestureState]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    clearLongPressTimer();
    touchStartRef.current = null;
    touchesRef.current.clear();
    isPanningRef.current = false;

    setGestureState({
      isPressed: false,
      isPinching: false,
      isSwiping: false,
      swipeDirection: null,
      pinchScale: 1,
      startPoint: null,
      currentPoint: null,
    });
  }, [clearLongPressTimer]);

  // Set up event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const options: AddEventListenerOptions = { passive: !configRef.current.preventDefault };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchCancel, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, clearLongPressTimer]);

  return {
    ref,
    gestureState,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Simple swipe detection hook
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(
  onSwipe: (direction: SwipeDirection) => void,
  config?: Partial<GestureConfig>
) {
  return useTouchGestures<T>(
    { onSwipe },
    { ...config, enablePinch: false, enableLongPress: false, enableDoubleTap: false }
  );
}

/**
 * Swipe to navigate hook (for carousels, pages)
 */
export function useSwipeNavigation<T extends HTMLElement = HTMLElement>(
  onNext: () => void,
  onPrevious: () => void,
  direction: 'horizontal' | 'vertical' = 'horizontal'
) {
  const handleSwipe = useCallback((swipeDir: SwipeDirection) => {
    if (direction === 'horizontal') {
      if (swipeDir === 'left') onNext();
      if (swipeDir === 'right') onPrevious();
    } else {
      if (swipeDir === 'up') onNext();
      if (swipeDir === 'down') onPrevious();
    }
  }, [direction, onNext, onPrevious]);

  return useSwipe<T>(handleSwipe);
}

/**
 * Pinch to zoom hook
 */
export function usePinchZoom<T extends HTMLElement = HTMLElement>(
  onZoom: (scale: number) => void,
  config?: Partial<GestureConfig>
) {
  return useTouchGestures<T>(
    { onPinch: (scale) => onZoom(scale) },
    { ...config, enableSwipe: false, enableLongPress: false, enableDoubleTap: false }
  );
}

/**
 * Pull to refresh hook
 */
export function usePullToRefresh<T extends HTMLElement = HTMLElement>(
  onRefresh: () => void,
  threshold: number = 100
) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handlePan = useCallback((_delta: { x: number; y: number }) => {
    // Pull distance is tracked in gestureState
  }, []);

  const { ref, gestureState } = useTouchGestures<T>(
    {
      onPanStart: () => setIsPulling(true),
      onPan: handlePan,
      onPanEnd: (velocity) => {
        if (pullDistance > threshold && velocity.y > 0) {
          onRefresh();
        }
        setIsPulling(false);
        setPullDistance(0);
      },
    },
    { enableSwipe: false, enablePinch: false, enableLongPress: false, enableDoubleTap: false }
  );

  useEffect(() => {
    if (gestureState.startPoint && gestureState.currentPoint) {
      const distance = gestureState.currentPoint.y - gestureState.startPoint.y;
      if (distance > 0) {
        setPullDistance(distance);
      }
    }
  }, [gestureState.startPoint, gestureState.currentPoint]);

  return {
    ref,
    isPulling,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1),
  };
}

export default useTouchGestures;
