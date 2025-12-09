/**
 * RealTimeFeedback - Sprint 5: Real-time Exercise Feedback Component
 *
 * Provides:
 * - Position progress indicator
 * - Tempo feedback (perfect/too fast/too slow)
 * - Form check indicators
 * - Encouragement messages
 * - Phase transition announcements
 */

import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useSync,
  usePhase,
  useTempo,
  useExerciseProgress,
  useSpeech,
} from '../hooks/useSync';
import type { PhaseType } from '../services/eventBus';

// ============================================================================
// TYPES
// ============================================================================

export type TempoStatus = 'perfect' | 'too_fast' | 'too_slow' | 'unknown';

export interface FormIssue {
  id: string;
  bodyPart: string;
  issue: string;
  severity: 'warning' | 'error' | 'info';
  suggestion: string;
}

export interface RealTimeFeedbackProps {
  /** Current exercise position as percentage (0-100) */
  positionPercent?: number;
  /** Target tempo (1.0 = normal) */
  targetTempo?: number;
  /** Actual tempo from user movement */
  actualTempo?: number;
  /** Form issues detected */
  formIssues?: FormIssue[];
  /** Show compact mode */
  compact?: boolean;
  /** Position in viewport */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom className */
  className?: string;
}

// ============================================================================
// PHASE DESCRIPTIONS (Swedish)
// ============================================================================

const PHASE_DESCRIPTIONS: Record<PhaseType, { name: string; description: string; color: string }> = {
  eccentric: {
    name: 'Sänkning',
    description: 'Kontrollera nedfasen',
    color: '#3B82F6', // Blue
  },
  concentric: {
    name: 'Lyftning',
    description: 'Pressa uppåt med kraft',
    color: '#10B981', // Green
  },
  isometric: {
    name: 'Håll',
    description: 'Håll positionen',
    color: '#F59E0B', // Yellow
  },
  hold: {
    name: 'Vila',
    description: 'Pausa och andas',
    color: '#6B7280', // Gray
  },
  rest: {
    name: 'Vila',
    description: 'Återhämtning',
    color: '#6B7280', // Gray
  },
  transition: {
    name: 'Övergång',
    description: 'Byt position',
    color: '#8B5CF6', // Purple
  },
};

// ============================================================================
// TEMPO FEEDBACK (Swedish)
// ============================================================================

const TEMPO_FEEDBACK: Record<TempoStatus, { text: string; icon: string; color: string }> = {
  perfect: {
    text: 'Perfekt tempo!',
    icon: '✓',
    color: '#10B981',
  },
  too_fast: {
    text: 'Sakta ner lite',
    icon: '⚡',
    color: '#F59E0B',
  },
  too_slow: {
    text: 'Lite snabbare',
    icon: '🐢',
    color: '#3B82F6',
  },
  unknown: {
    text: '',
    icon: '',
    color: '#6B7280',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate tempo status based on target vs actual
 */
function calculateTempoStatus(
  target: number,
  actual: number,
  threshold: number = 0.15
): TempoStatus {
  const diff = actual - target;
  if (Math.abs(diff) <= threshold) return 'perfect';
  if (diff > threshold) return 'too_fast';
  if (diff < -threshold) return 'too_slow';
  return 'unknown';
}

/**
 * Get encouragement message based on progress
 */
function getEncouragementMessage(
  progress: { currentRep: number; totalReps: number; currentSet: number; totalSets: number }
): string | null {
  const { currentRep, totalReps, currentSet, totalSets } = progress;

  // First rep
  if (currentRep === 1 && currentSet === 1) {
    return 'Bra start! Låt oss börja.';
  }

  // Last rep of set
  if (currentRep === totalReps) {
    if (currentSet === totalSets) {
      return 'Sista! Du klarar det!';
    }
    return 'Sista repen i setet!';
  }

  // Halfway through set
  if (currentRep === Math.ceil(totalReps / 2)) {
    return 'Halvvägs! Fortsätt så!';
  }

  // Random encouragement (10% chance)
  if (Math.random() < 0.1) {
    const messages = ['Bra jobbat!', 'Fortsätt så!', 'Stark!', 'Du gör det bra!'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  return null;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = '#3B82F6',
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-xl font-bold">{Math.round(progress)}%</span>
        {label && <span className="text-xs opacity-70">{label}</span>}
      </div>
    </div>
  );
};

interface FormIssueIndicatorProps {
  issue: FormIssue;
  onDismiss?: () => void;
}

const FormIssueIndicator: React.FC<FormIssueIndicatorProps> = ({ issue, onDismiss }) => {
  const severityColors = {
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-100',
    error: 'bg-red-500/20 border-red-500 text-red-100',
    info: 'bg-blue-500/20 border-blue-500 text-blue-100',
  };

  const severityIcons = {
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 rounded-lg border ${severityColors[issue.severity]} backdrop-blur-sm`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{severityIcons[issue.severity]}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{issue.bodyPart}</div>
          <div className="text-xs opacity-80">{issue.issue}</div>
          <div className="text-xs mt-1 opacity-60">{issue.suggestion}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RealTimeFeedback: React.FC<RealTimeFeedbackProps> = ({
  positionPercent = 0,
  targetTempo = 1.0,
  actualTempo,
  formIssues = [],
  compact = false,
  position = 'top-right',
  className = '',
}) => {
  // Use sync hooks for real-time data
  const phase = usePhase();
  const globalTempo = useTempo();
  const progress = useExerciseProgress();
  const speech = useSpeech();

  // Calculate tempo status
  const tempoStatus = useMemo(() => {
    if (actualTempo === undefined) return 'unknown';
    return calculateTempoStatus(targetTempo, actualTempo);
  }, [targetTempo, actualTempo]);

  // Get encouragement message
  const encouragement = useMemo(() => {
    return getEncouragementMessage(progress);
  }, [progress]);

  // Get phase info
  const phaseInfo = useMemo(() => {
    if (!phase) return null;
    return PHASE_DESCRIPTIONS[phase.type] || PHASE_DESCRIPTIONS.transition;
  }, [phase]);

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Compact mode renders minimal UI
  if (compact) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
        <div className="bg-black/60 backdrop-blur-md rounded-full p-2 flex items-center gap-2">
          <ProgressCircle progress={positionPercent} size={40} strokeWidth={3} />
          {tempoStatus !== 'unknown' && (
            <span
              className="text-sm font-medium px-2"
              style={{ color: TEMPO_FEEDBACK[tempoStatus].color }}
            >
              {TEMPO_FEEDBACK[tempoStatus].icon}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-2xl min-w-[200px] max-w-[280px]"
      >
        {/* Header with phase info */}
        {phaseInfo && (
          <div className="mb-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: phaseInfo.color }}
              />
              <span className="text-white font-semibold">{phaseInfo.name}</span>
            </div>
            <p className="text-white/60 text-sm mt-1">{phaseInfo.description}</p>
          </div>
        )}

        {/* Progress section */}
        <div className="flex items-center gap-4 mb-3">
          <ProgressCircle
            progress={positionPercent}
            color={phaseInfo?.color || '#3B82F6'}
            label="position"
          />
          <div className="flex-1">
            {/* Rep/Set progress */}
            <div className="text-white text-sm">
              <span className="font-bold">{progress.currentRep}</span>
              <span className="opacity-60">/{progress.totalReps} rep</span>
            </div>
            <div className="text-white/60 text-xs">
              Set {progress.currentSet}/{progress.totalSets}
            </div>
            {/* Tempo indicator */}
            <div className="text-white/60 text-xs mt-1">
              Tempo: {(actualTempo ?? globalTempo).toFixed(1)}x
            </div>
          </div>
        </div>

        {/* Tempo feedback */}
        <AnimatePresence mode="wait">
          {tempoStatus !== 'unknown' && (
            <motion.div
              key={tempoStatus}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 py-2 px-3 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: `${TEMPO_FEEDBACK[tempoStatus].color}20` }}
            >
              <span>{TEMPO_FEEDBACK[tempoStatus].icon}</span>
              <span style={{ color: TEMPO_FEEDBACK[tempoStatus].color }}>
                {TEMPO_FEEDBACK[tempoStatus].text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form issues */}
        <AnimatePresence>
          {formIssues.length > 0 && (
            <div className="space-y-2 mb-3">
              {formIssues.slice(0, 2).map((issue) => (
                <FormIssueIndicator key={issue.id} issue={issue} />
              ))}
              {formIssues.length > 2 && (
                <div className="text-white/50 text-xs text-center">
                  +{formIssues.length - 2} fler problem
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Encouragement message */}
        <AnimatePresence>
          {encouragement && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-2 px-3 bg-green-500/20 rounded-lg text-green-300 text-sm font-medium"
            >
              {encouragement}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speaking indicator */}
        {speech.isSpeaking && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="truncate">{speech.currentPhrase}</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================================
// FLOATING FEEDBACK BAR (Alternative compact view)
// ============================================================================

interface FloatingFeedbackBarProps {
  positionPercent: number;
  currentRep: number;
  totalReps: number;
  phaseName: string;
  phaseColor?: string;
}

export const FloatingFeedbackBar: React.FC<FloatingFeedbackBarProps> = ({
  positionPercent,
  currentRep,
  totalReps,
  phaseName,
  phaseColor = '#3B82F6',
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl flex items-center gap-6"
      >
        {/* Phase indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: phaseColor }}
          />
          <span className="text-white text-sm font-medium">{phaseName}</span>
        </div>

        {/* Progress bar */}
        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: phaseColor }}
            animate={{ width: `${positionPercent}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Rep counter */}
        <div className="text-white text-sm">
          <span className="font-bold">{currentRep}</span>
          <span className="opacity-60">/{totalReps}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeFeedback;
