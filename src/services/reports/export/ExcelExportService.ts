import { IExportService, ExportOptions, ExportResult } from './types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  getNumericFields,
  formatFieldName,
  calculateColumnWidths,
  formatNumberCell,
  formatDateCell,
  createHeaderCell,
  createDataCell,
  calculateSummaryStats,
  isDateField,
} from './formatters/ExcelFormatter';

// ============================================
// EXCEL EXPORT SERVICE
// ============================================

/**
 * Excel Export Service
 *
 * Provides comprehensive Excel export functionality with:
 * - Multi-sheet workbooks (Data, Summary, Metadata)
 * - Professional cell styling and formatting
 * - Auto-sized columns based on content
 * - Frozen header rows
 * - Summary statistics with formulas
 * - Compatible with Microsoft Excel and Google Sheets
 */
export class ExcelExportService implements IExportService {
  getSupportedFormat() {
    return 'excel' as const;
  }

  async export(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      const { reportName, data, filters, timestamp = new Date() } = options;

      if (!data || data.length === 0) {
        return {
          success: false,
          filename: '',
          error: 'No data to export',
        };
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Data with styling and frozen headers
      const dataSheet = this.createDataSheet(data);
      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

      // Sheet 2: Summary statistics
      const summarySheet = this.createSummarySheet(data);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Sheet 3: Metadata (report info, filters, export details)
      const metadataSheet = this.createMetadataSheet(reportName, filters, timestamp, data.length);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true,
      });

      // Create blob
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Generate filename
      const dateStr = timestamp.toISOString().split('T')[0];
      const filename = `${this.sanitizeFilename(reportName)}_${dateStr}.xlsx`;

      // Download file
      saveAs(blob, filename);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        blob,
        filename,
        fileSize: blob.size,
      };
    } catch (error) {
      console.error('Excel export error:', error);
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Excel export failed',
      };
    }
  }

  // ============================================
  // SHEET CREATION METHODS
  // ============================================

  /**
   * Create Data Sheet with professional styling
   *
   * Features:
   * - Styled header row (bold white text on indigo background)
   * - Alternating row colors (gray/white)
   * - Borders on all cells
   * - Auto-sized columns
   * - Frozen header row
   * - Type-specific cell formatting
   */
  private createDataSheet(data: any[]): XLSX.WorkSheet {
    if (!data || data.length === 0) {
      return XLSX.utils.aoa_to_sheet([['No data available']]);
    }

    const fields = Object.keys(data[0]);
    const columnWidths = calculateColumnWidths(data);

    // Create array of arrays for the sheet
    const sheetData: any[][] = [];

    // Header row with styled cells
    const headerRow = fields.map(field => createHeaderCell(formatFieldName(field)));
    sheetData.push(headerRow);

    // Data rows with styled cells and type-specific formatting
    data.forEach((row, rowIndex) => {
      const dataRow = fields.map(field =>
        createDataCell(row[field], rowIndex, field)
      );
      sheetData.push(dataRow);
    });

    // Convert to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData, { cellStyles: true });

    // Set column widths
    worksheet['!cols'] = fields.map(field => ({
      wch: columnWidths[field] || 15,
    }));

    // Freeze header row (row 1)
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Set auto filter on header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

    return worksheet;
  }

  /**
   * Create Summary Sheet with statistics and formulas
   *
   * Features:
   * - Statistical summary for numeric columns
   * - Count, Sum, Average, Min, Max calculations
   * - Styled header and data rows
   * - Excel formulas for dynamic calculations
   */
  private createSummarySheet(data: any[]): XLSX.WorkSheet {
    const numericFields = getNumericFields(data);
    const stats = calculateSummaryStats(data, numericFields);

    if (stats.length === 0) {
      return XLSX.utils.aoa_to_sheet([
        ['Summary Statistics'],
        [],
        ['No numeric fields found in dataset'],
      ]);
    }

    // Build summary data array
    const summaryData: any[][] = [
      // Title row
      [createHeaderCell('Field'), createHeaderCell('Count'), createHeaderCell('Sum'), createHeaderCell('Average'), createHeaderCell('Min'), createHeaderCell('Max')],
    ];

    // Add statistics for each numeric field
    stats.forEach((stat, index) => {
      const rowIndex = index + 1; // +1 for header row
      summaryData.push([
        createDataCell(stat.field, rowIndex, 'field'),
        createDataCell(stat.count, rowIndex, 'count'),
        createDataCell(stat.sum, rowIndex, 'sum'),
        createDataCell(stat.average, rowIndex, 'average'),
        createDataCell(stat.min, rowIndex, 'min'),
        createDataCell(stat.max, rowIndex, 'max'),
      ]);
    });

    // Add totals row
    const totalRowIndex = stats.length + 1;
    summaryData.push([
      createHeaderCell('TOTAL'),
      createDataCell(data.length, totalRowIndex, 'count'),
      // Sum of sums
      {
        t: 'n',
        f: `SUM(C2:C${totalRowIndex})`,
        z: '#,##0.00',
      },
      // Average of averages (weighted by count)
      createDataCell('', totalRowIndex, 'average'),
      // Min of mins
      {
        t: 'n',
        f: `MIN(E2:E${totalRowIndex})`,
        z: '#,##0.00',
      },
      // Max of maxs
      {
        t: 'n',
        f: `MAX(F2:F${totalRowIndex})`,
        z: '#,##0.00',
      },
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData, { cellStyles: true });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Field name
      { wch: 12 }, // Count
      { wch: 15 }, // Sum
      { wch: 15 }, // Average
      { wch: 15 }, // Min
      { wch: 15 }, // Max
    ];

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    return worksheet;
  }

  /**
   * Create Metadata Sheet with report information
   *
   * Features:
   * - Report name and description
   * - Export timestamp
   * - Applied filters
   * - Data statistics
   */
  private createMetadataSheet(
    reportName: string,
    filters: Record<string, any> | undefined,
    timestamp: Date,
    rowCount: number
  ): XLSX.WorkSheet {
    const metadata: any[][] = [
      // Title
      [createHeaderCell('Report Metadata'), ''],
      ['', ''],

      // Report information
      [createDataCell('Report Name', 0, 'label'), createDataCell(reportName, 0, 'value')],
      [createDataCell('Export Date', 1, 'label'), createDataCell(timestamp.toISOString(), 1, 'value')],
      [createDataCell('Export Time', 0, 'label'), createDataCell(timestamp.toLocaleString(), 0, 'value')],
      [createDataCell('Generated By', 1, 'label'), createDataCell('Logos Vision CRM', 1, 'value')],
      [createDataCell('Total Records', 0, 'label'), createDataCell(rowCount, 0, 'count')],
      ['', ''],

      // Filters section
      [createHeaderCell('Applied Filters'), ''],
      ['', ''],
    ];

    // Add filters if present
    if (filters && Object.keys(filters).length > 0) {
      let filterIndex = 0;
      Object.entries(filters).forEach(([key, value]) => {
        const formattedValue = this.formatFilterValue(value);
        if (formattedValue) {
          metadata.push([
            createDataCell(formatFieldName(key), filterIndex, 'label'),
            createDataCell(formattedValue, filterIndex, 'value'),
          ]);
          filterIndex++;
        }
      });
    } else {
      metadata.push([createDataCell('No filters applied', 0, 'value'), '']);
    }

    // Add export details
    metadata.push(
      ['', ''],
      [createHeaderCell('Export Details'), ''],
      ['', ''],
      [createDataCell('File Format', 0, 'label'), createDataCell('Excel Workbook (.xlsx)', 0, 'value')],
      [createDataCell('Sheets Included', 1, 'label'), createDataCell('Data, Summary, Metadata', 1, 'value')],
      [createDataCell('Compatible With', 0, 'label'), createDataCell('Microsoft Excel, Google Sheets, LibreOffice', 0, 'value')]
    );

    const worksheet = XLSX.utils.aoa_to_sheet(metadata, { cellStyles: true });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Label column
      { wch: 50 }, // Value column
    ];

    return worksheet;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Format filter value for display
   *
   * @param value Filter value
   * @returns Formatted string representation
   */
  private formatFilterValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Handle date ranges
    if (typeof value === 'object' && 'start' in value && 'end' in value) {
      const start = value.start || 'Not set';
      const end = value.end || 'Not set';
      return `${start} to ${end}`;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      return value.join(', ');
    }

    // Handle objects
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  /**
   * Sanitize filename for safe file system usage
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
}
