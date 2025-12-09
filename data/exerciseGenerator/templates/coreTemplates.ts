/**
 * Core Exercise Templates
 *
 * Evidence-based exercises for core/abdominal rehabilitation
 * Based on Sahrmann movement system and McGill research
 */

import { BaseExerciseTemplate } from '../types';

export const coreTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // DEEP CORE ACTIVATION
  // ============================================
  {
    id: 'core_transverse_activation',
    baseName: 'Transverse Abdominis Activation',
    baseNameSv: 'Transversus Abdominis Aktivering',
    description: 'Isolated deep core muscle activation exercise',
    descriptionSv: 'Isolerad djup core-muskelaktiveringsövning',
    bodyRegion: 'core',
    muscleGroups: ['transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',

    basePosition: 'supine',
    allowedPositions: ['supine', 'quadruped', 'sitting'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'biofeedback'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 10,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back with knees bent',
      'Find neutral spine position',
      'Place fingers on hip bones, slide inward 2 cm',
      'Gently draw lower belly in (10-20% effort)',
      'Do not move spine or pelvis',
      'Breathe normally while holding'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Hitta neutral ryggposition',
      'Placera fingrarna på höftbenen, glid inåt 2 cm',
      'Dra försiktigt in nedre magen (10-20% ansträngning)',
      'Rör inte ryggraden eller bäckenet',
      'Andas normalt under hållningen'
    ],

    techniquePoints: [
      'Feel gentle tightening under fingers',
      'Do NOT brace or hold breath',
      'Very subtle activation',
      'Should not feel in outer abs or back'
    ],

    safetyData: {
      contraindications: ['None - very gentle exercise'],
      precautions: ['Diastasis recti - assess first', 'Post-surgical - check clearance'],
      redFlags: ['Pain with activation', 'Unable to breathe normally'],
      maxPainDuring: 1,
      maxPainAfter24h: 0,
      healingTissue: 'Deep core',
      targetStructure: 'Transverse abdominis motor control',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Any abdominal surgery', 'Lumbar surgery', 'C-section', 'Hernia repair'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 0,
        maxPainAfter: 0,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Breath holding', 'Bracing', 'Pelvis movement']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Hodges PW. Motor control of the trunk. Springer, 2013',
      studyType: 'Motor control research'
    }
  },

  {
    id: 'core_diaphragmatic_breathing',
    baseName: 'Diaphragmatic Breathing',
    baseNameSv: 'Diafragmaandning',
    description: 'Core and breathing coordination exercise',
    descriptionSv: 'Core och andningskoordinationsövning',
    bodyRegion: 'core',
    muscleGroups: ['diaphragm', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting', 'standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,

    instructions: [
      'Lie comfortably with knees bent',
      'Place one hand on chest, one on belly',
      'Inhale slowly through nose',
      'Let belly rise, chest stays still',
      'Exhale slowly through pursed lips',
      'Feel belly fall naturally'
    ],
    instructionsSv: [
      'Ligg bekvämt med böjda knän',
      'Placera en hand på bröstet, en på magen',
      'Andas in långsamt genom näsan',
      'Låt magen höja sig, bröstet förblir stilla',
      'Andas ut långsamt genom sammandragna läppar',
      'Känn magen falla naturligt'
    ],

    techniquePoints: [
      'Chest should not rise',
      'Belly expands 360 degrees',
      'Slow controlled breaths',
      'Relaxed, not forced'
    ],

    safetyData: {
      contraindications: ['None'],
      precautions: ['Dizziness - slow down', 'Anxiety - use shorter sessions'],
      redFlags: ['Chest pain', 'Severe shortness of breath'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Diaphragm, core coordination',
      targetStructure: 'Breathing mechanics',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Any surgery'],

      progressionCriteria: {
        minPainFreeReps: 20,
        minConsecutiveDays: 3,
        maxPainDuring: 0,
        maxPainAfter: 0,
        formScore: 75
      },

      regressionTriggers: {
        painIncrease: 0,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Chest breathing', 'Forced breaths']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Hodges PW, Gandevia SC. Breathing and postural control. Exp Brain Res, 2000',
      studyType: 'Research study'
    }
  },

  // ============================================
  // ANTI-EXTENSION EXERCISES
  // ============================================
  {
    id: 'core_dead_bug',
    baseName: 'Dead Bug',
    baseNameSv: 'Död Insekt',
    description: 'Anti-extension core exercise with contralateral movement',
    descriptionSv: 'Anti-extension core-övning med kontralateral rörelse',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'obliques'],
    jointType: 'spine',
    exerciseType: 'motor_control',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'stability_ball'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'alternating',
    allowedLateralities: ['alternating'],

    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,

    instructions: [
      'Lie on back, arms toward ceiling',
      'Lift legs with hips and knees at 90 degrees',
      'Press lower back gently into floor',
      'Lower opposite arm and leg slowly',
      'Only go as far as back stays flat',
      'Return and switch sides'
    ],
    instructionsSv: [
      'Ligg på rygg, armar mot taket',
      'Lyft benen med höfter och knän i 90 grader',
      'Tryck ländryggen försiktigt mot golvet',
      'Sänk motsatt arm och ben långsamt',
      'Gå bara så långt som ryggen förblir platt',
      'Återgå och byt sida'
    ],

    techniquePoints: [
      'Back must stay flat',
      'Move slowly with control',
      'Exhale as you extend',
      'Quality over range'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Diastasis recti - modify'],
      precautions: ['Hip flexor tightness - reduce range', 'Back pain - smaller movements'],
      redFlags: ['Back arching', 'Radiating pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core musculature',
      targetStructure: 'Anti-extension control',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Arms only', 'Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery'],

      progressionCriteria: {
        minPainFreeReps: 12,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Back arching', 'Breath holding', 'Hip hiking']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Sahrmann S. Movement System Impairment Syndromes. Mosby, 2010',
      studyType: 'Clinical framework'
    }
  },

  {
    id: 'core_front_plank',
    baseName: 'Front Plank',
    baseNameSv: 'Frontplanka',
    description: 'Isometric anti-extension core exercise',
    descriptionSv: 'Isometrisk anti-extension core-övning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'obliques'],
    jointType: 'spine',
    exerciseType: 'isometric',

    basePosition: 'prone',
    allowedPositions: ['prone'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 20,
    baseRestSeconds: 60,

    instructions: [
      'Start on forearms and toes',
      'Elbows under shoulders',
      'Create straight line from head to heels',
      'Tuck tailbone slightly',
      'Brace core - do not let hips sag',
      'Hold position breathing normally'
    ],
    instructionsSv: [
      'Börja på underarmar och tår',
      'Armbågar under axlarna',
      'Skapa rak linje från huvud till hälar',
      'Tuck svanskotan lätt',
      'Spänn core - låt inte höfterna sjunka',
      'Håll positionen och andas normalt'
    ],

    techniquePoints: [
      'Neutral spine - no sagging or piking',
      'Keep neck neutral',
      'Breathe throughout',
      'From knees for beginner'
    ],

    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain', 'Wrist injury'],
      precautions: ['Back pain - from knees', 'Shoulder issues - reduce time'],
      redFlags: ['Sharp back pain', 'Numbness in arms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core musculature',
      targetStructure: 'Rectus abdominis, transverse abdominis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['From knees'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Hips sagging', 'Hips piking', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  // ============================================
  // ANTI-ROTATION EXERCISES
  // ============================================
  {
    id: 'core_pallof_press',
    baseName: 'Pallof Press',
    baseNameSv: 'Pallof Press',
    description: 'Anti-rotation core exercise with band or cable',
    descriptionSv: 'Anti-rotation core-övning med band eller kabel',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'transverse_abdominis', 'rectus_abdominis'],
    jointType: 'spine',
    exerciseType: 'isometric',

    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling', 'kneeling'],

    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band', 'cable_machine'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 10, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,

    instructions: [
      'Stand sideways to anchor point',
      'Hold band/handle at chest with both hands',
      'Feet shoulder width apart',
      'Press arms straight out',
      'Resist rotation - stay square',
      'Return hands to chest and repeat'
    ],
    instructionsSv: [
      'Stå i sidled mot ankarpunkten',
      'Håll bandet/handtaget vid bröstet med båda händerna',
      'Fötterna axelbrett isär',
      'Tryck armarna rakt ut',
      'Motstå rotation - håll dig rak',
      'Återför händerna till bröstet och upprepa'
    ],

    techniquePoints: [
      'Do not let body rotate',
      'Keep hips and shoulders square',
      'Brace core throughout',
      'Slow controlled press'
    ],

    safetyData: {
      contraindications: ['Acute rotational back injury', 'Shoulder impingement'],
      precautions: ['Back pain - lighter resistance', 'Shoulder issues - reduce range'],
      redFlags: ['Sharp back pain', 'Shooting pain into leg'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core rotational control',
      targetStructure: 'Obliques, transverse abdominis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 12,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Trunk rotation', 'Hip shift', 'Shoulder elevation']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'McGill SM. Core Training Evidence and myths. J Bodywork Movement Ther, 2010',
      studyType: 'Research review'
    }
  },

  // ============================================
  // ANTI-LATERAL FLEXION
  // ============================================
  {
    id: 'core_side_plank',
    baseName: 'Side Plank',
    baseNameSv: 'Sidoplanka',
    description: 'Lateral core stability - McGill Big 3 exercise',
    descriptionSv: 'Lateral core-stabilitet - McGill Big 3-övning',
    bodyRegion: 'core',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'gluteus_medius'],
    jointType: 'spine',
    exerciseType: 'isometric',

    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 6 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 10,
    baseRestSeconds: 45,

    instructions: [
      'Lie on side with elbow under shoulder',
      'Stack feet or stagger for stability',
      'Lift hips creating straight line',
      'Keep body in one plane',
      'Hold position breathing normally',
      'Lower with control'
    ],
    instructionsSv: [
      'Ligg på sidan med armbågen under axeln',
      'Stapla fötterna eller förskjut för stabilitet',
      'Lyft höfterna och skapa en rak linje',
      'Håll kroppen i ett plan',
      'Håll positionen och andas normalt',
      'Sänk med kontroll'
    ],

    techniquePoints: [
      'Hips should not sag',
      'Keep shoulders stacked',
      'From knees for beginner',
      'Top arm on hip or toward ceiling'
    ],

    safetyData: {
      contraindications: ['Shoulder instability', 'Acute lateral trunk pain', 'Wrist injury'],
      precautions: ['Neck pain - neutral position', 'Shoulder issues - from knees'],
      redFlags: ['Sharp lateral pain', 'Arm numbness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core',
      targetStructure: 'Quadratus lumborum, obliques',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['From knees only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 6,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Hip drop', 'Trunk rotation', 'Shoulder shrug']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  // ============================================
  // DYNAMIC CORE EXERCISES
  // ============================================
  {
    id: 'core_bird_dog',
    baseName: 'Bird Dog',
    baseNameSv: 'Fågelhund',
    description: 'Quadruped core stability with limb movement',
    descriptionSv: 'Fyrfota core-stabilitet med extremitetsrörelse',
    bodyRegion: 'core',
    muscleGroups: ['multifidus', 'transverse_abdominis', 'gluteus_maximus'],
    jointType: 'spine',
    exerciseType: 'motor_control',

    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'balance_pad'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 45,

    instructions: [
      'Start on hands and knees',
      'Hands under shoulders, knees under hips',
      'Find neutral spine',
      'Extend opposite arm and leg',
      'Keep hips level - no rotation',
      'Hold then return with control'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Händer under axlar, knän under höfter',
      'Hitta neutral rygg',
      'Sträck ut motsatt arm och ben',
      'Håll höfterna i nivå - ingen rotation',
      'Håll sedan återgå med kontroll'
    ],

    techniquePoints: [
      'Imagine balancing water on back',
      'Reach through fingertips and heel',
      'Do not hyperextend neck',
      'Slow deliberate movement'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Wrist fracture', 'Knee injury - pad knee'],
      precautions: ['Back pain - reduce range', 'Shoulder issues - arm only'],
      redFlags: ['Radiating symptoms', 'Severe balance loss'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core stabilizers',
      targetStructure: 'Multifidus, transverse abdominis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Arm only or leg only first'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery'],

      progressionCriteria: {
        minPainFreeReps: 12,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Hip rotation', 'Back extension', 'Shoulder shrug']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  {
    id: 'core_mcgill_curlup',
    baseName: 'McGill Curl-Up',
    baseNameSv: 'McGill Curl-Up',
    description: 'Spine-sparing abdominal exercise',
    descriptionSv: 'Ryggvänlig magövning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'isometric',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 6, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 8,
    baseRestSeconds: 45,

    instructions: [
      'Lie on back, one knee bent, one straight',
      'Place hands under lower back',
      'Brace abdominals',
      'Lift head and shoulders few inches',
      'Do not flatten back or curl up high',
      'Hold then lower'
    ],
    instructionsSv: [
      'Ligg på rygg, ett knä böjt, ett rakt',
      'Placera händerna under ländryggen',
      'Spänn magmusklerna',
      'Lyft huvudet och axlarna några centimeter',
      'Platta inte ryggen eller curl upp högt',
      'Håll sedan sänk'
    ],

    techniquePoints: [
      'Maintain neutral spine',
      'Only lift few inches',
      'Breathe normally during hold',
      'Feel abs, not neck'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Spinal fracture', 'Severe osteoporosis'],
      precautions: ['Neck pain - support head', 'Diastasis recti - assess'],
      redFlags: ['Radiating pain', 'Severe neck pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Abdominal musculature',
      targetStructure: 'Rectus abdominis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Reduced hold time', 'Lower range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery'],

      progressionCriteria: {
        minPainFreeReps: 10,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 80
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Neck strain', 'Back flattening', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  // ============================================
  // ROTATIONAL EXERCISES
  // ============================================
  {
    id: 'core_woodchop',
    baseName: 'Cable/Band Woodchop',
    baseNameSv: 'Kabel/Band Vedhuggar',
    description: 'Diagonal rotational core pattern',
    descriptionSv: 'Diagonalt rotationsmönster för core',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'rectus_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',

    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling', 'kneeling'],

    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band', 'cable_machine'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,

    instructions: [
      'Stand sideways to anchor point',
      'Hold handle with both hands high or low',
      'Feet wider than shoulders',
      'Pull diagonally across body',
      'Rotate from hips and core, not arms',
      'Control return to start'
    ],
    instructionsSv: [
      'Stå i sidled mot ankarpunkten',
      'Håll handtaget med båda händerna högt eller lågt',
      'Fötterna bredare än axlarna',
      'Dra diagonalt över kroppen',
      'Rotera från höfter och core, inte armar',
      'Kontrollera återgång till start'
    ],

    techniquePoints: [
      'Power from hips and core',
      'Arms stay relatively straight',
      'Control eccentric phase',
      'Both high-to-low and low-to-high variations'
    ],

    safetyData: {
      contraindications: ['Acute rotational back injury', 'Disc herniation'],
      precautions: ['Back pain - reduce resistance', 'Shoulder issues - reduce range'],
      redFlags: ['Sharp back pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core rotators',
      targetStructure: 'Obliques, rotational control',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Light resistance'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 7,
        maxPainDuring: 2,
        maxPainAfter: 2,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Arm dominant', 'Loss of hip pivot', 'Back extension']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Santana JC. Functional Training. Human Kinetics, 2015',
      studyType: 'Functional training principles'
    }
  },

  // ============================================
  // ADDITIONAL ANTI-EXTENSION EXERCISES
  // ============================================
  {
    id: 'core_heel_slides',
    baseName: 'Heel Slides',
    baseNameSv: 'Hälglidningar',
    description: 'Supine core control with leg movement',
    descriptionSv: 'Ryggliggande core-kontroll med benrörelse',
    bodyRegion: 'core',
    muscleGroups: ['transverse_abdominis', 'rectus_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'slider'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back with knees bent',
      'Find neutral spine, engage core gently',
      'Slowly slide one heel away',
      'Only go as far as back stays neutral',
      'Return to start with control',
      'Alternate legs'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Hitta neutral rygg, aktivera core försiktigt',
      'Glid långsamt en häl bort',
      'Gå bara så långt som ryggen förblir neutral',
      'Återgå till start med kontroll',
      'Växla ben'
    ],
    techniquePoints: ['Maintain neutral spine', 'Do not flatten or arch back', 'Slow controlled movement', 'Exhale as you extend'],
    safetyData: {
      contraindications: ['None - very gentle'],
      precautions: ['Post-surgical - check clearance', 'Back pain - reduce range'],
      redFlags: ['Pain with any movement', 'Unable to maintain neutral'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Core',
      targetStructure: 'Transverse abdominis control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery', 'C-section'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Pelvis rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Sahrmann S. Movement System Impairment. Mosby, 2010', studyType: 'Clinical framework' }
  },

  {
    id: 'core_single_leg_lowering',
    baseName: 'Single Leg Lowering',
    baseNameSv: 'Enbens Sänkning',
    description: 'Progressive anti-extension with leg lowering',
    descriptionSv: 'Progressiv anti-extension med bensänkning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'hip_flexors'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back, both legs up at 90 degrees',
      'Press lower back into floor',
      'Slowly lower one leg toward floor',
      'Only go as far as back stays flat',
      'Return to start',
      'Alternate legs'
    ],
    instructionsSv: [
      'Ligg på rygg, båda benen upp i 90 grader',
      'Tryck ländryggen mot golvet',
      'Sänk långsamt ett ben mot golvet',
      'Gå bara så långt som ryggen förblir platt',
      'Återgå till start',
      'Växla ben'
    ],
    techniquePoints: ['Back must stay pressed down', 'Exhale as you lower', 'Slow controlled movement', 'Progress range gradually'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Diastasis recti - modify'],
      precautions: ['Hip flexor tightness', 'Back pain - reduce range'],
      redFlags: ['Back arching', 'Radiating pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core musculature',
      targetStructure: 'Anti-extension control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range', 'Bent knee'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Hip hiking'] }
    },
    evidenceBase: { level: 'B', source: 'Sahrmann S. Movement System Impairment. Mosby, 2010', studyType: 'Clinical framework' }
  },

  {
    id: 'core_reverse_crunch',
    baseName: 'Reverse Crunch',
    baseNameSv: 'Omvänd Crunch',
    description: 'Lower abdominal focused exercise',
    descriptionSv: 'Övning fokuserad på nedre magmuskler',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back, legs up with knees bent',
      'Arms by sides or holding support',
      'Curl pelvis up toward chest',
      'Lift hips slightly off floor',
      'Lower with control',
      'Do not swing or use momentum'
    ],
    instructionsSv: [
      'Ligg på rygg, ben upp med böjda knän',
      'Armar vid sidorna eller håll stöd',
      'Curl bäckenet upp mot bröstet',
      'Lyft höfterna lätt från golvet',
      'Sänk med kontroll',
      'Svinga inte eller använd fart'
    ],
    techniquePoints: ['Small controlled movement', 'Feel lower abs working', 'No swinging', 'Exhale as you curl up'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Severe diastasis recti'],
      precautions: ['Back pain - reduce range', 'Neck strain - support if needed'],
      redFlags: ['Back pain', 'Neck pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Abdominal muscles',
      targetStructure: 'Rectus abdominis lower portion',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Reduced range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Abdominal surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Swinging legs', 'Hip flexor dominant'] }
    },
    evidenceBase: { level: 'B', source: 'Escamilla RF. Abdominal EMG. MSSE, 2006', studyType: 'EMG study' }
  },

  {
    id: 'core_hollow_body_hold',
    baseName: 'Hollow Body Hold',
    baseNameSv: 'Ihålig Kroppsposition',
    description: 'Gymnastics-based anti-extension hold',
    descriptionSv: 'Gymnastikbaserad anti-extension hållning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'hip_flexors'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 20,
    baseRestSeconds: 60,
    instructions: [
      'Lie on back',
      'Press lower back firmly into floor',
      'Raise legs and shoulders off floor',
      'Arms by ears or by sides',
      'Create banana shape',
      'Hold breathing normally'
    ],
    instructionsSv: [
      'Ligg på rygg',
      'Tryck ländryggen stadigt mot golvet',
      'Lyft ben och axlar från golvet',
      'Armar vid öronen eller vid sidorna',
      'Skapa bananform',
      'Håll och andas normalt'
    ],
    techniquePoints: ['Lower back MUST stay pressed down', 'Tuck chin slightly', 'Progress by lowering legs/raising arms', 'Quality over duration'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Diastasis recti', 'Neck issues'],
      precautions: ['Back pain - reduce range', 'Start with tucked position'],
      redFlags: ['Back arching', 'Neck strain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core musculature',
      targetStructure: 'Full anterior core',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Bent knee variation'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Breath holding'] }
    },
    evidenceBase: { level: 'B', source: 'Sommer C. Gymnastics strength training. 2008', studyType: 'Practical application' }
  },

  // ============================================
  // PLANK VARIATIONS
  // ============================================
  {
    id: 'core_plank_shoulder_tap',
    baseName: 'Plank with Shoulder Tap',
    baseNameSv: 'Planka med Axeltouch',
    description: 'Dynamic plank with anti-rotation challenge',
    descriptionSv: 'Dynamisk planka med anti-rotationsutmaning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'obliques', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Start in high plank position',
      'Feet wider than hip width for stability',
      'Lift one hand to tap opposite shoulder',
      'Do not let hips rotate',
      'Return hand and switch sides',
      'Keep hips level throughout'
    ],
    instructionsSv: [
      'Börja i hög plankaposition',
      'Fötterna bredare än höftbrett för stabilitet',
      'Lyft en hand för att toucha motsatt axel',
      'Låt inte höfterna rotera',
      'Återför handen och byt sida',
      'Håll höfterna i nivå genom hela rörelsen'
    ],
    techniquePoints: ['Minimal rotation', 'Slow controlled taps', 'Wider feet = easier', 'Progress by narrowing stance'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Wrist injury', 'Acute back pain'],
      precautions: ['Back pain - from knees', 'Shoulder issues - reduce reps'],
      redFlags: ['Shoulder pain', 'Back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Anti-rotation while maintaining extension control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['From knees'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Hip hiking'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core training principles. JSCR, 2010', studyType: 'Research review' }
  },

  {
    id: 'core_plank_leg_lift',
    baseName: 'Plank with Leg Lift',
    baseNameSv: 'Planka med Benlyft',
    description: 'Plank with hip extension challenge',
    descriptionSv: 'Planka med höftextensionsutmaning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'gluteus_maximus', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 60,
    instructions: [
      'Start in forearm plank',
      'Squeeze glute and lift one leg',
      'Keep leg straight',
      'Do not rotate or arch back',
      'Hold then lower',
      'Alternate sides'
    ],
    instructionsSv: [
      'Börja i underarmsplanka',
      'Spänn gluten och lyft ett ben',
      'Håll benet rakt',
      'Rotera inte eller böj ryggen',
      'Håll sedan sänk',
      'Växla sidor'
    ],
    techniquePoints: ['Small lift - quality over height', 'Glutes do the work', 'No back hyperextension', 'Hips stay level'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain'],
      precautions: ['Back pain - from knees', 'Hip issues - reduce range'],
      redFlags: ['Back arching', 'Hip drop'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Anti-extension with hip dissociation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['From knees'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back extension', 'Hip rotation'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core exercises biomechanics. Spine, 2009', studyType: 'Biomechanical study' }
  },

  {
    id: 'core_bear_crawl_hold',
    baseName: 'Bear Crawl Hold',
    baseNameSv: 'Björnkrypning Hållning',
    description: 'Quadruped position with knees hovering',
    descriptionSv: 'Fyrfotaposition med knän svävande',
    bodyRegion: 'core',
    muscleGroups: ['transverse_abdominis', 'rectus_abdominis', 'quadriceps'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 20,
    baseRestSeconds: 60,
    instructions: [
      'Start on hands and knees',
      'Hands under shoulders, knees under hips',
      'Lift knees 1-2 inches off floor',
      'Keep back flat and still',
      'Breathe normally',
      'Hold position'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Händer under axlar, knän under höfter',
      'Lyft knäna 2-5 cm från golvet',
      'Håll ryggen platt och stilla',
      'Andas normalt',
      'Håll positionen'
    ],
    techniquePoints: ['Minimal knee lift', 'Flat back - no arching', 'Good for beginners', 'Foundation for bear crawl movement'],
    safetyData: {
      contraindications: ['Wrist injury', 'Acute knee pain'],
      precautions: ['Back pain - shorter holds', 'Wrist issues - on fists'],
      redFlags: ['Back pain', 'Shoulder pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Full core bracing',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Short holds'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Hips shifting'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core stability principles. 2010', studyType: 'Research review' }
  },

  // ============================================
  // CARRIES AND LOADED CORE
  // ============================================
  {
    id: 'core_farmers_carry',
    baseName: 'Farmers Carry',
    baseNameSv: 'Bondelyft Bärning',
    description: 'Loaded walking for core and grip',
    descriptionSv: 'Belastad gång för core och grepp',
    bodyRegion: 'core',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'grip', 'trapezius'],
    jointType: 'spine',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'dumbbells',
    allowedEquipment: ['dumbbells', 'kettlebells', 'weight'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 2, max: 4 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Pick up weights with good deadlift form',
      'Stand tall with shoulders back',
      'Walk with controlled steps',
      'Keep core braced throughout',
      'Do not let weight pull you over',
      'Walk set distance or time'
    ],
    instructionsSv: [
      'Plocka upp vikter med god marklyftform',
      'Stå rakt med axlarna bakåt',
      'Gå med kontrollerade steg',
      'Håll core spänd genom hela rörelsen',
      'Låt inte vikten dra dig över',
      'Gå bestämd sträcka eller tid'
    ],
    techniquePoints: ['Tall posture', 'Controlled breathing', 'Short powerful steps', 'Core braced the entire time'],
    safetyData: {
      contraindications: ['Acute back injury', 'Shoulder instability', 'Grip weakness'],
      precautions: ['Back pain - lighter weight', 'Start with shorter distances'],
      redFlags: ['Sharp back pain', 'Asymmetric symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core, grip',
      targetStructure: 'Global core stability under load',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 4, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk lean', 'Uneven gait'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Loaded carries. Strength Cond J, 2013', studyType: 'Research review' }
  },

  {
    id: 'core_suitcase_carry',
    baseName: 'Suitcase Carry',
    baseNameSv: 'Resväskebärning',
    description: 'Unilateral carry for lateral core',
    descriptionSv: 'Unilateral bärning för lateral core',
    bodyRegion: 'core',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'grip'],
    jointType: 'spine',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'dumbbell',
    allowedEquipment: ['dumbbell', 'kettlebell', 'weight'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 2, max: 4 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Hold weight in one hand',
      'Stand tall - do not lean toward or away',
      'Walk with controlled steps',
      'Keep shoulders and hips level',
      'Switch hands for other side',
      'Walk set distance'
    ],
    instructionsSv: [
      'Håll vikt i en hand',
      'Stå rakt - luta dig inte mot eller från',
      'Gå med kontrollerade steg',
      'Håll axlar och höfter i nivå',
      'Byt hand för andra sidan',
      'Gå bestämd sträcka'
    ],
    techniquePoints: ['Resist lateral flexion', 'Stay completely upright', 'Challenges quadratus lumborum', 'Great assessment tool'],
    safetyData: {
      contraindications: ['Acute lateral trunk pain', 'Shoulder instability'],
      precautions: ['Back pain - lighter weight', 'Monitor asymmetry'],
      redFlags: ['Sharp lateral pain', 'Unable to stay upright'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core',
      targetStructure: 'Quadratus lumborum, obliques',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 4, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Lateral lean', 'Hip drop'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Loaded carries. Strength Cond J, 2013', studyType: 'Research review' }
  },

  {
    id: 'core_overhead_carry',
    baseName: 'Overhead Carry',
    baseNameSv: 'Overhead Bärning',
    description: 'Overhead walking for shoulder and core stability',
    descriptionSv: 'Overhead gång för axel- och core-stabilitet',
    bodyRegion: 'core',
    muscleGroups: ['deltoids', 'serratus_anterior', 'core'],
    jointType: 'spine',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'dumbbell',
    allowedEquipment: ['dumbbell', 'kettlebell', 'weight_plate'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 2, max: 4 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Press weight overhead',
      'Lock elbow and keep arm vertical',
      'Keep ribcage down - do not arch back',
      'Walk with controlled steps',
      'Maintain position throughout',
      'Walk set distance'
    ],
    instructionsSv: [
      'Tryck vikten overhead',
      'Lås armbågen och håll armen vertikal',
      'Håll bröstkorgen nere - böj inte ryggen',
      'Gå med kontrollerade steg',
      'Behåll positionen genom hela rörelsen',
      'Gå bestämd sträcka'
    ],
    techniquePoints: ['Ribcage stays down', 'Arm stays vertical', 'Core braced throughout', 'Progress with bottoms-up kettlebell'],
    safetyData: {
      contraindications: ['Shoulder instability', 'Acute shoulder pain', 'Overhead restriction'],
      precautions: ['Back pain - light weight', 'Shoulder issues - assess first'],
      redFlags: ['Shoulder pain', 'Back arching'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Shoulder stabilizers, core',
      targetStructure: 'Anti-extension with overhead load',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Light weight'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 4, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Arm drifting'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Loaded carries. Strength Cond J, 2013', studyType: 'Research review' }
  },

  // ============================================
  // STABILITY BALL EXERCISES
  // ============================================
  {
    id: 'core_stability_ball_rollout',
    baseName: 'Stability Ball Rollout',
    baseNameSv: 'Stabilitetsbolls Utrullning',
    description: 'Anti-extension with stability ball',
    descriptionSv: 'Anti-extension med stabilitetsboll',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'lats'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'kneeling',
    allowedPositions: ['kneeling'],
    baseEquipment: 'stability_ball',
    allowedEquipment: ['stability_ball'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 60,
    instructions: [
      'Kneel with forearms on stability ball',
      'Keep core braced',
      'Roll ball forward by extending arms',
      'Only go as far as back stays flat',
      'Pull back to start position',
      'Control movement throughout'
    ],
    instructionsSv: [
      'Knästå med underarmar på stabilitetsboll',
      'Håll core spänd',
      'Rulla bollen framåt genom att sträcka armarna',
      'Gå bara så långt som ryggen förblir platt',
      'Dra tillbaka till startposition',
      'Kontrollera rörelsen genom hela övningen'
    ],
    techniquePoints: ['Back must not arch', 'Brace core throughout', 'Slow controlled movement', 'Progress by increasing range'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain'],
      precautions: ['Back pain - reduce range', 'Shoulder issues - smaller range'],
      redFlags: ['Back arching', 'Shoulder pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Anti-extension control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Small range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Hips piking'] }
    },
    evidenceBase: { level: 'B', source: 'Vera-Garcia FJ. Ab rollout EMG. JSCR, 2000', studyType: 'EMG study' }
  },

  {
    id: 'core_stability_ball_stir_pot',
    baseName: 'Stability Ball Stir the Pot',
    baseNameSv: 'Stabilitetsbolls Röra i Grytan',
    description: 'Advanced plank with circular arm movement',
    descriptionSv: 'Avancerad planka med cirkulär armrörelse',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'obliques', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'stability_ball',
    allowedEquipment: ['stability_ball'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Forearm plank position on stability ball',
      'Make small circles with forearms',
      'As if stirring a pot',
      'Keep hips completely still',
      'Circle both directions',
      'Control the movement'
    ],
    instructionsSv: [
      'Underarmsplanka på stabilitetsboll',
      'Gör små cirklar med underarmarna',
      'Som att röra i en gryta',
      'Håll höfterna helt stilla',
      'Cirkla i båda riktningarna',
      'Kontrollera rörelsen'
    ],
    techniquePoints: ['Hips stay completely still', 'Small controlled circles', 'Anti-rotation challenge', 'Very challenging'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain', 'Poor core control'],
      precautions: ['Back pain - master plank first', 'Shoulder issues - smaller circles'],
      redFlags: ['Back pain', 'Hip rotation'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Full core system',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Back extension'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core training evidence. JSCR, 2010', studyType: 'Research review' }
  },

  // ============================================
  // SIDE-LYING AND LATERAL EXERCISES
  // ============================================
  {
    id: 'core_side_plank_hip_dip',
    baseName: 'Side Plank Hip Dip',
    baseNameSv: 'Sidoplanka Höftdipp',
    description: 'Dynamic lateral core exercise',
    descriptionSv: 'Dynamisk lateral core-övning',
    bodyRegion: 'core',
    muscleGroups: ['quadratus_lumborum', 'obliques'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Start in side plank position',
      'Lower hip toward floor',
      'Do not touch floor',
      'Lift hip back up above neutral',
      'Control both directions',
      'Repeat for reps'
    ],
    instructionsSv: [
      'Börja i sidoplankaposition',
      'Sänk höften mot golvet',
      'Rör inte golvet',
      'Lyft höften tillbaka upp över neutral',
      'Kontrollera båda riktningarna',
      'Upprepa för repetitioner'
    ],
    techniquePoints: ['Control the dip', 'Do not rotate', 'From knees for beginner', 'Feel lateral core working'],
    safetyData: {
      contraindications: ['Shoulder instability', 'Acute lateral trunk pain'],
      precautions: ['Back pain - from knees', 'Shoulder issues - reduce reps'],
      redFlags: ['Sharp lateral pain', 'Shoulder pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core',
      targetStructure: 'Quadratus lumborum, obliques dynamic',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['From knees'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk rotation', 'Shoulder shrug'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Lateral core training. Spine, 2009', studyType: 'Biomechanical study' }
  },

  {
    id: 'core_copenhagen_plank',
    baseName: 'Copenhagen Plank',
    baseNameSv: 'Köpenhamnsplanka',
    description: 'Side plank with top leg elevated - adductor and core',
    descriptionSv: 'Sidoplanka med övre benet upplyft - adduktor och core',
    bodyRegion: 'core',
    muscleGroups: ['adductors', 'obliques', 'quadratus_lumborum'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'bench',
    allowedEquipment: ['bench', 'chair', 'step'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 15,
    baseRestSeconds: 60,
    instructions: [
      'Side plank position with top foot on bench',
      'Bottom leg hangs or supports',
      'Lift hips creating straight line',
      'Press into bench with top leg',
      'Hold position',
      'Lower with control'
    ],
    instructionsSv: [
      'Sidoplankaposition med övre foten på bänk',
      'Undre benet hänger eller stödjer',
      'Lyft höfterna och skapa rak linje',
      'Tryck in i bänken med övre benet',
      'Håll positionen',
      'Sänk med kontroll'
    ],
    techniquePoints: ['Strong adductor demand', 'Evidence-based groin injury prevention', 'Progress to full version', 'Excellent for athletes'],
    safetyData: {
      contraindications: ['Groin strain', 'Shoulder instability', 'Acute back pain'],
      precautions: ['Start with bent knee version', 'Progress slowly'],
      redFlags: ['Groin pain', 'Back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Adductors, lateral core',
      targetStructure: 'Adductor magnus, obliques',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Bent knee version'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip drop', 'Trunk rotation'] }
    },
    evidenceBase: { level: 'A', source: 'Harøy J. Copenhagen adduction exercise. BJSM, 2019', studyType: 'RCT' }
  },

  // ============================================
  // ROTATIONAL EXERCISES
  // ============================================
  {
    id: 'core_russian_twist',
    baseName: 'Russian Twist',
    baseNameSv: 'Rysk Vridning',
    description: 'Seated rotation exercise',
    descriptionSv: 'Sittande rotationsövning',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'rectus_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'medicine_ball', 'dumbbell', 'weight_plate'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 15, max: 25 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Sit with knees bent, feet elevated or on floor',
      'Lean back slightly maintaining neutral spine',
      'Hold weight at chest or extend arms',
      'Rotate torso to one side',
      'Return to center and rotate other side',
      'Control movement throughout'
    ],
    instructionsSv: [
      'Sitt med böjda knän, fötter upplyftade eller på golvet',
      'Luta bakåt lätt och behåll neutral rygg',
      'Håll vikt vid bröstet eller sträck armarna',
      'Rotera bålen åt ena sidan',
      'Återgå till mitten och rotera åt andra sidan',
      'Kontrollera rörelsen genom hela övningen'
    ],
    techniquePoints: ['Rotation from thoracic spine', 'Do not round lower back', 'Feet on floor for beginner', 'Control the movement'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Rotational back injury'],
      precautions: ['Back pain - feet on floor', 'No weight initially'],
      redFlags: ['Back pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core rotators',
      targetStructure: 'Obliques',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Feet on floor', 'No weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 25, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Lower back rounding', 'Momentum'] }
    },
    evidenceBase: { level: 'B', source: 'Escamilla RF. Trunk rotation EMG. MSSE, 2006', studyType: 'EMG study' }
  },

  {
    id: 'core_medicine_ball_rotation_throw',
    baseName: 'Medicine Ball Rotational Throw',
    baseNameSv: 'Medicinbollsrotationskast',
    description: 'Power rotation against wall',
    descriptionSv: 'Kraftrotation mot vägg',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'hip_rotators'],
    jointType: 'spine',
    exerciseType: 'plyometric',
    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling'],
    baseEquipment: 'medicine_ball',
    allowedEquipment: ['medicine_ball'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand sideways to wall, arm length away',
      'Hold medicine ball at hip level',
      'Rotate through hips and core',
      'Release ball into wall',
      'Catch rebound',
      'Reset and repeat'
    ],
    instructionsSv: [
      'Stå i sidled mot väggen, armlängds avstånd',
      'Håll medicinboll vid höftnivå',
      'Rotera genom höfter och core',
      'Släpp bollen i väggen',
      'Fånga studsen',
      'Återställ och upprepa'
    ],
    techniquePoints: ['Power from hips', 'Through core to release', 'Athletic rotational pattern', 'Sport-specific training'],
    safetyData: {
      contraindications: ['Acute rotational injury', 'Disc herniation'],
      precautions: ['Back pain - reduce intensity', 'Start light'],
      redFlags: ['Sharp back pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core rotators',
      targetStructure: 'Power rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Light ball'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Arm dominant', 'Back extension'] }
    },
    evidenceBase: { level: 'B', source: 'Santana JC. Rotational power. JSCR, 2007', studyType: 'Research study' }
  },

  // ============================================
  // HIP HINGE WITH CORE FOCUS
  // ============================================
  {
    id: 'core_hip_hinge',
    baseName: 'Hip Hinge Pattern',
    baseNameSv: 'Höftgångjärnsmönster',
    description: 'Core bracing during hip hinge movement',
    descriptionSv: 'Core-spänning under höftgångjärnsrörelse',
    bodyRegion: 'core',
    muscleGroups: ['hamstrings', 'gluteus_maximus', 'core'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'dowel', 'resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: [
      'Stand with feet hip width apart',
      'Brace core and maintain neutral spine',
      'Push hips back as if closing a door',
      'Knees bend slightly',
      'Lower until stretch in hamstrings',
      'Drive hips forward to stand'
    ],
    instructionsSv: [
      'Stå med fötterna höftbrett isär',
      'Spänn core och behåll neutral rygg',
      'Skjut höfterna bakåt som att stänga en dörr',
      'Knäna böjs lätt',
      'Sänk tills stretch i baksida lår',
      'Driv höfterna framåt för att stå'
    ],
    techniquePoints: ['Use dowel on back to maintain spine position', 'Hips move back, not down', 'Foundation for deadlift', 'Essential movement pattern'],
    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Back pain - reduce range', 'Hamstring tightness'],
      redFlags: ['Radiating pain', 'Back rounding'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Posterior chain',
      targetStructure: 'Hip hinge pattern, core stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Knee dominant'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Hip hinge mechanics. Spine, 2009', studyType: 'Biomechanical study' }
  },

  {
    id: 'core_romanian_deadlift',
    baseName: 'Romanian Deadlift',
    baseNameSv: 'Rumänsk Marklyft',
    description: 'Hip hinge with posterior chain load',
    descriptionSv: 'Höftgångjärn med bakre kedjebelastning',
    bodyRegion: 'core',
    muscleGroups: ['hamstrings', 'gluteus_maximus', 'erector_spinae'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'barbell',
    allowedEquipment: ['barbell', 'dumbbells', 'kettlebell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Hold weight in front of thighs',
      'Brace core, slight knee bend',
      'Hinge at hips, push back',
      'Keep weight close to legs',
      'Lower until stretch in hamstrings',
      'Drive through hips to stand'
    ],
    instructionsSv: [
      'Håll vikt framför låren',
      'Spänn core, lätt knäböj',
      'Gångjärn vid höfterna, skjut bakåt',
      'Håll vikten nära benen',
      'Sänk tills stretch i baksida lår',
      'Driv genom höfterna för att stå'
    ],
    techniquePoints: ['Flat back throughout', 'Weight stays close to body', 'Feel hamstrings stretch', 'Hip dominant, not back'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Severe back pain'],
      precautions: ['Back pain - reduce load', 'Master hip hinge first'],
      redFlags: ['Back rounding', 'Radiating pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Posterior chain',
      targetStructure: 'Hamstrings, glutes, erectors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light weight'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Knee dominant'] }
    },
    evidenceBase: { level: 'B', source: 'Contreras B. Hip hinge exercises. JSCR, 2013', studyType: 'EMG study' }
  },

  // ============================================
  // ADDITIONAL MCGILL EXERCISES
  // ============================================
  {
    id: 'core_stirring_pot',
    baseName: 'McGill Stirring the Pot',
    baseNameSv: 'McGill Röra i Grytan',
    description: 'Advanced McGill core exercise',
    descriptionSv: 'Avancerad McGill core-övning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'obliques', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'stability_ball',
    allowedEquipment: ['stability_ball'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Forearm plank on stability ball',
      'Brace core strongly',
      'Make small circles with elbows',
      'Do not let hips move at all',
      'Circle both directions',
      'Maintain perfect plank position'
    ],
    instructionsSv: [
      'Underarmsplanka på stabilitetsboll',
      'Spänn core kraftigt',
      'Gör små cirklar med armbågarna',
      'Låt inte höfterna röra sig alls',
      'Cirkla i båda riktningarna',
      'Behåll perfekt plankaposition'
    ],
    techniquePoints: ['Highest level McGill exercise', 'Complete core stability', 'Small circles only', 'Zero hip movement'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain', 'Poor core control'],
      precautions: ['Master all basics first', 'Start with tiny circles'],
      redFlags: ['Back pain', 'Hip movement'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Full core system',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 95 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip movement', 'Back extension'] }
    },
    evidenceBase: { level: 'A', source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016', studyType: 'Biomechanical research' }
  },

  // ============================================
  // FUNCTIONAL CORE
  // ============================================
  {
    id: 'core_turkish_getup',
    baseName: 'Turkish Get-Up',
    baseNameSv: 'Turkisk Uppgång',
    description: 'Full body core coordination exercise',
    descriptionSv: 'Helkropps core-koordinationsövning',
    bodyRegion: 'core',
    muscleGroups: ['core', 'shoulders', 'hips'],
    jointType: 'spine',
    exerciseType: 'functional',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'kettlebell',
    allowedEquipment: ['kettlebell', 'dumbbell'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Lie on back, one arm holding weight',
      'Press to elbow, then hand',
      'Lift hips into bridge',
      'Sweep leg through',
      'Rise to standing',
      'Reverse back down'
    ],
    instructionsSv: [
      'Ligg på rygg, en arm håller vikt',
      'Tryck till armbåge, sedan hand',
      'Lyft höfterna till brygga',
      'Svep benet genom',
      'Res dig till stående',
      'Omvänt tillbaka ner'
    ],
    techniquePoints: ['Learn without weight first', 'Slow and controlled', 'Multiple transitions', 'Excellent mobility and stability'],
    safetyData: {
      contraindications: ['Shoulder instability', 'Acute back or hip pain', 'Poor coordination'],
      precautions: ['Learn progression steps first', 'No weight until mastered'],
      redFlags: ['Shoulder pain', 'Back pain', 'Loss of control'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Full body',
      targetStructure: 'Integrated core function',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['No weight', 'Partial only'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Loss of arm position', 'Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Gray Cook. Turkish get-up. JSCR, 2011', studyType: 'Functional training' }
  },

  {
    id: 'core_dead_bug_band',
    baseName: 'Dead Bug with Band',
    baseNameSv: 'Död Insekt med Band',
    description: 'Dead bug with added anti-rotation resistance',
    descriptionSv: 'Död insekt med tillagd anti-rotationsmotstånd',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'obliques', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back, band anchored to side',
      'Hold band in one hand at chest',
      'Arms and legs up like dead bug',
      'Lower opposite arm and leg while resisting rotation',
      'Band pulls toward anchor - resist',
      'Return and repeat'
    ],
    instructionsSv: [
      'Ligg på rygg, band förankrat vid sidan',
      'Håll bandet i en hand vid bröstet',
      'Armar och ben upp som död insekt',
      'Sänk motsatt arm och ben medan du motstår rotation',
      'Bandet drar mot ankaret - motstå',
      'Återgå och upprepa'
    ],
    techniquePoints: ['Anti-rotation challenge added', 'Do not let body rotate', 'Back stays flat', 'Multitask core demand'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Shoulder injury'],
      precautions: ['Back pain - reduce range', 'Light band initially'],
      redFlags: ['Back arching', 'Body rotation'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Combined anti-extension and anti-rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light band', 'Small range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Body rotation', 'Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Sahrmann S. Movement System. Mosby, 2010', studyType: 'Clinical framework' }
  },

  // ============================================
  // PELVIC FLOOR INTEGRATION
  // ============================================
  {
    id: 'core_pelvic_floor_integration',
    baseName: 'Pelvic Floor with Core',
    baseNameSv: 'Bäckenbotten med Core',
    description: 'Coordinated pelvic floor and core activation',
    descriptionSv: 'Koordinerad bäckenbotten- och core-aktivering',
    bodyRegion: 'core',
    muscleGroups: ['pelvic_floor', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 10,
    baseRestSeconds: 30,
    instructions: [
      'Lie in comfortable position',
      'Find neutral spine',
      'Gently lift pelvic floor (stop urine flow cue)',
      'Simultaneously engage lower core',
      'Maintain normal breathing',
      'Hold then relax completely'
    ],
    instructionsSv: [
      'Ligg i bekväm position',
      'Hitta neutral rygg',
      'Lyft försiktigt bäckenbotten (stoppa urinflöde-ledtråd)',
      'Aktivera samtidigt nedre core',
      'Behåll normal andning',
      'Håll sedan slappna av helt'
    ],
    techniquePoints: ['Subtle activation', 'Coordination is key', 'Important post-partum', 'Foundation for core function'],
    safetyData: {
      contraindications: ['Active pelvic floor dysfunction - see specialist'],
      precautions: ['Post-partum - gentle start', 'Prolapse - modified approach'],
      redFlags: ['Pain', 'Unable to relax muscles'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Pelvic floor',
      targetStructure: 'Pelvic floor, deep core coordination',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['C-section', 'Abdominal surgery', 'Pelvic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Breath holding', 'Glute squeeze'] }
    },
    evidenceBase: { level: 'A', source: 'Hodges PW. Pelvic floor and core. Exp Brain Res, 2007', studyType: 'Motor control research' }
  },

  {
    id: 'core_bridge_with_march',
    baseName: 'Bridge with Marching',
    baseNameSv: 'Brygga med Marsch',
    description: 'Glute bridge with alternating leg lift',
    descriptionSv: 'Glutebrygga med alternerande benlyft',
    bodyRegion: 'core',
    muscleGroups: ['gluteus_maximus', 'transverse_abdominis', 'hamstrings'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back with knees bent',
      'Lift hips into bridge position',
      'Lift one foot off floor slightly',
      'Return and lift other foot',
      'Hips stay level - no dropping',
      'Continue alternating'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Lyft höfterna till bryggposition',
      'Lyft en fot lätt från golvet',
      'Återgå och lyft andra foten',
      'Höfterna förblir i nivå - ingen sänkning',
      'Fortsätt växla'
    ],
    techniquePoints: ['Hips stay level throughout', 'Core braced', 'Small foot lift', 'Challenges hip stability'],
    safetyData: {
      contraindications: ['Acute back pain'],
      precautions: ['Back pain - reduce range', 'Start with static bridge'],
      redFlags: ['Hip drop', 'Back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core, glutes',
      targetStructure: 'Single leg stability in bridge',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Static bridge only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Hip surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip drop', 'Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Sahrmann S. Movement System. Mosby, 2010', studyType: 'Clinical framework' }
  },

  {
    id: 'core_half_kneeling_pallof',
    baseName: 'Half Kneeling Pallof Press',
    baseNameSv: 'Halvknäläge Pallof Press',
    description: 'Pallof press in half kneeling for hip integration',
    descriptionSv: 'Pallof press i halvknäläge för höftintegration',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'hip_flexors', 'glutes'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'half_kneeling',
    allowedPositions: ['half_kneeling'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band', 'cable_machine'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,
    instructions: [
      'Half kneel sideways to anchor',
      'Hold band at chest',
      'Press arms straight out',
      'Resist rotation, stay tall',
      'Return to chest',
      'Inside leg forward for challenge'
    ],
    instructionsSv: [
      'Halvknäläge i sidled mot ankaret',
      'Håll bandet vid bröstet',
      'Tryck armarna rakt ut',
      'Motstå rotation, håll dig rak',
      'Återgå till bröstet',
      'Inre benet framåt för utmaning'
    ],
    techniquePoints: ['Inside leg forward = harder', 'Outside leg forward = easier', 'Hip integration', 'Excellent variation'],
    safetyData: {
      contraindications: ['Acute rotational injury', 'Knee pain with kneeling'],
      precautions: ['Back pain - reduce resistance', 'Pad knee if needed'],
      redFlags: ['Back pain', 'Knee pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core, hip complex',
      targetStructure: 'Anti-rotation with hip integration',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Hip surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk rotation', 'Hip shift'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core training. JSCR, 2010', studyType: 'Research review' }
  },

  // ============================================
  // SIDE PLANK VARIATIONS
  // ============================================
  {
    id: 'core_side_plank_modified',
    baseName: 'Modified Side Plank',
    baseNameSv: 'Modifierad Sidoplanka',
    description: 'Beginner side plank from knees',
    descriptionSv: 'Nybörjar sidoplanka från knäna',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'quadratus_lumborum'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 15,
    baseRestSeconds: 30,
    instructions: [
      'Lie on side with knees bent 90 degrees',
      'Prop on elbow under shoulder',
      'Lift hips off floor',
      'Body straight from shoulder to knees',
      'Hold position',
      'Lower and rest between holds'
    ],
    instructionsSv: [
      'Ligg på sidan med knäna böjda 90 grader',
      'Stötta på armbågen under axeln',
      'Lyft höfterna från golvet',
      'Kroppen rak från axel till knän',
      'Håll positionen',
      'Sänk och vila mellan hållningarna'
    ],
    techniquePoints: ['Great starting point', 'Progress to full side plank', 'Keep hips stacked', 'No rotation'],
    safetyData: {
      contraindications: ['Shoulder injury'],
      precautions: ['Elbow discomfort - pad', 'Neck issues - support head'],
      redFlags: ['Shoulder pain', 'Back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lateral core',
      targetStructure: 'Obliques, quadratus lumborum',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Short holds'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Sagging'] }
    },
    evidenceBase: { level: 'A', source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016', studyType: 'Biomechanical research' }
  },

  {
    id: 'core_side_plank_hip_dip',
    baseName: 'Side Plank with Hip Dip',
    baseNameSv: 'Sidoplanka med Höftsänkning',
    description: 'Dynamic side plank variation',
    descriptionSv: 'Dynamisk sidoplankvariation',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'quadratus_lumborum', 'gluteus_medius'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Start in full side plank position',
      'Lower hip toward floor',
      'Do not touch floor',
      'Raise back to start position',
      'Control the movement',
      'Repeat all reps then switch sides'
    ],
    instructionsSv: [
      'Börja i full sidoplankposition',
      'Sänk höften mot golvet',
      'Nudda inte golvet',
      'Höj tillbaka till startposition',
      'Kontrollera rörelsen',
      'Upprepa alla repetitioner sedan byt sida'
    ],
    techniquePoints: ['Dynamic oblique challenge', 'Control the dip', 'Do not rotate', 'Great progression'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Unable to hold static side plank'],
      precautions: ['Back pain - return to static', 'Build endurance first'],
      redFlags: ['Shoulder pain', 'Lower back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core',
      targetStructure: 'Dynamic oblique strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Small range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Shoulder shrug'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core training. JSCR, 2010', studyType: 'Research review' }
  },

  {
    id: 'core_side_plank_rotation',
    baseName: 'Side Plank with Rotation',
    baseNameSv: 'Sidoplanka med Rotation',
    description: 'Side plank with thoracic rotation',
    descriptionSv: 'Sidoplanka med bröstryggrotation',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'rotational_core'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Start in side plank, top arm to ceiling',
      'Rotate and reach top arm under body',
      'Thread through as far as comfortable',
      'Rotate back and reach arm up',
      'Hips stay stacked and stable',
      'Control the rotation'
    ],
    instructionsSv: [
      'Börja i sidoplanka, överarm mot taket',
      'Rotera och sträck överarmen under kroppen',
      'Trä igenom så långt som bekvämt',
      'Rotera tillbaka och sträck armen upp',
      'Höfterna förblir staplade och stabila',
      'Kontrollera rotationen'
    ],
    techniquePoints: ['Thoracic rotation focus', 'Hips stay stable', 'Good for t-spine mobility', 'Advanced exercise'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Rotational back injury'],
      precautions: ['Back pain - avoid', 'Master static side plank first'],
      redFlags: ['Shoulder pain', 'Lower back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core with rotation',
      targetStructure: 'Rotational control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Loss of balance'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // ROTATIONAL CORE
  // ============================================
  {
    id: 'core_woodchop_high_to_low',
    baseName: 'Cable Woodchop High to Low',
    baseNameSv: 'Kabel Vedhugg Hög till Låg',
    description: 'Diagonal rotational pattern',
    descriptionSv: 'Diagonalt rotationsmönster',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling'],
    baseEquipment: 'cable_machine',
    allowedEquipment: ['cable_machine', 'resistance_band', 'medicine_ball'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Stand perpendicular to high cable',
      'Arms straight, hold handle at shoulder',
      'Rotate and pull diagonally across body',
      'Pivot feet as needed',
      'Control return to start',
      'Keep arms relatively straight'
    ],
    instructionsSv: [
      'Stå vinkelrätt mot hög kabel',
      'Armarna raka, håll handtaget vid axeln',
      'Rotera och dra diagonalt över kroppen',
      'Pivotera fötterna vid behov',
      'Kontrollera återgång till start',
      'Håll armarna relativt raka'
    ],
    techniquePoints: ['Rotation from core, not arms', 'Control throughout', 'Functional movement', 'Sport-specific'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Rotational injury'],
      precautions: ['Back pain - reduce range/resistance', 'Slow and controlled'],
      redFlags: ['Back pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Rotational core',
      targetStructure: 'Obliques, rotational chain',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Arm dominant', 'Back extension'] }
    },
    evidenceBase: { level: 'B', source: 'Santana JC. Rotational training. JSCR, 2007', studyType: 'Training method' }
  },

  {
    id: 'core_woodchop_low_to_high',
    baseName: 'Cable Woodchop Low to High',
    baseNameSv: 'Kabel Vedhugg Låg till Hög',
    description: 'Reverse diagonal rotational pattern',
    descriptionSv: 'Omvänt diagonalt rotationsmönster',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling'],
    baseEquipment: 'cable_machine',
    allowedEquipment: ['cable_machine', 'resistance_band', 'medicine_ball'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Stand perpendicular to low cable',
      'Arms straight, hold handle near floor',
      'Rotate and pull diagonally up across body',
      'Pivot feet and hips',
      'Control return to start',
      'Core drives the movement'
    ],
    instructionsSv: [
      'Stå vinkelrätt mot låg kabel',
      'Armarna raka, håll handtaget nära golvet',
      'Rotera och dra diagonalt upp över kroppen',
      'Pivotera fötterna och höfterna',
      'Kontrollera återgång till start',
      'Core driver rörelsen'
    ],
    techniquePoints: ['Lift-and-rotate pattern', 'Sports and lifting application', 'Core not arms', 'Full body integration'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Rotational injury'],
      precautions: ['Back pain - reduce range', 'Control is key'],
      redFlags: ['Back pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Rotational core',
      targetStructure: 'Obliques, posterior chain',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Arm dominant', 'Poor hip rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Santana JC. Rotational training. JSCR, 2007', studyType: 'Training method' }
  },

  {
    id: 'core_russian_twist',
    baseName: 'Russian Twist',
    baseNameSv: 'Rysk Twist',
    description: 'Seated rotational core exercise',
    descriptionSv: 'Sittande rotations-coreövning',
    bodyRegion: 'core',
    muscleGroups: ['obliques', 'rectus_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'medicine_ball', 'dumbbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 20, max: 30 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Sit with knees bent, feet on floor or elevated',
      'Lean back to 45 degrees',
      'Hands together or hold weight',
      'Rotate torso side to side',
      'Touch floor beside hip each side',
      'Keep core braced throughout'
    ],
    instructionsSv: [
      'Sitt med knäna böjda, fötterna på golvet eller upplyft',
      'Luta bakåt till 45 grader',
      'Händer tillsammans eller håll vikt',
      'Rotera överkroppen sida till sida',
      'Nudda golvet bredvid höften varje sida',
      'Håll core spänt hela tiden'
    ],
    techniquePoints: ['Feet down = easier', 'Feet up = harder', 'Control rotation', 'Common but use carefully'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Severe back pain'],
      precautions: ['Back issues - keep feet down', 'No weight initially'],
      redFlags: ['Back pain', 'Hip flexor cramping'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Rotational core',
      targetStructure: 'Obliques',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true, modifications: ['Feet down'] }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 30, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Arm dominant'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // ANTI-LATERAL FLEXION
  // ============================================
  {
    id: 'core_suitcase_carry',
    baseName: 'Suitcase Carry',
    baseNameSv: 'Resväskebärning',
    description: 'Unilateral carry for lateral core stability',
    descriptionSv: 'Unilateral bärning för lateral core-stabilitet',
    bodyRegion: 'core',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'grip'],
    jointType: 'spine',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'kettlebell',
    allowedEquipment: ['kettlebell', 'dumbbell', 'farmer_handle'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 30,
    baseRestSeconds: 60,
    instructions: [
      'Hold weight in one hand at side',
      'Stand tall, do not lean',
      'Walk with controlled steps',
      'Resist side bending',
      'Keep shoulders level',
      'Switch sides'
    ],
    instructionsSv: [
      'Håll vikt i en hand vid sidan',
      'Stå rak, luta inte',
      'Gå med kontrollerade steg',
      'Motstå sidböjning',
      'Håll axlarna i nivå',
      'Byt sida'
    ],
    techniquePoints: ['Stay upright against load', 'Anti-lateral flexion challenge', 'Functional exercise', 'Good for asymmetry'],
    safetyData: {
      contraindications: ['Acute back pain', 'Shoulder injury on loaded side'],
      precautions: ['Start light', 'Watch for leaning'],
      redFlags: ['Back pain', 'Excessive lean'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core',
      targetStructure: 'Quadratus lumborum, obliques',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light load'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Side lean', 'Shoulder hike'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Carries. JSCR, 2013', studyType: 'Biomechanical research' }
  },

  {
    id: 'core_farmers_carry',
    baseName: 'Farmer\'s Carry',
    baseNameSv: 'Bondens Bärning',
    description: 'Bilateral loaded carry',
    descriptionSv: 'Bilateral belastad bärning',
    bodyRegion: 'core',
    muscleGroups: ['core', 'grip', 'traps'],
    jointType: 'spine',
    exerciseType: 'functional',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'kettlebell',
    allowedEquipment: ['kettlebell', 'dumbbell', 'farmer_handle'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 30,
    baseRestSeconds: 60,
    instructions: [
      'Hold weight in each hand at sides',
      'Stand tall, chest up',
      'Walk with controlled steps',
      'Core braced, shoulders back',
      'Maintain upright posture',
      'Breathe normally'
    ],
    instructionsSv: [
      'Håll vikt i varje hand vid sidorna',
      'Stå rak, bröst uppåt',
      'Gå med kontrollerade steg',
      'Core spänt, axlar bakåt',
      'Behåll upprätt hållning',
      'Andas normalt'
    ],
    techniquePoints: ['Total body exercise', 'Core stability under load', 'Grip endurance', 'Functional strength'],
    safetyData: {
      contraindications: ['Acute back pain', 'Shoulder injury'],
      precautions: ['Start light', 'Progress gradually'],
      redFlags: ['Back pain', 'Shoulder pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Full core under load',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light load'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Forward lean', 'Arm swing loss'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Carries. JSCR, 2013', studyType: 'Biomechanical research' }
  },

  // ============================================
  // POST-PARTUM & DIASTASIS SPECIFIC
  // ============================================
  {
    id: 'core_diastasis_heal_slide',
    baseName: 'Diastasis Heel Slide',
    baseNameSv: 'Diastasis Hälglidning',
    description: 'Safe core exercise for diastasis recti',
    descriptionSv: 'Säker coreövning för diastasis recti',
    bodyRegion: 'core',
    muscleGroups: ['transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back with knees bent',
      'Engage deep core gently',
      'Exhale and slide one heel away',
      'Keep lower back in neutral',
      'Inhale and return heel',
      'Alternate legs'
    ],
    instructionsSv: [
      'Ligg på rygg med knäna böjda',
      'Aktivera djupa core försiktigt',
      'Andas ut och glid en häl bort',
      'Håll ländryggen i neutral',
      'Andas in och återför hälen',
      'Växla ben'
    ],
    techniquePoints: ['Safe for diastasis', 'No doming allowed', 'Exhale on effort', 'Progress slowly'],
    safetyData: {
      contraindications: ['None - very gentle'],
      precautions: ['Watch for doming - reduce range', 'Progress very gradually'],
      redFlags: ['Visible bulging at midline', 'Pain'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Linea alba, core',
      targetStructure: 'Transverse abdominis reconnection',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['C-section', 'Abdominal surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 0, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Doming', 'Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Benjamin DR. Diastasis exercise. Phys Ther Sport, 2019', studyType: 'Clinical study' }
  },

  {
    id: 'core_postpartum_bridge',
    baseName: 'Post-Partum Bridge',
    baseNameSv: 'Postpartum Brygga',
    description: 'Safe bridge for post-partum rehabilitation',
    descriptionSv: 'Säker brygga för postpartum-rehabilitering',
    bodyRegion: 'core',
    muscleGroups: ['gluteus_maximus', 'pelvic_floor', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back with knees bent',
      'Exhale and engage pelvic floor',
      'Continue exhale, lift hips',
      'Squeeze glutes at top',
      'Inhale, lower slowly',
      'Coordinate breath and movement'
    ],
    instructionsSv: [
      'Ligg på rygg med knäna böjda',
      'Andas ut och aktivera bäckenbotten',
      'Fortsätt andas ut, lyft höfterna',
      'Kläm ihop gluteerna i toppen',
      'Andas in, sänk långsamt',
      'Koordinera andning och rörelse'
    ],
    techniquePoints: ['Breath coordination crucial', 'Pelvic floor integration', 'Glute activation', 'Safe early exercise'],
    safetyData: {
      contraindications: ['Significant prolapse - see specialist'],
      precautions: ['Very gentle start', 'No breath holding'],
      redFlags: ['Pain', 'Urinary leakage'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Pelvic floor, core',
      targetStructure: 'Integrated core and pelvic floor',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['C-section'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Breath holding', 'Back arching'] }
    },
    evidenceBase: { level: 'A', source: 'Post-partum exercise guidelines. ACOG, 2020', studyType: 'Clinical guidelines' }
  },

  // ============================================
  // PLANK VARIATIONS
  // ============================================
  {
    id: 'core_plank_shoulder_tap',
    baseName: 'Plank with Shoulder Tap',
    baseNameSv: 'Planka med Axelknackning',
    description: 'Plank with anti-rotation challenge',
    descriptionSv: 'Planka med anti-rotationsutmaning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'obliques', 'shoulders'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Start in full plank position on hands',
      'Lift one hand, tap opposite shoulder',
      'Return hand to floor',
      'Repeat with other hand',
      'Hips stay level - no rotation',
      'Keep feet wider for more stability'
    ],
    instructionsSv: [
      'Börja i full plankposition på händerna',
      'Lyft en hand, nudda motsatt axel',
      'Återför handen till golvet',
      'Upprepa med andra handen',
      'Höfterna förblir i nivå - ingen rotation',
      'Håll fötterna vidare för mer stabilitet'
    ],
    techniquePoints: ['Anti-rotation challenge', 'Wider feet = easier', 'Hips stay still', 'Great progression'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain'],
      precautions: ['Back pain - wider stance', 'Master static plank first'],
      redFlags: ['Shoulder pain', 'Back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Anti-rotation with plank',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Wide stance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation', 'Hip drop'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'core_plank_arm_reach',
    baseName: 'Plank with Arm Reach',
    baseNameSv: 'Planka med Armräckning',
    description: 'Plank with forward arm extension',
    descriptionSv: 'Planka med framåt armförlängning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'shoulders', 'hip_extensors'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: [
      'Start in full plank on hands',
      'Lift one arm straight forward',
      'Thumb up, reach as far as comfortable',
      'Hold briefly',
      'Return to plank',
      'Alternate arms'
    ],
    instructionsSv: [
      'Börja i full planka på händerna',
      'Lyft en arm rakt framåt',
      'Tummen upp, sträck så långt som bekvämt',
      'Håll kort',
      'Återgå till planka',
      'Växla armar'
    ],
    techniquePoints: ['Challenges stability', 'No hip drop', 'Reach forward not up', 'Builds toward bird dog'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain'],
      precautions: ['Back issues - reduce range', 'Master basic plank first'],
      redFlags: ['Shoulder pain', 'Back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Anti-extension with load shift',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Small reach'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip drop', 'Rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'core_body_saw',
    baseName: 'Body Saw',
    baseNameSv: 'Kroppssåg',
    description: 'Dynamic forearm plank variation',
    descriptionSv: 'Dynamisk underarmsplankvariation',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'shoulders', 'lats'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat', 'sliders'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Start in forearm plank',
      'Shift body forward and backward',
      'Shoulders move past then behind elbows',
      'Keep hips level throughout',
      'Core braced the entire time',
      'Smooth controlled motion'
    ],
    instructionsSv: [
      'Börja i underarmsplanka',
      'Skifta kroppen framåt och bakåt',
      'Axlarna rör sig förbi och sedan bakom armbågarna',
      'Håll höfterna i nivå hela tiden',
      'Core spänt hela tiden',
      'Mjuk kontrollerad rörelse'
    ],
    techniquePoints: ['Very challenging', 'Longer lever = harder', 'Use sliders for ease', 'Great core challenge'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute back pain', 'Poor plank form'],
      precautions: ['Master static plank first', 'Start with small range'],
      redFlags: ['Shoulder pain', 'Back pain', 'Hip sagging'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Core',
      targetStructure: 'Dynamic anti-extension',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip sag', 'Shoulder shrug'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Low Back Disorders', studyType: 'Biomechanical research' }
  },

  // ============================================
  // ADDITIONAL CORE EXERCISES
  // ============================================
  {
    id: 'core_hollow_body_hold',
    baseName: 'Hollow Body Hold',
    baseNameSv: 'Ihålig Kroppshållning',
    description: 'Gymnastics-based anti-extension hold',
    descriptionSv: 'Gymnastikbaserad anti-extensions hållning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'hip_flexors'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 20,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back',
      'Press lower back into floor',
      'Lift shoulders and legs off floor',
      'Arms overhead, legs straight',
      'Create banana shape',
      'Hold without back arching'
    ],
    instructionsSv: [
      'Ligg på rygg',
      'Tryck ländryggen mot golvet',
      'Lyft axlar och ben från golvet',
      'Armar över huvudet, ben raka',
      'Skapa bananform',
      'Håll utan att ryggen svankar'
    ],
    techniquePoints: ['Back must stay flat', 'Easier with knees bent', 'Progress arm/leg position', 'Gymnastics fundamental'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Diastasis recti'],
      precautions: ['Back issues - knees bent', 'Progress slowly'],
      redFlags: ['Back arching', 'Lower back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Anti-extension strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Knees bent'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Breath holding'] }
    },
    evidenceBase: { level: 'B', source: 'Gymnastics strength training', studyType: 'Training method' }
  },

  {
    id: 'core_v_up',
    baseName: 'V-Up',
    baseNameSv: 'V-Uppresning',
    description: 'Dynamic core flexion exercise',
    descriptionSv: 'Dynamisk core-flexionsövning',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'hip_flexors'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'advanced',
    allowedDifficulties: ['intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Lie flat on back, arms overhead',
      'Simultaneously lift legs and torso',
      'Reach hands toward toes',
      'Create V shape at top',
      'Lower with control',
      'Do not use momentum'
    ],
    instructionsSv: [
      'Ligg platt på rygg, armar över huvudet',
      'Lyft samtidigt ben och överkropp',
      'Sträck händerna mot tårna',
      'Skapa V-form i toppen',
      'Sänk med kontroll',
      'Använd inte momentum'
    ],
    techniquePoints: ['Advanced exercise', 'Control is key', 'Modify with bent knees', 'Watch for hip flexor dominance'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Diastasis recti', 'Poor core control'],
      precautions: ['Back issues - avoid', 'Modify with bent knees'],
      redFlags: ['Back pain', 'Hip flexor strain'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Core',
      targetStructure: 'Rectus abdominis, hip flexors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: false },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Momentum use', 'Back arching'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'core_reverse_crunch',
    baseName: 'Reverse Crunch',
    baseNameSv: 'Omvänd Crunch',
    description: 'Lower abdominal focused crunch',
    descriptionSv: 'Nedre magfokuserad crunch',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 12, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back, legs up, knees bent 90 degrees',
      'Arms at sides or holding overhead support',
      'Curl hips off floor toward chest',
      'Lower hips with control',
      'Do not use momentum',
      'Feel lower abs working'
    ],
    instructionsSv: [
      'Ligg på rygg, ben upp, knän böjda 90 grader',
      'Armar vid sidorna eller hållande stöd ovanför huvudet',
      'Krulla höfterna från golvet mot bröstet',
      'Sänk höfterna med kontroll',
      'Använd inte momentum',
      'Känn nedre magen arbeta'
    ],
    techniquePoints: ['Target lower abs', 'Control the movement', 'Small range of motion', 'Do not swing legs'],
    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Back pain - reduce range', 'Control is essential'],
      redFlags: ['Back pain', 'Excessive hip flexor strain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Lower rectus abdominis',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Leg swing', 'Momentum'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'core_bicycle_crunch',
    baseName: 'Bicycle Crunch',
    baseNameSv: 'Cykel Crunch',
    description: 'Rotational crunch with leg movement',
    descriptionSv: 'Rotationscrunch med benrörelse',
    bodyRegion: 'core',
    muscleGroups: ['rectus_abdominis', 'obliques'],
    jointType: 'spine',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 20, max: 30 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back, hands behind head',
      'Lift shoulders off floor',
      'Bring one knee toward chest',
      'Rotate torso, elbow toward opposite knee',
      'Extend other leg',
      'Alternate sides with pedaling motion'
    ],
    instructionsSv: [
      'Ligg på rygg, händer bakom huvudet',
      'Lyft axlarna från golvet',
      'Dra ett knä mot bröstet',
      'Rotera överkroppen, armbåge mot motsatt knä',
      'Sträck ut andra benet',
      'Växla sidor med tramprörelse'
    ],
    techniquePoints: ['Slow and controlled', 'Rotation from core', 'Do not pull on neck', 'Higher leg = easier'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Neck pain'],
      precautions: ['Neck issues - hands at temples', 'Back pain - higher legs'],
      redFlags: ['Neck pain', 'Back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core',
      targetStructure: 'Obliques, rectus abdominis',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Slow'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 30, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Neck pulling', 'Rushing'] }
    },
    evidenceBase: { level: 'B', source: 'ACE EMG study. American Council on Exercise, 2001', studyType: 'EMG study' }
  }
];

export default coreTemplates;
