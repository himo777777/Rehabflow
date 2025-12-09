/**
 * Movement Feedback Overlay Component
 * Enhanced visual feedback for exercise quality scoring
 */

import React, { useMemo } from 'react';
import { RepScore, RepScoreBreakdown, FormIssue, RepPhase } from '../types';
import { Trophy, Target, Activity, Zap, ArrowUp, ArrowDown, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface MovementFeedbackOverlayProps {
  repCount: number;
  currentScore: RepScore | null;
  sessionScores: RepScore[];
  currentPhase: RepPhase | null;
  repProgress: number; // 0-1
  activeIssues: FormIssue[];
  symmetry: number; // 0-100
  romAchieved: number; // percentage
  isCalibrating: boolean;
  calibrationProgress: number; // 0-1
}

// Get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 85) return 'bg-green-500/20 border-green-500/50';
  if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/50';
  if (score >= 50) return 'bg-orange-500/20 border-orange-500/50';
  return 'bg-red-500/20 border-red-500/50';
};

// Phase indicator colors
const getPhaseColor = (phase: RepPhase | null): string => {
  switch (phase) {
    case 'START': return 'bg-slate-500';
    case 'ECCENTRIC': return 'bg-blue-500';
    case 'TURN': return 'bg-purple-500';
    case 'CONCENTRIC': return 'bg-amber-500';
    case 'COMPENSATING': return 'bg-red-500';
    default: return 'bg-slate-600';
  }
};

const getPhaseName = (phase: RepPhase | null): string => {
  switch (phase) {
    case 'START': return 'Redo';
    case 'ECCENTRIC': return 'Nedfas';
    case 'TURN': return 'Vändpunkt';
    case 'CONCENTRIC': return 'Uppfas';
    case 'COMPENSATING': return 'Kompenserar';
    default: return '-';
  }
};

// Score breakdown bar component
const ScoreBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-slate-400 w-4">{icon}</span>
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-400">{label}</span>
        <span className={getScoreColor(value)}>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            value >= 85 ? 'bg-green-500' :
            value >= 70 ? 'bg-yellow-500' :
            value >= 50 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  </div>
);

// FAS 9: Förbättrad IssueBadge med prioriterad styling
// High severity får större och mer prominent visning
const IssueBadge: React.FC<{ issue: FormIssue; isPrimary?: boolean }> = ({ issue, isPrimary = false }) => (
  <div
    className={`flex items-center gap-1.5 rounded-lg font-medium transition-all ${
      issue.severity === 'high'
        ? isPrimary
          ? 'px-4 py-2 text-base bg-red-600 text-white border-2 border-red-400 animate-pulse shadow-lg shadow-red-500/30'
          : 'px-3 py-1.5 text-sm bg-red-500/30 text-red-300 border border-red-500/50'
        : issue.severity === 'medium'
        ? 'px-2 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30'
        : 'px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    }`}
  >
    <AlertCircle size={issue.severity === 'high' && isPrimary ? 18 : 12} />
    <span>{issue.message}</span>
  </div>
);

// FAS 9: Prioritera och filtrera issues
const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
const prioritizeIssues = (issues: FormIssue[]): FormIssue[] => {
  return [...issues]
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 2); // Max 2 issues för att inte överväldiga
};

const MovementFeedbackOverlay: React.FC<MovementFeedbackOverlayProps> = ({
  repCount,
  currentScore,
  sessionScores,
  currentPhase,
  repProgress,
  activeIssues,
  symmetry,
  romAchieved,
  isCalibrating,
  calibrationProgress,
}) => {
  // Calculate session average
  const sessionAverage = useMemo(() => {
    if (sessionScores.length === 0) return 0;
    return Math.round(
      sessionScores.reduce((sum, s) => sum + s.overall, 0) / sessionScores.length
    );
  }, [sessionScores]);

  // Recent trend (last 3 reps)
  const trend = useMemo(() => {
    if (sessionScores.length < 3) return null;
    const recent = sessionScores.slice(-3);
    const older = sessionScores.slice(-6, -3);
    if (older.length === 0) return null;

    const recentAvg = recent.reduce((s, r) => s + r.overall, 0) / recent.length;
    const olderAvg = older.reduce((s, r) => s + r.overall, 0) / older.length;
    const diff = recentAvg - olderAvg;

    return {
      improving: diff > 5,
      declining: diff < -5,
      value: Math.round(diff),
    };
  }, [sessionScores]);

  // Calibration overlay
  if (isCalibrating) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          <h3 className="text-white font-bold text-lg mb-2">Kalibrerar...</h3>
          <p className="text-slate-400 text-sm mb-4">
            Stå stilla med hela kroppen synlig i kameran
          </p>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${calibrationProgress * 100}%` }}
            />
          </div>
          <p className="text-cyan-400 text-sm mt-2 font-medium">
            {Math.round(calibrationProgress * 100)}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Left: Rep Counter & Phase */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Rep Counter */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{repCount}</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Repetitioner</p>
            {sessionAverage > 0 && (
              <p className={`font-bold ${getScoreColor(sessionAverage)}`}>
                Snitt: {sessionAverage}%
              </p>
            )}
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getPhaseColor(currentPhase)} animate-pulse`} />
            <span className="text-white text-sm font-medium">
              {getPhaseName(currentPhase)}
            </span>
          </div>
          {/* Rep Progress Bar */}
          <div className="flex gap-0.5">
            {['START', 'ECCENTRIC', 'TURN', 'CONCENTRIC'].map((phase, idx) => {
              // Clamp to prevent index out of bounds when repProgress = 1.0
              const phaseProgress = Math.min(repProgress * 4, 3.999);
              const isActive = phaseProgress > idx;
              const isCurrent = Math.floor(phaseProgress) === idx;
              return (
                <div
                  key={phase}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    isActive
                      ? isCurrent
                        ? 'bg-cyan-400 animate-pulse'
                        : 'bg-cyan-500'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Right: Score Panel */}
      {currentScore && (
        <div className="absolute top-4 right-4">
          <div
            className={`bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border ${getScoreBgColor(
              currentScore.overall
            )} min-w-[180px]`}
          >
            {/* Overall Score */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">Kvalitet</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(currentScore.overall)}`}>
                  {currentScore.overall}
                </span>
                {trend && (
                  <span
                    className={`flex items-center text-xs ${
                      trend.improving ? 'text-green-400' : trend.declining ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {trend.improving ? <TrendingUp size={12} /> : trend.declining ? <ArrowDown size={12} /> : null}
                    {trend.value > 0 ? '+' : ''}{trend.value}
                  </span>
                )}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-2">
              <ScoreBar
                label="ROM"
                value={currentScore.breakdown.rom}
                icon={<Target size={12} />}
              />
              <ScoreBar
                label="Tempo"
                value={currentScore.breakdown.tempo}
                icon={<Zap size={12} />}
              />
              <ScoreBar
                label="Symmetri"
                value={currentScore.breakdown.symmetry}
                icon={<Activity size={12} />}
              />
              <ScoreBar
                label="Djup"
                value={currentScore.breakdown.depth}
                icon={<ArrowDown size={12} />}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom: Issue Alerts - FAS 9: Förenklad visuell hierarki */}
      {/* Max 2 prioriterade issues, med high severity mest framträdande */}
      {activeIssues.length > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 max-w-md">
          {prioritizeIssues(activeIssues).map((issue, idx) => (
            <IssueBadge
              key={`${issue.joint}-${issue.issue}-${idx}`}
              issue={issue}
              isPrimary={idx === 0 && issue.severity === 'high'}
            />
          ))}
        </div>
      )}

      {/* Bottom Left: ROM & Symmetry Gauges */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {/* ROM Gauge */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-cyan-400" />
            <span className="text-slate-400 text-xs">ROM</span>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={romAchieved >= 90 ? '#22c55e' : romAchieved >= 70 ? '#eab308' : '#f97316'}
                strokeWidth="4"
                strokeDasharray={`${romAchieved * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              {romAchieved}%
            </span>
          </div>
        </div>

        {/* Symmetry Gauge */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-purple-400" />
            <span className="text-slate-400 text-xs">Symmetri</span>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={symmetry >= 85 ? '#22c55e' : symmetry >= 70 ? '#eab308' : '#f97316'}
                strokeWidth="4"
                strokeDasharray={`${symmetry * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              {symmetry}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Session Stats */}
      {sessionScores.length >= 3 && (
        <div className="absolute bottom-4 right-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-slate-400 text-xs">Session</span>
            </div>
            <div className="flex gap-1">
              {sessionScores.slice(-10).map((score, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-t transition-all ${
                    score.overall >= 85
                      ? 'bg-green-500'
                      : score.overall >= 70
                      ? 'bg-yellow-500'
                      : score.overall >= 50
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ height: `${(score.overall / 100) * 32}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Center: Large feedback text (for perfect reps) */}
      {currentScore && currentScore.overall >= 95 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle size={24} />
              <span className="text-xl font-bold">PERFEKT!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementFeedbackOverlay;

/**
 * Mini Rep Score Card - For showing after each rep
 */
export const RepScoreCard: React.FC<{
  score: RepScore;
  repNumber: number;
  onDismiss?: () => void;
}> = ({ score, repNumber, onDismiss }) => (
  <div
    className={`animate-in slide-in-from-right duration-300 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border ${getScoreBgColor(
      score.overall
    )} shadow-xl max-w-xs`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-sm">Rep #{repNumber}</span>
      <span className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
        {score.overall}%
      </span>
    </div>

    <div className="grid grid-cols-5 gap-1 mb-2">
      {Object.entries(score.breakdown).map(([key, value]) => (
        <div key={key} className="text-center">
          <div
            className={`h-8 rounded ${
              value >= 85 ? 'bg-green-500' : value >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ height: `${(value / 100) * 32}px` }}
          />
          <span className="text-[10px] text-slate-500 uppercase">{key.slice(0, 3)}</span>
        </div>
      ))}
    </div>

    {score.issues.length > 0 && (
      <div className="text-xs text-orange-400 flex items-center gap-1">
        <AlertCircle size={12} />
        {score.issues[0].message}
      </div>
    )}
  </div>
);
