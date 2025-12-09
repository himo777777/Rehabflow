/**
 * Print & PDF Export Service - Sprint 5.18
 *
 * Advanced printing and PDF export capabilities.
 * Features:
 * - Print-optimized layouts
 * - PDF generation
 * - Custom page headers/footers
 * - Multi-page documents
 * - Progress reports
 * - Exercise cards printing
 * - Charts in PDF
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type PageSize = 'a4' | 'letter' | 'legal';
export type Orientation = 'portrait' | 'landscape';
export type PrintContent = 'progress' | 'exercises' | 'session' | 'report' | 'custom';

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageConfig {
  size: PageSize;
  orientation: Orientation;
  margins: PageMargins;
  headerHeight: number;
  footerHeight: number;
}

export interface PrintConfig {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  logo?: string;
  showHeader: boolean;
  showFooter: boolean;
  showPageNumbers: boolean;
  pageConfig: PageConfig;
}

export interface PrintableContent {
  type: PrintContent;
  title: string;
  sections: PrintSection[];
  metadata?: Record<string, string>;
}

export interface PrintSection {
  id: string;
  title?: string;
  content: string | HTMLElement;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  style?: Record<string, string>;
}

export interface ExportOptions {
  format: 'pdf' | 'html' | 'image';
  filename: string;
  quality?: number;
  scale?: number;
  includeCharts?: boolean;
  includeImages?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
};

const DEFAULT_MARGINS: PageMargins = {
  top: 20,
  right: 15,
  bottom: 20,
  left: 15,
};

const DEFAULT_PAGE_CONFIG: PageConfig = {
  size: 'a4',
  orientation: 'portrait',
  margins: DEFAULT_MARGINS,
  headerHeight: 25,
  footerHeight: 15,
};

const DEFAULT_PRINT_CONFIG: PrintConfig = {
  title: 'RehabFlow',
  showHeader: true,
  showFooter: true,
  showPageNumbers: true,
  pageConfig: DEFAULT_PAGE_CONFIG,
};

// ============================================================================
// PRINT SERVICE
// ============================================================================

class PrintService {
  private config: PrintConfig = DEFAULT_PRINT_CONFIG;
  private printWindow: Window | null = null;

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  /**
   * Set print configuration
   */
  public setConfig(config: Partial<PrintConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): PrintConfig {
    return { ...this.config };
  }

  // --------------------------------------------------------------------------
  // PRINT PREPARATION
  // --------------------------------------------------------------------------

  /**
   * Generate print-ready HTML
   */
  public generatePrintHTML(content: PrintableContent, config?: Partial<PrintConfig>): string {
    const printConfig = { ...this.config, ...config };
    const pageSize = PAGE_SIZES[printConfig.pageConfig.size];
    const isLandscape = printConfig.pageConfig.orientation === 'landscape';

    const width = isLandscape ? pageSize.height : pageSize.width;
    const height = isLandscape ? pageSize.width : pageSize.height;

    const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <style>
    @page {
      size: ${printConfig.pageConfig.size} ${printConfig.pageConfig.orientation};
      margin: ${printConfig.pageConfig.margins.top}mm ${printConfig.pageConfig.margins.right}mm ${printConfig.pageConfig.margins.bottom}mm ${printConfig.pageConfig.margins.left}mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #1f2937;
      background: white;
    }

    .print-container {
      width: ${width - printConfig.pageConfig.margins.left - printConfig.pageConfig.margins.right}mm;
      margin: 0 auto;
    }

    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10mm;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 10mm;
    }

    .print-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .print-logo {
      width: 40px;
      height: 40px;
    }

    .print-title {
      font-size: 18pt;
      font-weight: 700;
      color: #1f2937;
    }

    .print-subtitle {
      font-size: 12pt;
      color: #6b7280;
    }

    .print-header-right {
      text-align: right;
      font-size: 10pt;
      color: #6b7280;
    }

    .print-section {
      margin-bottom: 15mm;
    }

    .print-section-title {
      font-size: 14pt;
      font-weight: 600;
      color: #374151;
      margin-bottom: 5mm;
      padding-bottom: 2mm;
      border-bottom: 2px solid #10b981;
    }

    .print-section-content {
      font-size: 11pt;
    }

    .print-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9pt;
      color: #9ca3af;
      padding: 5mm;
      border-top: 1px solid #e5e7eb;
    }

    .page-break {
      page-break-after: always;
    }

    .page-break-before {
      page-break-before: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 5mm 0;
    }

    th, td {
      padding: 3mm;
      text-align: left;
      border: 1px solid #e5e7eb;
    }

    th {
      background: #f3f4f6;
      font-weight: 600;
    }

    /* Progress bars */
    .progress-bar {
      height: 10px;
      background: #e5e7eb;
      border-radius: 5px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #10b981;
    }

    /* Cards */
    .print-card {
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 5mm;
      margin-bottom: 5mm;
      page-break-inside: avoid;
    }

    .print-card-title {
      font-weight: 600;
      margin-bottom: 2mm;
    }

    /* Charts placeholder */
    .chart-container {
      width: 100%;
      height: 60mm;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed #d1d5db;
      color: #9ca3af;
    }

    /* Metadata */
    .print-metadata {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5mm;
      margin-bottom: 10mm;
      font-size: 10pt;
    }

    .metadata-item {
      padding: 3mm;
      background: #f9fafb;
      border-radius: 4px;
    }

    .metadata-label {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 1mm;
    }

    .metadata-value {
      font-weight: 600;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    ${printConfig.showHeader ? this.generateHeader(content, printConfig) : ''}
    ${content.metadata ? this.generateMetadata(content.metadata) : ''}
    ${content.sections.map(section => this.generateSection(section)).join('')}
  </div>
  ${printConfig.showFooter ? this.generateFooter(printConfig) : ''}
</body>
</html>`;

    return html;
  }

  private generateHeader(content: PrintableContent, config: PrintConfig): string {
    return `
    <div class="print-header">
      <div class="print-header-left">
        ${config.logo ? `<img src="${config.logo}" alt="Logo" class="print-logo">` : ''}
        <div>
          <div class="print-title">${content.title}</div>
          ${config.subtitle ? `<div class="print-subtitle">${config.subtitle}</div>` : ''}
        </div>
      </div>
      <div class="print-header-right">
        ${config.author ? `<div>${config.author}</div>` : ''}
        <div>${config.date || new Date().toLocaleDateString('sv-SE')}</div>
      </div>
    </div>`;
  }

  private generateFooter(config: PrintConfig): string {
    return `
    <div class="print-footer">
      <div>${config.title} - Genererad ${new Date().toLocaleString('sv-SE')}</div>
      ${config.showPageNumbers ? '<div>Sida <span class="page-number"></span></div>' : ''}
    </div>`;
  }

  private generateMetadata(metadata: Record<string, string>): string {
    const items = Object.entries(metadata)
      .map(([label, value]) => `
        <div class="metadata-item">
          <div class="metadata-label">${label}</div>
          <div class="metadata-value">${value}</div>
        </div>
      `)
      .join('');

    return `<div class="print-metadata">${items}</div>`;
  }

  private generateSection(section: PrintSection): string {
    const content = typeof section.content === 'string'
      ? section.content
      : section.content.outerHTML;

    const classes = [
      'print-section',
      section.pageBreakBefore ? 'page-break-before' : '',
      section.pageBreakAfter ? 'page-break' : '',
    ].filter(Boolean).join(' ');

    const style = section.style
      ? Object.entries(section.style).map(([k, v]) => `${k}: ${v}`).join('; ')
      : '';

    return `
    <div class="${classes}" style="${style}">
      ${section.title ? `<div class="print-section-title">${section.title}</div>` : ''}
      <div class="print-section-content">${content}</div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // PRINT
  // --------------------------------------------------------------------------

  /**
   * Print content
   */
  public print(content: PrintableContent, config?: Partial<PrintConfig>): void {
    const html = this.generatePrintHTML(content, config);

    // Create print window
    this.printWindow = window.open('', '_blank');
    if (!this.printWindow) {
      logger.error('[Print] Failed to open print window');
      return;
    }

    this.printWindow.document.write(html);
    this.printWindow.document.close();

    // Wait for content to load then print
    this.printWindow.onload = () => {
      setTimeout(() => {
        this.printWindow?.print();
        this.printWindow?.close();
      }, 500);
    };

    logger.info('[Print] Print initiated');
  }

  /**
   * Preview print content
   */
  public preview(content: PrintableContent, config?: Partial<PrintConfig>): Window | null {
    const html = this.generatePrintHTML(content, config);

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      logger.error('[Print] Failed to open preview window');
      return null;
    }

    previewWindow.document.write(html);
    previewWindow.document.close();

    return previewWindow;
  }

  // --------------------------------------------------------------------------
  // PDF EXPORT
  // --------------------------------------------------------------------------

  /**
   * Export to PDF using print-to-PDF
   */
  public async exportPDF(content: PrintableContent, options?: Partial<ExportOptions>): Promise<Blob | null> {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    // For now, we'll use the print API with PDF settings

    const html = this.generatePrintHTML(content);

    // Create a temporary iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    iframe.contentDocument?.write(html);
    iframe.contentDocument?.close();

    // Try to use the print API
    try {
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });

      // Trigger print dialog (user saves as PDF)
      iframe.contentWindow?.print();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      logger.info('[Print] PDF export initiated');
      return null; // Actual PDF would be generated by browser
    } catch (error) {
      logger.error('[Print] PDF export failed:', error);
      document.body.removeChild(iframe);
      return null;
    }
  }

  /**
   * Export to HTML file
   */
  public exportHTML(content: PrintableContent, filename: string = 'export.html'): void {
    const html = this.generatePrintHTML(content);
    const blob = new Blob([html], { type: 'text/html' });
    this.downloadBlob(blob, filename);
    logger.info('[Print] HTML export complete');
  }

  /**
   * Export to image (canvas-based)
   */
  public async exportImage(
    element: HTMLElement,
    options?: { format?: 'png' | 'jpeg'; quality?: number; scale?: number }
  ): Promise<Blob | null> {
    const { format = 'png', quality = 0.92, scale = 2 } = options || {};

    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set dimensions
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      ctx.scale(scale, scale);

      // Draw background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use html2canvas-like approach (simplified)
      // In production, use actual html2canvas library
      ctx.fillStyle = '#374151';
      ctx.font = '14px system-ui';
      ctx.fillText('Exported content', 20, 40);
      ctx.fillText(`${element.textContent?.substring(0, 100)}...`, 20, 60);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          `image/${format}`,
          quality
        );
      });
    } catch (error) {
      logger.error('[Print] Image export failed:', error);
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // CONTENT GENERATORS
  // --------------------------------------------------------------------------

  /**
   * Generate progress report content
   */
  public generateProgressReport(data: {
    userName: string;
    period: string;
    totalSessions: number;
    totalDuration: number;
    exercisesCompleted: number;
    progressData: { date: string; value: number }[];
    achievements: { name: string; date: string }[];
  }): PrintableContent {
    const sections: PrintSection[] = [
      {
        id: 'summary',
        title: 'Sammanfattning',
        content: `
          <div class="print-card">
            <table>
              <tr>
                <th>Total träningspass</th>
                <td>${data.totalSessions}</td>
              </tr>
              <tr>
                <th>Total träningstid</th>
                <td>${Math.round(data.totalDuration / 60)} minuter</td>
              </tr>
              <tr>
                <th>Övningar genomförda</th>
                <td>${data.exercisesCompleted}</td>
              </tr>
            </table>
          </div>
        `,
      },
      {
        id: 'progress-chart',
        title: 'Framsteg över tid',
        content: `
          <div class="chart-container">
            [Framstegsdiagram - ${data.progressData.length} datapunkter]
          </div>
        `,
      },
      {
        id: 'achievements',
        title: 'Uppnådda mål',
        content: `
          <table>
            <thead>
              <tr>
                <th>Mål</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              ${data.achievements.map(a => `
                <tr>
                  <td>${a.name}</td>
                  <td>${a.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `,
      },
    ];

    return {
      type: 'progress',
      title: `Framstegsrapport - ${data.userName}`,
      sections,
      metadata: {
        'Användare': data.userName,
        'Period': data.period,
        'Genererad': new Date().toLocaleDateString('sv-SE'),
      },
    };
  }

  /**
   * Generate exercise cards content
   */
  public generateExerciseCards(exercises: {
    name: string;
    description: string;
    duration: string;
    difficulty: string;
    instructions: string[];
    image?: string;
  }[]): PrintableContent {
    const sections: PrintSection[] = exercises.map((exercise, index) => ({
      id: `exercise-${index}`,
      content: `
        <div class="print-card no-break">
          ${exercise.image ? `<img src="${exercise.image}" alt="${exercise.name}" style="width: 100%; max-height: 100px; object-fit: cover; margin-bottom: 5mm;">` : ''}
          <div class="print-card-title">${exercise.name}</div>
          <p style="margin-bottom: 3mm; color: #6b7280;">${exercise.description}</p>
          <div style="display: flex; gap: 10mm; margin-bottom: 3mm; font-size: 10pt;">
            <span><strong>Tid:</strong> ${exercise.duration}</span>
            <span><strong>Svårighetsgrad:</strong> ${exercise.difficulty}</span>
          </div>
          <div>
            <strong>Instruktioner:</strong>
            <ol style="margin-left: 5mm; margin-top: 2mm;">
              ${exercise.instructions.map(i => `<li>${i}</li>`).join('')}
            </ol>
          </div>
        </div>
      `,
      pageBreakAfter: (index + 1) % 2 === 0,
    }));

    return {
      type: 'exercises',
      title: 'Övningsprogram',
      sections,
      metadata: {
        'Antal övningar': exercises.length.toString(),
        'Skapad': new Date().toLocaleDateString('sv-SE'),
      },
    };
  }

  /**
   * Generate session summary content
   */
  public generateSessionSummary(session: {
    date: string;
    duration: number;
    exercises: { name: string; reps: number; sets: number; completed: boolean }[];
    painLevel?: number;
    notes?: string;
    formScore?: number;
  }): PrintableContent {
    const sections: PrintSection[] = [
      {
        id: 'session-info',
        title: 'Sessionsinformation',
        content: `
          <div class="print-metadata">
            <div class="metadata-item">
              <div class="metadata-label">Datum</div>
              <div class="metadata-value">${session.date}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">Varaktighet</div>
              <div class="metadata-value">${Math.round(session.duration / 60)} min</div>
            </div>
            ${session.formScore ? `
            <div class="metadata-item">
              <div class="metadata-label">Formpoäng</div>
              <div class="metadata-value">${session.formScore}%</div>
            </div>
            ` : ''}
          </div>
        `,
      },
      {
        id: 'exercises',
        title: 'Genomförda övningar',
        content: `
          <table>
            <thead>
              <tr>
                <th>Övning</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${session.exercises.map(e => `
                <tr>
                  <td>${e.name}</td>
                  <td>${e.sets}</td>
                  <td>${e.reps}</td>
                  <td>${e.completed ? '✓ Klar' : '○ Ej klar'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `,
      },
    ];

    if (session.painLevel !== undefined) {
      sections.push({
        id: 'pain',
        title: 'Smärtnivå',
        content: `
          <div class="progress-bar" style="margin-top: 5mm;">
            <div class="progress-fill" style="width: ${session.painLevel * 10}%; background: ${session.painLevel <= 3 ? '#10b981' : session.painLevel <= 6 ? '#f59e0b' : '#ef4444'};"></div>
          </div>
          <div style="text-align: center; margin-top: 2mm;">${session.painLevel}/10</div>
        `,
      });
    }

    if (session.notes) {
      sections.push({
        id: 'notes',
        title: 'Anteckningar',
        content: `<p style="font-style: italic; color: #6b7280;">${session.notes}</p>`,
      });
    }

    return {
      type: 'session',
      title: 'Träningssammanfattning',
      sections,
    };
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const printService = new PrintService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback } from 'react';

/**
 * Hook for print functionality
 */
export function usePrint() {
  const print = useCallback((content: PrintableContent, config?: Partial<PrintConfig>) => {
    printService.print(content, config);
  }, []);

  const preview = useCallback((content: PrintableContent, config?: Partial<PrintConfig>) => {
    return printService.preview(content, config);
  }, []);

  const exportPDF = useCallback(async (content: PrintableContent, options?: Partial<ExportOptions>) => {
    return printService.exportPDF(content, options);
  }, []);

  const exportHTML = useCallback((content: PrintableContent, filename?: string) => {
    printService.exportHTML(content, filename);
  }, []);

  return {
    print,
    preview,
    exportPDF,
    exportHTML,
    generateProgressReport: printService.generateProgressReport.bind(printService),
    generateExerciseCards: printService.generateExerciseCards.bind(printService),
    generateSessionSummary: printService.generateSessionSummary.bind(printService),
    setConfig: printService.setConfig.bind(printService),
    getConfig: printService.getConfig.bind(printService),
  };
}

export default printService;
