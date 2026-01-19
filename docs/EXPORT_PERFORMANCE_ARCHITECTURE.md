# Export Performance Monitoring - System Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │ Export Dialog/Modal  │      │ ExportPerformanceWidget   │    │
│  │ - Format selector    │      │ - Statistics dashboard   │    │
│  │ - Recommendations    │      │ - Performance charts     │    │
│  │ - Time estimates     │      │ - Format comparison      │    │
│  └──────────┬───────────┘      └────────────┬─────────────┘    │
│             │                                │                   │
└─────────────┼────────────────────────────────┼───────────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ExportPerformanceMonitor (Singleton)        │   │
│  │                                                          │   │
│  │  Methods:                                                │   │
│  │  • recordMetric(format, rows, time, size, success)      │   │
│  │  • estimateTime(format, rowCount) → TimeEstimate        │   │
│  │  • getRecommendations(format, rows) → Recommendation[]  │   │
│  │  • compareFormats(rowCount) → Comparison[]              │   │
│  │  • getStats(format?) → FormatStats[]                    │   │
│  │  • getSummary() → Summary                               │   │
│  │                                                          │   │
│  │  Storage: Last 100 metrics in memory                    │   │
│  └────────────┬─────────────────────────────────────────────┘   │
│               │                                                  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ExportService / ExportRouter                │   │
│  │                                                          │   │
│  │  • exportToCSV(data, filename)                          │   │
│  │  • exportToExcel(data, filename)                        │   │
│  │  • exportToPDF(data, filename)                          │   │
│  │  • exportToPNG(element, filename)                       │   │
│  │  • exportToJSON(data, filename)                         │   │
│  │                                                          │   │
│  │  Each method:                                            │   │
│  │  1. Starts timer                                         │   │
│  │  2. Performs export                                      │   │
│  │  3. Records metric (success/failure)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Export Operation Flow

```
┌──────────────┐
│  User clicks │
│  "Export"    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ Get Recommendations (Optional)    │
│ - Check format suitability        │
│ - Show warnings for large data    │
│ - Suggest optimal format          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Get Time Estimate (Optional)     │
│ - Based on historical data        │
│ - Display to user                 │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Start Export Operation            │
│ - Start performance timer         │
│ - Count rows                      │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Execute Export                    │
│ - Convert data to format          │
│ - Generate file/blob              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Record Performance Metric         │
│ - Calculate execution time        │
│ - Measure file size               │
│ - Record success/failure          │
│ - Store in monitor                │
└──────┬───────────────────────────┘
       │
       ├──> Log warning if > 5s
       │
       ▼
┌──────────────────────────────────┐
│ Download File                     │
│ - Trigger browser download        │
│ - Show success message            │
└───────────────────────────────────┘
```

### Recommendation Flow

```
┌──────────────────────────────────┐
│ User selects format & row count  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Check Format Characteristics     │
│ - Max recommended rows            │
│ - Performance per row             │
│ - Compression ratio               │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Analyze Historical Data          │
│ - Recent exports                  │
│ - Success rates                   │
│ - Average times                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Generate Recommendations          │
│ - Warnings (data too large)       │
│ - Optimizations (faster format)   │
│ - Info (best practices)           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Display to User                   │
│ - Show warnings prominently       │
│ - Suggest alternatives            │
│ - Estimate time savings           │
└───────────────────────────────────┘
```

## Component Architecture

### ExportPerformanceWidget

```
┌─────────────────────────────────────────────────────┐
│         ExportPerformanceWidget                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Summary Cards                            │     │
│  │  ┌────────┐ ┌────────┐ ┌────────┐        │     │
│  │  │ Total  │ │Success │ │  Avg   │        │     │
│  │  │Exports │ │  Rate  │ │  Time  │  ...   │     │
│  │  └────────┘ └────────┘ └────────┘        │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Format Filter Dropdown                   │     │
│  │  [ All Formats ▼ ]                        │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Performance Chart (Bar Chart)            │     │
│  │  ▁▂▃▄▅▆▇█                                 │     │
│  │  CSV  Excel  PDF  PNG  JSON               │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Format Statistics (List)                 │     │
│  │  ┌──────────────────────────────────┐     │     │
│  │  │ CSV                              │     │     │
│  │  │ • Avg Time: 150ms                │     │     │
│  │  │ • Success: 98%                   │     │     │
│  │  │ • Avg Rows: 5,234                │     │     │
│  │  └──────────────────────────────────┘     │     │
│  │  ┌──────────────────────────────────┐     │     │
│  │  │ Excel                            │     │     │
│  │  │ • Avg Time: 425ms                │     │     │
│  │  │ • Success: 95%                   │     │     │
│  │  │ • Avg Rows: 2,156                │     │     │
│  │  └──────────────────────────────────┘     │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Insights                                 │     │
│  │  • Most Used: CSV                         │     │
│  │  • Fastest: JSON                          │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### FormatSelectorWithRecommendations

```
┌─────────────────────────────────────────────────────┐
│    FormatSelectorWithRecommendations                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Export 10,000 rows                                 │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  Format Options                           │     │
│  │  ○ CSV          (~150ms) Fast & efficient │     │
│  │  ● Excel        (~425ms) Good for analysis│     │
│  │  ○ PDF          (~2.1s)  Not recommended  │     │
│  │  ○ PNG          (~1.5s)  Not recommended  │     │
│  │  ○ JSON         (~120ms) Fastest option   │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │  ⚠ Recommendations                        │     │
│  │  • Dataset size exceeds PDF limit         │     │
│  │  • Consider CSV for better performance    │     │
│  │  • Estimated time savings: 1.7s           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │        [ Export as Excel ]                │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Data Structures

### ExportMetric

```typescript
{
  id: string;                  // Unique identifier
  format: ExportFormat;         // csv | excel | pdf | png | json
  rowCount: number;            // Number of rows exported
  executionTimeMs: number;     // Time taken in milliseconds
  fileSizeBytes: number;       // Generated file size
  timestamp: string;           // ISO timestamp
  success: boolean;            // Success/failure flag
  errorMessage?: string;       // Error details if failed
}
```

### FormatStats

```typescript
{
  format: ExportFormat;
  totalExports: number;        // Total exports for this format
  successfulExports: number;   // Successful exports
  failedExports: number;       // Failed exports
  averageTimeMs: number;       // Average execution time
  medianTimeMs: number;        // Median execution time
  minTimeMs: number;           // Fastest export
  maxTimeMs: number;           // Slowest export
  averageRows: number;         // Average rows per export
  averageFileSizeBytes: number;// Average file size
  totalFileSizeBytes: number;  // Total data exported
  successRate: number;         // Success percentage
}
```

### TimeEstimate

```typescript
{
  estimatedTimeMs: number;     // Estimated execution time
  confidence: 'high' | 'medium' | 'low';
  basedOnSamples: number;      // Number of historical samples
  range: {
    min: number;               // Minimum expected time
    max: number;               // Maximum expected time
  };
}
```

### PerformanceRecommendation

```typescript
{
  type: 'warning' | 'info' | 'optimization';
  message: string;             // Main recommendation message
  suggestedFormat?: ExportFormat;
  estimatedTimeSavingsMs?: number;
  details?: string;            // Additional context
}
```

## Memory Management

```
┌─────────────────────────────────────────────────────┐
│         Metrics Storage (In-Memory)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Maximum: 100 metrics                               │
│  Storage: ~500 bytes per metric                     │
│  Total: ~50 KB maximum                              │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │ Metric 1 (newest)                   │           │
│  │ Metric 2                            │           │
│  │ Metric 3                            │           │
│  │ ...                                 │           │
│  │ Metric 99                           │           │
│  │ Metric 100 (oldest)                 │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  When 101st metric added:                           │
│  • Oldest metric automatically removed              │
│  • New metric added to front                        │
│  • Array size maintained at 100                     │
│                                                     │
│  Manual cleanup:                                    │
│  • clearMetrics() - Remove all                      │
│  • clearOldMetrics(days) - Remove old               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Performance Overhead

```
Export Operation Timeline:
│
├─ 0ms:   User clicks export
│
├─ <1ms:  Get recommendations (optional)
│
├─ <1ms:  Get time estimate (optional)
│
├─ 0ms:   Start timer
│
├─ Xms:   Perform actual export (variable)
│
├─ <1ms:  Record metric
│
├─ <1ms:  Log if slow (conditional)
│
└─ Xms:   Download file

Total overhead: < 2ms (negligible)
Export time: Depends on format & data size
```

## Integration Points

### Existing Systems

```
┌─────────────────────────────────────────────────────┐
│              Logos Vision CRM                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────┐         │
│  │  Reports & Analytics                  │         │
│  │  • Report viewer                      │         │
│  │  • Dashboard builder                  │         │
│  │  • KPI tracking                       │         │
│  └──────────┬────────────────────────────┘         │
│             │                                       │
│             ▼                                       │
│  ┌───────────────────────────────────────┐         │
│  │  Export System (NEW)                  │         │
│  │  • Performance Monitor ←─────────┐   │         │
│  │  • Export Router                 │   │         │
│  │  • Format Services               │   │         │
│  └──────────┬────────────────────────┼───┘         │
│             │                        │             │
│             ▼                        │             │
│  ┌───────────────────────────────────┼───┐         │
│  │  Report Service                   │   │         │
│  │  • Data fetching                  │   │         │
│  │  • Filtering                      │   │         │
│  │  • Caching                        │   │         │
│  └──────────┬────────────────────────┼───┘         │
│             │                        │             │
│             ▼                        │             │
│  ┌───────────────────────────────────┼───┐         │
│  │  Supabase Client                  │   │         │
│  │  • Database queries               │   │         │
│  │  • Authentication                 │   │         │
│  └───────────────────────────────────┼───┘         │
│                                      │             │
│                                      │             │
│  ┌───────────────────────────────────┼───┐         │
│  │  UI Components                    │   │         │
│  │  • ExportPerformanceWidget ───────┘   │         │
│  │  • FormatSelector                     │         │
│  │  • Export dialogs                     │         │
│  └───────────────────────────────────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Decision Flow

### Format Selection Decision Tree

```
                    ┌─────────────┐
                    │ Row Count?  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
         < 1,000       1K-10K          > 10K
            │              │              │
            ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │ Any OK   │   │CSV/Excel │   │ CSV/JSON │
      │          │   │JSON      │   │   Only   │
      └────┬─────┘   └────┬─────┘   └────┬─────┘
           │              │              │
           │              │              │
      ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
      │ Visual? │    │ Format? │    │ Size?   │
      └────┬────┘    └────┬────┘    └────┬────┘
           │              │              │
      ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
      │ Yes│ No │    │Excel│CSV│    │ CSV│JSON│
      └────┼────┘    └─────┼───┘    └────┼────┘
           │              │              │
       ┌───┴───┐      ┌───┴───┐      ┌───┴───┐
       │ PDF/  │      │ Excel │      │ CSV   │
       │ PNG   │      │       │      │       │
       └───────┘      └───────┘      └───────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────┐
│              Error Handling Flow                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Export Attempt                                     │
│       │                                             │
│       ▼                                             │
│  ┌─────────┐                                        │
│  │ Success?│                                        │
│  └────┬────┘                                        │
│       │                                             │
│  ┌────┴────┐                                        │
│  │ Yes│ No │                                        │
│  └────┼────┘                                        │
│       │                                             │
│  ┌────┴──────────────────────────┐                 │
│  │                               │                 │
│  ▼                               ▼                 │
│ Record Success                Record Failure       │
│ • Time taken                  • Time taken         │
│ • File size                   • Error message      │
│ • Success = true              • Success = false    │
│                               • File size = 0      │
│  │                               │                 │
│  ▼                               ▼                 │
│ Continue                      ┌───────────────┐    │
│                               │ Log Error     │    │
│                               │ Show to user  │    │
│                               │ Suggest alt.  │    │
│                               └───────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Summary

The Export Performance Monitoring System provides:

1. **Transparent tracking** - Automatic metric recording
2. **Smart recommendations** - Context-aware format suggestions
3. **Accurate estimates** - Data-driven time predictions
4. **Performance insights** - Statistical analysis and trends
5. **User guidance** - Clear warnings and optimizations
6. **Minimal overhead** - < 2ms per export operation
7. **Memory efficient** - Auto-limited to 100 metrics
8. **Production ready** - Comprehensive error handling

**Architecture Type**: Singleton pattern with service layer integration
**Storage**: In-memory (100 metrics max)
**Overhead**: < 2ms per export
**Memory**: < 50KB typical usage
