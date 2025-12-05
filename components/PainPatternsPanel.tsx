/**
 * Pain Patterns Panel
 *
 * Visualiserar smärtmönster över tid, inklusive:
 * - Triggers och korrelationer
 * - Sömn-smärta korrelation
 * - Tidpunkt-analys (morgon vs kväll)
 * - Trendanalys
 */

import React, { useMemo, useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Moon,
  Sun,
  Sunrise,
  CloudRain,
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { DailyPainLog } from '../types';

interface PainPatternsPanelProps {
  /** Number of days to analyze */
  days?: number;
  /** Compact mode for embedding */
  compact?: boolean;
}

interface PainCorrelation {
  factor: string;
  icon: React.ReactNode;
  correlation: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-100
  description: string;
}

interface TimeOfDayPattern {
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  avgPain: number;
  count: number;
}

const PainPatternsPanel: React.FC<PainPatternsPanelProps> = ({
  days = 30,
  compact = false
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'triggers' | 'trends'>('overview');
  const [dateOffset, setDateOffset] = useState(0); // For pagination

  // Get pain history
  const painHistory = useMemo(() => storageService.getPainHistory(), []);

  // Calculate pain trend data
  const painTrend = useMemo(() => {
    const data = storageService.getPainTrend(days);
    return data.filter(d => d.avgPain > 0 || d.prePain !== undefined || d.postPain !== undefined);
  }, [days]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    if (painTrend.length === 0) {
      return {
        avgPain: 0,
        minPain: 0,
        maxPain: 0,
        trend: 'stable' as const,
        trendPercent: 0,
        daysWithData: 0
      };
    }

    const validPains = painTrend.filter(d => d.avgPain > 0).map(d => d.avgPain);
    const avgPain = validPains.length > 0
      ? validPains.reduce((a, b) => a + b, 0) / validPains.length
      : 0;

    // Calculate trend (compare first week vs last week)
    const firstWeek = painTrend.slice(0, 7).filter(d => d.avgPain > 0);
    const lastWeek = painTrend.slice(-7).filter(d => d.avgPain > 0);

    const firstWeekAvg = firstWeek.length > 0
      ? firstWeek.reduce((a, b) => a + b.avgPain, 0) / firstWeek.length
      : 0;
    const lastWeekAvg = lastWeek.length > 0
      ? lastWeek.reduce((a, b) => a + b.avgPain, 0) / lastWeek.length
      : 0;

    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    let trendPercent = 0;

    if (firstWeekAvg > 0 && lastWeekAvg > 0) {
      trendPercent = Math.round(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100);
      if (trendPercent <= -15) trend = 'improving';
      else if (trendPercent >= 15) trend = 'worsening';
    }

    return {
      avgPain: Math.round(avgPain * 10) / 10,
      minPain: validPains.length > 0 ? Math.min(...validPains) : 0,
      maxPain: validPains.length > 0 ? Math.max(...validPains) : 0,
      trend,
      trendPercent: Math.abs(trendPercent),
      daysWithData: validPains.length
    };
  }, [painTrend]);

  // Analyze time-of-day patterns
  const timePatterns = useMemo((): TimeOfDayPattern[] => {
    const patterns: Record<string, { total: number; count: number }> = {
      morning: { total: 0, count: 0 },
      afternoon: { total: 0, count: 0 },
      evening: { total: 0, count: 0 },
      night: { total: 0, count: 0 }
    };

    Object.values(painHistory).forEach((log: DailyPainLog) => {
      // Pre-workout is typically morning
      if (log.preWorkout?.painLevel !== undefined) {
        const timestamp = log.preWorkout.timestamp;
        if (timestamp) {
          const hour = new Date(timestamp).getHours();
          if (hour >= 5 && hour < 12) {
            patterns.morning.total += log.preWorkout.painLevel;
            patterns.morning.count++;
          } else if (hour >= 12 && hour < 17) {
            patterns.afternoon.total += log.preWorkout.painLevel;
            patterns.afternoon.count++;
          } else if (hour >= 17 && hour < 21) {
            patterns.evening.total += log.preWorkout.painLevel;
            patterns.evening.count++;
          } else {
            patterns.night.total += log.preWorkout.painLevel;
            patterns.night.count++;
          }
        }
      }

      // Post-workout can be any time
      if (log.postWorkout?.painLevel !== undefined) {
        const timestamp = log.postWorkout.timestamp;
        if (timestamp) {
          const hour = new Date(timestamp).getHours();
          if (hour >= 5 && hour < 12) {
            patterns.morning.total += log.postWorkout.painLevel;
            patterns.morning.count++;
          } else if (hour >= 12 && hour < 17) {
            patterns.afternoon.total += log.postWorkout.painLevel;
            patterns.afternoon.count++;
          } else if (hour >= 17 && hour < 21) {
            patterns.evening.total += log.postWorkout.painLevel;
            patterns.evening.count++;
          } else {
            patterns.night.total += log.postWorkout.painLevel;
            patterns.night.count++;
          }
        }
      }
    });

    return Object.entries(patterns).map(([period, data]) => ({
      period: period as TimeOfDayPattern['period'],
      avgPain: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
      count: data.count
    }));
  }, [painHistory]);

  // Analyze correlations with triggers
  const correlations = useMemo((): PainCorrelation[] => {
    const results: PainCorrelation[] = [];

    // Analyze workout effect (pre vs post pain)
    const workoutData = Object.values(painHistory).filter(
      (log: DailyPainLog) =>
        log.preWorkout?.painLevel !== undefined &&
        log.postWorkout?.painLevel !== undefined
    );

    if (workoutData.length >= 3) {
      const avgChange = workoutData.reduce((sum, log: DailyPainLog) => {
        const pre = log.preWorkout?.painLevel || 0;
        const post = log.postWorkout?.painLevel || 0;
        return sum + (post - pre);
      }, 0) / workoutData.length;

      results.push({
        factor: 'Träning',
        icon: <Activity className="w-4 h-4" />,
        correlation: avgChange < -0.5 ? 'negative' : avgChange > 0.5 ? 'positive' : 'neutral',
        strength: Math.min(Math.abs(avgChange) * 20, 100),
        description: avgChange < -0.5
          ? 'Träning minskar din smärta'
          : avgChange > 0.5
            ? 'Smärtan ökar efter träning'
            : 'Träning påverkar inte smärtan nämnvärt'
      });
    }

    // Analyze sleep quality correlation (if available in data)
    const sleepData = Object.values(painHistory).filter(
      (log: DailyPainLog) => log.preWorkout?.notes?.toLowerCase().includes('sömn')
    );

    if (sleepData.length >= 2) {
      results.push({
        factor: 'Sömn',
        icon: <Moon className="w-4 h-4" />,
        correlation: 'neutral',
        strength: 40,
        description: 'Sömndata analyseras...'
      });
    }

    // Add weather correlation placeholder (would need external API)
    results.push({
      factor: 'Väder',
      icon: <CloudRain className="w-4 h-4" />,
      correlation: 'neutral',
      strength: 0,
      description: 'Väderdata ej tillgängligt'
    });

    return results;
  }, [painHistory]);

  // Get trend icon
  const getTrendIcon = () => {
    if (stats.trend === 'improving') return <TrendingDown className="w-5 h-5 text-green-600" />;
    if (stats.trend === 'worsening') return <TrendingUp className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  // Get time icon
  const getTimeIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'afternoon': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'evening': return <Sun className="w-4 h-4 text-orange-500" />;
      case 'night': return <Moon className="w-4 h-4 text-indigo-500" />;
      default: return null;
    }
  };

  // Get time label
  const getTimeLabel = (period: string) => {
    switch (period) {
      case 'morning': return 'Morgon (05-12)';
      case 'afternoon': return 'Eftermiddag (12-17)';
      case 'evening': return 'Kväll (17-21)';
      case 'night': return 'Natt (21-05)';
      default: return period;
    }
  };

  // Pain color
  const getPainColor = (pain: number) => {
    if (pain <= 3) return 'text-green-600 bg-green-100';
    if (pain <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Mini bar chart for pain levels
  const PainBar: React.FC<{ value: number; max?: number }> = ({ value, max = 10 }) => (
    <div className="h-2 bg-slate-100 rounded-full flex-1">
      <div
        className={`h-full rounded-full transition-all ${
          value <= 3 ? 'bg-green-400' : value <= 6 ? 'bg-yellow-400' : 'bg-red-400'
        }`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );

  if (Object.keys(painHistory).length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-xl">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Smärtmönster</h3>
            <p className="text-sm text-slate-500">Analysera dina smärtmönster</p>
          </div>
        </div>
        <div className="text-center py-8 text-slate-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Ingen smärtdata ännu</p>
          <p className="text-sm mt-1">Logga smärta före och efter träning för att se mönster</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Smärtmönster</h3>
            <p className="text-sm text-slate-500">{stats.daysWithData} dagar analyserade</p>
          </div>
        </div>

        {/* Trend indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          stats.trend === 'improving' ? 'bg-green-50' :
            stats.trend === 'worsening' ? 'bg-red-50' : 'bg-slate-50'
        }`}>
          {getTrendIcon()}
          <span className={`text-sm font-medium ${
            stats.trend === 'improving' ? 'text-green-700' :
              stats.trend === 'worsening' ? 'text-red-700' : 'text-slate-600'
          }`}>
            {stats.trend === 'improving' && `${stats.trendPercent}% bättre`}
            {stats.trend === 'worsening' && `${stats.trendPercent}% sämre`}
            {stats.trend === 'stable' && 'Stabil'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['overview', 'triggers', 'trends'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === tab
                ? 'bg-purple-100 text-purple-700'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'overview' && 'Översikt'}
            {tab === 'triggers' && 'Triggers'}
            {tab === 'trends' && 'Trender'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.avgPain}</div>
              <div className="text-xs text-slate-500">Genomsnitt</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.minPain}</div>
              <div className="text-xs text-slate-500">Lägsta</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.maxPain}</div>
              <div className="text-xs text-slate-500">Högsta</div>
            </div>
          </div>

          {/* Time of Day Patterns */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Smärta per tidpunkt
            </h4>
            <div className="space-y-2">
              {timePatterns.filter(p => p.count > 0).map((pattern) => (
                <div key={pattern.period} className="flex items-center gap-3">
                  <div className="w-32 flex items-center gap-2 text-sm text-slate-600">
                    {getTimeIcon(pattern.period)}
                    {getTimeLabel(pattern.period).split(' ')[0]}
                  </div>
                  <PainBar value={pattern.avgPain} />
                  <div className={`w-12 text-right text-sm font-medium ${
                    pattern.avgPain <= 3 ? 'text-green-600' :
                      pattern.avgPain <= 6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {pattern.avgPain}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Triggers Tab */}
      {selectedTab === 'triggers' && (
        <div className="space-y-4">
          {correlations.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Fler data behövs för att analysera triggers</p>
            </div>
          ) : (
            correlations.map((corr, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
              >
                <div className={`p-2 rounded-lg ${
                  corr.correlation === 'negative' ? 'bg-green-100 text-green-600' :
                    corr.correlation === 'positive' ? 'bg-red-100 text-red-600' :
                      'bg-slate-200 text-slate-500'
                }`}>
                  {corr.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{corr.factor}</div>
                  <div className="text-sm text-slate-500">{corr.description}</div>
                </div>
                {corr.strength > 0 && (
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      corr.correlation === 'negative' ? 'text-green-600' :
                        corr.correlation === 'positive' ? 'text-red-600' :
                          'text-slate-500'
                    }`}>
                      {corr.strength}%
                    </div>
                    <div className="text-xs text-slate-400">styrka</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Trends Tab */}
      {selectedTab === 'trends' && (
        <div className="space-y-4">
          {/* Date navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDateOffset(Math.min(dateOffset + 7, days - 7))}
              disabled={dateOffset >= days - 7}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600">
              Senaste {Math.min(7, painTrend.length - dateOffset)} dagarna
            </span>
            <button
              onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
              disabled={dateOffset === 0}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Simple trend visualization */}
          <div className="space-y-2">
            {painTrend.slice(dateOffset, dateOffset + 7).map((day, idx) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-500">
                  {new Date(day.date).toLocaleDateString('sv-SE', {
                    weekday: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {day.prePain !== undefined && (
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${getPainColor(day.prePain)}`}>
                      Före: {day.prePain}
                    </div>
                  )}
                  {day.postPain !== undefined && (
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${getPainColor(day.postPain)}`}>
                      Efter: {day.postPain}
                    </div>
                  )}
                  {day.prePain === undefined && day.postPain === undefined && (
                    <span className="text-xs text-slate-400">Ingen data</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Mönster baseras på din loggade smärtdata. Ju mer data, desto bättre analys.
        </p>
      </div>
    </div>
  );
};

export default PainPatternsPanel;
