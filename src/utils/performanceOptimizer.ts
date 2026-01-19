/**
 * Performance Optimizer
 * Adaptive rendering strategy selector based on dataset size
 */

export interface RenderStrategy {
  type: 'full' | 'paginated' | 'virtual' | 'server-side';
  pageSize?: number;
  windowSize?: number;
  overscan?: number;
}

export interface ChartStrategy {
  type: 'full' | 'sample' | 'lttb';
  targetPoints?: number;
  sampleRate?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  dataFetchTime: number;
  cacheHitRate: number;
  memoryUsage?: number;
  dataSize: number;
  strategy: RenderStrategy;
}

export interface OptimizationRecommendation {
  type: 'info' | 'warning' | 'critical';
  message: string;
  action?: string;
}

/**
 * Select optimal rendering strategy based on dataset size
 */
export function selectRenderStrategy(rowCount: number): RenderStrategy {
  if (rowCount < 100) {
    return { type: 'full' };
  } else if (rowCount < 1000) {
    return { type: 'paginated', pageSize: 50 };
  } else if (rowCount < 10000) {
    return { type: 'virtual', windowSize: 50, overscan: 10 };
  } else {
    return { type: 'server-side', pageSize: 100 };
  }
}

/**
 * Select optimal chart sampling strategy based on data points
 */
export function selectChartStrategy(pointCount: number): ChartStrategy {
  if (pointCount < 500) {
    return { type: 'full' };
  } else if (pointCount < 2000) {
    const sampleRate = Math.ceil(pointCount / 500);
    return { type: 'sample', sampleRate, targetPoints: 500 };
  } else {
    return { type: 'lttb', targetPoints: 500 };
  }
}

/**
 * Calculate memory usage estimate for dataset
 */
export function estimateMemoryUsage(data: any[]): number {
  try {
    const sample = JSON.stringify(data.slice(0, Math.min(100, data.length)));
    const bytesPerRow = sample.length / Math.min(100, data.length);
    return bytesPerRow * data.length;
  } catch {
    return 0;
  }
}

/**
 * Determine if data should be cached based on size and usage
 */
export function shouldCacheData(dataSize: number, accessFrequency: number = 1): boolean {
  // Cache if data is under 5MB or accessed frequently
  const CACHE_SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB
  const CACHE_FREQUENCY_THRESHOLD = 3;

  return dataSize < CACHE_SIZE_THRESHOLD || accessFrequency >= CACHE_FREQUENCY_THRESHOLD;
}

/**
 * Determine if IndexedDB should be used instead of localStorage
 */
export function shouldUseIndexedDB(dataSize: number): boolean {
  const INDEXEDDB_THRESHOLD = 5 * 1024 * 1024; // 5MB
  return dataSize >= INDEXEDDB_THRESHOLD;
}

/**
 * Generate performance recommendations based on metrics
 */
export function generateRecommendations(
  metrics: PerformanceMetrics
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  // Check render time
  if (metrics.renderTime > 1000) {
    recommendations.push({
      type: 'critical',
      message: `Render time is ${metrics.renderTime}ms. Consider using virtual scrolling or pagination.`,
      action: 'Enable virtual scrolling for better performance',
    });
  } else if (metrics.renderTime > 500) {
    recommendations.push({
      type: 'warning',
      message: `Render time is ${metrics.renderTime}ms. Performance could be improved.`,
      action: 'Consider pagination or data sampling',
    });
  }

  // Check data fetch time
  if (metrics.dataFetchTime > 2000) {
    recommendations.push({
      type: 'critical',
      message: `Data fetch time is ${metrics.dataFetchTime}ms. Enable caching.`,
      action: 'Implement server-side pagination and caching',
    });
  } else if (metrics.dataFetchTime > 1000) {
    recommendations.push({
      type: 'warning',
      message: `Data fetch time is ${metrics.dataFetchTime}ms. Consider caching.`,
      action: 'Enable response caching',
    });
  }

  // Check cache hit rate
  if (metrics.cacheHitRate < 50 && metrics.dataFetchTime > 500) {
    recommendations.push({
      type: 'warning',
      message: `Cache hit rate is ${metrics.cacheHitRate}%. Increase cache TTL.`,
      action: 'Adjust cache TTL settings',
    });
  }

  // Check memory usage
  if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) {
    recommendations.push({
      type: 'critical',
      message: `Memory usage is ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB. Data should be loaded on-demand.`,
      action: 'Implement server-side pagination',
    });
  } else if (metrics.memoryUsage && metrics.memoryUsage > 10 * 1024 * 1024) {
    recommendations.push({
      type: 'warning',
      message: `Memory usage is ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB. Consider data optimization.`,
      action: 'Use virtual scrolling or data compression',
    });
  }

  // Check data size
  if (metrics.dataSize > 10000) {
    recommendations.push({
      type: 'info',
      message: `Large dataset (${metrics.dataSize.toLocaleString()} rows). Using ${metrics.strategy.type} rendering.`,
      action: 'Current strategy is optimal',
    });
  }

  // If no issues, provide positive feedback
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'info',
      message: 'Performance is optimal for this dataset size.',
    });
  }

  return recommendations;
}

/**
 * Progressive loading helper for skeleton states
 */
export interface SkeletonConfig {
  rows: number;
  columns: number;
  animate?: boolean;
}

export function generateSkeletonData(config: SkeletonConfig): any[] {
  const { rows, columns } = config;
  return Array.from({ length: rows }, (_, i) => {
    const row: any = { id: `skeleton-${i}` };
    for (let j = 0; j < columns; j++) {
      row[`col${j}`] = null;
    }
    return row;
  });
}

/**
 * Batch processing helper for large datasets
 */
export async function processBatch<T, R>(
  data: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 100,
  onProgress?: (progress: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const totalBatches = Math.ceil(data.length / batchSize);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);

    if (onProgress) {
      const progress = Math.min(100, ((i + batchSize) / data.length) * 100);
      onProgress(progress);
    }
  }

  return results;
}

/**
 * Debounced performance measurement
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(value);

    // Keep only last 100 measurements
    const values = this.metrics.get(key)!;
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetric(key: string): {
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.metrics.get(key);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return { avg, min, max, p95, p99 };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    this.metrics.forEach((_, key) => {
      result[key] = this.getMetric(key);
    });
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Performance measurement decorator
 */
export function measurePerformance<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metricKey: string
): T {
  return (async (...args: any[]) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      globalPerformanceMonitor.recordMetric(metricKey, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      globalPerformanceMonitor.recordMetric(`${metricKey}_error`, duration);
      throw error;
    }
  }) as T;
}

/**
 * React performance hook
 */
export function usePerformanceMetrics(key: string) {
  const [metrics, setMetrics] = React.useState<ReturnType<typeof globalPerformanceMonitor.getMetric>>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(globalPerformanceMonitor.getMetric(key));
    }, 1000);

    return () => clearInterval(interval);
  }, [key]);

  return metrics;
}

import React from 'react';
