import { exportPerformanceMonitor } from './ExportPerformanceMonitor';
import type { ExportFormat } from '../../reportService';

// ============================================
// EXPORT SERVICE
// ============================================

/**
 * Base export service with performance monitoring integration
 */
export class ExportService {
  /**
   * Export data to CSV format
   */
  async exportToCSV(data: any[], filename: string): Promise<Blob> {
    const startTime = performance.now();
    const rowCount = data.length;

    try {
      // Convert data to CSV
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      // Record performance metric
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'csv',
        rowCount,
        executionTime,
        blob.size,
        true
      );

      // Trigger download
      this.downloadBlob(blob, filename);

      return blob;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'csv',
        rowCount,
        executionTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(data: any[], filename: string): Promise<Blob> {
    const startTime = performance.now();
    const rowCount = data.length;

    try {
      // This would use a library like xlsx or exceljs
      // For now, we'll simulate the export
      const workbook = await this.createExcelWorkbook(data);
      const blob = new Blob([workbook], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Record performance metric
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'excel',
        rowCount,
        executionTime,
        blob.size,
        true
      );

      // Trigger download
      this.downloadBlob(blob, filename);

      return blob;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'excel',
        rowCount,
        executionTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Export data to PDF format
   */
  async exportToPDF(data: any[], filename: string, title?: string): Promise<Blob> {
    const startTime = performance.now();
    const rowCount = data.length;

    try {
      // This would use a library like jsPDF or pdfmake
      const pdf = await this.createPDF(data, title);
      const blob = new Blob([pdf], { type: 'application/pdf' });

      // Record performance metric
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'pdf',
        rowCount,
        executionTime,
        blob.size,
        true
      );

      // Trigger download
      this.downloadBlob(blob, filename);

      return blob;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'pdf',
        rowCount,
        executionTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Export chart to PNG format
   */
  async exportToPNG(
    chartElement: HTMLElement,
    filename: string
  ): Promise<Blob> {
    const startTime = performance.now();

    try {
      // This would use a library like html2canvas
      const canvas = await this.elementToCanvas(chartElement);
      const blob = await this.canvasToBlob(canvas);

      // Record performance metric (1 row for visual exports)
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'png',
        1,
        executionTime,
        blob.size,
        true
      );

      // Trigger download
      this.downloadBlob(blob, filename);

      return blob;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'png',
        1,
        executionTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(data: any[], filename: string): Promise<Blob> {
    const startTime = performance.now();
    const rowCount = data.length;

    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      // Record performance metric
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'json',
        rowCount,
        executionTime,
        blob.size,
        true
      );

      // Trigger download
      this.downloadBlob(blob, filename);

      return blob;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      exportPerformanceMonitor.recordMetric(
        'json',
        rowCount,
        executionTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Get performance recommendations before export
   */
  getExportRecommendations(format: ExportFormat, rowCount: number) {
    const recommendations = exportPerformanceMonitor.getRecommendations(
      format,
      rowCount
    );
    const estimate = exportPerformanceMonitor.estimateTime(format, rowCount);

    return {
      recommendations,
      estimate,
    };
  }

  /**
   * Get format comparison for user selection
   */
  getFormatComparison(rowCount: number) {
    return exportPerformanceMonitor.compareFormats(rowCount);
  }

  /**
   * Get export statistics
   */
  getExportStats(format?: ExportFormat) {
    return exportPerformanceMonitor.getStats(format);
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Convert rows to CSV
    const csvRows = data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  private async createExcelWorkbook(data: any[]): Promise<ArrayBuffer> {
    // Placeholder for Excel creation
    // In production, use libraries like:
    // - xlsx (SheetJS)
    // - exceljs
    // - xlsx-populate

    // For now, return CSV as fallback
    const csv = this.convertToCSV(data);
    return new TextEncoder().encode(csv).buffer;
  }

  private async createPDF(data: any[], title?: string): Promise<ArrayBuffer> {
    // Placeholder for PDF creation
    // In production, use libraries like:
    // - jsPDF
    // - pdfmake
    // - @react-pdf/renderer

    // For now, return a simple text representation
    const text = `${title || 'Export'}\n\n${JSON.stringify(data, null, 2)}`;
    return new TextEncoder().encode(text).buffer;
  }

  private async elementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    // Placeholder for HTML to Canvas conversion
    // In production, use libraries like:
    // - html2canvas
    // - dom-to-image
    // - rasterizeHTML

    const canvas = document.createElement('canvas');
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    return canvas;
  }

  private async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const exportService = new ExportService();
