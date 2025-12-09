/**
 * Anatomical Constraints - ROM Limits and Validation
 *
 * FAS 11: Biomekaniskt korrekta ROM-begränsningar
 *
 * Baserat på klinisk forskning och anatomiska standarder:
 * - Nordin & Frankel: Basic Biomechanics of the Musculoskeletal System
 * - Magee: Orthopedic Physical Assessment
 * - Hoppenfeld: Physical Examination of the Spine and Extremities
 */

// ============================================
// TYPES
// ============================================

export interface ROMLimit {
  min: number;          // Minimum normal ROM (grader)
  max: number;          // Maximum normal ROM (grader)
  warning: number;      // Varningsgräns före max
  hypermobility: number; // Gräns för hypermobilitet
  description: string;  // Beskrivning av rörelsen
}

export interface ValidationResult {
  valid: boolean;
  warning?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  correctedAngle?: number;
  recommendation?: string;
}

export type JointMovement =
  // Armbåge
  | 'elbowFlexion'
  | 'elbowExtension'
  // Axel
  | 'shoulderFlexion'
  | 'shoulderExtension'
  | 'shoulderAbduction'
  | 'shoulderAdduction'
  | 'shoulderInternalRotation'
  | 'shoulderExternalRotation'
  // Höft
  | 'hipFlexion'
  | 'hipExtension'
  | 'hipAbduction'
  | 'hipAdduction'
  | 'hipInternalRotation'
  | 'hipExternalRotation'
  // Knä
  | 'kneeFlexion'
  | 'kneeExtension'
  // Fotled
  | 'ankleDorsiflexion'
  | 'anklePlantarflexion'
  | 'ankleInversion'
  | 'ankleEversion'
  // Rygg
  | 'lumbarFlexion'
  | 'lumbarExtension'
  | 'lumbarLateralFlexion'
  | 'lumbarRotation'
  | 'thoracicFlexion'
  | 'thoracicExtension'
  | 'thoracicRotation'
  // Nacke
  | 'cervicalFlexion'
  | 'cervicalExtension'
  | 'cervicalLateralFlexion'
  | 'cervicalRotation';

// ============================================
// ROM LIMITS - ANATOMISKA GRÄNSER
// ============================================

/**
 * Anatomiska ROM-gränser baserade på klinisk forskning
 *
 * Källor:
 * - American Academy of Orthopaedic Surgeons (AAOS) normdata
 * - Gerhardt & Russe referensvärden
 * - Kapandji funktionell anatomi
 */
export const ANATOMICAL_ROM_LIMITS: Record<JointMovement, ROMLimit> = {
  // ========== ARMBÅGE ==========
  elbowFlexion: {
    min: 0,
    max: 150,
    warning: 145,
    hypermobility: 160,
    description: 'Armbågsböjning - normalt 0-150°',
  },
  elbowExtension: {
    min: 0,
    max: 10,
    warning: 5,
    hypermobility: 15,
    description: 'Armbågssträckning (hyperextension) - normalt 0-10°',
  },

  // ========== AXEL ==========
  shoulderFlexion: {
    min: 0,
    max: 180,
    warning: 170,
    hypermobility: 190,
    description: 'Axelböjning framåt - normalt 0-180°',
  },
  shoulderExtension: {
    min: 0,
    max: 60,
    warning: 55,
    hypermobility: 70,
    description: 'Axelsträckning bakåt - normalt 0-60°',
  },
  shoulderAbduction: {
    min: 0,
    max: 180,
    warning: 170,
    hypermobility: 190,
    description: 'Axelabduktion (ut från kroppen) - normalt 0-180°',
  },
  shoulderAdduction: {
    min: 0,
    max: 50,
    warning: 45,
    hypermobility: 60,
    description: 'Axeladduktion (mot kroppen) - normalt 0-50°',
  },
  shoulderInternalRotation: {
    min: 0,
    max: 70,
    warning: 65,
    hypermobility: 85,
    description: 'Axel inåtrotation - normalt 0-70°',
  },
  shoulderExternalRotation: {
    min: 0,
    max: 90,
    warning: 85,
    hypermobility: 100,
    description: 'Axel utåtrotation - normalt 0-90°',
  },

  // ========== HÖFT ==========
  hipFlexion: {
    min: 0,
    max: 130,
    warning: 120,
    hypermobility: 145,
    description: 'Höftböjning - normalt 0-130° (knä böjt)',
  },
  hipExtension: {
    min: 0,
    max: 30,
    warning: 25,
    hypermobility: 40,
    description: 'Höftsträckning - normalt 0-30°',
  },
  hipAbduction: {
    min: 0,
    max: 45,
    warning: 40,
    hypermobility: 55,
    description: 'Höftabduktion - normalt 0-45°',
  },
  hipAdduction: {
    min: 0,
    max: 30,
    warning: 25,
    hypermobility: 40,
    description: 'Höftadduktion - normalt 0-30°',
  },
  hipInternalRotation: {
    min: 0,
    max: 45,
    warning: 40,
    hypermobility: 55,
    description: 'Höft inåtrotation - normalt 0-45°',
  },
  hipExternalRotation: {
    min: 0,
    max: 45,
    warning: 40,
    hypermobility: 55,
    description: 'Höft utåtrotation - normalt 0-45°',
  },

  // ========== KNÄ ==========
  kneeFlexion: {
    min: 0,
    max: 140,
    warning: 135,
    hypermobility: 155,
    description: 'Knäböjning - normalt 0-140°',
  },
  kneeExtension: {
    min: 0,
    max: 10,
    warning: 5,
    hypermobility: 15,
    description: 'Knästräckning (hyperextension) - normalt 0-10°',
  },

  // ========== FOTLED ==========
  ankleDorsiflexion: {
    min: 0,
    max: 25,
    warning: 20,
    hypermobility: 30,
    description: 'Fotled dorsalflexion - normalt 0-25°',
  },
  anklePlantarflexion: {
    min: 0,
    max: 50,
    warning: 45,
    hypermobility: 60,
    description: 'Fotled plantarflexion - normalt 0-50°',
  },
  ankleInversion: {
    min: 0,
    max: 35,
    warning: 30,
    hypermobility: 45,
    description: 'Fotled inversion - normalt 0-35°',
  },
  ankleEversion: {
    min: 0,
    max: 20,
    warning: 15,
    hypermobility: 25,
    description: 'Fotled eversion - normalt 0-20°',
  },

  // ========== LÄNDRYGG (LUMBAR) ==========
  lumbarFlexion: {
    min: 0,
    max: 60,
    warning: 55,
    hypermobility: 75,
    description: 'Ländrygg flexion - normalt 0-60°',
  },
  lumbarExtension: {
    min: 0,
    max: 25,
    warning: 20,
    hypermobility: 35,
    description: 'Ländrygg extension - normalt 0-25°',
  },
  lumbarLateralFlexion: {
    min: 0,
    max: 25,
    warning: 20,
    hypermobility: 35,
    description: 'Ländrygg sidoböjning - normalt 0-25°',
  },
  lumbarRotation: {
    min: 0,
    max: 10,
    warning: 8,
    hypermobility: 15,
    description: 'Ländrygg rotation - normalt 0-10°',
  },

  // ========== BRÖSTRYGG (THORACIC) ==========
  thoracicFlexion: {
    min: 0,
    max: 40,
    warning: 35,
    hypermobility: 50,
    description: 'Bröstrygg flexion - normalt 0-40°',
  },
  thoracicExtension: {
    min: 0,
    max: 20,
    warning: 15,
    hypermobility: 25,
    description: 'Bröstrygg extension - normalt 0-20°',
  },
  thoracicRotation: {
    min: 0,
    max: 35,
    warning: 30,
    hypermobility: 45,
    description: 'Bröstrygg rotation - normalt 0-35°',
  },

  // ========== NACKE (CERVICAL) ==========
  cervicalFlexion: {
    min: 0,
    max: 50,
    warning: 45,
    hypermobility: 60,
    description: 'Nacke flexion - normalt 0-50°',
  },
  cervicalExtension: {
    min: 0,
    max: 60,
    warning: 55,
    hypermobility: 70,
    description: 'Nacke extension - normalt 0-60°',
  },
  cervicalLateralFlexion: {
    min: 0,
    max: 45,
    warning: 40,
    hypermobility: 55,
    description: 'Nacke sidoböjning - normalt 0-45°',
  },
  cervicalRotation: {
    min: 0,
    max: 80,
    warning: 75,
    hypermobility: 90,
    description: 'Nacke rotation - normalt 0-80°',
  },
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validera en ledvinkel mot anatomiska gränser
 *
 * @param movement - Typ av ledrörelse
 * @param angle - Uppmätt vinkel i grader
 * @returns Valideringsresultat med eventuella varningar
 */
export function validateJointAngle(
  movement: JointMovement,
  angle: number
): ValidationResult {
  const limits = ANATOMICAL_ROM_LIMITS[movement];
  if (!limits) {
    return { valid: true };
  }

  const absAngle = Math.abs(angle);

  // Kontrollera hypermobilitet
  if (absAngle > limits.hypermobility) {
    return {
      valid: false,
      severity: 'severe',
      warning: `${movement} indikerar hypermobilitet (${absAngle.toFixed(1)}° > ${limits.hypermobility}°)`,
      correctedAngle: limits.max,
      recommendation: 'Kontrollera mätning eller utred hypermobilitet',
    };
  }

  // Överskriver maxgräns
  if (absAngle > limits.max) {
    return {
      valid: false,
      severity: 'moderate',
      warning: `${movement} överskrider anatomisk gräns (${absAngle.toFixed(1)}° > ${limits.max}°)`,
      correctedAngle: limits.max,
      recommendation: 'Värdet kan vara mätfel - verifiera position',
    };
  }

  // Nära maxgräns (varning)
  if (absAngle > limits.warning) {
    return {
      valid: true,
      severity: 'mild',
      warning: `${movement} nära end-range (${absAngle.toFixed(1)}°)`,
      recommendation: 'Normal ROM, men nära maximal rörlighet',
    };
  }

  return { valid: true };
}

/**
 * Validera alla vinklar och returnera eventuella problem
 */
export function validateAllAngles(
  angles: Record<string, number>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [key, angle] of Object.entries(angles)) {
    // Mappa vinkelnamn till JointMovement
    const movement = mapAngleNameToMovement(key);
    if (movement) {
      results[key] = validateJointAngle(movement, angle);
    }
  }

  return results;
}

/**
 * Mappa interna vinkelnamn till JointMovement-typer
 */
function mapAngleNameToMovement(angleName: string): JointMovement | null {
  const mapping: Record<string, JointMovement> = {
    // Armbåge
    leftElbow: 'elbowFlexion',
    rightElbow: 'elbowFlexion',

    // Axel
    leftShoulderFlexion: 'shoulderFlexion',
    rightShoulderFlexion: 'shoulderFlexion',
    leftShoulderAbduction: 'shoulderAbduction',
    rightShoulderAbduction: 'shoulderAbduction',

    // Höft
    leftHip: 'hipFlexion',
    rightHip: 'hipFlexion',

    // Knä
    leftKnee: 'kneeFlexion',
    rightKnee: 'kneeFlexion',

    // Fotled
    leftAnkle: 'ankleDorsiflexion',
    rightAnkle: 'ankleDorsiflexion',
  };

  return mapping[angleName] || null;
}

// ============================================
// FUNCTIONAL ROM REQUIREMENTS
// ============================================

/**
 * Funktionella ROM-krav för vardagliga aktiviteter
 * Baserat på Ryu et al. och Magee funktionella analyser
 */
export const FUNCTIONAL_ROM_REQUIREMENTS = {
  // Gång
  walking: {
    hipFlexion: 30,
    hipExtension: 10,
    kneeFlexion: 60,
    ankleDorsiflexion: 10,
    anklePlantarflexion: 20,
  },

  // Trappgång uppåt
  stairsUp: {
    hipFlexion: 65,
    kneeFlexion: 85,
    ankleDorsiflexion: 15,
  },

  // Trappgång nedåt
  stairsDown: {
    hipFlexion: 35,
    kneeFlexion: 90,
    ankleDorsiflexion: 20,
  },

  // Sitta ner/resa sig
  sitToStand: {
    hipFlexion: 95,
    kneeFlexion: 105,
    ankleDorsiflexion: 15,
  },

  // Knyta skor
  tieShoes: {
    hipFlexion: 120,
    kneeFlexion: 115,
    lumbarFlexion: 40,
  },

  // Nå overhead (hämta från hög hylla)
  reachOverhead: {
    shoulderFlexion: 160,
    shoulderAbduction: 160,
    elbowFlexion: 30,
  },

  // Kamma hår
  combHair: {
    shoulderFlexion: 130,
    shoulderAbduction: 80,
    shoulderExternalRotation: 45,
    elbowFlexion: 140,
  },

  // Äta med gaffel
  eatWithFork: {
    shoulderFlexion: 45,
    elbowFlexion: 130,
    shoulderInternalRotation: 30,
  },
};

/**
 * Kontrollera om ROM är tillräcklig för en specifik aktivitet
 */
export function checkFunctionalROM(
  activity: keyof typeof FUNCTIONAL_ROM_REQUIREMENTS,
  currentROM: Record<string, number>
): { sufficient: boolean; deficits: string[] } {
  const requirements = FUNCTIONAL_ROM_REQUIREMENTS[activity];
  const deficits: string[] = [];

  for (const [movement, required] of Object.entries(requirements)) {
    const current = currentROM[movement] || 0;
    if (current < required) {
      deficits.push(
        `${movement}: ${current.toFixed(0)}° (behöver ${required}°)`
      );
    }
  }

  return {
    sufficient: deficits.length === 0,
    deficits,
  };
}

// ============================================
// AGE-ADJUSTED ROM NORMS
// ============================================

/**
 * Åldersrelaterade ROM-justeringar
 * ROM minskar typiskt ~0.5-1° per år efter 25 års ålder
 */
export function getAgeAdjustedROM(
  movement: JointMovement,
  age: number
): ROMLimit {
  const baseLimit = ANATOMICAL_ROM_LIMITS[movement];
  if (!baseLimit) return baseLimit;

  // Ingen justering för under 25 år
  if (age <= 25) return baseLimit;

  // Beräkna åldersrelaterad minskning
  // ~0.5% per år efter 25 (konservativt)
  const yearsOver25 = age - 25;
  const reductionFactor = 1 - (yearsOver25 * 0.005);
  const clampedFactor = Math.max(0.7, reductionFactor); // Max 30% minskning

  return {
    ...baseLimit,
    max: Math.round(baseLimit.max * clampedFactor),
    warning: Math.round(baseLimit.warning * clampedFactor),
    hypermobility: baseLimit.hypermobility, // Hypermobilitet ändras inte
  };
}

// ============================================
// EXPORT HELPER
// ============================================

export function getROMDescription(movement: JointMovement): string {
  return ANATOMICAL_ROM_LIMITS[movement]?.description || 'Okänd rörelse';
}

export function getROMMax(movement: JointMovement): number {
  return ANATOMICAL_ROM_LIMITS[movement]?.max || 180;
}

// ============================================
// SPRINT 2B: POST-OPERATIVE ROM PHASING
// ============================================

/**
 * Postoperativ ROM-fas
 *
 * Definierar tillåten rörelseomfång baserat på vecka efter operation.
 * Kritiskt för att förhindra skada på läkande vävnad.
 */
export interface PostOpROMPhase {
  phase: 1 | 2 | 3 | 4 | 5;
  name: string;
  weekRange: { min: number; max: number };
  romLimits: Partial<Record<JointMovement, {
    max: number;
    weightBearing: boolean;
    resistanceAllowed: boolean;
  }>>;
  restrictions: string[];
  goals: string[];
}

export type SurgeryType =
  | 'acl_reconstruction'
  | 'tkr' // Total knäprotes
  | 'thr' // Total höftprotes
  | 'achilles_repair'
  | 'rotator_cuff_repair'
  | 'bankart_repair'
  | 'mpfl_reconstruction'
  | 'meniscus_repair'
  | 'hip_arthroscopy'
  | 'ankle_fracture_orif'
  | 'lumbar_fusion'
  | 'cervical_fusion';

/**
 * Postoperativa ROM-protokoll per kirurgi
 *
 * Baserat på aktuella kliniska riktlinjer:
 * - AAOS Clinical Practice Guidelines
 * - MOON Consortium ACL protokoll
 * - Institutionsspecifika protokoll från ledande ortopediska centra
 */
export const POST_OP_ROM_BY_SURGERY: Record<SurgeryType, PostOpROMPhase[]> = {

  // ========== ACL REKONSTRUKTION ==========
  acl_reconstruction: [
    {
      phase: 1,
      name: 'Akut/Skyddsfas',
      weekRange: { min: 0, max: 2 },
      romLimits: {
        kneeFlexion: { max: 90, weightBearing: false, resistanceAllowed: false },
        kneeExtension: { max: 0, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: [
        'Ingen aktiv knäextension sista 30°',
        'Kryckor med partiell belastning',
        'Ortos låst 0° vid gång',
      ],
      goals: ['Full extension (0°)', 'Flexion till 90°', 'Kontroll av svullnad'],
    },
    {
      phase: 2,
      name: 'Tidig mobilisering',
      weekRange: { min: 2, max: 6 },
      romLimits: {
        kneeFlexion: { max: 120, weightBearing: true, resistanceAllowed: false },
        kneeExtension: { max: 0, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: [
        'Ingen öppen kinetisk kedja extension',
        'Full belastning OK',
        'Undvik djupa knäböj',
      ],
      goals: ['Flexion 120°', 'Normal gång utan hälta', 'Aktiv quadricepskontroll'],
    },
    {
      phase: 3,
      name: 'Styrka & kontroll',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        kneeFlexion: { max: 135, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: [
        'Ingen löpning',
        'Ingen pivoting/vridning',
        'Gradvis ökning av motstånd',
      ],
      goals: ['Full ROM', 'Symmetrisk styrka 70%', 'Cykling utan smärta'],
    },
    {
      phase: 4,
      name: 'Funktion & återgång',
      weekRange: { min: 12, max: 24 },
      romLimits: {
        kneeFlexion: { max: 145, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Gradvis återgång till sport', 'Undvik kontaktsport'],
      goals: ['Löpning', 'Hopp', 'Sportspecifik träning'],
    },
    {
      phase: 5,
      name: 'Full återgång',
      weekRange: { min: 24, max: 52 },
      romLimits: {
        kneeFlexion: { max: 150, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Individuell bedömning för kontaktsport'],
      goals: ['Symmetrisk styrka 90%', 'Klarat funktionstest', 'Full sport'],
    },
  ],

  // ========== TOTAL KNÄPROTES (TKR) ==========
  tkr: [
    {
      phase: 1,
      name: 'Akut postop',
      weekRange: { min: 0, max: 2 },
      romLimits: {
        kneeFlexion: { max: 90, weightBearing: true, resistanceAllowed: false },
        kneeExtension: { max: 0, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Kryckor/rullator', 'Trombosprofylax', 'Is och elevation'],
      goals: ['Flexion 90°', 'Full extension', 'Självständig transfer'],
    },
    {
      phase: 2,
      name: 'Tidig rehab',
      weekRange: { min: 2, max: 6 },
      romLimits: {
        kneeFlexion: { max: 110, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Undvik höga stolen', 'Ingen djup böjning'],
      goals: ['Flexion 110°', 'Trappgång', 'Gång utan hjälpmedel (6v)'],
    },
    {
      phase: 3,
      name: 'Framsteg',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        kneeFlexion: { max: 120, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Ingen löpning', 'Undvik stötbelastning'],
      goals: ['Flexion 120°', 'Normal gång', 'ADL självständigt'],
    },
  ],

  // ========== TOTAL HÖFTPROTES (THR) ==========
  thr: [
    {
      phase: 1,
      name: 'Akut postop (posterior approach)',
      weekRange: { min: 0, max: 6 },
      romLimits: {
        hipFlexion: { max: 90, weightBearing: true, resistanceAllowed: false },
        hipInternalRotation: { max: 0, weightBearing: true, resistanceAllowed: false },
        hipAdduction: { max: 0, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: [
        'INGEN flexion >90°',
        'INGEN inåtrotation',
        'INGEN adduktion över medellinjen',
        'Sov med kudde mellan benen',
        'Högt toalettsits',
      ],
      goals: ['Säker gång med hjälpmedel', 'Följa höftrestriktioner'],
    },
    {
      phase: 2,
      name: 'Gradvis frihet',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        hipFlexion: { max: 110, weightBearing: true, resistanceAllowed: true },
        hipInternalRotation: { max: 20, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Fortsatt försiktighet', 'Undvik extrema positioner'],
      goals: ['Gång utan hjälpmedel', 'Trappor', 'Gradvis normalisering'],
    },
    {
      phase: 3,
      name: 'Full aktivitet',
      weekRange: { min: 12, max: 26 },
      romLimits: {
        hipFlexion: { max: 130, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Undvik kontaktsport', 'Undvik löpning på asfalt'],
      goals: ['Full ROM', 'Cykling', 'Simning', 'Golf'],
    },
  ],

  // ========== ACHILLESSENRUPTUR ==========
  achilles_repair: [
    {
      phase: 1,
      name: 'Immobilisering',
      weekRange: { min: 0, max: 2 },
      romLimits: {
        ankleDorsiflexion: { max: -20, weightBearing: false, resistanceAllowed: false }, // Plantarflexion
        anklePlantarflexion: { max: 30, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Gips/ortos i equinus (plantarflexion)', 'Icke-viktbärande', 'Kryckor'],
      goals: ['Skydda reparationen', 'Kontroll av svullnad'],
    },
    {
      phase: 2,
      name: 'Tidig mobilisering',
      weekRange: { min: 2, max: 6 },
      romLimits: {
        ankleDorsiflexion: { max: 0, weightBearing: false, resistanceAllowed: false },
        anklePlantarflexion: { max: 30, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Gradvis minskning av equinus', 'Partiell belastning från vecka 4'],
      goals: ['Neutral fotposition vecka 6', 'Kontrollerad ROM'],
    },
    {
      phase: 3,
      name: 'Belastning',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        ankleDorsiflexion: { max: 10, weightBearing: true, resistanceAllowed: false },
        anklePlantarflexion: { max: 40, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Full belastning i skor', 'Ingen löpning', 'Ingen hopp'],
      goals: ['Normal gång', 'Gradvis ökad dorsalflexion'],
    },
    {
      phase: 4,
      name: 'Styrka',
      weekRange: { min: 12, max: 24 },
      romLimits: {
        ankleDorsiflexion: { max: 20, weightBearing: true, resistanceAllowed: true },
        anklePlantarflexion: { max: 50, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Gradvis återgång till löpning (16v)', 'Undvik plyometri initialt'],
      goals: ['Full ROM', 'Tåhävning på ett ben', 'Jogging'],
    },
  ],

  // ========== ROTATORKUFFRUPTUR ==========
  rotator_cuff_repair: [
    {
      phase: 1,
      name: 'Skyddsfas',
      weekRange: { min: 0, max: 6 },
      romLimits: {
        shoulderFlexion: { max: 90, weightBearing: false, resistanceAllowed: false },
        shoulderAbduction: { max: 60, weightBearing: false, resistanceAllowed: false },
        shoulderExternalRotation: { max: 30, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: [
        'Slynga/immobilisering 4-6 veckor',
        'Endast passiv ROM',
        'Ingen aktiv lyftning',
        'Sov på rygg eller frisk sida',
      ],
      goals: ['Passiv ROM', 'Smärtkontroll', 'Pendelövningar'],
    },
    {
      phase: 2,
      name: 'Tidig aktiv',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        shoulderFlexion: { max: 140, weightBearing: false, resistanceAllowed: false },
        shoulderAbduction: { max: 120, weightBearing: false, resistanceAllowed: false },
        shoulderExternalRotation: { max: 45, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: [
        'Aktiv-assisterad ROM',
        'Ingen belastning',
        'Undvik lyft bakom rygg',
      ],
      goals: ['Aktiv ROM', 'Scapulär kontroll'],
    },
    {
      phase: 3,
      name: 'Styrka',
      weekRange: { min: 12, max: 24 },
      romLimits: {
        shoulderFlexion: { max: 180, weightBearing: false, resistanceAllowed: true },
        shoulderAbduction: { max: 180, weightBearing: false, resistanceAllowed: true },
      },
      restrictions: ['Gradvis styrketräning', 'Undvik tung overhead initialt'],
      goals: ['Full ROM', 'Isometrisk styrka', 'Gradvis motstånd'],
    },
  ],

  // ========== BANKART REPAIR (Axelinstabilitet) ==========
  bankart_repair: [
    {
      phase: 1,
      name: 'Immobilisering',
      weekRange: { min: 0, max: 4 },
      romLimits: {
        shoulderExternalRotation: { max: 0, weightBearing: false, resistanceAllowed: false },
        shoulderAbduction: { max: 45, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Slynga 4 veckor', 'Ingen extern rotation', 'Ingen abduktion'],
      goals: ['Skydda reparationen', 'Pendelövningar OK'],
    },
    {
      phase: 2,
      name: 'Tidig ROM',
      weekRange: { min: 4, max: 8 },
      romLimits: {
        shoulderFlexion: { max: 120, weightBearing: false, resistanceAllowed: false },
        shoulderExternalRotation: { max: 30, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Gradvis ökad ER', 'Ingen belastning'],
      goals: ['Kontrollerad ROM-ökning'],
    },
    {
      phase: 3,
      name: 'Styrka',
      weekRange: { min: 8, max: 16 },
      romLimits: {
        shoulderFlexion: { max: 180, weightBearing: false, resistanceAllowed: true },
        shoulderExternalRotation: { max: 60, weightBearing: false, resistanceAllowed: true },
      },
      restrictions: ['Gradvis styrka', 'Undvik kastposition'],
      goals: ['Full ROM', 'Rotatorkuffstyrka'],
    },
  ],

  // ========== MPFL REKONSTRUKTION (Patellär instabilitet) ==========
  mpfl_reconstruction: [
    {
      phase: 1,
      name: 'Skyddsfas',
      weekRange: { min: 0, max: 2 },
      romLimits: {
        kneeFlexion: { max: 60, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Ortos 0-60°', 'Partiell belastning', 'Kryckor'],
      goals: ['Svullnadskontroll', 'Quad-aktivering'],
    },
    {
      phase: 2,
      name: 'Tidig mobilisering',
      weekRange: { min: 2, max: 6 },
      romLimits: {
        kneeFlexion: { max: 90, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Gradvis ökad flexion', 'Undvik lateral stress'],
      goals: ['Flexion 90°', 'Normal gång'],
    },
    {
      phase: 3,
      name: 'Framsteg',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        kneeFlexion: { max: 120, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Undvik pivoting', 'Gradvis styrka'],
      goals: ['Full ROM', 'Trappgång', 'Cykling'],
    },
  ],

  // ========== MENISKREPARATION ==========
  meniscus_repair: [
    {
      phase: 1,
      name: 'Skyddsfas',
      weekRange: { min: 0, max: 4 },
      romLimits: {
        kneeFlexion: { max: 90, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Icke-viktbärande 4 veckor', 'Ortos 0-90°', 'Ingen djup böjning'],
      goals: ['Skydda reparationen', 'Quad-kontroll'],
    },
    {
      phase: 2,
      name: 'Tidig belastning',
      weekRange: { min: 4, max: 8 },
      romLimits: {
        kneeFlexion: { max: 120, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Partiell → full belastning', 'Undvik djup knäböj'],
      goals: ['Gradvis ROM', 'Normal gång'],
    },
    {
      phase: 3,
      name: 'Funktion',
      weekRange: { min: 8, max: 16 },
      romLimits: {
        kneeFlexion: { max: 135, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Undvik vridning', 'Gradvis löpning från vecka 12'],
      goals: ['Full ROM', 'Styrka', 'Jogging'],
    },
  ],

  // ========== HÖFTARTROSKOPI ==========
  hip_arthroscopy: [
    {
      phase: 1,
      name: 'Akut',
      weekRange: { min: 0, max: 2 },
      romLimits: {
        hipFlexion: { max: 90, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Partiell belastning', 'Undvik djup flexion', 'Undvik rotation'],
      goals: ['Svullnadskontroll', 'Smärtkontroll'],
    },
    {
      phase: 2,
      name: 'Framsteg',
      weekRange: { min: 2, max: 6 },
      romLimits: {
        hipFlexion: { max: 110, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Full belastning', 'Undvik extrema positioner'],
      goals: ['Normal gång', 'Grundläggande styrka'],
    },
    {
      phase: 3,
      name: 'Styrka',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        hipFlexion: { max: 130, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Gradvis ökad belastning'],
      goals: ['Full ROM', 'Styrka', 'Cykling/simning'],
    },
  ],

  // ========== ANKELFRAKTUR ORIF ==========
  ankle_fracture_orif: [
    {
      phase: 1,
      name: 'Immobilisering',
      weekRange: { min: 0, max: 6 },
      romLimits: {
        ankleDorsiflexion: { max: 0, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Gips/ortos', 'Icke-viktbärande 6 veckor', 'Kryckor'],
      goals: ['Frakturläkning', 'Svullnadskontroll'],
    },
    {
      phase: 2,
      name: 'Tidig mobilisering',
      weekRange: { min: 6, max: 10 },
      romLimits: {
        ankleDorsiflexion: { max: 10, weightBearing: true, resistanceAllowed: false },
        anklePlantarflexion: { max: 30, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Gradvis belastning i ortos', 'Undvik ojämn mark'],
      goals: ['Partiell belastning', 'ROM-återhämtning'],
    },
    {
      phase: 3,
      name: 'Full belastning',
      weekRange: { min: 10, max: 16 },
      romLimits: {
        ankleDorsiflexion: { max: 20, weightBearing: true, resistanceAllowed: true },
        anklePlantarflexion: { max: 45, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Undvik löpning till vecka 12', 'Gradvis balansträning'],
      goals: ['Normal gång', 'Full ROM', 'Styrka'],
    },
  ],

  // ========== LUMBAR FUSION ==========
  lumbar_fusion: [
    {
      phase: 1,
      name: 'Skyddsfas',
      weekRange: { min: 0, max: 6 },
      romLimits: {
        lumbarFlexion: { max: 20, weightBearing: true, resistanceAllowed: false },
        lumbarExtension: { max: 0, weightBearing: true, resistanceAllowed: false },
        lumbarRotation: { max: 5, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: [
        'Ingen böjning, lyft, vridning (BLT)',
        'Max lyft 2-3 kg',
        'Loggroll-teknik vid säng',
        'Undvik sittande >30 min',
      ],
      goals: ['Skydda fusion', 'Grundläggande mobilitet', 'Promenad'],
    },
    {
      phase: 2,
      name: 'Gradvis aktivitet',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        lumbarFlexion: { max: 30, weightBearing: true, resistanceAllowed: false },
        lumbarExtension: { max: 10, weightBearing: true, resistanceAllowed: false },
      },
      restrictions: ['Fortsatt försiktighet', 'Max lyft 5 kg', 'Undvik repetitiv böjning'],
      goals: ['Ökad gångsträcka', 'Grundläggande core-aktivering'],
    },
    {
      phase: 3,
      name: 'Funktion',
      weekRange: { min: 12, max: 26 },
      romLimits: {
        lumbarFlexion: { max: 45, weightBearing: true, resistanceAllowed: true },
      },
      restrictions: ['Gradvis ökning', 'Undvik högrisk-aktiviteter'],
      goals: ['ADL självständigt', 'Återgång arbete (kontorsjobb)'],
    },
  ],

  // ========== CERVICAL FUSION ==========
  cervical_fusion: [
    {
      phase: 1,
      name: 'Immobilisering',
      weekRange: { min: 0, max: 6 },
      romLimits: {
        cervicalFlexion: { max: 10, weightBearing: false, resistanceAllowed: false },
        cervicalExtension: { max: 5, weightBearing: false, resistanceAllowed: false },
        cervicalRotation: { max: 15, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Halskrage', 'Ingen lyft >2 kg', 'Undvik bilkörning'],
      goals: ['Skydda fusion', 'Grundläggande ADL'],
    },
    {
      phase: 2,
      name: 'Gradvis frihet',
      weekRange: { min: 6, max: 12 },
      romLimits: {
        cervicalFlexion: { max: 30, weightBearing: false, resistanceAllowed: false },
        cervicalRotation: { max: 45, weightBearing: false, resistanceAllowed: false },
      },
      restrictions: ['Av krage', 'Fortsatt försiktighet'],
      goals: ['Ökad ROM', 'Posturala övningar'],
    },
    {
      phase: 3,
      name: 'Funktion',
      weekRange: { min: 12, max: 26 },
      romLimits: {
        cervicalFlexion: { max: 45, weightBearing: false, resistanceAllowed: true },
        cervicalRotation: { max: 70, weightBearing: false, resistanceAllowed: true },
      },
      restrictions: ['Undvik kontaktsport', 'Undvik extrem extension'],
      goals: ['Funktionell ROM', 'Styrka', 'Återgång arbete'],
    },
  ],
};

/**
 * Hämta aktuell postoperativ fas baserat på vecka efter operation
 */
export function getPostOpPhase(
  surgeryType: SurgeryType,
  weeksPostOp: number
): PostOpROMPhase | null {
  const phases = POST_OP_ROM_BY_SURGERY[surgeryType];
  if (!phases) return null;

  for (const phase of phases) {
    if (weeksPostOp >= phase.weekRange.min && weeksPostOp <= phase.weekRange.max) {
      return phase;
    }
  }

  // Om vi passerat alla faser, returnera sista fasen
  return phases[phases.length - 1];
}

/**
 * Validera ROM mot postoperativa begränsningar
 */
export function validatePostOpROM(
  surgeryType: SurgeryType,
  weeksPostOp: number,
  movement: JointMovement,
  angle: number
): ValidationResult {
  const phase = getPostOpPhase(surgeryType, weeksPostOp);
  if (!phase) {
    return { valid: true };
  }

  const limit = phase.romLimits[movement];
  if (!limit) {
    // Ingen specifik begränsning för denna rörelse
    return validateJointAngle(movement, angle);
  }

  if (Math.abs(angle) > limit.max) {
    return {
      valid: false,
      severity: 'severe',
      warning: `${movement} överskrider postoperativ begränsning för fas ${phase.phase} ` +
        `(${phase.name}): ${Math.abs(angle).toFixed(1)}° > ${limit.max}°`,
      correctedAngle: limit.max,
      recommendation: `Begränsa rörelsen till max ${limit.max}° i denna fas. ` +
        `Kontakta fysioterapeut om osäkerhet.`,
    };
  }

  return { valid: true };
}

/**
 * Generera postoperativ träningsguide
 */
export function generatePostOpExerciseGuide(
  surgeryType: SurgeryType,
  weeksPostOp: number
): string {
  const phase = getPostOpPhase(surgeryType, weeksPostOp);
  if (!phase) {
    return 'Ingen postoperativ information tillgänglig för denna kirurgi.';
  }

  let guide = `# Postoperativ fas ${phase.phase}: ${phase.name}\n\n`;
  guide += `**Vecka ${phase.weekRange.min}-${phase.weekRange.max} efter operation**\n\n`;

  guide += '## ROM-begränsningar\n';
  for (const [movement, limit] of Object.entries(phase.romLimits)) {
    const desc = ANATOMICAL_ROM_LIMITS[movement as JointMovement]?.description || movement;
    guide += `- ${desc}: max ${limit?.max}°`;
    if (limit?.weightBearing) guide += ' (viktbärande OK)';
    if (limit?.resistanceAllowed) guide += ' (motstånd OK)';
    guide += '\n';
  }

  guide += '\n## Restriktioner\n';
  for (const restriction of phase.restrictions) {
    guide += `- ⚠️ ${restriction}\n`;
  }

  guide += '\n## Mål för denna fas\n';
  for (const goal of phase.goals) {
    guide += `- ✅ ${goal}\n`;
  }

  return guide;
}
