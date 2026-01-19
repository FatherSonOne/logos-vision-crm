/**
 * Excel Formatter Utilities
 *
 * Provides formatting, styling, and layout utilities for Excel export.
 * Handles cell styling, column width calculations, and data type formatting.
 */

import * as XLSX from 'xlsx';

// ============================================
// CONSTANTS
// ============================================

export const EXCEL_STYLES = {
  HEADER_BG: '#4F46E5', // Indigo-600
  HEADER_FG: '#FFFFFF', // White
  ALT_ROW_BG: '#F9FAFB', // Gray-50
  BORDER_COLOR: '#E5E7EB', // Gray-200
};

// Common numeric field patterns
const NUMERIC_FIELD_PATTERNS = [
  /amount/i,
  /total/i,
  /price/i,
  /cost/i,
  /fee/i,
  /value/i,
  /revenue/i,
  /expense/i,
  /balance/i,
  /count/i,
  /quantity/i,
  /qty/i,
  /number/i,
  /num/i,
  /rate/i,
  /percentage/i,
  /percent/i,
];

// Date field patterns
const DATE_FIELD_PATTERNS = [
  /date/i,
  /time/i,
  /created/i,
  /updated/i,
  /modified/i,
  /at$/i,
  /_at$/i,
];

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CellStyle {
  font?: {
    bold?: boolean;
    color?: { rgb: string };
    size?: number;
  };
  fill?: {
    fgColor: { rgb: string };
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'center' | 'bottom';
  };
  border?: {
    top?: { style: string; color: { rgb: string } };
    bottom?: { style: string; color: { rgb: string } };
    left?: { style: string; color: { rgb: string } };
    right?: { style: string; color: { rgb: string } };
  };
  numFmt?: string;
}

export interface ColumnInfo {
  field: string;
  width: number;
  type: 'string' | 'number' | 'date' | 'boolean';
  isNumeric: boolean;
  format?: string;
}

// ============================================
// FIELD ANALYSIS
// ============================================

/**
 * Identify numeric fields from data array
 *
 * Analyzes field names and sample values to determine which columns
 * contain numeric data suitable for summary statistics.
 *
 * @param data Array of data objects
 * @returns Array of numeric field names
 */
export function getNumericFields(data: any[]): string[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const fields = Object.keys(firstRow);
  const numericFields: string[] = [];

  for (const field of fields) {
    // Check field name patterns
    const matchesPattern = NUMERIC_FIELD_PATTERNS.some(pattern =>
      pattern.test(field)
    );

    // Check actual values in data
    const hasNumericValues = data
      .slice(0, Math.min(10, data.length))
      .every(row => {
        const value = row[field];
        return (
          value === null ||
          value === undefined ||
          typeof value === 'number' ||
          (!isNaN(parseFloat(value)) && isFinite(parseFloat(value)))
        );
      });

    if (matchesPattern || hasNumericValues) {
      // Verify at least some non-null numeric values exist
      const hasValues = data.some(row => {
        const value = row[field];
        return (
          value !== null &&
          value !== undefined &&
          (typeof value === 'number' || !isNaN(parseFloat(value)))
        );
      });

      if (hasValues) {
        numericFields.push(field);
      }
    }
  }

  return numericFields;
}

/**
 * Check if field is a date field
 *
 * @param fieldName Field name to check
 * @param sampleValues Sample values from the field
 * @returns True if field appears to contain dates
 */
export function isDateField(fieldName: string, sampleValues: any[]): boolean {
  // Check field name patterns
  const matchesPattern = DATE_FIELD_PATTERNS.some(pattern =>
    pattern.test(fieldName)
  );

  if (!matchesPattern) return false;

  // Verify values are date-like
  const validDates = sampleValues
    .filter(v => v !== null && v !== undefined)
    .slice(0, 5);

  if (validDates.length === 0) return false;

  const areDates = validDates.every(value => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  });

  return areDates;
}

// ============================================
// FIELD FORMATTING
// ============================================

/**
 * Format field name to Title Case
 *
 * Converts snake_case, camelCase, and kebab-case to readable Title Case.
 * Examples:
 *   - "first_name" -> "First Name"
 *   - "createdAt" -> "Created At"
 *   - "total-amount" -> "Total Amount"
 *
 * @param fieldName Raw field name
 * @returns Formatted field name
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    // Handle camelCase
    .replace(/([A-Z])/g, ' $1')
    // Handle snake_case and kebab-case
    .replace(/[_-]/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, char => char.toUpperCase())
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// COLUMN WIDTH CALCULATION
// ============================================

/**
 * Calculate optimal column widths based on content
 *
 * Analyzes header names and cell values to determine appropriate column widths.
 * Uses character counting with adjustments for different data types.
 *
 * @param data Array of data objects
 * @param maxWidth Maximum column width in characters (default: 50)
 * @param minWidth Minimum column width in characters (default: 10)
 * @returns Object mapping field names to column widths
 */
export function calculateColumnWidths(
  data: any[],
  maxWidth: number = 50,
  minWidth: number = 10
): Record<string, number> {
  if (!data || data.length === 0) return {};

  const widths: Record<string, number> = {};
  const fields = Object.keys(data[0]);

  for (const field of fields) {
    // Start with header width
    const headerWidth = formatFieldName(field).length;
    let maxValueWidth = headerWidth;

    // Sample up to 100 rows for performance
    const sampleSize = Math.min(100, data.length);
    const step = Math.ceil(data.length / sampleSize);

    for (let i = 0; i < data.length; i += step) {
      const value = data[i][field];
      const valueWidth = getValueWidth(value);
      maxValueWidth = Math.max(maxValueWidth, valueWidth);
    }

    // Add padding and apply min/max constraints
    widths[field] = Math.min(
      Math.max(maxValueWidth + 2, minWidth),
      maxWidth
    );
  }

  return widths;
}

/**
 * Get display width for a value
 *
 * @param value Cell value
 * @returns Estimated character width
 */
function getValueWidth(value: any): number {
  if (value === null || value === undefined) return 0;

  // Handle dates
  if (value instanceof Date || isDateString(value)) {
    return 20; // ISO date format length
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value.toLocaleString().length;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return 5; // "true" or "false"
  }

  // Handle objects/arrays
  if (typeof value === 'object') {
    return Math.min(JSON.stringify(value).length, 30);
  }

  // Handle strings
  return String(value).length;
}

/**
 * Check if string value is a date
 *
 * @param value String to check
 * @returns True if value is a valid date string
 */
function isDateString(value: any): boolean {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ============================================
// CELL FORMATTING
// ============================================

/**
 * Format number cell with appropriate number format
 *
 * @param value Number value
 * @param fieldName Field name for context
 * @returns Formatted cell object
 */
export function formatNumberCell(value: number, fieldName: string): any {
  // Determine format based on field name
  let numFmt = '#,##0.00'; // Default: two decimal places

  if (/amount|price|cost|fee|value|revenue|expense|balance/i.test(fieldName)) {
    numFmt = '"$"#,##0.00'; // Currency format
  } else if (/percent|rate/i.test(fieldName)) {
    numFmt = '0.00%'; // Percentage format
  } else if (/count|quantity|qty|number|num/i.test(fieldName)) {
    numFmt = '#,##0'; // Integer format
  }

  return {
    t: 'n', // Number type
    v: value,
    z: numFmt,
  };
}

/**
 * Format date cell with ISO date format
 *
 * @param value Date value (string or Date object)
 * @returns Formatted cell object
 */
export function formatDateCell(value: Date | string): any {
  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return { t: 's', v: String(value) }; // Fallback to string
  }

  return {
    t: 'd', // Date type
    v: date,
    z: 'yyyy-mm-dd hh:mm:ss', // ISO format
  };
}

// ============================================
// HEADER CELL CREATION
// ============================================

/**
 * Create styled header cell
 *
 * Creates a cell with professional header styling:
 * - Bold white text on indigo background
 * - Centered alignment
 * - Borders
 *
 * @param value Header text
 * @returns Cell object with styling
 */
export function createHeaderCell(value: string): XLSX.CellObject {
  return {
    t: 's',
    v: value,
    s: {
      font: {
        bold: true,
        color: { rgb: EXCEL_STYLES.HEADER_FG.replace('#', '') },
        size: 11,
      },
      fill: {
        fgColor: { rgb: EXCEL_STYLES.HEADER_BG.replace('#', '') },
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
      },
      border: {
        top: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
        bottom: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
        left: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
        right: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
      },
    },
  };
}

/**
 * Create styled data cell with optional alternating row background
 *
 * @param value Cell value
 * @param rowIndex Row index for alternating colors
 * @param fieldName Field name for type-specific formatting
 * @returns Cell object with styling
 */
export function createDataCell(
  value: any,
  rowIndex: number,
  fieldName: string
): XLSX.CellObject {
  let cell: XLSX.CellObject;

  // Handle null/undefined
  if (value === null || value === undefined) {
    cell = { t: 's', v: '' };
  }
  // Handle dates
  else if (value instanceof Date || isDateString(value)) {
    cell = formatDateCell(value);
  }
  // Handle numbers
  else if (typeof value === 'number') {
    cell = formatNumberCell(value, fieldName);
  }
  // Handle booleans
  else if (typeof value === 'boolean') {
    cell = { t: 'b', v: value };
  }
  // Handle objects/arrays
  else if (typeof value === 'object') {
    cell = { t: 's', v: JSON.stringify(value) };
  }
  // Default to string
  else {
    cell = { t: 's', v: String(value) };
  }

  // Add styling
  const isAlternateRow = rowIndex % 2 === 0;
  cell.s = {
    fill: isAlternateRow
      ? { fgColor: { rgb: EXCEL_STYLES.ALT_ROW_BG.replace('#', '') } }
      : undefined,
    border: {
      top: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
      bottom: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
      left: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
      right: { style: 'thin', color: { rgb: EXCEL_STYLES.BORDER_COLOR.replace('#', '') } },
    },
  };

  return cell;
}

// ============================================
// SUMMARY STATISTICS
// ============================================

export interface SummaryStats {
  field: string;
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

/**
 * Calculate summary statistics for numeric fields
 *
 * @param data Array of data objects
 * @param numericFields Array of numeric field names
 * @returns Array of summary statistics objects
 */
export function calculateSummaryStats(
  data: any[],
  numericFields: string[]
): SummaryStats[] {
  const stats: SummaryStats[] = [];

  for (const field of numericFields) {
    const values = data
      .map(row => {
        const value = row[field];
        return typeof value === 'number' ? value : parseFloat(value);
      })
      .filter(v => !isNaN(v) && isFinite(v));

    if (values.length === 0) continue;

    const sum = values.reduce((acc, v) => acc + v, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    stats.push({
      field: formatFieldName(field),
      count: values.length,
      sum,
      average,
      min,
      max,
    });
  }

  return stats;
}
