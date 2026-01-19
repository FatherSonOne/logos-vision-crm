# TanStack Table - Quick Reference

## Installation

```bash
npm install @tanstack/react-table @tanstack/react-virtual
```

## Basic Usage

### Import

```tsx
import { AdvancedDataTable } from '@/components/reports/tables';
import { ColumnDef } from '@tanstack/react-table';
```

### Define Columns

```tsx
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
    cell: info => `$${info.getValue<number>().toLocaleString()}`,
    enableSorting: true,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: info => new Date(info.getValue<string>()).toLocaleDateString(),
  },
];
```

### Render Table

```tsx
<AdvancedDataTable
  data={myData}
  columns={columns}
  enableRowSelection={true}
  enableMultiSort={true}
  enableColumnFilters={true}
  enableGlobalFilter={true}
  enablePagination={true}
  pageSize={10}
/>
```

## Column Definition Properties

| Property | Type | Description |
|----------|------|-------------|
| `accessorKey` | string | Key to access data in row object |
| `header` | string \| function | Column header text or render function |
| `cell` | function | Custom cell renderer |
| `enableSorting` | boolean | Enable sorting for this column |
| `enableColumnFilter` | boolean | Enable filtering for this column |
| `size` | number | Column width in pixels |
| `id` | string | Unique column identifier |

## Cell Rendering

### Simple Value

```tsx
{
  accessorKey: 'name',
  cell: info => info.getValue()
}
```

### Formatted Value

```tsx
{
  accessorKey: 'amount',
  cell: info => {
    const value = info.getValue<number>();
    return `$${value.toLocaleString()}`;
  }
}
```

### Custom Component

```tsx
{
  accessorKey: 'status',
  cell: ({ getValue }) => {
    const status = getValue<string>();
    return (
      <span className={`badge ${status === 'active' ? 'bg-green' : 'bg-gray'}`}>
        {status}
      </span>
    );
  }
}
```

### Multiple Values

```tsx
{
  id: 'fullName',
  cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
}
```

## Table Props

### AdvancedDataTable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | T[] | required | Array of data objects |
| `columns` | ColumnDef<T>[] | required | Column definitions |
| `enableRowSelection` | boolean | true | Enable row checkboxes |
| `enableMultiSort` | boolean | true | Enable multi-column sorting |
| `enableColumnFilters` | boolean | true | Enable column filtering |
| `enableGlobalFilter` | boolean | true | Enable global search |
| `enablePagination` | boolean | true | Enable pagination |
| `pageSize` | number | 10 | Rows per page |
| `onRowClick` | function | - | Row click handler |
| `onExport` | function | - | Export handler |
| `onBulkAction` | function | - | Bulk action handler |
| `isLoading` | boolean | false | Show loading state |
| `emptyMessage` | string | - | Empty state message |

### VirtualizedTable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | T[] | required | Array of data objects |
| `columns` | ColumnDef<T>[] | required | Column definitions |
| `height` | number | 600 | Table height in pixels |
| `estimatedRowHeight` | number | 52 | Estimated row height |
| `overscan` | number | 5 | Extra rows to render |
| `onRowClick` | function | - | Row click handler |
| `onExport` | function | - | Export handler |

## Event Handlers

### Row Click

```tsx
const handleRowClick = (row: DataRow) => {
  console.log('Clicked:', row);
  navigate(`/details/${row.id}`);
};

<AdvancedDataTable
  data={data}
  columns={columns}
  onRowClick={handleRowClick}
/>
```

### Export

```tsx
const handleExport = (selectedRows: DataRow[]) => {
  const csvData = convertToCSV(selectedRows);
  downloadFile(csvData, 'export.csv');
};

<AdvancedDataTable
  data={data}
  columns={columns}
  onExport={handleExport}
/>
```

### Bulk Actions

```tsx
const handleBulkAction = (action: string, rows: DataRow[]) => {
  switch (action) {
    case 'delete':
      deleteRows(rows);
      break;
    case 'export':
      exportRows(rows);
      break;
  }
};

<AdvancedDataTable
  data={data}
  columns={columns}
  onBulkAction={handleBulkAction}
/>
```

## Styling

### Custom Cell Classes

```tsx
{
  accessorKey: 'amount',
  cell: ({ getValue }) => (
    <span className="font-bold text-green-600">
      ${getValue<number>().toLocaleString()}
    </span>
  )
}
```

### Conditional Styling

```tsx
{
  accessorKey: 'status',
  cell: ({ getValue }) => {
    const status = getValue<string>();
    const colorClass = status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';

    return (
      <span className={`px-2 py-1 rounded ${colorClass}`}>
        {status}
      </span>
    );
  }
}
```

## Performance Optimization

### Memoize Columns

```tsx
const columns = useMemo<ColumnDef<DataRow>[]>(
  () => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'amount', header: 'Amount' },
  ],
  []
);
```

### Memoize Data

```tsx
const data = useMemo(() => fetchedData, [fetchedData]);
```

### Use Virtualization for Large Datasets

```tsx
// Use AdvancedDataTable for < 1,000 rows
// Use VirtualizedTable for > 1,000 rows

{data.length > 1000 ? (
  <VirtualizedTable data={data} columns={columns} />
) : (
  <AdvancedDataTable data={data} columns={columns} />
)}
```

## Common Patterns

### Currency Column

```tsx
{
  accessorKey: 'amount',
  header: 'Amount',
  cell: info => {
    const value = info.getValue<number>();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  },
  enableSorting: true,
}
```

### Date Column

```tsx
{
  accessorKey: 'date',
  header: 'Date',
  cell: info => {
    const date = new Date(info.getValue<string>());
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  enableSorting: true,
}
```

### Status Badge

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ getValue }) => {
    const status = getValue<string>();
    const config = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded ${config[status]}`}>
        {status}
      </span>
    );
  }
}
```

### Link Column

```tsx
{
  accessorKey: 'id',
  header: 'ID',
  cell: ({ row }) => (
    <Link
      to={`/details/${row.original.id}`}
      className="text-indigo-600 hover:underline"
    >
      {row.original.id}
    </Link>
  )
}
```

### Action Buttons

```tsx
{
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleEdit(row.original)}
        className="text-indigo-600 hover:text-indigo-900"
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(row.original)}
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>
    </div>
  )
}
```

## Filter Operators

### Text Filters

```tsx
const filterByText = {
  contains: (row, id, filterValue) =>
    row.getValue(id).toLowerCase().includes(filterValue.toLowerCase()),
  equals: (row, id, filterValue) =>
    row.getValue(id) === filterValue,
  startsWith: (row, id, filterValue) =>
    row.getValue(id).startsWith(filterValue),
  endsWith: (row, id, filterValue) =>
    row.getValue(id).endsWith(filterValue),
};
```

### Number Filters

```tsx
const filterByNumber = {
  equals: (row, id, filterValue) =>
    row.getValue(id) === filterValue,
  greaterThan: (row, id, filterValue) =>
    row.getValue(id) > filterValue,
  lessThan: (row, id, filterValue) =>
    row.getValue(id) < filterValue,
  between: (row, id, filterValue) => {
    const value = row.getValue(id);
    return value >= filterValue[0] && value <= filterValue[1];
  },
};
```

## Accessibility

### Keyboard Navigation

```tsx
// Built-in keyboard support:
// - Tab: Navigate through controls
// - Enter/Space: Activate buttons
// - Escape: Close dropdowns
// - Arrow keys: Navigate lists
```

### ARIA Labels

```tsx
{
  accessorKey: 'name',
  header: 'Name',
  cell: info => (
    <span aria-label={`Name: ${info.getValue()}`}>
      {info.getValue()}
    </span>
  )
}
```

### Focus Management

```tsx
// Focus automatically managed by table
// Custom focus handling:
const ref = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (shouldFocus) {
    ref.current?.focus();
  }
}, [shouldFocus]);
```

## Troubleshooting

### Table Not Rendering

**Check:**
- Data is an array
- Columns are defined correctly
- No TypeScript errors

### Sorting Not Working

**Check:**
- `enableSorting: true` in column
- `enableMultiSort: true` in table props
- Data types are consistent

### Filters Not Working

**Check:**
- `enableColumnFilter: true` in column
- `enableColumnFilters: true` in table props
- Filter panel is visible

### Performance Issues

**Solutions:**
- Use VirtualizedTable for > 1,000 rows
- Memoize columns and data
- Simplify cell renderers
- Reduce number of columns

## Examples

### Complete Example

```tsx
import React, { useMemo } from 'react';
import { AdvancedDataTable } from '@/components/reports/tables';
import { ColumnDef } from '@tanstack/react-table';

interface Donation {
  id: string;
  donor: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export function DonationTable({ donations }: { donations: Donation[] }) {
  const columns = useMemo<ColumnDef<Donation>[]>(
    () => [
      {
        accessorKey: 'donor',
        header: 'Donor Name',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: info => `$${info.getValue<number>().toLocaleString()}`,
        enableSorting: true,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: info => new Date(info.getValue<string>()).toLocaleDateString(),
        enableSorting: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <span className={`px-2 py-1 rounded ${
              status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  const handleExport = (rows: Donation[]) => {
    console.log('Exporting:', rows);
  };

  const handleRowClick = (row: Donation) => {
    console.log('Viewing:', row);
  };

  return (
    <AdvancedDataTable
      data={donations}
      columns={columns}
      enableRowSelection={true}
      enableMultiSort={true}
      enableColumnFilters={true}
      enableGlobalFilter={true}
      enablePagination={true}
      pageSize={25}
      onRowClick={handleRowClick}
      onExport={handleExport}
      emptyMessage="No donations found"
    />
  );
}
```

## Resources

- [TanStack Table Docs](https://tanstack.com/table)
- [TanStack Virtual Docs](https://tanstack.com/virtual)
- Component README: `src/components/reports/tables/README.md`
- Feature Guide: `docs/ADVANCED_TABLE_FEATURES.md`
- Demo: `src/components/reports/tables/TableDemo.tsx`

---

**Last Updated:** January 17, 2026
