/**
 * Exercise to Animation Mapping
 * Maps each exercise name to its corresponding animation and body position
 */

export type BodyPosition = 'standing' | 'lying' | 'sitting' | 'kneeling' | 'sidelying';

export interface ExerciseAnimationMapping {
  animationKey: string;
  position: BodyPosition;
  description?: string;
}

/**
 * Complete mapping of all 28 exercises to animations
 */
export const EXERCISE_ANIMATION_MAP: Record<string, ExerciseAnimationMapping> = {
  // === NACKE (CERVICAL) - 3 övningar ===
  'Retraktion av Nacke (Chin Tucks)': {
    animationKey: 'chinTuck',
    position: 'sitting',
    description: 'Dra in hakan',
  },
  'Isometrisk Nackextension': {
    animationKey: 'neckExtension',
    position: 'sitting',
    description: 'Tryck huvudet bakåt mot händerna',
  },
  'Levator Scapulae Stretch': {
    animationKey: 'neckStretch',
    position: 'sitting',
    description: 'Nacksträckning åt sidan',
  },

  // === AXEL (SHOULDER) - 4 övningar ===
  'Utåtrotation med gummiband': {
    animationKey: 'shoulderExternalRotation',
    position: 'standing',
    description: 'Rotera underarmen utåt',
  },
  'Serratus Push-up (Scapula Push-up)': {
    animationKey: 'serratusPushUp',
    position: 'standing', // plankaposition
    description: 'Skulderblad isär och ihop',
  },
  'Wall Slides (Väggklättring)': {
    animationKey: 'wallSlides',
    position: 'standing',
    description: 'Glid armarna upp längs vägg',
  },
  'Full Can (Supraspinatus)': {
    animationKey: 'fullCan',
    position: 'standing',
    description: 'Lyft armarna snett framåt',
  },

  // === ARMBÅGE & HANDLED - 2 övningar ===
  'Excentrisk Handledsextension': {
    animationKey: 'wristExtension',
    position: 'sitting',
    description: 'Bromsa handled nedåt',
  },
  'Underarmsrotation (Supination/Pronation)': {
    animationKey: 'forearmRotation',
    position: 'standing',
    description: 'Vrid underarmen',
  },

  // === RYGG (BACK) - 5 övningar ===
  'Katten och Kon': {
    animationKey: 'catCow',
    position: 'kneeling',
    description: 'Rygg upp och ner',
  },
  'McGill Curl-up': {
    animationKey: 'mcGillCurlUp',
    position: 'lying',
    description: 'Lyft huvud och axlar',
  },
  'Fågelhunden (Bird Dog)': {
    animationKey: 'birdDog',
    position: 'kneeling',
    description: 'Sträck motsatt arm och ben',
  },
  'Sidoplanka': {
    animationKey: 'sidePlank',
    position: 'sidelying',
    description: 'Lyft höften i sidoläge',
  },
  'Cobra (Prone Press-up)': {
    animationKey: 'cobra',
    position: 'lying',
    description: 'Pressa upp överkroppen',
  },

  // === HÖFT (HIP) - 3 övningar ===
  'Musslan (Clamshells)': {
    animationKey: 'clamshell',
    position: 'sidelying',
    description: 'Öppna knät som en mussla',
  },
  'Bäckenlyft (Glute Bridge)': {
    animationKey: 'gluteBridge',
    position: 'lying',
    description: 'Lyft höften från ryggläge',
  },
  'Höftböjarstretch (Kneeling Hip Flexor)': {
    animationKey: 'hipFlexorStretch',
    position: 'kneeling',
    description: 'Stretch främre höften',
  },

  // === KNÄ (KNEE) - 4 övningar ===
  'Knäböj (Squat)': {
    animationKey: 'squat',
    position: 'standing',
    description: 'Böj knäna och sätt dig',
  },
  'Step-up på låda': {
    animationKey: 'stepUp',
    position: 'standing',
    description: 'Kliv upp på låda',
  },
  'Hälglidning (Heel Slides)': {
    animationKey: 'heelSlide',
    position: 'lying',
    description: 'Glid hälen mot rumpan',
  },
  'Spanish Squat': {
    animationKey: 'spanishSquat',
    position: 'standing',
    description: 'Knäböj med band',
  },

  // === FOT & UNDERBEN - 4 övningar ===
  'Tåhävningar (Calf Raise)': {
    animationKey: 'calfRaise',
    position: 'standing',
    description: 'Gå upp på tå',
  },
  'Excentriska Tåhäv (Alfredson)': {
    animationKey: 'eccentricCalfRaise',
    position: 'standing',
    description: 'Sänk på ett ben',
  },
  'Handduksdrag (Towel Grab)': {
    animationKey: 'towelGrab',
    position: 'sitting',
    description: 'Dra handduk med tårna',
  },
  'Enbensbalans': {
    animationKey: 'singleLegBalance',
    position: 'standing',
    description: 'Stå på ett ben',
  },
};

/**
 * Get animation mapping for an exercise
 */
export function getAnimationMapping(exerciseName: string): ExerciseAnimationMapping | null {
  // Direct match
  if (EXERCISE_ANIMATION_MAP[exerciseName]) {
    return EXERCISE_ANIMATION_MAP[exerciseName];
  }

  // Fuzzy match - check if exercise name contains key
  const normalizedName = exerciseName.toLowerCase();
  for (const [key, mapping] of Object.entries(EXERCISE_ANIMATION_MAP)) {
    const normalizedKey = key.toLowerCase();
    if (normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
      return mapping;
    }
  }

  // Keyword-based fallback
  const keywordMap: Record<string, ExerciseAnimationMapping> = {
    'knä': { animationKey: 'squat', position: 'standing' },
    'squat': { animationKey: 'squat', position: 'standing' },
    'höft': { animationKey: 'hipAbduction', position: 'standing' },
    'axel': { animationKey: 'shoulderFlexion', position: 'standing' },
    'arm': { animationKey: 'shoulderFlexion', position: 'standing' },
    'nacke': { animationKey: 'chinTuck', position: 'sitting' },
    'rygg': { animationKey: 'catCow', position: 'kneeling' },
    'bål': { animationKey: 'trunkRotation', position: 'standing' },
    'balans': { animationKey: 'singleLegBalance', position: 'standing' },
    'planka': { animationKey: 'sidePlank', position: 'sidelying' },
    'ligg': { animationKey: 'gluteBridge', position: 'lying' },
  };

  for (const [keyword, mapping] of Object.entries(keywordMap)) {
    if (normalizedName.includes(keyword)) {
      return mapping;
    }
  }

  // Default fallback
  return { animationKey: 'idle', position: 'standing' };
}

/**
 * Get all exercises for a specific body position
 */
export function getExercisesByPosition(position: BodyPosition): string[] {
  return Object.entries(EXERCISE_ANIMATION_MAP)
    .filter(([_, mapping]) => mapping.position === position)
    .map(([name]) => name);
}

/**
 * Count exercises by position
 */
export function countExercisesByPosition(): Record<BodyPosition, number> {
  const counts: Record<BodyPosition, number> = {
    standing: 0,
    lying: 0,
    sitting: 0,
    kneeling: 0,
    sidelying: 0,
  };

  for (const mapping of Object.values(EXERCISE_ANIMATION_MAP)) {
    counts[mapping.position]++;
  }

  return counts;
}
