/**
 * EVIDENSBASERAD DOSERINGSSERVICE
 *
 * Denna service tillhandahåller evidensbaserade rekommendationer för
 * träningsdosering (sets, reps, frekvens, intensitet) baserat på:
 *
 * - ACSM (American College of Sports Medicine) Guidelines 2021
 * - NSCA (National Strength and Conditioning Association) 2017
 * - Schoenfeld BJ et al. 2017 - Dos-respons för muskelhypertrofi
 * - Hayden JA et al. 2005 - Träning för ryggsmärta (Cochrane)
 * - Svenska Fysioterapeutförbundets riktlinjer
 *
 * Anpassar dosering baserat på:
 * - Rehabiliteringsfas (1-3)
 * - Smärtnivå
 * - Träningstyp (styrka, rörlighet, stabilitet)
 * - Patientens förutsättningar
 */

// ============================================
// INTERFACES
// ============================================

export interface DosingRecommendation {
  sets: number | string;
  reps: string;
  intensity: string;
  rpe: string;          // Rate of Perceived Exertion
  rest: string;
  frequency: string;
  duration?: string;    // För tidsbaserade övningar
  source: string;
  rationale: string;
}

export interface DosingParameters {
  phase: 1 | 2 | 3;
  exerciseType: ExerciseCategory;
  painLevel: number;        // 0-10
  activityPainLevel?: number;
  isPostOp?: boolean;
  daysSinceSurgery?: number;
  patientAge?: number;
  fitnessLevel?: 'låg' | 'medel' | 'hög';
}

export type ExerciseCategory =
  | 'styrka'
  | 'rörlighet'
  | 'stabilitet'
  | 'balans'
  | 'uthållighet'
  | 'plyometri'
  | 'stretching'
  | 'isometrisk';

export interface PhaseGuideline {
  phase: 1 | 2 | 3;
  name: string;
  goals: string[];
  generalPrinciples: string[];
  dosing: {
    [key in ExerciseCategory]?: DosingRecommendation;
  };
}

// ============================================
// EVIDENSBASERADE RIKTLINJER PER FAS
// ============================================

export const PHASE_GUIDELINES: PhaseGuideline[] = [
  {
    phase: 1,
    name: 'Skyddsfas / Smärtlindring',
    goals: [
      'Minska smärta och inflammation',
      'Skydda läkande vävnad',
      'Bibehålla rörlighet inom smärtfria gränser',
      'Aktivera muskulatur isometriskt'
    ],
    generalPrinciples: [
      'Undvik smärta under och efter övning',
      'Fokus på kontrollerade, små rörelser',
      'Isometrisk träning för muskelaktivering',
      'Frekventa, korta sessioner'
    ],
    dosing: {
      isometrisk: {
        sets: 3,
        reps: '5-10 repetitioner',
        intensity: 'Låg',
        rpe: '2-3/10',
        rest: '30-60 sekunder',
        frequency: 'Dagligen (1-2 gånger/dag)',
        duration: '5-10 sek håll',
        source: 'ACSM 2021, Rio et al. 2015',
        rationale: 'Isometrisk träning minskar smärta och aktiverar muskulatur utan att belasta läkande vävnad.'
      },
      rörlighet: {
        sets: 2,
        reps: '10-15 repetitioner',
        intensity: 'Mycket låg',
        rpe: '1-2/10',
        rest: '30 sekunder',
        frequency: 'Dagligen (2-3 gånger/dag)',
        source: 'Hayden et al. 2005, ACSM 2021',
        rationale: 'Mjuk mobilisering främjar läkning och förhindrar stelhet utan att överbelasta.'
      },
      stretching: {
        sets: 2,
        reps: '3-5 repetitioner',
        intensity: 'Mild stretch, ingen smärta',
        rpe: '2-3/10',
        rest: 'Minimal',
        frequency: 'Dagligen',
        duration: '15-30 sekunder håll',
        source: 'Page P. 2012, ACSM 2021',
        rationale: 'Försiktig stretching behåller rörlighet. Undvik intensiv stretch på skadad vävnad.'
      },
      stabilitet: {
        sets: 2,
        reps: '8-10 repetitioner',
        intensity: 'Låg',
        rpe: '2-3/10',
        rest: '30-45 sekunder',
        frequency: 'Dagligen',
        source: 'McGill SM 2007, Richardson et al. 2004',
        rationale: 'Tidig aktivering av stabiliserande muskulatur utan belastning.'
      }
    }
  },
  {
    phase: 2,
    name: 'Läkningsfas / Styrka',
    goals: [
      'Gradvis öka styrka',
      'Förbättra rörlighet och flexibilitet',
      'Utveckla motorisk kontroll',
      'Återställa normal funktion i vardagsaktiviteter'
    ],
    generalPrinciples: [
      'Progressiv belastningsökning (10-15% per vecka)',
      'Tillåt mild obehag (VAS 3-4) men inte smärta',
      'Funktionella rörelsemönster',
      'Balans mellan träning och återhämtning'
    ],
    dosing: {
      styrka: {
        sets: 3,
        reps: '8-12 repetitioner',
        intensity: 'Måttlig',
        rpe: '5-7/10',
        rest: '60-90 sekunder',
        frequency: '3 gånger/vecka',
        source: 'Schoenfeld et al. 2017, ACSM 2021',
        rationale: 'Detta repintervall optimerar muskulär uthållighet och hypertrofi med måttlig belastning.'
      },
      rörlighet: {
        sets: 2,
        reps: '10-15 repetitioner',
        intensity: 'Måttlig',
        rpe: '4-5/10',
        rest: '30 sekunder',
        frequency: 'Dagligen eller varannan dag',
        source: 'ACSM 2021',
        rationale: 'Aktiv rörlighetsträning genom full rörelseomfång för att återställa funktion.'
      },
      stabilitet: {
        sets: 3,
        reps: '10-15 repetitioner',
        intensity: 'Måttlig',
        rpe: '5-6/10',
        rest: '45-60 sekunder',
        frequency: '3-4 gånger/vecka',
        source: 'McGill SM 2007, Akuthota et al. 2008',
        rationale: 'Progressiv stabiliseringsträning för att bygga grundstyrka i core och ledstabiliserare.'
      },
      balans: {
        sets: 2,
        reps: '30-60 sekunder per position',
        intensity: 'Utmanande men säker',
        rpe: '5-6/10',
        rest: '30 sekunder',
        frequency: '3-4 gånger/vecka',
        source: 'Lesinski et al. 2015',
        rationale: 'Balansträning förbättrar proprioception och minskar skaderisk.'
      },
      stretching: {
        sets: 2,
        reps: '3-4 repetitioner',
        intensity: 'Måttlig stretch',
        rpe: '4-5/10',
        rest: 'Minimal',
        frequency: '4-5 gånger/vecka',
        duration: '30-60 sekunder håll',
        source: 'Page P. 2012, Behm et al. 2016',
        rationale: 'Längre stretchhåll för att öka flexibilitet och vävnadslängd.'
      }
    }
  },
  {
    phase: 3,
    name: 'Funktionsfas / Återgång',
    goals: [
      'Maximera styrka och kraft',
      'Sportspecifik eller arbetsspecifik träning',
      'Full funktionell kapacitet',
      'Prevention av återskada'
    ],
    generalPrinciples: [
      'Hög intensitet med god teknik',
      'Specifik träning för mål-aktivitet',
      'Periodisering av träning',
      'Underhållsträning långsiktigt'
    ],
    dosing: {
      styrka: {
        sets: '3-4',
        reps: '6-10 repetitioner',
        intensity: 'Hög',
        rpe: '7-9/10',
        rest: '2-3 minuter',
        frequency: '2-3 gånger/vecka',
        source: 'NSCA 2017, Schoenfeld et al. 2017',
        rationale: 'Tyngre belastning och längre vila för maximal styrkeökning.'
      },
      uthållighet: {
        sets: '2-3',
        reps: '15-20 repetitioner eller 60+ sekunder',
        intensity: 'Måttlig-hög',
        rpe: '6-7/10',
        rest: '30-60 sekunder',
        frequency: '3-4 gånger/vecka',
        source: 'ACSM 2021',
        rationale: 'Högre repetitionstal för muskulär uthållighet och metabolisk kondition.'
      },
      plyometri: {
        sets: '2-3',
        reps: '6-10 repetitioner',
        intensity: 'Hög',
        rpe: '7-8/10',
        rest: '2-3 minuter',
        frequency: '2 gånger/vecka',
        source: 'NSCA 2017, Davies et al. 2015',
        rationale: 'Plyometrisk träning för kraftutveckling. Kräver god grundstyrka först.'
      },
      balans: {
        sets: '2-3',
        reps: '30-60 sekunder dynamiska övningar',
        intensity: 'Utmanande',
        rpe: '6-7/10',
        rest: '30-45 sekunder',
        frequency: '3 gånger/vecka',
        source: 'Lesinski et al. 2015',
        rationale: 'Dynamisk balansträning med perturbationer för sportspecifik proprioception.'
      },
      stabilitet: {
        sets: 3,
        reps: '10-15 repetitioner med extern belastning',
        intensity: 'Hög',
        rpe: '6-8/10',
        rest: '60 sekunder',
        frequency: '3 gånger/vecka',
        source: 'McGill SM 2007',
        rationale: 'Avancerad stabilisering med ökad belastning för funktionell styrka.'
      }
    }
  }
];

// ============================================
// SMÄRTBASERADE MODIFIERINGAR
// ============================================

/**
 * Modifiera dosering baserat på smärtnivå
 */
export function adjustForPain(
  baseDosing: DosingRecommendation,
  painLevel: number
): DosingRecommendation {
  const adjusted = { ...baseDosing };

  if (painLevel >= 7) {
    // Hög smärta: Kraftig reduktion
    adjusted.sets = typeof adjusted.sets === 'number' ? Math.max(1, adjusted.sets - 1) : '1-2';
    adjusted.rpe = '1-2/10';
    adjusted.intensity = 'Minimal';
    adjusted.rationale += ' ANPASSAD för hög smärta: Fokus på smärtfri rörelse.';
  } else if (painLevel >= 5) {
    // Måttlig smärta: Viss reduktion
    adjusted.rpe = reducePREByOne(adjusted.rpe);
    adjusted.intensity = adjustIntensityDown(adjusted.intensity);
    adjusted.rationale += ' ANPASSAD för måttlig smärta.';
  }
  // painLevel < 5: Ingen anpassning behövs

  return adjusted;
}

function reducePREByOne(rpe: string): string {
  // Konvertera "5-7/10" till "4-6/10"
  const match = rpe.match(/(\d+)-(\d+)\/10/);
  if (match) {
    const low = Math.max(1, parseInt(match[1]) - 1);
    const high = Math.max(2, parseInt(match[2]) - 1);
    return `${low}-${high}/10`;
  }
  return rpe;
}

function adjustIntensityDown(intensity: string): string {
  const levels = ['Minimal', 'Mycket låg', 'Låg', 'Måttlig', 'Hög'];
  const current = levels.findIndex(l => intensity.toLowerCase().includes(l.toLowerCase()));
  if (current > 0) {
    return levels[current - 1];
  }
  return intensity;
}

// ============================================
// POSTOPERATIVA MODIFIERINGAR
// ============================================

/**
 * Modifiera dosering för postoperativa patienter
 */
export function adjustForPostOp(
  baseDosing: DosingRecommendation,
  daysSinceSurgery: number
): DosingRecommendation {
  const adjusted = { ...baseDosing };

  if (daysSinceSurgery < 14) {
    // Första 2 veckorna: Extremt försiktig
    adjusted.sets = 2;
    adjusted.reps = '5-8 repetitioner';
    adjusted.rpe = '1-2/10';
    adjusted.intensity = 'Minimal';
    adjusted.frequency = 'Dagligen, korta sessioner';
    adjusted.rationale = `POSTOP dag ${daysSinceSurgery}: Skyddsfas. Endast godkända övningar enligt protokoll.`;
  } else if (daysSinceSurgery < 42) {
    // 2-6 veckor: Försiktig progression
    adjusted.sets = typeof adjusted.sets === 'number' ? Math.max(2, adjusted.sets) : 2;
    adjusted.rpe = '2-4/10';
    adjusted.intensity = 'Låg';
    adjusted.rationale = `POSTOP dag ${daysSinceSurgery}: Läkningsfas. Gradvis ökad aktivitet.`;
  } else if (daysSinceSurgery < 84) {
    // 6-12 veckor: Moderat aktivitet
    adjusted.rpe = '4-6/10';
    adjusted.intensity = 'Måttlig';
    adjusted.rationale = `POSTOP dag ${daysSinceSurgery}: Rehabiliteringsfas. Progressiv belastning.`;
  }
  // > 12 veckor: Standarddosering kan användas

  return adjusted;
}

// ============================================
// ÅLDERSBASERADE MODIFIERINGAR
// ============================================

/**
 * Modifiera dosering för äldre patienter
 */
export function adjustForAge(
  baseDosing: DosingRecommendation,
  age: number
): DosingRecommendation {
  const adjusted = { ...baseDosing };

  if (age >= 65) {
    // Seniorer: Längre vila, lägre intensitet
    adjusted.rest = increaseRest(adjusted.rest);
    adjusted.frequency = reduceFrequency(adjusted.frequency);

    if (age >= 75) {
      adjusted.rpe = reducePREByOne(adjusted.rpe);
      adjusted.rationale += ' ANPASSAD för äldre patient: Fokus på säkerhet och fallprevention.';
    }
  }

  return adjusted;
}

function increaseRest(rest: string): string {
  const match = rest.match(/(\d+)-?(\d+)?\s*(sekunder|minuter)/);
  if (match) {
    const low = parseInt(match[1]);
    const high = match[2] ? parseInt(match[2]) : low;
    const unit = match[3];

    const newLow = Math.round(low * 1.5);
    const newHigh = Math.round(high * 1.5);

    return `${newLow}-${newHigh} ${unit}`;
  }
  return rest;
}

function reduceFrequency(frequency: string): string {
  if (frequency.includes('Dagligen')) {
    return 'Varannan dag';
  }
  if (frequency.includes('4-5')) {
    return '3-4 gånger/vecka';
  }
  if (frequency.includes('3-4') || frequency.includes('3 gånger')) {
    return '2-3 gånger/vecka';
  }
  return frequency;
}

// ============================================
// HUVUDFUNKTION
// ============================================

/**
 * Hämta evidensbaserad doseringsrekommendation
 */
export function getDosingRecommendation(params: DosingParameters): DosingRecommendation {
  const { phase, exerciseType, painLevel, isPostOp, daysSinceSurgery, patientAge } = params;

  // Hämta basdosering för fas och övningstyp
  const phaseGuideline = PHASE_GUIDELINES.find(p => p.phase === phase);
  if (!phaseGuideline) {
    throw new Error(`Ogiltig fas: ${phase}`);
  }

  let dosing = phaseGuideline.dosing[exerciseType];

  if (!dosing) {
    // Fallback till närmaste övningstyp
    const fallbacks: Record<ExerciseCategory, ExerciseCategory> = {
      styrka: 'stabilitet',
      rörlighet: 'stretching',
      stabilitet: 'isometrisk',
      balans: 'stabilitet',
      uthållighet: 'styrka',
      plyometri: 'styrka',
      stretching: 'rörlighet',
      isometrisk: 'stabilitet'
    };

    dosing = phaseGuideline.dosing[fallbacks[exerciseType]];
  }

  if (!dosing) {
    // Sista utväg: generisk dosering
    dosing = {
      sets: 2,
      reps: '10-12 repetitioner',
      intensity: 'Låg',
      rpe: '3-5/10',
      rest: '60 sekunder',
      frequency: '3 gånger/vecka',
      source: 'ACSM 2021 (generell)',
      rationale: 'Generell träningsdosering då specifik inte finns.'
    };
  }

  // Kopiera för modifiering
  let adjustedDosing = { ...dosing };

  // Applicera modifieringar i ordning
  if (painLevel >= 5) {
    adjustedDosing = adjustForPain(adjustedDosing, painLevel);
  }

  if (isPostOp && daysSinceSurgery !== undefined) {
    adjustedDosing = adjustForPostOp(adjustedDosing, daysSinceSurgery);
  }

  if (patientAge && patientAge >= 65) {
    adjustedDosing = adjustForAge(adjustedDosing, patientAge);
  }

  return adjustedDosing;
}

/**
 * Hämta alla doseringsrekommendationer för en fas
 */
export function getAllDosingForPhase(phase: 1 | 2 | 3): PhaseGuideline | null {
  return PHASE_GUIDELINES.find(p => p.phase === phase) || null;
}

/**
 * Formatera dosering som läsbar text
 */
export function formatDosing(dosing: DosingRecommendation): string {
  const parts = [];

  parts.push(`**Sets:** ${dosing.sets}`);
  parts.push(`**Repetitioner:** ${dosing.reps}`);
  if (dosing.duration) {
    parts.push(`**Tid:** ${dosing.duration}`);
  }
  parts.push(`**Intensitet:** ${dosing.intensity} (RPE ${dosing.rpe})`);
  parts.push(`**Vila:** ${dosing.rest}`);
  parts.push(`**Frekvens:** ${dosing.frequency}`);
  parts.push(`\n_Källa: ${dosing.source}_`);

  return parts.join('\n');
}

/**
 * Generera doseringstext för AI-prompt
 */
export function generateDosingPrompt(params: DosingParameters): string {
  const dosing = getDosingRecommendation(params);
  const phaseGuideline = PHASE_GUIDELINES.find(p => p.phase === params.phase);

  return `
EVIDENSBASERAD DOSERING (Fas ${params.phase}: ${phaseGuideline?.name}):

Övningstyp: ${params.exerciseType}
- Sets: ${dosing.sets}
- Reps: ${dosing.reps}
${dosing.duration ? `- Tid: ${dosing.duration}` : ''}
- Intensitet: ${dosing.intensity}
- RPE (upplevd ansträngning): ${dosing.rpe}
- Vila: ${dosing.rest}
- Frekvens: ${dosing.frequency}

Evidenskälla: ${dosing.source}

Motivation: ${dosing.rationale}

MÅL FÖR FASEN:
${phaseGuideline?.goals.map(g => `- ${g}`).join('\n')}
`.trim();
}

// All exports are inline with their declarations above
