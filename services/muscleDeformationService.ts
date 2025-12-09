/**
 * muscleDeformationService - Sprint 5.2: Muscle Deformation System
 *
 * Provides:
 * - Calculate muscle states based on joint rotations
 * - Smooth transitions between muscle states
 * - Apply deformations to mesh geometry
 * - Support for major muscle groups
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface MuscleState {
  // Upper body
  bicepBulge: { left: number; right: number };        // 0-1 based on elbow flexion
  tricepContraction: { left: number; right: number }; // 0-1 based on elbow extension
  deltoidFlexion: { left: number; right: number };    // 0-1 based on shoulder abduction
  pectoralContraction: number;                         // 0-1 based on arm adduction

  // Core
  coreEngagement: number;                              // 0-1 based on trunk stability
  rectusAbdominis: number;                             // 0-1 based on flexion
  obliques: { left: number; right: number };          // 0-1 based on rotation

  // Lower body
  quadContraction: { left: number; right: number };   // 0-1 based on knee extension
  hamstringContraction: { left: number; right: number }; // 0-1 based on knee flexion
  glutealSqueeze: { left: number; right: number };    // 0-1 based on hip extension
  calfContraction: { left: number; right: number };   // 0-1 based on ankle plantarflexion
}

export interface JointAngles {
  // Elbow (0° = straight, 150° = fully flexed)
  leftElbow: number;
  rightElbow: number;

  // Shoulder (0° = at side, 180° = overhead)
  leftShoulder: { flexion: number; abduction: number; rotation: number };
  rightShoulder: { flexion: number; abduction: number; rotation: number };

  // Hip (0° = standing, negative = extension, positive = flexion)
  leftHip: { flexion: number; abduction: number; rotation: number };
  rightHip: { flexion: number; abduction: number; rotation: number };

  // Knee (0° = straight, 150° = fully flexed)
  leftKnee: number;
  rightKnee: number;

  // Ankle (0° = neutral, positive = plantarflexion, negative = dorsiflexion)
  leftAnkle: number;
  rightAnkle: number;

  // Spine
  trunkFlexion: number;    // Forward bend
  trunkRotation: number;   // Twist
  trunkLateralFlexion: number; // Side bend
}

export interface MuscleDeformationConfig {
  maxBulgeScale: number;        // Max scale increase for bulging (e.g., 1.3 = 30% increase)
  minContractionScale: number;  // Min scale for contraction (e.g., 0.85)
  smoothingFactor: number;      // Interpolation speed (0-1)
  activationThreshold: number;  // Min angle change to trigger muscle activation
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_MUSCLE_CONFIG: MuscleDeformationConfig = {
  maxBulgeScale: 1.25,
  minContractionScale: 0.9,
  smoothingFactor: 0.15,
  activationThreshold: 5, // degrees
};

// ============================================================================
// MUSCLE STATE CALCULATION
// ============================================================================

/**
 * Calculate muscle activation states from joint angles
 */
export function calculateMuscleState(angles: JointAngles): MuscleState {
  return {
    // Upper body
    bicepBulge: {
      left: calculateBicepActivation(angles.leftElbow),
      right: calculateBicepActivation(angles.rightElbow),
    },
    tricepContraction: {
      left: calculateTricepActivation(angles.leftElbow),
      right: calculateTricepActivation(angles.rightElbow),
    },
    deltoidFlexion: {
      left: calculateDeltoidActivation(angles.leftShoulder),
      right: calculateDeltoidActivation(angles.rightShoulder),
    },
    pectoralContraction: calculatePectoralActivation(
      angles.leftShoulder,
      angles.rightShoulder
    ),

    // Core
    coreEngagement: calculateCoreEngagement(angles),
    rectusAbdominis: calculateRectusActivation(angles.trunkFlexion),
    obliques: {
      left: calculateObliqueActivation(angles.trunkRotation, angles.trunkLateralFlexion, 'left'),
      right: calculateObliqueActivation(angles.trunkRotation, angles.trunkLateralFlexion, 'right'),
    },

    // Lower body
    quadContraction: {
      left: calculateQuadActivation(angles.leftKnee, angles.leftHip.flexion),
      right: calculateQuadActivation(angles.rightKnee, angles.rightHip.flexion),
    },
    hamstringContraction: {
      left: calculateHamstringActivation(angles.leftKnee, angles.leftHip.flexion),
      right: calculateHamstringActivation(angles.rightKnee, angles.rightHip.flexion),
    },
    glutealSqueeze: {
      left: calculateGlutealActivation(angles.leftHip),
      right: calculateGlutealActivation(angles.rightHip),
    },
    calfContraction: {
      left: calculateCalfActivation(angles.leftAnkle),
      right: calculateCalfActivation(angles.rightAnkle),
    },
  };
}

// ============================================================================
// INDIVIDUAL MUSCLE CALCULATORS
// ============================================================================

/**
 * Bicep activation based on elbow flexion
 * Peak activation at ~90-120° flexion
 */
function calculateBicepActivation(elbowAngle: number): number {
  // Normalize: 0° = 0 activation, peak at 100°, decreases at max flexion
  if (elbowAngle < 20) return 0;
  if (elbowAngle < 100) return (elbowAngle - 20) / 80;
  if (elbowAngle < 130) return 1;
  return 1 - (elbowAngle - 130) / 30;
}

/**
 * Tricep activation based on elbow extension
 * Active when resisting flexion or extending
 */
function calculateTricepActivation(elbowAngle: number): number {
  // Tricep works more at straighter angles
  if (elbowAngle > 160) return 0.8;
  if (elbowAngle > 90) return 0.3 + (160 - elbowAngle) / 140;
  return 0.3;
}

/**
 * Deltoid activation based on shoulder position
 */
function calculateDeltoidActivation(shoulder: {
  flexion: number;
  abduction: number;
  rotation: number;
}): number {
  const flexionContrib = Math.min(shoulder.flexion / 90, 1) * 0.5;
  const abductionContrib = Math.min(shoulder.abduction / 90, 1) * 0.5;
  return Math.min(flexionContrib + abductionContrib, 1);
}

/**
 * Pectoral activation - pulling arms together or pushing
 */
function calculatePectoralActivation(
  leftShoulder: { flexion: number; abduction: number; rotation: number },
  rightShoulder: { flexion: number; abduction: number; rotation: number }
): number {
  // Active during horizontal adduction and internal rotation
  const leftContrib = Math.max(0, (90 - leftShoulder.abduction) / 90) * 0.5;
  const rightContrib = Math.max(0, (90 - rightShoulder.abduction) / 90) * 0.5;
  const flexionBonus = ((leftShoulder.flexion + rightShoulder.flexion) / 2 / 90) * 0.3;
  return Math.min(leftContrib + rightContrib + flexionBonus, 1);
}

/**
 * Core engagement based on overall trunk stability
 */
function calculateCoreEngagement(angles: JointAngles): number {
  // Core works to stabilize during any trunk movement
  const flexionLoad = Math.abs(angles.trunkFlexion) / 45;
  const rotationLoad = Math.abs(angles.trunkRotation) / 45;
  const lateralLoad = Math.abs(angles.trunkLateralFlexion) / 30;

  // Also engaged during unilateral movements
  const hipAsymmetry = Math.abs(angles.leftHip.flexion - angles.rightHip.flexion) / 90;

  return Math.min(
    0.2 + flexionLoad * 0.3 + rotationLoad * 0.2 + lateralLoad * 0.2 + hipAsymmetry * 0.1,
    1
  );
}

/**
 * Rectus abdominis activation during trunk flexion
 */
function calculateRectusActivation(trunkFlexion: number): number {
  if (trunkFlexion <= 0) return 0.1; // Some tonic activity
  return Math.min(0.1 + (trunkFlexion / 60) * 0.9, 1);
}

/**
 * Oblique activation during rotation and lateral flexion
 */
function calculateObliqueActivation(
  rotation: number,
  lateralFlexion: number,
  side: 'left' | 'right'
): number {
  // Left oblique: active during right rotation and left lateral flexion
  // Right oblique: active during left rotation and right lateral flexion
  const rotationContrib =
    side === 'left'
      ? Math.max(0, rotation / 45) * 0.5
      : Math.max(0, -rotation / 45) * 0.5;

  const lateralContrib =
    side === 'left'
      ? Math.max(0, -lateralFlexion / 30) * 0.5
      : Math.max(0, lateralFlexion / 30) * 0.5;

  return Math.min(rotationContrib + lateralContrib, 1);
}

/**
 * Quadriceps activation - knee extension and hip flexion resistance
 */
function calculateQuadActivation(kneeAngle: number, hipFlexion: number): number {
  // Quad works hardest at mid-range knee extension under load
  let kneeContrib = 0;
  if (kneeAngle > 30 && kneeAngle < 100) {
    kneeContrib = 1 - Math.abs(kneeAngle - 65) / 35;
  } else if (kneeAngle >= 100) {
    kneeContrib = 0.5;
  }

  // Hip flexion also engages rectus femoris
  const hipContrib = Math.max(0, hipFlexion / 90) * 0.3;

  return Math.min(kneeContrib * 0.7 + hipContrib, 1);
}

/**
 * Hamstring activation - knee flexion and hip extension
 */
function calculateHamstringActivation(kneeAngle: number, hipFlexion: number): number {
  // Hamstrings work during knee flexion
  const kneeContrib = Math.min(kneeAngle / 120, 1) * 0.5;

  // Also during hip extension (negative hipFlexion)
  const hipContrib = Math.max(0, -hipFlexion / 30) * 0.5;

  return Math.min(kneeContrib + hipContrib, 1);
}

/**
 * Gluteal activation - hip extension and external rotation
 */
function calculateGlutealActivation(hip: {
  flexion: number;
  abduction: number;
  rotation: number;
}): number {
  // Glutes work during hip extension
  const extensionContrib = Math.max(0, -hip.flexion / 30) * 0.4;

  // And abduction
  const abductionContrib = Math.min(hip.abduction / 45, 1) * 0.3;

  // And external rotation
  const rotationContrib = Math.max(0, hip.rotation / 45) * 0.3;

  return Math.min(extensionContrib + abductionContrib + rotationContrib + 0.1, 1);
}

/**
 * Calf (gastrocnemius/soleus) activation during plantarflexion
 */
function calculateCalfActivation(ankleAngle: number): number {
  // Positive angle = plantarflexion
  if (ankleAngle <= 0) return 0.1;
  return Math.min(0.1 + (ankleAngle / 45) * 0.9, 1);
}

// ============================================================================
// SMOOTH INTERPOLATION
// ============================================================================

/**
 * Smoothly interpolate between muscle states
 */
export function interpolateMuscleState(
  current: MuscleState,
  target: MuscleState,
  factor: number
): MuscleState {
  const lerp = (a: number, b: number) => a + (b - a) * factor;

  return {
    bicepBulge: {
      left: lerp(current.bicepBulge.left, target.bicepBulge.left),
      right: lerp(current.bicepBulge.right, target.bicepBulge.right),
    },
    tricepContraction: {
      left: lerp(current.tricepContraction.left, target.tricepContraction.left),
      right: lerp(current.tricepContraction.right, target.tricepContraction.right),
    },
    deltoidFlexion: {
      left: lerp(current.deltoidFlexion.left, target.deltoidFlexion.left),
      right: lerp(current.deltoidFlexion.right, target.deltoidFlexion.right),
    },
    pectoralContraction: lerp(current.pectoralContraction, target.pectoralContraction),
    coreEngagement: lerp(current.coreEngagement, target.coreEngagement),
    rectusAbdominis: lerp(current.rectusAbdominis, target.rectusAbdominis),
    obliques: {
      left: lerp(current.obliques.left, target.obliques.left),
      right: lerp(current.obliques.right, target.obliques.right),
    },
    quadContraction: {
      left: lerp(current.quadContraction.left, target.quadContraction.left),
      right: lerp(current.quadContraction.right, target.quadContraction.right),
    },
    hamstringContraction: {
      left: lerp(current.hamstringContraction.left, target.hamstringContraction.left),
      right: lerp(current.hamstringContraction.right, target.hamstringContraction.right),
    },
    glutealSqueeze: {
      left: lerp(current.glutealSqueeze.left, target.glutealSqueeze.left),
      right: lerp(current.glutealSqueeze.right, target.glutealSqueeze.right),
    },
    calfContraction: {
      left: lerp(current.calfContraction.left, target.calfContraction.left),
      right: lerp(current.calfContraction.right, target.calfContraction.right),
    },
  };
}

// ============================================================================
// MESH DEFORMATION
// ============================================================================

export interface BoneScaleMap {
  leftUpperArm: THREE.Vector3;
  rightUpperArm: THREE.Vector3;
  leftForearm: THREE.Vector3;
  rightForearm: THREE.Vector3;
  leftUpperLeg: THREE.Vector3;
  rightUpperLeg: THREE.Vector3;
  leftLowerLeg: THREE.Vector3;
  rightLowerLeg: THREE.Vector3;
  chest: THREE.Vector3;
  abdomen: THREE.Vector3;
  hips: THREE.Vector3;
}

/**
 * Calculate bone scales based on muscle state
 */
export function calculateBoneScales(
  muscleState: MuscleState,
  config: MuscleDeformationConfig = DEFAULT_MUSCLE_CONFIG
): BoneScaleMap {
  const { maxBulgeScale, minContractionScale } = config;

  const scaleForActivation = (activation: number, isBulge: boolean): number => {
    if (isBulge) {
      return 1 + activation * (maxBulgeScale - 1);
    }
    return 1 - activation * (1 - minContractionScale);
  };

  return {
    // Upper arms - bicep/tricep
    leftUpperArm: new THREE.Vector3(
      scaleForActivation(muscleState.bicepBulge.left, true),
      1,
      scaleForActivation(muscleState.tricepContraction.left, false)
    ),
    rightUpperArm: new THREE.Vector3(
      scaleForActivation(muscleState.bicepBulge.right, true),
      1,
      scaleForActivation(muscleState.tricepContraction.right, false)
    ),

    // Forearms
    leftForearm: new THREE.Vector3(
      1 + muscleState.bicepBulge.left * 0.1,
      1,
      1 + muscleState.bicepBulge.left * 0.1
    ),
    rightForearm: new THREE.Vector3(
      1 + muscleState.bicepBulge.right * 0.1,
      1,
      1 + muscleState.bicepBulge.right * 0.1
    ),

    // Upper legs - quads/hamstrings
    leftUpperLeg: new THREE.Vector3(
      scaleForActivation(muscleState.quadContraction.left, true),
      1,
      scaleForActivation(muscleState.hamstringContraction.left, true)
    ),
    rightUpperLeg: new THREE.Vector3(
      scaleForActivation(muscleState.quadContraction.right, true),
      1,
      scaleForActivation(muscleState.hamstringContraction.right, true)
    ),

    // Lower legs - calves
    leftLowerLeg: new THREE.Vector3(
      1,
      1,
      scaleForActivation(muscleState.calfContraction.left, true)
    ),
    rightLowerLeg: new THREE.Vector3(
      1,
      1,
      scaleForActivation(muscleState.calfContraction.right, true)
    ),

    // Chest - pectorals
    chest: new THREE.Vector3(
      scaleForActivation(muscleState.pectoralContraction, true),
      1,
      1 + muscleState.coreEngagement * 0.05
    ),

    // Abdomen - core
    abdomen: new THREE.Vector3(
      1 - muscleState.rectusAbdominis * 0.05,
      1,
      1 + muscleState.coreEngagement * 0.1
    ),

    // Hips - glutes
    hips: new THREE.Vector3(
      1,
      scaleForActivation((muscleState.glutealSqueeze.left + muscleState.glutealSqueeze.right) / 2, true),
      1
    ),
  };
}

/**
 * Apply bone scales to mesh references
 */
export function applyMuscleDeformation(
  bones: { [key: string]: THREE.Bone | null },
  scales: BoneScaleMap
): void {
  const boneMapping: { [key: string]: keyof BoneScaleMap } = {
    LeftUpperArm: 'leftUpperArm',
    RightUpperArm: 'rightUpperArm',
    LeftForeArm: 'leftForearm',
    RightForeArm: 'rightForearm',
    LeftUpperLeg: 'leftUpperLeg',
    RightUpperLeg: 'rightUpperLeg',
    LeftLowerLeg: 'leftLowerLeg',
    RightLowerLeg: 'rightLowerLeg',
    Chest: 'chest',
    Spine1: 'abdomen',
    Hips: 'hips',
  };

  Object.entries(boneMapping).forEach(([boneName, scaleKey]) => {
    const bone = bones[boneName];
    if (bone) {
      const scale = scales[scaleKey];
      bone.scale.lerp(scale, 0.1); // Smooth application
    }
  });
}

// ============================================================================
// DEFAULT MUSCLE STATE
// ============================================================================

export function getDefaultMuscleState(): MuscleState {
  return {
    bicepBulge: { left: 0, right: 0 },
    tricepContraction: { left: 0.2, right: 0.2 },
    deltoidFlexion: { left: 0.1, right: 0.1 },
    pectoralContraction: 0.1,
    coreEngagement: 0.2,
    rectusAbdominis: 0.1,
    obliques: { left: 0.1, right: 0.1 },
    quadContraction: { left: 0.2, right: 0.2 },
    hamstringContraction: { left: 0.1, right: 0.1 },
    glutealSqueeze: { left: 0.1, right: 0.1 },
    calfContraction: { left: 0.1, right: 0.1 },
  };
}

/**
 * Get default joint angles for standing pose
 */
export function getDefaultJointAngles(): JointAngles {
  return {
    leftElbow: 10,
    rightElbow: 10,
    leftShoulder: { flexion: 0, abduction: 10, rotation: 0 },
    rightShoulder: { flexion: 0, abduction: 10, rotation: 0 },
    leftHip: { flexion: 0, abduction: 5, rotation: 0 },
    rightHip: { flexion: 0, abduction: 5, rotation: 0 },
    leftKnee: 5,
    rightKnee: 5,
    leftAnkle: 0,
    rightAnkle: 0,
    trunkFlexion: 0,
    trunkRotation: 0,
    trunkLateralFlexion: 0,
  };
}

// ============================================================================
// MUSCLE DEFORMATION SERVICE CLASS
// ============================================================================

class MuscleDeformationService {
  private currentState: MuscleState;
  private config: MuscleDeformationConfig;

  constructor(config: Partial<MuscleDeformationConfig> = {}) {
    this.config = { ...DEFAULT_MUSCLE_CONFIG, ...config };
    this.currentState = getDefaultMuscleState();
  }

  /**
   * Update muscle state from joint angles
   */
  update(angles: JointAngles): MuscleState {
    const targetState = calculateMuscleState(angles);
    this.currentState = interpolateMuscleState(
      this.currentState,
      targetState,
      this.config.smoothingFactor
    );
    return this.currentState;
  }

  /**
   * Get current muscle state
   */
  getState(): MuscleState {
    return this.currentState;
  }

  /**
   * Get bone scales for current state
   */
  getBoneScales(): BoneScaleMap {
    return calculateBoneScales(this.currentState, this.config);
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.currentState = getDefaultMuscleState();
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<MuscleDeformationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const muscleDeformationService = new MuscleDeformationService();

export default muscleDeformationService;
