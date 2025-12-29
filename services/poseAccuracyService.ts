/**
 * Pose Accuracy Service
 *
 * Advanced algorithms for improved pose detection accuracy:
 * - Kalman filtering for noise reduction
 * - Occlusion prediction and interpolation
 * - Multi-frame temporal consistency
 * - Anatomical constraint enforcement
 * - Confidence-weighted landmark fusion
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface KalmanState {
  x: number;  // position
  v: number;  // velocity
  a: number;  // acceleration
  p: number;  // position variance
  pv: number; // velocity variance
  pa: number; // acceleration variance
}

export interface OcclusionPrediction {
  landmarkIndex: number;
  predictedPosition: Landmark3D;
  confidence: number;
  framesOccluded: number;
  interpolationMethod: 'kalman' | 'spline' | 'anatomical';
}

export interface AnatomicalConstraint {
  name: string;
  landmarkIndices: number[];
  minDistance?: number;
  maxDistance?: number;
  minAngle?: number;
  maxAngle?: number;
  symmetric?: number; // Index of symmetric landmark
}

export interface PoseQualityMetrics {
  overallConfidence: number;
  temporalConsistency: number;
  anatomicalPlausibility: number;
  occlusionPercentage: number;
  jitterLevel: number;
  recommendedAction: 'accept' | 'interpolate' | 'reject';
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Body segment lengths (normalized, relative to shoulder width = 1.0)
const BODY_PROPORTIONS = {
  shoulderWidth: 1.0,
  upperArm: 0.85,
  forearm: 0.75,
  hand: 0.25,
  torso: 1.4,
  thigh: 1.2,
  shin: 1.1,
  foot: 0.35,
  hipWidth: 0.7,
  headHeight: 0.65,
};

// Anatomical constraints for validation
const ANATOMICAL_CONSTRAINTS: AnatomicalConstraint[] = [
  // Arm segment ratios
  { name: 'leftUpperArm', landmarkIndices: [11, 13], minDistance: 0.05, maxDistance: 0.35 },
  { name: 'leftForearm', landmarkIndices: [13, 15], minDistance: 0.05, maxDistance: 0.30 },
  { name: 'rightUpperArm', landmarkIndices: [12, 14], minDistance: 0.05, maxDistance: 0.35 },
  { name: 'rightForearm', landmarkIndices: [14, 16], minDistance: 0.05, maxDistance: 0.30 },

  // Leg segment ratios
  { name: 'leftThigh', landmarkIndices: [23, 25], minDistance: 0.10, maxDistance: 0.45 },
  { name: 'leftShin', landmarkIndices: [25, 27], minDistance: 0.10, maxDistance: 0.40 },
  { name: 'rightThigh', landmarkIndices: [24, 26], minDistance: 0.10, maxDistance: 0.45 },
  { name: 'rightShin', landmarkIndices: [26, 28], minDistance: 0.10, maxDistance: 0.40 },

  // Torso proportions
  { name: 'shoulders', landmarkIndices: [11, 12], minDistance: 0.10, maxDistance: 0.50 },
  { name: 'hips', landmarkIndices: [23, 24], minDistance: 0.08, maxDistance: 0.40 },
  { name: 'leftTorso', landmarkIndices: [11, 23], minDistance: 0.15, maxDistance: 0.50 },
  { name: 'rightTorso', landmarkIndices: [12, 24], minDistance: 0.15, maxDistance: 0.50 },

  // Joint angle constraints
  { name: 'leftElbow', landmarkIndices: [11, 13, 15], minAngle: 0, maxAngle: 180 },
  { name: 'rightElbow', landmarkIndices: [12, 14, 16], minAngle: 0, maxAngle: 180 },
  { name: 'leftKnee', landmarkIndices: [23, 25, 27], minAngle: 0, maxAngle: 180 },
  { name: 'rightKnee', landmarkIndices: [24, 26, 28], minAngle: 0, maxAngle: 180 },

  // Symmetric landmarks
  { name: 'shoulderSymmetry', landmarkIndices: [11], symmetric: 12 },
  { name: 'elbowSymmetry', landmarkIndices: [13], symmetric: 14 },
  { name: 'wristSymmetry', landmarkIndices: [15], symmetric: 16 },
  { name: 'hipSymmetry', landmarkIndices: [23], symmetric: 24 },
  { name: 'kneeSymmetry', landmarkIndices: [25], symmetric: 26 },
  { name: 'ankleSymmetry', landmarkIndices: [27], symmetric: 28 },
];

// Kalman filter parameters
const KALMAN_CONFIG = {
  processNoise: 0.01,
  measurementNoise: 0.1,
  initialVariance: 1.0,
};

// ============================================================================
// KALMAN FILTER
// ============================================================================

class KalmanFilter3D {
  private stateX: KalmanState;
  private stateY: KalmanState;
  private stateZ: KalmanState;
  private processNoise: number;
  private measurementNoise: number;
  private initialized: boolean = false;

  constructor(processNoise = KALMAN_CONFIG.processNoise, measurementNoise = KALMAN_CONFIG.measurementNoise) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.stateX = this.createInitialState();
    this.stateY = this.createInitialState();
    this.stateZ = this.createInitialState();
  }

  private createInitialState(): KalmanState {
    return {
      x: 0,
      v: 0,
      a: 0,
      p: KALMAN_CONFIG.initialVariance,
      pv: KALMAN_CONFIG.initialVariance,
      pa: KALMAN_CONFIG.initialVariance,
    };
  }

  initialize(landmark: Landmark3D): void {
    this.stateX.x = landmark.x;
    this.stateY.x = landmark.y;
    this.stateZ.x = landmark.z;
    this.initialized = true;
  }

  predict(dt: number): Landmark3D {
    if (!this.initialized) {
      return { x: 0, y: 0, z: 0, visibility: 0 };
    }

    // Predict state using constant acceleration model
    this.predictState(this.stateX, dt);
    this.predictState(this.stateY, dt);
    this.predictState(this.stateZ, dt);

    return {
      x: this.stateX.x,
      y: this.stateY.x,
      z: this.stateZ.x,
      visibility: 0.7, // Predicted visibility is lower
    };
  }

  private predictState(state: KalmanState, dt: number): void {
    // State prediction: x = x + v*dt + 0.5*a*dt^2
    state.x += state.v * dt + 0.5 * state.a * dt * dt;
    state.v += state.a * dt;
    // Acceleration decays towards zero
    state.a *= 0.95;

    // Variance prediction
    state.p += state.pv * dt * dt + this.processNoise;
    state.pv += state.pa * dt + this.processNoise * 0.5;
    state.pa += this.processNoise * 0.25;
  }

  update(measurement: Landmark3D): Landmark3D {
    if (!this.initialized) {
      this.initialize(measurement);
      return measurement;
    }

    // Weight measurement by visibility
    const adjustedNoise = this.measurementNoise / Math.max(0.1, measurement.visibility);

    this.updateState(this.stateX, measurement.x, adjustedNoise);
    this.updateState(this.stateY, measurement.y, adjustedNoise);
    this.updateState(this.stateZ, measurement.z, adjustedNoise);

    return {
      x: this.stateX.x,
      y: this.stateY.x,
      z: this.stateZ.x,
      visibility: measurement.visibility,
    };
  }

  private updateState(state: KalmanState, measurement: number, noise: number): void {
    // Kalman gain
    const K = state.p / (state.p + noise);

    // Update estimate
    const innovation = measurement - state.x;
    state.x += K * innovation;

    // Update velocity estimate from position change
    state.v += K * 0.5 * innovation;

    // Update variance
    state.p = (1 - K) * state.p;
  }

  getVelocity(): { x: number; y: number; z: number } {
    return {
      x: this.stateX.v,
      y: this.stateY.v,
      z: this.stateZ.v,
    };
  }

  getAcceleration(): { x: number; y: number; z: number } {
    return {
      x: this.stateX.a,
      y: this.stateY.a,
      z: this.stateZ.a,
    };
  }

  reset(): void {
    this.stateX = this.createInitialState();
    this.stateY = this.createInitialState();
    this.stateZ = this.createInitialState();
    this.initialized = false;
  }
}

// ============================================================================
// SPLINE INTERPOLATION
// ============================================================================

class CatmullRomSpline {
  /**
   * Interpolate between points using Catmull-Rom spline
   * Provides smooth interpolation through control points
   */
  static interpolate(
    p0: Landmark3D,
    p1: Landmark3D,
    p2: Landmark3D,
    p3: Landmark3D,
    t: number
  ): Landmark3D {
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom coefficients
    const c0 = -0.5 * t3 + t2 - 0.5 * t;
    const c1 = 1.5 * t3 - 2.5 * t2 + 1;
    const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
    const c3 = 0.5 * t3 - 0.5 * t2;

    return {
      x: c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
      y: c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y,
      z: c0 * p0.z + c1 * p1.z + c2 * p2.z + c3 * p3.z,
      visibility: Math.min(p1.visibility, p2.visibility) * 0.8,
    };
  }

  /**
   * Interpolate a missing frame given surrounding frames
   */
  static interpolateMissing(
    history: Landmark3D[],
    futureFrames: Landmark3D[],
    frameIndex: number
  ): Landmark3D {
    // Need at least 2 history and 2 future frames for spline
    if (history.length < 2 || futureFrames.length < 2) {
      // Fallback to linear interpolation
      const before = history[history.length - 1];
      const after = futureFrames[0];
      const t = 0.5;
      return {
        x: before.x + (after.x - before.x) * t,
        y: before.y + (after.y - before.y) * t,
        z: before.z + (after.z - before.z) * t,
        visibility: Math.min(before.visibility, after.visibility) * 0.7,
      };
    }

    const p0 = history[history.length - 2];
    const p1 = history[history.length - 1];
    const p2 = futureFrames[0];
    const p3 = futureFrames[1];

    // t = 0.5 for middle of gap
    const t = 0.5;
    return this.interpolate(p0, p1, p2, p3, t);
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

class PoseAccuracyService {
  private kalmanFilters: Map<number, KalmanFilter3D> = new Map();
  private landmarkHistory: Map<number, Landmark3D[]> = new Map();
  private occlusionCounters: Map<number, number> = new Map();
  private lastTimestamp: number = 0;
  private frameCount: number = 0;

  private readonly HISTORY_LENGTH = 10;
  private readonly MAX_OCCLUSION_FRAMES = 5;
  private readonly VISIBILITY_THRESHOLD = 0.5;

  constructor() {
    // Initialize Kalman filters for all 33 MediaPipe landmarks
    for (let i = 0; i < 33; i++) {
      this.kalmanFilters.set(i, new KalmanFilter3D());
      this.landmarkHistory.set(i, []);
      this.occlusionCounters.set(i, 0);
    }
  }

  /**
   * Process landmarks with full accuracy enhancement pipeline
   */
  processLandmarks(
    rawLandmarks: Landmark3D[],
    timestamp: number = performance.now()
  ): {
    landmarks: Landmark3D[];
    quality: PoseQualityMetrics;
    occlusionPredictions: OcclusionPrediction[];
  } {
    const dt = this.lastTimestamp > 0 ? (timestamp - this.lastTimestamp) / 1000 : 1 / 30;
    this.lastTimestamp = timestamp;
    this.frameCount++;

    const processedLandmarks: Landmark3D[] = [];
    const occlusionPredictions: OcclusionPrediction[] = [];

    for (let i = 0; i < rawLandmarks.length; i++) {
      const raw = rawLandmarks[i];
      const kalman = this.kalmanFilters.get(i)!;
      const history = this.landmarkHistory.get(i)!;
      let occlusionCount = this.occlusionCounters.get(i) || 0;

      let processed: Landmark3D;

      if (raw.visibility >= this.VISIBILITY_THRESHOLD) {
        // Good visibility - use Kalman update
        processed = kalman.update(raw);
        occlusionCount = 0;
      } else if (occlusionCount < this.MAX_OCCLUSION_FRAMES) {
        // Occluded but within interpolation window
        const predicted = kalman.predict(dt);
        occlusionCount++;

        occlusionPredictions.push({
          landmarkIndex: i,
          predictedPosition: predicted,
          confidence: Math.max(0.3, 0.9 - occlusionCount * 0.15),
          framesOccluded: occlusionCount,
          interpolationMethod: 'kalman',
        });

        // Blend prediction with low-confidence measurement
        processed = this.blendLandmarks(predicted, raw, 0.8);
      } else {
        // Too long occlusion - try anatomical inference
        processed = this.inferFromAnatomy(i, processedLandmarks, raw);

        occlusionPredictions.push({
          landmarkIndex: i,
          predictedPosition: processed,
          confidence: 0.3,
          framesOccluded: occlusionCount,
          interpolationMethod: 'anatomical',
        });
      }

      // Update history
      history.push(processed);
      if (history.length > this.HISTORY_LENGTH) {
        history.shift();
      }

      this.occlusionCounters.set(i, occlusionCount);
      processedLandmarks.push(processed);
    }

    // Apply anatomical constraints
    const constrainedLandmarks = this.enforceAnatomicalConstraints(processedLandmarks);

    // Calculate quality metrics
    const quality = this.calculateQualityMetrics(rawLandmarks, constrainedLandmarks);

    return {
      landmarks: constrainedLandmarks,
      quality,
      occlusionPredictions,
    };
  }

  /**
   * Blend two landmarks with weight
   */
  private blendLandmarks(a: Landmark3D, b: Landmark3D, weightA: number): Landmark3D {
    const weightB = 1 - weightA;
    return {
      x: a.x * weightA + b.x * weightB,
      y: a.y * weightA + b.y * weightB,
      z: a.z * weightA + b.z * weightB,
      visibility: a.visibility * weightA + b.visibility * weightB,
    };
  }

  /**
   * Infer landmark position from anatomical constraints
   */
  private inferFromAnatomy(
    landmarkIndex: number,
    processedLandmarks: Landmark3D[],
    fallback: Landmark3D
  ): Landmark3D {
    // Find constraints that involve this landmark
    const relevantConstraints = ANATOMICAL_CONSTRAINTS.filter(
      c => c.landmarkIndices.includes(landmarkIndex) || c.symmetric === landmarkIndex
    );

    for (const constraint of relevantConstraints) {
      // Check for symmetric landmark inference
      if (constraint.symmetric === landmarkIndex) {
        const sourceIdx = constraint.landmarkIndices[0];
        const source = processedLandmarks[sourceIdx];
        if (source && source.visibility > this.VISIBILITY_THRESHOLD) {
          // Mirror across body center
          const centerX = (processedLandmarks[11]?.x + processedLandmarks[12]?.x) / 2 || 0.5;
          return {
            x: 2 * centerX - source.x,
            y: source.y,
            z: source.z,
            visibility: source.visibility * 0.6,
          };
        }
      }

      // Infer from segment constraints
      if (constraint.landmarkIndices.length === 2) {
        const [idx1, idx2] = constraint.landmarkIndices;
        const other = idx1 === landmarkIndex ? idx2 : idx1;
        const otherLandmark = processedLandmarks[other];

        if (otherLandmark && otherLandmark.visibility > this.VISIBILITY_THRESHOLD) {
          // Use average segment length to estimate position
          const avgDistance = (constraint.minDistance! + constraint.maxDistance!) / 2;
          const history = this.landmarkHistory.get(landmarkIndex)!;

          if (history.length > 0) {
            // Use last known direction
            const lastKnown = history[history.length - 1];
            const dx = lastKnown.x - otherLandmark.x;
            const dy = lastKnown.y - otherLandmark.y;
            const dz = lastKnown.z - otherLandmark.z;
            const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (currentDist > 0.001) {
              const scale = avgDistance / currentDist;
              return {
                x: otherLandmark.x + dx * scale,
                y: otherLandmark.y + dy * scale,
                z: otherLandmark.z + dz * scale,
                visibility: 0.4,
              };
            }
          }
        }
      }
    }

    return fallback;
  }

  /**
   * Enforce anatomical constraints on landmarks
   */
  private enforceAnatomicalConstraints(landmarks: Landmark3D[]): Landmark3D[] {
    const result = landmarks.map(l => ({ ...l }));
    const iterations = 3; // Multiple iterations for constraint propagation

    for (let iter = 0; iter < iterations; iter++) {
      for (const constraint of ANATOMICAL_CONSTRAINTS) {
        if (constraint.minDistance !== undefined || constraint.maxDistance !== undefined) {
          this.enforceDistanceConstraint(result, constraint);
        }
        if (constraint.minAngle !== undefined || constraint.maxAngle !== undefined) {
          this.enforceAngleConstraint(result, constraint);
        }
      }
    }

    return result;
  }

  /**
   * Enforce distance constraint between two landmarks
   */
  private enforceDistanceConstraint(
    landmarks: Landmark3D[],
    constraint: AnatomicalConstraint
  ): void {
    const [idx1, idx2] = constraint.landmarkIndices;
    const l1 = landmarks[idx1];
    const l2 = landmarks[idx2];

    if (!l1 || !l2) return;

    const dx = l2.x - l1.x;
    const dy = l2.y - l1.y;
    const dz = l2.z - l1.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < 0.001) return;

    let targetDistance = distance;
    if (constraint.minDistance !== undefined && distance < constraint.minDistance) {
      targetDistance = constraint.minDistance;
    }
    if (constraint.maxDistance !== undefined && distance > constraint.maxDistance) {
      targetDistance = constraint.maxDistance;
    }

    if (Math.abs(targetDistance - distance) > 0.001) {
      const scale = (targetDistance - distance) / distance;
      const moveRatio1 = l2.visibility / (l1.visibility + l2.visibility + 0.001);
      const moveRatio2 = 1 - moveRatio1;

      landmarks[idx1] = {
        ...l1,
        x: l1.x - dx * scale * 0.5 * moveRatio1,
        y: l1.y - dy * scale * 0.5 * moveRatio1,
        z: l1.z - dz * scale * 0.5 * moveRatio1,
      };
      landmarks[idx2] = {
        ...l2,
        x: l2.x + dx * scale * 0.5 * moveRatio2,
        y: l2.y + dy * scale * 0.5 * moveRatio2,
        z: l2.z + dz * scale * 0.5 * moveRatio2,
      };
    }
  }

  /**
   * Enforce angle constraint at a joint
   */
  private enforceAngleConstraint(
    landmarks: Landmark3D[],
    constraint: AnatomicalConstraint
  ): void {
    if (constraint.landmarkIndices.length !== 3) return;

    const [idx1, idx2, idx3] = constraint.landmarkIndices;
    const l1 = landmarks[idx1];
    const l2 = landmarks[idx2];
    const l3 = landmarks[idx3];

    if (!l1 || !l2 || !l3) return;

    // Calculate current angle
    const v1 = { x: l1.x - l2.x, y: l1.y - l2.y, z: l1.z - l2.z };
    const v2 = { x: l3.x - l2.x, y: l3.y - l2.y, z: l3.z - l2.z };

    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

    if (mag1 < 0.001 || mag2 < 0.001) return;

    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    const angle = Math.acos(cosAngle) * (180 / Math.PI);

    // Check constraints
    let targetAngle = angle;
    if (constraint.minAngle !== undefined && angle < constraint.minAngle) {
      targetAngle = constraint.minAngle;
    }
    if (constraint.maxAngle !== undefined && angle > constraint.maxAngle) {
      targetAngle = constraint.maxAngle;
    }

    // Apply correction if needed (simplified - just clamp the angle)
    if (Math.abs(targetAngle - angle) > 5) {
      // In a full implementation, we would rotate the outer landmarks
      // For now, we flag this but don't modify (complex rotation needed)
      logger.debug(`[PoseAccuracy] Angle constraint violation: ${constraint.name} = ${angle.toFixed(1)}°`);
    }
  }

  /**
   * Calculate pose quality metrics
   */
  private calculateQualityMetrics(
    raw: Landmark3D[],
    processed: Landmark3D[]
  ): PoseQualityMetrics {
    // Overall confidence (average visibility)
    const visibilities = processed.map(l => l.visibility);
    const overallConfidence = visibilities.reduce((a, b) => a + b, 0) / visibilities.length;

    // Temporal consistency (compare to previous frame)
    let temporalConsistency = 1.0;
    let totalJitter = 0;
    let jitterCount = 0;

    for (let i = 0; i < processed.length; i++) {
      const history = this.landmarkHistory.get(i)!;
      if (history.length >= 2) {
        const prev = history[history.length - 2];
        const curr = processed[i];
        const dist = Math.sqrt(
          Math.pow(curr.x - prev.x, 2) +
          Math.pow(curr.y - prev.y, 2) +
          Math.pow(curr.z - prev.z, 2)
        );
        // Large movements reduce consistency score
        if (dist > 0.05) temporalConsistency *= 0.9;
        totalJitter += dist;
        jitterCount++;
      }
    }
    const jitterLevel = jitterCount > 0 ? totalJitter / jitterCount : 0;

    // Anatomical plausibility check
    let anatomicalScore = 1.0;
    for (const constraint of ANATOMICAL_CONSTRAINTS) {
      if (constraint.minDistance !== undefined && constraint.landmarkIndices.length === 2) {
        const [idx1, idx2] = constraint.landmarkIndices;
        const l1 = processed[idx1];
        const l2 = processed[idx2];
        if (l1 && l2) {
          const dist = Math.sqrt(
            Math.pow(l2.x - l1.x, 2) +
            Math.pow(l2.y - l1.y, 2) +
            Math.pow(l2.z - l1.z, 2)
          );
          if (dist < constraint.minDistance! || dist > constraint.maxDistance!) {
            anatomicalScore *= 0.9;
          }
        }
      }
    }

    // Occlusion percentage
    const occludedCount = visibilities.filter(v => v < this.VISIBILITY_THRESHOLD).length;
    const occlusionPercentage = occludedCount / visibilities.length;

    // Determine recommended action
    let recommendedAction: 'accept' | 'interpolate' | 'reject';
    if (overallConfidence > 0.7 && anatomicalScore > 0.8 && occlusionPercentage < 0.3) {
      recommendedAction = 'accept';
    } else if (overallConfidence > 0.4 && occlusionPercentage < 0.5) {
      recommendedAction = 'interpolate';
    } else {
      recommendedAction = 'reject';
    }

    return {
      overallConfidence,
      temporalConsistency,
      anatomicalPlausibility: anatomicalScore,
      occlusionPercentage,
      jitterLevel,
      recommendedAction,
    };
  }

  /**
   * Batch interpolate missing frames
   */
  interpolateMissingFrames(
    frames: (Landmark3D[] | null)[],
    maxGap: number = 3
  ): Landmark3D[][] {
    const result: Landmark3D[][] = [];
    const numLandmarks = frames.find(f => f !== null)?.length || 33;

    for (let frameIdx = 0; frameIdx < frames.length; frameIdx++) {
      const frame = frames[frameIdx];

      if (frame !== null) {
        result.push(frame);
        continue;
      }

      // Find surrounding valid frames
      let beforeIdx = frameIdx - 1;
      while (beforeIdx >= 0 && frames[beforeIdx] === null) beforeIdx--;

      let afterIdx = frameIdx + 1;
      while (afterIdx < frames.length && frames[afterIdx] === null) afterIdx++;

      // Check if gap is too large
      const gapSize = afterIdx - beforeIdx - 1;
      if (gapSize > maxGap || beforeIdx < 0 || afterIdx >= frames.length) {
        // Use last valid frame or empty
        result.push(beforeIdx >= 0 ? [...frames[beforeIdx]!] : new Array(numLandmarks).fill({ x: 0, y: 0, z: 0, visibility: 0 }));
        continue;
      }

      // Interpolate each landmark
      const interpolated: Landmark3D[] = [];
      const t = (frameIdx - beforeIdx) / (afterIdx - beforeIdx);

      for (let i = 0; i < numLandmarks; i++) {
        const before = frames[beforeIdx]![i];
        const after = frames[afterIdx]![i];

        interpolated.push({
          x: before.x + (after.x - before.x) * t,
          y: before.y + (after.y - before.y) * t,
          z: before.z + (after.z - before.z) * t,
          visibility: Math.min(before.visibility, after.visibility) * 0.8,
        });
      }

      result.push(interpolated);
    }

    return result;
  }

  /**
   * Get velocity for specific landmark
   */
  getLandmarkVelocity(landmarkIndex: number): { x: number; y: number; z: number } | null {
    const kalman = this.kalmanFilters.get(landmarkIndex);
    return kalman ? kalman.getVelocity() : null;
  }

  /**
   * Get acceleration for specific landmark
   */
  getLandmarkAcceleration(landmarkIndex: number): { x: number; y: number; z: number } | null {
    const kalman = this.kalmanFilters.get(landmarkIndex);
    return kalman ? kalman.getAcceleration() : null;
  }

  /**
   * Reset all filters and history
   */
  reset(): void {
    this.kalmanFilters.forEach(kf => kf.reset());
    this.landmarkHistory.forEach(h => h.length = 0);
    this.occlusionCounters.forEach((_, key) => this.occlusionCounters.set(key, 0));
    this.lastTimestamp = 0;
    this.frameCount = 0;
    logger.info('[PoseAccuracy] Reset all filters and history');
  }

  /**
   * Get current frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }
}

// Singleton instance
export const poseAccuracyService = new PoseAccuracyService();
export default poseAccuracyService;
