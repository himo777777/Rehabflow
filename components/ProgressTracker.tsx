/**
 * PROGRESS TRACKER COMPONENT
 *
 * Visar patientens framsteg över tid med standardiserade bedömningsskalor.
 * Jämför baseline-värden med nuvarande mätningar och beräknar MCID.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Award, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  ODI_SCALE,
  QUICKDASH_SCALE,
  KOOS_PS_SCALE,
  HOOS_PS_SCALE,
  TSK11_SCALE,
  calculateScore,
  compareResults,
  AssessmentResult,
  AssessmentScale,
} from '../data/assessments/standardizedScales';
import { BaselineAssessmentScore } from '../types';

// ============================================
// TYPES
// ============================================

interface ProgressTrackerProps {
  baselineAssessments?: {
    odi?: BaselineAssessmentScore;
    quickdash?: BaselineAssessmentScore;
    koos?: BaselineAssessmentScore;
    hoos?: BaselineAssessmentScore;
    tsk11?: BaselineAssessmentScore;
  };
  currentAssessments?: {
    odi?: BaselineAssessmentScore;
    quickdash?: BaselineAssessmentScore;
    koos?: BaselineAssessmentScore;
    hoos?: BaselineAssessmentScore;
    tsk11?: BaselineAssessmentScore;
  };
  onTakeAssessment?: (scaleType: string) => void;
}

interface ProgressCardProps {
  scaleName: string;
  scaleDescription: string;
  baseline?: BaselineAssessmentScore;
  current?: BaselineAssessmentScore;
  mcid: number;
  higherIsBetter?: boolean;
  onTakeAssessment?: () => void;
}

// ============================================
// PROGRESS CARD COMPONENT
// ============================================

const ProgressCard: React.FC<ProgressCardProps> = ({
  scaleName,
  scaleDescription,
  baseline,
  current,
  mcid,
  higherIsBetter = false,
  onTakeAssessment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate improvement
  const hasBaseline = baseline !== undefined;
  const hasCurrent = current !== undefined;
  const hasBoth = hasBaseline && hasCurrent;

  let improvement = 0;
  let percentImprovement = 0;
  let isClinicallySignificant = false;
  let trend: 'improving' | 'worsening' | 'stable' = 'stable';

  if (hasBoth && baseline.percentScore !== undefined && current.percentScore !== undefined) {
    const rawDiff = current.percentScore - baseline.percentScore;
    improvement = higherIsBetter ? rawDiff : -rawDiff;
    percentImprovement = Math.abs(improvement);
    isClinicallySignificant = percentImprovement >= mcid;

    if (improvement > 0) {
      trend = 'improving';
    } else if (improvement < 0) {
      trend = 'worsening';
    }
  }

  // Determine color scheme based on trend
  const getColorScheme = () => {
    if (!hasBoth) return 'bg-slate-50 border-slate-200';
    if (trend === 'improving') return 'bg-green-50 border-green-200';
    if (trend === 'worsening') return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const getTrendIcon = () => {
    if (!hasBoth) return <Minus className="w-5 h-5 text-slate-400" />;
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'worsening') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-yellow-600" />;
  };

  const getTrendText = () => {
    if (!hasBoth) return 'Ingen jämförelse';
    if (trend === 'improving') {
      return isClinicallySignificant
        ? `Kliniskt signifikant förbättring (${percentImprovement.toFixed(0)}%)`
        : `Förbättring (${percentImprovement.toFixed(0)}%)`;
    }
    if (trend === 'worsening') {
      return `Försämring (${percentImprovement.toFixed(0)}%)`;
    }
    return 'Stabil';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-4 ${getColorScheme()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{scaleName}</h3>
          <p className="text-sm text-slate-600">{scaleDescription}</p>
        </div>
        {isClinicallySignificant && trend === 'improving' && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            <Award className="w-3 h-3" />
            MCID uppnådd
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="text-xs text-slate-500 uppercase mb-1">Baseline</div>
          {hasBaseline ? (
            <>
              <div className="text-2xl font-bold text-slate-700">
                {baseline.percentScore?.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-500">{baseline.interpretation}</div>
            </>
          ) : (
            <div className="text-sm text-slate-400">Ej mätt</div>
          )}
        </div>

        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="text-xs text-slate-500 uppercase mb-1">Nuvarande</div>
          {hasCurrent ? (
            <>
              <div className="text-2xl font-bold text-slate-700">
                {current.percentScore?.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-500">{current.interpretation}</div>
            </>
          ) : (
            <div className="text-sm text-slate-400">Ej mätt</div>
          )}
        </div>
      </div>

      {/* Trend indicator */}
      <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
        {getTrendIcon()}
        <span className="text-sm font-medium">{getTrendText()}</span>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-full mt-3 text-sm text-slate-500 hover:text-slate-700"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4 mr-1" /> Dölj detaljer
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-1" /> Visa detaljer
          </>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-slate-200"
          >
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                <strong>MCID (Minimal Clinically Important Difference):</strong> {mcid} poäng
              </p>
              {hasBaseline && (
                <p>
                  <strong>Baseline-datum:</strong> {new Date(baseline.date).toLocaleDateString('sv-SE')}
                </p>
              )}
              {hasCurrent && (
                <p>
                  <strong>Senaste mätning:</strong> {new Date(current.date).toLocaleDateString('sv-SE')}
                </p>
              )}
              {baseline?.clinicalImplication && (
                <p className="text-xs bg-blue-50 p-2 rounded">
                  <strong>Klinisk implikation:</strong> {baseline.clinicalImplication}
                </p>
              )}
            </div>

            {onTakeAssessment && (
              <button
                onClick={onTakeAssessment}
                className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Ta ny mätning
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  baselineAssessments,
  currentAssessments,
  onTakeAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'improved' | 'attention'>('all');

  // Define all available scales
  const scales = [
    {
      key: 'odi',
      name: 'ODI (Oswestry)',
      description: 'Ländryggsspecifik funktionsnivå',
      baseline: baselineAssessments?.odi,
      current: currentAssessments?.odi,
      mcid: ODI_SCALE.mcid,
      higherIsBetter: false,
    },
    {
      key: 'quickdash',
      name: 'QuickDASH',
      description: 'Arm/axel/hand funktion',
      baseline: baselineAssessments?.quickdash,
      current: currentAssessments?.quickdash,
      mcid: QUICKDASH_SCALE.mcid,
      higherIsBetter: false,
    },
    {
      key: 'koos',
      name: 'KOOS-PS',
      description: 'Knäfunktion',
      baseline: baselineAssessments?.koos,
      current: currentAssessments?.koos,
      mcid: KOOS_PS_SCALE.mcid,
      higherIsBetter: true,
    },
    {
      key: 'hoos',
      name: 'HOOS-PS',
      description: 'Höftfunktion',
      baseline: baselineAssessments?.hoos,
      current: currentAssessments?.hoos,
      mcid: HOOS_PS_SCALE.mcid,
      higherIsBetter: true,
    },
    {
      key: 'tsk11',
      name: 'TSK-11',
      description: 'Rörelserädsla',
      baseline: baselineAssessments?.tsk11,
      current: currentAssessments?.tsk11,
      mcid: TSK11_SCALE.mcid,
      higherIsBetter: false,
    },
  ];

  // Filter scales based on what's available
  const availableScales = scales.filter(s => s.baseline || s.current);

  // Calculate summary statistics
  const improvedScales = availableScales.filter(s => {
    if (!s.baseline?.percentScore || !s.current?.percentScore) return false;
    const diff = s.current.percentScore - s.baseline.percentScore;
    return s.higherIsBetter ? diff > 0 : diff < 0;
  });

  const attentionScales = availableScales.filter(s => {
    if (!s.baseline?.percentScore || !s.current?.percentScore) return false;
    const diff = s.current.percentScore - s.baseline.percentScore;
    return s.higherIsBetter ? diff < -s.mcid : diff > s.mcid;
  });

  // Filter based on active tab
  const displayedScales = activeTab === 'improved'
    ? improvedScales
    : activeTab === 'attention'
      ? attentionScales
      : availableScales;

  if (availableScales.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50 rounded-xl">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Inga bedömningar tillgängliga
        </h3>
        <p className="text-slate-500 mb-4">
          Genomför din första bedömning för att börja spåra dina framsteg.
        </p>
        {onTakeAssessment && (
          <button
            onClick={() => onTakeAssessment('odi')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Starta bedömning
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Din rehabiliteringsframgång</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{availableScales.length}</div>
            <div className="text-sm opacity-80">Bedömningar</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-300">{improvedScales.length}</div>
            <div className="text-sm opacity-80">Förbättrade</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">{attentionScales.length}</div>
            <div className="text-sm opacity-80">Uppmärksamhet</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Alla' },
          { key: 'improved', label: 'Förbättrade' },
          { key: 'attention', label: 'Uppmärksamhet' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress cards */}
      <div className="space-y-4">
        {displayedScales.map((scale, index) => (
          <ProgressCard
            key={scale.key}
            scaleName={scale.name}
            scaleDescription={scale.description}
            baseline={scale.baseline}
            current={scale.current}
            mcid={scale.mcid}
            higherIsBetter={scale.higherIsBetter}
            onTakeAssessment={onTakeAssessment ? () => onTakeAssessment(scale.key) : undefined}
          />
        ))}
      </div>

      {displayedScales.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Inga bedömningar matchar det valda filtret.
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
