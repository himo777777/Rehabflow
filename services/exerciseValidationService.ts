/**
 * EXERCISE VALIDATION SERVICE
 *
 * Validerar övningar mot vetenskaplig evidens och säkerhetsprotokoll.
 *
 * Funktioner:
 * - Matcha övningar mot scientificSources
 * - Validera mot postoperativa protokoll
 * - Kontrollera kontraindikationer
 * - Tilldela evidensnivå
 *
 * Detta säkerställer att alla rekommenderade övningar är:
 * 1. Baserade på vetenskaplig evidens
 * 2. Säkra för patientens tillstånd
 * 3. Lämpliga för rehabiliteringsfasen
 */

import { Exercise, BodyArea, ExerciseType, ExtendedExercise } from '../types';
import {
  SCIENTIFIC_SOURCES,
  getSourcesByBodyArea,
  searchSources
} from '../data/sources/scientificSources';
import {
  getProtocol,
  getCurrentPhase,
  isExerciseSafe
} from '../data/protocols/postOpProtocols';

// ============================================
// INTERFACES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  evidenceLevel: 'A' | 'B' | 'C' | 'D' | 'expert' | 'none';
  matchingSources: SourceMatch[];
  warnings: string[];
  contraindications: string[];
  recommendation: string;
}

export interface SourceMatch {
  sourceId: string;
  title: string;
  authors: string;
  year: number;
  evidenceLevel: string;
  relevanceScore: number;  // 0-100
}

export interface ExerciseValidationContext {
  bodyArea: string;
  phase?: 1 | 2 | 3;
  isPostOp?: boolean;
  procedure?: string;
  daysSinceSurgery?: number;
  painLevel?: number;
  contraindications?: string[];
}

// ============================================
// EVIDENSMATCHNING
// ============================================

/**
 * Hitta vetenskapliga källor som stödjer en övning
 */
export function findEvidenceForExercise(
  exercise: Exercise | ExtendedExercise,
  bodyArea: string
): SourceMatch[] {
  const matches: SourceMatch[] = [];

  // Normalisera söktermen
  const searchTerms = [
    exercise.name.toLowerCase(),
    ...(exercise.description?.toLowerCase().split(' ') || []),
    ...((exercise as ExtendedExercise).keywords || [])
  ];

  // Sök i sources baserat på kroppsområde först
  const areaRelevantSources = getSourcesByBodyArea(bodyArea as BodyArea);

  for (const source of areaRelevantSources) {
    let relevanceScore = 0;

    // Matcha mot källans nyckelord
    const sourceKeywords = source.keywords || [];
    for (const term of searchTerms) {
      if (sourceKeywords.some(kw => kw.toLowerCase().includes(term) || term.includes(kw.toLowerCase()))) {
        relevanceScore += 20;
      }
    }

    // Bonus för övningstyp-matchning
    const exerciseType = (exercise as ExtendedExercise).exerciseType;
    if (exerciseType && source.exerciseTypes?.includes(exerciseType as ExerciseType)) {
      relevanceScore += 30;
    }

    // Bonus för evidensnivå
    if (source.evidenceLevel === 'A') relevanceScore += 20;
    else if (source.evidenceLevel === 'B') relevanceScore += 10;

    // Endast inkludera om relevant
    if (relevanceScore > 0) {
      matches.push({
        sourceId: source.id,
        title: source.title,
        authors: source.authors?.join(', ') || 'Okänd',
        year: source.year || 0,
        evidenceLevel: source.evidenceLevel,
        relevanceScore: Math.min(relevanceScore, 100)
      });
    }
  }

  // Sortera efter relevans
  return matches.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
}

/**
 * Bestäm övningens evidensnivå baserat på matchande källor
 */
export function determineEvidenceLevel(
  matches: SourceMatch[]
): 'A' | 'B' | 'C' | 'D' | 'expert' | 'none' {
  if (matches.length === 0) return 'none';

  // Högsta evidensnivån bland matchande källor
  const levels = matches.map(m => m.evidenceLevel);

  if (levels.includes('A')) return 'A';
  if (levels.includes('B')) return 'B';
  if (levels.includes('C')) return 'C';
  if (levels.includes('D')) return 'D';
  if (levels.includes('expert')) return 'expert';

  return 'none';
}

// ============================================
// SÄKERHETSVALIDERING
// ============================================

/**
 * Validera övning mot postoperativa protokoll
 */
export function validateAgainstPostOpProtocol(
  exercise: Exercise | ExtendedExercise,
  procedure: string,
  daysSinceSurgery: number
): {
  safe: boolean;
  warnings: string[];
  reason?: string;
} {
  const result = isExerciseSafe(
    exercise.name,
    (exercise as ExtendedExercise).keywords || [],
    procedure,
    daysSinceSurgery
  );

  const warnings: string[] = [];

  if (!result.safe) {
    return {
      safe: false,
      warnings: [result.reason || 'Ej godkänd för denna postoperativa fas'],
      reason: result.reason
    };
  }

  // Lägg till varningar baserat på fas
  const currentPhase = getCurrentPhase(procedure, daysSinceSurgery);
  if (currentPhase) {
    if (currentPhase.phase === 1) {
      warnings.push('Tidig fas - var extra försiktig med belastning');
    }
    if ((exercise as ExtendedExercise).exerciseType === 'plyometri' && currentPhase.phase < 3) {
      return {
        safe: false,
        warnings: ['Plyometriska övningar rekommenderas först i fas 3'],
        reason: 'För avancerad övningstyp för nuvarande fas'
      };
    }
  }

  return { safe: true, warnings };
}

/**
 * Kontrollera övning mot kontraindikationer
 */
export function checkContraindications(
  exercise: Exercise | ExtendedExercise,
  patientContraindications: string[]
): string[] {
  const foundContraindications: string[] = [];
  const exerciseContra = (exercise as ExtendedExercise).contraindications || [];

  for (const patientContra of patientContraindications) {
    const normalizedPatient = patientContra.toLowerCase();

    for (const exContra of exerciseContra) {
      if (exContra.toLowerCase().includes(normalizedPatient) ||
          normalizedPatient.includes(exContra.toLowerCase())) {
        foundContraindications.push(`${exercise.name}: ${exContra}`);
      }
    }

    // Kolla också mot övningsnamn och nyckelord
    if (exercise.name.toLowerCase().includes(normalizedPatient)) {
      foundContraindications.push(`${exercise.name}: Matchar patientens kontraindikation "${patientContra}"`);
    }
  }

  return foundContraindications;
}

// ============================================
// HUVUDVALIDERING
// ============================================

/**
 * Komplett validering av en övning
 */
export function validateExercise(
  exercise: Exercise | ExtendedExercise,
  context: ExerciseValidationContext
): ValidationResult {
  const warnings: string[] = [];
  const contraindications: string[] = [];
  let isValid = true;

  // 1. Hitta evidens
  const evidenceMatches = findEvidenceForExercise(exercise, context.bodyArea);
  const evidenceLevel = determineEvidenceLevel(evidenceMatches);

  if (evidenceLevel === 'none') {
    warnings.push('Ingen vetenskaplig evidens hittades för denna övning');
  }

  // 2. Postoperativ validering
  if (context.isPostOp && context.procedure && context.daysSinceSurgery !== undefined) {
    const postOpResult = validateAgainstPostOpProtocol(
      exercise,
      context.procedure,
      context.daysSinceSurgery
    );

    if (!postOpResult.safe) {
      isValid = false;
      warnings.push(...postOpResult.warnings);
    } else {
      warnings.push(...postOpResult.warnings);
    }
  }

  // 3. Kontraindikationskontroll
  if (context.contraindications && context.contraindications.length > 0) {
    const foundContra = checkContraindications(exercise, context.contraindications);
    if (foundContra.length > 0) {
      isValid = false;
      contraindications.push(...foundContra);
    }
  }

  // 4. Fasvalidering
  if (context.phase) {
    const exerciseDifficulty = (exercise as ExtendedExercise).difficulty || exercise.difficulty;

    if (context.phase === 1 && exerciseDifficulty === 'Svår') {
      warnings.push('Svår övning rekommenderas inte i fas 1');
    }

    const exerciseType = (exercise as ExtendedExercise).exerciseType;
    if (context.phase === 1 && exerciseType === 'plyometri') {
      isValid = false;
      warnings.push('Plyometriska övningar är kontraindicerade i fas 1');
    }
  }

  // 5. Smärtnivåvalidering
  if (context.painLevel !== undefined && context.painLevel >= 7) {
    const exerciseDifficulty = (exercise as ExtendedExercise).difficulty || exercise.difficulty;
    if (exerciseDifficulty === 'Svår' || exerciseDifficulty === 'Medel') {
      warnings.push('Hög smärtnivå - överväg lättare variant');
    }
  }

  // Generera rekommendation
  let recommendation: string;
  if (isValid) {
    if (warnings.length === 0) {
      recommendation = `Godkänd övning. Evidensnivå: ${evidenceLevel}`;
    } else {
      recommendation = `Godkänd med varningar. ${warnings.length} saker att beakta.`;
    }
  } else {
    recommendation = `EJ GODKÄND: ${warnings[0] || contraindications[0]}`;
  }

  return {
    isValid,
    evidenceLevel,
    matchingSources: evidenceMatches,
    warnings,
    contraindications,
    recommendation
  };
}

/**
 * Validera en lista med övningar
 */
export function validateExerciseList(
  exercises: (Exercise | ExtendedExercise)[],
  context: ExerciseValidationContext
): {
  valid: (Exercise | ExtendedExercise)[];
  invalid: { exercise: Exercise | ExtendedExercise; result: ValidationResult }[];
  summary: {
    totalExercises: number;
    validCount: number;
    invalidCount: number;
    averageEvidenceLevel: string;
    commonWarnings: string[];
  };
} {
  const valid: (Exercise | ExtendedExercise)[] = [];
  const invalid: { exercise: Exercise | ExtendedExercise; result: ValidationResult }[] = [];
  const allWarnings: string[] = [];
  const evidenceLevels: string[] = [];

  for (const exercise of exercises) {
    const result = validateExercise(exercise, context);

    if (result.isValid) {
      valid.push(exercise);
    } else {
      invalid.push({ exercise, result });
    }

    evidenceLevels.push(result.evidenceLevel);
    allWarnings.push(...result.warnings);
  }

  // Hitta vanligaste varningar
  const warningCounts = allWarnings.reduce((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commonWarnings = Object.entries(warningCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([warning]) => warning);

  // Beräkna genomsnittlig evidensnivå
  const levelOrder = ['A', 'B', 'C', 'D', 'expert', 'none'];
  const avgIndex = evidenceLevels.reduce((sum, l) => sum + levelOrder.indexOf(l), 0) / evidenceLevels.length;
  const averageEvidenceLevel = levelOrder[Math.round(avgIndex)] || 'none';

  return {
    valid,
    invalid,
    summary: {
      totalExercises: exercises.length,
      validCount: valid.length,
      invalidCount: invalid.length,
      averageEvidenceLevel,
      commonWarnings
    }
  };
}

// ============================================
// HJÄLPFUNKTIONER
// ============================================

/**
 * Formatera validationsresultat som läsbar text
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`Status: ${result.isValid ? 'GODKÄND' : 'EJ GODKÄND'}`);
  lines.push(`Evidensnivå: ${result.evidenceLevel}`);

  if (result.matchingSources.length > 0) {
    lines.push('\nStödjande evidens:');
    result.matchingSources.slice(0, 3).forEach(s => {
      lines.push(`  - ${s.authors} (${s.year}): ${s.title} [${s.evidenceLevel}]`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\nVarningar:');
    result.warnings.forEach(w => lines.push(`  ⚠️ ${w}`));
  }

  if (result.contraindications.length > 0) {
    lines.push('\nKontraindikationer:');
    result.contraindications.forEach(c => lines.push(`  ❌ ${c}`));
  }

  lines.push(`\n${result.recommendation}`);

  return lines.join('\n');
}

/**
 * Generera validationssummering för AI-prompt
 */
export function generateValidationPrompt(
  exercises: string[],
  context: ExerciseValidationContext
): string {
  return `
ÖVNINGSVALIDERING:
Kroppsområde: ${context.bodyArea}
Fas: ${context.phase || 'Ej specificerad'}
${context.isPostOp ? `Postoperativ: ${context.procedure}, dag ${context.daysSinceSurgery}` : ''}
${context.painLevel ? `Smärtnivå: ${context.painLevel}/10` : ''}

ÖVNINGAR ATT VALIDERA:
${exercises.map((e, i) => `${i + 1}. ${e}`).join('\n')}

INSTRUKTION:
Kontrollera varje övning mot evidens och säkerhetsprotokoll.
Markera övningar som EJ GODKÄNDA om de bryter mot postoperativa restriktioner eller kontraindikationer.
`.trim();
}

// All exports are inline with their declarations above
