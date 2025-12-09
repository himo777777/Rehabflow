/**
 * Kinetic Chain Service
 *
 * FAS 11: Kinetisk kedjeanalys för rehabilitering
 *
 * Analyserar hur dysfunktion i en led påverkar andra leder i kedjan.
 * Baserat på kliniska principer från:
 * - Janda's Upper/Lower Crossed Syndromes
 * - Myers' Anatomy Trains
 * - Sahrmann's Movement System Impairment
 *
 * Kinetiska kedjor:
 * - Nedre extremitet: fotled → knä → höft → bäcken → ländrygg
 * - Övre extremitet: hand → armbåge → axel → bröstrygg → nacke
 * - Core: bäcken ↔ ländrygg ↔ bröstrygg
 */

import { CompensationPattern, CompensationType } from './compensationDetectionService';
import { JointAngle3D } from './poseReconstruction';

// ============================================
// TYPES
// ============================================

export interface KineticChainAnalysis {
  primaryDysfunction: DysfunctionType;
  affectedChain: 'lower' | 'upper' | 'core' | 'full_body';
  compensatoryPatterns: CompensatoryPattern[];
  rootCause: RootCauseAnalysis;
  recommendations: string[];
}

export interface CompensatoryPattern {
  affectedJoint: string;
  compensationType: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  correction: string;
}

export interface RootCauseAnalysis {
  likelySource: string;
  confidence: number; // 0-1
  explanation: string;
  clinicalConsiderations: string[];
}

export type DysfunctionType =
  | 'ankle_dorsiflexion_limited'
  | 'knee_valgus'
  | 'hip_flexor_tight'
  | 'glute_weakness'
  | 'core_instability'
  | 'thoracic_hypomobility'
  | 'scapular_dyskinesis'
  | 'forward_head_posture'
  | 'none';

// ============================================
// KINETIC CHAIN RELATIONSHIPS
// ============================================

/**
 * Kinetiska kedje-samband: hur en dysfunktion påverkar andra leder
 */
const KINETIC_CHAIN_MAP: Record<DysfunctionType, {
  affectedJoints: string[];
  compensations: string[];
  rootCause: string;
}> = {
  // NEDRE EXTREMITET
  ankle_dorsiflexion_limited: {
    affectedJoints: ['knee', 'hip', 'lumbar_spine'],
    compensations: [
      'Knävalgus under squat (kompenserar för begränsad fotledsrörlighet)',
      'Höftexternal rotation (foten vänds utåt för att komma djupare)',
      'Överdrivet framåtlutande bål (trunk lean)',
      'Hälarna lyfts från golvet',
    ],
    rootCause: 'Begränsad fotleds dorsalflexion (ofta tight gastrocnemius/soleus)',
  },

  knee_valgus: {
    affectedJoints: ['hip', 'ankle', 'lumbar_spine'],
    compensations: [
      'Svag gluteus medius/maximus',
      'Tight ITB (iliotibial band)',
      'Felaktig fotplacering (pronation)',
      'Höftadduktor-dominans',
    ],
    rootCause: 'Gluteus medius-svaghet eller höftadduktor-dominans',
  },

  hip_flexor_tight: {
    affectedJoints: ['lumbar_spine', 'hip', 'thoracic_spine'],
    compensations: [
      'Anteror pelvic tilt (bäckentippning framåt)',
      'Ländrygg hyperlordos',
      'Hamstrings känns "tighta" (kompensatorisk förlängning)',
      'Svårt att aktivera gluteus vid höftextension',
    ],
    rootCause: 'Förkortad iliopsoas, ofta från långvarigt sittande',
  },

  glute_weakness: {
    affectedJoints: ['hip', 'knee', 'lumbar_spine'],
    compensations: [
      'Hamstring-dominans vid höftextension',
      'Ländrygg hyperextension vid stående höftextension',
      'Trendelenburg-gång (höften sjunker vid enbensstående)',
      'Knävalgus under belastning',
    ],
    rootCause: 'Gluteal inhibition (ofta från sittande eller skada)',
  },

  // CORE
  core_instability: {
    affectedJoints: ['lumbar_spine', 'hip', 'shoulder'],
    compensations: [
      'Ländrygg hyperextension vid armlyft',
      'Överdrivet buktryck vid lyft',
      'Axelkompensation (axelhöjning vid armrörelser)',
      'Höftflexor-överkompensation',
    ],
    rootCause: 'Svag transversus abdominis och/eller multifidus',
  },

  // ÖVRE EXTREMITET
  thoracic_hypomobility: {
    affectedJoints: ['shoulder', 'cervical_spine', 'lumbar_spine'],
    compensations: [
      'Scapular dyskinesis (felaktig skulderbladskontroll)',
      'Axelimpingement-risk (kompenserar med glenohumeral rörelse)',
      'Nackens hyperextension',
      'Ländrygg hyperlordos',
    ],
    rootCause: 'Begränsad bröstryggsrotation och extension',
  },

  scapular_dyskinesis: {
    affectedJoints: ['shoulder', 'cervical_spine'],
    compensations: [
      'Förändrad axelabduktion (vingat skulderblad)',
      'Rotatorkuffen överbelastad',
      'Axelhöjning (upper trapezius dominans)',
      'Framåtlutade axlar',
    ],
    rootCause: 'Svag serratus anterior och/eller lower trapezius',
  },

  forward_head_posture: {
    affectedJoints: ['cervical_spine', 'thoracic_spine', 'shoulder'],
    compensations: [
      'Suboccipital muskelspänning',
      'Weak deep neck flexors',
      'Bröstryggs kyfos',
      'Framåtlutade axlar',
    ],
    rootCause: 'Obalans mellan djupa nackflexorer och suboccipitala muskler',
  },

  none: {
    affectedJoints: [],
    compensations: [],
    rootCause: 'Ingen tydlig dysfunktion identifierad',
  },
};

// ============================================
// DETECTION FUNCTIONS
// ============================================

/**
 * Identifiera primär dysfunktion baserat på kompensationsmönster
 */
function identifyPrimaryDysfunction(
  compensations: CompensationPattern[],
  angles: Record<string, JointAngle3D>
): DysfunctionType {
  // Prioritetsordning baserat på klinisk betydelse
  const dysfunctionScores: Record<DysfunctionType, number> = {
    ankle_dorsiflexion_limited: 0,
    knee_valgus: 0,
    hip_flexor_tight: 0,
    glute_weakness: 0,
    core_instability: 0,
    thoracic_hypomobility: 0,
    scapular_dyskinesis: 0,
    forward_head_posture: 0,
    none: 0,
  };

  // Analysera kompensationsmönster
  for (const comp of compensations) {
    switch (comp.type) {
      case 'knee_valgus':
        dysfunctionScores.knee_valgus += comp.severity === 'severe' ? 3 : comp.severity === 'moderate' ? 2 : 1;
        dysfunctionScores.glute_weakness += comp.severity === 'severe' ? 2 : 1;
        break;

      case 'trunk_lean':
        dysfunctionScores.ankle_dorsiflexion_limited += comp.severity === 'severe' ? 2 : 1;
        dysfunctionScores.hip_flexor_tight += 1;
        dysfunctionScores.core_instability += 1;
        break;

      case 'weight_shift':
        dysfunctionScores.glute_weakness += comp.severity === 'severe' ? 2 : 1;
        dysfunctionScores.core_instability += 1;
        break;

      case 'shoulder_hike':
        dysfunctionScores.scapular_dyskinesis += comp.severity === 'severe' ? 2 : 1;
        dysfunctionScores.thoracic_hypomobility += 1;
        break;

      case 'hip_drop':
        dysfunctionScores.glute_weakness += comp.severity === 'severe' ? 3 : 2;
        break;

      case 'forward_head':
        dysfunctionScores.forward_head_posture += comp.severity === 'severe' ? 3 : 2;
        dysfunctionScores.thoracic_hypomobility += 1;
        break;

      case 'lumbar_flexion':
        dysfunctionScores.core_instability += comp.severity === 'severe' ? 2 : 1;
        dysfunctionScores.hip_flexor_tight += 1;
        break;
    }
  }

  // Analysera vinklar för ytterligare kontext
  if (angles.leftAnkle && angles.leftAnkle.angle < 15) {
    dysfunctionScores.ankle_dorsiflexion_limited += 2;
  }
  if (angles.rightAnkle && angles.rightAnkle.angle < 15) {
    dysfunctionScores.ankle_dorsiflexion_limited += 2;
  }

  // Hitta högsta poäng
  let maxScore = 0;
  let primaryDysfunction: DysfunctionType = 'none';

  for (const [dysfunction, score] of Object.entries(dysfunctionScores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryDysfunction = dysfunction as DysfunctionType;
    }
  }

  // Kräv minst 2 poäng för att identifiera dysfunktion
  if (maxScore < 2) {
    return 'none';
  }

  return primaryDysfunction;
}

/**
 * Bestäm vilken kinetisk kedja som är påverkad
 */
function determineAffectedChain(
  dysfunction: DysfunctionType,
  compensations: CompensationPattern[]
): 'lower' | 'upper' | 'core' | 'full_body' {
  const lowerKeywords = ['knee', 'hip', 'ankle', 'leg'];
  const upperKeywords = ['shoulder', 'arm', 'elbow', 'wrist'];
  const coreKeywords = ['trunk', 'spine', 'lumbar', 'thoracic'];

  let lowerScore = 0;
  let upperScore = 0;
  let coreScore = 0;

  // Baserat på dysfunktion
  switch (dysfunction) {
    case 'ankle_dorsiflexion_limited':
    case 'knee_valgus':
    case 'glute_weakness':
      lowerScore += 2;
      break;
    case 'thoracic_hypomobility':
    case 'scapular_dyskinesis':
    case 'forward_head_posture':
      upperScore += 2;
      break;
    case 'core_instability':
    case 'hip_flexor_tight':
      coreScore += 2;
      break;
  }

  // Baserat på kompensationer
  for (const comp of compensations) {
    const side = comp.side || '';
    const type = comp.type;

    if (lowerKeywords.some(k => type.includes(k) || side.includes(k))) {
      lowerScore++;
    }
    if (upperKeywords.some(k => type.includes(k) || side.includes(k))) {
      upperScore++;
    }
    if (coreKeywords.some(k => type.includes(k))) {
      coreScore++;
    }
  }

  const maxScore = Math.max(lowerScore, upperScore, coreScore);

  if (lowerScore >= 2 && upperScore >= 2) {
    return 'full_body';
  }
  if (maxScore === lowerScore) return 'lower';
  if (maxScore === upperScore) return 'upper';
  return 'core';
}

/**
 * Generera kompensationsmönster baserat på primär dysfunktion
 */
function generateCompensatoryPatterns(
  dysfunction: DysfunctionType,
  compensations: CompensationPattern[]
): CompensatoryPattern[] {
  const chainInfo = KINETIC_CHAIN_MAP[dysfunction];
  const patterns: CompensatoryPattern[] = [];

  // Lägg till kända kompensationer från kinetisk kedja
  chainInfo.compensations.forEach((comp, index) => {
    const affectedJoint = chainInfo.affectedJoints[Math.min(index, chainInfo.affectedJoints.length - 1)] || 'unknown';

    patterns.push({
      affectedJoint,
      compensationType: comp.split(' ')[0], // Första ordet
      severity: compensations.some(c => c.severity === 'severe') ? 'moderate' : 'mild',
      description: comp,
      correction: getCorrectionForPattern(dysfunction, affectedJoint),
    });
  });

  return patterns.slice(0, 4); // Max 4 mönster
}

/**
 * Hämta korrigeringsråd för ett mönster
 */
function getCorrectionForPattern(dysfunction: DysfunctionType, joint: string): string {
  const corrections: Record<string, Record<string, string>> = {
    ankle_dorsiflexion_limited: {
      knee: 'Öva fotleds dorsalflexion stretch och calf raises',
      hip: 'Förbättra fotledsrörlighet innan du fokuserar på höftrörlighet',
      lumbar_spine: 'Stärk core och förbättra fotleds ROM',
    },
    knee_valgus: {
      hip: 'Stärk gluteus medius med clamshells och side-lying leg raises',
      ankle: 'Kontrollera fotplacering och skostöd',
      lumbar_spine: 'Fokusera på höftstabilitet före ryggstabilitet',
    },
    glute_weakness: {
      hip: 'Gluteusaktivering före övningar (bridges, clamshells)',
      knee: 'Fokusera på squat med "knän utåt" cue',
      lumbar_spine: 'Undvik ländryggs-hyperextension genom gluteusaktivering',
    },
    core_instability: {
      lumbar_spine: 'Stärk transversus abdominis med dead bugs och pallof press',
      hip: 'Integrera core-aktivering i höftövningar',
      shoulder: 'Aktivera core före armrörelser',
    },
    thoracic_hypomobility: {
      shoulder: 'Öka bröstryggsrörlighet före axelövningar',
      cervical_spine: 'Fokusera på thoracic extension foam rolling',
      lumbar_spine: 'Förbättra bröstryggsrotation för att minska ländryggsbelastning',
    },
  };

  return corrections[dysfunction]?.[joint] || 'Kontakta fysioterapeut för individuell bedömning';
}

/**
 * Analysera rotorsaken till dysfunktionen
 */
function analyzeRootCause(
  dysfunction: DysfunctionType,
  compensations: CompensationPattern[]
): RootCauseAnalysis {
  const chainInfo = KINETIC_CHAIN_MAP[dysfunction];

  // Beräkna konfidens baserat på antal och svårighetsgrad av kompensationer
  let confidence = 0.5; // Baskonfidens
  const severityBonus = compensations.filter(c => c.severity === 'severe').length * 0.1;
  const countBonus = Math.min(compensations.length * 0.05, 0.2);
  confidence = Math.min(0.9, confidence + severityBonus + countBonus);

  const clinicalConsiderations = getClinicalConsiderations(dysfunction);

  return {
    likelySource: chainInfo.rootCause,
    confidence,
    explanation: getExplanation(dysfunction),
    clinicalConsiderations,
  };
}

/**
 * Generera förklaring för dysfunktionen
 */
function getExplanation(dysfunction: DysfunctionType): string {
  const explanations: Record<DysfunctionType, string> = {
    ankle_dorsiflexion_limited:
      'Begränsad fotledsrörlighet tvingar kroppen att kompensera uppåt i kedjan. Knä och höft tar över för att uppnå önskat djup.',
    knee_valgus:
      'Svag höftabduktion och/eller tight höftadduktion tillåter knät att falla inåt under belastning.',
    hip_flexor_tight:
      'Förkortade höftflexorer tippar bäckenet framåt och ökar ländryggens lordos, vilket påverkar hela posturen.',
    glute_weakness:
      'Inaktiva gluteusmuskler tvingar andra muskler att kompensera vid höftextension och stabilitet.',
    core_instability:
      'Svag djup core-muskulatur leder till överdrivet beroende av ytliga muskler och felaktig rörelsekontroll.',
    thoracic_hypomobility:
      'Begränsad bröstryggsrörlighet tvingar nacke och ländrygg att kompensera med överrörlighet.',
    scapular_dyskinesis:
      'Felaktig skulderbladskontroll påverkar axelns position och funktion.',
    forward_head_posture:
      'Framskjutet huvud överbelastar nackens muskler och påverkar bröstryggens position.',
    none:
      'Ingen tydlig dysfunktion identifierad. Rörelsemönstret ser bra ut.',
  };

  return explanations[dysfunction];
}

/**
 * Hämta kliniska överväganden
 */
function getClinicalConsiderations(dysfunction: DysfunctionType): string[] {
  const considerations: Record<DysfunctionType, string[]> = {
    ankle_dorsiflexion_limited: [
      'Kontrollera tidigare fotledsskador (stukning, fraktur)',
      'Överväg skodonspåverkan',
      'Screena för Achillestendinopati',
    ],
    knee_valgus: [
      'Ökad risk för ACL-skada',
      'Utvärdera patellofemoral smärta',
      'Kontrollera Q-vinkel',
    ],
    hip_flexor_tight: [
      'Vanligt vid stillasittande arbete',
      'Kan maskera gluteal inhibition',
      'Screena för anterior pelvic tilt',
    ],
    glute_weakness: [
      'Kan leda till hamstrings-överbelastning',
      'Korrelerar med ländryggsmärta',
      'Kontrollera Trendelenburg vid enbensstående',
    ],
    core_instability: [
      'Screena för diastasis recti',
      'Utvärdera andningsmönster',
      'Kontrollera bäckenbottenfunktion',
    ],
    thoracic_hypomobility: [
      'Vanligt vid kontorsarbete',
      'Kan bidra till nacksmärta',
      'Korrelerar med axelproblematik',
    ],
    scapular_dyskinesis: [
      'Screena för rotatorkuffpatologi',
      'Utvärdera thoracic outlet syndrom',
      'Kontrollera för axelinstabilitet',
    ],
    forward_head_posture: [
      'Screena för cervikogen huvudvärk',
      'Utvärdera syn och arbetsplatsergonomi',
      'Kan påverka temporomandibulär led',
    ],
    none: [],
  };

  return considerations[dysfunction];
}

/**
 * Generera rekommendationer baserat på analys
 */
function generateRecommendations(
  dysfunction: DysfunctionType,
  chain: 'lower' | 'upper' | 'core' | 'full_body'
): string[] {
  const recommendations: string[] = [];

  // Generella rekommendationer baserat på kedja
  switch (chain) {
    case 'lower':
      recommendations.push('Börja med fotleds- och höftrörlighet');
      recommendations.push('Inkludera gluteusaktivering i uppvärmningen');
      recommendations.push('Använd spegel eller video för squat-form');
      break;
    case 'upper':
      recommendations.push('Fokusera på bröstryggsrörlighet');
      recommendations.push('Inkludera scapulastabilisering');
      recommendations.push('Övervaka nackposition under övningar');
      break;
    case 'core':
      recommendations.push('Börja med andningsövningar (diaphragmatic breathing)');
      recommendations.push('Progreditera från statiska till dynamiska core-övningar');
      recommendations.push('Integrera core-aktivering i alla övningar');
      break;
    case 'full_body':
      recommendations.push('Helhetlig approach - börja med core');
      recommendations.push('Behandla mest symptomatiska området först');
      recommendations.push('Överväg professionell utvärdering');
      break;
  }

  // Specifika rekommendationer
  switch (dysfunction) {
    case 'ankle_dorsiflexion_limited':
      recommendations.push('Självmassage av vadmuskulatur före träning');
      recommendations.push('Använd heel elevations tillfälligt under squats');
      break;
    case 'knee_valgus':
      recommendations.push('Använd mini-band runt knäna för medvetenhet');
      recommendations.push('Cue: "Tryck ut knäna" under alla knäböjningar');
      break;
    case 'glute_weakness':
      recommendations.push('Gluteusaktivering varje dag, även vilodagar');
      recommendations.push('Hip thrusts och Romanian deadlifts prioriteras');
      break;
  }

  return recommendations;
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Analysera kinetisk kedja baserat på kompensationer och vinklar
 *
 * @param compensations - Detekterade kompensationsmönster
 * @param angles - Beräknade ledvinklar
 * @returns Fullständig kinetisk kedjeanalys
 */
export function analyzeKineticChain(
  compensations: CompensationPattern[],
  angles: Record<string, JointAngle3D>
): KineticChainAnalysis {
  // Identifiera primär dysfunktion
  const primaryDysfunction = identifyPrimaryDysfunction(compensations, angles);

  // Bestäm vilken kedja som är påverkad
  const affectedChain = determineAffectedChain(primaryDysfunction, compensations);

  // Generera kompensatoriska mönster
  const compensatoryPatterns = generateCompensatoryPatterns(primaryDysfunction, compensations);

  // Analysera rotorsak
  const rootCause = analyzeRootCause(primaryDysfunction, compensations);

  // Generera rekommendationer
  const recommendations = generateRecommendations(primaryDysfunction, affectedChain);

  return {
    primaryDysfunction,
    affectedChain,
    compensatoryPatterns,
    rootCause,
    recommendations,
  };
}

/**
 * Snabb sammanfattning för UI
 */
export function getKineticChainSummary(analysis: KineticChainAnalysis): string {
  if (analysis.primaryDysfunction === 'none') {
    return 'Bra rörelsemönster! Inga tydliga kompensationer.';
  }

  const chainNames: Record<string, string> = {
    lower: 'nedre extremitet',
    upper: 'övre extremitet',
    core: 'core/bål',
    full_body: 'hela kroppen',
  };

  return `Primär påverkan i ${chainNames[analysis.affectedChain]}: ${analysis.rootCause.likelySource}`;
}

// ============================================
// FAS 11: JOINT CONSTRAINT VALIDATION
// ============================================

/**
 * Validering av ledkombinationer för att upptäcka anatomiskt
 * omöjliga positioner (indikerar felaktig pose-detektion)
 *
 * Biomechanical principles:
 * - Coupled motions: vissa ledrörelser är kopplade
 * - Joint centration: leder har optimala positioner
 * - Anatomical constraints: fysiska begränsningar
 */

export interface JointConstraintValidation {
  isAnatomicallyPossible: boolean;
  violations: JointConstraintViolation[];
  adjustedAngles?: Record<string, number>;
  confidence: number; // 0-1, hur säker vi är på bedömningen
}

export interface JointConstraintViolation {
  type: ConstraintViolationType;
  joints: string[];
  detectedAngles: Record<string, number>;
  description: string;
  severity: 'impossible' | 'highly_unlikely' | 'unusual';
  suggestedCorrection?: string;
}

export type ConstraintViolationType =
  | 'simultaneous_extreme_extension'
  | 'shoulder_rotation_with_high_abduction'
  | 'knee_hyperextension_with_hip_flexion'
  | 'lumbar_rotation_with_extreme_flexion'
  | 'ankle_inversion_with_knee_valgus'
  | 'coupled_motion_violation'
  | 'joint_centration_violation';

/**
 * Anatomiskt omöjliga ledkombinationer
 *
 * Baserat på:
 * - Kapandji's Physiology of the Joints
 * - Neumann's Kinesiology of the Musculoskeletal System
 * - Klinisk evidens från ortopedi och fysioterapi
 */
const JOINT_CONSTRAINT_RULES: {
  id: ConstraintViolationType;
  description: string;
  check: (angles: Record<string, number>) => boolean;
  severity: 'impossible' | 'highly_unlikely' | 'unusual';
  affectedJoints: string[];
  explanation: string;
}[] = [
  // ============================================
  // NEDRE EXTREMITET
  // ============================================
  {
    id: 'simultaneous_extreme_extension',
    description: 'Simultan extrem höft-, knä- och fotledsextension',
    check: (angles) => {
      const hipExt = (angles.leftHipFlexion ?? 180) < 10 && (angles.rightHipFlexion ?? 180) < 10;
      const kneeExt = (angles.leftKnee ?? 180) > 175 && (angles.rightKnee ?? 180) > 175;
      const ankleExt = (angles.leftAnkleDorsiflexion ?? 0) < -40 && (angles.rightAnkleDorsiflexion ?? 0) < -40;
      return hipExt && kneeExt && ankleExt;
    },
    severity: 'impossible',
    affectedJoints: ['hip', 'knee', 'ankle'],
    explanation: 'Full extension i alla tre leder samtidigt är anatomiskt omöjligt på grund av muskelspänning och ledkapselbegränsningar.',
  },
  {
    id: 'knee_hyperextension_with_hip_flexion',
    description: 'Knähyperextension med djup höftflexion',
    check: (angles) => {
      const leftViolation = (angles.leftKnee ?? 180) > 185 && (angles.leftHipFlexion ?? 180) > 100;
      const rightViolation = (angles.rightKnee ?? 180) > 185 && (angles.rightHipFlexion ?? 180) > 100;
      return leftViolation || rightViolation;
    },
    severity: 'impossible',
    affectedJoints: ['knee', 'hip'],
    explanation: 'Hamstrings-musklerna förhindrar knähyperextension vid djup höftflexion.',
  },
  {
    id: 'ankle_inversion_with_knee_valgus',
    description: 'Extrem fotledsinversion med kraftig knävalgus',
    check: (angles) => {
      const leftViolation = (angles.leftAnkleInversion ?? 0) > 30 && (angles.leftKneeValgus ?? 0) > 20;
      const rightViolation = (angles.rightAnkleInversion ?? 0) > 30 && (angles.rightKneeValgus ?? 0) > 20;
      return leftViolation || rightViolation;
    },
    severity: 'highly_unlikely',
    affectedJoints: ['ankle', 'knee'],
    explanation: 'Kinetisk kedja: fotledsinversion driver normalt tibial extern rotation och knävarus, inte valgus.',
  },

  // ============================================
  // ÖVRE EXTREMITET
  // ============================================
  {
    id: 'shoulder_rotation_with_high_abduction',
    description: 'Full intern rotation med axelabduktion >120°',
    check: (angles) => {
      const leftViolation = (angles.leftShoulderAbduction ?? 0) > 120 && (angles.leftShoulderInternalRotation ?? 0) > 60;
      const rightViolation = (angles.rightShoulderAbduction ?? 0) > 120 && (angles.rightShoulderInternalRotation ?? 0) > 60;
      return leftViolation || rightViolation;
    },
    severity: 'impossible',
    affectedJoints: ['shoulder'],
    explanation: 'Vid hög abduktion vrids humerus externt automatiskt för att undvika impingement. Full IR är omöjlig.',
  },
  {
    id: 'coupled_motion_violation',
    description: 'Scapulohumeral rytm-brott',
    check: (angles) => {
      // Scapulohumeral ratio bör vara ~2:1 (glenohumeral:scapulothoracic)
      // Om abduktion >30° men ingen scapular upward rotation = violation
      const leftHighAbduction = (angles.leftShoulderAbduction ?? 0) > 60;
      const rightHighAbduction = (angles.rightShoulderAbduction ?? 0) > 60;
      const noScapularMotion = (angles.leftScapularUpwardRotation ?? 0) < 10 && (angles.rightScapularUpwardRotation ?? 0) < 10;
      return (leftHighAbduction || rightHighAbduction) && noScapularMotion;
    },
    severity: 'unusual',
    affectedJoints: ['shoulder', 'scapula'],
    explanation: 'Scapulohumeral rytm: var 3° axelabduktion kräver ~1° scapular upward rotation.',
  },

  // ============================================
  // RYGG
  // ============================================
  {
    id: 'lumbar_rotation_with_extreme_flexion',
    description: 'Lumbalrotation >30° med extrem flexion',
    check: (angles) => {
      const lumbarFlexion = angles.lumbarFlexion ?? 0;
      const lumbarRotation = Math.abs(angles.lumbarRotation ?? 0);
      return lumbarFlexion > 50 && lumbarRotation > 30;
    },
    severity: 'highly_unlikely',
    affectedJoints: ['lumbar_spine'],
    explanation: 'Lumbalflexion reducerar facetledernas tillåtna rotation. Vid >50° flexion är rotation mycket begränsad.',
  },
  {
    id: 'joint_centration_violation',
    description: 'Felaktig ledcentrering i viktbärande',
    check: (angles) => {
      // Kontrollera för felställningar som indikerar dålig ledcentrering
      const kneeValgusExtreme = Math.abs(angles.leftKneeValgus ?? 0) > 25 || Math.abs(angles.rightKneeValgus ?? 0) > 25;
      const trunkLeanExtreme = Math.abs(angles.trunkLateralLean ?? 0) > 20;
      return kneeValgusExtreme && trunkLeanExtreme;
    },
    severity: 'unusual',
    affectedJoints: ['knee', 'trunk'],
    explanation: 'Kombinerad extrem knävalgus och bållutning tyder på systematisk kompensation eller felaktig posedetektion.',
  },
];

/**
 * Validera att detekterade ledvinklar är anatomiskt möjliga
 *
 * Användning:
 * - Filtrera bort uppenbart felaktiga pose-detektioner
 * - Flagga misstänkta kompensationsmönster
 * - Ge feedback om potentiella tekniska problem
 *
 * @param angles - Record med ledvinklar
 * @returns Valideringsresultat med eventuella överträdelser
 */
export function validateJointCombination(
  angles: Record<string, number>
): JointConstraintValidation {
  const violations: JointConstraintViolation[] = [];

  // Kontrollera varje constraint-regel
  for (const rule of JOINT_CONSTRAINT_RULES) {
    try {
      if (rule.check(angles)) {
        // Samla de vinklar som är inblandade
        const detectedAngles: Record<string, number> = {};
        for (const joint of rule.affectedJoints) {
          // Hitta relaterade vinklar
          for (const [key, value] of Object.entries(angles)) {
            if (key.toLowerCase().includes(joint.toLowerCase())) {
              detectedAngles[key] = value;
            }
          }
        }

        violations.push({
          type: rule.id,
          joints: rule.affectedJoints,
          detectedAngles,
          description: rule.description,
          severity: rule.severity,
          suggestedCorrection: getSuggestedCorrection(rule.id),
        });
      }
    } catch (error) {
      // Ignorera fel i enskilda regler
      console.warn(`Constraint check failed for ${rule.id}:`, error);
    }
  }

  // Beräkna confidence baserat på överträdelser
  const impossibleCount = violations.filter(v => v.severity === 'impossible').length;
  const highlyUnlikelyCount = violations.filter(v => v.severity === 'highly_unlikely').length;
  const unusualCount = violations.filter(v => v.severity === 'unusual').length;

  // Om någon "impossible" överträdelse finns, är det inte anatomiskt möjligt
  const isAnatomicallyPossible = impossibleCount === 0;

  // Confidence: 1.0 = helt säker på att det är möjligt, 0.0 = helt säker på att det är omöjligt
  let confidence = 1.0;
  confidence -= impossibleCount * 0.4;      // Varje "impossible" minskar kraftigt
  confidence -= highlyUnlikelyCount * 0.2;   // Varje "highly_unlikely" minskar måttligt
  confidence -= unusualCount * 0.1;          // Varje "unusual" minskar lite
  confidence = Math.max(0, Math.min(1, confidence));

  // Försök justera vinklar om möjligt
  const adjustedAngles = violations.length > 0
    ? attemptAngleCorrection(angles, violations)
    : undefined;

  return {
    isAnatomicallyPossible,
    violations,
    adjustedAngles,
    confidence,
  };
}

/**
 * Föreslå korrigering för en överträdelse
 */
function getSuggestedCorrection(violationType: ConstraintViolationType): string {
  const corrections: Record<ConstraintViolationType, string> = {
    simultaneous_extreme_extension: 'Kontrollera kamerapositionen och belysningen. Full extension i alla leder samtidigt är sannolikt ett detektionsfel.',
    shoulder_rotation_with_high_abduction: 'Verifiera axelpositionen. Vid hög abduktion ska armen vara externt roterad.',
    knee_hyperextension_with_hip_flexion: 'Kontrollera knäpositionen. Hyperextension med höftflexion är biomekaniskt omöjligt.',
    lumbar_rotation_with_extreme_flexion: 'Verifiera ryggpositionen. Lumbalrotation är begränsad vid djup flexion.',
    ankle_inversion_with_knee_valgus: 'Kontrollera fot- och knäposition. Inversion driver normalt knävarus, inte valgus.',
    coupled_motion_violation: 'Kontrollera skulderbladets position. Hög axelabduktion kräver scapulär rotation.',
    joint_centration_violation: 'Kontrollera hela kroppspositionen. Extrem valgus + bållutning tyder på felaktig detektion eller allvarlig kompensation.',
  };

  return corrections[violationType] || 'Kontrollera pose-detektionen och kameravinkeln.';
}

/**
 * Försök korrigera uppenbart felaktiga vinklar
 * Använder anatomiska gränser för att "clampa" värden
 */
function attemptAngleCorrection(
  angles: Record<string, number>,
  violations: JointConstraintViolation[]
): Record<string, number> {
  const corrected = { ...angles };

  // Anatomiska maxgränser
  const MAX_ANGLES: Record<string, { min: number; max: number }> = {
    leftKnee: { min: 0, max: 180 },
    rightKnee: { min: 0, max: 180 },
    leftHipFlexion: { min: -30, max: 140 },
    rightHipFlexion: { min: -30, max: 140 },
    leftShoulderAbduction: { min: 0, max: 180 },
    rightShoulderAbduction: { min: 0, max: 180 },
    leftShoulderInternalRotation: { min: 0, max: 70 },
    rightShoulderInternalRotation: { min: 0, max: 70 },
    leftShoulderExternalRotation: { min: 0, max: 90 },
    rightShoulderExternalRotation: { min: 0, max: 90 },
    lumbarFlexion: { min: 0, max: 60 },
    lumbarRotation: { min: -30, max: 30 },
    leftAnkleInversion: { min: 0, max: 35 },
    rightAnkleInversion: { min: 0, max: 35 },
    leftKneeValgus: { min: -20, max: 20 },
    rightKneeValgus: { min: -20, max: 20 },
  };

  // Clampa alla vinklar till anatomiska gränser
  for (const [key, value] of Object.entries(corrected)) {
    const limits = MAX_ANGLES[key];
    if (limits) {
      corrected[key] = Math.max(limits.min, Math.min(limits.max, value));
    }
  }

  // Specifika korrigeringar baserat på violations
  for (const violation of violations) {
    if (violation.type === 'shoulder_rotation_with_high_abduction') {
      // Om abduktion >120° och IR >60°, reducera IR till max 30°
      if (corrected.leftShoulderAbduction > 120) {
        corrected.leftShoulderInternalRotation = Math.min(corrected.leftShoulderInternalRotation ?? 0, 30);
      }
      if (corrected.rightShoulderAbduction > 120) {
        corrected.rightShoulderInternalRotation = Math.min(corrected.rightShoulderInternalRotation ?? 0, 30);
      }
    }

    if (violation.type === 'lumbar_rotation_with_extreme_flexion') {
      // Om lumbalflexion >50°, begränsa rotation till ±15°
      if ((corrected.lumbarFlexion ?? 0) > 50) {
        corrected.lumbarRotation = Math.max(-15, Math.min(15, corrected.lumbarRotation ?? 0));
      }
    }
  }

  return corrected;
}

/**
 * Snabb validering för realtidsanvändning
 * Returnerar endast boolean och eventuellt viktigaste problemet
 */
export function quickValidateJoints(
  angles: Record<string, number>
): { valid: boolean; issue?: string } {
  const validation = validateJointCombination(angles);

  if (validation.isAnatomicallyPossible && validation.confidence > 0.7) {
    return { valid: true };
  }

  const criticalViolation = validation.violations.find(v => v.severity === 'impossible');
  if (criticalViolation) {
    return {
      valid: false,
      issue: criticalViolation.description,
    };
  }

  const likelyViolation = validation.violations.find(v => v.severity === 'highly_unlikely');
  if (likelyViolation) {
    return {
      valid: validation.confidence > 0.5,
      issue: likelyViolation.description,
    };
  }

  return { valid: true };
}

/**
 * Utökad kinetisk kedjeanalys som inkluderar constraint-validering
 */
export function analyzeKineticChainWithValidation(
  compensations: CompensationPattern[],
  angles: Record<string, JointAngle3D>
): KineticChainAnalysis & { constraintValidation: JointConstraintValidation } {
  // Konvertera JointAngle3D till Record<string, number> för validering
  const angleValues: Record<string, number> = {};
  for (const [key, value] of Object.entries(angles)) {
    if (value && typeof value.angle === 'number') {
      angleValues[key] = value.angle;
    }
  }

  // Validera constraints
  const constraintValidation = validateJointCombination(angleValues);

  // Om constraints är invalid, justera vinklarna före analys
  let analyzedAngles = angles;
  if (!constraintValidation.isAnatomicallyPossible && constraintValidation.adjustedAngles) {
    // Konvertera tillbaka till JointAngle3D
    analyzedAngles = { ...angles };
    for (const [key, adjustedValue] of Object.entries(constraintValidation.adjustedAngles)) {
      if (analyzedAngles[key]) {
        analyzedAngles[key] = {
          ...analyzedAngles[key],
          angle: adjustedValue,
        };
      }
    }
  }

  // Kör normal kinetisk kedjeanalys
  const baseAnalysis = analyzeKineticChain(compensations, analyzedAngles);

  // Lägg till constraint-violation-relaterade rekommendationer
  if (constraintValidation.violations.length > 0) {
    const constraintRecommendations = constraintValidation.violations
      .filter(v => v.severity !== 'unusual')
      .map(v => `⚠️ ${v.suggestedCorrection}`);

    baseAnalysis.recommendations = [
      ...constraintRecommendations,
      ...baseAnalysis.recommendations,
    ];
  }

  return {
    ...baseAnalysis,
    constraintValidation,
  };
}
