/**
 * Skeleton Loaders - Sprint 5.5
 *
 * Comprehensive skeleton loading states for improved UX.
 * Shows content placeholders while data/components load.
 *
 * Features:
 * - Multiple preset skeletons for common UI patterns
 * - Animated shimmer effect
 * - Customizable sizing and colors
 * - Accessible with aria-busy
 */

import React, { memo, FC } from 'react';

// ============================================================================
// BASE SKELETON
// ============================================================================

interface SkeletonProps {
  className?: string;
  /** Width - can be Tailwind class or CSS value */
  width?: string;
  /** Height - can be Tailwind class or CSS value */
  height?: string;
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'none';
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const Skeleton: FC<SkeletonProps> = memo(({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
  animation = 'pulse',
}) => {
  const animationClass = animation === 'pulse' ? 'animate-pulse' : animation === 'shimmer' ? 'animate-shimmer' : '';

  return (
    <div
      className={`
        bg-slate-200
        ${roundedMap[rounded]}
        ${animationClass}
        ${width}
        ${height}
        ${className}
      `}
      aria-hidden="true"
    />
  );
});

Skeleton.displayName = 'Skeleton';

// ============================================================================
// EXERCISE CARD SKELETON
// ============================================================================

export const ExerciseCardSkeleton: FC<{ className?: string }> = memo(({ className = '' }) => (
  <div
    className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}
    aria-busy="true"
    aria-label="Laddar övning..."
  >
    {/* Image placeholder */}
    <Skeleton height="h-40" rounded="xl" className="mb-4" />

    {/* Title */}
    <Skeleton height="h-6" width="w-3/4" className="mb-2" />

    {/* Description lines */}
    <Skeleton height="h-4" width="w-full" className="mb-1" />
    <Skeleton height="h-4" width="w-2/3" className="mb-4" />

    {/* Tags */}
    <div className="flex gap-2">
      <Skeleton height="h-6" width="w-16" rounded="full" />
      <Skeleton height="h-6" width="w-20" rounded="full" />
    </div>
  </div>
));

ExerciseCardSkeleton.displayName = 'ExerciseCardSkeleton';

// ============================================================================
// AVATAR/3D SKELETON
// ============================================================================

export const AvatarSkeleton: FC<{ className?: string }> = memo(({ className = '' }) => (
  <div
    className={`bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl flex flex-col items-center justify-center ${className}`}
    style={{ minHeight: '300px' }}
    aria-busy="true"
    aria-label="Laddar avatar..."
  >
    {/* Avatar silhouette with pulse */}
    <div className="animate-pulse flex flex-col items-center">
      {/* Head */}
      <div className="w-16 h-16 bg-slate-300 rounded-full mb-2" />
      {/* Body */}
      <div className="w-24 h-32 bg-slate-300 rounded-t-3xl rounded-b-lg" />
      {/* Legs */}
      <div className="flex gap-4 -mt-1">
        <div className="w-6 h-20 bg-slate-300 rounded-b-lg" />
        <div className="w-6 h-20 bg-slate-300 rounded-b-lg" />
      </div>
    </div>

    <Skeleton height="h-4" width="w-32" className="mt-6" />
  </div>
));

AvatarSkeleton.displayName = 'AvatarSkeleton';

// ============================================================================
// PROGRESS CHART SKELETON
// ============================================================================

export const ChartSkeleton: FC<{ className?: string; height?: string }> = memo(({
  className = '',
  height = 'h-64',
}) => (
  <div
    className={`bg-white rounded-2xl p-4 ${height} ${className}`}
    aria-busy="true"
    aria-label="Laddar diagram..."
  >
    {/* Chart title */}
    <Skeleton height="h-6" width="w-48" className="mb-4" />

    {/* Y-axis labels */}
    <div className="flex h-full">
      <div className="flex flex-col justify-between pr-2 py-4">
        <Skeleton height="h-3" width="w-8" />
        <Skeleton height="h-3" width="w-6" />
        <Skeleton height="h-3" width="w-8" />
        <Skeleton height="h-3" width="w-6" />
      </div>

      {/* Chart bars */}
      <div className="flex-1 flex items-end gap-2 pb-6">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <Skeleton
            key={i}
            height={`h-[${h}%]`}
            className="flex-1 min-w-[20px]"
            rounded="sm"
            style={{ height: `${h}%` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>

    {/* X-axis labels */}
    <div className="flex justify-between mt-2 pl-10">
      {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((_, i) => (
        <Skeleton key={i} height="h-3" width="w-6" />
      ))}
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// ============================================================================
// LIST ITEM SKELETON
// ============================================================================

export const ListItemSkeleton: FC<{ className?: string; hasAvatar?: boolean }> = memo(({
  className = '',
  hasAvatar = false,
}) => (
  <div className={`flex items-center gap-3 p-3 ${className}`} aria-hidden="true">
    {hasAvatar && <Skeleton height="h-10" width="w-10" rounded="full" />}
    <div className="flex-1">
      <Skeleton height="h-4" width="w-3/4" className="mb-2" />
      <Skeleton height="h-3" width="w-1/2" />
    </div>
    <Skeleton height="h-8" width="w-8" rounded="lg" />
  </div>
));

ListItemSkeleton.displayName = 'ListItemSkeleton';

// ============================================================================
// SESSION SUMMARY SKELETON
// ============================================================================

export const SessionSummarySkeleton: FC<{ className?: string }> = memo(({ className = '' }) => (
  <div
    className={`bg-white rounded-2xl p-6 ${className}`}
    aria-busy="true"
    aria-label="Laddar sessionsdata..."
  >
    {/* Header */}
    <div className="flex justify-between items-start mb-6">
      <div>
        <Skeleton height="h-7" width="w-48" className="mb-2" />
        <Skeleton height="h-4" width="w-32" />
      </div>
      <Skeleton height="h-10" width="w-24" rounded="lg" />
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-50 rounded-xl p-4">
          <Skeleton height="h-8" width="w-16" className="mb-2" />
          <Skeleton height="h-4" width="w-20" />
        </div>
      ))}
    </div>

    {/* Timeline */}
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton height="h-8" width="w-8" rounded="full" />
          <Skeleton height="h-4" className="flex-1" />
          <Skeleton height="h-4" width="w-16" />
        </div>
      ))}
    </div>
  </div>
));

SessionSummarySkeleton.displayName = 'SessionSummarySkeleton';

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

export const DashboardSkeleton: FC<{ className?: string }> = memo(({ className = '' }) => (
  <div className={`space-y-6 ${className}`} aria-busy="true" aria-label="Laddar dashboard...">
    {/* Welcome header */}
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6">
      <Skeleton height="h-8" width="w-64" className="mb-2 bg-primary-400" />
      <Skeleton height="h-5" width="w-48" className="bg-primary-400" />
    </div>

    {/* Quick stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <Skeleton height="h-4" width="w-20" className="mb-3" />
          <Skeleton height="h-8" width="w-16" className="mb-1" />
          <Skeleton height="h-3" width="w-24" />
        </div>
      ))}
    </div>

    {/* Main content grid */}
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartSkeleton />
      </div>
      <div className="space-y-4">
        <ExerciseCardSkeleton />
      </div>
    </div>
  </div>
));

DashboardSkeleton.displayName = 'DashboardSkeleton';

// ============================================================================
// FORM SKELETON
// ============================================================================

export const FormSkeleton: FC<{ fields?: number; className?: string }> = memo(({
  fields = 4,
  className = '',
}) => (
  <div className={`space-y-6 ${className}`} aria-busy="true" aria-label="Laddar formulär...">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Skeleton height="h-4" width="w-24" className="mb-2" />
        <Skeleton height="h-12" rounded="lg" />
      </div>
    ))}

    <div className="flex gap-3 pt-4">
      <Skeleton height="h-12" width="w-32" rounded="xl" />
      <Skeleton height="h-12" width="w-24" rounded="xl" />
    </div>
  </div>
));

FormSkeleton.displayName = 'FormSkeleton';

// ============================================================================
// VIDEO PLAYER SKELETON
// ============================================================================

export const VideoSkeleton: FC<{ className?: string }> = memo(({ className = '' }) => (
  <div
    className={`bg-slate-900 rounded-2xl aspect-video flex items-center justify-center ${className}`}
    aria-busy="true"
    aria-label="Laddar video..."
  >
    <div className="flex flex-col items-center">
      {/* Play button placeholder */}
      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-slate-500 border-b-8 border-b-transparent ml-1" />
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-3/4 flex items-center gap-2">
        <Skeleton height="h-3" width="w-12" className="bg-slate-700" />
        <Skeleton height="h-1" className="flex-1 bg-slate-700" rounded="full" />
        <Skeleton height="h-3" width="w-12" className="bg-slate-700" />
      </div>
    </div>
  </div>
));

VideoSkeleton.displayName = 'VideoSkeleton';

// ============================================================================
// CALENDAR SKELETON
// ============================================================================

export const CalendarSkeleton: FC<{ className?: string }> = memo(({ className = '' }) => (
  <div
    className={`bg-white rounded-2xl p-4 ${className}`}
    aria-busy="true"
    aria-label="Laddar kalender..."
  >
    {/* Month header */}
    <div className="flex justify-between items-center mb-4">
      <Skeleton height="h-6" width="w-6" rounded="lg" />
      <Skeleton height="h-6" width="w-32" />
      <Skeleton height="h-6" width="w-6" rounded="lg" />
    </div>

    {/* Weekday headers */}
    <div className="grid grid-cols-7 gap-1 mb-2">
      {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((_, i) => (
        <Skeleton key={i} height="h-6" rounded="sm" />
      ))}
    </div>

    {/* Calendar days */}
    {[1, 2, 3, 4, 5].map((week) => (
      <div key={week} className="grid grid-cols-7 gap-1 mb-1">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <Skeleton key={day} height="h-10" rounded="lg" />
        ))}
      </div>
    ))}
  </div>
));

CalendarSkeleton.displayName = 'CalendarSkeleton';

// ============================================================================
// LEADERBOARD SKELETON
// ============================================================================

export const LeaderboardSkeleton: FC<{ className?: string; items?: number }> = memo(({
  className = '',
  items = 5,
}) => (
  <div
    className={`bg-white rounded-2xl p-4 ${className}`}
    aria-busy="true"
    aria-label="Laddar topplista..."
  >
    <Skeleton height="h-6" width="w-32" className="mb-4" />

    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
          <Skeleton height="h-8" width="w-8" rounded="full" />
          <Skeleton height="h-10" width="w-10" rounded="full" />
          <div className="flex-1">
            <Skeleton height="h-4" width="w-32" className="mb-1" />
            <Skeleton height="h-3" width="w-20" />
          </div>
          <Skeleton height="h-6" width="w-16" rounded="lg" />
        </div>
      ))}
    </div>
  </div>
));

LeaderboardSkeleton.displayName = 'LeaderboardSkeleton';

// ============================================================================
// INLINE SKELETON TEXT
// ============================================================================

export const TextSkeleton: FC<{ lines?: number; className?: string }> = memo(({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="h-4"
        width={i === lines - 1 ? 'w-2/3' : 'w-full'}
      />
    ))}
  </div>
));

TextSkeleton.displayName = 'TextSkeleton';

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  Skeleton,
  ExerciseCardSkeleton,
  AvatarSkeleton,
  ChartSkeleton,
  ListItemSkeleton,
  SessionSummarySkeleton,
  DashboardSkeleton,
  FormSkeleton,
  VideoSkeleton,
  CalendarSkeleton,
  LeaderboardSkeleton,
  TextSkeleton,
};
