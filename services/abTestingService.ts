/**
 * A/B Testing Service - Sprint 5.13
 *
 * Feature flagging and experimentation framework.
 * Features:
 * - Feature flags management
 * - A/B experiment configuration
 * - User segmentation
 * - Statistical significance calculation
 * - Conversion tracking
 * - Gradual rollouts
 * - Override support for testing
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type VariantId = string;
export type FeatureFlagValue = boolean | string | number | Record<string, unknown>;

export interface Variant {
  id: VariantId;
  name: string;
  weight: number; // 0-100 percentage
  config?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  targetAudience?: AudienceConfig;
  startDate?: string;
  endDate?: string;
  metrics: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AudienceConfig {
  percentage: number; // 0-100 percentage of users to include
  segments?: string[];
  conditions?: AudienceCondition[];
}

export interface AudienceCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface UserContext {
  userId?: string;
  sessionId?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  platform?: string;
  language?: string;
  country?: string;
  segments?: string[];
  attributes?: Record<string, unknown>;
}

export interface Assignment {
  experimentId: string;
  variantId: VariantId;
  userId: string;
  timestamp: string;
}

export interface ConversionEvent {
  experimentId: string;
  variantId: VariantId;
  userId: string;
  metric: string;
  value?: number;
  timestamp: string;
}

export interface ExperimentResults {
  experimentId: string;
  variants: VariantResult[];
  totalParticipants: number;
  startDate: string;
  endDate?: string;
  isSignificant: boolean;
  confidenceLevel: number;
  winner?: VariantId;
}

export interface VariantResult {
  variantId: VariantId;
  participants: number;
  conversions: number;
  conversionRate: number;
  metrics: Record<string, MetricResult>;
}

export interface MetricResult {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  value?: FeatureFlagValue;
  rolloutPercentage: number;
  targetAudience?: AudienceConfig;
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_EXPERIMENTS = 'rehabflow-experiments';
const STORAGE_KEY_ASSIGNMENTS = 'rehabflow-ab-assignments';
const STORAGE_KEY_CONVERSIONS = 'rehabflow-ab-conversions';
const STORAGE_KEY_FLAGS = 'rehabflow-feature-flags';
const STORAGE_KEY_OVERRIDES = 'rehabflow-ab-overrides';

// ============================================================================
// A/B TESTING SERVICE
// ============================================================================

class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private conversions: ConversionEvent[] = [];
  private overrides: Map<string, VariantId> = new Map();
  private userContext: UserContext = {};

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultFlags();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      // Load experiments
      const experiments = localStorage.getItem(STORAGE_KEY_EXPERIMENTS);
      if (experiments) {
        const parsed = JSON.parse(experiments) as Experiment[];
        parsed.forEach(e => this.experiments.set(e.id, e));
      }

      // Load feature flags
      const flags = localStorage.getItem(STORAGE_KEY_FLAGS);
      if (flags) {
        const parsed = JSON.parse(flags) as FeatureFlag[];
        parsed.forEach(f => this.featureFlags.set(f.id, f));
      }

      // Load assignments
      const assignments = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (assignments) {
        const parsed = JSON.parse(assignments) as Assignment[];
        parsed.forEach(a => this.assignments.set(`${a.experimentId}:${a.userId}`, a));
      }

      // Load conversions
      const conversions = localStorage.getItem(STORAGE_KEY_CONVERSIONS);
      if (conversions) {
        this.conversions = JSON.parse(conversions);
      }

      // Load overrides
      const overrides = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      if (overrides) {
        const parsed = JSON.parse(overrides) as Record<string, VariantId>;
        Object.entries(parsed).forEach(([k, v]) => this.overrides.set(k, v));
      }

    } catch (error) {
      logger.error('[ABTesting] Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(
        STORAGE_KEY_EXPERIMENTS,
        JSON.stringify(Array.from(this.experiments.values()))
      );
      localStorage.setItem(
        STORAGE_KEY_FLAGS,
        JSON.stringify(Array.from(this.featureFlags.values()))
      );
      localStorage.setItem(
        STORAGE_KEY_ASSIGNMENTS,
        JSON.stringify(Array.from(this.assignments.values()))
      );
      localStorage.setItem(
        STORAGE_KEY_CONVERSIONS,
        JSON.stringify(this.conversions)
      );
      localStorage.setItem(
        STORAGE_KEY_OVERRIDES,
        JSON.stringify(Object.fromEntries(this.overrides))
      );
    } catch (error) {
      logger.error('[ABTesting] Failed to save to storage:', error);
    }
  }

  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'dark_mode',
        name: 'Mörkt läge',
        description: 'Aktivera mörkt tema',
        enabled: true,
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ai_coach',
        name: 'AI Coach',
        description: 'Aktivera AI-baserade träningsråd',
        enabled: true,
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'voice_commands',
        name: 'Röststyrning',
        description: 'Aktivera röstkommandon',
        enabled: true,
        rolloutPercentage: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'social_sharing',
        name: 'Delning',
        description: 'Aktivera social delning',
        enabled: true,
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'gamification',
        name: 'Spelifiering',
        description: 'Aktivera badges och poäng',
        enabled: true,
        rolloutPercentage: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'wearable_sync',
        name: 'Wearable-synk',
        description: 'Synka med wearables',
        enabled: true,
        rolloutPercentage: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultFlags.forEach(flag => {
      if (!this.featureFlags.has(flag.id)) {
        this.featureFlags.set(flag.id, flag);
      }
    });

    this.saveToStorage();
  }

  // --------------------------------------------------------------------------
  // USER CONTEXT
  // --------------------------------------------------------------------------

  /**
   * Set user context
   */
  public setUserContext(context: UserContext): void {
    this.userContext = { ...this.userContext, ...context };
    logger.debug('[ABTesting] User context updated:', this.userContext);
  }

  /**
   * Get user context
   */
  public getUserContext(): UserContext {
    return { ...this.userContext };
  }

  /**
   * Get or generate user ID
   */
  private getUserId(): string {
    if (this.userContext.userId) {
      return this.userContext.userId;
    }

    // Generate anonymous ID
    let anonymousId = localStorage.getItem('rehabflow-anonymous-id');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('rehabflow-anonymous-id', anonymousId);
    }

    return anonymousId;
  }

  // --------------------------------------------------------------------------
  // FEATURE FLAGS
  // --------------------------------------------------------------------------

  /**
   * Check if feature is enabled
   */
  public isFeatureEnabled(flagId: string): boolean {
    const flag = this.featureFlags.get(flagId);
    if (!flag) return false;

    // Check override
    const override = this.overrides.get(`flag:${flagId}`);
    if (override !== undefined) {
      return override === 'enabled';
    }

    if (!flag.enabled) return false;

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const userId = this.getUserId();
      const hash = this.hashString(`${flagId}:${userId}`);
      const bucket = hash % 100;
      if (bucket >= flag.rolloutPercentage) {
        return false;
      }
    }

    // Check audience targeting
    if (flag.targetAudience && !this.matchesAudience(flag.targetAudience)) {
      return false;
    }

    return true;
  }

  /**
   * Get feature flag value
   */
  public getFeatureValue<T extends FeatureFlagValue>(flagId: string): T | null {
    const flag = this.featureFlags.get(flagId);
    if (!flag || !this.isFeatureEnabled(flagId)) {
      return null;
    }

    // If flag has variants, return assigned variant config
    if (flag.variants && flag.variants.length > 0) {
      const variant = this.getVariant(flagId, flag.variants);
      return (variant?.config as T) || (flag.value as T) || null;
    }

    return (flag.value as T) || null;
  }

  /**
   * Create feature flag
   */
  public createFeatureFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): FeatureFlag {
    const now = new Date().toISOString();
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now,
    };

    this.featureFlags.set(flag.id, newFlag);
    this.saveToStorage();
    logger.info('[ABTesting] Feature flag created:', flag.id);

    return newFlag;
  }

  /**
   * Update feature flag
   */
  public updateFeatureFlag(flagId: string, updates: Partial<FeatureFlag>): FeatureFlag | null {
    const flag = this.featureFlags.get(flagId);
    if (!flag) return null;

    const updatedFlag: FeatureFlag = {
      ...flag,
      ...updates,
      id: flagId,
      updatedAt: new Date().toISOString(),
    };

    this.featureFlags.set(flagId, updatedFlag);
    this.saveToStorage();

    return updatedFlag;
  }

  /**
   * Get all feature flags
   */
  public getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  // --------------------------------------------------------------------------
  // EXPERIMENTS
  // --------------------------------------------------------------------------

  /**
   * Create experiment
   */
  public createExperiment(experiment: Omit<Experiment, 'createdAt' | 'updatedAt'>): Experiment {
    const now = new Date().toISOString();
    const newExperiment: Experiment = {
      ...experiment,
      createdAt: now,
      updatedAt: now,
    };

    this.experiments.set(experiment.id, newExperiment);
    this.saveToStorage();
    logger.info('[ABTesting] Experiment created:', experiment.id);

    return newExperiment;
  }

  /**
   * Get experiment
   */
  public getExperiment(experimentId: string): Experiment | null {
    return this.experiments.get(experimentId) || null;
  }

  /**
   * Update experiment
   */
  public updateExperiment(experimentId: string, updates: Partial<Experiment>): Experiment | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const updated: Experiment = {
      ...experiment,
      ...updates,
      id: experimentId,
      updatedAt: new Date().toISOString(),
    };

    this.experiments.set(experimentId, updated);
    this.saveToStorage();

    return updated;
  }

  /**
   * Start experiment
   */
  public startExperiment(experimentId: string): Experiment | null {
    return this.updateExperiment(experimentId, {
      status: 'running',
      startDate: new Date().toISOString(),
    });
  }

  /**
   * Stop experiment
   */
  public stopExperiment(experimentId: string): Experiment | null {
    return this.updateExperiment(experimentId, {
      status: 'completed',
      endDate: new Date().toISOString(),
    });
  }

  /**
   * Get all experiments
   */
  public getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  // --------------------------------------------------------------------------
  // VARIANT ASSIGNMENT
  // --------------------------------------------------------------------------

  /**
   * Get variant for user
   */
  public getVariantForExperiment(experimentId: string): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check override
    const override = this.overrides.get(`exp:${experimentId}`);
    if (override) {
      return experiment.variants.find(v => v.id === override) || null;
    }

    // Check audience targeting
    if (experiment.targetAudience && !this.matchesAudience(experiment.targetAudience)) {
      return null;
    }

    return this.getVariant(experimentId, experiment.variants);
  }

  /**
   * Get or assign variant
   */
  private getVariant(entityId: string, variants: Variant[]): Variant | null {
    const userId = this.getUserId();
    const assignmentKey = `${entityId}:${userId}`;

    // Check existing assignment
    const existing = this.assignments.get(assignmentKey);
    if (existing) {
      return variants.find(v => v.id === existing.variantId) || null;
    }

    // Assign new variant
    const variant = this.assignVariant(variants, userId, entityId);
    if (variant) {
      const assignment: Assignment = {
        experimentId: entityId,
        variantId: variant.id,
        userId,
        timestamp: new Date().toISOString(),
      };
      this.assignments.set(assignmentKey, assignment);
      this.saveToStorage();

      logger.debug('[ABTesting] Variant assigned:', {
        experiment: entityId,
        variant: variant.id,
        user: userId,
      });
    }

    return variant;
  }

  /**
   * Assign variant based on weights
   */
  private assignVariant(variants: Variant[], userId: string, experimentId: string): Variant | null {
    if (variants.length === 0) return null;

    // Use deterministic assignment based on hash
    const hash = this.hashString(`${experimentId}:${userId}`);
    const bucket = hash % 100;

    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) {
        return variant;
      }
    }

    // Fallback to last variant
    return variants[variants.length - 1];
  }

  /**
   * Hash string to number (for deterministic assignment)
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // --------------------------------------------------------------------------
  // AUDIENCE TARGETING
  // --------------------------------------------------------------------------

  /**
   * Check if user matches audience
   */
  private matchesAudience(audience: AudienceConfig): boolean {
    // Check percentage
    if (audience.percentage < 100) {
      const userId = this.getUserId();
      const hash = this.hashString(`audience:${userId}`);
      const bucket = hash % 100;
      if (bucket >= audience.percentage) {
        return false;
      }
    }

    // Check segments
    if (audience.segments && audience.segments.length > 0) {
      const userSegments = this.userContext.segments || [];
      const hasSegment = audience.segments.some(s => userSegments.includes(s));
      if (!hasSegment) return false;
    }

    // Check conditions
    if (audience.conditions) {
      for (const condition of audience.conditions) {
        if (!this.evaluateCondition(condition)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate audience condition
   */
  private evaluateCondition(condition: AudienceCondition): boolean {
    const fieldValue = this.getContextField(condition.field);

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'neq':
        return fieldValue !== condition.value;
      case 'gt':
        return typeof fieldValue === 'number' && fieldValue > (condition.value as number);
      case 'gte':
        return typeof fieldValue === 'number' && fieldValue >= (condition.value as number);
      case 'lt':
        return typeof fieldValue === 'number' && fieldValue < (condition.value as number);
      case 'lte':
        return typeof fieldValue === 'number' && fieldValue <= (condition.value as number);
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value as string);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Get context field value
   */
  private getContextField(field: string): unknown {
    if (field in this.userContext) {
      return this.userContext[field as keyof UserContext];
    }
    if (this.userContext.attributes && field in this.userContext.attributes) {
      return this.userContext.attributes[field];
    }
    return undefined;
  }

  // --------------------------------------------------------------------------
  // CONVERSION TRACKING
  // --------------------------------------------------------------------------

  /**
   * Track conversion event
   */
  public trackConversion(experimentId: string, metric: string, value?: number): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return;
    }

    const userId = this.getUserId();
    const assignmentKey = `${experimentId}:${userId}`;
    const assignment = this.assignments.get(assignmentKey);

    if (!assignment) {
      logger.warn('[ABTesting] No assignment found for conversion:', experimentId);
      return;
    }

    const event: ConversionEvent = {
      experimentId,
      variantId: assignment.variantId,
      userId,
      metric,
      value,
      timestamp: new Date().toISOString(),
    };

    this.conversions.push(event);
    this.saveToStorage();

    logger.debug('[ABTesting] Conversion tracked:', {
      experiment: experimentId,
      metric,
      variant: assignment.variantId,
    });
  }

  /**
   * Get experiment results
   */
  public getExperimentResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    // Get all assignments for this experiment
    const experimentAssignments = Array.from(this.assignments.values())
      .filter(a => a.experimentId === experimentId);

    // Get conversions
    const experimentConversions = this.conversions
      .filter(c => c.experimentId === experimentId);

    // Calculate results per variant
    const variantResults: VariantResult[] = experiment.variants.map(variant => {
      const variantAssignments = experimentAssignments.filter(a => a.variantId === variant.id);
      const variantConversions = experimentConversions.filter(c => c.variantId === variant.id);

      // Calculate metrics
      const metrics: Record<string, MetricResult> = {};
      for (const metricName of experiment.metrics) {
        const metricConversions = variantConversions.filter(c => c.metric === metricName);
        const values = metricConversions.map(c => c.value || 1);

        metrics[metricName] = {
          count: metricConversions.length,
          sum: values.reduce((a, b) => a + b, 0),
          average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
          min: values.length > 0 ? Math.min(...values) : 0,
          max: values.length > 0 ? Math.max(...values) : 0,
        };
      }

      // Primary conversion rate (first metric)
      const primaryMetric = experiment.metrics[0] || 'conversion';
      const primaryConversions = variantConversions.filter(c => c.metric === primaryMetric);

      return {
        variantId: variant.id,
        participants: variantAssignments.length,
        conversions: primaryConversions.length,
        conversionRate: variantAssignments.length > 0
          ? primaryConversions.length / variantAssignments.length
          : 0,
        metrics,
      };
    });

    // Calculate statistical significance
    const { isSignificant, confidenceLevel, winner } = this.calculateSignificance(variantResults);

    return {
      experimentId,
      variants: variantResults,
      totalParticipants: experimentAssignments.length,
      startDate: experiment.startDate || experiment.createdAt,
      endDate: experiment.endDate,
      isSignificant,
      confidenceLevel,
      winner,
    };
  }

  /**
   * Calculate statistical significance using chi-square test
   */
  private calculateSignificance(variants: VariantResult[]): {
    isSignificant: boolean;
    confidenceLevel: number;
    winner?: VariantId;
  } {
    if (variants.length < 2) {
      return { isSignificant: false, confidenceLevel: 0 };
    }

    // Simple chi-square approximation
    const control = variants[0];
    let bestVariant = control;
    let maxLift = 0;

    for (let i = 1; i < variants.length; i++) {
      const treatment = variants[i];
      const lift = treatment.conversionRate - control.conversionRate;

      if (lift > maxLift) {
        maxLift = lift;
        bestVariant = treatment;
      }
    }

    // Calculate z-score
    const p1 = control.conversionRate;
    const p2 = bestVariant.conversionRate;
    const n1 = control.participants;
    const n2 = bestVariant.participants;

    if (n1 < 30 || n2 < 30) {
      return { isSignificant: false, confidenceLevel: 0 };
    }

    const pooledP = (control.conversions + bestVariant.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));

    if (se === 0) {
      return { isSignificant: false, confidenceLevel: 0 };
    }

    const zScore = Math.abs(p2 - p1) / se;

    // Convert z-score to confidence level
    let confidenceLevel = 0;
    if (zScore >= 2.576) confidenceLevel = 99;
    else if (zScore >= 1.96) confidenceLevel = 95;
    else if (zScore >= 1.645) confidenceLevel = 90;
    else if (zScore >= 1.28) confidenceLevel = 80;
    else confidenceLevel = Math.round(zScore * 40);

    return {
      isSignificant: confidenceLevel >= 95,
      confidenceLevel,
      winner: confidenceLevel >= 95 ? bestVariant.variantId : undefined,
    };
  }

  // --------------------------------------------------------------------------
  // OVERRIDES (for testing)
  // --------------------------------------------------------------------------

  /**
   * Set experiment override
   */
  public setExperimentOverride(experimentId: string, variantId: VariantId): void {
    this.overrides.set(`exp:${experimentId}`, variantId);
    this.saveToStorage();
    logger.debug('[ABTesting] Override set:', { experiment: experimentId, variant: variantId });
  }

  /**
   * Set feature flag override
   */
  public setFeatureFlagOverride(flagId: string, enabled: boolean): void {
    this.overrides.set(`flag:${flagId}`, enabled ? 'enabled' : 'disabled');
    this.saveToStorage();
  }

  /**
   * Clear override
   */
  public clearOverride(entityId: string): void {
    this.overrides.delete(`exp:${entityId}`);
    this.overrides.delete(`flag:${entityId}`);
    this.saveToStorage();
  }

  /**
   * Clear all overrides
   */
  public clearAllOverrides(): void {
    this.overrides.clear();
    this.saveToStorage();
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  /**
   * Reset all data
   */
  public reset(): void {
    this.assignments.clear();
    this.conversions = [];
    this.overrides.clear();
    this.saveToStorage();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const abTestingService = new ABTestingService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook for feature flags
 */
export function useFeatureFlag(flagId: string): boolean {
  const [enabled, setEnabled] = useState(() => abTestingService.isFeatureEnabled(flagId));

  useEffect(() => {
    // Re-check on mount (context might have changed)
    setEnabled(abTestingService.isFeatureEnabled(flagId));
  }, [flagId]);

  return enabled;
}

/**
 * Hook for feature flag with value
 */
export function useFeatureFlagValue<T extends FeatureFlagValue>(flagId: string): T | null {
  const [value, setValue] = useState<T | null>(() => abTestingService.getFeatureValue<T>(flagId));

  useEffect(() => {
    setValue(abTestingService.getFeatureValue<T>(flagId));
  }, [flagId]);

  return value;
}

/**
 * Hook for A/B experiment
 */
export function useExperiment(experimentId: string) {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const v = abTestingService.getVariantForExperiment(experimentId);
    setVariant(v);
  }, [experimentId]);

  const trackConversion = useCallback((metric: string, value?: number) => {
    abTestingService.trackConversion(experimentId, metric, value);
  }, [experimentId]);

  return {
    variant,
    variantId: variant?.id || null,
    isControl: variant?.id === 'control',
    config: variant?.config || {},
    trackConversion,
  };
}

/**
 * Hook for experiment results
 */
export function useExperimentResults(experimentId: string) {
  const [results, setResults] = useState<ExperimentResults | null>(null);

  useEffect(() => {
    const r = abTestingService.getExperimentResults(experimentId);
    setResults(r);
  }, [experimentId]);

  const refresh = useCallback(() => {
    const r = abTestingService.getExperimentResults(experimentId);
    setResults(r);
  }, [experimentId]);

  return { results, refresh };
}

/**
 * Hook for all feature flags (admin)
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    setFlags(abTestingService.getAllFeatureFlags());
  }, []);

  const updateFlag = useCallback((flagId: string, updates: Partial<FeatureFlag>) => {
    abTestingService.updateFeatureFlag(flagId, updates);
    setFlags(abTestingService.getAllFeatureFlags());
  }, []);

  const createFlag = useCallback((flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>) => {
    abTestingService.createFeatureFlag(flag);
    setFlags(abTestingService.getAllFeatureFlags());
  }, []);

  return {
    flags,
    updateFlag,
    createFlag,
    isEnabled: (flagId: string) => abTestingService.isFeatureEnabled(flagId),
  };
}

export default abTestingService;
