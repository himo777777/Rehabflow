/**
 * Vital Signs Service
 *
 * FAS 12: Medicinsk säkerhet - Vitalparameterövervakning
 *
 * Övervakar och validerar vitala parametrar under träning:
 * - Hjärtfrekvens (HR)
 * - Blodtryck (BP)
 * - Syresättning (SpO2)
 * - Andningsfrekvens (RR)
 * - Borg RPE-skala
 *
 * Baserat på ACSM (American College of Sports Medicine) riktlinjer
 * och svenska Fysioterapeutförbundets rekommendationer
 */

// ============================================
// TYPES
// ============================================

export interface VitalSigns {
  heartRate?: number;              // Slag per minut
  bloodPressure?: {
    systolic: number;              // mmHg
    diastolic: number;             // mmHg
  };
  oxygenSaturation?: number;       // % (SpO2)
  respiratoryRate?: number;        // Andetag per minut
  borgRPE?: number;                // 6-20 skala
  temperature?: number;            // Celsius
  timestamp: string;
}

export interface ExerciseVitalLimits {
  heartRateMax: number;            // Absolut max (220 - ålder eller individuell)
  heartRateTarget: {
    lower: number;                 // Undre gräns för effektiv träning
    upper: number;                 // Övre gräns (vanligtvis 85% av max)
  };
  bloodPressure: {
    systolicMax: number;           // 180-200 mmHg beroende på population
    diastolicMax: number;          // 100-110 mmHg
    systolicExerciseMax: number;   // Under träning kan vara högre
  };
  oxygenSaturationMin: number;     // Normalt >92%, för lungsjuka >88%
  borgRPEMax: number;              // Vanligtvis 15-17 för rehab
}

export interface VitalSafetyResult {
  safe: boolean;
  warningLevel: 'none' | 'caution' | 'warning' | 'critical' | 'contraindicated';
  issues: VitalIssue[];
  recommendation: string;
  shouldStopExercise: boolean;
}

export interface VitalIssue {
  parameter: keyof VitalSigns;
  value: number | string;
  threshold: number | string;
  severity: 'mild' | 'moderate' | 'severe';
  message: string;
}

export interface PatientProfile {
  age: number;
  gender?: 'male' | 'female' | 'other';
  restingHeartRate?: number;
  maxHeartRate?: number;           // Om känd från test
  medications?: string[];          // Påverkar HR-beräkning (t.ex. betablockerare)
  conditions?: string[];           // Hjärtsjukdom, diabetes, etc.
  fitnessLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
}

// ============================================
// CONSTANTS
// ============================================

/**
 * ACSM riktlinjer för träningsintensitet
 */
const INTENSITY_ZONES = {
  veryLight: { hrPercentMin: 30, hrPercentMax: 39, borgMin: 6, borgMax: 9 },
  light: { hrPercentMin: 40, hrPercentMax: 54, borgMin: 10, borgMax: 11 },
  moderate: { hrPercentMin: 55, hrPercentMax: 69, borgMin: 12, borgMax: 13 },
  vigorous: { hrPercentMin: 70, hrPercentMax: 89, borgMin: 14, borgMax: 16 },
  nearMax: { hrPercentMin: 90, hrPercentMax: 100, borgMin: 17, borgMax: 20 },
};

/**
 * Absoluta kontraindikationer för fortsatt träning
 * Baserat på ACSM och AHA (American Heart Association)
 */
const ABSOLUTE_STOP_CRITERIA = {
  systolicBP: 250,           // mmHg
  diastolicBP: 115,          // mmHg
  heartRateMax: 220,         // Teoretiskt max oavsett ålder
  oxygenSaturation: 85,      // % - under detta = omedelbar stopp
  borgRPE: 19,               // 19-20 = extrem ansträngning
};

/**
 * Varningsgränser för försiktighet
 */
const WARNING_THRESHOLDS = {
  systolicBP: 200,           // mmHg
  diastolicBP: 100,          // mmHg
  oxygenSaturation: 90,      // %
  borgRPE: 17,               // "Mycket ansträngande"
};

// ============================================
// HEART RATE CALCULATION FUNCTIONS
// ============================================

/**
 * Beräkna maximal hjärtfrekvens
 *
 * Formler:
 * - Traditionell: 220 - ålder
 * - Tanaka (mer exakt): 208 - 0.7 × ålder
 * - Gellish: 206.9 - 0.67 × ålder
 *
 * Vi använder Tanaka som standard (bättre för äldre)
 */
export function calculateMaxHeartRate(
  age: number,
  formula: 'traditional' | 'tanaka' | 'gellish' = 'tanaka'
): number {
  switch (formula) {
    case 'traditional':
      return 220 - age;
    case 'tanaka':
      return Math.round(208 - 0.7 * age);
    case 'gellish':
      return Math.round(206.9 - 0.67 * age);
    default:
      return Math.round(208 - 0.7 * age);
  }
}

/**
 * Beräkna målhjärtfrekvenszon med Karvonen-formeln
 *
 * THR = ((HRmax - HRrest) × %intensity) + HRrest
 *
 * Mer exakt än % av max ensamt eftersom den tar hänsyn till kondition
 */
export function calculateTargetHeartRateZone(
  maxHR: number,
  restingHR: number,
  intensityLower: number = 0.5,  // 50%
  intensityUpper: number = 0.7   // 70%
): { lower: number; upper: number } {
  const hrReserve = maxHR - restingHR;

  return {
    lower: Math.round((hrReserve * intensityLower) + restingHR),
    upper: Math.round((hrReserve * intensityUpper) + restingHR),
  };
}

/**
 * Justera målhjärtfrekvens för betablockerare
 *
 * Betablockerare (metoprolol, atenolol, etc.) sänker maxHR med ~20-30 slag
 * ACSM rekommenderar att använda Borg RPE istället för HR vid betablockerare
 */
export function adjustHRForBetaBlockers(
  maxHR: number,
  betaBlockerDose: 'low' | 'moderate' | 'high' = 'moderate'
): number {
  const reductions = {
    low: 15,
    moderate: 25,
    high: 35,
  };

  return maxHR - reductions[betaBlockerDose];
}

// ============================================
// VITAL SIGNS VALIDATION
// ============================================

/**
 * Generera patientspecifika gränsvärden
 */
export function generateVitalLimits(profile: PatientProfile): ExerciseVitalLimits {
  // Beräkna max HR
  let maxHR = profile.maxHeartRate || calculateMaxHeartRate(profile.age);

  // Justera för betablockerare
  const hasBetaBlocker = profile.medications?.some(med =>
    ['metoprolol', 'atenolol', 'bisoprolol', 'propranolol', 'carvedilol']
      .some(bb => med.toLowerCase().includes(bb))
  );

  if (hasBetaBlocker) {
    maxHR = adjustHRForBetaBlockers(maxHR);
  }

  // Beräkna målzon
  const restingHR = profile.restingHeartRate || 70;
  const targetZone = calculateTargetHeartRateZone(maxHR, restingHR, 0.5, 0.7);

  // Justera BP-gränser baserat på conditions
  const hasHypertension = profile.conditions?.some(c =>
    c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('högt blodtryck')
  );

  return {
    heartRateMax: Math.round(maxHR * 0.85), // 85% av max för rehab
    heartRateTarget: targetZone,
    bloodPressure: {
      systolicMax: hasHypertension ? 160 : 180,
      diastolicMax: hasHypertension ? 90 : 100,
      systolicExerciseMax: hasHypertension ? 200 : 220,
    },
    oxygenSaturationMin: profile.conditions?.some(c =>
      c.toLowerCase().includes('kol') || c.toLowerCase().includes('copd')
    ) ? 88 : 92,
    borgRPEMax: 15, // "Ansträngande" för rehab-patienter
  };
}

/**
 * Kontrollera vitalsäkerhet under träning
 */
export function checkVitalSafety(
  vitals: VitalSigns,
  limits: ExerciseVitalLimits
): VitalSafetyResult {
  const issues: VitalIssue[] = [];
  let shouldStopExercise = false;
  let warningLevel: VitalSafetyResult['warningLevel'] = 'none';

  // ========== HJÄRTFREKVENS ==========
  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate > ABSOLUTE_STOP_CRITERIA.heartRateMax) {
      issues.push({
        parameter: 'heartRate',
        value: vitals.heartRate,
        threshold: ABSOLUTE_STOP_CRITERIA.heartRateMax,
        severity: 'severe',
        message: `Hjärtfrekvens kritiskt hög (${vitals.heartRate} > ${ABSOLUTE_STOP_CRITERIA.heartRateMax})`,
      });
      shouldStopExercise = true;
      warningLevel = 'contraindicated';
    } else if (vitals.heartRate > limits.heartRateMax) {
      issues.push({
        parameter: 'heartRate',
        value: vitals.heartRate,
        threshold: limits.heartRateMax,
        severity: 'moderate',
        message: `Hjärtfrekvens över målzon (${vitals.heartRate} > ${limits.heartRateMax})`,
      });
      warningLevel = Math.max(warningLevelToNumber(warningLevel), 2) as unknown as VitalSafetyResult['warningLevel'];
      warningLevel = 'warning';
    } else if (vitals.heartRate > limits.heartRateTarget.upper) {
      issues.push({
        parameter: 'heartRate',
        value: vitals.heartRate,
        threshold: limits.heartRateTarget.upper,
        severity: 'mild',
        message: `Hjärtfrekvens i övre delen av målzon`,
      });
      if (warningLevel === 'none') warningLevel = 'caution';
    }
  }

  // ========== BLODTRYCK ==========
  if (vitals.bloodPressure) {
    const { systolic, diastolic } = vitals.bloodPressure;

    // Systoliskt
    if (systolic > ABSOLUTE_STOP_CRITERIA.systolicBP) {
      issues.push({
        parameter: 'bloodPressure',
        value: `${systolic}/${diastolic}`,
        threshold: `${ABSOLUTE_STOP_CRITERIA.systolicBP}`,
        severity: 'severe',
        message: `Systoliskt blodtryck kritiskt högt (${systolic} mmHg) - AVBRYT TRÄNING`,
      });
      shouldStopExercise = true;
      warningLevel = 'contraindicated';
    } else if (systolic > limits.bloodPressure.systolicExerciseMax) {
      issues.push({
        parameter: 'bloodPressure',
        value: `${systolic}/${diastolic}`,
        threshold: `${limits.bloodPressure.systolicExerciseMax}`,
        severity: 'moderate',
        message: `Systoliskt blodtryck högt under träning (${systolic} mmHg)`,
      });
      warningLevel = 'warning';
    } else if (systolic > WARNING_THRESHOLDS.systolicBP) {
      issues.push({
        parameter: 'bloodPressure',
        value: `${systolic}/${diastolic}`,
        threshold: `${WARNING_THRESHOLDS.systolicBP}`,
        severity: 'mild',
        message: `Systoliskt blodtryck något högt (${systolic} mmHg)`,
      });
      if (warningLevel === 'none') warningLevel = 'caution';
    }

    // Diastoliskt
    if (diastolic > ABSOLUTE_STOP_CRITERIA.diastolicBP) {
      issues.push({
        parameter: 'bloodPressure',
        value: `${systolic}/${diastolic}`,
        threshold: `${ABSOLUTE_STOP_CRITERIA.diastolicBP}`,
        severity: 'severe',
        message: `Diastoliskt blodtryck kritiskt högt (${diastolic} mmHg) - AVBRYT TRÄNING`,
      });
      shouldStopExercise = true;
      warningLevel = 'contraindicated';
    } else if (diastolic > limits.bloodPressure.diastolicMax) {
      issues.push({
        parameter: 'bloodPressure',
        value: `${systolic}/${diastolic}`,
        threshold: `${limits.bloodPressure.diastolicMax}`,
        severity: 'moderate',
        message: `Diastoliskt blodtryck högt (${diastolic} mmHg)`,
      });
      if (warningLevel !== 'contraindicated') warningLevel = 'warning';
    }
  }

  // ========== SYRESÄTTNING ==========
  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation < ABSOLUTE_STOP_CRITERIA.oxygenSaturation) {
      issues.push({
        parameter: 'oxygenSaturation',
        value: vitals.oxygenSaturation,
        threshold: ABSOLUTE_STOP_CRITERIA.oxygenSaturation,
        severity: 'severe',
        message: `Syresättning kritiskt låg (${vitals.oxygenSaturation}%) - AVBRYT TRÄNING`,
      });
      shouldStopExercise = true;
      warningLevel = 'contraindicated';
    } else if (vitals.oxygenSaturation < limits.oxygenSaturationMin) {
      issues.push({
        parameter: 'oxygenSaturation',
        value: vitals.oxygenSaturation,
        threshold: limits.oxygenSaturationMin,
        severity: 'moderate',
        message: `Syresättning under målnivå (${vitals.oxygenSaturation}%)`,
      });
      if (warningLevel !== 'contraindicated') warningLevel = 'warning';
    } else if (vitals.oxygenSaturation < WARNING_THRESHOLDS.oxygenSaturation) {
      issues.push({
        parameter: 'oxygenSaturation',
        value: vitals.oxygenSaturation,
        threshold: WARNING_THRESHOLDS.oxygenSaturation,
        severity: 'mild',
        message: `Syresättning något låg (${vitals.oxygenSaturation}%)`,
      });
      if (warningLevel === 'none') warningLevel = 'caution';
    }
  }

  // ========== BORG RPE ==========
  if (vitals.borgRPE !== undefined) {
    if (vitals.borgRPE >= ABSOLUTE_STOP_CRITERIA.borgRPE) {
      issues.push({
        parameter: 'borgRPE',
        value: vitals.borgRPE,
        threshold: ABSOLUTE_STOP_CRITERIA.borgRPE,
        severity: 'severe',
        message: `Upplevd ansträngning extremt hög (${vitals.borgRPE}/20) - AVBRYT TRÄNING`,
      });
      shouldStopExercise = true;
      warningLevel = 'contraindicated';
    } else if (vitals.borgRPE > limits.borgRPEMax) {
      issues.push({
        parameter: 'borgRPE',
        value: vitals.borgRPE,
        threshold: limits.borgRPEMax,
        severity: 'moderate',
        message: `Upplevd ansträngning hög (${vitals.borgRPE}/20) - sänk intensiteten`,
      });
      if (warningLevel !== 'contraindicated') warningLevel = 'warning';
    } else if (vitals.borgRPE > WARNING_THRESHOLDS.borgRPE) {
      issues.push({
        parameter: 'borgRPE',
        value: vitals.borgRPE,
        threshold: WARNING_THRESHOLDS.borgRPE,
        severity: 'mild',
        message: `Upplevd ansträngning något hög (${vitals.borgRPE}/20)`,
      });
      if (warningLevel === 'none') warningLevel = 'caution';
    }
  }

  // Generera rekommendation
  const recommendation = generateRecommendation(issues, shouldStopExercise);

  return {
    safe: issues.length === 0,
    warningLevel,
    issues,
    recommendation,
    shouldStopExercise,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function warningLevelToNumber(level: VitalSafetyResult['warningLevel']): number {
  const levels = { none: 0, caution: 1, warning: 2, critical: 3, contraindicated: 4 };
  return levels[level];
}

function generateRecommendation(
  issues: VitalIssue[],
  shouldStop: boolean
): string {
  if (shouldStop) {
    return 'AVBRYT TRÄNINGEN OMEDELBART. Vila och kontakta vårdgivare om symtom kvarstår.';
  }

  if (issues.length === 0) {
    return 'Alla vitalparametrar inom normala gränser. Fortsätt träningen.';
  }

  const severeIssues = issues.filter(i => i.severity === 'severe');
  const moderateIssues = issues.filter(i => i.severity === 'moderate');

  if (severeIssues.length > 0) {
    return 'Avbryt träningen och vila. Kontakta vårdgivare.';
  }

  if (moderateIssues.length > 0) {
    return 'Sänk träningsintensiteten och övervaka symtom noggrant.';
  }

  return 'Fortsätt med försiktighet och övervaka vitaltecken regelbundet.';
}

// ============================================
// BORG RPE SCALE
// ============================================

/**
 * Borg RPE (Rating of Perceived Exertion) skala
 * 6-20 skala som korrelerar med hjärtfrekvens (× 10 ≈ HR)
 */
export const BORG_RPE_SCALE = {
  6: { description: 'Ingen ansträngning alls', intensity: 'vila' },
  7: { description: 'Extremt lätt', intensity: 'vila' },
  8: { description: 'Mycket lätt', intensity: 'vila' },
  9: { description: 'Mycket lätt', intensity: 'väldigt lätt' },
  10: { description: 'Lätt', intensity: 'väldigt lätt' },
  11: { description: 'Lätt', intensity: 'lätt' },
  12: { description: 'Något ansträngande', intensity: 'måttlig' },
  13: { description: 'Något ansträngande', intensity: 'måttlig' },
  14: { description: 'Ansträngande', intensity: 'ansträngande' },
  15: { description: 'Ansträngande', intensity: 'ansträngande' },
  16: { description: 'Mycket ansträngande', intensity: 'kraftig' },
  17: { description: 'Mycket ansträngande', intensity: 'kraftig' },
  18: { description: 'Extremt ansträngande', intensity: 'väldigt kraftig' },
  19: { description: 'Extremt ansträngande', intensity: 'maximal' },
  20: { description: 'Maximal ansträngning', intensity: 'maximal' },
};

/**
 * Konvertera Borg RPE till ungefärlig hjärtfrekvens
 * Baserat på sambandet: RPE × 10 ≈ HR
 */
export function borgToApproximateHR(borgRPE: number): number {
  return borgRPE * 10;
}

/**
 * Rekommenderad Borg RPE för rehabilitering
 */
export function getRehabBorgTarget(phase: 1 | 2 | 3): { min: number; max: number; description: string } {
  switch (phase) {
    case 1: // Tidig fas
      return { min: 9, max: 11, description: 'Mycket lätt till lätt' };
    case 2: // Mellanfas
      return { min: 11, max: 13, description: 'Lätt till något ansträngande' };
    case 3: // Sen fas
      return { min: 12, max: 15, description: 'Något ansträngande till ansträngande' };
  }
}

// ============================================
// VITAL SIGNS TRENDS
// ============================================

export interface VitalTrend {
  parameter: keyof VitalSigns;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercent: number;
  concern: boolean;
  message: string;
}

/**
 * Analysera trender i vitalparametrar över tid
 */
export function analyzeVitalTrends(
  history: VitalSigns[],
  windowSize: number = 5
): VitalTrend[] {
  if (history.length < windowSize) {
    return [];
  }

  const trends: VitalTrend[] = [];
  const recent = history.slice(-windowSize);

  // Analysera hjärtfrekvens
  const hrValues = recent.map(v => v.heartRate).filter((v): v is number => v !== undefined);
  if (hrValues.length >= 3) {
    const trend = analyzeTrendDirection(hrValues);
    const avgChange = calculateAverageChange(hrValues);

    trends.push({
      parameter: 'heartRate',
      trend: trend,
      changePercent: avgChange,
      concern: trend === 'increasing' && avgChange > 10,
      message: trend === 'increasing' && avgChange > 10
        ? 'Hjärtfrekvensen ökar kontinuerligt - överväg paus'
        : trend === 'stable'
          ? 'Hjärtfrekvensen stabil'
          : 'Hjärtfrekvensen normaliseras',
    });
  }

  // Analysera syresättning
  const spo2Values = recent.map(v => v.oxygenSaturation).filter((v): v is number => v !== undefined);
  if (spo2Values.length >= 3) {
    const trend = analyzeTrendDirection(spo2Values);
    const avgChange = calculateAverageChange(spo2Values);

    trends.push({
      parameter: 'oxygenSaturation',
      trend: trend,
      changePercent: avgChange,
      concern: trend === 'decreasing' && avgChange > 3,
      message: trend === 'decreasing' && avgChange > 3
        ? 'Syresättningen sjunker - ta en paus'
        : trend === 'stable'
          ? 'Syresättningen stabil'
          : 'Syresättningen normaliseras',
    });
  }

  return trends;
}

function analyzeTrendDirection(values: number[]): 'increasing' | 'stable' | 'decreasing' {
  if (values.length < 2) return 'stable';

  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) increases++;
    else if (diff < 0) decreases++;
  }

  if (increases > decreases * 2) return 'increasing';
  if (decreases > increases * 2) return 'decreasing';
  return 'stable';
}

function calculateAverageChange(values: number[]): number {
  if (values.length < 2) return 0;

  const first = values[0];
  const last = values[values.length - 1];

  return Math.abs((last - first) / first * 100);
}

// ============================================
// MEDICATION-VITAL INTEGRATION
// ============================================

import {
  PatientMedication,
  getExerciseRecommendationsForMedications,
  checkMedicationExerciseSafety,
  getMedicationByClass,
  getMedicationInteraction
} from '../data/medicationInteractions';

export interface MedicationAdjustedVitalLimits extends ExerciseVitalLimits {
  useRPE: boolean;
  targetRPE?: { min: number; max: number };
  hrReductionPercent?: number;
  hydrationRequirement: number;
  medicationWarnings: string[];
  contraindications: string[];
}

/**
 * Generera patientspecifika gränsvärden justerade för läkemedel
 *
 * Integrerar medicationInteractions.ts med vitalSignsService.ts
 * för att ge korrekt anpassade träningsgränser.
 */
export function generateVitalLimitsWithMedications(
  profile: PatientProfile,
  medications: PatientMedication[]
): MedicationAdjustedVitalLimits {
  // Börja med basgränser
  const baseLimits = generateVitalLimits(profile);

  // Hämta läkemedelsrekommendationer
  const medRecommendations = getExerciseRecommendationsForMedications(medications);
  const safetyCheck = checkMedicationExerciseSafety(medications);

  // Justera HR-gränser baserat på läkemedel
  let adjustedHRMax = baseLimits.heartRateMax;
  let adjustedHRTarget = { ...baseLimits.heartRateTarget };

  if (medRecommendations.maxHRReduction) {
    const reduction = medRecommendations.maxHRReduction / 100;
    adjustedHRMax = Math.round(adjustedHRMax * (1 - reduction));
    adjustedHRTarget = {
      lower: Math.round(adjustedHRTarget.lower * (1 - reduction)),
      upper: Math.round(adjustedHRTarget.upper * (1 - reduction)),
    };
  }

  // Kontrollera specifika läkemedelsklasser för ytterligare justeringar
  const medicationIds = medications.map(m => m.medicationId.toLowerCase());

  // SGLT2-hämmare: extra försiktighet med dehydrering och DKA
  const hasSGLT2 = medicationIds.includes('sglt2_inhibitors') ||
    medicationIds.some(id => ['empagliflozin', 'dapagliflozin', 'canagliflozin'].includes(id));

  // GLP-1-agonister: energibrist-risk
  const hasGLP1 = medicationIds.includes('glp1_agonists') ||
    medicationIds.some(id => ['semaglutid', 'liraglutid', 'tirzepatid'].includes(id));

  // Statiner: rabdomyolys-risk
  const hasStatins = medicationIds.includes('statins') ||
    medicationIds.some(id => ['atorvastatin', 'simvastatin', 'rosuvastatin'].includes(id));

  // Generera anpassade varningar
  const medicationWarnings: string[] = [...safetyCheck.warnings];

  if (hasSGLT2) {
    medicationWarnings.push(
      'SGLT2-hämmare: Övervaka för tecken på euglykemisk DKA (illamående, buksmärta, djup andning) - blodsocker kan vara normalt!'
    );
  }

  if (hasGLP1) {
    medicationWarnings.push(
      'GLP-1-agonist: Se till att äta före träning trots minskad aptit. Styrketräning rekommenderas för att bevara muskelmassa.'
    );
  }

  if (hasStatins) {
    medicationWarnings.push(
      'Statin: Rapportera all muskelsmärta omedelbart. Övervaka för mörk urin (rabdomyolys). Undvik extremt intensiv träning.'
    );
  }

  return {
    ...baseLimits,
    heartRateMax: adjustedHRMax,
    heartRateTarget: adjustedHRTarget,
    useRPE: medRecommendations.useRPE,
    targetRPE: medRecommendations.targetRPE,
    hrReductionPercent: medRecommendations.maxHRReduction,
    hydrationRequirement: medRecommendations.hydrationML,
    medicationWarnings,
    contraindications: safetyCheck.contraindications,
  };
}

/**
 * Utökad vitalsäkerhetskontroll med läkemedelsintegrering
 */
export function checkVitalSafetyWithMedications(
  vitals: VitalSigns,
  profile: PatientProfile,
  medications: PatientMedication[]
): VitalSafetyResult & {
  medicationWarnings: string[];
  useRPEInstead: boolean;
  hydrationReminder: string | null;
} {
  // Hämta justerade gränser
  const adjustedLimits = generateVitalLimitsWithMedications(profile, medications);

  // Kör standard vitalkontroll med justerade gränser
  const baseResult = checkVitalSafety(vitals, adjustedLimits);

  // Lägg till läkemedelsspecifika kontroller
  const medicationWarnings: string[] = [];
  let hydrationReminder: string | null = null;

  // Kontrollera om RPE ska användas istället för HR
  if (adjustedLimits.useRPE) {
    if (vitals.heartRate && !vitals.borgRPE) {
      medicationWarnings.push(
        'På grund av dina läkemedel bör du använda upplevd ansträngning (RPE) ' +
        `istället för puls. Sikta på RPE ${adjustedLimits.targetRPE?.min}-${adjustedLimits.targetRPE?.max}.`
      );
    }
  }

  // Hydreringsreminder baserat på läkemedel
  if (adjustedLimits.hydrationRequirement >= 750) {
    hydrationReminder = `VIKTIGT: Dina läkemedel kräver extra vätskeintag. ` +
      `Drick minst ${adjustedLimits.hydrationRequirement}ml före träning ` +
      `och fortsätt dricka under träningen.`;
  }

  // Lägg till läkemedelsspecifika varningar
  medicationWarnings.push(...adjustedLimits.medicationWarnings);

  // Justera rekommendation om läkemedelsvarningar finns
  let finalRecommendation = baseResult.recommendation;
  if (medicationWarnings.length > 0 && !baseResult.shouldStopExercise) {
    finalRecommendation += ' ' + medicationWarnings[0];
  }

  return {
    ...baseResult,
    recommendation: finalRecommendation,
    medicationWarnings,
    useRPEInstead: adjustedLimits.useRPE,
    hydrationReminder,
  };
}

/**
 * Generera träningsguide baserad på vitaler och läkemedel
 */
export function generateVitalMedicationExerciseGuide(
  profile: PatientProfile,
  medications: PatientMedication[]
): string {
  const limits = generateVitalLimitsWithMedications(profile, medications);
  const safetyCheck = checkMedicationExerciseSafety(medications);

  let guide = '# Träningsguide - Vitaler & Läkemedel\n\n';

  // Risknivå
  guide += `## Risknivå: ${
    safetyCheck.overallRisk === 'very_high' ? '⛔ Mycket hög - kräver övervakning' :
    safetyCheck.overallRisk === 'high' ? '⚠️ Hög - var försiktig' :
    safetyCheck.overallRisk === 'moderate' ? '⚡ Måttlig - följ rekommendationerna' :
    '✅ Låg - normala försiktighetsåtgärder'
  }\n\n`;

  // Intensitetsstyrning
  guide += '## Intensitetsstyrning\n';
  if (limits.useRPE) {
    guide += `- **Använd RPE-skalan** istället för puls (${limits.targetRPE?.min}-${limits.targetRPE?.max})\n`;
    guide += `- Pulsmätning påverkas av dina läkemedel\n`;
  } else {
    guide += `- Målpuls: ${limits.heartRateTarget.lower}-${limits.heartRateTarget.upper} slag/min\n`;
    guide += `- Max puls: ${limits.heartRateMax} slag/min\n`;
  }
  guide += '\n';

  // Blodtrycksgränser
  guide += '## Blodtrycksgränser\n';
  guide += `- Max systoliskt (vila): ${limits.bloodPressure.systolicMax} mmHg\n`;
  guide += `- Max systoliskt (träning): ${limits.bloodPressure.systolicExerciseMax} mmHg\n`;
  guide += `- Max diastoliskt: ${limits.bloodPressure.diastolicMax} mmHg\n\n`;

  // Syresättning
  guide += '## Syresättning (SpO2)\n';
  guide += `- Minimum: ${limits.oxygenSaturationMin}%\n`;
  guide += `- Om under detta: ta paus och andas djupt\n\n`;

  // Hydrering
  guide += '## Hydrering\n';
  guide += `- Före träning: ${limits.hydrationRequirement}ml\n`;
  guide += `- Under träning: 150-250ml var 15-20 min\n\n`;

  // Varningar
  if (limits.medicationWarnings.length > 0) {
    guide += '## Läkemedelsspecifika varningar\n';
    for (const warning of limits.medicationWarnings) {
      guide += `- ⚠️ ${warning}\n`;
    }
    guide += '\n';
  }

  // Kontraindikationer
  if (limits.contraindications.length > 0) {
    guide += '## Undvik\n';
    for (const contra of limits.contraindications) {
      guide += `- ❌ ${contra}\n`;
    }
    guide += '\n';
  }

  // Stoppkriterier
  guide += '## Stoppkriterier (avbryt omedelbart vid)\n';
  guide += '- Bröstsmärta eller tryck\n';
  guide += '- Svår andnöd\n';
  guide += '- Yrsel eller svimningskänsla\n';
  guide += '- Illamående eller kräkning\n';
  guide += '- Oregelbunden hjärtrytm\n';
  guide += `- RPE ≥ ${ABSOLUTE_STOP_CRITERIA.borgRPE}\n`;
  guide += `- SpO2 < ${ABSOLUTE_STOP_CRITERIA.oxygenSaturation}%\n\n`;

  guide += '---\n*Detta är automatiskt genererad information. Rådgör alltid med din läkare eller fysioterapeut.*';

  return guide;
}
