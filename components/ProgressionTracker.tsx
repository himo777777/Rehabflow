/**
 * Progression Tracker - Traffic Light Dashboard
 *
 * Visuell dashboard med GRÖN/GUL/RÖD status baserat på progressionService.
 * Rekommenderar PROGRESS/MAINTAIN/REGRESS baserat på smärta och följsamhet.
 */

import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Target,
  Clock,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { storageService } from '../services/storageService';
import {
  evaluatePainResponse,
  evaluateProgression,
  ProgressionCriteria,
  ProgressionDecision,
  PHASE_TRANSITION_CRITERIA
} from '../services/progressionService';

interface ProgressionTrackerProps {
  /** Current rehabilitation phase */
  currentPhase?: 1 | 2 | 3;
  /** Days in current phase */
  daysInPhase?: number;
  /** Compact mode */
  compact?: boolean;
  /** Callback when progression is evaluated */
  onProgressionEvaluated?: (decision: ProgressionDecision) => void;
}

type TrafficLight = 'green' | 'yellow' | 'red';

const ProgressionTracker: React.FC<ProgressionTrackerProps> = ({
  currentPhase = 1,
  daysInPhase = 7,
  compact = false,
  onProgressionEvaluated
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Get recent pain and exercise data
  const recentData = useMemo(() => {
    const painHistory = storageService.getPainHistory();
    const exerciseHistory = storageService.getDetailedExerciseHistory();
    const progressHistory = storageService.getHistorySync();

    // Get last 7 days of data
    const last7Days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    // Calculate averages
    let totalPainDuring = 0;
    let totalPainAfter = 0;
    let totalRestingPain = 0;
    let painDataPoints = 0;

    let completedDays = 0;
    let totalDays = 0;

    let difficulties: string[] = [];
    let qualities: string[] = [];

    last7Days.forEach(date => {
      const painLog = painHistory[date];
      const exerciseLogs = exerciseHistory[date] || [];
      const dayProgress = progressHistory[date];

      // Pain data
      if (painLog) {
        if (painLog.preWorkout?.painLevel !== undefined) {
          totalRestingPain += painLog.preWorkout.painLevel;
          painDataPoints++;
        }
        if (painLog.postWorkout?.painLevel !== undefined) {
          totalPainAfter += painLog.postWorkout.painLevel;
        }
      }

      // Exercise pain during
      exerciseLogs.forEach(log => {
        if (log.painDuring !== undefined) {
          totalPainDuring += log.painDuring;
        }
        if (log.difficulty) {
          difficulties.push(log.difficulty);
        }
      });

      // Completion rate
      if (dayProgress) {
        totalDays++;
        const completed = Object.values(dayProgress).filter(v => v === true).length;
        const total = Object.keys(dayProgress).length;
        if (total > 0 && completed / total >= 0.5) {
          completedDays++;
        }
      }
    });

    // Calculate averages
    const avgPainDuring = painDataPoints > 0 ? totalPainDuring / painDataPoints : 3;
    const avgPainAfter = painDataPoints > 0 ? totalPainAfter / painDataPoints : 3;
    const avgRestingPain = painDataPoints > 0 ? totalRestingPain / painDataPoints : 2;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 50;

    // Determine perceived effort from difficulties
    const difficultyScore = difficulties.reduce((sum, d) => {
      if (d === 'för_lätt') return sum + 1;
      if (d === 'lagom') return sum + 2;
      return sum + 3;
    }, 0) / (difficulties.length || 1);

    let perceivedEffort: 'lätt' | 'lagom' | 'svårt' | 'för_svårt' = 'lagom';
    if (difficultyScore < 1.5) perceivedEffort = 'lätt';
    else if (difficultyScore > 2.5) perceivedEffort = 'svårt';
    else if (difficultyScore > 2.8) perceivedEffort = 'för_svårt';

    // Determine quality
    let exerciseQuality: 'dålig' | 'acceptabel' | 'god' | 'utmärkt' = 'acceptabel';
    if (completionRate >= 90 && avgPainAfter <= 2) exerciseQuality = 'utmärkt';
    else if (completionRate >= 80 && avgPainAfter <= 3) exerciseQuality = 'god';
    else if (completionRate < 50) exerciseQuality = 'dålig';

    return {
      avgPainDuring: Math.round(avgPainDuring * 10) / 10,
      avgPainAfter: Math.round(avgPainAfter * 10) / 10,
      avgRestingPain: Math.round(avgRestingPain * 10) / 10,
      completionRate,
      perceivedEffort,
      exerciseQuality,
      dataPoints: painDataPoints,
      daysWithData: totalDays
    };
  }, []);

  // Evaluate progression
  const progressionDecision = useMemo(() => {
    const criteria: ProgressionCriteria = {
      painDuringExercise: recentData.avgPainDuring,
      painAfterExercise: recentData.avgPainAfter,
      restingPain: recentData.avgRestingPain,
      completionRate: recentData.completionRate,
      perceivedEffort: recentData.perceivedEffort,
      daysInCurrentPhase: daysInPhase,
      exerciseQuality: recentData.exerciseQuality
    };

    const decision = evaluateProgression(criteria);
    onProgressionEvaluated?.(decision);
    return decision;
  }, [recentData, daysInPhase, onProgressionEvaluated]);

  // Get traffic light status
  const trafficLight = useMemo((): TrafficLight => {
    return evaluatePainResponse(
      recentData.avgPainDuring,
      recentData.avgPainAfter,
      recentData.avgRestingPain
    );
  }, [recentData]);

  // Phase transition criteria
  const phaseTransition = useMemo(() => {
    const criteria = PHASE_TRANSITION_CRITERIA[currentPhase];
    if (!criteria) return null;

    const metCriteria: string[] = [];
    const unmetCriteria: string[] = [];

    // Check each criterion
    if (daysInPhase >= criteria.minDaysInPhase) {
      metCriteria.push(`Minst ${criteria.minDaysInPhase} dagar i fas (${daysInPhase} dagar)`);
    } else {
      unmetCriteria.push(`Minst ${criteria.minDaysInPhase} dagar i fas (${daysInPhase} dagar)`);
    }

    if (recentData.avgPainAfter <= criteria.maxPainLevel) {
      metCriteria.push(`Smärta under ${criteria.maxPainLevel} VAS`);
    } else {
      unmetCriteria.push(`Smärta under ${criteria.maxPainLevel} VAS (nu: ${recentData.avgPainAfter})`);
    }

    if (recentData.completionRate >= criteria.minCompletionRate) {
      metCriteria.push(`${criteria.minCompletionRate}% följsamhet`);
    } else {
      unmetCriteria.push(`${criteria.minCompletionRate}% följsamhet (nu: ${recentData.completionRate}%)`);
    }

    return {
      criteria,
      metCriteria,
      unmetCriteria,
      readyToProgress: unmetCriteria.length === 0 && currentPhase < 3
    };
  }, [currentPhase, daysInPhase, recentData]);

  // Traffic light colors and icons
  const getTrafficLightStyles = (light: TrafficLight) => {
    switch (light) {
      case 'green':
        return {
          bg: 'bg-green-100',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
          label: 'GRÖNT LJUS',
          description: 'Redo att progrediera'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
          label: 'GULT LJUS',
          description: 'Behåll nuvarande nivå'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          label: 'RÖTT LJUS',
          description: 'Minska belastning'
        };
    }
  };

  const lightStyles = getTrafficLightStyles(trafficLight);

  // Action icon
  const getActionIcon = () => {
    switch (progressionDecision.action) {
      case 'progress':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'regress':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'pause':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Data quality indicator
  const dataQuality = useMemo(() => {
    if (recentData.dataPoints >= 5) return { label: 'Bra', color: 'text-green-600' };
    if (recentData.dataPoints >= 3) return { label: 'OK', color: 'text-yellow-600' };
    return { label: 'Otillräcklig', color: 'text-red-600' };
  }, [recentData.dataPoints]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Progressions-tracker</h3>
            <p className="text-sm text-slate-500">Fas {currentPhase} - Dag {daysInPhase}</p>
          </div>
        </div>

        <div className={`text-xs font-medium ${dataQuality.color}`}>
          Data: {dataQuality.label}
        </div>
      </div>

      {/* Traffic Light Display */}
      <div className={`p-6 rounded-2xl ${lightStyles.bg} ${lightStyles.border} border-2 mb-6`}>
        <div className="flex items-center gap-4">
          {/* Traffic light visualization */}
          <div className="flex flex-col gap-1.5">
            <div className={`w-6 h-6 rounded-full ${trafficLight === 'red' ? 'bg-red-500' : 'bg-red-200'}`} />
            <div className={`w-6 h-6 rounded-full ${trafficLight === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-200'}`} />
            <div className={`w-6 h-6 rounded-full ${trafficLight === 'green' ? 'bg-green-500' : 'bg-green-200'}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {lightStyles.icon}
              <span className={`font-bold text-lg ${lightStyles.text}`}>{lightStyles.label}</span>
            </div>
            <p className={`text-sm ${lightStyles.text}`}>{lightStyles.description}</p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              {getActionIcon()}
              <span className="font-bold text-slate-800 capitalize">
                {progressionDecision.action === 'progress' ? 'Progrediera' :
                  progressionDecision.action === 'regress' ? 'Regressera' :
                    progressionDecision.action === 'pause' ? 'Pausa' : 'Behåll'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Volym: {Math.round(progressionDecision.volumeMultiplier * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className={`text-xl font-bold ${
            recentData.avgPainDuring <= 3 ? 'text-green-600' :
              recentData.avgPainDuring <= 5 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {recentData.avgPainDuring}
          </div>
          <div className="text-xs text-slate-500">Smärta under</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className={`text-xl font-bold ${
            recentData.avgPainAfter <= 3 ? 'text-green-600' :
              recentData.avgPainAfter <= 5 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {recentData.avgPainAfter}
          </div>
          <div className="text-xs text-slate-500">Smärta efter</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className={`text-xl font-bold ${
            recentData.completionRate >= 80 ? 'text-green-600' :
              recentData.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {recentData.completionRate}%
          </div>
          <div className="text-xs text-slate-500">Följsamhet</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className="text-xl font-bold text-slate-700 capitalize">
            {recentData.perceivedEffort === 'för_svårt' ? 'Svårt' : recentData.perceivedEffort}
          </div>
          <div className="text-xs text-slate-500">Upplevd nivå</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl mb-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-slate-800 mb-1">Rekommendation</div>
            <p className="text-sm text-slate-600">{progressionDecision.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {progressionDecision.warnings && progressionDecision.warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800 mb-2">Tänk på</div>
              <ul className="space-y-1">
                {progressionDecision.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Phase Transition Status */}
      {phaseTransition && currentPhase < 3 && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-indigo-800">
              Kriterier för Fas {currentPhase + 1}
            </div>
            {phaseTransition.readyToProgress ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Redo att progrediera!
              </span>
            ) : (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                {phaseTransition.unmetCriteria.length} kriterier kvar
              </span>
            )}
          </div>

          <div className="space-y-2">
            {phaseTransition.metCriteria.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                {c}
              </div>
            ))}
            {phaseTransition.unmetCriteria.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                <XCircle className="w-4 h-4" />
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          Vetenskaplig grund
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
      </button>

      {showDetails && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-3">
          <div>
            <div className="font-medium text-slate-700 mb-1">Evidens</div>
            <p>{progressionDecision.evidence}</p>
          </div>
          <div>
            <div className="font-medium text-slate-700 mb-1">Nästa utvärdering</div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {progressionDecision.nextEvaluation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressionTracker;
