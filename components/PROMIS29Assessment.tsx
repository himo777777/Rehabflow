/**
 * PROMIS-29 Assessment Component
 *
 * Comprehensive health assessment with 29 items across 8 domains
 * Calculates T-scores and provides clinical interpretation
 *
 * @component
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Activity,
  Brain,
  Heart,
  Moon,
  Users,
  Zap,
  Target,
  BarChart3,
  Save
} from 'lucide-react';
import {
  PROMIS29_QUESTIONS,
  PROMIS29_BY_DOMAIN,
  PROMIS29_SCORING,
  PROMIS29_DOMAINS,
  PROMIS29Domain,
  interpretTScore
} from '../data/promis29Questions';
import { supabase } from '../services/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

interface DomainScore {
  domain: PROMIS29Domain;
  rawScore: number;
  tScore: number;
  severity: {
    level: string;
    color: string;
    description: string;
  };
}

interface PROMIS29Results {
  domainScores: DomainScore[];
  painIntensity: number;
  completedAt: Date;
  totalTime: number; // seconds
}

interface PROMIS29AssessmentProps {
  onComplete?: (results: PROMIS29Results) => void;
  onCancel?: () => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const DomainIcon: React.FC<{ domain: string }> = ({ domain }) => {
  const icons: Record<string, React.ReactNode> = {
    'Physical Function': <Activity className="w-5 h-5" />,
    'Anxiety': <Brain className="w-5 h-5" />,
    'Depression': <Heart className="w-5 h-5" />,
    'Fatigue': <Zap className="w-5 h-5" />,
    'Sleep Disturbance': <Moon className="w-5 h-5" />,
    'Social Roles': <Users className="w-5 h-5" />,
    'Pain Interference': <Target className="w-5 h-5" />,
    'Pain Intensity': <AlertCircle className="w-5 h-5" />
  };
  return <>{icons[domain] || <ClipboardList className="w-5 h-5" />}</>;
};

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const ScoreGauge: React.FC<{ score: number; domain: string; severity: { level: string; color: string } }> = ({
  score,
  domain,
  severity
}) => {
  const isNegative = ['Anxiety', 'Depression', 'Fatigue', 'Sleep Disturbance', 'Pain Interference'].includes(domain);

  // For visualization: show where 50 is center (population mean)
  const offset = score - 50;
  const barWidth = Math.abs(offset) * 2;
  const barPosition = offset >= 0 ? 50 : 50 - barWidth;

  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{isNegative ? 'Bättre' : 'Sämre'}</span>
        <span>50</span>
        <span>{isNegative ? 'Sämre' : 'Bättre'}</span>
      </div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300" />
        {/* Score bar */}
        <div
          className={`absolute h-full ${colorMap[severity.color]} transition-all duration-500`}
          style={{
            left: `${barPosition}%`,
            width: `${barWidth}%`
          }}
        />
        {/* Score marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-800 rounded"
          style={{ left: `${((score - 20) / 60) * 100}%` }}
        />
      </div>
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-900">{score.toFixed(1)}</span>
        <span className="text-sm text-gray-500 ml-1">T-score</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PROMIS29Assessment: React.FC<PROMIS29AssessmentProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<PROMIS29Results | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = PROMIS29_QUESTIONS[currentQuestionIndex];
  const totalQuestions = PROMIS29_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  // Calculate progress by domain
  const domainProgress = useMemo(() => {
    const progress: Record<string, { answered: number; total: number }> = {};
    PROMIS29_DOMAINS.forEach(domain => {
      const domainQuestions = PROMIS29_BY_DOMAIN[domain];
      const answered = domainQuestions.filter(q => answers[q.id] !== undefined).length;
      progress[domain] = { answered, total: domainQuestions.length };
    });
    return progress;
  }, [answers]);

  // Handle answer selection
  const handleAnswer = useCallback((value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Auto-advance to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  }, [currentQuestion, currentQuestionIndex, totalQuestions]);

  // Navigate questions
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }, [totalQuestions]);

  // Calculate scores
  const calculateScores = useCallback((): PROMIS29Results => {
    const domainScores: DomainScore[] = [];
    let painIntensity = 0;

    PROMIS29_DOMAINS.forEach(domain => {
      if (domain === 'Pain Intensity') {
        // Pain intensity is a single 0-10 scale item
        painIntensity = answers['PAININT'] || 0;
        return;
      }

      const questions = PROMIS29_BY_DOMAIN[domain];
      let rawScore = 0;

      questions.forEach(q => {
        const answer = answers[q.id];
        if (answer !== undefined) {
          // Handle reverse scoring
          rawScore += q.reverse ? (6 - answer) : answer;
        }
      });

      // Get T-score from lookup table
      const scoring = PROMIS29_SCORING[domain as keyof typeof PROMIS29_SCORING];
      const tScore = scoring?.rawToTScore[rawScore as keyof typeof scoring.rawToTScore] || 50;
      const severity = interpretTScore(domain, tScore);

      domainScores.push({
        domain,
        rawScore,
        tScore,
        severity
      });
    });

    return {
      domainScores,
      painIntensity,
      completedAt: new Date(),
      totalTime: Math.round((Date.now() - startTime) / 1000)
    };
  }, [answers, startTime]);

  // Complete assessment
  const handleComplete = useCallback(async () => {
    if (answeredCount < totalQuestions) {
      return;
    }

    const calculatedResults = calculateScores();
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
            assessment_type: 'PROMIS-29',
            completed_at: calculatedResults.completedAt.toISOString(),
            duration_seconds: calculatedResults.totalTime,
            answers: answers,
            pain_intensity: calculatedResults.painIntensity
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;

        // Save domain scores
        if (assessment) {
          const scoreRecords = calculatedResults.domainScores.map(ds => ({
            assessment_id: assessment.id,
            domain: ds.domain,
            raw_score: ds.rawScore,
            t_score: ds.tScore,
            severity: ds.severity.level
          }));

          await supabase.from('assessment_scores').insert(scoreRecords);
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
  }, [answeredCount, totalQuestions, calculateScores, answers, onComplete]);

  // ============================================================================
  // RENDER - RESULTS VIEW
  // ============================================================================

  if (isComplete && results) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PROMIS-29 Resultat</h1>
          <p className="text-gray-600 mt-2">
            Genomfört på {Math.floor(results.totalTime / 60)} min {results.totalTime % 60} sek
          </p>
        </div>

        {/* Pain Intensity */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Smärtintensitet
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${results.painIntensity * 10}%` }}
              />
            </div>
            <span className="text-3xl font-bold text-gray-900">{results.painIntensity}/10</span>
          </div>
        </div>

        {/* Domain Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.domainScores.map((ds) => (
            <div
              key={ds.domain}
              className={`bg-white rounded-xl p-6 border-2 ${
                ds.severity.color === 'green' ? 'border-green-200' :
                ds.severity.color === 'yellow' ? 'border-yellow-200' :
                ds.severity.color === 'orange' ? 'border-orange-200' :
                'border-red-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  ds.severity.color === 'green' ? 'bg-green-100 text-green-600' :
                  ds.severity.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  ds.severity.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <DomainIcon domain={ds.domain} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{ds.domain}</h3>
                  <p className={`text-sm ${
                    ds.severity.color === 'green' ? 'text-green-600' :
                    ds.severity.color === 'yellow' ? 'text-yellow-600' :
                    ds.severity.color === 'orange' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {ds.severity.description}
                  </p>
                </div>
              </div>
              <ScoreGauge score={ds.tScore} domain={ds.domain} severity={ds.severity} />
            </div>
          ))}
        </div>

        {/* Interpretation Guide */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Tolkning av T-scores
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            PROMIS T-scores har ett genomsnitt på 50 och standardavvikelse på 10, baserat på den allmänna befolkningen.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-green-100 rounded-lg p-3">
              <p className="font-semibold text-green-800">Normalt</p>
              <p className="text-green-600">T-score nära 50</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <p className="font-semibold text-yellow-800">Milt</p>
              <p className="text-yellow-600">T-score 55-60</p>
            </div>
            <div className="bg-orange-100 rounded-lg p-3">
              <p className="font-semibold text-orange-800">Måttligt</p>
              <p className="text-orange-600">T-score 60-70</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <p className="font-semibold text-red-800">Allvarligt</p>
              <p className="text-red-600">T-score {">"} 70</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skriv ut resultat
          </button>
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
  // RENDER - QUESTION VIEW
  // ============================================================================

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">PROMIS-29</h1>
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Avbryt
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Fråga {currentQuestionIndex + 1} av {totalQuestions}</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}% klart</span>
          </div>
          <ProgressBar current={answeredCount} total={totalQuestions} />
        </div>
      </div>

      {/* Domain indicator */}
      <div className="flex items-center gap-2 text-sm text-indigo-600 mb-6">
        <DomainIcon domain={currentQuestion.domain} />
        <span className="font-medium">{currentQuestion.domain}</span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <h2 className="text-xl text-gray-900 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={isSelected ? 'font-medium' : ''}>{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToQuestion(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Föregående
        </button>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={() => goToQuestion(currentQuestionIndex + 1)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Nästa
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={answeredCount < totalQuestions || isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>Sparar...</>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Slutför
              </>
            )}
          </button>
        )}
      </div>

      {/* Question navigation dots */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {PROMIS29_QUESTIONS.map((_, index) => {
          const isAnswered = answers[PROMIS29_QUESTIONS[index].id] !== undefined;
          const isCurrent = index === currentQuestionIndex;
          return (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                isCurrent
                  ? 'bg-indigo-600 scale-125'
                  : isAnswered
                    ? 'bg-indigo-300'
                    : 'bg-gray-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PROMIS29Assessment;
