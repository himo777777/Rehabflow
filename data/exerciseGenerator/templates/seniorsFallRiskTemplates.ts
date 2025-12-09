/**
 * Seniors Fall Risk Exercise Templates
 *
 * Evidence-based exercises for older adults at risk of falls
 * Based on: Otago Exercise Programme, FAME, CDC STEADI, ProFaNE guidelines
 */

import { BaseExerciseTemplate } from '../types';

export const seniorsFallRiskTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // OTAGO EXERCISE PROGRAMME - STRENGTH
  // ============================================
  {
    id: 'senior_otago_knee_extensor',
    baseName: 'Otago Knee Extensor Strengthening',
    baseNameSv: 'Otago Knästräckning',
    description: 'Seated knee extension for quadriceps strength - fall prevention',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'ankle_weight_light', 'ankle_weight_medium'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Acute knee injury', 'Severe knee OA flare'],
      precautions: ['Support if needed', 'Pain-free range'],
      redFlags: ['Knee pain', 'Swelling'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'independent_after_training'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'No weight' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Light weight' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Campbell AJ. Otago Exercise Programme. Age Ageing 1997',
      studyType: 'RCT - 35% fall reduction'
    }
  },
  {
    id: 'senior_otago_knee_flexor',
    baseName: 'Otago Knee Flexor Strengthening',
    baseNameSv: 'Otago Knäböjning',
    description: 'Standing knee flexion for hamstring strength',
    bodyRegion: 'knee',
    muscleGroups: ['hamstrings'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'chair', 'ankle_weight_light'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Severe balance deficit without support'],
      precautions: ['Hold support', 'Stable surface'],
      redFlags: ['Loss of balance', 'Knee pain'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'With support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Campbell AJ. Otago Exercise Programme. Age Ageing 1997',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_otago_hip_abductor',
    baseName: 'Otago Hip Abductor Strengthening',
    baseNameSv: 'Otago Höftabduktion',
    description: 'Standing hip abduction for lateral stability',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'gluteus_minimus'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing', 'side_lying'],
    allowedEquipment: ['none', 'chair', 'resistance_band_light'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'alternating'],
    safetyData: {
      contraindications: ['Hip replacement precautions active'],
      precautions: ['Hold support when standing', 'Controlled motion'],
      redFlags: ['Hip pain', 'Loss of balance'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Side lying only' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Standing with support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago Exercise Programme - hip stability component',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_otago_calf_raise',
    baseName: 'Otago Calf Raise',
    baseNameSv: 'Otago Tåhävning',
    description: 'Standing calf raise for ankle strength and balance',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['chair', 'wall', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Achilles tendon rupture', 'Severe peripheral neuropathy'],
      precautions: ['Support available', 'Start bilateral'],
      redFlags: ['Calf pain', 'Loss of balance'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Bilateral with support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago Exercise Programme. Age Ageing 1997',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_otago_toe_raise',
    baseName: 'Otago Toe Raise',
    baseNameSv: 'Otago Tålyft',
    description: 'Standing toe raise for shin strength and fall prevention',
    bodyRegion: 'ankle',
    muscleGroups: ['tibialis_anterior'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['chair', 'wall', 'none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe foot drop'],
      precautions: ['Support available', 'Watch for foot catching'],
      redFlags: ['Shin pain', 'Loss of balance'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'independent_after_training'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Seated' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Standing with support' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago Exercise Programme',
      studyType: 'RCT'
    }
  },

  // ============================================
  // OTAGO - BALANCE EXERCISES
  // ============================================
  {
    id: 'senior_otago_tandem_stand',
    baseName: 'Otago Tandem Stand',
    baseNameSv: 'Otago Tandemstående',
    description: 'Heel-to-toe standing for narrow base balance',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'ankle_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'chair', 'wall'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe vestibular disorder', 'Unable to stand'],
      precautions: ['Near support', 'Spotter available'],
      redFlags: ['Dizziness', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'With support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago balance component. Campbell 1997',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_otago_single_leg_stand',
    baseName: 'Otago Single Leg Stand',
    baseNameSv: 'Otago Enbensbalans',
    description: 'Single leg balance with support available',
    bodyRegion: 'core',
    muscleGroups: ['hip_stabilizers', 'ankle_stabilizers', 'core'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['chair', 'wall', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Severe balance disorder', 'Recent fall with injury'],
      precautions: ['Support within reach', 'Safe environment'],
      redFlags: ['Falls', 'Severe instability'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'With hand support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light touch support' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago Exercise Programme. Age Ageing 1997',
      studyType: 'RCT - 35% fall reduction'
    }
  },
  {
    id: 'senior_otago_heel_toe_walk',
    baseName: 'Otago Tandem Walking',
    baseNameSv: 'Otago Tandemgång',
    description: 'Heel-to-toe walking for dynamic balance',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_stabilizers', 'ankle_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'wall', 'parallel_bars'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe ataxia', 'Unable to walk independently'],
      precautions: ['Clear pathway', 'Support available'],
      redFlags: ['Loss of balance', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'With support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago tandem walking component',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_otago_sideways_walk',
    baseName: 'Otago Sideways Walking',
    baseNameSv: 'Otago Sidledesgång',
    description: 'Lateral stepping for hip stability',
    bodyRegion: 'hip',
    muscleGroups: ['gluteus_medius', 'hip_adductors'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'wall', 'resistance_band_light'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe hip pain', 'Unable to side-step'],
      precautions: ['Clear space', 'Support if needed'],
      redFlags: ['Hip pain', 'Loss of balance'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Small steps' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago Exercise Programme',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_otago_backwards_walk',
    baseName: 'Otago Backwards Walking',
    baseNameSv: 'Otago Baklängesgång',
    description: 'Controlled backward walking for balance',
    bodyRegion: 'core',
    muscleGroups: ['hip_extensors', 'core_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'wall', 'parallel_bars'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe balance disorder', 'Cognitive impairment'],
      precautions: ['Clear pathway', 'Spotter behind'],
      redFlags: ['Falls', 'Disorientation'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'moderate',
        hearingRequirement: 'moderate',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'With support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Otago backwards walking component',
      studyType: 'RCT'
    }
  },

  // ============================================
  // CHAIR-BASED EXERCISES
  // ============================================
  {
    id: 'senior_chair_sit_to_stand',
    baseName: 'Chair Sit to Stand',
    baseNameSv: 'Stol Sitt till Stå',
    description: 'Functional sit-to-stand for leg strength and ADL',
    bodyRegion: 'hip',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'core'],
    exerciseType: 'functional',
    allowedPositions: ['sitting'],
    allowedEquipment: ['chair', 'armchair'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe orthostatic hypotension', 'Unable to stand'],
      precautions: ['Sturdy chair', 'Use arms if needed'],
      redFlags: ['Dizziness on standing', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'independent_after_training'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'High seat, arms assist' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Standard height' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'No arms' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: '30-second chair stand test. Jones CJ. Res Q Exerc Sport 1999',
      studyType: 'Validation study'
    }
  },
  {
    id: 'senior_chair_marching',
    baseName: 'Seated Marching',
    baseNameSv: 'Sittande Marsch',
    description: 'Seated hip flexion for cardiovascular and strength',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'quadriceps'],
    exerciseType: 'aerobic',
    allowedPositions: ['sitting'],
    allowedEquipment: ['chair'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['alternating'],
    safetyData: {
      contraindications: ['Severe hip OA flare'],
      precautions: ['Pace as tolerated', 'Support available'],
      redFlags: ['Hip pain', 'Shortness of breath'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'independent'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Small range' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Full range' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'B',
      source: 'Chair-based exercise for seniors. ACSM guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'senior_chair_heel_raises',
    baseName: 'Seated Heel Raises',
    baseNameSv: 'Sittande Hällyft',
    description: 'Seated calf pumping for circulation and strength',
    bodyRegion: 'ankle',
    muscleGroups: ['gastrocnemius', 'soleus'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['chair'],
    allowedDifficulties: ['beginner'],
    allowedLateralities: ['bilateral', 'alternating'],
    safetyData: {
      contraindications: ['DVT active'],
      precautions: ['Seated support'],
      redFlags: ['Calf pain', 'Swelling'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'independent'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Gentle' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Full' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Full' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'B',
      source: 'Seated exercise for DVT prevention. Clinical practice',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'senior_chair_arm_raises',
    baseName: 'Seated Arm Raises',
    baseNameSv: 'Sittande Armlyft',
    description: 'Seated shoulder flexion for upper body mobility',
    bodyRegion: 'shoulder',
    muscleGroups: ['deltoids', 'rotator_cuff'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'light_weights'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Acute shoulder injury'],
      precautions: ['Pain-free range', 'Avoid overhead if restricted'],
      redFlags: ['Shoulder pain'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'independent'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per surgeon protocol' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Full range' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'B',
      source: 'Seated exercise protocols. ACSM guidelines',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // GAIT TRAINING
  // ============================================
  {
    id: 'senior_walking_program',
    baseName: 'Progressive Walking Program',
    baseNameSv: 'Progressivt Gångprogram',
    description: 'Structured walking for cardiovascular and fall prevention',
    bodyRegion: 'core',
    muscleGroups: ['hip_flexors', 'hip_extensors', 'ankle_stabilizers'],
    exerciseType: 'aerobic',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'walking_aid', 'treadmill'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Unstable cardiac condition', 'Severe balance disorder'],
      precautions: ['Start slow', 'Safe surface', 'Walking aid if needed'],
      redFlags: ['Chest pain', 'Severe breathlessness', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Short distances with aid' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Progressive distance' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Wean from aid' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full program' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Walking programs for fall prevention. Cochrane review 2019',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'senior_obstacle_course',
    baseName: 'Simple Obstacle Course',
    baseNameSv: 'Enkel Hinderbana',
    description: 'Walking over/around obstacles for real-world balance',
    bodyRegion: 'core',
    muscleGroups: ['hip_flexors', 'ankle_stabilizers', 'core'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['cones', 'foam_blocks', 'tape'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe visual impairment', 'Severe cognitive impairment'],
      precautions: ['Spotter nearby', 'Safe obstacles only'],
      redFlags: ['Trips', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'high',
        hearingRequirement: 'moderate',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Simple obstacles' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full course' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Obstacle negotiation training. Weerdesteyn V. Gait Posture 2006',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_stair_training',
    baseName: 'Stair Climbing Training',
    baseNameSv: 'Trappgångsträning',
    description: 'Safe stair negotiation with handrail',
    bodyRegion: 'knee',
    muscleGroups: ['quadriceps', 'gluteus_maximus', 'gastrocnemius'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['stairs', 'handrail'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe knee OA limiting stairs', 'Severe balance disorder'],
      precautions: ['Always use handrail', 'One step at a time if needed'],
      redFlags: ['Knee pain > 5/10', 'Loss of balance'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'high',
        hearingRequirement: 'low',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Step-to pattern' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Step-over-step with rail' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Stair negotiation and falls. Tiedemann A. Age Ageing 2007',
      studyType: 'Cohort study'
    }
  },

  // ============================================
  // TAI CHI & MIND-BODY
  // ============================================
  {
    id: 'senior_tai_chi_basic',
    baseName: 'Tai Chi for Seniors',
    baseNameSv: 'Tai Chi för Äldre',
    description: 'Simplified Tai Chi for balance and fall prevention',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_stabilizers', 'ankle_stabilizers'],
    exerciseType: 'mind_body',
    allowedPositions: ['standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Unable to stand for 10+ minutes'],
      precautions: ['Modified positions available', 'Near support'],
      redFlags: ['Severe dizziness', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'moderate',
        hearingRequirement: 'moderate',
        supervisionLevel: 'group_supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not recommended' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Seated only' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Standing modified' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full practice' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Li F. Tai Chi fall prevention. NEJM 2012',
      studyType: 'RCT - 55% fall reduction'
    }
  },
  {
    id: 'senior_yoga_chair',
    baseName: 'Chair Yoga for Seniors',
    baseNameSv: 'Stolyoga för Äldre',
    description: 'Modified yoga poses in seated position',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_flexors', 'spinal_extensors'],
    exerciseType: 'mind_body',
    allowedPositions: ['sitting'],
    allowedEquipment: ['chair'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe spinal stenosis', 'Uncontrolled hypertension'],
      precautions: ['Avoid inversions', 'Pain-free positions'],
      redFlags: ['Dizziness', 'Pain'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'low',
        hearingRequirement: 'moderate',
        supervisionLevel: 'group_supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not recommended' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Gentle seated only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full practice' }
      ]
    },
    evidenceBase: {
      level: 'B',
      source: 'Yoga for older adults. JAGS 2016',
      studyType: 'RCT'
    }
  },

  // ============================================
  // VESTIBULAR & SENSORY
  // ============================================
  {
    id: 'senior_head_turns_standing',
    baseName: 'Head Turns Standing',
    baseNameSv: 'Huvudvridningar Stående',
    description: 'Head rotation while standing for vestibular challenge',
    bodyRegion: 'neck',
    muscleGroups: ['neck_rotators', 'vestibular_system'],
    exerciseType: 'vestibular',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'chair'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe vertigo', 'Cervical instability'],
      precautions: ['Support nearby', 'Start slow'],
      redFlags: ['Severe dizziness', 'Nausea', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Seated only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Standing with support' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Vestibular rehabilitation. Herdman SJ. Curr Opin Neurol 2013',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'senior_eyes_closed_balance',
    baseName: 'Eyes Closed Balance',
    baseNameSv: 'Balans med Stängda Ögon',
    description: 'Standing balance with eyes closed to challenge proprioception',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'ankle_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['chair', 'wall'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe neuropathy', 'Severe balance disorder'],
      precautions: ['Support within reach', 'Spotter required'],
      redFlags: ['Falls', 'Severe sway'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'low',
        visionRequirement: 'none',
        hearingRequirement: 'moderate',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'With hand support' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Light touch' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Sensory challenge balance training. Lord SR. JAGS 2003',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_foam_standing',
    baseName: 'Standing on Foam',
    baseNameSv: 'Stå på Skumgummi',
    description: 'Balance on compliant surface for proprioceptive challenge',
    bodyRegion: 'ankle',
    muscleGroups: ['ankle_stabilizers', 'core_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['foam_pad', 'chair'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe neuropathy', 'Recent ankle injury'],
      precautions: ['Support nearby', 'Start bilateral'],
      redFlags: ['Loss of balance', 'Ankle pain'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'With support' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Light touch' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Compliant surface training. Granacher U. Sports Med 2011',
      studyType: 'Systematic review'
    }
  },

  // ============================================
  // FUNCTIONAL REACH & TRANSFERS
  // ============================================
  {
    id: 'senior_functional_reach',
    baseName: 'Functional Reach Training',
    baseNameSv: 'Funktionell Räckviddsträning',
    description: 'Reaching forward/sideways while standing',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'wall', 'target'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Severe balance disorder'],
      precautions: ['Support nearby', 'Progress gradually'],
      redFlags: ['Loss of balance', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Seated only' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Standing with support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Functional Reach Test. Duncan PW. J Gerontol 1990',
      studyType: 'Validation study'
    }
  },
  {
    id: 'senior_weight_shift',
    baseName: 'Weight Shifting',
    baseNameSv: 'Viktförflyttning',
    description: 'Controlled weight shifts side-to-side and front-to-back',
    bodyRegion: 'hip',
    muscleGroups: ['hip_stabilizers', 'ankle_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'chair'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Unable to stand without support'],
      precautions: ['Support nearby', 'Controlled movements'],
      redFlags: ['Loss of balance'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'low',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Small shifts' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Full range' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ]
    },
    evidenceBase: {
      level: 'B',
      source: 'Weight shift training balance. Clinical practice',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'senior_bed_transfer',
    baseName: 'Bed Transfer Training',
    baseNameSv: 'Sängförflyttningsträning',
    description: 'Safe technique for getting in/out of bed',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_flexors', 'quadriceps'],
    exerciseType: 'functional',
    allowedPositions: ['lying', 'sitting'],
    allowedEquipment: ['bed', 'bedrail'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Spinal precautions'],
      precautions: ['Log roll technique if post-op', 'Safe side'],
      redFlags: ['Pain', 'Dizziness'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'low',
        hearingRequirement: 'low',
        supervisionLevel: 'initial_supervision'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Log roll, assistance' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Supervised' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Independent' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full independence' }
      ]
    },
    evidenceBase: {
      level: 'B',
      source: 'Transfer training older adults. Occupational therapy guidelines',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // REACTIVE BALANCE
  // ============================================
  {
    id: 'senior_perturbation_training',
    baseName: 'Gentle Perturbation Training',
    baseNameSv: 'Mild Perturbationsträning',
    description: 'Controlled balance challenges with therapist',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_stabilizers', 'ankle_stabilizers'],
    exerciseType: 'reactive_balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'harness'],
    allowedDifficulties: ['advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['High fall risk without harness', 'Osteoporosis severe'],
      precautions: ['Trained therapist only', 'Safe environment'],
      redFlags: ['Falls', 'Injury'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'moderate',
        hearingRequirement: 'moderate',
        supervisionLevel: 'therapist_required'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Very gentle' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Full training' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Perturbation training falls. Mansfield A. BMJ 2015',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'senior_step_reaction',
    baseName: 'Stepping Reaction Training',
    baseNameSv: 'Stegreaktion Träning',
    description: 'Practice quick stepping responses to prevent falls',
    bodyRegion: 'hip',
    muscleGroups: ['hip_flexors', 'ankle_stabilizers'],
    exerciseType: 'reactive_balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'targets'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe balance disorder', 'Recent hip surgery'],
      precautions: ['Clear space', 'Support nearby'],
      redFlags: ['Falls', 'Slow reactions'],
      seniorSpecific: {
        fallRiskLevel: 'high',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'high',
        hearingRequirement: 'moderate',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Slow stepping' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive speed' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full training' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Stepping training falls. Okubo Y. Br J Sports Med 2017',
      studyType: 'RCT'
    }
  },

  // ============================================
  // DUAL-TASK TRAINING
  // ============================================
  {
    id: 'senior_walk_talk',
    baseName: 'Walking While Talking',
    baseNameSv: 'Gå och Prata Samtidigt',
    description: 'Walking while performing cognitive tasks',
    bodyRegion: 'core',
    muscleGroups: ['gait_muscles', 'cognitive_system'],
    exerciseType: 'dual_task',
    allowedPositions: ['standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe cognitive impairment', 'Severe gait disorder'],
      precautions: ['Safe environment', 'Start simple'],
      redFlags: ['Stops walking to talk', 'Falls'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'high',
        visionRequirement: 'moderate',
        hearingRequirement: 'moderate',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not recommended' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Simple tasks only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full training' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Dual-task training falls. Silsupadol P. Phys Ther 2009',
      studyType: 'RCT'
    }
  },
  {
    id: 'senior_count_balance',
    baseName: 'Counting While Balancing',
    baseNameSv: 'Räkna Under Balansövning',
    description: 'Standing balance with cognitive counting task',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'cognitive_system'],
    exerciseType: 'dual_task',
    allowedPositions: ['standing'],
    allowedEquipment: ['none', 'chair'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe cognitive impairment'],
      precautions: ['Support nearby', 'Start with simple counting'],
      redFlags: ['Falls', 'Unable to complete task'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'high',
        visionRequirement: 'low',
        hearingRequirement: 'moderate',
        supervisionLevel: 'supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Seated only' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Standing with support' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full training' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Cognitive-motor training. Plummer P. Gait Posture 2015',
      studyType: 'RCT'
    }
  },

  // ============================================
  // AQUATIC EXERCISES FOR SENIORS
  // ============================================
  {
    id: 'senior_pool_walking',
    baseName: 'Pool Walking for Seniors',
    baseNameSv: 'Poolgång för Äldre',
    description: 'Walking in chest-deep water for safe exercise',
    bodyRegion: 'core',
    muscleGroups: ['hip_flexors', 'hip_extensors', 'core'],
    exerciseType: 'aerobic',
    allowedPositions: ['standing'],
    allowedEquipment: ['pool'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Fear of water', 'Open wounds', 'Incontinence'],
      precautions: ['Pool temperature 28-30°C', 'Staff present'],
      redFlags: ['Dizziness', 'Shortness of breath'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'group_supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed - wound' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Gentle walking' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full program' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Aquatic exercise older adults. Cochrane review 2016',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'senior_pool_balance',
    baseName: 'Pool Balance Exercises',
    baseNameSv: 'Pool Balansövningar',
    description: 'Balance training in water with reduced fall risk',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'hip_stabilizers'],
    exerciseType: 'balance',
    allowedPositions: ['standing'],
    allowedEquipment: ['pool', 'pool_noodle'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Fear of water', 'Open wounds'],
      precautions: ['Pool edge accessible', 'Staff present'],
      redFlags: ['Panic', 'Severe dizziness'],
      seniorSpecific: {
        fallRiskLevel: 'low',
        cognitiveRequirement: 'low',
        visionRequirement: 'moderate',
        hearingRequirement: 'low',
        supervisionLevel: 'group_supervised'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed - wound' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Bilateral standing' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Single leg' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercises' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Aquatic balance training. Arnold CM. Physiother Can 2008',
      studyType: 'RCT'
    }
  },

  // ============================================
  // FEAR OF FALLING INTERVENTIONS
  // ============================================
  {
    id: 'senior_confidence_building',
    baseName: 'Balance Confidence Building',
    baseNameSv: 'Balanssjälvförtroende Bygge',
    description: 'Progressive balance challenges to reduce fear of falling',
    bodyRegion: 'core',
    muscleGroups: ['core_stabilizers', 'psychological'],
    exerciseType: 'psychological',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['chair', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe anxiety disorder'],
      precautions: ['Progress gradually', 'Acknowledge fears'],
      redFlags: ['Panic attacks', 'Activity avoidance'],
      seniorSpecific: {
        fallRiskLevel: 'moderate',
        cognitiveRequirement: 'moderate',
        visionRequirement: 'low',
        hearingRequirement: 'moderate',
        supervisionLevel: 'therapist_recommended'
      },
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Seated activities' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Standing supported' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full program' }
      ]
    },
    evidenceBase: {
      level: 'A',
      source: 'Fear of falling interventions. Zijlstra GA. Age Ageing 2007',
      studyType: 'Systematic review'
    }
  }
];

export default seniorsFallRiskTemplates;
