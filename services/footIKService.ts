/**
 * Foot IK Service - Sprint 5.4
 *
 * Provides inverse kinematics calculations for realistic foot placement.
 * Ensures feet maintain ground contact during animations.
 *
 * Features:
 * - Ground plane detection
 * - Foot target calculation based on body position
 * - Ankle rotation for proper foot orientation
 * - Weight distribution integration
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface FootTarget {
  /** Target position for the ankle joint */
  position: THREE.Vector3;
  /** Target rotation for proper foot orientation */
  rotation: THREE.Quaternion;
  /** Whether foot should be grounded */
  isGrounded: boolean;
  /** Weight on this foot (0-1) */
  weight: number;
}

export interface FootIKState {
  left: FootTarget;
  right: FootTarget;
}

export interface LegChain {
  hip: THREE.Object3D;
  knee: THREE.Object3D;
  ankle: THREE.Object3D;
}

export interface FootIKConfig {
  /** Ground plane Y position */
  groundLevel: number;
  /** Maximum leg extension length */
  maxLegLength: number;
  /** Minimum bend angle at knee (radians) */
  minKneeBend: number;
  /** How much foot lifts during swing phase */
  swingHeight: number;
  /** IK solver iterations */
  iterations: number;
  /** Lerp factor for smooth transitions */
  lerpFactor: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_FOOT_IK_CONFIG: FootIKConfig = {
  groundLevel: 0,
  maxLegLength: 0.9,     // Total leg length (thigh + shin)
  minKneeBend: 0.1,      // Minimum ~6 degrees
  swingHeight: 0.1,      // 10cm lift during swing
  iterations: 10,
  lerpFactor: 0.15,
};

// ============================================================================
// SEGMENT LENGTHS (based on SkeletalAvatar proportions)
// ============================================================================

const SEGMENT_LENGTHS = {
  thigh: 0.45,    // Upper leg length
  shin: 0.42,     // Lower leg length
  foot: 0.12,     // Foot height
};

// ============================================================================
// FOOT IK SERVICE
// ============================================================================

class FootIKService {
  private config: FootIKConfig;
  private currentState: FootIKState;
  private targetState: FootIKState;

  constructor(config: Partial<FootIKConfig> = {}) {
    this.config = { ...DEFAULT_FOOT_IK_CONFIG, ...config };

    // Initialize states
    const defaultTarget: FootTarget = {
      position: new THREE.Vector3(0, this.config.groundLevel, 0),
      rotation: new THREE.Quaternion(),
      isGrounded: true,
      weight: 0.5,
    };

    this.currentState = {
      left: { ...defaultTarget, position: new THREE.Vector3(-0.15, this.config.groundLevel, 0) },
      right: { ...defaultTarget, position: new THREE.Vector3(0.15, this.config.groundLevel, 0) },
    };

    this.targetState = {
      left: { ...defaultTarget, position: new THREE.Vector3(-0.15, this.config.groundLevel, 0) },
      right: { ...defaultTarget, position: new THREE.Vector3(0.15, this.config.groundLevel, 0) },
    };
  }

  // --------------------------------------------------------------------------
  // GROUND CONTACT CALCULATION
  // --------------------------------------------------------------------------

  /**
   * Calculate where the foot should be placed based on hip position
   * and current animation phase
   */
  calculateGroundContact(
    hipPosition: THREE.Vector3,
    side: 'left' | 'right',
    animationPhase?: string,
    rootY?: number
  ): FootTarget {
    const offset = side === 'left' ? -0.15 : 0.15;
    const groundLevel = this.config.groundLevel;

    // Base foot position - directly below hip
    const basePosition = new THREE.Vector3(
      hipPosition.x + offset,
      groundLevel,
      hipPosition.z
    );

    // Check if animation requires lifted foot
    const isSwingPhase = this.isSwingPhase(animationPhase, side);

    // Adjust position based on phase
    let targetY = groundLevel;
    if (isSwingPhase) {
      targetY = groundLevel + this.config.swingHeight;
    }

    // Adjust for root Y position (squats, lunges, etc.)
    if (rootY !== undefined && rootY < 0) {
      // During downward movement, keep feet grounded
      targetY = groundLevel;
    }

    const position = new THREE.Vector3(basePosition.x, targetY, basePosition.z);

    // Calculate foot rotation to stay flat on ground
    const rotation = new THREE.Quaternion();
    if (!isSwingPhase) {
      // Foot flat on ground
      rotation.setFromEuler(new THREE.Euler(0, 0, 0));
    } else {
      // Slight dorsiflexion during swing
      rotation.setFromEuler(new THREE.Euler(-0.2, 0, 0));
    }

    return {
      position,
      rotation,
      isGrounded: !isSwingPhase,
      weight: isSwingPhase ? 0 : 0.5,
    };
  }

  /**
   * Check if the foot should be in swing phase (lifted)
   */
  private isSwingPhase(animationPhase: string | undefined, side: 'left' | 'right'): boolean {
    if (!animationPhase) return false;

    const phaseLower = animationPhase.toLowerCase();

    // Walking/stepping patterns
    if (phaseLower.includes('step') || phaseLower.includes('walk')) {
      // Alternate feet based on phase
      if (phaseLower.includes('left') && side === 'left') return true;
      if (phaseLower.includes('right') && side === 'right') return true;
    }

    // Lunge patterns
    if (phaseLower.includes('lunge')) {
      // Back foot may lift slightly
      if (phaseLower.includes('forward')) {
        return side === 'right'; // Right foot lifts slightly
      }
    }

    return false;
  }

  // --------------------------------------------------------------------------
  // IK SOLVING (FABRIK-inspired)
  // --------------------------------------------------------------------------

  /**
   * Solve IK for a leg chain to reach the target position
   * Uses a simplified two-bone IK solver
   */
  solveLegIK(
    hipWorldPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    side: 'left' | 'right'
  ): { kneeAngle: number; hipAngle: THREE.Euler } {
    const thighLength = SEGMENT_LENGTHS.thigh;
    const shinLength = SEGMENT_LENGTHS.shin;
    const totalLength = thighLength + shinLength;

    // Vector from hip to target
    const hipToTarget = targetPos.clone().sub(hipWorldPos);
    const distance = hipToTarget.length();

    // Clamp distance to prevent impossible IK solutions
    const clampedDistance = THREE.MathUtils.clamp(
      distance,
      Math.abs(thighLength - shinLength) + 0.01,
      totalLength - 0.01
    );

    // Calculate knee angle using law of cosines
    // c² = a² + b² - 2ab*cos(C)
    // cos(C) = (a² + b² - c²) / (2ab)
    const cosKneeAngle = (
      thighLength * thighLength +
      shinLength * shinLength -
      clampedDistance * clampedDistance
    ) / (2 * thighLength * shinLength);

    const kneeAngle = Math.PI - Math.acos(
      THREE.MathUtils.clamp(cosKneeAngle, -1, 1)
    );

    // Calculate hip angle
    // First, get the angle from hip to target in the sagittal plane
    const hipAngleX = -Math.atan2(hipToTarget.z, -hipToTarget.y);

    // Apply the offset for the thigh angle
    const cosHipOffset = (
      thighLength * thighLength +
      clampedDistance * clampedDistance -
      shinLength * shinLength
    ) / (2 * thighLength * clampedDistance);

    const hipOffset = Math.acos(THREE.MathUtils.clamp(cosHipOffset, -1, 1));

    // Final hip angle
    const finalHipAngle = hipAngleX - hipOffset;

    // Lateral hip angle (for stance width)
    const lateralAngle = Math.atan2(hipToTarget.x, -hipToTarget.y);
    const hipAngleZ = side === 'left' ? -lateralAngle : lateralAngle;

    return {
      kneeAngle: Math.max(kneeAngle, this.config.minKneeBend),
      hipAngle: new THREE.Euler(finalHipAngle, 0, hipAngleZ * 0.3),
    };
  }

  // --------------------------------------------------------------------------
  // STATE UPDATES
  // --------------------------------------------------------------------------

  /**
   * Update foot IK targets based on current pose
   */
  updateTargets(
    leftHipWorld: THREE.Vector3,
    rightHipWorld: THREE.Vector3,
    animationPhase?: string,
    rootY?: number
  ): FootIKState {
    this.targetState.left = this.calculateGroundContact(
      leftHipWorld,
      'left',
      animationPhase,
      rootY
    );
    this.targetState.right = this.calculateGroundContact(
      rightHipWorld,
      'right',
      animationPhase,
      rootY
    );

    return this.targetState;
  }

  /**
   * Interpolate current state toward target state
   */
  interpolate(delta: number): FootIKState {
    const lerp = Math.min(this.config.lerpFactor * delta * 60, 1);

    // Interpolate positions
    this.currentState.left.position.lerp(this.targetState.left.position, lerp);
    this.currentState.right.position.lerp(this.targetState.right.position, lerp);

    // Slerp rotations
    this.currentState.left.rotation.slerp(this.targetState.left.rotation, lerp);
    this.currentState.right.rotation.slerp(this.targetState.right.rotation, lerp);

    // Update weights
    this.currentState.left.weight = THREE.MathUtils.lerp(
      this.currentState.left.weight,
      this.targetState.left.weight,
      lerp
    );
    this.currentState.right.weight = THREE.MathUtils.lerp(
      this.currentState.right.weight,
      this.targetState.right.weight,
      lerp
    );

    // Update grounded state
    this.currentState.left.isGrounded = this.targetState.left.isGrounded;
    this.currentState.right.isGrounded = this.targetState.right.isGrounded;

    return this.currentState;
  }

  /**
   * Get current foot IK state
   */
  getState(): FootIKState {
    return this.currentState;
  }

  /**
   * Get foot targets for IK solving
   */
  getTargets(): FootIKState {
    return this.targetState;
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FootIKConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): FootIKConfig {
    return { ...this.config };
  }

  /**
   * Reset to default state
   */
  reset(): void {
    const groundLevel = this.config.groundLevel;

    this.currentState.left.position.set(-0.15, groundLevel, 0);
    this.currentState.right.position.set(0.15, groundLevel, 0);
    this.currentState.left.rotation.identity();
    this.currentState.right.rotation.identity();
    this.currentState.left.isGrounded = true;
    this.currentState.right.isGrounded = true;
    this.currentState.left.weight = 0.5;
    this.currentState.right.weight = 0.5;

    this.targetState.left = { ...this.currentState.left };
    this.targetState.right = { ...this.currentState.right };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const footIKService = new FootIKService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useRef, useCallback, useEffect } from 'react';

/**
 * React hook for foot IK integration
 *
 * @example
 * ```tsx
 * const { updateFootIK, getIKAngles } = useFootIK(enableFootIK);
 *
 * useFrame((state, delta) => {
 *   if (enableFootIK) {
 *     const leftHipWorld = new THREE.Vector3();
 *     leftHipRef.current?.getWorldPosition(leftHipWorld);
 *     // ... similar for right hip
 *
 *     const angles = updateFootIK(leftHipWorld, rightHipWorld, delta, phase, rootY);
 *     // Apply angles to knee and hip refs
 *   }
 * });
 * ```
 */
export function useFootIK(enabled: boolean = true, config?: Partial<FootIKConfig>) {
  const serviceRef = useRef<FootIKService | null>(null);

  // Initialize service
  useEffect(() => {
    if (enabled && !serviceRef.current) {
      serviceRef.current = new FootIKService(config);
    }
    return () => {
      if (serviceRef.current) {
        serviceRef.current.reset();
      }
    };
  }, [enabled, config]);

  // Update config if it changes
  useEffect(() => {
    if (serviceRef.current && config) {
      serviceRef.current.updateConfig(config);
    }
  }, [config]);

  /**
   * Update foot IK and get joint angles
   */
  const updateFootIK = useCallback((
    leftHipWorld: THREE.Vector3,
    rightHipWorld: THREE.Vector3,
    delta: number,
    animationPhase?: string,
    rootY?: number
  ) => {
    if (!serviceRef.current || !enabled) return null;

    // Update targets
    serviceRef.current.updateTargets(leftHipWorld, rightHipWorld, animationPhase, rootY);

    // Interpolate toward targets
    const state = serviceRef.current.interpolate(delta);

    // Calculate IK angles for both legs
    const leftAngles = serviceRef.current.solveLegIK(
      leftHipWorld,
      state.left.position,
      'left'
    );
    const rightAngles = serviceRef.current.solveLegIK(
      rightHipWorld,
      state.right.position,
      'right'
    );

    return {
      left: leftAngles,
      right: rightAngles,
      state,
    };
  }, [enabled]);

  /**
   * Get current IK state
   */
  const getState = useCallback(() => {
    return serviceRef.current?.getState() || null;
  }, []);

  /**
   * Reset IK to default
   */
  const reset = useCallback(() => {
    serviceRef.current?.reset();
  }, []);

  return {
    updateFootIK,
    getState,
    reset,
  };
}

export default footIKService;
