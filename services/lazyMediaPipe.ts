/**
 * Lazy MediaPipe Loader
 *
 * Defers loading of heavy ML libraries (~1.6MB) until they're actually needed.
 * This improves initial page load time significantly.
 */

import { logger } from '../utils/logger';

// Type definitions for MediaPipe
export interface MediaPipeModules {
  poseLib: typeof import('@mediapipe/pose');
  cameraUtils: typeof import('@mediapipe/camera_utils');
  drawingUtils: typeof import('@mediapipe/drawing_utils');
}

// Singleton cache for loaded modules
let cachedModules: MediaPipeModules | null = null;
let loadingPromise: Promise<MediaPipeModules> | null = null;

/**
 * Lazy loads MediaPipe modules only when needed
 * Uses singleton pattern to avoid multiple loads
 */
export async function loadMediaPipeModules(): Promise<MediaPipeModules> {
  // Return cached modules if already loaded
  if (cachedModules) {
    return cachedModules;
  }

  // If already loading, wait for that promise
  if (loadingPromise) {
    return loadingPromise;
  }

  logger.info('Loading MediaPipe modules...');
  const startTime = performance.now();

  loadingPromise = Promise.all([
    import('@mediapipe/pose'),
    import('@mediapipe/camera_utils'),
    import('@mediapipe/drawing_utils')
  ]).then(([poseLib, cameraUtils, drawingUtils]) => {
    cachedModules = { poseLib, cameraUtils, drawingUtils };
    const loadTime = Math.round(performance.now() - startTime);
    logger.info(`MediaPipe modules loaded in ${loadTime}ms`);
    return cachedModules;
  }).catch((error) => {
    loadingPromise = null;
    logger.error('Failed to load MediaPipe modules', error);
    throw error;
  });

  return loadingPromise;
}

/**
 * Check if MediaPipe modules are already loaded
 */
export function isMediaPipeLoaded(): boolean {
  return cachedModules !== null;
}

/**
 * Preload MediaPipe modules in background (optional)
 * Call this when user hovers over a button that will use pose detection
 */
export function preloadMediaPipe(): void {
  if (!cachedModules && !loadingPromise) {
    loadMediaPipeModules().catch(() => {
      // Ignore errors during preload
    });
  }
}

/**
 * Get cached modules synchronously (returns null if not loaded)
 */
export function getCachedMediaPipe(): MediaPipeModules | null {
  return cachedModules;
}
