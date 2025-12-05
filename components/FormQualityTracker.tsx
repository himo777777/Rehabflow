/**
 * Form Quality Tracker
 *
 * Kopplar MovementSession.repScores[] till ExerciseLog.
 * Visualiserar form quality trend över tid.
 */

import React, { useMemo, useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { MovementSession, FormIssue } from '../types';

interface FormQualityTrackerProps {
  /** Filter to specific exercise */
  exerciseName?: string;
  /** Number of weeks to analyze */
  weeks?: number;
  /** Compact mode */
  compact?: boolean;
}

interface QualityDataPoint {
  date: string;
  averageScore: number;
  repsCompleted: number;
  formIssues: FormIssue[];
}

interface ExerciseQualityStats {
  exerciseName: string;
  totalSessions: number;
  avgScore: number;
  trend: 'improving' | 'stable' | 'declining';
  trendPercent: number;
  commonIssues: { issue: string; count: number }[];
  bestScore: number;
  worstScore: number;
  dataPoints: QualityDataPoint[];
}

const FormQualityTracker: React.FC<FormQualityTrackerProps> = ({
  exerciseName,
  weeks = 4,
  compact = false
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(exerciseName || null);
  const [showDetails, setShowDetails] = useState(false);

  // Get movement sessions
  const sessions = useMemo(() => {
    return storageService.getMovementSessions();
  }, []);

  // Get unique exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => names.add(s.exerciseName));
    return Array.from(names).sort();
  }, [sessions]);

  // Calculate quality stats for each exercise
  const exerciseStats = useMemo((): ExerciseQualityStats[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

    // Group sessions by exercise
    const byExercise: Record<string, MovementSession[]> = {};
    sessions.forEach(session => {
      if (new Date(session.sessionDate) < cutoffDate) return;

      if (!byExercise[session.exerciseName]) {
        byExercise[session.exerciseName] = [];
      }
      byExercise[session.exerciseName].push(session);
    });

    // Calculate stats for each exercise
    return Object.entries(byExercise).map(([name, exerciseSessions]): ExerciseQualityStats => {
      // Sort by date
      const sorted = exerciseSessions.sort(
        (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
      );

      // Calculate average score
      const totalScore = sorted.reduce((sum, s) => sum + s.averageScore, 0);
      const avgScore = sorted.length > 0 ? Math.round(totalScore / sorted.length) : 0;

      // Find best/worst
      const scores = sorted.map(s => s.averageScore);
      const bestScore = Math.max(...scores, 0);
      const worstScore = Math.min(...scores, 100);

      // Calculate trend (first half vs second half)
      const midPoint = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, midPoint);
      const secondHalf = sorted.slice(midPoint);

      const firstAvg = firstHalf.length > 0
        ? firstHalf.reduce((sum, s) => sum + s.averageScore, 0) / firstHalf.length
        : avgScore;
      const secondAvg = secondHalf.length > 0
        ? secondHalf.reduce((sum, s) => sum + s.averageScore, 0) / secondHalf.length
        : avgScore;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      const trendPercent = firstAvg > 0
        ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
        : 0;

      if (trendPercent > 5) trend = 'improving';
      else if (trendPercent < -5) trend = 'declining';

      // Collect common form issues
      const issueCounts: Record<string, number> = {};
      sorted.forEach(s => {
        s.formIssues?.forEach(issue => {
          const issueKey = issue.message || issue.issue;
          issueCounts[issueKey] = (issueCounts[issueKey] || 0) + 1;
        });
      });

      const commonIssues = Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([issue, count]) => ({ issue, count }));

      // Create data points
      const dataPoints = sorted.map(s => ({
        date: s.sessionDate.split('T')[0],
        averageScore: s.averageScore,
        repsCompleted: s.repsCompleted,
        formIssues: s.formIssues || []
      }));

      return {
        exerciseName: name,
        totalSessions: sorted.length,
        avgScore,
        trend,
        trendPercent: Math.abs(trendPercent),
        commonIssues,
        bestScore,
        worstScore,
        dataPoints
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions);
  }, [sessions, weeks]);

  // Get selected exercise data
  const selectedData = useMemo(() => {
    if (!selectedExercise) return null;
    return exerciseStats.find(e => e.exerciseName === selectedExercise) || null;
  }, [exerciseStats, selectedExercise]);

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Trend icon
  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  // Simple bar chart
  const MiniChart: React.FC<{ dataPoints: QualityDataPoint[] }> = ({ dataPoints }) => {
    if (dataPoints.length === 0) return null;

    const maxScore = 100;
    const barWidth = 100 / Math.max(dataPoints.length, 1);

    return (
      <div className="h-16 flex items-end gap-0.5">
        {dataPoints.slice(-10).map((dp, idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-t transition-all ${
              dp.averageScore >= 80 ? 'bg-green-400' :
                dp.averageScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ height: `${(dp.averageScore / maxScore) * 100}%` }}
            title={`${dp.date}: ${dp.averageScore}%`}
          />
        ))}
      </div>
    );
  };

  if (sessions.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Activity className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Rörelsekvalitet</h3>
            <p className="text-sm text-slate-500">Spåra din teknikkvalitet</p>
          </div>
        </div>
        <div className="text-center py-8 text-slate-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Ingen rörelsedata ännu</p>
          <p className="text-sm mt-1">Använd rörelseanalys för att spåra din teknik</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Activity className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Rörelsekvalitet</h3>
            <p className="text-sm text-slate-500">
              {exerciseStats.length} övningar, {sessions.length} sessioner
            </p>
          </div>
        </div>

        {/* Exercise selector */}
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value || null)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">Alla övningar</option>
          {exerciseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Selected exercise detail */}
      {selectedData && (
        <div className="mb-6 p-4 bg-violet-50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-violet-900">{selectedData.exerciseName}</h4>
            <div className="flex items-center gap-2">
              {getTrendIcon(selectedData.trend)}
              <span className={`text-sm font-medium ${
                selectedData.trend === 'improving' ? 'text-green-600' :
                  selectedData.trend === 'declining' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {selectedData.trend === 'improving' && `+${selectedData.trendPercent}%`}
                {selectedData.trend === 'declining' && `-${selectedData.trendPercent}%`}
                {selectedData.trend === 'stable' && 'Stabil'}
              </span>
            </div>
          </div>

          {/* Mini chart */}
          <div className="bg-white rounded-lg p-3 mb-4">
            <MiniChart dataPoints={selectedData.dataPoints} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className={`text-xl font-bold ${getScoreColor(selectedData.avgScore)}`}>
                {selectedData.avgScore}%
              </div>
              <div className="text-xs text-slate-500">Genomsnitt</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{selectedData.bestScore}%</div>
              <div className="text-xs text-slate-500">Bästa</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="text-xl font-bold text-slate-600">{selectedData.totalSessions}</div>
              <div className="text-xs text-slate-500">Sessioner</div>
            </div>
          </div>

          {/* Common issues */}
          {selectedData.commonIssues.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-500 mb-2">Vanliga förbättringsområden:</div>
              <div className="flex flex-wrap gap-2">
                {selectedData.commonIssues.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg"
                  >
                    {item.issue} ({item.count}x)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Session history toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Dölj' : 'Visa'} sessionshistorik
          </button>

          {showDetails && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
              {selectedData.dataPoints.slice().reverse().map((dp, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg text-sm"
                >
                  <div className="w-20 text-slate-500">
                    {new Date(dp.date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className={`w-16 text-center font-bold rounded px-2 py-0.5 ${getScoreBg(dp.averageScore)} ${getScoreColor(dp.averageScore)}`}>
                    {dp.averageScore}%
                  </div>
                  <div className="flex-1 text-slate-600">
                    {dp.repsCompleted} reps
                  </div>
                  {dp.formIssues.length > 0 && (
                    <span title={dp.formIssues.map(i => i.message || i.issue).join(', ')}>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exercise list (when none selected) */}
      {!selectedExercise && (
        <div className="space-y-3">
          {exerciseStats.slice(0, 5).map((stat) => (
            <div
              key={stat.exerciseName}
              onClick={() => setSelectedExercise(stat.exerciseName)}
              className="p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-slate-800">{stat.exerciseName}</div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(stat.trend)}
                  <span className={`text-lg font-bold ${getScoreColor(stat.avgScore)}`}>
                    {stat.avgScore}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{stat.totalSessions} sessioner</span>
                <span>Bästa: {stat.bestScore}%</span>
                {stat.commonIssues.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-3 h-3" />
                    {stat.commonIssues.length} förbättringsområden
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    stat.avgScore >= 80 ? 'bg-green-400' :
                      stat.avgScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${stat.avgScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info footer */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Kvalitetspoäng baseras på rörelseanalys under övningar. Högre poäng indikerar bättre teknik.
        </p>
      </div>
    </div>
  );
};

export default FormQualityTracker;
