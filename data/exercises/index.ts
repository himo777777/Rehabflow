/**
 * Exercise Index and Export
 * Central export point for all exercise data
 */

import {
  ExerciseIndex,
  ExerciseIndexEntry,
  ChunkMeta,
  ExtendedExercise
} from '../../types';
import { CHUNK_001_EXERCISES, CHUNK_001_META } from './chunk_001';
import { CHUNK_002_EXERCISES, CHUNK_002_META } from './chunk_002';
import { CHUNK_003_EXERCISES, CHUNK_003_META } from './chunk_003';
import { CHUNK_004_EXERCISES, CHUNK_004_META } from './chunk_004';
import { CHUNK_005_EXERCISES, CHUNK_005_META } from './chunk_005';
import { CHUNK_006_EXERCISES, CHUNK_006_META } from './chunk_006';
import { CHUNK_007_EXERCISES, CHUNK_007_META } from './chunk_007';
import { CHUNK_008_EXERCISES, CHUNK_008_META } from './chunk_008';

// ============================================
// BUILD INDEX FROM CHUNKS
// ============================================

/**
 * Generate index entries from exercises
 */
function generateIndexEntries(exercises: ExtendedExercise[], chunkId: number): ExerciseIndexEntry[] {
  return exercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    category: ex.category,
    bodyArea: ex.bodyArea,
    difficulty: ex.difficulty,
    chunkId,
    keywords: ex.keywords || []
  }));
}

// Collect all chunk metadata
const CHUNKS: ChunkMeta[] = [
  {
    id: 1,
    filename: 'chunk_001.json',
    exerciseCount: CHUNK_001_META.count,
    categories: CHUNK_001_META.categories as any,
    bodyAreas: CHUNK_001_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 2,
    filename: 'chunk_002.json',
    exerciseCount: CHUNK_002_META.count,
    categories: CHUNK_002_META.categories as any,
    bodyAreas: CHUNK_002_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 3,
    filename: 'chunk_003.json',
    exerciseCount: CHUNK_003_META.count,
    categories: CHUNK_003_META.categories as any,
    bodyAreas: CHUNK_003_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 4,
    filename: 'chunk_004.json',
    exerciseCount: CHUNK_004_META.count,
    categories: CHUNK_004_META.categories as any,
    bodyAreas: CHUNK_004_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 5,
    filename: 'chunk_005.json',
    exerciseCount: CHUNK_005_META.count,
    categories: CHUNK_005_META.categories as any,
    bodyAreas: CHUNK_005_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 6,
    filename: 'chunk_006.json',
    exerciseCount: CHUNK_006_META.count,
    categories: CHUNK_006_META.categories as any,
    bodyAreas: CHUNK_006_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 7,
    filename: 'chunk_007.json',
    exerciseCount: CHUNK_007_META.count,
    categories: CHUNK_007_META.categories as any,
    bodyAreas: CHUNK_007_META.bodyAreas as any,
    loaded: false
  },
  {
    id: 8,
    filename: 'chunk_008.json',
    exerciseCount: CHUNK_008_META.count,
    categories: CHUNK_008_META.categories as any,
    bodyAreas: CHUNK_008_META.bodyAreas as any,
    loaded: false
  }
  // Future chunks will be added here:
];

// Build master index entries
const INDEX_ENTRIES: ExerciseIndexEntry[] = [
  ...generateIndexEntries(CHUNK_001_EXERCISES, 1),
  ...generateIndexEntries(CHUNK_002_EXERCISES, 2),
  ...generateIndexEntries(CHUNK_003_EXERCISES, 3),
  ...generateIndexEntries(CHUNK_004_EXERCISES, 4),
  ...generateIndexEntries(CHUNK_005_EXERCISES, 5),
  ...generateIndexEntries(CHUNK_006_EXERCISES, 6),
  ...generateIndexEntries(CHUNK_007_EXERCISES, 7),
  ...generateIndexEntries(CHUNK_008_EXERCISES, 8)
  // Future entries from other chunks
];

// ============================================
// MASTER INDEX
// ============================================

export const EXERCISE_INDEX: ExerciseIndex = {
  version: '1.0.0',
  totalCount: INDEX_ENTRIES.length,
  lastUpdated: new Date().toISOString(),
  chunks: CHUNKS,
  exercises: INDEX_ENTRIES
};

// ============================================
// IN-MEMORY ACCESS (for development/small datasets)
// ============================================

/**
 * Get all exercises in memory (use for development only)
 * For production, use exerciseLoaderService with lazy loading
 */
export const ALL_EXERCISES: ExtendedExercise[] = [
  ...CHUNK_001_EXERCISES,
  ...CHUNK_002_EXERCISES,
  ...CHUNK_003_EXERCISES,
  ...CHUNK_004_EXERCISES,
  ...CHUNK_005_EXERCISES,
  ...CHUNK_006_EXERCISES,
  ...CHUNK_007_EXERCISES,
  ...CHUNK_008_EXERCISES
  // Future chunks will be added here
];

/**
 * Quick lookup by ID (development only)
 */
export function getExerciseByIdSync(id: string): ExtendedExercise | undefined {
  return ALL_EXERCISES.find(ex => ex.id === id);
}

/**
 * Filter exercises (development only)
 */
export function filterExercisesSync(
  predicate: (ex: ExtendedExercise) => boolean
): ExtendedExercise[] {
  return ALL_EXERCISES.filter(predicate);
}

/**
 * Search exercises by name or keywords (development only)
 */
export function searchExercisesSync(query: string): ExtendedExercise[] {
  const lowerQuery = query.toLowerCase();
  return ALL_EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
    ex.description.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// STATISTICS
// ============================================

export const EXERCISE_STATS = {
  totalExercises: ALL_EXERCISES.length,
  byCategory: ALL_EXERCISES.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byBodyArea: ALL_EXERCISES.reduce((acc, ex) => {
    acc[ex.bodyArea] = (acc[ex.bodyArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byDifficulty: ALL_EXERCISES.reduce((acc, ex) => {
    acc[ex.difficulty] = (acc[ex.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byEvidenceLevel: ALL_EXERCISES.reduce((acc, ex) => {
    acc[ex.evidenceLevel] = (acc[ex.evidenceLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  animationsUsed: new Set(ALL_EXERCISES.map(ex => ex.animationId)).size,
  averageSets: Math.round(ALL_EXERCISES.reduce((sum, ex) => sum + ex.sets, 0) / ALL_EXERCISES.length * 10) / 10
};

// ============================================
// EXPORTS
// ============================================

// Re-export chunks for direct access if needed
export { CHUNK_001_EXERCISES, CHUNK_001_META };
export { CHUNK_002_EXERCISES, CHUNK_002_META };
export { CHUNK_003_EXERCISES, CHUNK_003_META };
export { CHUNK_004_EXERCISES, CHUNK_004_META };
export { CHUNK_005_EXERCISES, CHUNK_005_META };
export { CHUNK_006_EXERCISES, CHUNK_006_META };
export { CHUNK_007_EXERCISES, CHUNK_007_META };
export { CHUNK_008_EXERCISES, CHUNK_008_META };

// Default export
export default {
  index: EXERCISE_INDEX,
  exercises: ALL_EXERCISES,
  stats: EXERCISE_STATS,
  getById: getExerciseByIdSync,
  filter: filterExercisesSync,
  search: searchExercisesSync
};
