/**
 * PDF Formatter Utilities
 * Provides formatting functions for PDF export
 */

import { FilterOption } from '../IExportService';

export class PdfFormatter {
  /**
   * Extract column headers from data array
   * @param data - Array of data objects
   * @returns Array of header strings
   */
  static extractHeaders(data: any[]): string[] {
    if (!data || data.length === 0) {
      return [];
    }

    // Get all unique keys from all objects (some objects may have different fields)
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    return Array.from(allKeys).map(key => this.formatFieldName(key));
  }

  /**
   * Format table data for jspdf-autotable
   * @param data - Array of data objects
   * @returns Formatted data array for autotable
   */
  static formatTableData(data: any[]): any[][] {
    if (!data || data.length === 0) {
      return [];
    }

    // Get headers to ensure consistent column ordering
    const keys = Object.keys(data[0]);

    return data.map(item => {
      return keys.map(key => this.formatCellValue(item[key]));
    });
  }

  /**
   * Convert camelCase or snake_case to Title Case
   * @param fieldName - Field name to format
   * @returns Formatted field name
   */
  static formatFieldName(fieldName: string): string {
    // Handle snake_case
    if (fieldName.includes('_')) {
      return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    // Handle camelCase
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Format cell value based on its type
   * @param value - Value to format
   * @returns Formatted string value
   */
  static formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    // Handle boolean
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle dates
    if (value instanceof Date) {
      return this.formatDate(value);
    }

    // Try to parse ISO date strings
    if (typeof value === 'string' && this.isISODate(value)) {
      return this.formatDate(new Date(value));
    }

    // Handle numbers
    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    // Handle objects
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Format date to readable string
   * @param date - Date to format
   * @returns Formatted date string
   */
  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Format number with appropriate precision
   * @param num - Number to format
   * @returns Formatted number string
   */
  static formatNumber(num: number): string {
    // If it's an integer, don't show decimals
    if (Number.isInteger(num)) {
      return num.toLocaleString('en-US');
    }

    // Show up to 2 decimal places for floats
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Format currency value
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format filter value for display
   * @param value - Filter value
   * @returns Formatted filter value string
   */
  static formatFilterValue(value: string | string[] | Date | null): string {
    if (value === null || value === undefined) {
      return 'None';
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }

    if (value instanceof Date) {
      return this.formatDate(value);
    }

    return String(value);
  }

  /**
   * Calculate optimal column widths based on content
   * @param headers - Array of header strings
   * @param data - Array of data rows
   * @param maxWidth - Maximum width for the table
   * @returns Object with column width configuration
   */
  static calculateColumnWidths(
    headers: string[],
    data: any[][],
    maxWidth: number = 190
  ): { [key: string]: number } {
    const columnWidths: { [key: string]: number } = {};
    const numColumns = headers.length;

    if (numColumns === 0) {
      return columnWidths;
    }

    // Calculate approximate width needed for each column
    const baseWidth = maxWidth / numColumns;
    const minWidth = 30;
    const maxColWidth = Math.max(baseWidth * 1.5, 60);

    headers.forEach((header, index) => {
      // Start with base width
      let width = baseWidth;

      // Adjust based on header length
      const headerLength = header.length;
      if (headerLength > 20) {
        width = Math.min(maxColWidth, baseWidth * 1.3);
      }

      // Sample first few rows to get content width estimate
      const sampleSize = Math.min(5, data.length);
      let maxContentLength = 0;

      for (let i = 0; i < sampleSize; i++) {
        const cellValue = String(data[i]?.[index] || '');
        maxContentLength = Math.max(maxContentLength, cellValue.length);
      }

      // Adjust width based on content
      if (maxContentLength > 30) {
        width = Math.min(maxColWidth, baseWidth * 1.4);
      } else if (maxContentLength < 10) {
        width = Math.max(minWidth, baseWidth * 0.8);
      }

      columnWidths[index] = Math.round(width);
    });

    return columnWidths;
  }

  /**
   * Check if a string is an ISO date format
   * @param str - String to check
   * @returns True if string is ISO date format
   */
  private static isISODate(str: string): boolean {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return isoDatePattern.test(str);
  }

  /**
   * Truncate text to specified length with ellipsis
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @returns Truncated text
   */
  static truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Split long text into multiple lines for better PDF rendering
   * @param text - Text to split
   * @param maxLineLength - Maximum characters per line
   * @returns Array of text lines
   */
  static splitLongText(text: string, maxLineLength: number = 80): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= maxLineLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
