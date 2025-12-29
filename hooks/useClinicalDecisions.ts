/**
 * useClinicalDecisions Hook
 *
 * React hook for managing clinical decision support functionality.
 * Provides real-time decisions, intervention tracking, and AI recommendations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ClinicalDecision,
  ClinicalSignal,
  InterventionRecommendation,
  Intervention,
  CDSDashboard,
  collectClinicalSignals,
  generateClinicalDecisions,
  enhanceWithAIRecommendations,
  recordIntervention,
  completeIntervention,
  getCDSDashboard,
  processProviderPatients,
  getClinicalGuidelines,
  ClinicalGuideline
} from '../services/clinicalDecisionService';

// ============================================================================
// TYPES
// ============================================================================

interface PatientCDSContext {
  id: string;
  name: string;
  diagnosis: string;
  currentPhase: number;
  totalPhases: number;
  adherencePercent: number;
  latestPainLevel: number;
  painTrend: 'improving' | 'stable' | 'worsening';
  daysInCurrentPhase: number;
  lastExerciseDate?: string;
  psychologicalFactors?: {
    tsk11Score?: number;
    promis29Anxiety?: number;
    promis29Depression?: number;
  };
  movementQuality?: {
    averageFormScore: number;
    compensationPatterns: string[];
  };
}

interface UseClinicalDecisionsOptions {
  patientId?: string;
  providerId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableAIEnhancement?: boolean;
}

interface UseClinicalDecisionsReturn {
  // State
  decisions: ClinicalDecision[];
  signals: ClinicalSignal[];
  interventions: Intervention[];
  dashboard: CDSDashboard | null;
  guidelines: ClinicalGuideline[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  refreshDecisions: () => Promise<void>;
  acknowledgeDecision: (decisionId: string) => Promise<void>;
  dismissDecision: (decisionId: string) => Promise<void>;
  executeAction: (decision: ClinicalDecision, recommendation: InterventionRecommendation, notes?: string) => Promise<Intervention>;
  completeAction: (interventionId: string, outcome: string) => Promise<void>;
  getDecisionsByPriority: (priority: ClinicalDecision['priority']) => ClinicalDecision[];
  getDecisionsByCategory: (category: ClinicalDecision['category']) => ClinicalDecision[];
  getCriticalDecisions: () => ClinicalDecision[];
  getGuidelineForDecision: (decision: ClinicalDecision) => ClinicalGuideline | undefined;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useClinicalDecisions(
  options: UseClinicalDecisionsOptions = {}
): UseClinicalDecisionsReturn {
  const {
    patientId,
    providerId = 'default-provider',
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
    enableAIEnhancement = true
  } = options;

  // State
  const [decisions, setDecisions] = useState<ClinicalDecision[]>([]);
  const [signals, setSignals] = useState<ClinicalSignal[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [dashboard, setDashboard] = useState<CDSDashboard | null>(null);
  const [guidelines] = useState<ClinicalGuideline[]>(getClinicalGuidelines());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // ============================================================================
  // CORE FUNCTIONS
  // ============================================================================

  const refreshDecisions = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      if (patientId) {
        // Single patient mode
        const patientContext: PatientCDSContext = {
          id: patientId,
          name: 'Patient',
          diagnosis: 'Okänd',
          currentPhase: 1,
          totalPhases: 3,
          adherencePercent: 75,
          latestPainLevel: 5,
          painTrend: 'stable',
          daysInCurrentPhase: 14
        };

        // Collect signals
        const collectedSignals = await collectClinicalSignals(patientId, patientContext);
        if (!isMountedRef.current) return;
        setSignals(collectedSignals);

        // Generate decisions
        let generatedDecisions = await generateClinicalDecisions(
          patientId,
          patientContext,
          collectedSignals
        );

        // Enhance with AI if enabled
        if (enableAIEnhancement && generatedDecisions.length > 0) {
          const enhancedDecisions = await Promise.all(
            generatedDecisions.map(d => enhanceWithAIRecommendations(d, patientContext))
          );
          generatedDecisions = enhancedDecisions;
        }

        if (!isMountedRef.current) return;
        setDecisions(generatedDecisions);
      } else {
        // Provider mode - get dashboard
        const dashboardData = await getCDSDashboard(providerId);
        if (!isMountedRef.current) return;
        setDashboard(dashboardData);

        // Process all patients for decisions
        const allDecisions = await processProviderPatients(providerId);
        if (!isMountedRef.current) return;
        setDecisions(allDecisions);
      }

      setLastUpdated(new Date());
    } catch (err) {
      if (!isMountedRef.current) return;
      const errorMessage = err instanceof Error ? err.message : 'Ett fel uppstod';
      setError(errorMessage);
      console.error('Error refreshing clinical decisions:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [patientId, providerId, enableAIEnhancement]);

  // ============================================================================
  // DECISION ACTIONS
  // ============================================================================

  const acknowledgeDecision = useCallback(async (decisionId: string) => {
    setDecisions(prev =>
      prev.map(d =>
        d.id === decisionId
          ? { ...d, status: 'acknowledged' as const }
          : d
      )
    );
  }, []);

  const dismissDecision = useCallback(async (decisionId: string) => {
    setDecisions(prev =>
      prev.map(d =>
        d.id === decisionId
          ? { ...d, status: 'dismissed' as const }
          : d
      )
    );
  }, []);

  const executeAction = useCallback(async (
    decision: ClinicalDecision,
    recommendation: InterventionRecommendation,
    notes?: string
  ): Promise<Intervention> => {
    const intervention = await recordIntervention(
      decision,
      recommendation,
      providerId,
      notes
    );

    setInterventions(prev => [...prev, intervention]);
    setDecisions(prev =>
      prev.map(d =>
        d.id === decision.id
          ? { ...d, status: 'acted_upon' as const }
          : d
      )
    );

    return intervention;
  }, [providerId]);

  const completeAction = useCallback(async (
    interventionId: string,
    outcome: string
  ): Promise<void> => {
    await completeIntervention(interventionId, outcome);

    setInterventions(prev =>
      prev.map(i =>
        i.id === interventionId
          ? { ...i, status: 'completed', outcome, completedAt: new Date().toISOString() }
          : i
      )
    );
  }, []);

  // ============================================================================
  // QUERY HELPERS
  // ============================================================================

  const getDecisionsByPriority = useCallback(
    (priority: ClinicalDecision['priority']) =>
      decisions.filter(d => d.priority === priority && d.status === 'active'),
    [decisions]
  );

  const getDecisionsByCategory = useCallback(
    (category: ClinicalDecision['category']) =>
      decisions.filter(d => d.category === category && d.status === 'active'),
    [decisions]
  );

  const getCriticalDecisions = useCallback(
    () => decisions.filter(d =>
      (d.priority === 'critical' || d.requiresImmediateAction) && d.status === 'active'
    ),
    [decisions]
  );

  const getGuidelineForDecision = useCallback(
    (decision: ClinicalDecision) => decision.clinicalGuideline || undefined,
    []
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial load
  useEffect(() => {
    refreshDecisions();
  }, [refreshDecisions]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(refreshDecisions, refreshInterval);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshDecisions]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    decisions,
    signals,
    interventions,
    dashboard,
    guidelines,
    loading,
    error,
    lastUpdated,

    // Actions
    refreshDecisions,
    acknowledgeDecision,
    dismissDecision,
    executeAction,
    completeAction,
    getDecisionsByPriority,
    getDecisionsByCategory,
    getCriticalDecisions,
    getGuidelineForDecision
  };
}

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook for patient-specific clinical decisions
 */
export function usePatientClinicalDecisions(patientId: string) {
  return useClinicalDecisions({
    patientId,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds for patient view
    enableAIEnhancement: true
  });
}

/**
 * Hook for provider dashboard
 */
export function useProviderClinicalDashboard(providerId: string) {
  return useClinicalDecisions({
    providerId,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute for provider view
    enableAIEnhancement: false // Enhance on-demand for performance
  });
}

/**
 * Hook for critical alerts only
 */
export function useCriticalAlerts(providerId: string) {
  const { getCriticalDecisions, refreshDecisions, loading } = useClinicalDecisions({
    providerId,
    autoRefresh: true,
    refreshInterval: 15000 // 15 seconds for critical alerts
  });

  return {
    criticalAlerts: getCriticalDecisions(),
    refresh: refreshDecisions,
    loading
  };
}

export default useClinicalDecisions;
