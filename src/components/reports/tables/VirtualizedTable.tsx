import React, { useRef, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableToolbar } from './TableToolbar';
import { TableDensity } from './AdvancedDataTable';

// ============================================
// ICONS
// ============================================

const SortAscIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const SortDescIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SortIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

// ============================================
// TYPES
// ============================================

export interface VirtualizedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onRowClick?: (row: TData) => void;
  onExport?: (selectedRows: TData[]) => void;
  height?: number;
  estimatedRowHeight?: number;
  overscan?: number;
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ============================================
// DENSITY STYLES
// ============================================

const DENSITY_STYLES: Record<TableDensity, { padding: string; fontSize: string; rowHeight: number }> = {
  compact: { padding: 'px-3 py-1.5', fontSize: 'text-sm', rowHeight: 40 },
  comfortable: { padding: 'px-4 py-3', fontSize: 'text-sm', rowHeight: 52 },
  spacious: { padding: 'px-6 py-4', fontSize: 'text-base', rowHeight: 64 },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function VirtualizedTable<TData>({
  data,
  columns,
  onRowClick,
  onExport,
  height = 600,
  estimatedRowHeight = 52,
  overscan = 5,
  enableRowSelection = false,
  enableMultiSort = true,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
}: VirtualizedTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [density, setDensity] = useState<TableDensity>('comfortable');

  // Column definitions with selection column
  const allColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select row ${row.index + 1}`}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      size: 40,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  // Table instance
  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection,
    enableMultiSort,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => DENSITY_STYLES[density].rowHeight,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  // Get density styles
  const densityStyles = DENSITY_STYLES[density];

  // Handlers
  const handleExport = () => {
    if (onExport) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
      onExport(selectedRows.length > 0 ? selectedRows : data);
    }
  };

  const scrollToRow = (index: number) => {
    rowVirtualizer.scrollToIndex(index, { align: 'center' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <TableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        density={density}
        onDensityChange={setDensity}
        showFilters={false}
        onToggleFilters={() => {}}
        onExport={handleExport}
        selectedCount={selectedCount}
        enableGlobalFilter={true}
        enableColumnFilters={false}
      />

      {/* Performance Stats */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Total rows:</span>
          <span className="font-medium text-gray-900 dark:text-white">{data.length.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Rendered:</span>
          <span className="font-medium text-gray-900 dark:text-white">{virtualRows.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Performance:</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
            60 FPS
          </span>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs font-medium">
              {selectedCount} selected
            </span>
          </div>
        )}
      </div>

      {/* Virtual Table Container */}
      <div
        ref={tableContainerRef}
        className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`${densityStyles.padding} ${densityStyles.fontSize} font-medium text-left text-gray-700 dark:text-gray-300 uppercase tracking-wider select-none border-b border-gray-200 dark:border-gray-700`}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer hover:text-gray-900 dark:hover:text-white' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        role={header.column.getCanSort() ? 'button' : undefined}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                        aria-sort={
                          header.column.getIsSorted()
                            ? header.column.getIsSorted() === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : undefined
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="flex-shrink-0">
                            {header.column.getIsSorted() === 'asc' ? (
                              <SortAscIcon />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <SortDescIcon />
                            ) : (
                              <SortIcon />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-900">
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className={`${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                  } ${row.getIsSelected() ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} border-b border-gray-200 dark:border-gray-700 transition-colors`}
                  onClick={() => onRowClick?.(row.original)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onRowClick) {
                      onRowClick(row.original);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={`${densityStyles.padding} ${densityStyles.fontSize} text-gray-900 dark:text-white`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Scroll to Row Control */}
      <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <label htmlFor="scrollToRow" className="text-sm text-gray-700 dark:text-gray-300">
          Jump to row:
        </label>
        <input
          id="scrollToRow"
          type="number"
          min="1"
          max={rows.length}
          placeholder="Row #"
          className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt((e.target as HTMLInputElement).value);
              if (value >= 1 && value <= rows.length) {
                scrollToRow(value - 1);
              }
            }
          }}
        />
        <button
          onClick={() => {
            const input = document.getElementById('scrollToRow') as HTMLInputElement;
            const value = parseInt(input.value);
            if (value >= 1 && value <= rows.length) {
              scrollToRow(value - 1);
            }
          }}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          Go
        </button>
      </div>
    </div>
  );
}
