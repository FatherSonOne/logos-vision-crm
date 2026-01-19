/**
 * Chart Sampling Utilities
 * LTTB (Largest-Triangle-Three-Buckets) algorithm for chart downsampling
 */

export interface DataPoint {
  x: number | string;
  y: number;
  [key: string]: any;
}

/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm
 * Preserves visual appearance while reducing points
 *
 * @param data - Original data array
 * @param threshold - Target number of points
 * @returns Downsampled data array
 */
export function lttb<T extends DataPoint>(data: T[], threshold: number): T[] {
  if (threshold >= data.length || threshold <= 2) {
    return data;
  }

  const sampled: T[] = [];

  // Always include first point
  sampled.push(data[0]);

  // Bucket size. Leave room for start and end data points
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0; // Initially point a is the first point in the triangle

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (containing c)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    let avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    avgRangeEnd = avgRangeEnd < data.length ? avgRangeEnd : data.length;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      const xVal = typeof data[avgRangeStart].x === 'number'
        ? data[avgRangeStart].x
        : avgRangeStart;
      avgX += xVal;
      avgY += data[avgRangeStart].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    let rangeOffs = Math.floor((i + 0) * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    // Point a
    const pointAX = typeof data[a].x === 'number' ? data[a].x : a;
    const pointAY = data[a].y;

    let maxArea = -1;
    let maxAreaPoint = -1;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      const pointX = typeof data[rangeOffs].x === 'number'
        ? data[rangeOffs].x
        : rangeOffs;
      const pointY = data[rangeOffs].y;

      // Calculate triangle area over three buckets
      const area = Math.abs(
        (pointAX - avgX) * (pointY - pointAY) -
        (pointAX - pointX) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = rangeOffs;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint; // This point is the next a
  }

  // Always include last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Simple every-nth-point sampling
 * Fast but less visually accurate than LTTB
 */
export function sampleEveryNth<T>(data: T[], n: number): T[] {
  if (n <= 1) return data;

  const sampled: T[] = [data[0]]; // Always include first point

  for (let i = n; i < data.length - 1; i += n) {
    sampled.push(data[i]);
  }

  // Always include last point
  if (data.length > 1) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
}

/**
 * Min-Max sampling
 * Preserves peaks and valleys
 */
export function sampleMinMax<T extends DataPoint>(data: T[], threshold: number): T[] {
  if (threshold >= data.length || threshold <= 2) {
    return data;
  }

  const sampled: T[] = [data[0]]; // Always include first point
  const bucketSize = Math.floor(data.length / threshold);

  for (let i = 0; i < threshold - 2; i++) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, data.length);
    const bucket = data.slice(start, end);

    if (bucket.length === 0) continue;

    // Find min and max in bucket
    let min = bucket[0];
    let max = bucket[0];

    for (const point of bucket) {
      if (point.y < min.y) min = point;
      if (point.y > max.y) max = point;
    }

    // Add both min and max to preserve peaks and valleys
    if (min !== max) {
      // Add them in chronological order
      const minIndex = bucket.indexOf(min);
      const maxIndex = bucket.indexOf(max);

      if (minIndex < maxIndex) {
        sampled.push(min, max);
      } else {
        sampled.push(max, min);
      }
    } else {
      sampled.push(min);
    }
  }

  // Always include last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Adaptive sampling based on data characteristics
 */
export function adaptiveSample<T extends DataPoint>(
  data: T[],
  threshold: number,
  options: {
    preservePeaks?: boolean;
    preserveTrends?: boolean;
  } = {}
): T[] {
  const { preservePeaks = true, preserveTrends = true } = options;

  if (threshold >= data.length) {
    return data;
  }

  // Calculate variance to determine data volatility
  const values = data.map(d => d.y);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // High variance means volatile data - use min-max to preserve peaks
  if (preservePeaks && stdDev > mean * 0.3) {
    return sampleMinMax(data, threshold);
  }

  // Low variance means smooth data - use LTTB for better visual representation
  if (preserveTrends) {
    return lttb(data, threshold);
  }

  // Default to simple sampling
  const n = Math.ceil(data.length / threshold);
  return sampleEveryNth(data, n);
}

/**
 * Convert data to standard format for sampling
 */
export function normalizeDataForSampling<T extends Record<string, any>>(
  data: T[],
  xKey: string,
  yKey: string
): DataPoint[] {
  return data.map((item, index) => ({
    x: item[xKey] ?? index,
    y: typeof item[yKey] === 'number' ? item[yKey] : 0,
    ...item,
  }));
}

/**
 * Sample multiple series data (for multi-line charts)
 */
export function sampleMultiSeries<T extends Record<string, any>>(
  data: T[],
  threshold: number,
  seriesKeys: string[],
  xKey: string = 'x'
): T[] {
  if (threshold >= data.length) {
    return data;
  }

  // Use LTTB on the first series to determine which points to keep
  const primarySeries = normalizeDataForSampling(data, xKey, seriesKeys[0]);
  const sampledPrimary = lttb(primarySeries, threshold);

  // Create a set of indices to keep
  const indicesToKeep = new Set(
    sampledPrimary.map(point =>
      data.findIndex(d => d[xKey] === point.x)
    )
  );

  // Filter original data to keep only selected indices
  return data.filter((_, index) => indicesToKeep.has(index));
}

/**
 * Automatic sampling based on chart type and data size
 */
export function autoSample<T extends Record<string, any>>(
  data: T[],
  chartType: 'line' | 'area' | 'scatter' | 'bar',
  options: {
    maxPoints?: number;
    xKey?: string;
    yKey?: string;
    seriesKeys?: string[];
  } = {}
): T[] {
  const {
    maxPoints = 500,
    xKey = 'x',
    yKey = 'y',
    seriesKeys = [yKey],
  } = options;

  // Don't sample if data is small enough
  if (data.length <= maxPoints) {
    return data;
  }

  // Bar charts should use different sampling to avoid gaps
  if (chartType === 'bar') {
    const n = Math.ceil(data.length / maxPoints);
    return sampleEveryNth(data, n);
  }

  // Multi-series handling
  if (seriesKeys.length > 1) {
    return sampleMultiSeries(data, maxPoints, seriesKeys, xKey);
  }

  // Single series - use LTTB for best visual results
  const normalized = normalizeDataForSampling(data, xKey, yKey);
  const sampled = lttb(normalized, maxPoints);

  // Map back to original data structure
  return sampled.map(point =>
    data.find(d => d[xKey] === point.x) || point as any
  );
}

/**
 * Calculate sampling statistics
 */
export function getSamplingStats(
  originalCount: number,
  sampledCount: number
): {
  originalCount: number;
  sampledCount: number;
  reductionPercent: number;
  compressionRatio: number;
} {
  return {
    originalCount,
    sampledCount,
    reductionPercent: ((originalCount - sampledCount) / originalCount) * 100,
    compressionRatio: originalCount / sampledCount,
  };
}

/**
 * Web Worker wrapper for heavy sampling operations
 */
export async function sampleInWorker<T extends DataPoint>(
  data: T[],
  threshold: number,
  method: 'lttb' | 'minmax' | 'adaptive' = 'lttb'
): Promise<T[]> {
  // For now, run synchronously. In production, this would use a Web Worker
  // to avoid blocking the main thread

  switch (method) {
    case 'lttb':
      return lttb(data, threshold);
    case 'minmax':
      return sampleMinMax(data, threshold);
    case 'adaptive':
      return adaptiveSample(data, threshold);
    default:
      return lttb(data, threshold);
  }
}
