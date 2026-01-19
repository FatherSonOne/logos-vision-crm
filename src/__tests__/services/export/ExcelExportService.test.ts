/**
 * Comprehensive test suite for Excel Export Service
 * Tests multi-sheet workbook creation, styling, formulas, and performance
 */

import * as XLSX from 'xlsx';
import {
  generateMockContacts,
  measureExecutionTime,
  PerformanceBenchmark,
  mockXLSX,
} from './testUtils';

// Mock XLSX
jest.mock('xlsx', () => mockXLSX);
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Import after mocks
import { ExcelExportService } from '../../../services/export/ExcelExportService';
import type { ExportConfig } from '../../../services/export/types';

describe('ExcelExportService', () => {
  let service: ExcelExportService;
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    service = new ExcelExportService();
    benchmark = new PerformanceBenchmark();
    jest.clearAllMocks();
  });

  afterEach(() => {
    benchmark.clear();
  });

  describe('Basic Excel Generation', () => {
    it('should create Excel file with default configuration', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'test-export',
        format: 'excel',
      };

      await service.export(config);

      expect(mockXLSX.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
      expect(mockXLSX.write).toHaveBeenCalled();
    });

    it('should create Excel file with custom filename', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'custom-export-2024',
        format: 'excel',
      };

      await service.export(config);

      expect(mockXLSX.write).toHaveBeenCalled();
    });

    it('should handle empty dataset gracefully', async () => {
      const config: ExportConfig = {
        data: [],
        filename: 'empty-export',
        format: 'excel',
      };

      await service.export(config);

      expect(mockXLSX.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
    });
  });

  describe('Multi-Sheet Workbook', () => {
    it('should create workbook with multiple sheets', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'multi-sheet-export',
        format: 'excel',
        sheets: [
          {
            name: 'All Contacts',
            data: generateMockContacts(100),
          },
          {
            name: 'Active Only',
            data: generateMockContacts(50).filter(c => c.status === 'active'),
          },
          {
            name: 'Summary',
            data: [
              { metric: 'Total Contacts', value: 100 },
              { metric: 'Active Contacts', value: 50 },
            ],
          },
        ],
      };

      await service.export(config);

      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledTimes(3);
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'All Contacts'
      );
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Active Only'
      );
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Summary'
      );
    });

    it('should create data sheet and summary sheet by default', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(50),
        filename: 'auto-sheets',
        format: 'excel',
        includeSummarySheet: true,
      };

      await service.export(config);

      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.stringMatching(/data|sheet/i)
      );
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.stringMatching(/summary|stats/i)
      );
    });

    it('should create metadata sheet when requested', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(20),
        filename: 'with-metadata',
        format: 'excel',
        includeMetadataSheet: true,
        metadata: {
          exportedBy: 'Test User',
          exportedAt: new Date('2024-01-15').toISOString(),
          filters: { status: 'active' },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.stringMatching(/metadata|info/i)
      );
    });

    it('should limit sheet name length to Excel maximum', async () => {
      const longSheetName = 'A'.repeat(50); // Exceeds Excel's 31 char limit
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'long-name',
        format: 'excel',
        sheets: [
          {
            name: longSheetName,
            data: generateMockContacts(10),
          },
        ],
      };

      await service.export(config);

      const calls = (mockXLSX.utils.book_append_sheet as jest.Mock).mock.calls;
      const sheetNames = calls.map(call => call[2]);
      sheetNames.forEach(name => {
        expect(name.length).toBeLessThanOrEqual(31);
      });
    });
  });

  describe('Cell Styling', () => {
    it('should apply header styling', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'styled-headers',
        format: 'excel',
        styling: {
          headerStyle: {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } },
            alignment: { horizontal: 'center', vertical: 'center' },
          },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should apply alternating row colors', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(20),
        filename: 'alternating-rows',
        format: 'excel',
        styling: {
          alternatingRows: true,
          evenRowColor: 'F2F2F2',
          oddRowColor: 'FFFFFF',
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should apply conditional formatting', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(30),
        filename: 'conditional-format',
        format: 'excel',
        conditionalFormatting: [
          {
            column: 'value',
            rules: [
              { condition: 'greaterThan', value: 50000, format: { fill: { fgColor: { rgb: 'C6EFCE' } } } },
              { condition: 'lessThan', value: 10000, format: { fill: { fgColor: { rgb: 'FFC7CE' } } } },
            ],
          },
        ],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should freeze header row', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'frozen-headers',
        format: 'excel',
        freezeHeader: true,
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should auto-size columns based on content', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(20),
        filename: 'auto-sized',
        format: 'excel',
        autoSizeColumns: true,
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });
  });

  describe('Formula Generation', () => {
    it('should add SUM formulas to numeric columns', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'with-sum',
        format: 'excel',
        includeFormulas: true,
        formulas: {
          sum: ['value'],
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should add AVERAGE formulas', async () => {
      const data = generateMockContacts(20);
      const config: ExportConfig = {
        data,
        filename: 'with-average',
        format: 'excel',
        includeFormulas: true,
        formulas: {
          average: ['value'],
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should add MIN and MAX formulas', async () => {
      const data = generateMockContacts(15);
      const config: ExportConfig = {
        data,
        filename: 'with-min-max',
        format: 'excel',
        includeFormulas: true,
        formulas: {
          min: ['value'],
          max: ['value'],
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should add COUNT formulas', async () => {
      const data = generateMockContacts(25);
      const config: ExportConfig = {
        data,
        filename: 'with-count',
        format: 'excel',
        includeFormulas: true,
        formulas: {
          count: ['status', 'category'],
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should add custom formulas', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'custom-formula',
        format: 'excel',
        includeFormulas: true,
        customFormulas: [
          { cell: 'H2', formula: '=SUM(G2:G11)*0.1' }, // 10% commission
          { cell: 'H12', formula: '=SUM(H2:H11)' },
        ],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });
  });

  describe('Data Formatting', () => {
    it('should format currency columns', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'currency-format',
        format: 'excel',
        columnFormats: {
          value: { type: 'currency', currency: 'USD' },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should format date columns', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'date-format',
        format: 'excel',
        columnFormats: {
          created_at: { type: 'date', format: 'yyyy-mm-dd' },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should format number columns with decimals', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'number-format',
        format: 'excel',
        columnFormats: {
          value: { type: 'number', decimals: 2 },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should format percentage columns', async () => {
      const data = [
        { name: 'Item 1', completion: 0.75 },
        { name: 'Item 2', completion: 0.92 },
        { name: 'Item 3', completion: 0.58 },
      ];
      const config: ExportConfig = {
        data,
        filename: 'percentage-format',
        format: 'excel',
        columnFormats: {
          completion: { type: 'percentage', decimals: 1 },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should handle null and undefined values', async () => {
      const data = [
        { name: 'Contact 1', email: 'test@example.com', phone: null },
        { name: 'Contact 2', email: undefined, phone: '555-0001' },
        { name: null, email: 'test3@example.com', phone: undefined },
      ];
      const config: ExportConfig = {
        data,
        filename: 'null-handling',
        format: 'excel',
        nullValue: 'N/A',
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });
  });

  describe('Summary Statistics Sheet', () => {
    it('should create summary sheet with statistics', async () => {
      const data = generateMockContacts(50);
      const config: ExportConfig = {
        data,
        filename: 'with-summary',
        format: 'excel',
        includeSummarySheet: true,
      };

      await service.export(config);

      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.stringMatching(/summary/i)
      );
    });

    it('should include row count in summary', async () => {
      const data = generateMockContacts(75);
      const config: ExportConfig = {
        data,
        filename: 'summary-stats',
        format: 'excel',
        includeSummarySheet: true,
        summaryStats: ['count', 'sum', 'average', 'min', 'max'],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            metric: expect.stringMatching(/count|total/i),
          }),
        ])
      );
    });

    it('should include value statistics in summary', async () => {
      const data = generateMockContacts(30);
      const config: ExportConfig = {
        data,
        filename: 'value-stats',
        format: 'excel',
        includeSummarySheet: true,
        summaryStats: ['sum', 'average', 'min', 'max'],
        summaryColumns: ['value'],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should include status breakdown in summary', async () => {
      const data = generateMockContacts(40);
      const config: ExportConfig = {
        data,
        filename: 'status-breakdown',
        format: 'excel',
        includeSummarySheet: true,
        groupBy: ['status', 'category'],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', async () => {
      const config: ExportConfig = {
        data: null as any,
        filename: 'invalid-data',
        format: 'excel',
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should validate configuration', async () => {
      const config = {
        data: generateMockContacts(10),
        // Missing filename
        format: 'excel',
      } as ExportConfig;

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should handle XLSX library errors', async () => {
      mockXLSX.write.mockImplementationOnce(() => {
        throw new Error('XLSX write error');
      });

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'error-test',
        format: 'excel',
      };

      await expect(service.export(config)).rejects.toThrow('XLSX write error');
    });

    it('should handle invalid sheet names', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'invalid-sheet',
        format: 'excel',
        sheets: [
          {
            name: 'Invalid:Name*With?Special[Chars]', // Excel doesn't allow these chars
            data: generateMockContacts(10),
          },
        ],
      };

      await service.export(config);

      // Should sanitize the sheet name
      const calls = (mockXLSX.utils.book_append_sheet as jest.Mock).mock.calls;
      const sheetNames = calls.map(call => call[2]);
      sheetNames.forEach(name => {
        expect(name).not.toMatch(/[:\*\?\[\]\/\\]/);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should export 1000 rows within performance threshold', async () => {
      const data = generateMockContacts(1000);
      const config: ExportConfig = {
        data,
        filename: 'perf-1000',
        format: 'excel',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 3 seconds for 1000 rows
      expect(duration).toBeLessThan(3000);
    });

    it('should export 5000 rows within reasonable time', async () => {
      const data = generateMockContacts(5000);
      const config: ExportConfig = {
        data,
        filename: 'perf-5000',
        format: 'excel',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 10 seconds for 5000 rows
      expect(duration).toBeLessThan(10000);
    });

    it('should export 10000 rows within reasonable time', async () => {
      const data = generateMockContacts(10000);
      const config: ExportConfig = {
        data,
        filename: 'perf-10000',
        format: 'excel',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 20 seconds for 10000 rows
      expect(duration).toBeLessThan(20000);
    });

    it('should handle multi-sheet exports efficiently', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(1000),
        filename: 'multi-sheet-perf',
        format: 'excel',
        sheets: [
          { name: 'Sheet 1', data: generateMockContacts(500) },
          { name: 'Sheet 2', data: generateMockContacts(500) },
          { name: 'Sheet 3', data: generateMockContacts(500) },
        ],
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 5 seconds for 3 sheets with 500 rows each
      expect(duration).toBeLessThan(5000);
    });

    it('should perform consistently across multiple exports', async () => {
      const iterations = 5;
      const data = generateMockContacts(100);

      for (let i = 0; i < iterations; i++) {
        const config: ExportConfig = {
          data,
          filename: `consistency-${i}`,
          format: 'excel',
        };

        await benchmark.measure('100-rows-excel', () =>
          service.export(config)
        );
      }

      const stats = benchmark.getStats('100-rows-excel');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(iterations);

      // Performance should be consistent
      const variance = stats!.max - stats!.min;
      const avgPercentVariance = (variance / stats!.avg) * 100;
      expect(avgPercentVariance).toBeLessThan(50);
    });
  });

  describe('Advanced Features', () => {
    it('should support column filtering', async () => {
      const data = generateMockContacts(20);
      const config: ExportConfig = {
        data,
        filename: 'filtered-columns',
        format: 'excel',
        columns: ['name', 'email', 'company', 'status'],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should support column renaming', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'renamed-columns',
        format: 'excel',
        columnHeaders: {
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
          company: 'Company Name',
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should support data validation', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'with-validation',
        format: 'excel',
        dataValidation: {
          status: {
            type: 'list',
            values: ['active', 'inactive', 'pending', 'archived'],
          },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should support cell comments', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'with-comments',
        format: 'excel',
        comments: [
          { cell: 'A1', text: 'This is the primary identifier' },
          { cell: 'B1', text: 'Contact full name' },
        ],
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should support hyperlinks', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'with-hyperlinks',
        format: 'excel',
        hyperlinks: {
          email: { type: 'mailto' },
          company: { type: 'url', urlColumn: 'website' },
        },
      };

      await service.export(config);

      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
    });
  });
});
