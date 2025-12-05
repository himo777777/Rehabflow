/**
 * Patient Card Component
 * Displays a summary of a patient's rehabilitation progress
 */

import React from 'react';
import { PatientSummary, TrendDirection } from '../../types';

interface PatientCardProps {
  patient: PatientSummary;
  onClick: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const getTrendColor = (trend: TrendDirection) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'worsening':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'improving':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'worsening':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const getTrendLabel = (trend: TrendDirection) => {
    switch (trend) {
      case 'improving':
        return 'Förbättras';
      case 'worsening':
        return 'Försämras';
      default:
        return 'Stabil';
    }
  };

  const getAdherenceColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-semibold text-primary-700">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-800 truncate pr-2">{patient.name}</h3>
            {patient.needsAttention && (
              <span className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </div>

          <p className="text-sm text-slate-600 mb-2 truncate">{patient.diagnosis}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Fas {patient.currentPhase}/{patient.totalPhases}</span>
              <span className={`font-medium ${getAdherenceColor(patient.adherencePercent)}`}>
                {patient.adherencePercent}% följsamhet
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  patient.adherencePercent >= 80 ? 'bg-green-500' :
                  patient.adherencePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${patient.adherencePercent}%` }}
              />
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Pain Level */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-slate-600">{patient.latestPainLevel}/10</span>
              </div>

              {/* Trend */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendColor(patient.painTrend)}`}>
                {getTrendIcon(patient.painTrend)}
                <span>{getTrendLabel(patient.painTrend)}</span>
              </div>
            </div>

            {/* Last Activity */}
            <span className="text-xs text-slate-400">
              Senast: {formatDate(patient.lastActivityDate)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <svg
          className="w-5 h-5 text-slate-300 flex-shrink-0 group-hover:text-primary-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default PatientCard;
