/**
 * Pain Alert Banner
 *
 * Visar pain spike alerts med severity-baserad styling.
 * Integrerar med painAlertService för acknowledgment.
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  X,
  ChevronDown,
  ChevronUp,
  Bell,
  CheckCircle2,
  TrendingUp,
  Clock,
  MessageCircle
} from 'lucide-react';
import {
  painAlertService,
  PainAlert,
  getAlertColor,
  formatAlertMessage,
  getUnacknowledgedCount
} from '../services/painAlertService';

interface PainAlertBannerProps {
  /** Show only critical alerts */
  criticalOnly?: boolean;
  /** Callback when alert is acknowledged */
  onAcknowledge?: (alert: PainAlert) => void;
  /** Compact mode for dashboard */
  compact?: boolean;
  /** Auto-hide after X seconds (0 = never) */
  autoHide?: number;
}

const PainAlertBanner: React.FC<PainAlertBannerProps> = ({
  criticalOnly = false,
  onAcknowledge,
  compact = false,
  autoHide = 0
}) => {
  const [alerts, setAlerts] = useState<PainAlert[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Load unacknowledged alerts
  useEffect(() => {
    const loadAlerts = () => {
      const unacked = painAlertService.getPainAlerts({
        unacknowledgedOnly: true,
        severity: criticalOnly ? 'critical' : undefined
      });
      setAlerts(unacked);
    };

    loadAlerts();

    // Refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, [criticalOnly]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide > 0 && alerts.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHide * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, alerts]);

  const handleAcknowledge = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      painAlertService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      onAcknowledge?.(alert);
    }
  };

  const handleAcknowledgeAll = () => {
    painAlertService.acknowledgeAllAlerts();
    setAlerts([]);
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  // Compact notification badge
  if (compact) {
    const counts = getUnacknowledgedCount();
    if (counts.total === 0) return null;

    return (
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <Bell className={`w-5 h-5 ${counts.critical > 0 ? 'text-red-400' : 'text-yellow-400'}`} />
        {counts.total > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
            counts.critical > 0 ? 'bg-red-500' : 'bg-yellow-500'
          } text-white`}>
            {counts.total}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const colors = getAlertColor(alert.severity);
        const isExpanded = expandedAlert === alert.id;
        const Icon = alert.severity === 'critical' ? AlertOctagon : AlertTriangle;

        return (
          <div
            key={alert.id}
            className={`
              ${colors.bg} ${colors.border} border-l-4 rounded-xl overflow-hidden
              shadow-lg animate-in slide-in-from-top duration-300
            `}
          >
            {/* Main alert content */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold ${colors.text}`}>
                      {alert.severity === 'critical' ? 'Kritisk varning' : 'Smärtvarning'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(alert.triggeredAt).toLocaleTimeString('sv-SE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className={`text-sm ${colors.text} opacity-90`}>
                    {formatAlertMessage(alert)}
                  </p>

                  {/* Pain change indicator */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Förra:</span>
                      <span className="font-medium text-slate-700">{alert.previousPain}/10</span>
                    </div>
                    <TrendingUp className={`w-4 h-4 ${
                      alert.increase >= 4 ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Nu:</span>
                      <span className={`font-bold ${
                        alert.currentPain >= 8 ? 'text-red-600' : 'text-orange-600'
                      }`}>{alert.currentPain}/10</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      alert.increase >= 4 ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
                    }`}>
                      +{alert.increase} poäng
                    </span>
                  </div>

                  {/* Context info */}
                  {alert.context && (
                    <button
                      onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                      className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 hover:bg-red-200 text-red-600'
                        : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600'
                    }`}
                    title="Markera som sedd"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded context */}
              {isExpanded && alert.context && (
                <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-2">
                  {alert.context.exercise && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-slate-400">Övning:</span>
                      <span>{alert.context.exercise}</span>
                    </div>
                  )}
                  {alert.context.timeOfDay && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{alert.context.timeOfDay}</span>
                    </div>
                  )}
                  {alert.context.triggers && alert.context.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alert.context.triggers.map((trigger, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Critical alert action bar */}
            {alert.severity === 'critical' && (
              <div className="px-4 py-3 bg-red-100/50 border-t border-red-200/50">
                <p className="text-xs text-red-700 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    Vid ihållande hög smärta, kontakta din vårdgivare eller ring 1177.
                  </span>
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Acknowledge all button (if multiple alerts) */}
      {alerts.length > 1 && (
        <button
          onClick={handleAcknowledgeAll}
          className="w-full py-2 px-4 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Markera alla som sedda ({alerts.length})
        </button>
      )}
    </div>
  );
};

export default PainAlertBanner;
