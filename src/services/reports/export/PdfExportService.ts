import { IExportService, ExportOptions, ExportResult } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

// ============================================
// ENHANCED PDF EXPORT SERVICE
// ============================================

export class PdfExportService implements IExportService {
  private readonly pageMargin = 15;
  private readonly lineHeight = 7;
  private readonly logoUrl = '/logos-crm-logo.png'; // Adjust path as needed

  getSupportedFormat() {
    return 'pdf' as const;
  }

  async export(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      const { reportName, data, chartElement, filters, timestamp = new Date() } = options;

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let yPosition = this.pageMargin;

      // Add header with title and description
      yPosition = this.addHeader(pdf, reportName, pageWidth, yPosition, timestamp);

      // Add filters if present
      if (filters && Object.keys(filters).length > 0) {
        yPosition = this.addFilterSummary(pdf, filters, pageWidth, pageHeight, yPosition);
      }

      // Add chart image if available with high resolution
      if (chartElement) {
        yPosition = await this.addChart(
          pdf,
          chartElement,
          'Report Visualization',
          pageWidth,
          pageHeight,
          yPosition,
          2 // 2x resolution for retina displays
        );
      }

      // Add data table with enhanced formatting
      if (data && data.length > 0) {
        this.addDataTable(pdf, data, pageWidth, pageHeight, yPosition);
      }

      // Add footer with page numbers and timestamp
      this.addFooter(pdf, timestamp);

      // Get PDF as blob
      const blob = pdf.output('blob');

      // Generate filename
      const dateStr = timestamp.toISOString().split('T')[0];
      const filename = `${this.sanitizeFilename(reportName)}_${dateStr}.pdf`;

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        blob,
        filename,
        fileSize: blob.size,
      };
    } catch (error) {
      console.error('PDF export error:', error);
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'PDF export failed',
      };
    }
  }

  /**
   * Add header with logo, title, and description with divider
   */
  private addHeader(
    pdf: jsPDF,
    title: string,
    pageWidth: number,
    yPosition: number,
    timestamp: Date
  ): number {
    // Add logo (if available)
    try {
      // Logo would be added here if available in the project
      // pdf.addImage(logoData, 'PNG', this.pageMargin, yPosition, 30, 15);
    } catch (error) {
      // Logo not available, skip
    }

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, this.pageMargin, yPosition + 10);
    yPosition += 15;

    // Add timestamp description
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    pdf.text(
      `Generated on ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}`,
      this.pageMargin,
      yPosition
    );
    yPosition += 5;
    pdf.setTextColor(0);

    // Add divider line
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200);
    pdf.line(
      this.pageMargin,
      yPosition + 2,
      pageWidth - this.pageMargin,
      yPosition + 2
    );
    yPosition += 8;

    return yPosition;
  }

  /**
   * Add filter summary section with enhanced formatting
   */
  private addFilterSummary(
    pdf: jsPDF,
    filters: Record<string, any>,
    pageWidth: number,
    pageHeight: number,
    yPosition: number
  ): number {
    // Section title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Active Filters', this.pageMargin, yPosition);
    yPosition += 8;

    // Filter items with background
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    for (const [key, value] of Object.entries(filters)) {
      const filterLabel = PdfFormatter.formatFieldName(key);
      const filterValue = PdfFormatter.formatFilterValue(value);
      const filterText = `${filterLabel}: ${filterValue}`;

      const lines = pdf.splitTextToSize(
        filterText,
        pageWidth - 2 * this.pageMargin - 5
      );

      lines.forEach((line: string) => {
        // Check if we need a new page
        if (yPosition + 6 > pageHeight - this.pageMargin - 20) {
          pdf.addPage();
          yPosition = this.pageMargin;
        }

        // Add subtle background
        pdf.setFillColor(245, 245, 245);
        pdf.rect(
          this.pageMargin,
          yPosition - 4,
          pageWidth - 2 * this.pageMargin,
          6,
          'F'
        );

        pdf.text(line, this.pageMargin + 2, yPosition);
        yPosition += this.lineHeight;
      });
    }

    yPosition += 5;
    return yPosition;
  }

  /**
   * Capture and add chart element as high-resolution PNG
   */
  private async addChart(
    pdf: jsPDF,
    chartElement: HTMLElement,
    title: string,
    pageWidth: number,
    pageHeight: number,
    yPosition: number,
    resolution: number = 2
  ): Promise<number> {
    try {
      // Section title for chart
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, this.pageMargin, yPosition);
      yPosition += 8;

      // Capture chart with high resolution
      const canvas = await html2canvas(chartElement, {
        scale: resolution,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions
      const maxWidth = pageWidth - 2 * this.pageMargin;
      const imgWidth = maxWidth;
      const imgHeight = (imgWidth * canvas.height) / canvas.width;

      // Check if chart fits on current page
      if (yPosition + imgHeight > pageHeight - this.pageMargin - 20) {
        pdf.addPage();
        yPosition = this.pageMargin;
      }

      // Add image to PDF
      pdf.addImage(
        imgData,
        'PNG',
        this.pageMargin,
        yPosition,
        imgWidth,
        imgHeight
      );

      yPosition += imgHeight + 10;
    } catch (error) {
      console.warn(`Error adding chart: ${error}`);
      // Add error message instead
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text('Chart could not be rendered', this.pageMargin, yPosition);
      pdf.setTextColor(0);
      yPosition += 10;
    }

    return yPosition;
  }

  /**
   * Add data table with pagination and enhanced formatting
   */
  private addDataTable(
    pdf: jsPDF,
    data: any[],
    pageWidth: number,
    pageHeight: number,
    yPosition: number
  ): void {
    if (!data || data.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150);
      pdf.text('No data available to display', this.pageMargin, yPosition);
      pdf.setTextColor(0);
      return;
    }

    // Extract headers and format data using PdfFormatter
    const rawHeaders = Object.keys(data[0]);
    const headers = rawHeaders.map(h => PdfFormatter.formatFieldName(h));
    const formattedData = PdfFormatter.formatTableData(data);

    // Calculate column widths
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

    // Check if we need a new page for the table
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = this.pageMargin;
    }

    // Add table using autoTable with enhanced styling
    autoTable(pdf, {
      head: [headers],
      body: formattedData,
      startY: yPosition,
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
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles,
      didDrawPage: (data) => {
        // This ensures proper pagination
      },
    });
  }

  /**
   * Add footer with page numbers and timestamp to all pages
   */
  private addFooter(pdf: jsPDF, timestamp: Date): void {
    const pageCount = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add footer to each page
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      // Footer line
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(200);
      pdf.line(
        this.pageMargin,
        pageHeight - 15,
        pageWidth - this.pageMargin,
        pageHeight - 15
      );

      // Page number
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - this.pageMargin - 20,
        pageHeight - 10
      );

      // Timestamp
      const timestampStr = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      pdf.text(
        `Generated: ${timestampStr}`,
        this.pageMargin,
        pageHeight - 10
      );
    }

    pdf.setTextColor(0);
  }

  /**
   * Format filter value for display
   */
  private formatFilterValue(value: any): string {
    if (value === null || value === undefined) {
      return 'None';
    }

    if (typeof value === 'object' && 'start' in value && 'end' in value) {
      return `${value.start} to ${value.end}`;
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (value instanceof Date) {
      return PdfFormatter.formatDate(value);
    }

    return String(value);
  }

  /**
   * Format cell value based on type
   */
  private formatCellValue(value: any): string {
    return PdfFormatter.formatCellValue(value);
  }

  /**
   * Sanitize filename for safe file system use
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}
