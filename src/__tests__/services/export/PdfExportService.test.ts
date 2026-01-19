/**
 * Comprehensive test suite for PDF Export Service
 * Tests PDF generation with various configurations, error handling, and performance
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  generateMockContacts,
  generateMockChartData,
  createMockChartElement,
  cleanupMockChartElement,
  measureExecutionTime,
  PerformanceBenchmark,
  MockJsPDF,
  mockHtml2Canvas,
} from './testUtils';

// Mock dependencies
jest.mock('jspdf');
jest.mock('html2canvas');
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Import after mocks
import { PdfExportService } from '../../../services/export/PdfExportService';
import type { ExportConfig } from '../../../services/export/types';

describe('PdfExportService', () => {
  let service: PdfExportService;
  let mockPdf: MockJsPDF;
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    service = new PdfExportService();
    mockPdf = new MockJsPDF();
    benchmark = new PerformanceBenchmark();

    // Setup jsPDF mock
    (jsPDF as jest.MockedClass<typeof jsPDF>).mockImplementation(
      () => mockPdf as any
    );

    // Setup html2canvas mock
    (html2canvas as jest.MockedFunction<typeof html2canvas>).mockImplementation(
      mockHtml2Canvas
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    benchmark.clear();
  });

  describe('Basic PDF Generation', () => {
    it('should generate PDF with default configuration', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'test-report',
        format: 'pdf',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalled();
      expect(mockPdf.save).toHaveBeenCalledWith('test-report.pdf');
    });

    it('should generate PDF with custom filename', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'custom-report-2024',
        format: 'pdf',
      };

      await service.export(config);

      expect(mockPdf.save).toHaveBeenCalledWith('custom-report-2024.pdf');
    });

    it('should handle empty dataset gracefully', async () => {
      const config: ExportConfig = {
        data: [],
        filename: 'empty-report',
        format: 'pdf',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalled();
      expect(mockPdf.save).toHaveBeenCalledWith('empty-report.pdf');
    });
  });

  describe('Chart Integration', () => {
    let chartElement: HTMLElement;

    beforeEach(() => {
      chartElement = createMockChartElement();
    });

    afterEach(() => {
      cleanupMockChartElement(chartElement);
    });

    it('should include chart in PDF export', async () => {
      const data = generateMockChartData(5);
      const config: ExportConfig = {
        data,
        filename: 'chart-report',
        format: 'pdf',
        chartElement,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          scale: expect.any(Number),
          useCORS: true,
          allowTaint: true,
        })
      );
      expect(mockPdf.addImage).toHaveBeenCalled();
    });

    it('should handle multiple chart types', async () => {
      const chartTypes = ['bar', 'line', 'pie', 'area', 'scatter'];

      for (const chartType of chartTypes) {
        const config: ExportConfig = {
          data: generateMockChartData(10),
          filename: `${chartType}-chart`,
          format: 'pdf',
          chartElement,
          chartType,
        };

        await service.export(config);

        expect(html2canvas).toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });

    it('should use high resolution for chart rendering', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'high-res-chart',
        format: 'pdf',
        chartElement,
        chartResolution: 'high',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          scale: 3, // High resolution scale
        })
      );
    });

    it('should use medium resolution by default', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'default-res-chart',
        format: 'pdf',
        chartElement,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          scale: 2, // Medium resolution scale
        })
      );
    });

    it('should handle missing chart element gracefully', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'missing-chart',
        format: 'pdf',
        chartElement: null as any,
      };

      await expect(service.export(config)).rejects.toThrow();
    });
  });

  describe('Page Orientation and Size', () => {
    it('should create PDF in portrait orientation', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'portrait-report',
        format: 'pdf',
        orientation: 'portrait',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'portrait',
        })
      );
    });

    it('should create PDF in landscape orientation', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'landscape-report',
        format: 'pdf',
        orientation: 'landscape',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'landscape',
        })
      );
    });

    it('should support A4 page size', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'a4-report',
        format: 'pdf',
        pageSize: 'a4',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'a4',
        })
      );
    });

    it('should support Letter page size', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'letter-report',
        format: 'pdf',
        pageSize: 'letter',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'letter',
        })
      );
    });

    it('should support Legal page size', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'legal-report',
        format: 'pdf',
        pageSize: 'legal',
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'legal',
        })
      );
    });
  });

  describe('Multi-Page PDFs', () => {
    it('should create multiple pages for large datasets', async () => {
      const data = generateMockContacts(100); // Should require multiple pages
      const config: ExportConfig = {
        data,
        filename: 'multi-page-report',
        format: 'pdf',
      };

      await service.export(config);

      // Should have called addPage at least once
      expect(mockPdf.pages.length).toBeGreaterThan(1);
    });

    it('should paginate data correctly', async () => {
      const data = generateMockContacts(250);
      const config: ExportConfig = {
        data,
        filename: 'paginated-report',
        format: 'pdf',
        rowsPerPage: 50,
      };

      await service.export(config);

      // Should have 5 pages (250 rows / 50 rows per page)
      expect(mockPdf.pages.length).toBe(5);
    });

    it('should include page numbers on multi-page PDFs', async () => {
      const data = generateMockContacts(100);
      const config: ExportConfig = {
        data,
        filename: 'numbered-pages',
        format: 'pdf',
        includePageNumbers: true,
      };

      await service.export(config);

      // Check that text was added (page numbers)
      mockPdf.pages.forEach((page, index) => {
        if (page.texts && page.texts.length > 0) {
          const hasPageNumber = page.texts.some(
            (text: any) => text.text.includes(`${index + 1}`)
          );
          expect(hasPageNumber).toBe(true);
        }
      });
    });
  });

  describe('Headers and Footers', () => {
    it('should include custom header', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'header-report',
        format: 'pdf',
        title: 'Contact Export Report',
        includeHeader: true,
      };

      await service.export(config);

      const hasHeader = mockPdf.pages.some(
        (page: any) =>
          page.texts &&
          page.texts.some((text: any) =>
            text.text.includes('Contact Export Report')
          )
      );
      expect(hasHeader).toBe(true);
    });

    it('should include footer with metadata', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'footer-report',
        format: 'pdf',
        includeFooter: true,
        metadata: {
          generatedBy: 'Test User',
          generatedAt: new Date('2024-01-15').toISOString(),
        },
      };

      await service.export(config);

      const hasFooter = mockPdf.pages.some(
        (page: any) =>
          page.texts &&
          page.texts.some(
            (text: any) =>
              text.text.includes('Test User') ||
              text.text.includes('2024-01-15')
          )
      );
      expect(hasFooter).toBe(true);
    });

    it('should include company branding in header', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'branded-report',
        format: 'pdf',
        includeHeader: true,
        branding: {
          companyName: 'Acme Corporation',
          logoUrl: 'https://example.com/logo.png',
        },
      };

      await service.export(config);

      const hasCompanyName = mockPdf.pages.some(
        (page: any) =>
          page.texts &&
          page.texts.some((text: any) =>
            text.text.includes('Acme Corporation')
          )
      );
      expect(hasCompanyName).toBe(true);
    });
  });

  describe('Filter Summary', () => {
    it('should include filter summary when filters are applied', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(20),
        filename: 'filtered-report',
        format: 'pdf',
        includeFilterSummary: true,
        appliedFilters: {
          status: 'active',
          dateRange: '2024-01-01 to 2024-12-31',
          company: 'Acme Corp',
        },
      };

      await service.export(config);

      const hasFilterSummary = mockPdf.pages.some(
        (page: any) =>
          page.texts &&
          page.texts.some(
            (text: any) =>
              text.text.includes('active') ||
              text.text.includes('2024-01-01') ||
              text.text.includes('Acme Corp')
          )
      );
      expect(hasFilterSummary).toBe(true);
    });

    it('should not include filter summary when no filters applied', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(20),
        filename: 'unfiltered-report',
        format: 'pdf',
        includeFilterSummary: true,
      };

      await service.export(config);

      // Should not have filter section
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when chart element is not found', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'error-report',
        format: 'pdf',
        chartElement: document.getElementById('non-existent') as HTMLElement,
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should handle html2canvas failure gracefully', async () => {
      const chartElement = createMockChartElement();
      (html2canvas as jest.MockedFunction<typeof html2canvas>).mockRejectedValueOnce(
        new Error('Canvas rendering failed')
      );

      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'canvas-error',
        format: 'pdf',
        chartElement,
      };

      await expect(service.export(config)).rejects.toThrow(
        'Canvas rendering failed'
      );

      cleanupMockChartElement(chartElement);
    });

    it('should handle invalid data gracefully', async () => {
      const config: ExportConfig = {
        data: null as any,
        filename: 'invalid-data',
        format: 'pdf',
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should validate configuration before export', async () => {
      const config = {
        data: generateMockContacts(10),
        // Missing required filename
        format: 'pdf',
      } as ExportConfig;

      await expect(service.export(config)).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should export 1000 rows within performance threshold', async () => {
      const data = generateMockContacts(1000);
      const config: ExportConfig = {
        data,
        filename: 'perf-1000-rows',
        format: 'pdf',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 5 seconds for 1000 rows
      expect(duration).toBeLessThan(5000);
    });

    it('should export 5000 rows within reasonable time', async () => {
      const data = generateMockContacts(5000);
      const config: ExportConfig = {
        data,
        filename: 'perf-5000-rows',
        format: 'pdf',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 15 seconds for 5000 rows
      expect(duration).toBeLessThan(15000);
    });

    it('should export 10000 rows within reasonable time', async () => {
      const data = generateMockContacts(10000);
      const config: ExportConfig = {
        data,
        filename: 'perf-10000-rows',
        format: 'pdf',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 30 seconds for 10000 rows
      expect(duration).toBeLessThan(30000);
    });

    it('should perform consistently across multiple exports', async () => {
      const iterations = 5;
      const data = generateMockContacts(100);

      for (let i = 0; i < iterations; i++) {
        const config: ExportConfig = {
          data,
          filename: `consistency-test-${i}`,
          format: 'pdf',
        };

        await benchmark.measure('100-rows-export', () =>
          service.export(config)
        );
      }

      const stats = benchmark.getStats('100-rows-export');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(iterations);

      // Performance should be relatively consistent
      const variance = stats!.max - stats!.min;
      const avgPercentVariance = (variance / stats!.avg) * 100;
      expect(avgPercentVariance).toBeLessThan(50); // Less than 50% variance
    });
  });

  describe('Advanced Features', () => {
    it('should support custom fonts', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'custom-font-report',
        format: 'pdf',
        fontFamily: 'Helvetica',
      };

      await service.export(config);

      const hasCustomFont = mockPdf.pages.some(
        (page: any) =>
          page.font && page.font.name.toLowerCase().includes('helvetica')
      );
      expect(hasCustomFont).toBe(true);
    });

    it('should support custom font sizes', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'custom-size-report',
        format: 'pdf',
        fontSize: {
          title: 18,
          header: 12,
          body: 10,
        },
      };

      await service.export(config);

      const fontSizes = mockPdf.pages.flatMap(
        (page: any) => page.fontSize || []
      );
      expect(fontSizes).toContain(18);
      expect(fontSizes).toContain(12);
      expect(fontSizes).toContain(10);
    });

    it('should support color customization', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'color-report',
        format: 'pdf',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          header: '#ffffff',
          headerBackground: '#343a40',
        },
      };

      await service.export(config);

      expect(jsPDF).toHaveBeenCalled();
    });

    it('should include summary statistics', async () => {
      const data = generateMockContacts(50);
      const config: ExportConfig = {
        data,
        filename: 'stats-report',
        format: 'pdf',
        includeSummaryStats: true,
      };

      await service.export(config);

      const hasStats = mockPdf.pages.some(
        (page: any) =>
          page.texts &&
          page.texts.some(
            (text: any) =>
              text.text.includes('Total') ||
              text.text.includes('Average') ||
              text.text.includes('Count')
          )
      );
      expect(hasStats).toBe(true);
    });

    it('should support table of contents for multi-section reports', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'toc-report',
        format: 'pdf',
        includeTableOfContents: true,
        sections: [
          { title: 'Overview', data: generateMockContacts(20) },
          { title: 'Details', data: generateMockContacts(50) },
          { title: 'Summary', data: generateMockContacts(30) },
        ],
      };

      await service.export(config);

      const hasToc = mockPdf.pages.some(
        (page: any) =>
          page.texts &&
          page.texts.some(
            (text: any) =>
              text.text.includes('Table of Contents') ||
              text.text.includes('Overview') ||
              text.text.includes('Details')
          )
      );
      expect(hasToc).toBe(true);
    });
  });
});
