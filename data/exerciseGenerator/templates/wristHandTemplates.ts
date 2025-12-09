/**
 * Wrist & Hand Exercise Templates
 *
 * Evidence-based exercises for:
 * - Carpal tunnel syndrome
 * - De Quervain's tenosynovitis
 * - Wrist sprains and fractures
 * - Trigger finger
 * - Dupuytren's contracture
 * - Hand/finger strengthening
 * - Post-surgical rehabilitation
 */

import { BaseExerciseTemplate } from '../types';

export const wristHandTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // WRIST MOBILITY
  // ============================================
  {
    id: 'wrist_flexion_stretch',
    baseName: 'Wrist Flexion Stretch',
    baseNameSv: 'Handledsflexion Stretch',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_extensors', 'forearm_extensors'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute wrist fracture', 'Unstable carpal bones'],
      precautions: ['Recent wrist surgery', 'Severe arthritis'],
      redFlags: ['Sudden numbness', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Gentle passive only' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Active stretching allowed' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['No pain during stretch', 'Full ROM achieved'],
      regressionTriggers: ['Pain > 3/10', 'Increased swelling']
    },
    evidenceBase: {
      level: 'B',
      source: 'Page MJ. Wrist exercises for carpal tunnel syndrome. Cochrane, 2012',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'wrist_extension_stretch',
    baseName: 'Wrist Extension Stretch',
    baseNameSv: 'Handledsextension Stretch',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_flexors', 'forearm_flexors'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute wrist fracture', 'Unstable carpal bones'],
      precautions: ['Carpal tunnel syndrome', 'Medial epicondylitis'],
      redFlags: ['Numbness in fingers', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Gentle passive only' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Active stretching allowed' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['No pain during stretch', 'Full ROM achieved'],
      regressionTriggers: ['Pain > 3/10', 'Tingling in fingers']
    },
    evidenceBase: {
      level: 'B',
      source: 'Page MJ. Wrist exercises for carpal tunnel syndrome. Cochrane, 2012',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'wrist_circles',
    baseName: 'Wrist Circles',
    baseNameSv: 'Handledscirklar',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_flexors', 'wrist_extensors', 'forearm_rotators'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute fracture', 'Severe instability'],
      precautions: ['Recent surgery', 'TFCC injury'],
      redFlags: ['Clicking with pain', 'Locking sensation'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Small circles only' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Full ROM circles' },
        { phase: 4, weeksPostOp: '12+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['Pain-free full circles', 'Symmetrical ROM'],
      regressionTriggers: ['Pain during movement', 'Increased swelling']
    },
    evidenceBase: {
      level: 'C',
      source: 'Clinical practice guidelines for wrist rehabilitation',
      studyType: 'Expert consensus'
    }
  },
  {
    id: 'wrist_radial_ulnar_deviation',
    baseName: 'Wrist Radial/Ulnar Deviation',
    baseNameSv: 'Handleds Radial/Ulnar Deviation',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['radial_deviators', 'ulnar_deviators'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'dumbbell'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Scaphoid fracture', 'TFCC tear acute'],
      precautions: ['De Quervain syndrome', 'Ulnar impaction'],
      redFlags: ['Sharp pain on ulnar side', 'Instability feeling'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Passive only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Active no resistance' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Full ROM', 'No pain'],
      regressionTriggers: ['Pain > 4/10', 'Swelling increase']
    },
    evidenceBase: {
      level: 'B',
      source: 'Wrist ROM exercises clinical guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'forearm_pronation_supination',
    baseName: 'Forearm Pronation/Supination',
    baseNameSv: 'Underarm Pronation/Supination',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['pronator_teres', 'supinator', 'biceps'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'dumbbell', 'hammer'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Radial head fracture acute', 'Distal radioulnar joint instability'],
      precautions: ['Tennis elbow', 'Golfer elbow'],
      redFlags: ['Locking of forearm', 'Severe weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Passive only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Active assisted' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Full pronation/supination', 'Pain-free movement'],
      regressionTriggers: ['Pain during rotation', 'Mechanical symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // NERVE GLIDING
  // ============================================
  {
    id: 'median_nerve_glide_wrist',
    baseName: 'Median Nerve Glide',
    baseNameSv: 'Medianusnerv Glidning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['forearm_flexors', 'wrist_flexors'],
    exerciseType: 'neural_mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute nerve injury', 'Severe carpal tunnel with weakness'],
      precautions: ['Moderate carpal tunnel', 'Diabetes with neuropathy'],
      redFlags: ['Increased numbness after exercise', 'Weakness in thumb'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Very gentle sliding' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Moderate nerve glides' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Full nerve mobilization' }
      ],
      progressionCriteria: ['No symptom increase', 'Improved nerve symptoms'],
      regressionTriggers: ['Increased tingling', 'New numbness']
    },
    evidenceBase: {
      level: 'A',
      source: 'Ballestero-Pérez R. Neural mobilization for carpal tunnel. JOSPT, 2017',
      studyType: 'RCT'
    }
  },
  {
    id: 'ulnar_nerve_glide_wrist',
    baseName: 'Ulnar Nerve Glide',
    baseNameSv: 'Ulnarisnerv Glidning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['forearm_flexors', 'intrinsic_hand_muscles'],
    exerciseType: 'neural_mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute ulnar nerve injury', 'Severe cubital tunnel'],
      precautions: ['Cubital tunnel syndrome', 'Guyon canal syndrome'],
      redFlags: ['Weakness in hand grip', 'Clawing of fingers'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Very gentle sliding' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Moderate nerve glides' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full nerve mobilization' }
      ],
      progressionCriteria: ['No symptom increase', 'Improved nerve symptoms'],
      regressionTriggers: ['Increased tingling in 4th/5th fingers', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Neural mobilization for ulnar neuropathy',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'radial_nerve_glide_wrist',
    baseName: 'Radial Nerve Glide',
    baseNameSv: 'Radialis Nerv Glidning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_extensors', 'forearm_extensors'],
    exerciseType: 'neural_mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute radial nerve injury', 'Wrist drop'],
      precautions: ['Radial tunnel syndrome', 'Tennis elbow'],
      redFlags: ['Wrist drop', 'Finger drop'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Very gentle sliding' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Moderate nerve glides' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full nerve mobilization' }
      ],
      progressionCriteria: ['No symptom increase', 'Improved sensation'],
      regressionTriggers: ['Increased symptoms', 'New weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Neural mobilization for radial nerve',
      studyType: 'Clinical trial'
    }
  },

  // ============================================
  // TENDON GLIDING
  // ============================================
  {
    id: 'tendon_gliding_exercises',
    baseName: 'Tendon Gliding Exercises',
    baseNameSv: 'Senglidningsövningar',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['finger_flexors', 'finger_extensors'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute tendon repair < 3 weeks', 'Tendon rupture'],
      precautions: ['Trigger finger', 'Flexor tendon surgery'],
      redFlags: ['Inability to flex finger', 'Tendon bowstringing'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Protected passive only per protocol' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Active place-hold' },
        { phase: 3, weeksPostOp: '6-8', modifications: 'Active motion' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Smooth tendon gliding', 'No catching'],
      regressionTriggers: ['Triggering', 'Catching sensation']
    },
    evidenceBase: {
      level: 'A',
      source: 'Duran protocol for flexor tendon rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'differential_tendon_gliding',
    baseName: 'Differential Tendon Gliding',
    baseNameSv: 'Differentierad Senglidning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['FDP', 'FDS', 'intrinsics'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute tendon repair', 'Zone 2 injury < 6 weeks'],
      precautions: ['Adhesions', 'Tenolysis'],
      redFlags: ['New inability to flex', 'Tendon rupture signs'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-6', modifications: 'Per hand therapist' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Active differential gliding' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercises' }
      ],
      progressionCriteria: ['Independent FDP/FDS gliding', 'No adhesions'],
      regressionTriggers: ['Loss of motion', 'Increased stiffness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Flexor tendon rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // GRIP STRENGTHENING
  // ============================================
  {
    id: 'grip_strengthening_ball',
    baseName: 'Grip Strengthening with Ball',
    baseNameSv: 'Greppstyrka med Boll',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['finger_flexors', 'intrinsic_muscles', 'forearm_flexors'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['stress_ball', 'therapy_putty', 'grip_trainer'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute fracture', 'Tendon repair < 8 weeks'],
      precautions: ['Arthritis', 'Carpal tunnel'],
      redFlags: ['Increased numbness', 'Sharp pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-8', modifications: 'Soft ball only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full grip training' }
      ],
      progressionCriteria: ['Grip strength > 80% contralateral', 'No pain'],
      regressionTriggers: ['Pain during grip', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Hand strengthening rehabilitation evidence',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'pinch_grip_strengthening',
    baseName: 'Pinch Grip Strengthening',
    baseNameSv: 'Nyppgreppsstyrka',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['thenar_muscles', 'first_dorsal_interosseous', 'FPL'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['therapy_putty', 'pinch_gauge', 'clothespins'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['CMC joint arthroplasty < 12 weeks', 'Acute thumb injury'],
      precautions: ['CMC arthritis', 'De Quervain'],
      redFlags: ['Thumb joint subluxation', 'Severe weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Very light pinch' },
        { phase: 3, weeksPostOp: '10-16', modifications: 'Progressive pinch' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full pinch activities' }
      ],
      progressionCriteria: ['Pinch strength > 80% contralateral', 'No pain'],
      regressionTriggers: ['Thumb pain', 'Joint instability']
    },
    evidenceBase: {
      level: 'B',
      source: 'Thumb rehabilitation guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'finger_extension_resistance',
    baseName: 'Finger Extension with Resistance',
    baseNameSv: 'Fingerextension med Motstånd',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['EDC', 'EIP', 'EDM', 'lumbricals'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['rubber_band', 'hand_exerciser', 'putty'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Extensor tendon repair < 8 weeks', 'Mallet finger acute'],
      precautions: ['Boutonniere deformity', 'Swan neck deformity'],
      redFlags: ['Finger dropping', 'Extensor lag'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-8', modifications: 'Light resistance only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Full extension against resistance', 'No lag'],
      regressionTriggers: ['Extensor lag', 'Pain with extension']
    },
    evidenceBase: {
      level: 'B',
      source: 'Extensor mechanism rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'wrist_flexion_strengthening',
    baseName: 'Wrist Flexion Strengthening',
    baseNameSv: 'Handledsflexion Styrka',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['FCR', 'FCU', 'palmaris_longus'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'resistance_band', 'cable'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute wrist fracture', 'Carpal tunnel severe'],
      precautions: ['Golfer elbow', 'FCR tendinitis'],
      redFlags: ['Numbness during exercise', 'Severe weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'No resistance' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free strengthening', 'Strength > 80%'],
      regressionTriggers: ['Pain > 3/10', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Wrist strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'wrist_extension_strengthening',
    baseName: 'Wrist Extension Strengthening',
    baseNameSv: 'Handledsextension Styrka',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['ECRL', 'ECRB', 'ECU'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'resistance_band', 'cable'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute wrist fracture', 'Acute extensor tendinitis'],
      precautions: ['Tennis elbow', 'De Quervain'],
      redFlags: ['Severe pain on gripping', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'No resistance' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free strengthening', 'Strength > 80%'],
      regressionTriggers: ['Pain > 3/10', 'Lateral elbow pain']
    },
    evidenceBase: {
      level: 'B',
      source: 'Wrist strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // THUMB EXERCISES
  // ============================================
  {
    id: 'thumb_opposition',
    baseName: 'Thumb Opposition Exercise',
    baseNameSv: 'Tumopposition',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['opponens_pollicis', 'FPB', 'APB'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['CMC dislocation', 'Acute thumb fracture'],
      precautions: ['CMC arthritis', 'Gamekeeper thumb'],
      redFlags: ['Joint subluxation', 'Severe instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle passive' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Active opposition' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Touch all fingertips', 'No pain'],
      regressionTriggers: ['Pain at CMC', 'Inability to oppose']
    },
    evidenceBase: {
      level: 'B',
      source: 'Thumb rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'thumb_abduction_strengthening',
    baseName: 'Thumb Abduction Strengthening',
    baseNameSv: 'Tumabduktion Styrka',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['APL', 'APB', 'EPB'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['rubber_band', 'putty', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['De Quervain acute', 'Acute thumb injury'],
      precautions: ['CMC arthritis', 'APL tendinitis'],
      redFlags: ['Severe pain at thumb base', 'Crepitus'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Isometric only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free abduction', 'Strength > 80%'],
      regressionTriggers: ['Pain at first dorsal compartment', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Thumb strengthening evidence',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'thumb_ip_flexion_extension',
    baseName: 'Thumb IP Flexion/Extension',
    baseNameSv: 'Tum IP Flexion/Extension',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['FPL', 'EPL'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'putty'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute tendon rupture', 'Mallet thumb acute'],
      precautions: ['FPL laceration repair', 'EPL rupture repair'],
      redFlags: ['Inability to flex/extend', 'Tendon rupture signs'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Per protocol only' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Protected active' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Full active' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Resisted' }
      ],
      progressionCriteria: ['Full ROM', 'No lag'],
      regressionTriggers: ['Lag developing', 'Loss of motion']
    },
    evidenceBase: {
      level: 'B',
      source: 'Thumb tendon rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'thumb_mcp_stabilization',
    baseName: 'Thumb MCP Stabilization',
    baseNameSv: 'Tum MCP Stabilisering',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['FPB', 'EPB', 'adductor_pollicis'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['putty', 'resistance_band', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Gamekeeper thumb acute', 'UCL rupture'],
      precautions: ['UCL repair', 'Chronic instability'],
      redFlags: ['Joint giving way', 'Severe laxity'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Immobilized' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Gentle isometrics' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive strengthening' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Stable joint', 'Pain-free pinch'],
      regressionTriggers: ['Instability', 'Pain with pinch']
    },
    evidenceBase: {
      level: 'B',
      source: 'UCL reconstruction rehabilitation',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // INTRINSIC MUSCLE EXERCISES
  // ============================================
  {
    id: 'intrinsic_plus_position',
    baseName: 'Intrinsic Plus Position Hold',
    baseNameSv: 'Intrinsic Plus Position',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['lumbricals', 'interossei', 'flexors'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute intrinsic muscle injury', 'Severe claw deformity'],
      precautions: ['Ulnar nerve palsy', 'Combined nerve injuries'],
      redFlags: ['Worsening claw posture', 'New weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Passive positioning' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Active holding' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive strengthening' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercises' }
      ],
      progressionCriteria: ['Maintain position 30 sec', 'Controlled movement'],
      regressionTriggers: ['Loss of position', 'Fatigue < 10 sec']
    },
    evidenceBase: {
      level: 'B',
      source: 'Intrinsic muscle rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'finger_abduction_adduction',
    baseName: 'Finger Abduction/Adduction',
    baseNameSv: 'Fingerabduktion/Adduktion',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['dorsal_interossei', 'palmar_interossei'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['rubber_band', 'putty', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute fracture', 'Interosseous injury'],
      precautions: ['Ulnar nerve palsy', 'RA affecting MCPs'],
      redFlags: ['Ulnar drift worsening', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Active no resistance' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Full spread', 'Equal strength'],
      regressionTriggers: ['Asymmetry', 'Pain']
    },
    evidenceBase: {
      level: 'C',
      source: 'Interosseous strengthening guidelines',
      studyType: 'Expert consensus'
    }
  },
  {
    id: 'lumbrical_exercise',
    baseName: 'Lumbrical Exercise',
    baseNameSv: 'Lumbrikalisövning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['lumbricals', 'interossei'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'putty'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute lumbrical tear', 'Severe contracture'],
      precautions: ['Claw deformity', 'Intrinsic tightness'],
      redFlags: ['Unable to extend IPs', 'Worsening deformity'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle active' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['MCP flexion with IP extension', 'Good control'],
      regressionTriggers: ['Loss of IP extension', 'Pain']
    },
    evidenceBase: {
      level: 'C',
      source: 'Intrinsic muscle rehabilitation',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // CARPAL TUNNEL SPECIFIC
  // ============================================
  {
    id: 'carpal_tunnel_stretch',
    baseName: 'Carpal Tunnel Stretch',
    baseNameSv: 'Karpaltunnelsträckning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_flexors', 'transverse_carpal_ligament'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Severe carpal tunnel with thenar atrophy', 'Acute median nerve injury'],
      precautions: ['Moderate CTS', 'Night symptoms'],
      redFlags: ['Thenar weakness', 'Constant numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Gentle nerve glides only' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Progressive stretching' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['Symptom improvement', 'No numbness increase'],
      regressionTriggers: ['Increased numbness', 'Thenar weakness']
    },
    evidenceBase: {
      level: 'A',
      source: 'Page MJ. Exercise and mobilisation for CTS. Cochrane, 2012',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'thenar_strengthening',
    baseName: 'Thenar Muscle Strengthening',
    baseNameSv: 'Thenarmuskler Styrka',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['APB', 'opponens_pollicis', 'FPB'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['putty', 'resistance_band', 'pinch_gauge'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute thenar muscle injury', 'Severe CTS with atrophy'],
      precautions: ['CTS moderate', 'Post carpal tunnel release'],
      redFlags: ['Thenar atrophy progressing', 'Weakness not improving'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-6', modifications: 'Gentle isometrics' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Strength improving', 'Pinch > 80%'],
      regressionTriggers: ['Weakness', 'Increased symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Carpal tunnel rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // DE QUERVAIN SPECIFIC
  // ============================================
  {
    id: 'de_quervain_stretch',
    baseName: 'De Quervain Stretch',
    baseNameSv: 'De Quervain Stretch',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['APL', 'EPB'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute De Quervain with severe inflammation'],
      precautions: ['Active tenosynovitis', 'Post-injection'],
      redFlags: ['Crepitus', 'Triggering at first dorsal compartment'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Gentle stretching' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Progressive stretching' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['Negative Finkelstein', 'Pain-free motion'],
      regressionTriggers: ['Pain increase', 'Positive Finkelstein']
    },
    evidenceBase: {
      level: 'B',
      source: 'De Quervain tenosynovitis management',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'first_dorsal_compartment_eccentric',
    baseName: 'First Dorsal Compartment Eccentric',
    baseNameSv: 'Första Dorsala Compartment Excentrisk',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['APL', 'EPB'],
    exerciseType: 'eccentric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'resistance_band', 'none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute tenosynovitis', 'Post-surgical < 6 weeks'],
      precautions: ['Chronic De Quervain', 'Subacute phase'],
      redFlags: ['Crepitus increasing', 'Triggering'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Isometric only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Light eccentric' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full eccentric' }
      ],
      progressionCriteria: ['Pain-free eccentric', 'Good endurance'],
      regressionTriggers: ['Pain > 4/10', 'Tendon irritation']
    },
    evidenceBase: {
      level: 'B',
      source: 'Eccentric training for tendinopathy',
      studyType: 'Clinical trial'
    }
  },

  // ============================================
  // TRIGGER FINGER SPECIFIC
  // ============================================
  {
    id: 'trigger_finger_gliding',
    baseName: 'Trigger Finger Gliding Exercise',
    baseNameSv: 'Triggerfinger Glidövning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['FDP', 'FDS'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Locked trigger finger', 'Post-release < 1 week'],
      precautions: ['Grade 3 triggering', 'Multiple affected fingers'],
      redFlags: ['Locked finger', 'Severe pain on motion'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-1', modifications: 'Gentle passive only' },
        { phase: 2, weeksPostOp: '1-2', modifications: 'Active gliding' },
        { phase: 3, weeksPostOp: '2-4', modifications: 'Full ROM exercises' },
        { phase: 4, weeksPostOp: '4+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['No triggering', 'Smooth motion'],
      regressionTriggers: ['Catching', 'Triggering return']
    },
    evidenceBase: {
      level: 'B',
      source: 'Trigger finger conservative management',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'a1_pulley_massage',
    baseName: 'A1 Pulley Self-Massage',
    baseNameSv: 'A1 Pulley Självmassage',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['flexor_sheath', 'A1_pulley'],
    exerciseType: 'soft_tissue',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Infection', 'Post-injection < 48 hours'],
      precautions: ['Severe nodule', 'Active inflammation'],
      redFlags: ['Signs of infection', 'Severe nodule enlargement'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Gentle scar massage' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Progressive massage' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Reduced nodule', 'Less triggering'],
      regressionTriggers: ['Increased inflammation', 'Worsening symptoms']
    },
    evidenceBase: {
      level: 'C',
      source: 'Trigger finger conservative treatment',
      studyType: 'Case series'
    }
  },

  // ============================================
  // DUPUYTREN SPECIFIC
  // ============================================
  {
    id: 'dupuytren_finger_extension',
    baseName: 'Dupuytren Finger Extension Stretch',
    baseNameSv: 'Dupuytren Fingerextension',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['palmar_fascia', 'finger_extensors'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'table'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute fasciectomy < 1 week', 'Skin graft'],
      precautions: ['Post-needle aponeurotomy', 'Severe contracture'],
      redFlags: ['Skin breakdown', 'Nerve symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-1', modifications: 'Per surgeon protocol' },
        { phase: 2, weeksPostOp: '1-4', modifications: 'Splint + gentle extension' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Progressive extension' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Maintenance stretching' }
      ],
      progressionCriteria: ['Improved extension', 'No recurrence'],
      regressionTriggers: ['Contracture return', 'Skin issues']
    },
    evidenceBase: {
      level: 'B',
      source: 'Dupuytren rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'palmar_fascia_massage',
    baseName: 'Palmar Fascia Massage',
    baseNameSv: 'Palmar Fascia Massage',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['palmar_fascia', 'intrinsics'],
    exerciseType: 'soft_tissue',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'massage_tool'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Open wound', 'Acute infection'],
      precautions: ['Post-collagenase injection', 'Post-surgery'],
      redFlags: ['Skin breakdown', 'Infection signs'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Scar massage only' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Progressive fascia work' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Cord softening', 'Improved mobility'],
      regressionTriggers: ['Increased nodularity', 'Skin issues']
    },
    evidenceBase: {
      level: 'C',
      source: 'Dupuytren conservative management',
      studyType: 'Expert consensus'
    }
  },

  // ============================================
  // FUNCTIONAL EXERCISES
  // ============================================
  {
    id: 'functional_grasp_release',
    baseName: 'Functional Grasp and Release',
    baseNameSv: 'Funktionellt Grepp och Släpp',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['finger_flexors', 'finger_extensors', 'intrinsics'],
    exerciseType: 'functional',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['various_objects', 'therapy_putty', 'coins'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute tendon repair', 'Unstable fracture'],
      precautions: ['Post-surgical', 'Arthritis flare'],
      redFlags: ['Tendon rupture signs', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Light objects only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive objects' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full functional tasks' }
      ],
      progressionCriteria: ['Functional grip', 'ADL independence'],
      regressionTriggers: ['Pain with function', 'Decreased ability']
    },
    evidenceBase: {
      level: 'B',
      source: 'Functional hand rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'in_hand_manipulation',
    baseName: 'In-Hand Manipulation Training',
    baseNameSv: 'In-Hand Manipulationsträning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['intrinsics', 'thenar', 'hypothenar'],
    exerciseType: 'functional',
    allowedPositions: ['sitting'],
    allowedEquipment: ['coins', 'pegs', 'small_objects'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Severe coordination deficit', 'Acute injury'],
      precautions: ['Fine motor deficits', 'Sensory loss'],
      redFlags: ['Progressive weakness', 'New numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Large objects' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive complexity' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full training' }
      ],
      progressionCriteria: ['Smooth manipulation', 'Speed improvement'],
      regressionTriggers: ['Dropping objects', 'Coordination worse']
    },
    evidenceBase: {
      level: 'B',
      source: 'Fine motor rehabilitation evidence',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'button_hook_training',
    baseName: 'Button/Hook Training',
    baseNameSv: 'Knapp/Krok Träning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['intrinsics', 'FDP', 'opposition'],
    exerciseType: 'functional',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dressing_board', 'buttons', 'hooks'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute hand surgery', 'Open wounds'],
      precautions: ['Limited sensation', 'Arthritis'],
      redFlags: ['Cannot perform after adequate recovery time'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Large buttons only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'All button sizes' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full dressing tasks' }
      ],
      progressionCriteria: ['Independent dressing', 'Normal speed'],
      regressionTriggers: ['Assistance needed', 'Pain with task']
    },
    evidenceBase: {
      level: 'B',
      source: 'ADL training in hand rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'writing_retraining',
    baseName: 'Writing/Handwriting Retraining',
    baseNameSv: 'Skrivträning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['intrinsics', 'wrist_stabilizers', 'finger_flexors'],
    exerciseType: 'functional',
    allowedPositions: ['sitting'],
    allowedEquipment: ['pen_grips', 'adapted_pens', 'paper'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute injury to writing hand', 'Severe tremor'],
      precautions: ['Writer cramp', 'Focal dystonia'],
      redFlags: ['Dystonic posturing', 'Progressive difficulty'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Large strokes, thick grip' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive writing' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Normal writing' }
      ],
      progressionCriteria: ['Legible writing', 'Sustained 15 min'],
      regressionTriggers: ['Cramping', 'Illegibility']
    },
    evidenceBase: {
      level: 'C',
      source: 'Hand function rehabilitation',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // EDEMA/SWELLING MANAGEMENT
  // ============================================
  {
    id: 'hand_elevation_exercises',
    baseName: 'Hand Elevation with Finger Pumping',
    baseNameSv: 'Handlyft med Fingerpumpning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['finger_flexors', 'finger_extensors', 'venous_return'],
    exerciseType: 'edema_management',
    allowedPositions: ['supine', 'sitting'],
    allowedEquipment: ['none', 'pillow'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['DVT of upper extremity', 'Active infection'],
      precautions: ['Severe edema', 'Post-surgical'],
      redFlags: ['Unilateral swelling with pain', 'Signs of infection'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-1', modifications: 'Continuous elevation' },
        { phase: 2, weeksPostOp: '1-4', modifications: 'Frequent elevation' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'As needed' },
        { phase: 4, weeksPostOp: '8+', modifications: 'PRN' }
      ],
      progressionCriteria: ['Edema reduction', 'Ring test improvement'],
      regressionTriggers: ['Edema increase', 'Pitting edema']
    },
    evidenceBase: {
      level: 'B',
      source: 'Hand edema management guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'retrograde_massage',
    baseName: 'Retrograde Massage',
    baseNameSv: 'Retrograd Massage',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['lymphatic_system', 'soft_tissue'],
    exerciseType: 'edema_management',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['none', 'lotion'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Active infection', 'DVT', 'Malignancy'],
      precautions: ['Fragile skin', 'Open wounds'],
      redFlags: ['Infection signs', 'Unilateral severe swelling'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-1', modifications: 'Very gentle, avoid incision' },
        { phase: 2, weeksPostOp: '1-4', modifications: 'Gentle massage' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Full technique' },
        { phase: 4, weeksPostOp: '8+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['Edema reduction', 'Improved motion'],
      regressionTriggers: ['Edema increase', 'Pain increase']
    },
    evidenceBase: {
      level: 'B',
      source: 'Lymphatic drainage for hand edema',
      studyType: 'Clinical trial'
    }
  },

  // ============================================
  // SCAR MANAGEMENT
  // ============================================
  {
    id: 'scar_massage_hand',
    baseName: 'Scar Massage',
    baseNameSv: 'Ärrmassage Hand',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['scar_tissue', 'subcutaneous'],
    exerciseType: 'soft_tissue',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'silicone_gel', 'lotion'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Open wound', 'Infection', 'Sutures in place'],
      precautions: ['Fragile skin', 'Skin graft'],
      redFlags: ['Wound dehiscence', 'Infection signs'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Very gentle, if healed' },
        { phase: 3, weeksPostOp: '4-12', modifications: 'Progressive pressure' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Scar softening', 'Improved mobility'],
      regressionTriggers: ['Wound opening', 'Increased redness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Scar management in hand surgery',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'scar_desensitization',
    baseName: 'Scar Desensitization',
    baseNameSv: 'Ärrdesensibilisering',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['sensory_nerves', 'cutaneous'],
    exerciseType: 'sensory_reeducation',
    allowedPositions: ['sitting'],
    allowedEquipment: ['textures', 'vibration', 'rice_bin'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Open wound', 'Acute CRPS'],
      precautions: ['Hypersensitivity', 'Allodynia'],
      redFlags: ['CRPS symptoms', 'Spreading hypersensitivity'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Gentle textures' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive textures' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full program' }
      ],
      progressionCriteria: ['Tolerance improvement', 'Functional use'],
      regressionTriggers: ['Increased hypersensitivity', 'Avoidance behavior']
    },
    evidenceBase: {
      level: 'B',
      source: 'Desensitization protocols for hand',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // SENSORY RE-EDUCATION
  // ============================================
  {
    id: 'stereognosis_training',
    baseName: 'Stereognosis Training',
    baseNameSv: 'Stereognosträning',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['sensory_cortex', 'tactile_receptors'],
    exerciseType: 'sensory_reeducation',
    allowedPositions: ['sitting'],
    allowedEquipment: ['objects', 'shapes', 'textures'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete nerve transection unrepaired'],
      precautions: ['Partial sensory loss', 'Post nerve repair'],
      redFlags: ['No sensory return after expected time'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Protective sensory re-ed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Progressive training' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Complex objects' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full program' }
      ],
      progressionCriteria: ['Object identification', 'Functional sensation'],
      regressionTriggers: ['No improvement', 'Learned non-use']
    },
    evidenceBase: {
      level: 'B',
      source: 'Sensory re-education after nerve repair',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'localization_training',
    baseName: 'Touch Localization Training',
    baseNameSv: 'Beröringslokalisering',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['sensory_cortex', 'tactile_receptors'],
    exerciseType: 'sensory_reeducation',
    allowedPositions: ['sitting'],
    allowedEquipment: ['monofilaments', 'eraser'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Anesthetic hand with injury risk'],
      precautions: ['Decreased protective sensation', 'Diabetic neuropathy'],
      redFlags: ['Burns or injuries to insensate areas'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Protective education' },
        { phase: 2, weeksPostOp: '4-12', modifications: 'Localization training' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Refinement' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Maintenance' }
      ],
      progressionCriteria: ['Accurate localization', 'Moving two-point discrimination'],
      regressionTriggers: ['Inaccuracy increasing', 'Protective sensation lost']
    },
    evidenceBase: {
      level: 'B',
      source: 'Sensory reeducation protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // FRACTURE SPECIFIC
  // ============================================
  {
    id: 'distal_radius_rom',
    baseName: 'Distal Radius Fracture ROM',
    baseNameSv: 'Distal Radiusfraktur ROM',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_flexors', 'wrist_extensors', 'forearm_rotators'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'table'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable fracture', 'Non-union'],
      precautions: ['ORIF < 6 weeks', 'External fixator in place'],
      redFlags: ['Increasing pain', 'Hardware problems'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Finger ROM only' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Protected wrist ROM' },
        { phase: 3, weeksPostOp: '6-10', modifications: 'Progressive ROM' },
        { phase: 4, weeksPostOp: '10+', modifications: 'Full ROM exercises' }
      ],
      progressionCriteria: ['Union confirmed', 'ROM improving'],
      regressionTriggers: ['Pain increase', 'ROM plateau']
    },
    evidenceBase: {
      level: 'A',
      source: 'Distal radius fracture rehabilitation guidelines',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'metacarpal_fracture_rom',
    baseName: 'Metacarpal Fracture ROM',
    baseNameSv: 'Metakarpalfraktur ROM',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['finger_flexors', 'finger_extensors', 'intrinsics'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'buddy_tape'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable fracture', 'Rotational deformity'],
      precautions: ['Post-ORIF', 'External fixation'],
      redFlags: ['Rotation visible', 'Shortening'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Protected buddy movement' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Active ROM' },
        { phase: 3, weeksPostOp: '6-10', modifications: 'Progressive strengthening' },
        { phase: 4, weeksPostOp: '10+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Clinical union', 'Full grip'],
      regressionTriggers: ['Pain at fracture site', 'Stiffness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Metacarpal fracture management',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'phalangeal_fracture_rom',
    baseName: 'Phalangeal Fracture ROM',
    baseNameSv: 'Falangfraktur ROM',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['finger_flexors', 'finger_extensors'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'buddy_tape', 'splint'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable fracture', 'Intra-articular with displacement'],
      precautions: ['Post-pinning', 'Mallet finger fracture'],
      redFlags: ['Malunion developing', 'Stiffness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Protected ROM per protocol' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Active ROM' },
        { phase: 3, weeksPostOp: '6-10', modifications: 'Progressive exercises' },
        { phase: 4, weeksPostOp: '10+', modifications: 'Full exercises' }
      ],
      progressionCriteria: ['Union confirmed', 'Functional ROM'],
      regressionTriggers: ['Increasing stiffness', 'Pain']
    },
    evidenceBase: {
      level: 'B',
      source: 'Finger fracture rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'scaphoid_fracture_rehabilitation',
    baseName: 'Scaphoid Fracture Rehabilitation',
    baseNameSv: 'Skafoideumfraktur Rehabilitering',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['wrist_flexors', 'wrist_extensors', 'thumb_muscles'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'putty'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Non-union', 'AVN developing'],
      precautions: ['Waist fractures', 'Proximal pole fractures'],
      redFlags: ['Pain at anatomical snuffbox', 'AVN signs'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Finger ROM only, wrist immobilized' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Protected wrist ROM' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive ROM' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full rehabilitation' }
      ],
      progressionCriteria: ['CT confirmed union', 'Pain-free motion'],
      regressionTriggers: ['Snuffbox tenderness', 'Motion loss']
    },
    evidenceBase: {
      level: 'B',
      source: 'Scaphoid fracture rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // ARTHRITIS SPECIFIC
  // ============================================
  {
    id: 'ra_hand_exercises',
    baseName: 'RA Hand Exercise Program',
    baseNameSv: 'RA Hand Träningsprogram',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['intrinsics', 'grip_muscles', 'wrist_stabilizers'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'putty', 'stress_ball'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Active flare with severe swelling', 'Post-arthroplasty acute'],
      precautions: ['Joint deformity', 'Subluxation'],
      redFlags: ['New deformity', 'Tendon rupture signs'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Per surgeon protocol' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle ROM' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive exercises' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Maintenance program' }
      ],
      progressionCriteria: ['Reduced morning stiffness', 'Improved grip'],
      regressionTriggers: ['Flare', 'Increased pain']
    },
    evidenceBase: {
      level: 'A',
      source: 'Lamb SE. Hand exercises for RA. BMJ, 2015',
      studyType: 'RCT'
    }
  },
  {
    id: 'oa_thumb_exercises',
    baseName: 'CMC Osteoarthritis Exercises',
    baseNameSv: 'CMC Artros Övningar',
    bodyRegion: 'wrist_hand',
    muscleGroups: ['thenar', 'first_dorsal_interosseous', 'APL'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'putty', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Post-arthroplasty < 12 weeks', 'Acute flare'],
      precautions: ['Severe OA', 'Subluxation'],
      redFlags: ['Progressive subluxation', 'Severe deformity'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per protocol only' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Gentle ROM' },
        { phase: 3, weeksPostOp: '10-16', modifications: 'Progressive strengthening' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Maintenance' }
      ],
      progressionCriteria: ['Reduced pain', 'Improved pinch'],
      regressionTriggers: ['Pain increase', 'Function decline']
    },
    evidenceBase: {
      level: 'A',
      source: 'Kjeken I. Hand exercises for CMC OA. Ann Rheum Dis, 2011',
      studyType: 'RCT'
    }
  }
];

export default wristHandTemplates;
