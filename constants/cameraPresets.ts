/**
 * Camera Presets for Different Exercise Positions
 * Ensures the full avatar is visible in all exercise modes
 */

export type BodyPosition = 'standing' | 'lying' | 'sitting' | 'kneeling' | 'sidelying' | 'quadruped';
export type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'CORE' | 'STRETCH' | 'BALANCE' | 'PUSH' | 'GENERAL';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// Camera presets for different body positions
// UPPDATERAT: Kameran placerad för att visa hela avataren (1.8m hög)
export const CAMERA_PRESETS: Record<BodyPosition, CameraPreset> = {
  standing: {
    position: [0, 1.0, 5],      // Höjd upp (1.0m) och längre bak (5m)
    target: [0, 0.9, 0],        // Siktar på mitten av kroppen
    fov: 60,                    // Bredare vy för att fånga hela kroppen
  },
  lying: {
    position: [2, 2.5, 3],      // Snedvinkel istället för rakt ovanifrån
    target: [0, 0.2, 0],
    fov: 60,
  },
  sitting: {
    position: [0, 0.8, 4],      // Längre bak
    target: [0, 0.5, 0],
    fov: 55,
  },
  kneeling: {
    position: [0, 1.0, 4],      // Anpassad för knäende position
    target: [0, 0.5, 0],
    fov: 55,
  },
  sidelying: {
    position: [3, 1.5, 3],      // Från sidan för sidoläge
    target: [0, 0.3, 0],
    fov: 60,
  },
  quadruped: {
    position: [2, 2.0, 4],      // Snedvinkel för fyrfota position (cat-cow, bird dog)
    target: [0, 0.4, 0],
    fov: 60,
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
