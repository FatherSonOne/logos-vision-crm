# Enhanced AI Insights Service

## Overview

The Enhanced AI Insights Service provides advanced analytics capabilities including forecasting, anomaly detection, and correlation analysis using statistical methods combined with AI-powered contextual analysis via the Gemini API.

## Features

### 1. Time Series Forecasting

Generate predictions for future values based on historical data with confidence intervals.

**Capabilities:**
- 3-month (90-day) forecasts by default
- Confidence intervals at 80% and 95% levels
- Trend detection (upward, downward, stable, cyclical)
- Seasonality detection and adjustment
- AI-generated business insights
- Expected accuracy estimation

**Usage:**

```typescript
import { generateForecast } from '../services/aiInsightsService';

const historicalData = [
  { date: '2024-01-01', value: 50000 },
  { date: '2024-01-02', value: 52000 },
  // ... more data
];

const forecast = await generateForecast(historicalData, {
  periodsAhead: 90,
  confidenceLevels: [0.80, 0.95],
  includeSeasonality: true,
});

console.log(forecast.predictions);
console.log(forecast.trend); // 'upward', 'downward', 'stable', 'cyclical'
console.log(forecast.aiAnalysis); // Business insights from AI
```

**Response Structure:**

```typescript
interface ForecastResult {
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
```

### 2. Anomaly Detection

Detect statistical outliers in your data with AI-powered explanations.

**Capabilities:**
- 3-sigma rule (configurable threshold)
- Z-score calculation for each data point
- Severity classification (minor, moderate, critical)
- AI-generated explanations for each anomaly
- Suggested actions for investigation

**Usage:**

```typescript
import { detectAnomalies } from '../services/aiInsightsService';

const data = [
  { date: '2024-01-01', value: 50000 },
  { date: '2024-01-02', value: 52000 },
  { date: '2024-01-03', value: 150000 }, // Anomaly!
  // ... more data
];

const anomalies = await detectAnomalies(data, {
  zScoreThreshold: 3,
  includeContext: true,
});

console.log(anomalies.anomalies); // Array of detected anomalies
console.log(anomalies.anomalyRate); // Percentage of data points that are anomalies
```

**Response Structure:**

```typescript
interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  totalDataPoints: number;
  anomalyRate: number; // Percentage
  methodology: string;
}

interface Anomaly {
  index: number;
  date: string;
  value: number;
  expectedValue: number;
  deviation: number;
  deviationPercentage: number;
  zScore: number;
  severity: 'minor' | 'moderate' | 'critical';
  explanation: string; // AI-generated
  suggestedActions: string[]; // AI-generated
}
```

### 3. Correlation Analysis

Find relationships between multiple metrics with business context.

**Capabilities:**
- Pearson correlation coefficient calculation
- Strength classification (weak, moderate, strong, very strong)
- Direction detection (positive, negative)
- AI-generated business implications
- Suggested visualization types

**Usage:**

```typescript
import { findCorrelations } from '../services/aiInsightsService';

const metrics = [
  {
    name: 'Total Donations',
    data: [
      { date: '2024-01-01', value: 50000 },
      { date: '2024-01-02', value: 52000 },
      // ... more data
    ],
  },
  {
    name: 'Active Donors',
    data: [
      { date: '2024-01-01', value: 120 },
      { date: '2024-01-02', value: 125 },
      // ... more data
    ],
  },
];

const correlations = await findCorrelations(metrics, {
  minCorrelation: 0.7,
  includeBusinessContext: true,
});

console.log(correlations.correlations); // Array of significant correlations
```

**Response Structure:**

```typescript
interface CorrelationAnalysisResult {
  correlations: CorrelationPair[];
  totalPairsAnalyzed: number;
  significantCorrelations: number;
  methodology: string;
}

interface CorrelationPair {
  metric1: string;
  metric2: string;
  coefficient: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong' | 'very strong';
  direction: 'positive' | 'negative';
  businessImplication: string; // AI-generated
  suggestedVisualization: 'scatter' | 'dual-axis-line' | 'stacked-area';
}
```

## Components

### AIInsightsPanelEnhanced

Main component that integrates all AI insights features with tabs.

**Props:**

```typescript
interface AIInsightsPanelEnhancedProps {
  insights?: AIInsight[];          // Traditional insights for Summary tab
  data?: TimeSeriesDataPoint[];    // Time series data for forecasting/anomalies
  metrics?: MetricData[];          // Multiple metrics for correlation analysis
  onDismiss?: (id: string) => void;
  onRefresh?: () => void;
}
```

**Usage:**

```tsx
<AIInsightsPanelEnhanced
  data={donationData}
  metrics={[
    { name: 'Donations', data: donationData },
    { name: 'Active Donors', data: activeDonorData },
  ]}
  insights={existingInsights}
  onRefresh={handleRefresh}
/>
```

### ForecastChart

Displays forecast data with historical values and confidence intervals.

**Props:**

```typescript
interface ForecastChartProps {
  historicalData: TimeSeriesDataPoint[];
  forecast: ForecastResult;
  title?: string;
  valueLabel?: string;
}
```

**Features:**
- Line chart with historical + predicted values
- Shaded confidence intervals (80% darker, 95% lighter)
- Vertical separator between historical and forecast
- Trend indicator and seasonality badge
- Methodology and AI analysis display

### AnomalyDetectionPanel

Displays detected anomalies with visualizations and suggested actions.

**Props:**

```typescript
interface AnomalyDetectionPanelProps {
  result: AnomalyDetectionResult;
  onDismissAnomaly?: (index: number) => void;
  showVisualization?: boolean;
}
```

**Features:**
- Scatter plot visualization of anomalies
- Severity-based color coding (critical, moderate, minor)
- Detailed anomaly cards with:
  - Data point details (actual vs. expected)
  - AI-generated explanations
  - Suggested actions for investigation
  - Dismiss functionality

### CorrelationMatrix

Displays correlation analysis with heatmap and detailed insights.

**Props:**

```typescript
interface CorrelationMatrixProps {
  result: CorrelationAnalysisResult;
  onVisualize?: (pair: CorrelationPair) => void;
}
```

**Features:**
- Heatmap visualization with color-coded correlation strength
- Click on cells to see detailed analysis
- Business implications for each correlation
- Suggested visualization type
- Strength and direction badges

## Statistical Utilities

The `src/utils/statistics.ts` file provides comprehensive statistical functions:

### Core Statistics
- `calculateMean(data)` - Average value
- `calculateStdDev(data)` - Standard deviation
- `calculateMedian(data)` - Median value
- `calculateVariance(data)` - Variance

### Correlation & Regression
- `calculatePearsonCorrelation(x, y)` - Correlation coefficient (-1 to 1)
- `calculateLinearRegression(x, y)` - Slope, intercept, and R²

### Outlier Detection
- `calculateZScore(value, mean, stdDev)` - Z-score calculation
- `detectOutliers(data, threshold)` - Find statistical outliers
- `calculateConfidenceInterval(data, level)` - Confidence intervals

### Time Series Analysis
- `detectTrend(data)` - Identify trend direction
- `detectSeasonality(data)` - Find seasonal patterns
- `calculateMovingAverage(data, window)` - Simple moving average
- `calculateEMA(data, alpha)` - Exponential moving average

## Integration with Gemini API

The service uses the Gemini API for AI-powered context and insights:

### Forecast Analysis
```typescript
const prompt = `Analyze this forecast data and provide business insights in 2-3 sentences:
Historical trend: ${trend}
Seasonality detected: ${seasonality.hasSeason}
Forecast accuracy: ${expectedAccuracy}%
...`;
```

### Anomaly Explanations
```typescript
const prompt = `Analyze this data anomaly and provide business context:
Value: ${outlier.value}
Expected range: ${mean ± 2σ}
Deviation: ${deviationPercentage}%
...`;
```

### Correlation Implications
```typescript
const prompt = `Analyze this correlation between metrics:
Metric 1: ${metric1.name}
Metric 2: ${metric2.name}
Correlation: ${coefficient} (${strength} ${direction})
...`;
```

## Best Practices

### Data Requirements
1. **Forecasting**: Minimum 3 data points, recommended 30+ for accuracy
2. **Anomaly Detection**: Minimum 3 data points, recommended 20+ for statistical significance
3. **Correlation Analysis**: Minimum 2 metrics with at least 3 aligned data points each

### Performance Optimization
1. Use the built-in caching for Gemini API responses
2. Debounce data updates to avoid excessive recalculations
3. Consider pagination for large anomaly lists
4. Implement lazy loading for correlation matrix with many metrics

### Error Handling
```typescript
try {
  const forecast = await generateForecast(data);
} catch (err) {
  if (err.message.includes('at least 3 data points')) {
    // Handle insufficient data
  }
  // Handle other errors
}
```

### Customization
1. Adjust Z-score threshold for anomaly sensitivity (2.5-3.5 recommended)
2. Modify confidence levels for forecasts (0.80, 0.90, 0.95, 0.99)
3. Set minimum correlation threshold based on your domain (0.5-0.8)
4. Configure forecast periods based on data frequency

## Example Implementation

See `src/components/reports/ai/AIInsightsDemo.tsx` for a complete working example with:
- Sample data generation
- All three analysis types
- Integration patterns
- Error handling

## API Reference

### generateForecast()
```typescript
async function generateForecast(
  historicalData: TimeSeriesDataPoint[],
  options?: ForecastOptions
): Promise<ForecastResult>
```

### detectAnomalies()
```typescript
async function detectAnomalies(
  data: TimeSeriesDataPoint[],
  options?: AnomalyOptions
): Promise<AnomalyDetectionResult>
```

### findCorrelations()
```typescript
async function findCorrelations(
  metrics: MetricData[],
  options?: CorrelationOptions
): Promise<CorrelationAnalysisResult>
```

## Testing

Run the demo to verify functionality:
```bash
npm run dev
# Navigate to the AI Insights Demo page
```

## Troubleshooting

### No insights generated
- Verify API key is set: `VITE_API_KEY` in `.env`
- Check data format matches `TimeSeriesDataPoint` interface
- Ensure minimum data requirements are met

### Low forecast accuracy
- Increase historical data points (30+ recommended)
- Check for data quality issues (missing values, outliers)
- Verify date alignment is correct

### No correlations found
- Lower `minCorrelation` threshold
- Ensure metrics have overlapping dates
- Check for sufficient data variance

## Future Enhancements

- [ ] Multi-step forecast with uncertainty quantification
- [ ] Real-time anomaly detection streaming
- [ ] Causal inference analysis
- [ ] Automated insight generation on schedule
- [ ] Custom ML model training for specific domains
- [ ] Interactive what-if scenario analysis
