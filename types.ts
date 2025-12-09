
export enum InjuryType {
  ACUTE = 'Akut skada (Trauma)',
  CHRONIC = 'Kronisk smärta / Överbelastning',
  POST_OP = 'Post-operativ',
  PREHAB = 'Prehab / Förebyggande'
}

export enum PainLevel {
  NONE = 0,
  MILD = 3,
  MODERATE = 6,
  SEVERE = 8,
  EXTREME = 10
}

export interface SurgicalDetails {
  procedure: string; // Type of surgery performed
  procedureCategory?: string; // Category: 'knee', 'shoulder', 'hip', 'spine', 'other'
  date: string; // Surgery date
  surgeonRestrictions: string; // Any restrictions from surgeon
  weightBearing: 'Fullt' | 'Partiell' | 'Avlastad'; // Weight bearing status
  riskFactors: string[]; // Risk factors affecting healing
  complications?: string; // Any post-op complications
  physiotherapyStarted?: boolean; // Has PT already started?
  previousSurgeries?: string; // Any previous surgeries on same area
}

/**
 * Patient pain history for onboarding assessment
 */
export interface PatientPainHistory {
  duration: 'akut' | 'subakut' | 'kronisk'; // <6w, 6w-3m, >3m
  durationWeeks?: number; // Exact weeks if known
  previousEpisodes: number; // Number of previous episodes (0 = first time)
  previousTreatments: string[]; // e.g., ['Fysioterapi', 'Medicin', 'Kirurgi', 'Kiropraktik']
  whatHelps?: string; // What has helped before
  whatWorsens?: string; // What makes it worse
  dailyPattern?: 'morgon' | 'kväll' | 'konstant' | 'varierande'; // When is pain worst
}

/**
 * SMART goal structure for rehabilitation
 */
export interface SMARTGoal {
  specific: string; // What exactly do you want to achieve?
  measurable: string; // How will you measure success?
  timeframe: string; // When do you want to achieve this?
  primaryGoal: string; // Main selected goal category
  motivation?: string; // Why is this important to you?
}

/**
 * Standardized assessment score for outcome tracking
 * Used with ODI, QuickDASH, KOOS, HOOS, TSK-11 etc.
 */
export interface BaselineAssessmentScore {
  score: number;              // Raw or percent score
  percentScore?: number;      // Percentage (for comparison)
  date: string;               // ISO date string
  interpretation: string;     // e.g., "Måttlig funktionsnedsättning"
  level: string;              // e.g., "Måttlig", "Svår"
  clinicalImplication?: string; // Clinical guidance based on score
}

export interface UserAssessment {
  name: string;
  age: number;
  injuryLocation: string;
  injuryType: InjuryType;
  symptoms: string[];
  painLevel: number; // Resting pain
  activityPainLevel: number; // Pain during movement/load
  surgeryDate?: string; // Only if POST_OP
  surgicalDetails?: SurgicalDetails; // Detailed post-op information
  goals: string;
  activityLevel: string;
  redFlags?: string[]; // Potential serious symptoms caught in onboarding
  symptomDuration?: string; // How long have they had pain?
  injuryMechanism?: string; // How did it happen?
  additionalInfo?: string; // Free text from patient
  // New Adaptive Fields
  painCharacter?: string; // 'molande', 'huggande' etc.
  functionalLimitations?: string[]; // e.g. 'Can't sit', 'Can't run'
  specificAnswers: Record<string, string>; // Dynamic answers based on body part

  // Pain history for comprehensive assessment
  painHistory?: PatientPainHistory;

  // SMART goal structure
  smartGoal?: SMARTGoal;

  // Standardized baseline assessments for outcome tracking
  baselineAssessments?: {
    odi?: BaselineAssessmentScore;      // Oswestry Disability Index (back)
    quickdash?: BaselineAssessmentScore; // Arm/shoulder/hand function
    koos?: BaselineAssessmentScore;      // Knee function
    hoos?: BaselineAssessmentScore;      // Hip function
    tsk11?: BaselineAssessmentScore;     // Fear of movement (kinesiophobia)
  };

  // AI-driven assessment session (replaces old standardized questions)
  aiAssessment?: {
    questions: Array<{
      id: string;
      question: string;
      answer: string | string[] | number;
    }>;
    tsk11Score?: number;
    tsk11Interpretation?: 'låg' | 'medel' | 'hög';
    completedAt: string;
  };

  // AI-kamera ROM-mätning (valfritt)
  baselineROM?: BaselineROM;
  romHistory?: ROMHistoryEntry[];

  lifestyle: {
    sleep: 'Dålig' | 'Okej' | 'Bra';
    stress: 'Låg' | 'Medel' | 'Hög';
    fearAvoidance: boolean; // Are they afraid to move?
    workload: 'Stillasittande' | 'Fysiskt lätt' | 'Fysiskt tungt';
  };
}

export interface ExerciseStep {
  title: string;
  instruction: string;
  type: 'start' | 'execution' | 'tip';
  videoUrl?: string; // Optional URL to MP4/WebM
  animationType?: 'pulse' | 'slide' | 'bounce' | 'shake'; // For abstract fallback
}

export interface ExerciseSource {
  title: string;        // "Clinical practice guidelines for neck pain"
  authors?: string;     // "Blanpied et al."
  year?: number;        // 2017
  journal?: string;     // "Journal of Orthopaedic & Sports Physical Therapy"
  doi?: string;         // "10.2519/jospt.2017.0302"
  url?: string;         // Direct link if available
}

/**
 * Post-operative phase restrictions for exercise safety
 */
export interface PostOpPhaseRestriction {
  phase: 1 | 2 | 3 | 4;  // Rehabilitation phase (1 = earliest, 4 = return to sport)
  weeksPostOp: { min: number; max: number };  // Week range when this applies
  allowed: boolean;  // Whether exercise is allowed in this phase
  modifications?: string[];  // Required modifications if partially allowed
  maxLoad?: 'none' | 'bodyweight' | 'light' | 'moderate' | 'full';
  maxROM?: number;  // Maximum ROM percentage allowed (e.g., 90 = 90% of normal)
}

/**
 * Progression criteria that must be met before advancing
 */
export interface ProgressionCriteria {
  minPainFreeReps: number;  // Must complete X reps without pain
  minConsecutiveDays: number;  // Must complete on X consecutive days
  maxPainDuring: number;  // Max pain level (0-10) during exercise
  maxPainAfter: number;  // Max pain level 24h after
  formScore?: number;  // Minimum form score if using AI coach (0-100)
  prerequisiteExercises?: string[];  // Must master these first
}

/**
 * Regression triggers - conditions that indicate exercise should be modified
 */
export interface RegressionTriggers {
  painIncrease: number;  // If pain increases by this amount, regress
  swellingPresent: boolean;  // Regress if swelling noted
  formBreakdown: boolean;  // Regress if form deteriorates
  compensationPatterns?: string[];  // Specific compensations to watch for
}

export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: string;
  frequency: string;
  tips: string;
  category: 'mobility' | 'strength' | 'balance' | 'endurance';
  risks?: string; // Common mistakes or risks
  advancedTips?: string; // Advanced form cues or progression advice
  difficulty?: 'Lätt' | 'Medel' | 'Svår';
  calories?: string; // E.g. "50 kcal"
  steps?: ExerciseStep[]; // Explicit steps for interactive guide
  videoUrl?: string; // Main demonstration video (YouTube embed URL)
  sources?: ExerciseSource[]; // Evidence-based references
  evidenceLevel?: 'A' | 'B' | 'C' | 'D' | 'expert'; // Strength of evidence

  // ========== SAFETY FEATURES ==========

  /** Absolute contraindications - NEVER perform if any of these apply */
  contraindications?: string[];

  /** Relative contraindications - use caution, may need modification */
  precautions?: string[];

  /** Red flags - stop immediately and seek medical attention */
  redFlags?: string[];

  /** Post-operative phase restrictions */
  postOpRestrictions?: PostOpPhaseRestriction[];

  /** Surgery types this exercise is appropriate for */
  appropriateForSurgeries?: string[];

  /** Surgery types this exercise should NEVER be used for */
  contraindicatedSurgeries?: string[];

  /** Maximum acceptable pain level during exercise (0-10) */
  maxPainDuring?: number;

  /** Maximum acceptable pain increase 24h after (0-10 increase) */
  maxPainAfter24h?: number;

  /** Progression criteria - when is patient ready for harder version */
  progressionCriteria?: ProgressionCriteria;

  /** Regression triggers - when should we make it easier */
  regressionTriggers?: RegressionTriggers;

  /** ID of easier variant */
  regressionExercise?: string;

  /** ID of harder variant */
  progressionExercise?: string;

  /** Specific joint/tissue being targeted */
  targetStructure?: string;

  /** Healing tissue type (affects load progression) */
  healingTissue?: 'muscle' | 'tendon' | 'ligament' | 'bone' | 'cartilage' | 'nerve';
}

export interface DailyPlan {
  day: number;
  focus: string;
  exercises: Exercise[];
}

export interface RehabPhase {
  phaseName: string;
  durationWeeks: string;
  description: string;
  goals: string[];
  precautions: string[];
  dailyRoutine: DailyPlan[]; // Simplified to a representative routine for the phase
}

export interface PatientEducation {
  diagnosis: string; // Specific medical name (e.g., "Patellofemoralt smärtsyndrom")
  explanation: string; // Simple explanation for the patient
  pathology: string; // What is happening biologically? (Tissue healing, etc.)
  prognosis: string; // Expected timeline and outcome
  scienceBackground: string; // Why exercise helps (mechanotransduction, etc.)
  dailyTips: string[]; // Ergonomics, sleep, etc.
  sources: string[]; // List of guidelines/studies used (e.g. "Svenska Fysioterapiförbundet")
}

export interface GeneratedProgram {
  title: string;
  summary: string;
  conditionAnalysis: string;
  patientEducation: PatientEducation; // New comprehensive education module
  phases: RehabPhase[];
}

// Map 'YYYY-MM-DD' to a record of exercise names and their completion status
export type ProgressHistory = Record<string, Record<string, boolean>>;

export type ExerciseAdjustmentType = 'easier' | 'harder' | 'equivalent';

export interface WeeklyAnalysis {
  decision: 'maintain' | 'progress' | 'regress';
  reasoning: string;
  tips: string[];
  score: number; // 0-100 based on consistency
}

// ============================================
// FAS 6: NYA INTERFACES FÖR FUNKTIONALITET
// ============================================

/**
 * Pain character types for tracking
 */
export type PainCharacter = 'molande' | 'huggande' | 'brännande' | 'bultande' | 'domning' | 'stelhet';

/**
 * Pre/Post workout check-in data
 */
export interface WorkoutCheckIn {
  type: 'pre' | 'post';
  timestamp: string; // ISO string
  painLevel: number; // 0-10
  painCharacter?: PainCharacter;
  energyLevel?: number; // 1-5 (pre only)
  mood?: 'bra' | 'okej' | 'dålig'; // pre only
  workoutDifficulty?: 'för_lätt' | 'lagom' | 'för_svår'; // post only
  notes?: string;
}

/**
 * Daily pain log - stores pre and post workout data
 */
export interface DailyPainLog {
  date: string; // YYYY-MM-DD
  preWorkout?: WorkoutCheckIn;
  postWorkout?: WorkoutCheckIn;
  skippedReason?: string; // If user skipped workout
  triggers?: string[]; // What triggered pain (sleep, stress, activity)
  medications?: boolean;
  sleepQuality?: number; // 1-5
}

/**
 * Detailed exercise log - more than just completed/not
 */
export interface ExerciseLog {
  exerciseId: string; // Unique identifier (exercise name + date)
  exerciseName: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  actualSets?: number;
  actualReps?: string;
  weight?: string; // If using weights
  difficulty: 'för_lätt' | 'lagom' | 'för_svår';
  painDuring?: number; // 0-10
  painAfter?: number; // 0-10
  notes?: string;
  duration?: number; // Minutes spent
}

/**
 * Achievement/Milestone types
 */
export type MilestoneType =
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'phase_complete'
  | 'pain_reduction_25'
  | 'pain_reduction_50'
  | 'first_workout'
  | 'week_complete'
  | 'month_complete';

/**
 * Milestone/Achievement tracking
 */
export interface Milestone {
  id: string;
  type: MilestoneType;
  achievedAt: string; // ISO timestamp
  title: string;
  description: string;
  icon: string; // Emoji or icon name
  celebrated: boolean; // Has user seen the celebration?
}

/**
 * Pain history for trend analysis
 */
export type PainHistory = Record<string, DailyPainLog>; // date -> log

/**
 * Detailed exercise history
 */
export type DetailedExerciseHistory = Record<string, ExerciseLog[]>; // date -> logs

/**
 * User milestones
 */
export type UserMilestones = Milestone[];

/**
 * Pain trend data for charts
 */
export interface PainTrendPoint {
  date: string;
  prePain?: number;
  postPain?: number;
  avgPain: number;
}

/**
 * Weekly comparison data
 */
export interface WeeklyComparison {
  currentWeek: {
    avgPain: number;
    workoutsCompleted: number;
    totalExercises: number;
    adherencePercent: number;
  };
  previousWeek: {
    avgPain: number;
    workoutsCompleted: number;
    totalExercises: number;
    adherencePercent: number;
  };
  painChange: number; // Negative = improvement
  adherenceChange: number;
}

// ============================================
// VÅRDGIVARPORTAL TYPES
// ============================================

/**
 * Patient status from provider perspective
 */
export type PatientStatus = 'active' | 'paused' | 'discharged' | 'pending';

/**
 * Provider-Patient relationship
 */
export interface ProviderPatient {
  id: string;
  providerId: string;
  patientId: string;
  status: PatientStatus;
  assignedAt: string; // ISO timestamp
  dischargedAt?: string;
  notes?: string;
}

/**
 * Note types providers can create
 */
export type ProviderNoteType = 'observation' | 'recommendation' | 'concern' | 'progress' | 'general';

/**
 * Provider note about a patient
 */
export interface ProviderNote {
  id: string;
  providerId: string;
  patientId: string;
  noteType: ProviderNoteType;
  content: string;
  exerciseRef?: string; // Optional link to specific exercise
  createdAt: string; // ISO timestamp
  updatedAt?: string;
}

/**
 * AI Report types
 */
export type ReportType = 'weekly' | 'progress' | 'discharge' | 'assessment';

/**
 * Pain trend direction
 */
export type TrendDirection = 'improving' | 'stable' | 'worsening';

/**
 * AI-generated progress analysis
 */
export interface ProgressAnalysis {
  adherence: number; // 0-100 percentage
  painTrend: TrendDirection;
  keyMilestones: string[];
  concerns: string[];
  strengthsObserved: string[];
}

/**
 * AI-generated exercise analysis
 */
export interface ExerciseAnalysis {
  completed: number;
  skipped: number;
  averageDifficulty: 'för_lätt' | 'lagom' | 'för_svår';
  modifications: string[];
  problemExercises: string[];
}

/**
 * AI-generated recommendations
 */
export interface AIRecommendations {
  immediate: string[]; // Actions to take now
  nextPhase: string[]; // For the next phase
  riskFactors: string[]; // Things to watch out for
  programAdjustments: string[]; // Suggested changes to program
}

/**
 * Complete AI-generated report
 */
export interface AIReport {
  id: string;
  providerId: string;
  patientId: string;
  reportType: ReportType;
  summary: string;
  progressAnalysis: ProgressAnalysis;
  exerciseAnalysis: ExerciseAnalysis;
  recommendations: AIRecommendations;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  createdAt: string; // ISO timestamp
  generatedBy: string; // AI model used
}

/**
 * Patient summary for provider dashboard
 */
export interface PatientSummary {
  id: string;
  name: string;
  email: string;
  diagnosis: string;
  currentPhase: number;
  totalPhases: number;
  adherencePercent: number;
  painTrend: TrendDirection;
  latestPainLevel: number;
  startDate: string;
  lastActivityDate: string;
  status: PatientStatus;
  needsAttention: boolean;
  attentionReason?: string;
}

/**
 * Dashboard statistics for provider
 */
export interface ProviderDashboardStats {
  activePatients: number;
  averageAdherence: number;
  newPatientsThisWeek: number;
  patientsNeedingAttention: number;
  reportsGeneratedThisMonth: number;
}

/**
 * Invitation status
 */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'rejected';

/**
 * Patient invitation
 */
export interface PatientInvitation {
  id: string;
  providerId: string;
  patientEmail: string;
  inviteCode: string;
  message?: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

/**
 * Provider profile
 */
export interface ProviderProfile {
  id: string;
  email: string;
  displayName: string;
  title?: string; // E.g. "Leg. Fysioterapeut"
  clinicId?: string;
  clinicName?: string;
  specializations?: string[];
  createdAt: string;
}

// ============================================
// AVATAR & RÖRELSEANALYS TYPES
// ============================================

/**
 * Joint rotation in 3D space (Euler angles)
 */
export interface JointRotation {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D position
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Animation keyframe for skeletal avatar
 */
export interface PoseKeyframe {
  time: number; // 0-1 normalized time
  joints?: Record<string, JointRotation>;
  pose?: Record<string, number>; // Simplified pose data for primitives
  label?: string; // Named position (e.g., 'start', 'bottom', 'end')
  expression?: 'neutral' | 'focused' | 'encouraging' | 'happy';
  rootPosition?: Position3D;
}

/**
 * Animation phase within an exercise
 */
export interface AnimationPhase {
  name: string;
  startTime: number; // 0-1
  endTime: number; // 0-1
  description?: string;
  instruction?: string; // User-facing instruction for this phase
}

/**
 * Complete animation data for an exercise
 */
export interface ExerciseAnimationData {
  exerciseName: string;
  category: 'mobility' | 'strength' | 'balance' | 'endurance';
  duration: number; // seconds
  keyframes: PoseKeyframe[];
  phases: AnimationPhase[];
  loop: boolean;
  defaultTempo: number;
}

/**
 * Calibration data for movement analysis
 */
export interface CalibrationData {
  standingHeight: number;
  shoulderWidth: number;
  armLength: number;
  legLength: number;
  neutralJointAngles: Record<string, number>;
  capturedAt: string; // ISO timestamp
}

/**
 * Rep phase in state machine
 */
export type RepPhase = 'START' | 'ECCENTRIC' | 'TURN' | 'CONCENTRIC' | 'COMPENSATING';

/**
 * Form issue severity
 */
export type FormIssueSeverity = 'low' | 'medium' | 'high';

/**
 * Form issue types
 */
export type FormIssueType =
  | 'VALGUS'      // Knee caving in
  | 'COMPENSATION' // Using other muscles
  | 'ASYMMETRY'   // Left/right imbalance
  | 'SPEED'       // Moving too fast/slow
  | 'DEPTH'       // Not reaching full ROM
  | 'ALIGNMENT'   // Poor body alignment
  | 'INCOMPLETE'; // FAS 9: Rep did not meet quality thresholds

/**
 * Single form issue detected
 */
export interface FormIssue {
  joint: string;
  issue: FormIssueType;
  severity: FormIssueSeverity;
  message: string;
}

/**
 * Score breakdown for a single rep
 */
export interface RepScoreBreakdown {
  rom: number;        // Range of motion (0-100)
  tempo: number;      // Speed consistency (0-100)
  symmetry: number;   // Left/right balance (0-100)
  stability: number;  // Body stability (0-100)
  depth: number;      // Depth achieved (0-100)
}

/**
 * Complete rep score
 */
export interface RepScore {
  overall: number; // 0-100
  breakdown: RepScoreBreakdown;
  issues: FormIssue[];
  timestamp: string;
}

/**
 * Timestamped pose landmarks
 */
export interface TimestampedLandmarks {
  timestamp: number; // ms since session start
  landmarks: Array<{
    x: number;
    y: number;
    z: number;
    visibility: number;
  }>;
  jointAngles?: Record<string, number>;
}

/**
 * Movement session recording
 */
export interface MovementSession {
  id: string;
  exerciseName: string;
  userId?: string;
  sessionDate: string; // ISO timestamp
  duration: number; // seconds
  repsCompleted: number;
  repScores: RepScore[];
  averageScore: number;
  romAchieved: number; // percentage of target ROM
  formIssues: FormIssue[];
  landmarks?: TimestampedLandmarks[]; // Optional full recording
  videoUrl?: string; // Optional video recording URL
  calibration?: CalibrationData;
}

/**
 * Quality trend over time
 */
export interface QualityTrend {
  exerciseName: string;
  dataPoints: Array<{
    date: string;
    averageScore: number;
    reps: number;
  }>;
  improvement: number; // percentage change
  period: 'week' | 'month' | 'all';
}

/**
 * Feedback priority levels
 */
export type FeedbackPriority = 'critical' | 'corrective' | 'encouragement';

/**
 * Feedback item for speech queue
 */
export interface FeedbackItem {
  text: string;
  priority: FeedbackPriority;
  timestamp: number;
}

/**
 * Swedish feedback templates
 */
export interface FeedbackTemplates {
  valgus: string[];
  depth: string[];
  speedFast: string[];
  speedSlow: string[];
  asymmetry: string[];
  repCompleteGood: string[];
  repCompleteFair: string[];
  repCompletePoor: string[];
  encouragement: string[];
  phaseTransition: Record<string, string>;
}

// ============================================
// 10,000+ ÖVNINGSDATABAS TYPES
// ============================================

/**
 * Extended exercise categories for 10K system
 */
export type ExtendedExerciseCategory =
  | 'mobility'
  | 'strength'
  | 'balance'
  | 'endurance'
  | 'yoga'
  | 'pilates'
  | 'sport_specific'
  | 'functional'
  | 'senior';

/**
 * Body areas for exercise targeting
 */
export type BodyArea =
  | 'nacke'
  | 'axel'
  | 'armbåge'
  | 'handled'
  | 'övre_rygg'
  | 'ländrygg'
  | 'höft'
  | 'knä'
  | 'fotled'
  | 'bål'
  | 'hel_kropp'
  | 'överkropp'
  | 'underkropp'
  | 'posterior_kedja'
  | 'anterior_kedja';

/**
 * Body position for animations
 */
export type BodyPosition = 'standing' | 'lying' | 'sitting' | 'kneeling' | 'sidelying';

/**
 * Exercise types
 */
export type ExerciseType =
  | 'stretching'
  | 'stärkning'
  | 'stabilitet'
  | 'rörlighet'
  | 'plyometri'
  | 'isometrisk'
  | 'excentrisk'
  | 'koncentrisk';

/**
 * Equipment types
 */
export type Equipment =
  | 'ingen'
  | 'gummiband'
  | 'hantlar'
  | 'hantel'
  | 'kettlebell'
  | 'träningsboll'
  | 'stol'
  | 'vägg'
  | 'matta'
  | 'foam_roller'
  | 'trx'
  | 'bosu'
  | 'bänk'
  | 'stång'
  | 'kabelmaskin'
  | 'stepbräda';

/**
 * Animation laterality
 */
export type Laterality = 'bilateral' | 'left' | 'right' | 'alternating' | 'left_front' | 'right_front';

/**
 * Evidence levels for sources
 */
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'expert';

/**
 * Animation parameter range
 */
export interface ParameterRange {
  min: number;
  max: number;
  default: number;
}

/**
 * Animation parameters for customization
 */
export interface AnimationParams {
  rangeOfMotion: number;    // 0-1 percentage of full ROM
  speed: number;            // 0.5-2 multiplier
  laterality: Laterality;
  holdDuration?: number;    // seconds at end position
  resistance?: 'none' | 'band' | 'weight' | 'bodyweight';
}

/**
 * Parametric animation primitive - base animation that can be customized
 */
export interface AnimationPrimitive {
  id: string;                           // 'squat_base', 'arm_raise_base'
  name: string;                         // Human-readable name
  joints: string[];                     // Primary joints involved ['hip', 'knee', 'ankle']
  bodyPosition: BodyPosition;
  keyframes: PoseKeyframe[];
  phases: AnimationPhase[];
  loop: boolean;

  // Parameter ranges for customization
  parameters: {
    rangeOfMotion: ParameterRange;
    speed: ParameterRange;
    supportedLaterality: Laterality[];
    holdDuration?: ParameterRange;
    resistance?: ('none' | 'band' | 'weight' | 'bodyweight' | 'cable')[];
  };

  // Metadata
  category: ExtendedExerciseCategory;
  targetMuscles: string[];
  description: string;
}

/**
 * Scientific source for exercise evidence
 */
export interface ScientificSource {
  id: string;
  authors: string[];
  year: number;
  title: string;
  journal: string;
  doi?: string;
  pmid?: string;
  url?: string;
  evidenceLevel: EvidenceLevel;
  bodyAreas: BodyArea[];
  exerciseTypes: ExerciseType[];
  keywords: string[];
}

/**
 * Extended Exercise interface for 10K system
 * Backwards compatible with existing Exercise
 */
export interface ExtendedExercise {
  // Core identification
  id: string;                           // Unique ID (e.g., 'ex_squat_sumo_medel_001')
  name: string;
  description: string;

  // Classification
  category: ExtendedExerciseCategory;
  bodyArea: BodyArea;
  exerciseType: ExerciseType;
  difficulty: 'Lätt' | 'Medel' | 'Svår';

  // Prescription
  sets: number;
  reps: string;
  frequency: string;
  duration?: number;                    // seconds for timed exercises

  // Animation
  animationId: string;                  // Reference to AnimationPrimitive
  animationParams: AnimationParams;     // Customization parameters

  // Evidence
  sourceIds: string[];                  // References to ScientificSource
  evidenceLevel: EvidenceLevel;

  // Equipment & Contraindications
  equipment: Equipment[];
  contraindications: string[];

  // Progressions
  progressions: string[];               // IDs of harder variants
  regressions: string[];                // IDs of easier variants

  // Original fields
  tips?: string;
  risks?: string;
  advancedTips?: string;
  calories?: string;
  videoUrl?: string;
  steps?: ExerciseStep[];
  sources?: ExerciseSource[];           // Keep for backwards compatibility

  // Search & filtering
  keywords: string[];
  targetMuscles: string[];
  secondaryMuscles?: string[];

  // Metrics
  estimatedCalories?: number;
  restBetweenSets?: number; // seconds

  // Chunk reference (for lazy loading)
  chunkId?: number;
}

/**
 * Index entry for exercise search (minimal data)
 */
export interface ExerciseIndexEntry {
  id: string;
  name: string;
  category: ExtendedExerciseCategory;
  bodyArea: BodyArea;
  difficulty: 'Lätt' | 'Medel' | 'Svår';
  chunkId: number;
  keywords: string[];
}

/**
 * Chunk metadata
 */
export interface ChunkMeta {
  id: number;
  filename: string;
  exerciseCount: number;
  categories: ExtendedExerciseCategory[];
  bodyAreas: BodyArea[];
  loaded: boolean;
}

/**
 * Master exercise index
 */
export interface ExerciseIndex {
  version: string;
  totalCount: number;
  lastUpdated: string;
  chunks: ChunkMeta[];
  exercises: ExerciseIndexEntry[];
}

/**
 * Exercise filter options
 */
export interface ExerciseFilters {
  categories?: ExtendedExerciseCategory[];
  bodyAreas?: BodyArea[];
  difficulties?: ('Lätt' | 'Medel' | 'Svår')[];
  exerciseTypes?: ExerciseType[];
  equipment?: Equipment[];
  evidenceLevels?: EvidenceLevel[];
  searchQuery?: string;
}

/**
 * Paginated exercise result
 */
export interface PaginatedExercises {
  exercises: ExtendedExercise[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// AI-DRIVEN ONBOARDING TYPES
// ============================================

/**
 * Question type for AI-generated follow-up questions
 */
export type AIQuestionType = 'single_choice' | 'multiple_choice' | 'slider' | 'text' | 'yes_no';

/**
 * AI-generated follow-up question
 */
export interface FollowUpQuestion {
  id: string;
  question: string;
  type: AIQuestionType;
  options?: string[];
  required: boolean;
  category?: 'pain_character' | 'function' | 'history' | 'lifestyle' | 'kinesiophobia';
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    labels?: { min: string; max: string };
  };
}

/**
 * User's answer to an AI-generated question
 */
export interface AIQuestionAnswer {
  questionId: string;
  question: string;
  answer: string | string[] | number;
  answeredAt: string; // ISO timestamp
}

/**
 * TSK-11 questionnaire result
 */
export interface TSK11Result {
  totalScore: number;
  interpretation: 'låg' | 'medel' | 'hög';
  answers: Record<number, number>; // question index -> score (1-4)
  completedAt: string;
}

/**
 * AI assessment session data
 */
export interface AIAssessmentSession {
  questions: FollowUpQuestion[];
  answers: AIQuestionAnswer[];
  tsk11?: TSK11Result;
  shouldShowTSK11: boolean;
  sessionStartedAt: string;
  sessionCompletedAt?: string;
}

// ============================================
// AI-KAMERA ROM MÄTNING TYPES
// ============================================

/**
 * Single joint ROM measurement from camera
 */
export interface JointROMData {
  left: number;       // Degrees
  right: number;      // Degrees
  symmetry: number;   // Percentage (0-100, where 100 = perfect symmetry)
}

/**
 * ROM test definition for camera-guided measurement
 */
export interface ROMTestDefinition {
  id: string;
  name: string;              // "Knäböjning"
  joint: string;             // "knee"
  instruction: string;       // User-facing instruction
  normalRange: {
    min: number;             // Minimum normal ROM in degrees
    max: number;             // Maximum normal ROM in degrees
  };
  ageAdjustment?: {          // Optional age-based adjustments
    '18-40': number;
    '41-60': number;
    '60+': number;
  };
}

/**
 * Single ROM test result
 */
export interface ROMTestResult {
  testId: string;
  testName: string;
  measuredValue: JointROMData;
  normalRange: { min: number; max: number };
  percentOfNormal: number;   // How much of normal ROM achieved
  painReported: boolean;
  timestamp: string;
}

/**
 * Baseline ROM measurement from AI camera
 * Stores initial ROM values for comparison over time
 */
export interface BaselineROM {
  // Core joint measurements
  kneeFlexion?: JointROMData;
  hipFlexion?: JointROMData;
  hipAbduction?: JointROMData;
  shoulderFlexion?: JointROMData;
  shoulderAbduction?: JointROMData;
  shoulderRotation?: JointROMData;
  elbowFlexion?: JointROMData;
  ankleFlexion?: JointROMData;
  spineFlexion?: JointROMData;
  neckRotation?: JointROMData;

  // Metadata
  assessmentDate: string;            // ISO date string
  painDuringTest: boolean;
  testsCompleted: string[];          // List of test IDs completed
  skippedTests?: string[];           // Tests patient declined

  // Quality indicators
  measurementQuality: 'good' | 'fair' | 'poor';
  calibrationUsed: boolean;

  // AI analysis
  aiObservations?: string[];         // AI-noted patterns (e.g., "asymmetry in hip flexion")
  recommendedFocus?: string[];       // Suggested areas to work on
}

/**
 * ROM comparison between current and baseline
 */
export interface ROMComparison {
  joint: string;
  baseline: JointROMData;
  current: JointROMData;
  changeLeft: number;                // Degrees changed
  changeRight: number;
  changePercent: number;             // Average percentage change
  status: 'improved' | 'maintained' | 'decreased';
  comparisonDate: string;
}

/**
 * ROM history entry for trend tracking
 */
export interface ROMHistoryEntry {
  date: string;
  measurements: Partial<BaselineROM>;
  source: 'onboarding' | 'suggested' | 'manual';
  notes?: string;
}

/**
 * AI ROM suggestion state
 */
export interface ROMSuggestion {
  shouldShow: boolean;
  reason: string;                    // Why AI is suggesting this
  suggestedTests: string[];          // Which tests to perform
  lastSuggestionDate?: string;
  declinedCount: number;             // How many times user declined
  lastDeclinedDate?: string;
}
