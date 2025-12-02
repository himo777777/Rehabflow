import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-slate-200';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton layouts
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
    <Skeleton height={80} variant="rounded" />
    <div className="flex gap-2">
      <Skeleton width={80} height={32} variant="rounded" />
      <Skeleton width={80} height={32} variant="rounded" />
    </div>
  </div>
);

export const ExerciseCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton width="70%" height={24} />
        <Skeleton width={60} height={20} variant="rounded" />
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton height={60} variant="rounded" />
    <div className="flex gap-4">
      <Skeleton width={80} height={40} variant="rounded" />
      <Skeleton width={80} height={40} variant="rounded" />
      <Skeleton width={80} height={40} variant="rounded" />
    </div>
  </div>
);

export const ProgramSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-3xl p-8 border border-slate-100 space-y-4">
      <Skeleton width="50%" height={32} />
      <Skeleton width="80%" height={20} />
      <Skeleton height={100} variant="rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ExerciseCardSkeleton />
      <ExerciseCardSkeleton />
      <ExerciseCardSkeleton />
      <ExerciseCardSkeleton />
    </div>
  </div>
);

export default Skeleton;
