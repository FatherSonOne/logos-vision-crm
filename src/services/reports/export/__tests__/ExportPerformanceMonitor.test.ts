import { ExportPerformanceMonitor } from '../ExportPerformanceMonitor';
import type { ExportFormat } from '../../../reportService';

describe('ExportPerformanceMonitor', () => {
  let monitor: ExportPerformanceMonitor;

  beforeEach(() => {
    monitor = new ExportPerformanceMonitor();
  });

  afterEach(() => {
    monitor.clearMetrics();
  });

  describe('recordMetric', () => {
    it('should record a successful export metric', () => {
      const metric = monitor.recordMetric('csv', 1000, 150, 50000, true);

      expect(metric).toBeDefined();
      expect(metric.format).toBe('csv');
      expect(metric.rowCount).toBe(1000);
      expect(metric.executionTimeMs).toBe(150);
      expect(metric.fileSizeBytes).toBe(50000);
      expect(metric.success).toBe(true);
      expect(metric.timestamp).toBeDefined();
      expect(metric.id).toBeDefined();
    });

    it('should record a failed export metric', () => {
      const metric = monitor.recordMetric(
        'pdf',
        500,
        2000,
        0,
        false,
        'Network timeout'
      );

      expect(metric.success).toBe(false);
      expect(metric.errorMessage).toBe('Network timeout');
    });

    it('should maintain max metrics limit', () => {
      // Record 150 metrics (max is 100)
      for (let i = 0; i < 150; i++) {
        monitor.recordMetric('csv', 100, 50, 10000, true);
      }

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(100);
    });

    it('should log warning for slow exports', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      monitor.recordMetric('pdf', 1000, 6000, 100000, true);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow export detected')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should log error for failed exports', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      monitor.recordMetric('excel', 500, 1000, 0, false, 'Export failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Export failed')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAverageTime', () => {
    beforeEach(() => {
      monitor.recordMetric('csv', 100, 100, 10000, true);
      monitor.recordMetric('csv', 200, 200, 20000, true);
      monitor.recordMetric('csv', 300, 300, 30000, true);
      monitor.recordMetric('excel', 100, 500, 15000, true);
    });

    it('should calculate average time for specific format', () => {
      const avgTime = monitor.getAverageTime('csv');
      expect(avgTime).toBe(200); // (100 + 200 + 300) / 3
    });

    it('should calculate average time for all formats', () => {
      const avgTime = monitor.getAverageTime();
      expect(avgTime).toBe(275); // (100 + 200 + 300 + 500) / 4
    });

    it('should return 0 when no metrics exist', () => {
      monitor.clearMetrics();
      const avgTime = monitor.getAverageTime('csv');
      expect(avgTime).toBe(0);
    });

    it('should ignore failed exports in average calculation', () => {
      monitor.recordMetric('csv', 100, 10000, 0, false);
      const avgTime = monitor.getAverageTime('csv');
      expect(avgTime).toBe(200); // Still (100 + 200 + 300) / 3
    });
  });

  describe('estimateTime', () => {
    it('should provide high confidence estimate with similar metrics', () => {
      // Record metrics with similar row counts
      monitor.recordMetric('csv', 900, 180, 45000, true);
      monitor.recordMetric('csv', 950, 190, 47500, true);
      monitor.recordMetric('csv', 1000, 200, 50000, true);
      monitor.recordMetric('csv', 1050, 210, 52500, true);
      monitor.recordMetric('csv', 1100, 220, 55000, true);

      const estimate = monitor.estimateTime('csv', 1000);

      expect(estimate.confidence).toBe('high');
      expect(estimate.basedOnSamples).toBeGreaterThanOrEqual(3);
      expect(estimate.estimatedTimeMs).toBeGreaterThan(0);
      expect(estimate.range.min).toBeLessThan(estimate.estimatedTimeMs);
      expect(estimate.range.max).toBeGreaterThan(estimate.estimatedTimeMs);
    });

    it('should provide medium confidence estimate with sufficient metrics', () => {
      // Record metrics with varying row counts
      for (let i = 0; i < 10; i++) {
        monitor.recordMetric('excel', 100 * i, 100 * i, 10000 * i, true);
      }

      const estimate = monitor.estimateTime('excel', 500);

      expect(estimate.confidence).toBe('medium');
      expect(estimate.basedOnSamples).toBeGreaterThanOrEqual(5);
    });

    it('should provide low confidence estimate with no metrics', () => {
      const estimate = monitor.estimateTime('pdf', 1000);

      expect(estimate.confidence).toBe('low');
      expect(estimate.basedOnSamples).toBe(0);
      expect(estimate.estimatedTimeMs).toBeGreaterThan(0);
    });

    it('should use theoretical characteristics for low confidence', () => {
      const csvEstimate = monitor.estimateTime('csv', 1000);
      const pdfEstimate = monitor.estimateTime('pdf', 1000);

      // PDF should take longer than CSV for same row count
      expect(pdfEstimate.estimatedTimeMs).toBeGreaterThan(csvEstimate.estimatedTimeMs);
    });
  });

  describe('getRecommendations', () => {
    it('should warn about large datasets for PDF format', () => {
      const recommendations = monitor.getRecommendations('pdf', 10000);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(
        recommendations.some(r => r.type === 'warning' && r.message.includes('exceeds'))
      ).toBe(true);
    });

    it('should recommend faster formats for large datasets', () => {
      const recommendations = monitor.getRecommendations('pdf', 15000);

      const optimization = recommendations.find(r => r.type === 'optimization');
      expect(optimization).toBeDefined();
      expect(optimization?.suggestedFormat).toBe('json');
    });

    it('should provide info about file size optimization', () => {
      const recommendations = monitor.getRecommendations('json', 2000);

      const info = recommendations.find(
        r => r.type === 'info' && r.message.includes('file size')
      );
      expect(info).toBeDefined();
    });

    it('should approve small datasets for visual formats', () => {
      const recommendations = monitor.getRecommendations('pdf', 50);

      const info = recommendations.find(
        r => r.type === 'info' && r.message.includes('ideal')
      );
      expect(info).toBeDefined();
    });

    it('should warn about slow recent exports', () => {
      // Record multiple slow exports
      for (let i = 0; i < 5; i++) {
        monitor.recordMetric('excel', 1000, 6000, 100000, true);
      }

      const recommendations = monitor.getRecommendations('excel', 1000);

      const warning = recommendations.find(
        r => r.type === 'warning' && r.message.includes('slow')
      );
      expect(warning).toBeDefined();
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      monitor.recordMetric('csv', 100, 100, 10000, true);
      monitor.recordMetric('csv', 200, 200, 20000, true);
      monitor.recordMetric('csv', 300, 400, 30000, false, 'Error');
      monitor.recordMetric('excel', 100, 500, 15000, true);
      monitor.recordMetric('excel', 200, 600, 25000, true);
    });

    it('should return stats for all formats', () => {
      const stats = monitor.getStats();

      expect(stats.length).toBe(5); // csv, excel, pdf, png, json
      const csvStats = stats.find(s => s.format === 'csv');
      expect(csvStats).toBeDefined();
    });

    it('should return stats for specific format', () => {
      const stats = monitor.getStats('csv');

      expect(stats.length).toBe(1);
      expect(stats[0].format).toBe('csv');
    });

    it('should calculate correct statistics', () => {
      const stats = monitor.getStats('csv');
      const csvStats = stats[0];

      expect(csvStats.totalExports).toBe(3);
      expect(csvStats.successfulExports).toBe(2);
      expect(csvStats.failedExports).toBe(1);
      expect(csvStats.averageTimeMs).toBe(150); // (100 + 200) / 2
      expect(csvStats.successRate).toBe(67); // 2/3 * 100 rounded
    });

    it('should handle formats with no metrics', () => {
      const stats = monitor.getStats('pdf');
      const pdfStats = stats[0];

      expect(pdfStats.totalExports).toBe(0);
      expect(pdfStats.averageTimeMs).toBe(0);
      expect(pdfStats.successRate).toBe(0);
    });

    it('should calculate file size statistics', () => {
      const stats = monitor.getStats('csv');
      const csvStats = stats[0];

      expect(csvStats.averageFileSizeBytes).toBe(15000); // (10000 + 20000) / 2
      expect(csvStats.totalFileSizeBytes).toBe(30000); // 10000 + 20000
    });
  });

  describe('getSummary', () => {
    beforeEach(() => {
      monitor.recordMetric('csv', 100, 100, 10000, true);
      monitor.recordMetric('csv', 200, 200, 20000, true);
      monitor.recordMetric('excel', 100, 6000, 15000, true); // Slow
      monitor.recordMetric('pdf', 50, 300, 8000, false, 'Error');
    });

    it('should provide overall summary', () => {
      const summary = monitor.getSummary();

      expect(summary.totalExports).toBe(4);
      expect(summary.successfulExports).toBe(3);
      expect(summary.failedExports).toBe(1);
      expect(summary.slowExports).toBe(1);
      expect(summary.totalDataExported).toBe(400); // 100 + 200 + 100
    });

    it('should identify most used format', () => {
      const summary = monitor.getSummary();

      expect(summary.mostUsedFormat).toBe('csv');
    });

    it('should identify fastest format', () => {
      // Need at least 3 samples for a format to be considered
      monitor.recordMetric('csv', 100, 100, 10000, true);

      const summary = monitor.getSummary();

      expect(summary.fastestFormat).toBe('csv');
    });
  });

  describe('compareFormats', () => {
    it('should compare all formats for given row count', () => {
      const comparison = monitor.compareFormats(1000);

      expect(comparison.length).toBe(5);
      expect(comparison[0].format).toBeDefined();
      expect(comparison[0].estimate).toBeDefined();
      expect(comparison[0].recommendation).toBeDefined();
    });

    it('should sort formats by estimated time', () => {
      const comparison = monitor.compareFormats(1000);

      for (let i = 1; i < comparison.length; i++) {
        expect(comparison[i].estimate.estimatedTimeMs).toBeGreaterThanOrEqual(
          comparison[i - 1].estimate.estimatedTimeMs
        );
      }
    });

    it('should provide different recommendations based on dataset size', () => {
      const smallDataset = monitor.compareFormats(50);
      const largeDataset = monitor.compareFormats(10000);

      const smallPdf = smallDataset.find(c => c.format === 'pdf');
      const largePdf = largeDataset.find(c => c.format === 'pdf');

      expect(smallPdf?.recommendation).not.toBe(largePdf?.recommendation);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      monitor.recordMetric('csv', 100, 100, 10000, true);
      monitor.recordMetric('excel', 200, 200, 20000, true);

      expect(monitor.getMetrics().length).toBe(2);

      monitor.clearMetrics();

      expect(monitor.getMetrics().length).toBe(0);
    });
  });

  describe('clearOldMetrics', () => {
    it('should remove metrics older than specified days', () => {
      // Record a metric (will have current timestamp)
      monitor.recordMetric('csv', 100, 100, 10000, true);

      // Mock an old metric by directly accessing metrics
      const oldMetric = {
        id: 'old_1',
        format: 'excel' as ExportFormat,
        rowCount: 200,
        executionTimeMs: 200,
        fileSizeBytes: 20000,
        success: true,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      };

      // Access private metrics array through type assertion for testing
      (monitor as any).metrics.push(oldMetric);

      expect(monitor.getMetrics().length).toBe(2);

      const removed = monitor.clearOldMetrics(7);

      expect(removed).toBe(1);
      expect(monitor.getMetrics().length).toBe(1);
      expect(monitor.getMetrics()[0].format).toBe('csv');
    });

    it('should return 0 when no old metrics exist', () => {
      monitor.recordMetric('csv', 100, 100, 10000, true);

      const removed = monitor.clearOldMetrics(7);

      expect(removed).toBe(0);
      expect(monitor.getMetrics().length).toBe(1);
    });
  });

  describe('getMetrics', () => {
    beforeEach(() => {
      monitor.recordMetric('csv', 100, 100, 10000, true);
      monitor.recordMetric('csv', 200, 200, 20000, true);
      monitor.recordMetric('excel', 100, 300, 15000, true);
      monitor.recordMetric('pdf', 50, 400, 8000, false, 'Error');
    });

    it('should return all metrics', () => {
      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(4);
    });

    it('should filter by format', () => {
      const csvMetrics = monitor.getMetrics({ format: 'csv' });
      expect(csvMetrics.length).toBe(2);
      expect(csvMetrics.every(m => m.format === 'csv')).toBe(true);
    });

    it('should filter by success only', () => {
      const successMetrics = monitor.getMetrics({ successOnly: true });
      expect(successMetrics.length).toBe(3);
      expect(successMetrics.every(m => m.success)).toBe(true);
    });

    it('should limit results', () => {
      const limitedMetrics = monitor.getMetrics({ limit: 2 });
      expect(limitedMetrics.length).toBe(2);
    });

    it('should combine filters', () => {
      const filteredMetrics = monitor.getMetrics({
        format: 'csv',
        successOnly: true,
        limit: 1,
      });

      expect(filteredMetrics.length).toBe(1);
      expect(filteredMetrics[0].format).toBe('csv');
      expect(filteredMetrics[0].success).toBe(true);
    });
  });
});
