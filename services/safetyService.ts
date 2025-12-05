/**
 * Safety Service - Protocol Safety Filter
 *
 * Filtrerar och varnar för övningar baserat på:
 * - Postoperativt protokoll
 * - Rehabiliteringsfas
 * - Kontraindikationer
 * - Smärtnivå
 */

import { Exercise } from '../types';

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

// Postoperativa protokoll med tidsbaserade restriktioner
const POSTOP_PROTOCOLS: Record<string, {
  phase1End: number; // Dagar
  phase2End: number;
  restrictions: {
    dayRange: [number, number];
    forbidden: string[];
    warning?: string;
  }[];
}> = {
  'ACL-rekonstruktion': {
    phase1End: 14,
    phase2End: 84, // 12 veckor
    restrictions: [
      {
        dayRange: [0, 14],
        forbidden: ['Knäböj', 'Utfall', 'Hoppträning', 'Löpning'],
        warning: 'Första 2 veckorna: Endast isometriska övningar och ROM'
      },
      {
        dayRange: [14, 42],
        forbidden: ['Hoppträning', 'Löpning', 'Pivotering'],
        warning: '2-6 veckor: Gradvis belastning utan hopp/rotation'
      },
      {
        dayRange: [42, 84],
        forbidden: ['Hoppträning', 'Pivotering', 'Kontaktsport'],
        warning: '6-12 veckor: Styrketräning utan hopp'
      }
    ]
  },
  'Meniskoperation': {
    phase1End: 7,
    phase2End: 42,
    restrictions: [
      {
        dayRange: [0, 7],
        forbidden: ['Knäböj', 'Trappgång belastning'],
        warning: 'Första veckan: Avlastning och isometrisk'
      },
      {
        dayRange: [7, 28],
        forbidden: ['Djup knäböj', 'Hoppträning'],
        warning: '1-4 veckor: Gradvis knäböj (max 90 grader)'
      }
    ]
  },
  'Rotatorkuffsutur': {
    phase1End: 42,
    phase2End: 84,
    restrictions: [
      {
        dayRange: [0, 42],
        forbidden: ['Axelpress', 'Armhävning', 'Rodd över huvudet', 'Kastövningar'],
        warning: 'Första 6 veckorna: Ingen aktiv axelrörelse mot motstånd'
      },
      {
        dayRange: [42, 84],
        forbidden: ['Kastövningar', 'Tung axelpress'],
        warning: '6-12 veckor: Lätt motstånd, ingen överarmshöjning'
      }
    ]
  },
  'Diskbråcksoperation': {
    phase1End: 28,
    phase2End: 84,
    restrictions: [
      {
        dayRange: [0, 28],
        forbidden: ['Marklyft', 'Framåtböjning', 'Rotation', 'Tunga lyft'],
        warning: 'Första 4 veckorna: Undvik böjning och rotation'
      },
      {
        dayRange: [28, 84],
        forbidden: ['Marklyft med tung vikt', 'Explosiva ryggövningar'],
        warning: '4-12 veckor: Gradvis extension, undvik tung belastning'
      }
    ]
  }
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
 */
export function evaluateExerciseSafety(
  exercise: Exercise,
  context: SafetyContext
): SafetyResult {
  const { phase, isPostOp, daysSinceSurgery, surgeryType, painLevel, injuryType } = context;

  // 1. Kontrollera postoperativa restriktioner
  if (isPostOp && surgeryType && daysSinceSurgery !== undefined) {
    const protocol = POSTOP_PROTOCOLS[surgeryType];
    if (protocol) {
      for (const restriction of protocol.restrictions) {
        const [start, end] = restriction.dayRange;
        if (daysSinceSurgery >= start && daysSinceSurgery < end) {
          // Check if exercise name matches any forbidden
          const isForbidden = restriction.forbidden.some(forbidden =>
            exercise.name.toLowerCase().includes(forbidden.toLowerCase()) ||
            exercise.category?.toLowerCase().includes(forbidden.toLowerCase())
          );

          if (isForbidden) {
            return {
              safe: false,
              warningLevel: 'contraindicated',
              message: `Kontraindicerad dag ${daysSinceSurgery} efter ${surgeryType}`,
              reason: restriction.warning,
              recommendation: 'Följ postoperativt protokoll. Rådfråga din fysioterapeut.'
            };
          }
        }
      }
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
 */
export function getAvailableProtocols(): string[] {
  return Object.keys(POSTOP_PROTOCOLS);
}

/**
 * Hämta protokollinformation
 */
export function getProtocolInfo(surgeryType: string): typeof POSTOP_PROTOCOLS[string] | null {
  return POSTOP_PROTOCOLS[surgeryType] || null;
}
