/**
 * Phase Transition Checker
 *
 * Dedikerad komponent för att visa och utvärdera:
 * - Nuvarande status mot faskriterier
 * - "Redo att progrediera" eller "X kriterier kvar"
 * - Detaljerad checklist med uppfyllda/ej uppfyllda kriterier
 */

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Activity,
  Target,
  Award,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { PHASE_TRANSITION_CRITERIA, evaluatePhaseTransition } from '../services/progressionService';

interface PhaseTransitionCheckerProps {
  /** Current rehabilitation phase (1, 2, or 3) */
  currentPhase: 1 | 2 | 3;
  /** Days spent in current phase */
  daysInPhase: number;
  /** Callback when ready to progress */
  onProgressRequest?: () => void;
  /** Compact mode */
  compact?: boolean;
}

interface CriterionStatus {
  criterion: string;
  met: boolean;
  detail?: string;
  value?: number | string;
  target?: number | string;
}

const PhaseTransitionChecker: React.FC<PhaseTransitionCheckerProps> = ({
  currentPhase,
  daysInPhase,
  onProgressRequest,
  compact = false
}) => {
  const [showAllCriteria, setShowAllCriteria] = useState(false);

  // Get criteria for current phase
  const phaseCriteria = PHASE_TRANSITION_CRITERIA[currentPhase];

  // Evaluate all criteria
  const criteriaStatus = useMemo((): CriterionStatus[] => {
    const painHistory = storageService.getPainHistory();
    const progressHistory = storageService.getHistorySync();
    const exerciseHistory = storageService.getDetailedExerciseHistory();

    // Calculate recent pain average (last 7 days)
    const recentDates = Object.keys(painHistory)
      .sort()
      .reverse()
      .slice(0, 7);

    let totalPain = 0;
    let painCount = 0;
    recentDates.forEach(date => {
      const log = painHistory[date];
      if (log?.postWorkout?.painLevel !== undefined) {
        totalPain += log.postWorkout.painLevel;
        painCount++;
      }
    });
    const avgPain = painCount > 0 ? totalPain / painCount : 5;

    // Calculate completion rate
    const recentProgressDates = Object.keys(progressHistory)
      .sort()
      .reverse()
      .slice(0, 14);

    let completedDays = 0;
    recentProgressDates.forEach(date => {
      const dayProgress = progressHistory[date];
      const completed = Object.values(dayProgress).filter(v => v === true).length;
      const total = Object.keys(dayProgress).length;
      if (total > 0 && completed / total >= 0.5) {
        completedDays++;
      }
    });
    const completionRate = recentProgressDates.length > 0
      ? Math.round((completedDays / recentProgressDates.length) * 100)
      : 50;

    // Determine exercise quality based on difficulty feedback
    const allLogs = Object.values(exerciseHistory).flat();
    const recentLogs = allLogs.slice(-20);
    const easyCount = recentLogs.filter(l => l.difficulty === 'lagom').length;
    const qualityScore = recentLogs.length > 0 ? easyCount / recentLogs.length : 0.5;

    let exerciseQuality: string;
    if (qualityScore >= 0.8) exerciseQuality = 'utmärkt';
    else if (qualityScore >= 0.6) exerciseQuality = 'god';
    else if (qualityScore >= 0.4) exerciseQuality = 'acceptabel';
    else exerciseQuality = 'dålig';

    const criteria: CriterionStatus[] = [];

    // 1. Days in phase
    criteria.push({
      criterion: `Minst ${phaseCriteria.minDaysInPhase} dagar i nuvarande fas`,
      met: daysInPhase >= phaseCriteria.minDaysInPhase,
      value: daysInPhase,
      target: phaseCriteria.minDaysInPhase,
      detail: `Du har varit i fas ${currentPhase} i ${daysInPhase} dagar`
    });

    // 2. Pain level
    criteria.push({
      criterion: `Smärta under ${phaseCriteria.maxPainLevel} VAS`,
      met: Math.round(avgPain * 10) / 10 <= phaseCriteria.maxPainLevel,
      value: Math.round(avgPain * 10) / 10,
      target: phaseCriteria.maxPainLevel,
      detail: `Genomsnittlig smärta senaste veckan: ${Math.round(avgPain * 10) / 10}`
    });

    // 3. Completion rate
    criteria.push({
      criterion: `Minst ${phaseCriteria.minCompletionRate}% följsamhet`,
      met: completionRate >= phaseCriteria.minCompletionRate,
      value: `${completionRate}%`,
      target: `${phaseCriteria.minCompletionRate}%`,
      detail: `Du har genomfört ${completionRate}% av planerade pass`
    });

    // 4. Exercise quality
    const qualityOrder = ['dålig', 'acceptabel', 'god', 'utmärkt'];
    const currentQualityIndex = qualityOrder.indexOf(exerciseQuality);
    const requiredQualityIndex = qualityOrder.indexOf(phaseCriteria.requiredQuality);

    criteria.push({
      criterion: `Övningskvalitet: ${phaseCriteria.requiredQuality} eller bättre`,
      met: currentQualityIndex >= requiredQualityIndex,
      value: exerciseQuality,
      target: phaseCriteria.requiredQuality,
      detail: `Din övningskvalitet bedöms som "${exerciseQuality}"`
    });

    // 5. Specific criteria
    phaseCriteria.specificCriteria.forEach((spec, idx) => {
      // These are typically subjective - for now show as pending/unchecked
      criteria.push({
        criterion: spec,
        met: false, // Would need manual confirmation or specific data
        detail: 'Kräver klinisk bedömning'
      });
    });

    return criteria;
  }, [currentPhase, daysInPhase, phaseCriteria]);

  // Calculate overall readiness
  const readiness = useMemo(() => {
    const metCount = criteriaStatus.filter(c => c.met).length;
    const totalObjective = 4; // First 4 criteria are objective
    const objectiveMet = criteriaStatus.slice(0, 4).filter(c => c.met).length;

    return {
      metCount,
      totalCount: criteriaStatus.length,
      objectiveMet,
      totalObjective,
      percentage: Math.round((objectiveMet / totalObjective) * 100),
      ready: objectiveMet >= 3 && currentPhase < 3 // 3 of 4 objective criteria
    };
  }, [criteriaStatus, currentPhase]);

  // Phase colors
  const phaseColors = {
    1: { bg: 'from-red-50 to-orange-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
    2: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    3: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' }
  };

  const currentColors = phaseColors[currentPhase];
  const nextPhase = Math.min(currentPhase + 1, 3) as 1 | 2 | 3;
  const nextColors = phaseColors[nextPhase];

  // Phase names
  const phaseNames = {
    1: 'Skyddsfas',
    2: 'Läkningsfas',
    3: 'Funktionsfas'
  };

  if (currentPhase === 3) {
    // Already in final phase
    return (
      <div className={`bg-gradient-to-br ${currentColors.bg} rounded-2xl border ${currentColors.border} ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-xl">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Funktionsfasen (Fas 3)</h3>
            <p className="text-sm text-slate-500">Du är i den sista rehabiliteringsfasen</p>
          </div>
        </div>

        <div className="bg-white/70 rounded-xl p-4">
          <p className="text-sm text-slate-600">
            Fokusera på att uppnå full funktionalitet och återgång till dina normala aktiviteter.
            Mål för denna fas:
          </p>
          <ul className="mt-3 space-y-2">
            {phaseCriteria.specificCriteria.map((goal, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                <Target className="w-4 h-4 text-green-500 flex-shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${currentColors.bg} rounded-2xl border ${currentColors.border} ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Fas-övergång</h3>
            <p className="text-sm text-slate-500">
              {phaseNames[currentPhase]} <ArrowRight className="w-3 h-3 inline" /> {phaseNames[nextPhase]}
            </p>
          </div>
        </div>

        {/* Readiness badge */}
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
          readiness.ready
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {readiness.ready ? (
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Redo!
            </span>
          ) : (
            `${readiness.objectiveMet}/${readiness.totalObjective} kriterier`
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Kriterier uppfyllda</span>
          <span className="font-bold text-slate-800">{readiness.percentage}%</span>
        </div>
        <div className="h-3 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              readiness.percentage >= 75 ? 'bg-green-500' :
                readiness.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-400'
            }`}
            style={{ width: `${readiness.percentage}%` }}
          />
        </div>
      </div>

      {/* Criteria checklist */}
      <div className="space-y-3 mb-6">
        {criteriaStatus.slice(0, showAllCriteria ? undefined : 4).map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
              item.met ? 'bg-green-100/50' : 'bg-white/50'
            }`}
          >
            {item.met ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${item.met ? 'text-green-800' : 'text-slate-700'}`}>
                {item.criterion}
              </div>
              {item.detail && (
                <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>
              )}
            </div>
            {item.value !== undefined && (
              <div className="text-right">
                <div className={`font-bold text-sm ${item.met ? 'text-green-600' : 'text-slate-600'}`}>
                  {item.value}
                </div>
                <div className="text-xs text-slate-400">mål: {item.target}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show more toggle */}
      {criteriaStatus.length > 4 && (
        <button
          onClick={() => setShowAllCriteria(!showAllCriteria)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          {showAllCriteria ? 'Visa färre' : `Visa ${criteriaStatus.length - 4} fler kriterier`}
          <ChevronRight className={`w-4 h-4 transition-transform ${showAllCriteria ? 'rotate-90' : ''}`} />
        </button>
      )}

      {/* Progress button */}
      {readiness.ready && onProgressRequest && (
        <button
          onClick={onProgressRequest}
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          Progrediera till {phaseNames[nextPhase]}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* Info note */}
      {!readiness.ready && (
        <div className="mt-4 p-3 bg-white/50 rounded-xl flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Uppfyll de objektiva kriterierna för att låsa upp fas-övergång.
            Kliniska kriterier kan kräva bedömning av din fysioterapeut.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhaseTransitionChecker;
