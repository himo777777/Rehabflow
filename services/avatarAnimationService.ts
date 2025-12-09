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
 * Spherical linear interpolation for rotations using quaternions
 *
 * FAS 8 förbättring: Äkta SLERP för naturligare rotationsövergångar
 * SLERP följer kortaste vägen på en sfär, vilket ger jämnare animationer
 * än linjär interpolation på Euler-vinklar (som kan ge "gimbal lock")
 */
export function slerpRotation(
  from: JointRotation,
  to: JointRotation,
  t: number,
  useQuaternionSlerp: boolean = true
): JointRotation {
  const easedT = easeInOutCubic(t);

  if (useQuaternionSlerp) {
    // Konvertera Euler-vinklar till quaternions
    const fromEuler = new THREE.Euler(from.x, from.y, from.z);
    const toEuler = new THREE.Euler(to.x, to.y, to.z);

    const fromQuat = new THREE.Quaternion().setFromEuler(fromEuler);
    const toQuat = new THREE.Quaternion().setFromEuler(toEuler);

    // Utför SLERP mellan quaternions
    const resultQuat = fromQuat.clone().slerp(toQuat, easedT);

    // Konvertera tillbaka till Euler-vinklar
    const resultEuler = new THREE.Euler().setFromQuaternion(resultQuat);

    return {
      x: resultEuler.x,
      y: resultEuler.y,
      z: resultEuler.z,
    };
  }

  // Fallback till linjär interpolation om quaternion SLERP är avstängt
  return {
    x: lerp(from.x, to.x, easedT),
    y: lerp(from.y, to.y, easedT),
    z: lerp(from.z, to.z, easedT),
  };
}

/**
 * Interpolera mellan två Three.js Quaternions med easing
 */
export function slerpQuaternion(
  from: THREE.Quaternion,
  to: THREE.Quaternion,
  t: number,
  useEasing: boolean = true
): THREE.Quaternion {
  const factor = useEasing ? easeInOutCubic(t) : t;
  return from.clone().slerp(to, factor);
}

/**
 * Interpolera mellan två Three.js Euler-rotationer med SLERP
 */
export function slerpEuler(
  from: THREE.Euler,
  to: THREE.Euler,
  t: number,
  useEasing: boolean = true
): THREE.Euler {
  const factor = useEasing ? easeInOutCubic(t) : t;

  const fromQuat = new THREE.Quaternion().setFromEuler(from);
  const toQuat = new THREE.Quaternion().setFromEuler(to);

  const resultQuat = fromQuat.slerp(toQuat, factor);
  return new THREE.Euler().setFromQuaternion(resultQuat);
}

/**
 * Linjär interpolation för Vector3 (positioner)
 */
export function lerpVector3(
  from: THREE.Vector3,
  to: THREE.Vector3,
  t: number,
  useEasing: boolean = true
): THREE.Vector3 {
  const factor = useEasing ? easeInOutCubic(t) : t;
  return from.clone().lerp(to, factor);
}

// ============================================
// SECONDARY MOTION SYSTEM
// Sprint 4: Naturligare rörelser med follow-through
// ============================================

/**
 * Configuration for secondary motion effects
 */
export interface SecondaryMotionConfig {
  overshoot: number;        // 0.05-0.15 för naturligt överskott
  settleTime: number;       // ms för att "landa" i position
  dampingFactor: number;    // 0.1-0.3 för mjuk inbromsning
  enabled: boolean;         // Toggle för secondary motion
}

/**
 * Default secondary motion configuration
 */
export const DEFAULT_SECONDARY_MOTION: SecondaryMotionConfig = {
  overshoot: 0.08,
  settleTime: 200,
  dampingFactor: 0.2,
  enabled: true,
};

/**
 * State tracking for secondary motion velocity
 */
interface JointVelocityState {
  previousRotation: JointRotation;
  velocity: JointRotation;
  timestamp: number;
}

// Global velocity state for all joints
const jointVelocityStates = new Map<string, JointVelocityState>();

/**
 * Easing with overshoot - skapar naturlig "bounce" vid slutet av rörelsen
 * Baserad på fysikalisk fjäder-dämpning
 */
export function easeOutWithOvershoot(t: number, overshoot: number = 0.08): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  // Använd en modifierad easing som går förbi 1.0 och sedan settlar
  const overshootAmount = 1 + overshoot;
  const decay = Math.exp(-5 * t); // Exponentiell dämpning

  // Bas-easing + overshoot-term
  const base = 1 - Math.pow(1 - t, 3);
  const bounce = overshoot * Math.sin(t * Math.PI * 2) * decay;

  return Math.min(overshootAmount, base + bounce);
}

/**
 * Elastic easing för mer dramatisk follow-through
 */
export function easeOutElastic(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

/**
 * Beräkna rotationshastighet mellan två keyframes
 */
export function calculateRotationVelocity(
  current: JointRotation,
  previous: JointRotation,
  deltaTime: number
): JointRotation {
  if (deltaTime <= 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: (current.x - previous.x) / deltaTime,
    y: (current.y - previous.y) / deltaTime,
    z: (current.z - previous.z) / deltaTime,
  };
}

/**
 * Tillämpa sekundär rörelse med velocity-baserad follow-through
 * Skapar mer naturliga rörelser genom att lägga till tröghet
 */
export function applySecondaryMotion(
  jointName: string,
  targetRotation: JointRotation,
  deltaTime: number,
  config: SecondaryMotionConfig = DEFAULT_SECONDARY_MOTION
): JointRotation {
  if (!config.enabled) {
    return targetRotation;
  }

  const now = performance.now();
  let state = jointVelocityStates.get(jointName);

  if (!state) {
    // Initiera state för denna led
    state = {
      previousRotation: { ...targetRotation },
      velocity: { x: 0, y: 0, z: 0 },
      timestamp: now,
    };
    jointVelocityStates.set(jointName, state);
    return targetRotation;
  }

  // Beräkna tid sedan senaste uppdatering
  const dt = Math.min(deltaTime, 0.1); // Begränsa till 100ms för stabilitet

  // Beräkna nuvarande hastighet
  const currentVelocity = calculateRotationVelocity(
    targetRotation,
    state.previousRotation,
    dt
  );

  // Mjuk övergång av hastighet (smooth velocity)
  const velocitySmoothing = config.dampingFactor;
  state.velocity = {
    x: lerp(state.velocity.x, currentVelocity.x, velocitySmoothing),
    y: lerp(state.velocity.y, currentVelocity.y, velocitySmoothing),
    z: lerp(state.velocity.z, currentVelocity.z, velocitySmoothing),
  };

  // Lägg till tröghet baserat på hastighet (follow-through effekt)
  const inertiaScale = config.overshoot * dt * 60; // Skala för ~60fps
  const resultRotation: JointRotation = {
    x: targetRotation.x + state.velocity.x * inertiaScale,
    y: targetRotation.y + state.velocity.y * inertiaScale,
    z: targetRotation.z + state.velocity.z * inertiaScale,
  };

  // Uppdatera state
  state.previousRotation = { ...targetRotation };
  state.timestamp = now;

  return resultRotation;
}

/**
 * Tillämpa sekundär rörelse på alla joints i en pose
 */
export function applySecondaryMotionToPose(
  joints: Record<string, JointRotation>,
  deltaTime: number,
  config: SecondaryMotionConfig = DEFAULT_SECONDARY_MOTION
): Record<string, JointRotation> {
  if (!config.enabled) {
    return joints;
  }

  const result: Record<string, JointRotation> = {};

  for (const [jointName, rotation] of Object.entries(joints)) {
    result[jointName] = applySecondaryMotion(jointName, rotation, deltaTime, config);
  }

  return result;
}

/**
 * Rensa velocity state (anropa vid animationsbyte)
 */
export function resetSecondaryMotionState(): void {
  jointVelocityStates.clear();
}

/**
 * Avancerad SLERP med sekundär rörelse
 */
export function slerpRotationWithSecondary(
  from: JointRotation,
  to: JointRotation,
  t: number,
  jointName: string,
  deltaTime: number,
  config: SecondaryMotionConfig = DEFAULT_SECONDARY_MOTION
): JointRotation {
  // Använd overshoot-easing nära slutet av interpolationen
  const useOvershoot = t > 0.7 && config.enabled;
  const easedT = useOvershoot
    ? easeOutWithOvershoot(t, config.overshoot)
    : easeInOutCubic(t);

  // Standard SLERP
  const fromEuler = new THREE.Euler(from.x, from.y, from.z);
  const toEuler = new THREE.Euler(to.x, to.y, to.z);

  const fromQuat = new THREE.Quaternion().setFromEuler(fromEuler);
  const toQuat = new THREE.Quaternion().setFromEuler(toEuler);

  const resultQuat = fromQuat.clone().slerp(toQuat, easedT);
  const resultEuler = new THREE.Euler().setFromQuaternion(resultQuat);

  const baseRotation: JointRotation = {
    x: resultEuler.x,
    y: resultEuler.y,
    z: resultEuler.z,
  };

  // Tillämpa sekundär rörelse
  return applySecondaryMotion(jointName, baseRotation, deltaTime, config);
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
// FABRIK IK SOLVER
// FAS 8 förbättring: Riktig IK-implementation
// ============================================

interface IKChain {
  joints: JointName[];
  target: THREE.Vector3;
}

/**
 * FABRIK bone representation
 */
interface FABRIKBone {
  name: JointName;
  position: THREE.Vector3;
  length: number;
}

/**
 * FABRIK (Forward And Backward Reaching Inverse Kinematics) Solver
 *
 * FAS 8 förbättring: Ersätter stub med riktig implementation
 *
 * FABRIK är effektivare och mer stabil än CCDIK för de flesta användningsfall.
 * Algoritmen:
 * 1. Forward reaching: Flytta end-effector till target, sedan propagera bakåt
 * 2. Backward reaching: Flytta root tillbaka till ursprung, propagera framåt
 * 3. Upprepa tills konvergens eller max iterationer
 */
export class FABRIKSolver {
  private bones: FABRIKBone[] = [];
  private tolerance: number;
  private maxIterations: number;
  private rootPosition: THREE.Vector3;
  private totalLength: number = 0;

  constructor(tolerance: number = 0.01, maxIterations: number = 10) {
    this.tolerance = tolerance;
    this.maxIterations = maxIterations;
    this.rootPosition = new THREE.Vector3();
  }

  /**
   * Initiera kedjan med ben-positioner och längder
   */
  initChain(jointNames: JointName[], boneData: BoneDefinition[]): void {
    this.bones = [];
    this.totalLength = 0;

    let currentPos = new THREE.Vector3(0, 0, 0);

    for (const jointName of jointNames) {
      const boneDef = boneData.find(b => b.name === jointName);
      if (boneDef) {
        currentPos = currentPos.clone().add(boneDef.position);
        this.bones.push({
          name: jointName,
          position: currentPos.clone(),
          length: boneDef.length,
        });
        this.totalLength += boneDef.length;
      }
    }

    if (this.bones.length > 0) {
      this.rootPosition = this.bones[0].position.clone();
    }
  }

  /**
   * Kontrollera om target är nåbart
   */
  isReachable(target: THREE.Vector3): boolean {
    const distance = this.rootPosition.distanceTo(target);
    return distance <= this.totalLength;
  }

  /**
   * Lös IK för att nå target
   */
  solve(target: THREE.Vector3): THREE.Vector3[] {
    if (this.bones.length === 0) {
      return [];
    }

    // Om target är för långt bort, sträck kedjan mot target
    if (!this.isReachable(target)) {
      return this.stretchTowardTarget(target);
    }

    // FABRIK iteration
    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Kontrollera konvergens
      const endEffector = this.bones[this.bones.length - 1].position;
      if (endEffector.distanceTo(target) < this.tolerance) {
        break;
      }

      // Forward reaching (end to root)
      this.forwardReach(target);

      // Backward reaching (root to end)
      this.backwardReach();
    }

    return this.bones.map(bone => bone.position.clone());
  }

  /**
   * Forward reaching: Börja från end-effector och jobba mot root
   */
  private forwardReach(target: THREE.Vector3): void {
    // Sätt end-effector på target
    this.bones[this.bones.length - 1].position.copy(target);

    // Propagera bakåt genom kedjan
    for (let i = this.bones.length - 2; i >= 0; i--) {
      const current = this.bones[i];
      const child = this.bones[i + 1];

      // Beräkna riktning från child till current
      const direction = current.position.clone().sub(child.position).normalize();

      // Placera current på rätt avstånd från child
      current.position.copy(child.position.clone().add(direction.multiplyScalar(child.length)));
    }
  }

  /**
   * Backward reaching: Börja från root och jobba mot end-effector
   */
  private backwardReach(): void {
    // Sätt root tillbaka till ursprungsposition
    this.bones[0].position.copy(this.rootPosition);

    // Propagera framåt genom kedjan
    for (let i = 0; i < this.bones.length - 1; i++) {
      const current = this.bones[i];
      const child = this.bones[i + 1];

      // Beräkna riktning från current till child
      const direction = child.position.clone().sub(current.position).normalize();

      // Placera child på rätt avstånd från current
      child.position.copy(current.position.clone().add(direction.multiplyScalar(child.length)));
    }
  }

  /**
   * Sträck kedjan mot ett onåbart target
   */
  private stretchTowardTarget(target: THREE.Vector3): THREE.Vector3[] {
    const direction = target.clone().sub(this.rootPosition).normalize();

    let currentPos = this.rootPosition.clone();
    const result: THREE.Vector3[] = [currentPos.clone()];

    for (let i = 1; i < this.bones.length; i++) {
      currentPos = currentPos.clone().add(direction.clone().multiplyScalar(this.bones[i].length));
      this.bones[i].position.copy(currentPos);
      result.push(currentPos.clone());
    }

    return result;
  }

  /**
   * Konvertera positioner till joint rotations
   */
  positionsToRotations(positions: THREE.Vector3[]): Record<string, JointRotation> {
    const rotations: Record<string, JointRotation> = {};

    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      const direction = next.clone().sub(current).normalize();

      // Beräkna rotation för att peka mot nästa ben
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
      const euler = new THREE.Euler().setFromQuaternion(quaternion);

      rotations[this.bones[i].name] = {
        x: euler.x,
        y: euler.y,
        z: euler.z,
      };
    }

    return rotations;
  }

  /**
   * Hämta nuvarande ben-positioner
   */
  getBonePositions(): THREE.Vector3[] {
    return this.bones.map(bone => bone.position.clone());
  }
}

/**
 * Legacy CCDIK-compatible wrapper
 * Behålls för bakåtkompatibilitet
 */
export function solveIK(
  chain: IKChain,
  currentRotations: Record<string, JointRotation>,
  iterations: number = 10,
  tolerance: number = 0.01
): Record<string, JointRotation> {
  const solver = new FABRIKSolver(tolerance, iterations);
  solver.initChain(chain.joints, SKELETON_HIERARCHY);

  const positions = solver.solve(chain.target);

  if (positions.length === 0) {
    return currentRotations;
  }

  const newRotations = solver.positionsToRotations(positions);

  // Blanda nya rotationer med befintliga
  const result: Record<string, JointRotation> = { ...currentRotations };
  for (const [joint, rotation] of Object.entries(newRotations)) {
    result[joint] = rotation;
  }

  return result;
}

/**
 * Predefinerade IK-kedjor för vanliga användningsfall
 */
export const IK_CHAINS = {
  leftArm: ['leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'] as JointName[],
  rightArm: ['rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'] as JointName[],
  leftLeg: ['leftUpperLeg', 'leftLowerLeg', 'leftFoot'] as JointName[],
  rightLeg: ['rightUpperLeg', 'rightLowerLeg', 'rightFoot'] as JointName[],
  spine: ['hips', 'spine', 'chest', 'neck', 'head'] as JointName[],
};

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
