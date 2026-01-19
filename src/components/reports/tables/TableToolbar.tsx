import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import { TableDensity } from './AdvancedDataTable';

// ============================================
// ICONS
// ============================================

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ColumnsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const DensityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface TableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onExport?: () => void;
  onBulkAction?: (action: string) => void;
  selectedCount: number;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  density,
  onDensityChange,
  showFilters,
  onToggleFilters,
  onExport,
  onBulkAction,
  selectedCount,
  enableGlobalFilter = true,
  enableColumnFilters = true,
}: TableToolbarProps<TData>) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showDensityMenu, setShowDensityMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const allColumns = table.getAllColumns().filter(column => column.id !== 'select');

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Left side - Search and Filters */}
      <div className="flex items-center gap-2 flex-1">
        {/* Global Search */}
        {enableGlobalFilter && (
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              placeholder="Search all columns..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Search table"
            />
          </div>
        )}

        {/* Filter Toggle */}
        {enableColumnFilters && (
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label="Toggle filters"
            aria-pressed={showFilters}
          >
            <FilterIcon />
            <span className="text-sm font-medium">Filters</span>
          </button>
        )}

        {/* Selected count indicator */}
        {selectedCount > 0 && (
          <div className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium">
            {selectedCount} selected
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Bulk Actions */}
        {selectedCount > 0 && onBulkAction && (
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
              aria-label="Bulk actions"
              aria-expanded={showBulkMenu}
            >
              Actions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showBulkMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                role="menu"
              >
                <button
                  onClick={() => {
                    onBulkAction('delete');
                    setShowBulkMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg"
                  role="menuitem"
                >
                  Delete selected
                </button>
                <button
                  onClick={() => {
                    onBulkAction('export');
                    setShowBulkMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
                  role="menuitem"
                >
                  Export selected
                </button>
              </div>
            )}
          </div>
        )}

        {/* Column Visibility */}
        <div className="relative">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Column visibility"
            aria-expanded={showColumnMenu}
            title="Column visibility"
          >
            <ColumnsIcon />
          </button>
          {showColumnMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 max-h-96 overflow-y-auto"
              role="menu"
            >
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Toggle columns</p>
              </div>
              <div className="p-2 space-y-1">
                {allColumns.map(column => (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Density */}
        <div className="relative">
          <button
            onClick={() => setShowDensityMenu(!showDensityMenu)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Table density"
            aria-expanded={showDensityMenu}
            title="Table density"
          >
            <DensityIcon />
          </button>
          {showDensityMenu && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              role="menu"
            >
              {(['compact', 'comfortable', 'spacious'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => {
                    onDensityChange(d);
                    setShowDensityMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between"
                  role="menuitem"
                >
                  <span className="capitalize">{d}</span>
                  {density === d && <CheckIcon />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        {onExport && (
          <button
            onClick={onExport}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="Export data"
            title="Export data"
          >
            <DownloadIcon />
          </button>
        )}
      </div>
    </div>
  );
}
