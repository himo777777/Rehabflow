/**
 * Exercise Chunk 007 - Sport-Specific Exercises
 * Contains 50 sport-specific exercises (IDs: ex_0291 - ex_0340)
 *
 * Categories:
 * - Running/Jogging (10)
 * - Swimming (8)
 * - Cycling (6)
 * - Tennis/Racket Sports (8)
 * - Golf (6)
 * - Soccer/Football (6)
 * - Skiing/Winter Sports (6)
 */

import { ExtendedExercise } from '../../types';
import { assignSourcesToExercise } from '../sources/scientificSources';

const generateId = (prefix: string, index: number): string =>
  `${prefix}_${index.toString().padStart(4, '0')}`;

// ============================================
// RUNNING/JOGGING EXERCISES (10)
// ============================================

const RUNNING_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 291),
    name: 'Löparknälyft',
    description: 'Dynamisk uppvärmning för löpare med höga knälyft för att aktivera höftböjare och förbättra löpsteg.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'high_knees',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 1.0,
      laterality: 'alternating'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '20 per ben',
    frequency: 'Före varje löppass',
    targetMuscles: ['höftböjare', 'quadriceps'],
    secondaryMuscles: ['vader', 'core'],
    ...assignSourcesToExercise('höft', 'rörlighet'),
    contraindications: ['akut höftsmärta', 'knäskada'],
    progressions: [generateId('ex', 292)],
    regressions: [],
    tips: 'Håll överkroppen upprätt och driv knäna uppåt med kraft.',
    keywords: ['löpning', 'uppvärmning', 'knälyft', 'dynamisk stretch']
  },
  {
    id: generateId('ex', 292),
    name: 'A-skip för löpare',
    description: 'Avancerad löpteknikövning som förbättrar koordination och explosivitet i löpsteget.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'plyometri',
    difficulty: 'Medel',
    animationId: 'a_skip',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 1.2,
      laterality: 'alternating'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '30 meter',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['höftböjare', 'vader'],
    secondaryMuscles: ['quadriceps', 'gluteus'],
    ...assignSourcesToExercise('höft', 'plyometri'),
    contraindications: ['akillestendinit', 'hälsporre'],
    progressions: [generateId('ex', 293)],
    regressions: [generateId('ex', 291)],
    tips: 'Fokusera på snabb fotisättning och hög knälyft.',
    keywords: ['löpning', 'teknik', 'a-skip', 'koordination']
  },
  {
    id: generateId('ex', 293),
    name: 'B-skip för löpare',
    description: 'Löpteknikövning med bensvep som förbättrar hamstringsaktivering och löpeffektivitet.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'plyometri',
    difficulty: 'Svår',
    animationId: 'b_skip',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 1.0,
      laterality: 'alternating'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '30 meter',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['hamstrings', 'höftböjare'],
    secondaryMuscles: ['vader', 'gluteus'],
    ...assignSourcesToExercise('höft', 'plyometri'),
    contraindications: ['hamstringsskada', 'ljumsksmärta'],
    progressions: [],
    regressions: [generateId('ex', 292)],
    tips: 'Svep benet aktivt nedåt och bakåt under kroppen.',
    keywords: ['löpning', 'teknik', 'b-skip', 'hamstrings']
  },
  {
    id: generateId('ex', 294),
    name: 'Löpare vadstretch mot vägg',
    description: 'Statisk stretch för vadmuskulaturen, viktig för löpare att förebygga vadkramper och akillesbesvär.',
    category: 'sport_specific',
    bodyArea: 'fotled',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'calf_wall_stretch',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['vägg'],
    sets: 2,
    reps: '30 sek per ben',
    frequency: 'Efter varje löppass',
    targetMuscles: ['gastrocnemius', 'soleus'],
    secondaryMuscles: ['akillessena'],
    ...assignSourcesToExercise('fotled', 'stretching'),
    contraindications: ['akut vadskada', 'akillesruptur'],
    progressions: [generateId('ex', 295)],
    regressions: [],
    tips: 'Håll hälen i golvet och pressa höften framåt.',
    keywords: ['löpning', 'stretch', 'vader', 'återhämtning']
  },
  {
    id: generateId('ex', 295),
    name: 'Excentrisk vadträning på trappsteg',
    description: 'Excentrisk stärkning av vadmuskulaturen, bevisat effektiv för att förebygga och behandla akillestendinopati hos löpare.',
    category: 'sport_specific',
    bodyArea: 'fotled',
    exerciseType: 'excentrisk',
    difficulty: 'Medel',
    animationId: 'eccentric_calf_drop',
    animationParams: {
      rangeOfMotion: 1.0,
      speed: 0.4,
      laterality: 'bilateral'
    },
    equipment: ['stepbräda'],
    sets: 3,
    reps: '15 per ben',
    frequency: 'Dagligen vid rehabilitering',
    targetMuscles: ['gastrocnemius', 'soleus'],
    secondaryMuscles: ['akillessena'],
    ...assignSourcesToExercise('fotled', 'excentrisk'),
    contraindications: ['akut akillesruptur', 'svår akillestendinit'],
    progressions: [],
    regressions: [generateId('ex', 294)],
    tips: 'Sänk långsamt (3-4 sekunder) och använd andra benet för att komma upp.',
    keywords: ['löpning', 'achilles', 'excentrisk', 'rehabilitering']
  },
  {
    id: generateId('ex', 296),
    name: 'IT-band foam rolling',
    description: 'Självmassage av IT-bandet för att lösa upp spänningar och förebygga löparknä.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'foam_roll_it_band',
    animationParams: {
      rangeOfMotion: 0.6,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['foam_roller'],
    sets: 1,
    reps: '60 sek per sida',
    frequency: 'Efter varje löppass',
    targetMuscles: ['tensor fasciae latae', 'IT-band'],
    secondaryMuscles: ['vastus lateralis'],
    ...assignSourcesToExercise('knä', 'rörlighet'),
    contraindications: ['akut inflammation', 'blödningsrubbning'],
    progressions: [],
    regressions: [],
    tips: 'Rulla långsamt och pausa på ömma punkter.',
    keywords: ['löpning', 'IT-band', 'foam rolling', 'återhämtning']
  },
  {
    id: generateId('ex', 297),
    name: 'Stående höftböjarstretch för löpare',
    description: 'Djup stretch av höftböjarna som ofta blir förkortade hos löpare.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'standing_hip_flexor_stretch',
    animationParams: {
      rangeOfMotion: 0.75,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 2,
    reps: '30 sek per sida',
    frequency: 'Dagligen',
    targetMuscles: ['iliopsoas', 'rectus femoris'],
    secondaryMuscles: ['tensor fasciae latae'],
    ...assignSourcesToExercise('höft', 'stretching'),
    contraindications: ['höftledsartros i akut fas'],
    progressions: [],
    regressions: [],
    tips: 'Spänn sätesmuskeln och skjut höften framåt för djupare stretch.',
    keywords: ['löpning', 'stretch', 'höftböjare', 'flexibilitet']
  },
  {
    id: generateId('ex', 298),
    name: 'Singelbenhopp för löpare',
    description: 'Plyometrisk övning som bygger explosiv kraft och stabilitet för löpning.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'plyometri',
    difficulty: 'Svår',
    animationId: 'single_leg_hop',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 1.3,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '10 per ben',
    frequency: '2 gånger/vecka',
    targetMuscles: ['quadriceps', 'gluteus'],
    secondaryMuscles: ['vader', 'hamstrings'],
    ...assignSourcesToExercise('knä', 'plyometri'),
    contraindications: ['knäskada', 'akut fotledsskada'],
    progressions: [],
    regressions: [generateId('ex', 291)],
    tips: 'Landa mjukt med lätt böjt knä och håll balansen.',
    keywords: ['löpning', 'plyometri', 'explosivitet', 'styrka']
  },
  {
    id: generateId('ex', 299),
    name: 'Löpare glute bridge marsch',
    description: 'Dynamisk gluteusaktivering som förbättrar höftstabilitet vid löpning.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'glute_bridge_march',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.7,
      laterality: 'alternating'
    },
    equipment: ['matta'],
    sets: 3,
    reps: '10 per ben',
    frequency: '3 gånger/vecka',
    targetMuscles: ['gluteus maximus', 'gluteus medius'],
    secondaryMuscles: ['hamstrings', 'core'],
    ...assignSourcesToExercise('höft', 'stärkning'),
    contraindications: ['akut ryggsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Håll höften högt och stabil när du lyfter benet.',
    keywords: ['löpning', 'gluteus', 'stabilitet', 'aktivering']
  },
  {
    id: generateId('ex', 300),
    name: 'Dynamisk hamstringsstretch för löpare',
    description: 'Aktiv stretch som förbereder hamstrings för löpning utan att minska muskelkraft.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'dynamic_hamstring_sweep',
    animationParams: {
      rangeOfMotion: 0.75,
      speed: 0.8,
      laterality: 'alternating'
    },
    equipment: ['ingen'],
    sets: 2,
    reps: '10 per ben',
    frequency: 'Före varje löppass',
    targetMuscles: ['hamstrings'],
    secondaryMuscles: ['gluteus', 'ländrygg'],
    ...assignSourcesToExercise('knä', 'rörlighet'),
    contraindications: ['akut hamstringsskada'],
    progressions: [],
    regressions: [],
    tips: 'Håll ryggen rak och för benet i en kontrollerad sveprörelse.',
    keywords: ['löpning', 'hamstrings', 'dynamisk stretch', 'uppvärmning']
  }
];

// ============================================
// SWIMMING EXERCISES (8)
// ============================================

const SWIMMING_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 301),
    name: 'Simmare skulderrotation med band',
    description: 'Extern och intern rotation för att stärka rotatorkuffen och förebygga simmaraxel.',
    category: 'sport_specific',
    bodyArea: 'axel',
    exerciseType: 'stärkning',
    difficulty: 'Lätt',
    animationId: 'banded_shoulder_rotation',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['gummiband'],
    sets: 3,
    reps: '15 per riktning',
    frequency: '3 gånger/vecka',
    targetMuscles: ['infraspinatus', 'teres minor'],
    secondaryMuscles: ['supraspinatus', 'subscapularis'],
    ...assignSourcesToExercise('axel', 'stärkning'),
    contraindications: ['akut rotatorkuffskada', 'skulderinstabilitet'],
    progressions: [generateId('ex', 302)],
    regressions: [],
    tips: 'Håll armbågen intill kroppen och rotera endast underarmen.',
    keywords: ['simning', 'axel', 'rotatorkuff', 'prevention']
  },
  {
    id: generateId('ex', 302),
    name: 'Y-T-W-L skulderaktivering',
    description: 'Omfattande skulderaktivering som tränar alla delar av skulderbladsmuskulaturen, viktig för simmare.',
    category: 'sport_specific',
    bodyArea: 'axel',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'prone_ytwl',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '10 av varje',
    frequency: '3 gånger/vecka',
    targetMuscles: ['trapezius', 'rhomboideus'],
    secondaryMuscles: ['deltoideus posterior', 'rotatorkuff'],
    ...assignSourcesToExercise('axel', 'stärkning'),
    contraindications: ['akut axelsmärta', 'nackskada'],
    progressions: [generateId('ex', 303)],
    regressions: [generateId('ex', 301)],
    tips: 'Håll huvudet neutralt och lyft armarna långsamt.',
    keywords: ['simning', 'skulderblad', 'aktivering', 'postur']
  },
  {
    id: generateId('ex', 303),
    name: 'Simmare latissimus stretch',
    description: 'Stretch av latissimus dorsi för att förbättra skulderrörlighet och simteknik.',
    category: 'sport_specific',
    bodyArea: 'axel',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'lat_stretch_wall',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['vägg'],
    sets: 2,
    reps: '30 sek per sida',
    frequency: 'Dagligen',
    targetMuscles: ['latissimus dorsi'],
    secondaryMuscles: ['teres major', 'serratus anterior'],
    ...assignSourcesToExercise('axel', 'stretching'),
    contraindications: ['skulderinstabilitet'],
    progressions: [],
    regressions: [],
    tips: 'Sjunk ner i höften för att fördjupa stretchen.',
    keywords: ['simning', 'stretch', 'latissimus', 'rörlighet']
  },
  {
    id: generateId('ex', 304),
    name: 'Simmare fotledsmobilitet',
    description: 'Förbättrar fotledsflektion för effektivare spark i simning.',
    category: 'sport_specific',
    bodyArea: 'fotled',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'ankle_plantarflexion_stretch',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 0.4,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '30 sek',
    frequency: 'Dagligen',
    targetMuscles: ['tibialis anterior'],
    secondaryMuscles: ['extensor digitorum longus'],
    ...assignSourcesToExercise('fotled', 'rörlighet'),
    contraindications: ['fotledsfraktur'],
    progressions: [],
    regressions: [],
    tips: 'Sitt på hälarna och luta dig bakåt för att öka stretchen.',
    keywords: ['simning', 'fotled', 'mobilitet', 'spark']
  },
  {
    id: generateId('ex', 305),
    name: 'Thorax rotation för simmare',
    description: 'Förbättrar bålrotation som är avgörande för effektiv crawlteknik.',
    category: 'sport_specific',
    bodyArea: 'övre_rygg',
    exerciseType: 'rörlighet',
    difficulty: 'Medel',
    animationId: 'open_book_rotation',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '10 per sida',
    frequency: '3 gånger/vecka',
    targetMuscles: ['thorax rotatorer', 'obliques'],
    secondaryMuscles: ['erector spinae', 'intercostals'],
    ...assignSourcesToExercise('övre_rygg', 'rörlighet'),
    contraindications: ['diskbråck', 'akut ryggsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Håll knäna ihop och rotera endast överkroppen.',
    keywords: ['simning', 'rotation', 'thorax', 'teknik']
  },
  {
    id: generateId('ex', 306),
    name: 'Simmare skulderflexion i sidoläge',
    description: 'Isolerad skulderflexion som simulerar armtaget i crawl.',
    category: 'sport_specific',
    bodyArea: 'axel',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'sidelying_shoulder_flexion',
    animationParams: {
      rangeOfMotion: 1.0,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['hantel'],
    sets: 3,
    reps: '12 per arm',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['deltoideus anterior', 'pectoralis major'],
    secondaryMuscles: ['serratus anterior', 'biceps'],
    ...assignSourcesToExercise('axel', 'stärkning'),
    contraindications: ['impingement syndrom'],
    progressions: [],
    regressions: [generateId('ex', 301)],
    tips: 'Håll armbågen lätt böjd genom hela rörelsen.',
    keywords: ['simning', 'skulder', 'styrka', 'crawl']
  },
  {
    id: generateId('ex', 307),
    name: 'Core stabilitet för simmare',
    description: 'Stärker core för bättre strömlinjeform och kraftöverföring i vattnet.',
    category: 'sport_specific',
    bodyArea: 'bål',
    exerciseType: 'stabilitet',
    difficulty: 'Medel',
    animationId: 'deadbug_progression',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.5,
      laterality: 'alternating'
    },
    equipment: ['matta'],
    sets: 3,
    reps: '10 per sida',
    frequency: '3 gånger/vecka',
    targetMuscles: ['transversus abdominis', 'rectus abdominis'],
    secondaryMuscles: ['obliques', 'diafragma'],
    ...assignSourcesToExercise('bål', 'stabilitet'),
    contraindications: ['akut ländryggsmärta'],
    progressions: [generateId('ex', 308)],
    regressions: [],
    tips: 'Håll ryggen platt mot golvet genom hela rörelsen.',
    keywords: ['simning', 'core', 'stabilitet', 'strömlinjeform']
  },
  {
    id: generateId('ex', 308),
    name: 'Simmare streamline stretch',
    description: 'Fullkroppsstretch som förbättrar strömlinjeposition vid start och vändning.',
    category: 'sport_specific',
    bodyArea: 'hel_kropp',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'streamline_stretch',
    animationParams: {
      rangeOfMotion: 1.0,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '30 sek',
    frequency: 'Före och efter simning',
    targetMuscles: ['latissimus dorsi', 'triceps'],
    secondaryMuscles: ['shoulders', 'core'],
    ...assignSourcesToExercise('hel_kropp', 'stretching'),
    contraindications: ['skulderinstabilitet'],
    progressions: [],
    regressions: [],
    tips: 'Sträck ut hela kroppen som en pil från fingertoppar till tår.',
    keywords: ['simning', 'stretch', 'streamline', 'helkropp']
  }
];

// ============================================
// CYCLING EXERCISES (6)
// ============================================

const CYCLING_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 309),
    name: 'Cyklist quadriceps stretch',
    description: 'Djup stretch av quadriceps som ofta blir förkortade och spända hos cyklister.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'lying_quad_stretch',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '45 sek per ben',
    frequency: 'Efter varje cykelpass',
    targetMuscles: ['quadriceps', 'rectus femoris'],
    secondaryMuscles: ['höftböjare'],
    ...assignSourcesToExercise('knä', 'stretching'),
    contraindications: ['akut knäskada'],
    progressions: [],
    regressions: [],
    tips: 'Håll knäna ihop och pressa höften framåt.',
    keywords: ['cykling', 'stretch', 'quadriceps', 'återhämtning']
  },
  {
    id: generateId('ex', 310),
    name: 'Cyklist höftöppnare',
    description: 'Motverkar den framåtlutade positionen på cykeln genom att öppna höftböjarna.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stretching',
    difficulty: 'Medel',
    animationId: 'kneeling_hip_flexor_stretch',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '60 sek per sida',
    frequency: 'Dagligen',
    targetMuscles: ['iliopsoas', 'rectus femoris'],
    secondaryMuscles: ['tensor fasciae latae'],
    ...assignSourcesToExercise('höft', 'stretching'),
    contraindications: ['knäskada'],
    progressions: [],
    regressions: [],
    tips: 'Aktivera gluteus och skjut höften framåt utan att svankt ryggen.',
    keywords: ['cykling', 'höft', 'stretch', 'postur']
  },
  {
    id: generateId('ex', 311),
    name: 'Cyklist ländryggsmobilitet',
    description: 'Förbättrar rörlighet i ländryggen som ofta blir stel av cykelposition.',
    category: 'sport_specific',
    bodyArea: 'ländrygg',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'cat_cow',
    animationParams: {
      rangeOfMotion: 0.75,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '10 cykler',
    frequency: 'Dagligen',
    targetMuscles: ['erector spinae', 'multifidus'],
    secondaryMuscles: ['rectus abdominis', 'obliques'],
    ...assignSourcesToExercise('ländrygg', 'rörlighet'),
    contraindications: ['akut diskbråck'],
    progressions: [],
    regressions: [],
    tips: 'Koordinera rörelsen med andningen - inandning i extension, utandning i flektion.',
    keywords: ['cykling', 'rygg', 'mobilitet', 'katt-ko']
  },
  {
    id: generateId('ex', 312),
    name: 'Singelbenpress för cyklister',
    description: 'Bygger unilateral benstyrka som är avgörande för effektiv trampning.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'single_leg_press',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['bänk'],
    sets: 3,
    reps: '12 per ben',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'vader'],
    ...assignSourcesToExercise('knä', 'stärkning'),
    contraindications: ['akut knäskada', 'patellatendinopati'],
    progressions: [],
    regressions: [],
    tips: 'Fokusera på att trycka genom hela foten och aktivera gluteus.',
    keywords: ['cykling', 'styrka', 'singelbens', 'kraft']
  },
  {
    id: generateId('ex', 313),
    name: 'Cyklist nackstretch',
    description: 'Lindrar nackspänningar från att titta uppåt i cykelposition.',
    category: 'sport_specific',
    bodyArea: 'nacke',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'neck_stretch_series',
    animationParams: {
      rangeOfMotion: 0.6,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 2,
    reps: '30 sek per riktning',
    frequency: 'Efter varje cykelpass',
    targetMuscles: ['trapezius övre', 'levator scapulae'],
    secondaryMuscles: ['sternocleidomastoideus', 'scaleni'],
    ...assignSourcesToExercise('nacke', 'stretching'),
    contraindications: ['nackskada', 'cervikal radikulopati'],
    progressions: [],
    regressions: [],
    tips: 'Stretch försiktigt utan att forcera rörelsen.',
    keywords: ['cykling', 'nacke', 'stretch', 'spänning']
  },
  {
    id: generateId('ex', 314),
    name: 'Cyklist gluteus medius stärkning',
    description: 'Stärker höftstabilisatorer för att förebygga knäproblem hos cyklister.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'sidelying_hip_abduction',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['matta', 'gummiband'],
    sets: 3,
    reps: '15 per sida',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['gluteus medius', 'gluteus minimus'],
    secondaryMuscles: ['tensor fasciae latae'],
    ...assignSourcesToExercise('höft', 'stärkning'),
    contraindications: ['höftimpingement'],
    progressions: [],
    regressions: [],
    tips: 'Håll höften stabil och lyft benet rakt uppåt, inte framåt.',
    keywords: ['cykling', 'gluteus', 'stabilitet', 'knäprevention']
  }
];

// ============================================
// TENNIS/RACKET SPORTS EXERCISES (8)
// ============================================

const TENNIS_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 315),
    name: 'Tennis armbågsstretch',
    description: 'Stretch för att förebygga och lindra tennisarmbåge (lateral epikondylit).',
    category: 'sport_specific',
    bodyArea: 'armbåge',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'wrist_extensor_stretch',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '30 sek per arm',
    frequency: 'Före och efter tennis',
    targetMuscles: ['extensor carpi radialis brevis'],
    secondaryMuscles: ['extensor digitorum', 'extensor carpi ulnaris'],
    ...assignSourcesToExercise('armbåge', 'stretching'),
    contraindications: ['akut tennisarmbåge'],
    progressions: [generateId('ex', 316)],
    regressions: [],
    tips: 'Håll armen rak och böj handleden nedåt med andra handen.',
    keywords: ['tennis', 'armbåge', 'stretch', 'prevention']
  },
  {
    id: generateId('ex', 316),
    name: 'Excentrisk handledsstärkning för tennis',
    description: 'Excentrisk stärkning av underarmsmuskulaturen, evidensbaserad behandling för tennisarmbåge.',
    category: 'sport_specific',
    bodyArea: 'armbåge',
    exerciseType: 'excentrisk',
    difficulty: 'Medel',
    animationId: 'eccentric_wrist_extension',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.4,
      laterality: 'bilateral'
    },
    equipment: ['hantel'],
    sets: 3,
    reps: '15 per arm',
    frequency: 'Dagligen vid rehabilitering',
    targetMuscles: ['extensor carpi radialis brevis', 'extensor carpi radialis longus'],
    secondaryMuscles: ['extensor digitorum'],
    ...assignSourcesToExercise('armbåge', 'excentrisk'),
    contraindications: ['akut tennisarmbåge med svår smärta'],
    progressions: [],
    regressions: [generateId('ex', 315)],
    tips: 'Använd låg vikt och fokusera på långsam, kontrollerad sänkning.',
    keywords: ['tennis', 'armbåge', 'excentrisk', 'rehabilitering']
  },
  {
    id: generateId('ex', 317),
    name: 'Rotatorkuff styrka för tennis',
    description: 'Stärker rotatorkuffen för att hantera de höga belastningarna i tennisserven.',
    category: 'sport_specific',
    bodyArea: 'axel',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'external_rotation_90_90',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['gummiband'],
    sets: 3,
    reps: '15 per arm',
    frequency: '3 gånger/vecka',
    targetMuscles: ['infraspinatus', 'teres minor'],
    secondaryMuscles: ['supraspinatus', 'posterior deltoid'],
    ...assignSourcesToExercise('axel', 'stärkning'),
    contraindications: ['rotatorkuffskada', 'skulderinstabilitet'],
    progressions: [generateId('ex', 318)],
    regressions: [],
    tips: 'Håll armbågen i 90 grader och rotera endast underarmen.',
    keywords: ['tennis', 'axel', 'rotatorkuff', 'serve']
  },
  {
    id: generateId('ex', 318),
    name: 'Tennis serveträning med band',
    description: 'Imiterar serverörelsen med motstånd för att bygga kraft och uthållighet.',
    category: 'sport_specific',
    bodyArea: 'axel',
    exerciseType: 'stärkning',
    difficulty: 'Svår',
    animationId: 'banded_serve_motion',
    animationParams: {
      rangeOfMotion: 1.0,
      speed: 0.8,
      laterality: 'bilateral'
    },
    equipment: ['gummiband'],
    sets: 3,
    reps: '12 per arm',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['pectoralis major', 'anterior deltoid'],
    secondaryMuscles: ['triceps', 'serratus anterior', 'core'],
    ...assignSourcesToExercise('axel', 'stärkning'),
    contraindications: ['akut axelsmärta', 'impingement'],
    progressions: [],
    regressions: [generateId('ex', 317)],
    tips: 'Fokusera på hela kedjan från ben genom core till arm.',
    keywords: ['tennis', 'serve', 'styrka', 'teknik']
  },
  {
    id: generateId('ex', 319),
    name: 'Lateral förflyttning för tennis',
    description: 'Tränar snabb sidoförflyttning som är grundläggande i tennis.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'plyometri',
    difficulty: 'Medel',
    animationId: 'lateral_shuffle',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 1.2,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 4,
    reps: '10 meter x 4',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['gluteus medius', 'adductors'],
    secondaryMuscles: ['quadriceps', 'hamstrings', 'vader'],
    ...assignSourcesToExercise('knä', 'plyometri'),
    contraindications: ['akut knäskada', 'fotledsskada'],
    progressions: [generateId('ex', 320)],
    regressions: [],
    tips: 'Håll låg position och tryck iväg med yttre foten.',
    keywords: ['tennis', 'fotarbete', 'lateral', 'snabbhet']
  },
  {
    id: generateId('ex', 320),
    name: 'Split-step träning för tennis',
    description: 'Tränar den explosiva split-step som används vid mottagning i tennis.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'plyometri',
    difficulty: 'Svår',
    animationId: 'split_step_drill',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 1.3,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '15',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['quadriceps', 'gastrocnemius'],
    secondaryMuscles: ['gluteus', 'hamstrings'],
    ...assignSourcesToExercise('knä', 'plyometri'),
    contraindications: ['akut knäskada', 'vadskada'],
    progressions: [],
    regressions: [generateId('ex', 319)],
    tips: 'Land på framfötterna och var redo att röra dig i alla riktningar.',
    keywords: ['tennis', 'split-step', 'reaktion', 'explosivitet']
  },
  {
    id: generateId('ex', 321),
    name: 'Core rotation för tennis',
    description: 'Stärker rotationsmuskulaturen som driver kraft i forehand och backhand.',
    category: 'sport_specific',
    bodyArea: 'bål',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'cable_rotation',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 0.8,
      laterality: 'bilateral'
    },
    equipment: ['gummiband'],
    sets: 3,
    reps: '12 per sida',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['obliques', 'transversus abdominis'],
    secondaryMuscles: ['erector spinae', 'gluteus'],
    ...assignSourcesToExercise('bål', 'stärkning'),
    contraindications: ['akut ryggsmärta', 'diskbråck'],
    progressions: [],
    regressions: [],
    tips: 'Rotera från höften och håll armarna relativt raka.',
    keywords: ['tennis', 'core', 'rotation', 'kraft']
  },
  {
    id: generateId('ex', 322),
    name: 'Handgreppsstyrka för tennis',
    description: 'Stärker greppet för bättre racktkontroll och prevention av armbågsskador.',
    category: 'sport_specific',
    bodyArea: 'handled',
    exerciseType: 'stärkning',
    difficulty: 'Lätt',
    animationId: 'grip_strengthening',
    animationParams: {
      rangeOfMotion: 1.0,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['träningsboll'],
    sets: 3,
    reps: '20 per hand',
    frequency: '3-4 gånger/vecka',
    targetMuscles: ['flexor digitorum', 'flexor pollicis'],
    secondaryMuscles: ['handledsmuskler'],
    ...assignSourcesToExercise('handled', 'stärkning'),
    contraindications: ['karpaltunnelsyndrom', 'triggerfinger'],
    progressions: [],
    regressions: [],
    tips: 'Krama bollen hårt och håll några sekunder innan du släpper.',
    keywords: ['tennis', 'grepp', 'styrka', 'racket']
  }
];

// ============================================
// GOLF EXERCISES (6)
// ============================================

const GOLF_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 323),
    name: 'Golf thorax rotation',
    description: 'Förbättrar bröstryggsmobilitet för längre och mer kontrollerad golfsving.',
    category: 'sport_specific',
    bodyArea: 'övre_rygg',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'seated_thoracic_rotation',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['stol'],
    sets: 2,
    reps: '10 per sida',
    frequency: 'Dagligen',
    targetMuscles: ['thorax rotatorer', 'obliques'],
    secondaryMuscles: ['erector spinae', 'multifidus'],
    ...assignSourcesToExercise('övre_rygg', 'rörlighet'),
    contraindications: ['akut ryggsmärta'],
    progressions: [generateId('ex', 324)],
    regressions: [],
    tips: 'Håll höften stilla och rotera endast överkroppen.',
    keywords: ['golf', 'thorax', 'rotation', 'sving']
  },
  {
    id: generateId('ex', 324),
    name: 'Golf höftrotation stretch',
    description: 'Ökar höftrörlighet för bättre kraftöverföring i golfsvingen.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stretching',
    difficulty: 'Medel',
    animationId: 'figure_four_stretch',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '45 sek per sida',
    frequency: 'Före och efter golf',
    targetMuscles: ['piriformis', 'gluteus medius'],
    secondaryMuscles: ['hip external rotators'],
    ...assignSourcesToExercise('höft', 'stretching'),
    contraindications: ['höftledsartros'],
    progressions: [],
    regressions: [generateId('ex', 323)],
    tips: 'Dra knät mot motsatt axel för djupare stretch.',
    keywords: ['golf', 'höft', 'rotation', 'stretch']
  },
  {
    id: generateId('ex', 325),
    name: 'Golf anti-rotation press',
    description: 'Bygger core-stabilitet som skyddar ryggen under den roterande belastningen i golf.',
    category: 'sport_specific',
    bodyArea: 'bål',
    exerciseType: 'stabilitet',
    difficulty: 'Medel',
    animationId: 'pallof_press',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['gummiband'],
    sets: 3,
    reps: '10 per sida',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['transversus abdominis', 'obliques'],
    secondaryMuscles: ['erector spinae', 'quadratus lumborum'],
    ...assignSourcesToExercise('bål', 'stabilitet'),
    contraindications: ['akut ländryggsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Håll kroppen stabil och tryck bandet rakt framåt.',
    keywords: ['golf', 'core', 'stabilitet', 'ryggskydd']
  },
  {
    id: generateId('ex', 326),
    name: 'Golf handledsstretch',
    description: 'Stretch för handlederna som utsätts för stor belastning vid impact.',
    category: 'sport_specific',
    bodyArea: 'handled',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    animationId: 'wrist_flexor_extensor_stretch',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 2,
    reps: '30 sek per position',
    frequency: 'Före och efter golf',
    targetMuscles: ['flexor carpi', 'extensor carpi'],
    secondaryMuscles: ['finger flexors/extensors'],
    ...assignSourcesToExercise('handled', 'stretching'),
    contraindications: ['akut handled skada'],
    progressions: [],
    regressions: [],
    tips: 'Stretch försiktigt i alla riktningar - böjning, sträckning, deviation.',
    keywords: ['golf', 'handled', 'stretch', 'grepp']
  },
  {
    id: generateId('ex', 327),
    name: 'Golf gluteus aktivering',
    description: 'Aktiverar gluteus för stabil bas och kraftfull höftrotation i svingen.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'clamshell_with_band',
    animationParams: {
      rangeOfMotion: 0.75,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['matta', 'gummiband'],
    sets: 3,
    reps: '15 per sida',
    frequency: '3 gånger/vecka',
    targetMuscles: ['gluteus medius', 'gluteus minimus'],
    secondaryMuscles: ['tensor fasciae latae'],
    ...assignSourcesToExercise('höft', 'stärkning'),
    contraindications: ['akut höftsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Håll fötterna ihop och lyft endast knät.',
    keywords: ['golf', 'gluteus', 'aktivering', 'kraft']
  },
  {
    id: generateId('ex', 328),
    name: 'Golf ländryggsmobilitet',
    description: 'Förebygger ryggsmärta genom att förbättra ländryggens rörlighet.',
    category: 'sport_specific',
    bodyArea: 'ländrygg',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'prone_press_up',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.4,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 2,
    reps: '10',
    frequency: 'Dagligen',
    targetMuscles: ['erector spinae'],
    secondaryMuscles: ['multifidus', 'quadratus lumborum'],
    ...assignSourcesToExercise('ländrygg', 'rörlighet'),
    contraindications: ['spinal stenos', 'spondylolisthesis'],
    progressions: [],
    regressions: [],
    tips: 'Håll höften i golvet och pressa endast överkroppen uppåt.',
    keywords: ['golf', 'rygg', 'mobilitet', 'extension']
  }
];

// ============================================
// SOCCER/FOOTBALL EXERCISES (6)
// ============================================

const SOCCER_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 329),
    name: 'FIFA 11+ knäböj',
    description: 'Kontrollerad knäböj från FIFA:s skadepreventionsprogram för fotbollsspelare.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'controlled_squat',
    animationParams: {
      rangeOfMotion: 0.85,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '10',
    frequency: 'Före varje träning',
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'core'],
    ...assignSourcesToExercise('knä', 'stärkning'),
    contraindications: ['akut knäskada'],
    progressions: [generateId('ex', 330)],
    regressions: [],
    tips: 'Håll knäna i linje med tårna och gå ner långsamt.',
    keywords: ['fotboll', 'fifa11', 'knäböj', 'prevention']
  },
  {
    id: generateId('ex', 330),
    name: 'Nordic hamstrings',
    description: 'Excentrisk hamstringsövning som minskar risken för hamstringsskador med upp till 70%.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'excentrisk',
    difficulty: 'Svår',
    animationId: 'nordic_hamstring_curl',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 0.3,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 3,
    reps: '5-8',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['hamstrings'],
    secondaryMuscles: ['gastrocnemius', 'gluteus'],
    ...assignSourcesToExercise('knä', 'excentrisk'),
    contraindications: ['akut hamstringsskada', 'knäsmärta'],
    progressions: [],
    regressions: [generateId('ex', 329)],
    tips: 'Kontrollera nedfallet så länge som möjligt, använd händerna för att fånga dig.',
    keywords: ['fotboll', 'hamstrings', 'excentrisk', 'skadeprevention']
  },
  {
    id: generateId('ex', 331),
    name: 'Adduktor stärkning för fotboll',
    description: 'Stärker ljumsken som är ett vanligt skadeområde hos fotbollsspelare.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'copenhagen_adductor',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['bänk'],
    sets: 3,
    reps: '8 per sida',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['adductor longus', 'adductor magnus'],
    secondaryMuscles: ['adductor brevis', 'gracilis'],
    ...assignSourcesToExercise('höft', 'stärkning'),
    contraindications: ['akut ljumskskada'],
    progressions: [],
    regressions: [],
    tips: 'Håll kroppen rak och lyft med ljumsken, inte höften.',
    keywords: ['fotboll', 'ljumsk', 'adduktor', 'prevention']
  },
  {
    id: generateId('ex', 332),
    name: 'Fotboll balansstrid',
    description: 'Tränar dynamisk balans och kroppskontroll vid närkamper.',
    category: 'sport_specific',
    bodyArea: 'hel_kropp',
    exerciseType: 'stabilitet',
    difficulty: 'Medel',
    animationId: 'single_leg_balance_perturbation',
    animationParams: {
      rangeOfMotion: 0.6,
      speed: 0.7,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '30 sek per ben',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['gluteus medius', 'tibialis anterior'],
    secondaryMuscles: ['core', 'quadriceps', 'peroneus'],
    ...assignSourcesToExercise('hel_kropp', 'stabilitet'),
    contraindications: ['akut fotledsskada'],
    progressions: [],
    regressions: [],
    tips: 'Öva med en partner som försiktigt puffar dig ur balans.',
    keywords: ['fotboll', 'balans', 'stabilitet', 'närkamp']
  },
  {
    id: generateId('ex', 333),
    name: 'Plyometriska hopp för fotboll',
    description: 'Bygger explosivitet för sprinter och hopp i fotboll.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'plyometri',
    difficulty: 'Svår',
    animationId: 'box_jump',
    animationParams: {
      rangeOfMotion: 1.0,
      speed: 1.2,
      laterality: 'bilateral'
    },
    equipment: ['stepbräda'],
    sets: 4,
    reps: '6',
    frequency: '2 gånger/vecka',
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'vader', 'core'],
    ...assignSourcesToExercise('knä', 'plyometri'),
    contraindications: ['knäskada', 'fotledsskada', 'ryggsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Land mjukt med knäna lätt böjda och kliv ner kontrollerat.',
    keywords: ['fotboll', 'plyometri', 'hopp', 'explosivitet']
  },
  {
    id: generateId('ex', 334),
    name: 'Fotboll höftböjarstretch dynamisk',
    description: 'Dynamisk höftböjarstretch som en del av uppvärmningen före match.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    animationId: 'walking_lunge_twist',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.7,
      laterality: 'alternating'
    },
    equipment: ['ingen'],
    sets: 2,
    reps: '10 per sida',
    frequency: 'Före varje träning/match',
    targetMuscles: ['iliopsoas', 'rectus femoris'],
    secondaryMuscles: ['obliques', 'quadriceps', 'gluteus'],
    ...assignSourcesToExercise('höft', 'rörlighet'),
    contraindications: ['akut höftsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Ta långa steg och rotera överkroppen mot det främre knät.',
    keywords: ['fotboll', 'uppvärmning', 'höft', 'dynamisk']
  }
];

// ============================================
// SKIING/WINTER SPORTS EXERCISES (6)
// ============================================

const SKIING_EXERCISES: ExtendedExercise[] = [
  {
    id: generateId('ex', 335),
    name: 'Skidåkare väggsitta',
    description: 'Isometrisk quadricepsträning som simulerar skidpositionen.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'isometrisk',
    difficulty: 'Medel',
    animationId: 'wall_sit',
    animationParams: {
      rangeOfMotion: 0.5,
      speed: 0.1,
      laterality: 'bilateral'
    },
    equipment: ['vägg'],
    sets: 3,
    reps: '45-60 sek',
    frequency: '3-4 gånger/vecka',
    targetMuscles: ['quadriceps'],
    secondaryMuscles: ['gluteus', 'core'],
    ...assignSourcesToExercise('knä', 'isometrisk'),
    contraindications: ['patellatendinopati', 'artros'],
    progressions: [generateId('ex', 336)],
    regressions: [],
    tips: 'Håll knäna i 90 grader och ryggen platt mot väggen.',
    keywords: ['skidåkning', 'quadriceps', 'isometrisk', 'uthållighet']
  },
  {
    id: generateId('ex', 336),
    name: 'Skidåkare singelbenknäböj',
    description: 'Bygger unilateral benstyrka för bättre kontroll i backen.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'stärkning',
    difficulty: 'Svår',
    animationId: 'pistol_squat_assisted',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 0.5,
      laterality: 'bilateral'
    },
    equipment: ['stol'],
    sets: 3,
    reps: '8 per ben',
    frequency: '2-3 gånger/vecka',
    targetMuscles: ['quadriceps', 'gluteus maximus'],
    secondaryMuscles: ['hamstrings', 'hip stabilizers'],
    ...assignSourcesToExercise('knä', 'stärkning'),
    contraindications: ['akut knäskada'],
    progressions: [],
    regressions: [generateId('ex', 335)],
    tips: 'Använd stol eller vägg för balans tills du byggt upp styrkan.',
    keywords: ['skidåkning', 'singelbens', 'styrka', 'balans']
  },
  {
    id: generateId('ex', 337),
    name: 'Skidåkare laterala hopp',
    description: 'Plyometrisk övning som tränar sidorörelser liknande svängningar i slalom.',
    category: 'sport_specific',
    bodyArea: 'knä',
    exerciseType: 'plyometri',
    difficulty: 'Svår',
    animationId: 'lateral_bounds',
    animationParams: {
      rangeOfMotion: 0.9,
      speed: 1.2,
      laterality: 'bilateral'
    },
    equipment: ['ingen'],
    sets: 3,
    reps: '10 per sida',
    frequency: '2 gånger/vecka',
    targetMuscles: ['gluteus medius', 'quadriceps'],
    secondaryMuscles: ['hamstrings', 'adductors', 'vader'],
    ...assignSourcesToExercise('knä', 'plyometri'),
    contraindications: ['knäskada', 'fotledsskada'],
    progressions: [],
    regressions: [],
    tips: 'Land stabilt på ett ben och kontrollera knät innan nästa hopp.',
    keywords: ['skidåkning', 'plyometri', 'lateral', 'slalom']
  },
  {
    id: generateId('ex', 338),
    name: 'Skidåkare core rotation',
    description: 'Stärker rotationsmuskulaturen för bättre vridning och stabilitet vid svängningar.',
    category: 'sport_specific',
    bodyArea: 'bål',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'russian_twist',
    animationParams: {
      rangeOfMotion: 0.8,
      speed: 0.7,
      laterality: 'bilateral'
    },
    equipment: ['matta'],
    sets: 3,
    reps: '15 per sida',
    frequency: '3 gånger/vecka',
    targetMuscles: ['obliques', 'transversus abdominis'],
    secondaryMuscles: ['rectus abdominis', 'hip flexors'],
    ...assignSourcesToExercise('bål', 'stärkning'),
    contraindications: ['akut ryggsmärta', 'diskbråck'],
    progressions: [],
    regressions: [],
    tips: 'Håll ryggen rak och rotera från midjan, inte axlarna.',
    keywords: ['skidåkning', 'core', 'rotation', 'stabilitet']
  },
  {
    id: generateId('ex', 339),
    name: 'Skidåkare fotledsstabilitet',
    description: 'Tränar fotledsstabilitet för bättre känsel och kontroll i pjäxorna.',
    category: 'sport_specific',
    bodyArea: 'fotled',
    exerciseType: 'stabilitet',
    difficulty: 'Medel',
    animationId: 'single_leg_balance_unstable',
    animationParams: {
      rangeOfMotion: 0.5,
      speed: 0.4,
      laterality: 'bilateral'
    },
    equipment: ['bosu'],
    sets: 3,
    reps: '30 sek per ben',
    frequency: '3 gånger/vecka',
    targetMuscles: ['peroneus', 'tibialis anterior'],
    secondaryMuscles: ['gastrocnemius', 'soleus'],
    ...assignSourcesToExercise('fotled', 'stabilitet'),
    contraindications: ['akut fotledsskada'],
    progressions: [],
    regressions: [],
    tips: 'Börja på plan yta innan du går över till bosu.',
    keywords: ['skidåkning', 'fotled', 'balans', 'proprioception']
  },
  {
    id: generateId('ex', 340),
    name: 'Skidåkare gluteus medius stärkning',
    description: 'Förebygger knäskador genom att stärka höftstabilisatorer.',
    category: 'sport_specific',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Medel',
    animationId: 'monster_walk',
    animationParams: {
      rangeOfMotion: 0.7,
      speed: 0.6,
      laterality: 'bilateral'
    },
    equipment: ['gummiband'],
    sets: 3,
    reps: '15 steg vardera riktningen',
    frequency: '3 gånger/vecka',
    targetMuscles: ['gluteus medius', 'gluteus minimus'],
    secondaryMuscles: ['tensor fasciae latae', 'hip rotators'],
    ...assignSourcesToExercise('höft', 'stärkning'),
    contraindications: ['akut höftsmärta'],
    progressions: [],
    regressions: [],
    tips: 'Håll lätt böjda knän och ta korta steg åt sidan.',
    keywords: ['skidåkning', 'gluteus', 'stabilitet', 'prevention']
  }
];

// ============================================
// COMBINE AND EXPORT
// ============================================

export const CHUNK_007_EXERCISES: ExtendedExercise[] = [
  ...RUNNING_EXERCISES,
  ...SWIMMING_EXERCISES,
  ...CYCLING_EXERCISES,
  ...TENNIS_EXERCISES,
  ...GOLF_EXERCISES,
  ...SOCCER_EXERCISES,
  ...SKIING_EXERCISES
];

export const CHUNK_007_META = {
  id: 7,
  name: 'Sport-Specific Exercises',
  description: 'Exercise programs tailored for specific sports including running, swimming, cycling, tennis, golf, soccer, and skiing.',
  count: CHUNK_007_EXERCISES.length,
  categories: ['sport_specific'],
  bodyAreas: [...new Set(CHUNK_007_EXERCISES.map(ex => ex.bodyArea))],
  sports: ['running', 'swimming', 'cycling', 'tennis', 'golf', 'soccer', 'skiing']
};

export default CHUNK_007_EXERCISES;
