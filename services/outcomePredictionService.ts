// ============================================================================
// OUTCOME PREDICTION SERVICE
// ============================================================================
// ML-based prediction service for forecasting patient rehabilitation outcomes
// including ODI/PSFS scores, discharge timing, and MCID achievement probability.

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export type PredictionType = 'initial' | 'interim' | 'final';
export type SuccessLevel = 'high' | 'moderate' | 'low' | 'uncertain';

export interface RiskFactor {
  factor: string;
  impact: number; // negative impact on outcome (-1 to 0)
  description: string;
  category: 'psychological' | 'adherence' | 'pain' | 'health' | 'demographic' | 'clinical';
}

export interface ProtectiveFactor {
  factor: string;
  impact: number; // positive impact on outcome (0 to 1)
  description: string;
  category: 'psychological' | 'adherence' | 'pain' | 'health' | 'demographic' | 'clinical';
}

export interface PhaseCompletion {
  phase: number;
  predictedWeeks: number;
  actualWeeks?: number;
}

export interface OutcomePrediction {
  id: string;
  userId: string;
  providerId?: string;
  predictionType: PredictionType;

  // Predicted scores
  predictedFinalODI?: number;
  predictedFinalPSFS?: number;
  predictedFinalVAS?: number;
  predictedFinalPromisPain?: number;
  predictedFinalPromisFunction?: number;

  // Change predictions
  predictedODIChange?: number;
  predictedPSFSChange?: number;
  predictedPainReduction?: number;

  // Timeline
  predictedDischargeWeek?: number;
  phaseCompletionPredictions: PhaseCompletion[];

  // Probability metrics
  mcidProbability: number;
  successProbability: number;
  confidenceScore: number;
  confidenceIntervalLower?: number;
  confidenceIntervalUpper?: number;

  // Factors
  riskFactors: RiskFactor[];
  protectiveFactors: ProtectiveFactor[];

  // Cohort comparison
  cohortId?: string;
  cohortPercentile?: number;

  // Model info
  modelVersion: string;
  featuresUsed: Record<string, number | boolean | string>;

  // Actuals (for validation)
  actualFinalODI?: number;
  actualFinalPSFS?: number;
  actualDischargeWeek?: number;
  mcidAchieved?: boolean;
  predictionError?: number;

  // Metadata
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CohortStats {
  id: string;
  name: string;
  description?: string;
  sampleSize: number;
  avgBaselineODI?: number;
  avgFinalODI?: number;
  avgImprovement?: number;
  avgWeeksToDischarge?: number;
  mcidAchievementRate?: number;
  outcomePercentiles: Record<string, number>;
  dischargeWeekPercentiles: Record<string, number>;
}

export interface PatientOutcomeSummary {
  patientId: string;
  patientName: string;
  diagnosis: string;
  currentPhase: number;
  totalPhases: number;
  weekInProgram: number;
  baselineODI?: number;
  currentODI?: number;
  prediction?: OutcomePrediction;
}

export interface ProviderOutcomeDashboard {
  totalPatients: number;
  patientsWithPredictions: number;
  avgMCIDProbability: number;
  avgPredictedImprovement: number;
  highSuccessCount: number;
  moderateSuccessCount: number;
  lowSuccessCount: number;
  avgDischargeWeeks: number;
  patients: PatientOutcomeSummary[];
}

export interface PredictionFeatures {
  // Baseline assessments
  baselineODI?: number;
  baselinePSFS?: number;
  baselineVAS?: number;
  baselineTSK11?: number;

  // Demographics
  age?: number;
  gender?: string;
  bmi?: number;

  // Clinical factors
  painDuration?: number; // months
  previousTreatments?: number;
  surgicalHistory?: boolean;
  comorbidities?: number;

  // Early response (week 2-4)
  weekTwoAdherence?: number;
  weekTwoPainChange?: number;
  weekFourODIChange?: number;

  // Psychological
  promisAnxiety?: number;
  promisDepression?: number;
  promisFatigue?: number;

  // Health metrics
  avgSleepScore?: number;
  avgActivityLevel?: number;
}

// ============================================================================
// PREDICTION MODEL COEFFICIENTS
// ============================================================================
// These coefficients are based on rehabilitation outcome literature
// In production, these would come from a trained ML model

const ODI_MODEL_COEFFICIENTS = {
  intercept: 25,
  baselineODI: 0.35,
  age: 0.1,
  painDuration: 0.3,
  tsk11: 0.4,
  weekTwoAdherence: -0.25,
  promisAnxiety: 0.2,
  promisDepression: 0.25,
  avgSleepScore: -0.15
};

const DISCHARGE_WEEK_MODEL = {
  intercept: 8,
  baselineODI: 0.08,
  age: 0.05,
  painDuration: 0.1,
  tsk11: 0.15,
  weekTwoAdherence: -0.05
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateSuccessLevel(probability: number): SuccessLevel {
  if (probability >= 0.75) return 'high';
  if (probability >= 0.5) return 'moderate';
  if (probability >= 0.25) return 'low';
  return 'uncertain';
}

function identifyRiskFactors(features: PredictionFeatures): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // High kinesiophobia
  if (features.baselineTSK11 && features.baselineTSK11 >= 40) {
    factors.push({
      factor: 'high_kinesiophobia',
      impact: -0.2,
      description: 'Hög rörelserädsla (TSK-11 ≥ 40) kan fördröja återhämtning',
      category: 'psychological'
    });
  } else if (features.baselineTSK11 && features.baselineTSK11 >= 35) {
    factors.push({
      factor: 'moderate_kinesiophobia',
      impact: -0.1,
      description: 'Måttlig rörelserädsla som bör adresseras',
      category: 'psychological'
    });
  }

  // Low early adherence
  if (features.weekTwoAdherence && features.weekTwoAdherence < 50) {
    factors.push({
      factor: 'low_early_adherence',
      impact: -0.25,
      description: 'Låg följsamhet (< 50%) första veckorna indikerar risk för sämre utfall',
      category: 'adherence'
    });
  } else if (features.weekTwoAdherence && features.weekTwoAdherence < 70) {
    factors.push({
      factor: 'moderate_adherence_concern',
      impact: -0.1,
      description: 'Följsamhet under 70% kan påverka resultat',
      category: 'adherence'
    });
  }

  // Long pain duration
  if (features.painDuration && features.painDuration > 12) {
    factors.push({
      factor: 'chronic_pain',
      impact: -0.2,
      description: 'Smärta > 12 månader kan innebära längre rehabiliteringstid',
      category: 'pain'
    });
  } else if (features.painDuration && features.painDuration > 6) {
    factors.push({
      factor: 'subacute_pain',
      impact: -0.1,
      description: 'Smärta 6-12 månader kan påverka prognos',
      category: 'pain'
    });
  }

  // Elevated anxiety/depression
  if (features.promisAnxiety && features.promisAnxiety >= 60) {
    factors.push({
      factor: 'elevated_anxiety',
      impact: -0.15,
      description: 'Förhöjd ångest (PROMIS T-score ≥ 60) kan påverka rehabilitering',
      category: 'psychological'
    });
  }

  if (features.promisDepression && features.promisDepression >= 60) {
    factors.push({
      factor: 'elevated_depression',
      impact: -0.15,
      description: 'Förhöjda depressiva symtom kan fördröja framsteg',
      category: 'psychological'
    });
  }

  // Poor sleep
  if (features.avgSleepScore && features.avgSleepScore < 50) {
    factors.push({
      factor: 'poor_sleep',
      impact: -0.1,
      description: 'Sömnproblem kan påverka återhämtning negativt',
      category: 'health'
    });
  }

  // Age factor
  if (features.age && features.age >= 65) {
    factors.push({
      factor: 'older_age',
      impact: -0.1,
      description: 'Ålder ≥ 65 kan innebära längre rehabiliteringstid',
      category: 'demographic'
    });
  }

  // Previous treatments
  if (features.previousTreatments && features.previousTreatments >= 3) {
    factors.push({
      factor: 'multiple_previous_treatments',
      impact: -0.15,
      description: 'Flera tidigare behandlingar indikerar mer komplex situation',
      category: 'clinical'
    });
  }

  // Comorbidities
  if (features.comorbidities && features.comorbidities >= 2) {
    factors.push({
      factor: 'multiple_comorbidities',
      impact: -0.15,
      description: 'Samsjuklighet kan påverka rehabiliteringsförloppet',
      category: 'health'
    });
  }

  return factors;
}

function identifyProtectiveFactors(features: PredictionFeatures): ProtectiveFactor[] {
  const factors: ProtectiveFactor[] = [];

  // High early adherence
  if (features.weekTwoAdherence && features.weekTwoAdherence >= 85) {
    factors.push({
      factor: 'high_early_adherence',
      impact: 0.2,
      description: 'Utmärkt följsamhet (≥ 85%) ökar chansen för goda resultat',
      category: 'adherence'
    });
  } else if (features.weekTwoAdherence && features.weekTwoAdherence >= 70) {
    factors.push({
      factor: 'good_adherence',
      impact: 0.1,
      description: 'God följsamhet stödjer rehabiliteringen',
      category: 'adherence'
    });
  }

  // Low kinesiophobia
  if (features.baselineTSK11 && features.baselineTSK11 < 25) {
    factors.push({
      factor: 'low_kinesiophobia',
      impact: 0.15,
      description: 'Låg rörelserädsla underlättar aktiv rehabilitering',
      category: 'psychological'
    });
  }

  // Short pain duration
  if (features.painDuration && features.painDuration < 3) {
    factors.push({
      factor: 'acute_pain',
      impact: 0.2,
      description: 'Akut smärta (< 3 månader) har bättre prognos',
      category: 'pain'
    });
  }

  // Good sleep
  if (features.avgSleepScore && features.avgSleepScore >= 70) {
    factors.push({
      factor: 'good_sleep',
      impact: 0.1,
      description: 'God sömnkvalitet stödjer återhämtning',
      category: 'health'
    });
  }

  // Good mental health
  if (features.promisAnxiety && features.promisAnxiety < 50 &&
      features.promisDepression && features.promisDepression < 50) {
    factors.push({
      factor: 'good_mental_health',
      impact: 0.15,
      description: 'God psykisk hälsa stödjer rehabiliteringen',
      category: 'psychological'
    });
  }

  // Younger age
  if (features.age && features.age < 40) {
    factors.push({
      factor: 'younger_age',
      impact: 0.1,
      description: 'Yngre ålder associeras med snabbare återhämtning',
      category: 'demographic'
    });
  }

  // High activity level
  if (features.avgActivityLevel && features.avgActivityLevel >= 70) {
    factors.push({
      factor: 'active_lifestyle',
      impact: 0.1,
      description: 'Aktiv livsstil stödjer rehabiliteringen',
      category: 'health'
    });
  }

  // Early improvement
  if (features.weekFourODIChange && features.weekFourODIChange >= 10) {
    factors.push({
      factor: 'early_improvement',
      impact: 0.25,
      description: 'Tidig förbättring (≥ 10p vecka 4) indikerar god prognos',
      category: 'clinical'
    });
  }

  return factors;
}

// ============================================================================
// PREDICTION ALGORITHMS
// ============================================================================

function predictFinalODI(features: PredictionFeatures): {
  predicted: number;
  confidence: number;
  lower: number;
  upper: number;
} {
  let predicted = ODI_MODEL_COEFFICIENTS.intercept;

  if (features.baselineODI) {
    predicted += features.baselineODI * ODI_MODEL_COEFFICIENTS.baselineODI;
  }
  if (features.age) {
    predicted += (features.age - 45) * ODI_MODEL_COEFFICIENTS.age;
  }
  if (features.painDuration) {
    predicted += Math.min(features.painDuration, 24) * ODI_MODEL_COEFFICIENTS.painDuration;
  }
  if (features.baselineTSK11) {
    predicted += (features.baselineTSK11 - 30) * ODI_MODEL_COEFFICIENTS.tsk11;
  }
  if (features.weekTwoAdherence) {
    predicted += (features.weekTwoAdherence - 70) * ODI_MODEL_COEFFICIENTS.weekTwoAdherence;
  }
  if (features.promisAnxiety) {
    predicted += (features.promisAnxiety - 50) * ODI_MODEL_COEFFICIENTS.promisAnxiety;
  }
  if (features.promisDepression) {
    predicted += (features.promisDepression - 50) * ODI_MODEL_COEFFICIENTS.promisDepression;
  }
  if (features.avgSleepScore) {
    predicted += (features.avgSleepScore - 60) * ODI_MODEL_COEFFICIENTS.avgSleepScore;
  }

  // Clamp to valid range
  predicted = Math.max(0, Math.min(100, predicted));

  // Calculate confidence based on available data
  const featureCount = Object.values(features).filter(v => v !== undefined).length;
  const maxFeatures = 12;
  const confidence = Math.min(0.95, 0.5 + (featureCount / maxFeatures) * 0.45);

  // Confidence interval (wider with less data)
  const intervalWidth = 15 * (1 - confidence + 0.3);
  const lower = Math.max(0, predicted - intervalWidth);
  const upper = Math.min(100, predicted + intervalWidth);

  return { predicted: Math.round(predicted * 10) / 10, confidence, lower, upper };
}

function predictDischargeWeek(features: PredictionFeatures, predictedFinalODI: number): number {
  let weeks = DISCHARGE_WEEK_MODEL.intercept;

  if (features.baselineODI) {
    weeks += features.baselineODI * DISCHARGE_WEEK_MODEL.baselineODI;
  }
  if (features.age) {
    weeks += Math.max(0, features.age - 40) * DISCHARGE_WEEK_MODEL.age;
  }
  if (features.painDuration) {
    weeks += Math.min(features.painDuration, 24) * DISCHARGE_WEEK_MODEL.painDuration;
  }
  if (features.baselineTSK11) {
    weeks += Math.max(0, features.baselineTSK11 - 30) * DISCHARGE_WEEK_MODEL.tsk11;
  }
  if (features.weekTwoAdherence) {
    weeks += (100 - features.weekTwoAdherence) * DISCHARGE_WEEK_MODEL.weekTwoAdherence;
  }

  // Clamp to reasonable range
  return Math.round(Math.max(4, Math.min(24, weeks)));
}

function calculateMCIDProbability(
  baselineODI: number | undefined,
  predictedFinalODI: number,
  riskFactors: RiskFactor[],
  protectiveFactors: ProtectiveFactor[]
): number {
  if (!baselineODI) return 0.5; // Default if no baseline

  const predictedImprovement = baselineODI - predictedFinalODI;
  const mcidThreshold = 10; // ODI MCID = 10 points

  // Base probability from predicted improvement
  let probability: number;
  if (predictedImprovement >= mcidThreshold * 1.5) {
    probability = 0.9;
  } else if (predictedImprovement >= mcidThreshold) {
    probability = 0.7 + (predictedImprovement - mcidThreshold) * 0.04;
  } else if (predictedImprovement >= mcidThreshold * 0.5) {
    probability = 0.4 + (predictedImprovement - mcidThreshold * 0.5) * 0.06;
  } else {
    probability = Math.max(0.1, predictedImprovement / mcidThreshold * 0.4);
  }

  // Adjust for risk factors
  const totalRiskImpact = riskFactors.reduce((sum, f) => sum + f.impact, 0);
  probability = probability * (1 + totalRiskImpact);

  // Adjust for protective factors
  const totalProtectiveImpact = protectiveFactors.reduce((sum, f) => sum + f.impact, 0);
  probability = probability * (1 + totalProtectiveImpact * 0.5);

  return Math.max(0.05, Math.min(0.95, probability));
}

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Generate outcome prediction for a patient
 */
export async function generateOutcomePrediction(
  userId: string,
  providerId?: string,
  predictionType: PredictionType = 'initial'
): Promise<OutcomePrediction> {
  // Gather prediction features from various sources
  const features = await gatherPredictionFeatures(userId);

  // Generate predictions
  const odiPrediction = predictFinalODI(features);
  const dischargeWeek = predictDischargeWeek(features, odiPrediction.predicted);

  // Identify factors
  const riskFactors = identifyRiskFactors(features);
  const protectiveFactors = identifyProtectiveFactors(features);

  // Calculate probabilities
  const mcidProbability = calculateMCIDProbability(
    features.baselineODI,
    odiPrediction.predicted,
    riskFactors,
    protectiveFactors
  );

  // Success probability (achieving functional goals)
  const successProbability = mcidProbability * 0.9 + (odiPrediction.confidence * 0.1);

  // Calculate predicted changes
  const predictedODIChange = features.baselineODI
    ? features.baselineODI - odiPrediction.predicted
    : undefined;

  // Phase completion predictions (simplified)
  const totalPhases = 4; // Could be dynamic based on program
  const phaseCompletionPredictions: PhaseCompletion[] = [];
  let cumulativeWeeks = 0;
  for (let phase = 1; phase <= totalPhases; phase++) {
    const phaseWeeks = Math.round(dischargeWeek / totalPhases);
    cumulativeWeeks += phaseWeeks;
    phaseCompletionPredictions.push({
      phase,
      predictedWeeks: Math.min(cumulativeWeeks, dischargeWeek)
    });
  }

  // Get cohort info
  const cohortId = await getPatientCohort(userId, features);
  const cohortPercentile = await calculateCohortPercentile(
    cohortId,
    odiPrediction.predicted
  );

  // Create prediction object
  const prediction: OutcomePrediction = {
    id: '', // Will be set by database
    userId,
    providerId,
    predictionType,
    predictedFinalODI: odiPrediction.predicted,
    predictedODIChange,
    predictedDischargeWeek: dischargeWeek,
    phaseCompletionPredictions,
    mcidProbability,
    successProbability,
    confidenceScore: odiPrediction.confidence,
    confidenceIntervalLower: odiPrediction.lower,
    confidenceIntervalUpper: odiPrediction.upper,
    riskFactors,
    protectiveFactors,
    cohortId,
    cohortPercentile,
    modelVersion: '1.0',
    featuresUsed: features as Record<string, number | boolean | string>,
    createdAt: new Date().toISOString()
  };

  // Save to database
  const { data, error } = await supabase
    .from('outcome_predictions')
    .insert({
      user_id: userId,
      provider_id: providerId,
      prediction_type: predictionType,
      predicted_final_odi: prediction.predictedFinalODI,
      predicted_odi_change: prediction.predictedODIChange,
      predicted_discharge_week: prediction.predictedDischargeWeek,
      predicted_phase_completion_weeks: prediction.phaseCompletionPredictions,
      mcid_probability: prediction.mcidProbability,
      success_probability: prediction.successProbability,
      confidence_score: prediction.confidenceScore,
      confidence_interval_lower: prediction.confidenceIntervalLower,
      confidence_interval_upper: prediction.confidenceIntervalUpper,
      risk_factors: prediction.riskFactors,
      protective_factors: prediction.protectiveFactors,
      cohort_id: prediction.cohortId,
      cohort_percentile: prediction.cohortPercentile,
      model_version: prediction.modelVersion,
      features_used: prediction.featuresUsed
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save outcome prediction:', error);
    throw error;
  }

  return { ...prediction, id: data.id };
}

/**
 * Gather prediction features from various data sources
 */
async function gatherPredictionFeatures(userId: string): Promise<PredictionFeatures> {
  const features: PredictionFeatures = {};

  try {
    // Get baseline ODI
    const { data: odiData } = await supabase
      .from('odi_assessments')
      .select('score')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (odiData && odiData.length > 0) {
      features.baselineODI = odiData[0].score;
    }

    // Get TSK-11
    const { data: tskData } = await supabase
      .from('tsk11_assessments')
      .select('score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (tskData && tskData.length > 0) {
      features.baselineTSK11 = tskData[0].score;
    }

    // Get PROMIS scores
    const { data: promisData } = await supabase
      .from('promis29_assessments')
      .select('domain_scores')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (promisData && promisData.length > 0) {
      const scores = promisData[0].domain_scores;
      features.promisAnxiety = scores?.anxiety;
      features.promisDepression = scores?.depression;
      features.promisFatigue = scores?.fatigue;
    }

    // Get profile data (age)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', userId)
      .single();

    if (profileData?.date_of_birth) {
      const birthDate = new Date(profileData.date_of_birth);
      const today = new Date();
      features.age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Get early adherence (week 2)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: progressData } = await supabase
      .from('progress')
      .select('completed')
      .eq('user_id', userId)
      .gte('date', twoWeeksAgo.toISOString().split('T')[0]);

    if (progressData && progressData.length > 0) {
      const completed = progressData.filter(p => p.completed).length;
      features.weekTwoAdherence = Math.round((completed / progressData.length) * 100);
    }

    // Get health data averages
    const { data: healthData } = await supabase
      .from('health_data')
      .select('sleep_score, active_energy')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(14);

    if (healthData && healthData.length > 0) {
      const sleepScores = healthData.filter(h => h.sleep_score != null).map(h => h.sleep_score);
      if (sleepScores.length > 0) {
        features.avgSleepScore = sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length;
      }

      const activityScores = healthData.filter(h => h.active_energy != null).map(h => h.active_energy);
      if (activityScores.length > 0) {
        const avgActivity = activityScores.reduce((a, b) => a + b, 0) / activityScores.length;
        features.avgActivityLevel = Math.min(100, (avgActivity / 500) * 100); // Normalize to 0-100
      }
    }
  } catch (error) {
    console.error('Error gathering prediction features:', error);
  }

  return features;
}

/**
 * Get patient's cohort ID based on features
 */
async function getPatientCohort(
  userId: string,
  features: PredictionFeatures
): Promise<string | undefined> {
  // Determine condition category (simplified - could be more sophisticated)
  let condition = 'general';

  // Try to get from diagnosis
  const { data: programData } = await supabase
    .from('programs')
    .select('diagnosis')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (programData && programData.length > 0) {
    const diagnosis = programData[0].diagnosis?.toLowerCase() || '';
    if (diagnosis.includes('rygg') || diagnosis.includes('back') || diagnosis.includes('lumbal')) {
      condition = 'lbp';
    } else if (diagnosis.includes('knä') || diagnosis.includes('knee')) {
      condition = 'knee';
    } else if (diagnosis.includes('axel') || diagnosis.includes('shoulder')) {
      condition = 'shoulder';
    } else if (diagnosis.includes('höft') || diagnosis.includes('hip')) {
      condition = 'hip';
    }
  }

  // Determine severity
  let severity: string;
  if (features.baselineODI && features.baselineODI >= 60) {
    severity = 'severe';
  } else if (features.baselineODI && features.baselineODI >= 40) {
    severity = 'moderate';
  } else if (features.baselineODI && features.baselineODI >= 20) {
    severity = 'mild';
  } else {
    severity = 'minimal';
  }

  // Determine age range
  let ageRange: string;
  if (features.age && features.age < 30) {
    ageRange = '18-29';
  } else if (features.age && features.age < 45) {
    ageRange = '30-44';
  } else if (features.age && features.age < 60) {
    ageRange = '45-59';
  } else {
    ageRange = '60+';
  }

  return `${condition}_${severity}_${ageRange}`;
}

/**
 * Calculate where patient falls in their cohort
 */
async function calculateCohortPercentile(
  cohortId: string | undefined,
  predictedODI: number
): Promise<number | undefined> {
  if (!cohortId) return undefined;

  const { data: cohort } = await supabase
    .from('prediction_cohorts')
    .select('outcome_percentiles')
    .eq('id', cohortId)
    .single();

  if (!cohort?.outcome_percentiles) {
    // Default percentiles if cohort not found
    const defaultPercentiles = { p10: 15, p25: 22, p50: 30, p75: 40, p90: 50 };
    return estimatePercentile(predictedODI, defaultPercentiles);
  }

  return estimatePercentile(predictedODI, cohort.outcome_percentiles);
}

function estimatePercentile(
  value: number,
  percentiles: Record<string, number>
): number {
  const p10 = percentiles.p10 || 15;
  const p25 = percentiles.p25 || 22;
  const p50 = percentiles.p50 || 30;
  const p75 = percentiles.p75 || 40;
  const p90 = percentiles.p90 || 50;

  // Note: Lower ODI is better, so we invert the percentile
  if (value <= p10) return 90 + ((p10 - value) / p10) * 10;
  if (value <= p25) return 75 + ((p25 - value) / (p25 - p10)) * 15;
  if (value <= p50) return 50 + ((p50 - value) / (p50 - p25)) * 25;
  if (value <= p75) return 25 + ((p75 - value) / (p75 - p50)) * 25;
  if (value <= p90) return 10 + ((p90 - value) / (p90 - p75)) * 15;
  return Math.max(0, 10 - ((value - p90) / p90) * 10);
}

/**
 * Get provider's outcome prediction dashboard
 */
export async function getProviderOutcomeDashboard(
  providerId: string
): Promise<ProviderOutcomeDashboard> {
  // Get all patients for provider
  const { data: patients } = await supabase
    .from('provider_patients')
    .select(`
      patient_id,
      profiles:patient_id (
        id,
        display_name
      )
    `)
    .eq('provider_id', providerId)
    .eq('status', 'active');

  if (!patients || patients.length === 0) {
    return {
      totalPatients: 0,
      patientsWithPredictions: 0,
      avgMCIDProbability: 0,
      avgPredictedImprovement: 0,
      highSuccessCount: 0,
      moderateSuccessCount: 0,
      lowSuccessCount: 0,
      avgDischargeWeeks: 0,
      patients: []
    };
  }

  // Get predictions for all patients
  const patientIds = patients.map(p => p.patient_id);
  const { data: predictions } = await supabase
    .from('outcome_predictions')
    .select('*')
    .in('user_id', patientIds)
    .order('created_at', { ascending: false });

  // Get program info
  const { data: programs } = await supabase
    .from('programs')
    .select('user_id, diagnosis, current_phase, total_phases, start_date')
    .in('user_id', patientIds);

  // Get ODI scores
  const { data: odiScores } = await supabase
    .from('odi_assessments')
    .select('user_id, score, created_at')
    .in('user_id', patientIds)
    .order('created_at', { ascending: false });

  // Build patient summaries
  const patientSummaries: PatientOutcomeSummary[] = [];
  const latestPredictions = new Map<string, OutcomePrediction>();

  // Get latest prediction per patient
  predictions?.forEach(p => {
    if (!latestPredictions.has(p.user_id)) {
      latestPredictions.set(p.user_id, {
        id: p.id,
        userId: p.user_id,
        providerId: p.provider_id,
        predictionType: p.prediction_type,
        predictedFinalODI: p.predicted_final_odi,
        predictedODIChange: p.predicted_odi_change,
        predictedDischargeWeek: p.predicted_discharge_week,
        phaseCompletionPredictions: p.predicted_phase_completion_weeks || [],
        mcidProbability: p.mcid_probability,
        successProbability: p.success_probability,
        confidenceScore: p.confidence_score,
        confidenceIntervalLower: p.confidence_interval_lower,
        confidenceIntervalUpper: p.confidence_interval_upper,
        riskFactors: p.risk_factors || [],
        protectiveFactors: p.protective_factors || [],
        cohortId: p.cohort_id,
        cohortPercentile: p.cohort_percentile,
        modelVersion: p.model_version,
        featuresUsed: p.features_used || {},
        createdAt: p.created_at
      });
    }
  });

  for (const patient of patients) {
    const profile = patient.profiles as unknown as { id: string; display_name: string };
    const program = programs?.find(p => p.user_id === patient.patient_id);
    const patientODIs = odiScores?.filter(o => o.user_id === patient.patient_id) || [];
    const baselineODI = patientODIs.length > 0
      ? patientODIs.reduce((oldest, current) =>
          new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest
        ).score
      : undefined;
    const currentODI = patientODIs.length > 0 ? patientODIs[0].score : undefined;

    const weekInProgram = program?.start_date
      ? Math.floor((Date.now() - new Date(program.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 0;

    patientSummaries.push({
      patientId: patient.patient_id,
      patientName: profile?.display_name || 'Okänd patient',
      diagnosis: program?.diagnosis || 'Ingen diagnos',
      currentPhase: program?.current_phase || 1,
      totalPhases: program?.total_phases || 4,
      weekInProgram,
      baselineODI,
      currentODI,
      prediction: latestPredictions.get(patient.patient_id)
    });
  }

  // Calculate aggregate statistics
  const patientsWithPredictions = patientSummaries.filter(p => p.prediction).length;
  const predictionsArray = Array.from(latestPredictions.values());

  const avgMCIDProbability = predictionsArray.length > 0
    ? predictionsArray.reduce((sum, p) => sum + p.mcidProbability, 0) / predictionsArray.length
    : 0;

  const avgPredictedImprovement = predictionsArray.length > 0
    ? predictionsArray.reduce((sum, p) => sum + (p.predictedODIChange || 0), 0) / predictionsArray.length
    : 0;

  const avgDischargeWeeks = predictionsArray.length > 0
    ? predictionsArray.reduce((sum, p) => sum + (p.predictedDischargeWeek || 0), 0) / predictionsArray.length
    : 0;

  const highSuccessCount = predictionsArray.filter(p => p.successProbability >= 0.75).length;
  const moderateSuccessCount = predictionsArray.filter(p => p.successProbability >= 0.5 && p.successProbability < 0.75).length;
  const lowSuccessCount = predictionsArray.filter(p => p.successProbability < 0.5).length;

  // Sort by success probability (lowest first - need most attention)
  patientSummaries.sort((a, b) => {
    const aProb = a.prediction?.successProbability || 0;
    const bProb = b.prediction?.successProbability || 0;
    return aProb - bProb;
  });

  return {
    totalPatients: patients.length,
    patientsWithPredictions,
    avgMCIDProbability,
    avgPredictedImprovement,
    highSuccessCount,
    moderateSuccessCount,
    lowSuccessCount,
    avgDischargeWeeks,
    patients: patientSummaries
  };
}

/**
 * Get a specific patient's prediction
 */
export async function getPatientPrediction(
  userId: string
): Promise<OutcomePrediction | null> {
  const { data, error } = await supabase
    .from('outcome_predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    providerId: data.provider_id,
    predictionType: data.prediction_type,
    predictedFinalODI: data.predicted_final_odi,
    predictedODIChange: data.predicted_odi_change,
    predictedDischargeWeek: data.predicted_discharge_week,
    phaseCompletionPredictions: data.predicted_phase_completion_weeks || [],
    mcidProbability: data.mcid_probability,
    successProbability: data.success_probability,
    confidenceScore: data.confidence_score,
    confidenceIntervalLower: data.confidence_interval_lower,
    confidenceIntervalUpper: data.confidence_interval_upper,
    riskFactors: data.risk_factors || [],
    protectiveFactors: data.protective_factors || [],
    cohortId: data.cohort_id,
    cohortPercentile: data.cohort_percentile,
    modelVersion: data.model_version,
    featuresUsed: data.features_used || {},
    actualFinalODI: data.actual_final_odi,
    actualDischargeWeek: data.actual_discharge_week,
    mcidAchieved: data.mcid_achieved,
    predictionError: data.prediction_error,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Update prediction with actual outcomes (for validation)
 */
export async function updatePredictionWithActuals(
  userId: string,
  actualFinalODI: number,
  actualDischargeWeek: number
): Promise<void> {
  const { error } = await supabase.rpc('update_prediction_actuals', {
    p_user_id: userId,
    p_actual_final_odi: actualFinalODI,
    p_actual_final_psfs: null,
    p_actual_discharge_week: actualDischargeWeek
  });

  if (error) {
    console.error('Failed to update prediction actuals:', error);
    throw error;
  }
}

/**
 * Get cohort statistics
 */
export async function getCohortStats(cohortId: string): Promise<CohortStats | null> {
  const { data, error } = await supabase
    .from('prediction_cohorts')
    .select('*')
    .eq('id', cohortId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    sampleSize: data.sample_size,
    avgBaselineODI: data.avg_baseline_odi,
    avgFinalODI: data.avg_final_odi,
    avgImprovement: data.avg_improvement,
    avgWeeksToDischarge: data.avg_weeks_to_discharge,
    mcidAchievementRate: data.mcid_achievement_rate,
    outcomePercentiles: data.outcome_percentiles || {},
    dischargeWeekPercentiles: data.discharge_week_percentiles || {}
  };
}
