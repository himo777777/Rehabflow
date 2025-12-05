/**
 * Patient List Component
 * Displays a list of patients with sorting and filtering options
 */

import React, { useState, useMemo } from 'react';
import { PatientSummary, PatientStatus } from '../../types';
import PatientCard from './PatientCard';

interface PatientListProps {
  patients: PatientSummary[];
  onSelectPatient: (patientId: string) => void;
}

type SortOption = 'name' | 'adherence' | 'pain' | 'lastActivity';

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient }) => {
  const [sortBy, setSortBy] = useState<SortOption>('lastActivity');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const sortedAndFilteredPatients = useMemo(() => {
    let result = [...patients];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'adherence':
          return b.adherencePercent - a.adherencePercent;
        case 'pain':
          return b.latestPainLevel - a.latestPainLevel;
        case 'lastActivity':
        default:
          return new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime();
      }
    });

    return result;
  }, [patients, sortBy, statusFilter]);

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Inga patienter</h3>
        <p className="text-slate-600">
          Du har inga patienter registrerade än. Bjud in patienter för att komma igång.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Sort & Filter */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="lastActivity">Senaste aktivitet</option>
              <option value="name">Namn</option>
              <option value="adherence">Följsamhet</option>
              <option value="pain">Smärtnivå</option>
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'all')}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Alla status</option>
              <option value="active">Aktiva</option>
              <option value="paused">Pausade</option>
              <option value="discharged">Utskrivna</option>
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Patient List/Grid */}
      {sortedAndFilteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-slate-600">Inga patienter matchar dina filter.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {sortedAndFilteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => onSelectPatient(patient.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAndFilteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => onSelectPatient(patient.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;
