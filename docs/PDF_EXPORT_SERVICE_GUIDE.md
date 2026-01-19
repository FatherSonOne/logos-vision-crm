# PDF Export Service Guide

## Overview

The PDF Export Service provides comprehensive functionality for generating professional PDF reports with charts, data tables, filters, and customizable layouts. Built with jsPDF, jspdf-autotable, and html2canvas, it supports multiple page sizes, orientations, and high-resolution chart rendering.

## Installation

The required packages are already installed:

```bash
npm install jspdf jspdf-autotable html2canvas
```

## Available Services

### 1. PdfExportService (Enhanced Legacy)

The enhanced version of the original PDF export service that maintains backward compatibility while adding new features.

**Features:**
- Automatic header with title and timestamp
- Filter summary with formatted display
- High-resolution chart capture (2x by default)
- Enhanced data table formatting with proper column widths
- Footer with page numbers and generation timestamp
- Support for A4, Letter, and Legal page sizes
- Portrait and landscape orientations

**Usage:**

```typescript
import { PdfExportService } from '@/services/reports/export';

const pdfService = new PdfExportService();

const result = await pdfService.export({
  reportName: 'Client Revenue Report',
  data: clientData,
  chartElement: document.getElementById('revenue-chart'),
  filters: {
    status: 'Active',
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
  },
});

if (result.success && result.blob) {
  // Download the PDF
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### 2. AdvancedPdfExportService

A comprehensive service with support for multiple charts, advanced formatting, and extended options.

**Features:**
- Multiple chart support with individual titles
- Configurable chart resolution (default 2x)
- Advanced filter display with FilterOption interface
- Multiple page sizes: A4, Letter, Legal
- Both portrait and landscape orientations
- Professional header with dividers
- Automatic page breaks and pagination
- Footer with page numbers and timestamps
- Smart column width calculation
- Comprehensive error handling

**Usage:**

```typescript
import advancedPdfExportService, {
  AdvancedExportOptions,
  ChartOptions,
  FilterOption,
} from '@/services/reports/export';

const exportOptions: AdvancedExportOptions = {
  title: 'Q1 2024 Performance Report',
  description: 'Comprehensive analysis of Q1 performance metrics.',
  includeCharts: true,
  includeFilters: true,
  orientation: 'landscape',
  pageSize: 'letter',
  fileName: 'q1-2024-performance.pdf',
};

const charts: ChartOptions[] = [
  {
    element: document.getElementById('revenue-chart')!,
    title: 'Revenue by Month',
    resolution: 2,
  },
  {
    element: document.getElementById('expense-chart')!,
    title: 'Expense Breakdown',
    resolution: 2,
  },
];

const filters: FilterOption[] = [
  { label: 'Quarter', value: 'Q1 2024' },
  { label: 'Status', value: ['Active', 'Pending'] },
  { label: 'Date Range', value: new Date('2024-01-01') },
];

await advancedPdfExportService.exportToPDF(
  data,
  exportOptions,
  charts,
  filters
);
```

## PdfFormatter Utility

The `PdfFormatter` class provides comprehensive data formatting utilities:

### Methods

#### extractHeaders(data: any[]): string[]
Extracts column headers from data array and formats them.

```typescript
import { PdfFormatter } from '@/services/reports/export';

const headers = PdfFormatter.extractHeaders(data);
// ['Client Name', 'Revenue', 'Last Contact']
```

#### formatTableData(data: any[]): any[][]
Formats data for jspdf-autotable with proper type handling.

```typescript
const formattedData = PdfFormatter.formatTableData(data);
```

#### formatFieldName(fieldName: string): string
Converts camelCase or snake_case to Title Case.

```typescript
PdfFormatter.formatFieldName('clientName'); // 'Client Name'
PdfFormatter.formatFieldName('last_contact'); // 'Last Contact'
```

#### formatCellValue(value: any): string
Formats cell values based on type (dates, numbers, booleans, nulls).

```typescript
PdfFormatter.formatCellValue(new Date()); // 'Jan 17, 2024, 02:30 PM'
PdfFormatter.formatCellValue(1500.5); // '1,500.5'
PdfFormatter.formatCellValue(true); // 'Yes'
PdfFormatter.formatCellValue(null); // '-'
```

#### formatCurrency(amount: number): string
Formats numbers as USD currency.

```typescript
PdfFormatter.formatCurrency(1500.50); // '$1,500.50'
```

#### formatFilterValue(value: string | string[] | Date | null): string
Formats filter values for display.

```typescript
PdfFormatter.formatFilterValue(['Active', 'Pending']); // 'Active, Pending'
PdfFormatter.formatFilterValue(new Date()); // 'Jan 17, 2024, 02:30 PM'
```

#### calculateColumnWidths(headers: string[], data: any[][], maxWidth: number): object
Calculates optimal column widths based on content.

```typescript
const columnWidths = PdfFormatter.calculateColumnWidths(
  headers,
  formattedData,
  190 // Max table width in mm
);
```

## Export Options

### AdvancedExportOptions Interface

```typescript
interface AdvancedExportOptions {
  title: string;              // Report title
  description?: string;       // Optional description
  includeCharts?: boolean;    // Include chart images
  includeFilters?: boolean;   // Display active filters
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
  fileName?: string;          // Custom filename
}
```

### ChartOptions Interface

```typescript
interface ChartOptions {
  element: HTMLElement;       // Chart DOM element
  title: string;              // Chart title in PDF
  width?: number;             // Custom width in mm
  height?: number;            // Custom height in mm
  resolution?: number;        // Scale factor (default: 2)
}
```

### FilterOption Interface

```typescript
interface FilterOption {
  label: string;              // Filter label
  value: string | string[] | Date | null;  // Filter value
}
```

## Page Sizes and Dimensions

| Page Size | Width (mm) | Height (mm) | Best For |
|-----------|------------|-------------|----------|
| A4        | 210        | 297         | International standard |
| Letter    | 216        | 279         | US standard |
| Legal     | 216        | 356         | Legal documents |

## Orientation Guidelines

### Portrait (Default)
- Best for: Reports with narrow tables (few columns)
- Use when: Text-heavy content, vertical charts
- Table width: ~180mm usable space

### Landscape
- Best for: Wide tables with many columns
- Use when: Horizontal charts, spreadsheet-like data
- Table width: ~267mm usable space (A4)

## Chart Resolution

The `resolution` parameter controls chart quality:

- **1x**: Standard resolution (smaller file size)
- **2x**: Retina/high-DPI displays (default, recommended)
- **3x**: Ultra-high resolution (larger file size)

```typescript
const charts: ChartOptions[] = [
  {
    element: chartElement,
    title: 'Revenue Chart',
    resolution: 3, // Ultra-high quality
  },
];
```

## Best Practices

### 1. Data Preparation

```typescript
// Clean and validate data before export
const cleanData = rawData
  .filter(item => item.id && item.name)
  .map(item => ({
    id: item.id,
    name: item.name,
    revenue: item.revenue || 0,
    status: item.status || 'Unknown',
  }));
```

### 2. Chart Rendering

```typescript
// Ensure charts are fully rendered before export
const waitForChartRender = async (chartRef: HTMLElement) => {
  return new Promise(resolve => {
    setTimeout(resolve, 500); // Wait for animations
  });
};

await waitForChartRender(chartElement);
await advancedPdfExportService.exportToPDF(data, options, charts);
```

### 3. Error Handling

```typescript
try {
  await advancedPdfExportService.exportToPDF(data, options, charts, filters);
  console.log('PDF exported successfully');
} catch (error) {
  console.error('PDF export failed:', error);
  // Show user-friendly error message
  alert('Failed to generate PDF. Please try again.');
}
```

### 4. Large Datasets

```typescript
// For large datasets, consider pagination or filtering
const EXPORT_LIMIT = 1000;

if (data.length > EXPORT_LIMIT) {
  console.warn(`Dataset too large (${data.length} rows). Limiting to ${EXPORT_LIMIT}.`);
  data = data.slice(0, EXPORT_LIMIT);
}
```

### 5. File Naming

```typescript
// Use descriptive, timestamp-based filenames
const timestamp = new Date().toISOString().split('T')[0];
const fileName = `client-report-${timestamp}.pdf`;

const options: AdvancedExportOptions = {
  title: 'Client Report',
  fileName,
};
```

## React Component Example

```typescript
import React, { useRef, useState } from 'react';
import advancedPdfExportService from '@/services/reports/export';

export const ReportExport: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const options = {
        title: 'Monthly Performance Report',
        description: 'Detailed analysis of monthly performance metrics.',
        includeCharts: true,
        includeFilters: true,
        orientation: 'portrait' as const,
        pageSize: 'letter' as const,
      };

      const charts = chartRef.current
        ? [{ element: chartRef.current, title: 'Performance Chart', resolution: 2 }]
        : [];

      const filters = [
        { label: 'Month', value: 'January 2024' },
        { label: 'Status', value: ['Active'] },
      ];

      await advancedPdfExportService.exportToPDF(data, options, charts, filters);
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div ref={chartRef}>
        {/* Your chart component */}
      </div>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  );
};
```

## Troubleshooting

### Charts Not Rendering

**Problem:** Charts appear blank in PDF

**Solutions:**
1. Ensure chart is fully rendered before export
2. Wait for animations to complete
3. Check that element is visible (not display:none)
4. Verify CORS settings for external images

```typescript
// Add delay before export
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Large File Sizes

**Problem:** PDF files are too large

**Solutions:**
1. Reduce chart resolution from 2x to 1x
2. Limit number of rows exported
3. Remove unnecessary charts
4. Compress images before adding to charts

### Layout Issues

**Problem:** Content overflows or wraps incorrectly

**Solutions:**
1. Use landscape orientation for wide tables
2. Increase page size (A4 → Letter → Legal)
3. Reduce font sizes
4. Limit number of columns

### TypeScript Errors

**Problem:** Type errors with jsPDF or autoTable

**Solution:** The service includes type declarations. Ensure you import from the correct path:

```typescript
import { AdvancedPdfExportService } from '@/services/reports/export';
```

## Performance Considerations

- **Chart Capture**: ~200-500ms per chart (depends on complexity)
- **Table Rendering**: ~10ms per 100 rows
- **Total Export Time**: 1-3 seconds for typical reports

For better user experience:
1. Show loading indicator during export
2. Disable export button while processing
3. Provide progress feedback for large exports

## Security Considerations

1. **Sanitize Filenames**: Service automatically sanitizes filenames
2. **Data Validation**: Validate data before export to prevent injection
3. **User Permissions**: Implement access control for sensitive reports
4. **CORS**: Ensure proper CORS headers for external chart images

## Future Enhancements

Planned features for future releases:
- Custom header/footer templates
- Logo support with base64 encoding
- Multiple table support
- Custom color schemes
- Watermark support
- Password protection
- Digital signatures

## Support

For issues or questions:
1. Check TypeScript errors in IDE
2. Review examples in `examples/PdfExportExample.tsx`
3. Check browser console for runtime errors
4. Verify all dependencies are installed

## Related Documentation

- [Export Service Architecture](./EXPORT_SERVICE_ARCHITECTURE.md)
- [Report Service Guide](./REPORT_SERVICE_GUIDE.md)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
