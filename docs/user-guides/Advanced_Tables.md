# Advanced Tables Guide

Master the powerful table features in Logos Vision CRM Reports to work efficiently with large datasets, complex sorting, and advanced interactions.

## Table of Contents
- [Overview](#overview)
- [Multi-Column Sorting](#multi-column-sorting)
- [Filtering and Searching](#filtering-and-searching)
- [Column Management](#column-management)
- [Row Selection and Bulk Actions](#row-selection-and-bulk-actions)
- [Pagination Controls](#pagination-controls)
- [Exporting Table Data](#exporting-table-data)
- [Virtual Scrolling](#virtual-scrolling)
- [Advanced Features](#advanced-features)
- [Tips and Tricks](#tips-and-tricks)

---

## Overview

Tables are the most versatile visualization type in the Reports system. They provide detailed, searchable, sortable views of your data with extensive customization options.

### When to Use Tables

**Tables are ideal for:**
- Displaying detailed record information
- Reports that need searching and filtering
- Data that will be exported to Excel
- Lists requiring row-by-row analysis
- Reports with many fields (10+ columns)
- Data requiring precise values

**Table advantages:**
- Show the most information
- Highly interactive (sort, search, filter)
- Familiar to all users
- Excellent for data entry verification
- Easy to export and print

**[Screenshot: Full-featured table with all controls visible]**

---

## Multi-Column Sorting

### Basic Sorting

Click any column header to sort by that column.

**Sort indicators:**
- **↑ (up arrow)**: Sorted ascending (A-Z, 0-9, oldest to newest)
- **↓ (down arrow)**: Sorted descending (Z-A, 9-0, newest to oldest)
- **No arrow**: Not sorted

**Click behavior:**
- **First click**: Sort ascending
- **Second click**: Sort descending
- **Third click**: Remove sort (return to default)

**[Screenshot: Column header with sort indicators]**

### Multi-Column Sorting

Hold **Shift** and click column headers to sort by multiple columns.

**Example: Sort opportunities**
1. Click **Stage** (sorts by stage)
2. Hold **Shift** and click **Amount** (then sorts by amount within each stage)
3. Hold **Shift** and click **Close Date** (then sorts by date within each stage/amount)

**Sort priority indicators:**
- Numbers appear in column headers: ①, ②, ③
- Shows the sort order sequence
- Lower numbers = higher priority

**[Screenshot: Multi-column sort with priority numbers]**

### Sort Configuration Menu

Right-click any column header for advanced sort options:

**Sort Options:**
- **Sort A-Z**: Ascending sort
- **Sort Z-A**: Descending sort
- **Clear Sort**: Remove sorting from this column
- **Clear All Sorts**: Remove all sorting
- **Custom Sort**: Define custom sort order

**Custom Sort Orders:**

For text fields like Stage, Priority, or Status, you can define a custom order instead of alphabetical.

**Example: Opportunity Stage Custom Order**
```
1. Prospecting
2. Qualification
3. Needs Analysis
4. Proposal
5. Negotiation
6. Closed Won
7. Closed Lost
```

**To create custom sort:**
1. Right-click column header → **Custom Sort**
2. Drag values into desired order
3. Click **Apply**
4. Sort now uses your custom order

**[Screenshot: Custom sort order dialog]**

### Default Sort Order

Set the default sort order when the report opens.

**To configure:**
1. Click **"Report Settings"** (gear icon)
2. Go to **"Sorting"** tab
3. Add sort levels:
   - Primary sort
   - Secondary sort
   - Tertiary sort
4. Choose direction for each
5. Click **"Save"**

**Best practices:**
- Sort by most important field first
- Use secondary sorts for tie-breaking
- Consider user expectations (newest first? A-Z?)
- Date fields often sorted newest first
- Amount fields often sorted highest first

---

## Filtering and Searching

### Quick Search

The search box at the top of the table searches across all visible columns.

**Search features:**
- **Real-time filtering**: Results update as you type
- **Case-insensitive**: "smith" finds "Smith" and "SMITH"
- **Partial matching**: "john" finds "Johnson" and "John Smith"
- **Multi-column**: Searches all text columns
- **Highlighted results**: Matching text is highlighted

**Search tips:**
> **💡 Use quotes** for exact phrases: "Acme Corp" only finds exact match
>
> **🔍 Use spaces** for AND search: "john smith" finds records with both words
>
> **⚡ Search is instant** - no need to press Enter

**[Screenshot: Search box with highlighted results in table]**

### Column Filtering

Each column can have its own filter.

**To filter a column:**
1. Click the **filter icon** in the column header
2. Choose filter type based on column type
3. Set filter criteria
4. Click **"Apply"**

**Filter Types by Column:**

**Text Columns**
- **Contains**: Find partial matches
- **Equals**: Exact match only
- **Starts With**: Prefix matching
- **Ends With**: Suffix matching
- **Is Empty / Is Not Empty**: Check for blank values

**Number Columns**
- **Equals**: Exact value
- **Greater Than / Less Than**: Comparison
- **Between**: Range of values
- **Top N**: Show top 10, 25, 50, etc.
- **Bottom N**: Show bottom 10, 25, 50, etc.

**Date Columns**
- **Equals**: Specific date
- **Before / After**: Date comparison
- **Between**: Date range
- **Relative**: Last/Next N days, weeks, months
- **Quick Filters**: Today, Yesterday, This Week, Last Month, etc.

**Boolean Columns**
- **Is True**: Checkboxes that are checked
- **Is False**: Checkboxes that are not checked
- **All**: Show both

**List/Dropdown Columns**
- **Checkboxes**: Select one or more values
- **All / None / Invert**: Quick selection
- **Search**: Find values in long lists

**[Screenshot: Column filter menu for different column types]**

### Active Filters Display

**Filter pills** appear above the table showing active filters.

**Filter pill features:**
- Shows field name and criteria
- Click **X** to remove individual filter
- Click **"Clear All"** to remove all filters
- Click pill to edit filter

**Example:**
```
[Stage: Qualification, Proposal] × [Amount: >50000] × [Close Date: Next 90 Days] × | Clear All
```

**[Screenshot: Active filters displayed as pills]**

### Advanced Filter Builder

For complex filtering needs, use the Advanced Filter Builder.

**To access:**
1. Click **"Advanced Filters"** button
2. Filter builder panel opens

**Features:**
- **AND/OR Logic**: Combine conditions with AND or OR
- **Nested Groups**: Create complex logic trees
- **All Operators**: Access all filter operators
- **Save as Template**: Reuse complex filters
- **Formula Filters**: Use custom formulas

**Example: Complex Filter**
```
(Stage = "Proposal" OR Stage = "Negotiation")
AND
Amount > 50000
AND
(Close Date is in Next 90 Days OR Probability > 75%)
```

**[Screenshot: Advanced filter builder with nested conditions]**

See [Advanced Filtering](Advanced_Filtering.md) for complete details.

---

## Column Management

### Show/Hide Columns

Control which columns are visible.

**To show/hide columns:**
1. Click **"Columns"** button (or column icon)
2. Checkbox list of all columns appears
3. Check/uncheck columns
4. Changes apply immediately
5. Click outside to close

**Features:**
- **Show All**: Make all columns visible
- **Hide All**: Hide all columns (must keep at least 1)
- **Reset**: Return to default column set
- **Search**: Find columns in long lists

**Saved column sets:**
- Save current column selection as a preset
- Quick switch between different column sets
- Share column sets with team

**[Screenshot: Column show/hide menu]**

### Reorder Columns

Rearrange columns to suit your workflow.

**Drag-and-drop reordering:**
1. Click and hold a column header
2. Drag left or right
3. Drop in new position
4. Column moves immediately

**Alternative: Column Settings**
1. Click **"Columns"** button
2. Drag columns in the list
3. Order updates in real-time

**Best practices:**
- Put most important columns first
- Group related columns together
- Keep identifier columns (name, ID) leftmost
- Consider freeze column feature for key fields

**[Screenshot: Column being dragged to new position]**

### Resize Columns

Adjust column widths for optimal readability.

**Methods:**

**1. Drag Column Border**
- Hover between column headers (cursor changes to ↔)
- Click and drag left/right
- Release to set width

**2. Double-Click Border**
- Double-click column border
- Column auto-sizes to fit content
- Works for both data and header

**3. Column Settings Menu**
- Right-click column header
- Choose **"Resize"**
- Options:
  - Auto-fit Content
  - Auto-fit Header
  - Set Specific Width (pixels)
  - Set Minimum Width
  - Set Maximum Width

**4. Resize All Columns**
- Right-click any header
- Choose **"Auto-fit All Columns"**
- All columns resize to fit content

**[Screenshot: Resizing column by dragging border]**

### Freeze Columns

Keep important columns visible while scrolling horizontally.

**To freeze columns:**
1. Right-click the column header
2. Choose **"Freeze Column"**
3. Column and all columns to its left are frozen
4. Frozen columns have a visual indicator

**To unfreeze:**
1. Right-click any frozen column
2. Choose **"Unfreeze Columns"**

**Common uses:**
- Freeze "Name" column while viewing other fields
- Freeze "ID" and "Name" for reference
- Keep identifier columns always visible

**Visual indicators:**
- Vertical line separates frozen from scrollable columns
- Frozen columns have slight background tint
- Frozen columns don't scroll with horizontal scrollbar

**[Screenshot: Table with frozen columns and scroll indicator]**

### Column Formatting

Customize how data appears in each column.

**Formatting options:**

**Alignment**
- Left (default for text)
- Center
- Right (default for numbers)

**Number Formatting**
- **Currency**: $1,234.56
  - Choose currency symbol ($ € £ ¥)
  - Decimal places (0-4)
  - Thousand separator
- **Percentage**: 45.2%
  - Decimal places
- **Number**: 1,234.56
  - Decimal places
  - Thousand separator
- **Custom**: Define your own format

**Date Formatting**
- **Short**: 1/17/26
- **Medium**: Jan 17, 2026
- **Long**: January 17, 2026
- **Full**: Monday, January 17, 2026
- **Relative**: 2 days ago, In 5 days
- **Time**: 2:30 PM, 14:30
- **Custom**: MM/DD/YYYY, DD-MMM-YY, etc.

**Text Formatting**
- **Case**: UPPER, lower, Title Case
- **Truncate**: Show first N characters + ...
- **Wrap**: Allow multi-line text in cells
- **Links**: Make URLs and emails clickable
- **HTML**: Render HTML content (use caution)

**To configure:**
1. Right-click column header
2. Choose **"Format"**
3. Select formatting options
4. Click **"Apply"**

**[Screenshot: Column formatting dialog]**

### Conditional Formatting

Apply visual formatting based on cell values.

**Format types:**
- **Background Color**: Highlight cells with colors
- **Text Color**: Change text color
- **Icons**: Add status icons
- **Data Bars**: Progress bar in cell
- **Color Scales**: Gradient based on value

**To create conditional formatting:**
1. Right-click column header
2. Choose **"Conditional Formatting"**
3. Click **"Add Rule"**
4. Set condition:
   - If Amount > 100000
   - If Status = "Overdue"
   - If Probability >= 75
5. Choose formatting:
   - Background: Green
   - Text: Bold
   - Icon: ✓
6. Click **"Apply"**

**Example Rules:**

**Opportunity Amount**
- If > $100,000 → Green background
- If $50,000-$100,000 → Yellow background
- If < $50,000 → No formatting

**Task Status**
- If Status = "Overdue" → Red text, ⚠ icon
- If Status = "Due Today" → Orange text, ⏰ icon
- If Status = "Completed" → Green text, ✓ icon

**Deal Probability**
- 0-25%: Red data bar
- 26-50%: Orange data bar
- 51-75%: Yellow data bar
- 76-100%: Green data bar

**[Screenshot: Conditional formatting rules and results]**

---

## Row Selection and Bulk Actions

### Selecting Rows

Multiple ways to select rows for bulk actions.

**Selection methods:**

**1. Checkbox Column**
- Checkboxes appear in first column (if enabled)
- Click checkbox to select individual row
- Click header checkbox to select all visible rows

**2. Click Row**
- Click anywhere on row to select (if enabled)
- Click again to deselect
- Visual highlight shows selection

**3. Keyboard Selection**
- Click first row
- Hold **Shift** and click last row (selects range)
- Hold **Ctrl** (or **Cmd** on Mac) and click (add to selection)

**4. Select All**
- Click **"Select All"** button
- Options:
  - Select All Visible (current page)
  - Select All Matching (all filtered records)
  - Select None (clear selection)

**Selection indicators:**
- Selected rows have background highlight
- Selection count shown: "15 rows selected"
- Selection persists across pagination

**[Screenshot: Multiple rows selected with checkboxes]**

### Bulk Actions

Perform actions on multiple selected rows.

**Available bulk actions:**

**Export Selected**
- Export only selected rows
- Choose format (CSV, Excel, PDF)
- Faster than exporting entire report

**Update Selected**
- Update a field on all selected rows
- Example: Assign all selected tasks to a user
- Confirmation required

**Delete Selected**
- Delete selected records
- Requires permission
- Confirmation required (irreversible)

**Tag Selected**
- Add or remove tags from selected rows
- Bulk tagging for organization

**Send Email to Selected**
- Send email to contacts in selected rows
- Opens email composer with recipients pre-filled

**Create Task for Selected**
- Create task associated with selected records
- Example: "Call all selected contacts"

**Add to List/Campaign**
- Add selected contacts to marketing list
- Add to campaign

**Custom Actions**
- Your organization's custom bulk actions
- Workflow automations

**To perform bulk action:**
1. Select rows using any method
2. Click **"Actions"** dropdown
3. Choose action
4. Configure action details
5. Click **"Execute"**
6. Confirm if required

**[Screenshot: Bulk actions dropdown menu]**

### Selection Modes

Configure how row selection works.

**Settings:**
- **Enable Selection**: Yes/No
- **Selection Type**: Checkbox, Row Click, or Both
- **Persist Selection**: Keep selection across page changes
- **Max Selection**: Limit number of selectable rows
- **Select All Limit**: Max rows for "Select All" operation

**To configure:**
1. Report Settings → **"Table Options"** tab
2. Configure selection settings
3. Click **"Save"**

---

## Pagination Controls

### Pagination Options

Control how many rows appear per page.

**Rows per page options:**
- 10 rows
- 25 rows (default)
- 50 rows
- 100 rows
- 200 rows
- All rows (use caution with large datasets)

**To change:**
- Click **"Rows per page"** dropdown
- Select desired number
- Table reloads with new page size

**Pagination info:**
- Shows current range: "1-25 of 247"
- Shows total filtered records
- Shows total records (if different due to filters)

**[Screenshot: Pagination controls]**

### Navigation Controls

Move between pages efficiently.

**Navigation buttons:**
- **⏮ First**: Jump to first page
- **◀ Previous**: Previous page
- **▶ Next**: Next page
- **⏭ Last**: Jump to last page

**Page number input:**
- Click current page number
- Type page number
- Press Enter to jump to page

**Keyboard shortcuts:**
- **→ (Right Arrow)**: Next page
- **← (Left Arrow)**: Previous page
- **Home**: First page
- **End**: Last page
- **Page Down**: Next page
- **Page Up**: Previous page

**[Screenshot: Pagination with page number input]**

### Infinite Scroll Option

Alternative to pagination: infinite scroll.

**To enable:**
1. Report Settings → **"Table Options"**
2. Enable **"Infinite Scroll"**
3. Click **"Save"**

**How it works:**
- No page buttons
- Scroll to bottom → more rows load automatically
- "Load More" button appears at bottom
- Virtual scrolling for performance

**When to use:**
- Browsing large datasets
- Mobile-friendly reports
- Exploratory data analysis
- When page boundaries are distracting

**When to avoid:**
- Reports that will be printed
- Users need to know exact position
- Need to jump to specific page
- Performance concerns with huge datasets

---

## Exporting Table Data

### Quick Export

Export table data directly from the table view.

**Export button:**
- Located in table toolbar
- Dropdown with format options:
  - CSV
  - Excel
  - PDF
  - Copy to Clipboard

**What gets exported:**
- **Visible columns only** (hidden columns excluded)
- **Current filter** (only filtered rows)
- **Current sort order** (exports in sorted order)
- **Selected rows** (if any selected, otherwise all)

**To export:**
1. Configure table as desired (columns, filters, sort)
2. (Optional) Select specific rows
3. Click **"Export"** dropdown
4. Choose format
5. File downloads immediately

**[Screenshot: Export dropdown menu]**

### Export Options

Each format has configuration options.

**CSV Options:**
- Delimiter: Comma, Tab, Semicolon, Pipe
- Text qualifier: Double quote, Single quote, None
- Include headers: Yes/No
- Encoding: UTF-8, ASCII, Latin-1

**Excel Options:**
- Include formatting: Yes/No (colors, fonts)
- Include formulas: Yes/No (if calculated fields)
- Freeze header row: Yes/No
- Auto-fit columns: Yes/No
- Sheet name: Custom name
- Include filters: Yes/No (Excel filter dropdowns)

**PDF Options:**
- Orientation: Portrait, Landscape, Auto
- Page size: Letter, Legal, A4, etc.
- Fit to page: Shrink to fit width
- Include page numbers: Yes/No
- Include date/time: Yes/No
- Header/Footer: Custom text

**Copy to Clipboard:**
- Format: Tab-delimited (paste into Excel)
- Include headers: Yes/No
- Notification when copied

**[Screenshot: Excel export options dialog]**

See [Exporting Reports](Exporting_Reports.md) for complete export details.

---

## Virtual Scrolling

### What is Virtual Scrolling?

Virtual scrolling is a performance optimization that renders only visible rows, allowing smooth scrolling through huge datasets.

**How it works:**
- Only 20-30 rows rendered in DOM at any time
- Rows above/below viewport are "virtual"
- As you scroll, rows are rendered/destroyed dynamically
- Smooth performance even with 100,000+ rows

**Benefits:**
- ✓ Fast initial load
- ✓ Smooth scrolling
- ✓ Low memory usage
- ✓ No pagination needed for browsing
- ✓ Better user experience

**[Screenshot: Virtual scrolling visualization diagram]**

### When Virtual Scrolling is Used

Virtual scrolling automatically activates when:

- Table has > 1,000 rows
- Infinite scroll is enabled
- User is on a device with limited resources

**You can force enable/disable:**
1. Report Settings → **"Performance"** tab
2. Virtual Scrolling:
   - Auto (default)
   - Always On
   - Always Off
3. Click **"Save"**

### Virtual Scrolling Limitations

Some features are limited with virtual scrolling:

**Not available:**
- Row spanning (merged cells)
- Variable row heights (must be fixed height)
- Select all rows (can select all visible or all matching filter)

**Reduced performance:**
- Complex cell rendering (charts in cells)
- Heavy conditional formatting
- Computed columns with expensive calculations

> **⚠️ Note**: These limitations rarely affect typical use cases. Benefits usually outweigh limitations.

---

## Advanced Features

### Grouping

Group rows by column values with expandable/collapsible groups.

**To enable grouping:**
1. Drag column header to grouping area (above table)
2. Rows automatically group by that column
3. Click group header to expand/collapse

**Multi-level grouping:**
- Drag multiple columns to grouping area
- Creates nested groups
- Example: Group by Stage → then by Owner

**Group features:**
- Group row shows count: "Qualification (15)"
- Aggregate values: Sum, Average, Count
- Expand/collapse all button
- Export preserves grouping

**[Screenshot: Table with multi-level grouping]**

### Aggregation Row

Show summary statistics at the bottom of the table.

**To enable:**
1. Report Settings → **"Table Options"**
2. Enable **"Show Summary Row"**
3. Click **"Save"**

**Aggregations available:**
- **Count**: Number of rows
- **Sum**: Total of numeric column
- **Average**: Mean of numeric column
- **Min**: Minimum value
- **Max**: Maximum value
- **Median**: Middle value
- **Distinct Count**: Unique values

**Configure per column:**
1. Right-click column header
2. Choose **"Summary Function"**
3. Select aggregation type

**Example summary row:**
```
| Name          | Amount    | Probability | Close Date |
|---------------|-----------|-------------|------------|
| Acme Deal     | $100,000  | 75%         | 3/15/26    |
| Beta Project  | $50,000   | 50%         | 4/20/26    |
| ...           | ...       | ...         | ...        |
|---------------|-----------|-------------|------------|
| TOTAL (247)   | $8,547,200| 62% (avg)   |            |
```

**[Screenshot: Table with summary/aggregation row]**

### In-line Editing

Edit data directly in the table (if permissions allow).

**To enable:**
1. Report Settings → **"Table Options"**
2. Enable **"Allow In-line Editing"**
3. Choose editable columns
4. Click **"Save"**

**How to edit:**
- Double-click cell to enter edit mode
- Edit value
- Press **Enter** to save or **Esc** to cancel
- Cell highlights during edit
- Auto-saves when you tab to next cell

**Edit validations:**
- Required fields enforced
- Data type validation
- Custom validation rules
- Error messages displayed in-line

**Bulk edit mode:**
- Select multiple rows
- Edit a column value
- Change applies to all selected rows

> **⚠️ Important**: In-line editing directly modifies your data. Use with caution. Consider requiring confirmation for edits.

**[Screenshot: In-line editing active in table cell]**

### Pinned Rows

Pin specific rows to the top or bottom of the table.

**To pin rows:**
1. Right-click row
2. Choose **"Pin to Top"** or **"Pin to Bottom"**
3. Row moves to pinned area

**Use cases:**
- Pin total/summary rows to top
- Pin important records for quick access
- Pin reference data
- Keep key records visible while scrolling

**Pinned row indicators:**
- Visual separator from regular rows
- Different background color
- Pin icon appears in row

**To unpin:**
- Right-click pinned row
- Choose **"Unpin"**

**[Screenshot: Table with pinned rows at top]**

### Row Styling

Apply custom styling to entire rows based on conditions.

**Example: Highlight overdue tasks**

Condition: Due Date < Today AND Status ≠ Complete
Style: Red background, bold text

**To configure:**
1. Report Settings → **"Row Styling"**
2. Click **"Add Rule"**
3. Set condition (same as filters)
4. Choose style:
   - Background color
   - Text color
   - Font weight (bold)
   - Font style (italic)
   - Border
5. Set priority (if multiple rules match)
6. Click **"Save"**

**[Screenshot: Row styling rules configuration]**

### Column Pinning

Similar to freezing, but more flexible.

**Pin columns to:**
- Left side (default freeze behavior)
- Right side (keep actions visible)

**To pin:**
1. Right-click column header
2. Choose **"Pin Left"** or **"Pin Right"**

**Use cases:**
- Pin action buttons to right
- Pin status indicators to right
- Keep both name (left) and actions (right) visible

**[Screenshot: Columns pinned to left and right]**

---

## Tips and Tricks

### Performance Optimization

**For large tables (10,000+ rows):**

✓ **Use filters** to reduce visible rows
✓ **Enable virtual scrolling** for smooth performance
✓ **Hide unused columns** - fewer columns = faster rendering
✓ **Limit complex formatting** - conditional formatting on every row is expensive
✓ **Avoid computed columns** with complex calculations
✓ **Use pagination** instead of showing all rows
✓ **Disable in-line editing** if not needed
✓ **Simplify cell content** - avoid HTML rendering in cells

**[Screenshot: Performance settings panel]**

### Keyboard Shortcuts

Master these shortcuts for faster table navigation:

**Navigation:**
- **↑↓←→ Arrow keys**: Navigate between cells
- **Tab**: Next cell, next row when at end
- **Shift+Tab**: Previous cell
- **Home**: First cell in row
- **End**: Last cell in row
- **Ctrl+Home**: First cell in table
- **Ctrl+End**: Last cell in table
- **Page Up/Down**: Scroll page

**Selection:**
- **Shift+Click**: Select range
- **Ctrl+Click**: Add to selection
- **Ctrl+A**: Select all visible rows
- **Ctrl+Shift+A**: Select all matching filter

**Actions:**
- **Ctrl+C**: Copy selected cells
- **Ctrl+E**: Export
- **Ctrl+F**: Focus search box
- **Ctrl+P**: Print
- **F5**: Refresh data

### Saving Table Views

Save different configurations of the same report.

**What gets saved:**
- Column visibility and order
- Column widths
- Sort configuration
- Filters
- Grouping
- Page size

**To save a view:**
1. Configure table as desired
2. Click **"Save View"** button
3. Enter view name: "My Opportunities View"
4. Click **"Save"**

**To load a view:**
1. Click **"Views"** dropdown
2. Select saved view
3. Table reconfigures instantly

**Sharing views:**
- Save as **"Personal"** (only you see it)
- Save as **"Shared"** (team can use it)
- Set as **"Default"** (opens with this view)

**[Screenshot: Save view dialog and view selector]**

### Quick Filters

Access common filters quickly without opening filter builder.

**Quick filter chips:**
- Appear above table
- One click to apply
- Examples:
  - "My Records"
  - "Active Only"
  - "Last 30 Days"
  - "High Value"
  - "Overdue"

**To create quick filters:**
1. Report Settings → **"Quick Filters"**
2. Click **"Add Quick Filter"**
3. Name: "High Value Deals"
4. Condition: Amount > $50,000
5. Icon: Choose icon
6. Click **"Save"**

**Quick filters appear as:**
```
[My Records] [Active Only] [Last 30 Days] [High Value ✓]
```

**[Screenshot: Quick filter chips above table]**

### Column Presets

Create preset column sets for different scenarios.

**Example: Opportunities Report**

**Preset 1: "Overview"**
- Company Name
- Opportunity Name
- Amount
- Stage
- Close Date

**Preset 2: "Detailed"**
- All fields from Overview +
- Probability
- Lead Source
- Owner
- Created Date
- Last Activity

**Preset 3: "Financial"**
- Company Name
- Opportunity Name
- Amount
- Discount
- Net Amount
- Payment Terms
- Invoice Date

**To switch between presets:**
- Click **"Column Presets"** dropdown
- Select preset
- Columns instantly reconfigure

### Exporting Current View

Export exactly what you see, as you see it.

**Best practice workflow:**
1. Configure table perfectly:
   - Show only needed columns
   - Apply filters
   - Sort as desired
   - Select specific rows (if needed)
2. Click **"Export Current View"**
3. Choose format
4. Export matches your screen exactly

> **💡 Pro tip**: Save your view first, then export. You can recreate the same export anytime by loading the view.

### Comparing Rows

Select two or more rows to compare side-by-side.

**To compare:**
1. Select 2-10 rows (checkbox or Ctrl+Click)
2. Click **"Compare Selected"** button
3. Comparison view opens showing rows side-by-side
4. Differences are highlighted

**Comparison view features:**
- Side-by-side layout
- Highlights differences
- Hides identical columns
- Export comparison

**Use cases:**
- Compare competing opportunities
- Find duplicate records
- Analyze similar contacts
- Before/after comparison

**[Screenshot: Row comparison view]**

---

## Related Topics

- [Creating Reports](Creating_Reports.md) - Build reports with tables
- [Advanced Filtering](Advanced_Filtering.md) - Complex table filtering
- [Exporting Reports](Exporting_Reports.md) - Export table data
- [Tips and Best Practices](Tips_and_Best_Practices.md) - Optimization tips
- [Reports FAQ](Reports_FAQ.md) - Common table questions

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [Exporting Reports](Exporting_Reports.md) to share your data in multiple formats.*
