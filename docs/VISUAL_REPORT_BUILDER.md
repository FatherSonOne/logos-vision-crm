# Visual Report Builder - Documentation

## Overview

The Visual Report Builder is a low-code, drag-and-drop interface for creating custom reports and charts. It provides an intuitive alternative to the step-by-step wizard, allowing users to visually configure reports by dragging fields onto drop zones.

## Architecture

### Component Structure

```
src/components/reports/
├── VisualReportBuilder.tsx           # Main builder component
├── ReportBuilder.tsx                  # Updated with mode toggle
└── builder/
    ├── DataSourceSelector.tsx         # Data source selection
    ├── FieldMapper.tsx                # Available fields list
    ├── ChartConfigurator.tsx          # Chart configuration
    ├── DropZone.tsx                   # Reusable drop zone
    └── DraggableField.tsx             # Draggable field component
```

### Key Technologies

- **@dnd-kit/core** - Modern drag-and-drop framework
- **@dnd-kit/sortable** - Sortable list support
- **@dnd-kit/utilities** - CSS transform utilities
- **Recharts** - Chart rendering library (existing)

## Features

### 1. Data Source Selection

**Location**: Left panel, top section

**Features**:
- Dropdown selector with categorized data sources
- Field preview showing available fields
- Sample data preview
- Field type indicators (text, number, date, boolean)

**Available Data Sources**:
- Donations (Fundraising)
- Clients/Contacts (CRM)
- Projects (Project Management)
- Tasks (Project Management)
- Cases (Case Management)
- Activities (CRM)
- Volunteers (Volunteer Management)
- Engagement Scores (Analytics)

### 2. Field Mapper

**Location**: Left panel, bottom section

**Features**:
- Search functionality to filter fields
- Type filtering (All, Text, Number, Date, Boolean)
- Draggable field items with visual feedback
- Field count by type
- Compact and expanded view modes

**Field Properties**:
- Name and label
- Data type (text, number, date, boolean)
- Aggregation support (SUM, AVG, COUNT, MIN, MAX)
- Format options (date format, number format)

### 3. Chart Configurator

**Location**: Center panel

**Features**:

#### Chart Type Selection
- **Bar Chart** - Compare values across categories
- **Line Chart** - Show trends over time
- **Pie Chart** - Show proportions
- **Donut Chart** - Pie with center hole
- **Area Chart** - Filled line chart
- **Scatter Plot** - Correlation analysis

#### Drop Zones
1. **X-Axis** (required)
   - Categories/Labels
   - Maximum: 1 field
   - Any field type accepted

2. **Y-Axis** (required)
   - Values/Metrics
   - Maximum: 1-5 fields (depends on chart type)
   - Numeric fields only (except pie/donut)
   - Validation feedback

3. **Group By** (optional)
   - Data grouping
   - Maximum: 1 field
   - Categorical fields

4. **Filters** (optional)
   - Data filtering
   - Maximum: 5 fields
   - Any field type

#### Chart Options

**Title & Subtitle**:
- Custom chart title
- Optional subtitle

**Color Schemes**:
- Default (Blues, Greens)
- Pastel (Soft colors)
- Vibrant (Bold colors)
- Ocean (Blue-green palette)
- Sunset (Warm colors)
- Forest (Green palette)

**Bar Chart Options**:
- Orientation: Vertical/Horizontal
- Stacking: None/Stacked/Grouped

**Line/Area Chart Options**:
- Line Style: Straight/Curved/Stepped
- Area Fill: On/Off
- Show Points: On/Off

**Pie/Donut Chart Options**:
- Label Position: Inside/Outside/None
- Show Percentages: On/Off

**General Options**:
- Show Legend: On/Off
- Show Grid: On/Off
- Show Values on Chart: On/Off

### 4. Live Preview

**Location**: Right panel

**Features**:
- Real-time chart preview
- Sample data generation
- Responsive chart rendering
- Visual feedback for configuration changes
- Applies all chart options instantly

**Preview States**:
- Empty state: "Configure axes to see preview"
- Active preview: Live chart with sample data
- Updates automatically on configuration changes

## User Workflow

### Step 1: Select Data Source
1. Click data source dropdown
2. Browse categories (Fundraising, CRM, etc.)
3. Select a data source
4. View available fields and sample data

### Step 2: Drag Fields to Configure Chart
1. Select chart type from grid
2. Drag field from left panel to X-Axis drop zone
3. Drag numeric field(s) to Y-Axis drop zone
4. (Optional) Drag field to Group By
5. (Optional) Drag fields to Filters

### Step 3: Customize Chart
1. Enter chart title and subtitle
2. Select color scheme
3. Configure chart-specific options
4. Toggle general options (legend, grid, values)

### Step 4: Preview & Save
1. Review live preview in right panel
2. Verify configuration
3. Click "Save Report" to create report

## Drag & Drop Behavior

### Field Dragging
- **Activation**: Click and drag with 8px movement threshold
- **Visual Feedback**: Field becomes semi-transparent during drag
- **Drag Overlay**: Shows field being dragged
- **Cursor**: Changes to indicate draggable/droppable state

### Drop Zone Behavior
- **Hover State**: Highlights with indigo border when valid drop
- **Invalid Drop**: No highlight for incompatible field types
- **Full State**: Shows "Maximum fields reached" when full
- **Validation**: Real-time validation with error messages

### Field Removal
- Click X button on dropped field
- Field returns to available fields list
- Drop zone updates automatically

## Validation

### Required Fields
- Data source must be selected
- X-Axis must have 1 field
- Y-Axis must have at least 1 field
- Chart title must be provided

### Field Type Validation
- Y-Axis accepts only numeric fields (except pie/donut)
- Validation errors shown in red with message
- Drop prevented for invalid field types

### Max Items Validation
- X-Axis: 1 field maximum
- Y-Axis: 1-5 fields (chart type dependent)
- Group By: 1 field maximum
- Filters: 5 fields maximum

## Integration with Existing ReportBuilder

### Mode Toggle
The ReportBuilder now supports two modes:

1. **Visual Builder** (default)
   - Drag-and-drop interface
   - Live preview
   - Visual configuration

2. **Step-by-Step Wizard**
   - Original guided workflow
   - Multi-step process
   - Form-based configuration

### Mode Switching
- Toggle located in top-right header
- Switches between modes seamlessly
- Configuration persists where possible

### Backwards Compatibility
- Existing reports load in either mode
- Report data structure unchanged
- All existing features preserved

## Code Examples

### Using VisualReportBuilder Directly

```tsx
import { VisualReportBuilder } from './components/reports/VisualReportBuilder';

function MyComponent() {
  const handleSave = (reportData: Partial<Report>) => {
    console.log('Report saved:', reportData);
    // Save to database
  };

  const handleCancel = () => {
    console.log('Report creation cancelled');
  };

  return (
    <VisualReportBuilder
      report={null}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
```

### Custom Field Metadata

```tsx
import { FieldMetadata } from './components/reports/builder/DraggableField';

const customFields: FieldMetadata[] = [
  {
    id: 'custom.revenue',
    name: 'revenue',
    label: 'Revenue',
    dataType: 'number',
    isNumeric: true,
    isDate: false,
    isCategorical: false,
    aggregation: 'sum',
    format: 'currency',
  },
];
```

### Chart Configuration

```tsx
import { ChartConfiguration } from './components/reports/builder/ChartConfigurator';

const config: ChartConfiguration = {
  chartType: 'bar',
  xAxis: [categoryField],
  yAxis: [revenueField],
  groupBy: [regionField],
  filters: [dateField],
  options: {
    colorScheme: 'ocean',
    title: 'Revenue by Category',
    subtitle: 'Q1 2024',
    showLegend: true,
    showGrid: true,
    barOrientation: 'vertical',
    barStacking: 'grouped',
  },
};
```

## Styling & Theming

### Color Schemes
All color schemes support both light and dark modes:
- Automatic adjustment for dark theme
- Consistent with application design system
- Accessible color contrasts

### Component Styling
- Tailwind CSS for all styling
- Dark mode support throughout
- Consistent spacing and typography
- Hover states and transitions
- Focus indicators for accessibility

## Performance Considerations

### Drag & Drop Optimization
- Pointer sensor with activation constraint
- Minimal re-renders during drag
- CSS transforms for smooth animations
- Debounced state updates

### Preview Rendering
- Memoized chart components
- Sample data generation (not live queries)
- Responsive container sizing
- Lazy loading for large datasets

### Field List Optimization
- Virtual scrolling for large field lists
- Search/filter memoization
- Compact mode for better performance

## Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space to activate buttons
- Escape to cancel operations

### Screen Reader Support
- ARIA labels on all interactive elements
- Descriptive field labels
- Validation error announcements
- Status updates for drag operations

### Visual Accessibility
- High contrast colors
- Focus indicators
- Large touch targets (44px minimum)
- Clear visual feedback

## Future Enhancements

### Planned Features
1. **Field Calculations**
   - Custom formulas
   - Derived fields
   - Aggregation functions

2. **Advanced Filters**
   - Date range pickers
   - Multi-select dropdowns
   - Conditional filters

3. **Template Library**
   - Pre-configured report templates
   - Industry-specific templates
   - Save custom templates

4. **Export Options**
   - PDF export with charts
   - Excel export with data
   - Image export (PNG, SVG)

5. **Collaboration Features**
   - Share reports with teams
   - Comments on reports
   - Version history

### Technical Improvements
1. Real-time data preview (instead of sample)
2. More chart types (Gantt, Sankey, etc.)
3. Custom color palette creator
4. Field relationship visualization
5. Query optimization hints

## Troubleshooting

### Common Issues

**Issue**: Fields won't drag
- **Solution**: Ensure data source is selected first

**Issue**: Y-Axis won't accept field
- **Solution**: Y-Axis requires numeric fields (except pie charts)

**Issue**: Preview shows "Configure axes"
- **Solution**: Ensure both X-Axis and Y-Axis have fields

**Issue**: Can't add more fields to drop zone
- **Solution**: Check maximum field limit for that zone

**Issue**: Chart looks wrong
- **Solution**: Verify field types match chart requirements

## Support

For issues or questions:
1. Check this documentation
2. Review component TypeScript types
3. Examine console for validation errors
4. Test with sample data first

## License

Part of Logos Vision CRM - Internal Use Only
