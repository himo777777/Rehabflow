import { z } from "zod";
import { UserAssessment, GeneratedProgram, Exercise, ExerciseAdjustmentType, WeeklyAnalysis, InjuryType, BodyArea } from "../types";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase";
import { ONBOARDING_PROMPTS, RED_FLAGS } from "../data/prompts/onboardingPrompt";
import {
  getProtocol,
  getCurrentPhase,
  getPhaseRestrictionsForPrompt,
  getWeightBearingAdvice,
  POST_OP_PROTOCOLS,
  isExerciseSafe,
  getPhaseContraindications
} from "../data/protocols/postOpProtocols";
import {
  getSourcesByBodyArea,
  getSourcesByEvidenceLevel,
  SCIENTIFIC_SOURCES,
  getAllSourcesByBodyArea
} from "../data/sources/scientificSources";
import {
  getSvenskaKallorByBodyArea,
  getAxelinaKallor
} from "../data/sources/svenskaKallor";
import {
  getAxelinaProtocol,
  AXELINA_PROTOCOLS
} from "../data/protocols/axelinaProtocols";
import {
  getSvensktProtokollByBodyArea,
  ALLA_SVENSKA_PROTOKOLL
} from "../data/protocols/svenskaRegionProtokoll";
import {
  getPreventionProtocolBySport,
  getPreventionProtocolsByBodyArea,
  generatePreventionPrompt,
  PREVENTION_PROTOCOLS
} from "../data/protocols/preventionProtocols";
import {
  getEducationSchoolByCondition,
  getEducationSchoolsByBodyArea,
  generateEducationSchoolPrompt,
  EDUCATION_SCHOOLS
} from "../data/protocols/patientEducationSchools";
import {
  getDigitalProgramByCondition,
  shouldRecommendDigitalOption,
  generateDigitalProgramPrompt,
  DIGITAL_PROGRAMS
} from "../data/protocols/digitalPrograms";
import {
  buildClinicalContext,
  getHealingTimeline,
  getCurrentPhase as getClinicalPhase,
  getNormalROM,
  calculateROMDeficit,
  getGuidelineForCondition
} from "../data/clinicalKnowledge";
import {
  getDosingRecommendation,
  generateDosingPrompt,
  DosingParameters
} from "./dosingService";
import {
  validateExercise,
  validateExerciseList,
  ExerciseValidationContext
} from "./exerciseValidationService";
import {
  evaluateProgression,
  evaluatePhaseTransition,
  PHASE_TRANSITION_CRITERIA
} from "./progressionService";
import {
  checkChatRateLimit,
  checkProgramRateLimit,
  getRateLimitErrorMessage
} from "../lib/rateLimit";
import { logger } from "../lib/logger";
import {
  aiCompletion,
  aiCompletionStream,
  withRetry as aiWithRetry
} from "../lib/aiClient";
import { PatientPainHistory, SMARTGoal, BaselineAssessmentScore, ExerciseLog, DailyPainLog, FollowUpQuestion, AIQuestionAnswer } from "../types";

// Model to use - llama-3.3-70b-versatile is fast and capable
const MODEL = "llama-3.3-70b-versatile";

// ============================================
// ZOD SCHEMAS FOR AI RESPONSE VALIDATION
// ============================================

// Exercise schema - validates AI-generated exercises
const ExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  description: z.string().min(1, "Description is required"),
  sets: z.number().int().positive().max(20),
  reps: z.string().min(1),
  frequency: z.string().min(1),
  tips: z.string(),
  category: z.enum(["mobility", "strength", "balance", "endurance"]),
  risks: z.string().optional(),
  advancedTips: z.string().optional(),
  difficulty: z.enum(["Lätt", "Medel", "Svår"]).optional(),
  calories: z.string().optional(),
  videoUrl: z.string().url().optional(),
  evidenceLevel: z.enum(["A", "B", "C", "D", "expert"]).optional(),
  contraindications: z.array(z.string()).optional(),
  precautions: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
  maxPainDuring: z.number().min(0).max(10).optional(),
  maxPainAfter24h: z.number().min(0).max(10).optional(),
});

// Patient education schema
const PatientEducationSchema = z.object({
  diagnosis: z.string().min(1),
  explanation: z.string().min(1),
  pathology: z.string().min(1),
  prognosis: z.string().min(1),
  scienceBackground: z.string().min(1),
  dailyTips: z.array(z.string()),
  sources: z.array(z.string()),
});

// Daily plan schema
const DailyPlanSchema = z.object({
  day: z.number().int().positive(),
  focus: z.string().min(1),
  exercises: z.array(ExerciseSchema),
});

// Rehab phase schema
const RehabPhaseSchema = z.object({
  phaseName: z.string().min(1),
  durationWeeks: z.string().min(1),
  description: z.string().min(1),
  goals: z.array(z.string()),
  precautions: z.array(z.string()),
  dailyRoutine: z.array(DailyPlanSchema),
});

// Full program schema
const GeneratedProgramSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  conditionAnalysis: z.string().min(1),
  patientEducation: PatientEducationSchema,
  phases: z.array(RehabPhaseSchema).min(1),
});

// Weekly analysis schema
const WeeklyAnalysisSchema = z.object({
  decision: z.enum(["maintain", "progress", "regress"]),
  reasoning: z.string().min(1),
  tips: z.array(z.string()),
  score: z.number().min(0).max(100),
});

// Follow-up question schema (for onboarding)
const FollowUpQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["text", "multiChoice", "scale", "yesNo"]),
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  importance: z.enum(["critical", "recommended", "optional"]).optional(),
  category: z.string().optional(),
});

// Validate and parse with Zod, returns validated data or null on failure
function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  logger.warn(`Zod validation failed for ${context}:`, { issues: result.error.issues });
  return null;
}

// Safe parse with Zod validation - combines JSON parsing with schema validation
function safeZodParse<T>(
  text: string,
  schema: z.ZodSchema<T>,
  fallback: T,
  context: string
): T {
  try {
    const parsed = JSON.parse(cleanJson(text));
    const validated = validateWithZod(schema, parsed, context);
    if (validated !== null) {
      return validated;
    }
    logger.warn(`Using fallback for ${context} due to validation failure`);
    return fallback;
  } catch (e) {
    logger.error(`JSON parse failed for ${context}:`, e);
    return fallback;
  }
}

// --- CACHE SYSTEM ---
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = <T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void => {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  // Cleanup old entries if cache gets too large
  if (cache.size > 100) {
    const now = Date.now();
    cache.forEach((entry, k) => {
      if (now - entry.timestamp > entry.ttl) cache.delete(k);
    });
  }
};

const generateCacheKey = (prefix: string, data: unknown): string => {
  return `${prefix}:${JSON.stringify(data).slice(0, 200)}`;
};

// ============================================
// HJÄLPFUNKTIONER FÖR DYNAMISK PROGRAMSTRUKTUR
// ============================================

/**
 * Beräknar antal faser baserat på patientens mål och funktionsnivå
 */
const calculatePhaseCount = (
  smartGoal?: SMARTGoal,
  baselineScore?: number
): number => {
  const timeframe = smartGoal?.timeframe;

  // Anpassa fasantal efter tidsram
  if (timeframe === '4v') return 2;  // Kort rehabilitering
  if (timeframe === '8v') return 3;  // Standard
  if (timeframe === '12v' || timeframe === '6m') return 4;  // Utökad
  if (timeframe === '12m') return 5;  // Lång återhämtning

  // Justera baserat på funktionsnivå (hög ODI = fler faser behövs)
  if (baselineScore && baselineScore > 60) return 4;

  return 3;  // Default
};

/**
 * Beräknar övningsantal baserat på funktionsnivå och rörelserädsla
 */
const calculateExerciseCount = (
  baselineAssessments?: {
    odi?: BaselineAssessmentScore;
    quickdash?: BaselineAssessmentScore;
    tsk11?: BaselineAssessmentScore;
  }
): { min: number; max: number } => {
  const odi = baselineAssessments?.odi?.percentScore;
  const tsk = baselineAssessments?.tsk11?.score;

  // Hög funktionsnedsättning = färre övningar för att inte överbelasta
  if (odi && odi > 60) return { min: 2, max: 3 };
  if (odi && odi > 40) return { min: 3, max: 4 };

  // Hög rörelserädsla = börja med färre övningar
  if (tsk && tsk > 30) return { min: 2, max: 4 };

  return { min: 4, max: 6 };  // Standard
};

/**
 * Returnerar övningsmix baserad på patientens primära mål
 */
const getExerciseMixForGoal = (primaryGoal?: string): string => {
  switch (primaryGoal) {
    case 'sport':
      return 'Fokusera på: 40% styrka, 30% plyometri/agility, 20% rörlighet, 10% balans. Inkludera sportspecifika rörelser.';
    case 'smärtfri':
      return 'Fokusera på: 40% rörlighet, 30% avslappning/andning, 20% lättare styrka, 10% balans. Undvik tunga belastningar.';
    case 'arbete':
      return 'Fokusera på: 35% funktionell styrka, 35% pausövningar, 20% rörlighet, 10% uthållighet. Inkludera arbetsplatsanpassade övningar.';
    case 'vardaglig':
      return 'Fokusera på: 30% funktionella rörelser (ADL), 30% balans, 25% styrka, 15% rörlighet.';
    case 'styrka':
      return 'Fokusera på: 50% styrkeövningar (progressiv överbelastning), 25% rörlighet, 15% stabilitet, 10% uthållighet.';
    default:
      return 'Balanserad mix: 30% styrka, 25% rörlighet, 25% stabilitet, 20% uthållighet.';
  }
};

/**
 * Genererar smärthistorik-direktiv för AI-prompten
 */
const generatePainHistoryDirective = (painHistory?: PatientPainHistory): string => {
  if (!painHistory) return '';

  const directives: string[] = [];

  // Duration-baserade instruktioner
  if (painHistory.duration === 'kronisk') {
    directives.push('Kronisk smärta (>3 månader): Fokusera på smärthantering, graded exposure, och central sensitisering.');
  } else if (painHistory.duration === 'subakut') {
    directives.push('Subakut smärta (6v-3m): Balansera mellan skydd och progressiv belastning.');
  }

  // Tidigare episoder
  if (painHistory.previousEpisodes && painHistory.previousEpisodes > 2) {
    directives.push(`Återkommande besvär (${painHistory.previousEpisodes} tidigare episoder): Inkludera förebyggande övningar och motorisk kontroll.`);
  }

  // Dagligt mönster
  if (painHistory.dailyPattern === 'morgon') {
    directives.push('Morgonsmärta: Börja med mjuka mobiliseringsövningar och undvik tunga belastningar tidigt på dagen.');
  } else if (painHistory.dailyPattern === 'kväll') {
    directives.push('Kvällssmärta: Fokusera på vila och avslappning mot slutet av dagen. Träning bäst på morgon/förmiddag.');
  }

  // Vad som hjälpt tidigare
  if (painHistory.whatHelps) {
    directives.push(`Tidigare framgångsrik behandling: ${painHistory.whatHelps}. Överväg liknande strategier.`);
  }

  // Vad som förvärrar
  if (painHistory.whatWorsens) {
    directives.push(`UNDVIK aktiviteter som förvärrar: ${painHistory.whatWorsens}.`);
  }

  if (directives.length === 0) return '';

  return `
  SMÄRTHISTORIK OCH ANPASSNINGAR:
  ${directives.map(d => `- ${d}`).join('\n  ')}
  `;
};

/**
 * Genererar baseline-bedömnings-direktiv för AI-prompten
 */
const generateBaselineDirective = (
  baselineAssessments?: {
    odi?: BaselineAssessmentScore;
    quickdash?: BaselineAssessmentScore;
    koos?: BaselineAssessmentScore;
    hoos?: BaselineAssessmentScore;
    tsk11?: BaselineAssessmentScore;
  }
): string => {
  if (!baselineAssessments) return '';

  const assessments: string[] = [];
  const instructions: string[] = [];

  // ODI (ländrygg)
  if (baselineAssessments.odi) {
    const odi = baselineAssessments.odi;
    assessments.push(`ODI (Oswestry): ${odi.percentScore?.toFixed(0)}% - ${odi.interpretation || odi.level}`);

    if (odi.percentScore && odi.percentScore > 60) {
      instructions.push('ODI > 60%: Svår funktionsnedsättning. Börja med max 2-3 övningar/dag, 10 min total tid.');
    } else if (odi.percentScore && odi.percentScore > 40) {
      instructions.push('ODI 40-60%: Måttlig funktionsnedsättning. 3-4 övningar/dag, 15-20 min.');
    }
  }

  // QuickDASH (arm/axel/hand)
  if (baselineAssessments.quickdash) {
    const qd = baselineAssessments.quickdash;
    assessments.push(`QuickDASH: ${qd.percentScore?.toFixed(0)}% - ${qd.interpretation || qd.level}`);
  }

  // KOOS (knä)
  if (baselineAssessments.koos) {
    const koos = baselineAssessments.koos;
    assessments.push(`KOOS-PS: ${koos.percentScore?.toFixed(0)}% - ${koos.interpretation || koos.level}`);
  }

  // HOOS (höft)
  if (baselineAssessments.hoos) {
    const hoos = baselineAssessments.hoos;
    assessments.push(`HOOS-PS: ${hoos.percentScore?.toFixed(0)}% - ${hoos.interpretation || hoos.level}`);
  }

  // TSK-11 (rörelserädsla)
  if (baselineAssessments.tsk11) {
    const tsk = baselineAssessments.tsk11;
    assessments.push(`TSK-11 (Rörelserädsla): ${tsk.score}/44 - ${tsk.interpretation || tsk.level}`);

    if (tsk.score && tsk.score > 30) {
      instructions.push(`
      ⚠️ HÖG RÖRELSERÄDSLA (TSK-11 > 30):
      * Undvik smärttriggande beskrivningar i övningsinstruktioner
      * Inkludera psykoedukation om smärta och rörelsens säkerhet
      * Börja med andnings- och avslappningsövningar
      * Använd graded exposure-principen
      * Fokusera på vad patienten KAN göra, inte vad de inte kan`);
    } else if (tsk.score && tsk.score > 22) {
      instructions.push('Måttlig rörelserädsla: Inkludera lugnande förklaringar och börja med trygga övningar.');
    }
  }

  if (assessments.length === 0) return '';

  return `
  STANDARDISERADE BEDÖMNINGAR (Baseline):
  ${assessments.map(a => `- ${a}`).join('\n  ')}

  ${instructions.length > 0 ? `INSTRUKTIONER BASERAT PÅ BEDÖMNING:
  ${instructions.join('\n  ')}` : ''}
  `;
};

/**
 * Genererar SMART-mål-direktiv för AI-prompten
 */
const generateSmartGoalDirective = (smartGoal?: SMARTGoal): string => {
  if (!smartGoal) return '';

  const exerciseMix = getExerciseMixForGoal(smartGoal.primaryGoal);

  return `
  PATIENTENS REHABILITERINGSMÅL (SMART):
  - Primärt mål: ${smartGoal.primaryGoal || 'Ej angivet'}
  - Specifikt: ${smartGoal.specific || 'Ej angivet'}
  - Mätbart: ${smartGoal.measurable || 'Ej angivet'}
  - Tidsram: ${smartGoal.timeframe || 'Ej angivet'}
  ${smartGoal.motivation ? `- Motivation: ${smartGoal.motivation}` : ''}

  ÖVNINGSMIX ANPASSAD EFTER MÅL:
  ${exerciseMix}

  INSTRUKTIONER:
  ${smartGoal.primaryGoal === 'sport' ? `
  - Inkludera sportspecifika övningar i fas 2-3
  - Fas 3 ska innehålla plyometri och agility-träning
  - Återgångskriterier ska vara tydliga` : ''}
  ${smartGoal.primaryGoal === 'smärtfri' ? `
  - Fokusera på smärtlindring och avslappning
  - Undvik övningar med hög belastning
  - Inkludera dagliga pausprogram för smärthantering` : ''}
  ${smartGoal.primaryGoal === 'arbete' ? `
  - Inkludera arbetsrelaterade rörelsemönster
  - Pausövningar anpassade för arbetsplatsen
  - Ergonomiska tips i patientutbildningen` : ''}
  `;
};

/**
 * Genererar smärtkaraktär-direktiv för AI-prompten
 * Mappar smärttyp till kliniskt lämpliga övningsval
 */
const generatePainCharacterDirective = (painCharacter?: string): string => {
  if (!painCharacter) return '';

  const painGuidelines: Record<string, { description: string; recommendations: string[]; avoid: string[] }> = {
    'molande': {
      description: 'Molande/värkande smärta indikerar ofta inflammatoriskt tillstånd eller artros',
      recommendations: [
        'Lätta rörlighetsövningar med lågt motstånd',
        'Isometriska övningar för styrka utan ledrörelse',
        'Värme före träning kan hjälpa',
        'Långsam, kontrollerad progression'
      ],
      avoid: [
        'Explosiva rörelser',
        'Hög belastning i smärtande led',
        'Övningar som provocerar smärtan direkt'
      ]
    },
    'huggande': {
      description: 'Huggande/skarp smärta kan indikera mekanisk irritation eller instabilitet',
      recommendations: [
        'Stabiliseringsövningar för kärnmuskulatur',
        'Kontrollerade rörelser inom smärtfritt ROM',
        'Motorisk kontroll-träning',
        'Undvik ändlägen tills stabilitet förbättrats'
      ],
      avoid: [
        'Snabba riktningsändringar',
        'Övningar i ändlägen',
        'Tunga vikter utan kontroll'
      ]
    },
    'brannande': {
      description: 'Brännande/elektrisk smärta kan tyda på nervpåverkan (neuropatisk)',
      recommendations: [
        'Nervmobilisering (neurodynamik) med försiktighet',
        'Hållningskorrigering',
        'Andnings- och avslappningsövningar',
        'Graderad exponering för rörelser som provocerar'
      ],
      avoid: [
        'Aggressiv stretching',
        'Positioner som komprimerar nervstrukturer',
        'Långvarigt statiskt tryck'
      ]
    },
    'bultande': {
      description: 'Bultande/pulserande smärta indikerar ofta akut inflammation eller hög kärlaktivitet',
      recommendations: [
        'Vila och isometriska övningar endast',
        'Elevation och kyla efter träning',
        'Mycket lätta rörlighetsövningar',
        'Kort duration per övning'
      ],
      avoid: [
        'Alla övningar som ökar blodflödet kraftigt',
        'Repetitiva belastningar',
        'Värmebehandling'
      ]
    }
  };

  const guidelines = painGuidelines[painCharacter];
  if (!guidelines) return '';

  return `
  SMÄRTKARAKTÄR-ANPASSNING:
  Patientens smärta är ${painCharacter.toUpperCase()}: ${guidelines.description}

  REKOMMENDERADE ÖVNINGSTYPER:
  ${guidelines.recommendations.map(r => `✓ ${r}`).join('\n  ')}

  UNDVIK:
  ${guidelines.avoid.map(a => `✗ ${a}`).join('\n  ')}

  VIKTIGT: Anpassa ALLA övningar efter ovanstående riktlinjer!
  `;
};

/**
 * Genererar rörelserädsla-anpassade instruktioner för övningar
 * TSK-11 > 30 = hög rädsla, kräver speciella anpassningar
 */
const generateFearAvoidanceInstructions = (
  tskScore?: number,
  fearAvoidance?: boolean
): string => {
  const highFear = (tskScore && tskScore > 30) || fearAvoidance;

  if (!highFear) return '';

  return `
  ⚠️ RÖRELSERÄDSLA-ANPASSNING (TSK-11: ${tskScore || 'Ej mätt'}, Självrapporterad rädsla: ${fearAvoidance ? 'Ja' : 'Nej'})

  INSTRUKTIONSFORMAT FÖR VARJE ÖVNING:
  1. BÖRJA med trygghet: "Denna rörelse är säker och kontrollerad"
  2. FÖRKLARA vad de kommer känna: "Du kan känna en mild sträckning, vilket är normalt och nyttigt"
  3. GE kontroll: "Du bestämmer takten - börja med bara 3 repetitioner"
  4. NORMALISERA: "Det är vanligt att känna viss osäkerhet - det går över med övning"

  SPRÅKANPASSNINGAR:
  - ANVÄND: "aktivera", "engagera", "kontrollera"
  - UNDVIK: "stretcha hårt", "pressa", "forcera", "tåla smärta"

  PROGRESSIONSPRINCIP:
  - Börja med 50% av normal volym
  - Öka endast när patienten känner sig trygg
  - Fira små framsteg: "Bra jobbat! Du klarade X reps utan problem"

  INKLUDERA I VARJE FAS:
  - 1-2 andnings-/avslappningsövningar
  - Psykoedukation om smärta (smärta ≠ skada)
  - Graded exposure-princip
  `;
};

/**
 * Smart progressions-motor
 * Genererar intelligenta progressionsregler baserat på patientens samlade profil
 */
interface ProgressionRule {
  criterion: string;
  threshold: string;
  action: string;
  rationale: string;
}

interface ProgressionDirective {
  readinessFactors: string[];
  progressionRules: ProgressionRule[];
  regressionTriggers: string[];
  volumeProgression: string;
  intensityProgression: string;
}

const generateSmartProgressionDirective = (
  assessment: UserAssessment
): string => {
  const progressionDirective: ProgressionDirective = {
    readinessFactors: [],
    progressionRules: [],
    regressionTriggers: [],
    volumeProgression: '',
    intensityProgression: ''
  };

  // Analysera beredskap baserat på patientdata
  const painLevel = assessment.painLevel || 5;
  const activityPain = assessment.activityPainLevel || 5;
  const tskScore = assessment.baselineAssessments?.tsk11?.score;
  const hasFearAvoidance = tskScore && tskScore > 30;
  const hasRecurrentPain = assessment.painHistory?.previousEpisodes && assessment.painHistory.previousEpisodes > 2;
  const isChronicPain = assessment.painHistory?.duration === 'kronisk' ||
                        assessment.painHistory?.duration === 'subakut';
  const sleepQuality = assessment.lifestyle?.sleep;
  const stressLevel = assessment.lifestyle?.stress;

  // Bestäm progressionshastighet
  let progressionSpeed: 'slow' | 'moderate' | 'fast' = 'moderate';

  if (hasFearAvoidance || painLevel > 7 || isChronicPain) {
    progressionSpeed = 'slow';
  } else if (painLevel < 4 && activityPain < 4 && !hasRecurrentPain) {
    progressionSpeed = 'fast';
  }

  // Generera beredskaps-faktorer
  progressionDirective.readinessFactors = [
    `Smärtnivå i vila: ${painLevel}/10 - ${painLevel > 6 ? 'Kräver försiktig start' : painLevel > 3 ? 'Moderat start möjlig' : 'Aktiv start möjlig'}`,
    `Smärta vid aktivitet: ${activityPain}/10 - ${activityPain > 6 ? 'Begränsa belastning initialt' : 'Gradvis belastningsökning tillåten'}`,
  ];

  if (tskScore) {
    progressionDirective.readinessFactors.push(
      `Rörelserädsla (TSK-11): ${tskScore}/44 - ${tskScore > 30 ? 'HÖG: Prioritera trygghet' : tskScore > 20 ? 'MÅTTLIG: Fokus på graderad exponering' : 'LÅG: Standard progression'}`
    );
  }

  if (sleepQuality) {
    progressionDirective.readinessFactors.push(
      `Sömnkvalitet: ${sleepQuality} - ${sleepQuality === 'Dålig' ? 'Kan påverka återhämtning negativt' : sleepQuality === 'Okej' ? 'Anpassa träningsvolym efter sömnkvalitet' : 'Underlättar progression'}`
    );
  }

  // Generera progressionsregler baserat på patientprofil
  const rules: ProgressionRule[] = [];

  // Smärtbaserad progression
  rules.push({
    criterion: 'Smärtrespons',
    threshold: `Smärta ≤ ${Math.min(painLevel + 1, 4)}/10 under och efter träning`,
    action: progressionSpeed === 'slow'
      ? 'Öka volym med 10% per vecka'
      : progressionSpeed === 'fast'
        ? 'Öka volym med 20-25% per vecka'
        : 'Öka volym med 15% per vecka',
    rationale: 'Smärtrespons styr belastningsökning för säker progression'
  });

  // Funktionsbaserad progression
  const baselineScore = assessment.baselineAssessments?.odi?.percentScore ||
                        assessment.baselineAssessments?.quickdash?.percentScore ||
                        assessment.baselineAssessments?.koos?.percentScore ||
                        assessment.baselineAssessments?.hoos?.percentScore;

  if (baselineScore) {
    rules.push({
      criterion: 'Funktionell förbättring',
      threshold: `Minst 10% förbättring på ${assessment.baselineAssessments?.odi ? 'ODI' : assessment.baselineAssessments?.quickdash ? 'QuickDASH' : 'funktionsskala'}`,
      action: 'Gå vidare till nästa fas när kriterium uppnått',
      rationale: 'MCID (Minimal Clinically Important Difference) för funktionsskalor är 10-15%'
    });
  }

  // SMART-mål progression
  if (assessment.smartGoal?.specific) {
    rules.push({
      criterion: 'Måluppfyllelse',
      threshold: `Delsteg mot: "${assessment.smartGoal.specific.substring(0, 50)}..."`,
      action: 'Justera övningsval för att matcha funktionsmål',
      rationale: 'Målbaserad träning ökar motivation och adherence'
    });
  }

  // Rörelserädsla-specifik progression
  if (hasFearAvoidance) {
    rules.push({
      criterion: 'Trygghetskänsla',
      threshold: 'Patienten uttrycker ökad tillit till rörelse',
      action: 'Introducera gradvis mer utmanande rörelser',
      rationale: 'Fear-avoidance kräver psykologisk beredskap utöver fysisk kapacitet'
    });
  }

  progressionDirective.progressionRules = rules;

  // Regressions-triggers
  progressionDirective.regressionTriggers = [
    `Smärta > ${Math.min(painLevel + 2, 7)}/10 som kvarstår >24h efter träning`,
    'Nattlig smärta som stör sömnen',
    'Ökad svullnad eller stelhet dagen efter',
    'Patienten undviker övningar på grund av oro'
  ];

  // Volym- och intensitetsprogression
  if (progressionSpeed === 'slow') {
    progressionDirective.volumeProgression = `
      FAS 1 (v1-3): 2 set × 8 reps, 60% ansträngning
      FAS 2 (v4-6): 2-3 set × 10 reps, 70% ansträngning
      FAS 3 (v7+): 3 set × 12 reps, 80% ansträngning`;
    progressionDirective.intensityProgression = `
      Veckovis ökning: Max 10%
      Pausera vid smärta > ${Math.min(painLevel + 1, 5)}/10`;
  } else if (progressionSpeed === 'fast') {
    progressionDirective.volumeProgression = `
      FAS 1 (v1-2): 3 set × 10 reps, 70% ansträngning
      FAS 2 (v3-4): 3-4 set × 12 reps, 80% ansträngning
      FAS 3 (v5+): 4 set × 15 reps, 85% ansträngning`;
    progressionDirective.intensityProgression = `
      Veckovis ökning: 15-25%
      Anpassa efter funktion`;
  } else {
    progressionDirective.volumeProgression = `
      FAS 1 (v1-2): 2 set × 10 reps, 65% ansträngning
      FAS 2 (v3-4): 3 set × 12 reps, 75% ansträngning
      FAS 3 (v5+): 3-4 set × 12-15 reps, 80% ansträngning`;
    progressionDirective.intensityProgression = `
      Veckovis ökning: 10-15%
      Smärtgräns: < ${Math.min(painLevel + 1, 5)}/10`;
  }

  // Formatera till prompt-sträng
  return `
=== SMART PROGRESSIONS-MOTOR ===

PATIENTENS BEREDSKAPS-PROFIL:
${progressionDirective.readinessFactors.map(f => `• ${f}`).join('\n')}

BERÄKNAD PROGRESSIONSHASTIGHET: ${progressionSpeed === 'slow' ? 'LÅNGSAM (försiktig)' : progressionSpeed === 'fast' ? 'SNABB (aggressiv)' : 'MODERAT (standard)'}

PROGRESSIONSREGLER:
${progressionDirective.progressionRules.map(r => `
► ${r.criterion}:
  Kriterium: ${r.threshold}
  Åtgärd: ${r.action}
  Evidens: ${r.rationale}
`).join('')}

REGRESSIONSVARNINGAR (gå tillbaka ett steg om):
${progressionDirective.regressionTriggers.map(t => `⚠ ${t}`).join('\n')}

VOLYMPROGRESSION:
${progressionDirective.volumeProgression}

INTENSITETSPROGRESSION:
${progressionDirective.intensityProgression}

ANVÄND DESSA REGLER FÖR ATT:
1. Sätta realistisk fas-duration i programmet
2. Definiera tydliga progressionskriterier per fas
3. Inkludera "red flags" för regression i varje fas
4. Anpassa övningsvolym och intensitet per fas
`;
};

/**
 * Övnings-feedback loop
 * Analyserar historisk övningsdata för att anpassa framtida program
 */
interface ExerciseFeedbackSummary {
  exerciseName: string;
  totalAttempts: number;
  completionRate: number;
  averageDifficulty: 'för_lätt' | 'lagom' | 'för_svår';
  averagePainDuring: number;
  averagePainAfter: number;
  recommendation: 'keep' | 'modify_easier' | 'modify_harder' | 'replace';
}

interface FeedbackLoopAnalysis {
  overallAdherence: number;
  painTrend: 'improving' | 'stable' | 'worsening';
  problemExercises: ExerciseFeedbackSummary[];
  successfulExercises: ExerciseFeedbackSummary[];
  volumeAdjustment: 'increase' | 'maintain' | 'decrease';
  directive: string;
}

export const analyzeExerciseFeedback = (
  exerciseLogs: ExerciseLog[],
  painLogs?: DailyPainLog[]
): FeedbackLoopAnalysis => {
  if (!exerciseLogs || exerciseLogs.length === 0) {
    return {
      overallAdherence: 100,
      painTrend: 'stable',
      problemExercises: [],
      successfulExercises: [],
      volumeAdjustment: 'maintain',
      directive: ''
    };
  }

  // Gruppera övningar efter namn
  const exerciseGroups = new Map<string, ExerciseLog[]>();
  exerciseLogs.forEach(log => {
    const existing = exerciseGroups.get(log.exerciseName) || [];
    existing.push(log);
    exerciseGroups.set(log.exerciseName, existing);
  });

  // Analysera varje övning
  const exerciseSummaries: ExerciseFeedbackSummary[] = [];

  exerciseGroups.forEach((logs, exerciseName) => {
    const completedLogs = logs.filter(l => l.completed);
    const completionRate = (completedLogs.length / logs.length) * 100;

    // Beräkna genomsnittlig svårighetsgrad
    const difficulties = completedLogs
      .map(l => l.difficulty)
      .filter(d => d !== undefined);
    const difficultyScore = difficulties.reduce((sum, d) => {
      return sum + (d === 'för_lätt' ? 1 : d === 'lagom' ? 2 : 3);
    }, 0) / (difficulties.length || 1);
    const avgDifficulty = difficultyScore < 1.5 ? 'för_lätt' :
                          difficultyScore > 2.5 ? 'för_svår' : 'lagom';

    // Beräkna genomsnittlig smärta
    const painDuring = completedLogs
      .map(l => l.painDuring)
      .filter((p): p is number => p !== undefined);
    const avgPainDuring = painDuring.length > 0
      ? painDuring.reduce((a, b) => a + b, 0) / painDuring.length
      : 0;

    const painAfter = completedLogs
      .map(l => l.painAfter)
      .filter((p): p is number => p !== undefined);
    const avgPainAfter = painAfter.length > 0
      ? painAfter.reduce((a, b) => a + b, 0) / painAfter.length
      : 0;

    // Bestäm rekommendation
    let recommendation: 'keep' | 'modify_easier' | 'modify_harder' | 'replace' = 'keep';

    if (completionRate < 50 || avgPainDuring > 6 || avgPainAfter > 5) {
      recommendation = 'replace';
    } else if (avgDifficulty === 'för_svår' || avgPainDuring > 4) {
      recommendation = 'modify_easier';
    } else if (avgDifficulty === 'för_lätt' && avgPainDuring < 2 && completionRate > 90) {
      recommendation = 'modify_harder';
    }

    exerciseSummaries.push({
      exerciseName,
      totalAttempts: logs.length,
      completionRate,
      averageDifficulty: avgDifficulty,
      averagePainDuring: avgPainDuring,
      averagePainAfter: avgPainAfter,
      recommendation
    });
  });

  // Separera problem- och framgångsrika övningar
  const problemExercises = exerciseSummaries.filter(
    s => s.recommendation === 'replace' || s.recommendation === 'modify_easier'
  );
  const successfulExercises = exerciseSummaries.filter(
    s => s.recommendation === 'keep' || s.recommendation === 'modify_harder'
  );

  // Beräkna övergripande adherence
  const totalAttempts = exerciseLogs.length;
  const completedExercises = exerciseLogs.filter(l => l.completed).length;
  const overallAdherence = totalAttempts > 0
    ? Math.round((completedExercises / totalAttempts) * 100)
    : 100;

  // Analysera smärttrend om painLogs finns
  let painTrend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (painLogs && painLogs.length >= 3) {
    const recentLogs = painLogs.slice(-7);
    const firstHalf = recentLogs.slice(0, Math.floor(recentLogs.length / 2));
    const secondHalf = recentLogs.slice(Math.floor(recentLogs.length / 2));

    const avgFirst = firstHalf
      .filter(l => l.postWorkout?.painLevel !== undefined)
      .reduce((sum, l) => sum + (l.postWorkout?.painLevel || 0), 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf
      .filter(l => l.postWorkout?.painLevel !== undefined)
      .reduce((sum, l) => sum + (l.postWorkout?.painLevel || 0), 0) / (secondHalf.length || 1);

    if (avgSecond < avgFirst - 1) painTrend = 'improving';
    else if (avgSecond > avgFirst + 1) painTrend = 'worsening';
  }

  // Bestäm volymjustering
  let volumeAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';
  if (overallAdherence > 85 && painTrend !== 'worsening' && problemExercises.length < 2) {
    volumeAdjustment = 'increase';
  } else if (overallAdherence < 60 || painTrend === 'worsening' || problemExercises.length > 3) {
    volumeAdjustment = 'decrease';
  }

  // Generera direktiv-sträng
  let directive = '';
  if (problemExercises.length > 0 || volumeAdjustment !== 'maintain') {
    directive = `
=== ÖVNINGS-FEEDBACK ANALYS ===

ÖVERGRIPANDE PRESTANDA:
• Adherence: ${overallAdherence}%
• Smärttrend: ${painTrend === 'improving' ? 'FÖRBÄTTRAS ✓' : painTrend === 'worsening' ? 'FÖRSÄMRAS ⚠' : 'STABIL'}
• Volymrekommendation: ${volumeAdjustment === 'increase' ? 'ÖKNING MÖJLIG' : volumeAdjustment === 'decrease' ? 'MINSKNING REKOMMENDERAS' : 'BIBEHÅLL'}

${problemExercises.length > 0 ? `
PROBLEMÖVNINGAR ATT UNDVIKA/MODIFIERA:
${problemExercises.map(e => `• ${e.exerciseName}: ${e.recommendation === 'replace' ? 'ERSÄTT' : 'GÖR LÄTTARE'} (smärta: ${e.averagePainDuring.toFixed(1)}/10, fullföljd: ${e.completionRate.toFixed(0)}%)`).join('\n')}
` : ''}

${successfulExercises.filter(e => e.recommendation === 'modify_harder').length > 0 ? `
ÖVNINGAR REDO FÖR PROGRESSION:
${successfulExercises.filter(e => e.recommendation === 'modify_harder').map(e => `• ${e.exerciseName}: Redo för svårare variant (upplevd som för lätt)`).join('\n')}
` : ''}

ANPASSNINGAR FÖR DETTA PROGRAM:
${problemExercises.length > 0 ? '• Undvik eller förenkla övningar som orsakat problem' : ''}
${volumeAdjustment === 'decrease' ? '• Minska antal övningar per session med 20-30%' : ''}
${volumeAdjustment === 'increase' ? '• Patienten klarar ökat volym - lägg till 1-2 övningar' : ''}
${painTrend === 'worsening' ? '• VARNING: Smärtan ökar - prioritera smärtlindring' : ''}
`;
  }

  return {
    overallAdherence,
    painTrend,
    problemExercises,
    successfulExercises,
    volumeAdjustment,
    directive
  };
};

/**
 * Generera feedback-direktiv för AI-prompten baserat på historisk data
 */
export const generateFeedbackDirective = (
  exerciseLogs?: ExerciseLog[],
  painLogs?: DailyPainLog[]
): string => {
  if (!exerciseLogs || exerciseLogs.length < 3) {
    return ''; // Inte tillräckligt med data för analys
  }

  const analysis = analyzeExerciseFeedback(exerciseLogs, painLogs);
  return analysis.directive;
};

/**
 * Intelligent övningsmatchning
 * Genererar detaljerade kriterier för övningsval baserat på patientens profil
 */
interface ExerciseMatchCriteria {
  mustInclude: string[];        // Övningstyper som MÅSTE inkluderas
  shouldInclude: string[];      // Övningstyper som BÖR inkluderas
  avoid: string[];              // Övningstyper att UNDVIKA
  priorityOrder: string[];      // Prioritetsordning för kategorier
  difficultyRange: {
    min: 'Lätt' | 'Medel' | 'Svår';
    max: 'Lätt' | 'Medel' | 'Svår';
  };
  equipmentPreference: string[];
  rationale: string[];
}

export const generateExerciseMatchingCriteria = (
  assessment: UserAssessment
): ExerciseMatchCriteria => {
  const criteria: ExerciseMatchCriteria = {
    mustInclude: [],
    shouldInclude: [],
    avoid: [],
    priorityOrder: [],
    difficultyRange: { min: 'Lätt', max: 'Svår' },
    equipmentPreference: ['ingen', 'matta'],
    rationale: []
  };

  const painLevel = assessment.painLevel || 5;
  const activityPain = assessment.activityPainLevel || 5;
  const tskScore = assessment.baselineAssessments?.tsk11?.score;
  const hasFearAvoidance = (tskScore && tskScore > 30) || assessment.lifestyle?.fearAvoidance;
  const painCharacter = assessment.painCharacter;
  const injuryLocation = assessment.injuryLocation;
  const injuryType = assessment.injuryType;
  const hasRecurrentPain = assessment.painHistory?.previousEpisodes &&
                           assessment.painHistory.previousEpisodes > 2;

  // === SVÅRIGHETSGRAD ===
  if (painLevel > 7 || hasFearAvoidance) {
    criteria.difficultyRange = { min: 'Lätt', max: 'Lätt' };
    criteria.rationale.push('Endast lätta övningar pga hög smärta/rörelserädsla');
  } else if (painLevel > 4 || activityPain > 5) {
    criteria.difficultyRange = { min: 'Lätt', max: 'Medel' };
    criteria.rationale.push('Lätt-medel svårighet pga måttlig smärta');
  } else {
    criteria.difficultyRange = { min: 'Lätt', max: 'Svår' };
    criteria.rationale.push('Full svårighetsramp tillåten');
  }

  // === SMÄRTKARAKTÄR → ÖVNINGSTYP ===
  switch (painCharacter) {
    case 'molande':
      criteria.mustInclude.push('rörlighet', 'isometrisk');
      criteria.shouldInclude.push('lätt styrka', 'andning');
      criteria.avoid.push('explosiva rörelser', 'hög belastning');
      criteria.rationale.push('Molande smärta: fokus på rörlighet och isometrisk träning');
      break;
    case 'huggande':
      criteria.mustInclude.push('stabilitet', 'kontrollerade rörelser');
      criteria.shouldInclude.push('motorisk kontroll', 'andning');
      criteria.avoid.push('snabba rörelser', 'rotationer', 'tunga lyft');
      criteria.rationale.push('Huggande smärta: undvik provocerande rörelser, fokus på stabilitet');
      break;
    case 'brännande':
      criteria.mustInclude.push('nervmobilisering', 'lätt rörlighet');
      criteria.shouldInclude.push('andning', 'avslappning');
      criteria.avoid.push('statisk stretch', 'kompression');
      criteria.rationale.push('Brännande (neuropatisk) smärta: nervmobilisering prioriteras');
      break;
    case 'bultande':
      criteria.mustInclude.push('lågintensiv rörelse', 'andning');
      criteria.avoid.push('huvudnedåt', 'statiska positioner', 'hög ansträngning');
      criteria.rationale.push('Bultande smärta: undvik ökad blodtryck/inflammation');
      break;
    default:
      criteria.shouldInclude.push('balanserad mix');
  }

  // === KROPPSOMRÅDE → SPECIFIK MATCHNING ===
  switch (injuryLocation) {
    case 'ländrygg':
    case 'rygg':
      criteria.mustInclude.push('core-stabilitet', 'höft-mobilitet');
      criteria.shouldInclude.push('gluteus-aktivering', 'andning');
      if (hasRecurrentPain) {
        criteria.mustInclude.push('motorisk kontroll');
        criteria.rationale.push('Återkommande ryggsmärta: motorisk kontroll kritisk');
      }
      criteria.avoid.push('djupa framåtböjningar utan kontroll');
      criteria.priorityOrder = ['stabilitet', 'rörlighet', 'styrka', 'uthållighet'];
      break;

    case 'axel':
      criteria.mustInclude.push('rotatorkuff-aktivering', 'scapula-stabilitet');
      criteria.shouldInclude.push('thorakal rörlighet', 'hållning');
      criteria.avoid.push('overhead-press vid akut', 'bakom-nacken rörelser');
      criteria.priorityOrder = ['stabilitet', 'rörlighet', 'styrka'];
      break;

    case 'knä':
      criteria.mustInclude.push('quadriceps-styrka', 'höft-stabilitet');
      criteria.shouldInclude.push('balans', 'proprioception');
      if (injuryType === InjuryType.POST_OP) {
        criteria.mustInclude.push('ROM-övningar');
        criteria.rationale.push('Post-op knä: prioritera ROM och quad-aktivering');
      }
      criteria.priorityOrder = ['styrka', 'stabilitet', 'balans', 'rörlighet'];
      break;

    case 'nacke':
      criteria.mustInclude.push('djupa nackflexorer', 'hållning');
      criteria.shouldInclude.push('thorakal extension', 'scapula-kontroll');
      criteria.avoid.push('kraftig rotation', 'hyperextension');
      criteria.priorityOrder = ['stabilitet', 'hållning', 'rörlighet'];
      break;

    case 'höft':
      criteria.mustInclude.push('höft-mobilitet', 'gluteus-styrka');
      criteria.shouldInclude.push('core-stabilitet', 'balans');
      criteria.priorityOrder = ['rörlighet', 'styrka', 'stabilitet'];
      break;

    default:
      criteria.priorityOrder = ['rörlighet', 'styrka', 'stabilitet', 'uthållighet'];
  }

  // === RÖRELSERÄDSLA MODIFIERINGAR ===
  if (hasFearAvoidance) {
    criteria.mustInclude.push('andnings-övningar', 'grounded positioner');
    criteria.shouldInclude.push('isometrisk träning', 'bekanta rörelser');
    criteria.avoid.push('snabba rörelser', 'nya komplexa övningar');
    criteria.equipmentPreference = ['ingen', 'matta', 'vägg'];
    criteria.rationale.push('Hög rörelserädsla: prioritera trygghet och graderad exponering');
  }

  // === SKADETYP MODIFIERINGAR ===
  if (injuryType === InjuryType.POST_OP) {
    criteria.mustInclude.push('aktiv ROM', 'cirkulationsfrämjande');
    criteria.avoid.push('tung belastning tidigt', 'impactövningar');
    criteria.rationale.push('Post-operativ: följ protokoll, undvik belastning');
  } else if (injuryType === InjuryType.ACUTE) {
    criteria.mustInclude.push('skonsamma rörelser', 'smärtfria ROM');
    criteria.avoid.push('provokationstest', 'max-belastning');
    criteria.rationale.push('Akut skada: skydda vävnad, upprätthåll rörelse');
  } else if (injuryType === InjuryType.CHRONIC) {
    criteria.mustInclude.push('graderad belastning', 'funktionell träning');
    criteria.shouldInclude.push('smärtneuroedukation', 'pacing');
    criteria.rationale.push('Kronisk: graderad exponering, normalisera rörelse');
  }

  // === LIVSSTILSFAKTORER ===
  if (assessment.lifestyle?.sleep === 'Dålig') {
    criteria.shouldInclude.push('avslappning', 'mild rörlighet');
    criteria.rationale.push('Dålig sömn: inkludera återhämtningsfrämjande övningar');
  }

  if (assessment.lifestyle?.stress === 'Hög') {
    criteria.mustInclude.push('andningsövningar');
    criteria.shouldInclude.push('mindful movement');
    criteria.rationale.push('Hög stress: inkludera stressreducerande element');
  }

  if (assessment.lifestyle?.workload === 'Stillasittande') {
    criteria.shouldInclude.push('hållningskorrigering', 'pauser/rörelsebrytare');
    criteria.rationale.push('Stillasittande: motverka statisk belastning');
  }

  return criteria;
};

/**
 * Generera övningsmatchnings-direktiv för AI-prompten
 */
export const generateExerciseMatchingDirective = (
  assessment: UserAssessment
): string => {
  const criteria = generateExerciseMatchingCriteria(assessment);

  return `
=== INTELLIGENT ÖVNINGSMATCHNING ===

OBLIGATORISKA ÖVNINGSTYPER (måste inkluderas i varje fas):
${criteria.mustInclude.length > 0 ? criteria.mustInclude.map(t => `✓ ${t}`).join('\n') : '• Inga specifika krav'}

REKOMMENDERADE ÖVNINGSTYPER:
${criteria.shouldInclude.length > 0 ? criteria.shouldInclude.map(t => `○ ${t}`).join('\n') : '• Standardmix'}

ÖVNINGSTYPER ATT UNDVIKA:
${criteria.avoid.length > 0 ? criteria.avoid.map(t => `✗ ${t}`).join('\n') : '• Inga specifika begränsningar'}

SVÅRIGHETSSPANN: ${criteria.difficultyRange.min} → ${criteria.difficultyRange.max}

PRIORITETSORDNING FÖR KATEGORIER:
${criteria.priorityOrder.length > 0 ? criteria.priorityOrder.map((p, i) => `${i + 1}. ${p}`).join('\n') : '1. Rörlighet\n2. Styrka\n3. Stabilitet'}

UTRUSTNINGSPREFERENS: ${criteria.equipmentPreference.join(', ')}

MATCHNINGSLOGIK:
${criteria.rationale.map(r => `• ${r}`).join('\n')}

APPLICERA DESSA KRITERIER NÄR DU VÄLJER ÖVNINGAR:
- Varje fas ska innehålla övningar från "OBLIGATORISKA" listan
- Prioritera övningar enligt prioritetsordningen
- Respektera svårighetsspannet strikt
- Undvik ALLTID övningar i "UNDVIK"-listan
`;
};

// --- RETRY LOGIC ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isRateLimit = (error as any)?.status === 429;
      const isServerError = (error as any)?.status >= 500;

      if (!isRateLimit && !isServerError && attempt < maxRetries - 1) {
        // Don't retry on client errors (except rate limits)
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        logger.warn(`AI request failed, retrying in ${Math.round(delay)}ms...`, { attempt: attempt + 1, maxRetries });
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

// --- ROBUST JSON SANITIZER ---
const cleanJson = (text: string): string => {
  let cleaned = text;

  // 1. Remove markdown code blocks (```json ... ```)
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // 2. Try to extract JSON from mixed content
  // Look for JSON object or array pattern
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }

  // 3. Remove trailing commas before closing brackets (common AI error)
  cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');

  // 4. Remove any control characters except newlines and tabs
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  return cleaned.trim();
};

// Safe JSON parse with multiple fallback strategies
const safeJSONParse = <T>(text: string, fallback: T): T => {
  try {
    // First attempt: direct parse after cleaning
    return JSON.parse(cleanJson(text)) as T;
  } catch (firstError) {
    logger.warn('First JSON parse failed, trying alternative strategies...');

    try {
      // Second attempt: Try to fix common issues
      let fixed = cleanJson(text);

      // Fix unquoted keys
      fixed = fixed.replace(/(['"])?([a-zA-Z_][a-zA-Z0-9_]*)\1\s*:/g, '"$2":');

      // Fix single quotes to double quotes (but not in strings)
      fixed = fixed.replace(/:\s*'([^']*)'/g, ': "$1"');

      return JSON.parse(fixed) as T;
    } catch (secondError) {
      logger.error('All JSON parse strategies failed', { firstError, secondError });
      return fallback;
    }
  }
};

// Helper function to generate content using AI proxy
const generateContent = async (prompt: string, temperature: number = 0.3): Promise<string> => {
  return await aiCompletion({
    messages: [
      {
        role: "system",
        content: "Du är en expert-fysioterapeut som alltid svarar på svenska. Returnera alltid valid JSON när det efterfrågas."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: MODEL,
    temperature,
    max_tokens: 8000,
  });
};

export const generateRehabProgram = async (assessment: UserAssessment): Promise<GeneratedProgram> => {
  const clinicalDetails = Object.entries(assessment.specificAnswers || {})
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n    ');

  let intensityDirective = "Standard progression.";
  if (assessment.lifestyle?.stress === 'Hög' || assessment.lifestyle?.sleep === 'Dålig') {
    intensityDirective = "Minska volymen och intensiteten. Fokusera på återhämtning och nervsystemets lugnande.";
  }
  if (assessment.lifestyle?.fearAvoidance) {
    intensityDirective += " VIKTIGT: Patienten har rörelserädsla. Börja extremt lätt.";
  }

  let painDirective = "";
  if (assessment.activityPainLevel > 6) {
    painDirective = "Hög smärta vid aktivitet. Fokusera på isometrisk träning och smärtfri rörelse.";
  } else if (assessment.painLevel > 5 && assessment.activityPainLevel < 4) {
    painDirective = "Hög vilosmärta men låg aktivitetssmärta. Uppmuntra rörelse.";
  }

  let safetyDirective = "";
  if (assessment.redFlags && assessment.redFlags.length > 0) {
    safetyDirective = `VARNING: Röda flaggor: ${assessment.redFlags.join(', ')}. Generera försiktigt program.`;
  }

  // ============================================
  // NYA INDIVIDANPASSADE DIREKTIV
  // ============================================

  // Generera direktiv baserat på smärthistorik
  const painHistoryDirective = generatePainHistoryDirective(assessment.painHistory);

  // Generera direktiv baserat på standardiserade bedömningar
  const baselineDirective = generateBaselineDirective(assessment.baselineAssessments);

  // Generera direktiv baserat på SMART-mål
  const smartGoalDirective = generateSmartGoalDirective(assessment.smartGoal);

  // NYA: Generera direktiv baserat på smärtkaraktär
  const painCharacterDirective = generatePainCharacterDirective(assessment.painCharacter);

  /// NYA: Generera rörelserädsla-anpassade instruktioner
  const tskScore = assessment.baselineAssessments?.tsk11?.score;
  const fearAvoidanceDirective = generateFearAvoidanceInstructions(
    tskScore,
    assessment.lifestyle?.fearAvoidance
  );

  /// NYA: Generera smart progressions-direktiv
  const progressionDirective = generateSmartProgressionDirective(assessment);

  // NYA: Generera intelligent övningsmatchning
  const exerciseMatchingDirective = generateExerciseMatchingDirective(assessment);

  // Beräkna dynamisk programstruktur
  const baselineScore = assessment.baselineAssessments?.odi?.percentScore ||
                        assessment.baselineAssessments?.quickdash?.percentScore;
  const phaseCount = calculatePhaseCount(assessment.smartGoal, baselineScore);
  const exerciseCount = calculateExerciseCount(assessment.baselineAssessments);

  logger.info('Generated individualized directives', {
    hasPainHistory: !!assessment.painHistory,
    hasBaseline: !!assessment.baselineAssessments,
    hasSmartGoal: !!assessment.smartGoal,
    hasPainCharacter: !!assessment.painCharacter,
    hasFearAvoidance: !!tskScore || assessment.lifestyle?.fearAvoidance,
    hasProgressionDirective: !!progressionDirective,
    hasExerciseMatching: !!exerciseMatchingDirective,
    phaseCount,
    exerciseCount
  });

  // ============================================
  // KRITISK: POSTOPERATIVA RESTRIKTIONER
  // ============================================
  let postOpDirective = "";
  let daysSinceSurgery: number | null = null;

  // ============================================
  // EVIDENSBASERADE RIKTLINJER
  // ============================================
  const bodyAreaMapping: Record<string, string> = {
    'axel': 'axel',
    'nacke': 'nacke',
    'rygg': 'övre_rygg',
    'ländrygg': 'ländrygg',
    'knä': 'knä',
    'höft': 'höft',
    'fotled': 'fotled',
    'handled': 'handled',
    'armbåge': 'armbåge'
  };

  const normalizedLocation = assessment.injuryLocation.toLowerCase();
  const bodyArea = bodyAreaMapping[normalizedLocation] || 'hel_kropp';

  // Hämta evidensbaserade källor för detta område - SVENSKA KÄLLOR PRIORITERAS
  const svenskaKallor = getSvenskaKallorByBodyArea(bodyArea as BodyArea);
  const internationellaKallor = getSourcesByBodyArea(bodyArea as BodyArea)
    .filter(s => s.evidenceLevel === 'A' || s.evidenceLevel === 'B')
    .slice(0, 3);

  // Kombinera: svenska först, sedan internationella
  const relevantSources = [...svenskaKallor.slice(0, 4), ...internationellaKallor];

  // Kolla om vi har Axelina-protokoll för axelskador
  const axelinaProtocol = bodyArea === 'axel'
    ? getAxelinaProtocol(assessment.surgicalDetails?.procedure || assessment.injuryLocation)
    : null;

  // Kolla om vi har svenska regionprotokoll för andra områden
  const svenskaProtokoll = getSvensktProtokollByBodyArea(bodyArea as BodyArea);
  const svensktProtokoll = svenskaProtokoll.length > 0 ? svenskaProtokoll[0] : null;

  // Bygg evidens-direktiv med svenska källor först
  let evidenceDirective = '';

  // Svenska riktlinjer sektion
  if (svenskaKallor.length > 0) {
    evidenceDirective += `
  🇸🇪 SVENSKA RIKTLINJER FÖR ${assessment.injuryLocation.toUpperCase()}:
  ${svenskaKallor.slice(0, 4).map(s =>
    `- ${s.authors?.[0] || 'Okänd'} et al. (${s.year}): "${s.title}"
     Källa: ${s.journal} | Nyckelord: ${s.keywords?.slice(0, 3).join(', ') || 'Ej angivna'}`
  ).join('\n  ')}

  ⚠️ PRIORITERA SVENSKA RIKTLINJER när de finns tillgängliga!
  `;
  }

  // Axelina-protokoll för axelskador
  if (axelinaProtocol) {
    evidenceDirective += `
  🏥 AXELINA-PROTOKOLL (Används i 20 svenska regioner):
  Protokoll: ${axelinaProtocol.name}
  Nivå: ${axelinaProtocol.axelinaLevel} | Hemövningar/dag: ${axelinaProtocol.homeExercisesPerDay}

  FASER:
  ${Object.entries(axelinaProtocol.phases).map(([phase, phaseData]) => {
    const data = phaseData as { weeks: string; goals: string[] };
    return `Fas ${phase} (${data.weeks}): ${data.goals.slice(0, 2).join(', ')}`;
  }).join('\n  ')}

  ⚠️ FÖLJ AXELINA-PROTOKOLLET för denna diagnos!
  `;
  }

  // Svenska regionprotokoll för andra områden
  if (svensktProtokoll && !axelinaProtocol) {
    evidenceDirective += `
  🏥 SVENSKT REGIONPROTOKOLL:
  Protokoll: ${svensktProtokoll.name}
  Källa: ${(svensktProtokoll as any).source || 'Region Sverige'}

  FASER:
  ${Object.entries(svensktProtokoll.phases).map(([phase, phaseData]) => {
    const data = phaseData as { weeks: string; goals: string[] };
    return `Fas ${phase} (${data.weeks}): ${data.goals.slice(0, 2).join(', ')}`;
  }).join('\n  ')}
  `;
  }

  // Internationella källor som komplement
  if (internationellaKallor.length > 0) {
    evidenceDirective += `
  📚 INTERNATIONELL EVIDENS (kompletterande):
  ${internationellaKallor.map(s =>
    `- ${s.authors?.[0] || 'Okänd'} et al. (${s.year}): "${s.title}" [Level ${s.evidenceLevel}]`
  ).join('\n  ')}
  `;
  }

  // PREVENTION: Kontrollera om det finns skadeförebyggande program för patientens sport
  const activityDescription = assessment.activityLevel || assessment.goals || '';
  const preventionProtocol = getPreventionProtocolBySport(activityDescription);
  if (preventionProtocol) {
    evidenceDirective += `
  ${generatePreventionPrompt(preventionProtocol)}
  `;
  }

  // PATIENTUTBILDNING: Kontrollera om artrosskola/ryggskola bör rekommenderas
  const injuryDescription = assessment.additionalInfo || assessment.injuryLocation || '';
  const symptomsText = assessment.symptoms?.join(' ') || '';
  const combinedConditionText = `${injuryDescription} ${symptomsText}`;
  const educationSchool = getEducationSchoolByCondition(combinedConditionText);
  if (educationSchool) {
    evidenceDirective += `
  ${generateEducationSchoolPrompt(educationSchool)}
  `;
  }

  // DIGITAL ALTERNATIV: Kontrollera om digital behandling kan vara lämplig
  if (shouldRecommendDigitalOption(combinedConditionText)) {
    const digitalProgram = getDigitalProgramByCondition(combinedConditionText);
    if (digitalProgram && digitalProgram.availableInSweden) {
      evidenceDirective += `
  📱 DIGITALT ALTERNATIV TILLGÄNGLIGT:
  ${digitalProgram.name} - ${digitalProgram.description.slice(0, 100)}...
  Kan rekommenderas som komplement till fysisk rehabilitering.
  `;
    }
  }

  if (relevantSources.length > 0) {
    evidenceDirective += `
  DU MÅSTE basera övningsvalen på ovanstående evidens!
  `;
  }

  // DYNAMISK EVIDENSBASERAD DOSERING
  // Anropa dosingService med patientens faktiska data
  const dosingParams: DosingParameters = {
    phase: daysSinceSurgery !== null
      ? (daysSinceSurgery < 14 ? 1 : daysSinceSurgery < 42 ? 2 : 3)
      : (assessment.painLevel > 6 ? 1 : assessment.painLevel > 3 ? 2 : 3),
    exerciseType: 'styrka',  // Default, AI kommer välja specifika
    painLevel: assessment.painLevel,
    isPostOp: assessment.injuryType === InjuryType.POST_OP,
    daysSinceSurgery: daysSinceSurgery ?? undefined,
    patientAge: assessment.age,
  };

  const dosingInfo = generateDosingPrompt(dosingParams);
  logger.info('Generated dosing prompt', { phase: dosingParams.phase, painLevel: dosingParams.painLevel });

  if (assessment.injuryType === InjuryType.POST_OP && assessment.surgeryDate) {
    // Beräkna dagar sedan operation
    daysSinceSurgery = Math.floor(
      (Date.now() - new Date(assessment.surgeryDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Hämta operationsprocedur
    const procedure = assessment.surgicalDetails?.procedure || assessment.injuryLocation;

    // Försök hitta protokoll
    const protocol = getProtocol(procedure);

    if (protocol) {
      // Vi har ett specifikt protokoll - använd det!
      postOpDirective = `
      ⚠️⚠️⚠️ KRITISK POSTOPERATIV INFORMATION ⚠️⚠️⚠️

      ${getPhaseRestrictionsForPrompt(procedure, daysSinceSurgery)}

      ${getWeightBearingAdvice(procedure, daysSinceSurgery)}

      TILLGÄNGLIGA OPERATIONSPROTOKOLL:
      ${Object.keys(POST_OP_PROTOCOLS).slice(0, 10).join(', ')}

      ⚠️ ABSOLUT KRAV: Du MÅSTE följa ovanstående restriktioner exakt!
      ⚠️ Generera ENDAST övningar som är uttryckligen TILLÅTNA för nuvarande fas.
      ⚠️ Om en övning finns i "FÖRBJUDNA RÖRELSER" - inkludera den ALDRIG.
      `;
    } else {
      // Inget specifikt protokoll - använd generella postoperativa riktlinjer
      postOpDirective = `
      ⚠️ POSTOPERATIV PATIENT - GENERELLA RESTRIKTIONER ⚠️

      OPERATION: ${procedure}
      OPERATIONSDATUM: ${assessment.surgeryDate}
      DAGAR SEDAN OPERATION: ${daysSinceSurgery}
      VIKTBÄRING: ${assessment.surgicalDetails?.weightBearing || 'Ej angivet'}
      KIRURGENS RESTRIKTIONER: ${assessment.surgicalDetails?.surgeonRestrictions || 'Inga angivna'}
      RISKFAKTORER: ${assessment.surgicalDetails?.riskFactors?.join(', ') || 'Inga angivna'}

      GENERELLA POSTOPERATIVA RIKTLINJER:
      - Fas 1 (0-2 veckor): Endast passiva rörelser, isometrisk aktivering, svullnadskontroll
      - Fas 2 (2-6 veckor): Aktiv-assisterade rörelser, lätt styrketräning
      - Fas 3 (6+ veckor): Progressiv styrketräning, funktionell träning

      NUVARANDE FAS BASERAT PÅ TID: ${daysSinceSurgery < 14 ? 'Fas 1 - SKYDDSFAS' : daysSinceSurgery < 42 ? 'Fas 2 - LÄKNINGSFAS' : 'Fas 3 - REHABILITERINGSFAS'}

      ⚠️ VIKTIGT: Följ kirurgens specifika restriktioner framför generella riktlinjer!
      ⚠️ Om viktbäring är "Avlastad" - INGA stående övningar som belastar opererat område!
      `;
    }
  }

  // ============================================
  // KLINISK KUNSKAPSBAS INTEGRATION
  // ============================================
  const clinicalKnowledgeContext = buildClinicalContext(
    assessment.surgicalDetails?.procedure,
    daysSinceSurgery ?? undefined,
    assessment.age,
    assessment.injuryLocation
  );

  // ============================================
  // ROM BASELINE DATA INTEGRATION
  // ============================================
  let romDirective = '';
  if (assessment.baselineROM) {
    const rom = assessment.baselineROM;
    const romDetails: string[] = [];

    if (rom.kneeFlexion) {
      const normalKnee = getNormalROM('knee', 'flexion', assessment.age);
      const deficitL = normalKnee ? calculateROMDeficit(rom.kneeFlexion.left, normalKnee) : null;
      const deficitR = normalKnee ? calculateROMDeficit(rom.kneeFlexion.right, normalKnee) : null;
      romDetails.push(`Knäflexion: V${rom.kneeFlexion.left}°/H${rom.kneeFlexion.right}° (symmetri: ${rom.kneeFlexion.symmetry}%)${deficitL ? ` - V: ${deficitL.severity}, H: ${deficitR?.severity}` : ''}`);
    }
    if (rom.hipFlexion) {
      romDetails.push(`Höftflexion: V${rom.hipFlexion.left}°/H${rom.hipFlexion.right}° (symmetri: ${rom.hipFlexion.symmetry}%)`);
    }
    if (rom.shoulderFlexion) {
      romDetails.push(`Axelflexion: V${rom.shoulderFlexion.left}°/H${rom.shoulderFlexion.right}° (symmetri: ${rom.shoulderFlexion.symmetry}%)`);
    }
    if (rom.shoulderAbduction) {
      romDetails.push(`Axelabduktion: V${rom.shoulderAbduction.left}°/H${rom.shoulderAbduction.right}° (symmetri: ${rom.shoulderAbduction.symmetry}%)`);
    }

    if (romDetails.length > 0) {
      romDirective = `
📊 KAMERAMÄTT ROM-BASELINE (${new Date(rom.assessmentDate).toLocaleDateString('sv-SE')}):
${romDetails.join('\n')}
${rom.painDuringTest ? '⚠️ Smärta rapporterades under mätningen' : ''}
${rom.aiObservations && rom.aiObservations.length > 0 ? `AI-observationer: ${rom.aiObservations.join(', ')}` : ''}

VIKTIGT: Anpassa övningarna efter patientens FAKTISKA rörelseomfång, inte teoretiska normalvärden!
- Välj övningar som ligger inom patientens ROM
- Undvik övningar som kräver rörelse utöver uppmätt kapacitet
- Använd ROM-data för att sätta realistiska progressionsmål
`;
    }
  }

  const prompt = `
    Du är ett expertteam av svenska legitimerade fysioterapeuter med specialistkompetens inom ortopedisk rehabilitering och smärtbehandling.

    PATIENTPROFIL:
    - Namn: ${assessment.name}
    - Ålder: ${assessment.age} år
    - Skadelokalisation: ${assessment.injuryLocation}
    - Typ: ${assessment.injuryType}
    - Smärta i vila: ${assessment.painLevel}/10
    - Smärta vid aktivitet: ${assessment.activityPainLevel}/10
    - Smärtkaraktär: ${assessment.painCharacter || 'Ej specificerad'}
    - Funktionella begränsningar: ${(assessment.functionalLimitations || []).join(', ') || 'Inga angivna'}
    - Symtomduration: ${assessment.symptomDuration || 'Ej angiven'}
    - Skadomekanism: ${assessment.injuryMechanism || 'Ej angiven'}

    LIVSSTILSFAKTORER:
    - Sömn: ${assessment.lifestyle?.sleep}
    - Stress: ${assessment.lifestyle?.stress}
    - Rörelserädsla: ${assessment.lifestyle?.fearAvoidance ? 'JA - viktig faktor!' : 'Nej'}
    - Arbetsbörda: ${assessment.lifestyle?.workload}

    KLINISKA FYND:
    ${clinicalDetails || 'Inga specifika fynd angivna.'}

    BEHANDLINGSDIREKTIV:
    ${intensityDirective}
    ${painDirective}
    ${safetyDirective}
    ${postOpDirective}

    ${painHistoryDirective}

    ${baselineDirective}

    ${smartGoalDirective}

    ${painCharacterDirective}

    ${fearAvoidanceDirective}

    ${progressionDirective}

    ${exerciseMatchingDirective}

    ${evidenceDirective}

    ${dosingInfo}

    ${clinicalKnowledgeContext ? `KLINISK KUNSKAPSBAS:\n${clinicalKnowledgeContext}` : ''}

    ${romDirective}

    KRAV PÅ PROGRAMMET:
    1. Skapa ${phaseCount} distinkta faser med progressiv belastningsökning
    2. Varje fas ska ha ${exerciseCount.min}-${exerciseCount.max} övningar per dag
    3. Inkludera övningar enligt den målbaserade mixen ovan (om angiven)
    4. Alla övningar ska ha detaljerade steg-för-steg instruktioner
    5. Anpassa svårighetsgrad baserat på smärtnivå, funktionsnivå OCH rörelserädsla
    6. Inkludera varningar och kontraindikationer där relevant
    7. Basera på aktuell evidens och svenska riktlinjer
    8. Om patienten har SMART-mål: Anpassa hela programmet mot dessa mål

    SVÅRIGHETSGRADERING:
    - Fas 1: Lätta övningar, låg belastning, fokus på smärtlindring
    - Fas 2: Medelsvåra övningar, gradvis ökad belastning
    - Fas 3: Svårare övningar, funktionell träning, återgång till aktivitet

    Returnera JSON med exakt följande struktur (fyll i alla fält korrekt):
    {
      "title": "Individanpassad titel baserat på skadan",
      "summary": "Sammanfattning (2-3 meningar) som förklarar programmets syfte",
      "conditionAnalysis": "Detaljerad klinisk analys av patientens tillstånd",
      "patientEducation": {
        "diagnosis": "Specifik medicinsk diagnos på svenska",
        "explanation": "Patientvänlig förklaring av vad som händer i kroppen",
        "pathology": "Biologisk förklaring av vävnadsläkning och anpassning",
        "prognosis": "Realistisk tidsram för återhämtning och förväntningar",
        "scienceBackground": "Varför träning är den bästa behandlingen (evidensbaserat)",
        "dailyTips": ["3-5 konkreta tips för vardagen"],
        "sources": ["Svenska Fysioterapeutförbundet", "Relevant källa 2"]
      },
      "phases": [
        {
          "phaseName": "Fas 1: [Beskrivande namn]",
          "durationWeeks": "X-X veckor",
          "description": "Detaljerad beskrivning av fasens fokus och mål",
          "goals": ["Specifikt mätbart mål 1", "Specifikt mätbart mål 2"],
          "precautions": ["Viktig varning 1", "Viktig varning 2"],
          "dailyRoutine": [
            {
              "day": 1,
              "focus": "Dagens träningsfokus",
              "exercises": [
                {
                  "name": "Övningens namn",
                  "description": "Utförlig beskrivning av övningen",
                  "sets": 3,
                  "reps": "10-12 eller sekunder",
                  "frequency": "Hur ofta",
                  "tips": "Viktiga teknikpoäng",
                  "category": "mobility|strength|balance|endurance",
                  "risks": "Vanliga misstag att undvika",
                  "advancedTips": "Tips för att öka utmaningen när redo",
                  "difficulty": "Lätt|Medel|Svår",
                  "steps": [
                    {"title": "Utgångsposition", "instruction": "Hur man börjar", "type": "start"},
                    {"title": "Rörelse", "instruction": "Hur man utför övningen", "type": "execution"},
                    {"title": "Tips", "instruction": "Viktig teknikdetalj", "type": "tip"}
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    VIKTIGT: Generera ALLTID exakt ${phaseCount} faser och ${exerciseCount.min}-${exerciseCount.max} övningar per dag. Skriv ALLT på svenska.
  `;

  // Check cache first (10 minute TTL for programs)
  // Include all relevant patient data in cache key for proper individualization
  const cacheKey = generateCacheKey('program', {
    location: assessment.injuryLocation,
    type: assessment.injuryType,
    painLevel: assessment.painLevel,
    activityPainLevel: assessment.activityPainLevel,
    // KRITISK: Inkludera postoperativ data
    surgeryDate: assessment.surgeryDate,
    procedure: assessment.surgicalDetails?.procedure,
    daysSinceSurgery: daysSinceSurgery,
    // NYA: Inkludera individanpassad data
    smartGoalType: assessment.smartGoal?.primaryGoal,
    smartGoalTimeframe: assessment.smartGoal?.timeframe,
    painHistoryDuration: assessment.painHistory?.duration,
    baselineODI: assessment.baselineAssessments?.odi?.percentScore,
    baselineTSK: assessment.baselineAssessments?.tsk11?.score
  });

  const cached = getCached<GeneratedProgram>(cacheKey);
  if (cached) {
    logger.info('Using cached program');
    return cached;
  }

  try {
    const text = await withRetry(() => generateContent(prompt, 0.3));
    if (!text) throw new Error("No response from AI");
    const program = JSON.parse(cleanJson(text)) as GeneratedProgram;

    // ============================================
    // POST-GENERERINGS VALIDERING MOT EVIDENS
    // ============================================
    const validationContext: ExerciseValidationContext = {
      bodyArea: bodyArea,
      phase: dosingParams.phase as 1 | 2 | 3,
      isPostOp: assessment.injuryType === InjuryType.POST_OP,
      procedure: assessment.surgicalDetails?.procedure,
      daysSinceSurgery: daysSinceSurgery ?? undefined,
      painLevel: assessment.painLevel,
      contraindications: assessment.surgicalDetails?.riskFactors
    };

    let totalExercises = 0;
    let validExercises = 0;
    let warningCount = 0;
    const validationWarnings: string[] = [];

    // Validera varje övning i programmet
    if (program.phases) {
      for (const phase of program.phases) {
        // Uppdatera fas i context baserat på fas-namn
        const phaseNum = phase.phaseName?.match(/\d/)?.[0];
        if (phaseNum) {
          validationContext.phase = parseInt(phaseNum) as 1 | 2 | 3;
        }

        if (phase.dailyRoutine) {
          for (const day of phase.dailyRoutine) {
            if (day.exercises) {
              for (const exercise of day.exercises) {
                totalExercises++;

                // Skapa ett Exercise-liknande objekt för validering
                const exerciseForValidation = {
                  name: exercise.name || '',
                  description: exercise.description || '',
                  difficulty: exercise.difficulty as 'Lätt' | 'Medel' | 'Svår' | undefined,
                  category: exercise.category || 'strength',
                  sets: exercise.sets || 3,
                  reps: exercise.reps || '10',
                  frequency: exercise.frequency || '3x/vecka',
                  tips: exercise.tips || '',
                  risks: exercise.risks || '',
                  advancedTips: exercise.advancedTips || '',
                  steps: exercise.steps || []
                };

                try {
                  const validation = validateExercise(exerciseForValidation, validationContext);

                  if (validation.isValid) {
                    validExercises++;
                  } else {
                    warningCount++;
                    validationWarnings.push(`${exercise.name}: ${validation.warnings.join(', ')}`);
                  }

                  // Berika övningen med evidensdata (valfritt)
                  if (validation.matchingSources.length > 0) {
                    (exercise as any).evidenceLevel = validation.evidenceLevel;
                    (exercise as any).evidenceSources = validation.matchingSources.slice(0, 2).map(s => s.title);
                  }

                  // Lägg till varningar om det finns
                  if (validation.warnings.length > 0) {
                    (exercise as any).validationWarnings = validation.warnings;
                  }
                } catch (validationError) {
                  // Ignorera valideringsfel för enskilda övningar
                  logger.warn(`Kunde inte validera övning: ${exercise.name}`, validationError);
                }
              }
            }
          }
        }
      }
    }

    // Logga valideringsresultat
    logger.info('Program validation completed', {
      totalExercises,
      validExercises,
      warningCount,
      validationRate: totalExercises > 0 ? `${Math.round((validExercises / totalExercises) * 100)}%` : 'N/A'
    });

    if (validationWarnings.length > 0) {
      logger.warn('Validation warnings found', {
        count: validationWarnings.length,
        warnings: validationWarnings.slice(0, 5)  // Visa max 5 varningar
      });
    }

    // ============================================
    // ⚠️ PROTOKOLL-BASERAT SÄKERHETSFILTER - KRITISKT
    // ============================================
    // Använder isExerciseSafe() från postOpProtocols för robust validering
    // Filtrerar ALLA post-op patienter, inte bara Fas 1

    if (assessment.injuryType === InjuryType.POST_OP && daysSinceSurgery !== null && program.phases) {
      const procedure = assessment.surgicalDetails?.procedure || assessment.injuryLocation || '';
      const protocol = getProtocol(procedure);
      const currentPhase = protocol ? getCurrentPhase(procedure, daysSinceSurgery) : null;

      let removedCount = 0;
      let modifiedCount = 0;
      const safetyAdjustments: Array<{ original: string; reason: string; replacement?: string }> = [];

      // Hämta tillåtna rörelser från protokollet för att ge säkra alternativ
      const allowedMovements = currentPhase?.phaseData?.allowedMovements || [];

      for (const phase of program.phases) {
        if (!phase.dailyRoutine) continue;

        for (const day of phase.dailyRoutine) {
          if (!day.exercises) continue;

          // Filtrera bort osäkra övningar med protokoll-validering
          const safeExercises = day.exercises.filter(exercise => {
            const exerciseName = exercise.name || '';
            const exerciseKeywords = [
              exerciseName.toLowerCase(),
              exercise.description?.toLowerCase() || '',
              ...(exercise.category ? [exercise.category.toLowerCase()] : [])
            ];

            // KRITISK: Använd protokoll-baserad säkerhetskontroll
            const safetyCheck = isExerciseSafe(
              exerciseName,
              exerciseKeywords,
              procedure,
              daysSinceSurgery!
            );

            if (!safetyCheck.safe) {
              logger.warn(`🚨 SÄKERHET: Blockerar övning "${exerciseName}" - ${safetyCheck.reason}`);
              safetyAdjustments.push({
                original: exerciseName,
                reason: safetyCheck.reason || 'Kontraindicerad för nuvarande fas'
              });
              removedCount++;
              return false;
            }

            // Extra säkerhetskontroll: Generella förbjudna nyckelord
            const name = exerciseName.toLowerCase();
            const desc = (exercise.description || '').toLowerCase();
            const combinedText = `${name} ${desc}`;

            // Tidiga faser (< 42 dagar): Extra restriktivt
            if (daysSinceSurgery < 42) {
              const phase1Forbidden = [
                'vikt', 'vikter', 'tung', 'tungt', 'belastning', 'motstånd',
                'press', 'lyft', 'styrketräning', 'max', 'explosion',
                'hopp', 'språng', 'snabb', 'power', 'plyometrisk'
              ];

              const hasForbidden = phase1Forbidden.some(kw => combinedText.includes(kw));
              if (hasForbidden) {
                logger.warn(`🚨 SÄKERHET: Blockerar "${exerciseName}" - innehåller förbjudet nyckelord i tidig fas`);
                safetyAdjustments.push({
                  original: exerciseName,
                  reason: 'Innehåller förbjudet nyckelord för tidig postoperativ fas'
                });
                removedCount++;
                return false;
              }
            }

            return true;
          });

          // Modifiera kvarvarande övningar baserat på fas
          for (const exercise of safeExercises) {
            // Fas 1 (0-14 dagar): Endast ROM, inga sets
            if (daysSinceSurgery < 14) {
              if (exercise.sets && exercise.sets > 1) {
                exercise.sets = 1;
                modifiedCount++;
              }
              if (exercise.reps && !exercise.reps.toLowerCase().includes('rom')) {
                exercise.reps = 'ROM: Smärtfri rörelse';
                modifiedCount++;
              }
              const romWarning = `⚠️ FAS 1 (Dag ${daysSinceSurgery}): Endast smärtfri rörelseträning utan belastning.`;
              if (!exercise.tips?.includes('FAS 1')) {
                exercise.tips = exercise.tips ? `${romWarning} ${exercise.tips}` : romWarning;
              }
            }
            // Fas 2 (14-42 dagar): Lätt träning
            else if (daysSinceSurgery < 42) {
              if (exercise.sets && exercise.sets > 2) {
                exercise.sets = 2;
                modifiedCount++;
              }
              const phase2Warning = `⚠️ FAS 2 (Dag ${daysSinceSurgery}): Lätt träning utan tungt motstånd.`;
              if (!exercise.tips?.includes('FAS 2')) {
                exercise.tips = exercise.tips ? `${phase2Warning} ${exercise.tips}` : phase2Warning;
              }
            }

            // Rensa advancedTips från farliga förslag (alla faser)
            if (exercise.advancedTips) {
              exercise.advancedTips = exercise.advancedTips
                .replace(/lägg till.*vikt/gi, '')
                .replace(/öka.*belastning/gi, '')
                .replace(/använd.*motstånd/gi, '')
                .replace(/öka.*intensitet/gi, '')
                .trim();
            }
          }

          day.exercises = safeExercises;
        }
      }

      // Spara säkerhetsjusteringar i programmet för UI-feedback
      (program as any).safetyAdjustments = safetyAdjustments;

      logger.info(`🔒 Protokoll-baserat säkerhetsfilter tillämpat`, {
        protocol: protocol?.name || 'Generellt',
        phase: currentPhase?.phase || 'Okänd',
        removedExercises: removedCount,
        modifiedExercises: modifiedCount,
        procedure,
        daysSinceSurgery,
        adjustments: safetyAdjustments.length > 0 ? safetyAdjustments.slice(0, 5) : 'Inga'
      });
    }

    // Cache the result for 10 minutes
    setCache(cacheKey, program, 10 * 60 * 1000);

    return program;
  } catch (error) {
    logger.error("Error generating program", error);
    throw error;
  }
};

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const normalizedQuery = query.toLowerCase();
  const localMatches = EXERCISE_DATABASE.filter(ex =>
    ex.name.toLowerCase().includes(normalizedQuery) ||
    ex.description.toLowerCase().includes(normalizedQuery) ||
    ex.category.toLowerCase().includes(normalizedQuery)
  );

  if (localMatches.length >= 6) {
    return localMatches.slice(0, 8);
  }

  // Check cache for this search query (5 minute TTL)
  const cacheKey = generateCacheKey('search', normalizedQuery);
  const cached = getCached<Exercise[]>(cacheKey);
  if (cached) {
    return [...localMatches, ...cached];
  }

  const prompt = `
    Du är en fysioterapeut. Generera ${8 - localMatches.length} rehabövningar för: "${query}".

    Returnera JSON-lista med övningar:
    [
      {
        "name": "Övningsnamn",
        "description": "Beskrivning",
        "sets": 3,
        "reps": "10-12",
        "frequency": "3x/vecka",
        "tips": "Tips",
        "category": "mobility",
        "risks": "Risker",
        "advancedTips": "Avancerade tips",
        "difficulty": "Medel",
        "calories": "15 kcal",
        "steps": [{"title": "Steg", "instruction": "Gör så här", "type": "execution"}]
      }
    ]
  `;

  try {
    const text = await withRetry(() => generateContent(prompt, 0.4));
    if (!text) return localMatches;
    const aiExercises = JSON.parse(cleanJson(text)) as Exercise[];
    // Cache AI-generated exercises
    setCache(cacheKey, aiExercises, 5 * 60 * 1000);
    return [...localMatches, ...aiExercises];
  } catch (error) {
    logger.error("Error searching exercises", error);
    return localMatches;
  }
};

export const generateAlternativeExercise = async (
  originalExercise: Exercise,
  reason: string,
  adjustment: ExerciseAdjustmentType
): Promise<Exercise> => {
  let directive = "";
  if (adjustment === 'easier') {
    directive = "Ge en LÄTTARE variant med mindre belastning.";
  } else if (adjustment === 'harder') {
    directive = "Ge en SVÅRARE variant med mer belastning.";
  } else {
    directive = "Ge ett LIKVÄRDIGT alternativ.";
  }

  const prompt = `
    Ge ett alternativ till övningen "${originalExercise.name}".
    ${directive}
    Orsak: "${reason}"

    Returnera JSON:
    {
      "name": "Nytt namn",
      "description": "Beskrivning",
      "sets": 3,
      "reps": "10-12",
      "frequency": "Dagligen",
      "tips": "Tips",
      "category": "${originalExercise.category}",
      "risks": "Risker",
      "advancedTips": "Avancerade tips",
      "difficulty": "Medel",
      "steps": [{"title": "Steg", "instruction": "Instruktion", "type": "execution"}]
    }
  `;

  try {
    const text = await generateContent(prompt, 0.4);
    if (!text) throw new Error("No alternative generated");
    return JSON.parse(cleanJson(text)) as Exercise;
  } catch (e) {
    logger.error("Swap failed", e);
    throw e;
  }
};

export const generateWeeklyAnalysis = async (
  history: { total: number, completed: number }[],
  currentPhaseName: string
): Promise<WeeklyAnalysis> => {
  const totalAssigned = history.reduce((sum, h) => sum + h.total, 0);
  const totalDone = history.reduce((sum, h) => sum + h.completed, 0);
  const adherence = totalAssigned > 0 ? (totalDone / totalAssigned) * 100 : 0;

  const prompt = `
    Analysera patientens vecka:
    - Fas: ${currentPhaseName}
    - Följsamhet: ${adherence.toFixed(1)}% (${totalDone}/${totalAssigned} övningar)

    Returnera JSON:
    {
      "decision": "maintain|progress|regress",
      "reasoning": "Förklaring",
      "tips": ["Tips 1", "Tips 2"],
      "score": 75
    }
  `;

  try {
    const text = await generateContent(prompt, 0.3);
    if (!text) throw new Error("Analysis failed");
    return JSON.parse(cleanJson(text)) as WeeklyAnalysis;
  } catch (e) {
    logger.error("Analysis failed", e);
    return {
      decision: 'maintain',
      reasoning: "Kunde inte analysera. Fortsätt som vanligt.",
      tips: ["Fokusera på kontinuitet."],
      score: 50
    };
  }
};

/**
 * Analyze pain trends and provide recommendations (Fas 6)
 */
export const analyzePainTrends = async (
  painData: { date: string; prePain?: number; postPain?: number; avgPain: number }[],
  currentPhase: string
): Promise<{
  analysis: string;
  recommendation: string;
  alertLevel: 'normal' | 'attention' | 'warning';
  suggestedAdjustments: string[];
}> => {
  // Filter only days with actual data
  const validDays = painData.filter(d => d.avgPain > 0);

  if (validDays.length < 3) {
    return {
      analysis: "Inte tillräckligt med data för analys ännu.",
      recommendation: "Fortsätt logga din smärta före och efter varje träningspass.",
      alertLevel: 'normal',
      suggestedAdjustments: []
    };
  }

  // Calculate trends
  const avgPain = validDays.reduce((sum, d) => sum + d.avgPain, 0) / validDays.length;
  const firstHalf = validDays.slice(0, Math.floor(validDays.length / 2));
  const secondHalf = validDays.slice(Math.floor(validDays.length / 2));

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgPain, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgPain, 0) / secondHalf.length;
  const trend = ((secondAvg - firstAvg) / firstAvg) * 100;

  // Check for post-workout pain increases
  const painIncreaseDays = validDays.filter(d =>
    d.prePain !== undefined && d.postPain !== undefined && d.postPain > d.prePain + 2
  );

  const prompt = `
    Du är en fysioterapeut. Analysera patientens smärtutveckling.

    DATA (senaste ${validDays.length} dagar):
    - Genomsnittlig smärta: ${avgPain.toFixed(1)}/10
    - Trend: ${trend > 0 ? '+' : ''}${trend.toFixed(1)}% (${trend < 0 ? 'minskande' : trend > 0 ? 'ökande' : 'stabil'})
    - Dagar med ökad smärta efter träning: ${painIncreaseDays.length}
    - Nuvarande fas: ${currentPhase}

    Smärtdata per dag (senaste 7):
    ${validDays.slice(-7).map(d =>
      `${d.date}: Pre ${d.prePain ?? '-'} → Post ${d.postPain ?? '-'} (avg ${d.avgPain})`
    ).join('\n    ')}

    Returnera JSON:
    {
      "analysis": "Kort analys av smärtutvecklingen (2-3 meningar)",
      "recommendation": "Konkret rekommendation",
      "alertLevel": "normal|attention|warning",
      "suggestedAdjustments": ["Justering 1", "Justering 2"]
    }

    REGLER:
    - "warning" om genomsnittlig smärta >7 eller trend >+20%
    - "attention" om smärtan ökar efter >50% av träningspassen
    - "normal" annars
  `;

  try {
    const text = await generateContent(prompt, 0.3);
    if (!text) throw new Error("Analysis failed");
    return JSON.parse(cleanJson(text));
  } catch (e) {
    logger.error("Pain analysis failed", e);
    return {
      analysis: `Genomsnittlig smärta: ${avgPain.toFixed(1)}/10. Trend: ${trend > 0 ? 'ökande' : 'minskande'}.`,
      recommendation: trend > 10 ? "Överväg att minska intensiteten." : "Fortsätt enligt plan.",
      alertLevel: avgPain > 7 ? 'warning' : trend > 15 ? 'attention' : 'normal',
      suggestedAdjustments: []
    };
  }
};

/**
 * Generate adaptive exercise adjustments based on pain feedback (Fas 6)
 */
export const generateAdaptiveAdjustments = async (
  exerciseName: string,
  recentPainDuring: number,
  difficulty: 'för_lätt' | 'lagom' | 'för_svår'
): Promise<{
  shouldAdjust: boolean;
  reason: string;
  newSets?: number;
  newReps?: string;
  newDifficulty?: 'Lätt' | 'Medel' | 'Svår';
  alternativeExercise?: string;
}> => {
  // Simple rules-based logic without AI call for common cases
  if (difficulty === 'lagom' && recentPainDuring <= 4) {
    return { shouldAdjust: false, reason: "Övningen verkar passa bra." };
  }

  if (recentPainDuring >= 7) {
    return {
      shouldAdjust: true,
      reason: "Hög smärta under övningen. Rekommenderar enklare variant.",
      newSets: 2,
      newReps: "6-8",
      newDifficulty: 'Lätt'
    };
  }

  if (difficulty === 'för_svår') {
    return {
      shouldAdjust: true,
      reason: "Du upplevde övningen som för svår. Minskar belastningen.",
      newSets: 2,
      newReps: "8-10",
      newDifficulty: 'Lätt'
    };
  }

  if (difficulty === 'för_lätt' && recentPainDuring <= 3) {
    return {
      shouldAdjust: true,
      reason: "Övningen är för lätt. Ökar utmaningen.",
      newSets: 4,
      newReps: "12-15",
      newDifficulty: 'Medel'
    };
  }

  return { shouldAdjust: false, reason: "Fortsätt med nuvarande nivå." };
};

/**
 * Dynamically adapt entire program based on accumulated pain and performance data (Fas 7)
 * This considers multiple factors to suggest comprehensive program modifications
 */
export interface DynamicProgramAdaptation {
  overallRecommendation: 'progress' | 'maintain' | 'regress' | 'pause';
  confidenceLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  phaseAdjustment?: {
    currentPhase: number;
    suggestedPhase: number;
    reason: string;
  };
  volumeAdjustment: {
    setsMultiplier: number; // e.g., 0.8 for -20%, 1.2 for +20%
    repsMultiplier: number;
  };
  intensityAdjustment: {
    difficultyShift: -1 | 0 | 1; // -1 = easier, 0 = same, 1 = harder
  };
  exerciseModifications: {
    exerciseName: string;
    action: 'skip' | 'reduce' | 'maintain' | 'increase' | 'replace';
    reason: string;
    replacement?: string;
  }[];
  restDayRecommendation?: {
    shouldTakeRest: boolean;
    duration: number; // days
    reason: string;
  };
}

export const generateDynamicProgramAdaptation = async (
  painHistory: { date: string; avgPain: number; trend: 'improving' | 'stable' | 'worsening' }[],
  exerciseCorrelations: ExercisePainCorrelation[],
  completionRate: number, // 0-100%
  currentPhase: number,
  totalPhases: number,
  daysInCurrentPhase: number,
  userFeedback?: { energy: 'low' | 'normal' | 'high'; motivation: 'low' | 'normal' | 'high' }
): Promise<DynamicProgramAdaptation> => {
  // Calculate key metrics
  const recentPain = painHistory.slice(-7);
  const avgRecentPain = recentPain.length > 0
    ? recentPain.reduce((sum, d) => sum + d.avgPain, 0) / recentPain.length
    : 0;

  const painTrend = recentPain.length >= 3
    ? recentPain[recentPain.length - 1].avgPain - recentPain[0].avgPain
    : 0;

  const aggravatingExercises = exerciseCorrelations.filter(c => c.correlation === 'aggravating');
  const beneficialExercises = exerciseCorrelations.filter(c => c.correlation === 'beneficial');

  // Decision logic
  let recommendation: 'progress' | 'maintain' | 'regress' | 'pause' = 'maintain';
  let reasoning = "";
  let volumeMultiplier = 1;
  let difficultyShift: -1 | 0 | 1 = 0;
  const exerciseModifications: DynamicProgramAdaptation['exerciseModifications'] = [];
  let restRecommendation: DynamicProgramAdaptation['restDayRecommendation'] | undefined;

  // High pain scenario
  if (avgRecentPain > 7) {
    recommendation = 'pause';
    reasoning = "Hög smärtnivå indikerar att kroppen behöver vila. Rekommenderar en paus.";
    volumeMultiplier = 0;
    restRecommendation = {
      shouldTakeRest: true,
      duration: 2,
      reason: "Smärtan är för hög för säker träning."
    };
  }
  // Worsening pain
  else if (painTrend > 2) {
    recommendation = 'regress';
    reasoning = "Smärtan har ökat markant. Minskar belastningen för att undvika försämring.";
    volumeMultiplier = 0.7;
    difficultyShift = -1;

    aggravatingExercises.forEach(ex => {
      exerciseModifications.push({
        exerciseName: ex.exerciseName,
        action: 'skip',
        reason: `Har tidigare gett +${ex.painChange} smärtökning`
      });
    });
  }
  // Good progress - low pain, high completion
  else if (avgRecentPain < 3 && completionRate > 80 && painTrend < 0 && daysInCurrentPhase > 7) {
    recommendation = 'progress';
    reasoning = "Utmärkt progress! Låg smärta och hög följsamhet. Redo för ökad utmaning.";
    volumeMultiplier = 1.15;
    difficultyShift = 1;

    beneficialExercises.forEach(ex => {
      exerciseModifications.push({
        exerciseName: ex.exerciseName,
        action: 'increase',
        reason: `Har gett ${ex.painChange} smärtminskning`
      });
    });
  }
  // Moderate scenario
  else if (avgRecentPain > 5 || painTrend > 1) {
    recommendation = 'regress';
    reasoning = "Smärtan är förhöjd. Minskar tillfälligt belastningen.";
    volumeMultiplier = 0.85;

    aggravatingExercises.slice(0, 2).forEach(ex => {
      exerciseModifications.push({
        exerciseName: ex.exerciseName,
        action: 'reduce',
        reason: `Visar korrelation med ökad smärta`
      });
    });
  }
  // Low energy/motivation adjustment
  else if (userFeedback?.energy === 'low' || userFeedback?.motivation === 'low') {
    reasoning = "Anpassar baserat på din energinivå idag.";
    volumeMultiplier = 0.8;
  }
  else {
    reasoning = "Stabil progress. Fortsätt som planerat.";
  }

  // Calculate phase adjustment
  let phaseAdjustment: DynamicProgramAdaptation['phaseAdjustment'] | undefined;
  if (recommendation === 'progress' && currentPhase < totalPhases && daysInCurrentPhase > 10) {
    phaseAdjustment = {
      currentPhase,
      suggestedPhase: currentPhase + 1,
      reason: "Tillräcklig progress för att gå vidare till nästa fas."
    };
  } else if (recommendation === 'regress' && currentPhase > 1 && avgRecentPain > 6) {
    phaseAdjustment = {
      currentPhase,
      suggestedPhase: currentPhase - 1,
      reason: "Återgår till tidigare fas för att konsolidera."
    };
  }

  return {
    overallRecommendation: recommendation,
    confidenceLevel: recentPain.length >= 5 ? 'high' : recentPain.length >= 3 ? 'medium' : 'low',
    reasoning,
    phaseAdjustment,
    volumeAdjustment: {
      setsMultiplier: volumeMultiplier,
      repsMultiplier: volumeMultiplier
    },
    intensityAdjustment: {
      difficultyShift
    },
    exerciseModifications,
    restDayRecommendation: restRecommendation
  };
};

/**
 * Analyze correlation between specific exercises and pain levels (Fas 7)
 * Identifies which exercises help reduce pain and which may aggravate it
 */
export interface ExercisePainCorrelation {
  exerciseName: string;
  timesPerformed: number;
  avgPainBefore: number;
  avgPainAfter: number;
  painChange: number; // positive = pain increased, negative = pain decreased
  correlation: 'beneficial' | 'neutral' | 'aggravating';
  confidence: 'low' | 'medium' | 'high';
}

export interface PainExerciseAnalysis {
  overallTrend: string;
  beneficialExercises: ExercisePainCorrelation[];
  aggravatingExercises: ExercisePainCorrelation[];
  recommendations: string[];
  suggestedProgramChanges: {
    exerciseToIncrease?: string;
    exerciseToReduce?: string;
    exerciseToReplace?: { from: string; to: string };
  };
}

export const analyzePainExerciseCorrelation = async (
  exerciseHistory: {
    exerciseName: string;
    date: string;
    painBefore?: number;
    painAfter?: number;
    completed: boolean;
    difficulty?: 'för_lätt' | 'lagom' | 'för_svår';
  }[],
  painLogs: { date: string; avgPain: number; location?: string }[]
): Promise<PainExerciseAnalysis> => {
  // Group exercises and calculate pain correlations
  const exerciseStats: Record<string, {
    count: number;
    painBefore: number[];
    painAfter: number[];
  }> = {};

  exerciseHistory.forEach(ex => {
    if (!ex.completed) return;
    if (!exerciseStats[ex.exerciseName]) {
      exerciseStats[ex.exerciseName] = { count: 0, painBefore: [], painAfter: [] };
    }
    exerciseStats[ex.exerciseName].count++;
    if (ex.painBefore !== undefined) exerciseStats[ex.exerciseName].painBefore.push(ex.painBefore);
    if (ex.painAfter !== undefined) exerciseStats[ex.exerciseName].painAfter.push(ex.painAfter);
  });

  const correlations: ExercisePainCorrelation[] = [];

  Object.entries(exerciseStats).forEach(([name, stats]) => {
    if (stats.count < 2) return; // Need at least 2 data points

    const avgBefore = stats.painBefore.length > 0
      ? stats.painBefore.reduce((a, b) => a + b, 0) / stats.painBefore.length
      : 0;
    const avgAfter = stats.painAfter.length > 0
      ? stats.painAfter.reduce((a, b) => a + b, 0) / stats.painAfter.length
      : 0;
    const change = avgAfter - avgBefore;

    let correlation: 'beneficial' | 'neutral' | 'aggravating' = 'neutral';
    if (change < -1) correlation = 'beneficial';
    else if (change > 1.5) correlation = 'aggravating';

    const confidence: 'low' | 'medium' | 'high' =
      stats.count >= 5 ? 'high' : stats.count >= 3 ? 'medium' : 'low';

    correlations.push({
      exerciseName: name,
      timesPerformed: stats.count,
      avgPainBefore: Math.round(avgBefore * 10) / 10,
      avgPainAfter: Math.round(avgAfter * 10) / 10,
      painChange: Math.round(change * 10) / 10,
      correlation,
      confidence
    });
  });

  const beneficial = correlations
    .filter(c => c.correlation === 'beneficial')
    .sort((a, b) => a.painChange - b.painChange);

  const aggravating = correlations
    .filter(c => c.correlation === 'aggravating')
    .sort((a, b) => b.painChange - a.painChange);

  // If we have enough data, use AI for deeper analysis
  if (correlations.length >= 3) {
    const prompt = `
      Du är en fysioterapeut som analyserar samband mellan övningar och smärta.

      ÖVNINGSDATA:
      ${correlations.map(c =>
        `- ${c.exerciseName}: Utförd ${c.timesPerformed}x, Smärtförändring: ${c.painChange > 0 ? '+' : ''}${c.painChange} (${c.correlation})`
      ).join('\n      ')}

      SMÄRTHISTORIK (senaste dagarna):
      ${painLogs.slice(-7).map(p => `${p.date}: ${p.avgPain}/10`).join(', ')}

      Analysera och returnera JSON:
      {
        "overallTrend": "Kort sammanfattning av trender (2-3 meningar)",
        "recommendations": ["Specifik rekommendation 1", "Rekommendation 2"],
        "suggestedProgramChanges": {
          "exerciseToIncrease": "Namn på övning att göra oftare eller null",
          "exerciseToReduce": "Namn på övning att minska eller null",
          "exerciseToReplace": { "from": "Gammal övning", "to": "Ny övning" } eller null
        }
      }
    `;

    try {
      const text = await generateContent(prompt, 0.3);
      const aiAnalysis = JSON.parse(cleanJson(text));

      return {
        overallTrend: aiAnalysis.overallTrend,
        beneficialExercises: beneficial,
        aggravatingExercises: aggravating,
        recommendations: aiAnalysis.recommendations || [],
        suggestedProgramChanges: aiAnalysis.suggestedProgramChanges || {}
      };
    } catch (e) {
      logger.error("AI correlation analysis failed", e);
    }
  }

  // Fallback without AI
  return {
    overallTrend: beneficial.length > aggravating.length
      ? "Majoriteten av dina övningar verkar hjälpa mot smärtan."
      : aggravating.length > 0
        ? "Vissa övningar verkar förvärra smärtan. Se detaljer nedan."
        : "Ingen tydlig korrelation mellan övningar och smärta ännu.",
    beneficialExercises: beneficial,
    aggravatingExercises: aggravating,
    recommendations: aggravating.length > 0
      ? [`Överväg att minska ${aggravating[0]?.exerciseName || 'problematiska övningar'}`]
      : [],
    suggestedProgramChanges: {}
  };
};

/**
 * Generate predictive pain warnings based on patterns (Fas 7)
 */
export const generatePredictivePainWarning = async (
  recentPainData: { date: string; avgPain: number; activities?: string[] }[],
  upcomingExercises: string[],
  exerciseCorrelations: ExercisePainCorrelation[]
): Promise<{
  warningLevel: 'none' | 'mild' | 'moderate' | 'high';
  message: string;
  riskExercises: string[];
  suggestions: string[];
}> => {
  // Check if any upcoming exercises have been flagged as aggravating
  const riskExercises = upcomingExercises.filter(ex =>
    exerciseCorrelations.some(c =>
      c.exerciseName.toLowerCase() === ex.toLowerCase() && c.correlation === 'aggravating'
    )
  );

  // Check recent pain trend
  const recentAvg = recentPainData.length > 0
    ? recentPainData.reduce((sum, d) => sum + d.avgPain, 0) / recentPainData.length
    : 0;

  const isRising = recentPainData.length >= 3 &&
    recentPainData[recentPainData.length - 1].avgPain > recentPainData[0].avgPain + 1;

  let warningLevel: 'none' | 'mild' | 'moderate' | 'high' = 'none';
  let message = "";
  const suggestions: string[] = [];

  if (riskExercises.length > 0 && recentAvg > 5) {
    warningLevel = 'high';
    message = `Varning: Dagens program innehåller övningar som tidigare gett ökad smärta, och din smärtnivå är redan förhöjd.`;
    suggestions.push(`Överväg att hoppa över eller modifiera: ${riskExercises.join(', ')}`);
    suggestions.push("Börja med lättare alternativ och avbryt om smärtan ökar");
  } else if (riskExercises.length > 0) {
    warningLevel = 'moderate';
    message = `Observera: Några övningar i dagens pass har tidigare gett ökad smärta.`;
    suggestions.push(`Var extra uppmärksam på: ${riskExercises.join(', ')}`);
  } else if (isRising && recentAvg > 4) {
    warningLevel = 'mild';
    message = "Din smärta har ökat de senaste dagarna. Ta det lugnt idag.";
    suggestions.push("Minska intensiteten med 20-30%");
    suggestions.push("Fokusera på rörlighet istället för styrka");
  }

  return {
    warningLevel,
    message,
    riskExercises,
    suggestions
  };
};

/**
 * Generate intelligent follow-up questions during onboarding (Fas 7)
 * Asks relevant clinical questions based on user's initial answers
 */
export interface OnboardingFollowUp {
  question: string;
  type: 'scale' | 'choice' | 'text' | 'multiselect';
  options?: string[];
  importance: 'required' | 'recommended' | 'optional';
  clinicalReason: string;
}

export const generateOnboardingFollowUps = async (
  currentAnswers: {
    injuryLocation: string;
    injuryType: string;
    painLevel: number;
    symptomDuration?: string;
    functionalLimitations?: string[];
    // Post-op context för säker frågehantering
    surgeryDate?: string;
    surgeryType?: string;
    isPostOp?: boolean;
  }
): Promise<OnboardingFollowUp[]> => {
  const followUps: OnboardingFollowUp[] = [];

  // Beräkna post-op fas för att avgöra vilka frågor som är säkra
  const daysSinceSurgery = currentAnswers.surgeryDate
    ? Math.floor((Date.now() - new Date(currentAnswers.surgeryDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Tidig post-op = första 6 veckorna (42 dagar) - skyddsfas
  const isEarlyPostOp = currentAnswers.isPostOp && daysSinceSurgery !== null && daysSinceSurgery < 42;

  // Axelprotes eller annan axeloperation kräver extra försiktighet
  const isShoulderSurgery = currentAnswers.surgeryType?.toLowerCase().includes('axel') ||
    currentAnswers.surgeryType?.toLowerCase().includes('protes') ||
    currentAnswers.surgeryType?.toLowerCase().includes('rotator');

  // Location-specific follow-ups
  const location = currentAnswers.injuryLocation.toLowerCase();

  if (location.includes('knä')) {
    followUps.push({
      question: "Har du svårt att gå i trappor?",
      type: 'choice',
      options: ['Uppför är svårast', 'Nedför är svårast', 'Båda är svåra', 'Inga problem'],
      importance: 'recommended',
      clinicalReason: "Hjälper identifiera patellofemorala besvär vs ligamentskada"
    });
    followUps.push({
      question: "Låser sig eller ger knäet vika ibland?",
      type: 'choice',
      options: ['Ja, det låser sig', 'Ja, det ger vika', 'Både och', 'Nej'],
      importance: 'required',
      clinicalReason: "Indikerar möjlig meniskskada eller instabilitet"
    });
  }

  if (location.includes('rygg') || location.includes('ländr')) {
    followUps.push({
      question: "Strålar smärtan ut i benet?",
      type: 'choice',
      options: ['Ja, till knäet', 'Ja, till foten', 'Bara i ryggen', 'Ibland'],
      importance: 'required',
      clinicalReason: "Avgör om det finns nervpåverkan/ischias"
    });
    followUps.push({
      question: "Är smärtan värre på morgonen eller kvällen?",
      type: 'choice',
      options: ['Morgon (stel)', 'Kväll (trött)', 'Konstant', 'Varierar'],
      importance: 'recommended',
      clinicalReason: "Morgonstelhet >30min kan indikera inflammatorisk ryggsjukdom"
    });
  }

  if (location.includes('axel')) {
    // ⚠️ SÄKERHET: Fråga INTE om ROM för post-op axelpatienter i skyddsfasen
    if (isEarlyPostOp && isShoulderSurgery) {
      // Post-op axelpatienter (Fas 1): Fråga om protokollföljsamhet istället
      followUps.push({
        question: "Följer du de rörelseövningar din fysioterapeut/kirurg har ordinerat?",
        type: 'choice',
        options: ['Ja, helt enligt schema', 'Mest, men missar ibland', 'Har svårt att komma ihåg', 'Har inte fått instruktioner'],
        importance: 'required',
        clinicalReason: "Post-op protokollföljsamhet är kritisk för läkning"
      });
      followUps.push({
        question: "Har du upplevt ökad smärta eller svullnad sedan operationen?",
        type: 'choice',
        options: ['Nej, det går bra', 'Lite svullnad', 'Ökad smärta', 'Både smärta och svullnad'],
        importance: 'required',
        clinicalReason: "Varningssignaler för komplikationer efter operation"
      });
      followUps.push({
        question: "Använder du din mitella/slynga som ordinerat?",
        type: 'choice',
        options: ['Ja, hela tiden förutom övningar', 'Mest', 'Ibland', 'Har ingen mitella'],
        importance: 'recommended',
        clinicalReason: "Immobilisering är viktig i skyddsfasen"
      });
    } else {
      // Icke-opererade axelpatienter: Standardfrågor om ROM
      followUps.push({
        question: "Kan du lyfta armen över huvudet utan smärta?",
        type: 'choice',
        options: ['Ja, utan problem', 'Med viss smärta', 'Mycket smärtsamt', 'Kan inte'],
        importance: 'required',
        clinicalReason: "Testar rotatorkuffens funktion"
      });
      followUps.push({
        question: "Vaknar du på natten av smärta om du ligger på axeln?",
        type: 'choice',
        options: ['Ja, ofta', 'Ibland', 'Sällan', 'Nej'],
        importance: 'recommended',
        clinicalReason: "Nattlig smärta indikerar ofta rotatorkuffpatologi"
      });
    }
  }

  // Pain level specific
  if (currentAnswers.painLevel >= 7) {
    followUps.push({
      question: "Har du provat något som lindrar smärtan?",
      type: 'multiselect',
      options: ['Vila', 'Is/värme', 'Smärtlindrande', 'Rörelse', 'Inget hjälper'],
      importance: 'recommended',
      clinicalReason: "Förstår vad som fungerar för individen"
    });
  }

  // Duration specific
  if (currentAnswers.symptomDuration?.includes('vecka') || currentAnswers.symptomDuration?.includes('månad')) {
    followUps.push({
      question: "Har besvären förändrats över tid?",
      type: 'choice',
      options: ['Förbättras gradvis', 'Oförändrat', 'Försämras', 'Varierar'],
      importance: 'recommended',
      clinicalReason: "Viktig prognostisk information"
    });
  }

  // Always ask about red flags if not already covered
  followUps.push({
    question: "Har du upplevt något av följande?",
    type: 'multiselect',
    options: [
      'Oförklarlig viktförlust',
      'Nattlig smärta som väcker dig',
      'Feber eller sjukdomskänsla',
      'Domningar/stickningar',
      'Inget av ovanstående'
    ],
    importance: 'required',
    clinicalReason: "Screening för röda flaggor som kräver läkarkontakt"
  });

  // Use AI for more personalized questions if we have enough context
  if (currentAnswers.functionalLimitations && currentAnswers.functionalLimitations.length > 0) {
    const prompt = `
      Du är en fysioterapeut. Baserat på patientens svar, ge EN relevant uppföljningsfråga.

      Patient:
      - Skadeområde: ${currentAnswers.injuryLocation}
      - Typ: ${currentAnswers.injuryType}
      - Smärta: ${currentAnswers.painLevel}/10
      - Funktionella begränsningar: ${currentAnswers.functionalLimitations.join(', ')}

      Returnera JSON:
      {
        "question": "Din uppföljningsfråga",
        "type": "choice",
        "options": ["Alternativ 1", "Alternativ 2", "Alternativ 3"],
        "clinicalReason": "Varför frågan är relevant"
      }
    `;

    try {
      const text = await generateContent(prompt, 0.4);
      const aiQuestion = JSON.parse(cleanJson(text));
      followUps.push({
        ...aiQuestion,
        importance: 'recommended' as const
      });
    } catch (e) {
      logger.error("AI follow-up generation failed", e);
    }
  }

  return followUps;
};

export const chatWithPT = async (
  history: {role: 'user' | 'model', text: string}[],
  userContext: string
): Promise<string> => {
  const systemPrompt = `Du är "RehabFlow Coach", en empatisk fysioterapeut.
Kontext: ${userContext}
Svara kortfattat på Svenska (max 3-4 meningar).`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map(h => ({
      role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.text
    }))
  ];

  try {
    const response = await aiWithRetry(() => aiCompletion({
      messages,
      model: MODEL,
      temperature: 0.7,
      max_tokens: 500,
    }));
    return response || "Ursäkta, något gick fel. Försök igen.";
  } catch (e) {
    logger.error("Chat failed", e);
    return "Något gick fel med anslutningen. Försök igen om en stund.";
  }
};

/**
 * Streaming chat with real-time token delivery (Fas 9)
 * Calls onChunk for each token as it arrives
 */
export const chatWithPTStreaming = async (
  history: {role: 'user' | 'model', text: string}[],
  userContext: string,
  onChunk: (chunk: string) => void,
  onComplete?: () => void
): Promise<string> => {
  const systemPrompt = `Du är "RehabFlow Coach", en empatisk och kunnig fysioterapeut med djup expertis inom rehabilitering.
Kontext: ${userContext}
Svara på Svenska. Var hjälpsam, professionell och uppmuntrande.
Ge konkreta råd baserade på patientens situation.
Använd enkel svenska som patienten lätt förstår.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map(h => ({
      role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.text
    }))
  ];

  try {
    const response = await aiCompletionStream({
      messages,
      model: MODEL,
      temperature: 0.7,
      max_tokens: 800,
      onChunk,
      onComplete,
    });

    return response || "Ursäkta, något gick fel. Försök igen.";
  } catch (e) {
    logger.error("Streaming chat failed", e);
    onComplete?.();
    return "Något gick fel med anslutningen. Försök igen om en stund.";
  }
};

// ============================================
// ONBOARDING CHAT (Förbättrad prompt)
// ============================================

/**
 * Onboarding conversation state tracking
 */
export interface OnboardingState {
  step: 'safety_screening' | 'injury_mapping' | 'pain_assessment' | 'surgery_history' | 'lifestyle' | 'goals' | 'confirmation' | 'complete';
  redFlagsChecked: boolean;
  hasRedFlags: boolean;
  collectedData: Partial<UserAssessment>;
}

/**
 * Initialize a new onboarding session
 */
export const createOnboardingSession = (): OnboardingState => ({
  step: 'safety_screening',
  redFlagsChecked: false,
  hasRedFlags: false,
  collectedData: {}
});

/**
 * Check if user responses indicate red flags
 */
export const checkForRedFlags = (userMessage: string): string[] => {
  const flagsFound: string[] = [];
  const lowerMessage = userMessage.toLowerCase();

  // Check neurological flags
  const neurologicalKeywords = ['domning', 'stickningar', 'svaghet', 'blås', 'tarm', 'kiss', 'bajs'];
  if (neurologicalKeywords.some(kw => lowerMessage.includes(kw)) && !lowerMessage.includes('nej')) {
    flagsFound.push('Neurologiska symtom');
  }

  // Check serious flags
  const seriousKeywords = ['natt', 'väcker', 'viktnedgång', 'feber', 'cancer', 'trauma', 'olycka'];
  if (seriousKeywords.some(kw => lowerMessage.includes(kw)) && lowerMessage.includes('ja')) {
    flagsFound.push('Allvarliga varningssignaler');
  }

  return flagsFound;
};

/**
 * FÖRBÄTTRAD: Extrahera data från användarens meddelanden
 * Försöker identifiera och strukturera information automatiskt
 */
export const extractDataFromMessage = (
  message: string,
  currentStep: OnboardingState['step'],
  existingData: Partial<UserAssessment>
): Partial<UserAssessment> => {
  const lowerMessage = message.toLowerCase();
  const extracted: Partial<UserAssessment> = { ...existingData };

  // Extrahera namn om det nämns
  const nameMatch = message.match(/(?:jag heter|mitt namn är|hej,?\s*jag är)\s+(\w+)/i);
  if (nameMatch) {
    extracted.name = nameMatch[1];
  }

  // Extrahera ålder
  const ageMatch = message.match(/(\d{1,2})\s*(?:år|år gammal)/i);
  if (ageMatch) {
    extracted.age = parseInt(ageMatch[1]);
  }

  // Extrahera smärtnivå (0-10 skala)
  const painMatch = message.match(/(?:smärta|ont|värk).*?(\d{1,2})(?:\s*(?:av|\/)\s*10)?/i);
  if (painMatch && currentStep === 'pain_assessment') {
    const painValue = parseInt(painMatch[1]);
    if (painValue >= 0 && painValue <= 10) {
      if (!extracted.painLevel) {
        extracted.painLevel = painValue;
      } else {
        extracted.activityPainLevel = painValue;
      }
    }
  }

  // Extrahera skadelokalisation
  const bodyPartKeywords: Record<string, string> = {
    'axel': 'Axel',
    'axeln': 'Axel',
    'nacke': 'Nacke',
    'nacken': 'Nacke',
    'rygg': 'Rygg',
    'ryggen': 'Rygg',
    'ländrygg': 'Ländrygg',
    'knä': 'Knä',
    'knät': 'Knä',
    'höft': 'Höft',
    'höften': 'Höft',
    'fotled': 'Fotled',
    'fotleden': 'Fotled',
    'handled': 'Handled',
    'handleden': 'Handled',
    'armbåge': 'Armbåge',
    'armbågen': 'Armbåge',
  };

  for (const [keyword, value] of Object.entries(bodyPartKeywords)) {
    if (lowerMessage.includes(keyword)) {
      extracted.injuryLocation = value;
      break;
    }
  }

  // Extrahera skadetyp
  if (lowerMessage.includes('operation') || lowerMessage.includes('operera')) {
    extracted.injuryType = InjuryType.POST_OP;
  } else if (lowerMessage.includes('akut') || lowerMessage.includes('nyligen') || lowerMessage.includes('precis')) {
    extracted.injuryType = InjuryType.ACUTE;
  } else if (lowerMessage.includes('kronisk') || lowerMessage.includes('länge') || lowerMessage.includes('flera månader')) {
    extracted.injuryType = InjuryType.CHRONIC;
  }

  // KRITISK: Extrahera postoperativa detaljer
  if (extracted.injuryType === InjuryType.POST_OP || currentStep === 'surgery_history') {
    // Försök extrahera operationstyp
    const surgeryKeywords: Record<string, string> = {
      'axelprotes': 'axelprotes',
      'protes i axeln': 'axelprotes',
      'rotatorkuff': 'rotatorkuff_sutur',
      'korsband': 'acl_rekonstruktion',
      'acl': 'acl_rekonstruktion',
      'menisk': 'menisk_operation',
      'knäprotes': 'knaprotes',
      'protes i knät': 'knaprotes',
      'höftprotes': 'hoftprotes',
      'protes i höften': 'hoftprotes',
      'diskbråck': 'diskbrack_operation',
      'spondylodes': 'spondylodes',
      'steloperation': 'spondylodes',
    };

    for (const [keyword, procedure] of Object.entries(surgeryKeywords)) {
      if (lowerMessage.includes(keyword)) {
        extracted.surgicalDetails = {
          ...extracted.surgicalDetails,
          procedure,
          date: extracted.surgeryDate || '',
          surgeonRestrictions: '',
          weightBearing: 'Partiell',
          riskFactors: []
        };
        break;
      }
    }

    // Försök extrahera operationsdatum
    const dateMatch = message.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]?(\d{2,4})?/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3] ? (dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3]) : new Date().getFullYear().toString();
      extracted.surgeryDate = `${year}-${month}-${day}`;
    }

    // Extrahera dagar/veckor sedan operation
    const weeksAgoMatch = message.match(/(\d+)\s*veckor?\s*sedan/i);
    const daysAgoMatch = message.match(/(\d+)\s*dagar?\s*sedan/i);
    if (weeksAgoMatch) {
      const weeksAgo = parseInt(weeksAgoMatch[1]);
      const surgeryDate = new Date();
      surgeryDate.setDate(surgeryDate.getDate() - (weeksAgo * 7));
      extracted.surgeryDate = surgeryDate.toISOString().split('T')[0];
    } else if (daysAgoMatch) {
      const daysAgo = parseInt(daysAgoMatch[1]);
      const surgeryDate = new Date();
      surgeryDate.setDate(surgeryDate.getDate() - daysAgo);
      extracted.surgeryDate = surgeryDate.toISOString().split('T')[0];
    }

    // Extrahera viktbäring
    if (lowerMessage.includes('avlastad') || lowerMessage.includes('ingen belastning')) {
      extracted.surgicalDetails = {
        ...extracted.surgicalDetails!,
        weightBearing: 'Avlastad'
      };
    } else if (lowerMessage.includes('partiell') || lowerMessage.includes('delvis')) {
      extracted.surgicalDetails = {
        ...extracted.surgicalDetails!,
        weightBearing: 'Partiell'
      };
    } else if (lowerMessage.includes('full') || lowerMessage.includes('helt')) {
      extracted.surgicalDetails = {
        ...extracted.surgicalDetails!,
        weightBearing: 'Fullt'
      };
    }
  }

  // Extrahera livsstilsfaktorer
  if (currentStep === 'lifestyle') {
    // Sömn
    if (lowerMessage.includes('sover dåligt') || lowerMessage.includes('dålig sömn')) {
      extracted.lifestyle = { ...extracted.lifestyle, sleep: 'Dålig' } as any;
    } else if (lowerMessage.includes('sover bra') || lowerMessage.includes('bra sömn')) {
      extracted.lifestyle = { ...extracted.lifestyle, sleep: 'Bra' } as any;
    }

    // Stress
    if (lowerMessage.includes('mycket stress') || lowerMessage.includes('stressad')) {
      extracted.lifestyle = { ...extracted.lifestyle, stress: 'Hög' } as any;
    } else if (lowerMessage.includes('lite stress') || lowerMessage.includes('lugnt')) {
      extracted.lifestyle = { ...extracted.lifestyle, stress: 'Låg' } as any;
    }

    // Rörelserädsla
    if (lowerMessage.includes('rädd') || lowerMessage.includes('vågar inte')) {
      extracted.lifestyle = { ...extracted.lifestyle, fearAvoidance: true } as any;
    }
  }

  return extracted;
};

/**
 * FÖRBÄTTRAD: Bestäm nästa steg baserat på insamlad data
 */
export const determineNextStep = (
  currentStep: OnboardingState['step'],
  collectedData: Partial<UserAssessment>,
  hasRedFlags: boolean
): OnboardingState['step'] => {
  // Om röda flaggor - gå till bekräftelse med varning
  if (hasRedFlags && currentStep === 'safety_screening') {
    // Vi fortsätter ändå men med varning
    return 'injury_mapping';
  }

  // Kontrollera om vi har tillräcklig data för att gå vidare
  switch (currentStep) {
    case 'safety_screening':
      // Gå vidare om screening är gjord
      return 'injury_mapping';

    case 'injury_mapping':
      // Behöver skadelokalisation och typ
      if (collectedData.injuryLocation) {
        return 'pain_assessment';
      }
      return 'injury_mapping'; // Stanna kvar

    case 'pain_assessment':
      // Behöver smärtnivå
      if (collectedData.painLevel !== undefined) {
        // Om POST_OP, gå till operationshistorik
        if (collectedData.injuryType === InjuryType.POST_OP) {
          return 'surgery_history';
        }
        return 'lifestyle';
      }
      return 'pain_assessment';

    case 'surgery_history':
      // KRITISK: Kräv operationsinformation för postoperativa
      if (collectedData.surgicalDetails?.procedure && collectedData.surgeryDate) {
        return 'lifestyle';
      }
      return 'surgery_history'; // Stanna kvar tills vi har info

    case 'lifestyle':
      if (collectedData.lifestyle?.sleep) {
        return 'goals';
      }
      return 'lifestyle';

    case 'goals':
      if (collectedData.goals) {
        return 'confirmation';
      }
      return 'goals';

    case 'confirmation':
      return 'complete';

    default:
      return currentStep;
  }
};

/**
 * Kontrollera om steget har tillräcklig data
 */
export const isStepComplete = (
  step: OnboardingState['step'],
  collectedData: Partial<UserAssessment>
): boolean => {
  switch (step) {
    case 'safety_screening':
      return true; // Alltid klart efter första svaret

    case 'injury_mapping':
      return !!collectedData.injuryLocation;

    case 'pain_assessment':
      return collectedData.painLevel !== undefined;

    case 'surgery_history':
      // KRITISK: Kräv operationsdetaljer
      return !!(collectedData.surgicalDetails?.procedure && collectedData.surgeryDate);

    case 'lifestyle':
      return !!collectedData.lifestyle?.sleep;

    case 'goals':
      return !!collectedData.goals;

    case 'confirmation':
      return true;

    default:
      return false;
  }
};

/**
 * Generera postoperativ varning om relevant
 */
export const generatePostOpWarning = (collectedData: Partial<UserAssessment>): string | null => {
  if (collectedData.injuryType !== InjuryType.POST_OP || !collectedData.surgeryDate) {
    return null;
  }

  const daysSinceSurgery = Math.floor(
    (Date.now() - new Date(collectedData.surgeryDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceSurgery < 14) {
    return `⚠️ VIKTIG INFORMATION: Du är ${daysSinceSurgery} dagar efter din operation. ` +
      `Detta är en mycket tidig rehabiliteringsfas. Ditt träningsprogram kommer att vara ` +
      `extremt försiktigt och fokusera på läkning snarare än styrka. ` +
      `Följ ALLTID din kirurgs instruktioner framför allt annat.`;
  }

  if (daysSinceSurgery < 42) {
    return `📋 Du är ${daysSinceSurgery} dagar (cirka ${Math.floor(daysSinceSurgery / 7)} veckor) ` +
      `efter din operation. Du är fortfarande i läkningsfasen. Programmet anpassas efter detta.`;
  }

  return null;
};

/**
 * Onboarding-specific chat with enhanced safety screening
 * Uses the improved onboarding prompt for structured data collection
 * FÖRBÄTTRAD: Nu med automatisk dataextraktion och stegprogression
 */
export const onboardingChatStreaming = async (
  history: { role: 'user' | 'model'; text: string }[],
  onboardingState: OnboardingState,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onStateUpdate?: (state: OnboardingState) => void
): Promise<{ response: string; updatedState: OnboardingState }> => {
  // Hämta senaste användarmeddelande
  const lastUserMessage = history.filter(m => m.role === 'user').pop()?.text || '';

  // FÖRBÄTTRAD: Extrahera data från meddelandet
  const extractedData = extractDataFromMessage(
    lastUserMessage,
    onboardingState.step,
    onboardingState.collectedData
  );

  // Kontrollera röda flaggor
  const detectedFlags = checkForRedFlags(lastUserMessage);

  // Uppdatera state med extraherad data
  let updatedState: OnboardingState = {
    ...onboardingState,
    collectedData: extractedData,
    hasRedFlags: onboardingState.hasRedFlags || detectedFlags.length > 0,
    redFlagsChecked: onboardingState.step === 'safety_screening' ? true : onboardingState.redFlagsChecked
  };

  // FÖRBÄTTRAD: Bestäm om vi ska gå till nästa steg
  const isCurrentStepComplete = isStepComplete(onboardingState.step, extractedData);
  if (isCurrentStepComplete && onboardingState.step !== 'complete') {
    updatedState.step = determineNextStep(
      onboardingState.step,
      extractedData,
      updatedState.hasRedFlags
    );
  }

  // Bygg kontextrik prompt baserat på steg
  let stepContext = '';
  let additionalInstructions = '';

  // Samla insamlad data för prompten
  const collectedSummary = buildCollectedDataSummary(extractedData);

  switch (updatedState.step) {
    case 'safety_screening':
      stepContext = `
DU ÄR I STEG 1: SÄKERHETSSCREENING

UPPGIFT: Ställ röda flaggor-frågor för att utesluta allvarliga tillstånd.

FRÅGA OM:
- Domningar eller stickningar
- Blås- eller tarmstörningar
- Nattlig smärta som väcker
- Oförklarlig viktnedgång
- Feber i samband med smärtan
- Tidigare cancer

Om patienten svarar JA på något av ovanstående, notera det och rekommendera läkarkontakt.
`;
      break;

    case 'injury_mapping':
      stepContext = `
DU ÄR I STEG 2: SKADEKARTLÄGGNING

INSAMLAD DATA:
${collectedSummary}

UPPGIFT: Kartlägg skadan i detalj.

FRÅGA OM:
- Exakt lokalisation (var gör det ont?)
- Typ av besvär (akut skada, kronisk smärta, efter operation)
- När började det?
- Hur hände det?

VIKTIGT: Om patienten nämner operation, FRÅGA DIREKT om:
- Typ av operation
- När operationen gjordes
- Eventuella restriktioner från kirurgen
`;
      if (extractedData.injuryType === InjuryType.POST_OP) {
        additionalInstructions = `
⚠️ POSTOPERATIV PATIENT IDENTIFIERAD
Du MÅSTE samla in detaljerad operationsinformation innan du går vidare.
Fråga om: operationstyp, operationsdatum, viktbäringsrestriktioner.
`;
      }
      break;

    case 'pain_assessment':
      stepContext = `
DU ÄR I STEG 3: SMÄRTBEDÖMNING

INSAMLAD DATA:
${collectedSummary}

UPPGIFT: Bedöm smärtans karaktär och intensitet.

FRÅGA OM:
- Smärtnivå i vila (0-10)
- Smärtnivå vid aktivitet/belastning (0-10)
- Smärtkaraktär (molande, huggande, brännande, etc.)
- Vad som förvärrar/lindrar
`;
      break;

    case 'surgery_history':
      stepContext = `
DU ÄR I STEG 4: OPERATIONSHISTORIK (KRITISKT STEG)

INSAMLAD DATA:
${collectedSummary}

⚠️ VIKTIGT: Patienten har angett postoperativa besvär.
Du MÅSTE samla in följande information:

1. OPERATIONSTYP - Vilken operation? (t.ex. axelprotes, korsbandsrekonstruktion, meniskoperation)
2. OPERATIONSDATUM - När opererades patienten? (datum eller "X veckor/dagar sedan")
3. VIKTBÄRING - Får patienten belasta? (avlastad, partiell, full)
4. KIRURGENS RESTRIKTIONER - Har kirurgen gett specifika begränsningar?

GILTIGA OPERATIONSTYPER VI HAR PROTOKOLL FÖR:
- Axelprotes, Rotatorkuffsutur
- ACL-rekonstruktion, Meniskoperation, Knäprotes
- Höftprotes
- Diskbråck-operation, Spondylodes

OM INFORMATION SAKNAS: Fortsätt fråga tills du har alla detaljer!
`;
      additionalInstructions = `
⚠️ LÄMNA INTE DETTA STEG förrän du har:
1. Operationstyp
2. Ungefärligt datum
3. Viktbäringsstatus
`;
      break;

    case 'lifestyle':
      stepContext = `
DU ÄR I STEG 5: LIVSSTILSFAKTORER

INSAMLAD DATA:
${collectedSummary}

UPPGIFT: Kartlägg faktorer som påverkar rehabiliteringen.

FRÅGA OM:
- Sömnkvalitet (bra, okej, dålig)
- Stressnivå (låg, medel, hög)
- Aktivitetsnivå före skadan
- Eventuell rörelserädsla
- Arbetssituation (stillasittande, fysiskt lätt, fysiskt tungt)
`;
      break;

    case 'goals':
      stepContext = `
DU ÄR I STEG 6: MÅLSÄTTNING

INSAMLAD DATA:
${collectedSummary}

UPPGIFT: Hjälp patienten formulera tydliga mål.

FRÅGA OM:
- Vad vill patienten kunna göra igen?
- Tidsram (realistisk baserat på skadan)
- Specifika aktiviteter (sport, arbete, vardag)

HJÄLP FORMULERA SMART-MÅL:
- Specifikt
- Mätbart
- Accepterat
- Realistiskt
- Tidsbundet
`;
      break;

    case 'confirmation':
      stepContext = `
DU ÄR I STEG 7: BEKRÄFTELSE

INSAMLAD DATA:
${collectedSummary}

UPPGIFT: Sammanfatta ALL insamlad information och be om bekräftelse.

${extractedData.injuryType === InjuryType.POST_OP ? `
⚠️ POSTOPERATIV PATIENT:
- Operation: ${extractedData.surgicalDetails?.procedure || 'EJ ANGIVEN'}
- Datum: ${extractedData.surgeryDate || 'EJ ANGIVET'}
- Viktbäring: ${extractedData.surgicalDetails?.weightBearing || 'EJ ANGIVEN'}

VARNING: Om operationsdetaljer saknas, fråga efter dem INNAN du genererar ett program!
` : ''}

GÖR EN TYDLIG SAMMANFATTNING och fråga:
"Stämmer detta? Om ja, kan jag skapa ditt träningsprogram."
`;
      break;

    case 'complete':
      stepContext = 'Onboarding är klar. Patienten har bekräftat sin information.';
      break;
  }

  // Lägg till postoperativ varning om relevant
  const postOpWarning = generatePostOpWarning(extractedData);
  if (postOpWarning) {
    additionalInstructions += `\n${postOpWarning}`;
  }

  const messages = [
    {
      role: "system" as const,
      content: ONBOARDING_PROMPTS.system + '\n\n' + stepContext + '\n' + additionalInstructions
    },
    ...history.map(h => ({
      role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.text
    }))
  ];

  try {
    const response = await aiCompletionStream({
      messages,
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1000,
      onChunk,
      onComplete: () => {
        onComplete?.();
        onStateUpdate?.(updatedState);
      },
    });

    return {
      response: response || "Ursäkta, något gick fel. Försök igen.",
      updatedState
    };
  } catch (e) {
    logger.error("Onboarding chat failed", e);
    onComplete?.();
    return {
      response: "Något gick fel med anslutningen. Försök igen om en stund.",
      updatedState
    };
  }
};

/**
 * Bygg en sammanfattning av insamlad data för prompten
 */
function buildCollectedDataSummary(data: Partial<UserAssessment>): string {
  const parts: string[] = [];

  if (data.name) parts.push(`Namn: ${data.name}`);
  if (data.age) parts.push(`Ålder: ${data.age} år`);
  if (data.injuryLocation) parts.push(`Skadelokalisation: ${data.injuryLocation}`);
  if (data.injuryType) parts.push(`Typ: ${data.injuryType}`);
  if (data.painLevel !== undefined) parts.push(`Smärta i vila: ${data.painLevel}/10`);
  if (data.activityPainLevel !== undefined) parts.push(`Smärta vid aktivitet: ${data.activityPainLevel}/10`);
  if (data.painCharacter) parts.push(`Smärtkaraktär: ${data.painCharacter}`);

  if (data.surgicalDetails) {
    parts.push(`--- POSTOPERATIV DATA ---`);
    if (data.surgicalDetails.procedure) parts.push(`Operation: ${data.surgicalDetails.procedure}`);
    if (data.surgeryDate) parts.push(`Operationsdatum: ${data.surgeryDate}`);
    if (data.surgicalDetails.weightBearing) parts.push(`Viktbäring: ${data.surgicalDetails.weightBearing}`);
    if (data.surgicalDetails.surgeonRestrictions) parts.push(`Kirurgens restriktioner: ${data.surgicalDetails.surgeonRestrictions}`);
  }

  if (data.lifestyle) {
    parts.push(`--- LIVSSTIL ---`);
    if (data.lifestyle.sleep) parts.push(`Sömn: ${data.lifestyle.sleep}`);
    if (data.lifestyle.stress) parts.push(`Stress: ${data.lifestyle.stress}`);
    if (data.lifestyle.fearAvoidance) parts.push(`Rörelserädsla: JA`);
    if (data.lifestyle.workload) parts.push(`Arbetsbörda: ${data.lifestyle.workload}`);
  }

  if (data.goals) parts.push(`Mål: ${data.goals}`);

  return parts.length > 0 ? parts.join('\n') : 'Ingen data insamlad ännu.';
}

/**
 * Get the initial onboarding greeting
 */
export const getOnboardingGreeting = (): string => {
  return ONBOARDING_PROMPTS.conversationStarters[0];
};

/**
 * Generate rehabilitation plan from collected onboarding data
 */
export const generatePlanFromOnboarding = async (
  collectedData: Partial<UserAssessment>
): Promise<GeneratedProgram | null> => {
  // Convert collected data to full UserAssessment with defaults
  const assessment: UserAssessment = {
    name: collectedData.name || 'Patient',
    age: collectedData.age || 40,
    injuryLocation: collectedData.injuryLocation || 'okänt',
    injuryType: collectedData.injuryType || InjuryType.CHRONIC,
    symptoms: collectedData.symptoms || [],
    painLevel: collectedData.painLevel || 5,
    activityPainLevel: collectedData.activityPainLevel || 5,
    goals: typeof collectedData.goals === 'string'
      ? collectedData.goals
      : (collectedData.goals?.[0] || 'Förbättra funktion'),
    activityLevel: collectedData.activityLevel || 'Måttligt aktiv',
    lifestyle: collectedData.lifestyle || {
      sleep: 'Okej',
      stress: 'Medel',
      fearAvoidance: false,
      workload: 'Fysiskt lätt'
    },
    specificAnswers: collectedData.specificAnswers || {},
    surgeryDate: collectedData.surgeryDate,
    surgicalDetails: collectedData.surgicalDetails,
    redFlags: collectedData.redFlags,
    symptomDuration: collectedData.symptomDuration,
    painCharacter: collectedData.painCharacter,
    functionalLimitations: collectedData.functionalLimitations
  };

  return generateRehabProgram(assessment);
};

/**
 * Conversation memory management (Fas 9)
 * Stores and retrieves conversation history with summarization
 */
export interface ConversationMemory {
  id: string;
  messages: { role: 'user' | 'model'; text: string; timestamp: number }[];
  summary?: string;
  createdAt: number;
  updatedAt: number;
}

const MEMORY_STORAGE_KEY = 'rehabflow_conversation_memory';
const MAX_MESSAGES_BEFORE_SUMMARY = 20;

export const saveConversationMemory = (memory: ConversationMemory): void => {
  try {
    const existing = loadAllConversations();
    const index = existing.findIndex(c => c.id === memory.id);
    if (index >= 0) {
      existing[index] = { ...memory, updatedAt: Date.now() };
    } else {
      existing.push(memory);
    }
    // Keep only last 10 conversations
    const trimmed = existing.slice(-10);
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    logger.error("Failed to save conversation memory", e);
  }
};

export const loadConversationMemory = (id: string): ConversationMemory | null => {
  try {
    const all = loadAllConversations();
    return all.find(c => c.id === id) || null;
  } catch (e) {
    logger.error("Failed to load conversation memory", e);
    return null;
  }
};

export const loadAllConversations = (): ConversationMemory[] => {
  try {
    const data = localStorage.getItem(MEMORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    logger.error("Failed to load conversations", e);
    return [];
  }
};

export const createNewConversation = (): ConversationMemory => ({
  id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

/**
 * Summarize long conversations to maintain context while reducing tokens
 */
export const summarizeConversation = async (
  messages: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  if (messages.length < MAX_MESSAGES_BEFORE_SUMMARY) {
    return "";
  }

  const prompt = `
    Sammanfatta följande konversation mellan patient och fysioterapeut.
    Inkludera: huvudämnen, patientens besvär, givna råd.
    Max 100 ord.

    Konversation:
    ${messages.map(m => `${m.role === 'user' ? 'Patient' : 'PT'}: ${m.text}`).join('\n')}
  `;

  try {
    const response = await aiWithRetry(() => aiCompletion({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 200,
    }));
    return response || "";
  } catch (e) {
    logger.error("Failed to summarize conversation", e);
    return "";
  }
};

/**
 * Clear cache (useful for testing or when data changes)
 */
export const clearCache = (): void => {
  cache.clear();
};

/**
 * Generate personalized exercise recommendations based on user profile (Fas 9)
 */
export interface ExerciseRecommendation {
  category: string;
  reason: string;
  suggestedExercises: string[];
  priority: 'high' | 'medium' | 'low';
}

export const generateExerciseRecommendations = async (
  injuryLocation: string,
  painLevel: number,
  completedExercises: string[],
  favoriteExercises: string[]
): Promise<ExerciseRecommendation[]> => {
  // Check cache first
  const cacheKey = generateCacheKey('recommendations', { injuryLocation, painLevel });
  const cached = getCached<ExerciseRecommendation[]>(cacheKey);
  if (cached) return cached;

  const prompt = `
    Du är en fysioterapeut som rekommenderar övningar.

    PATIENTPROFIL:
    - Skadeområde: ${injuryLocation}
    - Smärtnivå: ${painLevel}/10
    - Genomförda övningar: ${completedExercises.slice(0, 5).join(', ') || 'Inga ännu'}
    - Favoritövningar: ${favoriteExercises.slice(0, 5).join(', ') || 'Inga ännu'}

    Ge 3 personliga rekommendationer för övningskategorier.

    Returnera JSON:
    [
      {
        "category": "Kategorinamn (t.ex. Rörlighet, Styrka)",
        "reason": "Kort förklaring varför denna kategori passar patienten",
        "suggestedExercises": ["Övning 1", "Övning 2", "Övning 3"],
        "priority": "high|medium|low"
      }
    ]

    REGLER:
    - "high" för övningar som direkt adresserar skadeområdet
    - "medium" för stödjande övningar
    - "low" för generell hälsa
    - Undvik övningar som kan förvärra smärtan
  `;

  try {
    const text = await withRetry(() => generateContent(prompt, 0.4));
    if (!text) return [];
    const recommendations = JSON.parse(cleanJson(text)) as ExerciseRecommendation[];
    setCache(cacheKey, recommendations, 10 * 60 * 1000); // 10 min cache
    return recommendations;
  } catch (e) {
    logger.error("Failed to generate recommendations", e);
    return [];
  }
};

// ============================================
// AI-DRIVEN ONBOARDING FUNCTIONS
// ============================================

/**
 * Map body part to Swedish name for prompts
 */
const mapBodyPartToSwedish = (bodyPart: string): string => {
  const mapping: Record<string, string> = {
    'Knä': 'knä',
    'Höft': 'höft',
    'Vänster knä': 'vänster knä',
    'Höger knä': 'höger knä',
    'Ländrygg': 'ländrygg',
    'Nacke': 'nacke',
    'Axel': 'axel',
    'Vänster axel': 'vänster axel',
    'Höger axel': 'höger axel',
    'Handled': 'handled',
    'Armbåge': 'armbåge',
    'Fotled': 'fotled',
    'Övre rygg': 'övre rygg/bröstrygg',
    'Bäcken': 'bäcken',
  };
  return mapping[bodyPart] || bodyPart.toLowerCase();
};

/**
 * Build a rich patient context description for AI to generate individualized questions
 * Creates a narrative that helps AI understand the whole person, not just symptoms
 */
const buildPatientContext = (
  assessment: Partial<UserAssessment>,
  bodyPart: string,
  age: string,
  activityLevel: string,
  workload: string,
  injuryType: string
): string => {
  const parts: string[] = [];

  // Grundläggande demografi
  parts.push(`En ${age}-årig patient som är ${activityLevel.toLowerCase()} och arbetar ${workload.toLowerCase()}.`);

  // Smärtlokalisation
  parts.push(`Söker för besvär i ${bodyPart}.`);

  // Skadetyp
  if (injuryType === InjuryType.ACUTE) {
    parts.push('Det är en AKUT skada (nyligen inträffad).');
  } else if (injuryType === InjuryType.CHRONIC) {
    parts.push('Besvären har pågått LÄNGE (kroniskt tillstånd).');
  } else if (injuryType === InjuryType.POST_OP) {
    const procedure = assessment.surgicalDetails?.procedure;
    const date = assessment.surgicalDetails?.date;
    const restrictions = assessment.surgicalDetails?.surgeonRestrictions;
    parts.push(`Patienten är POSTOPERATIV efter ${procedure || 'operation'}${date ? ` (${date})` : ''}.`);
    if (restrictions) {
      parts.push(`Kirurgens restriktioner: ${restrictions}`);
    }
  } else if (injuryType === InjuryType.PREHAB) {
    parts.push('Patienten vill FÖREBYGGA skada/förbereda sig.');
  }

  // Smärtnivå
  if (assessment.painLevel !== undefined) {
    if (assessment.painLevel >= 7) {
      parts.push(`Smärtnivån är HÖG (${assessment.painLevel}/10) - var uppmärksam på röda flaggor.`);
    } else if (assessment.painLevel >= 4) {
      parts.push(`Smärtnivån är måttlig (${assessment.painLevel}/10).`);
    } else {
      parts.push(`Smärtnivån är relativt låg (${assessment.painLevel}/10).`);
    }
  }

  // Livsstilsfaktorer
  if (assessment.lifestyle) {
    if (assessment.lifestyle.stress === 'Hög') {
      parts.push('Rapporterar HÖG STRESS - överväg psykosociala faktorer.');
    }
    if (assessment.lifestyle.sleep === 'Dålig') {
      parts.push('Sover DÅLIGT - kan påverka smärtupplevelse och läkning.');
    }
    if (assessment.lifestyle.fearAvoidance) {
      parts.push('Visar tecken på RÖRELSERÄDSLA - var försiktig med hur du formulerar frågor.');
    }
  }

  // Tidigare behandling
  if (assessment.painHistory?.previousTreatments && assessment.painHistory.previousTreatments.length > 0) {
    parts.push(`Har provat: ${assessment.painHistory.previousTreatments.join(', ')}.`);
  }

  // Mål
  if (assessment.goals) {
    parts.push(`Patientens mål: ${assessment.goals}.`);
  }

  return parts.join('\n');
};

/**
 * Generate body-part specific example questions for the AI prompt
 * This ensures clinically relevant questions for each body region
 * @deprecated - Replaced by buildPatientContext for more individualized approach
 */
const getBodyPartSpecificExamples = (bodyPart: string, activityLevel: string, workload: string): string => {
  const bp = bodyPart.toLowerCase();

  // Kroppsdel-specifika frågeexempel baserat på klinisk praxis
  const examples: Record<string, string[]> = {
    'nacke': [
      '"Strålar smärtan ut i armen eller fingrarna?" (nervrotspåverkan)',
      '"Känner du stelhet på morgonen som släpper efter en stund?" (inflammatorisk vs mekanisk)',
      '"Blir det värre av att titta uppåt eller nedåt?" (specifika rörelser)',
      '"Har du huvudvärk som börjar i nacken?" (cervikal huvudvärk)',
    ],
    'axel': [
      '"Kan du sova på den sidan utan att vakna av smärta?" (nattlig smärta)',
      '"Gör det ont när du sträcker dig bakåt, som att ta på ett skärp?" (inåtrotation)',
      '"Har du svårt att lyfta armen utåt/uppåt?" (abduktion/impingement)',
      '"Känns det svagt eller ostabilt i axeln?" (rotatorkuffproblem)',
    ],
    'rygg': [
      '"Strålar smärtan ner i benet, under knät?" (ischias vs lokal ryggsmärta)',
      '"Är det värre att sitta länge eller stå länge?" (mekaniskt mönster)',
      '"Lindrar det att böja sig framåt eller bakåt?" (flexion vs extension)',
      '"Har du domningar eller stickningar i benen?" (nervpåverkan)',
    ],
    'ländryggen': [
      '"Strålar smärtan ner i benet, under knät?" (ischias)',
      '"Blir det bättre av att gå en stund eller värre?" (spinal stenos)',
      '"Känner du svaghet i benet eller svårt att gå på tå/häl?" (neurologisk screening)',
      '"Påverkas blåsa eller tarm?" (cauda equina - rött flagga)',
    ],
    'knä': [
      '"Har knät låst sig eller gett vika?" (menisk/ligamentskada)',
      '"Svullnar det upp efter aktivitet?" (inflammation)',
      '"Är det värre i trappor - uppför eller nedför?" (patellofemoral)',
      '"Knakar eller knäpper det i knät?" (broskproblem)',
    ],
    'höft': [
      '"Har du svårt att ta på strumpor eller skor?" (rörlighet)',
      '"Gör det ont i ljumsken eller på utsidan av höften?" (lokalisation)',
      '"Känns det stelt efter att ha suttit länge?" (artros-tecken)',
      '"Haltar du när du går?" (funktionspåverkan)',
    ],
    'fotled': [
      '"Vrickade du foten nyligen?" (akut skada)',
      '"Känns det ostabilt när du går på ojämnt underlag?" (instabilitet)',
      '"Är det värre på morgonen och blir bättre av att gå?" (hälsporre/fasciit)',
      '"Svullnar det upp mot kvällen?" (inflammation)',
    ],
    'handled': [
      '"Domnar fingrarna, speciellt på natten?" (karpaltunnel)',
      '"Är det värre av att vrida handleden?" (TFCC-skada)',
      '"Gör det ont att greppa saker hårt?" (tendinopati)',
      '"Har du arbetat mycket med händerna nyligen?" (överbelastning)',
    ],
  };

  // Hitta matchande kroppsdel eller använd generiska
  let relevantExamples: string[] = [];
  for (const [key, ex] of Object.entries(examples)) {
    if (bp.includes(key) || key.includes(bp)) {
      relevantExamples = ex;
      break;
    }
  }

  // Fallback till generiska frågor
  if (relevantExamples.length === 0) {
    relevantExamples = [
      '"Vaknar du av smärtan på natten?" (inflammatorisk/allvarlig)',
      '"Är smärtan konstant eller kommer och går?" (mönster)',
      '"Vad gör smärtan värre respektive bättre?" (provokerande/lindrande)',
      '"Påverkar det din sömn eller ditt humör?" (psykosocialt)',
    ];
  }

  // Lägg till arbetsrelaterad fråga baserat på arbetsbelastning
  if (workload === 'Fysiskt tungt') {
    relevantExamples.push('"Blir det värre under eller efter arbetet?" (arbetsrelaterat)');
  } else if (workload === 'Stillasittande') {
    relevantExamples.push('"Blir det värre av att sitta länge vid datorn?" (stillasittande)');
  }

  return `SPECIFIKA EXEMPELFRÅGOR FÖR ${bodyPart.toUpperCase()}:
${relevantExamples.map(ex => `- ${ex}`).join('\n')}`;
};

/**
 * Generate individualized follow-up questions based on patient data
 * This replaces standardized questionnaires with AI-tailored questions
 */
export const generateFollowUpQuestions = async (
  assessment: Partial<UserAssessment>
): Promise<FollowUpQuestion[]> => {
  const cacheKey = generateCacheKey('followup-questions', {
    location: assessment.injuryLocation,
    type: assessment.injuryType,
    age: assessment.age,
    isPostOp: assessment.injuryType === InjuryType.POST_OP
  });

  const cached = getCached<FollowUpQuestion[]>(cacheKey);
  if (cached) return cached;

  const bodyPart = mapBodyPartToSwedish(assessment.injuryLocation || 'okänd');
  const injuryType = assessment.injuryType || 'kronisk';
  const age = assessment.age ? String(assessment.age) : 'okänd ålder';
  const activityLevel = assessment.activityLevel || 'okänd aktivitetsnivå';
  const workload = assessment.lifestyle?.workload || 'okänd';

  // ⚠️ POST-OP SÄKERHETSKONTEXT
  const isPostOp = assessment.injuryType === InjuryType.POST_OP;
  const surgeryDate = assessment.surgicalDetails?.date;
  const surgeryType = assessment.surgicalDetails?.procedure;
  const surgeonRestrictions = assessment.surgicalDetails?.surgeonRestrictions;
  const weightBearing = assessment.surgicalDetails?.weightBearing;

  let daysSinceSurgery: number | null = null;
  if (surgeryDate) {
    daysSinceSurgery = Math.floor((Date.now() - new Date(surgeryDate).getTime()) / (1000 * 60 * 60 * 24));
  }
  const isEarlyPostOp = isPostOp && daysSinceSurgery !== null && daysSinceSurgery < 42;

  // Bygg post-op säkerhetssektion
  let postOpSection = '';
  if (isPostOp) {
    postOpSection = `
⚠️ POSTOPERATIV PATIENT - KRITISKA SÄKERHETSREGLER:
- Operation: ${surgeryType || 'ej specificerat'}
- Operationsdatum: ${surgeryDate || 'ej angivet'}
- Dagar sedan operation: ${daysSinceSurgery !== null ? daysSinceSurgery : 'okänt'}
- Belastning: ${weightBearing || 'ej angivet'}
- Läkarrestriktioner: ${surgeonRestrictions || 'ej specificerat'}

${isEarlyPostOp ? `🚫 TIDIG POSTOPERATIV FAS (< 6 veckor):
- STÄLL INTE frågor om lyft, belastning eller styrketest
- STÄLL INTE frågor som "kan du lyfta armen" eller "hur tungt kan du bära"
- FOKUSERA på: Läkning, svullnad, smärtlindring, ROM (rörelseomfång)
- FRÅGA istället om: Hur mår du efter operationen? Hur fungerar såret? Svullnad?` : ''}

`;
  }

  // Bygg patientkontext för anpassade frågor
  const patientContext = buildPatientContext(assessment, bodyPart, age, activityLevel, workload, injuryType);

  const prompt = `Du är en erfaren fysioterapeut som träffar en patient för FÖRSTA bedömningssamtalet.

DENNA UNIKA PATIENT:
${patientContext}

DIN UPPGIFT:
Skapa 4 UNIKA frågor anpassade SPECIFIKT för denna patients situation.
Tänk: "Vad skulle JAG fråga just denna person för att förstå deras problem?"

${isEarlyPostOp ? `POSTOPERATIV PATIENT - anpassa frågorna till läkningsfasen:
- Fråga om hur återhämtningen går
- Eventuella komplikationer eller oro
- Följsamhet till restriktioner
🚫 INGA frågor om belastning, lyft eller styrka!` : `ANPASSA FRÅGORNA TILL:
- Patientens ÅLDER (${age}) - en 25-åring och 65-åring har olika behov
- Patientens ARBETE (${workload}) - vad gör de dagligen?
- Patientens AKTIVITETSNIVÅ (${activityLevel}) - vad vill de tillbaka till?
- SMÄRTANS LOKALISATION (${bodyPart}) - ställ anatomiskt relevanta frågor`}

VIKTIGT - INDIVIDUALISERA:
- KOPIERA INTE standardfrågor - skapa unika frågor för DENNA patient
- Referera till patientens specifika situation i frågorna
- Om patienten är ${activityLevel} - fråga om aktiviteter relevanta för den nivån
- Om patienten jobbar ${workload} - fråga om hur arbetet påverkas
${assessment.painLevel && assessment.painLevel >= 7 ? '- Hög smärtnivå - inkludera fråga om nattsömn/röda flaggor' : ''}

UNDVIK:
- Generiska frågor som passar alla
- "Berätta om din smärta" (för öppet)
- Frågor som inte ger kliniskt användbar information

Returnera ENDAST JSON-array:
[
  {
    "id": "q1",
    "question": "Frågans text",
    "type": "single_choice",
    "options": ["Alternativ 1", "Alternativ 2", "Alternativ 3"],
    "required": true,
    "category": "pain_character"
  }
]

SVARSTYPER:
- "single_choice" - ett val bland alternativ
- "multiple_choice" - flera val möjliga
- "slider" - numerisk skala (lägg till sliderConfig: {min, max, step, labels: {min, max}})
- "text" - fritext
- "yes_no" - ja/nej

KATEGORIER:
- "pain_character" - smärtans karaktär
- "function" - funktionsbegränsningar
- "history" - historik och förlopp
- "lifestyle" - livsstilsfaktorer
- "kinesiophobia" - tecken på rörelserädsla`;

  try {
    const text = await withRetry(() => generateContent(prompt, 0.6));
    if (!text) return getDefaultFollowUpQuestions(assessment);

    // Use safe JSON parse with fallback to empty array
    const questions = safeJSONParse<FollowUpQuestion[]>(text, []);

    // If parsing returned empty, use defaults
    if (!questions || questions.length === 0) {
      logger.warn("AI returned no valid questions, using defaults");
      return getDefaultFollowUpQuestions(assessment);
    }

    // Validate and ensure all required fields
    const validatedQuestions = questions
      .filter(q => q && typeof q.question === 'string' && q.question.length > 0)
      .map((q, idx) => ({
        id: q.id || `q${idx + 1}`,
        question: q.question,
        type: q.type || 'single_choice',
        options: Array.isArray(q.options) ? q.options : undefined,
        required: q.required ?? true,
        category: q.category,
        sliderConfig: q.sliderConfig
      }));

    // If no valid questions after filtering, use defaults
    if (validatedQuestions.length === 0) {
      logger.warn("No valid questions after filtering, using defaults");
      return getDefaultFollowUpQuestions(assessment);
    }

    setCache(cacheKey, validatedQuestions, 5 * 60 * 1000); // 5 min cache
    return validatedQuestions;
  } catch (e) {
    logger.error("Failed to generate follow-up questions", e);
    return getDefaultFollowUpQuestions(assessment);
  }
};

/**
 * Fallback questions if AI generation fails
 * Anpassade för post-op patienter
 */
const getDefaultFollowUpQuestions = (assessment: Partial<UserAssessment>): FollowUpQuestion[] => {
  const isPostOp = assessment.injuryType === InjuryType.POST_OP;
  const surgeryDate = assessment.surgicalDetails?.date;
  let daysSinceSurgery: number | null = null;
  if (surgeryDate) {
    daysSinceSurgery = Math.floor((Date.now() - new Date(surgeryDate).getTime()) / (1000 * 60 * 60 * 24));
  }
  const isEarlyPostOp = isPostOp && daysSinceSurgery !== null && daysSinceSurgery < 42;

  // Post-op säkra frågor för tidig fas
  if (isEarlyPostOp) {
    return [
      {
        id: 'postop_healing',
        question: 'Hur upplever du att läkningen går?',
        type: 'single_choice',
        options: ['Bra, som förväntat', 'Lite långsammare än jag hoppades', 'Osäker, svårt att bedöma', 'Har oro för komplikationer'],
        required: true,
        category: 'history'
      },
      {
        id: 'postop_wound',
        question: 'Hur ser operationsområdet ut?',
        type: 'single_choice',
        options: ['Läker fint, ingen rodnad', 'Lite svullet men normalt', 'Rodnad eller värme', 'Vätska eller problem med såret'],
        required: true,
        category: 'pain_character'
      },
      {
        id: 'postop_pain',
        question: 'Hur är smärtan jämfört med direkt efter operationen?',
        type: 'single_choice',
        options: ['Mycket bättre', 'Lite bättre', 'Ungefär samma', 'Värre'],
        required: true,
        category: 'pain_character'
      },
      {
        id: 'postop_compliance',
        question: 'Följer du läkarens instruktioner och restriktioner?',
        type: 'single_choice',
        options: ['Ja, till punkt och pricka', 'Mestadels', 'Ibland svårt', 'Osäker på vad som gäller'],
        required: true,
        category: 'lifestyle'
      }
    ];
  }

  // Vanliga frågor för icke-postop eller sen postop
  return [
    {
      id: 'default_duration',
      question: 'Hur länge har du haft dina besvär?',
      type: 'single_choice',
      options: ['Mindre än 6 veckor', '6 veckor - 3 månader', 'Mer än 3 månader', 'Mer än 1 år'],
      required: true,
      category: 'history'
    },
    {
      id: 'default_pain_behavior',
      question: 'När är smärtan som värst?',
      type: 'single_choice',
      options: ['På morgonen', 'Under dagen vid aktivitet', 'På kvällen', 'Konstant hela dagen', 'Varierar mycket'],
      required: true,
      category: 'pain_character'
    },
    {
      id: 'default_function',
      question: 'Vilka vardagsaktiviteter påverkas mest av dina besvär?',
      type: 'multiple_choice',
      options: ['Gå längre sträckor', 'Sitta länge', 'Stå länge', 'Lyfta saker', 'Sova', 'Träna/sport', 'Arbeta'],
      required: true,
      category: 'function'
    },
    {
      id: 'default_treatment',
      question: 'Har du testat någon behandling tidigare?',
      type: 'multiple_choice',
      options: ['Fysioterapi', 'Smärtstillande', 'Värme/kyla', 'Vila', 'Träning på egen hand', 'Inget'],
      required: false,
      category: 'history'
    }
  ];
};

/**
 * Determine if TSK-11 (kinesiophobia) questionnaire should be shown
 * Based on AI analysis of patient's answers
 */
export const shouldShowTSK11 = async (
  assessment: Partial<UserAssessment>,
  aiAnswers: AIQuestionAnswer[]
): Promise<{ show: boolean; reason: string }> => {
  // Quick heuristics first
  const chronicPain = assessment.painHistory?.duration === 'kronisk';
  const fearIndicators = aiAnswers.some(a => {
    const answer = String(a.answer).toLowerCase();
    return answer.includes('rädd') ||
           answer.includes('orolig') ||
           answer.includes('undviker') ||
           answer.includes('vågar inte');
  });

  // If clear indicators, no need for AI
  if (fearIndicators) {
    return { show: true, reason: 'Patienten visar tecken på rörelserädsla i sina svar' };
  }

  // For chronic pain, check with AI
  if (chronicPain) {
    const prompt = `Analysera dessa patientuppgifter och avgör om TSK-11 (rörelserädsla-formulär) bör visas.

PATIENTDATA:
- Skadtyp: ${assessment.injuryType}
- Smärtduration: ${assessment.painHistory?.duration || 'okänd'}
- Aktivitetsnivå: ${assessment.activityLevel}

PATIENTENS SVAR:
${aiAnswers.map(a => `- ${a.question}: ${a.answer}`).join('\n')}

TSK-11 BÖR VISAS OM:
- Patienten visar tecken på rörelserädsla eller undvikandebeteende
- Patienten verkar ha långvarig smärta med begränsad återhämtning
- Patienten har negativa förväntningar på rörelse

Svara ENDAST med JSON:
{
  "show": true/false,
  "reason": "Kort motivering"
}`;

    try {
      const text = await withRetry(() => generateContent(prompt, 0.3));
      if (text) {
        const defaultResult = { show: false, reason: 'Kunde inte analysera svar' };
        const result = safeJSONParse<{ show: boolean; reason: string }>(text, defaultResult);

        // Validate result has required fields
        if (typeof result.show === 'boolean' && typeof result.reason === 'string') {
          return result;
        }
      }
    } catch (e) {
      logger.error("Failed to determine TSK-11 need", e);
    }
  }

  return { show: false, reason: 'Inga tecken på rörelserädsla identifierade' };
};

/**
 * Generate a summary of the AI assessment for display before final analysis
 */
export const generateAssessmentSummary = async (
  assessment: Partial<UserAssessment>,
  aiAnswers: AIQuestionAnswer[]
): Promise<string> => {
  const prompt = `Sammanfatta denna patientbedömning i 3-4 korta punkter.

PATIENTDATA:
- Namn: ${assessment.name || 'Patienten'}
- Ålder: ${assessment.age}
- Skadelokalisation: ${assessment.injuryLocation}
- Skadtyp: ${assessment.injuryType}
- Smärtnivå: ${assessment.painLevel}/10
- Aktivitetsnivå: ${assessment.activityLevel}

PATIENTENS SVAR:
${aiAnswers.map(a => `- ${a.question}: ${a.answer}`).join('\n')}

Skriv en kort, professionell sammanfattning på svenska som:
1. Bekräftar huvudproblemet
2. Nämner viktiga faktorer från svaren
3. Ger en positiv ton om möjligheterna till förbättring

Max 4 meningar. Använd andra person (du/din).`;

  try {
    const text = await withRetry(() => generateContent(prompt, 0.5));
    return text || 'Jag har nu samlat in viktig information om din situation.';
  } catch (e) {
    logger.error("Failed to generate assessment summary", e);
    return 'Jag har nu samlat in viktig information om din situation.';
  }
};
