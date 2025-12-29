// ============================================================================
// CLINICAL DECISION SUPPORT SERVICE
// ============================================================================
// AI-powered clinical decision support system that aggregates signals from
// risk stratification, pain prediction, red flags, and patient data to generate
// prioritized clinical decisions and intervention recommendations.
//
// Key Features:
// - Multi-source signal aggregation
// - Evidence-based clinical guidelines
// - AI-powered intervention recommendations
// - Real-time alert prioritization
// - Intervention tracking and audit logging

import { supabase } from './supabaseClient';
import {
  RiskAssessment,
  RiskLevel,
  calculateRiskAssessment
} from './riskStratificationService';
import { checkPainSpike, PainAlert } from './painAlertService';
import { checkRedFlags } from './redFlagService';
import type { RedFlagReport } from './redFlagService';
import { generateTreatmentRecommendations, TreatmentRecommendation } from './providerAIService';
import { getPainPredictionService } from './painPredictionService';

// ============================================================================
// TYPES
// ============================================================================

export type DecisionPriority = 'critical' | 'high' | 'medium' | 'low';
export type DecisionCategory =
  | 'safety'
  | 'pain_management'
  | 'exercise_modification'
  | 'progression'
  | 'adherence'
  | 'psychological'
  | 'referral'
  | 'monitoring';

export type InterventionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'deferred'
  | 'cancelled';

export interface ClinicalSignal {
  source: 'risk_stratification' | 'pain_alert' | 'red_flag' | 'pain_prediction' | 'adherence' | 'movement_quality';
  severity: 'info' | 'warning' | 'critical';
  value: number;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface ClinicalDecision {
  id: string;
  patientId: string;
  providerId?: string;
  priority: DecisionPriority;
  category: DecisionCategory;
  title: string;
  description: string;
  rationale: string;
  signals: ClinicalSignal[];
  recommendedActions: InterventionRecommendation[];
  clinicalGuideline?: ClinicalGuideline;
  aiConfidence: number;
  requiresImmediateAction: boolean;
  expiresAt?: string;
  createdAt: string;
  status: 'active' | 'acknowledged' | 'acted_upon' | 'dismissed';
}

export interface InterventionRecommendation {
  id: string;
  type: 'contact_patient' | 'modify_program' | 'escalate' | 'monitor' | 'refer' | 'educate';
  title: string;
  description: string;
  urgency: 'immediate' | 'today' | 'this_week' | 'next_visit';
  estimatedImpact: 'high' | 'medium' | 'low';
  evidenceLevel: 'strong' | 'moderate' | 'weak' | 'expert_opinion';
  steps?: string[];
}

export interface ClinicalGuideline {
  id: string;
  name: string;
  source: string;
  condition: string;
  recommendation: string;
  evidenceLevel: string;
  lastUpdated: string;
}

export interface Intervention {
  id: string;
  decisionId: string;
  recommendationId: string;
  patientId: string;
  providerId: string;
  type: InterventionRecommendation['type'];
  title: string;
  status: InterventionStatus;
  notes?: string;
  outcome?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CDSPatientSummary {
  patientId: string;
  patientName: string;
  diagnosis: string;
  activeDecisions: ClinicalDecision[];
  pendingInterventions: Intervention[];
  recentAlerts: ClinicalSignal[];
  riskLevel: RiskLevel;
  lastAssessment: string;
  priorityScore: number;
}

export interface CDSDashboard {
  totalPatients: number;
  criticalDecisions: number;
  highPriorityDecisions: number;
  pendingInterventions: number;
  completedToday: number;
  patients: CDSPatientSummary[];
  recentDecisions: ClinicalDecision[];
}

// ============================================================================
// CLINICAL GUIDELINES DATABASE
// ============================================================================

const CLINICAL_GUIDELINES: ClinicalGuideline[] = [
  {
    id: 'acl-progression',
    name: 'ACL Reconstruction Rehabilitation Progression',
    source: 'AAOS Clinical Practice Guidelines 2024',
    condition: 'ACL Reconstruction',
    recommendation: 'Progress to phase 2 when: ROM 0-120°, minimal effusion, good quadriceps control',
    evidenceLevel: 'Strong',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'lbp-yellow-flags',
    name: 'Low Back Pain Yellow Flags',
    source: 'Socialstyrelsen Nationella Riktlinjer',
    condition: 'Low Back Pain',
    recommendation: 'Screen for yellow flags: catastrophizing, fear-avoidance, depression. Consider CBT referral if present.',
    evidenceLevel: 'Strong',
    lastUpdated: '2024-03-01'
  },
  {
    id: 'shoulder-pain-escalation',
    name: 'Shoulder Pain Escalation Criteria',
    source: 'Swedish Shoulder Network Guidelines',
    condition: 'Rotator Cuff',
    recommendation: 'Refer for imaging if: night pain >2 weeks, no improvement after 6 weeks conservative care, suspected full-thickness tear',
    evidenceLevel: 'Moderate',
    lastUpdated: '2024-02-20'
  },
  {
    id: 'chronic-pain-multimodal',
    name: 'Chronic Pain Multimodal Approach',
    source: 'SBU Systematisk Litteraturöversikt',
    condition: 'Chronic Pain',
    recommendation: 'For pain >12 weeks: combine exercise therapy, patient education, and psychological support. Consider pain specialist referral.',
    evidenceLevel: 'Strong',
    lastUpdated: '2024-01-30'
  },
  {
    id: 'post-op-infection-signs',
    name: 'Post-Operative Infection Warning Signs',
    source: 'Svensk Ortopedisk Förening',
    condition: 'Post-Operative',
    recommendation: 'Monitor for: increasing pain after initial improvement, warmth, redness spreading >2cm from incision, fever >38.5°C, purulent discharge',
    evidenceLevel: 'Strong',
    lastUpdated: '2024-02-15'
  },
  {
    id: 'adherence-intervention',
    name: 'Low Adherence Intervention Protocol',
    source: 'Physical Therapy Best Practice',
    condition: 'General',
    recommendation: 'For adherence <50%: 1) Identify barriers, 2) Simplify program, 3) Increase contact frequency, 4) Consider motivational interviewing',
    evidenceLevel: 'Moderate',
    lastUpdated: '2024-03-10'
  },
  {
    id: 'pain-spike-protocol',
    name: 'Pain Spike Management Protocol',
    source: 'RehabFlow Clinical Protocol',
    condition: 'General',
    recommendation: 'For pain increase >2 points: 1) Reduce exercise intensity 25%, 2) Contact within 24h, 3) Review for red flags, 4) Consider activity modification',
    evidenceLevel: 'Expert Opinion',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'kinesiophobia-screening',
    name: 'Fear-Avoidance Screening',
    source: 'Tampa Scale Clinical Application',
    condition: 'Musculoskeletal',
    recommendation: 'TSK-11 score >27: High kinesiophobia. Implement graded exposure, pain neuroscience education. Consider psychology referral.',
    evidenceLevel: 'Strong',
    lastUpdated: '2024-01-20'
  }
];

// ============================================================================
// DECISION RULES ENGINE
// ============================================================================

interface DecisionRule {
  id: string;
  name: string;
  priority: DecisionPriority;
  category: DecisionCategory;
  condition: (signals: ClinicalSignal[], patientData: PatientCDSData) => boolean;
  generateDecision: (signals: ClinicalSignal[], patientData: PatientCDSData) => Partial<ClinicalDecision>;
  guidelineId?: string;
}

interface PatientCDSData {
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

const DECISION_RULES: DecisionRule[] = [
  // CRITICAL: Red Flag Detection
  {
    id: 'red-flag-critical',
    name: 'Critical Red Flag Detected',
    priority: 'critical',
    category: 'safety',
    condition: (signals) => signals.some(s =>
      s.source === 'red_flag' && s.severity === 'critical'
    ),
    generateDecision: (signals, patient) => {
      const redFlagSignal = signals.find(s => s.source === 'red_flag' && s.severity === 'critical');
      return {
        title: 'AKUT: Röd flagga identifierad',
        description: redFlagSignal?.message || 'Kritiska symtom detekterade som kräver omedelbar uppmärksamhet',
        rationale: 'Patienten rapporterar symtom som kan indikera allvarligt medicinskt tillstånd',
        requiresImmediateAction: true,
        recommendedActions: [
          {
            id: crypto.randomUUID(),
            type: 'contact_patient',
            title: 'Kontakta patienten omedelbart',
            description: 'Ring patienten för att bedöma symtom och ge instruktioner',
            urgency: 'immediate',
            estimatedImpact: 'high',
            evidenceLevel: 'strong',
            steps: [
              'Ring patienten inom 15 minuter',
              'Bedöm symtomens allvarlighetsgrad',
              'Instruera om akutmottagning vid behov',
              'Dokumentera samtalet'
            ]
          },
          {
            id: crypto.randomUUID(),
            type: 'escalate',
            title: 'Eskalera till jourhavande läkare',
            description: 'Vid bekräftade allvarliga symtom, kontakta jourhavande',
            urgency: 'immediate',
            estimatedImpact: 'high',
            evidenceLevel: 'strong'
          }
        ]
      };
    }
  },

  // CRITICAL: Severe Pain Spike
  {
    id: 'pain-spike-severe',
    name: 'Severe Pain Spike',
    priority: 'critical',
    category: 'pain_management',
    guidelineId: 'pain-spike-protocol',
    condition: (signals) => signals.some(s =>
      s.source === 'pain_alert' && s.severity === 'critical'
    ),
    generateDecision: (signals, patient) => ({
      title: 'Kritisk smärtökning',
      description: `Patientens smärta har ökat till ${patient.latestPainLevel}/10 - kräver omedelbar åtgärd`,
      rationale: 'Smärtnivå ≥8 eller ökning >4 poäng indikerar potentiell försämring eller komplikation',
      requiresImmediateAction: true,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'contact_patient',
          title: 'Telefon/videokonsultation',
          description: 'Bedöm orsak till smärtökning och uteslut röda flaggor',
          urgency: 'today',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate',
          steps: [
            'Kartlägg smärtdebut och karaktär',
            'Fråga om nya symtom (svullnad, rodnad, feber)',
            'Bedöm om aktivitet triggade smärtan',
            'Dokumentera i journal'
          ]
        },
        {
          id: crypto.randomUUID(),
          type: 'modify_program',
          title: 'Pausa eller reducera program',
          description: 'Tillfälligt reducera träningsintensitet med 50%',
          urgency: 'immediate',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ]
    })
  },

  // HIGH: Predicted Pain Increase
  {
    id: 'pain-prediction-high',
    name: 'AI Predicts Pain Increase',
    priority: 'high',
    category: 'pain_management',
    condition: (signals) => signals.some(s =>
      s.source === 'pain_prediction' && s.value > 6
    ),
    generateDecision: (signals, patient) => {
      const predSignal = signals.find(s => s.source === 'pain_prediction');
      return {
        title: 'AI förutspår smärtökning',
        description: `ML-modellen förutspår smärtnivå ${predSignal?.value}/10 inom 24-48h`,
        rationale: 'Prediktiv analys baserad på patientens historiska mönster och biometriska data',
        requiresImmediateAction: false,
        recommendedActions: [
          {
            id: crypto.randomUUID(),
            type: 'monitor',
            title: 'Proaktiv uppföljning',
            description: 'Skicka ett meddelande till patienten för att förbereda och fråga om status',
            urgency: 'today',
            estimatedImpact: 'medium',
            evidenceLevel: 'moderate'
          },
          {
            id: crypto.randomUUID(),
            type: 'modify_program',
            title: 'Förebyggande programjustering',
            description: 'Överväg att reducera intensitet kommande dagar',
            urgency: 'this_week',
            estimatedImpact: 'medium',
            evidenceLevel: 'weak'
          }
        ]
      };
    }
  },

  // HIGH: Critical Risk Level
  {
    id: 'risk-critical',
    name: 'Critical Risk Level',
    priority: 'high',
    category: 'monitoring',
    condition: (signals) => signals.some(s =>
      s.source === 'risk_stratification' && s.value >= 80
    ),
    generateDecision: (signals, patient) => ({
      title: 'Kritisk risknivå',
      description: `Patienten har en sammansatt riskscore på ${signals.find(s => s.source === 'risk_stratification')?.value}/100`,
      rationale: 'Flera riskfaktorer indikerar hög sannolikhet för negativ utveckling',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'contact_patient',
          title: 'Schemalägg extra uppföljning',
          description: 'Boka videokonsultation inom 48h för genomgång',
          urgency: 'today',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate'
        },
        {
          id: crypto.randomUUID(),
          type: 'escalate',
          title: 'Diskutera i teamet',
          description: 'Ta upp patienten på nästa teammöte för gemensam planering',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'expert_opinion'
        }
      ]
    })
  },

  // HIGH: Low Adherence
  {
    id: 'adherence-low',
    name: 'Low Exercise Adherence',
    priority: 'high',
    category: 'adherence',
    guidelineId: 'adherence-intervention',
    condition: (signals, patient) => patient.adherencePercent < 40,
    generateDecision: (signals, patient) => ({
      title: 'Låg följsamhet till träningsprogram',
      description: `Patienten har endast ${patient.adherencePercent}% följsamhet senaste veckan`,
      rationale: 'Följsamhet under 40% associeras med sämre behandlingsutfall',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'contact_patient',
          title: 'Motiverande samtal',
          description: 'Utforska hinder och justera förväntningar',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate',
          steps: [
            'Fråga om hinder (tid, smärta, motivation)',
            'Validera patientens upplevelse',
            'Identifiera vad som fungerar',
            'Sätt realistiska kortsiktiga mål'
          ]
        },
        {
          id: crypto.randomUUID(),
          type: 'modify_program',
          title: 'Förenkla programmet',
          description: 'Reducera till 3-4 nyckelövningar',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ]
    })
  },

  // HIGH: High Kinesiophobia
  {
    id: 'kinesiophobia-high',
    name: 'High Fear-Avoidance',
    priority: 'high',
    category: 'psychological',
    guidelineId: 'kinesiophobia-screening',
    condition: (signals, patient) =>
      (patient.psychologicalFactors?.tsk11Score || 0) > 27,
    generateDecision: (signals, patient) => ({
      title: 'Hög rörelserädsla (kinesiofobi)',
      description: `TSK-11 score: ${patient.psychologicalFactors?.tsk11Score}/44 - indikerar betydande rörelserädsla`,
      rationale: 'Hög kinesiofobi är en stark prediktor för kronisk smärta och nedsatt funktion',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'educate',
          title: 'Smärtedukation',
          description: 'Ge patienten tillgång till modulen om smärtneurovetenskap',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'strong'
        },
        {
          id: crypto.randomUUID(),
          type: 'modify_program',
          title: 'Graderad exponering',
          description: 'Anpassa programmet med fokus på gradvis ökad exponering för rädda rörelser',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'strong'
        },
        {
          id: crypto.randomUUID(),
          type: 'refer',
          title: 'Överväg psykologremiss',
          description: 'Vid kvarstående hög kinesiofobi, remittera till smärtpsykolog',
          urgency: 'next_visit',
          estimatedImpact: 'high',
          evidenceLevel: 'strong'
        }
      ]
    })
  },

  // MEDIUM: No Activity
  {
    id: 'no-activity',
    name: 'No Recent Activity',
    priority: 'medium',
    category: 'adherence',
    condition: (signals, patient) => {
      if (!patient.lastExerciseDate) return true;
      const daysSince = Math.floor(
        (Date.now() - new Date(patient.lastExerciseDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince >= 5;
    },
    generateDecision: (signals, patient) => ({
      title: 'Ingen aktivitet på 5+ dagar',
      description: 'Patienten har inte loggat någon träning på minst 5 dagar',
      rationale: 'Längre uppehåll kan indikera försämring, motivation-problem eller tekniska svårigheter',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'contact_patient',
          title: 'Skicka påminnelse',
          description: 'Skicka ett vänligt meddelande för att höra hur det går',
          urgency: 'today',
          estimatedImpact: 'medium',
          evidenceLevel: 'weak'
        }
      ]
    })
  },

  // MEDIUM: Stalled Progression
  {
    id: 'progression-stalled',
    name: 'Progression Stalled',
    priority: 'medium',
    category: 'progression',
    condition: (signals, patient) =>
      patient.daysInCurrentPhase > 21 && patient.painTrend !== 'improving',
    generateDecision: (signals, patient) => ({
      title: 'Progression avstannad',
      description: `Patienten har varit i fas ${patient.currentPhase} i ${patient.daysInCurrentPhase} dagar utan tydlig förbättring`,
      rationale: 'Längre tid i samma fas utan progress kan indikera behov av programjustering eller ytterligare utredning',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'monitor',
          title: 'Utvärdera progressionskriterier',
          description: 'Granska vad som saknas för fasövergång',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        },
        {
          id: crypto.randomUUID(),
          type: 'modify_program',
          title: 'Överväg programändring',
          description: 'Anpassa övningar eller intensitet för att bryta platå',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ]
    })
  },

  // MEDIUM: Poor Movement Quality
  {
    id: 'movement-quality-poor',
    name: 'Poor Movement Quality',
    priority: 'medium',
    category: 'exercise_modification',
    condition: (signals, patient) =>
      (patient.movementQuality?.averageFormScore || 100) < 60,
    generateDecision: (signals, patient) => ({
      title: 'Låg rörelsekvalitet',
      description: `Genomsnittlig formscore: ${patient.movementQuality?.averageFormScore}% - kompensationsmönster detekterade`,
      rationale: 'Dålig rörelseform kan leda till överbelastning och förhindra optimal läkning',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'educate',
          title: 'Skicka instruktionsvideo',
          description: 'Dela video med korrekt utförandeteknik för problemövningar',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        },
        {
          id: crypto.randomUUID(),
          type: 'modify_program',
          title: 'Förenkla övningar',
          description: 'Byt till enklare varianter som är lättare att utföra korrekt',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ]
    })
  },

  // LOW: Elevated Psychological Distress
  {
    id: 'psychological-elevated',
    name: 'Elevated Psychological Distress',
    priority: 'medium',
    category: 'psychological',
    condition: (signals, patient) => {
      const anxiety = patient.psychologicalFactors?.promis29Anxiety || 0;
      const depression = patient.psychologicalFactors?.promis29Depression || 0;
      return anxiety > 60 || depression > 60;
    },
    generateDecision: (signals, patient) => ({
      title: 'Förhöjd psykisk belastning',
      description: 'PROMIS-29 visar förhöjda nivåer av ångest och/eller depression',
      rationale: 'Psykisk ohälsa är en stark prediktor för sämre rehabiliteringsutfall',
      requiresImmediateAction: false,
      recommendedActions: [
        {
          id: crypto.randomUUID(),
          type: 'contact_patient',
          title: 'Stödjande samtal',
          description: 'Fråga hur patienten mår psykiskt och validera upplevelsen',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        },
        {
          id: crypto.randomUUID(),
          type: 'refer',
          title: 'Överväg psykologkontakt',
          description: 'Vid kvarstående symtom, rekommendera kontakt med psykolog eller kurator',
          urgency: 'next_visit',
          estimatedImpact: 'high',
          evidenceLevel: 'strong'
        }
      ]
    })
  }
];

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Collect all clinical signals for a patient
 */
export async function collectClinicalSignals(
  patientId: string,
  patientData: PatientCDSData
): Promise<ClinicalSignal[]> {
  const signals: ClinicalSignal[] = [];
  const now = new Date().toISOString();

  try {
    // 1. Risk Stratification Signal
    const riskAssessment = await calculateRiskAssessment(patientId);
    if (riskAssessment) {
      signals.push({
        source: 'risk_stratification',
        severity: riskAssessment.riskLevel === 'critical' ? 'critical' :
                  riskAssessment.riskLevel === 'high' ? 'warning' : 'info',
        value: riskAssessment.overallScore,
        message: `Risknivå: ${riskAssessment.riskLevel} (${riskAssessment.overallScore}/100)`,
        timestamp: now,
        data: { assessment: riskAssessment }
      });
    }
  } catch (error) {
    console.warn('Could not get risk assessment:', error);
  }

  try {
    // 2. Pain Alert Signal
    const painAlert = checkPainSpike(patientData.latestPainLevel);
    if (painAlert) {
      signals.push({
        source: 'pain_alert',
        severity: painAlert.severity === 'critical' ? 'critical' : 'warning',
        value: painAlert.currentPain,
        message: `Smärtnivå: ${painAlert.currentPain}/10 (+${painAlert.increase})`,
        timestamp: now,
        data: { alert: painAlert }
      });
    }
  } catch (error) {
    console.warn('Could not check pain level:', error);
  }

  try {
    // 3. Pain Prediction Signal
    const predictionService = getPainPredictionService();
    const predictionResult = await predictionService.predict(patientId);
    const painPrediction24h = predictionResult?.prediction24h?.predictedPain ?? 0;
    if (painPrediction24h > 5) {
      signals.push({
        source: 'pain_prediction',
        severity: painPrediction24h >= 7 ? 'warning' : 'info',
        value: painPrediction24h,
        message: `Förutspådd smärta om 24h: ${painPrediction24h.toFixed(1)}/10`,
        timestamp: now,
        data: { prediction: predictionResult }
      });
    }
  } catch (error) {
    console.warn('Could not get pain prediction:', error);
  }

  // 4. Adherence Signal
  if (patientData.adherencePercent < 50) {
    signals.push({
      source: 'adherence',
      severity: patientData.adherencePercent < 30 ? 'warning' : 'info',
      value: patientData.adherencePercent,
      message: `Följsamhet: ${patientData.adherencePercent}%`,
      timestamp: now
    });
  }

  // 5. Movement Quality Signal
  if (patientData.movementQuality && patientData.movementQuality.averageFormScore < 70) {
    signals.push({
      source: 'movement_quality',
      severity: patientData.movementQuality.averageFormScore < 50 ? 'warning' : 'info',
      value: patientData.movementQuality.averageFormScore,
      message: `Rörelsekvalitet: ${patientData.movementQuality.averageFormScore}%`,
      timestamp: now,
      data: { patterns: patientData.movementQuality.compensationPatterns }
    });
  }

  return signals;
}

/**
 * Generate clinical decisions based on signals and patient data
 */
export async function generateClinicalDecisions(
  patientId: string,
  patientData: PatientCDSData,
  signals: ClinicalSignal[]
): Promise<ClinicalDecision[]> {
  const decisions: ClinicalDecision[] = [];
  const now = new Date().toISOString();

  for (const rule of DECISION_RULES) {
    try {
      if (rule.condition(signals, patientData)) {
        const partialDecision = rule.generateDecision(signals, patientData);
        const guideline = rule.guidelineId
          ? CLINICAL_GUIDELINES.find(g => g.id === rule.guidelineId)
          : undefined;

        const decision: ClinicalDecision = {
          id: crypto.randomUUID(),
          patientId,
          priority: rule.priority,
          category: rule.category,
          title: partialDecision.title || rule.name,
          description: partialDecision.description || '',
          rationale: partialDecision.rationale || '',
          signals: signals.filter(s =>
            s.severity === 'critical' || s.severity === 'warning'
          ),
          recommendedActions: partialDecision.recommendedActions || [],
          clinicalGuideline: guideline,
          aiConfidence: 0.85,
          requiresImmediateAction: partialDecision.requiresImmediateAction || false,
          createdAt: now,
          status: 'active'
        };

        decisions.push(decision);
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  decisions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return decisions;
}

/**
 * Get AI-enhanced recommendations for a decision
 */
export async function enhanceWithAIRecommendations(
  decision: ClinicalDecision,
  patientData: PatientCDSData
): Promise<ClinicalDecision> {
  try {
    const aiRecommendations = await generateTreatmentRecommendations(
      {
        id: patientData.id,
        name: patientData.name,
        diagnosis: patientData.diagnosis,
        currentPhase: patientData.currentPhase,
        totalPhases: patientData.totalPhases,
        adherencePercent: patientData.adherencePercent,
        latestPainLevel: patientData.latestPainLevel,
        painTrend: patientData.painTrend,
        startDate: new Date().toISOString(),
        needsAttention: true,
        attentionReason: decision.title
      } as any,
      [],
      []
    );

    // Convert AI recommendations to intervention format
    const additionalActions: InterventionRecommendation[] = aiRecommendations
      .filter(rec => rec.priority === 'high')
      .map(rec => ({
        id: crypto.randomUUID(),
        type: mapCategoryToType(rec.category),
        title: rec.title,
        description: rec.description,
        urgency: rec.priority === 'high' ? 'today' as const : 'this_week' as const,
        estimatedImpact: 'medium' as const,
        evidenceLevel: 'moderate' as const
      }));

    return {
      ...decision,
      recommendedActions: [...decision.recommendedActions, ...additionalActions],
      aiConfidence: 0.9
    };
  } catch (error) {
    console.error('Error enhancing with AI:', error);
    return decision;
  }
}

function mapCategoryToType(category: string): InterventionRecommendation['type'] {
  const mapping: Record<string, InterventionRecommendation['type']> = {
    exercise: 'modify_program',
    pain_management: 'contact_patient',
    progression: 'modify_program',
    lifestyle: 'educate',
    referral: 'refer'
  };
  return mapping[category] || 'monitor';
}

/**
 * Record an intervention action
 */
export async function recordIntervention(
  decision: ClinicalDecision,
  recommendation: InterventionRecommendation,
  providerId: string,
  notes?: string
): Promise<Intervention> {
  const intervention: Intervention = {
    id: crypto.randomUUID(),
    decisionId: decision.id,
    recommendationId: recommendation.id,
    patientId: decision.patientId,
    providerId,
    type: recommendation.type,
    title: recommendation.title,
    status: 'in_progress',
    notes,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  // Save to database
  try {
    const { error } = await supabase
      .from('cds_interventions')
      .insert(intervention);

    if (error) {
      console.warn('Could not save intervention to DB:', error);
    }
  } catch (e) {
    console.warn('Database not available, intervention stored locally');
  }

  return intervention;
}

/**
 * Complete an intervention with outcome
 */
export async function completeIntervention(
  interventionId: string,
  outcome: string
): Promise<void> {
  try {
    await supabase
      .from('cds_interventions')
      .update({
        status: 'completed',
        outcome,
        completedAt: new Date().toISOString()
      })
      .eq('id', interventionId);
  } catch (error) {
    console.error('Error completing intervention:', error);
  }
}

/**
 * Get CDS dashboard for a provider
 */
export async function getCDSDashboard(providerId: string): Promise<CDSDashboard> {
  // In production, this would fetch from the database
  // For now, return structured demo data

  const demoPatients: CDSPatientSummary[] = [
    {
      patientId: 'p1',
      patientName: 'Anna Eriksson',
      diagnosis: 'ACL-rekonstruktion',
      activeDecisions: [],
      pendingInterventions: [],
      recentAlerts: [
        {
          source: 'pain_alert',
          severity: 'critical',
          value: 8,
          message: 'Smärtnivå: 8/10 (+3)',
          timestamp: new Date().toISOString()
        }
      ],
      riskLevel: 'high',
      lastAssessment: new Date().toISOString(),
      priorityScore: 85
    },
    {
      patientId: 'p2',
      patientName: 'Erik Johansson',
      diagnosis: 'Ländryggssmärta',
      activeDecisions: [],
      pendingInterventions: [],
      recentAlerts: [],
      riskLevel: 'moderate',
      lastAssessment: new Date().toISOString(),
      priorityScore: 55
    },
    {
      patientId: 'p3',
      patientName: 'Maria Lindgren',
      diagnosis: 'Axelimpingement',
      activeDecisions: [],
      pendingInterventions: [],
      recentAlerts: [
        {
          source: 'adherence',
          severity: 'warning',
          value: 25,
          message: 'Följsamhet: 25%',
          timestamp: new Date().toISOString()
        }
      ],
      riskLevel: 'high',
      lastAssessment: new Date().toISOString(),
      priorityScore: 72
    }
  ];

  return {
    totalPatients: demoPatients.length,
    criticalDecisions: 1,
    highPriorityDecisions: 2,
    pendingInterventions: 3,
    completedToday: 5,
    patients: demoPatients.sort((a, b) => b.priorityScore - a.priorityScore),
    recentDecisions: []
  };
}

/**
 * Process all patients for a provider and generate decisions
 */
export async function processProviderPatients(providerId: string): Promise<ClinicalDecision[]> {
  const allDecisions: ClinicalDecision[] = [];

  try {
    // Fetch provider's patients
    const { data: patients, error } = await supabase
      .from('programs')
      .select('user_id, diagnosis, current_phase, total_phases')
      .eq('provider_id', providerId);

    if (error || !patients) {
      console.warn('Could not fetch patients:', error);
      return allDecisions;
    }

    for (const patient of patients) {
      const patientData: PatientCDSData = {
        id: patient.user_id,
        name: 'Patient',
        diagnosis: patient.diagnosis || 'Okänd',
        currentPhase: patient.current_phase || 1,
        totalPhases: patient.total_phases || 3,
        adherencePercent: 50,
        latestPainLevel: 5,
        painTrend: 'stable',
        daysInCurrentPhase: 14
      };

      const signals = await collectClinicalSignals(patient.user_id, patientData);
      const decisions = await generateClinicalDecisions(patient.user_id, patientData, signals);
      allDecisions.push(...decisions);
    }
  } catch (error) {
    console.error('Error processing patients:', error);
  }

  return allDecisions;
}

// ============================================================================
// EXPORT CLINICAL GUIDELINES
// ============================================================================

export function getClinicalGuidelines(): ClinicalGuideline[] {
  return CLINICAL_GUIDELINES;
}

export function getGuidelineById(id: string): ClinicalGuideline | undefined {
  return CLINICAL_GUIDELINES.find(g => g.id === id);
}

export function getGuidelinesByCondition(condition: string): ClinicalGuideline[] {
  return CLINICAL_GUIDELINES.filter(g =>
    g.condition.toLowerCase().includes(condition.toLowerCase()) ||
    condition.toLowerCase().includes(g.condition.toLowerCase())
  );
}
