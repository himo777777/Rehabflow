/**
 * Exercise Summary Component
 * Shows post-exercise statistics and quality analysis
 */

import React, { useMemo } from 'react';
import { RepScore, FormIssue, FormIssueType } from '../types';
import {
  Trophy,
  Target,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  X,
  Share2,
  RotateCcw,
} from 'lucide-react';

interface ExerciseSummaryProps {
  exerciseName: string;
  repScores: RepScore[];
  totalDuration: number; // seconds
  romAchieved: number; // percentage
  previousBest?: number; // previous best average score
  onClose: () => void;
  onRetry?: () => void;
  onShare?: () => void;
}

// Helper to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreGradient = (score: number): string => {
  if (score >= 85) return 'from-green-500 to-emerald-500';
  if (score >= 70) return 'from-yellow-500 to-amber-500';
  if (score >= 50) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-red-600';
};

// Grade based on score - harmonized with color thresholds (85, 70, 50)
const getGrade = (score: number): { letter: string; label: string } => {
  if (score >= 95) return { letter: 'A+', label: 'Utmärkt!' };
  if (score >= 85) return { letter: 'A', label: 'Mycket bra!' };  // Green threshold
  if (score >= 70) return { letter: 'B', label: 'Bra jobbat!' };  // Yellow threshold
  if (score >= 50) return { letter: 'C', label: 'Godkänt' };      // Orange threshold
  return { letter: 'D', label: 'Fortsätt träna' };                // Red threshold
};

// Get improvement tips based on issues
const getImprovementTips = (issues: FormIssue[]): string[] => {
  const tips: string[] = [];
  const issueTypes = new Set(issues.map(i => i.issue));

  if (issueTypes.has('VALGUS')) {
    tips.push('Fokusera på att pressa ut knäna i linje med tårna');
  }
  if (issueTypes.has('DEPTH')) {
    tips.push('Arbeta med rörlighet för att nå bättre djup');
  }
  if (issueTypes.has('SPEED')) {
    tips.push('Sakta ner tempot för bättre kontroll');
  }
  if (issueTypes.has('ASYMMETRY')) {
    tips.push('Jobba på att jämna ut kraften mellan sidorna');
  }
  if (issueTypes.has('ALIGNMENT')) {
    tips.push('Håll ryggen rak och core aktiverat');
  }
  if (issueTypes.has('COMPENSATION')) {
    tips.push('Undvik att kompensera med andra kroppsdelar - isolera rörelsen');
  }

  if (tips.length === 0) {
    tips.push('Fortsätt med samma teknik!');
  }

  return tips.slice(0, 3);
};

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({
  exerciseName,
  repScores,
  totalDuration,
  romAchieved,
  previousBest,
  onClose,
  onRetry,
  onShare,
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    if (repScores.length === 0) {
      return {
        average: 0,
        best: 0,
        worst: 0,
        perfectReps: 0,
        goodReps: 0,
        poorReps: 0,
        avgRom: 0,
        avgTempo: 0,
        avgSymmetry: 0,
        avgDepth: 0,
        allIssues: [],
        trend: 0,
      };
    }

    const scores = repScores.map(r => r.overall);
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    const worst = Math.min(...scores);

    // Count by quality
    const perfectReps = scores.filter(s => s >= 85).length;
    const goodReps = scores.filter(s => s >= 60 && s < 85).length;
    const poorReps = scores.filter(s => s < 60).length;

    // Average breakdowns
    const avgRom = Math.round(
      repScores.reduce((a, r) => a + r.breakdown.rom, 0) / repScores.length
    );
    const avgTempo = Math.round(
      repScores.reduce((a, r) => a + r.breakdown.tempo, 0) / repScores.length
    );
    const avgSymmetry = Math.round(
      repScores.reduce((a, r) => a + r.breakdown.symmetry, 0) / repScores.length
    );
    const avgDepth = Math.round(
      repScores.reduce((a, r) => a + r.breakdown.depth, 0) / repScores.length
    );

    // All issues
    const allIssues = repScores.flatMap(r => r.issues);

    // Trend (first half vs second half)
    const halfIdx = Math.floor(repScores.length / 2);
    const firstHalf = scores.slice(0, halfIdx);
    const secondHalf = scores.slice(halfIdx);
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    const trend = Math.round(secondAvg - firstAvg);

    return {
      average,
      best,
      worst,
      perfectReps,
      goodReps,
      poorReps,
      avgRom,
      avgTempo,
      avgSymmetry,
      avgDepth,
      allIssues,
      trend,
    };
  }, [repScores]);

  const grade = getGrade(stats.average);
  const tips = getImprovementTips(stats.allIssues);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Is this a new personal best?
  const isNewBest = previousBest !== undefined && stats.average > previousBest;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">{exerciseName}</h2>
            <p className="text-slate-400 text-sm">Sessionssammanfattning</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Score Circle */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeDasharray={`${stats.average * 3.39} 339`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={stats.average >= 85 ? '#22c55e' : stats.average >= 70 ? '#eab308' : '#f97316'} />
                  <stop offset="100%" stopColor={stats.average >= 85 ? '#10b981' : stats.average >= 70 ? '#f59e0b' : '#ef4444'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(stats.average)}`}>
                {grade.letter}
              </span>
              <span className="text-slate-400 text-sm">{stats.average}%</span>
            </div>
          </div>

          <h3 className="text-white font-bold text-xl mb-1">{grade.label}</h3>

          {/* New Best Badge */}
          {isNewBest && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 mb-4">
              <Trophy size={16} />
              <span className="text-sm font-medium">Nytt personbästa!</span>
            </div>
          )}

          {/* Trend indicator */}
          {repScores.length >= 4 && (
            <div className={`flex items-center gap-1 text-sm ${stats.trend > 0 ? 'text-green-400' : stats.trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {stats.trend > 0 ? <TrendingUp size={16} /> : stats.trend < 0 ? <TrendingDown size={16} /> : null}
              <span>
                {stats.trend > 0 ? `+${stats.trend}% under sessionen` : stats.trend < 0 ? `${stats.trend}% under sessionen` : 'Stabilt tempo'}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-white">{repScores.length}</span>
              <p className="text-slate-400 text-xs">Reps</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-green-400">{stats.perfectReps}</span>
              <p className="text-slate-400 text-xs">Perfekta</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-cyan-400">{romAchieved}%</span>
              <p className="text-slate-400 text-xs">ROM</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</span>
              <p className="text-slate-400 text-xs">Tid</p>
            </div>
          </div>

          {/* Quality Breakdown */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
            <h4 className="text-slate-400 text-xs uppercase tracking-wide mb-3">Kvalitetsanalys</h4>
            <div className="space-y-3">
              {[
                { label: 'ROM', value: stats.avgRom, icon: <Target size={14} /> },
                { label: 'Tempo', value: stats.avgTempo, icon: <Zap size={14} /> },
                { label: 'Symmetri', value: stats.avgSymmetry, icon: <Activity size={14} /> },
                { label: 'Djup', value: stats.avgDepth, icon: <BarChart3 size={14} /> },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-slate-400">{item.icon}</span>
                  <span className="text-slate-300 text-sm flex-1">{item.label}</span>
                  <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.value >= 85 ? 'bg-green-500' : item.value >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-10 text-right ${getScoreColor(item.value)}`}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rep Quality Distribution */}
          {repScores.length > 0 && (
            <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
              <h4 className="text-slate-400 text-xs uppercase tracking-wide mb-3">Rep-fördelning</h4>
              <div className="flex items-end gap-1 h-16">
                {repScores.map((score, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                      score.overall >= 85
                        ? 'bg-green-500'
                        : score.overall >= 70
                        ? 'bg-yellow-500'
                        : score.overall >= 50
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ height: `${(score.overall / 100) * 64}px` }}
                    title={`Rep ${idx + 1}: ${score.overall}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Rep 1</span>
                <span>Rep {repScores.length}</span>
              </div>
            </div>
          )}

          {/* Improvement Tips */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
            <h4 className="text-slate-400 text-xs uppercase tracking-wide mb-3">Förbättringstips</h4>
            <ul className="space-y-2">
              {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-800 p-4 border-t border-slate-700/50 flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
            >
              <RotateCcw size={18} />
              Träna igen
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${getScoreGradient(stats.average)} text-white font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            Klar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSummary;
