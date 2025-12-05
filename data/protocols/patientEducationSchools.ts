/**
 * PATIENTUTBILDNINGSPROGRAM - "Skolor"
 *
 * Innehåller strukturerade patientutbildningsprogram för olika tillstånd.
 * Baserat på källor från Excel-filen: rehab_och_preventionsprogram_kallor.xlsx
 *
 * Program:
 * - GLA:D (Danmark/Sverige) - Artros
 * - Artrosskola (Svenska regioner)
 * - Höftskola
 * - Knäskola
 * - Ryggskola
 * - Osteoporosskola
 * - STarT Back (UK)
 * - ESCAPE Pain (UK)
 * - Back School (Internationell)
 */

import { BodyArea, EvidenceLevel } from '../../types';

// ============================================
// PATIENT EDUCATION SCHOOL INTERFACE
// ============================================

export interface PatientEducationSchool {
  id: string;
  name: string;
  englishName: string;
  schoolType: 'artrosskola' | 'ryggskola' | 'osteoporosskola' | 'höftskola' | 'knäskola' | 'handskola' | 'smärtskola';
  bodyAreas: BodyArea[];
  targetConditions: string[];
  targetPopulation: string;
  description: string;
  deliveryFormat: 'grupp' | 'individuell' | 'digital' | 'hybrid';
  totalSessions: number;
  sessionDuration: number; // minuter

  // Programstruktur
  sessions: {
    number: number;
    topic: string;
    duration: number;
    content: string[];
    exercises?: string[];
  }[];

  // Kärnkomponenter
  educationTopics: string[];
  exerciseComponents: string[];
  selfManagementStrategies: string[];

  // Evidens
  evidenceLevel: EvidenceLevel;
  keyOutcomes?: string[];
  keyStudies?: string[];
  sources: string[];

  // Metadata
  origin: string;
  yearIntroduced?: number;
  website?: string;
}

// ============================================
// GLA:D - GOOD LIFE WITH ARTHROSIS IN DENMARK
// ============================================

export const GLAD_PROGRAM: PatientEducationSchool = {
  id: 'glad_artros',
  name: 'GLA:D - God Livskvalitet med Artros',
  englishName: 'GLA:D - Good Life with Arthrosis in Denmark',
  schoolType: 'artrosskola',
  bodyAreas: ['höft', 'knä'],
  targetConditions: ['höftartros', 'knäartros', 'artros'],
  targetPopulation: 'Vuxna med symtomgivande höft- eller knäartros',
  description: 'Strukturerat evidensbaserat patientutbildningsprogram med neuromuskulär träning för artros. Ursprungligen utvecklat i Danmark, nu implementerat i över 10 länder inklusive Sverige via BOA-registret.',
  deliveryFormat: 'grupp',
  totalSessions: 14,
  sessionDuration: 60,

  sessions: [
    {
      number: 1,
      topic: 'Introduktion och utbildning 1',
      duration: 60,
      content: ['Vad är artros?', 'Behandlingsalternativ', 'Introduktion till träning'],
      exercises: ['Baslinjetest', 'Introduktion till övningar']
    },
    {
      number: 2,
      topic: 'Utbildning 2 - Träning och artros',
      duration: 60,
      content: ['Evidens för träning', 'Dosering', 'Smärthantering vid träning'],
      exercises: ['Uppvärmning', 'Cirkelträning nivå 1']
    },
    {
      number: 3,
      topic: 'Träningspass 1',
      duration: 60,
      content: ['Övningsinstruktion', 'Individuell anpassning'],
      exercises: ['Uppvärmning', 'Knäböj', 'Utfall', 'Step-up', 'Bäckenlyft']
    },
    {
      number: 4,
      topic: 'Träningspass 2',
      duration: 60,
      content: ['Progressionskontroll'],
      exercises: ['Fullständigt träningsprogram']
    },
    {
      number: 5,
      topic: 'Träningspass 3',
      duration: 60,
      content: ['Teknikgenomgång'],
      exercises: ['Fullständigt träningsprogram med ökad belastning']
    },
    {
      number: 6,
      topic: 'Träningspass 4',
      duration: 60,
      content: ['Individuell feedback'],
      exercises: ['Träningsprogram nivå 2']
    },
    {
      number: 7,
      topic: 'Träningspass 5',
      duration: 60,
      content: ['Halvtidsuppföljning'],
      exercises: ['Träningsprogram nivå 2']
    },
    {
      number: 8,
      topic: 'Träningspass 6',
      duration: 60,
      content: ['Smärthantering'],
      exercises: ['Träningsprogram nivå 2-3']
    },
    {
      number: 9,
      topic: 'Träningspass 7',
      duration: 60,
      content: ['Fysisk aktivitet i vardagen'],
      exercises: ['Träningsprogram nivå 2-3']
    },
    {
      number: 10,
      topic: 'Träningspass 8',
      duration: 60,
      content: ['Progression och anpassning'],
      exercises: ['Träningsprogram nivå 3']
    },
    {
      number: 11,
      topic: 'Träningspass 9',
      duration: 60,
      content: ['Bibehålla träning långsiktigt'],
      exercises: ['Träningsprogram nivå 3']
    },
    {
      number: 12,
      topic: 'Träningspass 10',
      duration: 60,
      content: ['Förberedelse för hemträning'],
      exercises: ['Hemträningsprogram']
    },
    {
      number: 13,
      topic: 'Träningspass 11',
      duration: 60,
      content: ['Sluttest och utvärdering'],
      exercises: ['Funktionstest', 'Sluttest']
    },
    {
      number: 14,
      topic: 'Avslutning och framtidsplan',
      duration: 60,
      content: ['Resultatgenomgång', 'Långsiktig plan', 'Uppföljningsinformation'],
      exercises: ['Hemträningsprogram genomgång']
    }
  ],

  educationTopics: [
    'Artrosens patofysiologi',
    'Behandlingsalternativ (träning, viktminskning, läkemedel, kirurgi)',
    'Fysisk aktivitets betydelse',
    'Smärthantering',
    'Dosering av träning',
    '24-timmarsregeln för smärta',
    'Långsiktig egenvård'
  ],
  exerciseComponents: [
    'Neuromuskulär träning',
    'Funktionella övningar (knäböj, utfall, step-ups)',
    'Balansträning',
    'Core-stabilitet',
    'Styrketräning för ben'
  ],
  selfManagementStrategies: [
    '24-timmarsregeln för smärta efter träning',
    'Aktivitetsanpassning',
    'Hemträningsprogram',
    'Fysisk aktivitet i vardagen',
    'Viktkontroll'
  ],

  evidenceLevel: 'A',
  keyOutcomes: [
    '32% smärtreduktion efter 3 månader',
    'Förbättrad funktion och livskvalitet',
    '26% färre rapporterar behov av operation',
    'Kostnadseffektiv behandling'
  ],
  keyStudies: [
    'Skou et al. (2018). Efficacy of GLA:D. Osteoarthritis and Cartilage.',
    'Roos et al. (2018). GLA:D implementation and outcomes. BJSM.'
  ],
  sources: ['swe_glad_001', 'int_glad_001'],

  origin: 'Syddansk Universitet, Danmark',
  yearIntroduced: 2013,
  website: 'https://gladinternational.org'
};

// ============================================
// SVENSK ARTROSSKOLA (BOA)
// ============================================

export const SVENSK_ARTROSSKOLA: PatientEducationSchool = {
  id: 'svensk_artrosskola',
  name: 'Svensk Artrosskola (BOA)',
  englishName: 'Swedish Arthrosis School (BOA Registry)',
  schoolType: 'artrosskola',
  bodyAreas: ['höft', 'knä'],
  targetConditions: ['höftartros', 'knäartros', 'artros'],
  targetPopulation: 'Primärvårdspatienter med artros',
  description: 'Nationell artrosbehandling via BOA-registret (Bättre Omhändertagande av patienter med Artros). Strukturerad första linjens behandling med patientutbildning och träning.',
  deliveryFormat: 'hybrid',
  totalSessions: 6,
  sessionDuration: 90,

  sessions: [
    {
      number: 1,
      topic: 'Artroskunskap',
      duration: 90,
      content: ['Vad är artros?', 'Riskfaktorer', 'Behandlingsmöjligheter'],
      exercises: ['Introduktion till hemövningar']
    },
    {
      number: 2,
      topic: 'Träning som behandling',
      duration: 90,
      content: ['Träningens effekt på artros', 'Dos-respons', 'Smärthantering'],
      exercises: ['Praktisk träning']
    },
    {
      number: 3,
      topic: 'Livsstilsfaktorer',
      duration: 90,
      content: ['Vikt och artros', 'Kost', 'Aktivitetsnivå'],
      exercises: ['Träningspass']
    },
    {
      number: 4,
      topic: 'Hjälpmedel och anpassning',
      duration: 90,
      content: ['Hjälpmedel', 'Ergonomi', 'Vardagsanpassning'],
      exercises: ['Träningspass']
    },
    {
      number: 5,
      topic: 'Smärthantering',
      duration: 90,
      content: ['Smärtmekanismer', 'Strategier för smärthantering'],
      exercises: ['Träningspass']
    },
    {
      number: 6,
      topic: 'Framtidsplan',
      duration: 90,
      content: ['Uppföljning', 'Långsiktig plan', 'När söka vård igen'],
      exercises: ['Sluttest', 'Hemprogram']
    }
  ],

  educationTopics: [
    'Artroskunskap',
    'Behandlingsalternativ',
    'Träningens betydelse',
    'Livsstilsfaktorer',
    'Smärthantering',
    'Egenvård'
  ],
  exerciseComponents: [
    'Styrketräning',
    'Funktionell träning',
    'Rörlighet',
    'Balans'
  ],
  selfManagementStrategies: [
    'Hemträningsprogram',
    'Aktivitetsanpassning',
    'Vikthantering',
    'Stresshantering'
  ],

  evidenceLevel: 'A',
  keyOutcomes: [
    'Registrering i BOA-registret',
    'Strukturerad uppföljning',
    'Dokumenterad smärtreduktion'
  ],
  keyStudies: [
    'BOA-registret årsrapport 2023',
    'Thorstensson et al. Supported osteoarthritis self-management. BMC Musculoskelet Disord.'
  ],
  sources: ['swe_boa_001'],

  origin: 'BOA-registret, Sverige',
  yearIntroduced: 2008,
  website: 'https://boa.registercentrum.se'
};

// ============================================
// HÖFTSKOLA
// ============================================

export const HOFTSKOLA: PatientEducationSchool = {
  id: 'hoftskola',
  name: 'Höftskola',
  englishName: 'Hip School',
  schoolType: 'höftskola',
  bodyAreas: ['höft'],
  targetConditions: ['höftartros', 'höftsmärta', 'höftledsartros'],
  targetPopulation: 'Patienter med höftartros eller höftbesvär',
  description: 'Standardiserad icke-farmakologisk behandling vid höftartros med patientutbildning, gruppträning och hemövningar. Följer svenska nationella riktlinjer.',
  deliveryFormat: 'grupp',
  totalSessions: 6,
  sessionDuration: 60,

  sessions: [
    {
      number: 1,
      topic: 'Höftens anatomi och artros',
      duration: 60,
      content: ['Höftledens uppbyggnad', 'Artrosprocessen', 'Symtom'],
      exercises: ['Introduktion höftövningar']
    },
    {
      number: 2,
      topic: 'Behandling och träning',
      duration: 60,
      content: ['Behandlingsalternativ', 'Träningens roll'],
      exercises: ['Höftstabilisering', 'Rörlighetsövningar']
    },
    {
      number: 3,
      topic: 'Praktisk träning',
      duration: 60,
      content: ['Övningsteknik', 'Progression'],
      exercises: ['Fullständigt träningsprogram']
    },
    {
      number: 4,
      topic: 'Vardagsaktiviteter',
      duration: 60,
      content: ['Ergonomi', 'Aktivitetsanpassning'],
      exercises: ['Funktionella övningar']
    },
    {
      number: 5,
      topic: 'Smärta och coping',
      duration: 60,
      content: ['Smärthantering', 'Psykologiska aspekter'],
      exercises: ['Träningspass']
    },
    {
      number: 6,
      topic: 'Framtid och uppföljning',
      duration: 60,
      content: ['Operationsindikationer', 'Långsiktig plan'],
      exercises: ['Hemprogram genomgång']
    }
  ],

  educationTopics: [
    'Höftens anatomi',
    'Artrosprocessen',
    'Behandlingsalternativ',
    'Träning',
    'Ergonomi',
    'Smärthantering'
  ],
  exerciseComponents: [
    'Höftstabilisering',
    'Höftrörlighet',
    'Styrketräning gluteus',
    'Funktionella övningar'
  ],
  selfManagementStrategies: [
    'Dagliga höftövningar',
    'Aktivitetsanpassning',
    'Gånghjälpmedel vid behov'
  ],

  evidenceLevel: 'B',
  keyStudies: [
    'Region Sörmland - Införandet av höftskola',
    'Nationella riktlinjer för rörelseorganens sjukdomar'
  ],
  sources: ['swe_hoftskola_001'],

  origin: 'Svenska regioner',
  website: 'https://www.1177.se'
};

// ============================================
// KNÄSKOLA
// ============================================

export const KNASKOLA: PatientEducationSchool = {
  id: 'knaskola',
  name: 'Knäskola',
  englishName: 'Knee School',
  schoolType: 'knäskola',
  bodyAreas: ['knä'],
  targetConditions: ['knäartros', 'knäsmärta', 'gonartros'],
  targetPopulation: 'Patienter med knäartros eller knäbesvär',
  description: 'Motsvarar höftskola men för knäartros med fokus på information, ledanpassad träning och levnadsvanor innan ställning tas till operation.',
  deliveryFormat: 'grupp',
  totalSessions: 6,
  sessionDuration: 60,

  sessions: [
    {
      number: 1,
      topic: 'Knäets anatomi och artros',
      duration: 60,
      content: ['Knäledens uppbyggnad', 'Artrosprocessen', 'Symtom'],
      exercises: ['Introduktion knäövningar']
    },
    {
      number: 2,
      topic: 'Behandling och träning',
      duration: 60,
      content: ['Behandlingsalternativ', 'Träningens roll', 'Smärthantering'],
      exercises: ['Quadriceps-stärkning', 'Rörlighet']
    },
    {
      number: 3,
      topic: 'Praktisk träning',
      duration: 60,
      content: ['Övningsteknik', 'Progression'],
      exercises: ['Knäböj', 'Bensträck', 'Step-ups']
    },
    {
      number: 4,
      topic: 'Livsstil och aktivitet',
      duration: 60,
      content: ['Fysisk aktivitet', 'Vikt', 'Kost'],
      exercises: ['Funktionella övningar']
    },
    {
      number: 5,
      topic: 'Hjälpmedel och anpassning',
      duration: 60,
      content: ['Ortoser', 'Skor', 'Ergonomi'],
      exercises: ['Träningspass']
    },
    {
      number: 6,
      topic: 'Framtid och operation',
      duration: 60,
      content: ['När operation?', 'Långsiktig plan'],
      exercises: ['Hemprogram']
    }
  ],

  educationTopics: [
    'Knäets anatomi',
    'Artrosprocessen',
    'Behandlingsalternativ',
    'Träning',
    'Livsstilsfaktorer',
    'Operationsindikationer'
  ],
  exerciseComponents: [
    'Quadriceps-stärkning',
    'Hamstrings-stärkning',
    'Knärörlighet',
    'Funktionella övningar',
    'Balans'
  ],
  selfManagementStrategies: [
    'Dagliga knäövningar',
    'Vikthantering',
    'Aktivitetsanpassning'
  ],

  evidenceLevel: 'B',
  keyStudies: [
    'Region Värmland - Knäskola riktlinjer',
    'Nationella riktlinjer för rörelseorganens sjukdomar'
  ],
  sources: ['swe_knaskola_001'],

  origin: 'Svenska regioner',
  website: 'https://www.1177.se'
};

// ============================================
// RYGGSKOLA
// ============================================

export const RYGGSKOLA: PatientEducationSchool = {
  id: 'ryggskola',
  name: 'Ryggskola',
  englishName: 'Back School',
  schoolType: 'ryggskola',
  bodyAreas: ['ländrygg', 'övre_rygg'],
  targetConditions: ['ländryggssmärta', 'kronisk ryggsmärta', 'lumbago'],
  targetPopulation: 'Patienter med långvarig ländryggssmärta',
  description: 'Strukturerat utbildnings- och träningsprogram där patienter får undervisning om ryggens funktion, ergonomi och smärtmekanismer kombinerat med träning.',
  deliveryFormat: 'grupp',
  totalSessions: 8,
  sessionDuration: 90,

  sessions: [
    {
      number: 1,
      topic: 'Ryggens anatomi',
      duration: 90,
      content: ['Ryggradens uppbyggnad', 'Diskar', 'Muskler', 'Nerver'],
      exercises: ['Introduktion ryggövningar']
    },
    {
      number: 2,
      topic: 'Smärta och smärtmekanismer',
      duration: 90,
      content: ['Akut vs kronisk smärta', 'Central sensitisering', 'Psykosociala faktorer'],
      exercises: ['Mjuka mobiliseringsövningar']
    },
    {
      number: 3,
      topic: 'Ergonomi',
      duration: 90,
      content: ['Sittande', 'Lyfteknik', 'Arbetsställningar'],
      exercises: ['Core-aktivering']
    },
    {
      number: 4,
      topic: 'Träning och rörelse',
      duration: 90,
      content: ['Träningens betydelse', 'Rörelserädsla', 'Dosering'],
      exercises: ['Stabiliseringsövningar']
    },
    {
      number: 5,
      topic: 'Core-stabilitet',
      duration: 90,
      content: ['Core-muskulatur', 'Aktivering', 'Progression'],
      exercises: ['Core-program']
    },
    {
      number: 6,
      topic: 'Stresshantering',
      duration: 90,
      content: ['Stress och smärta', 'Avslappning', 'Sömn'],
      exercises: ['Avslappningsövningar', 'Träning']
    },
    {
      number: 7,
      topic: 'Vardagsaktiviteter',
      duration: 90,
      content: ['Pacing', 'Aktivitetsbalans', 'Gradvis återgång'],
      exercises: ['Funktionell träning']
    },
    {
      number: 8,
      topic: 'Långsiktig plan',
      duration: 90,
      content: ['Bibehålla framsteg', 'Bakslag', 'Framtid'],
      exercises: ['Hemprogram genomgång']
    }
  ],

  educationTopics: [
    'Ryggens anatomi och funktion',
    'Smärtmekanismer',
    'Ergonomi och lyftteknik',
    'Fysisk aktivitet',
    'Stresshantering',
    'Pacing'
  ],
  exerciseComponents: [
    'Core-stabilisering',
    'Ryggrörlighet',
    'Styrketräning',
    'Funktionella övningar'
  ],
  selfManagementStrategies: [
    'Dagliga ryggövningar',
    'Ergonomiska principer',
    'Pacing',
    'Stresshantering'
  ],

  evidenceLevel: 'B',
  keyStudies: [
    'Maher et al. Non-specific low back pain. Lancet.',
    'Nationella riktlinjer för rörelseorganens sjukdomar'
  ],
  sources: ['swe_ryggskola_001'],

  origin: 'Internationell/Svenska anpassningar',
  website: 'https://skadekompassen.se/behandlingsmetoder/ryggskola-behandling-ont-i-ryggen'
};

// ============================================
// OSTEOPOROSSKOLA
// ============================================

export const OSTEOPOROSSKOLA: PatientEducationSchool = {
  id: 'osteoporosskola',
  name: 'Osteoporosskola',
  englishName: 'Osteoporosis School',
  schoolType: 'osteoporosskola',
  bodyAreas: ['hel_kropp', 'ländrygg', 'höft'],
  targetConditions: ['osteoporos', 'benskörhet', 'hög frakturrisk'],
  targetPopulation: 'Personer med osteoporos eller hög frakturrisk',
  description: 'Patientutbildning om benskörhet, fallrisk, fysisk aktivitet, kost och läkemedel. Rekommenderas som del av vård vid osteoporos enligt nationella riktlinjer.',
  deliveryFormat: 'grupp',
  totalSessions: 4,
  sessionDuration: 120,

  sessions: [
    {
      number: 1,
      topic: 'Vad är osteoporos?',
      duration: 120,
      content: ['Skelettet och benvävnad', 'Riskfaktorer', 'Diagnostik'],
      exercises: ['Introduktion balansövningar']
    },
    {
      number: 2,
      topic: 'Behandling',
      duration: 120,
      content: ['Läkemedelsbehandling', 'Kost och D-vitamin', 'Kalcium'],
      exercises: ['Styrketräning för skelett']
    },
    {
      number: 3,
      topic: 'Fysisk aktivitet och träning',
      duration: 120,
      content: ['Belastningens betydelse', 'Säker träning', 'Fallprevention'],
      exercises: ['Balans', 'Styrka', 'Gångträning']
    },
    {
      number: 4,
      topic: 'Fallprevention och vardag',
      duration: 120,
      content: ['Fallriskfaktorer', 'Hemmiljö', 'Hjälpmedel', 'Långsiktig plan'],
      exercises: ['Fallpreventionsprogram']
    }
  ],

  educationTopics: [
    'Osteoporos patofysiologi',
    'Riskfaktorer',
    'Diagnostik (DXA)',
    'Läkemedelsbehandling',
    'Kost och kalk',
    'D-vitamin',
    'Fallprevention',
    'Fysisk aktivitet'
  ],
  exerciseComponents: [
    'Belastande träning',
    'Styrketräning',
    'Balansträning',
    'Fallprevention',
    'Gångträning'
  ],
  selfManagementStrategies: [
    'Regelbunden styrketräning',
    'Daglig fysisk aktivitet',
    'Kost med kalcium',
    'D-vitamin supplement',
    'Säker hemmiljö'
  ],

  evidenceLevel: 'B',
  keyStudies: [
    'NOF Guidelines 2022',
    'Socialstyrelsen nationella riktlinjer osteoporos'
  ],
  sources: ['swe_osteoporos_001'],

  origin: 'Osteoporosförbundet Sverige',
  website: 'https://www.osteoporos.org/osteoporosskolor-i-sverige'
};

// ============================================
// STarT BACK - UK STRATIFIERAD RYGGVÅRD
// ============================================

export const START_BACK: PatientEducationSchool = {
  id: 'start_back',
  name: 'STarT Back - Stratifierad ryggbehandling',
  englishName: 'STarT Back Stratified Care',
  schoolType: 'ryggskola',
  bodyAreas: ['ländrygg'],
  targetConditions: ['ländryggssmärta', 'akut ryggsmärta', 'subakut ryggsmärta'],
  targetPopulation: 'Primärvårdspatienter med ländryggssmärta',
  description: 'Stratifierad vårdmodell där patienter delas in i risknivåer (låg, medel, hög) med enkät och får olika behandlingspaket beroende på risk för långvariga besvär.',
  deliveryFormat: 'individuell',
  totalSessions: 6,
  sessionDuration: 45,

  sessions: [
    {
      number: 1,
      topic: 'Screening och riskbedömning',
      duration: 30,
      content: ['STarT Back Screening Tool', 'Riskklassificering'],
      exercises: []
    },
    {
      number: 2,
      topic: 'Lågrisk - Egenvård',
      duration: 45,
      content: ['Information', 'Råd om aktivitet', 'Prognos'],
      exercises: ['Enkla hemövningar']
    },
    {
      number: 3,
      topic: 'Medelrisk - Fysioterapi',
      duration: 45,
      content: ['Strukturerad fysioterapi', 'Träningsprogram'],
      exercises: ['Individuellt träningsprogram']
    },
    {
      number: 4,
      topic: 'Högrisk - Psykologiskt informerad fysioterapi',
      duration: 60,
      content: ['Kognitiva strategier', 'Rörelserädsla', 'Pacing'],
      exercises: ['Graderad aktivitet']
    },
    {
      number: 5,
      topic: 'Uppföljning',
      duration: 45,
      content: ['Progressbedömning', 'Anpassning'],
      exercises: ['Anpassat program']
    },
    {
      number: 6,
      topic: 'Avslutning',
      duration: 45,
      content: ['Långsiktig plan', 'Självhantering'],
      exercises: ['Hemprogram']
    }
  ],

  educationTopics: [
    'Prognos vid ryggsmärta',
    'Psykosociala riskfaktorer',
    'Rörelserädsla',
    'Aktivitetsnivå',
    'Egenvård'
  ],
  exerciseComponents: [
    'Anpassat efter risknivå',
    'Graderad aktivitet vid hög risk',
    'Standardprogram vid medel risk',
    'Egenvård vid låg risk'
  ],
  selfManagementStrategies: [
    'Förstå sin prognos',
    'Bibehålla aktivitet',
    'Hantera rörelserädsla',
    'Pacing vid behov'
  ],

  evidenceLevel: 'A',
  keyOutcomes: [
    'Kostnadseffektivare vård',
    'Bättre utfall för högriskpatienter',
    'Minskad överbehandling av lågriskpatienter'
  ],
  keyStudies: [
    'Hill et al. (2011). Comparison of stratified primary care management. Lancet.',
    'Foster et al. (2014). STarT Back 5-year follow-up. BJGP.'
  ],
  sources: ['int_startback_001'],

  origin: 'Keele University, Storbritannien',
  yearIntroduced: 2008,
  website: 'https://startback.hfac.keele.ac.uk'
};

// ============================================
// ESCAPE PAIN - UK ARTROSPROGRAM
// ============================================

export const ESCAPE_PAIN: PatientEducationSchool = {
  id: 'escape_pain',
  name: 'ESCAPE-pain - Gruppbaserad artrosbehandling',
  englishName: 'ESCAPE-pain Programme',
  schoolType: 'artrosskola',
  bodyAreas: ['knä', 'höft'],
  targetConditions: ['knäartros', 'höftartros', 'kronisk ledsmärta'],
  targetPopulation: 'Vuxna med kronisk artrosrelaterad smärta',
  description: 'Gruppbaserat program från Storbritannien som kombinerar utbildning, egenvårdsstrategier och individuell träning under cirka sex veckor. Implementerat i NHS.',
  deliveryFormat: 'grupp',
  totalSessions: 12,
  sessionDuration: 60,

  sessions: [
    {
      number: 1,
      topic: 'Introduktion',
      duration: 60,
      content: ['Programmets upplägg', 'Vad är artros?'],
      exercises: ['Bastest']
    },
    {
      number: 2,
      topic: 'Smärta och aktivitet',
      duration: 60,
      content: ['Smärtmekanismer', 'Aktivitetens roll'],
      exercises: ['Uppvärmning', 'Styrkeövningar nivå 1']
    },
    {
      number: 3,
      topic: 'Träning och artros',
      duration: 60,
      content: ['Evidens', 'Dosering', 'Säkerhet'],
      exercises: ['Fullständigt program']
    },
    {
      number: 4,
      topic: 'Pacing och aktivitetsbalans',
      duration: 60,
      content: ['Pacing-principer', 'Boom-bust cycle'],
      exercises: ['Träning med fokus på pacing']
    },
    {
      number: 5,
      topic: 'Coping-strategier',
      duration: 60,
      content: ['Psykologiska strategier', 'Tankar och smärta'],
      exercises: ['Progressivt träningsprogram']
    },
    {
      number: 6,
      topic: 'Livsstilsfaktorer',
      duration: 60,
      content: ['Vikt', 'Sömn', 'Stress'],
      exercises: ['Träningspass']
    },
    {
      number: 7,
      topic: 'Hemträning',
      duration: 60,
      content: ['Etablera rutin', 'Motivation'],
      exercises: ['Hemprogram introduktion']
    },
    {
      number: 8,
      topic: 'Problemlösning',
      duration: 60,
      content: ['Bakslag', 'Hinder', 'Lösningar'],
      exercises: ['Träningspass']
    },
    {
      number: 9,
      topic: 'Fysisk aktivitet i vardagen',
      duration: 60,
      content: ['Integration', 'Målsättning'],
      exercises: ['Träningspass']
    },
    {
      number: 10,
      topic: 'Måluppföljning',
      duration: 60,
      content: ['Progressbedömning', 'Nya mål'],
      exercises: ['Träningspass']
    },
    {
      number: 11,
      topic: 'Framtidsplanering',
      duration: 60,
      content: ['Bibehålla framsteg', 'Resurser'],
      exercises: ['Träningspass']
    },
    {
      number: 12,
      topic: 'Avslutning',
      duration: 60,
      content: ['Sluttest', 'Certifikat', 'Fortsatt stöd'],
      exercises: ['Sluttest', 'Hemprogram']
    }
  ],

  educationTopics: [
    'Artroskunskap',
    'Smärtmekanismer',
    'Fysisk aktivitet',
    'Pacing',
    'Coping-strategier',
    'Livsstilsfaktorer'
  ],
  exerciseComponents: [
    'Progressiv styrketräning',
    'Funktionella övningar',
    'Balans',
    'Aerob träning'
  ],
  selfManagementStrategies: [
    'Pacing',
    'Målsättning',
    'Hemträning',
    'Problemlösning'
  ],

  evidenceLevel: 'A',
  keyOutcomes: [
    'Signifikant smärtreduktion',
    'Förbättrad funktion',
    'Kostnadseffektiv',
    'Hög patientnöjdhet'
  ],
  keyStudies: [
    'Hurley et al. (2007). Clinical effectiveness of a rehabilitation program. Arthritis Rheum.',
    'ESCAPE-pain evaluation reports NHS'
  ],
  sources: ['int_escape_001'],

  origin: 'Kings College London, Storbritannien',
  yearIntroduced: 2014,
  website: 'https://escape-pain.org'
};

// ============================================
// BACK SCHOOL - INTERNATIONELL
// ============================================

export const BACK_SCHOOL_INTERNATIONAL: PatientEducationSchool = {
  id: 'back_school_international',
  name: 'Back School - Internationell ryggskola',
  englishName: 'Back School',
  schoolType: 'ryggskola',
  bodyAreas: ['ländrygg', 'övre_rygg'],
  targetConditions: ['ländryggssmärta', 'kronisk ryggsmärta'],
  targetPopulation: 'Patienter med långvarig ländryggssmärta',
  description: 'Teoretisk och praktisk ryggskola med fokus på anatomi, ergonomi och övningar. Har använts brett internationellt sedan 1970-talet.',
  deliveryFormat: 'grupp',
  totalSessions: 4,
  sessionDuration: 90,

  sessions: [
    {
      number: 1,
      topic: 'Ryggens anatomi och biomekanik',
      duration: 90,
      content: ['Ryggradens uppbyggnad', 'Diskar och leder', 'Muskulatur'],
      exercises: ['Introduktion övningar']
    },
    {
      number: 2,
      topic: 'Ergonomi',
      duration: 90,
      content: ['Arbetsställningar', 'Lyfteknik', 'Sittande och stående'],
      exercises: ['Praktisk ergonomi', 'Övningar']
    },
    {
      number: 3,
      topic: 'Träning och aktivitet',
      duration: 90,
      content: ['Träningsprinciper', 'Styrka och flexibilitet'],
      exercises: ['Träningsprogram']
    },
    {
      number: 4,
      topic: 'Självhantering',
      duration: 90,
      content: ['Smärthantering', 'Vardagsaktiviteter', 'Långsiktig plan'],
      exercises: ['Hemprogram']
    }
  ],

  educationTopics: [
    'Ryggens anatomi',
    'Biomekanik',
    'Ergonomi',
    'Träning',
    'Smärthantering'
  ],
  exerciseComponents: [
    'Stretching',
    'Styrketräning',
    'Core-stabilisering'
  ],
  selfManagementStrategies: [
    'Ergonomiska principer',
    'Daglig träning',
    'Aktivitetspacing'
  ],

  evidenceLevel: 'C',
  keyStudies: [
    'Heymans et al. (2004). Back schools for non-specific low-back pain. Cochrane Review.'
  ],
  sources: ['int_backschool_001'],

  origin: 'Sverige (ursprungligen 1969)',
  yearIntroduced: 1969,
  website: 'https://www.physio-pedia.com/Back_School'
};

// ============================================
// HANDARTROSSKOLA
// ============================================

export const HANDARTROSSKOLA: PatientEducationSchool = {
  id: 'handartrosskola',
  name: 'Handinriktad artrosskola',
  englishName: 'Hand Arthritis School',
  schoolType: 'handskola',
  bodyAreas: ['handled'],
  targetConditions: ['handartros', 'fingerartros', 'tumbasartros'],
  targetPopulation: 'Patienter med symtomgivande handartros',
  description: 'Artrosskola där handleden och fingrar har egna moduler med information, funktionsträning och egenvård, ofta integrerad med arbetsterapeutisk bedömning.',
  deliveryFormat: 'grupp',
  totalSessions: 4,
  sessionDuration: 90,

  sessions: [
    {
      number: 1,
      topic: 'Handartros - kunskap',
      duration: 90,
      content: ['Handens anatomi', 'Artrosprocessen i handen', 'Symtom'],
      exercises: ['Introduktion handövningar']
    },
    {
      number: 2,
      topic: 'Behandling och hjälpmedel',
      duration: 90,
      content: ['Ortoser', 'Hjälpmedel', 'Ledskydd'],
      exercises: ['Rörelseövningar', 'Styrkeövningar']
    },
    {
      number: 3,
      topic: 'Praktisk träning',
      duration: 90,
      content: ['Övningsteknik', 'Ergonomi'],
      exercises: ['Fullständigt handprogram']
    },
    {
      number: 4,
      topic: 'Vardagsaktiviteter',
      duration: 90,
      content: ['Anpassning', 'Energibesparing', 'Långsiktig plan'],
      exercises: ['Hemprogram']
    }
  ],

  educationTopics: [
    'Handens anatomi',
    'Artros i handen',
    'Ledskydd',
    'Hjälpmedel',
    'Ergonomi'
  ],
  exerciseComponents: [
    'Fingerrörlighet',
    'Greppstyrka',
    'Funktionella övningar'
  ],
  selfManagementStrategies: [
    'Dagliga handövningar',
    'Ledskydd',
    'Hjälpmedelsanvändning'
  ],

  evidenceLevel: 'B',
  keyStudies: [
    'Kjeken et al. Hand exercises for osteoarthritis. Cochrane.'
  ],
  sources: ['swe_handartros_001'],

  origin: 'Svenska regioner',
  website: 'https://www.1177.se'
};

// ============================================
// EXPORT - ALLA PATIENTUTBILDNINGSPROGRAM
// ============================================

export const EDUCATION_SCHOOLS: PatientEducationSchool[] = [
  GLAD_PROGRAM,
  SVENSK_ARTROSSKOLA,
  HOFTSKOLA,
  KNASKOLA,
  RYGGSKOLA,
  OSTEOPOROSSKOLA,
  START_BACK,
  ESCAPE_PAIN,
  BACK_SCHOOL_INTERNATIONAL,
  HANDARTROSSKOLA
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Hämta utbildningsprogram baserat på skoltyp
 */
export function getEducationSchoolByType(
  type: PatientEducationSchool['schoolType']
): PatientEducationSchool[] {
  return EDUCATION_SCHOOLS.filter(s => s.schoolType === type);
}

/**
 * Hämta utbildningsprogram baserat på diagnos/tillstånd
 */
export function getEducationSchoolByCondition(condition: string): PatientEducationSchool | undefined {
  const conditionLower = condition.toLowerCase();

  // Artros
  if (conditionLower.includes('artros') || conditionLower.includes('osteoarthritis')) {
    if (conditionLower.includes('höft') || conditionLower.includes('hip')) {
      return GLAD_PROGRAM; // eller HOFTSKOLA
    }
    if (conditionLower.includes('knä') || conditionLower.includes('knee')) {
      return GLAD_PROGRAM; // eller KNASKOLA
    }
    if (conditionLower.includes('hand') || conditionLower.includes('finger')) {
      return HANDARTROSSKOLA;
    }
    return SVENSK_ARTROSSKOLA;
  }

  // Rygg
  if (conditionLower.includes('rygg') || conditionLower.includes('back') ||
      conditionLower.includes('lumba') || conditionLower.includes('ländrygg')) {
    return RYGGSKOLA;
  }

  // Osteoporos
  if (conditionLower.includes('osteoporos') || conditionLower.includes('benskörhet')) {
    return OSTEOPOROSSKOLA;
  }

  return undefined;
}

/**
 * Hämta utbildningsprogram baserat på kroppsdel
 */
export function getEducationSchoolsByBodyArea(bodyArea: BodyArea): PatientEducationSchool[] {
  return EDUCATION_SCHOOLS.filter(s => s.bodyAreas.includes(bodyArea));
}

/**
 * Kontrollera om patient bör erbjudas artrosskola
 */
export function shouldOfferArthritisSchool(conditions: string[]): boolean {
  const arthritisKeywords = ['artros', 'osteoarthritis', 'gonartros', 'coxartros'];
  return conditions.some(c =>
    arthritisKeywords.some(k => c.toLowerCase().includes(k))
  );
}

/**
 * Generera prompt-text för AI baserat på utbildningsprogram
 */
export function generateEducationSchoolPrompt(school: PatientEducationSchool): string {
  return `
📚 PATIENTUTBILDNINGSPROGRAM REKOMMENDERAS:
Program: ${school.name}
Typ: ${school.schoolType}
Målgrupp: ${school.targetPopulation}

PROGRAMSTRUKTUR:
- Antal sessioner: ${school.totalSessions}
- Duration per session: ${school.sessionDuration} minuter
- Format: ${school.deliveryFormat}

INNEHÅLL:
- Utbildning: ${school.educationTopics.slice(0, 4).join(', ')}
- Träning: ${school.exerciseComponents.slice(0, 3).join(', ')}
- Egenvård: ${school.selfManagementStrategies.slice(0, 3).join(', ')}

EVIDENS:
Nivå: ${school.evidenceLevel}
${school.keyOutcomes ? `Resultat: ${school.keyOutcomes[0]}` : ''}

⚠️ REKOMMENDATION: Informera patienten om möjligheten till strukturerad patientutbildning!
`.trim();
}
