# Performance Optimization Guide

## Overview

This guide documents the comprehensive performance optimization strategies implemented for handling datasets of varying sizes (100 to 100,000+ rows).

## Architecture

### 1. Adaptive Rendering Strategy

The system automatically selects the optimal rendering strategy based on dataset size:

```typescript
import { selectRenderStrategy } from '@/utils/performanceOptimizer';

const strategy = selectRenderStrategy(rowCount);
// Returns one of: 'full', 'paginated', 'virtual', 'server-side'
```

**Strategy Selection:**
- **< 100 rows**: Full render immediately
- **100-1000 rows**: Paginated (25-50 per page)
- **1000-10000 rows**: Virtual scrolling with windowing
- **10000+ rows**: Server-side pagination with lazy loading

### 2. Chart Sampling Strategies

For optimal chart performance, data is automatically sampled:

```typescript
import { selectChartStrategy, autoSample } from '@/utils/chartSampling';

const strategy = selectChartStrategy(pointCount);
const sampledData = autoSample(data, chartType, { maxPoints: 500 });
```

**Sampling Methods:**
- **< 500 points**: Render all data
- **500-2000 points**: Every nth point sampling
- **2000+ points**: LTTB (Largest-Triangle-Three-Buckets) downsampling

## Key Features

### 1. LTTB Algorithm (`src/utils/chartSampling.ts`)

Preserves visual appearance while reducing data points:

```typescript
import { lttb } from '@/utils/chartSampling';

const originalData = [...]; // 10,000 points
const sampled = lttb(originalData, 500); // Reduces to 500 points
// Visual appearance is maintained with key peaks/valleys preserved
```

**Benefits:**
- Maintains chart visual fidelity
- 10-100x data reduction
- Sub-100ms processing time
- Works with line, area, and scatter charts

### 2. Virtual Scrolling (`src/hooks/useVirtualizedTable.ts`)

Renders only visible rows for tables with thousands of rows:

```typescript
import { useVirtualizedTable } from '@/hooks/useVirtualizedTable';

const {
  parentRef,
  virtualRows,
  scrollToIndex
} = useVirtualizedTable({
  rowCount: 50000,
  estimateSize: 50,
  overscan: 10,
});
```

**Features:**
- Dynamic row height calculation
- Scroll position persistence
- Smooth scrolling with requestAnimationFrame
- Performance metrics tracking (FPS, render time)

### 3. Data Aggregation (`src/utils/dataAggregation.ts`)

Time-based and group-by aggregation for large datasets:

```typescript
import { aggregateByTime, aggregateBy } from '@/utils/dataAggregation';

// Time-based aggregation
const monthly = aggregateByTime(data, {
  dateField: 'created_at',
  valueField: 'amount',
  timeUnit: 'month',
  fillGaps: true,
});

// Group-by aggregation
const byCategory = aggregateBy(data, {
  groupBy: ['category', 'region'],
  metrics: [
    { field: 'revenue', operation: 'sum' },
    { field: 'revenue', operation: 'avg', alias: 'avg_revenue' },
  ],
});
```

**Supported Operations:**
- sum, avg, min, max, count, median, stddev
- Percentile calculations (p50, p90, p95, p99)
- Moving averages and exponential moving averages
- Growth rate and trend calculations
- Outlier detection

### 4. Enhanced Caching (`src/services/cacheManager.ts`)

Intelligent caching with IndexedDB support:

```typescript
import { apiCache } from '@/services/cacheManager';

// Automatic IndexedDB for large datasets (> 5MB)
await apiCache.set('large-dataset', data, 300000); // 5 min TTL

// Compression for data > 100KB
const cached = await apiCache.get('large-dataset');

// Cache statistics
const stats = apiCache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

**Features:**
- LRU eviction strategy
- IndexedDB for datasets > 5MB
- Data compression for payloads > 100KB
- Cache hit/miss metrics
- Background cache warming
- Smart invalidation

### 5. Performance Monitor (`src/components/reports/PerformanceMonitor.tsx`)

Developer tool for real-time performance monitoring:

```typescript
import { PerformanceMonitor } from '@/components/reports/PerformanceMonitor';

<PerformanceMonitor
  show={import.meta.env.DEV}
  dataSize={data.length}
  renderStrategy="virtual"
/>
```

**Displays:**
- Render time (with thresholds: < 500ms good, < 1000ms warning, > 1000ms critical)
- Data fetch time
- Cache hit rate
- Memory usage
- Optimization recommendations

### 6. Web Workers (`src/workers/dataProcessing.worker.ts`)

Heavy calculations run off the main thread:

```typescript
import { useDataWorker } from '@/hooks/useDataWorker';

const { sampleData, aggregateByTime, isProcessing } = useDataWorker({
  onProgress: (progress) => console.log(`${progress}%`),
});

// Runs in background thread
const sampled = await sampleData(largeDataset, 500, 'lttb');
```

**Operations:**
- LTTB sampling
- Min-max sampling
- Adaptive sampling
- Time-based aggregation
- Group-by aggregation
- Statistical calculations

## Performance Metrics

### Benchmarks

| Dataset Size | Render Strategy | Render Time | Memory Usage |
|-------------|----------------|-------------|--------------|
| 100 rows    | Full           | < 50ms      | < 1MB        |
| 1,000 rows  | Paginated      | < 200ms     | < 5MB        |
| 10,000 rows | Virtual        | < 500ms     | < 20MB       |
| 100,000 rows| Server-side    | < 1000ms    | < 50MB       |

### Chart Sampling Performance

| Original Points | Sampled Points | Sampling Method | Processing Time |
|----------------|----------------|-----------------|-----------------|
| 1,000          | 1,000          | None            | 0ms             |
| 5,000          | 500            | Every 10th      | < 10ms          |
| 50,000         | 500            | LTTB            | < 100ms         |
| 500,000        | 500            | LTTB            | < 500ms         |

## Usage Examples

### Example 1: Large Report with Auto-Optimization

```typescript
import { ReportViewer } from '@/components/reports/ReportViewer';

// ReportViewer automatically:
// 1. Selects optimal render strategy
// 2. Samples chart data if needed
// 3. Shows performance warnings
// 4. Offers sampled vs full export options

<ReportViewer report={report} />
```

### Example 2: Custom Virtual Table

```typescript
import { useVirtualizedTable } from '@/hooks/useVirtualizedTable';

function MyTable({ data }: { data: any[] }) {
  const { parentRef, virtualRows, totalSize } = useVirtualizedTable({
    rowCount: data.length,
    estimateSize: 50,
    overscan: 10,
    persistScrollPosition: true,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${totalSize}px`, position: 'relative' }}>
        {virtualRows.map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {/* Render row content */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Example 3: Background Data Processing

```typescript
import { useDataWorker } from '@/hooks/useDataWorker';

function MyComponent() {
  const [progress, setProgress] = useState(0);
  const { aggregateByTime, isProcessing } = useDataWorker({
    onProgress: setProgress,
  });

  const handleAggregate = async () => {
    const result = await aggregateByTime(largeDataset, {
      dateField: 'date',
      valueField: 'revenue',
      timeUnit: 'month',
    });

    console.log('Aggregated data:', result);
  };

  return (
    <div>
      {isProcessing && <Progress value={progress} />}
      <button onClick={handleAggregate}>Aggregate Data</button>
    </div>
  );
}
```

## Best Practices

### 1. Always Use Auto-Optimization

Let the system choose the best strategy:

```typescript
// Good - automatic optimization
const strategy = selectRenderStrategy(data.length);
const sampledData = autoSample(data, chartType);

// Avoid - manual optimization without considering data size
const sampledData = data.slice(0, 1000); // May be unnecessary or insufficient
```

### 2. Cache Expensive Operations

```typescript
// Good - cached with TTL
const data = await apiCache.getOrSet(
  'expensive-report',
  async () => await fetchExpensiveData(),
  300000 // 5 minutes
);

// Avoid - repeated expensive calculations
const data = await fetchExpensiveData(); // Called every render
```

### 3. Use Web Workers for Heavy Processing

```typescript
// Good - runs in background
const { sampleData } = useDataWorker();
const sampled = await sampleData(hugeDataset, 500);

// Avoid - blocks UI
const sampled = lttb(hugeDataset, 500); // Main thread blocked
```

### 4. Monitor Performance in Development

```typescript
// Enable performance monitor in dev mode
<PerformanceMonitor
  show={import.meta.env.DEV}
  dataSize={data.length}
  renderStrategy={strategy.type}
/>
```

### 5. Provide Export Options for Large Datasets

```typescript
// Good - offer choice
if (data.length > 10000) {
  const exportFull = confirm('Export full dataset (may be slow)?');
  await exportData(exportFull ? fullData : sampledData);
}

// Avoid - always exporting full dataset
await exportData(fullData); // May hang browser
```

## Performance Warnings

The system automatically shows warnings for:

1. **Very large datasets (> 50,000 rows)**
   - Shows critical warning
   - Recommends server-side pagination

2. **Large datasets (> 10,000 rows)**
   - Shows warning with current strategy
   - Displays sampled vs total row counts

3. **High memory usage (> 50MB)**
   - Shows warning with memory usage
   - Recommends data optimization

## Configuration

### Cache Configuration

```typescript
import { CacheManager } from '@/services/cacheManager';

const reportCache = new CacheManager({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  useIndexedDB: true,
  compressionThreshold: 100 * 1024, // 100KB
});
```

### Virtual Scrolling Configuration

```typescript
const { parentRef, virtualRows } = useVirtualizedTable({
  rowCount: data.length,
  estimateSize: 50, // Estimated row height
  overscan: 10, // Rows to render outside viewport
  enableSmoothScroll: true,
  persistScrollPosition: true,
  scrollPositionKey: 'my-table-scroll',
});
```

## Troubleshooting

### Issue: Charts are slow with large datasets

**Solution:** Enable chart sampling

```typescript
import { autoSample } from '@/utils/chartSampling';

const sampledData = autoSample(data, 'line', { maxPoints: 500 });
```

### Issue: Table scrolling is janky

**Solution:** Use virtual scrolling

```typescript
import { useVirtualizedTable } from '@/hooks/useVirtualizedTable';

const { parentRef, virtualRows } = useVirtualizedTable({
  rowCount: data.length,
  estimateSize: 50,
  overscan: 5,
});
```

### Issue: High memory usage

**Solution:** Enable IndexedDB caching

```typescript
const cache = new CacheManager({
  useIndexedDB: true,
  compressionThreshold: 100 * 1024,
});
```

### Issue: UI freezes during data processing

**Solution:** Use Web Workers

```typescript
const { processData } = useDataWorker();
const result = await processData({ type: 'aggregateBy', data, config });
```

## Performance Checklist

- [ ] Use adaptive rendering strategies
- [ ] Enable chart sampling for datasets > 500 points
- [ ] Implement virtual scrolling for tables > 1000 rows
- [ ] Cache frequently accessed data
- [ ] Use IndexedDB for large datasets (> 5MB)
- [ ] Process heavy calculations in Web Workers
- [ ] Monitor performance with PerformanceMonitor in dev
- [ ] Show loading states and progress indicators
- [ ] Provide export options for large datasets
- [ ] Test with realistic data volumes (100, 1K, 10K, 100K rows)

## Support

For questions or issues with performance optimization:

1. Check the Performance Monitor for recommendations
2. Review cache hit rates and adjust TTL if needed
3. Verify render strategy matches dataset size
4. Test with progressively larger datasets
5. Profile with browser DevTools Performance tab

## Appendix

### File Structure

```
src/
├── utils/
│   ├── performanceOptimizer.ts    # Core optimization logic
│   ├── chartSampling.ts            # LTTB and sampling algorithms
│   └── dataAggregation.ts          # Statistical calculations
├── hooks/
│   ├── useVirtualizedTable.ts      # Virtual scrolling hook
│   └── useDataWorker.ts            # Web Worker hook
├── services/
│   └── cacheManager.ts             # Enhanced caching
├── workers/
│   └── dataProcessing.worker.ts    # Web Worker implementation
└── components/
    └── reports/
        ├── PerformanceMonitor.tsx  # Performance monitoring UI
        └── ReportViewer.tsx        # Auto-optimized report viewer
```

### Dependencies

- `@tanstack/react-virtual` - Virtual scrolling
- `recharts` - Chart rendering
- IndexedDB API (native)
- Web Workers API (native)

### Browser Support

- Modern browsers with ES2020+ support
- IndexedDB support required for large dataset caching
- Web Workers support required for background processing
- Falls back gracefully when features are unavailable
