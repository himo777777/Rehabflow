/**
 * Compensation Detection Service
 *
 * FAS 9: Rörelseanalys & Coaching Förbättringar
 *
 * Detekterar vanliga kompensationsmönster under övningar:
 * - Trunk lean (bålvinkling vid squat/lunge)
 * - Knee valgus (knä faller inåt)
 * - Weight shift (asymmetrisk belastning)
 * - Shoulder hike (axellyft vid armrörelser)
 * - Hip drop (höftsänkning vid enbensstående)
 */

import { PoseLandmark, POSE_LANDMARKS } from './calibrationService';
import { JointAngle3D } from './poseReconstruction';

// ============================================
// TYPES
// ============================================

export type CompensationType =
  | 'trunk_lean'
  | 'knee_valgus'
  | 'weight_shift'
  | 'shoulder_hike'
  | 'hip_drop'
  | 'forward_head'
  | 'lumbar_flexion';

export type CompensationSeverity = 'mild' | 'moderate' | 'severe';

export interface CompensationPattern {
  type: CompensationType;
  severity: CompensationSeverity;
  side?: 'left' | 'right' | 'bilateral';
  correction: string;
  measurementValue: number; // Faktiskt värde för tracking
  threshold: number; // Tröskel som överskreds
}

export type ExerciseCategory =
  | 'LEGS'       // Squat, lunge, etc.
  | 'UPPER'      // Arm raises, pushups
  | 'CORE'       // Planks, bridges
  | 'BALANCE'    // Single leg, balance exercises
  | 'GENERAL';   // Default

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Beräkna avstånd mellan två punkter i 3D
 */
function distance3D(p1: PoseLandmark, p2: PoseLandmark): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
}

/**
 * Beräkna mittpunkt mellan två landmarks
 */
function midpoint(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
    visibility: Math.min(p1.visibility || 1, p2.visibility || 1),
  };
}

/**
 * Beräkna vinkel från vertikal
 */
function angleFromVertical(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  // I normaliserade koordinater är Y nedåt, så vi mäter från Y-axeln
  const radians = Math.atan2(Math.abs(dx), Math.abs(dy));
  return radians * (180 / Math.PI);
}

/**
 * Bestäm severity baserat på värde och trösklar
 */
function getSeverity(
  value: number,
  mildThreshold: number,
  moderateThreshold: number,
  severeThreshold: number
): CompensationSeverity | null {
  if (Math.abs(value) >= severeThreshold) return 'severe';
  if (Math.abs(value) >= moderateThreshold) return 'moderate';
  if (Math.abs(value) >= mildThreshold) return 'mild';
  return null;
}

// ============================================
// DETECTION FUNCTIONS
// ============================================

/**
 * Detektera trunk lean (bålvinkling)
 * Vanlig kompensation vid squat för att kompensera för svaga ben
 */
function detectTrunkLean(landmarks: PoseLandmark[]): CompensationPattern | null {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return null;
  }

  const midShoulder = midpoint(leftShoulder, rightShoulder);
  const midHip = midpoint(leftHip, rightHip);

  // Mät vinkel från vertikal
  const trunkAngle = angleFromVertical(midHip, midShoulder);

  // Trösklar: 15° mild, 30° moderate, 45° severe
  const severity = getSeverity(trunkAngle, 15, 30, 45);

  if (!severity) return null;

  return {
    type: 'trunk_lean',
    severity,
    correction: severity === 'severe'
      ? 'Håll bålen upprätt! Använd stöd om du behöver'
      : severity === 'moderate'
        ? 'Försök hålla bålen mer upprätt'
        : 'Bra! Men försök lite rakare bål',
    measurementValue: trunkAngle,
    threshold: 15,
  };
}

/**
 * Detektera knee valgus (knä faller inåt)
 * Indikerar ofta svag gluteus medius
 */
function detectKneeValgus(
  landmarks: PoseLandmark[],
  angles: Record<string, JointAngle3D>
): CompensationPattern | null {
  // Använd befintliga knee valgus-värden från poseReconstruction
  const leftValgus = angles.leftKneeValgus?.angle || 0;
  const rightValgus = angles.rightKneeValgus?.angle || 0;

  // Konvertera tillbaka från pseudo-vinkel till mm (1.5° per mm)
  const leftMm = leftValgus / 1.5;
  const rightMm = rightValgus / 1.5;

  // Trösklar: 5mm mild, 10mm moderate, 15mm severe (anatomiska gränser)
  const leftSeverity = getSeverity(leftMm, 5, 10, 15);
  const rightSeverity = getSeverity(rightMm, 5, 10, 15);

  // Returnera värsta sidan
  if (!leftSeverity && !rightSeverity) return null;

  const worstSide = Math.abs(leftMm) >= Math.abs(rightMm) ? 'left' : 'right';
  const worstValue = worstSide === 'left' ? leftMm : rightMm;
  const severity = worstSide === 'left' ? leftSeverity : rightSeverity;

  if (!severity) return null;

  const sideText = worstSide === 'left' ? 'vänstra' : 'högra';

  return {
    type: 'knee_valgus',
    severity,
    side: Math.abs(leftMm) > 5 && Math.abs(rightMm) > 5 ? 'bilateral' : worstSide,
    correction: severity === 'severe'
      ? `Tryck ut ${sideText} knäet! Aktivera gluteus`
      : severity === 'moderate'
        ? `Håll knäna i linje med tårna`
        : 'Tänk på att pressa ut knäna',
    measurementValue: worstValue,
    threshold: 5,
  };
}

/**
 * Detektera weight shift (asymmetrisk belastning)
 * Viktig för rehabilitering av sidoskillnader
 */
function detectWeightShift(landmarks: PoseLandmark[]): CompensationPattern | null {
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

  if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) {
    return null;
  }

  // Beräkna mittpunkt av höfter och fotled
  const hipCenter = midpoint(leftHip, rightHip);
  const ankleCenter = midpoint(leftAnkle, rightAnkle);

  // Mät lateral förskjutning (X-led)
  // Positivt värde = lutar höger, negativt = lutar vänster
  const lateralShift = (hipCenter.x - ankleCenter.x) * 100; // Normalisera till %

  // Trösklar: 10% mild, 20% moderate, 30% severe
  const severity = getSeverity(lateralShift, 10, 20, 30);

  if (!severity) return null;

  const side = lateralShift > 0 ? 'right' : 'left';
  const oppositeSide = side === 'right' ? 'vänster' : 'höger';

  return {
    type: 'weight_shift',
    severity,
    side,
    correction: severity === 'severe'
      ? `Centrera vikten! Du lutar kraftigt åt ${side === 'right' ? 'höger' : 'vänster'}`
      : `Flytta vikten lite åt ${oppositeSide} för bättre balans`,
    measurementValue: lateralShift,
    threshold: 10,
  };
}

/**
 * Detektera shoulder hike (axellyft)
 * Vanligt vid armrörelser när man kompenserar med trapeziusmuskeln
 */
function detectShoulderHike(landmarks: PoseLandmark[]): CompensationPattern | null {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftEar = landmarks[POSE_LANDMARKS.LEFT_EAR];
  const rightEar = landmarks[POSE_LANDMARKS.RIGHT_EAR];

  if (!leftShoulder || !rightShoulder || !leftEar || !rightEar) {
    return null;
  }

  // Mät avståndet från axel till öra (normalt ~20-25% av överkroppshöjd)
  const leftDistance = distance3D(leftShoulder, leftEar);
  const rightDistance = distance3D(rightShoulder, rightEar);

  // Asymmetri mellan sidorna indikerar axellyft
  const asymmetry = Math.abs(leftDistance - rightDistance) * 100;

  // Trösklar: 5% mild, 10% moderate, 15% severe
  const severity = getSeverity(asymmetry, 5, 10, 15);

  if (!severity) return null;

  const hikeSide = leftDistance < rightDistance ? 'left' : 'right';
  const sideText = hikeSide === 'left' ? 'vänstra' : 'högra';

  return {
    type: 'shoulder_hike',
    severity,
    side: hikeSide,
    correction: severity === 'severe'
      ? `Slappna av ${sideText} axeln! Tänk "nedåt och bakåt"`
      : `Håll ${sideText} axeln avslappnad`,
    measurementValue: asymmetry,
    threshold: 5,
  };
}

/**
 * Detektera hip drop (höftsänkning)
 * Indikerar svag höftmuskulatur på stående sida
 */
function detectHipDrop(landmarks: PoseLandmark[]): CompensationPattern | null {
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  if (!leftHip || !rightHip) {
    return null;
  }

  // Mät höjdskillnad mellan höfterna
  const hipTilt = (leftHip.y - rightHip.y) * 100; // Positivt = höger höft lägre

  // Trösklar: 3% mild, 6% moderate, 10% severe
  const severity = getSeverity(hipTilt, 3, 6, 10);

  if (!severity) return null;

  const dropSide = hipTilt > 0 ? 'right' : 'left';
  const weakSide = dropSide === 'right' ? 'vänster' : 'höger'; // Svag sida är motsatt

  return {
    type: 'hip_drop',
    severity,
    side: dropSide,
    correction: severity === 'severe'
      ? `Höften sjunker! Aktivera ${weakSide} höftmuskel`
      : `Försök hålla höfterna i våg`,
    measurementValue: hipTilt,
    threshold: 3,
  };
}

/**
 * Detektera forward head posture
 * Vanligt vid övningar när man tappar koncentrationen
 */
function detectForwardHead(landmarks: PoseLandmark[]): CompensationPattern | null {
  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

  if (!nose || !leftShoulder || !rightShoulder) {
    return null;
  }

  const midShoulder = midpoint(leftShoulder, rightShoulder);

  // Mät hur långt fram huvudet är relativt axlarna (Z-led)
  const forwardPosition = (nose.z - midShoulder.z) * 100;

  // Trösklar: 5% mild, 10% moderate, 15% severe (negativt värde = framåt)
  const severity = getSeverity(forwardPosition, -15, -10, -5);

  if (!severity) return null;

  return {
    type: 'forward_head',
    severity,
    correction: severity === 'severe'
      ? 'Dra in hakan! Håll huvudet över axlarna'
      : 'Tänk på att hålla huvudet neutralt',
    measurementValue: forwardPosition,
    threshold: -5,
  };
}

// ============================================
// MAIN DETECTION FUNCTION
// ============================================

/**
 * Huvudfunktion för att detektera kompensationsmönster
 *
 * @param landmarks - MediaPipe pose landmarks
 * @param angles - Beräknade ledvinklar från poseReconstruction
 * @param exerciseCategory - Typ av övning för kontextspecifik detektion
 * @returns Lista av detekterade kompensationsmönster
 */
export function detectCompensations(
  landmarks: PoseLandmark[],
  angles: Record<string, JointAngle3D>,
  exerciseCategory: ExerciseCategory = 'GENERAL'
): CompensationPattern[] {
  const compensations: CompensationPattern[] = [];

  // Kontrollera att vi har tillräckligt med landmarks
  if (!landmarks || landmarks.length < 33) {
    return compensations;
  }

  // Trunk lean - viktig för LEGS och CORE
  if (exerciseCategory === 'LEGS' || exerciseCategory === 'CORE' || exerciseCategory === 'GENERAL') {
    const trunkLean = detectTrunkLean(landmarks);
    if (trunkLean) compensations.push(trunkLean);
  }

  // Knee valgus - viktig för LEGS
  if (exerciseCategory === 'LEGS' || exerciseCategory === 'GENERAL') {
    const kneeValgus = detectKneeValgus(landmarks, angles);
    if (kneeValgus) compensations.push(kneeValgus);
  }

  // Weight shift - viktig för alla övningar
  const weightShift = detectWeightShift(landmarks);
  if (weightShift) compensations.push(weightShift);

  // Shoulder hike - viktig för UPPER
  if (exerciseCategory === 'UPPER' || exerciseCategory === 'GENERAL') {
    const shoulderHike = detectShoulderHike(landmarks);
    if (shoulderHike) compensations.push(shoulderHike);
  }

  // Hip drop - viktig för BALANCE och enbensstående
  if (exerciseCategory === 'BALANCE' || exerciseCategory === 'GENERAL') {
    const hipDrop = detectHipDrop(landmarks);
    if (hipDrop) compensations.push(hipDrop);
  }

  // Forward head - viktig för alla övningar
  const forwardHead = detectForwardHead(landmarks);
  if (forwardHead) compensations.push(forwardHead);

  // Sortera efter severity (severe först)
  const severityOrder = { severe: 0, moderate: 1, mild: 2 };
  compensations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return compensations;
}

/**
 * Hämta de viktigaste kompensationerna (max N stycken)
 * Bra för att inte överväldiga användaren med för mycket feedback
 */
export function getTopCompensations(
  compensations: CompensationPattern[],
  maxCount: number = 2
): CompensationPattern[] {
  return compensations.slice(0, maxCount);
}

/**
 * Konvertera exercise name till category
 */
export function getExerciseCategory(exerciseName: string): ExerciseCategory {
  const name = exerciseName.toLowerCase();

  if (name.includes('squat') || name.includes('knäböj') ||
      name.includes('lunge') || name.includes('utfall') ||
      name.includes('deadlift') || name.includes('leg')) {
    return 'LEGS';
  }

  if (name.includes('arm') || name.includes('shoulder') || name.includes('axel') ||
      name.includes('push') || name.includes('press') || name.includes('row')) {
    return 'UPPER';
  }

  if (name.includes('plank') || name.includes('bridge') || name.includes('brygga') ||
      name.includes('core') || name.includes('buk')) {
    return 'CORE';
  }

  if (name.includes('balance') || name.includes('single leg') || name.includes('ett ben') ||
      name.includes('stående')) {
    return 'BALANCE';
  }

  return 'GENERAL';
}
