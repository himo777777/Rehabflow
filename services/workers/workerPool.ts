/**
 * Worker Pool Service - Sprint 5.4
 *
 * Manages Web Workers lifecycle with pooling for optimal performance.
 * Features:
 * - Lazy worker initialization
 * - Worker reuse and pooling
 * - Automatic cleanup on idle
 * - Promise-based request/response
 * - Timeout handling
 * - Error recovery
 */

import { logger } from '../../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface WorkerMessage {
  type: string;
  id: number;
  data?: unknown;
}

export interface WorkerResponse {
  type: 'RESULT' | 'ERROR' | 'READY';
  id: number;
  data?: unknown;
  error?: string;
  processingTime: number;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
  startTime: number;
}

export interface WorkerPoolConfig {
  /** Maximum number of workers in the pool */
  maxWorkers: number;
  /** Timeout for requests in ms */
  requestTimeout: number;
  /** Time before idle workers are terminated */
  idleTimeout: number;
  /** Whether to log performance metrics */
  logPerformance: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: WorkerPoolConfig = {
  maxWorkers: navigator.hardwareConcurrency || 4,
  requestTimeout: 5000,
  idleTimeout: 30000,
  logPerformance: false,
};

// ============================================================================
// WORKER WRAPPER
// ============================================================================

class WorkerWrapper {
  public worker: Worker;
  public isBusy: boolean = false;
  public lastUsed: number = Date.now();
  public isReady: boolean = false;

  private pendingRequests: Map<number, PendingRequest> = new Map();
  private readyPromise: Promise<void>;
  private readyResolve!: () => void;
  private onTerminate: () => void;

  constructor(
    workerUrl: URL,
    private config: WorkerPoolConfig,
    onTerminate: () => void
  ) {
    this.onTerminate = onTerminate;

    // Create ready promise
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });

    // Create worker
    this.worker = new Worker(workerUrl, { type: 'module' });

    // Handle messages
    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);
  }

  private handleMessage(event: MessageEvent<WorkerResponse>): void {
    const { type, id, data, error, processingTime } = event.data;

    if (type === 'READY') {
      this.isReady = true;
      this.readyResolve();
      return;
    }

    const pending = this.pendingRequests.get(id);
    if (!pending) {
      logger.warn('[WorkerPool] Received response for unknown request:', id);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(id);

    if (this.config.logPerformance) {
      const totalTime = Date.now() - pending.startTime;
      logger.debug(`[WorkerPool] Request ${id} completed in ${totalTime}ms (processing: ${processingTime.toFixed(2)}ms)`);
    }

    if (type === 'ERROR') {
      pending.reject(new Error(error || 'Worker error'));
    } else {
      pending.resolve(data);
    }

    this.isBusy = this.pendingRequests.size > 0;
    this.lastUsed = Date.now();
  }

  private handleError(event: ErrorEvent): void {
    logger.error('[WorkerPool] Worker error:', event.message);

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(`Worker error: ${event.message}`));
      this.pendingRequests.delete(id);
    }

    this.isBusy = false;
    this.onTerminate();
  }

  public async waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  public send<T>(type: string, data?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      const startTime = Date.now();

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Worker request timed out after ${this.config.requestTimeout}ms`));
        this.isBusy = this.pendingRequests.size > 0;
      }, this.config.requestTimeout);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
        startTime,
      });

      this.isBusy = true;
      this.worker.postMessage({ type, id, data } as WorkerMessage);
    });
  }

  public terminate(): void {
    // Clear pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();

    this.worker.terminate();
    this.onTerminate();
  }

  public getIdleTime(): number {
    return Date.now() - this.lastUsed;
  }
}

// ============================================================================
// WORKER POOL
// ============================================================================

export class WorkerPool {
  private workers: WorkerWrapper[] = [];
  private workerUrl: URL;
  private config: WorkerPoolConfig;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(workerPath: string, config: Partial<WorkerPoolConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.workerUrl = new URL(workerPath, import.meta.url);

    // Start cleanup interval
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleWorkers();
    }, 10000); // Check every 10 seconds
  }

  private cleanupIdleWorkers(): void {
    const now = Date.now();
    const toRemove: WorkerWrapper[] = [];

    for (const wrapper of this.workers) {
      if (!wrapper.isBusy && wrapper.getIdleTime() > this.config.idleTimeout) {
        toRemove.push(wrapper);
      }
    }

    for (const wrapper of toRemove) {
      logger.debug('[WorkerPool] Terminating idle worker');
      wrapper.terminate();
    }
  }

  private removeWorker(wrapper: WorkerWrapper): void {
    const index = this.workers.indexOf(wrapper);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }
  }

  private async getAvailableWorker(): Promise<WorkerWrapper> {
    // Find an idle worker
    let worker = this.workers.find((w) => !w.isBusy && w.isReady);

    // Create new worker if none available and under limit
    if (!worker && this.workers.length < this.config.maxWorkers) {
      worker = new WorkerWrapper(
        this.workerUrl,
        this.config,
        () => this.removeWorker(worker!)
      );
      this.workers.push(worker);
      await worker.waitForReady();
      logger.debug(`[WorkerPool] Created new worker (total: ${this.workers.length})`);
    }

    // If still no worker, use the least busy one
    if (!worker) {
      worker = this.workers.reduce((a, b) =>
        a.lastUsed < b.lastUsed ? a : b
      );
    }

    return worker;
  }

  /**
   * Send a message to a worker and get a response
   */
  public async send<T>(type: string, data?: unknown): Promise<T> {
    const worker = await this.getAvailableWorker();
    return worker.send<T>(type, data);
  }

  /**
   * Get pool statistics
   */
  public getStats(): {
    totalWorkers: number;
    busyWorkers: number;
    idleWorkers: number;
  } {
    const busyWorkers = this.workers.filter((w) => w.isBusy).length;
    return {
      totalWorkers: this.workers.length,
      busyWorkers,
      idleWorkers: this.workers.length - busyWorkers,
    };
  }

  /**
   * Terminate all workers
   */
  public terminate(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];

    logger.debug('[WorkerPool] All workers terminated');
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<WorkerPoolConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// SINGLETON POSE WORKER POOL
// ============================================================================

let poseWorkerPool: WorkerPool | null = null;

/**
 * Get or create the pose processing worker pool
 */
export function getPoseWorkerPool(): WorkerPool {
  if (!poseWorkerPool) {
    poseWorkerPool = new WorkerPool('./poseProcessingWorker.ts', {
      maxWorkers: 2, // Pose processing doesn't need many workers
      requestTimeout: 100, // Should be fast
      idleTimeout: 60000, // Keep alive for 1 minute
      logPerformance: process.env.NODE_ENV === 'development',
    });
  }
  return poseWorkerPool;
}

/**
 * Terminate the pose worker pool
 */
export function terminatePoseWorkerPool(): void {
  if (poseWorkerPool) {
    poseWorkerPool.terminate();
    poseWorkerPool = null;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export interface ProcessedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  velocity: { x: number; y: number; z: number };
  smoothed: boolean;
  confidence: number;
}

export interface JointAngleResult {
  name: string;
  angle: number;
  confidence: number;
  velocity: number;
}

/**
 * Process landmarks using the worker pool
 */
export async function processLandmarksInWorker(
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>,
  deltaTime?: number
): Promise<ProcessedLandmark[]> {
  const pool = getPoseWorkerPool();
  return pool.send<ProcessedLandmark[]>('PROCESS_LANDMARKS', { landmarks, deltaTime });
}

/**
 * Calculate joint angles using the worker pool
 */
export async function calculateAnglesInWorker(
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>
): Promise<JointAngleResult[]> {
  const pool = getPoseWorkerPool();
  return pool.send<JointAngleResult[]>('CALCULATE_ANGLES', { landmarks });
}

/**
 * Fuse ensemble model results using the worker pool
 */
export async function fuseEnsembleInWorker(
  mediapipe?: Array<{ x: number; y: number; z: number; visibility?: number }>,
  movenet?: Array<{ x: number; y: number; z: number; visibility?: number }>,
  weights: { mediapipe: number; movenet: number } = { mediapipe: 0.6, movenet: 0.4 }
): Promise<Array<{ x: number; y: number; z: number; visibility?: number }>> {
  const pool = getPoseWorkerPool();
  return pool.send('FUSE_ENSEMBLE', { mediapipe, movenet, weights });
}

/**
 * Reset worker state
 */
export async function resetPoseWorker(): Promise<void> {
  const pool = getPoseWorkerPool();
  await pool.send('RESET');
}

export default {
  WorkerPool,
  getPoseWorkerPool,
  terminatePoseWorkerPool,
  processLandmarksInWorker,
  calculateAnglesInWorker,
  fuseEnsembleInWorker,
  resetPoseWorker,
};
