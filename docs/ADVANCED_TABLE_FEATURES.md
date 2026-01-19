# Advanced Table Features Guide

## Feature Overview

The AdvancedDataTable component provides enterprise-grade table functionality for the Reports system.

## Key Features

### 1. Multi-Column Sorting

**How to Use:**
- Click any column header to sort ascending
- Click again to sort descending
- Click a third time to remove sorting
- Hold Shift and click additional columns for multi-column sorting

**Example:**
```
Sort by Amount (descending) → Shift+Click Date (ascending)
Result: Highest amounts first, then sorted by date within each amount
```

**Visual Indicators:**
- ↑ Up arrow = Ascending
- ↓ Down arrow = Descending
- ↕ Double arrow = Sortable (not currently sorted)

### 2. Column Filtering

**Filter Types by Data Type:**

#### Text Filters
- **Contains**: Partial match anywhere in the text
- **Equals**: Exact match
- **Starts with**: Match from beginning
- **Ends with**: Match at end

#### Number Filters
- **=** Equals
- **>** Greater than
- **>=** Greater than or equal to
- **<** Less than
- **<=** Less than or equal to
- **Between**: Range with min/max values

#### Date Filters
- **Before**: Earlier than specified date
- **After**: Later than specified date
- **Between**: Date range
- **Last 7 days**: Automatic (no input needed)
- **This month**: Automatic (no input needed)

**How to Use:**
1. Click "Filters" button in toolbar
2. Click "Add Filter" to create a new filter
3. Select column, operator, and value
4. Add multiple filters for complex queries
5. Click "Clear All" to remove all filters

**Filter Templates:**
- Save common filter combinations
- Name and reuse frequently used filters
- Quick access to saved templates

### 3. Global Search

**Features:**
- Searches across ALL columns simultaneously
- Real-time results as you type
- Case-insensitive matching
- Highlights matching rows

**How to Use:**
1. Type in the search box in the toolbar
2. Results filter automatically
3. Clear search to show all rows

**Example:**
```
Search: "john"
Finds: "John Smith", "Johnson Inc.", "john@email.com"
```

### 4. Row Selection

**Single Selection:**
- Click checkbox in any row
- Click row to view details (if enabled)

**Multi-Selection:**
- Click individual row checkboxes
- Click header checkbox to select all visible rows
- Shift+Click for range selection (future)

**Selected Row Actions:**
- Export selected rows only
- Perform bulk actions on selected rows
- View count in toolbar

### 5. Column Visibility

**Features:**
- Show/hide any column
- Checkbox list of all columns
- Selection persists during session

**How to Use:**
1. Click columns icon in toolbar
2. Check/uncheck columns to show/hide
3. Close menu to apply changes

**Use Cases:**
- Focus on specific data
- Simplify view for presentations
- Export only needed columns

### 6. Density Control

**Three Density Levels:**

#### Compact
- Minimal padding
- Maximum rows visible
- Best for data-heavy views
- Row height: 40px

#### Comfortable (Default)
- Balanced spacing
- Good readability
- General purpose use
- Row height: 52px

#### Spacious
- Maximum padding
- Best readability
- Presentation mode
- Row height: 64px

**How to Use:**
1. Click density icon in toolbar
2. Select desired density
3. Table updates immediately

### 7. Pagination

**Features:**
- Client-side pagination
- Customizable page sizes (10, 25, 50, 100)
- First/Previous/Next/Last navigation
- Current page and total pages display

**Controls:**
- First: Jump to page 1
- Previous: Go back one page
- Next: Advance one page
- Last: Jump to final page
- Page size dropdown: Change rows per page

**Status Display:**
```
Showing 1 to 10 of 247 results
3 selected
Page 1 of 25
```

### 8. Export Functionality

**Export Options:**
- Export all rows
- Export selected rows only
- Export filtered results

**Integration:**
- Uses existing ReportViewer export service
- Supports CSV, Excel, PDF formats
- Preserves current sort order
- Includes filtered data only

**How to Use:**
1. (Optional) Select specific rows
2. Click export icon in toolbar
3. Choose format from dropdown
4. File downloads automatically

### 9. Bulk Actions

**Available Actions:**
- Delete selected rows
- Export selected rows
- Custom actions (configurable)

**How to Use:**
1. Select one or more rows
2. Click "Actions" button (appears when rows selected)
3. Choose action from dropdown
4. Confirm action (if required)

### 10. Loading States

**Features:**
- Animated spinner
- "Loading data..." message
- Prevents interaction during load
- Smooth transition when complete

**Display:**
```
┌─────────────────────┐
│                     │
│    ⟳  Loading...    │
│                     │
└─────────────────────┘
```

### 11. Empty States

**Features:**
- Clear messaging when no data
- Helpful suggestions
- Icon illustration
- Call-to-action (if applicable)

**Display:**
```
┌─────────────────────────┐
│         📄              │
│   No data available     │
│                         │
│ Try adjusting filters   │
└─────────────────────────┘
```

## Virtual Scrolling (10,000+ Rows)

### VirtualizedTable Component

**When to Use:**
- 1,000+ rows
- Performance critical views
- Large datasets
- Real-time data feeds

**Features:**
- Smooth 60 FPS scrolling
- Renders only visible rows
- Memory efficient
- Scroll-to-row functionality

**Performance Stats Display:**
```
Total rows: 10,000
Rendered: 15
Performance: 60 FPS
```

**Jump to Row:**
1. Enter row number in input
2. Click "Go" or press Enter
3. Table scrolls to that row

## Accessibility Features

### Keyboard Navigation

**Table Controls:**
- `Tab` - Navigate to next control
- `Shift+Tab` - Navigate to previous control
- `Enter/Space` - Activate button or toggle
- `Escape` - Close dropdown menus

**Column Headers:**
- `Tab` - Focus header
- `Enter/Space` - Toggle sort
- `Shift+Click` - Multi-sort

**Row Selection:**
- `Tab` - Navigate to checkbox
- `Space` - Toggle selection
- `Enter` - Open row (if clickable)

### Screen Reader Support

**Announcements:**
- Sort direction changes
- Filter applied/removed
- Row selection count
- Page changes
- Loading states

**ARIA Labels:**
- All buttons have descriptive labels
- Table structure properly marked
- Column headers associated with cells
- Current sort state announced

### Focus Management

**Visible Indicators:**
- Blue outline on focused elements
- Clear focus order
- Logical tab sequence
- Skip to main content

## Styling Guide

### Color Scheme

**Light Mode:**
- Primary: Indigo (#4F46E5)
- Background: White
- Text: Gray-900
- Borders: Gray-200
- Hover: Gray-50

**Dark Mode:**
- Primary: Indigo-400
- Background: Gray-900
- Text: White
- Borders: Gray-700
- Hover: Gray-800

### Status Colors

**Success/Completed:**
- Light: Green-100 / Green-700
- Dark: Green-900/30 / Green-400

**Warning/Pending:**
- Light: Yellow-100 / Yellow-700
- Dark: Yellow-900/30 / Yellow-400

**Error/Failed:**
- Light: Red-100 / Red-700
- Dark: Red-900/30 / Red-400

**Info/Selected:**
- Light: Indigo-100 / Indigo-700
- Dark: Indigo-900/30 / Indigo-400

## Best Practices

### Performance

1. **Use Virtualization for Large Datasets**
   - Standard table: < 1,000 rows
   - Virtualized table: > 1,000 rows

2. **Optimize Column Definitions**
   - Memoize column definitions
   - Use simple cell renderers when possible
   - Avoid expensive computations in cells

3. **Filter Before Sorting**
   - Apply filters first to reduce dataset
   - Then apply sorting for better performance

### User Experience

1. **Provide Clear Feedback**
   - Show loading states
   - Display row counts
   - Indicate selected rows
   - Confirm bulk actions

2. **Use Appropriate Density**
   - Compact for data analysis
   - Comfortable for general use
   - Spacious for presentations

3. **Default Settings**
   - Start with 10-25 rows per page
   - Enable most relevant columns
   - Set comfortable density
   - No filters active initially

### Accessibility

1. **Keyboard Support**
   - Test all features with keyboard only
   - Ensure logical tab order
   - Provide keyboard shortcuts

2. **Screen Reader Testing**
   - Test with NVDA/JAWS/VoiceOver
   - Verify announcements
   - Check table navigation

3. **Visual Clarity**
   - Maintain color contrast
   - Use clear labels
   - Provide visual feedback

## Common Use Cases

### 1. Donation Reports

**Setup:**
```tsx
const columns = [
  { accessorKey: 'donorName', header: 'Donor' },
  { accessorKey: 'amount', header: 'Amount', cell: formatCurrency },
  { accessorKey: 'date', header: 'Date', cell: formatDate },
  { accessorKey: 'campaign', header: 'Campaign' },
];
```

**Common Filters:**
- Amount > $1,000 (major gifts)
- Date = Last 7 days (recent)
- Campaign = Annual Fund

### 2. Client Lists

**Setup:**
```tsx
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'status', header: 'Status' },
];
```

**Common Actions:**
- Export selected clients
- Bulk email to selected
- Filter by location

### 3. Financial Reports

**Setup:**
```tsx
const columns = [
  { accessorKey: 'account', header: 'Account' },
  { accessorKey: 'debit', header: 'Debit', cell: formatCurrency },
  { accessorKey: 'credit', header: 'Credit', cell: formatCurrency },
  { accessorKey: 'balance', header: 'Balance', cell: formatCurrency },
];
```

**Common Features:**
- Sort by balance (descending)
- Filter debit/credit amounts
- Export to Excel

## Troubleshooting

### Table Not Sorting

**Issue:** Clicking headers doesn't sort
**Solution:**
- Check `enableSorting: true` in column definition
- Verify `enableMultiSort` prop is true
- Check data type compatibility

### Filters Not Working

**Issue:** Filters don't affect results
**Solution:**
- Verify `enableColumnFilter: true` in columns
- Check `enableColumnFilters` prop
- Ensure filter values match data types

### Performance Issues

**Issue:** Table is slow with large datasets
**Solution:**
- Use VirtualizedTable for > 1,000 rows
- Reduce number of visible columns
- Simplify cell renderers
- Enable pagination

### Selection Not Working

**Issue:** Can't select rows
**Solution:**
- Check `enableRowSelection: true` prop
- Verify checkbox column is included
- Check event handlers

### Export Not Working

**Issue:** Export button doesn't work
**Solution:**
- Verify `onExport` callback is provided
- Check export service is available
- Ensure data is properly formatted

## Tips and Tricks

### Power User Features

1. **Multi-Sort**
   - Hold Shift and click multiple headers
   - Sort priority follows click order
   - Click without Shift to reset

2. **Quick Filter Clear**
   - Click "Clear All" in filter panel
   - Clears all filters at once
   - Search box clears separately

3. **Keyboard Shortcuts**
   - Tab through controls quickly
   - Enter to activate buttons
   - Escape to close dropdowns

### Developer Tips

1. **Column Definition Pattern**
   ```tsx
   const columns = useMemo<ColumnDef<DataType>[]>(() => [
     // Column definitions
   ], []);
   ```

2. **Custom Cell Rendering**
   ```tsx
   {
     accessorKey: 'amount',
     cell: ({ getValue }) => {
       const value = getValue<number>();
       return <span className="font-bold">${value}</span>;
     }
   }
   ```

3. **Conditional Styling**
   ```tsx
   {
     accessorKey: 'status',
     cell: ({ getValue }) => {
       const status = getValue<string>();
       const color = status === 'active' ? 'green' : 'gray';
       return <Badge color={color}>{status}</Badge>;
     }
   }
   ```

---

**For More Information:**
- Component README: `src/components/reports/tables/README.md`
- TanStack Table Docs: https://tanstack.com/table
- Demo Component: `src/components/reports/tables/TableDemo.tsx`
