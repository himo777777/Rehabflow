/**
 * Data Export/Import Service
 *
 * Comprehensive data management for rehabilitation data:
 * - Export to JSON, CSV, PDF formats
 * - Import from backup files
 * - GDPR compliant data extraction
 * - Selective export (exercises, progress, settings)
 * - Data validation on import
 * - Encryption support for sensitive data
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'pdf';

export type DataCategory =
  | 'profile'
  | 'exercises'
  | 'progress'
  | 'painLogs'
  | 'romMeasurements'
  | 'achievements'
  | 'settings'
  | 'aiConversations';

export interface ExportOptions {
  format: ExportFormat;
  categories: DataCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMetadata: boolean;
  encrypt: boolean;
  filename?: string;
}

export interface ImportOptions {
  validateSchema: boolean;
  mergeStrategy: 'replace' | 'merge' | 'skip_existing';
  categories?: DataCategory[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  size: number;
  categories: DataCategory[];
  recordCount: number;
  timestamp: string;
  downloadUrl?: string;
}

export interface ImportResult {
  success: boolean;
  recordsImported: number;
  recordsSkipped: number;
  errors: ImportError[];
  categories: DataCategory[];
}

export interface ImportError {
  category: DataCategory;
  record?: string;
  error: string;
}

export interface DataSchema {
  version: string;
  exportedAt: string;
  exportedBy: string;
  categories: DataCategory[];
  data: Record<DataCategory, unknown[]>;
  checksum?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SCHEMA_VERSION = '1.0.0';
const STORAGE_PREFIX = 'rehabflow_';

// ============================================================================
// MAIN SERVICE
// ============================================================================

class DataExportService {
  private exportHistory: ExportResult[] = [];

  // ============================================
  // EXPORT
  // ============================================

  /**
   * Export user data
   */
  async exportData(options: ExportOptions): Promise<ExportResult> {
    logger.info('[DataExport] Starting export:', options);

    try {
      // Collect data from all requested categories
      const data = await this.collectData(options.categories, options.dateRange);

      // Create schema
      const schema: DataSchema = {
        version: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        exportedBy: 'RehabFlow App',
        categories: options.categories,
        data,
      };

      // Add checksum for integrity
      if (options.includeMetadata) {
        schema.checksum = this.calculateChecksum(JSON.stringify(data));
      }

      // Format and create file
      let content: string | Blob;
      let mimeType: string;
      let extension: string;

      switch (options.format) {
        case 'json':
          content = JSON.stringify(schema, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'csv':
          content = this.convertToCSV(data);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'pdf':
          content = await this.generatePDF(schema);
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      // Encrypt if requested
      if (options.encrypt && typeof content === 'string') {
        content = await this.encryptData(content);
        extension = `${extension}.encrypted`;
      }

      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = options.filename || `rehabflow_export_${timestamp}.${extension}`;

      // Create download URL
      const blob = typeof content === 'string'
        ? new Blob([content], { type: mimeType })
        : content;
      const downloadUrl = URL.createObjectURL(blob);

      // Calculate record count
      const recordCount = Object.values(data).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
      );

      const result: ExportResult = {
        success: true,
        filename,
        format: options.format,
        size: blob.size,
        categories: options.categories,
        recordCount,
        timestamp: new Date().toISOString(),
        downloadUrl,
      };

      this.exportHistory.push(result);
      logger.info('[DataExport] Export complete:', result);

      return result;
    } catch (error) {
      logger.error('[DataExport] Export failed:', error);
      throw error;
    }
  }

  /**
   * Collect data from storage
   */
  private async collectData(
    categories: DataCategory[],
    dateRange?: { start: Date; end: Date }
  ): Promise<Record<DataCategory, unknown[]>> {
    const data: Record<DataCategory, unknown[]> = {} as Record<DataCategory, unknown[]>;

    for (const category of categories) {
      const storageKey = `${STORAGE_PREFIX}${category}`;
      const rawData = localStorage.getItem(storageKey);

      if (rawData) {
        try {
          let parsed = JSON.parse(rawData);

          // Filter by date range if applicable
          if (dateRange && Array.isArray(parsed)) {
            parsed = parsed.filter((item: { timestamp?: string; date?: string; createdAt?: string }) => {
              const itemDate = new Date(item.timestamp || item.date || item.createdAt || 0);
              return itemDate >= dateRange.start && itemDate <= dateRange.end;
            });
          }

          data[category] = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          data[category] = [];
        }
      } else {
        data[category] = [];
      }
    }

    return data;
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: Record<DataCategory, unknown[]>): string {
    const lines: string[] = [];

    for (const [category, records] of Object.entries(data)) {
      if (!Array.isArray(records) || records.length === 0) continue;

      // Add category header
      lines.push(`\n# ${category.toUpperCase()}`);

      // Get headers from first record
      const headers = Object.keys(records[0] as object);
      lines.push(headers.join(','));

      // Add data rows
      for (const record of records) {
        const values = headers.map(h => {
          const value = (record as Record<string, unknown>)[h];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return String(value ?? '');
        });
        lines.push(values.join(','));
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate PDF report
   */
  private async generatePDF(schema: DataSchema): Promise<Blob> {
    // Simple PDF generation using HTML canvas approach
    // In production, use a library like jsPDF or pdfmake

    const content = `
      RehabFlow Data Export
      =====================

      Exported: ${schema.exportedAt}
      Version: ${schema.version}
      Categories: ${schema.categories.join(', ')}

      Data Summary:
      ${Object.entries(schema.data)
        .map(([cat, items]) => `- ${cat}: ${(items as unknown[]).length} records`)
        .join('\n')}

      Full data available in JSON export.
    `;

    // Return as text blob (in production, generate actual PDF)
    return new Blob([content], { type: 'text/plain' });
  }

  /**
   * Simple XOR encryption (use proper encryption in production)
   */
  private async encryptData(data: string): Promise<string> {
    // Note: This is a placeholder. Use Web Crypto API in production
    const key = 'rehabflow_secure_key';
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  }

  /**
   * Decrypt data
   */
  private async decryptData(encryptedData: string): Promise<string> {
    const key = 'rehabflow_secure_key';
    const decoded = atob(encryptedData);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // ============================================
  // IMPORT
  // ============================================

  /**
   * Import data from file
   */
  async importData(file: File, options: ImportOptions): Promise<ImportResult> {
    logger.info('[DataExport] Starting import:', { filename: file.name, options });

    const errors: ImportError[] = [];
    let recordsImported = 0;
    let recordsSkipped = 0;

    try {
      // Read file content
      let content = await this.readFile(file);

      // Decrypt if necessary
      if (file.name.endsWith('.encrypted')) {
        content = await this.decryptData(content);
      }

      // Parse JSON
      const schema: DataSchema = JSON.parse(content);

      // Validate schema
      if (options.validateSchema) {
        const validation = this.validateSchema(schema);
        if (!validation.valid) {
          throw new Error(`Invalid schema: ${validation.errors.join(', ')}`);
        }
      }

      // Import each category
      const categoriesToImport = options.categories || schema.categories;

      for (const category of categoriesToImport) {
        const records = schema.data[category];
        if (!Array.isArray(records)) continue;

        const storageKey = `${STORAGE_PREFIX}${category}`;

        try {
          // Get existing data
          const existingRaw = localStorage.getItem(storageKey);
          const existing = existingRaw ? JSON.parse(existingRaw) : [];

          let newData: unknown[];

          switch (options.mergeStrategy) {
            case 'replace':
              newData = records;
              recordsImported += records.length;
              break;

            case 'merge':
              // Merge by ID if available
              const existingIds = new Set(
                existing.map((r: { id?: string }) => r.id).filter(Boolean)
              );
              const newRecords = records.filter(
                (r: { id?: string }) => !r.id || !existingIds.has(r.id)
              );
              newData = [...existing, ...newRecords];
              recordsImported += newRecords.length;
              recordsSkipped += records.length - newRecords.length;
              break;

            case 'skip_existing':
              if (existing.length > 0) {
                recordsSkipped += records.length;
                continue;
              }
              newData = records;
              recordsImported += records.length;
              break;

            default:
              newData = records;
              recordsImported += records.length;
          }

          localStorage.setItem(storageKey, JSON.stringify(newData));
        } catch (error) {
          errors.push({
            category,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const result: ImportResult = {
        success: errors.length === 0,
        recordsImported,
        recordsSkipped,
        errors,
        categories: categoriesToImport,
      };

      logger.info('[DataExport] Import complete:', result);
      return result;
    } catch (error) {
      logger.error('[DataExport] Import failed:', error);
      return {
        success: false,
        recordsImported: 0,
        recordsSkipped: 0,
        errors: [{ category: 'profile', error: error instanceof Error ? error.message : 'Import failed' }],
        categories: [],
      };
    }
  }

  /**
   * Read file content
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Validate imported schema
   */
  private validateSchema(schema: DataSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema.version) {
      errors.push('Missing version');
    }

    if (!schema.exportedAt) {
      errors.push('Missing exportedAt timestamp');
    }

    if (!schema.categories || !Array.isArray(schema.categories)) {
      errors.push('Missing or invalid categories');
    }

    if (!schema.data || typeof schema.data !== 'object') {
      errors.push('Missing or invalid data');
    }

    // Verify checksum if present
    if (schema.checksum) {
      const calculatedChecksum = this.calculateChecksum(JSON.stringify(schema.data));
      if (calculatedChecksum !== schema.checksum) {
        errors.push('Checksum mismatch - data may be corrupted');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ============================================
  // GDPR COMPLIANCE
  // ============================================

  /**
   * Export all user data (GDPR right to data portability)
   */
  async exportAllUserData(): Promise<ExportResult> {
    const allCategories: DataCategory[] = [
      'profile',
      'exercises',
      'progress',
      'painLogs',
      'romMeasurements',
      'achievements',
      'settings',
      'aiConversations',
    ];

    return this.exportData({
      format: 'json',
      categories: allCategories,
      includeMetadata: true,
      encrypt: false,
      filename: `rehabflow_full_export_${Date.now()}.json`,
    });
  }

  /**
   * Delete all user data (GDPR right to erasure)
   */
  async deleteAllUserData(): Promise<{ success: boolean; deletedCategories: string[] }> {
    const deletedCategories: string[] = [];

    const allCategories: DataCategory[] = [
      'profile',
      'exercises',
      'progress',
      'painLogs',
      'romMeasurements',
      'achievements',
      'settings',
      'aiConversations',
    ];

    for (const category of allCategories) {
      const storageKey = `${STORAGE_PREFIX}${category}`;
      if (localStorage.getItem(storageKey)) {
        localStorage.removeItem(storageKey);
        deletedCategories.push(category);
      }
    }

    logger.info('[DataExport] Deleted all user data:', deletedCategories);

    return {
      success: true,
      deletedCategories,
    };
  }

  // ============================================
  // DOWNLOAD HELPERS
  // ============================================

  /**
   * Trigger download
   */
  triggerDownload(result: ExportResult): void {
    if (!result.downloadUrl) return;

    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL after download
    setTimeout(() => {
      if (result.downloadUrl) {
        URL.revokeObjectURL(result.downloadUrl);
      }
    }, 1000);
  }

  /**
   * Get export history
   */
  getExportHistory(): ExportResult[] {
    return [...this.exportHistory];
  }

  /**
   * Get data summary (for UI display)
   */
  async getDataSummary(): Promise<Record<DataCategory, { count: number; lastUpdated?: string }>> {
    const categories: DataCategory[] = [
      'profile',
      'exercises',
      'progress',
      'painLogs',
      'romMeasurements',
      'achievements',
      'settings',
      'aiConversations',
    ];

    const summary: Record<DataCategory, { count: number; lastUpdated?: string }> = {} as Record<DataCategory, { count: number; lastUpdated?: string }>;

    for (const category of categories) {
      const storageKey = `${STORAGE_PREFIX}${category}`;
      const rawData = localStorage.getItem(storageKey);

      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          const lastItem = items[items.length - 1] as { timestamp?: string; date?: string; updatedAt?: string } | undefined;

          summary[category] = {
            count: items.length,
            lastUpdated: lastItem?.timestamp || lastItem?.date || lastItem?.updatedAt,
          };
        } catch {
          summary[category] = { count: 0 };
        }
      } else {
        summary[category] = { count: 0 };
      }
    }

    return summary;
  }
}

// Singleton export
export const dataExportService = new DataExportService();
export default dataExportService;
