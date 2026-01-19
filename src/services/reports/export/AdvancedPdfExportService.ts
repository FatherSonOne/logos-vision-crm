/**
 * Advanced PDF Export Service
 * Extended implementation supporting multiple charts, multiple orientations, and page sizes
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
  ExportOptions as NewExportOptions,
  ChartOptions,
  FilterOption,
  IExportService as NewIExportService,
} from './IExportService';
import { PdfFormatter } from './formatters/PdfFormatter';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

/**
 * Advanced PDF Export Service with comprehensive features
 */
export class AdvancedPdfExportService implements NewIExportService {
  private doc: jsPDF | null = null;
  private currentY: number = 20;
  private readonly pageMargin = 15;
  private readonly lineHeight = 7;
  private readonly logoUrl = '/logos-crm-logo.png';

  /**
   * Export data to PDF format with advanced options
   */
  async exportToPDF(
    data: any[],
    options: NewExportOptions,
    charts?: ChartOptions[],
    filters?: FilterOption[]
  ): Promise<void> {
    try {
      // Initialize PDF document
      this.initializeDocument(options);

      if (!this.doc) {
        throw new Error('Failed to initialize PDF document');
      }

      // Add header with title and description
      this.addHeader(options.title, options.description);

      // Add filter summary if requested and filters exist
      if (options.includeFilters && filters && filters.length > 0) {
        this.addFilterSummary(filters);
      }

      // Add charts if requested and charts exist
      if (options.includeCharts && charts && charts.length > 0) {
        await this.addCharts(charts);
      }

      // Add data table
      this.addDataTable(data);

      // Add footer to all pages
      this.addFooter();

      // Generate filename
      const fileName = options.fileName || this.generateFileName(options.title);

      // Save the PDF
      this.doc.save(fileName);

      console.log(`PDF exported successfully: ${fileName}`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error(
        `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      this.cleanup();
    }
  }

  /**
   * Export to Excel (placeholder for future implementation)
   */
  async exportToExcel(data: any[], options: NewExportOptions): Promise<void> {
    throw new Error('Excel export not yet implemented');
  }

  /**
   * Export to CSV (placeholder for future implementation)
   */
  async exportToCSV(data: any[], options: NewExportOptions): Promise<void> {
    throw new Error('CSV export not yet implemented');
  }

  /**
   * Initialize PDF document with specified options
   */
  private initializeDocument(options: NewExportOptions): void {
    const orientation = options.orientation || 'portrait';
    const format = this.getPageFormat(options.pageSize || 'a4');

    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    this.currentY = this.pageMargin;
  }

  /**
   * Get page format dimensions
   */
  private getPageFormat(pageSize: string): [number, number] | string {
    const formats: { [key: string]: [number, number] | string } = {
      a4: 'a4',
      letter: 'letter',
      legal: 'legal',
    };

    return formats[pageSize.toLowerCase()] || 'a4';
  }

  /**
   * Add header with logo, title, and description
   */
  private addHeader(title: string, description?: string): void {
    if (!this.doc) return;

    const pageWidth = this.doc.internal.pageSize.getWidth();

    // Add logo (if available)
    try {
      // Logo would be added here if available
      // this.doc.addImage(logoData, 'PNG', this.pageMargin, this.currentY, 30, 15);
    } catch (error) {
      console.debug('Logo not available for PDF export');
    }

    // Add title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageMargin, this.currentY + 10);
    this.currentY += 15;

    // Add description if provided
    if (description) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100);

      const descLines = this.doc.splitTextToSize(
        description,
        pageWidth - 2 * this.pageMargin
      );

      descLines.forEach((line: string) => {
        this.doc!.text(line, this.pageMargin, this.currentY);
        this.currentY += this.lineHeight;
      });

      this.doc.setTextColor(0);
    }

    // Add divider line
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(200);
    this.doc.line(
      this.pageMargin,
      this.currentY + 2,
      pageWidth - this.pageMargin,
      this.currentY + 2
    );
    this.currentY += 8;
  }

  /**
   * Add filter summary section
   */
  private addFilterSummary(filters: FilterOption[]): void {
    if (!this.doc || filters.length === 0) return;

    const pageWidth = this.doc.internal.pageSize.getWidth();

    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Active Filters', this.pageMargin, this.currentY);
    this.currentY += 8;

    // Filter items
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    filters.forEach((filter) => {
      const filterText = `${filter.label}: ${PdfFormatter.formatFilterValue(
        filter.value
      )}`;
      const lines = this.doc!.splitTextToSize(
        filterText,
        pageWidth - 2 * this.pageMargin - 5
      );

      lines.forEach((line: string) => {
        // Check if we need a new page
        this.checkPageBreak();

        this.doc!.setFillColor(245, 245, 245);
        this.doc!.rect(
          this.pageMargin,
          this.currentY - 4,
          pageWidth - 2 * this.pageMargin,
          6,
          'F'
        );

        this.doc!.text(line, this.pageMargin + 2, this.currentY);
        this.currentY += this.lineHeight;
      });
    });

    this.currentY += 5;
  }

  /**
   * Add multiple charts to the PDF
   */
  private async addCharts(charts: ChartOptions[]): Promise<void> {
    if (!this.doc) return;

    const pageWidth = this.doc.internal.pageSize.getWidth();

    for (const chart of charts) {
      try {
        // Section title for chart
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(chart.title, this.pageMargin, this.currentY);
        this.currentY += 8;

        // Capture chart as image
        const canvas = await this.captureChart(chart);
        const imgData = canvas.toDataURL('image/png');

        // Calculate dimensions
        const maxWidth = pageWidth - 2 * this.pageMargin;
        const chartWidth = chart.width || maxWidth;
        const chartHeight =
          chart.height || (chartWidth * canvas.height) / canvas.width;

        // Scale to fit page width if needed
        let finalWidth = Math.min(chartWidth, maxWidth);
        let finalHeight = (finalWidth * canvas.height) / canvas.width;

        // Check if chart fits on current page
        const pageHeight = this.doc.internal.pageSize.getHeight();
        if (this.currentY + finalHeight > pageHeight - this.pageMargin - 20) {
          this.addPage();
        }

        // Add image to PDF
        this.doc.addImage(
          imgData,
          'PNG',
          this.pageMargin,
          this.currentY,
          finalWidth,
          finalHeight
        );

        this.currentY += finalHeight + 10;
      } catch (error) {
        console.error(`Error adding chart "${chart.title}":`, error);
        // Continue with next chart
      }
    }
  }

  /**
   * Capture chart element as high-resolution canvas
   */
  private async captureChart(chart: ChartOptions): Promise<HTMLCanvasElement> {
    const resolution = chart.resolution || 2; // Default 2x for retina displays

    const canvas = await html2canvas(chart.element, {
      scale: resolution,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    return canvas;
  }

  /**
   * Add data table to the PDF
   */
  private addDataTable(data: any[]): void {
    if (!this.doc || !data || data.length === 0) {
      this.addNoDataMessage();
      return;
    }

    // Extract headers and format data
    const headers = PdfFormatter.extractHeaders(data);
    const formattedData = PdfFormatter.formatTableData(data);

    // Calculate column widths
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - 2 * this.pageMargin;
    const columnWidths = PdfFormatter.calculateColumnWidths(
      headers,
      formattedData,
      tableWidth
    );

    // Convert column widths to columnStyles format expected by autoTable
    const columnStyles: { [key: string]: { cellWidth: number } } = {};
    Object.entries(columnWidths).forEach(([index, width]) => {
      columnStyles[index] = { cellWidth: width };
    });

    // Add table using autoTable
    autoTable(this.doc, {
      head: [headers],
      body: formattedData,
      startY: this.currentY,
      margin: { left: this.pageMargin, right: this.pageMargin },
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
      },
      headStyles: {
        fillColor: [66, 139, 202], // Bootstrap primary blue
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles,
      didDrawPage: (data) => {
        // Update currentY after table is drawn
        this.currentY = data.cursor?.y || this.currentY;
      },
    });

    // Update Y position after table
    const finalY = this.doc.lastAutoTable?.finalY;
    if (finalY) {
      this.currentY = finalY + 10;
    }
  }

  /**
   * Add "No Data Available" message
   */
  private addNoDataMessage(): void {
    if (!this.doc) return;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(150);
    this.doc.text(
      'No data available to display',
      this.pageMargin,
      this.currentY
    );
    this.doc.setTextColor(0);
    this.currentY += 10;
  }

  /**
   * Add footer with page numbers and timestamp
   */
  private addFooter(): void {
    if (!this.doc) return;

    const pageCount = this.doc.getNumberOfPages();
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();

    // Add footer to each page
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setLineWidth(0.3);
      this.doc.setDrawColor(200);
      this.doc.line(
        this.pageMargin,
        pageHeight - 15,
        pageWidth - this.pageMargin,
        pageHeight - 15
      );

      // Page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - this.pageMargin - 20,
        pageHeight - 10
      );

      // Timestamp
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      this.doc.text(
        `Generated: ${timestamp}`,
        this.pageMargin,
        pageHeight - 10
      );
    }

    this.doc.setTextColor(0);
  }

  /**
   * Check if we need to add a new page
   */
  private checkPageBreak(requiredSpace: number = 20): void {
    if (!this.doc) return;

    const pageHeight = this.doc.internal.pageSize.getHeight();

    if (this.currentY + requiredSpace > pageHeight - this.pageMargin - 20) {
      this.addPage();
    }
  }

  /**
   * Add a new page to the document
   */
  private addPage(): void {
    if (!this.doc) return;

    this.doc.addPage();
    this.currentY = this.pageMargin;
  }

  /**
   * Generate filename from title
   */
  private generateFileName(title: string): string {
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitizedTitle}-${timestamp}.pdf`;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.doc = null;
    this.currentY = 20;
  }
}

// Export singleton instance
export default new AdvancedPdfExportService();
