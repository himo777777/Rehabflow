/**
 * Ankle/Foot Exercise Templates
 *
 * Evidence-based exercises for ankle and foot rehabilitation
 * Based on JOSPT ankle instability and Achilles tendinopathy guidelines
 */

import { BaseExerciseTemplate } from '../types';

export const ankleTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // CALF STRENGTHENING
  // ============================================
  {
    id: 'ankle_calf_raise_bilateral',
    baseName: 'Bilateral Calf Raise',
    baseNameSv: 'Bilateral Tåhävning',
    description: 'Basic gastrocnemius and soleus strengthening',
    descriptionSv: 'Grundläggande gastrocnemius och soleus-styrka',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'concentric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'step', 'wall'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 15, max: 25 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,

    instructions: [
      'Stand with feet shoulder width apart',
      'Hold wall or rail for balance if needed',
      'Rise up on toes as high as possible',
      'Hold at top position',
      'Lower slowly with control',
      'Repeat without touching heels down between reps'
    ],
    instructionsSv: [
      'Stå med fötterna axelbrett isär',
      'Håll i vägg eller räcke för balans vid behov',
      'Res dig upp på tårna så högt som möjligt',
      'Håll i toppositionen',
      'Sänk långsamt med kontroll',
      'Upprepa utan att röra hälarna mellan repetitionerna'
    ],

    techniquePoints: [
      'Full range of motion',
      'Control both up and down phases',
      'Keep knees straight for gastroc focus',
      'Weight evenly distributed on both feet'
    ],

    safetyData: {
      contraindications: ['Acute Achilles rupture', 'Acute calf strain'],
      precautions: ['Achilles tendinopathy - start eccentric', 'Balance issues - hold support'],
      redFlags: ['Sharp calf pain', 'Pop or snap sensation'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Calf muscles, Achilles tendon',
      targetStructure: 'Gastrocnemius, soleus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial weight bearing', 'Bilateral only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF', 'Ankle arthroscopy'],

      progressionCriteria: {
        minPainFreeReps: 25,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 2,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Rolling to outside of foot', 'Incomplete range', 'Weight shift']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Martin RL, et al. Ankle stability and movement. JOSPT, 2013',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'ankle_calf_raise_single',
    baseName: 'Single Leg Calf Raise',
    baseNameSv: 'Enbens Tåhävning',
    description: 'Unilateral calf strengthening for progression',
    descriptionSv: 'Unilateral vadstyrka för progression',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'concentric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'step',
    allowedEquipment: ['step', 'wall', 'weight'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 12, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 60,

    instructions: [
      'Stand on one leg on edge of step',
      'Let heel hang off edge',
      'Hold support for balance',
      'Rise up as high as possible on toes',
      'Hold at top',
      'Lower slowly below step level'
    ],
    instructionsSv: [
      'Stå på ett ben på kanten av steget',
      'Låt hälen hänga utanför kanten',
      'Håll i stöd för balans',
      'Res dig upp så högt som möjligt på tårna',
      'Håll i toppen',
      'Sänk långsamt under stegnivån'
    ],

    techniquePoints: [
      'Full range through heel drop',
      'Control eccentric phase',
      'Keep knee straight',
      'Do not bounce at bottom'
    ],

    safetyData: {
      contraindications: ['Acute Achilles rupture', 'Severe Achilles tendinopathy'],
      precautions: ['Balance issues - use support', 'Start bilateral if needed'],
      redFlags: ['Sharp pain', 'Weakness with single leg', 'Swelling increase'],
      maxPainDuring: 4,
      maxPainAfter24h: 4,
      healingTissue: 'Achilles tendon, calf muscles',
      targetStructure: 'Gastrocnemius, soleus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['No heel drop initially'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 7,
        maxPainDuring: 3,
        maxPainAfter: 3,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Using opposite leg', 'Knee bend', 'Incomplete range']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Alfredson H. Eccentric calf muscle training. BJSM, 1998',
      studyType: 'RCT - Alfredson protocol'
    }
  },

  {
    id: 'ankle_alfredson_eccentric',
    baseName: 'Alfredson Eccentric Heel Drop',
    baseNameSv: 'Alfredson Excentrisk Häldropp',
    description: 'Gold standard eccentric exercise for Achilles tendinopathy',
    descriptionSv: 'Guldstandard excentrisk övning för akillestendinopati',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'eccentric',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'step',
    allowedEquipment: ['step'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 15, max: 15 },
    baseSets: { min: 3, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,

    instructions: [
      'Stand on affected leg on step edge',
      'Rise up on toes using both legs',
      'Transfer weight to affected leg only',
      'Slowly lower heel below step level',
      'Use other leg to return to start',
      'Perform both with straight and bent knee'
    ],
    instructionsSv: [
      'Stå på påverkat ben på stegkanten',
      'Res dig upp på tårna med båda benen',
      'Överför vikten till endast påverkat ben',
      'Sänk långsamt hälen under stegnivån',
      'Använd andra benet för att återgå till start',
      'Utför både med rakt och böjt knä'
    ],

    techniquePoints: [
      'Eccentric only on affected side',
      'Slow 3-5 second lowering',
      'Some discomfort is acceptable',
      'Straight knee = gastrocnemius, bent = soleus'
    ],

    safetyData: {
      contraindications: ['Complete Achilles rupture', 'Acute Achilles inflammation'],
      precautions: ['Pain > 5/10 during exercise - stop', 'Build up volume gradually'],
      redFlags: ['Sharp sudden pain', 'Unable to weight bear next day'],
      maxPainDuring: 5,
      maxPainAfter24h: 4,
      healingTissue: 'Achilles tendon',
      targetStructure: 'Achilles tendon remodeling',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Start gentle, progress slowly'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 14,
        maxPainDuring: 4,
        maxPainAfter: 3,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Fast lowering', 'Using other leg', 'Not full range']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Alfredson H, et al. Heavy-load eccentric calf muscle training. Am J Sports Med, 1998',
      studyType: 'Original RCT - Alfredson protocol'
    }
  },

  // ============================================
  // ANKLE STABILITY / PROPRIOCEPTION
  // ============================================
  {
    id: 'ankle_single_leg_balance',
    baseName: 'Single Leg Balance - Ankle Focus',
    baseNameSv: 'Enbensstående Balans - Fotledsfokus',
    description: 'Proprioception training for ankle stability',
    descriptionSv: 'Proprioceptionsträning för fotledsstabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'tibialis_posterior'],
    jointType: 'ankle',
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
      'Stand on one leg near support',
      'Keep knee slightly bent',
      'Focus on point at eye level',
      'Allow ankle to make corrections',
      'Do not grab support unless losing balance',
      'Progress by closing eyes or unstable surface'
    ],
    instructionsSv: [
      'Stå på ett ben nära stöd',
      'Håll knät lätt böjt',
      'Fokusera på en punkt i ögonhöjd',
      'Låt fotleden göra korrigeringar',
      'Greppa inte stödet om du inte tappar balansen',
      'Progression genom att blunda eller instabil yta'
    ],

    techniquePoints: [
      'Feel ankle muscles working',
      'Small corrections are normal',
      'Quality before duration',
      'Progress: eyes closed, unstable surface'
    ],

    safetyData: {
      contraindications: ['Acute ankle sprain', 'Non-weight bearing status'],
      precautions: ['Fall risk - stay near support', 'Start on stable surface'],
      redFlags: ['Unable to balance > 5 seconds', 'Pain with standing'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments, proprioceptors',
      targetStructure: 'Ankle proprioception system',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Use support', 'Stable surface only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy', 'Lateral ligament repair'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 1,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Grabbing support frequently', 'Loss of balance', 'Excessive hip strategy']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Martin RL. Chronic ankle instability CPG. JOSPT, 2013',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'ankle_4way_theraband',
    baseName: '4-Way Ankle Theraband',
    baseNameSv: '4-Vägs Fotled Theraband',
    description: 'Resistance band exercises in all ankle directions',
    descriptionSv: 'Motståndsbandsövningar i alla fotledsriktningar',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior', 'peroneals', 'gastrocnemius', 'tibialis_posterior'],
    jointType: 'ankle',
    exerciseType: 'concentric',

    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],

    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 15, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Sit with leg extended',
      'Loop band around foot',
      'Anchor band appropriately for each direction',
      'Dorsiflexion: pull toes toward shin',
      'Plantarflexion: point toes away',
      'Inversion/Eversion: turn foot in/out'
    ],
    instructionsSv: [
      'Sitt med benet utsträckt',
      'Lägg bandet runt foten',
      'Förankra bandet lämpligt för varje riktning',
      'Dorsalflexion: dra tårna mot skenbenet',
      'Plantarflexion: peka tårna bort',
      'Inversion/Eversion: vrid foten in/ut'
    ],

    techniquePoints: [
      'Isolate ankle movement',
      'Do not move from knee or hip',
      'Control both directions',
      'Full range of motion'
    ],

    safetyData: {
      contraindications: ['Acute ankle fracture', 'Severe instability'],
      precautions: ['Recent sprain - avoid eversion initially', 'Start with light resistance'],
      redFlags: ['Sharp pain', 'Grinding sensation'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle musculature',
      targetStructure: 'All ankle movers',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Light resistance', 'Pain-free ROM only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy', 'Lateral ligament repair'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: true,
        formBreakdown: true,
        compensationPatterns: ['Knee movement', 'Hip rotation', 'Incomplete range']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Martin RL. Ankle stability CPG. JOSPT, 2013',
      studyType: 'Clinical practice guideline'
    }
  },

  // ============================================
  // ANKLE ROM AND MOBILITY
  // ============================================
  {
    id: 'ankle_dorsiflexion_stretch',
    baseName: 'Standing Calf Stretch (Wall)',
    baseNameSv: 'Stående Vadstretch (Vägg)',
    description: 'Gastrocnemius stretch against wall',
    descriptionSv: 'Gastrocnemiusstretch mot vägg',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius'],
    jointType: 'ankle',
    exerciseType: 'stretch',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'wall',
    allowedEquipment: ['wall'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Stand facing wall, hands at shoulder height',
      'Step one foot back, keeping heel on floor',
      'Keep back knee straight',
      'Lean into wall until stretch felt in calf',
      'Front knee can bend',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Stå mot väggen, händer i axelhöjd',
      'Ta ett steg bakåt med en fot, håll hälen på golvet',
      'Håll bakre knät rakt',
      'Luta mot väggen tills stretch känns i vaden',
      'Främre knät kan böjas',
      'Håll och andas'
    ],

    techniquePoints: [
      'Heel must stay on floor',
      'Straight knee targets gastrocnemius',
      'Foot pointing forward, not out',
      'Gentle sustained stretch'
    ],

    safetyData: {
      contraindications: ['Acute Achilles rupture', 'Acute calf strain'],
      precautions: ['Achilles tendinopathy - gentle', 'DVT history - assess first'],
      redFlags: ['Sudden sharp pain', 'Warmth/redness in calf'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Gastrocnemius',
      targetStructure: 'Gastrocnemius flexibility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle stretch only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF'],

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
        compensationPatterns: ['Heel lifting', 'Knee bending', 'Foot turning out']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Radford JA. Calf stretching. JOSPT, 2006',
      studyType: 'Systematic review'
    }
  },

  {
    id: 'ankle_soleus_stretch',
    baseName: 'Soleus Stretch (Bent Knee)',
    baseNameSv: 'Soleusstretch (Böjt Knä)',
    description: 'Soleus specific stretch with bent knee',
    descriptionSv: 'Soleusspecifik stretch med böjt knä',
    bodyRegion: 'ankle',
    muscleGroups: ['soleus'],
    jointType: 'ankle',
    exerciseType: 'stretch',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'wall',
    allowedEquipment: ['wall'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Stand close to wall',
      'Step one foot back',
      'Bend BOTH knees',
      'Keep back heel on floor',
      'Shift weight onto back leg',
      'Feel stretch lower in calf'
    ],
    instructionsSv: [
      'Stå nära väggen',
      'Ta ett steg bakåt med en fot',
      'Böj BÅDA knäna',
      'Håll bakre hälen på golvet',
      'Skifta vikten till bakre benet',
      'Känn stretch lägre i vaden'
    ],

    techniquePoints: [
      'Back knee must bend',
      'Heel stays down',
      'Stretch felt lower than gastrocnemius stretch',
      'Important for Achilles issues'
    ],

    safetyData: {
      contraindications: ['Acute Achilles rupture', 'Acute soleus strain'],
      precautions: ['Achilles tendinopathy - gentle', 'Knee pain - reduce bend'],
      redFlags: ['Sudden sharp pain', 'Unable to weight bear'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Soleus',
      targetStructure: 'Soleus flexibility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle stretch'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF'],

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
        compensationPatterns: ['Straightening back knee', 'Heel lifting']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Radford JA. Calf stretching. JOSPT, 2006',
      studyType: 'Systematic review'
    }
  },

  {
    id: 'ankle_alphabet',
    baseName: 'Ankle Alphabet',
    baseNameSv: 'Fotledsalfabet',
    description: 'Active ROM exercise tracing alphabet with foot',
    descriptionSv: 'Aktiv ROM-övning som spårar alfabet med foten',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior', 'peroneals', 'gastrocnemius'],
    jointType: 'ankle',
    exerciseType: 'mobility',

    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 1, max: 2 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,

    instructions: [
      'Sit with leg elevated or hanging',
      'Keep lower leg still',
      'Move foot to trace alphabet letters',
      'Use ankle only, not knee',
      'Complete A-Z or as tolerated',
      'Move through full available range'
    ],
    instructionsSv: [
      'Sitt med benet upplyft eller hängande',
      'Håll underbenet stilla',
      'Rör foten för att spåra alfabetets bokstäver',
      'Använd endast fotleden, inte knät',
      'Slutför A-Z eller efter förmåga',
      'Rör dig genom hela tillgängliga rörelseomfånget'
    ],

    techniquePoints: [
      'Isolate ankle movement',
      'Make letters big and clear',
      'No pain, just gentle movement',
      'Good for early rehab'
    ],

    safetyData: {
      contraindications: ['Acute ankle fracture - check weight bearing status'],
      precautions: ['Post-surgical - follow ROM restrictions', 'Swelling - keep elevated'],
      redFlags: ['Increased swelling', 'Unable to move ankle'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle joint',
      targetStructure: 'Active ankle ROM',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Within allowed ROM'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy', 'Any ankle surgery'],

      progressionCriteria: {
        minPainFreeReps: 2,
        minConsecutiveDays: 3,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: true,
        formBreakdown: false,
        compensationPatterns: ['Knee movement', 'Hip rotation']
      }
    },

    evidenceBase: {
      level: 'C',
      source: 'Clinical practice consensus',
      studyType: 'Expert opinion'
    }
  },

  // ============================================
  // FOOT INTRINSIC STRENGTHENING
  // ============================================
  {
    id: 'ankle_short_foot',
    baseName: 'Short Foot Exercise',
    baseNameSv: 'Kort Fot-övning',
    description: 'Intrinsic foot muscle activation for arch support',
    descriptionSv: 'Intrinsisk fotmuskelaktivering för fotvalvsstöd',
    bodyRegion: 'ankle',
    muscleGroups: ['foot_intrinsics'],
    jointType: 'foot',
    exerciseType: 'motor_control',

    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,

    instructions: [
      'Sit with foot flat on floor',
      'Keep toes relaxed on floor',
      'Draw ball of foot toward heel',
      'Arch should rise without toe curling',
      'Hold the arch position',
      'Relax and repeat'
    ],
    instructionsSv: [
      'Sitt med foten platt på golvet',
      'Håll tårna avslappnade på golvet',
      'Dra trampdynan mot hälen',
      'Fotvalvet ska höjas utan att tårna kröks',
      'Håll fotvalvspositionen',
      'Slappna av och upprepa'
    ],

    techniquePoints: [
      'Do NOT curl toes',
      'Toes stay long and relaxed',
      'Feel arch muscles working',
      'Subtle movement, big activation'
    ],

    safetyData: {
      contraindications: ['None specific'],
      precautions: ['Plantar fasciitis - may be sensitive', 'Post-surgical - gentle'],
      redFlags: ['Severe cramping', 'Unable to feel muscle activation'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Foot intrinsic muscles',
      targetStructure: 'Abductor hallucis, FDB, FHB',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Non-weight bearing if needed'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Plantar fascia release', 'Hallux surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 1,
        maxPainAfter: 0,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Toe curling', 'No visible arch change']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Mulligan EP, Cook PG. Short foot exercise. JOSPT, 2013',
      studyType: 'EMG study'
    }
  },

  {
    id: 'ankle_towel_curl',
    baseName: 'Towel Curl',
    baseNameSv: 'Handdukskurl',
    description: 'Toe flexor strengthening using towel',
    descriptionSv: 'Tåböjarstyrka med handduk',
    bodyRegion: 'ankle',
    muscleGroups: ['foot_intrinsics', 'toe_flexors'],
    jointType: 'foot',
    exerciseType: 'concentric',

    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],

    baseEquipment: 'towel',
    allowedEquipment: ['towel'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,

    instructions: [
      'Sit with foot on towel on smooth floor',
      'Keep heel on floor',
      'Use toes to scrunch towel toward you',
      'Curl toes to grab towel',
      'Release and repeat',
      'Pull entire towel'
    ],
    instructionsSv: [
      'Sitt med foten på handduk på slät golv',
      'Håll hälen på golvet',
      'Använd tårna för att dra handduken mot dig',
      'Kröka tårna för att greppa handduken',
      'Släpp och upprepa',
      'Dra hela handduken'
    ],

    techniquePoints: [
      'Keep heel on floor',
      'Use all toes equally',
      'Smooth continuous movement',
      'Add weight on towel to progress'
    ],

    safetyData: {
      contraindications: ['Acute toe fracture', 'Open wounds on foot'],
      precautions: ['Plantar fasciitis - may aggravate', 'Toe cramps - stop and stretch'],
      redFlags: ['Severe cramping', 'Pain in arch'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Toe flexors',
      targetStructure: 'FDL, FHL, intrinsics',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['If allowed to move toes'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Plantar fascia release', 'Hallux surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 1,
        maxPainAfter: 1,
        formScore: 75
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Heel lifting', 'Only using big toe']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Mulligan EP. Foot intrinsic strengthening. JOSPT, 2013',
      studyType: 'Clinical study'
    }
  },

  // ============================================
  // ADDITIONAL CALF STRENGTHENING
  // ============================================
  {
    id: 'ankle_seated_calf_raise',
    baseName: 'Seated Calf Raise',
    baseNameSv: 'Sittande Tåhävning',
    description: 'Soleus-focused calf strengthening in seated position',
    descriptionSv: 'Soleusfokuserad vadstyrka i sittande position',
    bodyRegion: 'ankle',
    muscleGroups: ['soleus'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'weight', 'resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 25 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: [
      'Sit with feet flat on floor',
      'Place weight on thighs if adding resistance',
      'Rise up on toes while seated',
      'Hold at top position',
      'Lower slowly with control'
    ],
    instructionsSv: [
      'Sitt med fötterna platta på golvet',
      'Placera vikt på låren vid extra motstånd',
      'Res dig upp på tårna medan du sitter',
      'Håll i toppositionen',
      'Sänk långsamt med kontroll'
    ],
    techniquePoints: [
      'Bent knee isolates soleus',
      'Full range of motion',
      'Control both directions',
      'Keep torso stable'
    ],
    safetyData: {
      contraindications: ['Acute Achilles rupture', 'Acute soleus strain'],
      precautions: ['Achilles tendinopathy - start light', 'Knee pain - adjust positioning'],
      redFlags: ['Sharp calf pain', 'Swelling increase'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Soleus, Achilles tendon',
      targetStructure: 'Soleus muscle',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['No resistance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 25, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 2, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Incomplete range', 'Bouncing'] }
    },
    evidenceBase: { level: 'A', source: 'Martin RL. Ankle stability CPG. JOSPT, 2013', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'ankle_eccentric_soleus',
    baseName: 'Eccentric Soleus Lower',
    baseNameSv: 'Excentrisk Soleus-sänkning',
    description: 'Bent-knee eccentric exercise for soleus and Achilles',
    descriptionSv: 'Böjt knä excentrisk övning för soleus och akilles',
    bodyRegion: 'ankle',
    muscleGroups: ['soleus'],
    jointType: 'ankle',
    exerciseType: 'eccentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 15 },
    baseSets: { min: 3, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand on step with bent knee',
      'Rise up using both legs',
      'Shift to single leg with knee bent',
      'Slowly lower heel below step',
      'Use other leg to return up',
      'Maintain knee bend throughout'
    ],
    instructionsSv: [
      'Stå på steg med böjt knä',
      'Res dig upp med båda benen',
      'Skifta till ett ben med böjt knä',
      'Sänk långsamt hälen under steget',
      'Använd andra benet för att gå upp',
      'Behåll knäböjningen genom hela rörelsen'
    ],
    techniquePoints: ['Knee stays bent 20-30 degrees', 'Slow 3-5 second eccentric', 'Targets soleus specifically', 'Part of Alfredson protocol'],
    safetyData: {
      contraindications: ['Complete Achilles rupture', 'Acute inflammation'],
      precautions: ['Pain > 5/10 - stop', 'Build volume gradually'],
      redFlags: ['Sharp sudden pain', 'Unable to weight bear'],
      maxPainDuring: 5,
      maxPainAfter24h: 4,
      healingTissue: 'Achilles tendon, soleus',
      targetStructure: 'Soleus portion of Achilles',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Start gentle'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 14, maxPainDuring: 4, maxPainAfter: 3, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee straightening', 'Fast lowering'] }
    },
    evidenceBase: { level: 'A', source: 'Alfredson H. Eccentric protocol. Am J Sports Med, 1998', studyType: 'RCT' }
  },

  // ============================================
  // ANKLE STABILITY PROGRESSIONS
  // ============================================
  {
    id: 'ankle_balance_reach',
    baseName: 'Single Leg Balance with Reach',
    baseNameSv: 'Enbensstående med Räckvidd',
    description: 'Dynamic balance with reaching challenges',
    descriptionSv: 'Dynamisk balans med räckviddsutmaningar',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'tibialis_posterior', 'gluteus_medius'],
    jointType: 'ankle',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'cone', 'ball'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,
    instructions: [
      'Stand on one leg',
      'Reach opposite hand forward, sideways, and back',
      'Touch floor or target if able',
      'Return to start position',
      'Maintain balance throughout',
      'Repeat in all directions'
    ],
    instructionsSv: [
      'Stå på ett ben',
      'Räck motsatt hand framåt, åt sidan och bakåt',
      'Rör golvet eller målet om möjligt',
      'Återgå till startposition',
      'Behåll balansen genom hela rörelsen',
      'Upprepa i alla riktningar'
    ],
    techniquePoints: ['Keep standing knee soft', 'Control hip movement', 'Quality over depth', 'Progress reach distance'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Non-weight bearing'],
      precautions: ['Fall risk - near support', 'Start with small reaches'],
      redFlags: ['Loss of balance repeatedly', 'Pain with reaching'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'Ankle proprioception, hip stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Near support', 'Small reaches'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip drop', 'Trunk rotation'] }
    },
    evidenceBase: { level: 'A', source: 'Martin RL. Ankle instability CPG. JOSPT, 2013', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'ankle_star_excursion',
    baseName: 'Star Excursion Balance Test',
    baseNameSv: 'Stjärnbalanstest',
    description: 'Multi-directional reach test for ankle function',
    descriptionSv: 'Flerriktat räckvidhetstest för fotledsfunktion',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_posterior', 'gluteus_medius', 'quadriceps'],
    jointType: 'ankle',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'tape'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 4, max: 6 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 60,
    instructions: [
      'Stand in center of star pattern (8 directions)',
      'Balance on test leg',
      'Reach opposite foot as far as possible in each direction',
      'Lightly touch floor with toes',
      'Return to center without losing balance',
      'Repeat for all 8 directions'
    ],
    instructionsSv: [
      'Stå i mitten av stjärnmönster (8 riktningar)',
      'Balansera på testbenet',
      'Räck motsatt fot så långt som möjligt i varje riktning',
      'Rör lätt golvet med tårna',
      'Återgå till mitten utan att tappa balansen',
      'Upprepa för alla 8 riktningar'
    ],
    techniquePoints: ['Light touch only', 'No weight transfer to reaching foot', 'Compare sides', 'Objective measurement tool'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Severe instability'],
      precautions: ['Fall risk', 'Start with easier directions'],
      redFlags: ['Unable to maintain balance', 'Pain with reaching'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'Dynamic ankle stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['3 directions only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 6, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Weight transfer', 'Balance loss'] }
    },
    evidenceBase: { level: 'A', source: 'Gribble PA. SEBT reliability. JOSPT, 2012', studyType: 'Validity study' }
  },

  {
    id: 'ankle_wobble_board',
    baseName: 'Wobble Board Balance',
    baseNameSv: 'Wobbelbrädbalans',
    description: 'Unstable surface training for ankle proprioception',
    descriptionSv: 'Instabil ytträning för fotledspropriception',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'tibialis_posterior'],
    jointType: 'ankle',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wobble_board',
    allowedEquipment: ['wobble_board', 'bosu', 'balance_pad'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 45,
    instructions: [
      'Stand on wobble board with feet hip-width',
      'Keep knees slightly bent',
      'Try to keep board level',
      'Progress to circular movements',
      'Single leg when ready'
    ],
    instructionsSv: [
      'Stå på wobbelbrädan med fötterna höftbrett',
      'Håll knäna lätt böjda',
      'Försök hålla brädan nivå',
      'Gå vidare till cirkelrörelser',
      'Ett ben när du är redo'
    ],
    techniquePoints: ['Start bilateral', 'Progress to single leg', 'Control tilting', 'Challenge with eyes closed'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Severe balance issues'],
      precautions: ['Fall risk - near support', 'Start stable before unstable'],
      redFlags: ['Repeated giving way', 'Unable to control board'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments, proprioceptors',
      targetStructure: 'Ankle neuromuscular control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Bilateral only', 'Near support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Edge touching frequently', 'Balance loss'] }
    },
    evidenceBase: { level: 'A', source: 'Hupperets MDW. Proprioceptive training. BJSM, 2009', studyType: 'RCT' }
  },

  {
    id: 'ankle_baps_board',
    baseName: 'BAPS Board Exercise',
    baseNameSv: 'BAPS-brädövning',
    description: 'Biomechanical ankle platform system for rehab',
    descriptionSv: 'Biomekaniskt fotledsplattformssystem för rehab',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'tibialis_posterior'],
    jointType: 'ankle',
    exerciseType: 'balance',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'baps_board',
    allowedEquipment: ['baps_board', 'wobble_board'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Sit or stand with foot on BAPS board',
      'Roll board in clockwise circles',
      'Then counterclockwise',
      'Progress to figure-8 patterns',
      'Advance to standing single leg'
    ],
    instructionsSv: [
      'Sitt eller stå med foten på BAPS-brädan',
      'Rulla brädan i medurs cirklar',
      'Sedan moturs',
      'Gå vidare till 8-mönster',
      'Avancera till stående ett ben'
    ],
    techniquePoints: ['Smooth continuous movement', 'Full range all directions', 'Control speed', 'Progress resistance levels'],
    safetyData: {
      contraindications: ['Acute ankle fracture', 'Non-weight bearing'],
      precautions: ['Recent sprain - start seated', 'Build up duration'],
      redFlags: ['Pain with movement', 'Grinding sensation'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle joint, ligaments',
      targetStructure: 'Active ankle mobility and control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Seated only', 'Within ROM limits'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Jerky movement', 'Limited range'] }
    },
    evidenceBase: { level: 'B', source: 'Martin RL. Ankle rehabilitation. JOSPT, 2013', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // TIBIALIS ANTERIOR EXERCISES
  // ============================================
  {
    id: 'ankle_dorsiflexion_strengthening',
    baseName: 'Resisted Dorsiflexion',
    baseNameSv: 'Dorsalflexion med Motstånd',
    description: 'Tibialis anterior strengthening with band',
    descriptionSv: 'Tibialis anterior-styrka med band',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: [
      'Sit with leg extended',
      'Anchor band to fixed point in front',
      'Loop band over top of foot',
      'Pull toes toward shin against resistance',
      'Hold at end range',
      'Return slowly'
    ],
    instructionsSv: [
      'Sitt med benet utsträckt',
      'Förankra bandet till fast punkt framför',
      'Lägg bandet över fotryggen',
      'Dra tårna mot skenbenet mot motstånd',
      'Håll i ändläget',
      'Återgå långsamt'
    ],
    techniquePoints: ['Isolate ankle movement', 'Full dorsiflexion', 'Control both phases', 'Keep lower leg still'],
    safetyData: {
      contraindications: ['Tibialis anterior rupture', 'Foot drop - needs assessment'],
      precautions: ['Shin splints - start gentle', 'Anterior compartment issues'],
      redFlags: ['Sharp anterior shin pain', 'Numbness in foot'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Tibialis anterior',
      targetStructure: 'Tibialis anterior muscle',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip flexion', 'Toe extension only'] }
    },
    evidenceBase: { level: 'B', source: 'Martin RL. Ankle strengthening. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_heel_walks',
    baseName: 'Heel Walking',
    baseNameSv: 'Hälgång',
    description: 'Functional tibialis anterior strengthening',
    descriptionSv: 'Funktionell tibialis anterior-styrka',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 20, max: 40 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Stand with feet together',
      'Lift toes up, walk on heels only',
      'Keep toes pointed up throughout',
      'Take small controlled steps',
      'Walk forward a set distance',
      'Rest and repeat'
    ],
    instructionsSv: [
      'Stå med fötterna ihop',
      'Lyft tårna upp, gå endast på hälarna',
      'Håll tårna uppåt genom hela rörelsen',
      'Ta små kontrollerade steg',
      'Gå framåt en bestämd sträcka',
      'Vila och upprepa'
    ],
    techniquePoints: ['Maximum dorsiflexion', 'Do not let toes drop', 'Control balance', 'Functional strengthening'],
    safetyData: {
      contraindications: ['Foot drop', 'Severe balance issues'],
      precautions: ['Fall risk - near support', 'Shin splints - reduce volume'],
      redFlags: ['Unable to maintain position', 'Anterior leg pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Tibialis anterior',
      targetStructure: 'Tibialis anterior endurance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Near support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 40, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Toes dropping', 'Lurching gait'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // PERONEAL STRENGTHENING
  // ============================================
  {
    id: 'ankle_eversion_strengthening',
    baseName: 'Resisted Eversion',
    baseNameSv: 'Eversion med Motstånd',
    description: 'Peroneal strengthening with band - critical for ankle stability',
    descriptionSv: 'Peronealstyrka med band - kritiskt för fotledsstabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: [
      'Sit with legs extended, ankles together',
      'Loop band around both feet',
      'Turn foot outward against resistance',
      'Hold at end range',
      'Return with control',
      'Keep lower leg stable'
    ],
    instructionsSv: [
      'Sitt med benen utsträckta, fotlederna ihop',
      'Lägg bandet runt båda fötterna',
      'Vrid foten utåt mot motstånd',
      'Håll i ändläget',
      'Återgå med kontroll',
      'Håll underbenet stabilt'
    ],
    techniquePoints: ['Isolate eversion', 'Do not dorsiflex simultaneously', 'Full range', 'Critical for inversion sprain prevention'],
    safetyData: {
      contraindications: ['Acute peroneal tendon injury', 'Recent lateral ankle sprain'],
      precautions: ['Chronic ankle instability - essential exercise', 'Start light'],
      redFlags: ['Lateral ankle pain', 'Peroneal snapping'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Peroneal tendons',
      targetStructure: 'Peroneus longus and brevis',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Peroneal tendon repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Combined dorsiflexion'] }
    },
    evidenceBase: { level: 'A', source: 'Martin RL. Ankle instability CPG. JOSPT, 2013', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'ankle_inversion_strengthening',
    baseName: 'Resisted Inversion',
    baseNameSv: 'Inversion med Motstånd',
    description: 'Tibialis posterior strengthening with band',
    descriptionSv: 'Tibialis posterior-styrka med band',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_posterior'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: [
      'Sit with legs extended',
      'Anchor band to fixed point on outside',
      'Loop band around inside of foot',
      'Turn foot inward against resistance',
      'Hold at end range',
      'Return slowly'
    ],
    instructionsSv: [
      'Sitt med benen utsträckta',
      'Förankra bandet till fast punkt på utsidan',
      'Lägg bandet runt insidan av foten',
      'Vrid foten inåt mot motstånd',
      'Håll i ändläget',
      'Återgå långsamt'
    ],
    techniquePoints: ['Isolate inversion', 'Keep lower leg still', 'Full range', 'Supports arch'],
    safetyData: {
      contraindications: ['Acute tibialis posterior injury', 'Recent medial ankle sprain'],
      precautions: ['PTTD - essential but gentle', 'Flat feet - important exercise'],
      redFlags: ['Medial ankle pain', 'Arch collapse'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Tibialis posterior tendon',
      targetStructure: 'Tibialis posterior',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Plantar flexion'] }
    },
    evidenceBase: { level: 'B', source: 'Kulig K. PTTD treatment. JOSPT, 2009', studyType: 'Clinical study' }
  },

  // ============================================
  // PLYOMETRICS AND RETURN TO SPORT
  // ============================================
  {
    id: 'ankle_hop_forward',
    baseName: 'Forward Ankle Hops',
    baseNameSv: 'Framåthopp på Fotled',
    description: 'Low-level plyometric for ankle power',
    descriptionSv: 'Lågintensiv plyometrik för fotledskraft',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'tibialis_anterior'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand with knees slightly bent',
      'Use ankles only (not knees) to hop forward',
      'Land softly on balls of feet',
      'Quick ground contact',
      'Maintain upright posture',
      'Progress to single leg'
    ],
    instructionsSv: [
      'Stå med knäna lätt böjda',
      'Använd endast fotlederna (inte knäna) för att hoppa framåt',
      'Landa mjukt på trampdynorna',
      'Snabb markkontakt',
      'Behåll upprätt hållning',
      'Gå vidare till ett ben'
    ],
    techniquePoints: ['Ankle-dominant movement', 'Quick reactive hops', 'Minimal knee bend', 'Stiff ankle strategy'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Achilles tendinopathy', 'Early post-op'],
      precautions: ['Must have adequate strength first', 'Progress slowly'],
      redFlags: ['Pain with landing', 'Giving way', 'Swelling next day'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Ankle complex',
      targetStructure: 'Ankle power and reactive stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Achilles repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee dominant', 'Hard landing'] }
    },
    evidenceBase: { level: 'A', source: 'Hertel J. Ankle sprain return to sport. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_hop_lateral',
    baseName: 'Lateral Ankle Hops',
    baseNameSv: 'Sidohopp på Fotled',
    description: 'Side-to-side plyometric for ankle stability',
    descriptionSv: 'Sida-till-sida plyometrik för fotledsstabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_posterior', 'gastrocnemius'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'line', 'cone'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand on one side of a line',
      'Hop side to side over the line',
      'Use ankles predominantly',
      'Land softly with good control',
      'Quick transitions',
      'Progress to single leg'
    ],
    instructionsSv: [
      'Stå på ena sidan av en linje',
      'Hoppa sida till sida över linjen',
      'Använd främst fotlederna',
      'Landa mjukt med god kontroll',
      'Snabba övergångar',
      'Gå vidare till ett ben'
    ],
    techniquePoints: ['Control lateral forces', 'Quick direction changes', 'Ankle stability on landing', 'Sport-specific'],
    safetyData: {
      contraindications: ['Acute lateral sprain', 'Chronic instability without adequate strength'],
      precautions: ['Must pass bilateral balance first', 'Progress gradually'],
      redFlags: ['Giving way', 'Pain on landing', 'Unable to control landing'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'Lateral ankle stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Landing in inversion', 'Loss of balance'] }
    },
    evidenceBase: { level: 'A', source: 'Hertel J. Return to sport. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_jump_rope',
    baseName: 'Jump Rope',
    baseNameSv: 'Hopprep',
    description: 'Continuous ankle plyometric for endurance',
    descriptionSv: 'Kontinuerlig fotledsplyometrik för uthållighet',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'tibialis_anterior'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'jump_rope',
    allowedEquipment: ['jump_rope'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 50, max: 200 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Hold rope handles at hip height',
      'Jump with minimal knee bend',
      'Land on balls of feet',
      'Use wrists to turn rope',
      'Maintain rhythm',
      'Progress to single leg or variations'
    ],
    instructionsSv: [
      'Håll rephandtagen i höfthöjd',
      'Hoppa med minimal knäböjning',
      'Landa på trampdynorna',
      'Använd handlederna för att vrida repet',
      'Behåll rytmen',
      'Gå vidare till ett ben eller variationer'
    ],
    techniquePoints: ['Ankle-dominant jumping', 'Light quick bounces', 'Relaxed upper body', 'Cardiovascular and ankle endurance'],
    safetyData: {
      contraindications: ['Acute ankle injury', 'Achilles tendinopathy'],
      precautions: ['Start with low volume', 'Good footwear important'],
      redFlags: ['Calf pain', 'Ankle pain', 'Swelling'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Achilles, calf muscles',
      targetStructure: 'Ankle plyometric endurance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Low volume', 'Bilateral only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 100, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 2, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Heavy landing', 'Knee dominant'] }
    },
    evidenceBase: { level: 'B', source: 'Hertel J. Plyometric progression. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_depth_drop',
    baseName: 'Ankle Depth Drop',
    baseNameSv: 'Djuphopp för Fotled',
    description: 'Advanced reactive ankle training',
    descriptionSv: 'Avancerad reaktiv fotledsträning',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'peroneals'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'box'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Stand on low step or box (10-20cm)',
      'Step off and drop to ground',
      'Land with stiff ankles',
      'Immediately rebound up',
      'Minimize ground contact time',
      'Progress height gradually'
    ],
    instructionsSv: [
      'Stå på lågt steg eller låda (10-20cm)',
      'Kliv av och släpp dig till marken',
      'Landa med stela fotleder',
      'Studsa omedelbart uppåt',
      'Minimera markkontakttiden',
      'Öka höjden gradvis'
    ],
    techniquePoints: ['Very quick ground contact', 'Ankle stiffness strategy', 'No heel touch', 'High level exercise'],
    safetyData: {
      contraindications: ['Any acute ankle injury', 'Achilles issues', 'Early post-op', 'Inadequate strength base'],
      precautions: ['Must have completed full strength program', 'Start very low'],
      redFlags: ['Any pain', 'Giving way', 'Unable to control landing'],
      maxPainDuring: 1,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle complex',
      targetStructure: 'Reactive ankle stiffness',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Start very low height'] }
      ],
      appropriateForSurgeries: ['Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 0, maxPainAfter: 1, formScore: 95 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Knee collapse', 'Heel contact', 'Loss of control'] }
    },
    evidenceBase: { level: 'B', source: 'Lloyd RS. Plyometric training. BJSM, 2012', studyType: 'Position statement' }
  },

  // ============================================
  // PLANTAR FASCIA SPECIFIC
  // ============================================
  {
    id: 'ankle_plantar_fascia_stretch',
    baseName: 'Plantar Fascia Stretch',
    baseNameSv: 'Plantarfasciastretch',
    description: 'Specific stretch for plantar fasciitis',
    descriptionSv: 'Specifik stretch för plantarfasciit',
    bodyRegion: 'ankle',
    muscleGroups: ['plantar_fascia'],
    jointType: 'foot',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 3 },
    baseHoldSeconds: 10,
    baseRestSeconds: 10,
    instructions: [
      'Sit and cross affected foot over opposite knee',
      'Grasp toes and pull them back toward shin',
      'Feel stretch across bottom of foot',
      'Hold position',
      'Perform especially before first steps in morning',
      'Repeat multiple times daily'
    ],
    instructionsSv: [
      'Sitt och korsa påverkad fot över motsatt knä',
      'Greppa tårna och dra dem bakåt mot skenbenet',
      'Känn stretch över fotsulan',
      'Håll positionen',
      'Utför särskilt före första stegen på morgonen',
      'Upprepa flera gånger dagligen'
    ],
    techniquePoints: ['Toe extension creates tension', 'Should feel stretch, not pain', 'Best done before getting up', 'Consistent daily practice important'],
    safetyData: {
      contraindications: ['Plantar fascia rupture', 'Acute foot fracture'],
      precautions: ['Diabetes - check sensation', 'Gentle stretch only'],
      redFlags: ['Numbness in foot', 'Severe pain with stretch'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Plantar fascia',
      targetStructure: 'Plantar fascia flexibility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Plantar fascia release'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 14, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Excessive force'] }
    },
    evidenceBase: { level: 'A', source: 'DiGiovanni BF. Plantar fascia stretching. JBJS, 2003', studyType: 'RCT' }
  },

  {
    id: 'ankle_frozen_bottle_roll',
    baseName: 'Frozen Bottle Roll',
    baseNameSv: 'Fryst Flaskrulle',
    description: 'Ice massage for plantar fascia',
    descriptionSv: 'Ismassage för plantarfascia',
    bodyRegion: 'ankle',
    muscleGroups: ['plantar_fascia'],
    jointType: 'foot',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'bottle',
    allowedEquipment: ['bottle', 'ball'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 300,
    baseRestSeconds: 60,
    instructions: [
      'Freeze water bottle',
      'Sit with foot on frozen bottle',
      'Roll foot back and forth over bottle',
      'Apply moderate pressure',
      'Continue for 5-10 minutes',
      'Perform daily, especially after activity'
    ],
    instructionsSv: [
      'Frys vattenflaska',
      'Sitt med foten på frusen flaska',
      'Rulla foten fram och tillbaka över flaskan',
      'Applicera måttligt tryck',
      'Fortsätt i 5-10 minuter',
      'Utför dagligen, särskilt efter aktivitet'
    ],
    techniquePoints: ['Combines ice and massage', 'Comfortable pressure', 'Full foot coverage', 'Effective for plantar fasciitis'],
    safetyData: {
      contraindications: ['Cold sensitivity', 'Peripheral vascular disease', 'Raynaud syndrome'],
      precautions: ['Diabetes - check sensation', 'Do not overdo duration'],
      redFlags: ['Numbness from cold', 'Skin color changes'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Plantar fascia',
      targetStructure: 'Plantar fascia inflammation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Plantar fascia release'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 0, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: [] }
    },
    evidenceBase: { level: 'B', source: 'Martin RL. Heel pain CPG. JOSPT, 2014', studyType: 'Clinical guideline' }
  },

  // ============================================
  // ADDITIONAL FOOT EXERCISES
  // ============================================
  {
    id: 'ankle_marble_pickup',
    baseName: 'Marble Pickup',
    baseNameSv: 'Kulplockning',
    description: 'Toe dexterity and intrinsic muscle exercise',
    descriptionSv: 'Tådexteritet och intrinsisk muskelövning',
    bodyRegion: 'ankle',
    muscleGroups: ['foot_intrinsics', 'toe_flexors'],
    jointType: 'foot',
    exerciseType: 'motor_control',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'marbles',
    allowedEquipment: ['marbles', 'small_objects'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Scatter marbles on floor',
      'Use toes to pick up one marble',
      'Transfer to a container',
      'Use all toes to grip',
      'Complete all marbles',
      'Time yourself to track progress'
    ],
    instructionsSv: [
      'Sprid kulor på golvet',
      'Använd tårna för att plocka upp en kula',
      'Flytta till en behållare',
      'Använd alla tår för att greppa',
      'Slutför alla kulor',
      'Ta tid för att spåra framsteg'
    ],
    techniquePoints: ['Use toe grip, not scraping', 'All toes work together', 'Fun and functional', 'Good for foot awareness'],
    safetyData: {
      contraindications: ['Acute toe injury', 'Open wounds'],
      precautions: ['Cramping - rest and stretch', 'Start with larger objects'],
      redFlags: ['Severe cramping', 'Unable to grip'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Toe muscles',
      targetStructure: 'Toe flexors and coordination',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['If toe motion allowed'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hallux surgery', 'Toe surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Scraping instead of gripping'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'ankle_toe_spreads',
    baseName: 'Toe Spreads (Splay)',
    baseNameSv: 'Tåspridning',
    description: 'Active toe abduction for foot control',
    descriptionSv: 'Aktiv tåabduktion för fotkontroll',
    bodyRegion: 'ankle',
    muscleGroups: ['foot_intrinsics'],
    jointType: 'foot',
    exerciseType: 'motor_control',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 15,
    instructions: [
      'Sit or stand with foot flat',
      'Spread all toes apart as wide as possible',
      'Hold spread position',
      'Relax and bring toes together',
      'Keep foot stable on floor',
      'May need to assist initially'
    ],
    instructionsSv: [
      'Sitt eller stå med foten platt',
      'Sprid alla tår så brett som möjligt',
      'Håll spridningspositionen',
      'Slappna av och för ihop tårna',
      'Håll foten stabil på golvet',
      'Kan behöva hjälpa till initialt'
    ],
    techniquePoints: ['Active abduction', 'Do not curl toes', 'Important for toe function', 'Often weak from footwear'],
    safetyData: {
      contraindications: ['Acute toe injury'],
      precautions: ['May be difficult initially', 'Practice patience'],
      redFlags: ['Unable to move toes independently'],
      maxPainDuring: 1,
      maxPainAfter24h: 0,
      healingTissue: 'Intrinsic foot muscles',
      targetStructure: 'Toe abductors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hallux surgery', 'Bunion surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Toe curling'] }
    },
    evidenceBase: { level: 'C', source: 'Mulligan EP. Foot exercises. JOSPT, 2013', studyType: 'Clinical study' }
  },

  {
    id: 'ankle_big_toe_raises',
    baseName: 'Great Toe Extension',
    baseNameSv: 'Stortåextension',
    description: 'Isolated great toe extension for windlass mechanism',
    descriptionSv: 'Isolerad stortåextension för windlass-mekanismen',
    bodyRegion: 'ankle',
    muscleGroups: ['toe_extensors'],
    jointType: 'foot',
    exerciseType: 'motor_control',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 15,
    instructions: [
      'Sit or stand with foot flat',
      'Lift great toe only while keeping other toes down',
      'Hold at top',
      'Lower with control',
      'Then reverse: lift 4 small toes, keep big toe down',
      'Develops independent toe control'
    ],
    instructionsSv: [
      'Sitt eller stå med foten platt',
      'Lyft endast stortån medan andra tår hålls nere',
      'Håll i toppen',
      'Sänk med kontroll',
      'Sedan omvänt: lyft 4 små tår, håll stortån nere',
      'Utvecklar oberoende tåkontroll'
    ],
    techniquePoints: ['Isolate great toe', 'Keep foot stable', 'Important for gait', 'Practice both directions'],
    safetyData: {
      contraindications: ['Acute hallux injury', 'Hallux rigidus - within ROM'],
      precautions: ['May be difficult initially', 'Gentle practice'],
      redFlags: ['Pain with movement', 'Unable to achieve any lift'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Toe muscles',
      targetStructure: 'Extensor hallucis, windlass mechanism',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Within allowed ROM'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hallux surgery', 'Bunion surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['All toes moving together'] }
    },
    evidenceBase: { level: 'B', source: 'Mulligan EP. Foot exercises. JOSPT, 2013', studyType: 'Clinical study' }
  },

  // ============================================
  // FUNCTIONAL ANKLE EXERCISES
  // ============================================
  {
    id: 'ankle_toe_walks',
    baseName: 'Toe Walking',
    baseNameSv: 'Tågång',
    description: 'Functional calf strengthening and balance',
    descriptionSv: 'Funktionell vadstyrka och balans',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 20, max: 40 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Rise up on toes as high as possible',
      'Walk forward staying on toes',
      'Do not let heels touch ground',
      'Take small steps',
      'Maintain upright posture',
      'Continue for set distance or steps'
    ],
    instructionsSv: [
      'Res dig upp på tårna så högt som möjligt',
      'Gå framåt medan du stannar på tårna',
      'Låt inte hälarna röra marken',
      'Ta små steg',
      'Behåll upprätt hållning',
      'Fortsätt under bestämd sträcka eller steg'
    ],
    techniquePoints: ['Stay as high as possible', 'Smooth gait pattern', 'Good for calf endurance', 'Functional strengthening'],
    safetyData: {
      contraindications: ['Acute Achilles injury', 'Severe balance issues'],
      precautions: ['Fall risk', 'Start with shorter distances'],
      redFlags: ['Calf pain', 'Unable to maintain height'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Calf muscles',
      targetStructure: 'Gastrocnemius, soleus endurance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Short distances', 'Near support'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 40, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 2, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Heel touching', 'Height loss'] }
    },
    evidenceBase: { level: 'B', source: 'Martin RL. Ankle rehabilitation. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_agility_ladder',
    baseName: 'Agility Ladder Drills',
    baseNameSv: 'Smidighetsstegeövningar',
    description: 'Quick feet drills for ankle coordination',
    descriptionSv: 'Snabbfötaövningar för fotledskoordination',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'peroneals', 'tibialis_anterior'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'agility_ladder',
    allowedEquipment: ['agility_ladder', 'tape'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 6 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Set up agility ladder on ground',
      'Perform quick foot patterns through ladder',
      'Common patterns: 2-feet in each square, lateral shuffle, in-out',
      'Stay on balls of feet',
      'Quick light contacts',
      'Progress speed as control improves'
    ],
    instructionsSv: [
      'Sätt upp smidhetsstegen på marken',
      'Utför snabba fotmönster genom stegen',
      'Vanliga mönster: 2 fötter i varje ruta, sidoförflyttning, in-ut',
      'Stanna på trampdynorna',
      'Snabba lätta kontakter',
      'Öka hastigheten när kontrollen förbättras'
    ],
    techniquePoints: ['Quick feet, not big steps', 'Stay low', 'Ankle reactivity', 'Sport-specific training'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Recent surgery', 'Inadequate strength'],
      precautions: ['Build up gradually', 'Good footwear'],
      redFlags: ['Pain', 'Giving way', 'Loss of control'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Ankle complex',
      targetStructure: 'Ankle agility and coordination',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Slow speed only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Achilles repair'],
      progressionCriteria: { minPainFreeReps: 6, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Tripping', 'Loss of rhythm'] }
    },
    evidenceBase: { level: 'B', source: 'Hertel J. Return to sport. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_box_step_overs',
    baseName: 'Lateral Box Step-Overs',
    baseNameSv: 'Lateral Låda Överkliv',
    description: 'Lateral stepping for ankle control',
    descriptionSv: 'Lateral kliv för fotledskontroll',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_posterior', 'gastrocnemius'],
    jointType: 'ankle',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'box', 'hurdle'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Stand beside low box or step',
      'Step laterally over box',
      'Land with control',
      'Step back over to start',
      'Maintain upright posture',
      'Progress to continuous movement'
    ],
    instructionsSv: [
      'Stå bredvid låg låda eller steg',
      'Kliv lateralt över lådan',
      'Landa med kontroll',
      'Kliv tillbaka till start',
      'Behåll upprätt hållning',
      'Gå vidare till kontinuerlig rörelse'
    ],
    techniquePoints: ['Control lateral movement', 'Land on ball of foot', 'Keep hips level', 'Progress height and speed'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Severe instability'],
      precautions: ['Start low', 'Progress gradually'],
      redFlags: ['Ankle giving way', 'Pain on landing'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'Lateral ankle stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Low height only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Trunk lean', 'Loss of control'] }
    },
    evidenceBase: { level: 'B', source: 'Hertel J. Ankle rehabilitation. JOSPT, 2013', studyType: 'Clinical guideline' }
  },

  {
    id: 'ankle_single_leg_stance_perturbation',
    baseName: 'Single Leg Balance with Perturbation',
    baseNameSv: 'Enbensstående med Störning',
    description: 'Reactive balance training with external challenge',
    descriptionSv: 'Reaktiv balansträning med extern utmaning',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'tibialis_posterior'],
    jointType: 'ankle',
    exerciseType: 'balance',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'ball', 'resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 45,
    instructions: [
      'Stand on one leg',
      'Partner or self provides perturbations',
      'Catch and throw ball',
      'Or use resistance band pulls',
      'Maintain balance through challenges',
      'Recover without putting foot down'
    ],
    instructionsSv: [
      'Stå på ett ben',
      'Partner eller själv ger störningar',
      'Fånga och kasta boll',
      'Eller använd motståndsbanddrag',
      'Behåll balansen genom utmaningar',
      'Återhämta utan att sätta ner foten'
    ],
    techniquePoints: ['Quick ankle reactions', 'Hip strategy as backup', 'Unpredictable challenges best', 'Sport-specific'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Severe instability'],
      precautions: ['Near support initially', 'Progress perturbation intensity'],
      redFlags: ['Repeated giving way', 'Unable to recover'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments, proprioceptors',
      targetStructure: 'Reactive ankle stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Gentle perturbations only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Foot touching down', 'Loss of balance'] }
    },
    evidenceBase: { level: 'A', source: 'McKeon PO. Dynamic balance training. JOSPT, 2015', studyType: 'Systematic review' }
  },

  // ============================================
  // ACHILLES SPECIFIC
  // ============================================
  {
    id: 'ankle_isometric_plantar_flexion',
    baseName: 'Isometric Plantarflexion',
    baseNameSv: 'Isometrisk Plantarflexion',
    description: 'Early-stage Achilles loading',
    descriptionSv: 'Tidig akillesbelastning',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'isometric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall', 'resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 45,
    baseRestSeconds: 30,
    instructions: [
      'Sit with foot against wall',
      'Push into wall as if pointing toes',
      'Hold submaximal contraction',
      'No movement - pure isometric',
      'Maintain steady pressure',
      'Relax completely between reps'
    ],
    instructionsSv: [
      'Sitt med foten mot väggen',
      'Tryck in i väggen som om du pekar tårna',
      'Håll submaximal kontraktion',
      'Ingen rörelse - ren isometrisk',
      'Behåll stadigt tryck',
      'Slappna av helt mellan repetitionerna'
    ],
    techniquePoints: ['Submaximal effort initially', 'Pain-free intensity', 'Foundation for eccentric program', 'Analgesic effect'],
    safetyData: {
      contraindications: ['Complete Achilles rupture'],
      precautions: ['Start very gentle', 'Monitor response'],
      redFlags: ['Pain increase next day', 'Unable to tolerate any load'],
      maxPainDuring: 4,
      maxPainAfter24h: 3,
      healingTissue: 'Achilles tendon',
      targetStructure: 'Achilles tendon loading',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 3, maxPainAfter: 2, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: [] }
    },
    evidenceBase: { level: 'A', source: 'Rio E. Isometric exercise for tendinopathy. BJSM, 2015', studyType: 'RCT' }
  },

  {
    id: 'ankle_heavy_slow_resistance',
    baseName: 'Heavy Slow Resistance Calf Raise',
    baseNameSv: 'Tung Långsam Tåhävning',
    description: 'HSR protocol for Achilles tendinopathy',
    descriptionSv: 'HSR-protokoll för akillestendinopati',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing', 'seated_machine'],
    baseEquipment: 'weight',
    allowedEquipment: ['weight', 'machine', 'barbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 6, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 120,
    instructions: [
      'Perform calf raise with added weight',
      'Slow 3-second concentric phase',
      'Slow 3-second eccentric phase',
      'Full range of motion',
      'Progress load every session if tolerated',
      'Continue for 12 weeks minimum'
    ],
    instructionsSv: [
      'Utför tåhävning med tillagd vikt',
      'Långsam 3-sekunders koncentrisk fas',
      'Långsam 3-sekunders excentrisk fas',
      'Fullt rörelseomfång',
      'Öka belastningen varje session om tolererat',
      'Fortsätt i minst 12 veckor'
    ],
    techniquePoints: ['Slow and controlled', 'Progressive overload key', 'Alternative to Alfredson eccentric', 'Evidence-based protocol'],
    safetyData: {
      contraindications: ['Complete Achilles rupture', 'Acute inflammation'],
      precautions: ['Pain > 5/10 - reduce load', 'Monitor 24-hour response'],
      redFlags: ['Pain worsening over weeks', 'Sudden sharp pain'],
      maxPainDuring: 5,
      maxPainAfter24h: 4,
      healingTissue: 'Achilles tendon',
      targetStructure: 'Achilles tendon remodeling',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light load initially'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 14, maxPainDuring: 4, maxPainAfter: 3, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Rushing reps', 'Incomplete range'] }
    },
    evidenceBase: { level: 'A', source: 'Beyer R. HSR vs eccentric. BJSM, 2015', studyType: 'RCT' }
  },

  // ============================================
  // DORSIFLEXION MOBILITY
  // ============================================
  {
    id: 'ankle_dorsiflexion_mobilization',
    baseName: 'Knee to Wall Ankle Mobilization',
    baseNameSv: 'Knä mot Vägg Fotledsmobilisering',
    description: 'Active mobility for ankle dorsiflexion',
    descriptionSv: 'Aktiv mobilitet för fotledsdorsalflexion',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'mobility',
    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 15,
    instructions: [
      'Stand facing wall, foot back from wall',
      'Keep heel on floor',
      'Drive knee toward and past wall',
      'Measure distance foot can be from wall',
      'Progress distance as mobility improves',
      'Great objective measure'
    ],
    instructionsSv: [
      'Stå mot väggen, foten bakåt från väggen',
      'Håll hälen på golvet',
      'Driv knät mot och förbi väggen',
      'Mät avståndet foten kan vara från väggen',
      'Öka avståndet när mobiliteten förbättras',
      'Utmärkt objektiv mätning'
    ],
    techniquePoints: ['Heel must stay down', 'Knee travels straight forward', 'Measure and track progress', 'Important for squat and gait'],
    safetyData: {
      contraindications: ['Acute ankle fracture', 'Bone block limiting ROM'],
      precautions: ['Anterior impingement - may be limited', 'Do not force'],
      redFlags: ['Sharp anterior pain', 'Unable to improve over weeks'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle joint capsule',
      targetStructure: 'Ankle dorsiflexion range',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle, within ROM limits'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Heel lift', 'Knee deviation'] }
    },
    evidenceBase: { level: 'B', source: 'Bennell KL. Ankle ROM measurement. JOSPT, 1998', studyType: 'Reliability study' }
  },

  {
    id: 'ankle_joint_mobilization_band',
    baseName: 'Ankle Joint Mobilization with Band',
    baseNameSv: 'Fotledsmobilisering med Band',
    description: 'Self-mobilization for ankle joint stiffness',
    descriptionSv: 'Självmobilisering för fotledsstelhet',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_joint'],
    jointType: 'ankle',
    exerciseType: 'mobility',
    basePosition: 'half_kneeling',
    allowedPositions: ['half_kneeling', 'standing'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 15,
    instructions: [
      'Anchor heavy band low to ground behind you',
      'Loop band around front of ankle',
      'Half kneel with affected foot forward',
      'Band pulls ankle backward',
      'Drive knee forward over toes',
      'Feel improved glide'
    ],
    instructionsSv: [
      'Förankra tungt band lågt bakom dig',
      'Lägg bandet runt framsidan av fotleden',
      'Halvknäläge med påverkad fot framför',
      'Bandet drar fotleden bakåt',
      'Driv knät framåt över tårna',
      'Känn förbättrad glidning'
    ],
    techniquePoints: ['Band provides posterior glide', 'Mulligan technique principle', 'Should feel easier than without band', 'Self-mobilization'],
    safetyData: {
      contraindications: ['Acute fracture', 'Ligament instability'],
      precautions: ['Do not force ROM', 'Pain-free movement'],
      redFlags: ['Increased pain', 'Swelling after'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Ankle joint capsule',
      targetStructure: 'Talocrural joint mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Heel lift', 'Pain avoidance'] }
    },
    evidenceBase: { level: 'B', source: 'Vicenzino B. Mulligan MWM. Manual Therapy, 2006', studyType: 'Clinical study' }
  },

  // ============================================
  // PROPRIOCEPTION & BALANCE
  // ============================================
  {
    id: 'ankle_single_leg_balance_floor',
    baseName: 'Single Leg Balance on Floor',
    baseNameSv: 'Enbensbalans på Golv',
    description: 'Basic balance training for ankle stability',
    descriptionSv: 'Grundläggande balansträning för fotledsstabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'ankle_stabilizers'],
    jointType: 'ankle',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: [
      'Stand near support if needed',
      'Lift one foot off floor',
      'Balance on single leg',
      'Maintain upright posture',
      'Progress to eyes closed',
      'Progress to unstable surface'
    ],
    instructionsSv: [
      'Stå nära stöd vid behov',
      'Lyft en fot från golvet',
      'Balansera på ett ben',
      'Behåll upprätt hållning',
      'Utveckla till stängda ögon',
      'Utveckla till instabil yta'
    ],
    techniquePoints: ['Foundation for ankle stability', 'Progress eyes closed', 'Add perturbations', 'Critical after sprains'],
    safetyData: {
      contraindications: ['Severe balance impairment without support'],
      precautions: ['Fall risk - use support', 'Recent sprain - be careful'],
      redFlags: ['Repeated giving way'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'Ankle proprioception',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['With support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle fracture ORIF', 'Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Grabbing support', 'Hip hiking'] }
    },
    evidenceBase: { level: 'A', source: 'McKeon PO. Balance training after ankle sprain. JOSPT, 2012', studyType: 'Systematic review' }
  },

  {
    id: 'ankle_balance_wobble_board',
    baseName: 'Wobble Board Balance',
    baseNameSv: 'Balansbräda Balans',
    description: 'Unstable surface balance for ankle stability',
    descriptionSv: 'Instabil ytbalans för fotledsstabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'tibialis_anterior', 'ankle_stabilizers'],
    jointType: 'ankle',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wobble_board',
    allowedEquipment: ['wobble_board', 'bosu', 'balance_pad'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: [
      'Stand on wobble board or unstable surface',
      'Start bilateral, progress to single leg',
      'Maintain balance without edge touching floor',
      'Control in all directions',
      'Add ball tosses for challenge',
      'Progress to eyes closed'
    ],
    instructionsSv: [
      'Stå på balansbräda eller instabil yta',
      'Börja bilateralt, utveckla till enben',
      'Håll balansen utan att kanten nuddar golvet',
      'Kontrollera i alla riktningar',
      'Lägg till bollkast för utmaning',
      'Utveckla till stängda ögon'
    ],
    techniquePoints: ['Classic ankle rehab tool', 'Multi-directional challenge', 'Progress systematically', 'Evidence-based for prevention'],
    safetyData: {
      contraindications: ['Acute ankle sprain < 3 days'],
      precautions: ['Fall risk - support nearby', 'Grade the challenge'],
      redFlags: ['Repeated giving way', 'Severe pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'Ankle proprioceptors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Bilateral only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Board touching floor repeatedly'] }
    },
    evidenceBase: { level: 'A', source: 'Hupperets MD. Wobble board training. Br J Sports Med, 2009', studyType: 'RCT' }
  },

  {
    id: 'ankle_star_excursion',
    baseName: 'Star Excursion Balance Test',
    baseNameSv: 'Stjärnexkursionsbalanstest',
    description: 'Dynamic reach test for functional stability',
    descriptionSv: 'Dynamiskt räckvidhetstest för funktionell stabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_stabilizers', 'hip_abductors', 'core'],
    jointType: 'ankle',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'tape'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Stand on one leg at center of star pattern',
      'Reach opposite leg as far as possible in each direction',
      'Anterior, posterolateral, posteromedial (Y-balance)',
      'Lightly touch floor, return to start',
      'Measure reach distance',
      'Compare sides for asymmetry'
    ],
    instructionsSv: [
      'Stå på ett ben i mitten av stjärnmönstret',
      'Sträck motsatt ben så långt som möjligt i varje riktning',
      'Framåt, posterolateralt, posteromedialt (Y-balans)',
      'Nudda golvet lätt, återgå till start',
      'Mät räckvidden',
      'Jämför sidor för asymmetri'
    ],
    techniquePoints: ['Great assessment and training tool', 'Y-balance most common', 'Composite score predicts injury', 'Track improvement over time'],
    safetyData: {
      contraindications: ['Acute ankle injury'],
      precautions: ['Reduced ROM - may limit reach', 'Fatigue - affects performance'],
      redFlags: ['Pain during reach', 'Large side-to-side asymmetry > 4cm'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle complex',
      targetStructure: 'Dynamic ankle stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Stance foot moving', 'Loss of balance'] }
    },
    evidenceBase: { level: 'A', source: 'Gribble PA. Star excursion. J Athletic Training, 2012', studyType: 'Reliability and validity study' }
  },

  // ============================================
  // PERONEAL STRENGTHENING
  // ============================================
  {
    id: 'ankle_peroneal_eversion_band',
    baseName: 'Peroneal Eversion with Band',
    baseNameSv: 'Peroneal Eversion med Band',
    description: 'Resisted eversion for peroneal strengthening',
    descriptionSv: 'Motstånds-eversion för peronealstyrka',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneus_longus', 'peroneus_brevis'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'lying'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band', 'cable_machine'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Sit with legs extended',
      'Loop band around forefoot',
      'Anchor band to fixed point medially',
      'Turn foot outward against resistance',
      'Control return to start',
      'Keep ankle in neutral dorsiflexion'
    ],
    instructionsSv: [
      'Sitt med benen utsträckta',
      'Lägg band runt framfoten',
      'Förankra bandet till fast punkt medialt',
      'Vrid foten utåt mot motståndet',
      'Kontrollera återgång till start',
      'Håll fotleden i neutral dorsalflexion'
    ],
    techniquePoints: ['Key for lateral ankle stability', 'Prevent inversion sprains', 'Isolate eversion movement', 'Progress resistance'],
    safetyData: {
      contraindications: ['Acute peroneal tendon injury'],
      precautions: ['Peroneal tendinitis - pain-free range', 'Do not snap band'],
      redFlags: ['Sharp lateral ankle pain', 'Snapping over malleolus'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Peroneal tendons',
      targetStructure: 'Peroneal muscles',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair', 'Ankle fracture ORIF'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Knee rotation', 'Hip movement'] }
    },
    evidenceBase: { level: 'A', source: 'Kaminski TW. Peroneal strengthening programs. JOSPT, 2013', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'ankle_peroneal_standing',
    baseName: 'Standing Peroneal Activation',
    baseNameSv: 'Stående Peronealaktivering',
    description: 'Functional peroneal activation in weight bearing',
    descriptionSv: 'Funktionell peronealaktivering i viktbärande',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneus_longus', 'peroneus_brevis'],
    jointType: 'ankle',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 20,
    instructions: [
      'Stand on one leg',
      'Focus on pressing big toe into floor',
      'Feel lateral ankle muscles activate',
      'Maintain arch of foot',
      'Hold activation for count',
      'Progress to unstable surface'
    ],
    instructionsSv: [
      'Stå på ett ben',
      'Fokusera på att trycka stortån mot golvet',
      'Känn laterala fotledsmusklerna aktiveras',
      'Behåll fotens valv',
      'Håll aktiveringen i räkning',
      'Utveckla till instabil yta'
    ],
    techniquePoints: ['Functional context', 'Short foot exercise component', 'Prevents rolling out', 'Good cue for athletes'],
    safetyData: {
      contraindications: ['None specific'],
      precautions: ['Balance issues - use support'],
      redFlags: ['Lateral ankle pain'],
      maxPainDuring: 1,
      maxPainAfter24h: 1,
      healingTissue: 'Peroneal muscles',
      targetStructure: 'Functional peroneal control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['With support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All ankle surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Rolling to outside of foot'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // PLANTAR FASCIITIS SPECIFIC
  // ============================================
  {
    id: 'ankle_plantar_fascia_stretch',
    baseName: 'Plantar Fascia Stretch',
    baseNameSv: 'Plantarfasciastretch',
    description: 'Specific stretch for plantar fasciitis',
    descriptionSv: 'Specifik stretch för plantarfasciit',
    bodyRegion: 'ankle',
    muscleGroups: ['plantar_fascia', 'gastrocnemius'],
    jointType: 'foot',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 10 },
    baseSets: { min: 3, max: 3 },
    baseHoldSeconds: 10,
    baseRestSeconds: 5,
    instructions: [
      'Sit with affected foot crossed over opposite knee',
      'Grasp toes and pull back toward shin',
      'Feel stretch along sole of foot',
      'Palpate fascia - should feel taut like guitar string',
      'Hold each stretch',
      'Perform before first steps in morning'
    ],
    instructionsSv: [
      'Sitt med påverkad fot korsad över motsatt knä',
      'Ta tag i tårna och dra tillbaka mot smalbenet',
      'Känn stretch längs fotsulan',
      'Palpera fascia - ska kännas spänd som gitarrsträng',
      'Håll varje stretch',
      'Utför före första stegen på morgonen'
    ],
    techniquePoints: ['Most evidence-based exercise for PF', 'Crucial before first morning steps', 'Feel the fascia stretch', 'Combined with calf stretching'],
    safetyData: {
      contraindications: ['Plantar fascia rupture'],
      precautions: ['Acute inflammation - gentle only', 'Do not overstretch'],
      redFlags: ['Sudden arch pain', 'Pop sensation'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Plantar fascia',
      targetStructure: 'Plantar fascia',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Plantar fascia release'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 14, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Not feeling stretch in fascia'] }
    },
    evidenceBase: { level: 'A', source: 'DiGiovanni BF. Plantar fascia-specific stretching. JBJS, 2003', studyType: 'RCT' }
  },

  {
    id: 'ankle_frozen_bottle_roll',
    baseName: 'Frozen Water Bottle Roll',
    baseNameSv: 'Frusen Vattenflaska Rullning',
    description: 'Ice massage for plantar fasciitis',
    descriptionSv: 'Ismassage för plantarfasciit',
    bodyRegion: 'ankle',
    muscleGroups: ['plantar_fascia'],
    jointType: 'foot',
    exerciseType: 'recovery',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'frozen_bottle',
    allowedEquipment: ['frozen_bottle', 'ice_cup'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 300,
    baseRestSeconds: 60,
    instructions: [
      'Freeze water bottle',
      'Sit with foot on bottle',
      'Roll foot back and forth over bottle',
      'Apply moderate pressure',
      'Focus on painful areas',
      'Continue for 5-10 minutes'
    ],
    instructionsSv: [
      'Frys vattenflaska',
      'Sitt med foten på flaskan',
      'Rulla foten fram och tillbaka över flaskan',
      'Applicera måttligt tryck',
      'Fokusera på smärtsamma områden',
      'Fortsätt i 5-10 minuter'
    ],
    techniquePoints: ['Combines ice and massage', 'Good after activity', 'Reduces inflammation', 'Simple home treatment'],
    safetyData: {
      contraindications: ['Cold intolerance', 'Raynaud disease'],
      precautions: ['Do not freeze directly - keep moving', 'Limit time to avoid frostbite'],
      redFlags: ['Numbness lasting > 20 min'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Plantar fascia',
      targetStructure: 'Plantar fascia inflammation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All foot surgeries'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: [] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // FOOT INTRINSIC EXERCISES
  // ============================================
  {
    id: 'ankle_short_foot',
    baseName: 'Short Foot Exercise',
    baseNameSv: 'Kortfotsövning',
    description: 'Intrinsic foot muscle activation',
    descriptionSv: 'Aktivering av inre fotmuskler',
    bodyRegion: 'ankle',
    muscleGroups: ['foot_intrinsics', 'abductor_hallucis'],
    jointType: 'foot',
    exerciseType: 'isometric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 5,
    baseRestSeconds: 10,
    instructions: [
      'Sit with foot flat on floor',
      'Draw ball of foot toward heel',
      'Create dome in arch',
      'Keep toes relaxed and flat',
      'Hold the arch activation',
      'Progress to standing'
    ],
    instructionsSv: [
      'Sitt med foten platt på golvet',
      'Dra fotbollen mot hälen',
      'Skapa en kupol i valvet',
      'Håll tårna avslappnade och platta',
      'Håll valvaktiveringen',
      'Utveckla till stående'
    ],
    techniquePoints: ['Foundation for foot control', 'Do not curl toes', 'Should see arch rise', 'Important for flat feet'],
    safetyData: {
      contraindications: ['None specific'],
      precautions: ['Do not cramp - build gradually'],
      redFlags: ['Cramping with every attempt'],
      maxPainDuring: 1,
      maxPainAfter24h: 1,
      healingTissue: 'Foot intrinsics',
      targetStructure: 'Arch supporting muscles',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All foot surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 0, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Toe curling', 'No visible arch change'] }
    },
    evidenceBase: { level: 'B', source: 'McKeon PO. Intrinsic foot muscle training. Br J Sports Med, 2015', studyType: 'Review' }
  },

  {
    id: 'ankle_toe_yoga',
    baseName: 'Toe Yoga',
    baseNameSv: 'Tåyoga',
    description: 'Independent toe control exercises',
    descriptionSv: 'Oberoende tåkontrollövningar',
    bodyRegion: 'ankle',
    muscleGroups: ['foot_intrinsics', 'toe_flexors', 'toe_extensors'],
    jointType: 'foot',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 10,
    instructions: [
      'Sit with foot flat on floor',
      'Lift big toe up, keep other toes down',
      'Then reverse - big toe down, others up',
      'Work on isolated control',
      'Try spreading toes apart',
      'Progress all movements to standing'
    ],
    instructionsSv: [
      'Sitt med foten platt på golvet',
      'Lyft stortån upp, håll andra tårna nere',
      'Sedan omvänt - stortån ner, andra upp',
      'Arbeta med isolerad kontroll',
      'Försök sprida tårna isär',
      'Utveckla alla rörelser till stående'
    ],
    techniquePoints: ['Improves foot neural control', 'May be difficult at first', 'Builds foot awareness', 'Fun challenge for patients'],
    safetyData: {
      contraindications: ['None'],
      precautions: ['Cramping - take breaks'],
      redFlags: ['None'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Foot control',
      targetStructure: 'Intrinsic muscles and neural pathways',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All foot surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: false, compensationPatterns: [] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'ankle_towel_scrunch',
    baseName: 'Towel Scrunch',
    baseNameSv: 'Handdukskrympning',
    description: 'Toe gripping exercise for foot strength',
    descriptionSv: 'Tågreppövning för fotstyrka',
    bodyRegion: 'ankle',
    muscleGroups: ['toe_flexors', 'foot_intrinsics'],
    jointType: 'foot',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'towel',
    allowedEquipment: ['towel'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Place towel flat on floor',
      'Sit with foot on towel edge',
      'Use toes to scrunch towel toward you',
      'Pull entire towel under foot',
      'Spread towel out and repeat',
      'Add weight on towel for challenge'
    ],
    instructionsSv: [
      'Lägg handduk platt på golvet',
      'Sitt med foten på handdukens kant',
      'Använd tårna för att krympa handduken mot dig',
      'Dra hela handduken under foten',
      'Sprid ut handduken och upprepa',
      'Lägg vikt på handduken för utmaning'
    ],
    techniquePoints: ['Classic foot exercise', 'Builds toe grip strength', 'Progress with weight', 'Good for plantar fasciitis'],
    safetyData: {
      contraindications: ['None'],
      precautions: ['Cramping - take breaks'],
      redFlags: ['Severe cramping'],
      maxPainDuring: 1,
      maxPainAfter24h: 1,
      healingTissue: 'Toe flexors',
      targetStructure: 'Toe and foot strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All foot surgeries'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Using ankle motion instead of toes'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // PLYOMETRICS & RETURN TO SPORT
  // ============================================
  {
    id: 'ankle_double_leg_hop',
    baseName: 'Double Leg Hop',
    baseNameSv: 'Dubbelbenshopp',
    description: 'Basic plyometric for ankle loading',
    descriptionSv: 'Grundläggande plyometrik för fotledsbelastning',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'quadriceps'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand with feet shoulder width apart',
      'Perform small continuous hops',
      'Land softly on balls of feet',
      'Minimize ground contact time',
      'Keep knees slightly bent',
      'Progress height and speed'
    ],
    instructionsSv: [
      'Stå med fötterna axelbrett isär',
      'Utför små kontinuerliga hopp',
      'Landa mjukt på framfötterna',
      'Minimera markontakttiden',
      'Håll knäna lätt böjda',
      'Utveckla höjd och hastighet'
    ],
    techniquePoints: ['First plyometric step', 'Soft landing crucial', 'Build reactive strength', 'Prepares for single leg'],
    safetyData: {
      contraindications: ['Acute ankle injury', 'Stress fracture'],
      precautions: ['Good bilateral calf raises first', 'Start low intensity'],
      redFlags: ['Pain during landing', 'Swelling after'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Achilles tendon, ankle ligaments',
      targetStructure: 'Reactive ankle strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Low intensity'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Hard landing', 'Asymmetry'] }
    },
    evidenceBase: { level: 'A', source: 'Chimera NJ. Plyometric training for injury prevention. JOSPT, 2004', studyType: 'RCT' }
  },

  {
    id: 'ankle_single_leg_hop',
    baseName: 'Single Leg Hop',
    baseNameSv: 'Enbenshopp',
    description: 'Unilateral plyometric for sport readiness',
    descriptionSv: 'Unilateral plyometrik för sporttillgänglighet',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'quadriceps'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Stand on one leg',
      'Perform small continuous hops',
      'Land softly with knee bent',
      'Maintain balance throughout',
      'Progress height and distance',
      'Compare sides for symmetry'
    ],
    instructionsSv: [
      'Stå på ett ben',
      'Utför små kontinuerliga hopp',
      'Landa mjukt med knät böjt',
      'Behåll balansen hela tiden',
      'Utveckla höjd och avstånd',
      'Jämför sidor för symmetri'
    ],
    techniquePoints: ['Return to sport criterion', 'Must achieve symmetry', 'Last plyometric stage', 'Sport-specific progressions follow'],
    safetyData: {
      contraindications: ['Recent ankle injury < 6 weeks', 'Failed double leg hops'],
      precautions: ['Build up gradually', 'Stop if pain develops'],
      redFlags: ['Giving way', 'Increasing pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Ankle complex',
      targetStructure: 'Single leg reactive control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles repair', 'Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 14, maxPainDuring: 1, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Asymmetry > 10%', 'Poor landing control'] }
    },
    evidenceBase: { level: 'A', source: 'Gribble PA. Return to sport criteria. JOSPT, 2016', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'ankle_lateral_hops',
    baseName: 'Lateral Line Hops',
    baseNameSv: 'Laterala Linjehopp',
    description: 'Side-to-side hopping for lateral ankle stability',
    descriptionSv: 'Sido-till-sido-hoppning för lateral fotledsstabilitet',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals', 'ankle_stabilizers', 'hip_abductors'],
    jointType: 'ankle',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'tape'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 20, max: 30 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand beside line on floor',
      'Hop laterally over line',
      'Land softly and immediately hop back',
      'Continue for set time or reps',
      'Keep knees slightly bent',
      'Progress to single leg'
    ],
    instructionsSv: [
      'Stå bredvid linje på golvet',
      'Hoppa lateralt över linjen',
      'Landa mjukt och hoppa tillbaka omedelbart',
      'Fortsätt för angiven tid eller repetitioner',
      'Håll knäna lätt böjda',
      'Utveckla till enben'
    ],
    techniquePoints: ['Challenges frontal plane control', 'Critical for cutting sports', 'Progress speed and distance', 'Key lateral ankle exercise'],
    safetyData: {
      contraindications: ['Acute lateral ankle sprain'],
      precautions: ['Start bilateral', 'Grade progression'],
      redFlags: ['Lateral ankle giving way', 'Pain during landing'],
      maxPainDuring: 2,
      maxPainAfter24h: 3,
      healingTissue: 'Lateral ankle ligaments',
      targetStructure: 'Lateral ankle stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Bilateral only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 30, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Rolling ankle', 'Poor control'] }
    },
    evidenceBase: { level: 'B', source: 'Hertel J. Functional ankle instability. Sports Med, 2008', studyType: 'Review' }
  },

  // ============================================
  // ANKLE RANGE OF MOTION
  // ============================================
  {
    id: 'ankle_alphabet',
    baseName: 'Ankle Alphabet',
    baseNameSv: 'Fotledsalfabet',
    description: 'Active ROM in all ankle planes',
    descriptionSv: 'Aktivt rörelseomfång i alla fotledsplan',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior', 'peroneals', 'gastrocnemius'],
    jointType: 'ankle',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 1, max: 2 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Sit with leg elevated or hanging',
      'Use big toe as pencil',
      'Write each letter of alphabet',
      'Make letters as large as possible',
      'Move only at ankle, not knee',
      'Complete A through Z'
    ],
    instructionsSv: [
      'Sitt med benet upplyft eller hängande',
      'Använd stortån som penna',
      'Skriv varje bokstav i alfabetet',
      'Gör bokstäverna så stora som möjligt',
      'Rör endast vid fotleden, inte knäet',
      'Fullfölja A till Ö'
    ],
    techniquePoints: ['Easy to remember', 'All planes of motion', 'Good early rehab exercise', 'Can do multiple times daily'],
    safetyData: {
      contraindications: ['Unstable fracture'],
      precautions: ['Recent surgery - check restrictions', 'Pain-free range'],
      redFlags: ['Increased swelling', 'Sharp pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Ankle joint',
      targetStructure: 'Multi-planar ankle ROM',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Within allowed ROM'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All ankle surgeries'],
      progressionCriteria: { minPainFreeReps: 2, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Knee movement'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'ankle_inversion_stretch',
    baseName: 'Ankle Inversion Stretch',
    baseNameSv: 'Fotledsinversionsstretch',
    description: 'Stretch for lateral ankle structures',
    descriptionSv: 'Stretch för laterala fotledsstrukturer',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneals'],
    jointType: 'ankle',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'strap'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Sit with foot accessible',
      'Gently turn sole of foot inward',
      'Use hand to assist stretch',
      'Feel stretch along outer ankle',
      'Hold at comfortable tension',
      'Do not force'
    ],
    instructionsSv: [
      'Sitt med foten tillgänglig',
      'Vänd försiktigt fotsulan inåt',
      'Använd handen för att assistera stretchen',
      'Känn stretch längs yttre fotleden',
      'Håll vid bekväm spänning',
      'Tvinga inte'
    ],
    techniquePoints: ['Not for acute sprains', 'Use after healing phase', 'Regain full inversion ROM', 'Gentle stretch'],
    safetyData: {
      contraindications: ['Acute lateral ankle sprain < 2 weeks'],
      precautions: ['Post-sprain - gentle', 'Do not overstretch ligaments'],
      redFlags: ['Sharp lateral pain', 'Clicking'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral ankle structures',
      targetStructure: 'Peroneal muscles, lateral ligaments',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ligament repair'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: false, compensationPatterns: ['Forcing stretch'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // TIBIALIS POSTERIOR
  // ============================================
  {
    id: 'ankle_tib_post_raise',
    baseName: 'Tibialis Posterior Calf Raise',
    baseNameSv: 'Tibialis Posterior Tåhävning',
    description: 'Single leg calf raise with inversion bias',
    descriptionSv: 'Enbens tåhävning med inversionsbias',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_posterior', 'gastrocnemius', 'soleus'],
    jointType: 'ankle',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'step',
    allowedEquipment: ['step', 'wall'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 15, max: 25 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 60,
    instructions: [
      'Stand on edge of step, single leg',
      'Turn toes slightly inward (pigeon-toed)',
      'Rise up on toes',
      'Focus on pushing through big toe',
      'Lower with control',
      'Feel inner calf working'
    ],
    instructionsSv: [
      'Stå på kanten av steget, enben',
      'Vrid tårna lätt inåt (duvriktad)',
      'Res dig upp på tårna',
      'Fokusera på att trycka genom stortån',
      'Sänk med kontroll',
      'Känn inre vaden arbeta'
    ],
    techniquePoints: ['Targets tib post specifically', 'Important for flat feet', 'Supports medial arch', 'Progressive loading key'],
    safetyData: {
      contraindications: ['Acute tib post tendon rupture'],
      precautions: ['PTTD - progress slowly', 'Monitor for pain'],
      redFlags: ['Medial ankle pain', 'Arch collapse during exercise'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Tibialis posterior tendon',
      targetStructure: 'Tibialis posterior muscle',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Bilateral first'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Tibialis posterior repair'],
      progressionCriteria: { minPainFreeReps: 25, minConsecutiveDays: 14, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: true, formBreakdown: true, compensationPatterns: ['Arch collapse', 'Weight to outside'] }
    },
    evidenceBase: { level: 'B', source: 'Kulig K. Tibialis posterior dysfunction. Foot Ankle Int, 2009', studyType: 'Clinical study' }
  },

  {
    id: 'ankle_arch_support_isometric',
    baseName: 'Arch Support Isometric',
    baseNameSv: 'Valvstöd Isometrisk',
    description: 'Static hold for medial arch support',
    descriptionSv: 'Statisk hållning för medialt valvstöd',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_posterior', 'foot_intrinsics'],
    jointType: 'foot',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing', 'sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 10,
    baseRestSeconds: 10,
    instructions: [
      'Stand with weight on affected foot',
      'Actively lift arch without curling toes',
      'Think of pulling kneecap toward second toe',
      'Hold the arch elevation',
      'Maintain during functional activities',
      'Combine with short foot exercise'
    ],
    instructionsSv: [
      'Stå med vikten på påverkad fot',
      'Lyft aktivt valvet utan att böja tårna',
      'Tänk på att dra knäskålen mot andra tån',
      'Håll valvhöjningen',
      'Behåll under funktionella aktiviteter',
      'Kombinera med kortfotsövning'
    ],
    techniquePoints: ['Foundation for flat feet management', 'Must not curl toes', 'Carry over to walking/running', 'Key motor control exercise'],
    safetyData: {
      contraindications: ['None'],
      precautions: ['Cramping - reduce hold time'],
      redFlags: ['Medial ankle pain'],
      maxPainDuring: 1,
      maxPainAfter24h: 1,
      healingTissue: 'Arch support system',
      targetStructure: 'Medial arch control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All foot surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 0, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Toe curling', 'No visible arch change'] }
    },
    evidenceBase: { level: 'B', source: 'Resende RA. Foot intrinsic training. J Biomech, 2019', studyType: 'Clinical study' }
  },

  // ============================================
  // PERONEAL STRENGTHENING
  // ============================================
  {
    id: 'ankle_peroneal_eversion_band',
    baseName: 'Peroneal Eversion with Band',
    baseNameSv: 'Peroneal Eversion med Band',
    description: 'Resistance band eversion for peroneal strengthening',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneus_longus', 'peroneus_brevis'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['resistance_band_light', 'resistance_band_medium'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Acute peroneal tendon injury', 'Peroneal subluxation'],
      precautions: ['Post-sprain gradual progression'],
      redFlags: ['Lateral ankle pain', 'Tendon snapping'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Peroneal tendons',
      targetStructure: 'Lateral ankle stabilizers',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Peroneal tendon repair', 'Lateral ankle ligament reconstruction'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 2, formScore: 80 }
    },
    evidenceBase: { level: 'A', source: 'Hupperets MD. Proprioceptive training ankle sprain prevention. BJSM 2009', studyType: 'RCT' }
  },
  {
    id: 'ankle_peroneal_eccentric_eversion',
    baseName: 'Eccentric Peroneal Eversion',
    baseNameSv: 'Excentrisk Peroneal Eversion',
    description: 'Eccentric loading for peroneal tendinopathy',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneus_longus', 'peroneus_brevis'],
    exerciseType: 'eccentric',
    allowedPositions: ['standing', 'sitting'],
    allowedEquipment: ['resistance_band', 'step'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Acute peroneal rupture', 'Peroneal dislocation'],
      precautions: ['Pain during = adjust load'],
      redFlags: ['Snapping sensation', 'Increasing pain'],
      maxPainDuring: 4,
      maxPainAfter24h: 3,
      healingTissue: 'Peroneal tendons',
      targetStructure: 'Peroneus longus and brevis',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 12 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 12, max: 16 }, allowed: true, modifications: ['Light'] },
        { phase: 3, weeksPostOp: { min: 16, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Peroneal tendon repair'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 3, maxPainAfter: 2, formScore: 85 }
    },
    evidenceBase: { level: 'B', source: 'Reiman MP. Peroneal tendinopathy treatment. JOSPT 2014', studyType: 'Clinical guideline' }
  },

  // ============================================
  // ANKLE SPRAIN REHABILITATION
  // ============================================
  {
    id: 'ankle_sprain_early_mobilization',
    baseName: 'Early Ankle Sprain Mobilization',
    baseNameSv: 'Tidig Fotledssträckningmobilisering',
    description: 'Pain-free active motion for acute ankle sprain',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_mobilizers'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Suspected fracture', 'Complete ligament rupture'],
      precautions: ['Pain-free range only', 'PRICE protocol first 48-72h'],
      redFlags: ['Severe swelling', 'Unable to bear weight'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle ligaments',
      targetStructure: 'ATFL, CFL ankle ligaments',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ankle ligament reconstruction'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 1, formScore: 70 }
    },
    evidenceBase: { level: 'A', source: 'Bleakley CM. Early mobilization ankle sprain. BJSM 2010', studyType: 'RCT' }
  },
  {
    id: 'ankle_sprain_star_excursion',
    baseName: 'Star Excursion Balance Test/Exercise',
    baseNameSv: 'Stjärnbalanstestövning',
    description: 'Dynamic balance reaching in multiple directions',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_stabilizers', 'hip_stabilizers', 'core'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'tape'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Acute ankle sprain < 2 weeks', 'Severe balance deficit'],
      precautions: ['Start with few directions', 'Progress reach distance'],
      redFlags: ['Pain during', 'Repeated giving way'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle proprioceptors',
      targetStructure: 'Ankle stabilizers and balance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['3 directions only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ankle ligament reconstruction', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 8, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 }
    },
    evidenceBase: { level: 'A', source: 'Gribble PA. SEBT ankle instability prediction. JOSPT 2012', studyType: 'Systematic review' }
  },
  {
    id: 'ankle_cai_coordination_training',
    baseName: 'CAI Coordination Training',
    baseNameSv: 'CAI Koordinationsträning',
    description: 'Training for chronic ankle instability',
    bodyRegion: 'ankle',
    muscleGroups: ['peroneus_longus', 'peroneus_brevis', 'ankle_stabilizers'],
    exerciseType: 'neuromuscular',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'wobble_board', 'bosu'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Acute sprain'],
      precautions: ['Progress slowly', 'Near support initially'],
      redFlags: ['Repeated giving way', 'Increasing instability'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle proprioceptors',
      targetStructure: 'Peroneal neuromuscular control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Stable surface'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ankle ligament reconstruction', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 }
    },
    evidenceBase: { level: 'A', source: 'McKeon PO. Balance training for CAI. JOSPT 2008', studyType: 'Systematic review' }
  },

  // ============================================
  // PLANTAR FASCIA & INTRINSIC FOOT
  // ============================================
  {
    id: 'ankle_plantar_fascia_stretch',
    baseName: 'Plantar Fascia Stretch',
    baseNameSv: 'Plantarfasciastretch',
    description: 'Targeted stretch for plantar fasciitis',
    bodyRegion: 'ankle',
    muscleGroups: ['plantar_fascia', 'intrinsic_foot_muscles'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'frozen_bottle', 'golf_ball'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Plantar fascia rupture'],
      precautions: ['Morning stiffness - stretch before first steps'],
      redFlags: ['Sudden pain relief (possible rupture)'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Plantar fascia',
      targetStructure: 'Plantar fascia and intrinsic foot muscles',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 4, max: 8 }, allowed: true, modifications: ['Gentle'] },
        { phase: 3, weeksPostOp: { min: 8, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Plantar fasciotomy', 'Heel spur surgery'],
      progressionCriteria: { minPainFreeReps: 3, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 }
    },
    evidenceBase: { level: 'A', source: 'DiGiovanni BF. Plantar fascia stretch. JBJS 2003', studyType: 'RCT' }
  },
  {
    id: 'ankle_toe_yoga',
    baseName: 'Toe Yoga',
    baseNameSv: 'Tåyoga',
    description: 'Independent toe control exercises',
    bodyRegion: 'ankle',
    muscleGroups: ['intrinsic_foot_muscles', 'flexor_digitorum'],
    exerciseType: 'motor_control',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    safetyData: {
      contraindications: ['Toe surgery < 6 weeks'],
      precautions: ['Cramping - rest and retry'],
      redFlags: ['Pain in toes'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Intrinsic foot muscles',
      targetStructure: 'Toe motor control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Hallux valgus surgery', 'Toe surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 }
    },
    evidenceBase: { level: 'B', source: 'Goldmann JP. Intrinsic foot muscle function. J Biomech 2013', studyType: 'Clinical study' }
  },
  {
    id: 'ankle_towel_scrunch',
    baseName: 'Towel Scrunch Exercise',
    baseNameSv: 'Handduks-skrynkelövning',
    description: 'Intrinsic foot muscle strengthening',
    bodyRegion: 'ankle',
    muscleGroups: ['intrinsic_foot_muscles', 'flexor_digitorum'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['towel'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    safetyData: {
      contraindications: ['Plantar ulcers', 'Severe neuropathy'],
      precautions: ['Cramping - reduce duration'],
      redFlags: ['Persistent cramping'],
      maxPainDuring: 1,
      maxPainAfter24h: 1,
      healingTissue: 'Intrinsic foot muscles',
      targetStructure: 'Flexor digitorum and intrinsic foot muscles',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 4, max: 8 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 8, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All foot surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 75 }
    },
    evidenceBase: { level: 'B', source: 'Mulligan EP. Foot intrinsic exercises. J Athl Train 2016', studyType: 'Clinical trial' }
  },

  // ============================================
  // AQUATIC ANKLE EXERCISES
  // ============================================
  {
    id: 'ankle_aquatic_walking',
    baseName: 'Aquatic Ankle Walking',
    baseNameSv: 'Akvatisk Fotledsgång',
    description: 'Pool walking for low-impact ankle rehab',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior', 'gastrocnemius', 'soleus', 'peroneals'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['pool'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Open wound', 'Infection'],
      precautions: ['Pool depth chest level for max unloading'],
      redFlags: ['Pain during', 'Swelling after'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle joint and muscles',
      targetStructure: 'All ankle musculature',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 4, max: 8 }, allowed: true, modifications: ['Wound healed'] },
        { phase: 3, weeksPostOp: { min: 8, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All ankle surgeries post-wound healing'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 70 }
    },
    evidenceBase: { level: 'A', source: 'Foley A. Aquatic exercise post-ankle injury. JOSPT 2003', studyType: 'Clinical guideline' }
  },
  {
    id: 'ankle_aquatic_calf_raise',
    baseName: 'Aquatic Calf Raise',
    baseNameSv: 'Akvatisk Tåhävning',
    description: 'Buoyancy-assisted calf raise in pool',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['pool'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Open wound', 'Acute Achilles rupture'],
      precautions: ['Progress depth (shallower = harder)'],
      redFlags: ['Achilles pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Calf complex',
      targetStructure: 'Gastrocnemius and soleus',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Deep water, wound healed'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles tendon repair', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 75 }
    },
    evidenceBase: { level: 'B', source: 'Aquatic therapy protocols. Clinical practice', studyType: 'Clinical guideline' }
  },

  // ============================================
  // SPORT-SPECIFIC ANKLE
  // ============================================
  {
    id: 'ankle_agility_ladder',
    baseName: 'Agility Ladder Ankle Drills',
    baseNameSv: 'Agility-stege Fotledsövningar',
    description: 'Quick foot drills for ankle proprioception',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_stabilizers', 'peroneus', 'tibialis_anterior'],
    exerciseType: 'agility',
    allowedPositions: ['standing'],
    allowedEquipment: ['agility_ladder', 'cones'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Recent surgery'],
      precautions: ['Flat surface', 'Proper footwear'],
      redFlags: ['Giving way', 'Pain during'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle proprioceptors',
      targetStructure: 'Ankle stabilizers and agility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 12 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 12, max: 16 }, allowed: true, modifications: ['Slow patterns'] },
        { phase: 3, weeksPostOp: { min: 16, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lateral ankle ligament reconstruction', 'Ankle arthroscopy'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 }
    },
    evidenceBase: { level: 'B', source: 'Mattacola CG. Ankle agility training. J Athl Train 2002', studyType: 'Clinical study' }
  },
  {
    id: 'ankle_jump_rope',
    baseName: 'Jump Rope Ankle Training',
    baseNameSv: 'Hopprep Fotledsträning',
    description: 'Plyometric ankle conditioning',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'tibialis_anterior'],
    exerciseType: 'plyometric',
    allowedPositions: ['standing'],
    allowedEquipment: ['jump_rope', 'none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Achilles tendinopathy acute', 'Stress fracture'],
      precautions: ['Soft surface', 'Proper footwear'],
      redFlags: ['Achilles pain', 'Shin pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Calf complex and ankle',
      targetStructure: 'Calf and tibialis anterior plyometric',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 16 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 16, max: 24 }, allowed: true, modifications: ['Short duration'] },
        { phase: 3, weeksPostOp: { min: 24, max: 32 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 32, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles tendon repair late phase', 'Ankle ligament reconstruction late phase'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 }
    },
    evidenceBase: { level: 'B', source: 'Plyometric ankle training. Sports Med 2015', studyType: 'Clinical guideline' }
  },
  {
    id: 'ankle_single_leg_hop_progression',
    baseName: 'Single Leg Hop Progression',
    baseNameSv: 'Enbens Hopp Progression',
    description: 'Progressive hopping for return to sport',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'ankle_stabilizers', 'quadriceps'],
    exerciseType: 'plyometric',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'cones'],
    allowedDifficulties: ['advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Acute ankle injury', 'Stress fracture'],
      precautions: ['Master bilateral first', 'Good surface'],
      redFlags: ['Pain during', 'Instability'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle complex',
      targetStructure: 'Calf and ankle plyometric',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 20 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 20, max: 28 }, allowed: true, modifications: ['Forward hops first'] },
        { phase: 3, weeksPostOp: { min: 28, max: 36 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 36, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle ligament reconstruction late phase'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 90 }
    },
    evidenceBase: { level: 'A', source: 'Docherty CL. Hop testing ankle instability. J Sport Rehab 2005', studyType: 'Clinical study' }
  },

  // ============================================
  // ANKLE ISOMETRIC & MOTOR CONTROL
  // ============================================
  {
    id: 'ankle_isometric_dorsiflexion',
    baseName: 'Isometric Dorsiflexion',
    baseNameSv: 'Isometrisk Dorsalflexion',
    description: 'Static tibialis anterior activation',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['none', 'wall', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Tibialis anterior tendon rupture'],
      precautions: ['Avoid shin splints area if sore'],
      redFlags: ['Anterior shin pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Tibialis anterior tendon',
      targetStructure: 'Tibialis anterior',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All ankle surgeries early phase'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 70 }
    },
    evidenceBase: { level: 'B', source: 'Isometric ankle exercises. Clinical practice', studyType: 'Clinical guideline' }
  },
  {
    id: 'ankle_isometric_plantarflexion',
    baseName: 'Isometric Plantarflexion',
    baseNameSv: 'Isometrisk Plantarflexion',
    description: 'Static calf muscle activation',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'wall', 'step'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    safetyData: {
      contraindications: ['Achilles rupture < 6 weeks'],
      precautions: ['Achilles tendinopathy - pain-free position'],
      redFlags: ['Achilles pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Calf complex',
      targetStructure: 'Gastrocnemius and soleus isometric',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle, surgeon guidance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Achilles tendon repair', 'All ankle surgeries'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 }
    },
    evidenceBase: { level: 'A', source: 'Rio E. Isometric exercise for tendinopathy. BJSM 2015', studyType: 'RCT' }
  },

  // ============================================
  // ANKLE OA EXERCISES
  // ============================================
  {
    id: 'ankle_oa_gentle_ROM',
    baseName: 'Ankle OA Gentle ROM',
    baseNameSv: 'Fotleds-OA Skonsam ROM',
    description: 'Pain-free motion for ankle osteoarthritis',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_mobilizers'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['none', 'towel'],
    allowedDifficulties: ['beginner'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Acute OA flare'],
      precautions: ['Morning stiffness - warm up first'],
      redFlags: ['Severe stiffness not improving'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle joint cartilage',
      targetStructure: 'Ankle joint mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 12, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle arthroscopy', 'Ankle debridement'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 70 }
    },
    evidenceBase: { level: 'A', source: 'Beumer L. Exercise for ankle OA. Cochrane 2019', studyType: 'Systematic review' }
  },
  {
    id: 'ankle_oa_strengthening',
    baseName: 'Ankle OA Strengthening',
    baseNameSv: 'Fotleds-OA Styrka',
    description: 'Progressive strengthening for ankle OA',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior', 'gastrocnemius', 'soleus', 'peroneals'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['resistance_band_light', 'resistance_band_medium'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    safetyData: {
      contraindications: ['Severe OA flare'],
      precautions: ['Pain during = reduce load', 'Progress slowly'],
      redFlags: ['Increasing pain over weeks'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle musculature',
      targetStructure: 'All ankle muscles',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle arthroscopy', 'Ankle debridement'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 }
    },
    evidenceBase: { level: 'A', source: 'Beumer L. Exercise for ankle OA. Cochrane 2019', studyType: 'Systematic review' }
  },

  // ============================================
  // RETURN TO RUN ANKLE
  // ============================================
  {
    id: 'ankle_walk_run_progression',
    baseName: 'Walk-Run Progression',
    baseNameSv: 'Gå-Spring Progression',
    description: 'Gradual return to running protocol',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus', 'tibialis_anterior', 'peroneals'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'treadmill'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute ankle injury', 'Stress fracture'],
      precautions: ['Follow 10% rule', 'Good footwear'],
      redFlags: ['Pain during running', 'Swelling after'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'All ankle structures',
      targetStructure: 'Cardiovascular and ankle endurance',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 12 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 12, max: 16 }, allowed: true, modifications: ['Walking only'] },
        { phase: 3, weeksPostOp: { min: 16, max: 24 }, allowed: true, modifications: ['Walk-run intervals'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle ligament reconstruction', 'Achilles repair late phase'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 7, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 }
    },
    evidenceBase: { level: 'B', source: 'Return to running protocols. Willy RW. JOSPT 2019', studyType: 'Clinical guideline' }
  },
  {
    id: 'ankle_running_drills',
    baseName: 'Ankle Running Drills',
    baseNameSv: 'Fotleds Löpövningar',
    description: 'A-skip, B-skip, high knees for running mechanics',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior', 'gastrocnemius', 'hip_flexors'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute ankle sprain', 'Achilles tendinopathy acute'],
      precautions: ['Start slow', 'Good surface'],
      redFlags: ['Pain during', 'Limping'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Ankle and calf complex',
      targetStructure: 'Running mechanics and ankle control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 12 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 12, max: 16 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 16, max: 24 }, allowed: true, modifications: ['Low intensity'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Ankle ligament reconstruction', 'Achilles repair late phase'],
      progressionCriteria: { minPainFreeReps: 3, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 }
    },
    evidenceBase: { level: 'B', source: 'Running gait retraining. Willy RW. JOSPT 2017', studyType: 'Clinical guideline' }
  }
];

export default ankleTemplates;
