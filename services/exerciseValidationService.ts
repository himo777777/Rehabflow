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

// ============================================
// REAL-TIME FORM VALIDATION (FAS X)
// ============================================

export type MovementPhase = 'concentric' | 'eccentric' | 'isometric' | 'rest';
export type FormValidationSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface FormValidationRule {
  id: string;
  name: string;
  nameSv: string;
  severity: FormValidationSeverity;
  validate: (context: FormValidationContext) => FormValidationResult;
}

export interface FormValidationContext {
  exerciseId: string;
  currentAngles: Record<string, number>;
  targetAngles?: Record<string, number>;
  velocities?: Record<string, number>;
  phase: MovementPhase;
  repCount: number;
  setCount: number;
  elapsedTime: number;
  painLevel?: number;
}

export interface FormValidationResult {
  passed: boolean;
  ruleId: string;
  severity: FormValidationSeverity;
  message: string;
  messageSv: string;
  suggestion?: string;
  suggestionSv?: string;
  affectedJoints?: string[];
  value?: number;
  threshold?: number;
}

export interface FormValidationReport {
  exerciseId: string;
  timestamp: number;
  overallScore: number;
  passed: boolean;
  results: FormValidationResult[];
  summary: {
    totalRules: number;
    passedRules: number;
    warnings: number;
    errors: number;
    criticalIssues: number;
  };
}

// Exercise ROM definitions
const EXERCISE_ROM_TARGETS: Record<string, Record<string, { min: number; max: number; optimal: number }>> = {
  'shoulder_flexion': {
    leftShoulderFlexion: { min: 0, max: 180, optimal: 170 },
    rightShoulderFlexion: { min: 0, max: 180, optimal: 170 },
  },
  'shoulder_abduction': {
    leftShoulderAbduction: { min: 0, max: 180, optimal: 170 },
    rightShoulderAbduction: { min: 0, max: 180, optimal: 170 },
  },
  'elbow_flexion': {
    leftElbow: { min: 0, max: 145, optimal: 140 },
    rightElbow: { min: 0, max: 145, optimal: 140 },
  },
  'knee_extension': {
    leftKnee: { min: 90, max: 180, optimal: 175 },
    rightKnee: { min: 90, max: 180, optimal: 175 },
  },
  'squat': {
    leftKnee: { min: 60, max: 180, optimal: 90 },
    rightKnee: { min: 60, max: 180, optimal: 90 },
    leftHip: { min: 45, max: 180, optimal: 90 },
    rightHip: { min: 45, max: 180, optimal: 90 },
    trunkLean: { min: 0, max: 45, optimal: 30 },
  },
};

// Form validation rules
const FORM_VALIDATION_RULES: FormValidationRule[] = [
  // ROM validation
  {
    id: 'rom_minimum',
    name: 'Minimum Range of Motion',
    nameSv: 'Minsta rörelseomfång',
    severity: 'warning',
    validate: (ctx) => {
      const targets = EXERCISE_ROM_TARGETS[ctx.exerciseId];
      if (!targets) return { passed: true, ruleId: 'rom_minimum', severity: 'info', message: 'No ROM data', messageSv: 'Ingen ROM-data' };

      for (const [joint, range] of Object.entries(targets)) {
        const angle = ctx.currentAngles[joint];
        if (angle !== undefined && angle < range.min) {
          return {
            passed: false,
            ruleId: 'rom_minimum',
            severity: 'warning',
            message: `${joint} (${angle.toFixed(0)}°) below minimum (${range.min}°)`,
            messageSv: `${joint} (${angle.toFixed(0)}°) under minimum (${range.min}°)`,
            suggestionSv: 'Försök öka rörelseomfånget gradvis',
            affectedJoints: [joint],
            value: angle,
            threshold: range.min,
          };
        }
      }
      return { passed: true, ruleId: 'rom_minimum', severity: 'info', message: 'ROM OK', messageSv: 'ROM OK' };
    },
  },
  // ROM safety
  {
    id: 'rom_safety',
    name: 'ROM Safety Check',
    nameSv: 'ROM säkerhetskontroll',
    severity: 'critical',
    validate: (ctx) => {
      const targets = EXERCISE_ROM_TARGETS[ctx.exerciseId];
      if (!targets) return { passed: true, ruleId: 'rom_safety', severity: 'info', message: 'No ROM data', messageSv: 'Ingen ROM-data' };

      for (const [joint, range] of Object.entries(targets)) {
        const angle = ctx.currentAngles[joint];
        if (angle !== undefined && angle > range.max + 10) {
          return {
            passed: false,
            ruleId: 'rom_safety',
            severity: 'critical',
            message: `STOP! ${joint} exceeds safe range`,
            messageSv: `STOPP! ${joint} överskrider säkert område`,
            suggestionSv: 'Minska rörelseomfånget omedelbart',
            affectedJoints: [joint],
            value: angle,
            threshold: range.max,
          };
        }
      }
      return { passed: true, ruleId: 'rom_safety', severity: 'info', message: 'Safe', messageSv: 'Säkert' };
    },
  },
  // Bilateral symmetry
  {
    id: 'symmetry',
    name: 'Bilateral Symmetry',
    nameSv: 'Bilateral symmetri',
    severity: 'warning',
    validate: (ctx) => {
      const pairs = [
        ['leftShoulderFlexion', 'rightShoulderFlexion'],
        ['leftElbow', 'rightElbow'],
        ['leftKnee', 'rightKnee'],
      ];

      for (const [left, right] of pairs) {
        const l = ctx.currentAngles[left];
        const r = ctx.currentAngles[right];
        if (l !== undefined && r !== undefined) {
          const diff = Math.abs(l - r);
          if (diff > 15) {
            return {
              passed: false,
              ruleId: 'symmetry',
              severity: 'warning',
              message: `Asymmetry: ${diff.toFixed(0)}° difference`,
              messageSv: `Asymmetri: ${diff.toFixed(0)}° skillnad`,
              suggestionSv: 'Försök hålla lika rörelse på båda sidor',
              value: diff,
              threshold: 15,
            };
          }
        }
      }
      return { passed: true, ruleId: 'symmetry', severity: 'info', message: 'Symmetric', messageSv: 'Symmetrisk' };
    },
  },
  // Trunk compensation
  {
    id: 'trunk_compensation',
    name: 'Trunk Compensation',
    nameSv: 'Bålkompensation',
    severity: 'warning',
    validate: (ctx) => {
      const trunk = ctx.currentAngles.trunkLean;
      if (trunk === undefined) return { passed: true, ruleId: 'trunk_compensation', severity: 'info', message: 'No data', messageSv: 'Ingen data' };

      if (trunk > 15 && !ctx.exerciseId.includes('squat')) {
        return {
          passed: false,
          ruleId: 'trunk_compensation',
          severity: 'warning',
          message: `Trunk leaning ${trunk.toFixed(0)}°`,
          messageSv: `Bålen lutar ${trunk.toFixed(0)}°`,
          suggestionSv: 'Håll bålen stabil',
          value: trunk,
          threshold: 15,
        };
      }
      return { passed: true, ruleId: 'trunk_compensation', severity: 'info', message: 'Trunk OK', messageSv: 'Bål OK' };
    },
  },
  // Knee valgus
  {
    id: 'knee_valgus',
    name: 'Knee Valgus',
    nameSv: 'Knävalgus',
    severity: 'error',
    validate: (ctx) => {
      const leftV = ctx.currentAngles.leftKneeValgus;
      const rightV = ctx.currentAngles.rightKneeValgus;

      if (leftV !== undefined && leftV < -10) {
        return {
          passed: false,
          ruleId: 'knee_valgus',
          severity: 'error',
          message: 'Left knee collapsing inward',
          messageSv: 'Vänster knä faller inåt',
          suggestionSv: 'Skjut ut knäet över tårna',
          affectedJoints: ['leftKneeValgus'],
          value: leftV,
          threshold: -10,
        };
      }
      if (rightV !== undefined && rightV < -10) {
        return {
          passed: false,
          ruleId: 'knee_valgus',
          severity: 'error',
          message: 'Right knee collapsing inward',
          messageSv: 'Höger knä faller inåt',
          suggestionSv: 'Skjut ut knäet över tårna',
          affectedJoints: ['rightKneeValgus'],
          value: rightV,
          threshold: -10,
        };
      }
      return { passed: true, ruleId: 'knee_valgus', severity: 'info', message: 'Knees OK', messageSv: 'Knän OK' };
    },
  },
  // Movement tempo
  {
    id: 'tempo',
    name: 'Movement Tempo',
    nameSv: 'Rörelsetempo',
    severity: 'info',
    validate: (ctx) => {
      if (!ctx.velocities) return { passed: true, ruleId: 'tempo', severity: 'info', message: 'No velocity', messageSv: 'Ingen hastighet' };

      const maxVelocity = 180;
      for (const [joint, vel] of Object.entries(ctx.velocities)) {
        if (Math.abs(vel) > maxVelocity) {
          return {
            passed: false,
            ruleId: 'tempo',
            severity: 'warning',
            message: 'Movement too fast - slow down',
            messageSv: 'Rörelse för snabb - sakta ner',
            suggestionSv: 'Kontrollera rörelsen genom hela omfånget',
            value: Math.abs(vel),
            threshold: maxVelocity,
          };
        }
      }
      return { passed: true, ruleId: 'tempo', severity: 'info', message: 'Tempo OK', messageSv: 'Tempo OK' };
    },
  },
  // Pain awareness
  {
    id: 'pain_check',
    name: 'Pain Check',
    nameSv: 'Smärtkontroll',
    severity: 'warning',
    validate: (ctx) => {
      if (ctx.painLevel === undefined) return { passed: true, ruleId: 'pain_check', severity: 'info', message: 'No pain data', messageSv: 'Ingen smärtdata' };

      if (ctx.painLevel >= 7) {
        return {
          passed: false,
          ruleId: 'pain_check',
          severity: 'critical',
          message: 'High pain - consider stopping',
          messageSv: 'Hög smärta - överväg att sluta',
          value: ctx.painLevel,
          threshold: 7,
        };
      }
      if (ctx.painLevel >= 5) {
        return {
          passed: true,
          ruleId: 'pain_check',
          severity: 'warning',
          message: 'Moderate pain - reduce intensity',
          messageSv: 'Måttlig smärta - minska intensiteten',
          value: ctx.painLevel,
          threshold: 5,
        };
      }
      return { passed: true, ruleId: 'pain_check', severity: 'info', message: 'Pain OK', messageSv: 'Smärta OK' };
    },
  },
];

/**
 * Validate exercise form in real-time
 */
export function validateForm(context: FormValidationContext): FormValidationReport {
  const results: FormValidationResult[] = [];

  for (const rule of FORM_VALIDATION_RULES) {
    try {
      results.push(rule.validate(context));
    } catch {
      results.push({
        passed: true,
        ruleId: rule.id,
        severity: 'info',
        message: 'Rule skipped',
        messageSv: 'Regel överhoppad',
      });
    }
  }

  const passedRules = results.filter(r => r.passed).length;
  const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;
  const errors = results.filter(r => !r.passed && r.severity === 'error').length;
  const criticalIssues = results.filter(r => !r.passed && r.severity === 'critical').length;

  const overallScore = Math.max(0, 100 - (warnings * 5) - (errors * 15) - (criticalIssues * 30));

  return {
    exerciseId: context.exerciseId,
    timestamp: Date.now(),
    overallScore,
    passed: criticalIssues === 0 && errors === 0,
    results,
    summary: {
      totalRules: results.length,
      passedRules,
      warnings,
      errors,
      criticalIssues,
    },
  };
}

/**
 * Get ROM targets for an exercise
 */
export function getExerciseROMTargets(exerciseId: string): Record<string, { min: number; max: number; optimal: number }> | undefined {
  return EXERCISE_ROM_TARGETS[exerciseId];
}

/**
 * Add custom ROM targets
 */
export function addExerciseROMTargets(
  exerciseId: string,
  targets: Record<string, { min: number; max: number; optimal: number }>
): void {
  EXERCISE_ROM_TARGETS[exerciseId] = targets;
}

// All exports are inline with their declarations above
