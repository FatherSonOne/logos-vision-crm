import React, { useState, useMemo } from 'react';
import { Code2, AlertCircle, CheckCircle, Lightbulb, Download, Upload } from 'lucide-react';
import { FilterGroup } from './filters/FilterGroup';
import { FilterTemplates } from './filters/FilterTemplates';
import type { FilterGroup as FilterGroupType, FilterTemplate, FilterField } from './filterTypes';
import { DONOR_FIELDS, PROJECT_FIELDS, DONATION_FIELDS, TASK_FIELDS } from './filterTypes';
import { validateFilter, checkForConflicts, getErrorSummary } from '../../utils/filterValidation';
import { generateSqlWhere, generateFilterDescription } from '../../utils/filterSqlGenerator';

export type ReportType = 'donors' | 'projects' | 'donations' | 'tasks' | 'custom';

interface AdvancedFilterBuilderProps {
  reportType: ReportType;
  initialFilter?: FilterGroupType;
  customFields?: FilterField[];
  onChange?: (filter: FilterGroupType) => void;
  onApply?: (filter: FilterGroupType) => void;
}

export function AdvancedFilterBuilder({
  reportType,
  initialFilter,
  customFields = [],
  onChange,
  onApply,
}: AdvancedFilterBuilderProps) {
  const [filter, setFilter] = useState<FilterGroupType>(
    initialFilter || {
      id: 'root',
      logic: 'AND',
      conditions: [],
      groups: [],
    }
  );

  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [templates, setTemplates] = useState<FilterTemplate[]>([]);

  // Get available fields based on report type
  const availableFields = useMemo(() => {
    let baseFields: FilterField[] = [];

    switch (reportType) {
      case 'donors':
        baseFields = DONOR_FIELDS;
        break;
      case 'projects':
        baseFields = PROJECT_FIELDS;
        break;
      case 'donations':
        baseFields = DONATION_FIELDS;
        break;
      case 'tasks':
        baseFields = TASK_FIELDS;
        break;
      case 'custom':
        baseFields = customFields;
        break;
    }

    return baseFields;
  }, [reportType, customFields]);

  // Validate the current filter
  const validationErrors = useMemo(() => {
    return validateFilter(filter, availableFields);
  }, [filter, availableFields]);

  const conflicts = useMemo(() => {
    return checkForConflicts(filter);
  }, [filter]);

  const isValid = validationErrors.length === 0;

  // Generate SQL preview
  const sqlPreview = useMemo(() => {
    try {
      const { sql, params } = generateSqlWhere(filter, availableFields);
      return { sql, params, error: null };
    } catch (error) {
      return { sql: '', params: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [filter, availableFields]);

  // Generate human-readable description
  const filterDescription = useMemo(() => {
    return generateFilterDescription(filter, availableFields);
  }, [filter, availableFields]);

  const handleFilterChange = (newFilter: FilterGroupType) => {
    setFilter(newFilter);
    onChange?.(newFilter);
  };

  const handleApplyTemplate = (template: FilterTemplate) => {
    setFilter(template.filter);
    onChange?.(template.filter);
  };

  const handleSaveTemplate = (name: string, description: string, category: 'common' | 'custom' | 'shared') => {
    const newTemplate: FilterTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      category,
      filter: JSON.parse(JSON.stringify(filter)), // Deep clone
      createdAt: new Date().toISOString(),
    };

    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (templateId: string, name: string, description: string) => {
    setTemplates(templates.map(t =>
      t.id === templateId ? { ...t, name, description } : t
    ));
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleExportFilter = () => {
    const exportData = {
      version: '1.0',
      reportType,
      filter,
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filter-${reportType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.filter) {
          setFilter(importData.filter);
          onChange?.(importData.filter);
        }
      } catch (error) {
        console.error('Failed to import filter:', error);
        alert('Failed to import filter. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (isValid) {
      onApply?.(filter);
    }
  };

  const isEmpty = filter.conditions.length === 0 && filter.groups.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Filter Builder</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create complex filters with nested AND/OR logic
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Import/Export */}
            <label className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportFilter}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExportFilter}
              disabled={isEmpty}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {/* SQL Preview Toggle */}
            <button
              onClick={() => setShowSqlPreview(!showSqlPreview)}
              className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                showSqlPreview
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Code2 className="w-4 h-4" />
              SQL Preview
            </button>
          </div>
        </div>

        {/* Validation Status */}
        {!isEmpty && (
          <div className="space-y-2">
            {isValid ? (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-900">Filter is valid</div>
                  {filterDescription && (
                    <div className="text-sm text-green-700 mt-1">{filterDescription}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-900">
                    {getErrorSummary(validationErrors)}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {validationErrors.slice(0, 3).map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        • {error.message}
                      </li>
                    ))}
                    {validationErrors.length > 3 && (
                      <li className="text-sm text-red-700">
                        • And {validationErrors.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-900">Potential conflicts detected</div>
                  <ul className="mt-2 space-y-1">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx} className="text-sm text-yellow-700">
                        • {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SQL Preview */}
        {showSqlPreview && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg overflow-x-auto">
            {sqlPreview.error ? (
              <div className="text-red-400 text-sm">{sqlPreview.error}</div>
            ) : (
              <>
                <div className="text-gray-400 text-xs mb-2">Generated SQL WHERE clause:</div>
                <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {sqlPreview.sql || 'No conditions'}
                </code>
                {sqlPreview.params.length > 0 && (
                  <>
                    <div className="text-gray-400 text-xs mt-4 mb-2">Parameters:</div>
                    <code className="text-blue-400 text-sm font-mono">
                      {JSON.stringify(sqlPreview.params, null, 2)}
                    </code>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter Builder (Left - 2 columns) */}
        <div className="lg:col-span-2">
          <FilterGroup
            group={filter}
            availableFields={availableFields}
            onChange={handleFilterChange}
            depth={0}
            maxDepth={3}
          />

          {/* Apply Button */}
          {onApply && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleApply}
                disabled={!isValid || isEmpty}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Filter
              </button>
            </div>
          )}
        </div>

        {/* Templates (Right - 1 column) */}
        <div className="lg:col-span-1">
          <FilterTemplates
            templates={templates}
            onApply={handleApplyTemplate}
            onSave={handleSaveTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            currentFilter={!isEmpty ? filter : undefined}
          />
        </div>
      </div>
    </div>
  );
}
