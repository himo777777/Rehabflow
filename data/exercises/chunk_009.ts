/**
 * CHUNK 009: POSTOPERATIVA ÖVNINGAR
 *
 * Specialdesignade övningar för postoperativa patienter.
 * Dessa övningar har strikta säkerhetsrestriktioner och är anpassade
 * för specifika faser efter operation.
 *
 * KRITISK INFORMATION:
 * - Varje övning har postOpRestrictions som anger när den är lämplig
 * - minDaysSinceSurgery/maxDaysSinceSurgery definierar tidsramen
 * - allowedProcedures listar vilka operationer övningen passar för
 * - weightBearing anger kraven på viktbäring
 *
 * OPERATIONER SOM TÄCKS:
 * - Axelprotes (ex_0391-ex_0400)
 * - ACL-rekonstruktion (ex_0401-ex_0410)
 * - Höftprotes (ex_0411-ex_0420)
 * - Knäprotes (ex_0421-ex_0430)
 * - Ryggoperationer (ex_0431-ex_0440)
 */

import { ExtendedExercise } from '../../types';

// ============================================
// INTERFACES
// ============================================

interface PostOpRestrictions {
  minDaysSinceSurgery: number;
  maxDaysSinceSurgery?: number;
  allowedProcedures: string[];
  weightBearing: ('Avlastad' | 'Partiell' | 'Fullt')[];
  requiresSupervision: boolean;
  phase: 1 | 2 | 3;
}

interface PostOpExercise extends ExtendedExercise {
  postOpRestrictions: PostOpRestrictions;
}

// ============================================
// AXELPROTES - FAS 1 (0-6 veckor)
// ============================================

const shoulderProstFase1: PostOpExercise[] = [
  {
    id: 'ex_0391',
    name: 'Pendelövning (Codman)',
    description: 'Passiv axelrörelse med hjälp av tyngdkraften. Säker tidig mobilisering efter axelprotes.',
    category: 'mobility',
    bodyArea: 'axel',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 2,
    reps: '30 sekunder per riktning',
    frequency: '3-4 gånger dagligen',
    duration: 30,
    animationId: 'pendulum_shoulder',
    animationParams: { rangeOfMotion: 0.3, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['fysioterapeuterna_axel'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: ['instabilitet', 'luxation'],
    progressions: ['ex_0392'],
    regressions: [],
    tips: 'Luta dig framåt med stöd på ett bord. Låt armen hänga avslappnat och låt kroppen gunga fram och tillbaka.',
    risks: 'Undvik att aktivt lyfta armen. Rörelserna ska vara helt passiva.',
    keywords: ['pendel', 'codman', 'passiv', 'axel', 'postoperativ', 'fas1'],
    targetMuscles: [],
    postOpRestrictions: {
      minDaysSinceSurgery: 1,
      maxDaysSinceSurgery: 42,
      allowedProcedures: ['axelprotes', 'rotatorkuff_sutur', 'axelstabilisering'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0392',
    name: 'Fingerövningar postoperativ axel',
    description: 'Aktiv rörelse av fingrar och handled för att bibehålla cirkulation och förhindra stelhet.',
    category: 'mobility',
    bodyArea: 'handled',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 3,
    reps: '20 repetitioner',
    frequency: 'Varje timme vaket',
    animationId: 'finger_mobility',
    animationParams: { rangeOfMotion: 1.0, speed: 0.8, laterality: 'bilateral' },
    sourceIds: ['fysioterapeuterna_axel'],
    evidenceLevel: 'B',
    equipment: ['ingen'],
    contraindications: [],
    progressions: [],
    regressions: [],
    tips: 'Knyt och sträck fingrarna. Böj och sträck handleden. Håll armen stilla i mitella.',
    keywords: ['finger', 'handled', 'cirkulation', 'postoperativ'],
    targetMuscles: ['fingerflexorer', 'fingerextensorer'],
    postOpRestrictions: {
      minDaysSinceSurgery: 0,
      maxDaysSinceSurgery: 84,
      allowedProcedures: ['axelprotes', 'rotatorkuff_sutur', 'axelstabilisering'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0393',
    name: 'Armbågspump',
    description: 'Böj och sträck armbågen för att bibehålla rörlighet och cirkulation. Axeln hålls helt still.',
    category: 'mobility',
    bodyArea: 'armbåge',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 3,
    reps: '15 repetitioner',
    frequency: '4-5 gånger dagligen',
    animationId: 'elbow_flex_extend',
    animationParams: { rangeOfMotion: 1.0, speed: 0.7, laterality: 'bilateral' },
    sourceIds: ['fysioterapeuterna_axel'],
    evidenceLevel: 'B',
    equipment: ['ingen'],
    contraindications: [],
    progressions: [],
    regressions: [],
    tips: 'Håll överarmen stilla mot kroppen. Böj och sträck endast i armbågen.',
    keywords: ['armbåge', 'flexion', 'extension', 'postoperativ'],
    targetMuscles: ['biceps', 'triceps'],
    postOpRestrictions: {
      minDaysSinceSurgery: 0,
      maxDaysSinceSurgery: 84,
      allowedProcedures: ['axelprotes', 'rotatorkuff_sutur'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0394',
    name: 'Isometrisk scapula-aktivering',
    description: 'Lätt muskelaktivering av skulderbladsmuskulaturen utan rörelse i axelleden.',
    category: 'strength',
    bodyArea: 'axel',
    exerciseType: 'isometrisk',
    difficulty: 'Lätt',
    sets: 3,
    reps: '10 sekunder håll, 10 repetitioner',
    frequency: '3 gånger dagligen',
    animationId: 'scapula_isometric',
    animationParams: { rangeOfMotion: 0.1, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['fysioterapeuterna_axel'],
    evidenceLevel: 'B',
    equipment: ['ingen'],
    contraindications: ['smärta vid aktivering'],
    progressions: ['ex_0395'],
    regressions: [],
    tips: 'Kläm ihop skulderbladen lätt mot varandra. Håll i 10 sekunder. Släpp långsamt.',
    keywords: ['scapula', 'isometrisk', 'skulderblad', 'postoperativ'],
    targetMuscles: ['rhomboideus', 'trapezius'],
    postOpRestrictions: {
      minDaysSinceSurgery: 7,
      maxDaysSinceSurgery: 56,
      allowedProcedures: ['axelprotes', 'rotatorkuff_sutur'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 1
    }
  }
];

// ============================================
// AXELPROTES - FAS 2 (6-12 veckor)
// ============================================

const shoulderProstFase2: PostOpExercise[] = [
  {
    id: 'ex_0395',
    name: 'Aktiv-assisterad flexion med käpp',
    description: 'Höj armen framåt med hjälp av friska armen och en käpp. Gradvis ökning av egen aktivitet.',
    category: 'mobility',
    bodyArea: 'axel',
    exerciseType: 'rörlighet',
    difficulty: 'Medel',
    sets: 3,
    reps: '10-12 repetitioner',
    frequency: '3 gånger dagligen',
    animationId: 'assisted_shoulder_flexion',
    animationParams: { rangeOfMotion: 0.5, speed: 0.6, laterality: 'bilateral' },
    sourceIds: ['fysioterapeuterna_axel'],
    evidenceLevel: 'A',
    equipment: ['stång'],
    contraindications: ['smärta över 4/10', 'svullnad'],
    progressions: ['ex_0396'],
    regressions: ['ex_0391'],
    tips: 'Håll käppen med båda händerna. Låt den friska armen hjälpa den opererade uppåt till smärtfri gräns.',
    keywords: ['flexion', 'assisterad', 'käpp', 'axel', 'fas2'],
    targetMuscles: ['deltoideus', 'supraspinatus'],
    postOpRestrictions: {
      minDaysSinceSurgery: 42,
      maxDaysSinceSurgery: 84,
      allowedProcedures: ['axelprotes', 'rotatorkuff_sutur'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 2
    }
  },
  {
    id: 'ex_0396',
    name: 'Aktiv-assisterad abduktion i liggande',
    description: 'Höj armen utåt i liggande position med stöd av friska armen.',
    category: 'mobility',
    bodyArea: 'axel',
    exerciseType: 'rörlighet',
    difficulty: 'Medel',
    sets: 3,
    reps: '10-12 repetitioner',
    frequency: '2-3 gånger dagligen',
    animationId: 'assisted_shoulder_abduction',
    animationParams: { rangeOfMotion: 0.4, speed: 0.6, laterality: 'bilateral' },
    sourceIds: ['fysioterapeuterna_axel'],
    evidenceLevel: 'B',
    equipment: ['matta'],
    contraindications: ['smärta vid rörelse'],
    progressions: [],
    regressions: ['ex_0395'],
    tips: 'Ligg på rygg. Håll i handleden med friska handen och för armen utåt längs golvet.',
    keywords: ['abduktion', 'assisterad', 'liggande', 'axel'],
    targetMuscles: ['deltoideus', 'supraspinatus'],
    postOpRestrictions: {
      minDaysSinceSurgery: 49,
      maxDaysSinceSurgery: 84,
      allowedProcedures: ['axelprotes', 'rotatorkuff_sutur'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 2
    }
  }
];

// ============================================
// ACL-REKONSTRUKTION - FAS 1 (0-2 veckor)
// ============================================

const aclFase1: PostOpExercise[] = [
  {
    id: 'ex_0401',
    name: 'Quadriceps-aktivering (Quad sets)',
    description: 'Isometrisk spänning av främre lårmuskeln. Kritisk för att förhindra quadricepsatrofi.',
    category: 'strength',
    bodyArea: 'knä',
    exerciseType: 'isometrisk',
    difficulty: 'Lätt',
    sets: 4,
    reps: '10 sekunder håll, 15-20 repetitioner',
    frequency: 'Varje vaket timme',
    animationId: 'quad_sets',
    animationParams: { rangeOfMotion: 0.1, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['sof_acl'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: [],
    progressions: ['ex_0402'],
    regressions: [],
    tips: 'Ligg på rygg med benet rakt. Tryck knävecket mot underlaget genom att spänna lårmuskeln. Håll i 10 sekunder.',
    keywords: ['quadriceps', 'isometrisk', 'quad sets', 'acl', 'postoperativ'],
    targetMuscles: ['quadriceps'],
    postOpRestrictions: {
      minDaysSinceSurgery: 0,
      maxDaysSinceSurgery: 42,
      allowedProcedures: ['acl_rekonstruktion', 'menisk_operation', 'knaprotes'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0402',
    name: 'Häl-slides (Heel slides)',
    description: 'Kontrollerad knäböjning i liggande genom att glida hälen mot sätet.',
    category: 'mobility',
    bodyArea: 'knä',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 3,
    reps: '15-20 repetitioner',
    frequency: '4-5 gånger dagligen',
    animationId: 'heel_slides',
    animationParams: { rangeOfMotion: 0.5, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['sof_acl'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: ['kraftig svullnad'],
    progressions: ['ex_0403'],
    regressions: [],
    tips: 'Ligg på rygg. Glid hälen mot sätet så knät böjs. Gå bara så långt det känns bekvämt. Sträck tillbaka.',
    keywords: ['häl', 'slides', 'knäflexion', 'rom', 'acl'],
    targetMuscles: ['hamstrings', 'quadriceps'],
    postOpRestrictions: {
      minDaysSinceSurgery: 1,
      maxDaysSinceSurgery: 42,
      allowedProcedures: ['acl_rekonstruktion', 'menisk_operation'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0403',
    name: 'Straight leg raise (SLR)',
    description: 'Lyft hela benet rakt uppåt med spänd quadriceps. Stärker utan belastning på knäled.',
    category: 'strength',
    bodyArea: 'knä',
    exerciseType: 'stärkning',
    difficulty: 'Lätt',
    sets: 3,
    reps: '10-15 repetitioner',
    frequency: '3-4 gånger dagligen',
    animationId: 'straight_leg_raise',
    animationParams: { rangeOfMotion: 0.4, speed: 0.6, laterality: 'bilateral' },
    sourceIds: ['sof_acl'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: [],
    progressions: ['ex_0404'],
    regressions: ['ex_0401'],
    tips: 'Ligg på rygg. Spänn quadriceps först (quad set), lyft sedan hela benet 15-20 cm från golvet. Håll 3 sekunder.',
    keywords: ['slr', 'straight leg raise', 'benlyft', 'quadriceps'],
    targetMuscles: ['quadriceps', 'höftflexorer'],
    postOpRestrictions: {
      minDaysSinceSurgery: 3,
      maxDaysSinceSurgery: 56,
      allowedProcedures: ['acl_rekonstruktion', 'menisk_operation', 'knaprotes'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0404',
    name: 'Fotpump (Ankel cirklation)',
    description: 'Pumpa foten upp och ner för att förbättra blodcirkulationen och minska svullnad.',
    category: 'mobility',
    bodyArea: 'fotled',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 2,
    reps: '30 repetitioner',
    frequency: 'Varje vaket timme',
    animationId: 'ankle_pump',
    animationParams: { rangeOfMotion: 1.0, speed: 0.8, laterality: 'bilateral' },
    sourceIds: ['sof_acl'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: [],
    progressions: [],
    regressions: [],
    tips: 'Böj och sträck i fotleden kraftfullt. Cirkulera foten i båda riktningar.',
    keywords: ['fotpump', 'ankel', 'cirkulation', 'dvt-profylax'],
    targetMuscles: ['vadmuskulatur'],
    postOpRestrictions: {
      minDaysSinceSurgery: 0,
      maxDaysSinceSurgery: 14,
      allowedProcedures: ['acl_rekonstruktion', 'menisk_operation', 'knaprotes', 'hoftprotes'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  }
];

// ============================================
// HÖFTPROTES - FAS 1 (0-6 veckor)
// ============================================

const hipProstFase1: PostOpExercise[] = [
  {
    id: 'ex_0411',
    name: 'Isometrisk gluteus-aktivering',
    description: 'Kläm ihop skinkorna utan rörelse i höftleden. Aktiverar gluteus utan risk.',
    category: 'strength',
    bodyArea: 'höft',
    exerciseType: 'isometrisk',
    difficulty: 'Lätt',
    sets: 3,
    reps: '10 sekunder håll, 15 repetitioner',
    frequency: '4-5 gånger dagligen',
    animationId: 'glute_squeeze',
    animationParams: { rangeOfMotion: 0.1, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['sof_hoft'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: [],
    progressions: ['ex_0412'],
    regressions: [],
    tips: 'Ligg på rygg. Kläm ihop skinkorna. Håll i 10 sekunder. Släpp långsamt.',
    keywords: ['gluteus', 'isometrisk', 'höft', 'postoperativ'],
    targetMuscles: ['gluteus maximus'],
    postOpRestrictions: {
      minDaysSinceSurgery: 0,
      maxDaysSinceSurgery: 56,
      allowedProcedures: ['hoftprotes'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0412',
    name: 'Höftabduktion i liggande',
    description: 'Öppna benet utåt i sidoläge med kudde mellan benen. Stärker höftabduktorer.',
    category: 'strength',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Lätt',
    sets: 3,
    reps: '10-12 repetitioner',
    frequency: '2-3 gånger dagligen',
    animationId: 'hip_abduction_sidelying',
    animationParams: { rangeOfMotion: 0.3, speed: 0.6, laterality: 'bilateral' },
    sourceIds: ['sof_hoft'],
    evidenceLevel: 'B',
    equipment: ['matta'],
    contraindications: ['smärta vid rörelse'],
    progressions: [],
    regressions: ['ex_0411'],
    tips: 'Ligg på friska sidan. Ha kudde mellan benen. Lyft det opererade benet uppåt utan att vrida höften.',
    keywords: ['abduktion', 'sidoläge', 'höft', 'gluteus medius'],
    targetMuscles: ['gluteus medius', 'tensor fasciae latae'],
    postOpRestrictions: {
      minDaysSinceSurgery: 14,
      maxDaysSinceSurgery: 56,
      allowedProcedures: ['hoftprotes'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 1
    }
  },
  {
    id: 'ex_0413',
    name: 'Höftextension i bukläge',
    description: 'Lyft det raka benet bakåt i bukläge. Aktiverar gluteus utan höftflexion.',
    category: 'strength',
    bodyArea: 'höft',
    exerciseType: 'stärkning',
    difficulty: 'Lätt',
    sets: 3,
    reps: '10 repetitioner',
    frequency: '2 gånger dagligen',
    animationId: 'prone_hip_extension',
    animationParams: { rangeOfMotion: 0.2, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['sof_hoft'],
    evidenceLevel: 'B',
    equipment: ['matta'],
    contraindications: ['smärta i höften', 'problem att ligga på magen'],
    progressions: [],
    regressions: ['ex_0411'],
    tips: 'Ligg på magen med rak kropp. Lyft benet rakt uppåt utan att böja i knät. Håll 3 sekunder.',
    keywords: ['extension', 'bukläge', 'höft', 'gluteus'],
    targetMuscles: ['gluteus maximus', 'hamstrings'],
    postOpRestrictions: {
      minDaysSinceSurgery: 21,
      maxDaysSinceSurgery: 56,
      allowedProcedures: ['hoftprotes'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 1
    }
  }
];

// ============================================
// KNÄPROTES - FAS 1 (0-2 veckor)
// ============================================

const kneeProstFase1: PostOpExercise[] = [
  {
    id: 'ex_0421',
    name: 'Knäextension sittande (0-30°)',
    description: 'Sträck knät från 90° till nästan rakt sittande på stol. Begränsad ROM tidigt.',
    category: 'strength',
    bodyArea: 'knä',
    exerciseType: 'stärkning',
    difficulty: 'Lätt',
    sets: 3,
    reps: '12-15 repetitioner',
    frequency: '3-4 gånger dagligen',
    animationId: 'seated_knee_extension',
    animationParams: { rangeOfMotion: 0.3, speed: 0.6, laterality: 'bilateral' },
    sourceIds: ['sof_kna'],
    evidenceLevel: 'A',
    equipment: ['stol'],
    contraindications: ['kraftig svullnad'],
    progressions: ['ex_0422'],
    regressions: ['ex_0401'],
    tips: 'Sitt på stol med fötterna på golvet. Sträck knät genom att lyfta underbenet. Gå inte till fullt rakt om det smärtar.',
    keywords: ['extension', 'sittande', 'knä', 'quadriceps'],
    targetMuscles: ['quadriceps'],
    postOpRestrictions: {
      minDaysSinceSurgery: 2,
      maxDaysSinceSurgery: 28,
      allowedProcedures: ['knaprotes'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  },
  {
    id: 'ex_0422',
    name: 'Knäflexion sittande med stöd',
    description: 'Böj knät sittande genom att dra foten bakåt under stolen.',
    category: 'mobility',
    bodyArea: 'knä',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 3,
    reps: '15 repetitioner',
    frequency: '4 gånger dagligen',
    animationId: 'seated_knee_flexion',
    animationParams: { rangeOfMotion: 0.6, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['sof_kna'],
    evidenceLevel: 'A',
    equipment: ['stol'],
    contraindications: [],
    progressions: [],
    regressions: ['ex_0402'],
    tips: 'Sitt på stol. Dra foten bakåt under stolen så knät böjs. Gå till smärtfri gräns. Mål: 90° inom 2 veckor.',
    keywords: ['flexion', 'sittande', 'knä', 'rom'],
    targetMuscles: ['hamstrings'],
    postOpRestrictions: {
      minDaysSinceSurgery: 1,
      maxDaysSinceSurgery: 28,
      allowedProcedures: ['knaprotes'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  }
];

// ============================================
// RYGGOPERATIONER - FAS 1 (0-2 veckor)
// ============================================

const spineFase1: PostOpExercise[] = [
  {
    id: 'ex_0431',
    name: 'Bäckentilt i liggande',
    description: 'Lätt rörelse av bäckenet utan belastning på ryggraden. Aktiverar core säkert.',
    category: 'mobility',
    bodyArea: 'ländrygg',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 2,
    reps: '10-15 repetitioner',
    frequency: '3 gånger dagligen',
    animationId: 'pelvic_tilt_supine',
    animationParams: { rangeOfMotion: 0.2, speed: 0.5, laterality: 'bilateral' },
    sourceIds: ['sof_rygg'],
    evidenceLevel: 'A',
    equipment: ['matta'],
    contraindications: ['smärta vid rörelse'],
    progressions: ['ex_0432'],
    regressions: [],
    tips: 'Ligg på rygg med böjda knän. Vicka bäckenet så svanken plattas mot golvet. Återgå långsamt.',
    keywords: ['bäckentilt', 'core', 'ländrygg', 'postoperativ'],
    targetMuscles: ['transversus abdominis', 'multifidus'],
    postOpRestrictions: {
      minDaysSinceSurgery: 3,
      maxDaysSinceSurgery: 42,
      allowedProcedures: ['diskbrack_operation', 'spondylodes'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 1
    }
  },
  {
    id: 'ex_0432',
    name: 'Knä-till-bröst enkel',
    description: 'Dra ett knä mot bröstet i liggande. Sträcker ländrygg försiktigt.',
    category: 'mobility',
    bodyArea: 'ländrygg',
    exerciseType: 'stretching',
    difficulty: 'Lätt',
    sets: 2,
    reps: '30 sekunder håll per sida',
    frequency: '2-3 gånger dagligen',
    animationId: 'single_knee_to_chest',
    animationParams: { rangeOfMotion: 0.5, speed: 0.4, laterality: 'alternating' },
    sourceIds: ['sof_rygg'],
    evidenceLevel: 'B',
    equipment: ['matta'],
    contraindications: ['ökad bensmärta vid rörelse'],
    progressions: [],
    regressions: ['ex_0431'],
    tips: 'Ligg på rygg. Dra ett knä mot bröstet med händerna. Håll det andra benet böjt med foten i golvet.',
    keywords: ['knä till bröst', 'stretch', 'ländrygg', 'flexion'],
    targetMuscles: ['erector spinae', 'gluteus'],
    postOpRestrictions: {
      minDaysSinceSurgery: 7,
      maxDaysSinceSurgery: 42,
      allowedProcedures: ['diskbrack_operation'],
      weightBearing: ['Partiell', 'Fullt'],
      requiresSupervision: true,
      phase: 1
    }
  },
  {
    id: 'ex_0433',
    name: 'Log roll (Positionsbyte)',
    description: 'Korrekt teknik för att vända sig i sängen efter ryggoperation.',
    category: 'functional',
    bodyArea: 'ländrygg',
    exerciseType: 'rörlighet',
    difficulty: 'Lätt',
    sets: 1,
    reps: 'Vid varje positionsbyte',
    frequency: 'Vid behov',
    animationId: 'log_roll',
    animationParams: { rangeOfMotion: 0.3, speed: 0.3, laterality: 'bilateral' },
    sourceIds: ['sof_rygg'],
    evidenceLevel: 'A',
    equipment: ['ingen'],
    contraindications: [],
    progressions: [],
    regressions: [],
    tips: 'Böj knäna. Rulla hela kroppen som en stock - axlar, bäcken och ben samtidigt. Undvik att vrida.',
    keywords: ['log roll', 'positionsbyte', 'rygg', 'säkerhet'],
    targetMuscles: [],
    postOpRestrictions: {
      minDaysSinceSurgery: 0,
      maxDaysSinceSurgery: 42,
      allowedProcedures: ['diskbrack_operation', 'spondylodes'],
      weightBearing: ['Avlastad', 'Partiell', 'Fullt'],
      requiresSupervision: false,
      phase: 1
    }
  }
];

// ============================================
// SAMLA ALLA ÖVNINGAR
// ============================================

export const POST_OP_EXERCISES: PostOpExercise[] = [
  ...shoulderProstFase1,
  ...shoulderProstFase2,
  ...aclFase1,
  ...hipProstFase1,
  ...kneeProstFase1,
  ...spineFase1
];

// Export som standard ExtendedExercise-array för kompatibilitet
// Övningarna har redan sourceIds och evidenceLevel definierade
export const CHUNK_009_EXERCISES: ExtendedExercise[] = POST_OP_EXERCISES.map(ex => {
  // Ta bort postOpRestrictions för standard-export
  const { postOpRestrictions, ...standardExercise } = ex;
  return standardExercise as ExtendedExercise;
});

// ============================================
// HJÄLPFUNKTIONER
// ============================================

/**
 * Filtrera postoperativa övningar baserat på operation och tid
 */
export function getPostOpExercisesForPatient(
  procedure: string,
  daysSinceSurgery: number,
  weightBearing: 'Avlastad' | 'Partiell' | 'Fullt'
): PostOpExercise[] {
  return POST_OP_EXERCISES.filter(ex => {
    const r = ex.postOpRestrictions;

    // Kontrollera procedur
    if (!r.allowedProcedures.includes(procedure)) return false;

    // Kontrollera tid
    if (daysSinceSurgery < r.minDaysSinceSurgery) return false;
    if (r.maxDaysSinceSurgery && daysSinceSurgery > r.maxDaysSinceSurgery) return false;

    // Kontrollera viktbäring
    if (!r.weightBearing.includes(weightBearing)) return false;

    return true;
  });
}

/**
 * Hämta övningar för specifik fas
 */
export function getPostOpExercisesByPhase(
  procedure: string,
  phase: 1 | 2 | 3
): PostOpExercise[] {
  return POST_OP_EXERCISES.filter(ex => {
    const r = ex.postOpRestrictions;
    return r.allowedProcedures.includes(procedure) && r.phase === phase;
  });
}

// Metadata
export const CHUNK_009_META = {
  id: 9,
  filename: 'chunk_009.ts',
  category: 'postoperativ',
  description: 'Postoperativa övningar med säkerhetsrestriktioner',
  exerciseCount: POST_OP_EXERCISES.length,
  idRange: { start: 'ex_0391', end: 'ex_0440' }
};
