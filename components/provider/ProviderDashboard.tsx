/**
 * Provider Dashboard for RehabFlow
 * Main dashboard for healthcare providers to monitor patients
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PatientSummary, ProviderDashboardStats, TrendDirection } from '../../types';
import PatientList from './PatientList';

interface ProviderDashboardProps {
  onSelectPatient: (patientId: string) => void;
  onInvitePatient: () => void;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onSelectPatient,
  onInvitePatient,
  onNavigateToSettings,
  onSignOut
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProviderDashboardStats | null>(null);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Demo data - in production, this would fetch from Supabase
      const demoStats: ProviderDashboardStats = {
        activePatients: 12,
        averageAdherence: 78,
        newPatientsThisWeek: 3,
        patientsNeedingAttention: 2,
        reportsGeneratedThisMonth: 8
      };

      const demoPatients: PatientSummary[] = [
        {
          id: '1',
          name: 'Anna Svensson',
          email: 'anna.s@email.se',
          diagnosis: 'ACL-rekonstruktion',
          currentPhase: 2,
          totalPhases: 4,
          adherencePercent: 78,
          painTrend: 'improving',
          latestPainLevel: 4,
          startDate: '2024-01-15',
          lastActivityDate: '2024-02-28',
          status: 'active',
          needsAttention: true,
          attentionReason: 'Missat 3 dagar i rad, smärtnivå ökande'
        },
        {
          id: '2',
          name: 'Erik Lindberg',
          email: 'erik.l@email.se',
          diagnosis: 'Ryggsmärta (L4-L5)',
          currentPhase: 3,
          totalPhases: 3,
          adherencePercent: 92,
          painTrend: 'stable',
          latestPainLevel: 2,
          startDate: '2024-01-05',
          lastActivityDate: '2024-02-29',
          status: 'active',
          needsAttention: true,
          attentionReason: 'Fas 3 avslutad, behöver utvärdering'
        },
        {
          id: '3',
          name: 'Maria Karlsson',
          email: 'maria.k@email.se',
          diagnosis: 'Axelimpingement',
          currentPhase: 1,
          totalPhases: 3,
          adherencePercent: 65,
          painTrend: 'worsening',
          latestPainLevel: 6,
          startDate: '2024-02-10',
          lastActivityDate: '2024-02-28',
          status: 'active',
          needsAttention: false
        },
        {
          id: '4',
          name: 'Johan Andersson',
          email: 'johan.a@email.se',
          diagnosis: 'Plantarfasciit',
          currentPhase: 2,
          totalPhases: 2,
          adherencePercent: 88,
          painTrend: 'improving',
          latestPainLevel: 3,
          startDate: '2024-02-01',
          lastActivityDate: '2024-02-29',
          status: 'active',
          needsAttention: false
        },
        {
          id: '5',
          name: 'Lisa Bergström',
          email: 'lisa.b@email.se',
          diagnosis: 'Tennisarmbåge',
          currentPhase: 2,
          totalPhases: 3,
          adherencePercent: 71,
          painTrend: 'stable',
          latestPainLevel: 4,
          startDate: '2024-01-20',
          lastActivityDate: '2024-02-27',
          status: 'active',
          needsAttention: false
        }
      ];

      setStats(demoStats);
      setPatients(demoPatients);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const patientsNeedingAttention = patients.filter(p => p.needsAttention);

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-500">↓</span>;
      case 'worsening':
        return <span className="text-red-500">↑</span>;
      default:
        return <span className="text-slate-400">→</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Laddar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">RehabFlow</h1>
                <p className="text-xs text-slate-500">Vårdgivarportal</p>
              </div>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.displayName?.charAt(0) || 'V'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {user?.displayName || 'Vårdgivare'}
                </span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigateToSettings();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Inställningar
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logga ut
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.activePatients}</p>
              <p className="text-sm text-slate-500">Aktiva patienter</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.averageAdherence}%</p>
              <p className="text-sm text-slate-500">Genomsnittlig följsamhet</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.newPatientsThisWeek}</p>
              <p className="text-sm text-slate-500">Nya denna vecka</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.patientsNeedingAttention}</p>
              <p className="text-sm text-slate-500">Behöver uppmärksamhet</p>
            </div>
          </div>
        )}

        {/* Search & Invite */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Sök patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onInvitePatient}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Bjud in patient
          </button>
        </div>

        {/* Patients Needing Attention */}
        {patientsNeedingAttention.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Patienter som behöver uppmärksamhet
            </h2>
            <div className="space-y-3">
              {patientsNeedingAttention.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        patient.painTrend === 'worsening' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        <p className="text-sm text-slate-600">{patient.attentionReason}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Patients */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Alla patienter ({filteredPatients.length})
          </h2>
          <PatientList
            patients={filteredPatients}
            onSelectPatient={onSelectPatient}
          />
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
