/**
 * Clinical Alerts Dashboard
 *
 * Real-time clinical decision support interface for providers.
 * Displays prioritized alerts, AI recommendations, and intervention tracking.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Phone,
  FileEdit,
  ArrowUpRight,
  Eye,
  BookOpen,
  Users,
  Activity,
  Brain,
  Heart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Bell,
  BellOff,
  MessageSquare,
  Calendar,
  ClipboardCheck,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';
import {
  ClinicalDecision,
  CDSDashboard,
  CDSPatientSummary,
  InterventionRecommendation,
  ClinicalSignal,
  DecisionPriority,
  getCDSDashboard,
  recordIntervention,
  completeIntervention,
  getClinicalGuidelines,
  ClinicalGuideline
} from '../../services/clinicalDecisionService';

// ============================================================================
// TYPES
// ============================================================================

interface AlertCardProps {
  decision: ClinicalDecision;
  onAction: (decision: ClinicalDecision, recommendation: InterventionRecommendation) => void;
  onDismiss: (decision: ClinicalDecision) => void;
  onAcknowledge: (decision: ClinicalDecision) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

interface PatientAlertRowProps {
  patient: CDSPatientSummary;
  onViewDetails: (patientId: string) => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const PriorityBadge: React.FC<{ priority: DecisionPriority }> = ({ priority }) => {
  const styles = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const labels = {
    critical: 'Kritisk',
    high: 'Hög',
    medium: 'Medium',
    low: 'Låg'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
};

const CategoryIcon: React.FC<{ category: string; className?: string }> = ({ category, className = 'w-5 h-5' }) => {
  const icons: Record<string, React.ReactNode> = {
    safety: <Shield className={className} />,
    pain_management: <Activity className={className} />,
    exercise_modification: <FileEdit className={className} />,
    progression: <TrendingUp className={className} />,
    adherence: <ClipboardCheck className={className} />,
    psychological: <Brain className={className} />,
    referral: <ArrowUpRight className={className} />,
    monitoring: <Eye className={className} />
  };

  return <>{icons[category] || <Info className={className} />}</>;
};

const ActionTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  const icons: Record<string, React.ReactNode> = {
    contact_patient: <Phone className={className} />,
    modify_program: <FileEdit className={className} />,
    escalate: <ArrowUpRight className={className} />,
    monitor: <Eye className={className} />,
    refer: <Users className={className} />,
    educate: <BookOpen className={className} />
  };

  return <>{icons[type] || <Lightbulb className={className} />}</>;
};

const SignalBadge: React.FC<{ signal: ClinicalSignal }> = ({ signal }) => {
  const severityStyles = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const sourceLabels: Record<string, string> = {
    risk_stratification: 'Risk',
    pain_alert: 'Smärta',
    red_flag: 'Röd flagga',
    pain_prediction: 'Prediktion',
    adherence: 'Följsamhet',
    movement_quality: 'Rörelse'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${severityStyles[signal.severity]}`}>
      {sourceLabels[signal.source] || signal.source}: {signal.value}
    </span>
  );
};

// ============================================================================
// ALERT CARD COMPONENT
// ============================================================================

const AlertCard: React.FC<AlertCardProps> = ({
  decision,
  onAction,
  onDismiss,
  onAcknowledge,
  expanded,
  onToggleExpand
}) => {
  const priorityStyles = {
    critical: 'border-l-4 border-l-red-500 bg-red-50',
    high: 'border-l-4 border-l-orange-500 bg-orange-50',
    medium: 'border-l-4 border-l-yellow-500 bg-yellow-50',
    low: 'border-l-4 border-l-blue-500 bg-blue-50'
  };

  return (
    <div className={`rounded-lg shadow-sm ${priorityStyles[decision.priority]} p-4 mb-3 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            decision.priority === 'critical' ? 'bg-red-100' :
            decision.priority === 'high' ? 'bg-orange-100' :
            decision.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
          }`}>
            <CategoryIcon category={decision.category} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{decision.title}</h3>
              <PriorityBadge priority={decision.priority} />
              {decision.requiresImmediateAction && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium animate-pulse">
                  <Zap className="w-3 h-3" />
                  Kräver omedelbar åtgärd
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{decision.description}</p>
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Signals */}
      {decision.signals.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {decision.signals.map((signal, idx) => (
            <SignalBadge key={idx} signal={signal} />
          ))}
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Rationale */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Bakgrund</h4>
            <p className="text-sm text-gray-600">{decision.rationale}</p>
          </div>

          {/* Clinical Guideline */}
          {decision.clinicalGuideline && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Klinisk riktlinje</span>
              </div>
              <p className="text-sm text-gray-700">{decision.clinicalGuideline.recommendation}</p>
              <p className="text-xs text-gray-500 mt-1">
                Källa: {decision.clinicalGuideline.source} ({decision.clinicalGuideline.evidenceLevel})
              </p>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Rekommenderade åtgärder</h4>
            <div className="space-y-2">
              {decision.recommendedActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-gray-100 rounded">
                      <ActionTypeIcon type={action.type} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{action.description}</p>
                      {action.steps && (
                        <ul className="mt-2 space-y-1">
                          {action.steps.map((step, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          action.urgency === 'immediate' ? 'bg-red-100 text-red-700' :
                          action.urgency === 'today' ? 'bg-orange-100 text-orange-700' :
                          action.urgency === 'this_week' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {action.urgency === 'immediate' ? 'Omedelbart' :
                           action.urgency === 'today' ? 'Idag' :
                           action.urgency === 'this_week' ? 'Denna vecka' : 'Nästa besök'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Effekt: {action.estimatedImpact === 'high' ? 'Hög' :
                                   action.estimatedImpact === 'medium' ? 'Medium' : 'Låg'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onAction(decision, action)}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Utför
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => onDismiss(decision)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Avfärda
            </button>
            <button
              onClick={() => onAcknowledge(decision)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Bekräfta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PATIENT ALERT ROW
// ============================================================================

const PatientAlertRow: React.FC<PatientAlertRowProps> = ({ patient, onViewDetails }) => {
  const riskStyles = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const riskLabels = {
    critical: 'Kritisk',
    high: 'Hög',
    moderate: 'Måttlig',
    low: 'Låg'
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              {patient.patientName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{patient.patientName}</p>
            <p className="text-xs text-gray-500">{patient.diagnosis}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskStyles[patient.riskLevel]}`}>
          {riskLabels[patient.riskLevel]}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {patient.recentAlerts.length > 0 ? (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">{patient.recentAlerts.length} aktiva</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">Inga</span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">{patient.pendingInterventions.length}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              patient.priorityScore >= 80 ? 'bg-red-100 text-red-700' :
              patient.priorityScore >= 60 ? 'bg-orange-100 text-orange-700' :
              patient.priorityScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}
          >
            {patient.priorityScore}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onViewDetails(patient.patientId)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Visa
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const ClinicalAlertsDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<CDSDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<DecisionPriority | 'all'>('all');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelines] = useState<ClinicalGuideline[]>(getClinicalGuidelines());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Demo decisions for display
  const [decisions, setDecisions] = useState<ClinicalDecision[]>([
    {
      id: '1',
      patientId: 'p1',
      priority: 'critical',
      category: 'pain_management',
      title: 'Kritisk smärtökning',
      description: 'Anna Eriksson rapporterar smärtnivå 8/10, ökning med 3 poäng sedan igår',
      rationale: 'Smärtnivå ≥8 eller ökning >4 poäng indikerar potentiell försämring eller komplikation',
      signals: [
        { source: 'pain_alert', severity: 'critical', value: 8, message: 'Smärtnivå: 8/10 (+3)', timestamp: new Date().toISOString() }
      ],
      recommendedActions: [
        {
          id: 'a1',
          type: 'contact_patient',
          title: 'Telefon/videokonsultation',
          description: 'Bedöm orsak till smärtökning och uteslut röda flaggor',
          urgency: 'today',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate',
          steps: [
            'Kartlägg smärtdebut och karaktär',
            'Fråga om nya symtom',
            'Bedöm om aktivitet triggade smärtan'
          ]
        },
        {
          id: 'a2',
          type: 'modify_program',
          title: 'Pausa eller reducera program',
          description: 'Tillfälligt reducera träningsintensitet med 50%',
          urgency: 'immediate',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ],
      clinicalGuideline: {
        id: 'pain-spike',
        name: 'Pain Spike Protocol',
        source: 'RehabFlow Clinical Protocol',
        condition: 'General',
        recommendation: 'För smärtökning >2 poäng: 1) Reducera intensitet 25%, 2) Kontakt inom 24h',
        evidenceLevel: 'Expert Opinion',
        lastUpdated: '2024-03-15'
      },
      aiConfidence: 0.92,
      requiresImmediateAction: true,
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      patientId: 'p3',
      priority: 'high',
      category: 'adherence',
      title: 'Låg följsamhet till träningsprogram',
      description: 'Maria Lindgren har endast 25% följsamhet senaste veckan',
      rationale: 'Följsamhet under 40% associeras med sämre behandlingsutfall',
      signals: [
        { source: 'adherence', severity: 'warning', value: 25, message: 'Följsamhet: 25%', timestamp: new Date().toISOString() }
      ],
      recommendedActions: [
        {
          id: 'a3',
          type: 'contact_patient',
          title: 'Motiverande samtal',
          description: 'Utforska hinder och justera förväntningar',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate',
          steps: [
            'Fråga om hinder (tid, smärta, motivation)',
            'Validera patientens upplevelse',
            'Sätt realistiska kortsiktiga mål'
          ]
        },
        {
          id: 'a4',
          type: 'modify_program',
          title: 'Förenkla programmet',
          description: 'Reducera till 3-4 nyckelövningar',
          urgency: 'this_week',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ],
      clinicalGuideline: guidelines.find(g => g.id === 'adherence-intervention'),
      aiConfidence: 0.88,
      requiresImmediateAction: false,
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      patientId: 'p2',
      priority: 'medium',
      category: 'psychological',
      title: 'Förhöjd rörelserädsla',
      description: 'Erik Johansson har TSK-11 score 32/44',
      rationale: 'Hög kinesiofobi är en stark prediktor för kronisk smärta och nedsatt funktion',
      signals: [],
      recommendedActions: [
        {
          id: 'a5',
          type: 'educate',
          title: 'Smärtedukation',
          description: 'Aktivera modulen om smärtneurovetenskap',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'strong'
        }
      ],
      aiConfidence: 0.85,
      requiresImmediateAction: false,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getCDSDashboard('provider-1');
        setDashboard(data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCDSDashboard('provider-1');
      setDashboard(data);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = async (decision: ClinicalDecision, recommendation: InterventionRecommendation) => {
    try {
      await recordIntervention(decision, recommendation, 'provider-1');
      // Update UI to show action taken
      setDecisions(prev =>
        prev.map(d =>
          d.id === decision.id ? { ...d, status: 'acted_upon' as const } : d
        )
      );
    } catch (error) {
      console.error('Error recording intervention:', error);
    }
  };

  const handleDismiss = (decision: ClinicalDecision) => {
    setDecisions(prev =>
      prev.map(d =>
        d.id === decision.id ? { ...d, status: 'dismissed' as const } : d
      )
    );
  };

  const handleAcknowledge = (decision: ClinicalDecision) => {
    setDecisions(prev =>
      prev.map(d =>
        d.id === decision.id ? { ...d, status: 'acknowledged' as const } : d
      )
    );
  };

  const toggleExpand = (decisionId: string) => {
    setExpandedDecisions(prev => {
      const next = new Set(prev);
      if (next.has(decisionId)) {
        next.delete(decisionId);
      } else {
        next.add(decisionId);
      }
      return next;
    });
  };

  const filteredDecisions = decisions.filter(d =>
    d.status === 'active' && (priorityFilter === 'all' || d.priority === priorityFilter)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-600" />
            Kliniskt beslutsstöd
          </h1>
          <p className="text-gray-500 mt-1">
            AI-drivna rekommendationer och varningar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Uppdaterad: {lastRefresh.toLocaleTimeString('sv-SE')}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showGuidelines ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Riktlinjer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kritiska beslut</p>
              <p className="text-2xl font-bold text-red-600">
                {decisions.filter(d => d.priority === 'critical' && d.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hög prioritet</p>
              <p className="text-2xl font-bold text-orange-600">
                {decisions.filter(d => d.priority === 'high' && d.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Väntande åtgärder</p>
              <p className="text-2xl font-bold text-indigo-600">
                {decisions.reduce((acc, d) => acc + d.recommendedActions.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utförda idag</p>
              <p className="text-2xl font-bold text-green-600">
                {decisions.filter(d => d.status === 'acted_upon').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Panel */}
      {showGuidelines && (
        <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Aktiva kliniska riktlinjer
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {guidelines.map(guideline => (
              <div key={guideline.id} className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="font-medium text-gray-900 text-sm">{guideline.name}</p>
                <p className="text-xs text-gray-600 mt-1">{guideline.recommendation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-indigo-600">{guideline.source}</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">{guideline.evidenceLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Alerts Column */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Aktiva beslut ({filteredDecisions.length})
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as DecisionPriority | 'all')}
                  className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Alla prioriteter</option>
                  <option value="critical">Kritisk</option>
                  <option value="high">Hög</option>
                  <option value="medium">Medium</option>
                  <option value="low">Låg</option>
                </select>
              </div>
            </div>

            <div className="p-4">
              {filteredDecisions.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Inga aktiva beslut</p>
                </div>
              ) : (
                filteredDecisions.map(decision => (
                  <AlertCard
                    key={decision.id}
                    decision={decision}
                    onAction={handleAction}
                    onDismiss={handleDismiss}
                    onAcknowledge={handleAcknowledge}
                    expanded={expandedDecisions.has(decision.id)}
                    onToggleExpand={() => toggleExpand(decision.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Patient Priority List */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Patientprioritet
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {dashboard?.patients.map(patient => (
                <div
                  key={patient.patientId}
                  className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        patient.riskLevel === 'critical' ? 'bg-red-100' :
                        patient.riskLevel === 'high' ? 'bg-orange-100' :
                        patient.riskLevel === 'moderate' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <span className={`text-sm font-medium ${
                          patient.riskLevel === 'critical' ? 'text-red-700' :
                          patient.riskLevel === 'high' ? 'text-orange-700' :
                          patient.riskLevel === 'moderate' ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                          {patient.patientName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{patient.patientName}</p>
                        <p className="text-xs text-gray-500">{patient.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {patient.recentAlerts.length > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          {patient.recentAlerts.length}
                        </span>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        patient.priorityScore >= 80 ? 'bg-red-100 text-red-700' :
                        patient.priorityScore >= 60 ? 'bg-orange-100 text-orange-700' :
                        patient.priorityScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {patient.priorityScore}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Snabbåtgärder
              </h2>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Skicka gruppmeddelande</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Schemalägg uppföljningar</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <FileEdit className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Massuppdatera program</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalAlertsDashboard;
