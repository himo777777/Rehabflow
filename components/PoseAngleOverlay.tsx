/**
 * PoseAngleOverlay.tsx
 *
 * Real-time angle measurement overlay for camera-based exercise analysis.
 * Shows joint angles, target ranges, and visual correction hints.
 */

import React, { useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface JointAngle {
  name: string;
  angle: number;
  targetMin: number;
  targetMax: number;
  optimal: number;
  position: { x: number; y: number };
  isVisible: boolean;
}

export interface AngleComparisonResult {
  angle: number;
  target: number;
  deviation: number;
  quality: 'excellent' | 'good' | 'needs_work' | 'incorrect';
  direction: 'increase' | 'decrease' | 'hold';
}

interface PoseAngleOverlayProps {
  angles: JointAngle[];
  width: number;
  height: number;
  showAllAngles?: boolean;
  showTargetRanges?: boolean;
  showDeviationArrows?: boolean;
  highContrast?: boolean;
  language?: 'sv' | 'en';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const JOINT_LABELS: Record<string, { sv: string; en: string }> = {
  leftKnee: { sv: 'V. Knä', en: 'L. Knee' },
  rightKnee: { sv: 'H. Knä', en: 'R. Knee' },
  leftHip: { sv: 'V. Höft', en: 'L. Hip' },
  rightHip: { sv: 'H. Höft', en: 'R. Hip' },
  leftElbow: { sv: 'V. Armbåge', en: 'L. Elbow' },
  rightElbow: { sv: 'H. Armbåge', en: 'R. Elbow' },
  leftShoulder: { sv: 'V. Axel', en: 'L. Shoulder' },
  rightShoulder: { sv: 'H. Axel', en: 'R. Shoulder' },
  spine: { sv: 'Rygg', en: 'Spine' },
  neck: { sv: 'Nacke', en: 'Neck' },
};

const QUALITY_COLORS = {
  excellent: { bg: 'rgba(34, 197, 94, 0.9)', text: '#ffffff', border: '#22c55e' },
  good: { bg: 'rgba(132, 204, 22, 0.9)', text: '#ffffff', border: '#84cc16' },
  needs_work: { bg: 'rgba(245, 158, 11, 0.9)', text: '#ffffff', border: '#f59e0b' },
  incorrect: { bg: 'rgba(239, 68, 68, 0.9)', text: '#ffffff', border: '#ef4444' },
};

const QUALITY_COLORS_HIGH_CONTRAST = {
  excellent: { bg: 'rgba(0, 255, 0, 0.95)', text: '#000000', border: '#00FF00' },
  good: { bg: 'rgba(255, 255, 0, 0.95)', text: '#000000', border: '#FFFF00' },
  needs_work: { bg: 'rgba(255, 128, 0, 0.95)', text: '#000000', border: '#FF8000' },
  incorrect: { bg: 'rgba(255, 0, 255, 0.95)', text: '#000000', border: '#FF00FF' },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate angle quality based on deviation from target
 */
export function calculateAngleQuality(
  angle: number,
  targetMin: number,
  targetMax: number,
  optimal: number
): AngleComparisonResult {
  const deviation = Math.min(
    Math.abs(angle - optimal),
    Math.min(
      Math.abs(angle - targetMin),
      Math.abs(angle - targetMax)
    )
  );

  let quality: AngleComparisonResult['quality'];
  if (angle >= targetMin && angle <= targetMax) {
    if (Math.abs(angle - optimal) <= 10) {
      quality = 'excellent';
    } else {
      quality = 'good';
    }
  } else if (deviation <= 20) {
    quality = 'needs_work';
  } else {
    quality = 'incorrect';
  }

  let direction: AngleComparisonResult['direction'];
  if (angle >= targetMin && angle <= targetMax) {
    direction = 'hold';
  } else if (angle < targetMin) {
    direction = 'increase';
  } else {
    direction = 'decrease';
  }

  return {
    angle,
    target: optimal,
    deviation,
    quality,
    direction,
  };
}

/**
 * Format angle display
 */
function formatAngle(angle: number): string {
  return `${Math.round(angle)}°`;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Individual angle badge displayed at joint position
 */
const AngleBadge: React.FC<{
  joint: JointAngle;
  comparison: AngleComparisonResult;
  showTarget: boolean;
  showArrow: boolean;
  highContrast: boolean;
  language: 'sv' | 'en';
}> = ({ joint, comparison, showTarget, showArrow, highContrast, language }) => {
  const colors = highContrast
    ? QUALITY_COLORS_HIGH_CONTRAST[comparison.quality]
    : QUALITY_COLORS[comparison.quality];

  const label = JOINT_LABELS[joint.name]?.[language] || joint.name;

  if (!joint.isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: joint.position.x,
        top: joint.position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Main angle badge */}
      <div
        className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 shadow-lg"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${colors.border}`,
          minWidth: '48px',
        }}
      >
        {/* Joint label */}
        <span
          className="text-xs font-medium opacity-80"
          style={{ color: colors.text }}
        >
          {label}
        </span>

        {/* Current angle */}
        <span
          className="text-lg font-bold leading-none"
          style={{ color: colors.text }}
        >
          {formatAngle(comparison.angle)}
        </span>

        {/* Target range (optional) */}
        {showTarget && (
          <span
            className="text-xs opacity-70"
            style={{ color: colors.text }}
          >
            ({joint.targetMin}°-{joint.targetMax}°)
          </span>
        )}
      </div>

      {/* Correction arrow (optional) */}
      {showArrow && comparison.direction !== 'hold' && (
        <div
          className="absolute -right-6 top-1/2 -translate-y-1/2 animate-pulse"
          style={{ color: colors.border }}
        >
          {comparison.direction === 'increase' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20l8-8h-5V4H9v8H4z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Arc visualization showing angle range
 */
const AngleArc: React.FC<{
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  currentAngle: number;
  quality: AngleComparisonResult['quality'];
  highContrast: boolean;
}> = ({ centerX, centerY, radius, startAngle, endAngle, currentAngle, quality, highContrast }) => {
  const colors = highContrast
    ? QUALITY_COLORS_HIGH_CONTRAST[quality]
    : QUALITY_COLORS[quality];

  // Convert angles to radians for SVG arc
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  const currentRad = (currentAngle - 90) * (Math.PI / 180);

  // Calculate arc points
  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);
  const xCurrent = centerX + radius * Math.cos(currentRad);
  const yCurrent = centerY + radius * Math.sin(currentRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return (
    <g>
      {/* Target range arc */}
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Current angle indicator */}
      <line
        x1={centerX}
        y1={centerY}
        x2={xCurrent}
        y2={yCurrent}
        stroke={colors.border}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Current angle point */}
      <circle
        cx={xCurrent}
        cy={yCurrent}
        r="6"
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth="2"
      />
    </g>
  );
};

/**
 * Summary bar showing overall pose quality
 */
const QualitySummaryBar: React.FC<{
  angles: JointAngle[];
  highContrast: boolean;
  language: 'sv' | 'en';
}> = ({ angles, highContrast, language }) => {
  const summary = useMemo(() => {
    const visibleAngles = angles.filter((a) => a.isVisible);
    if (visibleAngles.length === 0) return null;

    let totalScore = 0;
    visibleAngles.forEach((joint) => {
      const comparison = calculateAngleQuality(
        joint.angle,
        joint.targetMin,
        joint.targetMax,
        joint.optimal
      );

      switch (comparison.quality) {
        case 'excellent':
          totalScore += 100;
          break;
        case 'good':
          totalScore += 75;
          break;
        case 'needs_work':
          totalScore += 40;
          break;
        case 'incorrect':
          totalScore += 10;
          break;
      }
    });

    const avgScore = totalScore / visibleAngles.length;

    let overallQuality: AngleComparisonResult['quality'];
    if (avgScore >= 90) overallQuality = 'excellent';
    else if (avgScore >= 70) overallQuality = 'good';
    else if (avgScore >= 40) overallQuality = 'needs_work';
    else overallQuality = 'incorrect';

    return { avgScore, overallQuality };
  }, [angles]);

  if (!summary) return null;

  const colors = highContrast
    ? QUALITY_COLORS_HIGH_CONTRAST[summary.overallQuality]
    : QUALITY_COLORS[summary.overallQuality];

  const labels = {
    sv: {
      excellent: 'Utmärkt form!',
      good: 'Bra form',
      needs_work: 'Justera positionen',
      incorrect: 'Korrigera formen',
    },
    en: {
      excellent: 'Excellent form!',
      good: 'Good form',
      needs_work: 'Adjust position',
      incorrect: 'Correct form',
    },
  };

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg"
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold" style={{ color: colors.text }}>
          {Math.round(summary.avgScore)}%
        </div>
        <div className="text-sm font-medium" style={{ color: colors.text }}>
          {labels[language][summary.overallQuality]}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PoseAngleOverlay: React.FC<PoseAngleOverlayProps> = ({
  angles,
  width,
  height,
  showAllAngles = false,
  showTargetRanges = true,
  showDeviationArrows = true,
  highContrast = false,
  language = 'sv',
}) => {
  // Calculate comparisons for all angles
  const comparisons = useMemo(() => {
    return angles.map((joint) => ({
      joint,
      comparison: calculateAngleQuality(
        joint.angle,
        joint.targetMin,
        joint.targetMax,
        joint.optimal
      ),
    }));
  }, [angles]);

  // Filter to show only relevant angles (or all if showAllAngles)
  const visibleComparisons = useMemo(() => {
    if (showAllAngles) return comparisons;

    // Only show angles that need attention or are being actively measured
    return comparisons.filter(
      ({ joint, comparison }) =>
        joint.isVisible &&
        (comparison.quality === 'needs_work' ||
          comparison.quality === 'incorrect' ||
          comparison.quality === 'excellent')
    );
  }, [comparisons, showAllAngles]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ width, height }}
    >
      {/* Quality summary bar */}
      <QualitySummaryBar
        angles={angles}
        highContrast={highContrast}
        language={language}
      />

      {/* Individual angle badges */}
      {visibleComparisons.map(({ joint, comparison }) => (
        <AngleBadge
          key={joint.name}
          joint={joint}
          comparison={comparison}
          showTarget={showTargetRanges}
          showArrow={showDeviationArrows}
          highContrast={highContrast}
          language={language}
        />
      ))}

      {/* Connection lines between related joints (optional enhancement) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
      >
        {/* Could add skeleton lines here if needed */}
      </svg>
    </div>
  );
};

export default PoseAngleOverlay;

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/**
 * Get default angle targets for exercise mode
 */
export function getAngleTargetsForExercise(
  exerciseMode: string
): Record<string, { min: number; max: number; optimal: number }> {
  const presets: Record<string, Record<string, { min: number; max: number; optimal: number }>> = {
    LEGS: {
      leftKnee: { min: 70, max: 100, optimal: 85 },
      rightKnee: { min: 70, max: 100, optimal: 85 },
      leftHip: { min: 70, max: 100, optimal: 85 },
      rightHip: { min: 70, max: 100, optimal: 85 },
    },
    LUNGE: {
      leftKnee: { min: 80, max: 100, optimal: 90 },
      rightKnee: { min: 80, max: 100, optimal: 90 },
      leftHip: { min: 80, max: 110, optimal: 95 },
      rightHip: { min: 60, max: 90, optimal: 75 },
    },
    SHOULDER: {
      leftShoulder: { min: 30, max: 180, optimal: 120 },
      rightShoulder: { min: 30, max: 180, optimal: 120 },
      leftElbow: { min: 150, max: 180, optimal: 170 },
      rightElbow: { min: 150, max: 180, optimal: 170 },
    },
    PUSH: {
      leftElbow: { min: 80, max: 120, optimal: 90 },
      rightElbow: { min: 80, max: 120, optimal: 90 },
      spine: { min: 170, max: 180, optimal: 175 },
    },
    CORE: {
      spine: { min: 170, max: 180, optimal: 180 },
      leftHip: { min: 170, max: 180, optimal: 175 },
      rightHip: { min: 170, max: 180, optimal: 175 },
    },
    GENERAL: {
      leftKnee: { min: 60, max: 120, optimal: 90 },
      rightKnee: { min: 60, max: 120, optimal: 90 },
      leftElbow: { min: 60, max: 120, optimal: 90 },
      rightElbow: { min: 60, max: 120, optimal: 90 },
    },
  };

  return presets[exerciseMode] || presets.GENERAL;
}
