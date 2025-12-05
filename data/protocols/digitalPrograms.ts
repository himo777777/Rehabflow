/**
 * DIGITALA REHABILITERINGSPROGRAM
 *
 * Referenser till digitala behandlingsprogram för MSK-besvär.
 * Dessa program kompletterar RehabFlow och kan rekommenderas till patienter.
 *
 * Program:
 * - Joint Academy (Sverige) - Artros och rygg
 * - Kaia Health (Europa/USA) - Ryggsmärta
 * - Hinge Health (USA) - MSK-vård
 */

import { BodyArea, EvidenceLevel } from '../../types';

// ============================================
// DIGITAL PROGRAM INTERFACE
// ============================================

export interface DigitalProgram {
  id: string;
  name: string;
  provider: string;
  programType: 'digital_artros' | 'digital_rygg' | 'digital_msk' | 'digital_rehab';
  bodyAreas: BodyArea[];
  targetConditions: string[];
  targetPopulation: string;
  description: string;
  country: string;
  website: string;

  // Funktioner
  features: string[];
  deliveryMethod: string[];
  professionalSupport: string;

  // Evidens
  evidenceLevel: EvidenceLevel;
  keyStudies?: string[];
  keyOutcomes?: string[];

  // Integration
  availableInSweden: boolean;
  reimbursed: boolean; // Ersatt av regioner
  integrationNotes: string;

  sources: string[];
}

// ============================================
// JOINT ACADEMY - SVENSK DIGITAL ARTROS/RYGG
// ============================================

export const JOINT_ACADEMY: DigitalProgram = {
  id: 'joint_academy',
  name: 'Joint Academy',
  provider: 'Joint Academy AB',
  programType: 'digital_artros',
  bodyAreas: ['höft', 'knä', 'ländrygg'],
  targetConditions: ['höftartros', 'knäartros', 'ländryggssmärta'],
  targetPopulation: 'Vuxna med höft- eller knäartros eller ländryggssmärta',
  description: 'Svenskt digitalt behandlingsprogram där patienter får dagliga individanpassade övningar, utbildning och kontakt med fysioterapeut via app. Baserat på GLA:D-konceptet.',
  country: 'Sverige',
  website: 'https://www.jointacademy.com/se/sv',

  features: [
    'Dagliga individanpassade övningar (5-15 min)',
    'Videoinstruktioner för varje övning',
    'Utbildningsmoduler om artros/ryggsmärta',
    'Chat med legitimerad fysioterapeut',
    'Smärtdagbok och progressspårning',
    'Påminnelser och motivation',
    'Veckovisa uppföljningar'
  ],
  deliveryMethod: ['mobilapp', 'webbplattform'],
  professionalSupport: 'Chat med fysioterapeut, veckovis uppföljning',

  evidenceLevel: 'A',
  keyStudies: [
    'Nero et al. (2023). Clinical effects and cost-effectiveness of digital ACT. BMC Musculoskelet Disord.',
    'Dahlberg et al. (2020). A web-based intervention for people with knee osteoarthritis. Osteoarthritis Cartilage.'
  ],
  keyOutcomes: [
    '46% smärtreduktion vid artros',
    '30% förbättrad funktion',
    '86% patientnöjdhet',
    'Minskad läkemedelskonsumtion'
  ],

  availableInSweden: true,
  reimbursed: true,
  integrationNotes: 'Joint Academy kan rekommenderas som komplement till fysisk rehabilitering. Programmet följer samma principer som GLA:D och artrosskola. Passar patienter som föredrar hembaserad digital behandling.',

  sources: ['swe_jointacademy_001']
};

// ============================================
// JOINT ACADEMY RYGG
// ============================================

export const JOINT_ACADEMY_RYGG: DigitalProgram = {
  id: 'joint_academy_rygg',
  name: 'Joint Academy Rygg',
  provider: 'Joint Academy AB',
  programType: 'digital_rygg',
  bodyAreas: ['ländrygg'],
  targetConditions: ['ländryggssmärta', 'kronisk ryggsmärta', 'lumbago'],
  targetPopulation: 'Vuxna med långvarig eller återkommande ländryggssmärta',
  description: 'Digital behandling av ländryggssmärta med dagliga övningar och kontakt med fysioterapeut i appmiljö. Kombinerar träning med smärtutbildning.',
  country: 'Sverige',
  website: 'https://www.jointacademy.com/se/sv/behandlingar/rygg',

  features: [
    'Dagliga ryggövningar (10-15 min)',
    'Core-stabiliseringsövningar',
    'Smärtutbildning och coping-strategier',
    'Chat med fysioterapeut',
    'Progressionsspårning',
    'Anpassning efter smärtnivå'
  ],
  deliveryMethod: ['mobilapp', 'webbplattform'],
  professionalSupport: 'Chat med fysioterapeut, veckovis uppföljning',

  evidenceLevel: 'B',
  keyStudies: [
    'Joint Academy clinical research program 2023'
  ],
  keyOutcomes: [
    'Signifikant smärtreduktion',
    'Förbättrad funktion',
    'Minskad rörelserädsla'
  ],

  availableInSweden: true,
  reimbursed: true,
  integrationNotes: 'Passar patienter med ländryggssmärta som vill ha flexibel hembaserad behandling. Kan kombineras med fysiska besök vid behov.',

  sources: ['swe_jointacademy_rygg_001']
};

// ============================================
// KAIA HEALTH - DIGITAL RYGGSMÄRTA
// ============================================

export const KAIA_HEALTH: DigitalProgram = {
  id: 'kaia_health',
  name: 'Kaia Health',
  provider: 'Kaia Health GmbH',
  programType: 'digital_rygg',
  bodyAreas: ['ländrygg', 'övre_rygg'],
  targetConditions: ['ländryggssmärta', 'kronisk ryggsmärta', 'nacksmärta'],
  targetPopulation: 'Vuxna med ländryggssmärta',
  description: 'Tyskt appbaserat program med övningar, utbildning och mindfulness för ryggsmärta. Randomiserad studie visar bättre smärtreduktion än fysikvårdsbesök.',
  country: 'Tyskland/Internationellt',
  website: 'https://www.kaiahealth.com',

  features: [
    'AI-driven övningsanpassning',
    'Videoinstruerade övningar',
    'Utbildning om smärtmekanismer',
    'Mindfulness och avslappning',
    'Motion tracking via kamera',
    'Progressionsspårning'
  ],
  deliveryMethod: ['mobilapp'],
  professionalSupport: 'AI-coach, tillval för fysioterapeut',

  evidenceLevel: 'A',
  keyStudies: [
    'Toelle et al. (2019). App-based multidisciplinary back pain treatment. NPJ Digital Medicine.',
    'Huber et al. (2017). Smartphone application for non-specific low back pain. JMIR mHealth.'
  ],
  keyOutcomes: [
    '40% smärtreduktion efter 12 veckor',
    'Bättre än kontrollgrupp med standardvård',
    'Hög compliance (> 80%)'
  ],

  availableInSweden: false,
  reimbursed: false,
  integrationNotes: 'Kaia Health är ett exempel på evidensbaserad digital ryggbehandling. Liknande principer tillämpas i RehabFlow:s ryggprogram. Kan nämnas som internationell referens.',

  sources: ['int_kaia_001']
};

// ============================================
// HINGE HEALTH - DIGITAL MSK USA
// ============================================

export const HINGE_HEALTH: DigitalProgram = {
  id: 'hinge_health',
  name: 'Hinge Health',
  provider: 'Hinge Health Inc.',
  programType: 'digital_msk',
  bodyAreas: ['knä', 'höft', 'ländrygg', 'axel'],
  targetConditions: ['knäsmärta', 'höftsmärta', 'ryggsmärta', 'axelsmärta', 'artros'],
  targetPopulation: 'Vuxna med muskuloskeletala besvär',
  description: 'Amerikanskt digitalt program med hemträning, utbildning, beteendestöd och coachning. Används av stora arbetsgivare för MSK-vård. Studier visar minskad smärta och minskad kirurgi.',
  country: 'USA/Internationellt',
  website: 'https://www.hingehealth.com',

  features: [
    'Sensorer för rörelseanalys',
    'Personlig hälsocoach',
    'Fysioterapeut via video',
    'Utbildningsinnehåll',
    'Tabletbaserat program',
    'Integration med arbetsgivare'
  ],
  deliveryMethod: ['tablett med sensorer', 'mobilapp'],
  professionalSupport: 'Personlig coach, fysioterapeut via video',

  evidenceLevel: 'B',
  keyStudies: [
    'Shebib et al. (2019). Randomized controlled trial of a 12-week digital care program. JMIR Rehab Assist Technol.',
    'Chen et al. (2020). Digital MSK program outcomes. J Med Internet Res.'
  ],
  keyOutcomes: [
    '68% smärtreduktion',
    '58% minskning av kirurgibehov',
    'Hög ROI för arbetsgivare'
  ],

  availableInSweden: false,
  reimbursed: false,
  integrationNotes: 'Hinge Health representerar en trend mot digital MSK-vård. Deras sensor-baserade approach och coachningsmodell kan inspirera framtida RehabFlow-funktioner.',

  sources: ['int_hingehealth_001']
};

// ============================================
// ÖVRIGA DIGITALA ARTROSSKOLOR (SVERIGE)
// ============================================

export const DIGITALA_ARTROSSKOLOR_SVERIGE: DigitalProgram = {
  id: 'digitala_artrosskolor',
  name: 'Digitala artrosskolor via 1177/Regioner',
  provider: 'Svenska regioner',
  programType: 'digital_artros',
  bodyAreas: ['höft', 'knä', 'handled'],
  targetConditions: ['höftartros', 'knäartros', 'handartros'],
  targetPopulation: 'Patienter i svensk primärvård med artros',
  description: 'Regionala digitala artrosskolor tillgängliga via 1177 och regionernas plattformar. Erbjuds som komplement till fysiska grupper.',
  country: 'Sverige',
  website: 'https://www.1177.se',

  features: [
    'Utbildningsmoduler om artros',
    'Övningsvideor',
    'Självtest och uppföljning',
    'Integration med journalsystem'
  ],
  deliveryMethod: ['webbplattform', '1177'],
  professionalSupport: 'Via ordinarie vårdkontakt',

  evidenceLevel: 'B',
  keyOutcomes: [
    'Ökad tillgänglighet',
    'Flexibel behandling',
    'Integration med fysisk vård'
  ],

  availableInSweden: true,
  reimbursed: true,
  integrationNotes: 'Regionernas digitala artrosskolor följer BOA-registrets riktlinjer och kan rekommenderas som alternativ till fysisk artrosskola för patienter som föredrar digital format.',

  sources: ['swe_digital_artros_001']
};

// ============================================
// EXPORT - ALLA DIGITALA PROGRAM
// ============================================

export const DIGITAL_PROGRAMS: DigitalProgram[] = [
  JOINT_ACADEMY,
  JOINT_ACADEMY_RYGG,
  KAIA_HEALTH,
  HINGE_HEALTH,
  DIGITALA_ARTROSSKOLOR_SVERIGE
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Hämta digitala program tillgängliga i Sverige
 */
export function getSwedishDigitalPrograms(): DigitalProgram[] {
  return DIGITAL_PROGRAMS.filter(p => p.availableInSweden);
}

/**
 * Hämta digitala program baserat på tillstånd
 */
export function getDigitalProgramByCondition(condition: string): DigitalProgram | undefined {
  const conditionLower = condition.toLowerCase();

  // Artros
  if (conditionLower.includes('artros')) {
    return JOINT_ACADEMY;
  }

  // Rygg
  if (conditionLower.includes('rygg') || conditionLower.includes('lumba')) {
    return JOINT_ACADEMY_RYGG;
  }

  return undefined;
}

/**
 * Hämta digitala program baserat på kroppsdel
 */
export function getDigitalProgramsByBodyArea(bodyArea: BodyArea): DigitalProgram[] {
  return DIGITAL_PROGRAMS.filter(p => p.bodyAreas.includes(bodyArea));
}

/**
 * Generera prompt-text för AI om digitala alternativ
 */
export function generateDigitalProgramPrompt(program: DigitalProgram): string {
  return `
📱 DIGITALT BEHANDLINGSALTERNATIV:
Program: ${program.name}
Leverantör: ${program.provider}
Tillgängligt i Sverige: ${program.availableInSweden ? 'Ja' : 'Nej'}
Ersätts av regioner: ${program.reimbursed ? 'Ja' : 'Nej'}

FUNKTIONER:
${program.features.slice(0, 4).map(f => `- ${f}`).join('\n')}

EVIDENS: ${program.evidenceLevel}
${program.keyOutcomes ? `Resultat: ${program.keyOutcomes[0]}` : ''}

Webbplats: ${program.website}

${program.integrationNotes}
`.trim();
}

/**
 * Kontrollera om digital behandling bör rekommenderas
 */
export function shouldRecommendDigitalOption(
  condition: string,
  patientPreferences?: { prefersDigital?: boolean; hasSmartphone?: boolean }
): boolean {
  // Alltid rekommendera om patienten föredrar digital
  if (patientPreferences?.prefersDigital) return true;

  // Rekommendera för vanliga tillstånd med bra digitala alternativ
  const digitalFriendlyConditions = [
    'artros', 'knäartros', 'höftartros',
    'ryggsmärta', 'ländryggssmärta', 'lumbago'
  ];

  return digitalFriendlyConditions.some(c =>
    condition.toLowerCase().includes(c)
  );
}
