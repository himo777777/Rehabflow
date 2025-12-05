/**
 * PSFS (Patient-Specific Functional Scale) Assessment Component
 *
 * Allows patients to identify and rate their own functional goals
 * Used for personalized outcome tracking and program adaptation
 *
 * Features:
 * - Patient selects 3-5 activities important to them
 * - Rates ability to perform each (0-10 scale)
 * - Tracks progress over time with reassessments
 * - MCID = 2-3 points change
 *
 * @component
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Save,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Edit3,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

interface FunctionalActivity {
  id: string;
  name: string;
  currentScore: number;
  previousScore?: number;
  createdAt: Date;
  isCustom: boolean;
}

interface PSFSResults {
  activities: FunctionalActivity[];
  averageScore: number;
  completedAt: Date;
}

interface PSFSAssessmentProps {
  onComplete?: (results: PSFSResults) => void;
  onCancel?: () => void;
  isReassessment?: boolean;
  previousActivities?: FunctionalActivity[];
}

// Common activity suggestions (Swedish)
const SUGGESTED_ACTIVITIES = [
  'Gå längre sträckor',
  'Gå i trappor',
  'Sitta längre stunder',
  'Stå längre stunder',
  'Lyfta tunga saker',
  'Arbeta vid datorn',
  'Köra bil',
  'Sova utan avbrott',
  'Utföra hushållsarbete',
  'Träna eller idrotta',
  'Leka med barn/barnbarn',
  'Gå på promenader',
  'Cykla',
  'Bära matkassar',
  'Klä på mig',
  'Böja mig ned',
  'Sträcka mig uppåt',
  'Arbeta i trädgården',
  'Ha sex',
  'Umgås socialt'
];

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const ScoreSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  previousValue?: number;
}> = ({ value, onChange, previousValue }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    if (score >= 3) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const change = previousValue !== undefined ? value - previousValue : null;

  return (
    <div className="space-y-3">
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Kan inte utföra</span>
        <span>Kan utföra som innan skadan</span>
      </div>

      {/* Slider */}
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${
              value <= 2 ? '#ef4444' : value <= 4 ? '#f97316' : value <= 7 ? '#eab308' : '#22c55e'
            } 0%, ${
              value <= 2 ? '#ef4444' : value <= 4 ? '#f97316' : value <= 7 ? '#eab308' : '#22c55e'
            } ${value * 10}%, #e5e7eb ${value * 10}%, #e5e7eb 100%)`
          }}
        />

        {/* Previous value marker */}
        {previousValue !== undefined && (
          <div
            className="absolute top-0 w-0.5 h-4 bg-gray-400"
            style={{ left: `${previousValue * 10}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
              Förra: {previousValue}
            </div>
          </div>
        )}
      </div>

      {/* Score display */}
      <div className="flex items-center justify-center gap-4">
        <div className={`text-4xl font-bold ${
          value >= 8 ? 'text-green-600' :
          value >= 5 ? 'text-yellow-600' :
          value >= 3 ? 'text-orange-600' :
          'text-red-600'
        }`}>
          {value}
        </div>
        <span className="text-gray-500">/ 10</span>

        {change !== null && change !== 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
            change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
            {change > 0 ? '+' : ''}{change}
          </div>
        )}
      </div>

      {/* Scale numbers */}
      <div className="flex justify-between text-xs text-gray-400">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
};

const ActivityCard: React.FC<{
  activity: FunctionalActivity;
  onScoreChange: (score: number) => void;
  onRemove: () => void;
  canRemove: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ activity, onScoreChange, onRemove, canRemove, isExpanded, onToggle }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-gray-900">{activity.name}</span>
          {activity.isCustom && (
            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
              Egen
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold ${
            activity.currentScore >= 8 ? 'text-green-600' :
            activity.currentScore >= 5 ? 'text-yellow-600' :
            activity.currentScore >= 3 ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {activity.currentScore}/10
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <ScoreSlider
            value={activity.currentScore}
            onChange={onScoreChange}
            previousValue={activity.previousScore}
          />

          {canRemove && (
            <button
              onClick={onRemove}
              className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Ta bort aktivitet
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PSFSAssessment: React.FC<PSFSAssessmentProps> = ({
  onComplete,
  onCancel,
  isReassessment = false,
  previousActivities = []
}) => {
  const [activities, setActivities] = useState<FunctionalActivity[]>([]);
  const [customActivity, setCustomActivity] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<PSFSResults | null>(null);

  // Initialize with previous activities for reassessment
  useEffect(() => {
    if (isReassessment && previousActivities.length > 0) {
      setActivities(previousActivities.map(a => ({
        ...a,
        previousScore: a.currentScore,
        currentScore: a.currentScore // Will be updated by user
      })));
    }
  }, [isReassessment, previousActivities]);

  // Add activity from suggestions
  const addActivity = useCallback((name: string, isCustom: boolean = false) => {
    if (activities.length >= 5) {
      return;
    }

    // Check if already added
    if (activities.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const newActivity: FunctionalActivity = {
      id: `activity-${Date.now()}`,
      name,
      currentScore: 5,
      createdAt: new Date(),
      isCustom
    };

    setActivities(prev => [...prev, newActivity]);
    setExpandedActivityId(newActivity.id);
    setShowSuggestions(false);
    setCustomActivity('');
  }, [activities]);

  // Add custom activity
  const handleAddCustom = useCallback(() => {
    if (customActivity.trim()) {
      addActivity(customActivity.trim(), true);
    }
  }, [customActivity, addActivity]);

  // Remove activity
  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  // Update score
  const updateScore = useCallback((id: string, score: number) => {
    setActivities(prev => prev.map(a =>
      a.id === id ? { ...a, currentScore: score } : a
    ));
  }, []);

  // Calculate average
  const averageScore = activities.length > 0
    ? activities.reduce((sum, a) => sum + a.currentScore, 0) / activities.length
    : 0;

  // Complete assessment
  const handleComplete = useCallback(async () => {
    if (activities.length < 3) {
      return;
    }

    const calculatedResults: PSFSResults = {
      activities,
      averageScore,
      completedAt: new Date()
    };

    setResults(calculatedResults);
    setIsComplete(true);

    // Save to database
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save assessment
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            assessment_type: 'PSFS',
            completed_at: calculatedResults.completedAt.toISOString(),
            average_score: calculatedResults.averageScore,
            is_reassessment: isReassessment
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;

        // Save activities
        if (assessment) {
          const activityRecords = activities.map(a => ({
            assessment_id: assessment.id,
            activity_name: a.name,
            score: a.currentScore,
            previous_score: a.previousScore,
            is_custom: a.isCustom
          }));

          await supabase.from('psfs_activities').insert(activityRecords);
        }
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
    } finally {
      setIsSaving(false);
    }

    if (onComplete) {
      onComplete(calculatedResults);
    }
  }, [activities, averageScore, isReassessment, onComplete]);

  // Filter available suggestions
  const availableSuggestions = SUGGESTED_ACTIVITIES.filter(
    s => !activities.some(a => a.name.toLowerCase() === s.toLowerCase())
  );

  // ============================================================================
  // RENDER - RESULTS VIEW
  // ============================================================================

  if (isComplete && results) {
    const overallChange = isReassessment
      ? results.averageScore - (previousActivities.reduce((sum, a) => sum + a.currentScore, 0) / previousActivities.length)
      : null;

    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PSFS Resultat</h1>
          <p className="text-gray-600 mt-2">
            {isReassessment ? 'Omvärdering genomförd' : 'Funktionella mål fastställda'}
          </p>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Genomsnittlig funktionsnivå</p>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-6xl font-bold ${
              results.averageScore >= 8 ? 'text-green-600' :
              results.averageScore >= 5 ? 'text-yellow-600' :
              results.averageScore >= 3 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {results.averageScore.toFixed(1)}
            </span>
            <span className="text-2xl text-gray-500">/ 10</span>

            {overallChange !== null && Math.abs(overallChange) >= 0.1 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-lg font-semibold ${
                overallChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <TrendingUp className={`w-5 h-5 ${overallChange < 0 ? 'rotate-180' : ''}`} />
                {overallChange > 0 ? '+' : ''}{overallChange.toFixed(1)}
              </div>
            )}
          </div>

          {overallChange !== null && overallChange >= 2 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Kliniskt signifikant förbättring (MCID uppnådd)</span>
            </div>
          )}
        </div>

        {/* Activity Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Dina aktiviteter</h3>
          {results.activities.map(activity => {
            const change = activity.previousScore !== undefined
              ? activity.currentScore - activity.previousScore
              : null;

            return (
              <div
                key={activity.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">{activity.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    activity.currentScore >= 8 ? 'text-green-600' :
                    activity.currentScore >= 5 ? 'text-yellow-600' :
                    activity.currentScore >= 3 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {activity.currentScore}/10
                  </span>

                  {change !== null && change !== 0 && (
                    <span className={`text-sm font-medium ${
                      change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({change > 0 ? '+' : ''}{change})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* MCID Explanation */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tolkning</h3>
          <p className="text-sm text-gray-600">
            <strong>MCID (Minimal Clinically Important Difference):</strong> En förändring på 2-3 poäng
            anses vara kliniskt betydelsefull. Förbättringar på denna nivå indikerar verklig
            funktionsförbättring som märks i vardagen.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tillbaka till översikt
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - ASSESSMENT VIEW
  // ============================================================================

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isReassessment ? 'PSFS Omvärdering' : 'PSFS - Patientspecifik Funktionsskala'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isReassessment
              ? 'Värdera dina aktiviteter igen för att mäta framsteg'
              : 'Välj 3-5 aktiviteter som är viktiga för dig och gradera din förmåga'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Avbryt
        </button>
      </div>

      {/* Progress indicator */}
      <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between">
        <span className="text-indigo-800 font-medium">
          {activities.length} av minst 3 aktiviteter valda
        </span>
        {activities.length < 3 && (
          <span className="text-sm text-indigo-600">Välj minst {3 - activities.length} till</span>
        )}
        {activities.length >= 3 && activities.length < 5 && (
          <span className="text-sm text-green-600">✓ Du kan lägga till upp till {5 - activities.length} till</span>
        )}
        {activities.length >= 5 && (
          <span className="text-sm text-green-600">✓ Maximalt antal aktiviteter</span>
        )}
      </div>

      {/* Activities list */}
      {activities.length > 0 && (
        <div className="space-y-3">
          {activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onScoreChange={(score) => updateScore(activity.id, score)}
              onRemove={() => removeActivity(activity.id)}
              canRemove={!isReassessment && activities.length > 0}
              isExpanded={expandedActivityId === activity.id}
              onToggle={() => setExpandedActivityId(
                expandedActivityId === activity.id ? null : activity.id
              )}
            />
          ))}
        </div>
      )}

      {/* Add activity section */}
      {!isReassessment && activities.length < 5 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Lägg till aktivitet
          </h3>

          {/* Custom activity input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="Skriv in egen aktivitet..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customActivity.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Lägg till
            </button>
          </div>

          {/* Suggestions toggle */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {showSuggestions ? 'Dölj' : 'Visa'} förslag
            {showSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Suggestions grid */}
          {showSuggestions && (
            <div className="grid grid-cols-2 gap-2">
              {availableSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => addActivity(suggestion, false)}
                  className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Average score preview */}
      {activities.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-gray-700">Genomsnittlig poäng:</span>
          <span className={`text-2xl font-bold ${
            averageScore >= 8 ? 'text-green-600' :
            averageScore >= 5 ? 'text-yellow-600' :
            averageScore >= 3 ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {averageScore.toFixed(1)}/10
          </span>
        </div>
      )}

      {/* Complete button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={activities.length < 3 || isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>Sparar...</>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Slutför bedömning
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PSFSAssessment;
