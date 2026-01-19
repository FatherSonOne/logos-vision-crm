# Advanced Data Table Components

This directory contains advanced data table components built with TanStack Table v8 and TanStack Virtual for the Reports system.

## Components

### 1. AdvancedDataTable

The main table component with comprehensive features for data manipulation and visualization.

**Features:**
- Multi-column sorting (Shift+Click for multi-sort)
- Column filtering with multiple operators
- Global search across all columns
- Row selection (single and multi-select)
- Column visibility toggle
- Density control (compact, comfortable, spacious)
- Client-side pagination
- Export functionality
- Bulk actions for selected rows
- Fully accessible (WCAG 2.1 AA compliant)
- Responsive design
- Dark mode support

**Usage:**
```tsx
import { AdvancedDataTable } from './tables/AdvancedDataTable';
import { ColumnDef } from '@tanstack/react-table';

interface DataRow {
  id: string;
  name: string;
  amount: number;
  date: string;
}

const columns: ColumnDef<DataRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: info => `$${(info.getValue() as number).toLocaleString()}`,
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
];

<AdvancedDataTable
  data={myData}
  columns={columns}
  enableRowSelection={true}
  enableMultiSort={true}
  enableColumnFilters={true}
  enableGlobalFilter={true}
  enablePagination={true}
  pageSize={10}
  onRowClick={(row) => console.log('Clicked:', row)}
  onExport={(selectedRows) => exportData(selectedRows)}
  onBulkAction={(action, rows) => handleBulkAction(action, rows)}
/>
```

### 2. VirtualizedTable

High-performance table component for rendering 10,000+ rows using virtual scrolling.

**Features:**
- Virtual scrolling for massive datasets (10,000+ rows)
- Smooth 60 FPS scrolling performance
- Dynamic row height support
- Scroll-to-row functionality
- All sorting and filtering features from AdvancedDataTable
- Minimal DOM nodes for optimal performance

**Usage:**
```tsx
import { VirtualizedTable } from './tables/VirtualizedTable';

<VirtualizedTable
  data={largeDataset}
  columns={columns}
  height={600}
  estimatedRowHeight={52}
  overscan={5}
  onRowClick={(row) => console.log('Clicked:', row)}
  enableRowSelection={true}
  enableMultiSort={true}
/>
```

**Performance Metrics:**
- Only visible rows are rendered to the DOM
- Handles 10,000+ rows with no performance degradation
- Maintains 60 FPS scrolling on modern browsers
- Memory efficient with automatic cleanup

### 3. TableToolbar

Toolbar component providing table controls and actions.

**Features:**
- Global search input
- Filter toggle button
- Column visibility controls
- Density selector (compact/comfortable/spacious)
- Export button
- Bulk action dropdown (when rows are selected)
- Selected row count indicator

### 4. TableFilters

Advanced filtering panel with multiple filter operators.

**Filter Operators by Data Type:**

**Text Filters:**
- Contains
- Equals
- Starts with
- Ends with

**Number Filters:**
- = (equals)
- > (greater than)
- >= (greater than or equal)
- < (less than)
- <= (less than or equal)
- Between

**Date Filters:**
- Before
- After
- Between
- Last 7 days
- This month

**Additional Features:**
- Filter templates (save and reuse filter combinations)
- Multiple active filters
- Clear all filters
- Visual filter builder UI

## Integration with ReportViewer

The AdvancedDataTable is automatically used in the ReportViewer component when the visualization type is set to 'table':

```tsx
// In ReportViewer.tsx
case 'table':
  const tableColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: info => formatValue(info.getValue() as number),
      enableSorting: true,
      enableColumnFilter: true,
    },
  ];

  return (
    <AdvancedDataTable
      data={data}
      columns={tableColumns}
      enableRowSelection={true}
      enableMultiSort={true}
      enableColumnFilters={true}
      enableGlobalFilter={true}
      enablePagination={true}
      pageSize={10}
      onExport={(selectedRows) => handleExport('csv')}
      onBulkAction={(action, selectedRows) => console.log(action, selectedRows)}
    />
  );
```

## Accessibility Features

All table components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation:**
  - Tab to navigate through interactive elements
  - Enter/Space to activate buttons and toggle selections
  - Arrow keys for sorting (when focused on column headers)

- **ARIA Labels:**
  - `aria-label` on all buttons and controls
  - `aria-sort` on sortable column headers
  - `aria-expanded` on dropdown menus
  - `aria-pressed` on toggle buttons

- **Screen Reader Support:**
  - Semantic HTML table structure
  - Proper table headers and row/cell associations
  - Announced state changes
  - Descriptive button labels

- **Focus Management:**
  - Visible focus indicators
  - Logical tab order
  - Focus trapping in modals/dropdowns

## Performance Optimizations

### AdvancedDataTable
- Memoized column definitions
- Optimized re-renders with React.memo
- Efficient state updates
- Lazy evaluation of filtered/sorted data

### VirtualizedTable
- Only renders visible rows (typically 10-20 rows)
- Automatic row recycling
- Optimized scroll event handling
- Minimal DOM manipulation
- Memory-efficient data structures

## Styling

All components use Tailwind CSS with the existing design system:

- Consistent color palette (indigo primary)
- Dark mode support with `dark:` variants
- Responsive design with mobile-first approach
- Smooth transitions and animations
- Proper spacing and typography

## Testing the Components

A demo component is provided to showcase all features:

```tsx
import { TableDemo } from './tables/TableDemo';

// Renders interactive demo with 100 and 10,000 row examples
<TableDemo />
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `@tanstack/react-table` v8.x - Core table functionality
- `@tanstack/react-virtual` v3.x - Virtual scrolling
- React 18+
- TypeScript 4.9+

## Future Enhancements

Potential improvements for future versions:

1. **Column Resizing** - Drag to resize column widths
2. **Column Reordering** - Drag and drop to reorder columns
3. **Server-side Pagination** - Support for backend pagination APIs
4. **Advanced Export Options** - PDF, Excel with formatting
5. **Row Grouping** - Group rows by column values
6. **Expandable Rows** - Detail rows for hierarchical data
7. **Inline Editing** - Edit cells directly in the table
8. **Custom Cell Renderers** - Rich content cells (charts, images, etc.)
9. **Saved Views** - Save and restore table configurations
10. **Real-time Updates** - WebSocket integration for live data

## Contributing

When adding new features:

1. Maintain accessibility standards (WCAG 2.1 AA)
2. Ensure dark mode compatibility
3. Add TypeScript types for all props and state
4. Include keyboard navigation support
5. Test with screen readers
6. Update this README with new features

## License

Part of the Logos Vision CRM system.
