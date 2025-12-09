/**
 * balanceService - Sprint 5.2: Weight Transfer & Balance System
 *
 * Provides:
 * - Center of mass (COM) calculation
 * - Weight distribution between feet
 * - Balance compensation for poses
 * - Stability metrics
 * - Subtle body sway for natural standing
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface SegmentPosition {
  head: THREE.Vector3;
  trunk: THREE.Vector3;
  leftUpperArm: THREE.Vector3;
  rightUpperArm: THREE.Vector3;
  leftForearm: THREE.Vector3;
  rightForearm: THREE.Vector3;
  leftHand: THREE.Vector3;
  rightHand: THREE.Vector3;
  leftUpperLeg: THREE.Vector3;
  rightUpperLeg: THREE.Vector3;
  leftLowerLeg: THREE.Vector3;
  rightLowerLeg: THREE.Vector3;
  leftFoot: THREE.Vector3;
  rightFoot: THREE.Vector3;
}

export interface FootPositions {
  left: THREE.Vector3;
  right: THREE.Vector3;
  leftNormal: THREE.Vector3;  // Ground contact normal
  rightNormal: THREE.Vector3;
}

export interface WeightDistribution {
  centerOfMass: THREE.Vector3;
  footPressure: { left: number; right: number };  // 0-1 normalized
  stancePhase: 'left' | 'right' | 'double' | 'flight';
  stabilityIndex: number;  // 0-1, 1 = perfectly stable
  baseOfSupport: {
    center: THREE.Vector3;
    width: number;
    depth: number;
  };
}

export interface BalanceCompensation {
  hipShift: THREE.Vector3;      // Lateral/forward shift
  trunkLean: THREE.Euler;       // Compensatory lean
  armPosition: {
    left: THREE.Vector3;
    right: THREE.Vector3;
  };
}

export interface SwayState {
  offset: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
}

export interface BalanceConfig {
  swayAmplitude: number;        // Max sway distance (meters)
  swayFrequency: number;        // Sway cycles per second
  compensationStrength: number; // 0-1, how much to compensate
  stabilityThreshold: number;   // Min stability to be "balanced"
}

// ============================================================================
// SEGMENT MASS PERCENTAGES (Winter, 2009)
// ============================================================================

export const SEGMENT_MASS: Record<keyof SegmentPosition, number> = {
  head: 0.081,            // 8.1%
  trunk: 0.497,           // 49.7%
  leftUpperArm: 0.028,    // 2.8%
  rightUpperArm: 0.028,
  leftForearm: 0.016,     // 1.6%
  rightForearm: 0.016,
  leftHand: 0.006,        // 0.6%
  rightHand: 0.006,
  leftUpperLeg: 0.100,    // 10.0%
  rightUpperLeg: 0.100,
  leftLowerLeg: 0.047,    // 4.7%
  rightLowerLeg: 0.047,
  leftFoot: 0.014,        // 1.4%
  rightFoot: 0.014,
};

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_BALANCE_CONFIG: BalanceConfig = {
  swayAmplitude: 0.01,        // 1cm
  swayFrequency: 0.2,         // Very slow
  compensationStrength: 0.7,
  stabilityThreshold: 0.8,
};

// ============================================================================
// CENTER OF MASS CALCULATION
// ============================================================================

/**
 * Calculate whole-body center of mass from segment positions
 */
export function calculateCenterOfMass(positions: SegmentPosition): THREE.Vector3 {
  const com = new THREE.Vector3();
  let totalMass = 0;

  (Object.keys(positions) as Array<keyof SegmentPosition>).forEach((segment) => {
    const mass = SEGMENT_MASS[segment];
    const pos = positions[segment];
    com.add(pos.clone().multiplyScalar(mass));
    totalMass += mass;
  });

  return com.divideScalar(totalMass);
}

/**
 * Calculate COM velocity from two consecutive COM positions
 */
export function calculateCOMVelocity(
  previousCOM: THREE.Vector3,
  currentCOM: THREE.Vector3,
  deltaTime: number
): THREE.Vector3 {
  return currentCOM.clone().sub(previousCOM).divideScalar(deltaTime);
}

// ============================================================================
// WEIGHT DISTRIBUTION
// ============================================================================

/**
 * Calculate weight distribution based on COM position relative to feet
 */
export function calculateWeightDistribution(
  com: THREE.Vector3,
  feet: FootPositions
): WeightDistribution {
  const feetCenter = feet.left.clone().add(feet.right).multiplyScalar(0.5);
  const feetWidth = feet.left.distanceTo(feet.right);

  // Project COM onto ground plane
  const comProjected = new THREE.Vector3(com.x, 0, com.z);
  const leftFootGround = new THREE.Vector3(feet.left.x, 0, feet.left.z);
  const rightFootGround = new THREE.Vector3(feet.right.x, 0, feet.right.z);

  // Calculate foot pressures based on COM position
  const toLeft = leftFootGround.clone().sub(comProjected);
  const toRight = rightFootGround.clone().sub(comProjected);
  const feetLine = rightFootGround.clone().sub(leftFootGround);

  // Project COM onto line between feet
  const t = toLeft.negate().dot(feetLine) / feetLine.lengthSq();
  const tClamped = Math.max(0, Math.min(1, t));

  // Pressure is inverse of distance
  const leftPressure = 1 - tClamped;
  const rightPressure = tClamped;

  // Determine stance phase
  let stancePhase: WeightDistribution['stancePhase'] = 'double';
  if (leftPressure > 0.9) stancePhase = 'left';
  else if (rightPressure > 0.9) stancePhase = 'right';
  else if (com.y > 0.1 && leftPressure < 0.1 && rightPressure < 0.1) stancePhase = 'flight';

  // Calculate stability index
  const comToCenter = comProjected.distanceTo(feetCenter);
  const maxStableDistance = feetWidth / 2;
  const stabilityIndex = Math.max(0, 1 - comToCenter / maxStableDistance);

  // Calculate base of support
  const baseOfSupport = {
    center: feetCenter,
    width: feetWidth,
    depth: 0.3, // Approximate foot length
  };

  return {
    centerOfMass: com,
    footPressure: { left: leftPressure, right: rightPressure },
    stancePhase,
    stabilityIndex,
    baseOfSupport,
  };
}

// ============================================================================
// BALANCE COMPENSATION
// ============================================================================

/**
 * Calculate compensatory adjustments to maintain balance
 */
export function calculateBalanceCompensation(
  weight: WeightDistribution,
  config: BalanceConfig = DEFAULT_BALANCE_CONFIG
): BalanceCompensation {
  const { centerOfMass, baseOfSupport, stabilityIndex } = weight;

  // Calculate how far COM needs to move to be centered
  const comProjected = new THREE.Vector3(centerOfMass.x, 0, centerOfMass.z);
  const deviation = comProjected.sub(baseOfSupport.center);

  // Hip shift to counteract deviation
  const hipShift = deviation.clone().multiplyScalar(-config.compensationStrength);

  // Trunk lean in opposite direction of deviation
  const leanAmount = Math.min(deviation.length() * 2, 0.15); // Max 15 degrees
  const leanDirection = Math.atan2(deviation.x, deviation.z);
  const trunkLean = new THREE.Euler(
    -leanAmount * Math.cos(leanDirection) * config.compensationStrength,
    0,
    leanAmount * Math.sin(leanDirection) * config.compensationStrength,
    'XYZ'
  );

  // Arm positions for balance (arms out more when less stable)
  const armSpread = (1 - stabilityIndex) * 0.5 * config.compensationStrength;
  const armPosition = {
    left: new THREE.Vector3(-armSpread, 0, 0),
    right: new THREE.Vector3(armSpread, 0, 0),
  };

  return {
    hipShift,
    trunkLean,
    armPosition,
  };
}

// ============================================================================
// NATURAL SWAY
// ============================================================================

/**
 * Generate natural standing sway
 */
export function calculateNaturalSway(
  time: number,
  config: BalanceConfig = DEFAULT_BALANCE_CONFIG
): SwayState {
  const { swayAmplitude, swayFrequency } = config;

  // Use multiple sine waves for natural-looking sway
  const primaryPhase = time * swayFrequency * Math.PI * 2;
  const secondaryPhase = time * swayFrequency * 0.7 * Math.PI * 2;
  const tertiaryPhase = time * swayFrequency * 0.3 * Math.PI * 2;

  // Combine waves for organic movement
  const x =
    Math.sin(primaryPhase) * swayAmplitude * 0.5 +
    Math.sin(secondaryPhase + 0.5) * swayAmplitude * 0.3 +
    Math.sin(tertiaryPhase + 1.2) * swayAmplitude * 0.2;

  const z =
    Math.cos(primaryPhase * 0.8) * swayAmplitude * 0.4 +
    Math.cos(secondaryPhase * 0.6 + 0.8) * swayAmplitude * 0.2;

  const offset = new THREE.Vector3(x, 0, z);

  // Calculate velocity for smooth transitions
  const velocityX =
    Math.cos(primaryPhase) * swayAmplitude * swayFrequency * Math.PI * 2 * 0.5;
  const velocityZ =
    -Math.sin(primaryPhase * 0.8) * swayAmplitude * swayFrequency * Math.PI * 2 * 0.8 * 0.4;

  const velocity = new THREE.Vector3(velocityX, 0, velocityZ);

  return {
    offset,
    velocity,
    phase: primaryPhase % (Math.PI * 2),
  };
}

// ============================================================================
// POSE ADJUSTMENT
// ============================================================================

/**
 * Apply balance compensation to a pose
 */
export function applyBalanceCompensation(
  rootPosition: THREE.Vector3,
  rootRotation: THREE.Euler,
  compensation: BalanceCompensation
): { position: THREE.Vector3; rotation: THREE.Euler } {
  const newPosition = rootPosition.clone().add(compensation.hipShift);

  // Combine rotations
  const rotQuat = new THREE.Quaternion().setFromEuler(rootRotation);
  const compQuat = new THREE.Quaternion().setFromEuler(compensation.trunkLean);
  rotQuat.multiply(compQuat);
  const newRotation = new THREE.Euler().setFromQuaternion(rotQuat);

  return {
    position: newPosition,
    rotation: newRotation,
  };
}

// ============================================================================
// GROUND CONTACT
// ============================================================================

export interface GroundContact {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  isGrounded: boolean;
  penetrationDepth: number;
}

/**
 * Calculate ground contact for a foot
 */
export function calculateGroundContact(
  footPosition: THREE.Vector3,
  groundHeight: number = 0
): GroundContact {
  const penetrationDepth = groundHeight - footPosition.y;
  const isGrounded = penetrationDepth >= -0.02; // Small tolerance

  return {
    position: new THREE.Vector3(footPosition.x, Math.max(footPosition.y, groundHeight), footPosition.z),
    normal: new THREE.Vector3(0, 1, 0),
    isGrounded,
    penetrationDepth: Math.max(0, penetrationDepth),
  };
}

/**
 * Calculate IK target for foot placement
 */
export function calculateFootIKTarget(
  hipPosition: THREE.Vector3,
  currentFootPosition: THREE.Vector3,
  groundHeight: number = 0,
  stepHeight: number = 0.05
): THREE.Vector3 {
  // Keep foot on ground or slightly above during swing
  const groundedY = groundHeight;
  const swingY = groundHeight + stepHeight;

  // Determine if foot is swinging (not supporting weight)
  const distanceFromGround = currentFootPosition.y - groundHeight;
  const isSwinging = distanceFromGround > 0.03;

  return new THREE.Vector3(
    currentFootPosition.x,
    isSwinging ? swingY : groundedY,
    currentFootPosition.z
  );
}

// ============================================================================
// BALANCE SERVICE CLASS
// ============================================================================

class BalanceService {
  private config: BalanceConfig;
  private previousCOM: THREE.Vector3 | null = null;
  private currentWeight: WeightDistribution | null = null;
  private swayTime: number = 0;

  constructor(config: Partial<BalanceConfig> = {}) {
    this.config = { ...DEFAULT_BALANCE_CONFIG, ...config };
  }

  /**
   * Update balance state from segment positions
   */
  update(positions: SegmentPosition, feet: FootPositions, deltaTime: number): {
    weight: WeightDistribution;
    compensation: BalanceCompensation;
    sway: SwayState;
    comVelocity: THREE.Vector3;
  } {
    const com = calculateCenterOfMass(positions);
    const weight = calculateWeightDistribution(com, feet);
    const compensation = calculateBalanceCompensation(weight, this.config);

    this.swayTime += deltaTime;
    const sway = calculateNaturalSway(this.swayTime, this.config);

    // Calculate COM velocity
    let comVelocity = new THREE.Vector3();
    if (this.previousCOM) {
      comVelocity = calculateCOMVelocity(this.previousCOM, com, deltaTime);
    }
    this.previousCOM = com.clone();
    this.currentWeight = weight;

    return { weight, compensation, sway, comVelocity };
  }

  /**
   * Get current weight distribution
   */
  getWeight(): WeightDistribution | null {
    return this.currentWeight;
  }

  /**
   * Check if currently balanced
   */
  isBalanced(): boolean {
    return this.currentWeight
      ? this.currentWeight.stabilityIndex >= this.config.stabilityThreshold
      : true;
  }

  /**
   * Get foot targets for IK
   */
  getFootIKTargets(
    hipPosition: THREE.Vector3,
    leftFoot: THREE.Vector3,
    rightFoot: THREE.Vector3,
    groundHeight: number = 0
  ): { left: THREE.Vector3; right: THREE.Vector3 } {
    return {
      left: calculateFootIKTarget(hipPosition, leftFoot, groundHeight),
      right: calculateFootIKTarget(hipPosition, rightFoot, groundHeight),
    };
  }

  /**
   * Reset state
   */
  reset(): void {
    this.previousCOM = null;
    this.currentWeight = null;
    this.swayTime = 0;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<BalanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get config
   */
  getConfig(): BalanceConfig {
    return { ...this.config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const balanceService = new BalanceService();

export default balanceService;
