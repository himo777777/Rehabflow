// ============================================================================
// RISK STRATIFICATION SERVICE
// ============================================================================
// Multi-factor patient risk scoring system that identifies high-risk patients
// requiring intensive monitoring based on pain, adherence, psychological,
// movement quality, health metrics, and progression factors.

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type ScoreTrend = 'improving' | 'stable' | 'worsening';

export interface RiskWeights {
  pain: number;
  adherence: number;
  psychological: number;
  movement: number;
  health: number;
  progression: number;
}

export interface ContributingFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
  category: 'pain' | 'adherence' | 'psychological' | 'movement' | 'health' | 'progression';
}

export interface RecommendedAction {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  reason: string;
  category: string;
}

export interface RiskAssessment {
  id: string;
  userId: string;
  providerId?: string;
  overallScore: number;
  riskLevel: RiskLevel;
  painScore: number;
  adherenceScore: number;
  psychologicalScore: number;
  movementScore: number;
  healthScore: number;
  progressionScore: number;
  contributingFactors: ContributingFactor[];
  recommendedActions: RecommendedAction[];
  previousScore?: number;
  scoreTrend?: ScoreTrend;
  scoreChange?: number;
  dataSources: {
    painLogs: number;
    movementSessions: number;
    promisAssessment: boolean;
    healthData: boolean;
    psfsAssessment: boolean;
  };
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface RiskAlert {
  id: string;
  userId: string;
  assessmentId?: string;
  alertType: 'risk_increase' | 'critical_level' | 'no_activity' | 'pain_spike' | 'adherence_drop';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface PatientRiskSummary {
  patientId: string;
  patientName: string;
  diagnosis: string;
  currentPhase: number;
  totalPhases: number;
  riskAssessment?: RiskAssessment;
  activeAlerts: number;
  lastActivityDate?: string;
}

export interface ProviderRiskDashboard {
  totalPatients: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  unassessedCount: number;
  avgRiskScore: number;
  patients: PatientRiskSummary[];
  recentAlerts: RiskAlert[];
}

// ============================================================================
// DEFAULT WEIGHTS
// ============================================================================

const DEFAULT_WEIGHTS: RiskWeights = {
  pain: 0.25,
  adherence: 0.20,
  psychological: 0.20,
  movement: 0.15,
  health: 0.10,
  progression: 0.10
};

// ============================================================================
// RISK CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate pain risk score (0-100)
 * Higher score = higher risk
 */
async function calculatePainScore(userId: string): Promise<{
  score: number;
  factors: ContributingFactor[];
}> {
  const factors: ContributingFactor[] = [];
  let score = 0;

  try {
    // Get pain predictions
    const { data: predictions } = await supabase
      .from('pain_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('prediction_date', { ascending: false })
      .limit(1);

    if (predictions && predictions.length > 0) {
      const prediction = predictions[0];

      // High predicted pain
      if (prediction.horizon_24h >= 7) {
        score += 40;
        factors.push({
          factor: 'high_predicted_pain',
          impact: 0.8,
          description: `Förväntad smärta om 24h: ${prediction.horizon_24h}/10`,
          category: 'pain'
        });
      } else if (prediction.horizon_24h >= 5) {
        score += 20;
        factors.push({
          factor: 'moderate_predicted_pain',
          impact: 0.4,
          description: `Förväntad smärta om 24h: ${prediction.horizon_24h}/10`,
          category: 'pain'
        });
      }

      // Critical risk level from prediction
      if (prediction.risk_level_24h === 'critical') {
        score += 30;
        factors.push({
          factor: 'critical_pain_risk',
          impact: 0.9,
          description: 'Kritisk risk för smärta enligt AI-prediktion',
          category: 'pain'
        });
      } else if (prediction.risk_level_24h === 'high') {
        score += 15;
        factors.push({
          factor: 'high_pain_risk',
          impact: 0.5,
          description: 'Hög risk för smärta enligt AI-prediktion',
          category: 'pain'
        });
      }
    }

    // Get recent pain logs to check trend
    const { data: painLogs } = await supabase
      .from('pain_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (painLogs && painLogs.length >= 3) {
      // Calculate 7-day trend
      const recentAvg = painLogs.slice(0, 3).reduce((sum, log) => sum + (log.pain_level || 0), 0) / 3;
      const olderAvg = painLogs.slice(-3).reduce((sum, log) => sum + (log.pain_level || 0), 0) / 3;

      if (recentAvg > olderAvg + 1.5) {
        score += 25;
        factors.push({
          factor: 'pain_trend_worsening',
          impact: 0.7,
          description: `Smärta ökande senaste 7 dagarna (+${(recentAvg - olderAvg).toFixed(1)} poäng)`,
          category: 'pain'
        });
      }
    }

  } catch (error) {
    console.error('Error calculating pain score:', error);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate adherence risk score (0-100)
 * Higher score = higher risk (low adherence)
 */
async function calculateAdherenceScore(userId: string): Promise<{
  score: number;
  factors: ContributingFactor[];
}> {
  const factors: ContributingFactor[] = [];
  let score = 0;

  try {
    // Get exercise logs from last 14 days
    const { data: exerciseLogs } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    // Get program to know expected exercises
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (program && program.length > 0) {
      const expectedSessions = 14 * (program[0].frequency || 3) / 7; // Sessions per 14 days
      const actualSessions = exerciseLogs?.length || 0;
      const adherenceRate = Math.min(actualSessions / expectedSessions, 1);

      if (adherenceRate < 0.5) {
        score += 50;
        factors.push({
          factor: 'very_low_adherence',
          impact: 0.9,
          description: `Endast ${Math.round(adherenceRate * 100)}% av träningarna genomförda`,
          category: 'adherence'
        });
      } else if (adherenceRate < 0.7) {
        score += 30;
        factors.push({
          factor: 'low_adherence',
          impact: 0.6,
          description: `${Math.round(adherenceRate * 100)}% av träningarna genomförda`,
          category: 'adherence'
        });
      } else if (adherenceRate < 0.85) {
        score += 15;
        factors.push({
          factor: 'moderate_adherence',
          impact: 0.3,
          description: `${Math.round(adherenceRate * 100)}% av träningarna genomförda`,
          category: 'adherence'
        });
      }
    }

    // Check for consecutive missed days
    const { data: recentActivity } = await supabase
      .from('exercise_logs')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentActivity && recentActivity.length > 0) {
      const lastActivity = new Date(recentActivity[0].created_at);
      const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

      if (daysSinceActivity >= 7) {
        score += 40;
        factors.push({
          factor: 'extended_inactivity',
          impact: 0.85,
          description: `Ingen aktivitet på ${daysSinceActivity} dagar`,
          category: 'adherence'
        });
      } else if (daysSinceActivity >= 4) {
        score += 25;
        factors.push({
          factor: 'recent_inactivity',
          impact: 0.5,
          description: `Ingen aktivitet på ${daysSinceActivity} dagar`,
          category: 'adherence'
        });
      }
    }

  } catch (error) {
    console.error('Error calculating adherence score:', error);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate psychological risk score (0-100)
 * Based on PROMIS-29 anxiety/depression and TSK-11 kinesiophobia
 */
async function calculatePsychologicalScore(userId: string): Promise<{
  score: number;
  factors: ContributingFactor[];
}> {
  const factors: ContributingFactor[] = [];
  let score = 0;

  try {
    // Get latest PROMIS-29 assessment
    const { data: promis } = await supabase
      .from('promis29_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false })
      .limit(1);

    if (promis && promis.length > 0) {
      const assessment = promis[0];

      // Anxiety T-score (higher = worse)
      if (assessment.anxiety_tscore >= 65) {
        score += 30;
        factors.push({
          factor: 'severe_anxiety',
          impact: 0.85,
          description: `Allvarlig ångestnivå (T-score: ${assessment.anxiety_tscore})`,
          category: 'psychological'
        });
      } else if (assessment.anxiety_tscore >= 60) {
        score += 15;
        factors.push({
          factor: 'moderate_anxiety',
          impact: 0.5,
          description: `Måttlig ångestnivå (T-score: ${assessment.anxiety_tscore})`,
          category: 'psychological'
        });
      }

      // Depression T-score (higher = worse)
      if (assessment.depression_tscore >= 65) {
        score += 30;
        factors.push({
          factor: 'severe_depression',
          impact: 0.85,
          description: `Allvarlig depressionsnivå (T-score: ${assessment.depression_tscore})`,
          category: 'psychological'
        });
      } else if (assessment.depression_tscore >= 60) {
        score += 15;
        factors.push({
          factor: 'moderate_depression',
          impact: 0.5,
          description: `Måttlig depressionsnivå (T-score: ${assessment.depression_tscore})`,
          category: 'psychological'
        });
      }

      // Sleep disturbance
      if (assessment.sleep_disturbance_tscore >= 60) {
        score += 15;
        factors.push({
          factor: 'sleep_issues',
          impact: 0.4,
          description: `Sömnproblem (T-score: ${assessment.sleep_disturbance_tscore})`,
          category: 'psychological'
        });
      }
    }

    // Get TSK-11 score (kinesiophobia)
    const { data: tsk } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .eq('assessment_type', 'TSK-11')
      .order('created_at', { ascending: false })
      .limit(1);

    if (tsk && tsk.length > 0) {
      const tskScore = tsk[0].score;

      if (tskScore >= 40) {
        score += 25;
        factors.push({
          factor: 'high_kinesiophobia',
          impact: 0.8,
          description: `Hög rörelserädsla (TSK-11: ${tskScore})`,
          category: 'psychological'
        });
      } else if (tskScore >= 30) {
        score += 10;
        factors.push({
          factor: 'moderate_kinesiophobia',
          impact: 0.4,
          description: `Måttlig rörelserädsla (TSK-11: ${tskScore})`,
          category: 'psychological'
        });
      }
    }

  } catch (error) {
    console.error('Error calculating psychological score:', error);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate movement quality risk score (0-100)
 * Based on form scores and compensation patterns
 */
async function calculateMovementScore(userId: string): Promise<{
  score: number;
  factors: ContributingFactor[];
}> {
  const factors: ContributingFactor[] = [];
  let score = 0;

  try {
    // Get recent movement sessions
    const { data: sessions } = await supabase
      .from('movement_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('session_date', { ascending: false });

    if (sessions && sessions.length > 0) {
      // Calculate average form score
      const avgScore = sessions.reduce((sum, s) => sum + (s.average_score || 0), 0) / sessions.length;

      if (avgScore < 60) {
        score += 40;
        factors.push({
          factor: 'poor_form_quality',
          impact: 0.8,
          description: `Låg genomsnittlig formkvalitet (${Math.round(avgScore)}/100)`,
          category: 'movement'
        });
      } else if (avgScore < 75) {
        score += 20;
        factors.push({
          factor: 'moderate_form_quality',
          impact: 0.4,
          description: `Måttlig formkvalitet (${Math.round(avgScore)}/100)`,
          category: 'movement'
        });
      }

      // Check for declining trend
      if (sessions.length >= 4) {
        const recentAvg = sessions.slice(0, 2).reduce((sum, s) => sum + (s.average_score || 0), 0) / 2;
        const olderAvg = sessions.slice(-2).reduce((sum, s) => sum + (s.average_score || 0), 0) / 2;

        if (recentAvg < olderAvg - 10) {
          score += 25;
          factors.push({
            factor: 'declining_movement_quality',
            impact: 0.6,
            description: `Försämrad rörelsekvalitet (-${Math.round(olderAvg - recentAvg)} poäng)`,
            category: 'movement'
          });
        }
      }

      // Check for compensation patterns
      const sessionsWithIssues = sessions.filter(s =>
        s.form_issues && Array.isArray(s.form_issues) && s.form_issues.some((i: { severity: string }) => i.severity === 'high')
      );

      if (sessionsWithIssues.length > sessions.length * 0.5) {
        score += 20;
        factors.push({
          factor: 'frequent_compensation',
          impact: 0.5,
          description: 'Frekventa kompensationsmönster upptäckta',
          category: 'movement'
        });
      }

      // Check ROM achievement
      const avgRom = sessions.reduce((sum, s) => sum + (s.rom_achieved || 100), 0) / sessions.length;
      if (avgRom < 70) {
        score += 15;
        factors.push({
          factor: 'limited_rom',
          impact: 0.4,
          description: `Begränsad rörelseomfång (${Math.round(avgRom)}% av mål)`,
          category: 'movement'
        });
      }
    }

  } catch (error) {
    console.error('Error calculating movement score:', error);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate health metrics risk score (0-100)
 * Based on HealthKit data: sleep, HRV, activity
 */
async function calculateHealthScore(userId: string): Promise<{
  score: number;
  factors: ContributingFactor[];
}> {
  const factors: ContributingFactor[] = [];
  let score = 0;

  try {
    // Get recent health data
    const { data: healthData } = await supabase
      .from('health_data')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('start_date', { ascending: false });

    if (healthData && healthData.length > 0) {
      // Check sleep
      const sleepData = healthData.filter(d => d.data_type === 'sleep_analysis');
      if (sleepData.length > 0) {
        const avgSleep = sleepData.reduce((sum, d) => sum + (d.value || 0), 0) / sleepData.length;
        if (avgSleep < 6) {
          score += 30;
          factors.push({
            factor: 'poor_sleep',
            impact: 0.7,
            description: `Otillräcklig sömn (${avgSleep.toFixed(1)} timmar i genomsnitt)`,
            category: 'health'
          });
        } else if (avgSleep < 7) {
          score += 15;
          factors.push({
            factor: 'moderate_sleep',
            impact: 0.4,
            description: `Något kort sömn (${avgSleep.toFixed(1)} timmar i genomsnitt)`,
            category: 'health'
          });
        }
      }

      // Check HRV (Heart Rate Variability) - low HRV = higher stress/fatigue
      const hrvData = healthData.filter(d => d.data_type === 'heart_rate_variability');
      if (hrvData.length > 0) {
        const avgHrv = hrvData.reduce((sum, d) => sum + (d.value || 0), 0) / hrvData.length;
        if (avgHrv < 30) {
          score += 25;
          factors.push({
            factor: 'low_hrv',
            impact: 0.6,
            description: `Låg HRV indikerar stress/trötthet (${Math.round(avgHrv)} ms)`,
            category: 'health'
          });
        }
      }

      // Check activity levels
      const stepsData = healthData.filter(d => d.data_type === 'steps');
      if (stepsData.length > 0) {
        const avgSteps = stepsData.reduce((sum, d) => sum + (d.value || 0), 0) / stepsData.length;
        if (avgSteps < 3000) {
          score += 20;
          factors.push({
            factor: 'low_activity',
            impact: 0.5,
            description: `Låg daglig aktivitet (${Math.round(avgSteps)} steg/dag)`,
            category: 'health'
          });
        } else if (avgSteps > 15000) {
          score += 15;
          factors.push({
            factor: 'overactivity',
            impact: 0.4,
            description: `Möjlig överansträngning (${Math.round(avgSteps)} steg/dag)`,
            category: 'health'
          });
        }
      }
    }

  } catch (error) {
    console.error('Error calculating health score:', error);
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Calculate progression risk score (0-100)
 * Based on time in current phase and outcome measure changes
 */
async function calculateProgressionScore(userId: string): Promise<{
  score: number;
  factors: ContributingFactor[];
}> {
  const factors: ContributingFactor[] = [];
  let score = 0;

  try {
    // Get program to check phase duration
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (program && program.length > 0) {
      const currentPhase = program[0].current_phase || 1;
      const phaseStartDate = new Date(program[0].phase_start_date || program[0].created_at);
      const weeksInPhase = Math.floor((Date.now() - phaseStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const expectedPhaseDuration = program[0].phase_duration_weeks || 4;

      if (weeksInPhase > expectedPhaseDuration * 1.5) {
        score += 35;
        factors.push({
          factor: 'stuck_in_phase',
          impact: 0.7,
          description: `Fas ${currentPhase} överskrider förväntad tid (${weeksInPhase}/${expectedPhaseDuration} veckor)`,
          category: 'progression'
        });
      } else if (weeksInPhase > expectedPhaseDuration) {
        score += 15;
        factors.push({
          factor: 'slow_progression',
          impact: 0.4,
          description: `Fas ${currentPhase} tar längre än förväntat`,
          category: 'progression'
        });
      }
    }

    // Check PSFS improvement
    const { data: psfs } = await supabase
      .from('psfs_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('assessment_date', { ascending: true })
      .limit(2);

    if (psfs && psfs.length === 2) {
      const improvement = psfs[1].average_score - psfs[0].average_score;
      if (improvement < 0) {
        score += 30;
        factors.push({
          factor: 'declining_function',
          impact: 0.7,
          description: `Funktionell försämring (PSFS: ${improvement.toFixed(1)} poäng)`,
          category: 'progression'
        });
      } else if (improvement < 2) {
        score += 15;
        factors.push({
          factor: 'minimal_improvement',
          impact: 0.4,
          description: `Minimal funktionell förbättring (PSFS: +${improvement.toFixed(1)})`,
          category: 'progression'
        });
      }
    }

  } catch (error) {
    console.error('Error calculating progression score:', error);
  }

  return { score: Math.min(score, 100), factors };
}

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Calculate comprehensive risk assessment for a patient
 */
export async function calculateRiskAssessment(
  userId: string,
  providerId?: string,
  weights: RiskWeights = DEFAULT_WEIGHTS
): Promise<RiskAssessment> {
  // Calculate all factor scores in parallel
  const [painResult, adherenceResult, psychResult, movementResult, healthResult, progressionResult] =
    await Promise.all([
      calculatePainScore(userId),
      calculateAdherenceScore(userId),
      calculatePsychologicalScore(userId),
      calculateMovementScore(userId),
      calculateHealthScore(userId),
      calculateProgressionScore(userId)
    ]);

  // Calculate weighted overall score
  const overallScore =
    painResult.score * weights.pain +
    adherenceResult.score * weights.adherence +
    psychResult.score * weights.psychological +
    movementResult.score * weights.movement +
    healthResult.score * weights.health +
    progressionResult.score * weights.progression;

  // Determine risk level
  let riskLevel: RiskLevel;
  if (overallScore >= 75) riskLevel = 'critical';
  else if (overallScore >= 50) riskLevel = 'high';
  else if (overallScore >= 25) riskLevel = 'moderate';
  else riskLevel = 'low';

  // Combine all factors
  const contributingFactors = [
    ...painResult.factors,
    ...adherenceResult.factors,
    ...psychResult.factors,
    ...movementResult.factors,
    ...healthResult.factors,
    ...progressionResult.factors
  ].sort((a, b) => b.impact - a.impact);

  // Generate recommendations based on top factors
  const recommendedActions = generateRecommendations(contributingFactors, riskLevel);

  // Get previous assessment for trend calculation
  const { data: previousAssessments } = await supabase
    .from('risk_assessments')
    .select('overall_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  let previousScore: number | undefined;
  let scoreTrend: ScoreTrend | undefined;
  let scoreChange: number | undefined;

  if (previousAssessments && previousAssessments.length > 0) {
    previousScore = previousAssessments[0].overall_score;
    scoreChange = overallScore - previousScore;

    if (scoreChange > 5) scoreTrend = 'worsening';
    else if (scoreChange < -5) scoreTrend = 'improving';
    else scoreTrend = 'stable';
  }

  // Create assessment object
  const assessment: RiskAssessment = {
    id: crypto.randomUUID(),
    userId,
    providerId,
    overallScore: Math.round(overallScore * 10) / 10,
    riskLevel,
    painScore: Math.round(painResult.score * 10) / 10,
    adherenceScore: Math.round(adherenceResult.score * 10) / 10,
    psychologicalScore: Math.round(psychResult.score * 10) / 10,
    movementScore: Math.round(movementResult.score * 10) / 10,
    healthScore: Math.round(healthResult.score * 10) / 10,
    progressionScore: Math.round(progressionResult.score * 10) / 10,
    contributingFactors,
    recommendedActions,
    previousScore,
    scoreTrend,
    scoreChange,
    dataSources: {
      painLogs: 14,
      movementSessions: 10,
      promisAssessment: true,
      healthData: true,
      psfsAssessment: true
    },
    createdAt: new Date().toISOString()
  };

  // Save to database
  await saveRiskAssessment(assessment);

  return assessment;
}

/**
 * Generate recommended actions based on risk factors
 */
function generateRecommendations(
  factors: ContributingFactor[],
  riskLevel: RiskLevel
): RecommendedAction[] {
  const recommendations: RecommendedAction[] = [];

  // Urgent recommendations for critical level
  if (riskLevel === 'critical') {
    recommendations.push({
      priority: 'urgent',
      action: 'Kontakta patienten omedelbart',
      reason: 'Kritisk risknivå kräver omedelbar uppföljning',
      category: 'general'
    });
  }

  // Factor-specific recommendations
  factors.slice(0, 5).forEach(factor => {
    switch (factor.factor) {
      case 'high_predicted_pain':
      case 'critical_pain_risk':
        recommendations.push({
          priority: 'high',
          action: 'Granska smärthanteringsstrategier',
          reason: factor.description,
          category: 'pain'
        });
        break;

      case 'very_low_adherence':
      case 'extended_inactivity':
        recommendations.push({
          priority: 'high',
          action: 'Diskutera barriärer för träning',
          reason: factor.description,
          category: 'adherence'
        });
        break;

      case 'severe_anxiety':
      case 'severe_depression':
        recommendations.push({
          priority: 'high',
          action: 'Överväg remiss till psykolog/kurator',
          reason: factor.description,
          category: 'psychological'
        });
        break;

      case 'high_kinesiophobia':
        recommendations.push({
          priority: 'medium',
          action: 'Implementera graded exposure-protokoll',
          reason: factor.description,
          category: 'psychological'
        });
        break;

      case 'poor_form_quality':
      case 'frequent_compensation':
        recommendations.push({
          priority: 'medium',
          action: 'Schemalägg videogenomgång av övningar',
          reason: factor.description,
          category: 'movement'
        });
        break;

      case 'poor_sleep':
        recommendations.push({
          priority: 'medium',
          action: 'Ge sömnhygienråd',
          reason: factor.description,
          category: 'health'
        });
        break;

      case 'stuck_in_phase':
      case 'declining_function':
        recommendations.push({
          priority: 'high',
          action: 'Revidera behandlingsplanen',
          reason: factor.description,
          category: 'progression'
        });
        break;
    }
  });

  return recommendations;
}

/**
 * Save risk assessment to database
 */
async function saveRiskAssessment(assessment: RiskAssessment): Promise<void> {
  try {
    const { error } = await supabase.from('risk_assessments').insert({
      id: assessment.id,
      user_id: assessment.userId,
      provider_id: assessment.providerId,
      overall_score: assessment.overallScore,
      risk_level: assessment.riskLevel,
      pain_score: assessment.painScore,
      adherence_score: assessment.adherenceScore,
      psychological_score: assessment.psychologicalScore,
      movement_score: assessment.movementScore,
      health_score: assessment.healthScore,
      progression_score: assessment.progressionScore,
      contributing_factors: assessment.contributingFactors,
      recommended_actions: assessment.recommendedActions,
      previous_score: assessment.previousScore,
      score_trend: assessment.scoreTrend,
      score_change: assessment.scoreChange,
      data_sources: assessment.dataSources
    });

    if (error) {
      console.error('Error saving risk assessment:', error);
    }
  } catch (error) {
    console.error('Error saving risk assessment:', error);
  }
}

/**
 * Get provider's patient risk dashboard
 */
export async function getProviderRiskDashboard(providerId: string): Promise<ProviderRiskDashboard> {
  // Get risk summary
  const { data: summary } = await supabase
    .rpc('get_provider_risk_summary', { p_provider_id: providerId });

  // Get patients with risks
  const { data: patientRisks } = await supabase
    .from('provider_patient_risks')
    .select('*')
    .eq('provider_id', providerId)
    .order('overall_score', { ascending: false, nullsFirst: false });

  // Get recent alerts
  const { data: alerts } = await supabase
    .from('risk_alerts')
    .select('*')
    .in('user_id', (patientRisks || []).map(p => p.patient_id))
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  // Map patient data
  const patients: PatientRiskSummary[] = (patientRisks || []).map(pr => ({
    patientId: pr.patient_id,
    patientName: pr.patient_name || 'Okänd',
    diagnosis: pr.diagnosis || '',
    currentPhase: pr.current_phase || 1,
    totalPhases: pr.total_phases || 4,
    riskAssessment: pr.assessment_id ? {
      id: pr.assessment_id,
      userId: pr.patient_id,
      overallScore: pr.overall_score,
      riskLevel: pr.risk_level,
      painScore: pr.pain_score,
      adherenceScore: pr.adherence_score,
      psychologicalScore: pr.psychological_score,
      movementScore: pr.movement_score,
      healthScore: pr.health_score,
      progressionScore: pr.progression_score,
      contributingFactors: pr.contributing_factors || [],
      recommendedActions: pr.recommended_actions || [],
      scoreTrend: pr.score_trend,
      dataSources: { painLogs: 0, movementSessions: 0, promisAssessment: false, healthData: false, psfsAssessment: false },
      createdAt: pr.assessment_date
    } : undefined,
    activeAlerts: 0,
    lastActivityDate: pr.last_activity_date
  }));

  // Count active alerts per patient
  (alerts || []).forEach(alert => {
    const patient = patients.find(p => p.patientId === alert.user_id);
    if (patient) patient.activeAlerts++;
  });

  return {
    totalPatients: summary?.total_patients || patients.length,
    criticalCount: summary?.critical_count || patients.filter(p => p.riskAssessment?.riskLevel === 'critical').length,
    highCount: summary?.high_count || patients.filter(p => p.riskAssessment?.riskLevel === 'high').length,
    moderateCount: summary?.moderate_count || patients.filter(p => p.riskAssessment?.riskLevel === 'moderate').length,
    lowCount: summary?.low_count || patients.filter(p => p.riskAssessment?.riskLevel === 'low').length,
    unassessedCount: summary?.unassessed_count || patients.filter(p => !p.riskAssessment).length,
    avgRiskScore: summary?.avg_risk_score || 0,
    patients,
    recentAlerts: (alerts || []).map(a => ({
      id: a.id,
      userId: a.user_id,
      assessmentId: a.assessment_id,
      alertType: a.alert_type,
      severity: a.severity,
      title: a.title,
      message: a.message,
      status: a.status,
      createdAt: a.created_at
    }))
  };
}

/**
 * Mark alert as acknowledged
 */
export async function acknowledgeAlert(alertId: string, providerId: string): Promise<void> {
  await supabase
    .from('risk_alerts')
    .update({
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: providerId
    })
    .eq('id', alertId);
}

/**
 * Mark alert as resolved
 */
export async function resolveAlert(
  alertId: string,
  providerId: string,
  notes?: string
): Promise<void> {
  await supabase
    .from('risk_alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: providerId,
      resolution_notes: notes
    })
    .eq('id', alertId);
}

/**
 * Mark risk assessment as reviewed
 */
export async function markAssessmentReviewed(
  assessmentId: string,
  providerId: string,
  notes?: string
): Promise<void> {
  await supabase
    .from('risk_assessments')
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: providerId,
      review_notes: notes
    })
    .eq('id', assessmentId);
}

/**
 * Get risk trend for a patient
 */
export async function getRiskTrend(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; score: number; level: RiskLevel }>> {
  const { data } = await supabase
    .rpc('get_risk_trend', { p_user_id: userId, p_days: days });

  return (data || []).map((d: { assessment_date: string; overall_score: number; risk_level: RiskLevel }) => ({
    date: d.assessment_date,
    score: d.overall_score,
    level: d.risk_level
  }));
}

// Export service object
export const riskStratificationService = {
  calculateRiskAssessment,
  getProviderRiskDashboard,
  acknowledgeAlert,
  resolveAlert,
  markAssessmentReviewed,
  getRiskTrend
};
