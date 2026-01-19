# AI Insights Service - Enhanced Analytics

> Advanced forecasting, anomaly detection, and correlation analysis powered by statistical methods and Google Gemini AI

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [File Structure](#file-structure)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

The Enhanced AI Insights Service provides three powerful analytics capabilities:

1. **Forecasting** - Predict future trends with confidence intervals
2. **Anomaly Detection** - Identify unusual data points with AI explanations
3. **Correlation Analysis** - Discover relationships between metrics

All features combine statistical analysis with AI-powered business context from Google Gemini.

## Features

### Time Series Forecasting
- 3-month predictions with 80% and 95% confidence intervals
- Automatic trend detection (upward, downward, stable, cyclical)
- Seasonality detection and adjustment
- Expected accuracy estimation
- AI-generated business insights

### Anomaly Detection
- Statistical outlier detection using 3-sigma rule
- Severity classification (minor, moderate, critical)
- Z-score calculation for each data point
- AI-powered explanations for anomalies
- Suggested investigation actions

### Correlation Analysis
- Pearson correlation coefficients between metrics
- Strength and direction classification
- AI-generated business implications
- Suggested visualization types
- Interactive heatmap matrix

## Quick Start

### 1. View the Demo

```bash
# Start the development server
npm run dev

# Navigate to the demo page
# http://localhost:5173/ai-insights-demo
```

### 2. Basic Usage

```typescript
import AIInsightsPanelEnhanced from './components/reports/AIInsightsPanelEnhanced';
import { TimeSeriesDataPoint, MetricData } from './services/aiInsightsService';

// Prepare your data
const donationData: TimeSeriesDataPoint[] = [
  { date: '2024-01-01', value: 50000 },
  { date: '2024-01-02', value: 52000 },
  // ... more data points
];

const metrics: MetricData[] = [
  { name: 'Total Donations', data: donationData },
  { name: 'Active Donors', data: activeDonorData },
];

// Use the component
function MyReportsPage() {
  return (
    <AIInsightsPanelEnhanced
      data={donationData}
      metrics={metrics}
      onRefresh={() => console.log('Refreshing...')}
    />
  );
}
```

### 3. Individual Features

```typescript
import { generateForecast, detectAnomalies, findCorrelations } from './services/aiInsightsService';

// Generate forecast
const forecast = await generateForecast(donationData);

// Detect anomalies
const anomalies = await detectAnomalies(donationData);

// Find correlations
const correlations = await findCorrelations(metrics);
```

## Documentation

### Comprehensive Guides

- **[Full Documentation](docs/AI_INSIGHTS_ENHANCED.md)** - Complete API reference and methodology
- **[Quick Start Guide](docs/AI_INSIGHTS_QUICK_START.md)** - Get started in 5 minutes
- **[Architecture Diagram](docs/AI_INSIGHTS_ARCHITECTURE.md)** - System design and data flow
- **[Integration Checklist](AI_INSIGHTS_INTEGRATION_CHECKLIST.md)** - Step-by-step integration
- **[Implementation Summary](AI_INSIGHTS_IMPLEMENTATION_SUMMARY.md)** - What was built and why

### Key Concepts

#### Time Series Data Format
```typescript
interface TimeSeriesDataPoint {
  date: string;      // ISO date: '2024-01-01'
  value: number;     // Numeric value
  label?: string;    // Optional label
}
```

#### Metric Data Format
```typescript
interface MetricData {
  name: string;                // Metric name
  data: TimeSeriesDataPoint[]; // Time series data
}
```

## File Structure

```
src/
├── services/
│   └── aiInsightsService.ts          # Core AI insights service
├── utils/
│   └── statistics.ts                  # Statistical utilities
└── components/
    └── reports/
        ├── AIInsightsPanelEnhanced.tsx    # Main enhanced panel
        └── ai/
            ├── ForecastChart.tsx          # Forecast visualization
            ├── AnomalyDetectionPanel.tsx  # Anomaly detection UI
            ├── CorrelationMatrix.tsx      # Correlation heatmap
            ├── AIInsightsDemo.tsx         # Demo component
            └── index.ts                   # Barrel exports

docs/
├── AI_INSIGHTS_ENHANCED.md           # Full documentation
├── AI_INSIGHTS_QUICK_START.md        # Quick start guide
└── AI_INSIGHTS_ARCHITECTURE.md       # Architecture diagrams

AI_INSIGHTS_IMPLEMENTATION_SUMMARY.md  # Implementation details
AI_INSIGHTS_INTEGRATION_CHECKLIST.md   # Integration guide
AI_INSIGHTS_README.md                  # This file
```

## Usage Examples

### Example 1: Donation Forecasting

```typescript
import { generateForecast } from './services/aiInsightsService';
import ForecastChart from './components/reports/ai/ForecastChart';

async function DonationForecast({ donations }) {
  const data = donations.map(d => ({
    date: d.donationDate,
    value: d.amount,
  }));

  const forecast = await generateForecast(data, {
    periodsAhead: 90,        // 3 months
    confidenceLevels: [0.80, 0.95],
    includeSeasonality: true,
  });

  return (
    <ForecastChart
      historicalData={data}
      forecast={forecast}
      title="Donation Forecast - Next 3 Months"
    />
  );
}
```

### Example 2: Detecting Donation Anomalies

```typescript
import { detectAnomalies } from './services/aiInsightsService';
import AnomalyDetectionPanel from './components/reports/ai/AnomalyDetectionPanel';

async function DonationAnomalies({ donations }) {
  const data = donations.map(d => ({
    date: d.donationDate,
    value: d.amount,
  }));

  const anomalies = await detectAnomalies(data, {
    zScoreThreshold: 3,
    includeContext: true,
  });

  return (
    <AnomalyDetectionPanel
      result={anomalies}
      showVisualization={true}
      onDismissAnomaly={(index) => {
        console.log('Dismissed anomaly:', index);
      }}
    />
  );
}
```

### Example 3: Finding Metric Correlations

```typescript
import { findCorrelations } from './services/aiInsightsService';
import CorrelationMatrix from './components/reports/ai/CorrelationMatrix';

async function MetricCorrelations({ donations, donors, emails }) {
  const metrics = [
    {
      name: 'Total Donations',
      data: donations.map(d => ({ date: d.date, value: d.amount })),
    },
    {
      name: 'Active Donors',
      data: donors.map(d => ({ date: d.date, value: d.count })),
    },
    {
      name: 'Email Open Rate',
      data: emails.map(d => ({ date: d.date, value: d.openRate })),
    },
  ];

  const correlations = await findCorrelations(metrics, {
    minCorrelation: 0.7,
    includeBusinessContext: true,
  });

  return (
    <CorrelationMatrix
      result={correlations}
      onVisualize={(pair) => {
        console.log('Visualize correlation:', pair);
      }}
    />
  );
}
```

## Integration Guide

### Step 1: Check Prerequisites

```bash
# Verify dependencies
npm list recharts @google/genai react

# Verify API key
grep VITE_API_KEY .env
```

### Step 2: Import Components

```typescript
// Single enhanced panel with all features
import AIInsightsPanelEnhanced from './components/reports/AIInsightsPanelEnhanced';

// OR individual components
import {
  ForecastChart,
  AnomalyDetectionPanel,
  CorrelationMatrix,
} from './components/reports/ai';

// Service functions
import {
  generateForecast,
  detectAnomalies,
  findCorrelations,
} from './services/aiInsightsService';
```

### Step 3: Prepare Data

```typescript
// Convert your data to the required format
const timeSeriesData: TimeSeriesDataPoint[] = yourData.map(item => ({
  date: item.date,  // Must be ISO string
  value: item.value, // Must be number
}));

// For correlations, prepare multiple metrics
const metrics: MetricData[] = [
  { name: 'Metric 1', data: data1 },
  { name: 'Metric 2', data: data2 },
];
```

### Step 4: Use Components

```typescript
function MyReportsPage() {
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);

  return (
    <AIInsightsPanelEnhanced
      data={data}
      metrics={metrics}
      onRefresh={() => {
        // Reload data
        loadData().then(setData);
      }}
    />
  );
}
```

### Step 5: Test Integration

1. Navigate to your reports page
2. Verify all tabs render correctly
3. Check console for errors
4. Test with sample data first
5. Deploy to production

See [Integration Checklist](AI_INSIGHTS_INTEGRATION_CHECKLIST.md) for detailed steps.

## API Reference

### generateForecast()

Generate time series forecast with confidence intervals.

```typescript
async function generateForecast(
  historicalData: TimeSeriesDataPoint[],
  options?: {
    periodsAhead?: number;          // Default: 90 days
    confidenceLevels?: number[];    // Default: [0.80, 0.95]
    includeSeasonality?: boolean;   // Default: true
  }
): Promise<ForecastResult>
```

**Returns:**
```typescript
interface ForecastResult {
  predictions: ForecastPrediction[];
  trend: 'upward' | 'downward' | 'stable' | 'cyclical';
  seasonality: { detected: boolean; period?: number; description?: string };
  methodology: string;
  expectedAccuracy: number;
  aiAnalysis?: string;
}
```

### detectAnomalies()

Detect statistical outliers with AI explanations.

```typescript
async function detectAnomalies(
  data: TimeSeriesDataPoint[],
  options?: {
    zScoreThreshold?: number;     // Default: 3
    includeContext?: boolean;     // Default: true
  }
): Promise<AnomalyDetectionResult>
```

**Returns:**
```typescript
interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  totalDataPoints: number;
  anomalyRate: number;
  methodology: string;
}
```

### findCorrelations()

Find correlations between multiple metrics.

```typescript
async function findCorrelations(
  metrics: MetricData[],
  options?: {
    minCorrelation?: number;          // Default: 0.7
    includeBusinessContext?: boolean; // Default: true
  }
): Promise<CorrelationAnalysisResult>
```

**Returns:**
```typescript
interface CorrelationAnalysisResult {
  correlations: CorrelationPair[];
  totalPairsAnalyzed: number;
  significantCorrelations: number;
  methodology: string;
}
```

## Troubleshooting

### Common Issues

#### No forecasts generated
- Ensure minimum 3 data points
- Verify date format (ISO string)
- Check for numeric values (not NaN)
- Confirm API key is set

#### AI analysis missing
- Verify `VITE_API_KEY` in .env
- Check API quota in Google Cloud Console
- Review network tab for failed requests

#### Anomalies not detected
- Lower z-score threshold (try 2.5)
- Ensure data has variance
- Check data is not pre-normalized

#### No correlations found
- Lower minimum correlation (try 0.5)
- Ensure metrics have overlapping dates
- Verify data alignment

### Getting Help

1. Check [Troubleshooting Guide](docs/AI_INSIGHTS_ENHANCED.md#troubleshooting)
2. Review console errors
3. Test with [Demo Component](src/components/reports/ai/AIInsightsDemo.tsx)
4. Check [Integration Checklist](AI_INSIGHTS_INTEGRATION_CHECKLIST.md)

## Performance Tips

1. **Debounce data updates** - Wait 1-2 seconds after last change
2. **Memoize calculations** - Use React.useMemo for expensive operations
3. **Implement caching** - Store AI responses in localStorage
4. **Lazy load components** - Use React.lazy for code splitting
5. **Paginate results** - For large anomaly/correlation lists

## Best Practices

1. **Data Quality** - Ensure clean, consistent data
2. **Sufficient Data** - Use 30+ points for forecasting
3. **Regular Updates** - Refresh insights periodically
4. **User Feedback** - Gather input on insight relevance
5. **Monitor Performance** - Track API usage and costs

## Contributing

To extend the AI Insights Service:

1. Review [Architecture Diagram](docs/AI_INSIGHTS_ARCHITECTURE.md)
2. Understand [Statistical Utilities](src/utils/statistics.ts)
3. Follow existing patterns in [Service](src/services/aiInsightsService.ts)
4. Add tests for new features
5. Update documentation

## License

Part of the Logos Vision CRM system.

---

**Version:** 1.0.0
**Last Updated:** 2024-01-17
**Status:** Production Ready

For more information, see the [Full Documentation](docs/AI_INSIGHTS_ENHANCED.md).
