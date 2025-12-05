/**
 * Exercise Loader Service
 * Handles chunked loading of 10,000+ exercises with caching and search
 */

import {
  ExtendedExercise,
  ExerciseIndex,
  ExerciseIndexEntry,
  ExerciseFilters,
  PaginatedExercises,
  ChunkMeta,
  ExtendedExerciseCategory,
  BodyArea
} from '../types';

// Configuration
const INDEX_URL = '/data/exercises/index.json';
const CHUNK_BASE_URL = '/data/exercises/';
const CACHE_VERSION = 'v1';
const PAGE_SIZE = 20;

// In-memory cache
let exerciseIndex: ExerciseIndex | null = null;
const loadedChunks: Map<number, ExtendedExercise[]> = new Map();
const exerciseCache: Map<string, ExtendedExercise> = new Map();

/**
 * Initialize the exercise loader by loading the index
 */
export async function initializeExerciseLoader(): Promise<ExerciseIndex> {
  if (exerciseIndex) {
    return exerciseIndex;
  }

  try {
    // Try to load from IndexedDB cache first
    const cachedIndex = await getCachedIndex();
    if (cachedIndex) {
      exerciseIndex = cachedIndex;
      return exerciseIndex;
    }

    // Fetch from network
    const response = await fetch(INDEX_URL);
    if (!response.ok) {
      throw new Error(`Failed to load exercise index: ${response.status}`);
    }

    exerciseIndex = await response.json();

    // Cache the index
    await cacheIndex(exerciseIndex!);

    return exerciseIndex!;
  } catch (error) {
    console.error('Failed to initialize exercise loader:', error);
    // Return empty index as fallback
    exerciseIndex = {
      version: '0.0.0',
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
      chunks: [],
      exercises: []
    };
    return exerciseIndex;
  }
}

/**
 * Get exercise index (lazy load if needed)
 */
export async function getExerciseIndex(): Promise<ExerciseIndex> {
  if (!exerciseIndex) {
    return initializeExerciseLoader();
  }
  return exerciseIndex;
}

/**
 * Load a specific chunk of exercises
 */
export async function loadChunk(chunkId: number): Promise<ExtendedExercise[]> {
  // Check memory cache
  if (loadedChunks.has(chunkId)) {
    return loadedChunks.get(chunkId)!;
  }

  // Check IndexedDB cache
  const cachedChunk = await getCachedChunk(chunkId);
  if (cachedChunk) {
    loadedChunks.set(chunkId, cachedChunk);
    // Index exercises for quick lookup
    cachedChunk.forEach(ex => exerciseCache.set(ex.id, ex));
    return cachedChunk;
  }

  // Fetch from network
  const index = await getExerciseIndex();
  const chunkMeta = index.chunks.find(c => c.id === chunkId);

  if (!chunkMeta) {
    console.warn(`Chunk ${chunkId} not found in index`);
    return [];
  }

  try {
    const response = await fetch(`${CHUNK_BASE_URL}${chunkMeta.filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load chunk ${chunkId}: ${response.status}`);
    }

    const exercises: ExtendedExercise[] = await response.json();

    // Cache in memory
    loadedChunks.set(chunkId, exercises);
    exercises.forEach(ex => exerciseCache.set(ex.id, ex));

    // Cache in IndexedDB
    await cacheChunk(chunkId, exercises);

    // Update chunk loaded status in index
    chunkMeta.loaded = true;

    return exercises;
  } catch (error) {
    console.error(`Failed to load chunk ${chunkId}:`, error);
    return [];
  }
}

/**
 * Get a single exercise by ID
 */
export async function getExerciseById(id: string): Promise<ExtendedExercise | null> {
  // Check memory cache
  if (exerciseCache.has(id)) {
    return exerciseCache.get(id)!;
  }

  // Find which chunk contains this exercise
  const index = await getExerciseIndex();
  const indexEntry = index.exercises.find(e => e.id === id);

  if (!indexEntry) {
    return null;
  }

  // Load the chunk
  const chunk = await loadChunk(indexEntry.chunkId);

  // Find and return the exercise
  return chunk.find(e => e.id === id) || null;
}

/**
 * Search exercises using the index (fast)
 */
export async function searchExercises(
  filters: ExerciseFilters,
  page: number = 0,
  pageSize: number = PAGE_SIZE
): Promise<PaginatedExercises> {
  const index = await getExerciseIndex();

  // Filter index entries (fast in-memory filtering)
  let filtered = index.exercises;

  // Apply filters
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(e => filters.categories!.includes(e.category));
  }

  if (filters.bodyAreas && filters.bodyAreas.length > 0) {
    filtered = filtered.filter(e => filters.bodyAreas!.includes(e.bodyArea));
  }

  if (filters.difficulties && filters.difficulties.length > 0) {
    filtered = filtered.filter(e => filters.difficulties!.includes(e.difficulty));
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.keywords.some(k => k.toLowerCase().includes(query))
    );
  }

  // Calculate pagination
  const total = filtered.length;
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageEntries = filtered.slice(startIndex, endIndex);

  // Determine which chunks we need to load
  const requiredChunks = new Set(pageEntries.map(e => e.chunkId));

  // Load required chunks in parallel
  await Promise.all(
    Array.from(requiredChunks).map(chunkId => loadChunk(chunkId))
  );

  // Get full exercise data from cache
  const exercises = pageEntries
    .map(entry => exerciseCache.get(entry.id))
    .filter((e): e is ExtendedExercise => e !== undefined);

  return {
    exercises,
    total,
    page,
    pageSize,
    hasMore: endIndex < total
  };
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(
  category: ExtendedExerciseCategory,
  page: number = 0
): Promise<PaginatedExercises> {
  return searchExercises({ categories: [category] }, page);
}

/**
 * Get exercises by body area
 */
export async function getExercisesByBodyArea(
  bodyArea: BodyArea,
  page: number = 0
): Promise<PaginatedExercises> {
  return searchExercises({ bodyAreas: [bodyArea] }, page);
}

/**
 * Fuzzy search for exercise name
 */
export async function fuzzySearchExercises(
  query: string,
  limit: number = 10
): Promise<ExerciseIndexEntry[]> {
  const index = await getExerciseIndex();
  const queryLower = query.toLowerCase();

  // Score each exercise based on match quality
  const scored = index.exercises.map(entry => {
    const nameLower = entry.name.toLowerCase();
    let score = 0;

    // Exact match
    if (nameLower === queryLower) {
      score = 100;
    }
    // Starts with query
    else if (nameLower.startsWith(queryLower)) {
      score = 80;
    }
    // Contains query
    else if (nameLower.includes(queryLower)) {
      score = 60;
    }
    // Keyword match
    else if (entry.keywords.some(k => k.toLowerCase().includes(queryLower))) {
      score = 40;
    }
    // Levenshtein distance for typo tolerance (simplified)
    else {
      const distance = levenshteinDistance(queryLower, nameLower.slice(0, queryLower.length));
      if (distance <= 2) {
        score = 30 - distance * 10;
      }
    }

    return { entry, score };
  });

  // Sort by score and return top matches
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

/**
 * Preload chunks for offline use
 */
export async function preloadAllChunks(
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const index = await getExerciseIndex();
  const total = index.chunks.length;
  let loaded = 0;

  for (const chunk of index.chunks) {
    if (!loadedChunks.has(chunk.id)) {
      await loadChunk(chunk.id);
    }
    loaded++;
    onProgress?.(loaded, total);
  }
}

/**
 * Get loading statistics
 */
export function getLoadingStats(): {
  totalExercises: number;
  loadedChunks: number;
  totalChunks: number;
  cachedExercises: number;
} {
  return {
    totalExercises: exerciseIndex?.totalCount || 0,
    loadedChunks: loadedChunks.size,
    totalChunks: exerciseIndex?.chunks.length || 0,
    cachedExercises: exerciseCache.size
  };
}

/**
 * Clear all caches
 */
export async function clearCache(): Promise<void> {
  loadedChunks.clear();
  exerciseCache.clear();
  exerciseIndex = null;

  // Clear IndexedDB
  await clearIndexedDBCache();
}

// ============================================
// IndexedDB Cache Implementation
// ============================================

const DB_NAME = 'RehabFlowExercises';
const DB_VERSION = 1;
const INDEX_STORE = 'exerciseIndex';
const CHUNKS_STORE = 'exerciseChunks';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create index store
      if (!db.objectStoreNames.contains(INDEX_STORE)) {
        db.createObjectStore(INDEX_STORE, { keyPath: 'version' });
      }

      // Create chunks store
      if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
        db.createObjectStore(CHUNKS_STORE, { keyPath: 'chunkId' });
      }
    };
  });

  return dbPromise;
}

async function getCachedIndex(): Promise<ExerciseIndex | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(INDEX_STORE, 'readonly');
      const store = transaction.objectStore(INDEX_STORE);
      const request = store.get(CACHE_VERSION);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function cacheIndex(index: ExerciseIndex): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(INDEX_STORE, 'readwrite');
      const store = transaction.objectStore(INDEX_STORE);
      const request = store.put({ version: CACHE_VERSION, data: index });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to cache index:', error);
  }
}

async function getCachedChunk(chunkId: number): Promise<ExtendedExercise[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHUNKS_STORE, 'readonly');
      const store = transaction.objectStore(CHUNKS_STORE);
      const request = store.get(chunkId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.exercises : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function cacheChunk(chunkId: number, exercises: ExtendedExercise[]): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHUNKS_STORE, 'readwrite');
      const store = transaction.objectStore(CHUNKS_STORE);
      const request = store.put({ chunkId, exercises });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to cache chunk:', error);
  }
}

async function clearIndexedDBCache(): Promise<void> {
  try {
    const db = await getDB();
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(INDEX_STORE, 'readwrite');
        const request = transaction.objectStore(INDEX_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(CHUNKS_STORE, 'readwrite');
        const request = transaction.objectStore(CHUNKS_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
  } catch (error) {
    console.warn('Failed to clear IndexedDB cache:', error);
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Simple Levenshtein distance for typo tolerance
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Export service instance
export const exerciseLoaderService = {
  initialize: initializeExerciseLoader,
  getIndex: getExerciseIndex,
  loadChunk,
  getById: getExerciseById,
  search: searchExercises,
  getByCategory: getExercisesByCategory,
  getByBodyArea: getExercisesByBodyArea,
  fuzzySearch: fuzzySearchExercises,
  preloadAll: preloadAllChunks,
  getStats: getLoadingStats,
  clearCache
};

export default exerciseLoaderService;
