/**
 * ExercisePlayer - Lazy-loaded 3D Exercise Visualization
 *
 * Del av FAS 7: Prestanda-optimeringar
 *
 * Features:
 * - Lazy loading av tunga 3D-komponenter
 * - IntersectionObserver för on-demand laddning
 * - Skeleton placeholder under laddning
 * - Fallback vid fel
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Loader2, Play, User } from 'lucide-react';

// Lazy load 3D components
const Avatar3D = lazy(() => import('./Avatar3D'));
const RealisticAvatar3D = lazy(() => import('./RealisticAvatar3D'));

interface ExercisePlayerProps {
  exerciseName: string;
  exerciseId?: string;
  useRealistic?: boolean;
  autoLoad?: boolean;
  className?: string;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

const ExercisePlaceholder: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    className="w-full h-full min-h-[300px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
    onClick={onClick}
  >
    <div className="w-24 h-24 bg-slate-300 rounded-full flex items-center justify-center mb-4">
      <User className="w-12 h-12 text-slate-400" />
    </div>
    <p className="text-slate-500 text-sm font-medium mb-2">3D-visualisering</p>
    <button
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
      onClick={onClick}
    >
      <Play size={16} />
      Ladda 3D-vy
    </button>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex flex-col items-center justify-center animate-pulse">
    <div className="w-24 h-24 bg-slate-300 rounded-full flex items-center justify-center mb-4">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
    </div>
    <p className="text-slate-500 text-sm">Laddar 3D-modell...</p>
  </div>
);

const ErrorFallback: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="w-full h-full min-h-[300px] bg-red-50 rounded-xl flex flex-col items-center justify-center p-4">
    <p className="text-red-600 text-sm font-medium mb-2">Kunde inte ladda 3D-vy</p>
    <p className="text-red-400 text-xs mb-4">{error.message}</p>
    <button
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
      onClick={onRetry}
    >
      Försök igen
    </button>
  </div>
);

const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exerciseName,
  exerciseId,
  useRealistic = false,
  autoLoad = false,
  className = '',
  onLoadStart,
  onLoadComplete,
}) => {
  const [shouldLoad, setShouldLoad] = useState(autoLoad);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for viewport-based loading
  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Start loading when 50% visible
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '100px', // Start loading slightly before visible
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  const handleLoad = () => {
    if (!shouldLoad) {
      setShouldLoad(true);
      onLoadStart?.();
    }
  };

  const handleLoadComplete = () => {
    setHasLoaded(true);
    onLoadComplete?.();
  };

  const handleRetry = () => {
    setError(null);
    setShouldLoad(true);
  };

  // Trigger load complete after Suspense resolves
  useEffect(() => {
    if (shouldLoad && !hasLoaded) {
      // Give time for lazy component to render
      const timer = setTimeout(() => {
        handleLoadComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldLoad, hasLoaded]);

  if (error) {
    return (
      <div ref={containerRef} className={className}>
        <ErrorFallback error={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!shouldLoad) {
    return (
      <div ref={containerRef} className={className}>
        <ExercisePlaceholder onClick={handleLoad} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <Suspense fallback={<LoadingSkeleton />}>
        {useRealistic ? (
          <RealisticAvatar3D
            exerciseName={exerciseName}
            mode="GENERAL"
          />
        ) : (
          <Avatar3D
            exerciseName={exerciseName}
            steps={[]}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ExercisePlayer;

// Named export for memoized version
export const MemoizedExercisePlayer = React.memo(ExercisePlayer, (prevProps, nextProps) => {
  return (
    prevProps.exerciseName === nextProps.exerciseName &&
    prevProps.exerciseId === nextProps.exerciseId &&
    prevProps.useRealistic === nextProps.useRealistic
  );
});
