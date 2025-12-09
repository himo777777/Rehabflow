/**
 * Adaptive Difficulty Service - Automatisk svårighetsanpassning
 *
 * Justerar övningssvårighet baserat på:
 * - Smärthistorik
 * - Formpoäng över tid
 * - Genomförandefrekvens
 * - Progressionsmönster
 *
 * Skapar individanpassade rekommendationer för sets, reps och intensitet.
 */

import { FormScore } from './formAnalysisService';

// ============================================
// TYPES
// ============================================

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  date: string;
  completed: boolean;
  skipped: boolean;
  setsCompleted: number;
  setsTarget: number;
  repsCompleted: number[];
  repsTarget: number[];
  painBefore?: number;
  painAfter?: number;
  formScore?: number;
  duration?: number;
  notes?: string;
}

export interface PainReport {
  date: string;
  level: number;           // VAS 0-10
  location: string;
  timing: 'before' | 'during' | 'after';
  exerciseId?: string;
}

export interface DifficultyAdjustment {
  factor: number;              // 0.5 = 50% lättare, 1.5 = 50% svårare
  action: 'decrease' | 'maintain' | 'increase';
  reason: string;
  confidence: number;          // 0-100 hur säker vi är
  suggestedSets?: number;
  suggestedReps?: string;
  suggestedIntensity?: string;
  warnings?: string[];
}

export interface ProgressionMetrics {
  completionRate: number;      // Genomförda/totala övningar
  averagePain: number;         // Genomsnittlig smärtnivå
  painTrend: 'improving' | 'stable' | 'worsening';
  formTrend: 'improving' | 'stable' | 'declining';
  averageFormScore: number;
  consistency: number;         // Hur ofta tränar användaren
  daysAnalyzed: number;
}

export interface UserPerformanceHistory {
  exerciseLogs: ExerciseLog[];
  painReports: PainReport[];
  formScores: FormScore[];
}

// ============================================
// CONFIGURATION
// ============================================

// Tröskelvärden för beslut
const CONFIG = {
  // Smärtgränser
  PAIN_HIGH_THRESHOLD: 6,      // VAS >= 6 = minska
  PAIN_LOW_THRESHOLD: 3,       // VAS <= 3 = kan öka
  PAIN_INCREASE_THRESHOLD: 2,  // Om smärta ökat > 2 poäng

  // Form score gränser
  FORM_HIGH_THRESHOLD: 80,     // Bra form
  FORM_LOW_THRESHOLD: 60,      // Behöver förbättras

  // Genomförande gränser
  COMPLETION_HIGH: 0.9,        // 90%+ genomfört
  COMPLETION_LOW: 0.7,         // < 70% genomfört

  // Konsistens
  CONSISTENCY_HIGH: 0.8,       // 80%+ av planerade dagar
  CONSISTENCY_LOW: 0.5,        // < 50% av planerade dagar

  // Justeringsfaktorer
  DECREASE_FACTOR_MAJOR: 0.7,  // Stor minskning
  DECREASE_FACTOR_MINOR: 0.85, // Liten minskning
  INCREASE_FACTOR_MINOR: 1.1,  // Liten ökning
  INCREASE_FACTOR_MAJOR: 1.2,  // Stor ökning

  // Analys period
  DAYS_TO_ANALYZE: 14,         // 2 veckors data
  MIN_SESSIONS_FOR_ANALYSIS: 3 // Minst 3 träningar
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Beräkna genomsnitt av tal
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Beräkna trend (linjär regression)
 */
function calculateTrend(values: number[]): 'improving' | 'stable' | 'worsening' | 'declining' {
  if (values.length < 3) return 'stable';

  // Beräkna enkel linjär regression
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Tolka lutningen
  const threshold = 0.5;

  if (Math.abs(slope) < threshold) {
    return 'stable';
  }

  // För smärta: negativ slope = förbättring (lägre smärta)
  // För form: positiv slope = förbättring (högre poäng)
  return slope > 0 ? 'improving' : 'worsening';
}

/**
 * Filtrera data från senaste N dagar
 */
function filterRecentData<T extends { date: string }>(
  data: T[],
  days: number
): T[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return data.filter(item => new Date(item.date) >= cutoff);
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Analysera användarens prestationshistorik
 */
export function analyzePerformance(
  history: UserPerformanceHistory,
  exerciseId?: string
): ProgressionMetrics {
  // Filtrera senaste periodens data
  let logs = filterRecentData(history.exerciseLogs, CONFIG.DAYS_TO_ANALYZE);
  let painReports = filterRecentData(history.painReports, CONFIG.DAYS_TO_ANALYZE);

  // Om specifik övning, filtrera på den
  if (exerciseId) {
    logs = logs.filter(log => log.exerciseId === exerciseId);
    painReports = painReports.filter(p => p.exerciseId === exerciseId);
  }

  // Beräkna completion rate
  const totalSessions = logs.length;
  const completedSessions = logs.filter(l => l.completed && !l.skipped).length;
  const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 1;

  // Beräkna smärtgenomsnitt och trend
  const painLevels = painReports.map(p => p.level);
  const averagePain = average(painLevels);
  const painTrend = painLevels.length >= 3
    ? calculateTrend(painLevels)
    : 'stable';

  // Beräkna formgenomsnitt och trend
  const formScoreValues = history.formScores.map(f => f.overall);
  const averageFormScore = average(formScoreValues);
  const formTrendResult = formScoreValues.length >= 3
    ? calculateTrend(formScoreValues)
    : 'stable';

  // Mappa 'worsening' till 'declining' för formTrend
  const formTrend: 'improving' | 'stable' | 'declining' =
    formTrendResult === 'worsening' ? 'declining' : formTrendResult as 'improving' | 'stable';

  // Beräkna konsistens (unika träningsdagar / totala dagar)
  const uniqueDays = new Set(logs.map(l => l.date.split('T')[0])).size;
  const consistency = uniqueDays / CONFIG.DAYS_TO_ANALYZE;

  return {
    completionRate,
    averagePain,
    painTrend: painTrend as 'improving' | 'stable' | 'worsening',
    formTrend,
    averageFormScore,
    consistency,
    daysAnalyzed: CONFIG.DAYS_TO_ANALYZE
  };
}

/**
 * Huvudfunktion: Beräkna svårighetsjustering
 */
export function calculateDifficultyAdjustment(
  history: UserPerformanceHistory,
  exerciseId?: string,
  currentPhase?: number
): DifficultyAdjustment {
  const metrics = analyzePerformance(history, exerciseId);
  const warnings: string[] = [];

  // Samla beslutspoäng
  let adjustmentScore = 0; // Negativ = minska, Positiv = öka
  let confidence = 50;

  // ============================================
  // REGEL 1: Smärtnivå (VIKTIGAST)
  // ============================================

  if (metrics.averagePain >= CONFIG.PAIN_HIGH_THRESHOLD) {
    // Hög smärta = MINSKA
    adjustmentScore -= 3;
    warnings.push('Hög smärtnivå rapporterad - minskar belastning');
    confidence += 20;
  } else if (metrics.averagePain <= CONFIG.PAIN_LOW_THRESHOLD) {
    // Låg smärta = kan öka
    adjustmentScore += 1;
  }

  // Smärttrend
  if (metrics.painTrend === 'worsening') {
    adjustmentScore -= 2;
    warnings.push('Smärtan har ökat - rekommenderar försiktighet');
    confidence += 15;
  } else if (metrics.painTrend === 'improving') {
    adjustmentScore += 1;
    confidence += 10;
  }

  // ============================================
  // REGEL 2: Formpoäng
  // ============================================

  if (metrics.averageFormScore < CONFIG.FORM_LOW_THRESHOLD) {
    // Dålig form = minska tills formen förbättras
    adjustmentScore -= 1;
    warnings.push('Fokusera på teknik innan ökning');
  } else if (metrics.averageFormScore >= CONFIG.FORM_HIGH_THRESHOLD) {
    // Bra form = redo för ökning
    adjustmentScore += 1;
    confidence += 10;
  }

  // Formtrend
  if (metrics.formTrend === 'declining') {
    adjustmentScore -= 1;
    warnings.push('Formen försämras - kontrollera teknik');
  } else if (metrics.formTrend === 'improving') {
    adjustmentScore += 0.5;
  }

  // ============================================
  // REGEL 3: Genomförande
  // ============================================

  if (metrics.completionRate < CONFIG.COMPLETION_LOW) {
    // Slutför inte övningar = för svårt
    adjustmentScore -= 1;
    warnings.push('Många oavslutade pass - kan vara för svårt');
  } else if (metrics.completionRate >= CONFIG.COMPLETION_HIGH) {
    // Genomför allt = redo för mer
    adjustmentScore += 1;
    confidence += 10;
  }

  // ============================================
  // REGEL 4: Konsistens
  // ============================================

  if (metrics.consistency < CONFIG.CONSISTENCY_LOW) {
    // Låg konsistens = behåll eller minska
    if (adjustmentScore > 0) {
      adjustmentScore = 0;
    }
    warnings.push('Låg träningsfrekvens - fokusera på regelbundenhet');
  }

  // ============================================
  // REGEL 5: Fasrestriktioner
  // ============================================

  if (currentPhase === 1) {
    // Fas 1 = aldrig öka
    if (adjustmentScore > 0) {
      adjustmentScore = 0;
      warnings.push('Skyddsfas - ingen progression tillåten');
    }
    confidence = Math.max(confidence, 80);
  }

  // ============================================
  // BERÄKNA SLUTLIG JUSTERING
  // ============================================

  let factor: number;
  let action: 'decrease' | 'maintain' | 'increase';
  let reason: string;

  if (adjustmentScore <= -3) {
    // Stor minskning
    factor = CONFIG.DECREASE_FACTOR_MAJOR;
    action = 'decrease';
    reason = 'Hög smärta eller flera varningssignaler - minskar belastningen avsevärt';
  } else if (adjustmentScore <= -1) {
    // Liten minskning
    factor = CONFIG.DECREASE_FACTOR_MINOR;
    action = 'decrease';
    reason = 'Indikationer på överbelastning - minskar belastningen något';
  } else if (adjustmentScore >= 3) {
    // Stor ökning
    factor = CONFIG.INCREASE_FACTOR_MAJOR;
    action = 'increase';
    reason = 'Utmärkt prestanda på alla områden - redo för större progression';
  } else if (adjustmentScore >= 1.5) {
    // Liten ökning
    factor = CONFIG.INCREASE_FACTOR_MINOR;
    action = 'increase';
    reason = 'Bra prestanda - redo för gradvis ökning';
  } else {
    // Behåll nuvarande nivå
    factor = 1.0;
    action = 'maintain';
    reason = 'Nuvarande nivå är lämplig - fortsätt som planerat';
  }

  // Begränsa confidence
  confidence = Math.min(95, Math.max(30, confidence));

  // Generera förslag
  const suggestions = generateSuggestions(factor, metrics);

  return {
    factor,
    action,
    reason,
    confidence,
    ...suggestions,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Generera konkreta förslag baserat på justeringsfaktor
 */
function generateSuggestions(
  factor: number,
  metrics: ProgressionMetrics
): { suggestedSets?: number; suggestedReps?: string; suggestedIntensity?: string } {
  const baseReps = 10;
  const baseSets = 3;

  if (factor < 0.9) {
    // Minska
    return {
      suggestedSets: Math.max(2, Math.floor(baseSets * factor)),
      suggestedReps: `${Math.floor(baseReps * factor)}-${Math.floor(baseReps * factor) + 2}`,
      suggestedIntensity: 'Lätt till moderat (RPE 3-5)'
    };
  } else if (factor > 1.1) {
    // Öka
    return {
      suggestedSets: Math.min(5, Math.ceil(baseSets * factor)),
      suggestedReps: `${Math.floor(baseReps * factor)}-${Math.floor(baseReps * factor) + 2}`,
      suggestedIntensity: 'Moderat till utmanande (RPE 6-7)'
    };
  }

  // Behåll
  return {
    suggestedSets: baseSets,
    suggestedReps: '8-12',
    suggestedIntensity: 'Moderat (RPE 5-6)'
  };
}

/**
 * Enkel hjälpfunktion för snabb justering baserat på senaste träning
 */
export function quickAdjustment(
  lastPainLevel: number,
  lastFormScore: number,
  completed: boolean
): DifficultyAdjustment {
  // Snabb bedömning utan full historik
  let factor = 1.0;
  let action: 'decrease' | 'maintain' | 'increase' = 'maintain';
  let reason = '';

  if (lastPainLevel >= 7) {
    factor = 0.7;
    action = 'decrease';
    reason = 'Hög smärta vid senaste träningen - minskar avsevärt';
  } else if (lastPainLevel >= 5) {
    factor = 0.85;
    action = 'decrease';
    reason = 'Moderat smärta - minskar något';
  } else if (!completed) {
    factor = 0.9;
    action = 'decrease';
    reason = 'Övningen avslutades inte - kan vara för svår';
  } else if (lastFormScore >= 85 && lastPainLevel <= 2) {
    factor = 1.15;
    action = 'increase';
    reason = 'Utmärkt form och låg smärta - redo för progression';
  } else if (lastFormScore >= 75 && lastPainLevel <= 3) {
    factor = 1.1;
    action = 'increase';
    reason = 'Bra prestanda - lätt ökning möjlig';
  } else {
    reason = 'Fortsätt med nuvarande nivå';
  }

  return {
    factor,
    action,
    reason,
    confidence: 60 // Lägre confidence vid snabb bedömning
  };
}

/**
 * Kontrollera om användaren är redo för nästa fas
 */
export function checkPhaseProgression(
  history: UserPerformanceHistory,
  currentPhase: number,
  daysSinceSurgery?: number
): {
  readyForProgression: boolean;
  reason: string;
  recommendations: string[];
} {
  const metrics = analyzePerformance(history);
  const recommendations: string[] = [];

  // Fas 1 kräver tidsgräns (minst 6 veckor för de flesta protokoll)
  if (currentPhase === 1 && daysSinceSurgery !== undefined && daysSinceSurgery < 42) {
    return {
      readyForProgression: false,
      reason: `Fas 1 pågår - ${42 - daysSinceSurgery} dagar kvar till fas 2`,
      recommendations: ['Fortsätt med skyddsfas-övningar', 'Fokusera på smärtkontroll']
    };
  }

  // Kontrollera kriterier för progression
  const criteriaCheck = {
    lowPain: metrics.averagePain <= 3,
    goodForm: metrics.averageFormScore >= 70,
    highCompletion: metrics.completionRate >= 0.85,
    painImproving: metrics.painTrend !== 'worsening',
    consistent: metrics.consistency >= 0.6
  };

  const passedCriteria = Object.values(criteriaCheck).filter(Boolean).length;
  const totalCriteria = Object.keys(criteriaCheck).length;

  // Lägg till rekommendationer baserat på vad som saknas
  if (!criteriaCheck.lowPain) {
    recommendations.push('Smärtnivån behöver minska ytterligare');
  }
  if (!criteriaCheck.goodForm) {
    recommendations.push('Förbättra övningsteknik innan progression');
  }
  if (!criteriaCheck.highCompletion) {
    recommendations.push('Slutför fler av dina planerade övningar');
  }
  if (!criteriaCheck.painImproving) {
    recommendations.push('Vänta tills smärtan stabiliseras eller förbättras');
  }
  if (!criteriaCheck.consistent) {
    recommendations.push('Öka träningsfrekvensen');
  }

  // Minst 4 av 5 kriterier måste vara uppfyllda
  const readyForProgression = passedCriteria >= 4;

  return {
    readyForProgression,
    reason: readyForProgression
      ? `Uppfyller ${passedCriteria}/${totalCriteria} kriterier - redo för nästa fas!`
      : `Uppfyller ${passedCriteria}/${totalCriteria} kriterier - fortsätt nuvarande fas`,
    recommendations
  };
}

/**
 * Formatera justering för visning i UI
 */
export function formatAdjustmentForUI(adjustment: DifficultyAdjustment): {
  title: string;
  description: string;
  icon: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (adjustment.action === 'increase') {
    return {
      title: 'Redo för progression!',
      description: adjustment.reason,
      icon: '📈',
      color: 'green'
    };
  } else if (adjustment.action === 'decrease') {
    return {
      title: 'Anpassning rekommenderas',
      description: adjustment.reason,
      icon: '📉',
      color: 'red'
    };
  }

  return {
    title: 'Fortsätt som planerat',
    description: adjustment.reason,
    icon: '✅',
    color: 'yellow'
  };
}
