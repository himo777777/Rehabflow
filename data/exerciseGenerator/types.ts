/**
 * Exercise Generator Types
 *
 * Types for systematically generating 10,000+ unique exercises
 * with comprehensive safety data and evidence base.
 */

// ============================================
// TYPE DEFINITIONS (String Literal Unions for flexibility)
// ============================================

export type BodyRegion =
  | 'neck' | 'shoulder' | 'elbow' | 'wrist_hand' | 'thoracic'
  | 'lumbar' | 'hip' | 'knee' | 'ankle' | 'core';

export type MuscleGroup =
  // Neck
  | 'deep_neck_flexors' | 'neck_extensors' | 'scalenes' | 'sternocleidomastoid'
  | 'levator_scapulae' | 'upper_trapezius'
  // Shoulder
  | 'rotator_cuff' | 'supraspinatus' | 'infraspinatus' | 'subscapularis'
  | 'teres_minor' | 'deltoid' | 'pectoralis_major' | 'pectoralis_minor'
  | 'latissimus_dorsi' | 'serratus_anterior' | 'rhomboids'
  | 'middle_trapezius' | 'lower_trapezius'
  // Arm
  | 'biceps' | 'triceps' | 'wrist_flexors' | 'wrist_extensors'
  // Core
  | 'rectus_abdominis' | 'transverse_abdominis' | 'obliques'
  | 'erector_spinae' | 'multifidus' | 'quadratus_lumborum' | 'diaphragm'
  // Hip
  | 'gluteus_maximus' | 'gluteus_medius' | 'gluteus_minimus'
  | 'tensor_fasciae_latae' | 'iliopsoas' | 'adductors' | 'piriformis'
  | 'deep_hip_rotators'
  // Thigh
  | 'quadriceps' | 'rectus_femoris' | 'hamstrings'
  // Lower Leg
  | 'gastrocnemius' | 'soleus' | 'tibialis_anterior' | 'tibialis_posterior'
  | 'peroneals' | 'foot_intrinsics' | 'toe_flexors'
  // Allow any string for extensibility
  | string;

export type JointType =
  | 'spine' | 'cervical' | 'thoracic' | 'lumbar' | 'shoulder'
  | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'foot' | 'nerve'
  | string;

export type ExerciseType =
  | 'stretch' | 'stretch_static' | 'stretch_dynamic' | 'stretch_pnf'
  | 'isometric' | 'strength_isometric' | 'concentric' | 'strength_concentric'
  | 'eccentric' | 'strength_eccentric' | 'mobility' | 'mobility_arom'
  | 'balance' | 'balance_static' | 'balance_dynamic' | 'motor_control'
  | 'neural_glide' | 'neural_gliding' | 'breathing' | 'proprioception'
  | string;

export type Position =
  | 'standing' | 'sitting' | 'supine' | 'prone' | 'side_lying'
  | 'sidelying_left' | 'sidelying_right' | 'quadruped' | 'kneeling'
  | 'half_kneeling' | 'tall_kneeling' | 'wall_supported' | 'bridging'
  | string;

export type Equipment =
  | 'none' | 'resistance_band' | 'resistance_band_light' | 'resistance_band_medium'
  | 'resistance_band_heavy' | 'dumbbell' | 'dumbbell_light' | 'dumbbell_medium'
  | 'weight' | 'ankle_weight' | 'ankle_weights' | 'stability_ball' | 'swiss_ball'
  | 'foam_roller' | 'balance_pad' | 'bosu' | 'bosu_ball' | 'balance_board'
  | 'wall' | 'chair' | 'step' | 'step_box' | 'bench' | 'mat' | 'towel'
  | 'strap' | 'stick_dowel' | 'pad' | 'cable_machine' | 'partner' | 'anchor'
  | 'box' | 'biofeedback' | 'trx_suspension' | 'pull_up_bar'
  | string;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite' | string;

// Supports both legacy ('left', 'right') and new format ('unilateral_left', 'unilateral_right')
export type Laterality = 'bilateral' | 'unilateral_left' | 'unilateral_right' | 'alternating' | 'left' | 'right';

// ============================================
// SAFETY INTERFACES
// ============================================

// Support both legacy string format and structured format for backward compatibility
export interface PostOpRestriction {
  phase: 1 | 2 | 3 | 4;
  weeksPostOp: { min: number; max: number } | string;  // Legacy format: '0-2', new format: { min: 0, max: 2 }
  allowed?: boolean;  // Optional for legacy format
  modifications?: string[] | string;  // Legacy format: string, new format: string[]
  maxLoad?: 'none' | 'bodyweight' | 'light' | 'moderate' | 'full';
  maxROM?: number;
}

// Support both legacy array format and structured format
export interface ProgressionCriteria {
  minPainFreeReps: number;
  minConsecutiveDays: number;
  maxPainDuring: number;
  maxPainAfter: number;
  formScore?: number;
  prerequisiteExercises?: string[];
}

// Alias for legacy array format
export type ProgressionCriteriaLegacy = string[];

export interface RegressionTriggers {
  painIncrease: number;
  swellingPresent: boolean;
  formBreakdown: boolean;
  compensationPatterns?: string[];
}

// Alias for legacy array format
export type RegressionTriggersLegacy = string[];

// Senior-specific safety data for fall risk exercises
export interface SeniorSpecificSafety {
  fallRiskLevel: 'low' | 'moderate' | 'high' | 'none';
  cognitiveRequirement: 'low' | 'moderate' | 'high' | 'none';
  visionRequirement?: 'low' | 'moderate' | 'high' | 'none';
  hearingRequirement?: 'low' | 'moderate' | 'high' | 'none';
  supervisionLevel: 'independent' | 'independent_after_training' | 'supervised' | 'close_supervision' | 'initial_supervision' | 'group_supervised' | 'therapist_required' | 'therapist_recommended';
}

// SafetyData supports both legacy (simpler) and new (structured) formats
export interface SafetyData {
  contraindications: string[];
  precautions: string[];
  redFlags: string[];
  maxPainDuring?: number;  // Optional for legacy format
  maxPainAfter24h?: number;  // Optional for legacy format
  healingTissue?: string;  // Optional for legacy format
  targetStructure?: string;  // Optional for legacy format
  postOpRestrictions: PostOpRestriction[];
  appropriateForSurgeries?: string[];  // Optional for legacy format
  progressionCriteria?: ProgressionCriteria | ProgressionCriteriaLegacy;  // Supports both formats
  regressionTriggers?: RegressionTriggers | RegressionTriggersLegacy;  // Supports both formats
  seniorSpecific?: SeniorSpecificSafety;  // For senior/fall risk exercises
}

export interface EvidenceBase {
  level: 'A' | 'B' | 'C' | 'D';
  source: string;
  studyType: string;
}

// ============================================
// BASE EXERCISE TEMPLATE
// ============================================

export interface BaseExerciseTemplate {
  id: string;
  baseName?: string;
  baseNameSv?: string;
  baseNameEn?: string; // Legacy support
  description?: string;
  descriptionSv?: string;

  bodyRegion: BodyRegion;
  muscleGroups?: MuscleGroup[];
  primaryMuscles?: MuscleGroup[]; // Legacy support
  secondaryMuscles?: MuscleGroup[]; // Legacy support
  jointType?: JointType;
  joints?: JointType[]; // Legacy support
  exerciseType: ExerciseType;
  movementPlane?: string; // Legacy support

  // Allowed variations
  basePosition?: Position;
  allowedPositions: Position[];
  baseEquipment?: Equipment;
  allowedEquipment: Equipment[];
  baseDifficulty?: Difficulty;
  allowedDifficulties: Difficulty[];
  laterality?: Laterality;
  allowedLateralities: Laterality[];

  // Base prescription - flexible format
  baseReps?: { min: number; max: number } | number | string;
  baseSets?: { min: number; max: number } | number | string;
  baseHoldSeconds?: number;
  baseRestSeconds?: number;
  baseFrequency?: string; // Legacy support

  // Instructions
  instructions?: string[];
  instructionsSv?: string[];
  techniquePoints?: string[];
  stepTemplates?: Array<{
    title: string;
    instructionTemplate: string;
    type: string;
  }>; // Legacy support

  // Safety data - can be inline or structured
  safetyData?: SafetyData;
  // Legacy inline safety fields
  baseContraindications?: string[];
  basePrecautions?: string[];
  baseRedFlags?: string[];
  appropriateConditions?: string[];
  contraindicatedConditions?: string[];
  appropriateSurgeries?: string[];
  contraindicatedSurgeries?: string[];

  // Evidence
  evidenceBase?: EvidenceBase;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D'; // Legacy support
  sourceIds?: string[]; // Legacy support
}

// ============================================
// MODIFIERS
// ============================================

export interface PositionModifier {
  position: Position;
  nameSuffix: string;
  nameSuffixSv: string;
  repMultiplier: number;
  difficultyOffset: number;
  instructionAddition: string;
}

export interface EquipmentModifier {
  equipment: Equipment;
  nameSuffix: string;
  nameSuffixSv: string;
  resistanceLevel: 'none' | 'light' | 'moderate' | 'heavy';
  difficultyOffset: number;
  instructionAddition: string;
}

export interface DifficultyModifier {
  difficulty: Difficulty;
  nameSuffix: string;
  nameSuffixSv: string;
  repMultiplier: number;
  setMultiplier: number;
  holdMultiplier: number;
}

export interface LateralityModifier {
  laterality: Laterality;
  nameSuffix: string;
  nameSuffixSv: string;
  repMultiplier: number;
  instructionAddition: string;
}

// ============================================
// GENERATED EXERCISE
// ============================================

export interface GeneratedExercise {
  id: string;
  name: string;
  nameSv: string;
  description: string;
  descriptionSv: string;

  bodyRegion: BodyRegion;
  muscleGroups: MuscleGroup[];
  jointType: JointType;
  exerciseType: ExerciseType;

  position: Position;
  equipment: Equipment;
  difficulty: Difficulty;
  laterality: Laterality;

  reps: { min: number; max: number };
  sets: { min: number; max: number };
  holdSeconds?: number;
  restSeconds: number;

  instructions: string[];
  instructionsSv: string[];
  techniquePoints: string[];

  safetyData: SafetyData;
  evidenceBase: EvidenceBase;
  sourceTemplateId: string;
}
