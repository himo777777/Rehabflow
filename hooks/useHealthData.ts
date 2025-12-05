/**
 * useHealthData Hook
 *
 * React hook for managing health data integration
 * Provides easy access to HealthKit data, synchronization, and analytics
 *
 * @module useHealthData
 */

import { useState, useEffect, useCallback } from 'react';
import {
  healthDataService,
  HealthDataType,
  HealthDataSource,
  HealthKitPermissions,
  HealthDataSyncResult
} from '../services/healthDataService';
import { supabase } from '../services/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface HealthDataState {
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  lastSyncDate: Date | null;
  dailySummary: DailySummary | null;
  recoveryScore: number | null;
}

export interface DailySummary {
  steps: number;
  distance: number;
  activeEnergy: number;
  sleepHours: number;
  averageHeartRate: number;
}

export interface UseHealthDataReturn {
  state: HealthDataState;
  requestAuthorization: () => Promise<boolean>;
  syncData: () => Promise<HealthDataSyncResult>;
  getDailySummary: (date?: Date) => Promise<DailySummary>;
  getRecoveryScore: () => Promise<number>;
  getWeeklyTrend: (dataType: HealthDataType) => Promise<number[]>;
  addManualData: (dataType: HealthDataType, value: number, unit: string, date?: Date) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export const useHealthData = (): UseHealthDataReturn => {
  const [state, setState] = useState<HealthDataState>({
    isAvailable: false,
    isAuthorized: false,
    isLoading: true,
    error: null,
    lastSyncDate: null,
    dailySummary: null,
    recoveryScore: null
  });

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  useEffect(() => {
    const initialize = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if HealthKit is available
        const available = healthDataService.isAvailable();

        // Check authorization status
        let authorized = false;
        if (available) {
          authorized = await healthDataService.checkAuthorization();
        }

        // Load preferences and last sync date
        const { data: { user } } = await supabase.auth.getUser();
        let lastSync: Date | null = null;

        if (user) {
          const { data: prefs } = await supabase
            .from('health_data_preferences')
            .select('last_sync_date')
            .eq('user_id', user.id)
            .single();

          lastSync = prefs?.last_sync_date ? new Date(prefs.last_sync_date) : null;
        }

        setState(prev => ({
          ...prev,
          isAvailable: available,
          isAuthorized: authorized,
          isLoading: false,
          lastSyncDate: lastSync
        }));

        // If authorized, load initial data
        if (authorized && user) {
          await loadDashboardData(user.id);
        }
      } catch (error) {
        console.error('❌ Failed to initialize health data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize'
        }));
      }
    };

    initialize();
  }, []);

  // --------------------------------------------------------------------------
  // DATA LOADING
  // --------------------------------------------------------------------------

  const loadDashboardData = async (userId: string): Promise<void> => {
    try {
      // Load daily summary and recovery score
      const [summary, score] = await Promise.all([
        healthDataService.getDailyActivitySummary(userId),
        healthDataService.calculateRecoveryScore(userId)
      ]);

      setState(prev => ({
        ...prev,
        dailySummary: summary,
        recoveryScore: score
      }));
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    }
  };

  // --------------------------------------------------------------------------
  // PUBLIC METHODS
  // --------------------------------------------------------------------------

  /**
   * Request HealthKit authorization
   */
  const requestAuthorization = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Define permissions
      const permissions: HealthKitPermissions = {
        read: [
          HealthDataType.STEPS,
          HealthDataType.DISTANCE,
          HealthDataType.ACTIVE_ENERGY,
          HealthDataType.HEART_RATE,
          HealthDataType.HRV,
          HealthDataType.RESTING_HEART_RATE,
          HealthDataType.SLEEP_ANALYSIS,
          HealthDataType.WORKOUT,
          HealthDataType.WEIGHT,
          HealthDataType.HEIGHT
        ],
        write: [] // No write permissions needed for passive collection
      };

      const granted = await healthDataService.requestAuthorization(permissions);

      setState(prev => ({
        ...prev,
        isAuthorized: granted,
        isLoading: false
      }));

      // If granted, perform initial sync
      if (granted) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await syncData();
        }
      }

      return granted;
    } catch (error) {
      console.error('❌ Authorization failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authorization failed'
      }));
      return false;
    }
  }, []);

  /**
   * Sync health data from HealthKit
   */
  const syncData = useCallback(async (): Promise<HealthDataSyncResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await healthDataService.syncHealthData(user.id);

      // Update last sync date
      if (result.success) {
        await supabase
          .from('health_data_preferences')
          .upsert({
            user_id: user.id,
            last_sync_date: result.lastSyncDate.toISOString()
          }, {
            onConflict: 'user_id'
          });

        // Log sync
        await supabase
          .from('health_data_sync_log')
          .insert({
            user_id: user.id,
            sync_date: result.lastSyncDate.toISOString(),
            data_types: Object.values(HealthDataType),
            data_points_synced: result.dataPoints,
            success: result.success,
            errors: result.errors,
            source: HealthDataSource.HEALTHKIT
          });

        // Reload dashboard data
        await loadDashboardData(user.id);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncDate: result.lastSyncDate
      }));

      return result;
    } catch (error) {
      console.error('❌ Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return {
        success: false,
        dataPoints: 0,
        errors: [errorMessage],
        lastSyncDate: new Date()
      };
    }
  }, []);

  /**
   * Get daily activity summary
   */
  const getDailySummary = useCallback(async (date: Date = new Date()): Promise<DailySummary> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const summary = await healthDataService.getDailyActivitySummary(user.id, date);
      return summary;
    } catch (error) {
      console.error('❌ Failed to get daily summary:', error);
      return {
        steps: 0,
        distance: 0,
        activeEnergy: 0,
        sleepHours: 0,
        averageHeartRate: 0
      };
    }
  }, []);

  /**
   * Get recovery score
   */
  const getRecoveryScore = useCallback(async (): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const score = await healthDataService.calculateRecoveryScore(user.id);
      setState(prev => ({ ...prev, recoveryScore: score }));
      return score;
    } catch (error) {
      console.error('❌ Failed to get recovery score:', error);
      return 0;
    }
  }, []);

  /**
   * Get weekly trend for a data type
   */
  const getWeeklyTrend = useCallback(async (dataType: HealthDataType): Promise<number[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await healthDataService.getWeeklyTrend(user.id, dataType);
    } catch (error) {
      console.error('❌ Failed to get weekly trend:', error);
      return [0, 0, 0, 0, 0, 0, 0];
    }
  }, []);

  /**
   * Add manual health data
   */
  const addManualData = useCallback(async (
    dataType: HealthDataType,
    value: number,
    unit: string,
    date: Date = new Date()
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const success = await healthDataService.addManualData(user.id, dataType, value, unit, date);

      if (success) {
        // Reload dashboard data
        await loadDashboardData(user.id);
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return success;
    } catch (error) {
      console.error('❌ Failed to add manual data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add data'
      }));
      return false;
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await loadDashboardData(user.id);
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  }, []);

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------

  return {
    state,
    requestAuthorization,
    syncData,
    getDailySummary,
    getRecoveryScore,
    getWeeklyTrend,
    addManualData,
    refreshData
  };
};
