import type { ExportFormat } from '../../reportService';

// ============================================
// TYPES
// ============================================

export interface ExportMetric {
  id: string;
  format: ExportFormat;
  rowCount: number;
  executionTimeMs: number;
  fileSizeBytes: number;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface FormatStats {
  format: ExportFormat;
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  averageTimeMs: number;
  medianTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  averageRows: number;
  averageFileSizeBytes: number;
  totalFileSizeBytes: number;
  successRate: number;
}

export interface PerformanceRecommendation {
  type: 'warning' | 'info' | 'optimization';
  message: string;
  suggestedFormat?: ExportFormat;
  estimatedTimeSavingsMs?: number;
  details?: string;
}

export interface TimeEstimate {
  estimatedTimeMs: number;
  confidence: 'high' | 'medium' | 'low';
  basedOnSamples: number;
  range: {
    min: number;
    max: number;
  };
}

// ============================================
// CONSTANTS
// ============================================

const MAX_METRICS_IN_MEMORY = 100;
const SLOW_EXPORT_THRESHOLD_MS = 5000; // 5 seconds
const LARGE_DATASET_THRESHOLD = 10000; // rows
const MEDIUM_DATASET_THRESHOLD = 1000; // rows

// Performance characteristics by format
const FORMAT_CHARACTERISTICS = {
  csv: {
    baseOverheadMs: 50,
    msPerRow: 0.1,
    compressionRatio: 0.7,
    recommendedMaxRows: 50000,
  },
  excel: {
    baseOverheadMs: 200,
    msPerRow: 0.5,
    compressionRatio: 0.5,
    recommendedMaxRows: 10000,
  },
  pdf: {
    baseOverheadMs: 500,
    msPerRow: 2.0,
    compressionRatio: 0.3,
    recommendedMaxRows: 5000,
  },
  png: {
    baseOverheadMs: 300,
    msPerRow: 1.5,
    compressionRatio: 0.2,
    recommendedMaxRows: 5000,
  },
  json: {
    baseOverheadMs: 30,
    msPerRow: 0.08,
    compressionRatio: 1.0,
    recommendedMaxRows: 100000,
  },
};

// ============================================
// EXPORT PERFORMANCE MONITOR CLASS
// ============================================

class ExportPerformanceMonitor {
  private metrics: ExportMetric[] = [];
  private readonly maxMetrics = MAX_METRICS_IN_MEMORY;

  /**
   * Record a new export performance metric
   */
  recordMetric(
    format: ExportFormat,
    rowCount: number,
    executionTimeMs: number,
    fileSizeBytes: number,
    success: boolean = true,
    errorMessage?: string
  ): ExportMetric {
    const metric: ExportMetric = {
      id: this.generateId(),
      format,
      rowCount,
      executionTimeMs,
      fileSizeBytes,
      timestamp: new Date().toISOString(),
      success,
      errorMessage,
    };

    // Add to metrics array
    this.metrics.unshift(metric);

    // Maintain max size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    // Log warnings for slow exports
    if (success && executionTimeMs > SLOW_EXPORT_THRESHOLD_MS) {
      console.warn(
        `[ExportPerformanceMonitor] Slow export detected: ${format} format took ${executionTimeMs}ms for ${rowCount} rows`
      );
    }

    // Log errors
    if (!success) {
      console.error(
        `[ExportPerformanceMonitor] Export failed: ${format} format - ${errorMessage}`
      );
    }

    return metric;
  }

  /**
   * Get average execution time by format
   */
  getAverageTime(format?: ExportFormat): number {
    const filteredMetrics = format
      ? this.metrics.filter(m => m.format === format && m.success)
      : this.metrics.filter(m => m.success);

    if (filteredMetrics.length === 0) return 0;

    const totalTime = filteredMetrics.reduce(
      (sum, metric) => sum + metric.executionTimeMs,
      0
    );

    return Math.round(totalTime / filteredMetrics.length);
  }

  /**
   * Get median execution time by format
   */
  private getMedianTime(format: ExportFormat): number {
    const filteredMetrics = this.metrics
      .filter(m => m.format === format && m.success)
      .map(m => m.executionTimeMs)
      .sort((a, b) => a - b);

    if (filteredMetrics.length === 0) return 0;

    const mid = Math.floor(filteredMetrics.length / 2);
    return filteredMetrics.length % 2 === 0
      ? Math.round((filteredMetrics[mid - 1] + filteredMetrics[mid]) / 2)
      : filteredMetrics[mid];
  }

  /**
   * Estimate time for an export operation
   */
  estimateTime(format: ExportFormat, rowCount: number): TimeEstimate {
    const formatMetrics = this.metrics.filter(
      m => m.format === format && m.success
    );

    // If we have enough historical data, use it
    if (formatMetrics.length >= 5) {
      // Find metrics with similar row counts (within 20% range)
      const similarMetrics = formatMetrics.filter(m => {
        const ratio = m.rowCount / rowCount;
        return ratio >= 0.8 && ratio <= 1.2;
      });

      if (similarMetrics.length >= 3) {
        const times = similarMetrics.map(m => m.executionTimeMs);
        const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        return {
          estimatedTimeMs: Math.round(avgTime),
          confidence: 'high',
          basedOnSamples: similarMetrics.length,
          range: {
            min: Math.round(minTime * 0.9),
            max: Math.round(maxTime * 1.1),
          },
        };
      }

      // Use linear regression on all format metrics
      if (formatMetrics.length >= 5) {
        const avgTimePerRow =
          formatMetrics.reduce((sum, m) => sum + m.executionTimeMs / m.rowCount, 0) /
          formatMetrics.length;
        const baseTime = FORMAT_CHARACTERISTICS[format].baseOverheadMs;
        const estimated = baseTime + avgTimePerRow * rowCount;

        return {
          estimatedTimeMs: Math.round(estimated),
          confidence: 'medium',
          basedOnSamples: formatMetrics.length,
          range: {
            min: Math.round(estimated * 0.7),
            max: Math.round(estimated * 1.5),
          },
        };
      }
    }

    // Fallback to theoretical estimates
    const characteristics = FORMAT_CHARACTERISTICS[format];
    const estimated =
      characteristics.baseOverheadMs + characteristics.msPerRow * rowCount;

    return {
      estimatedTimeMs: Math.round(estimated),
      confidence: 'low',
      basedOnSamples: 0,
      range: {
        min: Math.round(estimated * 0.5),
        max: Math.round(estimated * 2.0),
      },
    };
  }

  /**
   * Get recommendations for optimizing export performance
   */
  getRecommendations(
    format: ExportFormat,
    rowCount: number
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    const characteristics = FORMAT_CHARACTERISTICS[format];

    // Check if dataset is too large for the format
    if (rowCount > characteristics.recommendedMaxRows) {
      const csvEstimate = this.estimateTime('csv', rowCount);
      const currentEstimate = this.estimateTime(format, rowCount);

      recommendations.push({
        type: 'warning',
        message: `Dataset size (${rowCount.toLocaleString()} rows) exceeds recommended maximum for ${format.toUpperCase()} format (${characteristics.recommendedMaxRows.toLocaleString()} rows)`,
        suggestedFormat: 'csv',
        estimatedTimeSavingsMs:
          currentEstimate.estimatedTimeMs - csvEstimate.estimatedTimeMs,
        details: `Consider using CSV format for better performance with large datasets. Estimated time: ${this.formatDuration(csvEstimate.estimatedTimeMs)} vs ${this.formatDuration(currentEstimate.estimatedTimeMs)}`,
      });
    }

    // Recommend faster formats for large datasets
    if (rowCount > LARGE_DATASET_THRESHOLD) {
      if (format === 'pdf' || format === 'png') {
        const jsonEstimate = this.estimateTime('json', rowCount);
        const currentEstimate = this.estimateTime(format, rowCount);

        recommendations.push({
          type: 'optimization',
          message: `For large datasets (${rowCount.toLocaleString()} rows), consider using JSON or CSV format`,
          suggestedFormat: 'json',
          estimatedTimeSavingsMs:
            currentEstimate.estimatedTimeMs - jsonEstimate.estimatedTimeMs,
          details: `${format.toUpperCase()} format is optimized for visual presentation, not large data exports. JSON format would be ${Math.round((currentEstimate.estimatedTimeMs / jsonEstimate.estimatedTimeMs - 1) * 100)}% faster.`,
        });
      }
    }

    // File size optimization
    if (format === 'json' && rowCount > MEDIUM_DATASET_THRESHOLD) {
      recommendations.push({
        type: 'info',
        message: 'Consider using CSV format to reduce file size',
        suggestedFormat: 'csv',
        details: `CSV format typically results in ${Math.round((1 - FORMAT_CHARACTERISTICS.csv.compressionRatio / FORMAT_CHARACTERISTICS.json.compressionRatio) * 100)}% smaller file size compared to JSON`,
      });
    }

    // Visual format recommendations
    if ((format === 'pdf' || format === 'png') && rowCount < 100) {
      recommendations.push({
        type: 'info',
        message: 'Visual formats (PDF/PNG) are ideal for small datasets and presentations',
        details: 'Your dataset size is well-suited for visual export formats',
      });
    }

    // Excel format recommendations
    if (format === 'excel') {
      if (rowCount > 5000) {
        recommendations.push({
          type: 'optimization',
          message: 'Excel export may be slow for datasets over 5,000 rows',
          suggestedFormat: 'csv',
          details: 'Consider CSV format for faster exports of large datasets. CSV files can still be opened in Excel.',
        });
      } else {
        recommendations.push({
          type: 'info',
          message: 'Excel format provides rich formatting and multi-sheet support',
          details: 'Good choice for datasets under 10,000 rows that need formatting',
        });
      }
    }

    // Performance based on historical data
    const recentMetrics = this.metrics
      .filter(m => m.format === format && m.success)
      .slice(0, 10);

    if (recentMetrics.length >= 5) {
      const avgTime =
        recentMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0) /
        recentMetrics.length;

      if (avgTime > SLOW_EXPORT_THRESHOLD_MS) {
        recommendations.push({
          type: 'warning',
          message: `Recent ${format.toUpperCase()} exports have been slow (avg ${this.formatDuration(avgTime)})`,
          details: 'Consider reducing the dataset size using filters or switching to a faster format',
        });
      }
    }

    return recommendations;
  }

  /**
   * Get comprehensive statistics by format
   */
  getStats(format?: ExportFormat): FormatStats[] {
    const formats: ExportFormat[] = format
      ? [format]
      : ['csv', 'excel', 'pdf', 'png', 'json'];

    return formats.map(fmt => {
      const formatMetrics = this.metrics.filter(m => m.format === fmt);
      const successfulMetrics = formatMetrics.filter(m => m.success);
      const failedMetrics = formatMetrics.filter(m => !m.success);

      if (formatMetrics.length === 0) {
        return {
          format: fmt,
          totalExports: 0,
          successfulExports: 0,
          failedExports: 0,
          averageTimeMs: 0,
          medianTimeMs: 0,
          minTimeMs: 0,
          maxTimeMs: 0,
          averageRows: 0,
          averageFileSizeBytes: 0,
          totalFileSizeBytes: 0,
          successRate: 0,
        };
      }

      const times = successfulMetrics.map(m => m.executionTimeMs);
      const avgTime =
        times.length > 0
          ? Math.round(times.reduce((sum, t) => sum + t, 0) / times.length)
          : 0;

      return {
        format: fmt,
        totalExports: formatMetrics.length,
        successfulExports: successfulMetrics.length,
        failedExports: failedMetrics.length,
        averageTimeMs: avgTime,
        medianTimeMs: this.getMedianTime(fmt),
        minTimeMs: times.length > 0 ? Math.min(...times) : 0,
        maxTimeMs: times.length > 0 ? Math.max(...times) : 0,
        averageRows: Math.round(
          successfulMetrics.reduce((sum, m) => sum + m.rowCount, 0) /
            (successfulMetrics.length || 1)
        ),
        averageFileSizeBytes: Math.round(
          successfulMetrics.reduce((sum, m) => sum + m.fileSizeBytes, 0) /
            (successfulMetrics.length || 1)
        ),
        totalFileSizeBytes: successfulMetrics.reduce(
          (sum, m) => sum + m.fileSizeBytes,
          0
        ),
        successRate: Math.round(
          (successfulMetrics.length / formatMetrics.length) * 100
        ),
      };
    });
  }

  /**
   * Get all metrics (optionally filtered)
   */
  getMetrics(options?: {
    format?: ExportFormat;
    successOnly?: boolean;
    limit?: number;
  }): ExportMetric[] {
    let filtered = this.metrics;

    if (options?.format) {
      filtered = filtered.filter(m => m.format === options.format);
    }

    if (options?.successOnly) {
      filtered = filtered.filter(m => m.success);
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Get recent performance summary
   */
  getSummary(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    averageTimeMs: number;
    slowExports: number;
    totalDataExported: number;
    mostUsedFormat: ExportFormat | null;
    fastestFormat: ExportFormat | null;
  } {
    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);
    const slow = successful.filter(
      m => m.executionTimeMs > SLOW_EXPORT_THRESHOLD_MS
    );

    // Find most used format
    const formatCounts = this.metrics.reduce(
      (acc, m) => {
        acc[m.format] = (acc[m.format] || 0) + 1;
        return acc;
      },
      {} as Record<ExportFormat, number>
    );

    const mostUsedFormat =
      Object.keys(formatCounts).length > 0
        ? (Object.entries(formatCounts).sort(
            ([, a], [, b]) => b - a
          )[0][0] as ExportFormat)
        : null;

    // Find fastest format (by average time)
    const stats = this.getStats();
    const fastestFormat =
      stats.length > 0
        ? stats
            .filter(s => s.totalExports >= 3)
            .sort((a, b) => a.averageTimeMs - b.averageTimeMs)[0]?.format || null
        : null;

    return {
      totalExports: this.metrics.length,
      successfulExports: successful.length,
      failedExports: failed.length,
      averageTimeMs:
        successful.length > 0
          ? Math.round(
              successful.reduce((sum, m) => sum + m.executionTimeMs, 0) /
                successful.length
            )
          : 0,
      slowExports: slow.length,
      totalDataExported: successful.reduce((sum, m) => sum + m.rowCount, 0),
      mostUsedFormat,
      fastestFormat,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    console.info('[ExportPerformanceMonitor] All metrics cleared');
  }

  /**
   * Clear metrics older than specified days
   */
  clearOldMetrics(daysOld: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTime = cutoffDate.getTime();

    const initialLength = this.metrics.length;
    this.metrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() >= cutoffTime
    );

    const removed = initialLength - this.metrics.length;
    if (removed > 0) {
      console.info(
        `[ExportPerformanceMonitor] Removed ${removed} metrics older than ${daysOld} days`
      );
    }

    return removed;
  }

  /**
   * Get performance comparison between formats
   */
  compareFormats(
    rowCount: number
  ): Array<{
    format: ExportFormat;
    estimate: TimeEstimate;
    recommendation: string;
  }> {
    const formats: ExportFormat[] = ['csv', 'excel', 'pdf', 'png', 'json'];

    return formats
      .map(format => {
        const estimate = this.estimateTime(format, rowCount);
        let recommendation = '';

        if (rowCount <= 100) {
          recommendation =
            format === 'pdf' || format === 'png'
              ? 'Excellent for visual presentation'
              : format === 'excel'
                ? 'Good for analysis and formatting'
                : 'Fast and lightweight';
        } else if (rowCount <= 1000) {
          recommendation =
            format === 'excel'
              ? 'Ideal for analysis'
              : format === 'csv'
                ? 'Fast and compatible'
                : format === 'json'
                  ? 'Best for data integration'
                  : 'May be slow for this size';
        } else {
          recommendation =
            format === 'csv' || format === 'json'
              ? 'Recommended for large datasets'
              : 'Not recommended for large datasets';
        }

        return { format, estimate, recommendation };
      })
      .sort((a, b) => a.estimate.estimatedTimeMs - b.estimate.estimatedTimeMs);
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const exportPerformanceMonitor = new ExportPerformanceMonitor();

// Export class for testing
export { ExportPerformanceMonitor };
