/**
 * Data Aggregation Utilities
 * Time-based aggregation, percentiles, and statistical calculations
 */

export type TimeUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface AggregationConfig {
  groupBy: string | string[];
  metrics: Array<{
    field: string;
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'stddev';
    alias?: string;
  }>;
}

export interface TimeSeriesConfig {
  dateField: string;
  valueField: string;
  timeUnit: TimeUnit;
  fillGaps?: boolean;
  defaultValue?: number;
}

/**
 * Aggregate data by time periods
 */
export function aggregateByTime<T extends Record<string, any>>(
  data: T[],
  config: TimeSeriesConfig
): Array<{ date: string; value: number; count: number }> {
  const { dateField, valueField, timeUnit, fillGaps = false, defaultValue = 0 } = config;

  // Group data by time period
  const groups = new Map<string, { values: number[]; count: number }>();

  data.forEach(item => {
    const date = new Date(item[dateField]);
    if (isNaN(date.getTime())) return;

    const key = formatDateByUnit(date, timeUnit);

    if (!groups.has(key)) {
      groups.set(key, { values: [], count: 0 });
    }

    const group = groups.get(key)!;
    const value = typeof item[valueField] === 'number' ? item[valueField] : 0;
    group.values.push(value);
    group.count++;
  });

  // Convert to array and calculate aggregates
  let result = Array.from(groups.entries()).map(([date, group]) => ({
    date,
    value: group.values.reduce((sum, v) => sum + v, 0),
    count: group.count,
  }));

  // Fill gaps if requested
  if (fillGaps && result.length > 0) {
    result = fillTimeGaps(result, timeUnit, defaultValue);
  }

  // Sort by date
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
}

/**
 * Format date based on time unit
 */
function formatDateByUnit(date: Date, unit: TimeUnit): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (unit) {
    case 'hour':
      const hour = String(date.getHours()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:00`;
    case 'day':
      return `${year}-${month}-${day}`;
    case 'week':
      const weekStart = getWeekStart(date);
      return formatDateByUnit(weekStart, 'day');
    case 'month':
      return `${year}-${month}`;
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    case 'year':
      return `${year}`;
    default:
      return date.toISOString();
  }
}

/**
 * Get start of week (Monday)
 */
function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

/**
 * Fill time gaps in data
 */
function fillTimeGaps(
  data: Array<{ date: string; value: number; count: number }>,
  unit: TimeUnit,
  defaultValue: number
): Array<{ date: string; value: number; count: number }> {
  if (data.length === 0) return data;

  const result: Array<{ date: string; value: number; count: number }> = [];
  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);

  const dataMap = new Map(data.map(d => [d.date, d]));
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const key = formatDateByUnit(currentDate, unit);

    if (dataMap.has(key)) {
      result.push(dataMap.get(key)!);
    } else {
      result.push({ date: key, value: defaultValue, count: 0 });
    }

    // Increment date based on unit
    incrementDate(currentDate, unit);
  }

  return result;
}

/**
 * Increment date by time unit
 */
function incrementDate(date: Date, unit: TimeUnit): void {
  switch (unit) {
    case 'hour':
      date.setHours(date.getHours() + 1);
      break;
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
}

/**
 * Generic group-by aggregation
 */
export function aggregateBy<T extends Record<string, any>>(
  data: T[],
  config: AggregationConfig
): Array<Record<string, any>> {
  const { groupBy, metrics } = config;
  const groupKeys = Array.isArray(groupBy) ? groupBy : [groupBy];

  // Group data
  const groups = new Map<string, T[]>();

  data.forEach(item => {
    const key = groupKeys.map(k => item[k]).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  // Calculate metrics for each group
  return Array.from(groups.entries()).map(([key, items]) => {
    const result: Record<string, any> = {};

    // Add group keys
    const keyParts = key.split('|');
    groupKeys.forEach((k, i) => {
      result[k] = keyParts[i];
    });

    // Calculate metrics
    metrics.forEach(metric => {
      const values = items
        .map(item => item[metric.field])
        .filter(v => typeof v === 'number');

      const fieldName = metric.alias || metric.field;

      switch (metric.operation) {
        case 'sum':
          result[fieldName] = values.reduce((sum, v) => sum + v, 0);
          break;
        case 'avg':
          result[fieldName] = values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0;
          break;
        case 'min':
          result[fieldName] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          result[fieldName] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case 'count':
          result[fieldName] = values.length;
          break;
        case 'median':
          result[fieldName] = calculateMedian(values);
          break;
        case 'stddev':
          result[fieldName] = calculateStdDev(values);
          break;
      }
    });

    return result;
  });
}

/**
 * Calculate percentiles
 */
export function calculatePercentiles(
  data: number[],
  percentiles: number[] = [50, 90, 95, 99]
): Record<string, number> {
  if (data.length === 0) {
    return percentiles.reduce((acc, p) => ({ ...acc, [`p${p}`]: 0 }), {});
  }

  const sorted = [...data].sort((a, b) => a - b);
  const result: Record<string, number> = {};

  percentiles.forEach(p => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    result[`p${p}`] = sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  });

  return result;
}

/**
 * Calculate median
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage<T extends Record<string, any>>(
  data: T[],
  field: string,
  windowSize: number = 7
): Array<T & { movingAverage: number }> {
  return data.map((item, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = data.slice(start, index + 1);
    const values = window
      .map(w => w[field])
      .filter(v => typeof v === 'number');

    const movingAverage = values.length > 0
      ? values.reduce((sum: number, v: number) => sum + v, 0) / values.length
      : 0;

    return { ...item, movingAverage };
  });
}

/**
 * Calculate exponential moving average
 */
export function calculateEMA<T extends Record<string, any>>(
  data: T[],
  field: string,
  alpha: number = 0.2
): Array<T & { ema: number }> {
  let ema = 0;

  return data.map((item, index) => {
    const value = typeof item[field] === 'number' ? item[field] : 0;

    if (index === 0) {
      ema = value;
    } else {
      ema = alpha * value + (1 - alpha) * ema;
    }

    return { ...item, ema };
  });
}

/**
 * Calculate growth rate (period over period)
 */
export function calculateGrowthRate<T extends Record<string, any>>(
  data: T[],
  field: string
): Array<T & { growthRate: number }> {
  return data.map((item, index) => {
    if (index === 0) {
      return { ...item, growthRate: 0 };
    }

    const current = typeof item[field] === 'number' ? item[field] : 0;
    const previous = typeof data[index - 1][field] === 'number' ? data[index - 1][field] : 0;

    const growthRate = previous !== 0
      ? ((current - previous) / previous) * 100
      : 0;

    return { ...item, growthRate };
  });
}

/**
 * Calculate cumulative sum
 */
export function calculateCumulativeSum<T extends Record<string, any>>(
  data: T[],
  field: string
): Array<T & { cumulativeSum: number }> {
  let sum = 0;

  return data.map(item => {
    const value = typeof item[field] === 'number' ? item[field] : 0;
    sum += value;
    return { ...item, cumulativeSum: sum };
  });
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers<T extends Record<string, any>>(
  data: T[],
  field: string,
  threshold: number = 1.5
): Array<T & { isOutlier: boolean; zScore: number }> {
  const values = data
    .map(item => item[field])
    .filter(v => typeof v === 'number')
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return data.map(item => ({ ...item, isOutlier: false, zScore: 0 }));
  }

  // Calculate quartiles
  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);
  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;

  // Calculate mean and std dev for z-score
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const stdDev = calculateStdDev(values);

  return data.map(item => {
    const value = typeof item[field] === 'number' ? item[field] : 0;
    const isOutlier = value < lowerBound || value > upperBound;
    const zScore = stdDev !== 0 ? (value - mean) / stdDev : 0;

    return { ...item, isOutlier, zScore };
  });
}

/**
 * Bin data into ranges
 */
export function binData<T extends Record<string, any>>(
  data: T[],
  field: string,
  binCount: number = 10
): Array<{ range: string; count: number; min: number; max: number }> {
  const values = data
    .map(item => item[field])
    .filter(v => typeof v === 'number');

  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    range: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
    count: 0,
    min: min + i * binSize,
    max: min + (i + 1) * binSize,
  }));

  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[binIndex].count++;
  });

  return bins;
}

/**
 * Calculate correlation coefficient between two fields
 */
export function calculateCorrelation<T extends Record<string, any>>(
  data: T[],
  field1: string,
  field2: string
): number {
  const pairs = data
    .filter(item =>
      typeof item[field1] === 'number' &&
      typeof item[field2] === 'number'
    )
    .map(item => ({
      x: item[field1] as number,
      y: item[field2] as number,
    }));

  if (pairs.length === 0) return 0;

  const n = pairs.length;
  const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
  const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
  const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = pairs.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumY2 = pairs.reduce((sum, p) => sum + p.y * p.y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator !== 0 ? numerator / denominator : 0;
}
