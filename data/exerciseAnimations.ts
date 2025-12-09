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
// FAS 8: NYA REHABILITERINGSANIMATIONER
// Kritiska övningar för post-op patienter
// ==========================================

/**
 * 33. Pendulum Swing (Codman Exercises)
 * Passiv axelrörelse för tidig post-op rehabilitering
 * KRITISK för axelprotes/rotatorkuff fas 1
 */
export const pendulumSwingAnimation: ExerciseAnimationData = {
  exerciseName: 'Pendulum Swing',
  category: 'mobility',
  duration: 4,
  loop: true,
  defaultTempo: 0.5,
  keyframes: [
    {
      time: 0,
      joints: {
        spine: { x: Math.PI / 6, y: 0, z: 0 }, // Böjd framåt
        leftShoulder: { x: -Math.PI / 8, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 8, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.25,
      joints: {
        spine: { x: Math.PI / 6, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 8, y: 0, z: Math.PI / 12 }, // Swing left
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 8, y: 0, z: Math.PI / 12 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.5,
      joints: {
        spine: { x: Math.PI / 6, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 8, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 8, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.75,
      joints: {
        spine: { x: Math.PI / 6, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 8, y: 0, z: -Math.PI / 12 }, // Swing right
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 8, y: 0, z: -Math.PI / 12 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        spine: { x: Math.PI / 6, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 8, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 8, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Pendla vänster', startTime: 0, endTime: 0.25, description: 'Låt armen pendla åt vänster' },
    { name: 'Mitt', startTime: 0.25, endTime: 0.5, description: 'Passera mitten' },
    { name: 'Pendla höger', startTime: 0.5, endTime: 0.75, description: 'Låt armen pendla åt höger' },
    { name: 'Tillbaka', startTime: 0.75, endTime: 1, description: 'Tillbaka till start' },
  ],
};

/**
 * 34. Straight Leg Raise (Rakt benlyft)
 * Klassisk knä-rehabiliteringsövning
 * KRITISK för ACL/menisk post-op
 */
export const straightLegRaiseAnimation: ExerciseAnimationData = {
  exerciseName: 'Straight Leg Raise',
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
        leftAnkle: { x: Math.PI / 12, y: 0, z: 0 }, // Dorsalflexion
        rightHip: { x: Math.PI / 8, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'neutral',
    },
    {
      time: 0.4,
      joints: {
        leftHip: { x: -Math.PI / 4, y: 0, z: 0 }, // Höftflexion
        leftKnee: { x: 0, y: 0, z: 0 }, // Håll knät rakt
        leftAnkle: { x: Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: Math.PI / 8, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'focused',
    },
    {
      time: 0.6,
      joints: {
        leftHip: { x: -Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: Math.PI / 8, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: Math.PI / 8, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 4, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      rootPosition: { x: 0, y: 0, z: 0 },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Lyft', startTime: 0, endTime: 0.4, description: 'Lyft benet rakt upp med spänd quad' },
    { name: 'Håll', startTime: 0.4, endTime: 0.6, description: 'Håll i toppläget' },
    { name: 'Sänk', startTime: 0.6, endTime: 1, description: 'Sänk kontrollerat' },
  ],
};

/**
 * 35. Dead Bug
 * Core-stabilisering utan ryggbelastning
 * KRITISK för post-op rygg och bålstabilitet
 */
export const deadBugAnimation: ExerciseAnimationData = {
  exerciseName: 'Dead Bug',
  category: 'strength',
  duration: 4,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        // Startposition: liggande med höfter och knän i 90°
        leftHip: { x: -Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: -Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.5,
      joints: {
        // Motsatt arm och ben ut
        leftHip: { x: -Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: -Math.PI / 8, y: 0, z: 0 }, // Höger ben ut
        rightKnee: { x: Math.PI / 12, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI * 0.9, y: 0, z: 0 }, // Vänster arm över huvud
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: -Math.PI / 2, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 2, y: 0, z: 0 },
        rightHip: { x: -Math.PI / 2, y: 0, z: 0 },
        rightKnee: { x: Math.PI / 2, y: 0, z: 0 },
        leftShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        leftElbow: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: -Math.PI / 2, y: 0, z: 0 },
        rightElbow: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Start', startTime: 0, endTime: 0.2, description: 'Spänn bålen, aktivera core' },
    { name: 'Sträck', startTime: 0.2, endTime: 0.5, description: 'Sträck motsatt arm och ben' },
    { name: 'Tillbaka', startTime: 0.5, endTime: 1, description: 'Tillbaka med kontroll' },
  ],
};

/**
 * 36. Terminal Knee Extension
 * Slutfas knäextension för quadriceps
 * KRITISK för ACL post-op fas 2+
 */
export const terminalKneeExtensionAnimation: ExerciseAnimationData = {
  exerciseName: 'Terminal Knee Extension',
  category: 'strength',
  duration: 3,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 6, y: 0, z: 0 }, // Böjt ~30°
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.4,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 }, // Full extension
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.6,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'encouraging',
    },
    {
      time: 1,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: Math.PI / 6, y: 0, z: 0 },
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Sträck', startTime: 0, endTime: 0.4, description: 'Sträck ut knät helt' },
    { name: 'Håll', startTime: 0.4, endTime: 0.6, description: 'Håll full extension' },
    { name: 'Släpp', startTime: 0.6, endTime: 1, description: 'Kontrollerat tillbaka' },
  ],
};

/**
 * 37. Ankle Pumps (Fotpump)
 * Cirkulationsfrämjande efter benoperationer
 * KRITISK för alla post-op ben (DVT-prevention)
 */
export const anklePumpsAnimation: ExerciseAnimationData = {
  exerciseName: 'Ankle Pumps',
  category: 'mobility',
  duration: 2,
  loop: true,
  defaultTempo: 1,
  keyframes: [
    {
      time: 0,
      joints: {
        leftAnkle: { x: Math.PI / 4, y: 0, z: 0 }, // Dorsalflexion
        rightAnkle: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.5,
      joints: {
        leftAnkle: { x: -Math.PI / 4, y: 0, z: 0 }, // Plantarflexion
        rightAnkle: { x: -Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 1,
      joints: {
        leftAnkle: { x: Math.PI / 4, y: 0, z: 0 },
        rightAnkle: { x: Math.PI / 4, y: 0, z: 0 },
        leftKnee: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
  ],
  phases: [
    { name: 'Upp', startTime: 0, endTime: 0.5, description: 'Dra tårna mot dig' },
    { name: 'Ner', startTime: 0.5, endTime: 1, description: 'Peka tårna nedåt' },
  ],
};

/**
 * 38. Quad Sets (Isometrisk quadriceps)
 * Tidig quadriceps-aktivering
 * KRITISK för knä post-op fas 1
 */
export const quadSetsAnimation: ExerciseAnimationData = {
  exerciseName: 'Quad Sets',
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
        leftAnkle: { x: 0, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
      },
      expression: 'neutral',
    },
    {
      time: 0.2,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: -0.05, y: 0, z: 0 }, // Slight hyperextension from quad contraction
        leftAnkle: { x: Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
      },
      expression: 'focused',
    },
    {
      time: 0.7,
      joints: {
        leftHip: { x: 0, y: 0, z: 0 },
        leftKnee: { x: -0.05, y: 0, z: 0 },
        leftAnkle: { x: Math.PI / 12, y: 0, z: 0 },
        rightHip: { x: 0, y: 0, z: 0 },
        rightKnee: { x: 0, y: 0, z: 0 },
        rightAnkle: { x: 0, y: 0, z: 0 },
      },
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
      },
      expression: 'happy',
    },
  ],
  phases: [
    { name: 'Spänn', startTime: 0, endTime: 0.2, description: 'Spänn lårmuskeln, tryck knät mot underlaget' },
    { name: 'Håll', startTime: 0.2, endTime: 0.7, description: 'Håll spänningen' },
    { name: 'Släpp', startTime: 0.7, endTime: 1, description: 'Slappna av' },
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
  'axelrörlighet': shoulderFlexionAnimation,
  'axelmobilitet': shoulderFlexionAnimation,
  'axelpendel': shoulderFlexionAnimation,
  'shoulder_mobility': shoulderFlexionAnimation,
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

  // === NEW REHABILITATION ANIMATIONS (FAS 8) ===
  // Pendulum / Codman (Post-op shoulder)
  'pendulum_swing': pendulumSwingAnimation,
  'pendulumSwing': pendulumSwingAnimation,
  'pendel': pendulumSwingAnimation,
  'pendelrörelse': pendulumSwingAnimation,
  'codman': pendulumSwingAnimation,
  'codman_exercises': pendulumSwingAnimation,
  'axelpendel_codman': pendulumSwingAnimation,

  // Straight Leg Raise (Post-op knee/hip)
  'straight_leg_raise': straightLegRaiseAnimation,
  'straightLegRaise': straightLegRaiseAnimation,
  'rakt_benlyft': straightLegRaiseAnimation,
  'slr': straightLegRaiseAnimation,
  'benlyft_liggande': straightLegRaiseAnimation,

  // Dead Bug (Core stabilization)
  'dead_bug': deadBugAnimation,
  'deadBug': deadBugAnimation,
  'döda_insekten': deadBugAnimation,
  'core_stability': deadBugAnimation,

  // Terminal Knee Extension (ACL post-op)
  'terminal_knee_extension': terminalKneeExtensionAnimation,
  'terminalKneeExtension': terminalKneeExtensionAnimation,
  'tke': terminalKneeExtensionAnimation,
  'slutfas_knäextension': terminalKneeExtensionAnimation,

  // Ankle Pumps (DVT prevention)
  'ankle_pumps': anklePumpsAnimation,
  'anklePumps': anklePumpsAnimation,
  'fotpump': anklePumpsAnimation,
  'fotledsrörelser': anklePumpsAnimation,
  'ankelpump': anklePumpsAnimation,
  'cirkulation_fötter': anklePumpsAnimation,

  // Quad Sets (Post-op knee phase 1)
  'quad_sets': quadSetsAnimation,
  'quadSets': quadSetsAnimation,
  'quad_set': quadSetsAnimation,
  'quadriceps_aktivering': quadSetsAnimation,
  'isometrisk_quad': quadSetsAnimation,
  'lårmuskeln_spänn': quadSetsAnimation,

  // === IDLE ===
  'idle': idleAnimation,
};

/**
 * Extended keyword mappings for better exercise name recognition
 * Maps Swedish and English terms to their corresponding animations
 */
const EXERCISE_KEYWORD_MAP: Record<string, ExerciseAnimationData> = {
  // =============================================
  // NECK EXERCISES (Nacke)
  // =============================================
  'retraktion_av_nacke': chinTuckAnimation,
  'chin_tucks': chinTuckAnimation,
  'chin_tuck': chinTuckAnimation,
  'haka_in': chinTuckAnimation,
  'isometrisk_nackextension': neckExtensionAnimation,
  'nackextension': neckExtensionAnimation,
  'levator_scapulae_stretch': neckStretchAnimation,
  'levator_scapulae': neckStretchAnimation,
  'isometrisk_nackflexion': neckExtensionAnimation,
  'nackflexion': neckExtensionAnimation,
  'övre_trapezius_stretch': neckStretchAnimation,
  'trapezius_stretch': neckStretchAnimation,
  'trapezius': neckStretchAnimation,
  'nacke': chinTuckAnimation,
  'hals': chinTuckAnimation,
  'cervical': chinTuckAnimation,
  'retraktion': chinTuckAnimation,

  // New neck exercises from templates
  'prn_aktivering': chinTuckAnimation,
  'prn aktivering': chinTuckAnimation,
  'öga_huvud_koordination': chinTuckAnimation,
  'öga-huvud koordination': chinTuckAnimation,
  'öga-huvud': chinTuckAnimation,
  'eye_head': chinTuckAnimation,
  'vor_x1': chinTuckAnimation,
  'vor_x1_övning': chinTuckAnimation,
  'vor x1 övning': chinTuckAnimation,
  'vor_x2': chinTuckAnimation,
  'vor_x2_övning': chinTuckAnimation,
  'vor x2 övning': chinTuckAnimation,
  'vor': chinTuckAnimation,
  'vestibular': chinTuckAnimation,
  'liggande_nacknickning': chinTuckAnimation,
  'liggande nacknickning': chinTuckAnimation,
  'nacknickning': chinTuckAnimation,
  'suboccipital': neckStretchAnimation,
  'suboccipital_release': neckStretchAnimation,
  'suboccipital release': neckStretchAnimation,
  'hållningskorrigering': chinTuckAnimation,
  'postural': chinTuckAnimation,
  'posture': chinTuckAnimation,
  'motståndsträning': neckExtensionAnimation,
  'motståndsträning_alla_riktningar': neckExtensionAnimation,
  'motståndsträning alla riktningar': neckExtensionAnimation,
  'resistance_all': neckExtensionAnimation,
  'snags': chinTuckAnimation,
  'cervikala_snags': chinTuckAnimation,
  'cervikala snags': chinTuckAnimation,
  'mulligan': chinTuckAnimation,

  // Additional neck templates
  'deep_neck_flexor': chinTuckAnimation,
  'dnf': chinTuckAnimation,
  'craniocervical': chinTuckAnimation,
  'craniocervikal': chinTuckAnimation,
  'neural_glide': neckStretchAnimation,
  'neural_slider': neckStretchAnimation,
  'neural_tensioner': neckStretchAnimation,
  'thoracic_extension': cobraAnimation,
  'pec_minor': neckStretchAnimation,
  'flexor_endurance': neckExtensionAnimation,
  'extensor_strength': neckExtensionAnimation,
  'scapular_retraction': chinTuckAnimation,
  'lower_trap': chinTuckAnimation,
  'prone_retraction': chinTuckAnimation,
  'self_traction': neckStretchAnimation,

  // =============================================
  // SHOULDER EXERCISES (Axel)
  // =============================================
  'pendling': shoulderFlexionAnimation,
  'codman': shoulderFlexionAnimation,
  'codmans': shoulderFlexionAnimation,
  'axelrörlighet': shoulderFlexionAnimation,
  'axel_rörlighet': shoulderFlexionAnimation,
  'axelmobilitet': shoulderFlexionAnimation,
  'axelpendel': shoulderFlexionAnimation,
  'pendel': shoulderFlexionAnimation,
  'axelflexion': shoulderFlexionAnimation,
  'axelabduktion': shoulderFlexionAnimation,
  'axelcirklar': shoulderFlexionAnimation,
  'axelsträckning': shoulderFlexionAnimation,
  'armcirklar': shoulderFlexionAnimation,
  'armlyft': shoulderFlexionAnimation,
  'arm_lyft': shoulderFlexionAnimation,

  'utåtrotation_med_gummiband': shoulderExternalRotationAnimation,
  'utåtrotation': shoulderExternalRotationAnimation,
  'external_rotation': shoulderExternalRotationAnimation,
  'inåtrotation_med_gummiband': shoulderExternalRotationAnimation,
  'inåtrotation': shoulderExternalRotationAnimation,
  'internal_rotation': shoulderExternalRotationAnimation,
  'rotatorkuff': shoulderExternalRotationAnimation,
  'rotator': shoulderExternalRotationAnimation,
  'axelrotation': shoulderExternalRotationAnimation,

  'scaption': fullCanAnimation,
  'full_can': fullCanAnimation,
  'fullcan': fullCanAnimation,
  'supraspinatus': fullCanAnimation,

  'sleeper_stretch': shoulderExternalRotationAnimation,
  'sleeper': shoulderExternalRotationAnimation,

  'wall_slides': wallSlidesAnimation,
  'wallslides': wallSlidesAnimation,
  'väggglid': wallSlidesAnimation,

  'serratus_push_up': serratusPushUpAnimation,
  'serratus_pushup': serratusPushUpAnimation,
  'serratus': serratusPushUpAnimation,
  'plus_push_up': serratusPushUpAnimation,
  'skulderbladsstabilisering': serratusPushUpAnimation,
  'skulderblad': serratusPushUpAnimation,

  'armhävning': wallPushUpAnimation,
  'arm_hävning': wallPushUpAnimation,
  'lateral_raise': shoulderFlexionAnimation,
  'lateral': shoulderFlexionAnimation,
  'front_raise': shoulderFlexionAnimation,
  'overhead': shoulderFlexionAnimation,

  // Additional shoulder exercises (from expanded templates)
  'prone_er': shoulderExternalRotationAnimation,
  'pronliggande_utåtrotation': shoulderExternalRotationAnimation,
  'sidelying_er': shoulderExternalRotationAnimation,
  'sidoliggande_utåtrotation': shoulderExternalRotationAnimation,
  'ir_standing': shoulderExternalRotationAnimation,
  'inåtrotation_stående': shoulderExternalRotationAnimation,
  'prone_w': fullCanAnimation,
  'liggande_w': fullCanAnimation,
  'w_lyft': fullCanAnimation,
  'prone_i': fullCanAnimation,
  'liggande_i': fullCanAnimation,
  'i_lyft': fullCanAnimation,
  'low_row': serratusPushUpAnimation,
  'låg_rodd': serratusPushUpAnimation,
  'high_row': serratusPushUpAnimation,
  'hög_rodd': serratusPushUpAnimation,
  'face_pull': shoulderExternalRotationAnimation,
  'wand_flexion': shoulderFlexionAnimation,
  'stavflexion': shoulderFlexionAnimation,
  'wand_er': shoulderExternalRotationAnimation,
  'wand_ir': shoulderExternalRotationAnimation,
  'stav': shoulderFlexionAnimation,
  'table_slides': shoulderFlexionAnimation,
  'bordsglidning': shoulderFlexionAnimation,
  'finger_walk': shoulderFlexionAnimation,
  'fingerpromenad': shoulderFlexionAnimation,
  'frontlyft': shoulderFlexionAnimation,
  'sidolyft': shoulderFlexionAnimation,
  'reverse_fly': shoulderExternalRotationAnimation,
  'omvänd_fly': shoulderExternalRotationAnimation,
  'overhead_press': shoulderFlexionAnimation,
  'axelpress': shoulderFlexionAnimation,
  'arnold_press': shoulderFlexionAnimation,
  'wall_pushup': wallPushUpAnimation,
  'väggarmhävning': wallPushUpAnimation,
  'incline_pushup': wallPushUpAnimation,
  'lutande_armhävning': wallPushUpAnimation,
  'pushup_plus': serratusPushUpAnimation,
  'armhävning_plus': serratusPushUpAnimation,
  'rhythmic_stab': shoulderExternalRotationAnimation,
  'rytmisk_stabilisering': shoulderExternalRotationAnimation,
  'ball_squeeze': serratusPushUpAnimation,
  'bollklämning': serratusPushUpAnimation,
  'quadruped_reach': shoulderFlexionAnimation,
  'fyrfota_räckning': shoulderFlexionAnimation,
  'pullover': shoulderFlexionAnimation,
  'upright_row': shoulderFlexionAnimation,
  'uppåtrodd': shoulderFlexionAnimation,
  'shrug': shoulderFlexionAnimation,
  'axelryckningar': shoulderFlexionAnimation,
  'corner_stretch': shoulderExternalRotationAnimation,
  'hörnstretch': shoulderExternalRotationAnimation,
  'towel_stretch_ir': shoulderExternalRotationAnimation,
  'handdukstretch': shoulderExternalRotationAnimation,
  'lat_stretch': shoulderFlexionAnimation,
  'latissimus_stretch': shoulderFlexionAnimation,
  'eccentric_er': shoulderExternalRotationAnimation,
  'excentrisk_utåtrotation': shoulderExternalRotationAnimation,
  'eccentric_flexion': shoulderFlexionAnimation,
  'excentrisk_flexion': shoulderFlexionAnimation,

  // =============================================
  // CORE EXERCISES (Bål/Mage)
  // =============================================
  'mcgill_curl_up': mcGillCurlUpAnimation,
  'mcgill_curlup': mcGillCurlUpAnimation,
  'mcgill': mcGillCurlUpAnimation,
  'curl_up': mcGillCurlUpAnimation,
  'magmuskel': mcGillCurlUpAnimation,
  'mage': mcGillCurlUpAnimation,
  'bukmuskel': mcGillCurlUpAnimation,
  'crunch': mcGillCurlUpAnimation,
  'situp': mcGillCurlUpAnimation,

  'fågelhunden': birdDogAnimation,
  'fågelhund': birdDogAnimation,
  'bird_dog': birdDogAnimation,
  'birddog': birdDogAnimation,

  'sidoplanka': sidePlankAnimation,
  'side_plank': sidePlankAnimation,
  'sideplank': sidePlankAnimation,
  'planka': sidePlankAnimation,

  'bäckenlyft': gluteBridgeAnimation,
  'glute_bridge': gluteBridgeAnimation,
  'glutebridge': gluteBridgeAnimation,
  'höftlyft': gluteBridgeAnimation,

  'cat_cow': catCowAnimation,
  'catcow': catCowAnimation,
  'katt_ko': catCowAnimation,
  'kattko': catCowAnimation,

  'cobra': cobraAnimation,
  'prone_press_up': cobraAnimation,
  'prone_pressup': cobraAnimation,
  'rygglyft': cobraAnimation,
  'rygg_extension': cobraAnimation,
  'extension_rygg': cobraAnimation,

  'dead_bug': birdDogAnimation,
  'deadbug': birdDogAnimation,

  'thorax_rotation': trunkRotationAnimation,
  'thoraxrotation': trunkRotationAnimation,
  'bålrotation': trunkRotationAnimation,
  'bålstabilitet': trunkRotationAnimation,
  'stabilisering': trunkRotationAnimation,

  // =============================================
  // HIP EXERCISES (Höft)
  // =============================================
  'musslan': clamshellAnimation,
  'clamshells': clamshellAnimation,
  'clamshell': clamshellAnimation,

  'höftböjarstretch': hipFlexorStretchAnimation,
  'hip_flexor_stretch': hipFlexorStretchAnimation,
  'höftflexor': hipFlexorStretchAnimation,
  'höftböjare': hipFlexorStretchAnimation,
  'iliopsoas': hipFlexorStretchAnimation,

  'side_lying_hip_abduction': hipAbductionAnimation,
  'hip_abduction': hipAbductionAnimation,
  'höftabduktion': hipAbductionAnimation,
  'sidoliggande_benlyft': hipAbductionAnimation,
  'benlyft': hipAbductionAnimation,
  'adduktor': hipAbductionAnimation,
  'abduktor': hipAbductionAnimation,

  'piriformis_stretch': hipFlexorStretchAnimation,
  'piriformis': hipFlexorStretchAnimation,

  'gluteus': gluteBridgeAnimation,
  'gluteal': gluteBridgeAnimation,
  'sätes': gluteBridgeAnimation,
  'rumpa': gluteBridgeAnimation,
  'bäcken': gluteBridgeAnimation,
  'höftrotation': hipAbductionAnimation,

  // =============================================
  // KNEE EXERCISES (Knä)
  // =============================================
  'knäböj': squatAnimation,
  'squat': squatAnimation,
  'knäböjning': squatAnimation,
  'acl': squatAnimation,
  'menisk': squatAnimation,

  'utfall': lungeAnimation,
  'lunge': lungeAnimation,

  'knästräckning': kneeExtensionAnimation,
  'knee_extension': kneeExtensionAnimation,
  'terminal_knee': kneeExtensionAnimation,
  'patella': kneeExtensionAnimation,
  'quadriceps': kneeExtensionAnimation,
  'quad': kneeExtensionAnimation,
  'bensträckning': kneeExtensionAnimation,

  'hälglidning': heelSlideAnimation,
  'heel_slides': heelSlideAnimation,
  'heelslides': heelSlideAnimation,

  'straight_leg_raise': hipAbductionAnimation,
  'slr': hipAbductionAnimation,
  'rakt_benlyft': hipAbductionAnimation,

  'step_ups': stepUpAnimation,
  'stepups': stepUpAnimation,
  'step_up': stepUpAnimation,
  'trappsteg': stepUpAnimation,

  'spanish_squat': spanishSquatAnimation,
  'spanishsquat': spanishSquatAnimation,
  'benpress': squatAnimation,
  'lår': squatAnimation,
  'hamstring': gluteBridgeAnimation,
  'ischiokrurala': gluteBridgeAnimation,
  'baksida_lår': gluteBridgeAnimation,

  // =============================================
  // ANKLE/FOOT EXERCISES (Fotled/Fot)
  // =============================================
  'tåhävningar': calfRaiseAnimation,
  'calf_raises': calfRaiseAnimation,
  'calfraises': calfRaiseAnimation,
  'vadlyft': calfRaiseAnimation,
  'vadmuskel': calfRaiseAnimation,
  'häl': calfRaiseAnimation,
  'tå_hävning': calfRaiseAnimation,

  'excentrisk_vadträning': eccentricCalfRaiseAnimation,
  'alfredson': eccentricCalfRaiseAnimation,
  'eccentric_calf': eccentricCalfRaiseAnimation,
  'excentrisk_vad': eccentricCalfRaiseAnimation,

  'plantarfasciastretch': heelSlideAnimation,
  'plantar_fascia': heelSlideAnimation,
  'fotsulestretch': heelSlideAnimation,

  'fotledsrotation': forearmRotationAnimation,
  'ankle_rotation': forearmRotationAnimation,
  'vristrotation': forearmRotationAnimation,

  'towel_grab': towelGrabAnimation,
  'towelgrab': towelGrabAnimation,
  'handduksgrepp': towelGrabAnimation,
  'handduk': towelGrabAnimation,

  // =============================================
  // BALANCE EXERCISES (Balans)
  // =============================================
  'enbensbalans': singleLegBalanceAnimation,
  'enbensstående': singleLegBalanceAnimation,
  'single_leg_balance': singleLegBalanceAnimation,
  'proprioception': singleLegBalanceAnimation,

  'tandemstående': singleLegBalanceAnimation,
  'tandem': singleLegBalanceAnimation,

  'bosu_balans': singleLegBalanceAnimation,
  'bosu': singleLegBalanceAnimation,

  // =============================================
  // CARDIO EXERCISES (Kondition)
  // =============================================
  'promenad': singleLegBalanceAnimation,
  'walking': singleLegBalanceAnimation,
  'gång': singleLegBalanceAnimation,

  'stationär_cykel': squatAnimation,
  'cykel': squatAnimation,
  'cycling': squatAnimation,

  'vattengymnastik': shoulderFlexionAnimation,
  'aqua': shoulderFlexionAnimation,
  'simning': shoulderFlexionAnimation,

  // =============================================
  // WRIST/HAND EXERCISES (Handled/Hand)
  // =============================================
  'handledsböjning': wristExtensionAnimation,
  'wrist_flexion': wristExtensionAnimation,
  'handled': wristExtensionAnimation,

  'excentrisk_handledsextension': wristExtensionAnimation,
  'wrist_extension': wristExtensionAnimation,
  'handledsextension': wristExtensionAnimation,

  'greppstyrka': towelGrabAnimation,
  'handtag': towelGrabAnimation,
  'grip': towelGrabAnimation,
  'handflata': towelGrabAnimation,
  'finger': towelGrabAnimation,

  'tennis': wristExtensionAnimation,
  'armbåge': forearmRotationAnimation,
  'underarm': forearmRotationAnimation,

  // =============================================
  // STRETCH EXERCISES (Stretch/Töjning)
  // =============================================
  'stretch': hipFlexorStretchAnimation,
  'töjning': hipFlexorStretchAnimation,
  'rörlighet': catCowAnimation,
  'mobilitet': catCowAnimation,
  'flexibilitet': catCowAnimation,
  'stärkande': squatAnimation,

  // =============================================
  // EXERCISE GENERATOR TEMPLATE ID MAPPINGS
  // Maps template IDs to animations (unique keys only)
  // =============================================

  // --- NECK TEMPLATES ---
  'neck_chin_tuck': chinTuckAnimation,
  'neck_dnf_lift': chinTuckAnimation,
  'deep_neck_flexor_lift': chinTuckAnimation,
  'neck_isometric_flexion': neckExtensionAnimation,
  'neck_isometric_extension': neckExtensionAnimation,
  'neck_isometric_sidebend': neckStretchAnimation,
  'isometrisk_nacklateralflexion': neckStretchAnimation,
  'neck_isometric_rotation': chinTuckAnimation,
  'isometrisk_nackrotation': chinTuckAnimation,
  'neck_upper_trap_stretch': neckStretchAnimation,
  'neck_levator_stretch': neckStretchAnimation,
  'neck_scm_stretch': neckStretchAnimation,
  'scm_stretch': neckStretchAnimation,
  'sternocleidomastoid_stretch': neckStretchAnimation,
  'neck_scalene_stretch': neckStretchAnimation,
  'scalene_stretch': neckStretchAnimation,
  'neck_rotation_arom': chinTuckAnimation,
  'neck_flexion_extension_arom': neckExtensionAnimation,
  'nackflexion_extension': neckExtensionAnimation,
  'neck_sidebend_arom': neckStretchAnimation,

  // --- SHOULDER TEMPLATES ---
  'shoulder_pendulum': shoulderFlexionAnimation,
  'pendling_codman': shoulderFlexionAnimation,
  'pendulum_exercise': shoulderFlexionAnimation,
  'rodd': trunkRotationAnimation,
  'väggänglar': wallSlidesAnimation,
  'shoulder_er_90_abduction': shoulderExternalRotationAnimation,
  'utåtrotation_90_abduktion': shoulderExternalRotationAnimation,
  'shoulder_scaption': fullCanAnimation,
  'scaption_full_can': fullCanAnimation,
  'shoulder_serratus_pushup': serratusPushUpAnimation,
  'serratus_push_up_plus': serratusPushUpAnimation,
  'shoulder_rows': trunkRotationAnimation,
  'shoulder_prone_y': shoulderFlexionAnimation,
  'liggande_y_lyft': shoulderFlexionAnimation,
  'prone_y_raise': shoulderFlexionAnimation,
  'shoulder_prone_t': shoulderFlexionAnimation,
  'liggande_t_lyft': shoulderFlexionAnimation,
  'prone_t_raise': shoulderFlexionAnimation,
  'shoulder_sleeper_stretch': shoulderExternalRotationAnimation,
  'shoulder_cross_body_stretch': shoulderFlexionAnimation,
  'cross_body_stretch': shoulderFlexionAnimation,
  'shoulder_doorway_stretch': shoulderFlexionAnimation,
  'dörrkarms_stretch': shoulderFlexionAnimation,
  'doorway_pec_stretch': shoulderFlexionAnimation,
  'shoulder_wall_slides': wallSlidesAnimation,
  'shoulder_wall_angels': wallSlidesAnimation,
  'wall_angels': wallSlidesAnimation,

  // --- LUMBAR TEMPLATES ---
  'lumbar_mcgill_curlup': mcGillCurlUpAnimation,
  'mcgill curl-up': mcGillCurlUpAnimation,
  'lumbar_birddog': birdDogAnimation,
  'lumbar_sideplank': sidePlankAnimation,
  'lumbar_side_bridge': sidePlankAnimation,
  'side bridge': sidePlankAnimation,
  'sidobrygga': sidePlankAnimation,
  'lumbar_pelvic_tilt': gluteBridgeAnimation,
  'lumbar_pelvic_tilts': gluteBridgeAnimation,
  'pelvic tilts': gluteBridgeAnimation,
  'pelvic_tilts': gluteBridgeAnimation,
  'bäckentiltar': gluteBridgeAnimation,
  'bäckentilt': gluteBridgeAnimation,
  'lumbar_knees_to_chest': heelSlideAnimation,
  'knees to chest': heelSlideAnimation,
  'knän till bröst': heelSlideAnimation,
  'lumbar_piriformis_stretch': hipFlexorStretchAnimation,
  'piriformis stretch': hipFlexorStretchAnimation,
  'piriformisstretch': hipFlexorStretchAnimation,
  'lumbar_child_pose': catCowAnimation,
  'child pose': catCowAnimation,
  'childs pose': catCowAnimation,
  'barnposition': catCowAnimation,
  'lumbar_single_leg_extension': birdDogAnimation,
  'supine single leg extension': birdDogAnimation,
  'liggande enbenslyft': birdDogAnimation,
  'lumbar_prone_hip_extension': gluteBridgeAnimation,
  'prone hip extension': gluteBridgeAnimation,
  'pronliggande höftextension': gluteBridgeAnimation,
  'lumbar_quadruped_rocking': catCowAnimation,
  'quadruped rocking': catCowAnimation,
  'fyrfota gungning': catCowAnimation,
  'lumbar_squat_to_stand': squatAnimation,
  'squat to stand': squatAnimation,
  'knäböj till stående': squatAnimation,
  'lumbar_pallof_press': trunkRotationAnimation,
  'pallof press lumbar': trunkRotationAnimation,
  'lumbar_suitcase_carry': trunkRotationAnimation,
  'suitcase carry': trunkRotationAnimation,
  'suitcase_carry': trunkRotationAnimation,
  'resväskebärning': trunkRotationAnimation,
  'lumbar_deadbug': birdDogAnimation,
  'lumbar_mckenzie': cobraAnimation,
  'prone_press_up_mckenzie': cobraAnimation,
  'lumbar_double_knee_chest': heelSlideAnimation,
  'double_knee_to_chest': heelSlideAnimation,
  'dubbla_knän_till_bröstet': heelSlideAnimation,
  'lumbar_glute_bridge': gluteBridgeAnimation,
  'gluteusbrygga': gluteBridgeAnimation,
  'lumbar_nerve_glide': heelSlideAnimation,
  'sciatic_nerve_glide': heelSlideAnimation,
  'ischiasnerv_glid': heelSlideAnimation,
  'lumbar_rotation_stretch': trunkRotationAnimation,
  'lumbar_rotation': trunkRotationAnimation,
  'ländryggsrotation_stretch': trunkRotationAnimation,

  // --- HIP TEMPLATES ---
  'hip_clamshell': clamshellAnimation,
  'mussla': clamshellAnimation,
  'hip_sidelying_abduction': hipAbductionAnimation,
  'sidoliggande_höftabduktion': hipAbductionAnimation,
  'kneeling_hip_flexor_stretch': hipFlexorStretchAnimation,
  'knästående_höftböjarstretch': hipFlexorStretchAnimation,
  'hip_supine_march': gluteBridgeAnimation,
  'supine_hip_flexor_march': gluteBridgeAnimation,
  'ryggliggande_höftflexion_marsch': gluteBridgeAnimation,
  'hip_prone_extension': gluteBridgeAnimation,
  'hip_internal_rotation_stretch': hipFlexorStretchAnimation,
  'höft_inåtrotation_stretch': hipFlexorStretchAnimation,
  'hip_figure_four': hipFlexorStretchAnimation,
  'figure_four_stretch_piriformis': hipFlexorStretchAnimation,
  'fyran_stretch_piriformis': hipFlexorStretchAnimation,
  'hip_single_leg_balance': singleLegBalanceAnimation,
  'hip_monster_walk': squatAnimation,
  'monstergång': squatAnimation,
  'hip_butterfly_stretch': heelSlideAnimation,
  'seated_adductor_stretch_butterfly': heelSlideAnimation,
  'sittande_adduktorstretch_fjäril': heelSlideAnimation,
  'hip_copenhagen': sidePlankAnimation,
  'copenhagen_adduction': sidePlankAnimation,
  'köpenhamn_adduktion': sidePlankAnimation,

  // --- KNEE TEMPLATES ---
  'knee_quad_set': kneeExtensionAnimation,
  'quad_set_isometric': kneeExtensionAnimation,
  'quadricepskontraktion_isometrisk': kneeExtensionAnimation,
  'knee_slr': hipAbductionAnimation,
  'knee_terminal_extension': kneeExtensionAnimation,
  'terminal_knee_extension': kneeExtensionAnimation,
  'terminal_knäextension': kneeExtensionAnimation,
  'knee_prone_hamstring_curl': gluteBridgeAnimation,
  'prone_hamstring_curl': gluteBridgeAnimation,
  'pronliggande_hamstringcurl': gluteBridgeAnimation,
  'knee_nordic_curl': gluteBridgeAnimation,
  'nordic_hamstring_curl': gluteBridgeAnimation,
  'nordisk_hamstringcurl': gluteBridgeAnimation,
  'knee_wall_sit': squatAnimation,
  'väggsittning': squatAnimation,
  'knee_step_up': stepUpAnimation,
  'uppsteg': stepUpAnimation,
  'knee_mini_squat': squatAnimation,
  'mini_knäböj': squatAnimation,
  'knee_heel_slides': heelSlideAnimation,
  'hälglid': heelSlideAnimation,
  'knee_prone_quad_stretch': heelSlideAnimation,
  'prone_quadriceps_stretch': heelSlideAnimation,
  'pronliggande_quadricepsstretch': heelSlideAnimation,
  'knee_supine_hamstring_stretch': heelSlideAnimation,
  'supine_hamstring_stretch': heelSlideAnimation,
  'ryggliggande_hamstringstretch': heelSlideAnimation,

  // --- ANKLE TEMPLATES ---
  'ankle_bilateral_calf_raise': calfRaiseAnimation,
  'bilateral_calf_raise': calfRaiseAnimation,
  'bilateral_tåhävning': calfRaiseAnimation,
  'ankle_single_leg_calf_raise': calfRaiseAnimation,
  'single_leg_calf_raise': calfRaiseAnimation,
  'enbens_tåhävning': calfRaiseAnimation,
  'ankle_alfredson': eccentricCalfRaiseAnimation,
  'alfredson_eccentric_heel_drop': eccentricCalfRaiseAnimation,
  'alfredson_excentrisk_häldropp': eccentricCalfRaiseAnimation,
  'ankle_balance': singleLegBalanceAnimation,
  'single_leg_balance_ankle_focus': singleLegBalanceAnimation,
  'enbensstående_balans_fotledsfokus': singleLegBalanceAnimation,
  'ankle_theraband': forearmRotationAnimation,
  '4_way_ankle_theraband': forearmRotationAnimation,
  '4_vägs_fotled_theraband': forearmRotationAnimation,
  'ankle_calf_stretch': calfRaiseAnimation,
  'standing_calf_stretch_wall': calfRaiseAnimation,
  'stående_vadstretch_vägg': calfRaiseAnimation,
  'ankle_soleus_stretch': squatAnimation,
  'soleus_stretch_bent_knee': squatAnimation,
  'soleusstretch_böjt_knä': squatAnimation,
  'ankle_alphabet': forearmRotationAnimation,
  'fotledsalfabet': forearmRotationAnimation,
  'ankle_short_foot': towelGrabAnimation,
  'short_foot_exercise': towelGrabAnimation,
  'kort_fot_övning': towelGrabAnimation,
  'ankle_towel_curl': towelGrabAnimation,
  'handdukskurl': towelGrabAnimation,

  // --- CORE TEMPLATES ---
  'core_ta_activation': gluteBridgeAnimation,
  'transverse_abdominis_activation': gluteBridgeAnimation,
  'transversus_abdominis_aktivering': gluteBridgeAnimation,
  'core_breathing': idleAnimation,
  'diaphragmatic_breathing': idleAnimation,
  'diafragmaandning': idleAnimation,
  'diaphragmatic breathing': idleAnimation,
  'Diaphragmatic Breathing': idleAnimation,
  'core_dead_bug': birdDogAnimation,
  'core_front_plank': sidePlankAnimation,
  'front_plank': sidePlankAnimation,
  'frontplanka': sidePlankAnimation,
  'core_pallof_press': trunkRotationAnimation,
  'pallof_press': trunkRotationAnimation,
  'core_side_plank': sidePlankAnimation,
  'core_bird_dog': birdDogAnimation,
  'core_mcgill_curlup': mcGillCurlUpAnimation,
  'core_woodchop': trunkRotationAnimation,
  'cable_band_woodchop': trunkRotationAnimation,
  'kabel_band_vedhuggar': trunkRotationAnimation,

  // =============================================
  // NEW REHABILITATION EXERCISES (FAS 8)
  // =============================================

  // --- PENDULUM / CODMAN (Post-op axel) ---
  'pendulum': pendulumSwingAnimation,
  'pendulum_rörelse': pendulumSwingAnimation,
  'codman_övning': pendulumSwingAnimation,
  'codman övning': pendulumSwingAnimation,
  'passiv_axelrörelse': pendulumSwingAnimation,
  'pendulum_axel': pendulumSwingAnimation,

  // --- STRAIGHT LEG RAISE (Post-op knä/höft) ---
  'straight_leg': straightLegRaiseAnimation,
  'rakt_ben': straightLegRaiseAnimation,
  'benlyft_liggande': straightLegRaiseAnimation,
  'höftflexion_liggande': straightLegRaiseAnimation,
  'hip_flexion_supine': straightLegRaiseAnimation,
  'slr_övning': straightLegRaiseAnimation,

  // --- DEAD BUG (Core stabilisering) ---
  'dead_bug_övning': deadBugAnimation,
  'döda_insekten_övning': deadBugAnimation,
  'core_dead_bug_progression': deadBugAnimation,
  'stabilisering_core': deadBugAnimation,
  'supine_core': deadBugAnimation,

  // --- TERMINAL KNEE EXTENSION (ACL post-op) ---
  'terminal_extension': terminalKneeExtensionAnimation,
  'slutfas_extension': terminalKneeExtensionAnimation,
  'knä_extension_slutfas': terminalKneeExtensionAnimation,
  'tke_övning': terminalKneeExtensionAnimation,
  'quad_activation_sitting': terminalKneeExtensionAnimation,
  'acl_knä_övning': terminalKneeExtensionAnimation,

  // --- ANKLE PUMPS (DVT prevention) ---
  'fotpump_övning': anklePumpsAnimation,
  'ankle_pump': anklePumpsAnimation,
  'cirkulation_övning': anklePumpsAnimation,
  'dvt_prevention': anklePumpsAnimation,
  'post_op_fot': anklePumpsAnimation,
  'fotled_pump': anklePumpsAnimation,
  'dorsal_plantar_flexion': anklePumpsAnimation,

  // --- QUAD SETS (Post-op knä fas 1) ---
  'quad_activation': quadSetsAnimation,
  'quadriceps_set': quadSetsAnimation,
  'isometrisk_quadriceps': quadSetsAnimation,
  'lår_aktivering': quadSetsAnimation,
  'knä_fas1': quadSetsAnimation,
  'vmq_aktivering': quadSetsAnimation,
  'vastus_medialis_aktivering': quadSetsAnimation,
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
