/**
 * Red Flag Service - Realtids symptomövervakning
 *
 * Övervakar och varnar för potentiellt farliga symtom baserat på:
 * - Postoperativa protokoll
 * - Allmänna röda flaggor för muskuloskeletala tillstånd
 * - Allvarlighetsgradering (kritisk/varning)
 *
 * VIKTIGT: Detta ersätter INTE medicinsk bedömning.
 * Alla röda flaggor bör leda till kontakt med vårdpersonal.
 */

import { getProtocol, PostOpProtocol } from '../data/protocols/postOpProtocols';

// ============================================
// TYPES
// ============================================

export type RedFlagSeverity = 'critical' | 'warning';

export interface RedFlagCheck {
  symptom: string;
  severity: RedFlagSeverity;
  action: string;
  urgency: 'immediate' | 'same_day' | 'within_48h';
  matchedKeywords: string[];
}

export interface RedFlagReport {
  hasRedFlags: boolean;
  criticalCount: number;
  warningCount: number;
  flags: RedFlagCheck[];
  overallRecommendation: string;
}

// ============================================
// CRITICAL RED FLAGS (Alltid akut)
// ============================================

const CRITICAL_RED_FLAGS: Record<string, {
  keywords: string[];
  action: string;
  riskFactors?: string[];
  clinicalCriteria?: string;
}> = {
  'Cauda equina': {
    keywords: [
      'blåstömningsproblem', 'blåsrubbning', 'urinretention',
      'tarmstörning', 'avföringsproblem', 'sadel', 'sadelbedövning',
      'känselnedsättning', 'genital', 'inkontinens', 'bäckenbotten'
    ],
    action: 'AKUT: Sök akutmottagning omedelbart. Cauda equina-syndrom kräver operation inom timmar.'
  },

  // ===== DVT - DJUP VENTROMBOS (Wells kriterier-baserad) =====
  'DVT (Djup ventrombos)': {
    keywords: [
      // Klassiska DVT-symtom
      'vadsmärta', 'svullen_vad', 'ensidig_bensvullnad', 'bensvullnad',
      'varm_vad', 'rodnad_vad', 'öm_vad', 'spänd_vad',
      'smärta_vid_dorsiflektion', 'homans_tecken', 'ökad_vadvidd',
      // Mätning
      'vadvidd_skillnad', 'omkrets_skillnad',
      // Ödem
      'pittingödem', 'asymmetriskt_ödem', 'ensidig_svullnad',
      // Ytliga vener
      'synliga_vener', 'utvidgade_ytliga_vener', 'kollateral_cirkulation'
    ],
    action: 'AKUT: Ring 112 eller sök akutmottagning omedelbart. Misstänkt DVT kräver akut ultraljud och antikoagulantia. STOPPA ALL TRÄNING tills utredning är klar.',
    riskFactors: [
      'Nylig operation (särskilt höft/knä)',
      'Immobilisering >3 dagar',
      'P-piller/HRT',
      'Malignitet',
      'Tidigare DVT/LE',
      'Graviditet/postpartum',
      'Övervikt',
      'Flygresor >4h',
      'Rökning'
    ],
    clinicalCriteria: 'Wells DVT Score: Vadsvullnad >3cm jämfört med frisk sida + värme + smärta = hög sannolikhet'
  },

  'Lungemboli': {
    keywords: [
      'andnöd', 'plötslig_andnöd', 'svårt_att_andas', 'dyspné',
      'bröstsmärta', 'pleuritsmärta', 'smärta_vid_andning',
      'hosta_blod', 'hemoptys', 'blodig_hosta',
      'hjärtklappning', 'takykardi', 'snabb_puls',
      'yrsel', 'svimning', 'synkope', 'kollaps',
      'ångest', 'oro', 'dödsångest',
      'cyanos', 'blåfärgad'
    ],
    action: 'AKUT: Ring 112 OMEDELBART. Lungemboli är livshotande. Håll dig stilla tills ambulans kommer. Sätt dig upp om andnöd.',
    riskFactors: [
      'Känd DVT eller DVT-symtom',
      'Nylig operation',
      'Immobilisering',
      'Malignitet',
      'Tidigare LE'
    ]
  },

  // ===== CRPS - KOMPLEX REGIONALT SMÄRTSYNDROM (Budapest-kriterier) =====
  'CRPS (Komplex regionalt smärtsyndrom)': {
    keywords: [
      // Sensoriska symtom
      'allodyni', 'hyperalgesi', 'oproportionerlig_smärta', 'brännande_smärta',
      'smärta_vid_beröring', 'överkänslig_hud', 'smärta_utanför_dermatom',

      // Vasomotoriska symtom
      'temperaturskillnad', 'hudfärgsändring', 'asymmetrisk_hudfärg',
      'blå_hud', 'röd_hud', 'blek_hud', 'fläckig_hud',
      'kall_extremitet', 'varm_extremitet', 'temperaturasymmetri',

      // Sudomotoriska/ödem symtom
      'svettning', 'asymmetrisk_svettning', 'ökad_svettning', 'minskad_svettning',
      'ödem', 'svullnad_crps', 'asymmetrisk_svullnad',

      // Motoriska/trofiska symtom
      'stelhet_crps', 'svaghet_crps', 'tremor', 'dystoni',
      'minskad_rom', 'kontraktur', 'rörelserädsla',
      'nagelförändringar', 'hårväxtförändring', 'hudatrofi',
      'tunn_hud', 'glänsande_hud', 'förändrad_behåring',

      // Progressionsindikatorer
      'sprider_sig', 'smärta_som_sprider_sig', 'utstrålande',
      'försämras_trots_behandling', 'kronisk_smärta_efter_skada'
    ],
    action: 'VIKTIGT: Kontakta smärtspecialist eller ortoped omgående (samma dag). Tidig diagnos och behandling av CRPS är avgörande för prognosen. UNDVIK immobilisering - försiktig rörelse är viktig.',
    clinicalCriteria: `Budapest-kriterierna för CRPS:
1. Fortsatt smärta oproportionerlig mot utlösande händelse
2. Minst ett symtom i 3 av 4 kategorier:
   - Sensorisk: Allodyni/hyperalgesi
   - Vasomotorisk: Temperatur-/färgasymmetri
   - Sudomotorisk: Ödem/svettningsförändring
   - Motorisk/trofisk: ROM-nedsättning/trofiska förändringar
3. Minst ett tecken vid undersökning i 2 av 4 kategorier
4. Ingen annan diagnos förklarar symtomen bättre`
  },

  'Infektion': {
    keywords: [
      'hög_feber', 'feber_38', 'frossa', 'rodnad_sår', 'vätskande_sår',
      'svullet_sår', 'illaluktande', 'varbildning', 'sepsis',
      'varm_led', 'röd_led', 'svullen_led', 'septisk_artrit'
    ],
    action: 'AKUT: Kontakta opererande klinik eller akutmottagning. Misstänkt infektion.'
  },

  'Neurologisk försämring': {
    keywords: [
      'progredierande_svaghet', 'tilltagande_domningar', 'förlamning',
      'dubbelseende', 'talsvårigheter', 'förvirring', 'medvetslöshet',
      'kramper', 'plötslig_huvudvärk'
    ],
    action: 'AKUT: Ring 112. Neurologisk akutsituation.'
  },

  'Ledluxation': {
    keywords: [
      'hoppar_ur_led', 'luxation', 'ur_led', 'knäckte', 'felställning',
      'oförmåga_att_röra', 'låser_sig', 'instabil', 'ger_vika'
    ],
    action: 'AKUT: Rör inte leden. Sök akutmottagning för reponering.'
  },

  'Kompartmentsyndrom': {
    keywords: [
      'extrem_smärta', 'ökande_smärta_trots_medicin', 'spänd_muskulatur',
      'parestesi', 'pulsförlust', 'blek_extremitet', 'kall_extremitet',
      '5p_pain', '5p_pallor', '5p_pulselessness', '5p_paresthesia', '5p_paralysis'
    ],
    action: 'AKUT: Ring 112. Kompartmentsyndrom kräver akut kirurgi inom 6 timmar för att förhindra permanent skada.',
    clinicalCriteria: '5 P: Pain (out of proportion), Pallor, Pulselessness, Paresthesia, Paralysis'
  },

  // ===== FRAKTUR/STRESSFRAKTUR =====
  'Misstänkt fraktur': {
    keywords: [
      'knäckande_ljud', 'krasch', 'deformitet', 'felställd',
      'oförmögen_att_belasta', 'kan_inte_gå', 'punktömhet',
      'svullnad_efter_fall', 'blåmärke_efter_trauma',
      'stressfraktur', 'belastningssmärta', 'nattlig_värk_ben'
    ],
    action: 'AKUT: Immobilisera och sök akutmottagning för röntgen. Belasta inte.'
  },

  // ===== SEPTISK ARTRIT =====
  'Septisk artrit': {
    keywords: [
      'het_led', 'akut_ledsvullnad', 'röd_led', 'feber_led',
      'orörlighet_led', 'intensiv_ledsmärta', 'frossa_led',
      'plötslig_ledinflammation'
    ],
    action: 'AKUT: Sök akutmottagning omedelbart. Septisk artrit kräver akut ledpunktion och antibiotika.',
    clinicalCriteria: 'Akut monoartrit + feber + CRP/SR-stegring = misstänkt septisk artrit tills motsatsen bevisats'
  },

  // ===== STROKE - FAST KRITERIER =====
  'Stroke (FAST)': {
    keywords: [
      // Face - Ansiktsförlamning
      'ansiktsförlamning', 'droppande_mungipa', 'sned_mun', 'asymmetriskt_ansikte',
      'halva_ansiktet', 'hängande_mungipa', 'kan_inte_le_symmetriskt',
      // Arm - Armsvaghet
      'arm_faller', 'kan_inte_lyfta_arm', 'ensidig_svaghet', 'domning_arm',
      'arm_sjunker', 'svag_arm', 'ensidig_armsvaghet', 'kraftlös_arm',
      // Speech - Talsvårigheter
      'sluddrigt_tal', 'svårt_att_prata', 'förvirrat_tal', 'kan_inte_hitta_ord',
      'otydligt_tal', 'obegripligt_tal', 'talrubbning', 'afasi',
      // Time - Plötslig debut + övriga symtom
      'plötslig_huvudvärk', 'värsta_huvudvärken', 'åskknallshuvudvärk',
      'synförlust', 'dubbelseende', 'plötsligt_dubbelseende',
      'yrsel_plötslig', 'balansförlust', 'koordinationssvårigheter',
      'plötslig_förvirring', 'medvetandeförändring'
    ],
    action: 'AKUT: Ring 112 OMEDELBART. Stroke kräver behandling inom 4.5 timmar. FAST: Face (le), Arm (lyft båda), Speech (enkla meningar), Time (ring 112). Notera exakt tid symtomen började.',
    clinicalCriteria: 'FAST-protokoll: F=Face (be personen le - hänger ena sidan?), A=Arm (be lyfta båda - sjunker en?), S=Speech (be upprepa mening - sluddrigt?), T=Time (varje minut räknas). Trombolys inom 4.5h, trombektomi inom 6-24h.'
  },

  // ===== HJÄRTINFARKT (MI) =====
  'Hjärtinfarkt (MI)': {
    keywords: [
      // Typisk presentation
      'tryck_över_bröstet', 'elefant_på_bröstet', 'kramande_bröstsmärta',
      'pressande_bröstsmärta', 'bröstsmärta_ansträngning', 'central_bröstsmärta',
      'utstrålande_vänster_arm', 'utstrålning_arm', 'smärta_vänster_arm',
      'käksmärta', 'smärta_käke', 'utstrålning_käke',
      'kallsvettig', 'kallsvett', 'svettning_bröstsmärta',
      // Atypisk presentation (kvinnor, äldre, diabetiker)
      'illamående_utan_orsak', 'illamående_bröstsmärta',
      'extrem_trötthet', 'ovanlig_trötthet', 'utmattning_plötslig',
      'magsmärta_kvinna', 'buksmärta_hjärta', 'obehag_övre_buk',
      'andnöd_utan_ansträngning', 'andnöd_vila', 'andfåddhet_plötslig',
      'ångest_dödsångest', 'oro_hjärta', 'impending_doom',
      // Övriga
      'ryggsmärta_bröstsmärta', 'utstrålning_rygg',
      'bröstsmärta_vilosmärta', 'bröstsmärta_längre_15min'
    ],
    action: 'AKUT: Ring 112 OMEDELBART. Tugga 1 aspirin (500mg) om tillgänglig och ej allergisk. Sitt eller ligg stilla. Lossa åtsittande kläder. Var beredd på HLR.',
    clinicalCriteria: 'Typisk: Bröstsmärta >15min + utstrålning till arm/käke/rygg + kallsvett + illamående. Atypisk (kvinnor/äldre/diabetiker): Andnöd, trötthet, buksmärta, illamående utan typisk bröstsmärta.',
    riskFactors: [
      'Högt blodtryck',
      'Diabetes',
      'Högt kolesterol',
      'Rökning',
      'Övervikt',
      'Familjehistorik hjärtsjukdom',
      'Tidigare hjärtinfarkt',
      'Stillasittande livsstil'
    ]
  },

  // ===== DIABETISK KETOACIDOS (DKA) / HHS =====
  'Diabetisk ketoacidos (DKA/HHS)': {
    keywords: [
      // DKA-specifika
      'fruktlukt_andedräkt', 'aceton_andedräkt', 'söt_andedräkt',
      'djup_snabb_andning', 'kussmaul_andning', 'hyperventilering_diabetes',
      'illamående_kräkningar_diabetes', 'kräkning_diabetiker',
      'buksmärta_diabetes', 'magsmärta_diabetiker',
      'förvirring_diabetes', 'omtöcknad_diabetes',
      'mycket_törstig', 'extrem_törst', 'polydipsi',
      'kissar_mycket', 'polyuri', 'urinerar_ofta',
      // HHS-specifika (hyperosmolärt hyperglykemiskt syndrom)
      'uttorkning_diabetes', 'kraftig_dehydrering',
      'dåsig_diabetes', 'sömnig_diabetiker',
      'medvetslöshet_diabetes', 'koma_diabetes',
      // Allmänna
      'högt_blodsocker', 'hyperglykemi', 'blodsocker_över_20',
      'trötthet_diabetes', 'svaghet_diabetes'
    ],
    action: 'AKUT: Ring 112 OMEDELBART. DKA/HHS är livshotande. Kontrollera blodsocker om möjligt. Ge INTE insulin själv. Ge vatten om personen är vaken.',
    clinicalCriteria: 'DKA: Blodsocker >14mmol/L + ketoner (fruktlukt) + Kussmaul-andning + metabol acidos. HHS: Blodsocker >33mmol/L + kraftig dehydrering + förvirring/koma utan ketoacidos. Vanligare hos äldre typ 2-diabetiker.'
  },

  // ===== ANAFYLAXI =====
  'Anafylaxi': {
    keywords: [
      // Hud (tidig)
      'nässelutslag', 'urtikaria', 'klåda_hela_kroppen', 'hudutslag_allergi',
      'rodnad_allergi', 'svullnad_ansikte', 'svullnad_läppar',
      // Angioödem
      'svullnad_tunga', 'svullen_tunga', 'svullnad_hals', 'svullen_hals',
      'klump_i_halsen', 'svårt_att_svälja', 'halsen_svullnar',
      // Luftvägar
      'heshet', 'stridor', 'pipig_andning', 'väsande_andning',
      'pip_i_bröstet', 'astmaliknande', 'svårt_att_andas_allergi',
      'lufthunger', 'andnöd_allergi', 'kvävningskänsla',
      // Cirkulation
      'yrsel_allergisk', 'svimfärdig_allergi', 'blodtrycksfall',
      'snabb_puls_allergi', 'svag_puls',
      'medvetslöshet_allergi', 'kollaps_allergi',
      // Mag-tarm
      'illamående_allergi', 'kräkning_allergi', 'diarré_allergi',
      'magkramper_allergi',
      // Utlösare (kontext)
      'efter_bistick', 'efter_mat', 'efter_medicin', 'allergisk_reaktion'
    ],
    action: 'AKUT: Ring 112 OMEDELBART. Om ADRENALINPENNA (EpiPen) finns: Ge i yttre lårmuskeln DIREKT. Lägg personen ner med benen högt (ej om andningssvårigheter - då sittande). Var beredd på HLR.',
    clinicalCriteria: 'Snabb progression: Urtikaria/klåda → Angioödem (ansikte/tunga/svalg) → Luftvägsobstruktion → Anafylaktisk chock (hypotension, medvetslöshet). Bifasisk reaktion kan ske 6-12h efter initial reaktion.'
  },

  // ===== RABDOMYOLYS =====
  'Rabdomyolys': {
    keywords: [
      // Urinförändring (patognomont)
      'mörk_urin', 'cola_urin', 'te_urin', 'brun_urin', 'myoglobinuri',
      'rödbrun_urin', 'urin_som_cola', 'missfärgad_urin_träning',
      // Muskelsmärta
      'extrem_muskelsmärta', 'svår_muskelsmärta', 'outhärdlig_muskelsmärta',
      'smärta_efter_träning', 'muskelvärk_extrem',
      // Muskelsvullnad/svaghet
      'svullna_muskler', 'uppsvällda_muskler', 'stel_efter_träning',
      'svaghet_efter_träning', 'kraftlöshet_efter_träning',
      // Systemiska symtom
      'illamående_efter_träning', 'kräkning_efter_träning',
      'förvirring_efter_träning', 'yrsel_efter_träning',
      'feber_efter_träning', 'hjärtklappning_efter_träning',
      // Kontext
      'crossfit_smärta', 'första_träningen', 'ovanligt_hård_träning',
      'kollapsade_efter_träning', 'oförmögen_att_röra_sig'
    ],
    action: 'AKUT: Sök akutmottagning OMEDELBART. Drick stora mängder vatten NU. Risk för akut njursvikt. Ta inte smärtstillande (NSAID). Vila totalt.',
    clinicalCriteria: 'CK (kreakinkinas) >5x normalt + myoglobinuri (mörk urin) + muskelsmärta/svaghet. Komplikationer: Akut njursvikt, elektrolytrubbningar (hyperkalemi), DIC. Utlösare: Extrem träning, crush-skador, statiner, värme, droger.',
    riskFactors: [
      'Statinbehandling + intensiv träning',
      'Extrem träning utan uppvärmning',
      'Otränad + hård träning',
      'Dehydrering',
      'Värme/hög fuktighet',
      'Alkohol/drogintag',
      'Tidigare episod'
    ]
  },

  // ===== VÄRMESLAG / HYPERTHERMI =====
  'Värmeslag (Hypertermi)': {
    keywords: [
      // Klassiska tecken
      'slutat_svettas', 'torr_hud', 'het_torr_hud', 'ingen_svettning',
      'hög_kroppstemperatur', 'feber_träning', 'överhettad',
      'het_hud', 'glödande_hud', 'röd_het_hud',
      // CNS-påverkan
      'förvirring_värme', 'desorientering_värme', 'aggressivitet_värme',
      'kramper_värme', 'krampanfall_träning', 'epilepsi_träning',
      'medvetslöshet_värme', 'kollaps_värme', 'svimmade_värme',
      // Andra symtom
      'huvudvärk_värme', 'yrsel_värme', 'illamående_värme',
      'kräkning_värme', 'snabb_puls_värme', 'andnöd_värme',
      // Kontext
      'träning_i_värme', 'het_dag', 'solsting', 'utomhus_kollaps'
    ],
    action: 'AKUT: Ring 112 OMEDELBART. STOPPA all aktivitet. Flytta till skugga/sval plats. Kyl ner med vatten, is, våta handdukar. Fläkta. Om medvetslös: stabilt sidoläge. GE INTE vätska om ej fullt vaken.',
    clinicalCriteria: 'Kroppstemperatur >40°C + CNS-påverkan (förvirring, kramper, medvetslöshet) + upphörd eller nedsatt svettning. Klassisk värmeslag: Äldre, barn, kroniskt sjuka. Ansträngningsutlöst: Unga atleter.'
  },

  // ===== HYPOTERMI =====
  'Hypotermi (Nedkylning)': {
    keywords: [
      // Tidiga tecken
      'frysning', 'okontrollerad_skakning', 'kraftig_huttrande',
      'kall_hud', 'blek_hud_kyla', 'blåaktig_hud',
      // Progressiva symtom
      'sluddrigt_tal_kyla', 'fumlig', 'klumpig',
      'förvirring_kyla', 'dåsighet_kyla', 'trött_kyla',
      'minskad_huttrning', 'slutat_skaka', 'paradoxal_avklädning',
      'medvetslöshet_kyla', 'stel_kropp',
      // Kontext
      'vattendrunkning', 'kallt_vatten', 'utomhus_kyla', 'nattlig_kyla'
    ],
    action: 'AKUT: Ring 112. Ta personen till värme. Ta av våta kläder, lägg på varma filtar/kläder. Värm SAKTA - ej varm dusch/bad. Om vaken: varma drycker (ej alkohol). Om medvetslös: stabilt sidoläge, HLR-beredskap.',
    clinicalCriteria: 'Mild (32-35°C): Huttrning, trötthet. Måttlig (28-32°C): Förvirring, slutar huttra. Svår (<28°C): Medvetslöshet, hjärtrytmrubbningar. Paradoxal avklädning kan förekomma vid svår hypotermi.'
  },

  // ===== SYNKOPE (Svimning) =====
  'Synkope (Svimning)': {
    keywords: [
      // Beskrivning av svimning
      'svimmade', 'blackout', 'förlorade_medvetandet',
      'vaknade_på_golvet', 'minns_inte', 'svartnade',
      'kollapsade', 'föll_ihop',
      // Prodromalsymtom
      'blev_yr', 'tunnelseende', 'hörde_susande', 'ringde_i_öronen',
      'illamående_före_svimning', 'kallsvettig_före_svimning',
      'bleknade', 'mörkt_för_ögonen', 'svartnade_för_ögonen',
      // Kardiella varningssignaler
      'svimmade_vid_ansträngning', 'svimning_träning', 'kollaps_under_träning',
      'hjärtklappning_före_svimning', 'oregelbunden_puls_före_svimning',
      'bröstsmärta_före_svimning', 'andnöd_före_svimning',
      // Återkommande
      'svimmat_flera_gånger', 'återkommande_svimningar'
    ],
    action: 'VARNING: AVBRYT TRÄNINGEN omedelbart. Lägg ner med benen högt. Kontakta vårdgivare SAMMA DAG - synkope kan dölja hjärtsjukdom. Om svimning under ansträngning eller med bröstsmärta: Ring 112.',
    clinicalCriteria: 'Differentialdiagnos: Vasovagal/reflexsynkope (godartad, triggad av stress/värme/stående) vs Kardiell synkope (farlig: arytmi, aortastenos, HCM - kräver utredning) vs Ortostatisk (läkemedel, dehydrering). Röda flaggor: Ansträngningsutlöst, bröstsmärta, familjehistorik plötslig hjärtdöd.'
  }
};

// ============================================
// WARNING RED FLAGS (Kontakt inom 24-48h)
// ============================================

const WARNING_RED_FLAGS: Record<string, {
  keywords: string[];
  action: string;
}> = {
  'Ökad svullnad': {
    keywords: [
      'ökad_svullnad', 'svullnat_mer', 'tilltagande_svullnad',
      'svullnad_som_inte_minskar', 'växande_svullnad'
    ],
    action: 'Kontakta vårdgivare inom 24-48 timmar. Vila, is, elevation.'
  },
  'Ökad smärta': {
    keywords: [
      'ökad_smärta', 'värre_smärta', 'smärta_ökar', 'smärta_trots_medicin',
      'nattlig_smärta', 'vilosmärta'
    ],
    action: 'Kontakta vårdgivare om smärtan inte förbättras inom 24-48 timmar.'
  },
  'Rörelseinskränkning': {
    keywords: [
      'stel', 'kan_inte_böja', 'kan_inte_sträcka', 'låst',
      'minskad_rörlighet', 'förlust_av_rörlighet'
    ],
    action: 'Dokumentera och kontakta fysioterapeut. Kan behöva justerad behandling.'
  },
  'Instabilitet': {
    keywords: [
      'viker_sig', 'ger_vika', 'ostadigt', 'instabil_känsla',
      'sviktar', 'osäker_gång'
    ],
    action: 'Kontakta vårdgivare. Kan tyda på bristfällig läkning eller re-ruptur.'
  },
  'Nervpåverkan': {
    keywords: [
      'domningar', 'stickningar', 'pirrningar', 'känselnedsättning',
      'svaghet_arm', 'svaghet_ben', 'tappa_grepp'
    ],
    action: 'Kontakta vårdgivare. Nervpåverkan bör utredas.'
  },
  'Sårproblem': {
    keywords: [
      'öppet_sår', 'sårläkning', 'sårkanter', 'blödning_sår',
      'röd_sårrand'
    ],
    action: 'Håll såret rent och torrt. Kontakta vårdgivare om det inte förbättras.'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalisera text för jämförelse
 */
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Kontrollera om symtom innehåller nyckelord
 */
function matchesKeywords(symptom: string, keywords: string[]): string[] {
  const normalizedSymptom = normalizeText(symptom);
  const words = normalizedSymptom.split('_');

  return keywords.filter(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    // Exakt match
    if (normalizedSymptom.includes(normalizedKeyword)) {
      return true;
    }
    // Ord för ord match
    return words.some(word => word.includes(normalizedKeyword) || normalizedKeyword.includes(word));
  });
}

/**
 * Klassificera symtom som kritiskt
 */
function isCriticalSymptom(symptom: string): { isCritical: boolean; name: string; keywords: string[] } | null {
  for (const [name, data] of Object.entries(CRITICAL_RED_FLAGS)) {
    const matchedKeywords = matchesKeywords(symptom, data.keywords);
    if (matchedKeywords.length > 0) {
      return { isCritical: true, name, keywords: matchedKeywords };
    }
  }
  return null;
}

/**
 * Klassificera symtom som varning
 */
function isWarningSymptom(symptom: string): { isWarning: boolean; name: string; keywords: string[] } | null {
  for (const [name, data] of Object.entries(WARNING_RED_FLAGS)) {
    const matchedKeywords = matchesKeywords(symptom, data.keywords);
    if (matchedKeywords.length > 0) {
      return { isWarning: true, name, keywords: matchedKeywords };
    }
  }
  return null;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Kontrollera röda flaggor baserat på aktuella symtom och protokoll
 */
export function checkRedFlags(
  currentSymptoms: string[],
  surgeryType?: string
): RedFlagReport {
  const flags: RedFlagCheck[] = [];
  let criticalCount = 0;
  let warningCount = 0;

  // Hämta protokoll-specifika röda flaggor
  let protocolRedFlags: string[] = [];
  if (surgeryType) {
    const protocol = getProtocol(surgeryType);
    if (protocol) {
      protocolRedFlags = protocol.redFlags;
    }
  }

  // Analysera varje symtom
  for (const symptom of currentSymptoms) {
    // Kolla kritiska flaggor först
    const critical = isCriticalSymptom(symptom);
    if (critical) {
      flags.push({
        symptom: critical.name,
        severity: 'critical',
        action: CRITICAL_RED_FLAGS[critical.name].action,
        urgency: 'immediate',
        matchedKeywords: critical.keywords
      });
      criticalCount++;
      continue;
    }

    // Kolla varningsflaggor
    const warning = isWarningSymptom(symptom);
    if (warning) {
      flags.push({
        symptom: warning.name,
        severity: 'warning',
        action: WARNING_RED_FLAGS[warning.name].action,
        urgency: 'within_48h',
        matchedKeywords: warning.keywords
      });
      warningCount++;
      continue;
    }

    // Kolla protokoll-specifika flaggor
    for (const protocolFlag of protocolRedFlags) {
      const matchedKeywords = matchesKeywords(symptom, [protocolFlag]);
      if (matchedKeywords.length > 0) {
        flags.push({
          symptom: protocolFlag,
          severity: 'warning',
          action: `Protokoll-specifik varning: ${protocolFlag}. Kontakta din fysioterapeut.`,
          urgency: 'same_day',
          matchedKeywords
        });
        warningCount++;
      }
    }
  }

  // Ta bort duplikat
  const uniqueFlags = flags.filter((flag, index, self) =>
    index === self.findIndex(f => f.symptom === flag.symptom)
  );

  // Skapa övergripande rekommendation
  let overallRecommendation = '';
  if (uniqueFlags.some(f => f.severity === 'critical')) {
    overallRecommendation = '🚨 AKUT: Du har symtom som kräver omedelbar medicinsk bedömning. Kontakta akutmottagning eller ring 112.';
  } else if (uniqueFlags.length > 0) {
    overallRecommendation = '⚠️ VARNING: Du har symtom som bör bedömas av vårdpersonal. Kontakta din vårdgivare inom 24-48 timmar.';
  } else {
    overallRecommendation = '✅ Inga röda flaggor identifierade. Fortsätt följa ditt rehabiliteringsprogram.';
  }

  return {
    hasRedFlags: uniqueFlags.length > 0,
    criticalCount,
    warningCount,
    flags: uniqueFlags,
    overallRecommendation
  };
}

/**
 * Kontrollera enskilt symtom
 */
export function checkSingleSymptom(symptom: string, surgeryType?: string): RedFlagCheck | null {
  const report = checkRedFlags([symptom], surgeryType);
  return report.flags.length > 0 ? report.flags[0] : null;
}

/**
 * Hämta alla röda flaggor för ett specifikt protokoll
 */
export function getProtocolRedFlags(surgeryType: string): string[] {
  const protocol = getProtocol(surgeryType);
  return protocol?.redFlags || [];
}

/**
 * Formatera röda flaggor för visning i UI
 */
export function formatRedFlagsForDisplay(report: RedFlagReport): {
  title: string;
  alerts: Array<{
    icon: string;
    title: string;
    message: string;
    variant: 'destructive' | 'warning' | 'default';
  }>;
} {
  if (!report.hasRedFlags) {
    return {
      title: 'Inga varningar',
      alerts: []
    };
  }

  const alerts = report.flags.map(flag => ({
    icon: flag.severity === 'critical' ? '🚨' : '⚠️',
    title: flag.symptom,
    message: flag.action,
    variant: (flag.severity === 'critical' ? 'destructive' : 'warning') as 'destructive' | 'warning' | 'default'
  }));

  return {
    title: report.criticalCount > 0
      ? `${report.criticalCount} akut(a) varning(ar)`
      : `${report.warningCount} varning(ar)`,
    alerts
  };
}

/**
 * Kontrollera om träning bör avbrytas baserat på symtom
 */
export function shouldStopExercise(currentSymptoms: string[]): {
  shouldStop: boolean;
  reason?: string;
} {
  const report = checkRedFlags(currentSymptoms);

  // Stoppa omedelbart vid kritiska symtom
  if (report.criticalCount > 0) {
    const criticalFlag = report.flags.find(f => f.severity === 'critical');
    return {
      shouldStop: true,
      reason: `STOPPA TRÄNINGEN: ${criticalFlag?.symptom}. ${criticalFlag?.action}`
    };
  }

  // Stoppa vid flera varningar
  if (report.warningCount >= 2) {
    return {
      shouldStop: true,
      reason: 'Flera varningssymtom identifierade. Vila och kontakta vårdgivare.'
    };
  }

  return { shouldStop: false };
}

/**
 * Skapa symptomfrågor för uppföljning
 */
export function generateSymptomQuestions(surgeryType?: string): string[] {
  const baseQuestions = [
    'Har du upplevt ökad smärta sedan förra träningen?',
    'Har du märkt ökad svullnad?',
    'Har du haft feber eller frossa?',
    'Har du känt domningar eller stickningar?',
    'Känns leden stabil när du belastar?'
  ];

  if (surgeryType) {
    const protocol = getProtocol(surgeryType);
    if (protocol) {
      // Lägg till protokoll-specifika frågor baserat på röda flaggor
      const specificQuestions = protocol.redFlags.slice(0, 3).map(flag =>
        `Har du upplevt: ${flag.toLowerCase()}?`
      );
      return [...baseQuestions, ...specificQuestions];
    }
  }

  return baseQuestions;
}

// ============================================
// DVT SCREENING (Wells Score-baserad)
// ============================================

export interface DVTScreeningResult {
  wellsScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  probability: string;
  recommendation: string;
  requiresUrgentAssessment: boolean;
  symptoms: string[];
  riskFactors: string[];
}

/**
 * DVT-screening baserad på Wells kriterier (förenklad)
 * OBS: Ersätter INTE klinisk bedömning
 */
export function screenForDVT(
  symptoms: {
    calfSwelling: boolean;        // Vadsvullnad
    calfPain: boolean;            // Vadsmärta
    warmCalf: boolean;            // Varm vad
    pittingEdema: boolean;        // Pittingödem
    dilatedVeins: boolean;        // Synliga ytliga vener
    unilateral: boolean;          // Ensidig
    recentImmobilization: boolean; // Nylig immobilisering
  },
  riskFactors: {
    recentSurgery: boolean;       // Operation senaste 4 veckorna
    cancer: boolean;              // Aktiv cancer
    previousDVT: boolean;         // Tidigare DVT
    bedriddenOver3Days: boolean;  // Sängliggande >3 dagar
    paralysis: boolean;           // Pares/plegisk ben
  }
): DVTScreeningResult {
  let score = 0;
  const presentSymptoms: string[] = [];
  const presentRiskFactors: string[] = [];

  // Wells DVT kriterier (modifierade för screening)
  if (symptoms.calfSwelling && symptoms.unilateral) {
    score += 3;
    presentSymptoms.push('Ensidig vadsvullnad (>3cm jämfört med andra benet)');
  }
  if (symptoms.calfPain) {
    score += 1;
    presentSymptoms.push('Vadsmärta');
  }
  if (symptoms.warmCalf) {
    score += 1;
    presentSymptoms.push('Varm vad');
  }
  if (symptoms.pittingEdema) {
    score += 1;
    presentSymptoms.push('Pittingödem');
  }
  if (symptoms.dilatedVeins) {
    score += 1;
    presentSymptoms.push('Synliga kollaterala ytliga vener');
  }
  if (riskFactors.recentSurgery) {
    score += 1;
    presentRiskFactors.push('Nylig operation (inom 4 veckor)');
  }
  if (riskFactors.cancer) {
    score += 1;
    presentRiskFactors.push('Aktiv cancersjukdom');
  }
  if (riskFactors.previousDVT) {
    score += 1;
    presentRiskFactors.push('Tidigare DVT/lungemboli');
  }
  if (riskFactors.bedriddenOver3Days || symptoms.recentImmobilization) {
    score += 1;
    presentRiskFactors.push('Immobilisering >3 dagar');
  }
  if (riskFactors.paralysis) {
    score += 1;
    presentRiskFactors.push('Pares/paralys i benet');
  }

  // Riskbedömning
  let riskLevel: DVTScreeningResult['riskLevel'];
  let probability: string;
  let recommendation: string;
  let requiresUrgentAssessment: boolean;

  if (score >= 3) {
    riskLevel = 'high';
    probability = 'Hög sannolikhet för DVT (~50-75%)';
    recommendation = 'AKUT: Sök akutmottagning omedelbart för ultraljud och D-dimer. STOPPA TRÄNING.';
    requiresUrgentAssessment = true;
  } else if (score >= 1) {
    riskLevel = 'moderate';
    probability = 'Måttlig sannolikhet för DVT (~15-25%)';
    recommendation = 'Kontakta vårdgivare idag för bedömning och ev. D-dimer. Undvik intensiv träning.';
    requiresUrgentAssessment = true;
  } else {
    riskLevel = 'low';
    probability = 'Låg sannolikhet för DVT (<5%)';
    recommendation = 'DVT osannolikt, men kontakta vårdgivare om symtomen kvarstår eller förvärras.';
    requiresUrgentAssessment = false;
  }

  return {
    wellsScore: score,
    riskLevel,
    probability,
    recommendation,
    requiresUrgentAssessment,
    symptoms: presentSymptoms,
    riskFactors: presentRiskFactors
  };
}

// ============================================
// CRPS SCREENING (Budapest-kriterier)
// ============================================

export interface CRPSScreeningResult {
  meetsScreeningCriteria: boolean;
  categoriesAffected: {
    sensory: boolean;
    vasomotor: boolean;
    sudomotor: boolean;
    motorTrophic: boolean;
  };
  symptomCount: number;
  riskLevel: 'unlikely' | 'possible' | 'probable';
  recommendation: string;
  detailedSymptoms: Record<string, string[]>;
  urgency: 'routine' | 'soon' | 'urgent';
}

/**
 * CRPS-screening baserad på Budapest-kriterierna
 * Klinisk diagnos kräver professionell bedömning
 */
export function screenForCRPS(
  symptoms: {
    // Sensoriska
    allodynia: boolean;           // Smärta vid lätt beröring
    hyperalgesia: boolean;        // Överdriven smärtreaktion
    disproportionatePain: boolean; // Smärta oproportionerlig mot skada

    // Vasomotoriska
    temperatureAsymmetry: boolean; // Temperaturskillnad mellan extremiteter
    skinColorChange: boolean;      // Hudfärgsförändring
    asymmetricSkinColor: boolean;  // Asymmetrisk hudfärg

    // Sudomotoriska/ödem
    edema: boolean;                // Svullnad
    sweatingChanges: boolean;      // Förändrad svettning
    asymmetricSweating: boolean;   // Asymmetrisk svettning

    // Motoriska/trofiska
    decreasedROM: boolean;         // Minskad rörlighet
    weakness: boolean;             // Svaghet
    tremor: boolean;               // Tremor/skakningar
    dystonia: boolean;             // Dystoni
    trophicChanges: boolean;       // Nagel/hår/hudförändringar
  },
  context: {
    daysSinceInjury: number;       // Dagar sedan skada/operation
    painGettingWorse: boolean;     // Smärtan förvärras
    painSpreading: boolean;        // Smärtan sprider sig
    normalHealingExpected: boolean; // Normal läkning förväntad vid detta stadium
  }
): CRPSScreeningResult {
  const detailedSymptoms: Record<string, string[]> = {
    sensory: [],
    vasomotor: [],
    sudomotor: [],
    motorTrophic: []
  };

  // Sensoriska (minst 1 krävs)
  if (symptoms.allodynia) detailedSymptoms.sensory.push('Allodyni (smärta vid lätt beröring)');
  if (symptoms.hyperalgesia) detailedSymptoms.sensory.push('Hyperalgesi (överdriven smärtreaktion)');
  if (symptoms.disproportionatePain) detailedSymptoms.sensory.push('Oproportionerlig smärta');

  // Vasomotoriska (minst 1 krävs)
  if (symptoms.temperatureAsymmetry) detailedSymptoms.vasomotor.push('Temperaturasymmetri');
  if (symptoms.skinColorChange) detailedSymptoms.vasomotor.push('Hudfärgsförändring');
  if (symptoms.asymmetricSkinColor) detailedSymptoms.vasomotor.push('Asymmetrisk hudfärg');

  // Sudomotoriska/ödem (minst 1 krävs)
  if (symptoms.edema) detailedSymptoms.sudomotor.push('Ödem');
  if (symptoms.sweatingChanges) detailedSymptoms.sudomotor.push('Förändrad svettning');
  if (symptoms.asymmetricSweating) detailedSymptoms.sudomotor.push('Asymmetrisk svettning');

  // Motoriska/trofiska (minst 1 krävs)
  if (symptoms.decreasedROM) detailedSymptoms.motorTrophic.push('Minskad rörlighet');
  if (symptoms.weakness) detailedSymptoms.motorTrophic.push('Svaghet');
  if (symptoms.tremor) detailedSymptoms.motorTrophic.push('Tremor');
  if (symptoms.dystonia) detailedSymptoms.motorTrophic.push('Dystoni');
  if (symptoms.trophicChanges) detailedSymptoms.motorTrophic.push('Trofiska förändringar (naglar/hår/hud)');

  const categoriesAffected = {
    sensory: detailedSymptoms.sensory.length > 0,
    vasomotor: detailedSymptoms.vasomotor.length > 0,
    sudomotor: detailedSymptoms.sudomotor.length > 0,
    motorTrophic: detailedSymptoms.motorTrophic.length > 0
  };

  const categoriesWithSymptoms = Object.values(categoriesAffected).filter(Boolean).length;
  const totalSymptomCount = Object.values(detailedSymptoms).flat().length;

  // Budapest-kriterier: symtom i minst 3 av 4 kategorier
  const meetsScreeningCriteria = categoriesWithSymptoms >= 3;

  // Riskbedömning
  let riskLevel: CRPSScreeningResult['riskLevel'];
  let recommendation: string;
  let urgency: CRPSScreeningResult['urgency'];

  // Förhöjd risk om smärtan förvärras/sprider sig och läkning borde vara längre fram
  const worseningPattern = context.painGettingWorse || context.painSpreading;
  const unexpectedProgression = !context.normalHealingExpected && context.daysSinceInjury > 14;

  if (meetsScreeningCriteria && worseningPattern) {
    riskLevel = 'probable';
    recommendation = 'VIKTIGT: Kontakta smärtspecialist eller ortoped IDAG. Symtombilden stämmer med CRPS. Tidig behandling är avgörande - ju tidigare diagnos, desto bättre prognos.';
    urgency = 'urgent';
  } else if (meetsScreeningCriteria || (categoriesWithSymptoms >= 2 && unexpectedProgression)) {
    riskLevel = 'possible';
    recommendation = 'Möjlig CRPS. Boka tid hos läkare inom närmaste dagarna för utredning. Fortsätt försiktig rörelse - UNDVIK immobilisering.';
    urgency = 'soon';
  } else {
    riskLevel = 'unlikely';
    recommendation = 'CRPS osannolikt baserat på nuvarande symtom. Fortsätt ordinerad rehabilitering. Kontakta vårdgivare om symtomen förändras.';
    urgency = 'routine';
  }

  return {
    meetsScreeningCriteria,
    categoriesAffected,
    symptomCount: totalSymptomCount,
    riskLevel,
    recommendation,
    detailedSymptoms,
    urgency
  };
}

// ============================================
// POSTOPERATIV DVT-RISKBEDÖMNING
// ============================================

export interface PostOpDVTRisk {
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  dailyRiskPercent: number;
  peakRiskPeriod: string;
  prophylaxisLikely: boolean;
  warningSignsToWatch: string[];
  exerciseGuidelines: string[];
}

/**
 * Bedöm DVT-risk baserat på operationstyp och tid sedan operation
 */
export function assessPostOpDVTRisk(
  surgeryType: string,
  daysSinceSurgery: number,
  additionalRiskFactors: string[] = []
): PostOpDVTRisk {
  // Baslinje risknivåer för olika operationer
  const surgeryRiskMap: Record<string, {
    baseRisk: 'low' | 'moderate' | 'high' | 'very_high';
    peakDays: number;
    prophylaxisDays: number;
  }> = {
    'acl_reconstruction': { baseRisk: 'moderate', peakDays: 14, prophylaxisDays: 14 },
    'tkr': { baseRisk: 'very_high', peakDays: 21, prophylaxisDays: 35 },
    'thr': { baseRisk: 'very_high', peakDays: 21, prophylaxisDays: 35 },
    'hip_arthroscopy': { baseRisk: 'moderate', peakDays: 14, prophylaxisDays: 14 },
    'knee_arthroscopy': { baseRisk: 'low', peakDays: 7, prophylaxisDays: 7 },
    'achilles_repair': { baseRisk: 'moderate', peakDays: 21, prophylaxisDays: 21 },
    'ankle_fracture': { baseRisk: 'moderate', peakDays: 21, prophylaxisDays: 14 },
    'spinal_fusion': { baseRisk: 'high', peakDays: 14, prophylaxisDays: 14 },
    'rotator_cuff': { baseRisk: 'low', peakDays: 7, prophylaxisDays: 0 }
  };

  const surgeryInfo = surgeryRiskMap[surgeryType] || {
    baseRisk: 'moderate' as const,
    peakDays: 14,
    prophylaxisDays: 14
  };

  // Justera risk baserat på tid
  let riskLevel = surgeryInfo.baseRisk;
  const inPeakPeriod = daysSinceSurgery <= surgeryInfo.peakDays;

  // Höj risknivå om ytterligare riskfaktorer finns
  const hasAdditionalRisk = additionalRiskFactors.length > 0;
  if (hasAdditionalRisk && riskLevel !== 'very_high') {
    const levels: Array<'low' | 'moderate' | 'high' | 'very_high'> = ['low', 'moderate', 'high', 'very_high'];
    const currentIndex = levels.indexOf(riskLevel);
    riskLevel = levels[Math.min(currentIndex + 1, 3)];
  }

  // Sänk risk om vi passerat peak-perioden
  if (!inPeakPeriod && riskLevel !== 'low') {
    const levels: Array<'low' | 'moderate' | 'high' | 'very_high'> = ['low', 'moderate', 'high', 'very_high'];
    const currentIndex = levels.indexOf(riskLevel);
    riskLevel = levels[Math.max(currentIndex - 1, 0)];
  }

  // Beräkna daglig risk (approximativt)
  const dailyRiskPercent = {
    'low': 0.1,
    'moderate': 0.5,
    'high': 1.5,
    'very_high': 3.0
  }[riskLevel];

  const warningSignsToWatch = [
    'Ensidig vadsvullnad',
    'Värme i vaden',
    'Smärta vid dorsalflexion av foten',
    'Rodnad längs benet',
    'Andnöd (kan indikera lungemboli)',
    'Bröstsmärta'
  ];

  const exerciseGuidelines: string[] = [];
  if (riskLevel === 'very_high' || riskLevel === 'high') {
    exerciseGuidelines.push('Fotpumpsövningar varje timme');
    exerciseGuidelines.push('Undvik långvarigt stillasittande');
    exerciseGuidelines.push('Använd kompressionsstrumpor enligt ordination');
    exerciseGuidelines.push('Ta profylaktisk blodförtunnande enligt ordination');
  } else {
    exerciseGuidelines.push('Regelbunden rörelse rekommenderas');
    exerciseGuidelines.push('Undvik >2h stillasittande åt gången');
  }

  return {
    riskLevel,
    dailyRiskPercent,
    peakRiskPeriod: `Dag 1-${surgeryInfo.peakDays} postoperativt`,
    prophylaxisLikely: daysSinceSurgery <= surgeryInfo.prophylaxisDays,
    warningSignsToWatch,
    exerciseGuidelines
  };
}

// ============================================
// EXPORT ENHANCED RED FLAG INFO
// ============================================

/**
 * Hämta kliniska kriterier för en röd flagga
 */
export function getRedFlagClinicalCriteria(flagName: string): string | undefined {
  const flag = CRITICAL_RED_FLAGS[flagName];
  return flag?.clinicalCriteria;
}

/**
 * Hämta riskfaktorer för en röd flagga
 */
export function getRedFlagRiskFactors(flagName: string): string[] {
  const flag = CRITICAL_RED_FLAGS[flagName];
  return flag?.riskFactors || [];
}

/**
 * Generera DVT-specifika screeningfrågor
 */
export function generateDVTScreeningQuestions(): Array<{
  id: string;
  question: string;
  category: 'symptom' | 'riskfactor';
}> {
  return [
    { id: 'calf_swelling', question: 'Har du märkt svullnad i vaden på ett ben?', category: 'symptom' },
    { id: 'calf_pain', question: 'Har du smärta i vaden, särskilt vid gång?', category: 'symptom' },
    { id: 'warm_calf', question: 'Känns vaden varm jämfört med andra benet?', category: 'symptom' },
    { id: 'unilateral', question: 'Är symtomen bara på ett ben?', category: 'symptom' },
    { id: 'immobilization', question: 'Har du varit stillasittande/sängliggande i långa perioder?', category: 'riskfactor' },
    { id: 'recent_surgery', question: 'Har du genomgått operation de senaste 4 veckorna?', category: 'riskfactor' },
    { id: 'previous_dvt', question: 'Har du haft blodpropp tidigare?', category: 'riskfactor' }
  ];
}

/**
 * Generera CRPS-specifika screeningfrågor
 */
export function generateCRPSScreeningQuestions(): Array<{
  id: string;
  question: string;
  category: 'sensory' | 'vasomotor' | 'sudomotor' | 'motor';
}> {
  return [
    { id: 'touch_pain', question: 'Gör det ont när något lätt nuddar huden?', category: 'sensory' },
    { id: 'disproportionate', question: 'Känns smärtan värre än vad skadan borde ge?', category: 'sensory' },
    { id: 'temp_diff', question: 'Känns armen/benet onormalt varmt eller kallt jämfört med andra sidan?', category: 'vasomotor' },
    { id: 'color_change', question: 'Har huden ändrat färg (rödare, blåare, blekare)?', category: 'vasomotor' },
    { id: 'swelling', question: 'Har du svullnad som inte förklaras av skadan?', category: 'sudomotor' },
    { id: 'sweating', question: 'Svettas armen/benet annorlunda än vanligt?', category: 'sudomotor' },
    { id: 'stiffness', question: 'Känns armen/benet styvare än förväntat?', category: 'motor' },
    { id: 'nail_hair', question: 'Har du märkt förändringar i naglar eller hårväxt?', category: 'motor' }
  ];
}
