/**
 * ÖVNINGSFILTER FÖR SÄKER REHABILITERING
 *
 * Denna service filtrerar övningar baserat på:
 * - Postoperativa protokoll och restriktioner
 * - Viktbäringsrestriktioner
 * - Smärtnivåer
 * - Kontraindikationer
 *
 * KRITISK SÄKERHETSFUNKTION:
 * Förhindrar att farliga övningar föreslås till postoperativa patienter.
 */

import {
  ExtendedExercise,
  SurgicalDetails,
  BodyArea,
  ExerciseType,
  Equipment
} from '../types';
import {
  getProtocol,
  getCurrentPhase,
  isExerciseSafe,
  PostOpProtocol,
  PhaseRestriction
} from '../data/protocols/postOpProtocols';

// ============================================
// INTERFACES
// ============================================

export interface FilterCriteria {
  // Postoperativ information
  surgicalDetails?: SurgicalDetails;
  surgeryDate?: string;
  daysSinceSurgery?: number;

  // Patientbegränsningar
  painLevel?: number;
  activityPainLevel?: number;
  weightBearing?: 'Fullt' | 'Partiell' | 'Avlastad';

  // Övningsfilter
  bodyAreas?: BodyArea[];
  exerciseTypes?: ExerciseType[];
  maxDifficulty?: 'Lätt' | 'Medel' | 'Svår';
  equipment?: Equipment[];
  excludeEquipment?: Equipment[];

  // Explicita kontraindikationer
  contraindications?: string[];
}

export interface FilterResult {
  exercise: ExtendedExercise;
  safe: boolean;
  warnings: string[];
  modifications?: string[];
  reason?: string;
}

export interface FilterSummary {
  totalExercises: number;
  safeExercises: number;
  filteredOut: number;
  warnings: string[];
  protocol?: string;
  currentPhase?: number;
}

// ============================================
// HUVUDFILTRERING
// ============================================

/**
 * Filtrera övningar baserat på säkerhetskriterier
 * KRITISK FUNKTION för postoperativ säkerhet
 */
export function filterSafeExercises(
  exercises: ExtendedExercise[],
  criteria: FilterCriteria
): { safe: ExtendedExercise[]; filtered: FilterResult[]; summary: FilterSummary } {
  const results: FilterResult[] = [];
  const safeExercises: ExtendedExercise[] = [];
  const warnings: string[] = [];

  // Hämta protokoll om postoperativ
  let protocol: PostOpProtocol | null = null;
  let currentPhase: { phase: 1 | 2 | 3 | 4; phaseData: PhaseRestriction } | null = null;

  if (criteria.surgicalDetails?.procedure && criteria.daysSinceSurgery !== undefined) {
    protocol = getProtocol(criteria.surgicalDetails.procedure);
    if (protocol) {
      currentPhase = getCurrentPhase(criteria.surgicalDetails.procedure, criteria.daysSinceSurgery);
      warnings.push(`Använder protokoll: ${protocol.name}, Fas ${currentPhase?.phase}`);
    }
  }

  for (const exercise of exercises) {
    const result = evaluateExerciseSafety(exercise, criteria, protocol, currentPhase);
    results.push(result);

    if (result.safe) {
      safeExercises.push(exercise);
    }
  }

  return {
    safe: safeExercises,
    filtered: results,
    summary: {
      totalExercises: exercises.length,
      safeExercises: safeExercises.length,
      filteredOut: exercises.length - safeExercises.length,
      warnings,
      protocol: protocol?.name,
      currentPhase: currentPhase?.phase
    }
  };
}

/**
 * Evaluera en enskild övnings säkerhet
 */
function evaluateExerciseSafety(
  exercise: ExtendedExercise,
  criteria: FilterCriteria,
  protocol: PostOpProtocol | null,
  currentPhase: { phase: 1 | 2 | 3 | 4; phaseData: PhaseRestriction } | null
): FilterResult {
  const warnings: string[] = [];
  const modifications: string[] = [];
  let safe = true;
  let reason: string | undefined;

  // 1. KRITISK: Postoperativa kontraindikationer
  if (protocol && criteria.daysSinceSurgery !== undefined) {
    const safetyCheck = isExerciseSafe(
      exercise.name,
      exercise.keywords || [],
      criteria.surgicalDetails!.procedure,
      criteria.daysSinceSurgery
    );

    if (!safetyCheck.safe) {
      safe = false;
      reason = safetyCheck.reason;
      return { exercise, safe, warnings: [reason || 'Kontraindicerad'], reason };
    }

    // Kolla mot exkluderade nyckelord
    if (protocol.excludeKeywords.some(kw =>
      exercise.name.toLowerCase().includes(kw) ||
      exercise.keywords?.some(k => k.toLowerCase().includes(kw))
    )) {
      safe = false;
      reason = `Innehåller förbjudet nyckelord för ${protocol.name}`;
      return { exercise, safe, warnings: [reason], reason };
    }

    // Kolla övningstyp mot fas-restriktioner
    const phaseKey = `phase${currentPhase?.phase}` as keyof typeof protocol.forbiddenExerciseTypes;
    const forbiddenTypes = protocol.forbiddenExerciseTypes[phaseKey];
    if (forbiddenTypes?.includes(exercise.exerciseType)) {
      safe = false;
      reason = `Övningstyp "${exercise.exerciseType}" är förbjuden i fas ${currentPhase?.phase}`;
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  // 2. KRITISK: Viktbäringsrestriktioner
  if (criteria.weightBearing === 'Avlastad') {
    // Kontrollera om övningen kräver stående/belastning
    const requiresStanding = [
      'squat', 'lunge', 'step', 'stående', 'gång', 'hopp', 'balans'
    ].some(kw =>
      exercise.name.toLowerCase().includes(kw) ||
      exercise.keywords?.some(k => k.toLowerCase().includes(kw))
    );

    if (requiresStanding && !exercise.equipment?.includes('stol')) {
      safe = false;
      reason = 'Kräver belastning - patienten har avlastad viktbäring';
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  // 3. Smärtnivåbaserad filtrering
  if (criteria.painLevel !== undefined && criteria.painLevel > 7) {
    // Vid hög smärta, undvik svåra övningar
    if (exercise.difficulty === 'Svår') {
      warnings.push('Hög smärtnivå - överväg lättare variant');
      modifications.push('Minska intensiteten');
    }

    // Undvik plyometri och explosiva övningar
    if (exercise.exerciseType === 'plyometri') {
      safe = false;
      reason = 'Plyometriska övningar bör undvikas vid hög smärtnivå';
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  // 4. Svårighetsfilter
  if (criteria.maxDifficulty) {
    const difficultyOrder = { 'Lätt': 1, 'Medel': 2, 'Svår': 3 };
    if (difficultyOrder[exercise.difficulty] > difficultyOrder[criteria.maxDifficulty]) {
      safe = false;
      reason = `Övning för svår (${exercise.difficulty}) - max ${criteria.maxDifficulty}`;
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  // 5. Kroppsområdesfilter
  if (criteria.bodyAreas && criteria.bodyAreas.length > 0) {
    if (!criteria.bodyAreas.includes(exercise.bodyArea)) {
      safe = false;
      reason = `Fel kroppsområde (${exercise.bodyArea})`;
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  // 6. Utrustningsfilter
  if (criteria.excludeEquipment && criteria.excludeEquipment.length > 0) {
    if (exercise.equipment?.some(eq => criteria.excludeEquipment!.includes(eq))) {
      safe = false;
      reason = `Kräver utrustning som ej är tillgänglig`;
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  // 7. Explicita kontraindikationer
  if (criteria.contraindications && criteria.contraindications.length > 0) {
    const matchedContra = criteria.contraindications.find(contra =>
      exercise.contraindications?.some(exContra =>
        exContra.toLowerCase().includes(contra.toLowerCase())
      )
    );

    if (matchedContra) {
      safe = false;
      reason = `Kontraindicerad: ${matchedContra}`;
      return { exercise, safe, warnings: [reason], reason };
    }
  }

  return { exercise, safe, warnings, modifications };
}

// ============================================
// SPECIALISERADE FILTER
// ============================================

/**
 * Filtrera för tidiga postoperativa patienter (0-14 dagar)
 */
export function filterForEarlyPostOp(
  exercises: ExtendedExercise[],
  procedure: string
): ExtendedExercise[] {
  const protocol = getProtocol(procedure);
  if (!protocol) return exercises;

  return exercises.filter(ex => {
    // Endast tillåt övningar som explicit nämns som tillåtna i fas 1
    const phase1Allowed = protocol.phases[1].allowedMovements;

    // Kolla om övningen matchar tillåtna rörelser
    return phase1Allowed.some(allowed =>
      ex.name.toLowerCase().includes(allowed.replace(/_/g, ' ')) ||
      ex.keywords?.some(k => k.includes(allowed))
    );
  });
}

/**
 * Filtrera för seniorer/äldre patienter
 */
export function filterForSeniors(
  exercises: ExtendedExercise[]
): ExtendedExercise[] {
  return exercises.filter(ex =>
    ex.category === 'senior' ||
    ex.difficulty === 'Lätt' ||
    (ex.difficulty === 'Medel' && !ex.exerciseType.includes('plyometri'))
  );
}

/**
 * Filtrera baserat på tillgänglig utrustning
 */
export function filterByEquipment(
  exercises: ExtendedExercise[],
  availableEquipment: Equipment[]
): ExtendedExercise[] {
  return exercises.filter(ex => {
    // Om övningen inte kräver utrustning, tillåt alltid
    if (!ex.equipment || ex.equipment.length === 0 || ex.equipment.includes('ingen')) {
      return true;
    }

    // Kontrollera att all krävd utrustning finns
    return ex.equipment.every(eq => availableEquipment.includes(eq));
  });
}

/**
 * Hämta säkra progressioner för en övning
 */
export function getSafeProgressions(
  exercise: ExtendedExercise,
  allExercises: ExtendedExercise[],
  criteria: FilterCriteria
): ExtendedExercise[] {
  if (!exercise.progressions || exercise.progressions.length === 0) {
    return [];
  }

  const progressions = allExercises.filter(ex =>
    exercise.progressions.includes(ex.id)
  );

  const { safe } = filterSafeExercises(progressions, criteria);
  return safe;
}

/**
 * Hämta säkra regressioner för en övning
 */
export function getSafeRegressions(
  exercise: ExtendedExercise,
  allExercises: ExtendedExercise[],
  criteria: FilterCriteria
): ExtendedExercise[] {
  if (!exercise.regressions || exercise.regressions.length === 0) {
    return [];
  }

  const regressions = allExercises.filter(ex =>
    exercise.regressions.includes(ex.id)
  );

  const { safe } = filterSafeExercises(regressions, criteria);
  return safe;
}

// ============================================
// POSTOPERATIVA ÖVNINGSREKOMMENDATIONER
// ============================================

/**
 * Hämta rekommenderade övningar för specifik postoperativ fas
 */
export function getPostOpPhaseExercises(
  exercises: ExtendedExercise[],
  procedure: string,
  daysSinceSurgery: number,
  weightBearing: 'Fullt' | 'Partiell' | 'Avlastad'
): {
  recommended: ExtendedExercise[];
  warnings: string[];
  phase: number;
  phaseGoals: string[];
} {
  const protocol = getProtocol(procedure);
  if (!protocol) {
    return {
      recommended: [],
      warnings: [`Inget protokoll hittades för: ${procedure}`],
      phase: 1,
      phaseGoals: []
    };
  }

  const currentPhase = getCurrentPhase(procedure, daysSinceSurgery);
  if (!currentPhase) {
    return {
      recommended: [],
      warnings: ['Kunde inte bestämma fas'],
      phase: 1,
      phaseGoals: []
    };
  }

  const criteria: FilterCriteria = {
    surgicalDetails: { procedure, date: '', surgeonRestrictions: '', weightBearing, riskFactors: [] },
    daysSinceSurgery,
    weightBearing,
    bodyAreas: [protocol.bodyArea]
  };

  const { safe, summary } = filterSafeExercises(exercises, criteria);

  return {
    recommended: safe,
    warnings: summary.warnings,
    phase: currentPhase.phase,
    phaseGoals: currentPhase.phaseData.goals
  };
}

// ============================================
// VALIDERING
// ============================================

/**
 * Validera ett helt träningsprogram mot postoperativa restriktioner
 */
export function validateProgramSafety(
  programExercises: string[],
  allExercises: ExtendedExercise[],
  criteria: FilterCriteria
): {
  valid: boolean;
  unsafeExercises: { name: string; reason: string }[];
  warnings: string[];
} {
  const unsafeExercises: { name: string; reason: string }[] = [];
  const warnings: string[] = [];

  for (const exerciseName of programExercises) {
    const exercise = allExercises.find(ex =>
      ex.name.toLowerCase() === exerciseName.toLowerCase()
    );

    if (!exercise) {
      warnings.push(`Övning "${exerciseName}" finns inte i databasen`);
      continue;
    }

    const { safe, filtered } = filterSafeExercises([exercise], criteria);

    if (safe.length === 0 && filtered.length > 0) {
      unsafeExercises.push({
        name: exerciseName,
        reason: filtered[0].reason || 'Okänd anledning'
      });
    }
  }

  return {
    valid: unsafeExercises.length === 0,
    unsafeExercises,
    warnings
  };
}

/**
 * Generera varning om ett program innehåller osäkra övningar
 */
export function generateSafetyWarning(
  unsafeExercises: { name: string; reason: string }[]
): string {
  if (unsafeExercises.length === 0) {
    return '';
  }

  const exerciseList = unsafeExercises
    .map(ex => `• ${ex.name}: ${ex.reason}`)
    .join('\n');

  return `
⚠️ SÄKERHETSVARNING ⚠️

Följande övningar bör INTE utföras baserat på dina restriktioner:

${exerciseList}

Kontakta din fysioterapeut innan du utför dessa övningar.
`.trim();
}
