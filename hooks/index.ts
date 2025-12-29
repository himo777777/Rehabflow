// Core hooks
export { default as useLocalStorage } from './useLocalStorage';
export { default as useAsync } from './useAsync';
export { default as useToast } from './useToast';
export { default as useOnlineStatus } from './useOnlineStatus';
export { useDebounce, useDebouncedCallback, useThrottledCallback } from './useDebounce';
export { useKeyboardShortcuts, useKeyPress } from './useKeyboardShortcuts';

// Clinical hooks
export {
  useClinicalDecisions,
  usePatientClinicalDecisions,
  useProviderClinicalDashboard,
  useCriticalAlerts
} from './useClinicalDecisions';

// Performance hooks (extended set from usePerformance)
export {
  useIntersection,
  useCachedFetch,
  usePrevious,
  useStableCallback,
  useMemoizedExercises,
  useRenderCount,
  useIdleCallback,
  useFrameTime,
  useMemoryUsage,
  usePerformanceMark
} from './usePerformance';

// Mobile & Accessibility
export { useReducedMotion } from './useReducedMotion';
export { useMobileOptimizations } from './useMobileOptimizations';
export { default as useAccessibility } from './useAccessibility';
export { useTouchGestures } from './useTouchGestures';

// Data & Sync
export { useOfflineSync } from './useOfflineSync';
export { useSync } from './useSync';
export { useHealthData } from './useHealthData';
export { usePainPrediction } from './usePainPrediction';

// 3D & Pose
export { useAvatarModel } from './useAvatarModel';
export { usePoseWorker } from './usePoseWorker';
