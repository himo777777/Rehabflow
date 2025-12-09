/**
 * Thoracic Spine Exercise Templates
 * Based on evidence-based practice for thoracic mobility and posture
 */

import { BaseExerciseTemplate } from '../types';

export const thoracicTemplates: BaseExerciseTemplate[] = [
  // ============================================
  // THORACIC EXTENSION
  // ============================================
  {
    id: 'thoracic_foam_roll_extension',
    baseName: 'Foam Roller Thoracic Extension',
    baseNameSv: 'Foamroller Thorakalextension',
    description: 'Mobilizing thoracic extension over foam roller',
    descriptionSv: 'Mobilisering av thorakalextension över foamroller',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'rhomboids'],
    jointType: 'thoracic',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'foam_roller',
    allowedEquipment: ['foam_roller', 'towel'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Lie on back with foam roller under thoracic spine', 'Support head with hands', 'Extend back over roller', 'Move roller up/down spine', 'Focus on stiff segments', 'Breathe deeply'],
    instructionsSv: ['Ligg på rygg med foamroller under bröstryggen', 'Stöd huvudet med händerna', 'Sträck ryggen över rullen', 'Flytta rullen upp/ner längs ryggen', 'Fokusera på stela segment', 'Andas djupt'],
    techniquePoints: ['Keep lower back neutral', 'Control movement', 'Target thoracic only'],
    safetyData: {
      contraindications: ['Osteoporosis', 'Vertebral fracture', 'Acute disc herniation'],
      precautions: ['Spine surgery - avoid direct pressure on surgical site'],
      redFlags: ['Radiating pain', 'Numbness', 'Weakness'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Thoracic spine', targetStructure: 'Thoracic extension mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle, avoid surgical level'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic decompression'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Lumbar hyperextension'] }
    },
    evidenceBase: { level: 'B', source: 'Heneghan NR. Thoracic spine manual therapy. Man Ther, 2016', studyType: 'Systematic review' }
  },

  {
    id: 'thoracic_cat_cow',
    baseName: 'Cat-Cow Thoracic Focus',
    baseNameSv: 'Katt-Ko Thorakalfokus',
    description: 'Segmental thoracic flexion and extension',
    descriptionSv: 'Segmentell thorakalflexion och extension',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'rectus_abdominis'],
    jointType: 'thoracic',
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
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Start on hands and knees', 'Arch back up (cat)', 'Drop belly down (cow)', 'Focus movement in thoracic area', 'Minimize lumbar movement', 'Move slowly with breath'],
    instructionsSv: ['Börja på händer och knän', 'Runda ryggen uppåt (katt)', 'Sänk magen nedåt (ko)', 'Fokusera rörelsen i bröstryggen', 'Minimera ländryggsrörelse', 'Rör dig långsamt med andningen'],
    techniquePoints: ['Isolate thoracic movement', 'Sync with breathing', 'Control through full range'],
    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Wrist pain - use fists'],
      redFlags: ['Radiating symptoms'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Thoracic spine', targetStructure: 'Thoracic segmental mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle, limited range'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Lumbar dominance'] }
    },
    evidenceBase: { level: 'B', source: 'Heneghan NR. Thoracic mobility. Man Ther, 2016', studyType: 'Systematic review' }
  },

  {
    id: 'thoracic_thread_needle',
    baseName: 'Thread the Needle',
    baseNameSv: 'Trä Nålen',
    description: 'Thoracic rotation in quadruped position',
    descriptionSv: 'Thorakalrotation i fyrfotaposition',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'erector_spinae', 'rhomboids'],
    jointType: 'thoracic',
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
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Start on hands and knees', 'Thread one arm under body', 'Rotate thoracic spine', 'Return and reach up', 'Follow hand with eyes', 'Exhale into rotation'],
    instructionsSv: ['Börja på händer och knän', 'Trä ena armen under kroppen', 'Rotera bröstryggen', 'Återvänd och sträck upp', 'Följ handen med ögonen', 'Andas ut i rotationen'],
    techniquePoints: ['Keep hips stable', 'Full rotation each way', 'Control movement'],
    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Shoulder pain - reduce range'],
      redFlags: ['Radiating symptoms'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Thoracic spine', targetStructure: 'Thoracic rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Hip rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Heneghan NR. Thoracic rotation. Man Ther, 2016', studyType: 'Systematic review' }
  },

  // ============================================
  // THORACIC ROTATION
  // ============================================
  {
    id: 'thoracic_open_book',
    baseName: 'Open Book Stretch',
    baseNameSv: 'Öppna Boken Stretch',
    description: 'Side-lying thoracic rotation stretch',
    descriptionSv: 'Sidoliggande thorakalrotationsstretch',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'pectoralis_major', 'rhomboids'],
    jointType: 'thoracic',
    exerciseType: 'stretch',
    basePosition: 'side_lying',
    allowedPositions: ['side_lying'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'pillow'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Lie on side with knees bent', 'Arms straight out in front', 'Open top arm like a book', 'Rotate through thoracic spine', 'Keep knees together', 'Hold and breathe'],
    instructionsSv: ['Ligg på sidan med knäna böjda', 'Armarna rakt ut framför', 'Öppna överarmen som en bok', 'Rotera genom bröstryggen', 'Håll knäna ihop', 'Håll och andas'],
    techniquePoints: ['Keep knees down', 'Rotate through thoracic', 'Eyes follow hand'],
    safetyData: {
      contraindications: ['Shoulder instability'],
      precautions: ['Shoulder pain - reduce range'],
      redFlags: ['Shoulder subluxation'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Thoracic spine, pectorals', targetStructure: 'Thoracic rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Pelvis rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Heneghan NR. Thoracic rotation. Man Ther, 2016', studyType: 'Systematic review' }
  },

  {
    id: 'thoracic_seated_rotation',
    baseName: 'Seated Thoracic Rotation',
    baseNameSv: 'Sittande Thorakalrotation',
    description: 'Rotation in seated position with arms crossed',
    descriptionSv: 'Rotation i sittande position med armarna korsade',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'erector_spinae'],
    jointType: 'thoracic',
    exerciseType: 'mobility',
    basePosition: 'sitting',
    allowedPositions: ['sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'stick_dowel'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Sit tall on chair or floor', 'Cross arms over chest', 'Rotate thoracic spine', 'Keep hips fixed', 'Return to center', 'Alternate sides'],
    instructionsSv: ['Sitt rakt på stol eller golv', 'Korsa armarna över bröstet', 'Rotera bröstryggen', 'Håll höfterna fixerade', 'Återvänd till mitten', 'Alternera sidor'],
    techniquePoints: ['Keep pelvis still', 'Full rotation', 'Control movement'],
    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Post-surgery - follow ROM limits'],
      redFlags: ['Radiating symptoms'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Thoracic spine', targetStructure: 'Thoracic rotation',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Pelvis rotation'] }
    },
    evidenceBase: { level: 'B', source: 'Heneghan NR. Thoracic mobility. Man Ther, 2016', studyType: 'Systematic review' }
  },

  // ============================================
  // POSTURAL EXERCISES
  // ============================================
  {
    id: 'thoracic_bruegger_position',
    baseName: 'Brugger Relief Position',
    baseNameSv: 'Brugger Avlastningsposition',
    description: 'Postural reset for desk workers',
    descriptionSv: 'Hållningskorrigering för skrivbordsarbetare',
    bodyRegion: 'thoracic',
    muscleGroups: ['lower_trapezius', 'rhomboids', 'erector_spinae'],
    jointType: 'thoracic',
    exerciseType: 'isometric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 3, max: 5 },
    baseHoldSeconds: 10,
    baseRestSeconds: 20,
    instructions: ['Sit at edge of chair', 'Feet apart, slight dorsiflexion', 'Externally rotate arms', 'Lift chest, retract scapulae', 'Perform chin tuck', 'Breathe deeply'],
    instructionsSv: ['Sitt vid stolens kant', 'Fötterna isär, lätt dorsalflexion', 'Utåtrotera armarna', 'Lyft bröstkorgen, dra ihop skulderbladen', 'Gör chin tuck', 'Andas djupt'],
    techniquePoints: ['Full postural correction', 'Sustain position', 'Regular breaks'],
    safetyData: {
      contraindications: [],
      precautions: [],
      redFlags: [],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Postural muscles', targetStructure: 'Postural correction',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Any'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Lumbar hyperextension'] }
    },
    evidenceBase: { level: 'B', source: 'Brugger A. Postural relief. J Manipulative Physiol Ther, 2000', studyType: 'Clinical study' }
  },

  {
    id: 'thoracic_wall_slide',
    baseName: 'Wall Slide',
    baseNameSv: 'Väggglid',
    description: 'Scapular movement with back against wall',
    descriptionSv: 'Skulderbladsrörelse med ryggen mot vägg',
    bodyRegion: 'thoracic',
    muscleGroups: ['lower_trapezius', 'serratus_anterior', 'rhomboids'],
    jointType: 'thoracic',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Stand with back flat against wall', 'Arms at 90 degrees, elbows bent', 'Slide arms up the wall', 'Keep back and arms in contact', 'Slide down with control', 'Repeat slowly'],
    instructionsSv: ['Stå med ryggen platt mot väggen', 'Armarna i 90 grader, armbågarna böjda', 'Glid armarna uppåt längs väggen', 'Håll rygg och armar i kontakt', 'Glid ner med kontroll', 'Upprepa långsamt'],
    techniquePoints: ['Maintain wall contact', 'Full overhead reach if possible', 'Control throughout'],
    safetyData: {
      contraindications: ['Frozen shoulder'],
      precautions: ['Shoulder impingement - limit range'],
      redFlags: ['Shoulder pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Scapular stabilizers', targetStructure: 'Scapular mobility and control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Arching off wall'] }
    },
    evidenceBase: { level: 'B', source: 'Cools AM. Scapular exercises. JOSPT, 2014', studyType: 'Clinical review' }
  },

  {
    id: 'thoracic_prone_ytw',
    baseName: 'Prone Y-T-W',
    baseNameSv: 'Pronliggande Y-T-W',
    description: 'Prone scapular exercises for posture',
    descriptionSv: 'Pronliggande skulderbladsövningar för hållning',
    bodyRegion: 'thoracic',
    muscleGroups: ['lower_trapezius', 'middle_trapezius', 'rhomboids'],
    jointType: 'thoracic',
    exerciseType: 'concentric',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'dumbbell'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 45,
    instructions: ['Lie face down', 'Perform Y position (arms overhead)', 'Perform T position (arms out to sides)', 'Perform W position (elbows bent)', 'Hold each briefly', 'Squeeze shoulder blades'],
    instructionsSv: ['Ligg på mage', 'Utför Y-position (armar ovanför huvudet)', 'Utför T-position (armar ut åt sidorna)', 'Utför W-position (armbågarna böjda)', 'Håll varje kort', 'Kläm ihop skulderbladen'],
    techniquePoints: ['Thumbs up for Y', 'Squeeze scapulae', 'Control throughout'],
    safetyData: {
      contraindications: ['Acute rotator cuff injury'],
      precautions: ['Shoulder pain - reduce range'],
      redFlags: ['Shoulder pain that worsens'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Scapular stabilizers', targetStructure: 'Scapular strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['No weight'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery', 'Shoulder surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Neck extension'] }
    },
    evidenceBase: { level: 'A', source: 'Cools AM. Scapular rehabilitation. JOSPT, 2014', studyType: 'Clinical practice guideline' }
  },

  // ============================================
  // THORACIC STRETCHES
  // ============================================
  {
    id: 'thoracic_doorway_stretch',
    baseName: 'Doorway Pec Stretch',
    baseNameSv: 'Dörröppning Pec Stretch',
    description: 'Pectoral stretch in doorway for thoracic extension',
    descriptionSv: 'Pectoralisstretch i dörröppning för thorakalextension',
    bodyRegion: 'thoracic',
    muscleGroups: ['pectoralis_major', 'pectoralis_minor'],
    jointType: 'thoracic',
    exerciseType: 'stretch',
    basePosition: 'standing',
    allowedPositions: ['standing'],
    baseEquipment: 'wall',
    allowedEquipment: ['wall'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Stand in doorway', 'Place forearms on door frame', 'Step forward gently', 'Feel stretch in chest', 'Keep back straight', 'Breathe deeply'],
    instructionsSv: ['Stå i en dörröppning', 'Placera underarmarna mot dörrkarmen', 'Stega försiktigt framåt', 'Känn stretch i bröstet', 'Håll ryggen rak', 'Andas djupt'],
    techniquePoints: ['Vary arm height for different areas', 'Gentle lean', 'Sustain stretch'],
    safetyData: {
      contraindications: ['Anterior shoulder instability'],
      precautions: ['Shoulder injury - reduce intensity'],
      redFlags: ['Anterior shoulder pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Pectorals', targetStructure: 'Pectoral flexibility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Lumbar arching'] }
    },
    evidenceBase: { level: 'B', source: 'Borstad JD. Pectoral tightness and posture. JOSPT, 2006', studyType: 'Clinical study' }
  },

  {
    id: 'thoracic_childs_pose',
    baseName: 'Child\'s Pose',
    baseNameSv: 'Barnets Position',
    description: 'Resting stretch for thoracic spine',
    descriptionSv: 'Vilostretch för bröstryggen',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'latissimus_dorsi'],
    jointType: 'thoracic',
    exerciseType: 'stretch',
    basePosition: 'kneeling',
    allowedPositions: ['kneeling'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat', 'pillow'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 3, max: 5 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 30,
    baseRestSeconds: 20,
    instructions: ['Kneel on floor', 'Sit back on heels', 'Reach arms forward', 'Rest forehead on floor', 'Breathe into back', 'Hold and relax'],
    instructionsSv: ['Knäböj på golvet', 'Sitt tillbaka på hälarna', 'Sträck armarna framåt', 'Vila pannan på golvet', 'Andas in i ryggen', 'Håll och slappna av'],
    techniquePoints: ['Relax completely', 'Breathe into back', 'Gentle sustained stretch'],
    safetyData: {
      contraindications: ['Knee injury - unable to flex'],
      precautions: ['Knee pain - use cushion'],
      redFlags: ['Knee pain'],
      maxPainDuring: 2, maxPainAfter24h: 1,
      healingTissue: 'Thoracolumbar fascia', targetStructure: 'Thoracic extension',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ['Gentle'] },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 5, minConsecutiveDays: 3, maxPainDuring: 1, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 1, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Hip hiking'] }
    },
    evidenceBase: { level: 'C', source: 'Yoga therapy literature', studyType: 'Clinical practice' }
  },

  // ============================================
  // THORACIC STRENGTHENING
  // ============================================
  {
    id: 'thoracic_rowing',
    baseName: 'Seated Row',
    baseNameSv: 'Sittande Rodd',
    description: 'Rowing exercise for thoracic extensors and scapular muscles',
    descriptionSv: 'Roddövning för thorakalextensorer och skulderbladsmuskulatur',
    bodyRegion: 'thoracic',
    muscleGroups: ['rhomboids', 'middle_trapezius', 'latissimus_dorsi'],
    jointType: 'thoracic',
    exerciseType: 'concentric',
    basePosition: 'sitting',
    allowedPositions: ['sitting', 'standing'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band', 'cable_machine', 'dumbbell'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: ['Sit with band anchored in front', 'Pull elbows back', 'Squeeze shoulder blades together', 'Keep spine neutral', 'Control return', 'Repeat'],
    instructionsSv: ['Sitt med bandet förankrat framför', 'Dra armbågarna bakåt', 'Kläm ihop skulderbladen', 'Håll ryggen neutral', 'Kontrollera tillbakagången', 'Upprepa'],
    techniquePoints: ['Lead with elbows', 'Full scapular retraction', 'Control eccentric'],
    safetyData: {
      contraindications: ['Acute disc herniation'],
      precautions: ['Shoulder pain - adjust grip'],
      redFlags: ['Radiating pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Scapular muscles', targetStructure: 'Scapular strength',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk extension'] }
    },
    evidenceBase: { level: 'A', source: 'Cools AM. Scapular strengthening. JOSPT, 2014', studyType: 'Clinical practice guideline' }
  },

  {
    id: 'thoracic_face_pull',
    baseName: 'Face Pull',
    baseNameSv: 'Face Pull',
    description: 'External rotation with retraction for upper back',
    descriptionSv: 'Utåtrotation med retraktion för övre rygg',
    bodyRegion: 'thoracic',
    muscleGroups: ['middle_trapezius', 'rhomboids', 'infraspinatus'],
    jointType: 'thoracic',
    exerciseType: 'concentric',
    basePosition: 'standing',
    allowedPositions: ['standing', 'sitting'],
    baseEquipment: 'resistance_band',
    allowedEquipment: ['resistance_band', 'cable_machine'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 12, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 2,
    baseRestSeconds: 45,
    instructions: ['Hold band at face height', 'Pull toward face', 'Externally rotate arms', 'Squeeze shoulder blades', 'Control return', 'Keep elbows high'],
    instructionsSv: ['Håll bandet i ansiktshöjd', 'Dra mot ansiktet', 'Utåtrotera armarna', 'Kläm ihop skulderbladen', 'Kontrollera tillbakagången', 'Håll armbågarna höga'],
    techniquePoints: ['High elbow position', 'External rotation', 'Full retraction'],
    safetyData: {
      contraindications: ['Shoulder impingement'],
      precautions: ['Rotator cuff issues - reduce range'],
      redFlags: ['Shoulder pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Rotator cuff, scapular muscles', targetStructure: 'Posterior shoulder',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ['Light resistance'] },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Shrugging'] }
    },
    evidenceBase: { level: 'B', source: 'Cools AM. Scapular exercises. JOSPT, 2014', studyType: 'Clinical review' }
  },

  // ============================================
  // BREATHING EXERCISES
  // ============================================
  {
    id: 'thoracic_diaphragmatic_breathing',
    baseName: 'Diaphragmatic Breathing',
    baseNameSv: 'Diafragmaandning',
    description: 'Deep breathing for thoracic mobility',
    descriptionSv: 'Djupandning för thorakalmobilitet',
    bodyRegion: 'thoracic',
    muscleGroups: ['diaphragm'],
    jointType: 'thoracic',
    exerciseType: 'breathing',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting', 'standing'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 4,
    baseRestSeconds: 0,
    instructions: ['Lie on back with knees bent', 'Place hand on belly', 'Inhale through nose', 'Feel belly rise', 'Exhale slowly through mouth', 'Feel belly fall'],
    instructionsSv: ['Ligg på rygg med knäna böjda', 'Placera handen på magen', 'Andas in genom näsan', 'Känn magen stiga', 'Andas ut långsamt genom munnen', 'Känn magen sjunka'],
    techniquePoints: ['Belly should rise first', '360 degree expansion', 'Slow exhale'],
    safetyData: {
      contraindications: [],
      precautions: ['Hyperventilation - slow down'],
      redFlags: ['Dizziness'],
      maxPainDuring: 1, maxPainAfter24h: 0,
      healingTissue: 'Diaphragm', targetStructure: 'Breathing pattern',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Any'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Chest breathing only'] }
    },
    evidenceBase: { level: 'A', source: 'Chaitow L. Breathing pattern disorders. Churchill Livingstone, 2014', studyType: 'Clinical textbook' }
  },

  {
    id: 'thoracic_crocodile_breathing',
    baseName: 'Crocodile Breathing',
    baseNameSv: 'Krokodilsandning',
    description: 'Prone breathing for thoracic expansion',
    descriptionSv: 'Pronliggande andning för thorakalexpansion',
    bodyRegion: 'thoracic',
    muscleGroups: ['diaphragm'],
    jointType: 'thoracic',
    exerciseType: 'breathing',
    basePosition: 'prone',
    allowedPositions: ['prone'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 10, max: 20 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 4,
    baseRestSeconds: 0,
    instructions: ['Lie face down', 'Rest forehead on hands', 'Breathe into belly', 'Feel back expand', 'Exhale slowly', 'Repeat rhythmically'],
    instructionsSv: ['Ligg på mage', 'Vila pannan på händerna', 'Andas in i magen', 'Känn ryggen expandera', 'Andas ut långsamt', 'Upprepa rytmiskt'],
    techniquePoints: ['Feel back rise', 'Lateral rib expansion', 'Relaxed exhale'],
    safetyData: {
      contraindications: [],
      precautions: ['Neck pain - use pillow'],
      redFlags: [],
      maxPainDuring: 1, maxPainAfter24h: 0,
      healingTissue: 'Diaphragm, thoracic cage', targetStructure: 'Posterior breathing',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Any'],
      progressionCriteria: { minPainFreeReps: 20, minConsecutiveDays: 3, maxPainDuring: 0, maxPainAfter: 0, formScore: 80 },
      regressionTriggers: { painIncrease: 0, swellingPresent: false, formBreakdown: true, compensationPatterns: ['No back expansion'] }
    },
    evidenceBase: { level: 'B', source: 'Cook G. Crocodile breathing. FMS, 2010', studyType: 'Clinical practice' }
  },

  // ============================================
  // FUNCTIONAL EXERCISES
  // ============================================
  {
    id: 'thoracic_dead_bug',
    baseName: 'Dead Bug',
    baseNameSv: 'Död Insekt',
    description: 'Core stability with thoracic control',
    descriptionSv: 'Bålstabilitet med thorakalkontroll',
    bodyRegion: 'thoracic',
    muscleGroups: ['transverse_abdominis', 'rectus_abdominis', 'diaphragm'],
    jointType: 'thoracic',
    exerciseType: 'isometric',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 3,
    baseRestSeconds: 30,
    instructions: ['Lie on back', 'Arms up, hips and knees at 90', 'Press low back into floor', 'Lower opposite arm and leg', 'Keep back flat', 'Return and alternate'],
    instructionsSv: ['Ligg på rygg', 'Armar upp, höfter och knän i 90 grader', 'Tryck ländryggen mot golvet', 'Sänk motsatt arm och ben', 'Håll ryggen platt', 'Återvänd och alternera'],
    techniquePoints: ['No lumbar movement', 'Breathe throughout', 'Control movement'],
    safetyData: {
      contraindications: ['Acute low back pain'],
      precautions: ['Low back pain - reduce range'],
      redFlags: ['Radiating pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Core stabilizers', targetStructure: 'Core control',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery', 'Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Low back arching'] }
    },
    evidenceBase: { level: 'B', source: 'McGill SM. Core exercises. J Electromyogr Kinesiol, 2010', studyType: 'Research study' }
  },

  {
    id: 'thoracic_bird_dog',
    baseName: 'Bird Dog',
    baseNameSv: 'Fågelhund',
    description: 'Quadruped stability exercise',
    descriptionSv: 'Fyrfota stabilitetsövning',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'multifidus', 'gluteus_maximus'],
    jointType: 'thoracic',
    exerciseType: 'isometric',
    basePosition: 'quadruped',
    allowedPositions: ['quadruped'],
    baseEquipment: 'none',
    allowedEquipment: ['none', 'mat'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    laterality: 'alternating',
    allowedLateralities: ['alternating', 'unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 3, max: 4 },
    baseHoldSeconds: 5,
    baseRestSeconds: 30,
    instructions: ['Start on hands and knees', 'Extend opposite arm and leg', 'Keep back flat', 'Hold steady', 'Return with control', 'Alternate sides'],
    instructionsSv: ['Börja på händer och knän', 'Sträck motsatt arm och ben', 'Håll ryggen platt', 'Håll stadigt', 'Återvänd med kontroll', 'Alternera sidor'],
    techniquePoints: ['No rotation', 'Neutral spine', 'Control throughout'],
    safetyData: {
      contraindications: ['Acute spine injury'],
      precautions: ['Wrist pain - use fists'],
      redFlags: ['Radiating pain'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Spinal stabilizers', targetStructure: 'Spinal stability',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Arms or legs only'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery', 'Lumbar surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 85 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: true, compensationPatterns: ['Trunk rotation', 'Hip drop'] }
    },
    evidenceBase: { level: 'A', source: 'McGill SM. Core exercises. Spine, 2009', studyType: 'Research study' }
  },

  // ============================================
  // SELF-MOBILIZATION
  // ============================================
  {
    id: 'thoracic_tennis_ball_release',
    baseName: 'Tennis Ball Thoracic Release',
    baseNameSv: 'Tennisboll Thorakal Avslappning',
    description: 'Self-myofascial release for thoracic paraspinals',
    descriptionSv: 'Självmyofascial frigöring för thorakala paraspinalmuskler',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'rhomboids'],
    jointType: 'thoracic',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine', 'standing'],
    baseEquipment: 'tennis_ball',
    allowedEquipment: ['tennis_ball', 'lacrosse_ball'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Place ball on thoracic muscles', 'Lie on ball or lean against wall', 'Find tender spots', 'Hold and breathe', 'Move to next spot', 'Cover both sides'],
    instructionsSv: ['Placera bollen på thorakala muskler', 'Ligg på bollen eller luta mot vägg', 'Hitta ömma punkter', 'Håll och andas', 'Flytta till nästa punkt', 'Täck båda sidorna'],
    techniquePoints: ['Avoid spine directly', 'Hold on tender spots', 'Breathe through discomfort'],
    safetyData: {
      contraindications: ['Osteoporosis', 'Rib fracture'],
      precautions: ['Bruising easily'],
      redFlags: ['Sharp pain', 'Radiating symptoms'],
      maxPainDuring: 4, maxPainAfter24h: 2,
      healingTissue: 'Thoracic fascia', targetStructure: 'Soft tissue mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Avoid surgical area'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 3, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Rolling too fast'] }
    },
    evidenceBase: { level: 'B', source: 'Cheatham SW. Self-myofascial release. IJSPT, 2015', studyType: 'Systematic review' }
  },

  {
    id: 'thoracic_peanut_release',
    baseName: 'Peanut Thoracic Release',
    baseNameSv: 'Jordnöt Thorakal Avslappning',
    description: 'Double ball release for thoracic paraspinals',
    descriptionSv: 'Dubbelbollsavslappning för thorakala paraspinalmuskler',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae'],
    jointType: 'thoracic',
    exerciseType: 'mobility',
    basePosition: 'supine',
    allowedPositions: ['supine'],
    baseEquipment: 'double_ball',
    allowedEquipment: ['double_ball', 'foam_roller'],
    baseDifficulty: 'beginner',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'bilateral',
    allowedLateralities: ['bilateral'],
    baseReps: { min: 5, max: 10 },
    baseSets: { min: 1, max: 2 },
    baseHoldSeconds: 30,
    baseRestSeconds: 30,
    instructions: ['Place peanut under thoracic spine', 'Spine goes between the balls', 'Lie on peanut', 'Breathe deeply', 'Move up or down spine', 'Release tension'],
    instructionsSv: ['Placera jordnöten under bröstryggen', 'Ryggraden går mellan bollarna', 'Ligg på jordnöten', 'Andas djupt', 'Flytta upp eller ner längs ryggen', 'Släpp spänning'],
    techniquePoints: ['Spine between balls', 'Segment by segment', 'Relax and breathe'],
    safetyData: {
      contraindications: ['Osteoporosis', 'Vertebral fracture'],
      precautions: ['Too firm - use softer surface'],
      redFlags: ['Sharp pain'],
      maxPainDuring: 4, maxPainAfter24h: 2,
      healingTissue: 'Thoracic paraspinals', targetStructure: 'Segmental mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Avoid surgical level'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic surgery'],
      progressionCriteria: { minPainFreeReps: 10, minConsecutiveDays: 3, maxPainDuring: 3, maxPainAfter: 1, formScore: 70 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Moving too fast'] }
    },
    evidenceBase: { level: 'B', source: 'Cheatham SW. Self-myofascial release. IJSPT, 2015', studyType: 'Systematic review' }
  },

  // ============================================
  // NERVE GLIDES
  // ============================================
  {
    id: 'thoracic_upper_limb_tension',
    baseName: 'Upper Limb Neural Tension',
    baseNameSv: 'Övre Extremitet Nervspänning',
    description: 'Neural mobilization for arm symptoms',
    descriptionSv: 'Nervmobilisering för armsymtom',
    bodyRegion: 'thoracic',
    muscleGroups: [],
    jointType: 'nerve',
    exerciseType: 'neural_glide',
    basePosition: 'supine',
    allowedPositions: ['supine', 'sitting'],
    baseEquipment: 'none',
    allowedEquipment: ['none'],
    baseDifficulty: 'intermediate',
    allowedDifficulties: ['beginner', 'intermediate'],
    laterality: 'unilateral_left',
    allowedLateralities: ['unilateral_left', 'unilateral_right'],
    baseReps: { min: 10, max: 15 },
    baseSets: { min: 2, max: 3 },
    baseHoldSeconds: 2,
    baseRestSeconds: 30,
    instructions: ['Lie on back or sit', 'Extend arm to side', 'Wrist extension', 'Shoulder depression', 'Side bend neck away', 'Glide gently'],
    instructionsSv: ['Ligg på rygg eller sitt', 'Sträck armen åt sidan', 'Handledsextension', 'Sänk axeln', 'Böj nacken åt andra sidan', 'Glid försiktigt'],
    techniquePoints: ['Gentle gliding motion', 'No sustained tension', 'Stop if symptoms increase'],
    safetyData: {
      contraindications: ['Acute nerve injury', 'Severe radiculopathy'],
      precautions: ['Reproduce symptoms - reduce range'],
      redFlags: ['Worsening symptoms', 'Numbness persists'],
      maxPainDuring: 3, maxPainAfter24h: 2,
      healingTissue: 'Brachial plexus', targetStructure: 'Neural mobility',
      postOpRestrictions: [
        { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
        { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ['Gentle, limited range'] },
        { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true },
        { phase: 4, weeksPostOp: { min: 24, max: 52 }, allowed: true }
      ],
      appropriateForSurgeries: ['Thoracic outlet surgery'],
      progressionCriteria: { minPainFreeReps: 15, minConsecutiveDays: 5, maxPainDuring: 2, maxPainAfter: 1, formScore: 80 },
      regressionTriggers: { painIncrease: 2, swellingPresent: false, formBreakdown: false, compensationPatterns: ['Breath holding'] }
    },
    evidenceBase: { level: 'B', source: 'Butler DS. Neurodynamics. Noigroup, 2000', studyType: 'Clinical textbook' }
  },

  // ============================================
  // ADDITIONAL THORACIC MOBILITY
  // ============================================
  {
    id: 'thoracic_book_opener',
    baseName: 'Book Opener with Leg Support',
    baseNameSv: 'Bokåppnare med Benstöd',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'pectoralis', 'rhomboids'],
    exerciseType: 'mobility',
    allowedPositions: ['side_lying'],
    allowedEquipment: ['none', 'pillow', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Shoulder instability', 'Acute disc herniation'],
      precautions: ['Shoulder impingement'],
      redFlags: ['Radiating arm pain', 'Shoulder subluxation'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Limited range' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full pain-free rotation', 'Symmetrical mobility'],
      regressionTriggers: ['Pain > 3/10', 'Arm symptoms']
    },
    evidenceBase: { level: 'B', source: 'Thoracic rotation mobilization studies', studyType: 'Clinical trial' }
  },
  {
    id: 'thoracic_windmill_stretch',
    baseName: 'Windmill Thoracic Stretch',
    baseNameSv: 'Väderkvarn Thorakalstretch',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'latissimus_dorsi', 'erector_spinae'],
    exerciseType: 'stretch',
    allowedPositions: ['standing', 'sitting'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Acute spinal injury', 'Severe scoliosis'],
      precautions: ['Balance issues'],
      redFlags: ['Dizziness', 'Radiating pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Seated only' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Standing allowed' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full rotation each side', 'No pain'],
      regressionTriggers: ['Pain during movement', 'Loss of balance']
    },
    evidenceBase: { level: 'C', source: 'Clinical mobility exercises', studyType: 'Clinical practice' }
  },
  {
    id: 'thoracic_extension_bench',
    baseName: 'Bench Thoracic Extension',
    baseNameSv: 'Bänk Thorakalextension',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'latissimus_dorsi'],
    exerciseType: 'mobility',
    allowedPositions: ['kneeling'],
    allowedEquipment: ['bench', 'chair', 'stability_ball'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Shoulder pathology', 'Acute thoracic pain'],
      precautions: ['Limited shoulder ROM'],
      redFlags: ['Shoulder pain', 'Numbness in arms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Gentle range' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full extension', 'No shoulder compensation'],
      regressionTriggers: ['Shoulder pain', 'Lumbar hyperextension']
    },
    evidenceBase: { level: 'B', source: 'Thoracic mobility assessment', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_quadruped_rotation',
    baseName: 'Quadruped Thoracic Rotation',
    baseNameSv: 'Fyrfota Thorakalrotation',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'erector_spinae', 'multifidus'],
    exerciseType: 'mobility',
    allowedPositions: ['quadruped'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Wrist injury', 'Acute thoracic pain'],
      precautions: ['Wrist pain - use fists'],
      redFlags: ['Radiating symptoms', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Limited range' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full rotation', 'Stable pelvis'],
      regressionTriggers: ['Hip rotation', 'Pain']
    },
    evidenceBase: { level: 'B', source: 'Thoracic rotation exercises', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_prayer_stretch',
    baseName: 'Prayer Stretch with Lateral Shift',
    baseNameSv: 'Bönesträckning med Sidoförskjutning',
    bodyRegion: 'thoracic',
    muscleGroups: ['latissimus_dorsi', 'quadratus_lumborum', 'erector_spinae'],
    exerciseType: 'stretch',
    allowedPositions: ['kneeling'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Knee injury unable to kneel'],
      precautions: ['Knee pain - use cushion'],
      redFlags: ['Radiating symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Gentle central only' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Add lateral shift' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full stretch', 'Symmetrical mobility'],
      regressionTriggers: ['Knee pain', 'Thoracic pain']
    },
    evidenceBase: { level: 'C', source: 'Yoga-based mobility', studyType: 'Clinical practice' }
  },
  {
    id: 'thoracic_side_lying_rotation_arm',
    baseName: 'Side-Lying Arm Sweep',
    baseNameSv: 'Sidoliggande Armsving',
    bodyRegion: 'thoracic',
    muscleGroups: ['pectoralis', 'rhomboids', 'obliques'],
    exerciseType: 'mobility',
    allowedPositions: ['side_lying'],
    allowedEquipment: ['none', 'mat', 'pillow'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Shoulder instability', 'Acute rotator cuff tear'],
      precautions: ['Shoulder impingement'],
      redFlags: ['Shoulder subluxation', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-12', modifications: 'Limited arc' },
        { phase: 3, weeksPostOp: '12-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full arc motion', 'No shoulder pain'],
      regressionTriggers: ['Shoulder pain', 'Pelvis rotation']
    },
    evidenceBase: { level: 'B', source: 'Thoracic rotation studies', studyType: 'Clinical trial' }
  },

  // ============================================
  // THORACIC STRENGTHENING - ADDITIONAL
  // ============================================
  {
    id: 'thoracic_reverse_fly',
    baseName: 'Reverse Fly',
    baseNameSv: 'Omvänd Fly',
    bodyRegion: 'thoracic',
    muscleGroups: ['rhomboids', 'middle_trapezius', 'posterior_deltoid'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing', 'sitting', 'prone'],
    allowedEquipment: ['dumbbell', 'resistance_band', 'cable'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Acute shoulder injury', 'Rotator cuff tear'],
      precautions: ['Shoulder impingement'],
      redFlags: ['Shoulder pain worsening', 'Neck pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'No resistance' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light resistance' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Pain-free motion', 'Good scapular control'],
      regressionTriggers: ['Shoulder pain', 'Neck tension']
    },
    evidenceBase: { level: 'A', source: 'Cools AM. Scapular muscle exercises. JOSPT, 2014', studyType: 'Clinical practice guideline' }
  },
  {
    id: 'thoracic_prone_cobra',
    baseName: 'Prone Cobra',
    baseNameSv: 'Pronliggande Kobra',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'rhomboids', 'lower_trapezius', 'gluteus_maximus'],
    exerciseType: 'strengthening',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Spondylolisthesis', 'Spinal stenosis'],
      precautions: ['Low back pain'],
      redFlags: ['Leg pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Arms at sides' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive arm position' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['30 sec hold', 'Good form'],
      regressionTriggers: ['Low back pain', 'Neck strain']
    },
    evidenceBase: { level: 'A', source: 'McGill SM. Core exercises. Spine, 2009', studyType: 'Research study' }
  },
  {
    id: 'thoracic_superman',
    baseName: 'Superman',
    baseNameSv: 'Stålmannen',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'multifidus', 'gluteus_maximus'],
    exerciseType: 'strengthening',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Spondylolisthesis', 'Acute disc herniation'],
      precautions: ['Low back sensitivity'],
      redFlags: ['Leg symptoms', 'Severe back pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Arms only or legs only' },
        { phase: 3, weeksPostOp: '16-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['10 reps with good form', 'No pain'],
      regressionTriggers: ['Back pain', 'Compensation']
    },
    evidenceBase: { level: 'B', source: 'Extension exercises for spine', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_swimmers',
    baseName: 'Swimmers',
    baseNameSv: 'Simmare',
    bodyRegion: 'thoracic',
    muscleGroups: ['erector_spinae', 'gluteus_maximus', 'multifidus'],
    exerciseType: 'strengthening',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['alternating'],
    safetyData: {
      contraindications: ['Acute spinal injury', 'Spondylolisthesis'],
      precautions: ['Neck strain - keep head neutral'],
      redFlags: ['Radiating symptoms', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-18', modifications: 'Slow tempo' },
        { phase: 3, weeksPostOp: '18-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['30 sec continuous', 'Controlled movement'],
      regressionTriggers: ['Back pain', 'Loss of control']
    },
    evidenceBase: { level: 'B', source: 'Spine extension exercises', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_prone_row',
    baseName: 'Prone Dumbbell Row',
    baseNameSv: 'Pronliggande Hantelrodd',
    bodyRegion: 'thoracic',
    muscleGroups: ['rhomboids', 'latissimus_dorsi', 'middle_trapezius'],
    exerciseType: 'strengthening',
    allowedPositions: ['prone'],
    allowedEquipment: ['dumbbell', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Shoulder injury', 'Acute neck pain'],
      precautions: ['Neck strain'],
      redFlags: ['Shoulder pain', 'Numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'No weight' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light weight' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Pain-free rowing', 'Full scapular retraction'],
      regressionTriggers: ['Shoulder pain', 'Neck strain']
    },
    evidenceBase: { level: 'B', source: 'Scapular strengthening protocols', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_band_pull_apart',
    baseName: 'Band Pull-Apart',
    baseNameSv: 'Band Isärdragning',
    bodyRegion: 'thoracic',
    muscleGroups: ['rhomboids', 'middle_trapezius', 'posterior_deltoid'],
    exerciseType: 'strengthening',
    allowedPositions: ['standing', 'sitting'],
    allowedEquipment: ['resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute shoulder injury'],
      precautions: ['Shoulder impingement'],
      redFlags: ['Shoulder pain', 'Neck pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Light band' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['20 reps pain-free', 'Good posture'],
      regressionTriggers: ['Shoulder pain', 'Shrugging']
    },
    evidenceBase: { level: 'B', source: 'Resistance band exercises for posture', studyType: 'Clinical trial' }
  },
  {
    id: 'thoracic_low_row',
    baseName: 'Low Cable Row',
    baseNameSv: 'Låg Kabelrodd',
    bodyRegion: 'thoracic',
    muscleGroups: ['rhomboids', 'lower_trapezius', 'latissimus_dorsi'],
    exerciseType: 'strengthening',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['cable', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Acute low back pain'],
      precautions: ['Low back sensitivity'],
      redFlags: ['Low back pain', 'Radiating symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Pain-free', 'Good posture maintained'],
      regressionTriggers: ['Low back pain', 'Loss of posture']
    },
    evidenceBase: { level: 'B', source: 'Back strengthening evidence', studyType: 'Clinical guideline' }
  },

  // ============================================
  // POSTURAL EXERCISES - ADDITIONAL
  // ============================================
  {
    id: 'thoracic_chin_tuck_wall',
    baseName: 'Chin Tuck Against Wall',
    baseNameSv: 'Haka Intryckt mot Vägg',
    bodyRegion: 'thoracic',
    muscleGroups: ['deep_neck_flexors', 'lower_trapezius'],
    exerciseType: 'isometric',
    allowedPositions: ['standing'],
    allowedEquipment: ['wall'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Cervical instability'],
      precautions: ['Neck pain'],
      redFlags: ['Dizziness', 'Arm symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Gentle only' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Full exercise' },
        { phase: 4, weeksPostOp: '12+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['30 sec hold', 'No compensation'],
      regressionTriggers: ['Neck pain', 'Headache']
    },
    evidenceBase: { level: 'A', source: 'Jull G. Deep neck flexor training. Spine, 2008', studyType: 'RCT' }
  },
  {
    id: 'thoracic_scapular_clock',
    baseName: 'Scapular Clock',
    baseNameSv: 'Skulderblads Klocka',
    bodyRegion: 'thoracic',
    muscleGroups: ['serratus_anterior', 'rhomboids', 'trapezius'],
    exerciseType: 'mobility',
    allowedPositions: ['standing', 'quadruped'],
    allowedEquipment: ['wall', 'none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right', 'bilateral'],
    safetyData: {
      contraindications: ['Shoulder instability'],
      precautions: ['Shoulder pain'],
      redFlags: ['Clicking with pain', 'Instability'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-6', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '6-10', modifications: 'Limited range' },
        { phase: 3, weeksPostOp: '10-14', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '14+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full range', 'Good control'],
      regressionTriggers: ['Pain', 'Loss of control']
    },
    evidenceBase: { level: 'B', source: 'Scapular motor control exercises', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_prone_i_position',
    baseName: 'Prone I Raise',
    baseNameSv: 'Pronliggande I-lyft',
    bodyRegion: 'thoracic',
    muscleGroups: ['lower_trapezius', 'latissimus_dorsi'],
    exerciseType: 'strengthening',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat', 'dumbbell'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Shoulder pathology severe'],
      precautions: ['Shoulder impingement'],
      redFlags: ['Shoulder pain', 'Neck strain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'No weight' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Light weight' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Pain-free overhead', 'No neck extension'],
      regressionTriggers: ['Pain', 'Neck compensation']
    },
    evidenceBase: { level: 'A', source: 'Cools AM. Lower trapezius exercises. JOSPT, 2014', studyType: 'Clinical practice guideline' }
  },
  {
    id: 'thoracic_wall_angel',
    baseName: 'Wall Angel',
    baseNameSv: 'Väggängel',
    bodyRegion: 'thoracic',
    muscleGroups: ['lower_trapezius', 'serratus_anterior', 'rotator_cuff'],
    exerciseType: 'mobility',
    allowedPositions: ['standing'],
    allowedEquipment: ['wall'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Frozen shoulder', 'Severe thoracic kyphosis'],
      precautions: ['Shoulder impingement'],
      redFlags: ['Shoulder pain', 'Arm numbness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Limited range' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Full overhead', 'Back maintains wall contact'],
      regressionTriggers: ['Back arching', 'Shoulder pain']
    },
    evidenceBase: { level: 'B', source: 'Postural correction exercises', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_corner_stretch',
    baseName: 'Corner Pec Stretch',
    baseNameSv: 'Hörn Pec Stretch',
    bodyRegion: 'thoracic',
    muscleGroups: ['pectoralis_major', 'pectoralis_minor', 'anterior_deltoid'],
    exerciseType: 'stretch',
    allowedPositions: ['standing'],
    allowedEquipment: ['wall'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Anterior shoulder instability'],
      precautions: ['Shoulder pain - reduce lean'],
      redFlags: ['Shoulder subluxation', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Gentle lean' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full stretch' }
      ],
      progressionCriteria: ['Full stretch', 'No pain'],
      regressionTriggers: ['Shoulder pain', 'Anterior pressure']
    },
    evidenceBase: { level: 'B', source: 'Pectoral stretching for posture', studyType: 'Clinical trial' }
  },

  // ============================================
  // FUNCTIONAL - ADDITIONAL
  // ============================================
  {
    id: 'thoracic_pallof_press',
    baseName: 'Pallof Press',
    baseNameSv: 'Pallof Press',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'transverse_abdominis', 'erector_spinae'],
    exerciseType: 'stability',
    allowedPositions: ['standing', 'kneeling', 'half_kneeling'],
    allowedEquipment: ['cable', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute spine injury'],
      precautions: ['Low back pain'],
      redFlags: ['Radiating symptoms', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Light resistance standing' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['30 sec hold', 'No rotation'],
      regressionTriggers: ['Trunk rotation', 'Pain']
    },
    evidenceBase: { level: 'B', source: 'Anti-rotation core training', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_plank_rotation',
    baseName: 'Plank with Rotation',
    baseNameSv: 'Planka med Rotation',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'transverse_abdominis', 'rectus_abdominis'],
    exerciseType: 'stability',
    allowedPositions: ['prone'],
    allowedEquipment: ['none', 'mat'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['alternating'],
    safetyData: {
      contraindications: ['Acute shoulder injury', 'Wrist injury'],
      precautions: ['Shoulder pain'],
      redFlags: ['Shoulder pain', 'Low back pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-16', modifications: 'Static plank only' },
        { phase: 3, weeksPostOp: '16-20', modifications: 'Add rotation' },
        { phase: 4, weeksPostOp: '20+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled rotation', 'No hip drop'],
      regressionTriggers: ['Hip sag', 'Shoulder pain']
    },
    evidenceBase: { level: 'B', source: 'Core rotation stability', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_wood_chop',
    baseName: 'Wood Chop',
    baseNameSv: 'Vedhuggning',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'rectus_abdominis', 'latissimus_dorsi'],
    exerciseType: 'functional',
    allowedPositions: ['standing', 'kneeling', 'half_kneeling'],
    allowedEquipment: ['cable', 'resistance_band', 'medicine_ball'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute spine injury', 'Disc herniation'],
      precautions: ['Low back pain'],
      redFlags: ['Radiating symptoms', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-18', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '18-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled movement', 'No pain'],
      regressionTriggers: ['Low back pain', 'Loss of control']
    },
    evidenceBase: { level: 'B', source: 'Rotational power training', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_reverse_wood_chop',
    baseName: 'Reverse Wood Chop',
    baseNameSv: 'Omvänd Vedhuggning',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'rectus_abdominis', 'deltoid'],
    exerciseType: 'functional',
    allowedPositions: ['standing', 'kneeling', 'half_kneeling'],
    allowedEquipment: ['cable', 'resistance_band', 'medicine_ball'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute spine injury', 'Shoulder injury'],
      precautions: ['Low back pain', 'Shoulder impingement'],
      redFlags: ['Radiating symptoms', 'Severe pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-18', modifications: 'Light resistance' },
        { phase: 3, weeksPostOp: '18-24', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '24+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled lift', 'No pain'],
      regressionTriggers: ['Low back pain', 'Shoulder pain']
    },
    evidenceBase: { level: 'B', source: 'Rotational power training', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_medicine_ball_rotation_throw',
    baseName: 'Medicine Ball Rotation Throw',
    baseNameSv: 'Medicinboll Rotationskast',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'pectoralis', 'latissimus_dorsi'],
    exerciseType: 'power',
    allowedPositions: ['standing', 'kneeling'],
    allowedEquipment: ['medicine_ball', 'wall'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute spine injury', 'Osteoporosis'],
      precautions: ['Low back pain'],
      redFlags: ['Severe pain', 'Dizziness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Light ball, controlled' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled power', 'No pain'],
      regressionTriggers: ['Pain', 'Loss of control']
    },
    evidenceBase: { level: 'B', source: 'Rotational power development', studyType: 'Clinical guideline' }
  },

  // ============================================
  // BREATHING - ADDITIONAL
  // ============================================
  {
    id: 'thoracic_lateral_rib_breathing',
    baseName: 'Lateral Rib Expansion Breathing',
    baseNameSv: 'Lateral Revbensexpansion Andning',
    bodyRegion: 'thoracic',
    muscleGroups: ['intercostals', 'diaphragm', 'obliques'],
    exerciseType: 'breathing',
    allowedPositions: ['sitting', 'standing', 'supine', 'side_lying'],
    allowedEquipment: ['none', 'resistance_band'],
    allowedDifficulties: ['beginner', 'intermediate'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Rib fracture'],
      precautions: ['Rib pain'],
      redFlags: ['Sharp rib pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-2', modifications: 'Gentle' },
        { phase: 2, weeksPostOp: '2-6', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '6-12', modifications: 'Full exercise' },
        { phase: 4, weeksPostOp: '12+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['Visible lateral expansion', 'Relaxed shoulders'],
      regressionTriggers: ['Rib pain', 'Breath holding']
    },
    evidenceBase: { level: 'B', source: 'Breathing pattern training', studyType: 'Clinical guideline' }
  },
  {
    id: 'thoracic_box_breathing',
    baseName: 'Box Breathing',
    baseNameSv: 'Boxandning',
    bodyRegion: 'thoracic',
    muscleGroups: ['diaphragm', 'intercostals'],
    exerciseType: 'breathing',
    allowedPositions: ['sitting', 'standing', 'supine'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Severe respiratory disease'],
      precautions: ['Anxiety - start with shorter holds'],
      redFlags: ['Dizziness', 'Panic'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-1', modifications: 'Shorter counts' },
        { phase: 2, weeksPostOp: '1-4', modifications: 'Progressive' },
        { phase: 3, weeksPostOp: '4-8', modifications: 'Full exercise' },
        { phase: 4, weeksPostOp: '8+', modifications: 'No restrictions' }
      ],
      progressionCriteria: ['4x4 count comfortable', 'Relaxed throughout'],
      regressionTriggers: ['Anxiety', 'Dizziness']
    },
    evidenceBase: { level: 'B', source: 'Breathing regulation techniques', studyType: 'Clinical trial' }
  },
  {
    id: 'thoracic_apical_breathing',
    baseName: 'Apical Expansion Breathing',
    baseNameSv: 'Apikal Expansion Andning',
    bodyRegion: 'thoracic',
    muscleGroups: ['scalenes', 'pectoralis_minor', 'upper_intercostals'],
    exerciseType: 'breathing',
    allowedPositions: ['sitting', 'standing'],
    allowedEquipment: ['none'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Neck instability'],
      precautions: ['Neck tension'],
      redFlags: ['Neck pain', 'Dizziness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-4', modifications: 'Not recommended' },
        { phase: 2, weeksPostOp: '4-8', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '8-12', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '12+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Visible upper chest expansion', 'No tension'],
      regressionTriggers: ['Neck tension', 'Hyperventilation']
    },
    evidenceBase: { level: 'C', source: 'Breathing pattern assessment', studyType: 'Clinical practice' }
  },

  // ============================================
  // SCOLIOSIS-SPECIFIC
  // ============================================
  {
    id: 'thoracic_schroth_derotation',
    baseName: 'Schroth Derotation',
    baseNameSv: 'Schroth Derotation',
    bodyRegion: 'thoracic',
    muscleGroups: ['obliques', 'erector_spinae', 'intercostals'],
    exerciseType: 'corrective',
    allowedPositions: ['sitting', 'standing', 'side_lying'],
    allowedEquipment: ['none', 'mirror'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute spinal injury'],
      precautions: ['Severe curve - professional guidance'],
      redFlags: ['Pain increase', 'Neurological symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-12', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '12-24', modifications: 'Modified per surgeon' },
        { phase: 3, weeksPostOp: '24-52', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '52+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Curve awareness', 'Active correction'],
      regressionTriggers: ['Pain', 'Increased curve feeling']
    },
    evidenceBase: { level: 'A', source: 'Negrini S. Schroth method for scoliosis. Cochrane, 2015', studyType: 'Systematic review' }
  },
  {
    id: 'thoracic_side_shift',
    baseName: 'Thoracic Side Shift',
    baseNameSv: 'Thorakal Sidoförskjutning',
    bodyRegion: 'thoracic',
    muscleGroups: ['quadratus_lumborum', 'obliques', 'erector_spinae'],
    exerciseType: 'mobility',
    allowedPositions: ['standing', 'sitting'],
    allowedEquipment: ['none', 'wall', 'mirror'],
    allowedDifficulties: ['beginner', 'intermediate', 'advanced'],
    allowedLateralities: ['left', 'right'],
    safetyData: {
      contraindications: ['Acute spine injury'],
      precautions: ['Scoliosis - know your curve direction'],
      redFlags: ['Pain', 'Neurological symptoms'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-8', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '8-12', modifications: 'Gentle' },
        { phase: 3, weeksPostOp: '12-16', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '16+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled shift', 'Midline awareness'],
      regressionTriggers: ['Pain', 'Compensation']
    },
    evidenceBase: { level: 'B', source: 'Scoliosis-specific exercises', studyType: 'Clinical guideline' }
  },

  // ============================================
  // PLYOMETRIC / POWER
  // ============================================
  {
    id: 'thoracic_slam_ball',
    baseName: 'Medicine Ball Slam',
    baseNameSv: 'Medicinboll Slam',
    bodyRegion: 'thoracic',
    muscleGroups: ['latissimus_dorsi', 'rectus_abdominis', 'triceps'],
    exerciseType: 'power',
    allowedPositions: ['standing'],
    allowedEquipment: ['slam_ball', 'medicine_ball'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral'],
    safetyData: {
      contraindications: ['Acute spine injury', 'Shoulder injury', 'Osteoporosis'],
      precautions: ['Low back sensitivity'],
      redFlags: ['Low back pain', 'Shoulder pain'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-20', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '20-28', modifications: 'Light ball, controlled' },
        { phase: 3, weeksPostOp: '28-36', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '36+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Controlled power', 'No pain'],
      regressionTriggers: ['Back pain', 'Loss of form']
    },
    evidenceBase: { level: 'C', source: 'Power training for athletes', studyType: 'Clinical practice' }
  },
  {
    id: 'thoracic_push_press',
    baseName: 'Push Press',
    baseNameSv: 'Push Press',
    bodyRegion: 'thoracic',
    muscleGroups: ['deltoid', 'triceps', 'trapezius', 'core'],
    exerciseType: 'power',
    allowedPositions: ['standing'],
    allowedEquipment: ['barbell', 'dumbbell', 'kettlebell'],
    allowedDifficulties: ['intermediate', 'advanced'],
    allowedLateralities: ['bilateral', 'left', 'right'],
    safetyData: {
      contraindications: ['Shoulder instability', 'Acute spine injury'],
      precautions: ['Shoulder impingement', 'Low back pain'],
      redFlags: ['Shoulder pain', 'Low back pain', 'Dizziness'],
      postOpRestrictions: [
        { phase: 1, weeksPostOp: '0-16', modifications: 'Not allowed' },
        { phase: 2, weeksPostOp: '16-24', modifications: 'Light weight' },
        { phase: 3, weeksPostOp: '24-32', modifications: 'Progressive' },
        { phase: 4, weeksPostOp: '32+', modifications: 'Full exercise' }
      ],
      progressionCriteria: ['Good form', 'Pain-free'],
      regressionTriggers: ['Form breakdown', 'Pain']
    },
    evidenceBase: { level: 'C', source: 'Overhead pressing mechanics', studyType: 'Clinical practice' }
  }
];

export default thoracicTemplates;
