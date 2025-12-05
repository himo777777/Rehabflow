/**
 * Pain Prediction Dashboard Component
 *
 * Displays ML-based pain forecasts, risk alerts, and preventive recommendations
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Activity,
  Lightbulb,
  RefreshCw,
  Info,
  ChevronRight
} from 'lucide-react';
import { usePainPrediction } from '../hooks/usePainPrediction';
import { PainPrediction } from '../services/painPredictionService';

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

/**
 * Risk Level Badge
 */
interface RiskBadgeProps {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ riskLevel, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const colorClasses = {
    low: 'bg-green-100 text-green-800 border-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300'
  };

  const icons = {
    low: <CheckCircle2 className="w-4 h-4" />,
    moderate: <Info className="w-4 h-4" />,
    high: <AlertCircle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[riskLevel]}`}>
      {icons[riskLevel]}
      <span className="capitalize">{riskLevel} Risk</span>
    </div>
  );
};

/**
 * Pain Forecast Card
 */
interface PainForecastCardProps {
  prediction: PainPrediction;
  currentPain: number;
}

const PainForecastCard: React.FC<PainForecastCardProps> = ({ prediction, currentPain }) => {
  const painChange = prediction.predictedPain - currentPain;
  const isIncreasing = painChange > 0.5;
  const isDecreasing = painChange < -0.5;

  const getPainColor = (pain: number): string => {
    if (pain >= 8) return 'text-red-600';
    if (pain >= 6) return 'text-orange-600';
    if (pain >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPainBgColor = (pain: number): string => {
    if (pain >= 8) return 'bg-red-50 border-red-200';
    if (pain >= 6) return 'bg-orange-50 border-orange-200';
    if (pain >= 4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className={`rounded-xl p-6 border-2 ${getPainBgColor(prediction.predictedPain)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {prediction.horizon === 24 ? (
            <Clock className="w-5 h-5 text-gray-600" />
          ) : (
            <Calendar className="w-5 h-5 text-gray-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {prediction.horizon}h Forecast
          </h3>
        </div>
        <RiskBadge riskLevel={prediction.riskLevel} size="sm" />
      </div>

      {/* Pain Prediction */}
      <div className="flex items-end gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Predicted Pain</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${getPainColor(prediction.predictedPain)}`}>
              {prediction.predictedPain.toFixed(1)}
            </span>
            <span className="text-lg text-gray-500">/ 10</span>
          </div>
        </div>

        {/* Pain Change Indicator */}
        {(isIncreasing || isDecreasing) && (
          <div className={`flex items-center gap-1 pb-2 ${isIncreasing ? 'text-red-600' : 'text-green-600'}`}>
            {isIncreasing ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(painChange).toFixed(1)} points
            </span>
          </div>
        )}
      </div>

      {/* Confidence Interval */}
      <div className="bg-white/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-2">Range (95% confidence)</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {prediction.confidenceInterval.lower.toFixed(1)}
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
            <div
              className={`absolute h-full rounded-full ${
                prediction.predictedPain >= 7 ? 'bg-red-500' :
                prediction.predictedPain >= 5 ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{
                left: `${(prediction.confidenceInterval.lower / 10) * 100}%`,
                width: `${((prediction.confidenceInterval.upper - prediction.confidenceInterval.lower) / 10) * 100}%`
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {prediction.confidenceInterval.upper.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Prediction Confidence</span>
        <span className="font-semibold text-gray-900">
          {(prediction.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

/**
 * Contributing Factors List
 */
interface ContributingFactorsProps {
  factors: PainPrediction['contributingFactors'];
}

const ContributingFactors: React.FC<ContributingFactorsProps> = ({ factors }) => {
  if (factors.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-600" />
        Contributing Factors
      </h3>

      <div className="space-y-3">
        {factors.map((factor, index) => {
          const isNegative = factor.impact < 0;
          const barWidth = Math.abs(factor.impact) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{factor.factor}</span>
                <span className={`font-medium ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                  {isNegative ? 'Increases pain' : 'Reduces pain'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isNegative ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {(factor.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Recommendations Card
 */
interface RecommendationsProps {
  recommendations: string[];
  riskLevel: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({ recommendations, riskLevel }) => {
  if (recommendations.length === 0) return null;

  const bgColor = {
    low: 'bg-green-50 border-green-200',
    moderate: 'bg-yellow-50 border-yellow-200',
    high: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200'
  }[riskLevel] || 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-xl p-6 border-2 ${bgColor}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        Recommendations
      </h3>

      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start gap-3">
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Trend Analysis Card
 */
interface TrendAnalysisProps {
  trend: 'improving' | 'stable' | 'worsening';
  averagePain: number;
  volatility: number;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ trend, averagePain, volatility }) => {
  const trendConfig = {
    improving: {
      icon: <TrendingDown className="w-6 h-6 text-green-600" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      text: 'Your pain is improving'
    },
    stable: {
      icon: <Minus className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      text: 'Your pain is stable'
    },
    worsening: {
      icon: <TrendingUp className="w-6 h-6 text-red-600" />,
      color: 'text-red-600',
      bg: 'bg-red-50',
      text: 'Your pain is worsening'
    }
  };

  const config = trendConfig[trend];

  return (
    <div className={`rounded-xl p-6 ${config.bg}`}>
      <div className="flex items-center gap-3 mb-4">
        {config.icon}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{config.text}</h3>
          <p className="text-sm text-gray-600">Last 14 days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Average Pain</p>
          <p className="text-2xl font-bold text-gray-900">{averagePain.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Volatility</p>
          <p className="text-2xl font-bold text-gray-900">{volatility.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PainPredictionDashboard: React.FC = () => {
  const {
    state,
    generatePrediction,
    refreshPrediction,
    hasSufficientData
  } = usePainPrediction();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showInsufficientDataWarning, setShowInsufficientDataWarning] = useState(false);

  useEffect(() => {
    // Check data sufficiency on mount
    const checkData = async () => {
      const sufficient = await hasSufficientData();
      setShowInsufficientDataWarning(!sufficient);
    };
    checkData();
  }, []);

  const handleGeneratePrediction = async () => {
    setIsGenerating(true);
    try {
      await generatePrediction();
    } finally {
      setIsGenerating(false);
    }
  };

  // Get current pain (last logged pain)
  const currentPain = state.trendAnalysis?.averagePain || 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-600" />
            Pain Prediction
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered pain forecasting for proactive management
          </p>
        </div>

        <button
          onClick={handleGeneratePrediction}
          disabled={isGenerating || state.isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Prediction'}</span>
        </button>
      </div>

      {/* Insufficient Data Warning */}
      {showInsufficientDataWarning && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                More Data Needed
              </h3>
              <p className="text-gray-700 mb-3">
                Pain predictions require at least 7 days of pain logging history. Keep tracking your pain daily to unlock this feature.
              </p>
              <p className="text-sm text-gray-600">
                The more consistently you log pain, the more accurate predictions become.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      {/* Predictions */}
      {state.prediction24h && state.prediction48h && (
        <>
          {/* Forecast Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PainForecastCard
              prediction={state.prediction24h}
              currentPain={currentPain}
            />
            <PainForecastCard
              prediction={state.prediction48h}
              currentPain={currentPain}
            />
          </div>

          {/* Trend Analysis */}
          {state.trendAnalysis && (
            <TrendAnalysis
              trend={state.trendAnalysis.trend}
              averagePain={state.trendAnalysis.averagePain}
              volatility={state.trendAnalysis.volatility}
            />
          )}

          {/* Contributing Factors & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContributingFactors factors={state.prediction24h.contributingFactors} />
            <Recommendations
              recommendations={state.prediction24h.recommendations}
              riskLevel={state.prediction24h.riskLevel}
            />
          </div>

          {/* Accuracy Metrics */}
          {state.accuracyMetrics && state.accuracyMetrics.totalPredictions > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prediction Accuracy
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">24h Accuracy</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {state.accuracyMetrics.accuracy1Point24h.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">within 1 point</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">48h Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {state.accuracyMetrics.accuracy1Point48h.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">within 1 point</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Avg Error (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.accuracyMetrics.mae24h.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Predictions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.accuracyMetrics.totalPredictions}
                  </p>
                  <p className="text-xs text-gray-500">validated</p>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          {state.lastPredictionDate && (
            <div className="text-center text-sm text-gray-500">
              Last updated: {state.lastPredictionDate.toLocaleString()}
            </div>
          )}
        </>
      )}

      {/* No Predictions Yet */}
      {!state.prediction24h && !state.isLoading && !showInsufficientDataWarning && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No predictions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Generate Prediction" to create your first pain forecast
          </p>
        </div>
      )}
    </div>
  );
};

export default PainPredictionDashboard;
