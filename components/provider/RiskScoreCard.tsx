// ============================================================================
// RISK SCORE CARD COMPONENT
// ============================================================================
// Individual patient risk card showing risk score gauge, trend, and quick actions

import React from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Brain,
  Heart,
  Target,
  ChevronRight,
  Bell,
  Eye,
  MessageSquare
} from 'lucide-react';
import type { RiskAssessment, PatientRiskSummary, RiskLevel } from '../../services/riskStratificationService';

// ============================================================================
// TYPES
// ============================================================================

interface RiskScoreCardProps {
  patient: PatientRiskSummary;
  onClick?: () => void;
  onQuickAction?: (action: 'view' | 'message' | 'alert') => void;
  compact?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getRiskLevelConfig = (level: RiskLevel) => {
  const configs = {
    critical: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-100',
      gaugeColor: '#dc2626',
      label: 'Kritisk',
      icon: AlertTriangle
    },
    high: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      badgeBg: 'bg-orange-100',
      gaugeColor: '#ea580c',
      label: 'Hög',
      icon: AlertTriangle
    },
    moderate: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      badgeBg: 'bg-yellow-100',
      gaugeColor: '#ca8a04',
      label: 'Måttlig',
      icon: Activity
    },
    low: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      badgeBg: 'bg-green-100',
      gaugeColor: '#16a34a',
      label: 'Låg',
      icon: Target
    }
  };
  return configs[level] || configs.moderate;
};

const getTrendIcon = (trend?: 'improving' | 'stable' | 'worsening') => {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    case 'worsening':
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-slate-400" />;
  }
};

const getTrendLabel = (trend?: 'improving' | 'stable' | 'worsening') => {
  switch (trend) {
    case 'improving':
      return 'Förbättras';
    case 'worsening':
      return 'Försämras';
    default:
      return 'Stabil';
  }
};

// ============================================================================
// CIRCULAR GAUGE COMPONENT
// ============================================================================

interface CircularGaugeProps {
  score: number;
  color: string;
  size?: number;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({ score, color, size = 80 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      {/* Score in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-slate-700">{Math.round(score)}</span>
      </div>
    </div>
  );
};

// ============================================================================
// FACTOR BAR COMPONENT
// ============================================================================

interface FactorBarProps {
  label: string;
  score: number;
  icon: React.ReactNode;
}

const FactorBar: React.FC<FactorBarProps> = ({ label, score, icon }) => {
  const getBarColor = (s: number) => {
    if (s >= 75) return 'bg-red-500';
    if (s >= 50) return 'bg-orange-500';
    if (s >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(score)} rounded-full transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-slate-500 w-6 text-right">{Math.round(score)}</span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  patient,
  onClick,
  onQuickAction,
  compact = false
}) => {
  const assessment = patient.riskAssessment;
  const riskLevel = assessment?.riskLevel || 'moderate';
  const config = getRiskLevelConfig(riskLevel);
  const RiskIcon = config.icon;

  if (!assessment) {
    // Unassessed patient card
    return (
      <div
        className={`bg-slate-50 rounded-xl border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-700">{patient.patientName}</h3>
            <p className="text-sm text-slate-500">{patient.diagnosis || 'Ingen diagnos'}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-xs">Ej bedömd</span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Fas {patient.currentPhase}/{patient.totalPhases}
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact version for lists
    return (
      <div
        className={`${config.bgColor} rounded-lg border ${config.borderColor} p-3 ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {/* Mini gauge */}
          <CircularGauge score={assessment.overallScore} color={config.gaugeColor} size={50} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-700 truncate">{patient.patientName}</h4>
              {patient.activeAlerts > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                  {patient.activeAlerts}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeBg} ${config.textColor}`}>
                {config.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                {getTrendIcon(assessment.scoreTrend)}
                {getTrendLabel(assessment.scoreTrend)}
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    );
  }

  // Full card version
  return (
    <div
      className={`${config.bgColor} rounded-xl border ${config.borderColor} p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">{patient.patientName}</h3>
            {patient.activeAlerts > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                <Bell className="w-3 h-3" />
                {patient.activeAlerts}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-0.5">{patient.diagnosis || 'Ingen diagnos'}</p>
          <p className="text-xs text-slate-500 mt-1">
            Fas {patient.currentPhase}/{patient.totalPhases}
          </p>
        </div>

        {/* Risk gauge */}
        <CircularGauge score={assessment.overallScore} color={config.gaugeColor} />
      </div>

      {/* Risk level badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.badgeBg} ${config.textColor} text-sm font-medium`}>
            <RiskIcon className="w-4 h-4" />
            {config.label} risk
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-600">
          {getTrendIcon(assessment.scoreTrend)}
          <span>{getTrendLabel(assessment.scoreTrend)}</span>
          {assessment.scoreChange !== undefined && assessment.scoreChange !== 0 && (
            <span className={`text-xs ${assessment.scoreChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
              ({assessment.scoreChange > 0 ? '+' : ''}{assessment.scoreChange.toFixed(1)})
            </span>
          )}
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-2 mb-4">
        <FactorBar
          label="Smärta"
          score={assessment.painScore}
          icon={<Activity className="w-3.5 h-3.5" />}
        />
        <FactorBar
          label="Följsamhet"
          score={assessment.adherenceScore}
          icon={<Target className="w-3.5 h-3.5" />}
        />
        <FactorBar
          label="Psykologisk"
          score={assessment.psychologicalScore}
          icon={<Brain className="w-3.5 h-3.5" />}
        />
        <FactorBar
          label="Rörelse"
          score={assessment.movementScore}
          icon={<Activity className="w-3.5 h-3.5" />}
        />
        <FactorBar
          label="Hälsa"
          score={assessment.healthScore}
          icon={<Heart className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Top contributing factor */}
      {assessment.contributingFactors && assessment.contributingFactors.length > 0 && (
        <div className="p-2 bg-white/50 rounded-lg mb-4">
          <p className="text-xs text-slate-500 mb-1">Främsta riskfaktor:</p>
          <p className="text-sm text-slate-700">
            {assessment.contributingFactors[0].description}
          </p>
        </div>
      )}

      {/* Quick actions */}
      {onQuickAction && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAction('view'); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Visa
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAction('message'); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Meddelande
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAction('alert'); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Notiser
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;
