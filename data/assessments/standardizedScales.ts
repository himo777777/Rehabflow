/**
 * STANDARDISERADE BEDÖMNINGSSKALOR FÖR REHABILITERING
 *
 * Dessa är validerade, evidensbaserade bedömningsverktyg som används inom
 * fysioterapi för att mäta funktionsnivå och progress.
 *
 * Inkluderar:
 * - ODI (Oswestry Disability Index) - Ländryggssmärta
 * - QuickDASH - Arm/Axel/Hand
 * - KOOS-PS - Knä
 * - HOOS-PS - Höft
 * - TSK-11 - Rörelserädsla (kinesiofobia)
 *
 * Källor:
 * - Fairbank JC, Pynsent PB. J Bone Joint Surg Br. 2000 (ODI)
 * - Beaton DE, et al. J Bone Joint Surg Am. 2005 (QuickDASH)
 * - Perruccio AV, et al. Osteoarthritis Cartilage. 2008 (KOOS-PS)
 * - Davis AM, et al. Osteoarthritis Cartilage. 2008 (HOOS-PS)
 * - Woby SR, et al. Clin J Pain. 2005 (TSK-11)
 */

// ============================================
// INTERFACES
// ============================================

export interface AssessmentQuestion {
  id: string;
  section?: string;
  question: string;
  options: {
    value: number;
    text: string;
  }[];
}

export interface AssessmentScale {
  id: string;
  name: string;
  shortName: string;
  description: string;
  bodyAreas: string[];
  questions: AssessmentQuestion[];
  scoring: {
    minScore: number;
    maxScore: number;
    interpretation: ScoreInterpretation[];
  };
  source: string;
  evidenceLevel: 'A' | 'B' | 'C';
  mcid: number;  // Minimal Clinically Important Difference
}

export interface ScoreInterpretation {
  minPercent: number;
  maxPercent: number;
  level: string;
  description: string;
  clinicalImplication: string;
}

export interface AssessmentResult {
  scaleId: string;
  rawScore: number;
  percentScore: number;
  interpretation: ScoreInterpretation;
  date: string;
  answers: { questionId: string; value: number }[];
}

// ============================================
// ODI - OSWESTRY DISABILITY INDEX (LÄNDRYGGSSMÄRTA)
// ============================================

export const ODI_SCALE: AssessmentScale = {
  id: 'odi',
  name: 'Oswestry Disability Index',
  shortName: 'ODI',
  description: 'Standardiserat frågeformulär för att mäta funktionsnivå vid ländryggssmärta',
  bodyAreas: ['ländrygg', 'rygg', 'bäcken'],
  source: 'Fairbank JC, Pynsent PB. J Bone Joint Surg Br. 2000;82(8):1038-45',
  evidenceLevel: 'A',
  mcid: 10,  // 10 poängs förändring är kliniskt signifikant
  questions: [
    {
      id: 'odi_1',
      section: 'Smärtintensitet',
      question: 'Hur skulle du beskriva din smärta just nu?',
      options: [
        { value: 0, text: 'Jag kan klara smärtan utan smärtstillande mediciner' },
        { value: 1, text: 'Smärtan är besvärande men jag klarar mig utan smärtstillande' },
        { value: 2, text: 'Smärtstillande ger fullständig smärtlindring' },
        { value: 3, text: 'Smärtstillande ger måttlig smärtlindring' },
        { value: 4, text: 'Smärtstillande ger mycket liten smärtlindring' },
        { value: 5, text: 'Smärtstillande har ingen effekt och jag använder dem inte' }
      ]
    },
    {
      id: 'odi_2',
      section: 'Personlig vård',
      question: 'Hur klarar du personlig hygien (tvätta dig, klä dig)?',
      options: [
        { value: 0, text: 'Jag kan sköta min personliga hygien normalt utan extra smärta' },
        { value: 1, text: 'Jag kan sköta mig själv normalt men det ger extra smärta' },
        { value: 2, text: 'Det är smärtsamt och jag måste vara långsam och försiktig' },
        { value: 3, text: 'Jag behöver lite hjälp men klarar det mesta själv' },
        { value: 4, text: 'Jag behöver hjälp varje dag med det mesta' },
        { value: 5, text: 'Jag kan inte klä mig, tvätta mig med svårighet och stannar i sängen' }
      ]
    },
    {
      id: 'odi_3',
      section: 'Lyft',
      question: 'Hur påverkar smärtan din förmåga att lyfta?',
      options: [
        { value: 0, text: 'Jag kan lyfta tunga saker utan extra smärta' },
        { value: 1, text: 'Jag kan lyfta tunga saker men det ger extra smärta' },
        { value: 2, text: 'Smärtan hindrar mig från att lyfta tunga saker från golvet' },
        { value: 3, text: 'Smärtan hindrar mig från att lyfta tunga saker, men jag klarar lätta/medeltunga' },
        { value: 4, text: 'Jag kan endast lyfta mycket lätta saker' },
        { value: 5, text: 'Jag kan inte lyfta eller bära någonting alls' }
      ]
    },
    {
      id: 'odi_4',
      section: 'Gång',
      question: 'Hur påverkar smärtan din förmåga att gå?',
      options: [
        { value: 0, text: 'Smärtan hindrar mig inte från att gå hur långt som helst' },
        { value: 1, text: 'Smärtan hindrar mig från att gå mer än 1,5 km' },
        { value: 2, text: 'Smärtan hindrar mig från att gå mer än 500 meter' },
        { value: 3, text: 'Smärtan hindrar mig från att gå mer än 100 meter' },
        { value: 4, text: 'Jag kan endast gå med käpp eller kryckor' },
        { value: 5, text: 'Jag är sängliggande större delen av tiden' }
      ]
    },
    {
      id: 'odi_5',
      section: 'Sittande',
      question: 'Hur påverkar smärtan din förmåga att sitta?',
      options: [
        { value: 0, text: 'Jag kan sitta i vilken stol som helst hur länge jag vill' },
        { value: 1, text: 'Jag kan sitta i min favoritstol hur länge jag vill' },
        { value: 2, text: 'Smärtan hindrar mig från att sitta mer än 1 timme' },
        { value: 3, text: 'Smärtan hindrar mig från att sitta mer än 30 minuter' },
        { value: 4, text: 'Smärtan hindrar mig från att sitta mer än 10 minuter' },
        { value: 5, text: 'Smärtan hindrar mig helt från att sitta' }
      ]
    },
    {
      id: 'odi_6',
      section: 'Stående',
      question: 'Hur påverkar smärtan din förmåga att stå?',
      options: [
        { value: 0, text: 'Jag kan stå hur länge jag vill utan extra smärta' },
        { value: 1, text: 'Jag kan stå hur länge jag vill men det ger extra smärta' },
        { value: 2, text: 'Smärtan hindrar mig från att stå mer än 1 timme' },
        { value: 3, text: 'Smärtan hindrar mig från att stå mer än 30 minuter' },
        { value: 4, text: 'Smärtan hindrar mig från att stå mer än 10 minuter' },
        { value: 5, text: 'Smärtan hindrar mig helt från att stå' }
      ]
    },
    {
      id: 'odi_7',
      section: 'Sömn',
      question: 'Hur påverkar smärtan din sömn?',
      options: [
        { value: 0, text: 'Min sömn störs aldrig av smärta' },
        { value: 1, text: 'Min sömn störs ibland av smärta' },
        { value: 2, text: 'Jag sover mindre än 6 timmar på grund av smärta' },
        { value: 3, text: 'Jag sover mindre än 4 timmar på grund av smärta' },
        { value: 4, text: 'Jag sover mindre än 2 timmar på grund av smärta' },
        { value: 5, text: 'Smärtan hindrar mig helt från att sova' }
      ]
    },
    {
      id: 'odi_8',
      section: 'Sexliv',
      question: 'Hur påverkar smärtan ditt sexliv (om relevant)?',
      options: [
        { value: 0, text: 'Mitt sexliv är normalt och ger ingen extra smärta' },
        { value: 1, text: 'Mitt sexliv är normalt men ger viss extra smärta' },
        { value: 2, text: 'Mitt sexliv är nästan normalt men mycket smärtsamt' },
        { value: 3, text: 'Mitt sexliv är kraftigt begränsat av smärta' },
        { value: 4, text: 'Mitt sexliv är nästan obefintligt på grund av smärta' },
        { value: 5, text: 'Smärtan hindrar allt sexliv' }
      ]
    },
    {
      id: 'odi_9',
      section: 'Socialt liv',
      question: 'Hur påverkar smärtan ditt sociala liv?',
      options: [
        { value: 0, text: 'Mitt sociala liv är normalt och ger ingen extra smärta' },
        { value: 1, text: 'Mitt sociala liv är normalt men ökar smärtan' },
        { value: 2, text: 'Smärtan påverkar inte mitt sociala liv nämnvärt förutom mer aktiva intressen' },
        { value: 3, text: 'Smärtan har begränsat mitt sociala liv, jag går inte ut lika ofta' },
        { value: 4, text: 'Smärtan har begränsat mitt sociala liv till hemmet' },
        { value: 5, text: 'Jag har inget socialt liv på grund av smärta' }
      ]
    },
    {
      id: 'odi_10',
      section: 'Resor',
      question: 'Hur påverkar smärtan din förmåga att resa?',
      options: [
        { value: 0, text: 'Jag kan resa vart som helst utan smärta' },
        { value: 1, text: 'Jag kan resa vart som helst men det ger extra smärta' },
        { value: 2, text: 'Smärtan är besvärande men jag klarar resor över 2 timmar' },
        { value: 3, text: 'Smärtan begränsar mig till resor under 1 timme' },
        { value: 4, text: 'Smärtan begränsar mig till korta nödvändiga resor under 30 min' },
        { value: 5, text: 'Smärtan hindrar mig från att resa, förutom till läkare/behandling' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 50,
    interpretation: [
      {
        minPercent: 0,
        maxPercent: 20,
        level: 'Minimal',
        description: 'Minimal funktionsnedsättning',
        clinicalImplication: 'Patienten klarar de flesta aktiviteter. Råd om lyft, ergonomi och fysisk aktivitet räcker ofta.'
      },
      {
        minPercent: 21,
        maxPercent: 40,
        level: 'Måttlig',
        description: 'Måttlig funktionsnedsättning',
        clinicalImplication: 'Patienten upplever mer smärta vid sittande, lyft och stående. Konservativ behandling rekommenderas.'
      },
      {
        minPercent: 41,
        maxPercent: 60,
        level: 'Svår',
        description: 'Svår funktionsnedsättning',
        clinicalImplication: 'Smärtan är huvudproblemet i vardagen. Detaljerad undersökning och multimodal behandling krävs.'
      },
      {
        minPercent: 61,
        maxPercent: 80,
        level: 'Invalidiserande',
        description: 'Handikappande funktionsnedsättning',
        clinicalImplication: 'Ryggsmärtan påverkar alla aspekter av livet. Intensiv behandling och ev. multidisciplinär rehabilitering.'
      },
      {
        minPercent: 81,
        maxPercent: 100,
        level: 'Sängliggande',
        description: 'Sängliggande eller överdrivet symptom',
        clinicalImplication: 'Patienten är sängbunden eller överdriver symptom. Uteslut allvarlig patologi.'
      }
    ]
  }
};

// ============================================
// QuickDASH - ARM/AXEL/HAND
// ============================================

export const QUICKDASH_SCALE: AssessmentScale = {
  id: 'quickdash',
  name: 'Quick Disabilities of the Arm, Shoulder and Hand',
  shortName: 'QuickDASH',
  description: 'Kort frågeformulär för att mäta funktionsnivå vid besvär i arm, axel eller hand',
  bodyAreas: ['axel', 'armbåge', 'handled', 'hand', 'fingrar'],
  source: 'Beaton DE, et al. J Bone Joint Surg Am. 2005;87(5):1038-46',
  evidenceLevel: 'A',
  mcid: 11,  // 11 poängs förändring är kliniskt signifikant
  questions: [
    {
      id: 'qd_1',
      question: 'Öppna en ny eller hårt åtdragen burk',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Omöjligt' }
      ]
    },
    {
      id: 'qd_2',
      question: 'Utföra tunga hushållssysslor (städa golv, putsa fönster)',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Omöjligt' }
      ]
    },
    {
      id: 'qd_3',
      question: 'Bära en matkasse eller portfölj',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Omöjligt' }
      ]
    },
    {
      id: 'qd_4',
      question: 'Tvätta ryggen',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Omöjligt' }
      ]
    },
    {
      id: 'qd_5',
      question: 'Använda kniv för att skära mat',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Omöjligt' }
      ]
    },
    {
      id: 'qd_6',
      question: 'Fritidsaktiviteter som kräver viss kraft eller stöt genom arm, axel eller hand (golf, hamring, tennis)',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Omöjligt' }
      ]
    },
    {
      id: 'qd_7',
      question: 'Under den senaste veckan, i vilken utsträckning har ditt arm-, axel- eller handproblem stört ditt normala umgänge med familj, vänner, grannar eller grupper?',
      options: [
        { value: 1, text: 'Inte alls' },
        { value: 2, text: 'Lite' },
        { value: 3, text: 'Måttligt' },
        { value: 4, text: 'Ganska mycket' },
        { value: 5, text: 'Extremt' }
      ]
    },
    {
      id: 'qd_8',
      question: 'Under den senaste veckan, har du varit begränsad i ditt arbete eller andra dagliga aktiviteter på grund av ditt arm-, axel- eller handproblem?',
      options: [
        { value: 1, text: 'Inte alls begränsad' },
        { value: 2, text: 'Lite begränsad' },
        { value: 3, text: 'Måttligt begränsad' },
        { value: 4, text: 'Mycket begränsad' },
        { value: 5, text: 'Kan inte utföra alls' }
      ]
    },
    {
      id: 'qd_9',
      question: 'Smärta i arm, axel eller hand',
      options: [
        { value: 1, text: 'Ingen' },
        { value: 2, text: 'Lätt' },
        { value: 3, text: 'Måttlig' },
        { value: 4, text: 'Svår' },
        { value: 5, text: 'Extrem' }
      ]
    },
    {
      id: 'qd_10',
      question: 'Stickningar (sockerkänsla) i arm, axel eller hand',
      options: [
        { value: 1, text: 'Ingen' },
        { value: 2, text: 'Lätt' },
        { value: 3, text: 'Måttlig' },
        { value: 4, text: 'Svår' },
        { value: 5, text: 'Extrem' }
      ]
    },
    {
      id: 'qd_11',
      question: 'Under den senaste veckan, hur svårt har du haft att sova på grund av smärta i din arm, axel eller hand?',
      options: [
        { value: 1, text: 'Ingen svårighet' },
        { value: 2, text: 'Lätt svårighet' },
        { value: 3, text: 'Måttlig svårighet' },
        { value: 4, text: 'Stor svårighet' },
        { value: 5, text: 'Så svårt att jag inte kan sova' }
      ]
    }
  ],
  scoring: {
    minScore: 11,
    maxScore: 55,
    interpretation: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'Minimal',
        description: 'Liten eller ingen funktionsnedsättning',
        clinicalImplication: 'Patienten fungerar väl. Fokusera på prevention och ergonomi.'
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Måttlig',
        description: 'Måttlig funktionsnedsättning',
        clinicalImplication: 'Vissa aktiviteter är påverkade. Behandling med träning och smärthantering.'
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'Betydande',
        description: 'Betydande funktionsnedsättning',
        clinicalImplication: 'Många aktiviteter är svåra. Intensiv rehabilitering rekommenderas.'
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'Svår',
        description: 'Svår funktionsnedsättning',
        clinicalImplication: 'Allvarlig påverkan på dagliga aktiviteter. Multidisciplinär behandling kan behövas.'
      }
    ]
  }
};

// ============================================
// KOOS-PS - KNÄ (Physical Function Short Form)
// ============================================

export const KOOS_PS_SCALE: AssessmentScale = {
  id: 'koos_ps',
  name: 'Knee injury and Osteoarthritis Outcome Score - Physical Function Short Form',
  shortName: 'KOOS-PS',
  description: 'Kort frågeformulär för att mäta fysisk funktion vid knäbesvär',
  bodyAreas: ['knä'],
  source: 'Perruccio AV, et al. Osteoarthritis Cartilage. 2008;16(5):542-50',
  evidenceLevel: 'A',
  mcid: 10,  // 10 poängs förändring är kliniskt signifikant
  questions: [
    {
      id: 'koos_1',
      question: 'Stiga upp från sittande',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'koos_2',
      question: 'Böja dig ner, t.ex. för att plocka upp ett föremål från golvet',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'koos_3',
      question: 'Gå på ojämn mark',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'koos_4',
      question: 'Vrida/pivotera på belastat ben',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'koos_5',
      question: 'Sitta på huk',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'koos_6',
      question: 'Sitta på knä',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'koos_7',
      question: 'Springa',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 28,
    interpretation: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'God',
        description: 'God fysisk funktion',
        clinicalImplication: 'Knäfunktionen är god. Fokusera på prevention och styrketräning.'
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Måttlig',
        description: 'Måttlig funktionsnedsättning',
        clinicalImplication: 'Vissa aktiviteter är svåra. Träning med fokus på styrka och stabilitet.'
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'Påtaglig',
        description: 'Påtaglig funktionsnedsättning',
        clinicalImplication: 'Betydande begränsningar. Strukturerad rehabilitering rekommenderas.'
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'Svår',
        description: 'Svår funktionsnedsättning',
        clinicalImplication: 'Allvarliga begränsningar i vardagliga aktiviteter. Överväg specialist-remiss.'
      }
    ]
  }
};

// ============================================
// HOOS-PS - HÖFT (Physical Function Short Form)
// ============================================

export const HOOS_PS_SCALE: AssessmentScale = {
  id: 'hoos_ps',
  name: 'Hip Disability and Osteoarthritis Outcome Score - Physical Function Short Form',
  shortName: 'HOOS-PS',
  description: 'Kort frågeformulär för att mäta fysisk funktion vid höftbesvär',
  bodyAreas: ['höft'],
  source: 'Davis AM, et al. Osteoarthritis Cartilage. 2008;16(5):551-9',
  evidenceLevel: 'A',
  mcid: 10,  // 10 poängs förändring är kliniskt signifikant
  questions: [
    {
      id: 'hoos_1',
      question: 'Gå nerför trappor',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'hoos_2',
      question: 'Gå i ojämn terräng',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'hoos_3',
      question: 'Böja dig ner för att plocka upp föremål',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'hoos_4',
      question: 'Ligga i sängen (vända dig, behålla höftens position)',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    },
    {
      id: 'hoos_5',
      question: 'Sitta på huk',
      options: [
        { value: 0, text: 'Ingen svårighet' },
        { value: 1, text: 'Lätt svårighet' },
        { value: 2, text: 'Måttlig svårighet' },
        { value: 3, text: 'Stor svårighet' },
        { value: 4, text: 'Extrem svårighet' }
      ]
    }
  ],
  scoring: {
    minScore: 0,
    maxScore: 20,
    interpretation: [
      {
        minPercent: 0,
        maxPercent: 25,
        level: 'God',
        description: 'God fysisk funktion',
        clinicalImplication: 'Höftfunktionen är god. Fokusera på styrka och rörlighet.'
      },
      {
        minPercent: 26,
        maxPercent: 50,
        level: 'Måttlig',
        description: 'Måttlig funktionsnedsättning',
        clinicalImplication: 'Vissa aktiviteter är påverkade. Riktad träning rekommenderas.'
      },
      {
        minPercent: 51,
        maxPercent: 75,
        level: 'Påtaglig',
        description: 'Påtaglig funktionsnedsättning',
        clinicalImplication: 'Betydande begränsningar i vardagen. Strukturerad rehabilitering behövs.'
      },
      {
        minPercent: 76,
        maxPercent: 100,
        level: 'Svår',
        description: 'Svår funktionsnedsättning',
        clinicalImplication: 'Allvarlig påverkan på livskvalitet. Överväg specialist-konsultation.'
      }
    ]
  }
};

// ============================================
// TSK-11 - RÖRELSERÄDSLA (Tampa Scale of Kinesiophobia)
// ============================================

export const TSK11_SCALE: AssessmentScale = {
  id: 'tsk11',
  name: 'Tampa Scale of Kinesiophobia - Short Version',
  shortName: 'TSK-11',
  description: 'Frågeformulär för att mäta rörelserädsla (kinesiofobia)',
  bodyAreas: ['alla'],
  source: 'Woby SR, et al. Clin J Pain. 2005;21(1):73-80',
  evidenceLevel: 'A',
  mcid: 4,  // 4 poängs förändring är kliniskt signifikant
  questions: [
    {
      id: 'tsk_1',
      question: 'Jag är rädd att jag kan skada mig om jag tränar',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_2',
      question: 'Om jag försökte övervinna smärtan skulle den bli värre',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_3',
      question: 'Min kropp signalerar att det är något allvarligt fel',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_4',
      question: 'Smärtan får mig att känna att min kropp är i fara',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_5',
      question: 'Mitt tillstånd är mer allvarligt än vad de flesta tror',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_6',
      question: 'Jag kan råka skada mig av misstag',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_7',
      question: 'Smärtan innebär att jag har skadat min kropp',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_8',
      question: 'Bara för att något orsakar smärta betyder det inte att det är farligt',
      options: [
        { value: 4, text: 'Stämmer inte alls' }, // OBS: Omvänd scoring
        { value: 3, text: 'Stämmer delvis' },
        { value: 2, text: 'Stämmer till stor del' },
        { value: 1, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_9',
      question: 'Jag är rädd att jag skadar mig själv oavsiktligt',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_10',
      question: 'Det säkraste sättet att undvika mer smärta är att undvika onödiga rörelser',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    },
    {
      id: 'tsk_11',
      question: 'Smärtan låter mig veta när jag ska sluta träna så att jag inte skadar mig',
      options: [
        { value: 1, text: 'Stämmer inte alls' },
        { value: 2, text: 'Stämmer delvis' },
        { value: 3, text: 'Stämmer till stor del' },
        { value: 4, text: 'Stämmer helt' }
      ]
    }
  ],
  scoring: {
    minScore: 11,
    maxScore: 44,
    interpretation: [
      {
        minPercent: 0,
        maxPercent: 36,
        level: 'Låg',
        description: 'Låg rörelserädsla',
        clinicalImplication: 'Patienten har hälsosam inställning till rörelse. Uppmuntra fortsatt aktivitet.'
      },
      {
        minPercent: 37,
        maxPercent: 54,
        level: 'Subklinisk',
        description: 'Subklinisk rörelserädsla',
        clinicalImplication: 'Viss rädsla finns. Ge information om att rörelse är säkert och helande.'
      },
      {
        minPercent: 55,
        maxPercent: 72,
        level: 'Måttlig',
        description: 'Måttlig rörelserädsla',
        clinicalImplication: 'Rörelserädslan påverkar beteendet. Graderad exponering och utbildning krävs.'
      },
      {
        minPercent: 73,
        maxPercent: 100,
        level: 'Hög',
        description: 'Hög rörelserädsla (kinesiofobia)',
        clinicalImplication: 'Stark undvikande beteende. Psykologiskt stöd och gradvis exponering är kritiskt.'
      }
    ]
  }
};

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Beräkna poäng för en bedömningsskala
 */
export function calculateScore(
  scale: AssessmentScale,
  answers: { questionId: string; value: number }[]
): AssessmentResult {
  const rawScore = answers.reduce((sum, a) => sum + a.value, 0);

  // Beräkna procentuell poäng
  let percentScore: number;

  if (scale.id === 'quickdash') {
    // QuickDASH har speciell formel: ((summa/n) - 1) * 25
    percentScore = ((rawScore / answers.length) - 1) * 25;
  } else if (scale.id === 'tsk11') {
    // TSK-11: (raw - min) / (max - min) * 100
    percentScore = ((rawScore - scale.scoring.minScore) /
      (scale.scoring.maxScore - scale.scoring.minScore)) * 100;
  } else {
    // ODI, KOOS-PS, HOOS-PS: (raw / max) * 100
    percentScore = (rawScore / scale.scoring.maxScore) * 100;
  }

  // Hitta tolkning
  const interpretation = scale.scoring.interpretation.find(
    i => percentScore >= i.minPercent && percentScore <= i.maxPercent
  ) || scale.scoring.interpretation[scale.scoring.interpretation.length - 1];

  return {
    scaleId: scale.id,
    rawScore,
    percentScore: Math.round(percentScore * 10) / 10,
    interpretation,
    date: new Date().toISOString(),
    answers
  };
}

/**
 * Hämta rätt bedömningsskala baserat på kroppsområde
 */
export function getScaleForBodyArea(bodyArea: string): AssessmentScale | null {
  const normalizedArea = bodyArea.toLowerCase();

  if (['ländrygg', 'rygg', 'bäcken'].includes(normalizedArea)) {
    return ODI_SCALE;
  }
  if (['axel', 'armbåge', 'handled', 'hand', 'fingrar'].includes(normalizedArea)) {
    return QUICKDASH_SCALE;
  }
  if (normalizedArea === 'knä') {
    return KOOS_PS_SCALE;
  }
  if (normalizedArea === 'höft') {
    return HOOS_PS_SCALE;
  }

  return null;
}

/**
 * Jämför två bedömningsresultat och beräkna förändring
 */
export function compareResults(
  baseline: AssessmentResult,
  followUp: AssessmentResult
): {
  change: number;
  percentChange: number;
  improved: boolean;
  clinicallySignificant: boolean;
  interpretation: string;
} {
  const change = followUp.percentScore - baseline.percentScore;
  const percentChange = (change / baseline.percentScore) * 100;

  // MCID (Minimal Clinically Important Difference)
  const mcid: Record<string, number> = {
    'odi': 10,        // 10 procentenheter för ODI
    'quickdash': 8,   // 8 poäng för QuickDASH
    'koos_ps': 10,    // 10 poäng för KOOS-PS
    'hoos_ps': 10,    // 10 poäng för HOOS-PS
    'tsk11': 4        // 4 poäng för TSK-11
  };

  // För de flesta skalor innebär lägre poäng förbättring
  const improved = change < 0;
  const clinicallySignificant = Math.abs(change) >= (mcid[baseline.scaleId] || 10);

  let interpretation: string;
  if (!clinicallySignificant) {
    interpretation = 'Ingen kliniskt signifikant förändring';
  } else if (improved) {
    interpretation = `Kliniskt signifikant förbättring (${Math.abs(change).toFixed(1)} poäng)`;
  } else {
    interpretation = `Kliniskt signifikant försämring (${Math.abs(change).toFixed(1)} poäng)`;
  }

  return {
    change,
    percentChange,
    improved,
    clinicallySignificant,
    interpretation
  };
}

// ============================================
// EXPORT ALL SCALES
// ============================================

export const ALL_SCALES: AssessmentScale[] = [
  ODI_SCALE,
  QUICKDASH_SCALE,
  KOOS_PS_SCALE,
  HOOS_PS_SCALE,
  TSK11_SCALE
];

export {
  ODI_SCALE as ODI,
  QUICKDASH_SCALE as QuickDASH,
  KOOS_PS_SCALE as KOOS_PS,
  HOOS_PS_SCALE as HOOS_PS,
  TSK11_SCALE as TSK11
};
