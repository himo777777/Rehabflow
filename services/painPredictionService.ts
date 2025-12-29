/**
 * Pain Prediction Service
 *
 * Machine learning service that predicts pain flare-ups 24-48 hours in advance
 * based on historical pain patterns, movement quality, sleep, activity, and other factors.
 *
 * Features:
 * - LSTM model for time-series pain prediction
 * - Multi-factor analysis (pain, movement, sleep, activity, stress)
 * - 24-hour and 48-hour forecasts with confidence intervals
 * - Risk stratification (low, moderate, high, critical)
 * - Preventive action recommendations
 *
 * @module painPredictionService
 */

import * as tf from '@tensorflow/tfjs';
import { supabase } from './supabaseClient';
import { healthDataService, HealthDataType } from './healthDataService';
import { logger } from '../utils/logger';
import { cachingService } from './cachingService';

// Cache TTL for predictions (12 hours - predictions change slowly)
const PREDICTION_CACHE_TTL = 12 * 60 * 60 * 1000;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PainDataPoint {
  timestamp: Date;
  painLevel: number; // 0-10
  location: string;
  character?: string; // 'sharp', 'aching', 'burning', etc.
  triggers?: string[];
}

export interface PredictionInput {
  painHistory: number[]; // Last 7-14 days of pain scores
  movementQualityScores: number[]; // Rep scores from exercises
  adherenceRate: number; // 0-1
  sleepHours: number[];
  activityLevels: number[]; // Steps or active minutes
  stressLevels?: number[]; // If available
  weatherData?: {
    pressure: number;
    temperature: number;
    humidity: number;
  };
  // Enhanced factors
  medicationTaken?: boolean[];
  menstrualCycleDay?: number;
  moodScores?: number[];
  timeOfDayPatterns?: number[]; // 0-23 hour pain peaks
}

export interface PainPattern {
  type: 'cyclical' | 'trigger-based' | 'progressive' | 'stable';
  cycleLength?: number; // Days for cyclical patterns
  peakDays?: number[]; // Day of week (0-6)
  peakHours?: number[]; // Hour of day (0-23)
  triggers: string[];
  confidence: number;
}

export interface EnhancedPrediction extends PainPrediction {
  patterns: PainPattern[];
  weatherImpact: {
    score: number;
    description: string;
  } | null;
  personalizedInsights: string[];
  suggestedPreventiveActions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    timing: string;
    effectiveness: number; // 0-1 estimated
  }[];
}

export interface PainPrediction {
  timestamp: Date;
  horizon: 24 | 48; // Hours ahead
  predictedPain: number; // 0-10
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidence: number; // 0-1
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  contributingFactors: {
    factor: string;
    impact: number; // -1 to 1 (negative = increases pain)
    confidence: number;
  }[];
  recommendations: string[];
}

export interface PainTrendAnalysis {
  trend: 'improving' | 'stable' | 'worsening';
  averagePain: number;
  volatility: number; // Standard deviation
  flareUpFrequency: number; // Per week
  lastFlareUp?: Date;
  predictedNextFlareUp?: Date;
}

// ============================================================================
// PAIN PREDICTION SERVICE
// ============================================================================

export class PainPredictionService {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;
  private modelVersion: string = 'v1.0.0';
  private readonly sequenceLength: number = 14; // 14 days of history
  private readonly predictionHorizons: [24, 48] = [24, 48];

  constructor() {}

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize the pain prediction model
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('🧠 Initializing Pain Prediction Model...');

      // Try to load pre-trained model from storage
      try {
        this.model = await tf.loadLayersModel('localstorage://pain-prediction-model');
        logger.info('✅ Loaded pre-trained model from storage');
      } catch (error) {
        // If no pre-trained model, create and initialize a new one
        logger.info('Creating new pain prediction model...');
        this.model = this.createModel();
        await this.trainInitialModel();
      }

      this.isInitialized = true;
      logger.info('✅ Pain Prediction Model initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize pain prediction model:', error);
      throw error;
    }
  }

  /**
   * Create the neural network architecture
   */
  private createModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input shape: [sequenceLength, features]
    // Features: pain, movement quality, adherence, sleep, activity, stress
    const featureCount = 6;

    // LSTM layer for time-series analysis
    model.add(tf.layers.lstm({
      units: 64,
      returnSequences: true,
      inputShape: [this.sequenceLength, featureCount]
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Second LSTM layer
    model.add(tf.layers.lstm({
      units: 32,
      returnSequences: false
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Dense layers for final prediction
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));

    model.add(tf.layers.dense({
      units: 2, // Predict for 24h and 48h
      activation: 'linear'
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    logger.info('✅ Pain prediction model created');
    return model;
  }

  /**
   * Train initial model with synthetic/population data
   */
  private async trainInitialModel(): Promise<void> {
    if (!this.model) return;

    logger.info('Training initial model with population data...');

    // Generate synthetic training data based on typical pain patterns
    const { inputs, outputs } = this.generateSyntheticTrainingData(100);

    await this.model.fit(inputs, outputs, {
      epochs: 50,
      batchSize: 16,
      validationSplit: 0.2,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            logger.info(`Epoch ${epoch}: loss=${logs?.loss.toFixed(4)}`);
          }
        }
      }
    });

    // Save model to local storage
    await this.model.save('localstorage://pain-prediction-model');
    logger.info('✅ Initial model training complete');
  }

  /**
   * Generate synthetic training data based on pain patterns
   */
  private generateSyntheticTrainingData(samples: number): {
    inputs: tf.Tensor3D;
    outputs: tf.Tensor2D;
  } {
    const inputData: number[][][] = [];
    const outputData: number[][] = [];

    for (let i = 0; i < samples; i++) {
      const sequence: number[][] = [];
      const basePain = Math.random() * 5 + 2; // Base pain 2-7
      const trend = (Math.random() - 0.5) * 0.3; // Gradual trend

      for (let day = 0; day < this.sequenceLength; day++) {
        const dayPain = Math.max(0, Math.min(10,
          basePain + trend * day + (Math.random() - 0.5) * 2
        ));

        const movementQuality = Math.max(0, Math.min(100,
          80 - dayPain * 5 + (Math.random() - 0.5) * 10
        ));

        const adherence = Math.max(0, Math.min(1,
          0.8 - dayPain * 0.05 + (Math.random() - 0.5) * 0.2
        ));

        const sleep = Math.max(4, Math.min(10,
          7.5 - dayPain * 0.3 + (Math.random() - 0.5) * 1
        ));

        const activity = Math.max(0, Math.min(15000,
          8000 - dayPain * 500 + (Math.random() - 0.5) * 2000
        ));

        const stress = Math.max(0, Math.min(10,
          dayPain * 0.6 + (Math.random() - 0.5) * 2
        ));

        sequence.push([
          dayPain / 10,           // Normalize 0-1
          movementQuality / 100,
          adherence,
          sleep / 10,
          activity / 15000,
          stress / 10
        ]);
      }

      // Predict next day pain (24h and 48h)
      const lastPain = sequence[sequence.length - 1][0] * 10;
      const pain24h = Math.max(0, Math.min(10, lastPain + trend * 1 + (Math.random() - 0.5)));
      const pain48h = Math.max(0, Math.min(10, lastPain + trend * 2 + (Math.random() - 0.5)));

      inputData.push(sequence);
      outputData.push([pain24h / 10, pain48h / 10]); // Normalized
    }

    const inputs = tf.tensor3d(inputData);
    const outputs = tf.tensor2d(outputData);

    return { inputs, outputs };
  }

  // --------------------------------------------------------------------------
  // PREDICTION
  // --------------------------------------------------------------------------

  /**
   * Predict pain for next 24h and 48h
   * Results are cached for 12 hours to reduce TensorFlow computation
   */
  public async predict(userId: string): Promise<{
    prediction24h: PainPrediction;
    prediction48h: PainPrediction;
    trendAnalysis: PainTrendAnalysis;
  } | null> {
    if (!this.isInitialized || !this.model) {
      logger.warn('Pain prediction model not initialized');
      return null;
    }

    // Check cache first
    const cacheKey = `pain-prediction:${userId}:${new Date().toISOString().split('T')[0]}`; // Cache per day
    try {
      const cached = await cachingService.get<{
        prediction24h: PainPrediction;
        prediction48h: PainPrediction;
        trendAnalysis: PainTrendAnalysis;
      }>(cacheKey);

      if (cached) {
        logger.info('[PainPrediction] Using cached prediction for user:', userId);
        return cached;
      }
    } catch {
      // Continue with fresh prediction if cache fails
    }

    try {
      // Gather input data
      const inputData = await this.gatherPredictionInput(userId);
      if (!inputData) {
        logger.warn('Insufficient data for pain prediction');
        return null;
      }

      // Prepare features tensor
      const features = this.prepareFeaturesForPrediction(inputData);

      // Make prediction
      const prediction = this.model.predict(features) as tf.Tensor2D;
      const predictionData = await prediction.data();

      // Clean up tensors
      features.dispose();
      prediction.dispose();

      // Extract predictions
      const pain24h = predictionData[0] * 10; // Denormalize
      const pain48h = predictionData[1] * 10;

      // Calculate confidence intervals and risk levels
      const prediction24 = this.createPredictionObject(
        pain24h,
        24,
        inputData
      );

      const prediction48 = this.createPredictionObject(
        pain48h,
        48,
        inputData
      );

      // Analyze trends
      const trendAnalysis = this.analyzePainTrends(inputData.painHistory);

      // Store predictions for future model improvement
      await this.storePrediction(userId, prediction24, prediction48);

      const result = {
        prediction24h: prediction24,
        prediction48h: prediction48,
        trendAnalysis
      };

      // Cache the result for 12 hours
      try {
        await cachingService.set(cacheKey, result, {
          ttl: PREDICTION_CACHE_TTL,
          tags: ['prediction', 'pain', userId],
        });
        logger.info('[PainPrediction] Cached prediction for user:', userId);
      } catch {
        // Non-critical - continue even if cache fails
      }

      return result;
    } catch (error) {
      logger.error('❌ Pain prediction failed:', error);
      return null;
    }
  }

  /**
   * Gather all input data for prediction
   */
  private async gatherPredictionInput(userId: string): Promise<PredictionInput | null> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - this.sequenceLength * 24 * 60 * 60 * 1000);

      // Fetch pain history from database
      const { data: painData, error: painError } = await supabase
        .from('pain_tracking')
        .select('pain_level, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (painError || !painData || painData.length < 7) {
        logger.warn('Insufficient pain history data');
        return null;
      }

      // Fetch movement quality scores
      const { data: movementData } = await supabase
        .from('movement_sessions')
        .select('average_score, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch adherence data
      const { data: adherenceData } = await supabase
        .from('exercise_completions')
        .select('completed, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      // Get health data from HealthKit
      const sleepData = await healthDataService.getStoredHealthData(
        userId,
        HealthDataType.SLEEP_ANALYSIS,
        startDate,
        endDate
      );

      const activityData = await healthDataService.getStoredHealthData(
        userId,
        HealthDataType.STEPS,
        startDate,
        endDate
      );

      // Process data into daily arrays
      const painHistory = this.aggregateByDay(
        painData.map(p => ({ value: p.pain_level, date: new Date(p.created_at) })),
        this.sequenceLength
      );

      const movementScores = this.aggregateByDay(
        movementData?.map(m => ({ value: m.average_score, date: new Date(m.created_at) })) || [],
        this.sequenceLength,
        80 // Default value if no data
      );

      const adherenceRate = adherenceData
        ? adherenceData.filter(a => a.completed).length / adherenceData.length
        : 0.5;

      const sleepHours = this.aggregateByDay(
        sleepData.map(s => ({ value: s.value / 60, date: s.startDate })), // Convert minutes to hours
        this.sequenceLength,
        7.5 // Default 7.5 hours
      );

      const activityLevels = this.aggregateByDay(
        activityData.map(a => ({ value: a.value, date: a.startDate })),
        this.sequenceLength,
        5000 // Default 5000 steps
      );

      return {
        painHistory,
        movementQualityScores: movementScores,
        adherenceRate,
        sleepHours,
        activityLevels,
        stressLevels: painHistory.map(p => p * 0.5) // Estimate stress from pain
      };
    } catch (error) {
      logger.error('Failed to gather prediction input:', error);
      return null;
    }
  }

  /**
   * Aggregate data by day
   */
  private aggregateByDay(
    data: Array<{ value: number; date: Date }>,
    days: number,
    defaultValue: number = 0
  ): number[] {
    const result: number[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      const dayData = data.filter(d => {
        const dataDate = new Date(d.date);
        dataDate.setHours(0, 0, 0, 0);
        return dataDate.getTime() === targetDate.getTime();
      });

      if (dayData.length > 0) {
        const average = dayData.reduce((sum, d) => sum + d.value, 0) / dayData.length;
        result.push(average);
      } else {
        result.push(defaultValue);
      }
    }

    return result;
  }

  /**
   * Prepare features tensor for prediction
   */
  private prepareFeaturesForPrediction(input: PredictionInput): tf.Tensor3D {
    const sequence: number[][] = [];

    for (let i = 0; i < this.sequenceLength; i++) {
      sequence.push([
        input.painHistory[i] / 10,
        input.movementQualityScores[i] / 100,
        input.adherenceRate,
        input.sleepHours[i] / 10,
        input.activityLevels[i] / 15000,
        (input.stressLevels?.[i] || input.painHistory[i] * 0.5) / 10
      ]);
    }

    return tf.tensor3d([sequence]); // Batch size 1
  }

  /**
   * Create prediction object with confidence and recommendations
   */
  private createPredictionObject(
    predictedPain: number,
    horizon: 24 | 48,
    inputData: PredictionInput
  ): PainPrediction {
    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(inputData);

    // Confidence interval (wider for 48h)
    const intervalWidth = horizon === 24 ? 1.5 : 2.5;
    const confidenceInterval = {
      lower: Math.max(0, predictedPain - intervalWidth),
      upper: Math.min(10, predictedPain + intervalWidth)
    };

    // Risk stratification
    const riskLevel = this.calculateRiskLevel(predictedPain, inputData);

    // Analyze contributing factors
    const contributingFactors = this.analyzeContributingFactors(inputData, predictedPain);

    // Generate recommendations
    const recommendations = this.generateRecommendations(predictedPain, riskLevel, contributingFactors);

    return {
      timestamp: new Date(),
      horizon,
      predictedPain,
      confidenceInterval,
      confidence,
      riskLevel,
      contributingFactors,
      recommendations
    };
  }

  /**
   * Calculate prediction confidence based on data quality
   */
  private calculatePredictionConfidence(input: PredictionInput): number {
    let confidence = 1.0;

    // Reduce confidence for missing or sparse data
    const painDataQuality = input.painHistory.filter(p => p > 0).length / input.painHistory.length;
    confidence *= painDataQuality;

    // Reduce confidence for high volatility
    const painStdDev = this.calculateStdDev(input.painHistory);
    if (painStdDev > 2.5) {
      confidence *= 0.8;
    }

    // Reduce confidence if very recent data is missing
    const recentPainData = input.painHistory.slice(-3);
    if (recentPainData.filter(p => p === 0).length > 1) {
      confidence *= 0.7;
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(
    predictedPain: number,
    inputData: PredictionInput
  ): 'low' | 'moderate' | 'high' | 'critical' {
    const currentPain = inputData.painHistory[inputData.painHistory.length - 1];
    const painIncrease = predictedPain - currentPain;

    if (predictedPain >= 8 || painIncrease >= 3) {
      return 'critical';
    } else if (predictedPain >= 6 || painIncrease >= 2) {
      return 'high';
    } else if (predictedPain >= 4 || painIncrease >= 1) {
      return 'moderate';
    } else {
      return 'low';
    }
  }

  /**
   * Analyze contributing factors
   */
  private analyzeContributingFactors(
    input: PredictionInput,
    predictedPain: number
  ): PainPrediction['contributingFactors'] {
    const factors: PainPrediction['contributingFactors'] = [];

    // Poor sleep
    const avgSleep = input.sleepHours.slice(-3).reduce((sum, h) => sum + h, 0) / 3;
    if (avgSleep < 6.5) {
      factors.push({
        factor: 'Insufficient sleep (avg ' + avgSleep.toFixed(1) + 'h)',
        impact: -0.7,
        confidence: 0.85
      });
    }

    // Low movement quality
    const avgMovement = input.movementQualityScores.slice(-3).reduce((sum, s) => sum + s, 0) / 3;
    if (avgMovement < 70) {
      factors.push({
        factor: 'Declining movement quality',
        impact: -0.6,
        confidence: 0.8
      });
    }

    // Low adherence
    if (input.adherenceRate < 0.6) {
      factors.push({
        factor: 'Low exercise adherence (' + Math.round(input.adherenceRate * 100) + '%)',
        impact: -0.5,
        confidence: 0.9
      });
    }

    // Overactivity
    const avgActivity = input.activityLevels.slice(-3).reduce((sum, a) => sum + a, 0) / 3;
    if (avgActivity > 12000) {
      factors.push({
        factor: 'High activity levels (possible overtraining)',
        impact: -0.4,
        confidence: 0.7
      });
    }

    // Positive factors
    if (avgSleep >= 7.5 && avgSleep <= 9) {
      factors.push({
        factor: 'Good sleep quality',
        impact: 0.6,
        confidence: 0.85
      });
    }

    if (input.adherenceRate >= 0.8) {
      factors.push({
        factor: 'Excellent exercise adherence',
        impact: 0.7,
        confidence: 0.9
      });
    }

    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    predictedPain: number,
    riskLevel: string,
    factors: PainPrediction['contributingFactors']
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Consider taking a rest day or reducing exercise intensity');
      recommendations.push('Contact your provider if pain persists or worsens');
    }

    // Address specific factors
    factors.forEach(factor => {
      if (factor.impact < -0.5) {
        if (factor.factor.includes('sleep')) {
          recommendations.push('Prioritize 7-9 hours of sleep tonight');
        } else if (factor.factor.includes('movement quality')) {
          recommendations.push('Focus on form quality over volume in next session');
        } else if (factor.factor.includes('adherence')) {
          recommendations.push('Try to complete at least one exercise today');
        } else if (factor.factor.includes('activity')) {
          recommendations.push('Reduce activity levels and allow adequate recovery');
        }
      }
    });

    // General recommendations
    if (predictedPain > 5) {
      recommendations.push('Apply ice or heat as appropriate');
      recommendations.push('Practice gentle stretching and mobility work');
      recommendations.push('Consider stress reduction techniques (meditation, breathing)');
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
  }

  /**
   * Analyze pain trends
   */
  private analyzePainTrends(painHistory: number[]): PainTrendAnalysis {
    const averagePain = painHistory.reduce((sum, p) => sum + p, 0) / painHistory.length;
    const volatility = this.calculateStdDev(painHistory);

    // Calculate trend (linear regression slope)
    const trend = this.calculateTrend(painHistory);
    const trendDirection: 'improving' | 'stable' | 'worsening' =
      trend < -0.15 ? 'improving' :
      trend > 0.15 ? 'worsening' : 'stable';

    // Flare-up frequency (pain >7)
    const flareUps = painHistory.filter(p => p >= 7).length;
    const flareUpFrequency = (flareUps / painHistory.length) * 7; // Per week

    return {
      trend: trendDirection,
      averagePain,
      volatility,
      flareUpFrequency
    };
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate trend (linear regression slope)
   */
  private calculateTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Store prediction for future validation and model improvement
   */
  private async storePrediction(
    userId: string,
    prediction24h: PainPrediction,
    prediction48h: PainPrediction
  ): Promise<void> {
    try {
      await supabase.from('pain_predictions').insert([
        {
          user_id: userId,
          prediction_date: new Date().toISOString(),
          horizon_24h: prediction24h.predictedPain,
          horizon_48h: prediction48h.predictedPain,
          confidence_24h: prediction24h.confidence,
          confidence_48h: prediction48h.confidence,
          risk_level_24h: prediction24h.riskLevel,
          risk_level_48h: prediction48h.riskLevel,
          model_version: this.modelVersion
        }
      ]);
    } catch (error) {
      logger.error('Failed to store prediction:', error);
    }
  }

  // --------------------------------------------------------------------------
  // MODEL IMPROVEMENT
  // --------------------------------------------------------------------------

  /**
   * Retrain model with user's actual data for personalization
   */
  public async personalizeModel(userId: string): Promise<boolean> {
    if (!this.model) return false;

    try {
      logger.info('Personalizing pain prediction model...');

      // Fetch user's historical data and actual outcomes
      const trainingData = await this.fetchUserTrainingData(userId);
      if (!trainingData || trainingData.inputs.shape[0] < 10) {
        logger.warn('Insufficient data for personalization');
        return false;
      }

      // Fine-tune model
      await this.model.fit(trainingData.inputs, trainingData.outputs, {
        epochs: 10,
        batchSize: 4,
        verbose: 0
      });

      // Save personalized model
      await this.model.save(`localstorage://pain-prediction-model-${userId}`);

      logger.info('✅ Model personalized successfully');
      return true;
    } catch (error) {
      logger.error('Model personalization failed:', error);
      return false;
    }
  }

  /**
   * Fetch user's training data from database
   */
  private async fetchUserTrainingData(userId: string): Promise<{
    inputs: tf.Tensor3D;
    outputs: tf.Tensor2D;
  } | null> {
    // Implementation would fetch historical predictions and actual outcomes
    // For now, return null (will be implemented when data accumulates)
    return null;
  }

  /**
   * Dispose model and clean up resources
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
    logger.info('Pain prediction service disposed');
  }

  // --------------------------------------------------------------------------
  // ENHANCED PATTERN DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detect pain patterns from historical data
   */
  public detectPatterns(painHistory: PainDataPoint[]): PainPattern[] {
    const patterns: PainPattern[] = [];

    if (painHistory.length < 14) {
      return patterns;
    }

    // Detect cyclical patterns (weekly, bi-weekly, monthly)
    const cyclicalPattern = this.detectCyclicalPattern(painHistory);
    if (cyclicalPattern) {
      patterns.push(cyclicalPattern);
    }

    // Detect day-of-week patterns
    const weekdayPattern = this.detectWeekdayPattern(painHistory);
    if (weekdayPattern) {
      patterns.push(weekdayPattern);
    }

    // Detect time-of-day patterns
    const timePattern = this.detectTimeOfDayPattern(painHistory);
    if (timePattern) {
      patterns.push(timePattern);
    }

    // Detect trigger-based patterns
    const triggerPattern = this.detectTriggerPattern(painHistory);
    if (triggerPattern) {
      patterns.push(triggerPattern);
    }

    return patterns;
  }

  /**
   * Detect cyclical patterns using autocorrelation
   */
  private detectCyclicalPattern(data: PainDataPoint[]): PainPattern | null {
    const values = data.map(d => d.painLevel);
    const correlations: { lag: number; correlation: number }[] = [];

    // Check for cycles of 7, 14, 28, 30 days
    const cycleLengths = [7, 14, 28, 30];

    for (const lag of cycleLengths) {
      if (values.length < lag * 2) continue;

      const correlation = this.calculateAutocorrelation(values, lag);
      if (correlation > 0.5) {
        correlations.push({ lag, correlation });
      }
    }

    if (correlations.length === 0) return null;

    const strongest = correlations.sort((a, b) => b.correlation - a.correlation)[0];

    return {
      type: 'cyclical',
      cycleLength: strongest.lag,
      triggers: [],
      confidence: strongest.correlation
    };
  }

  /**
   * Calculate autocorrelation at a given lag
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length - lag;
    if (n < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect day-of-week patterns
   */
  private detectWeekdayPattern(data: PainDataPoint[]): PainPattern | null {
    const dayAverages: number[][] = [[], [], [], [], [], [], []];

    data.forEach(point => {
      const day = point.timestamp.getDay();
      dayAverages[day].push(point.painLevel);
    });

    const averages = dayAverages.map(days =>
      days.length > 0 ? days.reduce((a, b) => a + b, 0) / days.length : 0
    );

    const overallAvg = data.reduce((sum, d) => sum + d.painLevel, 0) / data.length;
    const peakDays = averages
      .map((avg, idx) => ({ idx, diff: avg - overallAvg }))
      .filter(d => d.diff > 1.5)
      .map(d => d.idx);

    if (peakDays.length === 0) return null;

    const maxDiff = Math.max(...averages.map(a => Math.abs(a - overallAvg)));
    const confidence = Math.min(1, maxDiff / 3);

    return {
      type: 'cyclical',
      peakDays,
      triggers: [],
      confidence
    };
  }

  /**
   * Detect time-of-day patterns
   */
  private detectTimeOfDayPattern(data: PainDataPoint[]): PainPattern | null {
    const hourAverages: number[][] = Array(24).fill(null).map(() => []);

    data.forEach(point => {
      const hour = point.timestamp.getHours();
      hourAverages[hour].push(point.painLevel);
    });

    const averages = hourAverages.map(hours =>
      hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0
    );

    const overallAvg = data.reduce((sum, d) => sum + d.painLevel, 0) / data.length;
    const peakHours = averages
      .map((avg, idx) => ({ idx, diff: avg - overallAvg }))
      .filter(d => d.diff > 1.5)
      .map(d => d.idx);

    if (peakHours.length === 0) return null;

    return {
      type: 'cyclical',
      peakHours,
      triggers: [],
      confidence: 0.7
    };
  }

  /**
   * Detect trigger-based patterns
   */
  private detectTriggerPattern(data: PainDataPoint[]): PainPattern | null {
    const triggerCounts: Map<string, { total: number; highPain: number }> = new Map();

    data.forEach(point => {
      point.triggers?.forEach(trigger => {
        const current = triggerCounts.get(trigger) || { total: 0, highPain: 0 };
        current.total++;
        if (point.painLevel >= 6) {
          current.highPain++;
        }
        triggerCounts.set(trigger, current);
      });
    });

    const significantTriggers = Array.from(triggerCounts.entries())
      .filter(([_, counts]) => counts.total >= 3 && counts.highPain / counts.total > 0.5)
      .map(([trigger]) => trigger);

    if (significantTriggers.length === 0) return null;

    return {
      type: 'trigger-based',
      triggers: significantTriggers,
      confidence: 0.75
    };
  }

  // --------------------------------------------------------------------------
  // WEATHER IMPACT ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze weather impact on pain
   */
  public async analyzeWeatherImpact(
    userId: string,
    currentWeather?: { pressure: number; humidity: number; temperature: number }
  ): Promise<{ score: number; description: string } | null> {
    if (!currentWeather) return null;

    try {
      // Fetch historical pain-weather correlations
      const { data: correlations } = await supabase
        .from('pain_weather_correlations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!correlations) {
        return this.estimateWeatherImpact(currentWeather);
      }

      let score = 0;
      const factors: string[] = [];

      // Barometric pressure (most significant for many patients)
      if (correlations.pressure_sensitive && currentWeather.pressure < 1010) {
        score -= 0.3;
        factors.push('lågt lufttryck');
      }

      // Humidity
      if (correlations.humidity_sensitive && currentWeather.humidity > 80) {
        score -= 0.2;
        factors.push('hög luftfuktighet');
      }

      // Temperature (cold can aggravate joint pain)
      if (correlations.temperature_sensitive && currentWeather.temperature < 5) {
        score -= 0.2;
        factors.push('kall väderlek');
      }

      const description = factors.length > 0
        ? `Vädret kan påverka din smärta idag (${factors.join(', ')})`
        : 'Vädret förväntas inte påverka din smärtnivå nämnvärt';

      return { score, description };
    } catch {
      return this.estimateWeatherImpact(currentWeather);
    }
  }

  /**
   * Estimate weather impact for new users
   */
  private estimateWeatherImpact(
    weather: { pressure: number; humidity: number; temperature: number }
  ): { score: number; description: string } {
    let score = 0;
    const factors: string[] = [];

    if (weather.pressure < 1005) {
      score -= 0.25;
      factors.push('lågt lufttryck');
    }

    if (weather.humidity > 85) {
      score -= 0.15;
      factors.push('hög luftfuktighet');
    }

    if (weather.temperature < 3) {
      score -= 0.15;
      factors.push('kallt väder');
    }

    const description = factors.length > 0
      ? `Potentiell väderpåverkan: ${factors.join(', ')}`
      : 'Normala väderförhållanden';

    return { score, description };
  }

  // --------------------------------------------------------------------------
  // PREVENTIVE ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Generate preventive actions based on prediction
   */
  public generatePreventiveActions(
    prediction: PainPrediction,
    patterns: PainPattern[]
  ): EnhancedPrediction['suggestedPreventiveActions'] {
    const actions: EnhancedPrediction['suggestedPreventiveActions'] = [];

    // Based on risk level
    if (prediction.riskLevel === 'critical' || prediction.riskLevel === 'high') {
      actions.push({
        action: 'Ta smärtstillande medicin i förebyggande syfte',
        priority: 'high',
        timing: 'Inom de närmaste 2 timmarna',
        effectiveness: 0.7
      });

      actions.push({
        action: 'Boka en lättare träningssession istället för planerad intensiv träning',
        priority: 'high',
        timing: 'Idag',
        effectiveness: 0.6
      });
    }

    // Based on patterns
    patterns.forEach(pattern => {
      if (pattern.type === 'cyclical' && pattern.peakDays) {
        const today = new Date().getDay();
        if (pattern.peakDays.includes(today) || pattern.peakDays.includes((today + 1) % 7)) {
          actions.push({
            action: 'Historiskt har du mer smärta denna dag i veckan - planera lättare aktiviteter',
            priority: 'medium',
            timing: 'Idag och imorgon',
            effectiveness: 0.5
          });
        }
      }

      if (pattern.triggers.length > 0) {
        actions.push({
          action: `Undvik kända triggers: ${pattern.triggers.slice(0, 3).join(', ')}`,
          priority: 'medium',
          timing: 'Närmaste 48 timmarna',
          effectiveness: 0.65
        });
      }
    });

    // General preventive actions
    if (prediction.predictedPain >= 5) {
      actions.push({
        action: 'Utför avslappningsövningar (andning, meditation)',
        priority: 'medium',
        timing: 'Kväll',
        effectiveness: 0.45
      });

      actions.push({
        action: 'Förbered is- eller värmeomslag',
        priority: 'low',
        timing: 'Ha redo',
        effectiveness: 0.4
      });
    }

    // Contributing factor based actions
    prediction.contributingFactors
      .filter(f => f.impact < -0.4)
      .forEach(factor => {
        if (factor.factor.includes('sleep') || factor.factor.includes('sömn')) {
          actions.push({
            action: 'Prioritera sömn ikväll - sikta på 8+ timmar',
            priority: 'high',
            timing: 'Ikväll',
            effectiveness: 0.55
          });
        }
      });

    return actions.slice(0, 6); // Max 6 actions
  }

  // --------------------------------------------------------------------------
  // ENHANCED PREDICTION API
  // --------------------------------------------------------------------------

  /**
   * Get enhanced prediction with patterns and insights
   */
  public async getEnhancedPrediction(userId: string): Promise<{
    prediction24h: EnhancedPrediction;
    prediction48h: EnhancedPrediction;
    trendAnalysis: PainTrendAnalysis;
  } | null> {
    const basePrediction = await this.predict(userId);
    if (!basePrediction) return null;

    // Fetch historical pain data for pattern detection
    const { data: painData } = await supabase
      .from('pain_tracking')
      .select('pain_level, location, triggers, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(90); // 3 months

    const painHistory: PainDataPoint[] = (painData || []).map(p => ({
      timestamp: new Date(p.created_at),
      painLevel: p.pain_level,
      location: p.location,
      triggers: p.triggers
    }));

    // Detect patterns
    const patterns = this.detectPatterns(painHistory);

    // Generate preventive actions
    const actions24 = this.generatePreventiveActions(basePrediction.prediction24h, patterns);
    const actions48 = this.generatePreventiveActions(basePrediction.prediction48h, patterns);

    // Generate personalized insights
    const insights = this.generatePersonalizedInsights(
      basePrediction.trendAnalysis,
      patterns,
      basePrediction.prediction24h
    );

    // Analyze weather impact (mock data for now)
    const weatherImpact = await this.analyzeWeatherImpact(userId);

    const enhance = (pred: PainPrediction, actions: typeof actions24): EnhancedPrediction => ({
      ...pred,
      patterns,
      weatherImpact,
      personalizedInsights: insights,
      suggestedPreventiveActions: actions
    });

    return {
      prediction24h: enhance(basePrediction.prediction24h, actions24),
      prediction48h: enhance(basePrediction.prediction48h, actions48),
      trendAnalysis: basePrediction.trendAnalysis
    };
  }

  /**
   * Generate personalized insights based on user data
   */
  private generatePersonalizedInsights(
    trend: PainTrendAnalysis,
    patterns: PainPattern[],
    prediction: PainPrediction
  ): string[] {
    const insights: string[] = [];

    // Trend insights
    if (trend.trend === 'improving') {
      insights.push(`Din smärtnivå har förbättrats. Genomsnittlig smärta: ${trend.averagePain.toFixed(1)}/10`);
    } else if (trend.trend === 'worsening') {
      insights.push(`Din smärtnivå har ökat den senaste tiden. Överväg att kontakta din vårdgivare.`);
    }

    // Pattern insights
    patterns.forEach(pattern => {
      if (pattern.type === 'cyclical' && pattern.cycleLength) {
        insights.push(`Vi har identifierat ett ${pattern.cycleLength}-dagars cykliskt mönster i din smärta.`);
      }
      if (pattern.peakDays && pattern.peakDays.length > 0) {
        const dayNames = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
        const peakDayNames = pattern.peakDays.map(d => dayNames[d]);
        insights.push(`Du upplever ofta mer smärta på ${peakDayNames.join(' och ')}.`);
      }
    });

    // Volatility insights
    if (trend.volatility > 2.5) {
      insights.push('Din smärtnivå varierar mycket. Försök identifiera vad som triggar förändringarna.');
    }

    // Prediction confidence
    if (prediction.confidence > 0.8) {
      insights.push('Prediktionen är baserad på tillräcklig data och har hög tillförlitlighet.');
    } else if (prediction.confidence < 0.5) {
      insights.push('Fortsätt logga din smärta regelbundet för bättre prediktioner.');
    }

    return insights.slice(0, 5);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let painPredictionInstance: PainPredictionService | null = null;

/**
 * Get singleton instance of pain prediction service
 */
export function getPainPredictionService(): PainPredictionService {
  if (!painPredictionInstance) {
    painPredictionInstance = new PainPredictionService();
  }
  return painPredictionInstance;
}

/**
 * Dispose singleton instance
 */
export function disposePainPredictionService(): void {
  if (painPredictionInstance) {
    painPredictionInstance.dispose();
    painPredictionInstance = null;
  }
}
