/**
 * Pain Alert Service
 *
 * Automatiska varningar vid smärtökning:
 * - WARNING: +2 poäng ökning
 * - CRITICAL: smärta ≥8 eller +4 poäng ökning
 * - Provider-notifiering vid kritiska alerts
 * - Historik över alerts
 */

import { storageService } from './storageService';

// ============================================
// TYPES
// ============================================

export type AlertSeverity = 'warning' | 'critical';

export interface PainAlert {
  id: string;
  triggeredAt: string;
  previousPain: number;
  currentPain: number;
  increase: number;
  severity: AlertSeverity;
  acknowledged: boolean;
  acknowledgedAt?: string;
  context?: {
    exercise?: string;
    timeOfDay?: string;
    triggers?: string[];
  };
}

export interface PainAlertConfig {
  warningThreshold: number;      // Default: 2
  criticalThreshold: number;     // Default: 4
  criticalAbsoluteLevel: number; // Default: 8
  notifyProvider: boolean;       // Default: true for critical
  cooldownMinutes: number;       // Default: 60 (prevent alert spam)
}

// ============================================
// CONSTANTS
// ============================================

const ALERTS_STORAGE_KEY = 'rehabflow_pain_alerts';
const CONFIG_STORAGE_KEY = 'rehabflow_pain_alert_config';
const LAST_ALERT_KEY = 'rehabflow_last_pain_alert';

const DEFAULT_CONFIG: PainAlertConfig = {
  warningThreshold: 2,
  criticalThreshold: 4,
  criticalAbsoluteLevel: 8,
  notifyProvider: true,
  cooldownMinutes: 60
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getConfig(): PainAlertConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: PainAlertConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function getStoredAlerts(): PainAlert[] {
  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PainAlert[]): void {
  localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
}

function getLastAlertTime(): number | null {
  try {
    const stored = localStorage.getItem(LAST_ALERT_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
}

function setLastAlertTime(): void {
  localStorage.setItem(LAST_ALERT_KEY, Date.now().toString());
}

function isInCooldown(config: PainAlertConfig): boolean {
  const lastAlert = getLastAlertTime();
  if (!lastAlert) return false;

  const cooldownMs = config.cooldownMinutes * 60 * 1000;
  return Date.now() - lastAlert < cooldownMs;
}

/**
 * Get the previous pain level from history
 */
function getPreviousPainLevel(): number | null {
  const painHistory = storageService.getPainHistory();
  const dates = Object.keys(painHistory).sort().reverse();

  // Get yesterday's or most recent previous pain
  for (const date of dates) {
    const log = painHistory[date];
    if (log.postWorkout?.painLevel !== undefined) {
      return log.postWorkout.painLevel;
    }
    if (log.preWorkout?.painLevel !== undefined) {
      return log.preWorkout.painLevel;
    }
  }

  return null;
}

/**
 * Determine alert severity based on pain change
 */
function determineSeverity(
  currentPain: number,
  previousPain: number,
  config: PainAlertConfig
): AlertSeverity | null {
  const increase = currentPain - previousPain;

  // Critical: Absolute high pain or large increase
  if (currentPain >= config.criticalAbsoluteLevel || increase >= config.criticalThreshold) {
    return 'critical';
  }

  // Warning: Moderate increase
  if (increase >= config.warningThreshold) {
    return 'warning';
  }

  return null;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Check if current pain level triggers an alert
 */
export function checkPainSpike(
  currentPain: number,
  context?: PainAlert['context']
): PainAlert | null {
  const config = getConfig();

  // Check cooldown
  if (isInCooldown(config)) {
    return null;
  }

  // Get previous pain level
  const previousPain = getPreviousPainLevel();
  if (previousPain === null) {
    // No previous data to compare
    return null;
  }

  // Determine if we need an alert
  const severity = determineSeverity(currentPain, previousPain, config);
  if (!severity) {
    return null;
  }

  // Create alert
  const alert: PainAlert = {
    id: generateAlertId(),
    triggeredAt: new Date().toISOString(),
    previousPain,
    currentPain,
    increase: currentPain - previousPain,
    severity,
    acknowledged: false,
    context
  };

  // Save alert
  const alerts = getStoredAlerts();
  alerts.unshift(alert);

  // Keep only last 50 alerts
  if (alerts.length > 50) {
    alerts.splice(50);
  }

  saveAlerts(alerts);
  setLastAlertTime();

  return alert;
}

/**
 * Get all pain alerts
 */
export function getPainAlerts(options?: {
  unacknowledgedOnly?: boolean;
  severity?: AlertSeverity;
  limit?: number;
}): PainAlert[] {
  let alerts = getStoredAlerts();

  if (options?.unacknowledgedOnly) {
    alerts = alerts.filter(a => !a.acknowledged);
  }

  if (options?.severity) {
    alerts = alerts.filter(a => a.severity === options.severity);
  }

  if (options?.limit) {
    alerts = alerts.slice(0, options.limit);
  }

  return alerts;
}

/**
 * Get unacknowledged alert count
 */
export function getUnacknowledgedCount(): { warning: number; critical: number; total: number } {
  const alerts = getPainAlerts({ unacknowledgedOnly: true });

  return {
    warning: alerts.filter(a => a.severity === 'warning').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    total: alerts.length
  };
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alertId: string): boolean {
  const alerts = getStoredAlerts();
  const index = alerts.findIndex(a => a.id === alertId);

  if (index === -1) {
    return false;
  }

  alerts[index].acknowledged = true;
  alerts[index].acknowledgedAt = new Date().toISOString();
  saveAlerts(alerts);

  return true;
}

/**
 * Acknowledge all alerts
 */
export function acknowledgeAllAlerts(): number {
  const alerts = getStoredAlerts();
  let count = 0;

  alerts.forEach(alert => {
    if (!alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      count++;
    }
  });

  saveAlerts(alerts);
  return count;
}

/**
 * Get alert statistics
 */
export function getAlertStats(days: number = 30): {
  totalAlerts: number;
  warningCount: number;
  criticalCount: number;
  avgIncrease: number;
  mostCommonContext: string | null;
} {
  const alerts = getStoredAlerts();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recentAlerts = alerts.filter(
    a => new Date(a.triggeredAt) >= cutoff
  );

  if (recentAlerts.length === 0) {
    return {
      totalAlerts: 0,
      warningCount: 0,
      criticalCount: 0,
      avgIncrease: 0,
      mostCommonContext: null
    };
  }

  const warningCount = recentAlerts.filter(a => a.severity === 'warning').length;
  const criticalCount = recentAlerts.filter(a => a.severity === 'critical').length;
  const avgIncrease = recentAlerts.reduce((sum, a) => sum + a.increase, 0) / recentAlerts.length;

  // Find most common context
  const contextCounts: Record<string, number> = {};
  recentAlerts.forEach(alert => {
    if (alert.context?.exercise) {
      contextCounts[alert.context.exercise] = (contextCounts[alert.context.exercise] || 0) + 1;
    }
  });

  const sortedContexts = Object.entries(contextCounts).sort((a, b) => b[1] - a[1]);
  const mostCommonContext = sortedContexts.length > 0 ? sortedContexts[0][0] : null;

  return {
    totalAlerts: recentAlerts.length,
    warningCount,
    criticalCount,
    avgIncrease: Math.round(avgIncrease * 10) / 10,
    mostCommonContext
  };
}

/**
 * Update alert configuration
 */
export function updateConfig(updates: Partial<PainAlertConfig>): PainAlertConfig {
  const current = getConfig();
  const updated = { ...current, ...updates };
  saveConfig(updated);
  return updated;
}

/**
 * Get current configuration
 */
export function getAlertConfig(): PainAlertConfig {
  return getConfig();
}

/**
 * Clear all alerts (for testing/reset)
 */
export function clearAllAlerts(): void {
  localStorage.removeItem(ALERTS_STORAGE_KEY);
  localStorage.removeItem(LAST_ALERT_KEY);
}

/**
 * Format alert message for display
 */
export function formatAlertMessage(alert: PainAlert): string {
  if (alert.severity === 'critical') {
    if (alert.currentPain >= 8) {
      return `Kritisk smärtnivå (${alert.currentPain}/10). Överväg vila och kontakta vårdgivare vid behov.`;
    }
    return `Kraftig smärtökning (+${alert.increase} poäng). Ta det lugnt och överväg att pausa träningen.`;
  }

  return `Smärtan har ökat med ${alert.increase} poäng sedan förra gången. Var uppmärksam på hur du mår.`;
}

/**
 * Get alert icon based on severity
 */
export function getAlertIcon(severity: AlertSeverity): string {
  return severity === 'critical' ? '🚨' : '⚠️';
}

/**
 * Get alert color based on severity
 */
export function getAlertColor(severity: AlertSeverity): {
  bg: string;
  text: string;
  border: string;
} {
  if (severity === 'critical') {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-400'
    };
  }

  return {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-400'
  };
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const painAlertService = {
  checkPainSpike,
  getPainAlerts,
  getUnacknowledgedCount,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  getAlertStats,
  updateConfig,
  getAlertConfig,
  clearAllAlerts,
  formatAlertMessage,
  getAlertIcon,
  getAlertColor
};

export default painAlertService;
