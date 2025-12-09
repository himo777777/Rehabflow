/**
 * GestureService - Sprint 5.22
 *
 * Avancerad gesture-igenkänning för RehabFlow med:
 * - Touch-gester (tap, swipe, pinch, rotate)
 * - Drag and drop
 * - Long press
 * - Multi-touch stöd
 * - Gesture recording och replay
 * - Accessibility-stöd
 * - Custom gesture patterns
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'pan'
  | 'pinch'
  | 'rotate'
  | 'drag'
  | 'drop'
  | 'custom';

export type GestureState = 'possible' | 'began' | 'changed' | 'ended' | 'cancelled' | 'failed';

export interface Point {
  x: number;
  y: number;
}

export interface TouchPoint extends Point {
  identifier: number;
  timestamp: number;
  force?: number;
  radiusX?: number;
  radiusY?: number;
}

export interface GestureEvent {
  type: GestureType;
  state: GestureState;
  target: HTMLElement;
  timestamp: number;
  touches: TouchPoint[];
  center: Point;
  velocity: Point;
  direction?: Direction;
  distance?: number;
  scale?: number;
  rotation?: number;
  delta?: Point;
  duration?: number;
  tapCount?: number;
  pointerType: 'touch' | 'mouse' | 'pen';
  nativeEvent: TouchEvent | MouseEvent | PointerEvent;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface GestureConfig {
  threshold?: number;
  minVelocity?: number;
  maxDuration?: number;
  minDistance?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  rotationThreshold?: number;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface GestureHandler {
  (event: GestureEvent): void;
}

export interface GestureRecognizer {
  type: GestureType;
  config: GestureConfig;
  handler: GestureHandler;
  enabled: boolean;
}

export interface DragConfig {
  axis?: 'x' | 'y' | 'both';
  bounds?: { left?: number; right?: number; top?: number; bottom?: number } | HTMLElement;
  snap?: Point[] | { x?: number; y?: number };
  inertia?: boolean;
  resistance?: number;
  lockAxis?: boolean;
}

export interface DragState {
  isDragging: boolean;
  startPosition: Point;
  currentPosition: Point;
  offset: Point;
  velocity: Point;
}

export interface GesturePattern {
  name: string;
  points: Point[];
  tolerance?: number;
}

export interface RecordedGesture {
  id: string;
  type: GestureType;
  events: GestureEvent[];
  duration: number;
  timestamp: number;
}

// ============================================================================
// GESTURE SERVICE
// ============================================================================

class GestureService {
  private static instance: GestureService;

  private recognizers: Map<string, Map<GestureType, GestureRecognizer[]>> = new Map();
  private activeGestures: Map<string, GestureState> = new Map();
  private touchHistory: Map<number, TouchPoint[]> = new Map();
  private customPatterns: Map<string, GesturePattern> = new Map();
  private recordings: Map<string, RecordedGesture> = new Map();
  private isRecording: boolean = false;
  private currentRecording: GestureEvent[] = [];
  private lastTapTime: number = 0;
  private tapCount: number = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private initialPinchDistance: number = 0;
  private initialRotation: number = 0;

  private defaultConfig: GestureConfig = {
    threshold: 10,
    minVelocity: 0.3,
    maxDuration: 300,
    minDistance: 50,
    longPressDelay: 500,
    doubleTapDelay: 300,
    pinchThreshold: 0.1,
    rotationThreshold: 10,
    enabled: true,
    preventDefault: true,
    stopPropagation: false
  };

  private constructor() {}

  public static getInstance(): GestureService {
    if (!GestureService.instance) {
      GestureService.instance = new GestureService();
    }
    return GestureService.instance;
  }

  // ============================================================================
  // RECOGNIZER MANAGEMENT
  // ============================================================================

  /**
   * Lägg till gesture-lyssnare på element
   */
  public addGestureListener(
    element: HTMLElement,
    type: GestureType,
    handler: GestureHandler,
    config: GestureConfig = {}
  ): () => void {
    const elementId = this.getElementId(element);

    if (!this.recognizers.has(elementId)) {
      this.recognizers.set(elementId, new Map());
      this.attachListeners(element);
    }

    const elementRecognizers = this.recognizers.get(elementId)!;

    if (!elementRecognizers.has(type)) {
      elementRecognizers.set(type, []);
    }

    const recognizer: GestureRecognizer = {
      type,
      config: { ...this.defaultConfig, ...config },
      handler,
      enabled: config.enabled !== false
    };

    elementRecognizers.get(type)!.push(recognizer);

    // Returnera cleanup-funktion
    return () => {
      const recognizers = elementRecognizers.get(type);
      if (recognizers) {
        const index = recognizers.indexOf(recognizer);
        if (index > -1) {
          recognizers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Ta bort alla gesture-lyssnare från element
   */
  public removeAllGestureListeners(element: HTMLElement): void {
    const elementId = this.getElementId(element);
    this.recognizers.delete(elementId);
    this.detachListeners(element);
  }

  /**
   * Aktivera/avaktivera gesture-typ
   */
  public setGestureEnabled(element: HTMLElement, type: GestureType, enabled: boolean): void {
    const elementId = this.getElementId(element);
    const elementRecognizers = this.recognizers.get(elementId);

    if (elementRecognizers?.has(type)) {
      elementRecognizers.get(type)!.forEach(r => r.enabled = enabled);
    }
  }

  private getElementId(element: HTMLElement): string {
    if (!element.dataset.gestureId) {
      element.dataset.gestureId = `gesture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return element.dataset.gestureId;
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  private attachListeners(element: HTMLElement): void {
    // Touch events
    element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });

    // Mouse events (för desktop-stöd)
    element.addEventListener('mousedown', this.handleMouseDown);
    element.addEventListener('mousemove', this.handleMouseMove);
    element.addEventListener('mouseup', this.handleMouseUp);
    element.addEventListener('mouseleave', this.handleMouseLeave);

    // Pointer events (för pen-stöd)
    if ('PointerEvent' in window) {
      element.addEventListener('pointerdown', this.handlePointerDown);
      element.addEventListener('pointermove', this.handlePointerMove);
      element.addEventListener('pointerup', this.handlePointerUp);
      element.addEventListener('pointercancel', this.handlePointerCancel);
    }
  }

  private detachListeners(element: HTMLElement): void {
    element.removeEventListener('touchstart', this.handleTouchStart);
    element.removeEventListener('touchmove', this.handleTouchMove);
    element.removeEventListener('touchend', this.handleTouchEnd);
    element.removeEventListener('touchcancel', this.handleTouchCancel);

    element.removeEventListener('mousedown', this.handleMouseDown);
    element.removeEventListener('mousemove', this.handleMouseMove);
    element.removeEventListener('mouseup', this.handleMouseUp);
    element.removeEventListener('mouseleave', this.handleMouseLeave);

    if ('PointerEvent' in window) {
      element.removeEventListener('pointerdown', this.handlePointerDown);
      element.removeEventListener('pointermove', this.handlePointerMove);
      element.removeEventListener('pointerup', this.handlePointerUp);
      element.removeEventListener('pointercancel', this.handlePointerCancel);
    }
  }

  // ============================================================================
  // TOUCH HANDLERS
  // ============================================================================

  private handleTouchStart = (e: TouchEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.extractTouches(e);

    this.startGestureTracking(element, touches, 'touch', e);
  };

  private handleTouchMove = (e: TouchEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.extractTouches(e);

    this.updateGestureTracking(element, touches, 'touch', e);
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.extractTouches(e);

    this.endGestureTracking(element, touches, 'touch', e);
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    const element = e.currentTarget as HTMLElement;
    this.cancelGestureTracking(element, 'touch', e);
  };

  // ============================================================================
  // MOUSE HANDLERS
  // ============================================================================

  private handleMouseDown = (e: MouseEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.mouseToTouches(e);

    this.startGestureTracking(element, touches, 'mouse', e);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.mouseToTouches(e);

    if (e.buttons > 0) {
      this.updateGestureTracking(element, touches, 'mouse', e);
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.mouseToTouches(e);

    this.endGestureTracking(element, touches, 'mouse', e);
  };

  private handleMouseLeave = (e: MouseEvent): void => {
    const element = e.currentTarget as HTMLElement;
    if (e.buttons > 0) {
      this.cancelGestureTracking(element, 'mouse', e);
    }
  };

  // ============================================================================
  // POINTER HANDLERS
  // ============================================================================

  private handlePointerDown = (e: PointerEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.pointerToTouches(e);
    const pointerType = e.pointerType as 'touch' | 'mouse' | 'pen';

    this.startGestureTracking(element, touches, pointerType, e);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.pointerToTouches(e);
    const pointerType = e.pointerType as 'touch' | 'mouse' | 'pen';

    this.updateGestureTracking(element, touches, pointerType, e);
  };

  private handlePointerUp = (e: PointerEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const touches = this.pointerToTouches(e);
    const pointerType = e.pointerType as 'touch' | 'mouse' | 'pen';

    this.endGestureTracking(element, touches, pointerType, e);
  };

  private handlePointerCancel = (e: PointerEvent): void => {
    const element = e.currentTarget as HTMLElement;
    const pointerType = e.pointerType as 'touch' | 'mouse' | 'pen';

    this.cancelGestureTracking(element, pointerType, e);
  };

  // ============================================================================
  // GESTURE TRACKING
  // ============================================================================

  private startGestureTracking(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    const elementId = this.getElementId(element);

    // Spara touch-historik
    touches.forEach(touch => {
      this.touchHistory.set(touch.identifier, [touch]);
    });

    // Hantera long press
    this.startLongPressDetection(element, touches, pointerType, nativeEvent);

    // Hantera pinch/rotate start
    if (touches.length >= 2) {
      this.initialPinchDistance = this.getDistance(touches[0], touches[1]);
      this.initialRotation = this.getAngle(touches[0], touches[1]);
    }

    // Skicka began-event
    this.emitGestureEvent(element, 'pan', 'began', touches, pointerType, nativeEvent);
  }

  private updateGestureTracking(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    // Uppdatera touch-historik
    touches.forEach(touch => {
      const history = this.touchHistory.get(touch.identifier) || [];
      history.push(touch);
      this.touchHistory.set(touch.identifier, history);
    });

    // Avbryt long press vid rörelse
    if (this.longPressTimer) {
      const firstTouch = touches[0];
      const history = this.touchHistory.get(firstTouch?.identifier) || [];
      const startTouch = history[0];

      if (startTouch && firstTouch) {
        const distance = this.getDistance(startTouch, firstTouch);
        if (distance > this.defaultConfig.threshold!) {
          this.cancelLongPress();
        }
      }
    }

    // Detektera pinch
    if (touches.length >= 2) {
      this.detectPinch(element, touches, pointerType, nativeEvent);
      this.detectRotation(element, touches, pointerType, nativeEvent);
    }

    // Skicka changed-event
    this.emitGestureEvent(element, 'pan', 'changed', touches, pointerType, nativeEvent);
  }

  private endGestureTracking(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    this.cancelLongPress();

    // Analysera gesture
    const gestureInfo = this.analyzeGesture(touches);

    // Detektera tap
    if (gestureInfo.isTap) {
      this.handleTap(element, touches, pointerType, nativeEvent);
    }

    // Detektera swipe
    if (gestureInfo.isSwipe) {
      this.handleSwipe(element, gestureInfo.direction!, touches, pointerType, nativeEvent);
    }

    // Skicka ended-event
    this.emitGestureEvent(element, 'pan', 'ended', touches, pointerType, nativeEvent);

    // Rensa historik
    touches.forEach(touch => {
      this.touchHistory.delete(touch.identifier);
    });
  }

  private cancelGestureTracking(
    element: HTMLElement,
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    this.cancelLongPress();

    this.emitGestureEvent(element, 'pan', 'cancelled', [], pointerType, nativeEvent);

    this.touchHistory.clear();
  }

  // ============================================================================
  // GESTURE DETECTION
  // ============================================================================

  private analyzeGesture(touches: TouchPoint[]): {
    isTap: boolean;
    isSwipe: boolean;
    direction?: Direction;
    distance: number;
    velocity: Point;
    duration: number;
  } {
    if (touches.length === 0) {
      return { isTap: false, isSwipe: false, distance: 0, velocity: { x: 0, y: 0 }, duration: 0 };
    }

    const history = this.touchHistory.get(touches[0].identifier) || [];
    if (history.length < 2) {
      return { isTap: true, isSwipe: false, distance: 0, velocity: { x: 0, y: 0 }, duration: 0 };
    }

    const startPoint = history[0];
    const endPoint = history[history.length - 1];

    const distance = this.getDistance(startPoint, endPoint);
    const duration = endPoint.timestamp - startPoint.timestamp;

    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;

    const velocity: Point = {
      x: duration > 0 ? deltaX / duration * 1000 : 0,
      y: duration > 0 ? deltaY / duration * 1000 : 0
    };

    const isTap = distance < this.defaultConfig.threshold! && duration < this.defaultConfig.maxDuration!;
    const isSwipe = distance >= this.defaultConfig.minDistance! &&
      (Math.abs(velocity.x) > this.defaultConfig.minVelocity! ||
        Math.abs(velocity.y) > this.defaultConfig.minVelocity!);

    let direction: Direction = 'none';
    if (isSwipe) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    return { isTap, isSwipe, direction, distance, velocity, duration };
  }

  private handleTap(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    const now = Date.now();

    if (now - this.lastTapTime < this.defaultConfig.doubleTapDelay!) {
      this.tapCount++;
    } else {
      this.tapCount = 1;
    }

    this.lastTapTime = now;

    if (this.tapCount === 2) {
      this.emitGestureEvent(element, 'double-tap', 'ended', touches, pointerType, nativeEvent);
      this.tapCount = 0;
    } else {
      // Fördröj tap för att kunna detektera double-tap
      setTimeout(() => {
        if (this.tapCount === 1) {
          this.emitGestureEvent(element, 'tap', 'ended', touches, pointerType, nativeEvent);
          this.tapCount = 0;
        }
      }, this.defaultConfig.doubleTapDelay!);
    }
  }

  private handleSwipe(
    element: HTMLElement,
    direction: Direction,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    // Generell swipe
    this.emitGestureEvent(element, 'swipe', 'ended', touches, pointerType, nativeEvent, { direction });

    // Riktningsspecifik swipe
    const directionType = `swipe-${direction}` as GestureType;
    this.emitGestureEvent(element, directionType, 'ended', touches, pointerType, nativeEvent);
  }

  private startLongPressDetection(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    this.cancelLongPress();

    this.longPressTimer = setTimeout(() => {
      this.emitGestureEvent(element, 'long-press', 'ended', touches, pointerType, nativeEvent);
      this.longPressTimer = null;
    }, this.defaultConfig.longPressDelay!);
  }

  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private detectPinch(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    const currentDistance = this.getDistance(touches[0], touches[1]);
    const scale = currentDistance / this.initialPinchDistance;

    if (Math.abs(1 - scale) > this.defaultConfig.pinchThreshold!) {
      this.emitGestureEvent(element, 'pinch', 'changed', touches, pointerType, nativeEvent, { scale });
    }
  }

  private detectRotation(
    element: HTMLElement,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent
  ): void {
    const currentAngle = this.getAngle(touches[0], touches[1]);
    const rotation = currentAngle - this.initialRotation;

    if (Math.abs(rotation) > this.defaultConfig.rotationThreshold!) {
      this.emitGestureEvent(element, 'rotate', 'changed', touches, pointerType, nativeEvent, { rotation });
    }
  }

  // ============================================================================
  // EVENT EMISSION
  // ============================================================================

  private emitGestureEvent(
    element: HTMLElement,
    type: GestureType,
    state: GestureState,
    touches: TouchPoint[],
    pointerType: 'touch' | 'mouse' | 'pen',
    nativeEvent: TouchEvent | MouseEvent | PointerEvent,
    extra: Partial<GestureEvent> = {}
  ): void {
    const elementId = this.getElementId(element);
    const recognizers = this.recognizers.get(elementId)?.get(type);

    if (!recognizers || recognizers.length === 0) return;

    const history = touches.length > 0 ? this.touchHistory.get(touches[0].identifier) || [] : [];
    const startPoint = history[0];
    const currentPoint = touches[0] || startPoint;

    const event: GestureEvent = {
      type,
      state,
      target: element,
      timestamp: Date.now(),
      touches,
      center: this.getCenter(touches),
      velocity: this.calculateVelocity(history),
      distance: startPoint && currentPoint ? this.getDistance(startPoint, currentPoint) : 0,
      delta: startPoint && currentPoint ? {
        x: currentPoint.x - startPoint.x,
        y: currentPoint.y - startPoint.y
      } : { x: 0, y: 0 },
      duration: startPoint && currentPoint ? currentPoint.timestamp - startPoint.timestamp : 0,
      tapCount: this.tapCount,
      pointerType,
      nativeEvent,
      ...extra
    };

    // Spela in om recording är aktiv
    if (this.isRecording) {
      this.currentRecording.push(event);
    }

    // Anropa handlers
    recognizers.forEach(recognizer => {
      if (recognizer.enabled) {
        if (recognizer.config.preventDefault) {
          nativeEvent.preventDefault();
        }
        if (recognizer.config.stopPropagation) {
          nativeEvent.stopPropagation();
        }

        recognizer.handler(event);
      }
    });
  }

  // ============================================================================
  // DRAG AND DROP
  // ============================================================================

  /**
   * Gör element dragbart
   */
  public makeDraggable(
    element: HTMLElement,
    config: DragConfig = {},
    onDrag?: (state: DragState) => void
  ): () => void {
    const state: DragState = {
      isDragging: false,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    };

    let lockedAxis: 'x' | 'y' | null = null;

    const handleStart = (e: GestureEvent) => {
      state.isDragging = true;
      state.startPosition = { ...e.center };
      state.currentPosition = { ...e.center };

      const rect = element.getBoundingClientRect();
      state.offset = {
        x: e.center.x - rect.left,
        y: e.center.y - rect.top
      };

      lockedAxis = null;
      element.style.cursor = 'grabbing';

      onDrag?.(state);
    };

    const handleMove = (e: GestureEvent) => {
      if (!state.isDragging) return;

      let newX = e.center.x - state.offset.x;
      let newY = e.center.y - state.offset.y;

      // Lås axel vid första rörelse
      if (config.lockAxis && !lockedAxis && e.delta) {
        if (Math.abs(e.delta.x) > Math.abs(e.delta.y)) {
          lockedAxis = 'x';
        } else {
          lockedAxis = 'y';
        }
      }

      // Applicera axel-begränsning
      if (config.axis === 'x' || lockedAxis === 'y') {
        newY = state.startPosition.y - state.offset.y;
      }
      if (config.axis === 'y' || lockedAxis === 'x') {
        newX = state.startPosition.x - state.offset.x;
      }

      // Applicera bounds
      if (config.bounds) {
        const bounds = this.resolveBounds(config.bounds, element);
        newX = Math.max(bounds.left, Math.min(bounds.right, newX));
        newY = Math.max(bounds.top, Math.min(bounds.bottom, newY));
      }

      // Applicera resistance
      if (config.resistance && config.bounds) {
        const bounds = this.resolveBounds(config.bounds, element);
        if (newX < bounds.left || newX > bounds.right) {
          const overflow = newX < bounds.left ? bounds.left - newX : newX - bounds.right;
          newX = newX < bounds.left
            ? bounds.left - overflow * config.resistance
            : bounds.right + overflow * config.resistance;
        }
        if (newY < bounds.top || newY > bounds.bottom) {
          const overflow = newY < bounds.top ? bounds.top - newY : newY - bounds.bottom;
          newY = newY < bounds.top
            ? bounds.top - overflow * config.resistance
            : bounds.bottom + overflow * config.resistance;
        }
      }

      state.currentPosition = { x: newX, y: newY };
      state.velocity = e.velocity;

      element.style.transform = `translate(${newX}px, ${newY}px)`;

      onDrag?.(state);
    };

    const handleEnd = (e: GestureEvent) => {
      if (!state.isDragging) return;

      state.isDragging = false;
      element.style.cursor = 'grab';

      // Snappa till närmaste punkt
      if (config.snap) {
        const snapped = this.snapToPoint(state.currentPosition, config.snap);
        element.style.transition = 'transform 0.2s ease-out';
        element.style.transform = `translate(${snapped.x}px, ${snapped.y}px)`;
        state.currentPosition = snapped;

        setTimeout(() => {
          element.style.transition = '';
        }, 200);
      }

      // Applicera inertia
      if (config.inertia) {
        this.applyInertia(element, state, config);
      }

      onDrag?.(state);
    };

    // Lägg till listeners
    const cleanupPan = this.addGestureListener(element, 'pan', (e) => {
      switch (e.state) {
        case 'began':
          handleStart(e);
          break;
        case 'changed':
          handleMove(e);
          break;
        case 'ended':
        case 'cancelled':
          handleEnd(e);
          break;
      }
    });

    element.style.cursor = 'grab';
    element.style.touchAction = 'none';

    return () => {
      cleanupPan();
      element.style.cursor = '';
      element.style.touchAction = '';
    };
  }

  private resolveBounds(
    bounds: DragConfig['bounds'],
    element: HTMLElement
  ): { left: number; right: number; top: number; bottom: number } {
    if (bounds instanceof HTMLElement) {
      const rect = bounds.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      return {
        left: 0,
        right: rect.width - elementRect.width,
        top: 0,
        bottom: rect.height - elementRect.height
      };
    }

    return {
      left: bounds?.left ?? -Infinity,
      right: bounds?.right ?? Infinity,
      top: bounds?.top ?? -Infinity,
      bottom: bounds?.bottom ?? Infinity
    };
  }

  private snapToPoint(position: Point, snap: DragConfig['snap']): Point {
    if (Array.isArray(snap)) {
      // Hitta närmaste punkt
      let nearest = snap[0];
      let minDistance = Infinity;

      snap.forEach(point => {
        const distance = this.getDistance(position, point);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = point;
        }
      });

      return nearest;
    }

    // Grid snap
    return {
      x: snap?.x ? Math.round(position.x / snap.x) * snap.x : position.x,
      y: snap?.y ? Math.round(position.y / snap.y) * snap.y : position.y
    };
  }

  private applyInertia(
    element: HTMLElement,
    state: DragState,
    config: DragConfig
  ): void {
    const deceleration = 0.95;
    let velocity = { ...state.velocity };
    let position = { ...state.currentPosition };

    const animate = () => {
      velocity.x *= deceleration;
      velocity.y *= deceleration;

      position.x += velocity.x / 60;
      position.y += velocity.y / 60;

      // Applicera bounds
      if (config.bounds) {
        const bounds = this.resolveBounds(config.bounds, element);
        position.x = Math.max(bounds.left, Math.min(bounds.right, position.x));
        position.y = Math.max(bounds.top, Math.min(bounds.bottom, position.y));
      }

      element.style.transform = `translate(${position.x}px, ${position.y}px)`;

      if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // ============================================================================
  // CUSTOM PATTERNS
  // ============================================================================

  /**
   * Registrera custom gesture pattern
   */
  public registerPattern(pattern: GesturePattern): void {
    this.customPatterns.set(pattern.name, pattern);
  }

  /**
   * Ta bort custom pattern
   */
  public unregisterPattern(name: string): void {
    this.customPatterns.delete(name);
  }

  /**
   * Kontrollera om gesture matchar pattern
   */
  public matchPattern(gesture: Point[], patternName: string): boolean {
    const pattern = this.customPatterns.get(patternName);
    if (!pattern) return false;

    // Normalisera båda till samma storlek
    const normalizedGesture = this.normalizeGesture(gesture);
    const normalizedPattern = this.normalizeGesture(pattern.points);

    // Beräkna likhet
    const similarity = this.calculateSimilarity(normalizedGesture, normalizedPattern);
    const tolerance = pattern.tolerance ?? 0.7;

    return similarity >= tolerance;
  }

  private normalizeGesture(points: Point[]): Point[] {
    if (points.length < 2) return points;

    // Omsampling till fast antal punkter
    const targetPoints = 32;
    const resampled = this.resamplePoints(points, targetPoints);

    // Rotera till startvinkel
    const centroid = this.getCentroid(resampled);
    const angle = Math.atan2(centroid.y - resampled[0].y, centroid.x - resampled[0].x);
    const rotated = this.rotatePoints(resampled, -angle);

    // Skala till enhetsstorlek
    const scaled = this.scaleToSquare(rotated, 100);

    // Flytta till origo
    const newCentroid = this.getCentroid(scaled);
    return scaled.map(p => ({
      x: p.x - newCentroid.x,
      y: p.y - newCentroid.y
    }));
  }

  private resamplePoints(points: Point[], n: number): Point[] {
    const totalLength = this.getPathLength(points);
    const interval = totalLength / (n - 1);
    const resampled: Point[] = [points[0]];

    let distance = 0;

    for (let i = 1; i < points.length; i++) {
      const segmentLength = this.getDistance(points[i - 1], points[i]);

      while (distance + segmentLength >= interval) {
        const t = (interval - distance) / segmentLength;
        const newPoint = {
          x: points[i - 1].x + t * (points[i].x - points[i - 1].x),
          y: points[i - 1].y + t * (points[i].y - points[i - 1].y)
        };
        resampled.push(newPoint);
        distance = 0;
      }

      distance += segmentLength;
    }

    while (resampled.length < n) {
      resampled.push(points[points.length - 1]);
    }

    return resampled.slice(0, n);
  }

  private getPathLength(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += this.getDistance(points[i - 1], points[i]);
    }
    return length;
  }

  private getCentroid(points: Point[]): Point {
    const sum = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  private rotatePoints(points: Point[], angle: number): Point[] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const centroid = this.getCentroid(points);

    return points.map(p => {
      const dx = p.x - centroid.x;
      const dy = p.y - centroid.y;
      return {
        x: centroid.x + dx * cos - dy * sin,
        y: centroid.y + dx * sin + dy * cos
      };
    });
  }

  private scaleToSquare(points: Point[], size: number): Point[] {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    points.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const scaleX = size / (maxX - minX);
    const scaleY = size / (maxY - minY);

    return points.map(p => ({
      x: (p.x - minX) * scaleX,
      y: (p.y - minY) * scaleY
    }));
  }

  private calculateSimilarity(a: Point[], b: Point[]): number {
    if (a.length !== b.length) return 0;

    let totalDistance = 0;
    for (let i = 0; i < a.length; i++) {
      totalDistance += this.getDistance(a[i], b[i]);
    }

    const avgDistance = totalDistance / a.length;
    // Konvertera avstånd till likhetsscore (0-1)
    return Math.max(0, 1 - avgDistance / 100);
  }

  // ============================================================================
  // RECORDING
  // ============================================================================

  /**
   * Starta gesture recording
   */
  public startRecording(): void {
    this.isRecording = true;
    this.currentRecording = [];
  }

  /**
   * Stoppa recording och returnera resultat
   */
  public stopRecording(): RecordedGesture | null {
    if (!this.isRecording) return null;

    this.isRecording = false;

    if (this.currentRecording.length === 0) return null;

    const recording: RecordedGesture = {
      id: `rec_${Date.now()}`,
      type: this.currentRecording[0].type,
      events: [...this.currentRecording],
      duration: this.currentRecording[this.currentRecording.length - 1].timestamp -
        this.currentRecording[0].timestamp,
      timestamp: Date.now()
    };

    this.recordings.set(recording.id, recording);
    this.currentRecording = [];

    return recording;
  }

  /**
   * Spela upp inspelad gesture
   */
  public playRecording(id: string, element: HTMLElement): Promise<void> {
    const recording = this.recordings.get(id);
    if (!recording) return Promise.reject('Recording not found');

    return new Promise((resolve) => {
      let index = 0;
      const startTime = Date.now();

      const playNext = () => {
        if (index >= recording.events.length) {
          resolve();
          return;
        }

        const event = recording.events[index];
        const eventTime = event.timestamp - recording.events[0].timestamp;
        const elapsed = Date.now() - startTime;

        if (elapsed >= eventTime) {
          // Emittera event
          const elementId = this.getElementId(element);
          const recognizers = this.recognizers.get(elementId)?.get(event.type);

          recognizers?.forEach(r => {
            if (r.enabled) r.handler({ ...event, target: element });
          });

          index++;
        }

        requestAnimationFrame(playNext);
      };

      playNext();
    });
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private extractTouches(e: TouchEvent): TouchPoint[] {
    return Array.from(e.touches).map(touch => ({
      identifier: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: e.timeStamp,
      force: touch.force,
      radiusX: touch.radiusX,
      radiusY: touch.radiusY
    }));
  }

  private mouseToTouches(e: MouseEvent): TouchPoint[] {
    return [{
      identifier: 0,
      x: e.clientX,
      y: e.clientY,
      timestamp: e.timeStamp
    }];
  }

  private pointerToTouches(e: PointerEvent): TouchPoint[] {
    return [{
      identifier: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      timestamp: e.timeStamp,
      force: e.pressure
    }];
  }

  private getDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngle(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  }

  private getCenter(touches: TouchPoint[]): Point {
    if (touches.length === 0) return { x: 0, y: 0 };

    const sum = touches.reduce(
      (acc, t) => ({ x: acc.x + t.x, y: acc.y + t.y }),
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / touches.length,
      y: sum.y / touches.length
    };
  }

  private calculateVelocity(history: TouchPoint[]): Point {
    if (history.length < 2) return { x: 0, y: 0 };

    // Använd senaste 100ms för velocityberäkning
    const now = history[history.length - 1].timestamp;
    const relevantPoints = history.filter(p => now - p.timestamp < 100);

    if (relevantPoints.length < 2) return { x: 0, y: 0 };

    const first = relevantPoints[0];
    const last = relevantPoints[relevantPoints.length - 1];
    const duration = (last.timestamp - first.timestamp) / 1000;

    if (duration === 0) return { x: 0, y: 0 };

    return {
      x: (last.x - first.x) / duration,
      y: (last.y - first.y) / duration
    };
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Hook för gesture-lyssnare
 */
export function useGesture<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handlers: Partial<Record<GestureType, GestureHandler>>,
  config?: GestureConfig
) {
  const service = GestureService.getInstance();

  useEffect(() => {
    if (!ref.current) return;

    const cleanups: (() => void)[] = [];

    (Object.entries(handlers) as [GestureType, GestureHandler][]).forEach(([type, handler]) => {
      if (handler && ref.current) {
        cleanups.push(service.addGestureListener(ref.current, type, handler, config));
      }
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [ref, handlers, config]);
}

/**
 * Hook för tap-gesture
 */
export function useTap<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void,
  config?: GestureConfig
) {
  useGesture(ref, { tap: handler }, config);
}

/**
 * Hook för swipe-gesture
 */
export function useSwipe<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handlers: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  },
  config?: GestureConfig
) {
  useGesture(ref, {
    'swipe-left': handlers.onSwipeLeft,
    'swipe-right': handlers.onSwipeRight,
    'swipe-up': handlers.onSwipeUp,
    'swipe-down': handlers.onSwipeDown
  }, config);
}

/**
 * Hook för long press
 */
export function useLongPress<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void,
  delay?: number
) {
  useGesture(ref, { 'long-press': handler }, { longPressDelay: delay });
}

/**
 * Hook för pinch
 */
export function usePinch<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (scale: number) => void,
  config?: GestureConfig
) {
  useGesture(ref, {
    pinch: (e) => {
      if (e.scale !== undefined) {
        handler(e.scale);
      }
    }
  }, config);
}

/**
 * Hook för drag
 */
export function useDrag<T extends HTMLElement>(
  ref: React.RefObject<T>,
  config?: DragConfig
) {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 }
  });

  const service = GestureService.getInstance();

  useEffect(() => {
    if (!ref.current) return;

    return service.makeDraggable(ref.current, config, setState);
  }, [ref, config]);

  return state;
}

/**
 * Hook för pan-gesture
 */
export function usePan<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: GestureEvent) => void,
  config?: GestureConfig
) {
  useGesture(ref, { pan: handler }, config);
}

// ============================================================================
// EXPORT
// ============================================================================

export const gestureService = GestureService.getInstance();
export default gestureService;
