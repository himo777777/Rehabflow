/**
 * ClinicalReport Component
 *
 * Visar och exporterar AI-genererade kliniska rapporter med:
 * - Patientöversikt
 * - Assessment scores med MCID-signifikans
 * - Smärttrend visualisering
 * - Röda flaggor och risker
 * - AI-rekommendationer
 * - PDF/JSON export
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Activity,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Printer,
  FileJson,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import {
  generateClinicalReport,
  formatReportForPDF,
  exportReportJSON,
  ClinicalReport as ClinicalReportType,
  AssessmentScore
} from '../services/reportGenerator';

// ============================================
// TYPES
// ============================================

interface ClinicalReportProps {
  weeksBack?: number;
  onClose?: () => void;
}

// ============================================
// HELPER COMPONENTS
// ============================================

const TrafficLight: React.FC<{ status: 'green' | 'yellow' | 'red' }> = ({ status }) => {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <span className={`inline-block w-4 h-4 rounded-full ${colors[status]}`} />
  );
};

const TrendIcon: React.FC<{ trend: 'improving' | 'stable' | 'worsening' }> = ({ trend }) => {
  if (trend === 'improving') {
    return <TrendingDown className="w-5 h-5 text-green-500" />;
  }
  if (trend === 'worsening') {
    return <TrendingUp className="w-5 h-5 text-red-500" />;
  }
  return <Minus className="w-5 h-5 text-gray-400" />;
};

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = 'blue' }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
};

const AssessmentRow: React.FC<{ assessment: AssessmentScore }> = ({ assessment }) => {
  const getChangeColor = () => {
    if (!assessment.change) return 'text-gray-500';
    if (assessment.isSignificant && assessment.interpretation.includes('förbättring')) {
      return 'text-green-600 font-semibold';
    }
    if (assessment.isSignificant && assessment.interpretation.includes('försämring')) {
      return 'text-red-600 font-semibold';
    }
    return 'text-gray-600';
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium">{assessment.name}</td>
      <td className="py-3 px-4 text-center">{assessment.baseline ?? '-'}</td>
      <td className="py-3 px-4 text-center">{assessment.current ?? '-'}</td>
      <td className={`py-3 px-4 text-center ${getChangeColor()}`}>
        {assessment.change !== null
          ? `${assessment.change > 0 ? '+' : ''}${assessment.change}`
          : '-'}
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {assessment.isSignificant && (
          <span className="inline-flex items-center gap-1 mr-2">
            {assessment.interpretation.includes('förbättring') ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </span>
        )}
        {assessment.interpretation}
      </td>
    </tr>
  );
};

const PainChart: React.FC<{ painHistory: { date: string; pain: number }[] }> = ({ painHistory }) => {
  if (painHistory.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        Ingen smärtdata tillgänglig
      </div>
    );
  }

  const maxPain = 10;
  const chartHeight = 120;
  const chartWidth = 100;

  return (
    <div className="relative h-40">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 2.5, 5, 7.5, 10].map((line, i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight - (line / maxPain) * chartHeight}
            x2={chartWidth}
            y2={chartHeight - (line / maxPain) * chartHeight}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}

        {/* Pain line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={painHistory.map((p, i) => {
            const x = (i / (painHistory.length - 1 || 1)) * chartWidth;
            const y = chartHeight - (p.pain / maxPain) * chartHeight;
            return `${x},${y}`;
          }).join(' ')}
        />

        {/* Area fill */}
        <polygon
          fill="url(#painGradient)"
          points={`
            0,${chartHeight}
            ${painHistory.map((p, i) => {
              const x = (i / (painHistory.length - 1 || 1)) * chartWidth;
              const y = chartHeight - (p.pain / maxPain) * chartHeight;
              return `${x},${y}`;
            }).join(' ')}
            ${chartWidth},${chartHeight}
          `}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-6">
        <span>10</span>
        <span>5</span>
        <span>0</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ClinicalReportViewer: React.FC<ClinicalReportProps> = ({
  weeksBack = 4,
  onClose
}) => {
  const [report, setReport] = useState<ClinicalReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['summary', 'assessments', 'recommendations'])
  );

  useEffect(() => {
    loadReport();
  }, [weeksBack]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const generated = await generateClinicalReport(weeksBack);
      setReport(generated);
    } catch (err) {
      setError('Kunde inte generera rapport. Försök igen.');
      console.error('Report generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handlePrintPDF = () => {
    if (!report) return;

    const htmlContent = formatReportForPDF(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadJSON = () => {
    if (!report) return;

    const jsonContent = exportReportJSON(report);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-report-${report.reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE');
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!report) return null;

    const improved = report.assessments.filter(
      a => a.isSignificant && a.interpretation.includes('förbättring')
    ).length;

    const worsened = report.assessments.filter(
      a => a.isSignificant && a.interpretation.includes('försämring')
    ).length;

    const stable = report.assessments.length - improved - worsened;

    return { improved, worsened, stable };
  }, [report]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Genererar klinisk rapport...</p>
        <p className="text-gray-400 text-sm mt-2">AI analyserar din data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-700 font-medium">{error}</p>
        <button
          onClick={loadReport}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Försök igen
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-500" />
            Klinisk Progressionsrapport
          </h1>
          <p className="text-gray-500 mt-1">
            {formatDate(report.reportPeriod.start)} - {formatDate(report.reportPeriod.end)} ({report.reportPeriod.weeks} veckor)
          </p>
          <p className="text-gray-400 text-sm">
            Rapport-ID: {report.reportId}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Skriv ut PDF
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={loadReport}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Uppdatera rapport"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Patient Info Bar */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{report.patient.name}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">{report.patient.age} år</span>
        </div>
        <div className="text-gray-600">
          {report.patient.injuryType} - {report.patient.bodyPart}
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Fas {report.currentPhase.phase}: {report.currentPhase.phaseName}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Följsamhet"
          value={`${report.exerciseSummary.completionRate}%`}
          icon={<Target className="w-4 h-4" />}
          color={report.exerciseSummary.completionRate >= 70 ? 'green' : 'yellow'}
        />
        <MetricCard
          label="Genomsnittlig Smärta"
          value={`${report.painAnalysis.avgPain}/10`}
          icon={<Activity className="w-4 h-4" />}
          color={report.painAnalysis.trafficLight}
        />
        <MetricCard
          label="Streak"
          value={`${report.achievements.streak} dagar`}
          icon={<Calendar className="w-4 h-4" />}
          color={report.achievements.streak >= 7 ? 'green' : 'blue'}
        />
        <MetricCard
          label="Level"
          value={`${report.achievements.level}`}
          icon={<Award className="w-4 h-4" />}
          color="purple"
        />
      </div>

      {/* Red Flags */}
      {report.redFlags.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            Röda Flaggor
          </h3>
          <ul className="space-y-2">
            {report.redFlags.map((flag, i) => (
              <li key={i} className="text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Summary Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              AI-Sammanfattning
            </h3>
            {expandedSections.has('summary') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('summary') && (
            <div className="p-4 border-t border-gray-100">
              <p className="text-gray-700 leading-relaxed">{report.aiSummary}</p>
            </div>
          )}
        </div>

        {/* Assessments Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('assessments')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Bedömningar (Assessments)
              {summaryStats && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {summaryStats.improved} förbättrad, {summaryStats.stable} stabil, {summaryStats.worsened} försämrad
                </span>
              )}
            </h3>
            {expandedSections.has('assessments') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('assessments') && (
            <div className="border-t border-gray-100">
              {report.assessments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Bedömning</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Baseline</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Nuvarande</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Förändring</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tolkning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.assessments.map((assessment, i) => (
                      <AssessmentRow key={i} assessment={assessment} />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-gray-400 text-center">
                  Inga bedömningar tillgängliga
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pain Trend Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('pain')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrafficLight status={report.painAnalysis.trafficLight} />
              Smärtanalys
              <TrendIcon trend={report.painAnalysis.painTrend} />
            </h3>
            {expandedSections.has('pain') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('pain') && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{report.painAnalysis.currentPain}</div>
                  <div className="text-sm text-gray-500">Nuvarande</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{report.painAnalysis.avgPain}</div>
                  <div className="text-sm text-gray-500">Genomsnitt</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-700 capitalize flex items-center justify-center gap-2">
                    <TrendIcon trend={report.painAnalysis.painTrend} />
                    {report.painAnalysis.painTrend === 'improving' ? 'Förbättras' :
                     report.painAnalysis.painTrend === 'worsening' ? 'Försämras' : 'Stabil'}
                  </div>
                  <div className="text-sm text-gray-500">Trend</div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Smärthistorik</h4>
                <PainChart painHistory={report.painAnalysis.painHistory} />
              </div>
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Rekommendationer
              <span className="text-sm font-normal text-gray-500">
                ({report.recommendations.length} st)
              </span>
            </h3>
            {expandedSections.has('recommendations') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('recommendations') && (
            <div className="p-4 border-t border-gray-100 space-y-3">
              {report.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risks Section */}
        {report.risks.length > 0 && (
          <div className="border border-yellow-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('risks')}
              className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors"
            >
              <h3 className="font-semibold text-yellow-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Identifierade Risker
                <span className="text-sm font-normal">
                  ({report.risks.length} st)
                </span>
              </h3>
              {expandedSections.has('risks') ? (
                <ChevronUp className="w-5 h-5 text-yellow-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-yellow-600" />
              )}
            </button>

            {expandedSections.has('risks') && (
              <div className="p-4 border-t border-yellow-100 space-y-2">
                {report.risks.map((risk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-yellow-800"
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {risk}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exercise Summary Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('exercises')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Övningssammanfattning
            </h3>
            {expandedSections.has('exercises') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('exercises') && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{report.exerciseSummary.totalSessions}</div>
                  <div className="text-sm text-gray-500">Totala pass</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{report.exerciseSummary.completionRate}%</div>
                  <div className="text-sm text-gray-500">Genomförda</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 capitalize">{report.exerciseSummary.avgDifficulty}</div>
                  <div className="text-sm text-gray-500">Avg. svårighet</div>
                </div>
              </div>

              {report.exerciseSummary.mostFrequent.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Vanligaste övningar</h4>
                  <div className="space-y-2">
                    {report.exerciseSummary.mostFrequent.map((ex, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-700">{ex.name}</span>
                        <span className="text-gray-500 text-sm">{ex.count} gånger</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        {report.achievements.milestones.length > 0 && (
          <div className="border border-purple-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('achievements')}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Uppnådda Milstolpar
                <span className="text-sm font-normal">
                  ({report.achievements.milestones.length} st)
                </span>
              </h3>
              {expandedSections.has('achievements') ? (
                <ChevronUp className="w-5 h-5 text-purple-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-purple-600" />
              )}
            </button>

            {expandedSections.has('achievements') && (
              <div className="p-4 border-t border-purple-100">
                <ul className="space-y-2">
                  {report.achievements.milestones.map((milestone, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" />
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Goals Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('goals')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Mål & Progress
            </h3>
            {expandedSections.has('goals') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('goals') && (
            <div className="p-4 border-t border-gray-100">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Övergripande progress</span>
                  <span className="font-medium">{report.goals.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${report.goals.progress}%` }}
                  />
                </div>
              </div>

              {report.goals.shortTerm.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Kortsiktiga mål
                  </h4>
                  <ul className="space-y-1">
                    {report.goals.shortTerm.map((goal, i) => (
                      <li key={i} className="text-gray-700 pl-4 border-l-2 border-green-300">
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.goals.longTerm.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Långsiktiga mål
                  </h4>
                  <ul className="space-y-1">
                    {report.goals.longTerm.map((goal, i) => (
                      <li key={i} className="text-gray-700 pl-4 border-l-2 border-blue-300">
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-400">
        <p>Genererad av RehabFlow AI-system</p>
        <p className="mt-1">Alla kliniska beslut bör fattas av legitimerad vårdpersonal</p>
      </div>
    </div>
  );
};

export default ClinicalReportViewer;
