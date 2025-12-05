/**
 * Provider Assessment Hub
 *
 * Dashboard för vårdgivare att:
 * - Jämföra baseline vs current scores
 * - MCID-baserad signifikansvisning
 * - Batch assessment administration
 * - Visualisera patienters framsteg
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Users,
  ClipboardList,
  Calendar,
  ChevronRight,
  ChevronDown,
  Download,
  RefreshCw,
  Star,
  Target,
  Activity
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AssessmentScore {
  date: string;
  score: number;
  interpretation?: string;
}

interface PatientAssessment {
  patientId: string;
  patientName: string;
  assessmentType: string;
  baseline: AssessmentScore;
  current: AssessmentScore;
  history: AssessmentScore[];
}

interface AssessmentType {
  id: string;
  name: string;
  fullName: string;
  scoreRange: [number, number];
  higherIsBetter: boolean;
  mcid: number; // Minimal Clinically Important Difference
  interpretations: { range: [number, number]; label: string; color: string }[];
}

// ============================================
// CONSTANTS - MCID VALUES
// ============================================

const ASSESSMENT_TYPES: AssessmentType[] = [
  {
    id: 'vas',
    name: 'VAS',
    fullName: 'Visual Analog Scale (Smärta)',
    scoreRange: [0, 10],
    higherIsBetter: false,
    mcid: 2.0, // 2 poäng är kliniskt signifikant
    interpretations: [
      { range: [0, 3], label: 'Mild smärta', color: 'green' },
      { range: [4, 6], label: 'Moderat smärta', color: 'yellow' },
      { range: [7, 10], label: 'Svår smärta', color: 'red' }
    ]
  },
  {
    id: 'oswestry',
    name: 'ODI',
    fullName: 'Oswestry Disability Index',
    scoreRange: [0, 100],
    higherIsBetter: false,
    mcid: 10, // 10% förändring är kliniskt signifikant
    interpretations: [
      { range: [0, 20], label: 'Minimal funktionsnedsättning', color: 'green' },
      { range: [21, 40], label: 'Moderat funktionsnedsättning', color: 'yellow' },
      { range: [41, 60], label: 'Svår funktionsnedsättning', color: 'orange' },
      { range: [61, 100], label: 'Invalidiserande', color: 'red' }
    ]
  },
  {
    id: 'tsk11',
    name: 'TSK-11',
    fullName: 'Tampa Scale for Kinesiophobia',
    scoreRange: [11, 44],
    higherIsBetter: false,
    mcid: 5.5, // ~5.5 poäng
    interpretations: [
      { range: [11, 22], label: 'Låg rörelserädsla', color: 'green' },
      { range: [23, 33], label: 'Moderat rörelserädsla', color: 'yellow' },
      { range: [34, 44], label: 'Hög rörelserädsla', color: 'red' }
    ]
  },
  {
    id: 'koos',
    name: 'KOOS',
    fullName: 'Knee Injury and Osteoarthritis Outcome Score',
    scoreRange: [0, 100],
    higherIsBetter: true,
    mcid: 10, // 10 poäng
    interpretations: [
      { range: [0, 50], label: 'Svår dysfunktion', color: 'red' },
      { range: [51, 75], label: 'Moderat dysfunktion', color: 'yellow' },
      { range: [76, 100], label: 'God funktion', color: 'green' }
    ]
  },
  {
    id: 'dash',
    name: 'DASH',
    fullName: 'Disabilities of the Arm, Shoulder and Hand',
    scoreRange: [0, 100],
    higherIsBetter: false,
    mcid: 10.8,
    interpretations: [
      { range: [0, 25], label: 'Minimal nedsättning', color: 'green' },
      { range: [26, 50], label: 'Moderat nedsättning', color: 'yellow' },
      { range: [51, 100], label: 'Svår nedsättning', color: 'red' }
    ]
  },
  {
    id: 'psfs',
    name: 'PSFS',
    fullName: 'Patient-Specific Functional Scale',
    scoreRange: [0, 10],
    higherIsBetter: true,
    mcid: 2.0,
    interpretations: [
      { range: [0, 3], label: 'Svårt begränsad', color: 'red' },
      { range: [4, 6], label: 'Moderat begränsad', color: 'yellow' },
      { range: [7, 10], label: 'Minimal begränsning', color: 'green' }
    ]
  }
];

// Mock patient data
const MOCK_ASSESSMENTS: PatientAssessment[] = [
  {
    patientId: '1',
    patientName: 'Anna Andersson',
    assessmentType: 'vas',
    baseline: { date: '2024-01-15', score: 7, interpretation: 'Svår smärta' },
    current: { date: '2024-03-01', score: 3, interpretation: 'Mild smärta' },
    history: [
      { date: '2024-01-15', score: 7 },
      { date: '2024-01-29', score: 6 },
      { date: '2024-02-12', score: 5 },
      { date: '2024-02-26', score: 4 },
      { date: '2024-03-01', score: 3 }
    ]
  },
  {
    patientId: '1',
    patientName: 'Anna Andersson',
    assessmentType: 'tsk11',
    baseline: { date: '2024-01-15', score: 38, interpretation: 'Hög rörelserädsla' },
    current: { date: '2024-03-01', score: 28, interpretation: 'Moderat rörelserädsla' },
    history: [
      { date: '2024-01-15', score: 38 },
      { date: '2024-02-01', score: 34 },
      { date: '2024-02-15', score: 31 },
      { date: '2024-03-01', score: 28 }
    ]
  },
  {
    patientId: '2',
    patientName: 'Erik Eriksson',
    assessmentType: 'oswestry',
    baseline: { date: '2024-02-01', score: 52, interpretation: 'Svår funktionsnedsättning' },
    current: { date: '2024-03-15', score: 48, interpretation: 'Svår funktionsnedsättning' },
    history: [
      { date: '2024-02-01', score: 52 },
      { date: '2024-02-15', score: 50 },
      { date: '2024-03-01', score: 49 },
      { date: '2024-03-15', score: 48 }
    ]
  },
  {
    patientId: '3',
    patientName: 'Maria Svensson',
    assessmentType: 'koos',
    baseline: { date: '2024-01-20', score: 45, interpretation: 'Svår dysfunktion' },
    current: { date: '2024-03-10', score: 72, interpretation: 'Moderat dysfunktion' },
    history: [
      { date: '2024-01-20', score: 45 },
      { date: '2024-02-05', score: 55 },
      { date: '2024-02-20', score: 63 },
      { date: '2024-03-10', score: 72 }
    ]
  }
];

// ============================================
// COMPONENT
// ============================================

interface AssessmentHubProps {
  assessments?: PatientAssessment[];
  onPatientSelect?: (patientId: string) => void;
  onExportReport?: (patientId: string) => void;
}

const AssessmentHub: React.FC<AssessmentHubProps> = ({
  assessments = MOCK_ASSESSMENTS,
  onPatientSelect,
  onExportReport
}) => {
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  // Get assessment type info
  const getAssessmentType = (id: string): AssessmentType | undefined => {
    return ASSESSMENT_TYPES.find(a => a.id === id);
  };

  // Calculate change and significance
  const calculateChange = (assessment: PatientAssessment) => {
    const type = getAssessmentType(assessment.assessmentType);
    if (!type) return { change: 0, significant: false, improved: false };

    const change = assessment.current.score - assessment.baseline.score;
    const absChange = Math.abs(change);
    const significant = absChange >= type.mcid;

    // Determine if improved (depends on higherIsBetter)
    let improved = false;
    if (type.higherIsBetter) {
      improved = change > 0;
    } else {
      improved = change < 0;
    }

    return { change, significant, improved, absChange };
  };

  // Get interpretation color
  const getInterpretationColor = (assessmentType: string, score: number): string => {
    const type = getAssessmentType(assessmentType);
    if (!type) return 'slate';

    for (const interp of type.interpretations) {
      if (score >= interp.range[0] && score <= interp.range[1]) {
        return interp.color;
      }
    }
    return 'slate';
  };

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    let result = assessments;

    if (selectedAssessmentType !== 'all') {
      result = result.filter(a => a.assessmentType === selectedAssessmentType);
    }

    if (selectedPatient) {
      result = result.filter(a => a.patientId === selectedPatient);
    }

    return result;
  }, [assessments, selectedAssessmentType, selectedPatient]);

  // Summary statistics
  const summary = useMemo(() => {
    let improved = 0;
    let significant = 0;
    let unchanged = 0;
    let worsened = 0;

    filteredAssessments.forEach(a => {
      const { significant: isSig, improved: isImproved, change } = calculateChange(a);
      if (isSig && isImproved) {
        improved++;
        significant++;
      } else if (isSig && !isImproved) {
        worsened++;
      } else {
        unchanged++;
      }
    });

    return { improved, significant, unchanged, worsened, total: filteredAssessments.length };
  }, [filteredAssessments]);

  // Unique patients
  const uniquePatients = useMemo(() => {
    const patients = new Map<string, string>();
    assessments.forEach(a => patients.set(a.patientId, a.patientName));
    return Array.from(patients.entries());
  }, [assessments]);

  // Mini sparkline
  const Sparkline: React.FC<{ data: number[]; higherIsBetter: boolean }> = ({ data, higherIsBetter }) => {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 24;
    const width = 60;
    const step = width / (data.length - 1);

    const points = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const improving = higherIsBetter
      ? data[data.length - 1] > data[0]
      : data[data.length - 1] < data[0];

    return (
      <svg width={width} height={height} className={improving ? 'text-green-500' : 'text-red-500'}>
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary-600" />
            Assessment Hub
          </h2>
          <p className="text-sm text-slate-500">Baseline vs aktuell jämförelse med MCID-signifikans</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <RefreshCw className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">{summary.improved}</span>
          </div>
          <div className="text-sm text-green-600">Signifikant förbättrade</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Minus className="w-5 h-5 text-slate-500" />
            <span className="text-2xl font-bold text-slate-700">{summary.unchanged}</span>
          </div>
          <div className="text-sm text-slate-500">Oförändrade</div>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-700">{summary.worsened}</span>
          </div>
          <div className="text-sm text-red-600">Signifikant försämrade</div>
        </div>
        <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="text-2xl font-bold text-primary-700">{summary.total}</span>
          </div>
          <div className="text-sm text-primary-600">Totalt assessments</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Assessment-typ</label>
          <select
            value={selectedAssessmentType}
            onChange={(e) => setSelectedAssessmentType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Alla typer</option>
            {ASSESSMENT_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name} - {type.fullName}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Patient</label>
          <select
            value={selectedPatient || ''}
            onChange={(e) => setSelectedPatient(e.target.value || null)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
          >
            <option value="">Alla patienter</option>
            {uniquePatients.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessment List */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Inga assessments matchar filtret</p>
          </div>
        ) : (
          filteredAssessments.map((assessment, idx) => {
            const type = getAssessmentType(assessment.assessmentType);
            const { change, significant, improved, absChange } = calculateChange(assessment);
            const baselineColor = getInterpretationColor(assessment.assessmentType, assessment.baseline.score);
            const currentColor = getInterpretationColor(assessment.assessmentType, assessment.current.score);
            const isExpanded = showHistory === `${assessment.patientId}-${assessment.assessmentType}`;

            return (
              <div
                key={idx}
                className={`border-2 rounded-xl overflow-hidden transition-all ${
                  significant && improved ? 'border-green-200 bg-green-50/30' :
                    significant && !improved ? 'border-red-200 bg-red-50/30' :
                      'border-slate-200 bg-white'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Patient & Assessment info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{assessment.patientName}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                          {type?.name}
                        </span>
                        {significant && (
                          <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                            improved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <Star className="w-3 h-3 inline mr-1" />
                            MCID uppnådd
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">{type?.fullName}</div>
                    </div>

                    {/* Baseline score */}
                    <div className="text-center px-4">
                      <div className="text-xs text-slate-400 mb-1">Baseline</div>
                      <div className={`text-xl font-bold ${
                        baselineColor === 'green' ? 'text-green-600' :
                          baselineColor === 'yellow' ? 'text-yellow-600' :
                            baselineColor === 'orange' ? 'text-orange-600' :
                              baselineColor === 'red' ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {assessment.baseline.score}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(assessment.baseline.date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Trend sparkline */}
                    <div className="px-4">
                      <Sparkline
                        data={assessment.history.map(h => h.score)}
                        higherIsBetter={type?.higherIsBetter || false}
                      />
                    </div>

                    {/* Current score */}
                    <div className="text-center px-4">
                      <div className="text-xs text-slate-400 mb-1">Aktuell</div>
                      <div className={`text-xl font-bold ${
                        currentColor === 'green' ? 'text-green-600' :
                          currentColor === 'yellow' ? 'text-yellow-600' :
                            currentColor === 'orange' ? 'text-orange-600' :
                              currentColor === 'red' ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {assessment.current.score}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(assessment.current.date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {/* Change indicator */}
                    <div className={`text-center px-4 py-2 rounded-lg ${
                      significant && improved ? 'bg-green-100' :
                        significant && !improved ? 'bg-red-100' :
                          'bg-slate-100'
                    }`}>
                      <div className={`text-lg font-bold flex items-center gap-1 ${
                        improved ? 'text-green-700' : change === 0 ? 'text-slate-500' : 'text-red-700'
                      }`}>
                        {improved ? <TrendingDown className="w-4 h-4" /> :
                          change === 0 ? <Minus className="w-4 h-4" /> :
                            <TrendingUp className="w-4 h-4" />}
                        {change > 0 ? '+' : ''}{change}
                      </div>
                      <div className="text-xs text-slate-500">
                        MCID: {type?.mcid}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowHistory(isExpanded ? null : `${assessment.patientId}-${assessment.assessmentType}`)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        onClick={() => onExportReport?.(assessment.patientId)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Exportera rapport"
                      >
                        <Download className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded history */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-2">Historik</div>
                    <div className="flex gap-2 overflow-x-auto">
                      {assessment.history.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex-shrink-0 p-2 bg-white rounded-lg border border-slate-100 text-center min-w-[80px]"
                        >
                          <div className="text-sm font-bold text-slate-700">{h.score}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(h.date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MCID Reference */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <div className="text-xs font-bold text-slate-500 uppercase mb-2">MCID-referensvärden</div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {ASSESSMENT_TYPES.map(type => (
            <div key={type.id} className="flex justify-between">
              <span className="text-slate-600">{type.name}</span>
              <span className="font-medium text-slate-800">{type.mcid} {type.higherIsBetter ? '↑' : '↓'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentHub;
