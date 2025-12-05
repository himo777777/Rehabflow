/**
 * Return-to-Sport (RTS) Protocols
 *
 * Strukturerade RTS-kriterier per skadetyp baserat på:
 * - Ardern CL et al. 2016 - RTS consensus statement
 * - van Melick N et al. 2016 - ACL RTS criteria
 * - Blanch P & Gabbett TJ 2016 - Training load monitoring
 *
 * Functional Movement Assessment Battery ingår.
 */

export interface RTSCriterion {
  id: string;
  category: 'strength' | 'function' | 'sport_specific' | 'psychological' | 'clearance';
  name: string;
  description: string;
  testMethod: string;
  passCriteria: string;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  limbSymmetryRequired?: boolean;
  evidenceLevel: 'A' | 'B' | 'C';
  source: string;
}

export interface RTSPhase {
  phase: number;
  name: string;
  duration: string;
  focus: string;
  criteria: RTSCriterion[];
  progressionTriggers: string[];
}

export interface RTSProtocol {
  injuryType: string;
  sport?: string;
  typicalTimeline: string;
  phases: RTSPhase[];
  finalClearanceCriteria: RTSCriterion[];
  redFlags: string[];
  sources: string[];
}

// ============================================
// FUNCTIONAL MOVEMENT TESTS
// ============================================

export const FUNCTIONAL_TESTS: RTSCriterion[] = [
  {
    id: 'single_leg_squat',
    category: 'function',
    name: 'Single Leg Squat',
    description: 'Bedömer knäkontroll och höftstyrka',
    testMethod: 'Stå på ett ben, böj knät till 60 grader, håll 3 sekunder',
    passCriteria: 'God kontroll utan valgus-kollaps, >90% symmetri',
    limbSymmetryRequired: true,
    evidenceLevel: 'B',
    source: 'Crossley KM et al. 2011'
  },
  {
    id: 'single_leg_hop',
    category: 'function',
    name: 'Single Leg Hop for Distance',
    description: 'Hopplängd på ett ben',
    testMethod: 'Hoppa så långt som möjligt på ett ben, landa kontrollerat',
    passCriteria: 'Limb Symmetry Index (LSI) >90%',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'A',
    source: 'Noyes FR et al. 1991'
  },
  {
    id: 'triple_hop',
    category: 'function',
    name: 'Triple Hop for Distance',
    description: 'Tre hopp i följd på ett ben',
    testMethod: 'Utför tre konsekutiva hopp på ett ben, mät total distans',
    passCriteria: 'LSI >90%',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'A',
    source: 'Noyes FR et al. 1991'
  },
  {
    id: 'crossover_hop',
    category: 'function',
    name: 'Crossover Hop for Distance',
    description: 'Sidledes hopp över linje',
    testMethod: 'Hoppa fram och korsa mittlinjen tre gånger på ett ben',
    passCriteria: 'LSI >90%',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'A',
    source: 'Noyes FR et al. 1991'
  },
  {
    id: 'timed_hop',
    category: 'function',
    name: '6m Timed Hop',
    description: 'Tidstest för hopp',
    testMethod: 'Hoppa 6 meter så snabbt som möjligt på ett ben',
    passCriteria: 'LSI >90%',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'A',
    source: 'Noyes FR et al. 1991'
  },
  {
    id: 'y_balance',
    category: 'function',
    name: 'Y-Balance Test',
    description: 'Dynamisk balans i tre riktningar',
    testMethod: 'Stående på ett ben, nå så långt som möjligt i tre riktningar',
    passCriteria: 'Asymmetri <4 cm, composite score >94% av benlängd',
    limbSymmetryRequired: true,
    evidenceLevel: 'B',
    source: 'Plisky PJ et al. 2006'
  }
];

// ============================================
// STRENGTH TESTS
// ============================================

export const STRENGTH_TESTS: RTSCriterion[] = [
  {
    id: 'quadriceps_strength',
    category: 'strength',
    name: 'Quadriceps Strength (Isokinetic)',
    description: 'Quadriceps styrkemätning',
    testMethod: 'Isokinetic test vid 60°/s och 180°/s',
    passCriteria: 'LSI >90% vid båda hastigheterna',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'A',
    source: 'van Melick N et al. 2016'
  },
  {
    id: 'hamstring_strength',
    category: 'strength',
    name: 'Hamstring Strength',
    description: 'Hamstrings styrkemätning',
    testMethod: 'Isokinetic eller isometric hamstring test',
    passCriteria: 'LSI >90%, H/Q ratio >0.6',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'A',
    source: 'Croisier JL et al. 2008'
  },
  {
    id: 'hip_abduction',
    category: 'strength',
    name: 'Hip Abductor Strength',
    description: 'Höftabduktor styrka',
    testMethod: 'Handhållen dynamometer eller maskintest',
    passCriteria: 'LSI >90%',
    minValue: 90,
    unit: '% LSI',
    limbSymmetryRequired: true,
    evidenceLevel: 'B',
    source: 'Khayambashi K et al. 2016'
  },
  {
    id: 'calf_strength',
    category: 'strength',
    name: 'Calf Raise Endurance',
    description: 'Vadmuskeluthållighet',
    testMethod: 'Maximalt antal tåhävningar på ett ben',
    passCriteria: 'LSI >90%, minst 25 repetitioner',
    minValue: 25,
    unit: 'reps',
    limbSymmetryRequired: true,
    evidenceLevel: 'B',
    source: 'Silbernagel KG et al. 2010'
  }
];

// ============================================
// PSYCHOLOGICAL READINESS
// ============================================

export const PSYCHOLOGICAL_TESTS: RTSCriterion[] = [
  {
    id: 'acl_rsi',
    category: 'psychological',
    name: 'ACL-RSI Scale',
    description: 'Psykologisk beredskap för återgång',
    testMethod: 'Frågeformulär med 12 frågor',
    passCriteria: 'Score >60/100 rekommenderas',
    minValue: 60,
    maxValue: 100,
    unit: 'poäng',
    evidenceLevel: 'A',
    source: 'Webster KE et al. 2008'
  },
  {
    id: 'tsk_11',
    category: 'psychological',
    name: 'TSK-11 (Kinesiofobi)',
    description: 'Rörelserädsla-bedömning',
    testMethod: 'Tampa Scale for Kinesiophobia',
    passCriteria: 'Score <30 indikerar låg rörelserädsla',
    maxValue: 30,
    unit: 'poäng',
    evidenceLevel: 'A',
    source: 'Woby SR et al. 2005'
  }
];

// ============================================
// ACL RTS PROTOCOL
// ============================================

export const ACL_RTS_PROTOCOL: RTSProtocol = {
  injuryType: 'ACL-rekonstruktion',
  typicalTimeline: '9-12 månader',
  phases: [
    {
      phase: 1,
      name: 'Tidig rehabilitering',
      duration: '0-6 veckor',
      focus: 'Svullnadskontroll, ROM, quadriceps aktivering',
      criteria: [
        {
          id: 'rom_extension',
          category: 'function',
          name: 'Full knäextension',
          description: 'Symmetrisk knästräckning',
          testMethod: 'Goniometer mätning',
          passCriteria: '0° extension symmetriskt',
          evidenceLevel: 'A',
          source: 'van Melick N et al. 2016'
        },
        {
          id: 'rom_flexion_90',
          category: 'function',
          name: 'Knäflexion 90°',
          description: 'Böjning till 90 grader',
          testMethod: 'Goniometer mätning',
          passCriteria: '>90° flexion',
          minValue: 90,
          unit: '°',
          evidenceLevel: 'A',
          source: 'van Melick N et al. 2016'
        }
      ],
      progressionTriggers: [
        'Ingen svullnad',
        'Full extension',
        'Flexion >90°',
        'God quadriceps kontroll'
      ]
    },
    {
      phase: 2,
      name: 'Styrkeuppbyggnad',
      duration: '6-12 veckor',
      focus: 'Progressiv styrketräning, proprioception',
      criteria: [
        {
          id: 'rom_flexion_full',
          category: 'function',
          name: 'Full knäflexion',
          description: 'Symmetrisk rörlighet',
          testMethod: 'Goniometer mätning',
          passCriteria: 'Symmetrisk ROM',
          evidenceLevel: 'A',
          source: 'van Melick N et al. 2016'
        },
        {
          id: 'quad_strength_70',
          category: 'strength',
          name: 'Quadriceps styrka 70%',
          description: 'Styrka jämfört med frisk sida',
          testMethod: 'Isokinetic eller handynamometer',
          passCriteria: 'LSI >70%',
          minValue: 70,
          unit: '% LSI',
          limbSymmetryRequired: true,
          evidenceLevel: 'A',
          source: 'van Melick N et al. 2016'
        }
      ],
      progressionTriggers: [
        'Full ROM',
        'Quadriceps LSI >70%',
        'Kan gå utan hälta'
      ]
    },
    {
      phase: 3,
      name: 'Löpning & plyometri',
      duration: '12-24 veckor',
      focus: 'Löpträning, hoppövningar, agility',
      criteria: [
        ...STRENGTH_TESTS.filter(t => t.id === 'quadriceps_strength' || t.id === 'hamstring_strength'),
        ...FUNCTIONAL_TESTS.filter(t => t.id === 'single_leg_squat')
      ],
      progressionTriggers: [
        'Quadriceps LSI >80%',
        'Kan jogga utan smärta',
        'God single leg squat'
      ]
    },
    {
      phase: 4,
      name: 'Sportspecifik träning',
      duration: '24-36 veckor',
      focus: 'Sportspecifika övningar, full träning',
      criteria: [
        ...FUNCTIONAL_TESTS,
        ...STRENGTH_TESTS
      ],
      progressionTriggers: [
        'Alla hopptester LSI >90%',
        'Styrka LSI >90%',
        'Klarar sportspecifika övningar'
      ]
    }
  ],
  finalClearanceCriteria: [
    ...FUNCTIONAL_TESTS,
    ...STRENGTH_TESTS,
    ...PSYCHOLOGICAL_TESTS
  ],
  redFlags: [
    'Ökad svullnad efter aktivitet',
    'Instabilitetskänsla',
    'Plötslig smärtökning',
    'Giveway-episoder',
    'Mekaniska besvär (låsningar/upphakningar)'
  ],
  sources: [
    'van Melick N et al. 2016 - JOSPT',
    'Ardern CL et al. 2016 - BJSM',
    'Grindem H et al. 2016 - BJSM'
  ]
};

// ============================================
// ACHILLES RTS PROTOCOL
// ============================================

export const ACHILLES_RTS_PROTOCOL: RTSProtocol = {
  injuryType: 'Akillessenruptur',
  typicalTimeline: '6-12 månader',
  phases: [
    {
      phase: 1,
      name: 'Immobilisering/Tidig mobilisering',
      duration: '0-8 veckor',
      focus: 'Läkning, gradvis belastning',
      criteria: [
        {
          id: 'weight_bearing',
          category: 'function',
          name: 'Full belastning',
          description: 'Kan belasta fullt utan smärta',
          testMethod: 'Gånganalys',
          passCriteria: 'Full belastning med normal gång',
          evidenceLevel: 'A',
          source: 'Silbernagel KG et al. 2012'
        }
      ],
      progressionTriggers: [
        'Kan belasta fullt',
        'Gång utan hälta',
        'Ingen svullnad'
      ]
    },
    {
      phase: 2,
      name: 'Styrkeuppbyggnad',
      duration: '8-16 veckor',
      focus: 'Progressiv styrketräning vadmuskulatur',
      criteria: [
        {
          id: 'calf_endurance',
          category: 'strength',
          name: 'Tåhävningar',
          description: 'Vaduthållighet',
          testMethod: 'Max antal tåhävningar på ett ben',
          passCriteria: '>25 repetitioner',
          minValue: 25,
          unit: 'reps',
          evidenceLevel: 'A',
          source: 'Silbernagel KG et al. 2010'
        }
      ],
      progressionTriggers: [
        'Tåhävningar >20 reps',
        'Kan gå i trappor utan besvär'
      ]
    },
    {
      phase: 3,
      name: 'Löpning & hopp',
      duration: '16-24 veckor',
      focus: 'Plyometri, löpträning',
      criteria: [
        ...FUNCTIONAL_TESTS.filter(t =>
          t.id === 'single_leg_hop' || t.id === 'calf_strength'
        )
      ],
      progressionTriggers: [
        'Calf LSI >90%',
        'Kan jogga utan smärta',
        'Hopp LSI >85%'
      ]
    }
  ],
  finalClearanceCriteria: [
    {
      id: 'calf_lsi_final',
      category: 'strength',
      name: 'Vadstyrka symmetri',
      description: 'Tåhävningar jämfört med frisk sida',
      testMethod: 'Max antal tåhävningar på ett ben',
      passCriteria: 'LSI >90%',
      minValue: 90,
      unit: '% LSI',
      limbSymmetryRequired: true,
      evidenceLevel: 'A',
      source: 'Silbernagel KG et al. 2012'
    },
    ...FUNCTIONAL_TESTS.filter(t => t.id === 'single_leg_hop')
  ],
  redFlags: [
    'Plötslig smärta i akillessenan',
    'Ny svullnad',
    'Palpabel fördjupning i senan',
    'Smärta vid belastning'
  ],
  sources: [
    'Silbernagel KG et al. 2012 - KSSTA',
    'Willits K et al. 2010 - JBJS'
  ]
};

// ============================================
// ALL PROTOCOLS
// ============================================

export const RTS_PROTOCOLS: Record<string, RTSProtocol> = {
  'ACL-rekonstruktion': ACL_RTS_PROTOCOL,
  'Akillessenruptur': ACHILLES_RTS_PROTOCOL
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get RTS protocol by injury type
 */
export function getRTSProtocol(injuryType: string): RTSProtocol | null {
  return RTS_PROTOCOLS[injuryType] || null;
}

/**
 * Get all available injury types with RTS protocols
 */
export function getAvailableRTSProtocols(): string[] {
  return Object.keys(RTS_PROTOCOLS);
}

/**
 * Evaluate criteria completion
 */
export function evaluateCriterion(
  criterion: RTSCriterion,
  value: number,
  contralateralValue?: number
): { passed: boolean; detail: string } {
  if (criterion.limbSymmetryRequired && contralateralValue !== undefined) {
    const lsi = (value / contralateralValue) * 100;
    const passed = criterion.minValue ? lsi >= criterion.minValue : true;
    return {
      passed,
      detail: `LSI: ${Math.round(lsi)}% (mål: >${criterion.minValue}%)`
    };
  }

  if (criterion.minValue !== undefined) {
    const passed = value >= criterion.minValue;
    return {
      passed,
      detail: `${value} ${criterion.unit || ''} (mål: >${criterion.minValue})`
    };
  }

  if (criterion.maxValue !== undefined) {
    const passed = value <= criterion.maxValue;
    return {
      passed,
      detail: `${value} ${criterion.unit || ''} (mål: <${criterion.maxValue})`
    };
  }

  return { passed: false, detail: 'Kräver manuell bedömning' };
}
