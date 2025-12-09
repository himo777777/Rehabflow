/**
 * Exercise Generator
 *
 * Combines base templates with position, equipment, difficulty, and laterality
 * variations to generate 10,000+ unique exercises with safety data.
 */

import {
  BaseExerciseTemplate,
  GeneratedExercise,
  Position,
  Equipment,
  Difficulty,
  Laterality,
  PositionModifier,
  EquipmentModifier,
  DifficultyModifier,
  LateralityModifier
} from './types';

// Import all templates
import { NECK_TEMPLATES } from './templates/neckTemplates';
import { SHOULDER_TEMPLATES } from './templates/shoulderTemplates';
import { lumbarTemplates } from './templates/lumbarTemplates';
import { hipTemplates } from './templates/hipTemplates';
import { kneeTemplates } from './templates/kneeTemplates';
import { ankleTemplates } from './templates/ankleTemplates';
import { coreTemplates } from './templates/coreTemplates';

// ============================================
// MODIFIERS - Using string keys for flexibility
// ============================================

const positionModifiers: Record<string, PositionModifier> = {
  'standing': {
    position: 'standing',
    nameSuffix: '',
    nameSuffixSv: '',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: ''
  },
  'sitting': {
    position: 'sitting',
    nameSuffix: ' (Seated)',
    nameSuffixSv: ' (Sittande)',
    repMultiplier: 1.0,
    difficultyOffset: -1,
    instructionAddition: 'Perform while seated'
  },
  'supine': {
    position: 'supine',
    nameSuffix: '',
    nameSuffixSv: '',
    repMultiplier: 1.0,
    difficultyOffset: -1,
    instructionAddition: ''
  },
  'prone': {
    position: 'prone',
    nameSuffix: ' (Prone)',
    nameSuffixSv: ' (Magliggande)',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: 'Perform lying on your stomach'
  },
  'side_lying': {
    position: 'side_lying',
    nameSuffix: ' (Side-Lying)',
    nameSuffixSv: ' (Sidoliggande)',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: 'Perform lying on your side'
  },
  'sidelying_left': {
    position: 'sidelying_left',
    nameSuffix: ' (Left Side)',
    nameSuffixSv: ' (Vänster Sida)',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: 'Perform lying on your left side'
  },
  'sidelying_right': {
    position: 'sidelying_right',
    nameSuffix: ' (Right Side)',
    nameSuffixSv: ' (Höger Sida)',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: 'Perform lying on your right side'
  },
  'quadruped': {
    position: 'quadruped',
    nameSuffix: ' (Quadruped)',
    nameSuffixSv: ' (Fyrfota)',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: 'Perform on hands and knees'
  },
  'half_kneeling': {
    position: 'half_kneeling',
    nameSuffix: ' (Half-Kneeling)',
    nameSuffixSv: ' (Halvknästående)',
    repMultiplier: 0.9,
    difficultyOffset: 1,
    instructionAddition: 'Perform in half-kneeling position'
  },
  'kneeling': {
    position: 'kneeling',
    nameSuffix: ' (Kneeling)',
    nameSuffixSv: ' (Knästående)',
    repMultiplier: 1.0,
    difficultyOffset: 0,
    instructionAddition: 'Perform in kneeling position'
  },
  'wall_supported': {
    position: 'wall_supported',
    nameSuffix: ' (Wall)',
    nameSuffixSv: ' (Vägg)',
    repMultiplier: 1.0,
    difficultyOffset: -1,
    instructionAddition: 'Perform supported by wall'
  },
  'bridging': {
    position: 'bridging',
    nameSuffix: '',
    nameSuffixSv: '',
    repMultiplier: 1.0,
    difficultyOffset: 1,
    instructionAddition: ''
  }
};

const equipmentModifiers: Record<string, EquipmentModifier> = {
  'none': {
    equipment: 'none',
    nameSuffix: '',
    nameSuffixSv: '',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: ''
  },
  'resistance_band': {
    equipment: 'resistance_band',
    nameSuffix: ' with Band',
    nameSuffixSv: ' med Band',
    resistanceLevel: 'light',
    difficultyOffset: 1,
    instructionAddition: 'Use resistance band'
  },
  'resistance_band_light': {
    equipment: 'resistance_band_light',
    nameSuffix: ' with Light Band',
    nameSuffixSv: ' med Lätt Band',
    resistanceLevel: 'light',
    difficultyOffset: 1,
    instructionAddition: 'Use light resistance band'
  },
  'resistance_band_medium': {
    equipment: 'resistance_band_medium',
    nameSuffix: ' with Medium Band',
    nameSuffixSv: ' med Medel Band',
    resistanceLevel: 'moderate',
    difficultyOffset: 2,
    instructionAddition: 'Use medium resistance band'
  },
  'dumbbell': {
    equipment: 'dumbbell',
    nameSuffix: ' with Dumbbell',
    nameSuffixSv: ' med Hantel',
    resistanceLevel: 'moderate',
    difficultyOffset: 2,
    instructionAddition: 'Hold dumbbell'
  },
  'dumbbell_light': {
    equipment: 'dumbbell_light',
    nameSuffix: ' with Light Dumbbell',
    nameSuffixSv: ' med Lätt Hantel',
    resistanceLevel: 'light',
    difficultyOffset: 1,
    instructionAddition: 'Hold light dumbbell'
  },
  'weight': {
    equipment: 'weight',
    nameSuffix: ' with Weight',
    nameSuffixSv: ' med Vikt',
    resistanceLevel: 'moderate',
    difficultyOffset: 2,
    instructionAddition: 'Add external weight'
  },
  'ankle_weight': {
    equipment: 'ankle_weight',
    nameSuffix: ' with Ankle Weight',
    nameSuffixSv: ' med Fotledsvikt',
    resistanceLevel: 'light',
    difficultyOffset: 1,
    instructionAddition: 'Wear ankle weight'
  },
  'ankle_weights': {
    equipment: 'ankle_weights',
    nameSuffix: ' with Ankle Weights',
    nameSuffixSv: ' med Fotledsvikter',
    resistanceLevel: 'light',
    difficultyOffset: 1,
    instructionAddition: 'Wear ankle weights'
  },
  'stability_ball': {
    equipment: 'stability_ball',
    nameSuffix: ' on Swiss Ball',
    nameSuffixSv: ' på Pilatesboll',
    resistanceLevel: 'none',
    difficultyOffset: 2,
    instructionAddition: 'Perform on stability ball'
  },
  'swiss_ball': {
    equipment: 'swiss_ball',
    nameSuffix: ' on Swiss Ball',
    nameSuffixSv: ' på Pilatesboll',
    resistanceLevel: 'none',
    difficultyOffset: 2,
    instructionAddition: 'Perform on swiss ball'
  },
  'foam_roller': {
    equipment: 'foam_roller',
    nameSuffix: ' with Foam Roller',
    nameSuffixSv: ' med Skumrulle',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: 'Use foam roller'
  },
  'balance_pad': {
    equipment: 'balance_pad',
    nameSuffix: ' on Balance Pad',
    nameSuffixSv: ' på Balansdyna',
    resistanceLevel: 'none',
    difficultyOffset: 1,
    instructionAddition: 'Stand on balance pad'
  },
  'bosu': {
    equipment: 'bosu',
    nameSuffix: ' on BOSU',
    nameSuffixSv: ' på BOSU',
    resistanceLevel: 'none',
    difficultyOffset: 2,
    instructionAddition: 'Perform on BOSU'
  },
  'bosu_ball': {
    equipment: 'bosu_ball',
    nameSuffix: ' on BOSU',
    nameSuffixSv: ' på BOSU',
    resistanceLevel: 'none',
    difficultyOffset: 2,
    instructionAddition: 'Perform on BOSU ball'
  },
  'wall': {
    equipment: 'wall',
    nameSuffix: '',
    nameSuffixSv: '',
    resistanceLevel: 'none',
    difficultyOffset: -1,
    instructionAddition: ''
  },
  'chair': {
    equipment: 'chair',
    nameSuffix: ' (Chair)',
    nameSuffixSv: ' (Stol)',
    resistanceLevel: 'none',
    difficultyOffset: -1,
    instructionAddition: 'Use chair for support'
  },
  'step': {
    equipment: 'step',
    nameSuffix: ' on Step',
    nameSuffixSv: ' på Trappsteg',
    resistanceLevel: 'none',
    difficultyOffset: 1,
    instructionAddition: 'Perform on step'
  },
  'step_box': {
    equipment: 'step_box',
    nameSuffix: ' on Step',
    nameSuffixSv: ' på Trappsteg',
    resistanceLevel: 'none',
    difficultyOffset: 1,
    instructionAddition: 'Perform on step box'
  },
  'bench': {
    equipment: 'bench',
    nameSuffix: ' on Bench',
    nameSuffixSv: ' på Bänk',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: 'Perform on bench'
  },
  'mat': {
    equipment: 'mat',
    nameSuffix: '',
    nameSuffixSv: '',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: ''
  },
  'towel': {
    equipment: 'towel',
    nameSuffix: ' with Towel',
    nameSuffixSv: ' med Handduk',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: 'Use towel'
  },
  'strap': {
    equipment: 'strap',
    nameSuffix: ' with Strap',
    nameSuffixSv: ' med Rem',
    resistanceLevel: 'none',
    difficultyOffset: -1,
    instructionAddition: 'Use strap to assist'
  },
  'pad': {
    equipment: 'pad',
    nameSuffix: '',
    nameSuffixSv: '',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: ''
  },
  'cable_machine': {
    equipment: 'cable_machine',
    nameSuffix: ' (Cable)',
    nameSuffixSv: ' (Kabel)',
    resistanceLevel: 'moderate',
    difficultyOffset: 1,
    instructionAddition: 'Use cable machine'
  },
  'partner': {
    equipment: 'partner',
    nameSuffix: ' (Partner)',
    nameSuffixSv: ' (Partner)',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: 'Partner assists'
  },
  'anchor': {
    equipment: 'anchor',
    nameSuffix: '',
    nameSuffixSv: '',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: ''
  },
  'box': {
    equipment: 'box',
    nameSuffix: ' (Box)',
    nameSuffixSv: ' (Låda)',
    resistanceLevel: 'none',
    difficultyOffset: 1,
    instructionAddition: 'Use plyo box'
  },
  'biofeedback': {
    equipment: 'biofeedback',
    nameSuffix: ' with Biofeedback',
    nameSuffixSv: ' med Biofeedback',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: 'Use biofeedback'
  },
  'stick_dowel': {
    equipment: 'stick_dowel',
    nameSuffix: ' with Stick',
    nameSuffixSv: ' med Stav',
    resistanceLevel: 'none',
    difficultyOffset: 0,
    instructionAddition: 'Use stick or dowel'
  }
};

const difficultyModifiers: Record<string, DifficultyModifier> = {
  'beginner': {
    difficulty: 'beginner',
    nameSuffix: '',
    nameSuffixSv: '',
    repMultiplier: 1.0,
    setMultiplier: 1.0,
    holdMultiplier: 1.0
  },
  'intermediate': {
    difficulty: 'intermediate',
    nameSuffix: ' (Intermediate)',
    nameSuffixSv: ' (Medel)',
    repMultiplier: 1.2,
    setMultiplier: 1.0,
    holdMultiplier: 1.5
  },
  'advanced': {
    difficulty: 'advanced',
    nameSuffix: ' (Advanced)',
    nameSuffixSv: ' (Avancerad)',
    repMultiplier: 1.5,
    setMultiplier: 1.0,
    holdMultiplier: 2.0
  },
  'elite': {
    difficulty: 'elite',
    nameSuffix: ' (Elite)',
    nameSuffixSv: ' (Elit)',
    repMultiplier: 2.0,
    setMultiplier: 1.0,
    holdMultiplier: 2.5
  }
};

const lateralityModifiers: Record<string, LateralityModifier> = {
  'bilateral': {
    laterality: 'bilateral',
    nameSuffix: '',
    nameSuffixSv: '',
    repMultiplier: 1.0,
    instructionAddition: ''
  },
  'unilateral_left': {
    laterality: 'unilateral_left',
    nameSuffix: ' (Left)',
    nameSuffixSv: ' (Vänster)',
    repMultiplier: 1.0,
    instructionAddition: 'Perform on left side'
  },
  'unilateral_right': {
    laterality: 'unilateral_right',
    nameSuffix: ' (Right)',
    nameSuffixSv: ' (Höger)',
    repMultiplier: 1.0,
    instructionAddition: 'Perform on right side'
  },
  'alternating': {
    laterality: 'alternating',
    nameSuffix: ' (Alternating)',
    nameSuffixSv: ' (Alternerande)',
    repMultiplier: 2.0,
    instructionAddition: 'Alternate sides'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getModifier<T>(modifiers: Record<string, T>, key: string, defaultKey: string): T {
  return modifiers[key] || modifiers[defaultKey];
}

// ============================================
// GENERATOR FUNCTIONS
// ============================================

/**
 * Generate unique exercise ID
 */
function generateExerciseId(
  templateId: string,
  position: Position,
  equipment: Equipment,
  difficulty: Difficulty,
  laterality: Laterality
): string {
  const parts = [templateId];

  if (position !== 'supine' && position !== 'standing') {
    parts.push(String(position).replace(/_/g, '-'));
  }
  if (equipment !== 'none' && equipment !== 'mat') {
    parts.push(String(equipment).replace(/_/g, '-'));
  }
  if (difficulty !== 'beginner') {
    parts.push(String(difficulty));
  }
  if (laterality !== 'bilateral') {
    parts.push(String(laterality).replace(/_/g, '-'));
  }

  return parts.join('_');
}

/**
 * Generate exercise name with modifiers
 */
function generateExerciseName(
  baseName: string,
  positionMod: PositionModifier,
  equipmentMod: EquipmentModifier,
  difficultyMod: DifficultyModifier,
  lateralityMod: LateralityModifier,
  isSv: boolean = false
): string {
  let name = baseName;

  const posSuffix = isSv ? positionMod.nameSuffixSv : positionMod.nameSuffix;
  if (posSuffix) name += posSuffix;

  const eqSuffix = isSv ? equipmentMod.nameSuffixSv : equipmentMod.nameSuffix;
  if (eqSuffix) name += eqSuffix;

  const diffSuffix = isSv ? difficultyMod.nameSuffixSv : difficultyMod.nameSuffix;
  if (diffSuffix) name += diffSuffix;

  const latSuffix = isSv ? lateralityMod.nameSuffixSv : lateralityMod.nameSuffix;
  if (latSuffix) name += latSuffix;

  return name;
}

/**
 * Calculate adjusted reps based on modifiers
 */
function calculateReps(
  baseReps: { min: number; max: number } | number | string,
  difficultyMod: DifficultyModifier,
  lateralityMod: LateralityModifier
): { min: number; max: number } {
  // Handle various input formats
  let min: number, max: number;

  if (typeof baseReps === 'number') {
    min = baseReps;
    max = baseReps;
  } else if (typeof baseReps === 'string') {
    const match = baseReps.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      min = parseInt(match[1], 10);
      max = match[2] ? parseInt(match[2], 10) : min;
    } else {
      min = 10;
      max = 15;
    }
  } else {
    min = baseReps.min;
    max = baseReps.max;
  }

  const multiplier = difficultyMod.repMultiplier * lateralityMod.repMultiplier;
  return {
    min: Math.round(min * multiplier),
    max: Math.round(max * multiplier)
  };
}

/**
 * Calculate adjusted hold time
 */
function calculateHoldSeconds(
  baseHold: number | undefined,
  difficultyMod: DifficultyModifier
): number | undefined {
  if (!baseHold) return undefined;
  return Math.round(baseHold * difficultyMod.holdMultiplier);
}

/**
 * Generate a single exercise variation from a template
 */
function generateExerciseVariation(
  template: BaseExerciseTemplate,
  position: Position,
  equipment: Equipment,
  difficulty: Difficulty,
  laterality: Laterality
): GeneratedExercise {
  const positionMod = getModifier(positionModifiers, position, 'standing');
  const equipmentMod = getModifier(equipmentModifiers, equipment, 'none');
  const difficultyMod = getModifier(difficultyModifiers, difficulty, 'beginner');
  const lateralityMod = getModifier(lateralityModifiers, laterality, 'bilateral');

  const id = generateExerciseId(template.id, position, equipment, difficulty, laterality);

  const baseName = template.baseName || template.baseNameEn || '';
  const baseNameSv = template.baseNameSv || template.baseName || '';

  const name = generateExerciseName(baseName, positionMod, equipmentMod, difficultyMod, lateralityMod, false);
  const nameSv = generateExerciseName(baseNameSv, positionMod, equipmentMod, difficultyMod, lateralityMod, true);

  // Combine instructions
  const additionalInstructions: string[] = [];
  if (positionMod.instructionAddition) additionalInstructions.push(positionMod.instructionAddition);
  if (equipmentMod.instructionAddition) additionalInstructions.push(equipmentMod.instructionAddition);
  if (lateralityMod.instructionAddition) additionalInstructions.push(lateralityMod.instructionAddition);

  const templateInstructions = template.instructions || [];
  const instructions = additionalInstructions.length > 0
    ? [...additionalInstructions, ...templateInstructions]
    : templateInstructions;

  const reps = calculateReps(template.baseReps, difficultyMod, lateralityMod);
  const holdSeconds = calculateHoldSeconds(template.baseHoldSeconds, difficultyMod);

  // Handle sets - can be number or object
  let sets: { min: number; max: number };
  if (typeof template.baseSets === 'number') {
    sets = { min: template.baseSets, max: template.baseSets };
  } else if (typeof template.baseSets === 'string') {
    const match = String(template.baseSets).match(/(\d+)(?:-(\d+))?/);
    if (match) {
      sets = { min: parseInt(match[1], 10), max: match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10) };
    } else {
      sets = { min: 3, max: 3 };
    }
  } else {
    sets = template.baseSets;
  }

  return {
    id,
    name,
    nameSv,
    description: template.description || '',
    descriptionSv: template.descriptionSv || template.description || '',

    bodyRegion: template.bodyRegion,
    muscleGroups: template.muscleGroups || template.primaryMuscles || [],
    jointType: template.jointType || (template.joints?.[0]) || 'spine',
    exerciseType: template.exerciseType,

    position,
    equipment,
    difficulty,
    laterality,

    reps,
    sets,
    holdSeconds,
    restSeconds: template.baseRestSeconds || 60,

    instructions,
    instructionsSv: template.instructionsSv || [],
    techniquePoints: template.techniquePoints || [],

    safetyData: template.safetyData || {
      contraindications: template.baseContraindications || [],
      precautions: template.basePrecautions || [],
      redFlags: template.baseRedFlags || [],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: '',
      targetStructure: '',
      postOpRestrictions: [],
      appropriateForSurgeries: template.appropriateSurgeries || [],
      progressionCriteria: {
        minPainFreeReps: 10,
        minConsecutiveDays: 3,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },
      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: []
      }
    },

    evidenceBase: template.evidenceBase || {
      level: 'C',
      source: '',
      studyType: ''
    },
    sourceTemplateId: template.id
  };
}

/**
 * Generate all variations for a single template
 */
function generateAllVariationsForTemplate(template: BaseExerciseTemplate): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];
  const seenIds = new Set<string>();

  const positions = template.allowedPositions || ['supine'];
  const equipments = template.allowedEquipment || ['none'];
  const difficulties = template.allowedDifficulties || ['beginner'];
  const lateralities = template.allowedLateralities || ['bilateral'];

  for (const position of positions) {
    for (const equipment of equipments) {
      for (const difficulty of difficulties) {
        for (const laterality of lateralities) {
          try {
            const exercise = generateExerciseVariation(
              template,
              position,
              equipment,
              difficulty,
              laterality
            );

            if (!seenIds.has(exercise.id)) {
              seenIds.add(exercise.id);
              exercises.push(exercise);
            }
          } catch (e) {
            // Skip invalid variations
          }
        }
      }
    }
  }

  return exercises;
}

/**
 * Generate all exercises from all templates
 */
export function generateAllExercises(): GeneratedExercise[] {
  const allTemplates: BaseExerciseTemplate[] = [
    ...NECK_TEMPLATES,
    ...SHOULDER_TEMPLATES,
    ...lumbarTemplates,
    ...hipTemplates,
    ...kneeTemplates,
    ...ankleTemplates,
    ...coreTemplates
  ];

  const allExercises: GeneratedExercise[] = [];
  const seenIds = new Set<string>();

  for (const template of allTemplates) {
    const variations = generateAllVariationsForTemplate(template);
    for (const exercise of variations) {
      if (!seenIds.has(exercise.id)) {
        seenIds.add(exercise.id);
        allExercises.push(exercise);
      }
    }
  }

  return allExercises;
}

/**
 * Get exercises filtered by body region
 */
export function getExercisesByBodyRegion(region: string): GeneratedExercise[] {
  const allExercises = generateAllExercises();
  return allExercises.filter(e => e.bodyRegion === region);
}

/**
 * Get exercises filtered by difficulty
 */
export function getExercisesByDifficulty(difficulty: Difficulty): GeneratedExercise[] {
  const allExercises = generateAllExercises();
  return allExercises.filter(e => e.difficulty === difficulty);
}

/**
 * Get exercise statistics
 */
export function getExerciseStats(): {
  total: number;
  byRegion: Record<string, number>;
  byDifficulty: Record<string, number>;
  byEquipment: Record<string, number>;
} {
  const exercises = generateAllExercises();

  const byRegion: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byEquipment: Record<string, number> = {};

  for (const ex of exercises) {
    byRegion[ex.bodyRegion] = (byRegion[ex.bodyRegion] || 0) + 1;
    byDifficulty[ex.difficulty] = (byDifficulty[ex.difficulty] || 0) + 1;
    byEquipment[ex.equipment] = (byEquipment[ex.equipment] || 0) + 1;
  }

  return {
    total: exercises.length,
    byRegion,
    byDifficulty,
    byEquipment
  };
}

// Export generated database (lazy, on first access)
let _cachedDatabase: GeneratedExercise[] | null = null;
export function getGeneratedExerciseDatabase(): GeneratedExercise[] {
  if (!_cachedDatabase) {
    _cachedDatabase = generateAllExercises();
  }
  return _cachedDatabase;
}

export const generatedExerciseDatabase = generateAllExercises();

export default {
  generateAllExercises,
  getExercisesByBodyRegion,
  getExercisesByDifficulty,
  getExerciseStats,
  getGeneratedExerciseDatabase
};
