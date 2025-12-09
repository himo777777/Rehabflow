/**
 * Elbow Exercise Templates
 *
 * Evidence-based exercises for:
 * - Lateral epicondylitis (tennis elbow)
 * - Medial epicondylitis (golfer's elbow)
 * - Elbow fractures and dislocations
 * - UCL injuries and Tommy John rehab
 * - Elbow stiffness and contractures
 * - Cubital tunnel syndrome
 * - Radial tunnel syndrome
 * - Post-surgical rehabilitation
 */

import { BaseExerciseTemplate } from '../types';

export const elbowTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // ELBOW MOBILITY
  // ============================================
  {
    id: 'elbow_flexion_extension_rom',
    baseName: 'Elbow Flexion/Extension ROM',
    baseNameSv: 'Armbågsflexion/Extension ROM',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'brachialis', 'triceps'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing', 'supine'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable elbow fracture', 'Acute dislocation'],
      precautions: ['Post-ORIF', 'Heterotopic ossification risk'],
      redFlags: ['Mechanical block', 'Instability feeling'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Per protocol only' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Protected ROM' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive ROM' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full ROM exercises' }
      ],
      progressionCriteria: ['Pain-free motion', 'ROM improving'],
      regressionTriggers: ['Pain > 3/10', 'ROM loss']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow ROM rehabilitation guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_pronation_supination',
    baseName: 'Elbow Pronation/Supination',
    baseNameSv: 'Armbågs Pronation/Supination',
    bodyRegion: 'elbow',
    muscleGroups: ['pronator_teres', 'supinator', 'biceps'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'dowel', 'hammer'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Radial head fracture acute', 'DRUJ instability'],
      precautions: ['Radial head arthroplasty', 'PRUJ injury'],
      redFlags: ['Mechanical locking', 'Crepitus'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Per protocol' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Active assisted' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Full active' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Resisted' }
      ],
      progressionCriteria: ['Full rotation', 'No crepitus'],
      regressionTriggers: ['Pain on rotation', 'Block to motion']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm rotation rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_extension_stretch',
    baseName: 'Elbow Extension Stretch',
    baseNameSv: 'Armbågsextension Stretch',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'brachialis', 'joint_capsule'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing', 'supine'],
    allowedEquipment: ['none', 'table', 'towel'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Elbow instability', 'Acute trauma'],
      precautions: ['HO history', 'Post-surgical stiffness'],
      redFlags: ['Increasing flexion contracture', 'Neurological symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Per protocol' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle stretching' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['Extension improving', 'No pain'],
      regressionTriggers: ['Increased pain', 'Extension loss']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow contracture management',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'elbow_flexion_stretch',
    baseName: 'Elbow Flexion Stretch',
    baseNameSv: 'Armbågsflexion Stretch',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'anconeus', 'posterior_capsule'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'wall'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable elbow', 'Acute olecranon fracture'],
      precautions: ['Triceps repair', 'Extension contracture'],
      redFlags: ['Olecranon pain', 'Snapping'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per protocol' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Gentle stretching' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['Flexion improving', 'No olecranon pain'],
      regressionTriggers: ['Increased pain', 'Flexion loss']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow ROM rehabilitation',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // TENNIS ELBOW (LATERAL EPICONDYLITIS)
  // ============================================
  {
    id: 'wrist_extensor_eccentric',
    baseName: 'Wrist Extensor Eccentric',
    baseNameSv: 'Handledsextensor Excentrisk',
    bodyRegion: 'elbow',
    muscleGroups: ['ECRB', 'ECRL', 'ECU', 'EDC'],
    exerciseType: 'eccentric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'resistance_band', 'flexbar'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute lateral epicondyle avulsion', 'Post-injection < 2 weeks'],
      precautions: ['Severe tendinopathy', 'Full tear'],
      redFlags: ['Complete weakness', 'Nerve symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Isometric only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light eccentric' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full eccentric program' }
      ],
      progressionCriteria: ['Pain < 3/10 during exercise', 'Function improving'],
      regressionTriggers: ['Pain > 5/10', 'Morning stiffness worsening']
    },
    evidenceBase: {
      level: 'A',
      source: 'Coombes BK. Eccentric exercise for tennis elbow. BJSM, 2015',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'tyler_twist_flexbar',
    baseName: 'Tyler Twist (FlexBar)',
    baseNameSv: 'Tyler Twist (FlexBar)',
    bodyRegion: 'elbow',
    muscleGroups: ['ECRB', 'ECRL', 'wrist_extensors'],
    exerciseType: 'eccentric',
    allowedPositions: ['standing'],
    allowedEquipment: ['flexbar'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete tendon tear', 'Acute severe epicondylitis'],
      precautions: ['Moderate tendinopathy', 'Concurrent radial nerve symptoms'],
      redFlags: ['Worsening weakness', 'Night pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Light FlexBar' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full program' }
      ],
      progressionCriteria: ['No pain during exercise', 'Grip strength improving'],
      regressionTriggers: ['Pain increase', 'Grip weakness']
    },
    evidenceBase: {
      level: 'A',
      source: 'Tyler TF. FlexBar eccentric exercise for tennis elbow. JOSPT, 2010',
      studyType: 'RCT'
    }
  },
  {
    id: 'wrist_extensor_stretch',
    baseName: 'Wrist Extensor Stretch',
    baseNameSv: 'Handledsextensor Stretch',
    bodyRegion: 'elbow',
    muscleGroups: ['ECRB', 'ECRL', 'ECU'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute lateral epicondyle injury'],
      precautions: ['Moderate tendinopathy', 'Post-injection'],
      redFlags: ['Numbness in hand', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle stretching' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['Reduced morning stiffness', 'Pain-free stretch'],
      regressionTriggers: ['Increased pain', 'Stretch intolerance']
    },
    evidenceBase: {
      level: 'B',
      source: 'Tennis elbow rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'tennis_elbow_isometric',
    baseName: 'Tennis Elbow Isometric Hold',
    baseNameSv: 'Tennisarmbåge Isometrisk Håll',
    bodyRegion: 'elbow',
    muscleGroups: ['ECRB', 'ECRL', 'wrist_extensors'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['table', 'fist', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete tendon rupture'],
      precautions: ['Severe acute phase', 'Post-injection'],
      redFlags: ['Complete weakness', 'Spreading numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Light isometrics' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full isometrics' }
      ],
      progressionCriteria: ['45 sec hold pain-free', 'Pain relief'],
      regressionTriggers: ['Pain during hold', 'Post-exercise soreness > 24h']
    },
    evidenceBase: {
      level: 'A',
      source: 'Rio E. Isometric exercise for tendinopathy. BJSM, 2015',
      studyType: 'RCT'
    }
  },

  // ============================================
  // GOLFER'S ELBOW (MEDIAL EPICONDYLITIS)
  // ============================================
  {
    id: 'wrist_flexor_eccentric',
    baseName: 'Wrist Flexor Eccentric',
    baseNameSv: 'Handledsflexor Excentrisk',
    bodyRegion: 'elbow',
    muscleGroups: ['FCR', 'FCU', 'pronator_teres'],
    exerciseType: 'eccentric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'resistance_band', 'flexbar'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['UCL injury acute', 'Complete tendon tear'],
      precautions: ['Severe tendinopathy', 'Ulnar nerve symptoms'],
      redFlags: ['Ulnar nerve symptoms worsening', 'Complete weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Isometric only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light eccentric' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full eccentric program' }
      ],
      progressionCriteria: ['Pain < 3/10 during exercise', 'Grip improving'],
      regressionTriggers: ['Pain > 5/10', 'Ulnar symptoms']
    },
    evidenceBase: {
      level: 'A',
      source: 'Eccentric training for medial epicondylitis',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'wrist_flexor_stretch',
    baseName: 'Wrist Flexor Stretch',
    baseNameSv: 'Handledsflexor Stretch',
    bodyRegion: 'elbow',
    muscleGroups: ['FCR', 'FCU', 'palmaris_longus'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute medial epicondyle injury'],
      precautions: ['Ulnar nerve sensitivity', 'Post-injection'],
      redFlags: ['Tingling in 4th/5th fingers', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle stretching' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full stretching' }
      ],
      progressionCriteria: ['Reduced stiffness', 'Pain-free stretch'],
      regressionTriggers: ['Increased pain', 'Ulnar symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Golfer elbow rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'reverse_tyler_twist',
    baseName: 'Reverse Tyler Twist',
    baseNameSv: 'Omvänd Tyler Twist',
    bodyRegion: 'elbow',
    muscleGroups: ['FCR', 'FCU', 'wrist_flexors'],
    exerciseType: 'eccentric',
    allowedPositions: ['standing'],
    allowedEquipment: ['flexbar'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['UCL tear', 'Complete tendon tear'],
      precautions: ['Moderate tendinopathy', 'Ulnar nerve involvement'],
      redFlags: ['Worsening weakness', 'Ulnar symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Light FlexBar' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full program' }
      ],
      progressionCriteria: ['No pain during exercise', 'Grip improving'],
      regressionTriggers: ['Pain increase', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'FlexBar for medial epicondylitis',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'golfer_elbow_isometric',
    baseName: 'Golfer Elbow Isometric',
    baseNameSv: 'Golfarmbåge Isometrisk',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_flexors', 'pronator_teres'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['table', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete tendon rupture'],
      precautions: ['Acute phase', 'Post-injection'],
      redFlags: ['Complete weakness', 'Ulnar symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Light isometrics' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full isometrics' }
      ],
      progressionCriteria: ['45 sec hold pain-free', 'Pain relief'],
      regressionTriggers: ['Pain during hold', 'Post-exercise pain']
    },
    evidenceBase: {
      level: 'A',
      source: 'Rio E. Isometric exercise for tendinopathy. BJSM, 2015',
      studyType: 'RCT'
    }
  },

  // ============================================
  // ELBOW STRENGTHENING
  // ============================================
  {
    id: 'biceps_curl',
    baseName: 'Biceps Curl',
    baseNameSv: 'Bicepscurl',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'brachialis', 'brachioradialis'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell', 'barbell', 'resistance_band', 'cable'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Biceps tendon rupture acute', 'Unstable elbow'],
      precautions: ['Biceps tendinopathy', 'Post-surgery'],
      redFlags: ['Popping sensation', 'Bruising at biceps'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Very light, controlled' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free curling', 'Strength > 80%'],
      regressionTriggers: ['Anterior elbow pain', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'hammer_curl',
    baseName: 'Hammer Curl',
    baseNameSv: 'Hammarcurl',
    bodyRegion: 'elbow',
    muscleGroups: ['brachioradialis', 'biceps', 'brachialis'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute elbow injury', 'Lateral epicondylitis acute'],
      precautions: ['Elbow arthritis', 'Tennis elbow'],
      redFlags: ['Lateral elbow pain worsening', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free motion', 'Strength improving'],
      regressionTriggers: ['Pain > 3/10', 'Lateral epicondyle tenderness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm strengthening evidence',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'triceps_extension',
    baseName: 'Triceps Extension',
    baseNameSv: 'Tricepsextension',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'anconeus'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing', 'supine'],
    allowedEquipment: ['dumbbell', 'cable', 'resistance_band', 'bodyweight'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Triceps tendon rupture', 'Olecranon fracture acute'],
      precautions: ['Triceps tendinopathy', 'Post-TEA'],
      redFlags: ['Posterior elbow pain severe', 'Inability to extend'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Gravity-eliminated' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Full extension strength', 'No olecranon pain'],
      regressionTriggers: ['Posterior elbow pain', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'triceps_pushdown',
    baseName: 'Triceps Pushdown',
    baseNameSv: 'Triceps Pushdown',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'anconeus'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing'],
    allowedEquipment: ['cable', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Triceps tendon injury', 'Unstable elbow'],
      precautions: ['Olecranon bursitis', 'Extension contracture'],
      redFlags: ['Snapping triceps', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Full ROM pushdown', 'No pain'],
      regressionTriggers: ['Pain at olecranon', 'Snapping']
    },
    evidenceBase: {
      level: 'B',
      source: 'Triceps strengthening evidence',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'pronation_strengthening',
    baseName: 'Pronation Strengthening',
    baseNameSv: 'Pronation Styrka',
    bodyRegion: 'elbow',
    muscleGroups: ['pronator_teres', 'pronator_quadratus'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'hammer', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute pronator syndrome', 'PRUJ instability'],
      precautions: ['Medial epicondylitis', 'Pronator teres strain'],
      redFlags: ['Median nerve symptoms', 'Complete weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Isometric' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free pronation', 'Strength normal'],
      regressionTriggers: ['Medial elbow pain', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'supination_strengthening',
    baseName: 'Supination Strengthening',
    baseNameSv: 'Supination Styrka',
    bodyRegion: 'elbow',
    muscleGroups: ['supinator', 'biceps'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'hammer', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Radial tunnel syndrome acute', 'Supinator syndrome'],
      precautions: ['Lateral epicondylitis', 'Radial nerve symptoms'],
      redFlags: ['Radial nerve symptoms worsening', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Isometric' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free supination', 'Strength normal'],
      regressionTriggers: ['Lateral elbow pain', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // NERVE GLIDING
  // ============================================
  {
    id: 'ulnar_nerve_glide_elbow',
    baseName: 'Ulnar Nerve Glide at Elbow',
    baseNameSv: 'Ulnarisnerv Glidning vid Armbåge',
    bodyRegion: 'elbow',
    muscleGroups: ['ulnar_nerve', 'FCU'],
    exerciseType: 'neural_mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Severe cubital tunnel with atrophy', 'Acute nerve injury'],
      precautions: ['Moderate cubital tunnel', 'Post transposition'],
      redFlags: ['Worsening symptoms', 'New weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Very gentle' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full nerve glides' }
      ],
      progressionCriteria: ['Symptom improvement', 'No flare-ups'],
      regressionTriggers: ['Increased tingling', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Neural mobilization for cubital tunnel',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'radial_nerve_glide_elbow',
    baseName: 'Radial Nerve Glide at Elbow',
    baseNameSv: 'Radialisnerv Glidning vid Armbåge',
    bodyRegion: 'elbow',
    muscleGroups: ['radial_nerve', 'supinator', 'extensors'],
    exerciseType: 'neural_mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Radial nerve palsy', 'Acute nerve injury'],
      precautions: ['Radial tunnel syndrome', 'Tennis elbow'],
      redFlags: ['Wrist drop', 'Finger drop', 'Spreading numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Very gentle' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full nerve glides' }
      ],
      progressionCriteria: ['Symptom improvement', 'Pain-free motion'],
      regressionTriggers: ['Increased symptoms', 'New weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Neural mobilization for radial tunnel',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'median_nerve_glide_elbow',
    baseName: 'Median Nerve Glide at Elbow',
    baseNameSv: 'Medianusnerv Glidning vid Armbåge',
    bodyRegion: 'elbow',
    muscleGroups: ['median_nerve', 'pronator_teres', 'flexors'],
    exerciseType: 'neural_mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Pronator syndrome severe', 'Acute nerve injury'],
      precautions: ['Pronator syndrome', 'AIN syndrome'],
      redFlags: ['Thenar weakness', 'OK sign deficit'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-3', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '3-6', modifications: 'Very gentle' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full nerve glides' }
      ],
      progressionCriteria: ['Symptom improvement', 'Pain-free motion'],
      regressionTriggers: ['Increased symptoms', 'Thenar weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Neural mobilization for median nerve',
      studyType: 'Clinical trial'
    }
  },

  // ============================================
  // UCL / THROWING ATHLETE
  // ============================================
  {
    id: 'ucl_isometric_valgus',
    baseName: 'UCL Isometric Valgus Stress',
    baseNameSv: 'UCL Isometrisk Valgus Stress',
    bodyRegion: 'elbow',
    muscleGroups: ['FCU', 'pronator_teres', 'wrist_flexors'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'table'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete UCL tear', 'Post-TJ < 4 months'],
      precautions: ['Partial UCL tear', 'UCL reconstruction rehab'],
      redFlags: ['Instability', 'Ulnar nerve symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-16', modifications: 'Very light isometric' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full program' }
      ],
      progressionCriteria: ['No instability', 'Pain-free'],
      regressionTriggers: ['Medial elbow pain', 'Instability feeling']
    },
    evidenceBase: {
      level: 'B',
      source: 'Tommy John rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'throwers_ten_program',
    baseName: 'Throwers Ten Exercise',
    baseNameSv: 'Throwers Ten Övning',
    bodyRegion: 'elbow',
    muscleGroups: ['rotator_cuff', 'scapular', 'elbow_flexors', 'wrist_flexors'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing', 'sitting', 'prone'],
    allowedEquipment: ['resistance_band', 'dumbbell'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute UCL tear', 'Acute shoulder injury'],
      precautions: ['Post-TJ surgery', 'Shoulder impingement'],
      redFlags: ['Shoulder pain', 'Elbow instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Selected exercises only' },
        { phase: 2, weeksPostOp: '12-20', modifications: 'Progressive program' },
        { phase: 3, weeksPostOp: '20-28', modifications: 'Full program light' },
        { phase: 4, weeksPostOp: '28+', modifications: 'Full program' }
      ],
      progressionCriteria: ['All exercises pain-free', 'Strength normalized'],
      regressionTriggers: ['Pain with exercises', 'Fatigue patterns']
    },
    evidenceBase: {
      level: 'A',
      source: 'Wilk KE. Throwers Ten program. JOSPT, 2012',
      studyType: 'Expert consensus'
    }
  },
  {
    id: 'wrist_flexor_pronator_mass',
    baseName: 'Wrist Flexor-Pronator Mass Strengthening',
    baseNameSv: 'Handledsflexor-Pronator Styrka',
    bodyRegion: 'elbow',
    muscleGroups: ['FCR', 'FCU', 'pronator_teres', 'palmaris_longus'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell', 'resistance_band'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['UCL tear acute', 'Medial epicondylitis severe'],
      precautions: ['Post-TJ surgery', 'Golfer elbow'],
      redFlags: ['Ulnar nerve symptoms', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-16', modifications: 'Isometric only' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['Pain-free strengthening', 'Dynamic stability'],
      regressionTriggers: ['Medial elbow pain', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'UCL rehabilitation protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // ELBOW STABILITY
  // ============================================
  {
    id: 'elbow_joint_stability',
    baseName: 'Elbow Joint Stability Exercise',
    baseNameSv: 'Armbågsledstabilitet',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'triceps', 'brachialis', 'anconeus'],
    exerciseType: 'stability',
    allowedPositions: ['quadruped', 'standing'],
    allowedEquipment: ['none', 'stability_ball', 'wall'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Unstable dislocation', 'Acute fracture'],
      precautions: ['Post-dislocation', 'Ligament repair'],
      redFlags: ['Giving way', 'Recurrent instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Isometric stability' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full stability training' }
      ],
      progressionCriteria: ['No instability symptoms', 'Confident with activity'],
      regressionTriggers: ['Instability', 'Apprehension']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow instability rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'wall_push_up_elbow',
    baseName: 'Wall Push-Up for Elbow',
    baseNameSv: 'Vägg Armhävning för Armbåge',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'pectorals', 'elbow_stabilizers'],
    exerciseType: 'stability',
    allowedPositions: ['standing'],
    allowedEquipment: ['wall'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Unstable elbow', 'Acute injury'],
      precautions: ['Post-fracture', 'Post-dislocation'],
      redFlags: ['Pain with weight bearing', 'Giving way'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Very light wall push' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full weight bearing' }
      ],
      progressionCriteria: ['Pain-free push-up', 'Good control'],
      regressionTriggers: ['Pain with weight bearing', 'Instability']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow weight bearing progression',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'plank_elbow_stability',
    baseName: 'Plank for Elbow Stability',
    baseNameSv: 'Planka för Armbågsstabilitet',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'core', 'elbow_stabilizers'],
    exerciseType: 'stability',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Unstable elbow', 'Acute olecranon injury'],
      precautions: ['Post-fracture', 'Elbow arthritis'],
      redFlags: ['Elbow pain with weight bearing', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-10', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '10-14', modifications: 'Short duration, modified' },
        { phase: 3, weeksPostOp: '14-18', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '18+', modifications: 'Full planks' }
      ],
      progressionCriteria: ['60 sec plank pain-free', 'Good alignment'],
      regressionTriggers: ['Elbow pain', 'Compensation']
    },
    evidenceBase: {
      level: 'C',
      source: 'Weight bearing progression for elbow',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // FRACTURE SPECIFIC
  // ============================================
  {
    id: 'radial_head_fracture_rom',
    baseName: 'Radial Head Fracture ROM',
    baseNameSv: 'Radiushuvudfraktur ROM',
    bodyRegion: 'elbow',
    muscleGroups: ['supinator', 'biceps', 'brachioradialis'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable type 3/4 fracture', 'Acute dislocation'],
      precautions: ['Post-ORIF', 'Post-radial head arthroplasty'],
      redFlags: ['Mechanical block', 'Increasing stiffness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Early protected motion per protocol' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Active ROM' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Progressive ROM' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full ROM exercises' }
      ],
      progressionCriteria: ['ROM improving', 'Pain decreasing'],
      regressionTriggers: ['ROM loss', 'Increasing pain']
    },
    evidenceBase: {
      level: 'B',
      source: 'Radial head fracture rehabilitation guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'olecranon_fracture_rom',
    baseName: 'Olecranon Fracture ROM',
    baseNameSv: 'Olekranonfraktur ROM',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'anconeus'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable fracture', 'Tension band failure'],
      precautions: ['Post-ORIF', 'Hardware prominent'],
      redFlags: ['Hardware problems', 'Loss of extension'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Protected passive only' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Active assisted, avoid resistance' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Active ROM' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full ROM and strengthening' }
      ],
      progressionCriteria: ['Union confirmed', 'Extension strength'],
      regressionTriggers: ['Extension lag', 'Hardware symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Olecranon fracture rehabilitation guidelines',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'terrible_triad_protocol',
    baseName: 'Terrible Triad Rehabilitation',
    baseNameSv: 'Terrible Triad Rehabilitering',
    bodyRegion: 'elbow',
    muscleGroups: ['all_elbow_muscles'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'supine', 'standing'],
    allowedEquipment: ['none', 'hinged_brace'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Unstable repair', 'Non-compliant patient'],
      precautions: ['Complex instability pattern', 'LCL reconstruction'],
      redFlags: ['Recurrent instability', 'ROM not improving'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Hinged brace, early motion' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Progressive ROM in brace' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Brace weaning, strengthening' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full rehabilitation' }
      ],
      progressionCriteria: ['Stable elbow', 'Functional ROM'],
      regressionTriggers: ['Instability', 'ROM plateau']
    },
    evidenceBase: {
      level: 'B',
      source: 'Terrible triad elbow injury management',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // CONTRACTURE MANAGEMENT
  // ============================================
  {
    id: 'elbow_flexion_contracture_stretch',
    baseName: 'Elbow Flexion Contracture Stretch',
    baseNameSv: 'Armbågsflexionskontraktur Stretch',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'brachialis', 'anterior_capsule'],
    exerciseType: 'stretch',
    allowedPositions: ['supine', 'sitting'],
    allowedEquipment: ['none', 'weight', 'towel'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['HO forming', 'Unstable elbow'],
      precautions: ['HO history', 'Post-surgery'],
      redFlags: ['Increasing contracture', 'Pain with stretch > 4/10'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Per protocol' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle stretching' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full program' }
      ],
      progressionCriteria: ['Extension improving', 'Low pain stretching'],
      regressionTriggers: ['Increased pain', 'ROM plateau']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow contracture management',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'static_progressive_splinting',
    baseName: 'Static Progressive Splinting Exercise',
    baseNameSv: 'Statisk Progressiv Skenövning',
    bodyRegion: 'elbow',
    muscleGroups: ['elbow_capsule', 'biceps', 'triceps'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'supine'],
    allowedEquipment: ['turnbuckle_splint', 'dynasplint'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Active HO', 'Skin breakdown'],
      precautions: ['Sensitive skin', 'Nerve symptoms'],
      redFlags: ['Skin issues', 'Increasing contracture'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Per physician' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Low tension splinting' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive tension' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full protocol' }
      ],
      progressionCriteria: ['ROM gains with splinting', 'No skin issues'],
      regressionTriggers: ['No ROM improvement', 'Skin problems']
    },
    evidenceBase: {
      level: 'A',
      source: 'Doornberg JN. Static progressive splinting for elbow contracture. JBJS, 2006',
      studyType: 'Clinical trial'
    }
  },

  // ============================================
  // BURSITIS
  // ============================================
  {
    id: 'olecranon_bursitis_management',
    baseName: 'Olecranon Bursitis ROM',
    baseNameSv: 'Olekranonbursit ROM',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'elbow_extensors'],
    exerciseType: 'mobility',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Septic bursitis', 'Active infection'],
      precautions: ['Recurrent bursitis', 'Post-aspiration'],
      redFlags: ['Fever', 'Spreading redness', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Avoid pressure, gentle ROM' },
        { phase: 2, weeksPostOp: '2-4', modifications: 'Active ROM' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Progressive activity' },
        { phase: 4, weeksPostOp: '8+', modifications: 'Normal activity' }
      ],
      progressionCriteria: ['Swelling resolved', 'Pain-free motion'],
      regressionTriggers: ['Recurrent swelling', 'Infection signs']
    },
    evidenceBase: {
      level: 'C',
      source: 'Olecranon bursitis management guidelines',
      studyType: 'Expert consensus'
    }
  },

  // ============================================
  // FUNCTIONAL EXERCISES
  // ============================================
  {
    id: 'carrying_training',
    baseName: 'Carrying Task Training',
    baseNameSv: 'Bärträning',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'brachioradialis', 'grip'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['bags', 'weights', 'groceries'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Unstable fracture', 'Acute injury'],
      precautions: ['Post-surgery', 'Epicondylitis'],
      redFlags: ['Elbow giving way', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'No carrying' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Light objects only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive weight' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Normal carrying' }
      ],
      progressionCriteria: ['Can carry functional loads', 'No pain'],
      regressionTriggers: ['Pain with carrying', 'Fatigue']
    },
    evidenceBase: {
      level: 'C',
      source: 'Functional elbow rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'push_pull_training',
    baseName: 'Push-Pull Training',
    baseNameSv: 'Tryck-Drag Träning',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'biceps', 'pectorals', 'lats'],
    exerciseType: 'functional',
    allowedPositions: ['standing'],
    allowedEquipment: ['door', 'cable', 'resistance_band'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Unstable elbow', 'Acute injury'],
      precautions: ['Post-dislocation', 'Post-fracture'],
      redFlags: ['Instability', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-10', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '14-18', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '18+', modifications: 'Full activity' }
      ],
      progressionCriteria: ['Confident with tasks', 'No pain'],
      regressionTriggers: ['Pain with pushing/pulling', 'Apprehension']
    },
    evidenceBase: {
      level: 'C',
      source: 'Functional rehabilitation for elbow',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'reaching_overhead_training',
    baseName: 'Reaching and Overhead Training',
    baseNameSv: 'Räckvidd och Overhead Träning',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'triceps', 'shoulder_muscles'],
    exerciseType: 'functional',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['objects', 'shelves', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Unstable elbow', 'Shoulder injury concurrent'],
      precautions: ['Post-surgery', 'Limited ROM'],
      redFlags: ['Elbow locking', 'Shoulder pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Below shoulder only' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Shoulder height' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive overhead' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full overhead' }
      ],
      progressionCriteria: ['Full overhead reach', 'Pain-free function'],
      regressionTriggers: ['Pain with overhead', 'ROM limitation']
    },
    evidenceBase: {
      level: 'C',
      source: 'Functional elbow rehabilitation',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // SOFT TISSUE WORK
  // ============================================
  {
    id: 'forearm_self_massage',
    baseName: 'Forearm Self-Massage',
    baseNameSv: 'Underarm Självmassage',
    bodyRegion: 'elbow',
    muscleGroups: ['forearm_extensors', 'forearm_flexors'],
    exerciseType: 'soft_tissue',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'massage_ball', 'foam_roller'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Active infection', 'DVT', 'Anticoagulation'],
      precautions: ['Bruising', 'Sensitive tissue'],
      redFlags: ['Increased swelling', 'Spreading pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not on surgical area' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle away from incision' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Tissue mobility improved', 'Reduced tenderness'],
      regressionTriggers: ['Increased pain', 'Bruising']
    },
    evidenceBase: {
      level: 'C',
      source: 'Soft tissue mobilization for tendinopathy',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'lateral_epicondyle_soft_tissue',
    baseName: 'Lateral Epicondyle Soft Tissue Work',
    baseNameSv: 'Laterala Epikondylen Mjukvävnadsarbete',
    bodyRegion: 'elbow',
    muscleGroups: ['ECRB_origin', 'common_extensor_tendon'],
    exerciseType: 'soft_tissue',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'massage_tool'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Post-injection < 48 hours', 'Active infection'],
      precautions: ['Severe tendinopathy', 'Skin sensitivity'],
      redFlags: ['Increased swelling', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Very gentle' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Reduced point tenderness', 'Tissue mobility'],
      regressionTriggers: ['Increased pain', 'Worsening symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Soft tissue treatment for tennis elbow',
      studyType: 'Clinical trial'
    }
  },
  {
    id: 'medial_epicondyle_soft_tissue',
    baseName: 'Medial Epicondyle Soft Tissue Work',
    baseNameSv: 'Mediala Epikondylen Mjukvävnadsarbete',
    bodyRegion: 'elbow',
    muscleGroups: ['common_flexor_tendon', 'pronator_teres'],
    exerciseType: 'soft_tissue',
    allowedPositions: ['sitting'],
    allowedEquipment: ['none', 'massage_tool'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Post-injection < 48 hours', 'UCL injury'],
      precautions: ['Ulnar nerve sensitivity', 'Severe tendinopathy'],
      redFlags: ['Ulnar nerve symptoms', 'Increased swelling'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Very gentle, avoid nerve' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['Reduced point tenderness', 'No nerve symptoms'],
      regressionTriggers: ['Increased pain', 'Ulnar symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Soft tissue treatment for golfer elbow',
      studyType: 'Clinical trial'
    }
  },

  // ============================================
  // ISOMETRIC EXERCISES
  // ============================================
  {
    id: 'elbow_isometric_wrist_extension',
    baseName: 'Isometric Wrist Extension',
    baseNameSv: 'Isometrisk Handledsextension',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_extensors', 'ECRB'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'table'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute lateral epicondylitis flare'],
      precautions: ['Pain > 3/10 during exercise'],
      redFlags: ['Increasing pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Pain-free only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive load' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full isometrics' }
      ],
      progressionCriteria: ['Pain-free hold 45 sec', '< 2/10 pain'],
      regressionTriggers: ['Pain > 4/10', 'Next day soreness']
    },
    evidenceBase: {
      level: 'A',
      source: 'Rio E. Isometric exercise for tendinopathy. BJSM, 2015',
      studyType: 'RCT'
    }
  },
  {
    id: 'elbow_isometric_wrist_flexion',
    baseName: 'Isometric Wrist Flexion',
    baseNameSv: 'Isometrisk Handledsflexion',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_flexors', 'FCR', 'FCU'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'table'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute medial epicondylitis flare'],
      precautions: ['Ulnar nerve sensitivity'],
      redFlags: ['Ulnar nerve symptoms', 'Medial elbow instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Gentle, pain-free' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full load' }
      ],
      progressionCriteria: ['Pain-free hold 45 sec'],
      regressionTriggers: ['Pain > 4/10', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'A',
      source: 'Rio E. Isometric exercise for tendinopathy. BJSM, 2015',
      studyType: 'RCT'
    }
  },
  {
    id: 'elbow_isometric_supination',
    baseName: 'Isometric Supination',
    baseNameSv: 'Isometrisk Supination',
    bodyRegion: 'elbow',
    muscleGroups: ['supinator', 'biceps'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'doorframe'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Radial head fracture acute'],
      precautions: ['Radial tunnel syndrome'],
      redFlags: ['Radiating pain', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full load' }
      ],
      progressionCriteria: ['No pain during exercise'],
      regressionTriggers: ['Pain on supination']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm isometric strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_isometric_pronation',
    baseName: 'Isometric Pronation',
    baseNameSv: 'Isometrisk Pronation',
    bodyRegion: 'elbow',
    muscleGroups: ['pronator_teres', 'pronator_quadratus'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'doorframe'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Median nerve compression'],
      precautions: ['Pronator syndrome'],
      redFlags: ['Numbness in hand', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full load' }
      ],
      progressionCriteria: ['No nerve symptoms'],
      regressionTriggers: ['Nerve symptoms', 'Pain']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm isometric strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // NERVE GLIDING
  // ============================================
  {
    id: 'elbow_ulnar_nerve_glide',
    baseName: 'Ulnar Nerve Gliding',
    baseNameSv: 'Ulnarisnerv Glidning',
    bodyRegion: 'elbow',
    muscleGroups: ['ulnar_nerve'],
    exerciseType: 'nerve_glide',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute nerve injury', 'Post ulnar nerve transposition < 4 weeks'],
      precautions: ['Cubital tunnel syndrome', 'Nerve hypersensitivity'],
      redFlags: ['Increased numbness', 'Burning pain', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle tensioners only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive gliding' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full gliding' }
      ],
      progressionCriteria: ['No symptom increase'],
      regressionTriggers: ['Increased symptoms', 'Lasting numbness']
    },
    evidenceBase: {
      level: 'A',
      source: 'Coppieters MW. Neural mobilization for cubital tunnel. JOSPT, 2015',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'elbow_radial_nerve_glide',
    baseName: 'Radial Nerve Gliding',
    baseNameSv: 'Radialisnerv Glidning',
    bodyRegion: 'elbow',
    muscleGroups: ['radial_nerve'],
    exerciseType: 'nerve_glide',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute radial nerve palsy'],
      precautions: ['Radial tunnel syndrome', 'Saturday night palsy recovery'],
      redFlags: ['Wrist drop', 'Increased weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle tensioners' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full gliding' }
      ],
      progressionCriteria: ['No symptom provocation'],
      regressionTriggers: ['Symptom reproduction']
    },
    evidenceBase: {
      level: 'B',
      source: 'Radial nerve mobilization techniques',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_median_nerve_glide',
    baseName: 'Median Nerve Gliding at Elbow',
    baseNameSv: 'Medianusnerv Glidning vid Armbåge',
    bodyRegion: 'elbow',
    muscleGroups: ['median_nerve'],
    exerciseType: 'nerve_glide',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute nerve compression'],
      precautions: ['Pronator syndrome', 'AIN syndrome'],
      redFlags: ['Increased numbness', 'Hand weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full technique' }
      ],
      progressionCriteria: ['No symptom provocation'],
      regressionTriggers: ['Increased symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Median nerve mobilization at elbow',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // UCL REHABILITATION
  // ============================================
  {
    id: 'elbow_ucl_valgus_stress_isometric',
    baseName: 'UCL Valgus Stress Isometric',
    baseNameSv: 'UCL Valgusstress Isometrisk',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_flexors', 'pronator_teres'],
    exerciseType: 'isometric',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none', 'resistance_band_light'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete UCL tear', 'Post Tommy John < 12 weeks'],
      precautions: ['Partial UCL tear', 'Valgus instability'],
      redFlags: ['Medial elbow pain', 'Instability feeling'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Gentle submaximal' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Sport-specific' }
      ],
      progressionCriteria: ['Pain-free', 'No instability'],
      regressionTriggers: ['Medial pain', 'Instability']
    },
    evidenceBase: {
      level: 'A',
      source: 'Reinold MM. Tommy John rehabilitation protocol. AJSM, 2018',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_pronator_strengthening_ucl',
    baseName: 'Pronator Strengthening for UCL',
    baseNameSv: 'Pronatorstärkning för UCL',
    bodyRegion: 'elbow',
    muscleGroups: ['pronator_teres', 'pronator_quadratus'],
    exerciseType: 'strength',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell_light', 'resistance_band_light', 'resistance_band_medium'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Complete UCL rupture', 'Post-op < 16 weeks'],
      precautions: ['UCL reconstruction healing'],
      redFlags: ['Medial elbow pain', 'Valgus laxity'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Isometrics only' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Progressive loading' }
      ],
      progressionCriteria: ['No medial symptoms'],
      regressionTriggers: ['Medial pain', 'Instability']
    },
    evidenceBase: {
      level: 'A',
      source: 'UCL rehabilitation protocol',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_flexor_carpi_ulnaris_strengthening',
    baseName: 'Flexor Carpi Ulnaris Strengthening',
    baseNameSv: 'Flexor Carpi Ulnaris Stärkning',
    bodyRegion: 'elbow',
    muscleGroups: ['FCU', 'wrist_flexors'],
    exerciseType: 'strength',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell_light', 'dumbbell_medium', 'resistance_band_light'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['UCL injury acute', 'Post-op < 12 weeks'],
      precautions: ['Ulnar nerve symptoms', 'Medial epicondylitis'],
      redFlags: ['Ulnar symptoms', 'Medial instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-18', modifications: 'Isometrics then light' },
        { phase: 3, weeksPostOp: '18-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full strengthening' }
      ],
      progressionCriteria: ['No medial symptoms'],
      regressionTriggers: ['Pain', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'FCU strengthening for UCL stability',
      studyType: 'Biomechanical study'
    }
  },

  // ============================================
  // PROGRESSIVE STRENGTHENING
  // ============================================
  {
    id: 'elbow_biceps_curl_supinated',
    baseName: 'Biceps Curl Supinated',
    baseNameSv: 'Bicepscurl Supinerad',
    bodyRegion: 'elbow',
    muscleGroups: ['biceps', 'brachialis'],
    exerciseType: 'strength',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell_light', 'dumbbell_medium', 'dumbbell_heavy', 'resistance_band_light', 'resistance_band_medium'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Distal biceps rupture', 'Post biceps repair < 8 weeks'],
      precautions: ['Biceps tendinopathy', 'Anterior elbow pain'],
      redFlags: ['Popping sensation', 'Sudden weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Active only, no resistance' },
        { phase: 3, weeksPostOp: '10-16', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Progressive' }
      ],
      progressionCriteria: ['No anterior pain'],
      regressionTriggers: ['Pain > 3/10', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Elbow strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_hammer_curl',
    baseName: 'Hammer Curl',
    baseNameSv: 'Hammarcurl',
    bodyRegion: 'elbow',
    muscleGroups: ['brachioradialis', 'biceps'],
    exerciseType: 'strength',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell_light', 'dumbbell_medium', 'dumbbell_heavy'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Radial head fracture acute'],
      precautions: ['Lateral epicondylitis'],
      redFlags: ['Lateral elbow pain', 'Crepitus'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Active only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Progressive' }
      ],
      progressionCriteria: ['Pain-free'],
      regressionTriggers: ['Pain', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Forearm strengthening',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_reverse_curl',
    baseName: 'Reverse Curl',
    baseNameSv: 'Omvänd Curl',
    bodyRegion: 'elbow',
    muscleGroups: ['brachioradialis', 'wrist_extensors'],
    exerciseType: 'strength',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell_light', 'dumbbell_medium', 'barbell', 'ez_bar'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute lateral epicondylitis'],
      precautions: ['Tennis elbow', 'Radial tunnel'],
      redFlags: ['Lateral pain', 'Weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Active only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Progressive' }
      ],
      progressionCriteria: ['No lateral pain'],
      regressionTriggers: ['Pain > 3/10']
    },
    evidenceBase: {
      level: 'B',
      source: 'Extensor strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_triceps_extension',
    baseName: 'Triceps Extension',
    baseNameSv: 'Tricepsextension',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps'],
    exerciseType: 'strength',
    allowedPositions: ['sitting', 'standing', 'supine'],
    allowedEquipment: ['dumbbell_light', 'dumbbell_medium', 'resistance_band_light', 'resistance_band_medium', 'cable_machine'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Triceps tendon rupture', 'Olecranon fracture acute'],
      precautions: ['Triceps tendinopathy', 'Posterior elbow pain'],
      redFlags: ['Popping', 'Sudden weakness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Active only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Progressive' }
      ],
      progressionCriteria: ['Pain-free extension'],
      regressionTriggers: ['Posterior pain', 'Weakness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Triceps strengthening protocols',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_overhead_triceps_extension',
    baseName: 'Overhead Triceps Extension',
    baseNameSv: 'Overhead Tricepsextension',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps_long_head'],
    exerciseType: 'strength',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['dumbbell_light', 'dumbbell_medium', 'resistance_band_light'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Shoulder impingement', 'Triceps rupture'],
      precautions: ['Shoulder issues', 'Triceps tendinopathy'],
      redFlags: ['Shoulder pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Active only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Progressive' }
      ],
      progressionCriteria: ['No shoulder or elbow pain'],
      regressionTriggers: ['Pain during exercise']
    },
    evidenceBase: {
      level: 'B',
      source: 'Triceps rehabilitation',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // PLYOMETRIC & SPORT-SPECIFIC
  // ============================================
  {
    id: 'elbow_medicine_ball_throw',
    baseName: 'Medicine Ball Throw',
    baseNameSv: 'Medicinbollskast',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'wrist_flexors', 'forearm'],
    exerciseType: 'plyometric',
    allowedPositions: ['standing', 'kneeling'],
    allowedEquipment: ['medicine_ball'],
    allowedDifficulties: ['advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['UCL injury', 'Post-op < 6 months', 'Elbow instability'],
      precautions: ['Lateral or medial epicondylitis'],
      redFlags: ['Elbow pain', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Light, two-handed' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Sport-specific' }
      ],
      progressionCriteria: ['Pain-free', 'Full ROM', 'Adequate strength'],
      regressionTriggers: ['Pain', 'Soreness > 24h']
    },
    evidenceBase: {
      level: 'B',
      source: 'Plyometric training for throwers',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_wrist_snap_training',
    baseName: 'Wrist Snap Training',
    baseNameSv: 'Handled Snap Träning',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_flexors', 'pronator'],
    exerciseType: 'sport_specific',
    allowedPositions: ['standing'],
    allowedEquipment: ['resistance_band_light', 'weighted_ball'],
    allowedDifficulties: ['advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['UCL injury', 'Medial epicondylitis acute'],
      precautions: ['History of elbow problems'],
      redFlags: ['Medial elbow pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-20', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '20-28', modifications: 'Submaximal' },
        { phase: 3, weeksPostOp: '28-36', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '36+', modifications: 'Full training' }
      ],
      progressionCriteria: ['Pain-free throwing mechanics'],
      regressionTriggers: ['Pain', 'Altered mechanics']
    },
    evidenceBase: {
      level: 'B',
      source: 'Throwing athlete rehabilitation',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_plyometric_push_up',
    baseName: 'Plyometric Push-Up',
    baseNameSv: 'Plyometrisk Push-up',
    bodyRegion: 'elbow',
    muscleGroups: ['triceps', 'chest', 'shoulder'],
    exerciseType: 'plyometric',
    allowedPositions: ['prone'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Elbow instability', 'Post-op < 4 months', 'Wrist injury'],
      precautions: ['Previous elbow trauma'],
      redFlags: ['Pain on landing', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Still not allowed' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Wall plyos only' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Progressive floor plyos' }
      ],
      progressionCriteria: ['Full ROM', 'Adequate strength', 'Pain-free'],
      regressionTriggers: ['Pain', 'Soreness']
    },
    evidenceBase: {
      level: 'B',
      source: 'Upper extremity plyometrics',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // RADIAL TUNNEL SPECIFIC
  // ============================================
  {
    id: 'elbow_supinator_stretch',
    baseName: 'Supinator Stretch',
    baseNameSv: 'Supinatorsträck',
    bodyRegion: 'elbow',
    muscleGroups: ['supinator'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Radial nerve palsy acute'],
      precautions: ['Radial tunnel syndrome'],
      redFlags: ['Increased numbness', 'Wrist drop'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle only' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['No nerve symptoms'],
      regressionTriggers: ['Increased symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'Radial tunnel syndrome management',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_ecrb_release_stretch',
    baseName: 'ECRB Release Stretch',
    baseNameSv: 'ECRB Stretch',
    bodyRegion: 'elbow',
    muscleGroups: ['ECRB', 'wrist_extensors'],
    exerciseType: 'stretch',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute tear'],
      precautions: ['Severe lateral epicondylitis'],
      redFlags: ['Increased lateral pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Reduced lateral tenderness'],
      regressionTriggers: ['Increased pain']
    },
    evidenceBase: {
      level: 'A',
      source: 'Bisset L. Tennis elbow management. BJSM, 2015',
      studyType: 'Systematic review'
    }
  },

  // ============================================
  // FUNCTIONAL EXERCISES
  // ============================================
  {
    id: 'elbow_jar_opening_simulation',
    baseName: 'Jar Opening Simulation',
    baseNameSv: 'Burköppning Simulering',
    bodyRegion: 'elbow',
    muscleGroups: ['grip', 'supinator', 'pronator'],
    exerciseType: 'functional',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['therapy_putty', 'jar'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute wrist or elbow injury'],
      precautions: ['Epicondylitis', 'Carpal tunnel'],
      redFlags: ['Pain during activity'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Very light' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full function' }
      ],
      progressionCriteria: ['Pain-free ADL'],
      regressionTriggers: ['Pain during ADL']
    },
    evidenceBase: {
      level: 'C',
      source: 'Functional rehabilitation for elbow',
      studyType: 'Expert consensus'
    }
  },
  {
    id: 'elbow_towel_wringing',
    baseName: 'Towel Wringing Exercise',
    baseNameSv: 'Handdukvridning',
    bodyRegion: 'elbow',
    muscleGroups: ['forearm_flexors', 'forearm_extensors', 'grip'],
    exerciseType: 'functional',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['towel'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute lateral or medial epicondylitis'],
      precautions: ['Chronic tendinopathy'],
      redFlags: ['Pain during wringing'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Dry towel only' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Wet towel' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full resistance' }
      ],
      progressionCriteria: ['Pain-free bilateral'],
      regressionTriggers: ['Pain > 3/10']
    },
    evidenceBase: {
      level: 'C',
      source: 'Functional forearm strengthening',
      studyType: 'Clinical guideline'
    }
  },
  {
    id: 'elbow_typing_ergonomic_training',
    baseName: 'Typing Ergonomic Training',
    baseNameSv: 'Skrivbordsergonomi Träning',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_extensors', 'finger_extensors'],
    exerciseType: 'ergonomic',
    allowedPositions: ['sitting'],
    allowedEquipment: ['keyboard', 'desk'],
    allowedDifficulties: ['beginner'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: [],
      precautions: ['Active epicondylitis'],
      redFlags: ['Pain during typing'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Limit typing' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Frequent breaks' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Normal with breaks' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Normal ergonomics' }
      ],
      progressionCriteria: ['Pain-free typing'],
      regressionTriggers: ['Pain during work']
    },
    evidenceBase: {
      level: 'B',
      source: 'Ergonomic interventions for epicondylitis',
      studyType: 'Clinical guideline'
    }
  },

  // ============================================
  // ECCENTRIC EXERCISES
  // ============================================
  {
    id: 'elbow_eccentric_wrist_extension_slow',
    baseName: 'Slow Eccentric Wrist Extension',
    baseNameSv: 'Långsam Excentrisk Handledsextension',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_extensors', 'ECRB'],
    exerciseType: 'eccentric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell_light', 'resistance_band_light'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute tendinopathy flare'],
      precautions: ['High pain levels'],
      redFlags: ['Pain > 5/10 during exercise'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Isometrics only' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light eccentrics' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full eccentric program' }
      ],
      progressionCriteria: ['Pain < 4/10 during exercise', 'No next-day flare'],
      regressionTriggers: ['Pain > 5/10', 'Symptom worsening']
    },
    evidenceBase: {
      level: 'A',
      source: 'Malliaras P. Eccentric training for tendinopathy. BJSM, 2013',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'elbow_eccentric_wrist_flexion_slow',
    baseName: 'Slow Eccentric Wrist Flexion',
    baseNameSv: 'Långsam Excentrisk Handledsflexion',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_flexors', 'FCR', 'FCU'],
    exerciseType: 'eccentric',
    allowedPositions: ['sitting'],
    allowedEquipment: ['dumbbell_light', 'resistance_band_light'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute medial epicondylitis flare'],
      precautions: ['Ulnar nerve sensitivity'],
      redFlags: ['Ulnar symptoms', 'Pain > 5/10'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-10', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '10-14', modifications: 'Isometrics only' },
        { phase: 3, weeksPostOp: '14-20', modifications: 'Light eccentrics' },
        { phase: 4, weeksPostOp: '20+', modifications: 'Full program' }
      ],
      progressionCriteria: ['Pain < 4/10', 'No nerve symptoms'],
      regressionTriggers: ['Pain > 5/10', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'A',
      source: 'Eccentric training for medial epicondylitis',
      studyType: 'Systematic review'
    }
  },
  {
    id: 'elbow_tyler_twist',
    baseName: 'Tyler Twist (FlexBar)',
    baseNameSv: 'Tyler Twist (FlexBar)',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_extensors', 'ECRB'],
    exerciseType: 'eccentric',
    allowedPositions: ['standing', 'sitting'],
    allowedEquipment: ['flexbar'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute lateral epicondylitis flare'],
      precautions: ['High irritability'],
      redFlags: ['Pain > 5/10', 'Worsening symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-10', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '10-14', modifications: 'Yellow bar only' },
        { phase: 3, weeksPostOp: '14-18', modifications: 'Progress to red' },
        { phase: 4, weeksPostOp: '18+', modifications: 'Full protocol' }
      ],
      progressionCriteria: ['Pain < 3/10', 'Able to complete 3x15'],
      regressionTriggers: ['Pain > 4/10', 'Cannot complete sets']
    },
    evidenceBase: {
      level: 'A',
      source: 'Tyler TF. FlexBar eccentric exercise for lateral epicondylitis. JOSPT, 2010',
      studyType: 'RCT'
    }
  },
  {
    id: 'elbow_reverse_tyler_twist',
    baseName: 'Reverse Tyler Twist',
    baseNameSv: 'Omvänd Tyler Twist',
    bodyRegion: 'elbow',
    muscleGroups: ['wrist_flexors', 'FCR'],
    exerciseType: 'eccentric',
    allowedPositions: ['standing', 'sitting'],
    allowedEquipment: ['flexbar'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute medial epicondylitis flare', 'UCL injury'],
      precautions: ['High irritability', 'Ulnar nerve symptoms'],
      redFlags: ['Medial instability', 'Ulnar symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Yellow bar only' },
        { phase: 3, weeksPostOp: '16-20', modifications: 'Progress bar color' },
        { phase: 4, weeksPostOp: '20+', modifications: 'Full protocol' }
      ],
      progressionCriteria: ['Pain < 3/10', 'No nerve symptoms'],
      regressionTriggers: ['Pain > 4/10', 'Nerve symptoms']
    },
    evidenceBase: {
      level: 'B',
      source: 'FlexBar exercise for medial epicondylitis',
      studyType: 'Clinical trial'
    }
  }
];

export default elbowTemplates;
