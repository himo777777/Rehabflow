/**
 * PREVENTIONSPROGRAM - Skadeförebyggande program
 *
 * Innehåller evidensbaserade preventionsprogram för olika idrotter och målgrupper.
 * Baserat på källor från Excel-filen: rehab_och_preventionsprogram_kallor.xlsx
 *
 * Program:
 * - FIFA 11+ (Fotboll)
 * - Axelkontroll (Handboll)
 * - Throwers Ten (Kastidrottare)
 * - Shoulder Control (Nordisk lagidrott)
 * - Knee Control Plus (Knäprevention)
 */

import { BodyArea, ExerciseType, EvidenceLevel } from '../../types';

// ============================================
// PREVENTION PROTOCOL INTERFACE
// ============================================

export interface PreventionProtocol {
  id: string;
  name: string;
  englishName: string;
  programType: 'prevention' | 'sports_prevention' | 'injury_prevention';
  targetSport?: string;
  bodyAreas: BodyArea[];
  targetPopulation: string;
  description: string;
  frequency: string;
  sessionDuration: number; // minuter

  // Programkomponenter
  warmupExercises: string[];
  coreExercises: string[];
  strengthExercises: string[];
  balanceExercises: string[];
  plyometricExercises?: string[];
  sportSpecificExercises?: string[];

  // Evidens
  evidenceLevel: EvidenceLevel;
  riskReduction?: string;
  keyStudies?: string[];
  sources: string[];

  // Metadata
  origin: string;
  yearIntroduced?: number;
  website?: string;
}

// ============================================
// FIFA 11+ - FOTBOLLSPROGRAM
// ============================================

export const FIFA_11_PLUS: PreventionProtocol = {
  id: 'fifa_11_plus',
  name: 'FIFA 11+ Skadeförebyggande program',
  englishName: 'FIFA 11+ Injury Prevention Program',
  programType: 'sports_prevention',
  targetSport: 'fotboll',
  bodyAreas: ['knä', 'höft', 'fotled', 'bål', 'underkropp'],
  targetPopulation: 'Fotbollsspelare från yngre tonår och uppåt, alla nivåer',
  description: 'FIFA:s evidensbaserade uppvärmningsprogram som reducerar skador med upp till 30-50%. Programmet består av löpningar, styrka, balans och hopp och tar cirka 20 minuter att genomföra.',
  frequency: 'Varje träning som uppvärmning (2-3 gånger/vecka)',
  sessionDuration: 20,

  warmupExercises: [
    'Jogging rakt fram',
    'Jogging med höftcirklar',
    'Jogging med inåtrotation',
    'Jogging med utåtrotation',
    'Jogging med sidosteg',
    'Jogging med korssteg',
    'Jogging bakåt'
  ],
  coreExercises: [
    'Planka framåt',
    'Sidoplanka',
    'Planka med benlyft',
    'Nordisk hamstring curl'
  ],
  strengthExercises: [
    'Enbensknäböj',
    'Hamstring excentrisk (Nordics)',
    'Höftlyft på ett ben',
    'Knäböj med hopp'
  ],
  balanceExercises: [
    'Enbensbalans med bollkast',
    'Enbensbalans med partner push',
    'Enbensbalans med huvudning'
  ],
  plyometricExercises: [
    'Vertikalhopp',
    'Laterala hopp',
    'Box jumps',
    'Sidobyten snabba'
  ],
  sportSpecificExercises: [
    'Löpning med riktningsbyten',
    'Sprint med bromsning',
    'Bounding runs'
  ],

  evidenceLevel: 'A',
  riskReduction: '30-50% reducerad skaderisk i nedre extremitet, upp till 50% reducerad ACL-skaderisk',
  keyStudies: [
    'Soligard et al. (2008). Comprehensive warm-up programme to prevent injuries in young female footballers. BMJ.',
    'Thorborg et al. (2017). Effect of specific exercise-based football injury prevention programmes. BJSM.',
    'Silvers-Granelli et al. (2015). Efficacy of the FIFA 11+ Injury Prevention Program. Am J Sports Med.'
  ],
  sources: ['int_fifa_001', 'int_fifa_002'],

  origin: 'FIFA Medical Network, Schweiz',
  yearIntroduced: 2006,
  website: 'https://www.fifa.com/medical'
};

// ============================================
// AXELKONTROLL - HANDBOLLSPROGRAM
// ============================================

export const AXELKONTROLL: PreventionProtocol = {
  id: 'axelkontroll',
  name: 'Axelkontroll - Skadeförebyggande axelprogram för handboll',
  englishName: 'Axelkontroll - Shoulder Control Program for Handball',
  programType: 'sports_prevention',
  targetSport: 'handboll',
  bodyAreas: ['axel', 'övre_rygg', 'bål'],
  targetPopulation: 'Ungdom och junior, främst handbollsspelare',
  description: 'Svenskt skadeförebyggande axelprogram med övningar för bål, skuldra och axel samt stegrad kastbelastning. Utvecklat av Svenska Handbollsförbundet i samarbete med forskare.',
  frequency: '2-3 gånger per vecka',
  sessionDuration: 15,

  warmupExercises: [
    'Armcirklar framåt',
    'Armcirklar bakåt',
    'Axelrörelser med gummiband',
    'Överkroppsrotation'
  ],
  coreExercises: [
    'Planka med armlyft',
    'Sidoplanka med rotation',
    'Dead bug',
    'Bird dog'
  ],
  strengthExercises: [
    'External rotation med gummiband',
    'Internal rotation med gummiband',
    'Roddrörelse med gummiband',
    'Push-up plus (scapular)',
    'Y-T-W övningar',
    'Prone I-Y-T raises'
  ],
  balanceExercises: [
    'Proprioception axel med boll mot vägg',
    'Instabil yta med bålarbete'
  ],
  sportSpecificExercises: [
    'Stegrad kastbelastning - nivå 1 (lätt)',
    'Stegrad kastbelastning - nivå 2 (medel)',
    'Stegrad kastbelastning - nivå 3 (full)',
    'Deceleration träning (bromsmoment)'
  ],

  evidenceLevel: 'B',
  riskReduction: 'Signifikant reducerad axelskaderisk i randomiserad studie',
  keyStudies: [
    'Andersson et al. (2017). Preventing shoulder injuries in throwing athletes. BJSM.',
    'Svenska Handbollsförbundet. Axelkontroll - Forskningsbaserat preventionsprogram.'
  ],
  sources: ['swe_axelkontroll_001'],

  origin: 'Svenska Handbollsförbundet & Oslo Sports Trauma Research Center',
  yearIntroduced: 2016,
  website: 'https://www.handballresearchgroup.com/axelkontroll'
};

// ============================================
// THROWERS TEN - KASTIDROTTARE
// ============================================

export const THROWERS_TEN: PreventionProtocol = {
  id: 'throwers_ten',
  name: 'Throwers Ten - Axelprogram för kastidrottare',
  englishName: 'Throwers Ten Exercise Program',
  programType: 'sports_prevention',
  targetSport: 'kastidrottare',
  bodyAreas: ['axel', 'armbåge', 'handled', 'övre_rygg'],
  targetPopulation: 'Kastidrottare (baseboll, handboll, tennis, volleyboll)',
  description: 'Standardiserat övningsprogram för skuldermuskulatur och rotatorcuff med syfte att minska skaderisk hos kastidrottare. Utvecklat av American Sports Medicine Institute.',
  frequency: '3-4 gånger per vecka',
  sessionDuration: 25,

  warmupExercises: [
    'Lätt jogging',
    'Armcirklar',
    'Cross-body stretch',
    'Sleeper stretch'
  ],
  coreExercises: [
    'Diagonal patterns (D1/D2)',
    'Trunk rotation med gummiband',
    'Medicine ball throws'
  ],
  strengthExercises: [
    '1. Diagonal pattern D2 extension',
    '2. Diagonal pattern D2 flexion',
    '3. External rotation vid sidan',
    '4. Internal rotation vid sidan',
    '5. External rotation 90/90 position',
    '6. Internal rotation 90/90 position',
    '7. Shoulder abduction till 90°',
    '8. Scaption (tom burk övning)',
    '9. Prone horizontal abduction',
    '10. Prone rowing',
    'Biceps curls',
    'Triceps extensions',
    'Wrist flexion/extension'
  ],
  balanceExercises: [
    'Plyometric push-ups',
    'Ball dribbling mot vägg'
  ],
  plyometricExercises: [
    '90/90 plyometric throws',
    'Deceleration catches',
    'Medicine ball chest pass'
  ],

  evidenceLevel: 'B',
  riskReduction: 'Stärker rotatorcuff och scapulastabilisatorer, förbättrar kastmeknik',
  keyStudies: [
    'Wilk et al. (2002). Rehabilitation and Return to Play After Shoulder Injury. AJSM.',
    'Reinold et al. (2010). Throwers Ten Exercise Program. JOSPT.'
  ],
  sources: ['int_throwers_001'],

  origin: 'American Sports Medicine Institute, USA',
  yearIntroduced: 1991,
  website: 'https://www.asmi.org'
};

// ============================================
// SHOULDER CONTROL - NORDISK LAGIDROTT
// ============================================

export const SHOULDER_CONTROL: PreventionProtocol = {
  id: 'shoulder_control',
  name: 'Shoulder Control - Nordiskt skadeförebyggande program',
  englishName: 'Shoulder Control Program',
  programType: 'sports_prevention',
  targetSport: 'lagidrott_kastare',
  bodyAreas: ['axel', 'övre_rygg', 'bål'],
  targetPopulation: 'Ungdomselit handboll och andra lagidrottare med kastmoment',
  description: 'Nordiskt skadeförebyggande program med specifika övningar för skuldra. Randomiserad studie på svenska elithandbollsspelare visar signifikant reducerad skaderisk.',
  frequency: '2-3 gånger per vecka som del av uppvärmning',
  sessionDuration: 15,

  warmupExercises: [
    'Dynamisk stretch axel',
    'Armsvingar',
    'Skulderbladsrörelser'
  ],
  coreExercises: [
    'Planka variationer',
    'Rotationsstabilitet',
    'Anti-rotation övningar'
  ],
  strengthExercises: [
    'Extern rotation liggande',
    'Push-up plus',
    'Serratus anterior övningar',
    'Lower trapezius stärkning',
    'Scapular setting',
    'Wall slides'
  ],
  balanceExercises: [
    'Quadruped med armlyft',
    'Turkish get-up (modifierad)'
  ],
  sportSpecificExercises: [
    'Kontrollerad kastprogression',
    'Decelerationsövningar'
  ],

  evidenceLevel: 'B',
  riskReduction: 'Signifikant reducerad axelskaderisk enligt randomiserad kontrollerad studie',
  keyStudies: [
    'Andersson et al. (2017). Preventing overuse shoulder injuries. Sports Medicine.',
    'Møller et al. (2017). The Shoulder Control study. BJSM.'
  ],
  sources: ['swe_shoulder_control_001'],

  origin: 'Oslo Sports Trauma Research Center & Svenska Handbollsförbundet',
  yearIntroduced: 2015,
  website: 'https://www.handballresearchgroup.com'
};

// ============================================
// KNÄKONTROLL PLUS - UTÖKAT KNÄPROGRAM
// ============================================

export const KNAKONTROLL_PLUS: PreventionProtocol = {
  id: 'knakontroll_plus',
  name: 'Knäkontroll Plus - Utökat knäpreventionsprogram',
  englishName: 'Knee Control Plus Program',
  programType: 'sports_prevention',
  targetSport: 'lagidrott',
  bodyAreas: ['knä', 'höft', 'fotled', 'bål'],
  targetPopulation: 'Ungdom och senior inom lagidrotter (fotboll, handboll, innebandy)',
  description: 'Utökat neuromuskulärt träningsprogram baserat på Knäkontroll som används som uppvärmning. Minskar risken för främre korsbandsskador och andra knäskador.',
  frequency: 'Varje träning som uppvärmning',
  sessionDuration: 20,

  warmupExercises: [
    'Jogging rakt',
    'Jogging med knälyft',
    'Jogging med hälspark',
    'Sidoförflyttning',
    'Korssteg'
  ],
  coreExercises: [
    'Planka med variationer',
    'Sidoplanka',
    'Bäckenlyft',
    'Single leg bridge'
  ],
  strengthExercises: [
    'Knäböj',
    'Utfallssteg',
    'Enbensknäböj (pistol squat progression)',
    'Rumänsk marklyft',
    'Step-ups',
    'Nordic hamstring curl'
  ],
  balanceExercises: [
    'Enbensbalans - statisk',
    'Enbensbalans med rörelse',
    'Enbensbalans med störning',
    'Balansplatta/kudde'
  ],
  plyometricExercises: [
    'Hoppsquat',
    'Laterala hopp',
    'Single leg hop',
    'Box drops med landning',
    'Riktningsbyten'
  ],

  evidenceLevel: 'A',
  riskReduction: '50-80% reducerad ACL-skaderisk enligt meta-analyser',
  keyStudies: [
    'Walden et al. (2012). Prevention of acute knee injuries in adolescent female footballers. BJSM.',
    'Achenbach et al. (2022). Neuromuscular training for ACL injury prevention. KSSTA.'
  ],
  sources: ['swe_knakontroll_001', 'swe_knakontroll_002'],

  origin: 'Svenska Fotbollförbundet',
  yearIntroduced: 2010,
  website: 'https://www.svenskfotboll.se/svff/spelklar/knakontroll'
};

// ============================================
// EXPORT - ALLA PREVENTIONSPROGRAM
// ============================================

export const PREVENTION_PROTOCOLS: PreventionProtocol[] = [
  FIFA_11_PLUS,
  AXELKONTROLL,
  THROWERS_TEN,
  SHOULDER_CONTROL,
  KNAKONTROLL_PLUS
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Hämta preventionsprogram baserat på sport
 */
export function getPreventionProtocolBySport(sport: string): PreventionProtocol | undefined {
  const sportLower = sport.toLowerCase();

  if (sportLower.includes('fotboll') || sportLower.includes('soccer') || sportLower.includes('football')) {
    return FIFA_11_PLUS;
  }
  if (sportLower.includes('handboll') || sportLower.includes('handball')) {
    return AXELKONTROLL;
  }
  if (sportLower.includes('baseboll') || sportLower.includes('baseball') ||
      sportLower.includes('kast') || sportLower.includes('throw')) {
    return THROWERS_TEN;
  }
  if (sportLower.includes('innebandy') || sportLower.includes('floorball')) {
    return KNAKONTROLL_PLUS;
  }

  return undefined;
}

/**
 * Hämta preventionsprogram baserat på kroppsdel
 */
export function getPreventionProtocolsByBodyArea(bodyArea: BodyArea): PreventionProtocol[] {
  return PREVENTION_PROTOCOLS.filter(p => p.bodyAreas.includes(bodyArea));
}

/**
 * Hämta alla axelpreventionsprogram
 */
export function getShoulderPreventionProtocols(): PreventionProtocol[] {
  return PREVENTION_PROTOCOLS.filter(p =>
    p.bodyAreas.includes('axel') || p.bodyAreas.includes('övre_rygg')
  );
}

/**
 * Hämta alla knäpreventionsprogram
 */
export function getKneePreventionProtocols(): PreventionProtocol[] {
  return PREVENTION_PROTOCOLS.filter(p =>
    p.bodyAreas.includes('knä') || p.bodyAreas.includes('höft')
  );
}

/**
 * Generera prompt-text för AI baserat på preventionsprogram
 */
export function generatePreventionPrompt(protocol: PreventionProtocol): string {
  return `
🏋️ PREVENTIONSPROGRAM TILLGÄNGLIGT:
Program: ${protocol.name}
Målgrupp: ${protocol.targetPopulation}
Frekvens: ${protocol.frequency}
Duration: ${protocol.sessionDuration} minuter

EVIDENS:
Nivå: ${protocol.evidenceLevel}
Effekt: ${protocol.riskReduction || 'Dokumenterad skadereduktion'}

PROGRAMKOMPONENTER:
- Uppvärmning: ${protocol.warmupExercises.slice(0, 3).join(', ')}
- Core: ${protocol.coreExercises.slice(0, 3).join(', ')}
- Styrka: ${protocol.strengthExercises.slice(0, 3).join(', ')}
- Balans: ${protocol.balanceExercises.slice(0, 2).join(', ')}
${protocol.plyometricExercises ? `- Plyometri: ${protocol.plyometricExercises.slice(0, 2).join(', ')}` : ''}

⚠️ REKOMMENDATION: Inkludera övningar från detta evidensbaserade preventionsprogram!
`.trim();
}
