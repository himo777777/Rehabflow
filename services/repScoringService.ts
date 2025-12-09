/**
 * Rep Scoring Service
 * Calculates quality scores for exercise repetitions
 */

import {
  RepScore,
  RepScoreBreakdown,
  FormIssue,
  FormIssueType,
  FormIssueSeverity,
  RepPhase,
  CalibrationData,
  FeedbackItem,
  FeedbackPriority,
} from '../types';
import { JointAngle3D } from './poseReconstruction';
import { ThresholdCalculator, getDefaultCalibration } from './calibrationService';

/**
 * Exercise-specific configuration
 */
interface ExerciseConfig {
  name: string;
  primaryJoints: string[];
  targetROM: number; // Target range of motion in degrees
  idealTempo: number; // Ideal rep duration in seconds
  tempoTolerance: number; // Acceptable tempo variation
  symmetryWeight: number; // How important is symmetry (0-1)
  depthWeight: number; // How important is depth (0-1)
}

/**
 * Rep tracking state
 */
interface RepState {
  phase: RepPhase;
  startTime: number;
  turnTime: number | null;
  endTime: number | null;
  maxROM: number;
  minAngle: number;
  maxAngle: number;
  angleHistory: number[];
  symmetryHistory: number[];
  issues: FormIssue[];
  phaseConfirmationCount: number; // For hysteresis
  // FAS 11: Phase timing tracking
  eccentricStartTime: number | null;
  concentricStartTime: number | null;
  // FAS 11: Velocity-based phase detection
  velocityHistory: VelocityDataPoint[];
}

/**
 * FAS 11: Velocity data point for phase detection
 */
interface VelocityDataPoint {
  timestamp: number;
  angle: number;
  velocity: number;      // °/s (angular velocity)
  acceleration: number;  // °/s² (angular acceleration)
}

/**
 * FAS 11: Velocity-based phase detection result
 */
export interface VelocityPhaseDetection {
  detectedPhase: RepPhase;
  confidence: number;       // 0-1
  velocity: number;         // Current angular velocity °/s
  acceleration: number;     // Current angular acceleration °/s²
  isTransition: boolean;    // True if at phase transition point
  transitionType?: 'velocity_crossover' | 'acceleration_peak' | 'angle_threshold';
}

/**
 * FAS 11: Velocity thresholds for phase detection
 *
 * Biomechanical principles:
 * - Velocity sign change = direction change (turn point)
 * - Acceleration peak = maximum force production (start/end of concentric)
 * - Velocity magnitude = movement speed quality
 *
 * Typical values for rehab exercises:
 * - Eccentric: -30 to -90 °/s (controlled lowering)
 * - Turn point: velocity crosses zero
 * - Concentric: +40 to +120 °/s (lifting)
 */
const VELOCITY_THRESHOLDS = {
  // Minimum velocity magnitude to consider movement started
  movementThreshold: 5,          // °/s
  // Velocity range for each phase
  eccentricVelocityMin: -120,    // °/s (fastest controlled eccentric)
  eccentricVelocityMax: -10,     // °/s (slowest eccentric - near turn)
  concentricVelocityMin: 10,     // °/s (slowest concentric - near turn)
  concentricVelocityMax: 150,    // °/s (fastest concentric)
  // Turn point detection
  turnVelocityThreshold: 8,      // °/s - velocity below this = potential turn
  turnAccelerationThreshold: 50, // °/s² - acceleration above this = likely turn
  // Quality thresholds
  controlledEccentricMax: -60,   // °/s - faster than this = uncontrolled
  explosivConcentricMin: 80,     // °/s - faster than this = explosive (good for some exercises)
  // Smoothing
  velocitySmoothingWindow: 3,    // frames to average
  accelerationSmoothingWindow: 5, // frames to average
};

/**
 * FAS 11: Phase Timing Analysis
 * Analyserar excentrisk/koncentrisk tempo för rehabiliteringskvalitet
 *
 * Biomechanical background:
 * - Optimal rehab: 2-3s eccentric, 1-2s concentric (2:1 ratio)
 * - Eccentric phase = controlled lowering (muscle lengthening under tension)
 * - Concentric phase = lifting (muscle shortening)
 * - Controlled eccentric builds strength and reduces injury risk
 */
export interface PhaseTimingAnalysis {
  eccentricDuration: number;  // milliseconds
  concentricDuration: number; // milliseconds
  pauseAtBottom: number;      // milliseconds at turn point
  ratio: number;              // eccentric/concentric (ideal: 2.0-3.0 for rehab)
  tempoQuality: 'optimal' | 'good' | 'too_fast' | 'too_slow' | 'uncontrolled';
  feedback: string;           // Swedish feedback
}

/**
 * Optimal tempo ranges for rehab (in milliseconds)
 */
const TEMPO_GUIDELINES = {
  // Eccentric (lowering) - should be slow and controlled
  eccentricMin: 1500,    // 1.5 seconds minimum
  eccentricOptimal: 2500, // 2.5 seconds ideal
  eccentricMax: 5000,    // 5 seconds maximum
  // Concentric (lifting) - can be slightly faster
  concentricMin: 1000,   // 1 second minimum
  concentricOptimal: 1500, // 1.5 seconds ideal
  concentricMax: 3000,   // 3 seconds maximum
  // Pause at bottom
  pauseMin: 0,           // No pause required
  pauseOptimal: 500,     // 0.5 second pause is good
  pauseMax: 2000,        // 2 seconds max before it becomes static
  // Ratio (eccentric/concentric)
  ratioMin: 1.5,         // Minimum acceptable ratio
  ratioOptimal: 2.0,     // Ideal ratio for rehab
  ratioMax: 4.0,         // Too slow concentric
};

// Swedish feedback messages
const FEEDBACK_MESSAGES = {
  valgus: [
    'Pressa ut knäna!',
    'Håll knäna i linje med tårna',
    'Undvik att knäna faller inåt',
  ],
  depth: [
    'Gå djupare!',
    'Försök nå full rörelseomfång',
    'Sänk dig mer kontrollerat',
  ],
  speedFast: [
    'Sakta ner!',
    'Kontrollera rörelsen',
    'Ta det lugnare',
  ],
  speedSlow: [
    'Lite snabbare tempo',
    'Håll jämnt tempo',
  ],
  asymmetry: [
    'Jobba på symmetrin',
    'Försök jämna ut sidorna',
    'En sida arbetar hårdare',
  ],
  repCompleteGood: [
    'Utmärkt!',
    'Perfekt!',
    'Snyggt!',
    'Bra jobbat!',
  ],
  repCompleteFair: [
    'Bra!',
    'Fortsätt så!',
    'Det går framåt!',
  ],
  repCompletePoor: [
    'Försök igen',
    'Fokusera på tekniken',
    'Ta det lugnt och kontrollerat',
  ],
  encouragement: [
    'Du klarar det!',
    'Kämpa på!',
    'Nästan där!',
  ],
};

// Exercise configurations
const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  squat: {
    name: 'squat',
    primaryJoints: ['leftKnee', 'rightKnee', 'leftHip', 'rightHip'],
    targetROM: 90,
    idealTempo: 3,
    tempoTolerance: 1,
    symmetryWeight: 0.8,
    depthWeight: 0.9,
  },
  lunge: {
    name: 'lunge',
    primaryJoints: ['leftKnee', 'rightKnee', 'leftHip', 'rightHip'],
    targetROM: 90,
    idealTempo: 4,
    tempoTolerance: 1.5,
    symmetryWeight: 0.5,
    depthWeight: 0.8,
  },
  armRaise: {
    name: 'armRaise',
    primaryJoints: ['leftShoulderFlexion', 'rightShoulderFlexion'],
    targetROM: 170,
    idealTempo: 3,
    tempoTolerance: 1,
    symmetryWeight: 0.9,
    depthWeight: 0.7,
  },
  kneeExtension: {
    name: 'kneeExtension',
    primaryJoints: ['leftKnee', 'rightKnee'],
    targetROM: 90,
    idealTempo: 2.5,
    tempoTolerance: 0.5,
    symmetryWeight: 0.7,
    depthWeight: 0.85,
  },
  default: {
    name: 'default',
    primaryJoints: ['leftKnee', 'rightKnee'],
    targetROM: 90,
    idealTempo: 3,
    tempoTolerance: 1,
    symmetryWeight: 0.7,
    depthWeight: 0.8,
  },
};

/**
 * Get exercise config by name
 */
function getExerciseConfig(exerciseName: string): ExerciseConfig {
  const name = exerciseName.toLowerCase();

  if (name.includes('squat') || name.includes('knäböj')) {
    return EXERCISE_CONFIGS.squat;
  }
  if (name.includes('lunge') || name.includes('utfall')) {
    return EXERCISE_CONFIGS.lunge;
  }
  if (name.includes('arm') || name.includes('axel')) {
    return EXERCISE_CONFIGS.armRaise;
  }
  if (name.includes('knästräck')) {
    return EXERCISE_CONFIGS.kneeExtension;
  }

  return EXERCISE_CONFIGS.default;
}

/**
 * Rep Scoring Service Class
 */
export class RepScoringService {
  private calibration: CalibrationData;
  private thresholds: ThresholdCalculator;
  private config: ExerciseConfig;
  private currentRep: RepState | null = null;
  private completedReps: RepScore[] = [];
  private feedbackQueue: FeedbackItem[] = [];
  // FAS 11: Phase timing analysis
  private lastPhaseTimingAnalysis: PhaseTimingAnalysis | null = null;

  constructor(exerciseName: string, calibration?: CalibrationData) {
    this.calibration = calibration || getDefaultCalibration();
    this.thresholds = new ThresholdCalculator(this.calibration);
    this.config = getExerciseConfig(exerciseName);
  }

  /**
   * Set exercise for scoring
   */
  setExercise(exerciseName: string): void {
    this.config = getExerciseConfig(exerciseName);
    this.reset();
  }

  /**
   * Reset scoring state
   */
  reset(): void {
    this.currentRep = null;
    this.completedReps = [];
    this.feedbackQueue = [];
    this.pendingPhase = null;
  }

  /**
   * Process frame and update rep state
   * Returns feedback if any
   */
  processFrame(
    angles: Record<string, JointAngle3D>,
    symmetry: number,
    timestamp: number
  ): FeedbackItem | null {
    // Get primary joint angle (average of primary joints)
    const primaryAngle = this.getPrimaryAngle(angles);
    if (primaryAngle === null) return null;

    // Initialize rep if not started
    if (!this.currentRep) {
      this.currentRep = this.initializeRep(primaryAngle, timestamp);
      return null;
    }

    // Track values
    this.currentRep.angleHistory.push(primaryAngle);
    this.currentRep.symmetryHistory.push(symmetry);

    // Track min/max angles separately for correct ROM calculation
    if (primaryAngle < this.currentRep.minAngle) {
      this.currentRep.minAngle = primaryAngle;
    }
    if (primaryAngle > this.currentRep.maxAngle) {
      this.currentRep.maxAngle = primaryAngle;
    }
    // ROM is the difference between max and min angles
    this.currentRep.maxROM = this.currentRep.maxAngle - this.currentRep.minAngle;

    // Check for form issues
    const issues = this.detectFormIssues(angles, symmetry);
    this.currentRep.issues.push(...issues);

    // State machine transitions
    const feedback = this.updateRepPhase(primaryAngle, timestamp);

    return feedback;
  }

  /**
   * Get average angle of primary joints
   */
  private getPrimaryAngle(angles: Record<string, JointAngle3D>): number | null {
    const primaryAngles: number[] = [];

    for (const jointName of this.config.primaryJoints) {
      if (angles[jointName] && angles[jointName].confidence > 0.5) {
        primaryAngles.push(angles[jointName].angle);
      }
    }

    if (primaryAngles.length === 0) return null;

    return primaryAngles.reduce((sum, a) => sum + a, 0) / primaryAngles.length;
  }

  /**
   * Initialize a new rep
   */
  private initializeRep(startAngle: number, timestamp: number): RepState {
    return {
      phase: 'START',
      startTime: timestamp,
      turnTime: null,
      endTime: null,
      maxROM: 0,
      minAngle: startAngle,
      maxAngle: startAngle,
      angleHistory: [startAngle],
      symmetryHistory: [],
      issues: [],
      phaseConfirmationCount: 0,
      // FAS 11: Phase timing tracking
      eccentricStartTime: null,
      concentricStartTime: null,
      // FAS 11: Velocity-based phase detection
      velocityHistory: [{
        timestamp,
        angle: startAngle,
        velocity: 0,
        acceleration: 0,
      }],
    };
  }

  /**
   * Update rep phase based on current angle
   * Uses hysteresis - requires CONFIRMATION_FRAMES consecutive frames to transition
   *
   * FAS 9: Ökad från 3 till 5 frames för robustare fasdetektering
   * 5 frames vid 30fps = ~167ms - tillräckligt för att undvika falska positiver
   */
  private static readonly CONFIRMATION_FRAMES = 5;
  private pendingPhase: RepPhase | null = null;
  private angularVelocity: number = 0; // FAS 9: Lägg till velocity tracking

  private updateRepPhase(angle: number, timestamp: number): FeedbackItem | null {
    if (!this.currentRep) return null;

    const thresholds = this.thresholds.getThresholds(this.config.name);
    const { phase } = this.currentRep;
    let targetPhase: RepPhase | null = null;

    switch (phase) {
      case 'START':
        // Detect start of eccentric phase (angle decreasing)
        if (angle < thresholds.startAngle - 10) {
          targetPhase = 'ECCENTRIC';
        }
        break;

      case 'ECCENTRIC':
        // Detect turn point (reached bottom)
        if (angle <= thresholds.bottomAngle + thresholds.turnTolerance) {
          targetPhase = 'TURN';
        }
        break;

      case 'TURN':
        // Detect start of concentric phase (angle increasing)
        if (angle > this.currentRep.minAngle + 10) {
          targetPhase = 'CONCENTRIC';
        }
        break;

      case 'CONCENTRIC':
        // Detect rep completion (back to start)
        if (angle >= thresholds.startAngle - 15) {
          targetPhase = 'START'; // Will trigger completion
        }
        break;
    }

    // Apply hysteresis - require consecutive frames for phase change
    if (targetPhase !== null) {
      if (this.pendingPhase === targetPhase) {
        this.currentRep.phaseConfirmationCount++;

        if (this.currentRep.phaseConfirmationCount >= RepScoringService.CONFIRMATION_FRAMES) {
          // Confirmed phase transition
          this.currentRep.phaseConfirmationCount = 0;
          this.pendingPhase = null;

          if (targetPhase === 'START' && phase === 'CONCENTRIC') {
            // Rep completed
            this.currentRep.endTime = timestamp;

            // FAS 11: Analyze phase timings before calculating score
            this.lastPhaseTimingAnalysis = this.analyzePhaseTimings();

            const score = this.calculateRepScore();
            this.completedReps.push(score);

            // Reset for next rep
            this.currentRep = this.initializeRep(angle, timestamp);

            // Generate completion feedback
            return this.generateCompletionFeedback(score);
          } else {
            // Normal phase transition
            this.currentRep.phase = targetPhase;

            // FAS 11: Track phase timing timestamps
            if (targetPhase === 'ECCENTRIC') {
              this.currentRep.eccentricStartTime = timestamp;
            } else if (targetPhase === 'TURN') {
              this.currentRep.turnTime = timestamp;
            } else if (targetPhase === 'CONCENTRIC') {
              this.currentRep.concentricStartTime = timestamp;
            }
          }
        }
      } else {
        // New potential phase - start counting
        this.pendingPhase = targetPhase;
        this.currentRep.phaseConfirmationCount = 1;
      }
    } else {
      // No phase change detected - reset confirmation
      this.pendingPhase = null;
      this.currentRep.phaseConfirmationCount = 0;
    }

    return null;
  }

  /**
   * Detect form issues from current frame
   */
  private detectFormIssues(
    angles: Record<string, JointAngle3D>,
    symmetry: number
  ): FormIssue[] {
    const issues: FormIssue[] = [];

    // Check knee valgus
    if (angles.leftKneeValgus && Math.abs(angles.leftKneeValgus.angle) > 10) {
      issues.push({
        joint: 'leftKnee',
        issue: 'VALGUS',
        severity: Math.abs(angles.leftKneeValgus.angle) > 20 ? 'high' : 'medium',
        message: this.getRandomMessage('valgus'),
      });
    }

    if (angles.rightKneeValgus && Math.abs(angles.rightKneeValgus.angle) > 10) {
      issues.push({
        joint: 'rightKnee',
        issue: 'VALGUS',
        severity: Math.abs(angles.rightKneeValgus.angle) > 20 ? 'high' : 'medium',
        message: this.getRandomMessage('valgus'),
      });
    }

    // FAS 9: Sänkt tröskel från 70% till 80% för att fånga mildare asymmetri
    if (symmetry < 80) {
      issues.push({
        joint: 'body',
        issue: 'ASYMMETRY',
        severity: symmetry < 60 ? 'high' : symmetry < 70 ? 'medium' : 'low',
        message: this.getRandomMessage('asymmetry'),
      });
    }

    // Check trunk lean (for squats)
    if (angles.trunkLean && angles.trunkLean.angle > 45) {
      issues.push({
        joint: 'spine',
        issue: 'ALIGNMENT',
        severity: angles.trunkLean.angle > 60 ? 'high' : 'medium',
        message: 'Håll ryggen mer upprätt',
      });
    }

    return issues;
  }

  /**
   * FAS 11: Analyze phase timings for eccentric/concentric quality
   *
   * Biomechanical principles:
   * - Controlled eccentric (2-3s) = better muscle adaptation, injury prevention
   * - Ratio 2:1 (ecc:con) = optimal for rehabilitation
   * - Too fast = poor control, injury risk
   * - Too slow concentric = muscle fatigue without benefit
   */
  private analyzePhaseTimings(): PhaseTimingAnalysis {
    if (!this.currentRep) {
      return this.createDefaultPhaseAnalysis();
    }

    const rep = this.currentRep;

    // Calculate durations
    const eccentricDuration = (rep.turnTime && rep.eccentricStartTime)
      ? rep.turnTime - rep.eccentricStartTime
      : 0;

    const concentricDuration = (rep.endTime && rep.concentricStartTime)
      ? rep.endTime - rep.concentricStartTime
      : 0;

    const pauseAtBottom = (rep.concentricStartTime && rep.turnTime)
      ? rep.concentricStartTime - rep.turnTime
      : 0;

    // Calculate ratio (avoid division by zero)
    const ratio = concentricDuration > 0
      ? eccentricDuration / concentricDuration
      : 0;

    // Determine tempo quality
    let tempoQuality: PhaseTimingAnalysis['tempoQuality'];
    let feedback: string;

    if (eccentricDuration < TEMPO_GUIDELINES.eccentricMin) {
      tempoQuality = 'too_fast';
      feedback = 'Sakta ner den excentriska fasen! Kontrollerad sänkning bygger styrka.';
    } else if (eccentricDuration > TEMPO_GUIDELINES.eccentricMax) {
      tempoQuality = 'too_slow';
      feedback = 'Du kan gå lite snabbare i sänkningsfasen.';
    } else if (concentricDuration < TEMPO_GUIDELINES.concentricMin) {
      tempoQuality = 'uncontrolled';
      feedback = 'Kontrollera lyftet bättre - för snabb koncentrisk fas.';
    } else if (ratio < TEMPO_GUIDELINES.ratioMin) {
      tempoQuality = 'uncontrolled';
      feedback = 'Sakta ner sänkningsfasen för bättre kontroll (2:1 tempo).';
    } else if (ratio > TEMPO_GUIDELINES.ratioMax) {
      tempoQuality = 'too_slow';
      feedback = 'Öka lite fart i lyftet.';
    } else if (
      eccentricDuration >= TEMPO_GUIDELINES.eccentricOptimal - 500 &&
      eccentricDuration <= TEMPO_GUIDELINES.eccentricOptimal + 1000 &&
      ratio >= TEMPO_GUIDELINES.ratioOptimal - 0.5 &&
      ratio <= TEMPO_GUIDELINES.ratioOptimal + 1
    ) {
      tempoQuality = 'optimal';
      feedback = 'Perfekt tempo! Utmärkt kontroll.';
    } else {
      tempoQuality = 'good';
      feedback = 'Bra tempo, fortsätt så!';
    }

    return {
      eccentricDuration,
      concentricDuration,
      pauseAtBottom,
      ratio,
      tempoQuality,
      feedback,
    };
  }

  /**
   * Create default phase analysis (when data is incomplete)
   */
  private createDefaultPhaseAnalysis(): PhaseTimingAnalysis {
    return {
      eccentricDuration: 0,
      concentricDuration: 0,
      pauseAtBottom: 0,
      ratio: 0,
      tempoQuality: 'uncontrolled',
      feedback: 'Kunde inte analysera tempo.',
    };
  }

  /**
   * FAS 11: Get the last phase timing analysis
   */
  getLastPhaseTimingAnalysis(): PhaseTimingAnalysis | null {
    return this.lastPhaseTimingAnalysis;
  }

  /**
   * FAS 11: Calculate tempo score based on phase timings
   */
  private calculateTempoScore(phaseTiming: PhaseTimingAnalysis): number {
    switch (phaseTiming.tempoQuality) {
      case 'optimal': return 100;
      case 'good': return 85;
      case 'too_slow': return 65;
      case 'too_fast': return 50;
      case 'uncontrolled': return 40;
      default: return 50;
    }
  }

  // ============================================
  // FAS 11: VELOCITY-BASED PHASE DETECTION
  // ============================================

  /**
   * FAS 11: Calculate angular velocity from angle history
   *
   * Uses finite difference method with smoothing:
   * velocity = Δangle / Δtime
   *
   * Positive velocity = angle increasing (concentric for most exercises)
   * Negative velocity = angle decreasing (eccentric for most exercises)
   *
   * @param currentAngle Current angle in degrees
   * @param timestamp Current timestamp in milliseconds
   * @returns Smoothed angular velocity in °/s
   */
  private calculateAngularVelocity(currentAngle: number, timestamp: number): number {
    if (!this.currentRep || this.currentRep.velocityHistory.length === 0) {
      return 0;
    }

    const history = this.currentRep.velocityHistory;
    const lastPoint = history[history.length - 1];

    // Calculate time difference in seconds
    const dt = (timestamp - lastPoint.timestamp) / 1000;
    if (dt <= 0 || dt > 1) {
      // Invalid time delta (too small, zero, or gap >1s)
      return lastPoint.velocity;
    }

    // Calculate raw velocity
    const rawVelocity = (currentAngle - lastPoint.angle) / dt;

    // Apply smoothing using exponential moving average
    const smoothingFactor = 0.3; // Higher = more responsive, lower = smoother
    const smoothedVelocity = lastPoint.velocity * (1 - smoothingFactor) + rawVelocity * smoothingFactor;

    return smoothedVelocity;
  }

  /**
   * FAS 11: Calculate angular acceleration from velocity history
   *
   * Uses finite difference on velocity:
   * acceleration = Δvelocity / Δtime
   *
   * Positive acceleration = speeding up (or decelerating from negative velocity)
   * High acceleration magnitude at turn point = good control
   *
   * @param currentVelocity Current angular velocity in °/s
   * @param timestamp Current timestamp in milliseconds
   * @returns Smoothed angular acceleration in °/s²
   */
  private calculateAngularAcceleration(currentVelocity: number, timestamp: number): number {
    if (!this.currentRep || this.currentRep.velocityHistory.length < 2) {
      return 0;
    }

    const history = this.currentRep.velocityHistory;
    const lastPoint = history[history.length - 1];

    // Calculate time difference in seconds
    const dt = (timestamp - lastPoint.timestamp) / 1000;
    if (dt <= 0 || dt > 1) {
      return lastPoint.acceleration;
    }

    // Calculate raw acceleration
    const rawAcceleration = (currentVelocity - lastPoint.velocity) / dt;

    // Apply smoothing
    const smoothingFactor = 0.2; // More smoothing for acceleration (noisier signal)
    const smoothedAcceleration = lastPoint.acceleration * (1 - smoothingFactor) + rawAcceleration * smoothingFactor;

    return smoothedAcceleration;
  }

  /**
   * FAS 11: Update velocity history with new data point
   * Maintains a sliding window of recent velocity data
   */
  private updateVelocityHistory(angle: number, timestamp: number): VelocityDataPoint {
    if (!this.currentRep) {
      return { timestamp, angle, velocity: 0, acceleration: 0 };
    }

    const velocity = this.calculateAngularVelocity(angle, timestamp);
    const acceleration = this.calculateAngularAcceleration(velocity, timestamp);

    const dataPoint: VelocityDataPoint = {
      timestamp,
      angle,
      velocity,
      acceleration,
    };

    // Add to history and limit size (keep last 30 frames ~1 second at 30fps)
    this.currentRep.velocityHistory.push(dataPoint);
    if (this.currentRep.velocityHistory.length > 30) {
      this.currentRep.velocityHistory.shift();
    }

    return dataPoint;
  }

  /**
   * FAS 11: Detect phase using velocity-based analysis
   *
   * Biomechanical principles:
   * 1. Velocity crossover (sign change) = turn point
   * 2. Acceleration peak = maximum deceleration at turn
   * 3. Sustained negative velocity = eccentric phase
   * 4. Sustained positive velocity = concentric phase
   * 5. Low velocity magnitude = start/end or pause
   *
   * This method combines velocity analysis with angle thresholds
   * for more robust phase detection, especially for:
   * - Noisy pose data
   * - Variable movement speeds
   * - Non-standard exercise tempos
   *
   * @param angle Current angle in degrees
   * @param timestamp Current timestamp in milliseconds
   * @returns Velocity-based phase detection result
   */
  detectPhaseFromVelocity(angle: number, timestamp: number): VelocityPhaseDetection {
    // Update velocity history and get current values
    const velocityData = this.updateVelocityHistory(angle, timestamp);
    const { velocity, acceleration } = velocityData;

    if (!this.currentRep) {
      return {
        detectedPhase: 'START',
        confidence: 0.5,
        velocity,
        acceleration,
        isTransition: false,
      };
    }

    const currentPhase = this.currentRep.phase;
    let detectedPhase: RepPhase = currentPhase;
    let confidence = 0.7;
    let isTransition = false;
    let transitionType: VelocityPhaseDetection['transitionType'] | undefined;

    // Get recent velocity history for trend analysis
    const recentVelocities = this.currentRep.velocityHistory
      .slice(-VELOCITY_THRESHOLDS.velocitySmoothingWindow)
      .map(v => v.velocity);
    const avgRecentVelocity = recentVelocities.length > 0
      ? recentVelocities.reduce((a, b) => a + b, 0) / recentVelocities.length
      : 0;

    // Detect velocity crossover (sign change) - indicates turn point
    const velocityCrossover = this.detectVelocityCrossover();
    if (velocityCrossover) {
      isTransition = true;
      transitionType = 'velocity_crossover';
      confidence = 0.9;

      // Determine if entering TURN or exiting TURN
      if (currentPhase === 'ECCENTRIC' && velocity > -VELOCITY_THRESHOLDS.turnVelocityThreshold) {
        detectedPhase = 'TURN';
      } else if (currentPhase === 'TURN' && velocity > VELOCITY_THRESHOLDS.turnVelocityThreshold) {
        detectedPhase = 'CONCENTRIC';
      }
    }

    // Detect acceleration peak (indicates force direction change)
    const accelerationPeak = Math.abs(acceleration) > VELOCITY_THRESHOLDS.turnAccelerationThreshold;
    if (accelerationPeak && Math.abs(velocity) < VELOCITY_THRESHOLDS.turnVelocityThreshold * 2) {
      isTransition = true;
      transitionType = transitionType || 'acceleration_peak';
      confidence = Math.max(confidence, 0.85);

      if (currentPhase === 'ECCENTRIC') {
        detectedPhase = 'TURN';
      }
    }

    // Phase detection based on sustained velocity direction
    if (!isTransition) {
      const velocityMagnitude = Math.abs(avgRecentVelocity);

      // START phase: very low velocity, waiting for movement
      if (currentPhase === 'START') {
        if (avgRecentVelocity < VELOCITY_THRESHOLDS.eccentricVelocityMax) {
          // Significant negative velocity = eccentric started
          detectedPhase = 'ECCENTRIC';
          isTransition = true;
          transitionType = 'angle_threshold';
          confidence = 0.8;
        }
      }

      // ECCENTRIC phase: sustained negative velocity
      else if (currentPhase === 'ECCENTRIC') {
        if (velocityMagnitude < VELOCITY_THRESHOLDS.movementThreshold) {
          // Velocity near zero = approaching turn
          confidence = 0.6; // Lower confidence, might be pause or turn
        } else if (avgRecentVelocity < VELOCITY_THRESHOLDS.eccentricVelocityMin) {
          // Very fast eccentric = potentially uncontrolled
          confidence = 0.7;
        }
      }

      // TURN phase: velocity near zero, waiting for direction change
      else if (currentPhase === 'TURN') {
        if (avgRecentVelocity > VELOCITY_THRESHOLDS.concentricVelocityMin) {
          // Positive velocity = concentric starting
          detectedPhase = 'CONCENTRIC';
          isTransition = true;
          transitionType = 'velocity_crossover';
          confidence = 0.85;
        }
      }

      // CONCENTRIC phase: sustained positive velocity
      else if (currentPhase === 'CONCENTRIC') {
        if (velocityMagnitude < VELOCITY_THRESHOLDS.movementThreshold) {
          // Velocity near zero at end = rep completing
          confidence = 0.6;
        } else if (avgRecentVelocity > VELOCITY_THRESHOLDS.explosivConcentricMin) {
          // Very fast concentric = explosive (good for some exercises)
          confidence = 0.75;
        }
      }
    }

    return {
      detectedPhase,
      confidence,
      velocity,
      acceleration,
      isTransition,
      transitionType,
    };
  }

  /**
   * FAS 11: Detect if velocity has crossed zero (sign change)
   * Indicates a direction reversal = turn point
   */
  private detectVelocityCrossover(): boolean {
    if (!this.currentRep || this.currentRep.velocityHistory.length < 3) {
      return false;
    }

    const history = this.currentRep.velocityHistory;
    const current = history[history.length - 1].velocity;
    const previous = history[history.length - 2].velocity;
    const beforePrevious = history[history.length - 3].velocity;

    // Check for sign change with some tolerance for noise
    const threshold = VELOCITY_THRESHOLDS.movementThreshold;

    // From negative to positive (eccentric to concentric)
    if (beforePrevious < -threshold && previous < -threshold / 2 && current > threshold / 2) {
      return true;
    }

    // From positive to negative (concentric to eccentric - rare in single rep)
    if (beforePrevious > threshold && previous > threshold / 2 && current < -threshold / 2) {
      return true;
    }

    return false;
  }

  /**
   * FAS 11: Get velocity quality assessment
   *
   * Analyzes velocity characteristics for movement quality:
   * - Controlled eccentric = good rehab quality
   * - Explosive concentric = good for power exercises
   * - Smooth velocity curve = good control
   * - Jerky velocity = poor control
   */
  getVelocityQualityAssessment(): {
    eccentricControl: 'excellent' | 'good' | 'fair' | 'poor';
    concentricPower: 'explosive' | 'controlled' | 'slow';
    smoothness: number; // 0-100
    feedback: string;
  } {
    if (!this.currentRep || this.currentRep.velocityHistory.length < 10) {
      return {
        eccentricControl: 'fair',
        concentricPower: 'controlled',
        smoothness: 50,
        feedback: 'Inte tillräckligt med data för analys.',
      };
    }

    const history = this.currentRep.velocityHistory;

    // Analyze eccentric velocities (negative values)
    const eccentricVelocities = history
      .filter(v => v.velocity < -VELOCITY_THRESHOLDS.movementThreshold)
      .map(v => v.velocity);

    // Analyze concentric velocities (positive values)
    const concentricVelocities = history
      .filter(v => v.velocity > VELOCITY_THRESHOLDS.movementThreshold)
      .map(v => v.velocity);

    // Calculate eccentric control
    let eccentricControl: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    if (eccentricVelocities.length > 0) {
      const avgEccentric = eccentricVelocities.reduce((a, b) => a + b, 0) / eccentricVelocities.length;
      if (avgEccentric >= VELOCITY_THRESHOLDS.eccentricVelocityMax && avgEccentric <= -20) {
        eccentricControl = 'excellent'; // Nice controlled 20-60 °/s
      } else if (avgEccentric >= VELOCITY_THRESHOLDS.controlledEccentricMax) {
        eccentricControl = 'good';
      } else {
        eccentricControl = 'poor'; // Too fast
      }
    }

    // Calculate concentric power
    let concentricPower: 'explosive' | 'controlled' | 'slow' = 'controlled';
    if (concentricVelocities.length > 0) {
      const avgConcentric = concentricVelocities.reduce((a, b) => a + b, 0) / concentricVelocities.length;
      if (avgConcentric > VELOCITY_THRESHOLDS.explosivConcentricMin) {
        concentricPower = 'explosive';
      } else if (avgConcentric < VELOCITY_THRESHOLDS.concentricVelocityMin + 10) {
        concentricPower = 'slow';
      }
    }

    // Calculate smoothness (inverse of velocity variance)
    const allVelocities = history.map(v => v.velocity);
    const velocityVariance = this.calculateVariance(allVelocities);
    const smoothness = Math.max(0, Math.min(100, 100 - velocityVariance));

    // Generate feedback
    let feedback = '';
    if (eccentricControl === 'poor') {
      feedback = 'Sakta ner sänkningsfasen för bättre kontroll.';
    } else if (eccentricControl === 'excellent') {
      feedback = 'Utmärkt kontroll i sänkningsfasen!';
    } else if (concentricPower === 'slow') {
      feedback = 'Försök öka kraften i lyftet.';
    } else if (smoothness < 50) {
      feedback = 'Försök hålla ett jämnare tempo genom hela rörelsen.';
    } else {
      feedback = 'Bra tempo och kontroll!';
    }

    return {
      eccentricControl,
      concentricPower,
      smoothness: Math.round(smoothness),
      feedback,
    };
  }

  /**
   * FAS 11: Get current velocity data (for UI display)
   */
  getCurrentVelocityData(): { velocity: number; acceleration: number } | null {
    if (!this.currentRep || this.currentRep.velocityHistory.length === 0) {
      return null;
    }
    const latest = this.currentRep.velocityHistory[this.currentRep.velocityHistory.length - 1];
    return {
      velocity: Math.round(latest.velocity * 10) / 10,
      acceleration: Math.round(latest.acceleration * 10) / 10,
    };
  }

  /**
   * FAS 9: Rep-kvalitetsvalidering
   * Kontrollerar att en rep uppfyller minimikrav
   */
  private validateRep(rep: RepState): { isValid: boolean; reason?: string } {
    const thresholds = this.thresholds.getThresholds(this.config.name);

    // Minimum ROM-krav (50% av target)
    const targetROM = this.config.targetROM;
    const achievedROM = Math.abs(rep.maxAngle - rep.minAngle);
    const minROMRequired = targetROM * 0.5;

    if (achievedROM < minROMRequired) {
      return { isValid: false, reason: 'ROM för liten' };
    }

    // Minimum duration (500ms)
    const duration = (rep.endTime || Date.now()) - rep.startTime;
    if (duration < 500) {
      return { isValid: false, reason: 'För snabb rörelse' };
    }

    // Maximum duration (10s) - för lång = troligen ingen riktig rep
    if (duration > 10000) {
      return { isValid: false, reason: 'För lång tid' };
    }

    return { isValid: true };
  }

  /**
   * Calculate score for completed rep
   *
   * FAS 9: Fixad ROM-beräkning - använder maxAngle - minAngle korrekt
   */
  private calculateRepScore(): RepScore {
    if (!this.currentRep) {
      return this.createEmptyScore();
    }

    const rep = this.currentRep;

    // FAS 9: Validera rep innan scoring
    const validation = this.validateRep(rep);
    if (!validation.isValid) {
      // Returnera låg poäng med anledning
      const emptyScore = this.createEmptyScore();
      emptyScore.issues.push({
        joint: 'body',
        issue: 'INCOMPLETE',
        severity: 'medium',
        message: validation.reason || 'Ofullständig repetition',
      });
      return emptyScore;
    }

    // FAS 9: Fixad ROM-beräkning
    // achievedROM är skillnaden mellan max och min vinkel (alltid positivt)
    const targetROM = this.config.targetROM;
    const achievedROM = Math.abs(rep.maxAngle - rep.minAngle);
    const romScore = Math.min(100, (achievedROM / targetROM) * 100);

    // Calculate tempo score
    const repDuration = ((rep.endTime || Date.now()) - rep.startTime) / 1000;
    const idealTempo = this.config.idealTempo;
    const tempoDeviation = Math.abs(repDuration - idealTempo);
    const tempoScore = Math.max(0, 100 - (tempoDeviation / this.config.tempoTolerance) * 50);

    // Calculate symmetry score
    const avgSymmetry = rep.symmetryHistory.length > 0
      ? rep.symmetryHistory.reduce((a, b) => a + b, 0) / rep.symmetryHistory.length
      : 100;
    const symmetryScore = avgSymmetry;

    // Calculate stability score (based on angle variance)
    const angleVariance = this.calculateVariance(rep.angleHistory);
    const stabilityScore = Math.max(0, 100 - angleVariance * 2);

    // Calculate depth score
    const depthAchieved = rep.minAngle;
    const thresholds = this.thresholds.getThresholds(this.config.name);
    const depthScore = depthAchieved <= thresholds.bottomAngle ? 100 :
      Math.max(0, 100 - (depthAchieved - thresholds.bottomAngle) * 2);

    // Calculate overall score (weighted average)
    // Note: symmetry and depth weights are applied in overall calculation, not here
    // to avoid double-weighting
    const breakdown: RepScoreBreakdown = {
      rom: Math.round(romScore),
      tempo: Math.round(tempoScore),
      symmetry: Math.round(symmetryScore),
      stability: Math.round(stabilityScore),
      depth: Math.round(depthScore),
    };

    // Apply exercise-specific weights for symmetry and depth
    const overall = Math.round(
      (breakdown.rom * 0.25) +
      (breakdown.tempo * 0.15) +
      (breakdown.symmetry * 0.2 * this.config.symmetryWeight) +
      (breakdown.stability * 0.15) +
      (breakdown.depth * 0.25 * this.config.depthWeight)
    );

    // Deduplicate issues
    const uniqueIssues = this.deduplicateIssues(rep.issues);

    return {
      overall,
      breakdown,
      issues: uniqueIssues,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  /**
   * Remove duplicate issues
   */
  private deduplicateIssues(issues: FormIssue[]): FormIssue[] {
    const seen = new Set<string>();
    return issues.filter(issue => {
      const key = `${issue.joint}-${issue.issue}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Create empty score
   */
  private createEmptyScore(): RepScore {
    return {
      overall: 0,
      breakdown: {
        rom: 0,
        tempo: 0,
        symmetry: 0,
        stability: 0,
        depth: 0,
      },
      issues: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate feedback for completed rep
   */
  private generateCompletionFeedback(score: RepScore): FeedbackItem {
    let text: string;
    let priority: FeedbackPriority;

    if (score.overall >= 85) {
      text = this.getRandomMessage('repCompleteGood');
      priority = 'encouragement';
    } else if (score.overall >= 60) {
      text = this.getRandomMessage('repCompleteFair');
      priority = 'encouragement';
    } else {
      text = this.getRandomMessage('repCompletePoor');
      priority = 'corrective';
    }

    // Add specific feedback for issues
    if (score.issues.length > 0) {
      const highPriorityIssue = score.issues.find(i => i.severity === 'high');
      if (highPriorityIssue) {
        text = highPriorityIssue.message;
        priority = 'critical';
      }
    }

    return { text, priority, timestamp: Date.now() };
  }

  /**
   * Get random message from category
   */
  private getRandomMessage(category: keyof typeof FEEDBACK_MESSAGES): string {
    const messages = FEEDBACK_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get all completed rep scores
   */
  getCompletedReps(): RepScore[] {
    return [...this.completedReps];
  }

  /**
   * Get average score for session
   */
  getAverageScore(): number {
    if (this.completedReps.length === 0) return 0;
    const sum = this.completedReps.reduce((acc, rep) => acc + rep.overall, 0);
    return Math.round(sum / this.completedReps.length);
  }

  /**
   * Get current rep phase
   */
  getCurrentPhase(): RepPhase | null {
    return this.currentRep?.phase || null;
  }

  /**
   * Get current rep progress (0-1)
   */
  getRepProgress(): number {
    if (!this.currentRep) return 0;

    const phases: RepPhase[] = ['START', 'ECCENTRIC', 'TURN', 'CONCENTRIC'];
    const currentIndex = phases.indexOf(this.currentRep.phase);
    return (currentIndex + 1) / phases.length;
  }

  /**
   * Get feedback for current state (without completing rep)
   */
  getRealtimeFeedback(
    angles: Record<string, JointAngle3D>,
    symmetry: number
  ): FeedbackItem | null {
    const issues = this.detectFormIssues(angles, symmetry);

    // Find highest severity issue
    const criticalIssue = issues.find(i => i.severity === 'high');
    if (criticalIssue) {
      return {
        text: criticalIssue.message,
        priority: 'critical',
        timestamp: Date.now(),
      };
    }

    const mediumIssue = issues.find(i => i.severity === 'medium');
    if (mediumIssue && Math.random() < 0.1) { // Only occasionally
      return {
        text: mediumIssue.message,
        priority: 'corrective',
        timestamp: Date.now(),
      };
    }

    return null;
  }
}

// Singleton instance factory
const scoringServices = new Map<string, RepScoringService>();

export function getRepScoringService(exerciseName: string): RepScoringService {
  const key = exerciseName.toLowerCase();
  if (!scoringServices.has(key)) {
    scoringServices.set(key, new RepScoringService(exerciseName));
  }
  return scoringServices.get(key)!;
}
