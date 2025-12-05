// ============================================================================
// RISK STRATIFICATION DASHBOARD
// ============================================================================
// Main dashboard for providers to view patient risk levels, alerts, and
// prioritize patients requiring intensive monitoring.

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Bell,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Eye,
  MessageSquare
} from 'lucide-react';
import { RiskScoreCard } from './RiskScoreCard';
import type {
  RiskLevel,
  RiskAlert,
  PatientRiskSummary,
  ProviderRiskDashboard
} from '../../services/riskStratificationService';

// ============================================================================
// TYPES
// ============================================================================

interface RiskStratificationDashboardProps {
  providerId: string;
  onSelectPatient?: (patientId: string) => void;
  onMessagePatient?: (patientId: string) => void;
}

type FilterRiskLevel = RiskLevel | 'all';
type FilterTrend = 'all' | 'improving' | 'stable' | 'worsening';
type SortOption = 'risk_desc' | 'risk_asc' | 'name' | 'recent_activity';

// ============================================================================
// DEMO DATA
// ============================================================================

const generateDemoData = (): ProviderRiskDashboard => ({
  totalPatients: 24,
  criticalCount: 2,
  highCount: 5,
  moderateCount: 10,
  lowCount: 5,
  unassessedCount: 2,
  avgRiskScore: 42.5,
  patients: [
    {
      patientId: '1',
      patientName: 'Anna Svensson',
      diagnosis: 'ACL-rekonstruktion',
      currentPhase: 2,
      totalPhases: 4,
      activeAlerts: 2,
      lastActivityDate: '2024-02-28',
      riskAssessment: {
        id: 'ra1',
        userId: '1',
        overallScore: 82,
        riskLevel: 'critical',
        painScore: 85,
        adherenceScore: 45,
        psychologicalScore: 78,
        movementScore: 65,
        healthScore: 40,
        progressionScore: 70,
        contributingFactors: [
          { factor: 'high_predicted_pain', impact: 0.9, description: 'Hög förutspådd smärta (8/10) de kommande 24 timmarna', category: 'pain' },
          { factor: 'low_adherence', impact: 0.7, description: 'Låg följsamhet (45%) senaste veckan', category: 'adherence' }
        ],
        recommendedActions: [
          { priority: 'urgent', action: 'Kontakta patienten omedelbart', reason: 'Kritisk risknivå med hög smärta', category: 'contact' }
        ],
        previousScore: 65,
        scoreTrend: 'worsening',
        scoreChange: 17,
        dataSources: { painLogs: 14, movementSessions: 8, promisAssessment: true, healthData: true, psfsAssessment: true },
        createdAt: '2024-02-28T10:00:00Z'
      }
    },
    {
      patientId: '2',
      patientName: 'Erik Lindberg',
      diagnosis: 'Kronisk ryggsmärta',
      currentPhase: 3,
      totalPhases: 3,
      activeAlerts: 1,
      lastActivityDate: '2024-02-29',
      riskAssessment: {
        id: 'ra2',
        userId: '2',
        overallScore: 76,
        riskLevel: 'critical',
        painScore: 70,
        adherenceScore: 60,
        psychologicalScore: 88,
        movementScore: 55,
        healthScore: 65,
        progressionScore: 80,
        contributingFactors: [
          { factor: 'high_kinesiophobia', impact: 0.85, description: 'Hög rörelserädsla (TSK-11 > 40)', category: 'psychological' },
          { factor: 'stalled_progress', impact: 0.6, description: 'Ingen framsteg i fas 3 på 3 veckor', category: 'progression' }
        ],
        recommendedActions: [
          { priority: 'high', action: 'Boka uppföljning', reason: 'Hög rörelserädsla behöver adresseras', category: 'clinical' }
        ],
        previousScore: 78,
        scoreTrend: 'stable',
        scoreChange: -2,
        dataSources: { painLogs: 21, movementSessions: 5, promisAssessment: true, healthData: false, psfsAssessment: true },
        createdAt: '2024-02-27T14:00:00Z'
      }
    },
    {
      patientId: '3',
      patientName: 'Maria Karlsson',
      diagnosis: 'Axelimpingement',
      currentPhase: 1,
      totalPhases: 3,
      activeAlerts: 0,
      lastActivityDate: '2024-02-28',
      riskAssessment: {
        id: 'ra3',
        userId: '3',
        overallScore: 58,
        riskLevel: 'high',
        painScore: 65,
        adherenceScore: 55,
        psychologicalScore: 50,
        movementScore: 60,
        healthScore: 45,
        progressionScore: 40,
        contributingFactors: [
          { factor: 'pain_worsening', impact: 0.7, description: 'Smärta ökande senaste 7 dagarna', category: 'pain' }
        ],
        recommendedActions: [
          { priority: 'medium', action: 'Granska träningsprogram', reason: 'Ökande smärta kan indikera för intensiv träning', category: 'program' }
        ],
        previousScore: 52,
        scoreTrend: 'worsening',
        scoreChange: 6,
        dataSources: { painLogs: 10, movementSessions: 12, promisAssessment: false, healthData: true, psfsAssessment: false },
        createdAt: '2024-02-28T08:00:00Z'
      }
    },
    {
      patientId: '4',
      patientName: 'Johan Andersson',
      diagnosis: 'Plantarfasciit',
      currentPhase: 2,
      totalPhases: 2,
      activeAlerts: 0,
      lastActivityDate: '2024-02-29',
      riskAssessment: {
        id: 'ra4',
        userId: '4',
        overallScore: 35,
        riskLevel: 'moderate',
        painScore: 40,
        adherenceScore: 30,
        psychologicalScore: 25,
        movementScore: 35,
        healthScore: 30,
        progressionScore: 45,
        contributingFactors: [
          { factor: 'slow_progression', impact: 0.5, description: 'Långsammare framsteg än förväntat', category: 'progression' }
        ],
        recommendedActions: [
          { priority: 'low', action: 'Fortsätt övervaka', reason: 'Måttlig risk, ingen akut åtgärd krävs', category: 'monitoring' }
        ],
        previousScore: 38,
        scoreTrend: 'improving',
        scoreChange: -3,
        dataSources: { painLogs: 18, movementSessions: 15, promisAssessment: true, healthData: true, psfsAssessment: true },
        createdAt: '2024-02-29T09:00:00Z'
      }
    },
    {
      patientId: '5',
      patientName: 'Lisa Bergström',
      diagnosis: 'Tennisarmbåge',
      currentPhase: 2,
      totalPhases: 3,
      activeAlerts: 0,
      lastActivityDate: '2024-02-27',
      riskAssessment: {
        id: 'ra5',
        userId: '5',
        overallScore: 18,
        riskLevel: 'low',
        painScore: 20,
        adherenceScore: 15,
        psychologicalScore: 18,
        movementScore: 22,
        healthScore: 15,
        progressionScore: 10,
        contributingFactors: [],
        recommendedActions: [
          { priority: 'low', action: 'Ingen åtgärd krävs', reason: 'Patient på god väg', category: 'none' }
        ],
        previousScore: 25,
        scoreTrend: 'improving',
        scoreChange: -7,
        dataSources: { painLogs: 20, movementSessions: 18, promisAssessment: true, healthData: true, psfsAssessment: true },
        createdAt: '2024-02-27T11:00:00Z'
      }
    },
    {
      patientId: '6',
      patientName: 'Karl Nilsson',
      diagnosis: 'Knäartros',
      currentPhase: 1,
      totalPhases: 4,
      activeAlerts: 0,
      lastActivityDate: '2024-02-26'
    },
    {
      patientId: '7',
      patientName: 'Sofia Ek',
      diagnosis: 'Höftledsartros',
      currentPhase: 2,
      totalPhases: 3,
      activeAlerts: 1,
      lastActivityDate: '2024-02-28',
      riskAssessment: {
        id: 'ra7',
        userId: '7',
        overallScore: 52,
        riskLevel: 'high',
        painScore: 55,
        adherenceScore: 40,
        psychologicalScore: 60,
        movementScore: 50,
        healthScore: 55,
        progressionScore: 45,
        contributingFactors: [
          { factor: 'anxiety_elevated', impact: 0.65, description: 'Förhöjd ångest enligt PROMIS-29', category: 'psychological' }
        ],
        recommendedActions: [
          { priority: 'medium', action: 'Överväg psykologisk uppföljning', reason: 'Förhöjda ångestnivåer kan påverka rehabiliteringen', category: 'referral' }
        ],
        previousScore: 55,
        scoreTrend: 'improving',
        scoreChange: -3,
        dataSources: { painLogs: 12, movementSessions: 10, promisAssessment: true, healthData: false, psfsAssessment: true },
        createdAt: '2024-02-28T15:00:00Z'
      }
    }
  ],
  recentAlerts: [
    {
      id: 'alert1',
      userId: '1',
      assessmentId: 'ra1',
      alertType: 'critical_level',
      severity: 'critical',
      title: 'Kritisk risknivå upptäckt',
      message: 'Anna Svensson har uppnått kritisk risknivå (82/100). Omedelbar uppföljning rekommenderas.',
      status: 'active',
      createdAt: '2024-02-28T10:05:00Z'
    },
    {
      id: 'alert2',
      userId: '1',
      assessmentId: 'ra1',
      alertType: 'risk_increase',
      severity: 'warning',
      title: 'Betydande ökning av risknivå',
      message: 'Anna Svenssons risknivå har ökat med 17 poäng till kritisk nivå.',
      status: 'active',
      createdAt: '2024-02-28T10:05:00Z'
    },
    {
      id: 'alert3',
      userId: '2',
      alertType: 'no_activity',
      severity: 'warning',
      title: 'Ingen aktivitet senaste 5 dagarna',
      message: 'Erik Lindberg har inte loggat någon aktivitet på 5 dagar.',
      status: 'acknowledged',
      createdAt: '2024-02-27T08:00:00Z'
    },
    {
      id: 'alert4',
      userId: '7',
      alertType: 'pain_spike',
      severity: 'warning',
      title: 'Smärtspik upptäckt',
      message: 'Sofia Ek rapporterade plötslig smärtökning från 4 till 7.',
      status: 'active',
      createdAt: '2024-02-28T16:30:00Z'
    }
  ]
});

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, bgColor, textColor, onClick }) => (
  <button
    onClick={onClick}
    className={`${bgColor} rounded-xl p-4 text-left transition-all ${onClick ? 'hover:shadow-md cursor-pointer' : ''}`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className={`w-10 h-10 ${textColor} bg-white/50 rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    <p className={`text-sm ${textColor} opacity-80`}>{label}</p>
  </button>
);

interface AlertItemProps {
  alert: RiskAlert;
  patientName?: string;
  onAcknowledge?: () => void;
  onDismiss?: () => void;
  onViewPatient?: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, patientName, onAcknowledge, onDismiss, onViewPatient }) => {
  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          badge: 'bg-red-100 text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-500',
          badge: 'bg-orange-100 text-orange-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-700'
        };
    }
  };

  const styles = getSeverityStyles();
  const isActive = alert.status === 'active';

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-3 ${!isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${styles.icon}`}>
          {alert.severity === 'critical' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
              {alert.severity === 'critical' ? 'Kritisk' : alert.severity === 'warning' ? 'Varning' : 'Info'}
            </span>
            {patientName && (
              <span className="text-xs text-slate-500">{patientName}</span>
            )}
            <span className="text-xs text-slate-400">
              {new Date(alert.createdAt).toLocaleDateString('sv-SE')}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800">{alert.title}</p>
          <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
        </div>
        <div className="flex items-center gap-1">
          {isActive && onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
              title="Bekräfta"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {onViewPatient && (
            <button
              onClick={onViewPatient}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Visa patient"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {isActive && onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Avfärda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RiskStratificationDashboard: React.FC<RiskStratificationDashboardProps> = ({
  providerId,
  onSelectPatient,
  onMessagePatient
}) => {
  const [dashboardData, setDashboardData] = useState<ProviderRiskDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<FilterRiskLevel>('all');
  const [filterTrend, setFilterTrend] = useState<FilterTrend>('all');
  const [sortBy, setSortBy] = useState<SortOption>('risk_desc');
  const [showFilters, setShowFilters] = useState(false);

  // Alerts
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, [providerId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from riskStratificationService.getProviderRiskDashboard()
      // For now, use demo data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      setDashboardData(generateDemoData());
    } catch (error) {
      console.error('Failed to load risk dashboard:', error);
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

  const handleAcknowledgeAlert = (alertId: string) => {
    // In production: acknowledgeAlert(alertId)
    console.log('Acknowledge alert:', alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    // In production: resolveAlert(alertId, 'Avfärdad')
    console.log('Dismiss alert:', alertId);
  };

  // Filter and sort patients
  const filteredPatients = dashboardData?.patients
    .filter(patient => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!patient.patientName.toLowerCase().includes(query) &&
            !patient.diagnosis.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Risk level filter
      if (filterRiskLevel !== 'all') {
        if (!patient.riskAssessment || patient.riskAssessment.riskLevel !== filterRiskLevel) {
          return false;
        }
      }

      // Trend filter
      if (filterTrend !== 'all') {
        if (!patient.riskAssessment || patient.riskAssessment.scoreTrend !== filterTrend) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'risk_desc':
          return (b.riskAssessment?.overallScore || 0) - (a.riskAssessment?.overallScore || 0);
        case 'risk_asc':
          return (a.riskAssessment?.overallScore || 0) - (b.riskAssessment?.overallScore || 0);
        case 'name':
          return a.patientName.localeCompare(b.patientName, 'sv');
        case 'recent_activity':
          return new Date(b.lastActivityDate || 0).getTime() - new Date(a.lastActivityDate || 0).getTime();
        default:
          return 0;
      }
    }) || [];

  const activeAlerts = dashboardData?.recentAlerts.filter(a => a.status === 'active') || [];
  const displayedAlerts = showAllAlerts ? dashboardData?.recentAlerts : activeAlerts.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Laddar riskanalys...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
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
              <h1 className="text-xl font-bold text-slate-800">Riskstratifiering</h1>
              <p className="text-sm text-slate-500">Identifiera patienter som behöver extra uppföljning</p>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <StatCard
            label="Totalt"
            value={dashboardData.totalPatients}
            icon={<Users className="w-5 h-5" />}
            bgColor="bg-slate-100"
            textColor="text-slate-700"
          />
          <StatCard
            label="Kritisk"
            value={dashboardData.criticalCount}
            icon={<AlertTriangle className="w-5 h-5" />}
            bgColor="bg-red-100"
            textColor="text-red-700"
            onClick={() => setFilterRiskLevel(filterRiskLevel === 'critical' ? 'all' : 'critical')}
          />
          <StatCard
            label="Hög"
            value={dashboardData.highCount}
            icon={<TrendingUp className="w-5 h-5" />}
            bgColor="bg-orange-100"
            textColor="text-orange-700"
            onClick={() => setFilterRiskLevel(filterRiskLevel === 'high' ? 'all' : 'high')}
          />
          <StatCard
            label="Måttlig"
            value={dashboardData.moderateCount}
            icon={<Activity className="w-5 h-5" />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-700"
            onClick={() => setFilterRiskLevel(filterRiskLevel === 'moderate' ? 'all' : 'moderate')}
          />
          <StatCard
            label="Låg"
            value={dashboardData.lowCount}
            icon={<TrendingDown className="w-5 h-5" />}
            bgColor="bg-green-100"
            textColor="text-green-700"
            onClick={() => setFilterRiskLevel(filterRiskLevel === 'low' ? 'all' : 'low')}
          />
          <StatCard
            label="Ej bedömd"
            value={dashboardData.unassessedCount}
            icon={<Clock className="w-5 h-5" />}
            bgColor="bg-slate-100"
            textColor="text-slate-500"
          />
          <StatCard
            label="Snittpoäng"
            value={dashboardData.avgRiskScore.toFixed(0)}
            icon={<Activity className="w-5 h-5" />}
            bgColor="bg-blue-100"
            textColor="text-blue-700"
          />
        </div>

        {/* Alerts Section */}
        {activeAlerts.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-slate-800">
                  Aktiva varningar ({activeAlerts.length})
                </h2>
              </div>
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showAllAlerts ? 'Visa färre' : 'Visa alla'}
              </button>
            </div>
            <div className="space-y-2">
              {displayedAlerts?.map(alert => {
                const patient = dashboardData.patients.find(p => p.patientId === alert.userId);
                return (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    patientName={patient?.patientName}
                    onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
                    onDismiss={() => handleDismissAlert(alert.id)}
                    onViewPatient={patient ? () => onSelectPatient?.(patient.patientId) : undefined}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Sök patient eller diagnos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters || filterRiskLevel !== 'all' || filterTrend !== 'all'
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(filterRiskLevel !== 'all' || filterTrend !== 'all') && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {(filterRiskLevel !== 'all' ? 1 : 0) + (filterTrend !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="risk_desc">Risk (högst först)</option>
                <option value="risk_asc">Risk (lägst först)</option>
                <option value="name">Namn (A-Ö)</option>
                <option value="recent_activity">Senaste aktivitet</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Risknivå</label>
                <select
                  value={filterRiskLevel}
                  onChange={(e) => setFilterRiskLevel(e.target.value as FilterRiskLevel)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="all">Alla nivåer</option>
                  <option value="critical">Kritisk</option>
                  <option value="high">Hög</option>
                  <option value="moderate">Måttlig</option>
                  <option value="low">Låg</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Trend</label>
                <select
                  value={filterTrend}
                  onChange={(e) => setFilterTrend(e.target.value as FilterTrend)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="all">Alla trender</option>
                  <option value="improving">Förbättras</option>
                  <option value="stable">Stabil</option>
                  <option value="worsening">Försämras</option>
                </select>
              </div>
              <div className="col-span-2 flex items-end">
                <button
                  onClick={() => {
                    setFilterRiskLevel('all');
                    setFilterTrend('all');
                    setSearchQuery('');
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Rensa filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Patient Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Patienter ({filteredPatients.length})
          </h2>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Inga patienter matchar dina filter</p>
            <button
              onClick={() => {
                setFilterRiskLevel('all');
                setFilterTrend('all');
                setSearchQuery('');
              }}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700"
            >
              Rensa filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map(patient => (
              <RiskScoreCard
                key={patient.patientId}
                patient={patient}
                onClick={() => onSelectPatient?.(patient.patientId)}
                onQuickAction={(action) => {
                  if (action === 'view') {
                    onSelectPatient?.(patient.patientId);
                  } else if (action === 'message') {
                    onMessagePatient?.(patient.patientId);
                  } else if (action === 'alert') {
                    console.log('Alert settings for:', patient.patientId);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskStratificationDashboard;
