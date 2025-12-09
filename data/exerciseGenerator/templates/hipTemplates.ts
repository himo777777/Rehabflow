/**
 * Hip Exercise Templates
 *
 * Evidence-based exercises for hip rehabilitation
 * Based on JOSPT guidelines and hip impingement research
 */

import { BaseExerciseTemplate } from '../types';

export const hipTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // GLUTEUS MEDIUS / LATERAL HIP
  // ============================================
  {
    id: 'hip_clamshell',
    baseName: 'Clamshell',
    baseNameSv: 'Mussla',
    description: 'Side-lying hip external rotation for gluteus medius activation',
    descriptionSv: 'Sidoliggande höft utåtrotation för gluteus medius-aktivering',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus', 'piriformis'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'resistance_band'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 15, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie on side with hips and knees bent 45 degrees',
      'Keep feet together throughout',
      'Keep pelvis still - do not roll backward',
      'Lift top knee toward ceiling',
      'Hold at top position',
      'Lower with control'
    ],
    instructionsSv: [
      'Ligg på sidan med höfter och knän böjda 45 grader',
      'Håll fötterna ihop genomgående',
      'Håll bäckenet stilla - rulla inte bakåt',
      'Lyft övre knät mot taket',
      'Håll i toppositionen',
      'Sänk med kontroll'
    ],

    techniquePoints: [
      'Pelvis should not rotate backward',
      'Feel glute, not hip flexor',
      'Keep ankles together',
      'Quality over quantity'
    ],

    safetyData: {
      contraindications: ['Acute hip labral tear', 'Hip replacement precautions'],
      precautions: ['Hip impingement - limit range', 'IT band syndrome - gentle'],
      redFlags: ['Groin pain', 'Clicking with pain', 'Giving way'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip abductors',
      targetStructure: 'Gluteus medius, gluteus minimus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['No band', 'Limited range per precautions'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement', 'IT band release'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Pelvis rolling', 'Hip flexor dominance', 'Back arching']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Reiman MP, et al. Hip strengthening exercises. JOSPT, 2012',
      studyType: 'Systematic review'
    }
  },

  {
    id: 'hip_sidelying_abduction',
    baseName: 'Side-Lying Hip Abduction',
    baseNameSv: 'Sidoliggande Höftabduktion',
    description: 'Lateral hip strengthening in side-lying position',
    descriptionSv: 'Lateral höftstyrketräning i sidoliggande position',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'tensor_fasciae_latae'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'ankle_weight', 'resistance_band'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie on side with bottom knee bent for stability',
      'Keep top leg straight',
      'Rotate top leg slightly inward (toe pointing down)',
      'Lift leg toward ceiling',
      'Keep body in straight line',
      'Lower with control'
    ],
    instructionsSv: [
      'Ligg på sidan med undre knät böjt för stabilitet',
      'Håll övre benet rakt',
      'Rotera övre benet lätt inåt (tårna pekar nedåt)',
      'Lyft benet mot taket',
      'Håll kroppen i rak linje',
      'Sänk med kontroll'
    ],

    techniquePoints: [
      'Slight internal rotation targets glute med',
      'Do not let hip flex forward',
      'Keep core braced',
      'Avoid hiking hip'
    ],

    safetyData: {
      contraindications: ['Acute hip bursitis', 'Recent hip fracture'],
      precautions: ['IT band tightness - reduce range', 'Back pain - support spine'],
      redFlags: ['Sharp lateral hip pain', 'Catching sensation'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip abductors',
      targetStructure: 'Gluteus medius',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['No weight', 'Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement', 'Gluteus medius repair'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Hip hiking', 'Trunk lean', 'External rotation']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Distefano LJ, et al. Gluteal muscle activation. JOSPT, 2009',
      studyType: 'EMG study'
    }
  },

  // ============================================
  // HIP FLEXOR EXERCISES
  // ============================================
  {
    id: 'hip_flexor_stretch_kneeling',
    baseName: 'Kneeling Hip Flexor Stretch',
    baseNameSv: 'Knästående Höftböjarstretch',
    description: 'Half-kneeling stretch for iliopsoas and rectus femoris',
    descriptionSv: 'Halvknästående stretch för iliopsoas och rectus femoris',
    bodyRegion: 'hip',
    muscleGroups: ['iliopsoas', 'rectus_femoris'],
    jointType: 'hip',
    exerciseType: 'stretch',

    basePosition: 'half_kneeling',
    allowedPositions: ['half_kneeling', 'standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'pad'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Kneel on one knee with other foot forward',
      'Keep torso upright',
      'Tuck tailbone under (posterior pelvic tilt)',
      'Shift weight forward until stretch is felt',
      'Do not arch lower back',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Knäböj på ett knä med andra foten framför',
      'Håll överkroppen upprätt',
      'Tuck svanskotan under (bakåt bäckentilt)',
      'Skifta vikten framåt tills stretch känns',
      'Välv inte ländryggen',
      'Håll och andas'
    ],

    techniquePoints: [
      'Posterior tilt is key to effective stretch',
      'Keep front knee over ankle',
      'Squeeze glute of back leg',
      'Can add arm raise for increased stretch'
    ],

    safetyData: {
      contraindications: ['Acute knee injury', 'Unable to kneel'],
      precautions: ['Knee pain - use pad', 'Balance issues - hold support'],
      redFlags: ['Knee giving way', 'Sharp hip pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip flexor complex',
      targetStructure: 'Iliopsoas, rectus femoris',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle range only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'ACL reconstruction', 'Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 75
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Back arching', 'Side bending', 'Knee pain']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Harvey D. Assessment of flexibility. JOSPT, 1998',
      studyType: 'Clinical assessment'
    }
  },

  {
    id: 'hip_flexor_march_supine',
    baseName: 'Supine Hip Flexor March',
    baseNameSv: 'Ryggliggande Höftflexion Marsch',
    description: 'Controlled hip flexion strengthening in supine',
    descriptionSv: 'Kontrollerad höftflexionsstyrka i ryggliggande',
    bodyRegion: 'hip',
    muscleGroups: ['iliopsoas', 'rectus_femoris'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'resistance_band'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back with knees bent',
      'Brace core, maintain neutral spine',
      'Lift one knee toward chest',
      'Keep pelvis stable - do not rotate',
      'Hold briefly at top',
      'Lower with control, switch sides'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Spänn core, behåll neutral rygg',
      'Lyft ett knä mot bröstet',
      'Håll bäckenet stabilt - rotera inte',
      'Håll kort i toppen',
      'Sänk med kontroll, byt sida'
    ],

    techniquePoints: [
      'Do not arch or flatten back',
      'Move slowly and deliberately',
      'Keep other foot on floor for support',
      'Feel hip flexor, not back'
    ],

    safetyData: {
      contraindications: ['Acute hip flexor strain', 'Active hip impingement'],
      precautions: ['Lower back pain - reduce range', 'Maintain neutral spine'],
      redFlags: ['Groin pain', 'Back pain increase'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip flexors',
      targetStructure: 'Iliopsoas',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gravity-assisted only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement', 'Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Back arching', 'Pelvis rotation', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Sahrmann S. Movement System Impairment Syndromes. Mosby, 2010',
      studyType: 'Clinical framework'
    }
  },

  // ============================================
  // HIP EXTENSION EXERCISES
  // ============================================
  {
    id: 'hip_prone_extension',
    baseName: 'Prone Hip Extension',
    baseNameSv: 'Pronliggande Höftextension',
    description: 'Isolated gluteus maximus strengthening',
    descriptionSv: 'Isolerad gluteus maximus-styrketräning',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'prone',
    allowedPositions: ['prone', 'quadruped'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'ankle_weight'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'alternating'],

    baseReps: { min: 12, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie face down on stable surface',
      'Keep pelvis pressed to floor',
      'Squeeze glute first',
      'Lift straight leg few inches',
      'Do not rotate pelvis',
      'Lower slowly'
    ],
    instructionsSv: [
      'Ligg på mage på stabil yta',
      'Håll bäckenet pressat mot golvet',
      'Kläm ihop sätet först',
      'Lyft rakt ben några centimeter',
      'Rotera inte bäckenet',
      'Sänk långsamt'
    ],

    techniquePoints: [
      'Squeeze glute before lifting',
      'Small movement is fine',
      'Do not hyperextend back',
      'Feel glute, not hamstring or back'
    ],

    safetyData: {
      contraindications: ['Acute hip flexor strain', 'Lumbar extension intolerance'],
      precautions: ['Back pain - pillow under pelvis', 'Neck strain - turn head'],
      redFlags: ['Radiating pain', 'Back pain increase'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Gluteal musculature',
      targetStructure: 'Gluteus maximus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['No weight', 'Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement', 'Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Pelvis rotation', 'Back extension', 'Hamstring cramping']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Distefano LJ. Gluteal activation. JOSPT, 2009',
      studyType: 'EMG study'
    }
  },

  // ============================================
  // HIP INTERNAL/EXTERNAL ROTATION
  // ============================================
  {
    id: 'hip_internal_rotation_stretch',
    baseName: 'Hip Internal Rotation Stretch',
    baseNameSv: 'Höft Inåtrotation Stretch',
    description: 'Seated or supine stretch for hip internal rotation mobility',
    descriptionSv: 'Sittande eller ryggliggande stretch för höft inåtrotation',
    bodyRegion: 'hip',
    muscleGroups: ['piriformis', 'deep_hip_rotators'],
    jointType: 'hip',
    exerciseType: 'stretch',

    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Sit with knee bent 90 degrees',
      'Keep pelvis level',
      'Rotate lower leg outward (internal rotation)',
      'Keep knee stationary',
      'Feel stretch in outer hip',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Sitt med knät böjt 90 grader',
      'Håll bäckenet i nivå',
      'Rotera underbenet utåt (inåtrotation)',
      'Håll knät stilla',
      'Känn stretch i yttre höften',
      'Håll och andas'
    ],

    techniquePoints: [
      'Move from hip, not knee',
      'Keep pelvis stable',
      'Gentle stretch, no forcing',
      'May feel in deep buttock'
    ],

    safetyData: {
      contraindications: ['Hip impingement - assess first', 'Hip instability'],
      precautions: ['Knee issues - support leg', 'Back pain - maintain posture'],
      redFlags: ['Sharp groin pain', 'Clicking with pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip rotators',
      targetStructure: 'External rotator group',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Reduced range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Pelvis tilt', 'Knee movement']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Enseki K, et al. Hip pain CPG. JOSPT, 2014',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'hip_figure_four_stretch',
    baseName: 'Figure Four Stretch (Piriformis)',
    baseNameSv: 'Fyran Stretch (Piriformis)',
    description: 'Supine stretch targeting piriformis and external rotators',
    descriptionSv: 'Ryggliggande stretch för piriformis och utåtrotatorer',
    bodyRegion: 'hip',
    muscleGroups: ['piriformis', 'gluteus_medius', 'deep_hip_rotators'],
    jointType: 'hip',
    exerciseType: 'stretch',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Lie on back with both knees bent',
      'Cross one ankle over opposite knee',
      'Thread hands through and hold behind thigh',
      'Pull knee toward chest',
      'Keep head on floor',
      'Hold stretch, breathe deeply'
    ],
    instructionsSv: [
      'Ligg på rygg med båda knäna böjda',
      'Korsa en fotled över motsatt knä',
      'Trä händerna igenom och håll bakom låret',
      'Dra knät mot bröstet',
      'Håll huvudet på golvet',
      'Håll stretchen, andas djupt'
    ],

    techniquePoints: [
      'Push crossed knee away slightly',
      'Keep lower back on floor',
      'Relax neck and shoulders',
      'Feel stretch in deep buttock'
    ],

    safetyData: {
      contraindications: ['Acute sciatica', 'Hip replacement with precautions'],
      precautions: ['Knee issues - modify grip', 'Neck strain - support head'],
      redFlags: ['Radiating leg pain', 'Numbness/tingling'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Piriformis, hip rotators',
      targetStructure: 'Piriformis muscle',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Check hip precautions'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Head lifting', 'Back arching', 'Forcing range']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Tonley JC, et al. Hip muscle imbalance. JOSPT, 2010',
      studyType: 'Clinical study'
    }
  },

  // ============================================
  // FUNCTIONAL HIP EXERCISES
  // ============================================
  {
    id: 'hip_single_leg_stance',
    baseName: 'Single Leg Balance',
    baseNameSv: 'Enbensstående Balans',
    description: 'Balance and proprioception training for hip stability',
    descriptionSv: 'Balans- och proprioceptionsträning för höftstabilitet',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus', 'quadriceps'],
    jointType: 'hip',
    exerciseType: 'balance',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'balance_pad', 'bosu'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,

    instructions: [
      'Stand near wall or support if needed',
      'Lift one foot slightly off floor',
      'Keep standing leg slightly bent',
      'Maintain level pelvis',
      'Focus on a point ahead',
      'Hold position with good posture'
    ],
    instructionsSv: [
      'Stå nära vägg eller stöd vid behov',
      'Lyft en fot lätt från golvet',
      'Håll ståbenet lätt böjt',
      'Behåll bäckenet i nivå',
      'Fokusera på en punkt framåt',
      'Håll positionen med bra hållning'
    ],

    techniquePoints: [
      'Pelvis should stay level',
      'Do not let hip drop',
      'Small corrections are normal',
      'Progress by closing eyes or unstable surface'
    ],

    safetyData: {
      contraindications: ['Acute vertigo', 'Severe balance dysfunction'],
      precautions: ['Fall risk - stay near support', 'Ankle instability - stable surface first'],
      redFlags: ['Falls', 'Severe hip drop', 'Pain with standing'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Hip stabilizers',
      targetStructure: 'Balance and proprioception',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Use support', 'Short duration'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement', 'Knee surgery'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 1,
        maxPainAfter: 0,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Hip drop', 'Trunk lean', 'Grabbing support']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Reiman MP. Hip strengthening meta-analysis. JOSPT, 2012',
      studyType: 'Systematic review'
    }
  },

  {
    id: 'hip_monster_walk',
    baseName: 'Monster Walk',
    baseNameSv: 'Monstergång',
    description: 'Resistance band walking for hip abductor strength',
    descriptionSv: 'Motståndsband-gång för höftabduktorstyrka',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus', 'tensor_fasciae_latae'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,

    instructions: [
      'Place band around ankles or above knees',
      'Stand with feet shoulder-width apart',
      'Maintain slight squat position',
      'Step diagonally forward and out',
      'Keep tension on band throughout',
      'Step forward alternating legs'
    ],
    instructionsSv: [
      'Placera bandet runt fotlederna eller ovanför knäna',
      'Stå med fötterna axelbrett isär',
      'Behåll lätt knäböjsposition',
      'Ta steg diagonalt framåt och ut',
      'Håll spänning på bandet genomgående',
      'Stega framåt med växlande ben'
    ],

    techniquePoints: [
      'Keep knees over toes',
      'Do not let knees cave in',
      'Maintain hip hinge position',
      'Control each step'
    ],

    safetyData: {
      contraindications: ['Acute hip pain', 'Knee instability'],
      precautions: ['Balance issues - near wall', 'Back pain - stay upright'],
      redFlags: ['Knee giving way', 'Sharp hip pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip abductors',
      targetStructure: 'Gluteus medius, gluteus minimus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light band'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement', 'ACL reconstruction'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Knee valgus', 'Trunk lean', 'Loss of squat position']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Distefano LJ. Gluteal muscle activation. JOSPT, 2009',
      studyType: 'EMG study'
    }
  },

  // ============================================
  // ADDUCTOR EXERCISES
  // ============================================
  {
    id: 'hip_adductor_stretch',
    baseName: 'Seated Adductor Stretch (Butterfly)',
    baseNameSv: 'Sittande Adduktorstretch (Fjäril)',
    description: 'Groin stretch in seated position',
    descriptionSv: 'Ljumskstretch i sittande position',
    bodyRegion: 'hip',
    muscleGroups: ['adductors'],
    jointType: 'hip',
    exerciseType: 'stretch',

    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Sit with soles of feet together',
      'Let knees fall out to sides',
      'Hold ankles, not toes',
      'Sit tall with straight spine',
      'Gently press knees down with elbows',
      'Lean forward slightly for more stretch'
    ],
    instructionsSv: [
      'Sitt med fotsulornan ihop',
      'Låt knäna falla ut åt sidorna',
      'Håll i fotlederna, inte tårna',
      'Sitt högt med rak rygg',
      'Tryck försiktigt knäna nedåt med armbågarna',
      'Luta framåt lätt för mer stretch'
    ],

    techniquePoints: [
      'Keep spine straight',
      'Do not round back',
      'Gentle pressure only',
      'Breathe into the stretch'
    ],

    safetyData: {
      contraindications: ['Acute groin strain', 'Pubic symphysis dysfunction'],
      precautions: ['Knee issues - support with pillows', 'Back pain - wall support'],
      redFlags: ['Sharp groin pain', 'Pubic bone pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Adductor group',
      targetStructure: 'Adductor magnus, longus, brevis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle range only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Adductor repair'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Back rounding', 'Forcing knees down']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Tyler TF, et al. Groin injuries. JOSPT, 2014',
      studyType: 'Clinical review'
    }
  },

  {
    id: 'hip_copenhagen_adduction',
    baseName: 'Copenhagen Adduction',
    baseNameSv: 'Köpenhamn Adduktion',
    description: 'Advanced adductor strengthening for groin injury prevention',
    descriptionSv: 'Avancerad adduktorstyrka för förebyggande av ljumskskador',
    bodyRegion: 'hip',
    muscleGroups: ['adductors'],
    jointType: 'hip',
    exerciseType: 'eccentric',

    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],

    baseEquipment: 'bench',
    allowedEquipment: ['bench', 'chair'],

    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 6, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 60,

    instructions: [
      'Side plank position with top leg on bench',
      'Bottom leg hangs free',
      'Lift bottom leg to meet top leg',
      'Keep body in straight line',
      'Lower with control',
      'Maintain hip alignment'
    ],
    instructionsSv: [
      'Sidoplankposition med övre benet på bänk',
      'Undre benet hänger fritt',
      'Lyft undre benet till övre benet',
      'Håll kroppen i rak linje',
      'Sänk med kontroll',
      'Behåll höftlinjeringen'
    ],

    techniquePoints: [
      'Keep hips stacked',
      'Do not rotate pelvis',
      'Control eccentric phase',
      'Start with bent knee variation if needed'
    ],

    safetyData: {
      contraindications: ['Acute groin strain', 'Hip instability', 'Shoulder injury'],
      precautions: ['Build up gradually', 'Master short lever first'],
      redFlags: ['Sharp adductor pain', 'Hip giving way'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Adductor group',
      targetStructure: 'Adductor longus, magnus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Short lever version'] }
      ],
      appropriateForSurgeries: ['Adductor repair'],

      progressionCriteria: {
        minPainFreeReps: 10,
        minConsecutiveDays: 7,
        maxPainDuring: 2,
        maxPainAfter: 2,
        formScore: 90
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Pelvis rotation', 'Hip drop', 'Trunk lean']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Harøy J, et al. Copenhagen adduction exercise. BJSM, 2019',
      studyType: 'RCT'
    }
  },

  // ============================================
  // GLUTE BRIDGE VARIATIONS
  // ============================================
  {
    id: 'hip_glute_bridge',
    baseName: 'Glute Bridge',
    baseNameSv: 'Glutebrygga',
    description: 'Basic hip extension with gluteal focus',
    descriptionSv: 'Grundläggande höftextension med glutealfokus',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Lie on back with knees bent', 'Feet hip-width apart', 'Drive through heels', 'Lift hips to ceiling', 'Squeeze glutes at top', 'Lower with control'],
    instructionsSv: ['Ligg på rygg med böjda knän', 'Fötterna höftbrett isär', 'Tryck genom hälarna', 'Lyft höfterna mot taket', 'Kläm ihop sätet i toppen', 'Sänk med kontroll'],
    techniquePoints: ['Do not hyperextend back', 'Feel glutes, not hamstrings', 'Keep core engaged'],
    safetyData: {
      contraindications: ['Acute back pain'],
      precautions: ['Lower back issues - reduce range'],
      redFlags: ['Back pain', 'Cramping'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Gluteal musculature', targetStructure: 'Gluteus maximus',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Hamstring dominance'] }
    },
    evidenceBase: { level: 'A', source: 'Reiman MP. Hip muscle activation. JOSPT, 2012', studyType: 'Systematic review' }
  },

  {
    id: 'hip_single_leg_bridge',
    baseName: 'Single Leg Glute Bridge',
    baseNameSv: 'Enbens Glutebrygga',
    description: 'Unilateral hip extension for strength and stability',
    descriptionSv: 'Unilateral höftextension för styrka och stabilitet',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'gluteus_medius'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: ['Lie on back with one knee bent', 'Extend other leg straight', 'Drive through heel', 'Lift hips keeping pelvis level', 'Squeeze glute at top', 'Lower with control'],
    instructionsSv: ['Ligg på rygg med ett knä böjt', 'Sträck andra benet rakt', 'Tryck genom hälen', 'Lyft höfterna med bäckenet i nivå', 'Kläm ihop sätet i toppen', 'Sänk med kontroll'],
    techniquePoints: ['Keep pelvis level', 'No rotation', 'Core engaged'],
    safetyData: {
      contraindications: ['Acute back pain', 'Hip instability'],
      precautions: ['Master bilateral first'],
      redFlags: ['Pelvis dropping', 'Back pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Gluteal musculature', targetStructure: 'Gluteus maximus',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Pelvis rotation', 'Back arching'] }
    },
    evidenceBase: { level: 'A', source: 'Distefano LJ. Gluteal activation. JOSPT, 2009', studyType: 'EMG study' }
  },

  {
    id: 'hip_banded_bridge',
    baseName: 'Banded Glute Bridge',
    baseNameSv: 'Glutebrygga med Band',
    description: 'Resistance band bridge for increased glute med activation',
    descriptionSv: 'Motståndsband brygga för ökad glute med-aktivering',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'gluteus_medius'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Place band above knees', 'Lie on back with knees bent', 'Push knees out against band', 'Lift hips while maintaining outward pressure', 'Hold at top', 'Lower with control'],
    instructionsSv: ['Placera band ovanför knäna', 'Ligg på rygg med böjda knän', 'Tryck ut knäna mot bandet', 'Lyft höfterna med bibehållet utåttryck', 'Håll i toppen', 'Sänk med kontroll'],
    techniquePoints: ['Constant tension on band', 'No knee collapse', 'Squeeze glutes'],
    safetyData: {
      contraindications: ['Knee pain with band'],
      precautions: ['Start light resistance'],
      redFlags: ['Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Gluteal musculature', targetStructure: 'Gluteus maximus and medius',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light band'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee valgus'] }
    },
    evidenceBase: { level: 'A', source: 'Cambridge EDJ. Band activation. IJSPT, 2012', studyType: 'EMG study' }
  },

  // ============================================
  // HIP HINGE EXERCISES
  // ============================================
  {
    id: 'hip_hinge_pattern',
    baseName: 'Hip Hinge',
    baseNameSv: 'Höftgångjärn',
    description: 'Foundational hip hinge movement pattern',
    descriptionSv: 'Grundläggande höftgångjärnsrörelse',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'erector_spinae'],
    jointType: 'hip',
    exerciseType: 'motor_control',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dowel'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Stand with feet hip-width', 'Place hands on hips', 'Push hips back', 'Keep spine neutral', 'Slight knee bend', 'Return by driving hips forward'],
    instructionsSv: ['Stå med fötterna höftbrett', 'Placera händerna på höfterna', 'Skjut höfterna bakåt', 'Behåll neutral rygg', 'Lätt knäböjning', 'Återgå genom att driva höfterna framåt'],
    techniquePoints: ['Spine stays neutral', 'Weight in heels', 'Feel hamstring stretch'],
    safetyData: {
      contraindications: ['Acute back pain'],
      precautions: ['Back issues - limit depth'],
      redFlags: ['Back pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Posterior chain', targetStructure: 'Hip hinge pattern',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Limited range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Knee dominant'] }
    },
    evidenceBase: { level: 'B', source: 'Sahrmann S. Movement System Impairment Syndromes. Mosby, 2010', studyType: 'Clinical framework' }
  },

  {
    id: 'hip_romanian_deadlift',
    baseName: 'Romanian Deadlift',
    baseNameSv: 'Rumänsk Marklyft',
    description: 'Hip hinge with external load for posterior chain',
    descriptionSv: 'Höftgångjärn med extern belastning för bakre kedjan',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'erector_spinae'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'dumbbell',
    allowedEquipment: ['dumbbell', 'barbell', 'kettlebell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand with weights in front of thighs', 'Push hips back', 'Lower weights along legs', 'Keep spine neutral', 'Feel hamstring stretch', 'Drive hips forward to stand'],
    instructionsSv: ['Stå med vikter framför låren', 'Skjut höfterna bakåt', 'Sänk vikterna längs benen', 'Behåll neutral rygg', 'Känn hamstringsstretch', 'Driv höfterna framåt för att stå'],
    techniquePoints: ['Bar stays close to legs', 'Neutral spine', 'Hip drive to stand'],
    safetyData: {
      contraindications: ['Acute back injury', 'Hamstring tear'],
      precautions: ['Start light', 'Master pattern first'],
      redFlags: ['Back pain', 'Sharp hamstring pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Posterior chain', targetStructure: 'Hamstrings, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Knee dominant'] }
    },
    evidenceBase: { level: 'B', source: 'Schoenfeld BJ. Posterior chain. JSCR, 2015', studyType: 'EMG analysis' }
  },

  {
    id: 'hip_single_leg_rdl',
    baseName: 'Single Leg Romanian Deadlift',
    baseNameSv: 'Enbens Rumänsk Marklyft',
    description: 'Unilateral hip hinge for strength and balance',
    descriptionSv: 'Unilateral höftgångjärn för styrka och balans',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'gluteus_medius'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell', 'kettlebell'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 10 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on one leg', 'Hinge at hip, extending free leg back', 'Keep hips square', 'Lower until parallel or stretch limit', 'Return to standing', 'Maintain balance'],
    instructionsSv: ['Stå på ett ben', 'Fäll framåt vid höften, sträck fria benet bakåt', 'Håll höfterna raka', 'Sänk tills parallell eller stretchgräns', 'Återgå till stående', 'Bibehåll balansen'],
    techniquePoints: ['Hips stay square', 'Core engaged', 'Control throughout'],
    safetyData: {
      contraindications: ['Acute hip pain', 'Balance issues'],
      precautions: ['Start without weight', 'Near wall for support'],
      redFlags: ['Loss of balance', 'Hip pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip stabilizers', targetStructure: 'Gluteal complex',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['No weight, support available'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Reiman MP. Unilateral hip exercises. JOSPT, 2012', studyType: 'Systematic review' }
  },

  // ============================================
  // SQUAT VARIATIONS
  // ============================================
  {
    id: 'hip_bodyweight_squat',
    baseName: 'Bodyweight Squat',
    baseNameSv: 'Knäböj utan Vikt',
    description: 'Fundamental squat pattern for hip and knee function',
    descriptionSv: 'Grundläggande knäböjsmönster för höft- och knäfunktion',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand feet shoulder-width', 'Arms out front for balance', 'Sit back and down', 'Knees track over toes', 'Descend to comfortable depth', 'Stand by pushing through heels'],
    instructionsSv: ['Stå med fötterna axelbrett', 'Armarna framför för balans', 'Sätt dig bakåt och ner', 'Knäna följer tårna', 'Sänk till bekvämt djup', 'Stå genom att trycka genom hälarna'],
    techniquePoints: ['Chest up', 'Weight through heels', 'Knees over toes'],
    safetyData: {
      contraindications: ['Acute knee injury'],
      precautions: ['Knee pain - limit depth'],
      redFlags: ['Knee pain', 'Back pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Functional pattern',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial range, chair assist'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Knee surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Forward lean'] }
    },
    evidenceBase: { level: 'A', source: 'Escamilla RF. Knee biomechanics. MSSE, 2001', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'hip_goblet_squat',
    baseName: 'Goblet Squat',
    baseNameSv: 'Bägarknäböj',
    description: 'Front-loaded squat for improved mechanics',
    descriptionSv: 'Frambelastad knäböj för förbättrad teknik',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'core'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'dumbbell',
    allowedEquipment: ['dumbbell', 'kettlebell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Hold weight at chest level', 'Elbows pointing down', 'Squat down between legs', 'Keep chest up', 'Push elbows inside knees', 'Stand through heels'],
    instructionsSv: ['Håll vikten vid brösthöjd', 'Armbågarna pekar nedåt', 'Squat ner mellan benen', 'Håll bröstet uppe', 'Tryck armbågarna innanför knäna', 'Stå genom hälarna'],
    techniquePoints: ['Weight helps counterbalance', 'Deep squat', 'Upright torso'],
    safetyData: {
      contraindications: ['Severe knee arthritis'],
      precautions: ['Shoulder issues - lighter weight'],
      redFlags: ['Knee pain', 'Back pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Quadriceps, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Forward lean', 'Knee valgus'] }
    },
    evidenceBase: { level: 'B', source: 'Cook G. Athletic Body in Balance. Human Kinetics, 2003', studyType: 'Clinical framework' }
  },

  {
    id: 'hip_sumo_squat',
    baseName: 'Sumo Squat',
    baseNameSv: 'Sumoknäböj',
    description: 'Wide stance squat emphasizing adductors and glutes',
    descriptionSv: 'Bred knäböj med fokus på adduktorer och gluteus',
    bodyRegion: 'hip',
    muscleGroups: ['adductors', 'gluteus_maximus', 'quadriceps'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell', 'kettlebell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Wide stance, toes turned out', 'Lower by bending knees', 'Knees track over toes', 'Keep torso upright', 'Push through heels to stand', 'Squeeze glutes at top'],
    instructionsSv: ['Bred ställning, tårna utåt', 'Sänk genom att böja knäna', 'Knäna följer tårna', 'Håll överkroppen upprätt', 'Tryck genom hälarna för att stå', 'Kläm ihop gluteus i toppen'],
    techniquePoints: ['Knees track over toes', 'Upright torso', 'Feel inner thigh'],
    safetyData: {
      contraindications: ['Groin strain', 'Hip impingement'],
      precautions: ['Limited hip mobility - reduce width'],
      redFlags: ['Groin pain', 'Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip musculature', targetStructure: 'Adductors, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Narrow stance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee cave', 'Forward lean'] }
    },
    evidenceBase: { level: 'B', source: 'McCaw ST. Stance width effects. MSSE, 1999', studyType: 'Biomechanical study' }
  },

  // ============================================
  // LUNGE VARIATIONS
  // ============================================
  {
    id: 'hip_forward_lunge',
    baseName: 'Forward Lunge',
    baseNameSv: 'Utfallssteg Framåt',
    description: 'Dynamic unilateral lower body exercise',
    descriptionSv: 'Dynamisk unilateral underkroppsövning',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand tall', 'Step forward with one leg', 'Lower until both knees at 90°', 'Keep torso upright', 'Push through front heel to return', 'Alternate legs'],
    instructionsSv: ['Stå rakt', 'Ta ett steg framåt med ett ben', 'Sänk tills båda knäna är i 90°', 'Håll överkroppen upprätt', 'Tryck genom främre hälen för att återgå', 'Växla ben'],
    techniquePoints: ['Front knee over ankle', 'Back knee toward floor', 'Upright torso'],
    safetyData: {
      contraindications: ['Acute knee injury', 'Balance issues'],
      precautions: ['Knee pain - reduce depth'],
      redFlags: ['Knee pain', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Quadriceps, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Farrokhi S. Lunge biomechanics. Clin Biomech, 2008', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'hip_reverse_lunge',
    baseName: 'Reverse Lunge',
    baseNameSv: 'Utfallssteg Bakåt',
    description: 'Backward lunge for reduced knee stress',
    descriptionSv: 'Bakåt utfallssteg för minskad knäbelastning',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'quadriceps', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand tall', 'Step backward with one leg', 'Lower until both knees at 90°', 'Keep torso upright', 'Push through front heel to return', 'Alternate legs'],
    instructionsSv: ['Stå rakt', 'Ta ett steg bakåt med ett ben', 'Sänk tills båda knäna är i 90°', 'Håll överkroppen upprätt', 'Tryck genom främre hälen för att återgå', 'Växla ben'],
    techniquePoints: ['More glute emphasis', 'Less knee shear', 'Control the step back'],
    safetyData: {
      contraindications: ['Acute hip pain'],
      precautions: ['Balance issues - near support'],
      redFlags: ['Hip pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Glutes, quads',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Knee surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk lean', 'Knee valgus'] }
    },
    evidenceBase: { level: 'B', source: 'Farrokhi S. Lunge variations. Clin Biomech, 2008', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'hip_lateral_lunge',
    baseName: 'Lateral Lunge',
    baseNameSv: 'Sidoutfall',
    description: 'Side lunge for frontal plane hip strength',
    descriptionSv: 'Sidoutfall för frontalplanets höftstyrka',
    bodyRegion: 'hip',
    muscleGroups: ['adductors', 'gluteus_maximus', 'quadriceps'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand with feet together', 'Step wide to one side', 'Bend stepping leg, keep other straight', 'Push hips back', 'Push through heel to return', 'Alternate sides'],
    instructionsSv: ['Stå med fötterna ihop', 'Ta ett brett steg åt sidan', 'Böj stegbenet, håll andra rakt', 'Skjut höfterna bakåt', 'Tryck genom hälen för att återgå', 'Växla sidor'],
    techniquePoints: ['Keep chest up', 'Hip hinge pattern', 'Feel adductor stretch'],
    safetyData: {
      contraindications: ['Groin strain', 'Hip impingement'],
      precautions: ['Limited mobility - reduce range'],
      redFlags: ['Groin pain', 'Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip musculature', targetStructure: 'Adductors, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Small range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Forward lean'] }
    },
    evidenceBase: { level: 'B', source: 'Cronin J. Lateral movement training. JSCR, 2003', studyType: 'EMG study' }
  },

  {
    id: 'hip_split_squat',
    baseName: 'Split Squat',
    baseNameSv: 'Delad Knäböj',
    description: 'Static lunge position for unilateral strength',
    descriptionSv: 'Statisk utfallsposition för unilateral styrka',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand in split stance', 'Front foot flat, back foot on toes', 'Lower straight down', 'Both knees to 90°', 'Push through front heel', 'Repeat all reps before switching'],
    instructionsSv: ['Stå i delad ställning', 'Främre foten platt, bakre på tårna', 'Sänk rakt ner', 'Båda knäna till 90°', 'Tryck genom främre hälen', 'Upprepa alla reps innan byte'],
    techniquePoints: ['Vertical torso', 'Front knee over ankle', 'Control the movement'],
    safetyData: {
      contraindications: ['Acute knee pain'],
      precautions: ['Balance support if needed'],
      redFlags: ['Knee pain', 'Hip pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Quads, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial depth'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Knee surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Ebben WP. Split squat mechanics. JSCR, 2009', studyType: 'Biomechanical analysis' }
  },

  // ============================================
  // STEP-UP VARIATIONS
  // ============================================
  {
    id: 'hip_step_up',
    baseName: 'Step-Up',
    baseNameSv: 'Steguppstigning',
    description: 'Functional step-up for hip and knee strength',
    descriptionSv: 'Funktionell steguppstigning för höft- och knästyrka',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'bench'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Face step or bench', 'Place one foot fully on step', 'Push through heel to step up', 'Stand tall on top', 'Lower with control', 'Maintain upright posture'],
    instructionsSv: ['Vänd mot steget eller bänken', 'Placera en fot helt på steget', 'Tryck genom hälen för att stiga upp', 'Stå rakt upp', 'Sänk med kontroll', 'Bibehåll upprätt hållning'],
    techniquePoints: ['Drive from top leg only', 'No push from back leg', 'Control descent'],
    safetyData: {
      contraindications: ['Severe knee arthritis'],
      precautions: ['Start with low step'],
      redFlags: ['Knee pain', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Quads, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Low step only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Knee surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Push from back leg', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Escamilla RF. Closed chain exercises. MSSE, 1998', studyType: 'Systematic review' }
  },

  {
    id: 'hip_lateral_step_up',
    baseName: 'Lateral Step-Up',
    baseNameSv: 'Lateral Steguppstigning',
    description: 'Side step-up for frontal plane hip strength',
    descriptionSv: 'Sidosteguppstigning för frontalplanets höftstyrka',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'quadriceps', 'gluteus_maximus'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'bench'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand beside step', 'Place near foot on step', 'Push through heel to step up', 'Control pelvis - no drop', 'Lower with control', 'Repeat all reps before switching'],
    instructionsSv: ['Stå bredvid steget', 'Placera närmaste fot på steget', 'Tryck genom hälen för att stiga upp', 'Kontrollera bäckenet - inget fall', 'Sänk med kontroll', 'Upprepa alla reps innan byte'],
    techniquePoints: ['Level pelvis', 'Hip abductor focus', 'Control descent'],
    safetyData: {
      contraindications: ['Balance issues', 'Hip instability'],
      precautions: ['Near wall for support'],
      redFlags: ['Hip pain', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip stabilizers', targetStructure: 'Gluteus medius',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Low step'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip drop', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Reiman MP. Hip strengthening. JOSPT, 2012', studyType: 'Systematic review' }
  },

  // ============================================
  // HIP ROTATION EXERCISES
  // ============================================
  {
    id: 'hip_90_90_stretch',
    baseName: '90-90 Hip Stretch',
    baseNameSv: '90-90 Höftstretch',
    description: 'Seated stretch for internal and external rotation',
    descriptionSv: 'Sittande stretch för in- och utåtrotation',
    bodyRegion: 'hip',
    muscleGroups: ['piriformis', 'hip_rotators', 'gluteus_medius'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: ['Sit with front leg at 90° to side', 'Back leg at 90° behind you', 'Keep pelvis neutral', 'Lean forward over front shin', 'Feel stretch in outer hip', 'Switch sides'],
    instructionsSv: ['Sitt med främre benet i 90° åt sidan', 'Bakre benet i 90° bakom dig', 'Håll bäckenet neutralt', 'Luta framåt över främre skenbenet', 'Känn stretch i yttre höften', 'Byt sida'],
    techniquePoints: ['Hips square', 'Feel front hip stretch', 'Gentle lean'],
    safetyData: {
      contraindications: ['Hip impingement - modify', 'Knee pain with flexion'],
      precautions: ['Use support if needed'],
      redFlags: ['Sharp hip pain', 'Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip rotators', targetStructure: 'Hip mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Gentle range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Pelvis rotation'] }
    },
    evidenceBase: { level: 'C', source: 'Sahrmann S. Movement System Impairment. Mosby, 2010', studyType: 'Clinical reasoning' }
  },

  {
    id: 'hip_seated_rotation',
    baseName: 'Seated Hip Rotation',
    baseNameSv: 'Sittande Höftrotation',
    description: 'Active rotation for hip mobility',
    descriptionSv: 'Aktiv rotation för höftmobilitet',
    bodyRegion: 'hip',
    muscleGroups: ['hip_rotators', 'piriformis'],
    jointType: 'hip',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'chair',
    allowedEquipment: ['chair', 'bench'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Sit with knee bent 90°', 'Keep thigh still', 'Rotate lower leg inward (internal)', 'Then rotate outward (external)', 'Move only from hip', 'Control the movement'],
    instructionsSv: ['Sitt med knät böjt 90°', 'Håll låret stilla', 'Rotera underbenet inåt (intern)', 'Sedan rotera utåt (extern)', 'Rör endast från höften', 'Kontrollera rörelsen'],
    techniquePoints: ['Thigh stays still', 'Move from hip only', 'Full range both directions'],
    safetyData: {
      contraindications: ['Hip impingement with rotation'],
      precautions: ['Pain-free range only'],
      redFlags: ['Groin pain', 'Clicking with pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Hip joint', targetStructure: 'Hip rotational mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Limited range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Knee movement'] }
    },
    evidenceBase: { level: 'B', source: 'Enseki K. Hip CPG. JOSPT, 2014', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // QUADRUPED HIP EXERCISES
  // ============================================
  {
    id: 'hip_quadruped_hip_circle',
    baseName: 'Quadruped Hip Circle',
    baseNameSv: 'Fyrfota Höftcirkel',
    description: 'Hip mobility in quadruped position',
    descriptionSv: 'Höftmobilitet i fyrfotaposition',
    bodyRegion: 'hip',
    muscleGroups: ['hip_rotators', 'gluteus_medius'],
    jointType: 'hip',
    exerciseType: 'mobility',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: ['Start on hands and knees', 'Lift one knee slightly', 'Make circles with the knee', 'Keep spine neutral', 'Circle both directions', 'Control the movement'],
    instructionsSv: ['Börja på händer och knän', 'Lyft ett knä lätt', 'Gör cirklar med knät', 'Håll ryggen neutral', 'Cirkelrör åt båda hållen', 'Kontrollera rörelsen'],
    techniquePoints: ['Spine stays neutral', 'Move from hip only', 'Smooth circles'],
    safetyData: {
      contraindications: ['Knee pain with kneeling'],
      precautions: ['Use pad under knees'],
      redFlags: ['Hip pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Hip joint', targetStructure: 'Hip mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Small circles'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Spine rotation'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice', studyType: 'Expert opinion' }
  },

  {
    id: 'hip_fire_hydrant',
    baseName: 'Fire Hydrant',
    baseNameSv: 'Brandpost',
    description: 'Quadruped hip abduction for glute med',
    descriptionSv: 'Fyrfota höftabduktion för glute med',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Start on hands and knees', 'Keep knee bent 90°', 'Lift knee out to side', 'Keep spine neutral', 'Do not rotate pelvis', 'Lower with control'],
    instructionsSv: ['Börja på händer och knän', 'Håll knät böjt 90°', 'Lyft knät ut åt sidan', 'Håll ryggen neutral', 'Rotera inte bäckenet', 'Sänk med kontroll'],
    techniquePoints: ['Pelvis stays level', 'Only hip moves', 'Feel glute med'],
    safetyData: {
      contraindications: ['Acute hip bursitis'],
      precautions: ['Knee pad if needed'],
      redFlags: ['Sharp hip pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip abductors', targetStructure: 'Gluteus medius',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Pelvis rotation', 'Back arching'] }
    },
    evidenceBase: { level: 'A', source: 'Distefano LJ. Gluteal activation. JOSPT, 2009', studyType: 'EMG study' }
  },

  {
    id: 'hip_donkey_kick',
    baseName: 'Donkey Kick',
    baseNameSv: 'Åsnespark',
    description: 'Quadruped hip extension for glute max',
    descriptionSv: 'Fyrfota höftextension för glute max',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'ankle_weight'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Start on hands and knees', 'Keep knee bent 90°', 'Push foot toward ceiling', 'Do not arch back', 'Squeeze glute at top', 'Lower with control'],
    instructionsSv: ['Börja på händer och knän', 'Håll knät böjt 90°', 'Tryck foten mot taket', 'Svanka inte ryggen', 'Kläm ihop sätet i toppen', 'Sänk med kontroll'],
    techniquePoints: ['No back extension', 'Lead with heel', 'Feel glute squeeze'],
    safetyData: {
      contraindications: ['Acute back pain'],
      precautions: ['Keep range small if back issues'],
      redFlags: ['Back pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Gluteal muscles', targetStructure: 'Gluteus maximus',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Pelvis rotation'] }
    },
    evidenceBase: { level: 'A', source: 'Distefano LJ. Gluteal activation. JOSPT, 2009', studyType: 'EMG study' }
  },

  // ============================================
  // STANDING HIP EXERCISES
  // ============================================
  {
    id: 'hip_standing_abduction',
    baseName: 'Standing Hip Abduction',
    baseNameSv: 'Stående Höftabduktion',
    description: 'Standing lateral leg raise for hip stability',
    descriptionSv: 'Stående lateral benlyft för höftstabilitet',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'tensor_fasciae_latae'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'resistance_band', 'cable_machine', 'ankle_weight'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Stand near support', 'Keep standing leg slightly bent', 'Lift leg out to side', 'Keep toes forward', 'Do not lean trunk', 'Lower with control'],
    instructionsSv: ['Stå nära stöd', 'Håll ståbenet lätt böjt', 'Lyft benet ut åt sidan', 'Håll tårna framåt', 'Luta inte överkroppen', 'Sänk med kontroll'],
    techniquePoints: ['Stay upright', 'Control the movement', 'Feel hip abductors'],
    safetyData: {
      contraindications: ['Balance issues without support'],
      precautions: ['Use wall for balance'],
      redFlags: ['Hip pain', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip abductors', targetStructure: 'Gluteus medius',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['No resistance, small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk lean', 'Hip hiking'] }
    },
    evidenceBase: { level: 'A', source: 'Reiman MP. Hip strengthening. JOSPT, 2012', studyType: 'Systematic review' }
  },

  {
    id: 'hip_standing_extension',
    baseName: 'Standing Hip Extension',
    baseNameSv: 'Stående Höftextension',
    description: 'Standing backward leg raise for glutes',
    descriptionSv: 'Stående bakåt benlyft för gluteus',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'resistance_band', 'cable_machine', 'ankle_weight'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Stand near support', 'Keep standing leg slightly bent', 'Extend leg backward', 'Squeeze glute', 'Do not arch back', 'Lower with control'],
    instructionsSv: ['Stå nära stöd', 'Håll ståbenet lätt böjt', 'Sträck benet bakåt', 'Kläm ihop sätet', 'Svanka inte ryggen', 'Sänk med kontroll'],
    techniquePoints: ['No back arching', 'Glute squeeze at top', 'Control movement'],
    safetyData: {
      contraindications: ['Acute back pain'],
      precautions: ['Keep range small'],
      redFlags: ['Back pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Gluteal muscles', targetStructure: 'Gluteus maximus',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Hip replacement'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Distefano LJ. Gluteal activation. JOSPT, 2009', studyType: 'EMG study' }
  },

  // ============================================
  // ADDITIONAL STRETCHES
  // ============================================
  {
    id: 'hip_hamstring_stretch_supine',
    baseName: 'Supine Hamstring Stretch',
    baseNameSv: 'Liggande Hamstringsstretch',
    description: 'Safe hamstring stretch in supine position',
    descriptionSv: 'Säker hamstringsstretch i ryggläge',
    bodyRegion: 'hip',
    muscleGroups: ['hamstrings'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'strap', 'towel'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: ['Lie on back', 'Lift one leg straight up', 'Use strap around foot if needed', 'Keep knee straight', 'Feel stretch behind thigh', 'Hold and breathe'],
    instructionsSv: ['Ligg på rygg', 'Lyft ett ben rakt upp', 'Använd rem runt foten vid behov', 'Håll knät rakt', 'Känn stretch bakom låret', 'Håll och andas'],
    techniquePoints: ['Keep other leg down', 'Knee can bend slightly', 'No forcing'],
    safetyData: {
      contraindications: ['Acute hamstring strain'],
      precautions: ['Recent strain - gentle only'],
      redFlags: ['Sharp pain', 'Shooting pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hamstrings', targetStructure: 'Hamstring flexibility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Knee surgery', 'Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Forcing range'] }
    },
    evidenceBase: { level: 'B', source: 'Bandy WD. Hamstring stretching. PTRS, 1997', studyType: 'RCT' }
  },

  {
    id: 'hip_quad_stretch_sidelying',
    baseName: 'Side-Lying Quad Stretch',
    baseNameSv: 'Sidoliggande Quadricepsstretch',
    description: 'Quadriceps stretch in side-lying position',
    descriptionSv: 'Quadricepsstretch i sidoläge',
    bodyRegion: 'hip',
    muscleGroups: ['rectus_femoris', 'quadriceps'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying', 'standing', 'prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'strap'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: ['Lie on side', 'Bend top knee', 'Grab ankle behind you', 'Pull heel toward buttock', 'Keep hips stacked', 'Hold and breathe'],
    instructionsSv: ['Ligg på sidan', 'Böj övre knät', 'Greppa fotleden bakom dig', 'Dra hälen mot skinkan', 'Håll höfterna staplade', 'Håll och andas'],
    techniquePoints: ['No back arching', 'Hips stacked', 'Feel front thigh stretch'],
    safetyData: {
      contraindications: ['Acute quad strain', 'Knee injury'],
      precautions: ['Knee pain - use strap'],
      redFlags: ['Sharp knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps', targetStructure: 'Rectus femoris',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'Knee surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Harvey D. Flexibility assessment. JOSPT, 1998', studyType: 'Clinical assessment' }
  },

  {
    id: 'hip_it_band_stretch',
    baseName: 'IT Band Stretch',
    baseNameSv: 'IT-bandsstretch',
    description: 'Stretch for iliotibial band and lateral hip',
    descriptionSv: 'Stretch för iliotibialband och lateral höft',
    bodyRegion: 'hip',
    muscleGroups: ['tensor_fasciae_latae', 'gluteus_medius'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'standing',
    allowedPositions: ['standing', 'side_lying'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: ['Stand near wall', 'Cross leg behind the other', 'Lean hip toward wall', 'Feel stretch on outer hip', 'Keep shoulders level', 'Hold and breathe'],
    instructionsSv: ['Stå nära vägg', 'Korsa benet bakom det andra', 'Luta höften mot väggen', 'Känn stretch på yttre höften', 'Håll axlarna i nivå', 'Håll och andas'],
    techniquePoints: ['Hip pushes out', 'Stay tall', 'Feel lateral stretch'],
    safetyData: {
      contraindications: ['Acute lateral hip pain'],
      precautions: ['Balance issues - use support'],
      redFlags: ['Sharp pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'IT band complex', targetStructure: 'Tensor fasciae latae',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'IT band release'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Trunk side-bending'] }
    },
    evidenceBase: { level: 'C', source: 'Fredericson M. IT band syndrome. CJSM, 2000', studyType: 'Clinical review' }
  },

  // ============================================
  // FUNCTIONAL HIP EXERCISES
  // ============================================
  {
    id: 'hip_banded_lateral_walk',
    baseName: 'Banded Lateral Walk',
    baseNameSv: 'Sidogång med Band',
    description: 'Resistance band side-stepping for hip stability',
    descriptionSv: 'Motståndsband-sidosteg för höftstabilitet',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Place band around ankles', 'Stand with slight squat', 'Step sideways leading with one foot', 'Follow with other foot', 'Maintain band tension', 'Repeat other direction'],
    instructionsSv: ['Placera band runt fotlederna', 'Stå med lätt knäböjning', 'Stega åt sidan med en fot först', 'Följ med andra foten', 'Bibehåll bandspänning', 'Upprepa åt andra hållet'],
    techniquePoints: ['Constant tension', 'Knees over toes', 'Stay low'],
    safetyData: {
      contraindications: ['Acute hip pain'],
      precautions: ['Start light resistance'],
      redFlags: ['Hip pain', 'Knee valgus'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip stabilizers', targetStructure: 'Gluteus medius',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light band'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy', 'ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee cave', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Cambridge EDJ. Band exercises. IJSPT, 2012', studyType: 'EMG study' }
  },

  {
    id: 'hip_hip_airplane',
    baseName: 'Hip Airplane',
    baseNameSv: 'Höftflygplan',
    description: 'Single leg hip rotation for stability and control',
    descriptionSv: 'Enbens höftrotation för stabilitet och kontroll',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'hip_rotators', 'core'],
    jointType: 'hip',
    exerciseType: 'motor_control',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 6, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on one leg', 'Hinge forward at hip', 'Rotate trunk toward standing leg', 'Then rotate away', 'Keep pelvis level', 'Control throughout'],
    instructionsSv: ['Stå på ett ben', 'Fäll framåt vid höften', 'Rotera överkroppen mot ståbenet', 'Sedan rotera bort', 'Håll bäckenet i nivå', 'Kontroll genomgående'],
    techniquePoints: ['Hip stability is key', 'Slow controlled rotations', 'Level pelvis'],
    safetyData: {
      contraindications: ['Balance issues', 'Acute hip pain'],
      precautions: ['Near wall for support'],
      redFlags: ['Loss of balance', 'Hip pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip stabilizers', targetStructure: 'Hip neuromuscular control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Reduced range'] }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Pelvis drop', 'Loss of balance'] }
    },
    evidenceBase: { level: 'B', source: 'Cook G. Athletic Body in Balance. Human Kinetics, 2003', studyType: 'Clinical framework' }
  },

  {
    id: 'hip_squat_with_reach',
    baseName: 'Squat with Rotational Reach',
    baseNameSv: 'Knäböj med Rotationsräckvidd',
    description: 'Squat with trunk rotation for hip mobility',
    descriptionSv: 'Knäböj med bålrotation för höftmobilitet',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hip_rotators'],
    jointType: 'hip',
    exerciseType: 'mobility',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Squat down deep', 'Reach one arm toward ceiling', 'Rotate trunk toward raised arm', 'Hold briefly', 'Return and switch sides', 'Stay in squat position'],
    instructionsSv: ['Squat ner djupt', 'Sträck en arm mot taket', 'Rotera bålen mot uppsträckt arm', 'Håll kort', 'Återgå och byt sida', 'Stanna i squat-position'],
    techniquePoints: ['Deep squat position', 'Full trunk rotation', 'Heels down'],
    safetyData: {
      contraindications: ['Knee pain with deep squat'],
      precautions: ['Modify depth as needed'],
      redFlags: ['Knee pain', 'Back pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip complex', targetStructure: 'Hip and thoracic mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Shallow squat'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Heels rising', 'Limited rotation'] }
    },
    evidenceBase: { level: 'C', source: 'Cook G. Movement screening. Athletic Body Balance, 2003', studyType: 'Clinical framework' }
  },

  // ============================================
  // ADDITIONAL HIP EXERCISES
  // ============================================
  {
    id: 'hip_adductor_squeeze',
    baseName: 'Adductor Squeeze',
    baseNameSv: 'Adduktorpress',
    bodyRegion: 'hip',
    muscleGroups: ['adductor_magnus', 'adductor_longus', 'adductor_brevis', 'gracilis'],
    exerciseType: 'isometric',
    allowedPositions: ['supine', 'sitting'],
    allowedEquipment: ['ball', 'pillow', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Adductor strain acute', 'Pubic symphysis dysfunction'],
      precautions: ['Groin pain history'],
      redFlags: ['Sharp groin pain', 'Radiating pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Light isometric' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['30 sec hold', 'No pain'],
      regressionTriggers: ['Groin pain', 'Weakness']
    },
    evidenceBase: { level: 'A', source: 'Holmich P. Groin strengthening. BJSM, 2010', studyType: 'RCT' }
  },
  {
    id: 'hip_copenhagen_adductor',
    baseName: 'Copenhagen Adductor Exercise',
    baseNameSv: 'Copenhagen Adduktorövning',
    bodyRegion: 'hip',
    muscleGroups: ['adductor_magnus', 'adductor_longus', 'core'],
    exerciseType: 'eccentric',
    allowedPositions: ['side_lying'],
    allowedEquipment: ['bench', 'chair'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute adductor strain', 'Groin surgery < 8 weeks'],
      precautions: ['Groin pain', 'Core weakness'],
      redFlags: ['Sharp pain', 'Giving way'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Short lever' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['10 reps pain-free', 'Good form'],
      regressionTriggers: ['Groin pain', 'Core collapse']
    },
    evidenceBase: { level: 'A', source: 'Ishøi L. Copenhagen adductor. BJSM, 2017', studyType: 'RCT' }
  },
  {
    id: 'hip_standing_hip_flexion',
    baseName: 'Standing Hip Flexion',
    baseNameSv: 'Stående Höftflexion',
    bodyRegion: 'hip',
    muscleGroups: ['iliopsoas', 'rectus_femoris', 'TFL'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'resistance_band', 'ankle_weight'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Hip flexor strain acute', 'Hip replacement < 6 weeks'],
      precautions: ['Hip impingement'],
      redFlags: ['Anterior hip pain', 'Clicking'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per precautions' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Active only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full ROM', 'Pain-free'],
      regressionTriggers: ['Anterior hip pain', 'Compensation']
    },
    evidenceBase: { level: 'B', source: 'Hip strengthening protocols', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_prone_hip_extension',
    baseName: 'Prone Hip Extension',
    baseNameSv: 'Pronliggande Höftextension',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    exerciseType: 'strengthening',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat', 'ankle_weight'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Low back pain acute', 'Hip replacement precautions'],
      precautions: ['Low back sensitivity'],
      redFlags: ['Low back pain', 'Leg numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Limited range' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Active only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Good glute activation', 'No back arching'],
      regressionTriggers: ['Low back pain', 'Hamstring dominance']
    },
    evidenceBase: { level: 'A', source: 'Gluteus maximus activation studies', studyType: 'EMG study' }
  },
  {
    id: 'hip_donkey_kick',
    baseName: 'Donkey Kick',
    baseNameSv: 'Åsnespark',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    exerciseType: 'strengthening',
    allowedPositions: ['quadruped'],
    allowedEquipment: ['none', 'resistance_band', 'ankle_weight'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Wrist injury', 'Low back pain severe'],
      precautions: ['Use fists if wrist pain'],
      redFlags: ['Low back pain', 'Hip pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Small range' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Glute activation', 'No back arching'],
      regressionTriggers: ['Back arching', 'Hip flexor pain']
    },
    evidenceBase: { level: 'B', source: 'Glute activation exercises', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_fire_hydrant',
    baseName: 'Fire Hydrant',
    baseNameSv: 'Brandsläckaren',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus', 'TFL'],
    exerciseType: 'strengthening',
    allowedPositions: ['quadruped'],
    allowedEquipment: ['none', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Hip labral tear acute', 'Wrist injury'],
      precautions: ['Hip impingement'],
      redFlags: ['Clicking with pain', 'Groin pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Limited range' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full ROM', 'Good control'],
      regressionTriggers: ['Hip pain', 'Trunk rotation']
    },
    evidenceBase: { level: 'B', source: 'Hip abductor strengthening', studyType: 'EMG study' }
  },
  {
    id: 'hip_glute_bridge',
    baseName: 'Glute Bridge',
    baseNameSv: 'Glutebrygga',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'core'],
    exerciseType: 'strengthening',
    allowedPositions: ['supine'],
    allowedEquipment: ['none', 'resistance_band', 'weight'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Hip precautions active'],
      precautions: ['Low back pain'],
      redFlags: ['Cramping', 'Back pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Small range' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Full range, no weight' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['20 reps', 'Good form'],
      regressionTriggers: ['Hamstring cramping', 'Back pain']
    },
    evidenceBase: { level: 'A', source: 'Gluteus maximus activation', studyType: 'EMG study' }
  },
  {
    id: 'hip_single_leg_bridge',
    baseName: 'Single Leg Glute Bridge',
    baseNameSv: 'Enbens Glutebrygga',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'core'],
    exerciseType: 'strengthening',
    allowedPositions: ['supine'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Hip instability', 'Hamstring strain'],
      precautions: ['Low back sensitivity'],
      redFlags: ['Hamstring cramping', 'Back pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Bilateral only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Single leg allowed' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['15 reps each side', 'Level pelvis'],
      regressionTriggers: ['Pelvis drop', 'Hamstring dominance']
    },
    evidenceBase: { level: 'A', source: 'Single leg hip exercises', studyType: 'EMG study' }
  },
  {
    id: 'hip_hip_thrust',
    baseName: 'Hip Thrust',
    baseNameSv: 'Höftlyft',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'core'],
    exerciseType: 'strengthening',
    allowedPositions: ['supine'],
    allowedEquipment: ['bench', 'barbell', 'dumbbell', 'resistance_band'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Acute hip injury', 'Hip precautions'],
      precautions: ['Low back pain'],
      redFlags: ['Back pain', 'Hip pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Bodyweight only' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Light weight' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Good form', 'No back pain'],
      regressionTriggers: ['Back arching', 'Hip pain']
    },
    evidenceBase: { level: 'A', source: 'Contreras B. Hip thrust activation. JSCR, 2015', studyType: 'EMG study' }
  },
  {
    id: 'hip_90_90_stretch',
    baseName: '90/90 Hip Stretch',
    baseNameSv: '90/90 Höftstretch',
    bodyRegion: 'hip',
    muscleGroups: ['hip_rotators', 'piriformis', 'gluteus_medius'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Hip labral tear', 'Knee injury'],
      precautions: ['Hip impingement'],
      redFlags: ['Groin pain', 'Knee pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Upright torso', 'No pain'],
      regressionTriggers: ['Hip pain', 'Knee pain']
    },
    evidenceBase: { level: 'B', source: 'Hip mobility literature', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_pigeon_stretch',
    baseName: 'Pigeon Stretch',
    baseNameSv: 'Duvans Position',
    bodyRegion: 'hip',
    muscleGroups: ['piriformis', 'gluteus_medius', 'hip_external_rotators'],
    exerciseType: 'stretch',
    allowedPositions: ['prone', 'kneeling'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Knee injury', 'Hip labral tear'],
      precautions: ['Hip impingement', 'Knee sensitivity'],
      redFlags: ['Knee pain', 'Groin pinching'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Modified version' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Deep stretch', 'No pain'],
      regressionTriggers: ['Knee pain', 'Hip pinching']
    },
    evidenceBase: { level: 'B', source: 'Yoga-based hip stretches', studyType: 'Clinical practice' }
  },
  {
    id: 'hip_figure_4_stretch',
    baseName: 'Figure 4 Stretch',
    baseNameSv: 'Figur 4 Stretch',
    bodyRegion: 'hip',
    muscleGroups: ['piriformis', 'gluteus_medius', 'hip_external_rotators'],
    exerciseType: 'stretch',
    allowedPositions: ['supine', 'sitting'],
    allowedEquipment: ['none', 'mat', 'chair'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Knee injury', 'Hip replacement precautions'],
      precautions: ['Hip flexor tightness'],
      redFlags: ['Knee pain', 'Groin pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per precautions' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Deep stretch', 'Relaxed'],
      regressionTriggers: ['Knee pain', 'Hip pain']
    },
    evidenceBase: { level: 'B', source: 'Piriformis stretching', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_frog_stretch',
    baseName: 'Frog Stretch',
    baseNameSv: 'Grodans Stretch',
    bodyRegion: 'hip',
    muscleGroups: ['adductors', 'hip_internal_rotators'],
    exerciseType: 'stretch',
    allowedPositions: ['quadruped', 'prone'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Groin strain', 'Hip labral tear'],
      precautions: ['Knee pain'],
      redFlags: ['Sharp groin pain', 'Knee pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Deep stretch', 'No groin pain'],
      regressionTriggers: ['Groin pain', 'Knee discomfort']
    },
    evidenceBase: { level: 'C', source: 'Adductor stretching', studyType: 'Clinical practice' }
  },
  {
    id: 'hip_hip_flexor_stretch_kneeling',
    baseName: 'Kneeling Hip Flexor Stretch',
    baseNameSv: 'Knästående Höftflexorstretch',
    bodyRegion: 'hip',
    muscleGroups: ['iliopsoas', 'rectus_femoris', 'TFL'],
    exerciseType: 'stretch',
    allowedPositions: ['kneeling', 'half_kneeling'],
    allowedEquipment: ['none', 'mat', 'cushion'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Knee injury unable to kneel', 'Hip replacement precautions'],
      precautions: ['Knee pad if needed'],
      redFlags: ['Knee pain', 'Back pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per precautions' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Full stretch', 'No back arching'],
      regressionTriggers: ['Back arching', 'Knee pain']
    },
    evidenceBase: { level: 'A', source: 'Hip flexor stretching studies', studyType: 'Clinical trial' }
  },
  {
    id: 'hip_single_leg_deadlift',
    baseName: 'Single Leg Deadlift',
    baseNameSv: 'Enbens Marklyft',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'core'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'dumbbell', 'kettlebell'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Balance issues severe', 'Acute hamstring strain'],
      precautions: ['Near wall for support'],
      redFlags: ['Back pain', 'Hamstring strain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Bodyweight only' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Light weight' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Good balance', 'Hip hinge pattern'],
      regressionTriggers: ['Loss of balance', 'Back rounding']
    },
    evidenceBase: { level: 'A', source: 'Hip hinge exercise studies', studyType: 'EMG study' }
  },
  {
    id: 'hip_goblet_squat',
    baseName: 'Goblet Squat',
    baseNameSv: 'Bägarsquat',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'core'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['kettlebell', 'dumbbell'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Knee pain with squatting', 'Hip pain'],
      precautions: ['Depth as tolerated'],
      redFlags: ['Knee pain', 'Hip pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Bodyweight squat' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light goblet' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full depth', 'Heels down'],
      regressionTriggers: ['Knee cave', 'Heels rising']
    },
    evidenceBase: { level: 'B', source: 'Squat variations', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_sumo_squat',
    baseName: 'Sumo Squat',
    baseNameSv: 'Sumosquat',
    bodyRegion: 'hip',
    muscleGroups: ['adductors', 'gluteus_maximus', 'quadriceps'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'dumbbell', 'kettlebell'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Groin strain', 'Hip labral tear'],
      precautions: ['Hip impingement'],
      redFlags: ['Groin pain', 'Hip clicking'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Bodyweight' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Light weight' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Deep squat', 'Knees tracking'],
      regressionTriggers: ['Knee cave', 'Groin pain']
    },
    evidenceBase: { level: 'B', source: 'Wide stance squat studies', studyType: 'EMG study' }
  },
  {
    id: 'hip_lateral_lunge',
    baseName: 'Lateral Lunge',
    baseNameSv: 'Lateral Utfall',
    bodyRegion: 'hip',
    muscleGroups: ['adductors', 'gluteus_medius', 'quadriceps'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'dumbbell'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Groin strain', 'Knee injury'],
      precautions: ['Hip impingement'],
      redFlags: ['Knee pain', 'Groin pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Small range' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Deep lunge', 'Good control'],
      regressionTriggers: ['Knee cave', 'Loss of balance']
    },
    evidenceBase: { level: 'B', source: 'Lateral movement training', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_step_up',
    baseName: 'Step Up',
    baseNameSv: 'Uppsteg',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'quadriceps', 'core'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['step', 'bench', 'box'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Balance issues', 'Knee injury severe'],
      precautions: ['Start with low step'],
      redFlags: ['Knee pain', 'Loss of balance'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Low step' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive height' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full step', 'Good control'],
      regressionTriggers: ['Knee cave', 'Trunk lean']
    },
    evidenceBase: { level: 'A', source: 'Step-up biomechanics', studyType: 'Biomechanical study' }
  },
  {
    id: 'hip_monster_walk',
    baseName: 'Monster Walk',
    baseNameSv: 'Monstergång',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus', 'TFL'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['IT band syndrome severe'],
      precautions: ['Hip pain'],
      redFlags: ['IT band pain', 'Hip snapping'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Light band' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled walking', 'No trunk sway'],
      regressionTriggers: ['Trunk lean', 'IT band pain']
    },
    evidenceBase: { level: 'A', source: 'Gluteus medius activation', studyType: 'EMG study' }
  },
  {
    id: 'hip_bulgarian_split_squat',
    baseName: 'Bulgarian Split Squat',
    baseNameSv: 'Bulgarisk Split Squat',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hip_flexors'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['bench', 'dumbbell', 'barbell'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Balance issues', 'Knee injury severe'],
      precautions: ['Start bodyweight'],
      redFlags: ['Knee pain', 'Hip flexor strain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Bodyweight' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Light weight' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Good depth', 'Controlled motion'],
      regressionTriggers: ['Knee cave', 'Loss of balance']
    },
    evidenceBase: { level: 'A', source: 'Split squat biomechanics', studyType: 'Biomechanical study' }
  },
  // FAI/Hip Impingement Specific
  {
    id: 'hip_fai_flexion_mobilization',
    baseName: 'FAI Flexion Mobilization',
    baseNameSv: 'FAI Flexionsmobilisering',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'joint_capsule'],
    exerciseType: 'mobilization',
    allowedPositions: ['supine', 'sitting'],
    allowedEquipment: ['none', 'strap', 'mobilization_band'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Severe FAI', 'Labral tear acute'],
      precautions: ['Pain-free range only', 'No forcing'],
      redFlags: ['Sharp pinching pain', 'Clicking'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Gentle, therapist guided' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'As tolerated' }
      ],
      progressionCriteria: ['Pain-free ROM increase'],
      regressionTriggers: ['Pinching pain', 'Groin pain']
    },
    evidenceBase: { level: 'B', source: 'FAI conservative management. Griffin DR, BJSM 2016', studyType: 'Consensus statement' }
  },
  {
    id: 'hip_fai_lateral_distraction',
    baseName: 'Hip Lateral Distraction',
    baseNameSv: 'Höft Lateral Distraktion',
    bodyRegion: 'hip',
    muscleGroups: ['joint_capsule', 'ligaments'],
    exerciseType: 'mobilization',
    allowedPositions: ['supine', 'side_lying'],
    allowedEquipment: ['mobilization_band', 'strap'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Hip instability', 'Hypermobility', 'Recent surgery'],
      precautions: ['Gentle force only'],
      redFlags: ['Joint pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Very gentle' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Improved joint mobility'],
      regressionTriggers: ['Joint pain', 'Instability']
    },
    evidenceBase: { level: 'B', source: 'Joint mobilization techniques. Maitland 2013', studyType: 'Clinical guideline' }
  },
  // Hip Labral Rehabilitation
  {
    id: 'hip_labral_deep_hip_rotator_activation',
    baseName: 'Deep Hip Rotator Activation',
    baseNameSv: 'Djup Höftrotator Aktivering',
    bodyRegion: 'hip',
    muscleGroups: ['piriformis', 'obturator_internus', 'gemelli', 'quadratus_femoris'],
    exerciseType: 'activation',
    allowedPositions: ['side_lying', 'prone'],
    allowedEquipment: ['none', 'resistance_band_light'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute labral tear', 'Hip instability'],
      precautions: ['Small range', 'Low load'],
      redFlags: ['Deep hip pain', 'Clicking'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Isometric only' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Small ROM' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled activation', 'No compensation'],
      regressionTriggers: ['Pinching', 'Clicking']
    },
    evidenceBase: { level: 'B', source: 'Hip labral rehabilitation. Enseki KR. JOSPT 2014', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_labral_capsular_stretch',
    baseName: 'Hip Capsular Stretch',
    baseNameSv: 'Höftkapselstretch',
    bodyRegion: 'hip',
    muscleGroups: ['joint_capsule', 'hip_rotators'],
    exerciseType: 'stretch',
    allowedPositions: ['supine', 'sitting', 'quadruped'],
    allowedEquipment: ['none', 'strap', 'foam_roller'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute labral tear', 'Hip dislocation history'],
      precautions: ['Avoid end-range forcing'],
      redFlags: ['Deep joint pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Gentle only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Improved flexibility'],
      regressionTriggers: ['Joint pain', 'Snapping']
    },
    evidenceBase: { level: 'B', source: 'Hip capsule stretching protocols', studyType: 'Clinical practice' }
  },
  // Total Hip Replacement (THR) Specific
  {
    id: 'hip_thr_heel_slides',
    baseName: 'THR Heel Slides',
    baseNameSv: 'THR Hälglid',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'quadriceps'],
    exerciseType: 'mobility',
    allowedPositions: ['supine'],
    allowedEquipment: ['none', 'slider', 'towel'],
    allowedDifficulties: ['beginner'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Hip precautions violated'],
      precautions: ['Maintain hip precautions', 'No > 90° flexion initially'],
      redFlags: ['Pain', 'Instability sensation'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Limited to 60-70° flexion' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Progress to 90°' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Full ROM' },
        { phase: 4, weeksPostOp: '16+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['Pain-free motion'],
      regressionTriggers: ['Pain', 'Swelling']
    },
    evidenceBase: { level: 'A', source: 'THR rehabilitation guidelines. AAOS 2020', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_thr_standing_hip_extension',
    baseName: 'THR Standing Hip Extension',
    baseNameSv: 'THR Stående Höftextension',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'resistance_band_light', 'cable_machine'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Posterior approach precautions active'],
      precautions: ['Support for balance', 'Small ROM initially'],
      redFlags: ['Hip instability', 'Pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Isometric only' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Small ROM, no resistance' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Add light resistance' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Progressive resistance' }
      ],
      progressionCriteria: ['Good balance', 'Pain-free'],
      regressionTriggers: ['Pain', 'Balance issues']
    },
    evidenceBase: { level: 'A', source: 'Post-THR strengthening. Di Monaco M. Archives PMR 2009', studyType: 'Systematic review' }
  },
  {
    id: 'hip_thr_sit_to_stand',
    baseName: 'THR Sit to Stand Training',
    baseNameSv: 'THR Sitt till Stå Träning',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'core'],
    exerciseType: 'functional',
    allowedPositions: ['sitting'],
    allowedEquipment: ['chair', 'elevated_seat', 'armrest'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Weight bearing restrictions'],
      precautions: ['Use arms initially', 'High seat'],
      redFlags: ['Pain', 'Dislocation symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'High seat, arms for assistance' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Standard seat, some arm assist' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'No arms, progress seat height' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Low seat, dynamic variations' }
      ],
      progressionCriteria: ['Independent sit-to-stand'],
      regressionTriggers: ['Pain', 'Compensation']
    },
    evidenceBase: { level: 'A', source: 'THR functional rehabilitation. AAOS guidelines', studyType: 'Clinical guideline' }
  },
  // Greater Trochanteric Pain Syndrome (GTPS)
  {
    id: 'hip_gtps_isometric_abduction',
    baseName: 'GTPS Isometric Abduction',
    baseNameSv: 'GTPS Isometrisk Abduktion',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus'],
    exerciseType: 'isometric',
    allowedPositions: ['standing', 'side_lying'],
    allowedEquipment: ['none', 'wall'],
    allowedDifficulties: ['beginner'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute bursitis flare'],
      precautions: ['Pain-free position', 'Low intensity initially'],
      redFlags: ['Increasing lateral hip pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Very gentle' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Progressive intensity' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Full isometric' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Progress to dynamic' }
      ],
      progressionCriteria: ['Pain-free contraction'],
      regressionTriggers: ['Lateral hip pain']
    },
    evidenceBase: { level: 'A', source: 'GTPS rehabilitation. Mellor R. BMJ 2018 LEAP trial', studyType: 'RCT' }
  },
  {
    id: 'hip_gtps_side_lying_abduction',
    baseName: 'GTPS Side-Lying Abduction',
    baseNameSv: 'GTPS Sidoliggande Abduktion',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus', 'TFL'],
    exerciseType: 'strengthening',
    allowedPositions: ['side_lying'],
    allowedEquipment: ['none', 'ankle_weight'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute bursitis'],
      precautions: ['Avoid compression on trochanter'],
      redFlags: ['Trochanteric pain', 'IT band snapping'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Gravity-assisted only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Against gravity' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Added resistance' }
      ],
      progressionCriteria: ['Pain-free full ROM'],
      regressionTriggers: ['Lateral hip pain', 'Snapping']
    },
    evidenceBase: { level: 'A', source: 'GTPS gluteal strengthening. Mellor LEAP trial 2018', studyType: 'RCT' }
  },
  {
    id: 'hip_gtps_load_management_walking',
    baseName: 'GTPS Load Management Walking',
    baseNameSv: 'GTPS Belastningsanpassad Gång',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'hip_stabilizers'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'treadmill'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe GTPS limiting walking'],
      precautions: ['Gradual distance increase', 'Avoid hills initially'],
      redFlags: ['Progressive lateral hip pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Short distances' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Gradual increase' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Varied terrain' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Pain-free walking'],
      regressionTriggers: ['Pain with walking']
    },
    evidenceBase: { level: 'A', source: 'GTPS education and load management. Grimaldi A. BJSM 2015', studyType: 'Clinical guideline' }
  },
  // Hip Isometric Exercises
  {
    id: 'hip_isometric_hip_flexion',
    baseName: 'Isometric Hip Flexion',
    baseNameSv: 'Isometrisk Höftflexion',
    bodyRegion: 'hip',
    muscleGroups: ['iliopsoas', 'rectus_femoris'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'supine', 'standing'],
    allowedEquipment: ['none', 'wall', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute hip flexor strain'],
      precautions: ['Maintain neutral spine'],
      redFlags: ['Sharp hip pain', 'Back pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Very gentle' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Progressive intensity' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Full isometric' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Progress to dynamic' }
      ],
      progressionCriteria: ['Pain-free maximal contraction'],
      regressionTriggers: ['Hip pain', 'Back pain']
    },
    evidenceBase: { level: 'B', source: 'Isometric exercise for hip strengthening', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_isometric_hip_extension',
    baseName: 'Isometric Hip Extension',
    baseNameSv: 'Isometrisk Höftextension',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    exerciseType: 'isometric',
    allowedPositions: ['prone', 'standing'],
    allowedEquipment: ['none', 'wall', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute hamstring strain'],
      precautions: ['Avoid back hyperextension'],
      redFlags: ['Back pain', 'Hamstring pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Very gentle' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Progressive intensity' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Full isometric' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Progress to dynamic' }
      ],
      progressionCriteria: ['Pain-free maximal contraction'],
      regressionTriggers: ['Back pain', 'Pain']
    },
    evidenceBase: { level: 'B', source: 'Isometric hip extension studies', studyType: 'EMG study' }
  },
  {
    id: 'hip_isometric_hip_adduction',
    baseName: 'Isometric Hip Adduction',
    baseNameSv: 'Isometrisk Höftadduktion',
    bodyRegion: 'hip',
    muscleGroups: ['adductors', 'gracilis'],
    exerciseType: 'isometric',
    allowedPositions: ['supine', 'sitting', 'standing'],
    allowedEquipment: ['none', 'ball', 'pillow'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute groin strain', 'Pubic symphysis dysfunction'],
      precautions: ['Gradual pressure increase'],
      redFlags: ['Groin pain', 'Pubic pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Gentle only' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Full intensity' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Progress to dynamic' }
      ],
      progressionCriteria: ['Pain-free contraction'],
      regressionTriggers: ['Groin pain']
    },
    evidenceBase: { level: 'A', source: 'Copenhagen adductor protocol. Thorborg K. BJSM 2014', studyType: 'Clinical trial' }
  },
  // Aquatic Hip Exercises
  {
    id: 'hip_aquatic_walking',
    baseName: 'Aquatic Hip Walking',
    baseNameSv: 'Akvatisk Höftgång',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'hip_extensors', 'abductors'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['pool'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Open wounds', 'Infections', 'Fear of water'],
      precautions: ['Pool depth appropriate', 'Pool temperature'],
      redFlags: ['Dizziness', 'Pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'After wound healing, surgeon clearance' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Forward walking' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Multi-directional' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full aquatic program' }
      ],
      progressionCriteria: ['Comfortable in water'],
      regressionTriggers: ['Pain', 'Fear']
    },
    evidenceBase: { level: 'A', source: 'Aquatic therapy for hip OA. Bartels EM. Cochrane 2016', studyType: 'Systematic review' }
  },
  {
    id: 'hip_aquatic_leg_swing',
    baseName: 'Aquatic Leg Swings',
    baseNameSv: 'Akvatisk Bensving',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'hip_extensors', 'abductors', 'adductors'],
    exerciseType: 'mobility',
    allowedPositions: ['standing'],
    allowedEquipment: ['pool', 'pool_noodle'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Balance issues in water', 'Open wounds'],
      precautions: ['Hold pool edge for support'],
      redFlags: ['Hip pain', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'After wound healing' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Small swings' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive ROM' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full swings' }
      ],
      progressionCriteria: ['Full pain-free ROM'],
      regressionTriggers: ['Hip pain', 'Stiffness']
    },
    evidenceBase: { level: 'B', source: 'Aquatic exercise hip mobility', studyType: 'Clinical trial' }
  },
  // Sport-Specific Hip
  {
    id: 'hip_running_hip_drive',
    baseName: 'Running Hip Drive Drill',
    baseNameSv: 'Löpning Höftdrivning',
    bodyRegion: 'hip',
    muscleGroups: ['iliopsoas', 'gluteus_maximus', 'rectus_femoris'],
    exerciseType: 'plyometric',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'resistance_band'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Hip flexor strain', 'Groin pain'],
      precautions: ['Warm up thoroughly'],
      redFlags: ['Hip pain', 'Groin strain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Marching only' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Low intensity' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Full drill' }
      ],
      progressionCriteria: ['Good running mechanics'],
      regressionTriggers: ['Pain', 'Fatigue form breakdown']
    },
    evidenceBase: { level: 'B', source: 'Running drills for hip function. Willy RW. JOSPT 2019', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_cutting_drill',
    baseName: 'Hip Cutting/Change of Direction',
    baseNameSv: 'Höft Riktningsbyte',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'adductors', 'hip_rotators'],
    exerciseType: 'agility',
    allowedPositions: ['standing'],
    allowedEquipment: ['cones', 'none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Groin strain', 'Hip labral tear', 'Recent surgery'],
      precautions: ['Progress gradually', 'Good surface'],
      redFlags: ['Hip pain', 'Groin pain', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-24', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '24-32', modifications: 'Controlled cutting' },
        { phase: 3, weeksPostOp: '32-40', modifications: 'Progressive speed' },
        { phase: 4, weeksPostOp: '40+', modifications: 'Sport-specific' }
      ],
      progressionCriteria: ['Pain-free cutting'],
      regressionTriggers: ['Pain', 'Compensation']
    },
    evidenceBase: { level: 'B', source: 'Return to sport hip protocols. Thorborg K. BJSM 2018', studyType: 'Clinical guideline' }
  },
  {
    id: 'hip_kicking_progression',
    baseName: 'Hip Kicking Progression',
    baseNameSv: 'Höft Sparkprogression',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'quadriceps', 'adductors'],
    exerciseType: 'sport_specific',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'soccer_ball'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Groin strain', 'Hip flexor strain', 'Recent surgery'],
      precautions: ['Gradual intensity', 'Warm up'],
      redFlags: ['Groin pain', 'Hip flexor pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-24', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '24-32', modifications: 'Shadow kicking only' },
        { phase: 3, weeksPostOp: '32-40', modifications: 'Light ball contact' },
        { phase: 4, weeksPostOp: '40+', modifications: 'Full power' }
      ],
      progressionCriteria: ['Pain-free kicking'],
      regressionTriggers: ['Groin pain', 'Hip pain']
    },
    evidenceBase: { level: 'B', source: 'Football hip rehabilitation. Mosler AB. BJSM 2018', studyType: 'Clinical guideline' }
  },
  // Hip Proprioception
  {
    id: 'hip_single_leg_stance_progression',
    baseName: 'Single Leg Stance Progression',
    baseNameSv: 'Enbensståendeprogression',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'hip_stabilizers', 'core'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'balance_pad', 'wobble_board', 'bosu'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Severe balance deficits', 'Fall risk'],
      precautions: ['Near support', 'Progress gradually'],
      redFlags: ['Falls', 'Severe instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'With support only' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Stable surface' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Unstable surface' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Dynamic challenges' }
      ],
      progressionCriteria: ['30 second hold', 'Eyes closed'],
      regressionTriggers: ['Falls', 'Pain']
    },
    evidenceBase: { level: 'A', source: 'Balance training hip OA. Fitzgerald GK. Arthritis Care Res 2011', studyType: 'RCT' }
  },
  {
    id: 'hip_perturbation_training',
    baseName: 'Hip Perturbation Training',
    baseNameSv: 'Höft Perturbationsträning',
    bodyRegion: 'hip',
    muscleGroups: ['hip_stabilizers', 'gluteus_medius', 'core'],
    exerciseType: 'neuromuscular',
    allowedPositions: ['standing', 'single_leg_stance'],
    allowedEquipment: ['none', 'resistance_band', 'unstable_surface'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Balance disorders severe', 'Recent surgery'],
      precautions: ['Safety support nearby', 'Trained partner'],
      redFlags: ['Falls', 'Joint instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Gentle with support' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive challenges' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full perturbation' }
      ],
      progressionCriteria: ['Quick recovery from perturbation'],
      regressionTriggers: ['Falls', 'Slow reactions']
    },
    evidenceBase: { level: 'A', source: 'Neuromuscular training. Fitzgerald GK. JOSPT 2013', studyType: 'RCT' }
  },
  // Hip Eccentric Exercises
  {
    id: 'hip_nordic_hamstring_curl',
    baseName: 'Nordic Hamstring Curl',
    baseNameSv: 'Nordisk Hamstringcurl',
    bodyRegion: 'hip',
    muscleGroups: ['hamstrings', 'gluteus_maximus'],
    exerciseType: 'eccentric',
    allowedPositions: ['kneeling'],
    allowedEquipment: ['none', 'partner', 'nordic_bench'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute hamstring strain', 'Knee injury'],
      precautions: ['Build up slowly', 'DOMS expected'],
      redFlags: ['Hamstring pain', 'Knee pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Assisted partial' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Progressive ROM' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full ROM controlled'],
      regressionTriggers: ['Hamstring strain', 'Pain']
    },
    evidenceBase: { level: 'A', source: 'Nordic hamstring injury prevention. van der Horst N. BJSM 2015', studyType: 'RCT' }
  },
  {
    id: 'hip_eccentric_hip_extension',
    baseName: 'Eccentric Hip Extension',
    baseNameSv: 'Excentrisk Höftextension',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    exerciseType: 'eccentric',
    allowedPositions: ['standing', 'prone'],
    allowedEquipment: ['cable_machine', 'resistance_band', 'ankle_weight'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute muscle strain', 'Low back pain acute'],
      precautions: ['Control descent', 'Avoid hyperextension'],
      redFlags: ['Back pain', 'Muscle strain symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled eccentric'],
      regressionTriggers: ['Pain', 'Loss of control']
    },
    evidenceBase: { level: 'B', source: 'Eccentric hip strengthening', studyType: 'Clinical trial' }
  },
  // Hip OA Specific
  {
    id: 'hip_oa_cycling',
    baseName: 'Cycling for Hip OA',
    baseNameSv: 'Cykling för Höft-OA',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hip_flexors'],
    exerciseType: 'aerobic',
    allowedPositions: ['sitting'],
    allowedEquipment: ['stationary_bike', 'recumbent_bike'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe hip pain with cycling'],
      precautions: ['Proper seat height', 'Low resistance initially'],
      redFlags: ['Increasing hip pain', 'Groin pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Recumbent only, surgeon clearance' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Low resistance' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full program' }
      ],
      progressionCriteria: ['Pain-free cycling 20+ min'],
      regressionTriggers: ['Hip pain', 'Stiffness']
    },
    evidenceBase: { level: 'A', source: 'Exercise for hip OA. Fransen M. Cochrane 2014', studyType: 'Systematic review' }
  },
  {
    id: 'hip_oa_tai_chi',
    baseName: 'Tai Chi for Hip Health',
    baseNameSv: 'Tai Chi för Höfthälsa',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'gluteals', 'core', 'balance'],
    exerciseType: 'mind_body',
    allowedPositions: ['standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe balance deficit'],
      precautions: ['Modified positions as needed', 'Near support'],
      redFlags: ['Falls', 'Pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not recommended' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Seated/modified' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Standing basic' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full practice' }
      ],
      progressionCriteria: ['Full forms possible'],
      regressionTriggers: ['Balance issues', 'Pain']
    },
    evidenceBase: { level: 'A', source: 'Tai Chi for hip OA. Wang C. Arthritis Rheum 2009', studyType: 'RCT' }
  }
];

export default hipTemplates;
