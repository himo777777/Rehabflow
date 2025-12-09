/**
 * Safety Service - Protocol Safety Filter
 *
 * Filtrerar och varnar för övningar baserat på:
 * - Postoperativt protokoll
 * - Rehabiliteringsfas
 * - Kontraindikationer
 * - Smärtnivå
 *
 * OBS: Använder centraliserade protokoll från postOpProtocols.ts
 */

import { Exercise } from '../types';
import {
  getProtocol,
  getCurrentPhase,
  isExerciseSafe as isExerciseSafeFromProtocol,
  POST_OP_PROTOCOLS
} from '../data/protocols/postOpProtocols';

export interface SafetyContext {
  phase: 1 | 2 | 3;
  isPostOp?: boolean;
  daysSinceSurgery?: number;
  surgeryType?: string;
  painLevel?: number;
  injuryType?: string;
}

export interface SafetyResult {
  safe: boolean;
  warningLevel: 'none' | 'caution' | 'warning' | 'contraindicated';
  message?: string;
  reason?: string;
  recommendation?: string;
}

// Övningar med specifika restriktioner per fas
const PHASE_RESTRICTIONS: Record<string, {
  allowedFromPhase: number;
  warning?: string;
  category?: string[];
}> = {
  // Plyometri och hoppövningar - inte före fas 3
  'Hoppträning': { allowedFromPhase: 3, warning: 'Plyometri rekommenderas först i fas 3' },
  'Box jump': { allowedFromPhase: 3, warning: 'Hoppövningar kräver full styrka' },
  'Squat jump': { allowedFromPhase: 3, warning: 'Belastningshopp först i funktionsfasen' },
  'Burpees': { allowedFromPhase: 3, warning: 'Högintensiva övningar först i fas 3' },

  // Tung styrketräning - inte före fas 2
  'Marklyft': { allowedFromPhase: 2, warning: 'Tung belastning kräver god smärtkontroll' },
  'Knäböj med vikt': { allowedFromPhase: 2, warning: 'Belastad knäböj först efter skyddsfasen' },
  'Bänkpress': { allowedFromPhase: 2, warning: 'Tyngre övningar i läkningsfasen' },

  // Djupa böjningar och rotation
  'Djup knäböj': { allowedFromPhase: 2, warning: 'Full ROM kräver läkt vävnad' },
  'Rotationsövningar': { allowedFromPhase: 2, warning: 'Rotationsbelastning efter skyddsfasen' },
};

// Generella säkerhetsregler baserat på smärtnivå
const PAIN_BASED_RESTRICTIONS: {
  threshold: number;
  restrictCategories: string[];
  warning: string;
}[] = [
  {
    threshold: 7,
    restrictCategories: ['Styrka', 'Plyometri', 'Kardio'],
    warning: 'Hög smärta (>7): Vila eller endast mycket lätta rörelser'
  },
  {
    threshold: 5,
    restrictCategories: ['Plyometri', 'Tung styrka'],
    warning: 'Moderat smärta (5-7): Undvik intensiv träning'
  }
];

/**
 * Evaluerar om en övning är säker för given kontext
 * Använder centraliserade protokoll från postOpProtocols.ts för post-op patienter
 */
export function evaluateExerciseSafety(
  exercise: Exercise,
  context: SafetyContext
): SafetyResult {
  const { phase, isPostOp, daysSinceSurgery, surgeryType, painLevel } = context;

  // 1. Kontrollera postoperativa restriktioner via centraliserade protokoll
  if (isPostOp && surgeryType && daysSinceSurgery !== undefined) {
    const safetyCheck = isExerciseSafeFromProtocol(
      exercise.name,
      [exercise.name.toLowerCase(), exercise.category?.toLowerCase() || ''],
      surgeryType,
      daysSinceSurgery
    );

    if (!safetyCheck.safe) {
      return {
        safe: false,
        warningLevel: 'contraindicated',
        message: `Kontraindicerad dag ${daysSinceSurgery} efter ${surgeryType}`,
        reason: safetyCheck.reason,
        recommendation: 'Följ postoperativt protokoll. Rådfråga din fysioterapeut.'
      };
    }
  }

  // 2. Kontrollera fasrestriktioner
  const phaseRestriction = PHASE_RESTRICTIONS[exercise.name];
  if (phaseRestriction && phase < phaseRestriction.allowedFromPhase) {
    return {
      safe: false,
      warningLevel: 'warning',
      message: `Rekommenderas först i fas ${phaseRestriction.allowedFromPhase}`,
      reason: phaseRestriction.warning,
      recommendation: `Vänta tills du når fas ${phaseRestriction.allowedFromPhase} innan du börjar med denna övning.`
    };
  }

  // 3. Kontrollera smärtbaserade restriktioner
  if (painLevel !== undefined) {
    for (const restriction of PAIN_BASED_RESTRICTIONS) {
      if (painLevel >= restriction.threshold) {
        const isRestricted = restriction.restrictCategories.some(cat =>
          exercise.category?.toLowerCase().includes(cat.toLowerCase()) ||
          exercise.difficulty === 'Svår'
        );

        if (isRestricted) {
          return {
            safe: false,
            warningLevel: painLevel >= 7 ? 'contraindicated' : 'caution',
            message: `Försiktighet vid VAS ${painLevel}`,
            reason: restriction.warning,
            recommendation: 'Börja med lättare övningar tills smärtan minskar.'
          };
        }
      }
    }
  }

  // 4. Generella fasvarningar (låg nivå)
  if (phase === 1 && exercise.difficulty === 'Svår') {
    return {
      safe: true,
      warningLevel: 'caution',
      message: 'Svår övning i skyddsfas',
      reason: 'Svåra övningar rekommenderas generellt inte i fas 1',
      recommendation: 'Överväg en lättare variant eller reducera intensiteten.'
    };
  }

  // Övningen är säker
  return {
    safe: true,
    warningLevel: 'none'
  };
}

/**
 * Filtrerar en lista med övningar baserat på säkerhetskontext
 */
export function filterSafeExercises(
  exercises: Exercise[],
  context: SafetyContext,
  strictMode: boolean = false
): { exercise: Exercise; safety: SafetyResult }[] {
  return exercises.map(exercise => ({
    exercise,
    safety: evaluateExerciseSafety(exercise, context)
  })).filter(({ safety }) => {
    if (strictMode) {
      // I strikt läge, visa bara helt säkra övningar
      return safety.warningLevel === 'none';
    }
    // I normalt läge, dölj endast kontraindicerade
    return safety.warningLevel !== 'contraindicated';
  });
}

/**
 * Hämta alla tillgängliga protokolltyper
 * Använder centraliserade protokoll från postOpProtocols.ts
 */
export function getAvailableProtocols(): string[] {
  return Object.keys(POST_OP_PROTOCOLS);
}

/**
 * Hämta protokollinformation
 * Använder centraliserade protokoll från postOpProtocols.ts
 */
export function getProtocolInfo(surgeryType: string) {
  return getProtocol(surgeryType);
}

/**
 * Wrapper för att använda centraliserade protokollfunktioner
 */
export { getCurrentPhase, getProtocol, isExerciseSafeFromProtocol as isExerciseSafe };
