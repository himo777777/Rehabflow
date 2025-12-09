/**
 * usePoseWorker Hook - Sprint 5.4
 *
 * React hook for using the pose processing Web Worker.
 * Provides easy integration with React components for off-main-thread
 * pose processing.
 *
 * Features:
 * - Automatic worker lifecycle management
 * - Debounced processing to prevent overload
 * - Fallback to main thread if workers unavailable
 * - Performance metrics tracking
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  processLandmarksInWorker,
  calculateAnglesInWorker,
  fuseEnsembleInWorker,
  resetPoseWorker,
  terminatePoseWorkerPool,
  getPoseWorkerPool,
  ProcessedLandmark,
  JointAngleResult,
} from '../services/workers/workerPool';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseWorkerState {
  isProcessing: boolean;
  lastProcessingTime: number;
  averageProcessingTime: number;
  errorCount: number;
  isWorkerAvailable: boolean;
}

export interface PoseWorkerResult {
  processedLandmarks: ProcessedLandmark[];
  jointAngles: JointAngleResult[];
  timestamp: number;
}

export interface UsePoseWorkerOptions {
  /** Enable worker usage (default: true) */
  enabled?: boolean;
  /** Minimum interval between processing calls in ms */
  throttleMs?: number;
  /** Whether to calculate joint angles */
  calculateAngles?: boolean;
  /** Callback when processing completes */
  onResult?: (result: PoseWorkerResult) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

// ============================================================================
// FALLBACK PROCESSING (when workers unavailable)
// ============================================================================

function fallbackProcessLandmarks(landmarks: Landmark[]): ProcessedLandmark[] {
  // Simple pass-through without smoothing
  return landmarks.map((lm) => ({
    ...lm,
    velocity: { x: 0, y: 0, z: 0 },
    smoothed: false,
    confidence: lm.visibility ?? 0.5,
  }));
}

function fallbackCalculateAngle(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (len1 === 0 || len2 === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (len1 * len2)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

function fallbackCalculateAngles(landmarks: Landmark[]): JointAngleResult[] {
  const JOINTS = {
    leftElbow: { p1: 11, p2: 13, p3: 15 },
    rightElbow: { p1: 12, p2: 14, p3: 16 },
    leftKnee: { p1: 23, p2: 25, p3: 27 },
    rightKnee: { p1: 24, p2: 26, p3: 28 },
  };

  const angles: JointAngleResult[] = [];

  for (const [name, indices] of Object.entries(JOINTS)) {
    if (landmarks[indices.p1] && landmarks[indices.p2] && landmarks[indices.p3]) {
      const angle = fallbackCalculateAngle(
        landmarks[indices.p1],
        landmarks[indices.p2],
        landmarks[indices.p3]
      );
      angles.push({ name, angle, confidence: 0.5, velocity: 0 });
    }
  }

  return angles;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function usePoseWorker(options: UsePoseWorkerOptions = {}) {
  const {
    enabled = true,
    throttleMs = 16, // ~60fps
    calculateAngles = true,
    onResult,
    onError,
  } = options;

  const [state, setState] = useState<PoseWorkerState>({
    isProcessing: false,
    lastProcessingTime: 0,
    averageProcessingTime: 0,
    errorCount: 0,
    isWorkerAvailable: typeof Worker !== 'undefined',
  });

  const processingTimesRef = useRef<number[]>([]);
  const lastProcessTimeRef = useRef<number>(0);
  const pendingProcessRef = useRef<boolean>(false);

  // Check if workers are available
  const workersAvailable = useMemo(() => {
    if (typeof Worker === 'undefined') return false;

    try {
      // Try to get the pool (will create if needed)
      getPoseWorkerPool();
      return true;
    } catch {
      return false;
    }
  }, []);

  // Update average processing time
  const updateAverageTime = useCallback((time: number) => {
    processingTimesRef.current.push(time);
    if (processingTimesRef.current.length > 30) {
      processingTimesRef.current.shift();
    }

    const avg =
      processingTimesRef.current.reduce((a, b) => a + b, 0) /
      processingTimesRef.current.length;

    setState((prev) => ({
      ...prev,
      lastProcessingTime: time,
      averageProcessingTime: avg,
    }));
  }, []);

  // Process landmarks
  const processLandmarks = useCallback(
    async (landmarks: Landmark[], deltaTime?: number): Promise<PoseWorkerResult | null> => {
      // Throttle
      const now = Date.now();
      if (now - lastProcessTimeRef.current < throttleMs) {
        return null;
      }

      // Prevent concurrent processing
      if (pendingProcessRef.current) {
        return null;
      }

      lastProcessTimeRef.current = now;
      pendingProcessRef.current = true;

      setState((prev) => ({ ...prev, isProcessing: true }));

      const startTime = performance.now();

      try {
        let processedLandmarks: ProcessedLandmark[];
        let jointAngles: JointAngleResult[] = [];

        if (enabled && workersAvailable) {
          // Use worker
          processedLandmarks = await processLandmarksInWorker(landmarks, deltaTime);

          if (calculateAngles) {
            jointAngles = await calculateAnglesInWorker(landmarks);
          }
        } else {
          // Fallback to main thread
          processedLandmarks = fallbackProcessLandmarks(landmarks);

          if (calculateAngles) {
            jointAngles = fallbackCalculateAngles(landmarks);
          }
        }

        const processingTime = performance.now() - startTime;
        updateAverageTime(processingTime);

        const result: PoseWorkerResult = {
          processedLandmarks,
          jointAngles,
          timestamp: Date.now(),
        };

        onResult?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        logger.error('[usePoseWorker] Processing error:', err.message);

        setState((prev) => ({
          ...prev,
          errorCount: prev.errorCount + 1,
        }));

        onError?.(err);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isProcessing: false }));
        pendingProcessRef.current = false;
      }
    },
    [enabled, workersAvailable, throttleMs, calculateAngles, onResult, onError, updateAverageTime]
  );

  // Fuse ensemble results
  const fuseEnsemble = useCallback(
    async (
      mediapipe?: Landmark[],
      movenet?: Landmark[],
      weights?: { mediapipe: number; movenet: number }
    ): Promise<Landmark[]> => {
      if (!enabled || !workersAvailable) {
        // Simple fallback: use mediapipe if available, else movenet
        return mediapipe || movenet || [];
      }

      try {
        return await fuseEnsembleInWorker(mediapipe, movenet, weights);
      } catch (error) {
        logger.error('[usePoseWorker] Fusion error:', error);
        return mediapipe || movenet || [];
      }
    },
    [enabled, workersAvailable]
  );

  // Reset worker state
  const reset = useCallback(async () => {
    if (workersAvailable) {
      try {
        await resetPoseWorker();
      } catch (error) {
        logger.error('[usePoseWorker] Reset error:', error);
      }
    }

    setState({
      isProcessing: false,
      lastProcessingTime: 0,
      averageProcessingTime: 0,
      errorCount: 0,
      isWorkerAvailable: workersAvailable,
    });

    processingTimesRef.current = [];
  }, [workersAvailable]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't terminate the pool here - it's shared
      // terminatePoseWorkerPool();
    };
  }, []);

  // Update worker availability state
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isWorkerAvailable: workersAvailable,
    }));
  }, [workersAvailable]);

  return {
    processLandmarks,
    fuseEnsemble,
    reset,
    state,
    isWorkerAvailable: workersAvailable,
  };
}

// ============================================================================
// UTILITY HOOK FOR SIMPLE PROCESSING
// ============================================================================

/**
 * Simplified hook that just processes landmarks and returns smoothed results
 */
export function useSmoothedLandmarks(
  landmarks: Landmark[] | null,
  options: { enabled?: boolean; smoothingFactor?: number } = {}
) {
  const { enabled = true } = options;
  const [smoothed, setSmoothed] = useState<ProcessedLandmark[]>([]);
  const { processLandmarks } = usePoseWorker({ enabled, calculateAngles: false });

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    processLandmarks(landmarks).then((result) => {
      if (result) {
        setSmoothed(result.processedLandmarks);
      }
    });
  }, [landmarks, processLandmarks]);

  return smoothed;
}

/**
 * Hook for calculating joint angles from landmarks
 */
export function useJointAngles(
  landmarks: Landmark[] | null,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const [angles, setAngles] = useState<JointAngleResult[]>([]);
  const { processLandmarks } = usePoseWorker({
    enabled,
    calculateAngles: true,
  });

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    processLandmarks(landmarks).then((result) => {
      if (result) {
        setAngles(result.jointAngles);
      }
    });
  }, [landmarks, processLandmarks]);

  return angles;
}

export default usePoseWorker;
