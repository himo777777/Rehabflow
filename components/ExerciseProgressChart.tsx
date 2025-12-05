/**
 * Exercise Progress Chart
 *
 * Visualiserar övningsprogress över tid:
 * - Sets/reps utveckling
 * - Svårighetsgrad trend
 * - Smärta före/efter
 * - Jämförelse mellan övningar
 */

import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ExerciseLog } from '../types';

interface ExerciseProgressChartProps {
  /** Filter to specific exercise name */
  exerciseName?: string;
  /** Number of weeks to show */
  weeks?: number;
  /** Compact mode */
  compact?: boolean;
}

interface ExerciseStats {
  exerciseName: string;
  totalSessions: number;
  avgSets: number;
  avgReps: number;
  avgPainDuring: number;
  avgPainAfter: number;
  difficultyTrend: 'easier' | 'harder' | 'stable';
  progressTrend: 'improving' | 'declining' | 'stable';
  completionRate: number;
  lastSession: string;
}

interface DataPoint {
  date: string;
  sets: number;
  reps: number;
  painDuring: number;
  painAfter: number;
  difficulty: string;
}

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({
  exerciseName,
  weeks = 4,
  compact = false
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(exerciseName || null);
  const [showDetails, setShowDetails] = useState(false);

  // Get all exercise logs
  const exerciseHistory = useMemo(() => storageService.getDetailedExerciseHistory(), []);

  // Get all unique exercise names
  const allExercises = useMemo(() => {
    const names = new Set<string>();
    Object.values(exerciseHistory).forEach(logs => {
      logs.forEach(log => names.add(log.exerciseName));
    });
    return Array.from(names).sort();
  }, [exerciseHistory]);

  // Calculate stats for each exercise
  const exerciseStats = useMemo((): ExerciseStats[] => {
    const stats: Record<string, {
      sessions: ExerciseLog[];
      totalSets: number;
      totalReps: number;
      totalPainDuring: number;
      totalPainAfter: number;
      difficultyScores: number[];
      completed: number;
      total: number;
    }> = {};

    // Process all logs
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

    Object.entries(exerciseHistory).forEach(([date, logs]) => {
      if (new Date(date) < cutoffDate) return;

      logs.forEach(log => {
        if (!stats[log.exerciseName]) {
          stats[log.exerciseName] = {
            sessions: [],
            totalSets: 0,
            totalReps: 0,
            totalPainDuring: 0,
            totalPainAfter: 0,
            difficultyScores: [],
            completed: 0,
            total: 0
          };
        }

        const s = stats[log.exerciseName];
        s.sessions.push(log);
        s.totalSets += log.actualSets || 0;

        // Parse reps (could be "10" or "10-12")
        const reps = log.actualReps ? parseInt(log.actualReps.split('-')[0]) : 0;
        s.totalReps += reps;

        s.totalPainDuring += log.painDuring || 0;
        s.totalPainAfter += log.painAfter || 0;

        // Convert difficulty to score
        const diffScore = log.difficulty === 'för_lätt' ? 1 : log.difficulty === 'lagom' ? 2 : 3;
        s.difficultyScores.push(diffScore);

        s.total++;
        if (log.completed) s.completed++;
      });
    });

    // Convert to stats array
    return Object.entries(stats).map(([name, data]): ExerciseStats => {
      const sessionCount = data.sessions.length;
      const avgSets = sessionCount > 0 ? data.totalSets / sessionCount : 0;
      const avgReps = sessionCount > 0 ? data.totalReps / sessionCount : 0;

      // Calculate difficulty trend (first half vs second half)
      const midPoint = Math.floor(data.difficultyScores.length / 2);
      const firstHalf = data.difficultyScores.slice(0, midPoint);
      const secondHalf = data.difficultyScores.slice(midPoint);

      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 2;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 2;

      let difficultyTrend: 'easier' | 'harder' | 'stable' = 'stable';
      if (secondAvg - firstAvg < -0.3) difficultyTrend = 'easier';
      else if (secondAvg - firstAvg > 0.3) difficultyTrend = 'harder';

      // Calculate progress trend (based on sets * reps)
      const firstSessions = data.sessions.slice(0, midPoint);
      const lastSessions = data.sessions.slice(midPoint);

      const firstVolume = firstSessions.reduce((sum, s) => {
        const reps = s.actualReps ? parseInt(s.actualReps.split('-')[0]) : 0;
        return sum + (s.actualSets || 0) * reps;
      }, 0) / (firstSessions.length || 1);

      const lastVolume = lastSessions.reduce((sum, s) => {
        const reps = s.actualReps ? parseInt(s.actualReps.split('-')[0]) : 0;
        return sum + (s.actualSets || 0) * reps;
      }, 0) / (lastSessions.length || 1);

      let progressTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (firstVolume > 0) {
        const change = ((lastVolume - firstVolume) / firstVolume) * 100;
        if (change > 15) progressTrend = 'improving';
        else if (change < -15) progressTrend = 'declining';
      }

      // Find last session date
      const sortedSessions = data.sessions.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        exerciseName: name,
        totalSessions: sessionCount,
        avgSets: Math.round(avgSets * 10) / 10,
        avgReps: Math.round(avgReps),
        avgPainDuring: sessionCount > 0 ? Math.round((data.totalPainDuring / sessionCount) * 10) / 10 : 0,
        avgPainAfter: sessionCount > 0 ? Math.round((data.totalPainAfter / sessionCount) * 10) / 10 : 0,
        difficultyTrend,
        progressTrend,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        lastSession: sortedSessions[0]?.date || ''
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions);
  }, [exerciseHistory, weeks]);

  // Get detailed data points for selected exercise
  const selectedExerciseData = useMemo((): DataPoint[] => {
    if (!selectedExercise) return [];

    const dataPoints: DataPoint[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));

    Object.entries(exerciseHistory).forEach(([date, logs]) => {
      if (new Date(date) < cutoffDate) return;

      logs
        .filter(log => log.exerciseName === selectedExercise)
        .forEach(log => {
          const reps = log.actualReps ? parseInt(log.actualReps.split('-')[0]) : 0;
          dataPoints.push({
            date: log.date,
            sets: log.actualSets || 0,
            reps,
            painDuring: log.painDuring || 0,
            painAfter: log.painAfter || 0,
            difficulty: log.difficulty
          });
        });
    });

    return dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exerciseHistory, selectedExercise, weeks]);

  // Get trend icon
  const getTrendIcon = (trend: string, type: 'progress' | 'difficulty') => {
    if (type === 'progress') {
      if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
      if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
      return <Minus className="w-4 h-4 text-slate-400" />;
    } else {
      if (trend === 'easier') return <TrendingDown className="w-4 h-4 text-green-500" />;
      if (trend === 'harder') return <TrendingUp className="w-4 h-4 text-amber-500" />;
      return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  // Progress bar
  const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({
    value,
    max,
    color = 'bg-primary-500'
  }) => (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  // Mini spark line
  const SparkLine: React.FC<{ data: number[]; height?: number }> = ({ data, height = 24 }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const width = 80;
    const step = width / (data.length - 1);

    const points = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="text-primary-500">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  if (allExercises.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Övningsprogress</h3>
            <p className="text-sm text-slate-500">Följ din utveckling</p>
          </div>
        </div>
        <div className="text-center py-8 text-slate-500">
          <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Ingen övningsdata ännu</p>
          <p className="text-sm mt-1">Logga dina övningar för att se progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Övningsprogress</h3>
            <p className="text-sm text-slate-500">{exerciseStats.length} övningar, {weeks} veckor</p>
          </div>
        </div>

        {/* Exercise selector */}
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value || null)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">Alla övningar</option>
          {allExercises.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Selected exercise detail view */}
      {selectedExercise && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-indigo-900">{selectedExercise}</h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-indigo-600 flex items-center gap-1"
            >
              {showDetails ? 'Dölj detaljer' : 'Visa detaljer'}
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Spark line visualization */}
          {selectedExerciseData.length > 1 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Volym (sets × reps)</div>
                <SparkLine
                  data={selectedExerciseData.map(d => d.sets * d.reps)}
                  height={32}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 mb-1">Smärta</div>
                <SparkLine
                  data={selectedExerciseData.map(d => d.painAfter)}
                  height={32}
                />
              </div>
            </div>
          )}

          {/* Detailed session list */}
          {showDetails && selectedExerciseData.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {selectedExerciseData.slice().reverse().map((dp, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg text-sm"
                >
                  <div className="w-20 text-slate-500">
                    {new Date(dp.date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">{dp.sets}×{dp.reps}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      dp.difficulty === 'för_lätt' ? 'bg-green-100 text-green-700' :
                        dp.difficulty === 'lagom' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                    }`}>
                      {dp.difficulty === 'för_lätt' ? 'Lätt' :
                        dp.difficulty === 'lagom' ? 'Lagom' : 'Svår'}
                    </span>
                  </div>
                  {dp.painAfter > 0 && (
                    <div className={`text-xs ${
                      dp.painAfter <= 3 ? 'text-green-600' :
                        dp.painAfter <= 6 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      Smärta: {dp.painAfter}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-3">
        {(selectedExercise
          ? exerciseStats.filter(e => e.exerciseName === selectedExercise)
          : exerciseStats.slice(0, 5)
        ).map((stat) => (
          <div
            key={stat.exerciseName}
            className="p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setSelectedExercise(
              selectedExercise === stat.exerciseName ? null : stat.exerciseName
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-slate-800">{stat.exerciseName}</div>
              <div className="flex items-center gap-2">
                {getTrendIcon(stat.progressTrend, 'progress')}
                <span className="text-xs text-slate-500">{stat.totalSessions} pass</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-slate-700">{stat.avgSets}</div>
                <div className="text-xs text-slate-500">Snitt sets</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-700">{stat.avgReps}</div>
                <div className="text-xs text-slate-500">Snitt reps</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  stat.avgPainAfter <= 3 ? 'text-green-600' :
                    stat.avgPainAfter <= 6 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {stat.avgPainAfter}
                </div>
                <div className="text-xs text-slate-500">Smärta</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  {stat.completionRate >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : stat.completionRate >= 50 ? (
                    <Target className="w-4 h-4 text-amber-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-lg font-bold text-slate-700">{stat.completionRate}%</span>
                </div>
                <div className="text-xs text-slate-500">Genomfört</div>
              </div>
            </div>

            {/* Completion progress bar */}
            <div className="mt-3">
              <ProgressBar
                value={stat.completionRate}
                max={100}
                color={
                  stat.completionRate >= 80 ? 'bg-green-500' :
                    stat.completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      {!selectedExercise && exerciseStats.length > 5 && (
        <button
          onClick={() => setSelectedExercise(exerciseStats[0]?.exerciseName || null)}
          className="w-full mt-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Visa alla {exerciseStats.length} övningar
        </button>
      )}
    </div>
  );
};

export default ExerciseProgressChart;
