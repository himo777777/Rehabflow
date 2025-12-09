/**
 * Biometric Service - Sprint 5.8
 *
 * Integrates with wearable devices and sensors for biometric data.
 * Features:
 * - Web Bluetooth API for heart rate monitors
 * - Heart rate tracking
 * - HRV (Heart Rate Variability) calculation
 * - Recovery score estimation
 * - Training zone monitoring
 * - Data persistence
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface HeartRateData {
  timestamp: number;
  bpm: number;
  rrIntervals?: number[]; // R-R intervals in ms (for HRV)
  energyExpended?: number; // kJ
  sensorContact?: boolean;
}

export interface HRVMetrics {
  rmssd: number; // Root Mean Square of Successive Differences
  sdnn: number;  // Standard Deviation of NN intervals
  pnn50: number; // Percentage of NN50
  meanRR: number; // Mean R-R interval
  timestamp: number;
}

export interface BiometricSession {
  id: string;
  startTime: number;
  endTime?: number;
  heartRateData: HeartRateData[];
  hrvMetrics?: HRVMetrics;
  averageHR: number;
  maxHR: number;
  minHR: number;
  caloriesBurned: number;
  exerciseName?: string;
}

export interface TrainingZone {
  name: string;
  minPercent: number;
  maxPercent: number;
  color: string;
  description: string;
}

export interface BiometricConfig {
  maxHeartRate: number; // User's estimated max HR
  restingHeartRate: number;
  age: number;
  enableHRV: boolean;
  sampleInterval: number; // ms between readings
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// ============================================================================
// CONSTANTS
// ============================================================================

// Heart Rate Service UUID
const HR_SERVICE_UUID = 'heart_rate';
const HR_MEASUREMENT_UUID = 'heart_rate_measurement';
const HR_CONTROL_POINT_UUID = 'heart_rate_control_point';

// Training zones (percentage of max heart rate)
export const TRAINING_ZONES: TrainingZone[] = [
  {
    name: 'Vila',
    minPercent: 0,
    maxPercent: 50,
    color: '#94a3b8',
    description: 'Återhämtning och vila'
  },
  {
    name: 'Lätt',
    minPercent: 50,
    maxPercent: 60,
    color: '#22c55e',
    description: 'Fettförbränning, lätt aktivitet'
  },
  {
    name: 'Måttlig',
    minPercent: 60,
    maxPercent: 70,
    color: '#84cc16',
    description: 'Aerob zon, uthållighet'
  },
  {
    name: 'Intensiv',
    minPercent: 70,
    maxPercent: 80,
    color: '#eab308',
    description: 'Kardio-träning, prestationsökning'
  },
  {
    name: 'Maximal',
    minPercent: 80,
    maxPercent: 90,
    color: '#f97316',
    description: 'Anaerob zon, styrkeökning'
  },
  {
    name: 'Peak',
    minPercent: 90,
    maxPercent: 100,
    color: '#ef4444',
    description: 'Maximal ansträngning'
  }
];

// Storage keys
const CONFIG_KEY = 'rehabflow-biometric-config';
const SESSIONS_KEY = 'rehabflow-biometric-sessions';

// Default config
const DEFAULT_CONFIG: BiometricConfig = {
  maxHeartRate: 180, // Will be calculated from age
  restingHeartRate: 60,
  age: 35,
  enableHRV: true,
  sampleInterval: 1000, // 1 second
};

// ============================================================================
// BIOMETRIC SERVICE
// ============================================================================

class BiometricService {
  private config: BiometricConfig = DEFAULT_CONFIG;
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private currentSession: BiometricSession | null = null;
  private onHeartRateUpdate: ((data: HeartRateData) => void) | null = null;
  private onConnectionChange: ((state: ConnectionState) => void) | null = null;
  private rrBuffer: number[] = [];

  constructor() {
    this.loadConfig();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Check if Web Bluetooth is supported
   */
  public isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Check if already connected
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Get connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
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

      // Calculate max HR from age if default
      if (this.config.maxHeartRate === DEFAULT_CONFIG.maxHeartRate) {
        this.config.maxHeartRate = this.calculateMaxHR(this.config.age);
      }
    } catch (error) {
      logger.error('[Biometric] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Biometric] Failed to save config:', error);
    }
  }

  public getConfig(): BiometricConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<BiometricConfig>): void {
    this.config = { ...this.config, ...updates };

    // Recalculate max HR if age changed
    if (updates.age !== undefined) {
      this.config.maxHeartRate = this.calculateMaxHR(updates.age);
    }

    this.saveConfig();
    logger.debug('[Biometric] Config updated:', updates);
  }

  /**
   * Calculate max heart rate using Tanaka formula
   */
  private calculateMaxHR(age: number): number {
    return Math.round(208 - (0.7 * age));
  }

  // --------------------------------------------------------------------------
  // BLUETOOTH CONNECTION
  // --------------------------------------------------------------------------

  /**
   * Connect to heart rate monitor
   */
  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      logger.error('[Biometric] Web Bluetooth not supported');
      return false;
    }

    this.setConnectionState('connecting');

    try {
      // Request device with heart rate service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HR_SERVICE_UUID] }],
        optionalServices: ['battery_service']
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnection();
      });

      // Connect to GATT server
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get heart rate service
      const service = await server.getPrimaryService(HR_SERVICE_UUID);

      // Get heart rate measurement characteristic
      this.characteristic = await service.getCharacteristic(HR_MEASUREMENT_UUID);

      // Start notifications
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleHeartRateChange(event);
      });

      this.setConnectionState('connected');
      logger.info('[Biometric] Connected to:', this.device.name);

      return true;
    } catch (error) {
      logger.error('[Biometric] Connection failed:', error);
      this.setConnectionState('error');
      return false;
    }
  }

  /**
   * Disconnect from device
   */
  public disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }

    this.handleDisconnection();
  }

  private handleDisconnection(): void {
    this.device = null;
    this.characteristic = null;
    this.setConnectionState('disconnected');

    // End current session if active
    if (this.currentSession) {
      this.endSession();
    }

    logger.info('[Biometric] Disconnected');
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    if (this.onConnectionChange) {
      this.onConnectionChange(state);
    }
  }

  // --------------------------------------------------------------------------
  // HEART RATE DATA
  // --------------------------------------------------------------------------

  private handleHeartRateChange(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (!value) return;

    const data = this.parseHeartRateMeasurement(value);

    // Add to current session
    if (this.currentSession) {
      this.currentSession.heartRateData.push(data);

      // Add RR intervals to buffer for HRV
      if (data.rrIntervals && this.config.enableHRV) {
        this.rrBuffer.push(...data.rrIntervals);
      }
    }

    // Notify listeners
    if (this.onHeartRateUpdate) {
      this.onHeartRateUpdate(data);
    }

    logger.debug('[Biometric] HR:', data.bpm, 'bpm');
  }

  /**
   * Parse heart rate measurement according to Bluetooth SIG spec
   */
  private parseHeartRateMeasurement(value: DataView): HeartRateData {
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    const hasSensorContact = (flags & 0x04) !== 0;
    const sensorContactSupported = (flags & 0x02) !== 0;
    const hasEnergyExpended = (flags & 0x08) !== 0;
    const hasRRInterval = (flags & 0x10) !== 0;

    let offset = 1;

    // Parse heart rate value
    let bpm: number;
    if (is16Bit) {
      bpm = value.getUint16(offset, true);
      offset += 2;
    } else {
      bpm = value.getUint8(offset);
      offset += 1;
    }

    const data: HeartRateData = {
      timestamp: Date.now(),
      bpm,
    };

    // Sensor contact (if supported)
    if (sensorContactSupported) {
      data.sensorContact = hasSensorContact;
    }

    // Energy expended
    if (hasEnergyExpended) {
      data.energyExpended = value.getUint16(offset, true);
      offset += 2;
    }

    // R-R intervals
    if (hasRRInterval) {
      const rrIntervals: number[] = [];
      while (offset < value.byteLength) {
        // RR intervals are in 1/1024 seconds, convert to ms
        const rr = (value.getUint16(offset, true) / 1024) * 1000;
        rrIntervals.push(rr);
        offset += 2;
      }
      data.rrIntervals = rrIntervals;
    }

    return data;
  }

  // --------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Start a new biometric session
   */
  public startSession(exerciseName?: string): BiometricSession | null {
    if (!this.isConnected()) {
      logger.warn('[Biometric] Not connected');
      return null;
    }

    if (this.currentSession) {
      this.endSession();
    }

    this.rrBuffer = [];

    this.currentSession = {
      id: `bio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      startTime: Date.now(),
      heartRateData: [],
      averageHR: 0,
      maxHR: 0,
      minHR: Infinity,
      caloriesBurned: 0,
      exerciseName,
    };

    logger.info('[Biometric] Session started:', this.currentSession.id);
    return this.currentSession;
  }

  /**
   * End current session and calculate metrics
   */
  public endSession(): BiometricSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();

    // Calculate summary metrics
    const hrData = this.currentSession.heartRateData;
    if (hrData.length > 0) {
      const hrValues = hrData.map(d => d.bpm);

      this.currentSession.averageHR = Math.round(
        hrValues.reduce((a, b) => a + b, 0) / hrValues.length
      );
      this.currentSession.maxHR = Math.max(...hrValues);
      this.currentSession.minHR = Math.min(...hrValues);

      // Calculate calories (simplified formula)
      const durationMinutes = (this.currentSession.endTime - this.currentSession.startTime) / 60000;
      this.currentSession.caloriesBurned = this.calculateCalories(
        this.currentSession.averageHR,
        durationMinutes
      );

      // Calculate HRV metrics
      if (this.config.enableHRV && this.rrBuffer.length > 10) {
        this.currentSession.hrvMetrics = this.calculateHRV(this.rrBuffer);
      }
    }

    // Save session
    this.saveSession(this.currentSession);

    logger.info('[Biometric] Session ended:', {
      avgHR: this.currentSession.averageHR,
      maxHR: this.currentSession.maxHR,
      calories: this.currentSession.caloriesBurned
    });

    const session = this.currentSession;
    this.currentSession = null;
    this.rrBuffer = [];

    return session;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): BiometricSession | null {
    return this.currentSession;
  }

  // --------------------------------------------------------------------------
  // HRV CALCULATION
  // --------------------------------------------------------------------------

  /**
   * Calculate HRV metrics from R-R intervals
   */
  private calculateHRV(rrIntervals: number[]): HRVMetrics {
    // Filter outliers (unrealistic intervals)
    const filtered = rrIntervals.filter(rr => rr > 300 && rr < 2000);

    if (filtered.length < 2) {
      return {
        rmssd: 0,
        sdnn: 0,
        pnn50: 0,
        meanRR: 0,
        timestamp: Date.now()
      };
    }

    // Mean R-R
    const meanRR = filtered.reduce((a, b) => a + b, 0) / filtered.length;

    // SDNN (Standard Deviation of NN intervals)
    const squaredDiffs = filtered.map(rr => Math.pow(rr - meanRR, 2));
    const sdnn = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / filtered.length);

    // RMSSD (Root Mean Square of Successive Differences)
    const successiveDiffs: number[] = [];
    for (let i = 1; i < filtered.length; i++) {
      successiveDiffs.push(Math.pow(filtered[i] - filtered[i - 1], 2));
    }
    const rmssd = Math.sqrt(successiveDiffs.reduce((a, b) => a + b, 0) / successiveDiffs.length);

    // pNN50 (Percentage of successive intervals differing by > 50ms)
    let nn50Count = 0;
    for (let i = 1; i < filtered.length; i++) {
      if (Math.abs(filtered[i] - filtered[i - 1]) > 50) {
        nn50Count++;
      }
    }
    const pnn50 = (nn50Count / (filtered.length - 1)) * 100;

    return {
      rmssd: Math.round(rmssd * 10) / 10,
      sdnn: Math.round(sdnn * 10) / 10,
      pnn50: Math.round(pnn50 * 10) / 10,
      meanRR: Math.round(meanRR),
      timestamp: Date.now()
    };
  }

  // --------------------------------------------------------------------------
  // TRAINING ZONES
  // --------------------------------------------------------------------------

  /**
   * Get current training zone
   */
  public getCurrentZone(heartRate: number): TrainingZone {
    const percentOfMax = (heartRate / this.config.maxHeartRate) * 100;

    for (let i = TRAINING_ZONES.length - 1; i >= 0; i--) {
      if (percentOfMax >= TRAINING_ZONES[i].minPercent) {
        return TRAINING_ZONES[i];
      }
    }

    return TRAINING_ZONES[0];
  }

  /**
   * Get heart rate for a specific zone
   */
  public getZoneHeartRate(zoneName: string): { min: number; max: number } {
    const zone = TRAINING_ZONES.find(z => z.name === zoneName);
    if (!zone) {
      return { min: 0, max: this.config.maxHeartRate };
    }

    return {
      min: Math.round(this.config.maxHeartRate * (zone.minPercent / 100)),
      max: Math.round(this.config.maxHeartRate * (zone.maxPercent / 100))
    };
  }

  /**
   * Get all zone ranges
   */
  public getAllZoneRanges(): Array<TrainingZone & { hrMin: number; hrMax: number }> {
    return TRAINING_ZONES.map(zone => ({
      ...zone,
      hrMin: Math.round(this.config.maxHeartRate * (zone.minPercent / 100)),
      hrMax: Math.round(this.config.maxHeartRate * (zone.maxPercent / 100))
    }));
  }

  // --------------------------------------------------------------------------
  // CALORIE CALCULATION
  // --------------------------------------------------------------------------

  /**
   * Simplified calorie calculation
   * More accurate would require weight, gender, etc.
   */
  private calculateCalories(avgHR: number, durationMinutes: number): number {
    // Simplified formula (approximate)
    // Actual formula varies by gender, weight, age
    const caloriesPerMinute = (avgHR * 0.05) - 2;
    return Math.round(Math.max(0, caloriesPerMinute * durationMinutes));
  }

  // --------------------------------------------------------------------------
  // RECOVERY SCORE
  // --------------------------------------------------------------------------

  /**
   * Calculate recovery score based on HRV
   * Higher RMSSD generally indicates better recovery
   */
  public getRecoveryScore(hrvMetrics: HRVMetrics): {
    score: number;
    status: 'low' | 'moderate' | 'good' | 'excellent';
    recommendation: string;
  } {
    // Normalize RMSSD to a 0-100 scale
    // Typical RMSSD ranges from 20-120ms
    const normalizedRmssd = Math.min(100, Math.max(0, ((hrvMetrics.rmssd - 20) / 100) * 100));

    let status: 'low' | 'moderate' | 'good' | 'excellent';
    let recommendation: string;

    if (normalizedRmssd >= 75) {
      status = 'excellent';
      recommendation = 'Din kropp är väl återhämtad. Perfekt dag för intensiv träning!';
    } else if (normalizedRmssd >= 50) {
      status = 'good';
      recommendation = 'Bra återhämtning. Du kan träna som vanligt.';
    } else if (normalizedRmssd >= 25) {
      status = 'moderate';
      recommendation = 'Måttlig återhämtning. Ta det lite lugnare idag.';
    } else {
      status = 'low';
      recommendation = 'Låg återhämtning. Fokusera på lätt aktivitet och vila.';
    }

    return {
      score: Math.round(normalizedRmssd),
      status,
      recommendation
    };
  }

  // --------------------------------------------------------------------------
  // DATA PERSISTENCE
  // --------------------------------------------------------------------------

  private saveSession(session: BiometricSession): void {
    try {
      const sessions = this.getSavedSessions();
      sessions.push(session);

      // Keep only last 100 sessions
      const trimmed = sessions.slice(-100);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      logger.error('[Biometric] Failed to save session:', error);
    }
  }

  /**
   * Get saved biometric sessions
   */
  public getSavedSessions(): BiometricSession[] {
    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get session by ID
   */
  public getSessionById(id: string): BiometricSession | null {
    const sessions = this.getSavedSessions();
    return sessions.find(s => s.id === id) || null;
  }

  /**
   * Clear all saved sessions
   */
  public clearSessions(): void {
    localStorage.removeItem(SESSIONS_KEY);
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS
  // --------------------------------------------------------------------------

  public setOnHeartRateUpdate(callback: (data: HeartRateData) => void): void {
    this.onHeartRateUpdate = callback;
  }

  public setOnConnectionChange(callback: (state: ConnectionState) => void): void {
    this.onConnectionChange = callback;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const biometricService = new BiometricService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useBiometric() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    biometricService.getConnectionState()
  );
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [currentZone, setCurrentZone] = useState<TrainingZone | null>(null);
  const [currentSession, setCurrentSession] = useState<BiometricSession | null>(null);

  useEffect(() => {
    biometricService.setOnConnectionChange(setConnectionState);

    biometricService.setOnHeartRateUpdate((data) => {
      setHeartRate(data.bpm);
      setCurrentZone(biometricService.getCurrentZone(data.bpm));
    });

    return () => {
      biometricService.setOnConnectionChange(() => {});
      biometricService.setOnHeartRateUpdate(() => {});
    };
  }, []);

  const connect = useCallback(async () => {
    return biometricService.connect();
  }, []);

  const disconnect = useCallback(() => {
    biometricService.disconnect();
    setHeartRate(null);
    setCurrentZone(null);
  }, []);

  const startSession = useCallback((exerciseName?: string) => {
    const session = biometricService.startSession(exerciseName);
    setCurrentSession(session);
    return session;
  }, []);

  const endSession = useCallback(() => {
    const session = biometricService.endSession();
    setCurrentSession(null);
    return session;
  }, []);

  return {
    // State
    isSupported: biometricService.isSupported(),
    connectionState,
    isConnected: connectionState === 'connected',
    heartRate,
    currentZone,
    currentSession,

    // Methods
    connect,
    disconnect,
    startSession,
    endSession,

    // Config
    config: biometricService.getConfig(),
    updateConfig: biometricService.updateConfig.bind(biometricService),

    // Zones
    getAllZoneRanges: biometricService.getAllZoneRanges.bind(biometricService),
    getZoneHeartRate: biometricService.getZoneHeartRate.bind(biometricService),

    // Data
    getSavedSessions: biometricService.getSavedSessions.bind(biometricService),
    getSessionById: biometricService.getSessionById.bind(biometricService),
    getRecoveryScore: biometricService.getRecoveryScore.bind(biometricService),
  };
}

export default biometricService;
