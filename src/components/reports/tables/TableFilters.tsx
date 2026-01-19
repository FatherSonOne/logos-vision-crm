import React, { useState, useMemo } from 'react';
import { Table, Column, ColumnFiltersState } from '@tanstack/react-table';

// ============================================
// ICONS
// ============================================

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface TableFiltersProps<TData> {
  table: Table<TData>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
  onClearFilters: () => void;
}

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'before' | 'after' | 'last7days' | 'thisMonth';

interface FilterTemplate {
  id: string;
  name: string;
  filters: ColumnFiltersState;
}

// ============================================
// FILTER OPERATORS
// ============================================

const TEXT_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
];

const NUMBER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: '=' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'between', label: 'Between' },
];

const DATE_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'thisMonth', label: 'This month' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getColumnType(column: Column<any, unknown>): 'text' | 'number' | 'date' {
  const firstValue = column.getFacetedRowModel().flatRows[0]?.getValue(column.id);

  if (typeof firstValue === 'number') return 'number';
  if (firstValue instanceof Date) return 'date';
  if (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue))) return 'date';

  return 'text';
}

function getOperatorsForType(type: 'text' | 'number' | 'date') {
  switch (type) {
    case 'number':
      return NUMBER_OPERATORS;
    case 'date':
      return DATE_OPERATORS;
    default:
      return TEXT_OPERATORS;
  }
}

// ============================================
// FILTER INPUT COMPONENT
// ============================================

interface FilterInputProps {
  columnId: string;
  columnType: 'text' | 'number' | 'date';
  operator: FilterOperator;
  value: any;
  onChange: (value: any) => void;
}

function FilterInput({ columnId, columnType, operator, value, onChange }: FilterInputProps) {
  if (operator === 'last7days' || operator === 'thisMonth') {
    return (
      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
        Auto-calculated
      </div>
    );
  }

  if (operator === 'between') {
    const [min, max] = Array.isArray(value) ? value : ['', ''];
    return (
      <div className="flex items-center gap-2">
        <input
          type={columnType === 'date' ? 'date' : columnType === 'number' ? 'number' : 'text'}
          value={min}
          onChange={(e) => onChange([e.target.value, max])}
          placeholder="Min"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
        />
        <span className="text-gray-500 dark:text-gray-400">to</span>
        <input
          type={columnType === 'date' ? 'date' : columnType === 'number' ? 'number' : 'text'}
          value={max}
          onChange={(e) => onChange([min, e.target.value])}
          placeholder="Max"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
        />
      </div>
    );
  }

  return (
    <input
      type={columnType === 'date' ? 'date' : columnType === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Filter ${columnId}...`}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TableFilters<TData>({
  table,
  columnFilters,
  onColumnFiltersChange,
  onClearFilters,
}: TableFiltersProps<TData>) {
  const [filterTemplates, setFilterTemplates] = useState<FilterTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const filterableColumns = useMemo(
    () => table.getAllColumns().filter(col => col.getCanFilter() && col.id !== 'select'),
    [table]
  );

  const activeFilters = useMemo(
    () => columnFilters.map(f => ({
      columnId: f.id,
      operator: (f.value as any)?.operator || 'contains',
      value: (f.value as any)?.value !== undefined ? (f.value as any).value : f.value,
    })),
    [columnFilters]
  );

  const handleAddFilter = () => {
    const availableColumn = filterableColumns.find(
      col => !columnFilters.some(f => f.id === col.id)
    );

    if (availableColumn) {
      const newFilter = {
        id: availableColumn.id,
        value: { operator: 'contains', value: '' },
      };
      onColumnFiltersChange([...columnFilters, newFilter]);
    }
  };

  const handleRemoveFilter = (columnId: string) => {
    onColumnFiltersChange(columnFilters.filter(f => f.id !== columnId));
  };

  const handleOperatorChange = (columnId: string, operator: FilterOperator) => {
    onColumnFiltersChange(
      columnFilters.map(f =>
        f.id === columnId
          ? { ...f, value: { operator, value: '' } }
          : f
      )
    );
  };

  const handleValueChange = (columnId: string, value: any) => {
    onColumnFiltersChange(
      columnFilters.map(f =>
        f.id === columnId
          ? { ...f, value: { operator: (f.value as any)?.operator || 'contains', value } }
          : f
      )
    );
  };

  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      const newTemplate: FilterTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        filters: columnFilters,
      };
      setFilterTemplates([...filterTemplates, newTemplate]);
      setTemplateName('');
      setShowSaveTemplate(false);
    }
  };

  const handleLoadTemplate = (template: FilterTemplate) => {
    onColumnFiltersChange(template.filters);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setFilterTemplates(filterTemplates.filter(t => t.id !== templateId));
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Column Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700 flex items-center gap-2"
            aria-label="Save filter template"
          >
            <SaveIcon />
            Save Template
          </button>
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Save Template Form */}
      {showSaveTemplate && (
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveTemplate();
              }
            }}
          />
          <button
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowSaveTemplate(false);
              setTemplateName('');
            }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cancel"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Saved Templates */}
      {filterTemplates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Saved Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {filterTemplates.map(template => (
              <div
                key={template.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <button
                  onClick={() => handleLoadTemplate(template)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {template.name}
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-0.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  aria-label={`Delete template ${template.name}`}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      <div className="space-y-3">
        {activeFilters.map(({ columnId, operator, value }) => {
          const column = table.getColumn(columnId);
          if (!column) return null;

          const columnType = getColumnType(column);
          const operators = getOperatorsForType(columnType);

          return (
            <div
              key={columnId}
              className="grid grid-cols-12 gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Column Name */}
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Column
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white">
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : columnId}
                </div>
              </div>

              {/* Operator */}
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operator
                </label>
                <select
                  value={operator}
                  onChange={(e) => handleOperatorChange(columnId, e.target.value as FilterOperator)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value */}
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <FilterInput
                  columnId={columnId}
                  columnType={columnType}
                  operator={operator}
                  value={value}
                  onChange={(newValue) => handleValueChange(columnId, newValue)}
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1 flex items-end">
                <button
                  onClick={() => handleRemoveFilter(columnId)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  aria-label={`Remove filter for ${columnId}`}
                >
                  <XIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Filter Button */}
      {activeFilters.length < filterableColumns.length && (
        <button
          onClick={handleAddFilter}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-2"
        >
          <PlusIcon />
          Add Filter
        </button>
      )}

      {/* Active Filter Summary */}
      {activeFilters.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
          </p>
        </div>
      )}
    </div>
  );
}
