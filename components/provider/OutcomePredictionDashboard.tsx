// ============================================================================
// OUTCOME PREDICTION DASHBOARD
// ============================================================================
// Dashboard for providers to view patient outcome predictions, success probabilities,
// discharge timelines, and cohort comparisons.

import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  BarChart2,
  Award,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import type {
  OutcomePrediction,
  PatientOutcomeSummary,
  ProviderOutcomeDashboard,
  RiskFactor,
  ProtectiveFactor
} from '../../services/outcomePredictionService';

// ============================================================================
// TYPES
// ============================================================================

interface OutcomePredictionDashboardProps {
  providerId: string;
  onSelectPatient?: (patientId: string) => void;
  onGeneratePrediction?: (patientId: string) => void;
}

type FilterSuccessLevel = 'all' | 'high' | 'moderate' | 'low';
type SortOption = 'success_asc' | 'success_desc' | 'improvement' | 'discharge' | 'name';

// ============================================================================
// DEMO DATA
// ============================================================================

const generateDemoData = (): ProviderOutcomeDashboard => ({
  totalPatients: 24,
  patientsWithPredictions: 20,
  avgMCIDProbability: 0.72,
  avgPredictedImprovement: 18.5,
  highSuccessCount: 12,
  moderateSuccessCount: 5,
  lowSuccessCount: 3,
  avgDischargeWeeks: 10.5,
  patients: [
    {
      patientId: '1',
      patientName: 'Anna Svensson',
      diagnosis: 'ACL-rekonstruktion',
      currentPhase: 2,
      totalPhases: 4,
      weekInProgram: 6,
      baselineODI: 52,
      currentODI: 38,
      prediction: {
        id: 'op1',
        userId: '1',
        predictionType: 'interim',
        predictedFinalODI: 18,
        predictedODIChange: 34,
        predictedDischargeWeek: 14,
        phaseCompletionPredictions: [
          { phase: 1, predictedWeeks: 4 },
          { phase: 2, predictedWeeks: 8 },
          { phase: 3, predictedWeeks: 11 },
          { phase: 4, predictedWeeks: 14 }
        ],
        mcidProbability: 0.88,
        successProbability: 0.85,
        confidenceScore: 0.82,
        confidenceIntervalLower: 12,
        confidenceIntervalUpper: 24,
        riskFactors: [
          { factor: 'moderate_kinesiophobia', impact: -0.1, description: 'Måttlig rörelserädsla som bör adresseras', category: 'psychological' }
        ],
        protectiveFactors: [
          { factor: 'high_early_adherence', impact: 0.2, description: 'Utmärkt följsamhet (≥ 85%) ökar chansen för goda resultat', category: 'adherence' },
          { factor: 'early_improvement', impact: 0.25, description: 'Tidig förbättring (≥ 10p vecka 4) indikerar god prognos', category: 'clinical' }
        ],
        cohortId: 'knee_moderate_30-44',
        cohortPercentile: 78,
        modelVersion: '1.0',
        featuresUsed: { baselineODI: 52, age: 35, weekTwoAdherence: 92 },
        createdAt: '2024-02-28T10:00:00Z'
      }
    },
    {
      patientId: '2',
      patientName: 'Erik Lindberg',
      diagnosis: 'Kronisk ryggsmärta',
      currentPhase: 3,
      totalPhases: 3,
      weekInProgram: 10,
      baselineODI: 48,
      currentODI: 35,
      prediction: {
        id: 'op2',
        userId: '2',
        predictionType: 'interim',
        predictedFinalODI: 28,
        predictedODIChange: 20,
        predictedDischargeWeek: 12,
        phaseCompletionPredictions: [
          { phase: 1, predictedWeeks: 4 },
          { phase: 2, predictedWeeks: 8 },
          { phase: 3, predictedWeeks: 12 }
        ],
        mcidProbability: 0.75,
        successProbability: 0.68,
        confidenceScore: 0.78,
        confidenceIntervalLower: 22,
        confidenceIntervalUpper: 34,
        riskFactors: [
          { factor: 'high_kinesiophobia', impact: -0.2, description: 'Hög rörelserädsla (TSK-11 ≥ 40) kan fördröja återhämtning', category: 'psychological' },
          { factor: 'chronic_pain', impact: -0.2, description: 'Smärta > 12 månader kan innebära längre rehabiliteringstid', category: 'pain' }
        ],
        protectiveFactors: [
          { factor: 'good_adherence', impact: 0.1, description: 'God följsamhet stödjer rehabiliteringen', category: 'adherence' }
        ],
        cohortId: 'lbp_moderate_30-44',
        cohortPercentile: 55,
        modelVersion: '1.0',
        featuresUsed: { baselineODI: 48, age: 42, weekTwoAdherence: 75, baselineTSK11: 42 },
        createdAt: '2024-02-27T14:00:00Z'
      }
    },
    {
      patientId: '3',
      patientName: 'Maria Karlsson',
      diagnosis: 'Axelimpingement',
      currentPhase: 1,
      totalPhases: 3,
      weekInProgram: 3,
      baselineODI: 38,
      currentODI: 35,
      prediction: {
        id: 'op3',
        userId: '3',
        predictionType: 'initial',
        predictedFinalODI: 32,
        predictedODIChange: 6,
        predictedDischargeWeek: 16,
        phaseCompletionPredictions: [
          { phase: 1, predictedWeeks: 5 },
          { phase: 2, predictedWeeks: 11 },
          { phase: 3, predictedWeeks: 16 }
        ],
        mcidProbability: 0.35,
        successProbability: 0.38,
        confidenceScore: 0.65,
        confidenceIntervalLower: 25,
        confidenceIntervalUpper: 40,
        riskFactors: [
          { factor: 'low_early_adherence', impact: -0.25, description: 'Låg följsamhet (< 50%) första veckorna indikerar risk för sämre utfall', category: 'adherence' },
          { factor: 'elevated_anxiety', impact: -0.15, description: 'Förhöjd ångest (PROMIS T-score ≥ 60) kan påverka rehabilitering', category: 'psychological' }
        ],
        protectiveFactors: [],
        cohortId: 'shoulder_any_18-44',
        cohortPercentile: 28,
        modelVersion: '1.0',
        featuresUsed: { baselineODI: 38, age: 29, weekTwoAdherence: 45, promisAnxiety: 62 },
        createdAt: '2024-02-28T08:00:00Z'
      }
    },
    {
      patientId: '4',
      patientName: 'Johan Andersson',
      diagnosis: 'Plantarfasciit',
      currentPhase: 2,
      totalPhases: 2,
      weekInProgram: 7,
      baselineODI: 28,
      currentODI: 15,
      prediction: {
        id: 'op4',
        userId: '4',
        predictionType: 'interim',
        predictedFinalODI: 8,
        predictedODIChange: 20,
        predictedDischargeWeek: 8,
        phaseCompletionPredictions: [
          { phase: 1, predictedWeeks: 4 },
          { phase: 2, predictedWeeks: 8 }
        ],
        mcidProbability: 0.92,
        successProbability: 0.90,
        confidenceScore: 0.88,
        confidenceIntervalLower: 4,
        confidenceIntervalUpper: 12,
        riskFactors: [],
        protectiveFactors: [
          { factor: 'high_early_adherence', impact: 0.2, description: 'Utmärkt följsamhet (≥ 85%) ökar chansen för goda resultat', category: 'adherence' },
          { factor: 'low_kinesiophobia', impact: 0.15, description: 'Låg rörelserädsla underlättar aktiv rehabilitering', category: 'psychological' },
          { factor: 'early_improvement', impact: 0.25, description: 'Tidig förbättring (≥ 10p vecka 4) indikerar god prognos', category: 'clinical' }
        ],
        cohortId: 'general_mild_30-44',
        cohortPercentile: 92,
        modelVersion: '1.0',
        featuresUsed: { baselineODI: 28, age: 38, weekTwoAdherence: 95, baselineTSK11: 22 },
        createdAt: '2024-02-29T09:00:00Z'
      }
    },
    {
      patientId: '5',
      patientName: 'Lisa Bergström',
      diagnosis: 'Tennisarmbåge',
      currentPhase: 2,
      totalPhases: 3,
      weekInProgram: 5,
      baselineODI: 32,
      currentODI: 25,
      prediction: {
        id: 'op5',
        userId: '5',
        predictionType: 'interim',
        predictedFinalODI: 15,
        predictedODIChange: 17,
        predictedDischargeWeek: 10,
        phaseCompletionPredictions: [
          { phase: 1, predictedWeeks: 3 },
          { phase: 2, predictedWeeks: 7 },
          { phase: 3, predictedWeeks: 10 }
        ],
        mcidProbability: 0.82,
        successProbability: 0.78,
        confidenceScore: 0.80,
        confidenceIntervalLower: 10,
        confidenceIntervalUpper: 20,
        riskFactors: [],
        protectiveFactors: [
          { factor: 'good_adherence', impact: 0.1, description: 'God följsamhet stödjer rehabiliteringen', category: 'adherence' },
          { factor: 'younger_age', impact: 0.1, description: 'Yngre ålder associeras med snabbare återhämtning', category: 'demographic' }
        ],
        cohortId: 'general_mild_30-44',
        cohortPercentile: 75,
        modelVersion: '1.0',
        featuresUsed: { baselineODI: 32, age: 34, weekTwoAdherence: 78 },
        createdAt: '2024-02-27T11:00:00Z'
      }
    },
    {
      patientId: '6',
      patientName: 'Karl Nilsson',
      diagnosis: 'Knäartros',
      currentPhase: 1,
      totalPhases: 4,
      weekInProgram: 2,
      baselineODI: 45,
      currentODI: 44
    },
    {
      patientId: '7',
      patientName: 'Sofia Ek',
      diagnosis: 'Höftledsartros',
      currentPhase: 2,
      totalPhases: 3,
      weekInProgram: 8,
      baselineODI: 42,
      currentODI: 30,
      prediction: {
        id: 'op7',
        userId: '7',
        predictionType: 'interim',
        predictedFinalODI: 22,
        predictedODIChange: 20,
        predictedDischargeWeek: 11,
        phaseCompletionPredictions: [
          { phase: 1, predictedWeeks: 4 },
          { phase: 2, predictedWeeks: 8 },
          { phase: 3, predictedWeeks: 11 }
        ],
        mcidProbability: 0.78,
        successProbability: 0.72,
        confidenceScore: 0.75,
        confidenceIntervalLower: 16,
        confidenceIntervalUpper: 28,
        riskFactors: [
          { factor: 'older_age', impact: -0.1, description: 'Ålder ≥ 65 kan innebära längre rehabiliteringstid', category: 'demographic' }
        ],
        protectiveFactors: [
          { factor: 'good_mental_health', impact: 0.15, description: 'God psykisk hälsa stödjer rehabiliteringen', category: 'psychological' }
        ],
        cohortId: 'hip_any_60+',
        cohortPercentile: 68,
        modelVersion: '1.0',
        featuresUsed: { baselineODI: 42, age: 67, weekTwoAdherence: 82 },
        createdAt: '2024-02-28T15:00:00Z'
      }
    }
  ]
});

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Probability gauge component
interface ProbabilityGaugeProps {
  probability: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({
  probability,
  label,
  size = 'md',
  showPercentage = true
}) => {
  const sizeConfig = {
    sm: { width: 60, height: 60, strokeWidth: 6, fontSize: 'text-sm' },
    md: { width: 80, height: 80, strokeWidth: 8, fontSize: 'text-lg' },
    lg: { width: 120, height: 120, strokeWidth: 10, fontSize: 'text-2xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - probability * circumference;

  const getColor = (prob: number) => {
    if (prob >= 0.75) return '#16a34a'; // green
    if (prob >= 0.5) return '#ca8a04'; // yellow
    return '#dc2626'; // red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={config.strokeWidth}
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={getColor(probability)}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-slate-700 ${config.fontSize}`}>
              {Math.round(probability * 100)}%
            </span>
          </div>
        )}
      </div>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );
};

// Timeline visualization
interface TimelineChartProps {
  currentWeek: number;
  predictedDischargeWeek: number;
  phases: { phase: number; predictedWeeks: number; actualWeeks?: number }[];
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  currentWeek,
  predictedDischargeWeek,
  phases
}) => {
  const maxWeek = Math.max(predictedDischargeWeek, currentWeek) + 2;
  const progressPercent = Math.min(100, (currentWeek / predictedDischargeWeek) * 100);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Predicted discharge marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-green-500"
          style={{ left: `${(predictedDischargeWeek / maxWeek) * 100}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>Vecka {currentWeek}</span>
        <span className="text-green-600 font-medium">
          Utskrivning v{predictedDischargeWeek}
        </span>
      </div>

      {/* Phase markers */}
      <div className="flex mt-3 gap-1">
        {phases.map((phase, idx) => {
          const isCompleted = currentWeek >= phase.predictedWeeks;
          const isCurrent = idx > 0
            ? currentWeek >= phases[idx - 1].predictedWeeks && currentWeek < phase.predictedWeeks
            : currentWeek < phase.predictedWeeks;

          return (
            <div
              key={phase.phase}
              className={`flex-1 h-1.5 rounded-full ${
                isCompleted
                  ? 'bg-green-500'
                  : isCurrent
                  ? 'bg-primary-400'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
      <div className="flex mt-1 gap-1 text-xs text-slate-400">
        {phases.map((phase) => (
          <div key={phase.phase} className="flex-1 text-center">
            Fas {phase.phase}
          </div>
        ))}
      </div>
    </div>
  );
};

// Patient prediction card
interface PatientPredictionCardProps {
  patient: PatientOutcomeSummary;
  onClick?: () => void;
  onGeneratePrediction?: () => void;
}

const PatientPredictionCard: React.FC<PatientPredictionCardProps> = ({
  patient,
  onClick,
  onGeneratePrediction
}) => {
  const prediction = patient.prediction;

  if (!prediction) {
    return (
      <div
        className="bg-slate-50 rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-all"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-700">{patient.patientName}</h3>
            <p className="text-sm text-slate-500">{patient.diagnosis}</p>
            <p className="text-xs text-slate-400 mt-1">
              Fas {patient.currentPhase}/{patient.totalPhases} • Vecka {patient.weekInProgram}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGeneratePrediction?.();
            }}
            className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors"
          >
            Generera prediktion
          </button>
        </div>
      </div>
    );
  }

  const successLevel = prediction.successProbability >= 0.75
    ? 'high'
    : prediction.successProbability >= 0.5
    ? 'moderate'
    : 'low';

  const levelConfig = {
    high: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', icon: CheckCircle },
    moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: Clock },
    low: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertTriangle }
  };

  const config = levelConfig[successLevel];
  const Icon = config.icon;

  // Calculate current improvement
  const currentImprovement = patient.baselineODI && patient.currentODI
    ? patient.baselineODI - patient.currentODI
    : 0;

  return (
    <div
      className={`${config.bg} rounded-xl border ${config.border} p-4 cursor-pointer hover:shadow-md transition-all`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">{patient.patientName}</h3>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
              <Icon className="w-3 h-3" />
              {successLevel === 'high' ? 'God prognos' : successLevel === 'moderate' ? 'Måttlig' : 'Utmanande'}
            </span>
          </div>
          <p className="text-sm text-slate-600">{patient.diagnosis}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Fas {patient.currentPhase}/{patient.totalPhases} • Vecka {patient.weekInProgram}
          </p>
        </div>

        {/* Success probability gauge */}
        <ProbabilityGauge
          probability={prediction.successProbability}
          label="Framgång"
          size="sm"
        />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <p className="text-lg font-bold text-slate-800">
            {prediction.predictedODIChange?.toFixed(0) || '-'}
          </p>
          <p className="text-xs text-slate-500">Förv. förbättring</p>
        </div>
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <p className="text-lg font-bold text-slate-800">
            v{prediction.predictedDischargeWeek}
          </p>
          <p className="text-xs text-slate-500">Utskrivning</p>
        </div>
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <p className="text-lg font-bold text-slate-800">
            {Math.round(prediction.mcidProbability * 100)}%
          </p>
          <p className="text-xs text-slate-500">MCID sannolikhet</p>
        </div>
      </div>

      {/* Current progress indicator */}
      {patient.baselineODI && patient.currentODI && (
        <div className="flex items-center justify-between text-xs mb-3 p-2 bg-white/50 rounded-lg">
          <span className="text-slate-600">Nuvarande framsteg:</span>
          <span className={`font-medium ${currentImprovement >= 10 ? 'text-green-600' : 'text-slate-700'}`}>
            {currentImprovement > 0 ? '+' : ''}{currentImprovement} poäng
            {currentImprovement >= 10 && ' (MCID uppnådd)'}
          </span>
        </div>
      )}

      {/* Risk/Protective factors summary */}
      <div className="flex items-center gap-2 text-xs">
        {prediction.riskFactors.length > 0 && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="w-3 h-3" />
            {prediction.riskFactors.length} riskfaktor{prediction.riskFactors.length !== 1 ? 'er' : ''}
          </span>
        )}
        {prediction.protectiveFactors.length > 0 && (
          <span className="flex items-center gap-1 text-green-600">
            <Shield className="w-3 h-3" />
            {prediction.protectiveFactors.length} skyddsfaktor{prediction.protectiveFactors.length !== 1 ? 'er' : ''}
          </span>
        )}
        {prediction.cohortPercentile && (
          <span className="flex items-center gap-1 text-slate-500 ml-auto">
            <BarChart2 className="w-3 h-3" />
            Topp {100 - prediction.cohortPercentile}% i kohort
          </span>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const OutcomePredictionDashboard: React.FC<OutcomePredictionDashboardProps> = ({
  providerId,
  onSelectPatient,
  onGeneratePrediction
}) => {
  const [dashboardData, setDashboardData] = useState<ProviderOutcomeDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterSuccess, setFilterSuccess] = useState<FilterSuccessLevel>('all');
  const [sortBy, setSortBy] = useState<SortOption>('success_asc');
  const [showOnlyWithPredictions, setShowOnlyWithPredictions] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, [providerId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In production: getProviderOutcomeDashboard(providerId)
      await new Promise(resolve => setTimeout(resolve, 800));
      setDashboardData(generateDemoData());
    } catch (error) {
      console.error('Failed to load outcome dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDashboardData(generateDemoData());
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and sort patients
  const filteredPatients = dashboardData?.patients
    .filter(patient => {
      // Show only with predictions filter
      if (showOnlyWithPredictions && !patient.prediction) {
        return false;
      }

      // Success level filter
      if (filterSuccess !== 'all' && patient.prediction) {
        const prob = patient.prediction.successProbability;
        if (filterSuccess === 'high' && prob < 0.75) return false;
        if (filterSuccess === 'moderate' && (prob < 0.5 || prob >= 0.75)) return false;
        if (filterSuccess === 'low' && prob >= 0.5) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'success_asc':
          return (a.prediction?.successProbability || 0) - (b.prediction?.successProbability || 0);
        case 'success_desc':
          return (b.prediction?.successProbability || 0) - (a.prediction?.successProbability || 0);
        case 'improvement':
          return (b.prediction?.predictedODIChange || 0) - (a.prediction?.predictedODIChange || 0);
        case 'discharge':
          return (a.prediction?.predictedDischargeWeek || 99) - (b.prediction?.predictedDischargeWeek || 99);
        case 'name':
          return a.patientName.localeCompare(b.patientName, 'sv');
        default:
          return 0;
      }
    }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Laddar prediktioner...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Kunde inte ladda data</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Prediktiv analys</h1>
              <p className="text-sm text-slate-500">Prognoser för patientutfall och återhämtning</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Uppdatera
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {dashboardData.patientsWithPredictions}/{dashboardData.totalPatients}
                </p>
                <p className="text-xs text-slate-500">Med prediktioner</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {Math.round(dashboardData.avgMCIDProbability * 100)}%
                </p>
                <p className="text-xs text-slate-500">Snitt MCID-sannolikhet</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {dashboardData.avgPredictedImprovement.toFixed(0)}p
                </p>
                <p className="text-xs text-slate-500">Snitt förv. förbättring</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {dashboardData.avgDischargeWeeks.toFixed(1)}v
                </p>
                <p className="text-xs text-slate-500">Snitt utskrivningstid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Framgångsprognos fördelning</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setFilterSuccess(filterSuccess === 'high' ? 'all' : 'high')}
              className={`p-4 rounded-xl transition-all ${
                filterSuccess === 'high'
                  ? 'bg-green-100 ring-2 ring-green-500'
                  : 'bg-green-50 hover:bg-green-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{dashboardData.highSuccessCount}</span>
              </div>
              <p className="text-sm text-green-700 font-medium">God prognos</p>
              <p className="text-xs text-green-600">≥ 75% framgångssannolikhet</p>
            </button>

            <button
              onClick={() => setFilterSuccess(filterSuccess === 'moderate' ? 'all' : 'moderate')}
              className={`p-4 rounded-xl transition-all ${
                filterSuccess === 'moderate'
                  ? 'bg-yellow-100 ring-2 ring-yellow-500'
                  : 'bg-yellow-50 hover:bg-yellow-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">{dashboardData.moderateSuccessCount}</span>
              </div>
              <p className="text-sm text-yellow-700 font-medium">Måttlig prognos</p>
              <p className="text-xs text-yellow-600">50-74% framgångssannolikhet</p>
            </button>

            <button
              onClick={() => setFilterSuccess(filterSuccess === 'low' ? 'all' : 'low')}
              className={`p-4 rounded-xl transition-all ${
                filterSuccess === 'low'
                  ? 'bg-red-100 ring-2 ring-red-500'
                  : 'bg-red-50 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-red-700">{dashboardData.lowSuccessCount}</span>
              </div>
              <p className="text-sm text-red-700 font-medium">Utmanande prognos</p>
              <p className="text-xs text-red-600">&lt; 50% framgångssannolikhet</p>
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Sortera:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="success_asc">Lägst framgång först</option>
                <option value="success_desc">Högst framgång först</option>
                <option value="improvement">Störst förbättring</option>
                <option value="discharge">Närmast utskrivning</option>
                <option value="name">Namn (A-Ö)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyWithPredictions}
                onChange={(e) => setShowOnlyWithPredictions(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Visa endast med prediktioner
            </label>

            {filterSuccess !== 'all' && (
              <button
                onClick={() => setFilterSuccess('all')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Rensa filter
              </button>
            )}
          </div>
        </div>

        {/* Patient List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Patienter ({filteredPatients.length})
          </h2>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Info className="w-3 h-3" />
            Sorterat för att visa patienter som behöver mest uppmärksamhet först
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Inga patienter matchar dina filter</p>
            <button
              onClick={() => {
                setFilterSuccess('all');
                setShowOnlyWithPredictions(false);
              }}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700"
            >
              Rensa filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPatients.map(patient => (
              <PatientPredictionCard
                key={patient.patientId}
                patient={patient}
                onClick={() => onSelectPatient?.(patient.patientId)}
                onGeneratePrediction={() => onGeneratePrediction?.(patient.patientId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutcomePredictionDashboard;
