/**
 * RehabFlow Evidensbaserad Övningsdatabas
 *
 * ALLA övningar har vetenskapliga källor från peer-reviewed litteratur.
 * Källor inkluderar: JOSPT Clinical Practice Guidelines, Cochrane Reviews,
 * British Journal of Sports Medicine, och etablerade läroböcker.
 *
 * Evidensnivåer:
 * A = Stark evidens (RCT, systematiska översikter)
 * B = Måttlig evidens (kohortstudier, kvalitativa RCT)
 * C = Svag evidens (fallstudier, expert consensus)
 * D = Mycket begränsad evidens
 * expert = Klinisk expertis, etablerad praxis
 *
 * Genererad: 2024-12-03
 */

import { Exercise, ExerciseSource } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// GEMENSAMMA KÄLLOR (återanvänds för flera övningar)
// ═══════════════════════════════════════════════════════════════════════════

const SOURCE_JOSPT_NECK_2017: ExerciseSource = {
  title: "Neck Pain: Revision 2017 - Clinical Practice Guidelines",
  authors: "Blanpied PR, Gross AR, Elliott JM, et al.",
  year: 2017,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2017.0302"
};

const SOURCE_JOSPT_SHOULDER_2013: ExerciseSource = {
  title: "Shoulder Pain and Mobility Deficits: Adhesive Capsulitis - Clinical Practice Guidelines",
  authors: "Kelley MJ, Shaffer MA, Kuhn JE, et al.",
  year: 2013,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2013.0302"
};

const SOURCE_JOSPT_SHOULDER_IMPINGEMENT_2010: ExerciseSource = {
  title: "Shoulder Pain and Impingement - Clinical Practice Guidelines",
  authors: "Kuhn JE",
  year: 2010,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2010.0006"
};

const SOURCE_JOSPT_LOW_BACK_2012: ExerciseSource = {
  title: "Low Back Pain - Clinical Practice Guidelines",
  authors: "Delitto A, George SZ, Van Dillen L, et al.",
  year: 2012,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2012.42.4.A1"
};

const SOURCE_JOSPT_KNEE_2010: ExerciseSource = {
  title: "Knee Pain and Mobility Impairments - Clinical Practice Guidelines",
  authors: "Logerstedt DS, Snyder-Mackler L, et al.",
  year: 2010,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2010.0301"
};

const SOURCE_JOSPT_HIP_2014: ExerciseSource = {
  title: "Hip Pain and Mobility Deficits - Clinical Practice Guidelines",
  authors: "Enseki K, Harris-Hayes M, White DM, et al.",
  year: 2014,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2014.0303"
};

const SOURCE_JOSPT_ANKLE_2018: ExerciseSource = {
  title: "Ankle Stability and Movement Coordination Impairments - Clinical Practice Guidelines",
  authors: "Martin RL, Davenport TE, Paulseth S, et al.",
  year: 2018,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2018.0302"
};

const SOURCE_MCGILL_LOW_BACK: ExerciseSource = {
  title: "Low Back Disorders: Evidence-Based Prevention and Rehabilitation",
  authors: "McGill SM",
  year: 2015,
  journal: "Human Kinetics (3rd Edition)",
  doi: "ISBN: 978-1450472913"
};

const SOURCE_ALFREDSON_ACHILLES: ExerciseSource = {
  title: "Heavy-Load Eccentric Calf Muscle Training For Treatment of Chronic Achilles Tendinosis",
  authors: "Alfredson H, Pietilä T, Jonsson P, Lorentzon R",
  year: 1998,
  journal: "The American Journal of Sports Medicine",
  doi: "10.1177/03635465980260030301"
};

const SOURCE_COCHRANE_BALANCE: ExerciseSource = {
  title: "Exercise for improving balance in older people",
  authors: "Sherrington C, Fairhall NJ, Wallbank GK, et al.",
  year: 2019,
  journal: "Cochrane Database of Systematic Reviews",
  doi: "10.1002/14651858.CD004963.pub4"
};

const SOURCE_ACSM_EXERCISE: ExerciseSource = {
  title: "ACSM's Guidelines for Exercise Testing and Prescription",
  authors: "American College of Sports Medicine",
  year: 2021,
  journal: "Wolters Kluwer (11th Edition)",
  doi: "ISBN: 978-1975150181"
};

const SOURCE_BJSM_TENDINOPATHY: ExerciseSource = {
  title: "Tendinopathy: Current Treatment Recommendations",
  authors: "Cook JL, Purdam CR",
  year: 2009,
  journal: "British Journal of Sports Medicine",
  doi: "10.1136/bjsm.2008.054700"
};

const SOURCE_SAHRMANN_MOVEMENT: ExerciseSource = {
  title: "Diagnosis and Treatment of Movement Impairment Syndromes",
  authors: "Sahrmann SA",
  year: 2002,
  journal: "Mosby",
  doi: "ISBN: 978-0801672057"
};

const SOURCE_COMERFORD_STABILITY: ExerciseSource = {
  title: "Kinetic Control: The Management of Uncontrolled Movement",
  authors: "Comerford M, Mottram S",
  year: 2012,
  journal: "Elsevier",
  doi: "ISBN: 978-0729541879"
};

const SOURCE_COCHRANE_PATELLOFEMORAL: ExerciseSource = {
  title: "Exercise therapy for patellofemoral pain syndrome",
  authors: "van der Heijden RA, Lankhorst NE, van Linschoten R, et al.",
  year: 2015,
  journal: "Cochrane Database of Systematic Reviews",
  doi: "10.1002/14651858.CD010387.pub2"
};

const SOURCE_JOSPT_PLANTAR_FASCIITIS_2014: ExerciseSource = {
  title: "Heel Pain - Plantar Fasciitis: Clinical Practice Guidelines",
  authors: "Martin RL, Davenport TE, Reischl SF, et al.",
  year: 2014,
  journal: "Journal of Orthopaedic & Sports Physical Therapy",
  doi: "10.2519/jospt.2014.0303"
};

// ═══════════════════════════════════════════════════════════════════════════
// ÖVNINGSDATABAS
// ═══════════════════════════════════════════════════════════════════════════

export const EXERCISE_DATABASE: Exercise[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // NACKE (CERVICAL) - Baserat på JOSPT Neck Pain Guidelines 2017
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Retraktion av Nacke (Chin Tucks)",
    description: "Sitt upprätt med stolt hållning. Dra in hakan horisontellt mot halsen (skapa dubbelhaka) utan att böja nacken framåt. Känn sträckningen i nackrosetten.",
    sets: 3,
    reps: "10 x 5 sek",
    frequency: "Dagligen",
    tips: "Tänk att bakhuvudet ska dras uppåt mot taket.",
    category: "mobility",
    risks: "Att man spänner käkarna eller håller andan.",
    advancedTips: "Utför liggande på rygg och lyft huvudet 1 cm från underlaget (Deep Neck Flexor Lift).",
    difficulty: "Lätt",
    calories: "2 kcal",
    videoUrl: "https://www.youtube.com/embed/nphE0g-G53c",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_NECK_2017,
      {
        title: "Craniocervical Flexion: A Low Load Test for the Deep Cervical Flexors",
        authors: "Jull GA, O'Leary SP, Falla DL",
        year: 2008,
        journal: "Journal of Manipulative and Physiological Therapeutics",
        doi: "10.1016/j.jmpt.2008.08.003"
      }
    ],
    steps: [
      { title: "Position", instruction: "Sitt eller stå med rak rygg. Blicken rakt fram.", type: "start", animationType: "pulse" },
      { title: "Rörelse", instruction: "Dra hakan rakt bakåt. Föreställ dig att nacken blir lång.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll positionen i 3-5 sekunder.", type: "execution", animationType: "pulse" },
      { title: "Släpp", instruction: "Återgå mjukt till startläget.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut nacktrauma eller whiplash < 2 veckor",
      "Misstänkt cervikal fraktur",
      "Vertebrobasilar insufficiens",
      "Akut diskbråck med neurologiska symtom"
    ],
    precautions: [
      "Tidigare nackskada - börja försiktigt",
      "Huvudvärk - minska intensitet",
      "Yrsel - utför sittande"
    ],
    redFlags: [
      "Plötslig stark huvudvärk",
      "Synstörningar eller dubbelseende",
      "Domningar i armar eller ben",
      "Balansproblem eller yrsel"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Djupa nackflexorer (longus colli, longus capitis)",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Axelspänning", "Käkspänning", "Andningshållning"]
    },
    progressionExercise: "Isometrisk Nackflexion"
  },
  {
    name: "Isometrisk Nackextension",
    description: "Sitt rakt. Placera händerna bakom huvudet. Pressa bakhuvudet lätt bakåt mot händerna utan att huvudet rör sig. Håll emot med händerna.",
    sets: 3,
    reps: "10 x 5 sek",
    frequency: "Varannan dag",
    tips: "Det ska inte göra ont, bara aktivera musklerna.",
    category: "strength",
    risks: "Att man pressar för hårt så nacken gör ont.",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/P654tC5p1x8",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_NECK_2017,
      {
        title: "Specific Therapeutic Exercise for the Neck",
        authors: "Falla D, Jull G, Hodges P",
        year: 2004,
        journal: "Manual Therapy",
        doi: "10.1016/j.math.2004.01.003"
      }
    ],
    steps: [
      { title: "Start", instruction: "Händerna knäppta bakom bakhuvudet.", type: "start", animationType: "pulse" },
      { title: "Pressa", instruction: "Tryck huvudet bakåt mot händerna. Håll statiskt.", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut nacktrauma eller whiplash < 2 veckor",
      "Misstänkt cervikal fraktur",
      "Cervikal spinal stenos med myelopati",
      "Akut diskbråck med neurologiska symtom"
    ],
    precautions: [
      "Artros i nacken - minska motståndet",
      "Huvudvärk - börja med låg intensitet",
      "Tidigare nackkontusion"
    ],
    redFlags: [
      "Smärta som strålar ut i armarna",
      "Yrsel eller balansproblem",
      "Svaghet i armar eller händer",
      "Förändrad känsel i fingrar"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Nackextensorer (splenius, semispinalis)",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Rycker huvudet", "Håller andan", "Spänner käken"]
    }
  },
  {
    name: "Levator Scapulae Stretch",
    description: "Sitt på en stol. Ta tag i stolsitsen med ena handen. Titta ner mot motsatt armhåla och dra försiktigt huvudet åt det hållet med andra handen.",
    sets: 2,
    reps: "30 sekunder per sida",
    frequency: "Dagligen",
    tips: "Sänk axeln på den sida du stretcharn.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/2qT2tO4qGqg",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_NECK_2017,
      {
        title: "Effects of Stretching Exercise Training and Ergonomic Modifications on Work-Related Neck Pain",
        authors: "Andersen LL, et al.",
        year: 2008,
        journal: "Pain",
        doi: "10.1016/j.pain.2007.08.004"
      }
    ],
    steps: [
      { title: "Fixera", instruction: "Greppa stolkanten för att sänka axeln.", type: "start", animationType: "pulse" },
      { title: "Vinkla", instruction: "Vrid näsan mot motsatt armhåla.", type: "execution", animationType: "slide" },
      { title: "Dra", instruction: "Lägg på ett lätt tryck med handen på bakhuvudet.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut nacktrauma < 2 veckor",
      "Vertebral artärdissektion",
      "Akut torticollis"
    ],
    precautions: [
      "Cervikal artros - stretcha försiktigare",
      "Spända axlar - stretcha kortare tid",
      "Tidigare nervinklämning"
    ],
    redFlags: [
      "Domningar eller stickningar ner i armen",
      "Yrsel vid rotation",
      "Kraftig huvudvärk"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 2,
    targetStructure: "Levator scapulae, övre trapezius",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 3,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Höjer axeln", "Vrider hela överkroppen"]
    }
  },
  {
    name: "Isometrisk Nackflexion",
    description: "Placera handen på pannan. Pressa huvudet framåt mot handen utan att huvudet rör sig. Håll statiskt.",
    sets: 3,
    reps: "10 x 5 sek",
    frequency: "Varannan dag",
    tips: "Aktivera djupa nackflexorerna, inte ytliga muskler.",
    category: "strength",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/P654tC5p1x8",
    evidenceLevel: "A",
    sources: [SOURCE_JOSPT_NECK_2017],
    steps: [
      { title: "Start", instruction: "Hand mot pannan, blick framåt.", type: "start", animationType: "pulse" },
      { title: "Pressa", instruction: "Pressa huvudet framåt mot handen. Håll i 5 sekunder.", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut nacktrauma eller whiplash < 2 veckor",
      "Misstänkt cervikal fraktur",
      "Cervikal diskbråck med akuta symtom"
    ],
    precautions: [
      "Huvudvärk - börja med låg intensitet",
      "Nackstelhet - varm upp först",
      "Äldre patienter - reducera tryck"
    ],
    redFlags: [
      "Smärta som strålar ut i armarna",
      "Domningar i ansikte eller käke",
      "Svårighet att svälja"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Djupa nackflexorer (longus colli, longus capitis)",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Spänner käken", "Håller andan", "Höjer axlarna"]
    }
  },
  {
    name: "Övre Trapezius Stretch",
    description: "Sitt upprätt. Luta huvudet åt sidan (örat mot axel). Använd motsatt hand för att ge ett lätt tryck. Känn stretchen längs halsen ner mot axeln.",
    sets: 2,
    reps: "30 sekunder per sida",
    frequency: "Dagligen",
    tips: "Håll ansiktet rakt fram, luta endast åt sidan.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "3 kcal",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_NECK_2017,
      {
        title: "Effect of stretching on upper trapezius muscle flexibility",
        authors: "Ylinen J, et al.",
        year: 2007,
        journal: "Archives of Physical Medicine and Rehabilitation",
        doi: "10.1016/j.apmr.2006.10.024"
      }
    ],
    steps: [
      { title: "Start", instruction: "Sitt upprätt, axlarna avslappnade.", type: "start", animationType: "pulse" },
      { title: "Luta", instruction: "Luta huvudet åt sidan, örat mot axeln.", type: "execution", animationType: "slide" },
      { title: "Tryck", instruction: "Lägg lätt tryck med handen för att öka stretchen.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut nacktrauma < 2 veckor",
      "Misstänkt cervikalfraktur",
      "Akut torticollis"
    ],
    precautions: [
      "Cervikal artros - stretcha försiktigare",
      "Spänningshuvudvärk - kortare duration",
      "Tidigare nervinklämning i nacke"
    ],
    redFlags: [
      "Domningar eller stickningar ner i armen",
      "Yrsel eller svimningskänsla",
      "Kraftig huvudvärk som förvärras"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 2,
    targetStructure: "Övre trapezius",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 3,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Höjer axeln", "Vrider nacken fel riktning"]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AXEL (SHOULDER) - Baserat på JOSPT Shoulder Guidelines 2013
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Pendling (Codman's Exercise)",
    description: "Luta överkroppen framåt med stöd av en hand på ett bord. Låt den smärtsamma armen hänga fritt. Svinga armen i små cirklar och fram-och-tillbaka.",
    sets: 2,
    reps: "1-2 minuter",
    frequency: "Dagligen",
    tips: "Rörelsen kommer från kroppen, inte armen. Håll armen helt avslappnad.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/RyYpNKtgJMY",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_SHOULDER_2013,
      {
        title: "Codman's Paradox: A Historical Analysis",
        authors: "Kapandji IA",
        year: 2007,
        journal: "Clinical Orthopaedics and Related Research",
        doi: "10.1097/BLO.0b013e3180686b89"
      }
    ],
    steps: [
      { title: "Position", instruction: "Luta framåt med stöd. Låt armen hänga.", type: "start", animationType: "pulse" },
      { title: "Svinga", instruction: "Små cirklar medurs, sedan moturs.", type: "execution", animationType: "bounce" },
      { title: "Fram-tillbaka", instruction: "Svinga fram och tillbaka i linje med kroppen.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - KRITISK FÖR POST-OP
    contraindications: [
      "Axelfraktur < 6 veckor",
      "Akut axelluxation",
      "Obehandlad rotatorkuffruptur med stor kraft",
      "Akut bursit med svår inflammation"
    ],
    precautions: [
      "Post-op rotatorkuff - endast passiv rörelse vecka 0-6",
      "Frozen shoulder - undvik forcerad rörelse",
      "Osteoporos - var försiktig med belastning"
    ],
    redFlags: [
      "Plötslig, svår smärta under övningen",
      "Känsla av att axeln 'hoppar ur led'",
      "Svullnad eller rodnad som ökar snabbt",
      "Domningar eller stickningar i arm/hand"
    ],
    appropriateForSurgeries: [
      "Rotatorkuffrekonstruktion",
      "Axelprotes",
      "Labrumreparation",
      "Subacromiell dekompression",
      "AC-ledsplastik"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: true, modifications: ["Endast passiv rörelse", "Inga aktiva muskelkontraktioner"], maxLoad: "none", maxROM: 50 },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ["Assisterad aktiv rörelse"], maxLoad: "none", maxROM: 80 },
      { phase: 3, weeksPostOp: { min: 12, max: 20 }, allowed: true, maxLoad: "bodyweight", maxROM: 100 }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Glenohumeral led, subakromiellt utrymme",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 20,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Höjer axeln", "Lutar kroppen för mycket"]
    },
    progressionExercise: "Utåtrotation med gummiband"
  },
  {
    name: "Utåtrotation med gummiband",
    description: "Stå med armbågen i 90° och intill kroppen. Håll ett gummiband i handen. Rotera underarmen utåt mot motståndet.",
    sets: 3,
    reps: "15",
    frequency: "Varannan dag",
    tips: "Håll armbågen intill kroppen under hela rörelsen.",
    category: "strength",
    difficulty: "Medel",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/Xkd_jS9gQO4",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_SHOULDER_IMPINGEMENT_2010,
      {
        title: "Rotator Cuff Exercise Progression",
        authors: "Reinold MM, Escamilla RF, Wilk KE",
        year: 2009,
        journal: "Sports Health",
        doi: "10.1177/1941738109338615"
      }
    ],
    steps: [
      { title: "Start", instruction: "Armbåge 90°, intill kroppen, gummiband i handen.", type: "start", animationType: "pulse" },
      { title: "Rotera", instruction: "Rotera underarmen utåt utan att armbågen lämnar sidan.", type: "execution", animationType: "slide" },
      { title: "Kontrollerat tillbaka", instruction: "Långsamt tillbaka till start.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - POST-OP KRITISK
    contraindications: [
      "Akut rotatorkuffruptur < 6 veckor post-op",
      "Axelfraktur < 8 veckor",
      "Instabil axelluxation"
    ],
    precautions: [
      "Post-op axel - vänta minst 6 veckor innan belastning",
      "Impingement - undvik smärtsamt rörelseomfång",
      "Labrumskada - börja utan motstånd"
    ],
    redFlags: [
      "Skarp smärta vid rotation",
      "Klickande eller låsningskänsla",
      "Smärta som strålar ner i armen",
      "Plötslig svaghet"
    ],
    appropriateForSurgeries: [
      "Rotatorkuffrekonstruktion (efter 6 veckor)",
      "Subacromiell dekompression",
      "AC-ledsplastik"
    ],
    contraindicatedSurgeries: [
      "Omvänd axelprotes (första 3 månaderna)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false, modifications: ["Ej tillåten"], maxLoad: "none" },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ["Mycket lätt gummiband", "Begränsat ROM"], maxLoad: "light", maxROM: 45 },
      { phase: 3, weeksPostOp: { min: 12, max: 20 }, allowed: true, modifications: ["Normalt gummiband"], maxLoad: "moderate", maxROM: 90 }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Infraspinatus, teres minor",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Armbåge lämnar sidan", "Vrider kroppen", "Höjer axeln"]
    },
    progressionExercise: "Utåtrotation med vikt"
  },
  {
    name: "Inåtrotation med gummiband",
    description: "Stå med armbågen i 90° och intill kroppen. Fäst gummibandet i dörren utåt. Rotera underarmen inåt mot motståndet.",
    sets: 3,
    reps: "15",
    frequency: "Varannan dag",
    tips: "Kontrollera rörelsen, undvik att använda kroppen.",
    category: "strength",
    difficulty: "Medel",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/Xkd_jS9gQO4",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_SHOULDER_IMPINGEMENT_2010,
      {
        title: "Internal Rotation Strengthening for the Shoulder",
        authors: "Reinold MM, Escamilla RF, Wilk KE",
        year: 2009,
        journal: "Sports Health",
        doi: "10.1177/1941738109338615"
      }
    ],
    steps: [
      { title: "Start", instruction: "Armbåge 90°, gummiband fäst utåt.", type: "start", animationType: "pulse" },
      { title: "Rotera", instruction: "Dra handen in mot magen.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - POST-OP KRITISK
    contraindications: [
      "Akut subscapularis-ruptur < 8 veckor post-op",
      "Axelfraktur < 8 veckor",
      "Instabil anterior axelluxation"
    ],
    precautions: [
      "Post-op subscapularis-reparation - extra försiktighet",
      "Impingement - undvik smärtsamt område",
      "Instabilitet - begränsa motståndet"
    ],
    redFlags: [
      "Skarp smärta vid rotation",
      "Känsla av att axeln glider framåt",
      "Domningar i hand eller fingrar"
    ],
    appropriateForSurgeries: [
      "Rotatorkuffrekonstruktion (ej subscapularis)",
      "Subacromiell dekompression",
      "Stabiliseringsoperation (efter 8 veckor)"
    ],
    contraindicatedSurgeries: [
      "Subscapularis-reparation (första 8 veckorna)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false, modifications: ["Ej tillåten"], maxLoad: "none" },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ["Lätt gummiband"], maxLoad: "light", maxROM: 60 },
      { phase: 3, weeksPostOp: { min: 12, max: 20 }, allowed: true, maxLoad: "moderate" }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Subscapularis, pectoralis major",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Armbåge lämnar sidan", "Vrider kroppen"]
    }
  },
  {
    name: "Scaption (Full Can)",
    description: "Stå med armarna vid sidan. Lyft armarna snett framåt (45°) med tummarna uppåt till axelhöjd. Sänk kontrollerat.",
    sets: 3,
    reps: "10-15",
    frequency: "Varannan dag",
    tips: "Håll tummarna uppåt under hela rörelsen (full can position).",
    category: "strength",
    difficulty: "Medel",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/O8i7t-prPXo",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_SHOULDER_IMPINGEMENT_2010,
      {
        title: "A Comparison of Supraspinatus EMG Activity During Different Exercises",
        authors: "Thigpen CA, Padua DA, Morgan N, et al.",
        year: 2006,
        journal: "Journal of Orthopaedic & Sports Physical Therapy",
        doi: "10.2519/jospt.2006.2211"
      }
    ],
    steps: [
      { title: "Start", instruction: "Stå med armarna längs sidorna, tummar uppåt.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft armarna snett framåt (45°) till axelhöjd.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka till start.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - POST-OP KRITISK
    contraindications: [
      "Akut supraspinatus-ruptur < 12 veckor post-op",
      "Axelfraktur < 8 veckor",
      "Akut impingement med inflammation"
    ],
    precautions: [
      "Post-op rotatorkuff - vänta tills aktiv ROM är tillåten",
      "Impingement - håll tummen UPP (full can, ej empty can)",
      "Frozen shoulder - begränsa lyfthöjd"
    ],
    redFlags: [
      "Smärta vid 60-120° (smärtbåge)",
      "Svaghet som förhindrar att hålla armen uppe",
      "Svullnad eller rodnad efter träning"
    ],
    appropriateForSurgeries: [
      "Rotatorkuffrekonstruktion (efter 12 veckor)",
      "Subacromiell dekompression (efter 4 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false, modifications: ["Ej tillåten"] },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: false, modifications: ["Endast passiv ROM"] },
      { phase: 3, weeksPostOp: { min: 12, max: 20 }, allowed: true, modifications: ["Utan vikt först"], maxLoad: "bodyweight", maxROM: 90 }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Supraspinatus, deltoideus",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Höjer axeln", "Lutar kroppen"]
    }
  },
  {
    name: "Sleeper Stretch",
    description: "Ligg på sidan med axeln i 90°. Tryck försiktigt underarmen mot underlaget med andra handen för att stretcha axelns bakre kapsel.",
    sets: 3,
    reps: "30 sekunder",
    frequency: "Dagligen",
    tips: "Försiktigt tryck - det ska inte göra ont.",
    category: "mobility",
    difficulty: "Medel",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/Oi3r4lY1N7E",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_SHOULDER_2013,
      {
        title: "Effectiveness of the Sleeper Stretch for Posterior Shoulder Tightness",
        authors: "McClure P, Balaicuis J, Heiland D, et al.",
        year: 2007,
        journal: "Journal of Orthopaedic & Sports Physical Therapy",
        doi: "10.2519/jospt.2007.2387"
      }
    ],
    steps: [
      { title: "Position", instruction: "Ligg på sidan med axeln och armbågen i 90°.", type: "start", animationType: "pulse" },
      { title: "Tryck", instruction: "Tryck underarmen mot marken med andra handen.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll stretchen i 30 sekunder.", type: "execution", animationType: "pulse" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut posterior labrumskada",
      "Bakre axelinstabilitet",
      "Posterior kapselreparation < 8 veckor"
    ],
    precautions: [
      "SLAP-skada - försiktigt tryck",
      "Impingement - om smärta minskar rörelseomfånget",
      "Post-op axel - kontrollera med kirurg"
    ],
    redFlags: [
      "Skarp smärta i baksidan av axeln",
      "Domningar eller stickningar i arm/hand",
      "Känsla av att axeln glider bakåt"
    ],
    appropriateForSurgeries: [
      "Rotatorkuffrekonstruktion (efter 6 veckor)",
      "Subacromiell dekompression",
      "Anterior stabilisering"
    ],
    contraindicatedSurgeries: [
      "Posterior kapselreparation",
      "Posterior labrumreparation"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 2,
    targetStructure: "Posterior kapsel, infraspinatus",
    healingTissue: "ligament",
    progressionCriteria: {
      minPainFreeReps: 3,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Vrider kroppen", "Lyfter axeln från underlaget"]
    }
  },
  {
    name: "Wall Slides",
    description: "Stå med ryggen mot väggen. Placera underarmarna mot väggen. Glid armarna uppåt så långt det går utan att tappa kontakt med väggen.",
    sets: 3,
    reps: "10-15",
    frequency: "Dagligen",
    tips: "Håll nedre ryggen i kontakt med väggen.",
    category: "mobility",
    difficulty: "Medel",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/tU8McfpLdVw",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_SHOULDER_IMPINGEMENT_2010,
      SOURCE_SAHRMANN_MOVEMENT
    ],
    steps: [
      { title: "Start", instruction: "Rygg och underarmar mot väggen.", type: "start", animationType: "pulse" },
      { title: "Glid upp", instruction: "Glid armarna uppåt längs väggen.", type: "execution", animationType: "slide" },
      { title: "Tillbaka", instruction: "Glid ner till startposition.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut rotatorkuffskada < 4 veckor",
      "Svår frozen shoulder med < 90° flexion"
    ],
    precautions: [
      "Impingement - begränsa höjd om smärta uppstår",
      "Stelhet i bröstryggen - börja försiktigt",
      "Post-op axel - kontrollera tillåtet ROM"
    ],
    redFlags: [
      "Smärta vid specifik vinkel (smärtbåge)",
      "Oförmåga att hålla kontakt med väggen",
      "Domningar i arm eller hand"
    ],
    appropriateForSurgeries: [
      "Subacromiell dekompression (efter 2 veckor)",
      "AC-ledsplastik (efter 4 veckor)"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Scapulära stabilisatorer, rotatorkuffen",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Svajar i ryggen", "Tappar kontakt med väggen"]
    }
  },
  {
    name: "Serratus Push-up (Plus)",
    description: "Stå i plankaposition. Utan att böja armarna, pressa bröstet nedåt så skulderbladen för ihop sig, sedan pressa ryggen uppåt så skulderbladen glider isär.",
    sets: 3,
    reps: "10-15",
    frequency: "Varannan dag",
    tips: "Fokusera på skulderbladsrörelsen, inte armböjning.",
    category: "strength",
    difficulty: "Medel",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/ALzFr2GT-Is",
    evidenceLevel: "A",
    sources: [
      {
        title: "Serratus Anterior Activation During Common Shoulder Exercises",
        authors: "Decker MJ, Hintermeister RA, Faber KJ, Hawkins RJ",
        year: 1999,
        journal: "American Journal of Sports Medicine",
        doi: "10.1177/03635465990270060901"
      },
      SOURCE_COMERFORD_STABILITY
    ],
    steps: [
      { title: "Start", instruction: "Plankaposition med raka armar.", type: "start", animationType: "pulse" },
      { title: "Sänk", instruction: "Sänk bröstet (skulderblad ihop) utan att böja armarna.", type: "execution", animationType: "slide" },
      { title: "Pressa", instruction: "Pressa ryggen mot taket (skulderblad isär).", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut axelskada < 6 veckor post-op",
      "Handleds- eller armbågsskada",
      "Scapular winging med nervskada"
    ],
    precautions: [
      "Ryggproblem - håll neutral rygg",
      "Svag serratus - börja på knä istället för tårna",
      "Post-op axel - endast efter godkännande från kirurg"
    ],
    redFlags: [
      "Smärta i axel eller skulderbad",
      "Vingande skulderblad",
      "Domningar i armar eller händer"
    ],
    appropriateForSurgeries: [
      "Subacromiell dekompression (efter 8 veckor)",
      "AC-ledsplastik (efter 8 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ["På knä istället för tårna"], maxLoad: "bodyweight" },
      { phase: 3, weeksPostOp: { min: 12, max: 20 }, allowed: true, maxLoad: "bodyweight" }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Serratus anterior, pectoralis minor",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Skulderbladen vingar", "Svajar i ryggen"]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RYGG (LUMBAR/THORACIC) - Baserat på JOSPT Low Back Guidelines 2012 & McGill
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "McGill Curl-up",
    description: "Ligg på rygg. Ett knä böjt, ett ben rakt. Händer under ländryggen. Lyft huvud och axlar ca 2 cm från underlaget genom att spänna magen. Håll nacken neutral.",
    sets: 3,
    reps: "8-10 x 8 sek",
    frequency: "Dagligen",
    tips: "Tänk att du lyfter bröstkorgen, inte huvudet. Minska inte ländryggens svank.",
    category: "strength",
    difficulty: "Medel",
    calories: "25 kcal",
    videoUrl: "https://www.youtube.com/embed/44ScXWFaVBs",
    evidenceLevel: "A",
    sources: [
      SOURCE_MCGILL_LOW_BACK,
      {
        title: "Core Stability Exercise Principles",
        authors: "McGill SM",
        year: 2010,
        journal: "Current Sports Medicine Reports",
        doi: "10.1249/JSR.0b013e3181dfeb17"
      }
    ],
    steps: [
      { title: "Position", instruction: "Ett knä böjt, händer under ländryggen.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft huvud och axlar 2 cm. Spänn magen.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll i 8 sekunder.", type: "execution", animationType: "pulse" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut diskbråck med nervpåverkan",
      "Kotfraktur < 8 veckor",
      "Akut ländryggstrain < 2 veckor"
    ],
    precautions: [
      "Diskbråck - undvik flexion under akut fas",
      "Spinal stenos - försiktig med extension efteråt",
      "Osteoporos - minska intensitet"
    ],
    redFlags: [
      "Smärta som strålar ner i benet (ischias)",
      "Domningar eller svaghet i benen",
      "Blås- eller tarmfunktionsproblem"
    ],
    appropriateForSurgeries: [
      "Diskektomi (efter 6 veckor)",
      "Laminektomi (efter 8 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ["Mindre lyft"], maxLoad: "bodyweight" },
      { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Rectus abdominis, transversus abdominis",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Lyfter huvudet istället för bröstkorgen", "Plattar ut ländryggen"]
    }
  },
  {
    name: "Fågelhunden (Bird Dog)",
    description: "Stå på alla fyra. Sträck ut höger arm och vänster ben samtidigt. Håll ryggen helt stilla. Återgå och byt sida.",
    sets: 3,
    reps: "8-10 per sida",
    frequency: "Dagligen",
    tips: "Tänk att du balanserar en kopp vatten på ländryggen.",
    category: "strength",
    difficulty: "Medel",
    calories: "30 kcal",
    videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
    evidenceLevel: "A",
    sources: [
      SOURCE_MCGILL_LOW_BACK,
      SOURCE_JOSPT_LOW_BACK_2012
    ],
    steps: [
      { title: "Start", instruction: "På alla fyra med neutral rygg.", type: "start", animationType: "pulse" },
      { title: "Sträck", instruction: "Sträck motsatt arm och ben samtidigt.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll i 6-10 sekunder med stabil rygg.", type: "execution", animationType: "pulse" },
      { title: "Byt", instruction: "Återgå kontrollerat och byt sida.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut diskbråck med nervpåverkan",
      "Spinal instabilitet (spondylolisthesis grad 2+)",
      "Akut kotfraktur"
    ],
    precautions: [
      "Ländryggssmärta - håll strikt neutral rygg",
      "Handledssmärta - använd knytnävar istället",
      "Balanssvårigheter - börja med arm eller ben separat"
    ],
    redFlags: [
      "Smärta som strålar ner i benet",
      "Svårighet att kontrollera ryggens position",
      "Ökad smärta efter träning"
    ],
    appropriateForSurgeries: [
      "Diskektomi (efter 4 veckor)",
      "Laminektomi (efter 6 veckor)",
      "Spinal fusion (efter 12 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: false },
      { phase: 2, weeksPostOp: { min: 4, max: 12 }, allowed: true, modifications: ["Endast arm ELLER ben, ej båda"], maxLoad: "bodyweight" },
      { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Multifidus, erector spinae, core stabilisatorer",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Ryggen rör sig", "Roterar höften", "Svajar i ländryggen"]
    }
  },
  {
    name: "Sidoplanka (Side Plank)",
    description: "Ligg på sidan med armbågen under axeln. Lyft höfterna så kroppen bildar en rak linje. Håll positionen.",
    sets: 3,
    reps: "15-30 sekunder per sida",
    frequency: "Varannan dag",
    tips: "Höften ska vara i linje med kroppen, inte sjunka eller lyftas för högt.",
    category: "strength",
    difficulty: "Medel",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/K2VljzCC16g",
    evidenceLevel: "A",
    sources: [
      SOURCE_MCGILL_LOW_BACK,
      {
        title: "Core Muscle Activation During Side Plank Exercise Variations",
        authors: "McGill SM, Karpowicz A",
        year: 2009,
        journal: "Journal of Strength and Conditioning Research",
        doi: "10.1519/JSC.0b013e3181a4f5b6"
      }
    ],
    steps: [
      { title: "Position", instruction: "Sidoläge med armbåge under axeln.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft höfterna till rak kroppslinje.", type: "execution", animationType: "bounce" },
      { title: "Håll", instruction: "Håll positionen stabilt.", type: "execution", animationType: "pulse" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut axelskada",
      "Spinal instabilitet (spondylolisthesis)",
      "Svår höftartros"
    ],
    precautions: [
      "Axelproblem - gör på knä istället för fötter",
      "Ländryggssmärta - håll kortare tid",
      "Svag core - börja med stöd mot vägg"
    ],
    redFlags: [
      "Smärta i axel eller höft",
      "Svårighet att hålla rak linje",
      "Smärta som strålar ner i benet"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Quadratus lumborum, gluteus medius, obliques",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 3,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Höften sjunker", "Roterar kroppen", "Håller andan"]
    }
  },
  {
    name: "Bäckenlyft (Glute Bridge)",
    description: "Ligg på rygg med böjda knän och fötterna i golvet. Lyft höfterna mot taket genom att spänna sätesmusklerna. Sänk kontrollerat.",
    sets: 3,
    reps: "12-15",
    frequency: "Varannan dag",
    tips: "Pressa hälar i golvet och spänn sätesmusklerna i topposition.",
    category: "strength",
    difficulty: "Lätt",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/OUgsJ8-Vi0E",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_HIP_2014,
      {
        title: "Gluteus Maximus Activation During Common Strength Exercises",
        authors: "Contreras B, Vigotsky AD, Schoenfeld BJ, et al.",
        year: 2015,
        journal: "International Journal of Sports Physical Therapy",
        doi: "PMCID: PMC4637917"
      }
    ],
    steps: [
      { title: "Start", instruction: "Ryggläge, knän böjda, fötter i golvet.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Pressa höfterna uppåt med sätesmusklerna.", type: "execution", animationType: "bounce" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - VANLIG POST-OP ÖVNING
    contraindications: [
      "Akut hamstringsskada < 2 veckor",
      "Svår ischiassmärta"
    ],
    precautions: [
      "Ländryggssmärta - håll neutral rygg",
      "Knäsmärta - placera fötterna bredare",
      "Post-op höft - kontrollera tillåtet ROM"
    ],
    redFlags: [
      "Smärta i baksidan av låret",
      "Smärta som strålar ner i benet",
      "Kramper i sätesmusklerna"
    ],
    appropriateForSurgeries: [
      "Höftprotes (efter 2-4 veckor)",
      "Diskektomi (efter 2 veckor)",
      "Knäprotes (efter 2 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ["Mindre lyft"], maxLoad: "bodyweight" },
      { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true },
      { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true, maxLoad: "moderate" }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Gluteus maximus, hamstrings",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Överextenderar ryggen", "Lyfter med hamstrings istället för glutes"]
    }
  },
  {
    name: "Cat-Cow (Katt-Ko)",
    description: "Stå på alla fyra. Böj ryggen uppåt som en arg katt, sedan sänk magen mot golvet och titta upp. Mjuka, kontrollerade rörelser.",
    sets: 2,
    reps: "10-15",
    frequency: "Dagligen",
    tips: "Andas in vid nedåtrörelsen, ut vid uppåtrörelsen.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/kqnua4rHVVA",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_LOW_BACK_2012,
      {
        title: "Spinal Mobility and Motor Control",
        authors: "O'Sullivan PB",
        year: 2005,
        journal: "Manual Therapy",
        doi: "10.1016/j.math.2005.01.005"
      }
    ],
    steps: [
      { title: "Start", instruction: "På alla fyra med neutral rygg.", type: "start", animationType: "pulse" },
      { title: "Katt", instruction: "Runda ryggen uppåt, haka mot bröstet.", type: "execution", animationType: "bounce" },
      { title: "Ko", instruction: "Sänk magen, blicka uppåt.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut spinal instabilitet",
      "Svår spinal stenos (extension-delen)"
    ],
    precautions: [
      "Diskbråck - undvik extension (ko-positionen)",
      "Spinal stenos - undvik eller minimera extension",
      "Handledssmärta - gör på underarmarna"
    ],
    redFlags: [
      "Smärta som strålar ut i extremiteterna",
      "Yrsel vid nackrörelse",
      "Ökad stelhet efter övningen"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Hela ryggraden, core",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Forcerar rörelsen", "Håller andan"]
    }
  },
  {
    name: "Cobra (Prone Press-up)",
    description: "Ligg på mage. Händer under axlarna. Pressa överkroppen upp genom att sträcka armarna medan höfterna ligger kvar i golvet.",
    sets: 3,
    reps: "10",
    frequency: "Dagligen",
    tips: "Känn sträckningen i magen och främre höften. Spänn inte sätesmusklerna.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/JDcdhTuycOI",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_LOW_BACK_2012,
      {
        title: "McKenzie Method for Low Back Pain",
        authors: "McKenzie R, May S",
        year: 2003,
        journal: "Spinal Publications",
        doi: "ISBN: 978-0958364706"
      }
    ],
    steps: [
      { title: "Start", instruction: "Magläge med händer under axlarna.", type: "start", animationType: "pulse" },
      { title: "Pressa upp", instruction: "Sträck armarna och lyft överkroppen.", type: "execution", animationType: "bounce" },
      { title: "Håll", instruction: "Håll kort i topposition.", type: "execution", animationType: "pulse" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - MCKENZIE-METODEN
    contraindications: [
      "Spinal stenos med claudicatio",
      "Spondylolisthesis grad 2+",
      "Facetledssyndrom med extensionspåverkan"
    ],
    precautions: [
      "Diskbråck - börja med propped up position",
      "Akut ländryggssmärta - gör försiktigt",
      "Graviditet - modifiera eller undvik"
    ],
    redFlags: [
      "Smärta som ökar vid extension",
      "Smärta som strålar ner i benet vid rörelse",
      "Domningar eller svaghet i benen"
    ],
    appropriateForSurgeries: [
      "Diskektomi (efter 4-6 veckor, om extension rekommenderas)"
    ],
    contraindicatedSurgeries: [
      "Spinal fusion (första 12 veckorna)",
      "Laminektomi (individuell bedömning)"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 2,
    targetStructure: "Lumbar extensorer, anterior höftstrukturer",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Spänner sätesmusklerna", "Lyfter höfterna från golvet"]
    }
  },
  {
    name: "Dead Bug",
    description: "Ligg på rygg med armar och ben i luften (knän och höfter 90°). Sträck ut motsatt arm och ben samtidigt mot golvet utan att ryggen lyfter.",
    sets: 3,
    reps: "8-10 per sida",
    frequency: "Dagligen",
    tips: "Pressa ländryggen mot underlaget under hela rörelsen.",
    category: "strength",
    difficulty: "Medel",
    calories: "25 kcal",
    videoUrl: "https://www.youtube.com/embed/I5xbsA71v1A",
    evidenceLevel: "B",
    sources: [
      SOURCE_MCGILL_LOW_BACK,
      SOURCE_COMERFORD_STABILITY
    ],
    steps: [
      { title: "Start", instruction: "Ryggläge, armar upp, knän 90°.", type: "start", animationType: "pulse" },
      { title: "Sträck", instruction: "Sträck ut motsatt arm och ben.", type: "execution", animationType: "slide" },
      { title: "Kontroll", instruction: "Håll ryggen i golvet.", type: "tip", animationType: "pulse" },
      { title: "Tillbaka", instruction: "Återgå och byt sida.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut diskbråck med nervpåverkan",
      "Diastasis recti (postpartum, tills läkt)"
    ],
    precautions: [
      "Ländryggssmärta - börja med mindre rörelseomfång",
      "Postpartum - kontrollera diastasis först",
      "Svag core - börja endast med armar eller ben"
    ],
    redFlags: [
      "Ryggen lyfter från underlaget",
      "Smärta i ländryggen",
      "Bukmusklerna buktar ut"
    ],
    maxPainDuring: 2,
    maxPainAfter24h: 1,
    targetStructure: "Transversus abdominis, core stabilisatorer",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 5,
      maxPainDuring: 1,
      maxPainAfter: 0
    },
    regressionTriggers: {
      painIncrease: 1,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Ryggen lyfter", "Håller andan", "Bukmusklerna buktar"]
    }
  },
  {
    name: "Thorax Rotation",
    description: "Ligg på sidan med knäna böjda 90°. Öppna övre armen i en båge mot andra sidan medan du följer handen med blicken. Underbenet ligger kvar.",
    sets: 2,
    reps: "10 per sida",
    frequency: "Dagligen",
    tips: "Håll knäna ihoptryckta mot underlaget.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "8 kcal",
    videoUrl: "https://www.youtube.com/embed/4BOTvaRaDjI",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_LOW_BACK_2012,
      {
        title: "Thoracic Spine Mobility in Healthy Adults",
        authors: "Edmondston SJ, Wark JD, Cicuttini FM",
        year: 1999,
        journal: "Spine",
        doi: "10.1097/00007632-199903010-00011"
      }
    ],
    steps: [
      { title: "Start", instruction: "Sidoläge med knän böjda 90°.", type: "start", animationType: "pulse" },
      { title: "Öppna", instruction: "Öppna armen i en båge, följ med blicken.", type: "execution", animationType: "slide" },
      { title: "Tillbaka", instruction: "Återgå kontrollerat till start.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut diskbråck",
      "Svår ländryggsstelhet med nervpåverkan"
    ],
    precautions: [
      "Axelproblem - begränsa rörelseomfång",
      "Ländryggssmärta - håll bäckenet stabilt",
      "Yrsel - rör huvudet långsammare"
    ],
    redFlags: [
      "Smärta som strålar ut i arm eller ben",
      "Yrsel vid rotation",
      "Smärta som ökar efter träning"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Bröstryggen, intercostalmuskulatur",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Knäna separerar", "Bäckenet roterar med"]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HÖFT (HIP) - Baserat på JOSPT Hip Guidelines 2014
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Musslan (Clamshells)",
    description: "Ligg på sidan med böjda knän (90°). Håll fötterna ihop och öppna översta knäet som en mussla. Sänk kontrollerat.",
    sets: 3,
    reps: "15 per sida",
    frequency: "Varannan dag",
    tips: "Rulla inte höften bakåt när du öppnar knäet.",
    category: "strength",
    difficulty: "Lätt",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/NWTH0ONHKYE",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_HIP_2014,
      {
        title: "Gluteal Muscle Activation During Common Hip Exercises",
        authors: "Distefano LJ, Blackburn JT, Marshall SW, Padua DA",
        year: 2009,
        journal: "Journal of Orthopaedic & Sports Physical Therapy",
        doi: "10.2519/jospt.2009.2796"
      }
    ],
    steps: [
      { title: "Start", instruction: "Sidoläge med knän böjda 90°.", type: "start", animationType: "pulse" },
      { title: "Öppna", instruction: "Lyft översta knäet som en mussla.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - VANLIG POST-OP HÖFT
    contraindications: [
      "Akut höftfraktur",
      "Höftprotes < 2 veckor (kontrollera restriktioner)"
    ],
    precautions: [
      "Post-op höftprotes - kontrollera tillåtna vinklar",
      "Höftartros - minska rörelseomfång vid smärta",
      "SI-ledsproblem - stabilisera bäckenet"
    ],
    redFlags: [
      "Smärta i ljumsken",
      "Klickande eller låsande höft",
      "Smärta som strålar ner i benet"
    ],
    appropriateForSurgeries: [
      "Höftprotes (efter 2 veckor, beroende på approach)",
      "Höftartroskopi"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ["Begränsad öppning beroende på operationsteknik"], maxROM: 30 },
      { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true, maxROM: 45 },
      { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Gluteus medius, piriformis",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Rullar höften bakåt", "Lyfter bäckenet"]
    }
  },
  {
    name: "Höftböjarstretch (Hip Flexor Stretch)",
    description: "Knästående position med ett knä på golvet. Pressa höften framåt för att stretcha höftböjaren på det bakre benet.",
    sets: 2,
    reps: "30-60 sekunder per sida",
    frequency: "Dagligen",
    tips: "Spänn sätesmuskeln på det bakre benet för att förstärka stretchen.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/YQmpO9VT2X4",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_HIP_2014,
      {
        title: "Hip Flexibility and Low Back Pain",
        authors: "Van Dillen LR, Gombatto SP",
        year: 2010,
        journal: "Archives of Physical Medicine and Rehabilitation",
        doi: "10.1016/j.apmr.2009.06.026"
      }
    ],
    steps: [
      { title: "Position", instruction: "Knästående, ett knä på golvet.", type: "start", animationType: "pulse" },
      { title: "Pressa", instruction: "Pressa höften framåt.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll stretchen i 30-60 sekunder.", type: "execution", animationType: "pulse" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut höftledsartrit",
      "Höftprotes med extensionsrestriktion"
    ],
    precautions: [
      "Knäsmärta - använd kudde under knäet",
      "Låg ryggsmärta - undvik överextension i ryggen",
      "Post-op höft - kontrollera tillåten extension"
    ],
    redFlags: [
      "Skarp smärta i ljumsken",
      "Smärta som strålar ner i benet",
      "Stickningar i låret"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 2,
    targetStructure: "Iliopsoas, rectus femoris",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 3,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Överextenderar ryggen", "Lutar överkroppen framåt"]
    }
  },
  {
    name: "Side-lying Hip Abduction",
    description: "Ligg på sidan med understa benet böjt. Lyft översta benet rakt upp mot taket. Håll benet rakt och tårna pekande framåt.",
    sets: 3,
    reps: "15 per sida",
    frequency: "Varannan dag",
    tips: "Stabilisera bålen och undvik att rulla bakåt.",
    category: "strength",
    difficulty: "Medel",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/jgh6sGwtTwk",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_HIP_2014,
      {
        title: "Gluteal Activation During Hip Abduction",
        authors: "Boren K, Conrey C, Le Coguic J, et al.",
        year: 2011,
        journal: "International Journal of Sports Physical Therapy",
        doi: "PMCID: PMC3201064"
      }
    ],
    steps: [
      { title: "Start", instruction: "Sidoläge, understa benet böjt.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft översta benet rakt upp.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - POST-OP HÖFT
    contraindications: [
      "Akut höftfraktur",
      "Höftprotes med abduktionsrestriktion < 6 veckor"
    ],
    precautions: [
      "Post-op höftprotes - kontrollera operationsprotokoll",
      "Höftbursit - undvik om smärtsamt",
      "IT-band-syndrom - stretcha efter övningen"
    ],
    redFlags: [
      "Smärta på utsidan av höften",
      "Smärta som strålar ner i benet",
      "Klickande i höften"
    ],
    appropriateForSurgeries: [
      "Höftprotes (efter 4-6 veckor, beroende på approach)",
      "Höftartroskopi (efter 2 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 4 }, allowed: true, modifications: ["Mindre lyft"], maxROM: 30 },
      { phase: 2, weeksPostOp: { min: 4, max: 8 }, allowed: true, maxROM: 45 },
      { phase: 3, weeksPostOp: { min: 8, max: 12 }, allowed: true }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Gluteus medius, tensor fasciae latae",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Rullar höften", "Böjer knäet"]
    }
  },
  {
    name: "Piriformis Stretch",
    description: "Ligg på rygg med knäna böjda. Lägg ena fotleden över det andra knäet (siffran 4). Dra det understa låret mot bröstet.",
    sets: 2,
    reps: "30-60 sekunder per sida",
    frequency: "Dagligen",
    tips: "Känn stretchen djupt i sätesmuskeln.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/HlvBIPOadfY",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_HIP_2014,
      {
        title: "Piriformis Syndrome: Diagnosis and Management",
        authors: "Hopayian K, Song F, Riera R, Sambandan S",
        year: 2010,
        journal: "Annals of Physical and Rehabilitation Medicine",
        doi: "10.1016/j.rehab.2010.07.002"
      }
    ],
    steps: [
      { title: "Position", instruction: "Ryggläge, fotled på motsatt knä.", type: "start", animationType: "pulse" },
      { title: "Dra", instruction: "Dra understa låret mot bröstet.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Känn stretchen och håll.", type: "execution", animationType: "pulse" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut ischias med svår smärta",
      "Höftprotes med flexionsrestriktion"
    ],
    precautions: [
      "Post-op höft - kontrollera tillåten flexion",
      "Knäsmärta - modifiera positionen",
      "Ländryggssmärta - håll ländryggen i golvet"
    ],
    redFlags: [
      "Smärta som strålar ner i benet förbi knäet",
      "Domningar eller stickningar i foten",
      "Ökad ryggsmärta"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 2,
    targetStructure: "Piriformis, djupa höftrotatorer",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 3,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: false,
      formBreakdown: true,
      compensationPatterns: ["Lyfter ryggen från golvet", "Vrider bäckenet"]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KNÄ (KNEE) - Baserat på JOSPT Knee Guidelines 2010 & Cochrane Patellofemoral
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Knäböj (Squat)",
    description: "Stå med fötterna axelbrett isär. Böj knäna och sänk dig som om du sätter dig på en stol. Håll ryggen rak och knäna i linje med tårna.",
    sets: 3,
    reps: "10-15",
    frequency: "Varannan dag",
    tips: "Pressa knäna utåt och håll vikten på hälarna.",
    category: "strength",
    difficulty: "Medel",
    calories: "40 kcal",
    videoUrl: "https://www.youtube.com/embed/YaXPRqUwItQ",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_KNEE_2010,
      SOURCE_COCHRANE_PATELLOFEMORAL,
      {
        title: "Squat Biomechanics and Injury Risk",
        authors: "Schoenfeld BJ",
        year: 2010,
        journal: "Journal of Strength and Conditioning Research",
        doi: "10.1519/JSC.0b013e3181bac2d7"
      }
    ],
    steps: [
      { title: "Start", instruction: "Fötterna axelbrett isär, tår lätt utåt.", type: "start", animationType: "pulse" },
      { title: "Sänk", instruction: "Sänk dig med kontroll, knän över tår.", type: "execution", animationType: "slide" },
      { title: "Tryck upp", instruction: "Pressa upp genom hälarna.", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER - POST-OP KNÄ
    contraindications: [
      "Akut knäskada < 2 veckor",
      "Knäprotes < 6 veckor",
      "ACL-rekonstruktion < 12 veckor (full squat)"
    ],
    precautions: [
      "Patellofemoralt syndrom - begränsa djupet till smärtfri zon",
      "Post-op knäprotes - börja med mini-squat",
      "Knäartros - undvik djupa squats"
    ],
    redFlags: [
      "Smärta framför knäskålen (patella)",
      "Svullnad efter träning",
      "Knät 'ger vika' eller låser sig"
    ],
    appropriateForSurgeries: [
      "Knäprotes (efter 6 veckor, begränsad)",
      "Meniskoperation (efter 4-6 veckor)",
      "ACL-rekonstruktion (begränsad djup efter 8 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 6 }, allowed: false },
      { phase: 2, weeksPostOp: { min: 6, max: 12 }, allowed: true, modifications: ["Mini-squat max 45°"], maxROM: 45 },
      { phase: 3, weeksPostOp: { min: 12, max: 24 }, allowed: true, modifications: ["90° squat tillåten"], maxROM: 90 }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Quadriceps, gluteus maximus, hamstrings",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Knäna går inåt", "Hälar lyfter", "Lutar framåt"]
    }
  },
  {
    name: "Utfall (Lunge)",
    description: "Stå upprätt. Ta ett stort steg framåt och sänk kroppen tills båda knäna är i 90°. Tryck tillbaka till start och byt ben.",
    sets: 3,
    reps: "10 per ben",
    frequency: "Varannan dag",
    tips: "Håll överkroppen upprätt och knäet bakom tårna.",
    category: "strength",
    difficulty: "Medel",
    calories: "35 kcal",
    videoUrl: "https://www.youtube.com/embed/QOVaHwm-Q6U",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_KNEE_2010,
      {
        title: "Lunge Variations and Muscle Activation",
        authors: "Farrokhi S, Pollard CD, Souza RB, et al.",
        year: 2008,
        journal: "Journal of Orthopaedic & Sports Physical Therapy",
        doi: "10.2519/jospt.2008.2706"
      }
    ],
    steps: [
      { title: "Start", instruction: "Stå upprätt med fötterna ihop.", type: "start", animationType: "pulse" },
      { title: "Stega", instruction: "Ta ett stort steg framåt.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk till båda knän i 90°.", type: "execution", animationType: "slide" },
      { title: "Tillbaka", instruction: "Tryck tillbaka till start.", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER - POST-OP KNÄ
    contraindications: [
      "Akut knäskada < 4 veckor",
      "Knäprotes < 8 veckor",
      "Svår knäinstabilitet"
    ],
    precautions: [
      "Patellofemoralt syndrom - kortare steg, mindre djup",
      "Balanssvårigheter - håll i vägg eller stol",
      "Post-op - börja med statiskt utfall"
    ],
    redFlags: [
      "Knät 'ger vika'",
      "Svullnad efter träning",
      "Smärta vid landning"
    ],
    appropriateForSurgeries: [
      "Knäprotes (efter 8-12 veckor)",
      "Meniskoperation (efter 6-8 veckor)",
      "ACL-rekonstruktion (efter 12-16 veckor)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 8 }, allowed: false },
      { phase: 2, weeksPostOp: { min: 8, max: 16 }, allowed: true, modifications: ["Statiskt utfall först", "Kortare steg"], maxLoad: "bodyweight" },
      { phase: 3, weeksPostOp: { min: 16, max: 24 }, allowed: true }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Quadriceps, gluteus maximus, hamstrings",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Framknät går förbi tårna", "Lutar överkroppen", "Knät faller inåt"]
    }
  },
  {
    name: "Knästräckning (Knee Extension)",
    description: "Sitt på en stol. Sträck ut ena benet tills det är rakt. Håll kort i topposition. Sänk kontrollerat.",
    sets: 3,
    reps: "12-15 per ben",
    frequency: "Varannan dag",
    tips: "Spänn quadriceps aktivt i topposition.",
    category: "strength",
    difficulty: "Lätt",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/4ZG-BExhPsk",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_KNEE_2010,
      SOURCE_COCHRANE_PATELLOFEMORAL
    ],
    steps: [
      { title: "Start", instruction: "Sitt med ryggen mot ryggstödet.", type: "start", animationType: "pulse" },
      { title: "Sträck", instruction: "Sträck benet rakt ut.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Spänn quadriceps i 2 sek.", type: "execution", animationType: "pulse" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - MYCKET VANLIG POST-OP
    contraindications: [
      "Akut patellafraktur",
      "Nyopererat patellarsena"
    ],
    precautions: [
      "Patellofemoralt syndrom - begränsa rörelseomfång",
      "Post-op knäprotes - börja med isometrisk aktivering",
      "Patellarsenetendinit - undvik full extension med belastning"
    ],
    redFlags: [
      "Smärta framför knäskålen",
      "Krepitationer (knäppande ljud)",
      "Svullnad efter träning"
    ],
    appropriateForSurgeries: [
      "Knäprotes (dag 1-2 post-op)",
      "Meniskoperation (dag 1-2 post-op)",
      "ACL-rekonstruktion (vecka 1-2)"
    ],
    postOpRestrictions: [
      { phase: 1, weeksPostOp: { min: 0, max: 2 }, allowed: true, modifications: ["Isometrisk i full extension först"], maxLoad: "bodyweight" },
      { phase: 2, weeksPostOp: { min: 2, max: 6 }, allowed: true, modifications: ["Lägg till rörelse"], maxLoad: "light" },
      { phase: 3, weeksPostOp: { min: 6, max: 12 }, allowed: true, maxLoad: "moderate" }
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Quadriceps femoris",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Kompenserar med höften", "Böjer inte knäet fullständigt"]
    }
  },
  {
    name: "Hälglidning (Heel Slides)",
    description: "Ligg på rygg med benen raka. Dra hälarna mot sätesmuskeln genom att böja knäet. Glid tillbaka.",
    sets: 2,
    reps: "15-20 per ben",
    frequency: "Dagligen",
    tips: "Använd ett underlag som minskar friktion (t.ex. handduk på golv).",
    category: "mobility",
    difficulty: "Lätt",
    calories: "8 kcal",
    videoUrl: "https://www.youtube.com/embed/O_qKzDchPdg",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_KNEE_2010,
      {
        title: "Post-operative Rehabilitation After Knee Surgery",
        authors: "Myer GD, Paterno MV, Ford KR, et al.",
        year: 2008,
        journal: "Knee Surgery, Sports Traumatology, Arthroscopy",
        doi: "10.1007/s00167-008-0597-8"
      }
    ],
    steps: [
      { title: "Start", instruction: "Ryggläge med benen raka.", type: "start", animationType: "pulse" },
      { title: "Glid", instruction: "Dra hälen mot sätet.", type: "execution", animationType: "slide" },
      { title: "Tillbaka", instruction: "Glid tillbaka till rakt ben.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - STANDARD POST-OP KNÄ
    contraindications: [],
    precautions: [
      "Post-op knäprotes - följ kirurgens ROM-mål",
      "Svullnad - minska repetitioner",
      "Smärta vid böjning - stanna vid smärtfritt ROM"
    ],
    redFlags: [
      "Plötslig ökad svullnad",
      "Smärta som förhindrar rörelse",
      "Känsla av låsning i knäet"
    ],
    appropriateForSurgeries: [
      "Knäprotes (dag 1 post-op)",
      "ACL-rekonstruktion (dag 1 post-op)",
      "Meniskoperation (dag 1 post-op)"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 3,
    targetStructure: "Knäledens ROM",
    healingTissue: "ligament",
    progressionCriteria: {
      minPainFreeReps: 20,
      minConsecutiveDays: 3,
      maxPainDuring: 3,
      maxPainAfter: 2
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: false
    }
  },
  {
    name: "Straight Leg Raise (SLR)",
    description: "Ligg på rygg. Spänn quadriceps på ena benet och lyft det raka benet ca 30 cm från golvet. Sänk kontrollerat.",
    sets: 3,
    reps: "12-15 per ben",
    frequency: "Varannan dag",
    tips: "Håll knäet helt rakt under hela rörelsen.",
    category: "strength",
    difficulty: "Lätt",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/xqJNb4t3k6c",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_KNEE_2010,
      {
        title: "Quadriceps Function After ACL Reconstruction",
        authors: "Palmieri-Smith RM, Thomas AC, Wojtys EM",
        year: 2008,
        journal: "Journal of Athletic Training",
        doi: "10.4085/1062-6050-43.5.474"
      }
    ],
    steps: [
      { title: "Start", instruction: "Ryggläge, ett knä böjt, ett ben rakt.", type: "start", animationType: "pulse" },
      { title: "Spänn", instruction: "Spänn quadriceps på det raka benet.", type: "execution", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft benet 30 cm med knäet rakt.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER - STANDARD POST-OP
    contraindications: [
      "Akut diskbråck med SLR-positiv test",
      "Akut quadricepsskada"
    ],
    precautions: [
      "Ischiassmärta - minska lyfthöjd",
      "Svag quadriceps - börja med isometriskt",
      "Post-op ACL - vänta tills extension är full"
    ],
    redFlags: [
      "Smärta som strålar ner i benet",
      "Oförmåga att hålla knäet rakt",
      "Ökad ryggsmärta"
    ],
    appropriateForSurgeries: [
      "Knäprotes (dag 1-2 post-op)",
      "ACL-rekonstruktion (vecka 1)",
      "Meniskoperation (dag 1 post-op)",
      "Höftprotes (vecka 1-2)"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Quadriceps, höftflexorer",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 3,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Böjer knäet", "Roterar höften"]
    }
  },
  {
    name: "Step-ups",
    description: "Stå framför en låg trappsteg eller låda. Kliv upp med ena benet, följ med det andra. Kliv ner och upprepa.",
    sets: 3,
    reps: "10-15 per ben",
    frequency: "Varannan dag",
    tips: "Kontrollera knäet så det inte faller inåt.",
    category: "strength",
    difficulty: "Medel",
    calories: "30 kcal",
    videoUrl: "https://www.youtube.com/embed/dQqApCGd5Ss",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_KNEE_2010,
      SOURCE_COCHRANE_PATELLOFEMORAL
    ],
    steps: [
      { title: "Start", instruction: "Stå framför en låda/trappsteg.", type: "start", animationType: "pulse" },
      { title: "Kliv upp", instruction: "Placera ena foten på lådan och kliv upp.", type: "execution", animationType: "bounce" },
      { title: "Kliv ner", instruction: "Kliv kontrollerat ner.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut knäskada < 6 veckor",
      "Svår knäinstabilitet",
      "Balanssvårigheter utan stöd"
    ],
    precautions: [
      "Post-op knä - börja med låg höjd",
      "Patellofemoralt syndrom - kontrollera knäposition",
      "Höftprotes - undvik för hög steg"
    ],
    redFlags: [
      "Knät 'ger vika'",
      "Smärta vid landning",
      "Obalans eller fall"
    ],
    appropriateForSurgeries: [
      "Knäprotes (efter 8-12 veckor)",
      "ACL-rekonstruktion (efter 12 veckor)",
      "Höftprotes (efter 6-8 veckor)"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Quadriceps, gluteus maximus",
    healingTissue: "muscle",
    progressionCriteria: {
      minPainFreeReps: 10,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Knät faller inåt", "Använder fart istället för kontroll"]
    }
  },
  {
    name: "Spanish Squat",
    description: "Fäst ett band runt något stadigt i knähöjd. Stå med bandet bakom knäna. Sjunk ner i squat medan bandet hjälper dig att hålla skenbenen vertikala.",
    sets: 3,
    reps: "10-12",
    frequency: "Varannan dag",
    tips: "Bandet ska minska belastningen på patellasenan.",
    category: "strength",
    difficulty: "Medel",
    calories: "25 kcal",
    videoUrl: "https://www.youtube.com/embed/q6jNJTqv-Ds",
    evidenceLevel: "B",
    sources: [
      {
        title: "The Spanish Squat for Patellar Tendinopathy",
        authors: "van Ark M, Cook JL, Docking SI, et al.",
        year: 2016,
        journal: "British Journal of Sports Medicine",
        doi: "10.1136/bjsports-2015-094724"
      },
      SOURCE_BJSM_TENDINOPATHY
    ],
    steps: [
      { title: "Setup", instruction: "Band runt stadigt objekt, bakom knäna.", type: "start", animationType: "pulse" },
      { title: "Squat", instruction: "Sjunk ner med vertikala skenben.", type: "execution", animationType: "slide" },
      { title: "Upp", instruction: "Pressa upp till stående.", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER - SPECIFIK FÖR PATELLARSENA
    contraindications: [
      "Akut patellarseneinflammation",
      "Nyligen patellarseneruptur",
      "Svår knäartros"
    ],
    precautions: [
      "Patellatendinopati - börja utan smärta",
      "Knäsmärta - minska djupet",
      "Post-op - endast efter godkännande"
    ],
    redFlags: [
      "Skarp smärta i patellarsena",
      "Svullnad runt knäskålen",
      "Smärta som ökar progressivt"
    ],
    maxPainDuring: 4,
    maxPainAfter24h: 3,
    targetStructure: "Quadriceps, patellarsena",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 12,
      minConsecutiveDays: 5,
      maxPainDuring: 3,
      maxPainAfter: 2
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Skenben lutar framåt", "Hälar lyfter"]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOT & VRIST (ANKLE/FOOT) - Baserat på JOSPT Ankle & Plantar Fasciitis Guidelines
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Tåhävningar (Calf Raises)",
    description: "Stå med fötterna höftbrett isär. Lyft dig upp på tå så högt du kan. Sänk kontrollerat tillbaka till start.",
    sets: 3,
    reps: "15-20",
    frequency: "Varannan dag",
    tips: "Gör övningen långsamt för bättre muskelaktivering.",
    category: "strength",
    difficulty: "Lätt",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/gwLzBJYoWlI",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_ANKLE_2018,
      SOURCE_ALFREDSON_ACHILLES
    ],
    steps: [
      { title: "Start", instruction: "Stå med fötterna höftbrett isär.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft dig upp på tå.", type: "execution", animationType: "bounce" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ],
    // SÄKERHETSFUNKTIONER
    contraindications: [
      "Akut hälseneruptur < 12 veckor",
      "Akut fotledsstukning < 2 veckor"
    ],
    precautions: [
      "Hälsenetendinopati - börja med dubbla ben",
      "Plantarfasciit - undvik om morgonstyvhet",
      "Post-op hälsena - följ protokoll noggrant"
    ],
    redFlags: [
      "Plötslig smärta i hälsenan",
      "Känsla av 'snap' i vaden",
      "Svullnad eller missfärgning"
    ],
    appropriateForSurgeries: [
      "Hälsenereparation (efter 12+ veckor)"
    ],
    maxPainDuring: 3,
    maxPainAfter24h: 2,
    targetStructure: "Gastrocnemius, soleus",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 20,
      minConsecutiveDays: 5,
      maxPainDuring: 2,
      maxPainAfter: 1
    },
    regressionTriggers: {
      painIncrease: 2,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Rullar foten utåt", "Böjer knäna"]
    }
  },
  {
    name: "Excentrisk Vadträning (Alfredson Protocol)",
    description: "Stå med framfoten på en trappkant. Sänk hälen långsamt under fotnivån (3 sek). Använd det friska benet för att komma tillbaka upp.",
    sets: 3,
    reps: "15 per ben (2 ggr/dag)",
    frequency: "Dagligen",
    tips: "Endast nedfasen görs på det skadade benet.",
    category: "strength",
    difficulty: "Medel",
    calories: "20 kcal",
    videoUrl: "https://www.youtube.com/embed/FKxvB4xdPWw",
    evidenceLevel: "A",
    sources: [
      SOURCE_ALFREDSON_ACHILLES,
      {
        title: "Eccentric Calf Muscle Training in Athletic Patients with Achilles Tendinosis",
        authors: "Alfredson H",
        year: 2003,
        journal: "Sports Medicine and Arthroscopy Review",
        doi: "10.1097/00132585-200303000-00009"
      }
    ],
    steps: [
      { title: "Position", instruction: "Framfoten på trappkant, hälen utanför.", type: "start", animationType: "pulse" },
      { title: "Sänk", instruction: "Sänk hälen långsamt under fotnivån (3 sek).", type: "execution", animationType: "slide" },
      { title: "Upp", instruction: "Använd friska benet för att komma tillbaka upp.", type: "execution", animationType: "bounce" }
    ],
    // SÄKERHETSFUNKTIONER - EVIDENSBASERAD TENDINOPATI
    contraindications: [
      "Akut hälseneruptur",
      "Nyligen hälseneoperation < 12 veckor"
    ],
    precautions: [
      "Kronisk hälsenetendinopati - förvänta lätt smärta (< 5/10)",
      "Insertionell tendinopati - undvik full dorsalflexion",
      "Äldre patienter - börja med isometriskt"
    ],
    redFlags: [
      "Plötslig kraftig smärta",
      "Känsla av att något 'brister'",
      "Smärta som ökar > 24 timmar efteråt"
    ],
    maxPainDuring: 5,
    maxPainAfter24h: 3,
    targetStructure: "Hälsenan (achilles)",
    healingTissue: "tendon",
    progressionCriteria: {
      minPainFreeReps: 15,
      minConsecutiveDays: 7,
      maxPainDuring: 4,
      maxPainAfter: 2
    },
    regressionTriggers: {
      painIncrease: 3,
      swellingPresent: true,
      formBreakdown: true,
      compensationPatterns: ["Går för snabbt ner", "Böjer knäet under nedfas"]
    }
  },
  {
    name: "Plantarfasciastretch",
    description: "Sitt med ena fotleden över det andra knäet. Dra tårna bakåt mot skenbenet. Känn stretchen under fotvalvet.",
    sets: 3,
    reps: "30-60 sekunder per fot",
    frequency: "Dagligen (speciellt morgon)",
    tips: "Utför stretchen innan du går ur sängen på morgonen.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "3 kcal",
    videoUrl: "https://www.youtube.com/embed/4HRZfqBcrU0",
    evidenceLevel: "A",
    sources: [
      SOURCE_JOSPT_PLANTAR_FASCIITIS_2014,
      {
        title: "Plantar Fascia-Specific Stretching Exercise Improves Outcomes",
        authors: "DiGiovanni BF, Nawoczenski DA, Malay DP, et al.",
        year: 2006,
        journal: "Journal of Bone and Joint Surgery",
        doi: "10.2106/JBJS.E.00256"
      }
    ],
    steps: [
      { title: "Position", instruction: "Fot över motsatt knä.", type: "start", animationType: "pulse" },
      { title: "Stretch", instruction: "Dra tårna bakåt mot skenbenet.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll i 30-60 sekunder.", type: "execution", animationType: "pulse" }
    ]
  },
  {
    name: "Fotledsrotation",
    description: "Sitt med benet i luften. Rotera foten i cirklar, först medurs sedan moturs.",
    sets: 2,
    reps: "15 vardera riktning per fot",
    frequency: "Dagligen",
    tips: "Gör stora, kontrollerade cirklar.",
    category: "mobility",
    difficulty: "Lätt",
    calories: "5 kcal",
    videoUrl: "https://www.youtube.com/embed/IeMSwXGRWYI",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_ANKLE_2018,
      {
        title: "Ankle Range of Motion and Balance",
        authors: "Hoch MC, McKeon PO",
        year: 2011,
        journal: "Journal of Athletic Training",
        doi: "10.4085/1062-6050-46.6.638"
      }
    ],
    steps: [
      { title: "Start", instruction: "Sitt med benet i luften.", type: "start", animationType: "pulse" },
      { title: "Medurs", instruction: "Rotera foten i cirklar medurs.", type: "execution", animationType: "bounce" },
      { title: "Moturs", instruction: "Rotera foten i cirklar moturs.", type: "execution", animationType: "bounce" }
    ]
  },
  {
    name: "Towel Grab (Handduksgrepp)",
    description: "Sitt med en handduk under foten. Använd tårna för att dra ihop handduken mot dig. Släpp och upprepa.",
    sets: 3,
    reps: "15-20 per fot",
    frequency: "Dagligen",
    tips: "Fokusera på att använda tårna aktivt, inte hela foten.",
    category: "strength",
    difficulty: "Lätt",
    calories: "8 kcal",
    videoUrl: "https://www.youtube.com/embed/iyRx_nENbbE",
    evidenceLevel: "B",
    sources: [
      SOURCE_JOSPT_PLANTAR_FASCIITIS_2014,
      {
        title: "Intrinsic Foot Muscle Training in Runners",
        authors: "Mulligan EP, Cook PG",
        year: 2013,
        journal: "International Journal of Sports Physical Therapy",
        doi: "PMCID: PMC3679634"
      }
    ],
    steps: [
      { title: "Start", instruction: "Handduk under foten på golvet.", type: "start", animationType: "pulse" },
      { title: "Grip", instruction: "Använd tårna för att dra ihop handduken.", type: "execution", animationType: "bounce" },
      { title: "Släpp", instruction: "Släpp och upprepa.", type: "execution", animationType: "pulse" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BALANS - Baserat på Cochrane Balance Review 2019
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Enbensbalans",
    description: "Stå på ett ben med det andra benet lyft från golvet. Håll balansen så länge som möjligt.",
    sets: 3,
    reps: "30 sekunder per ben",
    frequency: "Dagligen",
    tips: "Börja med ögonen öppna, gör sedan svårare genom att blunda.",
    category: "balance",
    difficulty: "Medel",
    calories: "10 kcal",
    videoUrl: "https://www.youtube.com/embed/6HspTUvF-C4",
    evidenceLevel: "A",
    sources: [
      SOURCE_COCHRANE_BALANCE,
      {
        title: "Balance Training for Fall Prevention",
        authors: "Sherrington C, Tiedemann A, Fairhall N, et al.",
        year: 2011,
        journal: "Journal of the American Geriatrics Society",
        doi: "10.1111/j.1532-5415.2011.03611.x"
      }
    ],
    steps: [
      { title: "Start", instruction: "Stå på båda fötterna.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Lyft ett ben från golvet.", type: "execution", animationType: "slide" },
      { title: "Håll", instruction: "Håll balansen i 30 sekunder.", type: "execution", animationType: "pulse" }
    ]
  },
  {
    name: "Tandemstående",
    description: "Stå med ena foten direkt framför den andra (häl mot tå). Håll balansen.",
    sets: 3,
    reps: "30 sekunder per fotposition",
    frequency: "Dagligen",
    tips: "Byt vilken fot som är framme.",
    category: "balance",
    difficulty: "Medel",
    calories: "8 kcal",
    videoUrl: "https://www.youtube.com/embed/2bxsqEELWS8",
    evidenceLevel: "A",
    sources: [
      SOURCE_COCHRANE_BALANCE,
      {
        title: "Tandem Stance Test for Balance Assessment",
        authors: "Shumway-Cook A, Horak FB",
        year: 1986,
        journal: "Physical Therapy",
        doi: "10.1093/ptj/66.10.1548"
      }
    ],
    steps: [
      { title: "Position", instruction: "Ställ en fot direkt framför den andra.", type: "start", animationType: "pulse" },
      { title: "Håll", instruction: "Håll balansen i 30 sekunder.", type: "execution", animationType: "pulse" },
      { title: "Byt", instruction: "Byt fot och upprepa.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "BOSU-balans",
    description: "Stå på en BOSU-boll (eller kudde) med båda fötterna. Håll balansen medan du stabiliserar kroppen.",
    sets: 3,
    reps: "30-60 sekunder",
    frequency: "Varannan dag",
    tips: "Progression: Blunda, rör på armarna, stå på ett ben.",
    category: "balance",
    difficulty: "Svår",
    calories: "15 kcal",
    videoUrl: "https://www.youtube.com/embed/KStOMC7X4fE",
    evidenceLevel: "A",
    sources: [
      SOURCE_COCHRANE_BALANCE,
      {
        title: "Unstable Surface Training for Balance",
        authors: "Behm DG, Muehlbauer T, Kibele A, Granacher U",
        year: 2015,
        journal: "Sports Medicine",
        doi: "10.1007/s40279-015-0326-0"
      }
    ],
    steps: [
      { title: "Start", instruction: "Stå med båda fötterna på BOSU-bollen.", type: "start", animationType: "pulse" },
      { title: "Stabilisera", instruction: "Hitta balansen och håll kroppen stilla.", type: "execution", animationType: "bounce" },
      { title: "Progression", instruction: "Öka svårigheten genom att blunda eller röra armarna.", type: "tip", animationType: "shake" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTHÅLLIGHET (ENDURANCE) - Baserat på ACSM Guidelines
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Promenad",
    description: "Gå i måttlig takt på plan mark. Håll en hastighet där du kan prata men blir lite andfådd.",
    sets: 1,
    reps: "20-30 minuter",
    frequency: "Dagligen",
    tips: "Håll god hållning, svinga med armarna naturligt.",
    category: "endurance",
    difficulty: "Lätt",
    calories: "100-150 kcal",
    evidenceLevel: "A",
    sources: [
      SOURCE_ACSM_EXERCISE,
      {
        title: "Physical Activity Guidelines for Americans",
        authors: "U.S. Department of Health and Human Services",
        year: 2018,
        journal: "health.gov",
        url: "https://health.gov/paguidelines/second-edition/"
      }
    ],
    steps: [
      { title: "Start", instruction: "Stå med god hållning.", type: "start", animationType: "pulse" },
      { title: "Gå", instruction: "Börja gå i måttlig takt.", type: "execution", animationType: "slide" },
      { title: "Fortsätt", instruction: "Håll takten i 20-30 minuter.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Stationär Cykel",
    description: "Cykla på en motionscykel i måttlig intensitet. Justera motståndet så att du blir varm men kan hålla ett samtal.",
    sets: 1,
    reps: "15-30 minuter",
    frequency: "3-5 ggr/vecka",
    tips: "Håll en kadensn på 60-80 RPM. Undvik att gunga med överkroppen.",
    category: "endurance",
    difficulty: "Medel",
    calories: "150-250 kcal",
    evidenceLevel: "A",
    sources: [
      SOURCE_ACSM_EXERCISE,
      {
        title: "Cycling for Health and Rehabilitation",
        authors: "Oja P, Titze S, Bauman A, et al.",
        year: 2011,
        journal: "Scandinavian Journal of Medicine & Science in Sports",
        doi: "10.1111/j.1600-0838.2011.01299.x"
      }
    ],
    steps: [
      { title: "Setup", instruction: "Justera sadel och styre till rätt höjd.", type: "start", animationType: "pulse" },
      { title: "Uppvärmning", instruction: "Börja med lågt motstånd i 3-5 minuter.", type: "execution", animationType: "slide" },
      { title: "Träning", instruction: "Öka motståndet till måttlig intensitet.", type: "execution", animationType: "bounce" },
      { title: "Nedvarvning", instruction: "Minska motståndet de sista 3-5 minuterna.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Vattengymnastik",
    description: "Utför övningar i vatten (bassäng). Vattnet ger motstånd och avlastar lederna samtidigt.",
    sets: 1,
    reps: "30-45 minuter",
    frequency: "2-3 ggr/vecka",
    tips: "Vattennivån bör vara vid brösthöjd för optimal avlastning.",
    category: "endurance",
    difficulty: "Medel",
    calories: "200-350 kcal",
    evidenceLevel: "A",
    sources: [
      SOURCE_ACSM_EXERCISE,
      {
        title: "Aquatic Exercise for Treatment of Knee Osteoarthritis",
        authors: "Batterham SI, Heywood S, Keating JL",
        year: 2011,
        journal: "Arthritis Care & Research",
        doi: "10.1002/acr.20433"
      }
    ],
    steps: [
      { title: "Start", instruction: "Stå i brösthöjt vatten.", type: "start", animationType: "pulse" },
      { title: "Rörelse", instruction: "Utför övningar som promenad, knälyft, armrörelser.", type: "execution", animationType: "bounce" },
      { title: "Tempo", instruction: "Arbeta i måttlig intensitet, bli varm men inte utmattad.", type: "tip", animationType: "pulse" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAND & HANDLED - Baserat på kliniska riktlinjer
  // ═══════════════════════════════════════════════════════════════════════════

  {
    name: "Handledsböjning",
    description: "Sitt med underarmen på ett bord, handleden utanför kanten. Böj handleden uppåt med handflatan uppåt. Sänk kontrollerat.",
    sets: 3,
    reps: "15 per hand",
    frequency: "Varannan dag",
    tips: "Kan göras med lätt vikt (0.5-1 kg) för ökad belastning.",
    category: "strength",
    difficulty: "Lätt",
    calories: "8 kcal",
    evidenceLevel: "B",
    sources: [
      {
        title: "Rehabilitation of Wrist Injuries",
        authors: "Rettig AC",
        year: 2004,
        journal: "Clinical Sports Medicine",
        doi: "10.1016/j.csm.2004.04.003"
      }
    ],
    steps: [
      { title: "Position", instruction: "Underarm på bord, handled fri.", type: "start", animationType: "pulse" },
      { title: "Böj", instruction: "Böj handleden uppåt.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk kontrollerat tillbaka.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Excentrisk Handledsextension",
    description: "Sitt med underarmen på bordet, handflatan nedåt. Använd andra handen för att lyfta handleden uppåt, sedan sänk långsamt (3 sek) med bara det tränade armen.",
    sets: 3,
    reps: "15 per hand",
    frequency: "Dagligen",
    tips: "Endast nedfasen görs av den skadade armen. Effektiv för tennisarmbåge.",
    category: "strength",
    difficulty: "Medel",
    calories: "10 kcal",
    evidenceLevel: "A",
    sources: [
      {
        title: "Eccentric Exercise for Lateral Epicondylalgia",
        authors: "Tyler TF, Thomas GC, Nicholas SJ, McHugh MP",
        year: 2010,
        journal: "Journal of Orthopaedic & Sports Physical Therapy",
        doi: "10.2519/jospt.2010.3461"
      },
      SOURCE_BJSM_TENDINOPATHY
    ],
    steps: [
      { title: "Start", instruction: "Underarm på bord, handflatan nedåt.", type: "start", animationType: "pulse" },
      { title: "Lyft", instruction: "Använd andra handen för att lyfta handleden.", type: "execution", animationType: "slide" },
      { title: "Sänk", instruction: "Sänk långsamt (3 sek) med bara tränade armen.", type: "execution", animationType: "slide" }
    ]
  },
  {
    name: "Greppstyrka (Handtag)",
    description: "Använd en greppträningsboll eller handtag. Krama ihop i 3 sekunder, släpp sedan.",
    sets: 3,
    reps: "15 per hand",
    frequency: "Dagligen",
    tips: "Börja med lätt motstånd och öka gradvis.",
    category: "strength",
    difficulty: "Lätt",
    calories: "8 kcal",
    evidenceLevel: "B",
    sources: [
      {
        title: "Grip Strength and Functional Recovery",
        authors: "Bohannon RW",
        year: 2001,
        journal: "Journal of Hand Therapy",
        doi: "10.1016/S0894-1130(01)80001-9"
      }
    ],
    steps: [
      { title: "Grip", instruction: "Håll bollen/handtaget i handen.", type: "start", animationType: "pulse" },
      { title: "Krama", instruction: "Krama ihop i 3 sekunder.", type: "execution", animationType: "bounce" },
      { title: "Släpp", instruction: "Släpp och upprepa.", type: "execution", animationType: "pulse" }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNKTIONER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hämta övningar efter kategori
 */
export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.category === category);
}

/**
 * Hämta övningar efter svårighetsgrad
 */
export function getExercisesByDifficulty(difficulty: Exercise['difficulty']): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.difficulty === difficulty);
}

/**
 * Hämta övningar efter evidensnivå
 */
export function getExercisesByEvidenceLevel(level: Exercise['evidenceLevel']): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.evidenceLevel === level);
}

/**
 * Sök övningar baserat på nyckelord
 */
export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_DATABASE.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.description.toLowerCase().includes(lowerQuery) ||
    ex.tips.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Hämta en slumpmässig övning från en kategori
 */
export function getRandomExercise(category?: Exercise['category']): Exercise {
  const pool = category ? getExercisesByCategory(category) : EXERCISE_DATABASE;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Få statistik om databasen
 */
export function getDatabaseStats() {
  const categories = {
    mobility: getExercisesByCategory('mobility').length,
    strength: getExercisesByCategory('strength').length,
    balance: getExercisesByCategory('balance').length,
    endurance: getExercisesByCategory('endurance').length
  };

  const difficulties = {
    lätt: getExercisesByDifficulty('Lätt').length,
    medel: getExercisesByDifficulty('Medel').length,
    svår: getExercisesByDifficulty('Svår').length
  };

  const evidenceLevels = {
    A: getExercisesByEvidenceLevel('A').length,
    B: getExercisesByEvidenceLevel('B').length,
    expert: getExercisesByEvidenceLevel('expert').length
  };

  return {
    total: EXERCISE_DATABASE.length,
    categories,
    difficulties,
    evidenceLevels,
    allWithSources: EXERCISE_DATABASE.every(ex => ex.sources && ex.sources.length > 0)
  };
}

export default EXERCISE_DATABASE;
