/**
 * Camera Presets for Different Exercise Positions
 * Ensures the full avatar is visible in all exercise modes
 */

export type BodyPosition = 'standing' | 'lying' | 'sitting' | 'kneeling' | 'sidelying';
export type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'CORE' | 'STRETCH' | 'BALANCE' | 'PUSH' | 'GENERAL';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// Camera presets for different body positions
export const CAMERA_PRESETS: Record<BodyPosition, CameraPreset> = {
  standing: {
    position: [0, 0.7, 4],
    target: [0, 0.5, 0],
    fov: 50,
  },
  lying: {
    position: [0, 3, 2],    // Ovanifrån-vinkel för liggande
    target: [0, 0, 0],
    fov: 55,
  },
  sitting: {
    position: [0, 0.5, 3],
    target: [0, 0.3, 0],
    fov: 50,
  },
  kneeling: {
    position: [0, 0.8, 3.5],  // Lite lägre för knäende
    target: [0, 0.3, 0],
    fov: 50,
  },
  sidelying: {
    position: [2, 1.5, 2.5],  // Från sidan för sidoläge
    target: [0, 0.1, 0],
    fov: 55,
  },
};

// Map exercise modes to body positions
export const EXERCISE_TO_POSITION: Record<ExerciseMode, BodyPosition> = {
  LEGS: 'standing',
  PRESS: 'standing',
  PULL: 'standing',
  LUNGE: 'standing',
  CORE: 'lying',
  STRETCH: 'standing',
  BALANCE: 'standing',
  PUSH: 'standing',
  GENERAL: 'standing',
};

/**
 * Get camera preset for a specific exercise mode
 */
export function getCameraPresetForExercise(mode: ExerciseMode): CameraPreset {
  const position = EXERCISE_TO_POSITION[mode];
  return CAMERA_PRESETS[position];
}

/**
 * Get body position for a specific exercise mode
 */
export function getBodyPositionForExercise(mode: ExerciseMode): BodyPosition {
  return EXERCISE_TO_POSITION[mode];
}
