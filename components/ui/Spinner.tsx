/**
 * Spinner - Reusable loading spinner component
 *
 * A consistent loading indicator used across the application.
 * Uses Lucide's Loader2 icon with spin animation.
 *
 * Usage:
 * <Spinner /> // Default medium size
 * <Spinner size="sm" /> // Small
 * <Spinner size="lg" text="Laddar..." /> // Large with text
 * <Spinner className="text-cyan-500" /> // Custom color
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  /** Size variant: sm (16px), md (24px), lg (32px), xl (48px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional text to display below spinner */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Center the spinner in its container */
  centered?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  text,
  className = '',
  centered = false,
}) => {
  const iconSize = sizeMap[size];
  const textSize = textSizeMap[size];

  const spinnerContent = (
    <>
      <Loader2
        size={iconSize}
        className={`animate-spin ${className || 'text-primary-500'}`}
        aria-hidden="true"
      />
      {text && (
        <span className={`${textSize} text-slate-500 font-medium mt-2`}>
          {text}
        </span>
      )}
    </>
  );

  if (centered) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label={text || 'Laddar...'}
      >
        {spinnerContent}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center ${text ? 'gap-2' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={text || 'Laddar...'}
    >
      {spinnerContent}
    </div>
  );
};

export default Spinner;
