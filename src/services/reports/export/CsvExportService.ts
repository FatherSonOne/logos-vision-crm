/**
 * CSV Export Service
 *
 * Implements high-quality CSV export with proper escaping, formatting, and encoding.
 * Supports multiple delimiters, custom date/number formatting, and Excel compatibility.
 *
 * @architecture Implements IExportService interface
 * @dependencies date-fns for date formatting
 * @performance Optimized for large datasets with proper memory management
 */

import { format as formatDate } from 'date-fns';
import { IExportService, ExportOptions, ExportResult, ExportFormat } from './types';

// ============================================
// CSV EXPORT OPTIONS
// ============================================

export interface CsvExportOptions {
  /** CSV delimiter character */
  delimiter?: ',' | ';' | '\t' | '|';

  /** Include header row */
  includeHeaders?: boolean;

  /** Date format string (using date-fns format tokens) */
  dateFormat?: string;

  /** Number format options */
  numberFormat?: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
    currencySymbol?: string;
  };

  /** Handle null/undefined values */
  nullValue?: string;

  /** File encoding */
  encoding?: 'utf-8' | 'utf-8-bom' | 'iso-8859-1';

  /** Include filters summary in footer */
  includeFilters?: boolean;

  /** Include timestamp in footer */
  includeTimestamp?: boolean;
}

/**
 * Delimiter presets for different regions
 */
export const DELIMITER_PRESETS = {
  US: ',' as const,
  EU: ';' as const,
  TAB: '\t' as const,
  PIPE: '|' as const,
};

/**
 * Date format presets
 */
export const DATE_FORMAT_PRESETS = {
  ISO: 'yyyy-MM-dd',
  ISO_TIME: 'yyyy-MM-dd HH:mm:ss',
  US: 'MM/dd/yyyy',
  US_TIME: 'MM/dd/yyyy hh:mm a',
  EU: 'dd/MM/yyyy',
  EU_TIME: 'dd/MM/yyyy HH:mm',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss.SSS',
};

// ============================================
// CSV EXPORT SERVICE
// ============================================

/**
 * CSV export service with comprehensive formatting and escaping
 *
 * Features:
 * - Multiple delimiters: comma, semicolon, tab, pipe
 * - Proper escaping of quotes, delimiters, newlines
 * - Custom date and number formatting
 * - UTF-8 BOM support for Excel compatibility
 * - Null/undefined value handling
 * - Optional header row
 */
export class CsvExportService implements IExportService {
  private readonly defaultOptions: Required<CsvExportOptions> = {
    delimiter: ',',
    includeHeaders: true,
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    numberFormat: {
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      currencySymbol: '$',
    },
    nullValue: '',
    encoding: 'utf-8-bom',
    includeFilters: false,
    includeTimestamp: false,
  };

  getSupportedFormat(): ExportFormat {
    return 'csv';
  }

  /**
   * Export data to CSV format
   *
   * @param options Export options
   * @returns Promise resolving to export result
   */
  async export(options: ExportOptions & { csvOptions?: CsvExportOptions }): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      const { reportName, data, filters, timestamp = new Date(), csvOptions } = options;

      if (!data || data.length === 0) {
        return {
          success: false,
          filename: '',
          error: 'No data to export',
        };
      }

      const opts = { ...this.defaultOptions, ...csvOptions };

      // Generate CSV content
      const csvContent = this.generateCsv(data, opts, {
        reportName,
        filters,
        timestamp,
      });

      // Create blob with proper encoding
      const blob = this.createBlob(csvContent, opts.encoding);

      // Generate filename
      const dateStr = timestamp.toISOString().split('T')[0];
      const filename = `${this.sanitizeFilename(reportName)}_${dateStr}.csv`;

      return {
        success: true,
        blob,
        filename,
        fileSize: blob.size,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'CSV export failed',
      };
    }
  }

  /**
   * Generate CSV content from data
   *
   * @param data Data array
   * @param options CSV options
   * @param metadata Report metadata
   * @returns CSV content string
   */
  private generateCsv(
    data: any[],
    options: Required<CsvExportOptions>,
    metadata?: { reportName?: string; filters?: any; timestamp?: Date }
  ): string {
    // Extract column names from first row
    const columns = this.extractColumns(data);

    // Build CSV content
    let csvContent = '';

    // Add header row if enabled
    if (options.includeHeaders) {
      csvContent += this.generateHeaderRow(columns, options.delimiter);
      csvContent += '\n';
    }

    // Add data rows
    for (const row of data) {
      csvContent += this.generateDataRow(row, columns, options);
      csvContent += '\n';
    }

    // Add metadata footer if requested
    if ((options.includeTimestamp || options.includeFilters) && metadata) {
      csvContent += '\n';
      csvContent += this.generateMetadataFooter(metadata, options);
    }

    return csvContent;
  }

  /**
   * Extract column names from data array
   *
   * @param data Data array
   * @returns Array of column names
   */
  private extractColumns(data: any[]): string[] {
    if (data.length === 0) {
      return [];
    }

    const firstRow = data[0];

    // Handle array of objects
    if (typeof firstRow === 'object' && firstRow !== null) {
      return Object.keys(firstRow);
    }

    // Handle array of arrays
    if (Array.isArray(firstRow)) {
      return firstRow.map((_, index) => `Column${index + 1}`);
    }

    throw new Error('Unsupported data format. Expected array of objects or arrays.');
  }

  /**
   * Generate CSV header row
   *
   * @param columns Column names
   * @param delimiter CSV delimiter
   * @returns CSV header row
   */
  private generateHeaderRow(columns: string[], delimiter: string): string {
    return columns.map((col) => this.escapeValue(col, delimiter)).join(delimiter);
  }

  /**
   * Generate CSV data row
   *
   * @param row Data row object
   * @param columns Column order
   * @param options CSV options
   * @returns CSV data row
   */
  private generateDataRow(
    row: any,
    columns: string[],
    options: Required<CsvExportOptions>
  ): string {
    const values = columns.map((col) => {
      const value = Array.isArray(row) ? row[parseInt(col.replace('Column', '')) - 1] : row[col];
      return this.formatValue(value, options);
    });

    return values
      .map((val) => this.escapeValue(val, options.delimiter))
      .join(options.delimiter);
  }

  /**
   * Format value based on type and options
   *
   * @param value Raw value
   * @param options CSV options
   * @returns Formatted value as string
   */
  private formatValue(value: any, options: Required<CsvExportOptions>): string {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return options.nullValue;
    }

    // Handle dates
    if (value instanceof Date) {
      return formatDate(value, options.dateFormat);
    }

    // Handle ISO date strings
    if (typeof value === 'string' && this.isIsoDate(value)) {
      try {
        const date = new Date(value);
        return formatDate(date, options.dateFormat);
      } catch {
        return value;
      }
    }

    // Handle numbers
    if (typeof value === 'number') {
      return this.formatNumber(value, options.numberFormat);
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // Handle objects/arrays (stringify)
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    // Handle strings and everything else
    return String(value);
  }

  /**
   * Format number with custom options
   *
   * @param value Numeric value
   * @param format Number format options
   * @returns Formatted number string
   */
  private formatNumber(
    value: number,
    format: {
      decimals?: number;
      thousandsSeparator?: string;
      decimalSeparator?: string;
      currencySymbol?: string;
    }
  ): string {
    const decimals = format.decimals ?? 2;
    const thousandsSep = format.thousandsSeparator || ',';
    const decimalSep = format.decimalSeparator || '.';

    // Round to specified decimals
    const rounded = value.toFixed(decimals);

    // Split into integer and decimal parts
    const parts = rounded.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add thousands separators
    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousandsSep
    );

    // Combine parts
    let result = formattedInteger;
    if (decimalPart && decimals > 0) {
      result += decimalSep + decimalPart;
    }

    return result;
  }

  /**
   * Check if string is ISO date format
   *
   * @param value String to check
   * @returns True if value is ISO date string
   */
  private isIsoDate(value: string): boolean {
    // Simple check for ISO 8601 format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    return isoDateRegex.test(value);
  }

  /**
   * Escape CSV value according to RFC 4180
   *
   * @param value Value to escape
   * @param delimiter CSV delimiter
   * @returns Escaped value
   */
  private escapeValue(value: string, delimiter: string): string {
    const stringValue = String(value);

    // Check if escaping is needed
    const needsEscaping =
      stringValue.includes(delimiter) ||
      stringValue.includes('"') ||
      stringValue.includes('\n') ||
      stringValue.includes('\r');

    if (!needsEscaping) {
      return stringValue;
    }

    // Escape double quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');

    // Wrap in double quotes
    return `"${escapedValue}"`;
  }

  /**
   * Generate metadata footer with report info
   *
   * @param metadata Report metadata
   * @param options Export options
   * @returns Metadata footer rows
   */
  private generateMetadataFooter(
    metadata: { reportName?: string; filters?: any; timestamp?: Date },
    options: Required<CsvExportOptions>
  ): string {
    const lines: string[] = [];

    if (options.includeTimestamp && metadata.timestamp) {
      const timestamp = formatDate(metadata.timestamp, 'yyyy-MM-dd HH:mm:ss');
      lines.push(`Generated at: ${timestamp}`);
    }

    if (metadata.reportName) {
      lines.push(`Report: ${metadata.reportName}`);
    }

    if (options.includeFilters && metadata.filters) {
      const filterStr = JSON.stringify(metadata.filters);
      lines.push(`Filters: ${filterStr}`);
    }

    return lines.join('\n');
  }

  /**
   * Create blob with proper encoding
   *
   * @param content CSV content string
   * @param encoding Target encoding
   * @returns CSV blob
   */
  private createBlob(
    content: string,
    encoding: 'utf-8' | 'utf-8-bom' | 'iso-8859-1'
  ): Blob {
    let blobParts: BlobPart[];

    switch (encoding) {
      case 'utf-8-bom':
        // Add UTF-8 BOM for Excel compatibility
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        blobParts = [bom, content];
        break;

      case 'iso-8859-1':
        // Convert to Latin-1 encoding
        const latin1 = this.stringToLatin1(content);
        blobParts = [latin1];
        break;

      case 'utf-8':
      default:
        blobParts = [content];
        break;
    }

    return new Blob(blobParts, { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Convert string to Latin-1 encoding
   *
   * @param str UTF-8 string
   * @returns Latin-1 encoded Uint8Array
   */
  private stringToLatin1(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // Replace non-Latin-1 characters with '?'
      arr[i] = charCode > 255 ? 63 : charCode;
    }
    return arr;
  }

  /**
   * Sanitize filename for safe downloads
   *
   * @param filename Original filename
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  /**
   * Export data with custom column selection
   *
   * @param data Raw data array
   * @param columns Specific columns to export
   * @param reportName Report name
   * @param csvOptions CSV export options
   * @returns Promise resolving to export result
   */
  async exportSelectedColumns(
    data: any[],
    columns: string[],
    reportName: string,
    csvOptions?: CsvExportOptions
  ): Promise<ExportResult> {
    // Filter data to include only selected columns
    const filteredData = data.map((row) => {
      const filtered: Record<string, any> = {};
      columns.forEach((col) => {
        filtered[col] = row[col];
      });
      return filtered;
    });

    return this.export({
      reportName,
      data: filteredData,
      csvOptions,
    });
  }

  /**
   * Export data with custom row filtering
   *
   * @param data Raw data array
   * @param filterFn Row filter function
   * @param reportName Report name
   * @param csvOptions CSV export options
   * @returns Promise resolving to export result
   */
  async exportFilteredRows(
    data: any[],
    filterFn: (row: any) => boolean,
    reportName: string,
    csvOptions?: CsvExportOptions
  ): Promise<ExportResult> {
    const filteredData = data.filter(filterFn);

    return this.export({
      reportName,
      data: filteredData,
      csvOptions,
    });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Singleton instance for convenience
 */
export const csvExportService = new CsvExportService();

/**
 * Helper function to download CSV blob
 *
 * @param blob CSV blob
 * @param filename Download filename
 */
export function downloadCsv(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
