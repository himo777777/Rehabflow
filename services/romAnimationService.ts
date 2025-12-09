/**
 * ROM Animation Service - ROM-baserade animationsvarianter
 *
 * Genererar anpassade animationer baserat på patientens tillåtna rörelseomfång (ROM).
 * Integreras med postOpProtocols för att automatiskt begränsa rörelser.
 *
 * Exempel:
 * - Patient med axelprotes dag 10: Max 0° flexion → pendlande rörelser endast
 * - Patient med ACL dag 60: Max 90° knäflexion → begränsad squat
 */

import { AnimationClip, JointAngles, createMultiKeyframeAnimation } from './animationBlendingService';
import { getCurrentPhase, getProtocol } from '../data/protocols/postOpProtocols';

// ============================================
// TYPES
// ============================================

export interface ROMRestrictions {
  // Axel
  shoulderFlexion?: { max: number; min?: number };
  shoulderAbduction?: { max: number; min?: number };
  shoulderRotation?: { max: number; min?: number };

  // Armbåge
  elbowFlexion?: { max: number; min?: number };

  // Höft
  hipFlexion?: { max: number; min?: number };
  hipAbduction?: { max: number; min?: number };

  // Knä
  kneeFlexion?: { max: number; min?: number };

  // Rygg
  spineFlexion?: { max: number; min?: number };
  spineRotation?: { max: number; min?: number };
}

export type ROMLevel = 'quarter' | 'half' | 'threeQuarter' | 'full';

export interface ExerciseAnimationVariant {
  name: string;
  romLevel: ROMLevel;
  romPercentage: number;
  animation: AnimationClip;
  instructions: string[];
  warnings?: string[];
}

// ============================================
// DEFAULT FULL ROM VALUES
// ============================================

const FULL_ROM_VALUES: Record<string, number> = {
  shoulderFlexion: 180,
  shoulderAbduction: 180,
  shoulderExternalRotation: 90,
  shoulderInternalRotation: 90,
  elbowFlexion: 145,
  hipFlexion: 120,
  hipAbduction: 45,
  kneeFlexion: 135,
  spineFlexion: 60,
  spineRotation: 45
};

// ============================================
// ROM RESTRICTION HELPERS
// ============================================

/**
 * Hämta ROM-restriktioner baserat på kirurgiskt ingrepp och dagar sedan operation
 */
export function getROMRestrictions(
  surgeryType: string,
  daysSinceSurgery: number
): ROMRestrictions {
  const phase = getCurrentPhase(surgeryType, daysSinceSurgery);

  if (!phase) {
    return {}; // Inga restriktioner om protokoll saknas
  }

  // Standard-restriktioner per fas och ingrepp
  const restrictions: ROMRestrictions = {};

  // Baserat på protokolldata
  const protocol = getProtocol(surgeryType);
  if (!protocol) return {};

  // Axeloperationer
  if (protocol.bodyArea === 'axel') {
    if (phase.phase === 1) {
      restrictions.shoulderFlexion = { max: 0 };     // Ingen aktiv flexion
      restrictions.shoulderAbduction = { max: 0 };   // Ingen aktiv abduktion
      restrictions.shoulderRotation = { max: 0 };    // Ingen rotation
    } else if (phase.phase === 2) {
      restrictions.shoulderFlexion = { max: 90 };    // Max 90°
      restrictions.shoulderAbduction = { max: 90 };
      restrictions.shoulderRotation = { max: 30 };
    } else if (phase.phase === 3) {
      restrictions.shoulderFlexion = { max: 150 };
      restrictions.shoulderAbduction = { max: 150 };
    }
  }

  // Knäoperationer
  if (protocol.bodyArea === 'knä') {
    if (phase.phase === 1) {
      restrictions.kneeFlexion = { max: 90, min: 0 }; // 0-90°
    } else if (phase.phase === 2) {
      restrictions.kneeFlexion = { max: 120 };
    }
    // Fas 3+ = full ROM tillåten
  }

  // Höftoperationer
  if (protocol.bodyArea === 'höft') {
    if (phase.phase === 1) {
      restrictions.hipFlexion = { max: 90 };         // Max 90° flexion
      restrictions.hipAbduction = { max: 30 };
    } else if (phase.phase === 2) {
      restrictions.hipFlexion = { max: 100 };
    }
  }

  // Ryggoperationer
  if (protocol.bodyArea === 'ländrygg' || protocol.bodyArea === 'nacke') {
    if (phase.phase === 1) {
      restrictions.spineFlexion = { max: 20 };
      restrictions.spineRotation = { max: 10 };
    } else if (phase.phase === 2) {
      restrictions.spineFlexion = { max: 40 };
      restrictions.spineRotation = { max: 25 };
    }
  }

  return restrictions;
}

/**
 * Beräkna tillåten ROM-procent
 */
export function calculateROMPercentage(
  restrictions: ROMRestrictions,
  jointType: keyof ROMRestrictions
): number {
  const restriction = restrictions[jointType];
  const fullROM = FULL_ROM_VALUES[jointType] || 90;

  if (!restriction) return 100; // Ingen restriktion = full ROM

  const maxAllowed = restriction.max || fullROM;
  return Math.round((maxAllowed / fullROM) * 100);
}

/**
 * Bestäm ROM-nivå baserat på procent
 */
export function getROMLevel(percentage: number): ROMLevel {
  if (percentage <= 25) return 'quarter';
  if (percentage <= 50) return 'half';
  if (percentage <= 75) return 'threeQuarter';
  return 'full';
}

// ============================================
// ANIMATION GENERATORS
// ============================================

/**
 * Generera squat-animation baserat på ROM
 */
export function generateSquatAnimation(
  romRestrictions: ROMRestrictions
): ExerciseAnimationVariant {
  const kneeROM = calculateROMPercentage(romRestrictions, 'kneeFlexion');
  const hipROM = calculateROMPercentage(romRestrictions, 'hipFlexion');
  const effectiveROM = Math.min(kneeROM, hipROM);
  const romLevel = getROMLevel(effectiveROM);

  // Beräkna faktiska vinklar
  const maxKnee = romRestrictions.kneeFlexion?.max || 135;
  const maxHip = romRestrictions.hipFlexion?.max || 120;

  const startPose: JointAngles = {
    leftKneeFlex: 5,
    rightKneeFlex: 5,
    leftHipFlex: 10,
    rightHipFlex: 10,
    spineFlex: 0
  };

  const endPose: JointAngles = {
    leftKneeFlex: Math.min(maxKnee, 90),
    rightKneeFlex: Math.min(maxKnee, 90),
    leftHipFlex: Math.min(maxHip, 90),
    rightHipFlex: Math.min(maxHip, 90),
    spineFlex: 10
  };

  const animation = createMultiKeyframeAnimation(
    `squat_${romLevel}`,
    [
      { time: 0, pose: startPose, easing: 'easeOut' },
      { time: 0.4, pose: endPose, easing: 'easeInOut' },
      { time: 0.6, pose: endPose, easing: 'easeInOut' },
      { time: 1, pose: startPose, easing: 'easeIn' }
    ],
    3000,
    true
  );

  const instructions = getSquatInstructions(romLevel, maxKnee);
  const warnings = effectiveROM < 50
    ? ['Begränsad ROM - fokusera på kontroll istället för djup']
    : undefined;

  return {
    name: 'Knäböj',
    romLevel,
    romPercentage: effectiveROM,
    animation,
    instructions,
    warnings
  };
}

/**
 * Generera axelflexion-animation baserat på ROM
 */
export function generateShoulderFlexionAnimation(
  romRestrictions: ROMRestrictions,
  side: 'left' | 'right' | 'both' = 'both'
): ExerciseAnimationVariant {
  const shoulderROM = calculateROMPercentage(romRestrictions, 'shoulderFlexion');
  const romLevel = getROMLevel(shoulderROM);

  const maxFlex = romRestrictions.shoulderFlexion?.max || 180;

  const startPose: JointAngles = {
    leftShoulderFlex: 0,
    rightShoulderFlex: 0,
    leftElbowFlex: 10,
    rightElbowFlex: 10
  };

  const endPose: JointAngles = { ...startPose };

  if (side === 'left' || side === 'both') {
    endPose.leftShoulderFlex = Math.min(maxFlex, 170);
  }
  if (side === 'right' || side === 'both') {
    endPose.rightShoulderFlex = Math.min(maxFlex, 170);
  }

  const animation = createMultiKeyframeAnimation(
    `shoulder_flexion_${romLevel}`,
    [
      { time: 0, pose: startPose, easing: 'easeOut' },
      { time: 0.45, pose: endPose, easing: 'easeInOut' },
      { time: 0.55, pose: endPose, easing: 'easeInOut' },
      { time: 1, pose: startPose, easing: 'easeIn' }
    ],
    4000,
    true
  );

  const instructions = getShoulderFlexionInstructions(romLevel, maxFlex);

  return {
    name: 'Axelflexion',
    romLevel,
    romPercentage: shoulderROM,
    animation,
    instructions,
    warnings: maxFlex <= 30 ? ['Mycket begränsad ROM - endast pendlande rörelser'] : undefined
  };
}

/**
 * Generera pendel-animation (för tidig post-op)
 */
export function generatePendulumAnimation(): ExerciseAnimationVariant {
  const startPose: JointAngles = {
    leftShoulderFlex: 30,
    leftShoulderAbduct: 10,
    spineFlex: 45, // Framåtlutad
    leftElbowFlex: 5
  };

  const leftPose: JointAngles = {
    ...startPose,
    leftShoulderAbduct: 25
  };

  const rightPose: JointAngles = {
    ...startPose,
    leftShoulderAbduct: -5
  };

  const forwardPose: JointAngles = {
    ...startPose,
    leftShoulderFlex: 40
  };

  const backPose: JointAngles = {
    ...startPose,
    leftShoulderFlex: 20
  };

  const animation = createMultiKeyframeAnimation(
    'pendulum',
    [
      { time: 0, pose: startPose, easing: 'easeInOut' },
      { time: 0.25, pose: leftPose, easing: 'easeInOut' },
      { time: 0.5, pose: startPose, easing: 'easeInOut' },
      { time: 0.75, pose: rightPose, easing: 'easeInOut' },
      { time: 1, pose: startPose, easing: 'easeInOut' }
    ],
    5000,
    true
  );

  return {
    name: 'Pendelrörelser',
    romLevel: 'quarter',
    romPercentage: 15,
    animation,
    instructions: [
      'Luta dig framåt med stöd på frisk arm',
      'Låt den opererade armen hänga avslappnat',
      'Sväng armen försiktigt i små cirklar',
      'Använd kroppsvikten - INTE axelmusklerna',
      'Fortsätt i 2-3 minuter'
    ],
    warnings: ['Passiv rörelse endast - aktivera INTE axelmusklerna']
  };
}

/**
 * Generera knäflexion-animation baserat på ROM
 */
export function generateKneeFlexionAnimation(
  romRestrictions: ROMRestrictions,
  side: 'left' | 'right' = 'left'
): ExerciseAnimationVariant {
  const kneeROM = calculateROMPercentage(romRestrictions, 'kneeFlexion');
  const romLevel = getROMLevel(kneeROM);
  const maxFlex = romRestrictions.kneeFlexion?.max || 135;

  const startPose: JointAngles = {
    leftKneeFlex: 10,
    rightKneeFlex: 10,
    leftHipFlex: 90, // Sittande position
    rightHipFlex: 90
  };

  const endPose: JointAngles = { ...startPose };

  if (side === 'left') {
    endPose.leftKneeFlex = Math.min(maxFlex, 120);
  } else {
    endPose.rightKneeFlex = Math.min(maxFlex, 120);
  }

  const animation = createMultiKeyframeAnimation(
    `knee_flexion_${romLevel}`,
    [
      { time: 0, pose: startPose, easing: 'easeOut' },
      { time: 0.4, pose: endPose, easing: 'easeInOut' },
      { time: 0.6, pose: endPose, easing: 'easeInOut' },
      { time: 1, pose: startPose, easing: 'easeIn' }
    ],
    3000,
    true
  );

  return {
    name: 'Knäflexion',
    romLevel,
    romPercentage: kneeROM,
    animation,
    instructions: [
      `Sitt på en stol eller bänk`,
      `Böj ${side === 'left' ? 'vänster' : 'höger'} knä långsamt`,
      `Stanna vid ${maxFlex}° eller vid första motståndet`,
      'Håll 2 sekunder',
      'Sträck tillbaka långsamt'
    ],
    warnings: kneeROM < 60 ? ['Begränsad ROM - överskriv inte smärtgränsen'] : undefined
  };
}

// ============================================
// INSTRUCTION GENERATORS
// ============================================

function getSquatInstructions(romLevel: ROMLevel, maxKnee: number): string[] {
  const baseInstructions = [
    'Stå med fötterna axelbrett',
    'Håll ryggen rak'
  ];

  switch (romLevel) {
    case 'quarter':
      return [
        ...baseInstructions,
        `Böj knäna endast ${maxKnee}° (liten rörelse)`,
        'Fokusera på balans och kontroll',
        'Använd stöd vid behov'
      ];
    case 'half':
      return [
        ...baseInstructions,
        `Böj knäna till max ${maxKnee}°`,
        'Stanna innan smärta uppstår',
        'Pressa tillbaka genom hälarna'
      ];
    case 'threeQuarter':
      return [
        ...baseInstructions,
        'Gå ner till ungefär låren är parallella med golvet',
        'Håll knäna i linje med tårna',
        'Kontrollerad rörelse hela vägen'
      ];
    case 'full':
      return [
        ...baseInstructions,
        'Full djup knäböj om smärtfritt',
        'Håll hälar i golvet',
        'Kontrollera rörelsen i hela omfånget'
      ];
  }
}

function getShoulderFlexionInstructions(romLevel: ROMLevel, maxFlex: number): string[] {
  switch (romLevel) {
    case 'quarter':
      return [
        'Stå eller sitt upprätt',
        `Lyft armen framåt max ${maxFlex}°`,
        'Mycket begränsad rörelse',
        'Håll armbågen lätt böjd',
        'Fokusera på kontroll'
      ];
    case 'half':
      return [
        'Stå eller sitt upprätt',
        `Lyft armen framåt till ${maxFlex}° (ungefär axelhöjd)`,
        'Kontrollerad rörelse',
        'Sänk långsamt'
      ];
    case 'threeQuarter':
      return [
        'Stå upprätt med god hållning',
        'Lyft armen framåt över axelhöjd',
        'Stanna vid smärta eller motstånd',
        'Undvik att kompensera med ryggen'
      ];
    case 'full':
      return [
        'Stå upprätt',
        'Lyft armen rakt fram till full höjd',
        'Håll armen nära örat i toppläget',
        'Kontrollera nedsänkningen'
      ];
  }
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

/**
 * Hämta animation för specifik övning med ROM-anpassning
 */
export function getAnimationForExercise(
  exerciseName: string,
  surgeryType?: string,
  daysSinceSurgery?: number,
  customRestrictions?: ROMRestrictions
): ExerciseAnimationVariant {
  // Hämta ROM-restriktioner
  let restrictions: ROMRestrictions = customRestrictions || {};

  if (surgeryType && daysSinceSurgery !== undefined) {
    restrictions = {
      ...getROMRestrictions(surgeryType, daysSinceSurgery),
      ...customRestrictions
    };
  }

  // Normalisera övningsnamn
  const normalizedName = exerciseName.toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/\s+/g, '_');

  // Matcha mot animation-generatorer
  if (normalizedName.includes('knaboj') || normalizedName.includes('squat')) {
    return generateSquatAnimation(restrictions);
  }

  if (normalizedName.includes('axelflexion') || normalizedName.includes('shoulder_flex')) {
    return generateShoulderFlexionAnimation(restrictions);
  }

  if (normalizedName.includes('pendel') || normalizedName.includes('codman')) {
    return generatePendulumAnimation();
  }

  if (normalizedName.includes('knaflex') || normalizedName.includes('knee_flex')) {
    return generateKneeFlexionAnimation(restrictions);
  }

  // Default animation
  return {
    name: exerciseName,
    romLevel: 'full',
    romPercentage: 100,
    animation: createMultiKeyframeAnimation(
      'default_exercise',
      [
        { time: 0, pose: {}, easing: 'easeInOut' },
        { time: 1, pose: {}, easing: 'easeInOut' }
      ],
      2000,
      true
    ),
    instructions: ['Följ instruktionerna för övningen']
  };
}
