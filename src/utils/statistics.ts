// Statistical utilities for data analysis

/**
 * Calculate Pearson correlation coefficient between two datasets
 * Returns a value between -1 (perfect negative correlation) and 1 (perfect positive correlation)
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let numerator = 0;
  let sumSquaredX = 0;
  let sumSquaredY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    sumSquaredX += diffX * diffX;
    sumSquaredY += diffY * diffY;
  }

  const denominator = Math.sqrt(sumSquaredX * sumSquaredY);

  if (denominator === 0) {
    return 0; // No correlation if either variable has no variance
  }

  return numerator / denominator;
}

/**
 * Calculate Z-score for a value
 * Z-score indicates how many standard deviations a value is from the mean
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) {
    return 0; // Avoid division by zero
  }
  return (value - mean) / stdDev;
}

/**
 * Calculate mean (average) of a dataset
 */
export function calculateMean(data: number[]): number {
  if (data.length === 0) {
    return 0;
  }
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * Calculate standard deviation of a dataset
 */
export function calculateStdDev(data: number[]): number {
  if (data.length === 0) {
    return 0;
  }

  const mean = calculateMean(data);
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Calculate median of a dataset
 */
export function calculateMedian(data: number[]): number {
  if (data.length === 0) {
    return 0;
  }

  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Detect outliers using the 3-sigma rule (or custom threshold)
 * Returns indices of outliers and their z-scores
 */
export function detectOutliers(
  data: number[],
  threshold: number = 3
): Array<{ index: number; value: number; zScore: number; deviation: number }> {
  if (data.length === 0) {
    return [];
  }

  const mean = calculateMean(data);
  const stdDev = calculateStdDev(data);
  const outliers: Array<{ index: number; value: number; zScore: number; deviation: number }> = [];

  data.forEach((value, index) => {
    const zScore = calculateZScore(value, mean, stdDev);
    if (Math.abs(zScore) >= threshold) {
      outliers.push({
        index,
        value,
        zScore,
        deviation: value - mean,
      });
    }
  });

  return outliers;
}

/**
 * Calculate simple moving average
 */
export function calculateMovingAverage(data: number[], window: number): number[] {
  if (window <= 0 || window > data.length) {
    return data;
  }

  const result: number[] = [];
  for (let i = 0; i <= data.length - window; i++) {
    const windowData = data.slice(i, i + window);
    result.push(calculateMean(windowData));
  }

  return result;
}

/**
 * Calculate exponential moving average
 * Alpha determines the weight of recent values (0 < alpha <= 1)
 */
export function calculateEMA(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) {
    return [];
  }

  const ema: number[] = [data[0]]; // Start with first value

  for (let i = 1; i < data.length; i++) {
    const newEma = alpha * data[i] + (1 - alpha) * ema[i - 1];
    ema.push(newEma);
  }

  return ema;
}

/**
 * Calculate linear regression (y = mx + b)
 * Returns slope (m) and intercept (b)
 */
export function calculateLinearRegression(
  x: number[],
  y: number[]
): { slope: number; intercept: number; rSquared: number } {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    numerator += diffX * (y[i] - meanY);
    denominator += diffX * diffX;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  const predictions = x.map(xi => slope * xi + intercept);
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, rSquared };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate variance of a dataset
 */
export function calculateVariance(data: number[]): number {
  if (data.length === 0) {
    return 0;
  }

  const mean = calculateMean(data);
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  return calculateMean(squaredDiffs);
}

/**
 * Detect trend in time series data
 * Returns: 'upward', 'downward', 'stable', or 'cyclical'
 */
export function detectTrend(data: number[]): 'upward' | 'downward' | 'stable' | 'cyclical' {
  if (data.length < 3) {
    return 'stable';
  }

  const x = data.map((_, i) => i);
  const { slope, rSquared } = calculateLinearRegression(x, data);

  // Check if trend is strong enough (R² > 0.5)
  if (rSquared < 0.5) {
    // Check for cyclical pattern by comparing variance of differences
    const diffs = data.slice(1).map((val, i) => val - data[i]);
    const diffVariance = calculateVariance(diffs);
    const dataVariance = calculateVariance(data);

    if (diffVariance > dataVariance * 0.3) {
      return 'cyclical';
    }
    return 'stable';
  }

  const slopePercentage = (slope / calculateMean(data)) * 100;

  if (slopePercentage > 5) {
    return 'upward';
  } else if (slopePercentage < -5) {
    return 'downward';
  }
  return 'stable';
}

/**
 * Detect seasonality in time series data
 * Returns period if seasonality detected, otherwise null
 */
export function detectSeasonality(data: number[]): { hasSeason: boolean; period?: number } {
  if (data.length < 12) {
    return { hasSeason: false };
  }

  // Test for common periods (weekly=7, monthly=30, quarterly=90)
  const testPeriods = [7, 12, 30, 90];
  let maxCorrelation = 0;
  let bestPeriod: number | undefined;

  for (const period of testPeriods) {
    if (data.length < period * 2) continue;

    // Calculate autocorrelation at this lag
    const shifted = data.slice(period);
    const original = data.slice(0, -period);

    try {
      const correlation = Math.abs(calculatePearsonCorrelation(original, shifted));
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    } catch {
      continue;
    }
  }

  // Seasonality is significant if correlation > 0.6
  if (maxCorrelation > 0.6 && bestPeriod) {
    return { hasSeason: true, period: bestPeriod };
  }

  return { hasSeason: false };
}

/**
 * Calculate confidence interval
 * Returns [lower bound, upper bound]
 */
export function calculateConfidenceInterval(
  data: number[],
  confidenceLevel: number = 0.95
): [number, number] {
  if (data.length === 0) {
    return [0, 0];
  }

  const mean = calculateMean(data);
  const stdDev = calculateStdDev(data);
  const n = data.length;

  // Z-scores for common confidence levels
  const zScores: Record<number, number> = {
    0.80: 1.28,
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  const margin = z * (stdDev / Math.sqrt(n));

  return [mean - margin, mean + margin];
}
