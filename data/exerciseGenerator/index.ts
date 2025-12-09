/**
 * Exercise Generator Index
 *
 * Main entry point for the exercise generation system.
 * Exports all types, templates, and generator functions.
 */

// Types
export * from './types';

// Templates
export { NECK_TEMPLATES } from './templates/neckTemplates';
export { SHOULDER_TEMPLATES } from './templates/shoulderTemplates';
export { lumbarTemplates } from './templates/lumbarTemplates';
export { hipTemplates } from './templates/hipTemplates';
export { kneeTemplates } from './templates/kneeTemplates';
export { ankleTemplates } from './templates/ankleTemplates';
export { coreTemplates } from './templates/coreTemplates';

// Generator
export {
  generateAllExercises,
  getExercisesByBodyRegion,
  getExercisesByDifficulty,
  getExerciseStats,
  generatedExerciseDatabase
} from './generator';

// Default export with all generated exercises
export { generatedExerciseDatabase as default } from './generator';
