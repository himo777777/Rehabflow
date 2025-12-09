/**
 * Exercise to Animation Mapping
 * Maps each exercise name to its corresponding animation and body position
 *
 * Enhanced with body region metadata for better filtering and animation matching
 */

export type BodyPosition = 'standing' | 'lying' | 'sitting' | 'kneeling' | 'sidelying' | 'quadruped';

export type BodyRegion = 'neck' | 'shoulder' | 'elbow' | 'wrist_hand' | 'thoracic' | 'lumbar' | 'hip' | 'knee' | 'ankle' | 'core';

export type ExerciseCategory = 'strength' | 'stretch' | 'mobility' | 'balance' | 'functional' | 'aerobic' | 'vestibular' | 'proprioception';

export interface ExerciseAnimationMapping {
  animationKey: string;
  position: BodyPosition;
  bodyRegion?: BodyRegion;
  category?: ExerciseCategory;
  muscleGroups?: string[];
  description?: string;
  seniorFriendly?: boolean;
  fallRiskLevel?: 'low' | 'moderate' | 'high';
}

/**
 * Complete mapping of exercises to animations with body region metadata
 */
export const EXERCISE_ANIMATION_MAP: Record<string, ExerciseAnimationMapping> = {
  // === NACKE (CERVICAL) - 3 övningar ===
  'Retraktion av Nacke (Chin Tucks)': {
    animationKey: 'chinTuck',
    position: 'sitting',
    bodyRegion: 'neck',
    category: 'mobility',
    muscleGroups: ['deep_neck_flexors'],
    description: 'Dra in hakan',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Isometrisk Nackextension': {
    animationKey: 'neckExtension',
    position: 'sitting',
    bodyRegion: 'neck',
    category: 'strength',
    muscleGroups: ['neck_extensors'],
    description: 'Tryck huvudet bakåt mot händerna',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Levator Scapulae Stretch': {
    animationKey: 'neckStretch',
    position: 'sitting',
    bodyRegion: 'neck',
    category: 'stretch',
    muscleGroups: ['levator_scapulae', 'upper_trapezius'],
    description: 'Nacksträckning åt sidan',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },

  // === AXEL (SHOULDER) - 4 övningar ===
  'Utåtrotation med gummiband': {
    animationKey: 'shoulderExternalRotation',
    position: 'standing',
    bodyRegion: 'shoulder',
    category: 'strength',
    muscleGroups: ['infraspinatus', 'teres_minor'],
    description: 'Rotera underarmen utåt',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Serratus Push-up (Scapula Push-up)': {
    animationKey: 'serratusPushUp',
    position: 'standing',
    bodyRegion: 'shoulder',
    category: 'strength',
    muscleGroups: ['serratus_anterior'],
    description: 'Skulderblad isär och ihop',
    seniorFriendly: false,
    fallRiskLevel: 'moderate',
  },
  'Wall Slides (Väggklättring)': {
    animationKey: 'wallSlides',
    position: 'standing',
    bodyRegion: 'shoulder',
    category: 'mobility',
    muscleGroups: ['rotator_cuff', 'scapular_stabilizers'],
    description: 'Glid armarna upp längs vägg',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Full Can (Supraspinatus)': {
    animationKey: 'fullCan',
    position: 'standing',
    bodyRegion: 'shoulder',
    category: 'strength',
    muscleGroups: ['supraspinatus', 'deltoid'],
    description: 'Lyft armarna snett framåt',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },

  // === ARMBÅGE & HANDLED - 2 övningar ===
  'Excentrisk Handledsextension': {
    animationKey: 'wristExtension',
    position: 'sitting',
    bodyRegion: 'wrist_hand',
    category: 'strength',
    muscleGroups: ['wrist_extensors', 'ECRB'],
    description: 'Bromsa handled nedåt',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Underarmsrotation (Supination/Pronation)': {
    animationKey: 'forearmRotation',
    position: 'sitting',
    bodyRegion: 'elbow',
    category: 'mobility',
    muscleGroups: ['supinator', 'pronator_teres'],
    description: 'Vrid underarmen',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },

  // === RYGG (BACK) - 5 övningar ===
  'Katten och Kon': {
    animationKey: 'catCow',
    position: 'quadruped',
    bodyRegion: 'lumbar',
    category: 'mobility',
    muscleGroups: ['spinal_extensors', 'abdominals'],
    description: 'Rygg upp och ner',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'McGill Curl-up': {
    animationKey: 'mcGillCurlUp',
    position: 'lying',
    bodyRegion: 'core',
    category: 'strength',
    muscleGroups: ['rectus_abdominis'],
    description: 'Lyft huvud och axlar',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Fågelhunden (Bird Dog)': {
    animationKey: 'birdDog',
    position: 'quadruped',
    bodyRegion: 'core',
    category: 'strength',
    muscleGroups: ['multifidus', 'gluteus_maximus', 'erector_spinae'],
    description: 'Sträck motsatt arm och ben',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Sidoplanka': {
    animationKey: 'sidePlank',
    position: 'sidelying',
    bodyRegion: 'core',
    category: 'strength',
    muscleGroups: ['obliques', 'quadratus_lumborum'],
    description: 'Lyft höften i sidoläge',
    seniorFriendly: false,
    fallRiskLevel: 'moderate',
  },
  'Cobra (Prone Press-up)': {
    animationKey: 'cobra',
    position: 'lying',
    bodyRegion: 'thoracic',
    category: 'mobility',
    muscleGroups: ['spinal_extensors'],
    description: 'Pressa upp överkroppen',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },

  // === HÖFT (HIP) - 3 övningar ===
  'Musslan (Clamshells)': {
    animationKey: 'clamshell',
    position: 'sidelying',
    bodyRegion: 'hip',
    category: 'strength',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus'],
    description: 'Öppna knät som en mussla',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Bäckenlyft (Glute Bridge)': {
    animationKey: 'gluteBridge',
    position: 'lying',
    bodyRegion: 'hip',
    category: 'strength',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    description: 'Lyft höften från ryggläge',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Höftböjarstretch (Kneeling Hip Flexor)': {
    animationKey: 'hipFlexorStretch',
    position: 'kneeling',
    bodyRegion: 'hip',
    category: 'stretch',
    muscleGroups: ['iliopsoas', 'rectus_femoris'],
    description: 'Stretch främre höften',
    seniorFriendly: true,
    fallRiskLevel: 'moderate',
  },

  // === KNÄ (KNEE) - 4 övningar ===
  'Knäböj (Squat)': {
    animationKey: 'squat',
    position: 'standing',
    bodyRegion: 'knee',
    category: 'strength',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    description: 'Böj knäna och sätt dig',
    seniorFriendly: true,
    fallRiskLevel: 'moderate',
  },
  'Step-up på låda': {
    animationKey: 'stepUp',
    position: 'standing',
    bodyRegion: 'knee',
    category: 'functional',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    description: 'Kliv upp på låda',
    seniorFriendly: true,
    fallRiskLevel: 'moderate',
  },
  'Hälglidning (Heel Slides)': {
    animationKey: 'heelSlide',
    position: 'lying',
    bodyRegion: 'knee',
    category: 'mobility',
    muscleGroups: ['quadriceps', 'hamstrings'],
    description: 'Glid hälen mot rumpan',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Spanish Squat': {
    animationKey: 'spanishSquat',
    position: 'standing',
    bodyRegion: 'knee',
    category: 'strength',
    muscleGroups: ['quadriceps', 'patellar_tendon'],
    description: 'Knäböj med band',
    seniorFriendly: false,
    fallRiskLevel: 'moderate',
  },

  // === FOT & UNDERBEN - 4 övningar ===
  'Tåhävningar (Calf Raise)': {
    animationKey: 'calfRaise',
    position: 'standing',
    bodyRegion: 'ankle',
    category: 'strength',
    muscleGroups: ['gastrocnemius', 'soleus'],
    description: 'Gå upp på tå',
    seniorFriendly: true,
    fallRiskLevel: 'moderate',
  },
  'Excentriska Tåhäv (Alfredson)': {
    animationKey: 'eccentricCalfRaise',
    position: 'standing',
    bodyRegion: 'ankle',
    category: 'strength',
    muscleGroups: ['gastrocnemius', 'soleus', 'achilles'],
    description: 'Sänk på ett ben',
    seniorFriendly: false,
    fallRiskLevel: 'high',
  },
  'Handduksdrag (Towel Grab)': {
    animationKey: 'towelGrab',
    position: 'sitting',
    bodyRegion: 'ankle',
    category: 'strength',
    muscleGroups: ['intrinsic_foot_muscles'],
    description: 'Dra handduk med tårna',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Enbensbalans': {
    animationKey: 'singleLegBalance',
    position: 'standing',
    bodyRegion: 'ankle',
    category: 'balance',
    muscleGroups: ['ankle_stabilizers', 'hip_stabilizers'],
    description: 'Stå på ett ben',
    seniorFriendly: true,
    fallRiskLevel: 'high',
  },

  // === SENIORS FALL RISK SPECIFIC ===
  'Otago Knee Extensor Strengthening': {
    animationKey: 'kneeExtension',
    position: 'sitting',
    bodyRegion: 'knee',
    category: 'strength',
    muscleGroups: ['quadriceps'],
    description: 'Otago knästräckning',
    seniorFriendly: true,
    fallRiskLevel: 'low',
  },
  'Otago Single Leg Stand': {
    animationKey: 'singleLegBalance',
    position: 'standing',
    bodyRegion: 'core',
    category: 'balance',
    muscleGroups: ['hip_stabilizers', 'ankle_stabilizers'],
    description: 'Otago enbensbalans',
    seniorFriendly: true,
    fallRiskLevel: 'high',
  },
  'Otago Tandem Stand': {
    animationKey: 'singleLegBalance',
    position: 'standing',
    bodyRegion: 'core',
    category: 'balance',
    muscleGroups: ['core_stabilizers', 'ankle_stabilizers'],
    description: 'Häl-mot-tå stående',
    seniorFriendly: true,
    fallRiskLevel: 'high',
  },
  'Chair Sit to Stand': {
    animationKey: 'squat',
    position: 'sitting',
    bodyRegion: 'hip',
    category: 'functional',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    description: 'Res dig från stol',
    seniorFriendly: true,
    fallRiskLevel: 'moderate',
  },
  'Tai Chi for Seniors': {
    animationKey: 'singleLegBalance',
    position: 'standing',
    bodyRegion: 'core',
    category: 'balance',
    muscleGroups: ['core_stabilizers', 'hip_stabilizers'],
    description: 'Tai Chi rörelser',
    seniorFriendly: true,
    fallRiskLevel: 'moderate',
  },
};

/**
 * Get animation mapping for an exercise
 * Förbättrad matchning med loggning för felsökning
 */
export function getAnimationMapping(exerciseName: string): ExerciseAnimationMapping | null {
  // Direct match (exakt matchning)
  if (EXERCISE_ANIMATION_MAP[exerciseName]) {
    console.log(`[AnimationMap] Exakt match: "${exerciseName}" -> ${EXERCISE_ANIMATION_MAP[exerciseName].animationKey}`);
    return EXERCISE_ANIMATION_MAP[exerciseName];
  }

  // Normalisera namnet för fuzzy match
  const normalizedName = exerciseName.toLowerCase()
    .replace(/[()]/g, '') // Ta bort parenteser
    .replace(/\s+/g, ' ') // Normalisera mellanslag
    .trim();

  // Fuzzy match - kontrollera om övningsnamnet innehåller nyckeln eller vice versa
  for (const [key, mapping] of Object.entries(EXERCISE_ANIMATION_MAP)) {
    const normalizedKey = key.toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Delvis matchning i båda riktningarna
    if (normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
      console.log(`[AnimationMap] Fuzzy match: "${exerciseName}" -> ${mapping.animationKey} (via "${key}")`);
      return mapping;
    }

    // Kolla om några betydande ord matchar
    const nameWords = normalizedName.split(' ').filter(w => w.length > 3);
    const keyWords = normalizedKey.split(' ').filter(w => w.length > 3);
    const matchingWords = nameWords.filter(w => keyWords.some(kw => kw.includes(w) || w.includes(kw)));

    if (matchingWords.length >= 2) {
      console.log(`[AnimationMap] Word match: "${exerciseName}" -> ${mapping.animationKey} (via "${key}", matching: ${matchingWords.join(', ')})`);
      return mapping;
    }
  }

  // Keyword-based fallback (extended for exercise generator templates + seniors)
  const keywordMap: Record<string, ExerciseAnimationMapping> = {
    // === KNEE ===
    'knä': { animationKey: 'squat', position: 'standing', bodyRegion: 'knee' },
    'squat': { animationKey: 'squat', position: 'standing', bodyRegion: 'knee' },
    'quad': { animationKey: 'kneeExtension', position: 'sitting', bodyRegion: 'knee' },
    'hamstring': { animationKey: 'gluteBridge', position: 'lying', bodyRegion: 'hip' },
    'step': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'knee' },
    'heel_slide': { animationKey: 'heelSlide', position: 'lying', bodyRegion: 'knee' },
    'lunge': { animationKey: 'lunge', position: 'standing', bodyRegion: 'knee' },
    'terminal': { animationKey: 'kneeExtension', position: 'sitting', bodyRegion: 'knee' },
    'patella': { animationKey: 'squat', position: 'standing', bodyRegion: 'knee' },

    // === HIP ===
    'höft': { animationKey: 'hipAbduction', position: 'standing', bodyRegion: 'hip' },
    'hip': { animationKey: 'hipAbduction', position: 'standing', bodyRegion: 'hip' },
    'clam': { animationKey: 'clamshell', position: 'sidelying', bodyRegion: 'hip' },
    'mussla': { animationKey: 'clamshell', position: 'sidelying', bodyRegion: 'hip' },
    'glute': { animationKey: 'gluteBridge', position: 'lying', bodyRegion: 'hip' },
    'copenhagen': { animationKey: 'sidePlank', position: 'sidelying', bodyRegion: 'hip' },
    'abdukt': { animationKey: 'hipAbduction', position: 'standing', bodyRegion: 'hip' },
    'addukt': { animationKey: 'clamshell', position: 'sidelying', bodyRegion: 'hip' },
    'frog': { animationKey: 'hipFlexorStretch', position: 'kneeling', bodyRegion: 'hip' },
    'piriformis': { animationKey: 'hipFlexorStretch', position: 'lying', bodyRegion: 'hip' },
    'thr': { animationKey: 'heelSlide', position: 'lying', bodyRegion: 'hip', seniorFriendly: true },
    'gtps': { animationKey: 'clamshell', position: 'sidelying', bodyRegion: 'hip' },
    'labral': { animationKey: 'hipAbduction', position: 'standing', bodyRegion: 'hip' },
    'fai': { animationKey: 'hipFlexorStretch', position: 'lying', bodyRegion: 'hip' },

    // === SHOULDER ===
    'axel': { animationKey: 'shoulderFlexion', position: 'standing', bodyRegion: 'shoulder' },
    'arm': { animationKey: 'shoulderFlexion', position: 'standing', bodyRegion: 'shoulder' },
    'shoulder': { animationKey: 'shoulderFlexion', position: 'standing', bodyRegion: 'shoulder' },
    'rotation': { animationKey: 'shoulderExternalRotation', position: 'standing', bodyRegion: 'shoulder' },
    'serratus': { animationKey: 'serratusPushUp', position: 'standing', bodyRegion: 'shoulder' },
    'scaption': { animationKey: 'fullCan', position: 'standing', bodyRegion: 'shoulder' },
    'pendulum': { animationKey: 'shoulderFlexion', position: 'standing', bodyRegion: 'shoulder' },
    'wall_slide': { animationKey: 'wallSlides', position: 'standing', bodyRegion: 'shoulder' },
    'rotator': { animationKey: 'shoulderExternalRotation', position: 'standing', bodyRegion: 'shoulder' },
    'scapula': { animationKey: 'serratusPushUp', position: 'standing', bodyRegion: 'shoulder' },
    'deltoid': { animationKey: 'shoulderFlexion', position: 'standing', bodyRegion: 'shoulder' },

    // === NECK ===
    'nacke': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck' },
    'neck': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck' },
    'chin_tuck': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck' },
    'levator': { animationKey: 'neckStretch', position: 'sitting', bodyRegion: 'neck' },
    'trapezius': { animationKey: 'neckStretch', position: 'sitting', bodyRegion: 'neck' },
    'cervical': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck' },
    'whiplash': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck' },
    'headache': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck' },
    'suboccipital': { animationKey: 'neckStretch', position: 'sitting', bodyRegion: 'neck' },

    // === THORACIC ===
    'thoracic': { animationKey: 'cobra', position: 'lying', bodyRegion: 'thoracic' },
    'bröst': { animationKey: 'cobra', position: 'lying', bodyRegion: 'thoracic' },
    'thread': { animationKey: 'catCow', position: 'quadruped', bodyRegion: 'thoracic' },
    'foam_roller': { animationKey: 'cobra', position: 'lying', bodyRegion: 'thoracic' },

    // === CORE/LUMBAR ===
    'rygg': { animationKey: 'catCow', position: 'quadruped', bodyRegion: 'lumbar' },
    'lumbar': { animationKey: 'catCow', position: 'quadruped', bodyRegion: 'lumbar' },
    'bål': { animationKey: 'trunkRotation', position: 'standing', bodyRegion: 'core' },
    'core': { animationKey: 'birdDog', position: 'quadruped', bodyRegion: 'core' },
    'bird_dog': { animationKey: 'birdDog', position: 'quadruped', bodyRegion: 'core' },
    'dead_bug': { animationKey: 'birdDog', position: 'lying', bodyRegion: 'core' },
    'mcgill': { animationKey: 'mcGillCurlUp', position: 'lying', bodyRegion: 'core' },
    'mckenzie': { animationKey: 'cobra', position: 'lying', bodyRegion: 'lumbar' },
    'pallof': { animationKey: 'trunkRotation', position: 'standing', bodyRegion: 'core' },
    'abdominal': { animationKey: 'mcGillCurlUp', position: 'lying', bodyRegion: 'core' },

    // === ELBOW ===
    'elbow': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'elbow' },
    'armbåge': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'elbow' },
    'bicep': { animationKey: 'forearmRotation', position: 'sitting', bodyRegion: 'elbow' },
    'tricep': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'elbow' },
    'tyler': { animationKey: 'wristExtension', position: 'standing', bodyRegion: 'elbow' },
    'flexbar': { animationKey: 'wristExtension', position: 'standing', bodyRegion: 'elbow' },
    'epicondyl': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'elbow' },

    // === WRIST/HAND ===
    'wrist': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'wrist_hand' },
    'handled': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'wrist_hand' },
    'hand': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'wrist_hand' },
    'finger': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'wrist_hand' },
    'grip': { animationKey: 'towelGrab', position: 'sitting', bodyRegion: 'wrist_hand' },
    'carpal': { animationKey: 'wristExtension', position: 'sitting', bodyRegion: 'wrist_hand' },

    // === BALANCE ===
    'balans': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'core', category: 'balance' },
    'balance': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'core', category: 'balance' },
    'tandem': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'core', category: 'balance', seniorFriendly: true },
    'single_leg': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'ankle', category: 'balance' },
    'proprioception': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'ankle', category: 'proprioception' },

    // === PLANK ===
    'planka': { animationKey: 'sidePlank', position: 'sidelying', bodyRegion: 'core' },
    'plank': { animationKey: 'sidePlank', position: 'sidelying', bodyRegion: 'core' },

    // === LYING ===
    'ligg': { animationKey: 'gluteBridge', position: 'lying', bodyRegion: 'hip' },
    'supine': { animationKey: 'gluteBridge', position: 'lying', bodyRegion: 'hip' },
    'prone': { animationKey: 'cobra', position: 'lying', bodyRegion: 'thoracic' },

    // === ANKLE/CALF ===
    'calf': { animationKey: 'calfRaise', position: 'standing', bodyRegion: 'ankle' },
    'ankle': { animationKey: 'calfRaise', position: 'standing', bodyRegion: 'ankle' },
    'fotled': { animationKey: 'calfRaise', position: 'standing', bodyRegion: 'ankle' },
    'tåhävning': { animationKey: 'calfRaise', position: 'standing', bodyRegion: 'ankle' },
    'alfredson': { animationKey: 'eccentricCalfRaise', position: 'standing', bodyRegion: 'ankle' },
    'towel': { animationKey: 'towelGrab', position: 'sitting', bodyRegion: 'ankle' },
    'achilles': { animationKey: 'eccentricCalfRaise', position: 'standing', bodyRegion: 'ankle' },
    'peroneal': { animationKey: 'calfRaise', position: 'standing', bodyRegion: 'ankle' },
    'plantar': { animationKey: 'towelGrab', position: 'sitting', bodyRegion: 'ankle' },
    'intrinsic': { animationKey: 'towelGrab', position: 'sitting', bodyRegion: 'ankle' },

    // === SENIORS / FALL PREVENTION ===
    'otago': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'core', seniorFriendly: true, fallRiskLevel: 'moderate' },
    'senior': { animationKey: 'squat', position: 'sitting', bodyRegion: 'hip', seniorFriendly: true, fallRiskLevel: 'low' },
    'äldre': { animationKey: 'squat', position: 'sitting', bodyRegion: 'hip', seniorFriendly: true, fallRiskLevel: 'low' },
    'fall': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'core', seniorFriendly: true, fallRiskLevel: 'high' },
    'chair': { animationKey: 'squat', position: 'sitting', bodyRegion: 'hip', seniorFriendly: true, fallRiskLevel: 'low' },
    'stol': { animationKey: 'squat', position: 'sitting', bodyRegion: 'hip', seniorFriendly: true, fallRiskLevel: 'low' },
    'sit_to_stand': { animationKey: 'squat', position: 'sitting', bodyRegion: 'hip', seniorFriendly: true },
    'tai_chi': { animationKey: 'singleLegBalance', position: 'standing', bodyRegion: 'core', seniorFriendly: true },
    'yoga': { animationKey: 'catCow', position: 'quadruped', bodyRegion: 'core', seniorFriendly: true },
    'walk': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'hip', seniorFriendly: true },
    'gait': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'hip', seniorFriendly: true },
    'marching': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'hip', seniorFriendly: true },

    // === VESTIBULAR ===
    'vestibular': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck', category: 'vestibular' },
    'gaze': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck', category: 'vestibular' },
    'head_turn': { animationKey: 'neckStretch', position: 'standing', bodyRegion: 'neck', category: 'vestibular' },
    'dizziness': { animationKey: 'chinTuck', position: 'sitting', bodyRegion: 'neck', category: 'vestibular' },

    // === AQUATIC ===
    'pool': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'hip', seniorFriendly: true },
    'aquatic': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'hip', seniorFriendly: true },
    'water': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'hip', seniorFriendly: true },

    // === FUNCTIONAL ===
    'functional': { animationKey: 'squat', position: 'standing', bodyRegion: 'knee', category: 'functional' },
    'transfer': { animationKey: 'squat', position: 'sitting', bodyRegion: 'hip', category: 'functional', seniorFriendly: true },
    'reach': { animationKey: 'shoulderFlexion', position: 'standing', bodyRegion: 'shoulder', category: 'functional' },
    'stair': { animationKey: 'stepUp', position: 'standing', bodyRegion: 'knee', category: 'functional' },
  };

  for (const [keyword, mapping] of Object.entries(keywordMap)) {
    if (normalizedName.includes(keyword)) {
      console.log(`[AnimationMap] Keyword match: "${exerciseName}" -> ${mapping.animationKey} (keyword: "${keyword}")`);
      return mapping;
    }
  }

  // Default fallback - ingen match hittades
  console.warn(`[AnimationMap] ⚠️ Ingen animation hittad för: "${exerciseName}" -> fallback till 'idle'`);
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
    quadruped: 0,
  };

  for (const mapping of Object.values(EXERCISE_ANIMATION_MAP)) {
    counts[mapping.position]++;
  }

  return counts;
}

/**
 * Get all exercises for a specific body region
 */
export function getExercisesByBodyRegion(region: BodyRegion): string[] {
  return Object.entries(EXERCISE_ANIMATION_MAP)
    .filter(([_, mapping]) => mapping.bodyRegion === region)
    .map(([name]) => name);
}

/**
 * Get all senior-friendly exercises
 */
export function getSeniorFriendlyExercises(): string[] {
  return Object.entries(EXERCISE_ANIMATION_MAP)
    .filter(([_, mapping]) => mapping.seniorFriendly === true)
    .map(([name]) => name);
}

/**
 * Get exercises by fall risk level
 */
export function getExercisesByFallRisk(level: 'low' | 'moderate' | 'high'): string[] {
  return Object.entries(EXERCISE_ANIMATION_MAP)
    .filter(([_, mapping]) => mapping.fallRiskLevel === level)
    .map(([name]) => name);
}

/**
 * Count exercises by body region
 */
export function countExercisesByBodyRegion(): Record<BodyRegion, number> {
  const counts: Record<BodyRegion, number> = {
    neck: 0,
    shoulder: 0,
    elbow: 0,
    wrist_hand: 0,
    thoracic: 0,
    lumbar: 0,
    hip: 0,
    knee: 0,
    ankle: 0,
    core: 0,
  };

  for (const mapping of Object.values(EXERCISE_ANIMATION_MAP)) {
    if (mapping.bodyRegion) {
      counts[mapping.bodyRegion]++;
    }
  }

  return counts;
}

/**
 * Get animation coverage statistics
 */
export function getAnimationCoverageStats(): {
  totalExercises: number;
  byBodyRegion: Record<BodyRegion, number>;
  byPosition: Record<BodyPosition, number>;
  seniorFriendlyCount: number;
  byFallRisk: Record<string, number>;
} {
  const stats = {
    totalExercises: Object.keys(EXERCISE_ANIMATION_MAP).length,
    byBodyRegion: countExercisesByBodyRegion(),
    byPosition: countExercisesByPosition(),
    seniorFriendlyCount: getSeniorFriendlyExercises().length,
    byFallRisk: {
      low: getExercisesByFallRisk('low').length,
      moderate: getExercisesByFallRisk('moderate').length,
      high: getExercisesByFallRisk('high').length,
    },
  };

  return stats;
}
