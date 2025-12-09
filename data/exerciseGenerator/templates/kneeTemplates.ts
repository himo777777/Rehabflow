/**
 * Knee Exercise Templates
 *
 * Evidence-based exercises for knee rehabilitation
 * Based on JOSPT ACL and PFP clinical practice guidelines
 */

import { BaseExerciseTemplate } from '../types';

export const kneeTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // QUADRICEPS STRENGTHENING
  // ============================================
  {
    id: 'knee_quad_set',
    baseName: 'Quad Set (Isometric)',
    baseNameSv: 'Quadricepskontraktion (Isometrisk)',
    description: 'Isometric quadriceps activation for early rehabilitation',
    descriptionSv: 'Isometrisk quadricepsaktivering för tidig rehabilitering',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'isometric',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'towel'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],

    baseReps: { min: 10, max: 20 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,

    instructions: [
      'Lie with leg straight',
      'Place small towel under knee if needed',
      'Tighten thigh muscle pushing knee down',
      'Pull toes toward you to increase contraction',
      'Hold firmly',
      'Release slowly'
    ],
    instructionsSv: [
      'Ligg med benet rakt',
      'Placera liten handduk under knät vid behov',
      'Spänn lårmuskeln och tryck knät nedåt',
      'Dra tårna mot dig för ökad kontraktion',
      'Håll fast',
      'Släpp långsamt'
    ],

    techniquePoints: [
      'Should see muscle contract',
      'Kneecap should slide upward',
      'Heel should lift slightly off surface',
      'Do not hold breath'
    ],

    safetyData: {
      contraindications: ['Recent patellar surgery - check protocol', 'Acute knee effusion'],
      precautions: ['Pain with contraction - reduce intensity', 'Post-surgical - gentle'],
      redFlags: ['Severe pain with contraction', 'Inability to contract quad'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps muscle',
      targetStructure: 'Vastus medialis oblique, quadriceps group',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Submaximal contraction'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA', 'Patellar surgery'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 3,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: false,
        compensationPatterns: ['No visible contraction', 'Hip flexor substitution']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Logerstedt DS, et al. Knee pain CPG. JOSPT, 2010',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'knee_straight_leg_raise',
    baseName: 'Straight Leg Raise',
    baseNameSv: 'Rakt Benlyft',
    description: 'Hip flexion with locked knee for quadriceps strengthening',
    descriptionSv: 'Höftflexion med låst knä för quadricepsstyrka',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'iliopsoas'],
    jointType: 'knee',
    exerciseType: 'concentric',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'ankle_weight'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back, uninvolved knee bent',
      'Perform quad set first - lock knee',
      'Lift straight leg to 45 degrees',
      'Keep knee fully extended',
      'Hold briefly at top',
      'Lower slowly with control'
    ],
    instructionsSv: [
      'Ligg på rygg, icke-involverat knä böjt',
      'Gör quadricepskontraktion först - lås knät',
      'Lyft rakt ben till 45 grader',
      'Håll knät helt sträckt',
      'Håll kort i toppen',
      'Sänk långsamt med kontroll'
    ],

    techniquePoints: [
      'Lock knee before lifting',
      'Do not let knee bend during lift',
      'Point toes up',
      'Control lowering phase'
    ],

    safetyData: {
      contraindications: ['Acute knee effusion', 'Unable to achieve quad lock'],
      precautions: ['Hip flexor strain - reduce range', 'Back pain - support lumbar'],
      redFlags: ['Knee giving way', 'Severe quadriceps weakness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps',
      targetStructure: 'Rectus femoris, vastus group',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['No weight', 'Low range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA', 'Patellar surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Knee bend during lift', 'Back arching', 'Hip hiking']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Logerstedt DS, et al. Knee rehabilitation CPG. JOSPT, 2010',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'knee_terminal_extension',
    baseName: 'Terminal Knee Extension',
    baseNameSv: 'Terminal Knäextension',
    description: 'Short arc quad exercise targeting last 30 degrees of extension',
    descriptionSv: 'Kort båge quadövning som riktar in sig på sista 30 graders extension',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'concentric',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],

    baseEquipment: 'towel',
    allowedEquipment: ['towel', 'foam_roller', 'resistance_band'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,

    instructions: [
      'Place rolled towel under knee',
      'Start with knee slightly bent',
      'Straighten knee by lifting foot',
      'Lock knee fully at top',
      'Hold position',
      'Lower with control'
    ],
    instructionsSv: [
      'Placera hoprullad handduk under knät',
      'Börja med knät lätt böjt',
      'Sträck knät genom att lyfta foten',
      'Lås knät helt i toppen',
      'Håll positionen',
      'Sänk med kontroll'
    ],

    techniquePoints: [
      'Focus on full extension',
      'Feel VMO contracting',
      'Slow controlled movement',
      'Quality over speed'
    ],

    safetyData: {
      contraindications: ['ACL graft healing - check protocol', 'Patellar instability'],
      precautions: ['Patellofemoral pain - monitor symptoms', 'Meniscus repair - check range limits'],
      redFlags: ['Locking sensation', 'Giving way'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps, VMO',
      targetStructure: 'Vastus medialis oblique',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle, no resistance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA', 'Patellar surgery'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Incomplete extension', 'Hip rotation']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Logerstedt DS. Knee CPG. JOSPT, 2010',
      studyType: 'Clinical practice guideline'
    }
  },

  // ============================================
  // HAMSTRING STRENGTHENING
  // ============================================
  {
    id: 'knee_hamstring_curl_prone',
    baseName: 'Prone Hamstring Curl',
    baseNameSv: 'Pronliggande Hamstringcurl',
    description: 'Isolated hamstring strengthening in prone position',
    descriptionSv: 'Isolerad hamstringstyrka i pronliggande position',
    bodyRegion: 'knee',
    muscleGroups: ['hamstrings'],
    jointType: 'knee',
    exerciseType: 'concentric',

    basePosition: 'prone',
    allowedPositions: ['prone', 'standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'ankle_weight', 'resistance_band'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],

    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie face down on flat surface',
      'Keep thighs on surface throughout',
      'Bend knee bringing heel toward buttock',
      'Control the movement',
      'Hold at top',
      'Lower slowly'
    ],
    instructionsSv: [
      'Ligg på mage på plan yta',
      'Håll låren på ytan genomgående',
      'Böj knät och för hälen mot sätet',
      'Kontrollera rörelsen',
      'Håll i toppen',
      'Sänk långsamt'
    ],

    techniquePoints: [
      'Do not lift thigh off surface',
      'Full range if pain-free',
      'Control eccentric portion',
      'Keep hips stable'
    ],

    safetyData: {
      contraindications: ['Acute hamstring strain', 'ACL graft using hamstring - check protocol'],
      precautions: ['Knee effusion - reduce resistance', 'Back pain - pillow under pelvis'],
      redFlags: ['Sharp hamstring pain', 'Cramping'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hamstring muscles',
      targetStructure: 'Biceps femoris, semimembranosus, semitendinosus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['No resistance', 'Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],

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
        compensationPatterns: ['Hip lifting', 'External rotation', 'Cramping']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Erickson LN. Hamstring rehabilitation. JOSPT, 2015',
      studyType: 'Clinical review'
    }
  },

  {
    id: 'knee_nordic_hamstring',
    baseName: 'Nordic Hamstring Curl',
    baseNameSv: 'Nordisk Hamstringcurl',
    description: 'Eccentric hamstring exercise for injury prevention',
    descriptionSv: 'Excentrisk hamstringövning för skadeförebyggande',
    bodyRegion: 'knee',
    muscleGroups: ['hamstrings'],
    jointType: 'knee',
    exerciseType: 'eccentric',

    basePosition: 'kneeling',
    allowedPositions: ['kneeling'],

    baseEquipment: 'partner',
    allowedEquipment: ['partner', 'anchor'],

    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,

    instructions: [
      'Kneel with ankles held down by partner',
      'Keep body straight from knees to shoulders',
      'Slowly lower body forward',
      'Control descent as long as possible',
      'Catch self with hands at bottom',
      'Push back up and repeat'
    ],
    instructionsSv: [
      'Knäböj med fotlederna hållna av partner',
      'Håll kroppen rak från knän till axlar',
      'Sänk långsamt kroppen framåt',
      'Kontrollera nedsänkningen så länge som möjligt',
      'Fånga dig själv med händerna i botten',
      'Tryck tillbaka upp och upprepa'
    ],

    techniquePoints: [
      'Control eccentric as long as possible',
      'Do not bend at hips',
      'Keep core tight',
      'Build up gradually over weeks'
    ],

    safetyData: {
      contraindications: ['Acute hamstring strain', 'Knee instability', 'ACL graft < 6 months'],
      precautions: ['Previous hamstring injury - reduce volume', 'Introduce gradually'],
      redFlags: ['Sharp hamstring pain', 'Cramping', 'Giving way'],
      maxPainDuring: 4,
      maxPainAfter24h: 4,
      healingTissue: 'Hamstring complex',
      targetStructure: 'Biceps femoris long head, semimembranosus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Start with assisted'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],

      progressionCriteria: {
        minPainFreeReps: 10,
        minConsecutiveDays: 7,
        maxPainDuring: 3,
        maxPainAfter: 3,
        formScore: 90
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Hip flexion', 'Loss of control', 'Asymmetric descent']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Al Attar WSA. Nordic hamstring exercise. BJSM, 2017',
      studyType: 'Systematic review and meta-analysis'
    }
  },

  // ============================================
  // FUNCTIONAL KNEE EXERCISES
  // ============================================
  {
    id: 'knee_wall_sit',
    baseName: 'Wall Sit',
    baseNameSv: 'Väggsittning',
    description: 'Isometric quadriceps exercise in functional position',
    descriptionSv: 'Isometrisk quadricepsövning i funktionell position',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'isometric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'wall',
    allowedEquipment: ['wall'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 60,

    instructions: [
      'Stand with back against wall',
      'Slide down until thighs parallel to floor',
      'Keep knees over ankles',
      'Press back flat against wall',
      'Hold position',
      'Slide back up to standing'
    ],
    instructionsSv: [
      'Stå med ryggen mot väggen',
      'Glid ner tills låren är parallella med golvet',
      'Håll knäna över fotlederna',
      'Tryck ryggen platt mot väggen',
      'Håll positionen',
      'Glid tillbaka upp till stående'
    ],

    techniquePoints: [
      'Knees should not go past toes',
      'Keep weight through heels',
      'Breathe normally',
      'Adjust depth as needed'
    ],

    safetyData: {
      contraindications: ['Severe patellofemoral pain', 'Acute knee effusion'],
      precautions: ['Knee pain - reduce depth', 'Back pain - maintain contact'],
      redFlags: ['Sharp anterior knee pain', 'Locking', 'Giving way'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps',
      targetStructure: 'Quadriceps isometric strength',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Shallow angle only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Knees caving', 'Weight to toes', 'Back arching']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Witvrouw E. Patellofemoral pain. JOSPT, 2005',
      studyType: 'Clinical review'
    }
  },

  {
    id: 'knee_step_up',
    baseName: 'Step Up',
    baseNameSv: 'Uppsteg',
    description: 'Functional single leg strengthening on step',
    descriptionSv: 'Funktionell enbensträning på trappsteg',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gluteus_medius'],
    jointType: 'knee',
    exerciseType: 'concentric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'step',
    allowedEquipment: ['step', 'box'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'alternating'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,

    instructions: [
      'Place one foot fully on step',
      'Push through heel to stand up',
      'Do not push off back foot',
      'Stand tall at top',
      'Lower with control',
      'Repeat on same leg'
    ],
    instructionsSv: [
      'Placera en fot helt på steget',
      'Tryck genom hälen för att ställa dig upp',
      'Tryck inte ifrån med bakre foten',
      'Stå högt i toppen',
      'Sänk med kontroll',
      'Upprepa på samma ben'
    ],

    techniquePoints: [
      'All work from leading leg',
      'Keep knee over second toe',
      'Do not let knee cave',
      'Control descent'
    ],

    safetyData: {
      contraindications: ['Acute knee effusion', 'Knee instability'],
      precautions: ['Balance issues - use rail', 'Start with low step'],
      redFlags: ['Knee giving way', 'Sharp pain', 'Locking'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps, gluteals',
      targetStructure: 'Functional lower extremity strength',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Low step', 'Use rail'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Knee valgus', 'Push off back leg', 'Trunk lean']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Crossley KM. Patellofemoral pain CPG. BJSM, 2016',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'knee_mini_squat',
    baseName: 'Mini Squat',
    baseNameSv: 'Mini-knäböj',
    description: 'Partial squat focusing on 0-45 degrees knee flexion',
    descriptionSv: 'Delvis knäböj med fokus på 0-45 graders knäflexion',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'concentric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'wall', 'chair'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,

    instructions: [
      'Stand with feet shoulder width apart',
      'Keep weight through heels',
      'Bend knees 30-45 degrees',
      'Push hips back slightly',
      'Keep knees over toes',
      'Return to standing'
    ],
    instructionsSv: [
      'Stå med fötterna axelbrett isär',
      'Håll vikten genom hälarna',
      'Böj knäna 30-45 grader',
      'Skjut höfterna bakåt något',
      'Håll knäna över tårna',
      'Återgå till stående'
    ],

    techniquePoints: [
      'Limit depth to pain-free range',
      'Keep knees tracking over toes',
      'Weight in heels',
      'Control throughout'
    ],

    safetyData: {
      contraindications: ['Severe patellofemoral pain', 'Acute meniscus tear'],
      precautions: ['Knee pain - reduce depth', 'Balance issues - use support'],
      redFlags: ['Sharp pain', 'Locking', 'Giving way'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps',
      targetStructure: 'Quadriceps, gluteals',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Shallow only', 'Wall support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Knee valgus', 'Weight forward', 'Trunk lean']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Crossley KM. PFP CPG. BJSM, 2016',
      studyType: 'Clinical practice guideline'
    }
  },

  // ============================================
  // ROM AND FLEXIBILITY
  // ============================================
  {
    id: 'knee_heel_slides',
    baseName: 'Heel Slides',
    baseNameSv: 'Hälglid',
    description: 'Active-assisted knee flexion ROM exercise',
    descriptionSv: 'Aktiv-assisterad knäflexion ROM-övning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'mobility',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'towel'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back or sit on smooth surface',
      'Slowly slide heel toward buttock',
      'Use towel around foot if needed for assistance',
      'Bend knee as far as comfortable',
      'Hold at end range',
      'Slide back to straight'
    ],
    instructionsSv: [
      'Ligg på rygg eller sitt på slät yta',
      'Glid långsamt hälen mot sätet',
      'Använd handduk runt foten vid behov för assistans',
      'Böj knät så långt som är bekvämt',
      'Håll i slutläge',
      'Glid tillbaka till rakt'
    ],

    techniquePoints: [
      'Keep movement slow and controlled',
      'Stop before sharp pain',
      'May use assist at end range',
      'Progress range gradually'
    ],

    safetyData: {
      contraindications: ['Locked knee - seek evaluation', 'Fracture'],
      precautions: ['Post-surgical - follow ROM limits', 'Effusion - gentle'],
      redFlags: ['Unable to bend past 90 degrees', 'Mechanical block'],
      maxPainDuring: 4,
      maxPainAfter24h: 2,
      healingTissue: 'Joint capsule, ligaments',
      targetStructure: 'Knee flexion ROM',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Follow protocol ROM limits'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA', 'Any knee surgery'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 3,
        maxPainDuring: 3,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: false,
        compensationPatterns: ['Hip hiking', 'Trunk rotation']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Logerstedt DS. Knee CPG. JOSPT, 2010',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'knee_quad_stretch_prone',
    baseName: 'Prone Quadriceps Stretch',
    baseNameSv: 'Pronliggande Quadricepsstretch',
    description: 'Stretching of rectus femoris and quadriceps',
    descriptionSv: 'Stretch av rectus femoris och quadriceps',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'rectus_femoris'],
    jointType: 'knee',
    exerciseType: 'stretch',

    basePosition: 'prone',
    allowedPositions: ['prone', 'side_lying', 'standing'],

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

    instructions: [
      'Lie face down on firm surface',
      'Reach back and grasp ankle',
      'Gently pull heel toward buttock',
      'Keep hips pressed down',
      'Feel stretch in front of thigh',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Ligg på mage på fast yta',
      'Sträck dig bakåt och greppa fotleden',
      'Dra försiktigt hälen mot sätet',
      'Håll höfterna nedtryckta',
      'Känn stretch i framsidan av låret',
      'Håll och andas'
    ],

    techniquePoints: [
      'Keep thigh on floor',
      'Do not arch back excessively',
      'Use strap if cannot reach ankle',
      'Gentle stretch, no forcing'
    ],

    safetyData: {
      contraindications: ['Acute knee effusion', 'Unable to bend knee'],
      precautions: ['Back pain - pillow under pelvis', 'Knee pain - reduce range'],
      redFlags: ['Sharp knee pain', 'Locking'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Quadriceps flexibility',
      targetStructure: 'Rectus femoris, quadriceps',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle, follow ROM limits'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: false,
        compensationPatterns: ['Hip lifting', 'Back arching', 'Forcing range']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Witvrouw E. Stretching and injury prevention. Clin J Sport Med, 2004',
      studyType: 'Clinical review'
    }
  },

  {
    id: 'knee_hamstring_stretch',
    baseName: 'Supine Hamstring Stretch',
    baseNameSv: 'Ryggliggande Hamstringstretch',
    description: 'Hamstring stretching in supine position',
    descriptionSv: 'Hamstringstretch i ryggliggande position',
    bodyRegion: 'knee',
    muscleGroups: ['hamstrings'],
    jointType: 'knee',
    exerciseType: 'stretch',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting', 'standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'strap', 'towel'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Lie on back, one leg straight',
      'Bring other knee toward chest',
      'Hold behind thigh',
      'Straighten knee toward ceiling',
      'Feel stretch in back of thigh',
      'Hold and breathe deeply'
    ],
    instructionsSv: [
      'Ligg på rygg, ett ben rakt',
      'För andra knät mot bröstet',
      'Håll bakom låret',
      'Sträck knät mot taket',
      'Känn stretch i baksidan av låret',
      'Håll och andas djupt'
    ],

    techniquePoints: [
      'Keep low back on floor',
      'Do not lock knee aggressively',
      'Use strap if cannot hold',
      'Relax into stretch'
    ],

    safetyData: {
      contraindications: ['Acute hamstring strain', 'Sciatica with SLR reproduction'],
      precautions: ['Back pain - bend bottom knee', 'Nerve symptoms - reduce range'],
      redFlags: ['Radiating leg pain', 'Numbness/tingling'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hamstring flexibility',
      targetStructure: 'Hamstring muscles',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle, do not force'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA', 'Lumbar surgery'],

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
        compensationPatterns: ['Back lifting', 'Hip rotation', 'Forcing range']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Witvrouw E. Flexibility and injury prevention. Clin J Sport Med, 2004',
      studyType: 'Clinical review'
    }
  },

  // ============================================
  // SQUAT VARIATIONS
  // ============================================
  {
    id: 'knee_deep_squat',
    baseName: 'Deep Squat',
    baseNameSv: 'Djup Knäböj',
    description: 'Full depth squat for mobility and strength',
    descriptionSv: 'Full djup knäböj för mobilitet och styrka',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell', 'kettlebell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand feet shoulder-width apart', 'Descend with control', 'Go as deep as mobility allows', 'Knees track over toes', 'Drive through heels to stand', 'Keep chest up'],
    instructionsSv: ['Stå med fötterna axelbrett isär', 'Sänk med kontroll', 'Gå så djupt som mobiliteten tillåter', 'Knäna följer tårna', 'Tryck genom hälarna för att stå', 'Håll bröstet uppe'],
    techniquePoints: ['Full depth if pain-free', 'Heels stay down', 'Neutral spine'],
    safetyData: {
      contraindications: ['Acute knee injury', 'Severe patellofemoral pain'],
      precautions: ['Knee pain - reduce depth'],
      redFlags: ['Sharp knee pain', 'Locking'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Quadriceps, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial depth'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Heels rising'] }
    },
    evidenceBase: { level: 'B', source: 'Escamilla RF. Knee biomechanics. MSSE, 2001', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_single_leg_squat',
    baseName: 'Single Leg Squat',
    baseNameSv: 'Enbensknäböj',
    description: 'Unilateral squat for strength and control',
    descriptionSv: 'Unilateral knäböj för styrka och kontroll',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gluteus_medius'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on one leg', 'Extend other leg forward', 'Lower into squat', 'Keep knee over toes', 'Control throughout', 'Push through heel to stand'],
    instructionsSv: ['Stå på ett ben', 'Sträck andra benet framåt', 'Sänk i knäböj', 'Håll knät över tårna', 'Kontroll genomgående', 'Tryck genom hälen för att stå'],
    techniquePoints: ['Level pelvis', 'Knee over toes', 'Controlled descent'],
    safetyData: {
      contraindications: ['Knee instability', 'Balance issues'],
      precautions: ['Near wall for support'],
      redFlags: ['Knee giving way', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Quadriceps, hip stabilizers',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Partial depth'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Hip drop', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Crossley KM. PFP CPG. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_split_squat',
    baseName: 'Split Squat',
    baseNameSv: 'Delad Knäböj',
    description: 'Static lunge position squat',
    descriptionSv: 'Statisk utfallsposition knäböj',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
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
    instructions: ['Stand in split stance', 'Front foot flat, back on toes', 'Lower straight down', 'Both knees to 90°', 'Push through front heel', 'Keep torso upright'],
    instructionsSv: ['Stå i delad ställning', 'Främre foten platt, bakre på tårna', 'Sänk rakt ner', 'Båda knäna till 90°', 'Tryck genom främre hälen', 'Håll överkroppen upprätt'],
    techniquePoints: ['Vertical descent', 'Front knee over ankle', 'Core engaged'],
    safetyData: {
      contraindications: ['Acute knee pain'],
      precautions: ['Balance support if needed'],
      redFlags: ['Knee pain', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps', targetStructure: 'Quads, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial depth'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Ebben WP. Split squat mechanics. JSCR, 2009', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_bulgarian_split_squat',
    baseName: 'Bulgarian Split Squat',
    baseNameSv: 'Bulgarisk Delad Knäböj',
    description: 'Rear-foot elevated split squat',
    descriptionSv: 'Delad knäböj med bakre foten upphöjd',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'bench',
    allowedEquipment: ['bench', 'step', 'chair'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Place rear foot on bench behind', 'Front foot 2-3 steps ahead', 'Lower into lunge', 'Front knee to 90°', 'Push through front heel', 'Control throughout'],
    instructionsSv: ['Placera bakre foten på bänk bakom', 'Främre foten 2-3 steg framåt', 'Sänk i utfall', 'Främre knät till 90°', 'Tryck genom främre hälen', 'Kontroll genomgående'],
    techniquePoints: ['Upright torso', 'Front knee over ankle', 'Control descent'],
    safetyData: {
      contraindications: ['Knee instability', 'Balance issues'],
      precautions: ['Hold support if needed'],
      redFlags: ['Knee pain', 'Loss of balance'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps', targetStructure: 'Quads, glutes, hip flexors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial depth'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Forward lean'] }
    },
    evidenceBase: { level: 'B', source: 'Speirs DE. Bulgarian squat. JSCR, 2016', studyType: 'EMG analysis' }
  },

  // ============================================
  // LUNGE VARIATIONS
  // ============================================
  {
    id: 'knee_forward_lunge',
    baseName: 'Forward Lunge',
    baseNameSv: 'Utfallssteg Framåt',
    description: 'Dynamic forward lunge for knee strength',
    descriptionSv: 'Dynamiskt utfallssteg framåt för knästyrka',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hamstrings'],
    jointType: 'knee',
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
    instructions: ['Stand tall', 'Step forward into lunge', 'Lower until both knees at 90°', 'Keep torso upright', 'Push through front heel to return', 'Alternate legs'],
    instructionsSv: ['Stå rakt', 'Ta steg framåt i utfall', 'Sänk tills båda knäna är i 90°', 'Håll överkroppen upprätt', 'Tryck genom främre hälen för att återgå', 'Växla ben'],
    techniquePoints: ['Front knee over ankle', 'Control the step', 'Upright torso'],
    safetyData: {
      contraindications: ['Acute knee injury', 'Balance issues'],
      precautions: ['Knee pain - reduce depth'],
      redFlags: ['Knee giving way', 'Sharp pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Quadriceps, glutes',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Farrokhi S. Lunge biomechanics. Clin Biomech, 2008', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_reverse_lunge',
    baseName: 'Reverse Lunge',
    baseNameSv: 'Utfallssteg Bakåt',
    description: 'Backward lunge reducing knee stress',
    descriptionSv: 'Utfallssteg bakåt som minskar knäbelastning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hamstrings'],
    jointType: 'knee',
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
    instructions: ['Stand tall', 'Step backward into lunge', 'Lower until both knees at 90°', 'Keep torso upright', 'Push through front heel to return', 'Alternate legs'],
    instructionsSv: ['Stå rakt', 'Ta steg bakåt i utfall', 'Sänk tills båda knäna är i 90°', 'Håll överkroppen upprätt', 'Tryck genom främre hälen för att återgå', 'Växla ben'],
    techniquePoints: ['Less knee shear', 'More glute emphasis', 'Control step back'],
    safetyData: {
      contraindications: ['Balance issues'],
      precautions: ['Near support'],
      redFlags: ['Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Glutes, quads',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Trunk lean', 'Knee valgus'] }
    },
    evidenceBase: { level: 'B', source: 'Farrokhi S. Lunge variations. Clin Biomech, 2008', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_walking_lunge',
    baseName: 'Walking Lunge',
    baseNameSv: 'Gående Utfall',
    description: 'Dynamic walking lunge pattern',
    descriptionSv: 'Dynamiskt gående utfallsmönster',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Step forward into lunge', 'Lower to 90° both knees', 'Push through to step forward', 'Continue walking lunges', 'Keep torso upright', 'Control throughout'],
    instructionsSv: ['Ta steg framåt i utfall', 'Sänk till 90° båda knäna', 'Tryck genom för att stega framåt', 'Fortsätt gående utfall', 'Håll överkroppen upprätt', 'Kontroll genomgående'],
    techniquePoints: ['Smooth transition', 'Level pelvis', 'Upright posture'],
    safetyData: {
      contraindications: ['Balance issues', 'Knee instability'],
      precautions: ['Clear space needed'],
      redFlags: ['Loss of balance', 'Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Functional strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['No weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Trunk lean', 'Knee valgus'] }
    },
    evidenceBase: { level: 'B', source: 'Cronin J. Lunge variations. JSCR, 2003', studyType: 'EMG study' }
  },

  // ============================================
  // BALANCE AND PROPRIOCEPTION
  // ============================================
  {
    id: 'knee_single_leg_balance',
    baseName: 'Single Leg Balance',
    baseNameSv: 'Enbensbalans',
    description: 'Basic single leg balance for proprioception',
    descriptionSv: 'Grundläggande enbensbalans för proprioception',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius'],
    jointType: 'knee',
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
    instructions: ['Stand on one leg', 'Slight knee bend', 'Keep hips level', 'Focus on a point ahead', 'Hold position', 'Progress by closing eyes or unstable surface'],
    instructionsSv: ['Stå på ett ben', 'Lätt knäböjning', 'Håll höfterna i nivå', 'Fokusera på en punkt framåt', 'Håll positionen', 'Progression genom att blunda eller ojämn yta'],
    techniquePoints: ['Soft knee', 'Level pelvis', 'Controlled corrections'],
    safetyData: {
      contraindications: ['Severe balance dysfunction'],
      precautions: ['Near wall for support'],
      redFlags: ['Falls', 'Severe instability'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Proprioceptive system', targetStructure: 'Balance and control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Near support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'Ankle surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip drop', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Risberg MA. Balance training. JOSPT, 2007', studyType: 'RCT' }
  },

  {
    id: 'knee_balance_with_perturbation',
    baseName: 'Balance with Perturbation',
    baseNameSv: 'Balans med Störning',
    description: 'Single leg balance with external challenges',
    descriptionSv: 'Enbensbalans med externa utmaningar',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'core'],
    jointType: 'knee',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'ball', 'resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 45,
    instructions: ['Stand on one leg', 'Have partner provide pushes', 'Or catch/throw ball while balancing', 'Maintain balance throughout', 'React to challenges', 'Keep knee slightly bent'],
    instructionsSv: ['Stå på ett ben', 'Låt partner ge puffar', 'Eller fånga/kasta boll under balans', 'Bibehåll balans genomgående', 'Reagera på utmaningar', 'Håll knät lätt böjt'],
    techniquePoints: ['Reactive control', 'Quick corrections', 'Level pelvis'],
    safetyData: {
      contraindications: ['Poor baseline balance', 'Knee instability'],
      precautions: ['Safe environment'],
      redFlags: ['Falls', 'Knee giving way'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Neuromuscular control', targetStructure: 'Reactive balance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Gentle perturbations'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Loss of balance', 'Knee valgus'] }
    },
    evidenceBase: { level: 'A', source: 'Risberg MA. Perturbation training. JOSPT, 2007', studyType: 'RCT' }
  },

  // ============================================
  // STEP VARIATIONS
  // ============================================
  {
    id: 'knee_step_down',
    baseName: 'Step Down',
    baseNameSv: 'Nedsteg',
    description: 'Eccentric control stepping down from step',
    descriptionSv: 'Excentrisk kontroll vid nedstigning från steg',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'eccentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'box'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand on step on one leg', 'Lower other foot toward floor', 'Control the descent slowly', 'Keep knee over toes', 'Tap floor lightly', 'Return to start'],
    instructionsSv: ['Stå på steg på ett ben', 'Sänk andra foten mot golvet', 'Kontrollera nedsänkningen långsamt', 'Håll knät över tårna', 'Rör lätt vid golvet', 'Återgå till start'],
    techniquePoints: ['Slow eccentric control', 'Knee over toes', 'Level pelvis'],
    safetyData: {
      contraindications: ['Patellofemoral pain with stairs'],
      precautions: ['Start with low step'],
      redFlags: ['Sharp knee pain', 'Giving way'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps', targetStructure: 'Eccentric quad strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Low step'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Hip drop', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Crossley KM. PFP CPG. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_lateral_step_down',
    baseName: 'Lateral Step Down',
    baseNameSv: 'Lateral Nedsteg',
    description: 'Side step down for frontal plane control',
    descriptionSv: 'Sidosteg ner för frontalplanskontroll',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius'],
    jointType: 'knee',
    exerciseType: 'eccentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'box'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand on step, sideways', 'Lower outside foot toward floor', 'Control descent with stance leg', 'Keep pelvis level', 'Tap floor lightly', 'Return to start'],
    instructionsSv: ['Stå på steg, i sidled', 'Sänk yttre foten mot golvet', 'Kontrollera nedsänkningen med ståbenet', 'Håll bäckenet i nivå', 'Rör lätt vid golvet', 'Återgå till start'],
    techniquePoints: ['Level pelvis critical', 'Control knee over toes', 'No trunk lean'],
    safetyData: {
      contraindications: ['Hip instability', 'Balance issues'],
      precautions: ['Near support'],
      redFlags: ['Hip drop', 'Knee valgus'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip and knee stabilizers', targetStructure: 'Gluteus medius, VMO',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Low step'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Hip arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip drop', 'Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Crossley KM. PFP CPG. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // ADDITIONAL STRENGTHENING
  // ============================================
  {
    id: 'knee_leg_press',
    baseName: 'Leg Press',
    baseNameSv: 'Benpress',
    description: 'Machine-based quadriceps strengthening',
    descriptionSv: 'Maskinbaserad quadricepsträning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'leg_press_machine',
    allowedEquipment: ['leg_press_machine'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Sit in leg press machine', 'Feet shoulder-width on platform', 'Lower weight with control', 'Keep knees over toes', 'Press through heels to extend', 'Do not lock knees at top'],
    instructionsSv: ['Sitt i benpressmaskinen', 'Fötterna axelbrett på plattan', 'Sänk vikten med kontroll', 'Håll knäna över tårna', 'Tryck genom hälarna för att sträcka', 'Lås inte knäna i toppen'],
    techniquePoints: ['Control range', 'Knees track over toes', 'Full extension without locking'],
    safetyData: {
      contraindications: ['Acute knee injury'],
      precautions: ['Start light', 'Control depth'],
      redFlags: ['Sharp knee pain', 'Locking'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps', targetStructure: 'Quadriceps strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light weight', 'Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Lifting hips'] }
    },
    evidenceBase: { level: 'B', source: 'Escamilla RF. Leg press mechanics. MSSE, 2001', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_leg_extension',
    baseName: 'Leg Extension',
    baseNameSv: 'Benextension',
    description: 'Isolated quadriceps strengthening',
    descriptionSv: 'Isolerad quadricepsträning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'leg_extension_machine',
    allowedEquipment: ['leg_extension_machine', 'ankle_weight'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: ['Sit in leg extension machine', 'Pad on front of ankles', 'Extend knees fully', 'Hold at top briefly', 'Lower with control', 'Keep back against pad'],
    instructionsSv: ['Sitt i benextensionsmaskinen', 'Dyna på fotledernas framsida', 'Sträck knäna helt', 'Håll kort i toppen', 'Sänk med kontroll', 'Håll ryggen mot dynerna'],
    techniquePoints: ['Full extension', 'Slow eccentric', 'Avoid hyperextension'],
    safetyData: {
      contraindications: ['ACL graft < 12 weeks', 'Patellofemoral pain in full extension'],
      precautions: ['PFP - limit range', 'Start light'],
      redFlags: ['Anterior knee pain', 'Graft site pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps', targetStructure: 'Quadriceps isolation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Terminal range only', 'No resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Limited range for ACL'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip lifting', 'Jerky movement'] }
    },
    evidenceBase: { level: 'B', source: 'Escamilla RF. Open chain exercises. MSSE, 1998', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_leg_curl',
    baseName: 'Leg Curl',
    baseNameSv: 'Bencurl',
    description: 'Hamstring strengthening with machine',
    descriptionSv: 'Hamstringträning med maskin',
    bodyRegion: 'knee',
    muscleGroups: ['hamstrings'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'prone',
    allowedPositions: ['prone', 'sitting'],
    baseEquipment: 'leg_curl_machine',
    allowedEquipment: ['leg_curl_machine', 'ankle_weight', 'resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: ['Lie prone or sit in machine', 'Pad behind ankles', 'Curl heels toward buttock', 'Full knee flexion', 'Hold at top', 'Lower with control'],
    instructionsSv: ['Ligg på mage eller sitt i maskinen', 'Dyna bakom fotlederna', 'Curl hälarna mot sätet', 'Full knäflexion', 'Håll i toppen', 'Sänk med kontroll'],
    techniquePoints: ['Full range', 'Control eccentric', 'No hip flexion'],
    safetyData: {
      contraindications: ['Acute hamstring strain', 'Hamstring graft ACL < 12 weeks'],
      precautions: ['Hamstring graft - careful progression'],
      redFlags: ['Sharp hamstring pain', 'Cramping'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hamstrings', targetStructure: 'Hamstring strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light resistance', 'Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip flexion', 'Cramping'] }
    },
    evidenceBase: { level: 'B', source: 'Erickson LN. Hamstring exercises. JOSPT, 2015', studyType: 'Clinical review' }
  },

  {
    id: 'knee_calf_raise',
    baseName: 'Calf Raise',
    baseNameSv: 'Tåhävning',
    description: 'Gastrocnemius and soleus strengthening',
    descriptionSv: 'Gastrocnemius och soleusträning',
    bodyRegion: 'knee',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'step', 'dumbbell'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Stand on flat surface or step edge', 'Rise onto toes', 'Full plantarflexion', 'Hold at top', 'Lower with control', 'Full stretch at bottom'],
    instructionsSv: ['Stå på plan yta eller stegkant', 'Res dig på tårna', 'Full plantarflexion', 'Håll i toppen', 'Sänk med kontroll', 'Full stretch i botten'],
    techniquePoints: ['Full height', 'Control descent', 'No knee bend'],
    safetyData: {
      contraindications: ['Acute Achilles injury'],
      precautions: ['Achilles issues - gentle'],
      redFlags: ['Achilles pain', 'Calf cramps'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Calf muscles', targetStructure: 'Gastrocnemius, soleus',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Bilateral only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'Ankle surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Knee bend', 'Incomplete height'] }
    },
    evidenceBase: { level: 'B', source: 'Alfredson H. Calf strengthening. BJSM, 1998', studyType: 'Clinical study' }
  },

  // ============================================
  // PATELLOFEMORAL SPECIFIC
  // ============================================
  {
    id: 'knee_vmo_exercise',
    baseName: 'VMO Strengthening',
    baseNameSv: 'VMO-styrketräning',
    description: 'Targeted vastus medialis oblique activation',
    descriptionSv: 'Målinriktad vastus medialis oblique-aktivering',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'isometric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'ball'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,
    instructions: ['Sit with small ball between knees', 'Squeeze ball firmly', 'Add quad set simultaneously', 'Hold squeeze and contraction', 'Feel inner quad activate', 'Release slowly'],
    instructionsSv: ['Sitt med liten boll mellan knäna', 'Kläm bollen hårt', 'Lägg till quadricepskontraktion samtidigt', 'Håll kläm och kontraktion', 'Känn inre lårmuskel aktiveras', 'Släpp långsamt'],
    techniquePoints: ['Combine adduction and quad set', 'Feel VMO specifically', 'Sustain contraction'],
    safetyData: {
      contraindications: ['Acute patella dislocation'],
      precautions: ['Patellar instability - gentle'],
      redFlags: ['Patellar subluxation'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'VMO', targetStructure: 'Vastus medialis oblique',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Patellar surgery', 'MPFL reconstruction'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip adductor dominance'] }
    },
    evidenceBase: { level: 'B', source: 'Witvrouw E. VMO rehabilitation. Clin J Sport Med, 2000', studyType: 'Clinical study' }
  },

  {
    id: 'knee_patellar_mobilization',
    baseName: 'Patellar Mobilization',
    baseNameSv: 'Patellarmobilisering',
    description: 'Manual patellar gliding for mobility',
    descriptionSv: 'Manuell patellaglid för mobilitet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Sit with leg extended', 'Place thumbs on sides of kneecap', 'Glide kneecap side to side', 'Then glide up and down', 'Gentle sustained pressure', 'Relax quad during mobilization'],
    instructionsSv: ['Sitt med benet sträckt', 'Placera tummar på sidorna av knäskålen', 'Glid knäskålen från sida till sida', 'Sedan glid upp och ner', 'Mjukt ihållande tryck', 'Slappna av quadriceps under mobilisering'],
    techniquePoints: ['Quad relaxed', 'Gentle sustained glides', 'All directions'],
    safetyData: {
      contraindications: ['Patellar fracture', 'Acute dislocation'],
      precautions: ['Patellar instability - careful'],
      redFlags: ['Subluxation', 'Sharp pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Patellofemoral joint', targetStructure: 'Patellar mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle, per protocol'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA', 'Patellar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Quad guarding'] }
    },
    evidenceBase: { level: 'B', source: 'Crossley KM. PFP management. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // PLYOMETRICS
  // ============================================
  {
    id: 'knee_box_jump',
    baseName: 'Box Jump',
    baseNameSv: 'Boxhopp',
    description: 'Explosive jump onto elevated surface',
    descriptionSv: 'Explosivt hopp upp på upphöjd yta',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gastrocnemius'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'box',
    allowedEquipment: ['box', 'step'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: ['Stand facing box', 'Bend knees, swing arms back', 'Jump explosively onto box', 'Land softly with bent knees', 'Stand tall on box', 'Step down and repeat'],
    instructionsSv: ['Stå vänd mot boxen', 'Böj knäna, sväng armarna bakåt', 'Hoppa explosivt upp på boxen', 'Landa mjukt med böjda knän', 'Stå rakt upp på boxen', 'Stiga ner och upprepa'],
    techniquePoints: ['Soft landing', 'Knees over toes on landing', 'Full hip extension'],
    safetyData: {
      contraindications: ['Knee instability', 'Acute injury', 'Poor landing mechanics'],
      precautions: ['Start low', 'Master landing first'],
      redFlags: ['Knee pain on landing', 'Loss of control'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Power and control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Low box first'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus on landing', 'Hard landing'] }
    },
    evidenceBase: { level: 'B', source: 'Myer GD. Plyometric training. AJSM, 2006', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_depth_jump',
    baseName: 'Depth Jump',
    baseNameSv: 'Djuphopp',
    description: 'Drop and reactive jump for power',
    descriptionSv: 'Fall och reaktivt hopp för kraft',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gastrocnemius'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'box',
    allowedEquipment: ['box'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 8 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Stand on low box', 'Step off (dont jump)', 'Land and immediately jump up', 'Minimize ground contact time', 'Land softly on second landing', 'Reset and repeat'],
    instructionsSv: ['Stå på låg box', 'Stiga av (hoppa inte)', 'Landa och hoppa omedelbart upp', 'Minimera markkontakttid', 'Landa mjukt på andra landningen', 'Återställ och upprepa'],
    techniquePoints: ['Quick ground contact', 'Explosive rebound', 'Soft final landing'],
    safetyData: {
      contraindications: ['Knee instability', 'Poor landing mechanics', 'Recent injury'],
      precautions: ['Master box jump first', 'Start from low height'],
      redFlags: ['Knee pain', 'Loss of control'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Lower extremity', targetStructure: 'Reactive power',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Very low height'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 8, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Slow contact'] }
    },
    evidenceBase: { level: 'B', source: 'Myer GD. ACL prevention training. AJSM, 2006', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_lateral_hop',
    baseName: 'Lateral Hop',
    baseNameSv: 'Sidohopp',
    description: 'Side-to-side hopping for lateral control',
    descriptionSv: 'Sido-till-sido hoppning för lateral kontroll',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'gastrocnemius'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'cone'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on one leg', 'Hop laterally to other leg', 'Stick landing', 'Pause to stabilize', 'Hop back to other side', 'Control throughout'],
    instructionsSv: ['Stå på ett ben', 'Hoppa lateralt till andra benet', 'Håll landningen', 'Pausa för att stabilisera', 'Hoppa tillbaka till andra sidan', 'Kontroll genomgående'],
    techniquePoints: ['Soft landing', 'Knee over toes', 'Control before next hop'],
    safetyData: {
      contraindications: ['Knee instability', 'Ankle instability'],
      precautions: ['Master single leg balance first'],
      redFlags: ['Loss of control', 'Knee valgus'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Knee stabilizers', targetStructure: 'Lateral control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Small distance first'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Loss of balance'] }
    },
    evidenceBase: { level: 'A', source: 'Hewett TE. ACL prevention. AJSM, 2005', studyType: 'RCT' }
  },

  // ============================================
  // ADDITIONAL STRETCHES
  // ============================================
  {
    id: 'knee_calf_stretch',
    baseName: 'Calf Stretch',
    baseNameSv: 'Vadstretch',
    description: 'Gastrocnemius and soleus stretching',
    descriptionSv: 'Stretch av gastrocnemius och soleus',
    bodyRegion: 'knee',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'knee',
    exerciseType: 'stretch',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall', 'step'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: ['Stand facing wall', 'Step one foot back', 'Keep back heel on floor', 'Lean into wall with straight back knee', 'Feel stretch in upper calf', 'Then bend back knee for lower calf'],
    instructionsSv: ['Stå vänd mot vägg', 'Ta ett steg bakåt med en fot', 'Håll bakre hälen på golvet', 'Luta mot väggen med rakt bakre knä', 'Känn stretch i övre vaden', 'Böj sedan bakre knät för nedre vaden'],
    techniquePoints: ['Heel stays down', 'Straight knee for gastroc', 'Bent knee for soleus'],
    safetyData: {
      contraindications: ['Acute calf strain'],
      precautions: ['Achilles issues - gentle'],
      redFlags: ['Sharp pain', 'Achilles pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Calf muscles', targetStructure: 'Calf flexibility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Any knee surgery', 'Achilles surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Heel lifting'] }
    },
    evidenceBase: { level: 'B', source: 'Witvrouw E. Stretching and injury. Clin J Sport Med, 2004', studyType: 'Clinical review' }
  },

  {
    id: 'knee_it_band_stretch',
    baseName: 'IT Band Stretch',
    baseNameSv: 'IT-bandstretch',
    description: 'Iliotibial band stretching',
    descriptionSv: 'Stretch av iliotibialband',
    bodyRegion: 'knee',
    muscleGroups: ['tensor_fasciae_latae', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'stretch',
    basePosition: 'standing',
    allowedPositions: ['standing', 'side_lying'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall', 'foam_roller'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: ['Stand near wall', 'Cross leg behind the other', 'Push hip toward wall', 'Feel stretch on outer thigh/hip', 'Hold position', 'Repeat other side'],
    instructionsSv: ['Stå nära vägg', 'Korsa benet bakom det andra', 'Tryck höften mot väggen', 'Känn stretch på yttre lår/höft', 'Håll positionen', 'Upprepa andra sidan'],
    techniquePoints: ['Hip pushes out', 'Feel lateral stretch', 'Stay tall'],
    safetyData: {
      contraindications: ['Acute IT band syndrome'],
      precautions: ['Balance support'],
      redFlags: ['Sharp pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'IT band complex', targetStructure: 'IT band flexibility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Trunk bending'] }
    },
    evidenceBase: { level: 'C', source: 'Fredericson M. IT band syndrome. CJSM, 2000', studyType: 'Clinical review' }
  },

  // ============================================
  // PROPRIOCEPTION & BALANCE
  // ============================================
  {
    id: 'knee_single_leg_stand',
    baseName: 'Single Leg Stance',
    baseNameSv: 'Enbensståend',
    description: 'Balance training on one leg',
    descriptionSv: 'Balansträning på ett ben',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'tibialis_anterior'],
    jointType: 'knee',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'wobble_board', 'foam_pad', 'bosu'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Stand on one leg', 'Keep knee slightly bent', 'Maintain level pelvis', 'Eyes looking forward', 'Arms out for balance', 'Hold steady'],
    instructionsSv: ['Stå på ett ben', 'Håll knät lätt böjt', 'Bibehåll jämn bäcken', 'Ögonen framåt', 'Armar ut för balans', 'Håll stadigt'],
    techniquePoints: ['No hip drop', 'Knee over toes', 'Core engaged'],
    safetyData: {
      contraindications: ['Severe balance deficit - use support'],
      precautions: ['Near wall or rail for safety'],
      redFlags: ['Falls', 'Knee giving way'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Proprioceptors', targetStructure: 'Balance and control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['With support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip drop', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Kruse LM. Proprioceptive training. JOSPT, 2012', studyType: 'Meta-analysis' }
  },

  {
    id: 'knee_tandem_stance',
    baseName: 'Tandem Stance',
    baseNameSv: 'Tandemståend',
    description: 'Heel-to-toe balance stance',
    descriptionSv: 'Häl-till-tå balansståend',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'core'],
    jointType: 'knee',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'foam_pad'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 20,
    instructions: ['Place one foot directly in front of other', 'Heel touches toes', 'Stand tall', 'Arms out if needed', 'Look forward', 'Hold balance'],
    instructionsSv: ['Placera en fot direkt framför den andra', 'Hälen rör tårna', 'Stå rakt', 'Armar ut vid behov', 'Titta framåt', 'Håll balansen'],
    techniquePoints: ['Narrow base challenge', 'Keep hips level', 'Stay relaxed'],
    safetyData: {
      contraindications: ['Severe balance deficit'],
      precautions: ['Support nearby'],
      redFlags: ['Repeated falls'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Proprioceptors', targetStructure: 'Narrow base balance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Light support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Wide stance'] }
    },
    evidenceBase: { level: 'B', source: 'Plisky PJ. Balance assessment. JOSPT, 2006', studyType: 'Clinical study' }
  },

  {
    id: 'knee_star_excursion',
    baseName: 'Star Excursion Balance',
    baseNameSv: 'Stjärnbalanstest',
    description: 'Dynamic reach in multiple directions while balancing',
    descriptionSv: 'Dynamisk räckvidd i flera riktningar under balans',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'hamstrings', 'core'],
    jointType: 'knee',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'tape'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 8 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand on one leg at center', 'Reach other foot in each direction', 'Anterior, posterolateral, posteromedial', 'Touch ground lightly', 'Return to center each time', 'Control throughout'],
    instructionsSv: ['Stå på ett ben i mitten', 'Sträck andra foten i varje riktning', 'Framåt, bakåt-lateralt, bakåt-medialt', 'Vidrör marken lätt', 'Återvänd till mitten varje gång', 'Kontroll genomgående'],
    techniquePoints: ['Maximize reach distance', 'Light touch only', 'No loss of balance'],
    safetyData: {
      contraindications: ['Knee instability untreated', 'Acute injury'],
      precautions: ['Balance support if needed'],
      redFlags: ['Knee giving way', 'Pain with reach'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Proprioceptors, ACL', targetStructure: 'Dynamic balance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited reach'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 8, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Hip drop'] }
    },
    evidenceBase: { level: 'A', source: 'Plisky PJ. Star excursion balance test. JOSPT, 2006', studyType: 'Validation study' }
  },

  {
    id: 'knee_wobble_board_bilateral',
    baseName: 'Wobble Board Balance',
    baseNameSv: 'Balansbrädbalans',
    description: 'Balance training on unstable surface',
    descriptionSv: 'Balansträning på instabil yta',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'tibialis_anterior', 'peroneus', 'core'],
    jointType: 'knee',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wobble_board',
    allowedEquipment: ['wobble_board', 'bosu', 'foam_pad'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Stand on wobble board with both feet', 'Keep edges from touching ground', 'Maintain level platform', 'Knees slightly bent', 'Eyes forward', 'Stay centered'],
    instructionsSv: ['Stå på balansbrädan med båda fötterna', 'Håll kanterna från att röra marken', 'Bibehåll jämn plattform', 'Knäna lätt böjda', 'Ögonen framåt', 'Stanna centrerad'],
    techniquePoints: ['Small corrections', 'Stay relaxed', 'Knee bent absorbs motion'],
    safetyData: {
      contraindications: ['Severe instability'],
      precautions: ['Near wall or rail'],
      redFlags: ['Falls', 'Knee pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Proprioceptors', targetStructure: 'Ankle-knee stability chain',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Bilateral only, support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'Ankle surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Edge touching', 'Wide stance'] }
    },
    evidenceBase: { level: 'A', source: 'Verhagen E. Balance training. BJSM, 2004', studyType: 'RCT' }
  },

  {
    id: 'knee_bosu_squat',
    baseName: 'BOSU Ball Squat',
    baseNameSv: 'BOSU-bollknäböj',
    description: 'Squat on unstable BOSU surface',
    descriptionSv: 'Knäböj på instabil BOSU-yta',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'core'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'bosu',
    allowedEquipment: ['bosu'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand on BOSU dome side up', 'Feet shoulder width apart', 'Perform controlled squat', 'Knees track over toes', 'Maintain balance throughout', 'Return to standing'],
    instructionsSv: ['Stå på BOSU med kupol uppåt', 'Fötterna axelbrett isär', 'Utför kontrollerad knäböj', 'Knäna följer tårna', 'Bibehåll balans genomgående', 'Återgå till stående'],
    techniquePoints: ['Control descent', 'Knee alignment', 'Core engaged'],
    safetyData: {
      contraindications: ['Poor balance', 'Knee instability'],
      precautions: ['Near support'],
      redFlags: ['Falls', 'Knee giving way'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Stability under load',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial depth'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Loss of balance'] }
    },
    evidenceBase: { level: 'B', source: 'Behm DG. Instability training. JSCR, 2010', studyType: 'Research review' }
  },

  // ============================================
  // NORDIC HAMSTRING & ECCENTRIC
  // ============================================
  {
    id: 'knee_nordic_hamstring',
    baseName: 'Nordic Hamstring Curl',
    baseNameSv: 'Nordisk Hamstringcurl',
    description: 'Eccentric hamstring strengthening for injury prevention',
    descriptionSv: 'Excentrisk hamstringträning för skadeprevention',
    bodyRegion: 'knee',
    muscleGroups: ['hamstrings', 'gastrocnemius'],
    jointType: 'knee',
    exerciseType: 'eccentric',
    basePosition: 'kneeling',
    allowedPositions: ['kneeling'],
    baseEquipment: 'partner',
    allowedEquipment: ['partner', 'anchor', 'machine'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: ['Kneel with partner holding ankles', 'Cross arms over chest', 'Slowly lean forward', 'Control descent with hamstrings', 'Lower as far as possible', 'Catch with hands and push back'],
    instructionsSv: ['Knäböj med partner som håller fotlederna', 'Korsa armarna över bröstet', 'Luta dig långsamt framåt', 'Kontrollera nedsänkningen med hamstrings', 'Sänk så långt som möjligt', 'Ta emot med händerna och tryck tillbaka'],
    techniquePoints: ['Maintain hip extension', 'Control through full range', 'Eccentric focus'],
    safetyData: {
      contraindications: ['Acute hamstring strain', 'Knee pain with flexion'],
      precautions: ['Start with partial range', 'Adequate warm-up'],
      redFlags: ['Sharp hamstring pain', 'Cramping'],
      maxPainDuring: 3, maxPainAfter24h: 3,
      healingTissue: 'Hamstring muscles', targetStructure: 'Eccentric hamstring strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip flexion', 'Early hand catch'] }
    },
    evidenceBase: { level: 'A', source: 'Petersen J. Nordic hamstring exercise. BJSM, 2011', studyType: 'RCT' }
  },

  {
    id: 'knee_eccentric_step_down',
    baseName: 'Eccentric Step Down',
    baseNameSv: 'Excentrisk Stegner',
    description: 'Controlled eccentric lowering from step',
    descriptionSv: 'Kontrollerad excentrisk sänkning från steg',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius'],
    jointType: 'knee',
    exerciseType: 'eccentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'stair'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand on step edge', 'Lower opposite foot toward floor', 'Control descent with stance leg', '3-5 second lower', 'Light tap on floor', 'Return without pushing off floor'],
    instructionsSv: ['Stå på stegkant', 'Sänk motsatta foten mot golvet', 'Kontrollera nedsänkning med ståben', '3-5 sekunders sänkning', 'Lätt tapp på golvet', 'Återgå utan att trycka från golvet'],
    techniquePoints: ['Slow controlled descent', 'Knee over toes', 'No hip drop'],
    safetyData: {
      contraindications: ['Acute patellar tendinopathy', 'Knee instability'],
      precautions: ['Start low step', 'Rail for balance'],
      redFlags: ['Sharp knee pain', 'Giving way'],
      maxPainDuring: 4, maxPainAfter24h: 2,
      healingTissue: 'Patellar tendon, quadriceps', targetStructure: 'Eccentric quad strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Low step, partial range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'Patellar tendon surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip drop', 'Fast descent'] }
    },
    evidenceBase: { level: 'A', source: 'Kongsgaard M. Eccentric exercises for tendinopathy. SJMSS, 2009', studyType: 'RCT' }
  },

  {
    id: 'knee_spanish_squat',
    baseName: 'Spanish Squat',
    baseNameSv: 'Spansk Knäböj',
    description: 'Band-assisted squat reducing anterior knee stress',
    descriptionSv: 'Bandassisterad knäböj som minskar främre knästress',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 30,
    baseRestSeconds: 60,
    instructions: ['Loop band behind knees, anchor to stable object', 'Lean back into band', 'Squat keeping vertical shins', 'Hold at chosen depth', 'Band provides posterior force', 'Reduces patellar stress'],
    instructionsSv: ['Slinga band bakom knäna, förankra till stabil punkt', 'Luta dig bakåt mot bandet', 'Knäböj med vertikala skenben', 'Håll vid vald djup', 'Bandet ger bakåt-kraft', 'Minskar patellär stress'],
    techniquePoints: ['Vertical tibias', 'Lean back into band', 'Comfortable depth'],
    safetyData: {
      contraindications: ['Band allergy'],
      precautions: ['Secure anchor point'],
      redFlags: ['Band snap', 'Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Patellar tendon', targetStructure: 'Isometric quad with reduced stress',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Shallow depth'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Patellar tendon repair'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Forward knee drift'] }
    },
    evidenceBase: { level: 'B', source: 'Rio E. Isometric exercises for tendinopathy. BJSM, 2015', studyType: 'Clinical study' }
  },

  // ============================================
  // FUNCTIONAL MOVEMENT PATTERNS
  // ============================================
  {
    id: 'knee_lateral_step_over',
    baseName: 'Lateral Step Over',
    baseNameSv: 'Lateralt Stegöver',
    description: 'Lateral movement over obstacle',
    descriptionSv: 'Lateral rörelse över hinder',
    bodyRegion: 'knee',
    muscleGroups: ['gluteus_medius', 'quadriceps', 'hip_adductors'],
    jointType: 'knee',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'hurdle',
    allowedEquipment: ['hurdle', 'cone', 'tape'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand beside low hurdle', 'Step sideways over hurdle', 'Lead with near leg', 'Follow with trailing leg', 'Control landing', 'Return in same direction'],
    instructionsSv: ['Stå bredvid lågt hinder', 'Stega åt sidan över hindret', 'Led med närmaste benet', 'Följ med efterföljande ben', 'Kontrollera landning', 'Återvänd i samma riktning'],
    techniquePoints: ['Controlled movement', 'Knee over toe', 'Hip stable'],
    safetyData: {
      contraindications: ['Lateral knee instability'],
      precautions: ['Start with low hurdle'],
      redFlags: ['Knee giving way laterally'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'MCL, lateral structures', targetStructure: 'Lateral stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Very low obstacle'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'MCL repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip hike', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Myer GD. Movement training. AJSM, 2008', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_forward_step_over',
    baseName: 'Forward Step Over',
    baseNameSv: 'Framåt Stegöver',
    description: 'Forward movement over obstacles',
    descriptionSv: 'Framåt rörelse över hinder',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hip_flexors', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'hurdle',
    allowedEquipment: ['hurdle', 'cone'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Stand facing hurdle line', 'Step over each hurdle', 'Lift knee high to clear', 'Land with control', 'Maintain upright posture', 'Continue forward'],
    instructionsSv: ['Stå vänd mot hinderrad', 'Stega över varje hinder', 'Lyft knät högt för att klara', 'Landa med kontroll', 'Bibehåll upprätt hållning', 'Fortsätt framåt'],
    techniquePoints: ['High knee lift', 'Controlled landing', 'No hurdle contact'],
    safetyData: {
      contraindications: ['Significant ROM limitation'],
      precautions: ['Start low'],
      redFlags: ['Tripping', 'Knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Hip flexors, knee extensors', targetStructure: 'Functional mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Low hurdles'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip circumduction', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Wilk KE. Functional progression. JOSPT, 2012', studyType: 'Clinical review' }
  },

  {
    id: 'knee_lateral_shuffle',
    baseName: 'Lateral Shuffle',
    baseNameSv: 'Lateral Shuffle',
    description: 'Lateral movement pattern training',
    descriptionSv: 'Lateral rörelsemönsterträning',
    bodyRegion: 'knee',
    muscleGroups: ['gluteus_medius', 'quadriceps', 'hip_adductors'],
    jointType: 'knee',
    exerciseType: 'agility',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'cones'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Athletic stance, knees bent', 'Lead with outside foot', 'Push off inside foot', 'Stay low throughout', 'Quick lateral steps', 'Keep feet from crossing'],
    instructionsSv: ['Atletisk position, knän böjda', 'Led med yttre foten', 'Tryck ifrån med inre foten', 'Stanna låg genomgående', 'Snabba laterala steg', 'Håll fötterna från att korsas'],
    techniquePoints: ['Stay low', 'Quick feet', 'No crossing'],
    safetyData: {
      contraindications: ['Lateral knee instability', 'Acute injury'],
      precautions: ['Start slow'],
      redFlags: ['Knee giving way', 'Pain'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'MCL, lateral structures', targetStructure: 'Lateral movement pattern',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Slow, controlled'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'MCL repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Upright stance', 'Feet crossing'] }
    },
    evidenceBase: { level: 'B', source: 'Hewett TE. ACL prevention. AJSM, 2006', studyType: 'Research review' }
  },

  {
    id: 'knee_carioca',
    baseName: 'Carioca Drill',
    baseNameSv: 'Carioca-övning',
    description: 'Crossover lateral movement pattern',
    descriptionSv: 'Korsande lateralt rörelsemönster',
    bodyRegion: 'knee',
    muscleGroups: ['gluteus_medius', 'hip_adductors', 'core', 'hip_flexors'],
    jointType: 'knee',
    exerciseType: 'agility',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Move laterally', 'Cross trailing foot in front', 'Then behind', 'Rotate hips with each step', 'Keep upper body facing forward', 'Quick rhythmic feet'],
    instructionsSv: ['Rör dig lateralt', 'Korsa efterföljande fot framför', 'Sedan bakom', 'Rotera höfterna med varje steg', 'Håll överkroppen vänd framåt', 'Snabba rytmiska fötter'],
    techniquePoints: ['Hip rotation', 'Quick transitions', 'Upper body stable'],
    safetyData: {
      contraindications: ['Rotational knee instability', 'Balance issues'],
      precautions: ['Start slow'],
      redFlags: ['Knee pivot pain', 'Falls'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL, rotational structures', targetStructure: 'Rotational control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Slow, controlled'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 14, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Stiff hips', 'Poor rhythm'] }
    },
    evidenceBase: { level: 'B', source: 'Chimera NJ. Agility drills. JSCR, 2004', studyType: 'Clinical study' }
  },

  // ============================================
  // PLYOMETRICS - ADDITIONAL
  // ============================================
  {
    id: 'knee_lateral_hop',
    baseName: 'Lateral Single Leg Hop',
    baseNameSv: 'Lateralt Enbenshopp',
    description: 'Side-to-side hopping for lateral stability',
    descriptionSv: 'Hopp från sida till sida för lateral stabilitet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'gastrocnemius'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'line', 'tape'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on one leg', 'Hop side to side over line', 'Land softly on same leg', 'Immediately hop back', 'Control each landing', 'Quick transitions'],
    instructionsSv: ['Stå på ett ben', 'Hoppa från sida till sida över linje', 'Landa mjukt på samma ben', 'Hoppa omedelbart tillbaka', 'Kontrollera varje landning', 'Snabba övergångar'],
    techniquePoints: ['Soft landing', 'Knee over toe', 'Quick transition'],
    safetyData: {
      contraindications: ['Lateral instability', 'Acute injury'],
      precautions: ['Master landing first'],
      redFlags: ['Knee valgus on landing', 'Pain'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL, MCL', targetStructure: 'Lateral plyometric control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Small hops first'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 14, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Hard landing'] }
    },
    evidenceBase: { level: 'B', source: 'Hewett TE. Plyometric training. AJSM, 2006', studyType: 'RCT' }
  },

  {
    id: 'knee_forward_hop',
    baseName: 'Single Leg Forward Hop',
    baseNameSv: 'Enbens Framåthopp',
    description: 'Single leg hopping for distance',
    descriptionSv: 'Enbenshopp för distans',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gastrocnemius'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: ['Stand on one leg', 'Swing arms and hop forward', 'Land on same leg', 'Stick the landing', 'Hold 2 seconds', 'Reset and repeat'],
    instructionsSv: ['Stå på ett ben', 'Sväng armarna och hoppa framåt', 'Landa på samma ben', 'Landa stabilt', 'Håll 2 sekunder', 'Återställ och upprepa'],
    techniquePoints: ['Explosive takeoff', 'Controlled landing', 'Stick the landing'],
    safetyData: {
      contraindications: ['Knee instability', 'Poor landing mechanics'],
      precautions: ['Master double leg first'],
      redFlags: ['Knee pain', 'Giving way'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL, patellar tendon', targetStructure: 'Single leg power',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Short distance first'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 14, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Unstable landing'] }
    },
    evidenceBase: { level: 'A', source: 'Noyes FR. Hop tests. AJSM, 1991', studyType: 'Validation study' }
  },

  {
    id: 'knee_triple_hop',
    baseName: 'Triple Hop for Distance',
    baseNameSv: 'Trippelhopp för Distans',
    description: 'Three consecutive single leg hops',
    descriptionSv: 'Tre konsekutiva enbenshopp',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gastrocnemius', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'tape'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Stand on one leg', 'Perform 3 consecutive forward hops', 'Maximize distance', 'Land and immediately hop', 'Stick final landing', 'Measure total distance'],
    instructionsSv: ['Stå på ett ben', 'Utför 3 konsekutiva framåthopp', 'Maximera distansen', 'Landa och hoppa omedelbart', 'Landa stabilt i slutet', 'Mät total distans'],
    techniquePoints: ['Continuous hopping', 'Maximize each hop', 'Control final landing'],
    safetyData: {
      contraindications: ['Knee instability', 'Poor single hop mechanics'],
      precautions: ['Master single hop first'],
      redFlags: ['Knee pain', 'Loss of control'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL, all knee structures', targetStructure: 'Power endurance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Reduce intensity'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 21, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Loss of height'] }
    },
    evidenceBase: { level: 'A', source: 'Noyes FR. Hop tests. AJSM, 1991', studyType: 'Validation study' }
  },

  {
    id: 'knee_crossover_hop',
    baseName: 'Crossover Hop for Distance',
    baseNameSv: 'Korsningshopp för Distans',
    description: 'Diagonal hopping pattern for rotational control',
    descriptionSv: 'Diagonalt hoppmönster för rotationskontroll',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'gastrocnemius', 'core'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'tape',
    allowedEquipment: ['tape', 'line'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Stand on one leg beside line', 'Hop forward crossing over line', 'Then hop crossing back', 'Three total hops alternating sides', 'Stick final landing', 'Measure distance'],
    instructionsSv: ['Stå på ett ben bredvid linje', 'Hoppa framåt och korsa linjen', 'Sedan hoppa tillbaka', 'Tre hopp totalt alternera sidor', 'Landa stabilt i slutet', 'Mät distans'],
    techniquePoints: ['Controlled rotation', 'Stay on line', 'Maximize distance'],
    safetyData: {
      contraindications: ['Rotational instability', 'Poor hop mechanics'],
      precautions: ['Master forward hop first'],
      redFlags: ['Knee pivot pain', 'Loss of balance'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL, rotational structures', targetStructure: 'Rotational plyometric control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Slow speed first'] }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 21, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Poor line control', 'Knee valgus'] }
    },
    evidenceBase: { level: 'A', source: 'Noyes FR. Hop tests. AJSM, 1991', studyType: 'Validation study' }
  },

  {
    id: 'knee_tuck_jump',
    baseName: 'Tuck Jump',
    baseNameSv: 'Tuck Jump',
    description: 'Vertical jump bringing knees to chest',
    descriptionSv: 'Vertikalhopp med knäna mot bröstet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'hip_flexors', 'core'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand with feet shoulder width', 'Jump vertically', 'Pull knees toward chest at peak', 'Extend legs for landing', 'Land softly with bent knees', 'Immediately jump again'],
    instructionsSv: ['Stå med fötterna axelbrett', 'Hoppa vertikalt', 'Dra knäna mot bröstet i toppen', 'Sträck benen för landning', 'Landa mjukt med böjda knän', 'Hoppa omedelbart igen'],
    techniquePoints: ['Maximum height', 'Quick tuck', 'Soft landing'],
    safetyData: {
      contraindications: ['Knee instability', 'Acute injury'],
      precautions: ['Master basic jumping first'],
      redFlags: ['Knee pain', 'Poor landing'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Knee extensors', targetStructure: 'Explosive power',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 14, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Poor height'] }
    },
    evidenceBase: { level: 'B', source: 'Myer GD. Tuck jump assessment. CJSM, 2008', studyType: 'Validation study' }
  },

  // ============================================
  // MENISCUS-SPECIFIC EXERCISES
  // ============================================
  {
    id: 'knee_meniscus_loading',
    baseName: 'Partial Weight Bearing Marching',
    baseNameSv: 'Partiell Belastningsmarsch',
    description: 'Gentle weight shifting for meniscus healing',
    descriptionSv: 'Försiktig viktförskjutning för meniskhläkning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hip_flexors'],
    jointType: 'knee',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'crutches',
    allowedEquipment: ['crutches', 'walker', 'parallel_bars'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand with support', 'Shift weight side to side', 'Lift foot slightly', 'Gentle marching motion', 'Keep within pain limits', 'Progress weight as tolerated'],
    instructionsSv: ['Stå med stöd', 'Förskjut vikten från sida till sida', 'Lyft foten lätt', 'Försiktig marschrörelse', 'Håll dig inom smärtgränser', 'Öka vikten efter tolerans'],
    techniquePoints: ['Controlled weight shift', 'Minimal foot lift', 'Stay pain-free'],
    safetyData: {
      contraindications: ['Full weight bearing restricted'],
      precautions: ['Follow surgical protocol exactly'],
      redFlags: ['Increased swelling', 'Locking', 'Giving way'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Meniscus', targetStructure: 'Early weight bearing',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Per protocol weight bearing'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Meniscus repair', 'Meniscectomy'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Limping'] }
    },
    evidenceBase: { level: 'A', source: 'Brindle T. Meniscus repair protocols. JOSPT, 2001', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_limited_arc_leg_press',
    baseName: 'Limited Arc Leg Press',
    baseNameSv: 'Begränsad Båge Benpress',
    description: 'Leg press in protected range for meniscus',
    descriptionSv: 'Benpress i skyddad rörelseomfång för menisk',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'leg_press',
    allowedEquipment: ['leg_press'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Position in leg press', 'Limit range to 0-60° flexion', 'Press through heels', 'Control the descent', 'Do not fully flex knee', 'Maintain smooth motion'],
    instructionsSv: ['Positionera i benpress', 'Begränsa rörelse till 0-60° flexion', 'Tryck genom hälarna', 'Kontrollera nedsänkningen', 'Böj inte knät helt', 'Bibehåll mjuk rörelse'],
    techniquePoints: ['Stay in protected range', 'Heels on platform', 'Control throughout'],
    safetyData: {
      contraindications: ['Full depth prohibited', 'Non-weight bearing status'],
      precautions: ['Follow ROM restrictions'],
      redFlags: ['Joint line pain', 'Clicking', 'Locking'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Meniscus', targetStructure: 'Quad strengthening protected range',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['0-60° only', 'Light weight'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Progress range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Meniscus repair', 'Meniscectomy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Exceeding ROM', 'Asymmetric push'] }
    },
    evidenceBase: { level: 'A', source: 'Brindle T. Meniscus rehabilitation. JOSPT, 2001', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // TKA-SPECIFIC EXERCISES
  // ============================================
  {
    id: 'knee_tka_heel_slides',
    baseName: 'TKA Heel Slides',
    baseNameSv: 'TKA Hälglidningar',
    description: 'ROM exercise specific for total knee replacement',
    descriptionSv: 'ROM-övning specifik för total knäprotes',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'sheet', 'strap'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 4, max: 5 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Lie on back, leg extended', 'Slide heel toward buttock', 'Use sheet to assist if needed', 'Hold at end range', 'Slide back to straight', 'Repeat frequently throughout day'],
    instructionsSv: ['Ligg på rygg, benet sträckt', 'Glid hälen mot sätet', 'Använd lakan för hjälp vid behov', 'Håll i slutläge', 'Glid tillbaka till rakt', 'Upprepa ofta under dagen'],
    techniquePoints: ['Maximize ROM each rep', 'Gentle sustained stretch', 'Frequent throughout day'],
    safetyData: {
      contraindications: ['Wound complications', 'DVT'],
      precautions: ['Stop if sharp pain'],
      redFlags: ['Severe pain', 'Inability to progress ROM'],
      maxPainDuring: 4, maxPainAfter24h: 3,
      healingTissue: 'Surgical site, joint capsule', targetStructure: 'Knee flexion ROM',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Per surgeon protocol'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['TKA', 'UKA'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 3, maxPainAfter: 2, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Hip rotation'] }
    },
    evidenceBase: { level: 'A', source: 'Bade MJ. TKA rehabilitation. JOSPT, 2017', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_tka_extension_hang',
    baseName: 'TKA Extension Hang',
    baseNameSv: 'TKA Extensionshäng',
    description: 'Passive extension for TKA ROM',
    descriptionSv: 'Passiv extension för TKA ROM',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'towel',
    allowedEquipment: ['towel', 'roll'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 60,
    baseRestSeconds: 30,
    instructions: ['Lie on back', 'Place roll under ankle', 'Let knee hang in extension', 'Gravity provides stretch', 'Can add light weight on thigh', 'Hold 1-2 minutes'],
    instructionsSv: ['Ligg på rygg', 'Placera rulle under fotleden', 'Låt knät hänga i extension', 'Tyngdkraften ger stretch', 'Kan lägga till lätt vikt på låret', 'Håll 1-2 minuter'],
    techniquePoints: ['Relax completely', 'Sustained position', 'Achieve full extension'],
    safetyData: {
      contraindications: ['Hyperextension restriction', 'Wound issues'],
      precautions: ['Monitor skin under ankle'],
      redFlags: ['Inability to relax', 'Posterior knee pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Posterior capsule', targetStructure: 'Knee extension ROM',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['TKA', 'UKA', 'ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 3, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Hip flexion'] }
    },
    evidenceBase: { level: 'A', source: 'Bade MJ. TKA rehabilitation. JOSPT, 2017', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_tka_stationary_bike',
    baseName: 'TKA Stationary Bike',
    baseNameSv: 'TKA Stationär Cykel',
    description: 'Cycling for TKA ROM and endurance',
    descriptionSv: 'Cykling för TKA ROM och uthållighet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'aerobic',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'stationary_bike',
    allowedEquipment: ['stationary_bike'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 1, max: 1 },
    baseHoldSeconds: 600,
    baseRestSeconds: 0,
    instructions: ['Set seat height appropriately', 'Start with rocking back and forth', 'Progress to full revolutions', 'No resistance initially', 'Aim for 10-15 minutes', 'Increase as tolerated'],
    instructionsSv: ['Ställ in sadelhöjden korrekt', 'Börja med att vagga fram och tillbaka', 'Utveckla till fulla varv', 'Inget motstånd initialt', 'Sikta på 10-15 minuter', 'Öka efter tolerans'],
    techniquePoints: ['Start with rocking if needed', 'Progress to full circles', 'No pain'],
    safetyData: {
      contraindications: ['Insufficient ROM for cycling'],
      precautions: ['Raise seat if ROM limited'],
      redFlags: ['Increased swelling after', 'Pain during'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'ROM and cardiovascular',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Rocking only if ROM limited'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['TKA', 'UKA', 'ACL reconstruction', 'Meniscus surgery'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Unable to complete revolution'] }
    },
    evidenceBase: { level: 'A', source: 'Bade MJ. TKA rehabilitation. JOSPT, 2017', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // ACL-SPECIFIC EXERCISES
  // ============================================
  {
    id: 'knee_acl_prone_hang',
    baseName: 'Prone Knee Extension Hang',
    baseNameSv: 'Pronliggande Knäextensionshäng',
    description: 'Passive extension specific for ACL rehab',
    descriptionSv: 'Passiv extension specifik för ACL-rehab',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'stretch',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'ankle_weight'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 120,
    baseRestSeconds: 30,
    instructions: ['Lie face down', 'Hang leg off table edge at knee', 'Gravity extends knee', 'Can add light ankle weight', 'Hold 2 minutes', 'Multiple times daily'],
    instructionsSv: ['Ligg på mage', 'Häng benet över bordskant vid knät', 'Tyngdkraften sträcker knät', 'Kan lägga till lätt fotledsvikt', 'Håll 2 minuter', 'Flera gånger dagligen'],
    techniquePoints: ['Full relaxation', 'Achieve symmetrical extension', 'Frequent repetition'],
    safetyData: {
      contraindications: ['Graft complications'],
      precautions: ['Per surgeon protocol'],
      redFlags: ['Graft pain', 'Increased instability'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'ACL graft, posterior capsule', targetStructure: 'Full knee extension',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 3, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Hip rotation'] }
    },
    evidenceBase: { level: 'A', source: 'van Melick N. ACL CPG. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_acl_quad_activation',
    baseName: 'ACL Quad Activation',
    baseNameSv: 'ACL Quadricepsaktivering',
    description: 'Early quadriceps activation post ACL surgery',
    descriptionSv: 'Tidig quadricepsaktivering efter ACL-kirurgi',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'isometric',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'biofeedback', 'nmes'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 4, max: 5 },
    baseHoldSeconds: 5,
    baseRestSeconds: 15,
    instructions: ['Lie with knee straight', 'Focus on tightening quad', 'Push knee toward surface', 'Feel patella lift', 'Hold contraction 5 seconds', 'Repeat frequently'],
    instructionsSv: ['Ligg med knät rakt', 'Fokusera på att spänna quadriceps', 'Tryck knät mot underlaget', 'Känn knäskålen lyfta', 'Håll kontraktion 5 sekunder', 'Upprepa ofta'],
    techniquePoints: ['Maximum contraction', 'Visible VMO activation', 'Frequent throughout day'],
    safetyData: {
      contraindications: ['Graft site pain'],
      precautions: ['Gentle initially'],
      redFlags: ['Inability to contract', 'Graft site pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'ACL graft', targetStructure: 'Quadriceps activation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['No visible contraction'] }
    },
    evidenceBase: { level: 'A', source: 'van Melick N. ACL CPG. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // PATELLOFEMORAL - ADDITIONAL
  // ============================================
  {
    id: 'knee_pfp_terminal_extension',
    baseName: 'PFP Short Arc Quad',
    baseNameSv: 'PFP Kort Båge Quad',
    description: 'Terminal extension for patellofemoral patients',
    descriptionSv: 'Slutextension för patellofemorala patienter',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],
    baseEquipment: 'roll',
    allowedEquipment: ['roll', 'towel'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Place roll under knee', 'Start at 30° flexion', 'Lift foot straightening knee', 'Hold at full extension', 'Lower with control', 'Stay in pain-free range'],
    instructionsSv: ['Placera rulle under knät', 'Börja vid 30° flexion', 'Lyft foten och sträck knät', 'Håll i full extension', 'Sänk med kontroll', 'Stanna i smärtfritt rörelseomfång'],
    techniquePoints: ['Pain-free range only', 'Full terminal extension', 'Control throughout'],
    safetyData: {
      contraindications: ['Pain in terminal extension'],
      precautions: ['Stay pain-free'],
      redFlags: ['Crepitus with pain', 'Swelling after'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Patellofemoral joint', targetStructure: 'Quad in protected range',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Patellar surgery', 'MPFL reconstruction', 'ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Incomplete extension'] }
    },
    evidenceBase: { level: 'A', source: 'Crossley KM. PFP CPG. BJSM, 2016', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'knee_hip_strength_pfp',
    baseName: 'Hip Strengthening for PFP',
    baseNameSv: 'Höftstyrka för PFP',
    description: 'Hip abduction and external rotation for patellofemoral pain',
    descriptionSv: 'Höftabduktion och utåtrotation för patellofemoral smärta',
    bodyRegion: 'knee',
    muscleGroups: ['gluteus_medius', 'gluteus_maximus', 'hip_external_rotators'],
    jointType: 'knee',
    exerciseType: 'concentric',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'resistance_band', 'ankle_weight'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,
    instructions: ['Lie on side with affected leg up', 'Keep hips stacked', 'Lift leg toward ceiling', 'Slight external rotation', 'Hold at top', 'Lower with control'],
    instructionsSv: ['Ligg på sidan med påverkat ben uppåt', 'Håll höfterna staplade', 'Lyft benet mot taket', 'Lätt utåtrotation', 'Håll i toppen', 'Sänk med kontroll'],
    techniquePoints: ['Maintain hip stack', 'Lead with heel', 'No trunk rotation'],
    safetyData: {
      contraindications: ['Hip pain'],
      precautions: ['Start without resistance'],
      redFlags: ['Hip pain', 'Knee pain during'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Hip abductors', targetStructure: 'Hip-knee control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['No resistance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Patellar surgery', 'MPFL reconstruction', 'ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip flexion', 'Trunk rotation'] }
    },
    evidenceBase: { level: 'A', source: 'Crossley KM. Hip-focused therapy for PFP. BJSM, 2011', studyType: 'RCT' }
  },

  // ============================================
  // KNEE STABILITY EXERCISES
  // ============================================
  {
    id: 'knee_clock_lunges',
    baseName: 'Clock Lunges',
    baseNameSv: 'Klocklunges',
    description: 'Lunges in multiple directions for stability',
    descriptionSv: 'Utfall i flera riktningar för stabilitet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gluteus_medius', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand at center of imaginary clock', 'Lunge to 12, 2, 3, 5, 6 oclock', 'Each lunge returns to center', 'Control movement throughout', 'Keep stance knee aligned', 'Work all directions'],
    instructionsSv: ['Stå i mitten av en tänkt klocka', 'Gör utfall till kl 12, 2, 3, 5, 6', 'Varje utfall återvänder till mitten', 'Kontrollera rörelsen genomgående', 'Håll ståknät i linje', 'Arbeta alla riktningar'],
    techniquePoints: ['Stance leg controls', 'Multiple planes', 'Return to center'],
    safetyData: {
      contraindications: ['Knee instability in multiple planes'],
      precautions: ['Start with limited directions'],
      redFlags: ['Knee giving way', 'Pain in any direction'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Knee complex', targetStructure: 'Multiplanar stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Forward only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Myer GD. Multiplanar training. AJSM, 2008', studyType: 'Biomechanical analysis' }
  },

  {
    id: 'knee_rotation_control',
    baseName: 'Knee Rotation Control',
    baseNameSv: 'Knärotationskontroll',
    description: 'Resisted rotation for rotational stability',
    descriptionSv: 'Motståndsrotation för rotationsstabilitet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'hip_external_rotators'],
    jointType: 'knee',
    exerciseType: 'stability',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,
    instructions: ['Sit with band around foot', 'Keep knee still', 'Rotate foot against band', 'Both internal and external', 'Control throughout range', 'Maintain knee position'],
    instructionsSv: ['Sitt med band runt foten', 'Håll knät stilla', 'Rotera foten mot bandet', 'Både inåt och utåt', 'Kontroll genom hela rörelsen', 'Bibehåll knäposition'],
    techniquePoints: ['Isolated rotation', 'Knee stays stable', 'Control band'],
    safetyData: {
      contraindications: ['Rotational instability untreated'],
      precautions: ['Light resistance first'],
      redFlags: ['Rotational pain', 'Clicking'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Rotational structures', targetStructure: 'Rotational control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very light resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee movement'] }
    },
    evidenceBase: { level: 'B', source: 'Wilk KE. ACL rehabilitation. JOSPT, 2012', studyType: 'Clinical review' }
  },

  // ============================================
  // FOAM ROLLING & SOFT TISSUE
  // ============================================
  {
    id: 'knee_quad_foam_roll',
    baseName: 'Quadriceps Foam Rolling',
    baseNameSv: 'Quadriceps Foamrolling',
    description: 'Self-myofascial release for quadriceps',
    descriptionSv: 'Självmassage för quadriceps',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'tensor_fasciae_latae'],
    jointType: 'knee',
    exerciseType: 'soft_tissue',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'foam_roller',
    allowedEquipment: ['foam_roller', 'massage_ball'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Lie face down with roller under thigh', 'Roll from hip to knee', 'Pause on tender spots', 'Breathe through discomfort', 'Rotate to hit all areas', 'Spend 30-60 seconds per side'],
    instructionsSv: ['Ligg på mage med rulle under låret', 'Rulla från höft till knä', 'Pausa på ömma punkter', 'Andas genom obehag', 'Rotera för att träffa alla områden', 'Spendera 30-60 sekunder per sida'],
    techniquePoints: ['Slow rolling', 'Pause on tender spots', 'Breathe'],
    safetyData: {
      contraindications: ['Acute muscle tear', 'Bruising', 'Open wounds'],
      precautions: ['Avoid bony prominences'],
      redFlags: ['Sharp pain', 'Bruising after'],
      maxPainDuring: 4, maxPainAfter24h: 2,
      healingTissue: 'Quadriceps fascia', targetStructure: 'Soft tissue mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Avoid surgical site'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA', 'Meniscus surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 3, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Rolling too fast'] }
    },
    evidenceBase: { level: 'B', source: 'Cheatham SW. Foam rolling review. IJSPT, 2015', studyType: 'Systematic review' }
  },

  {
    id: 'knee_it_band_foam_roll',
    baseName: 'IT Band Foam Rolling',
    baseNameSv: 'IT-band Foamrolling',
    description: 'Self-myofascial release for IT band',
    descriptionSv: 'Självmassage för IT-band',
    bodyRegion: 'knee',
    muscleGroups: ['tensor_fasciae_latae', 'gluteus_maximus'],
    jointType: 'knee',
    exerciseType: 'soft_tissue',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'foam_roller',
    allowedEquipment: ['foam_roller'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Lie on side with roller under outer thigh', 'Roll from hip to knee', 'Top leg can assist', 'Pause on tender spots', 'Roll slowly', '30-60 seconds per side'],
    instructionsSv: ['Ligg på sidan med rulle under yttre låret', 'Rulla från höft till knä', 'Övre benet kan assistera', 'Pausa på ömma punkter', 'Rulla långsamt', '30-60 sekunder per sida'],
    techniquePoints: ['Slow controlled rolling', 'Pause on tender areas', 'Use top leg to control pressure'],
    safetyData: {
      contraindications: ['Acute IT band injury'],
      precautions: ['May be uncomfortable initially'],
      redFlags: ['Sharp pain', 'Numbness'],
      maxPainDuring: 5, maxPainAfter24h: 2,
      healingTissue: 'IT band', targetStructure: 'IT band mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 4, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Avoiding tender areas'] }
    },
    evidenceBase: { level: 'B', source: 'Cheatham SW. Foam rolling review. IJSPT, 2015', studyType: 'Systematic review' }
  },

  // ============================================
  // NEUROMUSCULAR CONTROL
  // ============================================
  {
    id: 'knee_perturbation_training',
    baseName: 'Perturbation Training',
    baseNameSv: 'Perturbationsträning',
    description: 'External perturbation for reactive stability',
    descriptionSv: 'Extern störning för reaktiv stabilitet',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteus_medius', 'core'],
    jointType: 'knee',
    exerciseType: 'neuromuscular',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'tilt_board',
    allowedEquipment: ['tilt_board', 'rocker_board', 'partner'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on tilt board', 'Partner or therapist applies unexpected pushes', 'React to maintain balance', 'Recover to neutral quickly', 'Progress directions and intensity', 'Stay reactive'],
    instructionsSv: ['Stå på tippbräda', 'Partner eller terapeut ger oväntade puffar', 'Reagera för att bibehålla balansen', 'Återhämta till neutral snabbt', 'Utveckla riktningar och intensitet', 'Förbli reaktiv'],
    techniquePoints: ['Quick reaction', 'Maintain knee control', 'Stay balanced'],
    safetyData: {
      contraindications: ['Acute instability', 'Poor baseline balance'],
      precautions: ['Support nearby', 'Start with mild perturbations'],
      redFlags: ['Knee giving way', 'Falls'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Neuromuscular system', targetStructure: 'Reactive stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Mild perturbations'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Slow reaction', 'Poor recovery'] }
    },
    evidenceBase: { level: 'A', source: 'Fitzgerald GK. Perturbation training. JOSPT, 2000', studyType: 'RCT' }
  },

  {
    id: 'knee_eyes_closed_balance',
    baseName: 'Eyes Closed Balance',
    baseNameSv: 'Balans med Slutna Ögon',
    description: 'Balance training without visual input',
    descriptionSv: 'Balansträning utan visuell input',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'tibialis_anterior', 'core'],
    jointType: 'knee',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'foam_pad'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Stand on one or both legs', 'Close eyes', 'Maintain balance', 'Use proprioception only', 'Near wall for safety', 'Progress to longer holds'],
    instructionsSv: ['Stå på ett eller båda ben', 'Blunda', 'Bibehåll balansen', 'Använd endast proprioception', 'Nära vägg för säkerhet', 'Utveckla till längre håll'],
    techniquePoints: ['Rely on proprioception', 'Stay relaxed', 'Quick corrections'],
    safetyData: {
      contraindications: ['Severe balance issues', 'Vestibular dysfunction'],
      precautions: ['Near wall or support'],
      redFlags: ['Dizziness', 'Falls'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Proprioceptors', targetStructure: 'Somatosensory balance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Bilateral only, near support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Opening eyes', 'Frequent loss of balance'] }
    },
    evidenceBase: { level: 'A', source: 'Kruse LM. Proprioceptive training. JOSPT, 2012', studyType: 'Meta-analysis' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PATELLOFEMORAL SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_pf_terminal_extension_isometric',
    baseName: 'Patellofemoral Terminal Extension Isometric',
    baseNameSv: 'Patellofemoralt Isometrisk Terminal Extension',
    description: 'Isometric quad contraction in terminal extension for PF pain',
    descriptionSv: 'Isometrisk quadriceps kontraktion i terminal extension för PF-smärta',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'VMO'],
    jointType: 'knee',
    exerciseType: 'isometric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'towel_roll'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 10,
    baseRestSeconds: 30,
    instructions: ['Sit with leg extended', 'Place towel under knee', 'Push knee into towel', 'Hold contraction', 'Focus on VMO'],
    instructionsSv: ['Sitt med benet sträckt', 'Placera handduk under knäet', 'Tryck knäet mot handduken', 'Håll kontraktionen', 'Fokusera på VMO'],
    techniquePoints: ['Feel VMO activation', 'Keep foot relaxed', 'Maintain for full duration'],
    safetyData: {
      contraindications: [],
      precautions: ['Patellar instability'],
      redFlags: ['Sharp pain', 'Patellar subluxation'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Patellar tendon', targetStructure: 'Quadriceps-VMO',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Patella realignment', 'MPFL reconstruction'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip hiking'] }
    },
    evidenceBase: { level: 'A', source: 'Rio E. Isometric exercise for tendinopathy. BJSM, 2015', studyType: 'RCT' }
  },
  {
    id: 'knee_pf_step_down_controlled',
    baseName: 'Controlled Step Down for PF',
    baseNameSv: 'Kontrollerad Nedstigning för PF',
    description: 'Slow controlled step down emphasizing knee control',
    descriptionSv: 'Långsam kontrollerad nedstigning med fokus på knäkontroll',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_medius', 'VMO'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'stairs'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand on step on affected leg', 'Slowly lower opposite heel to floor', 'Keep knee over 2nd toe', 'Control descent 3-5 seconds', 'Return to start', 'Minimize trunk lean'],
    instructionsSv: ['Stå på steg på påverkade benet', 'Sänk långsamt motsatta hälen mot golvet', 'Håll knäet över 2:a tån', 'Kontrollera nedsänkning 3-5 sek', 'Återgå till start', 'Minimera bållutning'],
    techniquePoints: ['Slow eccentric control', 'No knee valgus', 'Hip stability'],
    safetyData: {
      contraindications: ['Acute patellar instability'],
      precautions: ['Significant PF crepitus'],
      redFlags: ['Giving way', 'Sharp anterior pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Patellofemoral joint', targetStructure: 'Eccentric quad control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Low step only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Patella realignment', 'MPFL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Barton CJ. Step exercises for PF pain. BJSM, 2013', studyType: 'RCT' }
  },
  {
    id: 'knee_pf_spanish_squat',
    baseName: 'Spanish Squat for PF',
    baseNameSv: 'Spansk Knäböj för PF',
    description: 'Belt-assisted squat reducing patellofemoral compression',
    descriptionSv: 'Bälte-assisterad knäböj som minskar patellofemoralt tryck',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteals'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'resistance_band_heavy',
    allowedEquipment: ['resistance_band_heavy', 'squat_strap'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Loop band behind knees', 'Anchor band to stable object', 'Lean back into band', 'Squat keeping shins vertical', 'Keep weight on heels', 'Press knees into band'],
    instructionsSv: ['Loop band bakom knäna', 'Fäst band i stabilt föremål', 'Luta bakåt mot bandet', 'Knäböj med vertikala skenben', 'Håll vikten på hälar', 'Tryck knäna mot bandet'],
    techniquePoints: ['Vertical shins', 'Posterior weight shift', 'Reduced PF load'],
    safetyData: {
      contraindications: ['Acute patellar dislocation'],
      precautions: ['Significant effusion'],
      redFlags: ['Patellar pain increase', 'Instability'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Patellofemoral joint', targetStructure: 'Reduced PF loading',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 8 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 8, max: 12 }, allowed: true, modifications: ['Shallow only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['MPFL reconstruction', 'Tibial tubercle osteotomy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Forward lean', 'Knees past toes'] }
    },
    evidenceBase: { level: 'B', source: 'Purdam CR. Spanish squat for patellar tendinopathy. BJSM, 2004', studyType: 'Clinical trial' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOOD FLOW RESTRICTION (BFR)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_bfr_leg_extension',
    baseName: 'BFR Leg Extension',
    baseNameSv: 'BFR Benlyft',
    description: 'Leg extension with blood flow restriction for hypertrophy',
    descriptionSv: 'Benlyft med blodflödesrestriktion för hypertrofi',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'bfr_cuff',
    allowedEquipment: ['bfr_cuff', 'leg_extension_machine'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 30, max: 30 },
    baseSets: { min: 4, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: ['Apply BFR cuff at 50-80% LOP', 'Use 20-30% 1RM', 'Perform 30-15-15-15 reps', 'Keep cuff on between sets', 'Remove cuff after final set'],
    instructionsSv: ['Applicera BFR-manschett vid 50-80% LOP', 'Använd 20-30% 1RM', 'Utför 30-15-15-15 reps', 'Behåll manschett mellan set', 'Ta av manschett efter sista set'],
    techniquePoints: ['Light load, high reps', 'Maintain occlusion', 'Numbness is normal'],
    safetyData: {
      contraindications: ['DVT history', 'Peripheral vascular disease', 'Pregnancy', 'Uncontrolled hypertension'],
      precautions: ['Diabetes', 'Cardiac history'],
      redFlags: ['Severe pain', 'Prolonged numbness after cuff removal'],
      maxPainDuring: 4, maxPainAfter24h: 3,
      healingTissue: 'Muscle', targetStructure: 'Quadriceps hypertrophy',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ['As early as 1 week post-op per protocol'] },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair', 'TKA'],
      progressionCriteria: { minPainFreeReps: 30, minConsecutiveDays: 3, maxPainDuring: 3, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Cannot complete reps'] }
    },
    evidenceBase: { level: 'A', source: 'Hughes L. BFR training in rehabilitation. BJSM, 2017', studyType: 'Systematic review' }
  },
  {
    id: 'knee_bfr_leg_press',
    baseName: 'BFR Leg Press',
    baseNameSv: 'BFR Benpress',
    description: 'Leg press with blood flow restriction',
    descriptionSv: 'Benpress med blodflödesrestriktion',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteals', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'bfr_cuff',
    allowedEquipment: ['bfr_cuff', 'leg_press_machine'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 30, max: 30 },
    baseSets: { min: 4, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: ['Apply BFR cuffs bilaterally', 'Set at 50-80% LOP', 'Use 20-30% 1RM', 'Perform 30-15-15-15 protocol', 'Keep cuffs on between sets'],
    instructionsSv: ['Applicera BFR-manschetter bilateralt', 'Ställ in på 50-80% LOP', 'Använd 20-30% 1RM', 'Utför 30-15-15-15 protokoll', 'Behåll manschetter mellan set'],
    techniquePoints: ['Controlled ROM', 'Light load essential', 'Burning sensation expected'],
    safetyData: {
      contraindications: ['DVT history', 'Peripheral vascular disease', 'Pregnancy'],
      precautions: ['Cardiac history', 'Diabetes'],
      redFlags: ['Severe cramping', 'Prolonged numbness'],
      maxPainDuring: 4, maxPainAfter24h: 3,
      healingTissue: 'Muscle', targetStructure: 'Lower extremity hypertrophy',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 4, max: 8 }, allowed: true, modifications: ['Limited ROM'] },
        { phase: 3, weeksPostOp: { min: 8, max: 16 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 16, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA'],
      progressionCriteria: { minPainFreeReps: 30, minConsecutiveDays: 3, maxPainDuring: 3, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Uneven push'] }
    },
    evidenceBase: { level: 'A', source: 'Patterson SD. BFR review. SJMSS, 2019', studyType: 'Systematic review' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AQUATIC/POOL EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_pool_walking',
    baseName: 'Pool Walking',
    baseNameSv: 'Bassänggång',
    description: 'Walking in water for reduced weight bearing',
    descriptionSv: 'Gång i vatten för minskad viktbärning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteals'],
    jointType: 'knee',
    exerciseType: 'cardiovascular',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'pool',
    allowedEquipment: ['pool'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 1, max: 1 },
    baseHoldSeconds: 0,
    baseRestSeconds: 0,
    instructions: ['Enter pool at chest depth', 'Walk forward and backward', 'Maintain upright posture', 'Focus on normal gait pattern', 'Progress to deeper/shallower water'],
    instructionsSv: ['Gå ner i pool till brösthöjd', 'Gå framåt och bakåt', 'Bibehåll upprätt hållning', 'Fokusera på normalt gångmönster', 'Utveckla till djupare/grundare vatten'],
    techniquePoints: ['Normal heel-toe pattern', 'Upright posture', 'Arm swing'],
    safetyData: {
      contraindications: ['Open wounds', 'Active infection'],
      precautions: ['Incision healing', 'Balance issues'],
      redFlags: ['Dizziness', 'Chest pain'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'General conditioning', targetStructure: 'Gait retraining',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: false, modifications: ['Wait for wound closure'] },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Limping', 'Avoiding weight'] }
    },
    evidenceBase: { level: 'A', source: 'Aquatic therapy guidelines', studyType: 'Clinical guideline' }
  },
  {
    id: 'knee_pool_squat',
    baseName: 'Pool Squat',
    baseNameSv: 'Bassängknäböj',
    description: 'Squatting in water for reduced joint loading',
    descriptionSv: 'Knäböj i vatten för minskad ledbelastning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteals', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'pool',
    allowedEquipment: ['pool', 'pool_noodle'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Stand in chest-deep water', 'Feet shoulder-width apart', 'Squat down slowly', 'Keep weight on heels', 'Return to standing', 'Use pool edge for balance'],
    instructionsSv: ['Stå i bröstdjupt vatten', 'Fötter axelbrett', 'Gå ner i knäböj långsamt', 'Håll vikten på hälar', 'Återgå till stående', 'Använd poolkant för balans'],
    techniquePoints: ['Knees track over toes', 'Controlled descent', 'Use buoyancy'],
    safetyData: {
      contraindications: ['Open wounds'],
      precautions: ['Balance issues'],
      redFlags: ['Sharp knee pain'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Articular cartilage', targetStructure: 'Reduced joint loading',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true, modifications: ['Shallow squats only'] },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA', 'Cartilage procedures'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee valgus'] }
    },
    evidenceBase: { level: 'B', source: 'Aquatic exercise for OA', studyType: 'Clinical trial' }
  },
  {
    id: 'knee_pool_flutter_kick',
    baseName: 'Pool Flutter Kick',
    baseNameSv: 'Bassäng Sparktag',
    description: 'Flutter kick holding pool edge for quad activation',
    descriptionSv: 'Sparktag som håller poolkant för quad-aktivering',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hip_flexors'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'pool',
    allowedEquipment: ['pool', 'kickboard'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 30, max: 60 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Hold pool edge or kickboard', 'Keep legs extended', 'Flutter kick from hips', 'Keep knees relatively straight', 'Continuous motion'],
    instructionsSv: ['Håll poolkant eller flytbräda', 'Håll benen sträckta', 'Sparkta från höfterna', 'Håll knäna relativt raka', 'Kontinuerlig rörelse'],
    techniquePoints: ['Small kicks', 'From hips not knees', 'Keep legs underwater'],
    safetyData: {
      contraindications: ['Open wounds'],
      precautions: ['Shoulder issues'],
      redFlags: ['Knee pain during kicking'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Muscle', targetStructure: 'Quad endurance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true, modifications: ['Gentle kicks'] },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 60, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Excessive knee bend'] }
    },
    evidenceBase: { level: 'B', source: 'Aquatic therapy protocols', studyType: 'Clinical guideline' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPORT-SPECIFIC / RETURN TO SPORT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_deceleration_drill',
    baseName: 'Deceleration Drill',
    baseNameSv: 'Decelerationsövning',
    description: 'Controlled stopping from running for ACL prevention',
    descriptionSv: 'Kontrollerat stopp från löpning för ACL-prevention',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteals'],
    jointType: 'knee',
    exerciseType: 'sport_specific',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'cones'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: ['Sprint 10-20m', 'Decelerate to controlled stop', 'Land with soft knees', 'Avoid valgus collapse', 'Stick the landing', 'Progress speed gradually'],
    instructionsSv: ['Sprinta 10-20m', 'Decelera till kontrollerat stopp', 'Landa med mjuka knän', 'Undvik valguskollaps', 'Stanna med kontroll', 'Öka hastighet gradvis'],
    techniquePoints: ['Soft landing', 'Knee alignment', 'Hip control'],
    safetyData: {
      contraindications: ['Acute knee injury', 'Post-op < 6 months'],
      precautions: ['History of ACL injury'],
      redFlags: ['Knee giving way', 'Sharp pain'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL graft', targetStructure: 'Deceleration mechanics',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 12 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 12, max: 20 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 20, max: 32 }, allowed: true, modifications: ['Low speed only'] },
        { phase: 4, weeksPostOp: { min: 32, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Valgus collapse', 'Stiff landing'] }
    },
    evidenceBase: { level: 'A', source: 'Hewett TE. ACL injury prevention. AJSM, 2005', studyType: 'RCT' }
  },
  {
    id: 'knee_cutting_drill',
    baseName: 'Cutting Drill',
    baseNameSv: 'Riktningsförändring',
    description: 'Change of direction drill for sport preparation',
    descriptionSv: 'Riktningsförändringsövning för sportförberedelse',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteus_medius'],
    jointType: 'knee',
    exerciseType: 'sport_specific',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'cones',
    allowedEquipment: ['cones'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Run to cone', 'Plant and cut 45-90 degrees', 'Maintain knee alignment', 'Drive off planted leg', 'Control trunk', 'Progress angle and speed'],
    instructionsSv: ['Springa till kon', 'Stanna och ändra riktning 45-90 grader', 'Bibehåll knäalignment', 'Tryck ifrån med planterade benet', 'Kontrollera bål', 'Öka vinkel och hastighet'],
    techniquePoints: ['Knee over toe', 'Hip stability', 'Controlled plant'],
    safetyData: {
      contraindications: ['Post-op < 7 months', 'Knee instability'],
      precautions: ['Previous ACL injury'],
      redFlags: ['Giving way', 'Sharp pain'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL graft', targetStructure: 'Cutting mechanics',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 16 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 16, max: 28 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 28, max: 36 }, allowed: true, modifications: ['Planned cuts only'] },
        { phase: 4, weeksPostOp: { min: 36, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Valgus on cut', 'Trunk lean'] }
    },
    evidenceBase: { level: 'A', source: 'Myer GD. Neuromuscular training for ACL prevention. JOSPT, 2013', studyType: 'RCT' }
  },
  {
    id: 'knee_t_drill',
    baseName: 'T-Drill Agility',
    baseNameSv: 'T-Drill Agilitet',
    description: 'T-pattern agility drill for multi-directional movement',
    descriptionSv: 'T-mönster agilitetsövning för multidirektionell rörelse',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteals', 'calves'],
    jointType: 'knee',
    exerciseType: 'sport_specific',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'cones',
    allowedEquipment: ['cones'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 4, max: 6 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Set up T pattern cones', 'Sprint forward to center', 'Shuffle left to cone', 'Shuffle right across', 'Backpedal to start', 'Focus on knee control'],
    instructionsSv: ['Sätt upp T-mönster konor', 'Sprinta framåt till mitten', 'Sidledes till vänster', 'Sidledes till höger', 'Backpedal till start', 'Fokusera på knäkontroll'],
    techniquePoints: ['Stay low', 'Quick feet', 'Controlled direction changes'],
    safetyData: {
      contraindications: ['Post-op < 8 months', 'Knee instability'],
      precautions: ['Return to sport phase'],
      redFlags: ['Giving way', 'Pain during drill'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL graft', targetStructure: 'Multi-directional agility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 20 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 20, max: 32 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 32, max: 40 }, allowed: true, modifications: ['50% speed'] },
        { phase: 4, weeksPostOp: { min: 40, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 6, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Poor mechanics'] }
    },
    evidenceBase: { level: 'B', source: 'Return to sport testing protocols', studyType: 'Clinical guideline' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CARTILAGE / OA FRIENDLY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_non_weight_bearing_cycling',
    baseName: 'Non-Weight Bearing Cycling',
    baseNameSv: 'Icke-viktbärande Cykling',
    description: 'Stationary cycling for ROM and low-impact conditioning',
    descriptionSv: 'Stationär cykling för ROM och lågbelastningsträning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'cardiovascular',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'stationary_bike',
    allowedEquipment: ['stationary_bike', 'recumbent_bike'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 30 },
    baseSets: { min: 1, max: 1 },
    baseHoldSeconds: 0,
    baseRestSeconds: 0,
    instructions: ['Adjust seat height', 'Start with no resistance', 'Pedal with full circles', 'Progress duration then resistance', 'Keep cadence comfortable', 'Monitor for pain'],
    instructionsSv: ['Justera sadelhöjd', 'Börja utan motstånd', 'Trampa hela cirklar', 'Öka tid sedan motstånd', 'Håll bekväm kadens', 'Övervaka för smärta'],
    techniquePoints: ['Smooth pedaling', 'Full ROM if possible', 'No bouncing'],
    safetyData: {
      contraindications: [],
      precautions: ['Limited ROM'],
      redFlags: ['Increasing pain', 'Swelling after'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Articular cartilage', targetStructure: 'Joint nutrition',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 1 }, allowed: true, modifications: ['Partial ROM allowed'] },
        { phase: 2, weeksPostOp: { min: 1, max: 4 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 4, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction', 'TKA', 'Meniscus repair', 'Cartilage procedures'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Rocking hips'] }
    },
    evidenceBase: { level: 'A', source: 'Low-impact exercise for OA. Cochrane, 2015', studyType: 'Systematic review' }
  },
  {
    id: 'knee_cartilage_loading_program',
    baseName: 'Cartilage Loading Program',
    baseNameSv: 'Broskladdningsprogram',
    description: 'Graduated loading for cartilage health and nutrition',
    descriptionSv: 'Graderad belastning för broskhälsa och nutrition',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'standing',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'leg_press_machine'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Start with minimal load', 'Perform controlled movements', 'Avoid deep flexion initially', 'Progress load by 10% weekly', 'Monitor 24-hour response', 'Cartilage adapts slowly'],
    instructionsSv: ['Börja med minimal belastning', 'Utför kontrollerade rörelser', 'Undvik djup flexion initialt', 'Öka belastning 10% per vecka', 'Övervaka 24-timmars respons', 'Brosk anpassar långsamt'],
    techniquePoints: ['Progressive loading', 'Monitor symptoms', 'Patience required'],
    safetyData: {
      contraindications: ['Active inflammatory arthritis'],
      precautions: ['Advanced OA', 'Post-cartilage repair'],
      redFlags: ['Persistent swelling', 'Night pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Articular cartilage', targetStructure: 'Cartilage adaptation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very light only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Microfracture', 'OATS', 'ACI'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Avoiding weight'] }
    },
    evidenceBase: { level: 'A', source: 'Eckstein F. Cartilage loading principles. Ann Rheum Dis, 2006', studyType: 'Clinical trial' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MENISCUS SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_meniscus_protected_squat',
    baseName: 'Meniscus Protected Squat',
    baseNameSv: 'Meniskskyddad Knäböj',
    description: 'Limited range squat protecting meniscus repair',
    descriptionSv: 'Begränsat rörelseomfång knäböj som skyddar menisklagning',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteals'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'squat_rack'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: ['Limit depth to 60-70 degrees flexion', 'Keep weight on heels', 'Avoid deep knee bend', 'Control descent and ascent', 'Progress depth gradually', 'Per surgeon protocol'],
    instructionsSv: ['Begränsa djup till 60-70 graders flexion', 'Håll vikt på hälar', 'Undvik djup knäböjning', 'Kontrollera ned- och uppgång', 'Öka djup gradvis', 'Enligt kirurgens protokoll'],
    techniquePoints: ['Limited ROM', 'Controlled movement', 'No deep flexion'],
    safetyData: {
      contraindications: ['Meniscus repair < 4 weeks'],
      precautions: ['Medial or lateral meniscus repair'],
      redFlags: ['Joint line pain', 'Locking', 'Catching'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Meniscus', targetStructure: 'Protected quad strengthening',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 4, max: 8 }, allowed: true, modifications: ['0-60 degrees only'] },
        { phase: 3, weeksPostOp: { min: 8, max: 12 }, allowed: true, modifications: ['0-90 degrees'] },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Going too deep'] }
    },
    evidenceBase: { level: 'A', source: 'Meniscus repair rehabilitation protocol', studyType: 'Clinical guideline' }
  },
  {
    id: 'knee_meniscus_unloading_exercises',
    baseName: 'Meniscus Unloading Exercise',
    baseNameSv: 'Meniskavlastningsövning',
    description: 'Open chain exercises to unload meniscus',
    descriptionSv: 'Öppna kedjeövningar för att avlasta menisken',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings'],
    jointType: 'knee',
    exerciseType: 'strength',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'ankle_weight'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: ['Sit with legs hanging', 'Extend knee against gravity', 'Avoid rotational stress', 'Control through range', 'Progress to light ankle weight'],
    instructionsSv: ['Sitt med ben hängande', 'Sträck knäet mot gravitationen', 'Undvik rotationsstress', 'Kontrollera genom rörelsen', 'Öka till lätt ankelvikt'],
    techniquePoints: ['Smooth movement', 'No rotation', 'Full extension'],
    safetyData: {
      contraindications: ['Locked knee'],
      precautions: ['Post-meniscectomy', 'Post-repair'],
      redFlags: ['Joint line clicking', 'Catching sensation'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'Meniscus', targetStructure: 'Unloaded strengthening',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ['Active assisted'] },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Meniscectomy', 'Meniscus repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Post-meniscectomy rehabilitation', studyType: 'Clinical guideline' }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL PLYOMETRIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'knee_depth_jump',
    baseName: 'Depth Jump',
    baseNameSv: 'Djuphopp',
    description: 'Drop from box and immediately jump for power',
    descriptionSv: 'Dropp från box och omedelbart hopp för kraft',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteals', 'calves'],
    jointType: 'knee',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'plyo_box',
    allowedEquipment: ['plyo_box'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 8 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Step off box (not jump)', 'Land softly with bent knees', 'Immediately jump up', 'Minimize ground contact time', 'Stick landing', 'Progress box height'],
    instructionsSv: ['Kliv av boxen (hoppa inte)', 'Landa mjukt med böjda knän', 'Hoppa omedelbart upp', 'Minimera markkontakttid', 'Stanna med kontroll', 'Öka boxhöjd'],
    techniquePoints: ['Quick ground contact', 'Soft landing mechanics', 'Maximum effort jump'],
    safetyData: {
      contraindications: ['Post-op < 9 months', 'Patellar tendinopathy'],
      precautions: ['High intensity exercise'],
      redFlags: ['Knee pain on landing', 'Giving way'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL graft', targetStructure: 'Power development',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 24 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 24, max: 36 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 36, max: 44 }, allowed: true, modifications: ['Low box only'] },
        { phase: 4, weeksPostOp: { min: 44, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 8, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Stiff landing', 'Valgus collapse'] }
    },
    evidenceBase: { level: 'B', source: 'Plyometric training for athletes', studyType: 'Clinical guideline' }
  },
  {
    id: 'knee_reactive_agility_drill',
    baseName: 'Reactive Agility Drill',
    baseNameSv: 'Reaktiv Agilitetsövning',
    description: 'Unplanned direction changes based on external cues',
    descriptionSv: 'Oplanerade riktningsändringar baserade på externa signaler',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteals'],
    jointType: 'knee',
    exerciseType: 'sport_specific',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'cones',
    allowedEquipment: ['cones', 'partner'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 120,
    instructions: ['Partner gives visual/verbal cue', 'React immediately to direction', 'Maintain knee control', 'Quick direction change', 'Unpredictable patterns', 'Sport-specific scenarios'],
    instructionsSv: ['Partner ger visuell/verbal signal', 'Reagera omedelbart på riktning', 'Bibehåll knäkontroll', 'Snabb riktningsförändring', 'Oförutsägbara mönster', 'Sportspecifika scenarion'],
    techniquePoints: ['Quick reaction', 'Controlled cutting', 'Cognitive demand'],
    safetyData: {
      contraindications: ['Post-op < 9 months', 'Knee instability'],
      precautions: ['Final return to sport phase'],
      redFlags: ['Giving way', 'Hesitation'],
      maxPainDuring: 2, maxPainAfter24h: 2,
      healingTissue: 'ACL graft', targetStructure: 'Reactive neuromuscular control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 28 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 28, max: 36 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 36, max: 44 }, allowed: true, modifications: ['Low intensity cues'] },
        { phase: 4, weeksPostOp: { min: 44, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['ACL reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Poor mechanics under pressure'] }
    },
    evidenceBase: { level: 'A', source: 'Shultz SJ. Reactive agility in ACL rehab. JOSPT, 2015', studyType: 'RCT' }
  }
];

export default kneeTemplates;
