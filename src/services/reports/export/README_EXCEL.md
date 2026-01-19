# Excel Export Service - Quick Start Guide

Comprehensive Excel export with multi-sheet workbooks, professional styling, and summary statistics.

## Installation

The required packages are already installed:

```bash
npm install xlsx file-saver
npm install -D @types/file-saver
```

## Quick Start

### Basic Usage

```typescript
import { ExcelExportService } from './services/reports/export';

const excelService = new ExcelExportService();

// Prepare your data
const data = [
  { id: 1, name: 'John Doe', donation_amount: 1500, created_at: '2026-01-15' },
  { id: 2, name: 'Jane Smith', donation_amount: 2500, created_at: '2026-01-16' },
];

// Export to Excel
const result = await excelService.export({
  reportName: 'Donation Report',
  data: data,
  timestamp: new Date()
});

if (result.success) {
  console.log(`✅ Exported: ${result.filename}`);
  // File automatically downloads to user's computer
} else {
  console.error(`❌ Export failed: ${result.error}`);
}
```

## Features

### 1. Multi-Sheet Workbooks

Every export creates **3 sheets**:

#### Sheet 1: Data
- All your data with professional formatting
- Frozen header row
- Auto-sized columns
- Alternating row colors
- Type-specific formatting (currency, dates, etc.)

#### Sheet 2: Summary
- Automatic statistics for numeric fields
- Count, Sum, Average, Min, Max
- Excel formulas for dynamic totals
- Professional table layout

#### Sheet 3: Metadata
- Report information
- Applied filters
- Export details
- Compatibility information

### 2. Professional Styling

**Header Styling:**
- Bold white text
- Indigo background (#4F46E5)
- Centered alignment
- Borders

**Data Row Styling:**
- Alternating gray (#F9FAFB) and white backgrounds
- Consistent borders
- Type-appropriate alignment

### 3. Smart Formatting

**Automatic Type Detection:**

```typescript
// Currency fields (amount, price, cost, revenue, etc.)
donation_amount: 1500  →  $1,500.00

// Percentages (rate, percent, etc.)
conversion_rate: 0.25  →  25.00%

// Dates
created_at: "2026-01-15T10:30:00Z"  →  2026-01-15 10:30:00

// Integers (count, quantity, etc.)
item_count: 42  →  42

// General numbers
score: 4.567  →  4.57
```

### 4. Auto-Sized Columns

Columns automatically adjust to content width:
- Minimum: 10 characters
- Maximum: 50 characters
- Optimized for readability

## Advanced Usage

### With Filters

```typescript
const result = await excelService.export({
  reportName: 'Filtered Report',
  data: filteredData,
  filters: {
    date_range: {
      start: '2026-01-01',
      end: '2026-01-31'
    },
    status: 'Active',
    categories: ['Donation', 'Grant'],
    min_amount: 500
  },
  timestamp: new Date()
});

// Filters will appear in Sheet 3: Metadata
```

### Large Datasets

```typescript
// The service handles large datasets efficiently
const largeData = generateData(10000); // 10,000 records

const startTime = Date.now();
const result = await excelService.export({
  reportName: 'Large Dataset',
  data: largeData,
  timestamp: new Date()
});

console.log(`Export time: ${Date.now() - startTime}ms`);
console.log(`Performance: ${largeData.length / ((Date.now() - startTime) / 1000)} records/sec`);
```

## Data Preparation

### Recommended Data Format

```typescript
interface ReportData {
  // Use descriptive field names (auto-converted to Title Case)
  id: string;                    // "Id"
  donor_name: string;            // "Donor Name"
  donation_amount: number;       // "Donation Amount" → $1,500.00
  donation_date: string | Date;  // "Donation Date" → 2026-01-15 10:30:00
  is_recurring: boolean;         // "Is Recurring" → TRUE/FALSE
}

const data: ReportData[] = [
  {
    id: 'DON-001',
    donor_name: 'John Smith',
    donation_amount: 1500.00,
    donation_date: '2026-01-15T10:30:00Z',
    is_recurring: true
  }
];
```

### Handling Null Values

```typescript
// Clean your data before export
const cleanedData = data.map(row => ({
  ...row,
  // Replace nulls with defaults
  donation_amount: row.donation_amount ?? 0,
  // Format dates consistently
  created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  // Clean strings
  name: row.name?.trim() || 'Unknown'
}));
```

## Formatter Utilities

### Standalone Usage

```typescript
import {
  getNumericFields,
  formatFieldName,
  calculateColumnWidths,
  calculateSummaryStats
} from './services/reports/export/formatters/ExcelFormatter';

// Identify numeric columns
const numericFields = getNumericFields(data);
// → ['donation_amount', 'active_projects', 'satisfaction_score']

// Format field names
const formatted = formatFieldName('first_name');
// → 'First Name'

// Calculate optimal widths
const widths = calculateColumnWidths(data);
// → { donor_name: 25, donation_amount: 18, ... }

// Generate statistics
const stats = calculateSummaryStats(data, numericFields);
// → [{ field: 'Donation Amount', count: 150, sum: 125000, ... }]
```

## Compatibility

### Microsoft Excel ✅
- Full support for all features
- Formulas work correctly
- Styling renders perfectly
- Frozen panes work
- Auto-filters functional

### Google Sheets ✅
- Full support for all features
- Formulas calculate correctly
- Styling renders well
- Frozen rows work
- Filters functional

### LibreOffice Calc ✅
- Full support for all features
- Formulas work
- Styling renders
- Frozen panes work
- Some minor formatting differences

## Performance

### Benchmarks

| Records | Export Time | File Size |
|---------|-------------|-----------|
| 100 | ~100ms | ~15 KB |
| 1,000 | ~500ms | ~120 KB |
| 10,000 | ~3s | ~1.1 MB |
| 50,000 | ~15s | ~5.5 MB |

### Optimization Tips

```typescript
// For large datasets:

// 1. Sample data for width calculation (already done internally)
// 2. Use pagination for UI display
// 3. Consider background processing for 50k+ records
// 4. Show progress indicator for user feedback

if (data.length > 50000) {
  // Show loading indicator
  showLoadingIndicator('Exporting large dataset...');

  // Execute export
  const result = await excelService.export({
    reportName: 'Large Report',
    data: data
  });

  hideLoadingIndicator();
}
```

## Error Handling

```typescript
try {
  const result = await excelService.export(options);

  if (!result.success) {
    // Handle known errors
    switch (result.error) {
      case 'No data to export':
        showMessage('No data available to export');
        break;
      default:
        showError(`Export failed: ${result.error}`);
    }
  } else {
    showSuccess(`Exported ${result.filename}`);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected export error:', error);
  showError('An unexpected error occurred during export');
}
```

## Integration Examples

### With React Component

```typescript
import React, { useState } from 'react';
import { ExcelExportService } from './services/reports/export';

function ReportExporter({ data, reportName }) {
  const [exporting, setExporting] = useState(false);
  const excelService = new ExcelExportService();

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await excelService.export({
        reportName: reportName,
        data: data,
        timestamp: new Date()
      });

      if (result.success) {
        alert(`✅ Exported: ${result.filename}`);
      } else {
        alert(`❌ Export failed: ${result.error}`);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !data?.length}
    >
      {exporting ? 'Exporting...' : 'Export to Excel'}
    </button>
  );
}
```

### With Report Service

```typescript
import { reportService } from './services/reportService';
import { ExcelExportService } from './services/reports/export';

async function exportReport(reportId: string, filters?: Record<string, any>) {
  // Fetch report configuration
  const report = await reportService.getReportById(reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  // Fetch report data
  const { data } = await reportService.fetchReportData(report, filters);

  // Export to Excel
  const excelService = new ExcelExportService();
  const result = await excelService.export({
    reportName: report.name,
    data: data,
    filters: filters,
    timestamp: new Date()
  });

  return result;
}
```

## Troubleshooting

### Common Issues

**Issue: Dates not formatting correctly**

```typescript
// Ensure dates are in ISO format or Date objects
const formattedData = data.map(row => ({
  ...row,
  created_at: new Date(row.created_at).toISOString()
}));
```

**Issue: Numbers showing as text**

```typescript
// Ensure numeric fields contain numbers, not strings
const formattedData = data.map(row => ({
  ...row,
  amount: parseFloat(row.amount) || 0
}));
```

**Issue: Large files crashing browser**

```typescript
// For datasets over 100,000 rows, consider server-side export
if (data.length > 100000) {
  // Use backend API instead
  await fetch('/api/reports/export-excel', {
    method: 'POST',
    body: JSON.stringify({ data, reportName })
  });
}
```

## Best Practices

1. **Clean Data First**
   ```typescript
   // Remove null values, format dates, parse numbers
   const cleaned = cleanData(rawData);
   ```

2. **Provide Meaningful Names**
   ```typescript
   // Use descriptive report names
   reportName: 'Q1 2026 Donation Summary' // ✅
   reportName: 'Report1'                  // ❌
   ```

3. **Include Filter Context**
   ```typescript
   // Help users understand what data is included
   filters: {
     period: 'Q1 2026',
     status: 'Active',
     min_amount: 500
   }
   ```

4. **Handle Errors Gracefully**
   ```typescript
   // Always check result.success
   if (!result.success) {
     // Show user-friendly error message
     notifyUser(result.error);
   }
   ```

## Next Steps

- See [Full Documentation](../../../docs/EXCEL_EXPORT_SERVICE.md) for detailed API reference
- Check [Examples](./examples/ExcelExportExample.ts) for more usage patterns
- Review [Type Definitions](./types.ts) for TypeScript support

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review [examples](./examples/)
3. Consult [full documentation](../../../docs/EXCEL_EXPORT_SERVICE.md)
