/**
 * Form Analysis Service - Rörelseanalys och kvalitetspoäng
 *
 * Analyserar övningsform baserat på MediaPipe pose landmarks och ger:
 * - Overall form score (0-100)
 * - Symmetri-analys (vänster/höger balans)
 * - ROM-utvärdering (jämfört med mål)
 * - Tempo-analys (jämn hastighet)
 * - Stabilitet (minimal oönskad rörelse)
 *
 * Integreras med AIMovementCoach för realtidsfeedback.
 */

// ============================================
// TYPES
// ============================================

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseLandmarks {
  [key: number]: PoseLandmark;
}

export interface JointAngles {
  leftShoulder?: number;
  rightShoulder?: number;
  leftElbow?: number;
  rightElbow?: number;
  leftHip?: number;
  rightHip?: number;
  leftKnee?: number;
  rightKnee?: number;
  leftAnkle?: number;
  rightAnkle?: number;
  spine?: number;
  neck?: number;
}

export interface FormScore {
  overall: number;           // 0-100 total poäng
  symmetry: number;          // 0-100 vänster/höger balans
  rangeOfMotion: number;     // 0-100 uppnådd ROM vs mål
  tempo: number;             // 0-100 jämn hastighet
  stability: number;         // 0-100 minimal oönskad rörelse
  breakdown: FormBreakdown;  // Detaljerad uppdelning
}

export interface FormBreakdown {
  symmetryDetails: {
    leftRightDiff: number;   // Grader skillnad
    balanceScore: number;    // 0-100
    side: 'balanced' | 'left_dominant' | 'right_dominant';
  };
  romDetails: {
    achieved: number;        // Uppnådda grader
    target: number;          // Mål grader
    percentage: number;      // Procent av mål
  };
  tempoDetails: {
    consistency: number;     // 0-100
    averageSpeed: number;    // Enheter/sekund
    variation: number;       // Standardavvikelse
  };
  stabilityDetails: {
    coreStability: number;   // 0-100
    jointStability: number;  // 0-100
    tremor: number;          // 0-100 (lägre = mer skakningar)
  };
}

export interface ExerciseFormCriteria {
  name: string;
  primaryJoints: (keyof JointAngles)[];
  targetROM: Record<string, number>;
  symmetryRequired: boolean;
  stabilityZones: string[];  // Kroppsdelar som ska vara stabila
}

// ============================================
// MediaPipe Landmark Indices
// ============================================

const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

// ============================================
// EXERCISE FORM CRITERIA DATABASE
// ============================================

const EXERCISE_CRITERIA: Record<string, ExerciseFormCriteria> = {
  'squat': {
    name: 'Knäböj',
    primaryJoints: ['leftKnee', 'rightKnee', 'leftHip', 'rightHip'],
    targetROM: { knee: 90, hip: 90 },
    symmetryRequired: true,
    stabilityZones: ['spine', 'ankles']
  },
  'knee_flexion': {
    name: 'Knäflexion',
    primaryJoints: ['leftKnee', 'rightKnee'],
    targetROM: { knee: 120 },
    symmetryRequired: false,
    stabilityZones: ['hip', 'spine']
  },
  'shoulder_flexion': {
    name: 'Axelflexion',
    primaryJoints: ['leftShoulder', 'rightShoulder'],
    targetROM: { shoulder: 180 },
    symmetryRequired: false,
    stabilityZones: ['spine', 'hips']
  },
  'pendulum': {
    name: 'Pendelrörelser',
    primaryJoints: ['leftShoulder', 'rightShoulder'],
    targetROM: { shoulder: 30 },
    symmetryRequired: false,
    stabilityZones: ['spine']
  },
  'hip_abduction': {
    name: 'Höftabduktion',
    primaryJoints: ['leftHip', 'rightHip'],
    targetROM: { hip: 45 },
    symmetryRequired: false,
    stabilityZones: ['spine', 'pelvis']
  },
  'elbow_flexion': {
    name: 'Armbågsflexion',
    primaryJoints: ['leftElbow', 'rightElbow'],
    targetROM: { elbow: 140 },
    symmetryRequired: false,
    stabilityZones: ['shoulder']
  },
  'default': {
    name: 'Generell övning',
    primaryJoints: [],
    targetROM: {},
    symmetryRequired: false,
    stabilityZones: []
  }
};

// ============================================
// LANDMARK HISTORY (för tempo/stabilitet)
// ============================================

interface LandmarkHistory {
  timestamps: number[];
  positions: PoseLandmarks[];
  jointAngles: JointAngles[];
}

const landmarkHistory: LandmarkHistory = {
  timestamps: [],
  positions: [],
  jointAngles: []
};

const MAX_HISTORY_LENGTH = 60; // ~2 sekunder vid 30fps

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Beräkna vinkel mellan tre punkter
 *
 * FAS 9: Fixad till korrekt 3D-beräkning med dot product
 * Tidigare användes 2D atan2 som ignorerade Z-axeln
 */
function calculateAngle(
  p1: PoseLandmark,
  p2: PoseLandmark,
  p3: PoseLandmark
): number {
  // Vektorer från vertex (p2)
  const v1 = {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
    z: p1.z - p2.z
  };
  const v2 = {
    x: p3.x - p2.x,
    y: p3.y - p2.y,
    z: p3.z - p2.z
  };

  // Dot product
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

  // Magnituder
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  // Undvik division med noll
  if (mag1 < 0.0001 || mag2 < 0.0001) {
    return 0;
  }

  // Vinkel i grader (clampa cosinus för att undvika NaN)
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

/**
 * Beräkna avstånd mellan två punkter
 */
function calculateDistance(p1: PoseLandmark, p2: PoseLandmark): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
}

/**
 * Beräkna standardavvikelse
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Normalisera poäng till 0-100
 */
function normalizeScore(value: number, min: number, max: number): number {
  const score = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, score));
}

// ============================================
// JOINT ANGLE CALCULATIONS
// ============================================

/**
 * Beräkna alla ledvinklar från landmarks
 */
export function calculateJointAngles(landmarks: PoseLandmarks): JointAngles {
  const angles: JointAngles = {};

  // Vänster axel (armbåge-axel-höft)
  if (landmarks[POSE_LANDMARKS.LEFT_ELBOW] &&
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER] &&
      landmarks[POSE_LANDMARKS.LEFT_HIP]) {
    angles.leftShoulder = calculateAngle(
      landmarks[POSE_LANDMARKS.LEFT_ELBOW],
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
      landmarks[POSE_LANDMARKS.LEFT_HIP]
    );
  }

  // Höger axel
  if (landmarks[POSE_LANDMARKS.RIGHT_ELBOW] &&
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] &&
      landmarks[POSE_LANDMARKS.RIGHT_HIP]) {
    angles.rightShoulder = calculateAngle(
      landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
      landmarks[POSE_LANDMARKS.RIGHT_HIP]
    );
  }

  // Vänster armbåge (handled-armbåge-axel)
  if (landmarks[POSE_LANDMARKS.LEFT_WRIST] &&
      landmarks[POSE_LANDMARKS.LEFT_ELBOW] &&
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER]) {
    angles.leftElbow = calculateAngle(
      landmarks[POSE_LANDMARKS.LEFT_WRIST],
      landmarks[POSE_LANDMARKS.LEFT_ELBOW],
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER]
    );
  }

  // Höger armbåge
  if (landmarks[POSE_LANDMARKS.RIGHT_WRIST] &&
      landmarks[POSE_LANDMARKS.RIGHT_ELBOW] &&
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]) {
    angles.rightElbow = calculateAngle(
      landmarks[POSE_LANDMARKS.RIGHT_WRIST],
      landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
    );
  }

  // Vänster höft (knä-höft-axel)
  if (landmarks[POSE_LANDMARKS.LEFT_KNEE] &&
      landmarks[POSE_LANDMARKS.LEFT_HIP] &&
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER]) {
    angles.leftHip = calculateAngle(
      landmarks[POSE_LANDMARKS.LEFT_KNEE],
      landmarks[POSE_LANDMARKS.LEFT_HIP],
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER]
    );
  }

  // Höger höft
  if (landmarks[POSE_LANDMARKS.RIGHT_KNEE] &&
      landmarks[POSE_LANDMARKS.RIGHT_HIP] &&
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]) {
    angles.rightHip = calculateAngle(
      landmarks[POSE_LANDMARKS.RIGHT_KNEE],
      landmarks[POSE_LANDMARKS.RIGHT_HIP],
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
    );
  }

  // Vänster knä (fotled-knä-höft)
  if (landmarks[POSE_LANDMARKS.LEFT_ANKLE] &&
      landmarks[POSE_LANDMARKS.LEFT_KNEE] &&
      landmarks[POSE_LANDMARKS.LEFT_HIP]) {
    angles.leftKnee = calculateAngle(
      landmarks[POSE_LANDMARKS.LEFT_ANKLE],
      landmarks[POSE_LANDMARKS.LEFT_KNEE],
      landmarks[POSE_LANDMARKS.LEFT_HIP]
    );
  }

  // Höger knä
  if (landmarks[POSE_LANDMARKS.RIGHT_ANKLE] &&
      landmarks[POSE_LANDMARKS.RIGHT_KNEE] &&
      landmarks[POSE_LANDMARKS.RIGHT_HIP]) {
    angles.rightKnee = calculateAngle(
      landmarks[POSE_LANDMARKS.RIGHT_ANKLE],
      landmarks[POSE_LANDMARKS.RIGHT_KNEE],
      landmarks[POSE_LANDMARKS.RIGHT_HIP]
    );
  }

  // Rygg (axel-höft-knä)
  if (landmarks[POSE_LANDMARKS.LEFT_SHOULDER] &&
      landmarks[POSE_LANDMARKS.LEFT_HIP] &&
      landmarks[POSE_LANDMARKS.LEFT_KNEE]) {
    angles.spine = calculateAngle(
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
      landmarks[POSE_LANDMARKS.LEFT_HIP],
      landmarks[POSE_LANDMARKS.LEFT_KNEE]
    );
  }

  return angles;
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Analysera symmetri mellan vänster och höger sida
 */
function analyzeSymmetry(angles: JointAngles): FormBreakdown['symmetryDetails'] {
  const pairs = [
    ['leftShoulder', 'rightShoulder'],
    ['leftElbow', 'rightElbow'],
    ['leftHip', 'rightHip'],
    ['leftKnee', 'rightKnee']
  ];

  const diffs: number[] = [];

  for (const [left, right] of pairs) {
    const leftAngle = angles[left as keyof JointAngles];
    const rightAngle = angles[right as keyof JointAngles];

    if (leftAngle !== undefined && rightAngle !== undefined) {
      diffs.push(Math.abs(leftAngle - rightAngle));
    }
  }

  if (diffs.length === 0) {
    return {
      leftRightDiff: 0,
      balanceScore: 100,
      side: 'balanced'
    };
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  // Poäng: 0 graders skillnad = 100, 30+ grader = 0
  const balanceScore = normalizeScore(30 - avgDiff, 0, 30);

  // Bestäm dominant sida
  let leftSum = 0;
  let rightSum = 0;
  for (const [left, right] of pairs) {
    leftSum += angles[left as keyof JointAngles] || 0;
    rightSum += angles[right as keyof JointAngles] || 0;
  }

  let side: 'balanced' | 'left_dominant' | 'right_dominant' = 'balanced';
  if (avgDiff > 10) {
    side = leftSum > rightSum ? 'left_dominant' : 'right_dominant';
  }

  return {
    leftRightDiff: avgDiff,
    balanceScore,
    side
  };
}

/**
 * Analysera ROM jämfört med mål
 */
function analyzeROM(
  angles: JointAngles,
  exerciseType: string
): FormBreakdown['romDetails'] {
  const criteria = EXERCISE_CRITERIA[exerciseType] || EXERCISE_CRITERIA['default'];

  if (Object.keys(criteria.targetROM).length === 0) {
    return {
      achieved: 0,
      target: 0,
      percentage: 100
    };
  }

  let totalAchieved = 0;
  let totalTarget = 0;
  let count = 0;

  for (const joint of criteria.primaryJoints) {
    const angle = angles[joint];
    if (angle !== undefined) {
      totalAchieved += angle;
      count++;
    }
  }

  // Beräkna genomsnitt
  const achieved = count > 0 ? totalAchieved / count : 0;

  // Hämta target från criteria
  const targetValues = Object.values(criteria.targetROM);
  const target = targetValues.length > 0
    ? targetValues.reduce((a, b) => a + b, 0) / targetValues.length
    : 90;

  const percentage = Math.min(100, (achieved / target) * 100);

  return {
    achieved: Math.round(achieved),
    target: Math.round(target),
    percentage: Math.round(percentage)
  };
}

/**
 * Analysera tempo/hastighet
 */
function analyzeTempo(): FormBreakdown['tempoDetails'] {
  if (landmarkHistory.jointAngles.length < 2) {
    return {
      consistency: 100,
      averageSpeed: 0,
      variation: 0
    };
  }

  // Beräkna rörelse mellan frames
  const speeds: number[] = [];

  for (let i = 1; i < landmarkHistory.jointAngles.length; i++) {
    const prev = landmarkHistory.jointAngles[i - 1];
    const curr = landmarkHistory.jointAngles[i];
    const timeDiff = (landmarkHistory.timestamps[i] - landmarkHistory.timestamps[i - 1]) / 1000;

    if (timeDiff > 0) {
      // Summa av vinkelandringar
      let totalChange = 0;
      let count = 0;

      for (const key of Object.keys(curr) as (keyof JointAngles)[]) {
        if (prev[key] !== undefined && curr[key] !== undefined) {
          totalChange += Math.abs((curr[key] as number) - (prev[key] as number));
          count++;
        }
      }

      if (count > 0) {
        speeds.push((totalChange / count) / timeDiff);
      }
    }
  }

  if (speeds.length === 0) {
    return {
      consistency: 100,
      averageSpeed: 0,
      variation: 0
    };
  }

  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const variation = standardDeviation(speeds);

  // Consistency: lägre variation = högre poäng
  // Om variation är < 10% av medelhastighet = 100 poäng
  const consistencyRatio = avgSpeed > 0 ? variation / avgSpeed : 0;
  const consistency = normalizeScore(0.5 - consistencyRatio, 0, 0.5);

  return {
    consistency: Math.round(consistency),
    averageSpeed: Math.round(avgSpeed * 10) / 10,
    variation: Math.round(variation * 10) / 10
  };
}

/**
 * Analysera stabilitet
 */
function analyzeStability(
  landmarks: PoseLandmarks,
  exerciseType: string
): FormBreakdown['stabilityDetails'] {
  if (landmarkHistory.positions.length < 2) {
    return {
      coreStability: 100,
      jointStability: 100,
      tremor: 100
    };
  }

  // Core stability - mät rörelse i bål
  const corePoints = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP
  ];

  const coreMovements: number[] = [];
  const prev = landmarkHistory.positions[landmarkHistory.positions.length - 2];

  for (const point of corePoints) {
    if (landmarks[point] && prev[point]) {
      coreMovements.push(calculateDistance(landmarks[point], prev[point]));
    }
  }

  const avgCoreMovement = coreMovements.length > 0
    ? coreMovements.reduce((a, b) => a + b, 0) / coreMovements.length
    : 0;

  // Lägre rörelse = högre stabilitet
  const coreStability = normalizeScore(0.05 - avgCoreMovement, 0, 0.05);

  // Joint stability - mät skakningar i leder
  const jointMovements: number[] = [];
  const jointPoints = [
    POSE_LANDMARKS.LEFT_WRIST,
    POSE_LANDMARKS.RIGHT_WRIST,
    POSE_LANDMARKS.LEFT_ANKLE,
    POSE_LANDMARKS.RIGHT_ANKLE
  ];

  for (const point of jointPoints) {
    if (landmarks[point] && prev[point]) {
      jointMovements.push(calculateDistance(landmarks[point], prev[point]));
    }
  }

  const avgJointMovement = jointMovements.length > 0
    ? jointMovements.reduce((a, b) => a + b, 0) / jointMovements.length
    : 0;

  const jointStability = normalizeScore(0.08 - avgJointMovement, 0, 0.08);

  // Tremor - högfrekvent rörelse
  const tremor = Math.min(coreStability, jointStability);

  return {
    coreStability: Math.round(coreStability),
    jointStability: Math.round(jointStability),
    tremor: Math.round(tremor)
  };
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Analysera övningsform och returnera poäng
 */
export function analyzeForm(
  landmarks: PoseLandmarks,
  exerciseType: string = 'default'
): FormScore {
  // Beräkna ledvinklar
  const angles = calculateJointAngles(landmarks);

  // Uppdatera historik
  const now = Date.now();
  landmarkHistory.timestamps.push(now);
  landmarkHistory.positions.push({ ...landmarks });
  landmarkHistory.jointAngles.push({ ...angles });

  // Trimma historik
  while (landmarkHistory.timestamps.length > MAX_HISTORY_LENGTH) {
    landmarkHistory.timestamps.shift();
    landmarkHistory.positions.shift();
    landmarkHistory.jointAngles.shift();
  }

  // Analysera komponenter
  const symmetryDetails = analyzeSymmetry(angles);
  const romDetails = analyzeROM(angles, exerciseType);
  const tempoDetails = analyzeTempo();
  const stabilityDetails = analyzeStability(landmarks, exerciseType);

  // Beräkna delpoäng
  const symmetry = symmetryDetails.balanceScore;
  const rangeOfMotion = romDetails.percentage;
  const tempo = tempoDetails.consistency;
  const stability = (stabilityDetails.coreStability + stabilityDetails.jointStability) / 2;

  // Vikta overall score baserat på övningstyp
  const criteria = EXERCISE_CRITERIA[exerciseType] || EXERCISE_CRITERIA['default'];
  let overall: number;

  if (criteria.symmetryRequired) {
    // Symmetri viktigare för bilaterala övningar
    overall = (symmetry * 0.3) + (rangeOfMotion * 0.3) + (tempo * 0.2) + (stability * 0.2);
  } else {
    // ROM viktigare för unilaterala övningar
    overall = (symmetry * 0.15) + (rangeOfMotion * 0.4) + (tempo * 0.25) + (stability * 0.2);
  }

  return {
    overall: Math.round(overall),
    symmetry: Math.round(symmetry),
    rangeOfMotion: Math.round(rangeOfMotion),
    tempo: Math.round(tempo),
    stability: Math.round(stability),
    breakdown: {
      symmetryDetails,
      romDetails,
      tempoDetails,
      stabilityDetails
    }
  };
}

/**
 * Återställ historik (t.ex. mellan övningar)
 */
export function resetFormHistory(): void {
  landmarkHistory.timestamps = [];
  landmarkHistory.positions = [];
  landmarkHistory.jointAngles = [];
}

/**
 * Hämta feedback baserat på formpoäng
 */
export function getFormFeedback(score: FormScore): string[] {
  const feedback: string[] = [];

  // Symmetri feedback
  if (score.symmetry < 70) {
    const side = score.breakdown.symmetryDetails.side;
    if (side === 'left_dominant') {
      feedback.push('Försök belasta mer på höger sida för bättre balans');
    } else if (side === 'right_dominant') {
      feedback.push('Försök belasta mer på vänster sida för bättre balans');
    }
  }

  // ROM feedback
  if (score.rangeOfMotion < 60) {
    feedback.push('Försök att öka rörelseomfånget gradvis');
  } else if (score.rangeOfMotion > 110) {
    feedback.push('Bra rörelseomfång! Undvik att överbelasta leden');
  }

  // Tempo feedback
  if (score.tempo < 60) {
    feedback.push('Försök hålla ett jämnare tempo genom hela rörelsen');
  }

  // Stabilitet feedback
  if (score.stability < 60) {
    feedback.push('Fokusera på att hålla bålmusklerna aktiva för bättre stabilitet');
  }

  // Positiv feedback
  if (score.overall >= 80) {
    feedback.push('Utmärkt form! Fortsätt så här');
  } else if (score.overall >= 60) {
    feedback.push('Bra jobbat! Fokusera på de områden som kan förbättras');
  }

  return feedback;
}

/**
 * Normalisera övningsnamn till criteria-nyckel
 */
export function normalizeExerciseType(exerciseName: string): string {
  const name = exerciseName.toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/\s+/g, '_');

  // Mappningar
  const mappings: Record<string, string> = {
    'knaboj': 'squat',
    'squat': 'squat',
    'knaflexion': 'knee_flexion',
    'knarojning': 'knee_flexion',
    'axelflexion': 'shoulder_flexion',
    'armlyft': 'shoulder_flexion',
    'pendelrorelser': 'pendulum',
    'pendel': 'pendulum',
    'codman': 'pendulum',
    'hoftabduktion': 'hip_abduction',
    'sidolyft_ben': 'hip_abduction',
    'armbagsflex': 'elbow_flexion',
    'bicepscurl': 'elbow_flexion'
  };

  return mappings[name] || 'default';
}
