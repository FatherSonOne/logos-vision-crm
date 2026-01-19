# Visual Report Builder - Quick Start Guide

## For End Users

### Creating Your First Report

1. **Navigate to Reports**
   - Click "Reports" in the sidebar
   - Click "Create New Report" button

2. **Select Visual Builder Mode**
   - Toggle is in top-right (Visual Builder / Step-by-Step Wizard)
   - Visual Builder is the default

3. **Choose Your Data Source**
   - Click the data source dropdown (left panel)
   - Select from: Donations, Clients, Projects, Tasks, etc.
   - View available fields and sample data

4. **Configure Your Chart**
   - Pick a chart type (Bar, Line, Pie, Donut, Area, Scatter)
   - Drag a field to X-Axis (categories/labels)
   - Drag numeric field(s) to Y-Axis (values/metrics)
   - Optional: Add Group By and Filters

5. **Customize Appearance**
   - Enter chart title and subtitle
   - Choose a color scheme
   - Adjust chart-specific options
   - Toggle legend, grid, and value labels

6. **Preview and Save**
   - View live preview (right panel)
   - Verify your configuration
   - Click "Save Report"

### Tips for Success

**Field Types**
- 📝 Text - Categories, labels, names
- 🔢 Number - Amounts, counts, metrics (use for Y-Axis)
- 📅 Date - Timestamps, deadlines
- ☑️ Boolean - Yes/No, True/False

**Chart Selection**
- **Bar Chart** - Compare categories (e.g., donations by campaign)
- **Line Chart** - Show trends over time (e.g., monthly revenue)
- **Pie Chart** - Show proportions (e.g., budget allocation)
- **Donut Chart** - Pie chart with emphasis on total
- **Area Chart** - Trends with magnitude (e.g., cumulative totals)
- **Scatter Plot** - Find correlations (e.g., donation amount vs. frequency)

**Common Patterns**
- Time trends: Date on X-Axis, metric on Y-Axis
- Category comparison: Category on X-Axis, count/sum on Y-Axis
- Proportions: Category on X-Axis, one metric on Y-Axis, use Pie/Donut

---

## For Developers

### Component Usage

```tsx
import { VisualReportBuilder } from '@/components/reports/VisualReportBuilder';
import { Report } from '@/services/reportService';

// In your component
<VisualReportBuilder
  report={existingReport || null}
  onSave={(reportData: Partial<Report>) => {
    // Handle save
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

### Adding Custom Data Sources

Edit `src/components/reports/builder/DataSourceSelector.tsx`:

```tsx
const DATA_SOURCES: DataSource[] = [
  // ... existing sources
  {
    id: 'custom_table',
    name: 'Custom Data',
    description: 'Your custom data description',
    table: 'custom_table',
    category: 'Custom',
    icon: '🎯',
    fields: [
      {
        name: 'field_name',
        label: 'Field Label',
        type: 'number', // 'text' | 'number' | 'date' | 'boolean'
        aggregatable: true,
        filterable: true,
        sortable: true,
      },
    ],
    sampleData: [
      { field_name: 100 },
    ],
  },
];
```

### Custom Field Validation

```tsx
// In ChartConfigurator
const validateCustomField = (field: FieldMetadata) => {
  if (field.name === 'special_field') {
    return {
      valid: false,
      error: 'This field requires special handling',
    };
  }
  return { valid: true };
};

<DropZone
  validate={validateCustomField}
  // ... other props
/>
```

### Extending Chart Types

Add to `ChartConfigurator.tsx`:

```tsx
const CHART_TYPES = [
  // ... existing types
  {
    id: 'custom' as ChartType,
    name: 'Custom Chart',
    icon: '📊',
    description: 'Your custom chart type',
    requiresX: true,
    requiresY: true,
    maxY: 3,
  },
];
```

### Custom Color Schemes

```tsx
const COLOR_SCHEMES = [
  // ... existing schemes
  {
    id: 'brand',
    name: 'Brand Colors',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
  },
];
```

### TypeScript Interfaces

```tsx
import {
  FieldMetadata,
  FieldDataType,
  AggregationType,
} from '@/components/reports/builder/DraggableField';

import {
  ChartConfiguration,
  ChartType,
  ChartOptions,
} from '@/components/reports/builder/ChartConfigurator';

import {
  DataSource,
  FieldDefinition,
} from '@/components/reports/builder/DataSourceSelector';
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between elements |
| `Enter/Space` | Activate button or toggle |
| `Escape` | Cancel drag operation |
| `Arrow Keys` | Navigate dropdown options |

---

## Troubleshooting

### "Field won't drag"
**Cause**: No data source selected
**Fix**: Select a data source first

### "Can't drop field on Y-Axis"
**Cause**: Y-Axis requires numeric fields
**Fix**: Use number-type fields only (except for Pie/Donut)

### "Drop zone says 'Maximum reached'"
**Cause**: Zone is full
**Fix**: Remove a field first, or use a different zone

### "Preview shows empty state"
**Cause**: Missing required fields
**Fix**: Ensure both X-Axis and Y-Axis have fields

### "Chart looks incorrect"
**Cause**: Wrong field types for chart
**Fix**: Match field types to chart requirements

---

## API Reference

### VisualReportBuilder Props

```tsx
interface VisualReportBuilderProps {
  report?: Report | null;        // Existing report to edit
  onSave: (report: Partial<Report>) => void;  // Save callback
  onCancel: () => void;          // Cancel callback
}
```

### FieldMetadata

```tsx
interface FieldMetadata {
  id: string;                    // Unique identifier
  name: string;                  // Database column name
  label: string;                 // Display label
  dataType: FieldDataType;       // 'text' | 'number' | 'date' | 'boolean'
  isNumeric: boolean;            // Can be aggregated
  isDate: boolean;               // Is a date field
  isCategorical: boolean;        // Can be used for grouping
  aggregation?: AggregationType; // 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none'
  format?: string;               // Display format
}
```

### ChartConfiguration

```tsx
interface ChartConfiguration {
  chartType: ChartType;          // Chart type
  xAxis: FieldMetadata[];        // X-Axis fields (max 1)
  yAxis: FieldMetadata[];        // Y-Axis fields (1-5)
  groupBy: FieldMetadata[];      // Group by fields (max 1)
  filters: FieldMetadata[];      // Filter fields (max 5)
  options: ChartOptions;         // Chart customization
}
```

### ChartOptions

```tsx
interface ChartOptions {
  // Bar Chart
  barOrientation?: 'vertical' | 'horizontal';
  barStacking?: 'none' | 'stacked' | 'grouped';

  // Line Chart
  lineStyle?: 'straight' | 'curved' | 'stepped';
  areaFill?: boolean;
  showPoints?: boolean;

  // Pie/Donut Chart
  labelPosition?: 'inside' | 'outside' | 'none';
  showPercentage?: boolean;

  // General
  colorScheme?: string;
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
}
```

---

## Best Practices

### For Performance
1. Use compact mode for large field lists
2. Limit Y-Axis fields to necessary metrics
3. Use filters to reduce data volume
4. Test with sample data before production

### For Accessibility
1. Always provide chart titles
2. Use high-contrast color schemes
3. Enable legends for screen readers
4. Test keyboard navigation

### For Maintainability
1. Use descriptive field labels
2. Document custom data sources
3. Follow naming conventions
4. Keep chart configurations simple

---

## Examples

### Simple Bar Chart
- **X-Axis**: Campaign name
- **Y-Axis**: Donation amount (SUM)
- **Chart Type**: Bar
- **Options**: Vertical, Grouped

### Time Trend Line
- **X-Axis**: Donation date
- **Y-Axis**: Donation amount (SUM)
- **Chart Type**: Line
- **Options**: Curved, Show points

### Category Breakdown
- **X-Axis**: Project status
- **Y-Axis**: Project count (COUNT)
- **Chart Type**: Pie
- **Options**: Outside labels, Show percentages

### Grouped Comparison
- **X-Axis**: Month
- **Y-Axis**: Donation amount (SUM)
- **Group By**: Campaign
- **Chart Type**: Bar
- **Options**: Stacked

---

## Support Resources

- **Full Documentation**: `/docs/VISUAL_REPORT_BUILDER.md`
- **Implementation Guide**: `/VISUAL_REPORT_BUILDER_IMPLEMENTATION.md`
- **Component Source**: `/src/components/reports/VisualReportBuilder.tsx`
- **Examples**: Built-in sample data in DataSourceSelector

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready
