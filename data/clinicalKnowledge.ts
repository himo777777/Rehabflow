/**
 * Clinical Knowledge Database
 * Evidence-based data for AI program generation
 * Used to enhance AI prompts with accurate clinical information
 */

// ============================================
// TISSUE HEALING TIMELINES
// ============================================

export interface HealingTimeline {
  phase1: number;  // Days - Protection/Early healing
  phase2: number;  // Days - Repair/Strength building
  phase3: number;  // Days - Remodeling/Return to activity
  fullRecovery?: number; // Days - Full recovery estimate
  description: string;
  precautions: string[];
}

export const HEALING_TIMELINES: Record<string, HealingTimeline> = {
  // Knee surgeries
  'ACL_reconstruction': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 270,  // 9 months total
    fullRecovery: 365, // 12 months
    description: 'ACL-rekonstruktion kräver lång läkningstid för graft-integrering',
    precautions: [
      'Ingen pivoting/vridning första 6 månader',
      'Progressiv belastning enligt protokoll',
      'Fokus på quadriceps-aktivering tidigt'
    ]
  },
  'meniscus_repair': {
    phase1: 28,   // 4 weeks
    phase2: 56,   // 8 weeks total
    phase3: 120,  // 4 months total
    description: 'Menisksutur behöver skyddas för läkning',
    precautions: [
      'Ingen djup knäböjning första 6 veckor',
      'Begränsad viktbärning initialt',
      'Undvik vridbelastning'
    ]
  },
  'meniscus_partial': {
    phase1: 7,    // 1 week
    phase2: 21,   // 3 weeks total
    phase3: 42,   // 6 weeks total
    description: 'Partiell meniskektomi har snabbare rehabilitering',
    precautions: [
      'Progressiv belastning efter smärtfrihet',
      'Fokus på ROM tidigt'
    ]
  },
  'knee_arthroplasty': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 180,  // 6 months total
    description: 'Knäprotes kräver fokus på ROM och styrka',
    precautions: [
      'Undvik högriskaktiviteter (löpning, hopp)',
      'Fokus på 0-120 grader ROM',
      'Livslång underhållsträning'
    ]
  },

  // Shoulder surgeries
  'rotator_cuff_small': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 150,  // 5 months total
    description: 'Liten rotatorkuffruptur (<1cm)',
    precautions: [
      'Mitella/sling 4-6 veckor',
      'Passiv ROM endast först',
      'Ingen aktiv lyftning över huvudet tidigt'
    ]
  },
  'rotator_cuff_large': {
    phase1: 56,   // 8 weeks
    phase2: 112,  // 4 months total
    phase3: 210,  // 7 months total
    description: 'Stor rotatorkuffruptur (>3cm)',
    precautions: [
      'Mitella 6-8 veckor',
      'Förlängd passiv fas',
      'Försiktig progression'
    ]
  },
  'shoulder_arthroplasty': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 180,  // 6 months total
    description: 'Axelprotes (total eller hemi)',
    precautions: [
      'Ingen belastning/lyftning första 6 veckor',
      'Endast passiv ROM initialt',
      'Undvik extern rotation tidigt'
    ]
  },
  'reverse_shoulder_arthroplasty': {
    phase1: 56,   // 8 weeks
    phase2: 112,  // 4 months total
    phase3: 180,  // 6 months total
    description: 'Omvänd axelprotes - striktare protokoll',
    precautions: [
      'Mycket försiktig med abduktion',
      'Ingen belastning 8 veckor',
      'Begränsad slutlig ROM'
    ]
  },
  'labrum_repair': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 150,  // 5 months total
    description: 'Labrumkirurgi (SLAP, Bankart)',
    precautions: [
      'Mitella 4-6 veckor',
      'Begränsad utåtrotation',
      'Gradvis återgång till kastaktiviteter'
    ]
  },

  // Hip surgeries
  'hip_arthroplasty': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 180,  // 6 months total
    description: 'Höftprotes (total eller hemi)',
    precautions: [
      'Undvik djup böjning (>90°) initialt',
      'Ingen adduktion över mittlinjen',
      'Undvik inåtrotation'
    ]
  },
  'hip_arthroscopy': {
    phase1: 21,   // 3 weeks
    phase2: 56,   // 8 weeks total
    phase3: 120,  // 4 months total
    description: 'Höftartroskopi (FAI, labrum)',
    precautions: [
      'Kryckor 2-4 veckor',
      'Begränsad flexion först',
      'Progressiv belastning'
    ]
  },

  // Spine surgeries
  'discectomy': {
    phase1: 28,   // 4 weeks
    phase2: 56,   // 8 weeks total
    phase3: 120,  // 4 months total
    description: 'Diskektomi/diskbråcksoperation',
    precautions: [
      'Undvik framåtböjning första 6 veckor',
      'Ingen lyftning >5kg initialt',
      'Fokus på hållning och core'
    ]
  },
  'spinal_fusion': {
    phase1: 56,   // 8 weeks
    phase2: 112,  // 4 months total
    phase3: 180,  // 6 months total
    description: 'Spondylodes/steloperation',
    precautions: [
      'Ingen vridning/böjning',
      'Korsett enligt ordination',
      'Progressiv gång'
    ]
  },

  // Soft tissue injuries
  'muscle_strain_grade1': {
    phase1: 7,    // 1 week
    phase2: 14,   // 2 weeks total
    phase3: 28,   // 4 weeks total
    description: 'Grad 1 muskelbristning (liten)',
    precautions: ['Smärtfri progression', 'Undvik överbelastning']
  },
  'muscle_strain_grade2': {
    phase1: 14,   // 2 weeks
    phase2: 28,   // 4 weeks total
    phase3: 56,   // 8 weeks total
    description: 'Grad 2 muskelbristning (partiell)',
    precautions: ['Vila från smärtsamma aktiviteter', 'Gradvis belastning']
  },
  'muscle_strain_grade3': {
    phase1: 42,   // 6 weeks
    phase2: 84,   // 3 months total
    phase3: 180,  // 6 months total
    description: 'Grad 3 muskelbristning (total ruptur)',
    precautions: ['Möjlig kirurgi', 'Långsam progression', 'Ofta fysioterapi behövs']
  },
  'tendinopathy': {
    phase1: 7,    // 1 week isometrisk
    phase2: 42,   // 6 weeks isotonisk
    phase3: 84,   // 12 weeks total
    description: 'Tendinopati (sensmärta/degeneration)',
    precautions: [
      'Isometriska övningar först',
      'Progressiv belastning är nyckeln',
      'Undvik komplett vila'
    ]
  },
  'ligament_sprain_grade1': {
    phase1: 7,
    phase2: 14,
    phase3: 28,
    description: 'Grad 1 ligamentskada (stukning)',
    precautions: ['RICE/POLICE', 'Tidig mobilisering']
  },
  'ligament_sprain_grade2': {
    phase1: 21,
    phase2: 42,
    phase3: 84,
    description: 'Grad 2 ligamentskada (partiell ruptur)',
    precautions: ['Ortos/tape', 'Proprioceptiv träning']
  }
};

// ============================================
// NORMAL ROM VALUES BY AGE
// ============================================

export interface ROMNormalValue {
  '18-40': number;
  '41-60': number;
  '60+': number;
  description: string;
}

export const NORMAL_ROM: Record<string, Record<string, ROMNormalValue>> = {
  knee: {
    flexion: {
      '18-40': 140,
      '41-60': 135,
      '60+': 125,
      description: 'Knäflexion (böjning)'
    },
    extension: {
      '18-40': 0,
      '41-60': 0,
      '60+': -5,
      description: 'Knäextension (sträckning)'
    }
  },
  hip: {
    flexion: {
      '18-40': 120,
      '41-60': 115,
      '60+': 100,
      description: 'Höftflexion (böjning framåt)'
    },
    extension: {
      '18-40': 30,
      '41-60': 25,
      '60+': 15,
      description: 'Höftextension (sträckning bakåt)'
    },
    abduction: {
      '18-40': 45,
      '41-60': 40,
      '60+': 30,
      description: 'Höftabduktion (ut åt sidan)'
    },
    internalRotation: {
      '18-40': 40,
      '41-60': 35,
      '60+': 25,
      description: 'Höft inåtrotation'
    },
    externalRotation: {
      '18-40': 45,
      '41-60': 40,
      '60+': 30,
      description: 'Höft utåtrotation'
    }
  },
  shoulder: {
    flexion: {
      '18-40': 180,
      '41-60': 170,
      '60+': 160,
      description: 'Axelflexion (arm framåt/upp)'
    },
    abduction: {
      '18-40': 180,
      '41-60': 170,
      '60+': 150,
      description: 'Axelabduktion (arm åt sidan/upp)'
    },
    externalRotation: {
      '18-40': 90,
      '41-60': 80,
      '60+': 60,
      description: 'Axel utåtrotation'
    },
    internalRotation: {
      '18-40': 70,
      '41-60': 60,
      '60+': 45,
      description: 'Axel inåtrotation'
    }
  },
  spine: {
    cervicalFlexion: {
      '18-40': 60,
      '41-60': 50,
      '60+': 40,
      description: 'Nacke framåtböjning'
    },
    cervicalExtension: {
      '18-40': 75,
      '41-60': 65,
      '60+': 50,
      description: 'Nacke bakåtböjning'
    },
    cervicalRotation: {
      '18-40': 80,
      '41-60': 70,
      '60+': 55,
      description: 'Nacke rotation'
    },
    lumbarFlexion: {
      '18-40': 60,
      '41-60': 50,
      '60+': 40,
      description: 'Ländrygg framåtböjning'
    },
    lumbarExtension: {
      '18-40': 25,
      '41-60': 20,
      '60+': 15,
      description: 'Ländrygg bakåtböjning'
    }
  },
  ankle: {
    dorsiflexion: {
      '18-40': 20,
      '41-60': 15,
      '60+': 10,
      description: 'Fotled dorsalflexion (tå upp)'
    },
    plantarflexion: {
      '18-40': 50,
      '41-60': 45,
      '60+': 35,
      description: 'Fotled plantarflexion (tå ner)'
    }
  },
  elbow: {
    flexion: {
      '18-40': 145,
      '41-60': 140,
      '60+': 130,
      description: 'Armbåge flexion (böjning)'
    },
    extension: {
      '18-40': 0,
      '41-60': 0,
      '60+': -5,
      description: 'Armbåge extension (sträckning)'
    }
  }
};

// ============================================
// MOVEMENT IMPAIRMENT CLASSIFICATIONS
// ============================================

export interface MovementPattern {
  name: string;
  description: string;
  commonCauses: string[];
  keyFindings: string[];
  treatmentFocus: string[];
}

export const SAHRMANN_PATTERNS: Record<string, MovementPattern[]> = {
  lumbar: [
    {
      name: 'Lumbar Extension Syndrome',
      description: 'Symtom förvärras vid svankning/extension',
      commonCauses: ['Hyperlordos', 'Svag core', 'Strama höftflexorer'],
      keyFindings: ['Ökad lordos', 'Smärta vid stående', 'Svaghet i mage'],
      treatmentFocus: ['Posterior tilt-övningar', 'Core-stabilitet', 'Höftflexor-stretch']
    },
    {
      name: 'Lumbar Flexion Syndrome',
      description: 'Symtom förvärras vid framåtböjning',
      commonCauses: ['Långvarigt sittande', 'Diskproblematik', 'Svaga extensorer'],
      keyFindings: ['Platt ländrygg', 'Smärta vid sittande', 'Nervpåverkan'],
      treatmentFocus: ['Extensionsövningar', 'Ergonomi', 'Undvik flexion']
    },
    {
      name: 'Lumbar Rotation Syndrome',
      description: 'Asymmetrisk belastning/rotation',
      commonCauses: ['Ensidig sport', 'Asymmetriska vanor', 'SI-ledsproblematik'],
      keyFindings: ['Asymmetri i höfter', 'Unilateral smärta', 'Rotationssmärta'],
      treatmentFocus: ['Symmetrisk träning', 'Anti-rotationsövningar', 'Core-stabilitet']
    }
  ],
  hip: [
    {
      name: 'Femoral Anterior Glide Syndrome',
      description: 'Främre höftsmärta, ofta vid flexion',
      commonCauses: ['Stram posterior höftkapsel', 'Svaga höftflexorer', 'FAI'],
      keyFindings: ['Främre höftsmärta', 'Begränsad flexion', 'Clicking/pinching'],
      treatmentFocus: ['Posterior mobilisering', 'Höftflexor-stärkning', 'Undvik djup flexion initialt']
    },
    {
      name: 'Hip Adduction Syndrome',
      description: 'Överdriven adduktion vid gång/rörelse',
      commonCauses: ['Svaga abduktorer', 'IT-band stramhet', 'Gluteus medius svaghet'],
      keyFindings: ['Knäkollaps vid gång', 'Trendelenburg', 'Lateral höftsmärta'],
      treatmentFocus: ['Höftabduktor-stärkning', 'Balansträning', 'Gångkorrigering']
    }
  ],
  shoulder: [
    {
      name: 'Scapular Dyskinesis Type I',
      description: 'Inferior vinkel prominence',
      commonCauses: ['Serratus anterior svaghet', 'Pectoralis minor stramhet'],
      keyFindings: ['Medial border prominence', 'Svag serratus', 'Framåtrullad axel'],
      treatmentFocus: ['Serratus-aktivering', 'Postural korrigering', 'Pec minor stretch']
    },
    {
      name: 'Scapular Dyskinesis Type II',
      description: 'Medial border prominence',
      commonCauses: ['Rhomboideus svaghet', 'Levator scapulae stramhet'],
      keyFindings: ['Winging', 'Svag retraktion', 'Nacksmärta'],
      treatmentFocus: ['Retraktion', 'Rhomboideus-stärkning', 'Nackmobilitet']
    },
    {
      name: 'Scapular Dyskinesis Type III',
      description: 'Överdrivet lyft (superior migration)',
      commonCauses: ['Upper trap dominans', 'Lower trap svaghet', 'Impingement'],
      keyFindings: ['Axelrullning uppåt', 'Impingement-symtom', 'Nackspänning'],
      treatmentFocus: ['Lower trap-aktivering', 'Upper trap relaxation', 'Depression cues']
    }
  ]
};

// ============================================
// CLINICAL GUIDELINES REFERENCE
// ============================================

export interface ClinicalGuideline {
  condition: string;
  source: string;
  year: number;
  keyRecommendations: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

export const CLINICAL_GUIDELINES: ClinicalGuideline[] = [
  {
    condition: 'Ländryggssmärta (icke-specifik)',
    source: 'Socialstyrelsen / SBU',
    year: 2021,
    keyRecommendations: [
      'Undvik sängläge - fortsätt aktivitet',
      'Multimodal rehabilitering vid kronisk smärta',
      'Psykologiska faktorer ska adresseras',
      'Gradvis återgång till aktivitet'
    ],
    evidenceLevel: 'A'
  },
  {
    condition: 'Knäartros',
    source: 'OARSI / Socialstyrelsen',
    year: 2019,
    keyRecommendations: [
      'Fysisk träning är förstahandsval',
      'Viktminskning vid övervikt',
      'Patientutbildning',
      'Styrketräning + aerob träning'
    ],
    evidenceLevel: 'A'
  },
  {
    condition: 'Rotatorkufftendinopati',
    source: 'JOSPT Clinical Practice Guidelines',
    year: 2020,
    keyRecommendations: [
      'Progressiv belastning är central',
      'Kortisoninjektioner ger kortsiktig lindring',
      'Kirurgi inte bättre än träning',
      'Fokus på scapulär kontroll'
    ],
    evidenceLevel: 'A'
  },
  {
    condition: 'Lateral epicondylalgi (tennisarmbåge)',
    source: 'JOSPT Clinical Practice Guidelines',
    year: 2017,
    keyRecommendations: [
      'Excentrisk träning är effektivt',
      'Isometrisk träning för smärtlindring',
      'Undvik total avlastning',
      'Progressiv belastning över tid'
    ],
    evidenceLevel: 'A'
  },
  {
    condition: 'Patellofemoral smärta',
    source: 'BJSM Consensus Statement',
    year: 2018,
    keyRecommendations: [
      'Höft- och knästyrka central',
      'Kombination av övningar bäst',
      'Teipning kan ge kortsiktig effekt',
      'Gånganalys vid behov'
    ],
    evidenceLevel: 'B'
  },
  {
    condition: 'Akilles tendinopati',
    source: 'BJSM / ESSKA',
    year: 2020,
    keyRecommendations: [
      'Progressiv belastning (Alfredson/HSR)',
      'Undvik komplett vila',
      'Isometrisk för smärtlindring',
      'Långsiktig rehabilitering (3-6 månader)'
    ],
    evidenceLevel: 'A'
  },
  {
    condition: 'Whiplash Associated Disorder',
    source: 'Socialstyrelsen / Bone and Joint Decade',
    year: 2018,
    keyRecommendations: [
      'Tidig aktivitet gynnsamt',
      'Undvik halskrage',
      'Adressera psykosociala faktorer',
      'Multimodal behandling vid kroniska besvär'
    ],
    evidenceLevel: 'B'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get healing timeline for a specific surgery type
 */
export function getHealingTimeline(surgeryType: string): HealingTimeline | null {
  // Try direct match first (exact key)
  if (HEALING_TIMELINES[surgeryType]) {
    return HEALING_TIMELINES[surgeryType];
  }

  // Normalize the surgery type for lookup
  const normalized = surgeryType
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, '_');

  // Try case-insensitive match
  for (const [key, value] of Object.entries(HEALING_TIMELINES)) {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === normalized) {
      return value;
    }
  }

  // Try partial match
  for (const [key, value] of Object.entries(HEALING_TIMELINES)) {
    const normalizedKey = key.toLowerCase();
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * Get age-adjusted normal ROM for a joint
 */
export function getNormalROM(
  joint: string,
  movement: string,
  age: number
): number | null {
  const jointData = NORMAL_ROM[joint.toLowerCase()];
  if (!jointData) return null;

  const movementData = jointData[movement];
  if (!movementData) return null;

  if (age <= 40) return movementData['18-40'];
  if (age <= 60) return movementData['41-60'];
  return movementData['60+'];
}

/**
 * Calculate ROM deficit percentage
 */
export function calculateROMDeficit(
  measured: number,
  normal: number
): { deficit: number; percentDeficit: number; severity: 'normal' | 'mild' | 'moderate' | 'severe' } {
  const percentDeficit = ((normal - measured) / normal) * 100;
  const deficit = Math.max(0, percentDeficit);

  let severity: 'normal' | 'mild' | 'moderate' | 'severe';
  if (deficit <= 10) severity = 'normal';
  else if (deficit <= 25) severity = 'mild';
  else if (deficit <= 50) severity = 'moderate';
  else severity = 'severe';

  return { deficit, percentDeficit: deficit, severity };
}

/**
 * Get current rehabilitation phase based on days since surgery
 */
export function getCurrentPhase(
  surgeryType: string,
  daysSinceSurgery: number
): { phase: 1 | 2 | 3; description: string; daysRemaining: number } {
  const timeline = getHealingTimeline(surgeryType);

  if (!timeline) {
    // Default timeline for unknown surgeries
    if (daysSinceSurgery < 42) return { phase: 1, description: 'Skyddsfas', daysRemaining: 42 - daysSinceSurgery };
    if (daysSinceSurgery < 84) return { phase: 2, description: 'Uppbyggnadsfas', daysRemaining: 84 - daysSinceSurgery };
    return { phase: 3, description: 'Återgångsfas', daysRemaining: 0 };
  }

  if (daysSinceSurgery < timeline.phase1) {
    return { phase: 1, description: 'Skyddsfas', daysRemaining: timeline.phase1 - daysSinceSurgery };
  }
  if (daysSinceSurgery < timeline.phase2) {
    return { phase: 2, description: 'Uppbyggnadsfas', daysRemaining: timeline.phase2 - daysSinceSurgery };
  }
  return { phase: 3, description: 'Återgångsfas', daysRemaining: Math.max(0, timeline.phase3 - daysSinceSurgery) };
}

/**
 * Get clinical guideline for a condition
 */
export function getGuidelineForCondition(condition: string): ClinicalGuideline | null {
  const normalized = condition.toLowerCase();

  for (const guideline of CLINICAL_GUIDELINES) {
    if (
      guideline.condition.toLowerCase().includes(normalized) ||
      normalized.includes(guideline.condition.toLowerCase().split(' ')[0])
    ) {
      return guideline;
    }
  }

  return null;
}

/**
 * Build AI context with clinical knowledge
 */
export function buildClinicalContext(
  surgeryType?: string,
  daysSinceSurgery?: number,
  age?: number,
  condition?: string
): string {
  const parts: string[] = [];

  // Add healing timeline if post-op
  if (surgeryType && daysSinceSurgery !== undefined) {
    const timeline = getHealingTimeline(surgeryType);
    const phase = getCurrentPhase(surgeryType, daysSinceSurgery);

    if (timeline) {
      parts.push(`LÄKNINGSTID FÖR ${surgeryType.toUpperCase()}:`);
      parts.push(`- Fas 1 (Skydd): ${timeline.phase1} dagar`);
      parts.push(`- Fas 2 (Uppbyggnad): ${timeline.phase2} dagar totalt`);
      parts.push(`- Fas 3 (Återgång): ${timeline.phase3} dagar totalt`);
      parts.push(`- Patient är dag ${daysSinceSurgery} = ${phase.description}`);
      parts.push(`- Försiktighetsåtgärder: ${timeline.precautions.join(', ')}`);
      parts.push('');
    }
  }

  // Add age-specific ROM norms
  if (age) {
    const ageGroup = age <= 40 ? '18-40' : age <= 60 ? '41-60' : '60+';
    parts.push(`ÅLDERSJUSTERADE ROM-NORMER (åldersgrupp ${ageGroup}):`);
    parts.push(`- Knäflexion: ${NORMAL_ROM.knee.flexion[ageGroup]}°`);
    parts.push(`- Höftflexion: ${NORMAL_ROM.hip.flexion[ageGroup]}°`);
    parts.push(`- Axelflexion: ${NORMAL_ROM.shoulder.flexion[ageGroup]}°`);
    parts.push('');
  }

  // Add clinical guideline if available
  if (condition) {
    const guideline = getGuidelineForCondition(condition);
    if (guideline) {
      parts.push(`KLINISKA RIKTLINJER (${guideline.source}, ${guideline.year}):`);
      guideline.keyRecommendations.forEach(rec => {
        parts.push(`- ${rec}`);
      });
      parts.push(`- Evidensnivå: ${guideline.evidenceLevel}`);
      parts.push('');
    }
  }

  return parts.join('\n');
}
