/**
 * Wearable Sync Service - Sprint 5.11
 *
 * Syncs data with wearable devices and fitness platforms.
 * Features:
 * - Apple Health / HealthKit integration
 * - Google Fit integration
 * - Fitbit API integration
 * - Garmin Connect integration
 * - Data normalization
 * - Background sync
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type WearablePlatform = 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'samsung_health';

export interface WearableConnection {
  platform: WearablePlatform;
  connected: boolean;
  lastSync?: string;
  permissions: string[];
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface HealthData {
  id: string;
  source: WearablePlatform;
  timestamp: string;
  type: HealthDataType;
  value: number;
  unit: string;
  metadata?: Record<string, unknown>;
}

export type HealthDataType =
  | 'steps'
  | 'heart_rate'
  | 'calories_burned'
  | 'active_minutes'
  | 'sleep_duration'
  | 'sleep_quality'
  | 'distance'
  | 'floors_climbed'
  | 'resting_heart_rate'
  | 'heart_rate_variability'
  | 'blood_oxygen'
  | 'body_weight'
  | 'body_fat'
  | 'workout';

export interface WorkoutData {
  id: string;
  source: WearablePlatform;
  type: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  calories: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  distance?: number;
  steps?: number;
}

export interface SyncResult {
  platform: WearablePlatform;
  success: boolean;
  dataCount: number;
  lastTimestamp?: string;
  error?: string;
}

export interface WearableConfig {
  enableAutoSync: boolean;
  syncInterval: number; // minutes
  platforms: WearablePlatform[];
  dataTypes: HealthDataType[];
  syncOnWifi: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: WearableConfig = {
  enableAutoSync: true,
  syncInterval: 30,
  platforms: [],
  dataTypes: ['steps', 'heart_rate', 'calories_burned', 'active_minutes', 'sleep_duration'],
  syncOnWifi: true,
};

// Storage keys
const CONFIG_KEY = 'rehabflow-wearable-config';
const CONNECTIONS_KEY = 'rehabflow-wearable-connections';
const DATA_KEY = 'rehabflow-wearable-data';

// ============================================================================
// WEARABLE SYNC SERVICE
// ============================================================================

class WearableSyncService {
  private config: WearableConfig = DEFAULT_CONFIG;
  private connections: Map<WearablePlatform, WearableConnection> = new Map();
  private healthData: HealthData[] = [];
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private onSyncComplete: ((result: SyncResult) => void) | null = null;
  private onDataUpdate: ((data: HealthData[]) => void) | null = null;

  constructor() {
    this.loadConfig();
    this.loadConnections();
    this.loadHealthData();
    this.startAutoSync();
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[WearableSync] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[WearableSync] Failed to save config:', error);
    }
  }

  public getConfig(): WearableConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<WearableConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();

    // Restart auto-sync if interval changed
    if (updates.syncInterval || updates.enableAutoSync !== undefined) {
      this.startAutoSync();
    }

    logger.debug('[WearableSync] Config updated:', updates);
  }

  // --------------------------------------------------------------------------
  // CONNECTIONS
  // --------------------------------------------------------------------------

  private loadConnections(): void {
    try {
      const stored = localStorage.getItem(CONNECTIONS_KEY);
      if (stored) {
        const connections = JSON.parse(stored) as WearableConnection[];
        connections.forEach(c => this.connections.set(c.platform, c));
      }
    } catch (error) {
      logger.error('[WearableSync] Failed to load connections:', error);
    }
  }

  private saveConnections(): void {
    try {
      const connections = Array.from(this.connections.values());
      localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
    } catch (error) {
      logger.error('[WearableSync] Failed to save connections:', error);
    }
  }

  /**
   * Get all connections
   */
  public getConnections(): WearableConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection for platform
   */
  public getConnection(platform: WearablePlatform): WearableConnection | null {
    return this.connections.get(platform) || null;
  }

  /**
   * Check if platform is connected
   */
  public isConnected(platform: WearablePlatform): boolean {
    const connection = this.connections.get(platform);
    return connection?.connected || false;
  }

  /**
   * Connect to a platform
   */
  public async connect(platform: WearablePlatform): Promise<boolean> {
    logger.info('[WearableSync] Connecting to:', platform);

    try {
      switch (platform) {
        case 'apple_health':
          return this.connectAppleHealth();
        case 'google_fit':
          return this.connectGoogleFit();
        case 'fitbit':
          return this.connectFitbit();
        case 'garmin':
          return this.connectGarmin();
        case 'samsung_health':
          return this.connectSamsungHealth();
        default:
          logger.error('[WearableSync] Unknown platform:', platform);
          return false;
      }
    } catch (error) {
      logger.error('[WearableSync] Connection failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from a platform
   */
  public async disconnect(platform: WearablePlatform): Promise<void> {
    const connection = this.connections.get(platform);
    if (connection) {
      connection.connected = false;
      connection.accessToken = undefined;
      connection.refreshToken = undefined;
      this.connections.set(platform, connection);
      this.saveConnections();

      logger.info('[WearableSync] Disconnected from:', platform);
    }
  }

  // --------------------------------------------------------------------------
  // PLATFORM-SPECIFIC CONNECTIONS
  // --------------------------------------------------------------------------

  private async connectAppleHealth(): Promise<boolean> {
    // Apple Health is only available on iOS
    // This would use Capacitor/Cordova plugin in a real app
    logger.info('[WearableSync] Apple Health requires native iOS integration');

    // Mock connection for demo
    const connection: WearableConnection = {
      platform: 'apple_health',
      connected: true,
      permissions: ['steps', 'heart_rate', 'sleep', 'workouts'],
      lastSync: new Date().toISOString(),
    };

    this.connections.set('apple_health', connection);
    this.saveConnections();
    return true;
  }

  private async connectGoogleFit(): Promise<boolean> {
    // Google Fit uses OAuth 2.0
    // Would need to implement OAuth flow with Google Fit API
    logger.info('[WearableSync] Google Fit requires OAuth integration');

    // Mock connection
    const connection: WearableConnection = {
      platform: 'google_fit',
      connected: true,
      permissions: ['activity', 'heart_rate', 'sleep'],
      lastSync: new Date().toISOString(),
    };

    this.connections.set('google_fit', connection);
    this.saveConnections();
    return true;
  }

  private async connectFitbit(): Promise<boolean> {
    // Fitbit uses OAuth 2.0
    // Would redirect to Fitbit authorization page
    logger.info('[WearableSync] Fitbit requires OAuth integration');

    // Mock connection
    const connection: WearableConnection = {
      platform: 'fitbit',
      connected: true,
      permissions: ['activity', 'heartrate', 'sleep', 'weight'],
      lastSync: new Date().toISOString(),
    };

    this.connections.set('fitbit', connection);
    this.saveConnections();
    return true;
  }

  private async connectGarmin(): Promise<boolean> {
    logger.info('[WearableSync] Garmin requires OAuth integration');

    // Mock connection
    const connection: WearableConnection = {
      platform: 'garmin',
      connected: true,
      permissions: ['activities', 'heart_rate', 'sleep'],
      lastSync: new Date().toISOString(),
    };

    this.connections.set('garmin', connection);
    this.saveConnections();
    return true;
  }

  private async connectSamsungHealth(): Promise<boolean> {
    logger.info('[WearableSync] Samsung Health requires native integration');

    // Mock connection
    const connection: WearableConnection = {
      platform: 'samsung_health',
      connected: true,
      permissions: ['step_count', 'heart_rate', 'sleep'],
      lastSync: new Date().toISOString(),
    };

    this.connections.set('samsung_health', connection);
    this.saveConnections();
    return true;
  }

  // --------------------------------------------------------------------------
  // DATA SYNC
  // --------------------------------------------------------------------------

  /**
   * Sync data from all connected platforms
   */
  public async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const [platform, connection] of this.connections) {
      if (connection.connected) {
        const result = await this.syncPlatform(platform);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Sync data from a specific platform
   */
  public async syncPlatform(platform: WearablePlatform): Promise<SyncResult> {
    const connection = this.connections.get(platform);

    if (!connection?.connected) {
      return {
        platform,
        success: false,
        dataCount: 0,
        error: 'Not connected',
      };
    }

    try {
      logger.info('[WearableSync] Syncing:', platform);

      // In a real implementation, this would fetch data from the platform's API
      // For demo, generate mock data
      const data = this.generateMockData(platform);

      // Save data
      this.healthData.push(...data);
      this.saveHealthData();

      // Update connection
      connection.lastSync = new Date().toISOString();
      this.connections.set(platform, connection);
      this.saveConnections();

      const result: SyncResult = {
        platform,
        success: true,
        dataCount: data.length,
        lastTimestamp: new Date().toISOString(),
      };

      if (this.onSyncComplete) {
        this.onSyncComplete(result);
      }

      if (this.onDataUpdate) {
        this.onDataUpdate(this.healthData);
      }

      logger.info('[WearableSync] Sync complete:', platform, 'items:', data.length);
      return result;
    } catch (error) {
      const result: SyncResult = {
        platform,
        success: false,
        dataCount: 0,
        error: (error as Error).message,
      };

      if (this.onSyncComplete) {
        this.onSyncComplete(result);
      }

      return result;
    }
  }

  private generateMockData(platform: WearablePlatform): HealthData[] {
    const data: HealthData[] = [];
    const now = new Date();

    // Generate last 7 days of data
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Steps
      data.push({
        id: `${platform}_steps_${date.toISOString()}`,
        source: platform,
        timestamp: date.toISOString(),
        type: 'steps',
        value: Math.floor(5000 + Math.random() * 8000),
        unit: 'steps',
      });

      // Heart rate
      data.push({
        id: `${platform}_hr_${date.toISOString()}`,
        source: platform,
        timestamp: date.toISOString(),
        type: 'heart_rate',
        value: Math.floor(60 + Math.random() * 40),
        unit: 'bpm',
      });

      // Calories
      data.push({
        id: `${platform}_cal_${date.toISOString()}`,
        source: platform,
        timestamp: date.toISOString(),
        type: 'calories_burned',
        value: Math.floor(1500 + Math.random() * 1000),
        unit: 'kcal',
      });

      // Active minutes
      data.push({
        id: `${platform}_active_${date.toISOString()}`,
        source: platform,
        timestamp: date.toISOString(),
        type: 'active_minutes',
        value: Math.floor(20 + Math.random() * 60),
        unit: 'minutes',
      });

      // Sleep
      data.push({
        id: `${platform}_sleep_${date.toISOString()}`,
        source: platform,
        timestamp: date.toISOString(),
        type: 'sleep_duration',
        value: Math.floor(5 + Math.random() * 4),
        unit: 'hours',
      });
    }

    return data;
  }

  // --------------------------------------------------------------------------
  // AUTO SYNC
  // --------------------------------------------------------------------------

  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.config.enableAutoSync && this.config.syncInterval > 0) {
      this.syncTimer = setInterval(() => {
        // Check WiFi if required
        if (this.config.syncOnWifi && !this.isOnWifi()) {
          logger.debug('[WearableSync] Skipping sync - not on WiFi');
          return;
        }

        this.syncAll();
      }, this.config.syncInterval * 60 * 1000);

      logger.info('[WearableSync] Auto-sync started, interval:', this.config.syncInterval, 'min');
    }
  }

  private isOnWifi(): boolean {
    // Check network type if available
    const connection = (navigator as Navigator & { connection?: { type?: string } }).connection;
    if (connection?.type) {
      return connection.type === 'wifi' || connection.type === 'ethernet';
    }
    return true; // Assume WiFi if we can't detect
  }

  // --------------------------------------------------------------------------
  // DATA ACCESS
  // --------------------------------------------------------------------------

  private loadHealthData(): void {
    try {
      const stored = localStorage.getItem(DATA_KEY);
      if (stored) {
        this.healthData = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('[WearableSync] Failed to load health data:', error);
    }
  }

  private saveHealthData(): void {
    try {
      // Keep only last 30 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      this.healthData = this.healthData.filter(d =>
        new Date(d.timestamp) >= cutoff
      );

      localStorage.setItem(DATA_KEY, JSON.stringify(this.healthData));
    } catch (error) {
      logger.error('[WearableSync] Failed to save health data:', error);
    }
  }

  /**
   * Get all health data
   */
  public getHealthData(): HealthData[] {
    return [...this.healthData];
  }

  /**
   * Get health data by type
   */
  public getDataByType(type: HealthDataType): HealthData[] {
    return this.healthData.filter(d => d.type === type);
  }

  /**
   * Get health data for date range
   */
  public getDataInRange(start: Date, end: Date): HealthData[] {
    return this.healthData.filter(d => {
      const timestamp = new Date(d.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  }

  /**
   * Get latest value for a data type
   */
  public getLatestValue(type: HealthDataType): HealthData | null {
    const data = this.getDataByType(type);
    if (data.length === 0) return null;

    return data.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }

  /**
   * Get aggregated data for a period
   */
  public getAggregatedData(
    type: HealthDataType,
    period: 'day' | 'week' | 'month'
  ): { date: string; value: number }[] {
    const data = this.getDataByType(type);
    const aggregated: Map<string, number[]> = new Map();

    data.forEach(d => {
      const date = new Date(d.timestamp);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!aggregated.has(key)) {
        aggregated.set(key, []);
      }
      aggregated.get(key)!.push(d.value);
    });

    return Array.from(aggregated.entries())
      .map(([date, values]) => ({
        date,
        value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Clear all health data
   */
  public clearHealthData(): void {
    this.healthData = [];
    localStorage.removeItem(DATA_KEY);
    logger.info('[WearableSync] Health data cleared');
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS
  // --------------------------------------------------------------------------

  public setOnSyncComplete(callback: (result: SyncResult) => void): void {
    this.onSyncComplete = callback;
  }

  public setOnDataUpdate(callback: (data: HealthData[]) => void): void {
    this.onDataUpdate = callback;
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  public dispose(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const wearableSyncService = new WearableSyncService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useWearableSync() {
  const [connections, setConnections] = useState<WearableConnection[]>(
    wearableSyncService.getConnections()
  );
  const [healthData, setHealthData] = useState<HealthData[]>(
    wearableSyncService.getHealthData()
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    wearableSyncService.setOnSyncComplete((result) => {
      setLastSyncResult(result);
      setSyncing(false);
    });

    wearableSyncService.setOnDataUpdate(setHealthData);

    return () => {
      wearableSyncService.setOnSyncComplete(() => {});
      wearableSyncService.setOnDataUpdate(() => {});
    };
  }, []);

  const connect = useCallback(async (platform: WearablePlatform) => {
    const success = await wearableSyncService.connect(platform);
    setConnections(wearableSyncService.getConnections());
    return success;
  }, []);

  const disconnect = useCallback(async (platform: WearablePlatform) => {
    await wearableSyncService.disconnect(platform);
    setConnections(wearableSyncService.getConnections());
  }, []);

  const syncAll = useCallback(async () => {
    setSyncing(true);
    const results = await wearableSyncService.syncAll();
    setHealthData(wearableSyncService.getHealthData());
    setSyncing(false);
    return results;
  }, []);

  const syncPlatform = useCallback(async (platform: WearablePlatform) => {
    setSyncing(true);
    const result = await wearableSyncService.syncPlatform(platform);
    setHealthData(wearableSyncService.getHealthData());
    setSyncing(false);
    return result;
  }, []);

  return {
    // State
    connections,
    healthData,
    syncing,
    lastSyncResult,

    // Methods
    connect,
    disconnect,
    syncAll,
    syncPlatform,

    // Data access
    getDataByType: wearableSyncService.getDataByType.bind(wearableSyncService),
    getDataInRange: wearableSyncService.getDataInRange.bind(wearableSyncService),
    getLatestValue: wearableSyncService.getLatestValue.bind(wearableSyncService),
    getAggregatedData: wearableSyncService.getAggregatedData.bind(wearableSyncService),

    // Config
    config: wearableSyncService.getConfig(),
    updateConfig: wearableSyncService.updateConfig.bind(wearableSyncService),
  };
}

export default wearableSyncService;
