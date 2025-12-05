/**
 * Exercise Animations Data
 * Keyframe animations for common rehabilitation exercises
 */

import { ExerciseAnimationData, PoseKeyframe } from '../services/avatarAnimationService';

// Helper to create symmetric arm movements
const createArmKeyframe = (
  time: number,
  leftShoulder: [number, number, number],
  leftElbow: [number, number, number],
  rightShoulder: [number, number, number],
  rightElbow: [number, number, number],
  expression: PoseKeyframe['expression'] = 'neutral'
): PoseKeyframe => ({
  time,
  joints: {
    leftShoulder: { x: leftShoulder[0], y: leftShoulder[1], z: leftShoulder[2] },
    leftElbow: { x: leftElbow[0], y: leftElbow[1], z: leftElbow[2] },
    rightShoulder: { x: rightShoulder[0], y: rightShoulder[1], z: rightShoulder[2] },
    rightElbow: { x: rightElbow[0], y: rightElbow[1], z: rightElbow[2] },
  },
  expression,
});

// Helper to create leg movements
const createLegKeyframe = (
  time: number,
  leftHip: [number, number, number],
  leftKnee: [number, number, number],
  rightHip: [number, number, number],
  rightKnee: [number, number, number],
  rootY: number = 0,
  expression: PoseKeyframe['expression'] = 'focused'
): PoseKeyframe => ({
  time,
  joints: {
    leftHip: { x: leftHip[0], y: leftHip[1], z: leftHip[2] },
    leftKnee: { x: leftKnee[0], y: leftKnee[1], z: leftKnee[2] },
    rightHip: { x: rightHip[0], y: rightHip[1], z: rightHip[2] },
    rightKnee: { x: rightKnee[0], y: rightKnee[1], z: rightKnee[2] },
  },
  rootPosition: { x: 0, y: rootY, z: 0 },
  expression,
});

/**
 * 1. Shoulder Flexion (Axelflexion / Armlyft framåt)
 */
export const shoulderFlexionAnimation: ExerciseAnimationData = {
  exerciseName: 'Axelflexion',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftShoulder: { x: -Math.PI / 4, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 4, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        leftShoulder: { x: -Math.PI / 4, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 4, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.5, description: 'Lyft armarna framåt och uppåt' },
    { name: 'Sänk', startTime: 0.5, endTime: 1, description: 'Sänk armarna kontrollerat' },
  ],
};

/**
 * 2. Squat (Knäböj)
 */
export const squatAnimation: ExerciseAnimationData = {
  exerciseName: 'Knäböj',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 6 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 6 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 6, y: 0, z: 0 },
        leftAnkle: { x: -Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 6, y: 0, z: 0 },
        rightAnkle: { x: -Math.PI / 12, y: 0, z: 0 },
        spine: { x: Math.PI / 24, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 8 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 8 },
      },
      rootPosition: { x: 0, y: -0.1, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2.5, y: 0, z: 0 },
        leftAnkle: { x: -Math.PI / 8, y: 0, z: 0 },
        rightHip: { x: Math.PI / 3, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2.5, y: 0, z: 0 },
        rightAnkle: { x: -Math.PI / 8, y: 0, z: 0 },
        spine: { x: Math.PI / 12, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 3, y: 0, z: Math.PI / 12 },
        rightShoulder: { x: -Math.PI / 3, y: 0, z: -Math.PI / 12 },
      },
      rootPosition: { x: 0, y: -0.3, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.75,
      joints: {
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 6, y: 0, z: 0 },
        leftAnkle: { x: -Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 6, y: 0, z: 0 },
        rightAnkle: { x: -Math.PI / 12, y: 0, z: 0 },
        spine: { x: Math.PI / 24, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 8 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 8 },
      },
      rootPosition: { x: 0, y: -0.1, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 6 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 6 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Nedfas', startTime: 0, endTime: 0.5, description: 'Böj knäna och sänk höfterna' },
    { name: 'Uppfas', startTime: 0.5, endTime: 1, description: 'Tryck upp genom hälarna' },
  ],
};

/**
 * 3. Lunge (Utfall)
 */
export const lungeAnimation: ExerciseAnimationData = {
  exerciseName: 'Utfall',
  category: 'strength',
  duration: 5,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.2,
      joints: {
        leftHip: { x: -Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 6, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.1, z: 0.1 },
      expression: 'focused',
    },
    {
      time: 0.4,
      joints: {
        leftHip: { x: -Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 3, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.25, z: 0.2 },
      expression: 'focused',
    },
    {
      time: 0.6,
      joints: {
        leftHip: { x: -Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 3, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.25, z: 0.2 },
      expression: 'encouraging',
    },
    {
      time: 0.8,
      joints: {
        leftHip: { x: -Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 6, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.1, z: 0.1 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Steg fram', startTime: 0, endTime: 0.4, description: 'Kliv fram med ett ben' },
    { name: 'Håll', startTime: 0.4, endTime: 0.6, description: 'Håll positionen' },
    { name: 'Tillbaka', startTime: 0.6, endTime: 1, description: 'Tryck tillbaka till start' },
  ],
};

/**
 * 4. Standing Hip Abduction (Höftabduktion stående)
 */
export const hipAbductionAnimation: ExerciseAnimationData = {
  exerciseName: 'Höftabduktion',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftHip: { x: 0, y: 0, z: Math.PI / 8 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.05, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: -Math.PI / 24 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftHip: { x: 0, y: 0, z: Math.PI / 4 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.1, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: -Math.PI / 16 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        leftHip: { x: 0, y: 0, z: Math.PI / 8 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.05, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: -Math.PI / 24 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.5, description: 'Lyft benet utåt' },
    { name: 'Sänk', startTime: 0.5, endTime: 1, description: 'Sänk benet kontrollerat' },
  ],
};

/**
 * 5. Seated Knee Extension (Knästräckning sittande)
 */
export const kneeExtensionAnimation: ExerciseAnimationData = {
  exerciseName: 'Knästräckning',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.4, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.4, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.4, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Sträck', startTime: 0, endTime: 0.5, description: 'Sträck ut knät' },
    { name: 'Böj', startTime: 0.5, endTime: 1, description: 'Böj tillbaka kontrollerat' },
  ],
};

/**
 * 6. Standing Calf Raise (Tåhävning)
 */
export const calfRaiseAnimation: ExerciseAnimationData = {
  exerciseName: 'Tåhävning',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftAnkle: { x: -Math.PI / 8, y: 0, z: 0 },
        rightAnkle: { x: -Math.PI / 8, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.05, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftAnkle: { x: -Math.PI / 4, y: 0, z: 0 },
        rightAnkle: { x: -Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.1, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        leftAnkle: { x: -Math.PI / 8, y: 0, z: 0 },
        rightAnkle: { x: -Math.PI / 8, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.05, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.5, description: 'Lyft upp på tårna' },
    { name: 'Sänk', startTime: 0.5, endTime: 1, description: 'Sänk hälarna kontrollerat' },
  ],
};

/**
 * 7. Single Leg Balance (Enbensstående)
 */
export const singleLegBalanceAnimation: ExerciseAnimationData = {
  exerciseName: 'Enbensstående',
  category: 'balance',
  duration: 6,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 6 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 6 },
      },
      expression: 'neutral',
    },
    {
      time: 0.15,
      joints: {
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.05, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 4 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 4 },
      },
      expression: 'focused',
    },
    {
      time: 0.3,
      joints: {
        leftHip: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.05, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 3 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 3 },
      },
      expression: 'focused',
    },
    {
      time: 0.7,
      joints: {
        leftHip: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.05, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 3 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 3 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.85,
      joints: {
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0.05, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 4 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 4 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 6 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 6 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.3, description: 'Lyft vänster ben' },
    { name: 'Balansera', startTime: 0.3, endTime: 0.7, description: 'Håll balansen' },
    { name: 'Sänk', startTime: 0.7, endTime: 1, description: 'Sänk benet kontrollerat' },
  ],
};

/**
 * 8. Trunk Rotation (Bålrotation)
 */
export const trunkRotationAnimation: ExerciseAnimationData = {
  exerciseName: 'Bålrotation',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        spine: { x: 0, y: Math.PI / 6, z: 0 },
        chest: { x: 0, y: Math.PI / 8, z: 0 },
        neck: { x: 0, y: Math.PI / 12, z: 0 },
        leftShoulder: { x: -Math.PI / 12, y: 0, z: 0 },
        rightShoulder: { x: Math.PI / 12, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.75,
      joints: {
        spine: { x: 0, y: -Math.PI / 6, z: 0 },
        chest: { x: 0, y: -Math.PI / 8, z: 0 },
        neck: { x: 0, y: -Math.PI / 12, z: 0 },
        leftShoulder: { x: Math.PI / 12, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 12, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Höger', startTime: 0, endTime: 0.25, description: 'Rotera höger' },
    { name: 'Center', startTime: 0.25, endTime: 0.5, description: 'Tillbaka till mitten' },
    { name: 'Vänster', startTime: 0.5, endTime: 0.75, description: 'Rotera vänster' },
    { name: 'Center', startTime: 0.75, endTime: 1, description: 'Tillbaka till mitten' },
  ],
};

/**
 * 9. Shoulder External Rotation (Axel utåtrotation)
 */
export const shoulderExternalRotationAnimation: ExerciseAnimationData = {
  exerciseName: 'Axel utåtrotation',
  category: 'mobility',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftShoulder: { x: 0, y: -Math.PI / 8, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: Math.PI / 8, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: 0, y: -Math.PI / 4, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: Math.PI / 4, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        leftShoulder: { x: 0, y: -Math.PI / 8, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: Math.PI / 8, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Utåt', startTime: 0, endTime: 0.5, description: 'Rotera underarmarna utåt' },
    { name: 'Inåt', startTime: 0.5, endTime: 1, description: 'Återgå till start' },
  ],
};

/**
 * 10. Wall Push-up (Väggpress)
 */
export const wallPushUpAnimation: ExerciseAnimationData = {
  exerciseName: 'Väggpress',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 8 },
        leftElbow: { x: 0, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 8 },
        rightElbow: { x: 0, y: 0, z: 0 },
        rightWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 6 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: 0 },
        rightWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: Math.PI / 24, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0.05 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 5 },
        leftElbow: { x: Math.PI / 2.5, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 5 },
        rightElbow: { x: Math.PI / 2.5, y: 0, z: 0 },
        rightWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: Math.PI / 16, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0.1 },
      expression: 'focused',
    },
    {
      time: 0.75,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 6 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: 0 },
        rightWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: Math.PI / 24, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0.05 },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 8 },
        leftElbow: { x: 0, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 8 },
        rightElbow: { x: 0, y: 0, z: 0 },
        rightWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Nedfas', startTime: 0, endTime: 0.5, description: 'Böj armarna mot väggen' },
    { name: 'Uppfas', startTime: 0.5, endTime: 1, description: 'Tryck ifrån' },
  ],
};

/**
 * Create idle animation (subtle breathing)
 */
export const idleAnimation: ExerciseAnimationData = {
  exerciseName: 'Idle',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        chest: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0.05 },
        rightShoulder: { x: 0, y: 0, z: -0.05 },
      },
      expression: 'neutral',
    },
    {
      time: 0.5,
      joints: {
        chest: { x: -0.02, y: 0, z: 0 },
        leftShoulder: { x: -0.02, y: 0, z: 0.07 },
        rightShoulder: { x: -0.02, y: 0, z: -0.07 },
      },
      expression: 'neutral',
    },
    {
      time: 1,
      joints: {
        chest: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0.05 },
        rightShoulder: { x: 0, y: 0, z: -0.05 },
      },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Andas in', startTime: 0, endTime: 0.5, description: 'Inandning' },
    { name: 'Andas ut', startTime: 0.5, endTime: 1, description: 'Utandning' },
  ],
};

// ==========================================
// LIGGANDE ANIMATIONER (LYING POSITION)
// ==========================================

/**
 * 11. Glute Bridge / Bäckenlyft (Lying)
 * Patient lies on back, lifts hips toward ceiling
 */
export const gluteBridgeAnimation: ExerciseAnimationData = {
  exerciseName: 'Bäckenlyft',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start position: lying on back, knees bent
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: Math.PI / 3, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        // Lift hips - pelvis tilts, spine extends slightly
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        spine: { x: -Math.PI / 12, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.15, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full bridge - hips fully extended
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: -Math.PI / 8, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.25, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold at top
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        spine: { x: -Math.PI / 8, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.25, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return to start
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: Math.PI / 3, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.5, description: 'Lyft höfterna mot taket' },
    { name: 'Håll', startTime: 0.5, endTime: 0.7, description: 'Spänn sätesmusklerna' },
    { name: 'Sänk', startTime: 0.7, endTime: 1, description: 'Sänk kontrollerat' },
  ],
};

/**
 * 12. Clamshell / Musslan (Sidelying)
 * Patient lies on side, opens top knee like a clamshell
 */
export const clamshellAnimation: ExerciseAnimationData = {
  exerciseName: 'Musslan',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: side-lying, knees together, bent ~45°
        leftHip: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        rightHip: { x: Math.PI / 4, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        // Top arm resting on hip
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        // Open top knee (left leg abducts)
        leftHip: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        leftKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        rightHip: { x: Math.PI / 4, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full open position
        leftHip: { x: Math.PI / 4, y: 0, z: Math.PI / 3 },
        leftKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        rightHip: { x: Math.PI / 4, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        // Start closing
        leftHip: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        leftKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        rightHip: { x: Math.PI / 4, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Closed
        leftHip: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        rightHip: { x: Math.PI / 4, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 3, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Öppna', startTime: 0, endTime: 0.5, description: 'Öppna knät som en mussla' },
    { name: 'Stäng', startTime: 0.5, endTime: 1, description: 'Stäng kontrollerat' },
  ],
};

/**
 * 13. McGill Curl-up (Lying)
 * Spine-safe crunch with one leg bent, hands under lower back
 */
export const mcGillCurlUpAnimation: ExerciseAnimationData = {
  exerciseName: 'McGill Curl-up',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: lying flat, one knee bent, hands under low back
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        // Elbows slightly out (hands under back)
        leftElbow: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: -Math.PI / 6 },
      },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        // Begin curl - head and shoulders lift slightly
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: Math.PI / 12, y: 0, z: 0 },
        chest: { x: Math.PI / 16, y: 0, z: 0 },
        neck: { x: Math.PI / 12, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: -Math.PI / 6 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full curl - shoulders off ground, spine neutral
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: Math.PI / 8, y: 0, z: 0 },
        chest: { x: Math.PI / 10, y: 0, z: 0 },
        neck: { x: Math.PI / 8, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: -Math.PI / 6 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: Math.PI / 8, y: 0, z: 0 },
        chest: { x: Math.PI / 10, y: 0, z: 0 },
        neck: { x: Math.PI / 8, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: -Math.PI / 6 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
        rightElbow: { x: Math.PI / 4, y: 0, z: -Math.PI / 6 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.5, description: 'Lyft huvud och axlar' },
    { name: 'Håll', startTime: 0.5, endTime: 0.7, description: 'Håll med spänd buk' },
    { name: 'Sänk', startTime: 0.7, endTime: 1, description: 'Sänk kontrollerat' },
  ],
};

/**
 * 14. Cobra / Prone Press-up (Lying - prone)
 * Patient lies on stomach, presses up with arms
 */
export const cobraAnimation: ExerciseAnimationData = {
  exerciseName: 'Cobra',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: lying prone (face down), arms bent at sides
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: Math.PI / 4, y: 0, z: Math.PI / 4 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightShoulder: { x: Math.PI / 4, y: 0, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        // Begin extension - press up slightly
        spine: { x: -Math.PI / 8, y: 0, z: 0 },
        chest: { x: -Math.PI / 10, y: 0, z: 0 },
        neck: { x: -Math.PI / 12, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: Math.PI / 6 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 6 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full cobra - upper body lifted
        spine: { x: -Math.PI / 4, y: 0, z: 0 },
        chest: { x: -Math.PI / 6, y: 0, z: 0 },
        neck: { x: -Math.PI / 8, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 8 },
        leftElbow: { x: Math.PI / 6, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 8 },
        rightElbow: { x: Math.PI / 6, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold at top
        spine: { x: -Math.PI / 4, y: 0, z: 0 },
        chest: { x: -Math.PI / 6, y: 0, z: 0 },
        neck: { x: -Math.PI / 8, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 6, y: 0, z: Math.PI / 8 },
        leftElbow: { x: Math.PI / 6, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -Math.PI / 8 },
        rightElbow: { x: Math.PI / 6, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return to prone
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: Math.PI / 4, y: 0, z: Math.PI / 4 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightShoulder: { x: Math.PI / 4, y: 0, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Pressa upp', startTime: 0, endTime: 0.5, description: 'Pressa upp överkroppen' },
    { name: 'Håll', startTime: 0.5, endTime: 0.7, description: 'Håll och andas' },
    { name: 'Sänk', startTime: 0.7, endTime: 1, description: 'Sänk kontrollerat' },
  ],
};

/**
 * 15. Heel Slides / Hälglidning (Lying)
 * Patient lies on back, slides heel toward buttocks
 */
export const heelSlideAnimation: ExerciseAnimationData = {
  exerciseName: 'Hälglidning',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: lying flat, legs extended
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        // Begin sliding - left heel moves toward buttocks
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full bend - heel close to buttocks
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.75,
      joints: {
        // Begin extending
        leftHip: { x: Math.PI / 6, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return to start
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Böj', startTime: 0, endTime: 0.5, description: 'Glid hälen mot rumpan' },
    { name: 'Sträck', startTime: 0.5, endTime: 1, description: 'Sträck ut benet kontrollerat' },
  ],
};

/**
 * 16. Side Plank / Sidoplanka (Sidelying)
 * Patient lies on side, lifts hips to form straight line
 */
export const sidePlankAnimation: ExerciseAnimationData = {
  exerciseName: 'Sidoplanka',
  category: 'strength',
  duration: 5,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: side-lying, body straight, elbow under shoulder
        spine: { x: 0, y: 0, z: 0 },
        // Support arm (right) bent at elbow
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        // Top arm on hip
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        // Legs stacked
        leftHip: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        // Begin lifting hips
        spine: { x: 0, y: 0, z: 0.05 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        leftHip: { x: 0, y: 0, z: 0.1 },
        rightHip: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.1, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.4,
      joints: {
        // Full plank - body straight, hips lifted
        spine: { x: 0, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        leftHip: { x: 0, y: 0, z: 0.15 },
        rightHip: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.2, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold position
        spine: { x: 0, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        leftHip: { x: 0, y: 0, z: 0.15 },
        rightHip: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.2, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Lower back down
        spine: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 3, y: 0, z: 0 },
        leftHip: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.4, description: 'Lyft höften från golvet' },
    { name: 'Håll', startTime: 0.4, endTime: 0.7, description: 'Håll kroppen rak' },
    { name: 'Sänk', startTime: 0.7, endTime: 1, description: 'Sänk kontrollerat' },
  ],
};

// ==========================================
// SITTANDE ANIMATIONER (SITTING POSITION)
// ==========================================

/**
 * 17. Chin Tuck / Retraktion av Nacke (Sitting)
 * Patient sits, pulls chin straight back
 */
export const chinTuckAnimation: ExerciseAnimationData = {
  exerciseName: 'Retraktion av Nacke',
  category: 'mobility',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: sitting upright, neutral neck
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        // Begin chin tuck - head moves back
        neck: { x: Math.PI / 24, y: 0, z: 0 },
        head: { x: -Math.PI / 16, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full chin tuck - "double chin" position
        neck: { x: Math.PI / 16, y: 0, z: 0 },
        head: { x: -Math.PI / 12, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold
        neck: { x: Math.PI / 16, y: 0, z: 0 },
        head: { x: -Math.PI / 12, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Dra in', startTime: 0, endTime: 0.5, description: 'Dra in hakan' },
    { name: 'Håll', startTime: 0.5, endTime: 0.7, description: 'Håll positionen' },
    { name: 'Släpp', startTime: 0.7, endTime: 1, description: 'Återgå till start' },
  ],
};

/**
 * 18. Neck Extension Isometric (Sitting)
 * Patient presses head back against resistance
 */
export const neckExtensionAnimation: ExerciseAnimationData = {
  exerciseName: 'Isometrisk Nackextension',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: sitting, hands behind head
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 3, y: Math.PI / 6, z: Math.PI / 4 },
        leftElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 3, y: -Math.PI / 6, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.2,
      joints: {
        // Begin pressing back - isometric contraction
        neck: { x: -Math.PI / 24, y: 0, z: 0 },
        head: { x: -Math.PI / 24, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 3, y: Math.PI / 6, z: Math.PI / 4 },
        leftElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 3, y: -Math.PI / 6, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.4,
      joints: {
        // Full isometric hold - pressing but not moving
        neck: { x: -Math.PI / 16, y: 0, z: 0 },
        head: { x: -Math.PI / 16, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 3, y: Math.PI / 6, z: Math.PI / 4 },
        leftElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 3, y: -Math.PI / 6, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold
        neck: { x: -Math.PI / 16, y: 0, z: 0 },
        head: { x: -Math.PI / 16, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 3, y: Math.PI / 6, z: Math.PI / 4 },
        leftElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 3, y: -Math.PI / 6, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Release
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 3, y: Math.PI / 6, z: Math.PI / 4 },
        leftElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 3, y: -Math.PI / 6, z: -Math.PI / 4 },
        rightElbow: { x: Math.PI * 0.8, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Tryck', startTime: 0, endTime: 0.4, description: 'Tryck huvudet bakåt' },
    { name: 'Håll', startTime: 0.4, endTime: 0.7, description: 'Håll trycket' },
    { name: 'Släpp', startTime: 0.7, endTime: 1, description: 'Släpp trycket' },
  ],
};

/**
 * 19. Wrist Extension / Handledsextension (Sitting)
 * Eccentric wrist extension with forearm on thigh
 */
export const wristExtensionAnimation: ExerciseAnimationData = {
  exerciseName: 'Excentrisk Handledsextension',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: arm resting on thigh, wrist extended
        leftShoulder: { x: Math.PI / 6, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 }, // Extended up
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        // Begin lowering - eccentric phase
        leftShoulder: { x: Math.PI / 6, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 }, // Neutral
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.6,
      joints: {
        // Full flexion - bottom of movement
        leftShoulder: { x: Math.PI / 6, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: Math.PI / 4, y: 0, z: 0 }, // Flexed down
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.8,
      joints: {
        // Use other hand to assist return
        leftShoulder: { x: Math.PI / 6, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: Math.PI / 6, y: 0, z: -0.3 },
        rightElbow: { x: Math.PI / 3, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        // Return to start
        leftShoulder: { x: Math.PI / 6, y: 0, z: 0 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: -Math.PI / 4, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Sänk', startTime: 0, endTime: 0.6, description: 'Bromsa handleden nedåt' },
    { name: 'Lyft', startTime: 0.6, endTime: 1, description: 'Assistera tillbaka med andra handen' },
  ],
};

// ==========================================
// KNÄENDE ANIMATIONER (KNEELING POSITION)
// ==========================================

/**
 * 20. Bird Dog / Fågelhunden (Kneeling)
 * On all fours, extend opposite arm and leg
 */
export const birdDogAnimation: ExerciseAnimationData = {
  exerciseName: 'Fågelhunden',
  category: 'strength',
  duration: 5,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: on all fours (table-top position)
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: -0.1 },
        rightElbow: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        // Begin extending - right arm forward, left leg back
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 1.5, y: 0, z: -0.05 },
        rightElbow: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 4, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full extension - arm and leg parallel to ground
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI, y: 0, z: 0 }, // Arm straight forward
        rightElbow: { x: 0, y: 0, z: 0 },
        leftHip: { x: 0, y: 0, z: 0 }, // Leg straight back
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 0.7,
      joints: {
        // Hold
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return to start
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: -0.1 },
        rightElbow: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Sträck', startTime: 0, endTime: 0.5, description: 'Sträck ut motsatt arm och ben' },
    { name: 'Håll', startTime: 0.5, endTime: 0.7, description: 'Håll kroppen stabil' },
    { name: 'Återgå', startTime: 0.7, endTime: 1, description: 'Återgå kontrollerat' },
  ],
};

/**
 * 21. Cat-Cow / Katten och Kon (Kneeling)
 * Alternating spinal flexion and extension
 */
export const catCowAnimation: ExerciseAnimationData = {
  exerciseName: 'Katten och Kon',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: neutral spine on all fours
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: -0.1 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        // Cat pose - spine flexed (rounded), head down
        spine: { x: Math.PI / 6, y: 0, z: 0 },
        chest: { x: Math.PI / 8, y: 0, z: 0 },
        neck: { x: Math.PI / 6, y: 0, z: 0 },
        head: { x: Math.PI / 6, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2.2, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 2.2, y: 0, z: -0.1 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Return to neutral
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: -0.1 },
      },
      expression: 'neutral',
    },
    {
      time: 0.75,
      joints: {
        // Cow pose - spine extended (arched), head up
        spine: { x: -Math.PI / 8, y: 0, z: 0 },
        chest: { x: -Math.PI / 10, y: 0, z: 0 },
        neck: { x: -Math.PI / 8, y: 0, z: 0 },
        head: { x: -Math.PI / 6, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 1.8, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 1.8, y: 0, z: -0.1 },
      },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        // Return to neutral
        spine: { x: 0, y: 0, z: 0 },
        chest: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        head: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0.1 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: -0.1 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Katten', startTime: 0, endTime: 0.5, description: 'Runda ryggen uppåt' },
    { name: 'Kon', startTime: 0.5, endTime: 1, description: 'Svanka nedåt' },
  ],
};

/**
 * 22. Hip Flexor Stretch (Kneeling)
 * Half-kneeling hip flexor stretch
 */
export const hipFlexorStretchAnimation: ExerciseAnimationData = {
  exerciseName: 'Höftböjarstretch',
  category: 'mobility',
  duration: 6,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Start: half-kneeling position
        leftHip: { x: Math.PI / 2, y: 0, z: 0 }, // Front leg up
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 }, // Back knee on ground
        rightKnee: { x: -Math.PI, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
      },
      rootPosition: { x: 0, y: -0.3, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        // Shift weight forward - stretch begins
        leftHip: { x: Math.PI / 3, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.5, y: 0, z: 0 },
        rightHip: { x: Math.PI / 4, y: 0, z: 0 }, // Hip extends
        rightKnee: { x: -Math.PI, y: 0, z: 0 },
        spine: { x: -Math.PI / 16, y: 0, z: 0 }, // Slight extension
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
      },
      rootPosition: { x: 0, y: -0.25, z: 0.1 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        // Full stretch position
        leftHip: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 }, // Hip fully extended
        rightKnee: { x: -Math.PI, y: 0, z: 0 },
        spine: { x: -Math.PI / 12, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
      },
      rootPosition: { x: 0, y: -0.2, z: 0.15 },
      expression: 'encouraging',
    },
    {
      time: 0.8,
      joints: {
        // Hold stretch
        leftHip: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2.2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 6, y: 0, z: 0 },
        rightKnee: { x: -Math.PI, y: 0, z: 0 },
        spine: { x: -Math.PI / 12, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
      },
      rootPosition: { x: 0, y: -0.2, z: 0.15 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        // Return to start
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
      },
      rootPosition: { x: 0, y: -0.3, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Skjut fram', startTime: 0, endTime: 0.5, description: 'Skjut höften framåt' },
    { name: 'Håll', startTime: 0.5, endTime: 0.8, description: 'Känn stretchen i höftböjaren' },
    { name: 'Återgå', startTime: 0.8, endTime: 1, description: 'Återgå till start' },
  ],
};

// ==========================================
// ADDITIONAL ANIMATIONS (9 MISSING EXERCISES)
// ==========================================

/**
 * 24. Serratus Push-up (Scapula Push-up)
 * Focuses on scapular protraction
 */
export const serratusPushUpAnimation: ExerciseAnimationData = {
  exerciseName: 'Serratus Push-up',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: 0.3 },
        leftElbow: { x: -Math.PI / 8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -0.3 },
        rightElbow: { x: -Math.PI / 8, y: 0, z: 0 },
        spine: { x: 0.1, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: 0.4 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -0.4 },
        rightElbow: { x: 0, y: 0, z: 0 },
        spine: { x: 0.2, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: -Math.PI / 6, y: 0, z: 0.3 },
        leftElbow: { x: -Math.PI / 8, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 6, y: 0, z: -0.3 },
        rightElbow: { x: -Math.PI / 8, y: 0, z: 0 },
        spine: { x: 0.1, y: 0, z: 0 },
      },
      expression: 'focused',
    },
  ],
  phases: [
    { name: 'Press', startTime: 0, endTime: 0.5, description: 'Pressa upp med skulderbladen' },
    { name: 'Återgå', startTime: 0.5, endTime: 1, description: 'Kontrollerad återgång' },
  ],
};

/**
 * 25. Full Can (Supraspinatus)
 * Arm lift to side with thumbs up
 */
export const fullCanAnimation: ExerciseAnimationData = {
  exerciseName: 'Full Can',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: -Math.PI / 4, y: 0, z: Math.PI / 6 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 4, y: 0, z: -Math.PI / 6 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.5, description: 'Lyft armarna i 45° vinkel' },
    { name: 'Sänk', startTime: 0.5, endTime: 1, description: 'Sänk kontrollerat' },
  ],
};

/**
 * 26. Spanish Squat
 * Squat with band around knees pushing outward
 */
export const spanishSquatAnimation: ExerciseAnimationData = {
  exerciseName: 'Spanish Squat',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    createLegKeyframe(0, [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 0, 'neutral'),
    createLegKeyframe(0.5, [Math.PI / 3, 0, 0.1], [Math.PI / 2, 0, 0], [Math.PI / 3, 0, -0.1], [Math.PI / 2, 0, 0], -0.15, 'focused'),
    createLegKeyframe(1, [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], 0, 'neutral'),
  ],
  phases: [
    { name: 'Sätt dig', startTime: 0, endTime: 0.5, description: 'Luta bakåt mot bandet' },
    { name: 'Res dig', startTime: 0.5, endTime: 1, description: 'Pressa upp' },
  ],
};

/**
 * 27. Step-up
 * Stepping up onto a box
 */
export const stepUpAnimation: ExerciseAnimationData = {
  exerciseName: 'Step-up',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.3,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.1, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.6,
      joints: {
        leftHip: { x: 0.1, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.2, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Steg upp', startTime: 0, endTime: 0.6, description: 'Kliv upp på lådan' },
    { name: 'Steg ner', startTime: 0.6, endTime: 1, description: 'Kliv kontrollerat ner' },
  ],
};

/**
 * 28. Wall Slides
 * Arms sliding up wall
 */
export const wallSlidesAnimation: ExerciseAnimationData = {
  exerciseName: 'Wall Slides',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: 0, y: 0, z: Math.PI / 3 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 3 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: -Math.PI / 2, y: 0, z: Math.PI / 3 },
        leftElbow: { x: Math.PI / 6, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: -Math.PI / 3 },
        rightElbow: { x: Math.PI / 6, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: 0, y: 0, z: Math.PI / 3 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -Math.PI / 3 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Glid upp', startTime: 0, endTime: 0.5, description: 'Glid upp längs väggen' },
    { name: 'Glid ner', startTime: 0.5, endTime: 1, description: 'Glid kontrollerat ner' },
  ],
};

/**
 * 29. Towel Grab (sitting)
 * Grabbing towel with toes
 */
export const towelGrabAnimation: ExerciseAnimationData = {
  exerciseName: 'Towel Grab',
  category: 'strength',
  duration: 2,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.5,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        leftAnkle: { x: 0.4, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Grip', startTime: 0, endTime: 0.5, description: 'Grip med tårna' },
    { name: 'Släpp', startTime: 0.5, endTime: 1, description: 'Släpp och sträck ut' },
  ],
};

/**
 * 30. Neck Stretch (Levator Scapulae)
 * Sitting neck side stretch
 */
export const neckStretchAnimation: ExerciseAnimationData = {
  exerciseName: 'Neck Stretch',
  category: 'mobility',
  duration: 6,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        head: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        head: { x: 0.2, y: 0, z: -0.4 },
        neck: { x: 0.1, y: 0, z: -0.2 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        head: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.75,
      joints: {
        head: { x: 0.2, y: 0, z: 0.4 },
        neck: { x: 0.1, y: 0, z: 0.2 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        head: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Höger', startTime: 0, endTime: 0.25, description: 'Luta huvudet åt höger' },
    { name: 'Mitt', startTime: 0.25, endTime: 0.5, description: 'Tillbaka till mitten' },
    { name: 'Vänster', startTime: 0.5, endTime: 0.75, description: 'Luta huvudet åt vänster' },
    { name: 'Mitt', startTime: 0.75, endTime: 1, description: 'Tillbaka till mitten' },
  ],
};

/**
 * 31. Forearm Rotation (Supination/Pronation)
 * Rotating forearm palm up and down
 */
export const forearmRotationAnimation: ExerciseAnimationData = {
  exerciseName: 'Forearm Rotation',
  category: 'mobility',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: Math.PI / 2, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: Math.PI / 2, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.75,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: -Math.PI / 2, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: -Math.PI / 2, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftShoulder: { x: 0, y: 0, z: 0.2 },
        leftElbow: { x: Math.PI / 2, y: 0, z: 0 },
        leftWrist: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.2 },
        rightElbow: { x: Math.PI / 2, y: 0, z: 0 },
        rightWrist: { x: 0, y: 0, z: 0 },
        leftHip: { x: Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: -Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: -Math.PI / 2, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.4, z: 0 },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Supination', startTime: 0, endTime: 0.25, description: 'Vrid handflatan uppåt' },
    { name: 'Neutral', startTime: 0.25, endTime: 0.5, description: 'Tillbaka till neutral' },
    { name: 'Pronation', startTime: 0.5, endTime: 0.75, description: 'Vrid handflatan nedåt' },
    { name: 'Neutral', startTime: 0.75, endTime: 1, description: 'Tillbaka till neutral' },
  ],
};

/**
 * 32. Eccentric Calf Raise (Alfredson Protocol)
 * Slow lowering phase for Achilles tendon
 */
export const eccentricCalfRaiseAnimation: ExerciseAnimationData = {
  exerciseName: 'Eccentric Calf Raise',
  category: 'strength',
  duration: 5,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: -0.4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: -0.4, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.1, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.2,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: -0.4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: -0.4, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.1, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 0.8,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: 0.3, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0.3, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: -0.05, z: 0 },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: -0.4, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: -0.4, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0.1, z: 0 },
      expression: 'focused',
    },
  ],
  phases: [
    { name: 'Håll', startTime: 0, endTime: 0.2, description: 'Håll toppläget' },
    { name: 'Sänk', startTime: 0.2, endTime: 0.8, description: 'Sänk långsamt (excentrisk)' },
    { name: 'Lyft', startTime: 0.8, endTime: 1, description: 'Snabb lyftfas' },
  ],
};

// ==========================================
// EXERCISE ANIMATIONS MAP
// All animations organized by key for lookup
// ==========================================

/**
 * Collection of all exercise animations
 * Organized by body position: standing, lying, sitting, kneeling, sidelying
 */
export const EXERCISE_ANIMATIONS: Record<string, ExerciseAnimationData> = {
  // === STANDING ANIMATIONS ===
  'axelflexion': shoulderFlexionAnimation,
  'armlyft': shoulderFlexionAnimation,
  'shoulder_flexion': shoulderFlexionAnimation,
  'arm_raise': shoulderFlexionAnimation,
  'shoulderFlexion': shoulderFlexionAnimation,

  'knäböj': squatAnimation,
  'squat': squatAnimation,

  'utfall': lungeAnimation,
  'lunge': lungeAnimation,

  'höftabduktion': hipAbductionAnimation,
  'hip_abduction': hipAbductionAnimation,
  'hipAbduction': hipAbductionAnimation,

  'tåhävning': calfRaiseAnimation,
  'calf_raise': calfRaiseAnimation,
  'calfRaise': calfRaiseAnimation,

  'enbensstående': singleLegBalanceAnimation,
  'single_leg_balance': singleLegBalanceAnimation,
  'singleLegBalance': singleLegBalanceAnimation,
  'balance': singleLegBalanceAnimation,
  'enbensbalans': singleLegBalanceAnimation,

  'bålrotation': trunkRotationAnimation,
  'trunk_rotation': trunkRotationAnimation,
  'trunkRotation': trunkRotationAnimation,
  'core': trunkRotationAnimation,

  'axel_utåtrotation': shoulderExternalRotationAnimation,
  'shoulder_external_rotation': shoulderExternalRotationAnimation,
  'shoulderExternalRotation': shoulderExternalRotationAnimation,

  'väggpress': wallPushUpAnimation,
  'wall_push_up': wallPushUpAnimation,
  'wallPushUp': wallPushUpAnimation,

  // === LYING ANIMATIONS (SUPINE/PRONE) ===
  'bäckenlyft': gluteBridgeAnimation,
  'glute_bridge': gluteBridgeAnimation,
  'gluteBridge': gluteBridgeAnimation,

  'mcgill_curl_up': mcGillCurlUpAnimation,
  'mcGillCurlUp': mcGillCurlUpAnimation,
  'mcgill': mcGillCurlUpAnimation,

  'cobra': cobraAnimation,
  'prone_press_up': cobraAnimation,

  'hälglidning': heelSlideAnimation,
  'heel_slide': heelSlideAnimation,
  'heelSlide': heelSlideAnimation,

  // === SIDELYING ANIMATIONS ===
  'musslan': clamshellAnimation,
  'clamshell': clamshellAnimation,
  'clamshells': clamshellAnimation,

  'sidoplanka': sidePlankAnimation,
  'side_plank': sidePlankAnimation,
  'sidePlank': sidePlankAnimation,

  // === SITTING ANIMATIONS ===
  'knästräckning': kneeExtensionAnimation,
  'knee_extension': kneeExtensionAnimation,
  'kneeExtension': kneeExtensionAnimation,

  'chin_tuck': chinTuckAnimation,
  'chinTuck': chinTuckAnimation,
  'retraktion_av_nacke': chinTuckAnimation,

  'isometrisk_nackextension': neckExtensionAnimation,
  'neck_extension': neckExtensionAnimation,
  'neckExtension': neckExtensionAnimation,

  'excentrisk_handledsextension': wristExtensionAnimation,
  'wrist_extension': wristExtensionAnimation,
  'wristExtension': wristExtensionAnimation,

  // === KNEELING ANIMATIONS ===
  'fågelhunden': birdDogAnimation,
  'bird_dog': birdDogAnimation,
  'birdDog': birdDogAnimation,

  'katten_och_kon': catCowAnimation,
  'cat_cow': catCowAnimation,
  'catCow': catCowAnimation,

  'höftböjarstretch': hipFlexorStretchAnimation,
  'hip_flexor_stretch': hipFlexorStretchAnimation,
  'hipFlexorStretch': hipFlexorStretchAnimation,

  // === NEW STANDING ANIMATIONS ===
  'serratus_push_up': serratusPushUpAnimation,
  'serratusPushUp': serratusPushUpAnimation,
  'serratus_pushup': serratusPushUpAnimation,

  'full_can': fullCanAnimation,
  'fullCan': fullCanAnimation,
  'supraspinatus': fullCanAnimation,

  'spanish_squat': spanishSquatAnimation,
  'spanishSquat': spanishSquatAnimation,

  'step_up': stepUpAnimation,
  'stepUp': stepUpAnimation,
  'step_up_på_låda': stepUpAnimation,

  'wall_slides': wallSlidesAnimation,
  'wallSlides': wallSlidesAnimation,

  'eccentric_calf_raise': eccentricCalfRaiseAnimation,
  'eccentricCalfRaise': eccentricCalfRaiseAnimation,
  'excentrisk_vadlyft': eccentricCalfRaiseAnimation,

  // === NEW SITTING ANIMATIONS ===
  'towel_grab': towelGrabAnimation,
  'towelGrab': towelGrabAnimation,
  'handduksdrag': towelGrabAnimation,

  'neck_stretch': neckStretchAnimation,
  'neckStretch': neckStretchAnimation,
  'levator_scapulae_stretch': neckStretchAnimation,

  'forearm_rotation': forearmRotationAnimation,
  'forearmRotation': forearmRotationAnimation,
  'underarmsrotation': forearmRotationAnimation,

  // === IDLE ===
  'idle': idleAnimation,
};

/**
 * Extended keyword mappings for better exercise name recognition
 * Maps Swedish and English terms to their corresponding animations
 */
const EXERCISE_KEYWORD_MAP: Record<string, ExerciseAnimationData> = {
  // === ARM & SHOULDER EXERCISES ===
  'armlyft': shoulderFlexionAnimation,
  'arm_lyft': shoulderFlexionAnimation,
  'armhävning': wallPushUpAnimation,
  'arm_hävning': wallPushUpAnimation,
  'skulderbladsstabilisering': serratusPushUpAnimation,
  'skulderblad': serratusPushUpAnimation,
  'rotatorkuff': shoulderExternalRotationAnimation,
  'rotator': shoulderExternalRotationAnimation,
  'utåtrotation': shoulderExternalRotationAnimation,
  'inåtrotation': shoulderExternalRotationAnimation,
  'axelrotation': shoulderExternalRotationAnimation,
  'lateral_raise': shoulderFlexionAnimation,
  'lateral': shoulderFlexionAnimation,
  'front_raise': shoulderFlexionAnimation,
  'overhead': shoulderFlexionAnimation,

  // === LEG EXERCISES ===
  'benlyft': hipAbductionAnimation,
  'benpress': squatAnimation,
  'bensträckning': kneeExtensionAnimation,
  'vadlyft': calfRaiseAnimation,
  'vadmuskel': calfRaiseAnimation,
  'häl': calfRaiseAnimation,
  'tå_hävning': calfRaiseAnimation,
  'stärkande': squatAnimation,
  'quadriceps': kneeExtensionAnimation,
  'quad': kneeExtensionAnimation,
  'hamstring': gluteBridgeAnimation,
  'ischiokrurala': gluteBridgeAnimation,
  'baksida_lår': gluteBridgeAnimation,
  'lår': squatAnimation,

  // === HIP EXERCISES ===
  'höftlyft': gluteBridgeAnimation,
  'höftrotation': hipAbductionAnimation,
  'höftflexor': hipFlexorStretchAnimation,
  'höftböjare': hipFlexorStretchAnimation,
  'iliopsoas': hipFlexorStretchAnimation,
  'gluteus': gluteBridgeAnimation,
  'gluteal': gluteBridgeAnimation,
  'sätes': gluteBridgeAnimation,
  'rumpa': gluteBridgeAnimation,
  'bäcken': gluteBridgeAnimation,
  'adduktor': hipAbductionAnimation,
  'abduktor': hipAbductionAnimation,

  // === KNEE EXERCISES ===
  'knäböjning': squatAnimation,
  'knästräckning': kneeExtensionAnimation,
  'terminal_knee': kneeExtensionAnimation,
  'patella': kneeExtensionAnimation,
  'acl': squatAnimation,
  'menisk': squatAnimation,

  // === CORE EXERCISES ===
  'magmuskel': mcGillCurlUpAnimation,
  'mage': mcGillCurlUpAnimation,
  'bukmuskel': mcGillCurlUpAnimation,
  'crunch': mcGillCurlUpAnimation,
  'situp': mcGillCurlUpAnimation,
  'planka': sidePlankAnimation,
  'rygglyft': cobraAnimation,
  'rygg_extension': cobraAnimation,
  'extension_rygg': cobraAnimation,
  'bålstabilitet': trunkRotationAnimation,
  'stabilisering': trunkRotationAnimation,
  'dead_bug': birdDogAnimation,

  // === BALANCE EXERCISES ===
  'enbensbalans': singleLegBalanceAnimation,
  'enbensstående': singleLegBalanceAnimation,
  'proprioception': singleLegBalanceAnimation,
  'viktig_balans': singleLegBalanceAnimation,

  // === STRETCH EXERCISES ===
  'stretch': hipFlexorStretchAnimation,
  'töjning': hipFlexorStretchAnimation,
  'rörlighet': catCowAnimation,
  'mobilitet': catCowAnimation,
  'flexibilitet': catCowAnimation,

  // === NECK EXERCISES ===
  'nacke': chinTuckAnimation,
  'hals': chinTuckAnimation,
  'cervical': chinTuckAnimation,
  'retraktion': chinTuckAnimation,

  // === WRIST/HAND EXERCISES ===
  'handled': wristExtensionAnimation,
  'handflata': towelGrabAnimation,
  'grip': towelGrabAnimation,
  'finger': towelGrabAnimation,
  'tennis': wristExtensionAnimation,
  'armbåge': forearmRotationAnimation,
  'underarm': forearmRotationAnimation,
};

/**
 * Calculate simple word similarity score
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return 1;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Word overlap
  const words1 = s1.split(/[_\s]+/);
  const words2 = s2.split(/[_\s]+/);
  const commonWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)));
  if (commonWords.length > 0) {
    return 0.5 + (commonWords.length / Math.max(words1.length, words2.length)) * 0.3;
  }

  return 0;
}

/**
 * Get animation by exercise name (improved fuzzy match)
 */
export function getExerciseAnimation(exerciseName: string): ExerciseAnimationData | null {
  const normalized = exerciseName.toLowerCase().replace(/[^a-zåäö0-9]/g, '_');

  // 1. Direct match in main animations map
  if (EXERCISE_ANIMATIONS[normalized]) {
    return EXERCISE_ANIMATIONS[normalized];
  }

  // 2. Check extended keyword map
  for (const [keyword, animation] of Object.entries(EXERCISE_KEYWORD_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return animation;
    }
  }

  // 3. Partial match in main animations
  for (const [key, animation] of Object.entries(EXERCISE_ANIMATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return animation;
    }
  }

  // 4. Best similarity match
  let bestMatch: ExerciseAnimationData | null = null;
  let bestScore = 0.5; // Minimum threshold

  for (const [key, animation] of Object.entries(EXERCISE_ANIMATIONS)) {
    const score = calculateSimilarity(normalized, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = animation;
    }
  }

  if (bestMatch) return bestMatch;

  // 5. Category-based fallback (last resort)
  const categoryKeywords: Record<string, ExerciseAnimationData> = {
    'arm': shoulderFlexionAnimation,
    'axel': shoulderFlexionAnimation,
    'shoulder': shoulderFlexionAnimation,
    'skulder': shoulderFlexionAnimation,
    'ben': squatAnimation,
    'leg': squatAnimation,
    'höft': hipAbductionAnimation,
    'hip': hipAbductionAnimation,
    'knä': kneeExtensionAnimation,
    'knee': kneeExtensionAnimation,
    'bål': trunkRotationAnimation,
    'core': trunkRotationAnimation,
    'trunk': trunkRotationAnimation,
    'balans': singleLegBalanceAnimation,
    'balance': singleLegBalanceAnimation,
    'press': wallPushUpAnimation,
    'push': wallPushUpAnimation,
    'lyft': shoulderFlexionAnimation,
    'raise': shoulderFlexionAnimation,
    'extension': kneeExtensionAnimation,
    'flexion': shoulderFlexionAnimation,
    'rotation': trunkRotationAnimation,
    'stretch': hipFlexorStretchAnimation,
    'sträck': hipFlexorStretchAnimation,
    'böj': squatAnimation,
  };

  for (const [keyword, animation] of Object.entries(categoryKeywords)) {
    if (normalized.includes(keyword)) {
      return animation;
    }
  }

  return null;
}

/**
 * Get all animations for a category
 */
export function getAnimationsByCategory(category: ExerciseAnimationData['category']): ExerciseAnimationData[] {
  const seen = new Set<string>();
  const result: ExerciseAnimationData[] = [];

  for (const animation of Object.values(EXERCISE_ANIMATIONS)) {
    if (animation.category === category && !seen.has(animation.exerciseName)) {
      seen.add(animation.exerciseName);
      result.push(animation);
    }
  }

  return result;
}
