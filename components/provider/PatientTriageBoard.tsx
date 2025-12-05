/**
 * Patient Triage Board (Provider View)
 *
 * Dashboard för vårdgivare som visar patienter i:
 * - Röd zon: Kräver omedelbar uppmärksamhet
 * - Gul zon: Behöver uppföljning
 * - Grön zon: På rätt spår
 *
 * Baserat på: TSK-11, smärttrend, adherence, röda flaggor
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  Clock
} from 'lucide-react';

// Mock patient data - in real app would come from database
interface PatientData {
  id: string;
  name: string;
  injuryType: string;
  currentPhase: 1 | 2 | 3;
  daysSinceStart: number;
  lastActive: string;
  metrics: {
    tsk11Score?: number;
    avgPain: number;
    painTrend: 'improving' | 'stable' | 'worsening';
    adherence: number;
    completedSessions: number;
  };
  redFlags: string[];
  notes?: string;
}

type TriageZone = 'red' | 'yellow' | 'green';

interface TriageResult {
  zone: TriageZone;
  reasons: string[];
  priority: number; // 1 = highest
}

interface PatientTriageBoardProps {
  /** Mock patient data for demo */
  patients?: PatientData[];
  /** Callback when patient is selected */
  onPatientSelect?: (patientId: string) => void;
}

// Triage logic
function triagePatient(patient: PatientData): TriageResult {
  const reasons: string[] = [];
  let score = 0; // Higher = worse

  // TSK-11 (Fear of movement) - score > 37 is high
  if (patient.metrics.tsk11Score !== undefined) {
    if (patient.metrics.tsk11Score > 40) {
      score += 3;
      reasons.push('Mycket hög rörelserädsla (TSK-11)');
    } else if (patient.metrics.tsk11Score > 30) {
      score += 1;
      reasons.push('Förhöjd rörelserädsla');
    }
  }

  // Pain level
  if (patient.metrics.avgPain >= 7) {
    score += 3;
    reasons.push('Hög smärtnivå (>7)');
  } else if (patient.metrics.avgPain >= 5) {
    score += 1;
    reasons.push('Moderat smärta');
  }

  // Pain trend
  if (patient.metrics.painTrend === 'worsening') {
    score += 2;
    reasons.push('Försämrad smärttrend');
  }

  // Adherence
  if (patient.metrics.adherence < 30) {
    score += 3;
    reasons.push('Mycket låg följsamhet (<30%)');
  } else if (patient.metrics.adherence < 50) {
    score += 2;
    reasons.push('Låg följsamhet (<50%)');
  } else if (patient.metrics.adherence < 70) {
    score += 1;
    reasons.push('Under målföljsamhet');
  }

  // Red flags
  if (patient.redFlags.length > 0) {
    score += patient.redFlags.length * 2;
    patient.redFlags.forEach(flag => reasons.push(`Röd flagga: ${flag}`));
  }

  // Inactivity
  const daysSinceActive = Math.floor(
    (Date.now() - new Date(patient.lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceActive > 7) {
    score += 2;
    reasons.push(`Inaktiv ${daysSinceActive} dagar`);
  } else if (daysSinceActive > 3) {
    score += 1;
    reasons.push('Minskad aktivitet');
  }

  // Determine zone
  let zone: TriageZone;
  if (score >= 5) {
    zone = 'red';
  } else if (score >= 2) {
    zone = 'yellow';
  } else {
    zone = 'green';
    if (reasons.length === 0) {
      reasons.push('På rätt spår');
    }
  }

  return { zone, reasons, priority: score };
}

// Demo patients
const DEMO_PATIENTS: PatientData[] = [
  {
    id: '1',
    name: 'Anna Andersson',
    injuryType: 'Knäskada (ACL)',
    currentPhase: 2,
    daysSinceStart: 45,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      tsk11Score: 28,
      avgPain: 3,
      painTrend: 'improving',
      adherence: 85,
      completedSessions: 38
    },
    redFlags: []
  },
  {
    id: '2',
    name: 'Erik Eriksson',
    injuryType: 'Ryggsmärta',
    currentPhase: 1,
    daysSinceStart: 14,
    lastActive: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      tsk11Score: 42,
      avgPain: 6,
      painTrend: 'worsening',
      adherence: 25,
      completedSessions: 3
    },
    redFlags: ['Domningar i benet', 'Nattlig smärta']
  },
  {
    id: '3',
    name: 'Maria Svensson',
    injuryType: 'Axelskada',
    currentPhase: 2,
    daysSinceStart: 30,
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      tsk11Score: 35,
      avgPain: 5,
      painTrend: 'stable',
      adherence: 60,
      completedSessions: 18
    },
    redFlags: []
  },
  {
    id: '4',
    name: 'Johan Lindgren',
    injuryType: 'Höftartros',
    currentPhase: 3,
    daysSinceStart: 90,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      avgPain: 2,
      painTrend: 'improving',
      adherence: 92,
      completedSessions: 82
    },
    redFlags: []
  },
  {
    id: '5',
    name: 'Lisa Karlsson',
    injuryType: 'Tennisarmbåge',
    currentPhase: 1,
    daysSinceStart: 7,
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      tsk11Score: 38,
      avgPain: 7,
      painTrend: 'worsening',
      adherence: 40,
      completedSessions: 4
    },
    redFlags: []
  }
];

const PatientTriageBoard: React.FC<PatientTriageBoardProps> = ({
  patients = DEMO_PATIENTS,
  onPatientSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<TriageZone | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'lastActive'>('priority');

  // Triage all patients
  const triagedPatients = useMemo(() => {
    return patients.map(patient => ({
      patient,
      triage: triagePatient(patient)
    }));
  }, [patients]);

  // Count by zone
  const zoneCounts = useMemo(() => {
    return triagedPatients.reduce(
      (acc, { triage }) => {
        acc[triage.zone]++;
        return acc;
      },
      { red: 0, yellow: 0, green: 0 }
    );
  }, [triagedPatients]);

  // Filter and sort
  const filteredPatients = useMemo(() => {
    let result = triagedPatients;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(({ patient }) =>
        patient.name.toLowerCase().includes(term) ||
        patient.injuryType.toLowerCase().includes(term)
      );
    }

    // Filter by zone
    if (selectedZone !== 'all') {
      result = result.filter(({ triage }) => triage.zone === selectedZone);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.triage.priority - a.triage.priority;
      } else if (sortBy === 'name') {
        return a.patient.name.localeCompare(b.patient.name);
      } else {
        return new Date(b.patient.lastActive).getTime() - new Date(a.patient.lastActive).getTime();
      }
    });

    return result;
  }, [triagedPatients, searchTerm, selectedZone, sortBy]);

  // Zone styling
  const getZoneStyles = (zone: TriageZone) => {
    switch (zone) {
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          badge: 'bg-red-100 text-red-700'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          badge: 'bg-yellow-100 text-yellow-700'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          badge: 'bg-green-100 text-green-700'
        };
    }
  };

  // Pain trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Triage</h2>
          <p className="text-sm text-slate-500">{patients.length} patienter totalt</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <RefreshCw className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Zone Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['red', 'yellow', 'green'] as const).map(zone => {
          const styles = getZoneStyles(zone);
          const isSelected = selectedZone === zone;

          return (
            <button
              key={zone}
              onClick={() => setSelectedZone(isSelected ? 'all' : zone)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${styles.bg} ${styles.border}`
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {styles.icon}
                <span className={`text-2xl font-bold ${isSelected ? styles.text : 'text-slate-700'}`}>
                  {zoneCounts[zone]}
                </span>
              </div>
              <div className={`text-sm font-medium ${isSelected ? styles.text : 'text-slate-600'}`}>
                {zone === 'red' && 'Kräver åtgärd'}
                {zone === 'yellow' && 'Uppföljning'}
                {zone === 'green' && 'På rätt spår'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Sök patient eller diagnos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
        >
          <option value="priority">Sortera: Prioritet</option>
          <option value="name">Sortera: Namn</option>
          <option value="lastActive">Sortera: Senast aktiv</option>
        </select>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Inga patienter matchar filtret</p>
          </div>
        ) : (
          filteredPatients.map(({ patient, triage }) => {
            const styles = getZoneStyles(triage.zone);
            const daysSinceActive = Math.floor(
              (Date.now() - new Date(patient.lastActive).getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={patient.id}
                onClick={() => onPatientSelect?.(patient.id)}
                className={`p-4 rounded-xl border-2 ${styles.bg} ${styles.border} cursor-pointer hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-4">
                  {/* Zone indicator */}
                  <div className={`p-2 rounded-lg ${styles.badge}`}>
                    {styles.icon}
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{patient.name}</h3>
                      <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium text-slate-600">
                        Fas {patient.currentPhase}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{patient.injuryType}</p>

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span>Smärta: {patient.metrics.avgPain}/10</span>
                        {getTrendIcon(patient.metrics.painTrend)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Följsamhet: {patient.metrics.adherence}%</span>
                      </div>
                      {patient.metrics.tsk11Score && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <span>TSK-11: {patient.metrics.tsk11Score}</span>
                        </div>
                      )}
                    </div>

                    {/* Triage reasons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {triage.reasons.slice(0, 3).map((reason, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs font-medium ${styles.badge}`}
                        >
                          {reason}
                        </span>
                      ))}
                      {triage.reasons.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          +{triage.reasons.length - 3} till
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side info */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                      <Clock className="w-4 h-4" />
                      {daysSinceActive === 0 ? 'Idag' :
                        daysSinceActive === 1 ? 'Igår' :
                          `${daysSinceActive} dagar sedan`}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PatientTriageBoard;
