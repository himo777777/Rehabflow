/**
 * Lazy Loading Wrappers - Bundle Optimization
 *
 * Provides lazy-loaded versions of heavy components to reduce initial bundle size.
 * Uses React.lazy() with proper Suspense boundaries.
 */

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, Box, Camera, Brain } from 'lucide-react';

// ============================================================================
// LOADING FALLBACKS
// ============================================================================

interface LoadingFallbackProps {
  label?: string;
  icon?: ReactNode;
  height?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  label = 'Laddar...',
  icon,
  height = 'h-64'
}) => (
  <div className={`${height} flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl`}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="p-4 bg-white rounded-2xl shadow-lg"
      >
        {icon || <Loader2 className="w-8 h-8 text-primary-500" />}
      </motion.div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </motion.div>
  </div>
);

const Avatar3DFallback = () => (
  <LoadingFallback
    label="Laddar 3D-avatar..."
    icon={<Box className="w-8 h-8 text-primary-500 animate-pulse" />}
    height="h-80"
  />
);

const CameraFallback = () => (
  <LoadingFallback
    label="Laddar kamera..."
    icon={<Camera className="w-8 h-8 text-primary-500 animate-pulse" />}
    height="h-96"
  />
);

const MLFallback = () => (
  <LoadingFallback
    label="Laddar AI-modell..."
    icon={<Brain className="w-8 h-8 text-purple-500 animate-pulse" />}
    height="h-64"
  />
);

// ============================================================================
// LAZY LOADED 3D COMPONENTS
// ============================================================================

// Avatar3D - Heavy Three.js component
const LazyAvatar3DComponent = lazy(() =>
  import('../Avatar3D').then(module => ({ default: module.default }))
);

// MirrorModeAvatar - Heavy Three.js + Pose Detection
const LazyMirrorModeAvatarComponent = lazy(() =>
  import('../MirrorModeAvatar')
);

// DemonstratorAvatar3D - Three.js demonstrator
const LazyDemonstratorAvatar3DComponent = lazy(() =>
  import('../DemonstratorAvatar3D')
);

// RealisticAvatar3D - Heavy GLTF + Three.js
const LazyRealisticAvatar3DComponent = lazy(() =>
  import('../RealisticAvatar3D')
);

// RealisticSkeleton3D - Three.js skeleton
const LazyRealisticSkeleton3DComponent = lazy(() =>
  import('../RealisticSkeleton3D')
);

// Skeleton3D - Anatomical skeleton with Three.js
const LazySkeleton3DComponent = lazy(() =>
  import('../AnatomicalSkeleton/Skeleton3D')
);

// ROMAssessment - MediaPipe + Camera
const LazyROMAssessmentComponent = lazy(() =>
  import('../ROMAssessment')
);

// PainPredictionDashboard - TensorFlow ML
const LazyPainPredictionDashboardComponent = lazy(() =>
  import('../PainPredictionDashboard')
);

// ============================================================================
// WRAPPER COMPONENTS WITH SUSPENSE
// ============================================================================

// Export lazy-loaded components with proper suspense boundaries
export const LazyAvatar3D: React.FC<React.ComponentProps<typeof LazyAvatar3DComponent>> = (props) => (
  <Suspense fallback={<Avatar3DFallback />}>
    <LazyAvatar3DComponent {...props} />
  </Suspense>
);

export const LazyMirrorModeAvatar: React.FC<React.ComponentProps<typeof LazyMirrorModeAvatarComponent>> = (props) => (
  <Suspense fallback={<Avatar3DFallback />}>
    <LazyMirrorModeAvatarComponent {...props} />
  </Suspense>
);

export const LazyDemonstratorAvatar3D: React.FC<React.ComponentProps<typeof LazyDemonstratorAvatar3DComponent>> = (props) => (
  <Suspense fallback={<Avatar3DFallback />}>
    <LazyDemonstratorAvatar3DComponent {...props} />
  </Suspense>
);

export const LazyRealisticAvatar3D: React.FC<React.ComponentProps<typeof LazyRealisticAvatar3DComponent>> = (props) => (
  <Suspense fallback={<Avatar3DFallback />}>
    <LazyRealisticAvatar3DComponent {...props} />
  </Suspense>
);

export const LazyRealisticSkeleton3D: React.FC<React.ComponentProps<typeof LazyRealisticSkeleton3DComponent>> = (props) => (
  <Suspense fallback={<Avatar3DFallback />}>
    <LazyRealisticSkeleton3DComponent {...props} />
  </Suspense>
);

export const LazySkeleton3D: React.FC<React.ComponentProps<typeof LazySkeleton3DComponent>> = (props) => (
  <Suspense fallback={<Avatar3DFallback />}>
    <LazySkeleton3DComponent {...props} />
  </Suspense>
);

export const LazyROMAssessment: React.FC<React.ComponentProps<typeof LazyROMAssessmentComponent>> = (props) => (
  <Suspense fallback={<CameraFallback />}>
    <LazyROMAssessmentComponent {...props} />
  </Suspense>
);

export const LazyPainPredictionDashboard: React.FC<React.ComponentProps<typeof LazyPainPredictionDashboardComponent>> = (props) => (
  <Suspense fallback={<MLFallback />}>
    <LazyPainPredictionDashboardComponent {...props} />
  </Suspense>
);

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

/**
 * Prefetch a component in the background when browser is idle
 */
export function prefetchComponent(importFn: () => Promise<any>): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      importFn().catch(() => {
        // Silently fail - component will be loaded on demand
      });
    });
  } else {
    // Fallback for Safari
    setTimeout(() => {
      importFn().catch(() => {});
    }, 100);
  }
}

/**
 * Prefetch 3D components when user hovers over related UI
 */
export const prefetch3DComponents = (): void => {
  prefetchComponent(() => import('../Avatar3D'));
  prefetchComponent(() => import('../MirrorModeAvatar'));
};

/**
 * Prefetch ML components for pain prediction
 */
export const prefetchMLComponents = (): void => {
  prefetchComponent(() => import('../PainPredictionDashboard'));
};

/**
 * Prefetch camera components for ROM assessment
 */
export const prefetchCameraComponents = (): void => {
  prefetchComponent(() => import('../ROMAssessment'));
};

// ============================================================================
// DYNAMIC IMPORT HELPERS
// ============================================================================

/**
 * Load Three.js only when needed
 */
export const loadThreeJS = async () => {
  const THREE = await import('three');
  return THREE;
};

/**
 * Load TensorFlow.js only when needed
 */
export const loadTensorFlow = async () => {
  const tf = await import('@tensorflow/tfjs');
  return tf;
};

/**
 * Load MediaPipe Pose only when needed
 */
export const loadMediaPipePose = async () => {
  const pose = await import('@mediapipe/pose');
  return pose;
};

// ============================================================================
// INTERSECTION OBSERVER PREFETCH
// ============================================================================

/**
 * Creates a hook that prefetches components when an element enters viewport
 */
export function usePrefetchOnVisible(
  prefetchFn: () => void,
  options: IntersectionObserverInit = { rootMargin: '100px' }
): React.RefCallback<Element> {
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const hasPrefetchedRef = React.useRef(false);

  return React.useCallback((element: Element | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (element && !hasPrefetchedRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && !hasPrefetchedRef.current) {
          hasPrefetchedRef.current = true;
          prefetchFn();
          observerRef.current?.disconnect();
        }
      }, options);

      observerRef.current.observe(element);
    }
  }, [prefetchFn, options]);
}

export default {
  LazyAvatar3D,
  LazyMirrorModeAvatar,
  LazyDemonstratorAvatar3D,
  LazyRealisticAvatar3D,
  LazyRealisticSkeleton3D,
  LazySkeleton3D,
  LazyROMAssessment,
  LazyPainPredictionDashboard,
  prefetch3DComponents,
  prefetchMLComponents,
  prefetchCameraComponents,
};
