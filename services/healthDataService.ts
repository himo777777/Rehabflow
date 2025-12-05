/**
 * Health Data Integration Service
 *
 * Comprehensive health data integration supporting:
 * - Apple HealthKit (iOS native)
 * - Web fallback for browser-based usage
 * - Manual data entry
 * - Future expansion for Google Fit, Fitbit, etc.
 *
 * Data collected:
 * - Steps, distance, active energy
 * - Heart rate, HRV, resting heart rate
 * - Sleep analysis (duration, quality)
 * - Workouts and activity
 * - Body measurements (weight, height, BMI)
 *
 * @module healthDataService
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum HealthDataSource {
  HEALTHKIT = 'healthkit',
  MANUAL = 'manual',
  WEB_API = 'web_api',
  GOOGLE_FIT = 'google_fit',
  FITBIT = 'fitbit',
  UNKNOWN = 'unknown'
}

export enum HealthDataType {
  STEPS = 'steps',
  DISTANCE = 'distance',
  ACTIVE_ENERGY = 'active_energy',
  HEART_RATE = 'heart_rate',
  HRV = 'hrv',
  RESTING_HEART_RATE = 'resting_heart_rate',
  SLEEP_ANALYSIS = 'sleep_analysis',
  WORKOUT = 'workout',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BMI = 'bmi',
  BODY_FAT_PERCENTAGE = 'body_fat_percentage',
  BLOOD_PRESSURE = 'blood_pressure',
  OXYGEN_SATURATION = 'oxygen_saturation'
}

export interface HealthDataPoint {
  id?: string;
  userId: string;
  dataType: HealthDataType;
  value: number;
  unit: string;
  source: HealthDataSource;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface SleepData extends HealthDataPoint {
  sleepStage?: 'awake' | 'light' | 'deep' | 'rem';
  quality?: number; // 0-100
}

export interface WorkoutData extends HealthDataPoint {
  workoutType: string;
  duration: number; // minutes
  calories?: number;
  distance?: number;
  averageHeartRate?: number;
}

export interface HealthKitPermissions {
  read: HealthDataType[];
  write: HealthDataType[];
}

export interface HealthDataSyncResult {
  success: boolean;
  dataPoints: number;
  errors: string[];
  lastSyncDate: Date;
}

// ============================================================================
// HEALTH DATA SERVICE CLASS
// ============================================================================

class HealthDataService {
  private isHealthKitAvailable: boolean = false;
  private isAuthorized: boolean = false;
  private syncInterval: number | null = null;
  private lastSyncTimestamp: Record<HealthDataType, Date> = {} as Record<HealthDataType, Date>;

  constructor() {
    this.detectPlatform();
  }

  // --------------------------------------------------------------------------
  // PLATFORM DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detect if HealthKit is available on the current platform
   */
  private detectPlatform(): void {
    // Check if running in Capacitor/Cordova environment
    if (typeof window !== 'undefined') {
      // @ts-ignore - Capacitor global
      const capacitor = window.Capacitor;

      if (capacitor && capacitor.isNativePlatform() && capacitor.getPlatform() === 'ios') {
        this.isHealthKitAvailable = true;
        console.log('✅ HealthKit available (iOS native)');
      } else {
        this.isHealthKitAvailable = false;
        console.log('ℹ️ HealthKit not available (web platform)');
      }
    }
  }

  /**
   * Check if HealthKit is available
   */
  public isAvailable(): boolean {
    return this.isHealthKitAvailable;
  }

  // --------------------------------------------------------------------------
  // AUTHORIZATION
  // --------------------------------------------------------------------------

  /**
   * Request HealthKit authorization for specific data types
   */
  public async requestAuthorization(permissions: HealthKitPermissions): Promise<boolean> {
    if (!this.isHealthKitAvailable) {
      console.warn('HealthKit not available on this platform');
      return false;
    }

    try {
      // @ts-ignore - Capacitor HealthKit plugin
      const { HealthKit } = window.Capacitor.Plugins;

      if (!HealthKit) {
        throw new Error('HealthKit plugin not installed');
      }

      // Request authorization
      const result = await HealthKit.requestAuthorization({
        read: permissions.read.map(type => this.mapToHealthKitIdentifier(type)),
        write: permissions.write.map(type => this.mapToHealthKitIdentifier(type))
      });

      this.isAuthorized = result.granted;

      if (this.isAuthorized) {
        console.log('✅ HealthKit authorization granted');
        // Start automatic sync
        this.startAutoSync();
      }

      return this.isAuthorized;
    } catch (error) {
      console.error('❌ HealthKit authorization failed:', error);
      return false;
    }
  }

  /**
   * Check authorization status
   */
  public async checkAuthorization(): Promise<boolean> {
    if (!this.isHealthKitAvailable) {
      return false;
    }

    try {
      // @ts-ignore
      const { HealthKit } = window.Capacitor.Plugins;
      const result = await HealthKit.checkAuthorization();
      this.isAuthorized = result.authorized;
      return this.isAuthorized;
    } catch (error) {
      console.error('❌ Failed to check authorization:', error);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // DATA RETRIEVAL
  // --------------------------------------------------------------------------

  /**
   * Query health data for a specific type and time range
   */
  public async queryHealthData(
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date
  ): Promise<HealthDataPoint[]> {
    if (!this.isHealthKitAvailable || !this.isAuthorized) {
      console.warn('HealthKit not available or not authorized');
      return [];
    }

    try {
      // @ts-ignore
      const { HealthKit } = window.Capacitor.Plugins;

      const result = await HealthKit.query({
        type: this.mapToHealthKitIdentifier(dataType),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Transform HealthKit data to our format
      const dataPoints: HealthDataPoint[] = result.samples.map((sample: any) => ({
        userId: '', // Will be set during storage
        dataType,
        value: sample.value,
        unit: sample.unit,
        source: HealthDataSource.HEALTHKIT,
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
        metadata: sample.metadata
      }));

      return dataPoints;
    } catch (error) {
      console.error(`❌ Failed to query ${dataType}:`, error);
      return [];
    }
  }

  /**
   * Get latest value for a specific health data type
   */
  public async getLatestValue(dataType: HealthDataType): Promise<HealthDataPoint | null> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    const dataPoints = await this.queryHealthData(dataType, startDate, endDate);

    if (dataPoints.length === 0) {
      return null;
    }

    // Return most recent
    return dataPoints.sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];
  }

  /**
   * Get aggregated data (sum, average, min, max)
   */
  public async getAggregatedData(
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date,
    aggregationType: 'sum' | 'average' | 'min' | 'max' = 'sum'
  ): Promise<number | null> {
    const dataPoints = await this.queryHealthData(dataType, startDate, endDate);

    if (dataPoints.length === 0) {
      return null;
    }

    const values = dataPoints.map(dp => dp.value);

    switch (aggregationType) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'average':
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return null;
    }
  }

  // --------------------------------------------------------------------------
  // DATA STORAGE
  // --------------------------------------------------------------------------

  /**
   * Store health data points in Supabase
   */
  public async storeHealthData(userId: string, dataPoints: HealthDataPoint[]): Promise<boolean> {
    try {
      const records = dataPoints.map(dp => ({
        user_id: userId,
        data_type: dp.dataType,
        value: dp.value,
        unit: dp.unit,
        source: dp.source,
        start_date: dp.startDate.toISOString(),
        end_date: dp.endDate.toISOString(),
        metadata: dp.metadata,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('health_data')
        .upsert(records, {
          onConflict: 'user_id,data_type,start_date',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('❌ Failed to store health data:', error);
        return false;
      }

      console.log(`✅ Stored ${records.length} health data points`);
      return true;
    } catch (error) {
      console.error('❌ Error storing health data:', error);
      return false;
    }
  }

  /**
   * Retrieve health data from Supabase
   */
  public async getStoredHealthData(
    userId: string,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date
  ): Promise<HealthDataPoint[]> {
    try {
      const { data, error } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .gte('start_date', startDate.toISOString())
        .lte('end_date', endDate.toISOString())
        .order('start_date', { ascending: false });

      if (error) {
        console.error('❌ Failed to retrieve health data:', error);
        return [];
      }

      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        dataType: record.data_type,
        value: record.value,
        unit: record.unit,
        source: record.source,
        startDate: new Date(record.start_date),
        endDate: new Date(record.end_date),
        metadata: record.metadata,
        createdAt: new Date(record.created_at)
      }));
    } catch (error) {
      console.error('❌ Error retrieving health data:', error);
      return [];
    }
  }

  // --------------------------------------------------------------------------
  // SYNCHRONIZATION
  // --------------------------------------------------------------------------

  /**
   * Sync health data from HealthKit to Supabase
   */
  public async syncHealthData(
    userId: string,
    dataTypes: HealthDataType[] = Object.values(HealthDataType)
  ): Promise<HealthDataSyncResult> {
    const result: HealthDataSyncResult = {
      success: true,
      dataPoints: 0,
      errors: [],
      lastSyncDate: new Date()
    };

    if (!this.isHealthKitAvailable || !this.isAuthorized) {
      result.success = false;
      result.errors.push('HealthKit not available or not authorized');
      return result;
    }

    const endDate = new Date();

    for (const dataType of dataTypes) {
      try {
        // Determine start date (last sync or 30 days ago)
        const lastSync = this.lastSyncTimestamp[dataType];
        const startDate = lastSync || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Query data from HealthKit
        const dataPoints = await this.queryHealthData(dataType, startDate, endDate);

        if (dataPoints.length > 0) {
          // Store in Supabase
          const stored = await this.storeHealthData(userId, dataPoints);

          if (stored) {
            result.dataPoints += dataPoints.length;
            this.lastSyncTimestamp[dataType] = endDate;
          } else {
            result.errors.push(`Failed to store ${dataType} data`);
          }
        }
      } catch (error) {
        result.success = false;
        result.errors.push(`Error syncing ${dataType}: ${error}`);
      }
    }

    console.log(`✅ Sync completed: ${result.dataPoints} data points`);
    return result;
  }

  /**
   * Start automatic background sync (every 4 hours)
   */
  public startAutoSync(userId?: string, intervalMinutes: number = 240): void {
    if (this.syncInterval) {
      console.log('Auto-sync already running');
      return;
    }

    this.syncInterval = window.setInterval(async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        userId = user.id;
      }

      console.log('🔄 Running automatic health data sync...');
      await this.syncHealthData(userId);
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Auto-sync started (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop automatic sync
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('✅ Auto-sync stopped');
    }
  }

  // --------------------------------------------------------------------------
  // MANUAL DATA ENTRY
  // --------------------------------------------------------------------------

  /**
   * Manually add health data (for web users without HealthKit)
   */
  public async addManualData(
    userId: string,
    dataType: HealthDataType,
    value: number,
    unit: string,
    date: Date = new Date()
  ): Promise<boolean> {
    const dataPoint: HealthDataPoint = {
      userId,
      dataType,
      value,
      unit,
      source: HealthDataSource.MANUAL,
      startDate: date,
      endDate: date,
      metadata: { manual_entry: true }
    };

    return await this.storeHealthData(userId, [dataPoint]);
  }

  // --------------------------------------------------------------------------
  // ANALYTICS & INSIGHTS
  // --------------------------------------------------------------------------

  /**
   * Get daily activity summary
   */
  public async getDailyActivitySummary(userId: string, date: Date = new Date()): Promise<{
    steps: number;
    distance: number;
    activeEnergy: number;
    sleepHours: number;
    averageHeartRate: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [steps, distance, energy, sleep, hr] = await Promise.all([
      this.getAggregatedData(HealthDataType.STEPS, startOfDay, endOfDay, 'sum'),
      this.getAggregatedData(HealthDataType.DISTANCE, startOfDay, endOfDay, 'sum'),
      this.getAggregatedData(HealthDataType.ACTIVE_ENERGY, startOfDay, endOfDay, 'sum'),
      this.getAggregatedData(HealthDataType.SLEEP_ANALYSIS, startOfDay, endOfDay, 'sum'),
      this.getAggregatedData(HealthDataType.HEART_RATE, startOfDay, endOfDay, 'average')
    ]);

    return {
      steps: steps || 0,
      distance: distance || 0,
      activeEnergy: energy || 0,
      sleepHours: (sleep || 0) / 60, // Convert minutes to hours
      averageHeartRate: hr || 0
    };
  }

  /**
   * Get weekly trend
   */
  public async getWeeklyTrend(userId: string, dataType: HealthDataType): Promise<number[]> {
    const trends: number[] = [];
    const endDate = new Date();

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(endDate);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const value = await this.getAggregatedData(dataType, dayStart, dayEnd, 'sum');
      trends.push(value || 0);
    }

    return trends;
  }

  /**
   * Calculate recovery score based on multiple metrics
   */
  public async calculateRecoveryScore(userId: string): Promise<number> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const summary = await this.getDailyActivitySummary(userId, yesterday);

    // Weighted recovery score (0-100)
    let score = 50; // Baseline

    // Sleep quality (30% weight)
    if (summary.sleepHours >= 7 && summary.sleepHours <= 9) {
      score += 30;
    } else if (summary.sleepHours >= 6 && summary.sleepHours < 7) {
      score += 20;
    } else if (summary.sleepHours >= 5 && summary.sleepHours < 6) {
      score += 10;
    }

    // Heart rate (20% weight) - lower resting HR = better recovery
    if (summary.averageHeartRate > 0 && summary.averageHeartRate < 60) {
      score += 20;
    } else if (summary.averageHeartRate >= 60 && summary.averageHeartRate < 70) {
      score += 15;
    } else if (summary.averageHeartRate >= 70 && summary.averageHeartRate < 80) {
      score += 10;
    }

    // Activity level (normalized to typical ranges)
    if (summary.steps >= 7000 && summary.steps <= 12000) {
      score += 10; // Optimal activity
    } else if (summary.steps > 12000) {
      score -= 10; // Overtraining risk
    }

    return Math.max(0, Math.min(100, score));
  }

  // --------------------------------------------------------------------------
  // UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Map our data types to HealthKit identifiers
   */
  private mapToHealthKitIdentifier(dataType: HealthDataType): string {
    const mapping: Record<HealthDataType, string> = {
      [HealthDataType.STEPS]: 'HKQuantityTypeIdentifierStepCount',
      [HealthDataType.DISTANCE]: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
      [HealthDataType.ACTIVE_ENERGY]: 'HKQuantityTypeIdentifierActiveEnergyBurned',
      [HealthDataType.HEART_RATE]: 'HKQuantityTypeIdentifierHeartRate',
      [HealthDataType.HRV]: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
      [HealthDataType.RESTING_HEART_RATE]: 'HKQuantityTypeIdentifierRestingHeartRate',
      [HealthDataType.SLEEP_ANALYSIS]: 'HKCategoryTypeIdentifierSleepAnalysis',
      [HealthDataType.WORKOUT]: 'HKWorkoutTypeIdentifier',
      [HealthDataType.WEIGHT]: 'HKQuantityTypeIdentifierBodyMass',
      [HealthDataType.HEIGHT]: 'HKQuantityTypeIdentifierHeight',
      [HealthDataType.BMI]: 'HKQuantityTypeIdentifierBodyMassIndex',
      [HealthDataType.BODY_FAT_PERCENTAGE]: 'HKQuantityTypeIdentifierBodyFatPercentage',
      [HealthDataType.BLOOD_PRESSURE]: 'HKQuantityTypeIdentifierBloodPressureSystolic',
      [HealthDataType.OXYGEN_SATURATION]: 'HKQuantityTypeIdentifierOxygenSaturation'
    };

    return mapping[dataType] || dataType;
  }

  /**
   * Format unit for display
   */
  public formatUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'count': 'steps',
      'm': 'meters',
      'km': 'kilometers',
      'kcal': 'calories',
      'bpm': 'bpm',
      'ms': 'ms',
      'kg': 'kg',
      'cm': 'cm',
      '%': '%',
      'mmHg': 'mmHg'
    };

    return unitMap[unit] || unit;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const healthDataService = new HealthDataService();
