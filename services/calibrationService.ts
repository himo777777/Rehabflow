/**
 * Calibration Service
 * Adaptive calibration for movement analysis based on user's body proportions
 */

import { CalibrationData } from '../types';

// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface CalibrationFrame {
  landmarks: PoseLandmark[];
  timestamp: number;
}

interface JointAngleDefinition {
  name: string;
  points: [number, number, number]; // Three landmark indices
}

// Common joint angles to calibrate
const JOINT_ANGLES: JointAngleDefinition[] = [
  { name: 'leftElbow', points: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST] },
  { name: 'rightElbow', points: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST] },
  { name: 'leftShoulder', points: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW] },
  { name: 'rightShoulder', points: [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW] },
  { name: 'leftHip', points: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE] },
  { name: 'rightHip', points: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE] },
  { name: 'leftKnee', points: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE] },
  { name: 'rightKnee', points: [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE] },
];

/**
 * Calculate 2D distance between two landmarks
 */
function distance2D(p1: PoseLandmark, p2: PoseLandmark): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate 3D distance between two landmarks
 */
function distance3D(p1: PoseLandmark, p2: PoseLandmark): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
}

/**
 * Calculate angle between three points (in degrees)
 */
function calculateAngle(p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Check if landmarks are valid (high enough visibility)
 */
function areValidLandmarks(landmarks: PoseLandmark[], minVisibility = 0.5): boolean {
  // Check key landmarks for visibility
  const keyIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
  ];

  return keyIndices.every(idx =>
    landmarks[idx] && landmarks[idx].visibility >= minVisibility
  );
}

/**
 * Calibration Service Class
 * Collects multiple frames and calculates average body proportions
 */
export class CalibrationService {
  private frames: CalibrationFrame[] = [];
  private readonly targetFrameCount: number;
  private isCalibrating: boolean = false;
  private calibrationData: CalibrationData | null = null;
  private consecutiveValidFrames: number = 0;
  private readonly requiredConsecutiveFrames: number = 5; // Require N consecutive valid frames

  constructor(targetFrameCount = 30) {
    this.targetFrameCount = targetFrameCount;
  }

  /**
   * Start calibration process
   */
  startCalibration(): void {
    this.frames = [];
    this.isCalibrating = true;
    this.calibrationData = null;
    this.consecutiveValidFrames = 0;
  }

  /**
   * Add a frame to calibration
   * Returns progress (0-1) or null if calibration is complete
   * Requires N consecutive valid frames before accepting, to ensure stable tracking
   */
  addFrame(landmarks: PoseLandmark[]): number | null {
    if (!this.isCalibrating) return null;

    // Validate landmarks
    if (!areValidLandmarks(landmarks)) {
      // Reset consecutive counter on invalid frame
      this.consecutiveValidFrames = 0;
      return this.frames.length / this.targetFrameCount;
    }

    // Track consecutive valid frames
    this.consecutiveValidFrames++;

    // Only accept frame if we have enough consecutive valid frames
    // This ensures the person is in a stable position
    if (this.consecutiveValidFrames < this.requiredConsecutiveFrames) {
      return this.frames.length / this.targetFrameCount;
    }

    this.frames.push({
      landmarks,
      timestamp: Date.now(),
    });

    const progress = this.frames.length / this.targetFrameCount;

    if (this.frames.length >= this.targetFrameCount) {
      this.finishCalibration();
      return 1;
    }

    return progress;
  }

  /**
   * Calculate final calibration data from collected frames
   */
  private finishCalibration(): void {
    this.isCalibrating = false;

    if (this.frames.length === 0) return;

    // Calculate average measurements
    let totalHeight = 0;
    let totalShoulderWidth = 0;
    let totalArmLength = 0;
    let totalLegLength = 0;
    const jointAngleSums: Record<string, number> = {};

    JOINT_ANGLES.forEach(ja => {
      jointAngleSums[ja.name] = 0;
    });

    for (const frame of this.frames) {
      const lm = frame.landmarks;

      // Standing height: nose to average ankle
      const noseY = lm[POSE_LANDMARKS.NOSE].y;
      const avgAnkleY = (lm[POSE_LANDMARKS.LEFT_ANKLE].y + lm[POSE_LANDMARKS.RIGHT_ANKLE].y) / 2;
      totalHeight += Math.abs(avgAnkleY - noseY);

      // Shoulder width
      totalShoulderWidth += distance2D(
        lm[POSE_LANDMARKS.LEFT_SHOULDER],
        lm[POSE_LANDMARKS.RIGHT_SHOULDER]
      );

      // Arm length (shoulder to wrist)
      const leftArm = distance3D(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW]) +
                      distance3D(lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
      const rightArm = distance3D(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW]) +
                       distance3D(lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
      totalArmLength += (leftArm + rightArm) / 2;

      // Leg length (hip to ankle)
      const leftLeg = distance3D(lm[POSE_LANDMARKS.LEFT_HIP], lm[POSE_LANDMARKS.LEFT_KNEE]) +
                      distance3D(lm[POSE_LANDMARKS.LEFT_KNEE], lm[POSE_LANDMARKS.LEFT_ANKLE]);
      const rightLeg = distance3D(lm[POSE_LANDMARKS.RIGHT_HIP], lm[POSE_LANDMARKS.RIGHT_KNEE]) +
                       distance3D(lm[POSE_LANDMARKS.RIGHT_KNEE], lm[POSE_LANDMARKS.RIGHT_ANKLE]);
      totalLegLength += (leftLeg + rightLeg) / 2;

      // Joint angles
      for (const ja of JOINT_ANGLES) {
        const angle = calculateAngle(
          lm[ja.points[0]],
          lm[ja.points[1]],
          lm[ja.points[2]]
        );
        jointAngleSums[ja.name] += angle;
      }
    }

    const count = this.frames.length;
    const neutralJointAngles: Record<string, number> = {};

    for (const ja of JOINT_ANGLES) {
      neutralJointAngles[ja.name] = jointAngleSums[ja.name] / count;
    }

    this.calibrationData = {
      standingHeight: totalHeight / count,
      shoulderWidth: totalShoulderWidth / count,
      armLength: totalArmLength / count,
      legLength: totalLegLength / count,
      neutralJointAngles,
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Get calibration result
   */
  getCalibrationData(): CalibrationData | null {
    return this.calibrationData;
  }

  /**
   * Check if calibration is in progress
   */
  isInProgress(): boolean {
    return this.isCalibrating;
  }

  /**
   * Alias for isInProgress
   */
  isCalibrationInProgress(): boolean {
    return this.isCalibrating;
  }

  /**
   * Get current progress
   */
  getProgress(): number {
    return this.frames.length / this.targetFrameCount;
  }

  /**
   * Cancel calibration
   */
  cancel(): void {
    this.isCalibrating = false;
    this.frames = [];
  }

  /**
   * Reset calibration (alias for cancel + clear data)
   */
  reset(): void {
    this.isCalibrating = false;
    this.frames = [];
    this.calibrationData = null;
  }

  /**
   * Load existing calibration data
   */
  loadCalibration(data: CalibrationData): void {
    this.calibrationData = data;
  }
}

/**
 * Threshold Calculator
 * Calculates exercise-specific thresholds based on calibration
 */
export class ThresholdCalculator {
  private calibration: CalibrationData;

  constructor(calibration: CalibrationData) {
    this.calibration = calibration;
  }

  /**
   * Get thresholds for squat exercise
   */
  getSquatThresholds() {
    const neutralKnee = (
      this.calibration.neutralJointAngles['leftKnee'] +
      this.calibration.neutralJointAngles['rightKnee']
    ) / 2;

    return {
      // Starting position: ~170-180 degrees
      startAngle: Math.min(175, neutralKnee),
      // Deep squat: ~70-90 degrees for most people
      bottomAngle: 85,
      // Turn point tolerance
      turnTolerance: 10,
      // Asymmetry threshold (degrees difference between left/right)
      asymmetryThreshold: 15,
      // Hip angle at bottom (more upright = harder)
      hipAngleMin: 45,
      hipAngleMax: 100,
    };
  }

  /**
   * Get thresholds for lunge exercise
   */
  getLungeThresholds() {
    return {
      frontKneeMin: 85,
      frontKneeMax: 100,
      backKneeMin: 80,
      backKneeMax: 120,
      hipDropMin: 0.15 * this.calibration.legLength,
    };
  }

  /**
   * Get thresholds for arm raise exercise
   */
  getArmRaiseThresholds() {
    const neutralShoulder = (
      this.calibration.neutralJointAngles['leftShoulder'] +
      this.calibration.neutralJointAngles['rightShoulder']
    ) / 2;

    return {
      startAngle: neutralShoulder,
      targetAngle: 170, // Full overhead
      turnTolerance: 10,
      elbowBendMax: 20, // Keep arm straight
    };
  }

  /**
   * Get thresholds for any exercise by name
   */
  getThresholds(exerciseName: string): Record<string, number> {
    const name = exerciseName.toLowerCase();

    if (name.includes('squat') || name.includes('knäböj')) {
      return this.getSquatThresholds();
    }
    if (name.includes('lunge') || name.includes('utfall')) {
      return this.getLungeThresholds();
    }
    if (name.includes('arm') || name.includes('axel')) {
      return this.getArmRaiseThresholds();
    }

    // Default thresholds
    return {
      startAngle: 170,
      bottomAngle: 90,
      turnTolerance: 15,
      asymmetryThreshold: 20,
    };
  }
}

/**
 * Get default calibration data if no calibration is available
 */
export function getDefaultCalibration(): CalibrationData {
  return {
    standingHeight: 0.6, // Normalized height
    shoulderWidth: 0.25,
    armLength: 0.4,
    legLength: 0.5,
    neutralJointAngles: {
      leftElbow: 170,
      rightElbow: 170,
      leftShoulder: 30,
      rightShoulder: 30,
      leftHip: 175,
      rightHip: 175,
      leftKnee: 175,
      rightKnee: 175,
    },
    capturedAt: new Date().toISOString(),
  };
}

// Singleton instance for convenience
let calibrationServiceInstance: CalibrationService | null = null;

export function getCalibrationService(): CalibrationService {
  if (!calibrationServiceInstance) {
    calibrationServiceInstance = new CalibrationService();
  }
  return calibrationServiceInstance;
}
