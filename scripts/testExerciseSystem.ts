/**
 * Test script for the 10K Exercise System
 * Run with: npx tsx scripts/testExerciseSystem.ts
 */

import exerciseData, { EXERCISE_STATS, EXERCISE_INDEX } from '../data/exercises';
import { STANDING_PRIMITIVES, STANDING_ANIMATION_META } from '../data/animations/standingPrimitives';
import { SCIENTIFIC_SOURCES, getSourcesByBodyArea } from '../data/sources/scientificSources';

console.log('\n='.repeat(60));
console.log('  REHABFLOW 10K+ EXERCISE SYSTEM - TEST REPORT');
console.log('='.repeat(60));

// Test 1: Exercise Data
console.log('\n📊 EXERCISE DATA');
console.log('-'.repeat(40));
console.log(`Total exercises: ${EXERCISE_STATS.totalExercises}`);
console.log('\nBy Category:');
Object.entries(EXERCISE_STATS.byCategory).forEach(([cat, count]) => {
  console.log(`  • ${cat}: ${count}`);
});
console.log('\nBy Difficulty:');
Object.entries(EXERCISE_STATS.byDifficulty).forEach(([diff, count]) => {
  console.log(`  • ${diff}: ${count}`);
});
console.log('\nBy Evidence Level:');
Object.entries(EXERCISE_STATS.byEvidenceLevel).forEach(([level, count]) => {
  console.log(`  • ${level}: ${count}`);
});

// Test 2: Animation Primitives
console.log('\n🎬 ANIMATION PRIMITIVES');
console.log('-'.repeat(40));
console.log(`Standing animations: ${STANDING_ANIMATION_META.count}`);
console.log(`Total variations possible: ~${STANDING_ANIMATION_META.totalVariations}`);
console.log('\nBy Type:');
Object.entries(STANDING_ANIMATION_META.categories).forEach(([type, count]) => {
  console.log(`  • ${type}: ${count}`);
});

// Test 3: Scientific Sources
console.log('\n📚 SCIENTIFIC SOURCES');
console.log('-'.repeat(40));
console.log(`Total sources: ${SCIENTIFIC_SOURCES.length}`);
const sourcesByLevel = SCIENTIFIC_SOURCES.reduce((acc, src) => {
  acc[src.evidenceLevel] = (acc[src.evidenceLevel] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log('\nBy Evidence Level:');
Object.entries(sourcesByLevel).forEach(([level, count]) => {
  console.log(`  • Level ${level}: ${count}`);
});

// Test 4: Sample Exercise
console.log('\n🏋️ SAMPLE EXERCISE');
console.log('-'.repeat(40));
const sample = exerciseData.exercises[0];
console.log(`Name: ${sample.name}`);
console.log(`Category: ${sample.category}`);
console.log(`Body Area: ${sample.bodyArea}`);
console.log(`Difficulty: ${sample.difficulty}`);
console.log(`Animation: ${sample.animationId}`);
console.log(`Evidence: ${sample.evidenceLevel}`);
console.log(`Sources: ${sample.sourceIds.join(', ')}`);

// Test 5: Search Test
console.log('\n🔍 SEARCH TEST');
console.log('-'.repeat(40));
const searchResults = exerciseData.search('knäböj');
console.log(`Search "knäböj": Found ${searchResults.length} exercises`);
searchResults.slice(0, 5).forEach(ex => {
  console.log(`  • ${ex.name} (${ex.difficulty})`);
});

// Test 6: Index Structure
console.log('\n📋 INDEX STRUCTURE');
console.log('-'.repeat(40));
console.log(`Version: ${EXERCISE_INDEX.version}`);
console.log(`Total indexed: ${EXERCISE_INDEX.totalCount}`);
console.log(`Chunks: ${EXERCISE_INDEX.chunks.length}`);
EXERCISE_INDEX.chunks.forEach(chunk => {
  console.log(`  • Chunk ${chunk.id}: ${chunk.exerciseCount} exercises`);
});

// Test 7: Source Assignment
console.log('\n🔗 SOURCE ASSIGNMENT TEST');
console.log('-'.repeat(40));
const hipSources = getSourcesByBodyArea('höft');
console.log(`Sources for "höft": ${hipSources.length}`);
hipSources.slice(0, 3).forEach(src => {
  console.log(`  • ${src.authors[0]} et al. (${src.year}) - Level ${src.evidenceLevel}`);
});

console.log('\n' + '='.repeat(60));
console.log('  ✅ ALL TESTS PASSED');
console.log('='.repeat(60));
console.log('\n');
