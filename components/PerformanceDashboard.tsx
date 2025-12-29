/**
 * Performance Dashboard
 *
 * Developer tool for monitoring:
 * - AI telemetry (latency, success rates, token usage)
 * - Cache statistics
 * - Circuit breaker status
 * - Rate limiting status
 * - Memory usage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Cpu,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Shield,
  Trash2,
} from 'lucide-react';
import { aiTelemetry, AITelemetryStats } from '../services/aiTelemetry';
import { getCircuitBreakerStats, resetCircuitBreaker } from '../lib/aiClient';
import { rateLimitService, RATE_LIMIT_CONFIGS } from '../services/rateLimitService';
import { useMemoryUsage } from '../hooks';

// ============================================================================
// TYPES
// ============================================================================

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-slate-700">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

// ============================================================================
// STAT CARD
// ============================================================================

const StatCard: React.FC<{
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'slate';
}> = ({ label, value, subValue, trend, color = 'slate' }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-xs font-medium opacity-75">{label}</div>
      <div className="text-lg font-bold flex items-center gap-1">
        {value}
        {trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
        {trend === 'down' && <TrendingUp size={14} className="text-red-500 rotate-180" />}
      </div>
      {subValue && <div className="text-xs opacity-60">{subValue}</div>}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

const ProgressBar: React.FC<{
  value: number;
  max: number;
  label?: string;
  color?: string;
}> = ({ value, max, label, color = 'bg-primary-500' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-slate-600">
          <span>{label}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PerformanceDashboard: React.FC<{
  onClose?: () => void;
}> = ({ onClose }) => {
  const [telemetryStats, setTelemetryStats] = useState<AITelemetryStats | null>(null);
  const [circuitStats, setCircuitStats] = useState(getCircuitBreakerStats());
  const [rateLimitStats, setRateLimitStats] = useState(rateLimitService.getStats());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const memoryInfo = useMemoryUsage(2000);

  // Refresh stats
  const refresh = useCallback(() => {
    setTelemetryStats(aiTelemetry.getStats());
    setCircuitStats(getCircuitBreakerStats());
    setRateLimitStats(rateLimitService.getStats());
    setLastUpdate(new Date());
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Format bytes
  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format ms
  const formatMs = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Circuit state color
  const getCircuitColor = (state: string): 'green' | 'red' | 'yellow' => {
    switch (state) {
      case 'CLOSED': return 'green';
      case 'OPEN': return 'red';
      case 'HALF_OPEN': return 'yellow';
      default: return 'green';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Performance Dashboard</h2>
              <p className="text-xs text-slate-400">
                Uppdaterad: {lastUpdate.toLocaleTimeString('sv-SE')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Uppdatera"
            >
              <RefreshCw size={18} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* AI Telemetry */}
          <Section
            title="AI Telemetri"
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
          >
            {telemetryStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    label="Totala anrop"
                    value={telemetryStats.totalCalls}
                    color="blue"
                  />
                  <StatCard
                    label="Lyckade"
                    value={telemetryStats.successfulCalls}
                    subValue={`${(telemetryStats.successRate * 100).toFixed(1)}%`}
                    color="green"
                  />
                  <StatCard
                    label="Misslyckade"
                    value={telemetryStats.failedCalls}
                    color={telemetryStats.failedCalls > 0 ? 'red' : 'slate'}
                  />
                  <StatCard
                    label="Cachade"
                    value={telemetryStats.cachedCalls}
                    subValue={`${(telemetryStats.cacheHitRate * 100).toFixed(1)}%`}
                    color="yellow"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    label="Avg latens"
                    value={formatMs(telemetryStats.avgLatencyMs)}
                  />
                  <StatCard
                    label="P50 latens"
                    value={formatMs(telemetryStats.p50LatencyMs)}
                  />
                  <StatCard
                    label="P95 latens"
                    value={formatMs(telemetryStats.p95LatencyMs)}
                  />
                  <StatCard
                    label="P99 latens"
                    value={formatMs(telemetryStats.p99LatencyMs)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Input tokens"
                    value={telemetryStats.totalInputTokens.toLocaleString()}
                  />
                  <StatCard
                    label="Output tokens"
                    value={telemetryStats.totalOutputTokens.toLocaleString()}
                  />
                </div>

                {/* Error breakdown */}
                {Object.keys(telemetryStats.errorBreakdown).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">
                      Felfördelning
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(telemetryStats.errorBreakdown).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-red-600">{type}</span>
                          <span className="font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      aiTelemetry.clear();
                      refresh();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Rensa telemetri
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Ingen telemetridata tillgänglig</p>
            )}
          </Section>

          {/* Circuit Breaker */}
          <Section
            title="Circuit Breaker"
            icon={<Shield className="w-5 h-5 text-purple-500" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Status"
                  value={circuitStats.state}
                  color={getCircuitColor(circuitStats.state)}
                />
                <StatCard
                  label="Totala requests"
                  value={circuitStats.totalRequests}
                />
                <StatCard
                  label="Lyckade"
                  value={circuitStats.totalSuccesses}
                  color="green"
                />
                <StatCard
                  label="Misslyckade"
                  value={circuitStats.totalFailures}
                  color={circuitStats.totalFailures > 0 ? 'red' : 'slate'}
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Aktuella fel i fönster:</span>
                <span className="font-mono">{circuitStats.failures}</span>
                <span className="text-slate-400">/ 5 (threshold)</span>
              </div>

              {circuitStats.lastFailure && (
                <p className="text-xs text-slate-500">
                  Senaste fel: {new Date(circuitStats.lastFailure).toLocaleString('sv-SE')}
                </p>
              )}

              <button
                onClick={() => {
                  resetCircuitBreaker();
                  refresh();
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
              >
                <RefreshCw size={14} />
                Återställ circuit breaker
              </button>
            </div>
          </Section>

          {/* Rate Limiting */}
          <Section
            title="Rate Limiting"
            icon={<Clock className="w-5 h-5 text-blue-500" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Aktiva nycklar"
                  value={rateLimitStats.totalKeys}
                />
                <StatCard
                  label="Blockerade"
                  value={rateLimitStats.blockedKeys}
                  color={rateLimitStats.blockedKeys > 0 ? 'red' : 'green'}
                />
              </div>

              {rateLimitStats.limits.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">
                    Aktiva limits
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {rateLimitStats.limits.slice(0, 10).map(({ key, state }) => (
                      <div
                        key={key}
                        className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded"
                      >
                        <span className="font-mono truncate flex-1">{key}</span>
                        <span className="ml-2">
                          {state.blockedUntil && state.blockedUntil > Date.now() ? (
                            <span className="text-red-600">Blockerad</span>
                          ) : (
                            <span className="text-slate-600">{state.count} req</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  rateLimitService.resetAll();
                  refresh();
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Rensa alla rate limits
              </button>
            </div>
          </Section>

          {/* Memory Usage */}
          <Section
            title="Minnesanvändning"
            icon={<Cpu className="w-5 h-5 text-green-500" />}
            defaultOpen={false}
          >
            {memoryInfo.usedJSHeapSize !== null ? (
              <div className="space-y-4">
                <ProgressBar
                  value={memoryInfo.usedJSHeapSize}
                  max={memoryInfo.jsHeapSizeLimit || memoryInfo.usedJSHeapSize}
                  label="JS Heap användning"
                  color="bg-green-500"
                />

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="Använt"
                    value={formatBytes(memoryInfo.usedJSHeapSize)}
                    color="green"
                  />
                  <StatCard
                    label="Totalt"
                    value={formatBytes(memoryInfo.totalJSHeapSize)}
                  />
                  <StatCard
                    label="Limit"
                    value={formatBytes(memoryInfo.jsHeapSizeLimit)}
                  />
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                Minnesdata är endast tillgänglig i Chrome
              </p>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          💡 Denna dashboard är endast synlig i utvecklingsläge
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
