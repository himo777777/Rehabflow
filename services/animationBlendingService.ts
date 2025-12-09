/**
 * Animation Blending Service - Mjuka övergångar mellan poser
 *
 * Hanterar:
 * - Linjär interpolation mellan poser (LERP)
 * - Easing-funktioner för naturliga rörelser
 * - Spherical interpolation för rotationer (SLERP)
 * - Blend-trees för komplexa övergångar
 *
 * Används av RealisticAvatar3D för smidiga övergångar mellan övningar.
 */

// ============================================
// TYPES
// ============================================

export interface JointAngles {
  // Axlar
  leftShoulderFlex?: number;
  leftShoulderAbduct?: number;
  leftShoulderRotate?: number;
  rightShoulderFlex?: number;
  rightShoulderAbduct?: number;
  rightShoulderRotate?: number;

  // Armbågar
  leftElbowFlex?: number;
  rightElbowFlex?: number;

  // Handleder
  leftWristFlex?: number;
  rightWristFlex?: number;

  // Höfter
  leftHipFlex?: number;
  leftHipAbduct?: number;
  leftHipRotate?: number;
  rightHipFlex?: number;
  rightHipAbduct?: number;
  rightHipRotate?: number;

  // Knän
  leftKneeFlex?: number;
  rightKneeFlex?: number;

  // Fotleder
  leftAnkleFlex?: number;
  rightAnkleFlex?: number;

  // Ryggrad
  spineFlex?: number;
  spineRotate?: number;
  spineLateral?: number;

  // Nacke
  neckFlex?: number;
  neckRotate?: number;
  neckLateral?: number;
}

export interface AnimationKeyframe {
  time: number;           // 0-1 normaliserad tid
  pose: JointAngles;
  easing?: EasingType;
}

export interface AnimationClip {
  name: string;
  duration: number;       // millisekunder
  keyframes: AnimationKeyframe[];
  loop?: boolean;
  loopType?: 'restart' | 'pingpong';
}

export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'spring';

export interface BlendConfig {
  duration: number;       // millisekunder för övergång
  easing: EasingType;
  delay?: number;         // fördröjning innan start
}

export interface AnimationState {
  currentClip: AnimationClip | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  blendProgress: number;  // 0-1 för övergångar
  previousPose: JointAngles | null;
}

// ============================================
// EASING FUNCTIONS
// ============================================

const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,

  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  easeInElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  spring: (t) => {
    // Dampat fjädersystem
    const omega = 10;
    const zeta = 0.5;
    return 1 - Math.exp(-zeta * omega * t) *
      (Math.cos(omega * Math.sqrt(1 - zeta * zeta) * t) +
       (zeta / Math.sqrt(1 - zeta * zeta)) *
       Math.sin(omega * Math.sqrt(1 - zeta * zeta) * t));
  }
};

// ============================================
// INTERPOLATION FUNCTIONS
// ============================================

/**
 * Linear interpolation (LERP) mellan två värden
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Spherical linear interpolation (SLERP) för vinklar
 * Hanterar vinklar som går förbi 360°/0°
 */
export function slerpAngle(a: number, b: number, t: number): number {
  // Normalisera vinklar till -180 till 180
  let diff = ((b - a + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return a + diff * t;
}

/**
 * Interpolera mellan två JointAngles-objekt
 */
export function blendPoses(
  from: JointAngles,
  to: JointAngles,
  t: number,
  easing: EasingType = 'easeInOut'
): JointAngles {
  // Applicera easing
  const easedT = easingFunctions[easing](t);

  const result: JointAngles = {};

  // Hämta alla unika nycklar
  const allKeys = new Set([
    ...Object.keys(from),
    ...Object.keys(to)
  ]) as Set<keyof JointAngles>;

  for (const key of allKeys) {
    const fromValue = from[key];
    const toValue = to[key];

    if (fromValue !== undefined && toValue !== undefined) {
      // Båda har värden - interpolera
      if (key.includes('Rotate') || key.includes('Lateral')) {
        // Använd SLERP för rotationer
        result[key] = slerpAngle(fromValue, toValue, easedT);
      } else {
        // Använd LERP för andra vinklar
        result[key] = lerp(fromValue, toValue, easedT);
      }
    } else if (toValue !== undefined) {
      // Endast to har värde - blenda från 0
      result[key] = lerp(0, toValue, easedT);
    } else if (fromValue !== undefined) {
      // Endast from har värde - blenda mot 0
      result[key] = lerp(fromValue, 0, easedT);
    }
  }

  return result;
}

// ============================================
// ANIMATION CONTROLLER
// ============================================

/**
 * Huvudklass för animation och blending
 */
export class AnimationController {
  private state: AnimationState;
  private blendFrom: JointAngles | null = null;
  private blendToClip: AnimationClip | null = null;
  private blendConfig: BlendConfig | null = null;
  private blendStartTime: number = 0;
  private onPoseUpdate: ((pose: JointAngles) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    this.state = {
      currentClip: null,
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1.0,
      blendProgress: 1, // Börjar utan blending
      previousPose: null
    };
  }

  /**
   * Sätt callback för pose-uppdateringar
   */
  setOnPoseUpdate(callback: (pose: JointAngles) => void): void {
    this.onPoseUpdate = callback;
  }

  /**
   * Spela en animation från start
   */
  play(clip: AnimationClip): void {
    this.state.currentClip = clip;
    this.state.currentTime = 0;
    this.state.isPlaying = true;
    this.state.blendProgress = 1;
    this.blendFrom = null;

    this.startAnimationLoop();
  }

  /**
   * Blanda över till en ny animation
   */
  blendTo(clip: AnimationClip, config: BlendConfig = { duration: 500, easing: 'easeInOut' }): void {
    // Spara nuvarande pose som utgångspunkt
    this.blendFrom = this.getCurrentPose();
    this.blendToClip = clip;
    this.blendConfig = config;
    this.blendStartTime = performance.now() + (config.delay || 0);
    this.state.blendProgress = 0;
    this.state.isPlaying = true;

    this.startAnimationLoop();
  }

  /**
   * Pausa animationen
   */
  pause(): void {
    this.state.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Återuppta animationen
   */
  resume(): void {
    if (!this.state.isPlaying) {
      this.state.isPlaying = true;
      this.startAnimationLoop();
    }
  }

  /**
   * Stoppa och återställ
   */
  stop(): void {
    this.pause();
    this.state.currentTime = 0;
    this.state.blendProgress = 1;
  }

  /**
   * Sätt uppspelningshastighet
   */
  setPlaybackSpeed(speed: number): void {
    this.state.playbackSpeed = Math.max(0.1, Math.min(3.0, speed));
  }

  /**
   * Hämta nuvarande pose
   */
  getCurrentPose(): JointAngles {
    const { currentClip, currentTime, blendProgress } = this.state;

    // Om vi blendar mellan animationer
    if (blendProgress < 1 && this.blendFrom && this.blendToClip && this.blendConfig) {
      const targetPose = this.getPoseAtTime(this.blendToClip, currentTime);
      return blendPoses(this.blendFrom, targetPose, blendProgress, this.blendConfig.easing);
    }

    // Normal uppspelning
    if (currentClip) {
      return this.getPoseAtTime(currentClip, currentTime);
    }

    // Ingen animation - returnera neutral pose
    return this.getNeutralPose();
  }

  /**
   * Hämta pose vid specifik tidpunkt i ett klipp
   */
  private getPoseAtTime(clip: AnimationClip, time: number): JointAngles {
    const { keyframes, duration, loop, loopType } = clip;

    if (keyframes.length === 0) {
      return this.getNeutralPose();
    }

    // Hantera looping
    let normalizedTime = time;
    if (loop && time > duration) {
      if (loopType === 'pingpong') {
        const cycles = Math.floor(time / duration);
        normalizedTime = time % duration;
        if (cycles % 2 === 1) {
          normalizedTime = duration - normalizedTime;
        }
      } else {
        normalizedTime = time % duration;
      }
    }

    // Konvertera till 0-1
    const t = Math.min(1, normalizedTime / duration);

    // Hitta omgivande keyframes
    let prevFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (keyframes[i].time <= t && keyframes[i + 1].time >= t) {
        prevFrame = keyframes[i];
        nextFrame = keyframes[i + 1];
        break;
      }
    }

    // Interpolera mellan keyframes
    const frameT = prevFrame.time === nextFrame.time
      ? 0
      : (t - prevFrame.time) / (nextFrame.time - prevFrame.time);

    const easing = nextFrame.easing || 'easeInOut';
    return blendPoses(prevFrame.pose, nextFrame.pose, frameT, easing);
  }

  /**
   * Neutral pose (stående position)
   */
  private getNeutralPose(): JointAngles {
    return {
      leftShoulderFlex: 0,
      leftShoulderAbduct: 10,
      rightShoulderFlex: 0,
      rightShoulderAbduct: 10,
      leftElbowFlex: 10,
      rightElbowFlex: 10,
      leftHipFlex: 0,
      rightHipFlex: 0,
      leftKneeFlex: 5,
      rightKneeFlex: 5,
      spineFlex: 0,
      neckFlex: 0
    };
  }

  /**
   * Animationsloop
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      return; // Redan igång
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!this.state.isPlaying) {
        this.animationFrameId = null;
        return;
      }

      const deltaTime = (currentTime - lastTime) * this.state.playbackSpeed;
      lastTime = currentTime;

      // Uppdatera blend progress
      if (this.state.blendProgress < 1 && this.blendConfig) {
        const elapsed = currentTime - this.blendStartTime;
        if (elapsed >= 0) {
          this.state.blendProgress = Math.min(1, elapsed / this.blendConfig.duration);

          // När blending är klar, byt till ny animation
          if (this.state.blendProgress >= 1 && this.blendToClip) {
            this.state.currentClip = this.blendToClip;
            this.state.currentTime = 0;
            this.blendFrom = null;
            this.blendToClip = null;
            this.blendConfig = null;
          }
        }
      }

      // Uppdatera animation time
      this.state.currentTime += deltaTime;

      // Hantera loop slutförande
      if (this.state.currentClip && !this.state.currentClip.loop) {
        if (this.state.currentTime >= this.state.currentClip.duration) {
          this.state.isPlaying = false;
        }
      }

      // Notifiera lyssnare
      if (this.onPoseUpdate) {
        this.onPoseUpdate(this.getCurrentPose());
      }

      if (this.state.isPlaying) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Destruktor
   */
  destroy(): void {
    this.pause();
    this.onPoseUpdate = null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Skapa en enkel animation med start- och slutpose
 */
export function createSimpleAnimation(
  name: string,
  startPose: JointAngles,
  endPose: JointAngles,
  duration: number = 1000,
  loop: boolean = false
): AnimationClip {
  return {
    name,
    duration,
    loop,
    loopType: loop ? 'pingpong' : undefined,
    keyframes: [
      { time: 0, pose: startPose, easing: 'easeOut' },
      { time: 1, pose: endPose, easing: 'easeIn' }
    ]
  };
}

/**
 * Skapa animation med flera keyframes
 */
export function createMultiKeyframeAnimation(
  name: string,
  keyframes: Array<{ time: number; pose: JointAngles; easing?: EasingType }>,
  duration: number = 2000,
  loop: boolean = true
): AnimationClip {
  return {
    name,
    duration,
    loop,
    loopType: loop ? 'restart' : undefined,
    keyframes
  };
}

/**
 * Skapa smooth "andningsanimation" för idle state
 */
export function createIdleBreathingAnimation(): AnimationClip {
  return {
    name: 'idle_breathing',
    duration: 4000,
    loop: true,
    loopType: 'pingpong',
    keyframes: [
      {
        time: 0,
        pose: {
          spineFlex: 0,
          leftShoulderAbduct: 10,
          rightShoulderAbduct: 10
        },
        easing: 'easeInOut'
      },
      {
        time: 0.5,
        pose: {
          spineFlex: -2,
          leftShoulderAbduct: 12,
          rightShoulderAbduct: 12
        },
        easing: 'easeInOut'
      },
      {
        time: 1,
        pose: {
          spineFlex: 0,
          leftShoulderAbduct: 10,
          rightShoulderAbduct: 10
        },
        easing: 'easeInOut'
      }
    ]
  };
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let controllerInstance: AnimationController | null = null;

export function getAnimationController(): AnimationController {
  if (!controllerInstance) {
    controllerInstance = new AnimationController();
  }
  return controllerInstance;
}

export function destroyAnimationController(): void {
  if (controllerInstance) {
    controllerInstance.destroy();
    controllerInstance = null;
  }
}
