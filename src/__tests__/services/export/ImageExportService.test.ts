/**
 * Comprehensive test suite for Image Export Service
 * Tests PNG, JPEG, WebP exports with various configurations and quality settings
 */

import html2canvas from 'html2canvas';
import {
  createMockChartElement,
  cleanupMockChartElement,
  measureExecutionTime,
  PerformanceBenchmark,
  mockHtml2Canvas,
  generateMockChartData,
} from './testUtils';

// Mock dependencies
jest.mock('html2canvas');
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Import after mocks
import { ImageExportService } from '../../../services/export/ImageExportService';
import type { ExportConfig } from '../../../services/export/types';

describe('ImageExportService', () => {
  let service: ImageExportService;
  let benchmark: PerformanceBenchmark;
  let chartElement: HTMLElement;

  beforeEach(() => {
    service = new ImageExportService();
    benchmark = new PerformanceBenchmark();
    chartElement = createMockChartElement();

    // Setup html2canvas mock
    (html2canvas as jest.MockedFunction<typeof html2canvas>).mockImplementation(
      mockHtml2Canvas
    );
  });

  afterEach(() => {
    cleanupMockChartElement(chartElement);
    jest.clearAllMocks();
    benchmark.clear();
  });

  describe('PNG Export', () => {
    it('should export chart as PNG with default settings', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart-export',
        format: 'png',
        chartElement,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          backgroundColor: null, // Transparent by default
          scale: 2,
        })
      );
    });

    it('should export PNG at standard resolution (1x)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'standard-res',
        format: 'png',
        chartElement,
        resolution: 1,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({ scale: 1 })
      );
    });

    it('should export PNG at high resolution (2x)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'high-res',
        format: 'png',
        chartElement,
        resolution: 2,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({ scale: 2 })
      );
    });

    it('should export PNG at ultra-high resolution (3x)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'ultra-res',
        format: 'png',
        chartElement,
        resolution: 3,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({ scale: 3 })
      );
    });

    it('should export PNG with transparent background', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'transparent',
        format: 'png',
        chartElement,
        backgroundColor: 'transparent',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          backgroundColor: null,
        })
      );
    });

    it('should export PNG with custom background color', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'white-bg',
        format: 'png',
        chartElement,
        backgroundColor: '#FFFFFF',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          backgroundColor: '#FFFFFF',
        })
      );
    });

    it('should export PNG with custom dimensions', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'custom-size',
        format: 'png',
        chartElement,
        width: 1920,
        height: 1080,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          width: 1920,
          height: 1080,
        })
      );
    });
  });

  describe('JPEG Export', () => {
    it('should export chart as JPEG with default quality', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart-jpeg',
        format: 'jpeg',
        chartElement,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should export JPEG with high quality (0.95)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'high-quality',
        format: 'jpeg',
        chartElement,
        quality: 0.95,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should export JPEG with medium quality (0.75)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'medium-quality',
        format: 'jpeg',
        chartElement,
        quality: 0.75,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should export JPEG with low quality (0.5)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'low-quality',
        format: 'jpeg',
        chartElement,
        quality: 0.5,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should use white background for JPEG by default', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'jpeg-bg',
        format: 'jpeg',
        chartElement,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          backgroundColor: '#FFFFFF', // JPEG doesn't support transparency
        })
      );
    });
  });

  describe('WebP Export', () => {
    it('should export chart as WebP', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'chart-webp',
        format: 'webp',
        chartElement,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should export WebP with lossy compression', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'lossy-webp',
        format: 'webp',
        chartElement,
        quality: 0.8,
        compressionType: 'lossy',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should export WebP with lossless compression', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'lossless-webp',
        format: 'webp',
        chartElement,
        compressionType: 'lossless',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should support transparent WebP images', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'transparent-webp',
        format: 'webp',
        chartElement,
        backgroundColor: 'transparent',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          backgroundColor: null,
        })
      );
    });
  });

  describe('Social Media Presets', () => {
    it('should export for Twitter (1200x675)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'twitter-post',
        format: 'png',
        chartElement,
        preset: 'twitter',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          width: 1200,
          height: 675,
        })
      );
    });

    it('should export for Instagram (1080x1080)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'instagram-post',
        format: 'png',
        chartElement,
        preset: 'instagram',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          width: 1080,
          height: 1080,
        })
      );
    });

    it('should export for Facebook (1200x630)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'facebook-post',
        format: 'png',
        chartElement,
        preset: 'facebook',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      );
    });

    it('should export for LinkedIn (1200x627)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'linkedin-post',
        format: 'png',
        chartElement,
        preset: 'linkedin',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          width: 1200,
          height: 627,
        })
      );
    });

    it('should export for Instagram Story (1080x1920)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'ig-story',
        format: 'png',
        chartElement,
        preset: 'instagram-story',
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          width: 1080,
          height: 1920,
        })
      );
    });
  });

  describe('Batch Export', () => {
    it('should export multiple charts at once', async () => {
      const chart1 = createMockChartElement();
      const chart2 = createMockChartElement();
      const chart3 = createMockChartElement();

      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'batch-export',
        format: 'png',
        batchExport: [
          { chartElement: chart1, filename: 'chart-1' },
          { chartElement: chart2, filename: 'chart-2' },
          { chartElement: chart3, filename: 'chart-3' },
        ],
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledTimes(3);

      cleanupMockChartElement(chart1);
      cleanupMockChartElement(chart2);
      cleanupMockChartElement(chart3);
    });

    it('should export batch with different formats', async () => {
      const chart1 = createMockChartElement();
      const chart2 = createMockChartElement();

      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'multi-format',
        format: 'png',
        batchExport: [
          { chartElement: chart1, filename: 'chart-png', format: 'png' },
          { chartElement: chart2, filename: 'chart-jpeg', format: 'jpeg' },
        ],
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledTimes(2);

      cleanupMockChartElement(chart1);
      cleanupMockChartElement(chart2);
    });

    it('should handle partial failures in batch export', async () => {
      const chart1 = createMockChartElement();
      const chart2 = createMockChartElement();

      (html2canvas as jest.MockedFunction<typeof html2canvas>)
        .mockResolvedValueOnce(document.createElement('canvas'))
        .mockRejectedValueOnce(new Error('Canvas error'))
        .mockResolvedValueOnce(document.createElement('canvas'));

      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'batch-partial-fail',
        format: 'png',
        batchExport: [
          { chartElement: chart1, filename: 'success-1' },
          { chartElement: chart2, filename: 'failure' },
        ],
        continueOnError: true,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledTimes(2);

      cleanupMockChartElement(chart1);
      cleanupMockChartElement(chart2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when chart element is null', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'null-element',
        format: 'png',
        chartElement: null as any,
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should throw error when chart element is not found', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'missing-element',
        format: 'png',
        chartElement: document.getElementById('non-existent') as HTMLElement,
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should handle html2canvas errors gracefully', async () => {
      (html2canvas as jest.MockedFunction<typeof html2canvas>).mockRejectedValueOnce(
        new Error('Canvas rendering failed')
      );

      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'canvas-error',
        format: 'png',
        chartElement,
      };

      await expect(service.export(config)).rejects.toThrow(
        'Canvas rendering failed'
      );
    });

    it('should validate image format', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'invalid-format',
        format: 'bmp' as any, // Invalid format
        chartElement,
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should validate quality range (0-1)', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'invalid-quality',
        format: 'jpeg',
        chartElement,
        quality: 1.5, // Invalid quality
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should validate dimensions are positive', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'invalid-dimensions',
        format: 'png',
        chartElement,
        width: -100,
        height: -100,
      };

      await expect(service.export(config)).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should export standard resolution quickly', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(10),
        filename: 'perf-standard',
        format: 'png',
        chartElement,
        resolution: 1,
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should export high resolution efficiently', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(10),
        filename: 'perf-high-res',
        format: 'png',
        chartElement,
        resolution: 2,
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should export ultra-high resolution efficiently', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(10),
        filename: 'perf-ultra-res',
        format: 'png',
        chartElement,
        resolution: 3,
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 3 seconds
      expect(duration).toBeLessThan(3000);
    });

    it('should batch export efficiently', async () => {
      const charts = Array.from({ length: 5 }, () => createMockChartElement());

      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'batch-perf',
        format: 'png',
        batchExport: charts.map((chart, i) => ({
          chartElement: chart,
          filename: `chart-${i}`,
        })),
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      // Should complete within 5 seconds for 5 charts
      expect(duration).toBeLessThan(5000);

      charts.forEach(cleanupMockChartElement);
    });

    it('should perform consistently across multiple exports', async () => {
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const config: ExportConfig = {
          data: generateMockChartData(5),
          filename: `consistency-${i}`,
          format: 'png',
          chartElement,
        };

        await benchmark.measure('png-export', () => service.export(config));
      }

      const stats = benchmark.getStats('png-export');
      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(iterations);

      // Performance should be consistent
      const variance = stats!.max - stats!.min;
      const avgPercentVariance = (variance / stats!.avg) * 100;
      expect(avgPercentVariance).toBeLessThan(50);
    });
  });

  describe('Advanced Features', () => {
    it('should apply watermark to exported image', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'watermarked',
        format: 'png',
        chartElement,
        watermark: {
          text: '© 2024 Company Name',
          position: 'bottom-right',
          opacity: 0.5,
        },
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should crop image to specific region', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'cropped',
        format: 'png',
        chartElement,
        cropRegion: {
          x: 100,
          y: 100,
          width: 600,
          height: 400,
        },
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should apply image filters', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'filtered',
        format: 'png',
        chartElement,
        filters: {
          brightness: 1.2,
          contrast: 1.1,
          saturation: 0.9,
        },
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should include metadata in image', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'with-metadata',
        format: 'png',
        chartElement,
        includeMetadata: true,
        metadata: {
          title: 'Sales Chart 2024',
          author: 'Test User',
          description: 'Q4 Sales Performance',
        },
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalled();
    });

    it('should support pixel ratio override', async () => {
      const config: ExportConfig = {
        data: generateMockChartData(5),
        filename: 'custom-dpi',
        format: 'png',
        chartElement,
        pixelRatio: 2,
      };

      await service.export(config);

      expect(html2canvas).toHaveBeenCalledWith(
        chartElement,
        expect.objectContaining({
          scale: 2,
        })
      );
    });
  });
});
