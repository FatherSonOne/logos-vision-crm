# Export Performance Monitoring System

## Overview

The Export Performance Monitoring System tracks and analyzes export operations across different formats (CSV, Excel, PDF, PNG, JSON), providing performance insights, recommendations, and time estimates to help users make informed decisions about data exports.

## Architecture

### Components

1. **ExportPerformanceMonitor** - Core monitoring singleton that tracks metrics
2. **ExportService** - Service layer with integrated performance tracking
3. **ExportPerformanceWidget** - React component for visualizing performance data
4. **FormatSelectorWithRecommendations** - Smart format selector with recommendations

### File Structure

```
src/services/reports/export/
├── ExportPerformanceMonitor.ts  # Core monitoring class
├── ExportService.ts              # Export service with tracking
└── index.ts                      # Exports

src/components/reports/
└── ExportPerformanceWidget.tsx   # Performance visualization
```

## Features

### 1. Performance Metrics Tracking

Automatically records for each export:
- Export format (CSV, Excel, PDF, PNG, JSON)
- Row count
- Execution time (milliseconds)
- File size (bytes)
- Success/failure status
- Error messages (if failed)
- Timestamp

### 2. Statistical Analysis

Provides comprehensive statistics by format:
- Total exports
- Success/failure counts
- Success rate percentage
- Average execution time
- Median execution time
- Min/max execution times
- Average row count
- Average file size
- Total file size

### 3. Time Estimation

Predicts export duration based on:
- Historical data (high confidence)
- Linear regression (medium confidence)
- Theoretical characteristics (low confidence)

Returns:
- Estimated time in milliseconds
- Confidence level
- Number of samples used
- Time range (min/max)

### 4. Smart Recommendations

Analyzes exports and provides recommendations:
- **Warnings**: Dataset too large for format
- **Optimizations**: Suggest faster formats
- **Info**: Format-specific tips
- **Performance**: Historical performance issues

### 5. Format Comparison

Compares all formats for a given dataset size:
- Estimated time for each format
- Recommendations for each format
- Sorted by performance

## Usage

### Basic Integration

```typescript
import { exportPerformanceMonitor } from '@/services/reports/export';

// Record a metric after export
async function exportData(data: any[], format: ExportFormat) {
  const startTime = performance.now();
  const rowCount = data.length;

  try {
    // Perform export
    const blob = await performExport(data, format);

    // Record success
    const executionTime = performance.now() - startTime;
    exportPerformanceMonitor.recordMetric(
      format,
      rowCount,
      executionTime,
      blob.size,
      true
    );

    return blob;
  } catch (error) {
    // Record failure
    const executionTime = performance.now() - startTime;
    exportPerformanceMonitor.recordMetric(
      format,
      rowCount,
      executionTime,
      0,
      false,
      error.message
    );
    throw error;
  }
}
```

### Get Recommendations Before Export

```typescript
import { exportPerformanceMonitor } from '@/services/reports/export';

function showExportDialog(rowCount: number) {
  const format = 'pdf';

  // Get recommendations
  const recommendations = exportPerformanceMonitor.getRecommendations(
    format,
    rowCount
  );

  // Get time estimate
  const estimate = exportPerformanceMonitor.estimateTime(format, rowCount);

  console.log(`Estimated time: ${estimate.estimatedTimeMs}ms`);
  console.log(`Confidence: ${estimate.confidence}`);
  console.log(`Recommendations:`, recommendations);
}
```

### Compare All Formats

```typescript
import { exportPerformanceMonitor } from '@/services/reports/export';

function compareFormats(rowCount: number) {
  const comparison = exportPerformanceMonitor.compareFormats(rowCount);

  comparison.forEach(({ format, estimate, recommendation }) => {
    console.log(`${format.toUpperCase()}`);
    console.log(`  Time: ${estimate.estimatedTimeMs}ms`);
    console.log(`  ${recommendation}`);
  });
}
```

### Get Statistics

```typescript
import { exportPerformanceMonitor } from '@/services/reports/export';

// Get stats for all formats
const allStats = exportPerformanceMonitor.getStats();

// Get stats for specific format
const csvStats = exportPerformanceMonitor.getStats('csv');

// Get summary
const summary = exportPerformanceMonitor.getSummary();
console.log(`Total exports: ${summary.totalExports}`);
console.log(`Success rate: ${summary.successfulExports / summary.totalExports * 100}%`);
console.log(`Average time: ${summary.averageTimeMs}ms`);
console.log(`Most used format: ${summary.mostUsedFormat}`);
console.log(`Fastest format: ${summary.fastestFormat}`);
```

### Using the Export Service

```typescript
import { exportService } from '@/services/reports/export';

// Export to CSV
await exportService.exportToCSV(data, 'report.csv');

// Export to Excel
await exportService.exportToExcel(data, 'report.xlsx');

// Export to PDF
await exportService.exportToPDF(data, 'report.pdf', 'My Report');

// Export to JSON
await exportService.exportToJSON(data, 'report.json');

// Get recommendations before export
const { recommendations, estimate } = exportService.getExportRecommendations(
  'pdf',
  1000
);

// Get format comparison
const comparison = exportService.getFormatComparison(1000);
```

### React Components

```tsx
import { ExportPerformanceWidget, FormatSelectorWithRecommendations } from '@/components/reports/ExportPerformanceWidget';

// Show performance dashboard
<ExportPerformanceWidget />

// Smart format selector
<FormatSelectorWithRecommendations
  rowCount={1000}
  onFormatSelect={(format) => {
    console.log(`User selected: ${format}`);
    // Perform export
  }}
/>
```

## Performance Thresholds

### Slow Export Warning

Exports taking longer than **5 seconds** trigger a warning in the console:

```
[ExportPerformanceMonitor] Slow export detected: pdf format took 6234ms for 1500 rows
```

### Dataset Size Thresholds

- **Large dataset**: > 10,000 rows
- **Medium dataset**: > 1,000 rows

### Recommended Maximum Rows by Format

| Format | Recommended Max | Reason |
|--------|-----------------|--------|
| CSV | 50,000 | Fast, efficient for large datasets |
| Excel | 10,000 | Complex formatting overhead |
| PDF | 5,000 | Rendering overhead |
| PNG | 5,000 | Visual rendering |
| JSON | 100,000 | Minimal overhead |

## Format Characteristics

### CSV
- **Base overhead**: 50ms
- **Time per row**: 0.1ms
- **Compression ratio**: 0.7
- **Best for**: Large datasets, simple data

### Excel
- **Base overhead**: 200ms
- **Time per row**: 0.5ms
- **Compression ratio**: 0.5
- **Best for**: < 10k rows, needs formatting

### PDF
- **Base overhead**: 500ms
- **Time per row**: 2.0ms
- **Compression ratio**: 0.3
- **Best for**: Visual presentations, < 5k rows

### PNG
- **Base overhead**: 300ms
- **Time per row**: 1.5ms
- **Compression ratio**: 0.2
- **Best for**: Charts, visual data

### JSON
- **Base overhead**: 30ms
- **Time per row**: 0.08ms
- **Compression ratio**: 1.0
- **Best for**: Data integration, APIs

## API Reference

### ExportPerformanceMonitor

#### Methods

##### `recordMetric(format, rowCount, executionTimeMs, fileSizeBytes, success, errorMessage?)`
Record a new export performance metric.

##### `getAverageTime(format?)`
Get average execution time, optionally filtered by format.

##### `estimateTime(format, rowCount)`
Estimate time for an export operation.

Returns: `TimeEstimate`
```typescript
{
  estimatedTimeMs: number;
  confidence: 'high' | 'medium' | 'low';
  basedOnSamples: number;
  range: { min: number; max: number };
}
```

##### `getRecommendations(format, rowCount)`
Get performance recommendations.

Returns: `PerformanceRecommendation[]`
```typescript
{
  type: 'warning' | 'info' | 'optimization';
  message: string;
  suggestedFormat?: ExportFormat;
  estimatedTimeSavingsMs?: number;
  details?: string;
}
```

##### `getStats(format?)`
Get comprehensive statistics, optionally filtered by format.

Returns: `FormatStats[]`

##### `getSummary()`
Get overall performance summary.

Returns:
```typescript
{
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  averageTimeMs: number;
  slowExports: number;
  totalDataExported: number;
  mostUsedFormat: ExportFormat | null;
  fastestFormat: ExportFormat | null;
}
```

##### `compareFormats(rowCount)`
Compare all formats for a given row count.

##### `clearMetrics()`
Clear all metrics from memory.

##### `clearOldMetrics(daysOld)`
Clear metrics older than specified days.

## Example Scenarios

### Scenario 1: Large Dataset Export

```typescript
const data = await fetchData(); // 15,000 rows
const format = 'excel';

// Get recommendations
const recommendations = exportPerformanceMonitor.getRecommendations(
  format,
  data.length
);

// Warning: Dataset size (15,000 rows) exceeds recommended maximum for EXCEL format (10,000 rows)
// Suggested format: CSV
// Estimated time savings: 5,234ms

// Show warning to user and suggest CSV
if (recommendations.some(r => r.type === 'warning')) {
  const warning = recommendations.find(r => r.type === 'warning');
  alert(`${warning.message}\n\nRecommended: ${warning.suggestedFormat}`);
}
```

### Scenario 2: Format Selection Helper

```typescript
function selectBestFormat(rowCount: number): ExportFormat {
  const comparison = exportPerformanceMonitor.compareFormats(rowCount);

  if (rowCount > 10000) {
    // Large dataset - prefer CSV or JSON
    return comparison.find(c => c.format === 'csv' || c.format === 'json')?.format || 'csv';
  } else if (rowCount > 1000) {
    // Medium dataset - Excel or CSV
    return comparison.find(c => c.format === 'excel' || c.format === 'csv')?.format || 'csv';
  } else {
    // Small dataset - any format works, prefer user's choice
    return 'excel';
  }
}
```

### Scenario 3: Performance Dashboard

```tsx
import { ExportPerformanceWidget } from '@/components/reports/ExportPerformanceWidget';

function ReportsPage() {
  return (
    <div>
      <h1>Reports & Analytics</h1>

      {/* Performance monitoring widget */}
      <ExportPerformanceWidget className="mt-6" />
    </div>
  );
}
```

## Best Practices

### 1. Always Record Metrics

Integrate performance tracking in all export operations:

```typescript
// Good
async function exportData(data: any[], format: ExportFormat) {
  const startTime = performance.now();
  try {
    const blob = await doExport(data, format);
    exportPerformanceMonitor.recordMetric(
      format,
      data.length,
      performance.now() - startTime,
      blob.size,
      true
    );
    return blob;
  } catch (error) {
    exportPerformanceMonitor.recordMetric(
      format,
      data.length,
      performance.now() - startTime,
      0,
      false,
      error.message
    );
    throw error;
  }
}

// Bad - no tracking
async function exportData(data: any[], format: ExportFormat) {
  return await doExport(data, format);
}
```

### 2. Show Recommendations to Users

Help users make informed decisions:

```typescript
const recommendations = exportPerformanceMonitor.getRecommendations(
  selectedFormat,
  rowCount
);

if (recommendations.length > 0) {
  // Show recommendations in UI
  recommendations.forEach(rec => {
    if (rec.type === 'warning') {
      showWarning(rec.message);
    } else if (rec.type === 'optimization') {
      showOptimizationTip(rec.message);
    }
  });
}
```

### 3. Set Realistic Expectations

Show estimated time to users:

```typescript
const estimate = exportPerformanceMonitor.estimateTime(format, rowCount);

showProgressDialog({
  message: `Exporting ${rowCount.toLocaleString()} rows...`,
  estimatedTime: estimate.estimatedTimeMs,
  confidence: estimate.confidence,
});
```

### 4. Periodic Cleanup

Clear old metrics to prevent memory issues:

```typescript
// Clear metrics older than 7 days
setInterval(() => {
  exportPerformanceMonitor.clearOldMetrics(7);
}, 24 * 60 * 60 * 1000); // Daily
```

## Monitoring Console Output

### Success Messages

Normal exports complete silently. Performance data is tracked in memory.

### Warning Messages

```
[ExportPerformanceMonitor] Slow export detected: pdf format took 6234ms for 1500 rows
```

Triggered when export takes > 5 seconds.

### Error Messages

```
[ExportPerformanceMonitor] Export failed: excel format - Network timeout
```

Logged when export operation fails.

### Info Messages

```
[ExportPerformanceMonitor] All metrics cleared
[ExportPerformanceMonitor] Removed 15 metrics older than 7 days
```

## Integration Checklist

- [ ] Import `exportPerformanceMonitor` in export services
- [ ] Wrap export operations with `performance.now()` timing
- [ ] Call `recordMetric()` after each export (success or failure)
- [ ] Show recommendations to users before large exports
- [ ] Display estimated time for long-running exports
- [ ] Add `ExportPerformanceWidget` to admin/reports dashboard
- [ ] Implement periodic cleanup of old metrics
- [ ] Add format selector with recommendations to export UI
- [ ] Monitor console for slow export warnings
- [ ] Track success rates and investigate failures

## Future Enhancements

- [ ] Persist metrics to database for long-term analysis
- [ ] Add server-side export performance tracking
- [ ] Implement export queue for large datasets
- [ ] Add export cancellation support
- [ ] Track network speed impact on exports
- [ ] Add export templates with optimized settings
- [ ] Implement adaptive chunking based on performance
- [ ] Add real-time progress updates during export
- [ ] Create export performance reports
- [ ] Add A/B testing for export optimizations

## Support

For questions or issues related to the Export Performance Monitoring System:

1. Check console for warning/error messages
2. Review metrics using `exportPerformanceMonitor.getSummary()`
3. Verify format characteristics match your use case
4. Consider dataset size vs. format recommendations
5. Check browser console for any JavaScript errors

## License

Part of the Logos Vision CRM system - Internal use only.
