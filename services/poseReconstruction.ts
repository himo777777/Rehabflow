/**
 * Pose Reconstruction Service
 * Converts 2D MediaPipe landmarks with Z-depth to proper 3D angles
 */

import { POSE_LANDMARKS, PoseLandmark } from './calibrationService';
import { CalibrationData } from '../types';

/**
 * 3D Vector class for calculations
 */
class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  subtract(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  scale(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector3 {
    const mag = this.magnitude();
    if (mag === 0) return new Vector3(0, 0, 0);
    return this.scale(1 / mag);
  }

  static fromLandmark(lm: PoseLandmark): Vector3 {
    return new Vector3(lm.x, lm.y, lm.z);
  }
}

/**
 * Joint angle result with confidence
 */
export interface JointAngle3D {
  name: string;
  angle: number; // degrees
  confidence: number; // 0-1
  plane: 'sagittal' | 'frontal' | 'transverse';
}

/**
 * Body segment with length and orientation
 */
export interface BodySegment {
  name: string;
  length: number;
  direction: Vector3;
  startLandmark: number;
  endLandmark: number;
}

/**
 * Anatomical plane angles
 */
export interface PlaneAngles {
  sagittal: number; // Forward/backward (flexion/extension)
  frontal: number;  // Side to side (abduction/adduction)
  transverse: number; // Rotation
}

/**
 * Calculate angle between three 3D points
 */
function calculate3DAngle(p1: Vector3, p2: Vector3, p3: Vector3): number {
  const v1 = p1.subtract(p2).normalize();
  const v2 = p3.subtract(p2).normalize();

  const dot = Math.max(-1, Math.min(1, v1.dot(v2)));
  return (Math.acos(dot) * 180) / Math.PI;
}

/**
 * Calculate angle in a specific anatomical plane
 */
function calculatePlaneAngle(
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
  planeNormal: Vector3
): number {
  // Project points onto plane
  const v1 = p1.subtract(p2);
  const v2 = p3.subtract(p2);

  // Remove component along plane normal
  const v1Projected = v1.subtract(planeNormal.scale(v1.dot(planeNormal)));
  const v2Projected = v2.subtract(planeNormal.scale(v2.dot(planeNormal)));

  // Check for zero magnitude vectors to prevent NaN from normalize()
  const v1Mag = v1Projected.magnitude();
  const v2Mag = v2Projected.magnitude();
  if (v1Mag < 0.001 || v2Mag < 0.001) {
    return 0; // Fallback angle when vectors are too small
  }

  const dot = v1Projected.normalize().dot(v2Projected.normalize());
  return (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
}

/**
 * Pose Reconstruction Class
 */
export class PoseReconstructor {
  private calibration: CalibrationData | null = null;
  private smoothingBuffer: Map<string, number[]> = new Map();
  private bufferSize: number = 5;

  constructor(calibration?: CalibrationData) {
    if (calibration) {
      this.calibration = calibration;
    }
  }

  /**
   * Set calibration data
   */
  setCalibration(calibration: CalibrationData): void {
    this.calibration = calibration;
  }

  /**
   * Apply temporal smoothing to angle
   */
  private smoothAngle(name: string, angle: number): number {
    let buffer = this.smoothingBuffer.get(name);
    if (!buffer) {
      buffer = [];
      this.smoothingBuffer.set(name, buffer);
    }

    buffer.push(angle);
    if (buffer.length > this.bufferSize) {
      buffer.shift();
    }

    // Weighted moving average (more recent = more weight)
    let sum = 0;
    let weightSum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const weight = i + 1;
      sum += buffer[i] * weight;
      weightSum += weight;
    }

    return sum / weightSum;
  }

  /**
   * Validate that landmarks are anatomically plausible
   */
  private validateAnatomically(landmarks: PoseLandmark[]): boolean {
    // Check that key body parts are in reasonable positions
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    // Shoulders should be above hips
    if (leftShoulder.y > leftHip.y || rightShoulder.y > rightHip.y) {
      // In normalized coords, y increases downward, so this is valid
    }

    // Shoulder width should be positive
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    if (shoulderWidth < 0.05) return false;

    // Hips should be below shoulders
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    if (avgHipY < avgShoulderY) return false; // In normalized coords

    return true;
  }

  /**
   * Calculate all relevant joint angles from landmarks
   */
  calculateJointAngles(landmarks: PoseLandmark[]): Record<string, JointAngle3D> {
    const angles: Record<string, JointAngle3D> = {};

    if (!this.validateAnatomically(landmarks)) {
      return angles;
    }

    // Left Elbow
    angles.leftElbow = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      'sagittal'
    );

    // Right Elbow
    angles.rightElbow = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.RIGHT_WRIST,
      'sagittal'
    );

    // Left Shoulder (flexion)
    angles.leftShoulderFlexion = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      'sagittal'
    );

    // Right Shoulder (flexion)
    angles.rightShoulderFlexion = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
      'sagittal'
    );

    // Left Shoulder (abduction - frontal plane)
    angles.leftShoulderAbduction = this.calculateShoulderAbduction(landmarks, 'left');

    // Right Shoulder (abduction - frontal plane)
    angles.rightShoulderAbduction = this.calculateShoulderAbduction(landmarks, 'right');

    // Left Hip
    angles.leftHip = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      'sagittal'
    );

    // Right Hip
    angles.rightHip = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
      'sagittal'
    );

    // Left Knee
    angles.leftKnee = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      'sagittal'
    );

    // Right Knee
    angles.rightKnee = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
      'sagittal'
    );

    // Left Ankle (dorsiflexion)
    angles.leftAnkle = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.LEFT_FOOT_INDEX,
      'sagittal'
    );

    // Right Ankle (dorsiflexion)
    angles.rightAnkle = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
      POSE_LANDMARKS.RIGHT_FOOT_INDEX,
      'sagittal'
    );

    // Spine angle (trunk lean)
    angles.trunkLean = this.calculateTrunkLean(landmarks);

    // Knee valgus/varus
    angles.leftKneeValgus = this.calculateKneeValgus(landmarks, 'left');
    angles.rightKneeValgus = this.calculateKneeValgus(landmarks, 'right');

    return angles;
  }

  /**
   * Calculate a single joint angle
   */
  private calculateJointAngle(
    landmarks: PoseLandmark[],
    idx1: number,
    idx2: number,
    idx3: number,
    plane: 'sagittal' | 'frontal' | 'transverse'
  ): JointAngle3D {
    const p1 = Vector3.fromLandmark(landmarks[idx1]);
    const p2 = Vector3.fromLandmark(landmarks[idx2]);
    const p3 = Vector3.fromLandmark(landmarks[idx3]);

    const rawAngle = calculate3DAngle(p1, p2, p3);
    const confidence = Math.min(
      landmarks[idx1].visibility,
      landmarks[idx2].visibility,
      landmarks[idx3].visibility
    );

    const name = `joint_${idx1}_${idx2}_${idx3}`;
    const smoothedAngle = this.smoothAngle(name, rawAngle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane,
    };
  }

  /**
   * Calculate shoulder abduction angle (arm away from body)
   */
  private calculateShoulderAbduction(
    landmarks: PoseLandmark[],
    side: 'left' | 'right'
  ): JointAngle3D {
    const shoulderIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_SHOULDER
      : POSE_LANDMARKS.RIGHT_SHOULDER;
    const elbowIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_ELBOW
      : POSE_LANDMARKS.RIGHT_ELBOW;
    const hipIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_HIP
      : POSE_LANDMARKS.RIGHT_HIP;

    const shoulder = Vector3.fromLandmark(landmarks[shoulderIdx]);
    const elbow = Vector3.fromLandmark(landmarks[elbowIdx]);
    const hip = Vector3.fromLandmark(landmarks[hipIdx]);

    // Vector from shoulder to elbow (arm direction)
    const armDir = elbow.subtract(shoulder).normalize();

    // Vector from shoulder to hip (trunk direction, pointing down)
    const trunkDir = hip.subtract(shoulder).normalize();

    // Abduction is the angle between arm and trunk
    const dot = armDir.dot(trunkDir);
    const angle = (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;

    // 0 degrees = arm at side, 90 = arm horizontal, 180 = arm overhead
    const abductionAngle = 180 - angle;

    const confidence = Math.min(
      landmarks[shoulderIdx].visibility,
      landmarks[elbowIdx].visibility
    );

    const name = `${side}ShoulderAbduction`;
    const smoothedAngle = this.smoothAngle(name, abductionAngle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'frontal',
    };
  }

  /**
   * Calculate trunk lean angle
   */
  private calculateTrunkLean(landmarks: PoseLandmark[]): JointAngle3D {
    const leftShoulder = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.LEFT_SHOULDER]);
    const rightShoulder = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]);
    const leftHip = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.LEFT_HIP]);
    const rightHip = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.RIGHT_HIP]);

    // Midpoints
    const midShoulder = leftShoulder.add(rightShoulder).scale(0.5);
    const midHip = leftHip.add(rightHip).scale(0.5);

    // Trunk direction
    const trunk = midShoulder.subtract(midHip).normalize();

    // Vertical reference (Y-axis, pointing up in screen coords)
    const vertical = new Vector3(0, -1, 0);

    // Angle from vertical
    const dot = trunk.dot(vertical);
    const angle = (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;

    const confidence = Math.min(
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER].visibility,
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].visibility,
      landmarks[POSE_LANDMARKS.LEFT_HIP].visibility,
      landmarks[POSE_LANDMARKS.RIGHT_HIP].visibility
    );

    const smoothedAngle = this.smoothAngle('trunkLean', angle);

    return {
      name: 'trunkLean',
      angle: smoothedAngle,
      confidence,
      plane: 'sagittal',
    };
  }

  /**
   * Calculate knee valgus/varus (knee caving in/out)
   */
  private calculateKneeValgus(
    landmarks: PoseLandmark[],
    side: 'left' | 'right'
  ): JointAngle3D {
    const hipIdx = side === 'left' ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP;
    const kneeIdx = side === 'left' ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE;
    const ankleIdx = side === 'left' ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE;

    const hip = landmarks[hipIdx];
    const knee = landmarks[kneeIdx];
    const ankle = landmarks[ankleIdx];

    // Calculate knee position relative to hip-ankle line in frontal plane (X axis)
    // A straight leg has knee directly above ankle in X
    const expectedKneeX = (hip.x + ankle.x) / 2;
    const actualKneeX = knee.x;

    // Positive = valgus (knee caves in), Negative = varus (knee bows out)
    // Multiply by 100 to get a meaningful number
    const deviation = (actualKneeX - expectedKneeX) * 100;

    // Convert to pseudo-angle based on deviation
    const angle = deviation * 10; // Scale factor

    const confidence = Math.min(
      landmarks[hipIdx].visibility,
      landmarks[kneeIdx].visibility,
      landmarks[ankleIdx].visibility
    );

    const name = `${side}KneeValgus`;
    const smoothedAngle = this.smoothAngle(name, angle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'frontal',
    };
  }

  /**
   * Get body segments with lengths
   */
  getBodySegments(landmarks: PoseLandmark[]): BodySegment[] {
    const segments: BodySegment[] = [];

    const addSegment = (name: string, start: number, end: number) => {
      const p1 = Vector3.fromLandmark(landmarks[start]);
      const p2 = Vector3.fromLandmark(landmarks[end]);
      const direction = p2.subtract(p1);
      const length = direction.magnitude();

      segments.push({
        name,
        length,
        direction: direction.normalize(),
        startLandmark: start,
        endLandmark: end,
      });
    };

    // Upper body
    addSegment('leftUpperArm', POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW);
    addSegment('leftForearm', POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST);
    addSegment('rightUpperArm', POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW);
    addSegment('rightForearm', POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST);

    // Torso
    addSegment('shoulders', POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER);
    addSegment('hips', POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP);

    // Lower body
    addSegment('leftThigh', POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE);
    addSegment('leftShin', POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE);
    addSegment('rightThigh', POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE);
    addSegment('rightShin', POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE);

    return segments;
  }

  /**
   * Calculate symmetry between left and right sides
   * Returns 0-100 (100 = perfect symmetry)
   */
  calculateSymmetry(angles: Record<string, JointAngle3D>): number {
    const pairs = [
      ['leftElbow', 'rightElbow'],
      ['leftShoulderFlexion', 'rightShoulderFlexion'],
      ['leftHip', 'rightHip'],
      ['leftKnee', 'rightKnee'],
      ['leftAnkle', 'rightAnkle'],
    ];

    let totalDiff = 0;
    let count = 0;

    for (const [left, right] of pairs) {
      if (angles[left] && angles[right]) {
        const diff = Math.abs(angles[left].angle - angles[right].angle);
        // Normalize diff: 0 diff = 100, 30+ diff = 0
        const symmetryScore = Math.max(0, 100 - (diff / 30) * 100);
        totalDiff += symmetryScore;
        count++;
      }
    }

    return count > 0 ? totalDiff / count : 100;
  }

  /**
   * Clear smoothing buffers (call when starting new exercise)
   */
  resetSmoothing(): void {
    this.smoothingBuffer.clear();
  }
}

// Singleton instance
let poseReconstructorInstance: PoseReconstructor | null = null;

export function getPoseReconstructor(): PoseReconstructor {
  if (!poseReconstructorInstance) {
    poseReconstructorInstance = new PoseReconstructor();
  }
  return poseReconstructorInstance;
}
