/**
 * AnimationService - Sprint 5.22
 *
 * Avancerat animationssystem för RehabFlow med:
 * - Keyframe-baserade animationer
 * - Fysikbaserade rörelser (spring, decay)
 * - Timeline-koordinering
 * - Gesture-driven animationer
 * - CSS & JavaScript animationer
 * - Performance-optimerade animationer
 * - Stagger och sequence patterns
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EasingFunction = (t: number) => number;
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type FillMode = 'none' | 'forwards' | 'backwards' | 'both';
export type PlayState = 'idle' | 'running' | 'paused' | 'finished';

export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: EasingFunction | string;
  iterations?: number;
  direction?: AnimationDirection;
  fill?: FillMode;
  onStart?: () => void;
  onUpdate?: (progress: number, value: number) => void;
  onComplete?: () => void;
}

export interface KeyframeConfig {
  offset?: number;
  easing?: EasingFunction | string;
  [property: string]: unknown;
}

export interface SpringConfig {
  mass?: number;
  stiffness?: number;
  damping?: number;
  velocity?: number;
  precision?: number;
}

export interface DecayConfig {
  velocity: number;
  deceleration?: number;
  clamp?: [number, number];
}

export interface GestureAnimationConfig {
  from: number;
  to: number;
  velocity: number;
  springConfig?: SpringConfig;
}

export interface TimelineConfig {
  autoPlay?: boolean;
  loop?: boolean;
  direction?: AnimationDirection;
}

export interface TimelineEntry {
  animation: Animation;
  startTime: number;
  duration: number;
}

export interface StaggerConfig {
  each?: number;
  from?: 'first' | 'last' | 'center' | 'edges' | number;
  grid?: [number, number];
  axis?: 'x' | 'y';
  ease?: EasingFunction;
}

export interface Animation {
  id: string;
  play(): void;
  pause(): void;
  stop(): void;
  reverse(): void;
  seek(progress: number): void;
  getProgress(): number;
  getState(): PlayState;
  onFinish(callback: () => void): void;
}

export interface AnimatedValue {
  get(): number;
  set(value: number): void;
  interpolate(config: InterpolateConfig): AnimatedValue;
  addListener(callback: (value: number) => void): () => void;
}

export interface InterpolateConfig {
  inputRange: number[];
  outputRange: number[] | string[];
  extrapolate?: 'clamp' | 'extend' | 'identity';
}

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const Easing = {
  // Linear
  linear: (t: number) => t,

  // Quad
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quart
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Quint
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

  // Sine
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Expo
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  // Circ
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number) => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t: number) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

  // Back
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  // Bounce
  easeInBounce: (t: number) => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number) =>
    t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,

  // Custom bezier
  bezier: (x1: number, y1: number, x2: number, y2: number): EasingFunction => {
    const NEWTON_ITERATIONS = 4;
    const NEWTON_MIN_SLOPE = 0.001;
    const SUBDIVISION_PRECISION = 0.0000001;
    const SUBDIVISION_MAX_ITERATIONS = 10;

    const ax = 3 * x1 - 3 * x2 + 1;
    const bx = 3 * x2 - 6 * x1;
    const cx = 3 * x1;

    const ay = 3 * y1 - 3 * y2 + 1;
    const by = 3 * y2 - 6 * y1;
    const cy = 3 * y1;

    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

    const solveCurveX = (x: number) => {
      let t2 = x;

      for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
        const x2 = sampleCurveX(t2) - x;
        const d2 = sampleCurveDerivativeX(t2);
        if (Math.abs(x2) < SUBDIVISION_PRECISION) return t2;
        if (Math.abs(d2) < NEWTON_MIN_SLOPE) break;
        t2 -= x2 / d2;
      }

      let t0 = 0;
      let t1 = 1;
      t2 = x;

      while (t0 < t1) {
        const x2 = sampleCurveX(t2);
        if (Math.abs(x2 - x) < SUBDIVISION_PRECISION) return t2;
        if (x > x2) t0 = t2;
        else t1 = t2;
        t2 = (t1 - t0) / 2 + t0;
      }

      return t2;
    };

    return (x: number) => {
      if (x === 0 || x === 1) return x;
      return sampleCurveY(solveCurveX(x));
    };
  },

  // Steps
  steps: (steps: number, direction: 'start' | 'end' = 'end'): EasingFunction => {
    return (t: number) => {
      const s = Math.max(0, Math.min(1, t));
      if (direction === 'start') {
        return Math.ceil(s * steps) / steps;
      }
      return Math.floor(s * steps) / steps;
    };
  }
};

// ============================================================================
// ANIMATION SERVICE
// ============================================================================

class AnimationService {
  private static instance: AnimationService;

  private animations: Map<string, AnimationInstance> = new Map();
  private timelines: Map<string, Timeline> = new Map();
  private animatedValues: Map<string, AnimatedValueInstance> = new Map();
  private rafId: number | null = null;
  private lastTime: number = 0;

  private constructor() {
    this.tick = this.tick.bind(this);
  }

  public static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  // ============================================================================
  // CORE ANIMATION
  // ============================================================================

  /**
   * Skapa animation
   */
  public animate(
    from: number,
    to: number,
    config: AnimationConfig
  ): Animation {
    const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const animation = new AnimationInstance(id, from, to, config);
    this.animations.set(id, animation);

    this.startLoop();

    return animation;
  }

  /**
   * Keyframe-animation
   */
  public keyframes(
    target: HTMLElement,
    keyframes: KeyframeConfig[],
    config: AnimationConfig
  ): Animation {
    const id = `kf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Konvertera till Web Animations API
    const normalizedKeyframes = keyframes.map(kf => {
      const { offset, easing, ...props } = kf;
      return {
        offset,
        easing: typeof easing === 'string' ? easing : undefined,
        ...props
      };
    });

    const webAnimation = target.animate(normalizedKeyframes, {
      duration: config.duration,
      delay: config.delay,
      easing: typeof config.easing === 'string' ? config.easing : 'linear',
      iterations: config.iterations ?? 1,
      direction: config.direction,
      fill: config.fill
    });

    const animation = new WebAnimationWrapper(id, webAnimation, config);
    this.animations.set(id, animation as unknown as AnimationInstance);

    return animation;
  }

  /**
   * Fjäder-baserad animation
   */
  public spring(
    from: number,
    to: number,
    config: SpringConfig = {}
  ): Animation {
    const id = `spring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const springAnimation = new SpringAnimation(id, from, to, config);
    this.animations.set(id, springAnimation as unknown as AnimationInstance);

    this.startLoop();

    return springAnimation;
  }

  /**
   * Decay-animation (momentum)
   */
  public decay(from: number, config: DecayConfig): Animation {
    const id = `decay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const decayAnimation = new DecayAnimation(id, from, config);
    this.animations.set(id, decayAnimation as unknown as AnimationInstance);

    this.startLoop();

    return decayAnimation;
  }

  // ============================================================================
  // ANIMATED VALUES
  // ============================================================================

  /**
   * Skapa animerat värde
   */
  public createValue(initialValue: number): AnimatedValue {
    const id = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const value = new AnimatedValueInstance(id, initialValue);
    this.animatedValues.set(id, value);
    return value;
  }

  /**
   * Animera värde till mål
   */
  public timing(
    value: AnimatedValue,
    toValue: number,
    config: AnimationConfig
  ): Animation {
    const animatedValue = value as AnimatedValueInstance;
    const from = animatedValue.get();

    return this.animate(from, toValue, {
      ...config,
      onUpdate: (progress, currentValue) => {
        animatedValue.set(currentValue);
        config.onUpdate?.(progress, currentValue);
      }
    });
  }

  /**
   * Fjäder-animera värde
   */
  public springValue(
    value: AnimatedValue,
    toValue: number,
    config: SpringConfig = {}
  ): Animation {
    const animatedValue = value as AnimatedValueInstance;
    const from = animatedValue.get();

    const springAnim = this.spring(from, toValue, config);

    // Koppla animation till värde
    const originalOnUpdate = (springAnim as SpringAnimation).onUpdateCallback;
    (springAnim as SpringAnimation).onUpdateCallback = (progress, currentValue) => {
      animatedValue.set(currentValue);
      originalOnUpdate?.(progress, currentValue);
    };

    return springAnim;
  }

  // ============================================================================
  // TIMELINE
  // ============================================================================

  /**
   * Skapa tidslinje
   */
  public createTimeline(config: TimelineConfig = {}): Timeline {
    const id = `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timeline = new Timeline(id, config, this);
    this.timelines.set(id, timeline);
    return timeline;
  }

  // ============================================================================
  // SEQUENCE & STAGGER
  // ============================================================================

  /**
   * Kör animationer i sekvens
   */
  public sequence(animations: (() => Animation)[]): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;

      const runNext = () => {
        if (index >= animations.length) {
          resolve();
          return;
        }

        const animation = animations[index]();
        index++;

        animation.onFinish(() => {
          runNext();
        });

        animation.play();
      };

      runNext();
    });
  }

  /**
   * Kör animationer parallellt
   */
  public parallel(animations: (() => Animation)[]): Promise<void> {
    return new Promise((resolve) => {
      let completed = 0;

      animations.forEach(createAnim => {
        const animation = createAnim();

        animation.onFinish(() => {
          completed++;
          if (completed === animations.length) {
            resolve();
          }
        });

        animation.play();
      });
    });
  }

  /**
   * Stagger-animation
   */
  public stagger(
    targets: HTMLElement[],
    keyframes: KeyframeConfig[],
    config: AnimationConfig,
    staggerConfig: StaggerConfig = {}
  ): Animation[] {
    const { each = 50, from = 'first', ease } = staggerConfig;

    const getDelay = (index: number): number => {
      const count = targets.length;

      let staggerIndex: number;

      switch (from) {
        case 'last':
          staggerIndex = count - 1 - index;
          break;
        case 'center':
          staggerIndex = Math.abs((count - 1) / 2 - index);
          break;
        case 'edges':
          staggerIndex = Math.min(index, count - 1 - index);
          break;
        default:
          staggerIndex = typeof from === 'number'
            ? Math.abs(from - index)
            : index;
      }

      let delay = staggerIndex * each;

      if (ease) {
        const progress = staggerIndex / (count - 1);
        delay = ease(progress) * (count - 1) * each;
      }

      return delay;
    };

    return targets.map((target, index) => {
      return this.keyframes(target, keyframes, {
        ...config,
        delay: (config.delay ?? 0) + getDelay(index)
      });
    });
  }

  // ============================================================================
  // CSS HELPERS
  // ============================================================================

  /**
   * Animera CSS-egenskaper
   */
  public animateCSS(
    target: HTMLElement,
    properties: Record<string, [number | string, number | string]>,
    config: AnimationConfig
  ): Animation {
    const keyframes: KeyframeConfig[] = [
      { offset: 0 },
      { offset: 1 }
    ];

    Object.entries(properties).forEach(([prop, [from, to]]) => {
      keyframes[0][prop] = from;
      keyframes[1][prop] = to;
    });

    return this.keyframes(target, keyframes, config);
  }

  /**
   * Fade in
   */
  public fadeIn(target: HTMLElement, config: Partial<AnimationConfig> = {}): Animation {
    return this.animateCSS(target, { opacity: [0, 1] }, {
      duration: 300,
      easing: Easing.easeOutQuad,
      fill: 'forwards',
      ...config
    });
  }

  /**
   * Fade out
   */
  public fadeOut(target: HTMLElement, config: Partial<AnimationConfig> = {}): Animation {
    return this.animateCSS(target, { opacity: [1, 0] }, {
      duration: 300,
      easing: Easing.easeInQuad,
      fill: 'forwards',
      ...config
    });
  }

  /**
   * Slide in
   */
  public slideIn(
    target: HTMLElement,
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    config: Partial<AnimationConfig> = {}
  ): Animation {
    const transforms: Record<string, string> = {
      up: 'translateY(100%)',
      down: 'translateY(-100%)',
      left: 'translateX(100%)',
      right: 'translateX(-100%)'
    };

    return this.animateCSS(target, {
      transform: [transforms[direction], 'translate(0)'],
      opacity: [0, 1]
    }, {
      duration: 400,
      easing: Easing.easeOutCubic,
      fill: 'forwards',
      ...config
    });
  }

  /**
   * Scale in
   */
  public scaleIn(target: HTMLElement, config: Partial<AnimationConfig> = {}): Animation {
    return this.animateCSS(target, {
      transform: ['scale(0)', 'scale(1)'],
      opacity: [0, 1]
    }, {
      duration: 300,
      easing: Easing.easeOutBack,
      fill: 'forwards',
      ...config
    });
  }

  /**
   * Bounce
   */
  public bounce(target: HTMLElement, config: Partial<AnimationConfig> = {}): Animation {
    return this.keyframes(target, [
      { offset: 0, transform: 'translateY(0)' },
      { offset: 0.2, transform: 'translateY(-30px)' },
      { offset: 0.4, transform: 'translateY(0)' },
      { offset: 0.6, transform: 'translateY(-15px)' },
      { offset: 0.8, transform: 'translateY(0)' },
      { offset: 1, transform: 'translateY(0)' }
    ], {
      duration: 600,
      easing: Easing.easeOutQuad,
      ...config
    });
  }

  /**
   * Shake
   */
  public shake(target: HTMLElement, config: Partial<AnimationConfig> = {}): Animation {
    return this.keyframes(target, [
      { offset: 0, transform: 'translateX(0)' },
      { offset: 0.1, transform: 'translateX(-10px)' },
      { offset: 0.2, transform: 'translateX(10px)' },
      { offset: 0.3, transform: 'translateX(-10px)' },
      { offset: 0.4, transform: 'translateX(10px)' },
      { offset: 0.5, transform: 'translateX(-10px)' },
      { offset: 0.6, transform: 'translateX(10px)' },
      { offset: 0.7, transform: 'translateX(-10px)' },
      { offset: 0.8, transform: 'translateX(10px)' },
      { offset: 0.9, transform: 'translateX(-10px)' },
      { offset: 1, transform: 'translateX(0)' }
    ], {
      duration: 500,
      ...config
    });
  }

  /**
   * Pulse
   */
  public pulse(target: HTMLElement, config: Partial<AnimationConfig> = {}): Animation {
    return this.keyframes(target, [
      { offset: 0, transform: 'scale(1)' },
      { offset: 0.5, transform: 'scale(1.1)' },
      { offset: 1, transform: 'scale(1)' }
    ], {
      duration: 300,
      iterations: 2,
      ...config
    });
  }

  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================

  private startLoop(): void {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    let hasActiveAnimations = false;

    this.animations.forEach((animation, id) => {
      if (animation.getState() === 'running') {
        animation.update(deltaTime);
        hasActiveAnimations = true;
      }

      if (animation.getState() === 'finished') {
        this.animations.delete(id);
      }
    });

    this.timelines.forEach((timeline) => {
      if (timeline.getState() === 'running') {
        timeline.update(deltaTime);
        hasActiveAnimations = true;
      }
    });

    if (hasActiveAnimations) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.stopLoop();
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Stoppa alla animationer
   */
  public stopAll(): void {
    this.animations.forEach(animation => animation.stop());
    this.timelines.forEach(timeline => timeline.stop());
    this.animations.clear();
    this.timelines.clear();
    this.stopLoop();
  }

  /**
   * Pausa alla animationer
   */
  public pauseAll(): void {
    this.animations.forEach(animation => animation.pause());
    this.timelines.forEach(timeline => timeline.pause());
  }

  /**
   * Återuppta alla animationer
   */
  public resumeAll(): void {
    this.animations.forEach(animation => {
      if (animation.getState() === 'paused') {
        animation.play();
      }
    });
    this.timelines.forEach(timeline => {
      if (timeline.getState() === 'paused') {
        timeline.play();
      }
    });
    this.startLoop();
  }
}

// ============================================================================
// ANIMATION INSTANCE
// ============================================================================

class AnimationInstance implements Animation {
  public id: string;
  private from: number;
  private to: number;
  private config: AnimationConfig;
  private state: PlayState = 'idle';
  private progress: number = 0;
  private elapsed: number = 0;
  private iteration: number = 0;
  private finishCallbacks: Set<() => void> = new Set();
  private easingFn: EasingFunction;

  constructor(id: string, from: number, to: number, config: AnimationConfig) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.config = config;
    this.easingFn = this.resolveEasing(config.easing);
  }

  private resolveEasing(easing?: EasingFunction | string): EasingFunction {
    if (!easing) return Easing.linear;
    if (typeof easing === 'function') return easing;

    // CSS easing strings
    const cssEasings: Record<string, EasingFunction> = {
      'linear': Easing.linear,
      'ease': Easing.bezier(0.25, 0.1, 0.25, 1),
      'ease-in': Easing.easeInQuad,
      'ease-out': Easing.easeOutQuad,
      'ease-in-out': Easing.easeInOutQuad
    };

    return cssEasings[easing] ?? Easing.linear;
  }

  public play(): void {
    if (this.state === 'finished') {
      this.elapsed = 0;
      this.progress = 0;
      this.iteration = 0;
    }

    this.state = 'running';
    this.config.onStart?.();
  }

  public pause(): void {
    this.state = 'paused';
  }

  public stop(): void {
    this.state = 'idle';
    this.elapsed = 0;
    this.progress = 0;
  }

  public reverse(): void {
    [this.from, this.to] = [this.to, this.from];
    this.elapsed = this.config.duration - this.elapsed;
    this.progress = 1 - this.progress;
  }

  public seek(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
    this.elapsed = this.progress * this.config.duration;
    this.notifyUpdate();
  }

  public getProgress(): number {
    return this.progress;
  }

  public getState(): PlayState {
    return this.state;
  }

  public onFinish(callback: () => void): void {
    this.finishCallbacks.add(callback);
  }

  public update(deltaTime: number): void {
    if (this.state !== 'running') return;

    // Hantera delay
    if (this.config.delay && this.elapsed < 0) {
      this.elapsed += deltaTime;
      if (this.elapsed < 0) return;
      deltaTime = this.elapsed;
      this.elapsed = 0;
    }

    this.elapsed += deltaTime;
    this.progress = Math.min(1, this.elapsed / this.config.duration);

    this.notifyUpdate();

    if (this.progress >= 1) {
      this.handleIterationComplete();
    }
  }

  private notifyUpdate(): void {
    const easedProgress = this.easingFn(this.progress);
    const value = this.from + (this.to - this.from) * easedProgress;
    this.config.onUpdate?.(this.progress, value);
  }

  private handleIterationComplete(): void {
    this.iteration++;
    const maxIterations = this.config.iterations ?? 1;

    if (maxIterations === Infinity || this.iteration < maxIterations) {
      // Hantera direction
      if (this.config.direction === 'alternate' ||
          this.config.direction === 'alternate-reverse') {
        [this.from, this.to] = [this.to, this.from];
      }

      this.elapsed = 0;
      this.progress = 0;
    } else {
      this.state = 'finished';
      this.config.onComplete?.();
      this.finishCallbacks.forEach(cb => cb());
    }
  }
}

// ============================================================================
// SPRING ANIMATION
// ============================================================================

class SpringAnimation implements Animation {
  public id: string;
  private from: number;
  private to: number;
  private config: Required<SpringConfig>;
  private state: PlayState = 'idle';
  private velocity: number;
  private position: number;
  private finishCallbacks: Set<() => void> = new Set();
  public onUpdateCallback?: (progress: number, value: number) => void;

  constructor(id: string, from: number, to: number, config: SpringConfig = {}) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.position = from;
    this.config = {
      mass: config.mass ?? 1,
      stiffness: config.stiffness ?? 100,
      damping: config.damping ?? 10,
      velocity: config.velocity ?? 0,
      precision: config.precision ?? 0.01
    };
    this.velocity = this.config.velocity;
  }

  public play(): void {
    this.state = 'running';
  }

  public pause(): void {
    this.state = 'paused';
  }

  public stop(): void {
    this.state = 'idle';
    this.position = this.from;
    this.velocity = this.config.velocity;
  }

  public reverse(): void {
    [this.from, this.to] = [this.to, this.from];
  }

  public seek(progress: number): void {
    this.position = this.from + (this.to - this.from) * progress;
  }

  public getProgress(): number {
    const distance = Math.abs(this.to - this.from);
    if (distance === 0) return 1;
    return Math.abs(this.position - this.from) / distance;
  }

  public getState(): PlayState {
    return this.state;
  }

  public onFinish(callback: () => void): void {
    this.finishCallbacks.add(callback);
  }

  public update(deltaTime: number): void {
    if (this.state !== 'running') return;

    const dt = deltaTime / 1000; // Konvertera till sekunder

    // Spring physics
    const displacement = this.position - this.to;
    const springForce = -this.config.stiffness * displacement;
    const dampingForce = -this.config.damping * this.velocity;
    const acceleration = (springForce + dampingForce) / this.config.mass;

    this.velocity += acceleration * dt;
    this.position += this.velocity * dt;

    const progress = this.getProgress();
    this.onUpdateCallback?.(progress, this.position);

    // Kontrollera om animation är klar
    if (
      Math.abs(displacement) < this.config.precision &&
      Math.abs(this.velocity) < this.config.precision
    ) {
      this.position = this.to;
      this.state = 'finished';
      this.onUpdateCallback?.(1, this.to);
      this.finishCallbacks.forEach(cb => cb());
    }
  }
}

// ============================================================================
// DECAY ANIMATION
// ============================================================================

class DecayAnimation implements Animation {
  public id: string;
  private position: number;
  private velocity: number;
  private config: Required<DecayConfig>;
  private state: PlayState = 'idle';
  private finishCallbacks: Set<() => void> = new Set();
  private onUpdateCallback?: (progress: number, value: number) => void;

  constructor(id: string, from: number, config: DecayConfig) {
    this.id = id;
    this.position = from;
    this.velocity = config.velocity;
    this.config = {
      velocity: config.velocity,
      deceleration: config.deceleration ?? 0.998,
      clamp: config.clamp ?? [-Infinity, Infinity]
    };
  }

  public play(): void {
    this.state = 'running';
  }

  public pause(): void {
    this.state = 'paused';
  }

  public stop(): void {
    this.state = 'idle';
    this.velocity = this.config.velocity;
  }

  public reverse(): void {
    this.velocity = -this.velocity;
  }

  public seek(_progress: number): void {
    // Decay har ingen definierad slutpunkt
  }

  public getProgress(): number {
    return 0; // Decay har ingen definierad progress
  }

  public getState(): PlayState {
    return this.state;
  }

  public onFinish(callback: () => void): void {
    this.finishCallbacks.add(callback);
  }

  public update(deltaTime: number): void {
    if (this.state !== 'running') return;

    const dt = deltaTime / 1000;

    // Applicera deceleration
    this.velocity *= Math.pow(this.config.deceleration, dt * 60);
    this.position += this.velocity * dt;

    // Clamp position
    const [min, max] = this.config.clamp;
    if (this.position < min) {
      this.position = min;
      this.velocity = 0;
    } else if (this.position > max) {
      this.position = max;
      this.velocity = 0;
    }

    this.onUpdateCallback?.(0, this.position);

    // Kontrollera om animation är klar
    if (Math.abs(this.velocity) < 0.01) {
      this.state = 'finished';
      this.finishCallbacks.forEach(cb => cb());
    }
  }
}

// ============================================================================
// WEB ANIMATION WRAPPER
// ============================================================================

class WebAnimationWrapper implements Animation {
  public id: string;
  private webAnimation: globalThis.Animation;
  private config: AnimationConfig;
  private finishCallbacks: Set<() => void> = new Set();

  constructor(id: string, webAnimation: globalThis.Animation, config: AnimationConfig) {
    this.id = id;
    this.webAnimation = webAnimation;
    this.config = config;

    webAnimation.onfinish = () => {
      this.config.onComplete?.();
      this.finishCallbacks.forEach(cb => cb());
    };
  }

  public play(): void {
    this.webAnimation.play();
    this.config.onStart?.();
  }

  public pause(): void {
    this.webAnimation.pause();
  }

  public stop(): void {
    this.webAnimation.cancel();
  }

  public reverse(): void {
    this.webAnimation.reverse();
  }

  public seek(progress: number): void {
    if (this.webAnimation.effect) {
      const timing = this.webAnimation.effect.getTiming();
      const duration = timing.duration as number;
      this.webAnimation.currentTime = progress * duration;
    }
  }

  public getProgress(): number {
    if (!this.webAnimation.effect) return 0;
    const timing = this.webAnimation.effect.getTiming();
    const duration = timing.duration as number;
    const currentTime = this.webAnimation.currentTime ?? 0;
    return currentTime / duration;
  }

  public getState(): PlayState {
    return this.webAnimation.playState as PlayState;
  }

  public onFinish(callback: () => void): void {
    this.finishCallbacks.add(callback);
  }

  public update(_deltaTime: number): void {
    // Web Animation API hanterar sin egen loop
  }
}

// ============================================================================
// ANIMATED VALUE INSTANCE
// ============================================================================

class AnimatedValueInstance implements AnimatedValue {
  private id: string;
  private value: number;
  private listeners: Set<(value: number) => void> = new Set();

  constructor(id: string, initialValue: number) {
    this.id = id;
    this.value = initialValue;
  }

  public get(): number {
    return this.value;
  }

  public set(value: number): void {
    this.value = value;
    this.listeners.forEach(listener => listener(value));
  }

  public interpolate(config: InterpolateConfig): AnimatedValue {
    const interpolated = new InterpolatedValue(this, config);
    return interpolated;
  }

  public addListener(callback: (value: number) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

// ============================================================================
// INTERPOLATED VALUE
// ============================================================================

class InterpolatedValue implements AnimatedValue {
  private source: AnimatedValueInstance;
  private config: InterpolateConfig;

  constructor(source: AnimatedValueInstance, config: InterpolateConfig) {
    this.source = source;
    this.config = config;
  }

  public get(): number {
    return this.interpolate(this.source.get()) as number;
  }

  public set(_value: number): void {
    // Interpolated values are read-only
    console.warn('Interpolerade värden kan inte sättas direkt');
  }

  public interpolate(config: InterpolateConfig): AnimatedValue {
    return new InterpolatedValue(this as unknown as AnimatedValueInstance, config);
  }

  public addListener(callback: (value: number) => void): () => void {
    return this.source.addListener((value) => {
      callback(this.interpolate(value) as number);
    });
  }

  private interpolate(inputValue: number): number | string {
    const { inputRange, outputRange, extrapolate = 'extend' } = this.config;

    // Hitta segment
    let i = 0;
    for (; i < inputRange.length - 1; i++) {
      if (inputValue < inputRange[i + 1]) break;
    }

    // Hantera extrapolering
    if (inputValue < inputRange[0]) {
      if (extrapolate === 'clamp') return outputRange[0];
      if (extrapolate === 'identity') return inputValue;
      i = 0;
    } else if (inputValue > inputRange[inputRange.length - 1]) {
      if (extrapolate === 'clamp') return outputRange[outputRange.length - 1];
      if (extrapolate === 'identity') return inputValue;
      i = inputRange.length - 2;
    }

    // Interpolera
    const inputMin = inputRange[i];
    const inputMax = inputRange[i + 1];
    const outputMin = outputRange[i];
    const outputMax = outputRange[i + 1];

    const t = (inputValue - inputMin) / (inputMax - inputMin);

    if (typeof outputMin === 'number' && typeof outputMax === 'number') {
      return outputMin + (outputMax - outputMin) * t;
    }

    // String interpolation (för färger etc)
    return outputMin; // Förenklad implementation
  }
}

// ============================================================================
// TIMELINE
// ============================================================================

class Timeline {
  private id: string;
  private config: TimelineConfig;
  private service: AnimationService;
  private entries: TimelineEntry[] = [];
  private state: PlayState = 'idle';
  private currentTime: number = 0;
  private duration: number = 0;

  constructor(id: string, config: TimelineConfig, service: AnimationService) {
    this.id = id;
    this.config = config;
    this.service = service;
  }

  /**
   * Lägg till animation i tidslinje
   */
  public add(
    animation: Animation,
    position: number | string = '+=0'
  ): Timeline {
    let startTime: number;

    if (typeof position === 'number') {
      startTime = position;
    } else if (position.startsWith('+=')) {
      startTime = this.duration + parseFloat(position.slice(2));
    } else if (position.startsWith('-=')) {
      startTime = this.duration - parseFloat(position.slice(2));
    } else {
      startTime = parseFloat(position);
    }

    // Uppskatta duration (om möjligt)
    const estimatedDuration = 1000; // Default

    this.entries.push({
      animation,
      startTime,
      duration: estimatedDuration
    });

    this.duration = Math.max(this.duration, startTime + estimatedDuration);

    return this;
  }

  public play(): void {
    this.state = 'running';

    if (this.config.autoPlay !== false) {
      this.entries.forEach(entry => {
        if (entry.startTime <= this.currentTime) {
          entry.animation.play();
        }
      });
    }
  }

  public pause(): void {
    this.state = 'paused';
    this.entries.forEach(entry => entry.animation.pause());
  }

  public stop(): void {
    this.state = 'idle';
    this.currentTime = 0;
    this.entries.forEach(entry => entry.animation.stop());
  }

  public seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(this.duration, time));

    this.entries.forEach(entry => {
      const localTime = this.currentTime - entry.startTime;
      if (localTime >= 0 && localTime <= entry.duration) {
        entry.animation.seek(localTime / entry.duration);
      }
    });
  }

  public getState(): PlayState {
    return this.state;
  }

  public update(deltaTime: number): void {
    if (this.state !== 'running') return;

    this.currentTime += deltaTime;

    // Starta animationer som ska börja
    this.entries.forEach(entry => {
      const localTime = this.currentTime - entry.startTime;

      if (localTime >= 0 && localTime < deltaTime + entry.startTime) {
        entry.animation.play();
      }
    });

    // Hantera loop
    if (this.currentTime >= this.duration) {
      if (this.config.loop) {
        this.currentTime = 0;
        this.entries.forEach(entry => entry.animation.stop());
      } else {
        this.state = 'finished';
      }
    }
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Hook för animationer
 */
export function useAnimation() {
  const service = useMemo(() => AnimationService.getInstance(), []);

  const animate = useCallback((
    from: number,
    to: number,
    config: AnimationConfig
  ) => {
    return service.animate(from, to, config);
  }, [service]);

  const spring = useCallback((
    from: number,
    to: number,
    config?: SpringConfig
  ) => {
    return service.spring(from, to, config);
  }, [service]);

  return { animate, spring, service };
}

/**
 * Hook för animerat värde
 */
export function useAnimatedValue(initialValue: number) {
  const service = useMemo(() => AnimationService.getInstance(), []);
  const valueRef = useRef<AnimatedValue | null>(null);
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    if (!valueRef.current) {
      valueRef.current = service.createValue(initialValue);
    }

    const unsubscribe = valueRef.current.addListener(setCurrentValue);
    return unsubscribe;
  }, [initialValue, service]);

  const animateTo = useCallback((
    toValue: number,
    config: AnimationConfig
  ) => {
    if (valueRef.current) {
      return service.timing(valueRef.current, toValue, config);
    }
    return null;
  }, [service]);

  const springTo = useCallback((
    toValue: number,
    config?: SpringConfig
  ) => {
    if (valueRef.current) {
      return service.springValue(valueRef.current, toValue, config);
    }
    return null;
  }, [service]);

  return {
    value: currentValue,
    animatedValue: valueRef.current,
    animateTo,
    springTo
  };
}

/**
 * Hook för CSS-animationer
 */
export function useCSSAnimation(ref: React.RefObject<HTMLElement>) {
  const service = useMemo(() => AnimationService.getInstance(), []);

  const fadeIn = useCallback((config?: Partial<AnimationConfig>) => {
    if (ref.current) {
      return service.fadeIn(ref.current, config);
    }
    return null;
  }, [ref, service]);

  const fadeOut = useCallback((config?: Partial<AnimationConfig>) => {
    if (ref.current) {
      return service.fadeOut(ref.current, config);
    }
    return null;
  }, [ref, service]);

  const slideIn = useCallback((
    direction?: 'up' | 'down' | 'left' | 'right',
    config?: Partial<AnimationConfig>
  ) => {
    if (ref.current) {
      return service.slideIn(ref.current, direction, config);
    }
    return null;
  }, [ref, service]);

  const scaleIn = useCallback((config?: Partial<AnimationConfig>) => {
    if (ref.current) {
      return service.scaleIn(ref.current, config);
    }
    return null;
  }, [ref, service]);

  const bounce = useCallback((config?: Partial<AnimationConfig>) => {
    if (ref.current) {
      return service.bounce(ref.current, config);
    }
    return null;
  }, [ref, service]);

  const shake = useCallback((config?: Partial<AnimationConfig>) => {
    if (ref.current) {
      return service.shake(ref.current, config);
    }
    return null;
  }, [ref, service]);

  const pulse = useCallback((config?: Partial<AnimationConfig>) => {
    if (ref.current) {
      return service.pulse(ref.current, config);
    }
    return null;
  }, [ref, service]);

  return { fadeIn, fadeOut, slideIn, scaleIn, bounce, shake, pulse };
}

/**
 * Hook för presence-animation
 */
export function usePresence(isVisible: boolean, config?: Partial<AnimationConfig>) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isVisible ? 'entered' : 'exited'
  );

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationState('entering');

      const timer = setTimeout(() => {
        setAnimationState('entered');
      }, config?.duration ?? 300);

      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');

      const timer = setTimeout(() => {
        setAnimationState('exited');
        setShouldRender(false);
      }, config?.duration ?? 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible, config?.duration]);

  return { shouldRender, animationState };
}

// ============================================================================
// EXPORT
// ============================================================================

export const animationService = AnimationService.getInstance();
export default animationService;
