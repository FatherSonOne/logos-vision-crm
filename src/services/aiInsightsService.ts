// AI Insights Service with Forecasting, Anomaly Detection, and Correlation Analysis

import {
  calculatePearsonCorrelation,
  calculateZScore,
  calculateMean,
  calculateStdDev,
  detectOutliers,
  detectTrend,
  detectSeasonality,
  calculateLinearRegression,
  calculateConfidenceInterval,
} from '../utils/statistics';

// Dynamic import for Gemini AI
let ai: any = null;
let GoogleGenAI: any = null;

async function getAI() {
  if (!ai) {
    const genai = await import('@google/genai');
    GoogleGenAI = genai.GoogleGenAI;

    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.warn('VITE_API_KEY not found. AI features will be disabled.');
      ai = new GoogleGenAI({ apiKey: 'not-configured' });
    } else {
      ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
}

// ============================================
// TYPES
// ============================================

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ForecastOptions {
  periodsAhead?: number; // Default: 3 months (90 days)
  confidenceLevels?: number[]; // Default: [0.80, 0.95]
  includeSeasonality?: boolean; // Default: true
}

export interface ForecastPrediction {
  date: string;
  predictedValue: number;
  confidenceIntervals: {
    level: number; // e.g., 0.80 or 0.95
    lower: number;
    upper: number;
  }[];
}

export interface ForecastResult {
  predictions: ForecastPrediction[];
  trend: 'upward' | 'downward' | 'stable' | 'cyclical';
  seasonality: {
    detected: boolean;
    period?: number;
    description?: string;
  };
  methodology: string;
  expectedAccuracy: number; // 0-100
  aiAnalysis?: string;
}

export interface AnomalyOptions {
  zScoreThreshold?: number; // Default: 3 (3-sigma rule)
  includeContext?: boolean; // Default: true
}

export interface Anomaly {
  index: number;
  date: string;
  value: number;
  expectedValue: number;
  deviation: number;
  deviationPercentage: number;
  zScore: number;
  severity: 'minor' | 'moderate' | 'critical';
  explanation: string;
  suggestedActions: string[];
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  totalDataPoints: number;
  anomalyRate: number; // Percentage
  methodology: string;
}

export interface MetricData {
  name: string;
  data: TimeSeriesDataPoint[];
}

export interface CorrelationOptions {
  minCorrelation?: number; // Default: 0.7 (strong correlation)
  includeBusinessContext?: boolean; // Default: true
}

export interface CorrelationPair {
  metric1: string;
  metric2: string;
  coefficient: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong' | 'very strong';
  direction: 'positive' | 'negative';
  businessImplication: string;
  suggestedVisualization: 'scatter' | 'dual-axis-line' | 'stacked-area';
}

export interface CorrelationAnalysisResult {
  correlations: CorrelationPair[];
  totalPairsAnalyzed: number;
  significantCorrelations: number;
  methodology: string;
}

// ============================================
// FORECASTING
// ============================================

/**
 * Generate forecast for time series data using statistical methods + AI analysis
 */
export async function generateForecast(
  historicalData: TimeSeriesDataPoint[],
  options: ForecastOptions = {}
): Promise<ForecastResult> {
  const {
    periodsAhead = 90, // 3 months
    confidenceLevels = [0.80, 0.95],
    includeSeasonality = true,
  } = options;

  if (historicalData.length < 3) {
    throw new Error('Need at least 3 data points for forecasting');
  }

  // Extract values and dates
  const values = historicalData.map(d => d.value);
  const dates = historicalData.map(d => new Date(d.date));

  // Detect trend
  const trend = detectTrend(values);

  // Detect seasonality
  const seasonality = detectSeasonality(values);

  // Calculate linear regression for trend
  const x = values.map((_, i) => i);
  const { slope, intercept, rSquared } = calculateLinearRegression(x, values);

  // Generate predictions
  const predictions: ForecastPrediction[] = [];
  const lastDate = dates[dates.length - 1];
  const avgDaysBetween = calculateAverageDaysBetween(dates);

  for (let i = 1; i <= Math.ceil(periodsAhead / avgDaysBetween); i++) {
    const futureX = values.length + i - 1;
    const predictedValue = slope * futureX + intercept;

    // Apply seasonality adjustment if detected
    let adjustedValue = predictedValue;
    if (includeSeasonality && seasonality.hasSeason && seasonality.period) {
      const seasonalIndex = (futureX % seasonality.period);
      const historicalAtSeason = values.filter((_, idx) => idx % seasonality.period === seasonalIndex);
      if (historicalAtSeason.length > 0) {
        const seasonalAvg = calculateMean(historicalAtSeason);
        const overallAvg = calculateMean(values);
        const seasonalFactor = seasonalAvg / overallAvg;
        adjustedValue = predictedValue * seasonalFactor;
      }
    }

    // Calculate confidence intervals
    const stdDev = calculateStdDev(values);
    const confidenceIntervals = confidenceLevels.map(level => {
      const [lower, upper] = calculateConfidenceInterval(values, level);
      const range = upper - lower;

      return {
        level,
        lower: Math.max(0, adjustedValue - range / 2),
        upper: adjustedValue + range / 2,
      };
    });

    // Calculate future date
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + (i * avgDaysBetween));

    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predictedValue: adjustedValue,
      confidenceIntervals,
    });
  }

  // Calculate expected accuracy based on R²
  const expectedAccuracy = Math.min(95, Math.max(50, rSquared * 100));

  // Get AI analysis of the forecast
  let aiAnalysis: string | undefined;
  try {
    const prompt = `Analyze this forecast data and provide business insights in 2-3 sentences:

Historical trend: ${trend}
Seasonality detected: ${seasonality.hasSeason ? `Yes, ${seasonality.period}-period cycle` : 'No'}
Forecast accuracy: ${expectedAccuracy.toFixed(1)}%
Average historical value: ${calculateMean(values).toFixed(2)}
Predicted next period: ${predictions[0]?.predictedValue.toFixed(2)}

Provide actionable insights about what this forecast means for business planning.`;

    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            analysis: { type: 'string' }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    aiAnalysis = parsed.analysis;
  } catch (err) {
    console.error('Failed to get AI forecast analysis:', err);
  }

  const methodology = seasonality.hasSeason
    ? 'Linear regression with seasonal adjustment and confidence intervals'
    : 'Linear regression with confidence intervals';

  return {
    predictions,
    trend,
    seasonality: {
      detected: seasonality.hasSeason,
      period: seasonality.period,
      description: seasonality.hasSeason
        ? `${seasonality.period}-period cycle detected`
        : 'No significant seasonality detected',
    },
    methodology,
    expectedAccuracy,
    aiAnalysis,
  };
}

/**
 * Calculate average days between data points
 */
function calculateAverageDaysBetween(dates: Date[]): number {
  if (dates.length < 2) return 1;

  const diffs = dates.slice(1).map((date, i) => {
    const diff = date.getTime() - dates[i].getTime();
    return Math.abs(diff / (1000 * 60 * 60 * 24));
  });

  return Math.max(1, Math.round(calculateMean(diffs)));
}

// ============================================
// ANOMALY DETECTION
// ============================================

/**
 * Detect anomalies in time series data using statistical methods + AI context
 */
export async function detectAnomalies(
  data: TimeSeriesDataPoint[],
  options: AnomalyOptions = {}
): Promise<AnomalyDetectionResult> {
  const {
    zScoreThreshold = 3,
    includeContext = true,
  } = options;

  if (data.length < 3) {
    throw new Error('Need at least 3 data points for anomaly detection');
  }

  const values = data.map(d => d.value);
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);

  // Detect statistical outliers
  const outliers = detectOutliers(values, zScoreThreshold);

  // Build anomalies with context
  const anomalies: Anomaly[] = [];

  for (const outlier of outliers) {
    const dataPoint = data[outlier.index];
    const deviationPercentage = ((outlier.value - mean) / mean) * 100;

    // Determine severity based on z-score
    let severity: 'minor' | 'moderate' | 'critical';
    const absZScore = Math.abs(outlier.zScore);
    if (absZScore >= 4) {
      severity = 'critical';
    } else if (absZScore >= 3.5) {
      severity = 'moderate';
    } else {
      severity = 'minor';
    }

    // Get AI explanation and suggested actions
    let explanation = `Value is ${Math.abs(deviationPercentage).toFixed(1)}% ${deviationPercentage > 0 ? 'above' : 'below'} normal range`;
    let suggestedActions: string[] = [];

    if (includeContext) {
      try {
        const prompt = `Analyze this data anomaly and provide business context:

Value: ${outlier.value.toFixed(2)}
Expected range: ${(mean - 2 * stdDev).toFixed(2)} - ${(mean + 2 * stdDev).toFixed(2)}
Date: ${dataPoint.date}
Deviation: ${deviationPercentage > 0 ? '+' : ''}${deviationPercentage.toFixed(1)}%
Z-Score: ${outlier.zScore.toFixed(2)}

Provide:
1. A brief explanation (1 sentence) of what might have caused this anomaly
2. 2-3 specific actions to investigate or address this anomaly

Return as JSON with fields: explanation (string), actions (array of strings)`;

        const response = await (await getAI()).models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                explanation: { type: 'string' },
                actions: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        });

        const parsed = JSON.parse(response.text);
        explanation = parsed.explanation || explanation;
        suggestedActions = parsed.actions || [];
      } catch (err) {
        console.error('Failed to get AI anomaly context:', err);
        // Provide default actions
        suggestedActions = [
          'Review data source for potential errors',
          'Check for special events on this date',
          'Compare with external factors or trends',
        ];
      }
    }

    anomalies.push({
      index: outlier.index,
      date: dataPoint.date,
      value: outlier.value,
      expectedValue: mean,
      deviation: outlier.deviation,
      deviationPercentage,
      zScore: outlier.zScore,
      severity,
      explanation,
      suggestedActions,
    });
  }

  // Sort by severity and absolute z-score
  anomalies.sort((a, b) => {
    const severityOrder = { critical: 0, moderate: 1, minor: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return Math.abs(b.zScore) - Math.abs(a.zScore);
  });

  return {
    anomalies,
    totalDataPoints: data.length,
    anomalyRate: (anomalies.length / data.length) * 100,
    methodology: `${zScoreThreshold}-sigma rule with AI context analysis`,
  };
}

// ============================================
// CORRELATION ANALYSIS
// ============================================

/**
 * Find correlations between multiple metrics
 */
export async function findCorrelations(
  metrics: MetricData[],
  options: CorrelationOptions = {}
): Promise<CorrelationAnalysisResult> {
  const {
    minCorrelation = 0.7,
    includeBusinessContext = true,
  } = options;

  if (metrics.length < 2) {
    throw new Error('Need at least 2 metrics for correlation analysis');
  }

  const correlations: CorrelationPair[] = [];
  let totalPairs = 0;

  // Calculate correlations for all pairs
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      totalPairs++;

      const metric1 = metrics[i];
      const metric2 = metrics[j];

      // Align data by date
      const aligned = alignMetricsByDate(metric1.data, metric2.data);
      if (aligned.values1.length < 3) continue;

      try {
        const coefficient = calculatePearsonCorrelation(aligned.values1, aligned.values2);

        // Only include if correlation meets threshold
        if (Math.abs(coefficient) >= minCorrelation) {
          const absCoeff = Math.abs(coefficient);

          // Determine strength
          let strength: 'weak' | 'moderate' | 'strong' | 'very strong';
          if (absCoeff >= 0.9) {
            strength = 'very strong';
          } else if (absCoeff >= 0.7) {
            strength = 'strong';
          } else if (absCoeff >= 0.5) {
            strength = 'moderate';
          } else {
            strength = 'weak';
          }

          const direction = coefficient > 0 ? 'positive' : 'negative';

          // Get AI analysis of business implications
          let businessImplication = `${strength} ${direction} correlation detected`;
          let suggestedVisualization: 'scatter' | 'dual-axis-line' | 'stacked-area' = 'scatter';

          if (includeBusinessContext) {
            try {
              const prompt = `Analyze this correlation between metrics:

Metric 1: ${metric1.name}
Metric 2: ${metric2.name}
Correlation: ${coefficient.toFixed(3)} (${strength} ${direction})

Provide:
1. A brief business implication (1-2 sentences) explaining what this correlation means
2. Best visualization type: scatter, dual-axis-line, or stacked-area

Return as JSON with fields: implication (string), visualization (string)`;

              const response = await (await getAI()).models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: 'object',
                    properties: {
                      implication: { type: 'string' },
                      visualization: { type: 'string' }
                    }
                  }
                }
              });

              const parsed = JSON.parse(response.text);
              businessImplication = parsed.implication || businessImplication;
              if (['scatter', 'dual-axis-line', 'stacked-area'].includes(parsed.visualization)) {
                suggestedVisualization = parsed.visualization as any;
              }
            } catch (err) {
              console.error('Failed to get AI correlation context:', err);
            }
          }

          correlations.push({
            metric1: metric1.name,
            metric2: metric2.name,
            coefficient,
            strength,
            direction,
            businessImplication,
            suggestedVisualization,
          });
        }
      } catch (err) {
        console.error(`Failed to calculate correlation between ${metric1.name} and ${metric2.name}:`, err);
      }
    }
  }

  // Sort by absolute correlation coefficient (strongest first)
  correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

  return {
    correlations,
    totalPairsAnalyzed: totalPairs,
    significantCorrelations: correlations.length,
    methodology: 'Pearson correlation coefficient with AI business context analysis',
  };
}

/**
 * Align two metric datasets by date
 */
function alignMetricsByDate(
  data1: TimeSeriesDataPoint[],
  data2: TimeSeriesDataPoint[]
): { values1: number[]; values2: number[]; dates: string[] } {
  const map1 = new Map(data1.map(d => [d.date, d.value]));
  const map2 = new Map(data2.map(d => [d.date, d.value]));

  const commonDates = [...map1.keys()].filter(date => map2.has(date));

  return {
    values1: commonDates.map(date => map1.get(date)!),
    values2: commonDates.map(date => map2.get(date)!),
    dates: commonDates,
  };
}
