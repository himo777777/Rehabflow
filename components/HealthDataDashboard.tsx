/**
 * Health Data Dashboard Component
 *
 * Displays health metrics, enables HealthKit authorization,
 * shows daily summary, weekly trends, and recovery score
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Moon,
  Footprints,
  Flame,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar
} from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { HealthDataType } from '../services/healthDataService';

// ============================================================================
// TYPES
// ============================================================================

interface HealthMetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit: string;
  trend?: number;
  color: string;
}

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dataType: HealthDataType, value: number, unit: string, date: Date) => Promise<void>;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

/**
 * Health Metric Card
 */
const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  icon,
  title,
  value,
  unit,
  trend,
  color
}) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            {icon}
            <span>{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? Math.round(value).toLocaleString() : value}
            </span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Recovery Score Circle
 */
const RecoveryScore: React.FC<{ score: number | null }> = ({ score }) => {
  const scoreValue = score || 0;
  const circumference = 2 * Math.PI * 45;
  const progress = (scoreValue / 100) * circumference;

  const getScoreColor = (s: number): string => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (s: number): string => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Low';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recovery Score</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-36 h-36">
            <circle
              cx="72"
              cy="72"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className={getScoreColor(scoreValue)}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(scoreValue)}`}>
              {scoreValue}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
        </div>
        <p className={`mt-4 text-sm font-medium ${getScoreColor(scoreValue)}`}>
          {getScoreLabel(scoreValue)}
        </p>
        <p className="text-xs text-gray-500 text-center mt-2">
          Based on sleep, heart rate, and activity
        </p>
      </div>
    </div>
  );
};

/**
 * Manual Entry Modal
 */
const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [dataType, setDataType] = useState<HealthDataType>(HealthDataType.STEPS);
  const [value, setValue] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataTypeOptions = [
    { type: HealthDataType.STEPS, label: 'Steps', unit: 'steps' },
    { type: HealthDataType.WEIGHT, label: 'Weight', unit: 'kg' },
    { type: HealthDataType.HEIGHT, label: 'Height', unit: 'cm' },
    { type: HealthDataType.HEART_RATE, label: 'Heart Rate', unit: 'bpm' },
    { type: HealthDataType.SLEEP_ANALYSIS, label: 'Sleep Duration', unit: 'minutes' },
    { type: HealthDataType.ACTIVE_ENERGY, label: 'Calories Burned', unit: 'kcal' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedOption = dataTypeOptions.find(opt => opt.type === dataType);
    if (!selectedOption) return;

    try {
      await onSubmit(dataType, parseFloat(value), selectedOption.unit, new Date(date));
      setValue('');
      onClose();
    } catch (error) {
      console.error('Failed to submit manual data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Health Data</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as HealthDataType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {dataTypeOptions.map(option => (
                <option key={option.type} value={option.type}>
                  {option.label} ({option.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !value}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HealthDataDashboard: React.FC = () => {
  const {
    state,
    requestAuthorization,
    syncData,
    getDailySummary,
    getRecoveryScore,
    addManualData,
    refreshData
  } = useHealthData();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>('Never');

  useEffect(() => {
    if (state.lastSyncDate) {
      const now = new Date();
      const diff = now.getTime() - state.lastSyncDate.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 60) {
        setLastSyncText(`${minutes} min ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        setLastSyncText(`${hours}h ago`);
      }
    }
  }, [state.lastSyncDate]);

  const handleAuthorize = async () => {
    await requestAuthorization();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualEntry = async (
    dataType: HealthDataType,
    value: number,
    unit: string,
    date: Date
  ) => {
    await addManualData(dataType, value, unit, date);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Data</h1>
          <p className="text-gray-600 mt-1">
            Track your activity, sleep, and recovery
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Manual Entry Button */}
          <button
            onClick={() => setShowManualEntry(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Data</span>
          </button>

          {/* Sync Button */}
          {state.isAuthorized && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {!state.isAuthorized && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {state.isAvailable ? 'Connect Apple HealthKit' : 'HealthKit Not Available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {state.isAvailable
                  ? 'Automatically sync your activity, heart rate, sleep data, and more to enhance your rehabilitation insights.'
                  : 'HealthKit is only available on iOS devices. You can manually enter health data instead.'}
              </p>
              {state.isAvailable && (
                <button
                  onClick={handleAuthorize}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Connect HealthKit
                </button>
              )}
            </div>
            {state.isAvailable && (
              <Activity className="w-12 h-12 text-indigo-600" />
            )}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {state.isAuthorized && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                HealthKit Connected
              </p>
              <p className="text-xs text-gray-600">
                Last synced: {lastSyncText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      {/* Dashboard Content */}
      {state.isAuthorized && state.dailySummary && (
        <>
          {/* Recovery Score + Today's Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RecoveryScore score={state.recoveryScore} />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HealthMetricCard
                icon={<Footprints className="w-4 h-4" />}
                title="Steps"
                value={state.dailySummary.steps}
                unit="steps"
                color="border-blue-500"
              />
              <HealthMetricCard
                icon={<Heart className="w-4 h-4" />}
                title="Avg Heart Rate"
                value={Math.round(state.dailySummary.averageHeartRate)}
                unit="bpm"
                color="border-red-500"
              />
              <HealthMetricCard
                icon={<Moon className="w-4 h-4" />}
                title="Sleep"
                value={state.dailySummary.sleepHours.toFixed(1)}
                unit="hours"
                color="border-purple-500"
              />
              <HealthMetricCard
                icon={<Flame className="w-4 h-4" />}
                title="Calories"
                value={Math.round(state.dailySummary.activeEnergy)}
                unit="kcal"
                color="border-orange-500"
              />
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recovery Insights
            </h3>
            <div className="space-y-3">
              {state.dailySummary.sleepHours >= 7 && (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Great sleep! You're getting sufficient rest for optimal recovery.
                  </p>
                </div>
              )}
              {state.dailySummary.steps >= 7000 && (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Excellent activity level! You're hitting your daily movement goals.
                  </p>
                </div>
              )}
              {state.dailySummary.sleepHours < 6 && (
                <div className="flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Consider getting more sleep. Aim for 7-9 hours for optimal recovery.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSubmit={handleManualEntry}
      />
    </div>
  );
};

export default HealthDataDashboard;
