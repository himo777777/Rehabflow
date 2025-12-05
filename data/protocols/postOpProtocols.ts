/**
 * POSTOPERATIVA REHABILITERINGSPROTOKOLL
 *
 * Evidensbaserade protokoll för vanliga ortopediska ingrepp.
 * Dessa protokoll följer svenska riktlinjer och internationella standards.
 *
 * VIKTIGT: Dessa är generella riktlinjer. Individuell anpassning baserat på
 * kirurgens instruktioner har ALLTID företräde.
 *
 * Källor:
 * - Svenska Ortopedföreningen (SOF)
 * - Fysioterapeuterna
 * - AAOS (American Academy of Orthopaedic Surgeons)
 * - Socialstyrelsen
 */

import { BodyArea, ExerciseType } from '../../types';

// ============================================
// INTERFACES
// ============================================

/**
 * Restriktion inom en specifik fas
 */
export interface PhaseRestriction {
  weeks: string;                      // "0-6", "6-12", "12+"
  daysStart: number;                  // Start dag
  daysEnd: number | null;             // Slut dag (null = oändlig)
  restrictions: string[];             // Aktiva restriktioner
  allowedMovements: string[];         // Tillåtna rörelser
  forbiddenMovements: string[];       // Förbjudna rörelser
  goals: string[];                    // Mål för fasen
  precautions: string[];              // Försiktighetsåtgärder
}

/**
 * Komplett protokoll för en operation
 */
export interface PostOpProtocol {
  id: string;
  name: string;                       // Svenska namnet
  englishName: string;                // För sökbarhet
  bodyArea: BodyArea;
  description: string;

  // Fasindelning
  phases: {
    1: PhaseRestriction;
    2: PhaseRestriction;
    3: PhaseRestriction;
    4?: PhaseRestriction;             // Vissa har 4 faser
  };

  // Absoluta kontraindikationer (ALDRIG göra)
  absoluteContraindications: string[];

  // Rörelser som kräver försiktighet
  relativeContraindications: string[];

  // Övningstyper att undvika per fas
  forbiddenExerciseTypes: {
    phase1: ExerciseType[];
    phase2: ExerciseType[];
    phase3: ExerciseType[];
  };

  // Nyckelord att filtrera bort från övningsdatabasen
  excludeKeywords: string[];

  // Viktbäringsrestriktioner per fas
  weightBearingProgression: {
    phase1: 'Avlastad' | 'Partiell' | 'Fullt';
    phase2: 'Avlastad' | 'Partiell' | 'Fullt';
    phase3: 'Partiell' | 'Fullt';
  };

  // Kräver övervakning av fysioterapeut?
  requiresSupervision: {
    phase1: boolean;
    phase2: boolean;
    phase3: boolean;
  };

  // Varningssignaler att bevaka
  redFlags: string[];

  // Förväntad total återhämtningstid
  expectedRecoveryWeeks: number;

  // Källor
  sources: string[];
}

// ============================================
// AXEL-OPERATIONER
// ============================================

export const AXELPROTES: PostOpProtocol = {
  id: 'axelprotes',
  name: 'Axelprotes (Total axelartroplastik)',
  englishName: 'Total Shoulder Arthroplasty',
  bodyArea: 'axel',
  description: 'Total ersättning av axelleden med protes. Kräver strikta rörelserestriktioner under läkningstiden.',

  phases: {
    1: {
      weeks: '0-6',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'ingen_aktiv_abduktion',
        'ingen_aktiv_flexion_över_90',
        'ingen_extern_rotation_över_0',
        'ingen_intern_rotation_bakom_rygg',
        'ingen_belastning'
      ],
      allowedMovements: [
        'pendelrörelser',
        'passiv_rörelseträning',
        'fingerrörelser',
        'armbågsflexion',
        'handled_rotation'
      ],
      forbiddenMovements: [
        'aktiv_abduktion',
        'extern_rotation',
        'lyft_över_axelhöjd',
        'armhävningar',
        'dragningar'
      ],
      goals: [
        'Smärtlindring',
        'Minska svullnad',
        'Bibehålla passiv rörlighet',
        'Skydda operationen'
      ],
      precautions: [
        'Bär mitella enligt instruktion',
        'Sov på ryggen eller opererad sida med kudde',
        'Undvik att lyfta med opererad arm'
      ]
    },
    2: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'ingen_tung_belastning',
        'ingen_maximal_extern_rotation',
        'begränsad_abduktion_till_120'
      ],
      allowedMovements: [
        'aktiv_assisterad_rörelse',
        'lätt_styrketräning_isometrisk',
        'scapula_stabilisering'
      ],
      forbiddenMovements: [
        'tung_styrketräning',
        'kast',
        'snabba_rörelser'
      ],
      goals: [
        'Återfå aktiv rörlighet',
        'Påbörja isometrisk styrka',
        'Normalisera scapula-rytm'
      ],
      precautions: [
        'Undvik smärta vid träning',
        'Öka gradvis',
        'Fortsätt med hemövningar dagligen'
      ]
    },
    3: {
      weeks: '12-24',
      daysStart: 85,
      daysEnd: 168,
      restrictions: [
        'ingen_kontaktsport',
        'begränsad_belastning'
      ],
      allowedMovements: [
        'full_aktiv_rörlighet',
        'progressiv_styrketräning',
        'funktionella_rörelser'
      ],
      forbiddenMovements: [
        'tunga_lyft_över_huvudet',
        'explosiva_rörelser'
      ],
      goals: [
        'Full funktionell rörlighet',
        'Normal styrka för ADL',
        'Återgång till lättare aktiviteter'
      ],
      precautions: [
        'Fortsatt restriktion för tunga lyft',
        'Livslång försiktighet med höga belastningar'
      ]
    }
  },

  absoluteContraindications: [
    'armhävningar',
    'axelpress',
    'pullups',
    'chin_ups',
    'militärpress',
    'dips',
    'bakåtlyft_med_vikt',
    'kast',
    'simning_crawl',
    'bowling',
    'golf_swing'
  ],

  relativeContraindications: [
    'rodd',
    'fronthöjning',
    'sidhöjning',
    'rotation_med_vikt'
  ],

  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri', 'excentrisk', 'koncentrisk'],
    phase2: ['plyometri', 'excentrisk'],
    phase3: ['plyometri']
  },

  excludeKeywords: [
    'overhead',
    'press',
    'push_up',
    'pullup',
    'kast',
    'swing',
    'snatch',
    'clean',
    'jerk'
  ],

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
    'Svullnad som inte minskar',
    'Feber > 38°C',
    'Rodnad och värme vid snittet',
    'Instabilitetskänsla',
    'Domningar eller stickningar som förvärras'
  ],

  expectedRecoveryWeeks: 24,

  sources: [
    'Svenska Ortopedföreningen - Axelprotes riktlinjer 2023',
    'Fysioterapeuterna - Postoperativ axelrehabilitering',
    'AAOS Guidelines for TSA Rehabilitation'
  ]
};

export const ROTATORKUFFSUTUR: PostOpProtocol = {
  id: 'rotatorkuff_sutur',
  name: 'Rotatorkuffsutur (Cuff repair)',
  englishName: 'Rotator Cuff Repair',
  bodyArea: 'axel',
  description: 'Kirurgisk reparation av rotatorkuffsenor. Kräver strikta restriktioner för att skydda läkningen.',

  phases: {
    1: {
      weeks: '0-6',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'ingen_aktiv_rörelse',
        'ingen_belastning',
        'ingen_abduktion',
        'ingen_extern_rotation'
      ],
      allowedMovements: [
        'pendelrörelser',
        'armbågspump',
        'hand_handled_rörelser',
        'passiv_rörelseträning_med_fysioterapeut'
      ],
      forbiddenMovements: [
        'all_aktiv_axelrörelse',
        'lyft',
        'pushing',
        'pulling'
      ],
      goals: [
        'Skydda suturen',
        'Smärtlindring',
        'Bibehålla passiv ROM'
      ],
      precautions: [
        'Mitella dygnet runt',
        'Sov i lutande position eller på frisk sida',
        'Ingen bilkörning'
      ]
    },
    2: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'ingen_aktiv_rotation_mot_motstånd',
        'ingen_abduktion_över_90',
        'ingen_belastning'
      ],
      allowedMovements: [
        'aktiv_assisterad_flexion',
        'aktiv_assisterad_abduktion_till_90',
        'isometrisk_stabilisering'
      ],
      forbiddenMovements: [
        'aktiv_extern_rotation_mot_motstånd',
        'lyft',
        'styrketräning_axel'
      ],
      goals: [
        'Återfå aktiv ROM',
        'Påbörja isometrisk aktivering',
        'Normal scapula-funktion'
      ],
      precautions: [
        'Smärtfri träning',
        'Gradvis ökning',
        'Fortsätt fysioterapibesök'
      ]
    },
    3: {
      weeks: '12-24',
      daysStart: 85,
      daysEnd: 168,
      restrictions: [
        'ingen_maximal_belastning',
        'begränsad_overhead_aktivitet'
      ],
      allowedMovements: [
        'progressiv_styrketräning',
        'funktionella_rörelser',
        'sport_specifik_träning'
      ],
      forbiddenMovements: [
        'maxlyft',
        'explosiva_kast'
      ],
      goals: [
        'Full styrka',
        'Återgång till arbete',
        'Återgång till sport (vid 6 månader+)'
      ],
      precautions: [
        'Gradvis återgång till aktivitet',
        'Fortsatta övningar för att bibehålla styrka'
      ]
    }
  },

  absoluteContraindications: [
    'armhävningar_fas_1_2',
    'axelpress_fas_1_2',
    'pullups',
    'tung_rodd',
    'kast',
    'simning_crawl_butterfly'
  ],

  relativeContraindications: [
    'sidhöjning',
    'fronthöjning',
    'rotation_mot_motstånd'
  ],

  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri', 'excentrisk', 'koncentrisk'],
    phase2: ['plyometri', 'excentrisk'],
    phase3: ['plyometri']
  },

  excludeKeywords: [
    'press',
    'pullup',
    'kast',
    'overhead',
    'push_up',
    'rotation_mot_motstånd'
  ],

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
    'Ökad smärta efter vecka 2',
    'Känsla av att något "gått sönder"',
    'Plötslig svaghet',
    'Feber',
    'Sårinfektion'
  ],

  expectedRecoveryWeeks: 26,

  sources: [
    'Fysioterapeuterna - Rotatorkuff rehabilitering',
    'SOF Axelriktlinjer',
    'ASES Rehabilitation Guidelines'
  ]
};

// ============================================
// KNÄ-OPERATIONER
// ============================================

export const ACL_REKONSTRUKTION: PostOpProtocol = {
  id: 'acl_rekonstruktion',
  name: 'Främre korsbands-rekonstruktion (ACL)',
  englishName: 'ACL Reconstruction',
  bodyArea: 'knä',
  description: 'Rekonstruktion av främre korsbandet med graft. Lång rehabilitering krävs innan full återgång.',

  phases: {
    1: {
      weeks: '0-2',
      daysStart: 0,
      daysEnd: 14,
      restrictions: [
        'ingen_full_extension_passivt_låst',
        'ingen_belastning_utan_kryckor',
        'ingen_rotation_knäled'
      ],
      allowedMovements: [
        'quadriceps_aktivering',
        'fotpump',
        'straight_leg_raise',
        'häl_slides'
      ],
      forbiddenMovements: [
        'öppen_kinetisk_kedja_extension',
        'djupa_knäböj',
        'hopp',
        'löpning'
      ],
      goals: [
        'Minska svullnad',
        'Uppnå full extension',
        'Aktivera quadriceps',
        '0-90° flexion'
      ],
      precautions: [
        'Kryckor vid gång',
        'Ortos enligt instruktion',
        'Isa regelbundet'
      ]
    },
    2: {
      weeks: '2-6',
      daysStart: 15,
      daysEnd: 42,
      restrictions: [
        'ingen_pivoting',
        'ingen_löpning',
        'begränsad_sluten_kedja'
      ],
      allowedMovements: [
        'cykling_utan_motstånd',
        'minisquat_0_60',
        'balansträning',
        'simning_benspark'
      ],
      forbiddenMovements: [
        'hopp',
        'löpning',
        'sidosteg',
        'djup_squat'
      ],
      goals: [
        'Full ROM',
        'Normal gång utan kryckor',
        'Återfå muskelkontroll'
      ],
      precautions: [
        'Undvik vridningar',
        'Gradvis öka belastning'
      ]
    },
    3: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'ingen_kontaktsport',
        'ingen_hoppa_landa',
        'ingen_maximal_hastighet'
      ],
      allowedMovements: [
        'progressiv_styrketräning',
        'cykling_med_motstånd',
        'jogging_från_vecka_12',
        'leg_press'
      ],
      forbiddenMovements: [
        'kontaktsport',
        'plyometri',
        'agility_med_full_hastighet'
      ],
      goals: [
        'Symmetrisk benstyrka >80%',
        'Påbörja löpning',
        'Funktionell träning'
      ],
      precautions: [
        'LSI >80% innan löpning',
        'Fortsätt ortos vid behov'
      ]
    },
    4: {
      weeks: '12-36',
      daysStart: 85,
      daysEnd: 252,
      restrictions: [
        'begränsad_tävling'
      ],
      allowedMovements: [
        'löpning',
        'plyometri_från_16_veckor',
        'agility_träning',
        'sportspecifik_träning'
      ],
      forbiddenMovements: [
        'full_match_innan_9_månader'
      ],
      goals: [
        'LSI >90%',
        'Klara hopptester',
        'Psykologisk beredskap',
        'Återgång till sport'
      ],
      precautions: [
        'Utför return-to-sport testbatteri',
        'Gradvis exponering för matchsituationer'
      ]
    }
  },

  absoluteContraindications: [
    'hoppa_landa_fas_1_2',
    'pivotering',
    'sidosteg_fas_1_2',
    'öppen_kinetisk_kedja_extension_0_45',
    'djup_squat_fas_1',
    'kontaktsport_första_9_månader'
  ],

  relativeContraindications: [
    'löpning_innan_12_veckor',
    'plyometri_innan_16_veckor'
  ],

  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'stärkning'],
    phase2: ['plyometri'],
    phase3: []
  },

  excludeKeywords: [
    'hopp',
    'sidosteg',
    'pivot',
    'cutting',
    'landing',
    'sprint'
  ],

  weightBearingProgression: {
    phase1: 'Partiell',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },

  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: true
  },

  redFlags: [
    'Ökad svullnad',
    'Instabilitetskänsla (giving way)',
    'Låsning av knät',
    'Oförmåga att belasta',
    'Feber eller infektion'
  ],

  expectedRecoveryWeeks: 36,

  sources: [
    'SOF ACL-riktlinjer 2023',
    'Knee Surg Sports Traumatol Arthrosc',
    'Fysioterapeuterna ACL-protokoll'
  ]
};

export const MENISKOPERATION: PostOpProtocol = {
  id: 'menisk_operation',
  name: 'Meniskoperation (Sutur eller resektion)',
  englishName: 'Meniscus Surgery',
  bodyArea: 'knä',
  description: 'Artroskopisk meniskkirurgi. Protokoll varierar beroende på om det är sutur eller resektion.',

  phases: {
    1: {
      weeks: '0-2',
      daysStart: 0,
      daysEnd: 14,
      restrictions: [
        'begränsad_flexion_90_vid_sutur',
        'ingen_djup_squat',
        'ingen_rotation'
      ],
      allowedMovements: [
        'quad_sets',
        'straight_leg_raise',
        'häl_slides',
        'fotpump'
      ],
      forbiddenMovements: [
        'djup_knäböj',
        'vridning',
        'löpning'
      ],
      goals: [
        'Minska svullnad',
        'Bibehålla quad-styrka',
        'ROM 0-90'
      ],
      precautions: [
        'Kryckor första veckan (vid sutur)',
        'Isa efter aktivitet'
      ]
    },
    2: {
      weeks: '2-6',
      daysStart: 15,
      daysEnd: 42,
      restrictions: [
        'ingen_djup_squat',
        'begränsad_belastning_vid_sutur'
      ],
      allowedMovements: [
        'cykling',
        'simning',
        'knäböj_0_60',
        'balansträning'
      ],
      forbiddenMovements: [
        'löpning',
        'hopp'
      ],
      goals: [
        'Full ROM',
        'Normal gång',
        'Återfå styrka'
      ],
      precautions: [
        'Gradvis ökning',
        'Undvik smärta'
      ]
    },
    3: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'begränsad_kontaktsport'
      ],
      allowedMovements: [
        'löpning',
        'full_styrketräning',
        'sportspecifik_träning'
      ],
      forbiddenMovements: [
        'kontaktsport_vid_sutur_innan_12_veckor'
      ],
      goals: [
        'Full styrka',
        'Återgång till aktivitet'
      ],
      precautions: [
        'Gradvis återgång',
        'Lyssna på kroppen'
      ]
    }
  },

  absoluteContraindications: [
    'djup_squat_fas_1',
    'maximal_knäflexion_fas_1'
  ],

  relativeContraindications: [
    'löpning_innan_4_6_veckor',
    'kontaktsport_innan_8_12_veckor'
  ],

  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'stärkning'],
    phase2: ['plyometri'],
    phase3: []
  },

  excludeKeywords: [
    'djup_squat',
    'hopp',
    'pistol_squat'
  ],

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
    'Ökad svullnad efter vecka 1',
    'Låsning av knät',
    'Oförmåga att sträcka knät',
    'Feber'
  ],

  expectedRecoveryWeeks: 12,

  sources: [
    'SOF Menisk-riktlinjer',
    'ESSKA Guidelines'
  ]
};

export const KNÄPROTES: PostOpProtocol = {
  id: 'knaprotes',
  name: 'Knäprotes (Total knäartroplastik)',
  englishName: 'Total Knee Arthroplasty',
  bodyArea: 'knä',
  description: 'Total ersättning av knäleden. Fokus på tidig mobilisering och ROM.',

  phases: {
    1: {
      weeks: '0-2',
      daysStart: 0,
      daysEnd: 14,
      restrictions: [
        'ingen_tung_belastning',
        'ingen_djup_knäböj'
      ],
      allowedMovements: [
        'gång_med_hjälpmedel',
        'quad_sets',
        'häl_slides',
        'fotpump',
        'straight_leg_raise'
      ],
      forbiddenMovements: [
        'djup_knäböj',
        'hopp',
        'löpning'
      ],
      goals: [
        'Gång med gånghjälpmedel',
        'ROM 0-90°',
        'Självständig ADL'
      ],
      precautions: [
        'Trombosprofylax',
        'Fallprevention',
        'Sårvård'
      ]
    },
    2: {
      weeks: '2-6',
      daysStart: 15,
      daysEnd: 42,
      restrictions: [
        'begränsad_trappgång',
        'ingen_djup_squat'
      ],
      allowedMovements: [
        'cykling',
        'gång_utan_hjälpmedel',
        'knäböj_0_90',
        'trappträning'
      ],
      forbiddenMovements: [
        'hopp',
        'löpning',
        'kontaktsport'
      ],
      goals: [
        'ROM 0-120°',
        'Gång utan stöd',
        'Trappor'
      ],
      precautions: [
        'Fortsätt fallprevention',
        'Gradvis ökning'
      ]
    },
    3: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'ingen_kontaktsport',
        'ingen_hopp'
      ],
      allowedMovements: [
        'full_styrketräning_benet',
        'simning',
        'cykling',
        'gång_längre_sträckor'
      ],
      forbiddenMovements: [
        'löpning',
        'kontaktsport',
        'alpint'
      ],
      goals: [
        'Full ROM',
        'Normal styrka',
        'Återgång till lättare aktiviteter'
      ],
      precautions: [
        'Livslång restriktion för högbelastande sport'
      ]
    }
  },

  absoluteContraindications: [
    'löpning',
    'kontaktsport',
    'alpint_skidåkning',
    'hopp',
    'djup_squat_under_90'
  ],

  relativeContraindications: [
    'golf_tidigt',
    'cykling_terräng',
    'simning_bröstsim_första_6_veckorna'
  ],

  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'stärkning'],
    phase2: ['plyometri'],
    phase3: ['plyometri']
  },

  excludeKeywords: [
    'hopp',
    'löpning',
    'djup_squat',
    'sprint',
    'plyometrisk'
  ],

  weightBearingProgression: {
    phase1: 'Partiell',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },

  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: false
  },

  redFlags: [
    'Feber > 38°C',
    'Ökad svullnad eller rodnad',
    'Sårinfektion',
    'DVT-symtom (vadsmärta, svullnad)',
    'Instabilitetskänsla'
  ],

  expectedRecoveryWeeks: 12,

  sources: [
    'SOF Knäplastik-riktlinjer',
    'AAOS Guidelines',
    'Socialstyrelsen'
  ]
};

// ============================================
// HÖFT-OPERATIONER
// ============================================

export const HÖFTPROTES: PostOpProtocol = {
  id: 'hoftprotes',
  name: 'Höftprotes (Total höftartroplastik)',
  englishName: 'Total Hip Arthroplasty',
  bodyArea: 'höft',
  description: 'Total ersättning av höftleden. Restriktioner beror på operationsmetod (posterior/anterior).',

  phases: {
    1: {
      weeks: '0-6',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'ingen_flexion_över_90',
        'ingen_adduktion_förbi_medellinjen',
        'ingen_inåtrotation',
        'ingen_djup_sittande'
      ],
      allowedMovements: [
        'gång_med_hjälpmedel',
        'höftextension',
        'abduktion_i_sidoläge',
        'isometrisk_gluteus',
        'fotpump'
      ],
      forbiddenMovements: [
        'korsa_benen',
        'djup_sittande',
        'böja_sig_framåt',
        'vridning_inåt'
      ],
      goals: [
        'Säker gång',
        'Förhindra luxation',
        'Bibehålla styrka'
      ],
      precautions: [
        'Använd högt sittande',
        'Sov med kudde mellan benen',
        'Använd hjälpmedel för strumpor/skor',
        'Undvik att korsa benen'
      ]
    },
    2: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'begränsad_flexion',
        'försiktighet_med_rotation'
      ],
      allowedMovements: [
        'gång_utan_hjälpmedel',
        'cykling_stationary',
        'simning_crawl',
        'progressiv_styrketräning'
      ],
      forbiddenMovements: [
        'djup_squat',
        'maximala_rörelser'
      ],
      goals: [
        'Gång utan stöd',
        'Normal ROM',
        'Återgång till lätta aktiviteter'
      ],
      precautions: [
        'Fortsätt försiktighet med djupa rörelser',
        'Gradvis ökning av aktivitet'
      ]
    },
    3: {
      weeks: '12+',
      daysStart: 85,
      daysEnd: null,
      restrictions: [
        'ingen_kontaktsport',
        'begränsad_belastning'
      ],
      allowedMovements: [
        'full_styrketräning',
        'golf',
        'simning',
        'cykling',
        'vandring'
      ],
      forbiddenMovements: [
        'kontaktsport',
        'löpning_lång_distans',
        'alpint_avancerat'
      ],
      goals: [
        'Livslång aktivitet',
        'Bibehålla styrka',
        'Undvika protesslitage'
      ],
      precautions: [
        'Årliga kontroller',
        'Undvik höga stötar'
      ]
    }
  },

  absoluteContraindications: [
    'korsa_benen',
    'djup_squat',
    'kontaktsport',
    'höga_hopp',
    'löpning_lång_distans'
  ],

  relativeContraindications: [
    'yoga_djupa_positioner',
    'bröstsim',
    'golf_första_6_veckorna'
  ],

  forbiddenExerciseTypes: {
    phase1: ['plyometri', 'stärkning'],
    phase2: ['plyometri'],
    phase3: ['plyometri']
  },

  excludeKeywords: [
    'djup_squat',
    'adduktor',
    'korsa_ben',
    'lotus',
    'hopp',
    'löpning'
  ],

  weightBearingProgression: {
    phase1: 'Partiell',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },

  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: false
  },

  redFlags: [
    'Plötslig smärta i höft eller ljumske',
    'Känsla av att höften "hoppar ur led"',
    'Benförkortning',
    'Feber',
    'DVT-symtom'
  ],

  expectedRecoveryWeeks: 12,

  sources: [
    'SOF Höftplastik-riktlinjer',
    'Socialstyrelsen',
    'AAOS Guidelines'
  ]
};

// ============================================
// RYGG-OPERATIONER
// ============================================

export const DISKBRÅCK_OPERATION: PostOpProtocol = {
  id: 'diskbrack_operation',
  name: 'Diskbråckoperation (Diskektomi)',
  englishName: 'Lumbar Discectomy',
  bodyArea: 'ländrygg',
  description: 'Kirurgisk behandling av diskbråck med borttagning av diskprolapsmaterial.',

  phases: {
    1: {
      weeks: '0-2',
      daysStart: 0,
      daysEnd: 14,
      restrictions: [
        'ingen_framåtböjning',
        'ingen_rotation',
        'ingen_lyft',
        'begränsad_sittande'
      ],
      allowedMovements: [
        'gång_korta_sträckor',
        'liggande_positionsbyten',
        'ankel_pump',
        'knä_mot_bröstet_försiktigt'
      ],
      forbiddenMovements: [
        'framåtböjning',
        'lyft_över_2kg',
        'vridningar',
        'långvarigt_sittande'
      ],
      goals: [
        'Smärtlindring',
        'Tidig mobilisering',
        'Skydda operationsområdet'
      ],
      precautions: [
        'Logroll vid positionsbyten',
        'Korta sittstunder (<30 min)',
        'Ingen bilkörning'
      ]
    },
    2: {
      weeks: '2-6',
      daysStart: 15,
      daysEnd: 42,
      restrictions: [
        'begränsad_flexion',
        'ingen_tung_lyft'
      ],
      allowedMovements: [
        'gång_ökade_sträckor',
        'core_stabilisering_lätt',
        'bäckentilt',
        'simning_ryggcrawl'
      ],
      forbiddenMovements: [
        'tunga_lyft',
        'djupa_framåtböjningar',
        'sit_ups'
      ],
      goals: [
        'Ökad aktivitet',
        'Core-stabilitet',
        'Återgång till arbete (lätt)'
      ],
      precautions: [
        'Ergonomisk arbetsplats',
        'Pauser vid sittande',
        'Korrekta lyfttekniker'
      ]
    },
    3: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'begränsad_maxbelastning'
      ],
      allowedMovements: [
        'full_rörlighetsträning',
        'progressiv_styrketräning',
        'cykling',
        'simning_alla_simsätt'
      ],
      forbiddenMovements: [
        'maxlyft',
        'explosiva_rörelser_rygg'
      ],
      goals: [
        'Normal funktion',
        'Återgång till full aktivitet',
        'Förebygga recidiv'
      ],
      precautions: [
        'Fortsätt core-träning',
        'Ergonomi i vardagen'
      ]
    }
  },

  absoluteContraindications: [
    'sit_ups_crunch',
    'tung_marklyft',
    'god_morgon_övning',
    'jefferson_curl'
  ],

  relativeContraindications: [
    'golf_innan_6_veckor',
    'löpning_innan_6_veckor'
  ],

  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri', 'excentrisk'],
    phase2: ['plyometri'],
    phase3: []
  },

  excludeKeywords: [
    'sit_up',
    'crunch',
    'framåtböjning_tung',
    'marklyft_tungt',
    'god_morgon'
  ],

  weightBearingProgression: {
    phase1: 'Partiell',
    phase2: 'Fullt',
    phase3: 'Fullt'
  },

  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: false
  },

  redFlags: [
    'Tilltagande domningar eller svaghet i benen',
    'Blås- eller tarmstörning',
    'Feber',
    'Ökad ischiassmärta',
    'Progredierande neurologiska symtom'
  ],

  expectedRecoveryWeeks: 12,

  sources: [
    'SOF Ryggriktlinjer',
    'Fysioterapeuterna - Rygg',
    'NASS Guidelines'
  ]
};

export const SPONDYLODES: PostOpProtocol = {
  id: 'spondylodes',
  name: 'Spondylodes (Ryggsteloperation)',
  englishName: 'Spinal Fusion',
  bodyArea: 'ländrygg',
  description: 'Steloperation av ryggradskotor. Längre restriktioner för att tillåta benläkning.',

  phases: {
    1: {
      weeks: '0-6',
      daysStart: 0,
      daysEnd: 42,
      restrictions: [
        'ingen_böjning',
        'ingen_vridning',
        'ingen_lyft',
        'korsett_vid_aktivitet'
      ],
      allowedMovements: [
        'gång',
        'liggande_övningar',
        'arm_och_benrörelser_i_neutralt_ryggläge'
      ],
      forbiddenMovements: [
        'böjning',
        'vridning',
        'lyft',
        'sittande_lång_tid'
      ],
      goals: [
        'Tidig mobilisering',
        'Skydda fusion',
        'Smärtlindring'
      ],
      precautions: [
        'Korsett/ortos',
        'Logroll vid sängläge',
        'Korta sittstunder'
      ]
    },
    2: {
      weeks: '6-12',
      daysStart: 43,
      daysEnd: 84,
      restrictions: [
        'begränsad_flexion',
        'begränsad_rotation',
        'lyft_max_5kg'
      ],
      allowedMovements: [
        'gång_ökad_duration',
        'lätt_core_träning',
        'simning_ryggcrawl'
      ],
      forbiddenMovements: [
        'maximal_flexion',
        'rotation',
        'tunga_lyft'
      ],
      goals: [
        'Ökad aktivitetstolerens',
        'Förberedelse för styrketräning'
      ],
      precautions: [
        'Röntgen för kontroll av fusion',
        'Fortsatt försiktighet'
      ]
    },
    3: {
      weeks: '12-26',
      daysStart: 85,
      daysEnd: 182,
      restrictions: [
        'begränsad_maxbelastning',
        'försiktighet_vid_kontaktsport'
      ],
      allowedMovements: [
        'progressiv_styrketräning',
        'funktionella_rörelser',
        'de_flesta_aktiviteter'
      ],
      forbiddenMovements: [
        'extrema_rörelser',
        'kontaktsport'
      ],
      goals: [
        'Full återgång till aktivitet',
        'Normal styrka',
        'Bra livskvalitet'
      ],
      precautions: [
        'Fortsätt core-träning',
        'Årliga kontroller'
      ]
    }
  },

  absoluteContraindications: [
    'tunga_lyft',
    'kontaktsport',
    'extrema_böjningar',
    'golf_swing_full_kraft',
    'sit_ups'
  ],

  relativeContraindications: [
    'löpning_innan_3_månader',
    'golf_innan_3_månader'
  ],

  forbiddenExerciseTypes: {
    phase1: ['stärkning', 'plyometri', 'excentrisk', 'koncentrisk'],
    phase2: ['plyometri', 'excentrisk'],
    phase3: ['plyometri']
  },

  excludeKeywords: [
    'sit_up',
    'crunch',
    'rotation_tungt',
    'marklyft',
    'golf_swing',
    'vridning'
  ],

  weightBearingProgression: {
    phase1: 'Partiell',
    phase2: 'Partiell',
    phase3: 'Fullt'
  },

  requiresSupervision: {
    phase1: true,
    phase2: true,
    phase3: true
  },

  redFlags: [
    'Tilltagande neurologiska symtom',
    'Nya domningar eller svaghet',
    'Blås- eller tarmstörning',
    'Feber',
    'Ökad smärta'
  ],

  expectedRecoveryWeeks: 26,

  sources: [
    'SOF Ryggriktlinjer',
    'NASS Fusion Guidelines'
  ]
};

// ============================================
// SAMLAD PROTOKOLL-DATABAS
// ============================================

export const POST_OP_PROTOCOLS: Record<string, PostOpProtocol> = {
  // Axel
  'axelprotes': AXELPROTES,
  'total_axelartroplastik': AXELPROTES,
  'axelprotes_omvänd': AXELPROTES, // Samma protokoll initialt
  'rotatorkuff': ROTATORKUFFSUTUR,
  'rotatorkuff_sutur': ROTATORKUFFSUTUR,
  'rotatorkuffsutur': ROTATORKUFFSUTUR,
  'cuff_repair': ROTATORKUFFSUTUR,

  // Knä
  'acl': ACL_REKONSTRUKTION,
  'acl_rekonstruktion': ACL_REKONSTRUKTION,
  'främre_korsband': ACL_REKONSTRUKTION,
  'korsbandsrekonstruktion': ACL_REKONSTRUKTION,
  'menisk': MENISKOPERATION,
  'meniskoperation': MENISKOPERATION,
  'menisk_sutur': MENISKOPERATION,
  'menisk_resektion': MENISKOPERATION,
  'knaprotes': KNÄPROTES,
  'knäprotes': KNÄPROTES,
  'total_knäartroplastik': KNÄPROTES,

  // Höft
  'hoftprotes': HÖFTPROTES,
  'höftprotes': HÖFTPROTES,
  'total_höftartroplastik': HÖFTPROTES,
  'höftledsplastik': HÖFTPROTES,

  // Rygg
  'diskbrack': DISKBRÅCK_OPERATION,
  'diskbråck': DISKBRÅCK_OPERATION,
  'diskbråck_operation': DISKBRÅCK_OPERATION,
  'diskektomi': DISKBRÅCK_OPERATION,
  'spondylodes': SPONDYLODES,
  'ryggsteloperation': SPONDYLODES,
  'spinal_fusion': SPONDYLODES,
  'fusion': SPONDYLODES
};

// ============================================
// HJÄLPFUNKTIONER
// ============================================

/**
 * Hämta protokoll baserat på operationsnamn
 */
export function getProtocol(procedure: string): PostOpProtocol | null {
  const normalized = procedure.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/-/g, '_');

  // Försök hitta exakt match först
  if (POST_OP_PROTOCOLS[normalized]) {
    return POST_OP_PROTOCOLS[normalized];
  }

  // Försök hitta partiell match
  for (const [key, protocol] of Object.entries(POST_OP_PROTOCOLS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return protocol;
    }
    // Kolla engelska namnet också
    if (protocol.englishName.toLowerCase().includes(normalized)) {
      return protocol;
    }
  }

  return null;
}

/**
 * Beräkna vilken fas patienten är i baserat på dagar sedan operation
 */
export function getCurrentPhase(
  procedure: string,
  daysSinceSurgery: number
): { phase: 1 | 2 | 3 | 4; phaseData: PhaseRestriction } | null {
  const protocol = getProtocol(procedure);
  if (!protocol) return null;

  // Gå igenom faserna och hitta rätt
  for (const [phaseNum, phaseData] of Object.entries(protocol.phases)) {
    const phase = parseInt(phaseNum) as 1 | 2 | 3 | 4;
    if (daysSinceSurgery >= phaseData.daysStart &&
        (phaseData.daysEnd === null || daysSinceSurgery <= phaseData.daysEnd)) {
      return { phase, phaseData };
    }
  }

  // Om vi passerat alla faser, returnera sista fasen
  const phases = Object.entries(protocol.phases);
  const lastPhase = phases[phases.length - 1];
  return {
    phase: parseInt(lastPhase[0]) as 1 | 2 | 3 | 4,
    phaseData: lastPhase[1]
  };
}

/**
 * Hämta alla kontraindikationer för nuvarande fas
 */
export function getPhaseContraindications(
  procedure: string,
  daysSinceSurgery: number
): string[] {
  const protocol = getProtocol(procedure);
  if (!protocol) return [];

  const currentPhase = getCurrentPhase(procedure, daysSinceSurgery);
  if (!currentPhase) return [];

  // Kombinera absoluta kontraindikationer med fas-specifika förbjudna rörelser
  return [
    ...protocol.absoluteContraindications,
    ...currentPhase.phaseData.forbiddenMovements
  ];
}

/**
 * Hämta fas-restriktioner formaterade för AI-prompt
 */
export function getPhaseRestrictionsForPrompt(
  procedure: string,
  daysSinceSurgery: number
): string {
  const protocol = getProtocol(procedure);
  if (!protocol) {
    return `Okänd operation: ${procedure}. Använd generella försiktighetsåtgärder för postoperativ rehabilitering.`;
  }

  const currentPhase = getCurrentPhase(procedure, daysSinceSurgery);
  if (!currentPhase) {
    return `Kunde inte beräkna fas för ${procedure}.`;
  }

  const { phase, phaseData } = currentPhase;

  return `
OPERATION: ${protocol.name}
DAGAR SEDAN OPERATION: ${daysSinceSurgery}
NUVARANDE FAS: Fas ${phase} (${phaseData.weeks})

AKTIVA RESTRIKTIONER:
${phaseData.restrictions.map(r => `  - ${r.replace(/_/g, ' ')}`).join('\n')}

TILLÅTNA RÖRELSER:
${phaseData.allowedMovements.map(m => `  ✓ ${m.replace(/_/g, ' ')}`).join('\n')}

FÖRBJUDNA RÖRELSER (FARLIGT):
${phaseData.forbiddenMovements.map(m => `  ✗ ${m.replace(/_/g, ' ')}`).join('\n')}

ABSOLUTA KONTRAINDIKATIONER (ALDRIG):
${protocol.absoluteContraindications.map(c => `  ⛔ ${c.replace(/_/g, ' ')}`).join('\n')}

MÅL FÖR FASEN:
${phaseData.goals.map(g => `  • ${g}`).join('\n')}

FÖRSIKTIGHETSÅTGÄRDER:
${phaseData.precautions.map(p => `  ⚠️ ${p}`).join('\n')}

KRÄVER FYSIOTERAPEUTÖVERVAKNING: ${protocol.requiresSupervision[`phase${phase}` as keyof typeof protocol.requiresSupervision] ? 'JA' : 'NEJ'}

VIKTBÄRING: ${protocol.weightBearingProgression[`phase${phase}` as keyof typeof protocol.weightBearingProgression]}

RÖDA FLAGGOR (Kontakta vården omedelbart vid):
${protocol.redFlags.map(r => `  🚨 ${r}`).join('\n')}
`.trim();
}

/**
 * Kontrollera om en övning är säker baserat på protokoll
 */
export function isExerciseSafe(
  exerciseName: string,
  exerciseKeywords: string[],
  procedure: string,
  daysSinceSurgery: number
): { safe: boolean; reason?: string } {
  const protocol = getProtocol(procedure);
  if (!protocol) {
    return { safe: true }; // Om inget protokoll finns, tillåt med varning
  }

  const contraindications = getPhaseContraindications(procedure, daysSinceSurgery);
  const nameLower = exerciseName.toLowerCase();
  const keywordsLower = exerciseKeywords.map(k => k.toLowerCase());

  // Kolla absoluta kontraindikationer
  for (const contra of protocol.absoluteContraindications) {
    const contraLower = contra.toLowerCase();
    if (nameLower.includes(contraLower) || keywordsLower.some(k => k.includes(contraLower))) {
      return {
        safe: false,
        reason: `Kontraindicerad övning: ${contra} efter ${protocol.name}`
      };
    }
  }

  // Kolla exkluderade nyckelord
  for (const keyword of protocol.excludeKeywords) {
    if (nameLower.includes(keyword) || keywordsLower.includes(keyword)) {
      return {
        safe: false,
        reason: `Övningen innehåller förbjudet nyckelord: ${keyword}`
      };
    }
  }

  // Kolla fas-specifika förbjudna rörelser
  const currentPhase = getCurrentPhase(procedure, daysSinceSurgery);
  if (currentPhase) {
    for (const forbidden of currentPhase.phaseData.forbiddenMovements) {
      const forbiddenLower = forbidden.toLowerCase();
      if (nameLower.includes(forbiddenLower) || keywordsLower.some(k => k.includes(forbiddenLower))) {
        return {
          safe: false,
          reason: `Förbjuden rörelse i fas ${currentPhase.phase}: ${forbidden}`
        };
      }
    }
  }

  return { safe: true };
}

/**
 * Hämta lista över alla tillgängliga protokoll
 */
export function getAvailableProcedures(): string[] {
  const uniqueProtocols = new Set<string>();
  for (const protocol of Object.values(POST_OP_PROTOCOLS)) {
    uniqueProtocols.add(protocol.name);
  }
  return Array.from(uniqueProtocols);
}

/**
 * Formatera viktbäringsrekommendation
 */
export function getWeightBearingAdvice(
  procedure: string,
  daysSinceSurgery: number
): string {
  const protocol = getProtocol(procedure);
  if (!protocol) return 'Följ kirurgens instruktioner angående belastning.';

  const currentPhase = getCurrentPhase(procedure, daysSinceSurgery);
  if (!currentPhase) return 'Följ kirurgens instruktioner angående belastning.';

  const phaseKey = `phase${currentPhase.phase}` as keyof typeof protocol.weightBearingProgression;
  const weightBearing = protocol.weightBearingProgression[phaseKey];

  switch (weightBearing) {
    case 'Avlastad':
      return 'AVLASTAD: Använd gånghjälpmedel. Ingen belastning på opererad led/extremitet.';
    case 'Partiell':
      return 'PARTIELL BELASTNING: Gradvis ökad belastning enligt tolerans. Använd gånghjälpmedel vid behov.';
    case 'Fullt':
      return 'FULL BELASTNING: Normal belastning tillåten. Lyssna på kroppens signaler.';
    default:
      return 'Följ kirurgens instruktioner angående belastning.';
  }
}
