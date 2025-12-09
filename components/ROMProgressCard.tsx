/**
 * ROM Progress Card
 * Displays ROM measurements with visual comparison to normal values
 * Used in ProgramView to show patient's ROM progress
 */

import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { BaselineROM, JointROMData, ROMComparison } from '../types';
import { getNormalROM, calculateROMDeficit } from '../data/clinicalKnowledge';

interface ROMProgressCardProps {
  baseline: BaselineROM;
  patientAge: number;
  showDetails?: boolean;
}

interface JointDisplayData {
  name: string;
  left: number;
  right: number;
  symmetry: number;
  normalValue: number;
  percentOfNormal: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
}

const ROMProgressCard: React.FC<ROMProgressCardProps> = ({
  baseline,
  patientAge,
  showDetails = true
}) => {
  // Build display data from baseline
  const buildDisplayData = (): JointDisplayData[] => {
    const data: JointDisplayData[] = [];

    const addJoint = (
      name: string,
      romData: JointROMData | undefined,
      jointType: string,
      movement: string
    ) => {
      if (!romData) return;

      const normal = getNormalROM(jointType, movement, patientAge) || 140;
      const avgMeasured = (romData.left + romData.right) / 2;
      const percentOfNormal = (avgMeasured / normal) * 100;
      const deficit = calculateROMDeficit(avgMeasured, normal);

      data.push({
        name,
        left: romData.left,
        right: romData.right,
        symmetry: romData.symmetry,
        normalValue: normal,
        percentOfNormal: Math.round(percentOfNormal),
        severity: deficit.severity
      });
    };

    addJoint('Knäböjning', baseline.kneeFlexion, 'knee', 'flexion');
    addJoint('Höftböjning', baseline.hipFlexion, 'hip', 'flexion');
    addJoint('Axelflexion', baseline.shoulderFlexion, 'shoulder', 'flexion');
    addJoint('Axelabduktion', baseline.shoulderAbduction, 'shoulder', 'abduction');
    addJoint('Armbågsböjning', baseline.elbowFlexion, 'elbow', 'flexion');

    return data;
  };

  const displayData = buildDisplayData();

  if (displayData.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'bg-green-500';
      case 'mild': return 'bg-yellow-500';
      case 'moderate': return 'bg-orange-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'normal': return 'Normalt';
      case 'mild': return 'Lätt begränsad';
      case 'moderate': return 'Måttligt begränsad';
      case 'severe': return 'Kraftigt begränsad';
      default: return 'Okänt';
    }
  };

  const avgPercentOfNormal = Math.round(
    displayData.reduce((sum, d) => sum + d.percentOfNormal, 0) / displayData.length
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-xl p-2">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Din rörlighet</h3>
            <p className="text-xs text-gray-500">
              Mätt {new Date(baseline.assessmentDate).toLocaleDateString('sv-SE')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{avgPercentOfNormal}%</div>
          <div className="text-xs text-gray-500">av normalt</div>
        </div>
      </div>

      {/* Joint measurements */}
      {showDetails && (
        <div className="space-y-3">
          {displayData.map((joint, idx) => (
            <div key={idx} className="bg-white/60 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{joint.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  joint.severity === 'normal' ? 'bg-green-100 text-green-700' :
                  joint.severity === 'mild' ? 'bg-yellow-100 text-yellow-700' :
                  joint.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {getSeverityText(joint.severity)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${getSeverityColor(joint.severity)} transition-all`}
                  style={{ width: `${Math.min(100, joint.percentOfNormal)}%` }}
                />
                {/* Normal marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                  style={{ left: '100%' }}
                  title="Normalt värde"
                />
              </div>

              {/* Values */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>V: {joint.left}° | H: {joint.right}°</span>
                <span>Normal: {joint.normalValue}°</span>
              </div>

              {/* Symmetry warning */}
              {joint.symmetry < 85 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                  <AlertCircle className="w-3 h-3" />
                  Sidoskillnad noterad ({joint.symmetry}% symmetri)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI observations */}
      {baseline.aiObservations && baseline.aiObservations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-blue-200">
          <h4 className="text-xs font-medium text-gray-600 mb-2">AI-observationer:</h4>
          <ul className="space-y-1">
            {baseline.aiObservations.map((obs, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-blue-400 mt-0.5">•</span>
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pain warning */}
      {baseline.painDuringTest && (
        <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
          <AlertCircle className="w-4 h-4" />
          Smärta rapporterades under mätningen
        </div>
      )}
    </div>
  );
};

export default ROMProgressCard;
