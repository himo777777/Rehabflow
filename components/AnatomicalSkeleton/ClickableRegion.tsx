/**
 * ClickableRegion - Interactive hotspot for skeleton body parts
 *
 * Features:
 * - Enhanced hover state with smooth glow and scale
 * - Selected state with professional pulse animation
 * - Touch-friendly (larger hit area than visual)
 * - Accessible with ARIA labels
 * - Smooth CSS transitions with cubic-bezier easing
 * - Professional medical app styling
 */

import React, { useState } from 'react';

interface ClickableRegionProps {
  x: number;
  y: number;
  radius: number;
  label: string;
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  painLevel?: number; // Optional: 1-10 pain intensity
}

const ClickableRegion: React.FC<ClickableRegionProps> = ({
  x,
  y,
  radius,
  label,
  id,
  isSelected,
  onSelect,
  onHover,
  painLevel,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Larger hit area for touch (increased for mobile)
  const hitRadius = radius + 12;

  // Visual radius with smooth hover/select scale
  const visualScale = isSelected ? 1.35 : isHovered ? 1.2 : 1;
  const visualRadius = radius * visualScale;

  // Enhanced color palette
  const baseColor = '#0ea5e9'; // sky-500
  const hoverColor = '#38bdf8'; // sky-400
  const selectedColor = '#22d3ee'; // cyan-400

  // Pain intensity colors (if provided)
  const getPainColor = (level: number) => {
    if (level <= 3) return '#fcd34d'; // yellow-400 (mild)
    if (level <= 6) return '#fb923c'; // orange-400 (moderate)
    return '#ef4444'; // red-500 (severe)
  };

  const currentColor = painLevel
    ? getPainColor(painLevel)
    : isSelected
      ? selectedColor
      : isHovered
        ? hoverColor
        : baseColor;

  // Smooth easing function
  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  return (
    <g
      onClick={handleClick}
      onTouchEnd={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={label}
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      {/* Invisible larger hit area for touch */}
      <circle
        cx={x}
        cy={y}
        r={hitRadius}
        fill="transparent"
        stroke="none"
      />

      {/* Soft ambient glow (always visible, stronger on hover/select) */}
      <circle
        cx={x}
        cy={y}
        r={visualRadius + 10}
        fill={`url(#regionGlow-${id})`}
        opacity={isSelected ? 0.8 : isHovered ? 0.5 : 0.15}
        style={{
          transition: `all 0.3s ${easing}`,
        }}
      />
      {/* Define gradient inline for this region */}
      <defs>
        <radialGradient id={`regionGlow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={currentColor} stopOpacity="0.6" />
          <stop offset="60%" stopColor={currentColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={currentColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer glow ring (visible on hover/select) */}
      <circle
        cx={x}
        cy={y}
        r={visualRadius + 6}
        fill="none"
        stroke={currentColor}
        strokeWidth={isSelected ? 2.5 : 2}
        opacity={isSelected ? 0.7 : isHovered ? 0.5 : 0}
        style={{
          transition: `all 0.3s ${easing}`,
        }}
      />

      {/* Secondary outer ring for depth */}
      <circle
        cx={x}
        cy={y}
        r={visualRadius + 10}
        fill="none"
        stroke={currentColor}
        strokeWidth={1}
        opacity={isSelected ? 0.4 : isHovered ? 0.2 : 0}
        style={{
          transition: `all 0.3s ${easing}`,
        }}
      />

      {/* Pulse animation ring (only when selected) */}
      {isSelected && (
        <>
          <circle
            cx={x}
            cy={y}
            r={visualRadius}
            fill="none"
            stroke={selectedColor}
            strokeWidth={2}
            opacity={0.6}
            style={{
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
          <circle
            cx={x}
            cy={y}
            r={visualRadius + 4}
            fill="none"
            stroke={selectedColor}
            strokeWidth={1}
            opacity={0.3}
            style={{
              animation: 'pulse-ring 2s ease-out infinite 0.3s',
            }}
          />
        </>
      )}

      {/* Main visible circle with gradient */}
      <circle
        cx={x}
        cy={y}
        r={visualRadius}
        fill={currentColor}
        fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
        stroke="white"
        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
        strokeOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.75}
        style={{
          transition: `all 0.25s ${easing}`,
          filter: isSelected
            ? 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.9))'
            : isHovered
              ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))'
              : 'none',
        }}
      />

      {/* Inner highlight (specular reflection) */}
      <circle
        cx={x - visualRadius * 0.25}
        cy={y - visualRadius * 0.25}
        r={visualRadius * 0.35}
        fill="white"
        fillOpacity={isSelected ? 0.5 : isHovered ? 0.45 : 0.35}
        style={{
          transition: `all 0.25s ${easing}`,
        }}
      />

      {/* Secondary inner highlight for depth */}
      <circle
        cx={x - visualRadius * 0.15}
        cy={y - visualRadius * 0.15}
        r={visualRadius * 0.15}
        fill="white"
        fillOpacity={isSelected ? 0.7 : 0.5}
        style={{
          transition: `all 0.25s ${easing}`,
        }}
      />

      {/* Label tooltip (shown on hover or select) */}
      {(isHovered || isSelected) && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Calculate label position to avoid going off-screen */}
          {(() => {
            const labelX = x > 140 ? x - 14 : x + visualRadius + 14;
            const labelY = y;
            const anchor = x > 140 ? 'end' : 'start';
            const labelWidth = label.length * 6.5 + 20;

            return (
              <>
                {/* Tooltip shadow */}
                <rect
                  x={anchor === 'end' ? labelX - labelWidth + 6 : labelX - 8}
                  y={labelY - 11}
                  width={labelWidth}
                  height={22}
                  rx={8}
                  fill="rgba(0, 0, 0, 0.3)"
                  style={{
                    transform: 'translate(2px, 2px)',
                  }}
                />
                {/* Label background */}
                <rect
                  x={anchor === 'end' ? labelX - labelWidth + 6 : labelX - 8}
                  y={labelY - 11}
                  width={labelWidth}
                  height={22}
                  rx={8}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={currentColor}
                  strokeWidth={1.5}
                  strokeOpacity={isSelected ? 0.8 : 0.5}
                />
                {/* Label text */}
                <text
                  x={labelX}
                  y={labelY + 4}
                  fill="white"
                  fontSize={11}
                  fontWeight={600}
                  fontFamily="Inter, system-ui, sans-serif"
                  textAnchor={anchor}
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {label}
                </text>
                {/* Pain level indicator (if provided) */}
                {painLevel && (
                  <text
                    x={anchor === 'end' ? labelX - labelWidth + 14 : labelX + labelWidth - 20}
                    y={labelY + 4}
                    fill={getPainColor(painLevel)}
                    fontSize={10}
                    fontWeight={700}
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {painLevel}/10
                  </text>
                )}
              </>
            );
          })()}
        </g>
      )}
    </g>
  );
};

export default ClickableRegion;
