/**
 * Dosing Assistant Panel
 *
 * Interaktiv UI för att få evidensbaserade doseringsrekommendationer
 * baserat på fas, övningstyp, smärtnivå och patientförutsättningar.
 */

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Activity,
  Clock,
  Repeat,
  Zap,
  Timer,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import {
  getDosingRecommendation,
  DosingRecommendation,
  DosingParameters,
  ExerciseCategory,
  PHASE_GUIDELINES
} from '../services/dosingService';

interface DosingPanelProps {
  /** Initial values for the form */
  initialPhase?: 1 | 2 | 3;
  initialPainLevel?: number;
  initialExerciseType?: ExerciseCategory;
  /** Callback when dosing is calculated */
  onDosingCalculated?: (dosing: DosingRecommendation) => void;
  /** Compact mode for embedding in other components */
  compact?: boolean;
}

const EXERCISE_TYPES: { value: ExerciseCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'styrka', label: 'Styrka', icon: <Zap className="w-4 h-4" /> },
  { value: 'rörlighet', label: 'Rörlighet', icon: <Activity className="w-4 h-4" /> },
  { value: 'stabilitet', label: 'Stabilitet', icon: <Activity className="w-4 h-4" /> },
  { value: 'balans', label: 'Balans', icon: <Activity className="w-4 h-4" /> },
  { value: 'uthållighet', label: 'Uthållighet', icon: <Timer className="w-4 h-4" /> },
  { value: 'stretching', label: 'Stretching', icon: <Activity className="w-4 h-4" /> },
  { value: 'isometrisk', label: 'Isometrisk', icon: <Zap className="w-4 h-4" /> },
  { value: 'plyometri', label: 'Plyometri', icon: <Zap className="w-4 h-4" /> }
];

const PHASE_INFO = [
  { phase: 1, name: 'Skyddsfas', description: 'Smärtlindring & skydd', color: 'bg-red-100 text-red-700 border-red-200' },
  { phase: 2, name: 'Läkningsfas', description: 'Gradvis styrkeökning', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { phase: 3, name: 'Funktionsfas', description: 'Full återgång', color: 'bg-green-100 text-green-700 border-green-200' }
];

const DosingPanel: React.FC<DosingPanelProps> = ({
  initialPhase = 1,
  initialPainLevel = 5,
  initialExerciseType = 'styrka',
  onDosingCalculated,
  compact = false
}) => {
  // Form state
  const [phase, setPhase] = useState<1 | 2 | 3>(initialPhase);
  const [exerciseType, setExerciseType] = useState<ExerciseCategory>(initialExerciseType);
  const [painLevel, setPainLevel] = useState(initialPainLevel);
  const [age, setAge] = useState<number | undefined>(undefined);
  const [isPostOp, setIsPostOp] = useState(false);
  const [daysSinceSurgery, setDaysSinceSurgery] = useState<number>(14);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  // Calculate dosing recommendation
  const dosing = useMemo(() => {
    const params: DosingParameters = {
      phase,
      exerciseType,
      painLevel,
      patientAge: age,
      isPostOp,
      daysSinceSurgery: isPostOp ? daysSinceSurgery : undefined
    };

    const result = getDosingRecommendation(params);
    onDosingCalculated?.(result);
    return result;
  }, [phase, exerciseType, painLevel, age, isPostOp, daysSinceSurgery, onDosingCalculated]);

  const currentPhaseInfo = PHASE_INFO.find(p => p.phase === phase);
  const currentPhaseGuideline = PHASE_GUIDELINES.find(p => p.phase === phase);

  // Pain level color
  const getPainColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-xl">
          <Sliders className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Doserings-assistent</h3>
          <p className="text-sm text-slate-500">Evidensbaserad träningsdosering</p>
        </div>
      </div>

      {/* Phase Selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Rehabiliteringsfas
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PHASE_INFO.map((p) => (
            <button
              key={p.phase}
              onClick={() => setPhase(p.phase as 1 | 2 | 3)}
              className={`p-3 rounded-xl border-2 transition-all ${
                phase === p.phase
                  ? `${p.color} border-current`
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-lg font-bold">Fas {p.phase}</div>
              <div className="text-xs opacity-80">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Type */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Övningstyp
        </label>
        <div className="grid grid-cols-4 gap-2">
          {EXERCISE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setExerciseType(type.value)}
              className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                exerciseType === type.value
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {type.icon}
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pain Level */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Smärtnivå (VAS)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-200 via-yellow-200 to-red-200"
          />
          <span className={`text-2xl font-bold ${getPainColor(painLevel)}`}>
            {painLevel}/10
          </span>
        </div>
        {painLevel >= 7 && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Hög smärta - dosering reduceras automatiskt
          </p>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Avancerade alternativ
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-xl mb-5">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Ålder (valfritt)
            </label>
            <input
              type="number"
              min="18"
              max="100"
              placeholder="T.ex. 65"
              value={age || ''}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            {age && age >= 65 && (
              <p className="text-xs text-amber-600 mt-1">
                Dosering anpassas för äldre patient
              </p>
            )}
          </div>

          {/* Post-Op */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPostOp}
                onChange={(e) => setIsPostOp(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Postoperativ patient</span>
            </label>

            {isPostOp && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dagar sedan operation
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={daysSinceSurgery}
                  onChange={(e) => setDaysSinceSurgery(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl p-5 border border-primary-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            Rekommenderad dosering
          </h4>
          <span className={`px-2 py-1 text-xs font-bold rounded-lg ${currentPhaseInfo?.color}`}>
            {currentPhaseInfo?.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Sets */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Repeat className="w-3 h-3" />
              Sets
            </div>
            <div className="text-xl font-bold text-slate-900">{dosing.sets}</div>
          </div>

          {/* Reps */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Activity className="w-3 h-3" />
              Repetitioner
            </div>
            <div className="text-xl font-bold text-slate-900">{dosing.reps}</div>
          </div>

          {/* Intensity */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Zap className="w-3 h-3" />
              Intensitet
            </div>
            <div className="text-lg font-bold text-slate-900">{dosing.intensity}</div>
            <div className="text-xs text-slate-500">RPE {dosing.rpe}</div>
          </div>

          {/* Rest */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Clock className="w-3 h-3" />
              Vila
            </div>
            <div className="text-lg font-bold text-slate-900">{dosing.rest}</div>
          </div>

          {/* Duration (if applicable) */}
          {dosing.duration && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Timer className="w-3 h-3" />
                Tid
              </div>
              <div className="text-lg font-bold text-slate-900">{dosing.duration}</div>
            </div>
          )}

          {/* Frequency */}
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Frekvens
            </div>
            <div className="text-lg font-bold text-slate-900">{dosing.frequency}</div>
          </div>
        </div>

        {/* Rationale Toggle */}
        <button
          onClick={() => setShowRationale(!showRationale)}
          className="mt-4 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
        >
          <BookOpen className="w-4 h-4" />
          {showRationale ? 'Dölj' : 'Visa'} vetenskaplig grund
        </button>

        {showRationale && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-slate-100 space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Motivation</div>
              <p className="text-sm text-slate-700">{dosing.rationale}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Källa</div>
              <p className="text-sm text-slate-600 italic">{dosing.source}</p>
            </div>
            {currentPhaseGuideline && (
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Mål för {currentPhaseInfo?.name}</div>
                <ul className="text-sm text-slate-600 list-disc list-inside">
                  {currentPhaseGuideline.goals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Doseringsrekommendationerna baseras på ACSM 2021, NSCA 2017 och Schoenfeld et al. 2017.
          Individuell anpassning kan behövas baserat på patientens specifika förutsättningar.
        </p>
      </div>
    </div>
  );
};

export default DosingPanel;
