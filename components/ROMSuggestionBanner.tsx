/**
 * ROM Suggestion Banner
 * Non-intrusive banner that AI uses to suggest ROM measurement
 * Patient can accept or decline - fully optional
 */

import React, { useState } from 'react';
import { Activity, X, ChevronRight, Clock } from 'lucide-react';

interface ROMSuggestionBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  reason: string;
  lastMeasurementDate?: string;
  suggestedTests?: string[];
}

const ROMSuggestionBanner: React.FC<ROMSuggestionBannerProps> = ({
  onAccept,
  onDecline,
  reason,
  lastMeasurementDate,
  suggestedTests = []
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDecline = () => {
    setIsDismissed(true);
    onDecline();
  };

  const getDaysSinceLastMeasurement = (): number | null => {
    if (!lastMeasurementDate) return null;
    const lastDate = new Date(lastMeasurementDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSince = getDaysSinceLastMeasurement();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mx-4 my-3 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800">Rörlighetsmätning?</h3>
            <button
              onClick={handleDecline}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Stäng"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">{reason}</p>

          {/* Last measurement info */}
          {daysSince !== null && (
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3 mr-1" />
              Senaste mätning: {daysSince === 0 ? 'idag' : daysSince === 1 ? 'igår' : `${daysSince} dagar sedan`}
            </div>
          )}

          {/* Suggested tests */}
          {suggestedTests.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {suggestedTests.map((test, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {test}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAccept}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              Starta mätning
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDecline}
              className="text-sm text-gray-500 hover:text-gray-700 py-2 px-3"
            >
              Inte nu
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Time estimate */}
      <div className="mt-2 text-center text-xs text-gray-400">
        Tar cirka 2-3 minuter
      </div>
    </div>
  );
};

/**
 * Hook to determine if ROM suggestion should be shown
 */
export const useROMSuggestion = (
  baselineROM?: { assessmentDate: string } | null,
  recentProgressChange?: boolean
): { shouldShow: boolean; reason: string; suggestedTests: string[] } => {
  // No baseline = suggest initial measurement
  if (!baselineROM) {
    return {
      shouldShow: true,
      reason: 'Mät din nuvarande rörlighet för att se dina framsteg över tid.',
      suggestedTests: ['Knäböjning', 'Höftböjning', 'Axellyft']
    };
  }

  // Check days since last measurement
  const lastDate = new Date(baselineROM.assessmentDate);
  const now = new Date();
  const daysSince = Math.ceil((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // More than 14 days = suggest follow-up
  if (daysSince > 14) {
    return {
      shouldShow: true,
      reason: `Det har gått ${daysSince} dagar sedan din senaste mätning. Vill du se hur din rörlighet har utvecklats?`,
      suggestedTests: ['Knäböjning', 'Höftböjning']
    };
  }

  // Progress change reported = suggest measurement
  if (recentProgressChange) {
    return {
      shouldShow: true,
      reason: 'Du har rapporterat förändring i dina besvär. Vill du mäta din rörlighet för att jämföra?',
      suggestedTests: []
    };
  }

  return {
    shouldShow: false,
    reason: '',
    suggestedTests: []
  };
};

export default ROMSuggestionBanner;
