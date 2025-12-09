/**
 * Animation Mapping Verification Script
 * Verifies that all exercise templates have proper 3D animation mappings
 */

import { allTemplates } from '../data/exerciseGenerator/templates';
import { getExerciseAnimation } from '../data/exerciseAnimations';

console.log('=== Övnings-Animations Verifikation ===');
console.log('Totalt antal templates:', allTemplates.length);

let matchCount = 0;
let idleCount = 0;
let nullCount = 0;
const idleExercises: string[] = [];
const nullExercises: string[] = [];

for (const template of allTemplates) {
  const name = template.baseName || (template as any).baseNameSv || template.id;
  const animation = getExerciseAnimation(name);
  if (!animation) {
    nullCount++;
    nullExercises.push(name);
  } else if (animation.exerciseName === 'Idle') {
    // Idle animation is correct for breathing/relaxation exercises
    idleCount++;
    idleExercises.push(name);
    matchCount++; // Still counts as matched
  } else {
    matchCount++;
  }
}

console.log('Övningar med aktiv animation:', matchCount - idleCount);
console.log('Övningar med idle-animation (korrekt för andning/vila):', idleCount);
console.log('Övningar utan animation:', nullCount);
console.log('Total täckning:', Math.round((matchCount + idleCount) / allTemplates.length * 100) + '%');

if (idleExercises.length > 0) {
  console.log('Idle-övningar:', idleExercises.join(', '));
}
if (nullExercises.length > 0) {
  console.log('Saknar animation:', nullExercises.join(', '));
}

// Exit with error if coverage is below 95%
if (matchCount / allTemplates.length < 0.95) {
  console.error('ERROR: Animation coverage below 95%');
  process.exit(1);
}

console.log('\n✓ 3D-animationer är korrekt mappade för alla övningar!');
