/**
 * ROM Tracking Service
 * Tracks ROM measurements over time and calculates trends
 */

import { BaselineROM, JointROMData } from '../types';
import { getNormalROM, calculateROMDeficit } from '../data/clinicalKnowledge';

export interface ROMHistory {
  measurements: BaselineROM[];
  lastUpdated: string;
}

export interface ROMTrend {
  joint: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'stable' | 'declining';
  weeklyRate: number; // degrees per week
}

export interface ROMComparisonResult {
  joint: string;
  current: number;
  baseline: number;
  normal: number;
  percentOfNormal: number;
  percentOfBaseline: number;
  improvement: number;
  status: 'improved' | 'maintained' | 'decreased';
}

const ROM_HISTORY_KEY = 'rehabflow_rom_history';

/**
 * Save a ROM measurement to history
 */
export function saveROMToHistory(baseline: BaselineROM): void {
  const history = getROMHistory();

  // Add new measurement
  history.measurements.push(baseline);
  history.lastUpdated = new Date().toISOString();

  // Keep only last 20 measurements
  if (history.measurements.length > 20) {
    history.measurements = history.measurements.slice(-20);
  }

  localStorage.setItem(ROM_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Get ROM measurement history
 */
export function getROMHistory(): ROMHistory {
  const stored = localStorage.getItem(ROM_HISTORY_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { measurements: [], lastUpdated: '' };
    }
  }
  return { measurements: [], lastUpdated: '' };
}

/**
 * Calculate ROM trends from history
 */
export function calculateROMTrends(patientAge: number): ROMTrend[] {
  const history = getROMHistory();
  if (history.measurements.length < 2) {
    return [];
  }

  const trends: ROMTrend[] = [];
  const latest = history.measurements[history.measurements.length - 1];
  const previous = history.measurements[history.measurements.length - 2];

  const joints: Array<{ key: keyof BaselineROM; name: string; jointType: string; movement: string }> = [
    { key: 'kneeFlexion', name: 'Knäböjning', jointType: 'knee', movement: 'flexion' },
    { key: 'hipFlexion', name: 'Höftböjning', jointType: 'hip', movement: 'flexion' },
    { key: 'shoulderFlexion', name: 'Axelflexion', jointType: 'shoulder', movement: 'flexion' },
    { key: 'shoulderAbduction', name: 'Axelabduktion', jointType: 'shoulder', movement: 'abduction' },
    { key: 'elbowFlexion', name: 'Armbågsböjning', jointType: 'elbow', movement: 'flexion' },
  ];

  for (const joint of joints) {
    const latestData = latest[joint.key] as JointROMData | undefined;
    const previousData = previous[joint.key] as JointROMData | undefined;

    if (!latestData || !previousData) continue;

    const currentAvg = (latestData.left + latestData.right) / 2;
    const previousAvg = (previousData.left + previousData.right) / 2;
    const change = currentAvg - previousAvg;
    const changePercent = previousAvg > 0 ? (change / previousAvg) * 100 : 0;

    // Calculate weekly rate
    const daysBetween = Math.max(1,
      (new Date(latest.assessmentDate).getTime() - new Date(previous.assessmentDate).getTime())
      / (1000 * 60 * 60 * 24)
    );
    const weeklyRate = (change / daysBetween) * 7;

    let trend: 'improving' | 'stable' | 'declining';
    if (change > 3) trend = 'improving';
    else if (change < -3) trend = 'declining';
    else trend = 'stable';

    trends.push({
      joint: joint.name,
      currentValue: Math.round(currentAvg),
      previousValue: Math.round(previousAvg),
      change: Math.round(change),
      changePercent: Math.round(changePercent * 10) / 10,
      trend,
      weeklyRate: Math.round(weeklyRate * 10) / 10
    });
  }

  return trends;
}

/**
 * Compare current ROM to baseline
 */
export function compareROMToBaseline(
  current: BaselineROM,
  baseline: BaselineROM,
  patientAge: number
): ROMComparisonResult[] {
  const results: ROMComparisonResult[] = [];

  const joints: Array<{ key: keyof BaselineROM; name: string; jointType: string; movement: string }> = [
    { key: 'kneeFlexion', name: 'Knäböjning', jointType: 'knee', movement: 'flexion' },
    { key: 'hipFlexion', name: 'Höftböjning', jointType: 'hip', movement: 'flexion' },
    { key: 'shoulderFlexion', name: 'Axelflexion', jointType: 'shoulder', movement: 'flexion' },
    { key: 'shoulderAbduction', name: 'Axelabduktion', jointType: 'shoulder', movement: 'abduction' },
    { key: 'elbowFlexion', name: 'Armbågsböjning', jointType: 'elbow', movement: 'flexion' },
  ];

  for (const joint of joints) {
    const currentData = current[joint.key] as JointROMData | undefined;
    const baselineData = baseline[joint.key] as JointROMData | undefined;

    if (!currentData || !baselineData) continue;

    const currentAvg = (currentData.left + currentData.right) / 2;
    const baselineAvg = (baselineData.left + baselineData.right) / 2;
    const normalValue = getNormalROM(joint.jointType, joint.movement, patientAge) || 140;

    const improvement = currentAvg - baselineAvg;
    const percentOfNormal = (currentAvg / normalValue) * 100;
    const percentOfBaseline = baselineAvg > 0 ? (currentAvg / baselineAvg) * 100 : 100;

    let status: 'improved' | 'maintained' | 'decreased';
    if (improvement > 5) status = 'improved';
    else if (improvement < -5) status = 'decreased';
    else status = 'maintained';

    results.push({
      joint: joint.name,
      current: Math.round(currentAvg),
      baseline: Math.round(baselineAvg),
      normal: normalValue,
      percentOfNormal: Math.round(percentOfNormal),
      percentOfBaseline: Math.round(percentOfBaseline),
      improvement: Math.round(improvement),
      status
    });
  }

  return results;
}

/**
 * Get summary statistics for ROM history
 */
export function getROMSummaryStats(patientAge: number): {
  totalMeasurements: number;
  averageImprovement: number;
  bestJoint: string | null;
  needsAttention: string | null;
} {
  const history = getROMHistory();

  if (history.measurements.length < 2) {
    return {
      totalMeasurements: history.measurements.length,
      averageImprovement: 0,
      bestJoint: null,
      needsAttention: null
    };
  }

  const first = history.measurements[0];
  const latest = history.measurements[history.measurements.length - 1];
  const comparisons = compareROMToBaseline(latest, first, patientAge);

  let totalImprovement = 0;
  let bestImprovement = -Infinity;
  let worstImprovement = Infinity;
  let bestJoint: string | null = null;
  let needsAttention: string | null = null;

  for (const comp of comparisons) {
    totalImprovement += comp.improvement;

    if (comp.improvement > bestImprovement) {
      bestImprovement = comp.improvement;
      bestJoint = comp.joint;
    }

    if (comp.improvement < worstImprovement) {
      worstImprovement = comp.improvement;
      needsAttention = comp.joint;
    }
  }

  return {
    totalMeasurements: history.measurements.length,
    averageImprovement: comparisons.length > 0 ? Math.round(totalImprovement / comparisons.length) : 0,
    bestJoint,
    needsAttention: worstImprovement < 0 ? needsAttention : null
  };
}

/**
 * Format trend for display
 */
export function formatTrendMessage(trend: ROMTrend): string {
  if (trend.trend === 'improving') {
    return `${trend.joint}: +${trend.change}° (${trend.changePercent}% förbättring)`;
  } else if (trend.trend === 'declining') {
    return `${trend.joint}: ${trend.change}° (behöver uppmärksamhet)`;
  } else {
    return `${trend.joint}: stabil (±${Math.abs(trend.change)}°)`;
  }
}

export default {
  saveROMToHistory,
  getROMHistory,
  calculateROMTrends,
  compareROMToBaseline,
  getROMSummaryStats,
  formatTrendMessage
};
