/**
 * ROM Trend Chart
 * Visualizes ROM progress over time
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ROMTrend, calculateROMTrends, getROMHistory, getROMSummaryStats } from '../services/romTrackingService';

interface ROMTrendChartProps {
  patientAge: number;
  showDetailedView?: boolean;
}

const ROMTrendChart: React.FC<ROMTrendChartProps> = ({
  patientAge,
  showDetailedView = false
}) => {
  const history = getROMHistory();
  const trends = calculateROMTrends(patientAge);
  const stats = getROMSummaryStats(patientAge);

  if (history.measurements.length === 0) {
    return null;
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'declining': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // If only one measurement, show summary
  if (history.measurements.length === 1) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 rounded-xl p-2">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Första mätningen gjord</h3>
            <p className="text-xs text-gray-500">
              {new Date(history.measurements[0].assessmentDate).toLocaleDateString('sv-SE')}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Gör en till mätning om några veckor för att se din utveckling över tid.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 rounded-xl p-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Din utveckling</h3>
            <p className="text-xs text-gray-500">
              {stats.totalMeasurements} mätningar genomförda
            </p>
          </div>
        </div>
        {stats.averageImprovement !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            stats.averageImprovement > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {stats.averageImprovement > 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {stats.averageImprovement > 0 ? '+' : ''}{stats.averageImprovement}° snitt
          </div>
        )}
      </div>

      {/* Summary stats */}
      {(stats.bestJoint || stats.needsAttention) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.bestJoint && (
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Bäst förbättring</div>
              <div className="text-sm font-medium text-green-700">{stats.bestJoint}</div>
            </div>
          )}
          {stats.needsAttention && (
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Behöver fokus</div>
              <div className="text-sm font-medium text-orange-700">{stats.needsAttention}</div>
            </div>
          )}
        </div>
      )}

      {/* Trend items */}
      {showDetailedView && trends.length > 0 && (
        <div className="space-y-2">
          {trends.map((trend, idx) => {
            const Icon = getTrendIcon(trend.trend);
            const colorClass = getTrendColor(trend.trend);

            return (
              <div key={idx} className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{trend.joint}</div>
                    <div className="text-xs text-gray-500">
                      {trend.previousValue}° → {trend.currentValue}°
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${
                  trend.trend === 'improving' ? 'text-green-600' :
                  trend.trend === 'declining' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trend.change > 0 ? '+' : ''}{trend.change}°
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mini timeline */}
      {history.measurements.length > 1 && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Calendar className="w-3 h-3" />
            Mätningshistorik
          </div>
          <div className="flex items-center gap-1">
            {history.measurements.slice(-6).map((measurement, idx) => (
              <div
                key={idx}
                className="flex-1 h-2 rounded-full bg-purple-200"
                title={new Date(measurement.assessmentDate).toLocaleDateString('sv-SE')}
              >
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${((idx + 1) / Math.min(6, history.measurements.length)) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ROMTrendChart;
