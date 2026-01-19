/**
 * Comprehensive test suite for Export Router
 * Tests strategy selection, routing logic, service registration, and validation
 */

import {
  generateMockContacts,
  generateMockChartData,
  createMockChartElement,
  cleanupMockChartElement,
} from './testUtils';

// Mock all export services
jest.mock('../../../services/export/PdfExportService');
jest.mock('../../../services/export/ExcelExportService');
jest.mock('../../../services/export/ImageExportService');
jest.mock('../../../services/export/CsvExportService');

// Import after mocks
import { ExportRouter } from '../../../services/export/ExportRouter';
import { PdfExportService } from '../../../services/export/PdfExportService';
import { ExcelExportService } from '../../../services/export/ExcelExportService';
import { ImageExportService } from '../../../services/export/ImageExportService';
import { CsvExportService } from '../../../services/export/CsvExportService';
import type { ExportConfig, ExportStrategy } from '../../../services/export/types';

describe('ExportRouter', () => {
  let router: ExportRouter;
  let mockPdfService: jest.Mocked<PdfExportService>;
  let mockExcelService: jest.Mocked<ExcelExportService>;
  let mockImageService: jest.Mocked<ImageExportService>;
  let mockCsvService: jest.Mocked<CsvExportService>;

  beforeEach(() => {
    // Create mock service instances
    mockPdfService = {
      export: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockExcelService = {
      export: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockImageService = {
      export: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockCsvService = {
      export: jest.fn().mockResolvedValue('mock,csv,data'),
    } as any;

    // Setup mocked constructors
    (PdfExportService as jest.MockedClass<typeof PdfExportService>).mockImplementation(
      () => mockPdfService
    );
    (ExcelExportService as jest.MockedClass<typeof ExcelExportService>).mockImplementation(
      () => mockExcelService
    );
    (ImageExportService as jest.MockedClass<typeof ImageExportService>).mockImplementation(
      () => mockImageService
    );
    (CsvExportService as jest.MockedClass<typeof CsvExportService>).mockImplementation(
      () => mockCsvService
    );

    router = new ExportRouter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Registration', () => {
    it('should register all default export services', () => {
      expect(PdfExportService).toHaveBeenCalled();
      expect(ExcelExportService).toHaveBeenCalled();
      expect(ImageExportService).toHaveBeenCalled();
      expect(CsvExportService).toHaveBeenCalled();
    });

    it('should allow registering custom export service', () => {
      const customService = {
        export: jest.fn().mockResolvedValue(undefined),
      };

      router.registerService('custom' as any, customService as any);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'custom-export',
        format: 'custom' as any,
      };

      router.export(config);

      expect(customService.export).toHaveBeenCalledWith(config);
    });

    it('should override existing service when re-registering', () => {
      const newPdfService = {
        export: jest.fn().mockResolvedValue(undefined),
      };

      router.registerService('pdf', newPdfService as any);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'pdf-export',
        format: 'pdf',
      };

      router.export(config);

      expect(newPdfService.export).toHaveBeenCalled();
      expect(mockPdfService.export).not.toHaveBeenCalled();
    });

    it('should unregister service', () => {
      router.unregisterService('pdf');

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'pdf-export',
        format: 'pdf',
      };

      expect(() => router.export(config)).toThrow();
    });

    it('should list registered services', () => {
      const services = router.getRegisteredServices();

      expect(services).toContain('pdf');
      expect(services).toContain('excel');
      expect(services).toContain('csv');
      expect(services).toContain('png');
      expect(services).toContain('jpeg');
      expect(services).toContain('webp');
    });
  });

  describe('Format-Based Routing', () => {
    it('should route to PDF service for PDF format', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'report',
        format: 'pdf',
      };

      await router.export(config);

      expect(mockPdfService.export).toHaveBeenCalledWith(config);
    });

    it('should route to Excel service for Excel format', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'report',
        format: 'excel',
      };

      await router.export(config);

      expect(mockExcelService.export).toHaveBeenCalledWith(config);
    });

    it('should route to CSV service for CSV format', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'report',
        format: 'csv',
      };

      await router.export(config);

      expect(mockCsvService.export).toHaveBeenCalledWith(config);
    });

    it('should route to Image service for PNG format', async () => {
      const chartElement = createMockChartElement();
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart',
        format: 'png',
        chartElement,
      };

      await router.export(config);

      expect(mockImageService.export).toHaveBeenCalledWith(config);
      cleanupMockChartElement(chartElement);
    });

    it('should route to Image service for JPEG format', async () => {
      const chartElement = createMockChartElement();
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart',
        format: 'jpeg',
        chartElement,
      };

      await router.export(config);

      expect(mockImageService.export).toHaveBeenCalledWith(config);
      cleanupMockChartElement(chartElement);
    });

    it('should route to Image service for WebP format', async () => {
      const chartElement = createMockChartElement();
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart',
        format: 'webp',
        chartElement,
      };

      await router.export(config);

      expect(mockImageService.export).toHaveBeenCalledWith(config);
      cleanupMockChartElement(chartElement);
    });
  });

  describe('Automatic Format Selection', () => {
    it('should select CSV for small datasets (<1000 rows)', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(500),
        filename: 'small-dataset',
        format: 'auto' as any,
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('csv');
    });

    it('should select Excel for medium datasets (1000-10000 rows)', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(5000),
        filename: 'medium-dataset',
        format: 'auto' as any,
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('excel');
    });

    it('should select CSV for large datasets (>10000 rows)', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(15000),
        filename: 'large-dataset',
        format: 'auto' as any,
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('csv');
    });

    it('should select PNG for chart exports', async () => {
      const chartElement = createMockChartElement();
      const config: ExportConfig = {
        data: generateMockChartData(10),
        filename: 'chart-auto',
        format: 'auto' as any,
        chartElement,
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('png');
      cleanupMockChartElement(chartElement);
    });

    it('should select PDF for reports with charts and data', async () => {
      const chartElement = createMockChartElement();
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'full-report',
        format: 'auto' as any,
        chartElement,
        includeReport: true,
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('pdf');
      cleanupMockChartElement(chartElement);
    });
  });

  describe('Complexity-Based Routing', () => {
    it('should use CSV for simple tabular data', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'simple-data',
        format: 'auto' as any,
        complexity: 'simple',
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('csv');
    });

    it('should use Excel for moderate complexity with formatting', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'formatted-data',
        format: 'auto' as any,
        complexity: 'moderate',
        includeFormulas: true,
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('excel');
    });

    it('should use PDF for complex reports with multiple sections', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(100),
        filename: 'complex-report',
        format: 'auto' as any,
        complexity: 'complex',
        sections: [
          { title: 'Overview', data: generateMockContacts(20) },
          { title: 'Details', data: generateMockContacts(50) },
          { title: 'Summary', data: generateMockContacts(30) },
        ],
      };

      const selectedFormat = await router.selectOptimalFormat(config);

      expect(selectedFormat).toBe('pdf');
    });
  });

  describe('Validation', () => {
    it('should validate required fields are present', async () => {
      const config = {
        data: generateMockContacts(10),
        // Missing filename and format
      } as ExportConfig;

      await expect(router.export(config)).rejects.toThrow();
    });

    it('should validate data is not empty for required formats', async () => {
      const config: ExportConfig = {
        data: [],
        filename: 'empty',
        format: 'excel',
        requireData: true,
      };

      await expect(router.export(config)).rejects.toThrow();
    });

    it('should validate chart element exists for image formats', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart',
        format: 'png',
        chartElement: null as any,
      };

      await expect(router.export(config)).rejects.toThrow();
    });

    it('should validate format is supported', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'unsupported',
        format: 'xyz' as any, // Unsupported format
      };

      await expect(router.export(config)).rejects.toThrow();
    });

    it('should validate filename is valid', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'invalid/filename:with*special?chars', // Invalid characters
        format: 'csv',
      };

      await expect(router.export(config)).rejects.toThrow();
    });

    it('should sanitize filename automatically when specified', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'invalid/filename:with*special?chars',
        format: 'csv',
        sanitizeFilename: true,
      };

      await router.export(config);

      expect(mockCsvService.export).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: expect.stringMatching(/^[a-zA-Z0-9_-]+$/),
        })
      );
    });
  });

  describe('Strategy Pattern', () => {
    it('should support custom export strategy', async () => {
      const customStrategy: ExportStrategy = {
        canHandle: (config) => config.format === 'custom' as any,
        execute: jest.fn().mockResolvedValue(undefined),
        priority: 100,
      };

      router.registerStrategy(customStrategy);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'custom',
        format: 'custom' as any,
      };

      await router.export(config);

      expect(customStrategy.execute).toHaveBeenCalledWith(config);
    });

    it('should prioritize strategies by priority value', async () => {
      const lowPriorityStrategy: ExportStrategy = {
        canHandle: (config) => config.format === 'pdf',
        execute: jest.fn().mockResolvedValue(undefined),
        priority: 1,
      };

      const highPriorityStrategy: ExportStrategy = {
        canHandle: (config) => config.format === 'pdf',
        execute: jest.fn().mockResolvedValue(undefined),
        priority: 100,
      };

      router.registerStrategy(lowPriorityStrategy);
      router.registerStrategy(highPriorityStrategy);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'priority-test',
        format: 'pdf',
      };

      await router.export(config);

      expect(highPriorityStrategy.execute).toHaveBeenCalled();
      expect(lowPriorityStrategy.execute).not.toHaveBeenCalled();
    });

    it('should fallback to next strategy if primary fails', async () => {
      const primaryStrategy: ExportStrategy = {
        canHandle: (config) => config.format === 'pdf',
        execute: jest.fn().mockRejectedValue(new Error('Primary failed')),
        priority: 100,
      };

      const fallbackStrategy: ExportStrategy = {
        canHandle: (config) => config.format === 'pdf',
        execute: jest.fn().mockResolvedValue(undefined),
        priority: 50,
      };

      router.registerStrategy(primaryStrategy);
      router.registerStrategy(fallbackStrategy);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'fallback-test',
        format: 'pdf',
        useFallback: true,
      };

      await router.export(config);

      expect(primaryStrategy.execute).toHaveBeenCalled();
      expect(fallbackStrategy.execute).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('should cache service instances', async () => {
      const config1: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'export1',
        format: 'csv',
      };

      const config2: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'export2',
        format: 'csv',
      };

      await router.export(config1);
      await router.export(config2);

      // Should use same service instance
      expect(CsvExportService).toHaveBeenCalledTimes(1);
    });

    it('should parallelize multi-format exports', async () => {
      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'multi-format',
        formats: ['csv', 'excel', 'pdf'],
      };

      const startTime = Date.now();
      await router.exportMultiple(config);
      const duration = Date.now() - startTime;

      expect(mockCsvService.export).toHaveBeenCalled();
      expect(mockExcelService.export).toHaveBeenCalled();
      expect(mockPdfService.export).toHaveBeenCalled();

      // Parallel execution should be faster than sequential
      // (This is a basic test - actual performance will vary)
      expect(duration).toBeLessThan(3000);
    });

    it('should batch similar exports efficiently', async () => {
      const configs = Array.from({ length: 10 }, (_, i) => ({
        data: generateMockContacts(10),
        filename: `batch-${i}`,
        format: 'csv' as const,
      }));

      await router.exportBatch(configs);

      expect(mockCsvService.export).toHaveBeenCalledTimes(10);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors', async () => {
      mockCsvService.export.mockRejectedValueOnce(new Error('Export failed'));

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'error-test',
        format: 'csv',
      };

      await expect(router.export(config)).rejects.toThrow('Export failed');
    });

    it('should handle missing service gracefully', async () => {
      router.unregisterService('csv');

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'missing-service',
        format: 'csv',
      };

      await expect(router.export(config)).rejects.toThrow(/service.*not.*registered/i);
    });

    it('should collect errors in batch export', async () => {
      mockCsvService.export
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('Failed export'))
        .mockResolvedValueOnce('success');

      const configs = [
        { data: generateMockContacts(10), filename: 'export1', format: 'csv' as const },
        { data: generateMockContacts(10), filename: 'export2', format: 'csv' as const },
        { data: generateMockContacts(10), filename: 'export3', format: 'csv' as const },
      ];

      const results = await router.exportBatch(configs, { continueOnError: true });

      expect(results.successful).toBe(2);
      expect(results.failed).toBe(1);
      expect(results.errors).toHaveLength(1);
    });

    it('should stop batch export on first error when specified', async () => {
      mockCsvService.export
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('Failed export'))
        .mockResolvedValueOnce('success');

      const configs = [
        { data: generateMockContacts(10), filename: 'export1', format: 'csv' as const },
        { data: generateMockContacts(10), filename: 'export2', format: 'csv' as const },
        { data: generateMockContacts(10), filename: 'export3', format: 'csv' as const },
      ];

      await expect(
        router.exportBatch(configs, { continueOnError: false })
      ).rejects.toThrow('Failed export');

      expect(mockCsvService.export).toHaveBeenCalledTimes(2); // Stopped after error
    });
  });

  describe('Configuration Merging', () => {
    it('should merge global config with export config', async () => {
      router.setGlobalConfig({
        includeBOM: true,
        dateFormat: 'YYYY-MM-DD',
      });

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'merged-config',
        format: 'csv',
      };

      await router.export(config);

      expect(mockCsvService.export).toHaveBeenCalledWith(
        expect.objectContaining({
          includeBOM: true,
          dateFormat: 'YYYY-MM-DD',
        })
      );
    });

    it('should allow export config to override global config', async () => {
      router.setGlobalConfig({
        dateFormat: 'YYYY-MM-DD',
      });

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'override-config',
        format: 'csv',
        dateFormat: 'MM/DD/YYYY', // Override
      };

      await router.export(config);

      expect(mockCsvService.export).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFormat: 'MM/DD/YYYY',
        })
      );
    });
  });

  describe('Hooks and Middleware', () => {
    it('should execute pre-export hooks', async () => {
      const preExportHook = jest.fn();
      router.addHook('pre-export', preExportHook);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'with-hook',
        format: 'csv',
      };

      await router.export(config);

      expect(preExportHook).toHaveBeenCalledWith(config);
    });

    it('should execute post-export hooks', async () => {
      const postExportHook = jest.fn();
      router.addHook('post-export', postExportHook);

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'with-hook',
        format: 'csv',
      };

      await router.export(config);

      expect(postExportHook).toHaveBeenCalled();
    });

    it('should allow hooks to modify config', async () => {
      router.addHook('pre-export', (config) => {
        config.filename = config.filename + '-modified';
        return config;
      });

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'original',
        format: 'csv',
      };

      await router.export(config);

      expect(mockCsvService.export).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'original-modified',
        })
      );
    });

    it('should stop export if hook throws error', async () => {
      router.addHook('pre-export', () => {
        throw new Error('Hook validation failed');
      });

      const config: ExportConfig = {
        data: generateMockContacts(10),
        filename: 'hook-error',
        format: 'csv',
      };

      await expect(router.export(config)).rejects.toThrow('Hook validation failed');
      expect(mockCsvService.export).not.toHaveBeenCalled();
    });
  });
});
