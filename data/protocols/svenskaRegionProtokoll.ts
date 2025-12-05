/**
 * SVENSKA REGIONALA PROTOKOLL
 *
 * Rehabiliteringsprotokoll baserade på svenska regionala riktlinjer:
 * - Region Kalmar (knä, artros)
 * - FYSS (Fysisk aktivitet vid sjukdom)
 * - Läkarhuset (patellofemoral smärta)
 *
 * Källor:
 * - Region Kalmar Vårdgivare
 * - FYSS - Yrkesföreningar för Fysisk Aktivitet
 * - Läkarhuset Specialistvård
 */

import { BodyArea, ExerciseType } from '../../types';
import { PostOpProtocol, PhaseRestriction } from './postOpProtocols';

// ============================================
// KNÄ-PROTOKOLL - REGION KALMAR
// ============================================

/**
 * Meniskskada - Konservativ behandling
 * Källa: Region Kalmar
 */
export const KALMAR_MENISK_KONSERVATIV: PostOpProtocol = {
  id: 'kalmar_menisk_konservativ',
  name: 'Meniskskada - Konservativ behandling (Region Kalmar)',
  englishName: 'Meniscal Injury - Conservative Treatment',
  bodyArea: 'knä',
  description: 'Konservativ behandling av meniskskada enligt Region Kalmars riktlinjer. Fokus på smärtkontroll, styrka och stabilitet.',

  phases: {
    1: {
      weeks: '0-2',
      daysStart: 0,
      daysEnd: 14,
      restrictions: [
        'undvik_djup_böjning',
        'undvik_vridning'
      ],
      allowedMovements: [
        'full_extension',
        'isometrisk_quadriceps',
        'straight_leg_raise',
        'ROM_inom_smärtgräns'
      ],
      forbiddenMovements: [
        'djup_knäböjning',
        'pivot_rörelser',
        'hopp'
      ],
      goals: [
        'Smärtkontroll',
        'Minska svullnad',
        'Aktivera quadriceps',
        'Full extension'
      ],
      precautions: [
        'Använd kryckor vid behov',
        'Kompression och högläge',
        'Kyla efter aktivitet'
      ]
    },
    2: {
      weeks: '2-6',
      daysStart: 15,
      daysEnd: 42,
      restrictions: [
        'gradvis_ökad_belastning'
      ],
      allowedMovements: [
        'cykling',
        'simning',
        'styrketräning_maskiner',
        'proprioception'
      ],
      forbiddenMovements: [
        'löpning',
        'hopp',
        'djup_squat'
      ],
      goals: [
        'Bygga styrka',
        'Förbättra proprioception',
        'Öka aktivitetsnivå'
      ],
      precautions: [
        'Smärtfri progression',
        'Undvik svullnad'
      ]
    },
    3: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [],
      allowedMovements: [
        'löpning_gradvis',
        'sportspecifik_träning',
        'full_styrketräning'
      ],
      forbiddenMovements: [],
      goals: [
        'Full funktion',
        'Återgång till aktivitet',
        'Förebyggande program'
      ],
      precautions: [
        'Gradvis återgång till sport'
      ]
    }
  },

  absoluteContraindications: [
    'Djup böjning under smärta',
    'Vridningsrörelser med belastning'
  ],
  relativeContraindications: [
    'Löpning på hårt underlag'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'löpning'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['djup squat', 'pistol squat'],
  weightBearingProgression: {
    phase1: 'Partiell',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Låsningar i knäet',
    'Svullnad som inte minskar',
    'Instabilitetskänsla'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_010']
};

/**
 * Patellofemoralt smärtsyndrom
 * Källa: Läkarhuset
 */
export const LAKARHUSET_PFPS: PostOpProtocol = {
  id: 'lakarhuset_pfps',
  name: 'Patellofemoralt smärtsyndrom - Rehabilitering (Läkarhuset)',
  englishName: 'Patellofemoral Pain Syndrome',
  bodyArea: 'knä',
  description: 'Rehabiliteringsprogram vid främre knäsmärta (PFPS) enligt Läkarhusets riktlinjer. Fokus på VMO-aktivering, höft- och bålstyrka.',

  phases: {
    1: {
      weeks: '0-4',
      daysStart: 0,
      daysEnd: 28,
      restrictions: [
        'undvik_djup_knäböjning',
        'undvik_trappgång'
      ],
      allowedMovements: [
        'SLR_alla_riktningar',
        'isometrisk_quadriceps',
        'höftabduktion_sidoliggande',
        'bäckenlyft'
      ],
      forbiddenMovements: [
        'djup_squat',
        'utfall',
        'löpning'
      ],
      goals: [
        'Smärtreduktion',
        'VMO-aktivering',
        'Höftstyrka',
        'Bålstabilitet'
      ],
      precautions: [
        'Undvik smärta vid övningar',
        'Tejpning kan hjälpa',
        'Korrigera biomekanik'
      ]
    },
    2: {
      weeks: '4-8',
      daysStart: 29,
      daysEnd: 56,
      restrictions: [
        'kontrollerad_knäböjning'
      ],
      allowedMovements: [
        'mini_squat',
        'step_ups_låg_höjd',
        'cykling',
        'balansträning'
      ],
      forbiddenMovements: [
        'djup_knäböjning',
        'hopp'
      ],
      goals: [
        'Ökad styrka',
        'Funktionella övningar',
        'Förbättrad biomekanik'
      ],
      precautions: [
        'Gradvis ökad knävinkel'
      ]
    },
    3: {
      weeks: '8-12',
      daysStart: 57,
      daysEnd: 84,
      restrictions: [],
      allowedMovements: [
        'full_squat',
        'löpning',
        'sportspecifik_träning'
      ],
      forbiddenMovements: [],
      goals: [
        'Full funktion',
        'Smärtfri aktivitet',
        'Förebyggande program'
      ],
      precautions: [
        'Fortsätt med styrketräning'
      ]
    }
  },

  absoluteContraindications: [
    'Övningar som provocerar smärta'
  ],
  relativeContraindications: [
    'Djup knäböjning tidigt i rehabiliteringen'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'löpning'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['leg extension', 'djup squat'],
  weightBearingProgression: {
    phase1: 'Fullt',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Svullnad',
    'Låsningar',
    'Instabilitet'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_012']
};

/**
 * Knäkontroll/reaktionsträning
 * Källa: Region Kalmar
 */
export const KALMAR_KNAKONTROLL: PostOpProtocol = {
  id: 'kalmar_knakontroll',
  name: 'Knäkontroll - Reaktionsträning (Region Kalmar)',
  englishName: 'Knee Control - Reactive Training',
  bodyArea: 'knä',
  description: 'Träningsprogram för knäkontroll och reaktionsförmåga. Fokus på fotisättning, knäkontroll vid frånskjut/inbromsning och snedbelastningar.',

  phases: {
    1: {
      weeks: '0-4',
      daysStart: 0,
      daysEnd: 28,
      restrictions: [
        'kontrollerad_rörelse'
      ],
      allowedMovements: [
        'stående_balans',
        'enbensstående',
        'mini_squat_kontrollerat',
        'step_down_kontrollerat'
      ],
      forbiddenMovements: [
        'explosiva_hopp',
        'snabba_riktningsändringar'
      ],
      goals: [
        'Grundläggande knäkontroll',
        'Balans och proprioception',
        'Korrekt fotisättning'
      ],
      precautions: [
        'Fokus på teknik före hastighet'
      ]
    },
    2: {
      weeks: '4-8',
      daysStart: 29,
      daysEnd: 56,
      restrictions: [
        'gradvis_ökad_hastighet'
      ],
      allowedMovements: [
        'hopp_landning_kontrollerad',
        'sidosteg',
        'riktningsändringar_kontrollerade',
        'acceleration_deceleration'
      ],
      forbiddenMovements: [
        'maximal_explosivitet'
      ],
      goals: [
        'Dynamisk stabilitet',
        'Reaktionsförmåga',
        'Inbromsningskontroll'
      ],
      precautions: [
        'Gradvis ökad komplexitet'
      ]
    },
    3: {
      weeks: '8+',
      daysStart: 57,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'plyometri',
        'sportspecifika_rörelser',
        'reaktiv_träning'
      ],
      forbiddenMovements: [],
      goals: [
        'Full reaktionsförmåga',
        'Sportspecifik prestanda',
        'Skadeförebyggande'
      ],
      precautions: [
        'Fortsätt med underhållsprogram'
      ]
    }
  },

  absoluteContraindications: [
    'Övningar med smärta eller svullnad'
  ],
  relativeContraindications: [
    'Maximal plyometri före god grundkontroll'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri'] as ExerciseType[],
    phase2: [] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: [],
  weightBearingProgression: {
    phase1: 'Fullt',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Smärta vid landning',
    'Instabilitetskänsla',
    'Svullnad efter träning'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_011']
};

// ============================================
// FYSS ARTROS-PROTOKOLL
// ============================================

/**
 * Artros höft/knä - FYSS riktlinjer
 * Källa: FYSS - Fysisk aktivitet vid sjukdom
 */
export const FYSS_ARTROS: PostOpProtocol = {
  id: 'fyss_artros',
  name: 'Artros höft/knä - FYSS riktlinjer',
  englishName: 'Osteoarthritis - FYSS Guidelines',
  bodyArea: 'höft', // Gäller även knä
  description: 'Evidensbaserade riktlinjer för fysisk aktivitet vid artros i höft och knä enligt FYSS. Grundbehandling ska bestå av patientutbildning, fysisk träning och (vid behov) viktnedgång.',

  phases: {
    1: {
      weeks: '0-4 (Startfas)',
      daysStart: 0,
      daysEnd: 28,
      restrictions: [
        'låg_initial_intensitet',
        'smärtfri_träning'
      ],
      allowedMovements: [
        'vattengymnastik',
        'cykling',
        'promenad',
        'lätt_styrketräning'
      ],
      forbiddenMovements: [
        'hög_intensitet',
        'stötbelastning'
      ],
      goals: [
        'Etablera träningsrutin',
        'Smärthantering',
        'Rörelseförmåga'
      ],
      precautions: [
        'Börja försiktigt',
        'Anpassa efter smärta',
        '24-timmarsregeln för smärta'
      ]
    },
    2: {
      weeks: '4-12 (Uppbyggnadsfas)',
      daysStart: 29,
      daysEnd: 84,
      restrictions: [
        'gradvis_progression'
      ],
      allowedMovements: [
        'styrketräning_2-3ggr_vecka',
        'konditionsträning_150min_vecka',
        'rörlighetsträning',
        'balansträning'
      ],
      forbiddenMovements: [
        'maximal_belastning'
      ],
      goals: [
        'Öka styrka',
        'Förbättra kondition',
        'Funktionell förmåga'
      ],
      precautions: [
        'Öka volym före intensitet',
        'Lyssna på kroppen'
      ]
    },
    3: {
      weeks: '12+ (Underhållsfas)',
      daysStart: 85,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'valfri_träningsform',
        'funktionella_aktiviteter',
        'gruppträning'
      ],
      forbiddenMovements: [],
      goals: [
        'Bibehålla funktion',
        'Livslång fysisk aktivitet',
        'Självständighet'
      ],
      precautions: [
        'Fortsätt regelbunden träning'
      ]
    }
  },

  absoluteContraindications: [
    'Träning under aktiv inflammation (svullen, röd, varm led)'
  ],
  relativeContraindications: [
    'Hög stötbelastning'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'högintensiv_kondition'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['hopp', 'löpning'],
  weightBearingProgression: {
    phase1: 'Fullt',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Kraftigt ökad smärta efter träning (>24h)',
    'Svullnad som inte går ner',
    'Låsningar eller ge-vika-episoder'
  ],
  expectedRecoveryWeeks: 52, // Livslång behandling
  sources: ['swe_020', 'swe_030', 'swe_031']
};

/**
 * Region Kalmar artrosrutin
 */
export const KALMAR_ARTROS: PostOpProtocol = {
  id: 'kalmar_artros',
  name: 'Artros - Region Kalmars artrosrutin',
  englishName: 'Osteoarthritis - Region Kalmar Routine',
  bodyArea: 'knä', // Gäller höft, knä, hand
  description: 'Strukturerad artrosvård enligt Region Kalmars rutin. Fokus på patientutbildning, individualiserad träning och uppföljning.',

  phases: {
    1: {
      weeks: '0-6 (Grundbehandling)',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'anpassad_intensitet'
      ],
      allowedMovements: [
        'artrosskola_genomgång',
        'individualiserad_träning',
        'hemövningar_dagligen',
        'konditionsträning'
      ],
      forbiddenMovements: [
        'smärtprovocerande_övningar'
      ],
      goals: [
        'Förstå artros',
        'Etablera träningsrutin',
        'Smärtkontroll'
      ],
      precautions: [
        'Artrosskola rekommenderas',
        'Individuell anpassning'
      ]
    },
    2: {
      weeks: '6-12 (Uppföljning)',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [],
      allowedMovements: [
        'progressiv_styrketräning',
        'funktionella_övningar',
        'gruppträning'
      ],
      forbiddenMovements: [],
      goals: [
        'Utvärdera effekt',
        'Justera program',
        'Öka självständighet'
      ],
      precautions: [
        'Uppföljning hos fysioterapeut'
      ]
    },
    3: {
      weeks: '12+ (Egenvård)',
      daysStart: 85,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'självständig_träning',
        'fysisk_aktivitet_på_recept'
      ],
      forbiddenMovements: [],
      goals: [
        'Bibehålla funktion',
        'Förebygga försämring'
      ],
      precautions: [
        'Årlig uppföljning vid behov'
      ]
    }
  },

  absoluteContraindications: [
    'Träning under akut inflammation'
  ],
  relativeContraindications: [
    'Hög stötbelastning vid avancerad artros'
  ],
  forbiddenExerciseTypes: {
    phase1: [] as ExerciseType[],
    phase2: [] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: [],
  weightBearingProgression: {
    phase1: 'Fullt',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Kraftig försämring',
    'Nattvärk',
    'Vilovärk'
  ],
  expectedRecoveryWeeks: 52,
  sources: ['swe_030']
};

// ============================================
// RYGG-PROTOKOLL
// ============================================

/**
 * Ländryggssmärta - LiU träningsprogram
 */
export const LIU_RYGG: PostOpProtocol = {
  id: 'liu_rygg',
  name: 'Ländryggssmärta - Linköpings universitet',
  englishName: 'Low Back Pain - LiU Program',
  bodyArea: 'ländrygg',
  description: 'Träningsprogram vid ryggbesvär utvecklat av Linköpings universitet. Fokus på bålstabilitet, rörlighet och graderad aktivitet.',

  phases: {
    1: {
      weeks: '0-4',
      daysStart: 0,
      daysEnd: 28,
      restrictions: [
        'undvik_provokation'
      ],
      allowedMovements: [
        'bäckentippning',
        'cat_cow',
        'knä_till_bröstet',
        'sidorotation_liggande'
      ],
      forbiddenMovements: [
        'tunga_lyft',
        'långvarigt_sittande'
      ],
      goals: [
        'Smärtkontroll',
        'Rörlighet',
        'Grundläggande stabilitet'
      ],
      precautions: [
        'Rörelse är medicin',
        'Undvik total vila'
      ]
    },
    2: {
      weeks: '4-8',
      daysStart: 29,
      daysEnd: 56,
      restrictions: [
        'gradvis_ökad_belastning'
      ],
      allowedMovements: [
        'planka',
        'bäckenlyft',
        'bird_dog',
        'promenad'
      ],
      forbiddenMovements: [
        'explosiva_lyft'
      ],
      goals: [
        'Bålstyrka',
        'Kondition',
        'Funktion'
      ],
      precautions: [
        'Teknik före belastning'
      ]
    },
    3: {
      weeks: '8+',
      daysStart: 57,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'full_träning',
        'funktionella_lyft',
        'sport'
      ],
      forbiddenMovements: [],
      goals: [
        'Full funktion',
        'Förebyggande',
        'Livslång aktivitet'
      ],
      precautions: [
        'Fortsätt med underhållsträning'
      ]
    }
  },

  absoluteContraindications: [
    'Röda flaggor (se nedan)'
  ],
  relativeContraindications: [
    'Stark smärta vid rörelse'
  ],
  forbiddenExerciseTypes: {
    phase1: [] as ExerciseType[],
    phase2: [] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: [],
  weightBearingProgression: {
    phase1: 'Fullt',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: false,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Cauda equina-syndrom',
    'Neurologiska bortfall',
    'Oförklarlig viktnedgång',
    'Feber',
    'Trauma'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_040']
};

// ============================================
// EXPORTERA ALLA PROTOKOLL
// ============================================

export const SVENSKA_REGION_PROTOKOLL = {
  // Knä
  KALMAR_MENISK_KONSERVATIV,
  LAKARHUSET_PFPS,
  KALMAR_KNAKONTROLL,

  // Artros
  FYSS_ARTROS,
  KALMAR_ARTROS,

  // Rygg
  LIU_RYGG
};

export const ALLA_SVENSKA_PROTOKOLL: PostOpProtocol[] = [
  KALMAR_MENISK_KONSERVATIV,
  LAKARHUSET_PFPS,
  KALMAR_KNAKONTROLL,
  FYSS_ARTROS,
  KALMAR_ARTROS,
  LIU_RYGG
];

// ============================================
// HJÄLPFUNKTIONER
// ============================================

/**
 * Hämta protokoll baserat på kroppsområde
 */
export function getSvensktProtokollByBodyArea(bodyArea: BodyArea): PostOpProtocol[] {
  return ALLA_SVENSKA_PROTOKOLL.filter(p => p.bodyArea === bodyArea);
}

/**
 * Hämta artrosprotokoll
 */
export function getArtrosProtokoll(): PostOpProtocol[] {
  return [FYSS_ARTROS, KALMAR_ARTROS];
}

/**
 * Hämta knäprotokoll
 */
export function getKnaProtokoll(): PostOpProtocol[] {
  return [KALMAR_MENISK_KONSERVATIV, LAKARHUSET_PFPS, KALMAR_KNAKONTROLL];
}

export default ALLA_SVENSKA_PROTOKOLL;
