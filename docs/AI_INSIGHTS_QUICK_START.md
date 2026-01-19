# AI Insights Quick Start Guide

## Installation

All dependencies are already included in the project. The AI Insights service uses:
- Google Gemini API (configured via `VITE_API_KEY`)
- Recharts for visualizations (already installed)
- TypeScript statistical utilities (built-in)

## Quick Start

### 1. Basic Forecasting

```typescript
import { generateForecast } from './services/aiInsightsService';
import { ForecastChart } from './components/reports/ai';

// Your historical data
const donationData = [
  { date: '2024-01-01', value: 50000 },
  { date: '2024-01-02', value: 52000 },
  { date: '2024-01-03', value: 51500 },
  // ... more data points (minimum 3, recommended 30+)
];

// Generate forecast
const forecast = await generateForecast(donationData);

// Display with chart
<ForecastChart
  historicalData={donationData}
  forecast={forecast}
  title="Donation Forecast"
/>
```

### 2. Anomaly Detection

```typescript
import { detectAnomalies } from './services/aiInsightsService';
import { AnomalyDetectionPanel } from './components/reports/ai';

// Detect anomalies in your data
const anomalies = await detectAnomalies(donationData, {
  zScoreThreshold: 3,
  includeContext: true,
});

// Display with panel
<AnomalyDetectionPanel
  result={anomalies}
  showVisualization={true}
  onDismissAnomaly={(index) => console.log('Dismissed:', index)}
/>
```

### 3. Correlation Analysis

```typescript
import { findCorrelations } from './services/aiInsightsService';
import { CorrelationMatrix } from './components/reports/ai';

// Define your metrics
const metrics = [
  { name: 'Total Donations', data: donationData },
  { name: 'Active Donors', data: activeDonorData },
  { name: 'Email Open Rate', data: emailData },
];

// Find correlations
const correlations = await findCorrelations(metrics, {
  minCorrelation: 0.7,
  includeBusinessContext: true,
});

// Display with matrix
<CorrelationMatrix
  result={correlations}
  onVisualize={(pair) => console.log('Visualize:', pair)}
/>
```

### 4. Complete Integration (All Features)

```typescript
import AIInsightsPanelEnhanced from './components/reports/AIInsightsPanelEnhanced';

function MyReportsPage() {
  const [donationData, setDonationData] = useState([]);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    // Load your data from API
    loadDonationData().then(setDonationData);
    loadMetrics().then(setMetrics);
  }, []);

  return (
    <AIInsightsPanelEnhanced
      data={donationData}
      metrics={metrics}
      insights={[]} // Optional: existing AI insights
      onRefresh={() => {
        // Refresh data
        loadDonationData().then(setDonationData);
      }}
    />
  );
}
```

## Data Format

### Time Series Data Point
```typescript
interface TimeSeriesDataPoint {
  date: string;      // ISO date string: '2024-01-01'
  value: number;     // Numeric value
  label?: string;    // Optional label for display
}
```

### Metric Data (for correlations)
```typescript
interface MetricData {
  name: string;                      // Metric name
  data: TimeSeriesDataPoint[];       // Time series data
}
```

## Common Patterns

### Pattern 1: Real-time Dashboard

```typescript
function DashboardWithAI() {
  const [data, setData] = useState([]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const newData = await fetchLatestData();
      setData(newData);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return <AIInsightsPanelEnhanced data={data} />;
}
```

### Pattern 2: Custom Thresholds

```typescript
// More sensitive anomaly detection
const anomalies = await detectAnomalies(data, {
  zScoreThreshold: 2.5, // Lower = more sensitive
});

// Stricter correlation requirements
const correlations = await findCorrelations(metrics, {
  minCorrelation: 0.8, // Higher = stricter
});

// Longer forecast period
const forecast = await generateForecast(data, {
  periodsAhead: 180, // 6 months instead of 3
  confidenceLevels: [0.90, 0.99], // Higher confidence
});
```

### Pattern 3: Error Handling

```typescript
async function safeAnalysis() {
  try {
    const forecast = await generateForecast(data);
    return { success: true, forecast };
  } catch (err) {
    if (err.message.includes('at least 3 data points')) {
      return { success: false, error: 'Insufficient data' };
    }
    return { success: false, error: 'Analysis failed' };
  }
}
```

### Pattern 4: Conditional Analysis

```typescript
function SmartAnalysis({ data, metrics }) {
  const [results, setResults] = useState({});

  useEffect(() => {
    async function analyze() {
      const newResults = {};

      // Only forecast if enough data
      if (data.length >= 30) {
        newResults.forecast = await generateForecast(data);
      }

      // Only detect anomalies if data is stable enough
      if (data.length >= 20) {
        newResults.anomalies = await detectAnomalies(data);
      }

      // Only correlations if multiple metrics
      if (metrics.length >= 2) {
        newResults.correlations = await findCorrelations(metrics);
      }

      setResults(newResults);
    }

    analyze();
  }, [data, metrics]);

  return (
    <>
      {results.forecast && <ForecastChart forecast={results.forecast} />}
      {results.anomalies && <AnomalyDetectionPanel result={results.anomalies} />}
      {results.correlations && <CorrelationMatrix result={results.correlations} />}
    </>
  );
}
```

## Performance Tips

### 1. Debounce Data Updates

```typescript
import { debounce } from 'lodash';

const debouncedAnalysis = debounce(async (data) => {
  const forecast = await generateForecast(data);
  setForecast(forecast);
}, 1000); // Wait 1 second after last data change

useEffect(() => {
  if (data.length >= 3) {
    debouncedAnalysis(data);
  }
}, [data]);
```

### 2. Memoize Expensive Calculations

```typescript
import { useMemo } from 'react';

const forecast = useMemo(() => {
  if (data.length < 3) return null;
  return generateForecast(data);
}, [data]); // Only recalculate when data changes
```

### 3. Lazy Load Components

```typescript
import { lazy, Suspense } from 'react';

const AIInsightsPanelEnhanced = lazy(() =>
  import('./components/reports/AIInsightsPanelEnhanced')
);

function MyPage() {
  return (
    <Suspense fallback={<div>Loading AI insights...</div>}>
      <AIInsightsPanelEnhanced data={data} />
    </Suspense>
  );
}
```

## Testing

### Test with Sample Data

```typescript
import { AIInsightsDemo } from './components/reports/ai';

// Use the demo component to test
<AIInsightsDemo />
```

### Verify API Key

```typescript
console.log('API Key configured:', !!import.meta.env.VITE_API_KEY);
```

### Check Data Format

```typescript
function validateData(data: TimeSeriesDataPoint[]) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  data.forEach((point, i) => {
    if (!point.date || !point.value) {
      throw new Error(`Invalid data point at index ${i}`);
    }

    // Validate date format
    if (isNaN(new Date(point.date).getTime())) {
      throw new Error(`Invalid date at index ${i}: ${point.date}`);
    }

    // Validate numeric value
    if (typeof point.value !== 'number' || isNaN(point.value)) {
      throw new Error(`Invalid value at index ${i}: ${point.value}`);
    }
  });

  return true;
}
```

## Troubleshooting

### No forecast generated
✓ Check: Minimum 3 data points
✓ Check: Valid date format (ISO string)
✓ Check: Numeric values (not NaN)
✓ Check: API key is set

### Anomalies not detected
✓ Lower z-score threshold (try 2.5)
✓ Ensure data has variance
✓ Check for minimum 3 data points

### No correlations found
✓ Lower minimum correlation (try 0.5)
✓ Ensure metrics have overlapping dates
✓ Check data alignment

### API errors
✓ Verify VITE_API_KEY in .env
✓ Check Gemini API quota
✓ Review console for detailed errors

## Next Steps

1. Read the full documentation: `docs/AI_INSIGHTS_ENHANCED.md`
2. Explore statistical utilities: `src/utils/statistics.ts`
3. Check the demo: `src/components/reports/ai/AIInsightsDemo.tsx`
4. Review the service: `src/services/aiInsightsService.ts`

## Support

For issues or questions:
- Check the console for detailed error messages
- Review the TypeScript types for expected data formats
- Test with the included demo component
- Verify your Gemini API key is valid
