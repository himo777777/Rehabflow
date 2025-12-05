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
}

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
    };
  }

  /**
   * Update rep phase based on current angle
   * Uses hysteresis - requires CONFIRMATION_FRAMES consecutive frames to transition
   */
  private static readonly CONFIRMATION_FRAMES = 3;
  private pendingPhase: RepPhase | null = null;

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
            const score = this.calculateRepScore();
            this.completedReps.push(score);

            // Reset for next rep
            this.currentRep = this.initializeRep(angle, timestamp);

            // Generate completion feedback
            return this.generateCompletionFeedback(score);
          } else {
            // Normal phase transition
            this.currentRep.phase = targetPhase;
            if (targetPhase === 'TURN') {
              this.currentRep.turnTime = timestamp;
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

    // Check symmetry
    if (symmetry < 70) {
      issues.push({
        joint: 'body',
        issue: 'ASYMMETRY',
        severity: symmetry < 50 ? 'high' : 'medium',
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
   * Calculate score for completed rep
   */
  private calculateRepScore(): RepScore {
    if (!this.currentRep) {
      return this.createEmptyScore();
    }

    const rep = this.currentRep;

    // Calculate ROM score
    const targetROM = this.config.targetROM;
    const achievedROM = rep.maxROM - rep.minAngle;
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
