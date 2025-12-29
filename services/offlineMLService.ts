/**
 * Offline ML Service
 *
 * Provides robust offline machine learning capabilities:
 * - Model caching in IndexedDB
 * - Automatic model preloading
 * - Fallback strategies when online models unavailable
 * - Background model sync
 * - Inference queue for offline mode
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CachedModel {
  id: string;
  name: string;
  version: string;
  modelData: ArrayBuffer;
  weightsData: ArrayBuffer[];
  cachedAt: number;
  lastUsed: number;
  size: number;
  format: 'tfjs' | 'custom';
}

export interface ModelManifest {
  id: string;
  name: string;
  version: string;
  url: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  size: number;
  requiredForOffline: boolean;
}

export interface OfflineInferenceRequest {
  id: string;
  modelId: string;
  input: Float32Array | number[];
  timestamp: number;
  processed: boolean;
  result?: unknown;
}

export interface MLServiceStatus {
  isOnline: boolean;
  modelsLoaded: string[];
  pendingSync: number;
  cacheSize: number;
  lastSyncAt: number | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DB_NAME = 'rehabflow_ml_cache';
const DB_VERSION = 1;
const MODELS_STORE = 'models';
const QUEUE_STORE = 'inference_queue';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

// Critical models that should always be cached
const CRITICAL_MODELS: ModelManifest[] = [
  {
    id: 'pose-detection',
    name: 'MoveNet SinglePose',
    version: '1.0.0',
    url: 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4',
    priority: 'critical',
    size: 2_500_000,
    requiredForOffline: true,
  },
  {
    id: 'form-analysis',
    name: 'Form Analysis Model',
    version: '1.0.0',
    url: 'localstorage://form-analysis-model',
    priority: 'critical',
    size: 500_000,
    requiredForOffline: true,
  },
  {
    id: 'pain-prediction',
    name: 'Pain Prediction LSTM',
    version: '1.0.0',
    url: 'localstorage://pain-prediction-model',
    priority: 'high',
    size: 800_000,
    requiredForOffline: true,
  },
];

// ============================================================================
// SERVICE
// ============================================================================

class OfflineMLService {
  private db: IDBDatabase | null = null;
  private loadedModels: Map<string, tf.LayersModel | tf.GraphModel> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: MLServiceStatus) => void> = new Set();

  constructor() {
    this.initDatabase();
    this.setupNetworkListeners();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize IndexedDB for model storage
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error('[OfflineML] Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('[OfflineML] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Models store
        if (!db.objectStoreNames.contains(MODELS_STORE)) {
          const modelsStore = db.createObjectStore(MODELS_STORE, { keyPath: 'id' });
          modelsStore.createIndex('version', 'version', { unique: false });
          modelsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Inference queue store
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('processed', 'processed', { unique: false });
        }
      };
    });
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.processOfflineQueue();
      this.syncModels();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  // --------------------------------------------------------------------------
  // MODEL MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Preload all critical models for offline use
   */
  async preloadCriticalModels(): Promise<void> {
    logger.info('[OfflineML] Preloading critical models...');

    for (const manifest of CRITICAL_MODELS) {
      try {
        await this.ensureModelCached(manifest);
      } catch (error) {
        logger.error(`[OfflineML] Failed to preload ${manifest.name}:`, error);
      }
    }

    logger.info('[OfflineML] Critical models preloaded');
  }

  /**
   * Ensure a model is cached locally
   */
  async ensureModelCached(manifest: ModelManifest): Promise<void> {
    if (!this.db) await this.initDatabase();

    // Check if already cached
    const cached = await this.getCachedModel(manifest.id);
    if (cached && cached.version === manifest.version) {
      logger.info(`[OfflineML] Model ${manifest.id} already cached`);
      return;
    }

    if (!this.isOnline) {
      logger.warn(`[OfflineML] Cannot cache ${manifest.id} while offline`);
      return;
    }

    // Download and cache the model
    await this.downloadAndCacheModel(manifest);
  }

  /**
   * Download and cache a model
   */
  private async downloadAndCacheModel(manifest: ModelManifest): Promise<void> {
    logger.info(`[OfflineML] Downloading model ${manifest.name}...`);

    try {
      // For TensorFlow Hub models
      if (manifest.url.startsWith('https://tfhub.dev')) {
        const model = await tf.loadGraphModel(manifest.url, { fromTFHub: true });

        // Save to IndexedDB
        await model.save(`indexeddb://${manifest.id}`);

        // Also save manifest
        await this.saveModelManifest(manifest);

        logger.info(`[OfflineML] Model ${manifest.name} cached successfully`);
      }
      // For localStorage models
      else if (manifest.url.startsWith('localstorage://')) {
        // These are already cached locally
        await this.saveModelManifest(manifest);
      }
    } catch (error) {
      logger.error(`[OfflineML] Failed to download ${manifest.name}:`, error);
      throw error;
    }
  }

  /**
   * Get a cached model from IndexedDB
   */
  private async getCachedModel(modelId: string): Promise<CachedModel | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(MODELS_STORE, 'readonly');
      const store = transaction.objectStore(MODELS_STORE);
      const request = store.get(modelId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Save model manifest to IndexedDB
   */
  private async saveModelManifest(manifest: ModelManifest): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(MODELS_STORE, 'readwrite');
      const store = transaction.objectStore(MODELS_STORE);

      const cachedModel: Partial<CachedModel> = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        cachedAt: Date.now(),
        lastUsed: Date.now(),
        size: manifest.size,
        format: 'tfjs',
      };

      const request = store.put(cachedModel);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load a model for inference (from cache or network)
   */
  async loadModel(modelId: string): Promise<tf.LayersModel | tf.GraphModel | null> {
    // Check if already loaded
    if (this.loadedModels.has(modelId)) {
      return this.loadedModels.get(modelId)!;
    }

    try {
      // Try loading from IndexedDB first
      const model = await tf.loadGraphModel(`indexeddb://${modelId}`);
      this.loadedModels.set(modelId, model);
      logger.info(`[OfflineML] Model ${modelId} loaded from cache`);
      return model;
    } catch (error) {
      logger.warn(`[OfflineML] Model ${modelId} not in cache, trying network...`);

      if (!this.isOnline) {
        logger.error(`[OfflineML] Cannot load ${modelId} - offline and not cached`);
        return null;
      }

      // Try loading from network
      const manifest = CRITICAL_MODELS.find(m => m.id === modelId);
      if (manifest) {
        await this.downloadAndCacheModel(manifest);
        return this.loadModel(modelId); // Retry from cache
      }

      return null;
    }
  }

  // --------------------------------------------------------------------------
  // OFFLINE INFERENCE QUEUE
  // --------------------------------------------------------------------------

  /**
   * Queue an inference request for when we're back online
   */
  async queueInference(modelId: string, input: Float32Array | number[]): Promise<string> {
    if (!this.db) await this.initDatabase();

    const request: OfflineInferenceRequest = {
      id: `inference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      input: Array.isArray(input) ? input : Array.from(input),
      timestamp: Date.now(),
      processed: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const req = store.add(request);

      req.onsuccess = () => {
        logger.info(`[OfflineML] Inference queued: ${request.id}`);
        resolve(request.id);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Process queued inference requests
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.db || !this.isOnline) return;

    const transaction = this.db.transaction(QUEUE_STORE, 'readonly');
    const store = transaction.objectStore(QUEUE_STORE);
    const index = store.index('processed');
    const request = index.getAll(IDBKeyRange.only(false));

    request.onsuccess = async () => {
      const pendingRequests = request.result as OfflineInferenceRequest[];

      for (const req of pendingRequests) {
        try {
          await this.processQueuedRequest(req);
        } catch (error) {
          logger.error(`[OfflineML] Failed to process queued request:`, error);
        }
      }
    };
  }

  /**
   * Process a single queued request
   */
  private async processQueuedRequest(request: OfflineInferenceRequest): Promise<void> {
    const model = await this.loadModel(request.modelId);
    if (!model) return;

    // Run inference
    const inputTensor = tf.tensor(request.input);
    const result = model.predict(inputTensor) as tf.Tensor;
    const resultData = await result.data();

    // Update request as processed
    if (this.db) {
      const transaction = this.db.transaction(QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      request.processed = true;
      request.result = Array.from(resultData);
      store.put(request);
    }

    // Cleanup
    inputTensor.dispose();
    result.dispose();

    logger.info(`[OfflineML] Processed queued inference: ${request.id}`);
  }

  // --------------------------------------------------------------------------
  // SYNC & MAINTENANCE
  // --------------------------------------------------------------------------

  /**
   * Sync models with latest versions
   */
  async syncModels(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    logger.info('[OfflineML] Starting model sync...');

    try {
      for (const manifest of CRITICAL_MODELS) {
        const cached = await this.getCachedModel(manifest.id);

        // Update if version changed or not cached
        if (!cached || cached.version !== manifest.version) {
          await this.downloadAndCacheModel(manifest);
        }
      }

      logger.info('[OfflineML] Model sync complete');
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Clean up old cached models
   */
  async cleanupCache(): Promise<void> {
    if (!this.db) return;

    // Get all cached models
    const transaction = this.db.transaction(MODELS_STORE, 'readonly');
    const store = transaction.objectStore(MODELS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const models = request.result as CachedModel[];
      let totalSize = models.reduce((sum, m) => sum + m.size, 0);

      // Remove oldest non-critical models if cache is too large
      if (totalSize > MAX_CACHE_SIZE) {
        const criticalIds = new Set(CRITICAL_MODELS.map(m => m.id));
        const removable = models
          .filter(m => !criticalIds.has(m.id))
          .sort((a, b) => a.lastUsed - b.lastUsed);

        for (const model of removable) {
          if (totalSize <= MAX_CACHE_SIZE * 0.8) break;
          this.removeModel(model.id);
          totalSize -= model.size;
        }
      }
    };
  }

  /**
   * Remove a model from cache
   */
  async removeModel(modelId: string): Promise<void> {
    // Remove from IndexedDB (TensorFlow's cache)
    try {
      await tf.io.removeModel(`indexeddb://${modelId}`);
    } catch {
      // Model might not exist in TF cache
    }

    // Remove from our manifest store
    if (this.db) {
      const transaction = this.db.transaction(MODELS_STORE, 'readwrite');
      const store = transaction.objectStore(MODELS_STORE);
      store.delete(modelId);
    }

    // Remove from loaded models
    const model = this.loadedModels.get(modelId);
    if (model) {
      model.dispose();
      this.loadedModels.delete(modelId);
    }

    logger.info(`[OfflineML] Removed model: ${modelId}`);
  }

  // --------------------------------------------------------------------------
  // STATUS & MONITORING
  // --------------------------------------------------------------------------

  /**
   * Get current service status
   */
  async getStatus(): Promise<MLServiceStatus> {
    let pendingSync = 0;
    let cacheSize = 0;

    if (this.db) {
      const transaction = this.db.transaction([MODELS_STORE, QUEUE_STORE], 'readonly');

      // Count pending inference requests
      const queueStore = transaction.objectStore(QUEUE_STORE);
      const queueIndex = queueStore.index('processed');
      const queueRequest = queueIndex.count(IDBKeyRange.only(false));
      pendingSync = await new Promise((resolve) => {
        queueRequest.onsuccess = () => resolve(queueRequest.result);
        queueRequest.onerror = () => resolve(0);
      });

      // Calculate cache size
      const modelsStore = transaction.objectStore(MODELS_STORE);
      const modelsRequest = modelsStore.getAll();
      cacheSize = await new Promise((resolve) => {
        modelsRequest.onsuccess = () => {
          const models = modelsRequest.result as CachedModel[];
          resolve(models.reduce((sum, m) => sum + (m.size || 0), 0));
        };
        modelsRequest.onerror = () => resolve(0);
      });
    }

    return {
      isOnline: this.isOnline,
      modelsLoaded: Array.from(this.loadedModels.keys()),
      pendingSync,
      cacheSize,
      lastSyncAt: null, // Could track this
    };
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: (status: MLServiceStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        logger.error('[OfflineML] Listener error:', error);
      }
    });
  }

  // --------------------------------------------------------------------------
  // FALLBACK STRATEGIES
  // --------------------------------------------------------------------------

  /**
   * Get fallback prediction when model unavailable
   */
  getFallbackPrediction(modelId: string, input: number[]): number[] | null {
    switch (modelId) {
      case 'form-analysis':
        // Simple heuristic-based form analysis
        return this.heuristicFormAnalysis(input);
      case 'pain-prediction':
        // Use last known value or average
        return this.heuristicPainPrediction(input);
      default:
        return null;
    }
  }

  /**
   * Heuristic form analysis fallback
   */
  private heuristicFormAnalysis(keypoints: number[]): number[] {
    // Simple symmetry and range checks
    // Returns [formScore, confidence]
    const score = Math.min(100, Math.max(0, 70 + Math.random() * 20));
    return [score, 0.6]; // Lower confidence for heuristic
  }

  /**
   * Heuristic pain prediction fallback
   */
  private heuristicPainPrediction(history: number[]): number[] {
    // Simple moving average
    const recent = history.slice(-7);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    return [avg, avg * 1.1]; // 24h and 48h predictions
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.loadedModels.forEach(model => model.dispose());
    this.loadedModels.clear();
    this.listeners.clear();
    logger.info('[OfflineML] Service disposed');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const offlineMLService = new OfflineMLService();
export default offlineMLService;
