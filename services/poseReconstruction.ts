/**
 * Pose Reconstruction Service
 * Converts 2D MediaPipe landmarks with Z-depth to proper 3D angles
 */

import { POSE_LANDMARKS, PoseLandmark } from './calibrationService';
import { CalibrationData } from '../types';

/**
 * 3D Vector class for calculations
 */
class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  subtract(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  scale(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector3 {
    const mag = this.magnitude();
    if (mag === 0) return new Vector3(0, 0, 0);
    return this.scale(1 / mag);
  }

  static fromLandmark(lm: PoseLandmark): Vector3 {
    return new Vector3(lm.x, lm.y, lm.z);
  }
}

/**
 * Joint angle result with confidence
 */
export interface JointAngle3D {
  name: string;
  angle: number; // degrees
  confidence: number; // 0-1
  plane: 'sagittal' | 'frontal' | 'transverse';
}

/**
 * Body segment with length and orientation
 */
export interface BodySegment {
  name: string;
  length: number;
  direction: Vector3;
  startLandmark: number;
  endLandmark: number;
}

/**
 * Anatomical plane angles
 */
export interface PlaneAngles {
  sagittal: number; // Forward/backward (flexion/extension)
  frontal: number;  // Side to side (abduction/adduction)
  transverse: number; // Rotation
}

/**
 * Calculate angle between three 3D points
 */
function calculate3DAngle(p1: Vector3, p2: Vector3, p3: Vector3): number {
  const v1 = p1.subtract(p2).normalize();
  const v2 = p3.subtract(p2).normalize();

  const dot = Math.max(-1, Math.min(1, v1.dot(v2)));
  return (Math.acos(dot) * 180) / Math.PI;
}

/**
 * Calculate angle in a specific anatomical plane
 */
function calculatePlaneAngle(
  p1: Vector3,
  p2: Vector3,
  p3: Vector3,
  planeNormal: Vector3
): number {
  // Project points onto plane
  const v1 = p1.subtract(p2);
  const v2 = p3.subtract(p2);

  // Remove component along plane normal
  const v1Projected = v1.subtract(planeNormal.scale(v1.dot(planeNormal)));
  const v2Projected = v2.subtract(planeNormal.scale(v2.dot(planeNormal)));

  // Check for zero magnitude vectors to prevent NaN from normalize()
  const v1Mag = v1Projected.magnitude();
  const v2Mag = v2Projected.magnitude();
  if (v1Mag < 0.001 || v2Mag < 0.001) {
    return 0; // Fallback angle when vectors are too small
  }

  const dot = v1Projected.normalize().dot(v2Projected.normalize());
  return (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
}

/**
 * Pose Reconstruction Class
 */
export class PoseReconstructor {
  private calibration: CalibrationData | null = null;
  private smoothingBuffer: Map<string, number[]> = new Map();
  private bufferSize: number = 5;

  constructor(calibration?: CalibrationData) {
    if (calibration) {
      this.calibration = calibration;
    }
  }

  /**
   * Set calibration data
   */
  setCalibration(calibration: CalibrationData): void {
    this.calibration = calibration;
  }

  /**
   * Apply temporal smoothing to angle
   */
  private smoothAngle(name: string, angle: number): number {
    let buffer = this.smoothingBuffer.get(name);
    if (!buffer) {
      buffer = [];
      this.smoothingBuffer.set(name, buffer);
    }

    buffer.push(angle);
    if (buffer.length > this.bufferSize) {
      buffer.shift();
    }

    // Weighted moving average (more recent = more weight)
    let sum = 0;
    let weightSum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const weight = i + 1;
      sum += buffer[i] * weight;
      weightSum += weight;
    }

    return sum / weightSum;
  }

  /**
   * Validate that landmarks are anatomically plausible
   */
  private validateAnatomically(landmarks: PoseLandmark[]): boolean {
    // Check that key body parts are in reasonable positions
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    // Shoulders should be above hips
    if (leftShoulder.y > leftHip.y || rightShoulder.y > rightHip.y) {
      // In normalized coords, y increases downward, so this is valid
    }

    // Shoulder width should be positive
    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    if (shoulderWidth < 0.05) return false;

    // Hips should be below shoulders
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    if (avgHipY < avgShoulderY) return false; // In normalized coords

    return true;
  }

  /**
   * Calculate all relevant joint angles from landmarks
   */
  calculateJointAngles(landmarks: PoseLandmark[]): Record<string, JointAngle3D> {
    const angles: Record<string, JointAngle3D> = {};

    if (!this.validateAnatomically(landmarks)) {
      return angles;
    }

    // Left Elbow
    angles.leftElbow = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      'sagittal'
    );

    // Right Elbow
    angles.rightElbow = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.RIGHT_WRIST,
      'sagittal'
    );

    // Left Shoulder (flexion)
    angles.leftShoulderFlexion = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      'sagittal'
    );

    // Right Shoulder (flexion)
    angles.rightShoulderFlexion = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
      'sagittal'
    );

    // Left Shoulder (abduction - frontal plane)
    angles.leftShoulderAbduction = this.calculateShoulderAbduction(landmarks, 'left');

    // Right Shoulder (abduction - frontal plane)
    angles.rightShoulderAbduction = this.calculateShoulderAbduction(landmarks, 'right');

    // Left Hip
    angles.leftHip = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      'sagittal'
    );

    // Right Hip
    angles.rightHip = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
      'sagittal'
    );

    // Left Knee
    angles.leftKnee = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      'sagittal'
    );

    // Right Knee
    angles.rightKnee = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
      'sagittal'
    );

    // Left Ankle (dorsiflexion)
    angles.leftAnkle = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.LEFT_FOOT_INDEX,
      'sagittal'
    );

    // Right Ankle (dorsiflexion)
    angles.rightAnkle = this.calculateJointAngle(
      landmarks,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
      POSE_LANDMARKS.RIGHT_FOOT_INDEX,
      'sagittal'
    );

    // Spine angle (trunk lean)
    angles.trunkLean = this.calculateTrunkLean(landmarks);

    // Knee valgus/varus
    angles.leftKneeValgus = this.calculateKneeValgus(landmarks, 'left');
    angles.rightKneeValgus = this.calculateKneeValgus(landmarks, 'right');

    return angles;
  }

  /**
   * Calculate a single joint angle
   */
  private calculateJointAngle(
    landmarks: PoseLandmark[],
    idx1: number,
    idx2: number,
    idx3: number,
    plane: 'sagittal' | 'frontal' | 'transverse'
  ): JointAngle3D {
    const p1 = Vector3.fromLandmark(landmarks[idx1]);
    const p2 = Vector3.fromLandmark(landmarks[idx2]);
    const p3 = Vector3.fromLandmark(landmarks[idx3]);

    const rawAngle = calculate3DAngle(p1, p2, p3);
    const confidence = Math.min(
      landmarks[idx1].visibility,
      landmarks[idx2].visibility,
      landmarks[idx3].visibility
    );

    const name = `joint_${idx1}_${idx2}_${idx3}`;
    const smoothedAngle = this.smoothAngle(name, rawAngle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane,
    };
  }

  /**
   * Calculate shoulder abduction angle (arm away from body)
   *
   * FAS 11: Biomekaniskt korrekt implementation
   * Beräknar vinkel i frontalplanet (X-Y) från bålen
   *
   * Anatomisk referens:
   * - 0° = arm längs sidan
   * - 90° = arm horisontellt ut
   * - 180° = arm rakt upp (full elevation)
   */
  private calculateShoulderAbduction(
    landmarks: PoseLandmark[],
    side: 'left' | 'right'
  ): JointAngle3D {
    const shoulderIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_SHOULDER
      : POSE_LANDMARKS.RIGHT_SHOULDER;
    const elbowIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_ELBOW
      : POSE_LANDMARKS.RIGHT_ELBOW;
    const hipIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_HIP
      : POSE_LANDMARKS.RIGHT_HIP;

    const shoulder = landmarks[shoulderIdx];
    const elbow = landmarks[elbowIdx];
    const hip = landmarks[hipIdx];

    // Projicera på frontalplanet (X-Y koordinater)
    // Armvektor: från axel till armbåge
    const armVectorX = elbow.x - shoulder.x;
    const armVectorY = elbow.y - shoulder.y;

    // Bålvektor: från axel till höft (nedåt längs bålen)
    const torsoVectorX = hip.x - shoulder.x;
    const torsoVectorY = hip.y - shoulder.y;

    // Beräkna vinklar med atan2 för korrekt vinkelberäkning
    const armAngle = Math.atan2(armVectorY, armVectorX);
    const torsoAngle = Math.atan2(torsoVectorY, torsoVectorX);

    // Abduktion = skillnad mellan armvinkel och bålvinkel
    let abductionRad = armAngle - torsoAngle;

    // Normalisera till 0-360 range
    while (abductionRad < 0) abductionRad += 2 * Math.PI;
    while (abductionRad > 2 * Math.PI) abductionRad -= 2 * Math.PI;

    // Konvertera till grader
    let abductionAngle = abductionRad * (180 / Math.PI);

    // Justera så att 0° = arm vid sidan, 90° = horisontellt, 180° = uppåt
    // För vänster sida: ökande vinkel = abduktion
    // För höger sida: behöver speglas
    if (side === 'right') {
      abductionAngle = 360 - abductionAngle;
    }

    // Normalisera till 0-180 range för abduktion
    if (abductionAngle > 180) {
      abductionAngle = 360 - abductionAngle;
    }

    // Clamp till anatomiska gränser (0-180°)
    abductionAngle = Math.max(0, Math.min(180, abductionAngle));

    const confidence = Math.min(
      shoulder.visibility ?? 1,
      elbow.visibility ?? 1,
      hip.visibility ?? 1
    );

    const name = `${side}ShoulderAbduction`;
    const smoothedAngle = this.smoothAngle(name, abductionAngle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'frontal',
    };
  }

  /**
   * Calculate trunk lean angle
   */
  private calculateTrunkLean(landmarks: PoseLandmark[]): JointAngle3D {
    const leftShoulder = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.LEFT_SHOULDER]);
    const rightShoulder = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]);
    const leftHip = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.LEFT_HIP]);
    const rightHip = Vector3.fromLandmark(landmarks[POSE_LANDMARKS.RIGHT_HIP]);

    // Midpoints
    const midShoulder = leftShoulder.add(rightShoulder).scale(0.5);
    const midHip = leftHip.add(rightHip).scale(0.5);

    // Trunk direction
    const trunk = midShoulder.subtract(midHip).normalize();

    // Vertical reference (Y-axis, pointing up in screen coords)
    const vertical = new Vector3(0, -1, 0);

    // Angle from vertical
    const dot = trunk.dot(vertical);
    const angle = (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;

    const confidence = Math.min(
      landmarks[POSE_LANDMARKS.LEFT_SHOULDER].visibility,
      landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].visibility,
      landmarks[POSE_LANDMARKS.LEFT_HIP].visibility,
      landmarks[POSE_LANDMARKS.RIGHT_HIP].visibility
    );

    const smoothedAngle = this.smoothAngle('trunkLean', angle);

    return {
      name: 'trunkLean',
      angle: smoothedAngle,
      confidence,
      plane: 'sagittal',
    };
  }

  /**
   * Calculate knee valgus/varus (knee caving in/out)
   *
   * FAS 11: Förbättrad beräkning med Q-vinkel
   *
   * Q-angle (Quadriceps angle):
   * - Vinkel mellan quadriceps-linjen (ASIS→patella) och patellar tendon (patella→tibia)
   * - Normal: 10-15° kvinnor, 8-12° män
   * - >20° = ökad risk för patellofemoral smärta
   *
   * Vi approximerar Q-vinkel från tillgängliga landmarks:
   * - ASIS approximeras från höftposition
   * - Patella = knäposition
   * - Tibial tuberosity = punkt mellan knä och fotled
   */
  private calculateKneeValgus(
    landmarks: PoseLandmark[],
    side: 'left' | 'right'
  ): JointAngle3D {
    const hipIdx = side === 'left' ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP;
    const kneeIdx = side === 'left' ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE;
    const ankleIdx = side === 'left' ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE;

    const hip = landmarks[hipIdx];
    const knee = landmarks[kneeIdx];
    const ankle = landmarks[ankleIdx];

    // Validera landmarks
    if (!hip || !knee || !ankle) {
      return {
        name: `${side}KneeValgus`,
        angle: 0,
        confidence: 0,
        plane: 'frontal',
      };
    }

    // ============================================
    // METOD 1: Q-vinkel approximation
    // ============================================

    // Approximera ASIS (anterior superior iliac spine)
    // ASIS ligger ~5cm framför och ovanför höftleden
    const asis = {
      x: hip.x,
      y: hip.y - 0.03, // Lite ovanför höft i normaliserade koordinater
      z: hip.z - 0.05, // Lite framför (mer anteriort)
    };

    // Tibial tuberosity approximation
    // Ligger ~10% ner på tibia från knät
    const tibialTuberosity = {
      x: knee.x + (ankle.x - knee.x) * 0.1,
      y: knee.y + (ankle.y - knee.y) * 0.1,
      z: knee.z,
    };

    // Beräkna Q-vinkel i frontalplanet (X-Y)
    // Quadriceps-linje: ASIS → Knä (patella)
    const quadLineX = knee.x - asis.x;
    const quadLineY = knee.y - asis.y;

    // Patellar tendon: Knä → Tibial tuberosity
    const patellarLineX = tibialTuberosity.x - knee.x;
    const patellarLineY = tibialTuberosity.y - knee.y;

    // Beräkna vinklar med atan2
    const quadAngle = Math.atan2(quadLineY, quadLineX);
    const patellarAngle = Math.atan2(patellarLineY, patellarLineX);

    // Q-vinkel är skillnaden
    let qAngleDeg = Math.abs(quadAngle - patellarAngle) * (180 / Math.PI);

    // Normalisera Q-vinkel till rimligt intervall
    if (qAngleDeg > 180) qAngleDeg = 360 - qAngleDeg;

    // ============================================
    // METOD 2: Medial deviation (komplement)
    // ============================================

    // Beräkna hip-ankle-linjen
    const hipVec = Vector3.fromLandmark(hip);
    const kneeVec = Vector3.fromLandmark(knee);
    const ankleVec = Vector3.fromLandmark(ankle);

    const hipAnkleLine = ankleVec.subtract(hipVec);
    const hipToKnee = kneeVec.subtract(hipVec);
    const lineLengthSq = hipAnkleLine.dot(hipAnkleLine);

    let deviationMm = 0;
    if (lineLengthSq > 0.0001) {
      const t = hipToKnee.dot(hipAnkleLine) / lineLengthSq;
      const projectedKnee = hipVec.add(hipAnkleLine.scale(t));

      // Medial deviation i X-led
      const deviationNormalized = kneeVec.x - projectedKnee.x;

      // Konvertera till mm
      const bodyHeight = this.calibration?.standingHeight || 0.6;
      const kneeWidthEstimate = bodyHeight * 0.059;
      deviationMm = deviationNormalized * kneeWidthEstimate * 1000;
    }

    // ============================================
    // KOMBINERA BÅDA METRIKERNA
    // ============================================

    // Justera för sida (vänster vs höger knä)
    const signCorrection = side === 'left' ? 1 : -1;
    const adjustedDeviation = deviationMm * signCorrection;

    // Kombinera Q-vinkel med medial deviation
    // Q-vinkel ger biomekanisk kontext, deviation ger dynamisk mätning
    // Negativ deviation = valgus (knä inåt)
    // Positiv deviation = varus (knä utåt)

    // Basera vinkel primärt på deviation men begränsa med Q-vinkel
    let valgusAngle = adjustedDeviation * 1.5; // 1mm ≈ 1.5°

    // Om Q-vinkel är hög, förstärk valgus-varningen
    if (qAngleDeg > 15) {
      valgusAngle *= 1.2; // 20% förstärkning för hög Q-vinkel
    }

    // Clamp till rimliga värden (-30° till 30°)
    valgusAngle = Math.max(-30, Math.min(30, valgusAngle));

    const confidence = Math.min(
      hip.visibility ?? 1,
      knee.visibility ?? 1,
      ankle.visibility ?? 1
    );

    const name = `${side}KneeValgus`;
    const smoothedAngle = this.smoothAngle(name, valgusAngle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'frontal',
    };
  }

  /**
   * FAS 11: Få Q-vinkel för klinisk referens
   * Returnerar approximerad Q-vinkel för en sida
   */
  getQAngle(landmarks: PoseLandmark[], side: 'left' | 'right'): number {
    const hipIdx = side === 'left' ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP;
    const kneeIdx = side === 'left' ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE;
    const ankleIdx = side === 'left' ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE;

    const hip = landmarks[hipIdx];
    const knee = landmarks[kneeIdx];
    const ankle = landmarks[ankleIdx];

    if (!hip || !knee || !ankle) return 0;

    // ASIS approximation
    const asis = { x: hip.x, y: hip.y - 0.03, z: hip.z - 0.05 };

    // Tibial tuberosity
    const tibial = {
      x: knee.x + (ankle.x - knee.x) * 0.1,
      y: knee.y + (ankle.y - knee.y) * 0.1,
    };

    // Q-vinkel beräkning
    const quadAngle = Math.atan2(knee.y - asis.y, knee.x - asis.x);
    const patellarAngle = Math.atan2(tibial.y - knee.y, tibial.x - knee.x);

    let qAngle = Math.abs(quadAngle - patellarAngle) * (180 / Math.PI);
    if (qAngle > 180) qAngle = 360 - qAngle;

    return qAngle;
  }

  // ============================================
  // SPRINT 2B: BIOMEKANISKA FÖRBÄTTRINGAR
  // ============================================

  /**
   * SPRINT 2B: Fotled Inversion/Eversion (Pronation/Supination)
   *
   * Beräknar fotplanets vinkel relativt golvet i frontalplanet.
   * Kritiskt för:
   * - Fotavtrycksanalys (överpronation, supination)
   * - Ankelinstabilitet
   * - Kinetisk kedja vid knävalgus
   *
   * Anatomisk referens:
   * - 0° = neutralt fotplan (parallellt med golvet)
   * - Positiv = inversion (lateral fotrand uppåt)
   * - Negativ = eversion (medial fotrand uppåt)
   *
   * Normal ROM:
   * - Inversion: 0-35°
   * - Eversion: 0-25°
   */
  calculateAnkleInversionEversion(
    landmarks: PoseLandmark[],
    side: 'left' | 'right'
  ): JointAngle3D {
    const heelIdx = side === 'left' ? POSE_LANDMARKS.LEFT_HEEL : POSE_LANDMARKS.RIGHT_HEEL;
    const footIdx = side === 'left' ? POSE_LANDMARKS.LEFT_FOOT_INDEX : POSE_LANDMARKS.RIGHT_FOOT_INDEX;
    const ankleIdx = side === 'left' ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE;

    const heel = landmarks[heelIdx];
    const footIndex = landmarks[footIdx];
    const ankle = landmarks[ankleIdx];

    if (!heel || !footIndex || !ankle) {
      return {
        name: `${side}AnkleInversionEversion`,
        angle: 0,
        confidence: 0,
        plane: 'frontal',
      };
    }

    // Beräkna fotplanets vektor i frontalplanet (X-Z)
    // Foten pekar framåt i Y-riktning, så X-Z ger inverison/eversion
    const footVectorX = footIndex.x - heel.x;
    const footVectorZ = footIndex.z - heel.z;

    // Häl-tålinjen i förhållande till golvet (antag golv = z = 0)
    // Om tårna är lateralt förskjutna i förhållande till hälen = supination (inversion)
    // Om tårna är medialt förskjutna = pronation (eversion)

    // Använd även heel-ankle förhållande för bättre precision
    const ankleHeelX = heel.x - ankle.x;
    const ankleFootX = footIndex.x - ankle.x;

    // Beräkna relativ lateral/medial förskjutning
    // För vänster fot: mer lateral (positiv X) = inversion
    // För höger fot: mer medial (positiv X) = eversion (spegla)
    const lateralOffset = side === 'left'
      ? (footIndex.x - heel.x)
      : -(footIndex.x - heel.x);

    // Konvertera till vinkel
    // Estimera fotsegmentlängd
    const footLength = Math.sqrt(
      Math.pow(footIndex.x - heel.x, 2) +
      Math.pow(footIndex.y - heel.y, 2) +
      Math.pow(footIndex.z - heel.z, 2)
    );

    // Beräkna vinkel från lateral offset
    let angle = 0;
    if (footLength > 0.01) {
      // Arcsin av lateral offset / footlength ger approximativ inversion/eversion
      const ratio = lateralOffset / footLength;
      const clampedRatio = Math.max(-1, Math.min(1, ratio));
      angle = Math.asin(clampedRatio) * (180 / Math.PI);
    }

    // Clamp till anatomiska gränser
    angle = Math.max(-25, Math.min(35, angle));

    const confidence = Math.min(
      heel.visibility ?? 1,
      footIndex.visibility ?? 1,
      ankle.visibility ?? 1
    );

    const name = `${side}AnkleInversionEversion`;
    const smoothedAngle = this.smoothAngle(name, angle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'frontal',
    };
  }

  /**
   * SPRINT 2B: Axelrotation (Intern/Extern)
   *
   * Beräknar axelns rotation i transversalplanet.
   * Kritiskt för:
   * - Rotatorkuff-bedömning
   * - Scapulär dyskinesi
   * - Kastidrottare, overhead atleter
   *
   * Metod: Triangulering med handleds-armbåge-axelposition
   * - IR = handleden medialt om armbågen (nära kroppen)
   * - ER = handleden lateralt om armbågen (bort från kroppen)
   *
   * Anatomisk referens (arm i 90° abduktion):
   * - 0° = underarm horisontell framåt
   * - Positiv = extern rotation (underarm uppåt/bakåt)
   * - Negativ = intern rotation (underarm nedåt/framåt)
   *
   * Normal ROM:
   * - Extern rotation: 0-90°
   * - Intern rotation: 0-70°
   */
  calculateShoulderRotation(
    landmarks: PoseLandmark[],
    side: 'left' | 'right'
  ): JointAngle3D {
    const shoulderIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_SHOULDER
      : POSE_LANDMARKS.RIGHT_SHOULDER;
    const elbowIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_ELBOW
      : POSE_LANDMARKS.RIGHT_ELBOW;
    const wristIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_WRIST
      : POSE_LANDMARKS.RIGHT_WRIST;
    const hipIdx = side === 'left'
      ? POSE_LANDMARKS.LEFT_HIP
      : POSE_LANDMARKS.RIGHT_HIP;

    const shoulder = landmarks[shoulderIdx];
    const elbow = landmarks[elbowIdx];
    const wrist = landmarks[wristIdx];
    const hip = landmarks[hipIdx];

    if (!shoulder || !elbow || !wrist || !hip) {
      return {
        name: `${side}ShoulderRotation`,
        angle: 0,
        confidence: 0,
        plane: 'transverse',
      };
    }

    // Beräkna överarmsvektor (axel → armbåge)
    const upperArmVec = Vector3.fromLandmark(elbow).subtract(Vector3.fromLandmark(shoulder));

    // Beräkna underarmsvektor (armbåge → handled)
    const forearmVec = Vector3.fromLandmark(wrist).subtract(Vector3.fromLandmark(elbow));

    // Beräkna kroppens mittlinje för referens
    const shoulderToHip = Vector3.fromLandmark(hip).subtract(Vector3.fromLandmark(shoulder));

    // För att mäta rotation behöver vi projicera underarmen på planet
    // vinkelrätt mot överarmen

    // Normalisera överarmen
    const upperArmNorm = upperArmVec.normalize();

    // Projicera underarmen på planet vinkelrätt mot överarmen
    const forearmProjComponent = upperArmNorm.scale(forearmVec.dot(upperArmNorm));
    const forearmProjected = forearmVec.subtract(forearmProjComponent);

    // Skapa en referensvektor för 0° rotation
    // (antag att framåt i Z är neutral position när armen är i sidan)
    // Vi använder en vertikal referens som sedan justeras för armens position
    const verticalRef = new Vector3(0, 1, 0);

    // Projicera vertikalen på samma plan
    const vertProjComponent = upperArmNorm.scale(verticalRef.dot(upperArmNorm));
    const verticalProjected = verticalRef.subtract(vertProjComponent);

    // Beräkna vinkel mellan projicerad underarm och referens
    const forearmNorm = forearmProjected.magnitude() > 0.001
      ? forearmProjected.normalize()
      : new Vector3(0, 0, 1);
    const vertNorm = verticalProjected.magnitude() > 0.001
      ? verticalProjected.normalize()
      : new Vector3(0, 1, 0);

    // Dot product ger cos(vinkel)
    const dotProduct = Math.max(-1, Math.min(1, forearmNorm.dot(vertNorm)));
    let rotationAngle = Math.acos(dotProduct) * (180 / Math.PI);

    // Bestäm tecken (IR vs ER) baserat på korsprodukt
    const crossProduct = forearmNorm.cross(vertNorm);
    const sign = crossProduct.dot(upperArmNorm);

    // Justera tecken baserat på sida
    if (side === 'left') {
      rotationAngle = sign > 0 ? -rotationAngle : rotationAngle;
    } else {
      rotationAngle = sign > 0 ? rotationAngle : -rotationAngle;
    }

    // Clamp till anatomiska gränser
    rotationAngle = Math.max(-70, Math.min(90, rotationAngle));

    const confidence = Math.min(
      shoulder.visibility ?? 1,
      elbow.visibility ?? 1,
      wrist.visibility ?? 1
    );

    const name = `${side}ShoulderRotation`;
    const smoothedAngle = this.smoothAngle(name, rotationAngle);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'transverse',
    };
  }

  /**
   * SPRINT 2B: Lumbalsegmentering (Lumbalflexion vs Höftflexion)
   *
   * Kritiskt för ryggrehab - skiljer mellan:
   * - Lumbalflexion (böjning i ländryggen)
   * - Höftflexion (böjning i höftleden)
   *
   * Många patienter kompenserar begränsad höftmobilitet med ökad lumbalflexion,
   * vilket kan förvärra ryggbesvär.
   *
   * Metod: Thoracolumbar junction approximation
   * - Använd höft-axel-linje + shoulder-hip-knee vinkel
   * - Isolera lumbalrörelse från höftflexion
   *
   * Normal ROM:
   * - Lumbalflexion: 0-60°
   * - Lumbalextension: 0-25°
   */
  calculateLumbarFlexion(landmarks: PoseLandmark[]): JointAngle3D {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee) {
      return {
        name: 'lumbarFlexion',
        angle: 0,
        confidence: 0,
        plane: 'sagittal',
      };
    }

    // Beräkna mittpunkter
    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
      z: (leftShoulder.z + rightShoulder.z) / 2,
    };
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: (leftHip.z + rightHip.z) / 2,
    };
    const midKnee = {
      x: (leftKnee.x + rightKnee.x) / 2,
      y: (leftKnee.y + rightKnee.y) / 2,
      z: (leftKnee.z + rightKnee.z) / 2,
    };

    // Approximera thoracolumbar junction (T12-L1)
    // Ligger ungefär 60% upp från höft till axel
    const thoracolumbar = {
      x: midHip.x + (midShoulder.x - midHip.x) * 0.4,
      y: midHip.y + (midShoulder.y - midHip.y) * 0.4,
      z: midHip.z + (midShoulder.z - midHip.z) * 0.4,
    };

    // Beräkna bålvinkel (thoracolumbar → axlar) relativt vertikal
    // Detta ger thorakalflexion
    const upperTrunkVec = {
      x: midShoulder.x - thoracolumbar.x,
      y: midShoulder.y - thoracolumbar.y,
    };

    // Beräkna lumbalvinkel (höft → thoracolumbar) relativt vertikal
    const lowerTrunkVec = {
      x: thoracolumbar.x - midHip.x,
      y: thoracolumbar.y - midHip.y,
    };

    // Vertikal referens (Y-axeln pekar nedåt i normaliserade koordinater)
    const verticalAngle = Math.atan2(0, -1); // -90° (rakt upp i skärmkoordinater)

    // Lumbal segment vinkel relativt vertikal
    const lumbarAngle = Math.atan2(lowerTrunkVec.x, -lowerTrunkVec.y);
    let lumbarFlexion = lumbarAngle * (180 / Math.PI);

    // Justera så att 0° = rakt stående
    // Positiv = framåtlutning (flexion)
    // Negativ = bakåtlutning (extension)

    // Clamp till anatomiska gränser
    lumbarFlexion = Math.max(-25, Math.min(60, lumbarFlexion));

    const confidence = Math.min(
      leftShoulder.visibility ?? 1,
      rightShoulder.visibility ?? 1,
      leftHip.visibility ?? 1,
      rightHip.visibility ?? 1
    );

    const name = 'lumbarFlexion';
    const smoothedAngle = this.smoothAngle(name, lumbarFlexion);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'sagittal',
    };
  }

  /**
   * SPRINT 2B: Torakalrotation
   *
   * Beräknar rotation mellan bäcken och bröstkorgen i transversalplanet.
   * Vanlig dysfunktion hos kontorsarbetare med stelhet i bröstryggen.
   *
   * Metod: Skillnad mellan axellinjens och höftlinjens orientering (ovanifrån)
   *
   * Anatomisk referens:
   * - 0° = axlar och höfter parallella
   * - Positiv = axlar roterade åt höger (relativt höfter)
   * - Negativ = axlar roterade åt vänster
   *
   * Normal ROM:
   * - Thorakal rotation: 0-45° åt varje håll
   */
  calculateThoracicRotation(landmarks: PoseLandmark[]): JointAngle3D {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return {
        name: 'thoracicRotation',
        angle: 0,
        confidence: 0,
        plane: 'transverse',
      };
    }

    // Beräkna axellinjens orientering i transversalplanet (X-Z)
    const shoulderLineX = rightShoulder.x - leftShoulder.x;
    const shoulderLineZ = rightShoulder.z - leftShoulder.z;
    const shoulderAngle = Math.atan2(shoulderLineZ, shoulderLineX);

    // Beräkna höftlinjens orientering
    const hipLineX = rightHip.x - leftHip.x;
    const hipLineZ = rightHip.z - leftHip.z;
    const hipAngle = Math.atan2(hipLineZ, hipLineX);

    // Rotationsskillnad
    let rotationRad = shoulderAngle - hipAngle;

    // Normalisera till -180 till 180
    while (rotationRad > Math.PI) rotationRad -= 2 * Math.PI;
    while (rotationRad < -Math.PI) rotationRad += 2 * Math.PI;

    let rotationDeg = rotationRad * (180 / Math.PI);

    // Clamp till anatomiska gränser
    rotationDeg = Math.max(-45, Math.min(45, rotationDeg));

    const confidence = Math.min(
      leftShoulder.visibility ?? 1,
      rightShoulder.visibility ?? 1,
      leftHip.visibility ?? 1,
      rightHip.visibility ?? 1
    );

    const name = 'thoracicRotation';
    const smoothedAngle = this.smoothAngle(name, rotationDeg);

    return {
      name,
      angle: smoothedAngle,
      confidence,
      plane: 'transverse',
    };
  }

  /**
   * SPRINT 2B: Utökad calculateJointAngles med alla nya vinklar
   */
  calculateJointAnglesExtended(landmarks: PoseLandmark[]): Record<string, JointAngle3D> {
    // Börja med standardvinklar
    const angles = this.calculateJointAngles(landmarks);

    // Lägg till nya biomekaniska vinklar

    // Fotled inversion/eversion
    angles.leftAnkleInvEv = this.calculateAnkleInversionEversion(landmarks, 'left');
    angles.rightAnkleInvEv = this.calculateAnkleInversionEversion(landmarks, 'right');

    // Axelrotation
    angles.leftShoulderRotation = this.calculateShoulderRotation(landmarks, 'left');
    angles.rightShoulderRotation = this.calculateShoulderRotation(landmarks, 'right');

    // Lumbalflexion
    angles.lumbarFlexion = this.calculateLumbarFlexion(landmarks);

    // Torakalrotation
    angles.thoracicRotation = this.calculateThoracicRotation(landmarks);

    return angles;
  }

  /**
   * FAS 9: Ny funktion - Beräkna angular velocity för en led
   * Används för velocity-baserad fasdetektering
   */
  private previousAngles: Map<string, { angle: number; timestamp: number }> = new Map();

  calculateAngularVelocity(jointName: string, currentAngle: number): number {
    const now = performance.now();
    const previous = this.previousAngles.get(jointName);

    if (!previous) {
      this.previousAngles.set(jointName, { angle: currentAngle, timestamp: now });
      return 0;
    }

    const timeDiff = (now - previous.timestamp) / 1000; // sekunder
    if (timeDiff < 0.001) return 0; // Undvik division med mycket små tal

    const angleDiff = currentAngle - previous.angle;
    const velocity = angleDiff / timeDiff; // grader per sekund

    // Uppdatera för nästa beräkning
    this.previousAngles.set(jointName, { angle: currentAngle, timestamp: now });

    return velocity;
  }

  /**
   * FAS 9: Få angular velocity för alla huvudsakliga leder
   */
  getJointVelocities(angles: Record<string, JointAngle3D>): Record<string, number> {
    const velocities: Record<string, number> = {};

    for (const [name, jointAngle] of Object.entries(angles)) {
      velocities[name] = this.calculateAngularVelocity(name, jointAngle.angle);
    }

    return velocities;
  }

  /**
   * FAS 9: Återställ velocity tracking (vid nytt set/övning)
   */
  resetVelocityTracking(): void {
    this.previousAngles.clear();
  }

  /**
   * Get body segments with lengths
   */
  getBodySegments(landmarks: PoseLandmark[]): BodySegment[] {
    const segments: BodySegment[] = [];

    const addSegment = (name: string, start: number, end: number) => {
      const p1 = Vector3.fromLandmark(landmarks[start]);
      const p2 = Vector3.fromLandmark(landmarks[end]);
      const direction = p2.subtract(p1);
      const length = direction.magnitude();

      segments.push({
        name,
        length,
        direction: direction.normalize(),
        startLandmark: start,
        endLandmark: end,
      });
    };

    // Upper body
    addSegment('leftUpperArm', POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW);
    addSegment('leftForearm', POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST);
    addSegment('rightUpperArm', POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW);
    addSegment('rightForearm', POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST);

    // Torso
    addSegment('shoulders', POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER);
    addSegment('hips', POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP);

    // Lower body
    addSegment('leftThigh', POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE);
    addSegment('leftShin', POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE);
    addSegment('rightThigh', POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE);
    addSegment('rightShin', POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE);

    return segments;
  }

  /**
   * Calculate symmetry between left and right sides
   * Returns 0-100 (100 = perfect symmetry)
   */
  calculateSymmetry(angles: Record<string, JointAngle3D>): number {
    const pairs = [
      ['leftElbow', 'rightElbow'],
      ['leftShoulderFlexion', 'rightShoulderFlexion'],
      ['leftHip', 'rightHip'],
      ['leftKnee', 'rightKnee'],
      ['leftAnkle', 'rightAnkle'],
    ];

    let totalDiff = 0;
    let count = 0;

    for (const [left, right] of pairs) {
      if (angles[left] && angles[right]) {
        const diff = Math.abs(angles[left].angle - angles[right].angle);
        // Normalize diff: 0 diff = 100, 30+ diff = 0
        const symmetryScore = Math.max(0, 100 - (diff / 30) * 100);
        totalDiff += symmetryScore;
        count++;
      }
    }

    return count > 0 ? totalDiff / count : 100;
  }

  /**
   * Clear smoothing buffers (call when starting new exercise)
   */
  resetSmoothing(): void {
    this.smoothingBuffer.clear();
  }
}

// Singleton instance
let poseReconstructorInstance: PoseReconstructor | null = null;

export function getPoseReconstructor(): PoseReconstructor {
  if (!poseReconstructorInstance) {
    poseReconstructorInstance = new PoseReconstructor();
  }
  return poseReconstructorInstance;
}
