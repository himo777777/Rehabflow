/**
 * Avatar Animation Service for RehabFlow
 * Provides skeletal hierarchy, keyframe animations, and IK for exercise demonstrations
 */

import * as THREE from 'three';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface JointRotation {
  x: number;
  y: number;
  z: number;
}

export interface PoseKeyframe {
  time: number; // 0-1 normalized time
  joints: Record<string, JointRotation>;
  expression?: 'neutral' | 'focused' | 'encouraging' | 'happy';
  rootPosition?: { x: number; y: number; z: number };
}

export interface AnimationPhase {
  name: string;
  startTime: number;
  endTime: number;
  description?: string;
}

export interface ExerciseAnimationData {
  exerciseName: string;
  category: 'mobility' | 'strength' | 'balance' | 'endurance';
  duration: number; // in seconds
  keyframes: PoseKeyframe[];
  phases: AnimationPhase[];
  loop: boolean;
  defaultTempo: number; // beats per minute for the exercise
}

// Joint names in the skeleton hierarchy
export type JointName =
  | 'root'
  | 'hips'
  | 'spine'
  | 'chest'
  | 'neck'
  | 'head'
  | 'leftShoulder'
  | 'leftUpperArm'
  | 'leftLowerArm'
  | 'leftHand'
  | 'rightShoulder'
  | 'rightUpperArm'
  | 'rightLowerArm'
  | 'rightHand'
  | 'leftUpperLeg'
  | 'leftLowerLeg'
  | 'leftFoot'
  | 'rightUpperLeg'
  | 'rightLowerLeg'
  | 'rightFoot';

// Bone hierarchy definition
export interface BoneDefinition {
  name: JointName;
  parent: JointName | null;
  position: THREE.Vector3; // Local position relative to parent
  defaultRotation: THREE.Euler;
  length: number;
}

// ============================================
// SKELETON HIERARCHY
// ============================================

export const SKELETON_HIERARCHY: BoneDefinition[] = [
  // Root and spine
  { name: 'root', parent: null, position: new THREE.Vector3(0, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0 },
  { name: 'hips', parent: 'root', position: new THREE.Vector3(0, 1.0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.2 },
  { name: 'spine', parent: 'hips', position: new THREE.Vector3(0, 0.2, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.25 },
  { name: 'chest', parent: 'spine', position: new THREE.Vector3(0, 0.25, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.25 },
  { name: 'neck', parent: 'chest', position: new THREE.Vector3(0, 0.25, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.1 },
  { name: 'head', parent: 'neck', position: new THREE.Vector3(0, 0.1, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.25 },

  // Left arm
  { name: 'leftShoulder', parent: 'chest', position: new THREE.Vector3(0.2, 0.2, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.1 },
  { name: 'leftUpperArm', parent: 'leftShoulder', position: new THREE.Vector3(0.1, 0, 0), defaultRotation: new THREE.Euler(0, 0, -0.1), length: 0.28 },
  { name: 'leftLowerArm', parent: 'leftUpperArm', position: new THREE.Vector3(0.28, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.25 },
  { name: 'leftHand', parent: 'leftLowerArm', position: new THREE.Vector3(0.25, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.1 },

  // Right arm
  { name: 'rightShoulder', parent: 'chest', position: new THREE.Vector3(-0.2, 0.2, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.1 },
  { name: 'rightUpperArm', parent: 'rightShoulder', position: new THREE.Vector3(-0.1, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0.1), length: 0.28 },
  { name: 'rightLowerArm', parent: 'rightUpperArm', position: new THREE.Vector3(-0.28, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.25 },
  { name: 'rightHand', parent: 'rightLowerArm', position: new THREE.Vector3(-0.25, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.1 },

  // Left leg
  { name: 'leftUpperLeg', parent: 'hips', position: new THREE.Vector3(0.1, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.45 },
  { name: 'leftLowerLeg', parent: 'leftUpperLeg', position: new THREE.Vector3(0, -0.45, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.43 },
  { name: 'leftFoot', parent: 'leftLowerLeg', position: new THREE.Vector3(0, -0.43, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.15 },

  // Right leg
  { name: 'rightUpperLeg', parent: 'hips', position: new THREE.Vector3(-0.1, 0, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.45 },
  { name: 'rightLowerLeg', parent: 'rightUpperLeg', position: new THREE.Vector3(0, -0.45, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.43 },
  { name: 'rightFoot', parent: 'rightLowerLeg', position: new THREE.Vector3(0, -0.43, 0), defaultRotation: new THREE.Euler(0, 0, 0), length: 0.15 },
];

// ============================================
// INTERPOLATION UTILITIES
// ============================================

/**
 * Cubic bezier easing for smooth animation
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Spherical linear interpolation for rotations
 */
export function slerpRotation(
  from: JointRotation,
  to: JointRotation,
  t: number
): JointRotation {
  const easedT = easeInOutCubic(t);
  return {
    x: lerp(from.x, to.x, easedT),
    y: lerp(from.y, to.y, easedT),
    z: lerp(from.z, to.z, easedT),
  };
}

/**
 * Find keyframes surrounding a given time
 */
function findSurroundingKeyframes(
  keyframes: PoseKeyframe[],
  time: number
): { prev: PoseKeyframe; next: PoseKeyframe; localT: number } {
  // Clamp time to valid range
  const clampedTime = Math.max(0, Math.min(1, time));

  // Find surrounding keyframes
  let prevIndex = 0;
  let nextIndex = keyframes.length - 1;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (keyframes[i].time <= clampedTime && keyframes[i + 1].time >= clampedTime) {
      prevIndex = i;
      nextIndex = i + 1;
      break;
    }
  }

  const prev = keyframes[prevIndex];
  const next = keyframes[nextIndex];

  // Calculate local interpolation factor
  const timeRange = next.time - prev.time;
  const localT = timeRange > 0 ? (clampedTime - prev.time) / timeRange : 0;

  return { prev, next, localT };
}

// ============================================
// ANIMATION SERVICE
// ============================================

/**
 * Interpolate pose at a given time
 */
export function interpolatePose(
  animation: ExerciseAnimationData,
  normalizedTime: number
): { joints: Record<string, JointRotation>; expression: string; rootY: number } {
  const { prev, next, localT } = findSurroundingKeyframes(animation.keyframes, normalizedTime);

  // Interpolate joints
  const joints: Record<string, JointRotation> = {};
  const allJointNames = new Set([
    ...Object.keys(prev.joints),
    ...Object.keys(next.joints),
  ]);

  for (const jointName of allJointNames) {
    const prevRot = prev.joints[jointName] || { x: 0, y: 0, z: 0 };
    const nextRot = next.joints[jointName] || { x: 0, y: 0, z: 0 };
    joints[jointName] = slerpRotation(prevRot, nextRot, localT);
  }

  // Interpolate root position
  const prevY = prev.rootPosition?.y || 0;
  const nextY = next.rootPosition?.y || 0;
  const rootY = lerp(prevY, nextY, easeInOutCubic(localT));

  // Use expression from the keyframe we're closest to
  const expression = localT < 0.5 ? (prev.expression || 'neutral') : (next.expression || 'neutral');

  return { joints, expression, rootY };
}

/**
 * Get current animation phase
 */
export function getCurrentPhase(
  animation: ExerciseAnimationData,
  normalizedTime: number
): AnimationPhase | null {
  for (const phase of animation.phases) {
    if (normalizedTime >= phase.startTime && normalizedTime <= phase.endTime) {
      return phase;
    }
  }
  return null;
}

/**
 * Apply joint rotations to Three.js refs
 */
export function applyPoseToRefs(
  joints: Record<string, JointRotation>,
  refs: Record<string, React.RefObject<THREE.Group | THREE.Mesh>>,
  lerpFactor: number = 0.1
): void {
  for (const [jointName, rotation] of Object.entries(joints)) {
    const ref = refs[jointName];
    if (ref?.current) {
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        rotation.x,
        lerpFactor
      );
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        rotation.y,
        lerpFactor
      );
      ref.current.rotation.z = THREE.MathUtils.lerp(
        ref.current.rotation.z,
        rotation.z,
        lerpFactor
      );
    }
  }
}

// ============================================
// SIMPLE IK SOLVER (CCDIK)
// ============================================

interface IKChain {
  joints: JointName[];
  target: THREE.Vector3;
}

/**
 * Simple CCDIK (Cyclic Coordinate Descent Inverse Kinematics) solver
 * Used for reaching targets with arms/legs
 */
export function solveIK(
  chain: IKChain,
  currentRotations: Record<string, JointRotation>,
  iterations: number = 10,
  tolerance: number = 0.01
): Record<string, JointRotation> {
  const result = { ...currentRotations };

  // Simplified IK - just return current rotations for now
  // Full IK implementation would iterate through the chain
  // and adjust rotations to reach the target

  for (let iter = 0; iter < iterations; iter++) {
    // For each joint from end to root
    for (let i = chain.joints.length - 1; i >= 0; i--) {
      const jointName = chain.joints[i];
      // Calculate rotation needed to move end effector toward target
      // This is a simplified version - full implementation would use
      // actual bone positions and proper rotation calculations
    }
  }

  return result;
}

// ============================================
// ANIMATION LOOKUP & MAPPING
// ============================================

/**
 * Get animation type from exercise name (fallback for exercises without specific animations)
 */
export function getAnimationTypeFromName(exerciseName: string): string {
  const name = exerciseName.toLowerCase();

  // Arm exercises
  if (name.includes('arm') || name.includes('axel') || name.includes('skulder') ||
      name.includes('push') || name.includes('press') || name.includes('lyft')) {
    return 'arm_raise';
  }

  // Leg exercises
  if (name.includes('squat') || name.includes('knäböj') || name.includes('knä') ||
      name.includes('ben') || name.includes('lunge') || name.includes('utfall')) {
    return 'squat';
  }

  // Stretch exercises
  if (name.includes('stretch') || name.includes('sträck') || name.includes('böj') ||
      name.includes('rotation') || name.includes('rörlighet')) {
    return 'stretch';
  }

  // Balance exercises
  if (name.includes('balans') || name.includes('stå') || name.includes('enbens')) {
    return 'balance';
  }

  // Core exercises
  if (name.includes('core') || name.includes('bål') || name.includes('mage') ||
      name.includes('planka') || name.includes('rygg')) {
    return 'core';
  }

  return 'idle';
}

/**
 * Convert legacy animation type to new keyframe-based animation
 */
export function getLegacyAnimation(animationType: string): ExerciseAnimationData {
  const baseAnimation: ExerciseAnimationData = {
    exerciseName: animationType,
    category: 'mobility',
    duration: 4,
    loop: true,
    defaultTempo: 30,
    keyframes: [],
    phases: [],
  };

  switch (animationType) {
    case 'arm_raise':
      return {
        ...baseAnimation,
        exerciseName: 'Armlyft',
        category: 'strength',
        keyframes: [
          {
            time: 0,
            joints: {
              leftUpperArm: { x: 0, y: 0, z: 0.1 },
              rightUpperArm: { x: 0, y: 0, z: -0.1 },
              leftLowerArm: { x: 0, y: 0, z: 0 },
              rightLowerArm: { x: 0, y: 0, z: 0 },
            },
            expression: 'neutral',
          },
          {
            time: 0.5,
            joints: {
              leftUpperArm: { x: 0, y: 0, z: -2.2 },
              rightUpperArm: { x: 0, y: 0, z: 2.2 },
              leftLowerArm: { x: 0, y: 0, z: 0 },
              rightLowerArm: { x: 0, y: 0, z: 0 },
            },
            expression: 'focused',
          },
          {
            time: 1,
            joints: {
              leftUpperArm: { x: 0, y: 0, z: 0.1 },
              rightUpperArm: { x: 0, y: 0, z: -0.1 },
              leftLowerArm: { x: 0, y: 0, z: 0 },
              rightLowerArm: { x: 0, y: 0, z: 0 },
            },
            expression: 'neutral',
          },
        ],
        phases: [
          { name: 'CONCENTRIC', startTime: 0, endTime: 0.5, description: 'Lyft armarna' },
          { name: 'ECCENTRIC', startTime: 0.5, endTime: 1, description: 'Sänk armarna' },
        ],
      };

    case 'squat':
      return {
        ...baseAnimation,
        exerciseName: 'Knäböj',
        category: 'strength',
        keyframes: [
          {
            time: 0,
            joints: {
              hips: { x: 0, y: 0, z: 0 },
              leftUpperLeg: { x: 0, y: 0, z: 0 },
              rightUpperLeg: { x: 0, y: 0, z: 0 },
              leftLowerLeg: { x: 0, y: 0, z: 0 },
              rightLowerLeg: { x: 0, y: 0, z: 0 },
              spine: { x: 0, y: 0, z: 0 },
            },
            expression: 'neutral',
            rootPosition: { x: 0, y: 0, z: 0 },
          },
          {
            time: 0.5,
            joints: {
              hips: { x: 0.3, y: 0, z: 0 },
              leftUpperLeg: { x: 1.2, y: 0, z: 0.1 },
              rightUpperLeg: { x: 1.2, y: 0, z: -0.1 },
              leftLowerLeg: { x: -2.0, y: 0, z: 0 },
              rightLowerLeg: { x: -2.0, y: 0, z: 0 },
              spine: { x: -0.2, y: 0, z: 0 },
            },
            expression: 'focused',
            rootPosition: { x: 0, y: -0.4, z: 0 },
          },
          {
            time: 1,
            joints: {
              hips: { x: 0, y: 0, z: 0 },
              leftUpperLeg: { x: 0, y: 0, z: 0 },
              rightUpperLeg: { x: 0, y: 0, z: 0 },
              leftLowerLeg: { x: 0, y: 0, z: 0 },
              rightLowerLeg: { x: 0, y: 0, z: 0 },
              spine: { x: 0, y: 0, z: 0 },
            },
            expression: 'encouraging',
            rootPosition: { x: 0, y: 0, z: 0 },
          },
        ],
        phases: [
          { name: 'ECCENTRIC', startTime: 0, endTime: 0.5, description: 'Gå ner' },
          { name: 'CONCENTRIC', startTime: 0.5, endTime: 1, description: 'Res dig upp' },
        ],
      };

    case 'stretch':
      return {
        ...baseAnimation,
        exerciseName: 'Stretch',
        category: 'mobility',
        keyframes: [
          {
            time: 0,
            joints: {
              spine: { x: 0, y: 0, z: 0 },
              chest: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.1 },
              rightUpperArm: { x: 0, y: 0, z: -0.1 },
            },
            expression: 'neutral',
          },
          {
            time: 0.5,
            joints: {
              spine: { x: 0, y: 0, z: -0.3 },
              chest: { x: 0, y: 0, z: -0.2 },
              leftUpperArm: { x: 0, y: 0, z: -2.5 },
              rightUpperArm: { x: 0, y: 0, z: 0.3 },
            },
            expression: 'focused',
          },
          {
            time: 1,
            joints: {
              spine: { x: 0, y: 0, z: 0 },
              chest: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.1 },
              rightUpperArm: { x: 0, y: 0, z: -0.1 },
            },
            expression: 'neutral',
          },
        ],
        phases: [
          { name: 'STRETCH', startTime: 0, endTime: 0.5, description: 'Sträck ut' },
          { name: 'RELEASE', startTime: 0.5, endTime: 1, description: 'Släpp tillbaka' },
        ],
      };

    case 'balance':
      return {
        ...baseAnimation,
        exerciseName: 'Balans',
        category: 'balance',
        keyframes: [
          {
            time: 0,
            joints: {
              leftUpperLeg: { x: 0, y: 0, z: 0 },
              leftLowerLeg: { x: 0, y: 0, z: 0 },
              rightUpperLeg: { x: 0, y: 0, z: 0 },
              rightLowerLeg: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.5 },
              rightUpperArm: { x: 0, y: 0, z: -0.5 },
            },
            expression: 'neutral',
          },
          {
            time: 0.3,
            joints: {
              leftUpperLeg: { x: 1.2, y: 0, z: 0.1 },
              leftLowerLeg: { x: -0.8, y: 0, z: 0 },
              rightUpperLeg: { x: 0, y: 0, z: 0 },
              rightLowerLeg: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.8 },
              rightUpperArm: { x: 0, y: 0, z: -0.8 },
            },
            expression: 'focused',
          },
          {
            time: 0.7,
            joints: {
              leftUpperLeg: { x: 1.2, y: 0, z: 0.1 },
              leftLowerLeg: { x: -0.8, y: 0, z: 0 },
              rightUpperLeg: { x: 0, y: 0, z: 0 },
              rightLowerLeg: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.8 },
              rightUpperArm: { x: 0, y: 0, z: -0.8 },
            },
            expression: 'focused',
          },
          {
            time: 1,
            joints: {
              leftUpperLeg: { x: 0, y: 0, z: 0 },
              leftLowerLeg: { x: 0, y: 0, z: 0 },
              rightUpperLeg: { x: 0, y: 0, z: 0 },
              rightLowerLeg: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.5 },
              rightUpperArm: { x: 0, y: 0, z: -0.5 },
            },
            expression: 'encouraging',
          },
        ],
        phases: [
          { name: 'LIFT', startTime: 0, endTime: 0.3, description: 'Lyft benet' },
          { name: 'HOLD', startTime: 0.3, endTime: 0.7, description: 'Håll balansen' },
          { name: 'LOWER', startTime: 0.7, endTime: 1, description: 'Sänk ner' },
        ],
      };

    case 'core':
      return {
        ...baseAnimation,
        exerciseName: 'Core',
        category: 'strength',
        keyframes: [
          {
            time: 0,
            joints: {
              spine: { x: 0, y: 0, z: 0 },
              chest: { x: 0, y: 0, z: 0 },
              hips: { x: 0, y: 0, z: 0 },
            },
            expression: 'neutral',
          },
          {
            time: 0.5,
            joints: {
              spine: { x: 0.3, y: 0, z: 0 },
              chest: { x: 0.2, y: 0, z: 0 },
              hips: { x: -0.1, y: 0, z: 0 },
            },
            expression: 'focused',
          },
          {
            time: 1,
            joints: {
              spine: { x: 0, y: 0, z: 0 },
              chest: { x: 0, y: 0, z: 0 },
              hips: { x: 0, y: 0, z: 0 },
            },
            expression: 'encouraging',
          },
        ],
        phases: [
          { name: 'ENGAGE', startTime: 0, endTime: 0.5, description: 'Aktivera core' },
          { name: 'RELEASE', startTime: 0.5, endTime: 1, description: 'Släpp' },
        ],
      };

    case 'idle':
    default:
      return {
        ...baseAnimation,
        exerciseName: 'Idle',
        category: 'mobility',
        keyframes: [
          {
            time: 0,
            joints: {
              spine: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.1 },
              rightUpperArm: { x: 0, y: 0, z: -0.1 },
            },
            expression: 'neutral',
          },
          {
            time: 0.5,
            joints: {
              spine: { x: 0.02, y: 0.02, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.12 },
              rightUpperArm: { x: 0, y: 0, z: -0.12 },
            },
            expression: 'neutral',
          },
          {
            time: 1,
            joints: {
              spine: { x: 0, y: 0, z: 0 },
              leftUpperArm: { x: 0, y: 0, z: 0.1 },
              rightUpperArm: { x: 0, y: 0, z: -0.1 },
            },
            expression: 'neutral',
          },
        ],
        phases: [
          { name: 'BREATHE', startTime: 0, endTime: 1, description: 'Andas naturligt' },
        ],
      };
  }
}

// ============================================
// ANIMATION CONTROLLER
// ============================================

export class AvatarAnimationController {
  private currentAnimation: ExerciseAnimationData | null = null;
  private time: number = 0;
  private isPlaying: boolean = false;
  private speed: number = 1;
  private onPhaseChange?: (phase: AnimationPhase | null) => void;
  private lastPhase: AnimationPhase | null = null;

  constructor() {}

  setAnimation(animation: ExerciseAnimationData): void {
    this.currentAnimation = animation;
    this.time = 0;
    this.lastPhase = null;
  }

  setAnimationByType(animationType: string): void {
    this.setAnimation(getLegacyAnimation(animationType));
  }

  play(): void {
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
  }

  stop(): void {
    this.isPlaying = false;
    this.time = 0;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  // Alias for setSpeed (tempo = speed multiplier)
  setTempo(tempo: number): void {
    this.speed = tempo;
  }

  setOnPhaseChange(callback: (phase: AnimationPhase | null) => void): void {
    this.onPhaseChange = callback;
  }

  /**
   * Update animation and return current pose
   */
  update(deltaTime: number): { joints: Record<string, JointRotation>; expression: string; rootY: number } | null {
    if (!this.currentAnimation) {
      return null;
    }

    if (this.isPlaying) {
      // Update time
      const duration = this.currentAnimation.duration;
      this.time += (deltaTime * this.speed) / duration;

      // Loop or clamp
      if (this.currentAnimation.loop) {
        this.time = this.time % 1;
      } else {
        this.time = Math.min(this.time, 1);
        if (this.time >= 1) {
          this.isPlaying = false;
        }
      }
    }

    // Check for phase change
    const currentPhase = getCurrentPhase(this.currentAnimation, this.time);
    if (currentPhase !== this.lastPhase && this.onPhaseChange) {
      this.onPhaseChange(currentPhase);
      this.lastPhase = currentPhase;
    }

    return interpolatePose(this.currentAnimation, this.time);
  }

  getTime(): number {
    return this.time;
  }

  setTime(time: number): void {
    this.time = Math.max(0, Math.min(1, time));
  }

  isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentPhase(): AnimationPhase | null {
    if (!this.currentAnimation) return null;
    return getCurrentPhase(this.currentAnimation, this.time);
  }
}

// Export a singleton instance for convenience
export const avatarAnimationController = new AvatarAnimationController();
