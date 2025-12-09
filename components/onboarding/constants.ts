/**
 * Onboarding Constants
 *
 * Centraliserade konstanter för onboarding-flödet.
 * Del av FAS 6: Modularisering
 */

import {
  Moon, Zap, Flame, Activity, Clock, History, Pill,
  HeartPulse, Stethoscope, User, Target, AlertTriangle,
  Briefcase, TrendingUp
} from 'lucide-react';
import { InjuryType } from '../../types';

// ============================================
// INJURY TYPES
// ============================================

export const INJURY_DESCRIPTIONS: Record<string, string> = {
  [InjuryType.ACUTE]: "Plötslig skada (t.ex. vrickning, sträckning, smäll)",
  [InjuryType.CHRONIC]: "Långvarig smärta (>3 mån) eller återkommande besvär",
  [InjuryType.POST_OP]: "Rehabilitering efter operation (t.ex. Artroskopi, Protes)",
  [InjuryType.PREHAB]: "Förebyggande träning inför säsong eller op."
};

// ============================================
// BODY PART SYMPTOMS
// ============================================

export const BODY_PART_SYMPTOMS: Record<string, string> = {
  'Nacke': 'Cervikalgi, Whiplash, Diskbråck eller Spänningshuvudvärk.',
  'Axlar': 'Impingement, Rotatorcuff-ruptur, Frozen Shoulder eller AC-led.',
  'Bröstrygg': 'Thorakal segmentell dysfunktion, "Låsning" eller Stress.',
  'Armbåge': 'Lateral epikondylit (Tennis), Medial (Golf) eller Bursit.',
  'Handled': 'Karpaltunnelsyndrom, TFCC-skada eller Överbelastning.',
  'Ländrygg': 'Lumbago (Ryggskott), Ischias, Diskbråck eller Spinal stenos.',
  'Ljumskar': 'FAI (Impingement), Adduktor-tendinopati eller Sportbråck.',
  'Säte': 'Gluteal tendinopati, Piriformis-syndrom eller Höftledsartros.',
  'Lår (Bak)': 'Hamstrings-ruptur/tendinopati (Löparskada).',
  'Knä': 'Patellofemoralt smärtsyndrom (PFSS), Menisk, Korsband eller Artros.',
  'Underben': 'Medialt Tibialt Stressyndrom (Benhinnor) eller Kompartment.',
  'Vad': 'Gastrocnemius-ruptur (Gubbvad) eller Akillestendinopati.',
  'Häl': 'Plantar fasciit (Hälsporre), Haglunds häl eller Fettkudde.',
  'Fot': "Metatarsalgi, Morton's neurom eller Fotledsstukning."
};

// ============================================
// PAIN CHARACTERISTICS
// ============================================

export const PAIN_CHARACTERS = [
  { id: 'molande', label: 'Molande / Värkande', icon: Moon, desc: 'Vanligt vid inflammation/artros' },
  { id: 'huggande', label: 'Huggande / Skarp', icon: Zap, desc: 'Vid vissa rörelser/låsningar' },
  { id: 'brannande', label: 'Brännande / Elektrisk', icon: Flame, desc: 'Kan tyda på nervpåverkan' },
  { id: 'bultande', label: 'Bultande / Pulserande', icon: Activity, desc: 'Hög inflammation/akut fas' }
];

// ============================================
// FUNCTIONAL LIMITATIONS
// ============================================

export const FUNCTIONAL_LIMITS: Record<string, string[]> = {
  'Knä': ['Gå i trappor', 'Sitta på huk', 'Springa/Hoppa', 'Sitta stilla länge (bio)'],
  'Ländrygg': ['Ta på strumpor', 'Lyfta tungt', 'Sitta vid skrivbord', 'Sova hela natten'],
  'Axlar': ['Kamma håret/tvätta rygg', 'Sova på sidan', 'Lyfta armen över axelhöjd', 'Bära matkassar'],
  'Nacke': ['Vrida huvudet vid bilkörning', 'Titta ner i mobilen', 'Sova på mage', 'Jobba vid datorn'],
  'General': ['Sova', 'Gå promenader', 'Lyfta barn/barnbarn', 'Utöva min sport']
};

// ============================================
// RED FLAGS (Medical Warning Signs)
// ============================================

export const RED_FLAGS: Record<string, string[]> = {
  'Ländrygg': [
    'Har du tappat känseln i underlivet/ljumskarna? (Ridbyxeanestesi)',
    'Har du svårt att kontrollera urin eller avföring?',
    'Har du plötslig kraftlöshet i båda benen?'
  ],
  'Nacke': [
    'Upplever du svårigheter att prata eller svälja?',
    'Har du domningar runt munnen eller i ansiktet?',
    'Har du svimmat (drop attack) vid huvudvridning?'
  ],
  'Generic': [
    'Har du feber eller allmän sjukdomskänsla ihop med smärtan?',
    'Har du haft oväntad viktnedgång den senaste tiden?',
    'Är smärtan konstant dygnet runt och påverkas inte av läge?',
    'Har du tidigare cancerhistorik?'
  ]
};

// ============================================
// BODY-SPECIFIC QUESTIONS
// ============================================

export interface BodySpecificQuestion {
  id: string;
  label: string;
  options: string[];
  hint?: string;
}

export const BODY_SPECIFIC_QUESTIONS: Record<string, BodySpecificQuestion[]> = {
  'Knä': [
    { id: 'warmup_effect', label: 'Hur reagerar smärtan på aktivitet?', options: ['Värst i början, blir bättre när jag är varm', 'Gör mer och mer ont ju längre jag håller på', 'Gör ont direkt och släpper aldrig', 'Kommer smygande efter passet'], hint: 'Skiljer på Senor (Warm-up) vs Led/Ben (Värre)' },
    { id: 'stairs', label: 'Var gör det ont i trappor?', options: ['Mest nerför (Framsida knä)', 'Mest uppför (Belastning)', 'Inga problem i trappor', 'Det hugger till plötsligt'], hint: 'Nerförsmärta indikerar ofta PFSS/Hopparknä' },
    { id: 'locking', label: 'Mekaniska symptom?', options: ['Knät låser sig helt', 'Det knäpper/klickar ljudligt', 'Känsla av att det viker sig (Giving way)', 'Nej, bara smärta'], hint: 'Låsningar = Menisk? Viker sig = Korsband/Muskelsvaghet?' },
    { id: 'swelling', label: 'Svullnad?', options: ['Nej', 'Ja, direkt efter skada (inom 2h)', 'Ja, kommer dagen efter', 'Konstant svullet'], hint: 'Snabbt = Blödning (ACL). Långsamt = Synovit/Menisk.' }
  ],
  'Ländrygg': [
    { id: 'radiation', label: 'Utstrålning i benen?', options: ['Nej, bara i ryggen', 'Ja, ner till skinkan/baksida lår', 'Ja, nedanför knät/till foten', 'Domningar/sockerdricka'], hint: 'Nedanför knät = Rotpåverkan (Diskbråck/Stenos)' },
    { id: 'directional', label: 'Vad känns BÄST?', options: ['Att gå/stå (Extension)', 'Att sitta/ligga med böjda ben (Flexion)', 'Att ligga helt stilla', 'Variera position ofta'], hint: 'Gilla Flexion = Stenos? Gilla Extension = Disk?' },
    { id: 'cough', label: 'Gör det ont att hosta/nysa?', options: ['Nej', 'Ja, det hugger i ryggen', 'Ja, det strålar ner i benet'], hint: 'Bukhöjningstryck indikerar diskinvolvering' }
  ],
  'Axlar': [
    { id: 'pain_arc', label: 'När gör det ont i lyftet (Painful Arc)?', options: ['Gör inte ont att lyfta', 'Ont i mitten av lyftet (70-120 grader)', 'Ont allra högst upp (170-180 grader)', 'Kan inte lyfta armen'], hint: 'Mitten = Subacromiell (Impingement). Toppen = AC-led.' },
    { id: 'night', label: 'Nattlig smärta?', options: ['Nej', 'Kan inte ligga på axeln', 'Vaknar av värk oavsett läge'], hint: 'Vilo/nattsmärta indikerar Frozen Shoulder eller inflammatorisk process.' },
    { id: 'sudden', label: 'Känns axeln instabil?', options: ['Nej, den sitter fast', 'Känns "glapp" vid kaströrelser', 'Känns som den ska hoppa ur led'], hint: 'Instabilitet vs Smärta.' }
  ],
  'Häl': [
    { id: 'morning', label: 'Morgonstelhet/Smärta?', options: ['De första stegen är värst, sen mjuknar det', 'Ingen skillnad på morgonen', 'Stel men inte smärtsam'], hint: 'Klassiskt tecken på Plantar Fasciit' },
    { id: 'location', label: 'Var sitter smärtan exakt?', options: ['Under hälen (trampdynan)', 'Bak på hälen (fästet)', 'Några cm upp på hälsenan'], hint: 'Under = PF. Bak = Haglund/Bursit. Upp = Akilles.' }
  ]
};

export const GENERIC_QUESTIONS: BodySpecificQuestion[] = [
  { id: 'load', label: 'När gör det mest ont?', options: ['I vila', 'Vid belastning', 'Efter aktivitet', 'Hela tiden'] },
  { id: 'stiffness', label: 'Upplever du stelhet?', options: ['Ingen', 'På morgonen', 'Efter stillasittande', 'Konstant'] }
];

// ============================================
// PAIN HISTORY OPTIONS
// ============================================

export const PAIN_DURATION_OPTIONS = [
  { id: 'akut', label: 'Akut (< 6 veckor)', description: 'Nyligen uppkommen smärta', icon: Zap },
  { id: 'subakut', label: 'Subakut (6v - 3 mån)', description: 'Pågått ett tag', icon: Clock },
  { id: 'kronisk', label: 'Kronisk (> 3 månader)', description: 'Långvarig smärta', icon: History }
];

export const PREVIOUS_TREATMENTS = [
  { id: 'fysioterapi', label: 'Fysioterapi', icon: HeartPulse },
  { id: 'medicin', label: 'Smärtstillande', icon: Pill },
  { id: 'kirurgi', label: 'Tidigare operation', icon: Stethoscope },
  { id: 'kiropraktik', label: 'Kiropraktik/Naprapat', icon: User },
  { id: 'akupunktur', label: 'Akupunktur', icon: Target },
  { id: 'vila', label: 'Vila/Avlastning', icon: Moon },
  { id: 'träning', label: 'Egenträning', icon: Activity },
  { id: 'inget', label: 'Ingen behandling', icon: AlertTriangle }
];

export const DAILY_PAIN_PATTERNS = [
  { id: 'morgon', label: 'Värst på morgonen', desc: 'Stelhet efter natten' },
  { id: 'kväll', label: 'Värst på kvällen', desc: 'Byggs upp under dagen' },
  { id: 'konstant', label: 'Konstant hela dagen', desc: 'Ingen variation' },
  { id: 'varierande', label: 'Varierar', desc: 'Beror på aktivitet' }
];

// ============================================
// SURGICAL PROCEDURES
// ============================================

export const SURGICAL_PROCEDURES: Record<string, { label: string, procedures: string[] }> = {
  'Knä': {
    label: 'Knäoperationer',
    procedures: [
      'Korsbandrekonstruktion (ACL)',
      'Meniskoperation',
      'Knäprotes (TKA)',
      'Korrigering av knäskål (MPFL)',
      'Brosk-/Microfracture',
      'Artroskopi (övrigt)'
    ]
  },
  'Axlar': {
    label: 'Axeloperationer',
    procedures: [
      'Rotatorkuff-sutur',
      'Axelprotes',
      'Stabilisering (Bankart/Latarjet)',
      'AC-ledsoperation',
      'Subakromial dekompression',
      'Artroskopi (övrigt)'
    ]
  },
  'Höft': {
    label: 'Höftoperationer',
    procedures: [
      'Höftprotes (THA)',
      'Höftartroskopi (FAI)',
      'Labrumsutur',
      'Osteotomi'
    ]
  },
  'Ländrygg': {
    label: 'Ryggoperationer',
    procedures: [
      'Diskbråcksoperation',
      'Steloperation (Fusion)',
      'Dekompression (Stenos)',
      'Diskprotes'
    ]
  },
  'Fot': {
    label: 'Fotoperationer',
    procedures: [
      'Hallux valgus',
      'Hälsenesutur',
      'Fotledsartroskopi',
      'Fotledsprotes'
    ]
  }
};

// ============================================
// SMART GOAL CATEGORIES
// ============================================

export const GOAL_CATEGORIES = [
  { id: 'sport', label: 'Återgå till sport', icon: Activity, examples: ['Springa 5km', 'Spela fotboll', 'Cykla 50km'] },
  { id: 'vardaglig', label: 'Klara vardagen', icon: User, examples: ['Gå i trappor', 'Bära barnbarn', 'Handla mat'] },
  { id: 'arbete', label: 'Kunna arbeta', icon: Briefcase, examples: ['Sitta vid skrivbord', 'Lyfta på jobbet', 'Stå hela dagen'] },
  { id: 'smärtfri', label: 'Bli smärtfri', icon: HeartPulse, examples: ['Sova utan smärta', 'Vakna utvilad', 'Koncentrera mig'] },
  { id: 'styrka', label: 'Bygga styrka', icon: TrendingUp, examples: ['Lyfta 50kg', 'Göra 10 armhävningar', 'Springa fortare'] }
];

export const TIMEFRAME_OPTIONS = [
  { id: '4v', label: '4 veckor', desc: 'Kort sikt' },
  { id: '8v', label: '8 veckor', desc: 'Medel' },
  { id: '12v', label: '12 veckor', desc: 'Standard rehab' },
  { id: '6m', label: '6 månader', desc: 'Längre mål' },
  { id: '12m', label: '12 månader', desc: 'Postoperativt' }
];

// ============================================
// BODY POINTS FOR SCANNER
// ============================================

export interface BodyPoint {
  id: string;
  x: number;
  y: number;
  view: 'front' | 'back';
  label: string;
}

export const BODY_POINTS: BodyPoint[] = [
  // FRONT POINTS
  { id: 'Nacke', x: 50, y: 13, view: 'front', label: 'Nacke' },
  { id: 'Axlar', x: 28, y: 20, view: 'front', label: 'Höger Axel' },
  { id: 'Axlar', x: 72, y: 20, view: 'front', label: 'Vänster Axel' },
  { id: 'Bröstrygg', x: 50, y: 26, view: 'front', label: 'Bröstkorg' },
  { id: 'Armbåge', x: 20, y: 34, view: 'front', label: 'Höger Armbåge' },
  { id: 'Armbåge', x: 80, y: 34, view: 'front', label: 'Vänster Armbåge' },
  { id: 'Handled', x: 14, y: 48, view: 'front', label: 'Höger Handled' },
  { id: 'Handled', x: 86, y: 48, view: 'front', label: 'Vänster Handled' },
  { id: 'Ljumskar', x: 44, y: 46, view: 'front', label: 'Höger Ljumske' },
  { id: 'Ljumskar', x: 56, y: 46, view: 'front', label: 'Vänster Ljumske' },
  { id: 'Knä', x: 38, y: 68, view: 'front', label: 'Höger Knä' },
  { id: 'Knä', x: 62, y: 68, view: 'front', label: 'Vänster Knä' },
  { id: 'Underben', x: 36, y: 78, view: 'front', label: 'Höger Smalben' },
  { id: 'Underben', x: 64, y: 78, view: 'front', label: 'Vänster Smalben' },
  { id: 'Fot', x: 34, y: 92, view: 'front', label: 'Höger Fot' },
  { id: 'Fot', x: 66, y: 92, view: 'front', label: 'Vänster Fot' },
  // BACK POINTS
  { id: 'Nacke', x: 50, y: 13, view: 'back', label: 'Nacke (Bak)' },
  { id: 'Skulderblad', x: 35, y: 22, view: 'back', label: 'Vänster Skuldra' },
  { id: 'Skulderblad', x: 65, y: 22, view: 'back', label: 'Höger Skuldra' },
  { id: 'Ländrygg', x: 50, y: 38, view: 'back', label: 'Ländrygg' },
  { id: 'Säte', x: 42, y: 48, view: 'back', label: 'Vänster Säte' },
  { id: 'Säte', x: 58, y: 48, view: 'back', label: 'Höger Säte' },
  { id: 'Lår (Bak)', x: 36, y: 60, view: 'back', label: 'Vänster Baksida Lår' },
  { id: 'Lår (Bak)', x: 64, y: 60, view: 'back', label: 'Höger Baksida Lår' },
  { id: 'Vad', x: 36, y: 78, view: 'back', label: 'Vänster Vad' },
  { id: 'Vad', x: 64, y: 78, view: 'back', label: 'Höger Vad' },
  { id: 'Häl', x: 38, y: 92, view: 'back', label: 'Vänster Häl' },
  { id: 'Häl', x: 62, y: 92, view: 'back', label: 'Höger Häl' },
];

// ============================================
// STEP CONFIGURATION
// ============================================

export const TOTAL_STEPS = 13;

export const STEP_TITLES: Record<number, string> = {
  1: 'Grundläggande information',
  2: 'Kroppsområde',
  3: 'Typ av besvär',
  4: 'Smärtbedömning',
  5: 'Smärthistorik',
  6: 'Områdesspecifika frågor',
  7: 'Standardiserade formulär',
  8: 'Säkerhetskontroll',
  9: 'AI-uppföljningsfrågor',
  10: 'Operationsdetaljer',
  11: 'ROM-mätning',
  12: 'Mål & önskemål',
  13: 'Sammanfattning'
};
