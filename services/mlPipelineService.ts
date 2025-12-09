/**
 * MLPipelineService - Sprint 5.24
 *
 * Machine Learning Pipeline för RehabFlow med:
 * - Modellhantering och caching
 * - Data preprocessing
 * - Feature extraction
 * - Modellträning (on-device)
 * - Inferens och prediktion
 * - Model versioning
 * - A/B testing för modeller
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ModelFormat = 'tfjs' | 'onnx' | 'custom';
export type DataType = 'float32' | 'int32' | 'bool' | 'string';
export type PipelineStage = 'preprocess' | 'feature' | 'inference' | 'postprocess';

export interface ModelConfig {
  id: string;
  name: string;
  version: string;
  format: ModelFormat;
  url?: string;
  inputShape: number[];
  outputShape: number[];
  labels?: string[];
  metadata?: Record<string, unknown>;
}

export interface ModelInstance {
  config: ModelConfig;
  model: unknown;
  loadedAt: number;
  lastUsed: number;
  inferenceCount: number;
}

export interface TensorData {
  data: Float32Array | Int32Array | Uint8Array;
  shape: number[];
  dtype: DataType;
}

export interface PreprocessConfig {
  normalize?: boolean;
  resize?: { width: number; height: number };
  mean?: number[];
  std?: number[];
  grayscale?: boolean;
  flip?: 'horizontal' | 'vertical' | 'both';
}

export interface FeatureExtractorConfig {
  type: 'histogram' | 'hog' | 'sift' | 'embeddings' | 'custom';
  params?: Record<string, unknown>;
}

export interface InferenceResult {
  predictions: number[][];
  labels?: string[];
  confidence: number[];
  latency: number;
  modelVersion: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  stages: PipelineStageConfig[];
  modelId: string;
}

export interface PipelineStageConfig {
  stage: PipelineStage;
  config: PreprocessConfig | FeatureExtractorConfig | Record<string, unknown>;
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: 'sgd' | 'adam' | 'rmsprop';
  lossFunction: 'mse' | 'crossentropy' | 'categorical_crossentropy';
  validationSplit?: number;
  callbacks?: TrainingCallback[];
}

export interface TrainingCallback {
  onEpochEnd?: (epoch: number, logs: TrainingLogs) => void;
  onBatchEnd?: (batch: number, logs: TrainingLogs) => void;
  onTrainingEnd?: (logs: TrainingLogs) => void;
}

export interface TrainingLogs {
  loss: number;
  accuracy?: number;
  valLoss?: number;
  valAccuracy?: number;
  epoch?: number;
  batch?: number;
}

export interface DatasetConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'segmentation';
  features: FeatureConfig[];
  targetColumn: string;
}

export interface FeatureConfig {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'image';
  required: boolean;
  preprocessing?: PreprocessConfig;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  mae?: number;
  confusionMatrix?: number[][];
}

export interface ABTestConfig {
  id: string;
  name: string;
  modelA: string;
  modelB: string;
  splitRatio: number;
  metrics: string[];
  status: 'draft' | 'running' | 'completed';
}

// ============================================================================
// ML PIPELINE SERVICE
// ============================================================================

class MLPipelineService {
  private static instance: MLPipelineService;

  private models: Map<string, ModelInstance> = new Map();
  private pipelines: Map<string, PipelineConfig> = new Map();
  private datasets: Map<string, DatasetConfig> = new Map();
  private abTests: Map<string, ABTestConfig> = new Map();
  private modelCache: Map<string, unknown> = new Map();
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private maxCachedModels: number = 5;

  private constructor() {
    this.loadSavedModels();
  }

  public static getInstance(): MLPipelineService {
    if (!MLPipelineService.instance) {
      MLPipelineService.instance = new MLPipelineService();
    }
    return MLPipelineService.instance;
  }

  // ============================================================================
  // MODEL MANAGEMENT
  // ============================================================================

  /**
   * Ladda modell
   */
  public async loadModel(config: ModelConfig): Promise<boolean> {
    try {
      // Kontrollera cache
      if (this.models.has(config.id)) {
        const instance = this.models.get(config.id)!;
        instance.lastUsed = Date.now();
        return true;
      }

      // Hantera cache-storlek
      if (this.models.size >= this.maxCachedModels) {
        this.evictOldestModel();
      }

      let model: unknown;

      switch (config.format) {
        case 'tfjs':
          model = await this.loadTFJSModel(config);
          break;
        case 'onnx':
          model = await this.loadONNXModel(config);
          break;
        case 'custom':
          model = await this.loadCustomModel(config);
          break;
        default:
          throw new Error(`Okänt modellformat: ${config.format}`);
      }

      const instance: ModelInstance = {
        config,
        model,
        loadedAt: Date.now(),
        lastUsed: Date.now(),
        inferenceCount: 0
      };

      this.models.set(config.id, instance);
      this.emit('modelLoaded', { modelId: config.id });

      console.log(`Modell ${config.name} v${config.version} laddad`);
      return true;
    } catch (error) {
      console.error('Fel vid laddning av modell:', error);
      this.emit('modelError', { modelId: config.id, error });
      return false;
    }
  }

  private async loadTFJSModel(config: ModelConfig): Promise<unknown> {
    // Dynamisk import av TensorFlow.js
    const tf = await import('@tensorflow/tfjs');

    if (config.url) {
      return await tf.loadLayersModel(config.url);
    }

    throw new Error('Modell-URL saknas');
  }

  private async loadONNXModel(config: ModelConfig): Promise<unknown> {
    // ONNX Runtime Web
    // const ort = await import('onnxruntime-web');
    // return await ort.InferenceSession.create(config.url);

    // Placeholder
    console.warn('ONNX-stöd inte implementerat');
    return null;
  }

  private async loadCustomModel(config: ModelConfig): Promise<unknown> {
    // Custom modellformat
    if (config.url) {
      const response = await fetch(config.url);
      return await response.json();
    }
    return null;
  }

  private evictOldestModel(): void {
    let oldest: string | null = null;
    let oldestTime = Date.now();

    for (const [id, instance] of this.models) {
      if (instance.lastUsed < oldestTime) {
        oldestTime = instance.lastUsed;
        oldest = id;
      }
    }

    if (oldest) {
      this.unloadModel(oldest);
    }
  }

  /**
   * Avladda modell
   */
  public async unloadModel(modelId: string): Promise<void> {
    const instance = this.models.get(modelId);
    if (!instance) return;

    // Rensa TensorFlow-minne om tillämpligt
    if (instance.config.format === 'tfjs' && instance.model) {
      try {
        const tf = await import('@tensorflow/tfjs');
        (instance.model as { dispose?: () => void }).dispose?.();
      } catch {
        // Ignorera fel
      }
    }

    this.models.delete(modelId);
    this.emit('modelUnloaded', { modelId });
  }

  /**
   * Hämta laddad modell
   */
  public getModel(modelId: string): ModelInstance | null {
    return this.models.get(modelId) || null;
  }

  /**
   * Lista alla modeller
   */
  public listModels(): ModelConfig[] {
    return Array.from(this.models.values()).map(m => m.config);
  }

  private loadSavedModels(): void {
    try {
      const saved = localStorage.getItem('rehabflow_ml_models');
      if (saved) {
        const configs = JSON.parse(saved) as ModelConfig[];
        // Modeller laddas on-demand, vi sparar bara configs
      }
    } catch {
      // Ignorera fel
    }
  }

  // ============================================================================
  // INFERENCE
  // ============================================================================

  /**
   * Kör inferens
   */
  public async predict(
    modelId: string,
    input: TensorData | number[][] | ImageData
  ): Promise<InferenceResult> {
    const instance = this.models.get(modelId);
    if (!instance) {
      throw new Error(`Modell ${modelId} är inte laddad`);
    }

    const startTime = performance.now();

    // Preprocessa input
    const tensorInput = await this.prepareInput(input, instance.config);

    let predictions: number[][];

    switch (instance.config.format) {
      case 'tfjs':
        predictions = await this.runTFJSInference(instance.model, tensorInput);
        break;
      case 'onnx':
        predictions = await this.runONNXInference(instance.model, tensorInput);
        break;
      default:
        predictions = await this.runCustomInference(instance.model, tensorInput);
    }

    const latency = performance.now() - startTime;
    instance.lastUsed = Date.now();
    instance.inferenceCount++;

    // Beräkna confidence
    const confidence = predictions.map(row =>
      Math.max(...row.map(v => Math.abs(v)))
    );

    const result: InferenceResult = {
      predictions,
      labels: instance.config.labels,
      confidence,
      latency,
      modelVersion: instance.config.version
    };

    this.emit('inference', { modelId, result });

    return result;
  }

  private async prepareInput(
    input: TensorData | number[][] | ImageData,
    config: ModelConfig
  ): Promise<TensorData> {
    if ('data' in input && 'shape' in input) {
      return input as TensorData;
    }

    if (input instanceof ImageData) {
      return this.imageToTensor(input, config.inputShape);
    }

    // number[][]
    const flat = (input as number[][]).flat();
    return {
      data: new Float32Array(flat),
      shape: config.inputShape,
      dtype: 'float32'
    };
  }

  private imageToTensor(imageData: ImageData, targetShape: number[]): TensorData {
    const { width, height, data } = imageData;
    const [targetHeight, targetWidth, channels] = targetShape.slice(1);

    // Enkel resizing och normalisering
    const resized = new Float32Array(targetHeight * targetWidth * channels);

    const scaleX = width / targetWidth;
    const scaleY = height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * targetWidth + x) * channels;

        for (let c = 0; c < channels; c++) {
          resized[dstIdx + c] = data[srcIdx + c] / 255.0;
        }
      }
    }

    return {
      data: resized,
      shape: [1, targetHeight, targetWidth, channels],
      dtype: 'float32'
    };
  }

  private async runTFJSInference(model: unknown, input: TensorData): Promise<number[][]> {
    const tf = await import('@tensorflow/tfjs');

    const tensor = tf.tensor(Array.from(input.data), input.shape);
    const output = (model as { predict: (t: unknown) => unknown }).predict(tensor) as unknown;
    const result = await (output as { array: () => Promise<number[][]> }).array();

    tensor.dispose();
    (output as { dispose: () => void }).dispose();

    return result;
  }

  private async runONNXInference(model: unknown, input: TensorData): Promise<number[][]> {
    // ONNX Runtime implementation
    console.warn('ONNX inferens inte implementerat');
    return [];
  }

  private async runCustomInference(model: unknown, input: TensorData): Promise<number[][]> {
    // Custom modell inferens
    const customModel = model as { predict?: (data: number[]) => number[][] };
    if (customModel.predict) {
      return customModel.predict(Array.from(input.data));
    }
    return [];
  }

  // ============================================================================
  // PREPROCESSING
  // ============================================================================

  /**
   * Preprocessa data
   */
  public preprocess(
    data: number[][] | ImageData,
    config: PreprocessConfig
  ): TensorData {
    if (data instanceof ImageData) {
      return this.preprocessImage(data, config);
    }

    return this.preprocessNumeric(data as number[][], config);
  }

  private preprocessImage(imageData: ImageData, config: PreprocessConfig): TensorData {
    let { width, height, data } = imageData;
    let processedData: Float32Array;

    // Resize
    if (config.resize) {
      const resized = this.resizeImageData(imageData, config.resize.width, config.resize.height);
      width = config.resize.width;
      height = config.resize.height;
      data = resized;
    }

    // Grayscale
    const channels = config.grayscale ? 1 : 3;
    processedData = new Float32Array(width * height * channels);

    for (let i = 0; i < width * height; i++) {
      const srcIdx = i * 4;
      const dstIdx = i * channels;

      if (config.grayscale) {
        processedData[dstIdx] = (data[srcIdx] + data[srcIdx + 1] + data[srcIdx + 2]) / 3;
      } else {
        processedData[dstIdx] = data[srcIdx];
        processedData[dstIdx + 1] = data[srcIdx + 1];
        processedData[dstIdx + 2] = data[srcIdx + 2];
      }
    }

    // Normalize
    if (config.normalize) {
      const mean = config.mean || [0.485, 0.456, 0.406];
      const std = config.std || [0.229, 0.224, 0.225];

      for (let i = 0; i < processedData.length; i++) {
        const c = i % channels;
        processedData[i] = (processedData[i] / 255 - mean[c % mean.length]) / std[c % std.length];
      }
    }

    return {
      data: processedData,
      shape: [1, height, width, channels],
      dtype: 'float32'
    };
  }

  private preprocessNumeric(data: number[][], config: PreprocessConfig): TensorData {
    let processed = data;

    if (config.normalize) {
      processed = this.normalizeNumeric(processed);
    }

    const flat = processed.flat();

    return {
      data: new Float32Array(flat),
      shape: [processed.length, processed[0]?.length || 0],
      dtype: 'float32'
    };
  }

  private normalizeNumeric(data: number[][]): number[][] {
    if (data.length === 0) return data;

    const numCols = data[0].length;
    const mins = new Array(numCols).fill(Infinity);
    const maxs = new Array(numCols).fill(-Infinity);

    // Hitta min/max
    for (const row of data) {
      for (let i = 0; i < numCols; i++) {
        mins[i] = Math.min(mins[i], row[i]);
        maxs[i] = Math.max(maxs[i], row[i]);
      }
    }

    // Normalisera
    return data.map(row =>
      row.map((val, i) => {
        const range = maxs[i] - mins[i];
        return range === 0 ? 0 : (val - mins[i]) / range;
      })
    );
  }

  private resizeImageData(
    imageData: ImageData,
    targetWidth: number,
    targetHeight: number
  ): Uint8ClampedArray {
    const { width, height, data } = imageData;
    const result = new Uint8ClampedArray(targetWidth * targetHeight * 4);

    const scaleX = width / targetWidth;
    const scaleY = height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * targetWidth + x) * 4;

        result[dstIdx] = data[srcIdx];
        result[dstIdx + 1] = data[srcIdx + 1];
        result[dstIdx + 2] = data[srcIdx + 2];
        result[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    return result;
  }

  // ============================================================================
  // FEATURE EXTRACTION
  // ============================================================================

  /**
   * Extrahera features
   */
  public extractFeatures(
    data: TensorData | number[][],
    config: FeatureExtractorConfig
  ): TensorData {
    const inputData = 'data' in data ? Array.from(data.data) : (data as number[][]).flat();

    let features: number[];

    switch (config.type) {
      case 'histogram':
        features = this.computeHistogram(inputData, config.params);
        break;
      case 'hog':
        features = this.computeHOG(inputData, config.params);
        break;
      case 'embeddings':
        features = inputData; // Placeholder
        break;
      default:
        features = inputData;
    }

    return {
      data: new Float32Array(features),
      shape: [1, features.length],
      dtype: 'float32'
    };
  }

  private computeHistogram(
    data: number[],
    params?: Record<string, unknown>
  ): number[] {
    const bins = (params?.bins as number) || 256;
    const histogram = new Array(bins).fill(0);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    for (const value of data) {
      const binIndex = Math.min(
        Math.floor(((value - min) / range) * bins),
        bins - 1
      );
      histogram[binIndex]++;
    }

    // Normalisera
    const total = data.length;
    return histogram.map(v => v / total);
  }

  private computeHOG(
    data: number[],
    params?: Record<string, unknown>
  ): number[] {
    // Förenklad HOG implementation
    const cellSize = (params?.cellSize as number) || 8;
    const bins = (params?.bins as number) || 9;

    // Placeholder - verklig HOG kräver mer komplex beräkning
    return new Array(bins).fill(0).map(() => Math.random());
  }

  // ============================================================================
  // PIPELINES
  // ============================================================================

  /**
   * Skapa pipeline
   */
  public createPipeline(config: PipelineConfig): void {
    this.pipelines.set(config.id, config);
    this.emit('pipelineCreated', { pipeline: config });
  }

  /**
   * Kör pipeline
   */
  public async runPipeline(
    pipelineId: string,
    input: TensorData | number[][] | ImageData
  ): Promise<InferenceResult> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} hittades inte`);
    }

    let currentData: TensorData | number[][] | ImageData = input;

    for (const stage of pipeline.stages) {
      switch (stage.stage) {
        case 'preprocess':
          currentData = this.preprocess(
            currentData as number[][] | ImageData,
            stage.config as PreprocessConfig
          );
          break;

        case 'feature':
          currentData = this.extractFeatures(
            currentData as TensorData | number[][],
            stage.config as FeatureExtractorConfig
          );
          break;

        case 'inference':
          return await this.predict(pipeline.modelId, currentData);

        case 'postprocess':
          // Custom postprocessing
          break;
      }
    }

    // Om ingen inference-stage, kör ändå
    return await this.predict(pipeline.modelId, currentData);
  }

  /**
   * Ta bort pipeline
   */
  public deletePipeline(pipelineId: string): void {
    this.pipelines.delete(pipelineId);
  }

  // ============================================================================
  // ON-DEVICE TRAINING
  // ============================================================================

  /**
   * Träna modell on-device
   */
  public async train(
    modelId: string,
    trainingData: { x: number[][]; y: number[][] },
    config: TrainingConfig
  ): Promise<ModelMetrics> {
    const instance = this.models.get(modelId);
    if (!instance || instance.config.format !== 'tfjs') {
      throw new Error('On-device träning kräver TensorFlow.js-modell');
    }

    const tf = await import('@tensorflow/tfjs');

    const model = instance.model as {
      compile: (config: Record<string, unknown>) => void;
      fit: (x: unknown, y: unknown, config: Record<string, unknown>) => Promise<unknown>;
    };

    // Konfigurera modell
    model.compile({
      optimizer: config.optimizer,
      loss: config.lossFunction,
      metrics: ['accuracy']
    });

    // Skapa tensorer
    const xs = tf.tensor2d(trainingData.x);
    const ys = tf.tensor2d(trainingData.y);

    // Träna
    const history = await model.fit(xs, ys, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationSplit: config.validationSplit,
      callbacks: {
        onEpochEnd: (epoch: number, logs: Record<string, number>) => {
          config.callbacks?.forEach(cb => {
            cb.onEpochEnd?.(epoch, {
              loss: logs.loss,
              accuracy: logs.acc,
              valLoss: logs.val_loss,
              valAccuracy: logs.val_acc,
              epoch
            });
          });
          this.emit('trainingEpoch', { modelId, epoch, logs });
        }
      }
    }) as { history: { loss: number[]; acc?: number[] } };

    // Rensa tensorer
    xs.dispose();
    ys.dispose();

    const finalLoss = history.history.loss[history.history.loss.length - 1];
    const finalAcc = history.history.acc?.[history.history.acc.length - 1];

    const metrics: ModelMetrics = {
      accuracy: finalAcc,
      mse: config.lossFunction === 'mse' ? finalLoss : undefined
    };

    this.emit('trainingComplete', { modelId, metrics });

    return metrics;
  }

  // ============================================================================
  // MODEL EVALUATION
  // ============================================================================

  /**
   * Utvärdera modell
   */
  public async evaluate(
    modelId: string,
    testData: { x: number[][]; y: number[][] }
  ): Promise<ModelMetrics> {
    const predictions: number[][] = [];

    for (const input of testData.x) {
      const result = await this.predict(modelId, [input]);
      predictions.push(result.predictions[0]);
    }

    return this.calculateMetrics(predictions, testData.y);
  }

  private calculateMetrics(predictions: number[][], actual: number[][]): ModelMetrics {
    const n = predictions.length;

    // För klassificering
    let correct = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    // För regression
    let sumSquaredError = 0;
    let sumAbsError = 0;

    for (let i = 0; i < n; i++) {
      const predClass = this.argmax(predictions[i]);
      const actualClass = this.argmax(actual[i]);

      if (predClass === actualClass) {
        correct++;
        if (predClass === 1) truePositives++;
      } else {
        if (predClass === 1) falsePositives++;
        if (actualClass === 1) falseNegatives++;
      }

      // Regression metrics
      for (let j = 0; j < predictions[i].length; j++) {
        const error = predictions[i][j] - actual[i][j];
        sumSquaredError += error * error;
        sumAbsError += Math.abs(error);
      }
    }

    const accuracy = correct / n;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    const totalElements = n * predictions[0].length;
    const mse = sumSquaredError / totalElements;
    const mae = sumAbsError / totalElements;

    return { accuracy, precision, recall, f1Score, mse, mae };
  }

  private argmax(arr: number[]): number {
    return arr.indexOf(Math.max(...arr));
  }

  // ============================================================================
  // A/B TESTING
  // ============================================================================

  /**
   * Starta A/B-test för modeller
   */
  public startABTest(config: ABTestConfig): void {
    config.status = 'running';
    this.abTests.set(config.id, config);
    this.emit('abTestStarted', { test: config });
  }

  /**
   * Välj modell baserat på A/B-test
   */
  public selectModelForABTest(testId: string): string {
    const test = this.abTests.get(testId);
    if (!test || test.status !== 'running') {
      throw new Error('A/B-test hittades inte eller är inte aktiv');
    }

    return Math.random() < test.splitRatio ? test.modelA : test.modelB;
  }

  /**
   * Avsluta A/B-test
   */
  public endABTest(testId: string): void {
    const test = this.abTests.get(testId);
    if (test) {
      test.status = 'completed';
      this.emit('abTestEnded', { test });
    }
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  public on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook för modell
 */
export function useModel(config: ModelConfig) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const service = MLPipelineService.getInstance();

  useEffect(() => {
    setIsLoading(true);
    service.loadModel(config)
      .then(success => {
        setIsLoaded(success);
        if (!success) setError(new Error('Kunde inte ladda modell'));
      })
      .catch(setError)
      .finally(() => setIsLoading(false));

    return () => {
      service.unloadModel(config.id);
    };
  }, [config.id]);

  const predict = useCallback(async (input: TensorData | number[][] | ImageData) => {
    return service.predict(config.id, input);
  }, [config.id]);

  return { isLoaded, isLoading, error, predict };
}

/**
 * Hook för inferens
 */
export function useInference(modelId: string) {
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const service = MLPipelineService.getInstance();

  const run = useCallback(async (input: TensorData | number[][] | ImageData) => {
    setIsRunning(true);
    setError(null);

    try {
      const inferenceResult = await service.predict(modelId, input);
      setResult(inferenceResult);
      return inferenceResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Inference misslyckades'));
      return null;
    } finally {
      setIsRunning(false);
    }
  }, [modelId]);

  return { result, isRunning, error, run };
}

/**
 * Hook för pipeline
 */
export function usePipeline(pipelineId: string) {
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const service = MLPipelineService.getInstance();

  const run = useCallback(async (input: TensorData | number[][] | ImageData) => {
    setIsRunning(true);
    try {
      const pipelineResult = await service.runPipeline(pipelineId, input);
      setResult(pipelineResult);
      return pipelineResult;
    } finally {
      setIsRunning(false);
    }
  }, [pipelineId]);

  return { result, isRunning, run };
}

/**
 * Hook för on-device träning
 */
export function useTraining(modelId: string) {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState<TrainingLogs | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const service = MLPipelineService.getInstance();

  useEffect(() => {
    const unsubscribe = service.on('trainingEpoch', (data: unknown) => {
      const { modelId: id, logs } = data as { modelId: string; logs: TrainingLogs };
      if (id === modelId) {
        setProgress(logs);
      }
    });

    return unsubscribe;
  }, [modelId]);

  const train = useCallback(async (
    data: { x: number[][]; y: number[][] },
    config: TrainingConfig
  ) => {
    setIsTraining(true);
    setProgress(null);

    try {
      const result = await service.train(modelId, data, config);
      setMetrics(result);
      return result;
    } finally {
      setIsTraining(false);
    }
  }, [modelId]);

  return { isTraining, progress, metrics, train };
}

// ============================================================================
// EXPORT
// ============================================================================

export const mlPipelineService = MLPipelineService.getInstance();
export default mlPipelineService;
