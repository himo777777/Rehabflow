/**
 * AnatomicalSkeleton - Professional interactive body map
 *
 * A clean, SVG-based anatomical skeleton for selecting body regions.
 * Designed for medical/rehabilitation applications with:
 * - Anatomically correct proportions (8 head heights)
 * - Multiple views (front, back)
 * - Accessible clickable regions
 * - Smooth micro-interactions
 * - Professional 3D depth with gradients and shadows
 * - Pain intensity visualization (optional)
 * - NEW: Optional 3D mode with React Three Fiber
 *
 * Usage:
 * <AnatomicalSkeleton
 *   selected="Knä"
 *   onSelect={(id) => console.log('Selected:', id)}
 *   painLevels={{ 'Knä': 7, 'Axel': 4 }}
 *   use3D={true}  // Optional: Enable 3D mode
 * />
 */

import React, { useState, useMemo, lazy, Suspense } from 'react';
import SkeletonSVG from './SkeletonSVG';
import ClickableRegion from './ClickableRegion';

// Lazy load 3D component for better performance
const Skeleton3D = lazy(() => import('./Skeleton3D'));
import {
  SKELETON_REGIONS,
  getRegionsForView,
  SVG_WIDTH,
  SVG_HEIGHT,
} from './skeletonData';

// CSS for animations
const styles = `
  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.4);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .info-panel {
    animation: fade-in 0.25s ease-out;
  }
`;

interface AnatomicalSkeletonProps {
  selected: string;
  onSelect: (part: string) => void;
  painLevels?: Record<string, number>; // Optional: Map of region ID to pain level (1-10)
  showPainLegend?: boolean; // Optional: Show pain color legend
  use3D?: boolean; // Optional: Use 3D model instead of SVG
}

const AnatomicalSkeleton: React.FC<AnatomicalSkeletonProps> = ({
  selected,
  onSelect,
  painLevels = {},
  showPainLegend = false,
  use3D = false,
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Render 3D version if enabled
  if (use3D) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-[500px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl flex items-center justify-center border border-slate-700/50">
            <div className="text-slate-400 text-sm">Laddar 3D-modell...</div>
          </div>
        }
      >
        <Skeleton3D
          selected={selected}
          onSelect={onSelect}
          painLevels={painLevels}
        />
      </Suspense>
    );
  }

  // Get regions for current view
  const visibleRegions = useMemo(() => {
    return getRegionsForView(view);
  }, [view]);

  // Get description for selected region
  const selectedRegion = useMemo(() => {
    return SKELETON_REGIONS.find(r => r.id === selected);
  }, [selected]);

  // View button component
  const ViewButton = ({
    viewType,
    label,
  }: {
    viewType: 'front' | 'back';
    label: string;
  }) => (
    <button
      onClick={() => setView(viewType)}
      className={`
        px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200
        ${view === viewType
          ? 'bg-cyan-500 text-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/25'
          : 'bg-slate-800/80 text-slate-300 border-slate-600/50 hover:bg-slate-700/80 hover:text-white hover:border-slate-500'
        }
      `}
      aria-pressed={view === viewType}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Inject animation styles */}
      <style>{styles}</style>

      <div className="relative w-full max-w-md mx-auto">
        {/* Main container */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
          {/* Header with view controls */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
            {/* View toggle */}
            <div className="flex gap-2">
              <ViewButton viewType="front" label="Framsida" />
              <ViewButton viewType="back" label="Baksida" />
            </div>

            {/* Instructions hint */}
            <div className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              Tryck på en punkt
            </div>
          </div>

          {/* SVG Container */}
          <div className="relative pt-14 pb-4 px-2" style={{ minHeight: '480px' }}>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
              aria-label={`Skelett - ${view === 'front' ? 'framsida' : 'baksida'}`}
              role="img"
            >
              {/* Background gradient */}
              <defs>
                <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Subtle background glow */}
              <rect
                x="0"
                y="0"
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                fill="url(#bgGradient)"
              />

              {/* Skeleton illustration */}
              <SkeletonSVG view={view} />

              {/* Clickable regions */}
              {visibleRegions.map((region, idx) => {
                const coords = region.coordinates[view];
                if (!coords) return null;

                return (
                  <ClickableRegion
                    key={`${region.id}-${region.label}-${idx}`}
                    x={coords.x}
                    y={coords.y}
                    radius={coords.radius}
                    label={region.label}
                    id={region.id}
                    isSelected={selected === region.id}
                    onSelect={onSelect}
                    onHover={setHoveredRegion}
                    painLevel={painLevels[region.id]}
                  />
                );
              })}
            </svg>
          </div>

          {/* Info panel at bottom */}
          {selected && selectedRegion && (
            <div className="info-panel absolute bottom-4 left-4 right-4 z-30">
              <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                    <svg
                      className="w-5 h-5 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm tracking-wide mb-1">
                      {selected}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {selectedRegion.description}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => onSelect('')}
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
                    aria-label="Avmarkera"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pain intensity legend (optional) */}
        {showPainLegend && (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <span className="text-slate-500">Smärtintensitet:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-slate-400">Mild</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-400"></span>
              <span className="text-slate-400">Måttlig</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-slate-400">Svår</span>
            </div>
          </div>
        )}

        {/* Region count indicator */}
        <div className="mt-3 text-center text-xs text-slate-500">
          {visibleRegions.length} valbara områden • {view === 'front' ? 'Framsida' : 'Baksida'}
        </div>
      </div>
    </>
  );
};

export default AnatomicalSkeleton;
