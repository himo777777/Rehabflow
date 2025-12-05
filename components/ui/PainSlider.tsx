/**
 * PainSlider Component
 * Reusable pain scale slider with gradient colors (green to red)
 */

import React from 'react';

interface PainSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  showLabels?: boolean;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
}

const PainSlider: React.FC<PainSliderProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 10,
  showLabels = true,
  minLabel = 'Ingen',
  maxLabel = 'Extrem',
  className = ''
}) => {
  // Calculate percentage for gradient
  const percentage = ((value - min) / (max - min)) * 100;

  // Get color based on value
  const getValueColor = (): string => {
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-amber-600';
    return 'text-red-600';
  };

  // Generate gradient background
  const getGradientBackground = (): string => {
    return `linear-gradient(to right, #22c55e 0%, #22c55e ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
  };

  return (
    <div className={className}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
        {label}: <span className={getValueColor()}>{value}/{max}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: getGradientBackground() }}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      {showLabels && (
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};

export default PainSlider;
