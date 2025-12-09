/**
 * Performance Monitor Component - Sprint 5.3
 *
 * Development-only dashboard for monitoring app performance.
 * Toggle with Ctrl+Shift+P or by setting ?perf=1 in URL.
 *
 * Features:
 * - Real-time FPS counter
 * - Frame time graph
 * - Memory usage (when available)
 * - Component render counts
 * - Animation frame timing
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Activity, X, ChevronDown, ChevronUp, Cpu, Clock, Database } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  avgFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  memoryUsed: number | null;
  memoryTotal: number | null;
  jsHeapSize: number | null;
  renderCount: number;
  lastRenderTime: number;
}

interface FrameTimeEntry {
  time: number;
  frameTime: number;
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

class PerformanceTracker {
  private frameCount = 0;
  private lastTime = performance.now();
  private lastFpsUpdate = performance.now();
  private frameTimes: FrameTimeEntry[] = [];
  private maxFrameHistory = 120; // 2 seconds at 60fps
  private renderCount = 0;

  private stats: PerformanceStats = {
    fps: 0,
    frameTime: 0,
    avgFrameTime: 0,
    minFrameTime: Infinity,
    maxFrameTime: 0,
    memoryUsed: null,
    memoryTotal: null,
    jsHeapSize: null,
    renderCount: 0,
    lastRenderTime: 0,
  };

  private subscribers: Set<(stats: PerformanceStats) => void> = new Set();
  private rafId: number | null = null;

  start(): void {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.tick();
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;

    // Store frame time for graph
    this.frameTimes.push({ time: now, frameTime });
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    // Update FPS every 500ms
    if (now - this.lastFpsUpdate >= 500) {
      const elapsed = now - this.lastFpsUpdate;
      const fps = Math.round((this.frameCount / elapsed) * 1000);

      // Calculate frame time stats
      const recentFrameTimes = this.frameTimes.slice(-60).map(f => f.frameTime);
      const avgFrameTime = recentFrameTimes.reduce((a, b) => a + b, 0) / recentFrameTimes.length;
      const minFrameTime = Math.min(...recentFrameTimes);
      const maxFrameTime = Math.max(...recentFrameTimes);

      // Get memory info if available
      let memoryUsed = null;
      let memoryTotal = null;
      let jsHeapSize = null;

      if ('memory' in performance) {
        const memory = (performance as any).memory;
        jsHeapSize = memory.usedJSHeapSize;
        memoryUsed = memory.usedJSHeapSize;
        memoryTotal = memory.totalJSHeapSize;
      }

      this.stats = {
        fps,
        frameTime,
        avgFrameTime,
        minFrameTime,
        maxFrameTime,
        memoryUsed,
        memoryTotal,
        jsHeapSize,
        renderCount: this.renderCount,
        lastRenderTime: now,
      };

      this.notify();

      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  subscribe(callback: (stats: PerformanceStats) => void): () => void {
    this.subscribers.add(callback);
    // Send current stats immediately
    callback(this.stats);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb(this.stats));
  }

  incrementRenderCount(): void {
    this.renderCount++;
  }

  getFrameTimeHistory(): FrameTimeEntry[] {
    return [...this.frameTimes];
  }

  getStats(): PerformanceStats {
    return { ...this.stats };
  }

  reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.renderCount = 0;
    this.stats = {
      fps: 0,
      frameTime: 0,
      avgFrameTime: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0,
      memoryUsed: null,
      memoryTotal: null,
      jsHeapSize: null,
      renderCount: 0,
      lastRenderTime: 0,
    };
  }
}

// Singleton tracker
export const performanceTracker = new PerformanceTracker();

// ============================================================================
// FPS GRAPH COMPONENT
// ============================================================================

interface FpsGraphProps {
  data: FrameTimeEntry[];
  width: number;
  height: number;
}

const FpsGraph = memo(({ data, width, height }: FpsGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    if (data.length < 2) return;

    // Draw frame time line
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;

    const maxFrameTime = 33.33; // Cap at ~30fps for scaling
    const xStep = width / (data.length - 1);

    data.forEach((entry, i) => {
      const x = i * xStep;
      const normalizedFrameTime = Math.min(entry.frameTime, maxFrameTime) / maxFrameTime;
      const y = height - (normalizedFrameTime * height);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw 60fps line (16.67ms)
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e40';
    ctx.setLineDash([4, 4]);
    const fps60Line = height - ((16.67 / maxFrameTime) * height);
    ctx.moveTo(0, fps60Line);
    ctx.lineTo(width, fps60Line);
    ctx.stroke();

    // Draw 30fps line (33.33ms)
    ctx.beginPath();
    ctx.strokeStyle = '#ef444440';
    const fps30Line = height - ((33.33 / maxFrameTime) * height);
    ctx.moveTo(0, fps30Line);
    ctx.lineTo(width, fps30Line);
    ctx.stroke();

    ctx.setLineDash([]);
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded"
    />
  );
});

FpsGraph.displayName = 'FpsGraph';

// ============================================================================
// PERFORMANCE MONITOR COMPONENT
// ============================================================================

interface PerformanceMonitorProps {
  /** Force show even in production */
  forceShow?: boolean;
  /** Initial position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

const PerformanceMonitorComponent: React.FC<PerformanceMonitorProps> = ({
  forceShow = false,
  position = 'bottom-right',
  defaultCollapsed = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [frameHistory, setFrameHistory] = useState<FrameTimeEntry[]>([]);

  // Check if we should show the monitor
  useEffect(() => {
    // Only show in development or if forceShow
    const isDev = process.env.NODE_ENV === 'development';
    const hasUrlParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perf');

    if (isDev || forceShow || hasUrlParam) {
      setIsVisible(true);
      performanceTracker.start();
    }

    return () => {
      performanceTracker.stop();
    };
  }, [forceShow]);

  // Subscribe to stats updates
  useEffect(() => {
    if (!isVisible) return;

    const unsubscribe = performanceTracker.subscribe((newStats) => {
      setStats(newStats);
      setFrameHistory(performanceTracker.getFrameTimeHistory());
    });

    return unsubscribe;
  }, [isVisible]);

  // Keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => {
          if (!prev) {
            performanceTracker.start();
          } else {
            performanceTracker.stop();
          }
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // FPS color based on performance
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Format bytes
  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9999] font-mono text-xs bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 shadow-xl select-none`}
      style={{ minWidth: '200px' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-slate-700 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          <span className="text-slate-300 font-bold">Performance</span>
        </div>
        <div className="flex items-center gap-2">
          {stats && (
            <span className={`font-bold ${getFpsColor(stats.fps)}`}>
              {stats.fps} FPS
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              performanceTracker.stop();
            }}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <X size={12} className="text-slate-400" />
          </button>
          {isCollapsed ? (
            <ChevronDown size={14} className="text-slate-400" />
          ) : (
            <ChevronUp size={14} className="text-slate-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && stats && (
        <div className="p-3 space-y-3">
          {/* FPS Graph */}
          <div>
            <div className="text-slate-500 mb-1">Frame Time</div>
            <FpsGraph data={frameHistory} width={180} height={40} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Frame Time */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Clock size={10} />
                <span>Frame</span>
              </div>
              <div className="text-slate-200">
                {stats.avgFrameTime.toFixed(1)}ms
              </div>
              <div className="text-[10px] text-slate-500">
                {stats.minFrameTime.toFixed(1)} - {stats.maxFrameTime.toFixed(1)}
              </div>
            </div>

            {/* CPU */}
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Cpu size={10} />
                <span>FPS</span>
              </div>
              <div className={getFpsColor(stats.fps)}>
                {stats.fps}
              </div>
              <div className="text-[10px] text-slate-500">
                Target: 60
              </div>
            </div>
          </div>

          {/* Memory (if available) */}
          {stats.memoryUsed !== null && (
            <div className="bg-slate-800 rounded p-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Database size={10} />
                <span>Memory</span>
              </div>
              <div className="text-slate-200">
                {formatBytes(stats.memoryUsed)}
              </div>
              {stats.memoryTotal && (
                <div className="text-[10px] text-slate-500">
                  / {formatBytes(stats.memoryTotal)}
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          <div className="text-[10px] text-slate-600 text-center">
            Ctrl+Shift+P to toggle
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

// Only render in development by default
const PerformanceMonitor = memo(PerformanceMonitorComponent);
PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to track render counts for debugging
 */
export function useRenderCount(componentName: string): number {
  const countRef = useRef(0);
  countRef.current++;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      performanceTracker.incrementRenderCount();
    }
  });

  return countRef.current;
}

/**
 * Hook to get current performance stats
 */
export function usePerformanceStats(): PerformanceStats | null {
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    performanceTracker.start();
    const unsubscribe = performanceTracker.subscribe(setStats);

    return () => {
      unsubscribe();
    };
  }, []);

  return stats;
}
