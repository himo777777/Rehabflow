/**
 * usePainPrediction Hook
 *
 * React hook for pain prediction functionality
 * Provides ML-based pain forecasting, trend analysis, and recommendations
 *
 * @module usePainPrediction
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPainPredictionService,
  PainPrediction,
  PainTrendAnalysis
} from '../services/painPredictionService';
import { supabase } from '../services/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface PainPredictionState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  prediction24h: PainPrediction | null;
  prediction48h: PainPrediction | null;
  trendAnalysis: PainTrendAnalysis | null;
  lastPredictionDate: Date | null;
  accuracyMetrics: AccuracyMetrics | null;
}

export interface AccuracyMetrics {
  mae24h: number; // Mean Absolute Error
  mae48h: number;
  accuracy1Point24h: number; // % predictions within 1 point
  accuracy1Point48h: number;
  totalPredictions: number;
}

export interface UsePainPredictionReturn {
  state: PainPredictionState;
  generatePrediction: () => Promise<boolean>;
  refreshPrediction: () => Promise<void>;
  getAccuracyMetrics: () => Promise<AccuracyMetrics | null>;
  hasSufficientData: () => Promise<boolean>;
}

// ============================================================================
// HOOK
// ============================================================================

export const usePainPrediction = (): UsePainPredictionReturn => {
  const [state, setState] = useState<PainPredictionState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    prediction24h: null,
    prediction48h: null,
    trendAnalysis: null,
    lastPredictionDate: null,
    accuracyMetrics: null
  });

  const painPredictionService = getPainPredictionService();

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  useEffect(() => {
    const initialize = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Initialize pain prediction service
        await painPredictionService.initialize();

        // Load last prediction
        await loadLastPrediction();

        // Load accuracy metrics
        const metrics = await fetchAccuracyMetrics();

        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          accuracyMetrics: metrics
        }));
      } catch (error) {
        console.error('❌ Failed to initialize pain prediction:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Initialization failed'
        }));
      }
    };

    initialize();
  }, []);

  // --------------------------------------------------------------------------
  // DATA LOADING
  // --------------------------------------------------------------------------

  /**
   * Load last prediction from database
   */
  const loadLastPrediction = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pain_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('prediction_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return;

      // Check if prediction is still recent (within last 12 hours)
      const predictionDate = new Date(data.prediction_date);
      const hoursSince = (Date.now() - predictionDate.getTime()) / (1000 * 60 * 60);

      if (hoursSince < 12) {
        // Reconstruct prediction objects
        const prediction24h: PainPrediction = {
          timestamp: predictionDate,
          horizon: 24,
          predictedPain: data.horizon_24h,
          confidenceInterval: {
            lower: Math.max(0, data.horizon_24h - 1.5),
            upper: Math.min(10, data.horizon_24h + 1.5)
          },
          confidence: data.confidence_24h,
          riskLevel: data.risk_level_24h,
          contributingFactors: [],
          recommendations: []
        };

        const prediction48h: PainPrediction = {
          timestamp: predictionDate,
          horizon: 48,
          predictedPain: data.horizon_48h,
          confidenceInterval: {
            lower: Math.max(0, data.horizon_48h - 2.5),
            upper: Math.min(10, data.horizon_48h + 2.5)
          },
          confidence: data.confidence_48h,
          riskLevel: data.risk_level_48h,
          contributingFactors: [],
          recommendations: []
        };

        setState(prev => ({
          ...prev,
          prediction24h,
          prediction48h,
          lastPredictionDate: predictionDate
        }));
      }
    } catch (error) {
      console.error('Failed to load last prediction:', error);
    }
  };

  /**
   * Fetch accuracy metrics
   */
  const fetchAccuracyMetrics = async (): Promise<AccuracyMetrics | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('calculate_prediction_accuracy', {
          p_user_id: user.id,
          p_days_back: 30
        })
        .single();

      if (error || !data) return null;

      // Type assertion for RPC response
      const result = data as {
        mae_24h: number;
        mae_48h: number;
        accuracy_1point_24h: number;
        accuracy_1point_48h: number;
        total_predictions: number;
      };

      return {
        mae24h: result.mae_24h,
        mae48h: result.mae_48h,
        accuracy1Point24h: result.accuracy_1point_24h,
        accuracy1Point48h: result.accuracy_1point_48h,
        totalPredictions: result.total_predictions
      };
    } catch (error) {
      console.error('Failed to fetch accuracy metrics:', error);
      return null;
    }
  };

  // --------------------------------------------------------------------------
  // PUBLIC METHODS
  // --------------------------------------------------------------------------

  /**
   * Generate new pain prediction
   */
  const generatePrediction = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has sufficient data
      const hasSufficient = await checkSufficientData();
      if (!hasSufficient) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Insufficient pain history. Log pain for at least 7 days to enable predictions.'
        }));
        return false;
      }

      // Generate prediction
      const result = await painPredictionService.predict(user.id);

      if (!result) {
        throw new Error('Failed to generate prediction');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        prediction24h: result.prediction24h,
        prediction48h: result.prediction48h,
        trendAnalysis: result.trendAnalysis,
        lastPredictionDate: new Date()
      }));

      return true;
    } catch (error) {
      console.error('❌ Prediction generation failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Prediction failed'
      }));
      return false;
    }
  }, []);

  /**
   * Refresh prediction (reload from database)
   */
  const refreshPrediction = useCallback(async (): Promise<void> => {
    await loadLastPrediction();
    const metrics = await fetchAccuracyMetrics();
    setState(prev => ({ ...prev, accuracyMetrics: metrics }));
  }, []);

  /**
   * Get current accuracy metrics
   */
  const getAccuracyMetrics = useCallback(async (): Promise<AccuracyMetrics | null> => {
    return await fetchAccuracyMetrics();
  }, []);

  /**
   * Check if user has sufficient data for predictions
   */
  const hasSufficientData = useCallback(async (): Promise<boolean> => {
    return await checkSufficientData();
  }, []);

  /**
   * Check if user has sufficient pain history data
   */
  const checkSufficientData = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('pain_tracking')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      return !error && data && data.length >= 7;
    } catch (error) {
      console.error('Failed to check data sufficiency:', error);
      return false;
    }
  };

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------

  return {
    state,
    generatePrediction,
    refreshPrediction,
    getAccuracyMetrics,
    hasSufficientData
  };
};
