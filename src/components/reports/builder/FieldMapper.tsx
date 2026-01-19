import React, { useState } from 'react';
import { DraggableField, FieldMetadata, FieldDataType, AggregationType } from './DraggableField';

// ============================================
// ICONS
// ============================================

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface FieldMapperProps {
  fields: FieldMetadata[];
  onFieldUpdate?: (field: FieldMetadata) => void;
  showAggregation?: boolean;
  showFormatting?: boolean;
  compact?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const FieldMapper: React.FC<FieldMapperProps> = ({
  fields,
  onFieldUpdate,
  showAggregation = true,
  showFormatting = true,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FieldDataType | 'all'>('all');
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

  const filteredFields = fields.filter((field) => {
    const matchesSearch = field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || field.dataType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAggregationChange = (fieldId: string, aggregation: AggregationType) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && onFieldUpdate) {
      onFieldUpdate({ ...field, aggregation });
    }
  };

  const handleFormatChange = (fieldId: string, format: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && onFieldUpdate) {
      onFieldUpdate({ ...field, format });
    }
  };

  const typeCount = (type: FieldDataType) => fields.filter(f => f.dataType === type).length;

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <SearchIcon />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <FilterIcon />
            <span>Type:</span>
          </div>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            All ({fields.length})
          </button>
          <button
            onClick={() => setSelectedType('text')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'text'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Text ({typeCount('text')})
          </button>
          <button
            onClick={() => setSelectedType('number')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'number'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Number ({typeCount('number')})
          </button>
          <button
            onClick={() => setSelectedType('date')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'date'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Date ({typeCount('date')})
          </button>
          <button
            onClick={() => setSelectedType('boolean')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'boolean'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Boolean ({typeCount('boolean')})
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredFields.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No fields found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <DraggableField field={field} compact={compact} />

              {/* Expanded Options */}
              {expandedFieldId === field.id && (showAggregation || showFormatting) && (
                <div className="ml-8 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  {showAggregation && field.isNumeric && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Aggregation
                      </label>
                      <select
                        value={field.aggregation || 'none'}
                        onChange={(e) => handleAggregationChange(field.id, e.target.value as AggregationType)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="none">None</option>
                        <option value="sum">Sum</option>
                        <option value="avg">Average</option>
                        <option value="count">Count</option>
                        <option value="min">Minimum</option>
                        <option value="max">Maximum</option>
                      </select>
                    </div>
                  )}

                  {showFormatting && field.dataType === 'date' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date Format
                      </label>
                      <select
                        value={field.format || 'YYYY-MM-DD'}
                        onChange={(e) => handleFormatChange(field.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="YYYY-MM-DD">2024-01-15</option>
                        <option value="MM/DD/YYYY">01/15/2024</option>
                        <option value="DD/MM/YYYY">15/01/2024</option>
                        <option value="MMMM DD, YYYY">January 15, 2024</option>
                        <option value="MMM DD, YYYY">Jan 15, 2024</option>
                      </select>
                    </div>
                  )}

                  {showFormatting && field.dataType === 'number' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Number Format
                      </label>
                      <select
                        value={field.format || 'number'}
                        onChange={(e) => handleFormatChange(field.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="number">1,234.56</option>
                        <option value="currency">$1,234.56</option>
                        <option value="percent">12.34%</option>
                        <option value="compact">1.2K</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Field Count Summary */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredFields.length} of {fields.length} fields
        </p>
      </div>
    </div>
  );
};

export default FieldMapper;
