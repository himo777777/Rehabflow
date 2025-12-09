/**
 * Pose Processing Web Worker - Sprint 5.4
 *
 * Offloads heavy pose calculations from main thread:
 * - Landmark smoothing (temporal filtering)
 * - Ensemble fusion (combining multiple model results)
 * - Joint angle calculations
 * - Velocity estimation
 * - Jitter reduction
 *
 * This runs in a separate thread, freeing ~30-40ms per frame on main thread.
 */

// ============================================================================
// TYPES (duplicated here since workers can't import from main bundle)
// ============================================================================

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface ProcessedLandmark extends Landmark {
  velocity: { x: number; y: number; z: number };
  smoothed: boolean;
  confidence: number;
}

interface WorkerMessage {
  type: 'PROCESS_LANDMARKS' | 'CALCULATE_ANGLES' | 'FUSE_ENSEMBLE' | 'RESET' | 'SET_CONFIG';
  id: number;
  data?: unknown;
}

interface WorkerResponse {
  type: 'RESULT' | 'ERROR';
  id: number;
  data?: unknown;
  error?: string;
  processingTime: number;
}

interface PoseProcessingConfig {
  smoothingFactor: number;      // 0-1, higher = more smoothing
  velocitySmoothing: number;    // 0-1, for velocity estimation
  jitterThreshold: number;      // Min movement to not be considered jitter
  maxInterpolationGap: number;  // Max frames to interpolate missing data
}

interface JointAngleResult {
  name: string;
  angle: number;
  confidence: number;
  velocity: number;
}

interface EnsembleFusionInput {
  mediapipe?: Landmark[];
  movenet?: Landmark[];
  weights: { mediapipe: number; movenet: number };
}

// ============================================================================
// STATE
// ============================================================================

let config: PoseProcessingConfig = {
  smoothingFactor: 0.7,
  velocitySmoothing: 0.5,
  jitterThreshold: 0.002,
  maxInterpolationGap: 3,
};

let previousLandmarks: ProcessedLandmark[] | null = null;
let landmarkHistory: Landmark[][] = [];
const MAX_HISTORY = 10;

// ============================================================================
// VECTOR UTILITIES
// ============================================================================

function vec3Subtract(a: Landmark, b: Landmark): Landmark {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vec3Add(a: Landmark, b: Landmark): Landmark {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vec3Scale(v: Landmark, s: number): Landmark {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function vec3Dot(a: Landmark, b: Landmark): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vec3Length(v: Landmark): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vec3Normalize(v: Landmark): Landmark {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return vec3Scale(v, 1 / len);
}

function vec3Distance(a: Landmark, b: Landmark): number {
  return vec3Length(vec3Subtract(a, b));
}

// ============================================================================
// SMOOTHING ALGORITHMS
// ============================================================================

/**
 * Exponential moving average for temporal smoothing
 */
function exponentialSmoothing(current: number, previous: number, factor: number): number {
  return previous * factor + current * (1 - factor);
}

/**
 * Apply smoothing to a single landmark
 */
function smoothLandmark(
  current: Landmark,
  previous: ProcessedLandmark | null,
  factor: number
): Landmark {
  if (!previous) return current;

  return {
    x: exponentialSmoothing(current.x, previous.x, factor),
    y: exponentialSmoothing(current.y, previous.y, factor),
    z: exponentialSmoothing(current.z, previous.z, factor),
    visibility: current.visibility !== undefined && previous.visibility !== undefined
      ? exponentialSmoothing(current.visibility, previous.visibility, factor * 0.5)
      : current.visibility,
  };
}

/**
 * Detect and filter jitter (very small movements)
 */
function filterJitter(current: Landmark, previous: Landmark | null, threshold: number): Landmark {
  if (!previous) return current;

  const distance = vec3Distance(current, previous);
  if (distance < threshold) {
    // Movement is below threshold, keep previous position
    return { ...previous, visibility: current.visibility };
  }

  return current;
}

/**
 * One Euro Filter for adaptive smoothing
 * Better for varying speeds - less lag at fast movements, more smoothing when slow
 */
function oneEuroFilter(
  current: number,
  previous: number,
  prevDerivative: number,
  deltaTime: number,
  minCutoff: number = 1.0,
  beta: number = 0.007,
  derivativeCutoff: number = 1.0
): { value: number; derivative: number } {
  // Derivative
  const derivative = (current - previous) / deltaTime;
  const smoothedDerivative = exponentialSmoothing(
    derivative,
    prevDerivative,
    computeAlpha(deltaTime, derivativeCutoff)
  );

  // Adaptive cutoff
  const cutoff = minCutoff + beta * Math.abs(smoothedDerivative);
  const alpha = computeAlpha(deltaTime, cutoff);

  // Smoothed value
  const value = exponentialSmoothing(current, previous, 1 - alpha);

  return { value, derivative: smoothedDerivative };
}

function computeAlpha(deltaTime: number, cutoff: number): number {
  const tau = 1.0 / (2.0 * Math.PI * cutoff);
  return 1.0 / (1.0 + tau / deltaTime);
}

// ============================================================================
// MAIN PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process raw landmarks with smoothing and velocity estimation
 */
function processLandmarks(
  landmarks: Landmark[],
  deltaTime: number = 1 / 30
): ProcessedLandmark[] {
  const processed: ProcessedLandmark[] = [];

  for (let i = 0; i < landmarks.length; i++) {
    const current = landmarks[i];
    const previous = previousLandmarks?.[i] || null;

    // Apply jitter filter
    const deJittered = filterJitter(current, previous, config.jitterThreshold);

    // Apply temporal smoothing
    const smoothed = smoothLandmark(deJittered, previous, config.smoothingFactor);

    // Calculate velocity
    const velocity = previous
      ? {
          x: (smoothed.x - previous.x) / deltaTime,
          y: (smoothed.y - previous.y) / deltaTime,
          z: (smoothed.z - previous.z) / deltaTime,
        }
      : { x: 0, y: 0, z: 0 };

    // Smooth velocity
    const smoothedVelocity = previous
      ? {
          x: exponentialSmoothing(velocity.x, previous.velocity.x, config.velocitySmoothing),
          y: exponentialSmoothing(velocity.y, previous.velocity.y, config.velocitySmoothing),
          z: exponentialSmoothing(velocity.z, previous.velocity.z, config.velocitySmoothing),
        }
      : velocity;

    // Calculate confidence based on visibility and movement consistency
    const visibilityScore = current.visibility ?? 0.5;
    const movementScore = previous
      ? Math.max(0, 1 - vec3Distance(current, previous) * 10)
      : 0.5;
    const confidence = visibilityScore * 0.7 + movementScore * 0.3;

    processed.push({
      ...smoothed,
      velocity: smoothedVelocity,
      smoothed: true,
      confidence,
    });
  }

  // Update history
  landmarkHistory.push(landmarks);
  if (landmarkHistory.length > MAX_HISTORY) {
    landmarkHistory.shift();
  }

  previousLandmarks = processed;
  return processed;
}

/**
 * Calculate joint angle from three landmarks
 */
function calculateAngle(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const v1 = vec3Normalize(vec3Subtract(p1, p2));
  const v2 = vec3Normalize(vec3Subtract(p3, p2));

  const dot = Math.max(-1, Math.min(1, vec3Dot(v1, v2)));
  return (Math.acos(dot) * 180) / Math.PI;
}

/**
 * Calculate multiple joint angles from landmarks
 */
function calculateJointAngles(landmarks: Landmark[]): JointAngleResult[] {
  const angles: JointAngleResult[] = [];

  // Landmark indices (MediaPipe 33 landmarks)
  const JOINTS = {
    leftElbow: { p1: 11, p2: 13, p3: 15 },    // shoulder-elbow-wrist
    rightElbow: { p1: 12, p2: 14, p3: 16 },
    leftShoulder: { p1: 13, p2: 11, p3: 23 }, // elbow-shoulder-hip
    rightShoulder: { p1: 14, p2: 12, p3: 24 },
    leftKnee: { p1: 23, p2: 25, p3: 27 },     // hip-knee-ankle
    rightKnee: { p1: 24, p2: 26, p3: 28 },
    leftHip: { p1: 11, p2: 23, p3: 25 },      // shoulder-hip-knee
    rightHip: { p1: 12, p2: 24, p3: 26 },
  };

  for (const [name, indices] of Object.entries(JOINTS)) {
    if (
      landmarks[indices.p1] &&
      landmarks[indices.p2] &&
      landmarks[indices.p3]
    ) {
      const angle = calculateAngle(
        landmarks[indices.p1],
        landmarks[indices.p2],
        landmarks[indices.p3]
      );

      // Calculate confidence from visibility
      const avgVisibility =
        ((landmarks[indices.p1].visibility ?? 0.5) +
          (landmarks[indices.p2].visibility ?? 0.5) +
          (landmarks[indices.p3].visibility ?? 0.5)) /
        3;

      // Calculate angular velocity if we have history
      let velocity = 0;
      if (landmarkHistory.length >= 2) {
        const prevLandmarks = landmarkHistory[landmarkHistory.length - 2];
        if (prevLandmarks[indices.p1] && prevLandmarks[indices.p2] && prevLandmarks[indices.p3]) {
          const prevAngle = calculateAngle(
            prevLandmarks[indices.p1],
            prevLandmarks[indices.p2],
            prevLandmarks[indices.p3]
          );
          velocity = (angle - prevAngle) * 30; // degrees per second (assuming 30fps)
        }
      }

      angles.push({
        name,
        angle,
        confidence: avgVisibility,
        velocity,
      });
    }
  }

  return angles;
}

/**
 * Fuse landmarks from multiple models (ensemble)
 */
function fuseEnsemble(input: EnsembleFusionInput): Landmark[] {
  const { mediapipe, movenet, weights } = input;

  // If only one model, return its results
  if (!mediapipe && movenet) return movenet;
  if (mediapipe && !movenet) return mediapipe;
  if (!mediapipe && !movenet) return [];

  // MediaPipe has 33 landmarks, MoveNet has 17
  // We'll use MediaPipe as base and enhance with MoveNet where available
  const MOVENET_TO_MEDIAPIPE: Record<number, number> = {
    0: 0,   // nose
    5: 11,  // left shoulder
    6: 12,  // right shoulder
    7: 13,  // left elbow
    8: 14,  // right elbow
    9: 15,  // left wrist
    10: 16, // right wrist
    11: 23, // left hip
    12: 24, // right hip
    13: 25, // left knee
    14: 26, // right knee
    15: 27, // left ankle
    16: 28, // right ankle
  };

  const fused: Landmark[] = mediapipe!.map((mp, i) => ({ ...mp }));

  // Enhance with MoveNet data where mapping exists
  if (movenet) {
    for (const [moveNetIdx, mediaPipeIdx] of Object.entries(MOVENET_TO_MEDIAPIPE)) {
      const mnLandmark = movenet[parseInt(moveNetIdx)];
      const mpLandmark = fused[mediaPipeIdx];

      if (mnLandmark && mpLandmark) {
        // Weighted average
        const totalWeight = weights.mediapipe + weights.movenet;
        fused[mediaPipeIdx] = {
          x: (mpLandmark.x * weights.mediapipe + mnLandmark.x * weights.movenet) / totalWeight,
          y: (mpLandmark.y * weights.mediapipe + mnLandmark.y * weights.movenet) / totalWeight,
          z: (mpLandmark.z * weights.mediapipe + (mnLandmark.z ?? mpLandmark.z) * weights.movenet) / totalWeight,
          visibility: Math.max(mpLandmark.visibility ?? 0, mnLandmark.visibility ?? 0),
        };
      }
    }
  }

  return fused;
}

/**
 * Reset all state
 */
function reset(): void {
  previousLandmarks = null;
  landmarkHistory = [];
}

/**
 * Update configuration
 */
function setConfig(newConfig: Partial<PoseProcessingConfig>): void {
  config = { ...config, ...newConfig };
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, id, data } = event.data;
  const startTime = performance.now();

  let response: WorkerResponse;

  try {
    switch (type) {
      case 'PROCESS_LANDMARKS': {
        const { landmarks, deltaTime } = data as { landmarks: Landmark[]; deltaTime?: number };
        const result = processLandmarks(landmarks, deltaTime);
        response = {
          type: 'RESULT',
          id,
          data: result,
          processingTime: performance.now() - startTime,
        };
        break;
      }

      case 'CALCULATE_ANGLES': {
        const { landmarks } = data as { landmarks: Landmark[] };
        const result = calculateJointAngles(landmarks);
        response = {
          type: 'RESULT',
          id,
          data: result,
          processingTime: performance.now() - startTime,
        };
        break;
      }

      case 'FUSE_ENSEMBLE': {
        const input = data as EnsembleFusionInput;
        const result = fuseEnsemble(input);
        response = {
          type: 'RESULT',
          id,
          data: result,
          processingTime: performance.now() - startTime,
        };
        break;
      }

      case 'RESET': {
        reset();
        response = {
          type: 'RESULT',
          id,
          data: { success: true },
          processingTime: performance.now() - startTime,
        };
        break;
      }

      case 'SET_CONFIG': {
        const newConfig = data as Partial<PoseProcessingConfig>;
        setConfig(newConfig);
        response = {
          type: 'RESULT',
          id,
          data: { success: true, config },
          processingTime: performance.now() - startTime,
        };
        break;
      }

      default:
        response = {
          type: 'ERROR',
          id,
          error: `Unknown message type: ${type}`,
          processingTime: performance.now() - startTime,
        };
    }
  } catch (error) {
    response = {
      type: 'ERROR',
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: performance.now() - startTime,
    };
  }

  self.postMessage(response);
};

// Indicate worker is ready
self.postMessage({ type: 'READY', id: 0, processingTime: 0 });
