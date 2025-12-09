/**
 * Session Export Service - Sprint 5.5
 *
 * Allows users to export their training data in various formats.
 * Supports JSON, CSV, and PDF exports.
 *
 * Features:
 * - Export single session or multiple sessions
 * - Multiple format support (JSON, CSV, PDF)
 * - Progress data aggregation
 * - Clinical report generation
 * - Data anonymization option
 */

import { MovementSession } from '../types';
import { indexedDBService } from './indexedDBService';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'pdf';

export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Include landmark data (can be large) */
  includeLandmarks: boolean;
  /** Include detailed metrics */
  includeMetrics: boolean;
  /** Anonymize personal data */
  anonymize: boolean;
  /** Date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Exercise name filter */
  exerciseFilter?: string[];
}

export interface ExportedData {
  exportDate: string;
  version: string;
  summary: {
    totalSessions: number;
    totalDuration: number;
    exerciseTypes: string[];
    dateRange: { start: string; end: string };
  };
  sessions: ExportedSession[];
}

export interface ExportedSession {
  id: string;
  exerciseName: string;
  date: string;
  duration: number;
  completionRate: number;
  averageFormScore?: number;
  metrics?: Record<string, number>;
  phases?: Array<{
    name: string;
    duration: number;
    score?: number;
  }>;
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'json',
  includeLandmarks: false,
  includeMetrics: true,
  anonymize: false,
};

// ============================================================================
// SESSION EXPORT SERVICE
// ============================================================================

class SessionExportService {
  // --------------------------------------------------------------------------
  // DATA COLLECTION
  // --------------------------------------------------------------------------

  /**
   * Get sessions for export based on options
   */
  private async getSessions(options: ExportOptions): Promise<MovementSession[]> {
    let sessions = await indexedDBService.getMovementSessions();

    // Filter by date range
    if (options.dateRange) {
      const startTime = options.dateRange.start.getTime();
      const endTime = options.dateRange.end.getTime();

      sessions = sessions.filter((s) => {
        const sessionTime = new Date(s.sessionDate).getTime();
        return sessionTime >= startTime && sessionTime <= endTime;
      });
    }

    // Filter by exercise
    if (options.exerciseFilter && options.exerciseFilter.length > 0) {
      sessions = sessions.filter((s) =>
        options.exerciseFilter!.includes(s.exerciseName)
      );
    }

    // Sort by date
    sessions.sort((a, b) =>
      new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );

    return sessions;
  }

  /**
   * Transform sessions for export
   */
  private transformSessions(
    sessions: MovementSession[],
    options: ExportOptions
  ): ExportedSession[] {
    return sessions.map((session) => {
      const exported: ExportedSession = {
        id: options.anonymize ? this.hashId(session.id) : session.id,
        exerciseName: session.exerciseName,
        date: session.sessionDate,
        duration: session.duration,
        completionRate: session.completionRate || 0,
      };

      if (options.includeMetrics && session.metrics) {
        exported.averageFormScore = session.metrics.averageFormScore;
        exported.metrics = {
          formScore: session.metrics.averageFormScore || 0,
          rangeOfMotion: session.metrics.rangeOfMotion || 0,
          movementQuality: session.metrics.movementQuality || 0,
        };
      }

      return exported;
    });
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(sessions: MovementSession[]): ExportedData['summary'] {
    const exerciseTypes = [...new Set(sessions.map((s) => s.exerciseName))];
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

    const dates = sessions.map((s) => new Date(s.sessionDate).getTime());
    const startDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : '';
    const endDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : '';

    return {
      totalSessions: sessions.length,
      totalDuration,
      exerciseTypes,
      dateRange: { start: startDate, end: endDate },
    };
  }

  /**
   * Hash ID for anonymization
   */
  private hashId(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `anon_${Math.abs(hash).toString(36)}`;
  }

  // --------------------------------------------------------------------------
  // EXPORT FORMATS
  // --------------------------------------------------------------------------

  /**
   * Export to JSON
   */
  private exportToJSON(data: ExportedData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to CSV
   */
  private exportToCSV(data: ExportedData): string {
    const headers = [
      'ID',
      'Exercise',
      'Date',
      'Duration (s)',
      'Completion Rate (%)',
      'Form Score',
      'ROM',
      'Movement Quality',
    ];

    const rows = data.sessions.map((session) => [
      session.id,
      session.exerciseName,
      session.date,
      session.duration.toString(),
      (session.completionRate * 100).toFixed(1),
      (session.averageFormScore || 0).toFixed(2),
      (session.metrics?.rangeOfMotion || 0).toFixed(2),
      (session.metrics?.movementQuality || 0).toFixed(2),
    ]);

    // Add summary
    const summaryRows = [
      [],
      ['SUMMARY'],
      ['Total Sessions', data.summary.totalSessions.toString()],
      ['Total Duration (s)', data.summary.totalDuration.toString()],
      ['Exercise Types', data.summary.exerciseTypes.join('; ')],
      ['Date Range', `${data.summary.dateRange.start} - ${data.summary.dateRange.end}`],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ...summaryRows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Export to PDF (generates HTML that can be printed to PDF)
   */
  private exportToPDF(data: ExportedData): string {
    const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <title>RehabFlow - Träningsrapport</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1f2937;
    }
    h1 { color: #059669; margin-bottom: 8px; }
    h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 32px; }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .summary-card {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
    }
    .summary-value { font-size: 24px; font-weight: bold; color: #059669; }
    .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #6b7280; }
    tr:hover { background: #f9fafb; }
    .score { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .score-high { background: #d1fae5; color: #065f46; }
    .score-medium { background: #fef3c7; color: #92400e; }
    .score-low { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>RehabFlow Träningsrapport</h1>
  <p class="subtitle">Exporterad: ${new Date(data.exportDate).toLocaleDateString('sv-SE')}</p>

  <h2>Sammanfattning</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalSessions}</div>
      <div class="summary-label">Totalt antal sessioner</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${Math.round(data.summary.totalDuration / 60)} min</div>
      <div class="summary-label">Total träningstid</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.exerciseTypes.length}</div>
      <div class="summary-label">Olika övningar</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${this.calculateAverageScore(data.sessions)}%</div>
      <div class="summary-label">Genomsnittlig form</div>
    </div>
  </div>

  <h2>Övningar</h2>
  <p>Övningstyper: ${data.summary.exerciseTypes.join(', ')}</p>

  <h2>Sessionshistorik</h2>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Övning</th>
        <th>Tid</th>
        <th>Slutfört</th>
        <th>Form</th>
      </tr>
    </thead>
    <tbody>
      ${data.sessions.map((session) => `
        <tr>
          <td>${new Date(session.date).toLocaleDateString('sv-SE')}</td>
          <td>${session.exerciseName}</td>
          <td>${Math.round(session.duration / 60)} min</td>
          <td>${(session.completionRate * 100).toFixed(0)}%</td>
          <td>
            <span class="score ${this.getScoreClass(session.averageFormScore || 0)}">
              ${((session.averageFormScore || 0) * 100).toFixed(0)}%
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Genererad av RehabFlow v${data.version}</p>
    <p>Period: ${new Date(data.summary.dateRange.start).toLocaleDateString('sv-SE')} - ${new Date(data.summary.dateRange.end).toLocaleDateString('sv-SE')}</p>
  </div>

  <script class="no-print">
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `.trim();

    return html;
  }

  private calculateAverageScore(sessions: ExportedSession[]): number {
    const scores = sessions
      .map((s) => s.averageFormScore)
      .filter((s): s is number => s !== undefined);

    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  }

  private getScoreClass(score: number): string {
    if (score >= 0.8) return 'score-high';
    if (score >= 0.6) return 'score-medium';
    return 'score-low';
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  /**
   * Export sessions to specified format
   */
  public async export(options: Partial<ExportOptions> = {}): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const sessions = await this.getSessions(opts);
      const transformedSessions = this.transformSessions(sessions, opts);

      const exportData: ExportedData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        summary: this.generateSummary(sessions),
        sessions: transformedSessions,
      };

      let data: string;
      let filename: string;
      let mimeType: string;

      switch (opts.format) {
        case 'csv':
          data = this.exportToCSV(exportData);
          filename = `rehabflow-export-${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;

        case 'pdf':
          data = this.exportToPDF(exportData);
          filename = `rehabflow-rapport-${Date.now()}.html`;
          mimeType = 'text/html';
          break;

        default:
          data = this.exportToJSON(exportData);
          filename = `rehabflow-export-${Date.now()}.json`;
          mimeType = 'application/json';
      }

      logger.debug('[SessionExport] Exported', sessions.length, 'sessions as', opts.format);

      return { data, filename, mimeType };
    } catch (error) {
      logger.error('[SessionExport] Export failed:', error);
      throw error;
    }
  }

  /**
   * Download export file
   */
  public async download(options: Partial<ExportOptions> = {}): Promise<void> {
    const { data, filename, mimeType } = await this.export(options);

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.debug('[SessionExport] Download initiated:', filename);
  }

  /**
   * Export single session
   */
  public async exportSession(
    sessionId: string,
    format: ExportFormat = 'json'
  ): Promise<string> {
    const session = await indexedDBService.getMovementSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      session: {
        id: session.id,
        exerciseName: session.exerciseName,
        date: session.sessionDate,
        duration: session.duration,
        completionRate: session.completionRate,
        metrics: session.metrics,
      },
    };

    if (format === 'csv') {
      const headers = ['Property', 'Value'];
      const rows = Object.entries(exportData.session).map(([key, value]) => [
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate shareable report URL (base64 encoded)
   */
  public async generateShareableReport(options: Partial<ExportOptions> = {}): Promise<string> {
    const { data } = await this.export({ ...options, format: 'json' });
    const encoded = btoa(encodeURIComponent(data));
    return `${window.location.origin}/report?data=${encoded}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const sessionExportService = new SessionExportService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useCallback } from 'react';

export function useSessionExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportData = useCallback(async (options?: Partial<ExportOptions>) => {
    setIsExporting(true);
    setError(null);

    try {
      await sessionExportService.download(options);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Export failed'));
      throw e;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportAsJSON = useCallback(() => exportData({ format: 'json' }), [exportData]);
  const exportAsCSV = useCallback(() => exportData({ format: 'csv' }), [exportData]);
  const exportAsPDF = useCallback(() => exportData({ format: 'pdf' }), [exportData]);

  return {
    isExporting,
    error,
    exportData,
    exportAsJSON,
    exportAsCSV,
    exportAsPDF,
    generateShareableReport: sessionExportService.generateShareableReport.bind(sessionExportService),
  };
}

export default sessionExportService;
