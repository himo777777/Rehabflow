/**
 * AXELINA REHABILITERINGSPROTOKOLL
 *
 * Baserat på Axelina-konceptet - Sveriges ledande axelrehabiliteringsprogram.
 * Utvecklat i Uppsala 1990, används nu i 20 svenska regioner och på Åland.
 *
 * Kvalitetspris 2002 från Region Jönköping
 * Nominerat till Guldskalpellen 2015
 *
 * Källa: https://axelina.com/concept
 * PDF: Region Dalarna, Region Kalmar, Region Jönköping
 */

import { BodyArea, ExerciseType } from '../../types';
import { PostOpProtocol, PhaseRestriction } from './postOpProtocols';

// ============================================
// AXELINA-SPECIFIKA INTERFACES
// ============================================

export interface AxelinaProtocol extends PostOpProtocol {
  axelinaCategory: 'icke_operativ' | 'operativ';
  axelinaLevel: 1 | 2 | 3;  // Svårighetsgrad på hemövningar
  homeExercisesPerDay: number;
  checkupIntervalWeeks: number;
}

// ============================================
// ROTATORKUFFSKADA - ICKE-OPERATIV
// ============================================

export const AXELINA_ROTATORKUFF_KONSERVATIV: AxelinaProtocol = {
  id: 'axelina_rotatorkuff_konservativ',
  name: 'Rotatorkuffskada - Konservativ behandling (Axelina)',
  englishName: 'Rotator Cuff Injury - Conservative Treatment',
  bodyArea: 'axel',
  description: 'Icke-operativ behandling av rotatorkuffskada enligt Axelina-konceptet. Fokus på smärtkontroll, gradvis rörelseträning och styrkeuppbyggnad.',
  axelinaCategory: 'icke_operativ',
  axelinaLevel: 1,
  homeExercisesPerDay: 3,
  checkupIntervalWeeks: 2,

  phases: {
    1: {
      weeks: '0-3',
      daysStart: 0,
      daysEnd: 21,
      restrictions: [
        'ingen_smärta_vid_rörelse',
        'undvik_tunga_lyft'
      ],
      allowedMovements: [
        'pendelrörelser',
        'passiv_elevation',
        'isometrisk_extern_rotation',
        'skapulastabilisering'
      ],
      forbiddenMovements: [
        'lyft_över_axelhöjd_med_belastning',
        'explosiva_rörelser'
      ],
      goals: [
        'Smärtlindring',
        'Minska inflammation',
        'Bibehålla rörlighet'
      ],
      precautions: [
        'Vila vid smärta',
        'Använd kyla efter aktivitet',
        'Anpassa dagliga aktiviteter'
      ]
    },
    2: {
      weeks: '3-8',
      daysStart: 22,
      daysEnd: 56,
      restrictions: [
        'gradvis_ökad_belastning',
        'smärtfri_träning'
      ],
      allowedMovements: [
        'aktiv_assisterad_elevation',
        'extern_rotation_med_band',
        'intern_rotation',
        'scaption'
      ],
      forbiddenMovements: [
        'maximal_belastning',
        'snabba_kast'
      ],
      goals: [
        'Full smärtfri rörlighet',
        'Börja styrketräning',
        'Förbättra skapulakontroll'
      ],
      precautions: [
        'Undvik smärta vid rörelse',
        'Öka belastning gradvis'
      ]
    },
    3: {
      weeks: '8-12+',
      daysStart: 57,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'full_styrketräning',
        'funktionella_övningar',
        'sportspecifik_träning'
      ],
      forbiddenMovements: [],
      goals: [
        'Full styrka',
        'Återgång till aktivitet',
        'Förebyggande träning'
      ],
      precautions: [
        'Fortsätt med underhållsträning'
      ]
    }
  },

  absoluteContraindications: [
    'Kraftig smärta som förvärras vid rörelse',
    'Akut inflammation med svullnad och rodnad'
  ],
  relativeContraindications: [
    'Nattvärk som stör sömnen'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'tung_styrka'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['overhead press', 'military press'],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Ökande smärta trots vila',
    'Kraftförlust i armen',
    'Domningar eller stickningar'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_001', 'swe_003']
};

// ============================================
// ROTATORKUFFSUTUR - POSTOPERATIV
// ============================================

export const AXELINA_ROTATORKUFF_POSTOP: AxelinaProtocol = {
  id: 'axelina_rotatorkuff_postop',
  name: 'Rotatorkuffsutur - Postoperativ rehabilitering (Axelina)',
  englishName: 'Rotator Cuff Repair - Post-Operative',
  bodyArea: 'axel',
  description: 'Postoperativ rehabilitering efter rotatorkuffsutur enligt Axelina-protokollet. Baserat på Region Kalmar och Region Dalarnas riktlinjer.',
  axelinaCategory: 'operativ',
  axelinaLevel: 2,
  homeExercisesPerDay: 4,
  checkupIntervalWeeks: 2,

  phases: {
    1: {
      weeks: '0-6',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'ingen_aktiv_elevation',
        'mitella_dygnet_runt',
        'ingen_belastning'
      ],
      allowedMovements: [
        'pendelrörelser_försiktigt',
        'passiv_elevation_till_90',
        'fingerrörelser',
        'armbågsrörelser',
        'handledscirklar'
      ],
      forbiddenMovements: [
        'aktiv_elevation',
        'rotation_mot_motstånd',
        'lyft_av_något_slag'
      ],
      goals: [
        'Skydda suturen',
        'Smärtkontroll',
        'Minska svullnad',
        'Passiv rörlighet'
      ],
      precautions: [
        'Bär mitella enligt ordination',
        'Sov på rygg eller frisk sida',
        'Ingen tyngd i handen'
      ]
    },
    2: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'ingen_tung_belastning',
        'gradvis_ökning_av_aktiv_rörelse'
      ],
      allowedMovements: [
        'aktiv_assisterad_elevation',
        'passiv_extern_rotation',
        'isometrisk_stabilisering',
        'skapulaövningar'
      ],
      forbiddenMovements: [
        'tung_styrketräning',
        'explosiva_rörelser'
      ],
      goals: [
        'Återfå aktiv rörlighet',
        'Starta lätt styrketräning',
        'Skapulakontroll'
      ],
      precautions: [
        'Öka gradvis',
        'Undvik smärta vid träning'
      ]
    },
    3: {
      weeks: '12-24',
      daysStart: 85,
      daysEnd: 168,
      restrictions: [
        'anpassad_belastning'
      ],
      allowedMovements: [
        'full_aktiv_rörelse',
        'progressiv_styrketräning',
        'funktionella_övningar'
      ],
      forbiddenMovements: [
        'maximal_belastning_före_16v'
      ],
      goals: [
        'Full rörlighet',
        'Återfå styrka',
        'Funktionell träning'
      ],
      precautions: [
        'Fortsätt gradvis progression'
      ]
    },
    4: {
      weeks: '24+',
      daysStart: 169,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'full_aktivitet',
        'sport'
      ],
      forbiddenMovements: [],
      goals: [
        'Återgång till full aktivitet',
        'Underhållsträning'
      ],
      precautions: [
        'Fortsätt med förebyggande träning'
      ]
    }
  },

  absoluteContraindications: [
    'Aktiv belastning första 6 veckorna',
    'Extern rotation mot motstånd första 12 veckorna'
  ],
  relativeContraindications: [
    'Kraftig smärta vid passiv rörelse'
  ],
  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri', 'excentrisk'] as ExerciseType[],
    phase2: ['plyometri', 'excentrisk'] as ExerciseType[],
    phase3: ['plyometri']
  },
  excludeKeywords: ['overhead', 'pullup', 'dips', 'push-up'],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: false
  },
  redFlags: [
    'Plötslig ökad smärta',
    'Svullnad och rodnad',
    'Feber',
    'Kraftförlust efter initial förbättring'
  ],
  expectedRecoveryWeeks: 24,
  sources: ['swe_001', 'swe_002', 'swe_003']
};

// ============================================
// AXELINSTABILITET
// ============================================

export const AXELINA_INSTABILITET: AxelinaProtocol = {
  id: 'axelina_instabilitet',
  name: 'Axelinstabilitet - Rehabilitering (Axelina)',
  englishName: 'Shoulder Instability Rehabilitation',
  bodyArea: 'axel',
  description: 'Rehabilitering vid axelinstabilitet (luxation/subluxation) enligt Axelina. Fokus på skapulastabilitet och gradvis återgång till aktivitet.',
  axelinaCategory: 'icke_operativ',
  axelinaLevel: 2,
  homeExercisesPerDay: 5,
  checkupIntervalWeeks: 2,

  phases: {
    1: {
      weeks: '0-3',
      daysStart: 0,
      daysEnd: 21,
      restrictions: [
        'mitella',
        'ingen_abduktion_extern_rotation'
      ],
      allowedMovements: [
        'pendelrörelser',
        'isometrisk_stabilisering',
        'skapulaövningar'
      ],
      forbiddenMovements: [
        'abduktion_extern_rotation_kombination',
        'kraftfulla_rörelser'
      ],
      goals: [
        'Smärtkontroll',
        'Skydda leden',
        'Bibehålla styrka'
      ],
      precautions: [
        'Undvik apprehension-position',
        'Använd mitella vid behov'
      ]
    },
    2: {
      weeks: '3-8',
      daysStart: 22,
      daysEnd: 56,
      restrictions: [
        'kontrollerad_rörelse'
      ],
      allowedMovements: [
        'aktiv_rörelseträning',
        'styrketräning_rotatorkuff',
        'skapulastabilisering'
      ],
      forbiddenMovements: [
        'maximal_extern_rotation',
        'explosiva_kast'
      ],
      goals: [
        'Full rörlighet',
        'Stärka stabiliserande muskulatur',
        'Proprioception'
      ],
      precautions: [
        'Undvik smärtsamma positioner'
      ]
    },
    3: {
      weeks: '8-16',
      daysStart: 57,
      daysEnd: 112,
      restrictions: [],
      allowedMovements: [
        'progressiv_styrketräning',
        'sportspecifika_övningar',
        'plyometri_kontrollerad'
      ],
      forbiddenMovements: [],
      goals: [
        'Full styrka',
        'Återgång till aktivitet',
        'Förebyggande program'
      ],
      precautions: [
        'Gradvis återgång till sport'
      ]
    }
  },

  absoluteContraindications: [
    'Abduktion + extern rotation första 3 veckorna'
  ],
  relativeContraindications: [
    'Smärta vid rörelse'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'stärkning'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['throwing', 'bench press'],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Upprepade subluxationer',
    'Känsla av instabilitet vid vardagsaktiviteter'
  ],
  expectedRecoveryWeeks: 16,
  sources: ['swe_001', 'swe_013']
};

// ============================================
// IMPINGEMENT SYNDROM
// ============================================

export const AXELINA_IMPINGEMENT: AxelinaProtocol = {
  id: 'axelina_impingement',
  name: 'Subakromiellt impingement - Rehabilitering (Axelina)',
  englishName: 'Subacromial Impingement Rehabilitation',
  bodyArea: 'axel',
  description: 'Rehabilitering vid subakromiellt impingement/inklämning enligt Axelina-konceptet. Fokus på hållningskorrigering, skapulastabilitet och smärtfri rörelse.',
  axelinaCategory: 'icke_operativ',
  axelinaLevel: 1,
  homeExercisesPerDay: 4,
  checkupIntervalWeeks: 3,

  phases: {
    1: {
      weeks: '0-4',
      daysStart: 0,
      daysEnd: 28,
      restrictions: [
        'undvik_smärtsamma_rörelser',
        'ingen_overhead_aktivitet'
      ],
      allowedMovements: [
        'hållningsträning',
        'skapulaövningar',
        'stretching_bröstmuskulatur',
        'extern_rotation_vid_sidan'
      ],
      forbiddenMovements: [
        'upright_rows',
        'overhead_press',
        'smärtsamma_rörelser'
      ],
      goals: [
        'Minska smärta',
        'Förbättra hållning',
        'Öka skapulakontroll'
      ],
      precautions: [
        'Undvik smärtprovokation',
        'Korrigera arbetsställning'
      ]
    },
    2: {
      weeks: '4-8',
      daysStart: 29,
      daysEnd: 56,
      restrictions: [
        'gradvis_ökad_aktivitet'
      ],
      allowedMovements: [
        'extern_rotation_med_motstånd',
        'scaption',
        'rotatorkuff_stärkning',
        'koncentrisk_excentrisk_träning'
      ],
      forbiddenMovements: [
        'maximal_belastning_overhead'
      ],
      goals: [
        'Smärtfri rörelse',
        'Stärka rotatorkuffen',
        'Förbättra biomekanik'
      ],
      precautions: [
        'Smärtfri progression'
      ]
    },
    3: {
      weeks: '8-12',
      daysStart: 57,
      daysEnd: 84,
      restrictions: [],
      allowedMovements: [
        'full_styrketräning',
        'funktionella_övningar',
        'gradvis_overhead_aktivitet'
      ],
      forbiddenMovements: [],
      goals: [
        'Full funktion',
        'Förebyggande program',
        'Återgång till aktivitet'
      ],
      precautions: [
        'Fortsätt med underhållsprogram'
      ]
    }
  },

  absoluteContraindications: [
    'Smärtprovocerande rörelser'
  ],
  relativeContraindications: [
    'Overhead-aktiviteter med tungt motstånd'
  ],
  forbiddenExerciseTypes: {
    phase1: ['plyometri'] as ExerciseType[],
    phase2: [] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['upright row', 'lateral raise'],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: false,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Ökande nattvärk',
    'Kraftnedsättning',
    'Smärta som inte förbättras efter 6 veckor'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_001', 'swe_070']
};

// ============================================
// FROZEN SHOULDER (FRUSEN AXEL)
// ============================================

export const AXELINA_FROZEN_SHOULDER: AxelinaProtocol = {
  id: 'axelina_frozen_shoulder',
  name: 'Frusen axel (Adhesiv kapsulit) - Rehabilitering (Axelina)',
  englishName: 'Frozen Shoulder - Adhesive Capsulitis',
  bodyArea: 'axel',
  description: 'Rehabilitering vid frusen axel enligt Axelina. Anpassad till de tre faserna: frysning, frusen, upptining. Fokus på smärtfri rörelseträning.',
  axelinaCategory: 'icke_operativ',
  axelinaLevel: 1,
  homeExercisesPerDay: 3,
  checkupIntervalWeeks: 4,

  phases: {
    1: {
      weeks: '0-12 (Frysningsfas)',
      daysStart: 0,
      daysEnd: 84,
      restrictions: [
        'ingen_forcerad_rörelse',
        'smärtfri_träning_endast'
      ],
      allowedMovements: [
        'pendelrörelser',
        'försiktig_stretching',
        'värme_före_rörelse'
      ],
      forbiddenMovements: [
        'forcerad_manipulation',
        'smärtsamma_stretchar'
      ],
      goals: [
        'Smärtkontroll',
        'Bibehålla maximal möjlig rörlighet',
        'Acceptans av tillståndet'
      ],
      precautions: [
        'Tvinga aldrig rörelse genom smärta',
        'Använd värme för avslappning'
      ]
    },
    2: {
      weeks: '12-36 (Frusen fas)',
      daysStart: 85,
      daysEnd: 252,
      restrictions: [
        'gradvis_ökad_rörelse'
      ],
      allowedMovements: [
        'aktiv_assisterad_stretching',
        'rörelseträning_dagligen',
        'lätt_styrketräning'
      ],
      forbiddenMovements: [
        'aggressiv_manipulation'
      ],
      goals: [
        'Gradvis ökad rörlighet',
        'Bibehålla styrka',
        'Funktion i vardag'
      ],
      precautions: [
        'Tålamod - läkningen tar tid'
      ]
    },
    3: {
      weeks: '36+ (Upptinings­fas)',
      daysStart: 253,
      daysEnd: null,
      restrictions: [],
      allowedMovements: [
        'progressiv_stretching',
        'full_styrketräning',
        'funktionella_aktiviteter'
      ],
      forbiddenMovements: [],
      goals: [
        'Full rörlighet',
        'Återgång till normal aktivitet'
      ],
      precautions: [
        'Fortsätt rörelseträning'
      ]
    }
  },

  absoluteContraindications: [
    'Manipulation under smärta'
  ],
  relativeContraindications: [
    'Aggressiv stretching i frysningsfasen'
  ],
  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: [],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: true,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Kraftig nattsmärta efter fas 1',
    'Ingen förbättring efter 6 månader',
    'Neurologiska symtom'
  ],
  expectedRecoveryWeeks: 52,
  sources: ['swe_001']
};

// ============================================
// AXELPROTES - OMVÄND (REVERSE)
// ============================================

export const AXELINA_REVERSE_PROTES: AxelinaProtocol = {
  id: 'axelina_reverse_protes',
  name: 'Omvänd axelprotes - Rehabilitering (Axelina)',
  englishName: 'Reverse Total Shoulder Arthroplasty',
  bodyArea: 'axel',
  description: 'Rehabilitering efter omvänd axelprotes enligt Region Jönköpings protokoll baserat på Axelina. Speciella hänsyn till förändrad biomekanik.',
  axelinaCategory: 'operativ',
  axelinaLevel: 3,
  homeExercisesPerDay: 4,
  checkupIntervalWeeks: 2,

  phases: {
    1: {
      weeks: '0-6',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'mitella_6_veckor',
        'ingen_aktiv_rörelse',
        'ingen_extern_rotation'
      ],
      allowedMovements: [
        'pendelrörelser',
        'passiv_elevation_max_90',
        'finger_handled_armbåge'
      ],
      forbiddenMovements: [
        'aktiv_elevation',
        'extern_rotation',
        'intern_rotation_bakom_rygg',
        'lyft'
      ],
      goals: [
        'Skydda protesen',
        'Smärtkontroll',
        'Passiv rörlighet'
      ],
      precautions: [
        'Strikt mitella-användning',
        'Sov på rygg',
        'Ingen belastning'
      ]
    },
    2: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'begränsad_extern_rotation',
        'ingen_tung_belastning'
      ],
      allowedMovements: [
        'aktiv_assisterad_elevation',
        'isometrisk_deltoideus',
        'skapulaövningar'
      ],
      forbiddenMovements: [
        'extern_rotation_över_30',
        'tung_styrketräning'
      ],
      goals: [
        'Aktivera deltoideus',
        'Gradvis aktiv rörelse',
        'Skapulakontroll'
      ],
      precautions: [
        'Gradvis progression'
      ]
    },
    3: {
      weeks: '12-24',
      daysStart: 85,
      daysEnd: 168,
      restrictions: [
        'anpassad_styrketräning'
      ],
      allowedMovements: [
        'progressiv_styrketräning',
        'funktionella_aktiviteter',
        'ADL_träning'
      ],
      forbiddenMovements: [
        'maximal_belastning',
        'kontaktsport'
      ],
      goals: [
        'Funktionell styrka',
        'Självständighet i ADL',
        'Optimal funktion'
      ],
      precautions: [
        'Livslånga restriktioner kan gälla'
      ]
    }
  },

  absoluteContraindications: [
    'Extern rotation mot motstånd första 12 veckorna',
    'Intern rotation bakom rygg',
    'Tunga lyft (>5kg) permanent'
  ],
  relativeContraindications: [
    'Overhead-aktiviteter med belastning'
  ],
  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri', 'excentrisk'] as ExerciseType[],
    phase2: ['plyometri', 'excentrisk'] as ExerciseType[],
    phase3: ['plyometri']
  },
  excludeKeywords: ['pullup', 'dips', 'bench press', 'overhead'],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Avlastad',
    phase3: 'Partiell'
  },
  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: true
  },
  redFlags: [
    'Plötslig smärta eller knäppning',
    'Svullnad och rodnad',
    'Feber',
    'Kraftförlust'
  ],
  expectedRecoveryWeeks: 24,
  sources: ['swe_001', 'swe_004']
};

// ============================================
// AC-LEDSSKADA
// ============================================

export const AXELINA_AC_LED: AxelinaProtocol = {
  id: 'axelina_ac_led',
  name: 'AC-ledsskada - Rehabilitering (Axelina)',
  englishName: 'Acromioclavicular Joint Injury',
  bodyArea: 'axel',
  description: 'Rehabilitering vid AC-ledsskada (akromioklavikularled) enligt Axelina. Anpassad till skadegrad (Rockwood I-VI).',
  axelinaCategory: 'icke_operativ',
  axelinaLevel: 1,
  homeExercisesPerDay: 3,
  checkupIntervalWeeks: 2,

  phases: {
    1: {
      weeks: '0-2',
      daysStart: 0,
      daysEnd: 14,
      restrictions: [
        'mitella_vid_behov',
        'ingen_belastning'
      ],
      allowedMovements: [
        'pendelrörelser',
        'isometrisk_stabilisering',
        'armbåge_handled'
      ],
      forbiddenMovements: [
        'horisontell_adduktion',
        'lyft',
        'stöd_på_armen'
      ],
      goals: [
        'Smärtkontroll',
        'Minska svullnad',
        'Skydda leden'
      ],
      precautions: [
        'Undvik tryck mot AC-leden',
        'Vila armen vid smärta'
      ]
    },
    2: {
      weeks: '2-6',
      daysStart: 15,
      daysEnd: 42,
      restrictions: [
        'undvik_horisontell_adduktion'
      ],
      allowedMovements: [
        'aktiv_rörelse',
        'lätt_styrketräning',
        'skapulaövningar'
      ],
      forbiddenMovements: [
        'tung_belastning',
        'stöd_på_händer'
      ],
      goals: [
        'Full smärtfri rörlighet',
        'Styrkeuppbyggnad',
        'Funktion i vardag'
      ],
      precautions: [
        'Gradvis progression'
      ]
    },
    3: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [],
      allowedMovements: [
        'full_styrketräning',
        'funktionella_övningar',
        'sportspecifik_träning'
      ],
      forbiddenMovements: [],
      goals: [
        'Full styrka',
        'Återgång till aktivitet'
      ],
      precautions: [
        'Skydda vid kontaktsport'
      ]
    }
  },

  absoluteContraindications: [
    'Horisontell adduktion första 4 veckorna',
    'Direkt tryck mot AC-leden'
  ],
  relativeContraindications: [
    'Belastning på utsträckt arm'
  ],
  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri'] as ExerciseType[],
    phase2: ['plyometri'] as ExerciseType[],
    phase3: []
  },
  excludeKeywords: ['fly', 'cable crossover'],
  weightBearingProgression: {
    phase1: 'Avlastad',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },
  requiresSupervision: {
    phase1: false,
    phase2: false,
    phase3: false
  },
  redFlags: [
    'Bestående smärta efter 6 veckor',
    'Synlig deformitet som ökar',
    'Instabilitet vid aktivitet'
  ],
  expectedRecoveryWeeks: 12,
  sources: ['swe_001']
};

// ============================================
// EXPORT ALLA AXELINA-PROTOKOLL
// ============================================

export const AXELINA_PROTOCOLS: AxelinaProtocol[] = [
  AXELINA_ROTATORKUFF_KONSERVATIV,
  AXELINA_ROTATORKUFF_POSTOP,
  AXELINA_INSTABILITET,
  AXELINA_IMPINGEMENT,
  AXELINA_FROZEN_SHOULDER,
  AXELINA_REVERSE_PROTES,
  AXELINA_AC_LED
];

// ============================================
// HJÄLPFUNKTIONER
// ============================================

/**
 * Hämta Axelina-protokoll baserat på diagnos
 */
export function getAxelinaProtocol(diagnosis: string): AxelinaProtocol | undefined {
  const normalizedDiagnosis = diagnosis.toLowerCase();

  if (normalizedDiagnosis.includes('rotatorkuff') && normalizedDiagnosis.includes('sutur')) {
    return AXELINA_ROTATORKUFF_POSTOP;
  }
  if (normalizedDiagnosis.includes('rotatorkuff')) {
    return AXELINA_ROTATORKUFF_KONSERVATIV;
  }
  if (normalizedDiagnosis.includes('instabilitet') || normalizedDiagnosis.includes('luxation')) {
    return AXELINA_INSTABILITET;
  }
  if (normalizedDiagnosis.includes('impingement') || normalizedDiagnosis.includes('inklämning')) {
    return AXELINA_IMPINGEMENT;
  }
  if (normalizedDiagnosis.includes('frusen') || normalizedDiagnosis.includes('frozen') || normalizedDiagnosis.includes('adhesiv')) {
    return AXELINA_FROZEN_SHOULDER;
  }
  if (normalizedDiagnosis.includes('omvänd') && normalizedDiagnosis.includes('protes')) {
    return AXELINA_REVERSE_PROTES;
  }
  if (normalizedDiagnosis.includes('ac-led') || normalizedDiagnosis.includes('akromioklavikular')) {
    return AXELINA_AC_LED;
  }

  return undefined;
}

/**
 * Hämta alla icke-operativa protokoll
 */
export function getIckeOperativaAxelina(): AxelinaProtocol[] {
  return AXELINA_PROTOCOLS.filter(p => p.axelinaCategory === 'icke_operativ');
}

/**
 * Hämta alla operativa protokoll
 */
export function getOperativaAxelina(): AxelinaProtocol[] {
  return AXELINA_PROTOCOLS.filter(p => p.axelinaCategory === 'operativ');
}

export default AXELINA_PROTOCOLS;
