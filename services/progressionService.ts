/**
 * PROGRESSIONSSERVICE - ÖVERBELASTNINGSPRINCIPEN
 *
 * Denna service implementerar evidensbaserad progressionslogik baserat på:
 *
 * - Överbelastningsprincipen (Progressive Overload Principle)
 * - SAID-principen (Specific Adaptation to Imposed Demands)
 * - Smärtbaserad progression (Pain-guided progression)
 *
 * Källor:
 * - Schoenfeld BJ et al. 2017 - Progressive overload for hypertrophy
 * - Lorenz D et al. 2010 - Periodization in rehabilitation
 * - Blanpied PR et al. 2017 - Clinical progression guidelines
 * - Glassman K. 2017 - Rate of progression in rehabilitation
 */

// ============================================
// INTERFACES
// ============================================

export interface ProgressionCriteria {
  painDuringExercise: number;       // VAS 0-10 under övning
  painAfterExercise: number;        // VAS 0-10 efter övning
  restingPain: number;              // VAS 0-10 i vila
  completionRate: number;           // % genomförda sessioner (0-100)
  perceivedEffort: 'lätt' | 'lagom' | 'svårt' | 'för_svårt';
  daysInCurrentPhase: number;
  exerciseQuality: 'dålig' | 'acceptabel' | 'god' | 'utmärkt';
}

export interface ProgressionDecision {
  action: 'progress' | 'maintain' | 'regress' | 'pause';
  volumeMultiplier: number;         // 0.5 - 1.25
  intensityAdjustment: number;      // -2 to +2 RPE
  recommendation: string;
  evidence: string;
  warnings?: string[];
  nextEvaluation: string;           // När nästa utvärdering bör ske
}

export interface VolumeProgression {
  currentSets: number;
  currentReps: string;
  currentWeight?: number;
  newSets: number;
  newReps: string;
  newWeight?: number;
  percentChange: number;
  rationale: string;
}

export interface PhaseTransitionCriteria {
  minDaysInPhase: number;
  maxPainLevel: number;
  minCompletionRate: number;
  requiredQuality: string;
  specificCriteria: string[];
}

// ============================================
// PROGRESSIONSKRITERIER PER FAS
// ============================================

export const PHASE_TRANSITION_CRITERIA: Record<number, PhaseTransitionCriteria> = {
  1: {
    minDaysInPhase: 7,
    maxPainLevel: 4,
    minCompletionRate: 70,
    requiredQuality: 'acceptabel',
    specificCriteria: [
      'Smärta minskar eller stabil',
      'Ingen svullnad eller förvärring efter träning',
      'Kan utföra ADL utan betydande smärtökning',
      'God tolerans för isometrisk träning'
    ]
  },
  2: {
    minDaysInPhase: 14,
    maxPainLevel: 3,
    minCompletionRate: 80,
    requiredQuality: 'god',
    specificCriteria: [
      'Full smärtfri rörlighet',
      'Grundläggande styrka återställd (>70% av frisk sida)',
      'Klarar dagliga aktiviteter utan besvär',
      'God neuromuskul kontroll'
    ]
  },
  3: {
    minDaysInPhase: 21,
    maxPainLevel: 2,
    minCompletionRate: 85,
    requiredQuality: 'utmärkt',
    specificCriteria: [
      'Full styrka och rörlighet',
      'Klarar sportspecifika/arbetsspecifika krav',
      'Inga besvär vid provokationstester',
      'Psykologisk beredskap för återgång'
    ]
  }
};

// ============================================
// SMÄRTBASERAD PROGRESSIONSLOGIK
// ============================================

/**
 * "Traffic Light" system för smärtbaserad progression
 * Baserat på: Thomee R. 1997, Silbernagel KG et al. 2007
 */
export function evaluatePainResponse(
  painDuring: number,
  painAfter: number,
  painNextDay: number
): 'green' | 'yellow' | 'red' {
  // GRÖNT LJUS: Säkert att progrediera
  if (painDuring <= 3 && painAfter <= 3 && painNextDay <= 2) {
    return 'green';
  }

  // RÖTT LJUS: Behöver regressera
  if (painDuring >= 6 || painAfter >= 6 || painNextDay >= 5) {
    return 'red';
  }

  // GULT LJUS: Behåll nuvarande nivå
  return 'yellow';
}

/**
 * Detaljerad progressionsbedömning
 */
export function evaluateProgression(criteria: ProgressionCriteria): ProgressionDecision {
  const {
    painDuringExercise,
    painAfterExercise,
    restingPain,
    completionRate,
    perceivedEffort,
    daysInCurrentPhase,
    exerciseQuality
  } = criteria;

  // Beräkna trafikljusstatus
  const painStatus = evaluatePainResponse(
    painDuringExercise,
    painAfterExercise,
    restingPain
  );

  // RÖDA FLAGGOR - Pausa eller regressera
  if (painStatus === 'red') {
    return {
      action: 'regress',
      volumeMultiplier: 0.7,
      intensityAdjustment: -2,
      recommendation: 'Smärtan är för hög. Minska belastning och volym med 30%.',
      evidence: 'Thomee R. 1997: VAS > 5 under/efter träning indikerar överbelastning.',
      warnings: [
        'Kontrollera teknik',
        'Överväg vila i 24-48 timmar',
        'Om ingen förbättring, kontakta fysioterapeut'
      ],
      nextEvaluation: '2-3 dagar'
    };
  }

  // GULT LJUS - Behåll nuvarande nivå
  if (painStatus === 'yellow') {
    return {
      action: 'maintain',
      volumeMultiplier: 1.0,
      intensityAdjustment: 0,
      recommendation: 'Behåll nuvarande träningsnivå. Smärtan är acceptabel men inte optimal.',
      evidence: 'Silbernagel et al. 2007: Moderat smärta (3-5) tillåts men kräver övervakning.',
      nextEvaluation: '1 vecka'
    };
  }

  // GRÖNT LJUS - Potentiell progression
  // Men kontrollera andra faktorer först

  // Kontrollera följsamhet
  if (completionRate < 70) {
    return {
      action: 'maintain',
      volumeMultiplier: 1.0,
      intensityAdjustment: 0,
      recommendation: 'Följsamheten är för låg för säker progression. Fokusera på att genomföra planerad träning.',
      evidence: 'Lorenz D. 2010: Minst 70% följsamhet krävs för optimal adaptation.',
      warnings: ['Identifiera barriärer för träning'],
      nextEvaluation: '1 vecka'
    };
  }

  // Kontrollera upplevd ansträngning
  if (perceivedEffort === 'för_svårt') {
    return {
      action: 'maintain',
      volumeMultiplier: 1.0,
      intensityAdjustment: -1,
      recommendation: 'Träningen upplevs för krävande. Minska intensiteten något.',
      evidence: 'RPE-baserad träning: Sänk intensitet om RPE konsekvent > 8.',
      nextEvaluation: '3-5 dagar'
    };
  }

  // Kontrollera övningskvalitet
  if (exerciseQuality === 'dålig') {
    return {
      action: 'maintain',
      volumeMultiplier: 1.0,
      intensityAdjustment: -1,
      recommendation: 'Fokusera på att förbättra tekniken innan belastningen ökas.',
      evidence: 'SAID-principen: Kvalitet före kvantitet för optimal adaptation.',
      nextEvaluation: '1 vecka'
    };
  }

  // Kontrollera tid i fas
  if (daysInCurrentPhase < 7) {
    return {
      action: 'maintain',
      volumeMultiplier: 1.0,
      intensityAdjustment: 0,
      recommendation: 'För tidigt att progrediera. Fortsätt med nuvarande nivå i minst en vecka.',
      evidence: 'Blanpied et al. 2017: Minst 1 veckas adaptation innan progression.',
      nextEvaluation: `${7 - daysInCurrentPhase} dagar kvar`
    };
  }

  // ALLA KRITERIER UPPFYLLDA - PROGREDIERA
  const volumeIncrease = calculateVolumeIncrease(
    perceivedEffort,
    exerciseQuality,
    completionRate
  );

  return {
    action: 'progress',
    volumeMultiplier: volumeIncrease,
    intensityAdjustment: perceivedEffort === 'lätt' ? 1 : 0,
    recommendation: `Bra framsteg! Öka träningsbelastningen med ${Math.round((volumeIncrease - 1) * 100)}%.`,
    evidence: 'Schoenfeld et al. 2017: 10-15% volymökning per vecka för optimal progression.',
    nextEvaluation: '1 vecka'
  };
}

/**
 * Beräkna lämplig volymökning
 */
function calculateVolumeIncrease(
  effort: 'lätt' | 'lagom' | 'svårt' | 'för_svårt',
  quality: 'dålig' | 'acceptabel' | 'god' | 'utmärkt',
  completionRate: number
): number {
  let baseIncrease = 1.10; // 10% baseline

  // Justera baserat på upplevd ansträngning
  if (effort === 'lätt') {
    baseIncrease = 1.15; // 15% om det känns lätt
  } else if (effort === 'svårt') {
    baseIncrease = 1.05; // Endast 5% om det redan är krävande
  }

  // Justera baserat på kvalitet
  if (quality === 'utmärkt') {
    baseIncrease += 0.02; // +2% bonus
  } else if (quality === 'acceptabel') {
    baseIncrease -= 0.02; // -2% försiktighet
  }

  // Justera baserat på följsamhet
  if (completionRate >= 90) {
    baseIncrease += 0.02; // +2% för utmärkt följsamhet
  }

  // Max 20% ökning per vecka
  return Math.min(baseIncrease, 1.20);
}

// ============================================
// VOLYM- OCH BELASTNINGSPROGRESSION
// ============================================

/**
 * Beräkna konkret volymsprogressionschange
 * Baserat på Schoenfeld et al. 2017: 10-15% volymökning/vecka
 */
export function calculateVolumeProgression(
  currentSets: number,
  currentReps: string,
  progressionWeek: number,
  decision: ProgressionDecision
): VolumeProgression {
  // Parsa reps (t.ex. "8-12" -> medelvärde 10)
  const repRange = parseRepRange(currentReps);
  const avgReps = (repRange.min + repRange.max) / 2;

  // Nuvarande volym = sets * reps
  const currentVolume = currentSets * avgReps;

  // Ny volym baserat på beslut
  const newVolume = Math.round(currentVolume * decision.volumeMultiplier);

  // Fördela ny volym
  let newSets = currentSets;
  let newReps = currentReps;
  let percentChange = (decision.volumeMultiplier - 1) * 100;

  if (decision.action === 'progress') {
    // Prioritera att öka reps först, sedan sets
    if (repRange.max < 15) {
      // Öka reps
      const newMax = Math.min(repRange.max + 2, 15);
      const newMin = Math.min(repRange.min + 2, newMax - 2);
      newReps = `${newMin}-${newMax}`;
    } else {
      // Öka sets
      newSets = Math.min(currentSets + 1, 5);
    }
  } else if (decision.action === 'regress') {
    // Minska reps först, sedan sets
    if (repRange.min > 6) {
      const newMin = Math.max(repRange.min - 2, 5);
      const newMax = Math.max(repRange.max - 2, newMin + 2);
      newReps = `${newMin}-${newMax}`;
    } else {
      newSets = Math.max(currentSets - 1, 2);
    }
  }

  return {
    currentSets,
    currentReps,
    newSets,
    newReps,
    percentChange: Math.round(percentChange),
    rationale: `Vecka ${progressionWeek}: ${decision.recommendation}`
  };
}

function parseRepRange(reps: string): { min: number; max: number } {
  const match = reps.match(/(\d+)-?(\d+)?/);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    return { min, max };
  }
  return { min: 10, max: 12 }; // Default
}

// ============================================
// FASÖVERGÅNGSLOGIK
// ============================================

/**
 * Utvärdera om patienten är redo för nästa fas
 */
export function evaluatePhaseTransition(
  currentPhase: 1 | 2 | 3,
  criteria: ProgressionCriteria,
  specificTests?: { name: string; passed: boolean }[]
): {
  readyForNextPhase: boolean;
  missingCriteria: string[];
  recommendations: string[];
} {
  if (currentPhase === 3) {
    return {
      readyForNextPhase: false,
      missingCriteria: [],
      recommendations: ['Du är redan i den sista fasen. Fokusera på underhållsträning.']
    };
  }

  const transitionCriteria = PHASE_TRANSITION_CRITERIA[currentPhase];
  const missingCriteria: string[] = [];
  const recommendations: string[] = [];

  // Kontrollera minsta tid i fas
  if (criteria.daysInCurrentPhase < transitionCriteria.minDaysInPhase) {
    const daysLeft = transitionCriteria.minDaysInPhase - criteria.daysInCurrentPhase;
    missingCriteria.push(`Minst ${daysLeft} dagar kvar i nuvarande fas`);
  }

  // Kontrollera smärtnivå
  if (criteria.painDuringExercise > transitionCriteria.maxPainLevel) {
    missingCriteria.push(`Smärtan under träning (${criteria.painDuringExercise}/10) överstiger gränsen (${transitionCriteria.maxPainLevel}/10)`);
    recommendations.push('Fortsätt arbeta med smärtfri träning');
  }

  // Kontrollera följsamhet
  if (criteria.completionRate < transitionCriteria.minCompletionRate) {
    missingCriteria.push(`Följsamhet (${criteria.completionRate}%) under minimum (${transitionCriteria.minCompletionRate}%)`);
    recommendations.push('Öka träningsfrekvensen för att nå progressionskraven');
  }

  // Kontrollera kvalitet
  const qualityOrder = ['dålig', 'acceptabel', 'god', 'utmärkt'];
  const currentQualityIndex = qualityOrder.indexOf(criteria.exerciseQuality);
  const requiredQualityIndex = qualityOrder.indexOf(transitionCriteria.requiredQuality);

  if (currentQualityIndex < requiredQualityIndex) {
    missingCriteria.push(`Övningskvalitet (${criteria.exerciseQuality}) behöver förbättras till ${transitionCriteria.requiredQuality}`);
    recommendations.push('Fokusera på teknik och kontroll');
  }

  // Kontrollera specifika tester om de finns
  if (specificTests) {
    const failedTests = specificTests.filter(t => !t.passed);
    if (failedTests.length > 0) {
      failedTests.forEach(t => {
        missingCriteria.push(`Ej godkänd på: ${t.name}`);
      });
    }
  }

  const readyForNextPhase = missingCriteria.length === 0;

  if (readyForNextPhase) {
    recommendations.push(`Grattis! Du är redo att gå vidare till Fas ${currentPhase + 1}.`);
  }

  return {
    readyForNextPhase,
    missingCriteria,
    recommendations
  };
}

// ============================================
// PROGRESSIONSHISTORIK OCH ANALYS
// ============================================

export interface ProgressionEntry {
  date: string;
  phase: number;
  decision: ProgressionDecision;
  criteria: ProgressionCriteria;
}

/**
 * Analysera progressionshistorik
 */
export function analyzeProgressionHistory(
  history: ProgressionEntry[]
): {
  trend: 'improving' | 'stable' | 'declining';
  averageProgressionRate: number;
  recommendations: string[];
  summary: string;
} {
  if (history.length < 2) {
    return {
      trend: 'stable',
      averageProgressionRate: 0,
      recommendations: ['Fortsätt samla data för att kunna analysera trend.'],
      summary: 'Otillräcklig data för trendanalys.'
    };
  }

  // Analysera smärttrend
  const painTrend = history.map(h => h.criteria.painDuringExercise);
  const painChange = painTrend[painTrend.length - 1] - painTrend[0];

  // Analysera volymförändringar
  const volumeChanges = history
    .filter(h => h.decision.action === 'progress')
    .map(h => h.decision.volumeMultiplier);

  const avgVolumeDelta = volumeChanges.length > 0
    ? volumeChanges.reduce((a, b) => a + b, 0) / volumeChanges.length
    : 1;

  // Bestäm trend
  let trend: 'improving' | 'stable' | 'declining';
  const recommendations: string[] = [];

  if (painChange <= -2 && avgVolumeDelta >= 1.05) {
    trend = 'improving';
    recommendations.push('Utmärkt framsteg! Fortsätt med nuvarande strategi.');
  } else if (painChange >= 2 || avgVolumeDelta < 0.95) {
    trend = 'declining';
    recommendations.push('Försämrad trend. Överväg att minska belastningen och fokusera på smärtfri träning.');
    recommendations.push('Kontakta din fysioterapeut för utvärdering.');
  } else {
    trend = 'stable';
    recommendations.push('Stabil progression. Överväg om det är dags att utmana dig lite mer.');
  }

  const progressionsCount = history.filter(h => h.decision.action === 'progress').length;
  const avgProgressionRate = (progressionsCount / history.length) * 100;

  return {
    trend,
    averageProgressionRate: Math.round(avgProgressionRate),
    recommendations,
    summary: `Under de senaste ${history.length} utvärderingarna har du progrederat ${progressionsCount} gånger (${Math.round(avgProgressionRate)}%). Smärtan har ${painChange <= 0 ? 'minskat' : 'ökat'} med ${Math.abs(painChange)} poäng.`
  };
}

// All exports are inline with their declarations above
