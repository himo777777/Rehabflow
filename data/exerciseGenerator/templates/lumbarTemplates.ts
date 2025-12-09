/**
 * Lumbar Spine Exercise Templates
 *
 * Evidence-based exercises for lumbar spine rehabilitation
 * Based on McGill's Big 3, McKenzie method, and motor control research
 */

import { BaseExerciseTemplate } from '../types';

export const lumbarTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // McGILL'S BIG 3 - CORE STABILITY
  // ============================================
  {
    id: 'lumbar_mcgill_curlup',
    baseName: 'McGill Curl-Up',
    baseNameSv: 'McGill Curl-Up',
    description: 'Spine-sparing abdominal exercise that maintains neutral lumbar spine',
    descriptionSv: 'Magövning som sparar ryggen genom att behålla neutral lumbalposition',
    bodyRegion: 'lumbar',
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
    baseRestSeconds: 60,

    instructions: [
      'Lie on back with one knee bent, foot flat on floor',
      'Place hands under lower back to maintain natural curve',
      'Brace abdominals without flattening back',
      'Lift head and shoulders slightly off floor',
      'Hold position without moving lumbar spine',
      'Lower slowly with control'
    ],
    instructionsSv: [
      'Ligg på rygg med ett knä böjt, foten platt på golvet',
      'Placera händerna under ländryggen för att behålla naturlig kurva',
      'Spänn magmusklerna utan att platta till ryggen',
      'Lyft huvudet och axlarna lätt från golvet',
      'Håll positionen utan att flytta ländryggen',
      'Sänk långsamt med kontroll'
    ],

    techniquePoints: [
      'Maintain neutral spine throughout',
      'Do not flatten lower back',
      'Lift only a few inches',
      'Breathe normally during hold'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Spinal fracture', 'Severe osteoporosis'],
      precautions: ['Neck pain - support head', 'Post-surgical - check clearance'],
      redFlags: ['Radiating leg pain', 'Numbness/tingling', 'Loss of bladder control'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Abdominal musculature',
      targetStructure: 'Rectus abdominis, transverse abdominis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Reduce range', 'Lower hold time'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy', 'Spinal fusion'],

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
        compensationPatterns: ['Back arching', 'Neck strain', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Systematic review and biomechanical research'
    }
  },

  {
    id: 'lumbar_birddog',
    baseName: 'Bird Dog',
    baseNameSv: 'Fågelhund',
    description: 'Quadruped exercise for spinal stability and hip/shoulder coordination',
    descriptionSv: 'Fyrfotaövning för spinal stabilitet och höft/axelkoordination',
    bodyRegion: 'lumbar',
    muscleGroups: ['multifidus', 'erector_spinae', 'gluteus_maximus'],
    jointType: 'spine',
    exerciseType: 'isometric',

    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'balance_pad'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 6, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 8,
    baseRestSeconds: 60,

    instructions: [
      'Start on hands and knees with neutral spine',
      'Brace core without moving spine',
      'Extend opposite arm and leg simultaneously',
      'Keep hips level - do not rotate',
      'Hold at end position',
      'Return with control and switch sides'
    ],
    instructionsSv: [
      'Börja på händer och knän med neutral rygg',
      'Spänn core utan att flytta ryggraden',
      'Sträck ut motsatt arm och ben samtidigt',
      'Håll höfterna i nivå - rotera inte',
      'Håll i slutpositionen',
      'Återgå med kontroll och byt sida'
    ],

    techniquePoints: [
      'Imagine balancing a glass of water on lower back',
      'Reach through fingertips and heel',
      'Do not hyperextend neck',
      'Move slowly and deliberately'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Unstable spondylolisthesis', 'Wrist fracture'],
      precautions: ['Knee pain - use padding', 'Shoulder issues - reduce arm reach'],
      redFlags: ['Leg weakness', 'Saddle anesthesia', 'Progressive neurological deficit'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Spinal stabilizers',
      targetStructure: 'Multifidus, erector spinae, gluteus maximus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Arm only first', 'Leg only first'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy', 'Spinal fusion'],

      progressionCriteria: {
        minPainFreeReps: 10,
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
    id: 'lumbar_sideplank',
    baseName: 'Side Plank',
    baseNameSv: 'Sidoplanka',
    description: 'Lateral core stabilization exercise for quadratus lumborum and obliques',
    descriptionSv: 'Lateral core-stabiliseringsövning för quadratus lumborum och sneda magmuskler',
    bodyRegion: 'lumbar',
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
    baseRestSeconds: 60,

    instructions: [
      'Lie on side with elbow under shoulder',
      'Stack feet or stagger for stability',
      'Lift hips off floor creating straight line',
      'Keep body in neutral alignment',
      'Hold position, breathing normally',
      'Lower with control'
    ],
    instructionsSv: [
      'Ligg på sidan med armbågen under axeln',
      'Stapla fötterna eller förskjut för stabilitet',
      'Lyft höfterna från golvet och skapa en rak linje',
      'Håll kroppen i neutral position',
      'Håll positionen och andas normalt',
      'Sänk med kontroll'
    ],

    techniquePoints: [
      'Do not let hips sag',
      'Keep shoulders stacked',
      'Breathe normally throughout',
      'Beginner: knees bent, advanced: straight legs'
    ],

    safetyData: {
      contraindications: ['Shoulder instability', 'Acute lateral trunk pain', 'Rib fracture'],
      precautions: ['Wrist issues - use fist', 'Neck pain - neutral head position'],
      redFlags: ['Sharp pain', 'Numbness in arm', 'Dizziness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core musculature',
      targetStructure: 'Quadratus lumborum, internal/external obliques, gluteus medius',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['From knees only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],

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
        compensationPatterns: ['Hip drop', 'Trunk rotation', 'Shoulder elevation']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  // ============================================
  // MOTOR CONTROL EXERCISES
  // ============================================
  {
    id: 'lumbar_pelvic_tilt',
    baseName: 'Pelvic Tilt',
    baseNameSv: 'Bäckentilt',
    description: 'Basic motor control exercise for lumbo-pelvic awareness',
    descriptionSv: 'Grundläggande motorisk kontrollövning för ländryggen-bäckenmedvetenhet',
    bodyRegion: 'lumbar',
    muscleGroups: ['transverse_abdominis', 'multifidus', 'rectus_abdominis'],
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

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back with knees bent',
      'Find neutral spine position',
      'Gently flatten lower back to floor (posterior tilt)',
      'Then gently arch lower back (anterior tilt)',
      'Move slowly between positions',
      'Return to neutral'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Hitta neutral ryggposition',
      'Platta försiktigt ländryggen mot golvet (bakåttilt)',
      'Sedan välv försiktigt ländryggen (framåttilt)',
      'Rör dig långsamt mellan positionerna',
      'Återgå till neutral'
    ],

    techniquePoints: [
      'Move only the pelvis, not legs',
      'Keep movement small and controlled',
      'Breathe normally throughout',
      'Focus on body awareness'
    ],

    safetyData: {
      contraindications: ['None - very gentle exercise'],
      precautions: ['Acute pain - reduce range', 'Post-surgical - gentle movement only'],
      redFlags: ['Severe pain with minimal movement', 'Neurological symptoms'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar musculature',
      targetStructure: 'Motor control retraining',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Minimal range', 'No resistance'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy', 'Spinal fusion', 'Any lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 3,
        maxPainDuring: 1,
        maxPainAfter: 0,
        formScore: 75
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Hip hiking', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Hodges PW. Motor control of the trunk. Springer, 2013',
      studyType: 'Motor control research'
    }
  },

  {
    id: 'lumbar_dead_bug',
    baseName: 'Dead Bug',
    baseNameSv: 'Död Insekt',
    description: 'Anti-extension core exercise with arm and leg movement',
    descriptionSv: 'Anti-extension core-övning med arm- och benrörelse',
    bodyRegion: 'lumbar',
    muscleGroups: ['transverse_abdominis', 'rectus_abdominis', 'obliques'],
    jointType: 'spine',
    exerciseType: 'motor_control',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'stability_ball'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,

    instructions: [
      'Lie on back with arms pointing to ceiling',
      'Lift legs to 90 degrees at hips and knees',
      'Press lower back gently into floor',
      'Slowly lower opposite arm and leg',
      'Return to start before switching',
      'Maintain back position throughout'
    ],
    instructionsSv: [
      'Ligg på rygg med armarna mot taket',
      'Lyft benen till 90 grader i höfter och knän',
      'Tryck ländryggen försiktigt mot golvet',
      'Sänk långsamt motsatt arm och ben',
      'Återgå till start innan du byter',
      'Behåll ryggpositionen genomgående'
    ],

    techniquePoints: [
      'Do not let back arch',
      'Move slowly with control',
      'Only lower as far as you can maintain position',
      'Exhale as you extend'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Unable to maintain neutral spine'],
      precautions: ['Hip flexor tightness - reduce range', 'Neck pain - support head'],
      redFlags: ['Radiating leg pain', 'Back arching despite effort'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core musculature',
      targetStructure: 'Transverse abdominis, rectus abdominis, obliques',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Arms only first', 'Reduced range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],

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
      studyType: 'Clinical reasoning model'
    }
  },

  // ============================================
  // McKENZIE METHOD EXERCISES
  // ============================================
  {
    id: 'lumbar_prone_extension',
    baseName: 'Prone Press-Up (McKenzie)',
    baseNameSv: 'Pronliggande Extension (McKenzie)',
    description: 'Extension exercise for directional preference - centralizes symptoms',
    descriptionSv: 'Extensionsövning för riktningspreferens - centraliserar symtom',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae'],
    jointType: 'spine',
    exerciseType: 'mobility',

    basePosition: 'prone',
    allowedPositions: ['prone'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 6, max: 10 },
    baseHoldSeconds: 2,
    baseRestSeconds: 0,

    instructions: [
      'Lie face down with hands by shoulders',
      'Relax completely - let back sag',
      'Press up on hands, keeping hips on floor',
      'Only go as high as comfortable',
      'Lower slowly back down',
      'Repeat frequently throughout day'
    ],
    instructionsSv: [
      'Ligg på mage med händerna vid axlarna',
      'Slappna av helt - låt ryggen sjunka',
      'Tryck upp på händerna, håll höfterna på golvet',
      'Gå bara så högt som det är bekvämt',
      'Sänk långsamt tillbaka',
      'Upprepa ofta under dagen'
    ],

    techniquePoints: [
      'Keep hips on floor',
      'Relax lower back muscles',
      'Look forward, not up',
      'If symptoms centralize, continue; if peripheralize, stop'
    ],

    safetyData: {
      contraindications: ['Spinal stenosis', 'Severe facet arthropathy', 'Symptoms peripheralize with extension'],
      precautions: ['Disc herniation - assess directional preference first', 'Shoulder issues - use elbows'],
      redFlags: ['Symptoms move further into leg', 'Increasing neurological deficit'],
      maxPainDuring: 4,
      maxPainAfter24h: 2,
      healingTissue: 'Disc, posterior elements',
      targetStructure: 'Lumbar spine extension mobility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Prop on elbows only', 'Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 5,
        maxPainDuring: 3,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Hips lifting off floor']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McKenzie R, May S. The Lumbar Spine: Mechanical Diagnosis and Therapy. Spinal Publications, 2003',
      studyType: 'Clinical method with systematic review support'
    }
  },

  {
    id: 'lumbar_flexion_supine',
    baseName: 'Double Knee to Chest',
    baseNameSv: 'Dubbla Knän till Bröstet',
    description: 'Flexion exercise for spinal stenosis and extension-biased pain',
    descriptionSv: 'Flexionsövning för spinal stenos och extensionsbaserad smärta',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'multifidus'],
    jointType: 'spine',
    exerciseType: 'stretch',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 20,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back with knees bent',
      'Bring both knees toward chest',
      'Hold behind thighs, not over kneecaps',
      'Gently pull knees closer',
      'Feel stretch in lower back',
      'Hold and breathe deeply'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'För båda knäna mot bröstet',
      'Håll bakom låren, inte över knäskålarna',
      'Dra försiktigt knäna närmare',
      'Känn stretch i ländryggen',
      'Håll och andas djupt'
    ],

    techniquePoints: [
      'Keep head on floor',
      'Relax and breathe into stretch',
      'Do not bounce',
      'Progress slowly into range'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation that worsens with flexion', 'Symptoms peripheralize with flexion'],
      precautions: ['Hip replacement - check precautions', 'Knee issues - hold thighs not shins'],
      redFlags: ['Increased leg symptoms', 'Sharp pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar erector spinae',
      targetStructure: 'Lumbar flexion mobility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['One leg at a time', 'Gentle range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Laminectomy', 'Spinal stenosis surgery'],

      progressionCriteria: {
        minPainFreeReps: 10,
        minConsecutiveDays: 3,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Neck strain', 'Holding breath']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Whitman JM. Spinal stenosis: conservative treatment approaches. JOSPT, 2006',
      studyType: 'Clinical practice guidelines'
    }
  },

  // ============================================
  // STRENGTHENING EXERCISES
  // ============================================
  {
    id: 'lumbar_bridge',
    baseName: 'Glute Bridge',
    baseNameSv: 'Gluteusbrygga',
    description: 'Hip extension exercise for gluteus maximus and posterior chain',
    descriptionSv: 'Höftextensionsövning för gluteus maximus och posterior kedja',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'erector_spinae'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'resistance_band', 'weight'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,

    instructions: [
      'Lie on back with knees bent, feet flat',
      'Arms at sides, palms down',
      'Squeeze glutes and lift hips',
      'Create straight line from knees to shoulders',
      'Hold at top, squeezing glutes',
      'Lower slowly with control'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän, fötterna platta',
      'Armar vid sidorna, handflatorna nedåt',
      'Kläm ihop sätesmusklerna och lyft höfterna',
      'Skapa en rak linje från knän till axlar',
      'Håll i toppen och kläm sätesmusklerna',
      'Sänk långsamt med kontroll'
    ],

    techniquePoints: [
      'Drive through heels, not toes',
      'Do not hyperextend lower back',
      'Keep core braced',
      'Feel glutes working, not hamstrings or back'
    ],

    safetyData: {
      contraindications: ['Acute hamstring strain', 'Severe hip OA with painful extension'],
      precautions: ['Back pain - neutral spine', 'Knee pain - adjust foot position'],
      redFlags: ['Sharp hip pain', 'Numbness in legs'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Gluteal musculature',
      targetStructure: 'Gluteus maximus, hamstrings',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Small range', 'Bilateral only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy', 'Hip replacement'],

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
        compensationPatterns: ['Back arching', 'Knee valgus', 'Asymmetric lift']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'Reiman MP, et al. Hip strengthening for LBP. JOSPT, 2012',
      studyType: 'Systematic review'
    }
  },

  {
    id: 'lumbar_prone_hip_extension',
    baseName: 'Prone Hip Extension',
    baseNameSv: 'Pronliggande Höftextension',
    description: 'Isolated gluteus maximus strengthening in prone position',
    descriptionSv: 'Isolerad gluteus maximus-styrketräning i pronliggande',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'concentric',

    basePosition: 'prone',
    allowedPositions: ['prone'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'ankle_weight'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'alternating'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie face down with legs straight',
      'Keep pelvis pressed into floor',
      'Squeeze glute and lift one leg',
      'Lift only a few inches',
      'Hold briefly at top',
      'Lower with control and repeat'
    ],
    instructionsSv: [
      'Ligg på mage med raka ben',
      'Håll bäckenet tryckt mot golvet',
      'Kläm ihop sätet och lyft ett ben',
      'Lyft bara några centimeter',
      'Håll kort i toppen',
      'Sänk med kontroll och upprepa'
    ],

    techniquePoints: [
      'Do not rotate pelvis',
      'Feel glute, not lower back',
      'Keep leg straight',
      'Small, controlled movement'
    ],

    safetyData: {
      contraindications: ['Acute lumbar extension intolerance', 'Hip flexor strain'],
      precautions: ['Back pain - pillow under pelvis', 'Neck strain - turn head to side'],
      redFlags: ['Increased back pain', 'Leg numbness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Gluteal musculature',
      targetStructure: 'Gluteus maximus',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Reduced range', 'No ankle weight'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],

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
        compensationPatterns: ['Pelvis rotation', 'Back extension', 'Knee bend']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Distefano LJ, et al. Gluteal muscle activation. JOSPT, 2009',
      studyType: 'EMG study'
    }
  },

  // ============================================
  // NERVE GLIDING
  // ============================================
  {
    id: 'lumbar_sciatic_nerve_glide',
    baseName: 'Sciatic Nerve Glide',
    baseNameSv: 'Ischiasnerv Glid',
    description: 'Neural mobilization for sciatic nerve sensitivity',
    descriptionSv: 'Neural mobilisering för ischiasnerv-känslighet',
    bodyRegion: 'lumbar',
    muscleGroups: ['hamstrings'],
    jointType: 'nerve',
    exerciseType: 'neural_glide',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],

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

    instructions: [
      'Lie on back, bring knee toward chest',
      'Hold behind thigh',
      'Straighten knee while pointing toes up',
      'When you feel stretch, flex ankle and bend knee slightly',
      'Then point toes and straighten knee',
      'Alternate in smooth, gentle motion'
    ],
    instructionsSv: [
      'Ligg på rygg, för knät mot bröstet',
      'Håll bakom låret',
      'Sträck knät medan du pekar tårna uppåt',
      'När du känner stretch, böj fotleden och böj knät lätt',
      'Sedan peka tårna och sträck knät',
      'Alternera i mjuk, försiktig rörelse'
    ],

    techniquePoints: [
      'Never hold stretch - keep moving',
      'Gentle oscillations only',
      'Should not reproduce full symptoms',
      'Stop if symptoms increase'
    ],

    safetyData: {
      contraindications: ['Acute radiculopathy', 'Cauda equina syndrome', 'Progressive neurological deficit'],
      precautions: ['Nerve sensitivity - very gentle', 'Disc herniation - assess first'],
      redFlags: ['Symptoms worsen', 'New weakness', 'Bladder/bowel changes'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Sciatic nerve',
      targetStructure: 'Sciatic nerve mobility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle', 'Minimal range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 3,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Holding stretch too long', 'Moving too fast']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Butler DS. The Sensitive Nervous System. NOI Group, 2000',
      studyType: 'Clinical framework'
    }
  },

  // ============================================
  // ROTATION EXERCISES
  // ============================================
  {
    id: 'lumbar_rotation_stretch',
    baseName: 'Lumbar Rotation Stretch',
    baseNameSv: 'Ländryggsrotation Stretch',
    description: 'Gentle rotation stretch for lumbar mobility',
    descriptionSv: 'Försiktig rotationsstretch för ländryggsmobilitet',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'obliques', 'quadratus_lumborum'],
    jointType: 'spine',
    exerciseType: 'stretch',

    basePosition: 'supine',
    allowedPositions: ['supine'],

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
      'Lie on back with knees bent together',
      'Arms out to sides in T position',
      'Keep shoulders on floor',
      'Let both knees fall to one side',
      'Turn head opposite direction',
      'Breathe and hold stretch'
    ],
    instructionsSv: [
      'Ligg på rygg med knäna böjda ihop',
      'Armar ut till sidorna i T-position',
      'Håll axlarna på golvet',
      'Låt båda knäna falla åt en sida',
      'Vänd huvudet åt motsatt håll',
      'Andas och håll stretchen'
    ],

    techniquePoints: [
      'Keep both shoulders down',
      'Knees do not need to touch floor',
      'Relax into the stretch',
      'Use gravity, no forcing'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Spinal instability', 'Spinal fusion'],
      precautions: ['SI joint dysfunction - reduce range', 'Hip issues - support knees with pillow'],
      redFlags: ['Sharp pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar rotators',
      targetStructure: 'Lumbar rotation mobility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Reduced range', 'Pillow between knees'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],

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
        compensationPatterns: ['Shoulder lifting', 'Forcing range']
      }
    },

    evidenceBase: {
      level: 'C',
      source: 'Fritz JM, et al. Low back pain CPG. JOSPT, 2021',
      studyType: 'Clinical practice guideline'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // McGILL BIG 3 EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'lumbar_mcgill_curlup',
    baseName: 'McGill Curl-up',
    baseNameSv: 'McGill Curl-up',
    description: 'Spine-sparing abdominal activation',
    descriptionSv: 'Ryggvänlig magaktivering',
    bodyRegion: 'lumbar',
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
      'Lie on back with one knee bent, one straight',
      'Place hands under lower back',
      'Brace abdominals',
      'Lift head and shoulders slightly',
      'Hold without flattening back',
      'Lower and repeat'
    ],
    instructionsSv: [
      'Ligg på rygg med ett knä böjt, ett rakt',
      'Placera händerna under ländryggen',
      'Spänn magmusklerna',
      'Lyft huvudet och axlarna lätt',
      'Håll utan att platta ryggen',
      'Sänk och upprepa'
    ],

    techniquePoints: [
      'Maintain neutral spine',
      'Only lift few inches',
      'Feel abs, not neck',
      'Breathe normally during hold'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation', 'Severe osteoporosis'],
      precautions: ['Neck pain - support head'],
      redFlags: ['Radiating pain', 'Numbness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Abdominal musculature',
      targetStructure: 'Rectus abdominis',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Reduced hold time'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar fusion', 'Discectomy'],

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
        compensationPatterns: ['Neck strain', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  {
    id: 'lumbar_side_bridge',
    baseName: 'Side Bridge',
    baseNameSv: 'Sidobrygga',
    description: 'McGill side plank variation for quadratus lumborum',
    descriptionSv: 'McGill sidoplanka för quadratus lumborum',
    bodyRegion: 'lumbar',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'gluteus_medius'],
    jointType: 'spine',
    exerciseType: 'isometric',

    basePosition: 'sidelying',
    allowedPositions: ['sidelying'],

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
      'Lift hips off ground',
      'Create straight line from head to feet',
      'Hold position',
      'Lower with control'
    ],
    instructionsSv: [
      'Ligg på sidan med armbågen under axeln',
      'Stapla fötterna eller förskjut för stabilitet',
      'Lyft höfterna från golvet',
      'Skapa en rak linje från huvud till fötter',
      'Håll positionen',
      'Sänk med kontroll'
    ],

    techniquePoints: [
      'From knees for beginner',
      'Hips should not sag',
      'Keep shoulders stacked',
      'Breathe throughout'
    ],

    safetyData: {
      contraindications: ['Shoulder injury', 'Acute lateral trunk pain'],
      precautions: ['Neck pain - neutral position'],
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
      appropriateForSurgeries: ['Lumbar fusion', 'Discectomy'],

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
        compensationPatterns: ['Hip drop', 'Trunk rotation']
      }
    },

    evidenceBase: {
      level: 'A',
      source: 'McGill SM. Low Back Disorders. Human Kinetics, 2016',
      studyType: 'Biomechanical research'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LUMBAR MOBILITY EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'lumbar_pelvic_tilts',
    baseName: 'Pelvic Tilts',
    baseNameSv: 'Bäckentiltar',
    description: 'Active pelvic mobility exercise in supine',
    descriptionSv: 'Aktiv bäckenrörlighetsövning i ryggläge',
    bodyRegion: 'lumbar',
    muscleGroups: ['abdominals', 'erector_spinae'],
    jointType: 'spine',
    exerciseType: 'mobility',

    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting', 'standing'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,

    instructions: [
      'Lie on back with knees bent',
      'Flatten lower back into floor (posterior tilt)',
      'Hold briefly',
      'Arch lower back off floor (anterior tilt)',
      'Hold briefly',
      'Alternate between positions'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Platta ländryggen mot golvet (posterior tilt)',
      'Håll kort',
      'Svanka ländryggen från golvet (anterior tilt)',
      'Håll kort',
      'Växla mellan positionerna'
    ],

    techniquePoints: [
      'Smooth controlled movement',
      'No jerky motions',
      'Stay within pain-free range',
      'Breathe normally'
    ],

    safetyData: {
      contraindications: ['None - very gentle'],
      precautions: ['Acute disc - avoid extension'],
      redFlags: ['Radiating symptoms'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Pelvic mobility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All lumbar surgeries'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 3,
        maxPainDuring: 1,
        maxPainAfter: 0,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Breath holding']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Fritz JM, et al. Low back pain CPG. JOSPT, 2021',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'lumbar_knees_to_chest',
    baseName: 'Knees to Chest Stretch',
    baseNameSv: 'Knän till Bröst',
    description: 'Lumbar flexion stretch',
    descriptionSv: 'Ländryggflexionsstretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'quadratus_lumborum'],
    jointType: 'spine',
    exerciseType: 'stretch',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Lie on back',
      'Bring both knees toward chest',
      'Wrap arms around knees',
      'Gently pull knees closer',
      'Hold and breathe',
      'Release slowly'
    ],
    instructionsSv: [
      'Ligg på rygg',
      'För båda knäna mot bröstet',
      'Linda armarna runt knäna',
      'Dra försiktigt knäna närmare',
      'Håll och andas',
      'Släpp långsamt'
    ],

    techniquePoints: [
      'Keep head on floor',
      'Gentle stretch, not forced',
      'Relax into stretch',
      'Breathe deeply'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation - extension preference'],
      precautions: ['Stenosis - may aggravate'],
      redFlags: ['Increased radiating pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar extensors',
      targetStructure: 'Erector spinae flexibility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['One knee at a time'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],

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
        compensationPatterns: ['Neck straining', 'Forcing range']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Fritz JM, et al. Low back pain CPG. JOSPT, 2021',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'lumbar_piriformis_stretch',
    baseName: 'Piriformis Stretch',
    baseNameSv: 'Piriformisstretch',
    description: 'Deep hip rotator stretch',
    descriptionSv: 'Djup höftrotatorstretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['piriformis', 'deep_hip_rotators'],
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
      'Lie on back with knees bent',
      'Cross ankle over opposite knee',
      'Reach through and grab thigh',
      'Pull thigh toward chest',
      'Feel stretch in buttock',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Korsa fotleden över motsatt knä',
      'Nå igenom och greppa låret',
      'Dra låret mot bröstet',
      'Känn stretch i skinkan',
      'Håll och andas'
    ],

    techniquePoints: [
      'Keep lower back neutral',
      'Relax shoulders',
      'Breathe into stretch',
      'Gentle sustained pressure'
    ],

    safetyData: {
      contraindications: ['Total hip replacement - check precautions'],
      precautions: ['Avoid excessive flexion post-THR'],
      redFlags: ['Groin pain', 'Numbness in leg'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Piriformis',
      targetStructure: 'Deep hip rotators',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

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
        compensationPatterns: ['Forcing stretch', 'Holding breath']
      }
    },

    evidenceBase: {
      level: 'C',
      source: 'Clinical practice consensus',
      studyType: 'Expert opinion'
    }
  },

  {
    id: 'lumbar_child_pose',
    baseName: 'Child\'s Pose',
    baseNameSv: 'Barnposition',
    description: 'Gentle lumbar flexion and relaxation',
    descriptionSv: 'Försiktig ländryggflexion och avslappning',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'latissimus_dorsi'],
    jointType: 'spine',
    exerciseType: 'stretch',

    basePosition: 'kneeling',
    allowedPositions: ['kneeling'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'pillow'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,

    instructions: [
      'Start on hands and knees',
      'Sit back toward heels',
      'Reach arms forward on floor',
      'Rest forehead on mat',
      'Breathe into lower back',
      'Relax completely'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Sitt tillbaka mot hälarna',
      'Sträck armarna framåt på golvet',
      'Vila pannan på mattan',
      'Andas in i ländryggen',
      'Slappna av helt'
    ],

    techniquePoints: [
      'Use pillow under hips if needed',
      'Widen knees for more room',
      'Arms can rest by sides',
      'Focus on breathing'
    ],

    safetyData: {
      contraindications: ['Severe knee arthritis'],
      precautions: ['Knee pain - use cushion'],
      redFlags: ['Increased back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Spinal mobility',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Pillows for support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 5,
        minConsecutiveDays: 3,
        maxPainDuring: 1,
        maxPainAfter: 0,
        formScore: 70
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['None typical']
      }
    },

    evidenceBase: {
      level: 'C',
      source: 'Clinical practice consensus',
      studyType: 'Expert opinion'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEGMENTAL CONTROL EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'lumbar_single_leg_extension',
    baseName: 'Supine Single Leg Extension',
    baseNameSv: 'Liggande Enbenslyft',
    description: 'Leg lowering with core control',
    descriptionSv: 'Bensänkning med core-kontroll',
    bodyRegion: 'lumbar',
    muscleGroups: ['transverse_abdominis', 'rectus_abdominis'],
    jointType: 'spine',
    exerciseType: 'motor_control',

    basePosition: 'supine',
    allowedPositions: ['supine'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],

    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,

    instructions: [
      'Lie on back with both knees bent at 90°',
      'Press lower back gently into floor',
      'Slowly lower one foot toward floor',
      'Only go as far as back stays flat',
      'Return to start',
      'Alternate legs'
    ],
    instructionsSv: [
      'Ligg på rygg med båda knän böjda i 90°',
      'Tryck ländryggen försiktigt mot golvet',
      'Sänk långsamt en fot mot golvet',
      'Gå bara så långt som ryggen förblir platt',
      'Återgå till start',
      'Växla ben'
    ],

    techniquePoints: [
      'Back must stay flat',
      'Slow controlled movement',
      'Quality over range',
      'Exhale as you lower'
    ],

    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Hip flexor tightness - reduce range'],
      redFlags: ['Radiating symptoms', 'Back arching'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Core musculature',
      targetStructure: 'Segmental control',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
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
        compensationPatterns: ['Back arching', 'Breath holding']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Sahrmann S. Movement System Impairment Syndromes. Mosby, 2010',
      studyType: 'Clinical reasoning model'
    }
  },

  {
    id: 'lumbar_prone_hip_extension',
    baseName: 'Prone Hip Extension',
    baseNameSv: 'Pronliggande Höftextension',
    description: 'Gluteal activation without lumbar hyperextension',
    descriptionSv: 'Glutealaktivering utan ländryggshyperextension',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteus_maximus', 'hamstrings'],
    jointType: 'hip',
    exerciseType: 'strength_concentric',

    basePosition: 'prone',
    allowedPositions: ['prone'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'alternating'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,

    instructions: [
      'Lie face down with pillow under abdomen',
      'Engage core first',
      'Lift one leg straight up',
      'Keep leg straight, do not bend knee',
      'Lower with control',
      'Repeat'
    ],
    instructionsSv: [
      'Ligg på mage med kudde under magen',
      'Aktivera core först',
      'Lyft ett ben rakt upp',
      'Håll benet rakt, böj inte knät',
      'Sänk med kontroll',
      'Upprepa'
    ],

    techniquePoints: [
      'Do not arch lower back',
      'Lift from glutes, not back',
      'Small controlled lift',
      'Keep pelvis level'
    ],

    safetyData: {
      contraindications: ['Acute lumbar strain'],
      precautions: ['Extension intolerance - small range'],
      redFlags: ['Increased back pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Gluteal muscles',
      targetStructure: 'Gluteus maximus motor control',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

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
        compensationPatterns: ['Back arching', 'Knee bending', 'Hip rotation']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Sahrmann S. Movement System Impairment Syndromes. Mosby, 2010',
      studyType: 'Clinical reasoning model'
    }
  },

  {
    id: 'lumbar_quadruped_rocking',
    baseName: 'Quadruped Rocking',
    baseNameSv: 'Fyrfota Gungning',
    description: 'Controlled lumbar flexion in quadruped',
    descriptionSv: 'Kontrollerad ländryggflexion i fyrfota',
    bodyRegion: 'lumbar',
    muscleGroups: ['core_stabilizers'],
    jointType: 'spine',
    exerciseType: 'mobility',

    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],

    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,

    instructions: [
      'Start on hands and knees',
      'Hands under shoulders, knees under hips',
      'Slowly rock hips back toward heels',
      'Stop before spine flexes',
      'Return to start',
      'Keep spine neutral throughout'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Händer under axlar, knän under höfter',
      'Gungar höfterna bakåt mot hälarna',
      'Stanna innan ryggen böjs',
      'Återgå till start',
      'Håll ryggen neutral hela tiden'
    ],

    techniquePoints: [
      'Maintain neutral spine',
      'Movement from hips only',
      'Control range with pain',
      'Smooth continuous motion'
    ],

    safetyData: {
      contraindications: ['Severe knee OA'],
      precautions: ['Knee pain - use padding'],
      redFlags: ['Increased back pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Hip mobility with spinal control',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Limited range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 15,
        minConsecutiveDays: 3,
        maxPainDuring: 1,
        maxPainAfter: 0,
        formScore: 75
      },

      regressionTriggers: {
        painIncrease: 1,
        swellingPresent: false,
        formBreakdown: false,
        compensationPatterns: ['Spine flexing']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Fritz JM, et al. Low back pain CPG. JOSPT, 2021',
      studyType: 'Clinical practice guideline'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCTIONAL LUMBAR EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'lumbar_squat_to_stand',
    baseName: 'Squat to Stand',
    baseNameSv: 'Knäböj till Stående',
    description: 'Functional sit-to-stand movement pattern',
    descriptionSv: 'Funktionellt sitt-till-stå rörelsemönster',
    bodyRegion: 'lumbar',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'core'],
    jointType: 'multi_joint',
    exerciseType: 'functional',

    basePosition: 'sitting',
    allowedPositions: ['sitting'],

    baseEquipment: 'chair',
    allowedEquipment: ['chair', 'bench'],

    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],

    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],

    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,

    instructions: [
      'Sit at edge of chair',
      'Feet shoulder width apart',
      'Lean forward, nose over toes',
      'Push through heels to stand',
      'Sit back down with control',
      'Repeat'
    ],
    instructionsSv: [
      'Sitt på kanten av stolen',
      'Fötterna axelbrett isär',
      'Luta framåt, näsan över tårna',
      'Tryck genom hälarna för att stå upp',
      'Sätt dig ner med kontroll',
      'Upprepa'
    ],

    techniquePoints: [
      'Weight through heels',
      'Neutral spine',
      'Control descent',
      'Progress to no hands'
    ],

    safetyData: {
      contraindications: ['Severe hip/knee arthritis making standing difficult'],
      precautions: ['Balance issues - use arm rests'],
      redFlags: ['Dizziness on standing'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lower extremity strength',
      targetStructure: 'Functional capacity',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Use arm rests'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

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
        compensationPatterns: ['Using hands', 'Leaning to one side']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'Fritz JM, et al. Low back pain CPG. JOSPT, 2021',
      studyType: 'Clinical practice guideline'
    }
  },

  {
    id: 'lumbar_pallof_press',
    baseName: 'Pallof Press',
    baseNameSv: 'Pallof Press',
    description: 'Anti-rotation core exercise',
    descriptionSv: 'Anti-rotation core-övning',
    bodyRegion: 'lumbar',
    muscleGroups: ['obliques', 'transverse_abdominis'],
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
      'Hold band at chest with both hands',
      'Feet shoulder width apart',
      'Press arms straight out',
      'Resist rotation - stay square',
      'Return to chest and repeat'
    ],
    instructionsSv: [
      'Stå i sidled mot ankarpunkten',
      'Håll bandet vid bröstet med båda händerna',
      'Fötterna axelbrett isär',
      'Tryck armarna rakt ut',
      'Motstå rotation - håll dig rak',
      'Återgå till bröstet och upprepa'
    ],

    techniquePoints: [
      'Do not let body rotate',
      'Keep hips and shoulders square',
      'Brace core throughout',
      'Slow controlled press'
    ],

    safetyData: {
      contraindications: ['Acute rotational back injury'],
      precautions: ['Light resistance initially'],
      redFlags: ['Sharp back pain', 'Radiating symptoms'],
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
        compensationPatterns: ['Trunk rotation', 'Hip shift']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'McGill SM. Core Training Evidence. J Bodywork Movement Ther, 2010',
      studyType: 'Research review'
    }
  },

  {
    id: 'lumbar_suitcase_carry',
    baseName: 'Suitcase Carry',
    baseNameSv: 'Resväskebärning',
    description: 'Loaded walking with unilateral weight',
    descriptionSv: 'Bärgång med unilateral vikt',
    bodyRegion: 'lumbar',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'gluteus_medius'],
    jointType: 'spine',
    exerciseType: 'functional',

    basePosition: 'standing',
    allowedPositions: ['standing'],

    baseEquipment: 'dumbbell',
    allowedEquipment: ['dumbbell', 'kettlebell', 'resistance_band'],

    baseDifficulty: 'intermediate',
    allowedDifficulties: ['intermediate', 'advanced'],

    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],

    baseReps: { min: 1, max: 2 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 60,

    instructions: [
      'Hold weight in one hand at side',
      'Stand tall with shoulders level',
      'Walk forward with normal gait',
      'Resist side-bending toward weight',
      'Maintain upright posture',
      'Switch sides'
    ],
    instructionsSv: [
      'Håll vikten i en hand vid sidan',
      'Stå rakt med axlarna i nivå',
      'Gå framåt med normal gång',
      'Motstå sidoböjning mot vikten',
      'Bibehåll upprätt hållning',
      'Byt sida'
    ],

    techniquePoints: [
      'Shoulders must stay level',
      'No side-bending',
      'Normal walking pattern',
      'Core braced throughout'
    ],

    safetyData: {
      contraindications: ['Acute lumbar strain', 'Balance issues'],
      precautions: ['Start light weight'],
      redFlags: ['Back pain with carrying'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral core',
      targetStructure: 'Functional carry capacity',

      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light weight only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],

      progressionCriteria: {
        minPainFreeReps: 2,
        minConsecutiveDays: 5,
        maxPainDuring: 2,
        maxPainAfter: 1,
        formScore: 85
      },

      regressionTriggers: {
        painIncrease: 2,
        swellingPresent: false,
        formBreakdown: true,
        compensationPatterns: ['Side bending', 'Shoulder drop']
      }
    },

    evidenceBase: {
      level: 'B',
      source: 'McGill SM. Core Training Evidence. J Bodywork Movement Ther, 2010',
      studyType: 'Research review'
    }
  },

  // ============================================
  // ADDITIONAL SUPINE EXERCISES
  // ============================================
  {
    id: 'lumbar_double_knee_to_chest',
    baseName: 'Double Knee to Chest',
    baseNameSv: 'Dubbel Knä till Bröst',
    description: 'Bilateral lumbar flexion stretch',
    descriptionSv: 'Bilateral lumbar flexionsstretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'gluteals'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Lie on back with knees bent',
      'Bring both knees toward chest',
      'Wrap arms around knees',
      'Gently pull knees closer',
      'Feel stretch in lower back',
      'Hold and breathe deeply'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'För båda knäna mot bröstet',
      'Omfamna knäna med armarna',
      'Dra försiktigt knäna närmare',
      'Känn stretch i ländryggen',
      'Håll och andas djupt'
    ],
    techniquePoints: ['Gentle pull only', 'Keep head on floor', 'Relax into stretch', 'Good for morning stiffness'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Spinal stenosis with flexion sensitivity'],
      precautions: ['Hip replacement - check hip precautions', 'Knee pain - modify grip'],
      redFlags: ['Radiating pain', 'Numbness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Erector spinae, lumbar facets',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial range only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Excessive force'] }
    },
    evidenceBase: { level: 'B', source: 'Delitto A. LBP CPG. JOSPT, 2012', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'lumbar_pelvic_clock',
    baseName: 'Pelvic Clock',
    baseNameSv: 'Bäckenklocka',
    description: 'Controlled pelvic motion in all directions',
    descriptionSv: 'Kontrollerad bäckenrörelse i alla riktningar',
    bodyRegion: 'lumbar',
    muscleGroups: ['core', 'hip_flexors', 'erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 2 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back with knees bent',
      'Imagine pelvis as clock face',
      'Tilt toward 12 o\'clock (flatten back)',
      'Tilt toward 6 o\'clock (arch back)',
      'Tilt toward 3 and 9 o\'clock (side to side)',
      'Make smooth circles through all positions'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Föreställ dig bäckenet som en urtavla',
      'Luta mot klockan 12 (platta ryggen)',
      'Luta mot klockan 6 (böj ryggen)',
      'Luta mot klockan 3 och 9 (sida till sida)',
      'Gör mjuka cirklar genom alla positioner'
    ],
    techniquePoints: ['Small controlled movements', 'Explore full range', 'Builds motor control', 'Good warm-up'],
    safetyData: {
      contraindications: ['Acute lumbar sprain'],
      precautions: ['Keep movements small initially', 'Pain-free range'],
      redFlags: ['Radiating symptoms', 'Catching or locking'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Lumbar segmental mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Jerky movements'] }
    },
    evidenceBase: { level: 'B', source: 'Feldenkrais method adaptation', studyType: 'Clinical practice' }
  },

  {
    id: 'lumbar_lower_trunk_rotation',
    baseName: 'Lower Trunk Rotation',
    baseNameSv: 'Nedre Bålrotation',
    description: 'Gentle lumbar rotation stretch',
    descriptionSv: 'Försiktig lumbal rotationsstretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['obliques', 'erector_spinae', 'quadratus_lumborum'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 2 },
    baseHoldSeconds: 20,
    baseRestSeconds: 10,
    instructions: [
      'Lie on back with knees bent together',
      'Arms out to sides for stability',
      'Let knees fall to one side',
      'Keep shoulders on floor',
      'Feel gentle rotation stretch',
      'Hold, then switch sides'
    ],
    instructionsSv: [
      'Ligg på rygg med knäna ihop böjda',
      'Armar ut åt sidorna för stabilitet',
      'Låt knäna falla åt ena sidan',
      'Håll axlarna mot golvet',
      'Känn försiktig rotationsstretch',
      'Håll, sedan byt sida'
    ],
    techniquePoints: ['Do not force range', 'Shoulders stay down', 'Breathe and relax', 'Good for stiffness'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'SI joint dysfunction'],
      precautions: ['Disc issues - reduce range', 'Go slowly'],
      redFlags: ['Radiating pain', 'Sharp catch'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Lumbar rotators',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Small range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Shoulder lifting'] }
    },
    evidenceBase: { level: 'B', source: 'Delitto A. LBP CPG. JOSPT, 2012', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'lumbar_supine_piriformis_stretch',
    baseName: 'Supine Piriformis Stretch',
    baseNameSv: 'Ryggliggande Piriformisstretch',
    description: 'Figure-4 stretch for piriformis and hip',
    descriptionSv: 'Figur-4 stretch för piriformis och höft',
    bodyRegion: 'lumbar',
    muscleGroups: ['piriformis', 'gluteus_maximus'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 2, max: 3 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Lie on back with knees bent',
      'Cross ankle over opposite knee (figure 4)',
      'Thread hands behind thigh',
      'Pull thigh toward chest',
      'Feel stretch in crossed leg buttock',
      'Keep pelvis flat on floor'
    ],
    instructionsSv: [
      'Ligg på rygg med böjda knän',
      'Korsa ankeln över motsatt knä (figur 4)',
      'Trä händerna bakom låret',
      'Dra låret mot bröstet',
      'Känn stretch i korsade benets säte',
      'Håll bäckenet platt mot golvet'
    ],
    techniquePoints: ['Keep back flat', 'Gentle pull', 'Relax the crossed leg', 'Good for sciatica symptoms'],
    safetyData: {
      contraindications: ['Acute hip injury', 'Hip replacement - check precautions'],
      precautions: ['Knee pain - modify position', 'Avoid overstretching'],
      redFlags: ['Numbness in leg', 'Sharp pain'],
      maxPainDuring: 4,
      maxPainAfter24h: 2,
      healingTissue: 'Piriformis',
      targetStructure: 'Piriformis, deep hip rotators',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle stretch only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery', 'Discectomy'],
      progressionCriteria: { minPainFreeReps: 3, minConsecutiveDays: 7, maxPainDuring: 3, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Pelvis lifting'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // QUADRUPED EXERCISES
  // ============================================
  {
    id: 'lumbar_quadruped_rock_back',
    baseName: 'Quadruped Rock Back',
    baseNameSv: 'Fyrfota Gunga Bakåt',
    description: 'Gentle lumbar flexion in quadruped',
    descriptionSv: 'Försiktig lumbal flexion i fyrfota',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'multifidus'],
    jointType: 'lumbar_spine',
    exerciseType: 'mobility',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: [
      'Start on hands and knees',
      'Hands under shoulders, knees under hips',
      'Slowly rock hips back toward heels',
      'Keep spine neutral initially',
      'Allow lumbar flexion as comfortable',
      'Return to start position'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Händer under axlar, knän under höfter',
      'Gunga långsamt höfterna bakåt mot hälarna',
      'Håll ryggen neutral initialt',
      'Tillåt lumbal flexion när det är bekvämt',
      'Återgå till startposition'
    ],
    techniquePoints: ['Control the movement', 'Only go as far as comfortable', 'Good for morning stiffness', 'Assess range over time'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Knee injury preventing kneeling'],
      precautions: ['Knee pain - pad knees', 'Limited range initially'],
      redFlags: ['Radiating symptoms', 'Sharp pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Lumbar mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Rushing movement'] }
    },
    evidenceBase: { level: 'B', source: 'Delitto A. LBP CPG. JOSPT, 2012', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'lumbar_fire_hydrant',
    baseName: 'Fire Hydrant',
    baseNameSv: 'Brandsläckare',
    description: 'Hip abduction in quadruped position',
    descriptionSv: 'Höftabduktion i fyrfotaposition',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteus_medius', 'gluteus_maximus'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'resistance_band'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'alternating'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: [
      'Start on hands and knees',
      'Keep core braced and back flat',
      'Lift knee out to side (like dog at hydrant)',
      'Keep knee bent at 90 degrees',
      'Do not rotate pelvis',
      'Lower and repeat'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Håll core spänd och ryggen platt',
      'Lyft knät ut åt sidan',
      'Håll knät böjt i 90 grader',
      'Rotera inte bäckenet',
      'Sänk och upprepa'
    ],
    techniquePoints: ['Pelvis stays level', 'Small controlled movement', 'Feel glutes working', 'Core stays engaged'],
    safetyData: {
      contraindications: ['Acute hip injury', 'Knee pain with kneeling'],
      precautions: ['Pad knees if needed', 'Limited range initially'],
      redFlags: ['Hip pain', 'Back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip muscles',
      targetStructure: 'Gluteus medius',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Pelvis rotation', 'Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Reiman MP. Hip strengthening. JOSPT, 2012', studyType: 'Systematic review' }
  },

  {
    id: 'lumbar_quadruped_hip_circle',
    baseName: 'Quadruped Hip Circle',
    baseNameSv: 'Fyrfota Höftcirkel',
    description: 'Hip mobility in quadruped position',
    descriptionSv: 'Höftmobilitet i fyrfotaposition',
    bodyRegion: 'lumbar',
    muscleGroups: ['hip_flexors', 'gluteals', 'adductors'],
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
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 2 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Start on hands and knees',
      'Lift one knee and make circles with it',
      'Circle forward, out, back, and in',
      'Keep core stable throughout',
      'Do both directions',
      'Switch legs'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Lyft ett knä och gör cirklar med det',
      'Cirkla framåt, ut, bakåt och in',
      'Håll core stabil genom hela rörelsen',
      'Gör åt båda håll',
      'Byt ben'
    ],
    techniquePoints: ['Control the circle', 'Keep spine stable', 'Explore full range', 'Good hip mobility exercise'],
    safetyData: {
      contraindications: ['Acute hip injury'],
      precautions: ['Limited range initially', 'Pain-free only'],
      redFlags: ['Hip catching', 'Sharp pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Hip joint',
      targetStructure: 'Hip mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small circles'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Trunk rotation'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'lumbar_thread_needle',
    baseName: 'Thread the Needle',
    baseNameSv: 'Trä Nålen',
    description: 'Thoracic rotation in quadruped',
    descriptionSv: 'Torakal rotation i fyrfota',
    bodyRegion: 'lumbar',
    muscleGroups: ['thoracic_rotators', 'latissimus_dorsi'],
    jointType: 'thoracic_spine',
    exerciseType: 'mobility',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 2 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: [
      'Start on hands and knees',
      'Reach one arm under body through to other side',
      'Let shoulder drop to floor',
      'Feel rotation through thoracic spine',
      'Return and reach same arm up to ceiling',
      'Follow with eyes'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Sträck en arm under kroppen till andra sidan',
      'Låt axeln sjunka mot golvet',
      'Känn rotation genom bröstryggen',
      'Återgå och sträck samma arm upp mot taket',
      'Följ med ögonen'
    ],
    techniquePoints: ['Rotation from thoracic, not lumbar', 'Follow hand with eyes', 'Smooth controlled movement', 'Good for thoracic mobility'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute neck pain'],
      precautions: ['Wrist issues - on fists', 'Reduce range if needed'],
      redFlags: ['Dizziness', 'Radiating pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Thoracic spine',
      targetStructure: 'Thoracic rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Lumbar rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // STANDING EXERCISES
  // ============================================
  {
    id: 'lumbar_standing_extension',
    baseName: 'Standing Lumbar Extension',
    baseNameSv: 'Stående Lumbal Extension',
    description: 'McKenzie-based standing extension',
    descriptionSv: 'McKenzie-baserad stående extension',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'mobility',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 3,
    baseRestSeconds: 0,
    instructions: [
      'Stand with feet shoulder width apart',
      'Place hands on lower back',
      'Bend backward from waist',
      'Support back with hands',
      'Hold briefly at end range',
      'Return to upright'
    ],
    instructionsSv: [
      'Stå med fötterna axelbrett isär',
      'Placera händerna på ländryggen',
      'Böj bakåt från midjan',
      'Stöd ryggen med händerna',
      'Håll kort i ändläget',
      'Återgå till upprätt'
    ],
    techniquePoints: ['Hands support lower back', 'Controlled backward bend', 'McKenzie principle', 'Repeat frequently throughout day'],
    safetyData: {
      contraindications: ['Spinal stenosis', 'Spondylolisthesis', 'Extension-sensitive conditions'],
      precautions: ['Facet joint issues - reduce range', 'Dizziness - go slowly'],
      redFlags: ['Increased leg symptoms', 'Severe back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar disc, spine',
      targetStructure: 'Lumbar extension mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Knee bending'] }
    },
    evidenceBase: { level: 'A', source: 'McKenzie R. MDT. Spinal Publications, 2003', studyType: 'Clinical method' }
  },

  {
    id: 'lumbar_standing_hip_flexor_stretch',
    baseName: 'Standing Hip Flexor Stretch',
    baseNameSv: 'Stående Höftböjarstretch',
    description: 'Hip flexor stretch in standing split stance',
    descriptionSv: 'Höftböjarstretch i stående spjärnsteg',
    bodyRegion: 'lumbar',
    muscleGroups: ['iliopsoas', 'rectus_femoris'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'standing',
    allowedPositions: ['standing', 'half_kneeling'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 2, max: 3 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Stand in split stance, back leg straight',
      'Tuck tailbone under (posterior tilt)',
      'Shift weight forward',
      'Feel stretch in front of back hip',
      'Keep torso upright',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Stå i spjärnsteg, bakre benet rakt',
      'Tuck svanskotan under (posterior tilt)',
      'Skifta vikten framåt',
      'Känn stretch framför bakre höften',
      'Håll bålen upprätt',
      'Håll och andas'
    ],
    techniquePoints: ['Posterior pelvic tilt key', 'Do not arch back', 'Feel in front of hip', 'Important for LBP'],
    safetyData: {
      contraindications: ['Acute hip injury'],
      precautions: ['Balance issues - use support', 'Do not overstretch'],
      redFlags: ['Groin pain', 'Sharp hip pain'],
      maxPainDuring: 4,
      maxPainAfter24h: 2,
      healingTissue: 'Hip flexors',
      targetStructure: 'Iliopsoas, rectus femoris',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 3, minConsecutiveDays: 7, maxPainDuring: 3, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Arching back'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'lumbar_standing_side_bend',
    baseName: 'Standing Side Bend',
    baseNameSv: 'Stående Sidböjning',
    description: 'Lateral flexion stretch for quadratus lumborum',
    descriptionSv: 'Lateral flexionsstretch för quadratus lumborum',
    bodyRegion: 'lumbar',
    muscleGroups: ['quadratus_lumborum', 'obliques'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 20,
    baseRestSeconds: 10,
    instructions: [
      'Stand with feet shoulder width apart',
      'Raise one arm overhead',
      'Bend to opposite side',
      'Reach arm up and over',
      'Feel stretch along side of trunk',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Stå med fötterna axelbrett isär',
      'Lyft en arm över huvudet',
      'Böj åt motsatt sida',
      'Sträck armen upp och över',
      'Känn stretch längs sidan av bålen',
      'Håll och andas'
    ],
    techniquePoints: ['Do not rotate trunk', 'Pure lateral movement', 'Reach up, then over', 'Feel QL stretch'],
    safetyData: {
      contraindications: ['Acute lateral trunk strain'],
      precautions: ['Balance issues - use support', 'Gentle stretch'],
      redFlags: ['Sharp pain', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lateral trunk',
      targetStructure: 'Quadratus lumborum, obliques',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Trunk rotation'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'lumbar_good_morning',
    baseName: 'Good Morning Exercise',
    baseNameSv: 'God Morgon Övning',
    description: 'Hip hinge pattern for posterior chain',
    descriptionSv: 'Höftgångjärnsmönster för bakre kedjan',
    bodyRegion: 'lumbar',
    muscleGroups: ['hamstrings', 'gluteus_maximus', 'erector_spinae'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'barbell', 'resistance_band'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Stand with feet hip width apart',
      'Hands behind head or on hips',
      'Brace core, maintain flat back',
      'Hinge at hips, push hips back',
      'Lower torso toward horizontal',
      'Drive hips forward to stand'
    ],
    instructionsSv: [
      'Stå med fötterna höftbrett isär',
      'Händer bakom huvudet eller på höfterna',
      'Spänn core, behåll platt rygg',
      'Gångjärn vid höfterna, skjut höfterna bakåt',
      'Sänk bålen mot horisontell',
      'Driv höfterna framåt för att stå'
    ],
    techniquePoints: ['Flat back throughout', 'Hip hinge, not back bend', 'Soft knee bend', 'Feel hamstring stretch'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Severe back pain'],
      precautions: ['Back pain - bodyweight only', 'Master hip hinge first'],
      redFlags: ['Back rounding', 'Radiating pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Posterior chain',
      targetStructure: 'Hip extensors, erectors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Bodyweight only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Knee dominance'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Spine biomechanics', studyType: 'Biomechanical research' }
  },

  // ============================================
  // STRETCHES
  // ============================================
  {
    id: 'lumbar_childs_pose',
    baseName: 'Child\'s Pose',
    baseNameSv: 'Barnställning',
    description: 'Restorative lumbar flexion stretch',
    descriptionSv: 'Återhämtande lumbal flexionsstretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'latissimus_dorsi'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'kneeling',
    allowedPositions: ['kneeling'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'pillow'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Start on hands and knees',
      'Sit back on heels',
      'Lower chest toward thighs',
      'Extend arms forward or alongside body',
      'Rest forehead on floor',
      'Breathe deeply and relax'
    ],
    instructionsSv: [
      'Börja på händer och knän',
      'Sätt dig tillbaka på hälarna',
      'Sänk bröstet mot låren',
      'Sträck armarna framåt eller längs kroppen',
      'Vila pannan på golvet',
      'Andas djupt och slappna av'
    ],
    techniquePoints: ['Relaxation focus', 'Breathe into lower back', 'Use pillow under hips if needed', 'Restorative pose'],
    safetyData: {
      contraindications: ['Knee injury preventing deep flexion'],
      precautions: ['Knee pain - pillow under knees', 'Hip replacement - check precautions'],
      redFlags: ['Dizziness', 'Severe knee pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Lumbar flexion, relaxation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 70 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: [] }
    },
    evidenceBase: { level: 'C', source: 'Yoga tradition adaptation', studyType: 'Clinical practice' }
  },

  {
    id: 'lumbar_prone_on_elbows',
    baseName: 'Prone on Elbows',
    baseNameSv: 'Magliggande på Armbågar',
    description: 'McKenzie extension exercise - sphinx pose',
    descriptionSv: 'McKenzie extensionsövning - sfinxställning',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'mobility',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 30,
    baseRestSeconds: 10,
    instructions: [
      'Lie face down',
      'Prop up on elbows with forearms flat',
      'Let lower back sag toward floor',
      'Keep hips on floor',
      'Relax buttocks',
      'Hold position and breathe'
    ],
    instructionsSv: [
      'Ligg på mage',
      'Stöd dig på armbågarna med underarmarna platta',
      'Låt ländryggen sjunka mot golvet',
      'Håll höfterna på golvet',
      'Slappna av i sätesmusklerna',
      'Håll positionen och andas'
    ],
    techniquePoints: ['McKenzie progression step', 'Passive extension', 'Let gravity create extension', 'Repeat frequently'],
    safetyData: {
      contraindications: ['Spinal stenosis', 'Spondylolisthesis', 'Extension-sensitive conditions'],
      precautions: ['Increase symptoms - stop', 'Start with less elevation'],
      redFlags: ['Increased leg symptoms', 'Severe back pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar disc',
      targetStructure: 'Lumbar extension, disc centralization',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Check with surgeon'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Buttock clenching'] }
    },
    evidenceBase: { level: 'A', source: 'McKenzie R. MDT. Spinal Publications, 2003', studyType: 'Clinical method' }
  },

  {
    id: 'lumbar_prone_press_up',
    baseName: 'Prone Press-Up',
    baseNameSv: 'Magliggande Pressup',
    description: 'Full McKenzie extension exercise',
    descriptionSv: 'Full McKenzie extensionsövning',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'mobility',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 2,
    baseRestSeconds: 0,
    instructions: [
      'Lie face down with hands by shoulders',
      'Press up with arms',
      'Keep hips on floor',
      'Straighten arms as much as tolerated',
      'Relax buttocks throughout',
      'Lower and repeat'
    ],
    instructionsSv: [
      'Ligg på mage med händerna vid axlarna',
      'Tryck upp med armarna',
      'Håll höfterna på golvet',
      'Sträck armarna så mycket som tolererat',
      'Slappna av i sätesmusklerna genom hela rörelsen',
      'Sänk och upprepa'
    ],
    techniquePoints: ['Key McKenzie exercise', 'Repeated extension principle', 'Hips stay down', 'Assess centralization'],
    safetyData: {
      contraindications: ['Spinal stenosis', 'Spondylolisthesis', 'Extension worsens symptoms'],
      precautions: ['Monitor symptom response', 'Progress from prone on elbows'],
      redFlags: ['Peripheralization of symptoms', 'Increased leg pain'],
      maxPainDuring: 4,
      maxPainAfter24h: 3,
      healingTissue: 'Lumbar disc',
      targetStructure: 'Lumbar extension, disc',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Partial press-up'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 7, maxPainDuring: 3, maxPainAfter: 2, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Buttock clenching', 'Hip lifting'] }
    },
    evidenceBase: { level: 'A', source: 'McKenzie R. MDT. Spinal Publications, 2003', studyType: 'Clinical method' }
  },

  // ============================================
  // FUNCTIONAL EXERCISES
  // ============================================
  {
    id: 'lumbar_squat_to_stand',
    baseName: 'Squat to Stand',
    baseNameSv: 'Knäböj till Stående',
    description: 'Dynamic mobility combining squat and stretch',
    descriptionSv: 'Dynamisk mobilitet som kombinerar knäböj och stretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['quadriceps', 'hamstrings', 'gluteals'],
    jointType: 'hip',
    exerciseType: 'mobility',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 2 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: [
      'Stand with feet shoulder width apart',
      'Reach down and grab toes',
      'Drop into deep squat position',
      'Keep hold of toes',
      'Straighten legs while holding toes',
      'Feel hamstring stretch, then drop back to squat'
    ],
    instructionsSv: [
      'Stå med fötterna axelbrett isär',
      'Sträck dig ner och ta tag i tårna',
      'Sjunk ner i djup knäböjsposition',
      'Håll tag i tårna',
      'Sträck benen medan du håller tårna',
      'Känn stretch i baksida lår, sedan sjunk tillbaka till knäböj'
    ],
    techniquePoints: ['Great dynamic warm-up', 'Combines mobility patterns', 'Gradual progression', 'Good assessment tool'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Knee injury'],
      precautions: ['Back pain - reduce range', 'Knee pain - modify depth'],
      redFlags: ['Radiating pain', 'Loss of balance'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip and spine',
      targetStructure: 'Dynamic hip and hamstring mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Partial range'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Releasing toes', 'Back rounding'] }
    },
    evidenceBase: { level: 'B', source: 'Functional movement assessment', studyType: 'Clinical practice' }
  },

  {
    id: 'lumbar_deadlift_pattern',
    baseName: 'Deadlift Pattern',
    baseNameSv: 'Marklyftmönster',
    description: 'Fundamental hip hinge lifting pattern',
    descriptionSv: 'Grundläggande höftgångjärn lyftningsmönster',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteus_maximus', 'hamstrings', 'erector_spinae', 'quadriceps'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'kettlebell', 'dumbbells', 'barbell'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 8, max: 12 },
    baseSets: { min: 2, max: 4 },
    baseHoldSeconds: 0,
    baseRestSeconds: 90,
    instructions: [
      'Stand with feet hip width apart',
      'Weight in front of body or at sides',
      'Brace core and maintain flat back',
      'Hinge at hips to lower weight',
      'Keep weight close to body',
      'Drive through hips and stand'
    ],
    instructionsSv: [
      'Stå med fötterna höftbrett isär',
      'Vikt framför kroppen eller vid sidorna',
      'Spänn core och behåll platt rygg',
      'Gångjärn vid höfterna för att sänka vikten',
      'Håll vikten nära kroppen',
      'Driv genom höfterna och stå'
    ],
    techniquePoints: ['Flat back essential', 'Hip dominant movement', 'Weight stays close', 'Functional lifting pattern'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Severe back pain'],
      precautions: ['Back pain - bodyweight first', 'Master pattern before load'],
      redFlags: ['Back rounding', 'Radiating symptoms'],
      maxPainDuring: 3,
      maxPainAfter24h: 3,
      healingTissue: 'Posterior chain',
      targetStructure: 'Full hip extensors, erectors',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Bodyweight only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 12, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 2, formScore: 90 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back rounding', 'Knee dominant'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Spine biomechanics', studyType: 'Biomechanical research' }
  },

  // ============================================
  // NERVE GLIDING EXERCISES
  // ============================================
  {
    id: 'lumbar_sciatic_nerve_floss',
    baseName: 'Sciatic Nerve Flossing',
    baseNameSv: 'Ischiasnerv Flossing',
    description: 'Neural mobilization for sciatic nerve',
    descriptionSv: 'Neural mobilisering för ischiasnerven',
    bodyRegion: 'lumbar',
    muscleGroups: ['hamstrings', 'gluteals'],
    jointType: 'hip',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'supine'],
    baseEquipment: 'chair',
    allowedEquipment: ['chair', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Sit at edge of chair',
      'Extend one leg straight',
      'Flex ankle (toes toward shin)',
      'Simultaneously look down (chin to chest)',
      'Then point toes and look up',
      'Create sliding motion along nerve'
    ],
    instructionsSv: [
      'Sitt på kanten av stolen',
      'Sträck ut ett ben rakt',
      'Böj fotleden (tår mot smalbenet)',
      'Titta samtidigt ner (haka mot bröst)',
      'Sedan peka med tårna och titta upp',
      'Skapa en glidande rörelse längs nerven'
    ],
    techniquePoints: ['Sliding not stretching', 'Pain-free range only', 'Coordinate movements', 'Gentle continuous motion'],
    safetyData: {
      contraindications: ['Acute radiculopathy', 'Cauda equina syndrome'],
      precautions: ['Severe sciatica - reduce range', 'Tingling - reduce intensity'],
      redFlags: ['Increased numbness', 'Weakness', 'Bladder changes'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Sciatic nerve',
      targetStructure: 'Neural tissue mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy', 'Laminectomy'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Stretching instead of sliding'] }
    },
    evidenceBase: { level: 'A', source: 'Shacklock M. Neurodynamics. Elsevier, 2005', studyType: 'Clinical research' }
  },

  {
    id: 'lumbar_slump_stretch',
    baseName: 'Slump Stretch',
    baseNameSv: 'Slump Stretch',
    description: 'Neural tension test position for nerve mobility',
    descriptionSv: 'Neuralt spänningstest för nervmobilitet',
    bodyRegion: 'lumbar',
    muscleGroups: ['hamstrings', 'spinal_extensors'],
    jointType: 'spine',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'chair',
    allowedEquipment: ['chair', 'bench'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right', 'bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,
    instructions: [
      'Sit on edge of chair',
      'Slump forward, rounding spine',
      'Drop chin to chest',
      'Extend one knee',
      'Dorsiflex ankle',
      'Release neck to reduce tension if needed'
    ],
    instructionsSv: [
      'Sitt på kanten av stolen',
      'Sjunk framåt, runda ryggen',
      'Sänk hakan mot bröstet',
      'Sträck ut ett knä',
      'Dorsiflex fotleden',
      'Släpp nacken för att minska spänning vid behov'
    ],
    techniquePoints: ['Controlled neural tension', 'Use neck position to modulate', 'Not a hamstring stretch', 'Respect symptoms'],
    safetyData: {
      contraindications: ['Acute radiculopathy', 'Spinal cord pathology'],
      precautions: ['Mild symptoms only', 'Progress gradually'],
      redFlags: ['Bilateral symptoms', 'Weakness', 'Bladder/bowel changes'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Neural structures',
      targetStructure: 'Dura and nerve roots',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Gentle only'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Overstretching'] }
    },
    evidenceBase: { level: 'A', source: 'Butler DS. Mobilisation of the Nervous System. Churchill Livingstone, 1991', studyType: 'Clinical research' }
  },

  // ============================================
  // SI JOINT EXERCISES
  // ============================================
  {
    id: 'lumbar_si_joint_mobilization',
    baseName: 'SI Joint Mobilization',
    baseNameSv: 'SI-led Mobilisering',
    description: 'Gentle mobilization for sacroiliac joint',
    descriptionSv: 'Försiktig mobilisering för sakroiliakaleden',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteals', 'piriformis'],
    jointType: 'sacroiliac',
    exerciseType: 'mobility',
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
      'Lie on back, knees bent',
      'Cross one ankle over opposite knee',
      'Gently let crossed knee fall outward',
      'Feel gentle stretch in hip',
      'Return to start',
      'Repeat with control'
    ],
    instructionsSv: [
      'Ligg på rygg, knän böjda',
      'Korsa en fotled över motsatt knä',
      'Låt försiktigt det korsade knäet falla utåt',
      'Känn försiktig stretch i höften',
      'Återgå till start',
      'Upprepa med kontroll'
    ],
    techniquePoints: ['Gentle movement only', 'Do not force', 'Feel at SI region', 'Small movements'],
    safetyData: {
      contraindications: ['SI joint instability', 'Acute SI joint inflammation'],
      precautions: ['Pregnancy - modify position', 'Hip pathology'],
      redFlags: ['Sharp pain at SI joint', 'Clicking with pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'SI joint',
      targetStructure: 'Sacroiliac joint mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 75 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Forcing movement'] }
    },
    evidenceBase: { level: 'B', source: 'Vleeming A. Movement, Stability & Lumbopelvic Pain. Churchill Livingstone, 2007', studyType: 'Clinical research' }
  },

  {
    id: 'lumbar_pelvic_clock',
    baseName: 'Pelvic Clock',
    baseNameSv: 'Bäckenklocka',
    description: 'Controlled pelvic movement in all planes',
    descriptionSv: 'Kontrollerad bäckenrörelse i alla plan',
    bodyRegion: 'lumbar',
    muscleGroups: ['abdominals', 'gluteals', 'hip_flexors'],
    jointType: 'lumbar_spine',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back, knees bent',
      'Imagine pelvis as a clock face',
      'Tilt to 12 o\'clock (flatten back)',
      'Tilt to 6 o\'clock (arch back)',
      'Tilt to 3 and 9 o\'clock (side to side)',
      'Circle around entire clock face smoothly'
    ],
    instructionsSv: [
      'Ligg på rygg, knän böjda',
      'Föreställ dig bäckenet som en urtavla',
      'Tippa mot kl 12 (platta till ryggen)',
      'Tippa mot kl 6 (svanka ryggen)',
      'Tippa mot kl 3 och 9 (sida till sida)',
      'Cirkulera runt hela urtavlan mjukt'
    ],
    techniquePoints: ['Small controlled movements', 'Isolate pelvis', 'Feel each position', 'Great for awareness'],
    safetyData: {
      contraindications: ['Acute disc herniation with radiculopathy'],
      precautions: ['Spine conditions - limit range', 'Stay pain-free'],
      redFlags: ['Radiating symptoms', 'Increased pain'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Pelvic motor control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Moving from hips/legs'] }
    },
    evidenceBase: { level: 'B', source: 'Feldenkrais Method. Awareness Through Movement', studyType: 'Movement method' }
  },

  // ============================================
  // PIRIFORMIS & HIP ROTATOR EXERCISES
  // ============================================
  {
    id: 'lumbar_piriformis_stretch_supine',
    baseName: 'Piriformis Stretch Supine',
    baseNameSv: 'Piriformis Stretch Ryggliggande',
    description: 'Figure-4 stretch for piriformis muscle',
    descriptionSv: 'Fyra-sträck för piriformismuskeln',
    bodyRegion: 'lumbar',
    muscleGroups: ['piriformis', 'gluteals'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 2, max: 3 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Lie on back',
      'Cross ankle over opposite knee',
      'Pull bottom thigh toward chest',
      'Feel stretch deep in buttock',
      'Keep head on floor',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Ligg på rygg',
      'Korsa fotleden över motsatt knä',
      'Dra nedre låret mot bröstet',
      'Känn stretch djupt i skinkan',
      'Håll huvudet på golvet',
      'Håll och andas'
    ],
    techniquePoints: ['Feel in deep buttock', 'Relax into stretch', 'Do not force', 'Common sciatica relief'],
    safetyData: {
      contraindications: ['Hip replacement - check protocol', 'Acute hip injury'],
      precautions: ['Knee pain - use strap', 'Back flat on floor'],
      redFlags: ['Increased radiating pain', 'Numbness worsening'],
      maxPainDuring: 4,
      maxPainAfter24h: 2,
      healingTissue: 'Piriformis muscle',
      targetStructure: 'Piriformis, deep hip rotators',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle only'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 3, minConsecutiveDays: 7, maxPainDuring: 3, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Lifting head', 'Forcing stretch'] }
    },
    evidenceBase: { level: 'B', source: 'Fishman LM. Piriformis syndrome. Arch Phys Med Rehabil, 2002', studyType: 'Clinical study' }
  },

  {
    id: 'lumbar_seated_piriformis_stretch',
    baseName: 'Seated Piriformis Stretch',
    baseNameSv: 'Sittande Piriformis Stretch',
    description: 'Office-friendly piriformis stretch',
    descriptionSv: 'Kontorsvänlig piriformisstretch',
    bodyRegion: 'lumbar',
    muscleGroups: ['piriformis', 'gluteals'],
    jointType: 'hip',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'chair',
    allowedEquipment: ['chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 2, max: 3 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Sit upright in chair',
      'Cross ankle over opposite knee',
      'Keep spine tall',
      'Lean forward from hips',
      'Feel stretch in buttock',
      'Hold and breathe'
    ],
    instructionsSv: [
      'Sitt upprätt i stolen',
      'Korsa fotleden över motsatt knä',
      'Håll ryggraden lång',
      'Luta framåt från höfterna',
      'Känn stretch i skinkan',
      'Håll och andas'
    ],
    techniquePoints: ['Good for office breaks', 'Maintain upright spine', 'Hinge from hips', 'Easy to do anywhere'],
    safetyData: {
      contraindications: ['Hip replacement - check protocol'],
      precautions: ['Knee pain - modify', 'Gentle lean only'],
      redFlags: ['Radiating symptoms worsen'],
      maxPainDuring: 4,
      maxPainAfter24h: 2,
      healingTissue: 'Piriformis muscle',
      targetStructure: 'Piriformis, deep hip rotators',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 3, minConsecutiveDays: 5, maxPainDuring: 3, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Rounding spine'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // SPINAL STENOSIS SPECIFIC
  // ============================================
  {
    id: 'lumbar_stenosis_flexion_relief',
    baseName: 'Stenosis Flexion Relief',
    baseNameSv: 'Stenos Flexionslindring',
    description: 'Flexion-based position for stenosis relief',
    descriptionSv: 'Flexionsbaserad position för stenoslindring',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat', 'chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back',
      'Bring both knees to chest',
      'Wrap arms around knees',
      'Gently pull knees closer',
      'Feel lower back round and open',
      'Hold, breathe, relax into position'
    ],
    instructionsSv: [
      'Ligg på rygg',
      'Dra båda knäna mot bröstet',
      'Omfamna knäna med armarna',
      'Dra försiktigt knäna närmare',
      'Känn hur ländryggen rundas och öppnas',
      'Håll, andas, slappna av i positionen'
    ],
    techniquePoints: ['Opens spinal canal', 'Relieves stenosis symptoms', 'Use frequently', 'Can do in chair'],
    safetyData: {
      contraindications: ['Disc herniation preferring extension', 'Acute disc prolapse'],
      precautions: ['Disc issues - be careful', 'Hip problems - modify grip'],
      redFlags: ['Increased leg symptoms', 'New numbness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Spinal canal opening',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Laminectomy'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Pulling too hard'] }
    },
    evidenceBase: { level: 'A', source: 'Whitman JM. Spinal stenosis clinical practice guideline. JOSPT, 2012', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'lumbar_stationary_bike_stenosis',
    baseName: 'Stationary Bike for Stenosis',
    baseNameSv: 'Motionscykel för Stenos',
    description: 'Flexed posture cycling for stenosis conditioning',
    descriptionSv: 'Framåtlutad cykling för stenoskonditionering',
    bodyRegion: 'lumbar',
    muscleGroups: ['quadriceps', 'hamstrings', 'cardiovascular'],
    jointType: 'multi_joint',
    exerciseType: 'cardio',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'stationary_bike',
    allowedEquipment: ['stationary_bike', 'recumbent_bike'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 1, max: 1 },
    baseHoldSeconds: 600,
    baseRestSeconds: 0,
    instructions: [
      'Adjust bike seat for comfort',
      'Slight forward lean opens spinal canal',
      'Start with low resistance',
      'Pedal at comfortable pace',
      'Maintain flexed spine position',
      'Progress duration before intensity'
    ],
    instructionsSv: [
      'Justera cykelsadeln för komfort',
      'Lätt framåtlutning öppnar spinalkanalen',
      'Börja med lågt motstånd',
      'Trampa i bekväm takt',
      'Behåll böjd ryggposition',
      'Öka tid före intensitet'
    ],
    techniquePoints: ['Flexion relieves stenosis', 'Great cardiovascular option', 'Pain-free exercise', 'Can do longer durations'],
    safetyData: {
      contraindications: ['Unable to sit on bike', 'Severe cardiac issues'],
      precautions: ['Start with low intensity', 'Progress slowly'],
      redFlags: ['Chest pain', 'Severe leg pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Cardiovascular system',
      targetStructure: 'Aerobic conditioning with stenosis',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very low intensity'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Laminectomy', 'Spinal fusion'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Upright posture causing symptoms'] }
    },
    evidenceBase: { level: 'A', source: 'Fritz JM. Conservative treatment for lumbar spinal stenosis. Spine, 2014', studyType: 'Clinical trial' }
  },

  // ============================================
  // MOTOR CONTROL EXERCISES
  // ============================================
  {
    id: 'lumbar_abdominal_hollowing',
    baseName: 'Abdominal Hollowing',
    baseNameSv: 'Magmuskel Hollowing',
    description: 'Transverse abdominis activation exercise',
    descriptionSv: 'Aktiveringsövning för transversus abdominis',
    bodyRegion: 'lumbar',
    muscleGroups: ['transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'supine',
    allowedPositions: ['supine', 'quadruped', 'prone'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat', 'biofeedback_unit'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 10,
    baseRestSeconds: 5,
    instructions: [
      'Lie on back with knees bent',
      'Find neutral spine position',
      'Gently draw belly button toward spine',
      'Do not flatten back or tilt pelvis',
      'Breathe normally during hold',
      'Release and repeat'
    ],
    instructionsSv: [
      'Ligg på rygg med knän böjda',
      'Hitta neutral ryggposition',
      'Dra försiktigt naveln mot ryggraden',
      'Platta inte till ryggen eller tippa bäckenet',
      'Andas normalt under hållningen',
      'Släpp och upprepa'
    ],
    techniquePoints: ['Subtle activation', 'No global muscle substitution', 'Maintain breathing', 'Foundation for stability'],
    safetyData: {
      contraindications: ['None specific'],
      precautions: ['Do not brace - gentle activation only'],
      redFlags: ['Pain during exercise'],
      maxPainDuring: 1,
      maxPainAfter24h: 0,
      healingTissue: 'Motor control',
      targetStructure: 'Transverse abdominis',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Very gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All lumbar surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 85 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Breath holding', 'Global bracing'] }
    },
    evidenceBase: { level: 'A', source: 'Richardson C. Therapeutic Exercise for Spinal Stabilisation. Churchill Livingstone, 2004', studyType: 'Research synthesis' }
  },

  {
    id: 'lumbar_heel_slide',
    baseName: 'Heel Slide',
    baseNameSv: 'Hälglidning',
    description: 'Core stability with leg movement challenge',
    descriptionSv: 'Core-stabilitet med benrörelseutmaning',
    bodyRegion: 'lumbar',
    muscleGroups: ['transverse_abdominis', 'hip_flexors'],
    jointType: 'hip',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 30,
    instructions: [
      'Lie on back, knees bent',
      'Activate transverse abdominis',
      'Slowly slide one heel away along floor',
      'Extend leg while maintaining neutral spine',
      'Slide heel back to start',
      'Maintain core activation throughout'
    ],
    instructionsSv: [
      'Ligg på rygg, knän böjda',
      'Aktivera transversus abdominis',
      'Glid långsamt en häl bort längs golvet',
      'Sträck benet medan neutral rygg behålls',
      'Glid hälen tillbaka till start',
      'Behåll core-aktivering hela tiden'
    ],
    techniquePoints: ['Spine should not move', 'Control is key', 'Progress range slowly', 'Early stability exercise'],
    safetyData: {
      contraindications: ['Acute back pain'],
      precautions: ['Reduce range if spine moves', 'Go slowly'],
      redFlags: ['Pain during exercise'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Core stability',
      targetStructure: 'Lumbar motor control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Small range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Pelvis tilting'] }
    },
    evidenceBase: { level: 'B', source: 'Richardson C. Therapeutic Exercise for Spinal Stabilisation', studyType: 'Clinical method' }
  },

  {
    id: 'lumbar_dying_bug',
    baseName: 'Dying Bug',
    baseNameSv: 'Döende Insekt',
    description: 'Contralateral limb lowering with core stability',
    descriptionSv: 'Kontralateral extremitetssänkning med core-stabilitet',
    bodyRegion: 'lumbar',
    muscleGroups: ['rectus_abdominis', 'transverse_abdominis', 'hip_flexors'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 45,
    instructions: [
      'Lie on back, arms pointing to ceiling',
      'Bring knees up to 90 degrees',
      'Brace core - flatten back to floor',
      'Lower opposite arm and leg toward floor',
      'Return to start without back arching',
      'Alternate sides with control'
    ],
    instructionsSv: [
      'Ligg på rygg, armar pekande mot taket',
      'Lyft knäna till 90 grader',
      'Spänn core - tryck ryggen mot golvet',
      'Sänk motsatt arm och ben mot golvet',
      'Återgå till start utan att ryggen svankar',
      'Växla sidor med kontroll'
    ],
    techniquePoints: ['Back must stay flat', 'Lower only as far as control allows', 'Great progression from heel slides', 'Breathe throughout'],
    safetyData: {
      contraindications: ['Acute back pain', 'Diastasis recti'],
      precautions: ['Reduce range if back arches', 'Build up gradually'],
      redFlags: ['Back pain during exercise', 'Doming of abdomen'],
      maxPainDuring: 2,
      maxPainAfter24h: 2,
      healingTissue: 'Core stability',
      targetStructure: 'Core anti-extension strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching', 'Breath holding'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Low Back Disorders', studyType: 'Biomechanical research' }
  },

  // ============================================
  // ROTATION EXERCISES
  // ============================================
  {
    id: 'lumbar_lumbar_rotation_supine',
    baseName: 'Lumbar Rotation Supine',
    baseNameSv: 'Lumbal Rotation Ryggliggande',
    description: 'Gentle supine rotational stretch',
    descriptionSv: 'Försiktig rotationsstretch ryggliggande',
    bodyRegion: 'lumbar',
    muscleGroups: ['obliques', 'quadratus_lumborum', 'erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Lie on back, knees bent together',
      'Arms out to sides for support',
      'Slowly drop both knees to one side',
      'Keep shoulders on floor',
      'Feel rotation in lower back',
      'Hold, then return and repeat other side'
    ],
    instructionsSv: [
      'Ligg på rygg, knän böjda tillsammans',
      'Armarna ut åt sidorna för stöd',
      'Sänk långsamt båda knäna åt en sida',
      'Håll axlarna på golvet',
      'Känn rotation i ländryggen',
      'Håll, återgå och upprepa andra sidan'
    ],
    techniquePoints: ['Gentle stretch', 'Shoulders stay down', 'Control the movement', 'Great morning stretch'],
    safetyData: {
      contraindications: ['Acute disc herniation', 'Spondylolisthesis'],
      precautions: ['Reduce range if painful', 'Go slowly'],
      redFlags: ['Radiating pain', 'Sharp pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Lumbar spine',
      targetStructure: 'Rotational mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Very small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Discectomy'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 7, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Shoulder lifting'] }
    },
    evidenceBase: { level: 'B', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  {
    id: 'lumbar_seated_rotation',
    baseName: 'Seated Lumbar Rotation',
    baseNameSv: 'Sittande Lumbal Rotation',
    description: 'Seated rotational stretch with support',
    descriptionSv: 'Sittande rotationsstretch med stöd',
    bodyRegion: 'lumbar',
    muscleGroups: ['obliques', 'erector_spinae'],
    jointType: 'lumbar_spine',
    exerciseType: 'stretch',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'chair',
    allowedEquipment: ['chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 20,
    baseRestSeconds: 10,
    instructions: [
      'Sit upright in chair',
      'Cross arms over chest',
      'Rotate torso to one side',
      'Use chair back for gentle assist',
      'Feel rotation through spine',
      'Return and repeat other side'
    ],
    instructionsSv: [
      'Sitt upprätt i stolen',
      'Korsa armarna över bröstet',
      'Rotera bålen åt en sida',
      'Använd stolsryggen för försiktig assistans',
      'Känn rotation genom ryggraden',
      'Återgå och upprepa andra sidan'
    ],
    techniquePoints: ['Keep hips facing forward', 'Rotation from thoracic primarily', 'Good for office breaks', 'Control throughout'],
    safetyData: {
      contraindications: ['Acute disc problem', 'Spinal instability'],
      precautions: ['Gentle rotation only', 'Stay in pain-free range'],
      redFlags: ['Radiating symptoms', 'Sharp pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Spine',
      targetStructure: 'Spinal rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Small range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Forcing rotation'] }
    },
    evidenceBase: { level: 'C', source: 'Clinical practice consensus', studyType: 'Expert opinion' }
  },

  // ============================================
  // BREATHING EXERCISES
  // ============================================
  {
    id: 'lumbar_diaphragmatic_breathing',
    baseName: 'Diaphragmatic Breathing',
    baseNameSv: 'Diafragmaandning',
    description: 'Deep breathing for core and pain management',
    descriptionSv: 'Djupandning för core och smärthantering',
    bodyRegion: 'lumbar',
    muscleGroups: ['diaphragm', 'transverse_abdominis'],
    jointType: 'spine',
    exerciseType: 'breathing',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 0,
    instructions: [
      'Place one hand on chest, one on belly',
      'Breathe in slowly through nose',
      'Feel belly rise, chest stays still',
      'Exhale slowly through pursed lips',
      'Feel belly fall',
      'Repeat with slow controlled rhythm'
    ],
    instructionsSv: [
      'Placera en hand på bröstet, en på magen',
      'Andas in långsamt genom näsan',
      'Känn magen höjas, bröstet är stilla',
      'Andas ut långsamt genom spetsade läppar',
      'Känn magen sänkas',
      'Upprepa med långsam kontrollerad rytm'
    ],
    techniquePoints: ['Belly should move, not chest', 'Slow controlled breaths', 'Activates diaphragm', 'Calms nervous system'],
    safetyData: {
      contraindications: ['None'],
      precautions: ['Dizziness - breathe normally'],
      redFlags: ['Hyperventilation'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Diaphragm',
      targetStructure: 'Breathing mechanics',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All surgeries'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 3, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Chest breathing'] }
    },
    evidenceBase: { level: 'A', source: 'Hodges PW. Diaphragm function and LBP. JOSPT, 2019', studyType: 'Research review' }
  },

  {
    id: 'lumbar_crocodile_breathing',
    baseName: 'Crocodile Breathing',
    baseNameSv: 'Krokodilsandning',
    description: 'Prone breathing for diaphragm activation',
    descriptionSv: 'Magliggande andning för diafragmaaktivering',
    bodyRegion: 'lumbar',
    muscleGroups: ['diaphragm', 'core'],
    jointType: 'spine',
    exerciseType: 'breathing',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'mat',
    allowedEquipment: ['mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 0,
    instructions: [
      'Lie face down',
      'Rest forehead on stacked hands',
      'Breathe into belly against floor',
      'Feel back and sides expand',
      'Exhale and feel belly flatten',
      'Continue with relaxed breathing'
    ],
    instructionsSv: [
      'Ligg på magen',
      'Vila pannan på staplade händer',
      'Andas in mot magen mot golvet',
      'Känn rygg och sidor expandera',
      'Andas ut och känn magen plattas till',
      'Fortsätt med avslappnad andning'
    ],
    techniquePoints: ['Floor provides feedback', 'Feel 360 degree expansion', 'Great for learning belly breathing', 'Relaxing position'],
    safetyData: {
      contraindications: ['Cannot lie prone'],
      precautions: ['Neck issues - turn head', 'Pregnancy - not recommended'],
      redFlags: ['None'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Breathing mechanics',
      targetStructure: 'Diaphragm',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Chest breathing'] }
    },
    evidenceBase: { level: 'B', source: 'DNS - Dynamic Neuromuscular Stabilization', studyType: 'Movement method' }
  },

  // ============================================
  // AQUATIC EXERCISES
  // ============================================
  {
    id: 'lumbar_pool_walking',
    baseName: 'Pool Walking',
    baseNameSv: 'Bassänggång',
    description: 'Water-based walking for reduced spinal load',
    descriptionSv: 'Vattenbaserad gång för minskad spinalbelastning',
    bodyRegion: 'lumbar',
    muscleGroups: ['hip_flexors', 'quadriceps', 'gluteals', 'core'],
    jointType: 'multi_joint',
    exerciseType: 'cardio',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'pool',
    allowedEquipment: ['pool'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 1, max: 1 },
    baseSets: { min: 1, max: 1 },
    baseHoldSeconds: 600,
    baseRestSeconds: 0,
    instructions: [
      'Enter pool with water at chest height',
      'Walk forward with normal gait',
      'Pump arms normally',
      'Maintain upright posture',
      'Progress to walking backward',
      'Add sidesteps for variety'
    ],
    instructionsSv: [
      'Gå ner i bassängen med vattnet vid brösthöjd',
      'Gå framåt med normalt gångmönster',
      'Pumpa armarna normalt',
      'Behåll upprätt hållning',
      'Utveckla till att gå bakåt',
      'Lägg till sidosteg för variation'
    ],
    techniquePoints: ['Buoyancy reduces spinal load', 'Resistance builds strength', 'Great for acute back pain', 'Early return to activity'],
    safetyData: {
      contraindications: ['Open wounds', 'Severe cardiac issues', 'Fear of water'],
      precautions: ['Non-swimmer - stay shallow', 'Monitor fatigue'],
      redFlags: ['Chest pain', 'Severe dizziness'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'General conditioning',
      targetStructure: 'Cardiovascular and musculoskeletal',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['After wound healed'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All lumbar surgeries'],
      progressionCriteria: { minPainFreeReps: 1, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 75 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Limping', 'Leaning'] }
    },
    evidenceBase: { level: 'A', source: 'Camilotti BM. Aquatic exercises for LBP. Cochrane, 2018', studyType: 'Systematic review' }
  },

  {
    id: 'lumbar_pool_flutter_kicks',
    baseName: 'Pool Flutter Kicks',
    baseNameSv: 'Bassäng Fladdersparkar',
    description: 'Water-based hip and core exercise',
    descriptionSv: 'Vattenbaserad höft- och coreövning',
    bodyRegion: 'lumbar',
    muscleGroups: ['hip_flexors', 'gluteals', 'core'],
    jointType: 'hip',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'pool',
    allowedEquipment: ['pool', 'pool_noodle'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 20, max: 30 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 0,
    baseRestSeconds: 60,
    instructions: [
      'Hold pool edge or use noodle for support',
      'Float body horizontal',
      'Kick legs alternately up and down',
      'Small controlled kicks',
      'Keep core engaged',
      'Maintain straight body position'
    ],
    instructionsSv: [
      'Håll i bassängkanten eller använd noodle för stöd',
      'Flyta kroppen horisontellt',
      'Sparka benen växelvis upp och ner',
      'Små kontrollerade sparkar',
      'Håll core aktiverat',
      'Behåll rak kroppsposition'
    ],
    techniquePoints: ['Water provides resistance', 'Small kicks from hip', 'Core stability challenge', 'Great hip flexor strengthening'],
    safetyData: {
      contraindications: ['Hip precautions', 'Unable to float'],
      precautions: ['Back pain - reduce kick range', 'Use support'],
      redFlags: ['Increased back pain', 'Hip pain'],
      maxPainDuring: 3,
      maxPainAfter24h: 2,
      healingTissue: 'Hip flexors, core',
      targetStructure: 'Hip and core strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Gentle kicks'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 30, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Back arching'] }
    },
    evidenceBase: { level: 'B', source: 'Aquatic rehabilitation principles', studyType: 'Clinical practice' }
  },

  // ============================================
  // BALANCE & PROPRIOCEPTION
  // ============================================
  {
    id: 'lumbar_single_leg_stance',
    baseName: 'Single Leg Stance',
    baseNameSv: 'Enbensbalans',
    description: 'Basic balance and proprioception exercise',
    descriptionSv: 'Grundläggande balans- och proprioceptionsövning',
    bodyRegion: 'lumbar',
    muscleGroups: ['gluteus_medius', 'core', 'ankle_stabilizers'],
    jointType: 'multi_joint',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: [
      'Stand near support if needed',
      'Shift weight to one leg',
      'Lift other foot off floor',
      'Maintain upright posture',
      'Hold balance as long as possible',
      'Progress to eyes closed'
    ],
    instructionsSv: [
      'Stå nära stöd vid behov',
      'Flytta vikten till ett ben',
      'Lyft andra foten från golvet',
      'Behåll upprätt hållning',
      'Håll balansen så länge som möjligt',
      'Utveckla till stängda ögon'
    ],
    techniquePoints: ['Key for lumbar stability', 'Progress removing support', 'Challenge with unstable surface', 'Functional exercise'],
    safetyData: {
      contraindications: ['Severe balance issues without support'],
      precautions: ['Fall risk - use support', 'Progress slowly'],
      redFlags: ['Falls', 'Severe dizziness'],
      maxPainDuring: 2,
      maxPainAfter24h: 1,
      healingTissue: 'Proprioceptive system',
      targetStructure: 'Balance and hip stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['With support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip hiking', 'Trunk lean'] }
    },
    evidenceBase: { level: 'B', source: 'Balance training research', studyType: 'Clinical studies' }
  },

  {
    id: 'lumbar_tandem_stance',
    baseName: 'Tandem Stance',
    baseNameSv: 'Tandemstående',
    description: 'Heel-to-toe standing balance',
    descriptionSv: 'Häl-till-tå stående balans',
    bodyRegion: 'lumbar',
    muscleGroups: ['core', 'ankle_stabilizers', 'gluteals'],
    jointType: 'multi_joint',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'chair'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: [
      'Stand with heel of front foot touching toes of back foot',
      'Align feet in straight line',
      'Arms at sides or crossed',
      'Maintain balance',
      'Switch which foot is forward',
      'Progress to eyes closed'
    ],
    instructionsSv: [
      'Stå med hälen på framfoten mot tårna på bakfoten',
      'Rikta fötterna i rak linje',
      'Armar vid sidorna eller korsade',
      'Håll balansen',
      'Byt vilken fot som är framför',
      'Utveckla till stängda ögon'
    ],
    techniquePoints: ['Narrow base challenges stability', 'Test of vestibular function', 'Progress to walking tandem', 'Common clinical test'],
    safetyData: {
      contraindications: ['Severe balance impairment'],
      precautions: ['Fall risk - have support nearby', 'Go slowly'],
      redFlags: ['Falls', 'Persistent dizziness'],
      maxPainDuring: 1,
      maxPainAfter24h: 0,
      healingTissue: 'Balance system',
      targetStructure: 'Vestibular and proprioceptive systems',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['With support'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Wide stance', 'Arms flailing'] }
    },
    evidenceBase: { level: 'B', source: 'Balance assessment literature', studyType: 'Clinical practice' }
  },

  // ============================================
  // POSTURE CORRECTION
  // ============================================
  {
    id: 'lumbar_wall_posture_check',
    baseName: 'Wall Posture Check',
    baseNameSv: 'Vägg Hållningskontroll',
    description: 'Postural alignment awareness exercise',
    descriptionSv: 'Hållningsmedvetenhetsövning',
    bodyRegion: 'lumbar',
    muscleGroups: ['erector_spinae', 'core', 'gluteals'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 15,
    instructions: [
      'Stand with back against wall',
      'Heels about 4 inches from wall',
      'Touch wall with buttocks, shoulders, and head',
      'Check space behind lower back',
      'Should fit flat hand, not fist',
      'Practice maintaining this posture'
    ],
    instructionsSv: [
      'Stå med ryggen mot väggen',
      'Hälar ca 10 cm från väggen',
      'Nudda väggen med skinkor, axlar och huvud',
      'Kontrollera utrymmet bakom ländryggen',
      'Ska rymma platt hand, inte knytnäve',
      'Öva på att behålla denna hållning'
    ],
    techniquePoints: ['Assessment and training', 'Establishes neutral spine', 'Good awareness tool', 'Can repeat throughout day'],
    safetyData: {
      contraindications: ['None'],
      precautions: ['Kyphosis - may not touch head', 'Do not force position'],
      redFlags: ['Pain in position'],
      maxPainDuring: 1,
      maxPainAfter24h: 0,
      healingTissue: 'Postural muscles',
      targetStructure: 'Postural awareness',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All surgeries'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 3, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Forcing position'] }
    },
    evidenceBase: { level: 'B', source: 'Postural assessment literature', studyType: 'Clinical practice' }
  },

  {
    id: 'lumbar_brugger_relief_position',
    baseName: 'Brugger Relief Position',
    baseNameSv: 'Brugger Avlastningsposition',
    description: 'Postural reset for prolonged sitting',
    descriptionSv: 'Hållningsåterställning för långvarigt sittande',
    bodyRegion: 'lumbar',
    muscleGroups: ['rhomboids', 'lower_trapezius', 'erector_spinae'],
    jointType: 'spine',
    exerciseType: 'isometric',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'chair',
    allowedEquipment: ['chair'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 10,
    baseRestSeconds: 5,
    instructions: [
      'Sit at edge of chair',
      'Feet shoulder width apart, turned slightly out',
      'Roll pelvis forward, create lumbar curve',
      'Lift sternum, draw shoulders back',
      'Turn palms forward, spread fingers',
      'Hold this open position'
    ],
    instructionsSv: [
      'Sitt på kanten av stolen',
      'Fötterna axelbrett isär, lätt utåtvridna',
      'Rulla bäckenet framåt, skapa lumbar kurva',
      'Lyft bröstbenet, dra axlarna bakåt',
      'Vrid handflatorna framåt, spreta fingrarna',
      'Håll denna öppna position'
    ],
    techniquePoints: ['Counteracts slouching', 'Do every 20-30 minutes', 'Resets posture quickly', 'Great for office workers'],
    safetyData: {
      contraindications: ['None'],
      precautions: ['Shoulder issues - modify arm position'],
      redFlags: ['Pain in position'],
      maxPainDuring: 0,
      maxPainAfter24h: 0,
      healingTissue: 'Postural muscles',
      targetStructure: 'Posture reset',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['All surgeries'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: false, compensationPatterns: ['None'] }
    },
    evidenceBase: { level: 'B', source: 'Brugger postural method', studyType: 'Clinical method' }
  }
];

export default lumbarTemplates;
