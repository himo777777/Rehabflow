/**
 * Performance Hooks
 *
 * Del av FAS 7: Prestanda-optimeringar
 *
 * Tillhandahåller:
 * - Debounce/throttle för frekventa uppdateringar
 * - Intersection Observer hook för lazy loading
 * - Cached AI-anrop
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================
// DEBOUNCE HOOK
// ============================================

/**
 * Debounce a value - only updates after delay of no changes
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

// ============================================
// THROTTLE HOOK
// ============================================

/**
 * Throttle a callback - only executes once per interval
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  interval: number
): T {
  const lastRun = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= interval) {
        lastRun.current = now;
        callbackRef.current(...args);
      } else {
        // Schedule for later if within throttle window
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callbackRef.current(...args);
        }, interval - (now - lastRun.current));
      }
    }) as T,
    [interval]
  );
}

// ============================================
// INTERSECTION OBSERVER HOOK
// ============================================

interface UseIntersectionOptions {
  threshold?: number | number[];
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersection(
  options: UseIntersectionOptions = {}
): [React.RefObject<HTMLElement>, boolean] {
  const { threshold = 0, rootMargin = '0px', freezeOnceVisible = false } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const frozen = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || frozen.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && freezeOnceVisible) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, freezeOnceVisible]);

  return [elementRef as React.RefObject<HTMLElement>, isVisible];
}

// ============================================
// CACHED FETCH HOOK
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

interface UseCachedFetchOptions<T> {
  cacheTime?: number; // ms
  staleTime?: number; // ms
  onError?: (error: Error) => void;
  enabled?: boolean;
  initialData?: T;
}

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedFetchOptions<T> = {}
): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    staleTime = 30 * 1000,     // 30 seconds default
    onError,
    enabled = true,
    initialData,
  } = options;

  const [data, setData] = useState<T | undefined>(() => {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached) {
      return cached.data;
    }
    return initialData;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    // Return cached data if fresh
    if (cached && now - cached.timestamp < staleTime) {
      setData(cached.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      // Update cache
      cache.set(key, { data: result, timestamp: now });

      // Clean old cache entries
      for (const [cacheKey, entry] of cache.entries()) {
        if (now - entry.timestamp > cacheTime) {
          cache.delete(cacheKey);
        }
      }

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cacheTime, staleTime, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// PREVIOUS VALUE HOOK
// ============================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================
// STABLE CALLBACK HOOK
// ============================================

/**
 * Returns a stable callback that always calls the latest version
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

// ============================================
// MEMOIZED EXERCISE LIST
// ============================================

interface Exercise {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Memoize exercise list with stable identity
 */
export function useMemoizedExercises<T extends Exercise>(
  exercises: T[]
): T[] {
  return useMemo(() => {
    // Create stable reference based on exercise IDs
    return exercises;
  }, [
    // Only update if the actual content changes
    exercises.map(e => e.id).join(','),
    exercises.length,
  ]);
}

// ============================================
// RENDER COUNT HOOK (Dev only)
// ============================================

/**
 * Track component render count - useful for debugging
 * Only logs in development mode
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[RenderCount] ${componentName}: ${renderCount.current}`);
    }
  });

  return renderCount.current;
}

// ============================================
// IDLE CALLBACK HOOK
// ============================================

/**
 * Execute callback during browser idle time
 * Falls back to setTimeout for Safari
 */
export function useIdleCallback(
  callback: () => void,
  options: { timeout?: number } = {}
): void {
  const { timeout = 1000 } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = (window as typeof window & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback(
        () => callbackRef.current(),
        { timeout }
      );
      return () => (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
    } else {
      // Fallback for Safari
      const id = setTimeout(() => callbackRef.current(), 1);
      return () => clearTimeout(id);
    }
  }, [timeout]);
}

// ============================================
// FRAME TIME HOOK
// ============================================

/**
 * Track frame time for animations
 * Returns current frame time in ms
 */
export function useFrameTime(): number {
  const [frameTime, setFrameTime] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number>();

  useEffect(() => {
    const measure = () => {
      const now = performance.now();
      setFrameTime(now - lastTimeRef.current);
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(measure);
    };

    rafRef.current = requestAnimationFrame(measure);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return frameTime;
}

// ============================================
// MEMORY USAGE HOOK
// ============================================

interface MemoryInfo {
  usedJSHeapSize: number | null;
  totalJSHeapSize: number | null;
  jsHeapSizeLimit: number | null;
}

/**
 * Track memory usage (Chrome only)
 * Returns null for browsers that don't support memory API
 */
export function useMemoryUsage(intervalMs = 5000): MemoryInfo {
  const [memory, setMemory] = useState<MemoryInfo>({
    usedJSHeapSize: null,
    totalJSHeapSize: null,
    jsHeapSizeLimit: null,
  });

  useEffect(() => {
    const performance = window.performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (!performance.memory) {
      return;
    }

    const updateMemory = () => {
      if (performance.memory) {
        setMemory({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return memory;
}

// ============================================
// PERFORMANCE MARK HOOK
// ============================================

/**
 * Create performance marks for component lifecycle
 * Useful for tracking mount/unmount timing
 */
export function usePerformanceMark(markName: string): void {
  useEffect(() => {
    const mountMark = `${markName}-mount`;
    const unmountMark = `${markName}-unmount`;

    performance.mark(mountMark);

    return () => {
      performance.mark(unmountMark);
      try {
        performance.measure(markName, mountMark, unmountMark);
      } catch {
        // Marks may have been cleared
      }
    };
  }, [markName]);
}
